import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { fetchYouTubeVideos } from '@/lib/services/content-filler';

interface ModuleData {
  title: string;
  type: 'video' | 'infographics' | 'quiz';
  description: string;
  order_index: number;
  created_at: string;
  content?: string;
  search_query?: string;
  youtube_links?: string[];
  quiz_metadata?: {
    type: 'small' | 'major';
    question_count: number;
    context_summary: string;
  };
}

const courseSchema = z.object({
  title: z.string().describe('The title of the course'),
  description: z.string().describe('A short description of what the user will learn'),
  phases: z.array(z.object({
    title: z.string().describe('The title of the phase (e.g., Phase 1: Foundations)'),
    description: z.string().describe('A summary of what this phase covers'),
    order_index: z.number().describe('The order in which this phase should be learned (e.g., 1, 2, 3)'),
    modules: z.array(z.object({
      title: z.string().describe('The specific topic or concept for this module'),
      type: z.enum(['video', 'infographics', 'quiz']).describe('The type of module. NOTE: Small quizzes must NEVER be the last module in a phase.'),
      description: z.string().describe('Briefly describe what this module covers'),
      infographic_markdown: z.string().optional().describe('Detailed content in markdown. REQUIRED for both infographics AND video modules based on their topic to provide text overview/explanation.'),
      search_query: z.string().optional().describe('The best youtube search query for this topic if type is video'),
      quiz_metadata: z.object({
        type: z.enum(['small', 'major']),
        question_count: z.number(),
        context_summary: z.string().describe('A summary of topics covered for quiz generation')
      }).optional()
    }))
  }))
});

export const maxDuration = 60; // Allow more time for AI generation

export async function POST(req: Request) {
  try {
    const { topic, level, language, userId } = await req.json();

    if (!topic || !level || !language || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = `Create a comprehensive, structured learning path for the topic: "${topic}" at a "${level}" level in "${language}" language. 
Break this down into several sequential phases. 

Structure requirements:
1. Each phase must have a mix of 'video' and 'infographics' modules.
2. Infographics modules should fill gaps with detailed markdown content (including tables and lists).
3. 'video' modules MUST also include a comprehensive 'infographic_markdown' that explains the core concepts and provides an overview of the topic.
4. Every phase MUST end with exactly ONE 'major' quiz module (25-30 questions schema). This must be the final module in the phase array.
5. Phases can have 'small' quizzes (10 questions schema). CRITICAL: Small quizzes MUST be placed in between content modules (e.g., after module 1 or 2). A small quiz CANNOT be the last module in a phase.
6. For 'video' modules, provide a search_query for YouTube.
6. For 'infographics' modules, provide comprehensive infographic_markdown.
7. For 'quiz' modules, specify the type and context_summary (do not generate questions now).

The goal is to eliminate tutorial hell and provide clear learning objectives.`;

    const { object: courseData } = await generateObject({
      model: google('gemini-2.5-flash'), // Using 2.5-flash to fix version error
      schema: courseSchema,
      prompt,
    });

    const batch = adminDb.batch();

    const courseRef = adminDb.collection(FIREBASE_COLLECTIONS.COURSES).doc();
    
    // Generate placeholder images based on topic
    const bgImage = `https://loremflickr.com/1200/800/${encodeURIComponent(topic)}?sig=${Date.now()}`;
    const brandIcon = `https://img.icons8.com/color/144/null/${encodeURIComponent(topic).split(' ')[0].toLowerCase()}.png`;

    batch.set(courseRef, {
      title: courseData.title,
      description: courseData.description,
      original_prompt: topic,
      level,
      language,
      user_id: userId,
      bgImage,
      brandIcon,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    for (const phase of courseData.phases) {
      const phaseRef = courseRef.collection(FIREBASE_COLLECTIONS.PHASES).doc();
      batch.set(phaseRef, {
        title: phase.title,
        description: phase.description,
        order_index: phase.order_index,
        is_unlocked: phase.order_index === 1,
        created_at: new Date().toISOString(),
      });

      for (const [index, module] of phase.modules.entries()) {
        const moduleRef = phaseRef.collection(FIREBASE_COLLECTIONS.MODULES).doc();
        
        const moduleData: ModuleData = {
          title: module.title,
          type: module.type,
          description: module.description,
          order_index: index + 1,
          created_at: new Date().toISOString(),
        };

        if (module.type === 'infographics') {
          moduleData.content = module.infographic_markdown;
        } else if (module.type === 'video') {
          moduleData.content = module.infographic_markdown; // Apply markdown description to video modules as well
          moduleData.search_query = module.search_query || module.title;
          
          // Attempt to fetch YouTube videos for each video module
          try {
            const videos = await fetchYouTubeVideos(moduleData.search_query);
            moduleData.youtube_links = videos.map((v: { id: string }) => v.id);
          } catch (error) {
            console.warn(`Failed to fetch videos for ${module.title}:`, error);
            moduleData.youtube_links = [];
          }
        } else if (module.type === 'quiz') {
          moduleData.quiz_metadata = module.quiz_metadata;
        }

        batch.set(moduleRef, moduleData);
      }
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      courseId: courseRef.id,
      message: 'Course generated successfully' 
    });

  } catch (error: unknown) {
    console.error('Course generation error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate course' }, { status: 500 });
  }
}

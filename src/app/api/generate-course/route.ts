import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { fetchYouTubeVideos } from '@/lib/services/content-filler';

interface FlashcardData {
  front: string;
  back: string;
}

interface SlideData {
  title: string;
  body: string;
}

interface ModuleData {
  title: string;
  type: 'video' | 'infographics' | 'quiz' | 'flashcard' | 'slideDeck';
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
  flashcard_data?: FlashcardData[];
  slides?: SlideData[];
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
      type: z.enum(['video', 'infographics', 'quiz', 'flashcard', 'slideDeck']).describe('The type of module. flashcard and slideDeck must appear just before the major quiz. Small quizzes must NEVER be the last module in a phase.'),
      description: z.string().describe('Briefly describe what this module covers'),
      infographic_markdown: z.string().optional().describe('Detailed content in markdown. REQUIRED for both infographics AND video modules based on their topic to provide text overview/explanation.'),
      search_query: z.string().optional().describe('The best youtube search query for this topic if type is video'),
      quiz_metadata: z.object({
        type: z.enum(['small', 'major']),
        question_count: z.number(),
        context_summary: z.string().describe('A summary of topics covered for quiz generation')
      }).optional(),
      flashcard_data: z.array(z.object({
        front: z.string().describe('The question or concept on the front of the card'),
        back: z.string().describe('The answer or explanation on the back of the card'),
      })).optional().describe('REQUIRED for flashcard modules. Generate 8-12 cards covering the key phase concepts.'),
      slides: z.array(z.object({
        title: z.string().describe('Short, punchy slide title'),
        body: z.string().describe('2-4 sentences explaining the concept clearly'),
      })).optional().describe('REQUIRED for slideDeck modules. Generate exactly 10 slides summarising the phase content.'),
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
4. Every phase MUST end with exactly ONE 'major' quiz module (25-30 questions schema). This MUST be the very last module in the phase array.
5. Phases can have 'small' quizzes (10 questions schema). CRITICAL: Small quizzes MUST be placed in between content modules. A small quiz CANNOT be the last module in a phase.
6. CRITICAL: Every phase MUST include exactly ONE 'flashcard' module AND exactly ONE 'slideDeck' module placed in this exact order just before the final major quiz: [...content modules..., flashcard, slideDeck, major_quiz].
7. For 'flashcard' modules: populate flashcard_data with 8-12 items (front = question/concept, back = answer/explanation) covering key phase concepts.
8. For 'slideDeck' modules: populate slides with exactly 10 items (title + 2-4 sentence body) summarising the phase content in logical narrative order.
9. For 'video' modules, provide a search_query for YouTube.
10. For 'infographics' modules, provide comprehensive infographic_markdown.
11. For 'quiz' modules, specify the type and context_summary (do not generate questions now).

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
        } else if (module.type === 'flashcard') {
          moduleData.flashcard_data = module.flashcard_data || [];
        } else if (module.type === 'slideDeck') {
          moduleData.slides = module.slides || [];
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

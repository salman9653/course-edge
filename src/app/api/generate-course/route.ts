import { NextResponse } from 'next/server';
import { generateObject, generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { fetchYouTubeVideos, generateBridgeNotes } from '@/lib/services/content-filler';

import { ModuleData } from '@/lib/types/course';

// Generates rich markdown content for a module when the main AI pass skips it
async function generateModuleContent(moduleTitle: string, moduleDescription: string): Promise<string> {
  const prompt = `You are an expert tutor. Write a comprehensive, well-structured study guide in Markdown for the topic: "${moduleTitle}".

Context: ${moduleDescription}

Requirements:
- Use ## for main sections and ### for subsections
- Each heading must be on its own line with a blank line before and after it
- Each paragraph must be separated by a blank line
- Use bullet lists (- item) for key concepts, each item on its own line
- Include a "Key Concepts" section, a "Details" section, and a "Summary" section
- Use **bold** for important terms
- Keep it educational, clear and engaging
- Do NOT wrap the output in a markdown code block — return raw markdown only`;

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
  });

  return text;
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
      infographic_markdown: z.string().optional().describe('Detailed markdown content. REQUIRED for infographics AND video modules. CRITICAL FORMATTING RULES: (1) Every heading MUST be on its own line preceded by a blank line, e.g. "\\n\\n## Heading\\n\\n". (2) Every bullet list item MUST be on its own line. (3) Every paragraph MUST be separated by a blank line. (4) NEVER concatenate headings, bullets, or paragraphs onto a single line. The output must be valid, well-formatted markdown that renders correctly.'),
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

CRITICAL PERFORMANCE RULE:
1. Only generate full content (infographic_markdown, flashcard_data, slides) for **Phase 1** modules.
2. For all modules in subsequent phases (Phase 2, Phase 3, etc.), STRICTLY OMIT these fields (set to undefined/null) and only provide metadata like title, description, type, and search_query.

Structure requirements:
1. Each phase must have a mix of 'video' and 'infographics' modules.
2. Infographics modules in Phase 1 should have detailed markdown content (including tables and lists).
3. 'video' modules in Phase 1 MUST also include a comprehensive 'infographic_markdown' that explains the core concepts and provides an overview of the topic.
4. Every phase MUST end with exactly ONE 'major' quiz module (25-30 questions schema). This MUST be the very last module in the phase array.
5. Phases can have 'small' quizzes (10 questions schema). CRITICAL: Small quizzes MUST be placed in between content modules. A small quiz CANNOT be the last module in a phase.
6. CRITICAL: Every phase MUST include exactly ONE 'flashcard' module AND exactly ONE 'slideDeck' module placed in this exact order just before the final major quiz: [...content modules..., flashcard, slideDeck, major_quiz].
7. For 'flashcard' modules in Phase 1: populate flashcard_data with 8-12 items.
8. For 'slideDeck' modules in Phase 1: populate slides with exactly 10 items.
9. For 'video' modules, provide a search_query for YouTube.
10. For 'infographics' modules, provide title and description.
11. For 'quiz' modules, specify the type and context_summary (do not generate questions now).

CRITICAL MARKDOWN FORMATTING RULES (apply to Phase 1 infographic_markdown fields):
- Each heading (##, ###) MUST be on its own line, separated from surrounding content by blank lines.
- Each bullet point (-) MUST be on its own line. Never concatenate multiple bullets onto one line.
- Each paragraph MUST be separated from the next by a blank line (\\n\\n).
- NEVER place a heading immediately after text without a blank line in between.
- Tables must have proper spacing: header row, separator row (---|---), and data rows each on their own line.
- Code examples must use triple backticks with a language identifier, e.g. \`\`\`javascript ... \`\`\`.

The goal is to eliminate tutorial hell and provide clear learning objectives.`;

    const { object: courseData } = await generateObject({
      model: google('gemini-2.5-flash'),
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
        is_generated: phase.order_index === 1,
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
          if (module.infographic_markdown) {
            moduleData.content = module.infographic_markdown;
          } else if (phase.order_index === 1) {
            // Fallback: only for Phase 1
            try {
              console.log(`Generating fallback content for infographic: "${module.title}"`);
              moduleData.content = await generateModuleContent(module.title, module.description);
            } catch (err) {
              console.warn(`Fallback content generation failed for infographic "${module.title}":`, err);
            }
          }
        } else if (module.type === 'video') {
          if (module.infographic_markdown) {
            moduleData.content = module.infographic_markdown;
          } else if (phase.order_index === 1) {
            // Fallback: only for Phase 1
            try {
              console.log(`Generating fallback content for video module: "${module.title}"`);
              moduleData.content = await generateBridgeNotes(module.title, [module.description]);
            } catch (err) {
              console.warn(`Fallback content generation failed for video "${module.title}":`, err);
            }
          }
          moduleData.search_query = module.search_query || module.title;
          
          // Only fetch YouTube videos for Phase 1 or just leave search_query?
          // Let's at least fetch Phase 1 videos to make it feel fast. 
          // Actually, fetching videos is fast enough, let's keep it for all to have a good preview.
          if (phase.order_index === 1) {
            try {
              const videos = await fetchYouTubeVideos(moduleData.search_query);
              moduleData.youtube_links = videos.map((v: { id: string }) => v.id);
            } catch (error) {
              console.warn(`Failed to fetch videos for ${module.title}:`, error);
              moduleData.youtube_links = [];
            }
          }
        } else if (module.type === 'quiz') {
          if (module.quiz_metadata !== undefined) {
            moduleData.quiz_metadata = module.quiz_metadata;
          }
        } else if (module.type === 'flashcard') {
          moduleData.flashcard_data = module.flashcard_data || (phase.order_index === 1 ? [] : undefined);
        } else if (module.type === 'slideDeck') {
          moduleData.slides = module.slides || (phase.order_index === 1 ? [] : undefined);
        }

        // Strip any remaining undefined values — Firestore rejects them
        const safeModuleData = Object.fromEntries(
          Object.entries(moduleData).filter(([, v]) => v !== undefined)
        ) as ModuleData;

        batch.set(moduleRef, safeModuleData);
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

import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';
import { ModuleData } from '@/lib/types/course';
import { fetchYouTubeVideos } from '@/lib/services/content-filler';

const phaseContentSchema = z.object({
  modules: z.array(z.object({
    moduleId: z.string().describe('The ID of the module to update'),
    content: z.string().optional().describe('Markdown content for infographics/video'),
    flashcard_data: z.array(z.object({
      front: z.string(),
      back: z.string(),
    })).optional(),
    slides: z.array(z.object({
      title: z.string(),
      body: z.string(),
    })).optional(),
  }))
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { courseId, phaseId } = await req.json();

    if (!courseId || !phaseId) {
      return NextResponse.json({ error: 'Missing courseId or phaseId' }, { status: 400 });
    }

    // 1. Fetch all modules for this phase
    const modulesRef = adminDb.collection(FIREBASE_COLLECTIONS.COURSES).doc(courseId)
      .collection(FIREBASE_COLLECTIONS.PHASES).doc(phaseId)
      .collection(FIREBASE_COLLECTIONS.MODULES);
    
    const snapshot = await modulesRef.orderBy('order_index').get();
    
    if (snapshot.empty) {
      return NextResponse.json({ error: 'No modules found for this phase' }, { status: 404 });
    }

    const modulesToPopulate = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title as string,
        description: data.description as string,
        type: data.type as string,
        search_query: data.search_query as string || data.title as string,
      };
    }).filter(mod => ['video', 'infographics', 'flashcard', 'slideDeck'].includes(mod.type));

    if (modulesToPopulate.length === 0) {
      return NextResponse.json({ success: true, message: 'No modules need population' });
    }

    // 2. Construct the prompt
    const modulesList = modulesToPopulate.map(m => `- [${m.type}] ${m.title}: ${m.description}`).join('\n');
    
    const prompt = `You are an expert educational content creator.
Fill in the detailed content for the following modules in a learning path.

Modules to populate:
${modulesList}

Instructions:
1. For 'infographics' AND 'video' types: Provide a comprehensive study guide in Markdown for the 'content' field.
2. For 'flashcard' modules: Provide 8-12 flashcards in 'flashcard_data'.
3. For 'slideDeck' modules: Provide exactly 10 slides in 'slides'.

CRITICAL MARKDOWN RULES (for 'content' fields):
- Each heading (##, ###) MUST be on its own line with blank lines around it.
- Each bullet point (-) MUST be on its own line.
- Each paragraph MUST be separated by a blank line (\\n\\n).
- Use triple backticks for code blocks with language identifiers.

Return the data mapped by the specific moduleId provided in the module list. 
The moduleIds are: ${modulesToPopulate.map(m => m.id).join(', ')}.`;

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: phaseContentSchema,
      prompt,
    });

    // 3. Update Firestore
    const batch = adminDb.batch();
    for (const update of object.modules) {
      const docRef = modulesRef.doc(update.moduleId);
      const modMeta = modulesToPopulate.find(m => m.id === update.moduleId);
      
      const updateData: Partial<ModuleData> = {};

      if (modMeta?.type === 'video') {
         try {
            const videos = await fetchYouTubeVideos(modMeta.search_query);
            if (videos && videos.length > 0) {
               updateData.youtube_links = videos.map((v: { id: string }) => v.id);
            }
         } catch (error) {
            console.warn(`Failed to fetch videos for ${modMeta.title}:`, error);
         }
      }
      
      if (update.content) updateData.content = update.content;
      if (update.flashcard_data) updateData.flashcard_data = update.flashcard_data;
      if (update.slides) updateData.slides = update.slides;
      
      if (Object.keys(updateData).length > 0) {
        updateData.updated_at = new Date().toISOString();
        batch.update(docRef, updateData);
      }
    }

    // Mark the phase as generated
    const phaseRef = adminDb.collection(FIREBASE_COLLECTIONS.COURSES).doc(courseId)
      .collection(FIREBASE_COLLECTIONS.PHASES).doc(phaseId);
    batch.update(phaseRef, { is_generated: true });

    await batch.commit();

    return NextResponse.json({ success: true, message: 'Phase content generated and saved' });

  } catch (error: unknown) {
    console.error('Phase content generation error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate phase content' }, { status: 500 });
  }
}

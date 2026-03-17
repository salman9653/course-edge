import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase/admin';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';

const quizSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswerIndex: z.number().min(0).max(3),
  }))
});

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { courseId, phaseId, moduleId } = await req.json();

    if (!courseId || !phaseId || !moduleId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const moduleRef = adminDb
      .collection(FIREBASE_COLLECTIONS.COURSES).doc(courseId)
      .collection(FIREBASE_COLLECTIONS.PHASES).doc(phaseId)
      .collection(FIREBASE_COLLECTIONS.MODULES).doc(moduleId);
    
    const moduleDoc = await moduleRef.get();
    if (!moduleDoc.exists) {
      return NextResponse.json({ error: 'Quiz module not found' }, { status: 404 });
    }

    const moduleData = moduleDoc.data()!;
    if (moduleData.type !== 'quiz' || !moduleData.quiz_metadata) {
      return NextResponse.json({ error: 'Module is not a valid quiz' }, { status: 400 });
    }

    const { type, question_count, context_summary } = moduleData.quiz_metadata;

    const prompt = `Based on the following topic summary for a "${type}" quiz, generate exactly ${question_count} challenging multiple-choice questions. 
Context Summary: ${context_summary}

Each question should have exactly 4 options. Return the index of the correct option (0-3).

CRITICAL MARKDOWN RULES (MANDATORY):
1. **CODE BLOCKS**: Any code MUST be enclosed in triple backticks exactly in this format: \`\`\` --- \`\`\` (where --- is the language and code).
2. **NO SINGLE BACKTICKS FOR BLOCKS**: Never use single backticks (\`) for multi-line code or functions.
3. **SPACING**: You MUST put a blank line BEFORE and AFTER every triple backtick code block.
4. **EXAMPLE**:
   Consider this component:

   \`\`\`jsx
   function Greeting() {
     return <h1>Hello</h1>;
   }
   \`\`\`

   What will happen when...?

5. **INLINE CODE**: Use single backticks only for tiny identifiers like \`props\`.

Strictly follow these formatting rules so the UI can render beautiful code blocks.`;

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: quizSchema,
      prompt,
    });

    return NextResponse.json({ 
      success: true, 
      quiz: object.questions,
      metadata: moduleData.quiz_metadata
    });

  } catch (error: unknown) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate quiz' }, { status: 500 });
  }
}

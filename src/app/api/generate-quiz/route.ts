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

// Sanitize any literal markdown fence warning text the AI might output
function sanitizeMarkdown(text: string): string {
  return text
    .replace(/A blank line before the code block is required\.?\s*/gi, '')
    .replace(/A blank line after the code block is required\.?\s*/gi, '')
    .replace(/blank line (before|after) (the )?code block/gi, '');
}

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

FORMATTING INSTRUCTIONS (read carefully):
1. All text fields (question, options) are rendered as Markdown in the UI.
2. When a question or option contains code, you MUST format it as a fenced code block using triple backticks.
3. The opening fence is three backtick characters followed immediately by the language name on the SAME line (no space), e.g.: \`\`\`jsx
4. The closing fence is three backtick characters on their own line: \`\`\`
5. The code block MUST be separated from surrounding text by a blank line (\\n\\n) on both sides.
6. The language identifier (jsx, python, javascript, etc.) is ONLY used for syntax highlighting — it is NOT shown to the user. Always include the correct language.
7. For tiny inline references like a variable name, you may use single backticks, e.g. \`props\`.
8. NEVER write literal phrases like "A blank line before the code block is required." — just use the actual blank lines in the string.
9. NEVER show the language name as plain text outside a code fence.

CORRECT EXAMPLE of a question string with code:
"Consider the following component:\\n\\n\`\`\`jsx\\nfunction Message({ isLoggedIn }) {\\n  return isLoggedIn ? <p>Welcome!</p> : null;\\n}\\n\`\`\`\\n\\nWhat does this component render when \`isLoggedIn\` is false?"

CORRECT EXAMPLE of an option string with code:
"\`\`\`jsx\\nfunction Welcome({ user = 'Guest' }) {\\n  return <p>Hello, {user}!</p>;\\n}\\n\`\`\`"

Follow these rules strictly so the UI can render beautiful, properly formatted code blocks.`;

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: quizSchema,
      prompt,
    });

    // Post-process: sanitize any remaining literal fence warning text
    const sanitizedQuestions = object.questions.map(q => ({
      ...q,
      question: sanitizeMarkdown(q.question),
      options: q.options.map(opt => sanitizeMarkdown(opt)),
    }));

    return NextResponse.json({ 
      success: true, 
      quiz: sanitizedQuestions,
      metadata: moduleData.quiz_metadata
    });

  } catch (error: unknown) {
    console.error('Quiz generation error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate quiz' }, { status: 500 });
  }
}

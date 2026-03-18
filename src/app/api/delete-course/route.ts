import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FIREBASE_COLLECTIONS } from '@/lib/constants';

export async function POST(req: Request) {
  try {
    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Missing courseId' }, { status: 400 });
    }

    console.log(`Starting recursive deletion for course: ${courseId}`);

    const courseRef = adminDb.collection(FIREBASE_COLLECTIONS.COURSES).doc(courseId);

    // 1. Get all phases
    const phasesSnapshot = await courseRef.collection(FIREBASE_COLLECTIONS.PHASES).get();

    for (const phaseDoc of phasesSnapshot.docs) {
      const phaseId = phaseDoc.id;
      const phaseRef = courseRef.collection(FIREBASE_COLLECTIONS.PHASES).doc(phaseId);

      // 2. Get all modules in this phase
      const modulesSnapshot = await phaseRef.collection(FIREBASE_COLLECTIONS.MODULES).get();

      for (const moduleDoc of modulesSnapshot.docs) {
        const moduleId = moduleDoc.id;
        const moduleRef = phaseRef.collection(FIREBASE_COLLECTIONS.MODULES).doc(moduleId);

        // 3. Optional: Quiz attempts (if stored under quizzes collection)
        const quizzesSnapshot = await phaseRef.collection(FIREBASE_COLLECTIONS.QUIZZES).get();
        const quizBatch = adminDb.batch();
        quizzesSnapshot.docs
          .filter(d => d.data().module_id === moduleId)
          .forEach(doc => quizBatch.delete(doc.ref));
        await quizBatch.commit();

        // Delete the module
        await moduleRef.delete();
      }

      // Delete the phase
      await phaseRef.delete();
    }

    // Finally delete the course itself
    await courseRef.delete();

    console.log(`Successfully deleted course ${courseId} and all subcollections.`);

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });

  } catch (error: unknown) {
    console.error('Course deletion error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete course' }, { status: 500 });
  }
}

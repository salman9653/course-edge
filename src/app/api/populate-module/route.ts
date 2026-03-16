import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { fetchYouTubeVideos, generateBridgeNotes } from '@/lib/services/content-filler';

export const maxDuration = 60; // Set longer max duration for Vercel

export async function POST(req: Request) {
  try {
    const { moduleId } = await req.json();

    if (!moduleId) {
      return NextResponse.json({ error: 'Missing moduleId' }, { status: 400 });
    }

    const moduleRef = adminDb.collection('modules').doc(moduleId);
    const moduleDoc = await moduleRef.get();

    if (!moduleDoc.exists) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const moduleData = moduleDoc.data()!;
    const moduleTitle = moduleData.title;

    // 1. Fetch YouTube Videos
    const videos = await fetchYouTubeVideos(moduleTitle);
    const videoIds = videos.map((v: { id: string, description: string }) => v.id);
    const videoDescriptions = videos.map((v: { id: string, description: string }) => v.description);

    // 2. Generate Bridge Notes (even if no videos found to still provide context)
    const bridgeNotes = await generateBridgeNotes(moduleTitle, videoDescriptions);

    // 3. Update Firestore
    await moduleRef.update({
      youtube_links: videoIds,
      ai_bridge_notes_markdown: bridgeNotes,
      updated_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      youtube_links: videoIds,
      ai_bridge_notes_markdown: bridgeNotes
    });

  } catch (error: unknown) {
    console.error('Module population error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to populate module' }, { status: 500 });
  }
}

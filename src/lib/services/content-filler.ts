import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

export async function fetchYouTubeVideos(moduleTitle: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

  // We append "tutorial or course" to ensure high quality learning content
  const query = encodeURIComponent(`${moduleTitle} tutorial programming`);
  // fetch exactly 1 relevant video
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoCodec=any&videoDefinition=any&videoDuration=medium&maxResults=1&order=relevance&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch YouTube videos');
  }
  const data = await res.json();

  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items.map((item: { id: { videoId: string }, snippet: { title: string, description: string } }) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    description: item.snippet.description
  }));
}

export async function generateBridgeNotes(moduleTitle: string, videoDescriptions: string[]) {
  const context = videoDescriptions.join('\n\n');
  const prompt = `You are an expert software engineering tutor creating bridge notes for a module titled "${moduleTitle}".
Here are the descriptions of the curated videos the student will watch:
${context}

Create a highly structured, engaging Markdown study guide that:
1. Explains the core concepts connecting these videos.
2. Updates any deprecated code snippets or concepts if necessary that might be in older videos.
3. Highlights key takeaways.
Keep it strictly in Markdown format, using headers, bold text, and code blocks where appropriate. Do NOT wrap the entire response in a markdown code block (like \`\`\`markdown ), just return the raw markdown text.`;

  const { text } = await generateText({
    model: google('gemini-2.5-flash'),
    prompt,
  });

  return text;
}

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { VideoPlayer } from '@/components/VideoPlayer';
import { FlashcardModule } from '@/components/FlashcardModule';
import { SlideDeckModule } from '@/components/SlideDeckModule';
import { QuizModule } from '@/components/QuizModule';
import { Loader2, WifiOff } from 'lucide-react';
import { ModuleData } from './CourseProgressView';

interface ModuleContentProps {
  moduleData: ModuleData;
  isOnline: boolean;
  activeCourseId: string;
  activePhaseId: string;
  activeModuleId: string;
  nextModuleId: string | null;
  setActiveModule: (phaseId: string, moduleId: string) => void;
  phaseTitle: string;
}

export function ModuleContent({
  moduleData,
  isOnline,
  activeCourseId,
  activePhaseId,
  activeModuleId,
  nextModuleId,
  setActiveModule,
  phaseTitle
}: ModuleContentProps) {
  return (
    <div className="mb-8">
      <h1 className="text-xl md:text-3xl font-heading font-bold bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-6 text-center">
        {moduleData.type === 'quiz' && moduleData.quiz_metadata?.type === 'major' 
          ? `Major Quiz: ${phaseTitle.split(':')[0]}` 
          : moduleData.title}
      </h1>
      
      {moduleData.type === 'video' && (
        <div className="flex flex-col gap-6">
          {isOnline ? (
            <VideoPlayer videoIds={moduleData.youtube_links && moduleData.youtube_links.length > 0 ? [moduleData.youtube_links[0]] : []} />
          ) : (
          <div className="w-full aspect-video bg-slate-900/50 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-400 border border-slate-800 border-dashed">
            <div className="flex flex-col items-center">
              <WifiOff className="w-8 h-8 mb-2 opacity-50" />
              <span>Video player unavailable offline</span>
            </div>
          </div>
          )}
          
          {!moduleData.content ? (
            <div className="flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-[#13151A] rounded-2xl border border-slate-100 dark:border-[#2A2E35] text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <h3 className="text-xl font-bold dark:text-white mb-2">Preparing Your Lessons</h3>
              <p className="text-slate-500 dark:text-slate-400">The AI is crafting detailed notes for this video. Just a moment...</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert prose-sm md:prose-lg max-w-none prose-headings:text-balance prose-headings:bg-linear-to-r prose-headings:from-blue-600 prose-headings:to-indigo-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-a:text-blue-500 hover:prose-a:text-blue-600 p-4 bg-slate-50 dark:bg-[#13151A] rounded-2xl border border-slate-100 dark:border-[#2A2E35]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {moduleData.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {moduleData.type === 'infographics' && (
        <div className="prose prose-slate dark:prose-invert prose-sm md:prose-lg max-w-none prose-headings:text-balance prose-headings:bg-linear-to-r prose-headings:from-blue-600 prose-headings:to-indigo-600 prose-headings:bg-clip-text prose-headings:text-transparent prose-a:text-blue-500 hover:prose-a:text-blue-600 p-4">
          {!moduleData.content ? (
            <div className="flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-[#13151A] rounded-2xl border border-slate-100 dark:border-[#2A2E35] text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <h3 className="text-xl font-bold dark:text-white mb-2">Generating Infographic</h3>
              <p className="text-slate-500 dark:text-slate-400">Creating a rich visual study guide for you...</p>
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {moduleData.content}
            </ReactMarkdown>
          )}
        </div>
      )}

      {moduleData.type === 'quiz' && (
        <QuizModule 
          courseId={activeCourseId || ''} 
          phaseId={activePhaseId || ''} 
          moduleId={activeModuleId || ''} 
          onNextModule={nextModuleId ? () => setActiveModule(activePhaseId || '', nextModuleId) : undefined}
        />
      )}

      {moduleData.type === 'flashcard' && (
        <div className="min-h-[400px]">
          {!moduleData.flashcard_data || moduleData.flashcard_data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-20 bg-slate-50 dark:bg-[#13151A] rounded-2xl border border-slate-100 dark:border-[#2A2E35] text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <h3 className="text-xl font-bold dark:text-white mb-2">Creating Flashcards</h3>
              <p className="text-slate-500 dark:text-slate-400">Populating your deck with key concepts...</p>
            </div>
          ) : (
            <FlashcardModule cards={moduleData.flashcard_data} />
          )}
        </div>
      )}

      {moduleData.type === 'slideDeck' && (
        <div className="min-h-[400px]">
           {!moduleData.slides || moduleData.slides.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-20 bg-slate-50 dark:bg-[#13151A] rounded-2xl border border-slate-100 dark:border-[#2A2E35] text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
              <h3 className="text-xl font-bold dark:text-white mb-2">Designing Slides</h3>
              <p className="text-slate-500 dark:text-slate-400">Crafting a visual narrative for this phase...</p>
            </div>
          ) : (
            <SlideDeckModule slides={moduleData.slides} />
          )}
        </div>
      )}
    </div>
  );
}

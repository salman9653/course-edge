'use client';

import { Search, LayoutGrid, List, Plus } from 'lucide-react';

interface DashboardToolbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onOpenCreateModal: () => void;
}

export function DashboardToolbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  onOpenCreateModal
}: DashboardToolbarProps) {
  return (
    <div className="hidden md:block bg-[#F9FAFB]/50 dark:bg-[#0D0F12]/50 border-b border-slate-200/60 dark:border-[#202124] sticky top-[80px] z-40 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-6 py-6 flex items-center justify-between gap-8">
        {/* Tabs Aligned to Logo */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-full border border-slate-200/50 dark:border-white/5 flex-shrink-0">
          {['All', 'Pinned'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full text-xs font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-[#E8EAED]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search: Expanding Space */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search library..."
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm font-medium"
          />
        </div>

        {/* Action Buttons Aligned to Profile */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl p-1 border border-slate-200/50 dark:border-white/5">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 px-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 px-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button 
            onClick={onOpenCreateModal} 
            className="px-6 py-3 bg-white dark:bg-white text-slate-900 dark:text-slate-900 rounded-2xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-lg active:scale-[0.98] border border-[#202124]/5 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Create new
          </button>
        </div>
      </div>
    </div>
  );
}

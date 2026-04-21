import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';

// Importy Twoich komponentów
import { TaskMainContent } from '../components/TaskMainContent';
import { TaskAttachments } from '../components/TaskAttachments';
import { TaskSubtasks } from '../components/TaskSubtasks';
import { TaskRelatedIssues } from '../components/TaskRelatedIssues';
import { TaskSidebarDetails } from '../components/TaskSidebarDetails';
import { TaskDevelopment } from '../components/TaskDevelopment';
import { TaskPath } from '../components/TaskPath';

import { EyeIcon, ShareIcon, EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

const TaskPage: React.FC = () => {
    return (
        // POWRÓT DO BIAŁEGO TŁA: bg-white
        <div className="min-h-screen w-full bg-white font-segoe-ui antialiased">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="max-w-6xl mx-auto px-10 py-6">
                    
                    {/* Header z nawigacją i akcjami - usunięty bg-white i shadow, zostaje border */}
                    <header className="flex items-center justify-between mb-8">
                        <div className="text-[12px] text-slate-500 font-medium">
                            Dodaj element nadrzędny / CSM-WEB-3
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition-all cursor-pointer">
                                <EyeIcon className="h-4 w-4 text-slate-600 stroke-2" />
                                <span className="text-sm font-semibold text-slate-600">1</span>
                            </button>
                            <button className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition-all text-slate-600 cursor-pointer">
                                <ShareIcon className="h-4 w-4 stroke-2" />
                            </button>
                            <button className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition-all text-slate-600 cursor-pointer">
                                <EllipsisHorizontalIcon className="h-4 w-4 stroke-2" />
                            </button>
                            <button className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 transition-all text-slate-600 cursor-pointer">
                                <XMarkIcon className="h-4 w-4 stroke-2" />
                            </button>
                        </div>
                    </header>

                    <div className="flex gap-12">
                        {/* Lewa strona - Content bez karty (bez bg-white i shadow), czysta struktura */}
                        <div className="flex-1 h-fit">
                            <TaskMainContent />
                            <TaskAttachments />
                            <TaskSubtasks />
                            <TaskRelatedIssues />
                        </div>

                        {/* Prawa strona - Sidebar */}
                        <aside className="w-80 flex flex-col gap-6">
                            <TaskSidebarDetails />
                            <TaskDevelopment />
                            <TaskPath />
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TaskPage;
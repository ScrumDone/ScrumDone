import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';

// Importy komponentów
import { TaskMainContent } from '../components/TaskMainContent';
import { TaskAttachments } from '../components/TaskAttachments';
import { TaskSubtasks } from '../components/TaskSubtasks';
import { TaskRelatedIssues } from '../components/TaskRelatedIssues';
import { TaskSidebarDetails } from '../components/TaskSidebarDetails';
import { TaskLabels } from '../components/TaskLabels'

import { EyeIcon, ShareIcon, EllipsisHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';

const TaskPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-white font-segoe-ui antialiased">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                {/* ZMIANA: Usunięto max-w-6xl oraz mx-auto. Dodano w-full. */}
                <div className="w-full px-8 py-6">
                    
                    {/* Header */}
                    <header className="flex items-center justify-between mb-8">
                        <div className="text-[12px] text-slate-500 font-medium">
                            Strona główna (start-page) / CRM-WC-2
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
                        {/* Lewa strona - Content zajmuje teraz całą resztę szerokości dzięki flex-1 */}
                        <div className="flex-1 h-fit">
                            <TaskMainContent />
                            <TaskAttachments />
                            <TaskSubtasks />
                            <TaskRelatedIssues />
                        </div>

                        {/* Prawa strona - Sidebar (stała szerokość) */}
                        <aside className="w-80 flex flex-col gap-6 shrink-0">
                            <TaskSidebarDetails />
                            <TaskLabels/>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TaskPage;
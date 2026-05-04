import React from 'react';
import SideBar from '../components/sideBar';
import TopBar from '../components/topBar';

import { TaskMainContent } from '../components/TaskMainContent';
import { TaskAttachments } from '../components/TaskAttachments';
import { TaskSubtasks } from '../components/TaskSubtasks';
import { TaskRelatedIssues } from '../components/TaskRelatedIssues';
import { TaskSidebarDetails } from '../components/TaskSidebarDetails';
import { TaskLabels } from '../components/TaskLabels'

const TaskPage: React.FC = () => {
    return (
        <div className="min-h-screen w-full bg-slate-50 font-segoe-ui antialiased">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-20">
                <div className="w-full px-8 py-6">
                    <header className="mb-2">
                        <div className="text-[12px] text-slate-500 font-medium">
                            Strona główna (start-page) / <span className="text-slate-400">(CRM-WC-2)</span>
                        </div>
                    </header>

                    <div className="flex gap-10">
                        <div className="flex-1 space-y-6">
                            <TaskMainContent />
                            <TaskAttachments />
                            <TaskSubtasks />
                            <TaskRelatedIssues />
                        </div>

                        <aside className="w-96 flex-shrink-0 space-y-6 pt-21">
                            <TaskSidebarDetails />
                            <TaskLabels />
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TaskPage;
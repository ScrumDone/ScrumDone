import React from 'react';
import SideBar from '../components/layout/SideBar';
import TopBar from '../components/layout/TopBar';

import { useParams } from 'react-router-dom'; 
import { useQuery } from '@tanstack/react-query'; 
import { getAssignment } from '../api/assignments'; 

import { TaskMainContent } from '../components/tasks/TaskMainContent';
import { TaskAttachments } from '../components/tasks/TaskAttachments';
import { TaskSubtasks } from '../components/tasks/TaskSubtasks';
import { TaskRelatedIssues } from '../components/tasks/TaskRelatedIssues';
import { TaskActivity } from '../components/tasks/TaskActivity';
import { TaskSidebarDetails } from '../components/tasks/TaskSidebarDetails';
import { TaskLabels } from '../components/tasks/TaskLabels'

const TaskPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>(); 

    const { data: assignment, isLoading, error } = useQuery({ 
        queryKey: ['assignment', assignmentId],
        queryFn: () => getAssignment(assignmentId!),
        enabled: !!assignmentId,
    });

    if (isLoading) return <div>Ładowanie...</div>; 
    if (error || !assignment) return <div>Nie znaleziono zadania.</div>; 

    return (
        <div className="min-h-screen w-full bg-slate-50 font-segoe-ui antialiased">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-20">
                <div className="w-full px-8 py-6">
                    <header className="mb-2">
                        <div className="text-[12px] text-slate-500 font-medium">
                            Strona główna (start-page) / <span className="text-slate-400">({assignment.name})</span>
                        </div>
                    </header>

                    <div className="flex gap-10">
                        <div className="flex-1 space-y-6">
                            <TaskMainContent assignment={assignment} />
                            <TaskAttachments />
                            <TaskSubtasks assignment={assignment} />
                            <TaskRelatedIssues />
                            <TaskActivity />
                        </div>

                        <aside className="w-96 shrink-0 space-y-6 pt-21">
                            <TaskSidebarDetails assignmentId={assignment.id} assignment={assignment} />
                            <TaskLabels assignmentId={assignment.id} labels={assignment.labels} />
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TaskPage;
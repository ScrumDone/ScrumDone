import React from 'react';
import SideBar from '../../components/layout/SideBar';
import TopBar from '../../components/layout/TopBar';

import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAssignment } from '../../api/assignments';
import { ApiError } from '../../api/client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { TaskMainContent } from '../../components/tasks/TaskMainContent';
import { TaskAttachments } from '../../components/tasks/TaskAttachments';
import { TaskSubtasks } from '../../components/tasks/TaskSubtasks';
import { TaskRelatedIssues } from '../../components/tasks/TaskRelatedIssues';
import { TaskActivity } from '../../components/tasks/TaskActivity';
import { TaskSidebarDetails } from '../../components/tasks/TaskSidebarDetails';
import { TaskLabels } from '../../components/tasks/TaskLabels'

const isMissingAssignmentError = (error: unknown) =>
    error instanceof ApiError && (error.status === 404 || error.status === 400);

const TaskUnavailable = ({
    description,
    onBack,
    onRetry,
    isRetrying = false,
}: {
    description: string;
    onBack: () => void;
    onRetry?: () => void;
    isRetrying?: boolean;
}) => (
    <section className="flex min-h-[calc(100vh-8.5rem)] items-center justify-center">
        <div className="flex w-full max-w-2xl flex-col items-center rounded-2xl border border-scrumdone-blue-100 bg-white px-12 py-12 text-center">
            <div className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-scrumdone-blue-200">
                <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
                    <rect x="34" y="28" width="52" height="66" rx="8" fill="white" stroke="#00BFFF" strokeWidth="3" />
                    <rect x="48" y="22" width="24" height="10" rx="3" fill="#00BFFF" />
                    <path d="M46 50h28M46 62h20" stroke="#CCE5FF" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="78" cy="82" r="16" fill="#2B7FFF" />
                    <path d="M72 82h12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

            <h1 className="text-[28px] font-semibold text-slate-900">
                Nie udało się załadować zadania
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-500">{description}</p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-xl border border-scrumdone-blue-main bg-white px-6 py-3 text-base font-medium text-scrumdone-blue-main transition-colors hover:bg-scrumdone-blue-200"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Wróć
                </button>
                {onRetry ? (
                    <button
                        type="button"
                        onClick={onRetry}
                        disabled={isRetrying}
                        className="rounded-lg bg-scrumdone-blue-main px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#00A0DD] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRetrying ? 'Ponawianie...' : 'Spróbuj ponownie'}
                    </button>
                ) : null}
            </div>
        </div>
    </section>
);

const Pulse = ({ className }: { className: string }) => (
    <div className={`rounded-md bg-slate-200 ${className}`} />
);

const SkeletonCard = ({ children }: { children: React.ReactNode }) => (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-6 flex items-center justify-between">
            <Pulse className="h-6 w-36" />
            <Pulse className="h-5 w-5" />
        </div>
        {children}
    </section>
);

const TaskPageSkeleton = () => (
    <div className="animate-pulse" aria-busy="true" aria-label="Ładowanie zadania">
        <header className="mb-2">
            <Pulse className="h-3 w-56" />
        </header>

        <div className="flex gap-10">
            <div className="flex-1 space-y-6">
                <Pulse className="h-10 w-2/3" />

                <SkeletonCard>
                    <div className="space-y-3">
                        <Pulse className="h-4 w-full" />
                        <Pulse className="h-4 w-11/12" />
                        <Pulse className="h-4 w-4/5" />
                    </div>
                    <div className="mt-6 flex gap-6">
                        <Pulse className="h-24 w-24" />
                        <Pulse className="h-24 w-24" />
                    </div>
                </SkeletonCard>

                <SkeletonCard>
                    <div className="flex gap-6">
                        <Pulse className="h-24 w-24" />
                        <Pulse className="h-24 w-24" />
                    </div>
                </SkeletonCard>

                <SkeletonCard>
                    <Pulse className="h-4 w-40" />
                </SkeletonCard>

                <SkeletonCard>
                    <Pulse className="h-4 w-48" />
                </SkeletonCard>

                <SkeletonCard>
                    <div className="mb-5 flex gap-2">
                        <Pulse className="h-8 w-24" />
                        <Pulse className="h-8 w-24" />
                        <Pulse className="h-8 w-20" />
                    </div>
                    <div className="flex items-start gap-3">
                        <Pulse className="h-10 w-10 shrink-0 rounded-full" />
                        <Pulse className="h-16 flex-1" />
                    </div>
                </SkeletonCard>
            </div>

            <aside className="w-96 shrink-0 space-y-6 pt-21">
                <section className="rounded-xl border border-slate-200 bg-white p-4">
                    <Pulse className="h-10 w-full" />
                </section>

                <SkeletonCard>
                    <div className="space-y-4">
                        {Array.from({ length: 7 }, (_, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <Pulse className="h-4 w-24" />
                                <Pulse className="h-4 w-28" />
                            </div>
                        ))}
                    </div>
                </SkeletonCard>

                <SkeletonCard>
                    <div className="flex gap-2">
                        <Pulse className="h-6 w-16" />
                        <Pulse className="h-6 w-20" />
                    </div>
                </SkeletonCard>
            </aside>
        </div>
    </div>
);

const TaskPage: React.FC = () => {
    const { assignmentId } = useParams<{ assignmentId: string }>();
    const navigate = useNavigate();

    const { data: assignment, isLoading, error, refetch, isFetching } = useQuery({
        queryKey: ['assignment', assignmentId],
        queryFn: () => getAssignment(assignmentId!),
        enabled: !!assignmentId,
        retry: (failureCount, queryError) => {
            if (isMissingAssignmentError(queryError)) {
                return false;
            }
            return failureCount < 1;
        },
    });

    const isMissingAssignment = !assignmentId || isMissingAssignmentError(error);

    return (
        <div className="min-h-screen w-full bg-slate-50 font-segoe-ui antialiased">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-20">
                <div className="w-full px-8 py-6">
                    {assignmentId && isLoading ? (
                        <TaskPageSkeleton />
                    ) : isMissingAssignment ? (
                        <TaskUnavailable
                            description="Link jest nieprawidłowy albo to zadanie już nie istnieje."
                            onBack={() => navigate(-1)}
                        />
                    ) : error ? (
                        <TaskUnavailable
                            description="Spróbuj ponownie za chwilę."
                            onBack={() => navigate(-1)}
                            onRetry={() => refetch()}
                            isRetrying={isFetching}
                        />
                    ) : assignment ? (
                        <>
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
                        </>
                    ) : null}
                </div>
            </main>
        </div>
    );
};

export default TaskPage;

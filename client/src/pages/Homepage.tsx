import React from 'react'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import WelcomePageTask from '../components/welcomePageTask'
import NewsFeed from '../components/newsFeed'
import ProjectsOverview from '../components/projectsOverview'
import { useAssignments } from '../hooks/useAssignments'
import type { Assignment } from '../types/assignment'; 
import { useState} from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom'

const Homepage: React.FC = () => {
    const navigate = useNavigate()
    // // Pobieramy zadania
    // const { data: assignments, isLoading } = useAssignments();

    // // Filtrujemy zadania na dzisiaj
    // const today = new Date().toISOString().split('T')[0];
    // const tasksArray = assignments?.items || [];
    // const todaysTasks = tasksArray.filter((task: Assignment) => task.dueDate === today);

    // 1. Obliczamy datę
    const today = new Date().toISOString().split('T')[0];

    const [currentPage, setCurrentPage] = useState(1)

    // 2. Pobieramy zadania przefiltrowane przez API
    const { data: assignments, isLoading } = useAssignments({
        DueFrom: `${today}T00:00:00Z`, 
        DueTo: `${today}T23:59:59Z`,
        ExcludeNoDeadline: true,
        Page: currentPage,
        Limit: 3 // Ustawiamy limit na 3
    });

    // 3. Przypisujemy wyniki (teraz `assignments.items` zawiera już tylko zadania na dziś)
    const todaysTasks = assignments?.items || [];

    const hasNextPage = assignments?.hasNextPage ?? false;
    const hasPreviousPage = assignments?.hasPreviousPage ?? false;
    const showPagination = hasPreviousPage || hasNextPage || currentPage > 1;

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-350 flex-col px-8 py-6">
                    <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-[0em] antialiased mb-6">Strona Główna</h1>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="font-segoe-ui text-slate-800 text-[1.125rem] leading-7 font-normal tracking-[0em] antialiased mb-6">
                                Dzisiaj
                            </h1>
                            <div className="flex flex-col gap-3">
                                {isLoading ? (
                                    <p className="text-sm text-slate-500">Pobieranie zadań...</p>
                                ) : (
                                    <>
                                        {/* Lista zadań */}
                                        {todaysTasks.length > 0 ? todaysTasks.map((task: Assignment) => {
                                            const user = task.assignees?.[0];
                                            const fullName = user ? user.name : "Nieprzypisany";
                                            const initials = user
                                                ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                                : "??";

                                            return (
                                                <WelcomePageTask
                                                    key={task.id}
                                                    taskName={task.name}
                                                    projectName={task.projectName || "Brak projektu"}
                                                    initials={initials}
                                                    fullName={fullName}
                                                    colorVariant="red"
                                                    dotColorVariant="red"
                                                    badgeColorVariant="red"
                                                    isBlocked={false}
                                                    onClick={() => navigate(`/task/${task.id}`)}
                                                />
                                            );
                                        }) : (
                                            <p className="text-sm text-slate-500">Brak zadaĹ„ na dzisiaj!</p>
                                        )}

                                        {/* Paginacja */}
                                        {showPagination && (
                                        <div className="flex items-center justify-between mt-4 border-t border-gray-100 pt-3">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage <= 1 || isLoading}
                                                className="flex items-center gap-1 text-sm text-slate-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                                Poprzednia
                                            </button>

                                            <span className="text-xs font-medium text-slate-400">Strona {currentPage}</span>

                                            <button
                                                onClick={() => setCurrentPage(prev => prev + 1)}
                                                disabled={!hasNextPage || isLoading}
                                                className="flex items-center gap-1 text-sm text-slate-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Następna
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="font-segoe-ui text-slate-800 text-[1.125rem] leading-7 font-normal tracking-[0em] antialiased mb-6">
                                Aktualności
                            </h1>
                            <NewsFeed />
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h1 className="font-segoe-ui text-slate-800 text-[1.125rem] leading-7 font-normal tracking-[0em] antialiased mb-6">
                                Projekty
                            </h1>
                            <ProjectsOverview />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default Homepage

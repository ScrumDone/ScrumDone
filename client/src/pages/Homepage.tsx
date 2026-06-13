import React from 'react'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import WelcomePageTask from '../components/welcomePageTask'
import NewsFeed from '../components/newsFeed'
import ProjectsOverview from '../components/projectsOverview'
import { useAssignments } from '../hooks/useAssignments'
import type { Assignment } from '../types/assignment'; 

const Homepage: React.FC = () => {
    // Pobieramy zadania
    const { data: assignments, isLoading } = useAssignments();

    // Filtrujemy zadania na dzisiaj
    const today = new Date().toISOString().split('T')[0];
    const tasksArray = assignments?.items || [];
    const todaysTasks = tasksArray.filter((task: Assignment) => task.dueDate === today);


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
                                ) : todaysTasks.length > 0 ? (
                                    todaysTasks.map((task: Assignment) => {
                                        // Pobieramy pierwszego przypisanego użytkownika (jeśli istnieje)
                                        const user = task.assignees?.[0];
                                        
                                        // Wyciągamy dane z obiektu UserSummary
                                        const fullName = user ? user.name : "Nieprzypisany";
                                        
                                        // Generujemy inicjały z pola name (np. "Artur Nowak" -> "AN")
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
                                            />
                                        )
                                    })
                                ) : (
                                    <p className="text-sm text-slate-500">Brak zadań na dzisiaj!</p>
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
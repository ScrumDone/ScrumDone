import React from 'react'
import { ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import type { ProjectListItem } from '../types/project'
import { formatProjectDateForDisplay, getProjectStageCounts } from '../utils/projectDisplay'

const ProjectsOverview: React.FC = () => {
    const { data, isLoading, isError, error } = useProjects({ page: 1, limit: 3 })

    if (isLoading) {
        return <p className="text-sm text-slate-500 animate-pulse">Pobieranie projektów...</p>
    }

    if (isError) {
        return (
            <p className="text-sm text-red-600">
                Nie udało się załadować projektów{error?.message ? `: ${error.message}` : '.'}
            </p>
        )
    }

    const projects = data?.items ?? []

    if (projects.length === 0) {
        return <p className="text-sm text-slate-500">Brak projektów do wyświetlenia.</p>
    }

    return (
        <div className="flex flex-col gap-4">
            {projects.map((project) => (
                <ProjectOverviewCard key={project.id} project={project} />
            ))}
        </div>
    )
}

const ProjectOverviewCard: React.FC<{ project: ProjectListItem }> = ({ project }) => {
    const stages = getProjectStageCounts(project)
    const totalTasks = stages.done + stages.inProgress + stages.blocked
    const dueDate = formatProjectDateForDisplay(project.expectedFinishDate)
    const isOfftrack = stages.blocked > 0

    return (
        <Link
            to={`/projects/${project.id}/tablica-kanban`}
            className="block rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
        >
            <div className="mb-3 flex items-start justify-between gap-3">
                <h2 className="font-segoe-ui text-[18px] leading-6.75 font-normal text-slate-900 antialiased">
                    {project.name}
                </h2>
                {isOfftrack ? (
                    <span className="rounded-xl border border-scrumdone-red-300 px-3 py-0.5 font-segoe-ui text-[12px] leading-4 font-normal text-scrumdone-red-500 antialiased">
                        Offtrack
                    </span>
                ) : null}
            </div>

            <div className="mb-3 flex items-center gap-1.5 font-segoe-ui text-[12px] leading-4 font-normal text-slate-500 antialiased">
                <ClockIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>{dueDate}</span>
                <span>•</span>
                <span>{project.assignmentCount} issues</span>
            </div>

            <div className="mb-4 flex items-center gap-1.5 font-segoe-ui text-[12px] leading-4 font-normal text-slate-500 antialiased">
                <UsersIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                <span>{project.teamMemberCount} członków</span>
            </div>

            <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                {totalTasks > 0 ? (
                    <>
                        {stages.done > 0 ? (
                            <span
                                className="h-full bg-scrumdone-green-500"
                                style={{ width: `${(stages.done / totalTasks) * 100}%` }}
                                aria-label="Zakończone zadania"
                            />
                        ) : null}
                        {stages.inProgress > 0 ? (
                            <span
                                className="h-full bg-scrumdone-yellow-500"
                                style={{ width: `${(stages.inProgress / totalTasks) * 100}%` }}
                                aria-label="Zadania w toku"
                            />
                        ) : null}
                        {stages.blocked > 0 ? (
                            <span
                                className="h-full bg-scrumdone-red-500"
                                style={{ width: `${(stages.blocked / totalTasks) * 100}%` }}
                                aria-label="Zablokowane zadania"
                            />
                        ) : null}
                    </>
                ) : null}
            </div>
        </Link>
    )
}

export default ProjectsOverview

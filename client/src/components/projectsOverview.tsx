import React from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'
import Avatar from './Avatar'

interface Member {
    id: string
    initials: string
}

interface StageCounts {
    done: number
    inProgress: number
    blocked: number
}

interface ProjectEntry {
    id: string
    name: string
    dueDate: string
    issues: number
    members: Member[]
    hiddenMembersCount?: number
    stages: StageCounts
}

const projects: ProjectEntry[] = [
    {
        id: 'adoddle',
        name: 'Adoddle',
        dueDate: '05 KWIETNIA 2026',
        issues: 14,
        members: [
            { id: 'an', initials: 'AN' },
            { id: 'eb', initials: 'EB' },
        ],
        hiddenMembersCount: 1,
        stages: {
            done: 3,
            inProgress: 4,
            blocked: 7,
        },
    },
    {
        id: 'nexus',
        name: 'Nexus',
        dueDate: '06 KWIETNIA 2026',
        issues: 7,
        members: [
            { id: 'an-2', initials: 'AN' },
            { id: 'eb-2', initials: 'EB' },
        ],
        hiddenMembersCount: 1,
        stages: {
            done: 0,
            inProgress: 2,
            blocked: 5,
        },
    },
    {
        id: 'hadar',
        name: 'Hadar',
        dueDate: '05 KWIETNIA 2026',
        issues: 9,
        members: [
            { id: 'an-3', initials: 'AN' },
            { id: 'mk', initials: 'MK' },
        ],
        hiddenMembersCount: 1,
        stages: {
            done: 1,
            inProgress: 3,
            blocked: 5,
        },
    },
]

const ProjectsOverview: React.FC = () => {
    return (
        <div className="flex flex-col gap-4">
            {projects.map((project) => {
                const totalTasks = project.stages.done + project.stages.inProgress + project.stages.blocked

                return (
                    <article key={project.id} className="rounded-xl border border-gray-200 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <h2 className="font-segoe-ui text-[18px] leading-6.75 font-normal text-slate-900 antialiased">{project.name}</h2>
                            <span className="rounded-xl border border-scrumdone-red-300 px-3 py-0.5 font-segoe-ui text-[12px] leading-4 font-normal text-scrumdone-red-500 antialiased">
                                Offtrack
                            </span>
                        </div>

                        <div className="mb-3 flex items-center gap-1.5 font-segoe-ui text-[12px] leading-4 font-normal text-slate-500 antialiased">
                            <ClockIcon className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                            <span>{project.dueDate}</span>
                            <span>•</span>
                            <span>{project.issues} issues</span>
                        </div>

                        <div className="mb-4 flex items-center">
                            <div className="flex -space-x-2">
                                {project.members.map((member) => (
                                    <Avatar
                                        key={member.id}
                                        initials={member.initials}
                                        size="xs"
                                        className="border border-white"
                                        bgClassName="bg-scrumdone-blue-main"
                                    />
                                ))}
                            </div>
                            {project.hiddenMembersCount ? (
                                <span className="ml-1 rounded-md bg-gray-100 px-1.5 py-0.5 font-segoe-ui text-[12px] leading-4 font-normal text-slate-500 antialiased">
                                    +{project.hiddenMembersCount}
                                </span>
                            ) : null}
                        </div>

                        <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            {totalTasks > 0 ? (
                                <>
                                    {project.stages.done > 0 ? (
                                        <span
                                            className="h-full bg-scrumdone-green-500"
                                            style={{ width: `${(project.stages.done / totalTasks) * 100}%` }}
                                            aria-label="Zakończone zadania"
                                        />
                                    ) : null}
                                    {project.stages.inProgress > 0 ? (
                                        <span
                                            className="h-full bg-scrumdone-yellow-500"
                                            style={{ width: `${(project.stages.inProgress / totalTasks) * 100}%` }}
                                            aria-label="Zadania w toku"
                                        />
                                    ) : null}
                                    {project.stages.blocked > 0 ? (
                                        <span
                                            className="h-full bg-scrumdone-red-500"
                                            style={{ width: `${(project.stages.blocked / totalTasks) * 100}%` }}
                                            aria-label="Zablokowane zadania"
                                        />
                                    ) : null}
                                </>
                            ) : null}
                        </div>
                    </article>
                )
            })}
        </div>
    )
}

export default ProjectsOverview
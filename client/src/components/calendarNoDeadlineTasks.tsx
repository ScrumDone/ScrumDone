import React, {useState, useMemo} from 'react'
import Avatar from './Avatar'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useAssignments } from '../hooks/useAssignments'
import type { Assignment } from '../types/assignment'

type TaskAccentColor = 'blue' | 'orange' | 'red' | 'green' | 'yellow'

type TaskDotColor = 'red' | 'yellow' | 'green' | 'blue' | 'orange'

export interface CalendarNoDeadlineTask {
    id: string
    title: string
    assigneeInitials: string
    assigneeName: string
    accentColor: TaskAccentColor
    dotColor: TaskDotColor
}

export interface CalendarNoDeadlineTaskCardProps {
    task: CalendarNoDeadlineTask
}

export interface CalendarNoDeadlineTasksProps {
    title?: string
    tasks?: CalendarNoDeadlineTask[]
}

const accentClassMap: Record<TaskAccentColor, string> = {
    blue: 'border-scrumdone-blue-main border-l-scrumdone-blue-main',
    orange: 'border-scrumdone-orange border-l-scrumdone-orange',
    red: 'border-scrumdone-red-500 border-l-scrumdone-red-500',
    green: 'border-scrumdone-green-500 border-l-scrumdone-green-500',
    yellow: 'border-scrumdone-yellow-500 border-l-scrumdone-yellow-500',
}

const backgroundClassMap: Record<TaskAccentColor, string> = {
    blue: 'bg-scrumdone-blue-main/2',
    orange: 'bg-scrumdone-orange/2',
    red: 'bg-scrumdone-red-500/2',
    green: 'bg-scrumdone-green-500/2',
    yellow: 'bg-scrumdone-yellow-500/2',
}

const dotClassMap: Record<TaskDotColor, string> = {
    red: 'bg-scrumdone-red-500',
    yellow: 'bg-scrumdone-yellow-500',
    green: 'bg-scrumdone-green-500',
    blue: 'bg-scrumdone-blue-main',
    orange: 'bg-scrumdone-orange',
}

// const defaultTasks: CalendarNoDeadlineTask[] = [
//     {
//         id: 'code-refactoring-user-module',
//         title: 'Code refactoring - user module',
//         assigneeInitials: 'AN',
//         assigneeName: 'Artur Nowak',
//         accentColor: 'blue',
//         dotColor: 'green',
//     },
//     {
//         id: 'security-audit',
//         title: 'Security audit',
//         assigneeInitials: 'AN',
//         assigneeName: 'Artur Nowak',
//         accentColor: 'orange',
//         dotColor: 'red',
//     },
// ]

export const CalendarNoDeadlineTaskCard: React.FC<CalendarNoDeadlineTaskCardProps> = ({ task }) => {
    const normalizedInitials = task.assigneeInitials.trim().slice(0, 2).toUpperCase()
    const backgroundClass = backgroundClassMap[task.accentColor]

    return (
        <article className={`flex-none w-full max-w-75 rounded-xl border border-l-4 p-3 ${accentClassMap[task.accentColor]} ${backgroundClass}`}>
            <div className="mb-3 flex items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full ${dotClassMap[task.dotColor]}`} aria-hidden="true" />
                <h2 className="font-segoe-ui text-[14px] leading-5 font-medium tracking-[-0.15px] text-slate-900 antialiased">
                    {task.title}
                </h2>
            </div>

            <div className="flex items-center gap-2">
                <Avatar
                    initials={normalizedInitials}
                    size="sm"
                    bgClassName="bg-slate-200"
                    textClassName="text-slate-900"
                />
                <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-600 antialiased">
                    {task.assigneeName}
                </p>
            </div>
        </article>
    )
}

const ITEMS_PER_PAGE = 9

const CalendarNoDeadlineTasks: React.FC<CalendarNoDeadlineTasksProps> = ({
    title = 'Zadania bez deadline',
    tasks,
}) => {
    const [currentPage, setCurrentPage] = useState(1)
    const { data, isLoading } = useAssignments({ Limit: 100 })

    const processedTasks = useMemo(() => {
        if (tasks) return tasks
        if (!data?.items) return []

        return data.items
            .filter((t: Assignment) => t.dueDate === null)
            .map((t: Assignment): CalendarNoDeadlineTask => ({
                id: t.id,
                title: t.name,
                assigneeInitials: t.assignees?.[0]?.name.slice(0, 2) || 'NA',
                assigneeName: t.assignees?.[0]?.name || 'Unassigned',
                accentColor: t.priority?.name === 'High' ? 'red' : 'blue',
                dotColor: 'green' // Możesz tu dodać logikę mapowania statusu
            }))
    }, [data, tasks])

    const totalPages = Math.ceil(processedTasks.length / ITEMS_PER_PAGE) || 1
    const paginatedTasks = processedTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    return (
        <section className="mt-6 w-full rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="font-segoe-ui text-[18px] leading-7 font-medium text-slate-900 antialiased">
                    {title} ({processedTasks.length})
                </h2>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="rounded-lg p-1 hover:bg-slate-100 disabled:opacity-50"
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
                        </button>
                        <span className="text-sm text-slate-600">{currentPage} / {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="rounded-lg p-1 hover:bg-slate-100 disabled:opacity-50"
                        >
                            <ChevronRightIcon className="h-5 w-5 text-slate-600" />
                        </button>
                    </div>
                )}
            </div>

            {!tasks && isLoading ? (
                <div className="p-4 text-center text-slate-500">Ładowanie...</div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {paginatedTasks.map((task) => (
                        <CalendarNoDeadlineTaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </section>
    )
}



export default CalendarNoDeadlineTasks

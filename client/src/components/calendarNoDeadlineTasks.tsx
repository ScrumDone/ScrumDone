import React, {useState, useMemo} from 'react'
import Avatar from './Avatar'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useAssignments } from '../hooks/useAssignments'
import type { Assignment } from '../types/assignment'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'

type TaskAccentColor = 'blue' | 'orange' | 'red' | 'green' | 'yellow'

type TaskDotColor = 'red' | 'yellow' | 'green' | 'blue' | 'orange'

export interface CalendarNoDeadlineTask {
    id: string
    title: string
    assigneeInitials: string
    assigneeName: string
    accentColor: TaskAccentColor
    dotColor: TaskDotColor
    priorityHexColor?: string | null
}

export interface CalendarNoDeadlineTaskCardProps {
    task: CalendarNoDeadlineTask
}

export interface CalendarNoDeadlineTasksProps {
    title?: string
    tasks?: CalendarNoDeadlineTask[]
    draggable?: boolean
    droppable?: boolean
}

const sectionClassName = 'mt-6 w-full rounded-xl border border-slate-200 bg-white p-4'

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

const hexToRgba = (hexColor: string, alpha: number) => {
    const normalized = hexColor.replace('#', '').trim()

    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        return undefined
    }

    const r = Number.parseInt(normalized.slice(0, 2), 16)
    const g = Number.parseInt(normalized.slice(2, 4), 16)
    const b = Number.parseInt(normalized.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
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
    const navigate = useNavigate()
    const normalizedInitials = task.assigneeInitials.trim().slice(0, 2).toUpperCase()
    const backgroundClass = backgroundClassMap[task.accentColor]
    const priorityStyles = task.priorityHexColor
        ? {
            borderLeftColor: task.priorityHexColor,
            backgroundColor: hexToRgba(task.priorityHexColor, 0.1),
        }
        : undefined

    return (
        <article
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/task/${task.id}`)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    navigate(`/task/${task.id}`)
                }
            }}
            className={`flex-none w-full max-w-75 cursor-pointer rounded-xl border border-l-4 p-3 transition-colors hover:opacity-90 ${accentClassMap[task.accentColor]} ${backgroundClass}`}
            style={priorityStyles}
        >
            <div className="mb-3 flex items-center gap-3">
                <span
                    className={`h-2 w-2 shrink-0 rounded-full ${dotClassMap[task.dotColor]}`}
                    style={task.priorityHexColor ? { backgroundColor: task.priorityHexColor } : undefined}
                    aria-hidden="true"
                />
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

const DraggableCalendarNoDeadlineTaskCard: React.FC<CalendarNoDeadlineTaskCardProps> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: { type: 'calendar-task' },
    })
    const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} className="opacity-30">
                <CalendarNoDeadlineTaskCard task={task} />
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <CalendarNoDeadlineTaskCard task={task} />
        </div>
    )
}

const DroppableNoDeadlineSection: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setNodeRef } = useDroppable({
        id: 'calendar-no-deadline',
        data: { type: 'calendar-no-deadline' },
    })

    return (
        <section ref={setNodeRef} className={sectionClassName}>
            {children}
        </section>
    )
}

const ITEMS_PER_PAGE = 9

const CalendarNoDeadlineTasks: React.FC<CalendarNoDeadlineTasksProps> = ({
    title = 'Zadania bez deadline',
    tasks,
    draggable = false,
    droppable = false,
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
                dotColor: t.priority?.name === 'High' ? 'red' : 'blue',
                priorityHexColor: t.priority?.hexColor ?? null,
            }))
    }, [data, tasks])

    const totalPages = Math.ceil(processedTasks.length / ITEMS_PER_PAGE) || 1
    const paginatedTasks = processedTasks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    const content = (
        <>
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
                        draggable
                            ? <DraggableCalendarNoDeadlineTaskCard key={task.id} task={task} />
                            : <CalendarNoDeadlineTaskCard key={task.id} task={task} />
                    ))}
                </div>
            )}
        </>
    )

    if (droppable) {
        return <DroppableNoDeadlineSection>{content}</DroppableNoDeadlineSection>
    }

    return (
        <section className={sectionClassName}>
            {content}
        </section>
    )
}



export default CalendarNoDeadlineTasks

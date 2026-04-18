import React from 'react'
import Avatar from './Avatar'

type TaskAccentColor = 'blue' | 'orange' | 'red' | 'green' | 'yellow'

type TaskDotColor = 'red' | 'yellow' | 'green' | 'blue'

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
    blue: 'border-scrumdone-blue-main',
    orange: 'border-scrumdone-orange',
    red: 'border-scrumdone-red-500',
    green: 'border-scrumdone-green-500',
    yellow: 'border-scrumdone-yellow-500',
}

const dotClassMap: Record<TaskDotColor, string> = {
    red: 'bg-scrumdone-red-500',
    yellow: 'bg-scrumdone-yellow-500',
    green: 'bg-scrumdone-green-500',
    blue: 'bg-scrumdone-blue-main',
}

const defaultTasks: CalendarNoDeadlineTask[] = [
    {
        id: 'code-refactoring-user-module',
        title: 'Code refactoring - user module',
        assigneeInitials: 'AN',
        assigneeName: 'Artur Nowak',
        accentColor: 'blue',
        dotColor: 'green',
    },
    {
        id: 'security-audit',
        title: 'Security audit',
        assigneeInitials: 'AN',
        assigneeName: 'Artur Nowak',
        accentColor: 'orange',
        dotColor: 'red',
    },
]

export const CalendarNoDeadlineTaskCard: React.FC<CalendarNoDeadlineTaskCardProps> = ({ task }) => {
    const normalizedInitials = task.assigneeInitials.trim().slice(0, 2).toUpperCase()

    return (
        <article className={`rounded-2xl border-2 bg-white/85 p-4 sm:p-5 ${accentClassMap[task.accentColor]}`}>
            <div className="mb-4 flex items-center gap-3">
                <span className={`h-3 w-3 shrink-0 rounded-full ${dotClassMap[task.dotColor]}`} aria-hidden="true" />
                <h2 className="font-segoe-ui text-[14px] leading-8 font-normal text-slate-900 antialiased">
                    {task.title}
                </h2>
            </div>

            <div className="flex items-center gap-3">
                <Avatar
                    initials={normalizedInitials}
                    size="sm"
                    bgClassName="bg-slate-200"
                    textClassName="text-slate-900"
                />
                <p className="font-segoe-ui text-[14px] leading-8 font-normal text-slate-600 antialiased">
                    {task.assigneeName}
                </p>
            </div>
        </article>
    )
}

const CalendarNoDeadlineTasks: React.FC<CalendarNoDeadlineTasksProps> = ({
    title = 'Zadania bez deadline',
    tasks = defaultTasks,
}) => {
    return (
        <section className="mt-6 mb-6 w-full rounded-2xl border border-slate-200 bg-slate-100 p-6">
            <h2 className="mb-5 font-segoe-ui text-[24px] leading-8 font-normal text-slate-900 antialiased">
                {title} ({tasks.length})
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {tasks.map((task) => (
                    <CalendarNoDeadlineTaskCard key={task.id} task={task} />
                ))}
            </div>
        </section>
    )
}

export default CalendarNoDeadlineTasks

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
    const backgroundClass = backgroundClassMap[task.accentColor]

    return (
        <article className={`flex-none w-full max-w-75 rounded-xl border border-l-4 p-3.75 ${accentClassMap[task.accentColor]} ${backgroundClass}`}>
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

const CalendarNoDeadlineTasks: React.FC<CalendarNoDeadlineTasksProps> = ({
    title = 'Zadania bez deadline',
    tasks = defaultTasks,
}) => {
    return (
        <section className="mt-6 w-full rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 font-segoe-ui text-[18px] leading-7 font-medium text-slate-900 antialiased">
                {title} ({tasks.length})
            </h2>

            <div className="flex w-full flex-wrap gap-3">
                {tasks.map((task) => (
                    <CalendarNoDeadlineTaskCard key={task.id} task={task} />
                ))}
            </div>
        </section>
    )
}



export default CalendarNoDeadlineTasks

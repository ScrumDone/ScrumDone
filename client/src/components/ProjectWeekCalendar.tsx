import React from 'react'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import CalendarTaskItem from './calendarTaskItem'
import { useAssignments } from '../hooks/useAssignments'
import type { Assignment } from '../types/assignment'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTask {
    id: string
    title: string
    colorVariant: TaskColor
    date: string
    priorityHexColor?: string | null | undefined
}

interface WeekCalendarProps {
    startDate: Date
    dueFrom?: string | undefined
    dueTo?: string | undefined
    selectedProjectIds?: string[]
    selectedPriorityIds?: string[]
    tasks?: CalendarTask[]
}

const CalendarDayColumn: React.FC<{
    columnDate: Date
    shortName: string
    isToday: boolean
    bodyBgClass: string
    tasks: CalendarTask[]
}> = ({ columnDate, shortName, isToday, bodyBgClass, tasks }) => {
    const dateString = format(columnDate, 'yyyy-MM-dd')
    const { setNodeRef } = useDroppable({ id: dateString })

    return (
        <article
            ref={setNodeRef}
            className="flex flex-col border-r border-b border-slate-200 min-h-[350px]"
        >
            <header className={`flex flex-col items-center justify-center gap-1 py-4 border-b border-slate-200 ${isToday ? 'bg-[#eef9ff]' : 'bg-white'}`}>
                <p className="text-[14px] text-slate-400 font-normal">{shortName}</p>
                <p className={`text-[18px] ${isToday ? 'text-[#00aaff] font-medium' : 'text-slate-800 font-normal'}`}>
                    {format(columnDate, 'd')}
                </p>
            </header>

            <div className={`flex-1 p-2 ${bodyBgClass}`}>
                <div className="flex flex-col gap-2">
                    {tasks.map((task) => (
                        <DraggableTask key={task.id} task={task} />
                    ))}
                </div>
            </div>
        </article>
    )
}

const DraggableTask: React.FC<{ task: CalendarTask }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
    const style = {
        transform: transform ? CSS.Translate.toString(transform) : undefined
    }

    if (isDragging) {
        return (
            <div ref={setNodeRef} className="opacity-30">
                <CalendarTaskItem id={task.id} title={task.title} colorVariant={task.colorVariant} priorityHexColor={task.priorityHexColor} />
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <CalendarTaskItem id={task.id} title={task.title} colorVariant={task.colorVariant} priorityHexColor={task.priorityHexColor} />
        </div>
    )
}

const assignmentToTask = (task: Assignment): CalendarTask => ({
    id: task.id,
    title: task.name,
    date: task.dueDate ?? '',
    colorVariant: task.priority?.name === 'High' ? 'red' : 'blue',
    priorityHexColor: task.priority?.hexColor ?? null,
})

const WeekCalendarGrid: React.FC<{ startDate: Date; tasks: CalendarTask[] }> = ({ startDate, tasks }) => {
    const dayNames = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.']

    return (
        <div className="grid grid-cols-7 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
            {dayNames.map((shortName, index) => {
                const columnDate = addDays(startDate, index)
                const isToday = isSameDay(columnDate, new Date())
                const isWeekend = index >= 5
                const bodyBgClass = isToday || isWeekend ? 'bg-slate-50' : 'bg-white'

                const tasksForThisDay = tasks.filter(task =>
                    isSameDay(parseISO(task.date), columnDate)
                )

                return (
                    <CalendarDayColumn
                        key={columnDate.toISOString()}
                        columnDate={columnDate}
                        shortName={shortName}
                        isToday={isToday}
                        bodyBgClass={bodyBgClass}
                        tasks={tasksForThisDay}
                    />
                )
            })}
        </div>
    )
}

const WeekCalendarFromQuery: React.FC<Omit<WeekCalendarProps, 'tasks'> & { selectedProjectIds: string[]; selectedPriorityIds: string[] }> = ({
    startDate,
    dueFrom,
    dueTo,
    selectedProjectIds,
    selectedPriorityIds,
}) => {
    const { data: assignments } = useAssignments({
        ProjectIds: selectedProjectIds,
        PriorityIds: selectedPriorityIds,
        Limit: 100,
        ExcludeNoDeadline: true,
        ...(dueFrom ? { DueFrom: dueFrom } : {}),
        ...(dueTo ? { DueTo: dueTo } : {}),
    })
    const items = assignments?.items ?? []

    const hasEmptyFilter = selectedProjectIds.length === 0 || selectedPriorityIds.length === 0
    const tasks = hasEmptyFilter ? [] : items
        .filter((task: Assignment) => {
            const priorityId = task.priority?.id
            return selectedProjectIds.includes(task.projectId)
                && Boolean(priorityId && selectedPriorityIds.includes(priorityId))
                && task.dueDate !== null
        })
        .map(assignmentToTask)

    return <WeekCalendarGrid startDate={startDate} tasks={tasks} />
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({
    startDate,
    dueFrom,
    dueTo,
    selectedProjectIds = [],
    selectedPriorityIds = [],
    tasks,
}) => {
    if (tasks) {
        return <WeekCalendarGrid startDate={startDate} tasks={tasks} />
    }

    return (
        <WeekCalendarFromQuery
            startDate={startDate}
            dueFrom={dueFrom}
            dueTo={dueTo}
            selectedProjectIds={selectedProjectIds}
            selectedPriorityIds={selectedPriorityIds}
        />
    )
}

export default WeekCalendar

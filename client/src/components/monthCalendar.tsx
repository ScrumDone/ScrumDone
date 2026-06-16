import React from 'react'
import { format, startOfMonth, startOfWeek, addDays, isSameDay, isSameMonth, parseISO } from 'date-fns'
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

interface MonthCalendarProps {
    currentDate: Date
    dueFrom?: string
    dueTo?: string
    selectedProjectIds?: string[]
    selectedPriorityIds?: string[]
    tasks?: CalendarTask[]
}

const DraggableTask: React.FC<{ task: CalendarTask }> = ({ task }) => {
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

const MonthDayCell: React.FC<{
    day: Date
    index: number
    currentDate: Date
    tasks: CalendarTask[]
}> = ({ day, index, currentDate, tasks }) => {
    const dateString = format(day, 'yyyy-MM-dd')
    const { setNodeRef } = useDroppable({
        id: dateString,
        data: { type: 'calendar-day', date: dateString },
    })
    const dayOfWeek = index % 7
    const isCurrentMonth = isSameMonth(day, currentDate)
    const isWeekendDay = dayOfWeek === 5 || dayOfWeek === 6
    const tasksForThisDay = tasks.filter(task =>
        isSameDay(parseISO(task.date), day)
    )

    return (
        <div
            ref={setNodeRef}
            className={`h-[120px] border-r border-b border-slate-200 last:border-r-0 p-2 flex flex-col overflow-hidden ${
                isCurrentMonth && !isWeekendDay ? 'bg-white' : 'bg-slate-50/50'
            } ${index >= 35 ? 'border-b-0' : ''}`}
        >
            <p className={`font-segoe-ui text-[13px] leading-tight font-normal ${
                isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
            } antialiased mb-1.5`}
            >
                {format(day, 'd')}
            </p>

            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                {tasksForThisDay.map((task) => (
                    <DraggableTask key={task.id} task={task} />
                ))}
            </div>
        </div>
    )
}

const MonthCalendar: React.FC<MonthCalendarProps> = ({
    currentDate,
    dueFrom,
    dueTo,
    selectedProjectIds = [],
    selectedPriorityIds = [],
    tasks,
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

    // Filtrowanie zadań zgodnie z wybranymi projektami i priorytetami
    const allTasks: CalendarTask[] = tasks ?? (hasEmptyFilter ? [] : items
        .filter((task: Assignment) => {
            const priorityId = task.priority?.id;

            const isProjectMatch = selectedProjectIds.includes(task.projectId);

            const isPriorityMatch = priorityId
                ? selectedPriorityIds.includes(priorityId)
                : false;

            return isProjectMatch && isPriorityMatch;
        })
        .filter((task): task is Assignment & { dueDate: string } => task.dueDate !== null)
        .map((task) => ({
            id: task.id,
            title: task.name,
            date: task.dueDate,
            colorVariant: task.priority?.name === 'High' ? 'red' : 'blue',
            priorityHexColor: task.priority?.hexColor ?? null
        })))

    const monthStart = startOfMonth(currentDate)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz']
    
    const days: Date[] = Array.from({ length: 42 }, (_, i) => addDays(calendarStart, i))

    return (
        <section className="flex flex-col overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-sm w-full">
            {/* Nagłówek dni tygodnia */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-white shrink-0">
                {dayNames.map((dayName) => (
                    <div key={dayName} className="border-r border-slate-200 last:border-r-0 py-4 text-center">
                        <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-700 antialiased">
                            {dayName}
                        </p>
                    </div>
                ))}
            </div>

            {/* Siatka kalendarza */}
            <div className="grid grid-cols-7 grid-rows-5">
                {days.map((day, index) => (
                    <MonthDayCell
                        key={day.toISOString()}
                        day={day}
                        index={index}
                        currentDate={currentDate}
                        tasks={allTasks}
                    />
                ))}
            </div>
        </section>
    )
}

export default MonthCalendar

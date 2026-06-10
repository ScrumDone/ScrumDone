import React from 'react'
import { format, addDays, isSameDay, parseISO } from 'date-fns'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import CalendarTaskItem from './calendarTaskItem'

type TaskColor = 'red' | 'yellow' | 'green' | 'orange' | 'blue'

interface CalendarTask {
    id: string
    title: string
    colorVariant: TaskColor
    date: string 
}

interface WeekCalendarProps {
    startDate: Date
    tasks?: CalendarTask[]
}

const DraggableTask: React.FC<{ task: CalendarTask }> = ({ task }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
    const style = { 
        transform: transform ? CSS.Translate.toString(transform) : undefined 
    }
    
    // Jeśli isDragging jest true, renderujemy ten sam komponent z przezroczystością
    if (isDragging) {
        return (
            <div ref={setNodeRef} className="opacity-30">
                <CalendarTaskItem title={task.title} colorVariant={task.colorVariant} />
            </div>
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
            <CalendarTaskItem title={task.title} colorVariant={task.colorVariant} />
        </div>
    )
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ startDate, tasks = [] }) => {
    const allTasks: CalendarTask[] = [
        ...tasks,
        { id: 'task-1', title: 'Quotes Generation Module', colorVariant: 'red', date: '2026-04-21' },
        { id: 'task-2', title: 'Database schema design', colorVariant: 'yellow', date: '2026-04-21' },
        { id: 'task-3', title: 'Real-time notifications', colorVariant: 'green', date: '2026-04-25' },
    ]

    const dayNames = ['pon.', 'wt.', 'śr.', 'czw.', 'pt.', 'sob.', 'niedz.']

    return (
        <div className="grid grid-cols-7 overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
            {dayNames.map((shortName, index) => {
                const columnDate = addDays(startDate, index)
                const dateString = format(columnDate, 'yyyy-MM-dd'); 
                const isToday = isSameDay(columnDate, new Date()) 
                const isWeekend = index >= 5
                
                const { setNodeRef } = useDroppable({ id: dateString });
                
                const bodyBgClass = isToday || isWeekend ? 'bg-slate-50' : 'bg-white'

                const tasksForThisDay = allTasks.filter(task => 
                    isSameDay(parseISO(task.date), columnDate)
                )

                return (
                    <article
                        key={columnDate.toISOString()}
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
                                {tasksForThisDay.map((task) => (
                                    <DraggableTask key={task.id} task={task} />
                                ))}
                            </div>
                        </div>
                    </article>
                )
            })}
        </div>
    )
}

export default WeekCalendar
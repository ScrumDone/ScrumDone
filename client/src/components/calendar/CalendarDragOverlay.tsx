import React from 'react'
import { DragOverlay } from '@dnd-kit/core'
import CalendarTaskItem from './CalendarTaskItem'
import { CalendarNoDeadlineTaskCard, type CalendarNoDeadlineTask } from './CalendarNoDeadlineTasks'
import type { CalendarTask } from '../../types/calendar'

interface CalendarDragOverlayProps {
    activeId: string | null
    calendarTasks: CalendarTask[]
    noDeadlineTasks: CalendarNoDeadlineTask[]
}

// Podgląd zadania "pod kursorem" w trakcie przeciągania
const CalendarDragOverlay: React.FC<CalendarDragOverlayProps> = ({ activeId, calendarTasks, noDeadlineTasks }) => {
    const activeTask = calendarTasks.find((task) => task.id === activeId)
    const activeNoDeadlineTask = noDeadlineTasks.find((task) => task.id === activeId)

    return (
        <DragOverlay dropAnimation={null}>
            {activeTask ? (
                <div className="cursor-grabbing">
                    <CalendarTaskItem id={activeTask.id} title={activeTask.title} colorVariant={activeTask.colorVariant} priorityHexColor={activeTask.priorityHexColor} />
                </div>
            ) : activeNoDeadlineTask ? (
                <div className="cursor-grabbing">
                    <CalendarNoDeadlineTaskCard task={activeNoDeadlineTask} />
                </div>
            ) : null}
        </DragOverlay>
    )
}

export default CalendarDragOverlay

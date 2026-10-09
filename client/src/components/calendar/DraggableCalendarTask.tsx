import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import CalendarTaskItem from './CalendarTaskItem'
import type { CalendarTask } from '../../types/calendar'

// Zadanie w siatce kalendarza, które można przeciągnąć na inny dzień
const DraggableCalendarTask: React.FC<{ task: CalendarTask }> = ({ task }) => {
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

export default DraggableCalendarTask

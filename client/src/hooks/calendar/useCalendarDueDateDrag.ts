import { useState } from 'react'
import { PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useUpdateAssignmentDueDate } from '../assignments/useAssignments'
import type { Assignment } from '../../types/assignment'
import type { CalendarTask } from '../../types/calendar'

type OptimisticDueDates = Record<string, string | null>

// Podmienia dueDate na wartość ustawioną przeciągnięciem, zanim serwer ją potwierdzi
export const applyOptimisticDueDate = (assignment: Assignment, optimisticDueDates: OptimisticDueDates): Assignment =>
    Object.prototype.hasOwnProperty.call(optimisticDueDates, assignment.id)
        ? { ...assignment, dueDate: optimisticDueDates[assignment.id] ?? null }
        : assignment

const getDropDueDate = (over: DragEndEvent['over']) => {
    const type = over?.data.current?.['type']
    const date = over?.data.current?.['date']

    if (type === 'calendar-day' && typeof date === 'string') {
        return { dueDate: date }
    }

    if (type === 'calendar-no-deadline') {
        return { dueDate: null }
    }

    return null
}

// Przeciąganie zadań między dniami kalendarza i sekcją "bez deadline" - wspólne dla obu kalendarzy
export function useCalendarDueDateDrag() {
    const [activeId, setActiveId] = useState<string | null>(null)
    const [optimisticDueDates, setOptimisticDueDates] = useState<OptimisticDueDates>({})
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
    const { mutate: updateDueDate } = useUpdateAssignmentDueDate()

    const handleDragStart = ({ active }: DragStartEvent) => {
        setActiveId(String(active.id))
    }

    const handleDragCancel = () => {
        setActiveId(null)
    }

    const handleDragEnd = (
        { active, over }: DragEndEvent,
        calendarTasks: CalendarTask[],
        noDeadlineTasks: { id: string }[],
    ) => {
        setActiveId(null)

        const dropTarget = getDropDueDate(over)
        if (!dropTarget) return

        const activeAssignmentId = String(active.id)
        const currentTask = calendarTasks.find((task) => task.id === activeAssignmentId)
        const currentNoDeadlineTask = noDeadlineTasks.find((task) => task.id === activeAssignmentId)

        if (dropTarget.dueDate === null && currentNoDeadlineTask) return
        if (currentTask?.date === dropTarget.dueDate) return

        setOptimisticDueDates((current) => ({
            ...current,
            [activeAssignmentId]: dropTarget.dueDate,
        }))

        updateDueDate(
            { id: activeAssignmentId, dueDate: dropTarget.dueDate },
            {
                onError: () => {
                    setOptimisticDueDates((current) => {
                        const next = { ...current }
                        delete next[activeAssignmentId]
                        return next
                    })
                },
            },
        )
    }

    return {
        sensors,
        activeId,
        optimisticDueDates,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
    }
}

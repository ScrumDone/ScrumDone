import React, { useEffect, useMemo, useRef, useState } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfDay, addDays, format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useParams } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import ProjectTopBar from '../components/ProjectTopBar'
import WeekCalendar from '../components/ProjectWeekCalendar'
import ProjectMonthCalendar from '../components/ProjectMonthCalendar'
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter'
import CalendarNoDeadlineTasks, { CalendarNoDeadlineTaskCard } from '../components/calendarNoDeadlineTasks'
import CalendarTaskItem from '../components/calendarTaskItem'
import { useProject } from '../hooks/useProject'
import { useAssignmentPriorities } from '../hooks/useAssignmentPriorities'
import { getInitialsFromName } from '../hooks/useCurrentUser'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useAssignments, useUpdateAssignmentDueDate } from '../hooks/useAssignments'
import { assignmentToCalendarTask, assignmentToNoDeadlineTask } from '../lib/assignmentMappers'

type CalendarTask = {
  id: string
  title: string
  colorVariant: 'red' | 'yellow' | 'green' | 'orange' | 'blue'
  date: string
  priorityHexColor?: string | null | undefined
}

const ProjectCalendarPage: React.FC = () => {
  const { projectId = '' } = useParams()

  const [displayMode, setDisplayMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: project } = useProject(projectId)
  const { data: priorities = [] } = useAssignmentPriorities()

  const teamMembers: PersonFilter[] = useMemo(
    () => (project?.teamMembers ?? []).map((member) => ({
      id: member.id,
      initials: getInitialsFromName(member.name),
      fullName: member.name,
    })),
    [project?.teamMembers],
  )

  const [selectedPeopleIds, setSelectedPeopleIds] = useState<string[]>([])
  const [selectedPriorityIds, setSelectedPriorityIds] = useState<string[]>([])
  const initializedPeopleProjectRef = useRef<string | null>(null)
  const initializedPrioritiesRef = useRef(false)

  useEffect(() => {
    if (!project) return

    const peopleIds = teamMembers.map((person) => person.id)

    if (initializedPeopleProjectRef.current !== projectId) {
      setSelectedPeopleIds(peopleIds)
      initializedPeopleProjectRef.current = projectId
      return
    }

    setSelectedPeopleIds((current) => current.filter((id) => peopleIds.includes(id)))
  }, [project, projectId, teamMembers])

  useEffect(() => {
    const priorityIds = priorities.map((priority) => priority.id)

    if (!initializedPrioritiesRef.current && priorityIds.length > 0) {
      setSelectedPriorityIds(priorityIds)
      initializedPrioritiesRef.current = true
      return
    }

    setSelectedPriorityIds((current) => {
      const kept = current.filter((id) => priorityIds.includes(id))
      return kept.length === current.length && kept.every((id, index) => id === current[index])
        ? current
        : kept
    })
  }, [priorities])

  useEffect(() => {
    setCurrentDate(new Date())
  }, [projectId])

  const allPeopleSelected = teamMembers.length === 0 || teamMembers.every((person) => selectedPeopleIds.includes(person.id))
  const noPeopleSelected = teamMembers.length > 0 && teamMembers.every((person) => !selectedPeopleIds.includes(person.id))
  const noPrioritiesSelected = priorities.length > 0 && priorities.every((priority) => !selectedPriorityIds.includes(priority.id))

  const dateRange = useMemo(() => {
    if (displayMode === 'week') {
      return {
        dueFrom: startOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
        dueTo: endOfWeek(currentDate, { weekStartsOn: 1 }).toISOString(),
      }
    }

    const calendarStart = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 })
    return {
      dueFrom: calendarStart.toISOString(),
      dueTo: endOfDay(addDays(calendarStart, 41)).toISOString(),
    }
  }, [currentDate, displayMode])

  const assignmentQuery = useMemo(() => ({
    ProjectIds: [projectId],
    Limit: 100,
    ExcludeNoDeadline: true,
    DueFrom: dateRange.dueFrom,
    DueTo: dateRange.dueTo,
    ...(!allPeopleSelected && !noPeopleSelected ? { AssigneeIds: selectedPeopleIds } : {}),
    ...(selectedPriorityIds.length > 0 ? { PriorityIds: selectedPriorityIds } : {}),
  }), [
    projectId,
    dateRange,
    allPeopleSelected,
    noPeopleSelected,
    selectedPeopleIds,
    selectedPriorityIds,
  ])

  const { data: assignmentsResponse } = useAssignments(assignmentQuery)
  const { data: noDeadlineAssignmentsResponse } = useAssignments({
    ProjectIds: [projectId],
    Limit: 100,
    ...(!allPeopleSelected && !noPeopleSelected ? { AssigneeIds: selectedPeopleIds } : {}),
    ...(selectedPriorityIds.length > 0 ? { PriorityIds: selectedPriorityIds } : {}),
  })

  const visibleAssignments = useMemo(() => {
    if (!assignmentsResponse) return []
    if (noPeopleSelected || noPrioritiesSelected) return []

    let items = assignmentsResponse.items

    if (!allPeopleSelected) {
      items = items.filter((assignment) =>
        assignment.assignees.some((assignee) => selectedPeopleIds.includes(assignee.id)),
      )
    }

    if (selectedPriorityIds.length > 0) {
      items = items.filter((assignment) =>
        assignment.priority && selectedPriorityIds.includes(assignment.priority.id),
      )
    }

    return items
  }, [
    assignmentsResponse,
    allPeopleSelected,
    noPeopleSelected,
    selectedPeopleIds,
    noPrioritiesSelected,
    selectedPriorityIds,
  ])

  const [optimisticDueDates, setOptimisticDueDates] = useState<Record<string, string | null>>({})

  const calendarTasks: CalendarTask[] = visibleAssignments
    .map((assignment) => Object.prototype.hasOwnProperty.call(optimisticDueDates, assignment.id)
      ? { ...assignment, dueDate: optimisticDueDates[assignment.id] ?? null }
      : assignment)
    .filter((assignment) => assignment.dueDate !== null)
    .map(assignmentToCalendarTask)
  const noDeadlineTasks = useMemo(() => {
    if (noPeopleSelected || noPrioritiesSelected) return []

    return noDeadlineAssignmentsResponse?.items
      .filter((assignment) => {
        const matchesProject = assignment.projectId === projectId
        const matchesPerson = allPeopleSelected || assignment.assignees.some((assignee) => selectedPeopleIds.includes(assignee.id))
        const matchesPriority = selectedPriorityIds.length > 0
          ? Boolean(assignment.priority?.id && selectedPriorityIds.includes(assignment.priority.id))
          : priorities.length === 0

        const dueDate = Object.prototype.hasOwnProperty.call(optimisticDueDates, assignment.id)
          ? optimisticDueDates[assignment.id] ?? null
          : assignment.dueDate

        return dueDate === null && matchesProject && matchesPerson && matchesPriority
      })
      .map(assignmentToNoDeadlineTask) ?? []
  }, [
    noDeadlineAssignmentsResponse?.items,
    noPeopleSelected,
    noPrioritiesSelected,
    projectId,
    allPeopleSelected,
    selectedPeopleIds,
    selectedPriorityIds,
    priorities.length,
    optimisticDueDates,
  ])

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))

  const { mutate: updateDueDate } = useUpdateAssignmentDueDate()

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
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

  const handleDragCancel = () => {
    setActiveId(null)
  }

  const activeTask = useMemo(() => calendarTasks.find(t => t.id === activeId), [activeId, calendarTasks])
  const activeNoDeadlineTask = useMemo(() => noDeadlineTasks.find(t => t.id === activeId), [activeId, noDeadlineTasks])

  const handlePrev = () => setCurrentDate(prev => displayMode === 'week' ? subWeeks(prev, 1) : subMonths(prev, 1))
  const handleNext = () => setCurrentDate(prev => displayMode === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1))

  const dateLabel = useMemo(() => {
    if (displayMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 })
      const end = addDays(start, 6)
      return `${format(start, 'd MMMM', { locale: pl })} - ${format(end, 'd MMMM yyyy', { locale: pl })}`
    }
    return format(currentDate, 'LLLL yyyy', { locale: pl })
  }, [currentDate, displayMode])

  const monthButtonClass = (mode: 'week' | 'month') =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${displayMode === mode ? 'bg-slate-200/50 text-slate-900' : 'bg-transparent text-slate-900 hover:text-slate-700'}`

  const togglePerson = (personId: string) => {
    setSelectedPeopleIds((current) =>
      current.includes(personId) ? current.filter((id) => id !== personId) : [...current, personId],
    )
  }

  const togglePriority = (priorityId: string) => {
    setSelectedPriorityIds((current) =>
      current.includes(priorityId) ? current.filter((id) => id !== priorityId) : [...current, priorityId],
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />
      <main className="ml-64 pt-(--app-header-h)">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
          <div className="flex w-full flex-col">
            <ProjectTopBar projectId={projectId} />
            <section className="mx-6 mt-6 pb-8">
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="min-w-0 space-y-4">
                      <div className="flex flex-col gap-4 p-0">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={handlePrev} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"><ChevronLeftIcon className="h-4 w-4" /></button>
                            <span className="font-segoe-ui text-[14px] text-slate-900 mx-1 min-w-[180px] text-center capitalize">{dateLabel}</span>
                            <button type="button" onClick={handleNext} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-100 cursor-pointer"><ChevronRightIcon className="h-4 w-4" /></button>
                          </div>
                          <div className="inline-flex rounded-xl bg-slate-100/50 p-1">
                            <button onClick={() => setDisplayMode('week')} className={monthButtonClass('week')}>Tydzień</button>
                            <button onClick={() => setDisplayMode('month')} className={monthButtonClass('month')}>Miesiąc</button>
                          </div>
                        </div>
                        <div className="mt-2">
                          {displayMode === 'week' ? <WeekCalendar startDate={startOfWeek(currentDate, { weekStartsOn: 1 })} tasks={calendarTasks} /> : <ProjectMonthCalendar currentDate={currentDate} tasks={calendarTasks} />}
                        </div>
                      </div>
                      <CalendarNoDeadlineTasks tasks={noDeadlineTasks} draggable droppable />
                    </div>
                    <aside className="flex flex-col gap-4">
                      <CalendarPeopleFilter
                        people={teamMembers}
                        title="Członkowie zespołu"
                        selectedIds={selectedPeopleIds}
                        onSelectionChange={togglePerson}
                      />
                      <section className="rounded-[10px] border border-slate-200 bg-white p-4">
                        <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Priorytet</h3>
                        <div className="flex flex-col gap-3">
                          {priorities.map((priority) => (
                            <label key={priority.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedPriorityIds.includes(priority.id)}
                                onChange={() => togglePriority(priority.id)}
                                className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                              />
                              <span
                                className="h-2 w-2 rounded-full bg-slate-300"
                                style={priority.hexColor ? { backgroundColor: priority.hexColor } : undefined}
                              />
                              <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{priority.name}</span>
                            </label>
                          ))}
                        </div>
                      </section>
                    </aside>
                  </div>
            </section>
          </div>
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
        </DndContext>
      </main>
    </div>
  )
}

export default ProjectCalendarPage

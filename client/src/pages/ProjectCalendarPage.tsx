import React, { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useParams } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/layout/SideBar'
import TopBar from '../components/layout/TopBar'
import ProjectTopBar from '../components/projects/ProjectTopBar'
import WeekCalendar from '../components/calendar/WeekCalendar'
import MonthCalendar from '../components/calendar/MonthCalendar'
import CalendarPeopleFilter, { type PersonFilter } from '../components/common/PeopleFilter'
import CalendarNoDeadlineTasks from '../components/calendar/CalendarNoDeadlineTasks'
import CalendarDragOverlay from '../components/calendar/CalendarDragOverlay'
import { useProject } from '../hooks/useProject'
import { useAssignmentPriorities } from '../hooks/useAssignmentPriorities'
import { getInitialsFromName } from '../hooks/useCurrentUser'
import { DndContext } from '@dnd-kit/core'
import { useAssignments } from '../hooks/useAssignments'
import { useCalendarAssignments } from '../hooks/useCalendarAssignments'
import { applyOptimisticDueDate, useCalendarDueDateDrag } from '../hooks/useCalendarDueDateDrag'
import { assignmentToCalendarTask, assignmentToNoDeadlineTask } from '../lib/assignmentMappers'
import type { CalendarView } from '../lib/calendarRange'
import type { CalendarTask } from '../types/calendar'

const ProjectCalendarPage: React.FC = () => {
  const { projectId = '' } = useParams()

  const [displayMode, setDisplayMode] = useState<CalendarView>('week')
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

  const assignmentFilters = useMemo(() => ({
    ProjectIds: [projectId],
    ...(!allPeopleSelected && !noPeopleSelected ? { AssigneeIds: selectedPeopleIds } : {}),
    ...(selectedPriorityIds.length > 0 ? { PriorityIds: selectedPriorityIds } : {}),
  }), [
    projectId,
    allPeopleSelected,
    noPeopleSelected,
    selectedPeopleIds,
    selectedPriorityIds,
  ])

  const { data: calendarAssignments, range } = useCalendarAssignments(displayMode, currentDate, assignmentFilters, Boolean(projectId))
  const { data: noDeadlineAssignmentsResponse } = useAssignments({ ...assignmentFilters, Limit: 100 })

  const visibleAssignments = useMemo(() => {
    if (!calendarAssignments) return []
    if (noPeopleSelected || noPrioritiesSelected) return []

    let items = calendarAssignments

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
    calendarAssignments,
    allPeopleSelected,
    noPeopleSelected,
    selectedPeopleIds,
    noPrioritiesSelected,
    selectedPriorityIds,
  ])

  const {
    sensors,
    activeId,
    optimisticDueDates,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  } = useCalendarDueDateDrag()

  const calendarTasks: CalendarTask[] = visibleAssignments
    .map((assignment) => applyOptimisticDueDate(assignment, optimisticDueDates))
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

        const { dueDate } = applyOptimisticDueDate(assignment, optimisticDueDates)

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

  const handlePrev = () => setCurrentDate(prev => displayMode === 'week' ? subWeeks(prev, 1) : subMonths(prev, 1))
  const handleNext = () => setCurrentDate(prev => displayMode === 'week' ? addWeeks(prev, 1) : addMonths(prev, 1))

  const dateLabel = useMemo(() => {
    if (displayMode === 'week') {
      const end = addDays(range.start, 6)
      return `${format(range.start, 'd MMMM', { locale: pl })} - ${format(end, 'd MMMM yyyy', { locale: pl })}`
    }
    return format(currentDate, 'LLLL yyyy', { locale: pl })
  }, [currentDate, displayMode, range.start])

  const monthButtonClass = (mode: CalendarView) =>
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
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={(event) => handleDragEnd(event, calendarTasks, noDeadlineTasks)}
          onDragCancel={handleDragCancel}
        >
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
                          {displayMode === 'week' ? <WeekCalendar startDate={range.start} tasks={calendarTasks} /> : <MonthCalendar currentDate={currentDate} tasks={calendarTasks} compact />}
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
          <CalendarDragOverlay activeId={activeId} calendarTasks={calendarTasks} noDeadlineTasks={noDeadlineTasks} />
        </DndContext>
      </main>
    </div>
  )
}

export default ProjectCalendarPage

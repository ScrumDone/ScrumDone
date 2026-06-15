import React, { useMemo, useState } from 'react'
import { startOfWeek, addDays, format, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns'
import { pl } from 'date-fns/locale'
import { useParams } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import ProjectTopBar from '../components/ProjectTopBar'
import WeekCalendar from '../components/ProjectWeekCalendar'
import ProjectMonthCalendar from '../components/ProjectMonthCalendar'
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter'
import CalendarNoDeadlineTasks from '../components/calendarNoDeadlineTasks'
import CalendarTaskItem from '../components/calendarTaskItem'
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core'
import { useAssignments, useBacklogAssignments, useUpdateAssignmentDueDate } from '../hooks/useAssignments';
import { assignmentToCalendarTask, assignmentToNoDeadlineTask } from '../lib/assignmentMappers'
import { taskDropAnimation } from '../lib/dndDropAnimation'

type CalendarTask = {
  id: string
  title: string
  colorVariant: 'red' | 'yellow' | 'green' | 'orange' | 'blue'
  date: string
}

const teamMembers: PersonFilter[] = [
  { id: 'artur-nowak', initials: 'AN', fullName: 'Artur Nowak' },
  { id: 'eryk-baczynski', initials: 'EB', fullName: 'Eryk Baczyński' },
  { id: 'maria-kowalska', initials: 'MK', fullName: 'Maria Kowalska' },
]

//Task: connect project calendar to assignments API #234
// const noDeadlineTasks: CalendarNoDeadlineTask[] = [
//   { id: 'code-refactoring-user-module', title: 'Code refactoring - user module', assigneeInitials: 'AN', assigneeName: 'Artur Nowak', accentColor: 'blue', dotColor: 'green' },
//   { id: 'documentation-update', title: 'Documentation update', assigneeInitials: 'EB', assigneeName: 'Eryk Baczyński', accentColor: 'blue', dotColor: 'orange' },
//   { id: 'e2e-testing-setup', title: 'E2E testing setup', assigneeInitials: 'EB', assigneeName: 'Eryk Baczyński', accentColor: 'blue', dotColor: 'red' },
//   { id: 'mobile-responsiveness', title: 'Mobile responsiveness', assigneeInitials: 'MK', assigneeName: 'Maria Kowalska', accentColor: 'blue', dotColor: 'orange' },
// ]

// const initialCalendarTasks: CalendarTask[] = [
//   { id: 'quotes-generation', title: 'Quotes Generation', colorVariant: 'red', date: '2026-04-07' },
//   { id: 'giveaway-campaign', title: 'Giveaway Campaign', colorVariant: 'green', date: '2026-04-09' },
// ]

const ProjectCalendarPage: React.FC = () => {
  const { projectId = '' } = useParams()

  const [displayMode, setDisplayMode] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  //Task: connect project calendar to assignments API #234
  //const [calendarTasks, setCalendarTasks] = useState<CalendarTask[]>(initialCalendarTasks)

  const weekStart = useMemo(() => startOfWeek(currentDate, { weekStartsOn: 1 }), [currentDate]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  const { data: assignmentsResponse } = useAssignments({ ProjectIds: [projectId] });
  const { data: backlogResponse } = useBacklogAssignments();

  const calendarTasks: CalendarTask[] = assignmentsResponse?.items.map(assignmentToCalendarTask) ?? [];
  const noDeadlineTasks = backlogResponse?.items.map(assignmentToNoDeadlineTask) ?? [];

  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id))
  
  const { mutate: updateDueDate } = useUpdateAssignmentDueDate();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (over && active.id !== over.id) {
      updateDueDate({ id: String(active.id), dueDate: String(over.id) });
    }
  };

  const activeTask = useMemo(() => calendarTasks.find(t => t.id === activeId), [activeId, calendarTasks])

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

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />
      <main className="ml-64 pt-(--app-header-h)">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                          {displayMode === 'week' ? <WeekCalendar dueFrom={weekStart.toISOString()} dueTo={weekEnd.toISOString()} startDate={startOfWeek(currentDate, { weekStartsOn: 1 })} tasks={calendarTasks} /> : <ProjectMonthCalendar currentDate={currentDate} tasks={calendarTasks} />}
                        </div>
                      </div>
                      <CalendarNoDeadlineTasks tasks={noDeadlineTasks} />
                    </div>
                    <aside className="flex flex-col gap-4">
                      <CalendarPeopleFilter people={teamMembers} title="Członkowie zespołu" />
                      <section className="rounded-[10px] border border-slate-200 bg-white p-4">
                        <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Priorytet</h3>
                        <div className="flex flex-col gap-3">
                          {[{ id: 'wysoki', label: 'Wysoki', colorClass: 'bg-scrumdone-red-500' }, { id: 'sredni', label: 'Średni', colorClass: 'bg-scrumdone-yellow-500' }, { id: 'niski', label: 'Niski', colorClass: 'bg-scrumdone-green-500' }].map((option) => (
                            <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer" />
                              <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
                              <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </section>
                    </aside>
                  </div>
            </section>
          </div>
          <DragOverlay dropAnimation={taskDropAnimation}>
            {activeTask ? (
              <div className="cursor-grabbing">
                <CalendarTaskItem id={activeTask.id} title={activeTask.title} colorVariant={activeTask.colorVariant} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  )
}

export default ProjectCalendarPage
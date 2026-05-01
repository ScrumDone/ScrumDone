import React, { useMemo, useState } from 'react'
import { startOfWeek } from 'date-fns'
import { useParams } from 'react-router-dom'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import ProjectTopBar from '../components/ProjectTopBar'
import WeekCalendar from '../components/weekCalendar'
import CalendarPeopleFilter, { type PersonFilter } from '../components/calendarPeopleFilter'
import CalendarNoDeadlineTasks, { type CalendarNoDeadlineTask } from '../components/calendarNoDeadlineTasks'
import { projects } from '../data/projects'

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

const noDeadlineTasks: CalendarNoDeadlineTask[] = [
  {
    id: 'code-refactoring-user-module',
    title: 'Code refactoring - user module',
    assigneeInitials: 'AN',
    assigneeName: 'Artur Nowak',
    accentColor: 'blue',
    dotColor: 'green',
  },
  {
    id: 'documentation-update',
    title: 'Documentation update',
    assigneeInitials: 'EB',
    assigneeName: 'Eryk Baczyński',
    accentColor: 'blue',
    dotColor: 'orange',
  },
  {
    id: 'e2e-testing-setup',
    title: 'E2E testing setup',
    assigneeInitials: 'EB',
    assigneeName: 'Eryk Baczyński',
    accentColor: 'blue',
    dotColor: 'red',
  },
  {
    id: 'mobile-responsiveness',
    title: 'Mobile responsiveness',
    assigneeInitials: 'MK',
    assigneeName: 'Maria Kowalska',
    accentColor: 'blue',
    dotColor: 'orange',
  },
]

const calendarTasks: CalendarTask[] = [
  {
    id: 'quotes-generation',
    title: 'Quotes Generation',
    colorVariant: 'red',
    date: '2026-04-07',
  },
  {
    id: 'giveaway-campaign',
    title: 'Giveaway Campaign',
    colorVariant: 'green',
    date: '2026-04-09',
  },
]

const ProjectCalendarPage: React.FC = () => {
  const { projectSlug } = useParams()
  const project = projects.find((item) => item.slug === projectSlug)
  const [displayMode, setDisplayMode] = useState<'week' | 'month'>('week')

  const startDate = useMemo(() => startOfWeek(new Date(2026, 3, 6), { weekStartsOn: 1 }), [])

  // KLUCZOWA ZMIANA: Bardzo delikatne kolory dla przycisków
  const monthButtonClass = (mode: 'week' | 'month') =>
    `rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
      displayMode === mode 
        ? 'bg-slate-200/50 text-slate-900' // Aktywny: lekko ciemniejszy od kontenera (slate-200 z przezroczystością)
        : 'bg-transparent text-slate-900 hover:text-slate-700'
    }`

  return (
    <div className="min-h-screen w-full bg-[#F9FAFB]">
      <SideBar />
      <TopBar />

      <main className="ml-64 pt-(--app-header-h)">
        <div className="flex w-full flex-col">
          {project ? (
            <>
              <ProjectTopBar project={project} viewMode="scrum" />

              <section className="mx-6 mt-6 pb-8">
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
                  <div className="min-w-0 space-y-4">
                    <div className="flex flex-col gap-4 p-0">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        
                        <div className="flex items-center gap-2">
                          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-100 cursor-pointer">
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>
                          <span className="font-segoe-ui text-[14px] leading-5 text-slate-900 mx-1">
                            6 kwietnia - 12 kwietnia 2026
                          </span>
                          <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-900 transition-colors hover:bg-slate-100 cursor-pointer">
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>

                        {/* ZMIANA: bg-slate-100/50 sprawia, że zewnętrzny prostokąt jest niemal biały, ale odcina się od tła strony */}
                        <div className="inline-flex rounded-xl bg-slate-100/50 p-1">
                          <button
                            type="button"
                            onClick={() => setDisplayMode('week')}
                            className={monthButtonClass('week')}
                          >
                            Tydzień
                          </button>
                          <button
                            type="button"
                            onClick={() => setDisplayMode('month')}
                            className={monthButtonClass('month')}
                          >
                            Miesiąc
                          </button>
                        </div>
                      </div>

                      <div className="mt-2">
                        <WeekCalendar startDate={startDate} tasks={calendarTasks} />
                      </div>
                    </div>

                    <CalendarNoDeadlineTasks tasks={noDeadlineTasks} />
                  </div>

                  <aside className="flex flex-col gap-4">
                    <CalendarPeopleFilter people={teamMembers} title="Członkowie zespołu" />

                    <section className="rounded-[10px] border border-slate-200 bg-white p-4">
                      <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Priorytet</h3>
                      <div className="flex flex-col gap-3">
                        {[
                          { id: 'wysoki', label: 'Wysoki', colorClass: 'bg-scrumdone-red-500' },
                          { id: 'sredni', label: 'Średni', colorClass: 'bg-scrumdone-yellow-500' },
                          { id: 'niski', label: 'Niski', colorClass: 'bg-scrumdone-green-500' },
                        ].map((option) => (
                          <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900 cursor-pointer"
                            />
                            <span className={`h-2 w-2 rounded-full ${option.colorClass}`} />
                            <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </section>
                  </aside>
                </div>
              </section>
            </>
          ) : (
            <section className="mx-8 mt-6 rounded-[14px] border border-red-200 bg-white p-6 text-red-700">
              Nie znaleziono projektu o podanym adresie.
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectCalendarPage
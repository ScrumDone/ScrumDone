import React from 'react'
// import CalendarPeopleFilter, { type PersonFilter } from './calendarPeopleFilter'
import type { PersonFilter } from './calendarPeopleFilter'
import type { ProjectListItem } from '../types/project'
import type { AssignmentPriority } from '../types/assignment'

type CalendarMode = 'Personal' | 'Team'

interface FilterOption {
    id: string
    label: string
    colorClass: string
    hexColor?: string | null
}

interface FilterSectionProps {
    title: string
    options: FilterOption[]
    selectedIds: string[]
    onToggle: (id: string) => void
}

interface CalendarFiltersProps {
    mode: CalendarMode
    projects: ProjectListItem[]
    priorities: AssignmentPriority[]
    people: PersonFilter[]

    selectedProjectIds: string[]
    onToggleProject: (id: string) => void
    selectedPriorityIds: string[]
    onTogglePriority: (id: string) => void
}

const FilterSection: React.FC<FilterSectionProps> = ({ title, options, selectedIds, onToggle }) => {
    return (
        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">{title}</h3>
            <div className="flex flex-col gap-3">
                {options.map((option) => (
                    <label key={option.id} className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedIds.includes(option.id)}
                            onChange={() => onToggle(option.id)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 accent-slate-900"
                            aria-label={option.label}
                        />
                        <span
                            className={`h-2 w-2 rounded-full ${option.colorClass}`}
                            style={option.hexColor ? { backgroundColor: option.hexColor } : undefined}
                        />
                        <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{option.label}</span>
                    </label>
                ))}
            </div>
        </section>
    )
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
    mode: _mode,
    projects,
    priorities,
    people: _people,
    selectedPriorityIds,
    selectedProjectIds,
    onTogglePriority,
    onToggleProject,
}) => {
    const projectOptions: FilterOption[] = projects.map(p => ({
        id: p.id,
        label: p.name,
        colorClass: 'bg-slate-400'
    }))

    const priorityOptions: FilterOption[] = priorities.map(p => ({
        id: p.id,
        label: p.name,
        colorClass: 'bg-slate-400',
        hexColor: p.hexColor
    }))

    return (
        <aside className="flex w-44 flex-col gap-3 pr-1">
            {/*
            {mode === 'Team' ? <CalendarPeopleFilter people={people} /> : null}
            */}

            <FilterSection
                title="Projekty"
                options={projectOptions}
                selectedIds={selectedProjectIds}
                onToggle={onToggleProject}
            />

            <FilterSection
                title="Priorytet"
                options={priorityOptions}
                selectedIds={selectedPriorityIds}
                onToggle={onTogglePriority}
            />
        </aside>
    )
}

export default CalendarFilters

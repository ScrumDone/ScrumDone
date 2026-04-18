import React, { useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import Avatar from './Avatar'

export interface PersonFilter {
    id: string
    initials: string
    fullName: string
}

interface CalendarPeopleFilterProps {
    people: PersonFilter[]
}

const CalendarPeopleFilter: React.FC<CalendarPeopleFilterProps> = ({ people }) => {
    const [selectedPeople, setSelectedPeople] = useState<Record<string, boolean>>(
        () => Object.fromEntries(people.map((person) => [person.id, true])),
    )

    const togglePerson = (personId: string) => {
        setSelectedPeople((current) => ({
            ...current,
            [personId]: !current[personId],
        }))
    }

    return (
        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">Osoby</h3>
            <div className="flex flex-col gap-3">
                {people.map((person) => {
                    const isSelected = selectedPeople[person.id]

                    return (
                        <button
                            key={person.id}
                            type="button"
                            onClick={() => togglePerson(person.id)}
                            className="flex items-center gap-3 text-left"
                            aria-pressed={isSelected}
                        >
                            <span className={`flex h-8 w-8 items-center justify-center rounded-[10px] border transition-colors ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                                <CheckIcon className="h-5 w-5" strokeWidth={2.5} />
                            </span>
                            <Avatar initials={person.initials} size="md" />
                            <span className="font-segoe-ui text-[14px] leading-5 text-black antialiased">{person.fullName}</span>
                        </button>
                    )
                })}
            </div>
        </section>
    )
}

export default CalendarPeopleFilter

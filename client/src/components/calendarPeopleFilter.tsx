import React, { useEffect, useState } from 'react'
import { CheckIcon } from '@heroicons/react/24/outline'
import Avatar from './Avatar'

export interface PersonFilter {
    id: string
    initials: string
    fullName: string
}

interface CalendarPeopleFilterProps {
    people: PersonFilter[]
    title?: string
    selectedPeople?: Record<string, boolean>
    onSelectedPeopleChange?: (selected: Record<string, boolean>) => void
}

const CalendarPeopleFilter: React.FC<CalendarPeopleFilterProps> = ({
    people,
    title = 'Osoby',
    selectedPeople,
    onSelectedPeopleChange,
}) => {
    const isControlled = selectedPeople !== undefined && onSelectedPeopleChange !== undefined

    const [internalSelected, setInternalSelected] = useState<Record<string, boolean>>(
        () => Object.fromEntries(people.map((person) => [person.id, true])),
    )

    useEffect(() => {
        if (isControlled) return

        setInternalSelected((current) => {
            const next = { ...current }
            people.forEach((person) => {
                if (!(person.id in next)) {
                    next[person.id] = true
                }
            })
            return next
        })
    }, [people, isControlled])

    const currentSelected = isControlled ? selectedPeople : internalSelected

    const togglePerson = (personId: string) => {
        const next = Object.fromEntries(
            people.map((person) => [
                person.id,
                person.id === personId
                    ? currentSelected[person.id] !== true
                    : currentSelected[person.id] === true,
            ]),
        )

        if (isControlled) {
            onSelectedPeopleChange(next)
            return
        }

        setInternalSelected(next)
    }

    return (
        <section className="rounded-[10px] border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-segoe-ui text-[18px] leading-7 font-normal text-slate-900 antialiased">{title}</h3>
            {people.length === 0 ? (
                <p className="font-segoe-ui text-[14px] leading-5 text-slate-500 antialiased">Brak członków zespołu.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {people.map((person) => {
                        const isSelected = currentSelected[person.id] === true

                        return (
                            <button
                                key={person.id}
                                type="button"
                                onClick={() => togglePerson(person.id)}
                                className="flex items-center gap-2 text-left"
                                aria-pressed={isSelected}
                            >
                                <span className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-transparent'}`}>
                                    <CheckIcon className="h-3 w-3" strokeWidth={2.5} />
                                </span>
                                <Avatar initials={person.initials} size="xs" />
                                <span className="font-segoe-ui text-[14px] leading-5 font-medium text-black antialiased">{person.fullName}</span>
                            </button>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export default CalendarPeopleFilter

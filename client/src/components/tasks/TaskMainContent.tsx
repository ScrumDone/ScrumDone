import { useEffect, useRef, useState } from 'react'
import {
  CheckIcon,
  ChevronDownIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import type { Assignment, UpdateAssignmentDto } from '../../types/assignment'
import { useUpdateAssignment } from '../../hooks/assignments/useUpdateAssignment'

interface TaskMainContentProps {
  assignment: Assignment
}

const NAME_MAX_LENGTH = 100
const DESCRIPTION_MAX_LENGTH = 1000

export const TaskMainContent: React.FC<TaskMainContentProps> = ({ assignment }) => {
  const menuRef = useRef<HTMLDivElement>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(assignment.name)
  const [descriptionDraft, setDescriptionDraft] = useState(assignment.description ?? '')
  const [nameError, setNameError] = useState<string | null>(null)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const { mutate: updateAssignment, isPending: isSaving } = useUpdateAssignment()

  useEffect(() => {
    if (!isEditing) {
      setNameDraft(assignment.name)
      setDescriptionDraft(assignment.description ?? '')
    }
  }, [assignment.name, assignment.description, isEditing])

  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMenuOpen])

  const startEditing = () => {
    setNameDraft(assignment.name)
    setDescriptionDraft(assignment.description ?? '')
    setNameError(null)
    setDescriptionError(null)
    setSaveError(null)
    setIsEditing(true)
    setIsMenuOpen(false)
  }

  const cancelEditing = () => {
    setNameDraft(assignment.name)
    setDescriptionDraft(assignment.description ?? '')
    setNameError(null)
    setDescriptionError(null)
    setSaveError(null)
    setIsEditing(false)
  }

  const save = () => {
    const trimmedName = nameDraft.trim()
    let hasError = false

    if (!trimmedName) {
      setNameError('Nazwa zadania jest wymagana.')
      hasError = true
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      setNameError(`Nazwa może mieć maksymalnie ${NAME_MAX_LENGTH} znaków.`)
      hasError = true
    } else {
      setNameError(null)
    }

    if (descriptionDraft.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(`Opis może mieć maksymalnie ${DESCRIPTION_MAX_LENGTH} znaków.`)
      hasError = true
    } else {
      setDescriptionError(null)
    }

    if (hasError) {
      return
    }

    const nameChanged = trimmedName !== assignment.name
    const descriptionChanged = descriptionDraft !== (assignment.description ?? '')

    if (!nameChanged && !descriptionChanged) {
      setIsEditing(false)
      setSaveError(null)
      return
    }

    const data: UpdateAssignmentDto = {}
    if (nameChanged) data.name = trimmedName
    if (descriptionChanged) data.description = descriptionDraft

    setSaveError(null)
    updateAssignment(
      { id: assignment.id, data },
      {
        onSuccess: () => {
          setIsEditing(false)
          setNameError(null)
          setDescriptionError(null)
          setSaveError(null)
        },
        onError: () => {
          setSaveError('Nie udało się zapisać zmian. Spróbuj ponownie.')
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-[34px] font-semibold text-black">{assignment.name}</h1>
      </div>

      <section
        className={`rounded-xl border bg-white p-5 transition-colors ${
          isEditing
            ? 'border-scrumdone-blue-main ring-4 ring-scrumdone-blue-main/10'
            : 'border-slate-200'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <div className="relative top-[5px]">
              <ChevronDownIcon className="h-5 w-5 stroke-[2.5] text-black" />
            </div>

            <h2 className="text-[20px] leading-[30px] font-medium text-black">Opis</h2>

            {isEditing ? (
              <span className="text-sm font-medium text-scrumdone-blue-main">— tryb edycji</span>
            ) : null}
          </div>

          {isEditing ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <XMarkIcon className="h-4 w-4" />
                Anuluj
              </button>
              <button
                type="button"
                onClick={save}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-lg bg-scrumdone-blue-main px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-[#00A0DD] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckIcon className="h-4 w-4" />
                Zapisz
              </button>
            </div>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                aria-label="Opcje opisu"
                aria-expanded={isMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsMenuOpen((open) => !open)}
                className={`cursor-pointer rounded-md p-1 transition-colors ${
                  isMenuOpen
                    ? 'bg-slate-100 text-slate-900 ring-1 ring-slate-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <EllipsisVerticalIcon className="h-5 w-5" />
              </button>

              {isMenuOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-1 min-w-[100px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={startEditing}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edytuj
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div>
          {isEditing ? (
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <label
                  htmlFor="assignment-name"
                  className="mb-1.5 block text-[13px] text-slate-500"
                >
                  Nazwa zadania
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="assignment-name"
                    value={nameDraft}
                    onChange={(event) => {
                      setNameDraft(event.target.value)
                      setNameError(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        save()
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelEditing()
                      }
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 py-2 text-[15px] text-slate-800 outline-none focus:border-scrumdone-blue-main focus:bg-white"
                  />
                  <button
                    type="button"
                    aria-label="Wyczyść nazwę"
                    onClick={() => setNameDraft('')}
                    className="shrink-0 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                {nameError ? <p className="mt-1.5 text-sm text-red-600">{nameError}</p> : null}
              </div>

              <div>
                <label
                  htmlFor="assignment-description"
                  className="mb-1.5 block text-[13px] text-slate-500"
                >
                  Opis
                </label>
                <div className="flex items-start gap-2">
                  <textarea
                    id="assignment-description"
                    value={descriptionDraft}
                    onChange={(event) => {
                      setDescriptionDraft(event.target.value)
                      setDescriptionError(null)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelEditing()
                      }
                    }}
                    rows={4}
                    className="min-h-28 min-w-0 flex-1 resize-y rounded-lg border border-slate-200 bg-[#F9FAFB] px-3 py-2 text-[15px] text-slate-700 outline-none focus:border-scrumdone-blue-main focus:bg-white"
                  />
                  <button
                    type="button"
                    aria-label="Wyczyść opis"
                    onClick={() => setDescriptionDraft('')}
                    className="mt-1 shrink-0 rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                {descriptionError ? (
                  <p className="mt-1.5 text-sm text-red-600">{descriptionError}</p>
                ) : null}
              </div>

              {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
            </div>
          ) : (
            <div className="mb-6 text-[15px] text-slate-600">{assignment.description}</div>
          )}

          <div className="flex gap-6">
            <AttachmentCard name="screenshot-1.png" date="05.04.2026" />
            <AttachmentCard name="screenshot-2.png" date="05.04.2026" />
          </div>
        </div>
      </section>
    </div>
  )
}

const AttachmentCard = ({ name, date }: { name: string; date: string }) => (
  <div className="group w-24 cursor-pointer">
    <div className="mb-2 h-24 w-24 overflow-hidden rounded-lg bg-slate-100">
      <img
        src="/image17.png"
        alt={name}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
    </div>
    <div className="space-y-0.5">
      <p className="truncate text-[11px] font-medium text-slate-500">{name}</p>
      <p className="text-[11px] text-slate-400">{date}</p>
    </div>
  </div>
)

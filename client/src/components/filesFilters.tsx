import React, { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon, TagIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

export type FileType =
    | 'PDF'
    | 'Word'
    | 'Excel'
    | 'PowerPoint'
    | 'Obrazy (PNG)'
    | 'Obrazy (JPG)'
    | 'SVG'
    | 'Archiwa'

export interface FileItem {
    id: number
    name: string
    project: string | null
    type: FileType
    tags: string[]
}

interface SelectFilterProps {
    labelAll: string
    options: string[]
    selected: string
    onSelect: (value: string) => void
}

interface FilesFiltersProps {
    files: FileItem[]
    onFilteredFilesChange: (files: FileItem[]) => void
}

const normalize = (text: string): string => text.toLocaleLowerCase('pl-PL')

const SelectFilter: React.FC<SelectFilterProps> = ({ labelAll, options, selected, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleSelect = (value: string) => {
        onSelect(value)
        setIsOpen(false)
    }

    return (
        <div className="relative min-w-70 flex-1">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="h-16 w-full rounded-2xl border border-slate-200 bg-[#F3F4F6] px-6 text-left shadow-sm transition hover:border-slate-300"
            >
                <span className="flex items-center justify-between">
                    <span className="font-segoe-ui text-[clamp(20px,2.2vw,42px)] leading-none font-semibold text-[#111827]">
                        {selected || labelAll}
                    </span>
                    <ChevronDownIcon className="h-7 w-7 text-slate-400" />
                </span>
            </button>

            {isOpen ? (
                <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <button
                        type="button"
                        onClick={() => handleSelect('')}
                        className="flex w-full items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-left text-2xl text-[#111827] transition hover:bg-slate-200"
                    >
                        <span>{labelAll}</span>
                        {selected === '' ? <span className="text-slate-500">✓</span> : null}
                    </button>
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-2xl text-[#111827] transition hover:bg-slate-100"
                        >
                            <span>{option}</span>
                            {selected === option ? <span className="text-slate-500">✓</span> : null}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

const FilesFilters: React.FC<FilesFiltersProps> = ({ files, onFilteredFilesChange }) => {
    const [searchValue, setSearchValue] = useState('')
    const [selectedProject, setSelectedProject] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const projects = useMemo(
        () => Array.from(new Set(files.map((file) => file.project ?? 'Bez projektu'))),
        [files],
    )

    const fileTypes = useMemo(() => Array.from(new Set(files.map((file) => file.type))), [files])

    const tags = useMemo(() => {
        const allTags = files.flatMap((file) => file.tags)
        return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b, 'pl-PL'))
    }, [files])

    const filteredFiles = useMemo(() => {
        const normalizedSearch = normalize(searchValue.trim())

        return files.filter((file) => {
            const projectName = file.project ?? 'Bez projektu'
            const matchesSearch = normalizedSearch.length === 0 || normalize(file.name).includes(normalizedSearch)
            const matchesProject = selectedProject.length === 0 || projectName === selectedProject
            const matchesType = selectedType.length === 0 || file.type === selectedType
            const matchesTags = selectedTags.every((tag) => file.tags.includes(tag))

            return matchesSearch && matchesProject && matchesType && matchesTags
        })
    }, [files, searchValue, selectedProject, selectedType, selectedTags])

    useEffect(() => {
        onFilteredFilesChange(filteredFiles)
    }, [filteredFiles, onFilteredFilesChange])

    const toggleTag = (tag: string) => {
        setSelectedTags((current) =>
            current.includes(tag)
                ? current.filter((item) => item !== tag)
                : [...current, tag],
        )
    }

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4 xl:flex-row">
                <div className="relative flex-2">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-7 w-7 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Szukaj plików..."
                        className="h-16 w-full rounded-2xl border border-slate-200 bg-[#F3F4F6] pl-14 pr-4 text-2xl text-[#111827] outline-none placeholder:text-slate-500 focus:border-slate-300"
                    />
                </div>

                <SelectFilter
                    labelAll="Wszystkie projekty"
                    options={projects}
                    selected={selectedProject}
                    onSelect={setSelectedProject}
                />

                <SelectFilter
                    labelAll="Wszystkie typy"
                    options={fileTypes}
                    selected={selectedType}
                    onSelect={setSelectedType}
                />
            </div>

            <div className="my-6 border-t border-slate-200" />

            <div>
                <h2 className="mb-4 flex items-center gap-2 font-segoe-ui text-2xl font-semibold text-slate-700">
                    <TagIcon className="h-6 w-6 text-slate-500" />
                    Tagi:
                </h2>

                <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => {
                        const isActive = selectedTags.includes(tag)
                        return (
                            <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className={`rounded-full border px-5 py-2 text-[clamp(18px,1.3vw,32px)] leading-none transition ${
                                    isActive
                                        ? 'border-slate-700 bg-white text-slate-900 shadow-[0_0_0_2px_rgba(15,23,42,0.35)]'
                                        : 'border-slate-100 bg-[#F3F4F6] text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {tag}
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default FilesFilters

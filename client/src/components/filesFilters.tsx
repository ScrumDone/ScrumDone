import React, { useEffect, useMemo, useState } from 'react'
import { MagnifyingGlassIcon, TagIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline'

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
        <div className="relative flex-1">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="h-9 w-full rounded-lg  bg-[#F3F4F6] px-3 py-2 text-left transition hover:border-slate-300"
            >
                <span className="flex items-center justify-between">
                    <span className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] font-medium text-[#0A0A0A]">
                        {selected || labelAll}
                    </span>
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                </span>
            </button>

            {isOpen ? (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                    <button
                        type="button"
                        onClick={() => handleSelect('')}
                        className="flex h-10 w-full items-center justify-between rounded-md bg-[#F3F4F6] px-3 py-2 text-left font-segoe-ui text-sm leading-5 tracking-[-0.15px] font-medium text-[#0A0A0A] transition hover:bg-slate-200"
                    >
                        <span>{labelAll}</span>
                        {selected === '' ? <span className="text-sm text-slate-500">✓</span> : null}
                    </button>
                    {options.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => handleSelect(option)}
                            className="mt-1 flex h-10 w-full items-center justify-between rounded-md px-3 py-2 text-left font-segoe-ui text-sm leading-5 tracking-[-0.15px] font-medium text-[#0A0A0A] transition hover:bg-slate-100"
                        >
                            <span>{option}</span>
                            {selected === option ? <span className="text-sm text-slate-500">✓</span> : null}
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
        <section className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex flex-col gap-4 xl:flex-row">
                <div className="relative flex-2">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Szukaj plików..."
                        className="h-9 w-full rounded-lg border border-transparent bg-[#F3F5F5] py-1 pl-9 pr-3 font-segoe-ui text-sm leading-5 tracking-[-0.15px] font-regular text-[#0A0A0A] outline-none placeholder:text-slate-500 focus:border-slate-300 focus:border-2"
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

            <div className="my-4 border-t border-slate-200" />

            <div>
                <h2 className="mb-4 flex items-center gap-2 font-segoe-ui text-sm leading-5 font-medium tracking-[-0.15px]  text-slate-700">
                    <TagIcon className="h-4 w-4 text-slate-500" />
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
                                className={`rounded-full  px-3 py-2 text-[12px] leading-4 text-regular transition ${
                                    isActive
                                        ? ' bg-scrumdone-blue-main text-white '
                                        : 'bg-[#F3F4F6] text-slate-700 hover:border-slate-300'
                                }`}
                            >
                                {tag}
                            </button>
                        )
                    })}
                </div>

                {selectedTags.length > 0 ? (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-slate-600">
                            Wybrane tagi:
                        </span>

                        {selectedTags.map((tag) => (
                            <button
                                key={`selected-${tag}`}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-segoe-ui text-sm leading-5 tracking-[-0.15px] text-[#0A0A0A] transition hover:bg-slate-50"
                            >
                                <span>{tag}</span>
                                <XMarkIcon className="h-4 w-4 text-[#0A0A0A]" />
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    )
}

export default FilesFilters
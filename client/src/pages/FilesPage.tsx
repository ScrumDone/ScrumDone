import React, { useMemo, useState } from 'react'
import { MagnifyingGlassIcon, TagIcon, ChevronDownIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'

type FileType =
    | 'PDF'
    | 'Word'
    | 'Excel'
    | 'PowerPoint'
    | 'Obrazy (PNG)'
    | 'Obrazy (JPG)'
    | 'SVG'
    | 'Archiwa'

interface FileItem {
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

const FILES: FileItem[] = [
    { id: 1, name: 'Brief UX nowego dashboardu.pdf', project: 'Adoddle', type: 'PDF', tags: ['UX', 'design', 'specyfikacja'] },
    { id: 2, name: 'Mapa procesu sprzedaży.xlsx', project: 'Nexus', type: 'Excel', tags: ['sprzedaż', 'harmonogram', 'zarządzanie'] },
    { id: 3, name: 'Umowa ramowa klienta.docx', project: 'Hadar', type: 'Word', tags: ['umowa', 'prawne', 'kontrakt'] },
    { id: 4, name: 'Mockup mobile onboarding.png', project: 'Adoddle', type: 'Obrazy (PNG)', tags: ['mockup', 'mobile', 'grafika'] },
    { id: 5, name: 'Logo startupu.svg', project: 'Nexus', type: 'SVG', tags: ['logo', 'branding'] },
    { id: 6, name: 'Wytyczne bezpieczeństwa.pdf', project: null, type: 'PDF', tags: ['bezpieczeństwo', 'techniczne', 'dokumentacja'] },
    { id: 7, name: 'Faktura marzec 2026.pdf', project: 'Adoddle', type: 'PDF', tags: ['faktura', 'finanse'] },
    { id: 8, name: 'Plan sprintu Q2.pptx', project: 'Hadar', type: 'PowerPoint', tags: ['plan', 'prezentacja', 'zarządzanie'] },
    { id: 9, name: 'Archiwum screenshotow.zip', project: null, type: 'Archiwa', tags: ['screenshot', 'backup'] },
    { id: 10, name: 'Wireframe checkout.jpg', project: 'Nexus', type: 'Obrazy (JPG)', tags: ['wireframe', 'UI', 'UX'] },
]

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

const FilesPage: React.FC = () => {
    const [searchValue, setSearchValue] = useState('')
    const [selectedProject, setSelectedProject] = useState('')
    const [selectedType, setSelectedType] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])

    const projects = useMemo(
        () => Array.from(new Set(FILES.map((file) => file.project ?? 'Bez projektu'))),
        [],
    )

    const fileTypes = useMemo(() => Array.from(new Set(FILES.map((file) => file.type))), [])

    const tags = useMemo(() => {
        const allTags = FILES.flatMap((file) => file.tags)
        return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b, 'pl-PL'))
    }, [])

    const filteredFiles = useMemo(() => {
        const normalizedSearch = normalize(searchValue.trim())

        return FILES.filter((file) => {
            const projectName = file.project ?? 'Bez projektu'
            const matchesSearch = normalizedSearch.length === 0 || normalize(file.name).includes(normalizedSearch)
            const matchesProject = selectedProject.length === 0 || projectName === selectedProject
            const matchesType = selectedType.length === 0 || file.type === selectedType
            const matchesTags = selectedTags.every((tag) => file.tags.includes(tag))

            return matchesSearch && matchesProject && matchesType && matchesTags
        })
    }, [searchValue, selectedProject, selectedType, selectedTags])

    const toggleTag = (tag: string) => {
        setSelectedTags((current) =>
            current.includes(tag)
                ? current.filter((item) => item !== tag)
                : [...current, tag],
        )
    }

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto max-w-7xl px-8 py-8">
                    <h1 className="mb-6 font-segoe-ui text-[1.5rem] leading-8 font-normal text-black antialiased">Pliki</h1>

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

                    <section className="mt-6 rounded-3xl border border-slate-200 bg-white">
                        {filteredFiles.length > 0 ? (
                            <ul className="divide-y divide-slate-200">
                                {filteredFiles.map((file) => (
                                    <li key={file.id} className="flex flex-col gap-3 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <p className="font-segoe-ui text-lg font-medium text-slate-900">{file.name}</p>
                                            <p className="text-sm text-slate-500">
                                                Projekt: {file.project ?? 'Bez projektu'} | Typ: {file.type}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {file.tags.map((tag) => (
                                                <span key={`${file.id}-${tag}`} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center px-6 py-12 text-center">
                                <DocumentTextIcon className="mb-4 h-14 w-14 text-slate-400" />
                                <h3 className="text-xl font-semibold text-slate-800">Brak plików dla wybranych filtrów</h3>
                                <p className="mt-2 max-w-xl text-slate-600">Zmień wyszukiwaną nazwę, projekt, typ lub odznacz część tagów.</p>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}

export default FilesPage

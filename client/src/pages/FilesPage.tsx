import React, { useState } from 'react'
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import FilesFilters, { type FileItem } from '../components/filesFilters'
import FileAddModal, { type FileDraft } from '../components/FileAddModal'

const INITIAL_FILES: FileItem[] = [
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

const FilesPage: React.FC = () => {
    const [allFiles, setAllFiles] = useState<FileItem[]>(INITIAL_FILES)
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>(INITIAL_FILES)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleSaveFile = (draft: FileDraft) => {
        const fileExtension = draft.name.split('.').pop()?.toUpperCase() || 'NIEZNANY'

        let fileType: string = fileExtension
        if (fileExtension === 'PNG') fileType = 'Obrazy (PNG)'
        if (fileExtension === 'JPG' || fileExtension === 'JPEG') fileType = 'Obrazy (JPG)'
        if (fileExtension === 'XLSX' || fileExtension === 'XLS') fileType = 'Excel'
        if (fileExtension === 'DOCX' || fileExtension === 'DOC') fileType = 'Word'
        if (fileExtension === 'PPTX' || fileExtension === 'PPT') fileType = 'PowerPoint'
        if (fileExtension === 'ZIP' || fileExtension === 'RAR') fileType = 'Archiwa'

        const newFileItem: FileItem = {
            id: Date.now(),
            name: draft.name,
            project: draft.projectName || null,
            type: fileType as FileItem['type'],
            tags: draft.tags,
        }

        setAllFiles((prev) => [newFileItem, ...prev])
        setFilteredFiles((prev) => [newFileItem, ...prev])
        
        setIsModalOpen(false)
    }

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto max-w-7xl px-8 py-8">
                    
                    <div className="flex items-center justify-between mb-10">
                        <h1 className="font-segoe-ui text-black text-[1.5rem] leading-8 font-normal tracking-tight antialiased">
                            Pliki
                        </h1>
                        
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(true)} 
                            className="h-9 px-4 bg-scrumdone-blue-main hover:bg-[#00A0DD] text-white rounded-lg inline-flex items-center justify-center gap-2 text-sm font-medium leading-2.5 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                        >
                            <PlusIcon className="w-4 h-4 stroke-2" />
                            Dodaj plik
                        </button>
                    </div>

                    <FilesFilters files={allFiles} onFilteredFilesChange={setFilteredFiles} />

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

            <FileAddModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveFile}
            />
        </div>
    )
}

export default FilesPage
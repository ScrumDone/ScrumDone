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
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <h1 className="font-segoe-ui text-[1.5rem] leading-8 font-normal text-black antialiased">Pliki</h1>
                    </div>
                    <FilesFilters files={files} onFilteredFilesChange={setFilteredFiles} />
                    <section className="mt-6">
                        {filteredFiles.length > 0 ? (
                            <ul className="flex flex-col gap-4">
                                {filteredFiles.map((file) => <FileCard key={file.id} file={file} />)}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center px-6 py-12 text-center">
                                <DocumentTextIcon className="mb-4 h-14 w-14 text-slate-400" />
                                <h3 className="text-xl font-semibold text-slate-800">Brak plików</h3>
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
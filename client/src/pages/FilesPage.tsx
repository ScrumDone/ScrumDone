import React, { useState } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import FilesFilters, { type FileItem } from '../components/filesFilters'
import FileCard from '../components/FileCard'

const sampleFileModules = import.meta.glob('../sample-files/*', { as: 'url', eager: true }) as Record<string, string>

const getTypeFromFilename = (name: string): FileItem['type'] => {
    const ext = name.split('.').pop()?.toLowerCase()

    switch (ext) {
        case 'pdf':
            return 'PDF'
        case 'doc':
        case 'docx':
            return 'Word'
        case 'xls':
        case 'xlsx':
            return 'Excel'
        case 'ppt':
        case 'pptx':
            return 'PowerPoint'
        case 'png':
            return 'Obrazy (PNG)'
        case 'jpg':
        case 'jpeg':
            return 'Obrazy (JPG)'
        case 'svg':
            return 'SVG'
        case 'zip':
        case 'rar':
        case '7z':
            return 'Archiwa'
        default:
            return 'PDF'
    }
}

const companies = ['Adoddle', 'Nexus', 'Hadar', null]
const additionalTags = ['UX', 'design', 'specyfikacja', 'sprzedaż', 'harmonogram', 'zarządzanie', 'umowa', 'prawne', 'kontrakt', 'mockup', 'mobile', 'grafika', 'logo', 'branding', 'bezpieczeństwo', 'techniczne', 'dokumentacja', 'faktura', 'finanse', 'plan', 'prezentacja', 'screenshot', 'backup', 'wireframe', 'UI', 'RODO', 'database']

const prepareSampleFiles = (): FileItem[] =>
    Object.entries(sampleFileModules).map(([filePath, url], index) => {
        const fileName = filePath.split('/').pop() ?? `plik-${index + 1}`
        const company = companies[Math.floor(Math.random() * companies.length)]
        const numAdditionalTags = Math.floor(Math.random() * 5) + 1 // 1-5 additional tags
        const shuffledTags = [...additionalTags].sort(() => 0.5 - Math.random())
        const selectedTags = shuffledTags.slice(0, numAdditionalTags)

        return {
            id: index + 1,
            name: fileName,
            project: company ?? null,
            type: getTypeFromFilename(fileName),
            tags: company ? [company, ...selectedTags] : selectedTags,
            description: 'Przykładowy plik z lokalnego folderu.',
            author: 'Zespół ScrumDone',
            date: '15 stycznia 2026',
            size: '2.3 MB',
            url,
            isPublic: Math.random() < 0.5,
        }
    })

const FilesPage: React.FC = () => {
    const [files] = useState<FileItem[]>(prepareSampleFiles())
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>(files)

    return (
        <div className="min-h-screen w-full bg-[#F9FAFB]">
            <SideBar />
            <TopBar />

            <main className="ml-64 pt-(--app-header-h)">
                <div className="mx-auto max-w-7xl px-8 py-8">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="font-segoe-ui text-[1.5rem] leading-8 font-normal text-black antialiased">Pliki</h1>
                        </div>
                    </div>

                    <FilesFilters files={files} onFilteredFilesChange={setFilteredFiles} />

                    <section className="mt-6 bg-slate-50">
                        {filteredFiles.length > 0 ? (
                            <ul className="flex flex-col gap-4">
                                {filteredFiles.map((file) => (
                                    <FileCard key={file.id} file={file} />
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

import React, { useEffect, useState } from 'react'
import { DocumentTextIcon, PlusIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import FilesFilters, { type FileItem } from '../components/filesFilters'
import FileCard from '../components/FileCard'
import FileAddModal, { type FileDraft } from '../components/FileAddModal'

const sampleFileModules = import.meta.glob('../sample-files/*', {
    eager: true,
    query: '?url',
    import: 'default',
}) as Record<string, string>

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

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const extensionToFileType = (fileExtension: string): FileItem['type'] => {
    switch (fileExtension) {
        case 'PNG':
            return 'Obrazy (PNG)'
        case 'JPG':
        case 'JPEG':
            return 'Obrazy (JPG)'
        case 'XLSX':
        case 'XLS':
            return 'Excel'
        case 'DOCX':
        case 'DOC':
            return 'Word'
        case 'PPTX':
        case 'PPT':
            return 'PowerPoint'
        case 'ZIP':
        case 'RAR':
            return 'Archiwa'
        case 'SVG':
            return 'SVG'
        default:
            return 'PDF'
    }
}

const companies = ['Adoddle', 'Nexus', 'Hadar', null] as const
const additionalTags = [
    'UX', 'design', 'specyfikacja', 'sprzedaż', 'harmonogram', 'zarządzanie', 'umowa', 'prawne', 'kontrakt',
    'mockup', 'mobile', 'grafika', 'logo', 'branding', 'bezpieczeństwo', 'techniczne', 'dokumentacja',
    'faktura', 'finanse', 'plan', 'prezentacja', 'screenshot', 'backup', 'wireframe', 'UI', 'RODO', 'database',
]

const prepareSampleFiles = async (): Promise<FileItem[]> => {
    const entries = Object.entries(sampleFileModules).filter(([filePath]) => {
        const fileName = filePath.split('/').pop() ?? ''
        return fileName && fileName !== 'README.md' && !fileName.startsWith('.')
    })

    const filePromises = entries.map(async ([filePath, url], index) => {
        const fileName = filePath.split('/').pop() ?? `plik-${index + 1}`
        const company = companies[Math.floor(Math.random() * companies.length)]
        const shuffledTags = [...additionalTags].sort(() => 0.5 - Math.random())
        const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 5) + 1)

        let actualSize = '0 KB'
        try {
            const response = await fetch(url, { method: 'HEAD' })
            const sizeInBytes = response.headers.get('content-length')
            if (sizeInBytes) actualSize = formatBytes(parseInt(sizeInBytes, 10))
        } catch {
            actualSize = '2.3 MB'
        }

        return {
            id: index + 1,
            name: fileName,
            project: company ?? null,
            type: getTypeFromFilename(fileName),
            tags: company ? [company, ...selectedTags] : selectedTags,
            description: 'Przykładowy plik z lokalnego folderu.',
            author: 'Zespół ScrumDone',
            date: '15 stycznia 2026',
            size: actualSize,
            url,
            isPublic: Math.random() < 0.5,
        }
    })
    return Promise.all(filePromises)
}

const formatTodayLabel = () => {
    const now = new Date()
    const months = [
        'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
        'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia',
    ]
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`
}

const FilesPage: React.FC = () => {
    const [allFiles, setAllFiles] = useState<FileItem[]>([])
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        prepareSampleFiles()
            .then((data) => {
                setAllFiles(data)
                setFilteredFiles(data)
            })
            .finally(() => setIsLoading(false))
    }, [])

    const handleSaveFile = (draft: FileDraft) => {
        const fileExtension = draft.name.split('.').pop()?.toUpperCase() || 'NIEZNANY'
        const projectName = draft.projectName || null
        const tags = projectName && !draft.tags.includes(projectName)
            ? [projectName, ...draft.tags]
            : draft.tags

        const newFileItem: FileItem = {
            id: Date.now(),
            name: draft.name,
            project: projectName,
            type: extensionToFileType(fileExtension),
            tags,
            description: draft.description || 'Nowo dodany plik.',
            author: draft.clientName || 'Użytkownik',
            date: formatTodayLabel(),
            size: '—',
            isPublic: draft.isPublic,
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

                    <section className="mt-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center px-6 py-12 text-center">
                                <p className="text-sm text-slate-500 animate-pulse">Ładowanie plików...</p>
                            </div>
                        ) : filteredFiles.length > 0 ? (
                            <ul className="flex flex-col gap-4">
                                {filteredFiles.map((file) => (
                                    <FileCard key={file.id} file={file} />
                                ))}
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

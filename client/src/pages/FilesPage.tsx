import React, { useState, useEffect } from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import SideBar from '../components/sideBar'
import TopBar from '../components/topBar'
import FilesFilters, { type FileItem } from '../components/filesFilters'
import FileCard from '../components/FileCard'

const sampleFileModules = import.meta.glob('../sample-files/*', { as: 'url', eager: true }) as Record<string, string>

const getTypeFromFilename = (name: string): FileItem['type'] => {
    const ext = name.split('.').pop()?.toLowerCase()
    switch (ext) {
        case 'pdf': return 'PDF'
        case 'doc':
        case 'docx': return 'Word'
        case 'xls':
        case 'xlsx': return 'Excel'
        case 'ppt':
        case 'pptx': return 'PowerPoint'
        case 'png': return 'Obrazy (PNG)'
        case 'jpg':
        case 'jpeg': return 'Obrazy (JPG)'
        case 'svg': return 'SVG'
        case 'zip':
        case 'rar':
        case '7z': return 'Archiwa'
        default: return 'PDF'
    }
}

const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const companies = ['Adoddle', 'Nexus', 'Hadar', null]
const additionalTags = ['UX', 'design', 'specyfikacja', 'sprzedaż', 'harmonogram', 'zarządzanie', 'umowa', 'prawne', 'kontrakt', 'mockup', 'mobile', 'grafika', 'logo', 'branding', 'bezpieczeństwo', 'techniczne', 'dokumentacja', 'faktura', 'finanse', 'plan', 'prezentacja', 'screenshot', 'backup', 'wireframe', 'UI', 'RODO', 'database']

const prepareSampleFiles = async (): Promise<FileItem[]> => {
    const filePromises = Object.entries(sampleFileModules).map(async ([filePath, url], index) => {
        const fileName = filePath.split('/').pop() ?? `plik-${index + 1}`
        const company = companies[Math.floor(Math.random() * companies.length)]
        const shuffledTags = [...additionalTags].sort(() => 0.5 - Math.random())
        const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 5) + 1)

        let actualSize = '0 KB';
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const sizeInBytes = response.headers.get('content-length');
            if (sizeInBytes) actualSize = formatBytes(parseInt(sizeInBytes, 10));
        } catch (e) {
            actualSize = '2.3 MB';
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

const FilesPage: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>([])
    const [filteredFiles, setFilteredFiles] = useState<FileItem[]>([])

    useEffect(() => {
        prepareSampleFiles().then(data => {
            setFiles(data)
            setFilteredFiles(data)
        })
    }, [])

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
        </div>
    )
}

export default FilesPage
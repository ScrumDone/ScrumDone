import React, { useState } from 'react'
import { 
    ArrowDownTrayIcon, 
    GlobeAltIcon, 
    LockClosedIcon, 
    DocumentTextIcon,
    TableCellsIcon, 
    PresentationChartBarIcon 
} from '@heroicons/react/24/outline'
import type { FileItem } from './filesFilters'
import ImagePreviewModal from './ImagePreviewModal'

interface FileCardProps {
    file: FileItem
}

const isImageFile = (fileName: string): boolean => /\.(png|jpe?g|svg)$/i.test(fileName)

const FileCard: React.FC<FileCardProps> = ({ file }) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    const formatExtensionTag = (type: string): string => {
        const match = type.match(/\((.*?)\)/);
        if (match && match[1]) {
            return match[1].toUpperCase();
        }

        const mapping: Record<string, string> = {
            'Word': 'DOCX',
            'Excel': 'XLSX',
            'PowerPoint': 'PPTX',
            'Archiwa': 'ZIP',
            'PDF': 'PDF',
            'SVG': 'SVG'
        };

        return mapping[type] || type.toUpperCase();
    };

    const renderFileIcon = () => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        
        if (extension === 'xlsx' || extension === 'xls') {
            return <TableCellsIcon className="h-8 w-8" />;
        }
        if (extension === 'pptx' || extension === 'ppt') {
            return <PresentationChartBarIcon className="h-8 w-8" />;
        }
        return <DocumentTextIcon className="h-8 w-8" />;
    };

    return (
        <li className="relative w-full flex flex-col gap-6 bg-white px-6 py-6 rounded-3xl border border-slate-200 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-start gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-slate-500">
                    {file.url && isImageFile(file.name) ? (
                        <button
                            type="button"
                            onClick={() => setIsPreviewOpen(true)}
                            className="h-full w-full overflow-hidden"
                            aria-label={`Pokaż podgląd obrazu ${file.name}`}
                        >
                            <img
                                src={file.url}
                                alt={file.name}
                                className="h-full w-full object-cover transition duration-200 hover:scale-[1.02]"
                            />
                        </button>
                    ) : (
                        renderFileIcon()
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="font-segoe-ui text-lg text-slate-900 truncate">{file.name}</p>
                    <p className="mt-2 text-sm text-slate-500">{file.description ?? 'Przykładowy plik załadowany z folderu.'}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-white border border-slate-200 px-2 py-1 text-slate-900">
                            {formatExtensionTag(file.type)}
                        </span>
                        
                        {file.size && (
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold leading-none">·</span>
                                <span>{file.size}</span>
                            </div>
                        )}
                        {file.author && (
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold leading-none">·</span>
                                <span>{file.author}</span>
                            </div>
                        )}
                        {file.date && (
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold leading-none">·</span>
                                <span>{file.date}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {file.tags.map((tag, index) => {
                            const isCompanyTag = ['Adoddle', 'Nexus', 'Hadar'].includes(tag)
                            return (
                                <span
                                    key={`${file.id}-${tag}`}
                                    className={`rounded-full px-3 py-1 text-sm ${
                                        index === 0 && isCompanyTag
                                            ? 'bg-scrumdone-blue-main text-white'
                                            : 'bg-white border border-slate-200 text-slate-700'
                                    }`}
                                >
                                    {tag}
                                </span>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="absolute top-6 right-6 flex gap-2">
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    {file.isPublic ? (
                        <GlobeAltIcon className="h-4 w-4" />
                    ) : (
                        <LockClosedIcon className="h-4 w-4" />
                    )}
                    Dostęp
                </button>
                <a
                    href={file.url ?? '#'}
                    download
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Pobierz
                </a>
            </div>
            <ImagePreviewModal
                isOpen={isPreviewOpen}
                imageUrl={file.url ?? ''}
                imageAlt={file.name}
                title={file.name}
                description={file.description ?? 'Podgląd pliku'}
                onClose={() => setIsPreviewOpen(false)}
            />
        </li>
    )
}

export default FileCard
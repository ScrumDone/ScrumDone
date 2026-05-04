import React from 'react'
import { ArrowDownTrayIcon, GlobeAltIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import type { FileItem } from './filesFilters'

interface FileCardProps {
    file: FileItem
}

const isImageFile = (fileName: string): boolean => /\.(png|jpe?g|svg)$/i.test(fileName)

const FileCard: React.FC<FileCardProps> = ({ file }) => (
    <li className="relative w-full flex flex-col gap-6 bg-white px-6 py-6 rounded-3xl border border-slate-200 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-start gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-slate-100 text-slate-500">
                {file.url && isImageFile(file.name) ? (
                    <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                ) : (
                    <DocumentTextIcon className="h-8 w-8" />
                )}
            </div>

            <div className="min-w-0 flex-1">
                <p className="font-segoe-ui text-lg text-slate-900 truncate">{file.name}</p>
                <p className="mt-2 text-sm text-slate-500">{file.description ?? 'Przykładowy plik załadowany z folderu.'}</p>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white border border-slate-200 px-2 py-1 text-slate-900">{file.type}</span>
                    {file.size ? <span>· {file.size}</span> : null}
                    {file.author ? <span>· {file.author}</span> : null}
                    {file.date ? <span>· {file.date}</span> : null}
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
                                        : 'bg-slate-100 text-slate-700'
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
    </li>
)

export default FileCard

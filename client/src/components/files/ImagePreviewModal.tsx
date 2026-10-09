import React, { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'

type ImagePreviewModalProps = {
    isOpen: boolean
    imageUrl: string
    imageAlt: string
    title: string
    description: string
    onClose: () => void
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, imageUrl, imageAlt, title, description, onClose }) => {
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            onClick={onClose}
        >
            <div
                className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-slate-200 px-8 py-6">
                    <div className="relative">
                        <div className="min-w-0 pr-12">
                            <h2 className="truncate text-2xl font-semibold text-slate-900">{title}</h2>
                            <p className="mt-2 text-sm text-slate-500">{description}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute -right-2 -top-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-transparent text-slate-900 transition duration-150 hover:bg-transparent focus:outline-none focus:border-2 focus:border-slate-400 focus:bg-transparent"
                            aria-label="Zamknij podgląd obrazu"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex min-h-[26rem] items-center justify-center overflow-hidden bg-slate-100 p-6">
                    <img
                        src={imageUrl}
                        alt={imageAlt}
                        className="max-h-[80vh] max-w-full rounded-[1.5rem] object-contain shadow-lg"
                    />
                </div>
            </div>
        </div>
    )
}

export default ImagePreviewModal

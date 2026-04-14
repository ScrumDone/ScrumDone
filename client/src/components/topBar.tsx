
import React from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import Avatar from './Avatar'

const TopBar: React.FC = () => {
    return (
        <header className="fixed inset-x-0 left-64 top-0 z-30 h-18 border-b border-slate-200 bg-white">
            <div className="flex gap-4 h-full items-center justify-end px-6">
                <button
                    type="button"
                    className="relative mr-4 rounded-md p-1.5 text-slate-600 transition-colors hover:text-slate-900"
                    aria-label="Powiadomienia"
                >
                    <BellIcon className="h-5.5 w-5.5" strokeWidth={2} />
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-scrumdone-notification-red px-1 text-[0.625rem] font-semibold leading-none text-white">
                        4
                    </span>
                </button>

                <div className="flex items-center gap-2">
                    <Avatar initials="AN" size="md" />

                    <div className="leading-tight">
                        <p className="font-segoe-ui text-sm font-medium text-slate-800">Artur Nowak</p>
                        <p className="font-segoe-ui text-xs text-slate-500">Randlab</p>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default TopBar
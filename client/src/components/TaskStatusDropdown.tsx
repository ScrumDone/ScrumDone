import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export const TaskStatusDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const statuses = [
        { label: 'Do zrobienia', bg: 'hover:bg-slate-50' },
        { label: 'W toku', bg: 'hover:bg-blue-50' },
        { label: 'Gotowe', bg: 'hover:bg-green-50' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        /* BIAŁY KAFELEK (Kontener zewnętrzny) */
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="relative w-full" ref={dropdownRef}>
                
                {/* SZARY PRZYCISK (Wewnątrz kafelka) */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        flex w-full items-center justify-between gap-2 
                        rounded-lg bg-[#F1F2F4] px-4 py-2 
                        text-[14px] font-medium text-slate-700 
                        hover:bg-[#E2E4E9] transition-all cursor-pointer
                    `}
                >
                    <span>W toku</span>
                    <ChevronDownIcon 
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                    />
                </button>

                {/* MENU ROZWIJANE */}
                {isOpen && (
                    <div className="absolute left-0 mt-1 w-full rounded-lg bg-white shadow-xl border border-slate-200 z-50 overflow-hidden">
                        <div className="py-1">
                            {statuses.map((status) => (
                                <button
                                    key={status.label}
                                    onClick={() => setIsOpen(false)}
                                    className={`
                                        flex w-full items-center px-4 py-2.5 
                                        text-sm text-slate-700 ${status.bg} 
                                        transition-colors
                                    `}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
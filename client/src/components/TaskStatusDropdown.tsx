import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export const TaskStatusDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const statuses = [
        { label: 'HISTORIA', bg: 'bg-gray-200', text: 'text-gray-700' },
        { label: 'W TOKU', bg: 'bg-blue-100', text: 'text-blue-700' },
        { label: 'GOTOWE', bg: 'bg-green-100', text: 'text-green-700' },
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
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
            >
                Selected for development
                <ChevronDownIcon className={`h-3 w-3 transition-transform text-black ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-1 w-48 rounded-lg bg-white shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="py-1">
                        {statuses.map((status) => (
                            <button
                                key={status.label}
                                onClick={() => setIsOpen(false)}
                                className="flex w-full items-center px-4 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                                <span className={`${status.bg} ${status.text} px-2 py-0.5 rounded text-xs font-bold`}>
                                    {status.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
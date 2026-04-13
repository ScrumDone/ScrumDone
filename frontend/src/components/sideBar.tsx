
import React, { useState } from 'react'
import {
  HomeIcon,
  CalendarIcon,
    BriefcaseIcon,
  BuildingOffice2Icon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline'

const SideBar: React.FC = () => {
        const [activeItem, setActiveItem] = useState<NavItemKey>('projects')

        const navItems: NavItemConfig[] = [
                { key: 'home', icon: HomeIcon, label: 'Strona główna' },
                { key: 'calendar', icon: CalendarIcon, label: 'Kalendarz' },
                { key: 'projects', icon: BriefcaseIcon, label: 'Projekty' },
                { key: 'companies', icon: BuildingOffice2Icon, label: 'Firmy' },
                { key: 'reports', icon: DocumentChartBarIcon, label: 'Raporty' },
        ]

    return (
        <aside className="fixed inset-y-0 left-0 h-screen w-64 overflow-hidden border-r border-slate-200 bg-white">
            <div className="h-full flex flex-col">
                <div className="flex h-(--app-header-h) items-center border-b border-slate-200 px-6">
                    <div className='flex gap-2'>
                        <h1 className="font-segoe-ui text-scrumdone-blue-main text-[1rem] leading-6 font-normal tracking-[0em] antialiased">randlab</h1>
                        <h1 className="font-segoe-ui text-black text-[1rem] leading-6 font-normal tracking-[0em] antialiased">.pl</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.key}
                            icon={item.icon}
                            label={item.label}
                            active={activeItem === item.key}
                            onClick={() => {
                                setActiveItem(item.key);
                                console.log(`Navigating to ${item.label}`);
                            }}
                        />
                    ))}
                </nav>
            </div>
        </aside>
    )
}

type NavItemKey = 'home' | 'calendar' | 'projects' | 'companies' | 'reports'

interface NavItemConfig {
    key: NavItemKey
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
}

interface NavItemProps {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
    label: string
    active?: boolean
    onClick: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors ${active ? 'bg-scrumdone-blue-200' : 'hover:bg-slate-50'}`}
        >
            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-scrumdone-blue-main' : 'text-slate-600'}`} strokeWidth={2} />
            <span className={`font-segoe-ui text-[1rem] leading-6 font-normal tracking-[0em] ${active ? 'text-scrumdone-blue-main' : 'text-slate-700'}`}>
                {label}
            </span>
        </button>
    )
}

export default SideBar
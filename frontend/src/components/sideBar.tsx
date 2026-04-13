
import React from 'react'

const SideBar: React.FC = () => {
    return (
        <aside className="fixed inset-y-0 left-0 h-screen w-64 overflow-hidden border-r border-slate-200 bg-white">
            <div className="h-full p-4">
                Sidebar
            </div>
        </aside>
    )
}

export default SideBar
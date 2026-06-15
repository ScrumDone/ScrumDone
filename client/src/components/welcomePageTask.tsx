import React from 'react'
import { LockClosedIcon } from '@heroicons/react/24/outline'
import Avatar from '../components/Avatar'

type TaskColorVariant = 'red' | 'yellow' | 'green'

interface WelcomePageTaskProps {
    taskName: string
    projectName: string
    initials: string
    fullName: string
    colorVariant?: TaskColorVariant
    dotColorVariant?: TaskColorVariant
    badgeColorVariant?: TaskColorVariant
    isBlocked?: boolean,
    labels?: { name: string; hexColor: string }[]
    onClick?: () => void
}

const colorVariantClassMap: Record<TaskColorVariant, { dot: string; badgeBorder: string; badgeText: string }> = {
    red: {
        dot: 'bg-scrumdone-red-500',
        badgeBorder: 'border-scrumdone-red-300',
        badgeText: 'text-scrumdone-red-300',
    },
    yellow: {
        dot: 'bg-scrumdone-yellow-500',
        badgeBorder: 'border-scrumdone-yellow-400',
        badgeText: 'text-scrumdone-yellow-500',
    },
    green: {
        dot: 'bg-scrumdone-green-500',
        badgeBorder: 'border-scrumdone-green-300',
        badgeText: 'text-scrumdone-green-500',
    },
}

const WelcomePageTask: React.FC<WelcomePageTaskProps> = ({
    taskName,
    projectName,
    initials,
    fullName,
    colorVariant = 'red',
    dotColorVariant,
    badgeColorVariant,
    isBlocked = false,
    labels = [],
    onClick,
}) => {
    const dotClasses = colorVariantClassMap[dotColorVariant ?? colorVariant]
    const badgeClasses = colorVariantClassMap[badgeColorVariant ?? colorVariant]
    const normalizedInitials = initials.trim().slice(0, 2)

    return (
        <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(event) => {
                if (!onClick) return
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onClick()
                }
            }}
            className={`rounded-lg p-4 ${
                isBlocked
                    ? 'border border-scrumdone-red-300 bg-scrumdone-red-100'
                    : 'border border-gray-200 bg-white'
            } ${onClick ? 'cursor-pointer transition-colors hover:bg-slate-50' : ''}`}
        >
            <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                    {isBlocked && (
                        <LockClosedIcon
                            className="mt-0.5 h-4 w-4 shrink-0 text-scrumdone-red-500"
                            aria-hidden="true"
                        />
                    )}
                    <h1
                        className={`font-segoe-ui text-[0.875rem] leading-6 font-normal tracking-[0em] antialiased ${
                            isBlocked ? 'text-scrumdone-red-600' : 'text-slate-800'
                        }`}
                    >
                        {taskName}
                    </h1>
                </div>
                <span
                    className={`mt-[0.1rem] h-2 w-2 shrink-0 rounded-full ${
                        isBlocked ? 'bg-scrumdone-red-500' : dotClasses.dot
                    }`}
                />
            </div>

            <div className="mb-2 flex flex-wrap items-center gap-2">
                {isBlocked ? (
                    <>
                        <div className="rounded-lg border border-scrumdone-red-300 px-2 py-0.5">
                            <p className="font-segoe-ui text-[0.75rem] leading-5 font-normal tracking-[0em] antialiased text-scrumdone-red-300">
                                {projectName}
                            </p>
                        </div>
                        <div className="rounded-lg border border-scrumdone-red-300 px-2 py-0.5">
                            <p className="font-segoe-ui text-[0.75rem] leading-5 font-medium tracking-[0em] antialiased text-scrumdone-red-600">
                                Zablokowane
                            </p>
                        </div>
                    </>
                ) : (
                    <div className={`rounded-lg border px-2 py-0.5 ${badgeClasses.badgeBorder}`}>
                        <p className={`font-segoe-ui text-[0.75rem] leading-5 font-normal tracking-[0em] antialiased ${badgeClasses.badgeText}`}>
                            {projectName}
                        </p>
                    </div>
                )}

                {/* --- ZMIANA: Renderowanie dynamicznych etykiet --- */}
                {labels.map((label, index) => (
                    <div
                        key={index} 
                        className="rounded-lg border px-2 py-0.5" 
                        style={{
                            borderColor: label.hexColor,
                            backgroundColor: `${label.hexColor}10`
                        }}
                    >
                        <p 
                            className="font-segoe-ui text-[0.75rem] leading-5 font-normal tracking-[0em] antialiased"
                            style={{ color: label.hexColor }}
                        >
                            {label.name}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-2">
                <h1 className="font-segoe-ui text-slate-600 text-[0.75rem] leading-6 font-normal tracking-[0em] antialiased">
                    from:
                </h1>
                <Avatar initials={normalizedInitials} size="xs" />
                <h1 className="font-segoe-ui text-slate-600 text-[0.75rem] leading-6 font-normal tracking-[0em] antialiased">
                    {fullName}
                </h1>
            </div>
        </div>
    )
}

export default WelcomePageTask

import React from 'react'
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
}) => {
    const dotClasses = colorVariantClassMap[dotColorVariant ?? colorVariant]
    const badgeClasses = colorVariantClassMap[badgeColorVariant ?? colorVariant]
    const normalizedInitials = initials.trim().slice(0, 2)

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-2 flex items-center gap-2">
                <h1 className="font-segoe-ui text-slate-800 text-[0.875rem] leading-6 font-normal tracking-[0em] antialiased">
                    {taskName}
                </h1>
                <span className={`mt-[0.1rem] h-2 w-2 rounded-full ${dotClasses.dot}`} />
            </div>

            <div className={`mb-2 w-min rounded-lg border px-2 py-0.5 ${badgeClasses.badgeBorder}`}>
                <p className={`font-segoe-ui text-[0.75rem] leading-5 font-normal tracking-[0em] antialiased ${badgeClasses.badgeText}`}>
                    {projectName}
                </p>
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

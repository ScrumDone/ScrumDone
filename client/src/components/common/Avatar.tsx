import React from 'react'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xs'

const sizeClassMap: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-sm',
    md: 'h-9 w-9 text-base',
    lg: 'h-11 w-11 text-lg',
}

interface AvatarProps {
    initials: string
    size?: AvatarSize
    className?: string
    bgClassName?: string
    textClassName?: string
}

const Avatar: React.FC<AvatarProps> = ({
    initials,
    size = 'md',
    className = '',
    bgClassName = 'bg-scrumdone-blue-main',
    textClassName = 'text-white',
}) => {
    const normalizedInitials = initials.trim().slice(0, 3).toUpperCase()

    return (
        <div
            className={`flex items-center justify-center rounded-full font-semibold ${sizeClassMap[size]} ${bgClassName} ${textClassName} ${className}`}
            aria-label={`Avatar ${normalizedInitials}`}
        >
            {normalizedInitials}
        </div>
    )
}

export default Avatar
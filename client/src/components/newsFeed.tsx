import React from 'react'
import {
    BellAlertIcon,
    ChatBubbleLeftEllipsisIcon,
    DocumentTextIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline'

type NewsVariant = 'blue' | 'green' | 'purple' | 'red'

type NewsIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>

interface NewsItemProps {
    icon: NewsIcon
    text: string
    boldText?: string
    time: string
    variant: NewsVariant
    unread?: boolean
}

interface NewsEntry extends NewsItemProps {
    id: string
}

const variantClassMap: Record<NewsVariant, { card: string; icon: string }> = {
    blue: {
        card: 'bg-scrumdone-blue-300',
        icon: 'text-scrumdone-blue-600',
    },
    green: {
        card: 'bg-scrumdone-green-100',
        icon: 'text-scrumdone-green-500',
    },
    purple: {
        card: 'bg-scrumdone-purple-100',
        icon: 'text-scrumdone-purple-600',
    },
    red: {
        card: 'bg-scrumdone-red-100',
        icon: 'text-scrumdone-red-600',
    },
}

const newsEntries: NewsEntry[] = [
    {
        id: 'news-1',
        icon: ChatBubbleLeftEllipsisIcon,
        text: 'Maria napisała',
        boldText: 'Hej, jak idzie praca nad menu?',
        time: '11:26',
        variant: 'blue',
        unread: true,
    },
    {
        id: 'news-2',
        icon: BellAlertIcon,
        text: 'Dodałeś nowe zadanie Logowanie',
        time: '08:27',
        variant: 'green',
        unread: true,
    },
    {
        id: 'news-3',
        icon: DocumentTextIcon,
        text: 'Do projektu Kendo dodano nowy plik -',
        boldText: 'Umowa.pdf',
        time: '11:26',
        variant: 'purple',
        unread: true,
    },
    {
        id: 'news-4',
        icon: ExclamationCircleIcon,
        text: 'Zadanie',
        boldText: 'Database schema design kończy się dzisiaj',
        time: '09:00',
        variant: 'red',
        unread: true,
    },
    {
        id: 'news-5',
        icon: ChatBubbleLeftEllipsisIcon,
        text: 'Eryk przypisał Ci zadanie',
        boldText: 'Quotes Generation Module',
        time: '07:15',
        variant: 'blue',
    },
    {
        id: 'news-6',
        icon: DocumentTextIcon,
        text: 'Jan skomentował zadanie',
        boldText: 'API integration',
        time: '16:45',
        variant: 'purple',
    },
]

const NewsItem: React.FC<NewsItemProps> = ({ icon: Icon, text, boldText, time, variant, unread = false }) => {
    const classes = variantClassMap[variant]

    return (
        <div className={`rounded-xl px-4 py-3 ${classes.card}`}>
            <div className="flex items-start gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${classes.icon}`} aria-hidden="true" />

                <div className="min-w-0 flex-1">
                    <p className="font-segoe-ui text-[14px] leading-5 font-normal text-slate-900 antialiased">
                        {text}
                        {boldText ? <span className="font-semibold"> {boldText}</span> : null}
                    </p>
                    <p className="mt-1 font-segoe-ui text-[12px] leading-5 font-normal text-slate-500 antialiased">{time}</p>
                </div>

                {unread ? <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-scrumdone-blue-600" aria-label="Nieodczytane" /> : null}
            </div>
        </div>
    )
}

const NewsFeed: React.FC = () => {
    return (
        <div className="flex flex-col gap-3">
            {newsEntries.map((entry) => (
                <NewsItem
                    key={entry.id}
                    icon={entry.icon}
                    text={entry.text}
                    time={entry.time}
                    variant={entry.variant}
                    {...(entry.boldText ? { boldText: entry.boldText } : {})}
                    {...(entry.unread !== undefined ? { unread: entry.unread } : {})}
                />
            ))}
        </div>
    )
}

export default NewsFeed
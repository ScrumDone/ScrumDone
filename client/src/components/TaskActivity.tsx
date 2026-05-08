import { ChevronDownIcon, EllipsisVerticalIcon, PaperClipIcon } from '@heroicons/react/24/outline';
import Avatar from './Avatar';

const activityTabs = ['Rozmowy', 'Komentarze', 'Historia', 'Wymagania'];

const quickReplies = [
  'Dziękuję za informacje',
  'Proszę o więcej szczegółów',
  'Zaktualizuję task',
  'Rozumiem, dziękuję',
];

type ActivityReply = {
  author: string;
  initials: string;
  date: string;
  time: string;
  message: string;
  bgClassName?: string;
};

type ActivityThread = {
  author: string;
  initials: string;
  date: string;
  time: string;
  message: string;
  bgClassName?: string;
  reply?: ActivityReply;
};

const activityThreads: ActivityThread[] = [
  {
    author: 'Artur Nowak',
    initials: 'AN',
    date: '21.03.2026',
    time: '10:30:00',
    message: 'Czy mógłbyś dodać więcej szczegółów na temat interakcji z use case diagram?',
    bgClassName: 'bg-slate-100 text-slate-700',
    reply: {
      author: 'Eryk Baczyński',
      initials: 'EB',
      date: '21.03.2026',
      time: '11:15:00',
      message: 'Oczywiście, dodam to dzisiaj po południu.',
      bgClassName: 'bg-slate-100 text-slate-700',
    },
  },
  {
    author: 'Maria Kowalska',
    initials: 'MK',
    date: '22.03.2026',
    time: '09:45:00',
    message: 'Świetna robota! Mockupy wyglądają bardzo profesjonalnie. Mam tylko jedną uwagę - czy możemy zmienić paletę kolorów w sekcji dashboardu na bardziej stonowaną?',
    bgClassName: 'bg-slate-100 text-slate-700',
    reply: {
      author: 'Eryk Baczyński',
      initials: 'EB',
      date: '22.03.2026',
      time: '10:20:00',
      message: 'Dziękuję! Tak, mogę to zmienić. Myślałem o użyciu odcieni szarości z akcentem niebieskiego. Co o tym sądzisz?',
      bgClassName: 'bg-slate-100 text-slate-700',
    },
  },
];

export const TaskActivity = () => (
  <section className="rounded-xl border border-slate-200 bg-white p-5">
    <div className="mb-5 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <div className="relative top-1.25">
          <ChevronDownIcon className="h-5 w-5 text-black stroke-[2.5]" />
        </div>

        <h2 className="text-[20px] leading-7.5 font-medium text-black">
          Aktywność
        </h2>
      </div>

      <button type="button" className="rounded p-1 text-slate-500 transition-colors hover:bg-slate-50 hover:text-black">
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      {activityTabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={`rounded-lg px-3.5 py-2 text-[14px] font-medium leading-5 transition-colors ${index === 0 ? 'bg-slate-200 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          {tab}
        </button>
      ))}
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      {quickReplies.map((reply) => (
        <button
          key={reply}
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] leading-4 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          {reply}
        </button>
      ))}
    </div>

    <div className="mb-6 flex items-start gap-3">
      <Avatar initials="AN" size="md" className="shrink-0" bgClassName="bg-sky-500" />

      <div className="flex min-h-16.5 flex-1 items-start justify-between rounded-xl bg-slate-50 px-4 py-3">
        <span className="pt-0.5 text-[15px] text-slate-400">Dodaj komentarz...</span>
        <button type="button" className="rounded p-1 text-slate-500 transition-colors hover:bg-white hover:text-slate-900">
          <PaperClipIcon className="h-5 w-5" />
        </button>
      </div>
    </div>

    <div className="space-y-6">
      {activityThreads.map((thread) => (
        <article key={`${thread.author}-${thread.time}`}>
          <div className="flex items-start gap-3">
            <Avatar
              initials={thread.initials}
              size="sm"
              className="shrink-0"
              bgClassName={thread.bgClassName ?? 'bg-slate-200'}
              textClassName="text-slate-700"
            />

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[15px] font-semibold text-slate-900">{thread.author}</span>
                <span className="text-[13px] text-slate-500">{thread.date}, {thread.time}</span>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-6 text-slate-700">
                {thread.message}
              </div>
            </div>
          </div>

          {thread.reply ? (
            <div className="mt-5 ml-10 flex items-start gap-3">
              <Avatar
                initials={thread.reply.initials}
                size="sm"
                className="shrink-0"
                bgClassName={thread.reply.bgClassName ?? 'bg-slate-200'}
                textClassName="text-slate-700"
              />

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <span className="text-[15px] font-semibold text-slate-900">{thread.reply.author}</span>
                  <span className="text-[13px] text-slate-500">{thread.reply.date}, {thread.reply.time}</span>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-6 text-slate-700">
                  {thread.reply.message}
                </div>
              </div>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  </section>
);
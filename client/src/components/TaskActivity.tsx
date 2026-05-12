import { useState } from 'react';
import { ArrowUturnLeftIcon, ChevronDownIcon, EllipsisVerticalIcon, FaceSmileIcon, HandThumbUpIcon, PaperClipIcon } from '@heroicons/react/24/outline';
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

const formatActivityDateTime = () => {
  const now = new Date();
  const date = new Intl.DateTimeFormat('pl-PL').format(now);
  const time = new Intl.DateTimeFormat('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  return { date, time };
};

export const TaskActivity = () => {
  const [threads, setThreads] = useState<ActivityThread[]>(activityThreads);
  const [comment, setComment] = useState('');

  const submitComment = () => {
    const trimmedComment = comment.trim();

    if (!trimmedComment) {
      return;
    }

    const { date, time } = formatActivityDateTime();

    setThreads((currentThreads) => [
      {
        author: 'AN',
        initials: 'AN',
        date,
        time,
        message: trimmedComment,
        bgClassName: 'bg-sky-500 text-white',
      },
      ...currentThreads,
    ]);
    setComment('');
  };

  return (
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
          onClick={() => setComment(reply)}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] leading-4 font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          {reply}
        </button>
      ))}
    </div>

    <div className="mb-6 flex items-start gap-3">
      <Avatar initials="AN" size="md" className="shrink-0" bgClassName="bg-sky-500" />

      <form
        className="flex min-h-16.5 flex-1 items-start justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          submitComment();
        }}
      >
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Dodaj komentarz..."
          rows={2}
          className="min-h-10 flex-1 resize-none border-0 bg-transparent pt-0.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
        />

        <div className="flex items-center gap-1">
          <button type="button" className="rounded p-1 text-slate-500 transition-colors hover:bg-white hover:text-slate-900">
            <PaperClipIcon className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>

    <div className="space-y-6">
      {threads.map((thread) => (
        <article key={`${thread.author}-${thread.time}`} className="group">
          <MessageBlock
            author={thread.author}
            initials={thread.initials}
            date={thread.date}
            time={thread.time}
            message={thread.message}
            bgClassName={thread.bgClassName}
          />

          {thread.reply ? (
            <div className="mt-5 ml-10">
              <MessageBlock
                author={thread.reply.author}
                initials={thread.reply.initials}
                date={thread.reply.date}
                time={thread.reply.time}
                message={thread.reply.message}
                bgClassName={thread.reply.bgClassName}
              />
            </div>
          ) : null}
        </article>
      ))}
    </div>
    </section>
  );
};

type MessageBlockProps = {
  author: string;
  initials: string;
  date: string;
  time: string;
  message: string;
  bgClassName: string | undefined;
};

const MessageBlock = ({ author, initials, date, time, message, bgClassName }: MessageBlockProps) => (
  <div className="flex items-start gap-3">
    <Avatar
      initials={initials}
      size="sm"
      className="shrink-0"
      bgClassName={bgClassName ?? 'bg-slate-200'}
      textClassName="text-slate-700"
    />

    <div className="group/message min-w-0 flex-1">
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-[15px] font-medium text-slate-900">{author}</span>
        <span className="text-[13px] text-slate-500">{date}, {time}</span>
      </div>

      <div className="rounded-xl bg-slate-50 px-4 py-3 text-[15px] leading-6 text-slate-700 transition-colors hover:bg-slate-100/80">
        <p>{message}</p>
      </div>

      <div className="mt-3 flex items-center gap-4 text-slate-600 opacity-0 transition-opacity group-hover/message:opacity-100">
        <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900">
          <HandThumbUpIcon className="h-5 w-5" />
          <span className="text-[12px] font-semibold">Polub</span>
        </button>

        <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900">
          <ArrowUturnLeftIcon className="h-5 w-5" />
          <span className="text-[12px] font-semibold">Odpowiedz</span>
        </button>

        <button type="button" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-900">
          <FaceSmileIcon className="h-5 w-5" />
          <span className="text-[12px] font-semibold">Reakcja</span>
        </button>

        <button type="button" className="rounded p-1 transition-colors hover:bg-white hover:text-slate-900">
          <EllipsisVerticalIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
);
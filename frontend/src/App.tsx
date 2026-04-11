function App() {
  return (
    <main className="min-h-screen bg-linear-to-b from-amber-50 via-white to-orange-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10">
        <div className="w-full rounded-3xl border border-amber-200 bg-white/80 p-8 shadow-xl shadow-amber-200/40 backdrop-blur sm:p-12">
          <p className="mb-3 inline-flex rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-semibold tracking-wide text-amber-800 uppercase">
            ScrumDone frontend
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Vite + React + Tailwind jest gotowy
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Startujesz z szybkim bundlerem, TypeScriptem i Tailwindem v4. Edytuj komponenty
            w <span className="rounded bg-slate-100 px-1 py-0.5 font-mono text-sm">src/</span> i
            od razu zobaczysz zmiany przez HMR.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Stack</p>
              <p className="mt-1 font-semibold">React 19 + TS</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Styling</p>
              <p className="mt-1 font-semibold">Tailwind CSS v4</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">Tooling</p>
              <p className="mt-1 font-semibold">Vite + ESLint</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App

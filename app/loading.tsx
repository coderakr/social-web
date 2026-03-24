export default function GlobalLoading() {
  return (
    <main className="shell min-h-screen">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-4 md:px-6 md:py-5 lg:px-8 lg:py-6">
        <div className="animate-pulse space-y-5">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-white/8" />
            <div className="h-10 w-48 rounded-2xl bg-white/10" />
            <div className="h-4 w-80 max-w-full rounded-full bg-white/7" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,rgba(13,20,32,0.98),rgba(10,15,24,0.98))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] md:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-white/10" />
                    <div className="space-y-2">
                      <div className="h-4 w-36 rounded-full bg-white/10" />
                      <div className="h-3 w-48 rounded-full bg-white/7" />
                    </div>
                  </div>
                  <div className="h-3 w-24 rounded-full bg-white/7" />
                </div>

                <div className="mt-4 rounded-[1.35rem] bg-white/[0.03] p-4 md:p-5">
                  <div className="space-y-3">
                    <div className="h-3 w-full rounded-full bg-white/7" />
                    <div className="h-3 w-11/12 rounded-full bg-white/7" />
                    <div className="h-3 w-8/12 rounded-full bg-white/7" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

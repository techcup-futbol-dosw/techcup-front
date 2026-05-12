import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-50">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl flex-col justify-center gap-8">
        <div className="max-w-2xl space-y-4">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
            {eyebrow}
          </span>
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">{title}</h1>
          <p className="max-w-xl text-base leading-7 text-slate-300">{description}</p>
        </div>
        {children}
      </div>
    </main>
  );
}
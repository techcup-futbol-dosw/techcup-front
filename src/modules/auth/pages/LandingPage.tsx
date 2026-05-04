import { Link } from "react-router";
import { PageShell } from "@/core/components/PageShell";

export function LandingPage() {
  return (
    <PageShell
      eyebrow="TECHCUP"
      title="Torneo listo para correr"
      description="La base de la aplicación ya está conectada. Desde aquí puedes entrar al panel, iniciar sesión o revisar los flujos del torneo."
    >
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200" to="/login">
          Ir a login
        </Link>
        <Link className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" to="/dashboard">
          Abrir dashboard
        </Link>
      </div>
    </PageShell>
  );
}
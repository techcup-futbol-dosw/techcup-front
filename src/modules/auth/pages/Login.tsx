import { Link } from "react-router";
import { PageShell } from "@/core/components/PageShell";

export function Login() {
  return (
    <PageShell
      eyebrow="Acceso"
      title="Iniciar sesión"
      description="Pantalla mínima para que el router compile mientras se define el flujo real de autenticación."
    >
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200" to="/">
          Volver al inicio
        </Link>
        <Link className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" to="/register">
          Crear cuenta
        </Link>
      </div>
    </PageShell>
  );
}
import { Link } from "react-router";
import { PageShell } from "@/core/components/PageShell";

export function Register() {
  return (
    <PageShell
      eyebrow="Acceso"
      title="Crear cuenta"
      description="Pantalla base para el registro de usuarios mientras se completa el formulario definitivo."
    >
      <div className="flex flex-wrap gap-3">
        <Link className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200" to="/login">
          Ya tengo cuenta
        </Link>
        <Link className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" to="/">
          Volver al inicio
        </Link>
      </div>
    </PageShell>
  );
}
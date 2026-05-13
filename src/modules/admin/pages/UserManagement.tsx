import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/core/auth/AuthContext";
import logoTechcup from "@/assets/logo.png";
import {
    Search,
    Shield,
    UserCog,
    Ban,
    RefreshCw,
    X,
    Save,
    LogOut,
} from "lucide-react";
import {
    AccountAdminItem,
    AccountStatus,
    RoleSummary,
    adminUsersService,
} from "@/modules/admin/services/adminUsersService";
import { ApiError } from "@/core/api/http";

const P = {
    primary: "#B81C1C",
    secondary: "#C4841D",
    bg: "#F2F2F7",
};

const PAGE_SIZE = 10;

type AdminHeroPanelProps = {
    roles: string[];
    accountId: number | null;
    onLogout: () => void;
};

function formatLabel(value: string) {
    return value
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(status: AccountStatus) {
    return status === "ACTIVE" ? "Activo" : "Inactivo";
}

function getErrorMessage(error: unknown) {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Ocurrió un error inesperado.";
}

function AdminHeroPanel({ roles, accountId, onLogout }: AdminHeroPanelProps) {
    return (
        <aside
            className="relative overflow-hidden flex flex-col justify-between px-10 py-12 lg:px-12 xl:px-16 min-h-[360px] lg:min-h-screen lg:w-[31%]"
            style={{
                background: "linear-gradient(160deg, #5C0000 0%, #8B0000 42%, #B81C1C 100%)",
            }}
        >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-28 -left-28 w-72 h-72 rounded-full"
                    style={{ background: "rgba(255,255,255,0.04)" }}
                />

                <div
                    className="absolute -bottom-28 -right-24 w-80 h-80 rounded-full"
                    style={{ background: "rgba(255,255,255,0.07)" }}
                />

                <div
                    className="absolute top-1/2 -right-24 w-72 h-72 rounded-full"
                    style={{ background: "rgba(196,132,29,0.08)" }}
                />

                <div
                    className="absolute inset-0 opacity-[0.035]"
                    style={{
                        backgroundImage: "radial-gradient(#fff 1px, transparent 1px)",
                        backgroundSize: "22px 22px",
                    }}
                />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-16">
                    <div
                        className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center p-2"
                        style={{ boxShadow: "0 4px 14px rgba(0,0,0,0.18)" }}
                    >
                        <img
                            src={logoTechcup}
                            alt="TECHCUP Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>

                    <div>
                        <p
                            className="text-white leading-none"
                            style={{
                                fontWeight: 800,
                                fontSize: "1.05rem",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            TECHCUP
                        </p>

                        <p
                            className="text-white/50 mt-0.5"
                            style={{
                                fontSize: "0.62rem",
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                fontWeight: 600,
                            }}
                        >
                            Torneo Universitario
                        </p>
                    </div>
                </div>

                <h1
                    className="text-white"
                    style={{
                        fontSize: "clamp(2rem, 3.2vw, 3rem)",
                        fontWeight: 800,
                        lineHeight: 1.12,
                        letterSpacing: "-0.04em",
                    }}
                >
                    Gestiona todos
                    <br />
                    los usuarios del
                    <br />
                    <span style={{ color: P.secondary }}>sistema.</span>
                </h1>

                <div
                    className="w-12 h-0.5 rounded-full my-7"
                    style={{ backgroundColor: P.secondary }}
                />

                <p
                    className="text-white/70"
                    style={{
                        fontSize: "0.9rem",
                        fontWeight: 500,
                        lineHeight: 1.7,
                    }}
                >
                    Administra usuarios, asigna roles y controla el acceso al torneo
                    de manera centralizada.
                </p>
            </div>

            <div className="relative z-10 pt-8 mt-10 border-t border-white/10">
                <p
                    className="text-white/45 mb-3"
                    style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                    }}
                >
                    Sesión actual
                </p>

                {accountId && (
                    <p className="text-white/60 mb-3" style={{ fontSize: "0.8rem" }}>
                        Cuenta #{accountId}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mb-5">
                    {roles.length > 0 ? (
                        roles.map((role) => (
                            <span
                                key={role}
                                className="rounded-full px-3 py-1 text-xs font-bold"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.12)",
                                    color: "#FFFFFF",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                }}
                            >
                {formatLabel(role)}
              </span>
                        ))
                    ) : (
                        <span className="text-white/50 text-sm">Sin roles cargados</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onLogout}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-white"
                    style={{
                        backgroundColor: "rgba(255,255,255,0.12)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        fontWeight: 700,
                    }}
                >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                </button>
            </div>
        </aside>
    );
}

export function UserManagement() {
    const [users, setUsers] = useState<AccountAdminItem[]>([]);
    const [roles, setRoles] = useState<RoleSummary[]>([]);

    const [query, setQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState<AccountStatus | "">("");

    const [page, setPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [isLoading, setIsLoading] = useState(false);
    const [isSavingRoles, setIsSavingRoles] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedUser, setSelectedUser] = useState<AccountAdminItem | null>(null);
    const [roleDraft, setRoleDraft] = useState<string[]>([]);
    const [roleModalError, setRoleModalError] = useState<string | null>(null);


    const navigate = useNavigate();

    const {
        logout,
        roles: sessionRoles,
        permissions,
        accountId,
        isAuthenticated,
        isBootstrapping,
    } = useAuth();

    useEffect(() => {
        if (isBootstrapping) return;

        if (!isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, isBootstrapping, navigate]);

    const canManageRoles =
        permissions.includes("role:assign:any") ||
        permissions.includes("role:remove:any");

    const canDeactivateAccounts = permissions.includes("account:deactivate:any");

    const foundLabel = useMemo(() => {
        if (totalElements === 1) {
            return "1 usuario encontrado";
        }

        return `${totalElements} usuarios encontrados`;
    }, [totalElements]);

    const loadRoles = async () => {
        const response = await adminUsersService.getRoles();
        setRoles(response);
    };

    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await adminUsersService.searchAccounts({
                query,
                role: roleFilter,
                status: statusFilter,
                page,
                size: PAGE_SIZE,
                sort: "name,asc",
            });

            setUsers(response.content);
            setTotalElements(response.totalElements);
            setTotalPages(response.totalPages);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isBootstrapping || !isAuthenticated) return;

        loadRoles().catch((err) => setError(getErrorMessage(err)));
    }, [isBootstrapping, isAuthenticated]);

    useEffect(() => {
        if (isBootstrapping || !isAuthenticated) return;

        loadUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, isBootstrapping, isAuthenticated]);

    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(0);
        loadUsers();
    };

    const handleFilterChange = () => {
        setPage(0);
        setTimeout(() => {
            loadUsers();
        }, 0);
    };

    const openRoleModal = (user: AccountAdminItem) => {
        setSelectedUser(user);
        setRoleDraft(user.roles ?? []);
        setRoleModalError(null);
    };

    const closeRoleModal = () => {
        setSelectedUser(null);
        setRoleDraft([]);
        setRoleModalError(null);
    };

    const toggleRole = (roleName: string) => {
        setRoleModalError(null);

        setRoleDraft((current) => {
            if (current.includes(roleName)) {
                return current.filter((item) => item !== roleName);
            }

            return [...current, roleName];
        });
    };

    const saveRoleChanges = async () => {
        if (!selectedUser) return;

        if (roleDraft.length === 0) {
            setRoleModalError("El usuario debe conservar al menos un rol.");
            return;
        }

        setIsSavingRoles(true);
        setRoleModalError(null);

        try {
            const originalRoles = selectedUser.roles ?? [];

            const rolesToAdd = roleDraft.filter((role) => !originalRoles.includes(role));
            const rolesToRemove = originalRoles.filter((role) => !roleDraft.includes(role));

            await Promise.all([
                ...rolesToAdd.map((roleName) =>
                    adminUsersService.assignRole({
                        accountId: selectedUser.id,
                        roleName,
                    })
                ),
                ...rolesToRemove.map((roleName) =>
                    adminUsersService.removeRole({
                        accountId: selectedUser.id,
                        roleName,
                    })
                ),
            ]);

            closeRoleModal();
            await loadUsers();
        } catch (err) {
            setRoleModalError(getErrorMessage(err));
        } finally {
            setIsSavingRoles(false);
        }
    };

    const deactivateUser = async (user: AccountAdminItem) => {
        const confirmed = window.confirm(
            `¿Seguro que deseas desactivar la cuenta de ${user.fullName || user.email}?`
        );

        if (!confirmed) return;

        try {
            await adminUsersService.deactivateAccount(user.id);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };
    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login", { replace: true });
        }
    };
    if (isBootstrapping) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Cargando sesión...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white">
            <AdminHeroPanel
                roles={sessionRoles}
                accountId={accountId}
                onLogout={handleLogout}
            />

            <main className="flex-1 px-6 py-10 lg:px-14 xl:px-20 lg:py-14 overflow-x-hidden">
                <div className="w-full max-w-5xl mx-auto">
                    <section className="bg-white rounded-3xl shadow-sm border border-black/5 p-6">
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                            <div>
                                <h2
                                    style={{
                                        fontSize: "1.5rem",
                                        fontWeight: 800,
                                        color: "#1C1C1E",
                                        letterSpacing: "-0.03em",
                                    }}
                                >
                                    Administración de Usuarios
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Gestiona usuarios, roles y permisos del sistema.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={loadUsers}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-white"
                                style={{ backgroundColor: P.primary, fontWeight: 700 }}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Actualizar
                            </button>
                        </div>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-4 mt-7"
                        >
                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500">
                                    Buscar usuario
                                </label>

                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                                    <input
                                        value={query}
                                        onChange={(event) => setQuery(event.target.value)}
                                        placeholder="Nombre, email o identificación..."
                                        className="w-full rounded-2xl border border-black/10 bg-gray-50 py-2.5 pl-10 pr-3 outline-none focus:border-[#C4841D]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500">
                                    Rol
                                </label>

                                <select
                                    value={roleFilter}
                                    onChange={(event) => {
                                        setRoleFilter(event.target.value);
                                        handleFilterChange();
                                    }}
                                    className="w-full rounded-2xl border border-black/10 bg-gray-50 py-2.5 px-3 outline-none focus:border-[#C4841D]"
                                >
                                    <option value="">Todos</option>

                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {formatLabel(role.name)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-bold text-gray-500">
                                    Estado
                                </label>

                                <select
                                    value={statusFilter}
                                    onChange={(event) => {
                                        setStatusFilter(event.target.value as AccountStatus | "");
                                        handleFilterChange();
                                    }}
                                    className="w-full rounded-2xl border border-black/10 bg-gray-50 py-2.5 px-3 outline-none focus:border-[#C4841D]"
                                >
                                    <option value="">Todos</option>
                                    <option value="ACTIVE">Activo</option>
                                    <option value="INACTIVE">Inactivo</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="rounded-2xl px-5 py-2.5 text-white self-end"
                                style={{ backgroundColor: P.secondary, fontWeight: 700 }}
                            >
                                Buscar
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-500">
                                {foundLabel}
                            </p>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: P.primary }}
                                >
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                <tr className="border-b border-black/10 text-xs uppercase tracking-[0.15em] text-gray-400">
                                    <th className="py-3 pr-4">Usuario</th>
                                    <th className="py-3 pr-4">Identificación</th>
                                    <th className="py-3 pr-4">Rol</th>
                                    <th className="py-3 pr-4">Estado</th>
                                    <th className="py-3 pr-4">Programa</th>
                                    <th className="py-3 text-right">Acciones</th>
                                </tr>
                                </thead>

                                <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-gray-500">
                                            Cargando usuarios...
                                        </td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-10 text-center text-gray-500">
                                            No se encontraron usuarios.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="border-b border-black/5">
                                            <td className="py-4 pr-4">
                                                <p className="font-bold text-gray-900">
                                                    {user.fullName || `${user.name} ${user.lastName}`}
                                                </p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </td>

                                            <td className="py-4 pr-4">
                                                <p className="font-semibold text-gray-700">
                                                    {user.identification}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {user.identificationType}
                                                </p>
                                            </td>

                                            <td className="py-4 pr-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {(user.roles ?? []).map((role) => (
                                                        <span
                                                            key={role}
                                                            className="rounded-full px-3 py-1 text-xs font-bold"
                                                            style={{
                                                                backgroundColor: "rgba(196,132,29,0.12)",
                                                                color: P.secondary,
                                                            }}
                                                        >
                              {formatLabel(role)}
                            </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td className="py-4 pr-4">
                        <span
                            className="rounded-full px-3 py-1 text-xs font-bold"
                            style={{
                                backgroundColor:
                                    user.status === "ACTIVE"
                                        ? "rgba(23,201,100,0.12)"
                                        : "rgba(184,28,28,0.10)",
                                color:
                                    user.status === "ACTIVE" ? "#0E9F6E" : P.primary,
                            }}
                        >
                          {formatStatus(user.status)}
                        </span>
                                            </td>

                                            <td className="py-4 pr-4">
                                                <p className="font-semibold text-gray-700">
                                                    {formatLabel(user.program)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {user.semester}° Semestre
                                                </p>
                                            </td>

                                            <td className="py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openRoleModal(user)}
                                                        disabled={!canManageRoles}
                                                        className="rounded-xl border border-black/10 p-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title={canManageRoles ? "Gestionar roles" : "No tienes permisos para gestionar roles"}
                                                    >
                                                        <UserCog className="w-4 h-4 text-gray-700" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => deactivateUser(user)}
                                                        disabled={user.status === "INACTIVE" || !canDeactivateAccounts}
                                                        className="rounded-xl border border-red-100 p-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                                        title={
                                                            !canDeactivateAccounts
                                                                ? "No tienes permisos para desactivar cuentas"
                                                                : user.status === "INACTIVE"
                                                                    ? "La cuenta ya está inactiva"
                                                                    : "Desactivar cuenta"
                                                        }
                                                    >
                                                        <Ban className="w-4 h-4" style={{ color: P.primary }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                className="rounded-2xl border border-black/10 px-4 py-2 disabled:opacity-40"
                            >
                                Anterior
                            </button>

                            <p className="text-sm text-gray-500">
                                Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
                            </p>

                            <button
                                type="button"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((current) => current + 1)}
                                className="rounded-2xl border border-black/10 px-4 py-2 disabled:opacity-40"
                            >
                                Siguiente
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-900">
                                    Gestionar roles
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {selectedUser.fullName || selectedUser.email}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRoleModal}
                                className="rounded-xl p-2 hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mt-6 space-y-3">
                            {roles.map((role) => {
                                const checked = roleDraft.includes(role.name);

                                return (
                                    <label
                                        key={role.id}
                                        className="flex items-center justify-between rounded-2xl border border-black/10 p-4 cursor-pointer hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Shield
                                                className="w-4 h-4"
                                                style={{ color: P.secondary }}
                                            />

                                            <span className="font-bold text-gray-800">
                      {formatLabel(role.name)}
                    </span>
                                        </div>

                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggleRole(role.name)}
                                            className="h-4 w-4"
                                        />
                                    </label>
                                );
                            })}
                        </div>

                        {roleModalError && (
                            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3">
                                <p
                                    className="text-sm font-semibold"
                                    style={{ color: P.primary }}
                                >
                                    {roleModalError}
                                </p>
                            </div>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeRoleModal}
                                className="rounded-2xl border border-black/10 px-4 py-2 font-bold text-gray-600"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={saveRoleChanges}
                                disabled={isSavingRoles}
                                className="inline-flex items-center gap-2 rounded-2xl px-5 py-2 text-white disabled:opacity-70"
                                style={{ backgroundColor: P.primary, fontWeight: 700 }}
                            >
                                <Save className="w-4 h-4" />
                                {isSavingRoles ? "Guardando..." : "Guardar cambios"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
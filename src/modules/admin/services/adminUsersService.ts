import { http } from "@/core/api/http";

export type AccountStatus = "ACTIVE" | "INACTIVE";

export type AccountAdminItem = {
    id: number;
    name: string;
    lastName: string;
    fullName: string;
    email: string;
    identificationType: string;
    identification: string;
    status: AccountStatus;
    program: string;
    semester: number;
    roles: string[];
};

export type AccountAdminPage = {
    content: AccountAdminItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export type RoleSummary = {
    id: number;
    name: string;
};

export type SearchAccountsFilters = {
    query?: string;
    role?: string;
    status?: AccountStatus | "";
    page?: number;
    size?: number;
    sort?: string;
};

export type AssignRoleRequest = {
    accountId: number;
    roleName: string;
};

export type RemoveRoleRequest = {
    accountId: number;
    roleName: string;
};

function buildSearchParams(filters: SearchAccountsFilters) {
    const params = new URLSearchParams();

    if (filters.query?.trim()) {
        params.set("query", filters.query.trim());
    }

    if (filters.role?.trim()) {
        params.set("role", filters.role.trim());
    }

    if (filters.status) {
        params.set("status", filters.status);
    }

    params.set("page", String(filters.page ?? 0));
    params.set("size", String(filters.size ?? 10));
    params.set("sort", filters.sort ?? "name,asc");

    return params.toString();
}

export const adminUsersService = {
    searchAccounts(filters: SearchAccountsFilters) {
        const queryString = buildSearchParams(filters);
        return http.get<AccountAdminPage>(`/accounts?${queryString}`);
    },

    getRoles() {
        return http.get<RoleSummary[]>("/roles");
    },

    assignRole(payload: AssignRoleRequest) {
        return http.post<void>("/roles/assign", payload);
    },

    removeRole(payload: RemoveRoleRequest) {
        return http.post<void>("/roles/remove", payload);
    },

    deactivateAccount(accountId: number) {
        return http.patch<void>(`/accounts/${accountId}/deactivate`);
    },
};
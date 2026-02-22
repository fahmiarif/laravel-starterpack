export interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

export interface Role {
    id: number;
    name: string;
    guard_name: string;
    permissions?: Permission[];
    permissions_count?: number;
    created_at: string;
}

export interface RolePaginationData {
    data: Role[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        links: {
            url: string | null;
            label: string;
            active: boolean;
        }[];
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export type GroupedPermissions = Record<string, Permission[]>;

export interface RoleIndexProps {
    roles: RolePaginationData;
    all_permissions: GroupedPermissions;
    filters: {
        search?: string;
    };
}

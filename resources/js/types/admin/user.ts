export interface User {
    id: number;
    name: string;
    email: string;
    role: string | null;
    role_label: string | null;
    permissions: string[];
    created_at: string;
}

export interface UserPaginationData {
    data: User[];
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
        path: string;
        per_page: number;
        to: number;
        total: number;
    };
}

export interface UserIndexProps {
    users: UserPaginationData;
    filters: {
        search?: string;
        role?: string;
    };
    roles: string[];
}

export interface Menu {
    id: string;
    parent_id: string | null;
    title: string;
    url: string | null;
    icon: string | null;
    order: number;
    is_active: boolean;
    roles?: number[]; // Role IDs
    children?: Menu[];
    created_at?: string;
    updated_at?: string;
}

export interface MenuTreeResponse {
    menu_tree: Menu[];
}

export interface UserMenuResponse {
    menus: Menu[];
}

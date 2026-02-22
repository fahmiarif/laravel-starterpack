import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Menu, MenuTreeResponse, UserMenuResponse } from '@/types/admin/menu';
import { toast } from 'sonner';

export const useMenuTree = () => {
    return useQuery({
        queryKey: ['menus', 'tree'],
        queryFn: async () => {
            const response = await axios.get<MenuTreeResponse>('/admin/menus', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });
            return response.data;
        },
    });
};

export const useSidebarMenus = () => {
    return useQuery({
        queryKey: ['menus', 'sidebar'],
        queryFn: async () => {
            const response = await axios.get<UserMenuResponse>('/admin/menus/sidebar');
            return response.data;
        },
    });
};

export const useSaveMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: any }) => {
            if (id) {
                const response = await axios.put(`/admin/menus/${id}`, data);
                return response.data;
            } else {
                const response = await axios.post('/admin/menus', data);
                return response.data;
            }
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            toast.success(data.message || 'Menu saved successfully');
        },
    });
};

export const useReorderMenus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (orders: { id: string; order: number; parent_id: string | null }[]) => {
            const response = await axios.patch('/admin/menus/reorder', { orders });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            toast.success(data.message || 'Menu reordered successfully');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to reorder menu');
        },
    });
};

export const useDeleteMenu = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await axios.delete(`/admin/menus/${id}`);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['menus'] });
            toast.success(data.message || 'Menu deleted successfully');
        },
    });
};

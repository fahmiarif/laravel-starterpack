import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { RolePaginationData, RoleIndexProps } from '@/types/admin/role';
import { RoleFormData } from '@/types/admin/role-schema';
import roles from '@/routes/admin/roles';
import { toast } from 'sonner';

interface FetchRolesParams {
    page?: number;
    search?: string;
    per_page?: number;
}

export const useRoles = (params: FetchRolesParams) => {
    return useQuery({
        queryKey: ['roles', params],
        queryFn: async () => {
            const response = await axios.get(roles.index.url({ query: params as any }), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });
            return response.data;
        },
    });
};

export const useCreateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: RoleFormData) => {
            const response = await axios.post(roles.store.url(), data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success(data.message || 'Role created successfully');
        },
    });
};

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: RoleFormData }) => {
            const response = await axios.put(roles.update.url({ role: id }), data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success(data.message || 'Role updated successfully');
        },
    });
};

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await axios.delete(roles.destroy.url({ role: id }));
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            toast.success(data.message || 'Role deleted successfully');
        },
    });
};

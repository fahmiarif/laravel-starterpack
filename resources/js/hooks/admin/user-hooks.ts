import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserPaginationData, UserIndexProps } from '@/types/admin/user';
import { CreateUserFormData, UserFormData } from '@/types/admin/user-schema';
import users from '@/routes/admin/users';
import { toast } from 'sonner';

interface FetchUsersParams {
    page?: number;
    search?: string;
    role?: string;
    per_page?: number;
}

export const useUsers = (params: FetchUsersParams) => {
    return useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const response = await axios.get(users.index.url({ query: params as any }), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });
            return response.data;
        },
    });
};

export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateUserFormData) => {
            const response = await axios.post(users.store.url(), data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(data.message || 'User created successfully');
        },
    });
};

export const useUpdateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UserFormData }) => {
            const response = await axios.put(users.update.url({ user: id }), data);
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(data.message || 'User updated successfully');
        },
    });
};

export const useDeleteUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => {
            const response = await axios.delete(users.destroy.url({ user: id }));
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success(data.message || 'User deleted successfully');
        },
    });
};

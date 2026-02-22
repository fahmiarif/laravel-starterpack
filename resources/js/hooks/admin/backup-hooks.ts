import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import type { Backup, BackupResponse } from '@/types/admin/backup';

export const useBackups = () => {
    return useQuery({
        queryKey: ['backups'],
        queryFn: async () => {
            const response = await axios.get<BackupResponse>('/admin/backups/list', {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            });
            return response.data;
        },
    });
};

export const useCreateBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            const response = await axios.post('/admin/backups');
            return response.data;
        },
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            toast.success(data.message || 'Backup created successfully');
        },
        onError: () => {
            toast.error('Gagal membuat backup database.');
        },
    });
};

export const useDeleteBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (filename: string) => {
            const response = await axios.delete(`/admin/backups/${filename}`);
            return response.data;
        },
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            toast.success(data.message || 'Backup deleted');
        },
        onError: () => {
            toast.error('Gagal menghapus backup.');
        },
    });
};

export const useRestoreBackup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (filename: string) => {
            const response = await axios.post(`/admin/backups/${filename}/restore`);
            return response.data;
        },
        onSuccess: (data: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ['backups'] });
            toast.success(data.message || 'Database restored successfully');
        },
        onError: () => {
            toast.error('Gagal restore database.');
        },
    });
};

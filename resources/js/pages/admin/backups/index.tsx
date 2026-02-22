import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import { useBackups, useCreateBackup, useDeleteBackup, useRestoreBackup } from '@/hooks/admin/backup-hooks';
import type { Backup } from '@/types/admin/backup';
import { Database, Download, HardDriveUpload, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Database Backup', href: '/admin/backups' },
];

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function BackupIndex() {
    const { data, isLoading, isError } = useBackups();
    const createBackup = useCreateBackup();
    const deleteBackup = useDeleteBackup();
    const restoreBackup = useRestoreBackup();

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

    const backups: Backup[] = data?.data ?? [];

    const handleCreate = () => {
        createBackup.mutate();
    };

    const handleDownload = (filename: string) => {
        window.open(`/admin/backups/${filename}/download`, '_blank');
    };

    const handleDelete = () => {
        if (deleteTarget) {
            deleteBackup.mutate(deleteTarget, {
                onSettled: () => setDeleteTarget(null),
            });
        }
    };

    const handleRestore = () => {
        if (restoreTarget) {
            restoreBackup.mutate(restoreTarget, {
                onSettled: () => setRestoreTarget(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Database Backup"
                        description="Kelola backup dan restore database Anda."
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={createBackup.isPending}
                    >
                        {createBackup.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Plus className="mr-2 h-4 w-4" />
                        )}
                        {createBackup.isPending ? 'Membuat backup...' : 'Buat Backup'}
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5" />
                            Daftar Backup
                        </CardTitle>
                        <CardDescription>
                            Backup database disimpan secara lokal. Anda bisa download, restore, atau hapus.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <DataTableSkeleton columnCount={4} />
                        ) : isError ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Database className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <p className="text-muted-foreground">Gagal memuat daftar backup.</p>
                            </div>
                        ) : backups.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <HardDriveUpload className="mb-4 h-12 w-12 text-muted-foreground/50" />
                                <h3 className="text-lg font-semibold">Belum ada backup</h3>
                                <p className="text-muted-foreground mt-1">
                                    Klik tombol "Buat Backup" untuk membuat backup database pertama.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama File</TableHead>
                                        <TableHead>Ukuran</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {backups.map((backup, index) => (
                                        <TableRow key={backup.filename}>
                                            <TableCell className="font-medium text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Database className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{backup.filename}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{formatFileSize(backup.size)}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {backup.date}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDownload(backup.filename)}
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setRestoreTarget(backup.filename)}
                                                        title="Restore"
                                                        disabled={restoreBackup.isPending}
                                                    >
                                                        <RotateCcw className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeleteTarget(backup.filename)}
                                                        title="Hapus"
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="Hapus Backup?"
                description={`Backup "${deleteTarget}" akan dihapus secara permanen dan tidak dapat dikembalikan.`}
                confirmText="Hapus"
                variant="destructive"
                isLoading={deleteBackup.isPending}
            />

            {/* Restore Confirmation Dialog */}
            <ConfirmDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(null)}
                onConfirm={handleRestore}
                title="Restore Database?"
                description={`Database akan di-restore dari backup "${restoreTarget}". Data saat ini akan ditimpa. Pastikan Anda sudah membuat backup terbaru sebelum melanjutkan.`}
                confirmText="Restore"
                variant="destructive"
                isLoading={restoreBackup.isPending}
            />
        </AppLayout>
    );
}

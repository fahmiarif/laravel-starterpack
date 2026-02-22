<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Admin\BackupService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BackupController extends Controller
{
    public function __construct(
        protected BackupService $backupService
    ) {}

    /**
     * Display backups list page.
     */
    public function index()
    {
        return Inertia::render('admin/backups/index');
    }

    /**
     * Get all backups as JSON (for React Query).
     */
    public function list()
    {
        try {
            $backups = $this->backupService->getBackups();

            return $this->jsonSuccess('Backups retrieved successfully.', $backups);
        } catch (\Exception $e) {
            return $this->jsonError('Failed to retrieve backups.', $e);
        }
    }

    /**
     * Create a new database backup.
     */
    public function store()
    {
        try {
            $this->backupService->createBackup();

            return $this->jsonSuccess('Backup database berhasil dibuat.');
        } catch (\Exception $e) {
            return $this->jsonError('Gagal membuat backup database.', $e);
        }
    }

    /**
     * Download a backup file.
     */
    public function download(string $filename)
    {
        try {
            return $this->backupService->downloadBackup($filename);
        } catch (\Exception $e) {
            return $this->jsonError('Gagal download backup.', $e);
        }
    }

    /**
     * Delete a backup file.
     */
    public function destroy(string $filename)
    {
        try {
            $this->backupService->deleteBackup($filename);

            return $this->jsonSuccess('Backup berhasil dihapus.');
        } catch (\Exception $e) {
            return $this->jsonError('Gagal menghapus backup.', $e);
        }
    }

    /**
     * Restore a backup file.
     */
    public function restore(string $filename)
    {
        try {
            $output = $this->backupService->restoreBackup($filename);

            return $this->jsonSuccess('Database berhasil di-restore.', ['output' => $output]);
        } catch (\Exception $e) {
            return $this->jsonError('Gagal restore database.', $e);
        }
    }
}

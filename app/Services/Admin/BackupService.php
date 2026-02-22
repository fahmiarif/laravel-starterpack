<?php

namespace App\Services\Admin;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;

class BackupService
{
    /**
     * Get the backup directory path within the disk.
     */
    protected function getBackupPath(): string
    {
        return config('backup.backup.name');
    }

    /**
     * List all backup files.
     *
     * @return array<int, array{filename: string, size: int, date: string}>
     */
    public function getBackups(): array
    {
        $disk = Storage::disk('local');
        $path = $this->getBackupPath();

        if (!$disk->exists($path)) {
            return [];
        }

        $files = $disk->files($path);

        return collect($files)
            ->filter(fn(string $file) => str_ends_with($file, '.zip'))
            ->map(fn(string $file) => [
                'filename' => basename($file),
                'path' => $file,
                'size' => $disk->size($file),
                'date' => date('Y-m-d H:i:s', $disk->lastModified($file)),
            ])
            ->sortByDesc('date')
            ->values()
            ->toArray();
    }

    /**
     * Create a new database backup.
     */
    public function createBackup(): int
    {
        return Artisan::call('backup:run', [
            '--only-db' => true,
            '--disable-notifications' => true,
        ]);
    }

    /**
     * Download a backup file.
     *
     * @return \Symfony\Component\HttpFoundation\StreamedResponse
     */
    public function downloadBackup(string $filename)
    {
        $disk = Storage::disk('local');
        $path = $this->getBackupPath() . '/' . $filename;

        if (!$disk->exists($path)) {
            abort(404, 'Backup file not found.');
        }

        return $disk->download($path, $filename);
    }

    /**
     * Delete a backup file.
     */
    public function deleteBackup(string $filename): bool
    {
        $disk = Storage::disk('local');
        $path = $this->getBackupPath() . '/' . $filename;

        if (!$disk->exists($path)) {
            abort(404, 'Backup file not found.');
        }

        return $disk->delete($path);
    }

    /**
     * Restore a database backup.
     * Extracts the SQL from the zip and executes it via pg_restore / psql.
     */
    public function restoreBackup(string $filename): string
    {
        $disk = Storage::disk('local');
        $zipPath = $this->getBackupPath() . '/' . $filename;

        if (!$disk->exists($zipPath)) {
            abort(404, 'Backup file not found.');
        }

        $fullZipPath = $disk->path($zipPath);
        $tempDir = storage_path('app/backup-temp/restore-' . time());

        // Create temp directory
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        // Extract the zip
        $zip = new \ZipArchive();
        if ($zip->open($fullZipPath) !== true) {
            throw new \RuntimeException('Could not open backup zip file.');
        }

        $zip->extractTo($tempDir);
        $zip->close();

        // Find the SQL file
        $sqlFiles = glob($tempDir . '/**/*.sql') ?: glob($tempDir . '/*.sql') ?: [];

        if (empty($sqlFiles)) {
            // Search recursively
            $iterator = new \RecursiveIteratorIterator(new \RecursiveDirectoryIterator($tempDir));
            foreach ($iterator as $file) {
                if ($file->getExtension() === 'sql') {
                    $sqlFiles[] = $file->getPathname();
                }
            }
        }

        if (empty($sqlFiles)) {
            $this->cleanupTemp($tempDir);
            throw new \RuntimeException('No SQL file found in backup archive.');
        }

        $sqlFile = $sqlFiles[0];

        // Get direct database config
        $config = config('database.connections.pgsql_direct');

        // Determine command: use psql for plain SQL
        $host = $config['host'];
        $port = $config['port'];
        $database = $config['database'];
        $username = $config['username'];

        // Set password via env variable for psql
        putenv("PGPASSWORD={$config['password']}");

        // Execute restoration with psql
        $command = sprintf(
            'psql -h %s -p %s -U %s -d %s -f %s 2>&1',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($database),
            escapeshellarg($sqlFile)
        );

        $output = shell_exec($command);

        // Cleanup
        putenv('PGPASSWORD');
        $this->cleanupTemp($tempDir);

        return $output ?: 'Restore completed.';
    }

    /**
     * Remove temporary directory.
     */
    protected function cleanupTemp(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \FilesystemIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $item) {
            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }
        }

        rmdir($dir);
    }
}

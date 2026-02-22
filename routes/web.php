<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\RoleController;
use App\Http\Controllers\Admin\MenuController;
use App\Http\Controllers\Admin\BackupController;
use Spatie\Health\Http\Controllers\HealthCheckJsonResultsController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('users', UserController::class);
    Route::resource('roles', RoleController::class);

    // Dynamic Menus
    Route::patch('/menus/reorder', [MenuController::class, 'reorder'])->name('menus.reorder');
    Route::get('/menus/sidebar', [MenuController::class, 'sidebar'])->name('menus.sidebar');
    Route::resource('menus', MenuController::class);

    // Database Backups
    Route::get('/backups/list', [BackupController::class, 'list'])->name('backups.list');
    Route::get('/backups/{filename}/download', [BackupController::class, 'download'])->name('backups.download');
    Route::post('/backups/{filename}/restore', [BackupController::class, 'restore'])->name('backups.restore');
    Route::resource('backups', BackupController::class)->only(['index', 'store', 'destroy']);

    // Health Check (JSON)
    Route::get('/health', HealthCheckJsonResultsController::class)->name('health');
});

require __DIR__ . '/settings.php';

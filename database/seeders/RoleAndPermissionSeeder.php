<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Enums\UserRole;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view users',
            'create users',
            'edit users',
            'delete users',
            'manage roles',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Create roles and assign permissions
        
        // Superadmin
        Role::findOrCreate(UserRole::SUPERADMIN->value)
            ->givePermissionTo(Permission::all());

        // Admin
        Role::findOrCreate(UserRole::ADMIN->value)
            ->givePermissionTo([
                'view users',
                'create users',
                'edit users',
                'manage roles',
            ]);

        // Staff
        Role::findOrCreate(UserRole::STAFF->value)
            ->givePermissionTo([
                'view users',
            ]);
    }
}

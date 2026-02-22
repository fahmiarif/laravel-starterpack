<?php

namespace App\Services\Admin;

use App\Http\Resources\Admin\PermissionResource;
use App\Http\Resources\Admin\RoleResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class RoleService
{
    /**
     * Get all roles with pagination and search.
     */
    public function getAllRoles(array $filters, int $perPage = 10): LengthAwarePaginator
    {
        return Role::with('permissions')->withCount('permissions')
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Store a new role and sync permissions.
     */
    public function storeRole(array $data): Role
    {
        return DB::transaction(function () use ($data) {
            $role = Role::create([
                'name' => $data['name'],
                'guard_name' => 'web'
            ]);

            if (isset($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            return $role;
        });
    }

    /**
     * Update an existing role and sync permissions.
     */
    public function updateRole(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data) {
            $role->update([
                'name' => $data['name']
            ]);

            if (isset($data['permissions'])) {
                $role->syncPermissions($data['permissions']);
            }

            return $role;
        });
    }

    /**
     * Delete a role.
     */
    public function deleteRole(Role $role): bool
    {
        if ($role->name === 'admin') {
            throw new \Exception('Super admin role cannot be deleted');
        }

        return $role->delete();
    }

    /**
     * Get all permissions grouped by module.
     */
    public function getGroupedPermissions()
    {
        $permissions = Permission::all();

        return $permissions->groupBy(function ($permission) {
            $parts = explode(' ', $permission->name);
            if (count($parts) > 1) {
                return ucfirst(end($parts));
            }

            $parts = explode('.', $permission->name);
            if (count($parts) > 1) {
                return ucfirst($parts[0]);
            }

            return 'Other';
        })->map(function ($group) {
            return PermissionResource::collection($group)->resolve();
        });
    }
}

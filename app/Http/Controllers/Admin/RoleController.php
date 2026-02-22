<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Http\Resources\Admin\RoleResource;
use App\Services\Admin\RoleService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function __construct(
        protected RoleService $roleService
    ) {}

    public function index(Request $request)
    {
        $roles = $this->roleService->getAllRoles(
            $request->only(['search']),
            $request->per_page ?? 10
        );

        if ($request->wantsJson()) {
            return RoleResource::collection($roles);
        }

        return Inertia::render('admin/roles/index', [
            'roles' => RoleResource::collection($roles),
            'filters' => $request->only(['search']),
            'all_permissions' => $this->roleService->getGroupedPermissions(),
        ]);
    }

    public function store(StoreRoleRequest $request)
    {
        try {
            $this->roleService->storeRole($request->validated());
            return $this->jsonSuccess('Role created successfully');
        } catch (\Exception $e) {
            return $this->jsonError('Failed to create role', $e->getMessage());
        }
    }

    public function update(UpdateRoleRequest $request, Role $role)
    {
        try {
            $this->roleService->updateRole($role, $request->validated());
            return $this->jsonSuccess('Role updated successfully');
        } catch (\Exception $e) {
            return $this->jsonError('Failed to update role', $e->getMessage());
        }
    }

    public function destroy(Role $role)
    {
        try {
            $this->roleService->deleteRole($role);
            return $this->jsonSuccess('Role deleted successfully');
        } catch (\Exception $e) {
            return $this->jsonError('Failed to delete role', $e->getMessage());
        }
    }
}

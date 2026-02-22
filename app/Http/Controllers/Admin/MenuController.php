<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ReorderMenuRequest;
use App\Http\Requests\Admin\StoreMenuRequest;
use App\Http\Requests\Admin\UpdateMenuRequest;
use App\Models\Menu;
use App\Services\Admin\MenuService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    public function __construct(
        protected MenuService $menuService
    ) {}

    public function index(Request $request)
    {
        if ($request->wantsJson()) {
            return response()->json([
                'menu_tree' => $this->menuService->getMenuTree()
            ]);
        }

        return Inertia::render('admin/menus/index', [
            'menu_tree' => $this->menuService->getMenuTree(),
            'roles' => Role::all(['id', 'name']),
        ]);
    }

    public function store(StoreMenuRequest $request)
    {
        try {
            $this->menuService->saveMenu($request->validated());
            return $this->jsonSuccess('Menu created successfully');
        } catch (\Exception $e) {
            return $this->jsonError('Failed to create menu', $e->getMessage());
        }
    }

    public function update(UpdateMenuRequest $request, Menu $menu)
    {
        try {
            $this->menuService->saveMenu($request->validated(), $menu);
            return $this->jsonSuccess('Menu updated successfully');
        } catch (\Exception $e) {
            return $this->jsonError('Failed to update menu', $e->getMessage());
        }
    }

    public function destroy(Menu $menu)
    {
        try {
            $this->menuService->deleteMenu($menu);
            return $this->jsonSuccess('Menu deleted successfully');
        } catch (\Exception $e) {
            return $this->jsonError('Failed to delete menu', $e->getMessage());
        }
    }

    public function reorder(ReorderMenuRequest $request)
    {
        try {
            $this->menuService->reorderMenus($request->orders);
            return $this->jsonSuccess('Menu berhasil diurutkan');
        } catch (\Exception $e) {
            return $this->jsonError('Gagal mengurutkan menu: ' . $e->getMessage());
        }
    }

    /**
     * Get sidebar menus for current user.
     */
    public function sidebar()
    {
        return response()->json([
            'menus' => $this->menuService->getUserMenus(Auth::user())
        ]);
    }
}

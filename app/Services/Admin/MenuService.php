<?php

namespace App\Services\Admin;

use App\Models\Menu;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MenuService
{
    /**
     * Get menus structured for tree view.
     */
    public function getMenuTree(): Collection
    {
        return Menu::with('roles')
            ->whereNull('parent_id')
            ->orderBy('order')
            ->get()
            ->map(function ($menu) {
                return $this->formatMenuWithChildren($menu);
            });
    }

    /**
     * Get menus for current user based on roles.
     */
    public function getUserMenus($user): Collection
    {
        $roleNames = $user->getRoleNames();

        return Menu::whereHas('roles', function ($query) use ($roleNames) {
            $query->whereIn('name', $roleNames);
        })
            ->whereNull('parent_id')
            ->active()
            ->with(['children' => function ($query) use ($roleNames) {
                $query->whereHas('roles', function ($q) use ($roleNames) {
                    $q->whereIn('name', $roleNames);
                })->active()->orderBy('order');
            }])
            ->orderBy('order')
            ->get();
    }

    /**
     * Format a menu and its children recursively.
     */
    protected function formatMenuWithChildren(Menu $menu): array
    {
        $data = $menu->toArray();
        $data['roles'] = $menu->roles->pluck('id')->toArray();
        $data['children'] = $menu->children->map(function ($child) {
            return $this->formatMenuWithChildren($child);
        });

        return $data;
    }

    /**
     * Store or update a menu.
     */
    public function saveMenu(array $data, ?Menu $menu = null): Menu
    {
        return DB::transaction(function () use ($data, $menu) {
            if (!$menu) {
                $menu = new Menu();
            }

            $menu->fill([
                'parent_id' => $data['parent_id'] ?? null,
                'title' => $data['title'],
                'url' => $data['url'] ?? null,
                'icon' => $data['icon'] ?? null,
                'order' => $data['order'] ?? 0,
                'is_active' => (bool) ($data['is_active'] ?? true),
            ]);

            $menu->save();

            if (isset($data['roles'])) {
                $menu->roles()->sync($data['roles']);
            }

            return $menu;
        });
    }

    /**
     * Reorder menus.
     */
    public function reorderMenus(array $orders): void
    {
        DB::transaction(function () use ($orders) {
            foreach ($orders as $item) {
                Menu::where('id', $item['id'])->update([
                    'order' => $item['order'],
                    'parent_id' => $item['parent_id'] ?? null,
                ]);
            }
        });
    }

    /**
     * Delete a menu and its children.
     */
    public function deleteMenu(Menu $menu): bool
    {
        return DB::transaction(function () use ($menu) {
            $menu->children()->each(function ($child) {
                $this->deleteMenu($child);
            });
            return $menu->delete();
        });
    }
}

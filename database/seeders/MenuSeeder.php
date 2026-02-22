<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class MenuSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('name', 'admin')->first();
        if (!$adminRole) return;

        $menus = [
            [
                'title' => 'Dashboard',
                'url' => '/dashboard',
                'icon' => 'LayoutDashboard',
                'order' => 1,
            ],
            [
                'title' => 'User Management',
                'url' => null,
                'icon' => 'Users',
                'order' => 2,
                'children' => [
                    [
                        'title' => 'Users',
                        'url' => '/admin/users',
                        'icon' => 'User',
                        'order' => 1,
                    ],
                    [
                        'title' => 'Roles',
                        'url' => '/admin/roles',
                        'icon' => 'ShieldCheck',
                        'order' => 2,
                    ],
                ]
            ],
            [
                'title' => 'Settings',
                'url' => null,
                'icon' => 'Settings',
                'order' => 3,
                'children' => [
                    [
                        'title' => 'Menu Management',
                        'url' => '/admin/menus',
                        'icon' => 'Menu',
                        'order' => 1,
                    ],
                ]
            ],
        ];

        foreach ($menus as $menuData) {
            $this->createMenu($menuData, $adminRole);
        }
    }

    protected function createMenu(array $data, Role $role, $parentId = null)
    {
        $children = $data['children'] ?? [];
        unset($data['children']);

        $data['parent_id'] = $parentId;
        $menu = Menu::create($data);
        $menu->roles()->attach($role->id);

        foreach ($children as $childData) {
            $this->createMenu($childData, $role, $menu->id);
        }
    }
}

<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Enums\UserRole;

class UserService
{
    /**
     * Create a new user.
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            if (isset($data['role'])) {
                $user->assignRole($data['role']);
            }

            return $user;
        });
    }

    /**
     * Update an existing user.
     */
    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $userData = [
                'name' => $data['name'],
                'email' => $data['email'],
            ];

            if (!empty($data['password'])) {
                $userData['password'] = Hash::make($data['password']);
            }

            $user->update($userData);

            if (isset($data['role'])) {
                $user->syncRoles([$data['role']]);
            }

            return $user->fresh();
        });
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): bool
    {
        return DB::transaction(function () use ($user) {
            // Prevent deleting the last superadmin if necessary, or self-deletion
            if (auth()->id() === $user->id) {
                throw new \Exception('You cannot delete yourself.');
            }

            if ($user->hasRole(UserRole::SUPERADMIN->value)) {
                $superAdminCount = User::role(UserRole::SUPERADMIN->value)->count();
                if ($superAdminCount <= 1) {
                    throw new \Exception('Cannot delete the last superadmin.');
                }
            }

            return $user->delete();
        });
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Admin\UserService;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\Admin\UserResource;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Enums\UserRole;

class UserController extends Controller
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->role($role);
            })
            ->paginate($request->per_page ?? 10)
            ->withQueryString();

        if ($request->wantsJson()) {
            return UserResource::collection($users);
        }

        return Inertia::render('admin/users/index', [
            'users' => UserResource::collection($users),
            'filters' => $request->only(['search', 'role']),
            'roles' => array_column(UserRole::cases(), 'value'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        try {
            $user = $this->userService->create($request->validated());

            return $this->jsonSuccess('User created successfully.', new UserResource($user));
        } catch (\Exception $e) {
            return $this->jsonError('Failed to create user.', $e->getMessage());
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        try {
            $this->userService->update($user, $request->validated());

            return $this->jsonSuccess('User updated successfully.', new UserResource($user->fresh()));
        } catch (\Exception $e) {
            return $this->jsonError('Failed to update user.', $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        try {
            $this->userService->delete($user);

            if (request()->wantsJson()) {
                return $this->jsonSuccess('User deleted successfully.');
            }

            return redirect()->route('admin.users.index')
                ->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            if (request()->wantsJson()) {
                return $this->jsonError('Failed to delete user.', $e->getMessage());
            }

            return redirect()->back()
                ->with('error', $e->getMessage());
        }
    }
}

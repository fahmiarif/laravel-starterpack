import * as React from "react"
import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Pagination } from "@/components/ui/pagination"
import { FilterBar } from "@/components/ui/filter-bar"
import { useUsers, useDeleteUser } from "@/hooks/admin/user-hooks"
import { User, UserPaginationData } from "@/types/admin/user"
import { UserFormDialog } from "@/components/admin/user-form-dialog"
import { getColumns } from "./columns"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { BreadcrumbItem } from "@/types"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '/admin/users' },
];

interface UserIndexProps {
    users: UserPaginationData
    filters: {
        search?: string
        role?: string
    }
    roles: string[]
}

export default function Index({ users: initialUsers, filters, roles }: UserIndexProps) {
    const [params, setParams] = React.useState({
        page: initialUsers.meta.current_page,
        search: filters.search || "",
        role: filters.role || "",
    })

    const { data, isLoading, error } = useUsers(params)
    const deleteUser = useDeleteUser()

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedUser, setSelectedUser] = React.useState<User | undefined>()

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [idToDelete, setIdToDelete] = React.useState<number | undefined>()

    const handleEdit = (user: User) => {
        setSelectedUser(user)
        setDialogOpen(true)
    }

    const handleDelete = (id: number) => {
        setIdToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (idToDelete) {
            await deleteUser.mutateAsync(idToDelete)
            setDeleteDialogOpen(false)
            setIdToDelete(undefined)
        }
    }

    const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete })

    const handleCreate = () => {
        setSelectedUser(undefined)
        setDialogOpen(true)
    }

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }))
    }

    const handleSearchChange = (search: string) => {
        setParams((prev) => ({ ...prev, search, page: 1 }))
    }

    const handleRoleChange = (role: string) => {
        setParams((prev) => ({ ...prev, role, page: 1 }))
    }

    const usersData = data || initialUsers

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex items-center justify-between">
                <Heading title="User Management" description="Manage system users and their roles." />
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <FilterBar
                search={params.search}
                onSearchChange={handleSearchChange}
                role={params.role}
                onRoleChange={handleRoleChange}
                roles={roles}
            />

            <DataTable
                columns={columns}
                data={usersData.data}
                isLoading={isLoading}
                error={error}
            />

            <Pagination
                currentPage={usersData.meta.current_page}
                lastPage={usersData.meta.last_page}
                onPageChange={handlePageChange}
                isLoading={isLoading}
            />

            <UserFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={selectedUser}
                roles={roles}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isLoading={deleteUser.isPending}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
            />
        </AppLayout>
    )
}

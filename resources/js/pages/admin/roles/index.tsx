import * as React from "react"
import { Head } from "@inertiajs/react"
import AppLayout from "@/layouts/app-layout"
import Heading from "@/components/heading"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { Pagination } from "@/components/ui/pagination"
import { FilterBar } from "@/components/ui/filter-bar"
import { useRoles, useDeleteRole } from "@/hooks/admin/role-hooks"
import { Role, RoleIndexProps } from "@/types/admin/role"
import { RoleFormDialog } from "@/components/admin/role-form-dialog"
import { getColumns } from "./columns"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function Index({ roles: initialRoles, all_permissions, filters }: RoleIndexProps) {
    const [params, setParams] = React.useState({
        page: initialRoles?.meta?.current_page || 1,
        search: filters?.search || "",
    })

    const { data, isLoading, error } = useRoles(params)
    const deleteRole = useDeleteRole()

    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [selectedRole, setSelectedRole] = React.useState<Role | undefined>()

    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [idToDelete, setIdToDelete] = React.useState<number | undefined>()

    const handleEdit = (role: Role) => {
        setSelectedRole(role)
        setDialogOpen(true)
    }

    const handleDelete = (id: number) => {
        setIdToDelete(id)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (idToDelete) {
            await deleteRole.mutateAsync(idToDelete)
            setDeleteDialogOpen(false)
            setIdToDelete(undefined)
        }
    }

    const columns = getColumns({ onEdit: handleEdit, onDelete: handleDelete })

    const handleCreate = () => {
        setSelectedRole(undefined)
        setDialogOpen(true)
    }

    const handlePageChange = (page: number) => {
        setParams((prev) => ({ ...prev, page }))
    }

    const handleSearchChange = (search: string) => {
        setParams((prev) => ({ ...prev, search, page: 1 }))
    }

    const rolesData = data || initialRoles

    return (
        <AppLayout>
            <Head title="Role Management" />
            <div className="flex items-center justify-between">
                <Heading title="Role Management" description="Manage system roles and their assigned permissions." />
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Role
                </Button>
            </div>

            <FilterBar
                search={params.search}
                onSearchChange={handleSearchChange}
                role=""
                roles={[]}
                onRoleChange={() => { }}
                searchPlaceholder="Search roles..."
            />

            <DataTable
                columns={columns}
                data={rolesData?.data || []}
                isLoading={isLoading}
                error={error}
            />

            <Pagination
                currentPage={rolesData?.meta?.current_page || 1}
                lastPage={rolesData?.meta?.last_page || 1}
                onPageChange={handlePageChange}
                isLoading={isLoading}
            />

            <RoleFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                role={selectedRole}
                allPermissions={all_permissions}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isLoading={deleteRole.isPending}
                title="Delete Role"
                description="Are you sure you want to delete this role? This action cannot be undone."
            />
        </AppLayout>
    )
}

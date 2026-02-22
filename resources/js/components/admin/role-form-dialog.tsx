import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { roleSchema, RoleFormData } from "@/types/admin/role-schema"
import { Role, GroupedPermissions } from "@/types/admin/role"
import { useCreateRole, useUpdateRole } from "@/hooks/admin/role-hooks"
import { handleServerError } from "@/lib/error-handler"
import { Loader2 } from "lucide-react"

interface RoleFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    role?: Role
    allPermissions: GroupedPermissions
}

export function RoleFormDialog({
    open,
    onOpenChange,
    role,
    allPermissions,
}: RoleFormDialogProps) {
    const createRole = useCreateRole()
    const updateRole = useUpdateRole()

    const form = useForm<RoleFormData>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            permissions: [],
        },
    });

    React.useEffect(() => {
        if (open) {
            if (role) {
                form.reset({
                    name: role.name,
                    permissions: role.permissions?.map(p => p.name) || [],
                })
            } else {
                form.reset({
                    name: "",
                    permissions: [],
                })
            }
        }
    }, [open, role, form])

    async function onSubmit(data: any) {
        try {
            if (role) {
                await updateRole.mutateAsync({ id: role.id, data })
            } else {
                await createRole.mutateAsync(data)
            }
            onOpenChange(false)
        } catch (err) {
            handleServerError(err, form.setError)
        }
    }

    const togglePermission = (name: string, checked: boolean) => {
        const current = form.getValues("permissions")
        if (checked) {
            form.setValue("permissions", [...current, name])
        } else {
            form.setValue("permissions", current.filter((p) => p !== name))
        }
    }

    const toggleGroup = (groupName: string, checked: boolean) => {
        const groupPermissions = allPermissions[groupName].map(p => p.name)
        const current = form.getValues("permissions")

        if (checked) {
            // Add all in group if not already present
            const next = Array.from(new Set([...current, ...groupPermissions]))
            form.setValue("permissions", next)
        } else {
            // Remove all in group
            const next = current.filter(p => !groupPermissions.includes(p))
            form.setValue("permissions", next)
        }
    }

    const isGroupChecked = (groupName: string) => {
        const groupPermissions = allPermissions[groupName].map(p => p.name)
        const current = form.getValues("permissions")
        return groupPermissions.every(p => current.includes(p)) && groupPermissions.length > 0
    }

    const isGroupIndeterminate = (groupName: string) => {
        const groupPermissions = allPermissions[groupName].map(p => p.name)
        const current = form.getValues("permissions")
        const intersection = groupPermissions.filter(p => current.includes(p))
        return intersection.length > 0 && intersection.length < groupPermissions.length
    }

    const isPending = createRole.isPending || updateRole.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] md:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>{role ? "Edit Role" : "Add Role"}</DialogTitle>
                    <DialogDescription>
                        Define role name and assign permissions grouped by module.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] lg:max-h-none overflow-y-auto">
                        <div className="p-2 md:p-6 space-y-6 flex-1 overflow-y-auto">
                            <FormField
                                control={form.control as any}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g. manager"
                                                {...field}
                                                disabled={role?.name === 'admin'}
                                                className="capitalize"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-4">
                                <FormLabel>Permissions</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {Object.keys(allPermissions).map((groupName) => (
                                        <div key={groupName} className="flex flex-col space-y-3 p-4 rounded-lg border bg-muted/30">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-semibold text-sm">{groupName}</h4>
                                                <div className="flex items-center space-x-2">
                                                    <label className="text-xs text-muted-foreground">Check all</label>
                                                    <Checkbox
                                                        checked={isGroupChecked(groupName)}
                                                        onCheckedChange={(checked) => toggleGroup(groupName, !!checked)}
                                                    />
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="grid gap-2">
                                                {allPermissions[groupName].map((permission) => (
                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={(form.watch("permissions") || []).includes(permission.name)}
                                                            onCheckedChange={(checked) => togglePermission(permission.name, !!checked)}
                                                        />
                                                        <label
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                                                        >
                                                            {permission.name.split(' ').slice(0, -1).join(' ') || permission.name}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending || (role?.name === 'admin')}>
                                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {isPending ? "Saving..." : (role ? "Update Role" : "Create Role")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

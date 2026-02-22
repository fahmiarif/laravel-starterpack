import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { createUserSchema, userSchema, CreateUserFormData, UserFormData } from "@/types/admin/user-schema"
import { User } from "@/types/admin/user"
import { useCreateUser, useUpdateUser } from "@/hooks/admin/user-hooks"
import { handleServerError } from "@/lib/error-handler"
import { Loader2 } from "lucide-react"

interface UserFormDialogProps {
    user?: User
    open: boolean
    onOpenChange: (open: boolean) => void
    roles: string[]
}

export function UserFormDialog({
    user,
    open,
    onOpenChange,
    roles,
}: UserFormDialogProps) {
    const isEditing = !!user
    const createUser = useCreateUser()
    const updateUser = useUpdateUser()

    const form = useForm<CreateUserFormData | UserFormData>({
        resolver: zodResolver(isEditing ? userSchema : createUserSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            password: "",
            password_confirmation: "",
            role: user?.role || "",
        },
    })

    // Update form values when user changes (for editing)
    React.useEffect(() => {
        if (user) {
            form.reset({
                name: user.name,
                email: user.email,
                password: "",
                password_confirmation: "",
                role: user.role || "",
            })
        } else {
            form.reset({
                name: "",
                email: "",
                password: "",
                password_confirmation: "",
                role: "",
            })
        }
    }, [user, form, open])

    const onSubmit = async (data: any) => {
        try {
            if (isEditing && user) {
                await updateUser.mutateAsync({ id: user.id, data })
            } else {
                await createUser.mutateAsync(data)
            }
            onOpenChange(false)
        } catch (err: any) {
            handleServerError(err, form.setError)
            console.error(err)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit User" : "Create User"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update user details here."
                            : "Add a new user to the system."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] lg:max-h-none overflow-y-auto">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john@example.com" type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password {isEditing && "(Leave blank to keep current)"}</FormLabel>
                                    <FormControl>
                                        <Input placeholder="********" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password_confirmation"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="********" type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {form.formState.isSubmitting ? "Saving..." : isEditing ? "Update User" : "Create User"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

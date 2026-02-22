import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { menuSchema } from "@/types/admin/menu-schema"
import { Menu } from "@/types/admin/menu"
import { useSaveMenu } from "@/hooks/admin/menu-hooks"
import React from "react"
import { Loader2 } from "lucide-react"

interface MenuFormData {
    title: string;
    url: string | null;
    icon: string | null;
    parent_id: string | null;
    order: number;
    is_active: boolean;
    roles: number[];
}

interface MenuFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    menu?: Menu
    roles: { id: number; name: string }[]
    allMenus: Menu[]
}

export function MenuFormDialog({ open, onOpenChange, menu, roles, allMenus }: MenuFormDialogProps) {
    const saveMenu = useSaveMenu()

    const form = useForm<MenuFormData>({
        resolver: zodResolver(menuSchema) as any,
        defaultValues: {
            title: "",
            url: "",
            icon: "LayoutGrid",
            parent_id: null,
            order: 0,
            is_active: true,
            roles: [],
        },
    })

    React.useEffect(() => {
        if (open) {
            if (menu) {
                form.reset({
                    title: menu.title,
                    url: menu.url || "",
                    icon: menu.icon || "LayoutGrid",
                    parent_id: menu.parent_id || null,
                    order: menu.order || 0,
                    is_active: menu.is_active,
                    roles: menu.roles || [],
                })
            } else {
                form.reset({
                    title: "",
                    url: "",
                    icon: "LayoutGrid",
                    parent_id: null,
                    order: 0,
                    is_active: true,
                    roles: [],
                })
            }
        }
    }, [open, menu, form])

    const onSubmit = (data: MenuFormData) => {
        const payload = {
            ...data,
            parent_id: data.parent_id === 'root' ? null : data.parent_id,
        }
        saveMenu.mutate({ id: menu?.id, data: payload }, {
            onSuccess: () => onOpenChange(false),
        })
    }

    // Flatten all menus for parent selection
    const flattenMenus = (menus: Menu[], depth = 0): { id: string; title: string; depth: number }[] => {
        let items: { id: string; title: string; depth: number }[] = [];
        menus.forEach(m => {
            if (m.id === menu?.id) return; // Prevent self-parenting
            items.push({ id: m.id, title: m.title, depth });
            if (m.children) {
                items = [...items, ...flattenMenus(m.children, depth + 1)];
            }
        });
        return items;
    };

    const flatMenus = flattenMenus(allMenus);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{menu ? "Edit Menu" : "Create Menu"}</DialogTitle>
                    <DialogDescription>
                        Konfigurasi menu sidebar dan hak akses role di sini.
                    </DialogDescription>
                </DialogHeader>

                <Form {...(form as any)}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control as any}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Dashboard" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="/admin/dashboard" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Icon (Lucide)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="LayoutGrid" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="parent_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Menu</FormLabel>
                                        <Select
                                            onValueChange={(val) => field.onChange(val === "root" ? null : val)}
                                            value={field.value || "root"}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Root" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="root">Root (No Parent)</SelectItem>
                                                {flatMenus.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {'\u00A0'.repeat(m.depth * 4)}{m.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control as any}
                                name="order"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Order</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="space-y-3">
                            <FormLabel>Assign to Roles</FormLabel>
                            <div className="grid grid-cols-2 gap-2">
                                {roles.map((role) => (
                                    <FormField
                                        key={role.id}
                                        control={form.control as any}
                                        name="roles"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(role.id)}
                                                        onCheckedChange={(checked) => {
                                                            const current = field.value || [];
                                                            return checked
                                                                ? field.onChange([...current, role.id])
                                                                : field.onChange(current.filter((v: number) => v !== role.id))
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer">
                                                    {role.name}
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={saveMenu.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saveMenu.isPending}>
                                {saveMenu.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {menu ? "Update Menu" : "Create Menu"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

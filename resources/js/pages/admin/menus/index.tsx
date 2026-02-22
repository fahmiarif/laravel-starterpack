import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Plus, Pencil, Trash2, GripVertical, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Heading from '@/components/heading';
import { useMenuTree, useDeleteMenu, useReorderMenus } from '@/hooks/admin/menu-hooks';
import { Menu } from '@/types/admin/menu';
import { useState, useMemo } from 'react';
import { DynamicIcon } from '@/components/dynamic-icon';
import { Badge } from '@/components/ui/badge';
import { MenuFormDialog } from '@/components/admin/menu-form-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { DataTableSkeleton } from '@/components/ui/data-table-skeleton';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Menu Management', href: '/admin/menus' },
];

interface SortableMenuRowProps {
    menu: Menu;
    depth: number;
    roles: { id: number; name: string }[];
    expandedIds: Set<string>;
    toggleExpand: (id: string) => void;
    onEdit: (menu: Menu) => void;
    onDelete: (menu: Menu) => void;
}

function SortableMenuRow({
    menu,
    depth,
    roles,
    expandedIds,
    toggleExpand,
    onEdit,
    onDelete,
}: SortableMenuRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: menu.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.5 : 1,
    };

    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expandedIds.has(menu.id.toString());

    return (
        <div ref={setNodeRef} style={style} className="w-full">
            <div
                className={`flex items-center gap-2 p-3 border-b hover:bg-muted/50 transition-colors bg-background ${depth > 0 ? 'ml-8' : ''}`}
            >
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                    {hasChildren ? (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleExpand(menu.id.toString())}
                        >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                    ) : (
                        <div className="w-6" />
                    )}
                    <DynamicIcon name={menu.icon || 'HelpCircle'} className="h-4 w-4" />
                    <span className="font-medium">{menu.title}</span>
                </div>

                <div className="flex-1 truncate text-sm text-muted-foreground ml-4">
                    {menu.url || '-'}
                </div>

                <div className="flex gap-1 items-center ml-4">
                    {menu.roles?.map((roleId) => {
                        const role = roles.find((r) => r.id === roleId);
                        return (
                            <Badge key={roleId} variant="outline" className="text-[10px] px-1 h-5">
                                {role?.name}
                            </Badge>
                        );
                    })}
                </div>

                <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(menu)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onDelete(menu)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            {hasChildren && isExpanded && (
                <div className="border-l-2 border-muted ml-4">
                    <SortableContext
                        items={menu.children?.map((c) => c.id) || []}
                        strategy={verticalListSortingStrategy}
                    >
                        {menu.children?.map((child) => (
                            <SortableMenuRow
                                key={child.id}
                                menu={child}
                                depth={depth + 1}
                                roles={roles}
                                expandedIds={expandedIds}
                                toggleExpand={toggleExpand}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}

export default function MenuIndex({ roles }: { roles: { id: number; name: string }[] }) {
    const { data: menuData, isLoading } = useMenuTree();
    const deleteMenu = useDeleteMenu();
    const reorderMenus = useReorderMenus();

    const [selectedMenu, setSelectedMenu] = useState<Menu | undefined>();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState<Menu | undefined>();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedIds);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedIds(newExpanded);
    };

    const handleCreate = () => {
        setSelectedMenu(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (menu: Menu) => {
        setSelectedMenu(menu);
        setIsDialogOpen(true);
    };

    const handleDelete = (menu: Menu) => {
        setMenuToDelete(menu);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (menuToDelete) {
            await deleteMenu.mutateAsync(menuToDelete.id);
            setDeleteDialogOpen(false);
            setMenuToDelete(undefined);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            // Find parent and siblings
            const findParentAndSiblings = (
                nodes: Menu[],
                targetId: string
            ): { parentId: string | null; siblings: Menu[] } | null => {
                for (const node of nodes) {
                    if (node.id === targetId) return { parentId: null, siblings: nodes };
                    if (node.children?.some((c) => c.id === targetId)) {
                        return { parentId: node.id, siblings: node.children };
                    }
                    if (node.children) {
                        const result = findParentAndSiblings(node.children, targetId);
                        if (result) return result;
                    }
                }
                return null;
            };

            const info = findParentAndSiblings(menuData?.menu_tree || [], active.id as string);
            if (!info) return;

            const oldIndex = info.siblings.findIndex((m) => m.id === active.id);
            const newIndex = info.siblings.findIndex((m) => m.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSiblings = arrayMove(info.siblings, oldIndex, newIndex);
                const orders = newSiblings.map((m, index) => ({
                    id: m.id,
                    order: index + 1,
                    parent_id: info.parentId,
                }));

                reorderMenus.mutate(orders);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Menu Management" />

            <div className="flex items-center justify-between mb-6">
                <Heading
                    title="Menu Management"
                    description="Manage dynamic sidebar menus and role assignments."
                />
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Menu
                </Button>
            </div>

            {isLoading ? (
                <DataTableSkeleton columnCount={5} rowCount={10} />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>Menu Hierarchy</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex items-center gap-2 p-3 bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="w-10 mr-1" />
                            <div className="min-w-[200px]">Title</div>
                            <div className="flex-1 ml-4">URL</div>
                            <div className="ml-4">Roles</div>
                            <div className="w-20 ml-4 text-right">Actions</div>
                        </div>
                        <div className="divide-y">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={menuData?.menu_tree.map((m) => m.id) || []}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {menuData?.menu_tree.map((menu) => (
                                        <SortableMenuRow
                                            key={menu.id}
                                            menu={menu}
                                            depth={0}
                                            roles={roles}
                                            expandedIds={expandedIds}
                                            toggleExpand={toggleExpand}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                            {(!menuData || menuData.menu_tree.length === 0) && (
                                <div className="p-8 text-center text-muted-foreground">
                                    No menus found. Create one to get started.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <MenuFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                menu={selectedMenu}
                roles={roles}
                allMenus={menuData?.menu_tree || []}
            />

            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMenu.isPending}
                title="Delete Menu"
                description={`Are you sure you want to delete "${menuToDelete?.title}"? This will also delete all sub-menus.`}
            />
        </AppLayout>
    );
}

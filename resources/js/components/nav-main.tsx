import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { Menu } from '@/types/admin/menu';
import { DynamicIcon } from '@/components/dynamic-icon';

export function NavMain({ items = [] }: { items: Menu[] }) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isActive = isCurrentUrl(item.url || '');
                    const isChildActive = hasChildren && item.children?.some(child => isCurrentUrl(child.url || ''));

                    if (hasChildren) {
                        return (
                            <Collapsible
                                key={item.id}
                                asChild
                                defaultOpen={isChildActive || isActive}
                                className="group/collapsible"
                            >
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton tooltip={item.title}>
                                            {item.icon && <DynamicIcon name={item.icon} />}
                                            <span>{item.title}</span>
                                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.children?.map((child) => (
                                                <SidebarMenuSubItem key={child.id}>
                                                    <SidebarMenuSubButton asChild isActive={isCurrentUrl(child.url || '')}>
                                                        <Link href={child.url || '#'} prefetch>
                                                            {child.icon && <DynamicIcon name={child.icon} />}
                                                            <span>{child.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    return (
                        <SidebarMenuItem key={item.id}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.title}
                            >
                                <Link href={item.url || '#'} prefetch>
                                    {item.icon && <DynamicIcon name={item.icon} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}

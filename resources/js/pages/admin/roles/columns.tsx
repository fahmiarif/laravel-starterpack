import { Role } from "@/types/admin/role"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import * as React from "react"

interface ColumnProps {
    onEdit: (role: Role) => void
    onDelete: (id: number) => void
}

export const getColumns = ({ onEdit, onDelete }: ColumnProps): any[] => [
    {
        header: "Name",
        cell: (role: Role) => (
            <div className="font-medium capitalize">{role.name}</div>
        ),
    },
    {
        header: "Permissions",
        cell: (role: Role) => (
            <Badge variant="secondary">
                {role.permissions_count} Permissions
            </Badge>
        ),
    },
    {
        header: "Created At",
        cell: (role: Role) => {
            const date = new Date(role.created_at)
            return <div>{date.toLocaleDateString()}</div>
        },
    },
    {
        header: "Actions",
        cell: (role: Role) => {
            return (
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(role)}
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    {role.name !== 'admin' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => onDelete(role.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )
        },
    },
]

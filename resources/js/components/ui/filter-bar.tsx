import * as React from "react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Search } from "lucide-react"

interface FilterBarProps {
    search: string
    onSearchChange: (value: string) => void
    role: string | undefined
    onRoleChange: (value: string) => void
    roles: string[]
    searchPlaceholder?: string
}

export function FilterBar({
    search,
    onSearchChange,
    role,
    onRoleChange,
    roles,
    searchPlaceholder = "Search...",
}: FilterBarProps) {
    const [localSearch, setLocalSearch] = React.useState(search)

    // Sync local state with prop if it changes from outside (e.g. reset)
    React.useEffect(() => {
        setLocalSearch(search)
    }, [search])

    // Debounce effect
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== search) {
                onSearchChange(localSearch)
            }
        }, 500) // 500ms delay

        return () => clearTimeout(timer)
    }, [localSearch, onSearchChange, search])

    return (
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0 py-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="pl-8"
                />
            </div>
            <div className="w-full md:w-48">
                <Select value={role || "all"} onValueChange={(v) => onRoleChange(v === "all" ? "" : v)}>
                    <SelectTrigger>
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {roles.map((r) => (
                            <SelectItem key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

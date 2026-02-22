import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface DataTableSkeletonProps {
    columnCount: number
    rowCount?: number
}

export function DataTableSkeleton({
    columnCount,
    rowCount = 5,
}: DataTableSkeletonProps) {
    return (
        <div className="rounded-md border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        {Array.from({ length: columnCount }).map((_, i) => (
                            <TableHead key={i}>
                                <Skeleton className="h-4 w-[80%]" />
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rowCount }).map((_, i) => (
                        <TableRow key={i}>
                            {Array.from({ length: columnCount }).map((_, j) => (
                                <TableCell key={j}>
                                    <Skeleton className="h-4 w-[60%]" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

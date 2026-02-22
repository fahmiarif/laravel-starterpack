import * as React from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton"

interface DataTableProps<TData> {
    columns: {
        header: string
        accessorKey?: keyof TData | string
        cell?: (item: TData) => React.ReactNode
    }[]
    data: TData[] | undefined
    isLoading: boolean
    error: any
    emptyMessage?: string
}

export function DataTable<TData>({
    columns,
    data,
    isLoading,
    error,
    emptyMessage = "No data available.",
}: DataTableProps<TData>) {
    if (isLoading) {
        return <DataTableSkeleton columnCount={columns.length} />
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center text-red-500">
                Error loading data. Please try again.
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column, index) => (
                            <TableHead key={index}>{column.header}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data && data.length > 0 ? (
                        data.map((item, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {columns.map((column, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {column.cell
                                            ? column.cell(item)
                                            : column.accessorKey
                                                ? (item[column.accessorKey as keyof TData] as React.ReactNode)
                                                : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

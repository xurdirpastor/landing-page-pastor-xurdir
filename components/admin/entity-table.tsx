import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PublishToggle } from '@/components/admin/publish-toggle'
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog'
import type { SimpleActionResult } from '@/lib/actions/types'

export type EntityTableColumn<T> = {
  header: string
  render: (item: T) => ReactNode
}

type EntityTableProps<T extends { id: string; isPublished: boolean }> = {
  items: T[]
  columns: EntityTableColumn<T>[]
  editHref: (item: T) => string
  itemLabel: (item: T) => string
  onTogglePublished: (id: string, isPublished: boolean) => Promise<SimpleActionResult>
  onDelete: (id: string) => Promise<SimpleActionResult>
  emptyLabel: string
}

export function EntityTable<T extends { id: string; isPublished: boolean }>({
  items,
  columns,
  editHref,
  itemLabel,
  onTogglePublished,
  onDelete,
  emptyLabel,
}: EntityTableProps<T>) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column.header}>{column.header}</TableHead>
          ))}
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            {columns.map((column) => (
              <TableCell key={column.header}>{column.render(item)}</TableCell>
            ))}
            <TableCell>
              <PublishToggle
                id={item.id}
                isPublished={item.isPublished}
                onToggle={onTogglePublished}
              />
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-3">
                <Link
                  href={editHref(item)}
                  className="text-sm text-blue-accent-text hover:underline"
                >
                  Editar
                </Link>
                <DeleteConfirmDialog
                  itemLabel={itemLabel(item)}
                  onConfirm={onDelete.bind(null, item.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

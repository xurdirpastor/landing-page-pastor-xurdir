import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DeleteConfirmDialog } from '@/components/admin/delete-confirm-dialog'
import { AddAdminForm } from '@/components/admin/add-admin-form'
import { removeAdmin } from '@/lib/actions/admin'

export default async function AdminsPage() {
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } })

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Admins</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Papel</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admins.map((admin) => (
            <TableRow key={admin.id}>
              <TableCell>{admin.name}</TableCell>
              <TableCell>{admin.email}</TableCell>
              <TableCell>
                {admin.isSuperAdmin ? <Badge>Admin principal</Badge> : 'Admin'}
              </TableCell>
              <TableCell className="text-right">
                {!admin.isSuperAdmin && (
                  <DeleteConfirmDialog
                    itemLabel={admin.name}
                    onConfirm={removeAdmin.bind(null, admin.id)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div>
        <h2 className="mb-4 font-heading text-lg font-semibold text-foreground">
          Adicionar admin
        </h2>
        <AddAdminForm />
      </div>
    </div>
  )
}

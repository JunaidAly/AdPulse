import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserStatusBadge } from "@/components/common/StatusBadge";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { EditUserDialog } from "./EditUserDialog";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchUsers } from "./usersSlice";
import { fetchAllSites } from "@/features/sites/sitesSlice";
import { formatPercent } from "@/lib/format";
import type { User } from "@/services";

export function AdminUsersPage() {
  const dispatch = useAppDispatch();
  const { items: users, status } = useAppSelector((s) => s.users);
  const sites = useAppSelector((s) => s.sites.items);
  const [editing, setEditing] = useState<User | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchAllSites());
  }, [dispatch]);

  const siteCounts = useMemo(() => {
    const map = new Map<string, number>();
    sites.forEach((s) => map.set(s.ownerId, (map.get(s.ownerId) ?? 0) + 1));
    return map;
  }, [sites]);

  const loading = status !== "ready";

  return (
    <>
      <PageHeader title="Users" description="Manage publisher accounts, revenue share, and status." />

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-center">Sites</TableHead>
                  <TableHead className="text-right">Revenue share</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center tabular-nums">{siteCounts.get(u.id) ?? 0}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPercent(u.revenueShare, 0)}</TableCell>
                    <TableCell>
                      <UserStatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(parseISO(u.joinedAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditing(u)}
                        disabled={u.role === "admin"}
                        className="gap-1"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <EditUserDialog user={editing} onClose={() => setEditing(null)} />
    </>
  );
}

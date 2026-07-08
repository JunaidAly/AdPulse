import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/app/hooks";
import { deleteUser } from "./usersSlice";
import type { User } from "@/services";

interface DeleteUserDialogProps {
  user: User | null;
  siteCount: number;
  onClose: () => void;
}

// Hard delete: removes the Firebase Auth account, the user doc, and every
// site they own. Historical reports_raw revenue rows are kept (orphaned),
// so past network totals never change.
export function DeleteUserDialog({ user, siteCount, onClose }: DeleteUserDialogProps) {
  const dispatch = useAppDispatch();
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const result = await dispatch(deleteUser(user.id));
    setDeleting(false);

    if (deleteUser.fulfilled.match(result)) {
      toast.success(`${user.name} deleted`);
      onClose();
    } else {
      toast.error(result.error?.message ?? "Could not delete user");
    }
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {user.name}?</DialogTitle>
          <DialogDescription>
            This permanently removes their account and sign-in access
            {siteCount > 0
              ? `, along with all ${siteCount} site${siteCount === 1 ? "" : "s"} they own`
              : ""}
            . Their historical revenue records are kept for network reporting, but this
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete permanently"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

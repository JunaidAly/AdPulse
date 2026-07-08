import { Badge } from "@/components/ui/badge";
import { PAYOUT_STATUS, SITE_STATUS, USER_STATUS } from "@/lib/constants";
import type { PayoutStatus, SiteStatus, UserStatus } from "@/lib/constants";

const SITE_MAP: Record<SiteStatus, { label: string; variant: "warning" | "success" | "destructive" }> = {
  [SITE_STATUS.PENDING]: { label: "Pending", variant: "warning" },
  [SITE_STATUS.APPROVED]: { label: "Approved", variant: "success" },
  [SITE_STATUS.REJECTED]: { label: "Rejected", variant: "destructive" },
};

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const { label, variant } = SITE_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function PayoutStatusBadge({ status }: { status: PayoutStatus }) {
  if (status === PAYOUT_STATUS.PAID) return <Badge variant="success">Paid</Badge>;
  if (status === PAYOUT_STATUS.REJECTED) {
    return <Badge variant="destructive">Rejected</Badge>;
  }
  return <Badge variant="warning">Pending</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === USER_STATUS.ACTIVE ? (
    <Badge variant="success">Active</Badge>
  ) : (
    <Badge variant="destructive">Suspended</Badge>
  );
}

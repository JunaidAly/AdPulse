import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch } from "@/app/hooks";
import { addSite } from "./sitesSlice";
import { useAuth } from "@/hooks/useAuth";

export function AddSiteDialog({ existingDomains }: { existingDomains: string[] }) {
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  // Loose client check only — the createSite callable normalizes the input
  // (strips protocol/www/path) and is the source of truth for validity and
  // duplicates. This lets users paste a full URL and have it normalized.
  const schema = z.object({
    domain: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Enter a domain, e.g. example.com")
      .refine((d) => !existingDomains.includes(d), "You already added this domain"),
  });
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    const result = await dispatch(addSite({ userId: user.id, domain: values.domain }));
    if (addSite.fulfilled.match(result)) {
      toast.success("Site submitted", {
        description: "It's now pending admin approval before it can serve ads.",
      });
      reset();
      setOpen(false);
    } else {
      toast.error(result.error?.message ?? "Could not add site");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add site
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a site</DialogTitle>
          <DialogDescription>
            Enter the domain you want to monetize. New sites start as pending until an admin approves them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" placeholder="example.com" {...register("domain")} />
            {errors.domain && <p className="text-xs text-destructive">{errors.domain.message}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit for approval"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

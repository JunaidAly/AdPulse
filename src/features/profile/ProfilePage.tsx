import { FileText, KeyRound, Lock, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { services } from "@/services";
import { AccountForm, LegalForm, PasswordForm } from "./ProfileForms";

export function ProfilePage() {
  // Password card is hidden for accounts without a password provider
  // (e.g. Google-only sign-in), which have no password to change.
  const canChangePassword = services.auth.hasPasswordProvider?.() ?? true;

  return (
    <>
      <PageHeader title="Profile" description="Manage account, reporting, legal, and payout details." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <UserIcon className="h-4 w-4 text-primary" /> Account
              </CardTitle>
              <p className="text-sm text-muted-foreground">Name and sign-in email.</p>
            </CardHeader>
            <CardContent>
              <AccountForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-primary" /> Legal
              </CardTitle>
              <p className="text-sm text-muted-foreground">Invoice and tax details.</p>
            </CardHeader>
            <CardContent>
              <LegalForm />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {canChangePassword && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-primary" /> Password
                </CardTitle>
                <p className="text-sm text-muted-foreground">Keep sign-in secure.</p>
              </CardHeader>
              <CardContent>
                <PasswordForm />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyRound className="h-4 w-4 text-primary" /> API keys
              </CardTitle>
              <p className="text-sm text-muted-foreground">Create reporting access keys.</p>
            </CardHeader>
            <CardContent>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span tabIndex={0}>
                    <Button variant="outline" disabled className="pointer-events-none">
                      Manage keys
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming soon</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

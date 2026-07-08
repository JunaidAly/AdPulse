import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services } from "@/services";

type CheckState = "unchecked" | "checking" | "ok" | "missing";

// Checks a site's ads.txt once on mount (per site) and on demand via the
// Recheck button. The check runs server-side (checkAdsTxt callable).
export function AdsTxtCell({ domain }: { domain: string }) {
  const [state, setState] = useState<CheckState>("unchecked");

  const check = useCallback(async () => {
    if (!services.sites.checkAdsTxt) return;
    setState("checking");
    try {
      const res = await services.sites.checkAdsTxt(domain);
      setState(res.hasRequiredLine ? "ok" : "missing");
    } catch {
      setState("missing");
    }
  }, [domain]);

  useEffect(() => {
    check();
  }, [check]);

  return (
    <div className="flex items-center gap-2">
      {state === "checking" ? (
        <Badge variant="secondary">Checking…</Badge>
      ) : state === "ok" ? (
        <Badge variant="success">ads.txt OK</Badge>
      ) : state === "missing" ? (
        <Badge variant="warning">ads.txt Missing</Badge>
      ) : (
        <Badge variant="secondary">Unchecked</Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={check}
        title="Recheck ads.txt"
        disabled={state === "checking"}
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  );
}

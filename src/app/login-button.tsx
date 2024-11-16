"use client";

import Discord from "@/components/icons/discord";
import Github from "@/components/icons/github";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/auth-actions";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export default function LoginButton({ provider }: { provider: string }) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await login(provider);
      }}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : provider === "github" ? (
        <Github className="mr-2 h-4 w-4" />
      ) : (
        <Discord className="mr-2 h-4 w-4" />
      )}
      Login with {provider.charAt(0).toUpperCase() + provider.slice(1)}
    </Button>
  );
}

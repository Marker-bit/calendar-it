"use client";

import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth-actions";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      onClick={async () => {
        setLoading(true);
        await logout();
        setLoading(false);
      }}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Logout
    </Button>
  );
}

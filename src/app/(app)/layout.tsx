import { getCurrentSession } from "@/lib/session";
import { UserNav } from "../user-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getCurrentSession();

  return (
    <>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          {user ? (
            <UserNav user={user} />
          ) : (
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
      {children}
    </>
  );
}

import { getCurrentSession } from "@/lib/session";
import { UserNav } from "../user-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Github from "@/components/icons/github";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="ml-auto" asChild>
                <Link href="https://github.com/Marker-bit/calendar-it">
                  <Github />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="font-mono">Marker-bit/calendar-it</TooltipContent>
          </Tooltip>
        </div>
      </div>
      {children}
    </>
  );
}

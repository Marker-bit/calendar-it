import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import { calendars } from "@/server/db/schema";
import Link from "next/link";

export default async function Page() {
  const calendarsList = await db.select().from(calendars);
  return (
    <main className="p-2">
      <div className="flex items-center gap-2 p-2 mb-4">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Calendars</h1>
          <div className="text-sm text-muted-foreground">
            List of all calendars
          </div>
        </div>
        <Button asChild className="ml-auto">
          <Link href="/calendars/new">New</Link>
        </Button>
      </div>
      {calendarsList.length > 0 && (
        <div className="rounded-xl border">
          {calendarsList.map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 border-b p-4 last:border-b-0"
            >
              <div className="flex flex-col">
                {c.name}
                <div className="text-xs text-muted-foreground">
                  {c.dates.length} dates, nearest on{" "}
                  {c.dates.sort()[0]?.toDateString() ?? "unknown"}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/calendars/${c.id}/edit`}>Edit</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href={`/calendars/${c.id}`}>Open</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

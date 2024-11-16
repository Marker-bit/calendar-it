import { getCurrentSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { user } = await getCurrentSession();

  if (!user) {
    return redirect("/login");
  }

  return (
    <main className="p-2">
      Hey!
    </main>
  );
}

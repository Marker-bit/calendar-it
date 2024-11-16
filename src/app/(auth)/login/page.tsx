import LoginButton from "../../login-button";

export default async function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2">
      <LoginButton provider="github" />
      <LoginButton provider="discord" />
    </main>
  );
}

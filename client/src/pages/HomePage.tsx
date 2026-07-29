import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <h1 className="mt-2 text-2xl font-semibold">{user?.email}</h1>
        <p className="mt-4 text-sm text-muted-foreground">Your chat app can live here.</p>
        <Button className="mt-6 w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    </main>
  );
}
import { signOut, getUser } from "@/actions/auth";
import { LogOut } from "lucide-react";

export async function TopNav() {
  const user = await getUser();

  return (
    <header className="fixed top-0 left-56 right-0 z-10 flex h-14 items-center justify-end border-b bg-background/95 backdrop-blur-sm px-6">
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground hidden sm:block">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}

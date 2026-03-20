import { signIn } from "@/actions/auth";
import { Heart } from "lucide-react";

interface Props {
  searchParams: { error?: string; next?: string };
}

export default function LoginPage({ searchParams }: Props) {
  const { error, next = "/dashboard" } = searchParams;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Heart className="h-6 w-6 text-rose-500" strokeWidth={2.5} />
          <span className="text-lg font-semibold">Care Journey OS</span>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h1 className="text-base font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">Internal access only.</p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <input type="hidden" name="next" value={next} />

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-xs text-center text-muted-foreground">
            Need access? Contact your admin to create an account in Supabase.
          </p>
        </div>
      </div>
    </div>
  );
}

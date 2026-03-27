import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Called by Vercel Cron every 3 days to prevent Supabase free-tier auto-pause.
export async function GET() {
  const supabase = await createClient();
  const { error } = await supabase.from("cases").select("id").limit(1);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ts: new Date().toISOString() });
}

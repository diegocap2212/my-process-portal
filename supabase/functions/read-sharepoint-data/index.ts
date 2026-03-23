import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Proxy to fetch data.json from the Vercel dashboard (which syncs from SharePoint)
const DATA_JSON_URL =
  "https://raw.githubusercontent.com/diegocap2212/locavia-dashboard/main/src/data.json";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const res = await fetch(DATA_JSON_URL);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to fetch data.json [${res.status}]: ${body}`);
    }

    const items = await res.json();

    return new Response(JSON.stringify({ items, count: items.length }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("Data fetch error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

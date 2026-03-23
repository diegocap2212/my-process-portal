import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ---------- helpers ----------

async function getAccessToken(): Promise<string> {
  const tenantId = Deno.env.get("AZURE_TENANT_ID");
  const clientId = Deno.env.get("AZURE_CLIENT_ID");
  const clientSecret = Deno.env.get("AZURE_CLIENT_SECRET");

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure AD credentials not configured");
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Azure token error [${res.status}]: ${body}`);
  }

  const json = await res.json();
  return json.access_token;
}

async function graphGet(token: string, path: string) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph API error [${res.status}]: ${body}`);
  }
  return res.json();
}

// ---------- SharePoint file resolution ----------

// The shared link encodes a driveItem — we resolve it via the shares API
function encodeSharingUrl(url: string): string {
  const base64 = btoa(url)
    .replace(/=/g, "")
    .replace(/\//g, "_")
    .replace(/\+/g, "-");
  return `u!${base64}`;
}

async function resolveDriveItem(token: string, shareUrl: string) {
  const encoded = encodeSharingUrl(shareUrl);
  const data = await graphGet(token, `/shares/${encoded}/driveItem`);
  return {
    driveId: data.parentReference?.driveId,
    itemId: data.id,
    name: data.name,
  };
}

// ---------- modes ----------

async function discoverSheets(
  token: string,
  driveId: string,
  itemId: string
) {
  const worksheets = await graphGet(
    token,
    `/drives/${driveId}/items/${itemId}/workbook/worksheets`
  );

  const sheets: {
    name: string;
    headers: string[];
    rowCount: number;
    sample: string[][];
  }[] = [];

  for (const ws of worksheets.value) {
    try {
      const range = await graphGet(
        token,
        `/drives/${driveId}/items/${itemId}/workbook/worksheets('${encodeURIComponent(ws.name)}')/usedRange`
      );
      const rows: string[][] = range.values || [];
      sheets.push({
        name: ws.name,
        headers: rows[0] || [],
        rowCount: rows.length,
        sample: rows.slice(0, 5),
      });
    } catch {
      sheets.push({ name: ws.name, headers: [], rowCount: 0, sample: [] });
    }
  }

  return sheets;
}

async function readSheet(
  token: string,
  driveId: string,
  itemId: string,
  sheetName: string
) {
  const range = await graphGet(
    token,
    `/drives/${driveId}/items/${itemId}/workbook/worksheets('${encodeURIComponent(sheetName)}')/usedRange`
  );
  return range.values || [];
}

// ---------- main ----------

const SHARE_URL =
  "https://lmmobilidade.sharepoint.com/:x:/s/TI-LM/IQDthYxUEKT4R4X5w-PouFkwAVxswB3Gz5tkBm51ceC2b1k";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode") || "discover";
    const sheet = url.searchParams.get("sheet") || "";

    const token = await getAccessToken();
    const { driveId, itemId, name } = await resolveDriveItem(token, SHARE_URL);

    let result: unknown;

    if (mode === "discover") {
      const sheets = await discoverSheets(token, driveId!, itemId);
      result = { file: name, sheets };
    } else if (mode === "read" && sheet) {
      const rows = await readSheet(token, driveId!, itemId, sheet);
      result = { file: name, sheet, rows };
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use ?mode=discover or ?mode=read&sheet=NAME" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: unknown) {
    console.error("SharePoint read error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

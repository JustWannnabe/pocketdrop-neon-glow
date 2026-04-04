import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  let expiredDeleted = 0;
  let overflowDeleted = 0;

  try {
    // Step 1: Get expired rows (no password)
    const { data: expired } = await supabase
      .from("files")
      .select("id, file_url, is_text")
      .is("password", null)
      .lt("expires_at", new Date().toISOString());

    if (expired && expired.length > 0) {
      // Step 2: Delete storage files
      const storagePaths = expired
        .filter((r) => !r.is_text && r.file_url)
        .map((r) => {
          const marker = "/object/public/pocketdrop-files/";
          const idx = r.file_url.indexOf(marker);
          return idx !== -1 ? r.file_url.substring(idx + marker.length) : null;
        })
        .filter(Boolean) as string[];

      if (storagePaths.length > 0) {
        await supabase.storage.from("pocketdrop-files").remove(storagePaths);
      }

      // Step 3: Delete expired rows
      const ids = expired.map((r) => r.id);
      await supabase.from("files").delete().in("id", ids);
      expiredDeleted = ids.length;
    }

    // Step 4: Overflow check
    const { count } = await supabase
      .from("files")
      .select("id", { count: "exact", head: true });

    if (count && count > 500) {
      const { data: oldest } = await supabase
        .from("files")
        .select("id, file_url, is_text")
        .is("password", null)
        .order("created_at", { ascending: true })
        .limit(100);

      if (oldest && oldest.length > 0) {
        const paths = oldest
          .filter((r) => !r.is_text && r.file_url)
          .map((r) => {
            const marker = "/object/public/pocketdrop-files/";
            const idx = r.file_url.indexOf(marker);
            return idx !== -1 ? r.file_url.substring(idx + marker.length) : null;
          })
          .filter(Boolean) as string[];

        if (paths.length > 0) {
          await supabase.storage.from("pocketdrop-files").remove(paths);
        }

        const ids = oldest.map((r) => r.id);
        await supabase.from("files").delete().in("id", ids);
        overflowDeleted = ids.length;
      }
    }

    return new Response(
      JSON.stringify({ expiredDeleted, overflowDeleted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

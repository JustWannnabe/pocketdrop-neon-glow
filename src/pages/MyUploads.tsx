import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Copy, Check, Trash2, FileText, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NeonParticles from "@/components/NeonParticles";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type FileRow = Tables<"files">;

const MyUploads = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
        return;
      }
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to load uploads");
      } else {
        setFiles(data ?? []);
      }
      setLoading(false);
    };
    init();
  }, [navigate]);

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteFile = async (file: FileRow) => {
    setDeletingId(file.id);
    try {
      // Delete from storage if it's not a text-only entry
      if (!file.is_text && file.file_url) {
        const url = new URL(file.file_url);
        const pathParts = url.pathname.split("/storage/v1/object/public/pocketdrop-files/");
        if (pathParts[1]) {
          await supabase.storage.from("pocketdrop-files").remove([decodeURIComponent(pathParts[1])]);
        }
      }
      // Delete from database
      const { error } = await supabase.from("files").delete().eq("id", file.id);
      if (error) throw error;
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
      toast.success("File deleted");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const getExpiryStatus = (file: FileRow) => {
    if (!file.expires_at) {
      return <span className="text-emerald-400 text-xs">Never expires</span>;
    }
    const expiry = new Date(file.expires_at);
    if (expiry < new Date()) {
      return <span className="text-red-400 text-xs">Expired</span>;
    }
    return (
      <span className="text-yellow-400 text-xs">
        Expires: {expiry.toLocaleDateString()}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <NeonParticles />
      <div className="relative z-10">
      <div className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[340px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-100px] w-[400px] h-[300px] rounded-full bg-accent/10 blur-[100px]" />

      <Navbar />

      <main className="relative z-10 flex flex-col items-center pt-28 pb-16 px-4">
        <h1
          className="font-display text-3xl md:text-4xl font-bold text-primary mb-8"
          style={{ textShadow: "0 0 20px hsl(var(--neon-cyan) / 0.5)" }}
        >
          My Uploads
        </h1>

        {loading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center gap-4 mt-12">
            <FileText className="w-16 h-16 text-muted-foreground/40" />
            <p className="text-muted-foreground text-lg">No files uploaded yet</p>
            <Link
              to="/send"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-display font-bold text-sm bg-primary/10 border border-primary text-primary neon-text-cyan hover:bg-primary/20 transition-all"
              style={{ boxShadow: "0 0 20px hsl(var(--neon-cyan) / 0.2)" }}
            >
              <Send className="w-4 h-4" />
              Send a File
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 w-full max-w-2xl">
            {files.map((file) => (
              <div
                key={file.id}
                className="rounded-xl border border-primary/15 bg-card/60 backdrop-blur-sm p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                style={{ boxShadow: "0 0 15px hsl(var(--neon-cyan) / 0.05)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground truncate">
                    {file.is_text ? "Text Snippet" : file.file_name}
                  </p>
                  <p
                    className="font-mono text-primary text-lg tracking-[0.3em] mt-1"
                    style={{ textShadow: "0 0 10px hsl(var(--neon-cyan) / 0.5)" }}
                  >
                    {file.code}
                  </p>
                  <div className="mt-1">{getExpiryStatus(file)}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyCode(file.code, file.id)}
                    className="p-2 rounded-lg border border-primary/30 text-primary hover:bg-primary/10 transition-all"
                    title="Copy Code"
                  >
                    {copiedId === file.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteFile(file)}
                    disabled={deletingId === file.id}
                    className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === file.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default MyUploads;

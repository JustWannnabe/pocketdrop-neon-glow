import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Upload, Copy, Check, FileText, Loader2, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import NeonParticles from "@/components/NeonParticles";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const Send = () => {
  const [isText, setIsText] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!isText && !file) return toast.error("Please select a file.");
    if (isText && !textContent.trim()) return toast.error("Please enter some text.");

    setUploading(true);
    try {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = password ? null : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

      let fileUrl = "";
      let fileName = "";
      let fileType = "";

      if (isText) {
        fileName = "text-snippet.txt";
        fileType = "text/plain";
        fileUrl = "text://inline";
      } else {
        const ext = file!.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: storageError } = await supabase.storage
          .from("pocketdrop-files")
          .upload(path, file!);
        if (storageError) throw storageError;

        const { data: urlData } = supabase.storage
          .from("pocketdrop-files")
          .getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = file!.name;
        fileType = file!.type || "application/octet-stream";
      }

      const { error: dbError } = await supabase.from("files").insert({
        code: generatedCode,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        password: password || null,
        expires_at: expiresAt,
        is_text: isText,
        text_content: isText ? textContent : null,
      });
      if (dbError) throw dbError;

      setCode(generatedCode);
    } catch (err: any) {
      toast.error(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const copyCode = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setCode(null);
    setFile(null);
    setTextContent("");
    setPassword("");
    setIsText(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NeonParticles />
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="font-display text-xl font-bold text-primary neon-text-cyan tracking-wider">
            PocketDrop
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </div>
      </nav>

      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] animate-pulse-glow" />

        {code ? (
          <div className="relative z-10 flex flex-col items-center text-center gap-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-foreground">Your code is ready!</h2>
            <span className="font-display text-6xl md:text-8xl font-black text-primary neon-text-cyan tracking-[0.3em]">
              {code}
            </span>
            <p className="text-muted-foreground text-sm max-w-xs">
              Share this code. {password ? "Password-protected — never expires." : "Expires in 10 days."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={copyCode}
                className="px-6 py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 rounded-lg font-display font-bold text-sm tracking-wider border border-accent text-accent neon-text-purple hover:bg-accent/10 transition-all"
              >
                Send Another
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full max-w-lg flex flex-col gap-6">
            <h1 className="font-display text-3xl md:text-4xl font-black text-center">
              <span className="text-primary neon-text-cyan">Send</span>{" "}
              <span className="text-foreground">a {isText ? "Text" : "File"}</span>
            </h1>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3">
              <span className={`font-display text-sm ${!isText ? "text-primary" : "text-muted-foreground"}`}>File</span>
              <Switch checked={isText} onCheckedChange={setIsText} />
              <span className={`font-display text-sm ${isText ? "text-accent" : "text-muted-foreground"}`}>Text</span>
            </div>

            {isText ? (
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste your text here..."
                className="min-h-[200px] bg-card/60 backdrop-blur-md border-primary/30 focus:border-primary focus:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.15)] transition-shadow"
              />
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 bg-card/40 backdrop-blur-md ${
                  dragOver
                    ? "border-primary shadow-[0_0_25px_hsl(var(--neon-cyan)/0.25)]"
                    : "border-primary/30 hover:border-primary/60 hover:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.1)]"
                }`}
              >
                <Upload className="w-8 h-8 text-primary" />
                {file ? (
                  <div className="flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium truncate max-w-[250px]">{file.name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    Drag & drop a file here, or <span className="text-primary">click to browse</span>
                  </p>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                />
              </div>
            )}

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-display text-xs text-muted-foreground tracking-wide uppercase">
                Password (optional)
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password..."
                className="bg-card/60 backdrop-blur-md border-primary/20 focus:border-primary/50"
              />
              <span className="text-xs text-muted-foreground">
                Add password = file never expires, otherwise deleted after 10 days
              </span>
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full px-8 py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : "Upload"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Send;

import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload, Copy, Check, FileText, Loader2, Download, Eye, EyeOff } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import NeonParticles from "@/components/NeonParticles";
import Navbar from "@/components/Navbar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  const [showPassword, setShowPassword] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [countdown, setCountdown] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleUpload = async () => {
    if (!isText && !file) return toast.error("Please select a file.");
    if (isText && !textContent.trim()) return toast.error("Please enter some text.");
    if (!isText && file && file.size > 50 * 1024 * 1024) {
      return toast.error("File too large! Maximum size is 50MB");
    }

    setUploading(true);
    try {
      const generatedCode = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAtValue = password ? null : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();

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

        // Use XHR for upload progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve();
            else reject(new Error(`Upload failed with status ${xhr.status}`));
          };
          xhr.onerror = () => reject(new Error("Upload failed"));
          xhr.open("PUT", `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/pocketdrop-files/${path}`);
          xhr.setRequestHeader("Authorization", `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`);
          xhr.setRequestHeader("Content-Type", file!.type || "application/octet-stream");
          xhr.send(file!);
        });

        const { data: urlData } = supabase.storage
          .from("pocketdrop-files")
          .getPublicUrl(path);
        fileUrl = urlData.publicUrl;
        fileName = file!.name;
        fileType = file!.type || "application/octet-stream";
      }

      const { data: { session } } = await supabase.auth.getSession();

      const { error: dbError } = await supabase.from("files").insert({
        code: generatedCode,
        file_name: fileName,
        file_url: fileUrl,
        file_type: fileType,
        password: password || null,
        expires_at: expiresAtValue,
        is_text: isText,
        text_content: isText ? textContent : null,
        user_id: session?.user?.id ?? null,
      });
      if (dbError) throw dbError;

      setCode(generatedCode);
      setExpiresAt(expiresAtValue);
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

  useEffect(() => {
    if (!code || !expiresAt) return;
    const calc = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setCountdown("Expired"); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setCountdown(`Expires in: ${days} days ${hours} hours ${minutes} minutes`);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, [code, expiresAt]);

  const reset = () => {
    setCode(null);
    setFile(null);
    setTextContent("");
    setPassword("");
    setIsText(false);
    setExpiresAt(null);
    setCountdown("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NeonParticles />
      <Navbar>
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
      </Navbar>

      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] animate-pulse-glow" />

        {code ? (
          <div className="relative z-10 flex flex-col items-center text-center gap-6 animate-fade-in">
            <h2 className="font-display text-2xl font-bold text-foreground">Your code is ready!</h2>
            <span className="font-display text-6xl md:text-8xl font-black text-primary neon-text-cyan tracking-[0.3em]">
              {code}
            </span>
            <div ref={qrRef} className="bg-white p-4 rounded-xl border border-primary/40 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.3)]">
              <QRCodeCanvas value={`${window.location.origin}/get?code=${code}`} size={200} />
            </div>
            <button
              onClick={() => {
                const canvas = qrRef.current?.querySelector("canvas");
                if (!canvas) return;
                const url = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = url;
                a.download = `pocketdrop-${code}.png`;
                a.click();
              }}
              className="px-4 py-2 rounded-lg font-display font-bold text-xs tracking-wider border border-accent text-accent neon-text-purple hover:bg-accent/10 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download QR
            </button>
            {password ? (
              <p className="text-muted-foreground text-sm max-w-xs">
                Share this code. Password-protected — never expires.
              </p>
            ) : (
              <p
                className="text-yellow-400 text-sm font-display font-bold max-w-xs"
                style={{ filter: "drop-shadow(0 0 6px rgba(250, 204, 21, 0.5))" }}
              >
                {countdown}
              </p>
            )}
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
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password..."
                  className="bg-card/60 backdrop-blur-md border-primary/20 focus:border-primary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                  style={{ filter: "drop-shadow(0 0 4px hsl(var(--neon-cyan) / 0.5))" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

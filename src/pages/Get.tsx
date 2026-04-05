import { useState, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Copy, ArrowLeft, Loader2, Clipboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import NeonParticles from "@/components/NeonParticles";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

type PageState = "idle" | "loading" | "password" | "result" | "error";

interface FileData {
  file_name: string;
  file_url: string;
  file_type: string;
  is_text: boolean | null;
  text_content: string | null;
  password: string | null;
  expires_at: string | null;
}

const Get = () => {
  const [searchParams] = useSearchParams();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [state, setState] = useState<PageState>("idle");
  const [error, setError] = useState("");
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const preCode = searchParams.get("code");
    if (preCode && /^\d{6}$/.test(preCode)) {
      setDigits(preCode.split(""));
    }
  }, [searchParams]);

  useEffect(() => {
    supabase.functions.invoke('cleanup-files').catch(() => {});
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const code = digits.join("");

  const lookup = async () => {
    if (code.length !== 6) return;
    setState("loading");
    setError("");

    const { data, error: dbError } = await supabase
      .from("files")
      .select("*")
      .eq("code", code)
      .maybeSingle();

    if (dbError || !data) {
      setState("error");
      setError("Invalid code — no file found.");
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      setState("error");
      setError("This file has expired.");
      return;
    }

    setFileData(data);

    if (data.password) {
      setState("password");
    } else {
      setState("result");
    }
  };

  const checkPassword = () => {
    if (passwordInput === fileData?.password) {
      setState("result");
      setPasswordInput("");
    } else {
      setError("Incorrect password.");
    }
  };

  const copyText = () => {
    if (fileData?.text_content) {
      navigator.clipboard.writeText(fileData.text_content);
      toast.success("Text copied to clipboard!");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const extracted = text.replace(/\D/g, "").slice(0, 6);
      if (extracted.length > 0) {
        const next = Array(6).fill("");
        extracted.split("").forEach((d, i) => { next[i] = d; });
        setDigits(next);
        inputRefs.current[Math.min(extracted.length, 5)]?.focus();
      }
    } catch {
      toast.error("Unable to read clipboard.");
    }
  };

  const reset = () => {
    setDigits(Array(6).fill(""));
    setState("idle");
    setError("");
    setFileData(null);
    setPasswordInput("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NeonParticles />

      <div className="relative z-10">
      <Navbar>
        <Link to="/send" className="hover:text-primary transition-colors">Send</Link>
        <Link to="/get" className="hover:text-primary transition-colors">Receive</Link>
      </Navbar>

      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-16">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] animate-pulse-glow" />

        <div className="relative z-10 w-full max-w-lg">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>

          <h1 className="font-display text-3xl font-bold text-primary neon-text-cyan mb-2">Receive a File</h1>
          <p className="text-muted-foreground mb-10">Enter the 6-digit code to get your file.</p>

          {/* CODE INPUT */}
          {(state === "idle" || state === "loading" || state === "error") && (
            <div className="space-y-8">
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-display font-bold rounded-lg bg-muted/30 border border-primary/30 text-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] transition-all"
                  />
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={pasteFromClipboard}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-display rounded-md border border-accent text-accent neon-text-purple hover:bg-accent/10 transition-all"
                >
                  <Clipboard className="w-3.5 h-3.5" /> Paste Code
                </button>
              </div>

              {error && (
                <p className="text-center text-red-500 font-display text-sm" style={{ textShadow: "0 0 10px rgba(239,68,68,0.5)" }}>
                  {error}
                </p>
              )}

              <button
                onClick={lookup}
                disabled={code.length !== 6 || state === "loading"}
                className="w-full py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> Looking up…</> : "Get File"}
              </button>
            </div>
          )}

          {/* PASSWORD */}
          {state === "password" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-sm">This file is password-protected.</p>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setError(""); }}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg bg-muted/30 border border-primary/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_15px_hsl(var(--neon-cyan)/0.3)] transition-all"
              />
              {error && (
                <p className="text-red-500 font-display text-sm" style={{ textShadow: "0 0 10px rgba(239,68,68,0.5)" }}>
                  {error}
                </p>
              )}
              <button
                onClick={checkPassword}
                className="w-full py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all"
              >
                Unlock
              </button>
            </div>
          )}

          {/* RESULT */}
          {state === "result" && fileData && (
            <div className="space-y-8 text-center">
              {fileData.is_text ? (
                <>
                  <div className="p-6 rounded-xl bg-card/60 backdrop-blur-md border border-primary/20 text-left">
                    <p className="text-foreground whitespace-pre-wrap break-words text-sm">{fileData.text_content}</p>
                  </div>
                  <button
                    onClick={copyText}
                    className="w-full py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" /> Copy Text
                  </button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">{fileData.file_name}</p>
                  <a
                    href={fileData.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </>
              )}
              <button onClick={reset} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Look up another code
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
};

export default Get;

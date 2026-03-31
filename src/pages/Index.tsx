import { Upload, Hash, Download, ArrowRight } from "lucide-react";
import NeonParticles from "@/components/NeonParticles";

const steps = [
  { icon: Upload, label: "Upload", description: "Drop your file — any size, any type." },
  { icon: Hash, label: "Get Code", description: "Receive a unique 6-digit code instantly." },
  { icon: Download, label: "Download", description: "Share the code. They grab the file." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NeonParticles />
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <span className="font-display text-xl font-bold text-primary neon-text-cyan tracking-wider">
            PocketDrop
          </span>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#how" className="hover:text-primary transition-colors">How it works</a>
            <a href="#" className="hover:text-primary transition-colors">About</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center min-h-[110vh] px-6 pt-24 pb-16 overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/5 rounded-full blur-[120px] animate-pulse-glow" />

        <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight leading-tight relative z-10">
          <span className="text-primary neon-text-cyan">Share files.</span>
          <br />
          <span className="text-foreground">No login. </span>
          <span className="text-accent neon-text-purple">No risk.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-md relative z-10">
          Encrypted, anonymous file sharing with auto-expiring links. Just drop and go.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
          <button className="px-8 py-3 rounded-lg font-display font-bold text-sm tracking-wider bg-primary text-primary-foreground neon-box-cyan hover:brightness-110 transition-all">
            Send a File
          </button>
          <button className="px-8 py-3 rounded-lg font-display font-bold text-sm tracking-wider border border-accent text-accent neon-text-purple hover:bg-accent/10 transition-all">
            Receive a File
          </button>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-center text-primary neon-text-cyan mb-16 tracking-wide">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div
                key={step.label}
                className="relative flex flex-col items-center text-center p-8 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors group"
              >
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-5 group-hover:neon-box-cyan transition-shadow">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="font-display text-xs text-muted-foreground tracking-widest uppercase mb-2">
                  Step {i + 1}
                </span>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{step.label}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center">
        <span className="font-display text-sm text-muted-foreground tracking-wider">
          © 2026 <span className="text-primary neon-text-cyan">PocketDrop</span>. All rights reserved.
        </span>
      </footer>
    </div>
  );
};

export default Index;

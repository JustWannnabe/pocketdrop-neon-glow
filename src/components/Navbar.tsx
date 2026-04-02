import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between h-16 px-6">
          <Link to="/" className="font-display text-xl font-bold text-primary neon-text-cyan tracking-wider">
            PocketDrop
          </Link>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {children}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-foreground truncate max-w-[140px] text-xs">{user.email}</span>
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="inline-flex items-center gap-1 text-xs text-accent neon-text-purple hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-md text-xs font-display font-bold border border-accent text-accent neon-text-purple hover:bg-accent/10 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>
      <AuthModal open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
};

export default Navbar;

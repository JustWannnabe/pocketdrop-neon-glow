import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupaUser } from "@supabase/supabase-js";
import AuthModal from "./AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  children?: React.ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:brightness-125 transition-all focus:outline-none"
                    style={{ boxShadow: "0 0 14px hsl(var(--neon-cyan) / 0.35)" }}
                  >
                    <User className="w-4.5 h-4.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-background/95 backdrop-blur-xl border-primary/20 shadow-[0_0_20px_hsl(var(--neon-cyan)/0.1)] min-w-[200px]"
                >
                  <DropdownMenuLabel className="text-muted-foreground text-xs font-normal truncate">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-primary/10" />
                  <DropdownMenuItem
                    onClick={() => navigate("/my-uploads")}
                    className="cursor-pointer gap-2 text-foreground focus:bg-primary/10 focus:text-primary"
                  >
                    <Upload className="w-4 h-4" /> My Uploads
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => supabase.auth.signOut()}
                    className="cursor-pointer gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-1.5 rounded-md text-xs font-display font-bold border border-primary text-primary neon-text-cyan hover:bg-primary/10 transition-all"
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

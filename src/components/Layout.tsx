import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of ChargeBuddy",
      });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link to="/dashboard" className="font-semibold text-lg">
            ChargeBuddy
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/charging">Charging</Link>
            <Link to="/trips">Trips</Link>
            <Link to="/stations">Stations</Link>
            <Link to="/profile">Profile</Link>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="ml-2"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
};

export default Layout;
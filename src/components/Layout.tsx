import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

  const NavLinks = () => (
    <>
      <Link to="/dashboard" className="block py-2 hover:text-primary">Dashboard</Link>
      <Link to="/charging" className="block py-2 hover:text-primary">Charging</Link>
      <Link to="/trips" className="block py-2 hover:text-primary">Trips</Link>
      <Link to="/stations" className="block py-2 hover:text-primary">Stations</Link>
      <Link to="/profile" className="block py-2 hover:text-primary">Profile</Link>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container flex h-16 items-center px-4">
          <Link to="/dashboard" className="font-semibold text-lg">
            ChargeBuddy
          </Link>
          
          {/* Desktop Navigation */}
          <div className="ml-auto hidden md:flex items-center space-x-6">
            <NavLinks />
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

          {/* Mobile Navigation */}
          <div className="ml-auto md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex flex-col space-y-3">
                  <NavLinks />
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="justify-start px-0 hover:bg-transparent"
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
      <main className="container py-6 px-4">{children}</main>
    </div>
  );
};

export default Layout;
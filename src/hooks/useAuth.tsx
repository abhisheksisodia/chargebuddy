import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          toast({
            title: "Authentication Error",
            description: "There was a problem checking your login status. Please try logging in again.",
            variant: "destructive",
          });
        }
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error in session check:", error);
        setIsAuthenticated(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      if (event === 'SIGNED_OUT') {
        // Clear any stored auth data
        setIsAuthenticated(false);
        queryClient.clear();
      } else if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
      } else if (event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, queryClient]);

  return { isAuthenticated };
};
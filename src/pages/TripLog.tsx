import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TripStats } from "@/components/trips/TripStats";
import { TripForm } from "@/components/trips/TripForm";
import { TripHistory } from "@/components/trips/TripHistory";

interface TripFormData {
  start_location: string;
  end_location: string;
  date: string;
  distance: number;
  energy_used: number;
}

const TripLog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TripFormData>({
    start_location: "",
    end_location: "",
    date: new Date().toISOString().split("T")[0],
    distance: 0,
    energy_used: 0,
  });

  // Fetch trips
  const { data: trips, isLoading } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching trips:", error);
        throw error;
      }

      return data;
    },
  });

  // Calculate statistics
  const totalDistance = trips?.reduce((sum, trip) => sum + trip.distance, 0) || 0;
  const totalEnergy = trips?.reduce((sum, trip) => sum + trip.energy_used, 0) || 0;
  const averageEfficiency = totalDistance && totalEnergy 
    ? (totalEnergy / totalDistance).toFixed(2)
    : 0;

  // Add new trip mutation
  const addTripMutation = useMutation({
    mutationFn: async (newTrip: TripFormData) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("No authenticated user");

      const { data, error } = await supabase.from("trips").insert([
        {
          ...newTrip,
          user_id: userData.user.id,
        },
      ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast({
        title: "Trip logged successfully",
        description: "Your trip has been added to the log.",
      });
      // Reset form
      setFormData({
        start_location: "",
        end_location: "",
        date: new Date().toISOString().split("T")[0],
        distance: 0,
        energy_used: 0,
      });
    },
    onError: (error) => {
      console.error("Error adding trip:", error);
      toast({
        title: "Error logging trip",
        description: "There was a problem adding your trip. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTripMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-[1200px] mx-auto">
      <h1 className="text-2xl font-bold tracking-tight">Trip Log</h1>

      <TripStats
        totalDistance={totalDistance}
        totalEnergy={totalEnergy}
        averageEfficiency={averageEfficiency}
      />

      <TripForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />

      <TripHistory trips={trips} isLoading={isLoading} />
    </div>
  );
};

export default TripLog;
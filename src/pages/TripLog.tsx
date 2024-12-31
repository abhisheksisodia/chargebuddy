import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import { Car, Route, Zap } from "lucide-react";

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Trip Log</h1>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-100 rounded-full">
              <Route className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Distance</p>
              <p className="text-2xl font-bold">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-100 rounded-full">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Energy</p>
              <p className="text-2xl font-bold">{totalEnergy.toFixed(1)} kWh</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-100 rounded-full">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Efficiency</p>
              <p className="text-2xl font-bold">{averageEfficiency} kWh/km</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Trip Form */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Log New Trip</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_location">Start Location</Label>
              <Input
                id="start_location"
                value={formData.start_location}
                onChange={(e) =>
                  setFormData({ ...formData, start_location: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_location">End Location</Label>
              <Input
                id="end_location"
                value={formData.end_location}
                onChange={(e) =>
                  setFormData({ ...formData, end_location: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) =>
                  setFormData({ ...formData, distance: parseFloat(e.target.value) })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="energy_used">Energy Used (kWh)</Label>
              <Input
                id="energy_used"
                type="number"
                step="0.1"
                value={formData.energy_used}
                onChange={(e) =>
                  setFormData({ ...formData, energy_used: parseFloat(e.target.value) })
                }
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto">
            Log Trip
          </Button>
        </form>
      </Card>

      {/* Trips Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Trip History</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Start Location</TableHead>
                <TableHead>End Location</TableHead>
                <TableHead>Distance (km)</TableHead>
                <TableHead>Energy Used (kWh)</TableHead>
                <TableHead>Efficiency (kWh/km)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading trips...
                  </TableCell>
                </TableRow>
              ) : trips?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No trips logged yet.
                  </TableCell>
                </TableRow>
              ) : (
                trips?.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>{format(new Date(trip.date), "PPP")}</TableCell>
                    <TableCell>{trip.start_location}</TableCell>
                    <TableCell>{trip.end_location}</TableCell>
                    <TableCell>{trip.distance.toFixed(1)}</TableCell>
                    <TableCell>{trip.energy_used.toFixed(1)}</TableCell>
                    <TableCell>
                      {(trip.energy_used / trip.distance).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default TripLog;
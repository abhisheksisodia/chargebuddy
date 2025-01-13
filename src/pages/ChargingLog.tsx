import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/hooks/use-toast";
import { ChargingCostChart } from "@/components/charging/ChargingCostChart";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ChargingSession = {
  id: string;
  date: string;
  location: string;
  energy_added: number;
  cost: number;
};

interface RatePeriod {
  startMonth: number;
  endMonth: number;
  peakRate: number;
  offPeakRate: number;
  midPeakRate?: number;
  peakHours: { start: string; end: string }[];
  offPeakHours: { start: string; end: string }[];
  midPeakHours?: { start: string; end: string }[];
}

type ChargingLocation = {
  id: string;
  name: string;
  address: string;
  location_type: string;
  rate_periods: RatePeriod[];
};

const ChargingLog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [energyAdded, setEnergyAdded] = useState("");
  const [cost, setCost] = useState("");
  const [editingSession, setEditingSession] = useState<ChargingSession | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [customLocationName, setCustomLocationName] = useState("");

  // Fetch charging sessions
  const { data: sessions = [] } = useQuery({
    queryKey: ["charging-sessions"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("charging_sessions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch charging locations
  const { data: locations = [] } = useQuery({
    queryKey: ["charging-locations"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("charging_locations")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from("charging_sessions")
        .delete()
        .eq("id", sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-sessions"] });
      toast({
        title: "Success",
        description: "Charging session deleted successfully",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (session: ChargingSession) => {
      const { error } = await supabase
        .from("charging_sessions")
        .update({
          date: session.date,
          location: session.location,
          energy_added: session.energy_added,
          cost: session.cost,
        })
        .eq("id", session.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-sessions"] });
      setIsEditDialogOpen(false);
      setEditingSession(null);
      toast({
        title: "Success",
        description: "Charging session updated successfully",
      });
    },
  });

  // Calculate cost based on selected location and time

  // Calculate cost based on selected location and time
  const calculateCost = (locationId: string, energyUsed: number, chargeDate: Date) => {
    const location = locations.find(loc => loc.id === locationId);
    if (!location?.rate_periods?.length) return null;

    const month = chargeDate.getMonth() + 1;
    const hours = chargeDate.getHours();
    const minutes = chargeDate.getMinutes();

    const period = location.rate_periods.find(p => 
      month >= p.startMonth && month <= p.endMonth
    );

    if (!period) return null;

    const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    let rate = period.offPeakRate;

    const isPeakHour = period.peakHours.some(range => 
      time >= range.start && time <= range.end
    );

    if (isPeakHour) {
      rate = period.peakRate;
    } else if (period.midPeakHours) {
      const isMidPeakHour = period.midPeakHours.some(range => 
        time >= range.start && time <= range.end
      );
      if (isMidPeakHour && period.midPeakRate) {
        rate = period.midPeakRate;
      }
    }

    return rate * energyUsed;
  };

  // Handle location selection
  const handleLocationChange = (locationId: string) => {
    setSelectedLocation(locationId);
    if (energyAdded && date) {
      const calculatedCost = calculateCost(locationId, Number(energyAdded), new Date(date));
      if (calculatedCost) {
        setCost(calculatedCost.toFixed(2));
      }
    }
  };

  // Handle energy input
  const handleEnergyChange = (energy: string) => {
    setEnergyAdded(energy);
    if (selectedLocation && date) {
      const calculatedCost = calculateCost(selectedLocation, Number(energy), new Date(date));
      if (calculatedCost) {
        setCost(calculatedCost.toFixed(2));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Error",
          description: "You must be logged in to add charging sessions",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("charging_sessions").insert({
        date,
        location: selectedLocation,
        energy_added: Number(energyAdded),
        cost: Number(cost),
        user_id: user.user.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Charging session added successfully",
      });

      // Reset form
      setDate("");
      setSelectedLocation("");
      setEnergyAdded("");
      setCost("");

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["charging-sessions"] });
    } catch (error) {
      console.error("Error adding charging session:", error);
      toast({
        title: "Error",
        description: "Failed to add charging session",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this charging session?")) {
      deleteMutation.mutate(sessionId);
    }
  };

  const handleEdit = (session: ChargingSession) => {
    setEditingSession(session);
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    updateMutation.mutate(editingSession);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight dark:text-white">Charging Log</h1>
        <p className="text-muted-foreground dark:text-gray-400">
          Track your charging sessions and monitor costs
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="dark:text-gray-200">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location" className="dark:text-gray-200">Location</Label>
            <Select onValueChange={handleLocationChange} value={selectedLocation}>
              <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Location</SelectItem>
              </SelectContent>
            </Select>
            {selectedLocation === "custom" && (
              <Input
                value={customLocationName}
                onChange={(e) => setCustomLocationName(e.target.value)}
                placeholder="Enter location"
                className="mt-2 dark:bg-gray-700 dark:text-white"
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="energy" className="dark:text-gray-200">Energy Added (kWh)</Label>
            <Input
              id="energy"
              type="number"
              step="0.01"
              value={energyAdded}
              onChange={(e) => handleEnergyChange(e.target.value)}
              className="dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost" className="dark:text-gray-200">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="dark:bg-gray-700 dark:text-white"
              required
              readOnly={selectedLocation !== "custom"}
            />
          </div>
        </div>
        <Button type="submit" className="dark:bg-blue-600 dark:hover:bg-blue-700">
          Add Charging Session
        </Button>
      </form>

      {/* Chart */}
      <div className="rounded-lg border bg-card">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Charging Costs Over Time</h2>
          <ChargingCostChart data={sessions || []} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Energy Added (kWh)</TableHead>
              <TableHead>Cost ($)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{format(new Date(session.date), "PPp")}</TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>{session.energy_added}</TableCell>
                <TableCell>${session.cost}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(session)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Charging Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={editingSession?.date || ""}
                onChange={(e) =>
                  setEditingSession(
                    editingSession
                      ? { ...editingSession, date: e.target.value }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={editingSession?.location || ""}
                onChange={(e) =>
                  setEditingSession(
                    editingSession
                      ? { ...editingSession, location: e.target.value }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-energy">Energy Added (kWh)</Label>
              <Input
                id="edit-energy"
                type="number"
                step="0.01"
                value={editingSession?.energy_added || ""}
                onChange={(e) =>
                  setEditingSession(
                    editingSession
                      ? {
                          ...editingSession,
                          energy_added: Number(e.target.value),
                        }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cost">Cost ($)</Label>
              <Input
                id="edit-cost"
                type="number"
                step="0.01"
                value={editingSession?.cost || ""}
                onChange={(e) =>
                  setEditingSession(
                    editingSession
                      ? { ...editingSession, cost: Number(e.target.value) }
                      : null
                  )
                }
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChargingLog;

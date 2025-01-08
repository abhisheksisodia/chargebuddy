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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil, Trash2 } from "lucide-react";

type ChargingSession = {
  id: string;
  date: string;
  location: string;
  energy_added: number;
  cost: number;
};

const ChargingLog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [energyAdded, setEnergyAdded] = useState("");
  const [cost, setCost] = useState("");
  const [editingSession, setEditingSession] = useState<ChargingSession | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch charging sessions
  const { data: sessions, refetch } = useQuery({
    queryKey: ["charging-sessions"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase
        .from("charging_sessions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching charging sessions:", error);
        throw error;
      }

      return data as ChargingSession[];
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
    onError: (error) => {
      console.error("Error deleting charging session:", error);
      toast({
        title: "Error",
        description: "Failed to delete charging session",
        variant: "destructive",
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
    onError: (error) => {
      console.error("Error updating charging session:", error);
      toast({
        title: "Error",
        description: "Failed to update charging session",
        variant: "destructive",
      });
    },
  });

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
        location,
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
      setLocation("");
      setEnergyAdded("");
      setCost("");

      // Refresh data
      refetch();
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
        <h1 className="text-2xl font-bold tracking-tight">Charging Log</h1>
        <p className="text-muted-foreground">
          Track your charging sessions and monitor costs
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="energy">Energy Added (kWh)</Label>
            <Input
              id="energy"
              type="number"
              step="0.01"
              value={energyAdded}
              onChange={(e) => setEnergyAdded(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cost">Cost ($)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              required
            />
          </div>
        </div>
        <Button type="submit">Add Charging Session</Button>
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
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { ChargingCostChart } from "@/components/charging/ChargingCostChart";
import { format } from "date-fns";

type ChargingSession = {
  id: string;
  date: string;
  location: string;
  energy_added: number;
  cost: number;
};

const ChargingLog = () => {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [energyAdded, setEnergyAdded] = useState("");
  const [cost, setCost] = useState("");

  // Fetch charging sessions
  const { data: sessions, refetch } = useQuery({
    queryKey: ["charging-sessions"],
    queryFn: async () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from("charging_sessions").insert([
        {
          date,
          location,
          energy_added: Number(energyAdded),
          cost: Number(cost),
        },
      ]);

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
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {format(new Date(session.date), "PPp")}
                </TableCell>
                <TableCell>{session.location}</TableCell>
                <TableCell>{session.energy_added}</TableCell>
                <TableCell>${session.cost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ChargingLog;
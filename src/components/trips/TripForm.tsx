import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface TripFormData {
  start_location: string;
  end_location: string;
  date: string;
  distance: number;
  energy_used: number;
}

interface TripFormProps {
  formData: TripFormData;
  setFormData: (data: TripFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const TripForm = ({ formData, setFormData, onSubmit }: TripFormProps) => {
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Log New Trip</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
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
          <div className="space-y-2 sm:col-span-2 md:col-span-1">
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
        <Button type="submit" className="w-full sm:w-auto">
          Log Trip
        </Button>
      </form>
    </Card>
  );
};
import { Card } from "@/components/ui/card";
import { Route, Zap, Car } from "lucide-react";

interface TripStatsProps {
  totalDistance: number;
  totalEnergy: number;
  averageEfficiency: number | string;
}

export const TripStats = ({ totalDistance, totalEnergy, averageEfficiency }: TripStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary-100 rounded-full">
            <Route className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Distance</p>
            <p className="text-xl font-bold">{totalDistance.toFixed(1)} km</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary-100 rounded-full">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Energy</p>
            <p className="text-xl font-bold">{totalEnergy.toFixed(1)} kWh</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-primary-100 rounded-full">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Avg. Efficiency</p>
            <p className="text-xl font-bold">{averageEfficiency} kWh/km</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

interface Trip {
  id: string;
  date: string;
  start_location: string;
  end_location: string;
  distance: number;
  energy_used: number;
}

interface TripHistoryProps {
  trips: Trip[] | undefined;
  isLoading: boolean;
}

export const TripHistory = ({ trips, isLoading }: TripHistoryProps) => {
  return (
    <Card className="p-4 sm:p-6">
      <h2 className="text-lg font-semibold mb-4">Trip History</h2>
      <div className="rounded-md border overflow-x-auto">
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
                  <TableCell className="max-w-[200px] truncate">
                    {trip.start_location}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {trip.end_location}
                  </TableCell>
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
  );
};
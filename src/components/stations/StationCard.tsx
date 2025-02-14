import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, DollarSign, Plug } from "lucide-react";

interface Station {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
  };
  UsageCost: string;
  Connections: Array<{
    ConnectionType: {
      Title: string;
    };
    PowerKW: number;
  }>;
}

interface StationCardProps {
  station: Station;
}

export const StationCard = ({ station }: StationCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">
          {station.AddressInfo.Title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-sm">
              {station.AddressInfo.AddressLine1}
              <br />
              {station.AddressInfo.Town}, {station.AddressInfo.StateOrProvince}{" "}
              {station.AddressInfo.Postcode}
            </p>
          </div>
          
          {station.UsageCost && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm">{station.UsageCost}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-muted-foreground" />
            <div className="text-sm">
              {station.Connections.map((conn, idx) => (
                <div key={idx}>
                  {conn.ConnectionType.Title} - {conn.PowerKW}kW
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
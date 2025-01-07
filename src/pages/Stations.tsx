import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, DollarSign, Plug, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Station {
  ID: number;
  AddressInfo: {
    Title: string;
    AddressLine1: string;
    Town: string;
    StateOrProvince: string;
    Postcode: string;
    Latitude: number;
    Longitude: number;
  };
  UsageCost: string;
  Connections: Array<{
    ConnectionType: {
      Title: string;
    };
    PowerKW: number;
  }>;
}

const Stations = () => {
  const [location, setLocation] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);
  const { toast } = useToast();

  const fetchStations = async (searchLocation: string) => {
    try {
      // First, get coordinates using our Edge Function
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode', {
        body: { location: searchLocation }
      });

      console.log('Geocode response from Edge Function:', geocodeData);

      if (geocodeError) {
        console.error('Geocode error:', geocodeError);
        throw new Error("Failed to geocode location");
      }

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Location not found");
      }

      const { lat, lng } = geocodeData.results[0].geometry;
      console.log("Coordinates:", { lat, lng });

      // Now fetch charging stations using the coordinates
      const stationsResponse = await fetch(
        `https://api.openchargemap.io/v3/poi/?output=json&countrycode=US&maxresults=10&compact=true&verbose=false&latitude=${lat}&longitude=${lng}&distance=10&distanceunit=miles`,
        {
          headers: {
            "X-API-Key": "74d7f928-32d3-4c06-9427-ef65d2c9c016",
          },
        }
      );

      if (!stationsResponse.ok) {
        throw new Error("Failed to fetch stations");
      }

      const data = await stationsResponse.json();
      console.log("Stations data:", data);
      return data;
    } catch (error) {
      console.error("Error in fetchStations:", error);
      throw error;
    }
  };

  const { data: stations, isLoading } = useQuery({
    queryKey: ["stations", location],
    queryFn: () => fetchStations(location),
    enabled: searchInitiated && !!location,
    meta: {
      onError: (error: Error) => {
        console.error("Error fetching stations:", error);
        toast({
          title: "Error",
          description: "Failed to fetch charging stations. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleSearch = () => {
    if (!location) {
      toast({
        title: "Error",
        description: "Please enter a location to search",
        variant: "destructive",
      });
      return;
    }
    setSearchInitiated(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Charging Stations</h1>
      
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Enter location (e.g., city, address)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="max-w-md"
        />
        <Button onClick={handleSearch}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      {isLoading && <p>Loading stations...</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stations?.map((station: Station) => (
          <Card key={station.ID} className="hover:shadow-lg transition-shadow">
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
        ))}
      </div>

      {searchInitiated && stations?.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">
          No charging stations found in this area.
        </p>
      )}
    </div>
  );
};

export default Stations;
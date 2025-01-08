import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StationCard } from "@/components/stations/StationCard";
import { LocationSearch } from "@/components/stations/LocationSearch";
import { useState } from "react";

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
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const fetchStations = async (lat: number, lng: number) => {
    try {
      console.log("Fetching stations for coordinates:", { lat, lng });
      
      const stationsResponse = await fetch(
        `https://api.openchargemap.io/v3/poi/?output=json&countrycode=US&maxresults=10&compact=true&verbose=false&latitude=${lat}&longitude=${lng}&distance=10&distanceunit=miles`,
        {
          headers: {
            "X-API-Key": "09dd6a7c-5fa2-443d-a761-6d9e1591943e",
          },
        }
      );

      if (!stationsResponse.ok) {
        throw new Error("Failed to fetch stations");
      }

      const data = await stationsResponse.json();
      console.log("Raw stations data:", data);
      
      if (!Array.isArray(data)) {
        console.error("Invalid response format:", data);
        return [];
      }

      return data;
    } catch (error) {
      console.error("Error in fetchStations:", error);
      throw error;
    }
  };

  const { data: stations, isLoading } = useQuery({
    queryKey: ["stations", coordinates?.lat, coordinates?.lng],
    queryFn: () => coordinates ? fetchStations(coordinates.lat, coordinates.lng) : Promise.resolve([]),
    enabled: searchInitiated && !!coordinates,
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

  const handleLocationSelect = (location: string, coords: { lat: number; lng: number }) => {
    console.log("Location selected:", location, coords);
    setCoordinates(coords);
    setSearchInitiated(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Charging Stations</h1>
      
      <LocationSearch onLocationSelect={handleLocationSelect} />

      {isLoading && <p>Loading stations...</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stations?.map((station: Station) => (
          <StationCard key={station.ID} station={station} />
        ))}
      </div>

      {searchInitiated && stations?.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground mt-8">
          No charging stations found in this area.
        </p>
      )}
    </div>
  );
};

export default Stations;
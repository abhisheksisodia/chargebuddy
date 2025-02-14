
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

const isDevelopment = process.env.NODE_ENV === 'development';
const debugLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

const Stations = () => {
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(50);
  const { toast } = useToast();

  const fetchStations = async (lat: number, lng: number, radius: number) => {
    try {
      debugLog("Starting fetchStations with params:", { lat, lng, radius });
      
      const apiUrl = `https://api.openchargemap.io/v3/poi/?output=json&countrycode=US&maxresults=10&compact=true&verbose=false&latitude=${lat}&longitude=${lng}&distance=${radius}&distanceunit=KM`;
      debugLog("Fetching from URL:", apiUrl);
      
      const stationsResponse = await fetch(
        apiUrl,
        {
          headers: {
            "X-API-Key": "09dd6a7c-5fa2-443d-a761-6d9e1591943e",
          },
        }
      );

      debugLog("Response status:", stationsResponse.status);
      
      if (!stationsResponse.ok) {
        const errorText = await stationsResponse.text();
        debugLog("Error response:", errorText);
        throw new Error(`Failed to fetch stations: ${stationsResponse.status} ${errorText}`);
      }

      const data = await stationsResponse.json();
      debugLog("Raw stations data:", data);
      
      if (!Array.isArray(data)) {
        debugLog("Invalid response format - not an array:", data);
        return [];
      }

      debugLog("Number of stations found:", data.length);
      return data;
    } catch (error) {
      debugLog("Error in fetchStations:", error);
      throw error;
    }
  };

  const { data: stations, isLoading } = useQuery({
    queryKey: ["stations", coordinates?.lat, coordinates?.lng, searchRadius],
    queryFn: () => coordinates ? fetchStations(coordinates.lat, coordinates.lng, searchRadius) : Promise.resolve([]),
    enabled: searchInitiated && !!coordinates,
    meta: {
      onError: (error: Error) => {
        debugLog("Query error:", error);
        toast({
          title: "Error",
          description: "Failed to fetch charging stations. Please try again.",
          variant: "destructive",
        });
      }
    }
  });

  const handleLocationSelect = (location: string, coords: { lat: number; lng: number }, radius?: number) => {
    debugLog("Location selected:", { location, coords, radius });
    setCoordinates(coords);
    setSearchRadius(radius || 50);
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

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, DollarSign, Plug, Search, Locate } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import debounce from "lodash/debounce";

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

interface LocationSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

const Stations = () => {
  const [location, setLocation] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  // Function to get user's current location
  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setCoordinates({ lat, lng });
          // Reverse geocode to get address
          reverseGeocode(lat, lng);
          setSearchInitiated(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enter an address manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const { data: geocodeData } = await supabase.functions.invoke('geocode', {
        body: { lat, lng, mode: 'reverse' }
      });
      
      if (geocodeData?.results?.[0]?.formatted) {
        setLocation(geocodeData.results[0].formatted);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Debounced function to fetch address suggestions
  const fetchSuggestions = debounce(async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: geocodeData } = await supabase.functions.invoke('geocode', {
        body: { location: input }
      });

      if (geocodeData?.results) {
        setSuggestions(geocodeData.results);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, 300);

  useEffect(() => {
    if (location) {
      fetchSuggestions(location);
    }
  }, [location]);

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
      
      // Ensure the response is an array and has the expected structure
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

  const handleSearch = async () => {
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

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.formatted);
    setCoordinates(suggestion.geometry);
    setOpen(false);
    setSearchInitiated(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Find Charging Stations</h1>
      
      <div className="flex flex-col gap-4 mb-8 sm:flex-row">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-start"
              >
                {location || "Enter location..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput
                  placeholder="Search location..."
                  value={location}
                  onValueChange={setLocation}
                />
                <CommandEmpty>No location found.</CommandEmpty>
                <CommandGroup>
                  {suggestions.map((suggestion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      {suggestion.formatted}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" onClick={getCurrentLocation}>
            <Locate className="h-4 w-4 mr-2" />
            Use My Location
          </Button>
        </div>
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

      {searchInitiated && stations?.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground mt-8">
          No charging stations found in this area.
        </p>
      )}
    </div>
  );
};

export default Stations;
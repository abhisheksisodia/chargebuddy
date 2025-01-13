import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Locate, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const isDevelopment = process.env.NODE_ENV === 'development';
const debugLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

interface LocationSearchProps {
  onLocationSelect: (location: string, coordinates: { lat: number; lng: number }, radius?: number) => void;
}

interface LocationSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

const radiusOptions = [
  { value: "10", label: "10 km" },
  { value: "25", label: "25 km" },
  { value: "50", label: "50 km" },
  { value: "100", label: "100 km" },
];

export const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [radius, setRadius] = useState("50"); // Default to 50km
  const { toast } = useToast();

  const fetchSuggestions = debounce(async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      debugLog('Fetching suggestions for:', input);
      const { data: geocodeData, error } = await supabase.functions.invoke('geocode', {
        body: { location: input }
      });

      if (error) {
        debugLog('Error fetching suggestions:', error);
        setSuggestions([]);
        return;
      }

      // Add more detailed logging
      debugLog('Raw geocode response:', geocodeData);

      // Initialize an empty array for valid results
      let validResults: LocationSuggestion[] = [];

      // Ensure geocodeData and results exist and are valid
      if (geocodeData?.results && Array.isArray(geocodeData.results)) {
        validResults = geocodeData.results.filter((result): result is LocationSuggestion => 
          result?.formatted && 
          typeof result.formatted === 'string' &&
          result?.geometry?.lat != null && 
          result?.geometry?.lng != null &&
          typeof result.geometry.lat === 'number' &&
          typeof result.geometry.lng === 'number'
        );
        
        debugLog('Filtered valid results:', validResults);
      } else {
        debugLog('No valid results found or malformed response:', geocodeData);
      }

      // Always set a valid array, even if empty
      setSuggestions(validResults);
    } catch (error) {
      debugLog('Error in fetchSuggestions:', error);
      // Ensure we set an empty array rather than undefined
      setSuggestions([]);
      toast({
        title: "Error",
        description: "Failed to fetch location suggestions. Please try again.",
        variant: "destructive",
      });
    }
  }, 300);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          debugLog('Got current position:', { lat, lng });
          try {
            debugLog('Reverse geocoding for coordinates:', { lat, lng });
            const { data: geocodeData, error } = await supabase.functions.invoke('geocode', {
              body: { lat, lng, mode: 'reverse' }
            });
            
            if (error) {
              debugLog('Reverse geocoding error:', error);
              toast({
                title: "Error",
                description: "Could not get your location. Please try again.",
                variant: "destructive",
              });
              return;
            }

            if (geocodeData?.results?.[0]?.formatted) {
              const locationName = geocodeData.results[0].formatted;
              debugLog('Location found:', locationName);
              setLocation(locationName);
              onLocationSelect(locationName, { lat, lng }, parseInt(radius));
            } else {
              debugLog('No location found for coordinates:', { lat, lng });
              toast({
                title: "Error",
                description: "Could not find address for your location. Please try searching manually.",
                variant: "destructive",
              });
            }
          } catch (error) {
            debugLog('Reverse geocoding error:', error);
            toast({
              title: "Error",
              description: "Could not get your location. Please try again.",
              variant: "destructive",
            });
          }
        },
        (error) => {
          debugLog("Geolocation error:", error);
          toast({
            title: "Error",
            description: "Could not access your location. Please enable location services and try again.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    debugLog('Selected suggestion:', suggestion);
    setLocation(suggestion.formatted);
    setOpen(false);
    onLocationSelect(suggestion.formatted, suggestion.geometry, parseInt(radius));
  };

  return (
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
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search location..."
                value={location}
                onValueChange={(value) => {
                  setLocation(value);
                  fetchSuggestions(value);
                }}
              />
              <CommandEmpty>No location found.</CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion, index) => (
                  <CommandItem
                    key={index}
                    value={suggestion.formatted}
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
        <Select
          value={radius}
          onValueChange={setRadius}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Radius" />
          </SelectTrigger>
          <SelectContent>
            {radiusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => {
          if (location) {
            const suggestion = suggestions.find(s => s.formatted === location);
            if (suggestion) {
              handleSuggestionSelect(suggestion);
            }
          }
        }}>
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button variant="outline" onClick={getCurrentLocation}>
          <Locate className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
      </div>
    </div>
  );
};
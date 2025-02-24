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

// Default Toronto location
const torontoSuggestion: LocationSuggestion = {
  formatted: "Toronto, Ontario, Canada",
  geometry: {
    lat: 43.6532,
    lng: -79.3832
  }
};

export const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([torontoSuggestion]);
  const [radius, setRadius] = useState("50"); // Default to 50km
  const { toast } = useToast();

  const fetchSuggestions = debounce(async (input: string) => {
    if (!input) {
      setSuggestions([torontoSuggestion]);
      return;
    }

    try {
      debugLog('Fetching suggestions for:', input);
      setSuggestions([torontoSuggestion]);
    } catch (error) {
      debugLog('Error in fetchSuggestions:', error);
      setSuggestions([torontoSuggestion]);
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
          setLocation(torontoSuggestion.formatted);
          onLocationSelect(torontoSuggestion.formatted, torontoSuggestion.geometry, parseInt(radius));
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
                {suggestions?.map((suggestion, index) => (
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
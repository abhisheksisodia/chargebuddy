import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Locate, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";

interface LocationSearchProps {
  onLocationSelect: (location: string, coordinates: { lat: number; lng: number }) => void;
}

interface LocationSuggestion {
  formatted: string;
  geometry: {
    lat: number;
    lng: number;
  };
}

export const LocationSearch = ({ onLocationSelect }: LocationSearchProps) => {
  const [location, setLocation] = useState("");
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);

  const fetchSuggestions = debounce(async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      const { data: geocodeData, error } = await supabase.functions.invoke('geocode', {
        body: { location: input }
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        return;
      }

      if (geocodeData?.results) {
        console.log('Geocode results:', geocodeData.results);
        setSuggestions(geocodeData.results);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }, 300);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          try {
            const { data: geocodeData } = await supabase.functions.invoke('geocode', {
              body: { lat, lng, mode: 'reverse' }
            });
            
            if (geocodeData?.results?.[0]?.formatted) {
              const locationName = geocodeData.results[0].formatted;
              setLocation(locationName);
              onLocationSelect(locationName, { lat, lng });
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.formatted);
    setOpen(false);
    onLocationSelect(suggestion.formatted, suggestion.geometry);
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
          <PopoverContent className="w-full p-0">
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
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Locate, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import debounce from "lodash/debounce";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const fetchSuggestions = debounce(async (input: string) => {
    if (!input) {
      setSuggestions([]);
      return;
    }

    try {
      console.log('Fetching suggestions for:', input);
      const { data: geocodeData, error } = await supabase.functions.invoke('geocode', {
        body: { location: input }
      });

      if (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
        return;
      }

      if (geocodeData?.results && Array.isArray(geocodeData.results)) {
        console.log('Geocode results:', geocodeData.results);
        setSuggestions(geocodeData.results);
      } else {
        console.log('No valid results found:', geocodeData);
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, 300);

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          try {
            console.log('Reverse geocoding for coordinates:', { lat, lng });
            const { data: geocodeData, error } = await supabase.functions.invoke('geocode', {
              body: { lat, lng, mode: 'reverse' }
            });
            
            if (error) {
              console.error('Reverse geocoding error:', error);
              toast({
                title: "Error",
                description: "Could not get your location. Please try again.",
                variant: "destructive",
              });
              return;
            }

            if (geocodeData?.results?.[0]?.formatted) {
              const locationName = geocodeData.results[0].formatted;
              console.log('Location found:', locationName);
              setLocation(locationName);
              onLocationSelect(locationName, { lat, lng });
            } else {
              console.log('No location found for coordinates:', { lat, lng });
              toast({
                title: "Error",
                description: "Could not find address for your location. Please try searching manually.",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error('Reverse geocoding error:', error);
            toast({
              title: "Error",
              description: "Could not get your location. Please try again.",
              variant: "destructive",
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
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
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Plus, Sun, Moon, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type RatePeriod = {
  startMonth: number;
  endMonth: number;
  peakRate: number;
  offPeakRate: number;
  midPeakRate?: number;
  peakHours: { start: string; end: string }[];
  offPeakHours: { start: string; end: string }[];
  midPeakHours?: { start: string; end: string }[];
};

type ChargingLocation = {
  id: string;
  name: string;
  address: string;
  location_type: "home" | "work" | "favorite";
  rate_periods: RatePeriod[];
  notes?: string;
};

const locationFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  locationType: z.enum(["home", "work", "favorite"]),
  notes: z.string().optional(),
  ratePeriods: z.array(z.object({
    startMonth: z.number().min(1).max(12),
    endMonth: z.number().min(1).max(12),
    peakRate: z.number().min(0),
    offPeakRate: z.number().min(0),
    midPeakRate: z.number().min(0).optional(),
    peakHours: z.array(z.object({
      start: z.string(),
      end: z.string()
    })),
    offPeakHours: z.array(z.object({
      start: z.string(),
      end: z.string()
    })),
    midPeakHours: z.array(z.object({
      start: z.string(),
      end: z.string()
    })).optional()
  })).default([])
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

const ChargingLocations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [ratePeriods, setRatePeriods] = useState<RatePeriod[]>([]);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      locationType: "favorite",
      notes: "",
      ratePeriods: []
    },
  });

  const { data: locations = [], isLoading } = useQuery<ChargingLocation[]>({
    queryKey: ["charging-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charging_locations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      // Explicitly type and transform the data
      const typedData = data.map(location => ({
        ...location,
        location_type: location.location_type as "home" | "work" | "favorite",
        rate_periods: (location.rate_periods || []) as RatePeriod[]
      }));
      
      return typedData;
    },
  });

  const addLocation = useMutation({
    mutationFn: async (values: LocationFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase.from("charging_locations").insert({
        name: values.name,
        address: values.address,
        location_type: values.locationType,
        notes: values.notes,
        rate_periods: values.ratePeriods,
        user_id: user.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-locations"] });
      setShowLocationForm(false);
      form.reset();
      toast({
        title: "Success",
        description: "Charging location added successfully",
      });
    },
  });

  const addRatePeriod = () => {
    const newPeriod: RatePeriod = {
      startMonth: 1,
      endMonth: 12,
      peakRate: 0,
      offPeakRate: 0,
      peakHours: [{ start: "09:00", end: "17:00" }],
      offPeakHours: [{ start: "19:00", end: "07:00" }],
      midPeakHours: [{ start: "17:00", end: "19:00" }]
    };
    setRatePeriods([...ratePeriods, newPeriod]);
  };

  return (
    <Card className="p-6 dark:bg-gray-800">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold dark:text-white">Charging Locations</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLocationForm(!showLocationForm)}
          className="dark:bg-gray-700 dark:text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {showLocationForm && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => addLocation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Location Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="dark:bg-gray-700 dark:text-white" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="locationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-gray-200">Location Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="dark:bg-gray-700 dark:text-white">
                        <SelectValue placeholder="Select location type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="favorite">Favorite</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Rate Periods Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-medium dark:text-gray-200">Rate Periods</h3>
                <Button type="button" variant="outline" onClick={addRatePeriod} className="dark:bg-gray-700">
                  Add Rate Period
                </Button>
              </div>
              
              {ratePeriods.map((period, index) => (
                <div key={index} className="p-4 border rounded-lg dark:border-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`ratePeriods.${index}.startMonth`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200">Start Month</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ratePeriods.${index}.endMonth`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200">End Month</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="dark:bg-gray-700">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <FormField
                      control={form.control}
                      name={`ratePeriods.${index}.peakRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200">Peak Rate ($/kWh)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="dark:bg-gray-700"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ratePeriods.${index}.offPeakRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200">Off-Peak Rate ($/kWh)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="dark:bg-gray-700"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`ratePeriods.${index}.midPeakRate`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200">Mid-Peak Rate ($/kWh)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              className="dark:bg-gray-700"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Time of Day Section */}
                  <div className="mt-4 space-y-4">
                    <div>
                      <FormLabel className="dark:text-gray-200">Peak Hours</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`ratePeriods.${index}.peakHours.0.start`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-200">Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="dark:bg-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ratePeriods.${index}.peakHours.0.end`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-200">End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="dark:bg-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <FormLabel className="dark:text-gray-200">Off-Peak Hours</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`ratePeriods.${index}.offPeakHours.0.start`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-200">Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="dark:bg-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ratePeriods.${index}.offPeakHours.0.end`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-200">End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="dark:bg-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <FormLabel className="dark:text-gray-200">Mid-Peak Hours (Optional)</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`ratePeriods.${index}.midPeakHours.0.start`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-200">Start Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="dark:bg-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`ratePeriods.${index}.midPeakHours.0.end`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="dark:text-gray-200">End Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="dark:bg-gray-700"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={addLocation.isPending}>
                {addLocation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Location
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationForm(false)}
                className="dark:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* Location List */}
      <div className="space-y-4 mt-6">
        {locations.length === 0 ? (
          <p className="text-muted-foreground text-center py-4 dark:text-gray-400">
            No charging locations added yet
          </p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="flex flex-col space-y-2 p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center dark:text-white">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {location.name}
                  </h3>
                  <p className="text-sm text-muted-foreground dark:text-gray-300">
                    {location.address}
                  </p>
                </div>
              </div>
              
              {location.rate_periods && location.rate_periods.length > 0 && (
                <div className="mt-4 space-y-2">
                  {location.rate_periods.map((period, index) => (
                    <div key={index} className="text-sm dark:text-gray-300">
                      <p className="font-medium">
                        {new Date(0, period.startMonth - 1).toLocaleString('default', { month: 'short' })} - 
                        {new Date(0, period.endMonth - 1).toLocaleString('default', { month: 'short' })}
                      </p>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <div className="flex items-center">
                          <Sun className="h-4 w-4 mr-1" />
                          Peak: ${period.peakRate}/kWh
                          <span className="ml-1 text-xs">
                            ({period.peakHours[0].start}-{period.peakHours[0].end})
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-1" />
                          Off-Peak: ${period.offPeakRate}/kWh
                          <span className="ml-1 text-xs">
                            ({period.offPeakHours[0].start}-{period.offPeakHours[0].end})
                          </span>
                        </div>
                        {period.midPeakRate && period.midPeakHours && (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Mid-Peak: ${period.midPeakRate}/kWh
                            <span className="ml-1 text-xs">
                              ({period.midPeakHours[0].start}-{period.midPeakHours[0].end})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ChargingLocations;

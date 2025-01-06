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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Plus, Trash, Sun, Snowflake, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Database } from "@/integrations/supabase/types";

type ChargingLocation = Database["public"]["Tables"]["charging_locations"]["Row"];
type InsertChargingLocation = Database["public"]["Tables"]["charging_locations"]["Insert"];

const locationFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  peak_rate: z.coerce.number().min(0, "Rate must be positive").nullable(),
  off_peak_rate: z.coerce.number().min(0, "Rate must be positive").nullable(),
  super_off_peak_rate: z.coerce.number().min(0, "Rate must be positive").nullable(),
  summer_rate: z.coerce.number().min(0, "Rate must be positive").nullable(),
  winter_rate: z.coerce.number().min(0, "Rate must be positive").nullable(),
  notes: z.string().optional(),
  is_default: z.boolean().default(false),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

const ChargingLocations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLocationForm, setShowLocationForm] = useState(false);

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["charging-locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("charging_locations")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      peak_rate: null,
      off_peak_rate: null,
      super_off_peak_rate: null,
      summer_rate: null,
      winter_rate: null,
      notes: "",
      is_default: false,
    },
  });

  const addLocation = useMutation({
    mutationFn: async (values: LocationFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const locationData: InsertChargingLocation = {
        ...values,
        user_id: user.id,
      };

      const { error } = await supabase
        .from("charging_locations")
        .insert(locationData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-locations"] });
      setShowLocationForm(false);
      form.reset();
      toast({
        title: "Location added",
        description: "Your charging location has been saved successfully.",
      });
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("charging_locations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charging-locations"] });
      toast({
        title: "Location deleted",
        description: "Your charging location has been deleted successfully.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Charging Locations</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLocationForm(!showLocationForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {showLocationForm && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => addLocation.mutate(data))}
            className="space-y-4 mb-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="peak_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peak Rate ($/kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="off_peak_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Off-Peak Rate ($/kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="super_off_peak_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Super Off-Peak Rate ($/kWh)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="summer_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Summer Rate ($/kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="winter_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Winter Rate ($/kWh)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}

      <div className="space-y-4">
        {locations.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No charging locations added yet
          </p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className="flex flex-col space-y-2 p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {location.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteLocation.mutate(location.id)}
                  disabled={deleteLocation.isPending}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Time-based Rates
                  </p>
                  <ul className="text-sm space-y-1">
                    {location.peak_rate && (
                      <li>Peak: ${location.peak_rate}/kWh</li>
                    )}
                    {location.off_peak_rate && (
                      <li>Off-Peak: ${location.off_peak_rate}/kWh</li>
                    )}
                    {location.super_off_peak_rate && (
                      <li>Super Off-Peak: ${location.super_off_peak_rate}/kWh</li>
                    )}
                  </ul>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center">
                    <Sun className="h-4 w-4 mr-1" />
                    Summer Rate
                  </p>
                  {location.summer_rate ? (
                    <p className="text-sm">${location.summer_rate}/kWh</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not set</p>
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium flex items-center">
                    <Snowflake className="h-4 w-4 mr-1" />
                    Winter Rate
                  </p>
                  {location.winter_rate ? (
                    <p className="text-sm">${location.winter_rate}/kWh</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not set</p>
                  )}
                </div>
              </div>
              {location.notes && (
                <p className="text-sm text-muted-foreground mt-2">{location.notes}</p>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ChargingLocations;

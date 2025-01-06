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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const vehicleFormSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce
    .number()
    .min(1900, "Year must be after 1900")
    .max(new Date().getFullYear() + 1, "Year cannot be in the future"),
  battery_capacity: z.coerce
    .number()
    .min(1, "Battery capacity must be greater than 0"),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

type Vehicle = VehicleFormValues & {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

const VehicleManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      battery_capacity: 0,
    },
  });

  const addVehicle = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'> = {
        ...values,
        user_id: user.id,
      };

      const { error } = await supabase
        .from("vehicles")
        .insert(vehicleData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowVehicleForm(false);
      form.reset();
      toast({
        title: "Vehicle added",
        description: "Your vehicle has been added successfully.",
      });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("vehicles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Vehicle deleted",
        description: "Your vehicle has been deleted successfully.",
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
        <h2 className="text-lg font-semibold">Vehicles</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVehicleForm(!showVehicleForm)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {showVehicleForm && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => addVehicle.mutate(data))}
            className="space-y-4 mb-6"
          >
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="battery_capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Battery Capacity (kWh)</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" step="0.1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={addVehicle.isPending}>
                {addVehicle.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Vehicle
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowVehicleForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      )}

      <div className="space-y-4">
        {vehicles.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No vehicles added yet
          </p>
        ) : (
          vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
            >
              <div>
                <h3 className="font-medium">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Battery Capacity: {vehicle.battery_capacity} kWh
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteVehicle.mutate(vehicle.id)}
                disabled={deleteVehicle.isPending}
              >
                <Trash className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default VehicleManager;

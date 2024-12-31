import { useState, useEffect } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { TablesInsert } from "@/integrations/supabase/types";

const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

// Update the schema to make all required fields non-optional
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

const Profile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // Fetch profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Fetch vehicles
  const { data: vehicles = [], isLoading: isLoadingVehicles } = useQuery({
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

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: "",
      email: "",
    },
  });

  const vehicleForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      battery_capacity: 0,
    },
  });

  // Set profile form values when data is loaded
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  // Add vehicle mutation
  const addVehicle = useMutation({
    mutationFn: async (values: VehicleFormValues) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Explicitly construct the vehicle data object with all required fields
      const vehicleData: TablesInsert<"vehicles"> = {
        make: values.make,
        model: values.model,
        year: values.year,
        battery_capacity: values.battery_capacity,
        user_id: user.id,
      };

      const { error } = await supabase.from("vehicles").insert(vehicleData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      setShowVehicleForm(false);
      vehicleForm.reset();
      toast({
        title: "Vehicle added",
        description: "Your vehicle has been added successfully.",
      });
    },
  });

  // Delete vehicle mutation
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

  if (isLoadingProfile || isLoadingVehicles) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      {/* Profile Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit((data) => updateProfile.mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={profileForm.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={profileForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </Card>

      {/* Vehicles */}
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
          <Form {...vehicleForm}>
            <form
              onSubmit={vehicleForm.handleSubmit((data) => addVehicle.mutate(data))}
              className="space-y-4 mb-6"
            >
              <FormField
                control={vehicleForm.control}
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
                control={vehicleForm.control}
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
                control={vehicleForm.control}
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
                control={vehicleForm.control}
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
                className="flex items-center justify-between p-4 border rounded-lg"
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

      {/* Statistics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Statistics</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Charging Sessions</p>
            <p className="text-2xl font-bold">0</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Energy Charged</p>
            <p className="text-2xl font-bold">0 kWh</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Total Trips</p>
            <p className="text-2xl font-bold">0</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;

import { Card } from "@/components/ui/card";
import { Battery, Car, Wallet } from "lucide-react";
import OnboardingCarousel from "@/components/dashboard/OnboardingCarousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  // Query to check if user has a vehicle
  const { data: hasVehicle } = useQuery({
    queryKey: ['hasVehicle'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vehicles')
        .select('id')
        .limit(1);
      return !!data?.length;
    },
  });

  // Query to check if user has any trips
  const { data: hasTrips } = useQuery({
    queryKey: ['hasTrips'],
    queryFn: async () => {
      const { data } = await supabase
        .from('trips')
        .select('id')
        .limit(1);
      return !!data?.length;
    },
  });

  // Query to check if user has any charging sessions
  const { data: hasChargingSessions } = useQuery({
    queryKey: ['hasChargingSessions'],
    queryFn: async () => {
      const { data } = await supabase
        .from('charging_sessions')
        .select('id')
        .limit(1);
      return !!data?.length;
    },
  });

  // Show carousel only if any step is incomplete
  const showCarousel = !hasVehicle || !hasTrips || !hasChargingSessions;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      
      {/* Onboarding Carousel - only show if steps are incomplete */}
      {showCarousel && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Get Started</h2>
          <OnboardingCarousel />
        </Card>
      )}
      
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-100 rounded-full">
              <Battery className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Energy</p>
              <p className="text-2xl font-bold">245 kWh</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-100 rounded-full">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Cost</p>
              <p className="text-2xl font-bold">$89.50</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary-100 rounded-full">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Trips</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 py-2 border-b last:border-0">
              <div className="p-2 bg-primary-100 rounded-full">
                <Battery className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Charging Session</p>
                <p className="text-sm text-gray-500">Added 35 kWh • $12.50</p>
              </div>
              <div className="ml-auto text-sm text-gray-500">2h ago</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
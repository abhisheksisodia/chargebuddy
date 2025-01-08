import { Card } from "@/components/ui/card";
import { Battery, Car, Wallet, ChevronRight, Loader2 } from "lucide-react";
import OnboardingCarousel from "@/components/dashboard/OnboardingCarousel";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

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

  // Get user profile
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
  });

  // Get total energy charged
  const { data: totalEnergy, isLoading: isLoadingEnergy } = useQuery({
    queryKey: ['totalEnergy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('charging_sessions')
        .select('energy_added')
        .gt('energy_added', 0);
      
      if (error) throw error;
      return data?.reduce((sum, session) => sum + Number(session.energy_added), 0) || 0;
    },
  });

  // Get trip count
  const { data: tripCount, isLoading: isLoadingTrips } = useQuery({
    queryKey: ['tripCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('trips')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  // Get recent activity
  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data: chargingSessions, error: chargingError } = await supabase
        .from('charging_sessions')
        .select('*')
        .order('date', { ascending: false })
        .limit(3);

      if (chargingError) throw chargingError;
      
      return chargingSessions?.map(session => ({
        type: 'charging',
        date: session.date,
        energy: session.energy_added,
        cost: session.cost,
      })) || [];
    },
  });

  // Show carousel only if any step is incomplete
  const showCarousel = !hasVehicle || !hasTrips || !hasChargingSessions;

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
          Hi, {profile?.full_name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Welcome to ChargeBuddy. Let's make your EV journey smarter.
        </p>
      </div>
      
      {/* Onboarding Carousel - only show if steps are incomplete */}
      {showCarousel && (
        <Card className="p-6 bg-gradient-to-br from-primary-100 to-white border-none shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Get Started</h2>
          <OnboardingCarousel />
        </Card>
      )}
      
      {/* Action Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link to="/charging">
          <Card className="group p-6 hover:shadow-md transition-all bg-gradient-to-br from-[#F2FCE2] to-white cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-full">
                  <Battery className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Track Charging</p>
                  {isLoadingEnergy ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{totalEnergy?.toFixed(1)} kWh</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Card>
        </Link>
        
        <Link to="/trips">
          <Card className="group p-6 hover:shadow-md transition-all bg-gradient-to-br from-[#D3E4FD] to-white cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Trip Stats</p>
                  {isLoadingTrips ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold">{tripCount} Trips</p>
                  )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Card>
        </Link>
        
        <Link to="/stations">
          <Card className="group p-6 hover:shadow-md transition-all bg-gradient-to-br from-[#D6BCFA] to-white cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-100 rounded-full">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Find Stations</p>
                  <p className="text-2xl font-bold">Nearby</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary-600">
            View all
          </Button>
        </div>
        <div className="space-y-4">
          {isLoadingActivity ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center space-x-4 py-3 border-b last:border-0">
                <div className="p-2 bg-primary-100 rounded-full">
                  <Battery className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Charging Session</p>
                  <p className="text-sm text-gray-500">
                    Added {activity.energy} kWh • ${activity.cost.toFixed(2)}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(activity.date), 'MMM d')}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No recent activity</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
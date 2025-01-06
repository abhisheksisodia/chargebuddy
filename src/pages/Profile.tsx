import ProfileInfo from "@/components/profile/ProfileInfo";
import VehicleManager from "@/components/profile/VehicleManager";
import ChargingLocations from "@/components/profile/ChargingLocations";

const Profile = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      <div className="grid gap-8">
        <ProfileInfo />
        <VehicleManager />
        <ChargingLocations />
      </div>
    </div>
  );
};

export default Profile;
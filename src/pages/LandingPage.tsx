import { Link } from "react-router-dom";
import { Battery, Car, MapPin, TrendingUp } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C]">
      {/* Navigation */}
      <nav className="fixed w-full bg-[#1A1F2C]/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-white">ChargeBuddy</span>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#9b87f5]/20 to-[#1A1F2C]" />
        <div className="max-w-7xl mx-auto pt-32 pb-16 px-4 sm:pt-40 sm:pb-20 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Track Your EV Journey</span>
              <span className="block bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] text-transparent bg-clip-text">
                Save Money & Energy
              </span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-300 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              The smart way to monitor your electric vehicle's charging costs,
              track trips, and find the best charging stations near you.
            </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link
                  to="/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 transition-colors md:py-4 md:text-lg md:px-10"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features with Gradient Line */}
      <div className="py-16 overflow-hidden lg:py-24 relative">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="relative">
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to manage your EV
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-300">
              Take control of your electric vehicle expenses and optimize your charging routine
            </p>
          </div>

          <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div className="mt-10 space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  title: "Track Charging Costs",
                  description:
                    "Log and analyze your charging sessions to understand your energy consumption",
                  icon: Battery,
                },
                {
                  title: "Trip Logging",
                  description:
                    "Keep detailed records of your trips and monitor energy efficiency",
                  icon: Car,
                },
                {
                  title: "Find Charging Stations",
                  description:
                    "Discover nearby charging stations and plan your routes effectively",
                  icon: MapPin,
                },
                {
                  title: "Cost Analytics",
                  description:
                    "Get insights into your charging costs and optimize your expenses",
                  icon: TrendingUp,
                },
              ].map((feature) => (
                <div key={feature.title} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#9b87f5] text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-white">
                    {feature.title}
                  </p>
                  <p className="mt-2 ml-16 text-base text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
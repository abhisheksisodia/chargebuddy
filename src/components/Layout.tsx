import { Link, useLocation } from "react-router-dom";
import { Battery, Car, MapPin, Home, User } from "lucide-react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Charging", href: "/charging", icon: Battery },
    { name: "Trips", href: "/trips", icon: Car },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-primary">EV Tracker</span>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? "bg-primary-100 text-primary"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? "text-primary" : "text-gray-400"
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between h-16 bg-white border-b px-4">
          <span className="text-xl font-bold text-primary">EV Tracker</span>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t">
          <nav className="flex justify-around">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center py-2 px-3 text-xs ${
                    isActive ? "text-primary" : "text-gray-600"
                  }`}
                >
                  <item.icon className="h-6 w-6" />
                  <span className="mt-1">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none md:p-8 p-4 pt-20 md:pt-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
import { Link } from "react-router-dom";
import { Battery, Car, MapPin, TrendingUp, Menu, X, Github, Twitter, Linkedin } from "lucide-react";
import { useState } from "react";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C]">
      {/* Navigation */}
      <nav className="fixed w-full bg-[#1A1F2C]/80 backdrop-blur-md z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-white">ChargeBuddy</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </button>
              <Link
                to="/login"
                className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign in
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                >
                  About
                </button>
                <Link
                  to="/login"
                  className="bg-[#1EAEDB] hover:bg-[#1EAEDB]/90 text-white block px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign in
                </Link>
              </div>
            </div>
          )}
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

      {/* Features Section */}
      <div id="features" className="py-16 overflow-hidden lg:py-24 relative">
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

      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-[#1E2433]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-xl text-gray-300">
              Choose the plan that works best for you
            </p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Free Tier */}
            <div className="bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-white">Free</h3>
                <p className="mt-4 text-gray-300">Perfect for getting started</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-gray-300">/month</span>
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Basic charging tracking
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Simple trip logging
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Find nearby stations
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4 bg-[#232836]">
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md text-white bg-[#1EAEDB] hover:bg-[#1EAEDB]/90"
                >
                  Get started
                </Link>
              </div>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#1A1F2C] rounded-lg shadow-lg overflow-hidden border-2 border-[#1EAEDB]">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-white">Pro</h3>
                <p className="mt-4 text-gray-300">For power users</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-white">$9.99</span>
                  <span className="text-gray-300">/month</span>
                </p>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Everything in Free
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Advanced analytics
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Custom reports
                  </li>
                  <li className="flex items-center text-gray-300">
                    <span className="text-[#1EAEDB] mr-2">✓</span>
                    Priority support
                  </li>
                </ul>
              </div>
              <div className="px-6 py-4 bg-[#232836]">
                <Link
                  to="/register"
                  className="block w-full text-center px-4 py-2 border border-transparent rounded-md text-white bg-[#1EAEDB] hover:bg-[#1EAEDB]/90"
                >
                  Upgrade now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="bg-[#1A1F2C] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">ChargeBuddy</h3>
              <p className="text-gray-300 mb-4">
                Making electric vehicle ownership easier and more efficient through smart tracking and analytics.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <Linkedin className="h-6 w-6" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-white">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-gray-300 hover:text-white">
                    Pricing
                  </button>
                </li>
                <li>
                  <Link to="/register" className="text-gray-300 hover:text-white">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li>support@chargebuddy.com</li>
                <li>1-800-CHARGE</li>
                <li>123 EV Street</li>
                <li>San Francisco, CA 94105</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p>© 2024 ChargeBuddy. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
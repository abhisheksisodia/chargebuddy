import { useNavigate } from "react-router-dom";
import { Car, MapPin, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const OnboardingCarousel = () => {
  const navigate = useNavigate();

  const steps = [
    {
      title: "Setup vehicle and profile",
      description: "Add your vehicle details and complete your profile",
      icon: <Car className="w-12 h-12 text-primary" />,
      action: () => navigate("/profile"),
      buttonText: "Setup Now",
    },
    {
      title: "Log first trip",
      description: "Record your first journey with your EV",
      icon: <MapPin className="w-12 h-12 text-primary" />,
      action: () => navigate("/trips"),
      buttonText: "Log Trip",
    },
    {
      title: "Log first charge cost",
      description: "Track your charging expenses",
      icon: <Plug className="w-12 h-12 text-primary" />,
      action: () => navigate("/charging"),
      buttonText: "Log Charge",
    },
  ];

  return (
    <Carousel className="w-full max-w-lg mx-auto">
      <CarouselContent>
        {steps.map((step, index) => (
          <CarouselItem key={index}>
            <div className="p-6 bg-white rounded-lg border text-center space-y-4">
              <div className="flex justify-center">{step.icon}</div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              <Button onClick={step.action}>{step.buttonText}</Button>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default OnboardingCarousel;
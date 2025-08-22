import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye, TreePine, Waves, Mountain, Car, Accessibility } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-scenery.jpg";

const categories = [
  { name: "City Lights", icon: Eye, color: "bg-gradient-hero" },
  { name: "Water Bodies", icon: Waves, color: "bg-gradient-water" },
  { name: "Nature", icon: TreePine, color: "bg-gradient-nature" },
  { name: "Hikes", icon: Mountain, color: "bg-gradient-nature" },
];

const features = [
  {
    icon: MapPin,
    title: "Discover Hidden Gems",
    description: "Find unique viewpoints and scenic spots known only to locals in your community."
  },
  {
    icon: Accessibility,
    title: "Accessibility Info",
    description: "Get detailed accessibility information and parking details for every location."
  },
  {
    icon: Eye,
    title: "Community Curated",
    description: "All locations are submitted and verified by real community members who've been there."
  }
];

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/80" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
            Community Scenery Discovery
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 leading-tight">
            Discover Your Community's
            <span className="bg-gradient-hero bg-clip-text text-transparent"> Hidden Gems</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore and share breathtaking viewpoints, scenic spots, and natural wonders known only to locals. 
            Build a community map of extraordinary places waiting to be discovered.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/map" className="w-full sm:w-auto">
              <Button 
                variant="hero" 
                size="xl" 
                className="w-full"
              >
                <MapPin className="mr-2 h-5 w-5" />
                Start Exploring
              </Button>
            </Link>
            <Link to="/map" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="xl"
                className="w-full border-2 border-primary/30 hover:border-primary"
              >
                <TreePine className="mr-2 h-5 w-5" />
                Add a Location
              </Button>
            </Link>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="px-4 py-2 text-sm font-medium shadow-card hover-lift cursor-pointer"
              >
                <category.icon className="mr-2 h-4 w-4" />
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
              Why Our Community Loves It
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              More than just a map - it's a gateway to experiencing your region through the eyes of those who know it best.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="shadow-card hover-lift border-0">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-nature rounded-2xl flex items-center justify-center shadow-glow">
                    <feature.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="font-display text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 px-6 bg-gradient-hero">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-display font-semibold text-primary-foreground mb-4">
            Ready to Share Your Secret Spot?
          </h3>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join our community of explorers and help others discover the extraordinary places that make our region special.
          </p>
          <Link to="/map">
            <Button 
              variant="secondary" 
              size="xl" 
              className="shadow-glow hover-lift font-semibold"
            >
              <Car className="mr-2 h-5 w-5" />
              Open Interactive Map
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
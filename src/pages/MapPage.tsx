import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Map from "@/components/Map";

const MapPage = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 z-10 shadow-sm">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="font-display font-semibold text-lg text-foreground">
                "I Know a Spot" Community Scenery Map
              </h1>
              <p className="text-sm text-muted-foreground">
                Use the drawing tools to add your favorite scenic locations
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1">
        <Map />
      </div>
    </div>
  );
};

export default MapPage;
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
// @ts-ignore - leaflet-draw types are incomplete
import 'leaflet-draw';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FormData {
  description: string;
  name: string;
  views: string;
  adaAccessibility: string;
  parking: string;
  distance: string;
}

const Map: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const currentLayerRef = useRef<L.Layer | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    description: '',
    name: '',
    views: '',
    adaAccessibility: '',
    parking: '',
    distance: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([47.267, -122.437], 7);
    
    // Add Mapbox satellite tile layer
    const tileLayer = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 22,
      id: 'mapbox/satellite-streets-v12',
      tileSize: 512,
      zoomOffset: -1
    } as any);
    
    // Set access token manually
    (tileLayer as any).options.accessToken = 'pk.eyJ1Ijoiam9obmthbWF1IiwiYSI6ImNsY2xmNjk4cTYzaTgzcWxrdzBtNWs2cWMifQ.FkeyGo6hi5tW9dx-GmAhHA';
    tileLayer.addTo(map);

    // Create feature group for drawn items
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialize draw controls
    const drawControl = new (L.Control as any).Draw({
      draw: {
        polygon: true,
        polyline: true,
        rectangle: true,
        circle: false,
        circlemarker: false,
        marker: true
      },
      edit: {
        featureGroup: drawnItems
      }
    });
    
    map.addControl(drawControl);

    // Event listener for when drawing is created
    map.on('draw:created' as any, (e: any) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      currentLayerRef.current = layer;
      setShowForm(true);
    });

    // Event listeners for edit modes
    map.on('draw:editstart' as any, () => setShowForm(false));
    map.on('draw:deletestart' as any, () => setShowForm(false));
    map.on('draw:editstop' as any, () => {
      if (drawnItems.getLayers().length > 0) {
        setShowForm(true);
      }
    });
    map.on('draw:deletestop' as any, () => {
      if (drawnItems.getLayers().length > 0) {
        setShowForm(true);
      }
    });

    mapInstanceRef.current = map;
    drawnItemsRef.current = drawnItems;

    return () => {
      map.remove();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentLayerRef.current || !drawnItemsRef.current) return;

    // Validate form
    if (!formData.description || !formData.name || !formData.views || !formData.adaAccessibility) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Get GeoJSON for the drawn layer
    const geoJson = (currentLayerRef.current as any).toGeoJSON();
    
    // Log the data (as per original functionality)
    console.log("Name:", formData.name);
    console.log("Description:", formData.description);
    console.log("Views:", formData.views);
    console.log("ADA Accessibility:", formData.adaAccessibility);
    console.log("Parking Availability:", formData.parking);
    console.log("Distance from Main Roads:", formData.distance);
    console.log("Drawing:", JSON.stringify(geoJson.geometry));

    // Show success message
    toast({
      title: "Location Added!",
      description: "Your scenic spot has been submitted successfully.",
    });

    // Reset form and clear drawn items
    setFormData({
      description: '',
      name: '',
      views: '',
      adaAccessibility: '',
      parking: '',
      distance: ''
    });
    setShowForm(false);
    drawnItemsRef.current?.clearLayers();
    currentLayerRef.current = null;
  };

  const handleCancel = () => {
    setShowForm(false);
    drawnItemsRef.current?.clearLayers();
    currentLayerRef.current = null;
    setFormData({
      description: '',
      name: '',
      views: '',
      adaAccessibility: '',
      parking: '',
      distance: ''
    });
  };

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Form Modal */}
      {showForm && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-xl">Add Scenic Location</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this scenic spot"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="views">Category *</Label>
                  <Select value={formData.views} onValueChange={(value) => setFormData({ ...formData, views: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="City lights">City Lights</SelectItem>
                      <SelectItem value="Water Bodies">Water Bodies</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Hikes">Hikes</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>ADA Accessibility *</Label>
                  <RadioGroup 
                    value={formData.adaAccessibility} 
                    onValueChange={(value) => setFormData({ ...formData, adaAccessibility: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Accessible" id="accessible" />
                      <Label htmlFor="accessible">Accessible</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Not Accessible" id="not-accessible" />
                      <Label htmlFor="not-accessible">Not Accessible</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="parking">Parking Availability</Label>
                  <Input
                    id="parking"
                    value={formData.parking}
                    onChange={(e) => setFormData({ ...formData, parking: e.target.value })}
                    placeholder="Enter number of available parking spots"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter the number of available parking spots. If no parking, enter 0.
                  </p>
                </div>

                <div>
                  <Label htmlFor="distance">Distance from Main Roads</Label>
                  <Input
                    id="distance"
                    value={formData.distance}
                    onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    placeholder="Enter distance in miles"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Distance in miles from the nearest main road.
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Submit
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Map;
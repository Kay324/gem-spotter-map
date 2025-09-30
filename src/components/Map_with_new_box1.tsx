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
import React, { useState } from 'react';

// API Configuration
const API_BASE = import.meta.env.VITE_API_BASE ?? '';

// Types
type Geometry = { type: string; coordinates: any };
type Spot = {
  id: number;
  name: string;
  description: string;
  views: string;
  photo: null,
  review: '',
  rating: 0,
  ada: string | null;
  parking: number;
  distance: number;
  geometry: Geometry;
  created_at?: string;
};

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
  const persistentLayerRef = useRef<L.GeoJSON | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    description: '',
    name: '',
    views: '',
    adaAccessibility: '',
    parking: '',
    distance: ''
  });

  const { toast } = useToast();

  // Load existing spots from API
  const loadExistingSpots = async (map: L.Map) => {
    try {
      const res = await fetch(`${API_BASE}/api/spots`);
      const { items }: { items: Spot[] } = await res.json();

      if (!Array.isArray(items)) return;

      const fc = {
        type: 'FeatureCollection',
        features: items.map(it => ({ 
          type: 'Feature', 
          geometry: it.geometry, 
          properties: it 
        }))
      };

      const layer = L.geoJSON(fc as any, {
        onEachFeature: (feat: any, lyr: L.Layer) => {
          const p = feat.properties as Spot;
          (lyr as L.Layer & { bindPopup: Function }).bindPopup(
            `<b>${p.description || 'Untitled spot'}</b><br>
             By: ${p.name || 'Anonymous'}<br>
             Category: ${p.views || '—'}<br>
             ADA: ${p.ada || '—'}<br>
             Parking: ${p.parking ?? '—'}<br>
             Distance (mi): ${p.distance ?? '—'}<br>
             <small>ID: ${p.id}</small>`
          );
        }
      }).addTo(map);

      persistentLayerRef.current = layer;

      // Fit bounds to show all spots if any exist
      if (items.length > 0) {
        try { 
          map.fitBounds((layer as any).getBounds(), { maxZoom: 14, padding: [20, 20] }); 
        } catch (e) {
          // Ignore bounds errors
        }
      }
    } catch (e) {
      toast({
        title: "Failed to load spots",
        description: "Could not load existing scenic spots from the server.",
        variant: "destructive"
      });
    }
  };

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

    // Load existing spots from the API
    loadExistingSpots(map);

    return () => {
      map.remove();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
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

    setSaving(true);

    try {
      const layer = currentLayerRef.current;
      const payload = {
        description: formData.description.trim(),
        name: formData.name.trim(),
        views: formData.views,
        ada: formData.adaAccessibility || null,
        parking: Number.isFinite(+formData.parking) ? +formData.parking : 0,
        distance: Number.isFinite(+formData.distance) ? +formData.distance : 0,
        geometry: (layer as any).toGeoJSON().geometry
      };

      const res = await fetch(`${API_BASE}/api/spots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data?.id) {
        throw new Error(data?.error || `Save failed (${res.status})`);
      }

      // Success: bind popup and show it immediately
      (layer as any).bindPopup(
        `<b>${payload.description || 'Untitled spot'}</b><br>
         By: ${payload.name || 'Anonymous'}<br>
         Category: ${payload.views}<br>
         ADA: ${payload.ada || '—'}<br>
         Parking: ${payload.parking}<br>
         Distance (mi): ${payload.distance}<br>
         <small>Saved as ID ${data.id}</small>`
      ).openPopup();

      // Show success message
      toast({
        title: "Location Saved!",
        description: "Your scenic spot has been saved successfully.",
      });

      // Reset form and clear drawn items from the draw control
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

    } catch (err: any) {
      toast({
        title: "Save Failed",
        description: err.message || 'Network error saving spot',
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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
     <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg bg-white rounded-2xl">
                <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold text-gray-800">Add Location Details</CardTitle>
                      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Description Field */}
                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe this scenic spot"
                                required
                            />
                        </div>

                        {/* User's Name Field */}
                        <div>
                            <Label htmlFor="name">Your Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        {/* Views Dropdown */}
                        <div>
                            <Label htmlFor="views">Category *</Label>
                            {/* This is a simplified version of a Select component */}
                            <select
                                id="views"
                                value={formData.views}
                                onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                                className="mt-1 flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                required
                            >
                                <option value="" disabled>Select a category</option>
                                <option value="City lights">City Lights</option>
                                <option value="Water Bodies">Water Bodies</option>
                                <option value="Nature">Nature</option>
                                <option value="Hikes">Hikes</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        {/* Photo Upload Field - NEWLY ADDED */}
                        <div>
                            <Label htmlFor="photo">Add a Photo</Label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                <div className="space-y-1 text-center">
                                    {/* Shows a preview of the image if one is selected */}
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="h-24 mx-auto rounded-md mb-4"/>
                                    ) : (
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <Label htmlFor="photo-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                            <span>Upload a file</span>
                                            <Input id="photo-upload" name="photo-upload" type="file" className="sr-only" onChange={handlePhotoChange} accept="image/*"/>
                                        </Label>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Review Field - NEWLY ADDED */}
                        <div>
                            <Label htmlFor="review">Your Review</Label>
                            <Textarea
                                id="review"
                                value={formData.review}
                                onChange={handleChange}
                                placeholder="Share your experience..."
                                rows="4"
                            />
                        </div>

                        {/* Star Rating - NEWLY ADDED */}
                        <div>
                            <Label>Rating *</Label>
                            <div className="flex items-center mt-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <StarIcon
                                        key={star}
                                        className={`cursor-pointer h-8 w-8 ${
                                            (hoverRating || formData.rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                        }`}
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* ADA Accessibility */}
                        <div>
                            <Label>ADA Accessibility *</Label>
                            <RadioGroup
                                value={formData.adaAccessibility}
                                onValueChange={(value) => setFormData({ ...formData, adaAccessibility: value })}
                                className="mt-2 space-y-2"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Accessible" id="accessible" name="ada" />
                                    <Label htmlFor="accessible">Accessible</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Not Accessible" id="not-accessible" name="ada" />
                                    <Label htmlFor="not-accessible">Not Accessible</Label>
                                </div>
                            </RadioGroup>
                        </div>
                        
                        {/* Parking Availability */}
                        <div>
                            <Label htmlFor="parking">Parking Availability</Label>
                            <Input
                                id="parking"
                                type="number"
                                value={formData.parking}
                                onChange={handleChange}
                                placeholder="e.g., 10"
                            />
                             <p className="text-sm text-gray-500 mt-1">
                                Enter the number of spots. If no parking, enter 0.
                            </p>
                        </div>
                        
                        {/* Distance From Main Roads */}
                        <div>
                            <Label htmlFor="distance">Distance from Main Roads (miles)</Label>
                            <Input
                                id="distance"
                                type="number"
                                step="0.1"
                                value={formData.distance}
                                onChange={handleChange}
                                placeholder="e.g., 1.5"
                            />
                             <p className="text-sm text-gray-500 mt-1">
                                Distance in miles from the nearest main road.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full bg-blue-600 text-white">
                           Submit
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}


export default Map;

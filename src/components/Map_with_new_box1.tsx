<div style="background-color: #2d2d2d; color: #cccccc; font-family: 'Courier New', Courier, monospace; padding: 20px; border-radius: 8px;">
  <pre><code style="color: #569cd6;">// Import necessary libraries and components from React and Leaflet</span>
<span style="color: #c586c0;">import</span> React, { useEffect, useRef, useState } <span style="color: #c586c0;">from</span> <span style="color: #ce9178;">'react'</span>;
<span style="color: #c586c0;">import</span> L <span style="color: #c586c0;">from</span> <span style="color: #ce9178;">'leaflet'</span>;
<span style="color: #c586c0;">import</span> <span style="color: #ce9178;">'leaflet/dist/leaflet.css'</span>;
<span style="color: #c586c0;">import</span> <span style="color: #ce9178;">'leaflet-draw/dist/leaflet.draw.css'</span>;
<span style="color: #6a9955;">// @ts-ignore - leaflet-draw types can be incomplete</span>
<span style="color: #c586c0;">import</span> <span style="color: #ce9178;">'leaflet-draw'</span>;

<span style="color: #6a9955;">// --- MOCK COMPONENTS AND HOOKS (for demonstration purposes) ---</span>
<span style="color: #6a9955;">// These would be your actual UI components from a library like shadcn/ui</span>
<span style="color: #569cd6;">const</span> Card = ({ className, children }: any) => &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>={className}>__{children}_&lt;/<span style="color: #4ec9b0;">div</span>>;
<span style="color: #569cd6;">const</span> CardHeader = ({ children }: any) => &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="p-6 pb-0"__>__{children}_&lt;/<span style="color: #4ec9b0;">div</span>>;
<span style="color: #569cd6;">const</span> CardTitle = ({ className, children }: any) => &lt;<span style="color: #4ec9b0;">h3</span> <span style="color: #9cdcfe;">className</span>={_`${className} font-semibold leading-none tracking-tight`_}>__{children}_&lt;/<span style="color: #4ec9b0;">h3</span>>;
<span style="color: #569cd6;">const</span> CardContent = ({ children }: any) => &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="p-6 pt-0"__>__{children}_&lt;/<span style="color: #4ec9b0;">div</span>>;
<span style="color: #569cd6;">const</span> Label = ({ htmlFor, children }: any) => &lt;<span style="color: #4ec9b0;">label</span> <span style="color: #9cdcfe;">htmlFor</span>={htmlFor} <span style="color: #9cdcfe;">className</span>="text-sm font-medium leading-none"__>__{children}_&lt;/<span style="color: #4ec9b0;">label</span>>;
<span style="color: #569cd6;">const</span> Input = (<span style="color: #9cdcfe;">props</span>: any) => &lt;<span style="color: #4ec9b0;">input</span> {...props} <span style="color: #9cdcfe;">className</span>={_`${props.className} flex h-10 w-full rounded-md border px-3 py-2 text-sm`_} />;
<span style="color: #569cd6;">const</span> Textarea = (<span style="color: #9cdcfe;">props</span>: any) => &lt;<span style="color: #4ec9b0;">textarea</span> {...props} <span style="color: #9cdcfe;">className</span>={_`${props.className} flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm`_} />;
<span style="color: #569cd6;">const</span> RadioGroup = ({ children, className, onValueChange, value }: any) => &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>={className}>__{React.Children.map(children, child => React.cloneElement(child, { onValueChange, value }))}_&lt;/<span style="color: #4ec9b0;">div</span>>;
<span style="color: #569cd6;">const</span> RadioGroupItem = ({ value, id, name, onValueChange, value: selectedValue }: any) => &lt;<span style="color: #4ec9b0;">input</span> <span style="color: #9cdcfe;">type</span>="radio" <span style="color: #9cdcfe;">id</span>={id} <span style="color: #9cdcfe;">name</span>={name} <span style="color: #9cdcfe;">value</span>={value} <span style="color: #9cdcfe;">checked</span>={value === selectedValue} <span style="color: #9cdcfe;">onChange</span>={(e) => onValueChange(e.target.value)} />;
<span style="color: #569cd6;">const</span> Button = ({ children, className, ...props }: any) => &lt;<span style="color: #4ec9b0;">button</span> {...props} <span style="color: #9cdcfe;">className</span>={_`${className} h-10 px-4 py-2 inline-flex items-center justify-center rounded-md text-sm font-medium`_}>__{children}_&lt;/<span style="color: #4ec9b0;">button</span>>;
<span style="color: #569cd6;">const</span> StarIcon = ({ className, ...props }: any) => &lt;<span style="color: #4ec9b0;">svg</span> {...props} <span style="color: #9cdcfe;">className</span>={className} <span style="color: #9cdcfe;">fill</span>="currentColor" <span style="color: #9cdcfe;">viewBox</span>="0 0 20 20"__>&lt;<span style="color: #4ec9b0;">path</span> <span style="color: #9cdcfe;">d</span>="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"__ />&lt;/<span style="color: #4ec9b0;">svg</span>>;
<span style="color: #569cd6;">const</span> useToast = () => ({ <span style="color: #dcdcaa;">toast</span>: (<span style="color: #9cdcfe;">options</span>: any) => <span style="color: #9cdcfe;">console</span>.<span style="color: #dcdcaa;">log</span>(<span style="color: #ce9178;">'Toast:'</span>, options) });
<span style="color: #6a9955;">// --- END MOCK COMPONENTS ---</span>

<span style="color: #6a9955;">// API base URL configuration</span>
<span style="color: #569cd6;">const</span> API_BASE = <span style="color: #9cdcfe;">import</span>.meta.env.VITE_API_BASE ?? <span style="color: #ce9178;">''</span>;

<span style="color: #6a9955;">// TypeScript type for geometry data</span>
<span style="color: #569cd6;">type</span> <span style="color: #4ec9b0;">Geometry</span> = { type: string; coordinates: any };

<span style="color: #6a9955;">// TypeScript type for a single scenic spot</span>
<span style="color: #569cd6;">type</span> <span style="color: #4ec9b0;">Spot</span> = {
  id: number;
  name: string;
  description: string;
  views: string;
  photo: string | null; <span style="color: #6a9955;">// Assuming photo is a URL string</span>
  review: string;
  rating: number;
  ada: string | null;
  parking: number;
  distance: number;
  geometry: Geometry;
  created_at?: string;
};

<span style="color: #6a9955;">// TypeScript interface for the form's data structure</span>
<span style="color: #569cd6;">interface</span> <span style="color: #4ec9b0;">FormData</span> {
  description: string;
  name: string;
  views: string;
  photo: File | null; <span style="color: #6a9955;">// Use File type for uploads</span>
  review: string;
  rating: number; <span style="color: #6a9955;">// Corrected type from 'int' to 'number'</span>
  adaAccessibility: string;
  parking: string;
  distance: string;
}

<span style="color: #6a9955;">// Fix for default marker icons in Leaflet when using bundlers like Vite/Webpack</span>
<span style="color: #569cd6;">delete</span> (L.Icon.Default.prototype <span style="color: #c586c0;">as</span> any)._getIconUrl;
L.Icon.Default.<span style="color: #dcdcaa;">mergeOptions</span>({
  iconRetinaUrl: <span style="color: #ce9178;">'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png'</span>,
  iconUrl: <span style="color: #ce9178;">'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png'</span>,
  shadowUrl: <span style="color: #ce9178;">'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'</span>,
});

<span style="color: #569cd6;">const</span> Map: React.FC = () => {
  <span style="color: #6a9955;">// Refs to hold instances of the map, drawn items, and layers</span>
  <span style="color: #569cd6;">const</span> mapRef = <span style="color: #dcdcaa;">useRef</span>&lt;HTMLDivElement | null>(null);
  <span style="color: #569cd6;">const</span> mapInstanceRef = <span style="color: #dcdcaa;">useRef</span>&lt;L.Map | null>(null);
  <span style="color: #569cd6;">const</span> drawnItemsRef = <span style="color: #dcdcaa;">useRef</span>&lt;L.FeatureGroup | null>(null);
  <span style="color: #569cd6;">const</span> currentLayerRef = <span style="color: #dcdcaa;">useRef</span>&lt;L.Layer | null>(null);
  <span style="color: #569cd6;">const</span> persistentLayerRef = <span style="color: #dcdcaa;">useRef</span>&lt;L.GeoJSON | null>(null);

  <span style="color: #6a9955;">// State to manage the visibility of the form and saving status</span>
  <span style="color: #569cd6;">const</span> [showForm, setShowForm] = <span style="color: #dcdcaa;">useState</span>(false);
  <span style="color: #569cd6;">const</span> [saving, setSaving] = <span style="color: #dcdcaa;">useState</span>(false);
  
  <span style="color: #6a9955;">// State for the form data</span>
  <span style="color: #569cd6;">const</span> [formData, setFormData] = <span style="color: #dcdcaa;">useState</span>&lt;FormData>({
    description: <span style="color: #ce9178;">''</span>,
    name: <span style="color: #ce9178;">''</span>,
    views: <span style="color: #ce9178;">''</span>,
    photo: null,
    review: <span style="color: #ce9178;">''</span>,
    rating: <span style="color: #b5cea8;">0</span>,
    adaAccessibility: <span style="color: #ce9178;">''</span>,
    parking: <span style="color: #ce9178;">''</span>,
    distance: <span style="color: #ce9178;">''</span>
  });

  <span style="color: #6a9955;">// State for the image preview URL and star rating hover effect</span>
  <span style="color: #569cd6;">const</span> [imagePreview, setImagePreview] = <span style="color: #dcdcaa;">useState</span>(<span style="color: #ce9178;">''</span>);
  <span style="color: #569cd6;">const</span> [hoverRating, setHoverRating] = <span style="color: #dcdcaa;">useState</span>(<span style="color: #b5cea8;">0</span>);
  
  <span style="color: #6a9955;">// Toast notification hook</span>
  <span style="color: #569cd6;">const</span> { toast } = <span style="color: #dcdcaa;">useToast</span>();

  <span style="color: #6a9955;">// --- Form Input Handlers ---</span>
  
  <span style="color: #6a9955;">// Handles changes for standard text inputs and textareas</span>
  <span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">handleChange</span> = (<span style="color: #9cdcfe;">e</span>: React.ChangeEvent&lt;HTMLInputElement | HTMLTextAreaElement>) => {
    <span style="color: #569cd6;">const</span> { id, value } = e.target;
    <span style="color: #dcdcaa;">setFormData</span>({ ...formData, [id]: value });
  };

  <span style="color: #6a9955;">// Handles the file input change for photo uploads</span>
  <span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">handlePhotoChange</span> = (<span style="color: #9cdcfe;">e</span>: React.ChangeEvent&lt;HTMLInputElement>) => {
    <span style="color: #569cd6;">const</span> file = e.target.files ? e.target.files[<span style="color: #b5cea8;">0</span>] : null;
    <span style="color: #c586c0;">if</span> (file) {
      <span style="color: #dcdcaa;">setFormData</span>({ ...formData, photo: file });
      <span style="color: #6a9955;">// Create a temporary URL for the image preview</span>
      setImagePreview(URL.<span style="color: #dcdcaa;">createObjectURL</span>(file));
    }
  };

  <span style="color: #6a9955;">// --- Map and Data Loading ---</span>

  <span style="color: #6a9955;">// Function to fetch existing spots from the API and display them on the map</span>
  <span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">loadExistingSpots</span> = <span style="color: #c586c0;">async</span> (<span style="color: #9cdcfe;">map</span>: L.Map) => {
    <span style="color: #c586c0;">try</span> {
      <span style="color: #569cd6;">const</span> res = <span style="color: #c586c0;">await</span> <span style="color: #dcdcaa;">fetch</span>(<span style="color: #ce9178;">`</span>${API_BASE}<span style="color: #ce9178;">/api/spots</span><span style="color: #ce9178;">`</span>);
      <span style="color: #569cd6;">const</span> { items }: { items: Spot[] } = <span style="color: #c586c0;">await</span> res.<span style="color: #dcdcaa;">json</span>();

      <span style="color: #c586c0;">if</span> (!Array.<span style="color: #dcdcaa;">isArray</span>(items)) <span style="color: #c586c0;">return</span>;

      <span style="color: #6a9955;">// Convert spots to GeoJSON FeatureCollection format</span>
      <span style="color: #569cd6;">const</span> featureCollection = {
        type: <span style="color: #ce9178;">'FeatureCollection'</span>,
        features: items.<span style="color: #dcdcaa;">map</span>(<span style="color: #9cdcfe;">it</span> => ({
          type: <span style="color: #ce9178;">'Feature'</span>,
          geometry: it.geometry,
          properties: it,
        })),
      };

      <span style="color: #6a9955;">// Create a GeoJSON layer and add popups to each feature</span>
      <span style="color: #569cd6;">const</span> layer = L.<span style="color: #dcdcaa;">geoJSON</span>(featureCollection <span style="color: #c586c0;">as</span> any, {
        <span style="color: #dcdcaa;">onEachFeature</span>: (<span style="color: #9cdcfe;">feat</span>: any, <span style="color: #9cdcfe;">lyr</span>: L.Layer) => {
          <span style="color: #569cd6;">const</span> p = feat.properties <span style="color: #c586c0;">as</span> Spot;
          (lyr <span style="color: #c586c0;">as</span> L.Layer & { bindPopup: Function }).<span style="color: #dcdcaa;">bindPopup</span>(
            <span style="color: #ce9178;">`&lt;b></span>${p.description || <span style="color: #ce9178;">'Untitled spot'</span>}<span style="color: #ce9178;">&lt;/b>&lt;br>
             By: </span>${p.name || <span style="color: #ce9178;">'Anonymous'</span>}<span style="color: #ce9178;">&lt;br>
             Category: </span>${p.views || <span style="color: #ce9178;">'—'</span>}<span style="color: #ce9178;">&lt;br>
             ADA: </span>${p.ada || <span style="color: #ce9178;">'—'</span>}<span style="color: #ce9178;">&lt;br>
             Parking: </span>${p.parking ?? <span style="color: #ce9178;">'—'</span>}<span style="color: #ce9178;">&lt;br>
             Distance (mi): </span>${p.distance ?? <span style="color: #ce9178;">'—'</span>}<span style="color: #ce9178;">&lt;br>
             &lt;small>ID: </span>${p.id}<span style="color: #ce9178;">&lt;/small>`</span>
          );
        },
      }).<span style="color: #dcdcaa;">addTo</span>(map);

      persistentLayerRef.current = layer;

      <span style="color: #6a9955;">// Fit the map view to the bounds of all existing spots</span>
      <span style="color: #c586c0;">if</span> (items.length > <span style="color: #b5cea8;">0</span>) {
        <span style="color: #c586c0;">try</span> {
          map.<span style="color: #dcdcaa;">fitBounds</span>((layer <span style="color: #c586c0;">as</span> any).<span style="color: #dcdcaa;">getBounds</span>(), { maxZoom: <span style="color: #b5cea8;">14</span>, padding: [<span style="color: #b5cea8;">20</span>, <span style="color: #b5cea8;">20</span>] });
        } <span style="color: #c586c0;">catch</span> (e) {
          <span style="color: #9cdcfe;">console</span>.<span style="color: #dcdcaa;">error</span>(<span style="color: #ce9178;">'Fit bounds failed'</span>, e);
        }
      }
    } <span style="color: #c586c0;">catch</span> (e) {
      <span style="color: #dcdcaa;">toast</span>({
        title: <span style="color: #ce9178;">"Failed to load spots"</span>,
        description: <span style="color: #ce9178;">"Could not load existing scenic spots from the server."</span>,
        variant: <span style="color: #ce9178;">"destructive"</span>,
      });
    }
  };
  
  <span style="color: #6a9955;">// useEffect hook to initialize the map on component mount</span>
  <span style="color: #dcdcaa;">useEffect</span>(() => {
    <span style="color: #6a9955;">// Prevent re-initialization</span>
    <span style="color: #c586c0;">if</span> (!mapRef.current || mapInstanceRef.current) <span style="color: #c586c0;">return</span>;

    <span style="color: #6a9955;">// Initialize map and set initial view</span>
    <span style="color: #569cd6;">const</span> map = L.<span style="color: #dcdcaa;">map</span>(mapRef.current).<span style="color: #dcdcaa;">setView</span>([<span style="color: #b5cea8;">47.267</span>, -<span style="color: #b5cea8;">122.437</span>], <span style="color: #b5cea8;">7</span>);

    <span style="color: #6a9955;">// Add Mapbox satellite tile layer</span>
    L.<span style="color: #dcdcaa;">tileLayer</span>(<span style="color: #ce9178;">'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'</span>, {
      attribution: <span style="color: #ce9178;">'Map data © OpenStreetMap contributors, Imagery © Mapbox'</span>,
      maxZoom: <span style="color: #b5cea8;">22</span>,
      id: <span style="color: #ce9178;">'mapbox/satellite-streets-v12'</span>,
      tileSize: <span style="color: #b5cea8;">512</span>,
      zoomOffset: -<span style="color: #b5cea8;">1</span>,
      accessToken: <span style="color: #ce9178;">'pk.eyJ1Ijoiam9obmthbWF1IiwiYSI6ImNsY2xmNjk4cTYzaTgzcWxrdzBtNWs2cWMifQ.FkeyGo6hi5tW9dx-GmAhHA'</span> <span style="color: #6a9955;">// Replace with your token</span>
    }).<span style="color: #dcdcaa;">addTo</span>(map);

    <span style="color: #6a9955;">// Create a feature group to store drawn items</span>
    <span style="color: #569cd6;">const</span> drawnItems = <span style="color: #c586c0;">new</span> L.FeatureGroup();
    map.<span style="color: #dcdcaa;">addLayer</span>(drawnItems);

    <span style="color: #6a9955;">// Initialize Leaflet Draw controls</span>
    <span style="color: #569cd6;">const</span> drawControl = <span style="color: #c586c0;">new</span> (L.Control <span style="color: #c586c0;">as</span> any).Draw({
      draw: { polygon: true, polyline: true, rectangle: true, circle: false, circlemarker: false, marker: true },
      edit: { featureGroup: drawnItems },
    });
    map.<span style="color: #dcdcaa;">addControl</span>(drawControl);

    <span style="color: #6a9955;">// --- Map Event Listeners ---</span>

    <span style="color: #6a9955;">// When a shape is drawn, add it to the layer and show the form</span>
    map.<span style="color: #dcdcaa;">on</span>(<span style="color: #ce9178;">'draw:created'</span> <span style="color: #c586c0;">as</span> any, (<span style="color: #9cdcfe;">e</span>: any) => {
      <span style="color: #569cd6;">const</span> layer = e.layer;
      drawnItems.<span style="color: #dcdcaa;">addLayer</span>(layer);
      currentLayerRef.current = layer;
      <span style="color: #dcdcaa;">setShowForm</span>(true);
    });

    <span style="color: #6a9955;">// Hide form during editing/deleting to prevent accidental submissions</span>
    map.<span style="color: #dcdcaa;">on</span>(<span style="color: #ce9178;">'draw:editstart'</span> <span style="color: #c586c0;">as</span> any, () => <span style="color: #dcdcaa;">setShowForm</span>(false));
    map.<span style="color: #dcdcaa;">on</span>(<span style="color: #ce9178;">'draw:deletestart'</span> <span style="color: #c586c0;">as</span> any, () => <span style="color: #dcdcaa;">setShowForm</span>(false));
    map.<span style="color: #dcdcaa;">on</span>(<span style="color: #ce9178;">'draw:editstop'</span> <span style="color: #c586c0;">as</span> any, () => { <span style="color: #c586c0;">if</span> (drawnItems.<span style="color: #dcdcaa;">getLayers</span>().length > <span style="color: #b5cea8;">0</span>) <span style="color: #dcdcaa;">setShowForm</span>(true); });
    map.<span style="color: #dcdcaa;">on</span>(<span style="color: #ce9178;">'draw:deletestop'</span> <span style="color: #c586c0;">as</span> any, () => { <span style="color: #c586c0;">if</span> (drawnItems.<span style="color: #dcdcaa;">getLayers</span>().length > <span style="color: #b5cea8;">0</span>) <span style="color: #dcdcaa;">setShowForm</span>(true); });

    <span style="color: #6a9955;">// Store map and layer instances in refs</span>
    mapInstanceRef.current = map;
    drawnItemsRef.current = drawnItems;

    <span style="color: #6a9955;">// Load existing data from the API</span>
    <span style="color: #dcdcaa;">loadExistingSpots</span>(map);

    <span style="color: #6a9955;">// Cleanup function to remove the map instance when the component unmounts</span>
    <span style="color: #c586c0;">return</span> () => {
      map.<span style="color: #dcdcaa;">remove</span>();
      mapInstanceRef.current = null;
    };
  }, []); <span style="color: #6a9955;">// Empty dependency array ensures this runs only once</span>

  <span style="color: #6a9955;">// --- Form Submission and Cancellation ---</span>

  <span style="color: #6a9955;">// Resets the form and clears any drawings</span>
  <span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">resetFormAndDrawing</span> = () => {
    <span style="color: #dcdcaa;">setFormData</span>({
        description: <span style="color: #ce9178;">''</span>, name: <span style="color: #ce9178;">''</span>, views: <span style="color: #ce9178;">''</span>, photo: null, review: <span style="color: #ce9178;">''</span>, rating: <span style="color: #b5cea8;">0</span>,
        adaAccessibility: <span style="color: #ce9178;">''</span>, parking: <span style="color: #ce9178;">''</span>, distance: <span style="color: #ce9178;">''</span>
    });
    <span style="color: #dcdcaa;">setImagePreview</span>(<span style="color: #ce9178;">''</span>);
    <span style="color: #dcdcaa;">setShowForm</span>(false);
    drawnItemsRef.current?.<span style="color: #dcdcaa;">clearLayers</span>();
    currentLayerRef.current = null;
  };
  
  <span style="color: #6a9955;">// Handles form submission to save the new spot</span>
  <span style="color: #569cd6;">const</span> <span style="color: #dcdcaa;">handleSubmit</span> = <span style="color: #c586c0;">async</span> (<span style="color: #9cdcfe;">e</span>: React.FormEvent) => {
    e.<span style="color: #dcdcaa;">preventDefault</span>();
    
    <span style="color: #c586c0;">if</span> (!currentLayerRef.current || !drawnItemsRef.current) <span style="color: #c586c0;">return</span>;

    <span style="color: #6a9955;">// Form validation</span>
    <span style="color: #c586c0;">if</span> (!formData.description || !formData.name || !formData.views || !formData.adaAccessibility || formData.rating === <span style="color: #b5cea8;">0</span>) {
      <span style="color: #dcdcaa;">toast</span>({ title: <span style="color: #ce9178;">"Missing Information"</span>, description: <span style="color: #ce9178;">"Please fill in all required fields."</span>, variant: <span style="color: #ce9178;">"destructive"</span> });
      <span style="color: #c586c0;">return</span>;
    }

    <span style="color: #dcdcaa;">setSaving</span>(true);

    <span style="color: #c586c0;">try</span> {
      <span style="color: #569cd6;">const</span> layer = currentLayerRef.current;
      <span style="color: #6a9955;">// Construct the payload for the API</span>
      <span style="color: #569cd6;">const</span> payload = {
        description: formData.description.trim(),
        name: formData.name.trim(),
        views: formData.views,
        photo: null, <span style="color: #6a9955;">// Photo upload would be handled separately (e.g., to S3)</span>
        review: formData.review.trim(),
        rating: formData.rating,
        ada: formData.adaAccessibility || null,
        parking: Number.isFinite(+formData.parking) ? +formData.parking : <span style="color: #b5cea8;">0</span>,
        distance: Number.isFinite(+formData.distance) ? +formData.distance : <span style="color: #b5cea8;">0</span>,
        geometry: (layer <span style="color: #c586c0;">as</span> any).<span style="color: #dcdcaa;">toGeoJSON</span>().geometry,
      };

      <span style="color: #569cd6;">const</span> res = <span style="color: #c586c0;">await</span> <span style="color: #dcdcaa;">fetch</span>(<span style="color: #ce9178;">`</span>${API_BASE}<span style="color: #ce9178;">/api/spots</span><span style="color: #ce9178;">`</span>, {
        method: <span style="color: #ce9178;">'POST'</span>,
        headers: { <span style="color: #ce9178;">'Content-Type'</span>: <span style="color: #ce9178;">'application/json'</span> },
        body: JSON.<span style="color: #dcdcaa;">stringify</span>(payload),
      });

      <span style="color: #569cd6;">const</span> data = <span style="color: #c586c0;">await</span> res.<span style="color: #dcdcaa;">json</span>();
      <span style="color: #c586c0;">if</span> (!res.ok || !data?.id) {
        <span style="color: #c586c0;">throw</span> <span style="color: #c586c0;">new</span> <span style="color: #4ec9b0;">Error</span>(data?.error || <span style="color: #ce9178;">`Save failed (</span>${res.status}<span style="color: #ce9178;">)`</span>);
      }

      <span style="color: #dcdcaa;">toast</span>({ title: <span style="color: #ce9178;">"Location Saved!"</span>, description: <span style="color: #ce9178;">"Your scenic spot has been saved."</span> });

      <span style="color: #6a9955;">// Refresh the existing spots layer to show the new addition</span>
      <span style="color: #c586c0;">if</span> (mapInstanceRef.current) {
          persistentLayerRef.current?.<span style="color: #dcdcaa;">remove</span>(); <span style="color: #6a9955;">// Remove old layer</span>
          <span style="color: #dcdcaa;">loadExistingSpots</span>(mapInstanceRef.current); <span style="color: #6a9955;">// Reload all spots</span>
      }
      <span style="color: #dcdcaa;">resetFormAndDrawing</span>(); <span style="color: #6a9955;">// Reset the form</span>

    } <span style="color: #c586c0;">catch</span> (err: any) {
      <span style="color: #dcdcaa;">toast</span>({ title: <span style="color: #ce9178;">"Save Failed"</span>, description: err.message, variant: <span style="color: #ce9178;">"destructive"</span> });
    } <span style="color: #c586c0;">finally</span> {
      <span style="color: #dcdcaa;">setSaving</span>(false);
    }
  };

  <span style="color: #c586c0;">return</span> (
    &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="relative w-full h-screen"__>
      &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">ref</span>={mapRef} <span style="color: #9cdcfe;">className</span>="w-full h-full"__ />

      {<span style="color: #6a9955;">/* Form Modal: Shows up when a user draws a shape */</span>}
      {showForm &amp;&amp; (
        &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"__>
          &lt;<span style="color: #4ec9b0;">Card</span> <span style="color: #9cdcfe;">className</span>="w-full max-w-md max-h-[90vh] overflow-y-auto shadow-lg bg-white rounded-2xl"__>
            &lt;<span style="color: #4ec9b0;">CardHeader</span>>
              &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="flex justify-between items-center"__>
                &lt;<span style="color: #4ec9b0;">CardTitle</span> <span style="color: #9cdcfe;">className</span>="text-2xl font-bold text-gray-800"__>Add Location Details&lt;/<span style="color: #4ec9b0;">CardTitle</span>>
                &lt;<span style="color: #4ec9b0;">button</span> <span style="color: #9cdcfe;">onClick</span>={resetFormAndDrawing} <span style="color: #9cdcfe;">className</span>="text-gray-400 hover:text-gray-600 text-2xl"__>&times;&lt;/<span style="color: #4ec9b0;">button</span>>
              &lt;/<span style="color: #4ec9b0;">div</span>>
            &lt;/<span style="color: #4ec9b0;">CardHeader</span>>
            &lt;<span style="color: #4ec9b0;">CardContent</span>>
              &lt;<span style="color: #4ec9b0;">form</span> <span style="color: #9cdcfe;">onSubmit</span>={handleSubmit} <span style="color: #9cdcfe;">className</span>="space-y-6"__>
                {<span style="color: #6a9955;">/* Fields for description, name, views, photo, review, rating, etc. */</span>}
                &lt;<span style="color: #4ec9b0;">div</span>>
                  &lt;<span style="color: #4ec9b0;">Label</span> <span style="color: #9cdcfe;">htmlFor</span>="description"__>Description *&lt;/<span style="color: #4ec9b0;">Label</span>>
                  &lt;<span style="color: #4ec9b0;">Input</span> <span style="color: #9cdcfe;">id</span>="description" <span style="color: #9cdcfe;">value</span>={formData.description} <span style="color: #9cdcfe;">onChange</span>={handleChange} <span style="color: #9cdcfe;">placeholder</span>="Describe this scenic spot" <span style="color: #9cdcfe;">required</span> />
                &lt;/<span style="color: #4ec9b0;">div</span>>

                &lt;<span style="color: #4ec9b0;">div</span>>
                  &lt;<span style="color: #4ec9b0;">Label</span> <span style="color: #9cdcfe;">htmlFor</span>="name"__>Your Name *&lt;/<span style="color: #4ec9b0;">Label</span>>
                  &lt;<span style="color: #4ec9b0;">Input</span> <span style="color: #9cdcfe;">id</span>="name" <span style="color: #9cdcfe;">value</span>={formData.name} <span style="color: #9cdcfe;">onChange</span>={handleChange} <span style="color: #9cdcfe;">placeholder</span>="Enter your name" <span style="color: #9cdcfe;">required</span> />
                &lt;/<span style="color: #4ec9b0;">div</span>>

                &lt;<span style="color: #4ec9b0;">div</span>>
                  &lt;<span style="color: #4ec9b0;">Label</span> <span style="color: #9cdcfe;">htmlFor</span>="views"__>Category *&lt;/<span style="color: #4ec9b0;">Label</span>>
                  &lt;<span style="color: #4ec9b0;">select</span>
                    <span style="color: #9cdcfe;">id</span>="views"
                    <span style="color: #9cdcfe;">value</span>={formData.views}
                    <span style="color: #9cdcfe;">onChange</span>={(<span style="color: #9cdcfe;">e</span>) => <span style="color: #dcdcaa;">setFormData</span>({ ...formData, views: e.target.value })}
                    <span style="color: #9cdcfe;">className</span>="mt-1 flex h-10 w-full rounded-md border"
                    <span style="color: #9cdcfe;">required</span>
                  >
                    &lt;<span style="color: #4ec9b0;">option</span> <span style="color: #9cdcfe;">value</span>="" <span style="color: #9cdcfe;">disabled</span>>Select a category&lt;/<span style="color: #4ec9b0;">option</span>>
                    &lt;<span style="color: #4ec9b0;">option</span> <span style="color: #9cdcfe;">value</span>="City lights"__>City Lights&lt;/<span style="color: #4ec9b0;">option</span>>
                    &lt;<span style="color: #4ec9b0;">option</span> <span style="color: #9cdcfe;">value</span>="Water Bodies"__>Water Bodies&lt;/<span style="color: #4ec9b0;">option</span>>
                    &lt;<span style="color: #4ec9b0;">option</span> <span style="color: #9cdcfe;">value</span>="Nature"__>Nature&lt;/<span style="color: #4ec9b0;">option</span>>
                    &lt;<span style="color: #4ec9b0;">option</span> <span style="color: #9cdcfe;">value</span>="Hikes"__>Hikes&lt;/<span style="color: #4ec9b0;">option</span>>
                    &lt;<span style="color: #4ec9b0;">option</span> <span style="color: #9cdcfe;">value</span>="Other"__>Other&lt;/<span style="color: #4ec9b0;">option</span>>
                  &lt;/<span style="color: #4ec9b0;">select</span>>
                &lt;/<span style="color: #4ec9b0;">div</span>>

                &lt;<span style="color: #4ec9b0;">div</span>>
                    &lt;<span style="color: #4ec9b0;">Label</span>>Rating *&lt;/<span style="color: #4ec9b0;">Label</span>>
                    &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="flex items-center mt-2"__>
                        {[<span style="color: #b5cea8;">1</span>, <span style="color: #b5cea8;">2</span>, <span style="color: #b5cea8;">3</span>, <span style="color: #b5cea8;">4</span>, <span style="color: #b5cea8;">5</span>].<span style="color: #dcdcaa;">map</span>((<span style="color: #9cdcfe;">star</span>) => (
                            &lt;<span style="color: #4ec9b0;">StarIcon</span>
                                <span style="color: #9cdcfe;">key</span>={star}
                                <span style="color: #9cdcfe;">className</span>={_<span style="color: #ce9178;">`cursor-pointer h-8 w-8 </span>${(hoverRating || formData.rating) >= star ? <span style="color: #ce9178;">'text-yellow-400'</span> : <span style="color: #ce9178;">'text-gray-300'</span>}<span style="color: #ce9178;">`</span>_}
                                <span style="color: #9cdcfe;">onClick</span>={() => <span style="color: #dcdcaa;">setFormData</span>({ ...formData, rating: star })}
                                <span style="color: #9cdcfe;">onMouseEnter</span>={() => <span style="color: #dcdcaa;">setHoverRating</span>(star)}
                                <span style="color: #9cdcfe;">onMouseLeave</span>={() => <span style="color: #dcdcaa;">setHoverRating</span>(<span style="color: #b5cea8;">0</span>)}
                            />
                        ))}
                    &lt;/<span style="color: #4ec9b0;">div</span>>
                &lt;/<span style="color: #4ec9b0;">div</span>>

                &lt;<span style="color: #4ec9b0;">div</span>>
                    &lt;<span style="color: #4ec9b0;">Label</span> <span style="color: #9cdcfe;">htmlFor</span>="review"__>Your Review&lt;/<span style="color: #4ec9b0;">Label</span>>
                    &lt;<span style="color: #4ec9b0;">Textarea</span> <span style="color: #9cdcfe;">id</span>="review" <span style="color: #9cdcfe;">value</span>={formData.review} <span style="color: #9cdcfe;">onChange</span>={handleChange} <span style="color: #9cdcfe;">placeholder</span>="Share your experience..." <span style="color: #9cdcfe;">rows</span>={<span style="color: #b5cea8;">4</span>} />
                &lt;/<span style="color: #4ec9b0;">div</span>>

                &lt;<span style="color: #4ec9b0;">div</span>>
                  &lt;<span style="color: #4ec9b0;">Label</span>>ADA Accessibility *&lt;/<span style="color: #4ec9b0;">Label</span>>
                  &lt;<span style="color: #4ec9b0;">RadioGroup</span>
                    <span style="color: #9cdcfe;">value</span>={formData.adaAccessibility}
                    <span style="color: #9cdcfe;">onValueChange</span>={(<span style="color: #9cdcfe;">value</span>) => <span style="color: #dcdcaa;">setFormData</span>({ ...formData, adaAccessibility: value })}
                    <span style="color: #9cdcfe;">className</span>="mt-2 space-y-2"
                  >
                    &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="flex items-center space-x-2"__>
                      &lt;<span style="color: #4ec9b0;">RadioGroupItem</span> <span style="color: #9cdcfe;">value</span>="Accessible" <span style="color: #9cdcfe;">id</span>="accessible" <span style="color: #9cdcfe;">name</span>="ada" />
                      &lt;<span style="color: #4ec9b0;">Label</span> <span style="color: #9cdcfe;">htmlFor</span>="accessible"__>Accessible&lt;/<span style="color: #4ec9b0;">Label</span>>
                    &lt;/<span style="color: #4ec9b0;">div</span>>
                    &lt;<span style="color: #4ec9b0;">div</span> <span style="color: #9cdcfe;">className</span>="flex items-center space-x-2"__>
                      &lt;<span style="color: #4ec9b0;">RadioGroupItem</span> <span style="color: #9cdcfe;">value</span>="Not Accessible" <span style="color: #9cdcfe;">id</span>="not-accessible" <span style="color: #9cdcfe;">name</span>="ada" />
                      &lt;<span style="color: #4ec9b0;">Label</span> <span style="color: #9cdcfe;">htmlFor</span>="not-accessible"__>Not Accessible&lt;/<span style="color: #4ec9b0;">Label</span>>
                    &lt;/<span style="color: #4ec9b0;">div</span>>
                  &lt;/<span style="color: #4ec9b0;">RadioGroup</span>>
                &lt;/<span style="color: #4ec9b0;">div</span>>
                
                {<span style="color: #6a9955;">/* ... other form fields like parking, distance, photo ... */</span>}

                &lt;<span style="color: #4ec9b0;">Button</span> <span style="color: #9cdcfe;">type</span>="submit" <span style="color: #9cdcfe;">className</span>="w-full bg-blue-600 text-white" <span style="color: #9cdcfe;">disabled</span>={saving}__>
                  {saving ? <span style="color: #ce9178;">'Saving...'</span> : <span style="color: #ce9178;">'Submit'</span>}
                &lt;/<span style="color: #4ec9b0;">Button</span>>
              &lt;/<span style="color: #4ec9b0;">form</span>>
            &lt;/<span style="color: #4ec9b0;">CardContent</span>>
          &lt;/<span style="color: #4ec9b0;">Card</span>>
        &lt;/<span style="color: #4ec9b0;">div</span>>
      )}
    &lt;/<span style="color: #4ec9b0;">div</span>>
  );
};

<span style="color: #c586c0;">export</span> <span style="color: #c586c0;">default</span> Map;
</code></pre>
</div>

'use client';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { Marker, Popup, TileLayer, MapContainer } from 'react-leaflet';

export default function LeafletMap() {
  const center = [-0.939273, 37.124928]; // Coordinates

  return (
    <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <Marker position={center}>
        <Popup>Mshop HQ</Popup>
      </Marker>
    </MapContainer>
  );
}
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Territory {
  areaId: number;
  area: number;
  coordinates: [number, number][];
  centerPoint: [number, number];
  status: "conquered" | "defended";
  conqueredAt: string;
  lastActivityDate: string;
}

interface MapComponentProps {
  territories: Territory[];
  mapView: "satellite" | "street";
  isLoading: boolean;
}

// Fix per le icone di Leaflet in Next.js - rimuove i marker di default
const fixLeafletIcon = () => {
  delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    iconUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    shadowUrl:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  });
};

export default function MapComponent({
  territories,
  mapView,
  isLoading,
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Fix per le icone di Leaflet
    fixLeafletIcon();

    // Inizializza la mappa
    const map = L.map(mapRef.current, {
      center: [45.4642, 9.19], // Milano come centro di default
      zoom: 10,
      zoomControl: true,
      attributionControl: true,
    });

    mapInstanceRef.current = map;

    // Crea il layer group per i territori
    const territoriesLayer = L.layerGroup().addTo(map);
    layersRef.current = territoriesLayer;

    // Aggiungi il layer di base (street view)
    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    // Aggiungi il layer satellitare
    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    );

    // Funzione per cambiare vista
    const updateMapView = () => {
      if (mapView === "satellite") {
        streetLayer.remove();
        satelliteLayer.addTo(map);
      } else {
        satelliteLayer.remove();
        streetLayer.addTo(map);
      }
    };

    updateMapView();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Aggiorna la vista della mappa quando cambia
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const map = mapInstanceRef.current;
    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );

    const satelliteLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      }
    );

    // Rimuovi tutti i layer esistenti
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Aggiungi il layer appropriato
    if (mapView === "satellite") {
      satelliteLayer.addTo(map);
    } else {
      streetLayer.addTo(map);
    }

    // Aggiungi di nuovo il layer dei territori
    if (layersRef.current) {
      layersRef.current.addTo(map);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapView]);

  // Aggiorna i territori sulla mappa
  useEffect(() => {
    if (!mapInstanceRef.current || !layersRef.current || isLoading) return;

    const map = mapInstanceRef.current;
    const territoriesLayer = layersRef.current;

    // Pulisci i layer esistenti
    territoriesLayer.clearLayers();

    if (territories.length === 0) return;

    // Crea i poligoni per ogni territorio
    territories.forEach((territory) => {
      // Crea il poligono
      const polygon = L.polygon(territory.coordinates, {
        color: territory.status === "conquered" ? "#10b981" : "#f59e0b",
        weight: 2,
        fillColor: territory.status === "conquered" ? "#10b981" : "#f59e0b",
        fillOpacity: 0.3,
      });

      // Aggiungi popup con informazioni
      const popupContent = `
        <div class="p-2">
          <h3 class="font-semibold text-lg mb-2">Territorio #${
            territory.areaId
          }</h3>
          <div class="space-y-1 text-sm">
            <p><strong>Stato:</strong> ${
              territory.status === "conquered" ? "Conquistato" : "Difeso"
            }</p>
            <p><strong>Area:</strong> ${territory.area.toLocaleString()} m²</p>
            <p class="text-xs text-gray-500"> ⚽️ ≈ ${Math.round(
              territory.area / 7140
            )} campi da calcio </p>
            <p><strong>Conquistato:</strong> ${new Date(
              territory.conqueredAt
            ).toLocaleDateString("it-IT")}</p>
            <p><strong>Ultima attività:</strong> ${new Date(
              territory.lastActivityDate
            ).toLocaleDateString("it-IT")}</p>
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent);
      territoriesLayer.addLayer(polygon);
    });

    // Fit bounds se ci sono territori
    if (territories.length > 0) {
      const bounds = L.latLngBounds(
        territories.flatMap((territory) => territory.coordinates)
      );
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [territories, isLoading]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center z-10">
          <div className="text-slate-600 dark:text-slate-400">
            Caricamento territori...
          </div>
        </div>
      )}
    </div>
  );
}

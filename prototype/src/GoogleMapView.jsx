import { useEffect, useRef } from "react";

const PIN_COLORS = {
  venue: "#FF9E67",
  toilet: "#51BDD6",
  atm: "#C4923D",
  changer: "#1D2A4A",
  clinic: "#B55248",
  pharmacy: "#2F6B58",
  store: "#6B4C9A",
};

const TOKYO = { lat: 35.6812, lng: 139.7671 };

export function loadGoogleMaps(key) {
  if (!key) return Promise.reject(new Error("Missing Google Maps API key"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (window.__jigoMapsLoader) return window.__jigoMapsLoader;

  window.__jigoMapsLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => {
      window.__jigoMapsLoader = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(script);
  });

  return window.__jigoMapsLoader;
}

export default function GoogleMapView({
  apiKey,
  pins,
  selected,
  query,
  trail,
  onOpenPin,
}) {
  const host = useRef(null);
  const mapRef = useRef(null);
  const markers = useRef(new Map());
  const lineRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    if (!apiKey || !host.current) return undefined;
    let alive = true;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!alive || !host.current) return;
        if (!mapRef.current) {
          mapRef.current = new maps.Map(host.current, {
            center: TOKYO,
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: true,
            clickableIcons: true,
            gestureHandling: "greedy",
            styles: [
              { featureType: "poi", stylers: [{ visibility: "simplified" }] },
              { featureType: "transit", stylers: [{ visibility: "simplified" }] },
            ],
          });
        }
        syncMarkers(maps);
        syncTrail(maps);
        focusSelection(maps);
        searchPlace(maps);
      })
      .catch((err) => {
        if (errorRef.current) errorRef.current.textContent = err.message;
      });

    return () => {
      alive = false;
    };
  }, [apiKey]);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;
    syncMarkers(window.google.maps);
  }, [pins, selected]);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;
    focusSelection(window.google.maps);
  }, [selected]);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;
    syncTrail(window.google.maps);
  }, [trail]);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;
    searchPlace(window.google.maps);
  }, [query]);

  function markerIcon(maps, pin) {
    const color = PIN_COLORS[pin.type] || "#FF9E67";
    return {
      path: "M12 2C8 2 5 5.2 5 9.2c0 5.4 7 12.6 7 12.6s7-7.2 7-12.6C19 5.2 16 2 12 2z",
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 1.6,
      scale: selected === pin.id ? 1.7 : 1.35,
      anchor: new maps.Point(12, 22),
    };
  }

  function syncMarkers(maps) {
    const map = mapRef.current;
    const seen = new Set();
    pins.forEach((pin) => {
      if (pin.lat == null || pin.lng == null) return;
      seen.add(pin.id);
      let marker = markers.current.get(pin.id);
      if (!marker) {
        marker = new maps.Marker({
          map,
          position: { lat: pin.lat, lng: pin.lng },
          title: pin.name,
        });
        marker.addListener("click", () => onOpenPin(pin.id));
        markers.current.set(pin.id, marker);
      }
      marker.setIcon(markerIcon(maps, pin));
      marker.setZIndex(selected === pin.id ? 200 : 10);
    });
    markers.current.forEach((marker, id) => {
      if (!seen.has(id)) {
        marker.setMap(null);
        markers.current.delete(id);
      }
    });
  }

  function focusSelection(maps) {
    const pin = pins.find((p) => p.id === selected);
    if (!pin || !mapRef.current) return;
    mapRef.current.panTo({ lat: pin.lat, lng: pin.lng });
    mapRef.current.setZoom(16);
  }

  function syncTrail(maps) {
    const path = (trail || [])
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => ({ lat: p.lat, lng: p.lng }));
    if (!lineRef.current) {
      lineRef.current = new maps.Polyline({
        map: mapRef.current,
        path,
        strokeColor: "#51BDD6",
        strokeOpacity: 0.95,
        strokeWeight: 4,
      });
      return;
    }
    lineRef.current.setPath(path);
  }

  function searchPlace(maps) {
    const q = (query || "").trim();
    if (!q || !mapRef.current) return;
    const hit = pins.find(
      (p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.note.toLowerCase().includes(q.toLowerCase())
    );
    if (hit) {
      mapRef.current.panTo({ lat: hit.lat, lng: hit.lng });
      mapRef.current.setZoom(16);
      return;
    }
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ address: q, region: "jp" }, (results, status) => {
      if (status !== "OK" || !results?.[0] || !mapRef.current) return;
      mapRef.current.panTo(results[0].geometry.location);
      mapRef.current.setZoom(15);
    });
  }

  return (
    <div className="gmap-wrap">
      <div className="gmap" ref={host} />
      <p className="gmap-error" ref={errorRef} />
    </div>
  );
}

const EMBED_SEARCH = {
  all: "Tokyo Japan",
  venue: "Tokyo attractions",
  toilet: "public toilet Asakusa Tokyo",
  atm: "7 Bank ATM Shibuya Tokyo",
  changer: "Travelex Shinjuku money exchange",
  clinic: "clinic Minato Tokyo",
  pharmacy: "pharmacy Tokyo Matsumoto Kiyoshi",
  store: "FamilyMart Kaminarimon Tokyo",
};

export function GoogleMapEmbed({ pin, filter }) {
  const q = pin?.name ? `${pin.name} Tokyo` : EMBED_SEARCH[filter] || "Tokyo Japan";
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${pin ? 16 : 14}&hl=en&output=embed`;
  return (
    <iframe
      className="gmap"
      title="Google Map"
      src={src}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}

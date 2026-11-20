// CARVIA Official Google Maps Component
// Powered directly by Google Maps JavaScript API with environment API Key and Dark Theme styling.

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

export default function InteractiveMap({
  locations = [],
  mode = 'ev', // 'ev' | 'parking'
  selectedLocation = null,
  onSelectLocation = () => {},
  center = [12.9352, 77.6245], // Bengaluru center
  zoom = 13,
}) {
  const iframeRef = useRef(null);

  // Official Google Maps Dark Theme JSON matching CARVIA #0D1110
  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#0D1110' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#0D1110' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8A9E98' }] },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#2FD987' }],
    },
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#0F1F18' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#1A201E' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#141918' }],
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9CA3AF' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#24332D' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1B2722' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#2FD987' }],
    },
    {
      featureType: 'transit',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0A1A14' }],
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#3E5C52' }],
    },
  ];

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #0D1110;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Google Maps custom overlay badge */
    .custom-badge {
      display: inline-flex;
      align-items: center;
      background: #141918;
      border: 2px solid #2FD987;
      border-radius: 20px;
      color: #F0F4F2;
      font-size: 11px;
      font-weight: 700;
      padding: 5px 10px;
      box-shadow: 0 4px 16px rgba(47, 217, 135, 0.4), 0 2px 6px rgba(0,0,0,0.8);
      cursor: pointer;
      user-select: none;
      transform: translate(-50%, -100%);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .custom-badge:hover, .custom-badge.active {
      transform: translate(-50%, -105%) scale(1.15);
      border-color: #00E5FF;
      box-shadow: 0 6px 20px rgba(0, 229, 255, 0.6);
      z-index: 9999 !important;
    }
    .custom-badge.parking {
      border-color: #3B9EFF;
      box-shadow: 0 4px 16px rgba(59, 158, 255, 0.4);
    }
    .custom-badge.busy {
      border-color: #FFB930;
      box-shadow: 0 4px 16px rgba(255, 185, 48, 0.4);
    }
    .custom-badge.full {
      border-color: #FF5A5A;
      box-shadow: 0 4px 16px rgba(255, 90, 90, 0.4);
      opacity: 0.75;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      margin-right: 6px;
      background-color: #2FD987;
    }
    .custom-badge.parking .badge-dot { background-color: #3B9EFF; }
    .custom-badge.busy .badge-dot { background-color: #FFB930; }
    .custom-badge.full .badge-dot { background-color: #FF5A5A; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map;
    var markers = [];
    var locations = ${JSON.stringify(locations)};
    var mode = '${mode}';
    var darkStyle = ${JSON.stringify(darkMapStyle)};

    function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: ${center[0]}, lng: ${center[1]} },
        zoom: ${zoom},
        styles: darkStyle,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER
        }
      });

      renderMarkers();

      map.addListener('click', function() {
        window.parent.postMessage({ type: 'DESELECT' }, '*');
        document.querySelectorAll('.custom-badge').forEach(function(el) {
          el.classList.remove('active');
        });
      });
    }

    // Custom HTML Overlay for glowing badges
    function HTMLMarker(lat, lng, html, onClick) {
      this.lat = lat;
      this.lng = lng;
      this.pos = new google.maps.LatLng(lat, lng);
      this.html = html;
      this.onClick = onClick;
      this.setMap(map);
    }

    HTMLMarker.prototype = new google.maps.OverlayView();

    HTMLMarker.prototype.onAdd = function() {
      var div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.cursor = 'pointer';
      div.innerHTML = this.html;
      this.div = div;

      var self = this;
      div.addEventListener('click', function(e) {
        e.stopPropagation();
        if (self.onClick) self.onClick();
      });

      var panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(div);
    };

    HTMLMarker.prototype.draw = function() {
      var overlayProjection = this.getProjection();
      if (!overlayProjection || !this.div) return;
      var position = overlayProjection.fromLatLngToDivPixel(this.pos);
      this.div.style.left = position.x + 'px';
      this.div.style.top = position.y + 'px';
    };

    HTMLMarker.prototype.onRemove = function() {
      if (this.div && this.div.parentNode) {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    };

    function renderMarkers() {
      // Clear previous markers
      markers.forEach(function(m) { m.setMap(null); });
      markers = [];

      locations.forEach(function(loc) {
        var isParking = loc.category === 'parking' || loc.pricePerHour !== undefined;
        var statusClass = loc.status === 'full' ? 'full' : loc.status === 'partial' || loc.status === 'busy' ? 'busy' : '';
        var modeClass = isParking ? 'parking' : '';
        var label = isParking
          ? '🅿️ ₹' + loc.pricePerHour + '/h'
          : (loc.maxPower ? '⚡ ' + loc.maxPower + ' kW' : '⚡ EV');

        var badgeHtml = '<div class="custom-badge ' + modeClass + ' ' + statusClass + '" id="badge-' + loc.id + '">' +
          '<span class="badge-dot"></span>' +
          '<span>' + label + '</span>' +
          '</div>';

        var marker = new HTMLMarker(loc.lat, loc.lng, badgeHtml, function() {
          window.parent.postMessage({ type: 'SELECT_LOCATION', id: loc.id }, '*');
          highlightBadge(loc.id);
          map.panTo({ lat: loc.lat, lng: loc.lng });
        });

        markers.push(marker);
      });
    }

    function highlightBadge(id) {
      document.querySelectorAll('.custom-badge').forEach(function(el) {
        el.classList.remove('active');
      });
      var target = document.getElementById('badge-' + id);
      if (target) target.classList.add('active');
    }

    window.addEventListener('message', function(event) {
      if (!event.data) return;
      if (event.data.type === 'PAN_TO' && map) {
        map.panTo({ lat: event.data.lat, lng: event.data.lng });
        map.setZoom(event.data.zoom || 15);
        if (event.data.id) highlightBadge(event.data.id);
      } else if (event.data.type === 'UPDATE_LOCATIONS' && map) {
        locations = event.data.locations || [];
        renderMarkers();
      }
    });

    // Initialize once script is loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      window.onload = initMap;
    }
  </script>
</body>
</html>
`;

  useEffect(() => {
    const handleMessage = (event) => {
      if (!event.data) return;
      if (event.data.type === 'SELECT_LOCATION') {
        const found = locations.find((l) => l.id === event.data.id);
        if (found) {
          onSelectLocation(found);
        }
      } else if (event.data.type === 'DESELECT') {
        onSelectLocation(null);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [locations, onSelectLocation]);

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'UPDATE_LOCATIONS',
          locations,
        },
        '*'
      );
    }
  }, [locations]);

  useEffect(() => {
    if (selectedLocation && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'PAN_TO',
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          zoom: 15,
          id: selectedLocation.id,
        },
        '*'
      );
    }
  }, [selectedLocation]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          title="CARVIA Google Map"
          style={styles.iframe}
          frameBorder="0"
        />
      ) : (
        <View style={styles.nativeFallback} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    width: '100%',
    height: '100%',
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    backgroundColor: '#0D1110',
  },
  nativeFallback: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

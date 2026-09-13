const cartoBasemapKey = import.meta.env.VITE_CARTO_BASEMAP_KEY as string | undefined

export const LEAFLET_TILE_LAYER_URL = cartoBasemapKey
  ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoBasemapKey)}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

export const LEAFLET_TILE_LAYER_OPTIONS = cartoBasemapKey
  ? {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      className: 'leaflet-tile-carto',
      maxZoom: 20,
      subdomains: 'abcd',
    }
  : {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      className: 'leaflet-tile-osm-fallback',
      maxZoom: 19,
    }

import mapboxgl from 'mapbox-gl';

class MapManager{
  constructor(){
    if(!localStorage.getItem('map_zoom')){
      localStorage.setItem('map_zoom', JSON.stringify(5));
    }
    console.log(localStorage.getItem('map_center'))
    if(!localStorage.getItem('map_center')){
      localStorage.setItem('map_center', JSON.stringify([0, 0]));
      // if (navigator.geolocation) {
      //   try{
      //       navigator.geolocation.getCurrentPosition(function(position) {
      //       console.log(position)
      //       localStorage.setItem('map_center', JSON.stringify([position.coords.longitude, position.coords.latitude]));
      //     });
      //   }
      //   catch{
      //     localStorage.setItem('map_center', JSON.stringify([0, 0]));
      //   }
      // }
      // else localStorage.setItem('map_center', JSON.stringify([0, 0]));
    }
    // localStorage.setItem('map_center', JSON.stringify([0, 0]));

    if(!localStorage.getItem('map_pitch')){
      localStorage.setItem('map_pitch', JSON.stringify(0));
    }
    this.map = null
    this.createMap = this.createMap.bind(this);
  }
  createMap(layers, settings, mapContainer){
    let map = new Map({
      container: mapContainer,
      // projection: 'globe',
      style: 'mapbox://styles/mapbox/satellite-streets-v11',
      center: JSON.parse(localStorage.getItem('map_center')),//[38.782723, 47.327716],
      // zoom: 14,
      zoom: parseInt(localStorage.getItem('map_zoom')),
      pitch: JSON.parse(localStorage.getItem('map_pitch')),
      preserveDrawingBuffer: true,
      // maxZoom: 16.5,
      antialias: true,
    });
    map.on('style.load', () => {
      map.addSource('mapbox-dem', {
          'type': 'raster-dem',
          'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
          'tileSize': 512,
          'maxzoom': 14
      });
      // add the DEM source as a terrain layer with exaggerated height
      map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

      const layers = map.getStyle().layers;
        const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout['text-field']
        ).id;

        // The 'building' layer in the Mapbox Streets
        // vector tileset contains building height data
        // from OpenStreetMap.
        map.addLayer(
          {
              'id': 'add-3d-buildings',
              'source': 'composite',
              'source-layer': 'building',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': 15,
              'paint': {
                  'fill-extrusion-color': '#aaa',

                  // Use an 'interpolate' expression to
                  // add a smooth transition effect to
                  // the buildings as the user zooms in.
                  'fill-extrusion-height': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      15,
                      0,
                      15.05,
                      ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                      'interpolate',
                      ['linear'],
                      ['zoom'],
                      15,
                      0,
                      15.05,
                      ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.8
              }
          },
          labelLayerId
        );
    });
    map.on("idle", () => {
      map.resize()
    })
    map.on('dragend', () => {
      localStorage.setItem('map_center', JSON.stringify(map.getCenter()));
      });
    map.on('zoomend', () => {
      // console.log(map.transform.scale, map.getZoom())
      localStorage.setItem('map_zoom', JSON.stringify(map.getZoom()));
    });
    map.on('pitchend', () => {
      localStorage.setItem('map_pitch', JSON.stringify(map.getPitch()));
    });
    this.map = map
    return map
  }
  buildStyle(layers, settings){
    return null
  }
  updateStyle(layers, settings){
    let [style, lazy_layers] = this.buildStyle(layers, settings)
    // console.log(this.map.getStyle())
    // console.log(style)
    this.map.setStyle(style)
    // console.log(this.map.getStyle())
    this.map.once('styledata', () => {
      // console.log(this.map)
      for(let layer_id in lazy_layers){
        // рельеф
        if(layer_id == 6){
          if(lazy_layers[layer_id].layer.active == "active"){
            this.map.setTerrain({ 'source': lazy_layers[layer_id].id, 'exaggeration': 1 });
          }
        }
        // здания
        else if(layer_id == 8){
          const layers = this.map.getStyle().layers;
          const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
          )
          this.map.addLayer(
            {
            'id': 'add-3d-buildings',
            'source': lazy_layers[layer_id].id,
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': lazy_layers[layer_id].layer.minzoom,
            'maxzoom': lazy_layers[layer_id].layer.maxzoom,
            'paint': {
              'fill-extrusion-color': 
              [
                'case',
                ['boolean', ['feature-state', 'select'], false],
                "red",
                ['boolean', ['feature-state', 'hover'], false],
                "lightblue",
                '#aaa'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8,
            },
            'layout': {
              'visibility': lazy_layers[layer_id].layer.active == "active" ? 'visible' : 'none'
            }
            },
            labelLayerId.id
            )
        }
      }
      });
  }

  // goToPos(target){
  //   let data = new FormData()
  //   data.append("target", target)
  //   axios.post("/api/gotoPos/", data).then(response => {
  //       if (response.data.result == true){
  //         return true
  //       }else{
  //         return false
  //       }
  //       // if (response.data.result == true){
  //       //     this.addTemporaryMarker(response.data.coords)
  //       // }else{
  //       //     this.props.update_modal_message({
  //       //         active: true,
  //       //         heading: "Ошибка названия",
  //       //         message: this.errors[response.data.errorCode]
  //       //     })
  //       // }
  //   })
  // }
}

class Map extends mapboxgl.Map{
  constructor(...args){
    super(...args)
    this.currentEventListener = null
    this.setEventListener = this.setEventListener.bind(this);
    this.unsetEventListener = this.unsetEventListener.bind(this);
  }
  setEventListener(map_, eventListener){
    if(this.currentEventListener != null) this.off('click', this.currentEventListener)
    this.currentEventListener = eventListener
    this.on("click", eventListener)
  }
  unsetEventListener(map_){
    if(this.currentEventListener != null) this.off('click', this.currentEventListener)
    this.currentEventListener = null
  }
}

export default MapManager
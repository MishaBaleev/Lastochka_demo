import takeoff_marker from "./img/takeoff_marker.png";
import point_marker from "./img/point_marker.png";
import icon_center from "./img/icon_center.png";
import mapboxgl from 'mapbox-gl';

function rotateFigureCenter(cords, center, phi){
    phi = phi*Math.PI/180
    let rotatedFigure = []
    for(let pair of cords){
      let x = pair[0]-center[0]
      let y = pair[1]-center[1]
      let x_rot = x*Math.cos(phi) - y*Math.sin(phi)
      let y_rot = x*Math.sin(phi) + y*Math.cos(phi)
      rotatedFigure.push([
        x_rot+center[0], y_rot+center[1]
      ])
    }
    return rotatedFigure
}

function addTurnaroundDistance(cords, distance, direction){
  let turnaround_distance_y = getGeoCordsFromMeters(distance, cords[1])
  let cortej = []
  if(direction == true){
    cortej = [cords[0], cords[1]+turnaround_distance_y]
  }
  else{
    cortej = [cords[0], cords[1]-turnaround_distance_y]
  }
  return cortej
}

function getProjective(cords){
  let x = cords.map(x=>x[0])
  let y = cords.map(x=>x[1])

  let x_projection = {
      min:0,
      max:0,
      pr:0
  }
  let y_projection = {
      min:0,
      max:0,
      pr:0
  }

  x_projection.min = Math.min(...x)
  x_projection.max = Math.max(...x)
  x_projection.pr = x_projection.max - x_projection.min
  
  y_projection.min = Math.min(...y)
  y_projection.max = Math.max(...y)
  y_projection.pr = y_projection.max - y_projection.min

  return {x_pr:x_projection, y_pr:y_projection}
}

function getGeoCordsFromMeters(m, min_lng){
  let step = m/1000
  const km_ekv = 40075.696/360
  let step_deg = step/(km_ekv*Math.cos(Math.PI*min_lng/180))
  return step_deg
}

export class CommonManager{
    constructor(map, manager3D, update_modal_message){
        this.map = map 
        this.manager3D = manager3D
        this.translate_cursor = false 
        this.start_marker = null
        this.update_modal_message = update_modal_message
        this.route_line = null
        this.params = {
          angle: 0,
          line_distance: 2,
          turnaround_distance: 0,
          reverse: false,
          is_rtl: true
        }
        this.conture = {
            markers:[],
            cords:[],
            edges:[],
            source:{
              'type': 'geojson',
              'data': {
                'type': 'Feature',
                'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    []
                  ]
                }
              }
            },
            layer_area:{
              'id': "conture",
              'type': 'fill',
              'source': "conture",
              'layout': {},
              'paint': {
                'fill-color': '#008000',
                'fill-opacity': 0.5
                }
            },
            layer_line:{
                'id': 'line_conture',
                'type': 'line',
                'source': "conture",
                'layout': {},
                'paint': {
                'line-color': '#000',
                'line-width': 2
                }
            }
        }
        this.markup = {
            cords:[],
            source:{
              'type': 'geojson',
              'data': {
                'type': 'Feature',
                'geometry': {
                'type': 'LineString',
                'coordinates': [
                    []
                  ]
                }
              }
            },
            layer:{
              'id': "markup",
              'type': 'line',
              'source': "markup",
              'layout': {},
              'paint': {
              'line-color': '#fff',
              'line-width': 2
              }
            }
        };
    }

    toggleCursor(){
        if (this.translate_cursor === true){
          this.translate_cursor = false 
        }else{
          this.translate_cursor = true
        }
    }

    setStartMarker(coords){
      if (this.start_marker === null){
        this.start_marker = new mapboxgl.Marker({draggable: false}).setLngLat(coords).addTo(this.map)
        let icon = document.createElement('img');
        icon.src = takeoff_marker;
        icon.width = 35
        icon.height = 35
        this.start_marker.getElement().querySelector("svg").remove()
        this.start_marker.getElement().append(icon)
        let indicator = document.createElement('span');
        indicator.className = "mapbox_gl_active_indicator"
        this.start_marker.getElement().append(indicator)
        this.start_marker.getElement().classList.add("takeoff")
      }else{
        this.start_marker.remove()
        this.start_marker = null
        this.setStartMarker(coords)
      }
      this.updateRouteLine()
    }

    changeMarkerIcon(marker, Icon, width, height) {
      let icon = document.createElement('img');
      icon.src = Icon;
      icon.width = width
      icon.height = height
      marker.getElement().classList.add("mapboxgl-marker__polygon")
      marker.getElement().querySelector("svg").remove()
      marker.getElement().append(icon)
      let indicator = document.createElement('span');
      indicator.className = "mapbox_gl_active_indicator"
      marker.getElement().append(indicator)
    }

    rotatePolygon(angle){ ///real rotate
      this.params.angle = Number(angle)
      if (this.conture.cords.length != 0){
        this.updateCenterMarker()
        this.updateMarkup()
      }
    }
    changeLineSpacing(dist){
      this.params.line_distance = Number(dist)
      if (this.conture.cords.length != 0){
        this.updateCenterMarker()
        this.updateMarkup()
      }
    }
    toggleRTL(){
      if (this.params.is_rtl === true){
        this.params.is_rtl = false
      }else{
        this.params.is_rtl = true 
      }
      if (this.conture.markers.length != 0){
        this.updateCenterMarker()
        this.updateMarkup()
      }
    }

    markupPolygon(){
      let edges = []
      let cords_markup = this.rotate(this.conture.cords, 1)
      for(let c = 0; c < this.conture.cords.length-1; c++){
        edges.push([cords_markup[c], cords_markup[c+1]])
      }
      let pr = getProjective(cords_markup)
      let step = getGeoCordsFromMeters(this.params.line_distance, pr.y_pr.min)
      let steps = Math.trunc(pr.x_pr.pr/step)
      let cords = []
      for(let i = 0; i < steps; i++){
        let x_0 = pr.x_pr.min+step*(i+1)
        let crossings = []
        let low = [1000, null];
        let high = [-1000, null];
        for(let j = 0; j < edges.length; j++){
            let A = edges[j][0]
            let B = edges[j][1]
            let y = (B[1]-A[1])*(x_0-B[0])/(B[0]-A[0])+B[1]
            let min_y = Math.min(A[1],B[1])
            let max_y = Math.max(A[1],B[1])
            if(y>min_y && y< max_y){
              if(y>high[0]){
                high[0] = y
                high[1] = [x_0, y]
              }
              else if(y<low[0]){
                low[0] = y
                low[1] = [x_0, y]
              }
              crossings.push([x_0, y])
            }
        }
        crossings = crossings.sort(function(a, b){return a[1]-b[1]})

        low[1] = crossings[0]
        high[1] = crossings[crossings.length-1]

        low[1] = addTurnaroundDistance(low[1], this.params.turnaround_distance, false)
        high[1] = addTurnaroundDistance(high[1], this.params.turnaround_distance, true)
        if((cords.length+2)%4 == 0){
          cords.push(low[1])
          cords.push(high[1])
        }
        else{
          cords.push(high[1])
          cords.push(low[1])
        }
      }
      cords = this.rotate(cords, -1)
      if (cords.length == 0){
        return this.conture.cords
      }else{
        return cords
      }
    }

    addConturePoint(coords){
        let cords = coords;
        let marker = new mapboxgl.Marker(
            {
                draggable: true
            }
        ).setLngLat(cords).addTo(this.map);
        marker.conture_index = this.conture.markers.length;
        this.conture.markers.push(marker)
        let dragContainer = (e) => {e.marker = marker; e.evt = {}; this.drag(e)}
        let dragEndContainer = (e) => {e.evt = {}; this.dragEndCont(e)}
        let dragStartContainer = (e) => {e.evt = {}; this.dragStartCont(e)}
        marker.on("drag", dragContainer)
        marker.on("dragend", dragEndContainer)
        marker.on("dragstart", dragStartContainer)
        this.changeMarkerIcon(marker, point_marker, 35, 35)
        if(this.conture.markers.length == 1){
          this.conture.cords.push(cords)
          this.conture.cords.push(cords)
          this.conture.source.data.geometry.coordinates = [this.conture.cords]
          this.map.addSource("conture", this.conture.source)
          this.map.addLayer(this.conture.layer_area)
          this.map.addLayer(this.conture.layer_line)
        }
        if(this.conture.markers.length > 1){
            this.conture.cords.pop()
            this.conture.cords.push(cords)
            this.conture.cords.push(this.conture.cords[0])
            this.conture.source.data.geometry.coordinates = [this.conture.cords]
            this.map.getSource("conture").setData(this.conture.source.data)
        }
        if(this.conture.markers.length == 3){
          this.center_marker = new mapboxgl.Marker({
            draggable:true
          })
          this.changeMarkerIcon(this.center_marker, icon_center, 25, 25)
          let cords = [0,0]
          for(let c = 0; c < this.conture.cords.length-1; c++){
            cords[0] += this.conture.cords[c][0]
            cords[1] += this.conture.cords[c][1]
          }
          cords = [cords[0]/(this.conture.cords.length-1), cords[1]/(this.conture.cords.length-1)]
          this.center_marker.setLngLat(cords).addTo(this.map);
    
          this.container__dragStartCenterMarker = (e) => {e.mapElement = this; e.marker = this.center_marker; e.evt = this.data; this.dragStartCenterMarker(e)}
          this.container__dragCenterMarker = (e) => {e.mapElement = this; e.marker = this.center_marker; e.evt = this.data; this.dragCenterMarker(e)}
          this.container__dragEndStartCenterMarker = (e) => {e.mapElement = this; e.marker = this.center_marker; e.evt = this.data; this.dragEndStartCenterMarker(e)}
      
          this.center_marker.on("dragstart", this.container__dragStartCenterMarker)
          this.center_marker.on("drag", this.container__dragCenterMarker)
          this.center_marker.on("dragend", this.container__dragEndStartCenterMarker)
          let cords_markup = this.markupPolygon()
          this.markup.cords = cords_markup
        }
        if (this.conture.markers.length >= 3){
            let cords_markup = this.markupPolygon()
            this.markup.cords = cords_markup
            this.updateRouteLine()
        }
    }

    rotate(cords, factor){
      let centerCords = this.center_marker.getLngLat()
      centerCords = [centerCords.lng, centerCords.lat]
      let rotated_cords = rotateFigureCenter(cords, centerCords, factor*this.params.angle)
      return rotated_cords
    }
    isValid(){
      let edges = []
      let cords_markup = this.rotate(this.conture.cords, 1)
      for(let c = 0; c < this.conture.cords.length-1; c++){
        edges.push([cords_markup[c], cords_markup[c+1]])
      }
      let pr = getProjective(cords_markup)
      let step = getGeoCordsFromMeters(this.params.line_distance, pr.y_pr.min)
      let steps = Math.trunc(pr.x_pr.pr/step)
      if(1 > steps) return false
      else return true
    }

    updateMarkup(){
      this.markup.cords = this.markupPolygon()
      this.markup.source.data.geometry.coordinates = this.markup.cords
      this.updateRouteLine()
    }

    updatePolygonPosition(){
      this.conture.source.data.geometry.coordinates = [this.conture.cords]
      this.map.getSource("conture").setData(this.conture.source.data)
      this.updateMarkup()
    }

    dragStartCenterMarker(e){
      // e.evt.route.tbManager.resetCollisionObjects()
      let center_cords = e.marker.getLngLat()
      e.marker.diff = []
      for(let cords of this.conture.cords){
        e.marker.diff.push(
          [cords[0]-center_cords.lng, cords[1]-center_cords.lat]
        )
      }
    }
    dragCenterMarker(e){
      let center_cords = e.marker.getLngLat()
      for(let c = 0; c < this.conture.markers.length; c++){
        let changed_cords = [e.marker.diff[c][0]+center_cords.lng, e.marker.diff[c][1]+center_cords.lat]
        this.conture.cords[c] = changed_cords
        if(c == 0){
          this.conture.cords[this.conture.cords.length-1] = changed_cords
        }
        this.conture.markers[c].setLngLat(changed_cords)
      }
      this.updatePolygonPosition()
    }
    dragEndStartCenterMarker(e){
      e.marker.diff = []
    }
    drag(e){
      let cords = e.marker.getLngLat()
      let before_cords = this.conture.cords[e.marker.conture_index]
      this.conture.cords[e.marker.conture_index] = [cords.lng, cords.lat]
      if(!this.isValid()){
        this.conture.cords[e.marker.conture_index] = before_cords
        e.marker.setLngLat(before_cords)
        return
      }
  
      this.conture.cords[e.marker.conture_index] = [cords.lng, cords.lat]
      if(e.marker.conture_index == 0){
        this.conture.cords[this.conture.cords.length-1] = [cords.lng, cords.lat]
      }
      this.conture.source.data.geometry.coordinates = [this.conture.cords]
      this.map.getSource("conture").setData(this.conture.source.data)
      this.updateCenterMarker()
      this.updateMarkup()
    }
    dragStartCont(e){
      
    }
    dragEndCont(e){
      
    }
    dragEnd(e){
      
    }

    updateCenterMarker(){
      let cords = [0,0]
      for(let c = 0; c < this.conture.cords.length-1; c++){
        cords[0] += this.conture.cords[c][0]
        cords[1] += this.conture.cords[c][1]
      }
      cords = [cords[0]/(this.conture.cords.length-1), cords[1]/(this.conture.cords.length-1)]
      this.center_marker.setLngLat(cords)
    }

    updateRouteLine(){
        if (this.conture.markers.length === 3){
          let route = []
          if (this.params.is_rtl === true){
            route = [[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat]].concat(this.markup.cords).concat([[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat]])
          }else{
            route = [[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat]].concat(this.markup.cords)
          }
          if (this.map.getSource("route")){
            let new_data = {
              "type": "FeatureCollection",
              "features": [
                  {
                      "type": "Feature",
                      "geometry": {
                          "type": "LineString",
                          "coordinates": route
                      }
                  }
              ]
            }
            this.map.getSource("route").setData(new_data)
          }else{
            let source = {
              'type': 'geojson',
              'data': {
                  'type': 'Feature',
                  'properties': {},
                  'geometry': {
                      'type': 'LineString',
                      'coordinates': route
                  }
              }
            }
            this.map.addSource('route', source)
            let layer = {
              'id': 'route',
              'type': 'line',
              'source': 'route',
              'layout': {
                  'line-join': 'round',
                  'line-cap': 'round'
              },
              'paint': {
                  'line-color': 'yellow',
                  'line-width': 3
              }
            }
            this.map.addLayer(layer)
          }          
        }else if (this.conture.cords.length > 3){
          let route = []
          if (this.params.is_rtl === true){
            route = [[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat]].concat(this.markup.cords).concat([[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat]])
          }else{
            route = [[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat]].concat(this.markup.cords)
          }
          let new_data = {
              "type": "FeatureCollection",
              "features": [
                  {
                      "type": "Feature",
                      "geometry": {
                          "type": "LineString",
                          "coordinates": route
                      }
                  }
              ]
          }
          this.map.getSource("route").setData(new_data)
        }
    }

    setPolygon(coords){
      if (this.start_marker === null){
        this.update_modal_message({active: true, heading: "Ошибка", message: "Сначала добавьте точку старта"})
      }else{
        this.addConturePoint(coords)
      }
    }
    deletePolygon(){
      if (this.map.getSource("conture")){
        this.map.removeLayer("conture")
        this.map.removeLayer("line_conture")
        this.map.removeLayer("route")
        this.map.removeSource("conture")
        this.map.removeSource("route")  
        this.conture.markers.forEach(marker => {
          marker.remove()
        })
        this.center_marker.remove()
      }
      this.conture = {
        markers:[],
        cords:[],
        edges:[],
        source:{
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
            'type': 'Polygon',
            'coordinates': [
                []
              ]
            }
          }
        },
        layer_area:{
          'id': "conture",
          'type': 'fill',
          'source': "conture",
          'layout': {},
          'paint': {
            'fill-color': '#008000',
            'fill-opacity': 0.5
            }
        },
        layer_line:{
            'id': 'line_conture',
            'type': 'line',
            'source': "conture",
            'layout': {},
            'paint': {
            'line-color': '#000',
            'line-width': 2
            }
        }
      }
      this.markup = {
          cords:[],
          source:{
            'type': 'geojson',
            'data': {
              'type': 'Feature',
              'geometry': {
              'type': 'LineString',
              'coordinates': [
                  []
                ]
              }
            }
          },
          layer:{
            'id': "markup",
            'type': 'line',
            'source': "markup",
            'layout': {},
            'paint': {
            'line-color': '#fff',
            'line-width': 2
            }
          }
      }
    }
    clearAll(){
      this.deletePolygon()
      if (this.start_marker){
        this.start_marker.remove()
      }
    }
}
import mapboxgl from "mapbox-gl";
import MapIcon from "./icon_map_polygon.png"
import centerMarkerIcon from "./icon_center.png"
import pointIcon from "./point.png"

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
  let turnaround_distance_x = getGeoCordsFromMeters(distance, cords[0])
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
function rotateCords(cords, phi){
  phi = phi*Math.PI/180
  let x = cords[0]
  let y = cords[1]
  let x_rotated, y_rotated

  x_rotated = x*Math.cos(phi) - y*Math.sin(phi)
  if(Math.abs(x_rotated)<1.1e-12) x_rotated=0
  y_rotated = x*Math.sin(phi) + y*Math.cos(phi)
  if(Math.abs(y_rotated)<1.1e-12) y_rotated=0
  return [x_rotated, y_rotated]
}
function markupPolygon(step_meters, temp1){
  let edges = []
  for(let c = 0; c < temp1.length-1; c++){
      edges.push([temp1[c], temp1[c+1]])
  }
  let pr = getProjective(temp1)
  let step = getGeoCordsFromMeters(step_meters, pr.y_pr.min)
  let steps = Math.trunc(pr.x_pr.pr/step)
  let cords = []
  for(let i = 0; i < steps; i++){
      let crossings = []
      let x_0 = pr.x_pr.min+step*(i+1)
      for(let j = 0; j < edges.length; j++){
          let A = edges[j][0]
          let B = edges[j][1]
          let y = (B[1]-A[1])*(x_0-B[0])/(B[0]-A[0])+B[1]
          let min_y = Math.min(A[1],B[1])
          let max_y = Math.max(A[1],B[1])
          if(y>min_y && y< max_y){
              cords.push([x_0, y])
              let len = cords.length
              if(len%4==0){
                  cords[len-2] = cords.splice(len-1,1, cords[len-2])[0]
              }
          }
      }
  }
  return cords
}

class PolygonME{
  constructor(evt, map, params){
  // constructor(map, line_distance, turnaround_distance, angle){
    this.id = "polygon_"+Date.now()
    this.id_markup = "markup_"+this.id
    this.map = map;
    this.data = evt;
    this.params = params;
    // this.line_distance = line_distance
    // this.params.turnaround_distance.value = turnaround_distance
    // this.params.angle.value = angle;
    // this.params.reverse = false
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
        'id': this.id,
        'type': 'fill',
        'source': this.id,
        'layout': {},
        'paint': {
          'fill-color': '#008000',
          'fill-opacity': 0.5
          }
        },
        layer_line:{
          'id': 'line_'+this.id,
          'type': 'line',
          'source': this.id,
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
        'id': this.id_markup,
        'type': 'line',
        'source': this.id_markup,
        'layout': {},
        'paint': {
        'line-color': '#fff',
        'line-width': 2
        }
      }
    };
    this.polygon_route = [];
    this.center_marker = null;
    // this.setCords = null;
    this.count = 0;
    this.start_point = null;
    this.end_point = null;
    this.dragEndContainer = (e) => {e.mapElement = this; e.evt = this.data; this.dragEnd(e)}
    this.dragContainer = (e) => {e.mapElement = this; this.drag(e)}
    // this.dragStartContainer = (e) => {e.mapElement = this; this.dragStart(e)}
  }

  addConturePoint(evt){
    let cords = evt.lngLat;
    let marker = new mapboxgl.Marker(
        {
            draggable: true
        }
    );
    marker.setLngLat(cords).addTo(this.map);
    // let cords = marker.getLngLat()
    marker.conture_index = this.conture.markers.length;
    this.conture.markers.push(marker)
    let dragContainer = (e) => {e.mapElement = this; e.marker = marker; e.evt = evt; this.drag(e)}
    let dragEndContainer = (e) => {e.evt = evt; this.dragEndCont(e)}
    let dragStartContainer = (e) => {e.evt = evt; this.dragStartCont(e)}
    marker.on("drag", dragContainer)
    marker.on("dragend", dragEndContainer)
    marker.on("dragstart", dragStartContainer)
    this.changeMarkerIcon(marker, MapIcon, 35, 35)
    if(this.conture.markers.length == 1){
      this.conture.cords.push([cords.lng, cords.lat])
      this.conture.cords.push([cords.lng, cords.lat])
      this.conture.source.data.geometry.coordinates = [this.conture.cords]
      this.map.addSource(this.id, this.conture.source)
      //this.map.addLayer(this.conture.layer_area)
      this.map.addLayer(this.conture.layer_line)
    }
    if(this.conture.markers.length > 1){
      this.conture.cords.pop()
      this.conture.cords.push([cords.lng, cords.lat])
      this.conture.cords.push(this.conture.cords[0])
      this.conture.source.data.geometry.coordinates = [this.conture.cords]
      this.map.getSource(this.id).setData(this.conture.source.data)
    }
    if(this.conture.markers.length == 3){
      this.center_marker = new mapboxgl.Marker({
        draggable:true
      })
      this.changeMarkerIcon(this.center_marker, centerMarkerIcon, 25, 25)
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
      // console.log(cords_markup)
      // if (cords_markup.length == 0){
      //   console.log(this.conture.cords)
      // }
      this.markup.cords = cords_markup
      this.markup.source.data.geometry.coordinates = this.markup.cords
      this.map.addSource(this.id_markup, this.markup.source)
      this.start_point = new mapboxgl.Marker({
        draggable:false
      })
      this.end_point = new mapboxgl.Marker({
        draggable:false
      })
      
      this.start_point.setLngLat(this.markup.cords[0]).addTo(this.map)

      this.end_point.setLngLat(this.markup.cords[this.markup.cords.length-1]).addTo(this.map)
      
      this.changePointIcon(this.start_point, pointIcon, 35, 35)
      this.changePointIcon(this.end_point, pointIcon, 35, 35)
      this.params.route.updateNodeParams(this.params.node,{
        conture:this.conture.cords,
        markup:this.markup.cords
      })
      // this.setCords({
      //   conture:this.conture.cords,
      //   markup:this.markup.cords
      // })
    }
    if(this.conture.markers.length > 3){
      this.updateCenterMarker()
      this.updateMarkup()
    }
    return this.conture.markers.length
  }

  getMarkupDistance(){
    const R = 6378.137;
    let distance = 0
    for(let counter = 1; counter < this.markup.cords.length; counter++){
      let x1 = this.markup.cords[counter-1]
      let x2 = this.markup.cords[counter]

      let diffLng = x2[0] * Math.PI / 180 - x1[0] * Math.PI / 180
      let diffLat = x2[1] * Math.PI / 180 - x1[1] * Math.PI / 180

      let a = Math.sin(diffLat/2) * Math.sin(diffLat/2) +
      Math.cos(x1[1] * Math.PI / 180) * Math.cos(x2[1] * Math.PI / 180) *
      Math.sin(diffLng/2) * Math.sin(diffLng/2);

      let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      let d1 = Math.round(R * c * 1000);
      distance += d1;
    }
    return distance
  }
  setCountMarkers(count){
    this.count = count
    this.start_point.getElement().querySelector(".mapbox_gl_num").textContent = this.count;
    this.end_point.getElement().querySelector(".mapbox_gl_num").textContent = this.count + this.markup.cords.length-1;
    return this.count + this.markup.cords.length
  }
  updateLineDistance(val){
    // this.params.line_distance.value = val.line_distance
    if(!this.isValid()){
      return false
    }
    this.updateCenterMarker()
    this.updateMarkup()
    return true
  }
  updateAngleDistance(val){
    // this.params.angle.value = val.angle
    if(!this.isValid()){
      return false
    }
    this.updateCenterMarker()
    this.updateMarkup()
    return true
  }
  updateTurnaroundDistance(val){
    // this.params.turnaround_distance.value = val.turnaround_distance
    this.updateCenterMarker()
    this.updateMarkup()
  }
  updateMarkup(){
    if(this.params.reverse.value) this.markup.cords = this.markupPolygon().reverse()
    else this.markup.cords = this.markupPolygon()
    this.markup.source.data.geometry.coordinates = this.markup.cords
    this.map.getSource(this.id_markup).setData(this.markup.source.data)

    this.start_point.setLngLat(this.markup.cords[0])
    this.end_point.setLngLat(this.markup.cords[this.markup.cords.length-1])

    this.start_point.getElement().querySelector(".mapbox_gl_num").textContent = this.count;
    this.end_point.getElement().querySelector(".mapbox_gl_num").textContent = this.count + this.markup.cords.length-1;

    // this.dragCallback()
    if(this.start_point._listeners){
      if(this.start_point._listeners.drag.length != 0) this.start_point._listeners.drag[0]({})
    } 
    if(this.end_point._listeners){
      if(this.end_point._listeners.drag.length != 0) this.end_point._listeners.drag[0]({})
    }
    if(this.params.node != this.params.route.current_node){
      this.params.route.setCurrentNode(this.params.node)
      this.params.route.tbManager.setCurrentSphere(this.params.node.id)
    }
    this.params.route.updateNodeParams(this.params.node,{
      conture:this.conture.cords,
      markup:this.markup.cords
    })
    // this.setCords({
    //   conture:this.conture.cords,
    //   markup:this.markup.cords
    // })
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
  updatePolygonPosition(){
    this.conture.source.data.geometry.coordinates = [this.conture.cords]
    this.map.getSource(this.id).setData(this.conture.source.data)
    this.updateMarkup()
  }
  getInnerDistance(){
    return this.getMarkupDistance()
  }
  getBoardsMarkers(){
    return [this.start_point, this.end_point]
  }
  updateReverse(val){
    // this.params.reverse = val
    this.updateMarkup()
  }
  delete(){
    // this.map.removeLayer(this.id)
    this.map.removeLayer('line_'+this.id)
    this.map.removeSource(this.id)

    // this.map.removeLayer(this.id_markup)
    this.map.removeSource(this.id_markup)

    for(let marker of this.conture.markers) marker.remove()

    this.start_point.remove()
    this.end_point.remove()

    this.center_marker.remove()
  }
  setActive(){
    // this.center_marker.getElement().style.opacity=1
    // this.map.setLayoutProperty(this.id,'visibility','visible')

    for(let marker of this.conture.markers) marker.getElement().style.opacity=1
    // this.marker.getElement().querySelector(".mapbox_gl_active_indicator").classList.add("marker_active_indicator--active")
  }
  unsetActive(){
    // this.center_marker.getElement().style.opacity=0
    // this.map.setLayoutProperty(this.id,'visibility','none')

    for(let marker of this.conture.markers) marker.getElement().style.opacity=0
    // this.marker.getElement().querySelector(".mapbox_gl_active_indicator").classList.remove("marker_active_indicator--active")
  }
  setDragCallback(callback){
    this.dragCallback = callback;
  }
  setCallback(callback){
    this.setCords = callback;
  }
  dragStartCenterMarker(e){
    e.evt.route.tbManager.resetCollisionObjects()
    let center_cords = e.marker.getLngLat()
    e.marker.diff = []
    for(let cords of e.mapElement.conture.cords){
      e.marker.diff.push(
        [cords[0]-center_cords.lng, cords[1]-center_cords.lat]
      )
    }
  }
  dragCenterMarker(e){
    let center_cords = e.marker.getLngLat()
    
    for(let c = 0; c < e.mapElement.conture.markers.length; c++){
      let changed_cords = [e.marker.diff[c][0]+center_cords.lng, e.marker.diff[c][1]+center_cords.lat]
      e.mapElement.conture.cords[c] = changed_cords
      if(c == 0){
        e.mapElement.conture.cords[e.mapElement.conture.cords.length-1] = changed_cords
      }
      e.mapElement.conture.markers[c].setLngLat(changed_cords)
    }
    e.mapElement.updatePolygonPosition()
    e.mapElement.updateMarkup()

    e.evt.route.tbManager.deleteObject(e.mapElement.params.id)
    for (let coord of e.mapElement.conture.cords){
      e.evt.route.tbManager.addSphere(
        [coord[0], coord[1],  Number(e.mapElement.params.alt.value)],
        e.mapElement.params.id
      )
    }
    e.evt.route.tbManager.unitSpheres(e.evt.route)
  }
  dragEndStartCenterMarker(e){
    e.marker.diff = []
    e.evt.route.tbManager.checkCollision(e.evt.route)
  }
  drag(e){
    let cords = e.marker.getLngLat()
    let before_cords = e.mapElement.conture.cords[e.marker.conture_index]
    e.mapElement.conture.cords[e.marker.conture_index] = [cords.lng, cords.lat]
    if(!this.isValid()){
      e.mapElement.conture.cords[e.marker.conture_index] = before_cords
      e.marker.setLngLat(before_cords)
      return
    }

    e.mapElement.conture.cords[e.marker.conture_index] = [cords.lng, cords.lat]
    if(e.marker.conture_index == 0){
      e.mapElement.conture.cords[e.mapElement.conture.cords.length-1] = [cords.lng, cords.lat]
    }
    e.mapElement.conture.source.data.geometry.coordinates = [e.mapElement.conture.cords]
    e.mapElement.map.getSource(e.mapElement.id).setData(e.mapElement.conture.source.data)
    this.updateCenterMarker()
    this.updateMarkup()

    e.evt.route.tbManager.deleteObject(e.mapElement.params.id)
    for (let coord of e.mapElement.conture.cords){
      e.evt.route.tbManager.addSphere(
        [coord[0], coord[1],  Number(e.mapElement.params.alt.value)],
        e.mapElement.params.id
      )
    }
    e.evt.route.tbManager.unitSpheres(e.evt.route)
  }
  dragStartCont(e){
    e.evt.route.tbManager.resetCollisionObjects()
  }
  dragEndCont(e){
    e.evt.route.tbManager.checkCollision(e.evt.route)
  }
  dragEnd(e){
    e.mapElement.setCords(e.mapElement.marker.getLngLat())
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
  changePointIcon(marker, Icon, width, height){
    let icon = document.createElement('img');
    icon.src = Icon;
    icon.width = width
    icon.height = height

    marker.getElement().querySelector("svg").remove()
    marker.getElement().append(icon)

    let indicator = document.createElement('span');
    indicator.className = "mapbox_gl_active_indicator"
    marker.getElement().append(indicator)

    let numContainer = document.createElement('span');
    numContainer.className = "mapbox_gl_num"
    marker.getElement().append(numContainer)
  }
  getBorderPoints(){
    return [this.marker.getLngLat()]
  }
  rotate(cords, factor){
    let centerCords = this.center_marker.getLngLat()
    centerCords = [centerCords.lng, centerCords.lat]
    let rotated_cords = rotateFigureCenter(cords, centerCords, factor*this.params.angle.value)
    return rotated_cords
  }
  isValid(){
    let edges = []
    let cords_markup = this.rotate(this.conture.cords, 1)
    for(let c = 0; c < this.conture.cords.length-1; c++){
      edges.push([cords_markup[c], cords_markup[c+1]])
    }
    let pr = getProjective(cords_markup)
    let step = getGeoCordsFromMeters(this.params.line_distance.value, pr.y_pr.min)
    let steps = Math.trunc(pr.x_pr.pr/step)
    if(1 > steps) return false
    else return true
  }
  markupPolygon(){
    let edges = []
    let cords_markup = this.rotate(this.conture.cords, 1)
    for(let c = 0; c < this.conture.cords.length-1; c++){
      edges.push([cords_markup[c], cords_markup[c+1]])
    }
    let pr = getProjective(cords_markup)
    let step = getGeoCordsFromMeters(this.params.line_distance.value, pr.y_pr.min)
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

        low[1] = addTurnaroundDistance(low[1], this.params.turnaround_distance.value, false)
        high[1] = addTurnaroundDistance(high[1], this.params.turnaround_distance.value, true)
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
}
export default PolygonME;


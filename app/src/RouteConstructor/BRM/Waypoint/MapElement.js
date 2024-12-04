import MapIcon from "./icon_map_waypoint.png"
import mapboxgl from 'mapbox-gl';
import { connect } from 'react-redux';

class WaypointME{
  constructor(evt, map, params){
    let cords = evt.lngLat;
    this.data = evt;
    this.marker = new mapboxgl.Marker(
        {
            draggable: true
        }
    );
    this.marker.setLngLat(cords).addTo(map);
    this.params = params


    this.setCords = null;
    this.count = 0;

    this.dragEndContainer = (e) => {e.mapElement = this; this.dragEnd(e)}
    this.marker.on("dragend", this.dragEndContainer)
    this.changeSphereCoords1 = (e) => {e.mapElement = this; this.changeSphereCoords(e)}
    this.marker.on("drag", this.changeSphereCoords1)
    this.dragContainer = (e) => {e.mapElement = this; this.drag(e)}
    this.marker.on("dragstart", this.dragContainer)
    this.changeMarkerIcon()

    this.params.route.updateNodeParams(this.params.node, cords)
  }
  setCountMarkers(count){
    this.count = count
    this.marker.getElement().querySelector(".mapbox_gl_num").textContent = count;
    return count+1
  }
  getInnerDistance(){
    return 0
  }
  getBoardsMarkers(){
    return [this.marker]
  }
  delete(){
    this.marker.remove()
  }
  setActive(){
    this.marker.getElement().querySelector(".mapbox_gl_active_indicator").classList.add("marker_active_indicator--active")
  }
  unsetActive(){
    this.marker.getElement().querySelector(".mapbox_gl_active_indicator").classList.remove("marker_active_indicator--active")
  }
  setDragCallback(callback){
    this.dragCallback = callback;
    this.marker.on("drag", this.dragContainer)
  }
  setCallback(callback){
    this.setCords = callback;
    this.marker.on("dragend", this.dragEndContainer)
  }
  drag(e){
    e.mapElement.params.route.setCurrentNode(e.mapElement.params.node)
    e.mapElement.params.route.tbManager.setCurrentSphere(e.mapElement.params.node.id)
    this.data.route.tbManager.resetCollisionObjects()
  }
  dragEnd(e){
    this.data.route.tbManager.checkCollision(this.data.route)
  }
  changeSphereCoords(e){
    e.mapElement.params.route.updateNodeParams(e.mapElement.params.node, e.mapElement.marker.getLngLat())
    this.data.route.tbManager.changeCoords([e.target._lngLat.lng, e.target._lngLat.lat], this.params.id)
    // this.data.route.tbManager.unitSpheres(this.data.route)
    this.data.route.tbManager.updateLineGeometry(this.data.route)
  }
  changeMarkerIcon() {
    let icon = document.createElement('img');
    icon.src = MapIcon;
    icon.width = 35
    icon.height = 35

    this.marker.getElement().querySelector("svg").remove()
    this.marker.getElement().append(icon)

    let indicator = document.createElement('span');
    indicator.className = "mapbox_gl_active_indicator"
    this.marker.getElement().append(indicator)

    let numContainer = document.createElement('span');
    numContainer.className = "mapbox_gl_num"
    this.marker.getElement().append(numContainer)
    this.marker.getElement().classList.add("waypoint")
  }
  getBorderPoints(){
    return [this.marker.getLngLat()]
  }
}
export default WaypointME;


import takeoffMapIcon from "./icon_map_takeoff.png"
import mapboxgl from 'mapbox-gl';

class TakeoffME{
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
  changeSphereCoords(e){
    e.mapElement.params.route.updateNodeParams(e.mapElement.params.node, e.mapElement.marker.getLngLat())
    this.data.route.tbManager.changeCoords([e.target._lngLat.lng, e.target._lngLat.lat], this.params.id)
    this.data.route.tbManager.updateLineGeometry(this.data.route)
  }
  dragEnd(e){
    this.data.route.tbManager.checkCollision(this.data.route)
  }
  changeMarkerIcon() {
    let icon = document.createElement('img');
    icon.src = takeoffMapIcon;
    icon.width = 35
    icon.height = 35
    this.marker.getElement().querySelector("svg").remove()
    this.marker.getElement().append(icon)
    let indicator = document.createElement('span');
    indicator.className = "mapbox_gl_active_indicator"
    this.marker.getElement().append(indicator)
    this.marker.getElement().classList.add("takeoff")
  }
  getBorderPoints(){
    return [this.marker.getLngLat()]
  }
}
async function getElevation(LngLat) {
  // Construct the API request
  const query = await fetch(
  `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${LngLat.lng},${LngLat.lat}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
  { method: 'GET' }
  );
  if (query.status !== 200) return;
  const data = await query.json();
  // Get all the returned features
  const allFeatures = data.features;
  // For each returned feature, add elevation data to the elevations array
  const elevations = allFeatures.map((feature) => feature.properties.ele);
  // In the elevations array, find the largest value
  const highestElevation = Math.max(...elevations);
  // Display the largest elevation value
  LngLat.alt = highestElevation
  return highestElevation
  // eleDisplay.textContent = `${highestElevation} meters`;
  }
export default TakeoffME;


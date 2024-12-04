import takeoffMapIcon from "./icon_map_RTL.png"

class RTLME{
  constructor(marker){
    this.marker = marker;
    this.setCords = null;
    this.count = 0;
    this.dragEndContainer = (e) => {e.mapElement = this; this.dragEnd(e)}
    this.dragContainer = (e) => {e.mapElement = this; this.drag(e)}
    this.changeMarkerIcon()
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
    e.mapElement.dragCallback()
  }
  dragEnd(e){
    e.mapElement.setCords(e.mapElement.marker.getLngLat())
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
    this.marker.getElement().classList.add("land")
  }
  getBorderPoints(){
    return [this.marker.getLngLat()]
  }
}
export default RTLME;


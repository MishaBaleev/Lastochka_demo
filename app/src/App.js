import React from 'react';
import './App.scss';
import './buttons.css';
import './bootstrap.min.css';
import Header from './layouts/Header/Header';
import RouteConstructor from './RouteConstructor/RouteConstructor';
import LogReader from './LogReader/LogReader.js';
import Loading from './Loading/Loading';
import { connect } from 'react-redux';
import { set_monitoring_info, get_route_elements, get_route_parameters_default, get_settings, get_group_of_settings, set_layers, update_telemetry, clear_telemetry, set_uavs, update_uav, set_current_command, set_mission_completing} from './AppSlice';
import ModalMessage from './ModalMessage/ModalMessage';
import { manager3D } from './manager3D';
import proj4 from 'proj4';
import MapManager from './MapManager';
import mapboxgl from 'mapbox-gl';
import DefaultCMP from './DefaultCMP/DefaultCMP.js';
import Spraying from "./Spraying/Spraying.js";

mapboxgl.accessToken = 'pk.eyJ1IjoiY2FyZGFub2wiLCJhIjoiY2xraW02OWtyMGR1MDNkdDh6em93NDBwcyJ9.n3DKdQ5M_ulcZbaoik-CBg';
let pages = {
  0:{
    cmp:RouteConstructor,
    name:"Создание полетных заданий"
  },
  1:{
    cmp:DefaultCMP,
    name:"Мониторинг"
  },
  2:{
    cmp:DefaultCMP,
    name:"Управление полетными заданиями"
  },
  3:{
    cmp:LogReader,
    name:"Просмотр логов"
  },
  4:{
    cmp:DefaultCMP,
    name:"Разметка изображений"
  },
  5:{
    cmp:Spraying,
    name:"АгроТех"
  },
  6:{
    cmp:DefaultCMP,
    name:"Настройки"
  }
}

let pages_with_map = [0,3,5]

function createImageFromTexture(gl, texture, width, height) {
  // Create a framebuffer backed by the texture
  let framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  // Read the contents of the framebuffer
  let data = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);

  gl.deleteFramebuffer(framebuffer);

  // Create a 2D canvas to store the result 
  let canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  let context = canvas.getContext('2d');

  // Copy the pixels to a 2D canvas
  let imageData = context.createImageData(width, height);
  imageData.data.set(data);
  context.putImageData(imageData, 0, 0);

  let img = new Image();
  img.src = canvas.toDataURL();
  return img;
}
function DataURIToBlob(dataURI) {
    const splitDataURI = dataURI.split(',')
    const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1])
    const mimeString = splitDataURI[0].split(':')[1].split(';')[0]

    const ia = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++)
        ia[i] = byteString.charCodeAt(i)

    return new Blob([ia], { type: mimeString })
  }

function getQuadkey(x, y, z) {
  var quadKey = [];
  for (var i = z; i > 0; i--) {
      var digit = '0';
      var mask = 1 << (i - 1);
      if ((x & mask) != 0) {
          digit++;
      }
      if ((y & mask) != 0) {
          digit++;
          digit++;
      }
      quadKey.push(digit);
  }
  return quadKey.join('');
}


function fromLngLatToMercator(cords, flag){
  if(flag == true){
      let source = new proj4.Proj('EPSG:4326')
      let dist = new proj4.Proj('EPSG:3785')
      let point = new proj4.Point(cords);
      return proj4.transform(source, dist, point)
  }
  else{
      let dist = new proj4.Proj('EPSG:4326')
      let source = new proj4.Proj('EPSG:3785')
      let point = new proj4.Point(cords);
      return proj4.transform(source, dist, point)
  }
}
//console.log(fromLngLatToMercator)
function XYZtoLng(x,z){
  return x/Math.pow(2,z)*360-180
}
function XYZtoLat(y,z){
  var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
  return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))
}
function getCorners(x, y, z){
  let NW = [XYZtoLng(x,z), XYZtoLat(y,z)]
  let NE = [XYZtoLng(x+1,z), XYZtoLat(y,z)]
  
  let SW = [XYZtoLng(x,z), XYZtoLat(y+1,z)]
  let SE = [XYZtoLng(x+1,z), XYZtoLat(y+1,z)]

  return {
      NW:NW,
      NE:NE,
      SW:SW,
      SE:SE,
  }
}
function getTileInfo(x, y, z, img_size) {
  let corners = getCorners(x, y, z)
  return {
    corners:{
      NW:fromLngLatToMercator(corners.NW, true),
      NE:fromLngLatToMercator(corners.NE, true),
      SW:fromLngLatToMercator(corners.SW, true),
      SE:fromLngLatToMercator(corners.SE, true),
    },
    size:img_size
  }
}

let is_local = false
is_local = true

class App extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      isInterfaceReady:false
    }
    this.mapContainer = React.createRef();
    this.manager3D = null
    this.mapManager = null
    this.ismarkupEnded = true
    // this.style = "mapbox://styles/dvcorporation/ckzzthp6t013n14p8spienuu5"
    // this.style = "mapbox://styles/mapbox/light-v11"
    this.tiles_for_markup = []
    // 
    this.style = {
      "version": 8,
      "name": "Meteorites",
      "metadata": {
        "mapbox:origin": "basic-template-v1",
        "mapbox:autocomposite": true,
        "mapbox:type": "template",
        "mapbox:sdk-support": {
          "js": "0.45.0",
          "android": "6.0.0",
          "ios": "4.0.0"
        }
      },
      "center": [
        74.24426803763072,
        -2.2507114487818853
      ],
      "zoom": 0.6851443156248076,
      "bearing": 0,
      "pitch": 0,
      "sources": {
        "global": {
          "type": "raster",
          "tiles":[],
          "tileSize": 256
        },
        // "local":{
        //   "type": "raster",
        //   "tiles":[],
        //   "tileSize": 256
        // }
      },
      "sprite": "mapbox://sprites/examples/cjikt35x83t1z2rnxpdmjs7y7",
      "glyphs": "mapbox://fonts/{username}/{fontstack}/{range}.pbf",
      "layers": [ 
    ],
      "created": "2015-10-30T22:18:31.111Z",
      "id": "cjikt35x83t1z2rnxpdmjs7y7",
      "modified": "2015-10-30T22:22:06.077Z",
      "owner": "examples",
      "visibility": "public",
      "draft": false
    }
    // 
    this.center = [38.6087, 47.2189]
    this.zoom = 14
    this.sockets = {
      'Monitoring':{
        telemetry:[],
        command:[]
      }
    }
    this.setReady = this.setReady.bind(this);
  }
  setReady(){
    this.setState(state => ({
        isInterfaceReady: this.state.isInterfaceReady ? false : true,
    }))
  }
  componentDidMount(){
    this.mapManager = new MapManager()
    let map = this.mapManager.createMap(this.props.app.layers, this.props.app.settings, this.mapContainer.current)
    map.on('style.load', () => {
      this.manager3D = new manager3D(
        map
      )
      this.setState(state => ({
          isInterfaceReady: true,
          map: map,
      }))
    })
  }
  render(){
    //console.log(pages, this.props.app.active_page_id)
    let CurrentCmp = pages[this.props.app.active_page_id].cmp
    let rendered_component = <Loading message={"Подготавливаем приложение для вас..."}/>;
    let isLoaded = this.state.isInterfaceReady
    if(pages_with_map.includes(this.props.app.active_page_id) === true){
      if(isLoaded) rendered_component = <CurrentCmp map={this.state.map} manager3D={this.manager3D}/>
    }
    else{
      if(isLoaded) rendered_component = <CurrentCmp sockets={this.sockets} mapManager={this.mapManager}/>
    }
    let user_agent = navigator.userAgent.toLocaleLowerCase()
    let is_pc = (user_agent.search("iphone") > -1)?false:((user_agent.search("android") > -1)?false:true)
    return (
      <div className="App">
        {is_pc===true?
          <div>
            <Header map={this.state.map}/>
            <main className="container--main d-flex">
              <ModalMessage/>
              <div ref={this.mapContainer} className={pages_with_map.includes(this.props.app.active_page_id) === true ? "container--map" : "container--map hidden"}/>
              {rendered_component}
              <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
            </main>
          </div>:
          <div className="bad_device">
            <div ref={this.mapContainer} className="container--map hidden"/>
            <DefaultCMP/>
          </div>
        }
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'set_monitoring_info': (data) => dispatch(set_monitoring_info(data)),
    'get_settings': (data) => dispatch(get_settings(data)),
    'get_group_of_settings': (data) => dispatch(get_group_of_settings(data)),
    'get_route_parameters_default': (data) => dispatch(get_route_parameters_default(data)),
    'get_route_elements': (data) => dispatch(get_route_elements(data)),
    'set_layers': (data) => dispatch(set_layers(data)),
    'update_telemetry': (data) => dispatch(update_telemetry(data)),
    'clear_telemetry': (data) => dispatch(clear_telemetry(data)),
    'set_uavs': (data) => dispatch(set_uavs(data)),
    'update_uav': (data) => dispatch(update_uav(data)),
    'set_current_command': (data) => dispatch(set_current_command(data)),
    'set_mission_completing': (data) => dispatch(set_mission_completing(data))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(App)

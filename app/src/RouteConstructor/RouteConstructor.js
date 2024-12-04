import React from 'react';
import './RouteConstructor.css';
import { connect } from 'react-redux';
import { set_info_mission, update_modal_message, change_RC_mission_id, change_RC_mission_name, change_active_RC_button, toggle_page_block } from '../AppSlice';

import InstrumentsPanel from './InstrumentsPanel/InstrumentsPanel';
import RoutePanel from './RoutePanel/RoutePanel';
import AltitudeGraph from './AltitudeGraph/AltitudeGraph';

import { FlyRoute } from './FlyRoute';
import MissionStart_info from './BRM/MissionStart/Parameters';
import Takeoff_info from './BRM/Takeoff/Parameters';
import Waypoint_info from './BRM/Waypoint/Parameters';
import Polygon_info from './BRM/Polygon/Parameters';
import Land_info from './BRM/Land/Parameters';
import RTL_info from './BRM/RTL/Parameters';
import MissionStartRE from './BRM/MissionStart/RouteElement';
import TakeoffME from './BRM/Takeoff/MapElement';
import TakeoffRE from './BRM/Takeoff/RouteElement';
import WaypointME from './BRM/Waypoint/MapElement';
import WaypointRE from './BRM/Waypoint/RouteElement';
import RTLRE from './BRM/RTL/RouteElement';
import LandME from './BRM/Land/MapElement';
import LandRE from './BRM/Land/RouteElement';
import PolygonME from './BRM/Polygon/MapElement';
import PolygonRE from './BRM/Polygon/RouteElement';
import mapboxgl from 'mapbox-gl';
import {ThreeBoxManager} from '../ThreeboxManager'
import {RCManager3D, RCManager3d} from "./RCManager3d"
import { promises } from 'form-data';

async function getElevation(cords) {
  // Construct the API request.
  const query = await fetch(
    `https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${cords.cords.lng},${cords.cords.lat}.json?layers=contour&limit=50&access_token=${mapboxgl.accessToken}`,
    { method: 'GET' }
  );
  if (query.status !== 200) return;
  const data = await query.json();
  // Get all the returned features.
  const allFeatures = data.features;
  // For each returned feature, add elevation data to the elevations array.
  const elevations = allFeatures.map((feature) => feature.properties.ele);
  // In the elevations array, find the largest value.
  const highestElevation = Math.max(...elevations);
return {x:cords.x,y:highestElevation}
}

const R = 6378.137;
// import Takeoff from './BRM/Takeoff/RouteElement';

// import { FlyRoute } from "./FlyRoute/FlyRoute.js"
// import StatusPanel from "./StatusPanel/StatusPanel"
// import RoutePanel from './RoutePanel/RoutePanel';
// import InstrumentsPanel from './InstrumentsPanel/InstrumentsPanel';
// import MissionStart from './BRM/MissionStart/MissionStart';

// let route_elements_components = {
//   'Takeoff':Takeoff
// }

class RouteConstructor extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      routeSequence:[],
      missionParams:[],
      isDataLoaded:false,
      AMS_alt_route: [],
      all_altitude:[]
    }
    this.route = null;
    this.setRouteData = this.setRouteData.bind(this);
    this.showMission = this.showMission.bind(this);
    this.setRouteSequence = this.setRouteSequence.bind(this);
    this.updateModal = this.updateModal.bind(this);
    this.keywordPressed = this.keywordPressed.bind(this);
    this.createComponent = this.createComponent.bind(this)
    this.showMissionFin = this.showMissionFin.bind(this)
    this.RCManager3D = null;
  }
  updateModal(data){
    this.props.update_modal_message(data)
  }
  setRouteData(data){
    this.props.set_info_mission(data)
  }
  setRouteSequence(routeSequence){
    if (routeSequence.route_cords.length == 1){
      this.props.toggle_page_block({
        'is_page_blocked': false,
        'name': '', 
        'description': ''
      })
    } else if (routeSequence.route_cords.length == 2){
      this.props.toggle_page_block({
          'is_page_blocked': true,
          'name': 'Создано полетное задание', 
          'description': 'Полетное задание не сохранено'
      })
    }
    this.setState(state => ({
      routeSequence: routeSequence.route_sequence
    }))
    this.props.set_info_mission(routeSequence.route_info)
    
    this.setState(state => ({
      all_altitude: routeSequence.route_info.all_altitude,
      AMS_alt_route: routeSequence.route_info.all_altitude_AMS
    }))
    //console.log(routeSequence.route_info)
    // if (this.props.app.layers[6].active){
    //   if(routeSequence.route_info.all_altitude.length != 0){
        
    //     this.setState(state => ({
    //       all_altitude: routeSequence.route_info.all_altitude,
    //       AMS_alt_route: routeSequence.route_info.all_altitude_AMS
    //     }))
    //   }
    // }
    // else{
      
    // }
    // if(routeSequence.route_cords.length != 0){
    //   if (this.props.app.layers[6].active){
    //     if(routeSequence.route_info.all_altitude.length != 0){
    //       this.setState(state => ({
    //         all_altitude: routeSequence.route_info.all_altitude,
    //         AMS_alt_route: routeSequence.route_info.all_altitude_AMS
    //       }))
    //     }
    //     // let defaultCoordArr = this.RCManager3D.getCoordArr(this.route)
    //     // let coordArr = []
    //     // for (let index in defaultCoordArr){
    //     //   if (index < defaultCoordArr.length - 1){
    //     //     coordArr = coordArr.concat(segmentateLine(
    //     //       [defaultCoordArr[index][0], defaultCoordArr[index][1]], 
    //     //       [defaultCoordArr[Number(index)+1][0], defaultCoordArr[Number(index)+1][1]],
    //     //       10         
    //     //     ).cords)
    //     //   }
    //     // }
    //     // let dataArr = [{
    //     //   x: 0,
    //     //   y:  this.props.manager3D.getAMS([
    //     //     defaultCoordArr[0][0],
    //     //     defaultCoordArr[0][1]
    //     //   ])
    //     // }]
    //     // let distance = 0
    //     // for (let index in coordArr){
    //     //   if (index < coordArr.length - 1){
    //     //     distance = distance + calcDistance(coordArr[index], coordArr[Number(index)+1])
    //     //     let point = {
    //     //       x: distance,
    //     //       y: this.props.manager3D.getAMS(coordArr[index])
    //     //     }
    //     //     dataArr.push(point)
    //     //   }
    //     // }
    //     // if (coordArr.length > 1){
    //     //    dataArr.push({
    //     //     x: distance + calcDistance(coordArr.at(-2), coordArr.at(-1)),
    //     //     y: this.props.manager3D.getAMS(coordArr.at(-1))
    //     //   })
    //     // }
        
    //     // this.setState(state => ({
    //     //   AMS_alt_route: dataArr
    //     // }))
    //   }else{
    //     Promise.all(routeSequence.route_cords.map(getElevation)).then(results => {
    //         this.setState(state => ({
    //           AMS_alt_route: results
    //         }))
    //       });
    //   }
    // }
  }
  
  showMissionFin(routeElements){
    for (let routeElement of routeElements){
      let elementData = JSON.parse(routeElement.data);
      let evt;
      let elementName = '';
      let map_element;
      let route_element;
      let extraParams = {};
      let isMapElement;
      let isRTL = false;
      if (routeElement.element_id == 1){
        let missionStart = this.route.head;
        missionStart.params.alt.value = elementData.alt;
        missionStart.params.speed.value = elementData.speed;
        continue;
      } else if (routeElement.element_id == 2){ //TakeOff
        elementName = 'Takeoff';
        map_element = TakeoffME;
        route_element = TakeoffRE;
        extraParams = {
          alt: {value: elementData.alt},
          yaw: {value: elementData.yaw}
        };
        isMapElement = true;
        evt = {
          lngLat: {lng: elementData.lng, lat: elementData.lat},
          route: this.route
        };
      } else if (routeElement.element_id == 3){ //WayPoint
        elementName = 'Waypoint';
        map_element = WaypointME;
        route_element = WaypointRE;
        extraParams = {
          alt: {value: elementData.alt},
          yaw: {value: elementData.yaw},
          hold: {value: elementData.hold},
          speed: {value: elementData.speed}
        };
        isMapElement = true;
        evt = {
          lngLat: {lng: elementData.lng, lat: elementData.lat},
          route: this.route
        };
      } else if (routeElement.element_id == 4){ //Polygon
        let node = this.route._append(
          'Polygon',
          PolygonME,
          PolygonRE,
          {
            alt: {value: elementData.alt},
            line_distance: {value: elementData.line_distance},
            turnaround_distance: {value: elementData.turnaround_distance},
            angle: {value: elementData.angle},
            yaw: {value: elementData.yaw},
            hold: {value: elementData.hold},
            speed: {value: elementData.speed},
            conture: {value: elementData.conture},
            markup: {value: elementData.markup},
            reverse: {value: elementData.reverse}
          },
          false,
          {
            lngLat: {lng: elementData.lng, lat: elementData.lat},
            route: this.route
          }
        )

        let conturePoints = elementData.conture;
        for (let conturePoint of conturePoints){
          let cur_markers = node.map_element.addConturePoint(
            {
              lngLat: {lng: conturePoint[0], lat: conturePoint[1]},
              route: this.route
          })
          if (cur_markers == 3){
            this.route.changeIsMapElement(node)
          }
        }
        continue;
      } else if (routeElement.element_id == 5){ //RTL
        elementName = 'RTL';
        map_element = null;
        route_element = RTLRE;
        extraParams = {
          alt: {value: elementData.alt},
          speed: {value: elementData.speed}
        };
        isMapElement = false;
        isRTL = true;
      } else if (routeElement.element_id == 6){ //Land
        elementName = 'Land';
        map_element = LandME;
        route_element = LandRE;
        extraParams = {
          alt: {value: elementData.alt},
          yaw: {value: elementData.yaw}
        };
        isMapElement = true;
        evt = {
          lngLat: {lng: elementData.lng, lat: elementData.lat},
          route: this.route
        };
      }

      this.route._append(
        elementName,
        map_element,
        route_element,
        extraParams,
        isMapElement,
        evt,
        isRTL,
      )
    } 
  }
  showMission(routeElements=null){
    if(routeElements == null){
      if (this.props.app.RC_mission_id){
        fetch('api/mission/'+this.props.app.RC_mission_id)
        .then(res => res.json())
        .then(
          (result) => {
            let routeElements = result.route_elements;
            let beginningOfRoute = JSON.parse(routeElements[1].data);
  
            this.props.change_RC_mission_name(result.name);
            
            this.props.map.once('moveend',()=>{
              this.showMissionFin(routeElements)
                // self.monitoringManager3d.addModel(startCoords);
            })
            this.props.map.flyTo({
              center: [beginningOfRoute.lng, beginningOfRoute.lat],
              zoom: 16,
              bearing: 0,
              pitch: 0
            });
  
            // this.props.map.on("flystart", () => { 
            //   flying = true;
            // });
  
            // this.props.map.on("flyend", () => {
            //   flying = false;
            //   this.showMissionFin(routeElements)
            // });
  
            // this.props.map.on("moveend", () => {
            //   if (flying) {
            //     this.props.map.fire("flyend");
            //   }
            // });
  
            // this.props.map.flyTo({
            //   center: [beginningOfRoute.lng, beginningOfRoute.lat],
            //   essential: true
            // })
            // this.props.map.fire("flystart")
            
            // setTimeout(() => {
            //   this.showMissionFin(routeElements)
            // }, 1000)
          }
        )
      }
    }
    else{
      let beginningOfRoute = JSON.parse(routeElements[1].data);
      this.route.deleteAll()
      
      this.route = new FlyRoute( 
        this.props.map,
        this.setRouteData,
        this.setRouteSequence,
        this.updateModal,
        this.RCManager3D
      )
      this.route.createDefaultDicts(
        this.props.app.route_elements,
        this.props.app.route_parameters_default,
        [MissionStart_info, Takeoff_info, Waypoint_info,
          Polygon_info, Land_info, RTL_info]
      )
      this.route._append(
        "MissionStart",//module_name, 
        null,//map_element_init, 
        MissionStartRE,//route_element_init, 
        {},//extra_params, 
        false,//isMapElement, 
        {}//evt
      )
      this.props.map.once('moveend',()=>{
        this.showMissionFin(routeElements)
          // self.monitoringManager3d.addModel(startCoords);
      })
      this.props.map.flyTo({
        center: [beginningOfRoute.lng, beginningOfRoute.lat],
        zoom: 16,
        bearing: 0,
        pitch: 0
      });

      // this.props.map.on("flystart", () => { 
      //   flying = true;
      // });

      // this.props.map.on("flyend", () => {
      //   flying = false;
      //   this.showMissionFin(routeElements)
      // });

      // this.props.map.on("moveend", () => {
      //   if (flying) {
      //     this.props.map.fire("flyend");
      //   }
      // });

      // this.props.map.flyTo({
      //   center: [beginningOfRoute.lng, beginningOfRoute.lat],
      //   essential: true
      // })
      // this.props.map.fire("flystart")
    }
  } 

  tile2lng(x, z){
    return (x/Math.pow(2,z)*360-180);
  }
  tile2lat(y, z){
    let n = Math.PI-2*Math.PI*y/Math.pow(2,z);
    return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
  }

  showTiles(){
    let tiles = this.props.map.style._otherSourceCaches.composite._tiles;
    let tilesCords = [];
    let geoCords = [];
    for (let key in tiles){
      tilesCords.push({
        x: tiles[key].tileID.canonical.x,
        y: tiles[key].tileID.canonical.y, 
        z: tiles[key].tileID.canonical.z
      })
      geoCords.push({
        lng: this.tile2lng(tiles[key].tileID.canonical.x, tiles[key].tileID.canonical.z),
        lat: this.tile2lat(tiles[key].tileID.canonical.y, tiles[key].tileID.canonical.z)
      })
    }
    ////console.log(tilesCords);
    ////console.log(geoCords)
  } 

  keywordPressed(e){
    if ((e.key == '.' || e.key == 'ю') && this.route.head.next){
      if (this.route.current_node.next){
        this.route.setCurrentNode(this.route.current_node.next)
        this.RCManager3D.setCurrentSphere(this.route.current_node.id)
      }else{
        this.route.setCurrentNode(this.route.head)
        this.RCManager3D.setCurrentSphere(this.route.head.id)
      }
    } else if ((e.key == ',' || e.key == 'б') && this.route.head.next){
      if (this.route.current_node.prev){
        this.route.setCurrentNode(this.route.current_node.prev)
        this.RCManager3D.setCurrentSphere(this.route.current_node.id)
      } else {
        this.route.setCurrentNode(this.route.tail)
        this.RCManager3D.setCurrentSphere(this.route.tail.id)
      }
    }
  }

  createComponent(){
    this.route = new FlyRoute( 
      this.props.map,
      this.setRouteData,
      this.setRouteSequence,
      this.updateModal,
      this.RCManager3D
    )
    this.route.createDefaultDicts(
      this.props.app.route_elements,
      this.props.app.route_parameters_default,
      [MissionStart_info, Takeoff_info, Waypoint_info,
        Polygon_info, Land_info, RTL_info]
    )
    this.route._append(
      "MissionStart",//module_name, 
      null,//map_element_init, 
      MissionStartRE,//route_element_init, 
      {},//extra_params, 
      false,//isMapElement, 
      {}//evt
    )
    this.RCManager3D.route = this.route
    this.showMission()

    this.setState(state => ({
      isDataLoaded: true
    }))

    document.addEventListener('keydown', this.keywordPressed);
  }
  componentDidMount(){
    this.props.map.resize()
    this.RCManager3D = new RCManager3D(this.props.manager3D)
    this.props.manager3D.addManager(this.RCManager3D, "RC")
    this.createComponent()
    this.props.map.flyTo({center: [38.78997802734375, 47.18597932702905], zoom: 17})
  }

  componentWillUnmount(){
    let currentNode = this.route.tail;
    while (currentNode){
      if (currentNode != this.route.head){
        this.route.deleteNode(currentNode)
      }
      currentNode = currentNode.prev
    }
    this.props.change_RC_mission_id(null);
    this.props.change_RC_mission_name("");
    this.props.change_active_RC_button(null);
    document.removeEventListener('keydown', this.keywordPressed)
    this.RCManager3D.clearTb()
  }
  
  render(){
    return (
      <div className="">
        {this.state.isDataLoaded === true ? <InstrumentsPanel route={this.route} tbManager={this.RCManager3D}/> : ""}
        <AltitudeGraph altAMSArr={this.state.AMS_alt_route} all_altitude={this.state.all_altitude}/>
        <RoutePanel sequence={this.state.routeSequence} map ={this.props.map} route={this.route} tbManager={this.RCManager3D} showMission={this.showMission}/>
        {/* <div ref={this.mapContainer} className="map-container" /> */}
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'set_info_mission': (data) => dispatch(set_info_mission(data)),
    'update_modal_message': (data) => dispatch(update_modal_message(data)),
    'change_RC_mission_id': (data) => dispatch(change_RC_mission_id(data)),
    'change_RC_mission_name': (data) => dispatch(change_RC_mission_name(data)),
    'change_active_RC_button': (data) => dispatch(change_active_RC_button(data)),
    'toggle_page_block': (data) => dispatch(toggle_page_block(data))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteConstructor)



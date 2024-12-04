import React from 'react';
import './WorkSpace.css';
//import {Threebox} from '../../threebox/dist/threebox'
import { Threebox } from 'threebox-plugin';
import { THREE } from 'threebox-plugin';
import { flightPlan } from './flightPlan';
import mapIcon from './imgs/icon_map_waypoint.png'

class WorkSpace extends React.Component {
  constructor(props){
    super(props);
    this.drone = null;
    this.tubeGeometry = [
      [38.891704, 47.308346, 100],
      [38.891704, 47.308346, 10]
      // [38.8900539, 47.3064689, 50], 
      // [38.936694, 47.208735, 50]
    ]
    this.way = flightPlan;
    this.keys = {
      a: false,
      s: false,
      d: false,
      w: false,
      x: false, //higher
      c: false, //lower
      r: false, //rotate x
      t: false, //rotate x
      q: false, //rotate y
      e: false, //rotate y
      i: false //reloadRotation
    };
    this.droneTailArr = [];
    this.droneTail = null;
    this.velocity = 0;
    this.speed = 0;
    this.ds = 0.01;
    this.inertia = 3;
    this.accelerarion = 5;

    this.scene = new THREE.Scene();

    this.threeboxInit = this.threeboxInit.bind(this);
    this.init = this.init.bind(this);
    this.animate = this.animate.bind(this);
    this.reloadRotation = this.reloadRotation.bind(this);
    this.setDroneToState = this.setDroneToState.bind(this);
    this.goToPoint = this.goToPoint.bind(this);
    this.droneWay = this.droneWay.bind(this);
    this.showTube = this.showTube.bind(this);
    this.showRoute = this.showRoute.bind(this);
    this.showDroneTail = this.showDroneTail.bind(this);
  }

  showDroneTail(){
    this.droneTailArr.push(this.drone.coordinates);
    if (this.droneTail){
      tb.remove(this.droneTail);
    }
    this.droneTail = tb.line({
      geometry: this.droneTailArr,
      width: 5,
      color: '#d10303'
    });
    tb.add(this.droneTail, 'custom-layer');
  }

  toRad(deg){
    return deg * Math.PI/180;
  }

  reloadRotation(){
    this.drone.set({rotation: {x: 0, y: 0, z:0}})
  }

  animate(){
    requestAnimationFrame(this.animate);

    this.showDroneTail(); //красная линия за дроном

    if (!(this.keys.w || this.keys.s)){
      if (this.velocity > 0) {this.speed = -this.inertia * this.ds}
      else if (this.velocity < 0) {this.speed = this.inertia * this.ds};
      if (this.velocity > -0.0008 && this.velocity < 0.0008) {this.speed = this.velocity = 0;}//return } //если скорость 0 - функция анимации прекращается принудительно
    };

    if (this.keys.w) {this.speed = this.accelerarion * this.ds}
    else if (this.keys.s) {this.speed = -this.accelerarion * this.ds};
    this.velocity += (this.speed - this.velocity) * this.accelerarion * this.ds;
    //if (this.speed == 0){this.velocity = 0; return};
    this.drone.set({worldTranslate: new THREE.Vector3(0, -this.velocity, 0)});

    if (this.keys.x) {this.drone.setCoords([this.drone.coordinates[0], this.drone.coordinates[1], this.drone.coordinates[2] + 2])}
    else if (this.keys.c) {this.drone.setCoords([this.drone.coordinates[0], this.drone.coordinates[1], this.drone.coordinates[2] - 2])};

    if (this.keys.r || this.keys.t){
      let rad = this.toRad(1) * (this.keys.t ? -1 : 1);
      this.drone.rotation.x += rad;
    };

    if (this.keys.q || this.keys.e){
      let rad = this.toRad(1) * (this.keys.e ? -1 : 1);
      this.drone.rotation.y += rad;
    };

    if (this.keys.a || this.keys.d) {
      let rad = this.toRad(1) * (this.keys.d ? -1 : 1);
      this.drone.rotation.z += rad;
    };

    if (this.keys.i) {
      this.reloadRotation()
    }
  }

  init(){
    document.body.addEventListener('keydown', (e) => {
      let key = e.key.toLowerCase();
      if (this.keys[key] !== undefined) {this.keys[key] = true};
    });
    document.body.addEventListener('keyup', (e) => {
      let key = e.key.toLowerCase();
      if (this.keys[key] !== undefined) this.keys[key] = false;
    });
    this.animate()
  }

  //setDroneToState([38.942264,47.202215, 10], 20, 40, -50)
  setDroneToState(cords, rotateX, rotateY, rotateZ){
    this.drone.setCoords(cords)
    this.drone.set({
      rotation: {
        x: rotateX,
        y: rotateY,
        z: rotateZ
      }
    })
  };

  goToPoint(destination){ //плавно
    let options = {
      path: [
        this.drone.coordinates,
        destination
      ],
      duration: 40000
    }
    this.drone.followPath(options, () => {console.log('end')});
  }

  droneWay(){ //большой объем данных
    let index = 0;
    let way = this.way;
    let timerID = setInterval(() => {
      this.drone.setCoords([way[index][0], way[index][1], 50]);
      index++;
      if (index == way.length){
        console.log('endWay')
        clearInterval(timerID)
      }
    }, 100)
  }

  showTube(test){ //горизонтально не ложится
    // let tube = tb.tube({
    //   geometry: geometry,
    //   sides: 4, 
    //   radius: 2,
    //   color: 'red',
    //   opacity: 0.5,
    // });
    // tube.setCoords(geometry[0]);
    // tb.add(tube);
    // console.log(tube)

    //let geometry = new THREE.BoxGeometry(60, 60, 10);
    // let cube = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color: 0x660000}));
    // cube = tb.Object3D({obj: cube, units: 'meters'});
    // cube.setCoords(this.drone.coordinates);
    // tb.add(cube)
  }

  showRoute(routeArr){
    let route = tb.line({
      geometry: routeArr,
      width: 5,
      color: '#daa520'
    });
    tb.add(route, 'custom-layer');

    let routeBorder = tb.line({
      geometry: routeArr,
      width: 30,
      color: 'red',
      opacity: 0.5
    });
    tb.add(routeBorder, 'custom-layer')

    let pointCount = 0;
    for (let point of routeArr){
      pointCount++;

      let pointSphere = tb.sphere({
        radius: 0.5,
        color: '#ff9900',
        tooltip: true,
        adjustment: {x: 0.5, y: 0.5, z: -0.5}
      })
      pointSphere.setCoords(point);

      let htmlElement = document.createElement('div');
      htmlElement.classList.add('sphere');
      let elementImg = document.createElement('img')
      elementImg.classList.add('img')
      elementImg.src = mapIcon;
      elementImg.width = 35;
      elementImg.height = 35;
      htmlElement.appendChild(elementImg)
      let elementNumber = document.createElement('span');
      elementNumber.classList.add('number');
      elementNumber.textContent = pointCount;
      htmlElement.appendChild(elementNumber);

      pointSphere.addLabel(htmlElement, {
        center: pointSphere.anchor
      })

      tb.add(pointSphere)
    }
  }

  threeboxInit(){
    window.tb = new Threebox(this.props.map,
      this.props.map.getCanvas().getContext('webgl'),
      {
        realSunlight: true,
				enableSelectingObjects: true,
				enableDraggingObjects: true,
				enableRotatingObjects: true,
				enableTooltips: true,
        enableHelpTooltips: true
      }  
    )
    tb.altitudeStep = 1;
    tb.setSunlight(new Date(2020, 6, 19, 23), this.props.map.getCenter());
  
    this.props.map.addLayer({
      id: 'custom_layer',
      type: 'custom',
      renderingMode: '3d',
      onAdd: (map, gl) => {
        let options = {
          obj: '/media/drone/source/drone.glb',
					type: 'gltf',
					scale: 0.1,//0.01,
					rotation: { x: 90, y: 0, z: 0 },
					anchor: 'center',
					bbox: false,
          duration: 1000
        }
        tb.loadObj(options, (model) => {
          this.drone = model.setCoords([this.way[0][0], this.way[0][1], 50]);
					tb.add(this.drone);
          //this.props.map.jumpTo({center: [this.drone.coordinates[0], this.drone.coordinates[1]]})

          this.init();

          this.showRoute([
            this.drone.coordinates,
            [38.875964, 47.339259, 50],
            [38.880640, 47.336080, 50],
            [38.878465, 47.336106, 50]
          ]);

          console.log(tb)

          this.showTube(this.tubeGeometry)
        });
      },
      render: (gl, matrix) => {
        tb.update();
      }
    })
    
  }

  componentDidMount(){
    this.threeboxInit();
    console.log(this)
  }
  componentWillUnmount(){
    
  }
  render() {
    return (
      <div>
      </div>
    );
  }
}
export default WorkSpace;

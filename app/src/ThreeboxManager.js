import { Threebox } from "threebox-plugin";
//import {GUI} from 'https://threejs.org/examples/jsm/libs/lil-gui.module.min.js'
import mapIcon from './layouts/WorkSpace/imgs/icon_map_waypoint.png';
import takeOff from './RouteConstructor/BRM/Takeoff/icon_map_takeoff.png';
import land from './RouteConstructor/BRM/Land/icon_map_land.png'

function getAzimuthDistance(temp2, temp3){
    let lat1 = temp2.lat*Math.PI/180,
    lat2 = temp3.lat*Math.PI/180,
    lng1 = temp2.lng*Math.PI/180,
    lng2 = temp3.lng*Math.PI/180
    let cl1 = Math.cos(lat1),
        cl2 = Math.cos(lat2),
        sl1 = Math.sin(lat1),
        sl2 = Math.sin(lat2),
        delta = lng2-lng1
    let cdelta = Math.cos(delta),
        sdelta = Math.sin(delta)

    let y = Math.sqrt(Math.pow(cl2*sdelta, 2)+ Math.pow(cl1*sl2-sl1*cl2*cdelta, 2)),
        x = sl1*sl2+cl1*cl2*cdelta,
        ad = Math.atan2(y, x),
        dist = ad*6378
    x = (cl1*sl2) - (sl1*cl2*cdelta)
    y = sdelta*cl2
    let z = (Math.atan(-y/x))* (180 / Math.PI)

    if(x<0){z+=180}
    let z2 = (z+180)%360-180
    z2 = -z2* ( Math.PI / 180)
    let angle = z2-((2*Math.PI)*Math.floor((z2/(2*Math.PI))))
    return [angle/Math.PI*180, dist*1000]
}

export class ThreeBoxManager{
    constructor(map){
        this.map = map;
        this.model = null;
        this.modelTailArr = [];
        this.modelTail = null;
        this.firstMapScale = 16384//map.transform.scale;
        this.routeLine = null

        this.mission_rendered = false;
        this.rtl_rendered = false;
        this.land_rendered = false;

        this.lastID = 0;
        this.currentID = 0;
        this.objects = [];
        this.sphereArr = [];
        this.polygonUsed = false;
        this.rtlUsed = false;
        this.elementsCoords = [];
        this.gotoLandUsed = false;
        this.routeLineGeom = []

        this.showRouteOfmission = this.showRouteOfmission.bind(this);
        this.clearTb = this.clearTb.bind(this);
        this.changeScale = this.changeScale.bind(this);
        this.changeAlt = this.changeAlt.bind(this);
        this.changeCoords = this.changeCoords.bind(this);
        this.addPolygon = this.addPolygon.bind(this);
        this.gotoTakeOff = this.gotoTakeOff.bind(this);
        this.setCurrentSphere = this.setCurrentSphere.bind(this);
        this.currentSphereID = 0;
        this.rtl = this.rtl.bind(this);
        this.unitSpheres = this.unitSpheres.bind(this);
        this.deleteObject = this.deleteObject.bind(this);
    };
    calcMonitoringInfo(current_cords, last_cords, target_cords){
        let [azimuth, distance] = getAzimuthDistance(current_cords, target_cords)
        let [azimuth_, distance_] = getAzimuthDistance(last_cords, current_cords)
        this.all_distance += distance_

        return {
            azimuth:azimuth,
            distance_point:distance,
            all_distance:this.all_distance
        }
    }

    showModelTail(){
        this.modelTailArr.push(this.model.coordinates);
        if (this.modelTail){
            window.tb.remove(this.modelTail)
        };
        this.modelTail = window.tb.line({
            geometry: this.modelTailArr,
            width: 5,
            color: '#d10303',
        });
        window.tb.add(this.modelTail, 'custom-layer');
        this.objects.push(this.modelTail)
    }

    _showModelTail(arr){
        if (this.modelTail){
            window.tb.remove(this.modelTail)
        };
        this.modelTailArr = arr;
        this.modelTail = window.tb.line({
            geometry: this.modelTailArr,
            width: 5,
            color: '#d10303',
        });
        window.tb.add(this.modelTail, 'custom-layer');
        this.objects.push(this.modelTail)
    }

    setModelState(state){
        this.model.setCoords(state.coords);
        this.model.set({rotation: state.angles});
        this.showModelTail();
        this.changeScale();
        let info = this.calcMonitoringInfo(state.info.current_cords, state.info.last_cords, state.info.target_cords)
        
        console.log(info)
        return info
    }

    _setModelState(state){
        this.model.setCoords(state.coords);
        this.model.set({rotation: state.angles});
        this._showModelTail(state.tailArr);
        this.changeScale();
    }

    changeScale(){
        this.model.scale.x = this.firstMapScale/this.map.transform.scale*2.5;
        this.model.scale.y = this.firstMapScale/this.map.transform.scale*2.5;
        this.model.scale.z = this.firstMapScale/this.map.transform.scale*2.5;
    }

    clearTb(){
        for (let object of this.objects){
            if (object.userData.name != 'drone'){
                window.tb.remove(object)
            }
        };
        //this.map.off('zoom', this.changeScale)
        if (this.polygonUsed){
            this.map.removeLayer('polygon-fill');
            this.map.removeLayer('polygon-line');
            this.map.removeSource('polygon');
        }
    }
    _clearTb(deleteAll = true){
        for (let object of this.objects){
            window.tb.remove(object)
        };
        this.idSphereArr = []
        this.elementsCoords = []
        this.routeLine = null;
        this.routeLineGeom = []
        this.sphereArr = []
        this.objects = []

        //this.map.off('zoom', this.changeScale)
        if (deleteAll){
            this.map.removeLayer('custom_layer')
        }
        if (this.polygonUsed){
            this.map.removeLayer('polygon-fill');
            this.map.removeLayer('polygon-line');
            this.map.removeSource('polygon');
        }
    }

    gotoLand(emergencyLanding = false){
        this.gotoLandUsed = true;
        let geometry = null;
        if (emergencyLanding){
            this.land_rendered = true
            geometry = [this.model.coordinates, [this.model.coordinates[0], this.model.coordinates[1], 0]]
        }else{
            geometry = (this.rtlUsed) ? [this.model.coordinates, this.elementsCoords[0], [this.elementsCoords[0][0], this.elementsCoords[0][1], 0]] : [this.model.coordinates, this.elementsCoords.at(-1), [this.elementsCoords.at(-1)[0], this.elementsCoords.at(-1)[1], 0]]
        }
        let toLandTube = window.tb.line({
            geometry: geometry,
            width: 5,
            color: '#daa520'
        });
        window.tb.add(toLandTube);
        let toLandTubeBorder = window.tb.line({
            geometry: geometry,
            width: 20,
            color: '#E6E6FA',
            opacity: 0.5
        });
        window.tb.add(toLandTubeBorder);
    }

    addSphere(coords, id, radius=0.5){
        let pointSphere = window.tb.sphere({
            radius: radius,
            units:"meters",
            color: '#ff9900',
            adjustment: {x: 0.5, y: 0.5, z: -0.5}
        })
        pointSphere.setCoords(coords);

        this.lastID++;
        let htmlElement = document.createElement('div');
        htmlElement.classList.add('sphere');
        let elementImg = document.createElement('img')
        elementImg.classList.add('img')
        if (id == 2){ //takeoff
            elementImg.src = takeOff;
            elementImg.width = 35;
            elementImg.height = 35;
            htmlElement.appendChild(elementImg)
        }else if (id == 6){ //land
            elementImg.src = land;
            elementImg.width = 35;
            elementImg.height = 35;
            htmlElement.appendChild(elementImg)
        }else{ //waypoint and polygon
            elementImg.src = mapIcon;
            elementImg.width = 35;
            elementImg.height = 35;
            htmlElement.appendChild(elementImg)
            let elementNumber = document.createElement('span');
            elementNumber.classList.add('number');
            elementNumber.textContent = this.lastID;
            htmlElement.appendChild(elementNumber);
        }

        pointSphere.addLabel(htmlElement, {center: pointSphere.anchor});
        window.tb.add(pointSphere);
        this.objects.push(pointSphere)
    }

    unitSpheres(coordsArr){
        // console.log(coordsArr)
        if (this.routeLine){
            window.tb.remove(this.routeLine)
        }
        if (coordsArr.length > 1){
            this.routeLine = window.tb.line({
                geometry: coordsArr,
                width: 5,
                color: '#daa520'
            });
            // this.objects[0].set({})
            window.tb.add(this.routeLine, 'custom-layer');
            this.objects.push(this.routeLine)
        }
        this.routeLineGeom = coordsArr
    }

    getCoordArr(route){
        let currentNode = route.head
        let coordArr = [] 
        while (currentNode != route.tail){
            currentNode = currentNode.next 
            if (currentNode.params.module.name == "Polygon"){
                for (let coord of currentNode.params.markup.value){
                    coordArr.push([coord[0], coord[1], Number(currentNode.params.alt.value)+10])
                }
            }else if (currentNode.params.module.name == "RTL"){
             coordArr.push(coordArr[0])   
            }else{
                coordArr.push([currentNode.params.lng.value, currentNode.params.lat.value, Number(currentNode.params.alt.value)+10])
            }
        }
        return coordArr
    }

    _addSphere(coords, id, radius=0.5, elementID){
        let pointSphere = window.tb.sphere({
            radius: radius,
            units:"meters",
            color: '#ff9900',
            adjustment: {x: 0.5, y: 0.5, z: -0.5},
        })
        pointSphere.setCoords(coords);

        let sphereObject = {
            object: pointSphere,
            id: elementID
        }
        
        window.tb.add(pointSphere);
        this.objects.push(pointSphere);
        
        this.sphereArr.push(sphereObject);
        this.setCurrentSphere(elementID);
    }

    setCurrentSphere(id){
        this.currentSphereID = id;
        for (let sphere of this.sphereArr){
            sphere.object.userData.obj.material.color = {r: 1, g: 0.6, b: 0}
            if (sphere.id == id){
                sphere.object.userData.obj.material.color = {r: 0, g: 1, b: 0}
            }
            sphere.object.set({})
        } 
    }

    changeAlt(alt, id, arr=null){
        let sphereCoords = []
        for (let sphere of this.sphereArr){
            if (sphere.id == id){
                sphere.object.setCoords([sphere.object.coordinates[0], sphere.object.coordinates[1], Number(alt)+10])
                sphereCoords.push([sphere.object.coordinates[0], sphere.object.coordinates[1]])
            }
        }
        let newRouteLineGeom = []
        if (arr){
            newRouteLineGeom = arr
        }else{
            for (let coord of this.routeLineGeom){
                if (coord[0] == sphereCoords[0][0] && coord[1] == sphereCoords[0][1]){
                    newRouteLineGeom.push([coord[0], coord[1], Number(alt)+10])
                }else{
                    newRouteLineGeom.push([coord[0], coord[1], coord[2]])
                }
            }
        }
        this.unitSpheres(newRouteLineGeom)
    }

    deleteObject(id){
        for (let element of this.sphereArr){
            if (element.id == id){
                window.tb.remove(element.object)
            }
        }
        this.sphereArr[0].object.set({})
    }

    changeCoords(coords, id){
        let sphereCoords = []
        for (let sphere of this.sphereArr){
            if (sphere.id == id){
                sphere.object.setCoords([coords[0], coords[1], sphere.object.coordinates[2]])
                sphereCoords.push([coords[0], coords[1]])
            }
        }
    }

    addPolygon(conture){
        this.polygonUsed = true;
        this.map.addSource('polygon', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': [conture],
                }
            }
        });
        this.map.addLayer({
            'id': 'polygon-fill',
            'type': 'fill',
            'source': 'polygon', 
            'layout': {},
            'paint': {
                'fill-color': '#008000',
                'fill-opacity': 0.5
            }
        });
        this.map.addLayer({
            'id': 'polygon-line',
            'type': 'line',
            'source': 'polygon',
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': 2
            }
        })
    }

    gotoTakeOff(){
        let geometry = [this.model.coordinates, [this.model.coordinates[0], this.model.coordinates[1], this.elementsCoords[0][2]], this.elementsCoords[0]];
        let toTakeOffTube = window.tb.line({
            geometry: geometry,
            width: 5,
            color: '#daa520'
        });
        window.tb.add(toTakeOffTube);
        let toTakeOffTubeBorder = window.tb.line({
            geometry: geometry,
            width: 20,
            color: '#E6E6FA',
            opacity: 0.5
        });
        window.tb.add(toTakeOffTubeBorder);
    }

    rtl(){
        let geometry = [this.model.coordinates, [this.elementsCoords[0][0], this.elementsCoords[0][1], this.model.coordinates[2]], [this.elementsCoords[0][0], this.elementsCoords[0][1], 0]]
        let rtlTube = window.tb.line({
            geometry: geometry,
            width: 5,
            color: '#daa520'
        });
        window.tb.add(rtlTube);
        let rtlTubeBorder = window.tb.line({
            geometry: geometry,
            width: 20,
            color: '#E6E6FA', //лавандовый
            opacity: 0.5
        });
        window.tb.add(rtlTubeBorder);
        this.rtl_rendered = true
    }

    showRouteOfmission(missionID){
        fetch('api/mission/'+missionID)
        .then(res => res.json())
        .then(
            (result) => {
                this.mission_rendered = true

                let missionElements = result.route_elements;

                for (let missionElement of missionElements){
                    let elementData = JSON.parse(missionElement.data)
                    if (missionElement.element_id == 2){ //takeOff
                        this.elementsCoords.push([elementData.lng, elementData.lat, Number(elementData.alt)*4]);
                        this.addSphere([elementData.lng, elementData.lat, Number(elementData.alt)*4], missionElement.element_id);
                    }else if (missionElement.element_id == 3){ //wayPoint
                        this.elementsCoords.push([elementData.lng, elementData.lat, Number(elementData.alt)*4]);
                        this.addSphere([elementData.lng, elementData.lat, Number(elementData.alt)*4], missionElement.element_id);
                    }else if (missionElement.element_id == 4){ //polygon
                        for (let markup of elementData.markup){
                            this.elementsCoords.push([markup[0], markup[1], Number(elementData.alt)*4]);
                            this.addSphere([markup[0], markup[1], Number(elementData.alt)*4], missionElement.element_id);
                        }
                        this.addPolygon(elementData.conture)
                    }else if (missionElement.element_id == 5){ //RTL
                        this.rtlUsed = true;
                        this.elementsCoords.push(this.elementsCoords[0])
                    }else if (missionElement.element_id == 6){ //land
                        this.elementsCoords.push([elementData.lng, elementData.lat, Number(elementData.alt)*4]);
                        this.addSphere([elementData.lng, elementData.lat, Number(elementData.alt)*4], missionElement.element_id);
                    }
                }
                
                //show spheres of elementsCoords
                let route = window.tb.line({
                    geometry: this.elementsCoords,
                    width: 5,
                    color: '#daa520'
                });
                window.tb.add(route, 'custom-layer');
                this.objects.push(route)
                let routeBorder = window.tb.line({
                    geometry: this.elementsCoords,
                    width: 20,
                    color: '#800080',
                    opacity: 0.5
                });
                window.tb.add(routeBorder, 'custom-layer');
                this.objects.push(routeBorder)

                // go to the start of mission
                this.gotoTakeOff();
            }
        )
    }

    _showRouteOfmission(route_elements){
        console.log(route_elements)
        for (let missionElement of route_elements){
            let elementData = JSON.parse(missionElement.data)
            if (missionElement.element_id == 2){ //takeOff
                this.elementsCoords.push([elementData.lng, elementData.lat, Number(elementData.alt)*4]);
                this.addSphere([elementData.lng, elementData.lat, Number(elementData.alt)*4], missionElement.element_id);
            }else if (missionElement.element_id == 3){ //wayPoint
                this.elementsCoords.push([elementData.lng, elementData.lat, Number(elementData.alt)*4]);
                this.addSphere([elementData.lng, elementData.lat, Number(elementData.alt)*4], missionElement.element_id);
            }else if (missionElement.element_id == 4){ //polygon
                for (let markup of elementData.markup){
                    this.elementsCoords.push([markup[0], markup[1], Number(elementData.alt)*4]);
                    this.addSphere([markup[0], markup[1], Number(elementData.alt)*4], missionElement.element_id);
                }
                this.addPolygon(elementData.conture)
            }else if (missionElement.element_id == 5){ //RTL
                this.rtlUsed = true;
                this.elementsCoords.push(this.elementsCoords[0])
            }else if (missionElement.element_id == 6){ //land
                this.elementsCoords.push([elementData.lng, elementData.lat, Number(elementData.alt)*4]);
                this.addSphere([elementData.lng, elementData.lat, Number(elementData.alt)*4], missionElement.element_id);
            }
        }
        
        //show spheres of elementsCoords
        let route = window.tb.line({
            geometry: this.elementsCoords,
            width: 5,
            color: '#daa520'
        });
        window.tb.add(route, 'custom-layer');
        this.objects.push(route)
        let routeBorder = window.tb.line({
            geometry: this.elementsCoords,
            width: 20,
            color: '#800080',
            opacity: 0.5
        });
        window.tb.add(routeBorder, 'custom-layer');
        this.objects.push(routeBorder)

        // go to the start of mission
        //this.gotoTakeOff();
    }

    _initThreeBox(){
        window.tb = new Threebox(this.map,
            this.map.getCanvas().getContext('webgl'),
            {
                realSunlight: true,
                enableDraggingObjects: true
            }    
        );
        this.map.addLayer({
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: () => {
                
            },
            render: () => {
                window.tb.update();
            }
        })
    }

    initThreeBox(startCoords){
        window.tb = new Threebox(this.map,
            this.map.getCanvas().getContext('webgl'),
            {
                realSunlight: true
            }    
        );

        //tb.setSunlight(new Date(2020, 6, 19, 23), this.map.getCenter());
        
        this.map.addLayer({
            id: 'custom_layer',
            type: 'custom',
            renderingMode: '3d',
            onAdd: () => {
                let modelOptions = {
                    obj: './drone.glb',
                    type: 'gltf',
                    scale: 15,
                    rotation: { x: 90, y: 0, z: 0 },
                    anchor: 'center',
                    fixedZoom: 15,
                    name: 'drone'
                }
                window.tb.loadObj(modelOptions, (model1) => {
                    this.model = model1.setCoords(startCoords);
                    window.tb.add(this.model);
                    this.objects.push(this.model)
                    //this.showRouteOfmission(17);
                    this.showModelTail()

                    this.map.on('zoom', this.changeScale);
                })
            },
            render: () => {
                window.tb.update();
            }
        })
    }
} 
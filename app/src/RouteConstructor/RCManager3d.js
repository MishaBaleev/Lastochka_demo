import mapboxgl from "mapbox-gl";
import { element, object } from "prop-types";
import waypointIcon from '../RouteConstructor/BRM/Waypoint/icon_map_waypoint.png';
import { connect } from 'react-redux';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import WaypointME from './BRM/Waypoint/MapElement';
import WaypointRE from './BRM/Waypoint/RouteElement';

import { lineChunk, lineString, lineIntersect, lineSlice, length, point, polygon } from '@turf/turf'
//console.log(lineSlice, length
function getIntersectAlt(l1, l2, l3) {
    if(l1[0] != l2[0]){
        let line1 = lineString([
            [l1[0], l1[2]],
            [l2[0], l2[2]]
        ])
        let line2 = lineString([
            [l3[0], 0],
            [l3[0], Math.max(l1[2], l2[2])]
        ])
        let intersects = lineIntersect(line1, line2)
        
        try{
            return intersects.features[0].geometry.coordinates[1]
        }catch{
            return 0
        }
    }
    else if(l1[1] != l2[1]){
        let line1 = lineString([
            [l1[1], l1[2]],
            [l2[1], l2[2]]
        ])
        let line2 = lineString([
            [l3[1], 0],
            [l3[1], Math.max(l1[2], l2[2])]
        ])
        let intersects = lineIntersect(line1, line2)
        console.log(2)
        return intersects.features[0].geometry.coordinates[1]
    }
    // else return
}

function calcDistance(point1, point2) {
    var line = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "LineString",
              "coordinates": [
                point1, 
                point2
              ]
            }
          }
        ]
      };
      
      var start = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": point1
        }
      };
      var stop = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": point2
        }
      };
      return length(lineSlice(start, stop, line.features[0]), {units: 'meters'})
}
function segmentateLine(point1, point2, segmentProcent, manager3D, flag=false) {
    let pwa1 = [
        point1[0],
        point1[1]
    ]
    let pwa2 = [
        point2[0],
        point2[1]
    ]

    let distance = calcDistance(
        pwa1, 
        pwa2
        )
    let interval = 0;
    if(flag){
        interval = 1/1000
    }
    else{
        interval = distance/1000*(segmentProcent/100)
    }
    let cords = []
    let cords_AMS = []

    let z = [...lineChunk({
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: [
                pwa1,
                pwa2
            ]
        },
        properties: {}
        }, distance/1000*(segmentProcent/100)).features.map((feature) => {
            let alt;
            //console.log(pwa1, pwa2, feature.geometry.coordinates[0])
            if(pwa1[0] == feature.geometry.coordinates[0][0] && pwa1[1] == feature.geometry.coordinates[0][1]){
                alt = point1[2]
            }
            else if(pwa2[0] == feature.geometry.coordinates[0][0] && pwa2[1] == feature.geometry.coordinates[0][1]){
                alt = point2[2]
            }
            else if(point1[2] == point2[2]){
                alt = point1[2]
            }
            else{
                alt = getIntersectAlt(
                    point1, 
                    point2, 
                    feature.geometry.coordinates[0]
                )
            }

            cords.push([
                ...feature.geometry.coordinates[0],
                alt
            ])
            cords_AMS.push([
                ...feature.geometry.coordinates[0],
                alt+manager3D.getAMS({
                    lng:feature.geometry.coordinates[0][0],
                    lat:feature.geometry.coordinates[0][1]
                })
            ])
            return 
    
        })
    ]

    cords.push(point2)
    cords_AMS.push([
        point2[0],
        point2[1],
        point2[2]+manager3D.getAMS({
            lng:point2[0],
            lat:point2[1]
        })
    ])

    return {
        cords:cords,
        cords_AMS:cords_AMS
    }
}

async function getFeatures(segment, manager3d) {
    let cords = manager3d.map.project({lng:segment[0], lat:segment[1]})
    cords = [cords.x, cords.y]
    let feat = manager3d.map.queryRenderedFeatures(cords)
    if (feat.length != 0 && feat[0].properties.height >= segment[2]){
        return {
            feat: feat[0],
            cords: segment,
            featHeight: feat[0].properties.height
        }
    }
}

export class RCManager3D{
    constructor(manager3d){
        this.manager3d = manager3d;
        this.objects = [];
        this.sphereArr = [];
        this.routeLine = null;
        this.route = null
        this.selected_features = []
        this.warnings = []
        this.warningsBuildings = []
        this.helpLines = []
        this.changeMode = this.changeMode.bind(this)
        this.tb = window.tb
        // changeMode
    }

    addSphere(coords, elementID){
        let sphereOptions = this.manager3d.getMeshOptions("sphere_1")
        // sphereOptions.radius = 5
        let pointSphere = this.tb.sphere(sphereOptions)
        pointSphere.setCoords([
            coords[0],
            coords[1], 
            coords[2]+this.manager3d.getAMS({
                lng:coords[0],
                lat:coords[1]
            })
        ])

        let sphereObject = {
            object: pointSphere,
            id: elementID,
            baseCoords: coords
        }
        
        this.tb.add(pointSphere)
        this.objects.push(pointSphere)
        this.sphereArr.push(sphereObject)
        this.setCurrentSphere(elementID);

        this.manager3d.map.setZoom(this.manager3d.map.getZoom())
    }

     addWarningCollision(coords){
        let sphereOptions = this.manager3d.getMeshOptions("sphere_1")
        // sphereOptions.radius = 5
        let pointSphere = this.tb.sphere(sphereOptions)
        pointSphere.setCoords([
            coords[0],
            coords[1], 
            coords[2]+this.manager3d.getAMS({
                lng:coords[0],
                lat:coords[1]
            })
        ])

        let htmlElement = document.createElement("div")
        htmlElement.classList.add("sphereRC")

        let elementImg = document.createElement("img")
        elementImg.classList.add("imgRC")
        elementImg.src = waypointIcon
        elementImg.width = 35;
        elementImg.height = 35;
        htmlElement.appendChild(elementImg)

        let elementText = document.createElement("a")
        elementText.setAttribute("href", "#")
        elementText.classList.add("textRC")
        elementText.textContent = "W"
        htmlElement.appendChild(elementText)
        
        let descriptionText = document.createElement("span")
        descriptionText.classList.add("descriptionRC")
        descriptionText.textContent = "Внимание! Возможность столкновения с препятствием. Зеленым отображается возможный вариант облета препятствия."
        htmlElement.appendChild(descriptionText)
        pointSphere.addLabel(htmlElement, {center: pointSphere.anchor})
        
        this.warnings.push({
            object: pointSphere,
            baseCoords: coords
        })
        this.tb.add(pointSphere)
    }

    resetCollisionObjects(){
        this.warnings.forEach(warning => {
            this.tb.remove(warning.object)
        })
        this.warnings = []

        this.warningsBuildings.forEach(building => {
            this.manager3d.map.setFeatureState({
                source: building.source,
                sourceLayer: building.sourceLayer,
                id: building.id
            }, { select: false })
        })
        this.warningsBuildings = []

        this.helpLines.forEach(line => {
            this.tb.remove(line)
        })
        this.helpLines = []
    }
    checkCollision(route){
        
    }

    helpTrail(cords, routeArr, height){
        for (let item=0; item < routeArr.length-1; item++){
            const boundsGeometry = polygon([
                [
                  [routeArr[item][0], routeArr[item][1]],
                  [routeArr[item+1][0], routeArr[item][1]],
                  [routeArr[item+1][0], routeArr[item+1][1]],
                  [routeArr[item][0], routeArr[item+1][1]],
                  [routeArr[item][0], routeArr[item][1]]
                ]
              ]);
              let flag = booleanPointInPolygon(cords, boundsGeometry)
              if (flag){
                let currentNode = this.route.head 
                let points = [] 
                let routeArr = this.getCoordArr(this.route)
                routeArr.forEach(coord => {
                    if (coord == routeArr[item]){
                        points.push(coord)
                    }
                    if (coord == routeArr[item+1]){
                        points.push(coord)
                    }
                })

                let point1_alt = this.manager3d.getAMS({
                    lng:points[0][0],
                    lat:points[0][1]
                })
                let point2_alt = this.manager3d.getAMS({
                    lng:points[1][0],
                    lat:points[1][1]
                })

                let helpGeometry = [
                    [points[0][0], points[0][1], points[0][2] + point1_alt],
                    [points[0][0], points[0][1], height + point1_alt + 5],
                    [points[1][0], points[1][1], height + point2_alt + 5],
                    [points[1][0], points[1][1], points[1][2] + point2_alt]
                ]
                let helpLineOptions = this.manager3d.getMeshOptions("line_help")
                helpLineOptions.geometry = helpGeometry
                let helpLine = this.tb.line(helpLineOptions)
                this.tb.add(helpLine, "helpLine")
                this.objects.push(this.helpLine)
                this.helpLines.push(helpLine)
              }
        }
    }

    getCoordArr(route){
        let currentNode = route.head
        let coordArr = [] 
        while (currentNode != route.tail){
            currentNode = currentNode.next 
            if(currentNode == route.head.next){
                coordArr.push([
                    currentNode.params.lng.value,
                    currentNode.params.lat.value,
                    0
                ])
            }

            if (currentNode.params.module.name == "Polygon"){
                for (let coord of currentNode.params.markup.value){
                    coordArr.push([
                        coord[0], 
                        coord[1], 
                        Number(currentNode.params.alt.value)
                    ])
                }
            }else if (currentNode.params.module.name == "RTL"){
             coordArr.push(coordArr[1])
             coordArr.push(coordArr[0])
            }else{
                coordArr.push([
                    currentNode.params.lng.value,
                    currentNode.params.lat.value,
                    Number(currentNode.params.alt.value)
                ])
            }
            if(currentNode.params.module.name == "Land"){
                coordArr.push([
                    currentNode.params.lng.value,
                    currentNode.params.lat.value,
                    0
                ])
            }
        }
        this.route = route
        return coordArr
    }

    updateLineGeometry(route){
        if (this.routeLine){
            let coordsArr = this.getCoordArr(route)
            let cords_AMS = []
            for (let item in coordsArr){
                if (item < coordsArr.length-1){
                    if(coordsArr[item][2] == 0){
                        cords_AMS.push([
                            coordsArr[item][0],
                            coordsArr[item][1],
                            this.manager3d.getAMS({
                                lng:coordsArr[item][0],
                                lat:coordsArr[item][1]
                            })
                        ])
                    }
                    else if(coordsArr[Number(item)+1][2] == 0){
                        cords_AMS.push([
                            coordsArr[Number(item)+1][0],
                            coordsArr[Number(item)+1][1],
                            this.manager3d.getAMS({
                                lng:coordsArr[Number(item)+1][0],
                                lat:coordsArr[Number(item)+1][1]
                            })
                        ])
                    }
                    else if(coordsArr[item][2] != 0 && coordsArr[Number(item)+1][2] != 0){
                        let segmCoords = segmentateLine(coordsArr[item], coordsArr[Number(item)+1], 10, this.manager3d)
                        cords_AMS = cords_AMS.concat(segmCoords.cords_AMS)
                    }


                    // let segmCoords = segmentateLine(coordsArr[item], coordsArr[Number(item)+1], 10, this.manager3d)
                    // cords_AMS = cords_AMS.concat(segmCoords.cords_AMS)
                }
            }
            this.routeLine.setGeometry_(cords_AMS, this.routeLine)
        }
    }

    unitSpheres(route, arr = null){
        let coordsArr = (arr)?arr:this.getCoordArr(route)
        if (this.routeLine){
            this.tb.remove(this.routeLine)
            for (let i in this.objects){
                if (this.objects[i] == this.routeLine){
                    this.objects.splice(i, 1)
                }
            }
        }
        if (coordsArr.length > 1){
            let cords_AMS = []
            for (let item in coordsArr){
                if (item < coordsArr.length-1){
                    if(coordsArr[item][2] == 0){
                        cords_AMS.push([
                            coordsArr[item][0],
                            coordsArr[item][1],
                            this.manager3d.getAMS({
                                lng:coordsArr[item][0],
                                lat:coordsArr[item][1]
                            })
                        ])
                    }
                    else if(coordsArr[Number(item)+1][2] == 0){
                        cords_AMS.push([
                            coordsArr[Number(item)+1][0],
                            coordsArr[Number(item)+1][1],
                            this.manager3d.getAMS({
                                lng:coordsArr[Number(item)+1][0],
                                lat:coordsArr[Number(item)+1][1]
                            })
                        ])
                    }
                    else if(coordsArr[item][2] != 0 && coordsArr[Number(item)+1][2] != 0){
                        let segmCoords = segmentateLine(coordsArr[item], coordsArr[Number(item)+1], 10, this.manager3d)
                        cords_AMS = cords_AMS.concat(segmCoords.cords_AMS)
                    }
                }
            }
            let routeLineOptions = this.manager3d.getMeshOptions("line_1")
            routeLineOptions.geometry = cords_AMS
            this.routeLine = this.tb.line(routeLineOptions)
            this.tb.add(this.routeLine, "custom-layer")
            this.objects.push(this.routeLine)
        }
    }
   
    setCurrentSphere(id){
        for (let sphere of this.sphereArr){
            sphere.object.userData.obj.material.color = {r: 1, g: 0.6, b: 0}
            if (sphere.id == id){
                sphere.object.userData.obj.material.color = {r: 0, g: 1, b: 0}
            }
            sphere.object.set({})
        }
    }
    changeAlt(value, id, route){
        let sphereCoords = []
        for (let sphere of this.sphereArr){
            if (sphere.id == id){
                sphere.object.setCoords([
                    sphere.object.coordinates[0], 
                    sphere.object.coordinates[1], 
                    Number(value)+this.manager3d.getAMS({
                        lng: sphere.object.coordinates[0],
                        lat: sphere.object.coordinates[1]
                    })])
                sphereCoords.push([sphere.object.coordinates[0], sphere.object.coordinates[1]])
                sphere.baseCoords[2] = Number(value)
            }
        }
        this.updateLineGeometry(route)
    }
    changeCoords(coords, id){
        for (let sphere of this.sphereArr){
            if (sphere.id == id){
                sphere.object.setCoords([
                    coords[0], 
                    coords[1], 
                    sphere.baseCoords[2]+this.manager3d.getAMS({
                        lng:coords[0],
                        lat:coords[1]
                    })
                ])
                sphere.baseCoords = [coords[0], coords[1], sphere.baseCoords[2]]
            }
        }
    }
    clearTb(deleteAll = false){
        for (let object of this.objects){
            this.tb.remove(object)
        };
        this.idSphereArr = []
        this.routeLine = null;
        this.sphereArr = []
        this.objects = []
        if (deleteAll){
            this.map.removeLayer('custom_layer')
        }
    }
    deleteObject(id){
        for (let element of this.sphereArr){
            if (element.id == id){
                this.tb.remove(element.object)
            }
        }
        // this.sphereArr[0].object.set({})
    }
    changeMode(mode){
        // console.log(this.manager3d.map.getStyle().layers)
        // buildings_8
        // Markup_9
        for (let id in this.sphereArr){
            let z = [
                this.sphereArr[id].baseCoords[0],
                this.sphereArr[id].baseCoords[1],
                this.sphereArr[id].baseCoords[2]+this.manager3d.getAMS({
                    lng:this.sphereArr[id].baseCoords[0],
                    lat:this.sphereArr[id].baseCoords[1]
                })
            ]
            this.sphereArr[id].object.setCoords(z)
        }
        if (this.route){
            this.unitSpheres(this.route)
        }
    }
    changeScale(){
        
    }
}

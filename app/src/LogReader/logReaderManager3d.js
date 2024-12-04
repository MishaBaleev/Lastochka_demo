import waypointIcon from '../RouteConstructor/BRM/Waypoint/icon_map_waypoint.png';
import takeOff from '../RouteConstructor/BRM/Takeoff/icon_map_takeoff.png';
import landIcon from '../RouteConstructor/BRM/Land/icon_map_land.png'
import { lineChunk, lineString, lineIntersect, lineSlice, length } from '@turf/turf'
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
        return 1
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
        return 1
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
function segmentateLine(point1, point2, segmentProcent, manager3D) {
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
    if(distance < 10){
        return {
            cords:[point1, point2],
            cords_AMS:[
                [
                    point1[0],
                    point1[1],
                    point1[2]+manager3D.getAMS({
                        lng:point1[0],
                        lat:point1[1]
                    })
                ], 
                [
                    point2[0],
                    point2[1],
                    point2[2]+manager3D.getAMS({
                        lng:point2[0],
                        lat:point2[1]
                    })
                ]
            ],
        }
    }
    else{
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
            ////console.log(pwa1, pwa2, feature.geometry.coordinates[0])
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
    })]

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
}

export class logReaderManager3d{
    constructor(manager3d){
        this.manager3d = manager3d;
        this.objects3d = {};
        this.object_last_id = 0;

        this.modelTail = null;

        this.rtl_rendered = false;
        this.land_rendered = false;
        this.rtlUsed = false;
        this.gotoLandUsed = false;

        this.elementsCoords = [];

        this.addModel = this.addModel.bind(this);
        this.addTail = this.addTail.bind(this);
        this.addSphere = this.addSphere.bind(this);
        this.addMissionTraectory = this.addMissionTraectory.bind(this);
        this.addPolygonContour = this.addPolygonContour.bind(this);
        this.showRouteOfmission = this.showRouteOfmission.bind(this);

        this.clearTb = this.clearTb.bind(this);
    };
    addModel(startCords, route_elements=null){
        let modelOptions = this.manager3d.getMeshOptions('drone')
        window.tb.loadObj(modelOptions, (model1) => {
            let model = model1.setCoords([
                startCords[0],
                startCords[1],
                startCords[2]+this.manager3d.getAMS({
                    lng:startCords[0],
                    lat:startCords[1]
                })
            ]);
            window.tb.add(model);
            this.objects3d[this.object_last_id] = {
                type:'drone',
                object:model,
                cords:[
                    startCords[0],
                    startCords[1],
                    startCords[2]
                ]
            }
            this.object_last_id++
            if(route_elements){
                this.showRouteOfmission(route_elements)
            }
        })
    ////////console.log(this.objects3d)
    }
    changeMode(mode){
        for(let id in this.objects3d){
            if(this.objects3d[id].type == "drone" || this.objects3d[id].type == "point"){
                let z = [
                    this.objects3d[id].cords[0],
                    this.objects3d[id].cords[1],
                    this.objects3d[id].cords[2]+this.manager3d.getAMS({
                        lng:this.objects3d[id].cords[0],
                        lat:this.objects3d[id].cords[1]
                    })
                ]
                this.objects3d[id].object.setCoords(z)
            }
            else if(this.objects3d[id].type == "traectory" || this.objects3d[id].type == "trust_intervals" || 
            this.objects3d[id].type == "fact_traectory" || this.objects3d[id].type == "contour"){
                let cords = this.objects3d[id].cords.map(item => {
                    return [
                        item[0],
                        item[1],
                        item[2]+this.manager3d.getAMS({
                            lng:item[0],
                            lat:item[1]
                        })
                    ]
                })
                this.objects3d[id].object.setGeometry_(cords, this.objects3d[id].object)
            }
        }
        console.log(this.objects3d)
    }
    setModelState(state, tailFlag){
        if(this.objects3d[0]){
            this.objects3d[0].cords = [...state.coords]
            let cords = [...state.coords]
            cords[2] += this.manager3d.getAMS({
                lng:state.coords[0],
                lat:state.coords[1]
            })
            this.objects3d[0].object.setCoords(cords)

            if (state.angles.x && state.angles.y && state.angles.z){
                this.objects3d[0].object.set({
                    rotation: state.angles
                })
            }
            this.changeScale()
            if(tailFlag){
                this.updateTail([...state.coords])
            }
        }
    }

    changeScale(){
         // let sc = firstMapScale/transform*2.5
         let sc = 719200.0000*Math.pow(0.5, this.manager3d.map.getZoom())
         //console.log(angles)
         for(let id in this.objects3d){
             if(this.objects3d[id].type == "drone"){
                 let ang = {
                     x:0,
                     y:0,
                     z:0
                 }
                 if(typeof({}) == typeof(ang)) {
                     this.objects3d[id].object.set({
                         scale: {
                             x:sc,
                             y:sc,
                             z:sc
                         },
                         rotation: ang,
                         duration:1
                     })
                 }
                 else{
                     this.objects3d[id].object.set({
                         scale: {
                             x:sc,
                             y:sc,
                             z:sc
                         },
                         duration:1
                     })
                 }
             }
         }
    }

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

    _showModelTail(arr){
        if (this.modelTail){
            window.tb.remove(this.modelTail)
        };
        this.modelTail = window.tb.line({
            geometry: arr,
            width: 5,
            color: '#d10303',
        });
        window.tb.add(this.modelTail, 'custom-layer');
        this.objects.push(this.modelTail)
    }

    addRecognitionPoint(coords){
        let icon = window.location.origin+"/media/recog1.png"
        let modelOptions = this.manager3d.getMeshOptions('sphere_1')
        let cords = [
            coords[0],
            coords[1],
            coords[2]+this.manager3d.getAMS({
                lng:coords[0],
                lat:coords[1]
            })
        ]
        let pointSphere = window.tb.sphere(modelOptions)
        pointSphere.setCoords(cords);
        let htmlElement = document.createElement('div');

        htmlElement.style="transition-duration: 0.7s;opacity:0;position: absolute;bottom: 100%;left: 100%;background-color: rgb(35 35 35 / 71%);padding: 5px;color: #ffffff;"
        htmlElement.classList.add('sphere--'+pointSphere.uuid);
        
        
        let label = document.createElement('h5')
        label.textContent = "Объект интереса"
        htmlElement.appendChild(label)

        // label.style = "margin: 0;padding: 5px 0;font-size: 18px;"

        let elementImg = document.createElement('img')
        elementImg.classList.add('img')
        elementImg.src = icon;
        elementImg.style = "transition-duration: 0.7s;width: 300px; height: auto;"
        // elementImg.width = 300;
        // elementImg.height = 200;
        htmlElement.appendChild(elementImg)
        
        label = document.createElement('p')
        label.style = "margin: 0;padding: 5px 0;font-size: 15px;"
        label.textContent = "ЖМА (вероятность 90%)"
        htmlElement.appendChild(label)

        label = document.createElement('span')
        label.style = "position: absolute;bottom: 0;right: 0;width: 0;height: 0;border-style: solid;border-width: 0 0 30px 30px;border-color: transparent transparent #ffffff transparent;"
        label.classList.add('button--'+pointSphere.uuid);
        htmlElement.appendChild(label)


        pointSphere.addLabel(htmlElement, {visible:false, center: pointSphere.anchor});
        pointSphere.isListenerSet = false
        window.tb.add(pointSphere);

        

        pointSphere.addEventListener("SelectedChange", function(e){
            let message = document.querySelector('.sphere--'+pointSphere.uuid)
            if(e.detail.selected){
                message.style.opacity = "1"

                if(e.detail.isListenerSet == false){
                    document.querySelector('.button--'+pointSphere.uuid).addEventListener("click", function(evt){
                        evt.preventDefault()
                        let img = document.querySelector('.sphere--'+pointSphere.uuid + ' img')
                        if(img.style.width != "600px"){
                            img.style.width = "600px"
                        }
                        else{
                            img.style.width = "300px"
                        }
                    })
                    pointSphere.isListenerSet = true
                }

            }
            else{
                let img = document.querySelector('.sphere--'+pointSphere.uuid + ' img')
                message.style.opacity = "0"
                // message.style.display = "none"
                img.style.width = "300px"
            }
        }, false);
    }

    addSphere(coords, icon, type){
        let modelOptions = this.manager3d.getMeshOptions('sphere_1')
        let cords = [
            coords[0],
            coords[1],
            coords[2]+this.manager3d.getAMS({
                lng:coords[0],
                lat:coords[1]
            })
        ]
        let pointSphere = window.tb.sphere(modelOptions)
        pointSphere.setCoords(cords);
        let htmlElement = document.createElement('div');
        htmlElement.classList.add('sphere');
        let elementImg = document.createElement('img')
        elementImg.classList.add('img')
        elementImg.src = icon;
        elementImg.width = 35;
        elementImg.height = 35;
        htmlElement.appendChild(elementImg)
        // waypoint and polygon
        if(type == "waypoint" || type == "polygon"){
            let last_number = Object.entries(this.objects3d).filter(([k,v]) => v.type == "point").length+1;
            let elementNumber = document.createElement('span');
            elementNumber.classList.add('number');
            elementNumber.textContent = last_number;
            htmlElement.appendChild(elementNumber);
        }
        pointSphere.addLabel(htmlElement, {center: pointSphere.anchor});
        window.tb.add(pointSphere);
        this.objects3d[this.object_last_id] = {
            type:'point',
            object:pointSphere,
            cords:[
                coords[0],
                coords[1],
                coords[2]
            ]
        }
        this.object_last_id++
        return coords
    }
    addMissionTraectory(traectory){
        if (traectory.length != 0){
            let cords = []
            let cords_AMS = []
            traectory.map((item, index) => {
                if(index <= 1){
                    cords.push([...item])
                    cords_AMS.push(
                        [
                            item[0],
                            item[1],
                            item[2]+this.manager3d.getAMS({
                                lng:item[0],
                                lat:item[1]
                            })
                        ]
                    )
                }
                else{
                    let cds = segmentateLine(
                        traectory[index-1], 
                        item, 
                        10, 
                        this.manager3d
                        )

                    cords.push(...cds.cords)
                    cords_AMS.push(...cds.cords_AMS)
                }
            })
            
            let modelOptions = this.manager3d.getMeshOptions('line_1')
            modelOptions.geometry = cords_AMS
            let line = window.tb.line(modelOptions);
            window.tb.add(line);
            this.objects3d[this.object_last_id] = {
                type:'traectory',
                object:line,
                cords:cords,
                traectory:traectory
            }
            this.object_last_id++

            modelOptions = this.manager3d.getMeshOptions('tube_1')
            modelOptions.geometry = cords_AMS
            line = window.tb.line(modelOptions);
            window.tb.add(line);
            this.objects3d[this.object_last_id] = {
                type:'trust_intervals',
                object:line,
                cords:cords,
                traectory:traectory
            }
            this.object_last_id++
            // traectory
            return {
                cords:cords, 
                cords_AMS:cords_AMS
            }
        }
    }
    addPolygonContour(contour, alt){
        let cords = []
        let cords_AMS = []
        let contour_ = [...contour]
        // contour_.pop()

        contour_.map((cortej, index) => {
            if(index > 0){
                let item = [
                    cortej[0],
                    cortej[1],
                    alt
                ]
                
                let cds = segmentateLine(
                    [...contour_[index-1], alt], 
                    item, 
                    10, 
                    this.manager3d
                    )

                cords.push(...cds.cords)
                cords_AMS.push(...cds.cords_AMS)
            }
        })
        cords.push(cords[0])
        cords_AMS.push(cords_AMS[0])

        let modelOptions = this.manager3d.getMeshOptions('line_3')
        modelOptions.geometry = cords_AMS
        let line = window.tb.line(modelOptions);
        window.tb.add(line);
        this.objects3d[this.object_last_id] = {
            type:'contour',
            object:line,
            cords:cords
        }
        this.object_last_id++
    }
    addTail(){
        let modelOptions = this.manager3d.getMeshOptions('line_1')
        let geometry = [
            [
                this.objects3d[0].cords[0],
                this.objects3d[0].cords[1],
                this.objects3d[0].cords[2]
            ]
        ]
        modelOptions.geometry = [
            [
                this.objects3d[0].cords[0],
                this.objects3d[0].cords[1],
                this.objects3d[0].cords[2]+this.manager3d.getAMS({
                    lng:this.objects3d[0].cords[0],
                    lat:this.objects3d[0].cords[1]
                })
            ]
        ]
        let line = window.tb.line(modelOptions);
        window.tb.add(line);

        this.objects3d[this.object_last_id] = {
            type:'fact_traectory',
            object:line,
            cords:geometry
        }
        this.object_last_id++
    }
    updateTail(cords){
        let c = [cords[0],cords[1],cords[2]]
        let id_;
        for(let id in this.objects3d){
            if(this.objects3d[id].type == "fact_traectory"){
                id_ = id
                break
            }
        }
        if(this.objects3d[id_].cords){
            this.objects3d[id_].cords.push(c)
            let geometry = this.objects3d[id_].cords.map(item => {
                return [
                    item[0],
                    item[1],
                    item[2]+this.manager3d.getAMS({
                        lng:item[0],
                        lat:item[1]
                    })
                ]
            })
            
            window.tb.remove(this.objects3d[id_].object)
            let modelOptions = this.manager3d.getMeshOptions('line_2')
            modelOptions.geometry = geometry
            let line = window.tb.line(modelOptions);
            window.tb.add(line);
            this.objects3d[id_].object = line
        }
    }
    deleteTail(){
        for (let id in this.objects3d){
            if (this.objects3d[id].type == "fact_traectory"){
                this.objects3d[id].cords = []
                window.tb.remove(this.objects3d[id].object)
                this.objects3d[0].object.set({})
                this.changeScale()
            }
        }
    }
    land(emergencyLanding = false){
        let cords = []
        let cords_AMS = []

        let current_cords;
        if(typeof(this.objects3d[0].cords[0]) == typeof([])){
            current_cords = this.objects3d[0].cords[0]
        }
        else{
            current_cords = this.objects3d[0].cords
        }

        cords.push(current_cords)
        cords_AMS.push([
            current_cords[0],
            current_cords[1],
            current_cords[2]+this.manager3d.getAMS({
                    lng:current_cords[0],
                    lat:current_cords[1]
                })
        ])

        cords.push([
            current_cords[0],
            current_cords[1],
            0
        ])
        cords_AMS.push([
            current_cords[0],
            current_cords[1],
            0+this.manager3d.getAMS({
                    lng:current_cords[0],
                    lat:current_cords[1]
                })
        ])

        let modelOptions = this.manager3d.getMeshOptions('line_4')
        modelOptions.geometry = cords_AMS
        let line = window.tb.line(modelOptions);
        window.tb.add(line);
        this.objects3d[this.object_last_id] = {
            type:'traectory',
            object:line,
            cords:cords
        }
        this.object_last_id++

        modelOptions = this.manager3d.getMeshOptions('tube_2')
        modelOptions.geometry = cords_AMS
        line = window.tb.line(modelOptions);
        window.tb.add(line);
        this.objects3d[this.object_last_id] = {
            type:'trust_intervals',
            object:line,
            cords:cords
        }
        this.object_last_id++
        this.gotoLandUsed = true;
    }
    rtl(){
        let fact_traectory;
        for(let id in this.objects3d){
            if(this.objects3d[id].type == "fact_traectory"){
                fact_traectory = this.objects3d[id]
                break
            }
        }
        let return_cords = fact_traectory.cords[0]
        return_cords[2] = 3
        let current_cords;
        if(typeof(this.objects3d[0].cords[0]) == typeof([])){
            current_cords = this.objects3d[0].cords[0]
        }
        else{
            current_cords = this.objects3d[0].cords
        }

        let cds = segmentateLine(
            current_cords, 
            return_cords, 
            10, 
            this.manager3d
            )

        cds.cords.push([
            return_cords[0],
            return_cords[1],
            0
        ])
        cds.cords_AMS.push([
            return_cords[0],
            return_cords[1],
            0+this.manager3d.getAMS({
                    lng:return_cords[0],
                    lat:return_cords[1]
                })
        ])

        let modelOptions = this.manager3d.getMeshOptions('line_4')
        modelOptions.geometry = cds.cords_AMS
        let line = window.tb.line(modelOptions);
        window.tb.add(line);
        this.objects3d[this.object_last_id] = {
            type:'traectory',
            object:line,
            cords:cds.cords
        }
        this.object_last_id++

        modelOptions = this.manager3d.getMeshOptions('tube_2')
        modelOptions.geometry = cds.cords_AMS
        line = window.tb.line(modelOptions);
        window.tb.add(line);
        this.objects3d[this.object_last_id] = {
            type:'trust_intervals',
            object:line,
            cords:cds.cords
        }
        this.object_last_id++
        this.rtl_rendered = true
    }

    showRouteOfmission(missionElements){
        let traectory = []
        for (let missionElement of missionElements){
            let elementData = JSON.parse(missionElement.data)
            if (missionElement.element_id == 2){ //takeOff
                traectory.push(
                    [
                        ...this.objects3d[0].cords
                    ]
                )
                if(elementData.lng != this.objects3d[0].cords[0] && elementData.lat != this.objects3d[0].cords[1]){
                    traectory.push(
                        [
                            this.objects3d[0].cords[0],
                            this.objects3d[0].cords[1],
                            Number(elementData.alt)
                        ]
                    )
                }
                // let geometry = [this.model.coordinates, [this.model.coordinates[0], this.model.coordinates[1], this.elementsCoords[0][2]], this.elementsCoords[0]];
                // let toTakeOffTube = tb.line({
                //     geometry: geometry,
                //     width: 5,
                //     color: '#daa520'
                // });
                // tb.add(toTakeOffTube);
                // let toTakeOffTubeBorder = tb.line({
                //     geometry: geometry,
                //     width: 20,
                //     color: '#E6E6FA',
                //     opacity: 0.5
                // });
                // tb.add(toTakeOffTubeBorder);

                let cords = this.addSphere(
                    [elementData.lng, elementData.lat, Number(elementData.alt)], 
                    takeOff, 
                    "takeoff"
                    )
                traectory.push(cords)
            }else if (missionElement.element_id == 3){ //wayPoint
                let cords = this.addSphere(
                    [elementData.lng, elementData.lat, Number(elementData.alt)], 
                    waypointIcon, 
                    "waypoint"
                    )
                traectory.push(cords)
            }
            else if (missionElement.element_id == 4){ //polygon
                for (let markup of elementData.markup){
                    let cords = this.addSphere(
                        [markup[0], markup[1], Number(elementData.alt)], 
                        waypointIcon, 
                        "polygon"
                        )
                    traectory.push([markup[0], markup[1], Number(elementData.alt)])
                }
                this.addPolygonContour(elementData.conture, Number(elementData.alt))
            }else if (missionElement.element_id == 6){ //land
                let cords = this.addSphere(
                    [elementData.lng, elementData.lat, Number(elementData.alt)], 
                    landIcon, 
                    "land"
                    )
                traectory.push(cords)

                traectory.push([
                    cords[0],
                    cords[1],
                    0
                ])
            }else if (missionElement.element_id == 5){ //RTL
                traectory.push(
                    [
                        this.objects3d[0].cords[0],
                        this.objects3d[0].cords[1],
                        Number(elementData.alt)
                    ]
                )
                traectory.push(
                    [
                        this.objects3d[0].cords[0],
                        this.objects3d[0].cords[1],
                        0
                    ]
                )
                this.rtlUsed = true;
            }
        }
        this.addMissionTraectory(traectory)
        this.addTail()
            // }
        // )
    }



    
    clearTb(){
        for (let index in this.objects3d){
            window.tb.remove(this.objects3d[index].object)
        }
        if (this.objects3d[0]) this.objects3d[0].object.set({}) //следить

        this.objects3d = {};
        this.object_last_id = 0;

        this.modelTail = null;

        this.rtl_rendered = false;
        this.land_rendered = false;

        this.rtlUsed = false;
        this.elementsCoords = [];
        this.gotoLandUsed = false;
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

} 
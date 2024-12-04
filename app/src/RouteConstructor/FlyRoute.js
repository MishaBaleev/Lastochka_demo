import {getIntersectAlt} from "../functions"
import { lineChunk, lineString, lineIntersect, lineSlice, length } from '@turf/turf'

class Edge{
    constructor(id, map, prevMarker, nextMarker){
        this.id = 'middle_edge_'+id;
        this.map = map;
        this.prevMarker = prevMarker;
        this.nextMarker = nextMarker;

        this.cords1 = prevMarker.getLngLat();
        this.cords2 = nextMarker.getLngLat();

        this.style = {
            type:"line",
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            // paint: {
            //     // 'line-color': '#daa520',
            //     'line-width': 3
            // }
        }
        let source = {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': [
                        [this.cords1.lng, this.cords1.lat],
                        [this.cords2.lng, this.cords2.lat],
                    ]
                }
            }
        }
        let data = {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': [
                    [this.cords1.lng, this.cords1.lat],
                    [this.cords2.lng, this.cords2.lat],
                ]
            }
        }
        
        // let layer = {
        //     'id': this.id,
        //     'type': 'line',
        //     'source': this.id,
        //     'layout': this.style.layout,
        //     'paint': this.style.paint
        // }
        this.source=source;
        // this.layer=layer;
        this.data=data;
        this.map.addSource(this.id, source);
        // this.map.addLayer(layer);

        this.s = this.map.getSource(this.id)

        this.dragBeginBoardContainer = (e) => {e.marker = this.prevMarker; e.map = this.map; e.edge = this; this.dragBeginBoard(e)}
        this.prevMarker.on("drag", this.dragBeginBoardContainer)
        this.dragEndBoardContainer = (e) => {e.marker = this.nextMarker; e.map = this.map; e.edge = this; this.dragEndBoard(e)}
        this.nextMarker.on("drag", this.dragEndBoardContainer)
    }
    dragBeginBoard(e){
        let cords1 = e.marker.getLngLat();
        e.edge.data.geometry.coordinates = [
            [cords1.lng, cords1.lat],
            [e.edge.cords2.lng, e.edge.cords2.lat]
        ]
        e.edge.s.setData(e.edge.data)
        e.edge.cords1 = cords1;
    }
    dragEndBoard(e){
        let cords2 = e.marker.getLngLat();
        e.edge.data.geometry.coordinates = [
            [e.edge.cords1.lng, e.edge.cords1.lat],
            [cords2.lng, cords2.lat]
        ]
        e.edge.s.setData(e.edge.data)
        e.edge.cords2 = cords2;
    }
    updateBeginBoard(prevMarker){
        this.prevMarker.off("drag", this.dragBeginBoardContainer)
        this.prevMarker = prevMarker;
        this.cords1 = prevMarker.getLngLat();
        this.prevMarker.on("drag", this.dragBeginBoardContainer)
        this.data.geometry.coordinates = [
            [this.cords1.lng, this.cords1.lat],
            [this.cords2.lng, this.cords2.lat]
        ]
        this.map.getSource(this.id).setData(this.data)
    }
    delete(){
        this.prevMarker.off("drag", this.dragBeginBoardContainer)
        this.nextMarker.off("drag", this.dragEndBoardContainer)
        // this.map.removeLayer(this.id)
        this.map.removeSource(this.id)
    }
}

class RouteNode{
    constructor(params, id, next, prev, map_element_init, route_element_init, extra_params, isMapElement, evt, edge, map){
        this.id = id;
        this.next = next;
        this.prev = prev;
        this.params = {
            ...params,
            // warning:false,
            ...extra_params,
            node:this
        }
        if(map_element_init){
            this.map_element = new map_element_init(evt, map, this.params)//creating of map element
        }
        else{
            this.map_element = null
        }
        this.route_element_init = route_element_init;
        this.isMapElement = isMapElement;
        this.edge = edge;
    }
    setCountMarkers(count){
        return this.map_element.setCountMarkers(count)
    }
    returnTime(){
        if('hold' in this.params){
            return this.params.hold.value
        }
        else return 0
    }
    returnSpeed(){
        if('speed' in this.params){
            return this.params.speed.value
        }
        else return null
    }
    getInnerDistance(){
        if(this.isMapElement){
            return this.map_element.getInnerDistance()
        }
    }
    delete(){
        if(this.isMapElement){
            this.map_element.delete()
        }
    }
    setActive(){
        if(this.isMapElement){
            this.map_element.setActive()
        }
        this.params.active = "active"
        // this.react_component.setActive()
    }
    unsetActive(){
        if(this.isMapElement){
            this.map_element.unsetActive()
        }
        this.params.active = ""
        // this.react_component.unsetActive()
    }
    returnBoards(){
        return this.map_element.getBoardsMarkers()
    }
    returnBeginBoard(){
        let boards = this.map_element.getBoardsMarkers()
        
        return boards[0]
    }
    returnEndBoard(){
        let boards = this.map_element.getBoardsMarkers()
        
        if(boards.length == 1) return boards[0]
        else return boards[1]
    }
};
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
export class FlyRoute{
    constructor(map, setRouteData, setRouteSequence, updateModal, tbManager){
        this.head = null;
        this.tail = null;
        this.last_id = null;
        this.current_node = null;
        this.map = map;
        this.validators = {};
        this.defaultDicts = {}
        this.isRTLUsed = false;
        this.tbManager = tbManager;
        
        this.setRouteData = setRouteData;
        this.setRouteSequence = setRouteSequence;
        this.updateModal = updateModal;
    }
    updateNodeParams(node, data){
        // console.log(data)
        for(let key in data){
            node.params[key] = {...node.params[key], value:data[key]}
        }
        this.setRouteSequence(this.new_getRoute())
    
        // this.setRouteData(this.getRouteDistance())
        // this.setRouteSequence(this.returnFlySequence())
    }
    createDefaultDicts(route_elements, route_parameters_default, elements_list){
        elements_list.map(item => {
            let content = {}
            for(let key of item.keys){
                content[key] = {
                    ...route_parameters_default[route_parameters_default.findIndex((item2) => {if(item2.name==key) return item2})]
                }
            }
            this.defaultDicts[item.name] = {
                module:route_elements[route_elements.findIndex((item1) => {if(item1.name == item.name) return item1})],
                ...content
            }
        })
    }
    updateDefaultDicts(data){
        for(let key in data){
            for(let key1 in this.defaultDicts){
                if(key in this.defaultDicts[key1]){
                    this.defaultDicts[key1][key] = {...this.defaultDicts[key1][key], value:data[key]}
                }
            }
        }
        // this.setRouteData(this.getRouteDistance())
        this.setRouteSequence(this.new_getRoute())
    }
    addValidator(module_name, validator){
        this.validators[module_name] = validator
        // this.validators.push(validator)
    }
    validate(module_name){
        let result = this.validators[module_name](this)
        return result
        // if(result[0] == false) return result
        // else return [true,{}]


        // if(this.validators.length == 0) return [true,{}]
        // else{
        //     for(let validator of this.validators){
        //         let result = validator(this, moduleId)
        //         if(result[0] == false) return result
        //     }
        //     return [true,{}]
        // }
    }
    countingMarkers(){
        let cur_node = this.head;
        let count = 1;
        while(cur_node != null){
            if(cur_node.isMapElement == true){
                count = cur_node.setCountMarkers(count)
            }
            cur_node = cur_node.next
        }
    }
    
    segmentate3DLine(point1, point2, startDistance, distance_of_line, segmentProcent=0) {
        let pwa1 = [
            point1[0],
            point1[1]
        ]
        let pwa2 = [
            point2[0],
            point2[1]
        ]
    
        let interval = 0;
        if(segmentProcent == 0){
            interval = 1/1000
        }
        else{
            interval = distance_of_line/1000*(segmentProcent/100)
        }
        let cords = []
        let alts_cords_ams = []
        let alts_ams = []
        let curDistance = startDistance

        if(distance_of_line <= 30){
            let ams = this.map.queryTerrainElevation(pwa1)
            alts_ams.push({
                x:curDistance,
                y:ams
            })
            alts_cords_ams.push({
                x:curDistance,
                y:ams+point1[2]
            })

            ams = this.map.queryTerrainElevation(pwa2)
            alts_ams.push({
                x:curDistance+distance_of_line,
                y:ams
            })
            alts_cords_ams.push({
                x:curDistance+distance_of_line,
                y:ams+point2[2]
            })
        }
        else{
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
            }, interval).features.map((feature, f_index) => {
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
    
                    let ams = this.map.queryTerrainElevation([...feature.geometry.coordinates[0]])
                    alts_ams.push({
                        x:curDistance,
                        y:ams
                    })
                    alts_cords_ams.push({
                        x:curDistance,
                        y:ams+alt
                    })
                    curDistance += interval*1000
                    cords.push([
                        ...feature.geometry.coordinates[0],
                        alt
                    ])
                    // this.props.manager3D.getAMS(coordArr.at(-1))
                    return 
            })]
        
            let ams = this.map.queryTerrainElevation(pwa2)
            alts_ams.push({
                x:curDistance,
                y:ams
            })
            alts_cords_ams.push({
                x:curDistance,
                y:ams+point2[2]
            })
    
            cords.push(point2)
        }
    
        return {
                cords:cords,
                alts_ams:alts_ams,
                alts_cords_ams:alts_cords_ams
            }
    }
    new_getRoute(){
        let begin = {
                id:null,
                cords:[],
                alt:null
            },
            end = {
                id:null,
                cords:[],
                alt:null
            },
            start_route = {
                id:null,
                cords:[],
                alt:null
            },
            route_sequence = [],
            all_distance = 0,
            all_time = 0,
            all_altitude = [],
            all_altitude_AMS = [],
            current_azimuth = 0,
            current_distance = 0,
            inner_distance = 0,
            cur_node = this.head,
            count = 0,
            route_cords = [];

        while(cur_node){
            route_sequence.push(
                {
                    cmp:cur_node.route_element_init,
                    params:cur_node.params
                }
            )
            // if(cur_node.params.lng && cur_node.params.lat){
            //     if(cur_node.params.lng.value != ""){
            //         route_cords.push([
            //             cur_node.params.lng.value,
            //             cur_node.params.lat.value
            //         ])
            //     }
            //     // console.log(cur_node.params.lng, cur_node.params.lat)
            // }
            if(begin.id == null && cur_node.isMapElement == true){
                begin = {
                    id:cur_node.id,
                    cords:[
                        cur_node.returnBeginBoard().getLngLat(),
                        cur_node.returnEndBoard().getLngLat()
                    ],
                    alt:cur_node.params.alt
                }
                if(count == 0) start_route = {...begin}
                count++
            }
            if(end.id == null && begin.id != null && cur_node.isMapElement == true){
                end = {
                    id:cur_node.id,
                    cords:[
                        cur_node.returnBeginBoard().getLngLat(),
                        cur_node.returnEndBoard().getLngLat()
                    ],
                    alt:cur_node.params.alt
                }
                // route_cords.push(end.cords[1])
                let [azimuth, distance] = getAzimuthDistance(begin.cords[1], end.cords[0])
                // console.log(cur_node)
                if(cur_node.prev === this.current_node){
                    // console.log(azimuth)
                    if(this.current_node == this.head){
                        current_azimuth = "-"
                        current_distance = "-"
                    }
                    else{
                        current_azimuth = azimuth
                        current_distance = distance
                    }
                }
                inner_distance = cur_node.getInnerDistance()
                let inner_time = cur_node.returnTime()
                let current_speed = cur_node.returnSpeed()
                if(current_speed == null) current_speed = this.head.returnSpeed()

                all_time += parseInt(inner_time) + (inner_distance+distance)/parseInt(current_speed)

                if(inner_distance == 0){
                    if(begin.id != end.id){
                        let point1 = [
                            begin.cords[1].lng,
                            begin.cords[1].lat,
                            parseInt(begin.alt.value)
                        ]
                        let point2 = [
                            end.cords[0].lng,
                            end.cords[0].lat,
                            parseInt(end.alt.value)
                        ]
                        let cds = this.segmentate3DLine(point1, point2, all_distance, distance, 10)
                        all_altitude.push(...cds.alts_cords_ams)
                        all_altitude_AMS.push(...cds.alts_ams)
                    }

                    // console.log(end, temp1.cords[0].lng)
                    // console.log(this.map.queryTerrainElevation([
                    //     end.cords[0].lng,
                    //     end.cords[0].lat
                    // ]))
                    // all_altitude.push({
                    //     x:all_distance+distance,
                    //     y:parseInt(end.alt.value)+parseFloat(this.map.queryTerrainElevation([
                    //         end.cords[0].lng,
                    //         end.cords[0].lat
                    //     ]))
                    // })

                    route_cords.push({
                        x:all_distance+distance,
                        cords:end.cords[0]
                    })
                }
                else{
                    // all_altitude.push({
                    //     x:all_distance+distance,
                    //     y:parseInt(end.alt.value)+parseFloat(this.map.queryTerrainElevation([
                    //         end.cords[0].lng,
                    //         end.cords[0].lat
                    //     ]))
                    // })
                    // all_altitude.push({
                    //     x:all_distance+inner_distance+distance,
                    //     y:parseInt(end.alt.value)+parseFloat(this.map.queryTerrainElevation([
                    //         end.cords[0].lng,
                    //         end.cords[0].lat
                    //     ]))
                    // })
                    // from begin to end 0
                    let point1 = [
                        begin.cords[1].lng,
                        begin.cords[1].lat,
                        parseInt(begin.alt.value)
                    ]
                    let point2 = [
                        end.cords[0].lng,
                        end.cords[0].lat,
                        parseInt(end.alt.value)
                    ]
                    let cds = this.segmentate3DLine(point1, point2, all_distance, distance, 10)
                    all_altitude.push(...cds.alts_cords_ams)
                    all_altitude_AMS.push(...cds.alts_ams)

                    if(cur_node.params.markup){
                        let zx3 = all_distance
                        for(let m_i in cur_node.params.markup.value){
                            m_i = parseInt(m_i)
                            if(m_i == 0) continue
                            let zx1 = cur_node.params.markup.value[m_i-1]
                            let zx2 = cur_node.params.markup.value[m_i]
                            let [azimuth_zx, distance_zx] = getAzimuthDistance({
                                lng:zx1[0],
                                lat:zx1[1]
                            }, {
                                lng:zx2[0],
                                lat:zx2[1]
                            })

                            
                            point1 = [
                                zx1[0],
                                zx1[1],
                                parseInt(end.alt.value)
                            ]
                            point2 = [
                                zx2[0],
                                zx2[1],
                                parseInt(end.alt.value)
                            ]

                            let cds = this.segmentate3DLine(point1, point2, zx3, distance_zx, 10)
                            all_altitude.push(...cds.alts_cords_ams)
                            all_altitude_AMS.push(...cds.alts_ams)
                            zx3+=distance_zx
                        }
                    }
                    else{
                        // from end 0 to end 1
                        // segmentate3DLine(point1, point2, startDistance, distance_of_line, segmentProcent=0)
                        point1 = [
                            end.cords[0].lng,
                            end.cords[0].lat,
                            parseInt(end.alt.value)
                        ]
                        point2 = [
                            end.cords[1].lng,
                            end.cords[1].lat,
                            parseInt(end.alt.value)
                        ]
                        cds = this.segmentate3DLine(point1, point2, all_distance+distance, inner_distance, 10)
                        all_altitude.push(...cds.alts_cords_ams)
                        all_altitude_AMS.push(...cds.alts_ams)
                    }



                    route_cords.push({
                        x:all_distance+distance,
                        cords:end.cords[0]
                    })
                    route_cords.push({
                        x:all_distance+inner_distance+distance,
                        cords:end.cords[1]
                    })
                }

                all_distance +=  inner_distance+distance
                inner_distance = 0
                begin = {...end}
                end = {
                    id:null,
                    cords:[]
                }
            }
            cur_node = cur_node.next
        }
        // 
        if(this.tail != null && this.tail.isMapElement == true){
            let last_distance = this.tail.getInnerDistance()
            let last_time = this.tail.returnTime()
            let last_speed = this.tail.returnSpeed()
    
            all_distance += last_distance
            all_time += parseInt(last_time)
            if(last_speed != 0 && last_speed != null) all_time += last_distance/parseInt(last_speed);
        }
        if(this.isRTLUsed){
            let [azimuth, distance] = getAzimuthDistance(begin.cords[1], start_route.cords[0]);
            if(this.tail === this.current_node){
                current_azimuth = azimuth
                current_distance = distance

                
                let point1 = [
                    begin.cords[1].lng,
                    begin.cords[1].lat,
                    parseInt(begin.alt.value)
                ]
                let point2 = [
                    start_route.cords[0].lng,
                    start_route.cords[0].lat,
                    parseInt(start_route.alt.value)
                ]
                let cds = this.segmentate3DLine(point1, point2, all_distance, distance, 10)
                all_altitude.push(...cds.alts_cords_ams)
                all_altitude_AMS.push(...cds.alts_ams)
            }
            if(this.tail.prev === this.current_node && this.tail.prev.isMapElement){
                [azimuth, distance] = getAzimuthDistance(this.tail.prev.returnEndBoard().getLngLat(), start_route.cords[0])
                current_azimuth = azimuth
                current_distance = distance

                
                let point1 = [
                    this.tail.prev.returnEndBoard().getLngLat().lng,
                    this.tail.prev.returnEndBoard().getLngLat().lat,
                    parseInt(this.tail.prev.params.alt.value)
                ]
                let point2 = [
                    start_route.cords[0].lng,
                    start_route.cords[0].lat,
                    parseInt(start_route.alt.value)
                ]
                let cds = this.segmentate3DLine(point1, point2, all_distance, distance, 10)
                all_altitude.push(...cds.alts_cords_ams)
                all_altitude_AMS.push(...cds.alts_ams)
            }
            
            let last_speed = this.tail.returnSpeed()
            all_distance +=  distance
            all_time += distance/parseInt(last_speed)
            // all_altitude.push({
            //     x:all_distance,
            //     y:parseInt(start_route.alt.value)
            // })
            route_cords.push({
                x:all_distance,
                cords:start_route.cords[0]
            })
        }
        this.countingMarkers()
        // 
        // console.log(all_altitude)
        // console.log(all_altitude_AMS)
        return {
            route_sequence:route_sequence,
            route_cords:route_cords,
            route_info:{
                all_distance:all_distance,
                all_time:all_time,
                all_altitude:all_altitude,
                all_altitude_AMS:all_altitude_AMS,
                current_azimuth:current_azimuth,
                current_distance:current_distance
            }
        }
    }
    getRouteDistance(){
        let current_azimuth = 0, 
            current_distance = 0,
            all_distance = 0,
            all_time = 0;
        let cur_node = this.head;
        let count = 0;
        let begin = null;
        let end = null;
        let alt_route = [];
        let AMS_route = [];
        while(cur_node.next != null){
        // console.log(1)
            if(cur_node.isMapElement == true){
                let x1 = cur_node.returnEndBoard().getLngLat()
                if(count == 0) begin = x1
                count += 1
                let next_NodeMapElement = this.findMapElementPos(cur_node, true);
                if(next_NodeMapElement == null){
                    cur_node = cur_node.next
                    continue
                }
                let x2 = next_NodeMapElement.returnBeginBoard().getLngLat()
                end = x2
                let inner_distance = next_NodeMapElement.getInnerDistance()
                let [azimuth, distance] = getAzimuthDistance(x1, x2)

                if(cur_node === this.current_node){
                    current_azimuth = azimuth
                    current_distance = distance
                }

                all_distance +=  inner_distance+distance
                let inner_time = cur_node.returnTime()
                let current_speed = cur_node.returnSpeed()

                if(current_speed == null) current_speed = this.head.returnSpeed()
                
                all_time += parseInt(inner_time) + (inner_distance+distance)/parseInt(current_speed)
            }
            if("alt" in cur_node.next.params){
                // console.log(this.map.queryTerrainElevation([
                //     cur_node.next.params.lng.value,
                //     cur_node.next.params.lat.value
                // ]))
                alt_route.push({
                    x:all_distance,
                    y:parseInt(cur_node.next.params.alt.value)+this.map.queryTerrainElevation([
                        cur_node.next.params.lng.value,
                        cur_node.next.params.lat.value
                    ])
                })
            }
            cur_node = cur_node.next
        }
        if(this.tail != null && this.tail.isMapElement == true){
            let last_distance = this.tail.getInnerDistance()
            let last_time = this.tail.returnTime()
            let last_speed = this.tail.returnSpeed()
    
            all_distance += last_distance
            all_time += parseInt(last_time)
            if(last_speed != 0 && last_speed != null) all_time += last_distance/parseInt(last_speed);
        }
        if(this.isRTLUsed){
            let [azimuth, distance] = getAzimuthDistance(end, begin);
            if(this.tail === this.current_node){
                current_azimuth = azimuth
                current_distance = distance
            }
            if(this.tail.prev === this.current_node && this.tail.prev.isMapElement){
                [azimuth, distance] = getAzimuthDistance(this.tail.prev.returnEndBoard().getLngLat(), begin)
                current_azimuth = azimuth
                current_distance = distance
            }
            
            let last_speed = this.tail.returnSpeed()
            all_distance +=  distance
            all_time += distance/parseInt(last_speed)
        }
        return {
            alt_route:alt_route,
            azimuth:current_azimuth,
            current_distance:current_distance, 
            distance:all_distance, 
            time:all_time
        }
    }
    findType(type){
        let cur_node = this.head;
        while(cur_node != null){
            if(cur_node.react_component == type) return cur_node
            else continue
        }
        return null
    }
    returnFlySequence(){
        let sequence = [];
        let cur_node = this.head;
        while(cur_node != null){
            sequence.push(
                {
                    cmp:cur_node.route_element_init,
                    params:cur_node.params
                }
            )
            cur_node = cur_node.next
        }
        this.countingMarkers()
        return sequence
    }
    findMapElement(direction){
        let cur_node = this.current_node;
        if(direction == true){
            if(this.tail == null) return null
            else{
                cur_node = cur_node.next
                while(cur_node != null){
                    if(cur_node.isMapElement == true){
                        return cur_node
                    }
                    else{
                        cur_node = cur_node.next
                    }
                }
            }
        }
        else{
            if(this.head == null) return null
            else{
                cur_node = cur_node.prev
                while(cur_node != null){
                    if(cur_node.isMapElement == true){
                        return cur_node
                    }
                    else{
                        cur_node = cur_node.prev
                    }
                }
            }
        }
        return null
    }
    findMapElementPos(node, direction){
        let cur_node = node;
        if(direction == true){
            cur_node = cur_node.next
            while(cur_node != null){
                if(cur_node.isMapElement == true) return cur_node
                cur_node = cur_node.next
            }
            return null
        }
        else{
            cur_node = cur_node.prev
            while(cur_node != null){
                if(cur_node.isMapElement == true) return cur_node
                cur_node = cur_node.prev
            }
            return null
        }
    }
    getNewId(){
        return this.last_id+1
    }
    append(moduleId, map_element, react_component, react_component_params, isMapElement, isRTL=false){
        let node;
        if(isRTL){
            this.last_id += 1;
            node = new RouteNode(moduleId, this.last_id, null, this.tail, map_element, react_component, react_component_params, null, isMapElement);
            node.react_component_params.node = node;
            this.current_node.unsetActive()
            this.current_node = node;
            this.current_node.setActive()
            this.tail.next = node;
            this.tail = node;

            this.isRTLUsed = true;
            let takeoff_NodeMapElement = this.findMapElementPos(this.head, true);
            let last_NodeMapElement = this.findMapElementPos(this.tail, false);
            if(takeoff_NodeMapElement && last_NodeMapElement){
                let prevMarker = last_NodeMapElement.returnEndBoard()
                let nextMarker = takeoff_NodeMapElement.returnBeginBoard()
                    
                let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
                node.edge = edge;
            }
        }
        else{
            if(this.head == null){
                this.last_id = 0;
                node = new RouteNode(moduleId, this.last_id, null, null, map_element, react_component, react_component_params, null, isMapElement);
                node.react_component_params.node = node;
                node.setActive()
                this.current_node = node;
                this.head = node;
                this.tail = node;
            }
            else{
                this.last_id += 1;
                node = new RouteNode(moduleId, this.last_id, null, this.tail, map_element, react_component, react_component_params, null, isMapElement);
                node.react_component_params.node = node;
                this.current_node.unsetActive()
                this.current_node = node;
                this.current_node.setActive()
                this.tail.next = node;
                this.tail = node;
                // isMapElement
                if(isMapElement == true){
                    let prevMapElement = this.findMapElement(false)
                    let nextMapElement = this.current_node
                    
                    if(prevMapElement != null && nextMapElement != null){
                        // let prevMarker = prevMapElement.returnBeginBoard()
                        // let nextMarker = nextMapElement.returnEndBoard()
                        let prevMarker = prevMapElement.returnEndBoard()
                        let nextMarker = nextMapElement.returnBeginBoard()
                        
                        let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
                        node.edge = edge;
                    }
                }
            }
        }
        this.setRouteSequence(this.returnFlySequence())
        this.setRouteDistance(this.getRouteDistance())
        return node
   }
   _connectElements(node){
    let prevMapElement = this.findMapElementPos(node, false)
    let nextMapElement = node

    if(prevMapElement != null && nextMapElement != null){
        let prevMarker = prevMapElement.returnEndBoard()
        let nextMarker = nextMapElement.returnBeginBoard()
        
        let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
        node.edge = edge;
    }
   }
   _connectMiddleElements(node, next){
    let prev_NodeMapElement = this.findMapElementPos(node, false);
    let next_NodeMapElement = this.findMapElementPos(node, true);

    if(prev_NodeMapElement != null && next_NodeMapElement != null){
        let prevMarker = prev_NodeMapElement.returnEndBoard()
        let middlePrevMarker = node.returnBeginBoard()
        let middleNextMarker = node.returnEndBoard()
        let nextMarker = next_NodeMapElement.returnBeginBoard()

        next.edge.updateBeginBoard(middleNextMarker)

        let edge = new Edge(this.last_id, this.map, prevMarker, middlePrevMarker)
        node.edge = edge;
    }
    else if(prev_NodeMapElement == null && next_NodeMapElement != null){
        // let prevMarker = prev_NodeMapElement.returnBeginBoard()
        // let nextMarker = next_NodeMapElement.returnEndBoard()
        let prevMarker = prev_NodeMapElement.returnEndBoard()
        let nextMarker = next_NodeMapElement.returnBeginBoard()
        
        let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
        next_NodeMapElement.edge = edge;
    }
    else if(prev_NodeMapElement != null && next_NodeMapElement == null){
        this._connectElements(node)
    }
   }
   _updateRTLEdge(node){
    let middleNextMarker = node.returnEndBoard()
    this.tail.edge.updateBeginBoard(middleNextMarker)
   }
   _appendCommon(module_name, map_element_init, route_element_init, extra_params, isMapElement, evt){
    let node;
    extra_params = {
        ...extra_params,
        route:this,
        active:"active",
        id:this.last_id
    }
    node = new RouteNode(
        this.defaultDicts[module_name],//params, 
        this.last_id,//id, 
        null, null,//next, prev, 
        map_element_init, route_element_init,//map_element_init, route_element_init, 
        extra_params,//extra_params, 
        isMapElement,//isMapElement, 
        evt,//evt, 
        null,//edge
        this.map//map
    )
    if(this.tail == this.current_node){
        if(this.current_node == null){
            node.setActive()
            this.current_node = node;
            this.head = node;
            this.tail = node;
        } 
        else{
            this.current_node.unsetActive()
            this.current_node = node;
            this.current_node.setActive()
            this.tail.next = node;
            node.prev = this.tail
            this.tail = node;
        }
        if(isMapElement == true) this._connectElements(node)
        if(this.isRTLUsed && this.tail != this.head.next) this._updateRTLEdge(node)//check later
    }
    else{
        let prev = this.current_node;
        let next = this.current_node.next;

        prev.next = node;
        node.prev = prev;

        next.prev = node;
        node.next = next; 

        this.current_node.unsetActive()
        this.current_node = node;
        this.current_node.setActive()

        if(this.isRTLUsed && this.tail != this.head.next) this._updateRTLEdge(node)
        if(isMapElement == true) this._connectMiddleElements(node, next)
    }

    //////// добавление сферы и отрисовка соед линий
    if (isMapElement){
        this.tbManager.addSphere(
            [evt.lngLat.lng, evt.lngLat.lat, Number(node.params.alt.value)], 
            node.id
        )
        if (module_name != "Takeoff"){
            this.tbManager.unitSpheres(this)
        }
        // if (this.map.getStyle().layers[1].layout.visibility == "visible"){
        //     this.tbManager.checkCollision(this)
        // }
    }
    ////////

    return node
   }
//    _appendCommon(moduleId, map_element, react_component, react_component_params, isMapElement){
//     let node;
//     if(this.tail == this.current_node){
//         node = new RouteNode(
//             moduleId, 
//             this.last_id, 
//             null, null, 
//             map_element, 
//             react_component, 
//             react_component_params, 
//             null, 
//             isMapElement);
//         node.react_component_params.node = node;
//         if(this.current_node == null){
//             node.setActive()
//             this.current_node = node;
//             this.head = node;
//             this.tail = node;
//         } 
//         else{
//             this.current_node.unsetActive()
//             this.current_node = node;
//             this.current_node.setActive()
//             this.tail.next = node;
//             node.prev = this.tail
//             this.tail = node;
//         }
//         if(isMapElement == true) this._connectElements(node)
//         if(this.isRTLUsed && this.tail != this.head.next) this._updateRTLEdge(node)
//     }
//     else{
//         node = new RouteNode(
//             moduleId, 
//             this.last_id, 
//             null, null, 
//             map_element, 
//             react_component, 
//             react_component_params, 
//             null, 
//             isMapElement);
//         let prev = this.current_node;
//         let next = this.current_node.next;

//         prev.next = node;
//         node.prev = prev;

//         next.prev = node;
//         node.next = next; 

//         this.current_node.unsetActive()
//         this.current_node = node;
//         this.current_node.setActive()

//         if(this.isRTLUsed && this.tail != this.head.next) this._updateRTLEdge(node)
//         if(isMapElement == true) this._connectMiddleElements(node, next)
//     }
//     return node
//    }
//    _appendCommon(module_name, map_element_init, route_element_init, extra_params, isMapElement, evt){
   _appendRTL(module_name, map_element_init, route_element_init, extra_params, isMapElement, evt){
    let node;
    extra_params = {
        ...extra_params,
        route:this,
        active:"active",
        id:this.last_id
    }
    node = new RouteNode(
        this.defaultDicts[module_name],//params, 
        this.last_id,//id, 
        null, this.tail,//next, prev, 
        map_element_init, route_element_init,//map_element_init, route_element_init, 
        extra_params,//extra_params, 
        isMapElement,//isMapElement, 
        evt,//evt, 
        null,//edge
        this.map//map
    )




    // let node;
    // node = new RouteNode(
    //     moduleId, 
    //     this.last_id, 
    //     null, 
    //     this.tail, 
    //     map_element, 
    //     react_component, 
    //     react_component_params, 
    //     null, 
    //     isMapElement);
    // node.react_component_params.node = node;
    this.current_node.unsetActive()
    this.current_node = node;
    this.current_node.setActive()
    this.tail.next = node;
    this.tail = node;
    this.isRTLUsed = true;
    let takeoff_NodeMapElement = this.findMapElementPos(this.head, true);
    let last_NodeMapElement = this.findMapElementPos(this.tail, false);
    if(takeoff_NodeMapElement && last_NodeMapElement){
        let prevMarker = last_NodeMapElement.returnEndBoard()
        let nextMarker = takeoff_NodeMapElement.returnBeginBoard()
            
        let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
        node.edge = edge;
    }
    return node
   }
   _append(module_name, map_element_init, route_element_init, extra_params, isMapElement, evt, isRTL=false){
    this.last_id += 1;
    let node;
    if(isRTL){
        node = this._appendRTL(
            module_name, 
            map_element_init, 
            route_element_init, 
            extra_params, 
            isMapElement, 
            evt)
    }
    else{
        node = this._appendCommon(
            module_name, 
            map_element_init, 
            route_element_init, 
            extra_params, 
            isMapElement, 
            evt
        )
    }
    this.setRouteSequence(this.new_getRoute())
    return node
   }
//    _append(moduleId, map_element, react_component, react_component_params, isMapElement, isRTL=false){
//     this.last_id += 1;
//     let node;
//     if(isRTL){
//         node = this._appendRTL(
//             moduleId, 
//             map_element, 
//             react_component, 
//             react_component_params, 
//             isMapElement)
//     }
//     else{
//         node = this._appendCommon(
//             moduleId, 
//             map_element, 
//             react_component, 
//             react_component_params, 
//             isMapElement)
//     }

//     // this.setRouteSequence(this.returnFlySequence())
//     // this.setRouteDistance(this.getRouteDistance())
//     return node
//    }
   appendAfterCurrent(moduleId, map_element, react_component, react_component_params, isMapElement, isRTL=false){
        let node;
        // if(this.head == null || (this.head != null && this.head.next == null) || this.tail == this.current_node){
        //     node = this.append(map_element, react_component, react_component_params, isMapElement)
        // }
        if(this.head === null || this.current_node === this.tail){
            node = this.append(moduleId, map_element, react_component, react_component_params, isMapElement)
        }
        else{
            this.last_id += 1;
            node = new RouteNode(moduleId, this.last_id, null, null, map_element, react_component, react_component_params, null, isMapElement);
            let prev = this.current_node;
            let next = this.current_node.next;
    
            prev.next = node;
            node.prev = prev;
    
            next.prev = node;
            node.next = next; 

            this.current_node.unsetActive()
            this.current_node = node;
            this.current_node.setActive()

            if(isMapElement == true){
                let prev_NodeMapElement = this.findMapElementPos(node, false);
                let next_NodeMapElement = this.findMapElementPos(node, true);

                if(prev_NodeMapElement != null && next_NodeMapElement != null){
                    // let prevMarker = prev_NodeMapElement.returnBeginBoard()
                    // let middlePrevMarker = node.returnBeginBoard()
                    // let middleNextMarker = node.returnEndBoard()
                    // let nextMarker = next_NodeMapElement.returnEndBoard()

                    let prevMarker = prev_NodeMapElement.returnEndBoard()
                    let middlePrevMarker = node.returnBeginBoard()
                    let middleNextMarker = node.returnEndBoard()
                    let nextMarker = next_NodeMapElement.returnBeginBoard()

                    next.edge.updateBeginBoard(middleNextMarker)

                    let edge = new Edge(this.last_id, this.map, prevMarker, middlePrevMarker)
                    node.edge = edge;
                }
                else if(prev_NodeMapElement == null && next_NodeMapElement != null){
                    // let prevMarker = prev_NodeMapElement.returnBeginBoard()
                    // let nextMarker = next_NodeMapElement.returnEndBoard()
                    let prevMarker = prev_NodeMapElement.returnEndBoard()
                    let nextMarker = next_NodeMapElement.returnBeginBoard()
                    
                    let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
                    next_NodeMapElement.edge = edge;
                }
                if(this.isRTLUsed && this.tail.prev == this.current_node){
                    let middleNextMarker = node.returnEndBoard()
                    this.tail.edge.updateBeginBoard(middleNextMarker)

                    let prevMarker = node.returnBeginBoard()
                    let nextMarker = prev_NodeMapElement.returnEndBoard()

                    let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
                    node.edge = edge;
                }
                // let prevMapElement = this.findMapElement(false)
                // let nextMapElement = this.current_node

                // if(prevMapElement != null && nextMapElement != null){
                //     let prevMarker = prevMapElement.returnBeginBoard()
                //     let nextMarker = nextMapElement.returnEndBoard()
                //     next.edge.updateBeginBoard(nextMarker)

                //     let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
                //     node.edge = edge;
                // }
            }
            // else if(this.isRTLUsed && this.tail.prev == this.current_node){
            //     let takeoff_NodeMapElement = this.findMapElementPos(this.head, true);
            //     let last_NodeMapElement = this.findMapElementPos(this.tail, false);
            //     if(takeoff_NodeMapElement && last_NodeMapElement){
            //         let prevMarker = last_NodeMapElement.returnEndBoard()
            //         let nextMarker = takeoff_NodeMapElement.returnBeginBoard()
                        
            //         let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
            //         node.edge = edge;
            //     }
            // }
            // if(isRTL){ 
            //     this.isRTLUsed = true;
            //     let takeoff_NodeMapElement = this.findMapElementPos(this.head, true);
            //     let last_NodeMapElement = this.findMapElementPos(this.tail, false);
            //     if(takeoff_NodeMapElement && last_NodeMapElement){
            //         let prevMarker = last_NodeMapElement.returnEndBoard()
            //         let nextMarker = takeoff_NodeMapElement.returnBeginBoard()
                        
            //         let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
            //         node.edge = edge;
            //     }
            // }
        }
        this.setRouteSequence(this.returnFlySequence())
        this.setRouteDistance(this.getRouteDistance())
        return node;
   }
   changeIsMapElement(node){
    node.isMapElement = true;
    let prev_NodeMapElement = this.findMapElementPos(node, false);
    let next_NodeMapElement = this.findMapElementPos(node, true);
    let next = node.next;
    if(prev_NodeMapElement != null && next_NodeMapElement != null){
        let prevMarker = prev_NodeMapElement.returnBeginBoard()
        let middlePrevMarker = node.returnBeginBoard()
        let middleNextMarker = node.returnEndBoard()
        let nextMarker = next_NodeMapElement.returnEndBoard()

        if(next) next.edge.updateBeginBoard(middleNextMarker)

        let edge = new Edge(node.id, this.map, prevMarker, middlePrevMarker)
        node.edge = edge;
    }
    else if(prev_NodeMapElement == null && next_NodeMapElement != null){
        let prevMarker = node.returnBeginBoard()
        let nextMarker = next_NodeMapElement.returnEndBoard()
        
        let edge = new Edge(node.id, this.map, prevMarker, nextMarker)
        next_NodeMapElement.edge = edge;
    }
    else if(prev_NodeMapElement != null && next_NodeMapElement == null){
        let prevMarker = prev_NodeMapElement.returnEndBoard()
        let nextMarker = node.returnBeginBoard()
        
        let edge = new Edge(node.id, this.map, prevMarker, nextMarker)
        node.edge = edge;
    }
    if(this.isRTLUsed && this.tail.prev == this.current_node){
        let middleNextMarker = node.returnEndBoard()
        this.tail.edge.updateBeginBoard(middleNextMarker)

        // let prevMarker = node.returnBeginBoard()
        // let nextMarker = prev_NodeMapElement.returnEndBoard()

        // let edge = new Edge(this.last_id, this.map, prevMarker, nextMarker)
        // node.edge = edge;
    }
    this.setRouteSequence(this.new_getRoute())
    
    //tbManager
    for (let point of node.params.conture.value){
        this.tbManager.addSphere(
            [point[0], point[1],  Number(node.params.alt.value)],
            node.id
        )
    }
    // if (this.map.getStyle().layers[1].layout.visibility == "visible"){
    //     this.tbManager.checkCollision(this)
    // }
    this.tbManager.unitSpheres(this)
    //
   }
   setCurrentNode(node){
        this.current_node.unsetActive()
        this.current_node = node;
        this.current_node.setActive()
        // this.setRouteData(this.getRouteDistance())
        // this.setRouteSequence(this.returnFlySequence())
        this.setRouteSequence(this.new_getRoute())
   }
//    setWarningNode(node, value){
//     node.params.warning = value
//     console.log(1)
//    }
   isUsed(module_name){
    let cur_node = this.head;
    while(cur_node != null){
        if(cur_node.params.module.name == module_name) return {flag:"used", node:cur_node}
        cur_node = cur_node.next;
    }
    return {flag:"", node:null}
   }
   deleteAll(){
        let currentNode = this.tail;
        while (currentNode){
            if (currentNode != this.head){
            this.deleteNode(currentNode)
            }
            currentNode = currentNode.prev
        }
   }
   deleteNode(node){
    // this.findMapElementAtPosOfNode(false)
        // let next = this.findMapElementAtPosOfNode(node, true);
        // let prev = this.findMapElementAtPosOfNode(node, false);
        // console.log(node, this.tail)
        if(this.isRTLUsed && node == this.tail){
            node.edge.delete()
            this.isRTLUsed = false
        }
        let next = node.next;
        let prev = node.prev;
        if(next != null){
            next.prev = prev;
        }
        else{
            this.tail = this.tail.prev
        }
        if(prev != null){
            prev.next = next;
            this.current_node.unsetActive()
            this.current_node = prev;
            if(this.current_node)
            this.current_node.setActive()
        }
        else{
            this.head = this.head.next
            this.current_node.unsetActive()
            this.current_node = this.head;
            if(this.current_node)
            this.current_node.setActive()
        }
        if(node.isMapElement == true){
            let prev_NodeMapElement = this.findMapElementPos(node, false);
            let next_NodeMapElement = this.findMapElementPos(node, true);

            if(prev_NodeMapElement != null && next_NodeMapElement != null){
                node.edge.delete()
                let prevMarker = prev_NodeMapElement.returnEndBoard()
                next.edge.updateBeginBoard(prevMarker)
            }
            else if(prev_NodeMapElement === null && next_NodeMapElement != null){
                next_NodeMapElement.edge.delete()
            }
            else if(prev_NodeMapElement != null && next_NodeMapElement === null){
                node.edge.delete()
            }


            // if(prev == null && next!= null ){
            //     if(next.edge != null) next.edge.delete()
            // }
            // if(next == null && node.edge){
            //     node.edge.delete()
            // }
            // if(prev != null && next != null && node.edge){
            //     node.edge.delete()
            //     let prevMarker = prev.edge.returnEndBoard()
            //     next.edge.updateBeginBoard(prevMarker)
            // }
        }
        if(this.isRTLUsed && node.next == this.tail){
            let takeoff_NodeMapElement = this.findMapElementPos(this.head, true);
            let last_NodeMapElement = this.findMapElementPos(this.tail, false);
            if(takeoff_NodeMapElement && last_NodeMapElement){
                let prevMarker = last_NodeMapElement.returnEndBoard()
                let nextMarker = takeoff_NodeMapElement.returnBeginBoard()
                this.tail.edge.updateBeginBoard(prevMarker)
            }
        }
        // if(this.isRTLUsed && node == this.tail.prev){
        //     let takeoff_NodeMapElement = this.findMapElementPos(this.head, true);
        //     let last_NodeMapElement = this.findMapElementPos(this.tail, false);
        //     if(takeoff_NodeMapElement && last_NodeMapElement){
        //         let prevMarker = last_NodeMapElement.returnEndBoard()
        //         let nextMarker = takeoff_NodeMapElement.returnBeginBoard()
        //         this.tail.edge.updateBeginBoard(prevMarker)
        //     }
        // }
        node.delete()
        // this.setRouteSequence(this.returnFlySequence())
        // this.setRouteDistance(this.getRouteDistance())
        if(this.current_node){
            // this.setRouteSequence(this.returnFlySequence())
            // this.setRouteData(this.getRouteDistance())
            this.setRouteSequence(this.new_getRoute())
        }
        // node.map_element.delete();
        // node.react_component.delete();
        // node.data.deleteMapElement();
        return node;
   }
//    getRouteCoordinates(){
//     let current_node = this.head;
//     let coordinates = [];
//     while(current_node != null){
//         coordinates.push([...current_node.data.getCords()])
//         current_node = current_node.next
//     }
//     return coordinates
//    }
}

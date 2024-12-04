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
            paint: {
                'line-color': '#daa520',
                'line-width': 3
            }
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
        
        let layer = {
            'id': this.id,
            'type': 'line',
            'source': this.id,
            'layout': this.style.layout,
            'paint': this.style.paint
        }
        this.source=source;
        this.layer=layer;
        this.data=data;
        this.map.addSource(this.id, source);
        this.map.addLayer(layer);

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
        e.map.getSource(e.edge.id).setData(e.edge.data)
        e.edge.cords1 = cords1;
    }
    dragEndBoard(e){
        let cords2 = e.marker.getLngLat();
        e.edge.data.geometry.coordinates = [
            [e.edge.cords1.lng, e.edge.cords1.lat],
            [cords2.lng, cords2.lat]
        ]
        e.map.getSource(e.edge.id).setData(e.edge.data)
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
        this.map.removeLayer(this.id)
        this.map.removeSource(this.id)
    }
}

export class RouteNode{
    constructor(id, next, prev, map_element, react_component, params, edge, updateRouteSequence, setActive){
        this.updateParam = this.updateParam.bind(this);
        this.setActive = this.setActive.bind(this);


        this.id = id;
        this.next = next;
        this.prev = prev;
        this.map_element = map_element;
        this.react_component = react_component;

        this.edge = edge;
        console.log(params)
        this.updateRouteSequence = updateRouteSequence
        this.setActiveCallback = setActive
        // if(params.module.type != 0){
        //     this.map_element.setUpdateCallback(this.updateParam)
        //     this.map_element.setSetActiveCallback(this.setActive)
        //     this.params = {
        //         ...params, 
        //         updateCallback:this.updateParam, 
        //         setActiveCallback:this.setActive,
        //         id:this.id
        //     }
        // }
        // else{
        //     this.params = {
        //         ...params, 
        //         id:this.id
        //     }
        // }

        this.map_element.setUpdateCallback(this.updateParam)
        this.map_element.setSetActiveCallback(this.setActive)
        this.params = {
            ...params, 
            updateCallback:this.updateParam, 
            setActiveCallback:this.setActive,
            id:this.id
        }
    }
    updateParam(params){
        for(let key in params){
            this.params[key].value = params[key]
        }
        this.updateRouteSequence()
    }
    setActive(){
        if(this.params.active !== "active"){
            this.params.active = "active"
            if(this.map_element && this.params.type != 0){
                this.map_element.setActive()
            }
        }
        this.setActiveCallback(this)
    }
    unsetActive(){
        this.params.active = ""
        if(this.map_element && this.params.type != 0){
            this.map_element.unsetActive()
        }
    }
    getBorders(){
        return this.map_element.getBorders()
    }
    getRouteInfo(){
        return this.map_element.getRouteInfo(this.params)
    }



    setCountMarkers(count){
        return this.map_element.setCountMarkers(count)
    }
    returnTime(){
        let time = this.react_component_params.hold
        if(time != null) return time
        else return 0
    }
    returnSpeed(){
        let speed = this.react_component_params.speed
        return speed
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
    // unsetActive(){
    //     if(this.isMapElement){
    //         this.map_element.unsetActive()
    //     }
    //     this.react_component_params.active = ""
    //     // this.react_component.unsetActive()
    // }
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

import { Threebox } from "threebox-plugin";
import { lineChunk } from "@turf/turf";
export class manager3D{
    constructor(map){
        this.map = map
        this.firstMapScale = this.map.transform.scale
        console.log(window.location.origin)
        this.available_meshes = {
            drone:{
                obj: window.location.origin+'/drone.glb',
                type: 'gltf',
                scale: 0.7,
                rotation: { x: 90, y: 0, z: 0 },
                anchor: 'center',
                // fixedZoom: 10,
                name: 'drone',
                clone: false
            },
            sphere_1:{
                radius: 0.5,
                units:"meters",
                color: '#ff9900',
                adjustment: {x: 0.5, y: 0.5, z: -0.5}
            },
            line_1:{
                width: 5,
                color: '#daa520'
            },
            line_help:{
                width: 5,
                color: "#00ff00"
            },
            tube_1:{
                width: 20,
                color: '#800080',
                opacity: 0.4
            },
            line_2:{
                width: 5,
                color: '#d10303',
            },
            line_3:{
                width: 2,
                color: '#bababa',
            },
            line_4:{
                width: 5,
                color: '#daa520'
            },
            tube_2:{
                width: 20,
                color: '#800080',
                opacity: 0.4
            }
        }

        window.tb = new Threebox(this.map,
            this.map.getCanvas().getContext('webgl'),
            {
                // realSunlight: true, 
                defaultLights: true
            }    
        );

        this.map.addLayer({
            id:"3d-threebox-layer",
            type:"custom",
            renderingMode:"3d",
            onAdd: (map, mbxContext) => {

            },
            render: () => {
                window.tb.update();
            }
        })

        // let modelOptions = {
        //     obj: window.location.origin+'/media/drone/drone.glb',
        //     type: 'glb',
        //     scale: 15,
        //     rotation: { x: 90, y: 0, z: 0 },
        //     anchor: 'center',
        //     fixedZoom: 15,
        //     name: 'drone',
        //     clone: false
        // }
        // tb.loadObj(modelOptions, (model1) => {
        //     // this.available_meshes['drone'] = model1
        //     console.log(model1)
        // })
        this.managers = {}
        
        this.getMeshOptions = this.getMeshOptions.bind(this);
        this.getAMS = this.getAMS.bind(this);
        this.getAMSline = this.getAMSline.bind(this);
        this.changeScale = this.changeScale.bind(this);

        this.map.on('zoom', this.changeScale);
        this.addManager = this.addManager.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }
    getMeshOptions(key){
        if(key in this.available_meshes) return this.available_meshes[key]
        else return null
    }
    getAMS(cords){
        // console.log(this.map.queryTerrainElevation(cords))
        return this.map.queryTerrainElevation(cords)
    }
    getAMSline(traectory){
        let cords = [...lineChunk({
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: traectory.map((c) => {
                        return [c[0], c[1]]
                    })
                },
                properties: {}
            }, 0.005).features.map((feature) => {
            return [
                ...feature.geometry.coordinates[0],
                this.map.queryTerrainElevation(feature.geometry.coordinates[0])
            ]
            })]

        return cords
    }

    // initThreebox(){
    //     this.tb = new Threebox(this.map,
    //         this.map.getCanvas().getContext('webgl'),
    //         { }    
    //     );
    //     window.tb = this.tb;
    //     self = this
    //     this.map.addLayer({
    //         id:"3d-threebox-layer",
    //         type:"custom",
    //         renderingMode:"3d",
    //         onAdd: (map, mbxContext) => {
    //             let modelOptions = {
    //                 obj: 'media/drone/drone.glb',
    //                 type: 'glb',
    //                 scale: 15,
    //                 rotation: { x: 90, y: 0, z: 0 },
    //                 anchor: 'center',
    //                 fixedZoom: 15,
    //                 name: 'drone',
    //                 clone: false
    //             }
    //             tb.loadObj(modelOptions, (model1) => {
    //                 this.available_meshes['drone'] = model1
    //                 console.log(11111111)
    //             })
    //         },
    //         render: () => {
    //             tb.update();
    //         }
    //     })
    // }
    addMesh(key, cords){
        let model = this.available_meshes[key].setCoords(cords);
        window.tb.add(model);
    }
    addManager(manager, key){
        this.managers[key] = manager
    }
    changeMode(mode){
        console.log(this.managers)
        for(let key in this.managers){
            let manager = this.managers[key]
            manager.changeMode(mode)
            manager.changeScale(this.map.getZoom(), this.firstMapScale, this.map.transform.scale)
        }
        this.map.setZoom(this.map.getZoom())
    }
    changeScale(){
        // let manager = this.managers["monitoring"]
        // manager.changeScale(this.map.getZoom(), this.firstMapScale, this.map.transform.scale)
    
        for(let key in this.managers){
            let manager = this.managers[key]
            manager.changeScale(this.map.getZoom(), this.firstMapScale, this.map.transform.scale)
        }
    }
}
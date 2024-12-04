import React from 'react';
import './LayersButton.css';
import layersIcon from './layers_icon.png'
import { connect } from 'react-redux';
import { set_layer } from '../AppSlice';
import axios from 'axios';

function setLayerSource(map, layerId, source, sourceLayer){
  const oldLayers = map.getStyle().layers;
  const layerIndex = oldLayers.findIndex(l => l.id === layerId);
  const layerDef = oldLayers[layerIndex];
  const before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id;
  map.removeLayer(layerId);
  layerDef.source = source;
  if(map.getSource(layerId))map.removeSource(layerId)
  if (sourceLayer) {
      layerDef['source-layer'] = sourceLayer;
  }
  //console.log(map.style.stylesheet.sources)
  map.addLayer(layerDef, before);
}
let is_local = false
class LayersButton extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      active:""
    }
    this.i = 1
    this.onTerrainButtonClick = this.onTerrainButtonClick.bind(this);
    this.onLayersButtonClick = this.onLayersButtonClick.bind(this);
    this.onLayerButtonClick = this.onLayerButtonClick.bind(this);
    this.escapeLayers = this.escapeLayers.bind(this);
  }
  onTerrainButtonClick(e, item){
    e.preventDefault()
    // this.props.setReady()
    // рельеф
    if(item.id == 6){
      if(item.active == "active"){
        this.props.map.setTerrain();
      }
      else{
        this.props.map.setTerrain({ 'source': item.label + "_" + item.id, 'exaggeration': 1 });
      }
    }
    // здания
    else if(item.id == 8){
      if(item.active == "active"){
        this.props.map.setLayoutProperty("add-3d-buildings", 'visibility', 'none');
      }
      else{
        this.props.map.setLayoutProperty("add-3d-buildings", 'visibility', 'visible');
      }
    }
    // разметка лесов
    else if(item.id == 9){
      if(item.active == "active"){
        this.props.map.setLayoutProperty(item.label + "_" + item.id, 'visibility', 'none');
      }
      else{
        this.props.map.setLayoutProperty(item.label + "_" + item.id, 'visibility', 'visible');
      }
    }
    // let self = this
    this.props.map.once('idle', () => {
      this.props.manager3D.changeMode(true)
      // console.log('ended ' + this.i)
      // this.i++
      // // this.props.setReady()
    })


    axios.put('/api/tilesource/'+item.id+"/", {
      id:item.id,
      active:item.active == "active" ? "" : "active"
    })
    .then(response => {
      // //console.log(response)
    })
    .catch(error => {
      // //console.log(error)
    });

    if(item.active == "active") this.props.set_layer({index:item.id, value: ""})
    else this.props.set_layer({index:item.id, value: "active"})

  }
  onLayerButtonClick(e, item){
    e.preventDefault()
    let active_style = this.props.app.layers.filter((item, index) => {if(item.type == "style" && item.active == "active") return item})[0]
    if(active_style.id != item.id){
      let is_local = parseInt(this.props.app.settings.filter((item) => {
        if(item.id == 4) return item
      })[0].value)

      let tiles = []
      if(is_local){
        tiles.push(window.location.origin+"/media/map_cash/"+item.label+"/tile_{x}_{y}_{z}.jpg")
      }
      else{
        tiles = [...item.tiles]
      }

      
      this.props.map.removeLayer("global-tiles-layer")
      this.props.map.removeSource("global")

      this.props.map.addSource("global", {
          "type": "raster",
          "tiles":tiles,
          "tileSize":item.tileSize
      })
      this.props.map.addLayer({
        "id": "global-tiles-layer",
        "type": "raster",
        "source": "global",
        "minzoom": item.minzoom,
        "maxzoom": item.maxzoom
      }, this.props.map.getStyle().layers[0].id)

        // if(is_local){
        //   setLayerSource(
        //     this.props.map, 
        //     "local-tiles-layer", 
        //     {
        //       "id":"local",
        //       "type": "raster",
        //       "minzoom": item.minzoom,
        //       "maxzoom": item.maxzoom,
        //       "tiles":[
        //         window.location.origin+"/media/map_cash/"+item.label+"/tile_{x}_{y}_{z}.jpg"
        //       ],
        //       "tileSize": item.tileSize
        //     }, 
        //     null
        //     )
        // }
        // else{
        //   setLayerSource(
        //     this.props.map, 
        //     "global-tiles-layer", 
        //     {
        //       "id":"global",
        //       "type": "raster",
        //       "minzoom": item.minzoom,
        //       "maxzoom": item.maxzoom,
        //       "tiles":item.tiles,
        //       "tileSize": item.tileSize
        //     }, 
        //     null
        //     )
        // }
        console.log(this.props.map.getStyle().sources)
        // 192.168.4.1

      // let st = {...this.props.style}
      // // this.props.map.getSource(item.label+"_"+item.id).setTiles()
      // st.sources.global.tiles = item.tiles
      // st.sources.local.tiles = ["http://127.0.0.1:8000/media/map_cash/"+item.label+"/tile_{x}_{y}_{z}.jpg"]
  
      // this.props.map.setStyle(st)
      this.props.set_layer({index:active_style.id, value: ""})
      this.props.set_layer({index:item.id, value: "active"})

      axios.put('/api/tilesource/'+active_style.id+"/", {
        id:active_style.id,
        active:""
      })
      .then(response => {
        // //console.log(response)
      })
      .catch(error => {
        // //console.log(error)
      });
      axios.put('/api/tilesource/'+item.id+"/", {
        id:item.id,
        active:"active"
      })
      .then(response => {
        // //console.log(response)
      })
      .catch(error => {
        // //console.log(error)
      });
    }
    // this.props.map.getSource("global").reload()



    // let active_2d = this.props.app.layers.findIndex((item, index) => {if(item.dim_type == "2d" && item.active == "active") return index})
    // let new_active_2d = this.props.app.layers[index]
    // let st = {...this.props.style}
    // st.sources.global.tiles = new_active_2d.tiles
    // st.sources.local.tiles = ["http://127.0.0.1:8000/media/map_cash/"+new_active_2d.label+"/tile_{x}_{y}_{z}.jpg"]
    // //console.log(st.layers)
    // this.props.set_layer({index:active_2d, value: ""})
    // this.props.set_layer({index:index, value: "active"})
    // this.props.map.setStyle(st)
    // axios.put('/api/tilesource/'+id+"/", {
    //   id:id,
    //   active:
    // })
    // .then(response => {
    //   // //console.log(response)
    // })
    // .catch(error => {
    //   // //console.log(error)
    // });
  }
  escapeLayers(e){
    if(e.key == "Escape" && this.state.active == "active"){
      this.setState(state => ({
        active: "",
      }))
    }
  }
  componentDidMount(){
    document.addEventListener('keydown', this.escapeLayers)
  }
  onLayersButtonClick(e){
    // e.preventDefault()
    if(this.state.active == ""){
      this.setState(state => ({
        active: "active",
      }))
    }
    else{
      this.setState(state => ({
        active: "",
      }))
    }
  }
  render(){
    let additStyle = ""
    if (this.props.app.active_page_id == 3){
      additStyle = "additStyle"
      if (!this.props.app.loadedLR) additStyle += " hiddenLayersButton"
    }
    return (
      <div className={'container--layers_buttons ' + this.state.active + ' ' + this.props.hidden + additStyle}>
          <button onClick={this.onLayersButtonClick} type="submit" className="button button--open-layers" id="button--save-mission">
            <img src={layersIcon} className="button__icon--layers" alt=""/>
          </button>
        <div className={'container--layers ' + this.state.active}>
          <div className='styles'>
            <h6 className='heading__list--layers'>Стили</h6>
            <ul className='list--layers'>
              {this.props.app.layers.map((item, index) => {
                  if(item.type == "style"){
                    return  <li key={index} className={'item--layers ' + item.active} onClick={e=>{this.onLayerButtonClick(e, item)}}>
                                {item.name}
                            </li>
                  }
              })}
            </ul>
          </div>
          <div>
            <h6 className='heading__list--layers'>Слои</h6>
            <ul className='list--layers'>
              {this.props.app.layers.map((item, index) => {
                if(item.label == "canopy") return ""
                  if(item.type == "layer"){
                    return  <li key={index} className={'item--layers ' + item.active} onClick={e=>{this.onTerrainButtonClick(e, item)}}>
                                {item.name}
                            </li>
                  }
              })}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'set_layer': (data) => dispatch(set_layer(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LayersButton)


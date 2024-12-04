import React from 'react';
import deleteIcon from "../delete.png"

let BRM_ID = "3"

class PolygonRE extends React.Component{
  constructor(props){
    super(props);
    this.csrf_token = this.props.csrf_token
    this.state = {
      active:"active",
      lat:this.props.params.lat,
      lng:this.props.params.lng,
      conture:[],
      markup:[],
      line_distance:this.props.params.line_distance,
      angle:this.props.params.angle,
      turnaround_distance:this.props.params.turnaround_distance,
      reverse:false
    }





    // this.lineDistanceOnChange = this.lineDistanceOnChange.bind(this)
    // this.angleDistanceOnChange = this.angleDistanceOnChange.bind(this)
    // this.turnaroundDistanceOnChange = this.turnaroundDistanceOnChange.bind(this)
    // this.setReverse = this.setReverse.bind(this)


    // this.speedOnChange = this.speedOnChange.bind(this)
    // this.setCords = this.setCords.bind(this);
    // this.updateRouteDistance = this.updateRouteDistance.bind(this);



    this.onChangeHandler = this.onChangeHandler.bind(this)
    this.onClickHandler = this.onClickHandler.bind(this)
    this.onClickDeleteHandler = this.onClickDeleteHandler.bind(this)
  }
  onChangeHandler(e, key){
    let dict = {}
    if(key === "reverse"){
      if(this.props.params.reverse.value === 1) dict[key] = 0
      else dict[key] = 1
    }
    else{
      dict[key] = e.target.value  
    }

    // if (key == "alt"){
    //   // let coordArr = this.props.tbManager.getCoordArr(this.props.route)
    //   this.props.tbManager.changeAlt(e.target.value, this.props.params.node.id, this.props.route)
    // }

    // if (key == "line_distance" || key == "angle" || key == "turnaround_distance"){
    //   this.props.tbManager.unitSpheres(this.props.route)
    // }

    // dict[key] = e.target.value
    this.props.params.route.updateNodeParams(this.props.params.node, dict)
    this.props.params.node.map_element.updateAngleDistance(dict)
    this.props.tbManager.unitSpheres(this.props.route)
    
    // if(key === "line_distance") this.props.params.node.map_element.updateLineDistance(dict)
    // if(key === "angle") this.props.params.node.map_element.updateAngleDistance(dict)
    // if(key === "turnaround_distance") this.props.params.node.map_element.updateTurnaroundDistance(dict)

    // this.setState(state => (dict))
  }
  onClickHandler(e){
    e.preventDefault()
    if(this.props.params.active === ""){
      this.props.params.route.setCurrentNode(this.props.params.node)
      this.props.tbManager.setCurrentSphere(this.props.params.node.id)
    }
  }
  onClickDeleteHandler(e){
    e.preventDefault()
    this.props.params.route.deleteNode(this.props.params.node)
    this.props.params.button.setState(state => ({
      map_element:null,
      node:null
    }))
    this.props.tbManager.deleteObject(this.props.params.node.id)
    this.props.tbManager.unitSpheres(this.props.params.route)
    this.props.tbManager.checkCollision(this.props.params.route)
  }




  // updateRouteDistance(){
  //   let distanceTime = this.props.params.route.getRouteDistance()
  //   this.props.params.route.setRouteDistance(distanceTime)
  // }
  // lineDistanceOnChange(e){
  //   let val = e.target.value;
  //   if(!this.props.params.map_element.updateLineDistance(val)) return
  //   this.setState(state => ({
  //     line_distance:val,
  //   }))
  //   this.props.params.route.setRouteSequence(this.props.params.route.returnFlySequence())
  //   this.props.params.route.setRouteDistance(this.props.params.route.getRouteDistance())
  // }
  // angleDistanceOnChange(e){
  //   let val = e.target.value;
  //   if(!this.props.params.map_element.updateAngleDistance(val)) return
  //   this.setState(state => ({
  //     angle:val,
  //   }))
  //   this.props.params.route.setRouteSequence(this.props.params.route.returnFlySequence())
  //   this.props.params.route.setRouteDistance(this.props.params.route.getRouteDistance())
  // }
  // turnaroundDistanceOnChange(e){
  //   let val = e.target.value;
  //   this.props.params.map_element.updateTurnaroundDistance(val)
  //   this.setState(state => ({
  //     turnaround_distance:val,
  //   }))
  //   this.props.params.route.setRouteSequence(this.props.params.route.returnFlySequence())
  //   this.props.params.route.setRouteDistance(this.props.params.route.getRouteDistance())
  // }
  // setReverse(){
  //   if(this.state.reverse){
  //     this.props.params.map_element.updateReverse(false)
  //     this.setState(state => ({
  //       reverse:false,
  //     }))
  //   }
  //   else{
  //     this.props.params.map_element.updateReverse(true)
  //     this.setState(state => ({
  //       reverse:true,
  //     }))
  //   }
  // }
  // speedOnChange(e){
  //   let speed = e.target.value;
  //   this.props.params.node.react_component_params.speed = speed;
  //   this.updateRouteDistance()
  //   this.props.params.route.setRouteSequence(this.props.params.route.returnFlySequence())
  //   this.props.params.route.setRouteDistance(this.props.params.route.getRouteDistance())
  // }
  // setCords(cords){
  //   if(this.props.params.active === ""){
  //     this.props.params.route.setCurrentNode(this.props.params.node)
  //   }
  //   this.setState(state => ({
  //     conture:JSON.stringify(cords.conture),
  //     markup:JSON.stringify(cords.markup)
  //   }));
  // }
  // updateRouteDistance(){
  //   let distanceTime = this.props.params.route.getRouteDistance()
  //   this.props.params.route.setRouteDistance(distanceTime)
  // }
  render(){
    // this.props.params.map_element.setDragCallback(this.updateRouteDistance)
    // this.props.params.map_element.setCallback(this.setCords)
    return (
      <div className="container--selector" id={"task"+this.props.params.id}>
        <div className={"selector "+this.props.params.active}>
          <a onClick={(e) => this.onClickHandler(e)} className='heading--task' href={"task"+this.props.params.id}>
            <h6>Облет полигона</h6>
          </a>
          <a onClick={this.onClickDeleteHandler} className="button button--delete_task" href=""><img width="22px" height="auto"  src={deleteIcon} className="icon--delete icons"/></a>
        </div>
        <div className={'container--selected_item '+this.props.params.active}>
          <div className="item--selected">
            
            <div className='container__field--fly_sequence'>
              <label>Высота</label>
              <div className="container__input--fly_sequence complex meters">
                <input className="input--fly_sequence--complex1" 
                  onChange={(e) => {this.onChangeHandler(e, 'alt')}}
                  type="range" 
                  value={this.props.params.alt.value}
                  min={this.props.params.alt.min} 
                  max={this.props.params.alt.max} 
                  name={this.props.params.id+"_"+this.props.params.alt.name} 
                  id={this.props.params.id+"_"+this.props.params.alt.name} />
                  
                <input className="input--fly_sequence--complex2"
                  onChange={(e) => {this.onChangeHandler(e, 'alt')}}
                  type="number" 
                  step={1}
                  value={this.props.params.alt.value}
                  min={this.props.params.alt.min} 
                  max={this.props.params.alt.max} 
                  name={this.props.params.id+"_"+this.props.params.alt.name} 
                  id={this.props.params.id+"_"+this.props.params.alt.name} />
                <span className="input--fly_sequence--span">м</span>
              </div>
            </div>

            <div className='container__field--fly_sequence'>
              <label>Расстояние между траекториями</label>
              <div className="container__input--fly_sequence complex meters">
                <input className="input--fly_sequence--complex1" 
                  onChange={(e) => {this.onChangeHandler(e, 'line_distance')}}
                  type="range" 
                  value={this.props.params.line_distance.value}
                  min={this.props.params.line_distance.min} 
                  max={this.props.params.line_distance.max} 
                  name={this.props.params.id+"_"+this.props.params.line_distance.name} 
                  id={this.props.params.id+"_"+this.props.params.line_distance.name} />
                  
                <input className="input--fly_sequence--complex2"
                  onChange={(e) => {this.onChangeHandler(e, 'line_distance')}}
                  type="number" 
                  step={1}
                  value={this.props.params.line_distance.value}
                  min={this.props.params.line_distance.min} 
                  max={this.props.params.line_distance.max} 
                  name={this.props.params.id+"_"+this.props.params.line_distance.name} 
                  id={this.props.params.id+"_"+this.props.params.line_distance.name} />
                <span className="input--fly_sequence--span">м</span>

              </div>
            </div>

            <div className='container__field--fly_sequence'>
              <label>Угол построения траекторий</label>
              <div className="container__input--fly_sequence complex degrees">
                <input className="input--fly_sequence--complex1" 
                  onChange={(e) => {this.onChangeHandler(e, 'angle')}}
                  type="range" 
                  value={this.props.params.angle.value}
                  min={this.props.params.angle.min} 
                  max={this.props.params.angle.max} 
                  name={this.props.params.id+"_"+this.props.params.angle.name} 
                  id={this.props.params.id+"_"+this.props.params.angle.name} />

                <input className="input--fly_sequence--complex2" 
                  onChange={(e) => {this.onChangeHandler(e, 'angle')}}
                  type="number"  
                  step={1}
                  value={this.props.params.angle.value}
                  min={this.props.params.angle.min} 
                  max={this.props.params.angle.max} 
                  name={this.props.params.id+"_"+this.props.params.angle.name} 
                  id={this.props.params.id+"_"+this.props.params.angle.name} />
                <span className="input--fly_sequence--span">°</span>
              </div>
            </div>

            <div className='container__field--fly_sequence'>
              <label>Выход траекторий за область полигона</label>
              <div className="container__input--fly_sequence complex meters">
                <input className="input--fly_sequence--complex1"
                  onChange={(e) => {this.onChangeHandler(e, 'turnaround_distance')}}
                  type="range"
                  value={this.props.params.turnaround_distance.value}
                  min={this.props.params.turnaround_distance.min} 
                  max={this.props.params.turnaround_distance.max} 
                  name={this.props.params.id+"_"+this.props.params.turnaround_distance.name} 
                  id={this.props.params.id+"_"+this.props.params.turnaround_distance.name} />

                <input className="input--fly_sequence--complex2"
                  onChange={(e) => {this.onChangeHandler(e, 'turnaround_distance')}}
                  type="number"  
                  step={1}
                  value={this.props.params.turnaround_distance.value}
                  min={this.props.params.turnaround_distance.min} 
                  max={this.props.params.turnaround_distance.max} 
                  name={this.props.params.id+"_"+this.props.params.turnaround_distance.name} 
                  id={this.props.params.id+"_"+this.props.params.turnaround_distance.name} />
                <span className="input--fly_sequence--span">м</span>
              </div>
            </div>
            
            <div className='container__field--fly_sequence'>
              <label>Скорость</label>
              <div className="container__input--fly_sequence complex ms">
                <input className="input--fly_sequence--complex1"
                  onChange={(e) => {this.onChangeHandler(e, 'speed')}}
                  type="range"
                  value={this.props.params.speed.value}
                  min={this.props.params.speed.min} 
                  max={this.props.params.speed.max} 
                  name={this.props.params.id+"_"+this.props.params.speed.name} 
                  id={this.props.params.id+"_"+this.props.params.speed.name} />

                <input className='input--fly_sequence--complex2' 
                  onChange={(e) => {this.onChangeHandler(e, 'speed')}}
                  type="number"   
                  step={1}
                  value={this.props.params.speed.value}
                  min={this.props.params.speed.min} 
                  max={this.props.params.speed.max} 

                  name={this.props.params.id+"_"+this.props.params.speed.name} 
                  id={this.props.params.id+"_"+this.props.params.speed.name} />
                <span className="input--fly_sequence--span">м/c</span>
              </div>
            </div>

            <div className="container__field--fly_sequence with_checkbox">
              <label>"Изменить точку входа"</label>
              <input className='input--fly_sequence'
                onChange={(e) => {this.onChangeHandler(e, 'reverse')}}
                type="checkbox" 
                checked={this.props.params.reverse.value === 1 ? "checked" : ""}
                // defaultValue={"Изменить точку входа"} 

                name={this.props.params.id+"_"+this.props.params.reverse.name} 
                id={this.props.params.id+"_"+this.props.params.reverse.name} />
            </div>
            

            {/* <div className='container__field--fly_sequence'>
              <label className="label--hidden">Координаты контура</label>
              <div className="container__input--fly_sequence uncomplex">
                <input 
                  type="hidden" 
                  defaultValue={this.state.markup}

                  name={BRM_ID+"_"+this.props.params.id+"_conture"} 
                  id={BRM_ID+"_"+this.props.params.id+"_conture"}/>
              </div>
              <label className="label--hidden">Координаты траектории</label>
              <div className="container__input--fly_sequence uncomplex">
                <input 
                  type="hidden"  
                  defaultValue={this.state.conture}

                  name={BRM_ID+"_"+this.props.params.id+"_markup"} 
                  id={BRM_ID+"_"+this.props.params.id+"_markup"}/>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    );
  }
}
export default PolygonRE;


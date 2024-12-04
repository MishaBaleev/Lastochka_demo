import React from 'react';
import deleteIcon from "../delete.png"


class LandRE extends React.Component{
  constructor(props){
    super(props);
    this.csrf_token = this.props.csrf_token
    this.state = {
      active:"active",
      lat:this.props.params.lat,
      lng:this.props.params.lng
    }
    // this.map_element = this.props.map_element;
    // this.setCords = this.setCords.bind(this);
    // this.updateRouteDistance = this.updateRouteDistance.bind(this);

    
    this.onChangeHandler = this.onChangeHandler.bind(this)
    this.onClickHandler = this.onClickHandler.bind(this)
    this.onClickDeleteHandler = this.onClickDeleteHandler.bind(this)
  }
  // setCords(cords){
  //   if(this.props.params.active === ""){
  //     this.props.params.route.setCurrentNode(this.props.params.node)
  //   }
  //   this.setState(state => ({
  //     lat:cords.lat,
  //     lng:cords.lng
  //   }));
  // }
  // updateRouteDistance(){
  //   let distanceTime = this.props.params.route.getRouteDistance()
  //   this.props.params.route.setRouteDistance(distanceTime)
  // }


  
  onChangeHandler(e, key){
    let dict = {}
    dict[key] = e.target.value
    this.props.params.route.updateNodeParams(this.props.params.node, dict)
    if (key == "alt"){
      // let coordArr = this.props.tbManager.getCoordArr(this.props.route)
      this.props.tbManager.changeAlt(e.target.value, this.props.params.node.id, this.props.route)
      this.props.tbManager.checkCollision(this.props.route)
    }
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
    // this.props.params.button.setState(state => ({
    //   used: ""
    // }));
    this.props.params.route.deleteNode(this.props.params.node)
    this.props.tbManager.deleteObject(this.props.params.node.id)
    this.props.tbManager.unitSpheres(this.props.params.route)
    this.props.tbManager.checkCollision(this.props.params.route)
  }
  render(){
    return (
      <div className="container--selector" id={"task"+this.props.params.id}>
        <div className={"selector "+this.props.params.active}>
          <a onClick={(e) => this.onClickHandler(e)} className='heading--task' href={"task"+this.props.params.id}>
            <h6>Точка посадки</h6>
          </a>
          <a onClick={this.onClickDeleteHandler} className="button button--delete_task" href="">
            <img width="22px" height="auto" src={deleteIcon} className="icon--delete icons"/>
          </a>
        </div>
        <div className={'container__item--selected '+this.props.params.active}>
          <div className="item--selected">

            <div className='container__field--fly_sequence'>
              <label>Высота взлета</label>
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
              <label>Отклонение</label>
              <div className="container__input--fly_sequence complex meters">
                <input className="input--fly_sequence--complex1" 
                  onChange={(e) => {this.onChangeHandler(e, 'yaw')}}
                  type="range" 
                  value={this.props.params.yaw.value}
                  min={this.props.params.yaw.min} 
                  max={this.props.params.yaw.max} 
                  name={this.props.params.id+"_"+this.props.params.yaw.name} 
                  id={this.props.params.id+"_"+this.props.params.yaw.name} />
                  
                <input className="input--fly_sequence--complex2"
                  onChange={(e) => {this.onChangeHandler(e, 'yaw')}}
                  type="number" 
                  step={1}
                  value={this.props.params.yaw.value}
                  min={this.props.params.yaw.min} 
                  max={this.props.params.yaw.max} 
                  name={this.props.params.id+"_"+this.props.params.yaw.name} 
                  id={this.props.params.id+"_"+this.props.params.yaw.name} />
                <span className="input--fly_sequence--span">°</span>
              </div>
            </div>
            <div className='container__field--fly_sequence'>
              <label className="label--hidden">Долгота</label>
              <div className="container__input--fly_sequence uncomplex">
                <input 
                  type="hidden"  
                  defaultValue={this.props.params.lng.value}

                  name={this.props.params.id+"_"+this.props.params.lng.name} 
                  id={this.props.params.id+"_"+this.props.params.lng.name} />
              </div>
              <label className="label--hidden">Широта</label>
              <div className="container__input--fly_sequence uncomplex">
                <input 
                  type="hidden" 
                  defaultValue={this.props.params.lat.value}

                  name={this.props.params.id+"_"+this.props.params.lat.name} 
                  id={this.props.params.id+"_"+this.props.params.lat.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default LandRE;


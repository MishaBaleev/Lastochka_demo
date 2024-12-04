import React from 'react';

class MissionStartRE extends React.Component  {
  constructor(props){
    super(props);
    this.onClickHandler = this.onClickHandler.bind(this)
    this.onChangeHandler = this.onChangeHandler.bind(this)
  }
  onClickHandler(e){
    e.preventDefault()
    if(this.props.params.active === ""){
      this.props.params.route.setCurrentNode(this.props.params.node)
    }
  }
  onChangeHandler(e, key){
    let dict = {}
    dict[key] = e.target.value
    this.props.params.route.updateDefaultDicts(dict)
    this.props.params.route.updateNodeParams(this.props.params.node, dict)
  }
  render(){
    return (
      <div className="container--selector" id="start">
        <div className={"selector "+this.props.params.active}>
          <a onClick={(e) => this.onClickHandler(e)} className='task__heading' href="start">
            <h6>Стартовые параметры</h6>
          </a>
        </div>
        <div className={'container__item--selected '+this.props.params.active}>
          <div className="item--selected">

            <div className='container__field--fly_sequence'>
              <label>Высота полета</label>
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
              <label>Скорость полета</label>
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
          </div>
        </div>
      </div>
    );
  }
}

export default MissionStartRE;


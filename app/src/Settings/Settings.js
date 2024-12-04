import React from 'react';
import './Settings.css';
import axios from 'axios';
import { connect } from 'react-redux';
import { update_setting, toggle_page_block } from '../AppSlice';
import delete_icon1 from "./img/delete_icon.png"

class Settings extends React.Component  {
  constructor(props){
    super(props);
    this.state = {
      container_selector:"",
      settings:[],
      active_helps: true,
      sources: [],
      base_sources: []
    }

    this.source_field = ""
    this.last_source_id = 0

    this.handlerClick = this.handlerClick.bind(this);
    this.inputOnChange = this.inputOnChange.bind(this);
    this.saveSettings = this.saveSettings.bind(this);
    this.helpCheckBoxOnChange = this.helpCheckBoxOnChange.bind(this)
    this.getBaseSources = this.getBaseSources.bind(this)
    this.addSource = this.addSource.bind(this)
    this.removeSource = this.removeSource.bind(this)
  }
  handlerClick(e){
    e.preventDefault()
    this.props.change_page(this.props.id)
  }
  addSource(){
    if (this.source_field != ""){
      let sources_ = this.state.sources
      sources_.push({
        id: this.last_source_id,
        name: "Пользовательский",
        source: this.source_field
      })
      this.last_source_id++
      this.setState(state => ({
        sources: sources_
      }))
      let e = {
        target: {
          value: JSON.stringify(sources_),
          type: "text"
        }
      }
      this.inputOnChange(e, 5)
    }
  }
  removeSource(id){
    let result_arr = []
    this.state.sources.forEach((item, index) => {
      if (item.id != id){
        result_arr.push(item)
      }
    })
    this.setState(state => ({
      sources: result_arr
    }))
    let e = {
      target: {
        value: JSON.stringify(result_arr),
        type: "text"
      }
    }
    this.inputOnChange(e, 5)
  }
  inputOnChange(e, counter){
    let settings = [...this.state.settings]
    let index = settings.findIndex(i=>{if(i.id == counter) return i})
    let obj1 = settings[index]
    let obj = {}
   
    if(e.target.type == "checkbox"){
      let v = e.target.checked === true ? "1" : "0"
      obj = {...obj1, value:v}
    }
    else{
      obj = {...obj1, value:e.target.value}
    }
    settings[index] = obj
    this.setState(state => ({
      settings: [...settings]
    }), () => {console.log(this.state.settings)});
    this.props.toggle_page_block({
      'is_page_blocked':true,
      'name':"Настройки изменены",
      'description':"Настройки были изменены, но изменения не сохранены. Продолжить без сохранения?"
    })
  }
  saveSettings(e){
    this.state.settings.map((i) =>{
      this.props.update_setting({
        'index':i.id,
        'value':i.value
      })
    })
    setTimeout(() => {
      axios.put('/api/settings/', this.props.app.settings)
      .then(response => {
        this.setState(state => ({
          container_selector: "success"
        }));
        this.props.mapManager.updateStyle(
          this.props.app.layers,
          this.props.app.settings
        )
        setTimeout(() => {
          this.setState(state => ({
            container_selector: ""
          }));
        }, 2000);
      })
      .catch(error => {
        console.log(error)
        this.setState(state => ({
          container_selector: "error"
        }));
        setTimeout(() => {
          this.setState(state => ({
            container_selector: ""
          }));
        }, 2000);
      });
      this.props.toggle_page_block({
        'is_page_blocked':false,
        'name':"",
        'description':""
      })
    }, 100);
  }

  getBaseSources(){
    let base_layers = this.props.app.layers 
    let result_sources = []
    base_layers.forEach(item => {
      let name_ = item.name
      let layer_tiles = item.tiles 
      layer_tiles.forEach(item => {
        result_sources.push({
          id: this.last_source_id,
          name: name_,
          source: item
        })
        this.last_source_id++
      })
    })
    this.setState(state => ({
      base_sources: result_sources
    }))
  }

  getUserSources(arr){
    let result_arr = []
    arr.forEach((item, index) => {
      result_arr.push({
        id: index,
        name: item.name,
        source: item.source
      })
      this.last_source_id = index+1
    }) 
    return result_arr 
  }
  componentDidMount(){
    this.setState(state => ({
      settings: this.props.app.settings,
      active_helps: this.props.app.active_help?"checked":"",
      sources: this.getUserSources(JSON.parse(this.props.app.settings[4].value))
    }));
    this.getBaseSources()
  }

  helpCheckBoxOnChange(e){
    this.setState(state => ({
      active_helps: this.state.active_helps?false:true
    }))
    this.props.set_active_help(this.props.app.active_help?false:true)
  }

  render(){
    return (
      <div className={'container--inner ' + this.state.container_selector}>
        <ul className='list--settingsgroups'>
          {
            this.props.app.group_of_settings.map((item, index) => {
              let content = this.state.settings.filter((item1, index1) => {
                if(item1.group == item.id){
                  return item1
                }
              }).map((item1, index1) => {
                let rendered_item1
                if(item1.type == "number"){
                  rendered_item1 = <li className='item--setting' key={index1}>
                                    <div className='wrapper__label--setting'>
                                      <label>{item1.name}</label>
                                      <p>{item1.tip}</p>
                                    </div>
                                    <div className='wrapper__input--setting number'>
                                      <input onChange={(e) => this.inputOnChange(e, item1.id)} type='range' max={item1.max} min={item1.min} value={item1.value} 
                                      // step={(item1.max-item1.min)/100}
                                      step={1}
                                      />
                                      <div>
                                        <input onChange={(e) => this.inputOnChange(e, item1.id)} type={item1.type} max={item1.max} min={item1.min} value={item1.value}/>
                                        <span>{item1.dim}</span>
                                      </div>
                                    </div>
                                  </li>
                } 
                if(item1.type == "checkbox"){
                  rendered_item1 = <li className='item--setting' key={index1}>
                                    <div className='wrapper__label--setting'>
                                      <label>{item1.name}</label>
                                      <p>{item1.tip}</p>
                                    </div>
                                    <div className='wrapper__input--setting checkbox'>
                                      {/* {item1.value === "1" ? <input onChange={(e) => this.inputOnChange(e, item1.id)} type='checkbox' checked/> : <input onChange={(e) => this.inputOnChange(e, item1.id)} type='checkbox'/>} */}
                                      <input onChange={(e) => this.inputOnChange(e, item1.id)} type='checkbox' checked={item1.value === "1" ? "checked" : ""}/>
                                      <span>{item1.dim}</span>
                                      {/* <div>
                                        <input onChange={(e) => this.inputOnChange(e, item1.id)} type={item1.type} max={item1.max} min={item1.min} value={item1.value}/>
                                        <span>{item1.dim}</span>
                                      </div> */}
                                    </div>
                                  </li>
                }
                if (item1.type == "text"){ //только для источников
                  rendered_item1 = <li className='item--setting sources' key={index1}>
                    <div>
                      <div className='wrapper__label--setting'>
                        <label>{item1.name}</label>
                        <p>{item1.tip}</p>
                      </div>
                      <div className='wrapper__label--setting text'>
                        <span>{item1.dim}</span>
                        <input type="text" onChange={(e) => {this.source_field=e.target.value}}/>
                        <button className='add' onClick={this.addSource}><span>+</span></button>
                      </div>
                    </div>
                    <div className='sources-list'>
                      <label>Добавленные источники</label>
                      <ul>
                          {this.state.base_sources.map((item, index) => {
                            return <li key={index}>
                              <span className='source_item' title={item.source}>
                                Название -{" "}
                                {item.name + ", источник - " + item.source}
                              </span>
                            </li>
                          })}
                          {this.state.sources.map((item, index) => {
                            return <li key={index}>
                              <span className='source_item' title={item.source}>
                                Название -{" "}
                                {item.name + ", источник - " + item.source}
                              
                              </span>
                              {item.is_base==true?"":
                                <button className='remove' onClick={() => {this.removeSource(item.id)}}>
                                  <img src={delete_icon1}/>
                                </button>
                              }
                            </li> 
                          })}
                        </ul>
                    </div>
                  </li>
                }
                return rendered_item1
              })
              return <li className='item--settingsgroups' key={index}>
                <div className='container--group'>
                  <h3 className='heading--group'>{item.name}</h3>
                  <p className='desc--group'>{item.description}</p>
                </div>
                <div className='container--settings'>
                  <ul className='list--settings'>
                    {content}
                  </ul>
                </div>
              </li>
            })
          }

          {/* {groups.map((item, index) => {
            let content = [];
            for(let c = 0; c < grouped[item.id].length; c++){
              console.log(grouped[item.id][c])
              content.push(
                <li key={c}>
                  <label>{grouped[item.id][c].name}</label>
                  <p>{grouped[item.id][c].tip}</p>
                  <input type={grouped[item.id][c].type} defaultValue={grouped[item.id][c].value}/>
                </li>
              )
            }
            return <li key={index}>
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <ul>{content}</ul>
                    </li>
          })} */}
        </ul>
        <button onClick={this.saveSettings} className='button--save--settings'>Сохранить</button>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return state;
}
const mapDispatchToProps =  (dispatch) => {
  return {
    'update_setting': (data) => dispatch(update_setting(data)),
    'toggle_page_block': (data) => dispatch(toggle_page_block(data)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Settings)


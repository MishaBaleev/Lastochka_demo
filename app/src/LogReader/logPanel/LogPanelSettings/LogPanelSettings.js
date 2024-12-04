import React from "react";
import "./LogPanelSettings.css"
import CancelIcon from "./cancel.png";
import axios from 'axios';
import { connect } from 'react-redux';
import { append_ulgKeys, update_modal_message } from "../../../AppSlice";

class LogPanelSettings extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            chart_params:[],
            parameter_key:0,
            paramter_key_ulg:0,
            human_readable:"",
        }
        this.ulg_keys = []
        this.changeSelect = this.changeSelect.bind(this);
        this.deleteParam = this.deleteParam.bind(this);
        this.addParam = this.addParam.bind(this);
        this.humanReadableOnChange = this.humanReadableOnChange.bind(this);
        this.getColor = this.getColor.bind(this);
        this.changeSelectULG = this.changeSelectULG.bind(this)
    }
    changeSelect(e){
        this.setState(state => ({
            parameter_key: parseInt(e.target.value)
        }))
    }
    addParam(e){
        e.preventDefault()
        let is_added = this.state.chart_params.findIndex((item) => item.key == this.props.numeric_keys[this.state.parameter_key])
        if(is_added == -1 || this.state.chart_params.length == 0){
            let chart_key
            if (this.props.log_type == "ulg"){
                chart_key = this.props.numeric_keys[this.state.parameter_key]+"."+this.props.frame_keys[this.props.numeric_keys[this.state.parameter_key]][this.state.paramter_key_ulg]
                this.ulg_keys.push(chart_key)
                this.props.append_ulgKeys(chart_key)
            }else{
                chart_key = this.props.numeric_keys[this.state.parameter_key]
            }
            let chart_params = [...this.state.chart_params]
            chart_params.push({
                key:chart_key,
                label:this.state.human_readable == "" ? this.props.numeric_keys[this.state.parameter_key] : this.state.human_readable,
                chart:true,
                state:false,
                type:"single",
                default: "No data",
            })
            this.setState(state => ({
                chart_params:chart_params
            }))
        }
    }
    humanReadableOnChange(e){
        this.setState(state => ({
            human_readable: e.target.value
        }))
    }
    deleteParam(e, index){
        e.preventDefault()
        let chart_params = [...this.state.chart_params]
        chart_params.splice(index, 1)
        this.setState(state => ({
            chart_params:chart_params
        }))
    }
    addChart(e){
        e.preventDefault()
        if (this.props.log_type == 'ulg'){
            console.log(this.ulg_keys)
            if (this.ulg_keys.length != 0){
                let data = new FormData()
                data.append('file_name', this.props.log_name)
                data.append('keys', JSON.stringify(this.ulg_keys))
                axios.post('/api/getULGData/', data).then(response => {
                    // console.log(response)
                    let chart = {
                        type: 'group',
                        label: 'Группа параметров',
                        chart: true,
                        state: false,
                        chart_params: Object.keys(response.data.arrs).map((item, index) => {
                            let chart_item = {
                                key: this.ulg_keys[index],
                                label: this.state.human_readable==''?this.ulg_keys[index]:this.state.human_readable,
                                chart: true,
                                state: false,
                                type: 'single',
                                default: 'Нет данных',
                                data: response.data.arrs[item]
                            }
                            return chart_item
                        })
                    }
                    this.props.addCustomChart(chart)
                    this.setState(state => ({
                        chart_params:[],
                    }))
                    this.ulg_keys = []
                })
            }else{
                this.props.update_modal_message({
                    active: true,
                    heading: "Ошибка при добавлении параметра",
                    message: "Необходимо выбрать параметр",
                  })
            }
        }else{
            if(this.state.chart_params.length == 0) return
            let chart
            if(this.state.chart_params.length == 1){
                chart = this.state.chart_params[0]
            }
            else{
                chart = {
                    type:"group",
                    label:"Группа параметров",
                    chart:true,
                    state:false,
                    chart_params:[...this.state.chart_params]
                }
            }
            this.props.addCustomChart(chart)
            this.setState(state => ({
                chart_params:[]
            }))
        }
    }
    changeSelectULG(e){
        this.setState(state => ({
            paramter_key_ulg: e.target.value
        }))
    }
    getColor(){
      let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
      let is_used = this.state.chart_params.findIndex((item) => item.color == color)
      while(is_used != -1){
        let color = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0")
        is_used = this.state.chart_params.findIndex((item) => item.color == color)
      }
      return color
    }
    render(){
        return(
            <div className={"logreader__container--logpanel--settings "+this.props.active}>
                <h3>Настройки вывода параметров</h3>
                <form>
                    {
                        this.state.chart_params.length == 0 ? <p>Список параметров для отображения пуст. Начните добавлять их с помощью панели ниже</p> :
                        <ul className="logpanel__list--params">
                            {this.state.chart_params.map((item, index) => {
                                return <li className="logpanel__item--params" key={index}>
                                            <p className="logpanel__label--params">{item.key}({item.label})</p>
                                            <button className="logpanel__button--delete" onClick={(e) => {this.deleteParam(e, index)}}>x</button>
                                        </li>
                            })}
                        </ul>
                    }
                    <div className="logpanel--settings__wrapper">
                        <div className="logpanel--settings__params__container">
                            <div className="logpanel--settings__param__container">
                                <label htmlFor="logpanel--settings__param-select">{this.props.log_type=="ulg"?"Ключ группы параметров":"Ключ параметра"}</label>
                                <select id="logpanel--settings__param-select" onChange={this.changeSelect} value={this.state.parameter_key}>
                                    {this.props.numeric_keys.map((item, index) => {
                                        return <option value={index} key={index}>
                                            {item}
                                        </option>
                                    })}
                                </select>
                            </div>
                            {this.props.log_type=="ulg"?
                                <div className="logpanel--settings__param__container">
                                    <label htmlFor="logpanel--settings__param-select">Ключ параметра</label>
                                    <select id="logpanel--settings__param-select" onChange={this.changeSelectULG} value={this.state.paramter_key_ulg}>
                                        {this.props.frame_keys[this.props.numeric_keys[this.state.parameter_key]].map((item, index) => {
                                            return <option value={index} key={index}>
                                                {item}
                                            </option>
                                        })}
                                    </select>
                                </div>
                            :""}
                            <div className="logpanel--settings__param__container">
                                <label htmlFor="logpanel--settings__param-select">Человекочитаемое название</label>
                                <input type="text" value={this.state.human_readable == "" ? this.props.numeric_keys[this.state.parameter_key] : this.state.human_readable} onChange={this.humanReadableOnChange}/>
                            </div>
                        </div>
                        <button className="logpanel__button--add" onClick={(e) => {this.addParam(e)}}>+</button>
                    </div>
                    <button className="logpanel__button--add--chart" onClick={(e) => {this.addChart(e)}}>Добавить график</button>

                </form>
                <span onClick={this.props.switchSettings} className="button button__modal--close">
                    <img src={CancelIcon} className="icons" alt=""/>
                </span>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return state;
}
const mapDispatchToProps =  (dispatch) => {
return {
  "update_modal_message": (data) => dispatch(update_modal_message(data)),
//   "set_loadedLR": (data) => dispatch(set_loadedLR(data)),
//   'change_page': (id) => dispatch(change_page(id))
    'append_ulgKeys': (data) => dispatch(append_ulgKeys(data))
}
}
  
  export default connect(mapStateToProps, mapDispatchToProps)(LogPanelSettings)

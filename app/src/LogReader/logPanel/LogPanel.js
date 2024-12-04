import React from "react";
import './LogPanel.css';
import { update_modal_message } from "../../AppSlice";
import { connect } from 'react-redux';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Decimation, Filler} from 'chart.js';
// import { Line } from 'react-chartjs-2';
import LogPanelSettings from "./LogPanelSettings/LogPanelSettings";
import ChartBlock from "./ChartBlock";
import settings_img from "../imgs/settings.png"
import delete_img from "./imgs/delete.png"

import common_state from "./imgs/common_state.png"
import kinematics_img from "./imgs/kinematics.png"
import nav_sys_img from "./imgs/nav_sys.png"
import network_img from "./imgs/network.png"
import custom_img from "./imgs/custom.png"
import save_ulg from "./imgs/saveULG.png"

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Decimation,
    Filler
  );
function flatten(obj, suffix, ans) {
    for (var x in obj) {
        var key;
        if (suffix != '')
          key = suffix + '.' + x;
        else
          key = x;
      if (typeof obj[x] === 'object') {
        flatten(obj[x], key, ans);
      } else {
        ans[key] = obj[x];
      }
    }
}

let a = {
    "id": 0,
    "datetime": "26/04/2023 00:10:33:808960",
    "time_usec": "91356000",
    "navigation_system": "GPS",
    "landed_state": "TAKING_OFF",
    "flight_mode": "TAKEOFF",
    "mission_file_name": "mission_on_board",
    "mission_pause": "False",
    "mission_start": "False",
    "mission_current_point": "0",
    "mission_total_point": "8",
    "in_air": "True",
    "alg_manual_inputs_1": "0.0",
    "alg_manual_inputs_2": "0.0",
    "alg_manual_inputs_3": "0.0",
    "alg_manual_inputs_4": "0.0",
    "current_air_speed": "0.0",
    "heading_deg": "359.91",
    "odometry_pos_body_x": "0.005515276920050383",
    "odometry_pos_body_y": "-0.02273678220808506",
    "odometry_pos_body_z": "-0.019499022513628006",
    "odometry_vel_body_x": "-0.0019436755683273077",
    "odometry_vel_body_y": "-0.00648154690861702",
    "odometry_vel_body_z": "-0.0014431164599955082",
    "odometry_ang_vel_body_roll": "0.007929768413305283",
    "odometry_ang_vel_body_pitch": "-0.002203895477578044",
    "odometry_ang_vel_body_yaw": "0.005951139144599438",
    "pitch_deg": "0.0037721877451986074",
    "roll_deg": "-0.029684007167816162",
    "yaw_deg": "-0.038301981985569",
    "position_lat_deg": "47.3977419",
    "position_lon_deg": "8.545593799999999",
    "position_abs_alt": "488.0080261230469",
    "position_real_alt": "0.0010000000474974513",
    "precalculated_lat": "0.0",
    "precalculated_lon": "0.0",
    "gps_raw_lat_deg": "47.3977419",
    "gps_raw_lon_deg": "8.545594099999999",
    "gps_raw_abs_alt": "488.00201416015625",
    "gps_raw_velocity": "0.0",
    "gps_num_sat": "10",
    "gps_hdop": "0.0",
    "gps_vdop": "0.0",
    "battery_percent": "98",
    "status_type": "INFO",
    "status_text": "Takeoff detected",
    "tcp": "1",
    "udp": "0",
    "arp": "1",
    "icmp": "0",
    "other": "0",
    "tcp_total": "46",
    "udp_total": "16",
    "arp_total": "19",
    "icmp_total": "0",
    "other_total": "5",
    "status_code_attack": "0",
    "state.trusted_point.longtitude": 8.545593999999852,
    "state.trusted_point.latitude": 47.397735443207424,
    "state.trusted_point.altitude": 3,
    "state.m0": 0,
    "state.is_verticle": 0,
    "state.is_edge": 2,
    "state.parameters_state.satelites.m1": 0,
    "state.parameters_state.satelites.m2": 1,
    "state.parameters_state.satelites.m3": 1,
    "state.parameters_state.satelites.state": 0,
    "state.parameters_state.satelites.state_label": 0,
    "state.parameters_state.battery_percent.m1": 1,
    "state.parameters_state.battery_percent.m2": 1,
    "state.parameters_state.battery_percent.m3": 1,
    "state.parameters_state.battery_percent.state": 1,
    "state.parameters_state.battery_percent.state_label": 1,
    "state.parameters_state.cords.m1": 0,
    "state.parameters_state.cords.m2": 1,
    "state.parameters_state.cords.m3": 1,
    "state.parameters_state.cords.state": 0,
    "state.parameters_state.cords.state_label": 0,
    "state.parameters_state.altitude.m1": 0,
    "state.parameters_state.altitude.m2": 1,
    "state.parameters_state.altitude.m3": 1,
    "state.parameters_state.altitude.state": 0,
    "state.parameters_state.altitude.state_label": 0,
    "state.parameters_state.speed.m1": 0,
    "state.parameters_state.speed.m2": 1,
    "state.parameters_state.speed.m3": 1,
    "state.parameters_state.speed.state": 0,
    "state.parameters_state.speed.state_label": 0,
    "state.state.state": 0,
    "state.state.state_label": 0,
    "desicion": "0",
    "prev_lng": 8.545593999999852,
    "prev_lat": 47.397735443207424,
    "prev_speed": 1,
    "prev_alt": 3,
    "next_lng": 8.545593999999852,
    "next_lat": 47.397735443207424,
    "next_speed": 1,
    "next_alt": 3
}
let __params_groups = [
    {
        id:0,
        key:"common",
        label:"Общие",
        img:common_state,
        params:[
            {
                type:"single",
                key:"status_text",
                label:"Статус",
                chart:false,
                state:false,
                default: "Нет данных"
            },
            {
                type:"single",
                key:"battery_percent",
                label:"Заряд батареи",
                chart:true,
                state:true,
                state_keys:"state.parameters_state.battery_percent.state_label",
                default: "Нет данных",
                m1:"state.parameters_state.battery_percent.m1",
                m2:"state.parameters_state.battery_percent.m2",
                m3:"state.parameters_state.battery_percent.m3",
                show_m1:true,
                show_m2:true,
                state_type:"common"
            },
            {
                type:"single",
                key:"status_code_attack",
                label:"Деструктивное влияние",
                chart:false,
                values:{
                    0 : "Отсутствует",
                    1 : "Аномалия gps",
                    2 : "Опасная территория",
                    3 : "Погодная аномалия",
                    4 : "Критическая аномалия",
                    5 : "Атака tcp flood",
                    6 : "Атака udp flood",
                    7 : "Подмена gps",
                    8 : "Глушение gps"
                },
                state:false,
                default: "Нет данных"
            },
            {
                type:"single",
                key:"state.state.state_label",
                label:"Общее состояние",
                chart:false,
                values:{
                    0:"Нестабильное",
                    1:"Стабильное",
                    2:"Неопределенное",
                },
                state:true,
                state_keys:"state.state.state_label",
                default: "Нет данных",
                state_type:"common"
            },
            {
                type:"single",
                key:"navigation_system",
                label:"Навигационная система",
                chart:false,
                state:false,
                default: "Нет данных"
            },
            {
                type:"single",
                key:"flight_mode",
                label:"Режим полета",
                chart:false,
                state:true,
                state_keys:"state.m0",
                m1:"state.is_edge",
                m2:"state.is_verticle",
                default: "Нет данных",
                state_type:"flight_controller"
            },
            {
                type:"single",
                key:"landed_state",
                label:"Состояние относительно земли",
                chart:false,
                state:true,
                state_keys:"state.m0",
                m1:"state.is_edge",
                m2:"state.is_verticle",
                default: "Нет данных",
                state_type:"flight_controller"
            },

        ]
    },
    {
        id:1,
        key:"kinematics",
        label:"Кинематика",
        img:kinematics_img,
        params:[
            {
                type:"single",
                key:"position_lon_deg",
                label:"Широта",
                chart:true,
                state:true,
                state_keys:"state.parameters_state.cords.state_label",
                default: "No data",
                m1:"state.parameters_state.cords.m1",
                m2:"state.parameters_state.cords.m2",
                m3:"state.parameters_state.cords.m3",
                show_m1:true,
                show_m2:true,
                state_type:"common"
            },
            {
                type:"single",
                key:"position_lat_deg",
                label:"Долгота",
                chart:true,
                state:true,
                state_keys:"state.parameters_state.cords.state_label",
                default: "No data",
                m1:"state.parameters_state.cords.m1",
                m2:"state.parameters_state.cords.m2",
                m3:"state.parameters_state.cords.m3",
                show_m1:true,
                show_m2:true,
                state_type:"common"
            },
            {
                type:"single",
                key:"position_real_alt",
                label:"Высота",
                chart:true,
                state:true,
                state_keys:"state.parameters_state.altitude.state_label",
                default: "Нет данных",
                m1:"state.parameters_state.altitude.m1",
                m2:"state.parameters_state.altitude.m2",
                m3:"state.parameters_state.altitude.m3",
                show_m1:true,
                show_m2:true,
                state_type:"common"
            },
            // {
            //     type:"group",
            //     label:"Углы наклона",
            //     chart:true,
            //     state:false,
            //     chart_params:[
            //         {
            //             type:"single",
            //             key:"roll_deg",
            //             label:"Крен",
            //             chart:true,
            //             state:false,
            //         },
            //         {
            //             type:"single",
            //             key:"pitch_deg",
            //             label:"Тангаж",
            //             chart:true,
            //             state:false,
            //         },
            //         {
            //             type:"single",
            //             key:"yaw_deg",
            //             label:"Рыскание",
            //             chart:true,
            //             state:false,
            //         },
            //     ]
            // },
            {
                type:"single",
                key:"gps_raw_velocity",
                label:"Скорость (GPS)",
                chart:true,
                state:true,
                state_keys:"state.parameters_state.speed.state_label",
                default: "Нет данных",
                m1:"state.parameters_state.speed.m1",
                m2:"state.parameters_state.speed.m2",
                m3:"state.parameters_state.speed.m3",
                show_m1:true,
                show_m2:true,
                state_type:"common"
            },
        ]
    },
    {
        id:2,
        key:"nav_sys",
        label:"Навигация",
        img:nav_sys_img,
        params:[
            {
                type:"single",
                key:"navigation_system",
                label:"Навигационная система",
                state:false
            },
            {
                type:"single",
                key:"gps_num_sat",
                label:"Кол-во спутников",
                chart:true,
                state:true,
                state_keys:"state.parameters_state.satelites.state_label",
                default: "Нет данных",
                m1:"state.parameters_state.satelites.m1",
                m2:"state.parameters_state.satelites.m2",
                m3:"state.parameters_state.satelites.m3",
                show_m1:true,
                show_m2:true,
                state_type:"common"
            },
        ]
    },
    {
        id:3,
        key:"network",
        label:"Сеть",
        img:network_img,
        params:[
            {
                type:"group",
                label:"Пакеты",
                chart:true,
                state:false,
                chart_params:[
                    {
                        type:"single",
                        key:"tcp_total",
                        label:"По TCP",
                        chart:true,
                        state:false,
                    },
                    {
                        type:"single",
                        key:"udp_total",
                        label:"По UDP",
                        chart:true,
                        state:false,
                    },
                    {
                        type:"single",
                        key:"arp_total",
                        label:"По ARP",
                        chart:true,
                        state:false,
                    },
                    {
                        type:"single",
                        key:"icmp_total",
                        label:"По ICMP",
                        chart:true,
                        state:false,
                    },
                ]
            },
        ]
    },
    {
        id:4,
        key:"custom",
        label:"Кастомные",
        img:custom_img,
        params:[]
    }
]

class LogPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: "active",
            logNumber: 0,
            isPause: true,
            speedValue: 1,
            logValue: 0,
            settings_active:"inactive",
            custom_charts:[],
            active_groups:[0,1]
        };
        this.custom_chart_id = 0;
        this.switchLogsPanelActive = this.switchLogsPanelActive.bind(this);
        this.getReasonsState = this.getReasonsState.bind(this)
        this.getFlightControllerReasons = this.getFlightControllerReasons.bind(this);
        this.checkStateStructure = this.checkStateStructure.bind(this);
        this.switchSettings = this.switchSettings.bind(this);
        this.addCustomChart = this.addCustomChart.bind(this);
        this.deleteCustomChart = this.deleteCustomChart.bind(this);
        this.setGroup = this.setGroup.bind(this);
        this.getContent = this.getContent.bind(this);
        this.attacks = {
            0 : "Отсутствует",
            1 : "Аномалия gps",
            2 : "Опасная территория",
            3 : "Погодная аномалия",
            4 : "Критическая аномалия",
            5 : "Атака tcp flood",
            6 : "Атака udp flood",
            7 : "Подмена gps",
            8 : "Глушение gps"
        };
        this.states = {
            0:"Нестабильное",
            1:"Стабильное",
            2:"Неопределенное",
        }
        this.verticles = {
            0:"Режим отсутствует в графе переходов",
            1:"",
        }
        this.edges = {
            0:"Переход отсутствует в графе переходов",
            1:"",
            2:"",
        }
        this.metric1_action = {
            0:"Выход из допустимых границ",
            1:"",
        }
        this.metric2_action = {
            0:"Некорректный рост",
            1:"",
        }
        this.metric3_action = {
            0:"Неправильное направление изменения",
            1:"",
        }
        this.colors = {
            0:"#d10303",
            1:"#3a9d3a"
        }
    }
    setGroup(e, index, block_id){
        e.preventDefault()
        let active_groups = [...this.state.active_groups]
        active_groups[block_id] = index
        this.setState(state => ({
            active_groups: active_groups
        }));
    }
    getContent(params, data){
        let content = []
        params.map((parameter, index) => {
            let cur_str = ""
            if(data[parameter.key] !== undefined){
                if(parameter.values){
                    if(parameter.values[data[parameter.key]] !== undefined){
                        cur_str = parameter.values[data[parameter.key]]
                    }
                    else{
                        cur_str = data[parameter.key]
                    }
                }
                else{
                    cur_str = data[parameter.key]
                }
            }
            else cur_str = parameter.default

            if(params.length > 1) content.push(parameter.label + ': ' + cur_str)
            else content.push(cur_str)
        })
        return content
    }
    addCustomChart(chart_params){
        let custom_charts = [...this.state.custom_charts]
        chart_params.id = this.custom_chart_id
        // console.log(chart_params)
        __params_groups.at(-1)['params'].push(chart_params)
        // console.log(chart_params)
        custom_charts.push({
            id:this.custom_chart_id,
            chart_params:chart_params
        })
        this.custom_chart_id+=1
        this.setState(state => ({
            custom_charts: custom_charts
        }));
    }
    deleteCustomChart(e, id){
        e.preventDefault()
        let custom_charts = [...this.state.custom_charts]
        let index = custom_charts.findIndex(item1 => item1.id == id)
        __params_groups.at(-1)['params'].splice(index, 1)
        custom_charts.splice(index, 1)
        this.setState(state => ({
            custom_charts: custom_charts
        }));
    }
    switchSettings(e){
        e.preventDefault()
        this.setState(state => ({
            settings_active: state.settings_active === "inactive" ? "active" : "inactive"
        }));
    }
    switchLogsPanelActive(e){
        e.preventDefault();
        if (this.state.active == "inactive" || this.state.active == ""){
            this.setState(state => ({
                active: "active"
            }));
        }else{
            this.setState(state => ({
                active: "inactive"
            }));
        };
    }
    checkStateStructure(state, keys){
        if({}.constructor == state.constructor){
            let cur_dict = {...state}
            // console.log(keys)
            // for(key of keys)
            for(let i = 0; i < keys.length; i++){
                let key = keys[i]
                // console.log(key)
                if(key in cur_dict){
                    if({}.constructor == cur_dict[key].constructor){
                        cur_dict = {...cur_dict[key]}
                        continue
                    }
                    else{
                        return [true, cur_dict[key]]
                    }
                }
                else return [false, ""]
            }

        }
        else return [false, ""]
    }
    getReasonsState(key){
        let reason = "Причин"
        if (this.props.data.state && this.checkStateStructure(this.props.data.state, ["parameters_state", key, "m1"]) 
                && this.checkStateStructure(this.props.data.state, ["parameters_state", key, "m2"])){


            if(this.props.data.state.parameters_state[key].m1 == 0 && this.props.data.state.parameters_state[key].m2 == 0){
                reason += "ы: " + this.metric1_action[this.props.data.state.parameters_state[key].m1] + ", " + this.metric2_action[this.props.data.state.parameters_state[key].m2]
            }
            else if(this.props.data.state.parameters_state[key].m1 == 0){
                reason += "а: " + this.metric1_action[this.props.data.state.parameters_state[key].m1]
            }
            else if(this.props.data.state.parameters_state[key].m2 == 0){
                reason += "а: " + this.metric2_action[this.props.data.state.parameters_state[key].m2]
            }
            if(this.props.data.state.parameters_state[key].m1 != 0 && this.props.data.state.parameters_state[key].m2 != 0) return ""
            else return reason
        }else{
            return ""
        }
    }
    getFlightControllerReasons(){
        let reason = "Причин"
        if (this.props.data.state && this.checkStateStructure(this.props.data.state, ["is_verticle", ]) && this.checkStateStructure(this.props.data.state, ["is_verticle", ]) && this.checkStateStructure(this.props.data.state, ["m0", ])){
            if(this.props.data.state.is_edge == 0 && this.props.data.state.is_edge == 0){
                reason += "ы: неожиданный режим и переход нелегитимен"
            }
            else if(this.props.data.state.is_verticle == 0){
                reason += "а: неожиданный режим"
            }
            else if(this.props.data.state.is_edge == 0){
                reason += "а: переход нелегитимен"
            }
            if(this.props.data.state.m0 != 0) return ""
            else return reason
        }else{
            return ""
        }
    }
    checkData(data){
        if (data){
            return data
        }else{
            return "--"
        }
    }
    getBatteryView(str){
        let percents = parseInt(str)
        return Math.floor(percents/10)
    }
    validateLog(data){
        let message = ""
        let result = true
        if (data.status_text.substring(0, 8) == "[logger]"){
            result = false
            message += "Поле 'Статус' отсутствует в данном логе. "
        }
        if (!data.state){
            result = false
            message += "Поля состояния БПЛА отсутсвуют в данном логе. "
        }
        if (!(data.pitch_deg && data.roll_deg && data.heading_deg)){
            result = false
            message += "Поля углов БПЛА отсутсвуют в данном логе."
        }
        return {
            result: result,
            message: message
        }
    }
    componentDidMount(){
        let valRes = this.validateLog(this.props.data)
        if (valRes.result == false){
            this.props.update_modal_message({
                active: true,
                heading: "Проблема с файлом лога.",
                message: valRes.message,
            })
            setTimeout(() => {
                this.props.update_modal_message({
                    active: false,
                    heading: "",
                    message: "",
                })
            }, 2000);
        }
    }
    render(){
        // let destructView = (this.props.data.status_code_attack==0)?"OK":"Danger"
        // let stateView = this.props.data.precalculation_accept?(this.props.precalculation_accept == true ? (this.props.data.state.state.state_label ? "OK":"Danger") : "OK"):"Danger"
        let date = this.props.data.datetime.slice(0, 10)
        let data = {}
        flatten(this.props.data, "", data)
        // console.log(data)
        let labels = this.props.charts_slice.map((item) => {
            return item.datetime.split(" ")[1].slice(0,11)
        })
        let numeric_keys = []
        for(let index = 0; index < this.props.frame_keys.length; index++){
            let item = this.props.frame_keys[index]
            if(item in this.props.charts_slice[0]){
                let a = this.props.charts_slice[0][item].toString().match(/^-?\d*(\.\d+)?$/)
                a = parseFloat(a)
                if(!isNaN(a) && item != "id"){
                    numeric_keys.push(item)
                }
            }
        }
        numeric_keys = this.props.log_type=="ulg"?Object.keys(this.props.frame_keys):numeric_keys
        // console.log(data)
        return(
            <div>
                <section className={"section--logs "+this.state.active}>
                    {this.state.settings_active == "active" ? 
                    <LogPanelSettings
                        active={this.state.active}
                        frame_keys={this.props.frame_keys}
                        numeric_keys={numeric_keys}
                        example_frame={this.props.charts_slice[0]}
                        switchSettings={this.switchSettings}
                        addCustomChart={this.addCustomChart}
                        log_type={this.props.log_type}
                        log_name={this.props.log_name}
                    /> : ""}
                    <section>
                        <ul className="logpanel__list--groups">
                            {__params_groups.map((item, index) => {
                                return <li className={"logpanel__item--groups " + (this.state.active_groups.findIndex((item1) => item1 == index) != -1 ? "active" : "inactive")} key={index}>
                                            <div>
                                                <img className="logpanel__img--groups" src={item.img} width={25} height={25}/>
                                            </div>
                                            <div className="logpanel__label--groups">
                                                <span>{item.label}</span>
                                            </div>
                                            <div className="logpanel__label--groups__blocks">
                                                <span onClick={(e) => {this.setGroup(e, index, 0)}}>1</span>
                                                <span onClick={(e) => {this.setGroup(e, index, 1)}}>2</span>
                                            </div>
                                        </li>
                            })}
                            {this.props.log_type=='ulg'?
                                <li className="logpanel__item--groups" onClick={this.props.saveULGData}>
                                    <div>
                                        <img className="logpanel__img--groups ulg" src={save_ulg} width={25} height={25}/>
                                    </div>
                                </li>
                            :''}
                        </ul>
                    </section>
                    <button onClick={this.switchLogsPanelActive} className={"button--logs "+this.state.active}></button>
                    <div className="logs--blocks">
                        <h1 className="main--title">Лог "{this.props.log_name.substring(0, 30)+"..."}" {date}</h1>
                        <button onClick={this.switchSettings} className={"logreader__button--settings "+this.state.settings_active}>
                            <img src={settings_img} width={40} height={40}/>
                        </button>
                        <section>
                            {
                                this.state.active_groups.map((group_id,index) => {
                                    return <ul className="logreader__groups__list" key={index}>
                                                <li className="logs--list--item">
                                                    <h4 className="logreader__groups__heading--main">{__params_groups[group_id].label}</h4>
                                                </li>
                                                {__params_groups[group_id].params.map((parameter, index1) => {
                                                    // this.getReasonsState("cords")
                                                        let content = []
                                                        let chart = ""
                                                        let chart_m1 = ""
                                                        let chart_m2 = ""
                                                        let state_label = ""
                                                        let m1 = ""
                                                        let m2 = ""
                                                        let m3 = ""
                                                        let reasons = []
                                                        let reason = ""
                                                        let params = []
                                                        // state.parameters_state.altitude.m1

                                                        if(parameter['state'] !== undefined && data[parameter.state_keys] !== undefined){
                                                            state_label = data[parameter.state_keys] ? "OK" : "Danger"

                                                            if(parameter['m1'] !== undefined && data[parameter['m1']] !== undefined){
                                                                m1 = parameter['state_type'] == "common" ? this.metric1_action[data[parameter['m1']]] : this.edges[data[parameter['m1']]]
                                                                if(m1 != "") reasons.push(m1)
                                                            }
                                                            if(parameter['m2'] !== undefined && data[parameter['m2']] !== undefined){
                                                                m2 = parameter['state_type'] == "common" ? this.metric2_action[data[parameter['m2']]] : this.edges[data[parameter['m2']]]
                                                                if(m2 != "") reasons.push(m2)
                                                            }
                                                            if(parameter['m3'] !== undefined && data[parameter['m3']] !== undefined){
                                                                m3 = parameter['state_type'] == "common" ? this.metric3_action[data[parameter['m3']]] : ""
                                                                if(m3 != "") reasons.push(m3)
                                                            }
                                                            reason = reasons.length != 0 ? <p className="item--description coords">{"Причины состояния: " + reasons.join(", ")}</p> : ""
                                                        }

                                                        if(parameter.type == "single"){
                                                            params.push(parameter)
                                                            if(data[parameter.key] !== undefined){
                                                                if(parameter.values){
                                                                    if(parameter.values[data[parameter.key]] !== undefined){
                                                                        content = parameter.values[data[parameter.key]]
                                                                    }
                                                                    else{
                                                                        content = 'Интепретация не найдена, значение - "' + data[parameter.key] + '"'
                                                                    }
                                                                }
                                                                else{
                                                                    content = data[parameter.key]
                                                                }
                                                            }
                                                            else content = parameter.default
                                                        }
                                                        else{
                                                            params = [...parameter.chart_params]
                                                        }
                                                        content = this.getContent(params, data)
                                                        // console.log(content)

                                                        if(parameter.chart){
                                                            let params = []
                                                            if(parameter.type == "single" && data[parameter.key] !== undefined){
                                                                params.push(parameter)
                                                                // console.log(labels)
                                                                // console.log(this.props.charts_slice)
                                                                // console.log(params)
                                                                chart = <ChartBlock 
                                                                            labels={labels}
                                                                            m1_used={parameter.show_m1 !== undefined ? true : false}
                                                                            m2_used={parameter.show_m2 !== undefined ? true : false}
                                                                            charts_slice={this.props.charts_slice}
                                                                            params={params}
                                                                            log_type={this.props.log_type}
                                                                            current_counter={this.props.current_counter}
                                                                            />
                                                            }
                                                            else if(parameter.type == "group"){
                                                                params = [...parameter.chart_params]
                                                                chart = <ChartBlock 
                                                                            labels={labels}
                                                                            charts_slice={this.props.charts_slice}
                                                                            params={params}
                                                                            log_type={this.props.log_type}
                                                                            current_counter={this.props.current_counter}
                                                                            is_custom={true}
                                                                        />
                                                            }
                                                        }
                                                        
                                                        // <div className="logpanel__wrapper--title">
                                                        //     <h4 className="item--title--main">{item.chart_params.length == 1 ? item.chart_params[0].label : "Группа параметров"}</h4>
                                                        //     <a className="logpanel__button--delete-custom" onClick={(e) => {this.deleteCustomChart(e, index)}}>
                                                        //         <img src={delete_img} width={25} height="auto"/>
                                                        //     </a>
                                                        // </div>
                                                        return  <li className="logs--list--item" key={index1}>
                                                                    {__params_groups[group_id].key == "custom" ? 
                                                                        <div className="logpanel__wrapper--title">
                                                                            <h4 className="item--title--main">{parameter.label}</h4>
                                                                            <a className="logpanel__button--delete-custom" onClick={(e) => {this.deleteCustomChart(e, parameter.id)}}>
                                                                                <img src={delete_img} width={25} height="auto"/>
                                                                            </a>
                                                                        </div>
                                                                        : <h4  className="logreader__groups__heading--secondary">{parameter.label}</h4>}
                                                                    
                                                                    {chart != "" ? <div className="logreader__container--charts">{chart}</div> : ""}
                                                                    <div className={"item--description " + state_label}>
                                                                        {content.map((item4, index4) => {
                                                                            return <span className="value__LP" key={index4}>{item4}</span>
                                                                        })}
                                                                    </div>
                                                                    {reason}
                                                                </li>
                                                })}
                                            </ul>
                                })
                            }
                        </section>
                    </div>
                </section>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return state;
}
const mapDispatchToProps =  (dispatch) => {
    return {
        "update_modal_message": (data) => dispatch(update_modal_message(data))
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(LogPanel)

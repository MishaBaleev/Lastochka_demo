import React from "react";
import './MarkupPanel.css';
import axios from 'axios';
import { connect } from "react-redux";
import { update_modal_message } from "../../AppSlice";
// import nextPng from "./img/next.png";
// import prevPng from "./img/prev.png";
// import playPng from "./img/play.png";
// import pausePng from "./img/pause.png";
// import { VictoryPie, VictoryArea, VictoryAxis, VictoryChart, VictoryTheme, VictoryBrushContainer, VictoryZoomContainer, VictoryLine } from 'victory';

class MarkupPanel extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: "active",
            markup:[],
            current_interval:{
                v:0,
                c:0,
                // n:0
            },
        };
        this.route_elements_labels = {
            1:"Старт ПЗ",
            2:"Конец взлета",
            3:"Путевая точка",
            10:"Начало взлета с текущей точки",
            11:"Конец взлета с текущей точки",
            12:"Начало взлета"
        }
        this.lastIndex = 0;
        this.clearOnClick = this.clearOnClick.bind(this);
        this.createInterval = this.createInterval.bind(this);
        this.intervalOnChange = this.intervalOnChange.bind(this);
        this.saveOnClick = this.saveOnClick.bind(this);
        this.changePropertyManually = this.changePropertyManually.bind(this);
        this.changeSelect = this.changeSelect.bind(this);
        this.switchMarkupPanelActive = this.switchMarkupPanelActive.bind(this)
    }
    onChange(e, key){
        let current_interval = this.state.current_interval
        current_interval[key] = parseInt(e.target.value)
        this.setState(state => ({
            current_interval: current_interval
        }))
    }
    intervalOnChange(e, key, index){
        let markup = this.state.markup
        let interval = markup[index]
        interval[key] = parseInt(e.target.value)
        
        markup[index] = interval

        this.setState(state => ({
            markup: markup
        }))
    }
    changeSelect(e, index, property_key, point_key){
        let markup = this.state.markup
        markup[index][point_key].current_select[property_key] = e.target.value

        if(e.target.value != "-1"){
            markup[index][point_key][property_key] = this.props.route_elements_markup[parseInt(e.target.value)].data[property_key]
        }

        this.setState(state => ({
            markup: markup
        }))
    }
    changePropertyManually(e, index, property_key, point_key){
        let markup = this.state.markup
        markup[index][point_key][property_key] = parseFloat(e.target.value)

        this.setState(state => ({
            markup: markup
        }))
    }
    createInterval(e){
        e.preventDefault();
        let log = this.props.log.log.filter((item, index) => {
            if(index >= this.state.current_interval.v-1 && index <= this.state.current_interval.c) return item
        })

        // for(let i = 0; i < log.length; i++){
        //     if(i >= this.state.current_interval.v && i <= this.state.current_interval.c) log[i]["target_point_index"]=this.state.current_interval.n
        // }
        let markup = this.state.markup
        markup.push(
            {
                begin:this.state.current_interval.v,
                end:this.state.current_interval.c,
                prev:{
                    lng:null,
                    lat:null,
                    alt:null,
                    speed:null,
                    current_select:{
                        lng:-1,
                        lat:-1,
                        alt:-1,
                        speed:-1
                    }
                },
                next:{
                    lng:null,
                    lat:null,
                    alt:null,
                    speed:null,
                    current_select:{
                        lng:-1,
                        lat:-1,
                        alt:-1,
                        speed:-1
                    }
                },
                // point:this.state.current_interval.n,
                log:log
            }
        )
        this.setState(state => ({
            markup: markup
        }))

        // points.map((item) => {
        //     let n = item.n, v =item.v, c = item.c
        //     for(let i =0; i < log.length; i++){
        //         if(i >= v && i <= c) log[i]["target_point_index"]=n
        //     }
        // })
        // if (this.state.isPause){
        //     this.setState(state => ({
        //         isPause: false
        //     }))
        // }else{
        //     this.setState(state => ({
        //         isPause: true
        //     }))
        // }
        // this.props.playPause(this.state.isPause)
        // console.log(this.props.data)
    }
    saveOnClick(e){
        this.props.update_modal_message({active: true, heading: "Предупреждение", message: "Эта функция доступна в полной версии приложения"})
    }
    clearOnClick(e){
        this.setState(state => ({
            markup: []
        }))
    }
    switchMarkupPanelActive(e){
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

    clickHandlerPrev(e, id){
        e.preventDefault()
        let target = document.querySelector(".list__markup--prev.index_"+id)
        target.classList.toggle("unactive")
    }
    clickHandlerTarget(e, id){
        e.preventDefault()
        let target = document.querySelector(".list__markup--target.index_"+id)
        target.classList.toggle("unactive")
    }
    clickIntervalTarget(e, id){
        e.preventDefault()
        let targetArr = document.querySelectorAll(".inf--frame.index-"+id)
        // target.classList.toggle("unactive")
        for (let target of targetArr){
            target.classList.toggle("unactive")
        }
    }
    getNewIndex(){
        this.lastIndex++
        console.log(this.lastIndex)
        return this.lastIndex
    }
    render(){
        return(
            <div>
                <section className={"section--markup__logs "+this.state.active}>
                    <button onClick={this.switchMarkupPanelActive} className={"button--markup__logs "+this.state.active}></button>
                    <div className="markup--header">
                        <h1 className="main--title--markup">Разметка данных</h1>
                        <p>Всего пакетов: {this.props.log.log.length}</p>
                    </div>
                    <div className="logs--blocks--markup">
                        <div className="frame--settings">
                            <h3 className="title--markup">Диапазон</h3>
                            <div className="frame--settings__start">
                                <label>Номер начального пакета</label>
                                <input className="input--number_frame" onChange={(e) => this.onChange(e, "v")} type="number" value={this.state.v} min={1} max={this.props.log.log.length-1}/>
                            </div>
                            <div className="frame--settings__end">
                                <label>Номер конечного пакета</label>
                                <input className="input--number_frame" onChange={(e) => this.onChange(e, "c")} type="number" value={this.state.c} min={1} max={this.props.log.log.length}/>
                            </div>
                            {/* <div>
                                <label>Целевой элемент ПЗ</label>
                                <select onChange={(e) => this.onChange(e, "n")} value={this.state.n}>
                                    <option value="" disabled selected>--</option>

                                    {this.props.route_elements_markup.map((item, index) => {
                                        if(item.element_id != 1){
                                            return <option value={index}>
                                                        {this.route_elements_labels[item.element_id]}
                                                    </option>
                                        }
                                    })}
                                </select>
                            </div> */}
                        </div>
                        <button onClick={this.createInterval} className="button--create">Создать интервал данных</button>
                        <div className="buttons--save_clear">
                            <button onClick={this.saveOnClick} className="button--save">Сохранить разметку</button>
                            <button onClick={this.clearOnClick} className="button--clear">Очистить разметку</button>
                        </div>
                        <ul className="markup--list">
                            {
                                this.state.markup.map((item, index) => {
                                    return <li key={index}>
                                                <a className="item--title--main--markup" onClick={(e) => {this.clickIntervalTarget(e, index)}} href="">Интервал {index+1} </a>
                                                <div className="interval--settings--markup">
                                                    <div>
                                                        от <input className="input--number_frame" onChange={(e) => this.intervalOnChange(e, "begin", index)} type="number" value={item.begin} min={1} max={this.props.log.log.length-1}/> 
                                                    </div>
                                                    <div>
                                                        до <input className="input--number_frame" onChange={(e) => this.intervalOnChange(e, "end", index)} type="number" value={item.end} min={1} max={this.props.log.log.length}/>
                                                    </div>                                                    
                                                </div>
                                                <div className={"inf--frame index-"+index}>
                                                    <a className="header--interval" onClick={(e) => this.clickHandlerPrev(e, index)} href="">Параметры пройденной точки </a>
                                                    <ul className={"list__markup--prev index_"+index}>
                                                        <li key={"0_"+index}>
                                                            <h5 className="item--setting--markup">Долгота</h5>
                                                            
                                                            <select onChange={(e) => this.changeSelect(e, index, "lng", "prev")} value={item.prev.current_select.lng}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.lng && item1.data.lat){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.lng}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.prev.current_select.lng == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "lng", "prev")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                        <li key={"1_"+index}>
                                                            <h5 className="item--setting--markup">Широта</h5>
                                                            <select onChange={(e) => this.changeSelect(e, index, "lat", "prev")} value={item.prev.current_select.lat}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.lng && item1.data.lat){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.lat}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.prev.current_select.lat == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "lat", "prev")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                        <li key={"2_"+index}>
                                                            <h5 className="item--setting--markup">Скорость</h5>
                                                            <select onChange={(e) => this.changeSelect(e, index, "speed", "prev")} value={item.prev.current_select.speed}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.speed){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.speed}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.prev.current_select.speed == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "speed", "prev")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                        <li key={"3_"+index}>
                                                            <h5 className="item--setting--markup">Высота</h5>
                                                            <select onChange={(e) => this.changeSelect(e, index, "alt", "prev")} value={item.prev.current_select.alt}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.alt){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.alt}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.prev.current_select.alt == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "alt", "prev")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                    </ul>
                                                </div>
                                                {/* next */}
                                                
                                                <div className={"inf--frame index-"+index}>
                                                <a className="header--interval" onClick={(e) => this.clickHandlerTarget(e, index)} href="">Параметры целевой точки </a>
                                                    <ul className={"list__markup--target index_"+index}>
                                                        <li key={"4_"+index}>
                                                            <h5 className="item--setting--markup">Долгота</h5>
                                                            
                                                            <select onChange={(e) => this.changeSelect(e, index, "lng", "next")} value={item.next.current_select.lng}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.lng && item1.data.lat){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.lng}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.next.current_select.lng == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "lng", "next")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                        <li key={"5_"+index}>
                                                            <h5 className="item--setting--markup">Широта</h5>
                                                            <select onChange={(e) => this.changeSelect(e, index, "lat", "next")} value={item.next.current_select.lat}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.lng && item1.data.lat){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.lat}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.next.current_select.lat == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "lat", "next")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                        <li key={"6_"+index}>
                                                            <h5 className="item--setting--markup">Скорость</h5>
                                                            <select onChange={(e) => this.changeSelect(e, index, "speed", "next")} value={item.next.current_select.speed}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.speed){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.speed}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.next.current_select.speed == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "speed", "next")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                        <li key={"7_"+index}>
                                                            <h5 className="item--setting--markup">Высота</h5>
                                                            <select onChange={(e) => this.changeSelect(e, index, "alt", "next")} value={item.next.current_select.alt}>
                                                                <option value={-1}>Указать вручную</option>
                                                                {
                                                                    this.props.route_elements_markup.map((item1, index1) => {
                                                                        if(item1.data.alt){
                                                                            return <option value={index1} key={index1}>
                                                                                        {this.route_elements_labels[item1.element_id] + ": " + item1.data.alt}
                                                                                    </option>
                                                                        }

                                                                        // if(index1 != 0){
                                                                        //     return <option value={index1}>
                                                                        //                 {this.route_elements_labels[item1.element_id]}
                                                                        //             </option>
                                                                            
                                                                })}


                                                                {/* {this.props.route_elements_markup.map((item1, index1) => {
                                                                    if(index1 != 0){
                                                                        return <option value={index1}>
                                                                                    {this.route_elements_labels[item1.element_id]}
                                                                                </option>
                                                                    }
                                                                })} */}
                                                            </select>
                                                            {
                                                                item.next.current_select.alt == -1 ? 
                                                                <div className="input--text--markup">
                                                                    <input onChange={e => {this.changePropertyManually(e, index, "alt", "next")}}  type="text"/>
                                                                    {/* <label>Широта</label>
                                                                    <input onChange={e => {this.changePointProperty(e, "cords", index, "lat")}}  type="text"/> */}
                                                                </div>
                                                                :
                                                                ""
                                                            }
                                                        </li>
                                                    </ul>
                                                </div>
                                                {/* <select onChange={(e) => this.intervalOnChange(e, "point", index)} value={item.point}>
                                                    {this.props.route_elements_markup.map((item1, index1) => {
                                                        if(index1 != 0){
                                                            return <option value={index1}>
                                                                        {this.route_elements_labels[item1.element_id]}
                                                                    </option>
                                                        }
                                                    })}
                                                </select> */}
                                                
                                                
                                            </li>
                                })
                            }
                            {/* <li class="logs--list--item">
                                <h4 class="item--title--main">Заряд аккумулятора</h4>
                                <div class="battery">
                                </div>
                            </li> */}
                            
                        </ul>
                    </div>
                </section>
            </div>
        )
    }
}
const mapStateToProps = (state) => {return state}
const mapDispatchToProps = (dispatch) => {return {
    "update_modal_message": (data) => {dispatch(update_modal_message(data))}
}}
export default connect(mapStateToProps, mapDispatchToProps)(MarkupPanel);
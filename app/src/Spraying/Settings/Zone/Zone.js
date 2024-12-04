import { useState } from "react";
import "./Zone.scss";
import marker from "./img/marker.png";

const Zone = (props) => {
    const [marker_active, setMarkerActive] = useState("unactive")
    const toggleMarkerActive = () => {
        props.manager.toggleCursor()
        if (marker_active === "active"){
            setMarkerActive("unactive")
        }else{
            setMarkerActive("active")
        }
    }

    return <ul className="zone block">
        <li>
            <div className="name"><p className="name">Культура</p></div>
            <select onChange={(e) => {props.changeZone("culture", e.target.value)}}>
                <option value="wheat">Пшеница</option>
                <option value="beet">Сахарная свекла</option>
                <option value="sunflower">Подсолнечник</option>
            </select>
        </li>
        <li>
            <div className="name">
                <p className="name">Место старта</p>
                <button className={"marker_set "+marker_active} onClick={toggleMarkerActive}><img src={marker} alt="marker"/></button>
            </div>
            <div className="coords">
                <div className="coord">
                    <div className="coord_item"><p>X</p></div>
                    <input type="number"
                        min={0}
                        max={90}
                        step={0.000001}
                        value={props.settings.start_pos.x}
                        onChange={(e) => {props.changeZone("start_pos", {x: e.target.value, y: props.settings.start_pos.y})}}
                    />
                </div>
                <div className="coord">
                    <div className="coord_item"><p>Y</p></div>
                    <input type="number"
                        min={0}
                        max={90}
                        step={0.000001}
                        value={props.settings.start_pos.y}
                        onChange={(e) => {props.changeZone("start_pos", {x: props.settings.start_pos.x, y: e.target.value})}}
                    />
                </div>
            </div>
            <button className="set" onClick={() => {props.manager.setStartMarker([props.settings.start_pos.x, props.settings.start_pos.y])}}>Установить</button>
        </li>
        <li className="flex">
            <div className="left_name norm"><p>Поворот</p></div>
            <input type="range"
                min={0}
                max={360}
                step={1}
                value={props.settings.angle}
                onChange={(e) => {props.changeZone("angle", e.target.value)}}
            />
            <input type="number"
                min={0}
                max={360}
                step={1}
                value={props.settings.angle}
                onChange={(e) => {props.changeZone("angle", e.target.value)}}
            />
        </li>
        <li className="flex">
            <div className="left_name"><p>Расстояние между линиями</p></div>
            <input type="range"
                min={1}
                max={10}
                step={1}
                value={props.settings.line_spacing}
                onChange={(e) => {props.changeZone("line_spacing", e.target.value)}}
            />
            <input type="number"
                min={1}
                max={10}
                step={1}
                value={props.settings.line_spacing}
                onChange={(e) => {props.changeZone("line_spacing", e.target.value)}}
            />
        </li>
        <li className="flex">
            <div className="left_name big"><p>Возврат на точку старта</p></div>
            <input type="checkbox"
                checked={props.settings.is_return}
                onChange={(e) => {props.changeZone("is_return", props.settings.is_return===true?false:true)}}
            />
        </li>
        <li className="remove_poly">
            <button onClick={() => {props.manager.deletePolygon()}}><p>Очистить зону</p></button>
        </li>
    </ul>
}
export default Zone
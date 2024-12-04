import "./Settings.scss";
import zone from "./img/zone.png";
import movement from "./img/movement.png";
import Movement from "./Movement/Movement";
import Zone from "./Zone/Zone";
import { useEffect, useState } from "react";

const Settings = (props) => {

    const [cur_cmp, setCmp] = useState(0)

    const [zone_settings, setZone] = useState({
        culture: "Зерно",
        start_pos: {x: "", y: ""},
        angle: 0,
        line_spacing: 1,
        is_return: true
    })
    const changeZone = (key, value) => {
        let cur_zone = {...zone_settings}
        cur_zone[key] = value 
        setZone(cur_zone)
        if (key === "angle"){
            props.manager.rotatePolygon(value)
        }else if (key === "line_spacing"){
            props.manager.changeLineSpacing(value)
        }else if (key === "is_return"){
            props.manager.toggleRTL()
        }
    }
    useEffect(() => {
        let cur_zone = {...zone_settings}
        cur_zone.start_pos.x = props.cursor_coords[0]
        cur_zone.start_pos.y = props.cursor_coords[1]
    }, [props.cursor_coords])

    const [move_settings, setMove] = useState({
        speed: 3,
        alt: 5,
        tank_capacity: 1,
        liters_per_sec: 0.1,
        mode: "spray"
    })
    const changeMove = (key, value) => {
        let cur_move = {...move_settings}
        cur_move[key] = value 
        setMove(cur_move)
    }

    const savePlan = () => {
        console.log(zone_settings)
        console.log(move_settings)
    }

    const cmps = [
        <Zone changeZone={changeZone} settings={zone_settings} manager={props.manager}/>,
        <Movement changeMove={changeMove} settings={move_settings} manager={props.manager}/>
    ]

    return <div className="settings_spray">
        <div className="title"><p>Настройка полетного задания</p></div>
        <nav className="navigation">
            <button onClick={() => {setCmp(0)}}>
                <img className="left" src={zone} alt="zone"/>
                <p>Зона</p>
                <img className="right" src={zone} alt="zone"/>
            </button>
            <button onClick={() => {setCmp(1)}}>
                <img className="left" src={movement} alt="movement"/>
                <p>Перемещение</p>
                <img className="right" src={movement} alt="movement"/>
            </button>
        </nav>
        <div className="main_spray">
            <div className="file_name">
                <input type="text"
                    placeholder="Название файла"
                />
            </div>
            {cmps[cur_cmp]}
            <div className="save">
                <button onClick={savePlan}>Сохранить</button>
            </div>
        </div>
    </div>
}
export default Settings
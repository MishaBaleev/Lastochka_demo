import "./Movement.scss";

const Movement = (props) => {
    const settings = [
        {key: "speed", title: "Скорость полета", min: 0.1, max: 10, step: 0.1, type:"range"},
        {key: "alt", title: "Высота полета", min: 1, max: 10, step: 0.1, type:"range"},
        {key: "tank_capacity", title: "Объем бака", min: 0.1, max: 10, step: 0.1, type:"range"},
        {key: "liters_per_sec", title: "Норма расхода", min: 0.01, max: 1, step: 0.01, type:"range"},
        {key: "mode", title: "Режим распыления", options: ["Струя", "Спрей"], values: ["jet", "spray"], type: "select"}
    ]

    return <ul className="block movement">
        {settings.map((item, index) => {
            if (item.type === "range"){
                return <li key={index}>
                    <div className="move_title"><p>{item.title}</p></div>
                    <input type="range"
                        min={item.min}
                        max={item.max}
                        step={item.step}
                        value={props.settings[item.key]}
                        onChange={(e) => {props.changeMove(item.key, e.target.value)}}
                    />
                    <input type="number"
                        min={item.min}
                        max={item.max}
                        step={item.step}
                        value={props.settings[item.key]}
                        onChange={(e) => {props.changeMove(item.key, e.target.value)}}
                    />
                </li>
            }else if (item.type === "select"){
                return <li key={index} className="big">
                    <div className="move_title"><p>{item.title}</p></div>
                    <select onChange={(e) => {props.changeMove(item.key, e.target.value)}}>
                        {item.values.map((value, v_index) => {
                            return <option key={v_index} value={value}>{item.options[v_index]}</option>
                        })}
                    </select>
                </li>
            }
        })}
    </ul>
}
export default Movement
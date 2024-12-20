import "./DefaultCMP.scss";

const DefaultCMP = () => {
    return <div className="default_cmp">
        <div className="window">
            <p className="title">
                Используется пробная web-версия ПО
            </p>
            <p className="text">
                Вы используете пробную web-версию ПО - некоторые функции недоступны, пожалуйста, обратитесь к разработчику, чтобы получить полную версию
            </p>
            <p className="title">
                Преимущества полной версии:
            </p>
            <ul className="pl_list">
                <li>Мониторинг выполнения ПЗ</li>
                <li>Отправка команд на БПЛА</li>
                <li>Сохранение, редактирование и управление ПЗ</li>
                <li>Локальное сохранение картографических данных</li>
                <li>Возможность настройки отображаемых на карте слоев</li>
                <li>Возможность выбора основного картографического источника</li>
                <li>Настройка пользовательского интерфейса</li>
                <li>Экспорт ПЗ из других систем</li>
                <li>Системная помощь при создании ПЗ</li>
                <li>Возможность сохранения разметки записанного полета</li>
                <li>Разметка древонасаждений в реальном времени</li>
            </ul>
        </div>
    </div>
}
export default DefaultCMP
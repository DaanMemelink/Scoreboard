import { useState, useEffect } from "react";

function TimeOfDay() {
    const [time, setTime] = useState(new Date());
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');

    let month = ""
    switch(time.getMonth()) {
        case 0: month = "januari"; break;
        case 1: month = "februari"; break;
        case 2: month = "maart"; break;
        case 3: month = "april"; break;
        case 4: month = "mei"; break;
        case 5: month = "juni"; break;
        case 6: month = "juli"; break;
        case 7: month = "augustus"; break;
        case 8: month = "september"; break;
        case 9: month = "oktober"; break;
        case 10: month = "november"; break;
        case 11: month = "december"; break;
    }
    const date = time.getDate() + " " + month + " " + time.getFullYear();

    function refreshTimeOfDay() {
        setTime(new Date());
    }

    useEffect(() => {
        const now = new Date();
        const delayUntilNextSecond = 1000 - now.getMilliseconds();

        const timeoutId = setTimeout(() => {
            const timerId = setInterval(refreshTimeOfDay, 1000);

            return function cleanup() {
                clearInterval(timerId);
            };
        }, delayUntilNextSecond);

        return function cleanup() {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <>
            <span className="time">
                {hours}
                :
                {minutes}
                :
                {seconds}
            </span>
            <span className="date">{date}</span>
        </>
    );
}
export default TimeOfDay;
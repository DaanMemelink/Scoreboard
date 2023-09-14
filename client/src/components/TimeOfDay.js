import { useState, useEffect } from "react";

function TimeOfDay() {
    const [time, setTime] = useState(new Date());
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    const seconds = String(time.getSeconds()).padStart(2, '0');
    const date = time.toDateString();

    function refreshTimeOfDay() {
        setTime(new Date());
    }

    useEffect(() => {
        const timerId = setInterval(refreshTimeOfDay, 1000);

        return function cleanup() {
            clearInterval(timerId);
        };
    }, []);

    return (
        <>
            <div>
                <span className="time">
                    {hours}
                    :
                    {minutes}
                    :
                    {seconds}
                </span>
                <span className="date">{date}</span>
            </div>
        </>
    );
}
export default TimeOfDay;
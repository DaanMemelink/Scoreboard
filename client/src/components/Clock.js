import TimeOfDay from "./TimeOfDay";

function Clock({runningTime, finishTime}) {
    return (
        <>
            <div className={`clock ${runningTime ? "" : "timeofday"} `}>
                {runningTime ? (
                    <div className="times-container">
                        <span className="time primary">
                            {finishTime ? finishTime : runningTime}
                        </span>
                        <span className={`time secondary ${finishTime ? "shown" : ""}`}>
                            {runningTime}
                        </span>
                    </div>
                ) : <TimeOfDay />
                }
            </div>
        </>
    );
}
export default Clock;
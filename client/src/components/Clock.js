import { AutoTextSize } from 'auto-text-size'
import TimeOfDay from "./TimeOfDay";

function Clock({className, runningTime, finishTime}) {
    return (
        <>
            <div className={`clock ${runningTime ? "" : "timeofday"} ${className}`}>
                {runningTime ? (
                    <div className="times-container">
                        <div className={`time primary ${!finishTime ? "full-width" : ""}`}>
                            <AutoTextSize minFontSizePx={100} maxFontSizePx={300}>
                                {finishTime ? finishTime : runningTime}
                            </AutoTextSize>
                        </div>
                        <div className={`time secondary ${finishTime ? "shown" : ""}`}>
                            <AutoTextSize minFontSizePx={100} maxFontSizePx={200}>
                                {finishTime ? runningTime : ""}
                            </AutoTextSize>
                        </div>
                    </div>
                ) : <TimeOfDay />
                }
            </div>
        </>
    );
}
export default Clock;
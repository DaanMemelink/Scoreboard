import { AutoTextSize } from 'auto-text-size'
import TimeOfDay from "./TimeOfDay";

function Clock({runningTime, finishTime}) {
    return (
        <>
            <div className={`clock ${!runningTime && "timeofday"}`}>
                {runningTime ?
                    <>
                        <div className={`time finish ${!finishTime && "hidden"}`}>
                            <AutoTextSize minFontSizePx={100} maxFontSizePx={200} mode="oneline">
                                {finishTime && Math.ceil(finishTime * 100) / 100}
                            </AutoTextSize>
                        </div>

                        <div className={`time running`}>
                            <AutoTextSize minFontSizePx={finishTime ? 50 : 100} maxFontSizePx={finishTime ? 150 : 200} mode="oneline">
                                {runningTime}
                            </AutoTextSize>
                        </div>
                    </>
                :
                    <TimeOfDay />
                }
            </div>
        </>
    );
}
export default Clock;

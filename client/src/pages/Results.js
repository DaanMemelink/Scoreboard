import {useEffect, useMemo, useState} from "react";
import Box from "../components/Box";
import Clock from "../components/Clock";

function Results({data, runningTime}) {
    const [athleteIndex, setAthleteIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            if (data.athletes.length > 0) {

                setAthleteIndex(prevAthleteIndex => {
                    if (prevAthleteIndex >= data.athletes.length - 1) {
                        return 0
                    } else {
                        return prevAthleteIndex + 1
                    }
                })
            }
        }, 3000)

        return () => clearInterval(timer)
    }, [data.athletes])

    const currentAthlete = useMemo(() => data.athletes[athleteIndex], [athleteIndex])

    return (
        <div className="box-container">
            {data && !data.forceShowTimeOfDay && Object.keys(data.eventInfo).length > 0 ?
                <>
                    <Box>
                        <div className="result">
                            <div className="place-and-name">
                                <h1>{currentAthlete.place}</h1>
                                <h1>{currentAthlete.name}</h1>
                            </div>
                            <h1 className="time">{currentAthlete.time}</h1>
                        </div>
                    </Box>

                    <div className="bottom">
                        <div>
                            {data.eventInfo.wind &&
                                <Box showSticker={false} isSmall={true}>
                                    <span className="label">Wind</span>
                                    <h2 className="data">{data.eventInfo.wind}</h2>
                                </Box>
                            }
                        </div>

                        {!data.allAthletesHavePosition &&
                            <h1 className="running-time">{runningTime}</h1>
                        }
                    </div>
                </>
                :
                <Box>
                    <Clock
                           runningTime={data && !data.forceShowTimeOfDay && Object.keys(data.eventInfo).length > 0 && data.runningTime}
                           finishTime={data && (data.officialFinishTime ? data.officialFinishTime : data.unOfficialFinishTime)}
                    />
                </Box>
            }
        </div>
    )
}

export default Results
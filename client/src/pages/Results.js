import {useEffect, useMemo, useState} from "react";

function Results({data}) {
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
        }, 2000)

        return () => clearInterval(timer)
    }, [data.athletes])

    const currentAthlete = useMemo(() => data.athletes[athleteIndex], [athleteIndex])

    return (
        <>
            {/* windmeting toevoegen ergens */}
            {data && !data.forceShowTimeOfDay && Object.keys(data.eventInfo).length > 0 &&
                <div className="result-page">
                    <div className="result-athlete">
                        <div>
                            <span className="result-place">{currentAthlete.place}</span>
                            <span className="result-name">{currentAthlete.name}</span>
                        </div>
                        <span className="result-time">{currentAthlete.time}</span>
                    </div>
                    <div className="result-bottom">
                        <div className="wind">
                            <span>{data.eventInfo.wind}</span>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default Results
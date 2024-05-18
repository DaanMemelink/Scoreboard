import '../App.css';
import StartList from '../components/StartList';
import Clock from '../components/Clock';
import Box from "../components/Box";

function Scoreboard({data, isResultsPage = false}) {
    const showClock = (data == null || data.forceShowTimeOfDay || Object.keys(data.eventInfo).length <= 0 || (data.started && !data.allAthletesHavePosition) || isResultsPage)

    return (
        <div className="box-container">
            <Box className={showClock ? "" : "hidden"}>
                <Clock
                       runningTime={(isResultsPage && data && !data.started) ? null : (data && !data.forceShowTimeOfDay && Object.keys(data.eventInfo).length > 0 && data.runningTime)}
                       finishTime={data && (data.officialFinishTime ? data.officialFinishTime : data.unOfficialFinishTime)}
                />
            </Box>

            {!isResultsPage && data && !data.forceShowTimeOfDay && Object.keys(data.eventInfo).length > 0 &&
                <>
                    {!showClock &&
                        <h1 className="title">{data.eventInfo.title}</h1>
                    }

                    <Box className="unlimited-height">
                        <StartList
                            officialTimeIsSet={data.athletes.some(athlete => athlete.time)}
                            athletes={data.athletes}
                        />
                    </Box>
                </>
            }
        </div>
    );
}

export default Scoreboard;

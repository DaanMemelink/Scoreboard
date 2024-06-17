import Scoreboard from "./pages/Scoreboard";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import {useEffect, useState} from "react";
import useWebSocket, {ReadyState} from "react-use-websocket";
import Results from "./pages/Results";

const WS_URL = 'ws://127.0.0.1:8000';

function isNewDataEvent(message) {
    let evt = JSON.parse(message.data);
    return evt.type === 'newData';
}

function App() {
    // const initialData = {
    //     eventInfo: {
    //         name: '100m U16 jongens',
    //         date: '2021-01-01',
    //         time: '11:00',
    //         location: 'Location',
    //         distance: '100m',
    //         wind: '+0.7 m/s'
    //     },
    //     athletes: [
    //         {place: 1, name: 'John Doe', id: 123, lane: 1, affiliation: 'ACME', time: '12.34'},
    //         {place: 2, name: 'Jane Doe', id: 456, lane: 2, affiliation: 'ACME', time: '12.56'},
    //         {place: 3, name: 'John Smith', id: 789, lane: 3, affiliation: 'Pallas', time: '12.78'},
    //         {place: 4, name: 'Jane Smith', id: 101, lane: 4, affiliation: 'Pallas', time: '12.90'}
    //     ],
    //     forceShowTimeOfDay: false,
    //     started: true,
    //     runningTime: '13.40',
    //     unOfficialFinishTime: '14.40',
    //     // officialFinishTime: '12.30',
    // }
    const initialData = {
        eventInfo: {},
        athletes: [],
        runningTime: '0.0',
        unOfficialFinishTime: null,
        officialFinishTime: null,
        started: false,
        allAthletesHavePosition: false,
        forceShowTimeOfDay: false
    }
    const [data, setData] = new useState(initialData)
    const [resultsData, setResultsData] = new useState()
    const [lastMessageReceivedAt, setLastMessageReceivedAt] = new useState()

    const {lastJsonMessage, readyState} = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        share: true,
        filter: isNewDataEvent,
        retryOnError: true,
        shouldReconnect: () => true
    })

    function checkShouldShowTimeOfDay() {
        if(lastMessageReceivedAt == null || new Date().getTime() - lastMessageReceivedAt.getTime() >= 1000 * 60 * 10) {//1000 * 60 * 10 for 10 minutes
            setData(initialData)
            //probably do data.forceShowTimeOfDay = true here
        }
    }

    useEffect(() => {
        if(readyState === ReadyState.OPEN) {
            if(lastJsonMessage) {
                setData(prevData => ({...prevData, ...JSON.parse(JSON.stringify(lastJsonMessage))}))
                setLastMessageReceivedAt(new Date())

                if(lastJsonMessage.action === 'time') {
                    if(!data.started) {
                        setData(prevData => ({...prevData, started: true}))
                    }
                    if(parseFloat(lastJsonMessage.runningTime) < 1 && resultsData != null) {
                        setResultsData()
                    }
                } else if(lastJsonMessage.action === 'resultsHeader') {
                    const results = JSON.parse(JSON.stringify(lastJsonMessage))
                    const resultsWithPlace = {
                        ...results,
                        athletes: results.athletes.filter(result => result.place !== '')
                    }
                    setResultsData(resultsWithPlace)
                }
            }

            const timerId = setInterval(checkShouldShowTimeOfDay, 1000 * 60);//1000 * 60 for 1 minute

            return function cleanup() {
                clearInterval(timerId);
            };
        }
    }, [lastJsonMessage, readyState]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Scoreboard data={data} />}/>

                {resultsData ? <Route path="/results" element={<Results data={resultsData} runningTime={data && !data.allAthletesHavePosition && data.started && data.runningTime ? data.runningTime : null} />}/>
                    : <Route path="/results" element={<Scoreboard data={data} isResultsPage={true} />}/>
                }
            </Routes>
        </Router>
    )
}

export default App
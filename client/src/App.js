import './App.css';
import { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Event from './components/Event';
import Clock from './components/Clock';

const WS_URL = 'ws://127.0.0.1:8000';

function isNewDataEvent(message) {
    let evt = JSON.parse(message.data);
    return evt.type === 'newData';
}

function App() {
    const [ data, setData ] = new useState();
    const [ lastMessageReceivedAt, setLastMessageReceivedAt ] = new useState();

    const { lastJsonMessage, readyState } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log('WebSocket connection established.');
        },
        share: true,
        filter: isNewDataEvent,
        retryOnError: true,
        shouldReconnect: () => true
    });

    function checkShouldShowTimeOfDay() {
        if(lastMessageReceivedAt == null || new Date().getTime() - lastMessageReceivedAt.getTime() >= 1000 * 60 * 10) {//1000 * 60 * 10 fot 10 minutes
            setData();
        }
    }

    useEffect(() => {
        if(readyState === ReadyState.OPEN) {
            setData(JSON.parse(JSON.stringify(lastJsonMessage)));
            setLastMessageReceivedAt(new Date());

            const timerId = setInterval(checkShouldShowTimeOfDay, 1000 * 60);//1000 * 60 for 1 minute

            return function cleanup() {
                clearInterval(timerId);
            };
        }
    }, [lastJsonMessage, readyState]);

    return (
        <>
            {(data == null || (data.started && !data.allAthletesHavePosition)) && <Clock runningTime={data != null && data.runningTime} />} 
                
            {data && <Event eventInfo={data.eventInfo} athletes={data.athletes} />}
        </>
    );
}

export default App;

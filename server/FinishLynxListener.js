const dgram = require('dgram');
const udpResultsServer = dgram.createSocket('udp4');
const websocket = require('./websocket');
const iconv = require('iconv-lite')

const lynxPort = 43278;
let tempResults = '';
let finalResults = '';
const initialRunningTime = '0.0';
let scoreboardData = {};
resetScoreboard()

function resetScoreboard() {
    scoreboardData = {
        eventInfo: {},
        athletes: [],
        runningTime: initialRunningTime,
        unOfficialFinishTime: null,
        officialFinishTime: null,
        started: false,
        allAthletesHavePosition: false,
        forceShowTimeOfDay: false
    };
}

udpResultsServer.on("listening", function () {
    const address = udpResultsServer.address();
    console.log("UDP server listening on port " + address.port);
});
udpResultsServer.bind(lynxPort);

function getTitle(fullTitle) {
    console.log(fullTitle)

    let title = fullTitle

    return title
}

udpResultsServer.on("message", function (msg, rinfo) {
    if(rinfo.size === 536){
        tempResults = tempResults + iconv.decode(msg, 'cp1252');
    } else {// datagram is not full, so this is the end of the message
        finalResults = tempResults + iconv.decode(msg, 'cp1252');

        const resultsDump = finalResults.split(';');

        const oldAthletes = scoreboardData.athletes;
        scoreboardData.athletes = []
        scoreboardData.action = null
        for (let i = 0; i < resultsDump.length; i++) {
            resultsDump[i] = resultsDump[i].split(',');
            const type = resultsDump[i][0];

            switch(type) {
                case "TimeOfDay":
                    scoreboardData.forceShowTimeOfDay = true

                    break;
                case "Time":
                    scoreboardData.runningTime = resultsDump[i][1];
                    scoreboardData.action = "time"

                    break;
                case "TimeGun":
                    console.log("TimeGun", resultsDump[i][1])
                    scoreboardData.runningTime = resultsDump[i][1];
                    scoreboardData.action = "timeGun"

                    break;
                case "TimeStopped":
                    scoreboardData.unOfficialFinishTime = resultsDump[i][1];

                    break;
                case "StartListHeader":
                    resetScoreboard()
                    getTitle(resultsDump[i][1])
                    scoreboardData.eventInfo = {
                        title: resultsDump[i][1],
                        wind: resultsDump[i][2] === "nwi" ? null : resultsDump[i][2],
                        amountAthletes: resultsDump[i][3]
                    };

                    break;
                case "ResultsHeader":
                    getTitle(resultsDump[i][1])

                    scoreboardData.eventInfo = {
                        title: resultsDump[i][1],
                        wind: resultsDump[i][2] === "nwi" ? null : resultsDump[i][2],
                        amountAthletes: resultsDump[i][3]
                    };
                    scoreboardData.action = "resultsHeader"

                    break;
                case "StartList":
                    if(scoreboardData.athletes.length < scoreboardData.eventInfo.amountAthletes) {
                        scoreboardData.athletes.push({
                            place: resultsDump[i][1],
                            lane: resultsDump[i][2],
                            id: resultsDump[i][3],
                            name: resultsDump[i][4],
                            affiliation: resultsDump[i][5],
                            time: resultsDump[i][6]
                        });
                    }

                    break;
                case "Result":
                    if(scoreboardData.athletes.length < scoreboardData.eventInfo.amountAthletes) {
                        scoreboardData.athletes.push({
                            place: resultsDump[i][1],
                            lane: resultsDump[i][2],
                            id: resultsDump[i][3],
                            name: resultsDump[i][4],
                            affiliation: resultsDump[i][5],
                            time: resultsDump[i][6]
                        });
                    }

                    break;
                default:
                    if(type !== "") {
                        console.log(type, resultsDump[i][1])
                    }
            }

            switch(type) {
                case "Result":
                    var allAthletesHavePosition = true;
                    var fastestTime = null
                    for(i = 0; i < scoreboardData.athletes.length; i++) {
                        if(scoreboardData.athletes[i].place) {
                            if(fastestTime === null || parseFloat(scoreboardData.athletes[i].time) < parseFloat(fastestTime)) {
                                fastestTime = scoreboardData.athletes[i].time
                            }
                        } else {
                            allAthletesHavePosition = false;
                        }
                    }

                    scoreboardData.allAthletesHavePosition = allAthletesHavePosition;
                    scoreboardData.officialFinishTime = fastestTime

                    break;
            }

            if(scoreboardData.runningTime.replace(/ /g, "") !== initialRunningTime) {
                scoreboardData.started = true;
            }
        }
        if(scoreboardData.athletes.length === 0) {
            scoreboardData.athletes = oldAthletes
        }
        tempResults = '';// reset tempResults variable to prepare for next datagram

        websocket.broadcastMessage("newData", scoreboardData);
    }
});

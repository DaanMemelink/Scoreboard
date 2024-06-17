const dgram = require('dgram');
const udpResultsServer = dgram.createSocket('udp4');
const websocket = require('./websocket');
const iconv = require('iconv-lite')

const lynxPort = 43278
let tempResults = ''
let finalResults = ''
const initialRunningTime = '0.0'
let scoreboardData = {}
let oldAthletes = []

udpResultsServer.on("listening", function () {
    const address = udpResultsServer.address();
    console.log("UDP server listening on port " + address.port);
});
udpResultsServer.bind(lynxPort);

function getTitle(title) {
    const cleanedTitle = title.replace(/\s+/g, ' ').trim()
    const pattern = /^(U\d{2})\s(M|V)-((\d+x)?\d{2,4}mH?)-(\d+)\s(\d{4}h)\s\(versie\s\d\)$/
    const match = cleanedTitle.match(pattern)
    if (match) {
        const [, ageCategory, gender, distance, , series] = match
        return `${ageCategory} ${gender === 'M' ? 'mannen' : 'vrouwen'} ${distance} - serie ${series}`
    } else {
        return title
    }
}

udpResultsServer.on("message", function (msg, rinfo) {
    if(rinfo.size === 536){
        tempResults = tempResults + iconv.decode(msg, 'cp1252');
    } else {// datagram is not full, so this is the end of the message
        finalResults = tempResults + iconv.decode(msg, 'cp1252');

        const resultsDump = finalResults.split(';');

        oldAthletes = scoreboardData.athletes ?? []
        scoreboardData = {}

        for (let i = 0; i < resultsDump.length; i++) {
            resultsDump[i] = resultsDump[i].split(',');
        }
        for (let i = 0; i < resultsDump.length; i++) {
            const type = resultsDump[i][0];

            switch(type) {
                case "TimeOfDay":
                    scoreboardData.forceShowTimeOfDay = true

                    break;
                case "Time":
                    scoreboardData.runningTime = resultsDump[i][1].trim()
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
                    scoreboardData = {}
                    scoreboardData.eventInfo = {
                        title: getTitle(resultsDump[i][1]),
                        wind: resultsDump[i][2] === "nwi" ? null : resultsDump[i][2],
                        amountAthletes: resultsDump[i][3]
                    };

                    break;
                case "ResultsHeader":
                    scoreboardData.eventInfo = {
                        title: getTitle(resultsDump[i][1]),
                        wind: resultsDump[i][2] === "nwi" ? null : resultsDump[i][2],
                        amountAthletes: resultsDump[i][3]
                    };
                    scoreboardData.action = "resultsHeader"

                    break;
                case "StartList":
                    if(oldAthletes.length < scoreboardData.eventInfo.amountAthletes) {
                        if(!scoreboardData.athletes) scoreboardData.athletes = []
                        scoreboardData.athletes.push({
                            place: resultsDump[i][1],
                            lane: resultsDump[i][2],
                            id: resultsDump[i][3],
                            name: resultsDump[i][4],
                            affiliation: resultsDump[i][5],
                            time: resultsDump[i][6]
                        })

                        scoreboardData.athletes.sort((a, b) => parseInt(a.lane) - parseInt(b.lane));
                    }

                    break;
                case "Result":
                    if(oldAthletes.length < scoreboardData.eventInfo.amountAthletes) {
                        if(!scoreboardData.athletes) scoreboardData.athletes = []

                        let time = resultsDump[i][6];
                        if(typeof resultsDump[i[1]] === 'number') {
                            if (i > 0 && Math.abs(resultsDump[i - 1][6] - time) <= 0.01 || i < resultsDump.length - 1 && Math.abs(time - resultsDump[i + 1][6]) <= 0.01) {
                                time = parseFloat(resultsDump[i][6]).toFixed(3);
                            } else {
                                time = roundTime(time)
                            }
                        }

                        scoreboardData.athletes.push({
                            place: resultsDump[i][1],
                            lane: resultsDump[i][2],
                            id: resultsDump[i][3],
                            name: resultsDump[i][4],
                            affiliation: resultsDump[i][5],
                            time: time
                        })
                        scoreboardData.athletes.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
                    }

                    break;
                case "Wind":
                    scoreboardData.eventInfo.wind = resultsDump[i][1];

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

            // if(type === "time" && scoreboardData.runningTime && scoreboardData.runningTime.replace(/ /g, "") !== initialRunningTime) {
            //     scoreboardData.started = true;
            // }
        }
        // if(scoreboardData.athletes.length === 0) {
        //     scoreboardData.athletes = oldAthletes
        // }

        tempResults = '';// reset tempResults variable to prepare for next datagram
        websocket.broadcastMessage("newData", scoreboardData);
        // resetScoreboard()
    }

    function roundTime(time) {
        return (Math.ceil(parseFloat(time) * 100) / 100).toFixed(2);
    }
});

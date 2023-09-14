const dgram = require('dgram');
const udpResultsServer = dgram.createSocket('udp4');
const websocket = require('./websocket');

const lynxPort = 43278;
var tempResults = '';
var finalResults = '';
const initialRunningTime = '0.0';
var scoreboardData = {}
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
    var address = udpResultsServer.address();
    console.log("UDP server listening on port " + address.port);
});
udpResultsServer.bind(lynxPort);

udpResultsServer.on("message", function (msg, rinfo) {
    // console.log(new Buffer.from(msg).toString());
    // console.log(msg.decode("utf-8"));
    // console.log(msg.toString());

    if(rinfo.size == 536){
        tempResults = tempResults + msg.toString();
    } else {// datagram is not full, so this is the end of the message
        finalResults = tempResults + msg.toString();
        
        var resultsDump = finalResults.split(';');

        var oldAthletes = scoreboardData.athletes
        scoreboardData.athletes = []
        for (var i = 0; i < resultsDump.length; i++) {
            resultsDump[i] = resultsDump[i].split(',');
            var type = resultsDump[i][0];

            switch(type) {
                case "TimeOfDay":
                    scoreboardData.forceShowTimeOfDay = true

                    break;
                case "Time":
                    scoreboardData.runningTime = resultsDump[i][1];    

                    if(parseFloat(resultsDump[i][1]) > 5) {
                        scoreboardData.unOfficialFinishTime = "5.20"
                    }

                    break;
                case "TimeStopped":
                    scoreboardData.unOfficialFinishTime = resultsDump[i][1];    

                    break;
                case "StartListHeader":
                    resetScoreboard()
                    scoreboardData.eventInfo = {
                        title: resultsDump[i][1],
                        wind: resultsDump[i][2] === "nwi" ? null : resultsDump[i][2],
                        amountAthletes: resultsDump[i][3]
                    };

                    break;
                case "ResultsHeader":
                    scoreboardData.eventInfo = {
                        title: resultsDump[i][1],
                        wind: resultsDump[i][2] === "nwi" ? null : resultsDump[i][2],
                        amountAthletes: resultsDump[i][3]
                    };

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
            }

            switch(type) {
                case "Result":
                    var allAthletesHavePosition = true;
                    var fastestTime = null
                    for(var i = 0; i < scoreboardData.athletes.length; i++) {
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

            if(scoreboardData.runningTime.replace(/ /g, "") != initialRunningTime) {
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

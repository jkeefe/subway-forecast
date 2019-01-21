// Require modules here
var Twit = require('twit');
var moment = require('moment-timezone');
var Mta = require('mta-gtfs');
var mysql = require('mysql');
var keys = require('../keys/subway_watcher_keys');
var station_lines = require('./data/station-lines.json');

// Include global variables here (if any)
var bot = new Twit({
    consumer_key:         keys.TWITTER_CONSUMER_KEY,
    consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
    access_token:         keys.TWITTER_ACCESS_TOKEN,
    access_token_secret:  keys.TWITTER_ACCESS_TOKEN_SECRET
});




var feed_definitions = [
    {
        "feed_id": 1,
        "subset": 1,
        "train_lines": ["1", "2", "3", "4", "5", "6", "S"],
        "gtfs_stop_id": ["101", "103", "104", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131"]
    },
    {
        "feed_id": 1,
        "subset": 2,
        "train_lines": ["1", "2", "3", "4", "5", "6", "S"],
        "gtfs_stop_id": [ "132", "133", "134", "135", "136", "137", "138", "139", "142", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "248", "249", "250", "251", "252", "253", "254", "255", "256", "257", "241", "242", "243", "244", "245", "246", "247", "601", "602", "603", "604", "606", "607", "608"]
    },
    {
        "feed_id": 1,
        "subset": 3,
        "train_lines": ["1", "2", "3", "4", "5", "6", "S"],
        "gtfs_stop_id": ["609", "610", "611", "612", "613", "614", "615", "616", "617", "618", "619", "401", "402", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "415", "416", "621", "622", "623", "624", "625", "626", "627", "628", "629", "630", "631", "632", "633", "634", "635", "636", "637", "638", "639", "640"]
    },
    {
        "feed_id": 1,
        "subset": 4,
        "train_lines": ["1", "2", "3", "4", "5", "6", "S"],
        "gtfs_stop_id": ["418", "419", "420", "423", "201", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "301", "302", "224", "225", "226", "227", "501", "502", "503", "504", "505", "902", "901"]
    },
    {
        "feed_id": 26,
        "subset": 1,
        "train_lines": ["A", "C", "E", "H", "S"],
        "gtfs_stop_id": ["A02", "A03", "A05", "A06", "A07", "A09", "A10", "A11", "A12", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A24", "A25", "A27", "A28", "A30", "A31", "A32", "A33", "A34", "A36", "E01", "A38", "A40", "A41", "A42", "A43", "A44", "A45"]
    },
    {
        "feed_id": 26,
        "subset": 2,
        "train_lines": ["A", "C", "E", "H", "S"],
        "gtfs_stop_id": ["A46", "A47", "A48", "A49", "A50", "A51", "A52", "A53", "A54", "A55", "A57", "A59", "A60", "A61", "A63", "A64", "A65", "H01", "H02", "H03", "H04", "H19", "H12", "H13", "H14", "H15", "H06", "H07", "H08", "H09", "H10", "H11", "S01", "S03", "S04"]
    },
    {
        "feed_id": 16,
        "subset": 1,
        "train_lines": ["N", "Q", "R", "W"],
        "gtfs_stop_id": ["R01", "R03", "R04", "R05", "R06", "R08", "R11", "R13", "R14", "R15", "R16", "R17", "R18", "R19", "R20", "R21", "R22", "R23", "Q01", "R24", "R25", "R26", "R27", "R28", "R29", "R30", "R31", "R32", "R33", "R34", "R35", "R36", "R39", "R40", "R41", "R42"]
    },
    {
        "feed_id": 16,
        "subset": 2,
        "train_lines": ["N", "Q", "R", "W"],
        "gtfs_stop_id": ["R43", "R44", "R45", "D24", "D25", "D26", "D27", "D28", "D29", "D30", "D31", "D32", "D33", "D34", "D35", "D37", "D38", "D39", "D40", "D41", "D42", "D43", "N02", "N03", "N04", "N05", "N06", "N07", "N08", "N09", "N10", "G08", "G09", "G10", "G11", "G12", "G13", "G14", "G15", "G16", "G18", "G19", "G20", "G21", "R09", "Q05", "Q04", "Q03"]
    },
    {
        "feed_id": 21,
        "subset": 1,
        "train_lines": ["B", "D", "F", "M"],
        "gtfs_stop_id": ["D24", "D25", "D26", "D27", "D28", "D29", "D30", "D31", "D32", "D33", "D34", "D35", "D37", "D38", "D39", "D40", "D42", "D43", "B12", "B13", "B14", "B15", "B16", "B17", "B18", "B19", "B20", "B21", "B22", "B23", "D13", "A14", "A15", "A16", "A17", "A18", "A19", "A20", "A21", "A22", "A24"]
    },
    {
        "feed_id": 21,
        "subset": 2,
        "train_lines": ["B", "D", "F", "M"],
        "gtfs_stop_id": ["A24", "D20", "D01", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "B04", "B06", "B08", "B10", "D15", "D16", "D17", "D18", "D19", "D21", "D22", "F14", "F15", "F16", "F18", "F20", "F21", "F22", "F23", "F24", "F25", "F26", "F27", "F29", "F30"]
    },
    {
        "feed_id": 21,
        "subset": 3,
        "train_lines": ["B", "D", "F", "M"],
        "gtfs_stop_id": ["F31", "F32", "F33", "F34", "F35", "F36", "F38", "F39", "F01", "F02", "F03", "F04", "F05", "F06", "F07", "G08", "G09", "G10", "G11", "G12", "G13", "G14", "G15", "G16", "G18", "G19", "G20", "G21", "F09", "F11", "F12", "D14"]
    },
    {
        "feed_id": 2,
        "train_lines": ["L"],
        "subset": 0,
        "gtfs_stop_id": ["L01", "L02", "L03", "L05", "L06", "L08", "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17", "L19", "L20", "L21", "L22", "L24", "L25", "L26", "L27", "L28", "L29"]
    },
    {
        "feed_id": 31,
        "train_lines": ["G"],
        "subset": 0,
        "gtfs_stop_id": ["A42", "F20", "F21", "F22", "F23", "F24", "F25", "F26", "G22", "G24", "G26", "G28", "G29", "G30", "G31", "G32", "G33", "G34", "G35", "G36"]
    },
    {
        "feed_id": 36,
        "train_lines": ["J", "Z"],
        "subset": 0,
        "gtfs_stop_id": ["J12", "J13", "J14", "J15", "J16", "J17", "J19", "J20", "J21", "J22", "J23", "J24", "J27", "J28", "J29", "J30", "J31", "M11", "M12", "M13", "M14", "M16", "M18", "M19", "M20", "M21", "M22", "M23", "G05", "G06"]
    },
    {
        "feed_id": 51,
        "train_lines": ["7"],
        "subset": 0,
        "gtfs_stop_id": ["701", "702", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "718", "719", "720", "721", "723", "724", "725", "726"]
    }
    
];

var directions = ["N","S"];

var s3_snapshot;

exports.handler = function(event, context, callback){ 

    s3_snapshot = {};

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    var tweet_options = {
        q: '@MTA OR @NYCTsubway OR #mta OR #nycsubway -RT',
        count: 100
    };
    
    // could do this as an allPromise, and write once everything comes back.
    
    getTweets(tweet_options)
    .then(getSubwayTimes())
    .then(getSubwayStatus())
    .then(function(){
        // format is callback(error, response);
        callback(null, s3_snapshot);
    })
    .catch(function(error){
        console.log(`Promise problem in main loop: ${error}`);
        callback("Promise Error!");
    });
        

};

// Helper functions can go here
function getTweets(options) {
    return new Promise((resolve, reject) => {
        console.log("Getting tweets.");
        
        bot.get('search/tweets', options, function(err, data, response) {
            
            if (err){
                console.log("Twitter error:", err);
                reject(err);
                return null;
            }
            
            var mostest_latest = [];
            var time_now = moment();
            
            data.statuses.forEach(function(tweet){
                
                // console.log(tweet.text);
                
                // Tweet time created_at format: Sun Aug 06 18:14:56 +0000 2017
                var tweet_time = moment(tweet.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY");
                
                var time_difference = time_now.diff(tweet_time, "seconds");
                
                // only save tweets that are less than 60 seconds old
                if (time_difference < 60) {
                    mostest_latest.push(tweet);
                    // console.log("Time difference: ", time_difference);
                }
                
            });
            
            // add to the global record
            console.log("Got tweets.");
            s3_snapshot.tweets = mostest_latest;
            
            resolve();
            return;
            
        });    
    });
}

async function getSubwayTimes() {

    console.log("Getting Subway times");

    var now = moment();
    var snapshotUnix = +now.format("X"); // + for the integer
    var snapshotUTC = now.utc().format("YYYY-MM-DD HH:mm:ss");
    var snapshotNYC = now.tz("America/New_York").format("YYYY-MM-DD HH:mm:ss");
    
    var record_collection = [];
    
    //
    s3_snapshot.times = {
        "unix": snapshotUnix,
        "utc": snapshotUTC,
        "nyc": snapshotNYC
    };
    
    // build a promise list fetching each feed from the MTA
    var promise_list = [];
    feed_definitions.forEach( (feed_deets) => {
        promise_list.push(getMtaFeed(feed_deets));
    });
    
    let results = await Promise.all(promise_list);
            
    // loop through all of the feed results we got back
    results.forEach( (result) => {
                                
        // loop through the stops we got back for this feed.
        var feed_stops = Object.keys(result.schedule);
        feed_stops.forEach( (stop_number) => { 
        
            // loop through the direction objects for that stop (N and S)
            directions.forEach( (direction) => {
                
                var trainLineOrders = {};
                
                // loop through all the items in the station+direction
                for (var i = 0; i < result.schedule[stop_number][direction].length; i++) {
                    
                    // bail after the first 6 trains
                    if (i > 6) break;
                    
                    var train = result.schedule[stop_number][direction][i];
                    
                    // calculate the trainOrderLine, which is the sequence in which
                    // this train will arrive for *this* line. Zero-indexed. 
                    // For example:
                    
                    // routeId: 'A'
                    // stationIdGTFS: (14th street's ID)
                    // direction: 'N'
                    // trainOrderLine: 0
                    // trainOrderAll: 2

                    // ... means this A train will be the next A train to arrive at 
                    // 14th street but the 3rd train overall So C and/or E
                    // trains are arriving before the A.
                    
                    if (!trainLineOrders.hasOwnProperty(train.routeId)) {
                        trainLineOrders[train.routeId] = 0;
                    } else {
                        trainLineOrders[train.routeId]++;
                    }
                    
                    // if there's an arrival time, calculate time_to_arrival 
                    var time_to_arrival = null;
                    if (train.arrivalTime) {
                        time_to_arrival = train.arrivalTime - result.updatedOn;
                    }
                        
                    // if there's a departure time, calculate time_to_arrival 
                    var time_to_departure = null;
                    if (train.departureTime) {
                        time_to_departure = train.departureTime - result.updatedOn;
                    }
                    
                    // building insertion record that looks like this:
                    // INSERT INTO traintimes (snapshotUnix, snapshotNYC, routeId, stationIdGTFS, direction, trainOrderLine, trainOrderAll, arrivalTime, departureTime, updatedOn, timeToArrival, timeToDeparture) VALUES ?
                    
                    var record = [snapshotUnix, snapshotNYC, train.routeId, stop_number, direction, trainLineOrders[train.routeId], i, train.arrivalTime, train.departureTime, result.updatedOn, time_to_arrival, time_to_departure];
                    
                    // add to the collection
                    record_collection.push(record);
                    
                }
                
            });
        
        });
                
            
    });
            
    console.log("Built record collection.");

    try {
        await updateDatabase(record_collection);
        console.log("Database updated should be done.");
        return;
    } 
    catch (err) {
        console.log("Error updating database: " + err);
        return;
    }
    
}

async function getMtaFeed(feed) {

    var mta = new Mta({
        key: keys.MTA_API_KEY,   // only needed for mta.schedule() method
        feed_id: feed.feed_id    // optional, default = 1; F line is in id 21
    });
    
    // hit each MTA feed endpoint
    
    try {
        let result = await mta.schedule(feed.gtfs_stop_id);
        console.log(`Got Schedule for feed ID ${feed.feed_id} subset ${feed.subset} lines ${feed.train_lines}`);
        
        // store this in the s3_snapshot by feed number for S3 archive
        s3_snapshot[feed.feed_id] = {};
        s3_snapshot[feed.feed_id].rawdata = result;
        
        return result;
    }
    catch (err) {
        console.log(`Ooopsie with feed ${feed.feed_id} subset ${feed.subset} (${feed.train_lines}): ${err}`);
        var blank_object = {
            "schedule": {}
        };
        return blank_object;
    }
}

async function getSubwayStatus() {
        
    console.log("Getting MTA statuses");
    
    var mta = new Mta({
        key: keys.MTA_API_KEY
    });
    
    try {
        
        let result = mta.status('subway');
        console.log("Got statuses.");
        s3_snapshot.statuses = result;
        return;
    
    }
    catch (err) {
        console.log("Error getting MTA status: " + err);
        return;
    }
    
}

function updateDatabase(records) {
    return new Promise ((resolve, reject) => {
        
        console.log("Updatating database.");
        
        var connection = mysql.createConnection({
            host: keys.DB_ENDPOINT,
            user: keys.DB_USER,
            password: keys.DB_PASS,
            database: "subways"
        });
        
        connection.connect(function(error) {
            if (error) throw error;
            console.log("Connected!");
            
            var sql = 'INSERT INTO traintimes (snapshotUnix, snapshotNYC, routeId, stationIdGTFS, direction, trainOrderLine, trainOrderAll, arrivalTime, departureTime, updatedOn, timeToArrival, timeToDeparture) VALUES ?';
                
            connection.query(sql, [records], function (err, result) {
                if (err) throw err;
                console.log(`Insert Result: ${JSON.stringify(result)}`);
                connection.end(function(err) {
                    
                    if (err) {
                        console.log("Database update error:" + err);
                        reject(err);
                    }
                    
                    console.log("Connection closed.");
                    resolve();
                });
            });
        });
    });
}
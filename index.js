// Require modules here
var Twit = require('twit');
var moment = require('moment-timezone');
var Mta = require('mta-gtfs');
var keys = require('../keys/subway_watcher_keys');

// Include global variables here (if any)
var bot = new Twit({
    consumer_key:         keys.TWITTER_CONSUMER_KEY,
    consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
    access_token:         keys.TWITTER_ACCESS_TOKEN,
    access_token_secret:  keys.TWITTER_ACCESS_TOKEN_SECRET
});

var mta = new Mta({
    key: keys.MTA_API_KEY, // only needed for mta.schedule() method
    feed_id: 1             // optional, default = 1; F line is in id 21
});

// var f_train_stops = [167,221,222,223,224,225,226,227,228,229,230,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,267];

var train_line = "1";
var train_stops = [101,103,104,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,142];

var data_layout = [
    {
        "feed_id": 1,
        "train_lines": ["1", "2", "3", "4", "5", "6", "S"],
        "train_stops": [293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 367, 368, 369, 370, 371, 372, 373, 374, 375, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 389, 390, 391, 392, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446]
    },
    {
        "feed_id": 26,
        "train_lines": ["A", "C", "E", "H", "S"],
        "train_stops": [143, 144, 145, 146, 147, 148, 149, 150, 151, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209]
    },
    {
        "feed_id": 16,
        "train_lines": ["N", "Q", "R", "W"],
        "train_stops": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 71, 72, 73, 74, 75, 76, 77, 78, 79, 223, 461, 475, 476, 477]
    },
    {
        "feed_id": 21,
        "train_lines": ["B", "D", "F", "M"],
        "train_stops": [26, 27, 32, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 97, 98, 99, 100, 101, 102, 108, 109, 110, 111, 112, 113, 114, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277]
    },
    {
        "feed_id": 2,
        "train_lines": ["L"],
        "train_stops": [115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138]
    },
    {
        "feed_id": 31,
        "train_lines": ["G"],
        "train_stops": [236, 237, 238, 239, 240, 241, 242, 281, 282, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292]
    },
    {
        "feed_id": 36,
        "train_lines": ["J", "Z"],
        "train_stops": [80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 278, 279]
    },
    {
        "feed_id": 51,
        "train_lines": ["7"],
        "train_stops": [447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 471]
    }
    
];

var new_record = {};


exports.handler = function(event, context, callback){ 

    // funtional code goes here ... with the 'event' and 'context' coming from
    // whatever calls the lambda function (like CloudWatch or Alexa function).
    // callback function goes back to the caller.
    
    var tweet_options = {
        q: 'MTA OR @NYCTsubway OR (subway AND nyc) -RT',
        count: 100,
        result_type: 'recent',
    };
    
    // could do this as an allPromise, and write once everything comes back.
    
    getTweets(tweet_options)
    .then(getSubwayTimes())
    .then(getSubwayStatus())
    .then(function(){
        // format is callback(error, response);
        callback(null, new_record);
    })
    .catch(function(){
        console.log("Promise problem!");
        callback("Promise Error!");
    });
        

};

// Helper functions can go here
function getTweets(options) {
    return new Promise((resolve, reject) => {
        
        bot.get('search/tweets', options, function(err, data, response) {
            
            if (err){
                console.log("Twitter error:", err);
                reject(err);
                return null;
            }
            
            var mostest_latest = [];
            var time_now = moment();
            
            data.statuses.forEach(function(tweet){
                
                // Tweet time created_at format: Sun Aug 06 18:14:56 +0000 2017
                var tweet_time = moment(tweet.created_at, "ddd MMM DD HH:mm:ss ZZ YYYY");
                
                var time_difference = time_now.diff(tweet_time, "seconds");
                
                // only get tweets that are less than 60 seconds old
                if (time_difference < 60) {
                    mostest_latest.push(tweet);
                    // console.log("Time difference: ", time_difference);
                }
                
            });
            
            // add to the global record
            console.log("Got tweets.");
            new_record.tweets = mostest_latest;
            
            resolve();
            return;
            
        });    
    });
}

function getSubwayTimes() {
    return new Promise ((resolve, reject) => {

        var now = moment();
        
        mta.schedule(train_stops).then(function (result) {
            console.log("Got schedule.");
            
            new_record.rawdata = result;
            new_record.fetched = {
                "unix": now.format("X"),
                "mills": now.format("x"),
                "utc": now.utc().format("YYYY-MM-DDTHH:mm:ssZ"),
                "nyc": now.tz("America/New_York").format("YYYY-MM-DDTHH:mm:ss"),
                "dow": now.tz("America/New_York").format("e"), // 0-6
                "hour": now.tz("America/New_York").format("H"),
                "min": now.tz("America/New_York").format("m")
            };
            
            new_record.csv_row = {};
            
            train_stops.forEach((stop_number) => {
                
                var nb_station = stop_number + "N";
                var sb_station = stop_number + "S";
                var nb_minutes = null;
                var sb_minutes = null;
                var nb_delay = null;
                var sb_delay = null;
                
                // find the first train in the set that matches train_line
                // and also has an arrival time
                for (var i = 0; i < result.schedule[stop_number].N.length; i++) {
                    
                    if (result.schedule[stop_number].N[i].routeId == train_line && result.schedule[stop_number].N[i].arrivalTime != null) {
                        
                        nb_minutes = Math.round( moment.unix(result.schedule[stop_number].N[i].arrivalTime).diff(moment.unix(result.updatedOn), 'minutes', true) * 100)/100;
                        nb_delay = result.schedule[stop_number].N[i].delay;
                        break;
                    
                    }
                    
                }
                
                for (var j = 0; j < result.schedule[stop_number].S.length; j++) {
                    
                    if (result.schedule[stop_number].S[j].routeId == train_line && result.schedule[stop_number].S[j].arrivalTime != null) {
                        
                        sb_minutes = Math.round( moment.unix(result.schedule[stop_number].S[j].arrivalTime).diff(moment.unix(result.updatedOn), 'minutes', true) * 100) / 100;
                        sb_delay = result.schedule[stop_number].S[i].delay;
                        break;
                    
                    }
                    
                }
                
                new_record.csv_row[`${train_line}_${nb_station}_minutes`] = nb_minutes;
                new_record.csv_row[`${train_line}_${nb_station}_delay`] = nb_delay;
                new_record.csv_row[`${train_line}_${sb_station}_minutes`] = sb_minutes;
                new_record.csv_row[`${train_line}_${sb_station}_delay`] = sb_delay;
                
            });
            
            // console.log(JSON.stringify(new_record.times));
            resolve();
        });
    });
}

function getSubwayStatus() {
    return new Promise ((resolve, reject) => {
        mta.status('subway').then(function (result) {
            console.log("Got statuses.");
            new_record.status = result;
            resolve();
        });
    });
}
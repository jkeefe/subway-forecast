var mysql = require('mysql');
var keys = require('../../keys/subway_watcher_keys');

var connection = mysql.createConnection({
    host: keys.DB_ENDPOINT,
    user: keys.DB_USER,
    password: keys.DB_PASS,
    database: "subways"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    
    var sql = 'INSERT INTO traintimes (snapshotUnix, snapshotNYC, routeId, stationIdGTFS, direction, trainOrderLine, trainOrderAll, arrivalTime, departureTime, updatedOn, timeToArrival, timeToDeparture) VALUES ?';
    
    var values = [];
    
    var record =[ 
        1548035854,
        '2019-01-20 20:57:34.8',
        '1',
        '101',
        'N',
        0,
        0,
        1548036022,
        null,
        1548035844,
        178,
        null ];
        
    var record2 = [ 
        1548036110,
        '2019-01-20 21:01:50.9',
        '1',
        '108',
        'N',
        10,
        10,
        1548041250,
        1548041250,
        1548036099,
        5151,
        5151 ];
        
    values.push(record);
    values.push(record2);
    console.log(values);
    
    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log(`Insert Result: ${JSON.stringify(result)}`);
        connection.end(function(err) {
            console.log("Connection closed.");
        });
    });
});
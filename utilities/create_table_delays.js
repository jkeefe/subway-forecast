var mysql = require('mysql');
var keys = require('../../keys/subway_watcher_keys');

var connection = mysql.createConnection({
    host: keys.DB_ENDPOINT,
    user: keys.DB_USER,
    password: keys.DB_PASS,
    database: "delays"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
    var sql = 'CREATE TABLE statuses (id INT AUTO_INCREMENT PRIMARY KEY, snapshotUnix INT(10) UNSIGNED NOT NULL, snapshotNYC DATETIME NOT NULL, routeId VARCHAR(3) NOT NULL, postedTime DATETIME, postedDuration INT(10) UNSIGNED) DEFAULT CHARSET=utf8';
    
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
        connection.end(function(err) {
            console.log("Connection closed");
        });
    });
});
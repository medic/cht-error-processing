var dbConnection = SQL.connect({
    Driver: "postgreSQL",
    Host: "localhost",
    Port:"63333" ,
    Database: "pih_malawi",
    UserName: "ethanr",
    Password: process.argv[2]});

var sql = "SELECT * FROM couchdb WHERE doc ->> 'type' = 'feedback' AND (doc -> 'meta' ->> 'time')::timestamp > '2016-04-01'::timestamp limit 10";
var result = dbConnection.query(sql);
console.log(result);
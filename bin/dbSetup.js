var mysql = require('mysql2/promise')
var configuration = require("../configuration")
configuration.database = null;

var sql = [
  "CREATE DATABASE my_app",
  `CREATE TABLE my_app.users (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(255) NULL,
    last_name VARCHAR(255) NULL,
    age INT NULL,
    weight FLOAT NULL
  )`
]

mysql.createConnection(configuration)
  .then(function(connection) {
    console.log("Connected to the database")

    for (let statement of sql) {
      connection.execute(statement, null)
    }

    connection.end()
  })

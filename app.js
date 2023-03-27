// var mysql = require('mysql2')
var mysql = require("mysql2/promise")
var express = require("express")
var app = express()
var configuration = require("./configuration")

app.use(express.static("public"))

app.use(express.json())

// var connection = mysql.createConnection({
//   host: 'db', // This is the service name defined in the docker-compose file
//   user: 'root',
//   password: 'super'
// })

let dbConnection // This is initialized when the server starts

var users = []

app.get("/users", async function(request, response) {
  var results = await dbConnection.execute(`
    SELECT *
    FROM users
  `)

  console.log(results[0])
  response.json(results[0])
})

app.get("/users/:id", async function(request, response) {
  var id = request.params.id

  var results = await dbConnection.execute(`
    SELECT *
    FROM users
    WHERE id = ${id}
  `)

  console.log(results[0][0])
  response.json(results[0][0])
})

app.post("/users", async function(request, response) {
  var providedFirstName = request.body["firstName"]
  var providedLastName = request.body["lastName"]
  var providedAge = request.body["age"]
  var providedWeight = request.body["weight"]

  var sql = `
    INSERT INTO users (first_name, last_name, age, weight)
    VALUES (?, ?, ?, ?)
  `
  var values = [providedFirstName, providedLastName, providedAge, providedWeight]

  await dbConnection.execute(sql, values)

  var newUser = {
    firstName: providedFirstName,
    lastName: providedLastName,
    age: providedAge,
    weight: providedWeight,
  }

  response.json(newUser)
})

app.put("/users/:id", async function(request, response) {
  var id = request.params.id

  var providedFirstName = request.body["firstName"]
  var providedLastName = request.body["lastName"]
  var providedAge = request.body["age"]
  var providedWeight = request.body["weight"]

  var sql = `
    UPDATE users
    SET first_name = ?,
        last_name = ?,
        age = ?,
        weight = ?
    WHERE id = ?
  `
  var values = [providedFirstName, providedLastName, providedAge, providedWeight, id]

  await dbConnection.execute(sql, values)

  var user = {
    id: id,
    firstName: providedFirstName,
    lastName: providedLastName,
    age: providedAge,
    weight: providedWeight,
  }

  response.json(user)
})

app.delete("/users/:id", async function(request, response) {
  var id = request.params.id

  const sql = `
    DELETE FROM users
    WHERE id = ?
  `;
  await dbConnection.execute(sql, [id]);

  response.json({ msg: 'Deleted user' })
})

mysql.createConnection(configuration)
  .then(function(createdConnection) {
    dbConnection = createdConnection // This makes it globally available
    console.log("Connected to the database")

    // Start the server after connecting to the database
    app.listen(3000, function() {
      console.log("App is listening on port 3000")
    })
  })

module.exports = app

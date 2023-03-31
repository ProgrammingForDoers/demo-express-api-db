var mysql = require("mysql2/promise")
var express = require("express")
var configuration = require("./configuration")

var app = express()

app.use(express.static("public"))

app.use(express.json())

let dbConnection // This is initialized when the server starts

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
  var newUser = {
    firstName: request.body["firstName"],
    lastName: request.body["lastName"],
    age: request.body["age"],
    weight: request.body["weight"]
  }
  console.log(newUser)

  var sql = `
    INSERT INTO users (first_name, last_name, age, weight)
    VALUES (?, ?, ?, ?)
  `
  var values = [newUser["firstName"], newUser["lastName"], newUser["age"], newUser["weight"]]

  await dbConnection.execute(sql, values)

  response.json(newUser)
})

app.put("/users/:id", async function(request, response) {
  var user = {
    id: request.params.id,
    firstName: request.body["firstName"],
    lastName: request.body["lastName"],
    age: request.body["age"],
    weight: request.body["weight"]
  }
  console.log(user)

  var sql = `
    UPDATE users
    SET first_name = ?,
        last_name = ?,
        age = ?,
        weight = ?
    WHERE id = ?
  `
  var values = [user["firstName"], user["lastName"], user["age"], user["weight"], user["id"]]

  await dbConnection.execute(sql, values)

  response.json(user)
})

app.delete("/users/:id", async function(request, response) {
  var id = request.params.id

  const sql = `
    DELETE FROM users
    WHERE id = ?
  `;
  await dbConnection.execute(sql, [id]);

  message = { msg: "Deleted user" }
  console.log(message)
  response.json(message)
})

mysql.createConnection(configuration)
  .then(function(createdConnection) {
    dbConnection = createdConnection // This makes it globally available
    console.log("[Connected to the database]")

    // Start the server after connecting to the database
    app.listen(3000, function() {
      console.log("> Server listening on http://localhost:3000")
    })
  })

module.exports = app

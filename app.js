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
// });

let dbConnection; // This is initialized when the server starts

var users = []

app.get("/users", async function(request, response) {

  var results = await dbConnection.execute(`
    SELECT *
    FROM users
  `);

  console.log("Meow")
  console.log(results[0])
  response.json(results[0])
})

app.get("/users/:id", async function(request, response) {
  // NOTE: `params` accesses values from the URL path  (:id)
  var id = request.params.id

  var results = await dbConnection.execute(`
    SELECT *
    FROM users
    WHERE id = ${id}
  `);

  console.log(results[0])
  // Respond with the specified user
  response.json()
})

app.post("/users", async function(request, response) {
  // NOTE: `body` accesses values from the JSON request body
  var providedFirstName = request.body["firstName"]
  var providedLastName = request.body["lastName"]
  var providedAge = request.body["age"]
  var providedWeight = request.body["weight"]

  var sql = `
    INSERT INTO users (first_name, last_name, age, weight)
    VALUES (?, ?, ?, ?)
  `
  var values = [providedFirstName, providedLastName, providedAge, providedWeight]

  await dbConnection.execute(sql, values);

  var newUser = {
    firstName: providedFirstName,
    lastName: providedLastName,
    age: providedAge,
    weight: providedWeight,
  }

  // Respond with the new user
  response.json(newUser)
})

app.put("/users/:id", async function(request, response) {
  // NOTE: `params` accesses values from the URL path (:id)
  var id = request.params.id

  var userIndex = findUserIndexById(id)

  var providedFirstName = request.body["firstName"]
  var providedLastName = request.body["lastName"]
  var providedAge = request.body["age"]
  var providedWeight = request.body["weight"]

  var user = users[userIndex]
  user["firstName"] = providedFirstName
  user["lastName"] = providedLastName
  user["age"] = providedAge
  user["weight"] = providedWeight

  console.log(user)

  // Respond with the new user
  response.json(user)
})

app.delete("/users/:id", async function(request, response) {
  // NOTE: `params` accesses values from the URL path
  var id = request.params.id

  var userIndex = findUserIndexById(id);

  users.splice(userIndex, 1);

  // Respond with a message
  response.json({ msg: 'Deleted user' })
})

function findUserIndexById(id) {
  for (var i = 0; i < users.length; i++) {
    var user = users[i]
    if (user["id"] == id) {
      return i;
    }
  }
}

mysql.createConnection(configuration)
  .then(function(createdConnection) {
    dbConnection = createdConnection // This makes it globally available
    console.log("Connected to the database")

    // Start the server after connecting to the database
    app.listen(3000, function() {
      console.log("App is listening on port 3000")
    });
  })

module.exports = app

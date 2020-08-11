// INITIAL SETUP
var express = require("express");
var mysql = require("./dbcon.js");
var bodyParser = require("body-parser");

var app = express();

var handlebars = require("express-handlebars").create({
  defaultLayout: "main"
});

// SETTING UP BODY-PARSER
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// public folder
app.use(express.static("public"));

// SETTING THE TEMPLATING ENGINE
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// SETTING THE PORT
app.set("port", process.argv[2]);

// ROUTES

// GET REQUEST
app.get("/", function(req, res, next) {
  // create table
  var createString =
    "CREATE TABLE workouts(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "reps INT," +
    "weight INT," +
    "date DATE NOT NULL," +
    "lbs BOOLEAN)";
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err) {
    if (err) {
      next(err);
      return;
    }
    mysql.pool.query(createString, function(err) {
      if (err) {
        next(err);
        return;
      }
    });
    res.render("home");
  });
});

// post request
app.post("/", function(req, res, next) {
  // for creating new exercise
  if (req.body.create) {
    // user input or null for all fields
    let reps = parseInt(req.body.reps) || null;
    let weight = parseInt(req.body.weight) || null;
    let lbs = parseInt(req.body.unit) || null;
    mysql.pool.query(
      "INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)",
      [req.body.name, reps, weight, req.body.date, lbs],
      function(err, rows) {
        if (err) {
          next(err);
          return;
        }
        mysql.pool.query("SELECT * FROM workouts", function(err, rows, fields) {
          if (err) {
            next(err);
            return;
          }
          res.send(rows);
        });
      }
    );
    // edit exercise
  } else if (req.body.edit) {
    // get row based on id and make query
    mysql.pool.query(
      "SELECT * FROM workouts WHERE id=?",
      [req.body.id],
      function(err, result) {
        if (err) {
          next(err);
          return;
        }
        let currentValues = result[0];
        // make update query and pass in values
        mysql.pool.query(
          "UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
          [
            req.body.name || currentValues.name,
            req.body.reps || currentValues.reps,
            req.body.weight || currentValues.weight,
            req.body.date || currentValues.date,
            req.body.unit || currentValues.lbs,
            req.body.id
          ],
          function(err, result) {
            if (err) {
              next(err);
              return;
            }
            // make another query for all data and send it over.
            mysql.pool.query("SELECT * FROM workouts", function(
              err,
              rows,
              fields
            ) {
              if (err) {
                next(err);
                return;
              }
              res.send(rows);
            });
          }
        );
      }
    );
    // delete exercise
  } else {
    //delete row based on id
    mysql.pool.query(
      "DELETE FROM workouts WHERE id = ?",
      [req.body.id],
      function(err, result) {
        if (err) {
          next(err);
          return;
        }
        // make another query for all data and send it over.
        mysql.pool.query("SELECT * FROM workouts", function(err, rows, fields) {
          if (err) {
            next(err);
            return;
          }
          res.send(rows);
        });
      }
    );
  }
});

// ERROR HANDLERS
app.use(function(req, res) {
  res.status(404);
  res.render("404");
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

// STARTING THE SERVER
app.listen(app.get("port"), function() {
  console.log(
    "Express started on http://localhost:" +
      app.get("port") +
      "; press Ctrl-C to terminate."
  );
});
/*
app.get("/reset-table", function(req, res, next) {
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err) {
    //replace your connection pool with the your variable containing the connection pool
    var createString =
      "CREATE TABLE workouts(" +
      "id INT PRIMARY KEY AUTO_INCREMENT," +
      "name VARCHAR(255) NOT NULL," +
      "reps INT," +
      "weight INT," +
      "date DATE," +
      "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err) {
      context.results = "Table reset";
      res.render("home", context);
    });
  });
});*/

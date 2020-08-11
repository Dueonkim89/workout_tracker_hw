var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 10,
  // classmysql.engr.oregonstate.edu
  host: "classmysql.engr.oregonstate.edu",
  user: "cs290_kimdu",
  password: "4777",
  database: "cs290_kimdu"
});

module.exports.pool = pool;

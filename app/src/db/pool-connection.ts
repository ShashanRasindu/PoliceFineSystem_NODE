
import mysql = require("mysql");

export const Pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    database: "policesystem",
    // password: "",
    password: "ShanAWS2020",
    user: "root",
    connectionLimit: 10
});
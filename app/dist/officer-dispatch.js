"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var pool_connection_1 = require("./db/pool-connection");
var CryptoJS = require("crypto-js");
var router = express.Router();
var winston = require('winston');
var logConfigaration = {
    'transports': [
        new winston.transports.File({
            filename: './logs/officerLogin.log',
        })
    ]
};
var logger = winston.createLogger(logConfigaration);
var date = new Date().toLocaleString();
exports.default = router;
router.route("")
    .post(function (req, res) {
    // console.log(req.body);
    var sql = "SELECT password, name, branch FROM `traffic_officer` WHERE  nic=?";
    if (("officerID" in req.body) && ("Pass" in req.body)) {
        pool_connection_1.Pool.query(sql, [req.body.officerID], function (err, results) {
            // console.log(results);
            if (err) {
                logger.log({
                    date: date,
                    level: 'error',
                    message: '' + err,
                    Nic: req.body.officerID
                });
                console.error(err);
                res.sendStatus(500);
                return;
            }
            else {
                var passJ = JSON.parse(JSON.stringify(results));
                var secretKey = 'shashan';
                //decrypt DB password
                var bytes = CryptoJS.AES.decrypt(passJ[0].password, secretKey);
                var decruptDB = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                //decrypt Body Password
                var bytess = CryptoJS.AES.decrypt(req.body.Pass, secretKey);
                var decruptBody = JSON.parse(bytess.toString(CryptoJS.enc.Utf8));
                if (!(decruptDB === decruptBody)) {
                    res.json({});
                    logger.log({
                        date: date,
                        level: 'error',
                        message: 'officer incorrect Password',
                        Nic: req.body.officerID,
                    });
                    return;
                }
                var officerdata = {
                    nic: req.body.officerID,
                    name: passJ[0].name,
                    branch: passJ[0].branch
                };
                res.json(officerdata);
                logger.log({
                    date: date,
                    level: 'info',
                    message: 'Success Login Officer',
                    Nic: req.body.officerID
                });
            }
        });
    }
    else {
        logger.log({
            date: date,
            level: 'error',
            message: 'request error ID or PW ',
            Nic: req.body.officerID
        });
    }
});

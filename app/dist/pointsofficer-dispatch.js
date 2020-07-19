"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var pool_connection_1 = require("./db/pool-connection");
var router = express.Router();
exports.default = router;
var winston = require('winston');
var logConfigaration = {
    'transports': [
        new winston.transports.File({
            filename: './logs/PointOfficer.log',
        })
    ]
};
var logger = winston.createLogger(logConfigaration);
var date = new Date().toLocaleString();
router.route("")
    .post(function (req, res) {
    // console.log(req.body);
    var sql = "SELECT count(t_point) as points FROM  officer_point WHERE  t_nic=? and MONTH(create_date)=?";
    if (("Tid" in req.body)) {
        // console.log('weda');
        var month = new Date();
        pool_connection_1.Pool.query(sql, [req.body.Tid, month.getMonth() + 1], function (err, results) {
            if (err) {
                logger.log({
                    date: date,
                    level: 'error',
                    message: '' + err,
                    Nic: req.body.Tid
                });
                console.error(err);
                res.sendStatus(500);
                return;
            }
            else {
                res.json(results);
                // console.log(req.body);
                // console.log(results);
                logger.log({
                    date: date,
                    level: 'info',
                    message: 'Success Point send',
                    Nic: req.body.Tid
                });
            }
        });
    }
    else {
        // console.log('weda ne');
        logger.log({
            date: date,
            level: 'error',
            message: 'request error TID ',
            Nic: req.body.Tid
        });
    }
});

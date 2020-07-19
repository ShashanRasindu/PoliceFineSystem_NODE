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
            filename: './logs/payment.log',
        })
    ]
};
var logger = winston.createLogger(logConfigaration);
var date = new Date().toLocaleString();
var Dtype;
router.route("/:Dlno(B\\d{7})")
    .get(function (req, res) {
    // console.log("weda");
    var sql1 = "SELECT type FROM driver where d_id=?";
    pool_connection_1.Pool.query(sql1, [req.params.Dlno], function (err, results) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: 'sql Error',
                Dlno: req.params.Dlno
            });
            return;
        }
        if (results.length > 0) {
            // res.json(results);
            var passJ = JSON.parse(JSON.stringify(results));
            Dtype = passJ[0].type;
            // console.log(Dtype);
            logger.log({
                date: date,
                level: 'info',
                message: 'Driver In',
                DNic: req.params.Dlno,
            });
            var sql2 = "SELECT fine_id ,vehical_no ,  price*1.1 as price,c_date ,e_date FROM fine_bill WHERE  dlno=? and paid_type='no'";
            pool_connection_1.Pool.query(sql2, [req.params.Dlno], function (err, results) {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                    logger.log({
                        date: date,
                        level: 'error',
                        message: 'sql Error' + err,
                        Dlno: req.params.Dlno
                    });
                    return;
                }
                if (results.length > 0) {
                    var DriverDetails = {
                        Dtype: Dtype,
                        bill: results
                    };
                    res.json(DriverDetails);
                    // console.log(results);
                    logger.log({
                        date: date,
                        level: 'info',
                        message: 'Success Driver Detail send',
                        DNic: req.params.Dlno,
                    });
                }
                else {
                    res.json("Bill not Found");
                    logger.log({
                        date: date,
                        level: 'error',
                        message: 'Driver IN but No Bill',
                        Dlno: req.params.Dlno
                    });
                }
            });
        }
        else {
            var as = void 0;
            as = [];
            if (results.toString() == as) {
                res.json("Driver not Found");
                logger.log({
                    date: date,
                    level: 'error',
                    message: 'Driver not Found',
                    DNic: req.params.Dlno,
                });
                return;
            }
        }
    });
});
router.route("")
    .post(function (req, res) {
    if (!(("country" in req.body) && ("ClientIP" in req.body) && ("Browser" in req.body) && ("device" in req.body) && ("billRefNo" in req.body) && ("fullPrice" in req.body))) {
        res.sendStatus(400);
        logger.log({
            date: date,
            level: 'error',
            message: 'request error passing value ',
            Client: req.body
        });
        return;
    }
    else {
        var sql = "UPDATE fine_bill SET paid_type=?,paid_value=? , clientIP=? ,device=? , clientCountry=? , Browse=?  WHERE  fine_id=?";
        // sql = Pool.format(sql, [req.body.name, req.body.address, req.params.id]);
        pool_connection_1.Pool.query(sql, ['yes', req.body.fullPrice, req.body.ClientIP, req.body.device, req.body.country, JSON.stringify(req.body.Browser), req.body.billRefNo], function (err, results) {
            // console.log(results);
            if (err) {
                console.error(err);
                res.sendStatus(500);
                logger.log({
                    date: date,
                    level: 'error',
                    message: 'sql error' + err,
                    Client: req.body,
                });
                return;
            }
            if (!(results.changedRows > 0)) {
                res.sendStatus(500);
                logger.log({
                    date: date,
                    level: 'error',
                    message: 'Payment Not Update',
                    Client: req.body,
                });
                return;
            }
            else {
                res.json("Bill Payed");
                logger.log({
                    date: date,
                    level: 'info',
                    message: 'Success Payment Update',
                    Client: req.body,
                });
            }
        });
    }
});

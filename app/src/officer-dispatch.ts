import express = require("express");
import {Pool} from "./db/pool-connection";
import CryptoJS = require("crypto-js");




const router=express.Router();
const winston = require('winston');
const logConfigaration = {
    'transports': [
        new  winston.transports.File({

            filename: './logs/officerLogin.log',
            // datePattern: 'yyyy-MM-dd-'
        })
    ]
};
const logger = winston.createLogger(logConfigaration);
let date = new Date().toLocaleString();
export default router;

router.route("")
    .post( (req, res) => {
        // console.log(req.body);
        let sql = "SELECT password, name, branch FROM `traffic_officer` WHERE  nic=?";
        if (("officerID" in req.body) && ("Pass" in req.body)) {
            Pool.query(sql, [req.body.officerID],(err, results) => {
                // console.log(results);
                if (err) {
                    logger.log({
                        date: date,
                        level: 'error',
                        message: ''+err,
                        Nic : req.body.officerID
                    });
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }else {
                    let passJ = JSON.parse(JSON.stringify(results));
                    let secretKey = 'shashan';
                //decrypt DB password
                    let bytes = CryptoJS.AES.decrypt(passJ[0].password,secretKey);
                    var decruptDB = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                //decrypt Body Password
                    let bytess = CryptoJS.AES.decrypt(req.body.Pass,secretKey);
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

                    const officerdata = {
                        nic : req.body.officerID,
                        name : passJ[0].name,
                        branch : passJ[0].branch
                    };


                    res.json(officerdata);


                    logger.log({
                        date: date,
                        level: 'info',
                        message: 'Success Login Officer',
                        Nic:  req.body.officerID
                    });


                }
            });
        }else {
            logger.log({
                date: date,
                level: 'error',
                message: 'request error ID or PW ',
                Nic : req.body.officerID
            });
        }


    })

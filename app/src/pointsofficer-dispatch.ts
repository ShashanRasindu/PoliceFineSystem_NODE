import express = require("express");
import {Pool} from "./db/pool-connection";


const router=express.Router();
export default router;


const winston = require('winston');
const logConfigaration = {
    'transports': [
        new  winston.transports.File({

            filename: './logs/PointOfficer.log',
            // datePattern: 'yyyy-MM-dd-'
        })
    ]
};
const logger = winston.createLogger(logConfigaration);
let date = new Date().toLocaleString();



router.route("")
    .post( (req, res) => {
        // console.log(req.body);
        let sql = "SELECT count(t_point) as points FROM  officer_point WHERE  t_nic=? and MONTH(create_date)=?";
        if (("Tid" in req.body)) {
            // console.log('weda');
            let month = new Date();

            Pool.query(sql, [req.body.Tid , month.getMonth()+1],(err, results) => {

                if (err) {
                    logger.log({
                        date: date,
                        level: 'error',
                        message: ''+err,
                        Nic : req.body.Tid
                    });
                    console.error(err);
                    res.sendStatus(500);
                    return;
                }else {

                    res.json(results);
                    // console.log(req.body);
                    // console.log(results);

                    logger.log({
                        date: date,
                        level: 'info',
                        message: 'Success Point send',
                        Nic:  req.body.Tid
                    });




                }
            });
        }else {
            // console.log('weda ne');
            logger.log({
                date: date,
                level: 'error',
                message: 'request error TID ',
                Nic : req.body.Tid
            });
        }


    })

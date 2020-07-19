import express = require("express");
import {Pool} from "./db/pool-connection";
import {PoolConnection} from "mysql";
import {Request, Response} from "express";
import {executeQuery} from "./db/util";


const router=express.Router();
export default router;



const winston = require('winston');
const logConfigaration = {
    'transports': [
        new  winston.transports.File({

            filename: './logs/Driver.log',
            // datePattern: 'yyyy-MM-dd-'
        })
    ]
};
const logger = winston.createLogger(logConfigaration);
let date = new Date().toLocaleString();



router.route("")
    .post( (req, res) => {
        // console.log(req.body);
        let sql = "SELECT * FROM driver WHERE  d_id=?";
        if (("driverID" in req.body)) {
        Pool.query(sql, [req.body.driverID],(err, results) => {
            // console.log(results);
            if (err) {
                logger.log({
                    date: date,
                    level: 'error',
                    message: ''+err,
                    DNic : req.body.driverID,
                });
                console.error(err);
                res.sendStatus(500);
                return;
            }else {
            let as: any;
            as=[];
                if (results.toString() == as) {
                    res.json("Driver not Found");
                    logger.log({
                        date: date,
                        level: 'error',
                        message: 'Driver not Found',
                        DNic : req.body.driverID,
                    });
                    return;
                }

                res.json(results);



                logger.log({
                    date: date,
                    level: 'info',
                    message: 'Success Driver Details send',
                    DNic : req.body.driverID,
                });
                // const accountSid = 'AC1788d137b9ab45217235c33b8b63393c';
                // const authToken = 'acfbc22d04c8165c03af2a1e24a84e7f';
                //
                // const client = require('twilio')(accountSid, authToken);
                //
                // client.messages.create({
                //     to: '+94716363828',
                //     from: '+17622262828',
                //     body: 'this is test mg'
                // });


            }
        });
        }
            else {
            logger.log({
                date: date,
                level: 'error',
                message: 'request error driverID ',
                DNic : req.body.Tid,
                Tnic: req.body.driverID
            });
        }

    })

router.route("/newDriver")
    .post( (req, res) => {
        // console.log(req.body);
        // let sql = "SELECT * FROM driver WHERE  d_id=?";
        if (!(("dlno" in req.body)&&("name" in req.body)&&("Tnic" in req.body) && ("nic" in req.body) && ("phone" in req.body) && ("address" in req.body) )) {
            res.sendStatus(400);
            logger.log({
                date: date,
                level: 'error',
                message: 'request error passing value ',
                TNic : req.body.Tnic
            });
            return;
        }
        Pool.getConnection((err, connection) => {

            if (err) {
                console.error(err);
                res.sendStatus(500);
                logger.log({
                    date: date,
                    level: 'error',
                    message: ''+err,
                    Nic : req.body.Tnic
                });
                return;
            }

            connection.beginTransaction(err1 => {

                if (err1) {
                    console.error(err1);
                    res.sendStatus(500);
                    connection.release();
                    logger.log({
                        date: date,
                        level: 'error',
                        message: ''+err1,
                        Nic : req.body.Tnic
                    });
                    return;
                }

                placeFinebills(connection, req, res);

            });

        });

    })



// @ts-ignore
async function placeFinebills(connection: PoolConnection, req: Request, res: Response) {



    try {

        // let result = await executeQuery(connection, 'SELECT nic FROM driver WHERE  nic=? ',
        //     [req.body.nic]);
        //
        // // console.log(result);
        //
        // let points = JSON.parse(JSON.stringify(result));
        //
        //
        // console.log(points[0]);
        // let Pid = points[0].nic;
        //


       let result = await executeQuery(connection, 'INSERT INTO `driver` (nic , d_id , name , address, phone) VALUES (?,?,?,?,?)',
            [req.body.nic,req.body.dlno,req.body.name,req.body.address,req.body.phone]);

        if (result.affectedRows === 0) {

            connection.rollback();
            connection.release();
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: 'Driver is already excite',
                TNic : req.body.Tnic,
                Dnic: req.body.dlno

            });
            return;
        }


        connection.commit();
        connection.release();
        res.status(201).json({});
        logger.log({
            date: date,
            level: 'info',
            message: 'Driver Save Success',
            TNic : req.body.Tnic,
            Dnic: req.body.dlno
        });

    } catch (e) {

        console.error(e);
        connection.rollback();
        connection.release();
        res.sendStatus(500);
        logger.log({
            date: date,
            level: 'error',
            message: ''+e,
            Nic : req.body.Tnic
        });
    }
}


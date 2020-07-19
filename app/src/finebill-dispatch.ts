import express = require("express");
import {Pool} from "./db/pool-connection";
import {PoolConnection} from "mysql";
import {executeQuery} from "./db/util";
import {json, Request, Response} from "express";
import Nexmo from 'nexmo';
const router=express.Router();
export default router;



const winston = require('winston');
const logConfigaration = {
    'transports': [
        new  winston.transports.File({

            filename: './logs/FineBill.log',
            // datePattern: 'yyyy-MM-dd-'
        })
    ]
};
const logger = winston.createLogger(logConfigaration);
let date = new Date().toLocaleString();


router.route("")
    .post( (req, res) => {
        // console.log(req.body);
        // let sql = "SELECT * FROM driver WHERE  d_id=?";
        if (!(("Dlno" in req.body)&&("Mname" in req.body)&&("Tnic" in req.body)  && ("Dphone" in req.body) && ("Vtype" in req.body) && ("Vno" in req.body) && ("Mno" in req.body) && ("Loc" in req.body))) {
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

                placeFinebill(connection, req, res);

            });

        });

    })


// @ts-ignore
async function placeFinebill(connection: PoolConnection, req: Request, res: Response) {



    try {

        let result = await executeQuery(connection, 'SELECT id,fine_name, t_point, D_point, price FROM points WHERE  id=? ',
            [req.body.Mno]);
        let as: any;
        as=[];
        // console.log(result);
         if (result.toString() == as)
         {
             // console.log("weda");
             connection.rollback();
             connection.release();
             res.sendStatus(500);
             logger.log({
                 date: date,
                 level: 'error',
                 message: 'Point table error',
                 TNic : req.body.Tnic,
                 Dnic: req.body.Dlno,
                 Point: req.body.Mno

             });
             return;
         }
        logger.log({
            date: date,
            level: 'info',
            message: 'Point info ',
            TNic : req.body.Tnic,
            Dnic: req.body.Dlno,
            Point: req.body.Mno
        });
        // console.log(result);

        let points = JSON.parse(JSON.stringify(result));


        // console.log(points[0]);
        let Pid = points[0].id;
        let Ptraffic = points[0].t_point;
        let Pdriver = points[0].D_point;
        let Pfine = points[0].price;
        let Fname = points[0].fine_name;

        let today = new Date();
        let endDate = '2020-08-08'


        result = await executeQuery(connection, 'INSERT INTO `fine_bill` (t_nic ,dlno ,point_id, price,e_date, location, vehical_no, v_type  ) VALUES (?,?,?,?,?,?,?,?)',
            [req.body.Tnic ,req.body.Dlno,Pid,Pfine,endDate,req.body.Loc,req.body.Vno,req.body.Vtype]);

        if (result.affectedRows === 0) {
            connection.rollback();
            connection.release();
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: 'Fine Bill table error',
                TNic : req.body.Tnic,
                Dnic: req.body.Dlno

            });
            return;
        }

        result = await executeQuery(connection, 'INSERT INTO `driver_point` (dlno, point_id, d_point ) VALUES (?,?,?)',
            [req.body.Dlno,Pid,Pdriver]);

        if (result.affectedRows === 0) {
            connection.rollback();
            connection.release();
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: 'Driver Point table error',
                TNic : req.body.Tnic,
                Dnic: req.body.Dlno

            });
            return;
        }

        result = await executeQuery(connection, 'INSERT INTO `officer_point` (t_nic,point_id,t_point  ) VALUES (?,?,?)',
            [req.body.Tnic,Pid,Ptraffic]);

        if (result.affectedRows === 0) {
            connection.rollback();
            connection.release();
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: 'Officer Poit table error',
                TNic : req.body.Tnic,
                Dnic: req.body.Dlno

            });
            return;
        }

        result = await executeQuery(connection, 'UPDATE `driver` SET phone=? WHERE d_id=?',
            [req.body.Dphone,req.body.Dlno]);

        if (result.affectedRows === 0) {
            connection.rollback();
            connection.release();
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: 'Driver Phone Number update error',
                TNic : req.body.Tnic,
                Dnic: req.body.Dlno

            });
            return;
        }
        connection.commit();
        connection.release();
        res.status(201).json({});
        logger.log({
            date: date,
            level: 'info',
            message: 'Fine Bill Save Success',
            TNic : req.body.Tnic,
            Dnic: req.body.Dlno
        });


        // let number = "94"+req.body.Dphone;
        // let  message = "License no :"+req.body.Dlno+"  "+"  Vno:"+req.body.Vno+" Mistake : "+Fname+" "+" Fine : "+Pfine+" "+" Please settle the Payment before"+" "+endDate;
        // const Nexmo = require('nexmo');
        //
        // const nexmo = new Nexmo({
        //     apiKey: '76b3b220',
        //     apiSecret: '9kdPa5I2zq0VGZEb',
        // });
        //
        // const from = 'Fine SMS';
        // const to = number;
        // const text = message;
        //
        // nexmo.message.sendSms(from, to, text, (err:any,responseData:any) => {
        //
        //     if (err) {
        //         console.log(err);
        //         logger.log({
        //             date: date,
        //             level: 'error',
        //             message: 'SMS  API'+err,
        //             TNic : req.body.Tnic,
        //             Dnic: req.body.Dlno
        //         });
        //         return;
        //     } else {
        //         if (responseData.messages[0]['status'] === "0") {
        //
        //             connection.commit();
        //             connection.release();
        //             res.status(201).json({});
        //             logger.log({
        //                 date: date,
        //                 level: 'info',
        //                 message: 'Fine Bill Save Success',
        //                 TNic : req.body.Tnic,
        //                 Dnic: req.body.Dlno
        //             });
        //         } else {
        //
        //             console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
        //             logger.log({
        //                 date: date,
        //                 level: 'error',
        //                 message: 'SMS  API'+ responseData.messages[0]['error-text'],
        //                 TNic : req.body.Tnic,
        //                 Dnic: req.body.Dlno
        //             });
        //             return;
        //         }
        //     }
        // });
        //




    } catch (e) {
        console.error(e);
        connection.rollback();
        connection.release();
        res.sendStatus(500);
    }
}

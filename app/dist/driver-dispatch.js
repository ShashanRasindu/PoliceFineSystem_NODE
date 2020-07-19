"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var pool_connection_1 = require("./db/pool-connection");
var util_1 = require("./db/util");
var router = express.Router();
exports.default = router;
var winston = require('winston');
var logConfigaration = {
    'transports': [
        new winston.transports.File({
            filename: './logs/Driver.log',
        })
    ]
};
var logger = winston.createLogger(logConfigaration);
var date = new Date().toLocaleString();
router.route("")
    .post(function (req, res) {
    // console.log(req.body);
    var sql = "SELECT * FROM driver WHERE  d_id=?";
    if (("driverID" in req.body)) {
        pool_connection_1.Pool.query(sql, [req.body.driverID], function (err, results) {
            // console.log(results);
            if (err) {
                logger.log({
                    date: date,
                    level: 'error',
                    message: '' + err,
                    DNic: req.body.driverID,
                });
                console.error(err);
                res.sendStatus(500);
                return;
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
                        DNic: req.body.driverID,
                    });
                    return;
                }
                res.json(results);
                logger.log({
                    date: date,
                    level: 'info',
                    message: 'Success Driver Details send',
                    DNic: req.body.driverID,
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
            DNic: req.body.Tid,
            Tnic: req.body.driverID
        });
    }
});
router.route("/newDriver")
    .post(function (req, res) {
    // console.log(req.body);
    // let sql = "SELECT * FROM driver WHERE  d_id=?";
    if (!(("dlno" in req.body) && ("name" in req.body) && ("Tnic" in req.body) && ("nic" in req.body) && ("phone" in req.body) && ("address" in req.body))) {
        res.sendStatus(400);
        logger.log({
            date: date,
            level: 'error',
            message: 'request error passing value ',
            TNic: req.body.Tnic
        });
        return;
    }
    pool_connection_1.Pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err);
            res.sendStatus(500);
            logger.log({
                date: date,
                level: 'error',
                message: '' + err,
                Nic: req.body.Tnic
            });
            return;
        }
        connection.beginTransaction(function (err1) {
            if (err1) {
                console.error(err1);
                res.sendStatus(500);
                connection.release();
                logger.log({
                    date: date,
                    level: 'error',
                    message: '' + err1,
                    Nic: req.body.Tnic
                });
                return;
            }
            placeFinebills(connection, req, res);
        });
    });
});
// @ts-ignore
function placeFinebills(connection, req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, util_1.executeQuery(connection, 'INSERT INTO `driver` (nic , d_id , name , address, phone) VALUES (?,?,?,?,?)', [req.body.nic, req.body.dlno, req.body.name, req.body.address, req.body.phone])];
                case 1:
                    result = _a.sent();
                    if (result.affectedRows === 0) {
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        logger.log({
                            date: date,
                            level: 'error',
                            message: 'Driver is already excite',
                            TNic: req.body.Tnic,
                            Dnic: req.body.dlno
                        });
                        return [2 /*return*/];
                    }
                    connection.commit();
                    connection.release();
                    res.status(201).json({});
                    logger.log({
                        date: date,
                        level: 'info',
                        message: 'Driver Save Success',
                        TNic: req.body.Tnic,
                        Dnic: req.body.dlno
                    });
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    console.error(e_1);
                    connection.rollback();
                    connection.release();
                    res.sendStatus(500);
                    logger.log({
                        date: date,
                        level: 'error',
                        message: '' + e_1,
                        Nic: req.body.Tnic
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

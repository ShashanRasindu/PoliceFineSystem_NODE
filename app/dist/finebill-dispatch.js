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
            filename: './logs/FineBill.log',
        })
    ]
};
var logger = winston.createLogger(logConfigaration);
var date = new Date().toLocaleString();
router.route("")
    .post(function (req, res) {
    // console.log(req.body);
    // let sql = "SELECT * FROM driver WHERE  d_id=?";
    if (!(("Dlno" in req.body) && ("Mname" in req.body) && ("Tnic" in req.body) && ("Dphone" in req.body) && ("Vtype" in req.body) && ("Vno" in req.body) && ("Mno" in req.body) && ("Loc" in req.body))) {
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
            placeFinebill(connection, req, res);
        });
    });
});
// @ts-ignore
function placeFinebill(connection, req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, as, points, Pid, Ptraffic, Pdriver, Pfine, Fname, today, endDate, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, util_1.executeQuery(connection, 'SELECT id,fine_name, t_point, D_point, price FROM points WHERE  id=? ', [req.body.Mno])];
                case 1:
                    result = _a.sent();
                    as = void 0;
                    as = [];
                    // console.log(result);
                    if (result.toString() == as) {
                        // console.log("weda");
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        logger.log({
                            date: date,
                            level: 'error',
                            message: 'Point table error',
                            TNic: req.body.Tnic,
                            Dnic: req.body.Dlno,
                            Point: req.body.Mno
                        });
                        return [2 /*return*/];
                    }
                    logger.log({
                        date: date,
                        level: 'info',
                        message: 'Point info ',
                        TNic: req.body.Tnic,
                        Dnic: req.body.Dlno,
                        Point: req.body.Mno
                    });
                    points = JSON.parse(JSON.stringify(result));
                    Pid = points[0].id;
                    Ptraffic = points[0].t_point;
                    Pdriver = points[0].D_point;
                    Pfine = points[0].price;
                    Fname = points[0].fine_name;
                    today = new Date();
                    endDate = '2020-08-08';
                    return [4 /*yield*/, util_1.executeQuery(connection, 'INSERT INTO `fine_bill` (t_nic ,dlno ,point_id, price,e_date, location, vehical_no, v_type  ) VALUES (?,?,?,?,?,?,?,?)', [req.body.Tnic, req.body.Dlno, Pid, Pfine, endDate, req.body.Loc, req.body.Vno, req.body.Vtype])];
                case 2:
                    result = _a.sent();
                    if (result.affectedRows === 0) {
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        logger.log({
                            date: date,
                            level: 'error',
                            message: 'Fine Bill table error',
                            TNic: req.body.Tnic,
                            Dnic: req.body.Dlno
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, util_1.executeQuery(connection, 'INSERT INTO `driver_point` (dlno, point_id, d_point ) VALUES (?,?,?)', [req.body.Dlno, Pid, Pdriver])];
                case 3:
                    result = _a.sent();
                    if (result.affectedRows === 0) {
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        logger.log({
                            date: date,
                            level: 'error',
                            message: 'Driver Point table error',
                            TNic: req.body.Tnic,
                            Dnic: req.body.Dlno
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, util_1.executeQuery(connection, 'INSERT INTO `officer_point` (t_nic,point_id,t_point  ) VALUES (?,?,?)', [req.body.Tnic, Pid, Ptraffic])];
                case 4:
                    result = _a.sent();
                    if (result.affectedRows === 0) {
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        logger.log({
                            date: date,
                            level: 'error',
                            message: 'Officer Poit table error',
                            TNic: req.body.Tnic,
                            Dnic: req.body.Dlno
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, util_1.executeQuery(connection, 'UPDATE `driver` SET phone=? WHERE d_id=?', [req.body.Dphone, req.body.Dlno])];
                case 5:
                    result = _a.sent();
                    if (result.affectedRows === 0) {
                        connection.rollback();
                        connection.release();
                        res.sendStatus(500);
                        logger.log({
                            date: date,
                            level: 'error',
                            message: 'Driver Phone Number update error',
                            TNic: req.body.Tnic,
                            Dnic: req.body.Dlno
                        });
                        return [2 /*return*/];
                    }
                    connection.commit();
                    connection.release();
                    res.status(201).json({});
                    logger.log({
                        date: date,
                        level: 'info',
                        message: 'Fine Bill Save Success',
                        TNic: req.body.Tnic,
                        Dnic: req.body.Dlno
                    });
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    console.error(e_1);
                    connection.rollback();
                    connection.release();
                    res.sendStatus(500);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}

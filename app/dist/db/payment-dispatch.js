"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
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

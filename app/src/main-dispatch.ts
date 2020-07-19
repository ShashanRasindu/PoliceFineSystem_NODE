import express = require("express");
import cros = require("cors");
import driver from "./driver-dispatch";
import finebill from "./finebill-dispatch";
import officer from "./officer-dispatch";
import pointsT from "./pointsofficer-dispatch";
import payment from "./payment-dispatch";


const router = express.Router();

export default router;

router.use(express.json());
router.use(cros());


router.use("/api/v1/driver", driver);
router.use("/api/v1/finebill", finebill);
router.use("/api/v1/traffic", officer);
router.use("/api/v1/pointsTraffic", pointsT);
router.use("/api/v1/payment", payment);






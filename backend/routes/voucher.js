const express = require("express");
const router = express.Router();
const voucherController = require("../controllers/voucher");

// Định nghĩa các route
router.get("/getAll", voucherController.getAll);
router.get("/getById/:id", voucherController.getById);
router.post("/create", voucherController.insert);
router.put("/update/:id", voucherController.update);
router.delete("/delete/:id", voucherController.delete);

module.exports = router;
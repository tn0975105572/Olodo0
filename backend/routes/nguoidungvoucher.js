const express = require("express");
const router = express.Router();
const nguoidungvoucherController = require("../controllers/nguoidungvoucher");

// Định nghĩa các route
router.get("/getAll", nguoidungvoucherController.getAll);
router.get("/getById/:id", nguoidungvoucherController.getById);
router.post("/create", nguoidungvoucherController.insert);
router.put("/update/:id", nguoidungvoucherController.update);
router.delete("/delete/:id", nguoidungvoucherController.delete);

module.exports = router;
const express = require("express");
const router = express.Router();
const thongbaoController = require("../controllers/thongbao");

// Định nghĩa các route
router.get("/getAll", thongbaoController.getAll);
router.get("/getById/:id", thongbaoController.getById);
router.post("/create", thongbaoController.insert);
router.put("/update/:id", thongbaoController.update);
router.delete("/delete/:id", thongbaoController.delete);

module.exports = router;
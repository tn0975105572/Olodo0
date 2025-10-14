const express = require("express");
const router = express.Router();
const tichdiemController = require("../controllers/tichdiem");

// Định nghĩa các route
router.get("/getAll", tichdiemController.getAll);
router.get("/getById/:id", tichdiemController.getById);
router.get("/getByType/:loai", tichdiemController.getByType);
router.get("/getActivePoints", tichdiemController.getActivePoints);
router.get("/getExchangePoints", tichdiemController.getExchangePoints);
router.post("/create", tichdiemController.create);
router.put("/update/:id", tichdiemController.update);
router.delete("/delete/:id", tichdiemController.delete);
router.post("/exchange", tichdiemController.exchange);

module.exports = router;






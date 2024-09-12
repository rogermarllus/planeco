var express = require("express");
var router = express.Router();
var cSavings = require("../controller/cSavings.js");

/* Rotas realcionadas à Poupança */
router.get("/consultar/:id_user", cSavings.savings);
router.post("/poupar/:id_user", cSavings.reserve);
router.post("/retirar/:id_user", cSavings.withdraw);

module.exports = router;

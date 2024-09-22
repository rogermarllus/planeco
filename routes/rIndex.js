var express = require("express");
var router = express.Router();
var cIndex = require("../controller/cIndex.js");

/* Rotas relacionadas à Página Principal, Sobre e Relatório Mensal */
router.get("/", cIndex.home);
router.get("/sobre", cIndex.info);
router.get("/ErroId/:id", cIndex.errorId);
router.get("/relatorio", cIndex.report);

module.exports = router;

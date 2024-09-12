var express = require("express");
var router = express.Router();
var cExpenses = require("../controller/cExpenses.js");

router.get("/registrar", cExpenses.create_get);
router.post("/registrar", cExpenses.create_post);
router.get("/consultar/:id_expense", cExpenses.details);
router.get("/alterar/:id_expense", cExpenses.update_get);
router.post("/alterar/:id_expense", cExpenses.update_post);
router.get("/excluir/:id_expense", cExpenses.delete);

/* Rotas Relacionadas às Despesas Arquivadas */
router.get("/arquivados", cExpenses.archived);
router.get("/arquivar/:id_expense", cExpenses.archive_get);
router.get("/desarquivar/:id_expense", cExpenses.unarchive_get);

module.exports = router;

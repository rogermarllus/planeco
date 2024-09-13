const mExpenses = require("../model/expensesMongoDB.js");

exports.create_get = async function (req, res) {
  res.render("expenseCreate");
};
exports.create_post = async function (req, res) {
  var expense = req.body;
  await mExpenses.create(expense);
  res.redirect("/");
};
exports.read = async function (req, res) {
  try {
    var id = req.params.id;
    var expense = await mExpenses.read(id);
    var expDate = expense.date.toLocaleDateString("pt-BR");
    dataContext = {
      expense: expense,
      date: expDate,
    };
    res.render("expenseRead", dataContext);
  } catch (err) {
    res.redirect("/ErroId/" + id);
  }
};
exports.update_get = async function (req, res) {
  try {
    var id = req.params.id;
    var expense = await mExpenses.read(id);
    var ctgFood = false;
    var ctgSubscriptions = false;
    var ctgStudies = false;
    var ctgLeisure = false;
    var ctgMarket = false;
    var ctgOther = false;
    var ctgHealth = false;
    var ctgTransport = false;
    var ctgClothing = false;

    switch (expense.category) {
      case "Alimentação":
        ctgFood = true;
        break;
      case "Assinaturas":
        ctgSubscriptions = true;
        break;
      case "Estudos":
        ctgStudies = true;
        break;
      case "Lazer":
        ctgLeisure = true;
        break;
      case "Mercado":
        ctgMarket = true;
        break;
      case "Saúde":
        ctgHealth = true;
        break;
      case "Transporte":
        ctgTransport = true;
        break;
      case "Vestuário":
        ctgClothing = true;
        break;
      default:
        ctgOther = true;
        break;
    }
    dataContext = {
      expense: expense,
      ctgFood: ctgFood,
      ctgSubscriptions: ctgSubscriptions,
      ctgStudies: ctgStudies,
      ctgLeisure: ctgLeisure,
      ctgMarket: ctgMarket,
      ctgOther: ctgOther,
      ctgHealth: ctgHealth,
      ctgTransport: ctgTransport,
      ctgClothing: ctgClothing,
    };
    res.render("expenseUpdate", dataContext);
  } catch (err) {
    res.redirect("/ErroId/" + id);
  }
};
exports.update_post = async function (req, res) {
  var expense = req.body;
  var id = req.params.id;
  await mExpenses.update(expense, id);
  res.redirect("/");
};
exports.delete = async function (req, res) {
  var id = req.params.id;
  await mExpenses.delete(id);
  res.redirect("/");
};
exports.archived = async function (req, res) {
  var archived = await mExpenses.getAllArchived();
  dataContext = {
    expenses: archived,
  };
  res.render("archived", dataContext);
};
exports.archive = async function (req, res) {
  var id = req.params.id;
  await mExpenses.archive(id);
  res.redirect("/");
};
exports.unarchive = async function (req, res) {
  var id = req.params.id;
  await mExpenses.unarchive(id);
  res.redirect("/");
};

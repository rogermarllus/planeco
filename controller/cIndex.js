const mUsers = require("../model/usersMongoDB.js");
const mExpenses = require("../model/expensesMongoDB.js");

exports.home = async function (req, res) {
  var hasVisitorUser = await mUsers.hasVisitor();
  if (!hasVisitorUser) {
    await mUsers.createVisitor();
  }
  var user = await mUsers.loginHasVisitor();

  var expenses = await mExpenses.getAllExpenses();

  dataContext = {
    user: user,
    expenses: expenses,
  };
  res.render("index", dataContext);
};

exports.info = async function (req, res) {
  res.render("info");
};

exports.errorId = async function (req, res) {
  var id = req.params.id;
  dataContext = {
    titulo_pagina: "Erro",
    id: id,
  };
  res.render("errorId", dataContext);
};

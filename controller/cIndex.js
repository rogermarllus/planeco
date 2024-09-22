const mUsers = require("../model/usersMongoDB.js");
const mExpenses = require("../model/expensesMongoDB.js");

exports.home = async function (req, res) {
  var hasVisitorUser = await mUsers.hasVisitor();
  if (!hasVisitorUser) {
    await mUsers.createVisitor();
  }
  var user = await mUsers.loginHasVisitor();

  /*
  var filterCategory = req.body.filtroCategoria;
  var filterPaymentForm = req.body.paymentFormFilter;
  var filterMonth = req.body.monthFilter;
  console.log(filterCategory);
  console.log(filterPaymentForm);
  console.log(filterMonth);

  var expenses = await mExpenses.getAllExpensesFilter(
    filterCategory,
    filterPaymentForm,
    filterMonth
  );
  */
  var expenses = await mExpenses.getAllExpenses();

  expenses.forEach((expense) => {
    switch (expense.category) {
      case "Alimentação":
        expense.ctgFood = true;
        break;
      case "Assinaturas":
        expense.ctgSubscriptions = true;
        break;
      case "Estudos":
        expense.ctgStudies = true;
        break;
      case "Lazer":
        expense.ctgLeisure = true;
        break;
      case "Mercado":
        expense.ctgMarket = true;
        break;
      case "Saúde":
        expense.ctgHealth = true;
        break;
      case "Transporte":
        expense.ctgTransport = true;
        break;
      case "Vestuário":
        expense.ctgClothing = true;
        break;
      default:
        expense.ctgOther = true;
        break;
    }
  });

  dataContext = {
    user: user,
    expenses: expenses,
    inIndex: true,
  };
  res.render("index", dataContext);
};

exports.info = async function (req, res) {
  dataContext = {
    inInfo: true,
  };
  res.render("info", dataContext);
};

exports.errorId = async function (req, res) {
  var id = req.params.id;
  dataContext = {
    titulo_pagina: "Erro",
    id: id,
  };
  res.render("errorId", dataContext);
};

exports.report = async function (req, res) {
  report = await mExpenses.getReport();
  dataContext = {
    title: "Relatório",
    inReport: true,
    report: report,
  };
  res.render("report", dataContext);
};

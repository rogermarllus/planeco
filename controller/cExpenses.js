const mUsers = require("../model/usersMongoDB.js");
const mExpenses = require("../model/expensesMongoDB.js");

exports.create_get = async function (req, res) {
  res.render("expenseCreate");
};
exports.create_post = async function (req, res) {
  var expense = req.body;
  var realDate = new Date(expense.date + "T00:00:00");
  expense.realDate = realDate;
  await mExpenses.create(expense);
  res.redirect("/");
};
exports.read = async function (req, res) {
  try {
    var id = req.params.id_expense;
    var expense = await mExpenses.read(id);
    expense.value = parseFloat(expense.value).toFixed(2);
    dataContext = {
      expense: expense,
      realDate: expense.realDate.toLocaleDateString("pt-BR"),
    };
    res.render("expenseRead", dataContext);
  } catch (err) {
    res.redirect("/ErroId/" + id);
  }
};
exports.update_get = async function (req, res) {
  try {
    var id = req.params.id_expense;
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
    var paymentCredit = false;
    var paymentDebit = false;
    var paymentMoney = false;
    var paymentPix = false;

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
    switch (expense.paymentForm) {
      case "Crédito":
        paymentCredit = true;
        break;
      case "Débito":
        paymentDebit = true;
        break;
      case "Dinheiro":
        paymentMoney = true;
        break;
      default:
        paymentPix = true;
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
      paymentCredit: paymentCredit,
      paymentDebit: paymentDebit,
      paymentMoney: paymentMoney,
      paymentPix: paymentPix,
    };
    res.render("expenseUpdate", dataContext);
  } catch (err) {
    res.redirect("/ErroId/" + id);
  }
};
exports.update_post = async function (req, res) {
  var expense = req.body;
  var id = req.params.id_expense;
  await mExpenses.update(expense, id);
  res.redirect("/");
};
exports.delete = async function (req, res) {
  var id = req.params.id_expense;
  await mExpenses.delete(id);
  res.redirect("/");
};
exports.archived = async function (req, res) {
  var archived = await mExpenses.getAllArchived();
  archived.forEach((expense) => {
    expense.value = parseFloat(expense.value).toFixed(2);
    switch (expense.category) {
      case "Alimentação":
        expense.ctgFood = true;
        break;
      case "Assinatura":
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
    expenses: archived,
    inArchived: true,
  };
  res.render("archived", dataContext);
};
exports.archive = async function (req, res) {
  var id = req.params.id_expense;
  console.log(id);
  await mExpenses.archive(id);
  res.redirect("/");
};
exports.unarchive = async function (req, res) {
  var id = req.params.id_expense;
  await mExpenses.unarchive(id);
  res.redirect("/despesas/arquivados");
};

exports.home = async function (req, res) {
  var hasVisitorUser = await mUsers.hasVisitor();
  if (!hasVisitorUser) {
    await mUsers.createVisitor();
  }
  var user = await mUsers.loginHasVisitor();

  var filterCategory = req.body.categoryFilter;
  var filterPaymentForm = req.body.paymentFormFilter;
  console.log(filterCategory);
  console.log(filterPaymentForm);

  var expenses = await mExpenses.getAllExpensesFilter(
    filterCategory,
    filterPaymentForm
  );

  expenses.forEach((expense) => {
    expense.value = parseFloat(expense.value).toFixed(2);
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

const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
var client;
const connection_bd = async () => {
  if (!client) client = await MongoClient.connect("mongodb://127.0.0.1:27017");
};
const bd = () => {
  return client.db("dbPlaneco");
};
class Expense {
  async close() {
    if (client) client.close();
    client = undefined;
  }
  async create(expense) {
    await connection_bd();
    const collection = bd().collection("expenses");
    await collection.insertOne(expense);
  }
  async read(id) {
    await connection_bd();
    const collection = bd().collection("expenses");
    const expense = await collection.findOne({ _id: new mongodb.ObjectId(id) });
    return expense;
  }
  async update(expense, id) {
    await connection_bd();
    const collection = bd().collection("expenses");
    await collection.updateOne(
      { _id: new mongodb.ObjectId(id) },
      {
        $set: {
          title: expense.title,
          value: expense.value,
          category: expense.category,
          description: expense.description,
          paymentForm: expense.paymentForm,
          date: expense.date,
        },
      }
    );
  }
  async delete(id) {
    await connection_bd();
    const collection = bd().collection("expenses");
    const doc = await collection.findOne({ _id: new mongodb.ObjectId(id) });
    if (!doc) {
      throw new Error(`Despesa com ID: ${id} não encontrada.`);
    } else {
      await collection.findOneAndDelete({ _id: new mongodb.ObjectId(id) });
    }
  }
  async archive(id) {
    await connection_bd();
    const collectionExpenses = bd().collection("expenses");
    const collectionArchived = bd().collection("archived");
    const expense = await collectionExpenses.findOne({
      _id: new mongodb.ObjectId(id),
    });
    if (!expense) {
      throw new Error(`Despesa com ID: ${id} não encontrada.`);
    }
    const idConflict = await collectionArchived.findOne({
      _id: new mongodb.ObjectId(id),
    });
    if (idConflict) {
      throw new Error(`Já há uma despesa com ID: ${id} arquivada.`);
    } else {
      await collectionExpenses.deleteOne({ _id: new mongodb.ObjectId(id) });
      await collectionArchived.insertOne(expense);
    }
  }
  async unarchive(id) {
    await connection_bd();
    const collectionExpenses = bd().collection("expenses");
    const collectionArchived = bd().collection("archived");
    const expense = await collectionArchived.findOne({
      _id: new mongodb.ObjectId(id),
    });
    if (!expense) {
      throw new Error(`Despesa com ID: ${id} não encontrada.`);
    }
    const idConflict = await collectionExpenses.findOne({
      _id: new mongodb.ObjectId(id),
    });
    if (idConflict) {
      throw new Error(`Já há uma despesa com ID: ${id} desarquivada.`);
    } else {
      await collectionArchived.deleteOne({ _id: new mongodb.ObjectId(id) });
      await collectionExpenses.insertOne(expense);
    }
  }
  async getAllExpensesFilter(filterCategory, filterPaymentForm) {
    await connection_bd();
    const collection = bd().collection("expenses");
    let pipeline = [];

    if (filterCategory !== "Todas") {
      pipeline.push({ $match: { category: filterCategory } });
    }

    if (filterPaymentForm !== "Todas") {
      pipeline.push({ $match: { paymentForm: filterPaymentForm } });
    }

    pipeline.push({
      $sort: { date: -1 },
    });

    var expenses = await collection.aggregate(pipeline).toArray();
    return expenses;
  }
  async getAllExpenses() {
    await connection_bd();
    const collection = bd().collection("expenses");
    var expenses = await collection.find({}).sort({ date: -1 }).toArray();
    return expenses;
  }
  async getAllArchived() {
    await connection_bd();
    const collection = bd().collection("archived");
    var archived = await collection.find({}).sort({ date: -1 }).toArray();
    return archived;
  }
  async qtdExpenses() {
    await connection_bd();
    const collection = bd().collection("expenses");
    var qtd = await collection.count({});
    return qtd;
  }
  async qtdArchived() {
    await connection_bd();
    const collection = bd().collection("archived");
    var qtd = await collection.count({});
    return qtd;
  }
  async getReport() {
    await connection_bd();
    const collection = bd().collection("expenses");
    const monthNumber = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    // Pipeline para somar o valor total das despesas do mês atual
    const totalValueMonthResult = await collection
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$realDate" }, monthNumber] },
                { $eq: [{ $year: "$realDate" }, year] },
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $toDouble: "$value" } },
          },
        },
      ])
      .toArray();

    const totalValueMonth =
      totalValueMonthResult.length > 0
        ? totalValueMonthResult[0].totalValue.toFixed(2)
        : 0;

    // Pipeline para encontrar a forma de pagamento mais recorrente no mês atual
    const mostPaymentFormResult = await collection
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$realDate" }, monthNumber] },
                { $eq: [{ $year: "$realDate" }, year] },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$paymentForm",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    const mostPaymentForm =
      mostPaymentFormResult.length > 0 ? mostPaymentFormResult[0]._id : "N/A";

    // Pipeline para encontrar a categoria mais registrada no mês atual
    const mostCategoryResult = await collection
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$realDate" }, monthNumber] },
                { $eq: [{ $year: "$realDate" }, year] },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ])
      .toArray();

    const mostCategory =
      mostCategoryResult.length > 0 ? mostCategoryResult[0]._id : "N/A";

    // Pipeline para agrupar por categoria e ordenar pela soma dos valores
    const categoryAggregationResult = await collection
      .aggregate([
        {
          $match: {
            $expr: {
              $and: [
                { $eq: [{ $month: "$realDate" }, monthNumber] },
                { $eq: [{ $year: "$realDate" }, year] },
              ],
            },
          },
        },
        {
          $group: {
            _id: "$category",
            totalValue: { $sum: { $toDouble: "$value" } },
          },
        },
        { $sort: { totalValue: -1 } }, // Ordena pelas categorias com maior valor gasto
      ])
      .toArray();

    // Preenche as variáveis de categorias e somas de acordo com o resultado da agregação
    let categoryVariables = [
      { ctg: "ctg1", ctgSum: "ctgSum1" },
      { ctg: "ctg2", ctgSum: "ctgSum2" },
      { ctg: "ctg3", ctgSum: "ctgSum3" },
      { ctg: "ctg4", ctgSum: "ctgSum4" },
      { ctg: "ctg5", ctgSum: "ctgSum5" },
      { ctg: "ctg6", ctgSum: "ctgSum6" },
      { ctg: "ctg7", ctgSum: "ctgSum7" },
      { ctg: "ctg8", ctgSum: "ctgSum8" },
      { ctg: "ctg9", ctgSum: "ctgSum9" },
    ];

    for (
      let i = 0;
      i < categoryAggregationResult.length && i < categoryVariables.length;
      i++
    ) {
      const result = categoryAggregationResult[i];
      this[categoryVariables[i].ctg] = result._id;
      this[categoryVariables[i].ctgSum] = result.totalValue.toFixed(2);
    }

    // Preenche o restante das variáveis não utilizadas com valores padrão
    for (
      let i = categoryAggregationResult.length;
      i < categoryVariables.length;
      i++
    ) {
      this[categoryVariables[i].ctg] = "N/A";
      this[categoryVariables[i].ctgSum] = 0;
    }

    let month;
    switch (monthNumber) {
      case 1:
        month = "Janeiro";
        break;
      case 2:
        month = "Fevereiro";
        break;
      case 3:
        month = "Março";
        break;
      case 4:
        month = "Abril";
        break;
      case 5:
        month = "Maio";
        break;
      case 6:
        month = "Junho";
        break;
      case 7:
        month = "Julho";
        break;
      case 8:
        month = "Agosto";
        break;
      case 9:
        month = "Setembro";
        break;
      case 10:
        month = "Outubro";
        break;
      case 11:
        month = "Novembro";
        break;
      default:
        month = "Dezembro";
        break;
    }

    const report = {
      month: month,
      year: year,
      totalValueMonth: totalValueMonth,
      mostPaymentForm: mostPaymentForm,
      mostCategory: mostCategory,
      ctg1: this.ctg1,
      ctg2: this.ctg2,
      ctg3: this.ctg3,
      ctg4: this.ctg4,
      ctg5: this.ctg5,
      ctg6: this.ctg6,
      ctg7: this.ctg7,
      ctg8: this.ctg8,
      ctg9: this.ctg9,
      ctgSum1: this.ctgSum1,
      ctgSum2: this.ctgSum2,
      ctgSum3: this.ctgSum3,
      ctgSum4: this.ctgSum4,
      ctgSum5: this.ctgSum5,
      ctgSum6: this.ctgSum6,
      ctgSum7: this.ctgSum7,
      ctgSum8: this.ctgSum8,
      ctgSum9: this.ctgSum9,
    };
    return report;
  }
}

module.exports = new Expense();

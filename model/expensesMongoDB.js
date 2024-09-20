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
  async getAllExpenses() {
    await connection_bd();
    const collection = bd().collection("expenses");
    var expenses = await collection.find({}).toArray();
    return expenses;
  }
  async getAllArchived() {
    await connection_bd();
    const collection = bd().collection("archived");
    var archived = await collection.find({}).toArray();
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
}
module.exports = new Expense();

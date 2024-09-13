const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
var client;
const connection_bd = async () => {
  if (!client) client = await MongoClient.connect("mongodb://127.0.0.1:27017");
};
const bd = () => {
  return client.db("dbPlaneco");
};
class User {
  async close() {
    if (client) client.close();
    client = undefined;
  }
  async createVisitor() {
    await connection_bd();
    const collection = bd().collection("users");
    await collection.insertOne({
      user: "visitor",
      password: 12345,
      wallet: 0.0,
      savings: 0.0,
    });
  }
  async hasVisitor() {
    await connection_bd();
    const collection = bd().collection("users");
    const user = await collection.findOne({ user: "visitor" });
    if (user) {
      return true;
    } else {
      return false;
    }
  }
  async loginHasVisitor() {
    await connection_bd();
    const collection = bd().collection("users");
    const user = await collection.findOne({ user: "visitor" });
    return user;
  }
  async getWallet() {
    await connection_bd();
    const collection = bd().collection("users");
    const user = await collection.findOne({ user: "visitor" });
    return user.wallet;
  }
  async getSavings() {
    await connection_bd();
    const collection = bd().collection("users");
    const user = await collection.findOne({ user: "visitor" });
    return user.savings;
  }
  async reserve(value) {
    await connection_bd();
    const collection = bd().collection("users");
    const user = await collection.findOne({ user: "visitor" });
    if (value <= user.wallet) {
      var savings = user.savings + value;
      var wallet = user.wallet - value;
    } else {
      var savings = user.savings + user.wallet;
      var wallet = 0.0;
    }
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          wallet: wallet,
          savings: savings,
        },
      }
    );
  }
  async withdraw(value) {
    await connection_bd();
    const collection = bd().collection("users");
    const user = await collection.findOne({ user: "visitor" });
    if (value <= user.savings) {
      var wallet = user.wallet + value;
      var savings = user.savings - value;
    } else {
      var wallet = user.wallet + user.savings;
      var savings = 0.0;
    }
    await collection.updateOne(
      { _id: user._id },
      {
        $set: {
          wallet: wallet,
          savings: savings,
        },
      }
    );
  }
}
module.exports = new User();

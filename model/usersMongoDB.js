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
}
module.exports = new User();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// meddleware
app.use(cors());
app.use(express.json());

// database config
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  const serviceCollection = client.db("travel_point").collection("services");

  app.post("/service", async (req, res) => {
    const service = req.body;

    const result = await serviceCollection.insertOne(service);
    res.send(result);
  });

  app.get("/home", (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const result = cursor.limit(3).toArray();

    res.send(result);
  });
  app.get("/services", async (req, res) => {
    const query = {};
    const cursor = serviceCollection.find(query);
    const result = await cursor.toArray();

    res.send(result);
  });
};

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Travel Point Service is Running!");
});

app.listen(port, () => {
  console.log(`Travel Poient Server is Running Port: ${port}`);
});

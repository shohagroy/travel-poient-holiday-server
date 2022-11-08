const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
  const reviewCollection = client.db("travel_point").collection("user_review");

  try {
    app.post("/service", async (req, res) => {
      const service = req.body;

      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const serviceID = req.query.id;

      const query = { postID: serviceID };
      const cursor = reviewCollection.find(query).sort({ postTime: -1 });
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/my-reviews", async (req, res) => {
      const userEmail = req.query.email;

      const query = { email: userEmail };
      const cursor = reviewCollection.find(query).sort({ postTime: -1 });
      const result = await cursor.toArray();

      res.send(result);
    });

    app.delete("/my-reviews", async (req, res) => {
      const id = req.query._id;

      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);

      if (result.deletedCount === 1) {
        res.send(result);
      }
    });

    app.get("/home", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ publish: -1 });
      const result = await cursor.limit(3).toArray();

      res.send(result);
    });
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ publish: -1 });
      const result = await cursor.toArray();

      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = serviceCollection.find(query);
      const result = await cursor.toArray();

      if (result) {
      }
      res.send(result);
    });
  } finally {
  }
};

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Travel Point Service is Running!");
});

app.listen(port, () => {
  console.log(`Travel Poient Server is Running Port: ${port}`);
});

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// meddleware
app.use(cors());
app.use(express.json());

const secretJWT = process.env.REACT_APP_JWT_SECRET_ACCESS_TOKEN;

// database config
const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// token verify functuon
const verifyTOken = (req, res, next) => {
  const bearerToken = req.headers.authorization;

  if (!bearerToken) {
    return res.status(401).sent({ message: "unauthorazin access" });
  } else {
    const token = bearerToken.split(" ")[1];

    jwt.verify(token, secretJWT, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).sent({ message: "unauthorazin access" });
      }
      req.decoded = decoded;
    });
  }
  next();
};

const run = async () => {
  const serviceCollection = client.db("travel_point").collection("services");
  const reviewCollection = client.db("travel_point").collection("user_review");

  try {
    // JSON WEB TOKEN
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, secretJWT, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    // home API =======================================================>
    app.get("/home", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ publish: -1 });
      const result = await cursor.limit(3).toArray();

      res.send(result);
    });
    // home API ==========================================================>

    // review API ==================================>
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

    app.get("/my-reviews", verifyTOken, async (req, res) => {
      const userEmail = req.query.email;
      const decoded = req.decoded.email;

      if (decoded !== decoded) {
        res.status(403).send({ message: "unauthorized access" });
      } else {
        const query = { email: userEmail };
        const cursor = reviewCollection.find(query).sort({ postTime: -1 });
        const result = await cursor.toArray();

        res.send(result);
      }
    });

    app.put("/my-reviews", verifyTOken, async (req, res) => {
      const id = req.query._id;
      const userEmail = req.query.email;
      const decoded = req.decoded.email;

      console.log(userEmail, id, decoded);
      if (decoded !== userEmail) {
        res.status(403).send({ message: "unauthorized access" });
      } else {
        const filter = { _id: ObjectId(id) };
        const review = req.body;
        const option = { upsert: true };
        const updateReview = {
          $set: {
            review: review.review,
            userReating: review.userReating,
          },
        };
        const result = await reviewCollection.updateOne(
          filter,
          updateReview,
          option
        );
        res.send(result);
      }
    });

    app.delete("/my-reviews", verifyTOken, async (req, res) => {
      const id = req.query._id;
      const userEmail = req.query.email;
      const decoded = req.decoded.email;

      if (decoded !== userEmail) {
        res.status(403).send({ message: "unauthorized access" });
      } else {
        const query = { _id: ObjectId(id) };
        const result = await reviewCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send(result);
        }
      }
    });
    // review API  ==============================================>

    // service API ==========================================================>
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query).sort({ publish: -1 });
      const result = await cursor.toArray();

      res.send(result);
    });

    app.post("/service", verifyTOken, async (req, res) => {
      const service = req.body;

      const decoded = req.decoded.email;
      const userEmail = service.authorEmail;

      if (decoded !== userEmail) {
        res.status(403).send({ message: "unauthorized access" });
      } else {
        const result = await serviceCollection.insertOne(service);
        res.send(result);
      }
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

    app.get("/my-services", verifyTOken, async (req, res) => {
      const userEmail = req.query.email;

      const decoded = req.decoded.email;

      if (decoded !== userEmail) {
        res.status(403).send({ message: "unauthorized access" });
      } else {
        const query = { authorEmail: userEmail };
        const cursor = serviceCollection.find(query).sort({ postTime: -1 });
        const result = await cursor.toArray();

        res.send(result);
      }
    });

    app.delete("/my-services", verifyTOken, async (req, res) => {
      const id = req.query._id;
      const email = req.query.email;
      const decoded = req.decoded.email;
      console.log(email, decoded.email);

      if (decoded !== email) {
        res.status(403).send({ message: "unauthorized access" });
      } else {
        const query = { _id: ObjectId(id) };
        const result = await serviceCollection.deleteOne(query);

        if (result.deletedCount === 1) {
          res.send(result);
        }
      }
    });
    //  service API ======================================================>
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

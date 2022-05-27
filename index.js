const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;
// middelware
app.use(cors());
app.use(express.json());
verifyJWT;
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.c4kzw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const ServiceCollection = client.db("Parses_go").collection("Parse");
    const allUsers = client.db("Parses_go").collection("all-Collections");
    const reviewsCount = client.db("Parses_go").collection("all-ReviewsCount");
    const orderCount = client.db("Parses_go").collection("all-orderCount");
    const paymentsCollection = client.db("Parses_go").collection("payments");
    const myProfileCount = client.db("Parses_go").collection("profile");

    // reviewsCount
    app.post("/review", async (req, res) => {
      const newServices = req.body;
      const result = await reviewsCount.insertOne(newServices);
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const query = {};
      const cursor = reviewsCount.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    //    get data
    app.get("/pareses", async (req, res) => {
      const query = {};
      const cursor = ServiceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // post data myProfile
    app.post("/myprofiles", async (req, res) => {
      const newServices = req.body;
      const result = await myProfileCount.insertOne(newServices);
      res.send(result);
    });
    app.get("/myprofiles", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        console.log(email);
        const query = { email: email };
        console.log(query);
        const cursor = myProfileCount.find(query);
        const productItems = await cursor.toArray();
        console.log(productItems);
        res.send(productItems);
      } else {
        res.status(403).send({ message: "Access denied! Forbidden access" });
      }
    });
    // post data product
    app.post("/pareses", async (req, res) => {
      const newServices = req.body;
      const result = await ServiceCollection.insertOne(newServices);
      res.send(result);
    });
    // post data order
    app.post("/order", async (req, res) => {
      const newServices = req.body;
      const result = await orderCount.insertOne(newServices);
      res.send(result);
    });
    // get data from orderCount
    app.get("/order", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        console.log(email);
        const query = { email: email };
        console.log(query);
        const cursor = orderCount.find(query);
        const productItems = await cursor.toArray();
        console.log(productItems);
        res.send(productItems);
      } else {
        res.status(403).send({ message: "Access denied! Forbidden access" });
      }
    });
    // Delta order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCount.deleteOne(query);
      res.send(result);
    });

    app.get("/purchaseProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ServiceCollection.findOne(query);
      res.send(result);
    });

    app.delete("/pareses/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ServiceCollection.deleteOne(query);
      res.send(result);
    });

    // get myAddedItems data  from database

    app.get("/myAddedItems", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        console.log(email);
        const query = { email: email };
        console.log(query);
        const cursor = ServiceCollection.find(query);
        const productItems = await cursor.toArray();
        console.log(productItems);
        res.send(productItems);
      } else {
        res.status(403).send({ message: "Access denied! Forbidden access" });
      }
    });
    // post
    app.post("/myAddedItems", async (req, res) => {
      const newService = req.body;
      const service = await ServiceCollection.insertOne(newService);
      res.send(service);
    });

    // user
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;

      const user = req.body;

      const filter = { email: email };

      const options = { upsert: true };

      const updatedDoc = {
        $set: user,
      };

      const result = await allUsers.updateOne(filter, updatedDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "2d" }
      );
      res.send({ result, token });
    });

    // user put api
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: user,
      };
      const result = await allUsers.updateOne(filter, updatedDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20d" }
      );
      console.log(result, token);
      res.send({ result, token });
    });

    // make admin api
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAc = await allUsers.findOne({ email: requester });

      if (requesterAc.role === "admin") {
        const filter = { email: email };
        const updatedDoc = {
          $set: { role: "admin" },
        };
        const result = await allUsers.updateOne(filter, updatedDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden" });
      }
    });

    // get admin api
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await allUsers.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // put for updatedQuantity and restack
    app.put("/purchaseProduct/:id", async (req, res) => {
      const id = req.params.id;
      const updatedQuantity = req.body.updatedData;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedQuantity,
        },
      };
      const result = await ServiceCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // get all user
    app.get("/users", verifyJWT, async (req, res) => {
      const query = {};
      const result = await allUsers.find(query).toArray();
      res.send(result);
    });

    // orderPayment
    app.get("/orderPayment/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      console.log(query);
      const result = await orderCount.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.get("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await orderCount.findOne(query);
      res.send(booking);
    });

    app.post("/create-payment-intent", verifyJWT, async (req, res) => {
      const parts = req.body;
      console.log(parts);
      const price = parts.price;
      console.log(price);
      const amount = parseInt(price) * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    app.patch("/myaddedorders/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const result = await paymentsCollection.insertOne(payment);
      const updatedOrders = await orderCount.updateOne(filter, updatedDoc);
      res.send(updatedOrders);
    });
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("running parse go");
});

app.listen(port, () => {
  console.log("listen on port", port);
});

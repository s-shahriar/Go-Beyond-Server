const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
require("dotenv").config();
const port = 3000;

// const corsConfig = {
//   origin: '',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
// }

app.use(cors())
//app.options("", cors(corsConfig))
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wpwwlgm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    //await client.connect();

    const spotsCollection = client.db("spotsDB").collection("spots");
    const countryCollection = client.db("spotsDB").collection("countryDB");

    app.get("/spots", async (req, res) => {
      const cursor = spotsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/spots", async (req, res) => {
      const newSpot = req.body;
      const result = await spotsCollection.insertOne(newSpot);
      res.send(result);
    });

    app.get("/spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotsCollection.findOne(query);
      res.send(result);
    });

    app.get("/user-spots", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email };
      const cursor = spotsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/user-spots", async (req, res) => {
      const updatedSpot = req.body;
      const { _id, ...updatedFields } = updatedSpot;
      const update = {
        $set: updatedFields,
      };
      const query = { _id: new ObjectId(updatedSpot._id) };
      const result = await spotsCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete('/user-spots/delete/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await spotsCollection.deleteOne(query);
      res.send(result);
    })

    app.get("/country", async (req, res) => {
      const cursor = countryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/country-spot" , async(req, res) => {
      const {countryName} = req.body;
      const query = { country_Name: countryName};
      const result = await spotsCollection.find(query).toArray();
      res.send(result);
    })



    // Send a ping to confirm a successful connection

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee making server is running");
});

app.listen(port, () => {
  console.log(`Example app listening on PORT ${port}`);
});

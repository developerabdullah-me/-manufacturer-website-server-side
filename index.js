const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
// middelware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_PASSWORD}@cluster0.c4kzw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        await client.connect();
   const ServiceCollection=client.db('Parses_go').collection('Parse')

app.get('/service',async(req,res) => {
    const query={}
    const cursor=ServiceCollection.find(query)
    const services=await cursor.toArray()
    res.send(services)
  
})
    }
    finally{

    }
    
}
run().catch(console.dir)
app.get("/", (req, res) => {
    res.send("running parse go");
  });
  
  app.listen(port, () => {
    console.log("listen on port", port);
  });
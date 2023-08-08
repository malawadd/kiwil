const { NodeKwil } = require("kwil");
const { Wallet } = require("ethers");
const { Utils } = require("kwil");
const fs = require('fs');
const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
require('dotenv').config();

const kwil = new NodeKwil({
  kwilProvider: process.env.KWIL_PROVIDER_URL,
});

const walletAddress = process.env.WALLETADDRESS; 
const databaseName = "sample_training";

const dbid = Utils.generateDBID(walletAddress, databaseName);

const signer = new Wallet(process.env.PRIVATEKEY); // Use your own private key here

const uri = process.env.MONGODBURI;

// Create an Express app
const app = express();
const port = 3030;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
    try {
        const client = new MongoClient(uri, {
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
            }
          });
        await client.connect();
        console.log("connected")
        const db = 'sample_training'
        const col = 'companies'
        const collection = client.db(db).collection(col);
       
        // Fetch all documents from the collection
        const data = await collection.find({}).toArray();

        for (const mongodbDoc of data) {
          console.log("waiting 10s")
          await new Promise(resolve => setTimeout(resolve, 10000));
          console.log("waiting done")
          const inputs = new Utils.ActionInput()
        .put("$id", mongodbDoc._id + "215")
        .put("$body", mongodbDoc.description)
        .put("$permalink", mongodbDoc.permalink)
        .put("$author", mongodbDoc.twitter_username)
        .put("$title", mongodbDoc.name)
        .put("$post_date", mongodbDoc.created_at);

    const actionTx = await kwil
        .actionBuilder()
        .dbid(dbid)
        .name("create_post")
        .concat(inputs)
        .signer(signer)
        .buildTx();
  
      console.log(kwil.broadcast(actionTx))
        }

        
    
      } catch (error) {
        console.error('Error fetching data:', "meh");
        console.error('Error error:', error);
        
      }

}
run().catch(console.dir);



// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

var express = require("express");
var cors = require("cors");
var app = express();
var fs = require("fs");
var bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

const port = "8081";
const host = "localhost";

const {MongoClient} = require("mongodb");

const url = "mongodb://127.0.0.1:27017";
const dbName = "react_data";
const client = new MongoClient(url);
const db = client.db(dbName);

app.listen(port, () => {
    console.log("App listening at http://%s:%s", host, port);
});

app.get("/listProducts", async(req, res) => {
    await client.connect();
    console.log("Node connected successfully to GET MongoDB");
    const query = {};
    const results = await db.collection("fakestore_catalog")
                            .find(query)
                            .limit(100)
                            .toArray();
    res.status(200);
    res.send(results);
});

app.get("/getProduct/:id", async(req, res) => {
    await client.connect();
    console.log("connected to MongoDB");
    const query = {"id": Number(req.params.id)};
    console.log(query);
    const results = await db.collection("fakestore_catalog")
                            .findOne(query);
    console.log(results);
    res.status(200);
    res.send(results);
})

app.post("/addProduct", async(req, res) => {
    try{
        await client.connect();
        const keys = Object.keys(req.body);
        console.log(keys);
        const values = Object.values(req.body);
        console.log(values);

        const newProduct = {
            "id": values[0],
            "title": values[1],
            "price": values[2],
            "description": values[3],
            "category": values[4],
            "image": values[5],
            "rating": {"rate": values[6]["rate"],
                        "count": values[6]["count"]}
        };

        const results = await db.collection("fakestore_catalog")
                                .insertOne(newProduct);

        res.status(200);
        res.send(results);
    }catch(error){
        console.log("An error occured:", error);
        res.status(500).send({error: 'An internal server error occurred.'});
    }
});

app.delete("/deleteProduct/:id", async(req, res) => {
    try{
        await client.connect();

        console.log("deleting");

        const results = await db.collection("fakestore_catalog")
                                .deleteOne({"id": Number(req.params.id)});
        
        if(results.deletedCount === 1){
            res.status(200).send({Message:'Product deleted successfully'});
        }else{
            res.status(404).send({error: 'Product not found'});
        }
    }catch(error){
        console.error("An error occurred:", error);
        res.status(500).send({error: 'An internal server error occurred'});
    }
});

app.put("/editProduct/:id", async(req, res) => {
    try{
        await client.connect();

        const id = req.params.id;
        
        const updateFields = {$set: req.body};

        const results = await db.collection("fakestore_catalog")
                                .updateOne({"id" : Number(id)}, updateFields);

        if(results.modifiedCount === 1){
            res.status(200).send({message: 'Product updated successfully'});
        }else{
            res.status(404).send({error: "Product not found"});
        }

    }catch(error){
        console.log("An error occurrred:", error);
        res.status(500).send({error: 'An internal server error occurred.'});
    }
});

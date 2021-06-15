//create mini express app
const exp = require('express');
const userApi = exp.Router(); //creates mini exp() app obj

//import MongoCLient
const mc = require("mongodb").MongoClient;


//connection string
const databaseUrl = "mongodb+srv://myFirstDB:nitisss@backend.zf0nd.mongodb.net/firstdb?retryWrites=true&w=majority";

let databaseObj;

//connect to DB
mc.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err,client) => {

    if(err){
        console.log("err in db connection", err);
    }
    else{
        //get database object
        databaseObj = client.db("firstdb");
        console.log("connected to database");
    }
})


//sample route
userApi.get("/getUsers", (req,res) => {
    res.send({message: 'reply from user api'});
})


//export
module.exports = userApi;
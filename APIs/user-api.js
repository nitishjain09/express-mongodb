//create mini express app
const exp = require('express');
const userApi = exp.Router(); //creates mini exp() app obj

//add bodyparsing middleware
userApi.use(exp.json())

//import MongoCLient
const mc = require("mongodb").MongoClient;


//connection string
const databaseUrl = "mongodb+srv://myFirstDB:nitisss@backend.zf0nd.mongodb.net/firstdb?retryWrites=true&w=majority";

let userCollectionObj;

//connect to DB
mc.connect(databaseUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err,client) => {

    if(err){
        console.log("err in db connection", err);
    }
    else{
        //get database object
        let databaseObj = client.db("firstdb");
        //create userCollection Obj
        userCollectionObj = databaseObj.collection("userColl");
        console.log("connected to database");
    }
})

/*
//sample route
userApi.get("/getUsers", (req,res) => {
    res.send({message: 'reply from user api'});
})
*/

//http://localhost:3000/user/getUsers
userApi.get("/getUsers", (req, res, next) => {

    //read docs from user collection
    userCollectionObj.find().toArray((err, usersList) => {

        //deal with error
        if(err){
            console.log("err in reading users data", err);
            res.send({message: err.message});
        }
        else{
            res.send({message: usersList});
        }
    })
})

//http://localhost:3000/user/getUser/<username>
userApi.get("/getUser/:username", (req, res, next) => {

    //get username from url parameter
    let un = req.params.username;

    //search for user
    userCollectionObj.findOne({username:un}, (err, userObj) => {
        if(err){
            console.log("err in reading requested user data", err);
            res.send({message: err.message});
        }
        
        //if user not existed
        if(userObj === null){
            res.send({message: "User not found"});
        }
        //if user exists
        else{
            res.send({ message: userObj });
        }
    })
})





//http://localhost:3000/user/createUser
userApi.post("/createUser", (req, res, next) => {

    //get user obj
    let newUser = req.body;

    //check user in db with this new username
    userCollectionObj.findOne({username:newUser.username}, (err,userObj) => {
        if(err){
            console.log("func err in creating user data", err);
            res.send({message: err.message});
        }

        //if user not existed
        if(userObj === null){
            //create new user
            userCollectionObj.insertOne(newUser, (err, success) => {
                if(err){
                    console.log("err in creating user data", err);
                    res.send({message: err.message});
                }
                else{
                    res.send({message: "New user created"});
                }
            })
        }
        else{
            res.send({ message: "User already exists" });
        }
    })
})


//http://localhost:3000/user/updateUser/<username>
userApi.put("/updateUser/:username", (req, res, next) => {

    //get modified user
    let modifiedUser = req.body;

    //update
    userCollectionObj.updateOne({username:modifiedUser.username}, {
        $set: { ...modifiedUser }
    }, (err, success) => {
        if(err){
            console.log("err in updating user data", err);
            res.send({message: err.message});
        }
        else{
            res.send({ message: "User data updated"})
        }
    })
})


//http://localhost:3000/user/deleteUser/<username>
userApi.delete("/deleteUser/:username", (req, res, next) => {

    //username of user to be deleted
    let un = req.params.username;
    
    userCollectionObj.findOne({ username: un}, (err, userObj) => {
        if(err){
            console.log("func err in deleting user",err);
            res.send({message: err.message});
        }

        try{
            userCollectionObj.deleteOne({ username: userObj.username});//, (err, success) => {
                /*if(err){
                    console.log("err in deleting user", err);
                    res.send({ message: err.message});
                }
                else{*/
                    res.send({ message: `User with username ${un} deleted`});
                
            //})
        }
        catch(e){
            res.send({ message: `Username ${un} does not exist`});
        }
    })
})






//export
module.exports = userApi;
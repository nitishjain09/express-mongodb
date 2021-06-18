//create mini express app
const exp = require('express');
const userApi = exp.Router(); //creates mini exp() app obj
const expressErrorHandler = require('express-async-handler');
const brcyptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
/*
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
*/


//getUsers using promises
/*userApi.get("/getUsers", (req, res, next) => {

    userCollectionObj.find().toArray()
        .then(usersList => { res.send({ message: usersList })})
        .catch(err => {
            console.log("err in reading users",err);
            res.send({ message : err.message});
        })
})
*/

//getUsers using async and await
userApi.get("/getUsers", expressErrorHandler( async (req, res, next) => {

    let userList = await userCollectionObj.find().toArray();
    res.send({ message: userList });
}))


//http://localhost:3000/user/getUser/<username>

/*userApi.get("/getUser/:username", (req, res, next) => {

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
*/


// get user by username using promises
/*
userApi.get("/getUser/:username", (req, res ,next) => {

    //get username from Url
    let un = req.params.username;

    //search
    userCollectionObj.findOne({ username: un})
        .then(userObj => {
            if( userObj === null ){
                res.send({ message: 'User not found'});
            }
            else{
                res.send({ message: userObj });
            }
        })
        .catch(err => {
            console.log("err in reading requested user data", err);
            res.send({message: err.message});
        })
})
*/


// get user by username using async and await
userApi.get("/getUser/:username", expressErrorHandler( async (req, res ,next) => {

    //get username from Url
    let un = req.params.username;

    //search
    let userObj = await userCollectionObj.findOne({ username: un });

    if(userObj === null){
        res.send({ message: 'User not existed'});
    }
    else{
        res.send({ message: userObj});
    }
}))

//http://localhost:3000/user/createUser
/*
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
*/


//create user
userApi.post("/createUser", expressErrorHandler( async (req, res, next) => {
    //get user obj
    let newUser = req.body;
    //search for existing user
    let user = await userCollectionObj.findOne({ username: newUser.username});

    //if user exists
    if( user != null){
        res.send({ message: "User already exists"});
    }
    else{
        //hash password
        let hashedPassword = await brcyptjs.hash(newUser.password, 7);
        //replace password
        newUser.password = hashedPassword;
        //insert
        await userCollectionObj.insertOne(newUser);
        res.send({ message: 'New user created'});
    }
}))


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

userApi.put("/updateUser/:username", expressErrorHandler( async (req, res, next) => {
    //get modified username
    let modifiedUser = req.body;
    //update
    await userCollectionObj.updateOne({ username: modifiedUser.username}, { $set: {...modifiedUser}});
    res.send({ message: 'User updated'});
}))



//http://localhost:3000/user/deleteUser/<username>
/*
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
                // if(err){
                //     console.log("err in deleting user", err);
                //     res.send({ message: err.message});
                // }
                // else{
                    res.send({ message: `User with username ${un} deleted`});
                
            //})
        }
        catch(e){
            res.send({ message: `Username ${un} does not exist`});
        }
    })
})
*/

//delete user
userApi.delete("/deleteUser/:username", async (req, res) => {

    //get username from url
    let un = req.params.username;

    //find the user
    let user = await userCollectionObj.findOne({ username: un });

    if(user === null){
        res.send({ message: "User does not exist"})
    }
    else{
        await userCollectionObj.deleteOne({ username: un});
        res.send({ message : 'User deleted'});
    }
})

//user login
userApi.post('/login', expressErrorHandler( async(req, res) => {

    //get user credentials
    let credentials = req.body;
    //search user by username
    let user = await userCollectionObj.findOne({ username:credentials.username});
    //if user not found
    if(user === null){
        res.send({ message: 'Invalid username'});
    }
    else{
        //compare the password
        let result = await brcyptjs.compare(credentials.password, user.password);
        //if not matched
        if(result === false){
            res.send({ message: "Invalid Password"});
        }
        else{
            //create a token
            let signedToken = jwt.sign({ username: credentials.username}, 'abcdef', {expiresIn: 120 });
            //send token to client
            res.send({ message: "login succes", token: signedToken, username: credentials.username });
        }
    }
}))


//export
module.exports = userApi;
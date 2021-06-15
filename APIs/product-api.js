//create mini express app
const exp = require('express');
const productApi = exp.Router(); //creates mini exp() obj



//sample route
productApi.get("/getProducts", (req,res) => {
    res.send({message: 'reply from product api'});
})


//export
module.exports = productApi;
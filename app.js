const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const app = express();

const feedRoutes = require('./routes/feed');

//application/json
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/feed', feedRoutes);


mongoose.connect('mongodb+srv://admin:tiktik123@cluster0-5t9yf.mongodb.net/messages?retryWrites=true', { useNewUrlParser: true })
    .then((response) => {
        app.listen(8000);
    })
    .catch((error) => {
        console.log(error)
    })


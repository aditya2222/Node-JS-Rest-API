const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const path = require('path')
const multer = require('multer')

const app = express();

const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    },
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}


//application/json
app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))

app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error, req, res, next) => {
    console.log(error)
    const statusCode = error.statusCode
    const message = error.message
    const data = error.data
    return res.status(statusCode).json({
        message: message,
        data: data

    })
})



mongoose.connect('mongodb+srv://admin:tiktik123@cluster0-5t9yf.mongodb.net/messages?retryWrites=true', { useNewUrlParser: true })
    .then((response) => {
        const server = app.listen(8000);
        const io = require('./scoket').init(server)
        io.on('connection', socket => {
            console.log('Client Connected')
        })
    })
    .catch((error) => {
        console.log(error)
    })


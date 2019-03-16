const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
var cors = require('cors');
const app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});

const tutors = require('./routes/tutors');
const students = require('./routes/students');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const admins = require('./routes/admins');
const notifications = require('./routes/notifications');
const searches = require('./routes/searches');

// Setting up db connection
mongoose.connect('mongodb://localhost/mymentor', {useNewUrlParser: true})
 .then(()=> {console.log('Successfully connected to the MyMentor database');})
 .catch((err)=> {console.log('Failed to connect with error: ', err.message);});

// Setting routes
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors());
app.use('/tutors/', tutors);
app.use('/students/', students);
app.use('/students/notifications', notifications);
app.use('/auth/', auth);
app.use('/tutors/bookings', bookings);
app.use('/admins/', admins);
app.use('/search/', searches);

const port = process.env.PORT || 3001;
app.listen(port,() => {
    console.log(`Listening to port ${port}`);
});



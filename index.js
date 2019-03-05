const express = require('express');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

const app = express();
const tutors = require('./routes/tutors');
const students = require('./routes/students');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const admins = require('./routes/admins');
const notifications = require('./routes/notifications');

// Setting up db connection
mongoose.connect('mongodb://localhost/mymentor', {useNewUrlParser: true})
 .then(()=> {console.log('Successfully connected to the MyMentor database');})
 .catch((err)=> {console.log('Failed to connect with error: ', err.message);});

// Setting routes
app.use(bodyParser.json());
app.use('/tutors/', tutors);
app.use('/students/', students);
app.use('/students/notifications', notifications);
app.use('/auth/', auth);
app.use('/tutors/bookings', bookings);
app.use('/admins/', admins);

const port = process.env.PORT || 3000;
app.listen(port,() => {
    console.log(`Listening to port ${port}`);
});



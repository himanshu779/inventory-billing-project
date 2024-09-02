const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const passportJWT = require('./auth/auth');
const session = require('express-session');
const app = express();
const port = 9000;
const router = require('./router/router');  // Make sure this path is correct
app.use(express.json());
app.use('/', router);
app.use(bodyParser.json());
app.use(express.urlencoded());
app.use(cors());


app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cors());

// mongoose.set('strictQuery', false);
const url ='mongodb://localhost:27017/Backend'

mongoose.connect(url).then(()=>{
    console.log('Database connected');
}).catch((err)=>{
    console.log(err);
});

app.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
}))

app.use(passport.initialize());
app.use(passport.session());
// app.use('/', require('./router/router'))

app.listen(port, (err) => {
    if(err)
    {
        console.log(err);
    }
    console.log(`Server is running on port ${port}`);
});


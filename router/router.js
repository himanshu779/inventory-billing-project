const express = require('express')
const router = express();
const session = require('express-session');
const passport = require('passport');
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const passportJWT = require('../auth/auth');
// const port = 9000;
// router.use(express.json());
// router.use(bodyParser.json());
// router.use(express.urlencoded());
// router.use(cors());

// mongoose.set('strictQuery', false);
// const url = 'mongodb+srv://option:admin1234@cluster0.8mxyu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// mongoose.connect(url).then(()=>{
//     console.log('Database connected');
// }).catch((err)=>{
//     console.log(err);
// });

router.use(session({
    secret: 'secretkey',
    resave: false,
    saveUninitialized: true,
}))

router.use(passport.initialize());
router.use(passport.session());
// app.use('/', require('../router/router'))

// router.listen(port, (err) => {
//     if(err)
//     {
//         console.log(err);
//     }
//     console.log(`Server is running on port ${port}`);
// });

module.exports = router;
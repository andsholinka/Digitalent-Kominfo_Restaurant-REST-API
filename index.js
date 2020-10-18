// langkah 1 - import
import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import router from './router.js';
import userRouter from './controllers/UserController.js';


const app= express();

// Connect to DB
var uri = process.env.MONGODB_URI;
mongoose.connect(uri,
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connect to DB success')
}).catch(err => {
    console.log('Connect to failed ' + err)
})


//Middlewares
app.use(morgan('dev'));
app.use(express.json());

//langkah 3 (routes)
app.get('/', (req,res) => {
    res.json({
        message: 'success',
    });
})

// http://localhost:1000/api/homework
app.use('/api', router);
app.use('/api/user', userRouter);


// langkah 2

app.listen(process.env.PORT, () => {
    console.log(`App listens to port ${process.env.PORT}`);
});
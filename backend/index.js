import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import taskRouter from './routes/tasksRoute.js';
import {PORT, mongoDBURL} from './config.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', taskRouter);


mongoose.connect(mongoDBURL)
.then(()=>{
    console.log("Database Connected");

    app.listen(PORT, ()=>{
        console.log(`App is listening to port ${PORT}`)
    })
})

.catch((error)=>{
    console.log("Failed to connect with database");
})
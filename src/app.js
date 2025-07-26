import express from 'express';
import testRouter from './routes/test.js';

const app = express();


app.use(express.json(({ limit: '16kb' })));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));


app.use("/test", testRouter);


export { app };
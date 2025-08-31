// require('dotenv').config({path: './env'})
import dotenv from "dotenv"
import { app } from "./app.js";


import connectDB from "./db/index.js";

dotenv.config()

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(` Server is running at post :${process.env.PORT}`);
            app.on("error", (err) => {
                console.log(`Error:${err}`);
                throw err;
            })
        })
    })
    .catch((err) => {
        console.error(" MONGODB connection failed: " + err);

    })




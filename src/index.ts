import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import database from "./config/database";

var app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

dotenv.config({ path: __dirname + '/.env' });

// database.db()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

const PORT = process.env.PORT || 5001;

app.listen(PORT, ()=> {
    console.log('Server started on port ' + PORT);
})
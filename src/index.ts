import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './config/database';
import userRouter from './routes/userRoutes';
//import routes from './routes';
//const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');

var app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Firebase Admin SDK ile yapılandırma

dotenv.config({ path: __dirname + '/.env' });

//const privateKey = fs.readFileSync('/etc/letsencrypt/live/rozetle.com/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/rozetle.com/cert.pem', 'utf8');
//const ca = fs.readFileSync('/etc/letsencrypt/live/rozetle.com/chain.pem', 'utf8');

// const credentials = {
//     key: privateKey,
//     cert: certificate,
//     ca: ca
// };

//const app: Express = express();
database.connect()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get("/sakso",(req,res)=>{
    return res.status(200).json("saksoo")
}) 
app.use('/api/user', userRouter);

//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const PORT = process.env.PORT || 5001;

app.listen(PORT,()=>{
    console.log("bağlandı")
})

// const httpsServer = https.createServer(app);

// httpsServer.listen(PORT, () => {
//     console.log('HTTPS Server running on port ' + PORT);
// });

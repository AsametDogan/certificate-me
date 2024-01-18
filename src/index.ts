import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import database from './config/database';
import userRouter from './routes/userRoutes';
import verificationRoutes from './routes/verificationRouter';
import certificateRouter from './routes/certificateRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import imageRouter from './routes/imageRoutes';
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

app.use('/api/user', userRouter);
app.use('/api/verification', verificationRoutes)
app.use('/api/certificate', certificateRouter)
app.use('/api/assign', assignmentRoutes)
app.use('/api/image', imageRouter)
app.get('/', (req, res) => {
    return res.send("sdds")
})


//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(PORT + " portuna bağlandı")
})

// const httpsServer = https.createServer(app);

// httpsServer.listen(PORT, () => {
//     console.log('HTTPS Server running on port ' + PORT);
// });

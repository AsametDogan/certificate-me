import mongoose, { ConnectOptions } from 'mongoose';

const connect = () => {
    mongoose
        .connect(process.env.MONGO_URL as string, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions)
        .then(() => {
            console.log("connected to db");
        })
        .catch((err: Error) => {
            console.log("database.js/db: " + err);
        });
};

export default {
    connect
}

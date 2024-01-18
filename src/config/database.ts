import mongoose, { ConnectOptions } from 'mongoose';

const connect = async () => {
    await mongoose
        .connect("mongodb://127.0.0.1:27017/certipulse")
        .then(() => {
            console.log("connected to db");
        })
        .catch((err: Error) => {
            console.log("database.js/connect: " + err);
        });
};

export default {
    connect
}

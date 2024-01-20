import mongoose, { ConnectOptions } from 'mongoose';

const connect = async () => {
    await mongoose
        .connect("mongodb://mongo_db:27017/certipulse")
        .then(() => {
            console.log("connected to db");
        })
        .catch((err: Error) => {
            console.log("database.js/connect hata: " + err);
        });
};

export default {
    connect
}

const mongoose = require("mongoose");
const URL = process.env.MONGODB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(URL, {
            dbName: "prep-forge",
        });
        console.log("------- DB Connected -------");
    } catch (err) {
        console.log("---- DB Connection Failed -----", err.message);
    }
};

module.exports = connectDB;


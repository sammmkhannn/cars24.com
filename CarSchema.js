import mongoose from "mongoose";


//create car schema
const carSchema = new mongoose.Schema({
    model: {
        type: String,
    },
    price: {
        type:String,
    },
    kilometers: {
        type: String,
    },
    transmission: {
        type: String,
    },
    specs: {
        type: String,
    },
    driveType: {
        type: String,
    },
    fuelType: {
        type: String,
    },
    trim: {
        type: String,
    }
});

export default carSchema;
const fs = require("fs")
let data = require("./ex.json")
const mongoose = require("mongoose");


//filter the data
data = data.filter((item) => {
    return item.driveType && item.driveType != 'NA' && item.fuelType && item.fuelType != 'NA' && item.kilometers && item.kilometers != 'NA' && item.model && item.model != 'NA' && item.price && item.price != 'AED 0' && item.specs && item.specs != 'NA' && item.transmission && item.transmission != 'NA' && item.trim && item.trim != 'NA';
})




//categorize the data
let categorizedData = {};

for (let datum of data) {
    if (!categorizedData[datum.model.split(' ')[1]]) {
        categorizedData[datum.model.split(' ')[1]] = [];
    }
    categorizedData[datum.model.split(' ')[1]] = [...categorizedData[datum.model.split(' ')[1]], datum];
}

console.log(categorizedData);

//write categorizeData to the json file
fs.writeFile('filtered.json', JSON.stringify(data), (err) => {
    if (!err) {
        console.log('data has been written to the file')
    } else {
        console.log('got an error while writing the data to the file')
    }
})

fs.writeFile('categorized.json', JSON.stringify(categorizedData), (err) => {
    if (!err) {
        console.log('data has been written to the file')
    } else {
        console.log('got an error while writing the data to the file')
    }
})


//create car model
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

//write the  data to the database
async function saveData(categorizedData) {
    for (let data in categorizedData) {
        let Car = mongoose.model(data, carSchema);
        Car.create(...categorizedData[data], (err, data) => {
            if (!err) {
                console.log('success');
            } else {
                console.log(err);
            }
        });
    }
}

// //connect to the database
// mongoose.connect('mongodb+srv://CarBucksUser:PiE0YS4NCBPhctzI@cluster0.e5lzl.mongodb.net/car-bucks-database?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect('mongodb+srv://admin:1990xe98@cluster0.b86j3.mongodb.net/cars?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
let conn = mongoose.connection;

//test the connection
conn.once('open', () => {
    saveData(categorizedData);
})
    .on('err', (err) => {
        console.log('got an error while connecting to mongodb');
});







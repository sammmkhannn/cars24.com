const fs = require("fs")
let data = require("./cars.json")



data = data.filter((item) => {
    return item.driveType && item.driveType != 'NA' &&  item.fuelType && item.fuelType != 'NA' && item.kilometers && item.kilometers != 'NA' &&  item.model && item.model !='NA' && item.price && item.price != 'AED 0' && item.specs && item.specs != 'NA' && item.transmission && item.transmission != 'NA' && item.trim && item.trim != 'NA';
})


fs.writeFile('cars.json', JSON.stringify(data), (err) => {
    if (!err) {
        console.log('data has been written to the file')
    } else {
        console.log('got an error while writing the data to the file')
    }
})

console.table(data)

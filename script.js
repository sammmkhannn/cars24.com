const puppeteer = require("puppeteer")
const StealthPlugin =  require("puppeteer-extra-plugin-stealth")
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker")
const fs = require("fs");
// puppeteer.use(StealthPlugin())
// puppeteer.use(AdblockerPlugin({blockTrackers:true}))

//TODO: visit the site
(
    async () => {

        let browser = await puppeteer.launch({ headless: false,args:['--start-maximized'] })
        let page = await browser.newPage();
        page.setDefaultNavigationTimeout(0);
        await page.setViewport({
            width: 1920,
            height: 1080
        })

        let url = "https://www.cars24.com/ae/buy-used-cars-abu-dhabi?sf=city:CC_AE_2&sf=gaId:1157505483.1663762900";
        await page.goto(url, { waitUntil: "load", timeout: 0 })
       
        let counter = 0;
        let allCarsLinks = [];
        let limitedInterval = setInterval(async () => {
            counter++;
            if (counter == 100) {
                clearInterval(limitedInterval);
            }
            await scroll(page);
            await page.waitForSelector(".col-md-4 > a");
            let carLinks = await page.evaluate(() => {
                let carLinks = Array.from(document.querySelectorAll(".col-md-4 > a")).map((e) => e.href);
                return carLinks;
            });
            let set = new Set([...allCarsLinks, ...carLinks]);
            allCarsLinks = [...set];
            console.log(allCarsLinks);

        }, 1000);

     
       

      
        let carDetails = [];
        setTimeout(async () => {
            for (let link of allCarsLinks) {
                // let page = await browser.newPage({args:['--start-maximized']})
                await page.goto(link);
                await scroll(page);
              
                await page.waitForSelector('h1');
                let model = await page.evaluate(() => {
                    return document.querySelector("h1").innerText
                })

                await page.waitForSelector('._2n6iP')
                let price = await page.evaluate(() => {
                    return document.querySelector("._2n6iP").innerText
                })

                await page.waitForSelector('.x159K > div > p');
                let [kilometers, transmission, specs, driveType, fuelType, trim] = await page.evaluate(() => {
                    return Array.from(document.querySelectorAll(".x159K > div > p")).map((e) => e.innerText)
                })
                
                carDetails.push({ model, price, kilometers, transmission, specs, driveType, fuelType, trim });
                
                await page.close();
                
            }        //write to  the json file
            
            fs.writeFile("cars.json", JSON.stringify(carDetails), (err) => {
            if (!err) {
                console.log("wrote the data to cars.json")
            } else {
                console.log("data could not be stored")
            }
        
        })
       
        }, 1000);



    }
)()


// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality.
// Any number of plugins can be added through `puppeteer.use()`
// const puppeteer = require('puppeteer-extra')
// const fs = require('fs');
// // Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// puppeteer.use(StealthPlugin())

// // Add adblocker plugin to block all ads and trackers (saves bandwidth)
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
// puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

// // That's it, the rest is puppeteer usage as normal 😊
// puppeteer.launch({ headless: true }).then(async browser => {
//   const page = await browser.newPage()
//   await page.setViewport({ width: 800, height: 600 })

//   page.setDefaultNavigationTimeout(0);
//   await page.setViewport({
//       width: 1920,
//       height: 1080
//   })

//   let url = "https://www.cars24.com/ae/buy-used-cars-abu-dhabi?sf=city:CC_AE_2&sf=gaId:1157505483.1663762900";
//   await page.goto(url, { waitUntil: "load", timeout: 0 })
 
//   let counter = 0;
//   let allCarsLinks = [];
//   let limitedInterval = setInterval(async () => {
//       counter++;
//       if (counter == 100) {
//           clearInterval(limitedInterval);
//       }
//       await scroll(page);
//       await page.waitForSelector(".col-md-4 > a");
//       let carLinks = await page.evaluate(() => {
//           let carLinks = Array.from(document.querySelectorAll(".col-md-4 > a")).map((e) => e.href);
//           return carLinks;
//       });
//       let set = new Set([...allCarsLinks, ...carLinks]);
//       allCarsLinks = [...set];
//       console.log(allCarsLinks);

//   }, 1000);


 


//   let carDetails = [];
//   setTimeout(async () => {
//       for (let link of allCarsLinks) {
//           // let page = await browser.newPage({args:['--start-maximized']})
//           await page.goto(link);
//           await scroll(page);
        
//           await page.waitForSelector('h1');
//           let model = await page.evaluate(() => {
//               return document.querySelector("h1").innerText
//           })

//           await page.waitForSelector('._2n6iP')
//           let price = await page.evaluate(() => {
//               return document.querySelector("._2n6iP").innerText
//           })

//           await page.waitForSelector('.x159K > div > p');
//           let [kilometers, transmission, specs, driveType, fuelType, trim] = await page.evaluate(() => {
//               return Array.from(document.querySelectorAll(".x159K > div > p")).map((e) => e.innerText)
//           })
          
//           carDetails.push({ model, price, kilometers, transmission, specs, driveType, fuelType, trim });
          
//           await page.close();
          
//       }        //write to  the json file
      
//       fs.writeFile("cars.json", JSON.stringify(carDetails), (err) => {
//       if (!err) {
//           console.log("wrote the data to cars.json")
//       } else {
//           console.log("data could not be stored")
//       }
  
//   })
 
//   }, 1000);

// })


const  scroll = async (page) => {
    await page.evaluate(() => {
        document.scrollingElement.scrollBy(0,document.scrollingElement.scrollHeight)
    });
}
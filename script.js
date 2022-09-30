import puppeteer from "puppeteer"
import fs from "fs";


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
            if (counter == 10) {
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
        setTimeout(async() => {
            for (let link of allCarsLinks.slice(0,50)) {
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
                
                carDetails.push({model,price,kilometers,transmission,specs,driveType,fuelType,trim});
                
            }        //write to  the json file
            
            fs.writeFile("cars.json", JSON.stringify(carDetails), (err) => {
            if (!err) {
                console.log("wrote the data to cars.json")
            } else {
                console.log("data could not be stored")
            }
        })
       
        }, 15000);



    }
)()


const  scroll = async (page) => {
    await page.evaluate(() => {
        document.scrollingElement.scrollBy(0,document.scrollingElement.scrollHeight)
    });
}

const puppeteer = require('puppeteer');
const fs = require('fs');



class Scraper{
    constructor(browser,page) {
        this.browser = browser
        this.page1 = page
        this.page2 = page
        this.carLinks = []
        this.carDetails = []
    }

    async getCarLinks() {
        this.page1.setDefaultNavigationTimeout(0);
        this.page2.setDefaultNavigationTimeout(2);
        await this.page1.setViewport({
            width: 1920,
            height: 1080
        })
        this.page2.setViewport({
            width: 1920,
            height: 1080
        })
        let url = "https://www.cars24.com/ae/buy-used-cars-abu-dhabi?sf=city:CC_AE_2&sf=gaId:1157505483.1663762900";
        await this.page1.goto(url, { waitUntil: "load", timeout: 0 })
        let counter = 0
        let limitedInterval = setInterval(async () => {
            counter++;
            if (counter == 100 || this.carLinks.length >=700 ) {
                clearInterval(limitedInterval);
                this.getCarData();
            }
            await this.page1.waitForTimeout(5000);
            await this.scroll(this.page1);
            // await this.page.waitForSelector(".col-md-4 > a");
            let carLinks = await this.page1.evaluate(() => {
                let carLinks = Array.from(document.querySelectorAll(".col-md-4 > a")).map((e) => e.href);
                return carLinks;
            });
            let set = new Set([...this.carLinks, ...carLinks]);
            this.carLinks.push(...set);
    
        }, 3000);
        
    }

    async getCarData() {

            for (let link of this.carLinks) {
            
                await this.page2.goto(link,{waitUntil:'load',timeout:0});
                await this.scroll(this.page2);
              
                await this.page2.waitForSelector('h1');
                let model = await this.page2.evaluate(() => {
                    return document.querySelector("h1").innerText
                })

                await this.page2.waitForSelector('._2n6iP')
                let price = await this.page2.evaluate(() => {
                    return document.querySelector("._2n6iP").innerText
                })

                await this.page2.waitForSelector('.x159K > div > p');
                let [kilometers, transmission, specs, driveType, fuelType, trim] = await this.page2.evaluate(() => {
                    return Array.from(document.querySelectorAll(".x159K > div > p")).map((e) => e.innerText)
                })
                
                this.carDetails.push({ model, price, kilometers, transmission, specs, driveType, fuelType, trim });      
            }        //write to  the json file
            
            fs.writeFile("cars.json", JSON.stringify(this.carDetails), (err) => {
            if (!err) {
                console.log("wrote the data to cars.json")
            } else {
                console.log("data could not be stored")
            }
        
        })
    
    }

    async scroll (page) {
        await page.evaluate(() => {
        document.scrollingElement.scrollBy(0,document.scrollingElement.scrollHeight)
        });
    }
}

async function main() {
    let browser = await puppeteer.launch({headless:true});
    let page = await browser.newPage();
    const cars24 = new Scraper(browser, page);
    cars24.getCarLinks();
}


main() 
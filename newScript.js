import puppeteer from "puppeteer"
import { Cluster } from "puppeteer-cluster";
import fs from "fs";
import {CronJob} from "cron";
import carSchema from "./CarSchema.js";


class Scraper{
    constructor(color, page) {
        this.url = url;
        this.color = color;
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
        let url = `https://www.cars24.com/ae/buy-used-cars-abu-dhabi?sf=carColor:${this.color}&sf=city:CC_AE_2&sf=gaId:1157505483.1663762900`;
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
                
                this.carDetails.push({ model, price, kilometers, transmission, specs, driveType, fuelType, trim,color:this.color });      
            }        //write to  the json file
            
        fs.writeFile(`${this.color}-cars.json`, JSON.stringify(this.carDetails), (err) => {
            if (!err) {
                console.log("wrote the data to cars.json")
            } else {
                console.log("data could not be stored")
            }
        
        });
    
    }

    async scroll (page) {
        await page.evaluate(() => {
        document.scrollingElement.scrollBy(0,document.scrollingElement.scrollHeight)
        });
    }
}

async function main() {
    
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_CONTEXT,
        maxConcurrency: 3,
        monitor: true,
        puppeteerOptions: {
          headless: true,
          devtools: false,
          args: ["--start-maximized", "--disable-setuid-sandbox", "--no-sandbox"],
        },
    });
    
    let job1 = new CronJob("0 0 9 * * *", () => {
    
        cluster.queue(async ({ page }) => {
            const whiteCars = new Scraper("WHITE", page);
            whiteCars.getCarLinks();
        });
        cluster.queue(async ({ page }) => {
            const greyCars = new Scraper("GREY", page);
            greyCars.getCarLinks();
        })
        cluster.queue(async ({ page }) => {
            const blackCars = new Scraper("BLACK", page);
            blackCars.getCarLinks();
        })
        cluster.queue(async ({ page }) => {
            const silverCars = new Scraper("SILVER", page);
            silverCars.getCarLinks();
        })
        cluster.queue(async ({ page }) => {
            const greenCars = new Scraper("GREEN", page);
            greenCars.getCarLinks();
        });
        cluster.queue(async ({ page }) => {
            const otherCars = new Scraper("OTHER", page);
            otherCars.getCarLinks();
        });
        cluster.queue(async ({ page }) => {
            const beigeCars = new Scraper("BEIGE", page);
            beigeCars.getCarLinks();
        });
    }, null, true);
    job1.start();


    let job2 = new CronJob(" 0 0 21 * * *", () => {

        cluster.queue(async ({ page }) => {
            const redCars = new Scraper("RED", page);
            redCars.getCarLinks();
        })
        cluster.queue(async ({ page }) => {
            const blueCars = new Scraper("BLUE", page);
            blueCars.getCarLinks();
        })
        cluster.queue(async ({ page }) => {
            const brownCars = new Scraper("BROWN", page);
            brownCars.getCarLinks();
        });
        cluster.queue(async ({ page }) => {
            const goldCars = new Scraper("GOLD", page);
            goldCars.getCarLinks();
        });
        cluster.queue(async ({ page }) => {
            const maroonCars = new Scraper("MAROON", page);
            maroonCars.getCarLinks();
        });
        cluster.queue(async ({ page }) => {
            const orangeCars = new Scraper("ORANGE", page);
            orangeCars.getCarLinks();
        });
    }, null, true);
    job2.start();  
}


main() 
const { Builder, By, until } = require('selenium-webdriver');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const proxy = require('selenium-webdriver/proxy');
const moment = require('moment');


const url = 'mongodb+srv://suryathangaraj95:suryathangaraj2003@cluster0.0cqnti9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 
const dbName = 'trends';
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

async function fetchTwitterTrends() {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('trends');

        const driver = await new Builder()
            .forBrowser('chrome')
            .setProxy(proxy.manual({
                http: 'us-ca.proxymesh.com:31280',
                https: 'us-ca.proxymesh.com:31280'
            }))
            .build();

        try {
            await driver.get('https://twitter.com/login');

            
            const usernameField = await driver.findElement(By.name('session[username_or_email]'));
            const passwordField = await driver.findElement(By.name('session[password]'));
            const loginButton = await driver.findElement(By.css('div[data-testid="LoginForm_Login_Button"]'));

            await usernameField.sendKeys(env.TWITTER_USERNAME);
            await passwordField.sendKeys(env.TWITTER_PASSWORD)
            await loginButton.click();

           
            await driver.wait(until.elementLocated(By.css('section[aria-labelledby="accessible-list-0"]')), 10000);

           
            const trends = await driver.findElements(By.css('section[aria-labelledby="accessible-list-0"] div span'));
            let top5Trends = [];
            for (let i = 0; i < 5 && i < trends.length; i++) {
                top5Trends.push(await trends[i].getText());
            }

            if (top5Trends.length === 0) {
                throw new Error('No trends found');
            }

            
            await driver.get('https://api.ipify.org/?format=text');
            const ipAddress = await driver.findElement(By.tagName('body')).getText();

            const data = {
                unique_id: uuidv4(),
                trend1: top5Trends[0] || '',
                trend2: top5Trends[1] || '',
                trend3: top5Trends[2] || '',
                trend4: top5Trends[3] || '',
                trend5: top5Trends[4] || '',
                datetime: moment().format(),
                ip_address: ipAddress
            };

            await collection.insertOne(data);

            console.log('Trends fetched and stored successfully:', data);

        } finally {
            await driver.quit();
        }

    } catch (err) {
        console.error('Error occurred:', err);
    } finally {
        await client.close();
    }
}

fetchTwitterTrends().catch(console.error);

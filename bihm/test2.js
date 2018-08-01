var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tombihn');
const request = require("request");

const fs = require('fs');

(async() => {
    let url = `//cdn.shopify.com/s/files/1/1089/8530/products/TB1812-BA.jpg?v=1528823306`
    let imgName = 'a.jpg';
    await writeImg(url, imgName);

})()

async function writeImg(url, imgName) {
    console.log(url);
    console.log(imgName);
    url = 'http:' + url;
    imgName = imgName.split('?')[0]
    request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
        if (!error && response.statusCode == 200) {
            console.log(imgName + 'saving ')
            fs.writeFileSync('./img/' + imgName, body, 'binary');
        } else {
            await takeLongTime()
            writeImg(url, imgName)
            console.log(imgName + 'retry again')
        }
    });

}

function takeLongTime() {
    return new Promise(resolve => {
        setTimeout(() => resolve("long_time_value"), 2000);
    });
}
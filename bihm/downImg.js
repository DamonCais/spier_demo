var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tombihn');
const request = require("request");

const fs = require('fs');


// var product = new mongoose.Schema({
//     url: String,
//     detail: Object,
// });

// mongoose.model('product', product);

// var product = mongoose.model('product');

var errimg = new mongoose.Schema({
    url: String,
    imgName: String,
});

mongoose.model('errimg', errimg);

var errimgs = mongoose.model('errimg');


var product = new mongoose.Schema({
    product: Object,
});

mongoose.model('product', product);

var products = mongoose.model('product');

let count = 0;
let errArr = [];
products.find({}, async(err, res) => {
    for (var k in res) {
        await download(res[k].product)
    }
    errimgs.create(errArr, () => {
        console.log('---')
    })
    console.log(errArr);
})


function takeLongTime() {
    return new Promise(resolve => {
        setTimeout(() => resolve("long_time_value"), 2000);
    });
}

async function writeImg(url, imgName) {

    // await takeLongTime()
    url = url.indexOf('http') === -1 ? 'https:' + url : url;
    console.log(url);
    console.log(imgName);
    imgName = imgName.split('?')[0]
    return new Promise((resolve, reject) => {
            request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
                if (!error && response.statusCode == 200) {
                    fs.writeFileSync('./img/' + imgName, body, 'binary');
                    resolve();
                } else {
                    console.log('------------------------------');
                    console.log(imgName);
                    errArr.push({ url, imgName });
                    resolve();
                }
            });
        })
        // await request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
        //     if (!error && response.statusCode == 200) {
        //         console.log(imgName+'saving')
        //         await fs.writeFileSync('./img/' + imgName, body, 'binary');
        //     } else {
        //         await takeLongTime()
        //         writeImg(url, imgName)
        //         Promise.reject(imgName + 'get err')
        //     }
        // });

}

async function download(product) {
    let iid = product.id;
    let arr = [];
    try {
        if (product.variants) {
            for (let index in product.variants) {
                let element = product.variants[index];
                count++;
                let url = element.featured_image.src
                let ext = url.split('.')[url.split('.').length - 1]
                let imgName = `${iid}_o${element.id}.${ext}`;
                await writeImg(url, imgName)

            }
        }
        if (product.images) {
            for (let index in product.images) {
                let element = product.images[index];
                count++;
                let url = element
                let ext = url.split('.')[url.split('.').length - 1]
                let imgName = `${iid}_g${index}.${ext}`;
                await writeImg(url, imgName)
            }
        }
        let url = product.featured_image
        let ext = url.split('.')[url.split('.').length - 1]
        let imgName = `${iid}.${ext}`;
        count++;
        await writeImg(url, imgName)
    } catch (error) {
        Promise.reject(error);
    }
};
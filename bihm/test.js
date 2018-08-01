var cheerio = require('cheerio');

var qs = require('qs');


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tombihn');

var link = new mongoose.Schema({
    url: String,
});
mongoose.model('link', link);
var links = mongoose.model('link');

var product = new mongoose.Schema({
    product: Object,
});
mongoose.model('product', product);
var products = mongoose.model('product');

let arr = [];
const axios = require('axios');

(async() => {
    links.find({}, async(err, urls) => {
        for (var i in urls) {

            await axios.get(urls[i].url).then(async(res) => {
                // console.log(res.data);
                let reg = /\('productSelect'[\s\S]*?}\);/
                let a1 = res.data.match(reg)
                let reg2 = /\{"[\s\S]*},/
                let a2 = a1[0].match(reg2);
                let obj = JSON.parse(a2[0].slice(0, -1));

                await products.create({ product: obj });
                console.log(urls[i].url + ' success!')
            })
        }
    })




})();
// axios.get('https://www.tombihn.com/products/aeronaut-30-or-45-internal-frame').then(async(res) => {
//     // console.log(res.data);
//     let reg = /\('productSelect'[\s\S]*?}\);/
//     let a1 = res.data.match(reg)
//     let reg2 = /\{"[\s\S]*},/
//     let a2 = a1[0].match(reg2);
//     let obj = JSON.parse(a2[0].slice(0, -1));
//     console.log(obj);
//     await products.create({ product: obj });
// })
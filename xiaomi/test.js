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


    axios.get('https://cdn.cnbj0.fds.api.mi-img.com/miio.files/pages/p_266_4348_0.html?t=1483611954&z=1&q=78').then(async(res) => {
        console.log(res.data);

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
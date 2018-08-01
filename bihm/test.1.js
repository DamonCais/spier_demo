var cheerio = require('cheerio');

var qs = require('qs');


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/tom2guzzu');

var link = new mongoose.Schema({
    url: String,
});

mongoose.model('link', link);
var links = mongoose.model('link');
let arr = [];
const axios = require('axios');
axios.get('https://www.tombihn.com/sitemap_products_1.xml').then(res => {
    let reg = /<loc>https:\/\/www.tombihn.com\/products\/.*?<\/loc>/g
    let urls = res.data.match(reg)
    console.log(urls.length);
    urls.forEach(element => {
        arr.push({ url: element.replace('<loc>', '').replace('</loc>', '') })
    });
    links.create(arr, (err, res) => {
        console.log('res')
    })
})
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');


var img = new mongoose.Schema({
    image: Object,
    id: String,
    name: String
});

mongoose.model('img', img);

var img = mongoose.model('img');


var product = new mongoose.Schema({
    url: String,
    detail: Object,
    id: String,
    name: String
});

mongoose.model('product', product);

var product = mongoose.model('product');

img.find({}, async(err, res) => {
    for (var k in res) {
        let key = res[k].id.split('_')[0];
        console.log(res[k].id);
        var conditions = { id: res[k].id };

        var updates = { $set: { name: key } }; //将用户名更新为“tiny”  

        await img.update(conditions, updates, (err, res) => {
            console.log(res);
        })

    }
})

async function upDateImg(img) {

    let id = img.id.split('_')[0];
    let ext = '';
    let update = {}
    if (img.id.split('_').length === 2) {
        // console.log('isOption');
        ext = parseInt(img.id.split('_')[1]);
    }
    if (!ext) {
        update = { $set: { "detail.data.good.image": img.image } }
    } else if (ext < 30) {
        let key = 'detail.data.good.album[' + ext + '].image'
        update = { $set: { key: img.image } }
    } else {
        let key = 'detail.data.props[' + ext + '].image'
        update = { $set: { key: img.image } }
    }
    product.update({ id: id }, update, (err, res) => {
        console.log(res);
    })

}
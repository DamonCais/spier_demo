var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');


var product = new mongoose.Schema({
    url: String,
    detail: Object,
});

mongoose.model('product', product);

var product = mongoose.model('product');

let count = 0;
product.find({}, async(err, res) => {
    for (var k in res) {
        await download(res[k])
    }
    console.log(count);

})



async function download(product) {
    let iid = product.detail.data.iid;
    product.detail.data.props.forEach((element, index) => {
        if (!element.img) { return }
        count++;
        let url = element.img
        let ext = url.split('.')[url.split('.').length - 1]
        let imgName = `${iid}_${element.pid}.${ext}`;
        try {
            request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
                if (!error && response.statusCode == 200) {
                    await fs.writeFileSync('./img/' + imgName, body, 'binary', function(err, res) {
                        if (err) { console.log(err); }
                    });
                } else {
                    console.log(imgName + 'failed');
                    console.log(response.statusCode)
                    console.log(imgName + 'failed');
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
    product.detail.data.good.album.forEach((element, index) => {
        if (!element) { return }
        count++;
        let url = element
        let ext = url.split('.')[url.split('.').length - 1]
        let imgName = `${iid}_${index}.${ext}`;
        try {
            request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
                if (!error && response.statusCode == 200) {
                    await fs.writeFileSync('./img/' + imgName, body, 'binary', function(err, res) {
                        if (err) { console.log(err); }
                    });
                } else {
                    console.log(imgName + 'failed');
                    console.log(response.statusCode)
                    console.log(imgName + 'failed');
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
    let url = product.detail.data.good['pic_url']
    let ext = url.split('.')[url.split('.').length - 1]
    let imgName = `${iid}.${ext}`;
    try {
        request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
            if (!error && response.statusCode == 200) {
                await fs.writeFileSync('./img/' + imgName, body, 'binary', function(err, res) {
                    if (err) { console.log(err); }
                });
            } else {
                console.log(imgName + 'failed');
                console.log(response.statusCode)
                console.log(imgName + 'failed');
            }
        });
    } catch (error) {
        console.log(error);
    }
};
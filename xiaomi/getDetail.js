var mongoose = require('mongoose');
const axios = require('axios');
var qs = require('qs');

mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');


var goodsid = new mongoose.Schema({
    gid: String,
});

mongoose.model('goodsid', goodsid);

var gsid = mongoose.model('goodsid');


var detail = new mongoose.Schema({
    gid: String,
    detail: Object,
});

mongoose.model('detail', detail);

var details = mongoose.model('detail');



(async() => {

    gsid.find({}).distinct('gid', async(err, gidList) => {
        console.log(gidList.length);
        for (var i in gidList) {
            let data = {
                "detail": {
                    "model": "Shopv2",
                    "action": "getDetail",
                    "parameters": {
                        "gid": gidList[i]
                    }
                }
            }
            await axios({
                url: 'https://youpin.mi.com/app/shop/pipe',
                method: 'post',
                data: qs.stringify({ 'data': JSON.stringify(data) }),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },

            }).then(res => {
                // arr.push(res.data.result)
                let obj = {}
                Object.assign(obj, { gid: gidList[i] }, res.data.result)
                details.create(obj, (err, res) => {
                    if (err) {
                        console.log('fail');
                    }
                    console.log(gidList[i] + 'ok');
                })

            })
        }



    })




})()
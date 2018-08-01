// 获取第一层所有gid

const urls = require('./urls.js');
var qs = require('qs');

const axios = require('axios');

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');


var goodsid = new mongoose.Schema({
    gid: String,
});

mongoose.model('goodsid', goodsid);

var gsid = mongoose.model('goodsid');

var url = "mongodb://localhost:27017/xiaomi";
let config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': 'youpindistinct_id=163ec9eb97e0-0c06208e3e985b-47e1e39; UM_distinctid=163ec9ebaef9a1-07679718884ceb-47e1e39-1fa400-163ec9ebaf1aeb; Hm_lvt_f60d40663f1e63b337d026672aca065b=1528689143,1528689202,1528768742,1528816922; youpin_sessionid=163f49b5bda-060e7a0dd01134-2063; mjclient=pc; CNZZDATA1267968936=1725414733-1528680665-%7C1528819782; Hm_lpvt_f60d40663f1e63b337d026672aca065b=1528820365',
        'Host': 'youpin.mi.com',
        'Origin': 'https://youpin.mi.com',
        'Referer': 'https://youpin.mi.com/detail?gid=101799',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.79 Safari/537.36'
    }
}
var gidList = [];

(async() => {
    let data = {
        "result": {
            "model": "Homepage",
            "action": "BuildClass",
            "parameters": {
                "id": -6
            }
        }
    };
    let res = await axios({
        url: 'https://youpin.mi.com/app/shopv3/pipe',
        method: 'post',
        data: qs.stringify({ 'data': JSON.stringify(data) }),
        headers: config.headers,
    });
    let arr = res.data.result.result.data;
    for (var i in arr) {
        let classList = await getUClassList(arr[i].ucid);
        console.log(classList.length);
        for (var j in classList) {
            if (classList[j].data) {
                classList[j].data.forEach(element => {
                    gidList.push({ gid: element.gid });
                });
            }
        }

    }
    gsid.create(gidList, (err, res) => {
        if (err) {
            console.log('fail')
        }
        console.log(res);

    })
})()

async function getUClassList(id) {
    let data = {
        "uClassList": {
            "model": "Homepage",
            "action": "BuildHome",
            "parameters": {
                "id": id
            }
        }
    };
    let res = await axios({
        url: 'https://youpin.mi.com/app/shopv3/pipe',
        method: 'post',
        data: qs.stringify({ 'data': JSON.stringify(data) }),
        headers: config.headers,
    });
    return res.data.result.uClassList.data;
}

//<iframe style="width:100%;" src="https://home.mi.com/app/shop/content?id=s678990395d922b35"></iframe>
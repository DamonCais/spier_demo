var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/teachershouseshop";
// let data = {"detail":{"model":"Shopv2","action":"getDetail","parameters":{"gid":"102220"}},"comment":{"model":"Comment","action":"getList","parameters":{"goods_id":"102220","orderby":"1","pageindex":"0","pagesize":3}},"activity":{"model":"Activity","action":"getAct","parameters":{"gid":"102220"}}}
let data = {
    "detail": {
        "model": "Shopv2",
        "action": "getDetail",
        "parameters": {
            "gid": "102123"
        }
    }
}
let config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'youpin.mi.com',

    }
}
var qs = require('qs');

const axios = require('axios');
axios({
    url: 'https://youpin.mi.com/app/shop/pipe',
    method: 'post',
    data: qs.stringify({ 'data': JSON.stringify(data) }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },

}).then(res => {
    console.log(JSON.stringify(res.data.result));
})
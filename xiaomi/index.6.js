const urls = require('./urls.js');
var qs = require('qs');

const axios = require('axios');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/xiaomi";
let config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'youpin.mi.com',

    }
}
var arr=[];
urls.forEach(async(element) => {    
    let data = {
        "detail": {
            "model": "Shopv2",
            "action": "getDetail",
            "parameters": {
                "gid": element.split('=')[1]
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
        Object.assign(obj,{url:element},res.data.result)
        MongoClient.connect(url,(err,db)=>{
            var dbo = db.db('xiaomi');
            dbo.collection('productlist').insertOne(obj,(err,res)=>{
                console.log(element+'ok');
                db.close();
            })
        })
        
    })
});



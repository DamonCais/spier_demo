const urls = require('./urls.js');
var qs = require('qs');

const axios = require('axios');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/xiaomi";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db('xiaomi');
    dbo.collection('productlist').find().toArray(async(err, res) => {
        // if (err) throw err;
        let count = 0;
        for (var i in res) {
           await TraversalObject(res[i].detail);
        }
        console.log(count);
        // console.log('finish');
        db.close();
    })
})


//js遍历对象
var TraversalObject = async function (obj)
{
    for (var a in obj) {
        if (typeof (obj[a]) == "object") {
           await TraversalObject(obj[a]); //递归遍历
        }
        else {
            if(typeof(obj[a]) ==='string'&&obj[a].indexOf('.jpeg')!==-1){
                console.log(a + "=" + obj[a]);//值就显示
            }
        }
    }
}
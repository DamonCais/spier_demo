var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/teachershouseshop";


const axios = require('axios');
// axios.get('http://www.teachershouseshop.com/r/v1/sites/11031767/products?per=240&page=1').then(res => {
//     console.log(res.data.data.products.length);
//     let myObj = res.data.data.products;
//     console.log(typeof(myObj))
//     MongoClient.connect(url, function(err, db) {
//         if (err) throw err;
//         var dbo = db.db('teachershouseshop');
//         dbo.collection('productList').insertMany(myObj, (err, res) => {
//             console.log(res);
//             db.close();
//         })
//     })
// })

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db('teachershouseshop');
    dbo.collection('productList').find({ 'detailEnabled': true }).toArray(async(err, res) => {
        // if (err) throw err;
        for (var i in res) {
            await getDetail(res[i], dbo);
        }
        console.log('finish');
    })
})

async function getDetail(product, dbo) {
    return new Promise((resolve, reject) => {
        axios.get('http://www.teachershouseshop.com/r/v1/sites/11031767/products/' + product.id).then(res => {
            // console.log(res.data.data.product.detail);
            var whereStr = { _id: product._id };
            var updateStr = { $set: { detail: res.data.data.product.detail } }
            dbo.collection('productList').updateOne(whereStr, updateStr, function(err, res) {
                if (err) reject('err');
                console.log(product.id + '更新成功');
                resolve();
            })
        })
    })

}
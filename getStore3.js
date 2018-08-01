var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/debug_db";


const http = require('http');
const fs = require('fs');
const request = require("request");

const axios = require('axios');
axios.defaults.headers.Cookie = 'gsid=s%3ACSRuM8j9XBirj1j3cjHr7KLnbqIpYY2S.MViAl%2FbA0DRK6jY%2FyPAvSdZIPOMz8RTFCcynFxx1so4; mp_f62495573ac055f984d868513e5783fd_mixpanel=%7B%22distinct_id%22%3A%20%22163382464a5117-080b11ca99de83-3961430f-1fa400-163382464a64ba%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.guzzu.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.guzzu.com%22%7D; _ga=GA1.2.137029754.1525832358; _gid=GA1.2.1317687253.1527644442; mp_197e4a735286ca646f33f76f206f05dd_mixpanel=%7B%22distinct_id%22%3A%20%22163aeb49f2b178-0f000b5c0aa92d-39614807-1fa400-163aeb49f2c95%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fstore1.guzzu.cn%2F%22%2C%22%24initial_referring_domain%22%3A%20%22store1.guzzu.cn%22%7D; mp_de585f2ee4292819980c164b82e8e6fd_mixpanel=%7B%22distinct_id%22%3A%20%22163aee825fd97c-05e683a7d1f744-39614807-1fa400-163aee825fe1a3%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D';
const service = axios.create({
    // baseURL: 'https://master-dev.guzzu.cn/suapi/2',
    // baseURL: 'https://mp-dev.guzzu.cn/mpapi/2',
    timeout: 15000, // 请求超时时间
    withCredentials: true,


});
let params = {
        filters: { type: "default", isArchived: { $ne: true } },

        page: 1,
        pageSize: 50,
        sort: "-publishedAt",
        storeId: "57d7703f8a2848bc5f150e06"
    }
    // axios.post('https://mp-dev.guzzu.cn/mpapi/2/Product.find', params, ).then(res => {
    //         console.log(res.data.results);
    //         let myObj = res.data.results;
    //         MongoClient.connect(url, function(err, db) {
    //             if (err) throw err;
    //             var dbo = db.db('debug_db');
    //             dbo.collection('products').insertMany(myObj, (err, res) => {
    //                 console.log(res);
    //                 db.close();
    //             })
    //         })

//     }).catch(err => {
//         console.log(err.response.data.detail.data.details);
//     })
// 获取基本资料


// 获取detail
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db('debug_db');
    var updateStr = { $set: { store: '57c4ed03cc4f36bc2c12ab29' } }
    dbo.collection('products').update({}, updateStr, { multi: true }, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        console.log('success');
        db.close();
    })
})
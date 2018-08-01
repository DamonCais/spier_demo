const axios = require('axios');
let url = "https://mp-dev.guzzu.cn/imapi/2/StoreMedia.upload"
    // let url = "https://api-dev.guzzu.cn/v3/backapi/shopping-malls/5adedc43de3c90022eb25d3b/medias"
    // 
const fs = require('fs');
const request = require('request');
let data = fs.createReadStream(__dirname + '/img/366703_1.jpg')
let form = {
    type: "image",
    file: data,
    name: '5aefad6de3b736281c89d9ae',
}

request.post({ url: url, formData: form }, (err, res, body) => {
    if (err) console.log(err)
    console.log(body)
})
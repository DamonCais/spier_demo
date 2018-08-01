var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/tombihn";

const axios = require('axios')
const FormData = require('form-data')
const path = require('path')
const { promisify } = require('util')


var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tombihn');
var imgdetail = new mongoose.Schema({
    id: String,
    image: Object,
    type: String
});

mongoose.model('imgdetail', imgdetail);

var imgdetails = mongoose.model('imgdetail');

(async() => {
    // 第一步获取文件列表
    let namesList = [];
    imgdetails.find({}, async(err, res) => {
        console.log(res.length);
        for (var k in res) {
            if (res[k].type) {
                namesList.push(res[k].id + '_' + res[k].type);
            } else {
                namesList.push(res[k].id);
            }
        }
        console.log(namesList[0])
        fs.readdir('./img', async function(err, files) {
            var fileList = [];
            console.log(files[0])
            for (var i = 0; i < files.length; i++) {
                var filename = files[i];
                if (namesList.indexOf(filename.split('.')[0]) === -1) {
                    var stats = fs.statSync('./img/' + filename);
                    if (!stats.isDirectory()) {
                        fileList.push(filename);
                    }
                }
            }

            console.log(fileList.length);
            //上传文件到dev，并保存到本地数据库
            upLoadImg(fileList);
        });
    })

})()


function buildForm(file) {
    const data = fs.createReadStream(file)
    const form = new FormData()
        // form.append('type', 'image')
    form.append('file', data)
        // form.append('option', 'long')
        // form.append('scope', 'store')
        // form.append('storeId', '57d7703f8a2848bc5f150e06')
    return form
}

async function getFormHeaders(form) {
    const getLen = promisify(form.getLength).bind(form)
    const len = await getLen()
    return {
        ...form.getHeaders(),
        'Content-Length': len,
        'Content-Type': 'multipart/form-data',
        'X-Guzzu-Access-Token': '1wAZojG3v8wZdgjMD1o3g8fzXHc5PFDH'
    }
}


async function upLoadImg(fileList) {
    let a = [];
    for (var i = 0; i < fileList.length; i++) {
        const img = path.join(__dirname, './img/' + fileList[i])
        const url = 'https://api-dev.guzzu.cn/v3/backapi/stores/5b1100f0ee75535cac0d30d2/medias'

        const form = buildForm(img)
        const headers = await getFormHeaders(form)
            // return axios.post(url, form, { headers: headers })

        await axios({
            url,
            method: 'post',
            data: form,
            headers: headers
        }).then(async(res) => {
            console.log(fileList[i] + 'success');
            await upDateImgJson(res.data, fileList[i]);
        }).catch(err => {
            console.log(err.response);
        })
    }
}


function upDateImgJson(json, filename) {
    return new Promise((resolve, reject) => {
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db('tombihn');
            let ids = filename.split('.')[0];
            var whereStr = { id: parseInt(ids.split('_')[0]) }
            let myObj = { id: ids.split('_')[0], image: json.image, type: ids.split('_')[1] || '' };
            dbo.collection('imgdetails').insert(myObj, (err, res) => {
                // console.log(ids + 'success');
                db.close();
                resolve();
            })
        })
    })
}
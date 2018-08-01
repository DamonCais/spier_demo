var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/teachershouseshop";

const axios = require('axios')
const FormData = require('form-data')
const path = require('path')
const { promisify } = require('util')



// 第一步获取文件列表
fs.readdir('./imgd2', async function(err, files) {
    var fileList = [];
    for (var i = 0; i < files.length; i++) {
        var filename = files[i];
        var stats = fs.statSync('./imgd2/' + filename);
        if (!stats.isDirectory()) {
            fileList.push(filename);
        }
    }
    // console.log(fileList);
    //上传文件到dev，并保存到本地数据库
    upLoadImg(fileList);

});

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
        'X-Guzzu-Access-Token': 'ZSUkc4P0hol95vATJypnjNScaFbftIvu'
    }
}


async function upLoadImg(fileList) {
    let a = [];
    for (var i = 0; i < fileList.length; i++) {
        const img = path.join(__dirname, './imgd2/' + fileList[i])
        const url = 'https://api-dev.guzzu.cn/v3/backapi/stores/5aefad6de3b736281c89d9ae/medias'

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
            var dbo = db.db('teachershouseshop');
            let ids = filename.split('.')[0];
            var whereStr = { id: parseInt(ids.split('_')[0]) }
            let myObj = { id: ids, image: json.image };
            dbo.collection('imgDetail').insert(myObj, (err, res) => {
                // console.log(ids + 'success');
                db.close();
                resolve();
            })
        })
    })
}
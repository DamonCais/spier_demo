const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

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
        'X-Guzzu-Access-Token': 'O90JpFmci4g8QNmS7OttBGbwUX6rNFPc'
    }
}

async function main() {
    const img = path.join(__dirname, './img/366703_1.jpg')
        // const url = 'http://localhost:4020/imapi/2/StoreMedia.upload'
    const url = 'https://api-dev.guzzu.cn/v3/backapi/stores/5aefad6de3b736281c89d9ae/medias'

    const form = buildForm(img)
    const headers = await getFormHeaders(form)
        // return axios.post(url, form, { headers: headers })
    return axios({
        url,
        method: 'post',
        data: form,
        headers: headers
    })
}


main().then(res => {
    console.log(res.data)
}).catch(err => {
    console.log(err.response.data);
    // console.log(err.response.data);
    // console.log(err.response.data.detail.data.details);
})
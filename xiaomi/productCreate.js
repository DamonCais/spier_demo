var mongoose = require('mongoose');
var cheerio = require('cheerio');
mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');

const axios = require('axios');
// axios.defaults.headers.Cookie = '';
const service = axios.create({
    // baseURL: 'https://master-dev.guzzu.cn/suapi/2',
    // baseURL: 'https://mp-dev.guzzu.cn/mpapi/2',
    timeout: 15000, // 请求超时时间
    withCredentials: true,
    headers: { 'Cookie': 'gsid2=s%3ANPc593QomzlnkLiKIBSeYsOhsnAeaJpq.%2FPksO%2FG0ve6yEi5DG%2FwRs9GaGSzZqWI8txQrq%2F07aRY; mp_197e4a735286ca646f33f76f206f05dd_mixpanel=%7B%22distinct_id%22%3A%20%22163f2e060e60-0267adc60a7bb6-47e1e39-1fa400-163f2e060e7181%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D; _ga=GA1.2.1072746251.1528788181; Hm_lvt_0bbd7894e3c0bcc58b7f908e5f3edc2b=1528788192; mp_daf1bd7814c88c67949a026375dcd5b0_mixpanel=%7B%22distinct_id%22%3A%20%22163f2e08a3f59b-0343a3402ff70e-47e1e39-1fa400-163f2e08a4019c%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fmp.guzzu.cn%2F%22%2C%22%24initial_referring_domain%22%3A%20%22mp.guzzu.cn%22%7D; mp_f62495573ac055f984d868513e5783fd_mixpanel=%7B%22distinct_id%22%3A%20%22163f195dd41579-0d76c37d29c221-47e1e39-1fa400-163f195dd43d86%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D; mp_de585f2ee4292819980c164b82e8e6fd_mixpanel=%7B%22distinct_id%22%3A%20%22163f19656742b6-01832d007cc141-47e1e39-1fa400-163f196567536b%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D' }

});

var imgdetail = new mongoose.Schema({
    gid: String,
    image: Object,
    type: String
});

mongoose.model('imgdetail', imgdetail);

var imgdetails = mongoose.model('imgdetail');

var detail = new mongoose.Schema({
    gid: String,
    detail: Object,
});

mongoose.model('detail', detail);

var details = mongoose.model('detail');

let count = 0;
details.find({}, async(err, res) => {
    for (var k in res) {
        if (res[k].detail.data.good) {
            try {
                let p = await productMaker(res[k])
                count++
                await productCreat(p);
            } catch (error) {
                console.log(error);
            }

        }
    }
    console.log(count);
    // let p = await productMaker(res[0])
    // await productCreat(p);
    // console.log(p);
})




async function productCreat(product) {
    return new Promise((resolve, reject) => {
        // console.log(product);

        service.post('https://mp-dev.guzzu.cn/mpapi/2/Product.create', product).then(res => {
            console.log(product.name.en + 'success');
            resolve();
        }).catch(err => {
            reject(err);
        })
    })
}

var productMaker = async function(res) {

    let product = res.detail.data.good;
    let props = res.detail.data.props
    let obj;
    let id = product.gid;

    obj = {
        description: { zh: '', en: "" },
        gallery: [],
        image: {},
        inventoryPolicy: 'limited',
        isArchived: false,
        isDiscounted: false,
        maxQuantity: product.inventory > 0 ? product.inventory : 0,
        metaDescription: { zh: "", en: "" },
        name: { en: product.name, zh: product.name },
        originalPrice: product.price_min,
        price: product.price_min,
        productOptions: [],
        shippingCosts: [{ country: "CHN", price: 0 }],
        shippingType: 'default',
        slug: 'mi_' + id,
        status: 'published',
        storeId: '5b21da4f65219467e2889cc2',
        weixinShareDescription: { zh: "", en: "" },
        weixinShareTitle: { zh: "", en: "" }
    };
    let html = '';

    for (var i in product.intro_ext) {
        if (product.intro_ext[i].url) {
            try {
                let imgs = await getIntor(product.intro_ext[i].url);
                html += `<p>${product.intro_ext[i].title}</p>`
                for (var j in imgs) {
                    html += `<img style="display:block;" width="100%" src="${imgs[j]}" />`
                }
            } catch (error) {
                console.log(error);
            }

        }
    }
    obj.description = {
        zh: html,
        en: html,
    }
    props.forEach(element => {
        obj.productOptions.push({
            inventoryPolicy: 'limited',
            maxQuantity: element.inventory > 0 ? element.inventory : 0,
            name: { en: element.name, zh: element.name },
            price: element.price,
            image: {},
            pid: element.pid
        })
    });
    try {
        obj = await pushImgs(obj, id);

    } catch (error) {
        console.log(error);
    }
    // await imgdetails.find({ gid: id }, (err, res) => {
    //     if (err) {
    //         console.log(err);
    //         return;
    //     }
    //     for (var k in res) {
    //         let image = res[k].image
    //         let gid = res[k].gid;
    //         let type = res[k].type
    //         if (type) {
    //             if (type.substr(0, 1) === 'o') {
    //                 let index = obj.productOptions.findIndex(item => item.pid === type.substr(1));
    //                 if (index !== -1) {
    //                     obj.productOptions[index].image = image;
    //                 }
    //             } else if (type.substr(0, 1) === 'g') {
    //                 obj.gallery.push(image)
    //             }
    //         } else {
    //             obj.image = image;
    //         }
    //     }
    // })

    obj.productOptions.forEach(element => {
        delete element.pid;
    });

    return obj;
}

function pushImgs(obj, id) {
    return new Promise((resolve, reject) => {
        imgdetails.find({ gid: id }, (err, res) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            for (var k in res) {
                let image = res[k].image
                let gid = res[k].gid;
                let type = res[k].type
                if (type) {
                    if (type.substr(0, 1) === 'o') {
                        let index = obj.productOptions.findIndex(item => item.pid === type.substr(1));
                        if (index !== -1) {
                            obj.productOptions[index].image = image;
                        }
                    } else if (type.substr(0, 1) === 'g') {
                        obj.gallery.push(image)
                    }
                } else {
                    obj.image = image;
                }
            }
            resolve(obj);
        })
    })
}

function getIntor(url) {
    return new Promise((resolve, reject) => {
        axios.get(url).then(res => {
            var $ = cheerio.load(res.data);
            let arr = [];
            $('img').each((index, element) => {
                let img = element.attribs.src || element.attribs['data-src'] || element.attribs['data-lazy-src'];
                arr.push(img);
            })
            resolve(arr);
        }).catch(err => {
            reject(err);
        })
    })
}

function _(value, path) {
    return (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path).reduce((o, k) => (o || {})[k], value) || undefined;
};
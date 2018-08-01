var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tombihn');
const request = require("request");

const fs = require('fs');

const axios = require('axios');
axios.defaults.headers.Cookie = 'gsid2=s%3AO4nDF1mqzwTXWsrVhVv7U4aZE00WELix.YXxtrtJjMMIHODtExR6CGwOqFIedUmI8g%2FQdZEQ28wA; mp_197e4a735286ca646f33f76f206f05dd_mixpanel=%7B%22distinct_id%22%3A%20%22163f2e060e60-0267adc60a7bb6-47e1e39-1fa400-163f2e060e7181%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D; _ga=GA1.2.1072746251.1528788181; Hm_lvt_0bbd7894e3c0bcc58b7f908e5f3edc2b=1528788192; mp_daf1bd7814c88c67949a026375dcd5b0_mixpanel=%7B%22distinct_id%22%3A%20%22163f2e08a3f59b-0343a3402ff70e-47e1e39-1fa400-163f2e08a4019c%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fmp.guzzu.cn%2F%22%2C%22%24initial_referring_domain%22%3A%20%22mp.guzzu.cn%22%7D; mp_f62495573ac055f984d868513e5783fd_mixpanel=%7B%22distinct_id%22%3A%20%22163f195dd41579-0d76c37d29c221-47e1e39-1fa400-163f195dd43d86%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D; mp_de585f2ee4292819980c164b82e8e6fd_mixpanel=%7B%22distinct_id%22%3A%20%22163f19656742b6-01832d007cc141-47e1e39-1fa400-163f196567536b%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D';
const service = axios.create({
    // baseURL: 'https://master-dev.guzzu.cn/suapi/2',
    // baseURL: 'https://mp-dev.guzzu.cn/mpapi/2',
    timeout: 15000, // 请求超时时间
    withCredentials: true,


});

var imgdetail = new mongoose.Schema({
    id: String,
    image: Object,
    type: String
});

mongoose.model('imgdetail', imgdetail);

var imgdetails = mongoose.model('imgdetail');

var product = new mongoose.Schema({
    product: Object,
});

mongoose.model('product', product);

var products = mongoose.model('product');

let count = 0;
products.find({}, async(err, res) => {
    for (var k in res) {

        let p = await productMaker(res[k])
        await productCreat(p);
    }

    // let p = await productMaker(res[0])
    // await productCreat(p)
    // console.log(p);
})


// product.find({}, async(err, res) => {
//     for (var k in res) {
//         let p = await productMaker(res[k])
//         await productCreat(p);
//     }
// })

// img.find({}, async(err, res) => {
//     for (var k in res) {
//         let key = res[k].id.split('_')[0];
//         console.log(res[k].id);
//         var conditions = { id: res[k].id };

//         var updates = { $set: { name: key } }; //将用户名更新为“tiny”  

//         await img.update(conditions, updates, (err, res) => {
//             console.log(res);
//         })

//     }
// })

// async function upDateImg(img) {

//     let id = img.id.split('_')[0];
//     let ext = '';
//     let update = {}
//     if (img.id.split('_').length === 2) {
//         // console.log('isOption');
//         ext = parseInt(img.id.split('_')[1]);
//     }
//     if (!ext) {
//         update = { $set: { "detail.data.good.image": img.image } }
//     } else if (ext < 30) {
//         let key = 'detail.data.good.album[' + ext + '].image'
//         update = { $set: { key: img.image } }
//     } else {
//         let key = 'detail.data.props[' + ext + '].image'
//         update = { $set: { key: img.image } }
//     }
//     product.update({ id: id }, update, (err, res) => {
//         console.log(res);
//     })

// }

async function productCreat(product) {
    return new Promise((resolve, reject) => {
        // console.log(product);

        service.post('https://mp-dev.guzzu.cn/mpapi/2/Product.create', product).then(res => {
            console.log(product.name.en + 'success');
            resolve();
        }).catch(err => {
            // console.log(err);
            console.log(err.response.data);
            console.log(err.response.data.detail.data);
            reject(err);
        })
    })
}

var productMaker = async function(res) {
    let product = res.product;
    let props = res.product.variants
    let obj;
    let id = product.id;

    obj = {
        description: { zh: product.description, en: product.description },
        gallery: [],
        image: {},
        inventoryPolicy: 'limited',
        isArchived: false,
        isDiscounted: false,
        maxQuantity: 0,
        metaDescription: { zh: "", en: "" },
        name: { en: product.title, zh: product.title },
        originalPrice: product.price,
        price: product.price,
        productOptions: [],
        shippingCosts: [{ country: "CHN", price: 0 }],
        shippingType: 'default',
        slug: product.handle,
        status: 'published',
        storeId: '5b1100f0ee75535cac0d30d2',
        weixinShareDescription: { zh: "", en: "" },
        weixinShareTitle: { zh: "", en: "" }
    };
    await props.forEach(element => {
        obj.maxQuantity += element.inventory_quantity > 0 ? element.inventory_quantity : 0;
        obj.productOptions.push({
            inventoryPolicy: 'limited',
            maxQuantity: element.inventory_quantity > 0 ? element.inventory_quantity : 0,
            name: { en: element.title, zh: element.title },
            price: element.price,
            image: {},
            pid: element.id
        })
    });
    return new Promise((resolv, reject) => {
        imgdetails.find({ id: id }, (err, res) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('p l ' + res.length)

            for (var k in res) {
                let image = res[k].image
                let type = res[k].type
                if (type) {
                    if (type.substr(0, 1) === 'o') {
                        let index = obj.productOptions.findIndex(item => item.pid == type.substr(1));
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
            obj.productOptions.forEach(element => {
                delete element.pid;
            });

            resolv(obj);

        })
    })



}

function _(value, path) {
    return (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path).reduce((o, k) => (o || {})[k], value) || undefined;
};
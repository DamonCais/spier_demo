var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');

const axios = require('axios');
axios.defaults.headers.Cookie = 'gsid2=s%3ACaou4fbFT7bqGdblpcWHftwYcPyPVxpU.urSgfI8TXBwrgDgBMRPdCD3mrtCEguv3IYNrN1eTbTQ; mp_de585f2ee4292819980c164b82e8e6fd_mixpanel=%7B%22distinct_id%22%3A%20%22163f19656742b6-01832d007cc141-47e1e39-1fa400-163f196567536b%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D; mp_f62495573ac055f984d868513e5783fd_mixpanel=%7B%22distinct_id%22%3A%20%22163f195dd41579-0d76c37d29c221-47e1e39-1fa400-163f195dd43d86%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D';
const service = axios.create({
    // baseURL: 'https://master-dev.guzzu.cn/suapi/2',
    // baseURL: 'https://mp-dev.guzzu.cn/mpapi/2',
    timeout: 15000, // 请求超时时间
    withCredentials: true,


});
var img = new mongoose.Schema({
    image: Object,
    id: String,
    name: String
});

mongoose.model('img', img);

var img = mongoose.model('img');


var product = new mongoose.Schema({
    url: String,
    detail: Object,
    id: String,
    name: String
});

mongoose.model('product', product);

var product = mongoose.model('product');

product.find({}, async(err, res) => {
    for (var k in res) {
        let p = await productMaker(res[k])
        await productCreat(p);
    }
})

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

        service.post('https://mp.guzzu.cn/mpapi/2/Product.create', product).then(res => {
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
    let product = res.detail.data.good;
    let props = res.detail.data.props
    let obj;
    // if (props.length === 1) {
    //     obj = {
    //         description: { zh: product.summary, en: "" },
    //         gallery: [],
    //         image: {},
    //         inventoryPolicy: 'limited',
    //         isArchived: false,
    //         isDiscounted: false,
    //         maxQuantity: product.inventory,
    //         metaDescription: { zh: "", en: "" },
    //         name: { en: product.name, zh: product.name },
    //         originalPrice: product.price_min,
    //         price: product.price_min,
    //         productOptions: [],
    //         shippingCosts: [{ country: "CHN", price: 0 }],
    //         shippingType: 'default',
    //         slug: '',
    //         status: 'published',
    //         storeId: '5b1100f0ee75535cac0d30d2',
    //         weixinShareDescription: { zh: "", en: "" },
    //         weixinShareTitle: { zh: "", en: "" }
    //     };
    // } else {
    let id = product.gid;

    obj = {
        description: { zh: product.summary, en: "" },
        gallery: [],
        image: {},
        inventoryPolicy: 'limited',
        isArchived: false,
        isDiscounted: false,
        maxQuantity: product.inventory,
        metaDescription: { zh: "", en: "" },
        name: { en: product.name, zh: product.name },
        originalPrice: product.price_min,
        price: product.price_min,
        productOptions: [],
        shippingCosts: [{ country: "CHN", price: 0 }],
        shippingType: 'default',
        slug: 'xiaomi_' + id,
        status: 'published',
        storeId: '57c4ed03cc4f36bc2c12ab29',
        weixinShareDescription: { zh: "", en: "" },
        weixinShareTitle: { zh: "", en: "" }
    };
    props.forEach(element => {
        obj.productOptions.push({
            inventoryPolicy: 'limited',
            maxQuantity: element.inventory,
            name: { en: element.name, zh: element.name },
            price: element.price,
            image: {},
            pid: element.pid
        })
    });
    // }
    let gallery = new Array(product.album.length);
    obj.gallery = gallery;
    await img.find({ name: id }, (err, res) => {
        if (err) {
            console.log(err);
            return;
        }
        for (var k in res) {
            let image = res[k].image
            let a = res[k].id;
            if (a.split('_').length === 2) {
                if (parseInt(a.split('_')[1]) > 30) {
                    let index = obj.productOptions.findIndex(item => item.pid === a.split('_')[1]);
                    if (index !== -1) {
                        obj.productOptions[index].image = image;
                    }
                } else {
                    let index = parseInt(a.split('_')[1])
                    console.log('gallery' + index);
                    obj.gallery[index] = image;
                }
            } else {
                obj.image = image;
            }
        }
    })

    obj.productOptions.forEach(element => {
        delete element.pid;
    });

    return obj;
}

function _(value, path) {
    return (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path).reduce((o, k) => (o || {})[k], value) || undefined;
};
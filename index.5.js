var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/teachershouseshop";


const http = require('http');
const fs = require('fs');
const request = require("request");

const axios = require('axios');
axios.defaults.headers.Cookie = 'gsid=s%3AMCYMHCkktHUJAILtu4Jqf4AZ8UcxYdny.n7ayn5WUjRBa5%2B0jT7HyrS8LjUBqKNgmJbe8%2F41sGYA; mp_f62495573ac055f984d868513e5783fd_mixpanel=%7B%22distinct_id%22%3A%20%22163382464a5117-080b11ca99de83-3961430f-1fa400-163382464a64ba%22%2C%22%24initial_referrer%22%3A%20%22https%3A%2F%2Fwww.guzzu.com%2F%22%2C%22%24initial_referring_domain%22%3A%20%22www.guzzu.com%22%7D; _ga=GA1.2.137029754.1525832358; mp_de585f2ee4292819980c164b82e8e6fd_mixpanel=%7B%22distinct_id%22%3A%20%22163a98ce4c7487-0ab78653158a43-39614807-1fa400-163a98ce4c8857%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%7D';
const service = axios.create({
    // baseURL: 'https://master-dev.guzzu.cn/suapi/2',
    // baseURL: 'https://mp-dev.guzzu.cn/mpapi/2',
    timeout: 15000, // 请求超时时间
    withCredentials: true,


});
// 获取基本资料
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

// 获取detail
MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db('teachershouseshop');
    dbo.collection('productList').find().toArray(async(err, res) => {
        // if (err) throw err;
        let count = 0;

        for (var i in res) {
            try {
                // await getDetail(res[i], dbo);

                // 下载图片			
                // await download(res[i]);

                let product = await productMaker(res[i])
                await productCreat(product);

            } catch (error) {
                // console.log(error);
            }
        }
    })
})

// ProductList Image Json Update
// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     var dbo = db.db('teachershouseshop');
//     dbo.collection('imgList').find().toArray(async(err, res) => {
//         // if (err) throw err;
//         let count = 0;
//         for (var i in res) {
//             try {
//                 let rd = await updateImg(res[i], dbo)
//                 console.log(rd)
//             } catch (error) {
//                 console.log(error);
//             }
//             // await getDetail(res[i], dbo);
//             // let product = await productMaker(res[i])
//             // await productCreat(product);
//         }
//         db.close();
//     })
// })

async function updateImg(imgs, dbo) {
    let id = parseInt(imgs.id.split('_')[0]);
    let index = parseInt(imgs.id.split('_')[1]);
    var whereStr = { id: id };
    let image = imgs.image;
    let productList = dbo.collection('productList');
    return new Promise((resolve, reject) => {
        productList.findOne(whereStr).then(res => {
            res.picture[index].image = image;
            var updateStr = { $set: { picture: res.picture } }
            productList.updateOne(whereStr, updateStr).then(res => {
                // console.log(imgs.id);
                resolve(imgs.id);
            })
        }).catch(err => {
            console.log('err');
            console.log(whereStr);
            reject(imgs.id);
        })
    })

    // await dbo.collection('productList').findOne(whereStr, async(err, res) => {
    //     res.picture[index].image = image;
    //     var updateStr = { $set: { picture: res.picture } }
    //     await dbo.collection('productList').updateOne(whereStr, updateStr, (err, res) => {
    //         if (err) {
    //             console.log(whereStr);
    //             return;
    //         }
    //         console.log(whereStr.id + '更新成功')
    //     })
    // })
}





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
        }).catch(err => {
            console.log(err.response.data);
            reject();
        })
    })

}

async function productCreat(product) {
    return new Promise((resolve, reject) => {
        // console.log(product);
        service.post('https://mp-dev.guzzu.cn/mpapi/2/Product.create', product).then(res => {
            console.log(product.name.en + 'success');
            resolve();
        }).catch(err => {
            // console.log(err);
            console.log(product.name.en + 'error');
            // console.log(err.response.data.detail.data);
            reject(err);
        })
    })
}


async function download(product) {
    product.picture.forEach((element, index) => {
        let url = element.url.split('?')[0];
        let ext = url.split('.')[url.split('.').length - 1]
        let imgName = `${product.id}_${index}.${ext}`;
        return new Promise((resolve, reject) => {
            try {
                // request(url).pipe(fs.createWriteStream('./imgs/' + imgName)).on('close', function() {
                //         console.log(imgName + 'saved!')
                //         resolve()
                //     })
                request({ uri: url, encoding: 'binary' }, function(error, response, body) {
                    if (!error && response.statusCode == 200) {
                        fs.writeFileSync('./img2/' + imgName, body, 'binary', function(err, res) {
                            if (err) { console.log(err); }
                            console.log(imgName + 'success');
                            resolve();
                        });
                    } else {
                        console.log(response.statusCode)
                        console.log(imgName + 'failed');
                        reject();
                    }
                });
            } catch (error) {
                reject()
            }
        })

    });
};





async function productMaker(product) {
    let obj;
    if (product.variations.length === 1) {
        obj = {
            description: { zh: "", en: product.description },
            gallery: [],
            image: product.picture[0].image,
            inventoryPolicy: 'limited',
            isArchived: false,
            isDiscounted: false,
            maxQuantity: 1,
            metaDescription: { zh: "", en: "" },
            name: { en: product.name, zh: '' },
            originalPrice: product.variations[0].price,
            price: product.variations[0].price,
            productOptions: [],
            shippingCosts: [{ country: "CHN", price: 0 }],
            shippingType: 'default',
            slug: product.slugPath.split('/')[product.slugPath.split('/').length - 1],
            status: 'published',
            storeId: '57d7703f8a2848bc5f150e06',
            weixinShareDescription: { zh: "", en: "" },
            weixinShareTitle: { zh: "", en: "" }
        };
    } else {
        obj = {
            description: { zh: "", en: product.description },
            gallery: [],
            image: product.picture[0].image,
            inventoryPolicy: 'limited',
            isArchived: false,
            isDiscounted: false,
            maxQuantity: 1,
            metaDescription: { zh: "", en: "" },
            name: { en: product.name, zh: '' },
            originalPrice: product.variations[0].price,
            price: product.variations[0].price,
            productOptions: [],
            shippingCosts: [{ country: "CHN", price: 0 }],
            shippingType: 'default',
            slug: product.slugPath.split('/')[product.slugPath.split('/').length - 1],
            status: 'published',
            storeId: '57d7703f8a2848bc5f150e06',
            weixinShareDescription: { zh: "", en: "" },
            weixinShareTitle: { zh: "", en: "" }
        };
        product.variations.forEach(element => {
            obj.productOptions.push({
                inventoryPolicy: element.quantity === -1 ? 'unlimited' : 'limited',
                maxQuantity: element.quantity,
                name: { en: element.name, zh: '' },
                price: element.price,
                // image: _(element, 'image.image') || {}
            })
        });
    }
    product.picture.forEach((element, index) => {
        if (index) {
            obj.gallery.push(element.image);
        }
    });
    return obj;
}

function _(value, path) {
    return (!Array.isArray(path) ? path.replace(/\[/g, '.').replace(/\]/g, '').split('.') : path).reduce((o, k) => (o || {})[k], value) || undefined;
};
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

let count = 0;

MongoClient.connect(url, async(err, db) => {
    if (err) throw err;
    var dbo = db.db('teachershouseshop');
    var whereStr = { detailEnabled: true }
    await dbo.collection('imgDetail').find().toArray(async(err, imgs) => {
        for (var i in imgs) {
            // let id = imgs[i].id.split('_')[0];
            // let index = imgs[i].id.split('_')[1];
            // let wStr = {'id':id}
            // let image = imgs[i].image;
            try {
                await updateImg(imgs[i], dbo);

            } catch (error) {

            }
            // await	dbo.collection('productList').findOne(wStr,async (err,res)=>{
            // 		console.log(res);
            // 		res.detail.items[index].image = image;
            // 		var updateStr = { $set: { detail: res.detail } }
            // 		await dbo.collection('productList').updateOne(wStr,updateStr,async (err,res)=>{
            // 			if (err) {
            // 					console.log(wStr+'err');
            // 					return;
            // 			}
            // 			console.log(wStr+index + '更新成功')
            // 		})
            // 	})

        }
        console.log(count);
        db.close();
    })
})

async function updateImg(imgs, dbo) {
    let id = parseInt(imgs.id.split('_')[0]);
    let index = parseInt(imgs.id.split('_')[1]);
    var whereStr = { id: id };
    let image = imgs.image;
    let productList = dbo.collection('productList');
    return new Promise((resolve, reject) => {
        productList.findOne(whereStr).then(res => {
            res.detail.items[index].image = image;
            var updateStr = { $set: { detail: res.detail } }
            productList.updateOne(whereStr, updateStr).then(res => {
                console.log(imgs.id + 'success');
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



async function download(product) {
    product.detail.items.forEach(async(element, index) => {
        if (element.type !== 'Image') { return }
        count++;
        let url = 'https://nzr2ybsda.qnssl.com/' + element.storageKey;
        let ext = url.split('.')[url.split('.').length - 1]
        let imgName = `${product.id}_${index}.${ext}`;
        try {
            request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
                if (!error && response.statusCode == 200) {
                    await fs.writeFileSync('./imgd2/' + imgName, body, 'binary', function(err, res) {
                        if (err) { console.log(err); }
                    });
                } else {
                    console.log(imgName + 'failed');
                    console.log(response.statusCode)
                    console.log(imgName + 'failed');
                }
            });
        } catch (error) {
            console.log(error);
        }
    });
};

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
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/xiaomi');
const request = require("request");

const fs = require('fs');


// var product = new mongoose.Schema({
//     url: String,
//     detail: Object,
// });

// mongoose.model('product', product);

// var product = mongoose.model('product');

var detail = new mongoose.Schema({
    gid: String,
    detail: Object,
});

mongoose.model('detail', detail);

var details = mongoose.model('detail');

var intro = new mongoose.Schema({
    gid: String,
    intro: Array,
});

mongoose.model('intro', intro);

var intros = mongoose.model('intro');

let count = 0;
details.find({}, async(err, res) => {
    for (var k in res) {
        await getDescription(res[k])
    }
    console.log(count);
})

function takeLongTime() {
    return new Promise(resolve => {
        setTimeout(() => resolve("long_time_value"), 2000);
    });
}

async function getDescription(product) {
    if (product.detail.data.good && product.detail.data.good.intro_ext) {
        let gid = product.detail.data.iid;
        let arr = [];
        let intro = product.detail.data.good.intro_ext;
        await intros.create({ gid, intro }, () => {
            console.log(gid + 'success')
        })
    }

}

async function writeImg(url, imgName) {
    console.log(url);
    console.log(imgName);
    imgName = imgName.split('&')[0]
    await request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
        if (!error && response.statusCode == 200) {
            await fs.writeFileSync('./imgs2s/' + imgName, body, 'binary', async function(err, res) {
                if (err) { Promise.reject(imgName + 'save err'); }
                console.log(imgName + 'saved!')
            });
        } else {
            await takeLongTime()
            writeImg(url, imgName)
            Promise.reject(imgName + 'get err')
        }
    });

}

async function download(product) {
    let iid = product.detail.data.iid;
    let arr = [];
    try {
        if (!product.detail.data || !product.detail.data.good) {
            return;
        }
        if (product.detail.data.props) {
            for (let index in product.detail.data.props) {
                let element = product.detail.data.props[index];
                if (!element.img) { return }
                count++;
                let url = element.img
                let ext = url.split('.')[url.split('.').length - 1]
                let imgName = `${iid}_o${element.pid}.${ext}`;
                // await request(url).pipe(fs.createWriteStream('./imgList/' + imgName)).on('close', (err, res) => {
                //     if (err) { Promise.reject(imgName + 'err') }
                //     console.log(imgName + 'saved!')
                // });
                await writeImg(url, imgName)
                    // await request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
                    //     if (!error && response.statusCode == 200) {
                    //         await fs.writeFileSync('./imgList/' + imgName, body, 'binary', async function(err, res) {
                    //             if (err) { Promise.reject(imgName + 'err'); }
                    //             console.log(imgName + 'saved!')
                    //             Promise.resolve();
                    //         });
                    //     } else {
                    //         Promise.reject(imgName + 'err')
                    //     }
                    // });
            }
        }
        if (product.detail.data && product.detail.data.good && product.detail.data.good.album) {
            for (let index in product.detail.data.good.album) {
                let element = product.detail.data.good.album[index];
                if (!element) { return }
                count++;
                let url = element
                let ext = url.split('.')[url.split('.').length - 1]
                let imgName = `${iid}_g${index}.${ext}`;

                // await request(url).pipe(fs.createWriteStream('./imgList/' + imgName)).on('close', (err, res) => {
                //     if (err) { Promise.reject(imgName + 'err') }
                //     console.log(imgName + 'saved!')
                // });
                await writeImg(url, imgName)
                    // await takeLongTime()

                // await request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
                //     if (!error && response.statusCode == 200) {
                //         await fs.writeFileSync('./imgList/' + imgName, body, 'binary', async function(err, res) {
                //             if (err) { Promise.reject(imgName + 'err') }
                //             console.log(imgName + 'saved!')
                //             Promise.resolve();
                //         });
                //     } else {
                //         Promise.reject(imgName + 'err')
                //     }
                // });

            }
        }
        let url = product.detail.data.good['pic_url']
        let ext = url.split('.')[url.split('.').length - 1]
        let imgName = `${iid}.${ext}`;
        // await request(url).pipe(fs.createWriteStream('./imgList/' + imgName)).on('close', (err, res) => {
        //     if (err) { Promise.reject(imgName + 'err') }
        //     console.log(imgName + 'saved!')
        // });
        await writeImg(url, imgName)
            // await takeLongTime()
            // await request({ uri: url, encoding: 'binary' }, async(error, response, body) => {
            //     if (!error && response.statusCode == 200) {
            //         await fs.writeFileSync('./imgList/' + imgName, body, 'binary', async function(err, res) {
            //             if (err) { Promise.reject(imgName + 'err') }
            //             console.log(imgName + 'saved!')
            //             Promise.resolve();
            //         });
            //     } else {
            //         Promise.reject(imgName + 'err')
            //     }
            // });
        console.log(arr.length);
    } catch (error) {
        Promise.reject(error);
    }
};
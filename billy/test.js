const axios = require('axios');

(async() => {
    let data = {
        contactPerson: {
            contactId: 'pyIq6cIwQXONNdMGAXywYA',
            email: 'harry@guzzu.com',
            name: 'harry',
            _clientId: 433

        }
    };
    let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Host': 'api.billyapp.com',
        'Origin': 'https://my.billyapp.com',
        'X-Access-Token': '93926d698feb0cf2d42482f4ef30da02c7459e3a',
        'X-No-Authorization-Header': true,
    }
    axios({
        url: 'https://api.billyapp.com/v2/contactPersons',
        method: 'post',
        data: data,
        headers: headers
    }).then((res) => {
        console.log(res);
    }).catch(err => {
        console.log(err.response);
    })
})();
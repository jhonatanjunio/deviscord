const fetch = require('node-fetch');

module.exports = async (uri, callback) => {
    let res = await fetch(uri),
        ret = await res.text();
    return callback ? callback(ret) : ret;
}
const querystring = require('query-string');

// Front-end requires renamed key
function renameId(dict) {
    let obj = dict.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
}

function getQuery(url) {
    const query = querystring.parse(url.replace(/^.*\?/, ''));
    
    const sort = {};
    sort[query._sort] = query._order === 'ASC' ? 1 : -1;
    
    return {
        skip: parseInt(query._start),
        limit: parseInt(query._end - query._start),
        sort: sort
    }
}

module.exports.renameId = renameId;
module.exports.getQuery = getQuery;
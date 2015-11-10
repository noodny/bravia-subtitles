var http = require('http');
var gunzip = require('gunzip-maybe');
var PassThrough = require('stream').PassThrough;

module.exports = function(url, done) {
    var stream = new PassThrough(),
        buffer;

    http.get(url, function(res) {
        res.pipe(gunzip()).pipe(stream);

        stream.on('data', function(chunk) {
            if(!buffer) {
                buffer = new Buffer(chunk);
            } else {
                buffer = Buffer.concat([buffer, chunk]);
            }
        });

        stream.on('end', function() {
            done(buffer);
        });
    });
};
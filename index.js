#!/usr/bin/env node

var SUPPORTED_FORMATS = ['ass', 'srt', 'sub', 'txt', 'smi'];

var subtitler = require('subtitler');
var meow = require('meow');
var path = require('path');
var async = require('async');
var fs = require('fs');
var Iconv = require('iconv').Iconv;
var download = require('./download');
var strip = require('./strip');
var detect = require('./detect');

var cli = meow({
    help: [
        'Usage',
        '  bsub [options] <file>',
        '',
        'Options',
        '  --lang <lang> - specify subtitles language to search from (eng|pol|...) (defaults to eng)',
        '  --count <number> - how many of the available subtitles should be downloaded (defaults to 5)'
    ]
});

if(cli.input.length === 0) {
    console.log('Missing filename parameter');
    process.exit(0);
}

var lang = cli.flags.lang || 'pol';
var location = cli.input[0];
var file = path.basename(location);
var directory = path.resolve(path.dirname(location));

var count = cli.flags.count || 5;

var subFile = file.replace(path.extname(file), '');

subtitler.api.login()
    .then(function(token) {

        subtitler.api.searchForFile(token, lang, location)
            .then(function(results) {
                results = results.splice(0, count);

                var counter = 0;

                async.eachLimit(results, 5, function(result, done) {
                    download(result.SubDownloadLink, function(res) {
                        var iconv = new Iconv(result.SubEncoding, 'utf-8');

                        var data = iconv.convert(res).toString();
                        var format = detect(data) || result.SubFormat;

                        if(SUPPORTED_FORMATS.indexOf(format) > -1) {
                            var filename = subFile + '_' + result.SubLanguageID + '_' + (counter++) + '.' + format;

                            data = strip(data, format);

                            fs.writeFileSync(path.join(directory, filename), data, {
                                encoding: 'utf-8'
                            });
                        }

                        done();
                    });
                }, function() {
                    console.log('Downloaded ' + counter + ' subtitles.');
                    subtitler.api.logout();
                });
            });
    });

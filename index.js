#!/usr/bin/env node

var SUPPORTED_FORMATS = ['ass', 'srt', 'sub', 'txt', 'smi'];
var VIDEO_EXTENSIONS = ['mp4', 'mkv', 'avi', 'mpeg'];

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
        '  --lang <lang> - specify subtitles language to search from (eng|pol|...) (defaults to pol)',
        '  --count <number> - how many of the available subtitles should be downloaded (defaults to 5)'
    ]
});

var location;

if(cli.input.length === 0) {
    var files = fs.readdirSync(process.cwd());

    if(files && files.length) {
        for (var i = 0; i < files.length; i++) {
            if(VIDEO_EXTENSIONS.indexOf(path.extname(files[i]).replace('.', '')) > -1) {
                location = path.join(process.cwd(), files[i]);
                break;
            }
        }
    }
} else {
    location = cli.input[0];
}

if(!location) {
    console.log('Missing filename parameter and no video files found in current directory!');
    process.exit(0);
}

var lang = cli.flags.lang || 'pol';
var file = path.basename(location);
var directory = path.resolve(path.dirname(location));

var count = cli.flags.count || 5;

var subFile = file.replace(path.extname(file), '');

subtitler.api.login()
    .then(function(token) {

        subtitler.api.searchForFile(token, lang, location).then(function(results) {
            results = results.splice(0, count);

            var counter = 0;

            async.eachLimit(results, 5, function(result, done) {
                download(result.SubDownloadLink, function(res) {
                    var iconv = new Iconv(result.SubEncoding, 'utf-8');

                    var data = iconv.convert(res).toString();
                    var format = detect(data) || result.SubFormat;

                    if(SUPPORTED_FORMATS.indexOf(format) > -1) {
                        data = strip(data, format);
                        format = (format === 'sub' ? 'txt' : format);

                        var filename = subFile + '_' + result.SubLanguageID + '_' + (counter++) + '.' + format;

                        fs.writeFileSync(path.join(directory, filename), data, {
                            encoding: 'utf-8'
                        });
                    }

                    done();
                });
            }, function() {
                if(counter) {
                    console.log('Downloaded ' + counter + ' subtitles.');
                    subtitler.api.logout();
                } else {
                    subtitler.api.searchForTitle(token, lang, file).then(function(results) {
                        results = results.splice(0, count);

                        async.eachLimit(results, 5, function(result, done) {
                            download(result.SubDownloadLink, function(res) {
                                var iconv = new Iconv(result.SubEncoding, 'utf-8');

                                var data = iconv.convert(res).toString();
                                var format = detect(data) || result.SubFormat;

                                if(SUPPORTED_FORMATS.indexOf(format) > -1) {
                                    data = strip(data, format);
                                    format = (format === 'sub' ? 'txt' : format);

                                    var filename = subFile + '_' + result.SubLanguageID + '_' + (counter++) + '.' + format;

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
                }
            });
        });
    });

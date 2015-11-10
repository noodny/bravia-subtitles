module.exports = function(str, format) {
    if(format === 'sub') {
        var codes = ['y', 'f', 's', 'c', 'p'];

        codes.forEach(function(code) {
            var regexp = new RegExp('{' + code + ':[^}]*}', 'gi');
            str = str.replace(regexp, '');
        });
    }

    if(format === 'srt') {
        str = str.replace(/<[^>]*>/g, '');
        str = str.replace(/<\{[^\{]\}*>/g, '');
        str = str.replace(/X[0-9:]* X[0-9:]* Y[0-9:]* Y[0-9:]*/g, '');
    }

    return str;
};

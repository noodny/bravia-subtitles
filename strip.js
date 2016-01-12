module.exports = function(str, format) {
    if(format === 'sub') {
        var codes = ['y', 'f', 's', 'c', 'p'];

        codes.forEach(function(code) {
            var regexp = new RegExp('{' + code + ':[^}]*}', 'gi');
            str = str.replace(regexp, '');
        });

        // remove incorrectly timed lines
        var lines = str.split('\n'),
            parsed = [];

        lines.forEach(function(line) {
            var times = line.match(/\{([0-9]*)}\{([0-9]*)}/);

            if(times && times.length > 2) {
                if(times[1] !== times[2]) {
                    parsed.push(line);
                }
            } else {
                parsed.push(line);
            }
        });

        str = parsed.join('\n');
    }

    if(format === 'srt') {
        str = str.replace(/<[^>]*>/g, '');
        str = str.replace(/<\{[^\{]\}*>/g, '');
        str = str.replace(/X[0-9:]* X[0-9:]* Y[0-9:]* Y[0-9:]*/g, '');
    }

    return str;
};

module.exports = function(str, format) {
    if(format === 'sub') {
        var codes = ['y', 'f', 's', 'c', 'p'];

        codes.forEach(function(code) {
            var regexp = new RegExp('{' + code + ':[^}]*}', 'gi');
            str = str.replace(regexp, '');
        });

        // remove incorrectly timed lines
        var lines = str.split('\n'),
            parsed = [],
            previous = null;

        lines.forEach(function(line) {
            var times = line.match(/\{([0-9]*)}\{([0-9]*)}/),
                valid = true;

            if(times && times.length > 2) {
                // skip lines with no time, e.g. {0}{0}
                if(times[1] === times[2]) {
                    valid = false;
                }

                // skip lines which are out of order
                if(previous && parseInt(times[1]) <= previous) {
                    valid = false;
                }

                if(valid) {
                    previous = parseInt(times[2]);
                }
            }

            if(valid) {
                parsed.push(line);
            }
        });

        str = parsed.join('\n');
    }

    if(format === 'srt') {
        str = str.replace(/<[^>]*>/g, '');
        str = str.replace(/<\{[^\{]\}*>/g, '');
        str = str.replace(/X[0-9:]* X[0-9:]* Y[0-9:]* Y[0-9:]*/g, '');

        if(str[0] !== '\n') {
            str = '\n' + str;
        }
    }

    return str;
};

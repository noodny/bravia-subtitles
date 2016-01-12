module.exports = function(str) {
    if(str.match(/\{[0-9]*}\{[0-9]*}/)) {
        return 'sub';
    }

    if(str.match(/[0-9]*\n[0-9:,]* --> [0-9:,]*/)) {
        return 'srt';
    }

    return null;
};

# Why
My Sony Bravia KDL TV had issues when working with (polish) subtitles downloaded from opensubtitles, which were usually
encoded with `windows-1250` encoding, and had additional subrip/microDVD text formatting information. It only seemed
reasonable to write a nodejs util to make it work properly.

# Usage
```
bsub [options] <file>
```

### Available options
  - `--lang <lang>` - specify subtitles language to search from (eng|pol|...) (defaults to eng) [available languages](https://github.com/divhide/node-subtitler/blob/master/langs.dump.txt)
  - `--count <number>` - how many of the available subtitles should be downloaded (defaults to 5)

### Example
`bsub --lang pol --count 2 The.Knick.S02E01.HDTV.x264-KILLERS[ettv].mp4` will download 2 top first subtitle files matched for the file

# How it works
 - download subtitles with the neat [subtitler](https://www.npmjs.com/package/subtitler)
 - change the encoding to utf-8 with [iconv](https://www.npmjs.com/package/iconv)
 - remove all the crap which is badly handled

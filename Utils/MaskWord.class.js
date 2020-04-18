const fs = require('fs');

let buf = fs.readFileSync("list.txt").toString();
let words = buf.split('\n');

const mMap = {};
for (const i in words) {
    const word = words[i];
    mMap[word] = i;
}


class MaskWord {
    constructor() {
    }
    static Check(str) {
        if (str === "") return str;

        const len = str.length;
        // 长度从len -> 1;
        for (let i=len; i>0; --i) {
            // 起点从0 -> len-i;
            for (let j=0; j<=len-i; ++j) {
                const substr = str.substr(j, i);
                if (mMap[substr]) {
                    const prev = str.substr(0, j);
                    const curr = "*".repeat(i);
                    const next = str.substr(i+j, len-i-j);
                    return MaskWord.Check(prev) + curr + MaskWord.Check(next);
                }
            }
        }

        return str;
    }

}

module.exports = MaskWord;
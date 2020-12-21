/*
 * @Author: DuCongcong
 * @Date: 2020-11-30 15:18:21
 * @Description: 
 */
const excelColStrToNum = function(colStr) {
    let colIndex = 0;

    for (let i = 0; i < colStr.length; i += 1) {
        const index = colStr.charCodeAt(i);
        colIndex = colIndex + (index - 64);
    }

    return colIndex;
}

const excelColIndexToStr = function(colIndex) {
    if (isNaN(colIndex) || (colIndex < 1 || colIndex > 26)   ) {
        return null;
    }

    let colStr = '';

    do {
        colStr = String.fromCharCode(colIndex % 26 + 64) + colStr;
        
        if (colIndex % 26 > 0) {
            colIndex = colIndex - colIndex % 26;
        } else if (colIndex % 26 === 0) {
            colIndex = colIndex - 26;
        }

    } while (colIndex > 0);

    return colStr;
}

export default {
    excelColStrToNum,
    excelColIndexToStr
}
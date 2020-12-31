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
    if (isNaN(colIndex) || colIndex < 0 ) {
        return null;
    }

	const ordA = 'A'.charCodeAt(0);
 
	const ordZ = 'Z'.charCodeAt(0);
 
    const len = ordZ - ordA + 1;
 
    let colStr = '';
 
 
 
	while( colIndex >= 0 ) {
 
		colStr = String.fromCharCode(colIndex % len + ordA) + colStr;
 
		colIndex = Math.floor(colIndex / len) - 1;
 
	}
 
	return colStr;
}

export default {
    excelColStrToNum,
    excelColIndexToStr
}
import colTrans from './utils/colTrans';

const sheet_to_data = function (luckyExcel) {
     debugger;
     const spreadData = luckyExcel.sheets.map(sheet => {
        const merges = transMergeData(sheet);
        const tempData = parseCellData(sheet);

        return {
            merges,
            rows: tempData.tempRows,
            styles: tempData.tempStyles,
            cols: tempData.tempCols,
            name: sheet.name,
        };
    });

    return spreadData;
}

const sheet_to_config = function(luckyExcel) {
    const defaultRowLen = 100;  // 默认最大行数
    const defaultColLen = 26;   // 默认最大列数
    

    const tempRow = {};
    const tempCol = {};


    const rowArr = []; 
    const colArr = [];
    luckyExcel.sheets.forEach((sheet) => {

        sheet.celldata.forEach(item => {
            rowArr.push(item.r);
            colArr.push(item.c);
        });

        tempRow.height = sheet.defaultRowHeight;
        tempCol.width = sheet.defaultColWidth;
    })
 
    const rowMax = Math.max(...rowArr);
    const colMax = Math.max(...colArr);
  
    tempRow.len = defaultRowLen > rowMax ? defaultRowLen : rowMax;
    tempCol.len = defaultColLen > colMax ? defaultColLen : colMax;

    return {
        row: tempRow,
        col: tempCol,
    };
}



const transMergeData = function(sheet) {
    const merge = sheet.config?.merge || {};
    const tempMerges = Object.keys(merge).map((key) => {
        const item = merge[key];
        /**
        * 由于x-spreadsheet的merge字段的行和列的下标1开始，而luckyexcel读取的merge字段的行和列的下标是从0开始。
        *  同时colTrans将列的字母和下标相互转化时也从0开始。
        */
        return `${ colTrans.excelColIndexToStr(item.c) }${item.r + 1}:${ colTrans.excelColIndexToStr(item.c + item.cs - 1) }${item.r + item.rs}` 
    })
    
    return tempMerges;
}


/**
 * 将luckyexcel读取的数据格式转换为x-spreadsheet的数据格式。
 * x-spreadsheet的格式可以从data_proxy的getData()方法获取
 * @param {*} sheet 
 */
const parseCellData = function(sheet) {
    const tempRows = {};
    const tempCols = {};
    let tempStyles = {};

    const styleOpea = transStyle();

    const cellData= sheet.celldata;
    const merge = sheet.config?.merge || {};
    const columnlen = sheet.config?.columnlen || {};
    const rowlen = sheet.config?.rowlen || {};
    const borderInfo = sheet.config?.borderInfo || [];

    cellData.forEach((item) => {
        const row = tempRows[item.r] || {};
        tempRows[item.r] = row;
  
         
        /**
         * 获取行高度
         */
        if (rowlen[item.r] && !row.height) {
            row.height = rowlen[item.r];
        }

        const cells = row.cells || {};
        row.cells = cells;

        cells[item.c] = {
            text: item.v.v,
        };

        /**
         * 获取单元格合并merge属性
         */
        const mergeKey = `${item.r}_${item.c}`;
        if (mergeKey in merge) {
            const mergeData = merge[mergeKey];
            /**
             * x-spreadsheet的单元格的merge属性表示的是从单元格继续合并几个单元格；
             * 而luckyexcel单元格的merge表示的是当前单元格开始共合并了几个单元格；
             * 所以luckyexcel会比x-spreadsheet的行和列都多1。
             */
            cells[item.c].merge = [mergeData.rs - 1, mergeData.cs - 1];
        }

        /**
         * 获取style序号
         */
        const border = borderInfo.find(borderItem => {
            return borderItem.value.col_index === item.c && borderItem.value.row_index === item.r;
        })

        const styleIndx = styleOpea.getStylesIndex(item.v, border?.value);
        cells[item.c].style = styleIndx;
    
        /**
         * cols属性获取
         */
        tempCols[item.c] = { width: columnlen[item.c] };



    });

    /***
     * styles属性获取
     */
    tempStyles = styleOpea.getStyles();


    
     
    return {
        tempRows,
        tempCols,
        tempStyles,
    }
}

const transStyle = function() {
    const styles = [];
    const styleStrs = [];
    return {
        getStyles() {
            return styles;
        },
        getStylesIndex(cellStyle, borderStyle) {
            const style = this.transStyle(cellStyle, borderStyle)
            const styleStr = JSON.stringify(style);
            let styleStrIndex = styleStrs.findIndex(item => item === styleStr);
            if (styleStrIndex < 0) {
                this.setStyle(style);
            }
            styleStrIndex = styleStrs.findIndex(item => item === styleStr);
            return styleStrIndex;

        },
        setStyle(style) {
            styles.push(style);
            styleStrs.push(JSON.stringify(style));
        },
        transStyle(cellStyle, borderStyle) {
            let style = {};
           
            parseOther(style, cellStyle);
            parseFont(style, cellStyle);
            parseHorAlign(style, cellStyle);
            parseVerAlign(style, cellStyle);
            parseBorder(style, borderStyle);

            return style;
        }
    } 
}

const parseOther = function(style, cellStyle) {
    if (cellStyle.bg) {
        style.bgcolor = cellStyle.bg;
    }
}

const parseFont = function(style, cellStyle) {
    if (cellStyle.fc) {
        style.color = cellStyle.fc;
    }
    if (cellStyle.ff) {
        const font = style.font ?? {};
        style.font = font;
        font.name = cellStyle.ff;
    }
    if (cellStyle.fs) {
        const font = style.font ?? {};
        style.font = font;
        font.size = cellStyle.fs;                
    }
}

const parseHorAlign = function(style, cellStyle) {
    if (typeof cellStyle.ht !== 'undefined') {
        switch (cellStyle.ht) {
            case 0:
                style.align = 'center';
                break;
            case 1:
                style.align = 'left';
                break;
            case 2:
                style.align = 'right';
                break;                
            default:
                style.align = 'left';
                break;
        }
    }
}

const parseVerAlign = function(style, cellStyle) {
    if (typeof cellStyle.vt !== 'undefined') {
        switch (cellStyle.vt) {
            case 0:
                style.valign = 'middle';
                break;
            case 1:
                style.valign = 'top';
                break;            
            default:
                style.valign = 'middle';
                break;
        }
    } else {
        style.valign = 'bottom';
    }
}

const parseBorder = function(style, borderStyle) {
    if (!borderStyle) {
        return;
    }

    const border = {};

    const borderType = [{
        key: 'l',
        map: 'left',
    }, {
        key: 'r',
        map: 'right',
    }, {
        key: 't',
        map: 'top',
    }, {
        key: 'b',
        map: 'bottom',
    }];
 
    const borderMatch = (border) => {
        if (!border) {
            return;
        } else if (border.style === 0) {
            return;
        } else if ( border.style === 1 || border.style === 2) {
            return ['thin', border.color];
        } else if (border.style === 3 || border.style === 5 ) {
            return ['dotted', border.color];
        } else if (border.style === 4 || border.style === 12) {
            return ['dashed', border.color];
        } else if (border.style === 8 || border.style === 9 || border.style === 10 || border.style === 11) {
            return ['medium', border.color];
        } else if (border.style === 13) {
            return ['thick', border.color]; 
        } else if (border.style === 7) {
            return ['double', border.color]; 
        }
    }

    borderType.forEach(i => {
        const matchStyle = borderMatch(borderStyle[i.key]);
        if (matchStyle) {
            border[i.map] = matchStyle;
        }
    })

    if (JSON.stringify(border) !== '{}') {
        style.border = border;
    }
    
}

export default {
    sheet_to_data,
    sheet_to_config,
}
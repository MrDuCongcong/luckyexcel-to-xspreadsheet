function format(fmt, v, o) {
    if (o == null) o = {};
    var sfmt = "";
    switch (typeof fmt) {
        case "string":
            if (fmt == "m/d/yy" && o.dateNF) sfmt = o.dateNF;
            else sfmt = fmt;
            break;
        case "number":
            if (fmt == 14 && o.dateNF) sfmt = o.dateNF;
            else sfmt = (o.table != null ? (o.table) : table_fmt)[fmt];
            if (sfmt == null) sfmt = (o.table && o.table[default_map[fmt]]) || table_fmt[default_map[fmt]];
            if (sfmt == null) sfmt = default_str[fmt] || "General";
            break;
    }

    //new runze 增加万 亿 格式  
    //注："w":2万2500  "w0":2万2500  "w0.0":2万2500.2  "w0.00":2万2500.23......自定义精确度
    var reg = /^(w|W)((0?)|(0\.0+))$/;
    if(!!sfmt.match(reg)){
        if(isNaN(v)){
            return v;
        }

            //var v =300101886.436;
        var acc = sfmt.slice(1); //取得0/0.0/0.00
        var isNegative = false;
        if(!isNaN(v) && Number(v) < 0){
            isNegative = true;
            v = Math.abs(v);
        }
        var vInt = parseInt(v);
            
        var vlength = vInt.toString().length;
        if( vlength> 4){
            if(vlength > 8){
                var y =parseInt (v / 100000000);  //亿
                var w = parseInt(parseFloat(v).subtract(y*100000000) / 10000); //万
                var q = parseFloat(v).subtract(y*100000000 + w*10000); //千以后
                if(acc != ""){
                    q = numeral(q).format(acc); //处理精确度
                }
                v = y + "亿" + w + "万" + q;
            }else{
                var w = parseInt(v / 10000); //万
                var q = parseFloat(v).subtract(w*10000) //千以后
                if(acc != ""){
                    q = numeral(q).format(acc); //处理精确度
                }
                v = w + "万" + q;
            }
            

            if(v.indexOf("亿0万0") != -1){
                v = v.replace("0万0","");
            }else if(v.indexOf("亿0万") != -1){
                v = v.replace("0万","");
            }else if(v.indexOf("万0") != -1){
                v = v.replace("万0","万");
            }

            //舍弃正则后顾断言写法，旧浏览器不识别（360 V9）
            if (v.indexOf("亿") != -1 && v.indexOf("万") == -1) { //1亿/1亿111 => 1亿/1亿0111
                var afterYi = v.substring(v.indexOf("亿") + 1);
                if (afterYi.substring(0, 1) !== "." && afterYi != "") {
                    switch ((parseInt(afterYi) + "").length) {
                        case 1:
                            afterYi = "000" + afterYi;
                            break;
                        case 2:
                            afterYi = "00" + afterYi;
                            break;
                        case 3:
                            afterYi = "0" + afterYi;
                            break;
                    }
                    v = v.substring(0, v.indexOf("亿") + 1) + afterYi;
                }
            } else if (v.indexOf("亿") == -1 && v.indexOf("万") != -1) { //3万0011
                var afterWan = v.substring(v.indexOf("万") + 1);
                if (afterWan.substring(0, 1) !== "." && afterWan != "") {
                    switch ((parseInt(afterWan) + "").length) {
                        case 1:
                            afterWan = "000" + afterWan;
                            break;
                        case 2:
                            afterWan = "00" + afterWan;
                            break;
                        case 3:
                            afterWan = "0" + afterWan;
                            break;
                    }
                    v = v.substring(0, v.indexOf("万") + 1) + afterWan;
                }
            } else if (v.indexOf("亿") != -1 && v.indexOf("万") != -1) { //1亿0053万0611
                var afterYi = v.substring(v.indexOf("亿") + 1,v.indexOf("万")),
                    afterWan = v.substring(v.indexOf("万") + 1);

                switch ((parseInt(afterYi) + "").length) {
                    case 1:
                        afterYi = "000" + afterYi;
                        break;
                    case 2:
                        afterYi = "00" + afterYi;
                        break;
                    case 3:
                        afterYi = "0" + afterYi;
                        break;
                }
                v = v.substring(0, v.indexOf("亿") + 1) + afterYi + v.substring(v.indexOf("万"))
                

                if (afterWan.substring(0, 1) !== "." && afterWan != "") {
                    switch ((parseInt(afterWan) + "").length) {
                        case 1:
                            afterWan = "000" + afterWan;
                            break;
                        case 2:
                            afterWan = "00" + afterWan;
                            break;
                        case 3:
                            afterWan = "0" + afterWan;
                            break;
                    }
                    v = v.substring(0, v.indexOf("万") + 1) + afterWan
                }
            }

        }else{
            if(acc != ""){
                v = numeral(v).format(acc); //处理精确度
            }
        }
        if(isNegative){
            return '-' + v;
        }else{
            return v;
        }
        
    }


    if (isgeneral(sfmt, 0)) return general_fmt(v, o);
    if (v instanceof Date) v = datenum_local(v, o.date1904);
    var f = choose_fmt(sfmt, v);
    if (isgeneral(f[1])) return general_fmt(v, o);
    if (v === true) v = "TRUE";
    else if (v === false) v = "FALSE";
    else if (v === "" || v == null) return "";
    return eval_fmt(f[1], v, o, f[0]);
}
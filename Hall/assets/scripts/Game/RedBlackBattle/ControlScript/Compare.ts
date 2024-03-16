

export default class Compare{
    
    PaiType = {
        NONE:0,
        WL:1,//高牌
        YD:2,//1对
        ED:3,//2对
        ST:4,//三条
		SZ:5,//顺子
		TH:6,//同花
		HL:7,//葫芦
        TZ:8,//四条
        THS:9,//同花顺
		HJTHS:10,//皇家同花顺
		WT:11,//五同   //一副PK没有五同
    }

    Index = -1;
    b_obtainType = false;//是否获取其他类型

    /*获取癞子*/
    fucgetLaiZi(arrPai){
        let Laizi = [];
        for (let index = 0; index < arrPai.length; index++) {
            if(arrPai[index] == 65 || arrPai[index]  == 66) {
                Laizi.push(arrPai[index]);
            }
        }
        return Laizi;
    }


     /*获取牌值*/
	 globFucGetValue(nCardValue) {
        if(nCardValue == 0x40 || nCardValue == 0x41) {
            let Value = nCardValue & 0x0f;
            return (Value += 100) ;
        }
        return nCardValue & 0x0f;
    };

    /*获取花色*/
    globFucGetColor(nCardValue) {
        return nCardValue & 0xf0;
    };

    isSortn(arrPai){
        let len = arrPai.length;
        for (let i = 0; i < len - 1; i++) {
            if(this.globFucGetValue(arrPai[i]) < this.globFucGetValue(arrPai[i+1])){
                return false;
            }
        }
        return true;
    }

    //取类型牌
    getTypePai(arrPai,Type,same){
        let result = [];
        switch(Type){
            case this.PaiType.YD:
                result = this.getDuiZi(arrPai,same);
                return result;
                break;
            case this.PaiType.ED:
                result = this.getLiangDui(arrPai,same);
                return result;
                break;
            case this.PaiType.ST:
                result = this.getSanTiao(arrPai,same);
                return result;
                break;
            case this.PaiType.SZ:
                result = this.getShunZi(arrPai,same,false);
                return result;
                break;
            case this.PaiType.TH:
                result = this.getTongHua(arrPai,same);
                return result;
                break;
            case this.PaiType.HL:
                result = this.getHuLu(arrPai,same);
                return result;
                break;
            case this.PaiType.TZ:
                result = this.getTieZhi(arrPai,same);
                return result;
                break;
            case this.PaiType.THS:
                result = this.getShunZi(arrPai,same,true);
                return result;
                break;
            case this.PaiType.WT:
                result = this.getWuTong(arrPai,same);
                return result;
                break;

			case this.PaiType.HJTHS:
				result = this.getShunZi(arrPai,same,true) ;
				if (Math.min(...arrPai) != 10 ) {
					result = []
				}
				return result;
				break;
            default:
                return result;
        }
    }

    //对子
    getDuiZi(arrPai,bSame){
        let arrResultPai = [];
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            let arrTemp = [];
            arrTemp = this.DZdeleteType(arrPai);
            if(arrTemp){
                arrResultPai.push(arrTemp);
            }
        }
        let analyseData = this.analysePai(arrPai);
        let sanPai = analyseData.sanPai;
        let tongPai = analyseData.arrTongPai;
        let Index = 0;
        for (let i = 0; i < tongPai.length; i++) {
            let arrDuiZi = [];
            arrDuiZi.push(tongPai[i][0]);
            arrDuiZi.push(tongPai[i][1]);
            arrResultPai.push(arrDuiZi);
        }

        //如果有癞子  除开癞子和对子本身  剩下的都能组对子
         let Laizi = this.fucgetLaiZi(arrPai);
         let duizilength = 0;
         if(Laizi.length > 0) {
            for (let j = sanPai.length-1; j >=0; j--) {
                let  card = sanPai[j];

                //癞子本身不能组对子
                if(card < Laizi[0]) {
                    let arrDuiZi = [];
                    arrDuiZi.push(card);
                    arrDuiZi.push(Laizi[0]);
                    arrResultPai.push(arrDuiZi);
                    duizilength +=1; 
                }
            }
         }

        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        Index = this.Index% (tongPai.length+ duizilength);
        return arrResultPai[Index];
    }

    //对子去掉一个最大的其他类型 再取
    DZdeleteType(arrPai){
        for(let x = 10;x > 3;x--){
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let m = 0; m < 2;m++){
                let TypePai = [];
                if(m === 0){
                    TypePai = TypePai0;
                }
                else if(m === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let remainingPai = [];//剩下的牌
                    for(let i = 0;i < arrPai.length;i++){
                        let b_same = false;
                        for(let j = 0;j < TypePai.length;j++){
                            if(arrPai[i] === TypePai[j]){
                                delete TypePai[j];
                                b_same = true;
                                break;
                            }
                        }
                        if(!b_same){
                            remainingPai.push(arrPai[i]);
                        }
                    }
                    if(!remainingPai){
                        return null;
                    }
                    let analyseData = this.analysePai(remainingPai);
                    let tongPai = analyseData.arrTongPai;
                    if(tongPai.length > 0){
                        let arrDuiZi = [];
                        arrDuiZi.push(tongPai[0][0]);
                        arrDuiZi.push(tongPai[0][1]);
                        return arrDuiZi;
                    }
                }
            }
        }
        return null;
    }
    //两对
    getLiangDui(arrPai,bSame){
        let arrResultPai = [];
        let analyseData = this.analysePai(arrPai);
        let tongPai = analyseData.arrTongPai;
        let Index = 0;
        for (let i = 0; i < tongPai.length; i++) {
            let arrDuiZi = [];
            arrDuiZi.push(tongPai[i][0]);
            arrDuiZi.push(tongPai[i][1]);
            arrResultPai.push(arrDuiZi);
        }
        let Laizi = this.fucgetLaiZi(arrPai);
        let duizilength = 0;
        if(Laizi.length > 0  && tongPai.length > 0) {
            for (let j = arrPai.length-1; j >=0; j--) {
                let  card = arrPai[j];
                for (let i = 0; i < tongPai.length; i++) {
                    if(card != tongPai[i][0]  && card != tongPai[i][1] && card < Laizi[0]-1) {
                        let arrDuiZi = [];
                        arrDuiZi.push(tongPai[i][0]);
                        arrDuiZi.push(tongPai[i][1]);
                        arrResultPai.push(arrDuiZi);
                      
                        arrDuiZi = [];
                        arrDuiZi.push(card);
                        arrDuiZi.push(Laizi[0]);
                        arrResultPai.push(arrDuiZi);
                        duizilength +=2;
                    }
                }  
            }
        }

        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        Index = this.Index%(tongPai.length +  duizilength);
        return arrResultPai[Index];
    }
    //三条
    getSanTiao(arrPai,bSame){
        let arrResultPai = [];
        let Total = 0;
        let n_Index = 0;
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            let arrTemp = [];
            arrTemp = this.STdeleteType(arrPai);
            if(arrTemp){
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        let Index = this.Index;
        //癞子
        let Laizi = this.fucgetLaiZi(arrPai);
        let analyseData = this.analysePai(arrPai);
        let tongPai = analyseData.arrTongPai;
        for (let i = 0; i < tongPai.length; i++) {
            let arrSanTiao = [];
            if(tongPai[i].length === 3){
                arrSanTiao.push(tongPai[i][0]);
                arrSanTiao.push(tongPai[i][1]);
                arrSanTiao.push(tongPai[i][2]);
                arrResultPai.push(arrSanTiao);
                Total++;
            }
            else if(tongPai[i].length > 3){ //同牌大于3张 
                let TongHuaPai = this.getTongHua(arrPai,false);
                this.Index = Index;
                arrSanTiao.push(tongPai[i][0]);
                arrSanTiao.push(tongPai[i][1]);
                arrSanTiao.push(tongPai[i][2]);
                if(TongHuaPai){
                    for(let m = 0;m < TongHuaPai.length;m++){
                        for(let k = 0;k < arrSanTiao.length;k++){
                            if(TongHuaPai[m] === arrSanTiao[k]){
                                arrSanTiao[k] = tongPai[i][3];
                            }
                        }  
                    }
                }
            }
            else if(tongPai[i].length == 2  && Laizi.length >= 1){ //有一张癞子  
                arrSanTiao.push(tongPai[i][0]);
                arrSanTiao.push(tongPai[i][1]);
                arrSanTiao.push(Laizi[0]);
                arrResultPai.push(arrSanTiao);
                Total++;
            }
        }
        //有两张癞子
        if(Laizi.length == 2) {
            let sanPai = analyseData.sanPai;
            for (let i = 0; i < sanPai.length; i++) { 
                let arrSanTiao = [];
                arrSanTiao.push(sanPai[i]);
                arrSanTiao.push(Laizi[0]);
                arrSanTiao.push(Laizi[1]);
                arrResultPai.push(arrSanTiao);
                Total++;
            }
        }
    
        if(bSame){
            this.Index += 1;
        }
        else{
            this.Index = 0;
        }
     
        n_Index = this.Index%Total;
        return arrResultPai[n_Index];
    }
    //三条去掉一个最大的其他类型 再取
    STdeleteType(arrPai){
        for(let x = 10;x > 4;x--){
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let m = 0; m < 2;m++){
                let TypePai = [];
                if(m === 0){
                    TypePai = TypePai0;
                }
                else if(m === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let remainingPai = [];//剩下的牌
                    for(let i = 0;i < arrPai.length;i++){
                        let b_same = false;
                        for(let j = 0;j < TypePai.length;j++){
                            if(arrPai[i] === TypePai[j]){
                                delete TypePai[j];
                                b_same = true;
                                break;
                            }
                        }
                        if(!b_same){
                            remainingPai.push(arrPai[i]);
                        }
                    }
                    if(!remainingPai){
                        return null;
                    }
                    let analyseData = this.analysePai(remainingPai);
                    let tongPai = analyseData.arrTongPai;
                    //癞子
                    let Laizi = this.fucgetLaiZi(arrPai);

                    for (let i = 0; i < tongPai.length; i++) {
                        let arrSanTiao = [];
                        if(tongPai[i].length === 3){
                            arrSanTiao.push(tongPai[i][0]);
                            arrSanTiao.push(tongPai[i][1]);
                            arrSanTiao.push(tongPai[i][2]);
                            return arrSanTiao;
                        }
                        else if(tongPai[i].length > 3){ //同牌大于3张 
                            let TongHuaPai = this.getTongHua(arrPai,false);
                            arrSanTiao.push(tongPai[i][0]);
                            arrSanTiao.push(tongPai[i][1]);
                            arrSanTiao.push(tongPai[i][2]);
                            if(TongHuaPai){
                                for(let m = 0;m < TongHuaPai.length;m++){
                                    for(let k = 0;k < arrSanTiao.length;k++){
                                        if(TongHuaPai[m] === arrSanTiao[k]){
                                            arrSanTiao[k] = tongPai[i][3];
                                        }
                                    }  
                                }
                            }
                            return arrSanTiao;
                        }
                        else if(tongPai[i].length == 2  && Laizi.length == 1){ //有一张癞子  
                            arrSanTiao.push(tongPai[i][0]);
                            arrSanTiao.push(tongPai[i][1]);

                            arrSanTiao.push(Laizi[0]);
                            return arrSanTiao;
                        }
                        else if(tongPai[i].length == 1  && Laizi.length == 2){ //有2张癞子  
                            arrSanTiao.push(tongPai[i][0]);
                            arrSanTiao.push(Laizi[1]);
                            arrSanTiao.push(Laizi[0]);
                            return arrSanTiao;
                        }
                    }
                }
            }
        }
        return null;
    }

    //顺子
    getShunZi(arrPaiData,bSame,bTongHua){
        let arrPai = JSON.parse(JSON.stringify(arrPaiData))
        let arrResultPai = [];
        let Index = 0;
        let Total = 0;
        let arrTemp0 = [];
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            arrTemp0 = this.SZdeleteType(arrPai,bTongHua);
            if(arrTemp0){
                arrResultPai.push(arrTemp0);
                Total++;
            }
        }
        let Laizi = this.fucgetLaiZi(arrPai);
       
        if(Laizi.length > 0 ) {
             //顺子使用前先剔除癞子
            for (let i = 0; i < Laizi.length; i++) {
                let index = arrPai.indexOf(Laizi[i]);
                if(index > -1) {
                    arrPai.splice(index,1);
                }
            }
        }

        for(let i = 0;i<arrPai.length;i++){
            let arrShunZi = [];
            arrShunZi.push(arrPai[i]);    //把第一张先存进去
            //使用完整长度癞子
            let isshiyonglaizi = 0;
            for(let j = i;j < arrPai.length;j++){
                let end = 0;
                let n_pos = arrShunZi.length-1
                for (let index = arrShunZi.length-1; index >=0; index--) {
                    if(arrShunZi[index] != 65  && arrShunZi[index] != 66) {
                        end = arrShunZi[index];
                        n_pos = index;
                        break;
                    }
                }

                if(Math.abs(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(arrShunZi[n_pos])) === 1){
                    if (bTongHua) {
                        if ( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(arrPai[j])) {
                            arrShunZi.push(arrPai[j]);
                        }
                    }
                    else{
                        arrShunZi.push(arrPai[j]);
                    }
                    if(this.globFucGetValue(arrShunZi[0]) === 5 && arrShunZi.length === 4){   //12345顺子
                        for(let k = 0;k < arrPai.length;k++){
                            if(this.globFucGetValue(arrPai[k]) == 14){
                                if(bTongHua){
                                    if( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(arrPai[k])){
                                        arrShunZi.push(arrPai[k]);
                                        break;
                                    }
                                }
                                else{
                                    arrShunZi.push(arrPai[k]);
                                    break;
                                }
                            }
                        }
                    }

                    //前后都对  结束时有癞子没使用
                    if(j == arrPai.length-1  && arrShunZi.length === 4 && isshiyonglaizi < Laizi.length) {
                        arrShunZi.push(Laizi[isshiyonglaizi]);
                        isshiyonglaizi += 1;
                    }

                    if(arrShunZi.length == 5){
                        if(!arrTemp0 && arrResultPai[0] && this.globFucGetValue(arrShunZi[0]) === 5 && this.globFucGetValue(arrShunZi[4]) === 14 && this.globFucGetValue(arrResultPai[0][0]) === 14){ //第零项为10 11 12 13 1 顺子  调整12345的位置
                            let Data = arrResultPai[1];
                            arrResultPai[1] = arrShunZi;
                            arrResultPai.push(Data);
                            Total++;
                            break;
                        }
                        else if(!arrTemp0 && arrResultPai[0] && this.globFucGetValue(arrShunZi[0]) === 5 && this.globFucGetValue(arrShunZi[4]) === 14){
                            let Data = arrResultPai[0];
                            arrResultPai[0] = arrShunZi;
                            arrResultPai.push(Data);
                            Total++;
                            break;
                        }
                        arrResultPai.push(arrShunZi);

                        Total++;
                        break;
                    }
                }
                //多张癞子
                else if(Math.abs(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(arrShunZi[n_pos])) > 1 && isshiyonglaizi < Laizi.length){
                    //压入癞子
                    arrShunZi.push(Laizi[isshiyonglaizi]);
                    isshiyonglaizi += 1;

                    if(Math.abs(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(arrShunZi[n_pos])) == 2 && isshiyonglaizi < Laizi.length) {
                        arrShunZi.push(Laizi[isshiyonglaizi]);
                        isshiyonglaizi += 1;
                    }
                    
                    //癞子前后两张隔多少
                    let pos = 0;
                    for (let index = arrShunZi.length-1; index >=0; index--) {
                        if(arrShunZi[index] == 65  || arrShunZi[index] == 66) {
                            pos +=1;
                        }else{
                            break;
                        }
                    }

                    if(arrShunZi.length == 5){
                        if(!arrTemp0 && arrResultPai[0] && this.globFucGetValue(arrShunZi[0]) === 5 && this.globFucGetValue(arrShunZi[4]) === 14 && this.globFucGetValue(arrResultPai[0][0]) === 14){ //第零项为10 11 12 13 1 顺子  调整12345的位置
                            let Data = arrResultPai[1];
                            arrResultPai[1] = arrShunZi;
                            arrResultPai.push(Data);
                            Total++;
                            break;
                        }
                        else if(!arrTemp0 && arrResultPai[0] && this.globFucGetValue(arrShunZi[0]) === 5 && this.globFucGetValue(arrShunZi[4]) === 14){
                            let Data = arrResultPai[0];
                            arrResultPai[0] = arrShunZi;
                            arrResultPai.push(Data);
                            Total++;
                            break;
                        }
                        arrResultPai.push(arrShunZi);
                        Total++;
                        break;
                    }
                    //需要判断 1 2 3 4 5 顺子
                    if(Math.abs(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(end)) === ( 1+ pos)){
                        if (bTongHua) {
                            if ( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(arrPai[j])) {
                                arrShunZi.push(arrPai[j]);
                            }
                        }
                        else{
                            arrShunZi.push(arrPai[j]);
                        }
                        if(this.globFucGetValue(arrShunZi[0]) === 5 && arrShunZi.length === 4){   //12345顺子
                            for(let k = 0;k < arrPai.length;k++){
                                if(this.globFucGetValue(arrPai[k]) == 14){
                                    if(bTongHua){
                                        if( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(arrPai[k])){
                                            arrShunZi.push(arrPai[k]);
                                            break;
                                        }
                                    }
                                    else{
                                        arrShunZi.push(arrPai[k]);
                                        break;
                                    }
                                }
                            }
                        }
                        if(arrShunZi.length == 5){
                            if(!arrTemp0 && arrResultPai[0] && this.globFucGetValue(arrShunZi[0]) === 5 && this.globFucGetValue(arrShunZi[4]) === 14 && this.globFucGetValue(arrResultPai[0][0]) === 14){ //第零项为10 11 12 13 1 顺子  调整12345的位置
                                let Data = arrResultPai[1];
                                arrResultPai[1] = arrShunZi;
                                arrResultPai.push(Data);
                                Total++;
                                break;
                            }
                            else if(!arrTemp0 && arrResultPai[0] && this.globFucGetValue(arrShunZi[0]) === 5 && this.globFucGetValue(arrShunZi[4]) === 14){
                                let Data = arrResultPai[0];
                                arrResultPai[0] = arrShunZi;
                                arrResultPai.push(Data);
                                Total++;
                                break;
                            }
                            arrResultPai.push(arrShunZi);
                            Total++;
                            break;
                        }
                    }
                }
                //癞子结尾 
                else if(Math.abs(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(arrShunZi[n_pos])) != 1 && isshiyonglaizi < Laizi.length  && j == arrPai.length-1){
                    //碰上循环结束
                    if(arrShunZi.length == 4 ) {
                        arrShunZi.push(Laizi[isshiyonglaizi]);
                        isshiyonglaizi += 1;
                        arrResultPai.push(arrShunZi);
                        Total++;
                        break;
                    }
                }

                 //癞子5结束的 1 2 3 4 5
                if(j == arrPai.length-1  && this.globFucGetValue(arrShunZi[0]) === 4  && isshiyonglaizi < Laizi.length) {

                    for(let k = 0;k < arrPai.length;k++){
                        if(this.globFucGetValue(arrPai[k]) == 14){
                            if(bTongHua){
                                if( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(arrPai[k])){
                                    arrShunZi.push(arrPai[k]);
                                    break;
                                }
                            }
                            else{
                                arrShunZi.push(arrPai[k]);
                                break;
                            }
                        }
                    }
                    arrShunZi.push(Laizi[isshiyonglaizi]);
                    isshiyonglaizi += 1;
                    if(arrShunZi.length == 5){
                        arrResultPai.push(arrShunZi);
                        Total++;
                    }
                    break;
                }
                if(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(arrShunZi[n_pos])> 1  && Laizi.length  == 0 ){
                    arrShunZi = [];
                    break;
                }else if(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(arrShunZi[n_pos]) > Laizi.length  ){   //n_pos
                    let end = 0;
                    for (let index = arrShunZi.length-1; index >=0; index--) {
                        if(arrShunZi[index] != 65  && arrShunZi[index] != 66) {
                            end = arrShunZi[index];
                            break;
                        }
                    }
                     //癞子前后两张隔多少
                     let pos = 0;
                     for (let index = arrShunZi.length-1; index >=0; index--) {
                         if(arrShunZi[index] == 65  || arrShunZi[index] == 66) {
                             pos +=1;
                         }else{
                             break;
                         }
                     }
                    if(Math.abs(this.globFucGetValue(arrPai[j]) - this.globFucGetValue(end)) != ( 1+ pos)){
                        arrShunZi = [];
                        break;
                    }
                }
            }
        }
        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        Index = this.Index%Total;

        return arrResultPai[Index];
    }
    //顺子去掉一个最大的其他类型 再取
    SZdeleteType(arrPai,bTongHua){
        for(let x = 10;x > 3;x--){
            if(bTongHua){
                if(x === 9){
                    continue;
                }
            }
            else if(!bTongHua){
                if(x === 5){
                    continue;
                }
            }
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let m = 0; m < 2;m++){
                let TypePai = [];
                if(m === 0){
                    TypePai = TypePai0;
                }
                else if(m === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let arrTemp = this.getSZ(arrPai,TypePai,bTongHua);
                    if(arrTemp){
                        return arrTemp;
                    }
                }
            }
        }   
        return null;
    }
    getSZ(arrPai,TypePai,bTongHua){ //剩餘牌取順子
        let remainingPai = [];//剩下的牌
        for(let i = 0;i < arrPai.length;i++){
            let b_same = false;
            for(let j = 0;j < TypePai.length;j++){
                if(arrPai[i] === TypePai[j]){
                    delete TypePai[j];
                    b_same = true;
                    break;
                }
            }
            if(!b_same){
                remainingPai.push(arrPai[i]);
            }
        }
        if(!remainingPai){
            return null;
        }

        let Laizi = this.fucgetLaiZi(arrPai);

        for(let i = 0;i<remainingPai.length;i++){
            let arrShunZi = [];
            arrShunZi.push(remainingPai[i]);    //把第一张先存进去
            //使用完整长度癞子
            let isshiyonglaizi = 0;
            for(let j = i;j < remainingPai.length;j++){
                let end = 0;
                let n_pos = arrShunZi.length-1
                for (let index = arrShunZi.length-1; index >=0; index--) {
                    if(arrShunZi[index] != 65  && arrShunZi[index] != 66) {
                        end = arrShunZi[index];
                        n_pos = index;
                        break;
                    }
                }

                if(Math.abs(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(arrShunZi[n_pos])) === 1){
                    if (bTongHua) {
                        if ( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(remainingPai[j])) {
                            arrShunZi.push(remainingPai[j]);
                        }
                    }
                    else{
                        arrShunZi.push(remainingPai[j]);
                    }
                    if(this.globFucGetValue(arrShunZi[0]) === 5 && arrShunZi.length === 4){   //12345顺子
                        for(let k = 0;k < remainingPai.length;k++){
                            if(this.globFucGetValue(remainingPai[k]) == 14){
                                if(bTongHua){
                                    if( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(remainingPai[k])){
                                        arrShunZi.push(remainingPai[k]);
                                        break;
                                    }
                                }
                                else{
                                    arrShunZi.push(remainingPai[k]);
                                    break;
                                }
                            }
                        }
                    }
                    //前后都对  结束时有癞子没使用
                    if(j == remainingPai.length-1  && arrShunZi.length === 4 && isshiyonglaizi < Laizi.length) {
                        arrShunZi.push(Laizi[isshiyonglaizi]);
                        isshiyonglaizi += 1;
                    }
                    if(arrShunZi.length == 5){
                        return arrShunZi;
                    }
                }
                else if(Math.abs(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(arrShunZi[arrShunZi.length-1])) > 1 && isshiyonglaizi < Laizi.length){
                    //压入癞子
                    arrShunZi.push(Laizi[isshiyonglaizi]);
                    isshiyonglaizi += 1;
                    //癞子前后两张隔多少
                    let pos = 0;
                    for (let index = arrShunZi.length-1; index >=0; index--) {
                        if(arrShunZi[index] == 65  || arrShunZi[index] == 66) {
                            pos +=1;
                        }else{
                            break;
                        }
                    }
                    if(arrShunZi.length == 5){
                        return arrShunZi;
                    }
                    //需要判断 1 2 3 4 5 顺子
                    if(Math.abs(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(end)) === ( 1+ pos)){
                        if (bTongHua) {
                            if ( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(remainingPai[j])) {
                                arrShunZi.push(remainingPai[j]);
                            }
                        }
                        else{
                            arrShunZi.push(remainingPai[j]);
                        }
                        if(this.globFucGetValue(arrShunZi[0]) === 5 && arrShunZi.length === 4){   //12345顺子
                            for(let k = 0;k < remainingPai.length;k++){
                                if(this.globFucGetValue(remainingPai[k]) == 14){
                                    if(bTongHua){
                                        if( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(remainingPai[k])){
                                            arrShunZi.push(remainingPai[k]);
                                            break;
                                        }
                                    }
                                    else{
                                        arrShunZi.push(remainingPai[k]);
                                        break;
                                    }
                                }
                            }
                        }
                        if(arrShunZi.length == 5){
                            return arrShunZi;
                        }
                    }
                }
                //癞子结尾 
                else if(Math.abs(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(arrShunZi[arrShunZi.length-1])) != 1 && isshiyonglaizi < Laizi.length  && j == remainingPai.length-1){
                    //碰上循环结束
                    if(arrShunZi.length == 4 ) {
                        arrShunZi.push(Laizi[isshiyonglaizi]);
                        isshiyonglaizi += 1;
                        return arrShunZi;
                    }
                }
                 //癞子5结束的 1 2 3 4 5
                if(j == remainingPai.length-1  && this.globFucGetValue(arrShunZi[0]) === 4  && isshiyonglaizi < Laizi.length) {
                    for(let k = 0;k < remainingPai.length;k++){
                        if(this.globFucGetValue(remainingPai[k]) == 14){
                            if(bTongHua){
                                if( this.globFucGetColor(arrShunZi[0]) ===  this.globFucGetColor(remainingPai[k])){
                                    arrShunZi.push(remainingPai[k]);
                                    break;
                                }
                            }
                            else{
                                arrShunZi.push(remainingPai[k]);
                                break;
                            }
                        }
                        
                    }
                    arrShunZi.push(Laizi[isshiyonglaizi]);
                    isshiyonglaizi += 1;
                    if(arrShunZi.length == 5){
                        return arrShunZi;
                    }
                    break;
                }
                if(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(arrShunZi[arrShunZi.length-1])> 1  && Laizi.length  == 0 ){
                    arrShunZi = [];
                    break;
                }else if(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(arrShunZi[n_pos]) > Laizi.length  ){
                    let end = 0;
                    for (let index = arrShunZi.length-1; index >=0; index--) {
                        if(arrShunZi[index] != 65  && arrShunZi[index] != 66) {
                            end = arrShunZi[index];
                            break;
                        }
                    }
                     //癞子前后两张隔多少
                     let pos = 0;
                     for (let index = arrShunZi.length-1; index >=0; index--) {
                         if(arrShunZi[index] == 65  || arrShunZi[index] == 66) {
                             pos +=1;
                         }else{
                             break;
                         }
                     }
                    if(Math.abs(this.globFucGetValue(remainingPai[j]) - this.globFucGetValue(end)) != ( 1+ pos)){
                        arrShunZi = [];
                        break;
                    }
                }
            }
        }
    }

    //同花
    getTongHua(arrPai,bSame){
        let arrResultPai = [];
        let Index = 0;
        let Total = 0;
        let len = arrPai.length;
        let arrHeitao = [];
        let arrHongtao = [];
        let arrMeihua = [];
        let arrFangkuai = [];
        let arrTemp0 = [];
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            arrTemp0 = this.THdeleteType(arrPai);
            if(arrTemp0){
                arrResultPai.push(arrTemp0);
                Total++;
            }
        }
        let TonghuaLength = 4;
        let Laizi = this.fucgetLaiZi(arrPai);
        let ArrayLength = 5;  //同花长度
        for(let i = 0; i < len; i++){
            if( this.globFucGetColor(arrPai[i]) === 48){
                arrHeitao.push(arrPai[i]);
            }
            if( this.globFucGetColor(arrPai[i]) === 32){
                arrHongtao.push(arrPai[i]);
            }
            if( this.globFucGetColor(arrPai[i]) === 16){
                arrMeihua.push(arrPai[i]);
            }
            if( this.globFucGetColor(arrPai[i]) === 0){
                arrFangkuai.push(arrPai[i]);
            }
        }
        if(Laizi.length > 0)  {
            for (let index = 0; index < Laizi.length; index++) {
                let card = Laizi[index];
                arrHeitao.push(card);
                arrHongtao.push(card);
                arrMeihua.push(card);
                arrFangkuai.push(card); 
            }
        }
        if(arrHeitao.length > TonghuaLength){
            for(let i = 0;i < arrHeitao.length - TonghuaLength;i++){
                let arrTemp = [];
                for(let j = 0;j<ArrayLength;j++){
                    arrTemp.push(arrHeitao[j + i]);
                }
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        if(arrHongtao.length > TonghuaLength){
            for(let i = 0;i < arrHongtao.length - TonghuaLength;i++){
                let arrTemp = [];
                for(let j = 0;j<ArrayLength;j++){
                    arrTemp.push(arrHongtao[j + i]);
                }
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        if(arrMeihua.length > TonghuaLength){
            for(let i = 0;i < arrMeihua.length - TonghuaLength;i++){
                let arrTemp = [];
                for(let j = 0;j<ArrayLength;j++){
                    arrTemp.push(arrMeihua[j + i]);
                }
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        if(arrFangkuai.length > TonghuaLength){
            for(let i = 0;i < arrFangkuai.length - TonghuaLength;i++){
                let arrTemp = [];
                for(let j = 0;j<ArrayLength;j++){
                    arrTemp.push(arrFangkuai[j + i]);
                }
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        Index = this.Index%Total;
        if(!arrTemp0 && arrResultPai.length > 1){
            for(let x = 1;x < arrResultPai.length;x++){  //同花最大牌一样
                for(let y = 0;y < arrResultPai[0].length;y++){ 
                    if(this.globFucGetValue(arrResultPai[0][y]) > this.globFucGetValue(arrResultPai[x][y])){
                        break;
                    }
                    else if(this.globFucGetValue(arrResultPai[0][y]) < this.globFucGetValue(arrResultPai[x][y])){
                        let head = arrResultPai[x];
                        arrResultPai[x] = arrResultPai[0];
                        arrResultPai[0] = head;
                        break;
                    }
                }
            }
        }
        return arrResultPai[Index];
    }

    //同花去掉一个最大的其他类型 再取
    THdeleteType(arrPai){
        for(let x = 10;x > 3;x--){
            if(x === 6){
                continue;
            }
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let m = 0; m < 2;m++){
                let TypePai = [];
                if(m === 0){
                    TypePai = TypePai0;
                }
                else if(m === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let arrTemp = this.getTH(arrPai,TypePai);
                    if(arrTemp){
                        return arrTemp;
                    }
                }
            }
        }
        return null;
    }
    getTH(arrPai,TypePai){ //剩餘牌取同花
        let remainingPai = [];//剩下的牌
        for(let i = 0;i < arrPai.length;i++){
            let b_same = false;
            for(let j = 0;j < TypePai.length;j++){
                if(arrPai[i] === TypePai[j]){
                    delete TypePai[j];
                    b_same = true;
                    break;
                }
            }
            if(!b_same){
                remainingPai.push(arrPai[i]);
            }
        }
        if(!remainingPai){
            return null;
        }
        let len = remainingPai.length;
        let arrHeitao = [];
        let arrHongtao = [];
        let arrMeihua = [];
        let arrFangkuai = [];
        for(let i = 0; i < len; i++){
            if( this.globFucGetColor(remainingPai[i]) === 48){
                arrHeitao.push(remainingPai[i]);
            }
            if( this.globFucGetColor(remainingPai[i]) === 32){
                arrHongtao.push(remainingPai[i]);
            }
            if( this.globFucGetColor(remainingPai[i]) === 16){
                arrMeihua.push(remainingPai[i]);
            }
            if( this.globFucGetColor(remainingPai[i]) === 0){
                arrFangkuai.push(remainingPai[i]);
            }
        }
        if(arrHeitao.length > 4){
            for(let i = 0;i < arrHeitao.length - 4;i++){
                let arrTemp = [];
                for(let j = 0;j<5;j++){
                    arrTemp.push(arrHeitao[j + i]);
                }
                return arrTemp;
            }
        }
        if(arrHongtao.length > 4){
            for(let i = 0;i < arrHongtao.length - 4;i++){
                let arrTemp = [];
                for(let j = 0;j<5;j++){
                    arrTemp.push(arrHongtao[j + i]);
                }
                return arrTemp;
            }
        }
        if(arrMeihua.length > 4){
            for(let i = 0;i < arrMeihua.length - 4;i++){
                let arrTemp = [];
                for(let j = 0;j<5;j++){
                    arrTemp.push(arrMeihua[j + i]);
                }
                return arrTemp;
            }
        }
        if(arrFangkuai.length > 4){
            for(let i = 0;i < arrFangkuai.length - 4;i++){
                let arrTemp = [];
                for(let j = 0;j<5;j++){
                    arrTemp.push(arrFangkuai[j + i]);
                }
                return arrTemp;
            }
        }
    }

        //葫芦
    getHuLu(arrPai,bSame){
        let arrResultPai = [];
        let analyseData = this.analysePai(arrPai);
        let arrTongPai = analyseData.arrTongPai;
        let sanPai = analyseData.sanPai;
        let Index = 0;
        let Total = 0;
        let arrHuLu = [];

       let n_Index =  this.Index;
        //癞子
        let Laizi = this.fucgetLaiZi(arrPai);

        for(let i = 0; i < arrTongPai.length; i++){
            if(arrTongPai[i].length === 3){     //不带癞子
                for(let j = 0; j < arrTongPai.length; j++){
                    if(i === j){
                        continue;
                    }
                    arrHuLu.push(arrTongPai[i][0]);
                    arrHuLu.push(arrTongPai[i][1]);
                    arrHuLu.push(arrTongPai[i][2]);
                    if(arrTongPai[j].length > 1){
                        if(arrTongPai[j].length === 3){
                            j++;
                            if(!arrTongPai[j]){
                                j--;
                            }
                            if(i === j && arrTongPai[j+1]){
                                j++;
                            }
                            else if(i === j && !arrTongPai[j+1]){
                                j--;
                            }
                        }
                        arrHuLu.push(arrTongPai[j][0]);
                        arrHuLu.push(arrTongPai[j][1]);
                        arrResultPai.push(arrHuLu);
                        Total++;
                    }
                    arrHuLu = [];
                }
                //有癞子
                if(Laizi.length > 0) {    //带癞子
                    for (let index = 0; index < sanPai.length; index++) {
                        for(let j = 0; j < arrTongPai.length; j++){
                            if(i === j){
                                continue;
                            }
                            arrHuLu.push(arrTongPai[i][0]);
                            arrHuLu.push(arrTongPai[i][1]);
                            arrHuLu.push(arrTongPai[i][2]);

                            let n_sanpai = sanPai[index];
                            arrHuLu.push(n_sanpai);
                            arrHuLu.push(Laizi[0]);
                            arrResultPai.push(arrHuLu);
                            Total++;
                        }
                        arrHuLu = [];
                    }
                }
            }
            else if(arrTongPai[i].length > 3){ //同牌大于3张 
                for(let j = 0; j < arrTongPai.length; j++){
                    if(i === j){
                        continue;
                    }
                    let TongHuaPai = this.getTongHua(arrPai,false);
                    this.Index = n_Index;
                    arrHuLu.push(arrTongPai[i][0]);
                    arrHuLu.push(arrTongPai[i][1]);
                    arrHuLu.push(arrTongPai[i][2]);
                    if(TongHuaPai){
                        for(let m = 0;m < TongHuaPai.length;m++){
                            for(let k = 0;k < arrHuLu.length;k++){
                                if(TongHuaPai[m] === arrHuLu[k]){
                                    arrHuLu[k] = arrTongPai[i][3];
                                }
                            }                   
                        }
                    }
                    if(arrTongPai[j].length > 1){
                        arrHuLu.push(arrTongPai[j][0]);
                        arrHuLu.push(arrTongPai[j][1]);
                        arrResultPai.push(arrHuLu);
                        Total++;
                    }
                    arrHuLu = [];
                }
            }
            else if(arrTongPai[i].length >= 2 && Laizi.length > 0  && arrTongPai.length > 1){ //同牌大于2张   加入癞子
                for(let j = 0; j < arrTongPai.length; j++){
                    if(i === j){
                        continue;
                    }
                    arrHuLu.push(arrTongPai[i][0]);
                    arrHuLu.push(arrTongPai[i][1]);
                    arrHuLu.push(Laizi[0]);
                    if(arrTongPai[j].length > 1 ){
                        arrHuLu.push(arrTongPai[j][0]);
                        arrHuLu.push(arrTongPai[j][1]);
                        arrResultPai.push(arrHuLu);
                        Total++;
                    }
                    arrHuLu = [];
                }
                //有两个癞子
                if(Laizi.length > 1) {
                    for (let index = 0; index < sanPai.length; index++) {
                        if(sanPai[index] < 65) {
                            arrHuLu.push(arrTongPai[i][0]);
                            arrHuLu.push(arrTongPai[i][1]);
                            arrHuLu.push(Laizi[0]);      
                            arrHuLu.push(sanPai[index]);
                            arrHuLu.push(Laizi[1]);
                            arrResultPai.push(arrHuLu);
                            Total++;  
                            arrHuLu = [];
                        }
                    }
                }
            }
        }
        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            arrResultPai = this.HLAdjust(arrPai,arrResultPai);
            this.Index = 0;
        }
        Index = this.Index%Total;
        return arrResultPai[Index];
    }
    //葫芦调整位置
    HLAdjust(arrPai,arrResultPai){
            for(let x = 10;x > 3;x--){
                if(x === 7){
                    continue;
                }
                for(let a = 0;a < arrResultPai.length;a++){
                    let remainingPai = [];// 去掉一个葫芦 剩下的牌
                    for(let i = 0;i < arrPai.length;i++){
                        let b_same = false;
                        for(let j = 0;j < arrResultPai[a].length;j++){
                            if(arrPai[i] === arrResultPai[a][j]){
                                b_same = true;
                                break;
                            }
                        }
                        if(!b_same){
                            remainingPai.push(arrPai[i]);
                        }
                    }
                    if(!remainingPai){
                        return null;
                    }         
                    let TypePai0 = this.getTypePai(remainingPai,x,false);
                    let TypePai1 = this.getTypePai(remainingPai,x,true);
                    for(let P = 0; P < 2;P++){
                        let TypePai = [];
                        if(P === 0){
                            TypePai = TypePai0;
                        }
                        else if(P === 1){
                            TypePai = TypePai1;
                        }
                        if(TypePai){
                            let data = arrResultPai[0];
                            arrResultPai[0] = arrResultPai[a];
                            arrResultPai[a] = data;
                            return arrResultPai;
                        }
                    }
                }
            }
            return arrResultPai;
    }

    //葫芦去掉一个最大的其他类型 再取
    HLdeleteType(arrPai){
        for(let x = 10;x > 4;x--){
            if(x === 7){
                continue;
            }
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let P = 0; P < 2;P++){
                let TypePai = [];
                if(P === 0){
                    TypePai = TypePai0;
                }
                else if(P === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let remainingPai = [];//剩下的牌
                    for(let i = 0;i < arrPai.length;i++){
                        let b_same = false;
                        for(let j = 0;j < TypePai.length;j++){
                            if(arrPai[i] === TypePai[j]){
                                delete TypePai[j];
                                b_same = true;
                                break;
                            }
                        }
                        if(!b_same){
                            remainingPai.push(arrPai[i]);
                        }
                    }
                    if(!remainingPai){
                        return null;
                    }
                    let analyseData = this.analysePai(remainingPai);
                    let arrTongPai = analyseData.arrTongPai;
                    let arrHuLu = [];
                    for(let i = 0; i < arrTongPai.length; i++){
                        if(arrTongPai[i].length === 3){
                            for(let j = 0; j < arrTongPai.length; j++){
                                if(i === j){
                                    continue;
                                }
                                arrHuLu.push(arrTongPai[i][0]);
                                arrHuLu.push(arrTongPai[i][1]);
                                arrHuLu.push(arrTongPai[i][2]);
                                if(arrTongPai[j].length > 1){
                                    arrHuLu.push(arrTongPai[j][0]);
                                    arrHuLu.push(arrTongPai[j][1]);
                                    return arrHuLu;
                                }
                                arrHuLu = [];
                            }
                        }
                        else if(arrTongPai[i].length > 3){ //同牌大于3张 
                            for(let j = 0; j < arrTongPai.length; j++){
                                if(i === j){
                                    continue;
                                }
                                let TongHuaPai = this.getTongHua(arrPai,false);
                                arrHuLu.push(arrTongPai[i][0]);
                                arrHuLu.push(arrTongPai[i][1]);
                                arrHuLu.push(arrTongPai[i][2]);
                                if(TongHuaPai){
                                    for(let m = 0;m < TongHuaPai.length;m++){
                                        for(let k = 0;k < arrHuLu.length;k++){
                                            if(TongHuaPai[m] === arrHuLu[k]){
                                                arrHuLu[k] = arrTongPai[i][3];
                                            }
                                        }                   
                                    }
                                }
                                if(arrTongPai[j].length > 1){
                                    arrHuLu.push(arrTongPai[j][0]);
                                    arrHuLu.push(arrTongPai[j][1]);
                                    return arrHuLu;
                                }
                                arrHuLu = [];
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    //铁支
    getTieZhi(arrPai,bSame){
        let arrResultPai = [];
        let Index = 0;
        let Total = 0;
        let arrTieZhi = [];
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            let arrTemp = [];
            arrTemp = this.TZdeleteType(arrPai);
            if(arrTemp){
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        //癞子
        let Laizi = this.fucgetLaiZi(arrPai);
        let analyseData = this.analysePai(arrPai);
        let arrTongPai = analyseData.arrTongPai;
        for(let i = 0; i < arrTongPai.length; i++){
            if(arrTongPai[i].length === 4){
                arrTieZhi.push(arrTongPai[i][0]);
                arrTieZhi.push(arrTongPai[i][1]);
                arrTieZhi.push(arrTongPai[i][2]);
                arrTieZhi.push(arrTongPai[i][3]);
                arrResultPai.push(arrTieZhi);
                Total++;
                arrTieZhi = [];
            }

            //有一个癞子
            if(arrTongPai[i].length === 3 && Laizi.length == 1){
                arrTieZhi.push(arrTongPai[i][0]);
                arrTieZhi.push(arrTongPai[i][1]);
                arrTieZhi.push(arrTongPai[i][2]);
                arrTieZhi.push(Laizi[0]);
                arrResultPai.push(arrTieZhi);
                Total++;
                arrTieZhi = [];
            }
            //有2个癞子
            if(arrTongPai[i].length === 2 && Laizi.length == 2){
                arrTieZhi.push(arrTongPai[i][0]);
                arrTieZhi.push(arrTongPai[i][1]);
                arrTieZhi.push(Laizi[0]);
                arrTieZhi.push(Laizi[1]);
                arrResultPai.push(arrTieZhi);
                Total++;
                arrTieZhi = [];
            }
        }
        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        Index = this.Index%Total;
        return arrResultPai[Index];
    }
    //铁支去掉一个最大的其他类型 再取
    TZdeleteType(arrPai){
        for(let x = 10;x > 3;x--){
            if(x === 8){
                continue;
            }
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let m = 0; m < 2;m++){
                let TypePai = [];
                if(m === 0){
                    TypePai = TypePai0;
                }
                else if(m === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let remainingPai = [];//剩下的牌
                    for(let i = 0;i < arrPai.length;i++){
                        let b_same = false;
                        for(let j = 0;j < TypePai.length;j++){
                            if(arrPai[i] === TypePai[j]){
                                delete TypePai[j];
                                b_same = true;
                                break;
                            }
                        }
                        if(!b_same){
                            remainingPai.push(arrPai[i]);
                        }
                    }
                    if(!remainingPai){
                        return null;
                    }
                    let analyseData = this.analysePai(remainingPai);
                    let arrTongPai = analyseData.arrTongPai;
                    let arrTieZhi = [];
                    //癞子
                    let Laizi = this.fucgetLaiZi(arrPai);
                    for(let i = 0; i < arrTongPai.length; i++){
                        if(arrTongPai[i].length === 4){
                            arrTieZhi.push(arrTongPai[i][0]);
                            arrTieZhi.push(arrTongPai[i][1]);
                            arrTieZhi.push(arrTongPai[i][2]);
                            arrTieZhi.push(arrTongPai[i][3]);
                            return arrTieZhi;
                        }
                         //有一个癞子
                        if(arrTongPai[i].length === 3 && Laizi.length == 1){
                            arrTieZhi.push(arrTongPai[i][0]);
                            arrTieZhi.push(arrTongPai[i][1]);
                            arrTieZhi.push(arrTongPai[i][2]);
                            arrTieZhi.push(Laizi[0]);
                            return arrTieZhi;
                        }
                        //有2个癞子
                        if(arrTongPai[i].length === 2 && Laizi.length == 2){
                            arrTieZhi.push(arrTongPai[i][0]);
                            arrTieZhi.push(arrTongPai[i][1]);
                            arrTieZhi.push(Laizi[0]);
                            arrTieZhi.push(Laizi[1]);
                            return arrTieZhi;
                        }
                    }
                }
            }
        }
        return null;
    }

    //五同
    getWuTong (arrPai,bSame){
        let Index = 0;
        let Total = 0;
        let arrWuTong = [];
        let arrResultPai = [];
        if(this.b_obtainType){  //需要取其他类型
            this.b_obtainType = false;
            let arrTemp = [];
            arrTemp = this.WTdeleteType(arrPai);
            if(arrTemp){
                arrResultPai.push(arrTemp);
                Total++;
            }
        }
        let analyseData = this.analysePai(arrPai);
        let arrTongPai = analyseData.arrTongPai;

         //癞子
        let Laizi = this.fucgetLaiZi(arrPai);

        for(let i = 0; i < arrTongPai.length; i++){
            if(arrTongPai[i].length === 5){
                arrWuTong.push(arrTongPai[i][0]);
                arrWuTong.push(arrTongPai[i][1]);
                arrWuTong.push(arrTongPai[i][2]);
                arrWuTong.push(arrTongPai[i][3]);
                arrWuTong.push(arrTongPai[i][4]);
                arrResultPai.push(arrWuTong);
                Total++;
                arrWuTong = [];
            }
             //有一个癞子
             if(arrTongPai[i].length === 4 && Laizi.length >= 1){
                arrWuTong.push(arrTongPai[i][0]);
                arrWuTong.push(arrTongPai[i][1]);
                arrWuTong.push(arrTongPai[i][2]);
                arrWuTong.push(arrTongPai[i][3]);
                arrWuTong.push(Laizi[0]);
                arrResultPai.push(arrWuTong);
                Total++;
                arrWuTong = [];
            }
            //有2个癞子
            if(arrTongPai[i].length === 3 && Laizi.length == 2){
                arrWuTong.push(arrTongPai[i][0]);
                arrWuTong.push(arrTongPai[i][1]);
                arrWuTong.push(arrTongPai[i][2]);
                arrWuTong.push(Laizi[0]);
                arrWuTong.push(Laizi[1]);
                arrResultPai.push(arrWuTong);
                Total++;
                arrWuTong = [];
            }
        }
        if(bSame){
            this.Index++;
        }
        else{
            this.Index = 0;
        }
        Index = this.Index%Total;
        return arrResultPai[Index];
    }
    //五同去掉一个最大的其他类型 再取
    WTdeleteType(arrPai){
        for(let x = 10;x > 3;x--){
            if(x === 10){
                continue;
            }
            let TypePai0 = this.getTypePai(arrPai,x,false);
            let TypePai1 = this.getTypePai(arrPai,x,true);
            for(let m = 0; m < 2;m++){
                let TypePai = [];
                if(m === 0){
                    TypePai = TypePai0;
                }
                else if(m === 1){
                    TypePai = TypePai1;
                }
                if(TypePai){
                    let remainingPai = [];//剩下的牌
                    for(let i = 0;i < arrPai.length;i++){
                        let b_same = false;
                        for(let j = 0;j < TypePai.length;j++){
                            if(arrPai[i] === TypePai[j]){
                                delete TypePai[j];
                                b_same = true;
                                break;
                            }
                        }
                        if(!b_same){
                            remainingPai.push(arrPai[i]);
                        }
                    }
                    if(!remainingPai){
                        return null;
                    }
                    let analyseData = this.analysePai(remainingPai);
                    let arrTongPai = analyseData.arrTongPai;
                    let arrWuTong = [];
                    //癞子
                    let Laizi = this.fucgetLaiZi(arrPai);
                    for(let i = 0; i < arrTongPai.length; i++){
                        if(arrTongPai[i].length === 5){
                            arrWuTong.push(arrTongPai[i][0]);
                            arrWuTong.push(arrTongPai[i][1]);
                            arrWuTong.push(arrTongPai[i][2]);
                            arrWuTong.push(arrTongPai[i][3]);
                            arrWuTong.push(arrTongPai[i][4]);
                            return arrWuTong;
                        }
                         //有1个癞子
                         if(arrTongPai[i].length === 4 && Laizi.length == 1){
                            arrWuTong.push(arrTongPai[i][0]);
                            arrWuTong.push(arrTongPai[i][1]);
                            arrWuTong.push(arrTongPai[i][2]);
                            arrWuTong.push(arrTongPai[i][3]);
                            arrWuTong.push(Laizi[0]);
                            return arrWuTong;
                        }

                        //有2个癞子
                        if(arrTongPai[i].length === 3 && Laizi.length == 2){
                            arrWuTong.push(arrTongPai[i][0]);
                            arrWuTong.push(arrTongPai[i][1]);
                            arrWuTong.push(arrTongPai[i][2]);
                            arrWuTong.push(Laizi[0]);
                            arrWuTong.push(Laizi[1]);
                            return arrWuTong;
                        }
                    }
                }
            }
        }
        return null;
    }

    //获取牌类型

	//需要改变值
	
	 //  2  3  4  5  6  7  8  9  10  j  Q   K  A
	 //   1  2  3  4  5  6  7  8  9  10  J  Q   K

	//  2    3    4     5     6    7    8   9   10    J    Q    K    A 
	Puker = [0,
	  0x0E,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,  //方片
	  0x1E,0x12,0x13,0x14,0x15,0x16,0x17,0x18,0x19,0x1A,0x1B,0x1C,0x1D,  //梅花
	  0x2E,0x22,0x23,0x24,0x25,0x26,0x27,0x28,0x29,0x2A,0x2B,0x2C,0x2D,  //红桃
	  0x3E,0x32,0x33,0x34,0x35,0x36,0x37,0x38,0x39,0x3A,0x3B,0x3C,0x3D,  //黑桃
	  0x41,0x42  
	]//大小王  

	//1-52的牌
    getType (arrPaiData){
		let arrPai = []
		//1-52 阿拉伯数字扑克进行16进制PK转换
		for (let index = 0; index < arrPaiData.length; index++) {
			let  element = arrPaiData[index];
			arrPai[index] = this.Puker[element]
		}

        arrPai.sort(function(a,b){
            return ( (b & 0x0f) - (a & 0x0f));
        });

        let arrResultType = [];
        let analyseData = this.analysePai(arrPai);
	
		if (this.getShunZi(arrPai,false,true) && Math.min(...arrPai) == 10) {
            arrResultType.push(this.PaiType.HJTHS);
        }

        if (this.getWuTong(arrPai,false)) {
            arrResultType.push(this.PaiType.WT);
        }
        if (this.getShunZi(arrPai,false,true)) {
            arrResultType.push(this.PaiType.THS);
        }
        if (this.getTieZhi(arrPai,false)) {
            arrResultType.push(this.PaiType.TZ);
        }
        if (this.getHuLu(arrPai,false)) {
            arrResultType.push(this.PaiType.HL);
        }
        if (this.getTongHua(arrPai,false)) {
            arrResultType.push(this.PaiType.TH);
        }
        if (this.getShunZi(arrPai,false,false)) {
            arrResultType.push(this.PaiType.SZ);
        }

        if (this.getSanTiao(arrPai,false)) {
            arrResultType.push(this.PaiType.ST);
        }

        if (analyseData.tongPai.length > 1) {
            arrResultType.push(this.PaiType.ED);
        }
        if (analyseData.tongPai.length > 0) {
            arrResultType.push(this.PaiType.YD);
        }
        else{
            arrResultType.push(this.PaiType.WL);
        }


		return Math.max(...arrResultType) - 1;  //返回最大值

        //return arrResultType;
    }
    //
    analysePai(arrPaiData){
        //剔除癞子
        let arrPai =  JSON.parse(JSON.stringify(arrPaiData))
        let len = arrPai.length;
        let data ={
            sanPai :[],
            tongPai : [],
            arrTongPai  : [],
            paiValue : [],
        };
        //同牌信息统计
        let index = 0;
        let count = 1;
        let arrTemp = [];
    
        for(let i = 0; i < len; ++i){
            if(i >= len - 1){   //结束
                if(count > 1){
                    let tongPaiTmp ={value:0,count:0};
                    tongPaiTmp.value = this.globFucGetValue(arrPai[index]);
                    tongPaiTmp.count = count;
                    data.tongPai.push(tongPaiTmp);
                }
                break;
            }
            if(this.globFucGetValue(arrPai[index]) ==  this.globFucGetValue(arrPai[i+1])){
                ++count;
            }
            else{
                if(count > 1){
                    let tongPaiTmp ={value:0,count:0};
                    tongPaiTmp.value = this.globFucGetValue(arrPai[index]);
                    tongPaiTmp.count = count;
                    data.tongPai.push(tongPaiTmp);
                }
                index = i+1;
                count = 1;
            }	
        }
        //同牌数据
        let tLen = data.tongPai.length;
        for(let i = 0;i<tLen;i++){
            for(let j = 0;j<len;j++){
                if(this.globFucGetValue(arrPai[j]) == data.tongPai[i].value  ){ 
                    arrTemp.push(arrPai[j]);
                }
            }
            if(arrTemp.length > 0){
                data.arrTongPai.push(arrTemp);
                arrTemp = [];
            }
        }
        //散牌
        for(let i = 0; i < len; ++i){
            let tLen = data.tongPai.length;
            let bTongPai = false;
            for(let j = 0; j < tLen; ++j){
                if(this.globFucGetValue(arrPai[i]) == data.tongPai[j].value){
                    bTongPai = true;
                    break;
                }
            }
            if(!bTongPai){
                data.sanPai.push(arrPai[i]);
            }
        }
        //所有的牌值
        for(let i = 0; i < len;i++){
            let bExist = false; //判断是否存在
            for(let j = 0;j < data.paiValue.length;j++){
                if(this.globFucGetValue(data.paiValue[j]) == this.globFucGetValue(arrPai[i])){
                    bExist = true;
                }
            }
            if(!bExist){
                data.paiValue.push(arrPai[i]);
            }
        }
        return data;
    }


	//牌型转换
	fucCardsTransform(nCrdas){
		//1-52 阿拉伯数字扑克进行16进制PK转换
		let arrPai = []
		for (let index = 0; index < nCrdas.length; index++) {
			arrPai[index] = this.Puker[nCrdas[index]]
		}
        arrPai.sort(function(a,b){
            return ( (b & 0x0f) - (a & 0x0f));
        });
        return this.analysePai(arrPai);
	}

	//同牌 牌型比较
	fucCardRresult(nCrdas_1,nCrdas_2){
        let analyseData = this.fucCardsTransform(nCrdas_1);
		let analyseData2 = this.fucCardsTransform(nCrdas_2);

		let Max1 = 0
		for (let index = 0; index < analyseData.arrTongPai.length; index++) {
			const element = analyseData.arrTongPai[index];
			for (let index = 0; index < element.length; index++) {
				if (element[index] %16  > Max1) {
					Max1 = Math.floor(element[index] %16)
				}
			}
		}

		let Max2 = 0
		for (let index = 0; index < analyseData2.arrTongPai.length; index++) {
			const element = analyseData2.arrTongPai[index];
			for (let index = 0; index < element.length; index++) {
				let ele = element[index];
				if (ele %16  > Max2) {
					Max2 = Math.floor(ele %16)
				}
			}
		}
		//同样的对子  找较小对子
		if (Max1 == Max2) {
			Max1 = 100
			for (let index = 0; index < analyseData.arrTongPai.length; index++) {
				const element = analyseData.arrTongPai[index];
				for (let index = 0; index < element.length; index++) {
					let ele = element[index];
					if (ele %16  < Max1) {
						Max1 = Math.floor(ele %16)
					}
				}
			}
			Max2 = 100
			for (let index = 0; index < analyseData2.arrTongPai.length; index++) {
				const element = analyseData2.arrTongPai[index];
				for (let index = 0; index < element.length; index++) {
					let ele = element[index];
					if (ele %16  < Max2) {
						Max2 = Math.floor(ele %16)
					}
				}
			}
			//比较散牌
			if (Max1 == Max2) {
				return this.fucSanCardsCompare(analyseData.sanPai,analyseData2.sanPai)
			}
		}
		return this.fucCardIsA(Max1) > this.fucCardIsA(Max2) ? 0 : 1
	}

	//值是否是A
	fucCardIsA(data){
		return data%14 ==0 ? 15 : Math.floor(data%14) 
	}

	//散牌比较
	fucSanCardsCompare(nCrdas_1,nCrdas_2){
		let  fucDelMaxMin = function(data){
			let n_Max = 0
			for (let index = 0; index < data.length; index++) {
				const element = data[index];
				if (element %16  > n_Max) {
					n_Max = Math.floor(element %16)
				}	
			}
			return n_Max
		}

		let shunzi1 = fucDelMaxMin(nCrdas_1)
		let shunzi2 = fucDelMaxMin(nCrdas_2)
		//同牌值比较花色
		if (this.fucCardIsA(shunzi1) == this.fucCardIsA(shunzi2)) {
			return  shunzi1/14 < shunzi2/14 ? 0 : 1
		}
		return this.fucCardIsA(shunzi1) > this.fucCardIsA(shunzi2) ? 0 : 1
	}

	//
	fucBankCompare(nCrdas_1,nCrdas_2){
		
		let fucCopyData = function(data){
			let n_card2 = []
			for (let index = 0; index < data.length; index++) {
				n_card2[index] = data[index]%13
				if (n_card2[index] == 1) {
					n_card2[index] = 14
				}
				if (n_card2[index] == 0) {
					n_card2[index] = 13
				}
			}
			return n_card2
		}
		let n_card1 = fucCopyData(nCrdas_1)
		let n_card2 = fucCopyData(nCrdas_2)

		function compare(v1,v2){
			if(v1<v2){return 1;}
			else if (v1>v2) {
				return -1;
			}else {return 0;}
		}
		n_card1.sort(compare);
		n_card2.sort(compare);
		for (let index = 0; index < n_card1.length; index++) {
			if (n_card1[index] != n_card2[index]) {
				return n_card1[index] > n_card2[index] ? 0 : 1
			}	
		}

		
		nCrdas_1.sort(compare).reverse();
		nCrdas_2.sort(compare).reverse();
		for (let index = 0; index < nCrdas_1.length; index++) {
			if (nCrdas_1[index] != nCrdas_2[index]) {
				return nCrdas_1[index] > nCrdas_2[index] ? 0 : 1
			}	
		}

	}



	//顺子  同花顺 比较
	fucShunZiCompare(nCrdas_1,nCrdas_2){

		if (this.fucIdenticaldata(nCrdas_1,nCrdas_2) != 10) {
			return this.fucIdenticaldata(nCrdas_1,nCrdas_2)  //同样大小的顺子
		}

		let analyseData = this.fucCardsTransform(nCrdas_1).sanPai
		let analyseData2 = this.fucCardsTransform(nCrdas_2).sanPai
		let  fucDelMaxMin = function(data){
			let n_San1 = 0
			for (let index = 0; index < data.length; index++) {
				const element = data[index];
				if (element %16  > n_San1) {
					n_San1 = Math.floor(element %16)
				}	
			}
			let n_San2 = 100
			for (let index = 0; index < data.length; index++) {
				const element = data[index];
				if (element %16  < n_San2) {
					n_San2 = Math.floor(element %16)
				}
			}
			let index = data.indexOf(n_San1);
			if (index !== -1) {
				data.splice(index, 1);
			}
			index = data.indexOf(n_San2);
			if (index !== -1) {
				data.splice(index, 1);
			}
			return data
		}

		let shunzi1 = fucDelMaxMin(analyseData)
		let shunzi2 = fucDelMaxMin(analyseData2)

		return this.fucCardIsA(Math.max(...shunzi1)) > this.fucCardIsA(Math.max(...shunzi2)) ? 0 : 1
	}


	//手牌数据是否一样
	fucIdenticaldata(cards_1,cards_2){
		let  fucsort = function(cards){
			let arrPai = []
			for (let index = 0; index < cards.length; index++) {
				arrPai[index] = cards[index] % 13
			}
			return arrPai.sort();
		}
		function compareArrays(arr1, arr2) {
			if (arr1.length !== arr2.length) {
			  return false;
			}
			for (let i = 0; i < arr1.length; i++) {
			  if (arr1[i] !== arr2[i]) {
				return false;
			  }
			}
			return true;
		}

		function  findMax(data){
			let n_Max = 0
			for (let index = 0; index < data.length; index++) {
				let element = data[index];
				//a值
				if (element % 13 == 1) {
					return element
				}
				if (element % 13 > n_Max %13) {
					n_Max = element
				}

				//同牌值取花色大的
				if (element % 13 == n_Max %13 && element < n_Max) {
					n_Max = element
				}
			}
			return n_Max
		}

		//是否大小相同
		if (compareArrays(fucsort(cards_1),fucsort(cards_2)	)) {
			//比较花色
			return  findMax(cards_1)  >  findMax(cards_2) ? 0  :1
		}
		return 10
	}
}

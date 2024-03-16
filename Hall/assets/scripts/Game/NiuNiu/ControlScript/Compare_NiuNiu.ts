export default class Compare{
	
	/**
	 * 定义手牌类型（按照大小从小到大排序)
	 */
	HandsType = {
		TYPE_NONE: 0,       // 没牛, 任意三张牌的和都不是10的倍数
		TYPE_NIU_1: 1,      // 牛1
		TYPE_NIU_2: 2,
		TYPE_NIU_3: 3,
		TYPE_NIU_4: 4,
		TYPE_NIU_5: 5,
		TYPE_NIU_6: 6,
		TYPE_NIU_7: 7,
		TYPE_NIU_8: 8,
		TYPE_NIU_9: 9,
		TYPE_NIUNIU: 10,    // 牛牛, 任意3张和为10的倍数，剩余2张和也为10的倍数
		TYPE_SILVER: 11,    // 4花牛, 除了一张10 4张全是J、Q、K
		TYPE_FLOWER: 12,    // 5花牛, 五张全是J、Q、K
		TYPE_BOOM:   13,      // 炸弹, 四张点数相同
		TYPE_FIVES:  14      // 5小牛（5张加起来小于等于10）
	};

	handsType = 0
	maxCard  = 0
	nCards = []


	/**
	 * 手牌类型返回对象
	 * @param type{Number}      手牌类型
	 * @param mCard{CardObj}    手里的最大牌
	 * @param ncards{Array}     组成牛的三张牌, 手牌分成两组方便展示
	 * @constructor
	 */
	 TypeReturn(type, mCard, ncards) {
		this.handsType = type;  // 手牌类型
		this.maxCard = mCard;   // 最大牌
		this.nCards = ncards;   // 组成牛的牌
	}


	/***
	 * 从大到小排序手牌   
	 * @param cardsArr{Array} 手牌数组
	 */
	sortBig2Samll(cardsArr) {
		cardsArr.sort( (c1, c2)=> {
			if( c1.point == c2.point){
				return c1.suit - c2.suit;
			}
			return c2.point - c1.point;
		});
		return cardsArr;
	}

	/***
	 * 转换牌
	 *  1-13 (A-K)
	 *  1-4 (1黑桃spade,2红桃heart,3梅花club,4方块diamond）
	 * @param cardsArr{Array} 手牌数组
	 */
	fucCardZhuanHuan(cardsArr){
		let cards = []
		for (let index = 0; index < cardsArr.length; index++) {
			let obj = {point:0,suit:0}
			obj.point = cardsArr[index]%13 != 0 ? cardsArr[index]%13 :13
			obj.suit = Math.floor(cardsArr[index]/13) 
			cards[index] = obj
		}
		return cards
	}

	/**
	 * 判定手牌类型
	 * @param cardsArr{Array} 要判定的手牌信息数组
	 * @return {TypeReturn}
	 */
	 getHandsType(data) {
		let cardsArr = this.fucCardZhuanHuan(data)
		var len = cardsArr.length;
		if (!cardsArr || len < 1 || len > 5) return new this.TypeReturn(this.HandsType.TYPE_NONE, cardsArr[0], cardsArr);
		cardsArr = this.sortBig2Samll(cardsArr);
		var totalPoint = 0;
		var realTotalPoint = 0;
		var bigJ = true;
		var big10 = true;

		cardsArr.forEach((card)=>{
			totalPoint += card.point <= 10 ? card.point : 10;
			realTotalPoint += card.point;
			if (card.point < 11){
				bigJ = false;
			}
			if (card.point < 10){   //只能有一张10
				big10 = false;
			}
		});

		//只能有一张10
		let cardvalue10 = 0
		for (let index = 0; index < cardsArr.length; index++) {
			let  element = cardsArr[index].point
			if (element == 10) cardvalue10 += 1	
		}

		if(big10  && cardvalue10 != 1){
			big10 = false
		}

		// 判断牌型,判断顺序不能变,依次从大到小判断5小牛、5花牛、炸弹、银牛、牛牛、有牛、没牛
		// if (totalPoint <= 10) {
		// 	return new this.TypeReturn(this.HandsType.TYPE_FIVES, cardsArr[0], cardsArr);
		// }

		if (bigJ) {
			return new this.TypeReturn(this.HandsType.TYPE_FLOWER, cardsArr[0], cardsArr);
		}
		// 牌型是4炸的话最大牌取炸弹牌,比如5555J取5,方便比较大小
		if (realTotalPoint - cardsArr[len - 1].point === cardsArr[0].point * 4) {
			return new this.TypeReturn(this.HandsType.TYPE_BOOM, cardsArr[0], cardsArr);
		} else if (realTotalPoint - cardsArr[0].point === cardsArr[len - 1].point * 4) {
			return new this.TypeReturn(this.HandsType.TYPE_BOOM, cardsArr[len - 1], cardsArr);
		}

		if (big10) {
			return new this.TypeReturn(this.HandsType.TYPE_SILVER, cardsArr[0], cardsArr);
		}

		var lave = totalPoint % 10;
		for (var i = 0; i < len - 1; i++) {
			var ret = 0;
			for (var j = i + 1; j < len; j++) {
				ret = (cardsArr[i].point <= 10 ? cardsArr[i].point : 10) + (cardsArr[j].point <= 10 ? cardsArr[j].point : 10);

				if (ret % 10 === lave) {
					var cardPre = [];
					var cardSuf = [];

					for (var k = 0; k < len; k++) {
						if (k != i && k != j) {
							cardPre.push(cardsArr[k]);
						} else {
							cardSuf.push(cardsArr[k]);
						}
					}

					if (lave === 0) {
						return new this.TypeReturn(this.HandsType.TYPE_NIUNIU, cardsArr[0], cardsArr);
					}
					//任意三张组成10的倍数   剩余两张计算点数
					if (this.fucNiuNiuCheck(cardsArr)) {
						return new this.TypeReturn(this.HandsType["TYPE_NIU_" + lave], cardsArr[0], cardPre);
					}
				}
			}
		}
		return new this.TypeReturn(this.HandsType.TYPE_NONE, cardsArr[0], cardsArr);
	}

	/**
	 * 牛几校验任意3张组合成牛 才有牛
	 * @param cardsArr{Array} 要判定的手牌信息数组
	 * @return {TypeReturn}
	 */
	fucNiuNiuCheck(cardsArr){
		var arr = [];
		for (let index = 0; index < cardsArr.length; index++) {
			arr[index]  = cardsArr[index].point;
		}
		for(var i=0;i<arr.length-2;i++){
			for(var j=i+1;j<arr.length-1;j++){
				for(var k=j+1;k<arr.length;k++){
					let ret1 = (arr[i] <= 10 ? arr[i] : 10)
					let ret2 = (arr[j] <= 10 ? arr[j] : 10)
					let ret3 = (arr[k] <= 10 ? arr[k] : 10)
					if( (ret1 + ret2 + ret3) %10 == 0 ){
						return true
					}
				}
			}
		}
		return false
	}

	/*
	3张牌牛组合
	*/
	fucgetNiuCard(cardsArr){
		for(var i=0;i<cardsArr.length-2;i++){
			for(var j=i+1;j<cardsArr.length-1;j++){
				for(var k=j+1;k<cardsArr.length;k++){
					let point1 =  cardsArr[i]%13 != 0 ? cardsArr[i]%13 :13
					let point2 =  cardsArr[j]%13 != 0 ? cardsArr[j]%13 :13
					let point3 =  cardsArr[k]%13 != 0 ? cardsArr[k]%13 :13

					let ret1 = (point1 <= 10 ? point1 : 10)
					let ret2 = (point2 <= 10 ? point2 : 10)
					let ret3 = (point3 <= 10 ? point3 : 10)
					if( (ret1 + ret2 + ret3) %10 == 0 ){
						//需要排序
						let newCard = JSON.parse(JSON.stringify(cardsArr))

						newCard.splice(newCard.indexOf(cardsArr[i]),1);
						newCard.splice(newCard.indexOf(cardsArr[j]),1);
						newCard.splice(newCard.indexOf(cardsArr[k]),1);

						newCard.push(cardsArr[i])
						newCard.push(cardsArr[j])
						newCard.push(cardsArr[k])

						return newCard 
					}
				}
			}
		}
		return cardsArr
	}

	/**
	 * 比较两组手牌大小
	 * @param cards1{Array}
	 * @param cards2{Array}
	 * @return {Boolean} true 表示 cards1 大于 cards2
	 */
	 compareCards(cards1, cards2) {
		var typeReturn1 = this.getHandsType(cards1);
		var typeReturn2 = this.getHandsType(cards2);
		return this.compareHandsReturn(typeReturn1, typeReturn2);
	}

	/**
	 * 比较两个手牌类型大小
	 * @param typeReturn1{TypeReturn}
	 * @param typeReturn2{TypeReturn}
	 */
	compareHandsReturn(typeReturn1, typeReturn2) {
		if (typeReturn1.handsType !== typeReturn2.handsType) {
			return typeReturn1.handsType > typeReturn2.handsType ? 0 : 1
		} else {
			if (typeReturn1.maxCard.point !== typeReturn2.maxCard.point) {
				return typeReturn1.maxCard.point > typeReturn2.maxCard.point ? 0 : 1
			} else {
				return typeReturn1.maxCard.suit < typeReturn2.maxCard.suit ? 0 : 1
			}
		}
	}

}



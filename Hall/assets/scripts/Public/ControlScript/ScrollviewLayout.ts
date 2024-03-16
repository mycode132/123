export default class ScrollviewLayout {

	m_Init = false
	//scrollview  优化
	itemHeightorwidth = 0		//设置每个item的高
    topIndex = 0				//最上面的item索引id
    bottomIndex = 0				//最下面的item索引id
    offset = 0					//上下临界坐标补充，
	topExtremeDistance = 0
	bottomExtremeDistance = 0
	itemsArr =[]

	m_Mode = null    			//创建模版
	m_ScrollView = null  		//视窗
	m_data = null        		//加载数据
	m_upItemCallback = null  	//更新Item
	m_bHView = true				// 是否是横版
	m_CreatorCount = 10  		//默认创建Item数目

	/*
	@param 基础模版
	@param 容器
	@param 数据
	@param 更新回调
	@param 是否横版
	@param 默认添加数目 
	*/
	initView(_Mode,_ScrollView,_data,_upItemCallback,_bHView,_CreatorCount = 10){
		this.m_data = _data
		if (!this.m_Init) {
			this.m_ScrollView = _ScrollView
			this.m_Mode = _Mode
			this.m_upItemCallback = _upItemCallback
			this.m_bHView = _bHView	//  是否是横版
			this.m_CreatorCount = _CreatorCount
			this.topIndex = 0									//最前面的item索引id
			this.bottomIndex = 		this.m_CreatorCount-1		//最后面的item索引id
			this.offset = 80			//上下临界坐标补充，
			this.itemsArr = []//item存储arr
			this.m_ScrollView.content.removeAllChildren()
			if (_bHView ) {
				this.fucHScrollview()
			}else{
				this.fucVScrollview()
			}
			this.m_Init = true
		}else{
			//动态更新数据
			this.fucupdatainfo(this.m_data)
		}
	}

	//动态更新数据
	fucupdatainfo(data){
		this.m_data = data
		if (this.m_bHView) {
			this.m_ScrollView.content.width = (this.m_data.length) * this.itemHeightorwidth;
			//需要手动刷新
			for (let index = 0; index < this.itemsArr.length; index++) {
				if (this.m_upItemCallback) {
					this.m_upItemCallback(this.itemsArr[index],this.m_data[index])
				}
			}
			this.m_ScrollView.scrollToPercentHorizontal(1.00,0)
		}else{
			this.m_ScrollView.content.height = (this.m_data.length) * this.itemHeightorwidth;
			this.m_ScrollView.scrollToPercentVertical(1.00,0)
		}
	}

	//有子节点数item
	fucgetAllitem(_end = 6){
		return this.itemsArr[this.m_data.length-1 - _end]
	}

	fucgetNNAllitem(_end = 2){
		return this.itemsArr[this.m_data.length-1 - _end]
	}

	fucHScrollview(){
        this.itemHeightorwidth = this.m_Mode.width
		//H
        this.m_ScrollView.content.width = (this.m_data.length) * this.itemHeightorwidth
        let scrollViewPos = this.m_ScrollView.node.position
        this.topExtremeDistance = scrollViewPos.x - this.m_ScrollView.node.width / 2 - this.offset
        this.bottomExtremeDistance = scrollViewPos.x + this.m_ScrollView.node.width / 2 + this.offset
        for (let i = 0 ;i < this.m_CreatorCount ;i ++) {
			let item = cc.instantiate(this.m_Mode)
			item.active = true
            item.parent = this.m_ScrollView.content
			this.updateItem(item,this.m_data[i],i)
        }
		this.m_ScrollView.scrollToPercentHorizontal(1.00,0.0)
    }

	//实时刷新数据  
    updateItem (listItem, data, i) {
        listItem.x = i * this.itemHeightorwidth + this.itemHeightorwidth / 2
		if (this.m_upItemCallback) {
			this.m_upItemCallback(listItem,data)
		}
        this.itemsArr[i] = listItem
    }

    updateItemsPos (dt) {
        if (!!this.itemsArr && !!this.itemsArr[this.bottomIndex]) {
            let topPos = this.itemsArr[this.topIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2))
            let bottomPos = this.itemsArr[this.bottomIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2))
            if (topPos.x < this.topExtremeDistance) {
                if (this.bottomIndex >= this.m_data.length - 1) {
                    return
                }
                this.updateItem(this.itemsArr[this.topIndex], this.m_data[this.bottomIndex + 1], this.bottomIndex + 1)
                this.topIndex ++
                this.bottomIndex ++
            
            } else if (bottomPos.x > this.bottomExtremeDistance) {
                if (this.topIndex < 1) {
                    return
                }
                this.updateItem(this.itemsArr[this.bottomIndex], this.m_data[this.topIndex - 1], this.topIndex - 1)
                this.topIndex --
                this.bottomIndex --
            }
        }
    }

	update(dt) {
		if (this.m_bHView) {
			this.updateItemsPos(dt)
		}else{
			this.upVdateItemsPos(dt)
		}
    }

	//竖
	fucVScrollview() {
        this.itemHeightorwidth = this.m_Mode.height//设置每个item的高
        let scrollViewPos = this.m_ScrollView.node.position
        this.topExtremeDistance = scrollViewPos.y + this.m_ScrollView.node.height / 2 + this.offset
        this.bottomExtremeDistance = scrollViewPos.y - this.m_ScrollView.node.height / 2 - this.offset
        for (let i = 0; i < this.m_CreatorCount ;i ++) {
			let Item = cc.instantiate(this.m_Mode)
			Item.active = true
            Item.parent = this.m_ScrollView.content
            this.upVdateItem(Item, this.m_data[i], i)
        }
        this.m_ScrollView.content.height = (this.m_data.length) * this.itemHeightorwidth
		this.m_ScrollView.node.active = true
    }

	//实时刷新数据
    upVdateItem (listItem, data, i) {
        listItem.y = -i * this.itemHeightorwidth - this.itemHeightorwidth / 2
		if (this.m_upItemCallback) {
			this.m_upItemCallback(listItem,data)
		}
        this.itemsArr[i] = listItem
    }

    upVdateItemsPos (dt) {
        if (!!this.itemsArr && !!this.itemsArr[this.bottomIndex]) {
            //获取上下item当前的坐标
            let topPos = this.itemsArr[this.topIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2))
            let bottomPos = this.itemsArr[this.bottomIndex].convertToWorldSpaceAR(cc.v2(0, 0)).sub(cc.v2(cc.winSize.width / 2, cc.winSize.height / 2))
            //检测上item是否超过边界
            if (topPos.y > this.topExtremeDistance) {
                if (this.bottomIndex >= this.m_data.length - 1) {
                    return
                }
                this.upVdateItem(this.itemsArr[this.topIndex], this.m_data[this.bottomIndex + 1], this.bottomIndex + 1)
                this.topIndex ++
                this.bottomIndex ++
            //检测下item是否超过边界
            } else if (bottomPos.y < this.bottomExtremeDistance) {
                if (this.topIndex < 1) {
                    return
                }
                this.upVdateItem(this.itemsArr[this.bottomIndex], this.m_data[this.topIndex - 1], this.topIndex - 1)
                this.topIndex --
                this.bottomIndex --
            }
        }
    }

	// 数据处理
	//先向下查找  当下方有时或越界时向右查找
	/*
	#  #
	#  #
	#  #
	#
	#
	#  #  #
	*/
	_dataMap: Map<string, number> = new Map();
	//列表中最后一个添加的数据  进行闪烁
	public m_endItemPos = null  //  506 
	Subdatagame(subgame: string,data:number): boolean {
		if (!subgame) {
		  return ;
		}
		if (this._dataMap.has(subgame)) {
		  return ;
		}
		this._dataMap.set(subgame, data);
	}

	//二维数组
	fucSetDataSort(data){
		let n_bChange = false
		this._dataMap.clear()
		let n_endItemPos = null  //记录最后一个
		//计算最大长度
		for (let index = 0; index < data.length; index++) {
			let  element = JSON.parse(JSON.stringify(data[index]))
			n_bChange = false
			let n_right = 0
			for (let z = 0; z < element.length; z++) {
				n_endItemPos = `${index}${z}`
				if ( z < 6 && !this._dataMap.has(n_endItemPos)) {
					this.Subdatagame(n_endItemPos,element[z])
				}else{
					//向右查找
					n_right = z
					n_bChange = true
					break
				}
			}
		
			if (n_bChange ) {  //向右    //0排时
				let  n_index = (index)+1
				for (let j = n_right; j < element.length; j++) {
					n_endItemPos = `${n_index}${n_right-1}`
					if (!this._dataMap.has(n_endItemPos)) {
						this.Subdatagame(n_endItemPos,element[j])
						n_index += 1
					}
				}
			}
		}
		//二维数组进行拆分
		let n_temp = [[]]
		for (let index = 0; index < this._dataMap.size; index++) {
			for (let zm = 0; zm < 6; zm++) {
				let n_temppos = `${index}${zm}`
				if (this._dataMap.has(n_temppos)) {
					if (!n_temp[index]) {
						n_temp[index] = [-1,-1,-1,-1,-1,-1]
					}
					n_temp[index][zm] = this._dataMap.get(n_temppos)
				}

				if (n_temppos == n_endItemPos  ) {
					this.m_endItemPos= [[index],[zm]]
				}
			}
		}
		return  n_temp
	}

	//所有游戏统计走势数据进行排列
	/*
	@param 原始数据  长度不一二维数组  长度超过6的进行拆分
	@param 和值判断
	@param 判断条件
	*/
	fucDataTongjiToArray(data,Sumvalue = null,callback,nAddCount = 6){
		let n_Temp  = []//标记6个初始长度
		let n_startResult = data[0]
		let n_AllResult  = []  
		n_Temp[0]= n_startResult
		let n_Pos = 1
		for (let index = 0; index < data.length; index++) {
			if (index == 0) continue
			if (Sumvalue && n_startResult == Sumvalue ) {  //和开始
				n_startResult = data[index]
			}
			
			if (callback(n_startResult, data[index])) {
				n_Temp[n_Pos] = data[index]
			}else{
				//不能组一列  终结前面数组 
				n_Pos = 0
				n_AllResult.push(JSON.parse(JSON.stringify(n_Temp)))
				n_Temp = []
				n_Temp[n_Pos] = data[index]
				n_startResult = data[index]
			}
			if (index == data.length-1) {
				n_AllResult.push(JSON.parse(JSON.stringify(n_Temp)))
			}
			n_Pos +=1
		}
		n_AllResult = this.fucSetDataSort(JSON.parse(JSON.stringify(n_AllResult)))

		//长度超过6的往后插一组倒叙  不做转角
		// for (let index = 0; index < n_AllResult.length; index++) {
		// 	let element = n_AllResult[index];
		// 	if (element.length>6) {
		// 		let n_temp = [-1,-1,-1,-1,-1,-1]
		// 		let n_start = {nstart:5,bwhile:false,interpos:index+1}  //起始位置  是否循环(大于1)   插入位置
		// 		while(element.length>6){
		// 			let n_pop =  element.splice(6,1)[0]
		// 			n_temp[n_start.nstart] = n_pop
		// 			if (!n_start.bwhile) {
		// 				n_start.nstart -= 1
		// 			}else{
		// 				n_start.nstart += 1
		// 			}
		// 			if ((n_start.nstart < 0  || n_start.nstart > 5 ) && element.length>6) {  //
		// 				n_start.bwhile = !n_start.bwhile
		// 				if (n_start.nstart < 0) n_start.nstart = 0
		// 				if (n_start.nstart > 5) n_start.nstart = 5
		// 				//满一组
		// 				n_AllResult.splice(n_start.interpos,0,n_temp)
		// 				n_temp = [-1,-1,-1,-1,-1,-1]
		// 				n_start.interpos += 1
		// 			}
		// 		}
		// 		n_AllResult.splice(n_start.interpos,0,n_temp)
		// 	}
		// }
		//  //找最后添加的元素
		// for (let index = 0; index < n_AllResult[n_AllResult.length-1].length; index++) {
		// 	const element = n_AllResult[n_AllResult.length-1][index];
		// 	if (element[0]  >= 0 ) {
		// 		for (let z = 0; z < element.length; z++) {
		// 			if (element[z] < 0) {
		// 				this.m_endItemPos= [[n_AllResult.length],[z-1]]  //前往后找 找到无效的返回前一个
		// 				break
		// 			}
		// 		}
		// 	}else{
		// 		for (let z = 0; z < element.length; z++) {
		// 			if (element[z] >= 0) {
		// 				this.m_endItemPos= [[n_AllResult.length],[z]] //前往后找 找到有效的返当前
		// 				break
		// 			}
		// 		}
		// 	}
		// }
		
		//插入特定数量组组空数据 留出视图右边空余位置
		for (let index = 0; index < nAddCount; index++) {
			n_AllResult.push([-1,-1,-1,-1,-1,-1])
		}
		return n_AllResult
	}
}
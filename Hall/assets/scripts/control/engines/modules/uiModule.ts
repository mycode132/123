import superModule from "./superModule";
const {ccclass, property} = cc._decorator;

@ccclass
export default class uiModule extends superModule {
	protected m_className: string = "UI模块";

	constructor() {
        super();
    }


	private m_uiRoot : cc.Node = null;




	public getUIRoot(){
        return this.m_uiRoot;
    }
    public SetUIRoot(node:cc.Node){
        this.m_uiRoot = node;
    }

}

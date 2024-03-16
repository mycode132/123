

import { services } from "../GameEngine";
import { I18nKV, I18nLanguageEnum } from "./i18nContent/i18nInterface";
import i18nJson from "./i18nContent/i18nJson";
import superService from "./superService";

const {ccclass, property} = cc._decorator;

@ccclass
export default class i18nService extends superService {
	protected className: string = 'i18n国际化多语言服务';

    protected readonly I18N_KEY: string = 'i18n_key';
    protected m_i18nKey: I18nLanguageEnum = I18nLanguageEnum.ZH_CN;
    private m_i18nMap: I18nKV;

    constructor() {
        super();
    }

    async loadService(): Promise<void> {
        await super.loadService();
        //
        this.loadSetting();
        //
        return Promise.resolve();
    }

    protected loadSetting() {
        let data = services().localStorageSrv.getStorage(this.I18N_KEY, false);
        if (data) {
            this.m_i18nKey = Number(data);
        }
        this.m_i18nMap = i18nJson();
    }

    getI18nSetting() {
		if (!this.m_i18nKey) {
			this.m_i18nKey =  0
		}
        return this.m_i18nKey;
    }

    setI18nSetting(em: string) {
		switch (em) {
			case "cn":
			case "zh":
				this.m_i18nKey =  0
				break
			case "en":
				this.m_i18nKey =  1
				break
			case "id":
				this.m_i18nKey =  2
				break
			case "th":
				this.m_i18nKey =  3
				break
			case "in":
				this.m_i18nKey =  4
				break
			case "vn":
				this.m_i18nKey =  5
				break
			default:
				break;
		}
        services().localStorageSrv.setStorage(this.I18N_KEY, this.m_i18nKey, false);
    }

    protected recursionNodeLabelI18n(pNode: cc.Node) {
        if (pNode.isValid) {
            const lbs = pNode.getComponents(cc.Label);
            lbs.forEach(lb => {
                lb.string = this.getI18nString(lb.string);
            });
            pNode.children.forEach(nextNode => {
                this.recursionNodeLabelI18n(nextNode);
            });
        }
    }

    getI18nRecursion(node: cc.Node) {
        this.recursionNodeLabelI18n(node);
    }

    getI18nString(text: string): string {
        let e = this.getI18nSetting();
        const srcStr = this.m_i18nMap[text];
        if (srcStr && srcStr.length > 0) {
            if (srcStr[e]) {
                return srcStr[e];
            } else {
                console.log('%c#451546 未配置多语言:%s[%d]', 'color:#f81;', text, e);
                return srcStr[0];
            }
        } else {
            console.log('%c#491546 未配置多语言:%s', 'color:#e81;', text);
            return text;
        }
    }
}

/**
 * 转换为配置中的语言版本
 * @param textOrRootNode 文本内容或者要递归转换的根节点
 * @constructor
 */
export function TT<T>(textOrRootNode: T): T {
    if (typeof textOrRootNode == 'string') {
        const text = services().i18nSrv.getI18nString(textOrRootNode);
        return <any>text;
    } else if (textOrRootNode instanceof cc.Node) {
        return <any>services().i18nSrv.getI18nRecursion(textOrRootNode);
    } else {
        console.error('#参数不合法', textOrRootNode.toString());
    }
}
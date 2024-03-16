export enum I18nLanguageEnum {
    //简体中文
    ZH_CN = 0,
    //英文
    EN ,
	//印度
	ID,
	//TH
	TH ,
	//IN
	IN ,
	//
	VN,
	//日本
	JP,
	//韩国
	KR
}

export interface I18nKV {
    [k: string]: string[];
}
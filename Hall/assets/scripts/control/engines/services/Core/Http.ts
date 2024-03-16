export const enum IHttpMethod {
    GET = "get",
    POST = "post",
	url = "http://45.66.157.199:8082/api/"
}

export default class Http {
    /**
     * 请求
     * @param url 链接
     * @param param 参数
     * @param callback 回调
     * @param method 方案
     * @param https 是否使用 https协议
     */
    public static request(url: string, param: Object, callback: (data: any) => void, method: IHttpMethod = IHttpMethod.GET, https?: boolean): void {
        switch (method) {
            case IHttpMethod.GET:
                this.getRequest(url, param, callback);
                break;
            case IHttpMethod.POST:
                this.postRequest(url, param, callback);
                break;
        }
    }

    /**
     * GET
     * @param url 链接
     * @param param 参数
     * @param callback 回调
     * @param https 是否使用 https协议
     */
    private static getRequest(url: string, param: Object,callback: (data: any) => void, https?: boolean): void {
        if (param) {
            let s = "?";
            for (let key in param) {
                url += `${s}${key}=${param[key]}`;
                s = '&';
            }
        }
        url = this.getUrl(url, https);
        cc.log(`http send:${url}`);
        let request = new XMLHttpRequest();
        request.open(IHttpMethod.GET, url, true);
        this.setRequestHeader(request);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                if (request.status >= 200 && request.status < 400) {
                    callback(request.responseText);
                } else {
                    cc.log(`url:(${url}) request error. status:(${request.status})`);
                    callback(null);
                }
            }
        };
        request.send();
    }

    /**
     * POST
     * @param url 链接
     * @param param 参数
     * @param callback 回调
     * @param https 是否使用 https协议
     */
    private static postRequest(url: string, param: Object,callback: (data: any) => void, https?: boolean): void {
        let paramStr = "";
        if (param) {
            let s = "";
            for (let key in param) {
                paramStr += `${s}${key}=${param[key]}`;
                s = '&';
            }
        }

        url = this.getUrl(url, https);
        let request = new XMLHttpRequest();
        request.open(IHttpMethod.POST, url);
		request.withCredentials = true; // 设置请求携带cookie信息

        this.setRequestHeader(request);
        request.onreadystatechange = () => {
            if (request.readyState == 4) {
                if (request.status >= 200 && request.status < 400) {
                    callback(request.responseText);
                } else {
                    cc.log(`${url}请求失败:${request.status}`);
                    callback(null);
                }
            }
        };
        request.send(paramStr);
    }


    /**
     * 设置http头
     * @param request XMLHttpRequest
     */
    private static setRequestHeader(request: XMLHttpRequest): void {
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.setRequestHeader("Accept", "application/json, text/plain, */*");

		request.setRequestHeader("cookies",document.cookie);
		
    }

    /**
     * 获取请求链接
     * @param url 链接
     * @param https 是否使用 https协议
     * @returns {string} 
     */
    private static getUrl(url: string, https: boolean): string {

		url = IHttpMethod.url +url
        if (https) {
            if (url.indexOf("https") == -1) {
                url = url.replace("http", "https");
            }
        }
        return url;
    }
}
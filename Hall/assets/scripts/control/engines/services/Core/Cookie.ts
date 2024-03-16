/**
     * 写入cookie
     * cookie 将被保存 30 天
     * @param name
     * @param value
     */
 export function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);

	document.cookie =`${name}=${value};expires=${exp.toUTCString()}`
}

/**
 * 读取cookies
 * @param name
 * @returns defaultValue
 */
export function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
	if (arr = document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}


/**
 * 删除cookies
 * @param name
 */
export function delCookie(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toUTCString();
}
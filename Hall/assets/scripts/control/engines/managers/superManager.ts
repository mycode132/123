/**
 * 管理基类
 */
const { ccclass, property } = cc._decorator;

@ccclass("superManager")
export default class superManager {
  protected className: string = "父管理";

  constructor() {}

  async loadManager(): Promise<boolean> {
    console.log("加载管理", this.className);
    return Promise.resolve(true);
  }

  async onLoadedManager(): Promise<void> {
    console.log("加载完毕", this.className);
    return Promise.resolve();
  }
}

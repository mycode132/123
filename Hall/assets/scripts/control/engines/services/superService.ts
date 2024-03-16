/**
 * 服务基类
 */

const { ccclass, property } = cc._decorator;

@ccclass("superServers")
export default class superService {
  protected className: string = "父服务";

  private m_loaded: boolean = false;

  constructor() {}

  async loadService(): Promise<void> {
    console.log("加载服务", this.className);
    return Promise.resolve();
  }

  async onLoadedService(): Promise<void> {
    console.log("加载完毕", this.className);
    this.m_loaded = true;
    return Promise.resolve();
  }

  isLoaded() {
    return this.m_loaded;
  }
}

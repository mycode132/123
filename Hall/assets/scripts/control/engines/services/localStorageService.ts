
import superService from "./superService";
const { ccclass, property } = cc._decorator;

//本地版本号
export const LOCAL_STORAGE_VERSION: string = "1.0.0.00000001";

@ccclass("localServers")
export class localStorageService extends superService {
  protected className: string = "本地缓存服务";

  protected readonly localGameStorage: string = "local-storage-info";

  constructor() {
    super();
  }

  async loadService(): Promise<void> {
    await super.loadService();
    //
    this.newVersionCheck();
    return Promise.resolve();
  }

  setStorage(key: string, value: string | any, isAppVersionData = true) {
    let k = this.getKey(key, isAppVersionData);
    let v = value;
    cc.sys.localStorage.setItem(k, v);
  }

  getStorage(key: string, isAppVersionData = true): string {
    let k = this.getKey(key, isAppVersionData);
    return cc.sys.localStorage.getItem(k);
  }

  private newVersionCheck() {
    if (!this.isVersionAlso()) {
      this.clearAllStorage();
      this.setLocalVersion(LOCAL_STORAGE_VERSION);
    }
  }

  private getLocalVersion(): string {
    return cc.sys.localStorage.getItem(`localVersion`);
  }

  private setLocalVersion(versionString: string) {
    cc.sys.localStorage.setItem(`localVersion`, versionString);
  }

  private isVersionAlso() {
    return this.getLocalVersion() == LOCAL_STORAGE_VERSION;
  }

  private clearAllStorage() {
    cc.sys.localStorage.clear();
  }

  private getKey(key: string, isAppVersionData): string {
    if (isAppVersionData) {
      return `${LOCAL_STORAGE_VERSION}-${key}`;
    } else {
      return key;
    }
  }
}

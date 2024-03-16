

const {ccclass, property} = cc._decorator;

@ccclass
export default class superModule {
  protected m_className: string = "模块超类";
  //
  private static m_instance: superModule = null;

  //
  constructor() {}

  /**
   * 预先加载
   * */
  async preLoadModules(): Promise<void> {
    console.log("预先加载模块", this.m_className);
    return Promise.resolve();
  }

  /**
   * 加载
   * */
  async loadModule(): Promise<void> {
    console.log("加载模块", this.m_className);
    return Promise.resolve();
  }

  async onLoadedModule(): Promise<void> {
    console.log("加载完毕", this.m_className);
    superModule.m_instance = this;
    return Promise.resolve();
  }

  protected Log(...prams) {
    console.log(`${this.m_className}:---{\n`, ...prams, "\n}");
  }
  protected Warn(...prams) {
    console.warn(`${this.m_className}:---{\n`, ...prams, "\n}");
  }
}

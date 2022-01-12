//loading 拆分出来 单独继承体系
import BaseLoading from "./BaseLoading";
import { ILoadingInstance, ILoadingOptions } from "element-plus/packages/components/loading/src/loading.type";
import { ElLoading } from "element-plus";

export default class ElPlusLoading extends BaseLoading<ILoadingOptions, ILoadingInstance> {
  protected getIsFull(): boolean {
    if (!this.options.target) {
      return true;
    }

    const { target } = this.options;

    return (target instanceof HTMLElement ? target.nodeName : target) === "body";
  }

  protected buildLoading(): ILoadingInstance {
    const inst = ElLoading.service(this.options);
    document.querySelector("body")?.classList.remove("el-loading-parent--relative");
    return inst;
  }

  protected closeLoading(inst?: ILoadingInstance) {
    inst?.close();
  }

  protected upText(text: string, inst?: ILoadingInstance) {
    inst?.setText(text);
  }
}


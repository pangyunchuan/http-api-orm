export default class CancelMan {
    /**
     * 模型标记
     * @private
     */
    private readonly k: string | symbol

    /**
     * 接受一个标记
     * @param k
     */
    constructor(k: string | symbol = 'default') {
        this.k = k
    }

    private static map: Record<string | symbol, AbortController | undefined> = {}

    /**
     * 获取 AbortController.signal
     * 以终止请求
     */
    get signal() {
        let r = CancelMan.map[this.k];
        if (!r) {
            CancelMan.map[this.k] = r = new AbortController();
        }
        return r.signal
    }

    /**
     * 终端当前实例 的 k 对应的请求
     */
    cancel() {
        CancelMan.cancel(this.k)
    }

    /**
     * 中断传入 k 对应的请求
     * @param k
     */
    static cancel(k: string | symbol = 'default') {
        if (k in CancelMan.map) {
            CancelMan.map[k]?.abort();
            delete CancelMan.map[k]
        }
    }
}

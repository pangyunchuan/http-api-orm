export default class CancelMan {
    /**
     * 模型标记
     * @private
     */
    private readonly k;
    /**
     * 接受一个标记
     * @param k
     */
    constructor(k?: string | symbol);
    private static map;
    /**
     * 获取 AbortController.signal
     * 以终止请求
     */
    get signal(): AbortSignal;
    /**
     * 终端当前实例 的 k 对应的请求
     */
    cancel(): void;
    /**
     * 中断传入 k 对应的请求
     * @param k
     */
    static cancel(k?: string | symbol): void;
}

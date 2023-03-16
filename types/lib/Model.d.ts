export default class Model {
    /**
     * 模型数据
     */
    data: Record<string | number, any>;
    /**
     * 保存代理 类
     * @private
     */
    private _proxyData?;
    /**
     * 代理 data 以使用 this 直接访问 data中的数据
     * this.data.a 简化为  this.a
     * 注意 this 同 this.data 有相同键时,优先使用 this
     */
    proxyData(): this & this['data'];
}

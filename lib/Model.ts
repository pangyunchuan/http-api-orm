export default class Model {
    /**
     * 模型数据
     */
    data: Record<string | number, any> = {}
    /**
     * 保存代理 类
     * @private
     */
    private _proxyData?: (Model & Model['data'])

    /**
     * 代理 data 以使用 this 直接访问 data中的数据
     * this.data.a 简化为  this.a
     * 注意 this 同 this.data 有相同键时,优先使用 this
     */
    proxyData(): this & this['data'] {
        if (!this._proxyData) {
            const pd = this._proxyData = new Proxy(this, {
                get(target: Model, p: keyof Model, receiver: any): any {
                    if (p in target) {
                        return target[p]
                    } else if (p in target.data) {
                        if (receiver !== pd) {
                            //让 顶级代理处理来获取data。例vu3 响应式处理
                            return receiver.data[p]
                        }
                        return target.data[p]
                    }
                    return undefined
                },
                set(target: Model, p: keyof Model, newValue: any, receiver: any): boolean {
                    if (p in target) {
                        target[p] = newValue
                    } else if (target.data && p in target.data) {
                        if (receiver !== pd) {
                            //让 顶级代理处理来处理data。例vu3 响应式处理
                            receiver.data[p] = newValue
                        } else {
                            target.data[p] = newValue
                        }
                    }
                    return true
                },
                has(target: Model, p: string | symbol): boolean {
                    return p in target || (target.data && p in target.data)
                }
            }) as any
        }
        return this._proxyData as this & this['data']
    }
}

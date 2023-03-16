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
            this._proxyData = new Proxy(this, {
                get(target: Model, p: string, receiver: any): any {
                    if (p in target) {
                        return (target as any)[p]
                    } else if (p in target.data) {
                        return target.data[p]
                    }
                    return undefined
                },
                set(target: Model, p: string, newValue: any, receiver: any): boolean {
                    if (p in target) {
                        (target as any)[p] = newValue
                    } else if (target.data && p in target.data) {
                        target.data[p] = newValue
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

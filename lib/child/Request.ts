import {AxiosRequestConfig, AxiosResponse} from "axios";
import ApiModel, {ApiFinallyMid, ApiRequestMid, ApiResponseMid} from "../ApiModel";

export default class Request {
    protected readonly apiModel: ApiModel
    /**
     * 是否模型获取数据,仅当此时,才会变更模型 loading状态
     * @private
     */
    private isGetResData = false

    /**
     * @param m
     * @param isGetResData  仅当 模型获取数据时,,回调才有apiModel 会使用loading
     */
    constructor(m: ApiModel, isGetResData = false) {
        this.apiModel = m;
        this.isGetResData = isGetResData
    }

    /**
     * 接口异常信息,在finally 中被传入
     * @protected
     */
    protected error: any | undefined

    isError(v: any): v is Error {
        return typeof v === 'object' && v instanceof Error
    }

    isAxiosConfig(v: any): v is AxiosRequestConfig {
        if (v !== 'object') {
            return false
        }
        for (const k of ['url', 'method', 'params', 'data'] as any[]) {
            if (!(k in v)) {
                return false
            }
        }
        return true
    }

    isAxiosResponse(v: any): v is AxiosResponse {
        if (v !== 'object') {
            return false
        }
        for (const k of ['config', 'status', 'data'] as any[]) {
            if (!(k in v)) {
                return false
            }
        }
        return true
    }

    /**
     * 返回一个函数,接受一个初始Promise 参数;
     * 将接受的回调函数数组使用Promise 以顺序链式执行的
     * @param type  创建的函数要执行 那种promise 回调
     * @param calls 要执行的回调数组
     * @private
     */
    private composeAsync(type: 'then' | 'catch' | 'finally', ...calls: (ApiRequestMid | ApiResponseMid | ApiFinallyMid)[]) {
        return (startPromise: Promise<any>) => {
            return calls.reduce((lastPromise, f) => {
                return (<any>lastPromise[type])((i?: any) => {
                    //获取resData 才传递apiModel
                    return f(type === 'then' ? i : this.error, (this.isGetResData ? this.apiModel : undefined))
                })
            }, startPromise)
        }
    }

    /**
     * 改变loading
     * @param state
     * @private
     */
    private changeLoading(state: boolean) {
        if (!this.isGetResData) {
            return
        }
        this.apiModel.loading = state;
        if (this.apiModel.loadingMan) {
            this.apiModel.loadingMan[state ? 'start' : 'close']()
        }
    }

    /**
     * 获取一个新的配置信息
     * @param c
     * @protected
     */
    protected getConfig(c: AxiosRequestConfig = {}): AxiosRequestConfig {
        return {
            ...this.apiModel.defaultConfig,
            url: this.apiModel.url,
            method: this.apiModel.method,
            params: this.apiModel.params?.transform(),
            data: this.apiModel.postData?.transform(),
            signal: this.apiModel.cancelMan?.signal,
            ...c,
        }
    }

    /**
     * 执行请求
     * @param c
     * @param withForm
     * @private
     */
    private async trueRequest<T = any, R = AxiosResponse<T>, D = any>(c: AxiosRequestConfig = {}, withForm = false): Promise<R> {
        this.error = undefined
        //执行请求中间件
        const req = this.composeAsync('then', ...this.apiModel.reqMid)(
            Promise.resolve(this.getConfig(c))
        ).then(c => {
            const config = c as AxiosRequestConfig
            this.changeLoading(true)
            //执行响应中间件
            let req;
            if (withForm && config.data && config.method) {
                req = this.apiModel.http[`${config.method.toLowerCase()}Form` as 'postForm'](config.url as string, config.data, config)
            } else {
                req = this.apiModel.http.request(config)
            }

            return this.composeAsync('then', ...this.apiModel.resMid)(req);
        }).catch(e => {
            //捕获异常
            this.error = e;
            return Promise.reject(e)
        })

        //执行 finally 中间件
        this.composeAsync('finally', ...this.apiModel.finallyMid)(
            req.finally(() => {
                    this.changeLoading(false)
                }
            )
        )

        return req
    }


    private reqNoData<T = any, R = AxiosResponse<T>, D = any>(url: string, config: AxiosRequestConfig<D> = {}): Promise<R> {
        return this.trueRequest({
            ...config,
            url
        })
    }

    private reqWithData<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config: AxiosRequestConfig<D> = {}): Promise<R> {
        return this.trueRequest(this.getConfig({
            ...config,
            url,
            data,
        }))
    }

    /**
     * 后续 为 同 axios 请求方法
     * @param config
     */
    getUri(config: AxiosRequestConfig = {}) {
        return this.apiModel.http.getUri(this.getConfig(config))
    }

    request<T = any, R = AxiosResponse<T>, D = any>(config?: AxiosRequestConfig<D>): Promise<R> {
        return this.trueRequest(config)
    }

    get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqNoData(url, config)
    }

    delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqNoData(url, config)
    }

    head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqNoData(url, config)
    }

    options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqNoData(url, config)
    }

    post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqWithData(url, data, config)
    }

    put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqWithData(url, data, config)
    }

    patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.reqWithData(url, data, config)
    }

    postForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.trueRequest(this.getConfig({...config, url, data,}), true)
    }

    putForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.trueRequest(this.getConfig({...config, url, data,}), true)
    }

    patchForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R> {
        return this.trueRequest(this.getConfig({...config, url, data,}), true)
    }
}

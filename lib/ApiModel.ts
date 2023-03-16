import Params from "./child/Params";
import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse, Method} from "axios";
import Loading from "./child/Loading";
import Model from "./Model";
import Request from "./child/Request";
import CancelMan from "./child/CancelMan";

export type ApiRequestMid<This extends ApiModel = ApiModel> = (c: AxiosRequestConfig, m?: This) => AxiosRequestConfig | Promise<AxiosRequestConfig>
export type ApiResponseMid<This extends ApiModel = ApiModel> = (r: AxiosResponse, m?: This) => AxiosResponse | Promise<AxiosResponse>
export type ApiFinallyMid<This extends ApiModel = ApiModel> = (error?: any, m?: This) => void | Promise<void>

export default class ApiModel extends Model {
    /**
     * axios 实例，通常不用配置
     */
    http: AxiosInstance = axios.create()
    /**
     * 请求地址
     */
    url: string = ''
    /**
     * 请求方法
     */
    method: Method = 'get'
    /**
     * 静态属性，用于保存设置的默认配置，
     * @protected
     */
    protected static _defaultConfig: AxiosRequestConfig = {}
    /**
     * 获取默认配置,可修改
     */
    get defaultConfig(): AxiosRequestConfig {
        return (this.constructor as typeof ApiModel)._defaultConfig;
    }

    /**
     * 清空默认配置
     */
    clearDefaultConfig() {
        (this.constructor as typeof ApiModel)._defaultConfig = {};
    }

    /**
     * get 参数
     */
    params: Params|ReturnType<Params['proxyData']> = new Params(() => ({}))
    /**
     * post请求 data.header中的 data部分
     */
    postData: Params|ReturnType<Params['proxyData']> = new Params(() => ({}))
    /**
     * 中断请求管理
     */
    cancelMan?: CancelMan
    /**
     * 模型请求状态,是否加载中
     */
    loading: boolean = false
    /**
     * loading控制器,用于控制展示loading效果
     */
    loadingMan?: Loading<any, any>
    /**
     * 请求前拦截，异常或reject 将 跳到 finallyMid
     */
    reqMid: ApiRequestMid[] = []
    /**
     * 请求成功拦截,异常或reject 将 跳到 finallyMid
     */
    resMid: ApiResponseMid[] = []
    /**
     * 请求结束拦截，无论成功失败
     */
    finallyMid: ApiFinallyMid[] = []

    /**
     * 响应数据,模型数据
     */
    data: Record<string | number, any> = {}

    /**
     * 请求类,类似于 axios。用于在模型中发起一些简单的请求  request.get()
     */
    readonly request: Request

    constructor() {
        super();
        this.request = new Request(this)
    }

    /**
     * 获取模型数据，
     * 由于不同项目接口格式不一致，需自行定义如何获取.如  this.data = response.data.content
     * 建议放在resMid 中。
     * @param c
     */
    async getResData(c?: AxiosRequestConfig) {
        return (new Request(this, true)).request({
            ...this.defaultConfig,
            ...c,
            url: this.url,
            method: this.method,
            params: this.params?.transform(),
            data: this.postData?.transform(),
            signal: this.cancelMan?.signal
        })
    }

    /**
     * 基于当前类新建一个模型实例
     * 使用传入参数覆盖默认值
     * 用于复杂程度中等的接口
     * @param c
     */
    createNew<C extends Partial<Pick<this, 'http' | 'url' | 'method' | 'cancelMan' | 'loadingMan' | 'reqMid' | 'resMid' | 'finallyMid'>
        & { params: Params|ReturnType<Params['proxyData']>, postData: Params|ReturnType<Params['proxyData']>, data: Record<string | number, any> }>>(c: C): Omit<this, keyof C> & C {
        const t = new (this.constructor as any) as any
        for (const k in this) {
            if (k in c) {
                t[k] = (c as any)[k]
            }
        }

        return t
    }

    /**
     * 基于当前类新建一个模型实例,并代理访问 data
     * 使用传入参数覆盖默认值
     * 用于复杂程度中等的接口
     * @param c
     */
    createNewProxyData<C extends Partial<Pick<this, 'http' | 'url' | 'method' | 'cancelMan' | 'loadingMan' | 'reqMid' | 'resMid' | 'finallyMid'>
        & { params: Params|ReturnType<Params['proxyData']>, postData: Params|ReturnType<Params['proxyData']>, data: Record<string | number, any> }>>(
        c: C
    ): Omit<this, keyof C> & C & (Omit<this, keyof C> & C)['data'] {
        const t = new (this.constructor as any) as any

        for (const k in this) {
            if (k in c) {
                t[k] = (c as any)[k]
            }
        }

        const p = (t as this).proxyData()

        return p as any
    }
}

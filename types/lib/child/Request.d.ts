import { AxiosRequestConfig, AxiosResponse } from "axios";
import ApiModel from "../ApiModel";
export default class Request {
    protected readonly apiModel: ApiModel;
    /**
     * 是否模型获取数据,仅当此时,才会变更模型 loading状态
     * @private
     */
    private isGetResData;
    /**
     * @param m
     * @param isGetResData  仅当 模型获取数据时,,回调才有apiModel 会使用loading
     */
    constructor(m: ApiModel, isGetResData?: boolean);
    /**
     * 接口异常信息,在finally 中被传入
     * @protected
     */
    protected error: any | undefined;
    isError(v: any): v is Error;
    isAxiosConfig(v: any): v is AxiosRequestConfig;
    isAxiosResponse(v: any): v is AxiosResponse;
    /**
     * 返回一个函数,接受一个初始Promise 参数;
     * 将接受的回调函数数组使用Promise 以顺序链式执行的
     * @param type  创建的函数要执行 那种promise 回调
     * @param calls 要执行的回调数组
     * @private
     */
    private composeAsync;
    /**
     * 改变loading
     * @param state
     * @private
     */
    private changeLoading;
    /**
     * 获取一个新的配置信息
     * @param c
     * @protected
     */
    protected getConfig(c?: AxiosRequestConfig): AxiosRequestConfig;
    /**
     * 执行请求
     * @param c
     * @param withForm
     * @private
     */
    private trueRequest;
    private reqNoData;
    private reqWithData;
    /**
     * 后续 为 同 axios 请求方法
     * @param config
     */
    getUri(config?: AxiosRequestConfig): string;
    request<T = any, R = AxiosResponse<T>, D = any>(config?: AxiosRequestConfig<D>): Promise<R>;
    get<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    delete<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    head<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    options<T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
    post<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    put<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patch<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    postForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    putForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
    patchForm<T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
}

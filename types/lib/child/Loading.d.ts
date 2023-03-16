/// <reference types="lodash" />
import { DebouncedFunc } from "lodash-es/debounce";
declare type ApiOption = {
    /**
     * 开始延时时间,毫秒,默认 500
     */
    delayStartMs: number;
    /**
     * 结束延时时间,毫秒 默认 300
     */
    delayCloseMs: number;
};
export default class Loading<Inst, Option extends Record<string, any>> {
    /**
     * 开始方法
     * @protected
     */
    protected waitStart: DebouncedFunc<any>;
    /**
     * 结束方法
     * @protected
     */
    protected waitClose: DebouncedFunc<any>;
    /**
     * 加载实例,可能存在
     * @protected
     */
    protected inst?: any;
    /**
     * 创建一个加载控制器
     * @param getInstAndStartCall   获取加载实例,并开始加载的回调函数
     * @param closeCall              关闭加载的回调函数
     * @param option     选项
     */
    constructor(getInstAndStartCall: (o: Option) => Inst, closeCall: (c: Inst) => void, option?: ApiOption);
    /**
     * 开始加载
     */
    start(): void;
    /**
     * 关闭加载
     */
    close(): void;
    /**
     * 加载配置,
     * @protected
     */
    protected option: Option;
    /**
     * 设置加载配置
     * @param o
     */
    setOption(o: Option): void;
}
export {};

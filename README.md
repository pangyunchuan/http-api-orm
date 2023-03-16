## 安装

``` 
安装
npm install
```

## 简要说明

```text
一个ts的对于api的orm。
参考数据库orm，将一个接口视为一个模型，底层使用axios发起请求。虽然通常一组接口对应一张表。但由于接口的性质，也只能如此了。

主要提供一个 ApiModel 类，用于配置请求配置，管理响应数据，配置拦截器中间件（同axios，但会按顺序执行，可拆分处理逻辑）。

```

## 注意问题
```typescript
import ApiModel, {Params} from "http-api-orm";
import {reactive, watch, watchEffect} from "vue";

// 假定接口返回数据格式为
const apiInfo = {
    //1 成功
    status: 1,
    msg: '成功',
    //content 为 数据内容 任意格式
    content: {}
}

class MyApiModel extends ApiModel {
    params = new Params(() => ({
        id: '',
        detail: true
    })).proxyData()
    data = {
        hasChildren: true,
        id: "",
        level: 0,
        name: "",
        note: "",
        org: 0,
        pid: "",
        state: 0,
    }
    test(){
        //建议使用 proxy 都使用
        const proxy = this.proxyData()
        //代理访问
        proxy.pid = '4555'
    }
}

//vue3 中使用  reactive 注意 as 类型,以避免 传入 子组件时,类型异常
const api1 = reactive(new MyApiModel()) as MyApiModel;
//代理访问类型
const apiProxy = reactive(new MyApiModel().proxyData()) as ReturnType<MyApiModel['proxyData']>;


//代理访问数据时,,仅能触发代理访问数据观察
function proxyTest(){
    setTimeout(()=>{
        apiProxy.pid = '123'
    },1000)

    watch(()=>apiProxy,()=>{
        //会触发
        console.log('proxyDeep',apiProxy)
    },{deep:true})
    watchEffect(()=>{
        //不会触发  需要 apiProxy.data.pid = '123'
        console.log('proxy',apiProxy.data)
    })

    watchEffect(()=>{
        //会触发,且  apiProxy.pid = '123'  即使值不改变,也会重复触发。
        console.log('proxy',apiProxy.pid)
    })

    watchEffect(()=>{
        //不会触发
        console.log('noProxy',apiProxy.pid)
    })
}
```

## 基础使用

```typescript
import ApiModel, {Params} from "http-api-orm";
import type {ApiResponseMid} from "http-api-orm/types/lib/ApiModel";
import {reactive} from "vue";

// 假定接口返回数据格式为
const apiInfo = {
    //1 成功
    status: 1,
    msg: '成功',
    //content 为 数据内容 任意格式
    content: {}
}

class MyApiModel extends ApiModel {
    params = new Params(() => ({
        id: '',
        detail: true
    })).proxyData()
    data = {
        hasChildren: true,
        id: "",
        level: 0,
        name: "",
        note: "",
        org: 0,
        pid: "",
        state: 0,
    }
}

const api1 = new MyApiModel();

//设置参数
apiM.params.id = '123'

apiM.getResData().then(r => {
//    此时 r为 axios 响应 AxiosResponse
//    此时直接使用 apiM.resData
    console.log(apiM.data.name)
})

//模型代理数据
const apiProxyData = new MyApiModel().proxyData();
//相当于  console.log(apiProxyData.data.name)
console.log(apiProxyData.name)
```

## ApiModel 配置 查看 类型文件,有详细注释

## 基础使用

```typescript
import ApiModel, {Params} from "http-api-orm";

export default class MyApiModel extends ApiModel {
    url = '/xx/xx'
    //method 默认 get
    // method = 'get'
    //请求get参数,
    params = new Params(() => ({
        id: '',
        detail: true
    }))
    //post参数 且  代理访问 数据
    postData = new Params(() => ({
        postId: '',
        postDetail: true
    })).proxyData()
}

const apiM = new MyApiModel();
//vue3 使用,可作为响应式对象
// const apiM = reactive(new MyApiModel()) as MyApiModel;

//设置参数
apiM.params.data.id = '123'

//设置代理后,可跳过直接访问data中的数据
apiM.postData.postId = 'post'

apiM.getResData().then(r => {
//    此时 r为 axios 响应 AxiosResponse
})

```

## 使用模型数据

```typescript
import ApiModel, {Params} from "http-api-orm";
import type {ApiResponseMid} from "http-api-orm/types/lib/ApiModel";

// 假定接口返回数据格式为
const apiInfo = {
    //1 成功
    status: 1,
    msg: '成功',
    //content 为 数据内容 任意格式
    content: {}
}

export default class MyApiModel extends ApiModel {
    url = '/xx/xx'
    params = new Params(() => ({
        id: '',
        detail: true
    })).proxyData()
    data = {
        hasChildren: true,
        id: "",
        level: 0,
        name: "",
        note: "",
        org: 0,
        pid: "",
        state: 0,
    }
    //如何接受 响应数据,由于各种项目 接口格式不一致,自行配置,假定接口正确
    resMid: ApiResponseMid[] = [
        function (r, m) {
            if (m) {
                m.data = r.data.content
            }
            return r
        }
    ]
}

const apiM = new MyApiModel();

//设置参数
apiM.params.id = '123'

apiM.getResData().then(r => {
//    此时 r为 axios 响应 AxiosResponse
//    此时直接使用 apiM.resData
    console.log(apiM.data.name)
})

//模型代理数据
const apiProxyData = new MyApiModel().proxyData();
//相当于  console.log(apiProxyData.data.name)
console.log(apiProxyData.name)




```

## 使用loading

```tsx
//方案一  指令方式
import ApiModel, {Params} from "http-api-orm";
import {reactive} from "vue";

//以 vue 3为例
const tsx =
    <template>
        {/*api.loading 会根据请求自动切换是否加载中 */}
        <el-table v-loading={api1.loading}>
            <!--  any-->
        </el-table>
    </template>


class MyApiModel extends ApiModel {
    url = '/xx/xx'
    params = new Params(() => ({
        id: '',
        detail: true
    })).proxyData()
}

//设置响应式
const api1 = reactive(new MyApiModel()) as MyApiModel;

//设置参数
api1.params.id = '123'

api1.getResData().then(r => {
//    此时 r为 axios 响应 AxiosResponse
})


//方案2  调用方法式
import ApiModel, {Loading, Params} from "http-api-orm";
import {reactive} from "vue";
import {ElLoading} from "element-plus";
import {LoadingInstance} from "element-plus/es/components/loading/src/loading";
import {LoadingOptions} from "element-plus/es/components/loading/src/types";

class MyApiLoadingModel extends ApiModel {
    url = '/xx/xx'
    params = new Params(() => ({
        id: '',
        detail: true
    })).proxyData()
    loadingMan = new Loading<LoadingInstance, LoadingOptions>(function (o) {
        //如何开始loading 并返回 实例,如果存在
        return ElLoading.service(o)
    }, function (inst) {
        //如何关闭loading inst 为 可能存在的 loading实例
        inst?.close();
    }, {
        //配置请求发起后延迟多开始loading
        delayStartMs: 1000,
        //配置请求结束延迟多关闭loading
        delayCloseMs: 1000
    })
}

const api2 = reactive(new MyApiLoadingModel()).proxyData() as ReturnType<MyApiLoadingModel['proxyData']>;

//设置参数
api2.params.id = '123'

api2.getResData().then(r => {
//    此时 r为 axios 响应 AxiosResponse
})


```

## 取消请求

```typescript
import ApiModel, {CancelMan,  Params} from "http-api-orm";
import {reactive} from "vue";

export default class MyApiLoadingModel extends ApiModel {
    url = '/xx/xx'
    params = new Params(() => ({
        id: '',
        detail: true
    }))
    //未配置的无法中断请求
    //取消请求控制器,默认 标记 default   可传入 symbol 作为唯一标记
    cancelMan = new CancelMan('default')
}

const api = reactive(new MyApiLoadingModel()) as MyApiLoadingModel;

//设置参数
api.params.data.id = '123'

api.getResData().then(r => {
})

//取消请求  标记固定为 创建时传入的,,使用symbol 创建时,仅使用实例可以取消
api.cancelMan.cancel()
// 取消给定标记的 所有请求，不传默认 default
CancelMan.cancel()
```



## axios 默认配置

```typescript
import ApiModel from "http-api-orm";
import type {AxiosRequestConfig}from "axios";
export default class MyApiLoadingModel extends ApiModel {
    //要从此类开始,启用一个新的默认配置
    protected static _defaultConfig: AxiosRequestConfig = {}

    constructor() {
        super();
        //通过defaultConfig 设置的axios 请求信息,会在所有模型中使用,,存储在静态变量中
        this.defaultConfig.headers = this.defaultConfig.headers ?? {}
        this.defaultConfig.headers.token = 'xxx'
        //清空默认配置
        this.clearDefaultConfig()
    }
}
```


## 拦截器,中间件说明

```typescript
import ApiModel from "http-api-orm";
import axios from "axios";
import type {ApiFinallyMid, ApiRequestMid, ApiResponseMid} from "http-api-orm/types/lib/ApiModel";
// 假定接口返回数据格式为
const apiInfo = {
    //1 成功
    status: 1,
    msg: '成功',
    //content 为 数据内容 任意格式
    content: {}
}
export default class MyApiModel extends ApiModel {
    //请求前处理
    reqMid: (ApiRequestMid)[] = [
        function (c, m) {
            console.log('reqMid1', m?.loading)
            //若此处 抛出异常 或 reject 将跳过 后续 reqMid 和 resMid 进入 finallyMid
            // throw new Error()
            // return Promise.reject('')
            // m?.cancelMan?.cancel()
            return c
        },
        function (c, m) {
            console.log('reqMid2')
            return c
        },
    ]
    //响应处理
    resMid: ApiResponseMid[] = [
        function (r, m) {
            console.log('resMid1', m?.loading)
            //若此处 抛出异常 或 reject 将跳过 后续 resMid  进入 finallyMid
            // throw new Error()
            // return Promise.reject('')
            return r
        },
        function (r, m) {
            console.log('resMid2', m?.loading)
            if (r.status === 200 && r.data.status === 1) {
                if (m) {
                    //模型数据如何获取
                    m.data = r.data.content
                }
            } else {
                //格式不正确,返回异常
                //可在此处展示发起提示
                return Promise.reject(r.data.msg)
            }
            return r
        },
    ]
    //结束处理, 同 promise.finally
    finallyMid: ApiFinallyMid[] = [
        function (e, m) {
            console.log('f', 'isCancel', m?.loading)
            //若此处 抛出异常 或 reject 仍然会执行后续方法
            // throw new Error()
            // return Promise.reject('')
            if (axios.isCancel(e)) {
                console.log('isCancel', e)
            }
        },
        function (e, m) {
            console.log('f', 'isAxiosError')
            if (axios.isAxiosError(e)) {
                console.log('isAxiosError', e)
            }
            return e
        },
        function (e, m) {
            console.log('f', 'isError')
            if (m?.request.isError(e)) {
                console.log('error', e)
            }
        },
        function (e, m) {
            console.log('f', 'isAxiosResponse')
            if (m?.request.isAxiosResponse(e)) {
                console.log('isAxiosResponse', e)
            }
        },
    ]
}


```

## 中等复杂度请求与简单请求

```typescript
import ApiModel, {Params} from "http-api-orm";
// 假定接口返回数据格式为
const apiInfo = {
    //1 成功
    status: 1,
    msg: '成功',
    //content 为 数据内容 任意格式
    content: {}
}
export default class MyApiModel extends ApiModel {
    //中等复杂度请求
    list() {
        // 不代理 访问数据
        // return this.createNew()

        //根据当前实例创建一个新的实例,但使用传入的参数替换 原有的参数,并获得类型支持
        //代理访问数据
        return this.createNewProxyData({
                url: '/xxx/list',
                params: new Params(() => ({page: 1, pageSize: 20, stauts: 0})),
                data: {total: 0, list: [] as any[]}
            }
        )
    }

    //简单请求,修改局部数据
    changeState(s: boolean) {
        //此时传入的配置优先级最高  此时传入 url 会使用 url
        //而 getResData 时,模型配置的参数优先级最高   此时  此时传入 url 仍会使用 this.url
        return this.request.post('/xx/xx', {id: this.data.id, state: s}, {})
    }
}


```



## 完整模型示例

```typescript
import ApiModel, {CancelMan, Loading, Params} from "http-api-orm";
import axios, {Method} from "axios";
import type {AxiosRequestConfig, AxiosInstance} from "axios";
import type {ApiFinallyMid, ApiRequestMid, ApiResponseMid} from "http-api-orm/types/lib/ApiModel";
import {ElLoading} from "element-plus";
import type {LoadingInstance} from "element-plus/es/components/loading/src/loading";
import type {LoadingOptions} from "element-plus/es/components/loading/src/types";
// 假定接口返回数据格式为
const apiInfo = {
    //1 成功
    status: 1,
    msg: '成功',
    //content 为 数据内容 任意格式
    content: {}
}
//参数复杂，模型数据复杂，操作逻辑复杂的情况下，应当新建一个模型。
//较为简单的请求，可以使用 request 直接请求。
export default class UserModel extends ApiModel {
    //响应数据
    // resData: any
    //定义一个 axios实例,可选的
    http: AxiosInstance = axios.create()
    //接口地址 可选的,默认 ''
    url = '/user/detail';
    //默认 get
    method: Method = 'post';
    //默认配置,静态,,此处定义,则 从让后代使用一个新的默认配置   在实例中使用 defaultConfig 获取配置
    protected static _defaultConfig: AxiosRequestConfig = {}

    // get 请求参数 可选
    params = new Params(() => ({id: ''}))
    // post 请求参数 可选
    postData = new Params(() => ({}))
    //未配置的无法中断请求
    //取消请求控制器,默认 标记 default   可传入 symbol 作为唯一标记
    cancelMan = new CancelMan('default')

    //接口状态 是否请求中
    // loading: boolean = false

    //请求管理配置
    loadingMan = new Loading<LoadingInstance, LoadingOptions>(function (o) {
        //如何开始loading 并返回 实例,如果存在
        return ElLoading.service(o)
    }, function (inst) {
        //如何关闭loading inst 为 可能存在的 loading实例
        inst?.close();
    }, {
        //配置请求发起后延迟多开始loading
        delayStartMs: 1000,
        //配置请求结束延迟多关闭loading
        delayCloseMs: 1000
    })


    //请求前处理
    reqMid: (ApiRequestMid)[] = [
        function (c, m) {
            console.log('reqMid1', m?.loading)
            //若此处 抛出异常 或 reject 将跳过 后续 reqMid 和 resMid 进入 finallyMid
            // throw new Error()
            // return Promise.reject('')
            // m?.cancelMan?.cancel()
            return c
        },
        function (c, m) {
            console.log('reqMid2')
            return c
        },
    ]
    //响应处理
    resMid: ApiResponseMid[] = [
        function (response, m) {
            console.log('resMid1', m?.loading)
            //若此处 抛出异常 或 reject 将跳过 后续 resMid  进入 finallyMid
            // throw new Error()
            // return Promise.reject('')

            if (response.config.responseType === 'blob') {
                //假设本项目下载文件处理为此.下载文件不应担作为 getResData
                let aTag = document.createElement("a");
                aTag.download = decodeURIComponent(
                    response.headers["content-disposition"]
                ).substring(20);
                aTag.href = URL.createObjectURL(response.data);
                aTag.click();
                URL.revokeObjectURL(response.data);
            }

            return response
        },
        function (r, m) {
            console.log('resMid2', m?.loading)
            if (r.status === 200 && r.data.status === 1) {
                if (m) {
                    //模型数据如何获取
                    m.data = r.data.content
                }
            } else {
                //格式不正确,返回异常
                //可在此处展示发起提示
                return Promise.reject(r)
            }
            return r
        },
    ]
    //结束处理, 同 promise.finally
    finallyMid: ApiFinallyMid[] = [
        function (e, m) {
            console.log('f', 'isCancel', m?.loading)
            //若此处 抛出异常 或 reject 仍然会执行后续方法
            // throw new Error()
            // return Promise.reject('')
            if (axios.isCancel(e)) {
                console.log('isCancel', e)
            }
        },
        function (e, m) {
            console.log('f', 'isAxiosError')
            if (axios.isAxiosError(e)) {
                console.log('isAxiosError', e)
            }
            return e
        },
        function (e, m) {
            console.log('f', 'isError')
            if (m?.request.isError(e)) {
                console.log('error', e)
            }
        },
        function (e, m) {
            console.log('f', 'isAxiosResponse')
            if (m?.request.isAxiosResponse(e)) {
                console.log('isAxiosResponse', e)
            }
        },
    ]

    //模型数据
    data = {
        id: "",
        name: "",
        //0 禁用,1 正常
        state: 0 as 0 | 1,
        createTime: undefined,
        //会员等级,0-4
        vipLevel: 0 as 0 | 1 | 2 | 3 | 4,
        note: "",
        org: 0,
    }

    //会员名称
    get vipName() {
        return {
            0: '无',
            1: '初级会员',
            2: '中级会员',
            3: '超级会员',
            4: '黑卡会员',
        }[this.data.vipLevel]
    }

    //获取用户列表，这里加入，列表和详情数据一致，列表请求参数也简单，可以使用一个模型
    getList() {
        // 相当于  return  new UserModel()  但参数使用传入的参数,,快速创建了一个接口模型
        return this.createNew({
            //这里选项,同 ApiModel 配置项
            url: '/user/list',
            params: new Params(() => ({a: 1})).proxyData()
        })
    }

    //保存信息
    save() {
        return this.request.post('/user/save', this.data)
    }


    //修改局部数据
    saveState(s: boolean) {
        return this.request.post('/xx/xx', {id: this.data.id, state: s}, {})
    }

    //下载
    down(c: AxiosRequestConfig) {
        return this.request.request({
            ...c,
            responseType: 'blob',
        })
    }

//    更多其他模型操作
}


```



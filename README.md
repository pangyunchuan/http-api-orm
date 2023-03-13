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

## 基础使用

```typescript
import ApiModel from "http-api-orm";

class MyApiModel extends ApiModel {
    url = 'xxx/1.json'
}

const f = new MyApiModel()
f.getResData().then(() => {
//    
})
```

## ApiModel 配置说明

|  字段   | 说明  |
|  ----  | ----  |
| url  | 请求地址 |
| http  | axios实例，默认创建一个 |
| defaultConfig  | 模型的axios默认配置 |
| params  | 请求的get参数 |
| data  | 请求的data参数 |
| resData  | 模型数据也是请求响应数据 |
| cancelMan  | 可选的,请求终止管理类 |
| loading  | 接口loading控制 |
| reqMid  | 请求中间件 |
| resMid  | 响应中间件 |
| finallyMid  | 请求结束中间件(无论成功失败,若有异常信息,或记录在 request.error 中) |
| request  | 请求类,只读 |

## 完整配置使用说明

```typescript
import ApiModel, {CancelMan, Params} from "http-api-orm";
import axios, {AxiosResponse, AxiosRequestConfig} from "axios";
import {ApiFinallyMid, ApiRequestMid, ApiResponseMid} from "http-api-orm/types/lib/ApiModel";

export default class MyApiModel extends ApiModel {
    url = '/xx/xx'
    //请求get参数,
    params = new Params(() => ({
        id: '',
        detail: true
    }))
    resData = {
        hasChildren: true,
        id: "",
        level: 0,
        name: "",
        note: "",
        org: 0,
        pid: "",
        state: 0,
    }
    loading = false
    cancelMan = new CancelMan()

    //请求前处理
    reqMid: (ApiRequestMid)[] = [
        function (m, c) {
            console.log('reqMid1', m.loading)
            //若此处 抛出异常 或 reject 将跳过 后续 reqMid 和 resMid 进入 finallyMid
            // throw new Error()
            // return Promise.reject('')
            // m.cancelMan?.cancel()
            return c
        },
        function (m, c) {
            console.log('reqMid2')
            return c
        },
    ]
    //请求响应处理
    resMid: ApiResponseMid[] = [
        function (m, c) {
            console.log('resMid1', m.loading)
            //若此处 抛出异常 或 reject 将跳过 后续 resMid  进入 finallyMid
            // throw new Error()
            // return Promise.reject('')
            return c
        },
        function (m, c) {
            console.log('resMid2', m.loading)
            return c
        },
    ]
    //请求结束处理
    finallyMid: ApiFinallyMid[] = [
        function (m, c) {
            console.log('f', 'isCancel', m.loading)
            //若此处 抛出异常 或 reject 仍然会执行后续方法
            // throw new Error()
            // return Promise.reject('')
            if (axios.isCancel(c)) {
                console.log('isCancel', c)
            }
        },
        function (m, c) {
            console.log('f', 'isAxiosError')
            if (axios.isAxiosError(c)) {
                console.log('isAxiosError', c)
            }
            return c
        },
        function (m, c) {
            console.log('f', 'isError')
            if (m.request.isError(c)) {
                console.log('error', c)
            }
        },
        function (m, c) {
            console.log('f', 'isAxiosResponse')
            if (m.request.isAxiosResponse(c)) {
                console.log('isAxiosResponse', c)
            }
        },
    ]


    getResData(c?: AxiosRequestConfig) {
        return super.getResData(c).then((abc) => {
            this.resData = abc.data;
            return abc
        });
    }

    //局部请求,避免某些简单接口也要创建一个模型
    changeState() {
        //修改模型的某个属性到远端
        let state = this.resData.state
        state = !state ? 1 : 0;
        //这里会使用模型的 中间件
        return this.request.post('/xx/change', {state}).then((abc) => {
            this.resData.state = state
            return abc;
        });
    }
}

const apiM = new MyApiModel()

apiM.getResData()

```



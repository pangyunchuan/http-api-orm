import {RequestModel} from "layer-app";

interface IDemo {
    id: string;
    name: string;
    demoField: string,
    modelAttr: string;
    relationData?: IRelationData
}

//关联模型数据
interface IRelationData {
    demoId: string,
    id: string,
    name: string,
}

// 通过 reqOne reqMany等方法 得到模型会代理 data
//手动实例的模型,需要自己代理,,   (new DemoModel).id 无法访问,  (new DemoModel).proxyData().id 可以访问
export default class DemoModel extends RequestModel<IDemo> {
    //模型数据   data 中的数据,可通过 模型直接访问
    // 也是 (new DemoModel()).id; 结果为 id
    protected data: IDemo = {
        id: "id", name: "", demoField: '11', modelAttr: 'data'
    };

    get modelAttr() {
        // 模型自身属性名 与 data 中的属性名相同时,优先访问自身属性 也就是
        // (new DemoModel()).modelAttr  结果为  demoModel  而不是  data
        return 'demoModel'
    }

    //关系模型 使用展示
    relationOne: RelationDataModel & IRelationData | undefined

    //初始化, 展示关系模型如何实例
    protected init() {
        const relationData = this.data.relationData
        if (relationData) {
            this.relationOne = new RelationDataModel().createModel(relationData, (model) => {
                // model.demoId
            })
            // this.relationOne.demoId
        }
    }


    //单个模型请求
    // 建议在模型 静态异步方法中完成接口请求
    // 实例方法中,扩展模型内容。
    //结果为 demoModel
    static async find(id: string) {
        // this.create()
        const url = "/tt/234";
        //reqOne 参数说明
        // Model 模型类(未实例),类似接口第一个参数都是这
        // call 回调函数,参数都是 模型实例,可用户完成一些模型实例的后置操作,所有类似操作都有这个参数
        return this.setReq(this.newReq().setLoading().setGet('')).reqOne().then(rr => {
            rr.test()
        })
        // return this.newReq().setLoading().setGet(url, {id}).reqOne(
        //     this, (demoModel) => {
        //         demoModel.init()
        //     });
    }

    static async test() {
        // this.setReq(this.newReq().setLoading().setGet('')).reqOne().then(rr=>{rr.demoField})
        this.setReq(this.newReq()).reqOne().then(re => {

        })
        return this.setReq(this.newReq()).reqOne()
    }

    async test() {
        return DemoModel.setReq(this.newReq()).reqOneOther<{ tt: any, tt1: string }, 'tt'>
        ('tt', (inst) => {
            inst.test()
        })
        // return this.setReq(this.newReq()).reqOne((inst) => {
        //     inst.init()
        // })/*.then(rr => {
        //     rr.test()
        // })*/
    }


    // 结果 为  { test:number,model:demoModel  }
    static async findWithOther(
        params: Required<Pick<IDemo, "id">>
    ) {
        const url = "/demoapi/tt/t1";
        //reqOneOther 参数说明
        // Model  介绍已有
        // dataKey 模型数据所在key ,比如这里的 mdata  为模型数据的键名,这种情况必须指明
        // call 介绍有
        return this.setReq(this.newReq().setLoading().setGet(url, params))
            .reqOneOther<{ mdata: object, test: number }, "mdata">('mdata')
        // this.newReq().setLoading().setGet(url, params)
        //     .reqOneOther<{ mdata: object, test: number }, "mdata", DemoModel>(this, "mdata");
    }

    // 结果 为  demoModel[]  模型数组
    static async get() {
        const url = "/demoapi/tet1/1234";
        //reqMany 与 reqOne 参数一致
        return this.setReq(this.newReq().setLoading().setGet(url)).reqMany()
        // return this.newReq().setLoading().setGet(url).reqMany(this);
    }

    ttttt() {
        const url = "/demoapi/test/444";
        return DemoModel.setReq(this.newReq().setLoading().setGet(url))
            .reqManyOther<{ mdata: object, ss: string }, "mdata">('mdata')
    }


    // 结果 为  { ss:string,models:demoModel[]  }
    static async getWithOther() {
        const url = "/demoapi/test/444";
        //reqManyOther 与 reqOneOther 参数一致
        return this.setReq(this.newReq().setLoading().setGet(url))
            .reqManyOther<{ mdata: object, ss: string }, "mdata">('mdata')
        // return this.newReq().setLoading().setGet(url)
        //     .reqManyOther<{ mdata: object, ss: string }, "mdata", DemoModel>(
        //         this, "mdata");
    }
}
DemoModel.test().then(rr => {
    rr.test()
})
new DemoModel().test().then(re => {
    re.model.test()
})
DemoModel.getWithOther().then(r => {
    r.models[0].test()
})

const data: IDemo = {
    id: "id", name: "", demoField: '11', modelAttr: 'data'
};
DemoModel.createModel().demoField;
// dd.demoField
(new DemoModel).createModel().demoField;
const cc = DemoModel.createModel(data)
cc.demoField

//关系模型,不会从接口获取数据
class RelationDataModel extends RequestModel<IRelationData> {
    protected data: IRelationData = {
        demoId: '', id: '', name: ''
    }
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import axios from "axios";
import { omit, debounce } from "lodash-es";
class BaseModel {
  constructor() {
    __publicField(this, "_dataType", {});
    __publicField(this, "isProxyData", false);
  }
  proxyData() {
    if (this.isProxyData) {
      return this;
    }
    this.isProxyData = true;
    return new Proxy(this, {
      get(target, p) {
        if (p in target) {
          return target[p];
        }
        if (target.data) {
          return target.data[p];
        }
        return void 0;
      },
      set(target, p, value) {
        if (p in target) {
          target[p] = value;
          return true;
        }
        if (target.data && p in target.data) {
          target.data[p] = value;
          return true;
        }
        return true;
      },
      has(target, p) {
        return p in target || target.data && p in target.data;
      }
    });
  }
}
let requestMap = {};
function getRequestMap() {
  return requestMap;
}
function setRequestMap(map) {
  requestMap = map;
}
let loadingMap = {};
function getLoadingMap() {
  return loadingMap;
}
function setLoadingMap(map) {
  loadingMap = map;
}
let loadingConfig = {
  use: true
};
function setLoadingConfig(config) {
  loadingConfig = __spreadValues(__spreadValues({}, loadingConfig), config);
}
class RequestModel extends BaseModel {
  constructor() {
    super(...arguments);
    __publicField(this, "useLoading", loadingConfig.use);
  }
  static newReq(reqType = "default") {
    const self = new this();
    return self.newReq(reqType);
  }
  newReq(reqType = "default") {
    const reqMap = getRequestMap();
    const reqClass = new reqMap[reqType]();
    if (!reqClass) {
      throw new Error(`${reqType} \u8BF7\u6C42\u7C7B \u4E0D\u5B58\u5728`);
    }
    return reqClass.setModel(this).setUseLoading(this.useLoading);
  }
  newFromReq(Model, data, call) {
    const model = new Model().proxyData();
    model.data = data;
    call && call(model);
    return model;
  }
}
const _BaseRequest = class {
  constructor() {
    __publicField(this, "config", {});
    __publicField(this, "response");
    __publicField(this, "error");
  }
  setCancel() {
    let { config } = this;
    if (config.cancelMark === "") {
      return;
    }
    let mark;
    config.cancelMark = mark = config.cancelMark || "default";
    let { cancelMapByMark: map } = _BaseRequest;
    let cancelSource = map[mark] = map[mark] || axios.CancelToken.source();
    config.cancelToken = cancelSource.token;
  }
  static cancelByMark(mark) {
    let { cancelMapByMark: map } = _BaseRequest;
    if (!map[mark]) {
      return;
    }
    map[mark].cancel();
    delete map[mark];
  }
  request(config = {}) {
    this.config = __spreadValues(__spreadValues({}, this.config), config);
    this.requestHandle();
    this.setCancel();
    return axios.request(this.config).then((response) => {
      this.response = response;
      return this.responseHandle();
    }).catch((error) => {
      this.error = error;
      throw this.errorHandle();
    });
  }
  setGet(url, params = {}, config = {}) {
    this.config = __spreadValues(__spreadProps(__spreadValues({}, this.config), { url, params }), config);
    return this;
  }
  setPost(url, data = {}, params = {}, config = {}) {
    this.config = __spreadValues(__spreadProps(__spreadValues({}, this.config), { url, data, params }), config);
    return this;
  }
  get(url, params = {}, config = {}) {
    return this.request(__spreadValues({
      method: "get",
      url,
      params
    }, config));
  }
  post(url, data = {}, params = {}, config = {}) {
    return this.request(__spreadValues({
      method: "post",
      url,
      data
    }, config));
  }
};
let BaseRequest = _BaseRequest;
__publicField(BaseRequest, "cancelMapByMark", {});
class LoadingRequest extends BaseRequest {
  constructor() {
    super(...arguments);
    __publicField(this, "useLoading", loadingConfig.use);
    __publicField(this, "loading");
    __publicField(this, "model");
  }
  setUseLoading(use = loadingConfig.use) {
    this.useLoading = use;
    return this;
  }
  setLoading(options = {}, type = "default") {
    const map = getLoadingMap();
    this.loading = new map[type](options);
    return this;
  }
  getLoading() {
    if (!this.loading && this.useLoading) {
      this.setLoading();
    }
    return this.loading;
  }
  setModel(model) {
    this.model = model;
    return this;
  }
  getModel() {
    if (!this.model) {
      throw new Error("\u8BF7\u5148\u8BBE\u7F6E\u6A21\u578B");
    }
    return this.model;
  }
  request(config = {}) {
    let loading = this.getLoading();
    loading == null ? void 0 : loading.startLoading();
    return super.request(config).then((r) => {
      loading == null ? void 0 : loading.endLoading();
      return r;
    }).catch((er) => {
      loading == null ? void 0 : loading.endLoading();
      throw er;
    });
  }
  reqOne(Model, call) {
    return this.request().then((res) => {
      return this.getModel().newFromReq(Model, res, call);
    });
  }
  reqOneOther(Model, dataKey, call) {
    return this.request().then((res) => {
      const data = res[dataKey];
      const model = this.getModel().newFromReq(Model, data, call);
      return __spreadProps(__spreadValues({}, omit(res, dataKey)), { model });
    });
  }
  reqMany(Model, call) {
    return this.request().then((res) => {
      let models = [];
      for (const da of res) {
        models.push(this.getModel().newFromReq(Model, da, call));
      }
      return models;
    });
  }
  reqManyOther(Model, dataKey, call) {
    return this.request().then((res) => {
      const data = res[dataKey];
      const models = [];
      for (const da of data) {
        models.push(this.getModel().newFromReq(Model, da, call));
      }
      return __spreadProps(__spreadValues({}, omit(res, dataKey)), { models });
    });
  }
}
const _BaseLoading = class {
  constructor(inputConfig = {}) {
    __publicField(this, "needWaitLoading", true);
    __publicField(this, "reqIngNum", 0);
    __publicField(this, "reqCount", 0);
    __publicField(this, "fullLoadingSingleInst");
    __publicField(this, "isFull", false);
    __publicField(this, "loadingInst");
    __publicField(this, "_options", {});
    __publicField(this, "options", {});
    __publicField(this, "_waitLoading");
    __publicField(this, "_waitClose");
    const defaultConfig = _BaseLoading.defaultConfigByClassName[this.classname] || {};
    this.options = __spreadValues(__spreadValues(__spreadValues({}, this.options), defaultConfig), inputConfig);
    this.isFull = this.getIsFull();
    return this;
  }
  get classname() {
    return this.constructor.name;
  }
  setDefaultConfig(options) {
    _BaseLoading.defaultConfigByClassName[this.classname] = options;
  }
  get fullInst() {
    const className = this.constructor.name;
    if (!_BaseLoading._firstFullInstMapByClassName[className]) {
      _BaseLoading._firstFullInstMapByClassName[className] = this;
    }
    return _BaseLoading._firstFullInstMapByClassName[className];
  }
  startLoading() {
    if (!this.isFull) {
      this.loadingInst = this.buildLoading();
      return;
    }
    this.fullStart();
  }
  endLoading() {
    if (!this.isFull) {
      this.closeLoading(this.loadingInst);
      return;
    }
    this.fullClose();
  }
  fullStart() {
    const fullInst = this.fullInst;
    fullInst.reqIngNum++;
    fullInst.reqCount++;
    if (fullInst.needWaitLoading) {
      fullInst.waitLoading();
      fullInst.needWaitLoading = false;
    }
    this.upText(this.getText());
    fullInst.waitClose.cancel();
  }
  get waitLoading() {
    const fullInst = this.fullInst;
    if (!fullInst._waitLoading) {
      fullInst._waitLoading = debounce(() => {
        fullInst.fullLoadingSingleInst = this.buildLoading();
      }, 1e3);
    }
    return fullInst._waitLoading;
  }
  get waitClose() {
    const fullInst = this.fullInst;
    if (!fullInst._waitClose) {
      fullInst._waitClose = debounce(() => {
        fullInst.reqIngNum = 0;
        fullInst.reqCount = 0;
        fullInst.needWaitLoading = true;
        this.closeLoading(fullInst.fullLoadingSingleInst);
      }, 800);
    }
    return fullInst._waitClose;
  }
  fullClose() {
    const fullInst = this.fullInst;
    fullInst.reqIngNum--;
    this.upText(this.getText());
    if (fullInst.reqIngNum <= 0) {
      fullInst.waitLoading.cancel();
      fullInst.waitClose();
    }
  }
  getText(text = "\u52A0\u8F7D\u4E2D") {
    let { reqCount, reqIngNum } = this.fullInst;
    if (reqCount > 1) {
      let percent = 1 - reqIngNum / reqCount;
      percent = (percent * 100).toFixed(0);
      text = `\u5DF2\u52A0\u8F7D ${percent}%`;
    }
    return text;
  }
};
let BaseLoading = _BaseLoading;
__publicField(BaseLoading, "defaultConfigByClassName", {});
__publicField(BaseLoading, "_firstFullInstMapByClassName", {});
export { BaseLoading, LoadingRequest, RequestModel, setLoadingConfig, setLoadingMap, setRequestMap };

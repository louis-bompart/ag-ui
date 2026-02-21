"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // ../../node_modules/.pnpm/uuid@11.1.0/node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (let i7 = 0; i7 < 256; ++i7) {
    byteToHex.push((i7 + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }

  // ../../node_modules/.pnpm/uuid@11.1.0/node_modules/uuid/dist/esm-browser/rng.js
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    if (!getRandomValues) {
      if (typeof crypto === "undefined" || !crypto.getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
      getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
  }

  // ../../node_modules/.pnpm/uuid@11.1.0/node_modules/uuid/dist/esm-browser/native.js
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  var native_default = { randomUUID };

  // ../../node_modules/.pnpm/uuid@11.1.0/node_modules/uuid/dist/esm-browser/v4.js
  function v4(options, buf, offset) {
    if (native_default.randomUUID && !buf && !options) {
      return native_default.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
      throw new Error("Random bytes length must be >= 16");
    }
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      if (offset < 0 || offset + 16 > buf.length) {
        throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
      }
      for (let i7 = 0; i7 < 16; ++i7) {
        buf[offset + i7] = rnds[i7];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // ../../sdks/typescript/packages/client/dist/utils.mjs
  var t = (e3) => {
    if (typeof structuredClone == `function`) return structuredClone(e3);
    try {
      return JSON.parse(JSON.stringify(e3));
    } catch {
      return { ...e3 };
    }
  };
  function n() {
    return v4_default();
  }

  // ../../sdks/typescript/packages/client/dist/agent/subscriber.mjs
  async function t2(t8, n6, r5, i7) {
    let a5 = n6, o4 = r5, s3;
    for (let n7 of t8) try {
      let t9 = await i7(n7, t(a5), t(o4));
      if (t9 === void 0) continue;
      if (t9.messages !== void 0 && (a5 = t9.messages), t9.state !== void 0 && (o4 = t9.state), s3 = t9.stopPropagation, s3 === true) break;
    } catch (e3) {
      process.env.VITEST_WORKER_ID !== void 0 || console.error(`Subscriber error:`, e3);
      continue;
    }
    return { ...JSON.stringify(a5) === JSON.stringify(n6) ? {} : { messages: a5 }, ...JSON.stringify(o4) === JSON.stringify(r5) ? {} : { state: o4 }, ...s3 === void 0 ? {} : { stopPropagation: s3 } };
  }

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/core.js
  var NEVER = Object.freeze({
    status: "aborted"
  });
  // @__NO_SIDE_EFFECTS__
  function $constructor(name, initializer2, params) {
    function init(inst, def) {
      if (!inst._zod) {
        Object.defineProperty(inst, "_zod", {
          value: {
            def,
            constr: _,
            traits: /* @__PURE__ */ new Set()
          },
          enumerable: false
        });
      }
      if (inst._zod.traits.has(name)) {
        return;
      }
      inst._zod.traits.add(name);
      initializer2(inst, def);
      const proto = _.prototype;
      const keys = Object.keys(proto);
      for (let i7 = 0; i7 < keys.length; i7++) {
        const k = keys[i7];
        if (!(k in inst)) {
          inst[k] = proto[k].bind(inst);
        }
      }
    }
    const Parent = params?.Parent ?? Object;
    class Definition extends Parent {
    }
    Object.defineProperty(Definition, "name", { value: name });
    function _(def) {
      var _a2;
      const inst = params?.Parent ? new Definition() : this;
      init(inst, def);
      (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
      for (const fn of inst._zod.deferred) {
        fn();
      }
      return inst;
    }
    Object.defineProperty(_, "init", { value: init });
    Object.defineProperty(_, Symbol.hasInstance, {
      value: (inst) => {
        if (params?.Parent && inst instanceof params.Parent)
          return true;
        return inst?._zod?.traits?.has(name);
      }
    });
    Object.defineProperty(_, "name", { value: name });
    return _;
  }
  var $ZodAsyncError = class extends Error {
    constructor() {
      super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
    }
  };
  var globalConfig = {};
  function config(newConfig) {
    if (newConfig)
      Object.assign(globalConfig, newConfig);
    return globalConfig;
  }

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/util.js
  function getEnumValues(entries) {
    const numericValues = Object.values(entries).filter((v) => typeof v === "number");
    const values = Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
    return values;
  }
  function jsonStringifyReplacer(_, value) {
    if (typeof value === "bigint")
      return value.toString();
    return value;
  }
  function cached(getter) {
    const set = false;
    return {
      get value() {
        if (!set) {
          const value = getter();
          Object.defineProperty(this, "value", { value });
          return value;
        }
        throw new Error("cached value already set");
      }
    };
  }
  function cleanRegex(source) {
    const start = source.startsWith("^") ? 1 : 0;
    const end = source.endsWith("$") ? source.length - 1 : source.length;
    return source.slice(start, end);
  }
  var EVALUATING = /* @__PURE__ */ Symbol("evaluating");
  function defineLazy(object2, key, getter) {
    let value = void 0;
    Object.defineProperty(object2, key, {
      get() {
        if (value === EVALUATING) {
          return void 0;
        }
        if (value === void 0) {
          value = EVALUATING;
          value = getter();
        }
        return value;
      },
      set(v) {
        Object.defineProperty(object2, key, {
          value: v
          // configurable: true,
        });
      },
      configurable: true
    });
  }
  function assignProp(target, prop, value) {
    Object.defineProperty(target, prop, {
      value,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
  function mergeDefs(...defs) {
    const mergedDescriptors = {};
    for (const def of defs) {
      const descriptors = Object.getOwnPropertyDescriptors(def);
      Object.assign(mergedDescriptors, descriptors);
    }
    return Object.defineProperties({}, mergedDescriptors);
  }
  var captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {
  };
  function isObject(data) {
    return typeof data === "object" && data !== null && !Array.isArray(data);
  }
  var allowsEval = cached(() => {
    if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) {
      return false;
    }
    try {
      const F = Function;
      new F("");
      return true;
    } catch (_) {
      return false;
    }
  });
  function isPlainObject(o4) {
    if (isObject(o4) === false)
      return false;
    const ctor = o4.constructor;
    if (ctor === void 0)
      return true;
    if (typeof ctor !== "function")
      return true;
    const prot = ctor.prototype;
    if (isObject(prot) === false)
      return false;
    if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) {
      return false;
    }
    return true;
  }
  function shallowClone(o4) {
    if (isPlainObject(o4))
      return { ...o4 };
    if (Array.isArray(o4))
      return [...o4];
    return o4;
  }
  var propertyKeyTypes = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function clone(inst, def, params) {
    const cl = new inst._zod.constr(def ?? inst._zod.def);
    if (!def || params?.parent)
      cl._zod.parent = inst;
    return cl;
  }
  function normalizeParams(_params) {
    const params = _params;
    if (!params)
      return {};
    if (typeof params === "string")
      return { error: () => params };
    if (params?.message !== void 0) {
      if (params?.error !== void 0)
        throw new Error("Cannot specify both `message` and `error` params");
      params.error = params.message;
    }
    delete params.message;
    if (typeof params.error === "string")
      return { ...params, error: () => params.error };
    return params;
  }
  function optionalKeys(shape) {
    return Object.keys(shape).filter((k) => {
      return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
    });
  }
  var NUMBER_FORMAT_RANGES = {
    safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
    int32: [-2147483648, 2147483647],
    uint32: [0, 4294967295],
    float32: [-34028234663852886e22, 34028234663852886e22],
    float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
  };
  function omit(schema, mask) {
    const currDef = schema._zod.def;
    const checks = currDef.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
      throw new Error(".omit() cannot be used on object schemas containing refinements");
    }
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const newShape = { ...schema._zod.def.shape };
        for (const key in mask) {
          if (!(key in currDef.shape)) {
            throw new Error(`Unrecognized key: "${key}"`);
          }
          if (!mask[key])
            continue;
          delete newShape[key];
        }
        assignProp(this, "shape", newShape);
        return newShape;
      },
      checks: []
    });
    return clone(schema, def);
  }
  function extend(schema, shape) {
    if (!isPlainObject(shape)) {
      throw new Error("Invalid input to extend: expected a plain object");
    }
    const checks = schema._zod.def.checks;
    const hasChecks = checks && checks.length > 0;
    if (hasChecks) {
      const existingShape = schema._zod.def.shape;
      for (const key in shape) {
        if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) {
          throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
        }
      }
    }
    const def = mergeDefs(schema._zod.def, {
      get shape() {
        const _shape = { ...schema._zod.def.shape, ...shape };
        assignProp(this, "shape", _shape);
        return _shape;
      }
    });
    return clone(schema, def);
  }
  function aborted(x, startIndex = 0) {
    if (x.aborted === true)
      return true;
    for (let i7 = startIndex; i7 < x.issues.length; i7++) {
      if (x.issues[i7]?.continue !== true) {
        return true;
      }
    }
    return false;
  }
  function prefixIssues(path, issues) {
    return issues.map((iss) => {
      var _a2;
      (_a2 = iss).path ?? (_a2.path = []);
      iss.path.unshift(path);
      return iss;
    });
  }
  function unwrapMessage(message) {
    return typeof message === "string" ? message : message?.message;
  }
  function finalizeIssue(iss, ctx, config2) {
    const full = { ...iss, path: iss.path ?? [] };
    if (!iss.message) {
      const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config2.customError?.(iss)) ?? unwrapMessage(config2.localeError?.(iss)) ?? "Invalid input";
      full.message = message;
    }
    delete full.inst;
    delete full.continue;
    if (!ctx?.reportInput) {
      delete full.input;
    }
    return full;
  }
  function issue(...args) {
    const [iss, input, inst] = args;
    if (typeof iss === "string") {
      return {
        message: iss,
        code: "custom",
        input,
        inst
      };
    }
    return { ...iss };
  }

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/errors.js
  var initializer = (inst, def) => {
    inst.name = "$ZodError";
    Object.defineProperty(inst, "_zod", {
      value: inst._zod,
      enumerable: false
    });
    Object.defineProperty(inst, "issues", {
      value: def,
      enumerable: false
    });
    inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
    Object.defineProperty(inst, "toString", {
      value: () => inst.message,
      enumerable: false
    });
  };
  var $ZodError = $constructor("$ZodError", initializer);
  var $ZodRealError = $constructor("$ZodError", initializer, { Parent: Error });

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/parse.js
  var _parse = (_Err) => (schema, value, _ctx, _params) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: false }) : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError();
    }
    if (result.issues.length) {
      const e3 = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e3, _params?.callee);
      throw e3;
    }
    return result.value;
  };
  var parse = /* @__PURE__ */ _parse($ZodRealError);
  var _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    if (result.issues.length) {
      const e3 = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e3, params?.callee);
      throw e3;
    }
    return result.value;
  };
  var parseAsync = /* @__PURE__ */ _parseAsync($ZodRealError);
  var _safeParse = (_Err) => (schema, value, _ctx) => {
    const ctx = _ctx ? { ..._ctx, async: false } : { async: false };
    const result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise) {
      throw new $ZodAsyncError();
    }
    return result.issues.length ? {
      success: false,
      error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    } : { success: true, data: result.value };
  };
  var safeParse = /* @__PURE__ */ _safeParse($ZodRealError);
  var _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
    const ctx = _ctx ? Object.assign(_ctx, { async: true }) : { async: true };
    let result = schema._zod.run({ value, issues: [] }, ctx);
    if (result instanceof Promise)
      result = await result;
    return result.issues.length ? {
      success: false,
      error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    } : { success: true, data: result.value };
  };
  var safeParseAsync = /* @__PURE__ */ _safeParseAsync($ZodRealError);

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/regexes.js
  var dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
  var date = /* @__PURE__ */ new RegExp(`^${dateSource}$`);
  var string = (params) => {
    const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
    return new RegExp(`^${regex}$`);
  };
  var number = /^-?\d+(?:\.\d+)?$/;
  var boolean = /^(?:true|false)$/i;

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/checks.js
  var $ZodCheck = /* @__PURE__ */ $constructor("$ZodCheck", (inst, def) => {
    var _a2;
    inst._zod ?? (inst._zod = {});
    inst._zod.def = def;
    (_a2 = inst._zod).onattach ?? (_a2.onattach = []);
  });

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/versions.js
  var version = {
    major: 4,
    minor: 3,
    patch: 6
  };

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/schemas.js
  var $ZodType = /* @__PURE__ */ $constructor("$ZodType", (inst, def) => {
    var _a2;
    inst ?? (inst = {});
    inst._zod.def = def;
    inst._zod.bag = inst._zod.bag || {};
    inst._zod.version = version;
    const checks = [...inst._zod.def.checks ?? []];
    if (inst._zod.traits.has("$ZodCheck")) {
      checks.unshift(inst);
    }
    for (const ch of checks) {
      for (const fn of ch._zod.onattach) {
        fn(inst);
      }
    }
    if (checks.length === 0) {
      (_a2 = inst._zod).deferred ?? (_a2.deferred = []);
      inst._zod.deferred?.push(() => {
        inst._zod.run = inst._zod.parse;
      });
    } else {
      const runChecks = (payload, checks2, ctx) => {
        let isAborted = aborted(payload);
        let asyncResult;
        for (const ch of checks2) {
          if (ch._zod.def.when) {
            const shouldRun = ch._zod.def.when(payload);
            if (!shouldRun)
              continue;
          } else if (isAborted) {
            continue;
          }
          const currLen = payload.issues.length;
          const _ = ch._zod.check(payload);
          if (_ instanceof Promise && ctx?.async === false) {
            throw new $ZodAsyncError();
          }
          if (asyncResult || _ instanceof Promise) {
            asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
              await _;
              const nextLen = payload.issues.length;
              if (nextLen === currLen)
                return;
              if (!isAborted)
                isAborted = aborted(payload, currLen);
            });
          } else {
            const nextLen = payload.issues.length;
            if (nextLen === currLen)
              continue;
            if (!isAborted)
              isAborted = aborted(payload, currLen);
          }
        }
        if (asyncResult) {
          return asyncResult.then(() => {
            return payload;
          });
        }
        return payload;
      };
      const handleCanaryResult = (canary, payload, ctx) => {
        if (aborted(canary)) {
          canary.aborted = true;
          return canary;
        }
        const checkResult = runChecks(payload, checks, ctx);
        if (checkResult instanceof Promise) {
          if (ctx.async === false)
            throw new $ZodAsyncError();
          return checkResult.then((checkResult2) => inst._zod.parse(checkResult2, ctx));
        }
        return inst._zod.parse(checkResult, ctx);
      };
      inst._zod.run = (payload, ctx) => {
        if (ctx.skipChecks) {
          return inst._zod.parse(payload, ctx);
        }
        if (ctx.direction === "backward") {
          const canary = inst._zod.parse({ value: payload.value, issues: [] }, { ...ctx, skipChecks: true });
          if (canary instanceof Promise) {
            return canary.then((canary2) => {
              return handleCanaryResult(canary2, payload, ctx);
            });
          }
          return handleCanaryResult(canary, payload, ctx);
        }
        const result = inst._zod.parse(payload, ctx);
        if (result instanceof Promise) {
          if (ctx.async === false)
            throw new $ZodAsyncError();
          return result.then((result2) => runChecks(result2, checks, ctx));
        }
        return runChecks(result, checks, ctx);
      };
    }
    defineLazy(inst, "~standard", () => ({
      validate: (value) => {
        try {
          const r5 = safeParse(inst, value);
          return r5.success ? { value: r5.data } : { issues: r5.error?.issues };
        } catch (_) {
          return safeParseAsync(inst, value).then((r5) => r5.success ? { value: r5.data } : { issues: r5.error?.issues });
        }
      },
      vendor: "zod",
      version: 1
    }));
  });
  var $ZodString = /* @__PURE__ */ $constructor("$ZodString", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string(inst._zod.bag);
    inst._zod.parse = (payload, _) => {
      if (def.coerce)
        try {
          payload.value = String(payload.value);
        } catch (_2) {
        }
      if (typeof payload.value === "string")
        return payload;
      payload.issues.push({
        expected: "string",
        code: "invalid_type",
        input: payload.value,
        inst
      });
      return payload;
    };
  });
  var $ZodNumber = /* @__PURE__ */ $constructor("$ZodNumber", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = inst._zod.bag.pattern ?? number;
    inst._zod.parse = (payload, _ctx) => {
      if (def.coerce)
        try {
          payload.value = Number(payload.value);
        } catch (_) {
        }
      const input = payload.value;
      if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) {
        return payload;
      }
      const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
      payload.issues.push({
        expected: "number",
        code: "invalid_type",
        input,
        inst,
        ...received ? { received } : {}
      });
      return payload;
    };
  });
  var $ZodBoolean = /* @__PURE__ */ $constructor("$ZodBoolean", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.pattern = boolean;
    inst._zod.parse = (payload, _ctx) => {
      if (def.coerce)
        try {
          payload.value = Boolean(payload.value);
        } catch (_) {
        }
      const input = payload.value;
      if (typeof input === "boolean")
        return payload;
      payload.issues.push({
        expected: "boolean",
        code: "invalid_type",
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodAny = /* @__PURE__ */ $constructor("$ZodAny", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
  });
  var $ZodUnknown = /* @__PURE__ */ $constructor("$ZodUnknown", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload) => payload;
  });
  function handleArrayResult(result, final, index) {
    if (result.issues.length) {
      final.issues.push(...prefixIssues(index, result.issues));
    }
    final.value[index] = result.value;
  }
  var $ZodArray = /* @__PURE__ */ $constructor("$ZodArray", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!Array.isArray(input)) {
        payload.issues.push({
          expected: "array",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      payload.value = Array(input.length);
      const proms = [];
      for (let i7 = 0; i7 < input.length; i7++) {
        const item = input[i7];
        const result = def.element._zod.run({
          value: item,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleArrayResult(result2, payload, i7)));
        } else {
          handleArrayResult(result, payload, i7);
        }
      }
      if (proms.length) {
        return Promise.all(proms).then(() => payload);
      }
      return payload;
    };
  });
  function handlePropertyResult(result, final, key, input, isOptionalOut) {
    if (result.issues.length) {
      if (isOptionalOut && !(key in input)) {
        return;
      }
      final.issues.push(...prefixIssues(key, result.issues));
    }
    if (result.value === void 0) {
      if (key in input) {
        final.value[key] = void 0;
      }
    } else {
      final.value[key] = result.value;
    }
  }
  function normalizeDef(def) {
    const keys = Object.keys(def.shape);
    for (const k of keys) {
      if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) {
        throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
      }
    }
    const okeys = optionalKeys(def.shape);
    return {
      ...def,
      keys,
      keySet: new Set(keys),
      numKeys: keys.length,
      optionalKeys: new Set(okeys)
    };
  }
  function handleCatchall(proms, input, payload, ctx, def, inst) {
    const unrecognized = [];
    const keySet = def.keySet;
    const _catchall = def.catchall._zod;
    const t8 = _catchall.def.type;
    const isOptionalOut = _catchall.optout === "optional";
    for (const key in input) {
      if (keySet.has(key))
        continue;
      if (t8 === "never") {
        unrecognized.push(key);
        continue;
      }
      const r5 = _catchall.run({ value: input[key], issues: [] }, ctx);
      if (r5 instanceof Promise) {
        proms.push(r5.then((r6) => handlePropertyResult(r6, payload, key, input, isOptionalOut)));
      } else {
        handlePropertyResult(r5, payload, key, input, isOptionalOut);
      }
    }
    if (unrecognized.length) {
      payload.issues.push({
        code: "unrecognized_keys",
        keys: unrecognized,
        input,
        inst
      });
    }
    if (!proms.length)
      return payload;
    return Promise.all(proms).then(() => {
      return payload;
    });
  }
  var $ZodObject = /* @__PURE__ */ $constructor("$ZodObject", (inst, def) => {
    $ZodType.init(inst, def);
    const desc = Object.getOwnPropertyDescriptor(def, "shape");
    if (!desc?.get) {
      const sh = def.shape;
      Object.defineProperty(def, "shape", {
        get: () => {
          const newSh = { ...sh };
          Object.defineProperty(def, "shape", {
            value: newSh
          });
          return newSh;
        }
      });
    }
    const _normalized = cached(() => normalizeDef(def));
    defineLazy(inst._zod, "propValues", () => {
      const shape = def.shape;
      const propValues = {};
      for (const key in shape) {
        const field = shape[key]._zod;
        if (field.values) {
          propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
          for (const v of field.values)
            propValues[key].add(v);
        }
      }
      return propValues;
    });
    const isObject2 = isObject;
    const catchall = def.catchall;
    let value;
    inst._zod.parse = (payload, ctx) => {
      value ?? (value = _normalized.value);
      const input = payload.value;
      if (!isObject2(input)) {
        payload.issues.push({
          expected: "object",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      payload.value = {};
      const proms = [];
      const shape = value.shape;
      for (const key of value.keys) {
        const el = shape[key];
        const isOptionalOut = el._zod.optout === "optional";
        const r5 = el._zod.run({ value: input[key], issues: [] }, ctx);
        if (r5 instanceof Promise) {
          proms.push(r5.then((r6) => handlePropertyResult(r6, payload, key, input, isOptionalOut)));
        } else {
          handlePropertyResult(r5, payload, key, input, isOptionalOut);
        }
      }
      if (!catchall) {
        return proms.length ? Promise.all(proms).then(() => payload) : payload;
      }
      return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
    };
  });
  function handleUnionResults(results, final, inst, ctx) {
    for (const result of results) {
      if (result.issues.length === 0) {
        final.value = result.value;
        return final;
      }
    }
    const nonaborted = results.filter((r5) => !aborted(r5));
    if (nonaborted.length === 1) {
      final.value = nonaborted[0].value;
      return nonaborted[0];
    }
    final.issues.push({
      code: "invalid_union",
      input: final.value,
      inst,
      errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
    });
    return final;
  }
  var $ZodUnion = /* @__PURE__ */ $constructor("$ZodUnion", (inst, def) => {
    $ZodType.init(inst, def);
    defineLazy(inst._zod, "optin", () => def.options.some((o4) => o4._zod.optin === "optional") ? "optional" : void 0);
    defineLazy(inst._zod, "optout", () => def.options.some((o4) => o4._zod.optout === "optional") ? "optional" : void 0);
    defineLazy(inst._zod, "values", () => {
      if (def.options.every((o4) => o4._zod.values)) {
        return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
      }
      return void 0;
    });
    defineLazy(inst._zod, "pattern", () => {
      if (def.options.every((o4) => o4._zod.pattern)) {
        const patterns = def.options.map((o4) => o4._zod.pattern);
        return new RegExp(`^(${patterns.map((p2) => cleanRegex(p2.source)).join("|")})$`);
      }
      return void 0;
    });
    const single = def.options.length === 1;
    const first = def.options[0]._zod.run;
    inst._zod.parse = (payload, ctx) => {
      if (single) {
        return first(payload, ctx);
      }
      let async = false;
      const results = [];
      for (const option of def.options) {
        const result = option._zod.run({
          value: payload.value,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          results.push(result);
          async = true;
        } else {
          if (result.issues.length === 0)
            return result;
          results.push(result);
        }
      }
      if (!async)
        return handleUnionResults(results, payload, inst, ctx);
      return Promise.all(results).then((results2) => {
        return handleUnionResults(results2, payload, inst, ctx);
      });
    };
  });
  var $ZodDiscriminatedUnion = /* @__PURE__ */ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
    def.inclusive = false;
    $ZodUnion.init(inst, def);
    const _super = inst._zod.parse;
    defineLazy(inst._zod, "propValues", () => {
      const propValues = {};
      for (const option of def.options) {
        const pv = option._zod.propValues;
        if (!pv || Object.keys(pv).length === 0)
          throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
        for (const [k, v] of Object.entries(pv)) {
          if (!propValues[k])
            propValues[k] = /* @__PURE__ */ new Set();
          for (const val of v) {
            propValues[k].add(val);
          }
        }
      }
      return propValues;
    });
    const disc = cached(() => {
      const opts = def.options;
      const map = /* @__PURE__ */ new Map();
      for (const o4 of opts) {
        const values = o4._zod.propValues?.[def.discriminator];
        if (!values || values.size === 0)
          throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o4)}"`);
        for (const v of values) {
          if (map.has(v)) {
            throw new Error(`Duplicate discriminator value "${String(v)}"`);
          }
          map.set(v, o4);
        }
      }
      return map;
    });
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!isObject(input)) {
        payload.issues.push({
          code: "invalid_type",
          expected: "object",
          input,
          inst
        });
        return payload;
      }
      const opt = disc.value.get(input?.[def.discriminator]);
      if (opt) {
        return opt._zod.run(payload, ctx);
      }
      if (def.unionFallback) {
        return _super(payload, ctx);
      }
      payload.issues.push({
        code: "invalid_union",
        errors: [],
        note: "No matching discriminator",
        discriminator: def.discriminator,
        input,
        path: [def.discriminator],
        inst
      });
      return payload;
    };
  });
  var $ZodRecord = /* @__PURE__ */ $constructor("$ZodRecord", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, ctx) => {
      const input = payload.value;
      if (!isPlainObject(input)) {
        payload.issues.push({
          expected: "record",
          code: "invalid_type",
          input,
          inst
        });
        return payload;
      }
      const proms = [];
      const values = def.keyType._zod.values;
      if (values) {
        payload.value = {};
        const recordKeys = /* @__PURE__ */ new Set();
        for (const key of values) {
          if (typeof key === "string" || typeof key === "number" || typeof key === "symbol") {
            recordKeys.add(typeof key === "number" ? key.toString() : key);
            const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
            if (result instanceof Promise) {
              proms.push(result.then((result2) => {
                if (result2.issues.length) {
                  payload.issues.push(...prefixIssues(key, result2.issues));
                }
                payload.value[key] = result2.value;
              }));
            } else {
              if (result.issues.length) {
                payload.issues.push(...prefixIssues(key, result.issues));
              }
              payload.value[key] = result.value;
            }
          }
        }
        let unrecognized;
        for (const key in input) {
          if (!recordKeys.has(key)) {
            unrecognized = unrecognized ?? [];
            unrecognized.push(key);
          }
        }
        if (unrecognized && unrecognized.length > 0) {
          payload.issues.push({
            code: "unrecognized_keys",
            input,
            inst,
            keys: unrecognized
          });
        }
      } else {
        payload.value = {};
        for (const key of Reflect.ownKeys(input)) {
          if (key === "__proto__")
            continue;
          let keyResult = def.keyType._zod.run({ value: key, issues: [] }, ctx);
          if (keyResult instanceof Promise) {
            throw new Error("Async schemas not supported in object keys currently");
          }
          const checkNumericKey = typeof key === "string" && number.test(key) && keyResult.issues.length;
          if (checkNumericKey) {
            const retryResult = def.keyType._zod.run({ value: Number(key), issues: [] }, ctx);
            if (retryResult instanceof Promise) {
              throw new Error("Async schemas not supported in object keys currently");
            }
            if (retryResult.issues.length === 0) {
              keyResult = retryResult;
            }
          }
          if (keyResult.issues.length) {
            if (def.mode === "loose") {
              payload.value[key] = input[key];
            } else {
              payload.issues.push({
                code: "invalid_key",
                origin: "record",
                issues: keyResult.issues.map((iss) => finalizeIssue(iss, ctx, config())),
                input: key,
                path: [key],
                inst
              });
            }
            continue;
          }
          const result = def.valueType._zod.run({ value: input[key], issues: [] }, ctx);
          if (result instanceof Promise) {
            proms.push(result.then((result2) => {
              if (result2.issues.length) {
                payload.issues.push(...prefixIssues(key, result2.issues));
              }
              payload.value[keyResult.value] = result2.value;
            }));
          } else {
            if (result.issues.length) {
              payload.issues.push(...prefixIssues(key, result.issues));
            }
            payload.value[keyResult.value] = result.value;
          }
        }
      }
      if (proms.length) {
        return Promise.all(proms).then(() => payload);
      }
      return payload;
    };
  });
  var $ZodEnum = /* @__PURE__ */ $constructor("$ZodEnum", (inst, def) => {
    $ZodType.init(inst, def);
    const values = getEnumValues(def.entries);
    const valuesSet = new Set(values);
    inst._zod.values = valuesSet;
    inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o4) => typeof o4 === "string" ? escapeRegex(o4) : o4.toString()).join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (valuesSet.has(input)) {
        return payload;
      }
      payload.issues.push({
        code: "invalid_value",
        values,
        input,
        inst
      });
      return payload;
    };
  });
  var $ZodLiteral = /* @__PURE__ */ $constructor("$ZodLiteral", (inst, def) => {
    $ZodType.init(inst, def);
    if (def.values.length === 0) {
      throw new Error("Cannot create literal schema with no valid values");
    }
    const values = new Set(def.values);
    inst._zod.values = values;
    inst._zod.pattern = new RegExp(`^(${def.values.map((o4) => typeof o4 === "string" ? escapeRegex(o4) : o4 ? escapeRegex(o4.toString()) : String(o4)).join("|")})$`);
    inst._zod.parse = (payload, _ctx) => {
      const input = payload.value;
      if (values.has(input)) {
        return payload;
      }
      payload.issues.push({
        code: "invalid_value",
        values: def.values,
        input,
        inst
      });
      return payload;
    };
  });
  function handleOptionalResult(result, input) {
    if (result.issues.length && input === void 0) {
      return { issues: [], value: void 0 };
    }
    return result;
  }
  var $ZodOptional = /* @__PURE__ */ $constructor("$ZodOptional", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    inst._zod.optout = "optional";
    defineLazy(inst._zod, "values", () => {
      return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
    });
    defineLazy(inst._zod, "pattern", () => {
      const pattern = def.innerType._zod.pattern;
      return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
    });
    inst._zod.parse = (payload, ctx) => {
      if (def.innerType._zod.optin === "optional") {
        const result = def.innerType._zod.run(payload, ctx);
        if (result instanceof Promise)
          return result.then((r5) => handleOptionalResult(r5, payload.value));
        return handleOptionalResult(result, payload.value);
      }
      if (payload.value === void 0) {
        return payload;
      }
      return def.innerType._zod.run(payload, ctx);
    };
  });
  var $ZodDefault = /* @__PURE__ */ $constructor("$ZodDefault", (inst, def) => {
    $ZodType.init(inst, def);
    inst._zod.optin = "optional";
    defineLazy(inst._zod, "values", () => def.innerType._zod.values);
    inst._zod.parse = (payload, ctx) => {
      if (ctx.direction === "backward") {
        return def.innerType._zod.run(payload, ctx);
      }
      if (payload.value === void 0) {
        payload.value = def.defaultValue;
        return payload;
      }
      const result = def.innerType._zod.run(payload, ctx);
      if (result instanceof Promise) {
        return result.then((result2) => handleDefaultResult(result2, def));
      }
      return handleDefaultResult(result, def);
    };
  });
  function handleDefaultResult(payload, def) {
    if (payload.value === void 0) {
      payload.value = def.defaultValue;
    }
    return payload;
  }
  var $ZodCustom = /* @__PURE__ */ $constructor("$ZodCustom", (inst, def) => {
    $ZodCheck.init(inst, def);
    $ZodType.init(inst, def);
    inst._zod.parse = (payload, _) => {
      return payload;
    };
    inst._zod.check = (payload) => {
      const input = payload.value;
      const r5 = def.fn(input);
      if (r5 instanceof Promise) {
        return r5.then((r6) => handleRefineResult(r6, payload, input, inst));
      }
      handleRefineResult(r5, payload, input, inst);
      return;
    };
  });
  function handleRefineResult(result, payload, input, inst) {
    if (!result) {
      const _iss = {
        code: "custom",
        input,
        inst,
        // incorporates params.error into issue reporting
        path: [...inst._zod.def.path ?? []],
        // incorporates params.error into issue reporting
        continue: !inst._zod.def.abort
        // params: inst._zod.def.params,
      };
      if (inst._zod.def.params)
        _iss.params = inst._zod.def.params;
      payload.issues.push(issue(_iss));
    }
  }

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/registries.js
  var _a;
  var $ZodRegistry = class {
    constructor() {
      this._map = /* @__PURE__ */ new WeakMap();
      this._idmap = /* @__PURE__ */ new Map();
    }
    add(schema, ..._meta) {
      const meta2 = _meta[0];
      this._map.set(schema, meta2);
      if (meta2 && typeof meta2 === "object" && "id" in meta2) {
        this._idmap.set(meta2.id, schema);
      }
      return this;
    }
    clear() {
      this._map = /* @__PURE__ */ new WeakMap();
      this._idmap = /* @__PURE__ */ new Map();
      return this;
    }
    remove(schema) {
      const meta2 = this._map.get(schema);
      if (meta2 && typeof meta2 === "object" && "id" in meta2) {
        this._idmap.delete(meta2.id);
      }
      this._map.delete(schema);
      return this;
    }
    get(schema) {
      const p2 = schema._zod.parent;
      if (p2) {
        const pm = { ...this.get(p2) ?? {} };
        delete pm.id;
        const f2 = { ...pm, ...this._map.get(schema) };
        return Object.keys(f2).length ? f2 : void 0;
      }
      return this._map.get(schema);
    }
    has(schema) {
      return this._map.has(schema);
    }
  };
  function registry() {
    return new $ZodRegistry();
  }
  (_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
  var globalRegistry = globalThis.__zod_globalRegistry;

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/core/api.js
  // @__NO_SIDE_EFFECTS__
  function _string(Class, params) {
    return new Class({
      type: "string",
      ...normalizeParams(params)
    });
  }
  // @__NO_SIDE_EFFECTS__
  function _number(Class, params) {
    return new Class({
      type: "number",
      checks: [],
      ...normalizeParams(params)
    });
  }
  // @__NO_SIDE_EFFECTS__
  function _boolean(Class, params) {
    return new Class({
      type: "boolean",
      ...normalizeParams(params)
    });
  }
  // @__NO_SIDE_EFFECTS__
  function _any(Class) {
    return new Class({
      type: "any"
    });
  }
  // @__NO_SIDE_EFFECTS__
  function _unknown(Class) {
    return new Class({
      type: "unknown"
    });
  }
  // @__NO_SIDE_EFFECTS__
  function _refine(Class, fn, _params) {
    const schema = new Class({
      type: "custom",
      check: "custom",
      fn,
      ...normalizeParams(_params)
    });
    return schema;
  }
  // @__NO_SIDE_EFFECTS__
  function _superRefine(fn) {
    const ch = /* @__PURE__ */ _check((payload) => {
      payload.addIssue = (issue2) => {
        if (typeof issue2 === "string") {
          payload.issues.push(issue(issue2, payload.value, ch._zod.def));
        } else {
          const _issue = issue2;
          if (_issue.fatal)
            _issue.continue = false;
          _issue.code ?? (_issue.code = "custom");
          _issue.input ?? (_issue.input = payload.value);
          _issue.inst ?? (_issue.inst = ch);
          _issue.continue ?? (_issue.continue = !ch._zod.def.abort);
          payload.issues.push(issue(_issue));
        }
      };
      return fn(payload.value, payload);
    });
    return ch;
  }
  // @__NO_SIDE_EFFECTS__
  function _check(fn, params) {
    const ch = new $ZodCheck({
      check: "custom",
      ...normalizeParams(params)
    });
    ch._zod.check = fn;
    return ch;
  }

  // ../../node_modules/.pnpm/zod@4.3.6/node_modules/zod/v4/mini/schemas.js
  var ZodMiniType = /* @__PURE__ */ $constructor("ZodMiniType", (inst, def) => {
    if (!inst._zod)
      throw new Error("Uninitialized schema in ZodMiniType.");
    $ZodType.init(inst, def);
    inst.def = def;
    inst.type = def.type;
    inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
    inst.safeParse = (data, params) => safeParse(inst, data, params);
    inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
    inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
    inst.check = (...checks) => {
      return inst.clone({
        ...def,
        checks: [
          ...def.checks ?? [],
          ...checks.map((ch) => typeof ch === "function" ? { _zod: { check: ch, def: { check: "custom" }, onattach: [] } } : ch)
        ]
      }, { parent: true });
    };
    inst.with = inst.check;
    inst.clone = (_def, params) => clone(inst, _def, params);
    inst.brand = () => inst;
    inst.register = ((reg, meta2) => {
      reg.add(inst, meta2);
      return inst;
    });
    inst.apply = (fn) => fn(inst);
  });
  var ZodMiniString = /* @__PURE__ */ $constructor("ZodMiniString", (inst, def) => {
    $ZodString.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function string2(params) {
    return _string(ZodMiniString, params);
  }
  var ZodMiniNumber = /* @__PURE__ */ $constructor("ZodMiniNumber", (inst, def) => {
    $ZodNumber.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function number2(params) {
    return _number(ZodMiniNumber, params);
  }
  var ZodMiniBoolean = /* @__PURE__ */ $constructor("ZodMiniBoolean", (inst, def) => {
    $ZodBoolean.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function boolean2(params) {
    return _boolean(ZodMiniBoolean, params);
  }
  var ZodMiniAny = /* @__PURE__ */ $constructor("ZodMiniAny", (inst, def) => {
    $ZodAny.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function any() {
    return _any(ZodMiniAny);
  }
  var ZodMiniUnknown = /* @__PURE__ */ $constructor("ZodMiniUnknown", (inst, def) => {
    $ZodUnknown.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function unknown() {
    return _unknown(ZodMiniUnknown);
  }
  var ZodMiniArray = /* @__PURE__ */ $constructor("ZodMiniArray", (inst, def) => {
    $ZodArray.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function array(element, params) {
    return new ZodMiniArray({
      type: "array",
      element,
      ...normalizeParams(params)
    });
  }
  var ZodMiniObject = /* @__PURE__ */ $constructor("ZodMiniObject", (inst, def) => {
    $ZodObject.init(inst, def);
    ZodMiniType.init(inst, def);
    defineLazy(inst, "shape", () => def.shape);
  });
  // @__NO_SIDE_EFFECTS__
  function object(shape, params) {
    const def = {
      type: "object",
      shape: shape ?? {},
      ...normalizeParams(params)
    };
    return new ZodMiniObject(def);
  }
  // @__NO_SIDE_EFFECTS__
  function looseObject(shape, params) {
    return new ZodMiniObject({
      type: "object",
      shape,
      catchall: /* @__PURE__ */ unknown(),
      ...normalizeParams(params)
    });
  }
  // @__NO_SIDE_EFFECTS__
  function extend2(schema, shape) {
    return extend(schema, shape);
  }
  // @__NO_SIDE_EFFECTS__
  function omit2(schema, mask) {
    return omit(schema, mask);
  }
  var ZodMiniUnion = /* @__PURE__ */ $constructor("ZodMiniUnion", (inst, def) => {
    $ZodUnion.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function union(options, params) {
    return new ZodMiniUnion({
      type: "union",
      options,
      ...normalizeParams(params)
    });
  }
  var ZodMiniDiscriminatedUnion = /* @__PURE__ */ $constructor("ZodMiniDiscriminatedUnion", (inst, def) => {
    $ZodDiscriminatedUnion.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function discriminatedUnion(discriminator, options, params) {
    return new ZodMiniDiscriminatedUnion({
      type: "union",
      options,
      discriminator,
      ...normalizeParams(params)
    });
  }
  var ZodMiniRecord = /* @__PURE__ */ $constructor("ZodMiniRecord", (inst, def) => {
    $ZodRecord.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function record(keyType, valueType, params) {
    return new ZodMiniRecord({
      type: "record",
      keyType,
      valueType,
      ...normalizeParams(params)
    });
  }
  var ZodMiniEnum = /* @__PURE__ */ $constructor("ZodMiniEnum", (inst, def) => {
    $ZodEnum.init(inst, def);
    ZodMiniType.init(inst, def);
    inst.options = Object.values(def.entries);
  });
  // @__NO_SIDE_EFFECTS__
  function _enum(values, params) {
    const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
    return new ZodMiniEnum({
      type: "enum",
      entries,
      ...normalizeParams(params)
    });
  }
  // @__NO_SIDE_EFFECTS__
  function nativeEnum(entries, params) {
    return new ZodMiniEnum({
      type: "enum",
      entries,
      ...normalizeParams(params)
    });
  }
  var ZodMiniLiteral = /* @__PURE__ */ $constructor("ZodMiniLiteral", (inst, def) => {
    $ZodLiteral.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function literal(value, params) {
    return new ZodMiniLiteral({
      type: "literal",
      values: Array.isArray(value) ? value : [value],
      ...normalizeParams(params)
    });
  }
  var ZodMiniOptional = /* @__PURE__ */ $constructor("ZodMiniOptional", (inst, def) => {
    $ZodOptional.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function optional(innerType) {
    return new ZodMiniOptional({
      type: "optional",
      innerType
    });
  }
  var ZodMiniDefault = /* @__PURE__ */ $constructor("ZodMiniDefault", (inst, def) => {
    $ZodDefault.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function _default(innerType, defaultValue) {
    return new ZodMiniDefault({
      type: "default",
      innerType,
      get defaultValue() {
        return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
      }
    });
  }
  var ZodMiniCustom = /* @__PURE__ */ $constructor("ZodMiniCustom", (inst, def) => {
    $ZodCustom.init(inst, def);
    ZodMiniType.init(inst, def);
  });
  // @__NO_SIDE_EFFECTS__
  function refine(fn, _params = {}) {
    return _refine(ZodMiniCustom, fn, _params);
  }
  // @__NO_SIDE_EFFECTS__
  function superRefine(fn) {
    return _superRefine(fn);
  }

  // ../../sdks/typescript/packages/core/dist/index.mjs
  var FunctionCallSchema = object({
    name: string2(),
    arguments: string2()
  });
  var ToolCallSchema = object({
    id: string2(),
    type: literal("function"),
    function: FunctionCallSchema,
    encryptedValue: optional(string2())
  });
  var BaseMessageSchema = object({
    id: string2(),
    role: string2(),
    content: optional(string2()),
    name: optional(string2()),
    encryptedValue: optional(string2())
  });
  var TextInputContentSchema = object({
    type: literal("text"),
    text: string2()
  });
  var BinaryInputContentObjectSchema = object({
    type: literal("binary"),
    mimeType: string2(),
    id: optional(string2()),
    url: optional(string2()),
    data: optional(string2()),
    filename: optional(string2())
  });
  var ensureBinaryPayload = (value, ctx) => {
    if (!value.id && !value.url && !value.data) ctx.addIssue({
      code: "custom",
      message: "BinaryInputContent requires at least one of id, url, or data.",
      path: ["id"]
    });
  };
  var BinaryInputContentSchema = BinaryInputContentObjectSchema.check(superRefine((value, ctx) => {
    ensureBinaryPayload(value, ctx);
  }));
  var InputContentBaseSchema = discriminatedUnion("type", [TextInputContentSchema, BinaryInputContentObjectSchema]);
  var InputContentSchema = InputContentBaseSchema.check(superRefine((value, ctx) => {
    if (value.type === "binary") ensureBinaryPayload(value, ctx);
  }));
  var DeveloperMessageSchema = extend2(BaseMessageSchema, {
    role: literal("developer"),
    content: string2()
  });
  var SystemMessageSchema = extend2(BaseMessageSchema, {
    role: literal("system"),
    content: string2()
  });
  var AssistantMessageSchema = extend2(BaseMessageSchema, {
    role: literal("assistant"),
    content: optional(string2()),
    toolCalls: optional(array(ToolCallSchema))
  });
  var UserMessageSchema = extend2(BaseMessageSchema, {
    role: literal("user"),
    content: union([string2(), array(InputContentSchema)])
  });
  var ToolMessageSchema = object({
    id: string2(),
    content: string2(),
    role: literal("tool"),
    toolCallId: string2(),
    error: optional(string2()),
    encryptedValue: optional(string2())
  });
  var ActivityMessageSchema = object({
    id: string2(),
    role: literal("activity"),
    activityType: string2(),
    content: record(any(), any())
  });
  var ReasoningMessageSchema = object({
    id: string2(),
    role: literal("reasoning"),
    content: string2(),
    encryptedValue: optional(string2())
  });
  var MessageSchema = discriminatedUnion("role", [
    DeveloperMessageSchema,
    SystemMessageSchema,
    AssistantMessageSchema,
    UserMessageSchema,
    ToolMessageSchema,
    ActivityMessageSchema,
    ReasoningMessageSchema
  ]);
  var RoleSchema = union([
    literal("developer"),
    literal("system"),
    literal("assistant"),
    literal("user"),
    literal("tool"),
    literal("activity"),
    literal("reasoning")
  ]);
  var ContextSchema = object({
    description: string2(),
    value: string2()
  });
  var ToolSchema = object({
    name: string2(),
    description: string2(),
    parameters: any()
  });
  var RunAgentInputSchema = object({
    threadId: string2(),
    runId: string2(),
    parentRunId: optional(string2()),
    state: any(),
    messages: array(MessageSchema),
    tools: array(ToolSchema),
    context: array(ContextSchema),
    forwardedProps: any()
  });
  var StateSchema = any();
  var AGUIError = class extends Error {
    constructor(message) {
      super(message);
    }
  };
  var AGUIConnectNotImplementedError = class extends AGUIError {
    constructor() {
      super("Connect not implemented. This method is not supported by the current agent.");
    }
  };
  var TextMessageRoleSchema = union([
    literal("developer"),
    literal("system"),
    literal("assistant"),
    literal("user")
  ]);
  var EventType = /* @__PURE__ */ (function(EventType2) {
    EventType2["TEXT_MESSAGE_START"] = "TEXT_MESSAGE_START";
    EventType2["TEXT_MESSAGE_CONTENT"] = "TEXT_MESSAGE_CONTENT";
    EventType2["TEXT_MESSAGE_END"] = "TEXT_MESSAGE_END";
    EventType2["TEXT_MESSAGE_CHUNK"] = "TEXT_MESSAGE_CHUNK";
    EventType2["TOOL_CALL_START"] = "TOOL_CALL_START";
    EventType2["TOOL_CALL_ARGS"] = "TOOL_CALL_ARGS";
    EventType2["TOOL_CALL_END"] = "TOOL_CALL_END";
    EventType2["TOOL_CALL_CHUNK"] = "TOOL_CALL_CHUNK";
    EventType2["TOOL_CALL_RESULT"] = "TOOL_CALL_RESULT";
    EventType2["THINKING_START"] = "THINKING_START";
    EventType2["THINKING_END"] = "THINKING_END";
    EventType2["THINKING_TEXT_MESSAGE_START"] = "THINKING_TEXT_MESSAGE_START";
    EventType2["THINKING_TEXT_MESSAGE_CONTENT"] = "THINKING_TEXT_MESSAGE_CONTENT";
    EventType2["THINKING_TEXT_MESSAGE_END"] = "THINKING_TEXT_MESSAGE_END";
    EventType2["STATE_SNAPSHOT"] = "STATE_SNAPSHOT";
    EventType2["STATE_DELTA"] = "STATE_DELTA";
    EventType2["MESSAGES_SNAPSHOT"] = "MESSAGES_SNAPSHOT";
    EventType2["ACTIVITY_SNAPSHOT"] = "ACTIVITY_SNAPSHOT";
    EventType2["ACTIVITY_DELTA"] = "ACTIVITY_DELTA";
    EventType2["RAW"] = "RAW";
    EventType2["CUSTOM"] = "CUSTOM";
    EventType2["RUN_STARTED"] = "RUN_STARTED";
    EventType2["RUN_FINISHED"] = "RUN_FINISHED";
    EventType2["RUN_ERROR"] = "RUN_ERROR";
    EventType2["STEP_STARTED"] = "STEP_STARTED";
    EventType2["STEP_FINISHED"] = "STEP_FINISHED";
    EventType2["REASONING_START"] = "REASONING_START";
    EventType2["REASONING_MESSAGE_START"] = "REASONING_MESSAGE_START";
    EventType2["REASONING_MESSAGE_CONTENT"] = "REASONING_MESSAGE_CONTENT";
    EventType2["REASONING_MESSAGE_END"] = "REASONING_MESSAGE_END";
    EventType2["REASONING_MESSAGE_CHUNK"] = "REASONING_MESSAGE_CHUNK";
    EventType2["REASONING_END"] = "REASONING_END";
    EventType2["REASONING_ENCRYPTED_VALUE"] = "REASONING_ENCRYPTED_VALUE";
    return EventType2;
  })({});
  var BaseEventSchema = looseObject({
    type: nativeEnum(EventType),
    timestamp: optional(number2()),
    rawEvent: optional(any())
  });
  var TextMessageStartEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TEXT_MESSAGE_START),
    messageId: string2(),
    role: _default(optional(TextMessageRoleSchema), "assistant")
  });
  var TextMessageContentEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TEXT_MESSAGE_CONTENT),
    messageId: string2(),
    delta: string2().check(refine((s3) => s3.length > 0, "Delta must not be an empty string"))
  });
  var TextMessageEndEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TEXT_MESSAGE_END),
    messageId: string2()
  });
  var TextMessageChunkEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TEXT_MESSAGE_CHUNK),
    messageId: optional(string2()),
    role: optional(TextMessageRoleSchema),
    delta: optional(string2())
  });
  var ThinkingTextMessageStartEventSchema = extend2(BaseEventSchema, { type: literal(EventType.THINKING_TEXT_MESSAGE_START) });
  var ThinkingTextMessageContentEventSchema = extend2(omit2(TextMessageContentEventSchema, {
    messageId: true,
    type: true
  }), { type: literal(EventType.THINKING_TEXT_MESSAGE_CONTENT) });
  var ThinkingTextMessageEndEventSchema = extend2(BaseEventSchema, { type: literal(EventType.THINKING_TEXT_MESSAGE_END) });
  var ToolCallStartEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TOOL_CALL_START),
    toolCallId: string2(),
    toolCallName: string2(),
    parentMessageId: optional(string2())
  });
  var ToolCallArgsEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TOOL_CALL_ARGS),
    toolCallId: string2(),
    delta: string2()
  });
  var ToolCallEndEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TOOL_CALL_END),
    toolCallId: string2()
  });
  var ToolCallResultEventSchema = extend2(BaseEventSchema, {
    messageId: string2(),
    type: literal(EventType.TOOL_CALL_RESULT),
    toolCallId: string2(),
    content: string2(),
    role: optional(literal("tool"))
  });
  var ToolCallChunkEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.TOOL_CALL_CHUNK),
    toolCallId: optional(string2()),
    toolCallName: optional(string2()),
    parentMessageId: optional(string2()),
    delta: optional(string2())
  });
  var ThinkingStartEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.THINKING_START),
    title: optional(string2())
  });
  var ThinkingEndEventSchema = extend2(BaseEventSchema, { type: literal(EventType.THINKING_END) });
  var StateSnapshotEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.STATE_SNAPSHOT),
    snapshot: StateSchema
  });
  var StateDeltaEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.STATE_DELTA),
    delta: array(any())
  });
  var MessagesSnapshotEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.MESSAGES_SNAPSHOT),
    messages: array(MessageSchema)
  });
  var ActivitySnapshotEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.ACTIVITY_SNAPSHOT),
    messageId: string2(),
    activityType: string2(),
    content: record(any(), any()),
    replace: _default(optional(boolean2()), true)
  });
  var ActivityDeltaEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.ACTIVITY_DELTA),
    messageId: string2(),
    activityType: string2(),
    patch: array(any())
  });
  var RawEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.RAW),
    event: any(),
    source: optional(string2())
  });
  var CustomEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.CUSTOM),
    name: string2(),
    value: any()
  });
  var RunStartedEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.RUN_STARTED),
    threadId: string2(),
    runId: string2(),
    parentRunId: optional(string2()),
    input: optional(RunAgentInputSchema)
  });
  var RunFinishedEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.RUN_FINISHED),
    threadId: string2(),
    runId: string2(),
    result: optional(any())
  });
  var RunErrorEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.RUN_ERROR),
    message: string2(),
    code: optional(string2())
  });
  var StepStartedEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.STEP_STARTED),
    stepName: string2()
  });
  var StepFinishedEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.STEP_FINISHED),
    stepName: string2()
  });
  var ReasoningEncryptedValueSubtypeSchema = union([literal("tool-call"), literal("message")]);
  var ReasoningStartEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_START),
    messageId: string2()
  });
  var ReasoningMessageStartEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_MESSAGE_START),
    messageId: string2(),
    role: literal("reasoning")
  });
  var ReasoningMessageContentEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_MESSAGE_CONTENT),
    messageId: string2(),
    delta: string2().check(refine((s3) => s3.length > 0, "Delta must not be an empty string"))
  });
  var ReasoningMessageEndEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_MESSAGE_END),
    messageId: string2()
  });
  var ReasoningMessageChunkEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_MESSAGE_CHUNK),
    messageId: optional(string2()),
    delta: optional(string2())
  });
  var ReasoningEndEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_END),
    messageId: string2()
  });
  var ReasoningEncryptedValueEventSchema = extend2(BaseEventSchema, {
    type: literal(EventType.REASONING_ENCRYPTED_VALUE),
    subtype: ReasoningEncryptedValueSubtypeSchema,
    entityId: string2(),
    encryptedValue: string2()
  });
  var EventSchemas = discriminatedUnion("type", [
    TextMessageStartEventSchema,
    TextMessageContentEventSchema,
    TextMessageEndEventSchema,
    TextMessageChunkEventSchema,
    ThinkingStartEventSchema,
    ThinkingEndEventSchema,
    ThinkingTextMessageStartEventSchema,
    ThinkingTextMessageContentEventSchema,
    ThinkingTextMessageEndEventSchema,
    ToolCallStartEventSchema,
    ToolCallArgsEventSchema,
    ToolCallEndEventSchema,
    ToolCallChunkEventSchema,
    ToolCallResultEventSchema,
    StateSnapshotEventSchema,
    StateDeltaEventSchema,
    MessagesSnapshotEventSchema,
    ActivitySnapshotEventSchema,
    ActivityDeltaEventSchema,
    RawEventSchema,
    CustomEventSchema,
    RunStartedEventSchema,
    RunFinishedEventSchema,
    RunErrorEventSchema,
    StepStartedEventSchema,
    StepFinishedEventSchema,
    ReasoningStartEventSchema,
    ReasoningMessageStartEventSchema,
    ReasoningMessageContentEventSchema,
    ReasoningMessageEndEventSchema,
    ReasoningMessageChunkEventSchema,
    ReasoningEndEventSchema,
    ReasoningEncryptedValueEventSchema
  ]);

  // ../../node_modules/.pnpm/fast-json-patch@3.1.1/node_modules/fast-json-patch/module/core.mjs
  var core_exports3 = {};
  __export(core_exports3, {
    JsonPatchError: () => JsonPatchError,
    _areEquals: () => _areEquals,
    applyOperation: () => applyOperation,
    applyPatch: () => applyPatch,
    applyReducer: () => applyReducer,
    deepClone: () => deepClone,
    getValueByPointer: () => getValueByPointer,
    validate: () => validate,
    validator: () => validator
  });

  // ../../node_modules/.pnpm/fast-json-patch@3.1.1/node_modules/fast-json-patch/module/helpers.mjs
  var __extends = /* @__PURE__ */ (function() {
    var extendStatics = function(d2, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b2) {
        d3.__proto__ = b2;
      } || function(d3, b2) {
        for (var p2 in b2) if (b2.hasOwnProperty(p2)) d3[p2] = b2[p2];
      };
      return extendStatics(d2, b);
    };
    return function(d2, b) {
      extendStatics(d2, b);
      function __() {
        this.constructor = d2;
      }
      d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  })();
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwnProperty(obj, key) {
    return _hasOwnProperty.call(obj, key);
  }
  function _objectKeys(obj) {
    if (Array.isArray(obj)) {
      var keys_1 = new Array(obj.length);
      for (var k = 0; k < keys_1.length; k++) {
        keys_1[k] = "" + k;
      }
      return keys_1;
    }
    if (Object.keys) {
      return Object.keys(obj);
    }
    var keys = [];
    for (var i7 in obj) {
      if (hasOwnProperty(obj, i7)) {
        keys.push(i7);
      }
    }
    return keys;
  }
  function _deepClone(obj) {
    switch (typeof obj) {
      case "object":
        return JSON.parse(JSON.stringify(obj));
      //Faster than ES5 clone - http://jsperf.com/deep-cloning-of-objects/5
      case "undefined":
        return null;
      //this is how JSON.stringify behaves for array items
      default:
        return obj;
    }
  }
  function isInteger(str) {
    var i7 = 0;
    var len = str.length;
    var charCode;
    while (i7 < len) {
      charCode = str.charCodeAt(i7);
      if (charCode >= 48 && charCode <= 57) {
        i7++;
        continue;
      }
      return false;
    }
    return true;
  }
  function escapePathComponent(path) {
    if (path.indexOf("/") === -1 && path.indexOf("~") === -1)
      return path;
    return path.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function unescapePathComponent(path) {
    return path.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  function hasUndefined(obj) {
    if (obj === void 0) {
      return true;
    }
    if (obj) {
      if (Array.isArray(obj)) {
        for (var i_1 = 0, len = obj.length; i_1 < len; i_1++) {
          if (hasUndefined(obj[i_1])) {
            return true;
          }
        }
      } else if (typeof obj === "object") {
        var objKeys = _objectKeys(obj);
        var objKeysLength = objKeys.length;
        for (var i7 = 0; i7 < objKeysLength; i7++) {
          if (hasUndefined(obj[objKeys[i7]])) {
            return true;
          }
        }
      }
    }
    return false;
  }
  function patchErrorMessageFormatter(message, args) {
    var messageParts = [message];
    for (var key in args) {
      var value = typeof args[key] === "object" ? JSON.stringify(args[key], null, 2) : args[key];
      if (typeof value !== "undefined") {
        messageParts.push(key + ": " + value);
      }
    }
    return messageParts.join("\n");
  }
  var PatchError = (
    /** @class */
    (function(_super) {
      __extends(PatchError2, _super);
      function PatchError2(message, name, index, operation, tree) {
        var _newTarget = this.constructor;
        var _this = _super.call(this, patchErrorMessageFormatter(message, { name, index, operation, tree })) || this;
        _this.name = name;
        _this.index = index;
        _this.operation = operation;
        _this.tree = tree;
        Object.setPrototypeOf(_this, _newTarget.prototype);
        _this.message = patchErrorMessageFormatter(message, { name, index, operation, tree });
        return _this;
      }
      return PatchError2;
    })(Error)
  );

  // ../../node_modules/.pnpm/fast-json-patch@3.1.1/node_modules/fast-json-patch/module/core.mjs
  var JsonPatchError = PatchError;
  var deepClone = _deepClone;
  var objOps = {
    add: function(obj, key, document) {
      obj[key] = this.value;
      return { newDocument: document };
    },
    remove: function(obj, key, document) {
      var removed = obj[key];
      delete obj[key];
      return { newDocument: document, removed };
    },
    replace: function(obj, key, document) {
      var removed = obj[key];
      obj[key] = this.value;
      return { newDocument: document, removed };
    },
    move: function(obj, key, document) {
      var removed = getValueByPointer(document, this.path);
      if (removed) {
        removed = _deepClone(removed);
      }
      var originalValue = applyOperation(document, { op: "remove", path: this.from }).removed;
      applyOperation(document, { op: "add", path: this.path, value: originalValue });
      return { newDocument: document, removed };
    },
    copy: function(obj, key, document) {
      var valueToCopy = getValueByPointer(document, this.from);
      applyOperation(document, { op: "add", path: this.path, value: _deepClone(valueToCopy) });
      return { newDocument: document };
    },
    test: function(obj, key, document) {
      return { newDocument: document, test: _areEquals(obj[key], this.value) };
    },
    _get: function(obj, key, document) {
      this.value = obj[key];
      return { newDocument: document };
    }
  };
  var arrOps = {
    add: function(arr, i7, document) {
      if (isInteger(i7)) {
        arr.splice(i7, 0, this.value);
      } else {
        arr[i7] = this.value;
      }
      return { newDocument: document, index: i7 };
    },
    remove: function(arr, i7, document) {
      var removedList = arr.splice(i7, 1);
      return { newDocument: document, removed: removedList[0] };
    },
    replace: function(arr, i7, document) {
      var removed = arr[i7];
      arr[i7] = this.value;
      return { newDocument: document, removed };
    },
    move: objOps.move,
    copy: objOps.copy,
    test: objOps.test,
    _get: objOps._get
  };
  function getValueByPointer(document, pointer) {
    if (pointer == "") {
      return document;
    }
    var getOriginalDestination = { op: "_get", path: pointer };
    applyOperation(document, getOriginalDestination);
    return getOriginalDestination.value;
  }
  function applyOperation(document, operation, validateOperation, mutateDocument, banPrototypeModifications, index) {
    if (validateOperation === void 0) {
      validateOperation = false;
    }
    if (mutateDocument === void 0) {
      mutateDocument = true;
    }
    if (banPrototypeModifications === void 0) {
      banPrototypeModifications = true;
    }
    if (index === void 0) {
      index = 0;
    }
    if (validateOperation) {
      if (typeof validateOperation == "function") {
        validateOperation(operation, 0, document, operation.path);
      } else {
        validator(operation, 0);
      }
    }
    if (operation.path === "") {
      var returnValue = { newDocument: document };
      if (operation.op === "add") {
        returnValue.newDocument = operation.value;
        return returnValue;
      } else if (operation.op === "replace") {
        returnValue.newDocument = operation.value;
        returnValue.removed = document;
        return returnValue;
      } else if (operation.op === "move" || operation.op === "copy") {
        returnValue.newDocument = getValueByPointer(document, operation.from);
        if (operation.op === "move") {
          returnValue.removed = document;
        }
        return returnValue;
      } else if (operation.op === "test") {
        returnValue.test = _areEquals(document, operation.value);
        if (returnValue.test === false) {
          throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
        }
        returnValue.newDocument = document;
        return returnValue;
      } else if (operation.op === "remove") {
        returnValue.removed = document;
        returnValue.newDocument = null;
        return returnValue;
      } else if (operation.op === "_get") {
        operation.value = document;
        return returnValue;
      } else {
        if (validateOperation) {
          throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
        } else {
          return returnValue;
        }
      }
    } else {
      if (!mutateDocument) {
        document = _deepClone(document);
      }
      var path = operation.path || "";
      var keys = path.split("/");
      var obj = document;
      var t8 = 1;
      var len = keys.length;
      var existingPathFragment = void 0;
      var key = void 0;
      var validateFunction = void 0;
      if (typeof validateOperation == "function") {
        validateFunction = validateOperation;
      } else {
        validateFunction = validator;
      }
      while (true) {
        key = keys[t8];
        if (key && key.indexOf("~") != -1) {
          key = unescapePathComponent(key);
        }
        if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t8 > 0 && keys[t8 - 1] == "constructor")) {
          throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
        }
        if (validateOperation) {
          if (existingPathFragment === void 0) {
            if (obj[key] === void 0) {
              existingPathFragment = keys.slice(0, t8).join("/");
            } else if (t8 == len - 1) {
              existingPathFragment = operation.path;
            }
            if (existingPathFragment !== void 0) {
              validateFunction(operation, 0, document, existingPathFragment);
            }
          }
        }
        t8++;
        if (Array.isArray(obj)) {
          if (key === "-") {
            key = obj.length;
          } else {
            if (validateOperation && !isInteger(key)) {
              throw new JsonPatchError("Expected an unsigned base-10 integer value, making the new referenced value the array element with the zero-based index", "OPERATION_PATH_ILLEGAL_ARRAY_INDEX", index, operation, document);
            } else if (isInteger(key)) {
              key = ~~key;
            }
          }
          if (t8 >= len) {
            if (validateOperation && operation.op === "add" && key > obj.length) {
              throw new JsonPatchError("The specified index MUST NOT be greater than the number of elements in the array", "OPERATION_VALUE_OUT_OF_BOUNDS", index, operation, document);
            }
            var returnValue = arrOps[operation.op].call(operation, obj, key, document);
            if (returnValue.test === false) {
              throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
            }
            return returnValue;
          }
        } else {
          if (t8 >= len) {
            var returnValue = objOps[operation.op].call(operation, obj, key, document);
            if (returnValue.test === false) {
              throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
            }
            return returnValue;
          }
        }
        obj = obj[key];
        if (validateOperation && t8 < len && (!obj || typeof obj !== "object")) {
          throw new JsonPatchError("Cannot perform operation at the desired path", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
        }
      }
    }
  }
  function applyPatch(document, patch, validateOperation, mutateDocument, banPrototypeModifications) {
    if (mutateDocument === void 0) {
      mutateDocument = true;
    }
    if (banPrototypeModifications === void 0) {
      banPrototypeModifications = true;
    }
    if (validateOperation) {
      if (!Array.isArray(patch)) {
        throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
      }
    }
    if (!mutateDocument) {
      document = _deepClone(document);
    }
    var results = new Array(patch.length);
    for (var i7 = 0, length_1 = patch.length; i7 < length_1; i7++) {
      results[i7] = applyOperation(document, patch[i7], validateOperation, true, banPrototypeModifications, i7);
      document = results[i7].newDocument;
    }
    results.newDocument = document;
    return results;
  }
  function applyReducer(document, operation, index) {
    var operationResult = applyOperation(document, operation);
    if (operationResult.test === false) {
      throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
    }
    return operationResult.newDocument;
  }
  function validator(operation, index, document, existingPathFragment) {
    if (typeof operation !== "object" || operation === null || Array.isArray(operation)) {
      throw new JsonPatchError("Operation is not an object", "OPERATION_NOT_AN_OBJECT", index, operation, document);
    } else if (!objOps[operation.op]) {
      throw new JsonPatchError("Operation `op` property is not one of operations defined in RFC-6902", "OPERATION_OP_INVALID", index, operation, document);
    } else if (typeof operation.path !== "string") {
      throw new JsonPatchError("Operation `path` property is not a string", "OPERATION_PATH_INVALID", index, operation, document);
    } else if (operation.path.indexOf("/") !== 0 && operation.path.length > 0) {
      throw new JsonPatchError('Operation `path` property must start with "/"', "OPERATION_PATH_INVALID", index, operation, document);
    } else if ((operation.op === "move" || operation.op === "copy") && typeof operation.from !== "string") {
      throw new JsonPatchError("Operation `from` property is not present (applicable in `move` and `copy` operations)", "OPERATION_FROM_REQUIRED", index, operation, document);
    } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && operation.value === void 0) {
      throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_REQUIRED", index, operation, document);
    } else if ((operation.op === "add" || operation.op === "replace" || operation.op === "test") && hasUndefined(operation.value)) {
      throw new JsonPatchError("Operation `value` property is not present (applicable in `add`, `replace` and `test` operations)", "OPERATION_VALUE_CANNOT_CONTAIN_UNDEFINED", index, operation, document);
    } else if (document) {
      if (operation.op == "add") {
        var pathLen = operation.path.split("/").length;
        var existingPathLen = existingPathFragment.split("/").length;
        if (pathLen !== existingPathLen + 1 && pathLen !== existingPathLen) {
          throw new JsonPatchError("Cannot perform an `add` operation at the desired path", "OPERATION_PATH_CANNOT_ADD", index, operation, document);
        }
      } else if (operation.op === "replace" || operation.op === "remove" || operation.op === "_get") {
        if (operation.path !== existingPathFragment) {
          throw new JsonPatchError("Cannot perform the operation at a path that does not exist", "OPERATION_PATH_UNRESOLVABLE", index, operation, document);
        }
      } else if (operation.op === "move" || operation.op === "copy") {
        var existingValue = { op: "_get", path: operation.from, value: void 0 };
        var error = validate([existingValue], document);
        if (error && error.name === "OPERATION_PATH_UNRESOLVABLE") {
          throw new JsonPatchError("Cannot perform the operation from a path that does not exist", "OPERATION_FROM_UNRESOLVABLE", index, operation, document);
        }
      }
    }
  }
  function validate(sequence, document, externalValidator) {
    try {
      if (!Array.isArray(sequence)) {
        throw new JsonPatchError("Patch sequence must be an array", "SEQUENCE_NOT_AN_ARRAY");
      }
      if (document) {
        applyPatch(_deepClone(document), _deepClone(sequence), externalValidator || true);
      } else {
        externalValidator = externalValidator || validator;
        for (var i7 = 0; i7 < sequence.length; i7++) {
          externalValidator(sequence[i7], i7, document, void 0);
        }
      }
    } catch (e3) {
      if (e3 instanceof JsonPatchError) {
        return e3;
      } else {
        throw e3;
      }
    }
  }
  function _areEquals(a5, b) {
    if (a5 === b)
      return true;
    if (a5 && b && typeof a5 == "object" && typeof b == "object") {
      var arrA = Array.isArray(a5), arrB = Array.isArray(b), i7, length, key;
      if (arrA && arrB) {
        length = a5.length;
        if (length != b.length)
          return false;
        for (i7 = length; i7-- !== 0; )
          if (!_areEquals(a5[i7], b[i7]))
            return false;
        return true;
      }
      if (arrA != arrB)
        return false;
      var keys = Object.keys(a5);
      length = keys.length;
      if (length !== Object.keys(b).length)
        return false;
      for (i7 = length; i7-- !== 0; )
        if (!b.hasOwnProperty(keys[i7]))
          return false;
      for (i7 = length; i7-- !== 0; ) {
        key = keys[i7];
        if (!_areEquals(a5[key], b[key]))
          return false;
      }
      return true;
    }
    return a5 !== a5 && b !== b;
  }

  // ../../node_modules/.pnpm/fast-json-patch@3.1.1/node_modules/fast-json-patch/module/duplex.mjs
  var duplex_exports = {};
  __export(duplex_exports, {
    compare: () => compare,
    generate: () => generate,
    observe: () => observe,
    unobserve: () => unobserve
  });
  var beforeDict = /* @__PURE__ */ new WeakMap();
  var Mirror = (
    /** @class */
    /* @__PURE__ */ (function() {
      function Mirror2(obj) {
        this.observers = /* @__PURE__ */ new Map();
        this.obj = obj;
      }
      return Mirror2;
    })()
  );
  var ObserverInfo = (
    /** @class */
    /* @__PURE__ */ (function() {
      function ObserverInfo2(callback, observer) {
        this.callback = callback;
        this.observer = observer;
      }
      return ObserverInfo2;
    })()
  );
  function getMirror(obj) {
    return beforeDict.get(obj);
  }
  function getObserverFromMirror(mirror, callback) {
    return mirror.observers.get(callback);
  }
  function removeObserverFromMirror(mirror, observer) {
    mirror.observers.delete(observer.callback);
  }
  function unobserve(root, observer) {
    observer.unobserve();
  }
  function observe(obj, callback) {
    var patches = [];
    var observer;
    var mirror = getMirror(obj);
    if (!mirror) {
      mirror = new Mirror(obj);
      beforeDict.set(obj, mirror);
    } else {
      var observerInfo = getObserverFromMirror(mirror, callback);
      observer = observerInfo && observerInfo.observer;
    }
    if (observer) {
      return observer;
    }
    observer = {};
    mirror.value = _deepClone(obj);
    if (callback) {
      observer.callback = callback;
      observer.next = null;
      var dirtyCheck = function() {
        generate(observer);
      };
      var fastCheck = function() {
        clearTimeout(observer.next);
        observer.next = setTimeout(dirtyCheck);
      };
      if (typeof window !== "undefined") {
        window.addEventListener("mouseup", fastCheck);
        window.addEventListener("keyup", fastCheck);
        window.addEventListener("mousedown", fastCheck);
        window.addEventListener("keydown", fastCheck);
        window.addEventListener("change", fastCheck);
      }
    }
    observer.patches = patches;
    observer.object = obj;
    observer.unobserve = function() {
      generate(observer);
      clearTimeout(observer.next);
      removeObserverFromMirror(mirror, observer);
      if (typeof window !== "undefined") {
        window.removeEventListener("mouseup", fastCheck);
        window.removeEventListener("keyup", fastCheck);
        window.removeEventListener("mousedown", fastCheck);
        window.removeEventListener("keydown", fastCheck);
        window.removeEventListener("change", fastCheck);
      }
    };
    mirror.observers.set(callback, new ObserverInfo(callback, observer));
    return observer;
  }
  function generate(observer, invertible) {
    if (invertible === void 0) {
      invertible = false;
    }
    var mirror = beforeDict.get(observer.object);
    _generate(mirror.value, observer.object, observer.patches, "", invertible);
    if (observer.patches.length) {
      applyPatch(mirror.value, observer.patches);
    }
    var temp = observer.patches;
    if (temp.length > 0) {
      observer.patches = [];
      if (observer.callback) {
        observer.callback(temp);
      }
    }
    return temp;
  }
  function _generate(mirror, obj, patches, path, invertible) {
    if (obj === mirror) {
      return;
    }
    if (typeof obj.toJSON === "function") {
      obj = obj.toJSON();
    }
    var newKeys = _objectKeys(obj);
    var oldKeys = _objectKeys(mirror);
    var changed = false;
    var deleted = false;
    for (var t8 = oldKeys.length - 1; t8 >= 0; t8--) {
      var key = oldKeys[t8];
      var oldVal = mirror[key];
      if (hasOwnProperty(obj, key) && !(obj[key] === void 0 && oldVal !== void 0 && Array.isArray(obj) === false)) {
        var newVal = obj[key];
        if (typeof oldVal == "object" && oldVal != null && typeof newVal == "object" && newVal != null && Array.isArray(oldVal) === Array.isArray(newVal)) {
          _generate(oldVal, newVal, patches, path + "/" + escapePathComponent(key), invertible);
        } else {
          if (oldVal !== newVal) {
            changed = true;
            if (invertible) {
              patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
            }
            patches.push({ op: "replace", path: path + "/" + escapePathComponent(key), value: _deepClone(newVal) });
          }
        }
      } else if (Array.isArray(mirror) === Array.isArray(obj)) {
        if (invertible) {
          patches.push({ op: "test", path: path + "/" + escapePathComponent(key), value: _deepClone(oldVal) });
        }
        patches.push({ op: "remove", path: path + "/" + escapePathComponent(key) });
        deleted = true;
      } else {
        if (invertible) {
          patches.push({ op: "test", path, value: mirror });
        }
        patches.push({ op: "replace", path, value: obj });
        changed = true;
      }
    }
    if (!deleted && newKeys.length == oldKeys.length) {
      return;
    }
    for (var t8 = 0; t8 < newKeys.length; t8++) {
      var key = newKeys[t8];
      if (!hasOwnProperty(mirror, key) && obj[key] !== void 0) {
        patches.push({ op: "add", path: path + "/" + escapePathComponent(key), value: _deepClone(obj[key]) });
      }
    }
  }
  function compare(tree1, tree2, invertible) {
    if (invertible === void 0) {
      invertible = false;
    }
    var patches = [];
    _generate(tree1, tree2, patches, "", invertible);
    return patches;
  }

  // ../../node_modules/.pnpm/fast-json-patch@3.1.1/node_modules/fast-json-patch/index.mjs
  var fast_json_patch_default = Object.assign({}, core_exports3, duplex_exports, {
    JsonPatchError: PatchError,
    deepClone: _deepClone,
    escapePathComponent,
    unescapePathComponent
  });

  // ../../node_modules/.pnpm/untruncate-json@0.0.1/node_modules/untruncate-json/dist/esm/index.js
  function isWhitespace(char) {
    return " \r\n	".indexOf(char) >= 0;
  }
  function untruncateJson(json) {
    var contextStack = [
      "topLevel"
      /* TOP_LEVEL */
    ];
    var position = 0;
    var respawnPosition;
    var respawnStackLength;
    var respawnReason;
    var push = function(context) {
      return contextStack.push(context);
    };
    var replace = function(context) {
      return contextStack[contextStack.length - 1] = context;
    };
    var setRespawn = function(reason) {
      if (respawnPosition == null) {
        respawnPosition = position;
        respawnStackLength = contextStack.length;
        respawnReason = reason;
      }
    };
    var clearRespawn = function(reason) {
      if (reason === respawnReason) {
        respawnPosition = void 0;
        respawnStackLength = void 0;
        respawnReason = void 0;
      }
    };
    var pop = function() {
      return contextStack.pop();
    };
    var dontConsumeCharacter = function() {
      return position--;
    };
    var startAny = function(char2) {
      if ("0" <= char2 && char2 <= "9") {
        push(
          "number"
          /* NUMBER */
        );
        return;
      }
      switch (char2) {
        case '"':
          push(
            "string"
            /* STRING */
          );
          return;
        case "-":
          push(
            "numberNeedsDigit"
            /* NUMBER_NEEDS_DIGIT */
          );
          return;
        case "t":
          push(
            "true"
            /* TRUE */
          );
          return;
        case "f":
          push(
            "false"
            /* FALSE */
          );
          return;
        case "n":
          push(
            "null"
            /* NULL */
          );
          return;
        case "[":
          push(
            "arrayNeedsValue"
            /* ARRAY_NEEDS_VALUE */
          );
          return;
        case "{":
          push(
            "objectNeedsKey"
            /* OBJECT_NEEDS_KEY */
          );
          return;
      }
    };
    for (var length = json.length; position < length; position++) {
      var char = json[position];
      switch (contextStack[contextStack.length - 1]) {
        case "topLevel":
          startAny(char);
          break;
        case "string":
          switch (char) {
            case '"':
              pop();
              break;
            case "\\":
              setRespawn(
                "stringEscape"
                /* STRING_ESCAPE */
              );
              push(
                "stringEscaped"
                /* STRING_ESCAPED */
              );
              break;
          }
          break;
        case "stringEscaped":
          if (char === "u") {
            push(
              "stringUnicode"
              /* STRING_UNICODE */
            );
          } else {
            clearRespawn(
              "stringEscape"
              /* STRING_ESCAPE */
            );
            pop();
          }
          break;
        case "stringUnicode":
          if (position - json.lastIndexOf("u", position) === 4) {
            clearRespawn(
              "stringEscape"
              /* STRING_ESCAPE */
            );
            pop();
          }
          break;
        case "number":
          if (char === ".") {
            replace(
              "numberNeedsDigit"
              /* NUMBER_NEEDS_DIGIT */
            );
          } else if (char === "e" || char === "E") {
            replace(
              "numberNeedsExponent"
              /* NUMBER_NEEDS_EXPONENT */
            );
          } else if (char < "0" || char > "9") {
            dontConsumeCharacter();
            pop();
          }
          break;
        case "numberNeedsDigit":
          replace(
            "number"
            /* NUMBER */
          );
          break;
        case "numberNeedsExponent":
          if (char === "+" || char === "-") {
            replace(
              "numberNeedsDigit"
              /* NUMBER_NEEDS_DIGIT */
            );
          } else {
            replace(
              "number"
              /* NUMBER */
            );
          }
          break;
        case "true":
        case "false":
        case "null":
          if (char < "a" || char > "z") {
            dontConsumeCharacter();
            pop();
          }
          break;
        case "arrayNeedsValue":
          if (char === "]") {
            pop();
          } else if (!isWhitespace(char)) {
            clearRespawn(
              "collectionItem"
              /* COLLECTION_ITEM */
            );
            replace(
              "arrayNeedsComma"
              /* ARRAY_NEEDS_COMMA */
            );
            startAny(char);
          }
          break;
        case "arrayNeedsComma":
          if (char === "]") {
            pop();
          } else if (char === ",") {
            setRespawn(
              "collectionItem"
              /* COLLECTION_ITEM */
            );
            replace(
              "arrayNeedsValue"
              /* ARRAY_NEEDS_VALUE */
            );
          }
          break;
        case "objectNeedsKey":
          if (char === "}") {
            pop();
          } else if (char === '"') {
            setRespawn(
              "collectionItem"
              /* COLLECTION_ITEM */
            );
            replace(
              "objectNeedsColon"
              /* OBJECT_NEEDS_COLON */
            );
            push(
              "string"
              /* STRING */
            );
          }
          break;
        case "objectNeedsColon":
          if (char === ":") {
            replace(
              "objectNeedsValue"
              /* OBJECT_NEEDS_VALUE */
            );
          }
          break;
        case "objectNeedsValue":
          if (!isWhitespace(char)) {
            clearRespawn(
              "collectionItem"
              /* COLLECTION_ITEM */
            );
            replace(
              "objectNeedsComma"
              /* OBJECT_NEEDS_COMMA */
            );
            startAny(char);
          }
          break;
        case "objectNeedsComma":
          if (char === "}") {
            pop();
          } else if (char === ",") {
            setRespawn(
              "collectionItem"
              /* COLLECTION_ITEM */
            );
            replace(
              "objectNeedsKey"
              /* OBJECT_NEEDS_KEY */
            );
          }
          break;
      }
    }
    if (respawnStackLength != null) {
      contextStack.length = respawnStackLength;
    }
    var result = [
      respawnPosition != null ? json.slice(0, respawnPosition) : json
    ];
    var finishWord = function(word) {
      return result.push(word.slice(json.length - json.lastIndexOf(word[0])));
    };
    for (var i7 = contextStack.length - 1; i7 >= 0; i7--) {
      switch (contextStack[i7]) {
        case "string":
          result.push('"');
          break;
        case "numberNeedsDigit":
        case "numberNeedsExponent":
          result.push("0");
          break;
        case "true":
          finishWord("true");
          break;
        case "false":
          finishWord("false");
          break;
        case "null":
          finishWord("null");
          break;
        case "arrayNeedsValue":
        case "arrayNeedsComma":
          result.push("]");
          break;
        case "objectNeedsKey":
        case "objectNeedsColon":
        case "objectNeedsValue":
        case "objectNeedsComma":
          result.push("}");
          break;
      }
    }
    return result.join("");
  }

  // ../../sdks/typescript/packages/client/dist/apply/default.mjs
  var a = async function* (a5, o4, s3, c3) {
    let l2 = t(s3.messages), u2 = t(a5.state), d2 = {}, f2 = (e3) => {
      e3.messages !== void 0 && (l2 = e3.messages, d2.messages = e3.messages), e3.state !== void 0 && (u2 = e3.state, d2.state = e3.state);
    }, p2 = () => {
      let t8 = t(d2);
      if (d2 = {}, t8.messages !== void 0 || t8.state !== void 0) return t8;
    }, m2 = false;
    for await (let h of o4) {
      let o5 = await t2(c3, l2, u2, (e3, t8, n6) => e3.onEvent?.({ event: h, agent: s3, input: a5, messages: t8, state: n6 }));
      if (f2(o5), o5.stopPropagation === true) {
        let e3 = p2();
        e3 && (yield e3, m2 = true);
        continue;
      }
      switch (h.type) {
        case EventType.TEXT_MESSAGE_START: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onTextMessageStartEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { messageId: e4, role: t8 = `assistant` } = h;
            if (!l2.find((t9) => t9.id === e4)) {
              let n6 = { id: e4, role: t8, content: `` };
              l2.push(n6), f2({ messages: l2 });
            }
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.TEXT_MESSAGE_CONTENT: {
          let { messageId: e3, delta: n6 } = h, r5 = l2.find((t8) => t8.id === e3);
          if (!r5) {
            console.warn(`TEXT_MESSAGE_CONTENT: No message found with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          let i7 = await t2(c3, l2, u2, (e4, t8, n7) => e4.onTextMessageContentEvent?.({ event: h, messages: t8, state: n7, agent: s3, input: a5, textMessageBuffer: typeof r5.content == `string` ? r5.content : `` }));
          f2(i7), i7.stopPropagation !== true && (r5.content = `${typeof r5.content == `string` ? r5.content : ``}${n6}`, f2({ messages: l2 }));
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.TEXT_MESSAGE_END: {
          let { messageId: e3 } = h, n6 = l2.find((t8) => t8.id === e3);
          if (!n6) {
            console.warn(`TEXT_MESSAGE_END: No message found with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          f2(await t2(c3, l2, u2, (e4, t8, r5) => e4.onTextMessageEndEvent?.({ event: h, messages: t8, state: r5, agent: s3, input: a5, textMessageBuffer: typeof n6.content == `string` ? n6.content : `` }))), await Promise.all(c3.map((e4) => {
            e4.onNewMessage?.({ message: n6, messages: l2, state: u2, agent: s3, input: a5 });
          }));
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.TOOL_CALL_START: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onToolCallStartEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { toolCallId: e4, toolCallName: t8, parentMessageId: n6 } = h, r5;
            n6 && l2.length > 0 && l2[l2.length - 1].id === n6 ? r5 = l2[l2.length - 1] : (r5 = { id: n6 || e4, role: `assistant`, toolCalls: [] }, l2.push(r5)), r5.toolCalls ??= [], r5.toolCalls.push({ id: e4, type: `function`, function: { name: t8, arguments: `` } }), f2({ messages: l2 });
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.TOOL_CALL_ARGS: {
          let { toolCallId: e3, delta: n6 } = h, r5 = l2.find((t8) => t8.toolCalls?.some((t9) => t9.id === e3));
          if (!r5) {
            console.warn(`TOOL_CALL_ARGS: No message found containing tool call with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          let o6 = r5.toolCalls?.find((t8) => t8.id === e3);
          if (!o6) {
            console.warn(`TOOL_CALL_ARGS: No tool call found with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          let d3 = await t2(c3, l2, u2, (e4, t8, n7) => {
            let r6 = o6.function.arguments, c4 = o6.function.name, l3 = {};
            try {
              l3 = untruncateJson(r6);
            } catch {
            }
            return e4.onToolCallArgsEvent?.({ event: h, messages: t8, state: n7, agent: s3, input: a5, toolCallBuffer: r6, toolCallName: c4, partialToolCallArgs: l3 });
          });
          f2(d3), d3.stopPropagation !== true && (o6.function.arguments += n6, f2({ messages: l2 }));
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.TOOL_CALL_END: {
          let { toolCallId: e3 } = h, n6 = l2.find((t8) => t8.toolCalls?.some((t9) => t9.id === e3));
          if (!n6) {
            console.warn(`TOOL_CALL_END: No message found containing tool call with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          let r5 = n6.toolCalls?.find((t8) => t8.id === e3);
          if (!r5) {
            console.warn(`TOOL_CALL_END: No tool call found with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          f2(await t2(c3, l2, u2, (e4, t8, n7) => {
            let i7 = r5.function.arguments, o6 = r5.function.name, c4 = {};
            try {
              c4 = JSON.parse(i7);
            } catch {
            }
            return e4.onToolCallEndEvent?.({ event: h, messages: t8, state: n7, agent: s3, input: a5, toolCallName: o6, toolCallArgs: c4 });
          })), await Promise.all(c3.map((e4) => {
            e4.onNewToolCall?.({ toolCall: r5, messages: l2, state: u2, agent: s3, input: a5 });
          }));
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.TOOL_CALL_RESULT: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onToolCallResultEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { messageId: e4, toolCallId: t8, content: n6, role: r5 } = h, i7 = { id: e4, toolCallId: t8, role: r5 || `tool`, content: n6 };
            l2.push(i7), await Promise.all(c3.map((e5) => {
              e5.onNewMessage?.({ message: i7, messages: l2, state: u2, agent: s3, input: a5 });
            })), f2({ messages: l2 });
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.STATE_SNAPSHOT: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onStateSnapshotEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { snapshot: e4 } = h;
            u2 = e4, f2({ state: u2 });
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.STATE_DELTA: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onStateDeltaEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { delta: e4 } = h;
            try {
              u2 = applyPatch(u2, e4, true, false).newDocument, f2({ state: u2 });
            } catch (t8) {
              let n6 = t8 instanceof Error ? t8.message : String(t8);
              console.warn(`Failed to apply state patch:
Current state: ${JSON.stringify(u2, null, 2)}
Patch operations: ${JSON.stringify(e4, null, 2)}
Error: ${n6}`);
            }
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.MESSAGES_SNAPSHOT: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onMessagesSnapshotEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { messages: e4 } = h;
            l2 = e4, f2({ messages: l2 });
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.ACTIVITY_SNAPSHOT: {
          let n6 = h, r5 = l2.findIndex((e3) => e3.id === n6.messageId), i7 = r5 >= 0 ? l2[r5] : void 0, o6 = i7?.role === `activity` ? i7 : void 0, d3 = n6.replace ?? true, g = await t2(c3, l2, u2, (e3, t8, r6) => e3.onActivitySnapshotEvent?.({ event: n6, messages: t8, state: r6, agent: s3, input: a5, activityMessage: o6, existingMessage: i7 }));
          if (f2(g), g.stopPropagation !== true) {
            let t8 = { id: n6.messageId, role: `activity`, activityType: n6.activityType, content: t(n6.content) }, i8;
            r5 === -1 ? (l2.push(t8), i8 = t8) : o6 ? d3 && (l2[r5] = { ...o6, activityType: n6.activityType, content: t(n6.content) }) : d3 && (l2[r5] = t8, i8 = t8), f2({ messages: l2 }), i8 && await Promise.all(c3.map((e3) => e3.onNewMessage?.({ message: i8, messages: l2, state: u2, agent: s3, input: a5 })));
          }
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        }
        case EventType.ACTIVITY_DELTA: {
          let n6 = h, i7 = l2.findIndex((e3) => e3.id === n6.messageId);
          if (i7 === -1) {
            console.warn(`ACTIVITY_DELTA: No message found with ID '${n6.messageId}' to apply patch`);
            {
              let e3 = p2();
              e3 && (yield e3, m2 = true);
              break;
            }
          }
          let o6 = l2[i7];
          if (o6.role !== `activity`) {
            console.warn(`ACTIVITY_DELTA: Message '${n6.messageId}' is not an activity message`);
            {
              let e3 = p2();
              e3 && (yield e3, m2 = true);
              break;
            }
          }
          let d3 = o6, g = await t2(c3, l2, u2, (e3, t8, r5) => e3.onActivityDeltaEvent?.({ event: n6, messages: t8, state: r5, agent: s3, input: a5, activityMessage: d3 }));
          if (f2(g), g.stopPropagation !== true) try {
            let t8 = t(d3.content ?? {}), a6 = applyPatch(t8, n6.patch ?? [], true, false).newDocument;
            l2[i7] = { ...d3, content: t(a6), activityType: n6.activityType }, f2({ messages: l2 });
          } catch (e3) {
            let t8 = e3 instanceof Error ? e3.message : String(e3);
            console.warn(`Failed to apply activity patch for '${n6.messageId}': ${t8}`);
          }
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        }
        case EventType.RAW:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onRawEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.CUSTOM:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onCustomEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.RUN_STARTED: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onRunStartedEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let e4 = h;
            if (e4.input?.messages) {
              for (let t8 of e4.input.messages) l2.find((e5) => e5.id === t8.id) || l2.push(t8);
              f2({ messages: l2 });
            }
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.RUN_FINISHED:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onRunFinishedEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5, result: h.result })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.RUN_ERROR:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onRunErrorEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.STEP_STARTED:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onStepStartedEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.STEP_FINISHED:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onStepFinishedEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.TEXT_MESSAGE_CHUNK:
          throw Error(`TEXT_MESSAGE_CHUNK must be tranformed before being applied`);
        case EventType.TOOL_CALL_CHUNK:
          throw Error(`TOOL_CALL_CHUNK must be tranformed before being applied`);
        case EventType.THINKING_START: {
          let e3 = p2();
          e3 && (yield e3, m2 = true);
          break;
        }
        case EventType.THINKING_END: {
          let e3 = p2();
          e3 && (yield e3, m2 = true);
          break;
        }
        case EventType.THINKING_TEXT_MESSAGE_START: {
          let e3 = p2();
          e3 && (yield e3, m2 = true);
          break;
        }
        case EventType.THINKING_TEXT_MESSAGE_CONTENT: {
          let e3 = p2();
          e3 && (yield e3, m2 = true);
          break;
        }
        case EventType.THINKING_TEXT_MESSAGE_END: {
          let e3 = p2();
          e3 && (yield e3, m2 = true);
          break;
        }
        case EventType.REASONING_START:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onReasoningStartEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.REASONING_MESSAGE_START: {
          let e3 = await t2(c3, l2, u2, (e4, t8, n6) => e4.onReasoningMessageStartEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 }));
          if (f2(e3), e3.stopPropagation !== true) {
            let { messageId: e4 } = h;
            if (!l2.find((t8) => t8.id === e4)) {
              let t8 = { id: e4, role: `reasoning`, content: `` };
              l2.push(t8), f2({ messages: l2 });
            }
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.REASONING_MESSAGE_CONTENT: {
          let { messageId: e3, delta: n6 } = h, r5 = l2.find((t8) => t8.id === e3);
          if (!r5) {
            console.warn(`REASONING_MESSAGE_CONTENT: No message found with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          let i7 = await t2(c3, l2, u2, (e4, t8, n7) => e4.onReasoningMessageContentEvent?.({ event: h, messages: t8, state: n7, agent: s3, input: a5, reasoningMessageBuffer: typeof r5.content == `string` ? r5.content : `` }));
          f2(i7), i7.stopPropagation !== true && (r5.content = `${typeof r5.content == `string` ? r5.content : ``}${n6}`, f2({ messages: l2 }));
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.REASONING_MESSAGE_END: {
          let { messageId: e3 } = h, n6 = l2.find((t8) => t8.id === e3);
          if (!n6) {
            console.warn(`REASONING_MESSAGE_END: No message found with ID '${e3}'`);
            {
              let e4 = p2();
              e4 && (yield e4, m2 = true);
              break;
            }
          }
          f2(await t2(c3, l2, u2, (e4, t8, r5) => e4.onReasoningMessageEndEvent?.({ event: h, messages: t8, state: r5, agent: s3, input: a5, reasoningMessageBuffer: typeof n6.content == `string` ? n6.content : `` }))), await Promise.all(c3.map((e4) => {
            e4.onNewMessage?.({ message: n6, messages: l2, state: u2, agent: s3, input: a5 });
          }));
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
        case EventType.REASONING_MESSAGE_CHUNK:
          throw Error(`REASONING_MESSAGE_CHUNK must be transformed before being applied`);
        case EventType.REASONING_END:
          f2(await t2(c3, l2, u2, (e3, t8, n6) => e3.onReasoningEndEvent?.({ event: h, messages: t8, state: n6, agent: s3, input: a5 })));
          {
            let e3 = p2();
            e3 && (yield e3, m2 = true);
            break;
          }
        case EventType.REASONING_ENCRYPTED_VALUE: {
          let { subtype: e3, entityId: n6, encryptedValue: r5 } = h, i7 = await t2(c3, l2, u2, (e4, t8, n7) => e4.onReasoningEncryptedValueEvent?.({ event: h, messages: t8, state: n7, agent: s3, input: a5 }));
          if (f2(i7), i7.stopPropagation !== true) {
            let t8 = false;
            if (e3 === `tool-call`) {
              for (let e4 of l2) if (e4.role === `assistant` && e4.toolCalls) {
                let i8 = e4.toolCalls.find((e5) => e5.id === n6);
                if (i8) {
                  i8.encryptedValue = r5, t8 = true;
                  break;
                }
              }
            } else {
              let e4 = l2.find((e5) => e5.id === n6);
              e4?.role !== `activity` && e4 && (e4.encryptedValue = r5, t8 = true);
            }
            t8 && (d2.messages = l2);
          }
          {
            let e4 = p2();
            e4 && (yield e4, m2 = true);
            break;
          }
        }
      }
    }
    !m2 && c3.length > 0 && (yield {});
  };

  // ../../sdks/typescript/packages/client/dist/verify/verify.mjs
  var n2 = (n6) => async function* (r5) {
    let i7 = /* @__PURE__ */ new Map(), a5 = /* @__PURE__ */ new Map(), o4 = false, s3 = false, c3 = false, l2 = /* @__PURE__ */ new Map(), u2 = false, d2 = false, f2 = false, p2 = () => {
      i7.clear(), a5.clear(), l2.clear(), u2 = false, d2 = false, o4 = false, s3 = false, f2 = true;
    };
    for await (let m2 of r5) {
      let r6 = m2.type;
      if (n6 && console.debug(`[VERIFY]:`, JSON.stringify(m2)), s3) throw new AGUIError(`Cannot send event type '${r6}': The run has already errored with 'RUN_ERROR'. No further events can be sent.`);
      if (o4 && r6 !== EventType.RUN_ERROR && r6 !== EventType.RUN_STARTED) throw new AGUIError(`Cannot send event type '${r6}': The run has already finished with 'RUN_FINISHED'. Start a new run with 'RUN_STARTED'.`);
      if (!c3) {
        if (c3 = true, r6 !== EventType.RUN_STARTED && r6 !== EventType.RUN_ERROR) throw new AGUIError(`First event must be 'RUN_STARTED'`);
      } else if (r6 === EventType.RUN_STARTED) {
        if (f2 && !o4) throw new AGUIError(`Cannot send 'RUN_STARTED' while a run is still active. The previous run must be finished with 'RUN_FINISHED' before starting a new run.`);
        o4 && p2();
      }
      switch (r6) {
        case EventType.TEXT_MESSAGE_START: {
          let t8 = m2.messageId;
          if (i7.has(t8)) throw new AGUIError(`Cannot send 'TEXT_MESSAGE_START' event: A text message with ID '${t8}' is already in progress. Complete it with 'TEXT_MESSAGE_END' first.`);
          i7.set(t8, true), yield m2;
          break;
        }
        case EventType.TEXT_MESSAGE_CONTENT: {
          let t8 = m2.messageId;
          if (!i7.has(t8)) throw new AGUIError(`Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found with ID '${t8}'. Start a text message with 'TEXT_MESSAGE_START' first.`);
          yield m2;
          break;
        }
        case EventType.TEXT_MESSAGE_END: {
          let t8 = m2.messageId;
          if (!i7.has(t8)) throw new AGUIError(`Cannot send 'TEXT_MESSAGE_END' event: No active text message found with ID '${t8}'. A 'TEXT_MESSAGE_START' event must be sent first.`);
          i7.delete(t8), yield m2;
          break;
        }
        case EventType.TOOL_CALL_START: {
          let t8 = m2.toolCallId;
          if (a5.has(t8)) throw new AGUIError(`Cannot send 'TOOL_CALL_START' event: A tool call with ID '${t8}' is already in progress. Complete it with 'TOOL_CALL_END' first.`);
          a5.set(t8, true), yield m2;
          break;
        }
        case EventType.TOOL_CALL_ARGS: {
          let t8 = m2.toolCallId;
          if (!a5.has(t8)) throw new AGUIError(`Cannot send 'TOOL_CALL_ARGS' event: No active tool call found with ID '${t8}'. Start a tool call with 'TOOL_CALL_START' first.`);
          yield m2;
          break;
        }
        case EventType.TOOL_CALL_END: {
          let t8 = m2.toolCallId;
          if (!a5.has(t8)) throw new AGUIError(`Cannot send 'TOOL_CALL_END' event: No active tool call found with ID '${t8}'. A 'TOOL_CALL_START' event must be sent first.`);
          a5.delete(t8), yield m2;
          break;
        }
        case EventType.STEP_STARTED: {
          let t8 = m2.stepName;
          if (l2.has(t8)) throw new AGUIError(`Step "${t8}" is already active for 'STEP_STARTED'`);
          l2.set(t8, true), yield m2;
          break;
        }
        case EventType.STEP_FINISHED: {
          let t8 = m2.stepName;
          if (!l2.has(t8)) throw new AGUIError(`Cannot send 'STEP_FINISHED' for step "${t8}" that was not started`);
          l2.delete(t8), yield m2;
          break;
        }
        case EventType.RUN_STARTED:
          f2 = true, yield m2;
          break;
        case EventType.RUN_FINISHED:
          if (l2.size > 0) throw new AGUIError(`Cannot send 'RUN_FINISHED' while steps are still active: ${Array.from(l2.keys()).join(`, `)}`);
          if (i7.size > 0) throw new AGUIError(`Cannot send 'RUN_FINISHED' while text messages are still active: ${Array.from(i7.keys()).join(`, `)}`);
          if (a5.size > 0) throw new AGUIError(`Cannot send 'RUN_FINISHED' while tool calls are still active: ${Array.from(a5.keys()).join(`, `)}`);
          o4 = true, yield m2;
          break;
        case EventType.RUN_ERROR:
          s3 = true, yield m2;
          break;
        case EventType.CUSTOM:
          yield m2;
          break;
        case EventType.THINKING_TEXT_MESSAGE_START:
          if (!u2) throw new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_START' event: A thinking step is not in progress. Create one with 'THINKING_START' first.`);
          if (d2) throw new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_START' event: A thinking message is already in progress. Complete it with 'THINKING_TEXT_MESSAGE_END' first.`);
          d2 = true, yield m2;
          break;
        case EventType.THINKING_TEXT_MESSAGE_CONTENT:
          if (!d2) throw new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_CONTENT' event: No active thinking message found. Start a message with 'THINKING_TEXT_MESSAGE_START' first.`);
          yield m2;
          break;
        case EventType.THINKING_TEXT_MESSAGE_END:
          if (!d2) throw new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_END' event: No active thinking message found. A 'THINKING_TEXT_MESSAGE_START' event must be sent first.`);
          d2 = false, yield m2;
          break;
        case EventType.THINKING_START:
          if (u2) throw new AGUIError(`Cannot send 'THINKING_START' event: A thinking step is already in progress. End it with 'THINKING_END' first.`);
          u2 = true, yield m2;
          break;
        case EventType.THINKING_END:
          if (!u2) throw new AGUIError(`Cannot send 'THINKING_END' event: No active thinking step found. A 'THINKING_START' event must be sent first.`);
          u2 = false, yield m2;
          break;
        default:
          yield m2;
          break;
      }
    }
  };

  // ../../sdks/typescript/packages/client/dist/run/http-request.mjs
  var e = (function(e3) {
    return e3.HEADERS = `headers`, e3.DATA = `data`, e3;
  })({});
  async function* t3(t8, n6) {
    let r5 = await fetch(t8, n6);
    if (!r5.ok) {
      let e3 = r5.headers.get(`content-type`) || ``, t9 = await r5.text(), n7 = t9;
      if (e3.includes(`application/json`)) try {
        n7 = JSON.parse(t9);
      } catch {
      }
      let i8 = Error(`HTTP ${r5.status}: ${typeof n7 == `string` ? n7 : JSON.stringify(n7)}`);
      throw i8.status = r5.status, i8.payload = n7, i8;
    }
    yield { type: e.HEADERS, status: r5.status, headers: r5.headers };
    let i7 = r5.body?.getReader();
    if (!i7) throw Error(`Failed to getReader() from response`);
    try {
      for (; ; ) {
        let { done: t9, value: n7 } = await i7.read();
        if (t9) break;
        yield { type: e.DATA, data: n7 };
      }
    } finally {
      await i7.cancel().catch((e3) => {
        if (e3?.name !== `AbortError`) throw e3;
      });
    }
  }

  // ../../sdks/typescript/packages/client/dist/transform/sse.mjs
  async function* t4(t8) {
    let r5 = new TextDecoder(`utf-8`, { fatal: false }), i7 = ``;
    for await (let a5 of t8) if (a5.type !== e.HEADERS && a5.type === e.DATA && a5.data) {
      let e3 = r5.decode(a5.data, { stream: true });
      i7 += e3;
      let t9 = i7.split(/\n\n/);
      i7 = t9.pop() || ``;
      for (let e4 of t9) {
        let t10 = n3(e4);
        t10 !== void 0 && (yield t10);
      }
    }
    if (i7) {
      i7 += r5.decode();
      let e3 = n3(i7);
      e3 !== void 0 && (yield e3);
    }
  }
  function n3(e3) {
    let t8 = e3.split(`
`), n6 = [];
    for (let e4 of t8) e4.startsWith(`data:`) && n6.push(e4.slice(5).replace(/^ /, ``));
    if (n6.length > 0) {
      let e4 = n6.join(`
`);
      return JSON.parse(e4);
    }
  }

  // ../../sdks/typescript/packages/client/dist/transform/http.mjs
  async function* r(r5) {
    let a5 = [], o4 = false;
    for await (let s3 of r5) if (!o4 && (a5.push(s3), s3.type === e.HEADERS)) {
      o4 = true, s3.headers.get(`content-type`);
      let e3 = i(a5, r5);
      for await (let r6 of t4(e3)) try {
        yield EventSchemas.parse(r6);
      } catch (e4) {
        throw e4;
      }
      return;
    }
    if (!o4) throw Error(`No headers event received before stream ended`);
  }
  async function* i(e3, t8) {
    for (let t9 of e3) yield t9;
    yield* t8;
  }

  // ../../sdks/typescript/packages/client/dist/legacy/types.mjs
  var t5 = _enum([`TextMessageStart`, `TextMessageContent`, `TextMessageEnd`, `ActionExecutionStart`, `ActionExecutionArgs`, `ActionExecutionEnd`, `ActionExecutionResult`, `AgentStateMessage`, `MetaEvent`, `RunStarted`, `RunFinished`, `RunError`, `NodeStarted`, `NodeFinished`]);
  var n4 = _enum([`LangGraphInterruptEvent`, `PredictState`, `Exit`]);
  var r2 = object({ type: literal(t5.def.entries.TextMessageStart), messageId: string2(), parentMessageId: optional(string2()), role: optional(string2()) });
  var i2 = object({ type: literal(t5.def.entries.TextMessageContent), messageId: string2(), content: string2() });
  var a2 = object({ type: literal(t5.def.entries.TextMessageEnd), messageId: string2() });
  var o = object({ type: literal(t5.def.entries.ActionExecutionStart), actionExecutionId: string2(), actionName: string2(), parentMessageId: optional(string2()) });
  var s = object({ type: literal(t5.def.entries.ActionExecutionArgs), actionExecutionId: string2(), args: string2() });
  var c = object({ type: literal(t5.def.entries.ActionExecutionEnd), actionExecutionId: string2() });
  var l = object({ type: literal(t5.def.entries.ActionExecutionResult), actionName: string2(), actionExecutionId: string2(), result: string2() });
  var u = object({ type: literal(t5.def.entries.AgentStateMessage), threadId: string2(), agentName: string2(), nodeName: string2(), runId: string2(), active: boolean2(), role: string2(), state: string2(), running: boolean2() });
  var d = object({ type: literal(t5.def.entries.MetaEvent), name: n4, value: any() });
  var f = object({ type: literal(t5.def.entries.RunError), message: string2(), code: optional(string2()) });
  discriminatedUnion(`type`, [r2, i2, a2, o, s, c, l, u, d, f]), object({ id: string2(), role: string2(), content: string2(), parentMessageId: optional(string2()) }), object({ id: string2(), name: string2(), arguments: any(), parentMessageId: optional(string2()) }), object({ id: string2(), result: any(), actionExecutionId: string2(), actionName: string2() });

  // ../../sdks/typescript/packages/client/dist/legacy/convert.mjs
  var i3 = (e3) => {
    if (typeof e3 == `string`) return e3;
    if (!Array.isArray(e3)) return;
    let t8 = e3.filter((e4) => e4.type === `text`).map((e4) => e4.text).filter((e4) => e4.length > 0);
    if (t8.length !== 0) return t8.join(`
`);
  };
  var a3 = (i7, a5, s3) => async function* (c3) {
    let l2 = {}, u2 = true, d2 = true, f2 = ``, p2 = null, m2 = null, h = [], g = {}, _ = (e3) => {
      typeof e3 == `object` && e3 && (`messages` in e3 && delete e3.messages, l2 = e3);
    };
    for await (let v of c3) switch (v.type) {
      case EventType.TEXT_MESSAGE_START: {
        let t8 = v;
        yield { type: t5.def.entries.TextMessageStart, messageId: t8.messageId, role: t8.role };
        break;
      }
      case EventType.TEXT_MESSAGE_CONTENT: {
        let t8 = v;
        yield { type: t5.def.entries.TextMessageContent, messageId: t8.messageId, content: t8.delta };
        break;
      }
      case EventType.TEXT_MESSAGE_END: {
        let t8 = v;
        yield { type: t5.def.entries.TextMessageEnd, messageId: t8.messageId };
        break;
      }
      case EventType.TOOL_CALL_START: {
        let t8 = v;
        h.push({ id: t8.toolCallId, type: `function`, function: { name: t8.toolCallName, arguments: `` } }), d2 = true, g[t8.toolCallId] = t8.toolCallName, yield { type: t5.def.entries.ActionExecutionStart, actionExecutionId: t8.toolCallId, actionName: t8.toolCallName, parentMessageId: t8.parentMessageId };
        break;
      }
      case EventType.TOOL_CALL_ARGS: {
        let t8 = v, n6 = h.find((e3) => e3.id === t8.toolCallId);
        if (!n6) {
          console.warn(`TOOL_CALL_ARGS: No tool call found with ID '${t8.toolCallId}'`);
          break;
        }
        n6.function.arguments += t8.delta;
        let o4 = false;
        if (m2) {
          let e3 = m2.find((e4) => e4.tool == n6.function.name);
          if (e3) try {
            let t9 = JSON.parse(untruncateJson(n6.function.arguments));
            e3.tool_argument && e3.tool_argument in t9 ? (_({ ...l2, [e3.state_key]: t9[e3.tool_argument] }), o4 = true) : e3.tool_argument || (_({ ...l2, [e3.state_key]: t9 }), o4 = true);
          } catch {
          }
        }
        yield { type: t5.def.entries.ActionExecutionArgs, actionExecutionId: t8.toolCallId, args: t8.delta }, o4 && (yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify(l2), active: d2 });
        break;
      }
      case EventType.TOOL_CALL_END: {
        let t8 = v;
        yield { type: t5.def.entries.ActionExecutionEnd, actionExecutionId: t8.toolCallId };
        break;
      }
      case EventType.TOOL_CALL_RESULT: {
        let t8 = v;
        yield { type: t5.def.entries.ActionExecutionResult, actionExecutionId: t8.toolCallId, result: t8.content, actionName: g[t8.toolCallId] || `unknown` };
        break;
      }
      case EventType.RAW:
        break;
      case EventType.CUSTOM: {
        let t8 = v;
        switch (t8.name) {
          case `Exit`:
            u2 = false;
            break;
          case `PredictState`:
            m2 = t8.value;
            break;
        }
        yield { type: t5.def.entries.MetaEvent, name: t8.name, value: t8.value };
        break;
      }
      case EventType.STATE_SNAPSHOT:
        _(v.snapshot), yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify(l2), active: d2 };
        break;
      case EventType.STATE_DELTA: {
        let t8 = v, r5 = applyPatch(l2, t8.delta, true, false);
        if (!r5) break;
        _(r5.newDocument), yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify(l2), active: d2 };
        break;
      }
      case EventType.MESSAGES_SNAPSHOT:
        p2 = v.messages, yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify({ ...l2, ...p2 ? { messages: p2 } : {} }), active: true };
        break;
      case EventType.RUN_STARTED:
        break;
      case EventType.RUN_FINISHED:
        if (p2 && (l2.messages = p2), Object.keys(l2).length === 0) break;
        yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify({ ...l2, ...p2 ? { messages: o2(p2) } : {} }), active: false };
        break;
      case EventType.RUN_ERROR: {
        let t8 = v;
        yield { type: t5.def.entries.RunError, message: t8.message, code: t8.code };
        break;
      }
      case EventType.STEP_STARTED:
        f2 = v.stepName, h = [], m2 = null, yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify(l2), active: true };
        break;
      case EventType.STEP_FINISHED:
        h = [], m2 = null, yield { type: t5.def.entries.AgentStateMessage, threadId: i7, agentName: s3, nodeName: f2, runId: a5, running: u2, role: `assistant`, state: JSON.stringify(l2), active: false };
        break;
      default:
        break;
    }
  };
  function o2(e3) {
    let t8 = [];
    for (let n6 of e3) if (n6.role === `assistant` || n6.role === `user` || n6.role === `system`) {
      let e4 = i3(n6.content);
      if (e4) {
        let r5 = { id: n6.id, role: n6.role, content: e4 };
        t8.push(r5);
      }
      if (n6.role === `assistant` && n6.toolCalls && n6.toolCalls.length > 0) for (let e5 of n6.toolCalls) {
        let r5 = { id: e5.id, name: e5.function.name, arguments: JSON.parse(e5.function.arguments), parentMessageId: n6.id };
        t8.push(r5);
      }
    } else if (n6.role === `tool`) {
      let r5 = `unknown`;
      for (let t9 of e3) if (t9.role === `assistant` && t9.toolCalls?.length) {
        for (let e4 of t9.toolCalls) if (e4.id === n6.toolCallId) {
          r5 = e4.function.name;
          break;
        }
      }
      let i7 = { id: n6.id, result: n6.content, actionExecutionId: n6.toolCallId, actionName: r5 };
      t8.push(i7);
    }
    return t8;
  }

  // ../../sdks/typescript/packages/client/dist/chunks/transform.mjs
  var t6 = (t8) => async function* (n6) {
    let r5, i7, a5, o4, s3 = () => {
      if (!r5 || o4 !== `text`) throw Error(`No text message to close`);
      let n7 = { type: EventType.TEXT_MESSAGE_END, messageId: r5.messageId };
      return o4 = void 0, r5 = void 0, t8 && console.debug(`[TRANSFORM]: TEXT_MESSAGE_END`, JSON.stringify(n7)), n7;
    }, c3 = () => {
      if (!i7 || o4 !== `tool`) throw Error(`No tool call to close`);
      let n7 = { type: EventType.TOOL_CALL_END, toolCallId: i7.toolCallId };
      return o4 = void 0, i7 = void 0, t8 && console.debug(`[TRANSFORM]: TOOL_CALL_END`, JSON.stringify(n7)), n7;
    }, l2 = () => {
      if (!a5 || o4 !== `reasoning`) throw Error(`No reasoning message to close`);
      let n7 = { type: EventType.REASONING_MESSAGE_END, messageId: a5.messageId };
      return o4 = void 0, a5 = void 0, t8 && console.debug(`[TRANSFORM]: REASONING_MESSAGE_END`, JSON.stringify(n7)), n7;
    }, u2 = () => o4 === `text` ? [s3()] : o4 === `tool` ? [c3()] : o4 === `reasoning` ? [l2()] : [];
    try {
      for await (let s4 of n6) switch (s4.type) {
        case EventType.TEXT_MESSAGE_START:
        case EventType.TEXT_MESSAGE_CONTENT:
        case EventType.TEXT_MESSAGE_END:
        case EventType.TOOL_CALL_START:
        case EventType.TOOL_CALL_ARGS:
        case EventType.TOOL_CALL_END:
        case EventType.TOOL_CALL_RESULT:
        case EventType.STATE_SNAPSHOT:
        case EventType.STATE_DELTA:
        case EventType.MESSAGES_SNAPSHOT:
        case EventType.CUSTOM:
        case EventType.RUN_STARTED:
        case EventType.RUN_FINISHED:
        case EventType.RUN_ERROR:
        case EventType.STEP_STARTED:
        case EventType.STEP_FINISHED:
        case EventType.THINKING_START:
        case EventType.THINKING_END:
        case EventType.THINKING_TEXT_MESSAGE_START:
        case EventType.THINKING_TEXT_MESSAGE_CONTENT:
        case EventType.THINKING_TEXT_MESSAGE_END:
        case EventType.REASONING_START:
        case EventType.REASONING_MESSAGE_START:
        case EventType.REASONING_MESSAGE_CONTENT:
        case EventType.REASONING_MESSAGE_END:
        case EventType.REASONING_END:
          yield* [...u2(), s4];
          break;
        case EventType.RAW:
        case EventType.ACTIVITY_SNAPSHOT:
        case EventType.ACTIVITY_DELTA:
        case EventType.REASONING_ENCRYPTED_VALUE:
          yield s4;
          break;
        case EventType.TEXT_MESSAGE_CHUNK: {
          let n7 = s4;
          if ((o4 !== `text` || n7.messageId !== void 0 && n7.messageId !== r5?.messageId) && (yield* u2()), o4 !== `text`) {
            if (n7.messageId === void 0) throw Error(`First TEXT_MESSAGE_CHUNK must have a messageId`);
            r5 = { messageId: n7.messageId }, o4 = `text`;
            let i8 = { type: EventType.TEXT_MESSAGE_START, messageId: n7.messageId, role: n7.role || `assistant` };
            yield i8, t8 && console.debug(`[TRANSFORM]: TEXT_MESSAGE_START`, JSON.stringify(i8));
          }
          if (n7.delta !== void 0) {
            let i8 = { type: EventType.TEXT_MESSAGE_CONTENT, messageId: r5.messageId, delta: n7.delta };
            yield i8, t8 && console.debug(`[TRANSFORM]: TEXT_MESSAGE_CONTENT`, JSON.stringify(i8));
          }
          break;
        }
        case EventType.TOOL_CALL_CHUNK: {
          let n7 = s4;
          if ((o4 !== `tool` || n7.toolCallId !== void 0 && n7.toolCallId !== i7?.toolCallId) && (yield* u2()), o4 !== `tool`) {
            if (n7.toolCallId === void 0) throw Error(`First TOOL_CALL_CHUNK must have a toolCallId`);
            if (n7.toolCallName === void 0) throw Error(`First TOOL_CALL_CHUNK must have a toolCallName`);
            i7 = { toolCallId: n7.toolCallId, toolCallName: n7.toolCallName, parentMessageId: n7.parentMessageId }, o4 = `tool`;
            let r6 = { type: EventType.TOOL_CALL_START, toolCallId: n7.toolCallId, toolCallName: n7.toolCallName, parentMessageId: n7.parentMessageId };
            yield r6, t8 && console.debug(`[TRANSFORM]: TOOL_CALL_START`, JSON.stringify(r6));
          }
          if (n7.delta !== void 0) {
            let r6 = { type: EventType.TOOL_CALL_ARGS, toolCallId: i7.toolCallId, delta: n7.delta };
            yield r6, t8 && console.debug(`[TRANSFORM]: TOOL_CALL_ARGS`, JSON.stringify(r6));
          }
          break;
        }
        case EventType.REASONING_MESSAGE_CHUNK: {
          let n7 = s4;
          if ((o4 !== `reasoning` || n7.messageId && n7.messageId !== a5?.messageId) && (yield* u2()), o4 !== `reasoning`) {
            if (n7.messageId === void 0) throw Error(`First REASONING_MESSAGE_CHUNK must have a messageId`);
            a5 = { messageId: n7.messageId }, o4 = `reasoning`;
            let r6 = { type: EventType.REASONING_MESSAGE_START, messageId: n7.messageId };
            yield r6, t8 && console.debug(`[TRANSFORM]: REASONING_MESSAGE_START`, JSON.stringify(r6));
          }
          if (n7.delta !== void 0) {
            let r6 = { type: EventType.REASONING_MESSAGE_CONTENT, messageId: a5.messageId, delta: n7.delta };
            yield r6, t8 && console.debug(`[TRANSFORM]: REASONING_MESSAGE_CONTENT`, JSON.stringify(r6));
          }
          break;
        }
      }
    } finally {
      u2();
    }
  };

  // ../../sdks/typescript/packages/client/dist/middleware/middleware.mjs
  var r3 = class {
    runNext(e3, t8) {
      return t6(false)(t8.run(e3));
    }
    async *runNextWithState(n6, r5) {
      let i7 = t(n6.messages || []), a5 = t(n6.state || {});
      for await (let o4 of this.runNext(n6, r5)) {
        let s3 = a(n6, (async function* () {
          yield o4;
        })(), r5, []);
        for await (let e3 of s3) e3.messages !== void 0 && (i7 = e3.messages), e3.state !== void 0 && (a5 = e3.state);
        yield { event: o4, messages: t(i7), state: t(a5) };
      }
    }
  };
  var i4 = class extends r3 {
    constructor(e3) {
      super(), this.fn = e3;
    }
    run(e3, t8) {
      return this.fn(e3, t8);
    }
  };

  // ../../sdks/typescript/packages/client/dist/middleware/backward-compatibility-0-0-39.mjs
  function t7(e3) {
    let t8 = e3.content;
    if (Array.isArray(t8)) {
      let n6 = t8.filter((e4) => typeof e4 == `object` && !!e4 && `type` in e4 && e4.type === `text` && typeof e4.text == `string`).map((e4) => e4.text).join(``);
      return { ...e3, content: n6 };
    }
    return typeof t8 == `string` ? e3 : { ...e3, content: `` };
  }
  var n5 = class extends r3 {
    run(e3, n6) {
      let { parentRunId: r5, ...i7 } = e3, a5 = { ...i7, messages: i7.messages.map(t7) };
      return this.runNext(a5, n6);
    }
  };

  // ../../sdks/typescript/packages/client/dist/middleware/backward-compatibility-0-0-45.mjs
  var r4 = `THINKING_START`;
  var i5 = `THINKING_END`;
  var a4 = `THINKING_TEXT_MESSAGE_START`;
  var o3 = `THINKING_TEXT_MESSAGE_CONTENT`;
  var s2 = `THINKING_TEXT_MESSAGE_END`;
  var c2 = class extends r3 {
    constructor(...e3) {
      super(...e3), this.currentReasoningId = null, this.currentMessageId = null;
    }
    warnAboutTransformation(e3, t8) {
      process.env.SUPPRESS_TRANSFORMATION_WARNINGS || console.warn(`AG-UI is converting ${e3} to ${t8}. To remove this warning, upgrade your AG-UI integration package (e.g. @ag-ui/langgraph). To surpress it, set SUPPRESS_TRANSFORMATION_WARNINGS=true in your .env file.`);
    }
    async *run(e3, t8) {
      this.currentReasoningId = null, this.currentMessageId = null;
      for await (let n6 of this.runNext(e3, t8)) yield this.transformEvent(n6);
    }
    transformEvent(t8) {
      switch (t8.type) {
        case r4: {
          this.currentReasoningId = n();
          let { title: i7, ...a5 } = t8;
          return this.warnAboutTransformation(r4, EventType.REASONING_START), { ...a5, type: EventType.REASONING_START, messageId: this.currentReasoningId };
        }
        case a4:
          return this.currentMessageId = n(), this.warnAboutTransformation(a4, EventType.REASONING_MESSAGE_START), { ...t8, type: EventType.REASONING_MESSAGE_START, messageId: this.currentMessageId, role: `assistant` };
        case o3: {
          let { delta: r5, ...i7 } = t8;
          return this.warnAboutTransformation(o3, EventType.REASONING_MESSAGE_CONTENT), { ...i7, type: EventType.REASONING_MESSAGE_CONTENT, messageId: this.currentMessageId ?? n(), delta: r5 };
        }
        case s2: {
          let r5 = this.currentMessageId ?? n();
          return this.warnAboutTransformation(s2, EventType.REASONING_MESSAGE_END), { ...t8, type: EventType.REASONING_MESSAGE_END, messageId: r5 };
        }
        case i5: {
          let r5 = this.currentReasoningId ?? n();
          return this.warnAboutTransformation(i5, EventType.REASONING_END), { ...t8, type: EventType.REASONING_END, messageId: r5 };
        }
        default:
          return t8;
      }
    }
  };

  // ../../sdks/typescript/packages/client/dist/package.mjs
  var e2 = `0.0.45`;

  // ../../node_modules/.pnpm/compare-versions@6.1.1/node_modules/compare-versions/lib/esm/utils.js
  var semver = /^[v^~<>=]*?(\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+)(?:\.([x*]|\d+))?(?:-([\da-z\-]+(?:\.[\da-z\-]+)*))?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?)?)?$/i;
  var validateAndParse = (version2) => {
    if (typeof version2 !== "string") {
      throw new TypeError("Invalid argument expected string");
    }
    const match = version2.match(semver);
    if (!match) {
      throw new Error(`Invalid argument not valid semver ('${version2}' received)`);
    }
    match.shift();
    return match;
  };
  var isWildcard = (s3) => s3 === "*" || s3 === "x" || s3 === "X";
  var tryParse = (v) => {
    const n6 = parseInt(v, 10);
    return isNaN(n6) ? v : n6;
  };
  var forceType = (a5, b) => typeof a5 !== typeof b ? [String(a5), String(b)] : [a5, b];
  var compareStrings = (a5, b) => {
    if (isWildcard(a5) || isWildcard(b))
      return 0;
    const [ap, bp] = forceType(tryParse(a5), tryParse(b));
    if (ap > bp)
      return 1;
    if (ap < bp)
      return -1;
    return 0;
  };
  var compareSegments = (a5, b) => {
    for (let i7 = 0; i7 < Math.max(a5.length, b.length); i7++) {
      const r5 = compareStrings(a5[i7] || "0", b[i7] || "0");
      if (r5 !== 0)
        return r5;
    }
    return 0;
  };

  // ../../node_modules/.pnpm/compare-versions@6.1.1/node_modules/compare-versions/lib/esm/compareVersions.js
  var compareVersions = (v1, v2) => {
    const n1 = validateAndParse(v1);
    const n22 = validateAndParse(v2);
    const p1 = n1.pop();
    const p2 = n22.pop();
    const r5 = compareSegments(n1, n22);
    if (r5 !== 0)
      return r5;
    if (p1 && p2) {
      return compareSegments(p1.split("."), p2.split("."));
    } else if (p1 || p2) {
      return p1 ? -1 : 1;
    }
    return 0;
  };

  // ../../sdks/typescript/packages/client/dist/agent/agent.mjs
  var p = class {
    get maxVersion() {
      return e2;
    }
    constructor({ agentId: t8, description: n6, threadId: r5, initialMessages: i7, initialState: a5, debug: o4 } = {}) {
      this.debug = false, this.subscribers = [], this.isRunning = false, this.middlewares = [], this.agentId = t8, this.description = n6 ?? ``, this.threadId = r5 ?? v4_default(), this.messages = t(i7 ?? []), this.state = t(a5 ?? {}), this.debug = o4 ?? false, compareVersions(this.maxVersion, `0.0.39`) <= 0 && this.middlewares.unshift(new n5()), compareVersions(this.maxVersion, `0.0.45`) <= 0 && this.middlewares.unshift(new c2());
    }
    subscribe(e3) {
      return this.subscribers.push(e3), { unsubscribe: () => {
        this.subscribers = this.subscribers.filter((t8) => t8 !== e3);
      } };
    }
    use(...e3) {
      let t8 = e3.map((e4) => typeof e4 == `function` ? new i4(e4) : e4);
      return this.middlewares.push(...t8), this;
    }
    async runAgent(t8, n6) {
      try {
        this.isRunning = true, this.agentId = this.agentId ?? v4_default();
        let i7 = this.prepareRunAgentInput(t8), o4, s3 = new Set(this.messages.map((e3) => e3.id)), c3 = [{ onRunFinishedEvent: (e3) => {
          o4 = e3.result;
        } }, ...this.subscribers, n6 ?? {}];
        await this.onInitialize(i7, c3), this.activeRunAbortController = new AbortController();
        let l2;
        this.activeRunCompletionPromise = new Promise((e3) => {
          l2 = e3;
        });
        try {
          let e3 = this.middlewares.length === 0 ? this.run(i7) : this.middlewares.reduceRight((e4, t10) => ({ run: (n8) => t10.run(n8, e4) }), this).run(i7), t9 = t6(this.debug)(e3), n7 = m(n2(this.debug)(t9), this.activeRunAbortController.signal), o5 = this.apply(i7, n7, c3), s4 = this.processApplyEvents(i7, o5, c3);
          for await (let e4 of s4) ;
        } catch (e3) {
          this.isRunning = false, await this.onError(i7, e3, c3);
        } finally {
          this.isRunning = false, await this.onFinalize(i7, c3), l2?.(), l2 = void 0, this.activeRunCompletionPromise = void 0, this.activeRunAbortController = void 0;
        }
        let d2 = t(this.messages).filter((e3) => !s3.has(e3.id));
        return { result: o4, newMessages: d2 };
      } finally {
        this.isRunning = false;
      }
    }
    connect(e3) {
      throw new AGUIConnectNotImplementedError();
    }
    async connectAgent(t8, n6) {
      try {
        this.isRunning = true, this.agentId = this.agentId ?? v4_default();
        let i7 = this.prepareRunAgentInput(t8), o4, s3 = new Set(this.messages.map((e3) => e3.id)), c3 = [{ onRunFinishedEvent: (e3) => {
          o4 = e3.result;
        } }, ...this.subscribers, n6 ?? {}];
        await this.onInitialize(i7, c3), this.activeRunAbortController = new AbortController();
        let l2;
        this.activeRunCompletionPromise = new Promise((e3) => {
          l2 = e3;
        });
        try {
          let e3 = this.connect(i7), t9 = t6(this.debug)(e3), n7 = m(n2(this.debug)(t9), this.activeRunAbortController.signal), o5 = this.apply(i7, n7, c3), s4 = this.processApplyEvents(i7, o5, c3);
          for await (let e4 of s4) ;
        } catch (e3) {
          this.isRunning = false, e3 instanceof AGUIConnectNotImplementedError || await this.onError(i7, e3, c3);
        } finally {
          this.isRunning = false, await this.onFinalize(i7, c3), l2?.(), l2 = void 0, this.activeRunCompletionPromise = void 0, this.activeRunAbortController = void 0;
        }
        let f2 = t(this.messages).filter((e3) => !s3.has(e3.id));
        return { result: o4, newMessages: f2 };
      } finally {
        this.isRunning = false;
      }
    }
    abortRun() {
    }
    async detachActiveRun() {
      if (!this.activeRunAbortController) return;
      let e3 = this.activeRunCompletionPromise ?? Promise.resolve();
      this.activeRunAbortController.abort(), await e3;
    }
    apply(e3, t8, r5) {
      return a(e3, t8, this, r5);
    }
    async *processApplyEvents(e3, t8, n6) {
      for await (let r5 of t8) r5.messages && (this.messages = r5.messages, n6.forEach((t9) => {
        t9.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e3 });
      })), r5.state && (this.state = r5.state, n6.forEach((t9) => {
        t9.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e3 });
      })), yield r5;
    }
    prepareRunAgentInput(t8) {
      let n6 = t(this.messages).filter((e3) => e3.role !== `activity`);
      return { threadId: this.threadId, runId: t8?.runId || v4_default(), tools: t(t8?.tools ?? []), context: t(t8?.context ?? []), forwardedProps: t(t8?.forwardedProps ?? {}), state: t(this.state), messages: n6 };
    }
    async onInitialize(e3, n6) {
      let r5 = await t2(n6, this.messages, this.state, (t8, n7, r6) => t8.onRunInitialized?.({ messages: n7, state: r6, agent: this, input: e3 }));
      (r5.messages !== void 0 || r5.state !== void 0) && (r5.messages && (this.messages = r5.messages, e3.messages = r5.messages, n6.forEach((t8) => {
        t8.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e3 });
      })), r5.state && (this.state = r5.state, e3.state = r5.state, n6.forEach((t8) => {
        t8.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e3 });
      })));
    }
    async onError(e3, n6, r5) {
      let i7 = await t2(r5, this.messages, this.state, (t8, r6, i8) => t8.onRunFailed?.({ error: n6, messages: r6, state: i8, agent: this, input: e3 }));
      if ((i7.messages !== void 0 || i7.state !== void 0) && (i7.messages !== void 0 && (this.messages = i7.messages, r5.forEach((t8) => {
        t8.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e3 });
      })), i7.state !== void 0 && (this.state = i7.state, r5.forEach((t8) => {
        t8.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e3 });
      }))), i7.stopPropagation !== true) throw console.error(`Agent execution failed:`, n6), n6;
    }
    async onFinalize(e3, n6) {
      let r5 = await t2(n6, this.messages, this.state, (t8, n7, r6) => t8.onRunFinalized?.({ messages: n7, state: r6, agent: this, input: e3 }));
      (r5.messages !== void 0 || r5.state !== void 0) && (r5.messages !== void 0 && (this.messages = r5.messages, n6.forEach((t8) => {
        t8.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e3 });
      })), r5.state !== void 0 && (this.state = r5.state, n6.forEach((t8) => {
        t8.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e3 });
      })));
    }
    clone() {
      let t8 = Object.create(Object.getPrototypeOf(this));
      return t8.agentId = this.agentId, t8.description = this.description, t8.threadId = this.threadId, t8.messages = t(this.messages), t8.state = t(this.state), t8.debug = this.debug, t8.isRunning = this.isRunning, t8.subscribers = [...this.subscribers], t8.middlewares = [...this.middlewares], t8;
    }
    addMessage(e3) {
      this.messages.push(e3), (async () => {
        for (let t8 of this.subscribers) await t8.onNewMessage?.({ message: e3, messages: this.messages, state: this.state, agent: this });
        if (e3.role === `assistant` && e3.toolCalls) for (let t8 of e3.toolCalls) for (let e4 of this.subscribers) await e4.onNewToolCall?.({ toolCall: t8, messages: this.messages, state: this.state, agent: this });
        for (let e4 of this.subscribers) await e4.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    addMessages(e3) {
      this.messages.push(...e3), (async () => {
        for (let t8 of e3) {
          for (let e4 of this.subscribers) await e4.onNewMessage?.({ message: t8, messages: this.messages, state: this.state, agent: this });
          if (t8.role === `assistant` && t8.toolCalls) for (let e4 of t8.toolCalls) for (let t9 of this.subscribers) await t9.onNewToolCall?.({ toolCall: e4, messages: this.messages, state: this.state, agent: this });
        }
        for (let e4 of this.subscribers) await e4.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    setMessages(t8) {
      this.messages = t(t8), (async () => {
        for (let e3 of this.subscribers) await e3.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    setState(t8) {
      this.state = t(t8), (async () => {
        for (let e3 of this.subscribers) await e3.onStateChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    async *legacy_to_be_removed_runAgentBridged(e3) {
      this.agentId = this.agentId ?? v4_default();
      let t8 = this.prepareRunAgentInput(e3), n6 = this.middlewares.length === 0 ? this.run(t8) : this.middlewares.reduceRight((e4, t9) => ({ run: (n7) => t9.run(n7, e4) }), this).run(t8), o4 = t6(this.debug)(n6), s3 = n2(this.debug)(o4), c3 = a3(this.threadId, t8.runId, this.agentId)(s3);
      for await (let e4 of c3) this.debug && console.debug(`[LEGACY]:`, JSON.stringify(e4)), yield e4;
    }
  };
  async function* m(e3, t8) {
    for await (let n6 of e3) {
      if (t8.aborted) break;
      yield n6;
    }
  }

  // ../../sdks/typescript/packages/client/dist/agent/http.mjs
  var i6 = class extends p {
    requestInit(e3) {
      return { method: `POST`, headers: { ...this.headers, "Content-Type": `application/json`, Accept: `text/event-stream` }, body: JSON.stringify(e3), signal: this.abortController.signal };
    }
    runAgent(e3, t8) {
      return this.abortController = e3?.abortController ?? new AbortController(), super.runAgent(e3, t8);
    }
    abortRun() {
      this.abortController.abort(), super.abortRun();
    }
    constructor(t8) {
      super(t8), this.abortController = new AbortController(), this.url = t8.url, this.headers = t(t8.headers ?? {});
    }
    run(e3) {
      return r(t3(this.url, this.requestInit(e3)));
    }
    clone() {
      let t8 = super.clone();
      t8.url = this.url, t8.headers = t(this.headers ?? {});
      let n6 = new AbortController(), r5 = this.abortController.signal;
      return r5.aborted && n6.abort(r5.reason), t8.abortController = n6, t8;
    }
  };

  // src/index.ts
  var AnswerAgent = class extends i6 {
    requestInit(input) {
      const { params, accessToken } = input.forwardedProps || {};
      return {
        method: "POST",
        headers: {
          ...this.headers,
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream"
        },
        body: JSON.stringify(params),
        signal: this.abortController.signal
      };
    }
  };
  var createAnswerAgent = (agentId, organizationId) => new AnswerAgent({
    url: ""
  });
})();
/*! Bundled license information:

fast-json-patch/module/helpers.mjs:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017-2022 Joachim Wester
   * MIT licensed
   *)

fast-json-patch/module/duplex.mjs:
  (*!
   * https://github.com/Starcounter-Jack/JSON-Patch
   * (c) 2017-2021 Joachim Wester
   * MIT license
   *)
*/

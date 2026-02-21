"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // ../../node_modules/.pnpm/uuid@11.1.0/node_modules/uuid/dist/esm-browser/stringify.js
  var byteToHex = [];
  for (let i4 = 0; i4 < 256; ++i4) {
    byteToHex.push((i4 + 256).toString(16).slice(1));
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
      for (let i4 = 0; i4 < 16; ++i4) {
        buf[offset + i4] = rnds[i4];
      }
      return buf;
    }
    return unsafeStringify(rnds);
  }
  var v4_default = v4;

  // ../../sdks/typescript/packages/client/dist/utils.mjs
  var t = (e2) => {
    if (typeof structuredClone == `function`) return structuredClone(e2);
    try {
      return JSON.parse(JSON.stringify(e2));
    } catch {
      return { ...e2 };
    }
  };
  function n() {
    return v4_default();
  }

  // ../../sdks/typescript/packages/client/dist/agent/subscriber.mjs
  async function t2(t5, n4, r4, i4) {
    let a6 = n4, o6 = r4, s5;
    for (let n5 of t5) try {
      let t6 = await i4(n5, t(a6), t(o6));
      if (t6 === void 0) continue;
      if (t6.messages !== void 0 && (a6 = t6.messages), t6.state !== void 0 && (o6 = t6.state), s5 = t6.stopPropagation, s5 === true) break;
    } catch (e2) {
      process.env.VITEST_WORKER_ID !== void 0 || console.error(`Subscriber error:`, e2);
      continue;
    }
    return { ...JSON.stringify(a6) === JSON.stringify(n4) ? {} : { messages: a6 }, ...JSON.stringify(o6) === JSON.stringify(r4) ? {} : { state: o6 }, ...s5 === void 0 ? {} : { stopPropagation: s5 } };
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
      for (let i4 = 0; i4 < keys.length; i4++) {
        const k = keys[i4];
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
  function isPlainObject(o6) {
    if (isObject(o6) === false)
      return false;
    const ctor = o6.constructor;
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
  function shallowClone(o6) {
    if (isPlainObject(o6))
      return { ...o6 };
    if (Array.isArray(o6))
      return [...o6];
    return o6;
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
    for (let i4 = startIndex; i4 < x.issues.length; i4++) {
      if (x.issues[i4]?.continue !== true) {
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
  function finalizeIssue(iss, ctx, config3) {
    const full = { ...iss, path: iss.path ?? [] };
    if (!iss.message) {
      const message = unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config3.customError?.(iss)) ?? unwrapMessage(config3.localeError?.(iss)) ?? "Invalid input";
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
      const e2 = new (_params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e2, _params?.callee);
      throw e2;
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
      const e2 = new (params?.Err ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
      captureStackTrace(e2, params?.callee);
      throw e2;
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
          const r4 = safeParse(inst, value);
          return r4.success ? { value: r4.data } : { issues: r4.error?.issues };
        } catch (_) {
          return safeParseAsync(inst, value).then((r4) => r4.success ? { value: r4.data } : { issues: r4.error?.issues });
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
      for (let i4 = 0; i4 < input.length; i4++) {
        const item = input[i4];
        const result = def.element._zod.run({
          value: item,
          issues: []
        }, ctx);
        if (result instanceof Promise) {
          proms.push(result.then((result2) => handleArrayResult(result2, payload, i4)));
        } else {
          handleArrayResult(result, payload, i4);
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
    const t5 = _catchall.def.type;
    const isOptionalOut = _catchall.optout === "optional";
    for (const key in input) {
      if (keySet.has(key))
        continue;
      if (t5 === "never") {
        unrecognized.push(key);
        continue;
      }
      const r4 = _catchall.run({ value: input[key], issues: [] }, ctx);
      if (r4 instanceof Promise) {
        proms.push(r4.then((r5) => handlePropertyResult(r5, payload, key, input, isOptionalOut)));
      } else {
        handlePropertyResult(r4, payload, key, input, isOptionalOut);
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
        const r4 = el._zod.run({ value: input[key], issues: [] }, ctx);
        if (r4 instanceof Promise) {
          proms.push(r4.then((r5) => handlePropertyResult(r5, payload, key, input, isOptionalOut)));
        } else {
          handlePropertyResult(r4, payload, key, input, isOptionalOut);
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
    const nonaborted = results.filter((r4) => !aborted(r4));
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
    defineLazy(inst._zod, "optin", () => def.options.some((o6) => o6._zod.optin === "optional") ? "optional" : void 0);
    defineLazy(inst._zod, "optout", () => def.options.some((o6) => o6._zod.optout === "optional") ? "optional" : void 0);
    defineLazy(inst._zod, "values", () => {
      if (def.options.every((o6) => o6._zod.values)) {
        return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
      }
      return void 0;
    });
    defineLazy(inst._zod, "pattern", () => {
      if (def.options.every((o6) => o6._zod.pattern)) {
        const patterns = def.options.map((o6) => o6._zod.pattern);
        return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
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
      const map2 = /* @__PURE__ */ new Map();
      for (const o6 of opts) {
        const values = o6._zod.propValues?.[def.discriminator];
        if (!values || values.size === 0)
          throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o6)}"`);
        for (const v of values) {
          if (map2.has(v)) {
            throw new Error(`Duplicate discriminator value "${String(v)}"`);
          }
          map2.set(v, o6);
        }
      }
      return map2;
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
    inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o6) => typeof o6 === "string" ? escapeRegex(o6) : o6.toString()).join("|")})$`);
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
    inst._zod.pattern = new RegExp(`^(${def.values.map((o6) => typeof o6 === "string" ? escapeRegex(o6) : o6 ? escapeRegex(o6.toString()) : String(o6)).join("|")})$`);
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
          return result.then((r4) => handleOptionalResult(r4, payload.value));
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
      const r4 = def.fn(input);
      if (r4 instanceof Promise) {
        return r4.then((r5) => handleRefineResult(r5, payload, input, inst));
      }
      handleRefineResult(r4, payload, input, inst);
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
      const p = schema._zod.parent;
      if (p) {
        const pm = { ...this.get(p) ?? {} };
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
    delta: string2().check(refine((s5) => s5.length > 0, "Delta must not be an empty string"))
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
    delta: string2().check(refine((s5) => s5.length > 0, "Delta must not be an empty string"))
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
    var extendStatics2 = function(d2, b) {
      extendStatics2 = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b2) {
        d3.__proto__ = b2;
      } || function(d3, b2) {
        for (var p in b2) if (b2.hasOwnProperty(p)) d3[p] = b2[p];
      };
      return extendStatics2(d2, b);
    };
    return function(d2, b) {
      extendStatics2(d2, b);
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
    for (var i4 in obj) {
      if (hasOwnProperty(obj, i4)) {
        keys.push(i4);
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
    var i4 = 0;
    var len = str.length;
    var charCode;
    while (i4 < len) {
      charCode = str.charCodeAt(i4);
      if (charCode >= 48 && charCode <= 57) {
        i4++;
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
        for (var i4 = 0; i4 < objKeysLength; i4++) {
          if (hasUndefined(obj[objKeys[i4]])) {
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
    add: function(arr, i4, document) {
      if (isInteger(i4)) {
        arr.splice(i4, 0, this.value);
      } else {
        arr[i4] = this.value;
      }
      return { newDocument: document, index: i4 };
    },
    remove: function(arr, i4, document) {
      var removedList = arr.splice(i4, 1);
      return { newDocument: document, removed: removedList[0] };
    },
    replace: function(arr, i4, document) {
      var removed = arr[i4];
      arr[i4] = this.value;
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
      var t5 = 1;
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
        key = keys[t5];
        if (key && key.indexOf("~") != -1) {
          key = unescapePathComponent(key);
        }
        if (banPrototypeModifications && (key == "__proto__" || key == "prototype" && t5 > 0 && keys[t5 - 1] == "constructor")) {
          throw new TypeError("JSON-Patch: modifying `__proto__` or `constructor/prototype` prop is banned for security reasons, if this was on purpose, please set `banPrototypeModifications` flag false and pass it to this function. More info in fast-json-patch README");
        }
        if (validateOperation) {
          if (existingPathFragment === void 0) {
            if (obj[key] === void 0) {
              existingPathFragment = keys.slice(0, t5).join("/");
            } else if (t5 == len - 1) {
              existingPathFragment = operation.path;
            }
            if (existingPathFragment !== void 0) {
              validateFunction(operation, 0, document, existingPathFragment);
            }
          }
        }
        t5++;
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
          if (t5 >= len) {
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
          if (t5 >= len) {
            var returnValue = objOps[operation.op].call(operation, obj, key, document);
            if (returnValue.test === false) {
              throw new JsonPatchError("Test operation failed", "TEST_OPERATION_FAILED", index, operation, document);
            }
            return returnValue;
          }
        }
        obj = obj[key];
        if (validateOperation && t5 < len && (!obj || typeof obj !== "object")) {
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
    for (var i4 = 0, length_1 = patch.length; i4 < length_1; i4++) {
      results[i4] = applyOperation(document, patch[i4], validateOperation, true, banPrototypeModifications, i4);
      document = results[i4].newDocument;
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
        for (var i4 = 0; i4 < sequence.length; i4++) {
          externalValidator(sequence[i4], i4, document, void 0);
        }
      }
    } catch (e2) {
      if (e2 instanceof JsonPatchError) {
        return e2;
      } else {
        throw e2;
      }
    }
  }
  function _areEquals(a6, b) {
    if (a6 === b)
      return true;
    if (a6 && b && typeof a6 == "object" && typeof b == "object") {
      var arrA = Array.isArray(a6), arrB = Array.isArray(b), i4, length, key;
      if (arrA && arrB) {
        length = a6.length;
        if (length != b.length)
          return false;
        for (i4 = length; i4-- !== 0; )
          if (!_areEquals(a6[i4], b[i4]))
            return false;
        return true;
      }
      if (arrA != arrB)
        return false;
      var keys = Object.keys(a6);
      length = keys.length;
      if (length !== Object.keys(b).length)
        return false;
      for (i4 = length; i4-- !== 0; )
        if (!b.hasOwnProperty(keys[i4]))
          return false;
      for (i4 = length; i4-- !== 0; ) {
        key = keys[i4];
        if (!_areEquals(a6[key], b[key]))
          return false;
      }
      return true;
    }
    return a6 !== a6 && b !== b;
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
    for (var t5 = oldKeys.length - 1; t5 >= 0; t5--) {
      var key = oldKeys[t5];
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
    for (var t5 = 0; t5 < newKeys.length; t5++) {
      var key = newKeys[t5];
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

  // ../../node_modules/.pnpm/tslib@2.8.1/node_modules/tslib/tslib.es6.mjs
  var extendStatics = function(d2, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b2) {
      d3.__proto__ = b2;
    } || function(d3, b2) {
      for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d3[p] = b2[p];
    };
    return extendStatics(d2, b);
  };
  function __extends2(d2, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d2, b);
    function __() {
      this.constructor = d2;
    }
    d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e2) {
          reject(e2);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e2) {
          reject(e2);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t5[0] & 1) throw t5[1];
      return t5[1];
    }, trys: [], ops: [] }, f2, y, t5, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n4) {
      return function(v) {
        return step([n4, v]);
      };
    }
    function step(op) {
      if (f2) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
        if (f2 = 1, y && (t5 = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t5 = y["return"]) && t5.call(y), 0) : y.next) && !(t5 = t5.call(y, op[1])).done) return t5;
        if (y = 0, t5) op = [op[0] & 2, t5.value];
        switch (op[0]) {
          case 0:
          case 1:
            t5 = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t5 = _.trys, t5 = t5.length > 0 && t5[t5.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t5 || op[1] > t5[0] && op[1] < t5[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t5[1]) {
              _.label = t5[1];
              t5 = op;
              break;
            }
            if (t5 && _.label < t5[2]) {
              _.label = t5[2];
              _.ops.push(op);
              break;
            }
            if (t5[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e2) {
        op = [6, e2];
        y = 0;
      } finally {
        f2 = t5 = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __values(o6) {
    var s5 = typeof Symbol === "function" && Symbol.iterator, m = s5 && o6[s5], i4 = 0;
    if (m) return m.call(o6);
    if (o6 && typeof o6.length === "number") return {
      next: function() {
        if (o6 && i4 >= o6.length) o6 = void 0;
        return { value: o6 && o6[i4++], done: !o6 };
      }
    };
    throw new TypeError(s5 ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o6, n4) {
    var m = typeof Symbol === "function" && o6[Symbol.iterator];
    if (!m) return o6;
    var i4 = m.call(o6), r4, ar = [], e2;
    try {
      while ((n4 === void 0 || n4-- > 0) && !(r4 = i4.next()).done) ar.push(r4.value);
    } catch (error) {
      e2 = { error };
    } finally {
      try {
        if (r4 && !r4.done && (m = i4["return"])) m.call(i4);
      } finally {
        if (e2) throw e2.error;
      }
    }
    return ar;
  }
  function __spreadArray(to, from2, pack) {
    if (pack || arguments.length === 2) for (var i4 = 0, l3 = from2.length, ar; i4 < l3; i4++) {
      if (ar || !(i4 in from2)) {
        if (!ar) ar = Array.prototype.slice.call(from2, 0, i4);
        ar[i4] = from2[i4];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from2));
  }
  function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i4, q = [];
    return i4 = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i4[Symbol.asyncIterator] = function() {
      return this;
    }, i4;
    function awaitReturn(f2) {
      return function(v) {
        return Promise.resolve(v).then(f2, reject);
      };
    }
    function verb(n4, f2) {
      if (g[n4]) {
        i4[n4] = function(v) {
          return new Promise(function(a6, b) {
            q.push([n4, v, a6, b]) > 1 || resume(n4, v);
          });
        };
        if (f2) i4[n4] = f2(i4[n4]);
      }
    }
    function resume(n4, v) {
      try {
        step(g[n4](v));
      } catch (e2) {
        settle(q[0][3], e2);
      }
    }
    function step(r4) {
      r4.value instanceof __await ? Promise.resolve(r4.value.v).then(fulfill, reject) : settle(q[0][2], r4);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f2, v) {
      if (f2(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
  }
  function __asyncValues(o6) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o6[Symbol.asyncIterator], i4;
    return m ? m.call(o6) : (o6 = typeof __values === "function" ? __values(o6) : o6[Symbol.iterator](), i4 = {}, verb("next"), verb("throw"), verb("return"), i4[Symbol.asyncIterator] = function() {
      return this;
    }, i4);
    function verb(n4) {
      i4[n4] = o6[n4] && function(v) {
        return new Promise(function(resolve, reject) {
          v = o6[n4](v), settle(resolve, reject, v.done, v.value);
        });
      };
    }
    function settle(resolve, reject, d2, v) {
      Promise.resolve(v).then(function(v2) {
        resolve({ value: v2, done: d2 });
      }, reject);
    }
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isFunction.js
  function isFunction(value) {
    return typeof value === "function";
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js
  function createErrorClass(createImpl) {
    var _super = function(instance) {
      Error.call(instance);
      instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js
  var UnsubscriptionError = createErrorClass(function(_super) {
    return function UnsubscriptionErrorImpl(errors) {
      _super(this);
      this.message = errors ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function(err, i4) {
        return i4 + 1 + ") " + err.toString();
      }).join("\n  ") : "";
      this.name = "UnsubscriptionError";
      this.errors = errors;
    };
  });

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/arrRemove.js
  function arrRemove(arr, item) {
    if (arr) {
      var index = arr.indexOf(item);
      0 <= index && arr.splice(index, 1);
    }
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/Subscription.js
  var Subscription = (function() {
    function Subscription2(initialTeardown) {
      this.initialTeardown = initialTeardown;
      this.closed = false;
      this._parentage = null;
      this._finalizers = null;
    }
    Subscription2.prototype.unsubscribe = function() {
      var e_1, _a2, e_2, _b;
      var errors;
      if (!this.closed) {
        this.closed = true;
        var _parentage = this._parentage;
        if (_parentage) {
          this._parentage = null;
          if (Array.isArray(_parentage)) {
            try {
              for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                var parent_1 = _parentage_1_1.value;
                parent_1.remove(this);
              }
            } catch (e_1_1) {
              e_1 = { error: e_1_1 };
            } finally {
              try {
                if (_parentage_1_1 && !_parentage_1_1.done && (_a2 = _parentage_1.return)) _a2.call(_parentage_1);
              } finally {
                if (e_1) throw e_1.error;
              }
            }
          } else {
            _parentage.remove(this);
          }
        }
        var initialFinalizer = this.initialTeardown;
        if (isFunction(initialFinalizer)) {
          try {
            initialFinalizer();
          } catch (e2) {
            errors = e2 instanceof UnsubscriptionError ? e2.errors : [e2];
          }
        }
        var _finalizers = this._finalizers;
        if (_finalizers) {
          this._finalizers = null;
          try {
            for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
              var finalizer = _finalizers_1_1.value;
              try {
                execFinalizer(finalizer);
              } catch (err) {
                errors = errors !== null && errors !== void 0 ? errors : [];
                if (err instanceof UnsubscriptionError) {
                  errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                } else {
                  errors.push(err);
                }
              }
            }
          } catch (e_2_1) {
            e_2 = { error: e_2_1 };
          } finally {
            try {
              if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
            } finally {
              if (e_2) throw e_2.error;
            }
          }
        }
        if (errors) {
          throw new UnsubscriptionError(errors);
        }
      }
    };
    Subscription2.prototype.add = function(teardown) {
      var _a2;
      if (teardown && teardown !== this) {
        if (this.closed) {
          execFinalizer(teardown);
        } else {
          if (teardown instanceof Subscription2) {
            if (teardown.closed || teardown._hasParent(this)) {
              return;
            }
            teardown._addParent(this);
          }
          (this._finalizers = (_a2 = this._finalizers) !== null && _a2 !== void 0 ? _a2 : []).push(teardown);
        }
      }
    };
    Subscription2.prototype._hasParent = function(parent) {
      var _parentage = this._parentage;
      return _parentage === parent || Array.isArray(_parentage) && _parentage.includes(parent);
    };
    Subscription2.prototype._addParent = function(parent) {
      var _parentage = this._parentage;
      this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription2.prototype._removeParent = function(parent) {
      var _parentage = this._parentage;
      if (_parentage === parent) {
        this._parentage = null;
      } else if (Array.isArray(_parentage)) {
        arrRemove(_parentage, parent);
      }
    };
    Subscription2.prototype.remove = function(teardown) {
      var _finalizers = this._finalizers;
      _finalizers && arrRemove(_finalizers, teardown);
      if (teardown instanceof Subscription2) {
        teardown._removeParent(this);
      }
    };
    Subscription2.EMPTY = (function() {
      var empty = new Subscription2();
      empty.closed = true;
      return empty;
    })();
    return Subscription2;
  })();
  var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
  function isSubscription(value) {
    return value instanceof Subscription || value && "closed" in value && isFunction(value.remove) && isFunction(value.add) && isFunction(value.unsubscribe);
  }
  function execFinalizer(finalizer) {
    if (isFunction(finalizer)) {
      finalizer();
    } else {
      finalizer.unsubscribe();
    }
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/config.js
  var config2 = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: void 0,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false
  };

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js
  var timeoutProvider = {
    setTimeout: function(handler, timeout) {
      var args = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
      }
      var delegate = timeoutProvider.delegate;
      if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
        return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
      }
      return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function(handle) {
      var delegate = timeoutProvider.delegate;
      return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: void 0
  };

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js
  function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function() {
      var onUnhandledError = config2.onUnhandledError;
      if (onUnhandledError) {
        onUnhandledError(err);
      } else {
        throw err;
      }
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/noop.js
  function noop() {
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/NotificationFactories.js
  var COMPLETE_NOTIFICATION = (function() {
    return createNotification("C", void 0, void 0);
  })();
  function errorNotification(error) {
    return createNotification("E", void 0, error);
  }
  function nextNotification(value) {
    return createNotification("N", value, void 0);
  }
  function createNotification(kind, value, error) {
    return {
      kind,
      value,
      error
    };
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/errorContext.js
  var context = null;
  function errorContext(cb) {
    if (config2.useDeprecatedSynchronousErrorHandling) {
      var isRoot = !context;
      if (isRoot) {
        context = { errorThrown: false, error: null };
      }
      cb();
      if (isRoot) {
        var _a2 = context, errorThrown = _a2.errorThrown, error = _a2.error;
        context = null;
        if (errorThrown) {
          throw error;
        }
      }
    } else {
      cb();
    }
  }
  function captureError(err) {
    if (config2.useDeprecatedSynchronousErrorHandling && context) {
      context.errorThrown = true;
      context.error = err;
    }
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/Subscriber.js
  var Subscriber = (function(_super) {
    __extends2(Subscriber2, _super);
    function Subscriber2(destination) {
      var _this = _super.call(this) || this;
      _this.isStopped = false;
      if (destination) {
        _this.destination = destination;
        if (isSubscription(destination)) {
          destination.add(_this);
        }
      } else {
        _this.destination = EMPTY_OBSERVER;
      }
      return _this;
    }
    Subscriber2.create = function(next, error, complete) {
      return new SafeSubscriber(next, error, complete);
    };
    Subscriber2.prototype.next = function(value) {
      if (this.isStopped) {
        handleStoppedNotification(nextNotification(value), this);
      } else {
        this._next(value);
      }
    };
    Subscriber2.prototype.error = function(err) {
      if (this.isStopped) {
        handleStoppedNotification(errorNotification(err), this);
      } else {
        this.isStopped = true;
        this._error(err);
      }
    };
    Subscriber2.prototype.complete = function() {
      if (this.isStopped) {
        handleStoppedNotification(COMPLETE_NOTIFICATION, this);
      } else {
        this.isStopped = true;
        this._complete();
      }
    };
    Subscriber2.prototype.unsubscribe = function() {
      if (!this.closed) {
        this.isStopped = true;
        _super.prototype.unsubscribe.call(this);
        this.destination = null;
      }
    };
    Subscriber2.prototype._next = function(value) {
      this.destination.next(value);
    };
    Subscriber2.prototype._error = function(err) {
      try {
        this.destination.error(err);
      } finally {
        this.unsubscribe();
      }
    };
    Subscriber2.prototype._complete = function() {
      try {
        this.destination.complete();
      } finally {
        this.unsubscribe();
      }
    };
    return Subscriber2;
  })(Subscription);
  var _bind = Function.prototype.bind;
  function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
  }
  var ConsumerObserver = (function() {
    function ConsumerObserver2(partialObserver) {
      this.partialObserver = partialObserver;
    }
    ConsumerObserver2.prototype.next = function(value) {
      var partialObserver = this.partialObserver;
      if (partialObserver.next) {
        try {
          partialObserver.next(value);
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    ConsumerObserver2.prototype.error = function(err) {
      var partialObserver = this.partialObserver;
      if (partialObserver.error) {
        try {
          partialObserver.error(err);
        } catch (error) {
          handleUnhandledError(error);
        }
      } else {
        handleUnhandledError(err);
      }
    };
    ConsumerObserver2.prototype.complete = function() {
      var partialObserver = this.partialObserver;
      if (partialObserver.complete) {
        try {
          partialObserver.complete();
        } catch (error) {
          handleUnhandledError(error);
        }
      }
    };
    return ConsumerObserver2;
  })();
  var SafeSubscriber = (function(_super) {
    __extends2(SafeSubscriber2, _super);
    function SafeSubscriber2(observerOrNext, error, complete) {
      var _this = _super.call(this) || this;
      var partialObserver;
      if (isFunction(observerOrNext) || !observerOrNext) {
        partialObserver = {
          next: observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : void 0,
          error: error !== null && error !== void 0 ? error : void 0,
          complete: complete !== null && complete !== void 0 ? complete : void 0
        };
      } else {
        var context_1;
        if (_this && config2.useDeprecatedNextContext) {
          context_1 = Object.create(observerOrNext);
          context_1.unsubscribe = function() {
            return _this.unsubscribe();
          };
          partialObserver = {
            next: observerOrNext.next && bind(observerOrNext.next, context_1),
            error: observerOrNext.error && bind(observerOrNext.error, context_1),
            complete: observerOrNext.complete && bind(observerOrNext.complete, context_1)
          };
        } else {
          partialObserver = observerOrNext;
        }
      }
      _this.destination = new ConsumerObserver(partialObserver);
      return _this;
    }
    return SafeSubscriber2;
  })(Subscriber);
  function handleUnhandledError(error) {
    if (config2.useDeprecatedSynchronousErrorHandling) {
      captureError(error);
    } else {
      reportUnhandledError(error);
    }
  }
  function defaultErrorHandler(err) {
    throw err;
  }
  function handleStoppedNotification(notification, subscriber) {
    var onStoppedNotification = config2.onStoppedNotification;
    onStoppedNotification && timeoutProvider.setTimeout(function() {
      return onStoppedNotification(notification, subscriber);
    });
  }
  var EMPTY_OBSERVER = {
    closed: true,
    next: noop,
    error: defaultErrorHandler,
    complete: noop
  };

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/symbol/observable.js
  var observable = (function() {
    return typeof Symbol === "function" && Symbol.observable || "@@observable";
  })();

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/identity.js
  function identity(x) {
    return x;
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/pipe.js
  function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
  }
  function pipeFromArray(fns) {
    if (fns.length === 0) {
      return identity;
    }
    if (fns.length === 1) {
      return fns[0];
    }
    return function piped(input) {
      return fns.reduce(function(prev, fn) {
        return fn(prev);
      }, input);
    };
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/Observable.js
  var Observable = (function() {
    function Observable2(subscribe) {
      if (subscribe) {
        this._subscribe = subscribe;
      }
    }
    Observable2.prototype.lift = function(operator) {
      var observable2 = new Observable2();
      observable2.source = this;
      observable2.operator = operator;
      return observable2;
    };
    Observable2.prototype.subscribe = function(observerOrNext, error, complete) {
      var _this = this;
      var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
      errorContext(function() {
        var _a2 = _this, operator = _a2.operator, source = _a2.source;
        subscriber.add(operator ? operator.call(subscriber, source) : source ? _this._subscribe(subscriber) : _this._trySubscribe(subscriber));
      });
      return subscriber;
    };
    Observable2.prototype._trySubscribe = function(sink) {
      try {
        return this._subscribe(sink);
      } catch (err) {
        sink.error(err);
      }
    };
    Observable2.prototype.forEach = function(next, promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var subscriber = new SafeSubscriber({
          next: function(value) {
            try {
              next(value);
            } catch (err) {
              reject(err);
              subscriber.unsubscribe();
            }
          },
          error: reject,
          complete: resolve
        });
        _this.subscribe(subscriber);
      });
    };
    Observable2.prototype._subscribe = function(subscriber) {
      var _a2;
      return (_a2 = this.source) === null || _a2 === void 0 ? void 0 : _a2.subscribe(subscriber);
    };
    Observable2.prototype[observable] = function() {
      return this;
    };
    Observable2.prototype.pipe = function() {
      var operations = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        operations[_i] = arguments[_i];
      }
      return pipeFromArray(operations)(this);
    };
    Observable2.prototype.toPromise = function(promiseCtor) {
      var _this = this;
      promiseCtor = getPromiseCtor(promiseCtor);
      return new promiseCtor(function(resolve, reject) {
        var value;
        _this.subscribe(function(x) {
          return value = x;
        }, function(err) {
          return reject(err);
        }, function() {
          return resolve(value);
        });
      });
    };
    Observable2.create = function(subscribe) {
      return new Observable2(subscribe);
    };
    return Observable2;
  })();
  function getPromiseCtor(promiseCtor) {
    var _a2;
    return (_a2 = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config2.Promise) !== null && _a2 !== void 0 ? _a2 : Promise;
  }
  function isObserver(value) {
    return value && isFunction(value.next) && isFunction(value.error) && isFunction(value.complete);
  }
  function isSubscriber(value) {
    return value && value instanceof Subscriber || isObserver(value) && isSubscription(value);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/lift.js
  function hasLift(source) {
    return isFunction(source === null || source === void 0 ? void 0 : source.lift);
  }
  function operate(init) {
    return function(source) {
      if (hasLift(source)) {
        return source.lift(function(liftedSource) {
          try {
            return init(liftedSource, this);
          } catch (err) {
            this.error(err);
          }
        });
      }
      throw new TypeError("Unable to lift unknown Observable type");
    };
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js
  function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
  }
  var OperatorSubscriber = (function(_super) {
    __extends2(OperatorSubscriber2, _super);
    function OperatorSubscriber2(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
      var _this = _super.call(this, destination) || this;
      _this.onFinalize = onFinalize;
      _this.shouldUnsubscribe = shouldUnsubscribe;
      _this._next = onNext ? function(value) {
        try {
          onNext(value);
        } catch (err) {
          destination.error(err);
        }
      } : _super.prototype._next;
      _this._error = onError ? function(err) {
        try {
          onError(err);
        } catch (err2) {
          destination.error(err2);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._error;
      _this._complete = onComplete ? function() {
        try {
          onComplete();
        } catch (err) {
          destination.error(err);
        } finally {
          this.unsubscribe();
        }
      } : _super.prototype._complete;
      return _this;
    }
    OperatorSubscriber2.prototype.unsubscribe = function() {
      var _a2;
      if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
        var closed_1 = this.closed;
        _super.prototype.unsubscribe.call(this);
        !closed_1 && ((_a2 = this.onFinalize) === null || _a2 === void 0 ? void 0 : _a2.call(this));
      }
    };
    return OperatorSubscriber2;
  })(Subscriber);

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/ObjectUnsubscribedError.js
  var ObjectUnsubscribedError = createErrorClass(function(_super) {
    return function ObjectUnsubscribedErrorImpl() {
      _super(this);
      this.name = "ObjectUnsubscribedError";
      this.message = "object unsubscribed";
    };
  });

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/Subject.js
  var Subject = (function(_super) {
    __extends2(Subject2, _super);
    function Subject2() {
      var _this = _super.call(this) || this;
      _this.closed = false;
      _this.currentObservers = null;
      _this.observers = [];
      _this.isStopped = false;
      _this.hasError = false;
      _this.thrownError = null;
      return _this;
    }
    Subject2.prototype.lift = function(operator) {
      var subject = new AnonymousSubject(this, this);
      subject.operator = operator;
      return subject;
    };
    Subject2.prototype._throwIfClosed = function() {
      if (this.closed) {
        throw new ObjectUnsubscribedError();
      }
    };
    Subject2.prototype.next = function(value) {
      var _this = this;
      errorContext(function() {
        var e_1, _a2;
        _this._throwIfClosed();
        if (!_this.isStopped) {
          if (!_this.currentObservers) {
            _this.currentObservers = Array.from(_this.observers);
          }
          try {
            for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
              var observer = _c.value;
              observer.next(value);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (_c && !_c.done && (_a2 = _b.return)) _a2.call(_b);
            } finally {
              if (e_1) throw e_1.error;
            }
          }
        }
      });
    };
    Subject2.prototype.error = function(err) {
      var _this = this;
      errorContext(function() {
        _this._throwIfClosed();
        if (!_this.isStopped) {
          _this.hasError = _this.isStopped = true;
          _this.thrownError = err;
          var observers = _this.observers;
          while (observers.length) {
            observers.shift().error(err);
          }
        }
      });
    };
    Subject2.prototype.complete = function() {
      var _this = this;
      errorContext(function() {
        _this._throwIfClosed();
        if (!_this.isStopped) {
          _this.isStopped = true;
          var observers = _this.observers;
          while (observers.length) {
            observers.shift().complete();
          }
        }
      });
    };
    Subject2.prototype.unsubscribe = function() {
      this.isStopped = this.closed = true;
      this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject2.prototype, "observed", {
      get: function() {
        var _a2;
        return ((_a2 = this.observers) === null || _a2 === void 0 ? void 0 : _a2.length) > 0;
      },
      enumerable: false,
      configurable: true
    });
    Subject2.prototype._trySubscribe = function(subscriber) {
      this._throwIfClosed();
      return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject2.prototype._subscribe = function(subscriber) {
      this._throwIfClosed();
      this._checkFinalizedStatuses(subscriber);
      return this._innerSubscribe(subscriber);
    };
    Subject2.prototype._innerSubscribe = function(subscriber) {
      var _this = this;
      var _a2 = this, hasError = _a2.hasError, isStopped = _a2.isStopped, observers = _a2.observers;
      if (hasError || isStopped) {
        return EMPTY_SUBSCRIPTION;
      }
      this.currentObservers = null;
      observers.push(subscriber);
      return new Subscription(function() {
        _this.currentObservers = null;
        arrRemove(observers, subscriber);
      });
    };
    Subject2.prototype._checkFinalizedStatuses = function(subscriber) {
      var _a2 = this, hasError = _a2.hasError, thrownError = _a2.thrownError, isStopped = _a2.isStopped;
      if (hasError) {
        subscriber.error(thrownError);
      } else if (isStopped) {
        subscriber.complete();
      }
    };
    Subject2.prototype.asObservable = function() {
      var observable2 = new Observable();
      observable2.source = this;
      return observable2;
    };
    Subject2.create = function(destination, source) {
      return new AnonymousSubject(destination, source);
    };
    return Subject2;
  })(Observable);
  var AnonymousSubject = (function(_super) {
    __extends2(AnonymousSubject2, _super);
    function AnonymousSubject2(destination, source) {
      var _this = _super.call(this) || this;
      _this.destination = destination;
      _this.source = source;
      return _this;
    }
    AnonymousSubject2.prototype.next = function(value) {
      var _a2, _b;
      (_b = (_a2 = this.destination) === null || _a2 === void 0 ? void 0 : _a2.next) === null || _b === void 0 ? void 0 : _b.call(_a2, value);
    };
    AnonymousSubject2.prototype.error = function(err) {
      var _a2, _b;
      (_b = (_a2 = this.destination) === null || _a2 === void 0 ? void 0 : _a2.error) === null || _b === void 0 ? void 0 : _b.call(_a2, err);
    };
    AnonymousSubject2.prototype.complete = function() {
      var _a2, _b;
      (_b = (_a2 = this.destination) === null || _a2 === void 0 ? void 0 : _a2.complete) === null || _b === void 0 ? void 0 : _b.call(_a2);
    };
    AnonymousSubject2.prototype._subscribe = function(subscriber) {
      var _a2, _b;
      return (_b = (_a2 = this.source) === null || _a2 === void 0 ? void 0 : _a2.subscribe(subscriber)) !== null && _b !== void 0 ? _b : EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject2;
  })(Subject);

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
  var dateTimestampProvider = {
    now: function() {
      return (dateTimestampProvider.delegate || Date).now();
    },
    delegate: void 0
  };

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/ReplaySubject.js
  var ReplaySubject = (function(_super) {
    __extends2(ReplaySubject2, _super);
    function ReplaySubject2(_bufferSize, _windowTime, _timestampProvider) {
      if (_bufferSize === void 0) {
        _bufferSize = Infinity;
      }
      if (_windowTime === void 0) {
        _windowTime = Infinity;
      }
      if (_timestampProvider === void 0) {
        _timestampProvider = dateTimestampProvider;
      }
      var _this = _super.call(this) || this;
      _this._bufferSize = _bufferSize;
      _this._windowTime = _windowTime;
      _this._timestampProvider = _timestampProvider;
      _this._buffer = [];
      _this._infiniteTimeWindow = true;
      _this._infiniteTimeWindow = _windowTime === Infinity;
      _this._bufferSize = Math.max(1, _bufferSize);
      _this._windowTime = Math.max(1, _windowTime);
      return _this;
    }
    ReplaySubject2.prototype.next = function(value) {
      var _a2 = this, isStopped = _a2.isStopped, _buffer = _a2._buffer, _infiniteTimeWindow = _a2._infiniteTimeWindow, _timestampProvider = _a2._timestampProvider, _windowTime = _a2._windowTime;
      if (!isStopped) {
        _buffer.push(value);
        !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
      }
      this._trimBuffer();
      _super.prototype.next.call(this, value);
    };
    ReplaySubject2.prototype._subscribe = function(subscriber) {
      this._throwIfClosed();
      this._trimBuffer();
      var subscription = this._innerSubscribe(subscriber);
      var _a2 = this, _infiniteTimeWindow = _a2._infiniteTimeWindow, _buffer = _a2._buffer;
      var copy = _buffer.slice();
      for (var i4 = 0; i4 < copy.length && !subscriber.closed; i4 += _infiniteTimeWindow ? 1 : 2) {
        subscriber.next(copy[i4]);
      }
      this._checkFinalizedStatuses(subscriber);
      return subscription;
    };
    ReplaySubject2.prototype._trimBuffer = function() {
      var _a2 = this, _bufferSize = _a2._bufferSize, _timestampProvider = _a2._timestampProvider, _buffer = _a2._buffer, _infiniteTimeWindow = _a2._infiniteTimeWindow;
      var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
      _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
      if (!_infiniteTimeWindow) {
        var now = _timestampProvider.now();
        var last2 = 0;
        for (var i4 = 1; i4 < _buffer.length && _buffer[i4] <= now; i4 += 2) {
          last2 = i4;
        }
        last2 && _buffer.splice(0, last2 + 1);
      }
    };
    return ReplaySubject2;
  })(Subject);

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/observable/empty.js
  var EMPTY = new Observable(function(subscriber) {
    return subscriber.complete();
  });

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isScheduler.js
  function isScheduler(value) {
    return value && isFunction(value.schedule);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/args.js
  function last(arr) {
    return arr[arr.length - 1];
  }
  function popScheduler(args) {
    return isScheduler(last(args)) ? args.pop() : void 0;
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js
  var isArrayLike = (function(x) {
    return x && typeof x.length === "number" && typeof x !== "function";
  });

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isPromise.js
  function isPromise(value) {
    return isFunction(value === null || value === void 0 ? void 0 : value.then);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js
  function isInteropObservable(input) {
    return isFunction(input[observable]);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js
  function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js
  function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === "object" ? "an invalid object" : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/symbol/iterator.js
  function getSymbolIterator() {
    if (typeof Symbol !== "function" || !Symbol.iterator) {
      return "@@iterator";
    }
    return Symbol.iterator;
  }
  var iterator = getSymbolIterator();

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isIterable.js
  function isIterable(input) {
    return isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js
  function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
      var reader, _a2, value, done;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            reader = readableStream.getReader();
            _b.label = 1;
          case 1:
            _b.trys.push([1, , 9, 10]);
            _b.label = 2;
          case 2:
            if (false) return [3, 8];
            return [4, __await(reader.read())];
          case 3:
            _a2 = _b.sent(), value = _a2.value, done = _a2.done;
            if (!done) return [3, 5];
            return [4, __await(void 0)];
          case 4:
            return [2, _b.sent()];
          case 5:
            return [4, __await(value)];
          case 6:
            return [4, _b.sent()];
          case 7:
            _b.sent();
            return [3, 2];
          case 8:
            return [3, 10];
          case 9:
            reader.releaseLock();
            return [7];
          case 10:
            return [2];
        }
      });
    });
  }
  function isReadableStreamLike(obj) {
    return isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js
  function innerFrom(input) {
    if (input instanceof Observable) {
      return input;
    }
    if (input != null) {
      if (isInteropObservable(input)) {
        return fromInteropObservable(input);
      }
      if (isArrayLike(input)) {
        return fromArrayLike(input);
      }
      if (isPromise(input)) {
        return fromPromise(input);
      }
      if (isAsyncIterable(input)) {
        return fromAsyncIterable(input);
      }
      if (isIterable(input)) {
        return fromIterable(input);
      }
      if (isReadableStreamLike(input)) {
        return fromReadableStreamLike(input);
      }
    }
    throw createInvalidObservableTypeError(input);
  }
  function fromInteropObservable(obj) {
    return new Observable(function(subscriber) {
      var obs = obj[observable]();
      if (isFunction(obs.subscribe)) {
        return obs.subscribe(subscriber);
      }
      throw new TypeError("Provided object does not correctly implement Symbol.observable");
    });
  }
  function fromArrayLike(array2) {
    return new Observable(function(subscriber) {
      for (var i4 = 0; i4 < array2.length && !subscriber.closed; i4++) {
        subscriber.next(array2[i4]);
      }
      subscriber.complete();
    });
  }
  function fromPromise(promise) {
    return new Observable(function(subscriber) {
      promise.then(function(value) {
        if (!subscriber.closed) {
          subscriber.next(value);
          subscriber.complete();
        }
      }, function(err) {
        return subscriber.error(err);
      }).then(null, reportUnhandledError);
    });
  }
  function fromIterable(iterable) {
    return new Observable(function(subscriber) {
      var e_1, _a2;
      try {
        for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
          var value = iterable_1_1.value;
          subscriber.next(value);
          if (subscriber.closed) {
            return;
          }
        }
      } catch (e_1_1) {
        e_1 = { error: e_1_1 };
      } finally {
        try {
          if (iterable_1_1 && !iterable_1_1.done && (_a2 = iterable_1.return)) _a2.call(iterable_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
      subscriber.complete();
    });
  }
  function fromAsyncIterable(asyncIterable) {
    return new Observable(function(subscriber) {
      process3(asyncIterable, subscriber).catch(function(err) {
        return subscriber.error(err);
      });
    });
  }
  function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
  }
  function process3(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a2;
    return __awaiter(this, void 0, void 0, function() {
      var value, e_2_1;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, 6, 11]);
            asyncIterable_1 = __asyncValues(asyncIterable);
            _b.label = 1;
          case 1:
            return [4, asyncIterable_1.next()];
          case 2:
            if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
            value = asyncIterable_1_1.value;
            subscriber.next(value);
            if (subscriber.closed) {
              return [2];
            }
            _b.label = 3;
          case 3:
            return [3, 1];
          case 4:
            return [3, 11];
          case 5:
            e_2_1 = _b.sent();
            e_2 = { error: e_2_1 };
            return [3, 11];
          case 6:
            _b.trys.push([6, , 9, 10]);
            if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a2 = asyncIterable_1.return))) return [3, 8];
            return [4, _a2.call(asyncIterable_1)];
          case 7:
            _b.sent();
            _b.label = 8;
          case 8:
            return [3, 10];
          case 9:
            if (e_2) throw e_2.error;
            return [7];
          case 10:
            return [7];
          case 11:
            subscriber.complete();
            return [2];
        }
      });
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/executeSchedule.js
  function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
    if (delay === void 0) {
      delay = 0;
    }
    if (repeat === void 0) {
      repeat = false;
    }
    var scheduleSubscription = scheduler.schedule(function() {
      work();
      if (repeat) {
        parentSubscription.add(this.schedule(null, delay));
      } else {
        this.unsubscribe();
      }
    }, delay);
    parentSubscription.add(scheduleSubscription);
    if (!repeat) {
      return scheduleSubscription;
    }
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/observeOn.js
  function observeOn(scheduler, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    return operate(function(source, subscriber) {
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        return executeSchedule(subscriber, scheduler, function() {
          return subscriber.next(value);
        }, delay);
      }, function() {
        return executeSchedule(subscriber, scheduler, function() {
          return subscriber.complete();
        }, delay);
      }, function(err) {
        return executeSchedule(subscriber, scheduler, function() {
          return subscriber.error(err);
        }, delay);
      }));
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/subscribeOn.js
  function subscribeOn(scheduler, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    return operate(function(source, subscriber) {
      subscriber.add(scheduler.schedule(function() {
        return source.subscribe(subscriber);
      }, delay));
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleObservable.js
  function scheduleObservable(input, scheduler) {
    return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/schedulePromise.js
  function schedulePromise(input, scheduler) {
    return innerFrom(input).pipe(subscribeOn(scheduler), observeOn(scheduler));
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleArray.js
  function scheduleArray(input, scheduler) {
    return new Observable(function(subscriber) {
      var i4 = 0;
      return scheduler.schedule(function() {
        if (i4 === input.length) {
          subscriber.complete();
        } else {
          subscriber.next(input[i4++]);
          if (!subscriber.closed) {
            this.schedule();
          }
        }
      });
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleIterable.js
  function scheduleIterable(input, scheduler) {
    return new Observable(function(subscriber) {
      var iterator2;
      executeSchedule(subscriber, scheduler, function() {
        iterator2 = input[iterator]();
        executeSchedule(subscriber, scheduler, function() {
          var _a2;
          var value;
          var done;
          try {
            _a2 = iterator2.next(), value = _a2.value, done = _a2.done;
          } catch (err) {
            subscriber.error(err);
            return;
          }
          if (done) {
            subscriber.complete();
          } else {
            subscriber.next(value);
          }
        }, 0, true);
      });
      return function() {
        return isFunction(iterator2 === null || iterator2 === void 0 ? void 0 : iterator2.return) && iterator2.return();
      };
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleAsyncIterable.js
  function scheduleAsyncIterable(input, scheduler) {
    if (!input) {
      throw new Error("Iterable cannot be null");
    }
    return new Observable(function(subscriber) {
      executeSchedule(subscriber, scheduler, function() {
        var iterator2 = input[Symbol.asyncIterator]();
        executeSchedule(subscriber, scheduler, function() {
          iterator2.next().then(function(result) {
            if (result.done) {
              subscriber.complete();
            } else {
              subscriber.next(result.value);
            }
          });
        }, 0, true);
      });
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/scheduleReadableStreamLike.js
  function scheduleReadableStreamLike(input, scheduler) {
    return scheduleAsyncIterable(readableStreamLikeToAsyncGenerator(input), scheduler);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/scheduled/scheduled.js
  function scheduled(input, scheduler) {
    if (input != null) {
      if (isInteropObservable(input)) {
        return scheduleObservable(input, scheduler);
      }
      if (isArrayLike(input)) {
        return scheduleArray(input, scheduler);
      }
      if (isPromise(input)) {
        return schedulePromise(input, scheduler);
      }
      if (isAsyncIterable(input)) {
        return scheduleAsyncIterable(input, scheduler);
      }
      if (isIterable(input)) {
        return scheduleIterable(input, scheduler);
      }
      if (isReadableStreamLike(input)) {
        return scheduleReadableStreamLike(input, scheduler);
      }
    }
    throw createInvalidObservableTypeError(input);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/observable/from.js
  function from(input, scheduler) {
    return scheduler ? scheduled(input, scheduler) : innerFrom(input);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/observable/of.js
  function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var scheduler = popScheduler(args);
    return from(args, scheduler);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/observable/throwError.js
  function throwError(errorOrErrorFactory, scheduler) {
    var errorFactory = isFunction(errorOrErrorFactory) ? errorOrErrorFactory : function() {
      return errorOrErrorFactory;
    };
    var init = function(subscriber) {
      return subscriber.error(errorFactory());
    };
    return new Observable(scheduler ? function(subscriber) {
      return scheduler.schedule(init, 0, subscriber);
    } : init);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/util/EmptyError.js
  var EmptyError = createErrorClass(function(_super) {
    return function EmptyErrorImpl() {
      _super(this);
      this.name = "EmptyError";
      this.message = "no elements in sequence";
    };
  });

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/lastValueFrom.js
  function lastValueFrom(source, config3) {
    var hasConfig = typeof config3 === "object";
    return new Promise(function(resolve, reject) {
      var _hasValue = false;
      var _value;
      source.subscribe({
        next: function(value) {
          _value = value;
          _hasValue = true;
        },
        error: reject,
        complete: function() {
          if (_hasValue) {
            resolve(_value);
          } else if (hasConfig) {
            resolve(config3.defaultValue);
          } else {
            reject(new EmptyError());
          }
        }
      });
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/map.js
  function map(project, thisArg) {
    return operate(function(source, subscriber) {
      var index = 0;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        subscriber.next(project.call(thisArg, value, index++));
      }));
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/mergeInternals.js
  function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function() {
      if (isComplete && !buffer.length && !active) {
        subscriber.complete();
      }
    };
    var outerNext = function(value) {
      return active < concurrent ? doInnerSub(value) : buffer.push(value);
    };
    var doInnerSub = function(value) {
      expand && subscriber.next(value);
      active++;
      var innerComplete = false;
      innerFrom(project(value, index++)).subscribe(createOperatorSubscriber(subscriber, function(innerValue) {
        onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
        if (expand) {
          outerNext(innerValue);
        } else {
          subscriber.next(innerValue);
        }
      }, function() {
        innerComplete = true;
      }, void 0, function() {
        if (innerComplete) {
          try {
            active--;
            var _loop_1 = function() {
              var bufferedValue = buffer.shift();
              if (innerSubScheduler) {
                executeSchedule(subscriber, innerSubScheduler, function() {
                  return doInnerSub(bufferedValue);
                });
              } else {
                doInnerSub(bufferedValue);
              }
            };
            while (buffer.length && active < concurrent) {
              _loop_1();
            }
            checkComplete();
          } catch (err) {
            subscriber.error(err);
          }
        }
      }));
    };
    source.subscribe(createOperatorSubscriber(subscriber, outerNext, function() {
      isComplete = true;
      checkComplete();
    }));
    return function() {
      additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
    };
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/mergeMap.js
  function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) {
      concurrent = Infinity;
    }
    if (isFunction(resultSelector)) {
      return mergeMap(function(a6, i4) {
        return map(function(b, ii) {
          return resultSelector(a6, b, i4, ii);
        })(innerFrom(project(a6, i4)));
      }, concurrent);
    } else if (typeof resultSelector === "number") {
      concurrent = resultSelector;
    }
    return operate(function(source, subscriber) {
      return mergeInternals(source, subscriber, project, concurrent);
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/mergeAll.js
  function mergeAll(concurrent) {
    if (concurrent === void 0) {
      concurrent = Infinity;
    }
    return mergeMap(identity, concurrent);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/observable/defer.js
  function defer(observableFactory) {
    return new Observable(function(subscriber) {
      innerFrom(observableFactory()).subscribe(subscriber);
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/catchError.js
  function catchError(selector) {
    return operate(function(source, subscriber) {
      var innerSub = null;
      var syncUnsub = false;
      var handledResult;
      innerSub = source.subscribe(createOperatorSubscriber(subscriber, void 0, void 0, function(err) {
        handledResult = innerFrom(selector(err, catchError(selector)(source)));
        if (innerSub) {
          innerSub.unsubscribe();
          innerSub = null;
          handledResult.subscribe(subscriber);
        } else {
          syncUnsub = true;
        }
      }));
      if (syncUnsub) {
        innerSub.unsubscribe();
        innerSub = null;
        handledResult.subscribe(subscriber);
      }
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/concatMap.js
  function concatMap(project, resultSelector) {
    return isFunction(resultSelector) ? mergeMap(project, resultSelector, 1) : mergeMap(project, 1);
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/defaultIfEmpty.js
  function defaultIfEmpty(defaultValue) {
    return operate(function(source, subscriber) {
      var hasValue = false;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        hasValue = true;
        subscriber.next(value);
      }, function() {
        if (!hasValue) {
          subscriber.next(defaultValue);
        }
        subscriber.complete();
      }));
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/finalize.js
  function finalize2(callback) {
    return operate(function(source, subscriber) {
      try {
        source.subscribe(subscriber);
      } finally {
        subscriber.add(callback);
      }
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/switchMap.js
  function switchMap(project, resultSelector) {
    return operate(function(source, subscriber) {
      var innerSubscriber = null;
      var index = 0;
      var isComplete = false;
      var checkComplete = function() {
        return isComplete && !innerSubscriber && subscriber.complete();
      };
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
        var innerIndex = 0;
        var outerIndex = index++;
        innerFrom(project(value, outerIndex)).subscribe(innerSubscriber = createOperatorSubscriber(subscriber, function(innerValue) {
          return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue);
        }, function() {
          innerSubscriber = null;
          checkComplete();
        }));
      }, function() {
        isComplete = true;
        checkComplete();
      }));
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/takeUntil.js
  function takeUntil(notifier) {
    return operate(function(source, subscriber) {
      innerFrom(notifier).subscribe(createOperatorSubscriber(subscriber, function() {
        return subscriber.complete();
      }, noop));
      !subscriber.closed && source.subscribe(subscriber);
    });
  }

  // ../../node_modules/.pnpm/rxjs@7.8.1/node_modules/rxjs/dist/esm5/internal/operators/tap.js
  function tap(observerOrNext, error, complete) {
    var tapObserver = isFunction(observerOrNext) || error || complete ? { next: observerOrNext, error, complete } : observerOrNext;
    return tapObserver ? operate(function(source, subscriber) {
      var _a2;
      (_a2 = tapObserver.subscribe) === null || _a2 === void 0 ? void 0 : _a2.call(tapObserver);
      var isUnsub = true;
      source.subscribe(createOperatorSubscriber(subscriber, function(value) {
        var _a3;
        (_a3 = tapObserver.next) === null || _a3 === void 0 ? void 0 : _a3.call(tapObserver, value);
        subscriber.next(value);
      }, function() {
        var _a3;
        isUnsub = false;
        (_a3 = tapObserver.complete) === null || _a3 === void 0 ? void 0 : _a3.call(tapObserver);
        subscriber.complete();
      }, function(err) {
        var _a3;
        isUnsub = false;
        (_a3 = tapObserver.error) === null || _a3 === void 0 ? void 0 : _a3.call(tapObserver, err);
        subscriber.error(err);
      }, function() {
        var _a3, _b;
        if (isUnsub) {
          (_a3 = tapObserver.unsubscribe) === null || _a3 === void 0 ? void 0 : _a3.call(tapObserver);
        }
        (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
      }));
    }) : identity;
  }

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
    var push = function(context2) {
      return contextStack.push(context2);
    };
    var replace = function(context2) {
      return contextStack[contextStack.length - 1] = context2;
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
    for (var i4 = contextStack.length - 1; i4 >= 0; i4--) {
      switch (contextStack[i4]) {
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
  var u = (u3, d2, f2, p) => {
    let m = t(f2.messages), h = t(u3.state), g = {}, _ = (e2) => {
      e2.messages !== void 0 && (m = e2.messages, g.messages = e2.messages), e2.state !== void 0 && (h = e2.state, g.state = e2.state);
    }, v = () => {
      let t5 = t(g);
      return g = {}, t5.messages !== void 0 || t5.state !== void 0 ? of(t5) : EMPTY;
    };
    return d2.pipe(concatMap(async (i4) => {
      let a6 = await t2(p, m, h, (e2, t5, n4) => e2.onEvent?.({ event: i4, agent: f2, input: u3, messages: t5, state: n4 }));
      if (_(a6), a6.stopPropagation === true) return v();
      switch (i4.type) {
        case EventType.TEXT_MESSAGE_START: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onTextMessageStartEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { messageId: e3, role: t5 = `assistant` } = i4;
            if (!m.find((t6) => t6.id === e3)) {
              let n4 = { id: e3, role: t5, content: `` };
              m.push(n4), _({ messages: m });
            }
          }
          return v();
        }
        case EventType.TEXT_MESSAGE_CONTENT: {
          let { messageId: e2, delta: n4 } = i4, r4 = m.find((t5) => t5.id === e2);
          if (!r4) return console.warn(`TEXT_MESSAGE_CONTENT: No message found with ID '${e2}'`), v();
          let a7 = await t2(p, m, h, (e3, t5, n5) => e3.onTextMessageContentEvent?.({ event: i4, messages: t5, state: n5, agent: f2, input: u3, textMessageBuffer: typeof r4.content == `string` ? r4.content : `` }));
          return _(a7), a7.stopPropagation !== true && (r4.content = `${typeof r4.content == `string` ? r4.content : ``}${n4}`, _({ messages: m })), v();
        }
        case EventType.TEXT_MESSAGE_END: {
          let { messageId: e2 } = i4, n4 = m.find((t5) => t5.id === e2);
          return n4 ? (_(await t2(p, m, h, (e3, t5, r4) => e3.onTextMessageEndEvent?.({ event: i4, messages: t5, state: r4, agent: f2, input: u3, textMessageBuffer: typeof n4.content == `string` ? n4.content : `` }))), await Promise.all(p.map((e3) => {
            e3.onNewMessage?.({ message: n4, messages: m, state: h, agent: f2, input: u3 });
          })), v()) : (console.warn(`TEXT_MESSAGE_END: No message found with ID '${e2}'`), v());
        }
        case EventType.TOOL_CALL_START: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onToolCallStartEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { toolCallId: e3, toolCallName: t5, parentMessageId: n4 } = i4, r4;
            n4 && m.length > 0 && m[m.length - 1].id === n4 ? r4 = m[m.length - 1] : (r4 = { id: n4 || e3, role: `assistant`, toolCalls: [] }, m.push(r4)), r4.toolCalls ??= [], r4.toolCalls.push({ id: e3, type: `function`, function: { name: t5, arguments: `` } }), _({ messages: m });
          }
          return v();
        }
        case EventType.TOOL_CALL_ARGS: {
          let { toolCallId: e2, delta: n4 } = i4, r4 = m.find((t5) => t5.toolCalls?.some((t6) => t6.id === e2));
          if (!r4) return console.warn(`TOOL_CALL_ARGS: No message found containing tool call with ID '${e2}'`), v();
          let a7 = r4.toolCalls?.find((t5) => t5.id === e2);
          if (!a7) return console.warn(`TOOL_CALL_ARGS: No tool call found with ID '${e2}'`), v();
          let o6 = await t2(p, m, h, (e3, t5, n5) => {
            let r5 = a7.function.arguments, o7 = a7.function.name, s5 = {};
            try {
              s5 = untruncateJson(r5);
            } catch {
            }
            return e3.onToolCallArgsEvent?.({ event: i4, messages: t5, state: n5, agent: f2, input: u3, toolCallBuffer: r5, toolCallName: o7, partialToolCallArgs: s5 });
          });
          return _(o6), o6.stopPropagation !== true && (a7.function.arguments += n4, _({ messages: m })), v();
        }
        case EventType.TOOL_CALL_END: {
          let { toolCallId: e2 } = i4, n4 = m.find((t5) => t5.toolCalls?.some((t6) => t6.id === e2));
          if (!n4) return console.warn(`TOOL_CALL_END: No message found containing tool call with ID '${e2}'`), v();
          let r4 = n4.toolCalls?.find((t5) => t5.id === e2);
          return r4 ? (_(await t2(p, m, h, (e3, t5, n5) => {
            let a7 = r4.function.arguments, o6 = r4.function.name, s5 = {};
            try {
              s5 = JSON.parse(a7);
            } catch {
            }
            return e3.onToolCallEndEvent?.({ event: i4, messages: t5, state: n5, agent: f2, input: u3, toolCallName: o6, toolCallArgs: s5 });
          })), await Promise.all(p.map((e3) => {
            e3.onNewToolCall?.({ toolCall: r4, messages: m, state: h, agent: f2, input: u3 });
          })), v()) : (console.warn(`TOOL_CALL_END: No tool call found with ID '${e2}'`), v());
        }
        case EventType.TOOL_CALL_RESULT: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onToolCallResultEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { messageId: e3, toolCallId: t5, content: n4, role: r4 } = i4, a7 = { id: e3, toolCallId: t5, role: r4 || `tool`, content: n4 };
            m.push(a7), await Promise.all(p.map((e4) => {
              e4.onNewMessage?.({ message: a7, messages: m, state: h, agent: f2, input: u3 });
            })), _({ messages: m });
          }
          return v();
        }
        case EventType.STATE_SNAPSHOT: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onStateSnapshotEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { snapshot: e3 } = i4;
            h = e3, _({ state: h });
          }
          return v();
        }
        case EventType.STATE_DELTA: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onStateDeltaEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { delta: e3 } = i4;
            try {
              h = applyPatch(h, e3, true, false).newDocument, _({ state: h });
            } catch (t5) {
              let n4 = t5 instanceof Error ? t5.message : String(t5);
              console.warn(`Failed to apply state patch:
Current state: ${JSON.stringify(h, null, 2)}
Patch operations: ${JSON.stringify(e3, null, 2)}
Error: ${n4}`);
            }
          }
          return v();
        }
        case EventType.MESSAGES_SNAPSHOT: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onMessagesSnapshotEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { messages: e3 } = i4;
            m = e3, _({ messages: m });
          }
          return v();
        }
        case EventType.ACTIVITY_SNAPSHOT: {
          let n4 = i4, r4 = m.findIndex((e2) => e2.id === n4.messageId), a7 = r4 >= 0 ? m[r4] : void 0, o6 = a7?.role === `activity` ? a7 : void 0, s5 = n4.replace ?? true, c3 = await t2(p, m, h, (e2, t5, r5) => e2.onActivitySnapshotEvent?.({ event: n4, messages: t5, state: r5, agent: f2, input: u3, activityMessage: o6, existingMessage: a7 }));
          if (_(c3), c3.stopPropagation !== true) {
            let t5 = { id: n4.messageId, role: `activity`, activityType: n4.activityType, content: t(n4.content) }, i5;
            r4 === -1 ? (m.push(t5), i5 = t5) : o6 ? s5 && (m[r4] = { ...o6, activityType: n4.activityType, content: t(n4.content) }) : s5 && (m[r4] = t5, i5 = t5), _({ messages: m }), i5 && await Promise.all(p.map((e2) => e2.onNewMessage?.({ message: i5, messages: m, state: h, agent: f2, input: u3 })));
          }
          return v();
        }
        case EventType.ACTIVITY_DELTA: {
          let n4 = i4, a7 = m.findIndex((e2) => e2.id === n4.messageId);
          if (a7 === -1) return console.warn(`ACTIVITY_DELTA: No message found with ID '${n4.messageId}' to apply patch`), v();
          let o6 = m[a7];
          if (o6.role !== `activity`) return console.warn(`ACTIVITY_DELTA: Message '${n4.messageId}' is not an activity message`), v();
          let s5 = o6, c3 = await t2(p, m, h, (e2, t5, r4) => e2.onActivityDeltaEvent?.({ event: n4, messages: t5, state: r4, agent: f2, input: u3, activityMessage: s5 }));
          if (_(c3), c3.stopPropagation !== true) try {
            let t5 = t(s5.content ?? {}), i5 = applyPatch(t5, n4.patch ?? [], true, false).newDocument;
            m[a7] = { ...s5, content: t(i5), activityType: n4.activityType }, _({ messages: m });
          } catch (e2) {
            let t5 = e2 instanceof Error ? e2.message : String(e2);
            console.warn(`Failed to apply activity patch for '${n4.messageId}': ${t5}`);
          }
          return v();
        }
        case EventType.RAW:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onRawEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.CUSTOM:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onCustomEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.RUN_STARTED: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onRunStartedEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let e3 = i4;
            if (e3.input?.messages) {
              for (let t5 of e3.input.messages) m.find((e4) => e4.id === t5.id) || m.push(t5);
              _({ messages: m });
            }
          }
          return v();
        }
        case EventType.RUN_FINISHED:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onRunFinishedEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3, result: i4.result }))), v();
        case EventType.RUN_ERROR:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onRunErrorEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.STEP_STARTED:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onStepStartedEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.STEP_FINISHED:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onStepFinishedEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.TEXT_MESSAGE_CHUNK:
          throw Error(`TEXT_MESSAGE_CHUNK must be tranformed before being applied`);
        case EventType.TOOL_CALL_CHUNK:
          throw Error(`TOOL_CALL_CHUNK must be tranformed before being applied`);
        case EventType.THINKING_START:
          return v();
        case EventType.THINKING_END:
          return v();
        case EventType.THINKING_TEXT_MESSAGE_START:
          return v();
        case EventType.THINKING_TEXT_MESSAGE_CONTENT:
          return v();
        case EventType.THINKING_TEXT_MESSAGE_END:
          return v();
        case EventType.REASONING_START:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onReasoningStartEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.REASONING_MESSAGE_START: {
          let e2 = await t2(p, m, h, (e3, t5, n4) => e3.onReasoningMessageStartEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }));
          if (_(e2), e2.stopPropagation !== true) {
            let { messageId: e3 } = i4;
            if (!m.find((t5) => t5.id === e3)) {
              let t5 = { id: e3, role: `reasoning`, content: `` };
              m.push(t5), _({ messages: m });
            }
          }
          return v();
        }
        case EventType.REASONING_MESSAGE_CONTENT: {
          let { messageId: e2, delta: n4 } = i4, r4 = m.find((t5) => t5.id === e2);
          if (!r4) return console.warn(`REASONING_MESSAGE_CONTENT: No message found with ID '${e2}'`), v();
          let a7 = await t2(p, m, h, (e3, t5, n5) => e3.onReasoningMessageContentEvent?.({ event: i4, messages: t5, state: n5, agent: f2, input: u3, reasoningMessageBuffer: typeof r4.content == `string` ? r4.content : `` }));
          return _(a7), a7.stopPropagation !== true && (r4.content = `${typeof r4.content == `string` ? r4.content : ``}${n4}`, _({ messages: m })), v();
        }
        case EventType.REASONING_MESSAGE_END: {
          let { messageId: e2 } = i4, n4 = m.find((t5) => t5.id === e2);
          return n4 ? (_(await t2(p, m, h, (e3, t5, r4) => e3.onReasoningMessageEndEvent?.({ event: i4, messages: t5, state: r4, agent: f2, input: u3, reasoningMessageBuffer: typeof n4.content == `string` ? n4.content : `` }))), await Promise.all(p.map((e3) => {
            e3.onNewMessage?.({ message: n4, messages: m, state: h, agent: f2, input: u3 });
          })), v()) : (console.warn(`REASONING_MESSAGE_END: No message found with ID '${e2}'`), v());
        }
        case EventType.REASONING_MESSAGE_CHUNK:
          throw Error(`REASONING_MESSAGE_CHUNK must be transformed before being applied`);
        case EventType.REASONING_END:
          return _(await t2(p, m, h, (e2, t5, n4) => e2.onReasoningEndEvent?.({ event: i4, messages: t5, state: n4, agent: f2, input: u3 }))), v();
        case EventType.REASONING_ENCRYPTED_VALUE: {
          let { subtype: e2, entityId: n4, encryptedValue: r4 } = i4, a7 = await t2(p, m, h, (e3, t5, n5) => e3.onReasoningEncryptedValueEvent?.({ event: i4, messages: t5, state: n5, agent: f2, input: u3 }));
          if (_(a7), a7.stopPropagation !== true) {
            let t5 = false;
            if (e2 === `tool-call`) {
              for (let e3 of m) if (e3.role === `assistant` && e3.toolCalls) {
                let i5 = e3.toolCalls.find((e4) => e4.id === n4);
                if (i5) {
                  i5.encryptedValue = r4, t5 = true;
                  break;
                }
              }
            } else {
              let e3 = m.find((e4) => e4.id === n4);
              e3?.role !== `activity` && e3 && (e3.encryptedValue = r4, t5 = true);
            }
            t5 && (g.messages = m);
          }
          return v();
        }
      }
      return i4.type, v();
    }), mergeAll(), p.length > 0 ? defaultIfEmpty({}) : (e2) => e2);
  };

  // ../../sdks/typescript/packages/client/dist/verify/verify.mjs
  var a = (a6) => (o6) => {
    let s5 = /* @__PURE__ */ new Map(), c3 = /* @__PURE__ */ new Map(), l3 = false, u3 = false, d2 = false, f2 = /* @__PURE__ */ new Map(), p = false, m = false, h = false, g = () => {
      s5.clear(), c3.clear(), f2.clear(), p = false, m = false, l3 = false, u3 = false, h = true;
    };
    return o6.pipe(mergeMap((i4) => {
      let o7 = i4.type;
      if (a6 && console.debug(`[VERIFY]:`, JSON.stringify(i4)), u3) return throwError(() => new AGUIError(`Cannot send event type '${o7}': The run has already errored with 'RUN_ERROR'. No further events can be sent.`));
      if (l3 && o7 !== EventType.RUN_ERROR && o7 !== EventType.RUN_STARTED) return throwError(() => new AGUIError(`Cannot send event type '${o7}': The run has already finished with 'RUN_FINISHED'. Start a new run with 'RUN_STARTED'.`));
      if (!d2) {
        if (d2 = true, o7 !== EventType.RUN_STARTED && o7 !== EventType.RUN_ERROR) return throwError(() => new AGUIError(`First event must be 'RUN_STARTED'`));
      } else if (o7 === EventType.RUN_STARTED) {
        if (h && !l3) return throwError(() => new AGUIError(`Cannot send 'RUN_STARTED' while a run is still active. The previous run must be finished with 'RUN_FINISHED' before starting a new run.`));
        l3 && g();
      }
      switch (o7) {
        case EventType.TEXT_MESSAGE_START: {
          let t5 = i4.messageId;
          return s5.has(t5) ? throwError(() => new AGUIError(`Cannot send 'TEXT_MESSAGE_START' event: A text message with ID '${t5}' is already in progress. Complete it with 'TEXT_MESSAGE_END' first.`)) : (s5.set(t5, true), of(i4));
        }
        case EventType.TEXT_MESSAGE_CONTENT: {
          let t5 = i4.messageId;
          return s5.has(t5) ? of(i4) : throwError(() => new AGUIError(`Cannot send 'TEXT_MESSAGE_CONTENT' event: No active text message found with ID '${t5}'. Start a text message with 'TEXT_MESSAGE_START' first.`));
        }
        case EventType.TEXT_MESSAGE_END: {
          let t5 = i4.messageId;
          return s5.has(t5) ? (s5.delete(t5), of(i4)) : throwError(() => new AGUIError(`Cannot send 'TEXT_MESSAGE_END' event: No active text message found with ID '${t5}'. A 'TEXT_MESSAGE_START' event must be sent first.`));
        }
        case EventType.TOOL_CALL_START: {
          let t5 = i4.toolCallId;
          return c3.has(t5) ? throwError(() => new AGUIError(`Cannot send 'TOOL_CALL_START' event: A tool call with ID '${t5}' is already in progress. Complete it with 'TOOL_CALL_END' first.`)) : (c3.set(t5, true), of(i4));
        }
        case EventType.TOOL_CALL_ARGS: {
          let t5 = i4.toolCallId;
          return c3.has(t5) ? of(i4) : throwError(() => new AGUIError(`Cannot send 'TOOL_CALL_ARGS' event: No active tool call found with ID '${t5}'. Start a tool call with 'TOOL_CALL_START' first.`));
        }
        case EventType.TOOL_CALL_END: {
          let t5 = i4.toolCallId;
          return c3.has(t5) ? (c3.delete(t5), of(i4)) : throwError(() => new AGUIError(`Cannot send 'TOOL_CALL_END' event: No active tool call found with ID '${t5}'. A 'TOOL_CALL_START' event must be sent first.`));
        }
        case EventType.STEP_STARTED: {
          let t5 = i4.stepName;
          return f2.has(t5) ? throwError(() => new AGUIError(`Step "${t5}" is already active for 'STEP_STARTED'`)) : (f2.set(t5, true), of(i4));
        }
        case EventType.STEP_FINISHED: {
          let t5 = i4.stepName;
          return f2.has(t5) ? (f2.delete(t5), of(i4)) : throwError(() => new AGUIError(`Cannot send 'STEP_FINISHED' for step "${t5}" that was not started`));
        }
        case EventType.RUN_STARTED:
          return h = true, of(i4);
        case EventType.RUN_FINISHED:
          if (f2.size > 0) {
            let t5 = Array.from(f2.keys()).join(`, `);
            return throwError(() => new AGUIError(`Cannot send 'RUN_FINISHED' while steps are still active: ${t5}`));
          }
          if (s5.size > 0) {
            let t5 = Array.from(s5.keys()).join(`, `);
            return throwError(() => new AGUIError(`Cannot send 'RUN_FINISHED' while text messages are still active: ${t5}`));
          }
          if (c3.size > 0) {
            let t5 = Array.from(c3.keys()).join(`, `);
            return throwError(() => new AGUIError(`Cannot send 'RUN_FINISHED' while tool calls are still active: ${t5}`));
          }
          return l3 = true, of(i4);
        case EventType.RUN_ERROR:
          return u3 = true, of(i4);
        case EventType.CUSTOM:
          return of(i4);
        case EventType.THINKING_TEXT_MESSAGE_START:
          return p ? m ? throwError(() => new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_START' event: A thinking message is already in progress. Complete it with 'THINKING_TEXT_MESSAGE_END' first.`)) : (m = true, of(i4)) : throwError(() => new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_START' event: A thinking step is not in progress. Create one with 'THINKING_START' first.`));
        case EventType.THINKING_TEXT_MESSAGE_CONTENT:
          return m ? of(i4) : throwError(() => new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_CONTENT' event: No active thinking message found. Start a message with 'THINKING_TEXT_MESSAGE_START' first.`));
        case EventType.THINKING_TEXT_MESSAGE_END:
          return m ? (m = false, of(i4)) : throwError(() => new AGUIError(`Cannot send 'THINKING_TEXT_MESSAGE_END' event: No active thinking message found. A 'THINKING_TEXT_MESSAGE_START' event must be sent first.`));
        case EventType.THINKING_START:
          return p ? throwError(() => new AGUIError(`Cannot send 'THINKING_START' event: A thinking step is already in progress. End it with 'THINKING_END' first.`)) : (p = true, of(i4));
        case EventType.THINKING_END:
          return p ? (p = false, of(i4)) : throwError(() => new AGUIError(`Cannot send 'THINKING_END' event: No active thinking step found. A 'THINKING_START' event must be sent first.`));
        default:
          return of(i4);
      }
    }));
  };

  // ../../sdks/typescript/packages/client/dist/run/http-request.mjs
  var o = (function(e2) {
    return e2.HEADERS = `headers`, e2.DATA = `data`, e2;
  })({});
  var s = (s5, c3) => defer(() => from(fetch(s5, c3))).pipe(switchMap((t5) => {
    if (!t5.ok) {
      let e2 = t5.headers.get(`content-type`) || ``;
      return from(t5.text()).pipe(mergeMap((n4) => {
        let i4 = n4;
        if (e2.includes(`application/json`)) try {
          i4 = JSON.parse(n4);
        } catch {
        }
        let a7 = Error(`HTTP ${t5.status}: ${typeof i4 == `string` ? i4 : JSON.stringify(i4)}`);
        return a7.status = t5.status, a7.payload = i4, throwError(() => a7);
      }));
    }
    let a6 = { type: o.HEADERS, status: t5.status, headers: t5.headers }, s6 = t5.body?.getReader();
    return s6 ? new Observable((e2) => (e2.next(a6), (async () => {
      try {
        for (; ; ) {
          let { done: t6, value: n4 } = await s6.read();
          if (t6) break;
          let r4 = { type: o.DATA, data: n4 };
          e2.next(r4);
        }
        e2.complete();
      } catch (t6) {
        e2.error(t6);
      }
    })(), () => {
      s6.cancel().catch((e3) => {
        if (e3?.name !== `AbortError`) throw e3;
      });
    })) : throwError(() => Error(`Failed to getReader() from response`));
  }));

  // ../../sdks/typescript/packages/client/dist/transform/factory.mjs
  var r = (r4) => (i4) => {
    let a6 = new Subject(), o6 = new ReplaySubject(), s5 = false;
    return i4.subscribe({ next: (t5) => {
      if (o6.next(t5), t5.type === o.HEADERS && !s5) {
        s5 = true;
        let e2 = t5.headers.get(`content-type`), n4 = r4.find((e3) => e3.condition(t5));
        n4 ? n4.parser(o6, a6) : a6.error(Error(`Unsupported content type: ${e2}`));
      } else s5 || a6.error(Error(`No headers event received before data events`));
    }, error: (e2) => {
      o6.error(e2), a6.error(e2);
    }, complete: () => {
      o6.complete();
    } }), a6.asObservable();
  };

  // ../../sdks/typescript/packages/client/dist/legacy/types.mjs
  var t3 = _enum([`TextMessageStart`, `TextMessageContent`, `TextMessageEnd`, `ActionExecutionStart`, `ActionExecutionArgs`, `ActionExecutionEnd`, `ActionExecutionResult`, `AgentStateMessage`, `MetaEvent`, `RunStarted`, `RunFinished`, `RunError`, `NodeStarted`, `NodeFinished`]);
  var n2 = _enum([`LangGraphInterruptEvent`, `PredictState`, `Exit`]);
  var r2 = object({ type: literal(t3.def.entries.TextMessageStart), messageId: string2(), parentMessageId: optional(string2()), role: optional(string2()) });
  var i = object({ type: literal(t3.def.entries.TextMessageContent), messageId: string2(), content: string2() });
  var a2 = object({ type: literal(t3.def.entries.TextMessageEnd), messageId: string2() });
  var o2 = object({ type: literal(t3.def.entries.ActionExecutionStart), actionExecutionId: string2(), actionName: string2(), parentMessageId: optional(string2()) });
  var s2 = object({ type: literal(t3.def.entries.ActionExecutionArgs), actionExecutionId: string2(), args: string2() });
  var c = object({ type: literal(t3.def.entries.ActionExecutionEnd), actionExecutionId: string2() });
  var l = object({ type: literal(t3.def.entries.ActionExecutionResult), actionName: string2(), actionExecutionId: string2(), result: string2() });
  var u2 = object({ type: literal(t3.def.entries.AgentStateMessage), threadId: string2(), agentName: string2(), nodeName: string2(), runId: string2(), active: boolean2(), role: string2(), state: string2(), running: boolean2() });
  var d = object({ type: literal(t3.def.entries.MetaEvent), name: n2, value: any() });
  var f = object({ type: literal(t3.def.entries.RunError), message: string2(), code: optional(string2()) });
  discriminatedUnion(`type`, [r2, i, a2, o2, s2, c, l, u2, d, f]), object({ id: string2(), role: string2(), content: string2(), parentMessageId: optional(string2()) }), object({ id: string2(), name: string2(), arguments: any(), parentMessageId: optional(string2()) }), object({ id: string2(), result: any(), actionExecutionId: string2(), actionName: string2() });

  // ../../sdks/typescript/packages/client/dist/legacy/convert.mjs
  var a3 = (e2) => {
    if (typeof e2 == `string`) return e2;
    if (!Array.isArray(e2)) return;
    let t5 = e2.filter((e3) => e3.type === `text`).map((e3) => e3.text).filter((e3) => e3.length > 0);
    if (t5.length !== 0) return t5.join(`
`);
  };
  var o3 = (a6, o6, c3) => (l3) => {
    let u3 = {}, d2 = true, f2 = true, p = ``, m = null, h = null, g = [], _ = {}, v = (e2) => {
      typeof e2 == `object` && e2 && (`messages` in e2 && delete e2.messages, u3 = e2);
    };
    return l3.pipe(mergeMap((r4) => {
      switch (r4.type) {
        case EventType.TEXT_MESSAGE_START: {
          let t5 = r4;
          return [{ type: t3.def.entries.TextMessageStart, messageId: t5.messageId, role: t5.role }];
        }
        case EventType.TEXT_MESSAGE_CONTENT: {
          let t5 = r4;
          return [{ type: t3.def.entries.TextMessageContent, messageId: t5.messageId, content: t5.delta }];
        }
        case EventType.TEXT_MESSAGE_END: {
          let t5 = r4;
          return [{ type: t3.def.entries.TextMessageEnd, messageId: t5.messageId }];
        }
        case EventType.TOOL_CALL_START: {
          let t5 = r4;
          return g.push({ id: t5.toolCallId, type: `function`, function: { name: t5.toolCallName, arguments: `` } }), f2 = true, _[t5.toolCallId] = t5.toolCallName, [{ type: t3.def.entries.ActionExecutionStart, actionExecutionId: t5.toolCallId, actionName: t5.toolCallName, parentMessageId: t5.parentMessageId }];
        }
        case EventType.TOOL_CALL_ARGS: {
          let t5 = r4, n4 = g.find((e2) => e2.id === t5.toolCallId);
          if (!n4) return console.warn(`TOOL_CALL_ARGS: No tool call found with ID '${t5.toolCallId}'`), [];
          n4.function.arguments += t5.delta;
          let s5 = false;
          if (h) {
            let e2 = h.find((e3) => e3.tool == n4.function.name);
            if (e2) try {
              let t6 = JSON.parse(untruncateJson(n4.function.arguments));
              e2.tool_argument && e2.tool_argument in t6 ? (v({ ...u3, [e2.state_key]: t6[e2.tool_argument] }), s5 = true) : e2.tool_argument || (v({ ...u3, [e2.state_key]: t6 }), s5 = true);
            } catch {
            }
          }
          return [{ type: t3.def.entries.ActionExecutionArgs, actionExecutionId: t5.toolCallId, args: t5.delta }, ...s5 ? [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify(u3), active: f2 }] : []];
        }
        case EventType.TOOL_CALL_END: {
          let t5 = r4;
          return [{ type: t3.def.entries.ActionExecutionEnd, actionExecutionId: t5.toolCallId }];
        }
        case EventType.TOOL_CALL_RESULT: {
          let t5 = r4;
          return [{ type: t3.def.entries.ActionExecutionResult, actionExecutionId: t5.toolCallId, result: t5.content, actionName: _[t5.toolCallId] || `unknown` }];
        }
        case EventType.RAW:
          return [];
        case EventType.CUSTOM: {
          let t5 = r4;
          switch (t5.name) {
            case `Exit`:
              d2 = false;
              break;
            case `PredictState`:
              h = t5.value;
              break;
          }
          return [{ type: t3.def.entries.MetaEvent, name: t5.name, value: t5.value }];
        }
        case EventType.STATE_SNAPSHOT:
          return v(r4.snapshot), [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify(u3), active: f2 }];
        case EventType.STATE_DELTA: {
          let t5 = r4, i4 = applyPatch(u3, t5.delta, true, false);
          return i4 ? (v(i4.newDocument), [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify(u3), active: f2 }]) : [];
        }
        case EventType.MESSAGES_SNAPSHOT:
          return m = r4.messages, [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify({ ...u3, ...m ? { messages: m } : {} }), active: true }];
        case EventType.RUN_STARTED:
          return [];
        case EventType.RUN_FINISHED:
          return m && (u3.messages = m), Object.keys(u3).length === 0 ? [] : [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify({ ...u3, ...m ? { messages: s3(m) } : {} }), active: false }];
        case EventType.RUN_ERROR: {
          let t5 = r4;
          return [{ type: t3.def.entries.RunError, message: t5.message, code: t5.code }];
        }
        case EventType.STEP_STARTED:
          return p = r4.stepName, g = [], h = null, [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify(u3), active: true }];
        case EventType.STEP_FINISHED:
          return g = [], h = null, [{ type: t3.def.entries.AgentStateMessage, threadId: a6, agentName: c3, nodeName: p, runId: o6, running: d2, role: `assistant`, state: JSON.stringify(u3), active: false }];
        default:
          return [];
      }
    }));
  };
  function s3(e2) {
    let t5 = [];
    for (let n4 of e2) if (n4.role === `assistant` || n4.role === `user` || n4.role === `system`) {
      let e3 = a3(n4.content);
      if (e3) {
        let r4 = { id: n4.id, role: n4.role, content: e3 };
        t5.push(r4);
      }
      if (n4.role === `assistant` && n4.toolCalls && n4.toolCalls.length > 0) for (let e4 of n4.toolCalls) {
        let r4 = { id: e4.id, name: e4.function.name, arguments: JSON.parse(e4.function.arguments), parentMessageId: n4.id };
        t5.push(r4);
      }
    } else if (n4.role === `tool`) {
      let r4 = `unknown`;
      for (let t6 of e2) if (t6.role === `assistant` && t6.toolCalls?.length) {
        for (let e3 of t6.toolCalls) if (e3.id === n4.toolCallId) {
          r4 = e3.function.name;
          break;
        }
      }
      let i4 = { id: n4.id, result: n4.content, actionExecutionId: n4.toolCallId, actionName: r4 };
      t5.push(i4);
    }
    return t5;
  }

  // ../../sdks/typescript/packages/client/dist/chunks/transform.mjs
  var r3 = (r4) => (i4) => {
    let a6, o6, s5, c3, l3 = () => {
      if (!a6 || c3 !== `text`) throw Error(`No text message to close`);
      let t5 = { type: EventType.TEXT_MESSAGE_END, messageId: a6.messageId };
      return c3 = void 0, a6 = void 0, r4 && console.debug(`[TRANSFORM]: TEXT_MESSAGE_END`, JSON.stringify(t5)), t5;
    }, u3 = () => {
      if (!o6 || c3 !== `tool`) throw Error(`No tool call to close`);
      let t5 = { type: EventType.TOOL_CALL_END, toolCallId: o6.toolCallId };
      return c3 = void 0, o6 = void 0, r4 && console.debug(`[TRANSFORM]: TOOL_CALL_END`, JSON.stringify(t5)), t5;
    }, d2 = () => {
      if (!s5 || c3 !== `reasoning`) throw Error(`No reasoning message to close`);
      let t5 = { type: EventType.REASONING_MESSAGE_END, messageId: s5.messageId };
      return c3 = void 0, s5 = void 0, r4 && console.debug(`[TRANSFORM]: REASONING_MESSAGE_END`, JSON.stringify(t5)), t5;
    }, f2 = () => c3 === `text` ? [l3()] : c3 === `tool` ? [u3()] : c3 === `reasoning` ? [d2()] : [];
    return i4.pipe(mergeMap((t5) => {
      switch (t5.type) {
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
          return [...f2(), t5];
        case EventType.RAW:
        case EventType.ACTIVITY_SNAPSHOT:
        case EventType.ACTIVITY_DELTA:
        case EventType.REASONING_ENCRYPTED_VALUE:
          return [t5];
        case EventType.TEXT_MESSAGE_CHUNK:
          let n4 = t5, i5 = [];
          if ((c3 !== `text` || n4.messageId !== void 0 && n4.messageId !== a6?.messageId) && i5.push(...f2()), c3 !== `text`) {
            if (n4.messageId === void 0) throw Error(`First TEXT_MESSAGE_CHUNK must have a messageId`);
            a6 = { messageId: n4.messageId }, c3 = `text`;
            let t6 = { type: EventType.TEXT_MESSAGE_START, messageId: n4.messageId, role: n4.role || `assistant` };
            i5.push(t6), r4 && console.debug(`[TRANSFORM]: TEXT_MESSAGE_START`, JSON.stringify(t6));
          }
          if (n4.delta !== void 0) {
            let t6 = { type: EventType.TEXT_MESSAGE_CONTENT, messageId: a6.messageId, delta: n4.delta };
            i5.push(t6), r4 && console.debug(`[TRANSFORM]: TEXT_MESSAGE_CONTENT`, JSON.stringify(t6));
          }
          return i5;
        case EventType.TOOL_CALL_CHUNK:
          let l4 = t5, u4 = [];
          if ((c3 !== `tool` || l4.toolCallId !== void 0 && l4.toolCallId !== o6?.toolCallId) && u4.push(...f2()), c3 !== `tool`) {
            if (l4.toolCallId === void 0) throw Error(`First TOOL_CALL_CHUNK must have a toolCallId`);
            if (l4.toolCallName === void 0) throw Error(`First TOOL_CALL_CHUNK must have a toolCallName`);
            o6 = { toolCallId: l4.toolCallId, toolCallName: l4.toolCallName, parentMessageId: l4.parentMessageId }, c3 = `tool`;
            let t6 = { type: EventType.TOOL_CALL_START, toolCallId: l4.toolCallId, toolCallName: l4.toolCallName, parentMessageId: l4.parentMessageId };
            u4.push(t6), r4 && console.debug(`[TRANSFORM]: TOOL_CALL_START`, JSON.stringify(t6));
          }
          if (l4.delta !== void 0) {
            let t6 = { type: EventType.TOOL_CALL_ARGS, toolCallId: o6.toolCallId, delta: l4.delta };
            u4.push(t6), r4 && console.debug(`[TRANSFORM]: TOOL_CALL_ARGS`, JSON.stringify(t6));
          }
          return u4;
        case EventType.REASONING_MESSAGE_CHUNK:
          let d3 = t5, p = [];
          if ((c3 !== `reasoning` || d3.messageId && d3.messageId !== s5?.messageId) && p.push(...f2()), c3 !== `reasoning`) {
            if (d3.messageId === void 0) throw Error(`First REASONING_MESSAGE_CHUNK must have a messageId`);
            s5 = { messageId: d3.messageId }, c3 = `reasoning`;
            let t6 = { type: EventType.REASONING_MESSAGE_START, messageId: d3.messageId };
            p.push(t6), r4 && console.debug(`[TRANSFORM]: REASONING_MESSAGE_START`, JSON.stringify(t6));
          }
          if (d3.delta !== void 0) {
            let t6 = { type: EventType.REASONING_MESSAGE_CONTENT, messageId: s5.messageId, delta: d3.delta };
            p.push(t6), r4 && console.debug(`[TRANSFORM]: REASONING_MESSAGE_CONTENT`, JSON.stringify(t6));
          }
          return p;
      }
      return t5.type, [];
    }), finalize2(() => {
      f2();
    }));
  };

  // ../../sdks/typescript/packages/client/dist/middleware/middleware.mjs
  var a4 = class {
    runNext(e2, t5) {
      return t5.run(e2).pipe(r3(false));
    }
    runNextWithState(n4, a6) {
      let o6 = t(n4.messages || []), s5 = t(n4.state || {}), c3 = new ReplaySubject();
      return u(n4, c3, a6, []).subscribe((e2) => {
        e2.messages !== void 0 && (o6 = e2.messages), e2.state !== void 0 && (s5 = e2.state);
      }), this.runNext(n4, a6).pipe(concatMap(async (t5) => (c3.next(t5), await new Promise((e2) => setTimeout(e2, 0)), { event: t5, messages: t(o6), state: t(s5) })));
    }
  };
  var o4 = class extends a4 {
    constructor(e2) {
      super(), this.fn = e2;
    }
    run(e2, t5) {
      return this.fn(e2, t5);
    }
  };

  // ../../sdks/typescript/packages/client/dist/middleware/backward-compatibility-0-0-39.mjs
  function t4(e2) {
    let t5 = e2.content;
    if (Array.isArray(t5)) {
      let n4 = t5.filter((e3) => typeof e3 == `object` && !!e3 && `type` in e3 && e3.type === `text` && typeof e3.text == `string`).map((e3) => e3.text).join(``);
      return { ...e2, content: n4 };
    }
    return typeof t5 == `string` ? e2 : { ...e2, content: `` };
  }
  var n3 = class extends a4 {
    run(e2, n4) {
      let { parentRunId: r4, ...i4 } = e2, a6 = { ...i4, messages: i4.messages.map(t4) };
      return this.runNext(a6, n4);
    }
  };

  // ../../sdks/typescript/packages/client/dist/middleware/backward-compatibility-0-0-45.mjs
  var i2 = `THINKING_START`;
  var a5 = `THINKING_END`;
  var o5 = `THINKING_TEXT_MESSAGE_START`;
  var s4 = `THINKING_TEXT_MESSAGE_CONTENT`;
  var c2 = `THINKING_TEXT_MESSAGE_END`;
  var l2 = class extends a4 {
    constructor(...e2) {
      super(...e2), this.currentReasoningId = null, this.currentMessageId = null;
    }
    warnAboutTransformation(e2, t5) {
      process.env.SUPPRESS_TRANSFORMATION_WARNINGS || console.warn(`AG-UI is converting ${e2} to ${t5}. To remove this warning, upgrade your AG-UI integration package (e.g. @ag-ui/langgraph). To surpress it, set SUPPRESS_TRANSFORMATION_WARNINGS=true in your .env file.`);
    }
    run(e2, t5) {
      return this.currentReasoningId = null, this.currentMessageId = null, this.runNext(e2, t5).pipe(map((e3) => this.transformEvent(e3)));
    }
    transformEvent(t5) {
      switch (t5.type) {
        case i2: {
          this.currentReasoningId = n();
          let { title: r4, ...a6 } = t5;
          return this.warnAboutTransformation(i2, EventType.REASONING_START), { ...a6, type: EventType.REASONING_START, messageId: this.currentReasoningId };
        }
        case o5:
          return this.currentMessageId = n(), this.warnAboutTransformation(o5, EventType.REASONING_MESSAGE_START), { ...t5, type: EventType.REASONING_MESSAGE_START, messageId: this.currentMessageId, role: `assistant` };
        case s4: {
          let { delta: r4, ...i4 } = t5;
          return this.warnAboutTransformation(s4, EventType.REASONING_MESSAGE_CONTENT), { ...i4, type: EventType.REASONING_MESSAGE_CONTENT, messageId: this.currentMessageId ?? n(), delta: r4 };
        }
        case c2: {
          let r4 = this.currentMessageId ?? n();
          return this.warnAboutTransformation(c2, EventType.REASONING_MESSAGE_END), { ...t5, type: EventType.REASONING_MESSAGE_END, messageId: r4 };
        }
        case a5: {
          let r4 = this.currentReasoningId ?? n();
          return this.warnAboutTransformation(a5, EventType.REASONING_END), { ...t5, type: EventType.REASONING_END, messageId: r4 };
        }
        default:
          return t5;
      }
    }
  };

  // ../../sdks/typescript/packages/client/dist/package.mjs
  var e = `0.0.45`;

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
  var isWildcard = (s5) => s5 === "*" || s5 === "x" || s5 === "X";
  var tryParse = (v) => {
    const n4 = parseInt(v, 10);
    return isNaN(n4) ? v : n4;
  };
  var forceType = (a6, b) => typeof a6 !== typeof b ? [String(a6), String(b)] : [a6, b];
  var compareStrings = (a6, b) => {
    if (isWildcard(a6) || isWildcard(b))
      return 0;
    const [ap, bp] = forceType(tryParse(a6), tryParse(b));
    if (ap > bp)
      return 1;
    if (ap < bp)
      return -1;
    return 0;
  };
  var compareSegments = (a6, b) => {
    for (let i4 = 0; i4 < Math.max(a6.length, b.length); i4++) {
      const r4 = compareStrings(a6[i4] || "0", b[i4] || "0");
      if (r4 !== 0)
        return r4;
    }
    return 0;
  };

  // ../../node_modules/.pnpm/compare-versions@6.1.1/node_modules/compare-versions/lib/esm/compareVersions.js
  var compareVersions = (v1, v2) => {
    const n1 = validateAndParse(v1);
    const n22 = validateAndParse(v2);
    const p1 = n1.pop();
    const p2 = n22.pop();
    const r4 = compareSegments(n1, n22);
    if (r4 !== 0)
      return r4;
    if (p1 && p2) {
      return compareSegments(p1.split("."), p2.split("."));
    } else if (p1 || p2) {
      return p1 ? -1 : 1;
    }
    return 0;
  };

  // ../../sdks/typescript/packages/client/dist/agent/agent.mjs
  var w = class {
    get maxVersion() {
      return e;
    }
    constructor({ agentId: t5, description: n4, threadId: r4, initialMessages: i4, initialState: a6, debug: o6 } = {}) {
      this.debug = false, this.subscribers = [], this.isRunning = false, this.middlewares = [], this.agentId = t5, this.description = n4 ?? ``, this.threadId = r4 ?? v4_default(), this.messages = t(i4 ?? []), this.state = t(a6 ?? {}), this.debug = o6 ?? false, compareVersions(this.maxVersion, `0.0.39`) <= 0 && this.middlewares.unshift(new n3()), compareVersions(this.maxVersion, `0.0.45`) <= 0 && this.middlewares.unshift(new l2());
    }
    subscribe(e2) {
      return this.subscribers.push(e2), { unsubscribe: () => {
        this.subscribers = this.subscribers.filter((t5) => t5 !== e2);
      } };
    }
    use(...e2) {
      let t5 = e2.map((e3) => typeof e3 == `function` ? new o4(e3) : e3);
      return this.middlewares.push(...t5), this;
    }
    async runAgent(t5, n4) {
      try {
        this.isRunning = true, this.agentId = this.agentId ?? v4_default();
        let i4 = this.prepareRunAgentInput(t5), o6, s5 = new Set(this.messages.map((e2) => e2.id)), c3 = [{ onRunFinishedEvent: (e2) => {
          o6 = e2.result;
        } }, ...this.subscribers, n4 ?? {}];
        await this.onInitialize(i4, c3), this.activeRunDetach$ = new Subject();
        let l3;
        this.activeRunCompletionPromise = new Promise((e2) => {
          l3 = e2;
        }), await lastValueFrom(pipe(() => this.middlewares.length === 0 ? this.run(i4) : this.middlewares.reduceRight((e2, t6) => ({ run: (n5) => t6.run(n5, e2) }), this).run(i4), r3(this.debug), a(this.debug), (e2) => e2.pipe(takeUntil(this.activeRunDetach$)), (e2) => this.apply(i4, e2, c3), (e2) => this.processApplyEvents(i4, e2, c3), catchError((e2) => (this.isRunning = false, this.onError(i4, e2, c3))), finalize2(() => {
          this.isRunning = false, this.onFinalize(i4, c3), l3?.(), l3 = void 0, this.activeRunCompletionPromise = void 0, this.activeRunDetach$ = void 0;
        }))(of(null)));
        let d2 = t(this.messages).filter((e2) => !s5.has(e2.id));
        return { result: o6, newMessages: d2 };
      } finally {
        this.isRunning = false;
      }
    }
    connect(e2) {
      throw new AGUIConnectNotImplementedError();
    }
    async connectAgent(t5, n4) {
      try {
        this.isRunning = true, this.agentId = this.agentId ?? v4_default();
        let i4 = this.prepareRunAgentInput(t5), o6, s5 = new Set(this.messages.map((e2) => e2.id)), c3 = [{ onRunFinishedEvent: (e2) => {
          o6 = e2.result;
        } }, ...this.subscribers, n4 ?? {}];
        await this.onInitialize(i4, c3), this.activeRunDetach$ = new Subject();
        let l3;
        this.activeRunCompletionPromise = new Promise((e2) => {
          l3 = e2;
        }), await lastValueFrom(pipe(() => this.connect(i4), r3(this.debug), a(this.debug), (e2) => e2.pipe(takeUntil(this.activeRunDetach$)), (e2) => this.apply(i4, e2, c3), (e2) => this.processApplyEvents(i4, e2, c3), catchError((e2) => (this.isRunning = false, e2 instanceof AGUIConnectNotImplementedError ? EMPTY : this.onError(i4, e2, c3))), finalize2(() => {
          this.isRunning = false, this.onFinalize(i4, c3), l3?.(), l3 = void 0, this.activeRunCompletionPromise = void 0, this.activeRunDetach$ = void 0;
        }))(of(null)));
        let m = t(this.messages).filter((e2) => !s5.has(e2.id));
        return { result: o6, newMessages: m };
      } finally {
        this.isRunning = false;
      }
    }
    abortRun() {
    }
    async detachActiveRun() {
      if (!this.activeRunDetach$) return;
      let e2 = this.activeRunCompletionPromise ?? Promise.resolve();
      this.activeRunDetach$.next(), this.activeRunDetach$?.complete(), await e2;
    }
    apply(e2, t5, r4) {
      return u(e2, t5, this, r4);
    }
    processApplyEvents(e2, t5, n4) {
      return t5.pipe(tap((t6) => {
        t6.messages && (this.messages = t6.messages, n4.forEach((t7) => {
          t7.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e2 });
        })), t6.state && (this.state = t6.state, n4.forEach((t7) => {
          t7.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e2 });
        }));
      }));
    }
    prepareRunAgentInput(t5) {
      let n4 = t(this.messages).filter((e2) => e2.role !== `activity`);
      return { threadId: this.threadId, runId: t5?.runId || v4_default(), tools: t(t5?.tools ?? []), context: t(t5?.context ?? []), forwardedProps: t(t5?.forwardedProps ?? {}), state: t(this.state), messages: n4 };
    }
    async onInitialize(e2, n4) {
      let r4 = await t2(n4, this.messages, this.state, (t5, n5, r5) => t5.onRunInitialized?.({ messages: n5, state: r5, agent: this, input: e2 }));
      (r4.messages !== void 0 || r4.state !== void 0) && (r4.messages && (this.messages = r4.messages, e2.messages = r4.messages, n4.forEach((t5) => {
        t5.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e2 });
      })), r4.state && (this.state = r4.state, e2.state = r4.state, n4.forEach((t5) => {
        t5.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e2 });
      })));
    }
    onError(e2, n4, r4) {
      return from(t2(r4, this.messages, this.state, (t5, r5, i4) => t5.onRunFailed?.({ error: n4, messages: r5, state: i4, agent: this, input: e2 }))).pipe(map((t5) => {
        let i4 = t5;
        if ((i4.messages !== void 0 || i4.state !== void 0) && (i4.messages !== void 0 && (this.messages = i4.messages, r4.forEach((t6) => {
          t6.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e2 });
        })), i4.state !== void 0 && (this.state = i4.state, r4.forEach((t6) => {
          t6.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e2 });
        }))), i4.stopPropagation !== true) throw console.error(`Agent execution failed:`, n4), n4;
        return {};
      }));
    }
    async onFinalize(e2, n4) {
      let r4 = await t2(n4, this.messages, this.state, (t5, n5, r5) => t5.onRunFinalized?.({ messages: n5, state: r5, agent: this, input: e2 }));
      (r4.messages !== void 0 || r4.state !== void 0) && (r4.messages !== void 0 && (this.messages = r4.messages, n4.forEach((t5) => {
        t5.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this, input: e2 });
      })), r4.state !== void 0 && (this.state = r4.state, n4.forEach((t5) => {
        t5.onStateChanged?.({ state: this.state, messages: this.messages, agent: this, input: e2 });
      })));
    }
    clone() {
      let t5 = Object.create(Object.getPrototypeOf(this));
      return t5.agentId = this.agentId, t5.description = this.description, t5.threadId = this.threadId, t5.messages = t(this.messages), t5.state = t(this.state), t5.debug = this.debug, t5.isRunning = this.isRunning, t5.subscribers = [...this.subscribers], t5.middlewares = [...this.middlewares], t5;
    }
    addMessage(e2) {
      this.messages.push(e2), (async () => {
        for (let t5 of this.subscribers) await t5.onNewMessage?.({ message: e2, messages: this.messages, state: this.state, agent: this });
        if (e2.role === `assistant` && e2.toolCalls) for (let t5 of e2.toolCalls) for (let e3 of this.subscribers) await e3.onNewToolCall?.({ toolCall: t5, messages: this.messages, state: this.state, agent: this });
        for (let e3 of this.subscribers) await e3.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    addMessages(e2) {
      this.messages.push(...e2), (async () => {
        for (let t5 of e2) {
          for (let e3 of this.subscribers) await e3.onNewMessage?.({ message: t5, messages: this.messages, state: this.state, agent: this });
          if (t5.role === `assistant` && t5.toolCalls) for (let e3 of t5.toolCalls) for (let t6 of this.subscribers) await t6.onNewToolCall?.({ toolCall: e3, messages: this.messages, state: this.state, agent: this });
        }
        for (let e3 of this.subscribers) await e3.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    setMessages(t5) {
      this.messages = t(t5), (async () => {
        for (let e2 of this.subscribers) await e2.onMessagesChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    setState(t5) {
      this.state = t(t5), (async () => {
        for (let e2 of this.subscribers) await e2.onStateChanged?.({ messages: this.messages, state: this.state, agent: this });
      })();
    }
    legacy_to_be_removed_runAgentBridged(e2) {
      this.agentId = this.agentId ?? v4_default();
      let t5 = this.prepareRunAgentInput(e2);
      return (this.middlewares.length === 0 ? this.run(t5) : this.middlewares.reduceRight((e3, t6) => ({ run: (n4) => t6.run(n4, e3) }), this).run(t5)).pipe(r3(this.debug), a(this.debug), o3(this.threadId, t5.runId, this.agentId), (e3) => e3.pipe(map((e4) => (this.debug && console.debug(`[LEGACY]:`, JSON.stringify(e4)), e4))));
    }
  };

  // ../../sdks/typescript/packages/client/dist/agent/base-http.mjs
  var i3 = class extends w {
    requestInit(e2) {
      return { method: `POST`, headers: { ...this.headers, "Content-Type": `application/json`, Accept: `text/event-stream` }, body: JSON.stringify(e2), signal: this.abortController.signal };
    }
    runAgent(e2, t5) {
      return this.abortController = e2?.abortController ?? new AbortController(), super.runAgent(e2, t5);
    }
    abortRun() {
      this.abortController.abort(), super.abortRun();
    }
    constructor(t5) {
      super(t5), this.abortController = new AbortController(), this.httpEventStreamHandlers = [], this.url = t5.url, this.headers = t(t5.headers ?? {}), this.httpEventStreamHandlers = t5.streamHandlers ?? [];
    }
    run(e2) {
      let r4 = s(this.url, this.requestInit(e2));
      return r(this.httpEventStreamHandlers)(r4);
    }
    clone() {
      let t5 = super.clone();
      t5.url = this.url, t5.headers = t(this.headers ?? {});
      let n4 = new AbortController(), r4 = this.abortController.signal;
      return r4.aborted && n4.abort(r4.reason), t5.abortController = n4, t5;
    }
  };

  // src/index.ts
  var AnswerAgent = class extends i3 {
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

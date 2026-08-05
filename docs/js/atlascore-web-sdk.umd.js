(function(global2, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.AtlasCoreWebSDK = {}));
})(this, function(exports2) {
  "use strict";
  const VERSION$4 = "1.9.1";
  const re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
  function _makeCompatibilityCheck(ownVersion) {
    const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
    const rejectedVersions = /* @__PURE__ */ new Set();
    const myVersionMatch = ownVersion.match(re);
    if (!myVersionMatch) {
      return () => false;
    }
    const ownVersionParsed = {
      major: +myVersionMatch[1],
      minor: +myVersionMatch[2],
      patch: +myVersionMatch[3],
      prerelease: myVersionMatch[4]
    };
    if (ownVersionParsed.prerelease != null) {
      return function isExactmatch(globalVersion) {
        return globalVersion === ownVersion;
      };
    }
    function _reject(v) {
      rejectedVersions.add(v);
      return false;
    }
    function _accept(v) {
      acceptedVersions.add(v);
      return true;
    }
    return function isCompatible2(globalVersion) {
      if (acceptedVersions.has(globalVersion)) {
        return true;
      }
      if (rejectedVersions.has(globalVersion)) {
        return false;
      }
      const globalVersionMatch = globalVersion.match(re);
      if (!globalVersionMatch) {
        return _reject(globalVersion);
      }
      const globalVersionParsed = {
        major: +globalVersionMatch[1],
        minor: +globalVersionMatch[2],
        patch: +globalVersionMatch[3],
        prerelease: globalVersionMatch[4]
      };
      if (globalVersionParsed.prerelease != null) {
        return _reject(globalVersion);
      }
      if (ownVersionParsed.major !== globalVersionParsed.major) {
        return _reject(globalVersion);
      }
      if (ownVersionParsed.major === 0) {
        if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
          return _accept(globalVersion);
        }
        return _reject(globalVersion);
      }
      if (ownVersionParsed.minor <= globalVersionParsed.minor) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    };
  }
  const isCompatible = _makeCompatibilityCheck(VERSION$4);
  const major = VERSION$4.split(".")[0];
  const GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for(`opentelemetry.js.api.${major}`);
  const _global$1 = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  function registerGlobal(type, instance, diag2, allowOverride = false) {
    var _a2;
    const api = _global$1[GLOBAL_OPENTELEMETRY_API_KEY] = (_a2 = _global$1[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a2 !== void 0 ? _a2 : {
      version: VERSION$4
    };
    if (!allowOverride && api[type]) {
      const err = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
      diag2.error(err.stack || err.message);
      return false;
    }
    if (api.version !== VERSION$4) {
      const err = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION$4}`);
      diag2.error(err.stack || err.message);
      return false;
    }
    api[type] = instance;
    diag2.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION$4}.`);
    return true;
  }
  function getGlobal(type) {
    var _a2, _b;
    const globalVersion = (_a2 = _global$1[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a2 === void 0 ? void 0 : _a2.version;
    if (!globalVersion || !isCompatible(globalVersion)) {
      return;
    }
    return (_b = _global$1[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
  }
  function unregisterGlobal(type, diag2) {
    diag2.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION$4}.`);
    const api = _global$1[GLOBAL_OPENTELEMETRY_API_KEY];
    if (api) {
      delete api[type];
    }
  }
  class DiagComponentLogger {
    constructor(props) {
      this._namespace = props.namespace || "DiagComponentLogger";
    }
    debug(...args) {
      return logProxy("debug", this._namespace, args);
    }
    error(...args) {
      return logProxy("error", this._namespace, args);
    }
    info(...args) {
      return logProxy("info", this._namespace, args);
    }
    warn(...args) {
      return logProxy("warn", this._namespace, args);
    }
    verbose(...args) {
      return logProxy("verbose", this._namespace, args);
    }
  }
  function logProxy(funcName, namespace, args) {
    const logger2 = getGlobal("diag");
    if (!logger2) {
      return;
    }
    return logger2[funcName](namespace, ...args);
  }
  var DiagLogLevel;
  (function(DiagLogLevel2) {
    DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
    DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
    DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
    DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
    DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
    DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
    DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
  })(DiagLogLevel || (DiagLogLevel = {}));
  function createLogLevelDiagLogger(maxLevel, logger2) {
    if (maxLevel < DiagLogLevel.NONE) {
      maxLevel = DiagLogLevel.NONE;
    } else if (maxLevel > DiagLogLevel.ALL) {
      maxLevel = DiagLogLevel.ALL;
    }
    logger2 = logger2 || {};
    function _filterFunc(funcName, theLevel) {
      const theFunc = logger2[funcName];
      if (typeof theFunc === "function" && maxLevel >= theLevel) {
        return theFunc.bind(logger2);
      }
      return function() {
      };
    }
    return {
      error: _filterFunc("error", DiagLogLevel.ERROR),
      warn: _filterFunc("warn", DiagLogLevel.WARN),
      info: _filterFunc("info", DiagLogLevel.INFO),
      debug: _filterFunc("debug", DiagLogLevel.DEBUG),
      verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
    };
  }
  const API_NAME$4 = "diag";
  class DiagAPI {
    /** Get the singleton instance of the DiagAPI API */
    static instance() {
      if (!this._instance) {
        this._instance = new DiagAPI();
      }
      return this._instance;
    }
    /**
     * Private internal constructor
     * @private
     */
    constructor() {
      function _logProxy(funcName) {
        return function(...args) {
          const logger2 = getGlobal("diag");
          if (!logger2)
            return;
          return logger2[funcName](...args);
        };
      }
      const self2 = this;
      const setLogger = (logger2, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
        var _a2, _b, _c;
        if (logger2 === self2) {
          const err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
          self2.error((_a2 = err.stack) !== null && _a2 !== void 0 ? _a2 : err.message);
          return false;
        }
        if (typeof optionsOrLogLevel === "number") {
          optionsOrLogLevel = {
            logLevel: optionsOrLogLevel
          };
        }
        const oldLogger = getGlobal("diag");
        const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger2);
        if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
          const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
          oldLogger.warn(`Current logger will be overwritten from ${stack}`);
          newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
        }
        return registerGlobal("diag", newLogger, self2, true);
      };
      self2.setLogger = setLogger;
      self2.disable = () => {
        unregisterGlobal(API_NAME$4, self2);
      };
      self2.createComponentLogger = (options) => {
        return new DiagComponentLogger(options);
      };
      self2.verbose = _logProxy("verbose");
      self2.debug = _logProxy("debug");
      self2.info = _logProxy("info");
      self2.warn = _logProxy("warn");
      self2.error = _logProxy("error");
    }
  }
  class BaggageImpl {
    constructor(entries) {
      this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
    }
    getEntry(key) {
      const entry = this._entries.get(key);
      if (!entry) {
        return void 0;
      }
      return Object.assign({}, entry);
    }
    getAllEntries() {
      return Array.from(this._entries.entries());
    }
    setEntry(key, entry) {
      const newBaggage = new BaggageImpl(this._entries);
      newBaggage._entries.set(key, entry);
      return newBaggage;
    }
    removeEntry(key) {
      const newBaggage = new BaggageImpl(this._entries);
      newBaggage._entries.delete(key);
      return newBaggage;
    }
    removeEntries(...keys) {
      const newBaggage = new BaggageImpl(this._entries);
      for (const key of keys) {
        newBaggage._entries.delete(key);
      }
      return newBaggage;
    }
    clear() {
      return new BaggageImpl();
    }
  }
  const baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
  const diag$1 = DiagAPI.instance();
  function createBaggage(entries = {}) {
    return new BaggageImpl(new Map(Object.entries(entries)));
  }
  function baggageEntryMetadataFromString(str) {
    if (typeof str !== "string") {
      diag$1.error(`Cannot create baggage metadata from unknown type: ${typeof str}`);
      str = "";
    }
    return {
      __TYPE__: baggageEntryMetadataSymbol,
      toString() {
        return str;
      }
    };
  }
  function createContextKey(description) {
    return Symbol.for(description);
  }
  class BaseContext {
    /**
     * Construct a new context which inherits values from an optional parent context.
     *
     * @param parentContext a context from which to inherit values
     */
    constructor(parentContext) {
      const self2 = this;
      self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
      self2.getValue = (key) => self2._currentContext.get(key);
      self2.setValue = (key, value) => {
        const context2 = new BaseContext(self2._currentContext);
        context2._currentContext.set(key, value);
        return context2;
      };
      self2.deleteValue = (key) => {
        const context2 = new BaseContext(self2._currentContext);
        context2._currentContext.delete(key);
        return context2;
      };
    }
  }
  const ROOT_CONTEXT = new BaseContext();
  class NoopMeter {
    constructor() {
    }
    /**
     * @see {@link Meter.createGauge}
     */
    createGauge(_name, _options) {
      return NOOP_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createHistogram}
     */
    createHistogram(_name, _options) {
      return NOOP_HISTOGRAM_METRIC;
    }
    /**
     * @see {@link Meter.createCounter}
     */
    createCounter(_name, _options) {
      return NOOP_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createUpDownCounter}
     */
    createUpDownCounter(_name, _options) {
      return NOOP_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableGauge}
     */
    createObservableGauge(_name, _options) {
      return NOOP_OBSERVABLE_GAUGE_METRIC;
    }
    /**
     * @see {@link Meter.createObservableCounter}
     */
    createObservableCounter(_name, _options) {
      return NOOP_OBSERVABLE_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.createObservableUpDownCounter}
     */
    createObservableUpDownCounter(_name, _options) {
      return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
    }
    /**
     * @see {@link Meter.addBatchObservableCallback}
     */
    addBatchObservableCallback(_callback, _observables) {
    }
    /**
     * @see {@link Meter.removeBatchObservableCallback}
     */
    removeBatchObservableCallback(_callback) {
    }
  }
  class NoopMetric {
  }
  class NoopCounterMetric extends NoopMetric {
    add(_value, _attributes) {
    }
  }
  class NoopUpDownCounterMetric extends NoopMetric {
    add(_value, _attributes) {
    }
  }
  class NoopGaugeMetric extends NoopMetric {
    record(_value, _attributes) {
    }
  }
  class NoopHistogramMetric extends NoopMetric {
    record(_value, _attributes) {
    }
  }
  class NoopObservableMetric {
    addCallback(_callback) {
    }
    removeCallback(_callback) {
    }
  }
  class NoopObservableCounterMetric extends NoopObservableMetric {
  }
  class NoopObservableGaugeMetric extends NoopObservableMetric {
  }
  class NoopObservableUpDownCounterMetric extends NoopObservableMetric {
  }
  const NOOP_METER = new NoopMeter();
  const NOOP_COUNTER_METRIC = new NoopCounterMetric();
  const NOOP_GAUGE_METRIC = new NoopGaugeMetric();
  const NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
  const NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
  const NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
  const NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
  const NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
  const defaultTextMapGetter = {
    get(carrier, key) {
      if (carrier == null) {
        return void 0;
      }
      return carrier[key];
    },
    keys(carrier) {
      if (carrier == null) {
        return [];
      }
      return Object.keys(carrier);
    }
  };
  const defaultTextMapSetter = {
    set(carrier, key, value) {
      if (carrier == null) {
        return;
      }
      carrier[key] = value;
    }
  };
  class NoopContextManager {
    active() {
      return ROOT_CONTEXT;
    }
    with(_context, fn, thisArg, ...args) {
      return fn.call(thisArg, ...args);
    }
    bind(_context, target) {
      return target;
    }
    enable() {
      return this;
    }
    disable() {
      return this;
    }
  }
  const API_NAME$3 = "context";
  const NOOP_CONTEXT_MANAGER = new NoopContextManager();
  class ContextAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }
    /** Get the singleton instance of the Context API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new ContextAPI();
      }
      return this._instance;
    }
    /**
     * Set the current context manager.
     *
     * @returns true if the context manager was successfully registered, else false
     */
    setGlobalContextManager(contextManager) {
      return registerGlobal(API_NAME$3, contextManager, DiagAPI.instance());
    }
    /**
     * Get the currently active context
     */
    active() {
      return this._getContextManager().active();
    }
    /**
     * Execute a function with an active context
     *
     * @param context context to be active during function execution
     * @param fn function to execute in a context
     * @param thisArg optional receiver to be used for calling fn
     * @param args optional arguments forwarded to fn
     */
    with(context2, fn, thisArg, ...args) {
      return this._getContextManager().with(context2, fn, thisArg, ...args);
    }
    /**
     * Bind a context to a target function or event emitter
     *
     * @param context context to bind to the event emitter or function. Defaults to the currently active context
     * @param target function or event emitter to bind
     */
    bind(context2, target) {
      return this._getContextManager().bind(context2, target);
    }
    _getContextManager() {
      return getGlobal(API_NAME$3) || NOOP_CONTEXT_MANAGER;
    }
    /** Disable and remove the global context manager */
    disable() {
      this._getContextManager().disable();
      unregisterGlobal(API_NAME$3, DiagAPI.instance());
    }
  }
  var TraceFlags;
  (function(TraceFlags2) {
    TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
    TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
  })(TraceFlags || (TraceFlags = {}));
  const INVALID_SPANID = "0000000000000000";
  const INVALID_TRACEID = "00000000000000000000000000000000";
  const INVALID_SPAN_CONTEXT = {
    traceId: INVALID_TRACEID,
    spanId: INVALID_SPANID,
    traceFlags: TraceFlags.NONE
  };
  class NonRecordingSpan {
    constructor(spanContext = INVALID_SPAN_CONTEXT) {
      this._spanContext = spanContext;
    }
    // Returns a SpanContext.
    spanContext() {
      return this._spanContext;
    }
    // By default does nothing
    setAttribute(_key, _value) {
      return this;
    }
    // By default does nothing
    setAttributes(_attributes) {
      return this;
    }
    // By default does nothing
    addEvent(_name, _attributes) {
      return this;
    }
    addLink(_link) {
      return this;
    }
    addLinks(_links) {
      return this;
    }
    // By default does nothing
    setStatus(_status) {
      return this;
    }
    // By default does nothing
    updateName(_name) {
      return this;
    }
    // By default does nothing
    end(_endTime) {
    }
    // isRecording always returns false for NonRecordingSpan.
    isRecording() {
      return false;
    }
    // By default does nothing
    recordException(_exception, _time) {
    }
  }
  const SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
  function getSpan(context2) {
    return context2.getValue(SPAN_KEY) || void 0;
  }
  function getActiveSpan() {
    return getSpan(ContextAPI.getInstance().active());
  }
  function setSpan(context2, span) {
    return context2.setValue(SPAN_KEY, span);
  }
  function deleteSpan(context2) {
    return context2.deleteValue(SPAN_KEY);
  }
  function setSpanContext(context2, spanContext) {
    return setSpan(context2, new NonRecordingSpan(spanContext));
  }
  function getSpanContext(context2) {
    var _a2;
    return (_a2 = getSpan(context2)) === null || _a2 === void 0 ? void 0 : _a2.spanContext();
  }
  const isHex = new Uint8Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
    1,
    1,
    1,
    1,
    1
  ]);
  function isValidHex(id, length) {
    if (typeof id !== "string" || id.length !== length)
      return false;
    let r = 0;
    for (let i = 0; i < id.length; i += 4) {
      r += (isHex[id.charCodeAt(i)] | 0) + (isHex[id.charCodeAt(i + 1)] | 0) + (isHex[id.charCodeAt(i + 2)] | 0) + (isHex[id.charCodeAt(i + 3)] | 0);
    }
    return r === length;
  }
  function isValidTraceId(traceId) {
    return isValidHex(traceId, 32) && traceId !== INVALID_TRACEID;
  }
  function isValidSpanId(spanId) {
    return isValidHex(spanId, 16) && spanId !== INVALID_SPANID;
  }
  function isSpanContextValid(spanContext) {
    return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
  }
  function wrapSpanContext(spanContext) {
    return new NonRecordingSpan(spanContext);
  }
  const contextApi = ContextAPI.getInstance();
  class NoopTracer {
    // startSpan starts a noop span.
    startSpan(name, options, context2 = contextApi.active()) {
      const root = Boolean(options === null || options === void 0 ? void 0 : options.root);
      if (root) {
        return new NonRecordingSpan();
      }
      const parentFromContext = context2 && getSpanContext(context2);
      if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
        return new NonRecordingSpan(parentFromContext);
      } else {
        return new NonRecordingSpan();
      }
    }
    startActiveSpan(name, arg2, arg3, arg4) {
      let opts;
      let ctx;
      let fn;
      if (arguments.length < 2) {
        return;
      } else if (arguments.length === 2) {
        fn = arg2;
      } else if (arguments.length === 3) {
        opts = arg2;
        fn = arg3;
      } else {
        opts = arg2;
        ctx = arg3;
        fn = arg4;
      }
      const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
      const span = this.startSpan(name, opts, parentContext);
      const contextWithSpanSet = setSpan(parentContext, span);
      return contextApi.with(contextWithSpanSet, fn, void 0, span);
    }
  }
  function isSpanContext(spanContext) {
    return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
  }
  const NOOP_TRACER = new NoopTracer();
  class ProxyTracer {
    constructor(provider, name, version, options) {
      this._provider = provider;
      this.name = name;
      this.version = version;
      this.options = options;
    }
    startSpan(name, options, context2) {
      return this._getTracer().startSpan(name, options, context2);
    }
    startActiveSpan(_name, _options, _context, _fn) {
      const tracer = this._getTracer();
      return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
    }
    /**
     * Try to get a tracer from the proxy tracer provider.
     * If the proxy tracer provider has no delegate, return a noop tracer.
     */
    _getTracer() {
      if (this._delegate) {
        return this._delegate;
      }
      const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
      if (!tracer) {
        return NOOP_TRACER;
      }
      this._delegate = tracer;
      return this._delegate;
    }
  }
  class NoopTracerProvider {
    getTracer(_name, _version, _options) {
      return new NoopTracer();
    }
  }
  const NOOP_TRACER_PROVIDER = new NoopTracerProvider();
  class ProxyTracerProvider {
    /**
     * Get a {@link ProxyTracer}
     */
    getTracer(name, version, options) {
      var _a2;
      return (_a2 = this.getDelegateTracer(name, version, options)) !== null && _a2 !== void 0 ? _a2 : new ProxyTracer(this, name, version, options);
    }
    getDelegate() {
      var _a2;
      return (_a2 = this._delegate) !== null && _a2 !== void 0 ? _a2 : NOOP_TRACER_PROVIDER;
    }
    /**
     * Set the delegate tracer provider
     */
    setDelegate(delegate) {
      this._delegate = delegate;
    }
    getDelegateTracer(name, version, options) {
      var _a2;
      return (_a2 = this._delegate) === null || _a2 === void 0 ? void 0 : _a2.getTracer(name, version, options);
    }
  }
  var SamplingDecision$1;
  (function(SamplingDecision2) {
    SamplingDecision2[SamplingDecision2["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision2[SamplingDecision2["RECORD"] = 1] = "RECORD";
    SamplingDecision2[SamplingDecision2["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
  })(SamplingDecision$1 || (SamplingDecision$1 = {}));
  var SpanKind;
  (function(SpanKind2) {
    SpanKind2[SpanKind2["INTERNAL"] = 0] = "INTERNAL";
    SpanKind2[SpanKind2["SERVER"] = 1] = "SERVER";
    SpanKind2[SpanKind2["CLIENT"] = 2] = "CLIENT";
    SpanKind2[SpanKind2["PRODUCER"] = 3] = "PRODUCER";
    SpanKind2[SpanKind2["CONSUMER"] = 4] = "CONSUMER";
  })(SpanKind || (SpanKind = {}));
  var SpanStatusCode;
  (function(SpanStatusCode2) {
    SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
    SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
    SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
  })(SpanStatusCode || (SpanStatusCode = {}));
  const context = ContextAPI.getInstance();
  const diag = DiagAPI.instance();
  class NoopMeterProvider {
    getMeter(_name, _version, _options) {
      return NOOP_METER;
    }
  }
  const NOOP_METER_PROVIDER = new NoopMeterProvider();
  const API_NAME$2 = "metrics";
  class MetricsAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
    }
    /** Get the singleton instance of the Metrics API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new MetricsAPI();
      }
      return this._instance;
    }
    /**
     * Set the current global meter provider.
     * Returns true if the meter provider was successfully registered, else false.
     */
    setGlobalMeterProvider(provider) {
      return registerGlobal(API_NAME$2, provider, DiagAPI.instance());
    }
    /**
     * Returns the global meter provider.
     */
    getMeterProvider() {
      return getGlobal(API_NAME$2) || NOOP_METER_PROVIDER;
    }
    /**
     * Returns a meter from the global meter provider.
     */
    getMeter(name, version, options) {
      return this.getMeterProvider().getMeter(name, version, options);
    }
    /** Remove the global meter provider */
    disable() {
      unregisterGlobal(API_NAME$2, DiagAPI.instance());
    }
  }
  const metrics = MetricsAPI.getInstance();
  class NoopTextMapPropagator {
    /** Noop inject function does nothing */
    inject(_context, _carrier) {
    }
    /** Noop extract function does nothing and returns the input context */
    extract(context2, _carrier) {
      return context2;
    }
    fields() {
      return [];
    }
  }
  const BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
  function getBaggage(context2) {
    return context2.getValue(BAGGAGE_KEY) || void 0;
  }
  function getActiveBaggage() {
    return getBaggage(ContextAPI.getInstance().active());
  }
  function setBaggage(context2, baggage) {
    return context2.setValue(BAGGAGE_KEY, baggage);
  }
  function deleteBaggage(context2) {
    return context2.deleteValue(BAGGAGE_KEY);
  }
  const API_NAME$1 = "propagation";
  const NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
  class PropagationAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
      this.createBaggage = createBaggage;
      this.getBaggage = getBaggage;
      this.getActiveBaggage = getActiveBaggage;
      this.setBaggage = setBaggage;
      this.deleteBaggage = deleteBaggage;
    }
    /** Get the singleton instance of the Propagator API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new PropagationAPI();
      }
      return this._instance;
    }
    /**
     * Set the current propagator.
     *
     * @returns true if the propagator was successfully registered, else false
     */
    setGlobalPropagator(propagator) {
      return registerGlobal(API_NAME$1, propagator, DiagAPI.instance());
    }
    /**
     * Inject context into a carrier to be propagated inter-process
     *
     * @param context Context carrying tracing data to inject
     * @param carrier carrier to inject context into
     * @param setter Function used to set values on the carrier
     */
    inject(context2, carrier, setter = defaultTextMapSetter) {
      return this._getGlobalPropagator().inject(context2, carrier, setter);
    }
    /**
     * Extract context from a carrier
     *
     * @param context Context which the newly created context will inherit from
     * @param carrier Carrier to extract context from
     * @param getter Function used to extract keys from a carrier
     */
    extract(context2, carrier, getter = defaultTextMapGetter) {
      return this._getGlobalPropagator().extract(context2, carrier, getter);
    }
    /**
     * Return a list of all fields which may be used by the propagator.
     */
    fields() {
      return this._getGlobalPropagator().fields();
    }
    /** Remove the global propagator */
    disable() {
      unregisterGlobal(API_NAME$1, DiagAPI.instance());
    }
    _getGlobalPropagator() {
      return getGlobal(API_NAME$1) || NOOP_TEXT_MAP_PROPAGATOR;
    }
  }
  const propagation = PropagationAPI.getInstance();
  const API_NAME = "trace";
  class TraceAPI {
    /** Empty private constructor prevents end users from constructing a new instance of the API */
    constructor() {
      this._proxyTracerProvider = new ProxyTracerProvider();
      this.wrapSpanContext = wrapSpanContext;
      this.isSpanContextValid = isSpanContextValid;
      this.deleteSpan = deleteSpan;
      this.getSpan = getSpan;
      this.getActiveSpan = getActiveSpan;
      this.getSpanContext = getSpanContext;
      this.setSpan = setSpan;
      this.setSpanContext = setSpanContext;
    }
    /** Get the singleton instance of the Trace API */
    static getInstance() {
      if (!this._instance) {
        this._instance = new TraceAPI();
      }
      return this._instance;
    }
    /**
     * Set the current global tracer.
     *
     * @returns true if the tracer provider was successfully registered, else false
     */
    setGlobalTracerProvider(provider) {
      const success = registerGlobal(API_NAME, this._proxyTracerProvider, DiagAPI.instance());
      if (success) {
        this._proxyTracerProvider.setDelegate(provider);
      }
      return success;
    }
    /**
     * Returns the global tracer provider.
     */
    getTracerProvider() {
      return getGlobal(API_NAME) || this._proxyTracerProvider;
    }
    /**
     * Returns a tracer from the global tracer provider.
     */
    getTracer(name, version) {
      return this.getTracerProvider().getTracer(name, version);
    }
    /** Remove the global tracer provider */
    disable() {
      unregisterGlobal(API_NAME, DiagAPI.instance());
      this._proxyTracerProvider = new ProxyTracerProvider();
    }
  }
  const trace = TraceAPI.getInstance();
  function resolveConfig(config) {
    return {
      application: config.application,
      environment: config.environment,
      serviceVersion: config.serviceVersion ?? "0.0.0",
      endpoint: config.endpoint,
      exportIntervalMs: config.exportIntervalMs ?? 5e3,
      sampleRate: config.sampleRate ?? 1,
      debug: config.debug ?? false,
      trackPageViews: config.trackPageViews ?? true,
      trackFetch: config.trackFetch ?? true,
      trackXHR: config.trackXHR ?? true,
      trackErrors: config.trackErrors ?? true
    };
  }
  let debugEnabled = false;
  const PREFIX = "[AtlasCore]";
  const logger$1 = {
    init(debug) {
      debugEnabled = debug;
    },
    debug(...args) {
      if (debugEnabled) {
        console.debug(PREFIX, ...args);
      }
    },
    info(...args) {
      if (debugEnabled) {
        console.info(PREFIX, ...args);
      }
    },
    warn(...args) {
      console.warn(PREFIX, ...args);
    },
    error(...args) {
      console.error(PREFIX, ...args);
    }
  };
  var TMP_PROCESS_RUNTIME_NAME = "process.runtime.name";
  var TMP_SERVICE_NAME = "service.name";
  var TMP_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
  var TMP_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
  var TMP_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
  var SEMRESATTRS_PROCESS_RUNTIME_NAME = TMP_PROCESS_RUNTIME_NAME;
  var SEMRESATTRS_SERVICE_NAME = TMP_SERVICE_NAME;
  var SEMRESATTRS_TELEMETRY_SDK_NAME = TMP_TELEMETRY_SDK_NAME;
  var SEMRESATTRS_TELEMETRY_SDK_LANGUAGE = TMP_TELEMETRY_SDK_LANGUAGE;
  var SEMRESATTRS_TELEMETRY_SDK_VERSION = TMP_TELEMETRY_SDK_VERSION;
  var TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS = "webjs";
  var TELEMETRYSDKLANGUAGEVALUES_WEBJS = TMP_TELEMETRYSDKLANGUAGEVALUES_WEBJS;
  var VERSION$3 = "1.30.1";
  var _a$1;
  var SDK_INFO = (_a$1 = {}, _a$1[SEMRESATTRS_TELEMETRY_SDK_NAME] = "opentelemetry", _a$1[SEMRESATTRS_PROCESS_RUNTIME_NAME] = "browser", _a$1[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] = TELEMETRYSDKLANGUAGEVALUES_WEBJS, _a$1[SEMRESATTRS_TELEMETRY_SDK_VERSION] = VERSION$3, _a$1);
  function defaultServiceName() {
    return "unknown_service";
  }
  var __assign$2 = function() {
    __assign$2 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign$2.apply(this, arguments);
  };
  var __awaiter$2 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator$2 = function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
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
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
  var __read$c = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var Resource = (
    /** @class */
    function() {
      function Resource2(attributes, asyncAttributesPromise) {
        var _this = this;
        var _a2;
        this._attributes = attributes;
        this.asyncAttributesPending = asyncAttributesPromise != null;
        this._syncAttributes = (_a2 = this._attributes) !== null && _a2 !== void 0 ? _a2 : {};
        this._asyncAttributesPromise = asyncAttributesPromise === null || asyncAttributesPromise === void 0 ? void 0 : asyncAttributesPromise.then(function(asyncAttributes) {
          _this._attributes = Object.assign({}, _this._attributes, asyncAttributes);
          _this.asyncAttributesPending = false;
          return asyncAttributes;
        }, function(err) {
          diag.debug("a resource's async attributes promise rejected: %s", err);
          _this.asyncAttributesPending = false;
          return {};
        });
      }
      Resource2.empty = function() {
        return Resource2.EMPTY;
      };
      Resource2.default = function() {
        var _a2;
        return new Resource2((_a2 = {}, _a2[SEMRESATTRS_SERVICE_NAME] = defaultServiceName(), _a2[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE] = SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_LANGUAGE], _a2[SEMRESATTRS_TELEMETRY_SDK_NAME] = SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_NAME], _a2[SEMRESATTRS_TELEMETRY_SDK_VERSION] = SDK_INFO[SEMRESATTRS_TELEMETRY_SDK_VERSION], _a2));
      };
      Object.defineProperty(Resource2.prototype, "attributes", {
        get: function() {
          var _a2;
          if (this.asyncAttributesPending) {
            diag.error("Accessing resource attributes before async attributes settled");
          }
          return (_a2 = this._attributes) !== null && _a2 !== void 0 ? _a2 : {};
        },
        enumerable: false,
        configurable: true
      });
      Resource2.prototype.waitForAsyncAttributes = function() {
        return __awaiter$2(this, void 0, void 0, function() {
          return __generator$2(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                if (!this.asyncAttributesPending) return [3, 2];
                return [4, this._asyncAttributesPromise];
              case 1:
                _a2.sent();
                _a2.label = 2;
              case 2:
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      Resource2.prototype.merge = function(other) {
        var _this = this;
        var _a2;
        if (!other)
          return this;
        var mergedSyncAttributes = __assign$2(__assign$2({}, this._syncAttributes), (_a2 = other._syncAttributes) !== null && _a2 !== void 0 ? _a2 : other.attributes);
        if (!this._asyncAttributesPromise && !other._asyncAttributesPromise) {
          return new Resource2(mergedSyncAttributes);
        }
        var mergedAttributesPromise = Promise.all([
          this._asyncAttributesPromise,
          other._asyncAttributesPromise
        ]).then(function(_a3) {
          var _b;
          var _c = __read$c(_a3, 2), thisAsyncAttributes = _c[0], otherAsyncAttributes = _c[1];
          return __assign$2(__assign$2(__assign$2(__assign$2({}, _this._syncAttributes), thisAsyncAttributes), (_b = other._syncAttributes) !== null && _b !== void 0 ? _b : other.attributes), otherAsyncAttributes);
        });
        return new Resource2(mergedSyncAttributes, mergedAttributesPromise);
      };
      Resource2.EMPTY = new Resource2({});
      return Resource2;
    }()
  );
  const TMP_HTTP_URL$2 = "http.url";
  const TMP_HTTP_USER_AGENT$2 = "http.user_agent";
  const SEMATTRS_HTTP_URL$2 = TMP_HTTP_URL$2;
  const SEMATTRS_HTTP_USER_AGENT$2 = TMP_HTTP_USER_AGENT$2;
  const ATTR_DEPLOYMENT_ENVIRONMENT_NAME = "deployment.environment.name";
  const ATTR_SERVICE_NAME = "service.name";
  const ATTR_SERVICE_VERSION = "service.version";
  const SESSION_KEY = "atlascore.session_id";
  const USER_KEY = "atlascore.user_id";
  function generateId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  }
  function getSessionId() {
    try {
      let sessionId = sessionStorage.getItem(SESSION_KEY);
      if (!sessionId) {
        sessionId = generateId();
        sessionStorage.setItem(SESSION_KEY, sessionId);
      }
      return sessionId;
    } catch {
      return generateId();
    }
  }
  function getAnonymousUserId() {
    try {
      let userId = localStorage.getItem(USER_KEY);
      if (!userId) {
        userId = generateId();
        localStorage.setItem(USER_KEY, userId);
      }
      return userId;
    } catch {
      return generateId();
    }
  }
  function getSessionAttributes() {
    return {
      "session.id": getSessionId(),
      "user.id": getAnonymousUserId()
    };
  }
  function buildResource(config) {
    const nav = navigator;
    const loc = window.location;
    return new Resource({
      // --- Atributos de Servicio (OTel standard) ---
      [ATTR_SERVICE_NAME]: config.application,
      [ATTR_SERVICE_VERSION]: config.serviceVersion,
      [ATTR_DEPLOYMENT_ENVIRONMENT_NAME]: config.environment,
      // --- Atributos de SDK ---
      "atlascore.sdk.name": "@atlascore/web-sdk",
      "atlascore.sdk.version": "__SDK_VERSION__",
      // --- Atributos de Sesión ---
      "session.id": getSessionId(),
      "user.id": getAnonymousUserId(),
      // --- Atributos de Browser ---
      "browser.language": nav.language,
      "browser.user_agent": nav.userAgent,
      "browser.platform": nav.platform,
      // --- Atributos de Página ---
      "page.url": loc.href,
      "page.path": loc.pathname,
      "page.hostname": loc.hostname,
      "page.title": document.title,
      // --- Referrer ---
      "page.referrer": document.referrer || "(direct)"
    });
  }
  var SUPPRESS_TRACING_KEY = createContextKey("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
  function suppressTracing(context2) {
    return context2.setValue(SUPPRESS_TRACING_KEY, true);
  }
  function isTracingSuppressed(context2) {
    return context2.getValue(SUPPRESS_TRACING_KEY) === true;
  }
  var BAGGAGE_KEY_PAIR_SEPARATOR$1 = "=";
  var BAGGAGE_PROPERTIES_SEPARATOR$1 = ";";
  var BAGGAGE_ITEMS_SEPARATOR$1 = ",";
  var BAGGAGE_HEADER = "baggage";
  var BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
  var BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
  var BAGGAGE_MAX_TOTAL_LENGTH$1 = 8192;
  var __read$b = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  function serializeKeyPairs$1(keyPairs) {
    return keyPairs.reduce(function(hValue, current) {
      var value = "" + hValue + (hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR$1 : "") + current;
      return value.length > BAGGAGE_MAX_TOTAL_LENGTH$1 ? hValue : value;
    }, "");
  }
  function getKeyPairs$1(baggage) {
    return baggage.getAllEntries().map(function(_a2) {
      var _b = __read$b(_a2, 2), key = _b[0], value = _b[1];
      var entry = encodeURIComponent(key) + "=" + encodeURIComponent(value.value);
      if (value.metadata !== void 0) {
        entry += BAGGAGE_PROPERTIES_SEPARATOR$1 + value.metadata.toString();
      }
      return entry;
    });
  }
  function parsePairKeyValue$1(entry) {
    var valueProps = entry.split(BAGGAGE_PROPERTIES_SEPARATOR$1);
    if (valueProps.length <= 0)
      return;
    var keyPairPart = valueProps.shift();
    if (!keyPairPart)
      return;
    var separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR$1);
    if (separatorIndex <= 0)
      return;
    var key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
    var value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
    var metadata;
    if (valueProps.length > 0) {
      metadata = baggageEntryMetadataFromString(valueProps.join(BAGGAGE_PROPERTIES_SEPARATOR$1));
    }
    return { key, value, metadata };
  }
  var W3CBaggagePropagator = (
    /** @class */
    function() {
      function W3CBaggagePropagator2() {
      }
      W3CBaggagePropagator2.prototype.inject = function(context2, carrier, setter) {
        var baggage = propagation.getBaggage(context2);
        if (!baggage || isTracingSuppressed(context2))
          return;
        var keyPairs = getKeyPairs$1(baggage).filter(function(pair) {
          return pair.length <= BAGGAGE_MAX_PER_NAME_VALUE_PAIRS;
        }).slice(0, BAGGAGE_MAX_NAME_VALUE_PAIRS);
        var headerValue = serializeKeyPairs$1(keyPairs);
        if (headerValue.length > 0) {
          setter.set(carrier, BAGGAGE_HEADER, headerValue);
        }
      };
      W3CBaggagePropagator2.prototype.extract = function(context2, carrier, getter) {
        var headerValue = getter.get(carrier, BAGGAGE_HEADER);
        var baggageString = Array.isArray(headerValue) ? headerValue.join(BAGGAGE_ITEMS_SEPARATOR$1) : headerValue;
        if (!baggageString)
          return context2;
        var baggage = {};
        if (baggageString.length === 0) {
          return context2;
        }
        var pairs = baggageString.split(BAGGAGE_ITEMS_SEPARATOR$1);
        pairs.forEach(function(entry) {
          var keyPair = parsePairKeyValue$1(entry);
          if (keyPair) {
            var baggageEntry = { value: keyPair.value };
            if (keyPair.metadata) {
              baggageEntry.metadata = keyPair.metadata;
            }
            baggage[keyPair.key] = baggageEntry;
          }
        });
        if (Object.entries(baggage).length === 0) {
          return context2;
        }
        return propagation.setBaggage(context2, propagation.createBaggage(baggage));
      };
      W3CBaggagePropagator2.prototype.fields = function() {
        return [BAGGAGE_HEADER];
      };
      return W3CBaggagePropagator2;
    }()
  );
  var __values$5 = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var __read$a = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  function sanitizeAttributes(attributes) {
    var e_1, _a2;
    var out = {};
    if (typeof attributes !== "object" || attributes == null) {
      return out;
    }
    try {
      for (var _b = __values$5(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
        var _d = __read$a(_c.value, 2), key = _d[0], val = _d[1];
        if (!isAttributeKey(key)) {
          diag.warn("Invalid attribute key: " + key);
          continue;
        }
        if (!isAttributeValue(val)) {
          diag.warn("Invalid attribute value set for key: " + key);
          continue;
        }
        if (Array.isArray(val)) {
          out[key] = val.slice();
        } else {
          out[key] = val;
        }
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
    return out;
  }
  function isAttributeKey(key) {
    return typeof key === "string" && key.length > 0;
  }
  function isAttributeValue(val) {
    if (val == null) {
      return true;
    }
    if (Array.isArray(val)) {
      return isHomogeneousAttributeValueArray(val);
    }
    return isValidPrimitiveAttributeValue(val);
  }
  function isHomogeneousAttributeValueArray(arr) {
    var e_2, _a2;
    var type;
    try {
      for (var arr_1 = __values$5(arr), arr_1_1 = arr_1.next(); !arr_1_1.done; arr_1_1 = arr_1.next()) {
        var element = arr_1_1.value;
        if (element == null)
          continue;
        if (!type) {
          if (isValidPrimitiveAttributeValue(element)) {
            type = typeof element;
            continue;
          }
          return false;
        }
        if (typeof element === type) {
          continue;
        }
        return false;
      }
    } catch (e_2_1) {
      e_2 = { error: e_2_1 };
    } finally {
      try {
        if (arr_1_1 && !arr_1_1.done && (_a2 = arr_1.return)) _a2.call(arr_1);
      } finally {
        if (e_2) throw e_2.error;
      }
    }
    return true;
  }
  function isValidPrimitiveAttributeValue(val) {
    switch (typeof val) {
      case "number":
      case "boolean":
      case "string":
        return true;
    }
    return false;
  }
  function loggingErrorHandler() {
    return function(ex) {
      diag.error(stringifyException(ex));
    };
  }
  function stringifyException(ex) {
    if (typeof ex === "string") {
      return ex;
    } else {
      return JSON.stringify(flattenException(ex));
    }
  }
  function flattenException(ex) {
    var result = {};
    var current = ex;
    while (current !== null) {
      Object.getOwnPropertyNames(current).forEach(function(propertyName) {
        if (result[propertyName])
          return;
        var value = current[propertyName];
        if (value) {
          result[propertyName] = String(value);
        }
      });
      current = Object.getPrototypeOf(current);
    }
    return result;
  }
  var delegateHandler = loggingErrorHandler();
  function globalErrorHandler(ex) {
    try {
      delegateHandler(ex);
    } catch (_a2) {
    }
  }
  var TracesSamplerValues$1;
  (function(TracesSamplerValues2) {
    TracesSamplerValues2["AlwaysOff"] = "always_off";
    TracesSamplerValues2["AlwaysOn"] = "always_on";
    TracesSamplerValues2["ParentBasedAlwaysOff"] = "parentbased_always_off";
    TracesSamplerValues2["ParentBasedAlwaysOn"] = "parentbased_always_on";
    TracesSamplerValues2["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
    TracesSamplerValues2["TraceIdRatio"] = "traceidratio";
  })(TracesSamplerValues$1 || (TracesSamplerValues$1 = {}));
  var DEFAULT_LIST_SEPARATOR$1 = ",";
  var ENVIRONMENT_BOOLEAN_KEYS$1 = ["OTEL_SDK_DISABLED"];
  function isEnvVarABoolean$1(key) {
    return ENVIRONMENT_BOOLEAN_KEYS$1.indexOf(key) > -1;
  }
  var ENVIRONMENT_NUMBERS_KEYS$1 = [
    "OTEL_BSP_EXPORT_TIMEOUT",
    "OTEL_BSP_MAX_EXPORT_BATCH_SIZE",
    "OTEL_BSP_MAX_QUEUE_SIZE",
    "OTEL_BSP_SCHEDULE_DELAY",
    "OTEL_BLRP_EXPORT_TIMEOUT",
    "OTEL_BLRP_MAX_EXPORT_BATCH_SIZE",
    "OTEL_BLRP_MAX_QUEUE_SIZE",
    "OTEL_BLRP_SCHEDULE_DELAY",
    "OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT",
    "OTEL_ATTRIBUTE_COUNT_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT",
    "OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT",
    "OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT",
    "OTEL_SPAN_EVENT_COUNT_LIMIT",
    "OTEL_SPAN_LINK_COUNT_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT",
    "OTEL_EXPORTER_OTLP_TIMEOUT",
    "OTEL_EXPORTER_OTLP_TRACES_TIMEOUT",
    "OTEL_EXPORTER_OTLP_METRICS_TIMEOUT",
    "OTEL_EXPORTER_OTLP_LOGS_TIMEOUT",
    "OTEL_EXPORTER_JAEGER_AGENT_PORT"
  ];
  function isEnvVarANumber$1(key) {
    return ENVIRONMENT_NUMBERS_KEYS$1.indexOf(key) > -1;
  }
  var ENVIRONMENT_LISTS_KEYS$1 = [
    "OTEL_NO_PATCH_MODULES",
    "OTEL_PROPAGATORS",
    "OTEL_SEMCONV_STABILITY_OPT_IN"
  ];
  function isEnvVarAList$1(key) {
    return ENVIRONMENT_LISTS_KEYS$1.indexOf(key) > -1;
  }
  var DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT$1 = Infinity;
  var DEFAULT_ATTRIBUTE_COUNT_LIMIT$1 = 128;
  var DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT$1 = 128;
  var DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT$1 = 128;
  var DEFAULT_ENVIRONMENT$1 = {
    OTEL_SDK_DISABLED: false,
    CONTAINER_NAME: "",
    ECS_CONTAINER_METADATA_URI_V4: "",
    ECS_CONTAINER_METADATA_URI: "",
    HOSTNAME: "",
    KUBERNETES_SERVICE_HOST: "",
    NAMESPACE: "",
    OTEL_BSP_EXPORT_TIMEOUT: 3e4,
    OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
    OTEL_BSP_MAX_QUEUE_SIZE: 2048,
    OTEL_BSP_SCHEDULE_DELAY: 5e3,
    OTEL_BLRP_EXPORT_TIMEOUT: 3e4,
    OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
    OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
    OTEL_BLRP_SCHEDULE_DELAY: 5e3,
    OTEL_EXPORTER_JAEGER_AGENT_HOST: "",
    OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
    OTEL_EXPORTER_JAEGER_ENDPOINT: "",
    OTEL_EXPORTER_JAEGER_PASSWORD: "",
    OTEL_EXPORTER_JAEGER_USER: "",
    OTEL_EXPORTER_OTLP_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_HEADERS: "",
    OTEL_EXPORTER_OTLP_TRACES_HEADERS: "",
    OTEL_EXPORTER_OTLP_METRICS_HEADERS: "",
    OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
    OTEL_EXPORTER_OTLP_TIMEOUT: 1e4,
    OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4,
    OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4,
    OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4,
    OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans",
    OTEL_LOG_LEVEL: DiagLogLevel.INFO,
    OTEL_NO_PATCH_MODULES: [],
    OTEL_PROPAGATORS: ["tracecontext", "baggage"],
    OTEL_RESOURCE_ATTRIBUTES: "",
    OTEL_SERVICE_NAME: "",
    OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT$1,
    OTEL_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT$1,
    OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT$1,
    OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT$1,
    OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT$1,
    OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT$1,
    OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
    OTEL_SPAN_LINK_COUNT_LIMIT: 128,
    OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT$1,
    OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT$1,
    OTEL_TRACES_EXPORTER: "",
    OTEL_TRACES_SAMPLER: TracesSamplerValues$1.ParentBasedAlwaysOn,
    OTEL_TRACES_SAMPLER_ARG: "",
    OTEL_LOGS_EXPORTER: "",
    OTEL_EXPORTER_OTLP_INSECURE: "",
    OTEL_EXPORTER_OTLP_TRACES_INSECURE: "",
    OTEL_EXPORTER_OTLP_METRICS_INSECURE: "",
    OTEL_EXPORTER_OTLP_LOGS_INSECURE: "",
    OTEL_EXPORTER_OTLP_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative",
    OTEL_SEMCONV_STABILITY_OPT_IN: []
  };
  function parseBoolean$1(key, environment, values) {
    if (typeof values[key] === "undefined") {
      return;
    }
    var value = String(values[key]);
    environment[key] = value.toLowerCase() === "true";
  }
  function parseNumber$1(name, environment, values, min, max) {
    if (min === void 0) {
      min = -Infinity;
    }
    if (max === void 0) {
      max = Infinity;
    }
    if (typeof values[name] !== "undefined") {
      var value = Number(values[name]);
      if (!isNaN(value)) {
        if (value < min) {
          environment[name] = min;
        } else if (value > max) {
          environment[name] = max;
        } else {
          environment[name] = value;
        }
      }
    }
  }
  function parseStringList$1(name, output, input, separator) {
    if (separator === void 0) {
      separator = DEFAULT_LIST_SEPARATOR$1;
    }
    var givenValue = input[name];
    if (typeof givenValue === "string") {
      output[name] = givenValue.split(separator).map(function(v) {
        return v.trim();
      });
    }
  }
  var logLevelMap$1 = {
    ALL: DiagLogLevel.ALL,
    VERBOSE: DiagLogLevel.VERBOSE,
    DEBUG: DiagLogLevel.DEBUG,
    INFO: DiagLogLevel.INFO,
    WARN: DiagLogLevel.WARN,
    ERROR: DiagLogLevel.ERROR,
    NONE: DiagLogLevel.NONE
  };
  function setLogLevelFromEnv$1(key, environment, values) {
    var value = values[key];
    if (typeof value === "string") {
      var theLevel = logLevelMap$1[value.toUpperCase()];
      if (theLevel != null) {
        environment[key] = theLevel;
      }
    }
  }
  function parseEnvironment$1(values) {
    var environment = {};
    for (var env in DEFAULT_ENVIRONMENT$1) {
      var key = env;
      switch (key) {
        case "OTEL_LOG_LEVEL":
          setLogLevelFromEnv$1(key, environment, values);
          break;
        default:
          if (isEnvVarABoolean$1(key)) {
            parseBoolean$1(key, environment, values);
          } else if (isEnvVarANumber$1(key)) {
            parseNumber$1(key, environment, values);
          } else if (isEnvVarAList$1(key)) {
            parseStringList$1(key, environment, values);
          } else {
            var value = values[key];
            if (typeof value !== "undefined" && value !== null) {
              environment[key] = String(value);
            }
          }
      }
    }
    return environment;
  }
  var _globalThis$2 = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  function getEnv$1() {
    var globalEnv = parseEnvironment$1(_globalThis$2);
    return Object.assign({}, DEFAULT_ENVIRONMENT$1, globalEnv);
  }
  function getEnvWithoutDefaults() {
    return parseEnvironment$1(_globalThis$2);
  }
  var otperformance$1 = performance;
  var TMP_EXCEPTION_TYPE = "exception.type";
  var TMP_EXCEPTION_MESSAGE = "exception.message";
  var TMP_EXCEPTION_STACKTRACE = "exception.stacktrace";
  var TMP_HTTP_RESPONSE_CONTENT_LENGTH$2 = "http.response_content_length";
  var TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$2 = "http.response_content_length_uncompressed";
  var SEMATTRS_EXCEPTION_TYPE = TMP_EXCEPTION_TYPE;
  var SEMATTRS_EXCEPTION_MESSAGE = TMP_EXCEPTION_MESSAGE;
  var SEMATTRS_EXCEPTION_STACKTRACE = TMP_EXCEPTION_STACKTRACE;
  var SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH$2 = TMP_HTTP_RESPONSE_CONTENT_LENGTH$2;
  var SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$2 = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$2;
  function unrefTimer(_timer) {
  }
  var NANOSECOND_DIGITS$1 = 9;
  var NANOSECOND_DIGITS_IN_MILLIS$1 = 6;
  var MILLISECONDS_TO_NANOSECONDS$1 = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS$1);
  var SECOND_TO_NANOSECONDS$1 = Math.pow(10, NANOSECOND_DIGITS$1);
  function millisToHrTime$1(epochMillis) {
    var epochSeconds = epochMillis / 1e3;
    var seconds = Math.trunc(epochSeconds);
    var nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS$1);
    return [seconds, nanos];
  }
  function getTimeOrigin$1() {
    var timeOrigin = otperformance$1.timeOrigin;
    if (typeof timeOrigin !== "number") {
      var perf = otperformance$1;
      timeOrigin = perf.timing && perf.timing.fetchStart;
    }
    return timeOrigin;
  }
  function hrTime$1(performanceNow) {
    var timeOrigin = millisToHrTime$1(getTimeOrigin$1());
    var now = millisToHrTime$1(typeof performanceNow === "number" ? performanceNow : otperformance$1.now());
    return addHrTimes$1(timeOrigin, now);
  }
  function hrTimeDuration(startTime, endTime) {
    var seconds = endTime[0] - startTime[0];
    var nanos = endTime[1] - startTime[1];
    if (nanos < 0) {
      seconds -= 1;
      nanos += SECOND_TO_NANOSECONDS$1;
    }
    return [seconds, nanos];
  }
  function isTimeInputHrTime$1(value) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
  }
  function isTimeInput(value) {
    return isTimeInputHrTime$1(value) || typeof value === "number" || value instanceof Date;
  }
  function addHrTimes$1(time1, time2) {
    var out = [time1[0] + time2[0], time1[1] + time2[1]];
    if (out[1] >= SECOND_TO_NANOSECONDS$1) {
      out[1] -= SECOND_TO_NANOSECONDS$1;
      out[0] += 1;
    }
    return out;
  }
  var ExportResultCode$1;
  (function(ExportResultCode2) {
    ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
    ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
  })(ExportResultCode$1 || (ExportResultCode$1 = {}));
  var __values$4 = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var CompositePropagator = (
    /** @class */
    function() {
      function CompositePropagator2(config) {
        if (config === void 0) {
          config = {};
        }
        var _a2;
        this._propagators = (_a2 = config.propagators) !== null && _a2 !== void 0 ? _a2 : [];
        this._fields = Array.from(new Set(this._propagators.map(function(p) {
          return typeof p.fields === "function" ? p.fields() : [];
        }).reduce(function(x, y) {
          return x.concat(y);
        }, [])));
      }
      CompositePropagator2.prototype.inject = function(context2, carrier, setter) {
        var e_1, _a2;
        try {
          for (var _b = __values$4(this._propagators), _c = _b.next(); !_c.done; _c = _b.next()) {
            var propagator = _c.value;
            try {
              propagator.inject(context2, carrier, setter);
            } catch (err) {
              diag.warn("Failed to inject with " + propagator.constructor.name + ". Err: " + err.message);
            }
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
      };
      CompositePropagator2.prototype.extract = function(context2, carrier, getter) {
        return this._propagators.reduce(function(ctx, propagator) {
          try {
            return propagator.extract(ctx, carrier, getter);
          } catch (err) {
            diag.warn("Failed to extract with " + propagator.constructor.name + ". Err: " + err.message);
          }
          return ctx;
        }, context2);
      };
      CompositePropagator2.prototype.fields = function() {
        return this._fields.slice();
      };
      return CompositePropagator2;
    }()
  );
  var VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
  var VALID_KEY = "[a-z]" + VALID_KEY_CHAR_RANGE + "{0,255}";
  var VALID_VENDOR_KEY = "[a-z0-9]" + VALID_KEY_CHAR_RANGE + "{0,240}@[a-z]" + VALID_KEY_CHAR_RANGE + "{0,13}";
  var VALID_KEY_REGEX = new RegExp("^(?:" + VALID_KEY + "|" + VALID_VENDOR_KEY + ")$");
  var VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
  var INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
  function validateKey(key) {
    return VALID_KEY_REGEX.test(key);
  }
  function validateValue(value) {
    return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
  }
  var MAX_TRACE_STATE_ITEMS = 32;
  var MAX_TRACE_STATE_LEN = 512;
  var LIST_MEMBERS_SEPARATOR = ",";
  var LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
  var TraceState = (
    /** @class */
    function() {
      function TraceState2(rawTraceState) {
        this._internalState = /* @__PURE__ */ new Map();
        if (rawTraceState)
          this._parse(rawTraceState);
      }
      TraceState2.prototype.set = function(key, value) {
        var traceState = this._clone();
        if (traceState._internalState.has(key)) {
          traceState._internalState.delete(key);
        }
        traceState._internalState.set(key, value);
        return traceState;
      };
      TraceState2.prototype.unset = function(key) {
        var traceState = this._clone();
        traceState._internalState.delete(key);
        return traceState;
      };
      TraceState2.prototype.get = function(key) {
        return this._internalState.get(key);
      };
      TraceState2.prototype.serialize = function() {
        var _this = this;
        return this._keys().reduce(function(agg, key) {
          agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + _this.get(key));
          return agg;
        }, []).join(LIST_MEMBERS_SEPARATOR);
      };
      TraceState2.prototype._parse = function(rawTraceState) {
        if (rawTraceState.length > MAX_TRACE_STATE_LEN)
          return;
        this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce(function(agg, part) {
          var listMember = part.trim();
          var i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
          if (i !== -1) {
            var key = listMember.slice(0, i);
            var value = listMember.slice(i + 1, part.length);
            if (validateKey(key) && validateValue(value)) {
              agg.set(key, value);
            }
          }
          return agg;
        }, /* @__PURE__ */ new Map());
        if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
          this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
        }
      };
      TraceState2.prototype._keys = function() {
        return Array.from(this._internalState.keys()).reverse();
      };
      TraceState2.prototype._clone = function() {
        var traceState = new TraceState2();
        traceState._internalState = new Map(this._internalState);
        return traceState;
      };
      return TraceState2;
    }()
  );
  var TRACE_PARENT_HEADER$1 = "traceparent";
  var TRACE_STATE_HEADER = "tracestate";
  var VERSION$2 = "00";
  var VERSION_PART = "(?!ff)[\\da-f]{2}";
  var TRACE_ID_PART = "(?![0]{32})[\\da-f]{32}";
  var PARENT_ID_PART = "(?![0]{16})[\\da-f]{16}";
  var FLAGS_PART = "[\\da-f]{2}";
  var TRACE_PARENT_REGEX = new RegExp("^\\s?(" + VERSION_PART + ")-(" + TRACE_ID_PART + ")-(" + PARENT_ID_PART + ")-(" + FLAGS_PART + ")(-.*)?\\s?$");
  function parseTraceParent(traceParent) {
    var match = TRACE_PARENT_REGEX.exec(traceParent);
    if (!match)
      return null;
    if (match[1] === "00" && match[5])
      return null;
    return {
      traceId: match[2],
      spanId: match[3],
      traceFlags: parseInt(match[4], 16)
    };
  }
  var W3CTraceContextPropagator = (
    /** @class */
    function() {
      function W3CTraceContextPropagator2() {
      }
      W3CTraceContextPropagator2.prototype.inject = function(context2, carrier, setter) {
        var spanContext = trace.getSpanContext(context2);
        if (!spanContext || isTracingSuppressed(context2) || !isSpanContextValid(spanContext))
          return;
        var traceParent = VERSION$2 + "-" + spanContext.traceId + "-" + spanContext.spanId + "-0" + Number(spanContext.traceFlags || TraceFlags.NONE).toString(16);
        setter.set(carrier, TRACE_PARENT_HEADER$1, traceParent);
        if (spanContext.traceState) {
          setter.set(carrier, TRACE_STATE_HEADER, spanContext.traceState.serialize());
        }
      };
      W3CTraceContextPropagator2.prototype.extract = function(context2, carrier, getter) {
        var traceParentHeader = getter.get(carrier, TRACE_PARENT_HEADER$1);
        if (!traceParentHeader)
          return context2;
        var traceParent = Array.isArray(traceParentHeader) ? traceParentHeader[0] : traceParentHeader;
        if (typeof traceParent !== "string")
          return context2;
        var spanContext = parseTraceParent(traceParent);
        if (!spanContext)
          return context2;
        spanContext.isRemote = true;
        var traceStateHeader = getter.get(carrier, TRACE_STATE_HEADER);
        if (traceStateHeader) {
          var state = Array.isArray(traceStateHeader) ? traceStateHeader.join(",") : traceStateHeader;
          spanContext.traceState = new TraceState(typeof state === "string" ? state : void 0);
        }
        return trace.setSpanContext(context2, spanContext);
      };
      W3CTraceContextPropagator2.prototype.fields = function() {
        return [TRACE_PARENT_HEADER$1, TRACE_STATE_HEADER];
      };
      return W3CTraceContextPropagator2;
    }()
  );
  var objectTag = "[object Object]";
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  var objectCtorString = funcToString.call(Object);
  var getPrototype = overArg(Object.getPrototypeOf, Object);
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var symToStringTag = Symbol ? Symbol.toStringTag : void 0;
  var nativeObjectToString = objectProto.toString;
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) !== objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
    return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
  }
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
  }
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
    var unmasked = false;
    try {
      value[symToStringTag] = void 0;
      unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  var MAX_LEVEL = 20;
  function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    var result = args.shift();
    var objects = /* @__PURE__ */ new WeakMap();
    while (args.length > 0) {
      result = mergeTwoObjects(result, args.shift(), 0, objects);
    }
    return result;
  }
  function takeValue(value) {
    if (isArray(value)) {
      return value.slice();
    }
    return value;
  }
  function mergeTwoObjects(one, two, level, objects) {
    if (level === void 0) {
      level = 0;
    }
    var result;
    if (level > MAX_LEVEL) {
      return void 0;
    }
    level++;
    if (isPrimitive(one) || isPrimitive(two) || isFunction$1(two)) {
      result = takeValue(two);
    } else if (isArray(one)) {
      result = one.slice();
      if (isArray(two)) {
        for (var i = 0, j = two.length; i < j; i++) {
          result.push(takeValue(two[i]));
        }
      } else if (isObject(two)) {
        var keys = Object.keys(two);
        for (var i = 0, j = keys.length; i < j; i++) {
          var key = keys[i];
          result[key] = takeValue(two[key]);
        }
      }
    } else if (isObject(one)) {
      if (isObject(two)) {
        if (!shouldMerge(one, two)) {
          return two;
        }
        result = Object.assign({}, one);
        var keys = Object.keys(two);
        for (var i = 0, j = keys.length; i < j; i++) {
          var key = keys[i];
          var twoValue = two[key];
          if (isPrimitive(twoValue)) {
            if (typeof twoValue === "undefined") {
              delete result[key];
            } else {
              result[key] = twoValue;
            }
          } else {
            var obj1 = result[key];
            var obj2 = twoValue;
            if (wasObjectReferenced(one, key, objects) || wasObjectReferenced(two, key, objects)) {
              delete result[key];
            } else {
              if (isObject(obj1) && isObject(obj2)) {
                var arr1 = objects.get(obj1) || [];
                var arr2 = objects.get(obj2) || [];
                arr1.push({ obj: one, key });
                arr2.push({ obj: two, key });
                objects.set(obj1, arr1);
                objects.set(obj2, arr2);
              }
              result[key] = mergeTwoObjects(result[key], twoValue, level, objects);
            }
          }
        }
      } else {
        result = two;
      }
    }
    return result;
  }
  function wasObjectReferenced(obj, key, objects) {
    var arr = objects.get(obj[key]) || [];
    for (var i = 0, j = arr.length; i < j; i++) {
      var info = arr[i];
      if (info.key === key && info.obj === obj) {
        return true;
      }
    }
    return false;
  }
  function isArray(value) {
    return Array.isArray(value);
  }
  function isFunction$1(value) {
    return typeof value === "function";
  }
  function isObject(value) {
    return !isPrimitive(value) && !isArray(value) && !isFunction$1(value) && typeof value === "object";
  }
  function isPrimitive(value) {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean" || typeof value === "undefined" || value instanceof Date || value instanceof RegExp || value === null;
  }
  function shouldMerge(one, two) {
    if (!isPlainObject(one) || !isPlainObject(two)) {
      return false;
    }
    return true;
  }
  var Deferred$1 = (
    /** @class */
    function() {
      function Deferred2() {
        var _this = this;
        this._promise = new Promise(function(resolve, reject) {
          _this._resolve = resolve;
          _this._reject = reject;
        });
      }
      Object.defineProperty(Deferred2.prototype, "promise", {
        get: function() {
          return this._promise;
        },
        enumerable: false,
        configurable: true
      });
      Deferred2.prototype.resolve = function(val) {
        this._resolve(val);
      };
      Deferred2.prototype.reject = function(err) {
        this._reject(err);
      };
      return Deferred2;
    }()
  );
  var __read$9 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray$4 = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var BindOnceFuture$1 = (
    /** @class */
    function() {
      function BindOnceFuture2(_callback, _that) {
        this._callback = _callback;
        this._that = _that;
        this._isCalled = false;
        this._deferred = new Deferred$1();
      }
      Object.defineProperty(BindOnceFuture2.prototype, "isCalled", {
        get: function() {
          return this._isCalled;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(BindOnceFuture2.prototype, "promise", {
        get: function() {
          return this._deferred.promise;
        },
        enumerable: false,
        configurable: true
      });
      BindOnceFuture2.prototype.call = function() {
        var _a2;
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (!this._isCalled) {
          this._isCalled = true;
          try {
            Promise.resolve((_a2 = this._callback).call.apply(_a2, __spreadArray$4([this._that], __read$9(args), false))).then(function(val) {
              return _this._deferred.resolve(val);
            }, function(err) {
              return _this._deferred.reject(err);
            });
          } catch (err) {
            this._deferred.reject(err);
          }
        }
        return this._deferred.promise;
      };
      return BindOnceFuture2;
    }()
  );
  function _export(exporter, arg) {
    return new Promise(function(resolve) {
      context.with(suppressTracing(context.active()), function() {
        exporter.export(arg, function(result) {
          resolve(result);
        });
      });
    });
  }
  var internal = {
    _export
  };
  var ExceptionEventName = "exception";
  var __assign$1 = function() {
    __assign$1 = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign$1.apply(this, arguments);
  };
  var __values$3 = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var __read$8 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray$3 = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var Span = (
    /** @class */
    function() {
      function Span2(parentTracer, context2, spanName, spanContext, kind, parentSpanId, links, startTime, _deprecatedClock, attributes) {
        if (links === void 0) {
          links = [];
        }
        this.attributes = {};
        this.links = [];
        this.events = [];
        this._droppedAttributesCount = 0;
        this._droppedEventsCount = 0;
        this._droppedLinksCount = 0;
        this.status = {
          code: SpanStatusCode.UNSET
        };
        this.endTime = [0, 0];
        this._ended = false;
        this._duration = [-1, -1];
        this.name = spanName;
        this._spanContext = spanContext;
        this.parentSpanId = parentSpanId;
        this.kind = kind;
        this.links = links;
        var now = Date.now();
        this._performanceStartTime = otperformance$1.now();
        this._performanceOffset = now - (this._performanceStartTime + getTimeOrigin$1());
        this._startTimeProvided = startTime != null;
        this.startTime = this._getTime(startTime !== null && startTime !== void 0 ? startTime : now);
        this.resource = parentTracer.resource;
        this.instrumentationLibrary = parentTracer.instrumentationLibrary;
        this._spanLimits = parentTracer.getSpanLimits();
        this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit || 0;
        if (attributes != null) {
          this.setAttributes(attributes);
        }
        this._spanProcessor = parentTracer.getActiveSpanProcessor();
        this._spanProcessor.onStart(this, context2);
      }
      Span2.prototype.spanContext = function() {
        return this._spanContext;
      };
      Span2.prototype.setAttribute = function(key, value) {
        if (value == null || this._isSpanEnded())
          return this;
        if (key.length === 0) {
          diag.warn("Invalid attribute key: " + key);
          return this;
        }
        if (!isAttributeValue(value)) {
          diag.warn("Invalid attribute value set for key: " + key);
          return this;
        }
        if (Object.keys(this.attributes).length >= this._spanLimits.attributeCountLimit && !Object.prototype.hasOwnProperty.call(this.attributes, key)) {
          this._droppedAttributesCount++;
          return this;
        }
        this.attributes[key] = this._truncateToSize(value);
        return this;
      };
      Span2.prototype.setAttributes = function(attributes) {
        var e_1, _a2;
        try {
          for (var _b = __values$3(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read$8(_c.value, 2), k = _d[0], v = _d[1];
            this.setAttribute(k, v);
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
        return this;
      };
      Span2.prototype.addEvent = function(name, attributesOrStartTime, timeStamp) {
        if (this._isSpanEnded())
          return this;
        if (this._spanLimits.eventCountLimit === 0) {
          diag.warn("No events allowed.");
          this._droppedEventsCount++;
          return this;
        }
        if (this.events.length >= this._spanLimits.eventCountLimit) {
          if (this._droppedEventsCount === 0) {
            diag.debug("Dropping extra events.");
          }
          this.events.shift();
          this._droppedEventsCount++;
        }
        if (isTimeInput(attributesOrStartTime)) {
          if (!isTimeInput(timeStamp)) {
            timeStamp = attributesOrStartTime;
          }
          attributesOrStartTime = void 0;
        }
        var attributes = sanitizeAttributes(attributesOrStartTime);
        this.events.push({
          name,
          attributes,
          time: this._getTime(timeStamp),
          droppedAttributesCount: 0
        });
        return this;
      };
      Span2.prototype.addLink = function(link) {
        this.links.push(link);
        return this;
      };
      Span2.prototype.addLinks = function(links) {
        var _a2;
        (_a2 = this.links).push.apply(_a2, __spreadArray$3([], __read$8(links), false));
        return this;
      };
      Span2.prototype.setStatus = function(status) {
        if (this._isSpanEnded())
          return this;
        this.status = __assign$1({}, status);
        if (this.status.message != null && typeof status.message !== "string") {
          diag.warn("Dropping invalid status.message of type '" + typeof status.message + "', expected 'string'");
          delete this.status.message;
        }
        return this;
      };
      Span2.prototype.updateName = function(name) {
        if (this._isSpanEnded())
          return this;
        this.name = name;
        return this;
      };
      Span2.prototype.end = function(endTime) {
        if (this._isSpanEnded()) {
          diag.error(this.name + " " + this._spanContext.traceId + "-" + this._spanContext.spanId + " - You can only call end() on a span once.");
          return;
        }
        this._ended = true;
        this.endTime = this._getTime(endTime);
        this._duration = hrTimeDuration(this.startTime, this.endTime);
        if (this._duration[0] < 0) {
          diag.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime);
          this.endTime = this.startTime.slice();
          this._duration = [0, 0];
        }
        if (this._droppedEventsCount > 0) {
          diag.warn("Dropped " + this._droppedEventsCount + " events because eventCountLimit reached");
        }
        this._spanProcessor.onEnd(this);
      };
      Span2.prototype._getTime = function(inp) {
        if (typeof inp === "number" && inp <= otperformance$1.now()) {
          return hrTime$1(inp + this._performanceOffset);
        }
        if (typeof inp === "number") {
          return millisToHrTime$1(inp);
        }
        if (inp instanceof Date) {
          return millisToHrTime$1(inp.getTime());
        }
        if (isTimeInputHrTime$1(inp)) {
          return inp;
        }
        if (this._startTimeProvided) {
          return millisToHrTime$1(Date.now());
        }
        var msDuration = otperformance$1.now() - this._performanceStartTime;
        return addHrTimes$1(this.startTime, millisToHrTime$1(msDuration));
      };
      Span2.prototype.isRecording = function() {
        return this._ended === false;
      };
      Span2.prototype.recordException = function(exception, time) {
        var attributes = {};
        if (typeof exception === "string") {
          attributes[SEMATTRS_EXCEPTION_MESSAGE] = exception;
        } else if (exception) {
          if (exception.code) {
            attributes[SEMATTRS_EXCEPTION_TYPE] = exception.code.toString();
          } else if (exception.name) {
            attributes[SEMATTRS_EXCEPTION_TYPE] = exception.name;
          }
          if (exception.message) {
            attributes[SEMATTRS_EXCEPTION_MESSAGE] = exception.message;
          }
          if (exception.stack) {
            attributes[SEMATTRS_EXCEPTION_STACKTRACE] = exception.stack;
          }
        }
        if (attributes[SEMATTRS_EXCEPTION_TYPE] || attributes[SEMATTRS_EXCEPTION_MESSAGE]) {
          this.addEvent(ExceptionEventName, attributes, time);
        } else {
          diag.warn("Failed to record an exception " + exception);
        }
      };
      Object.defineProperty(Span2.prototype, "duration", {
        get: function() {
          return this._duration;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Span2.prototype, "ended", {
        get: function() {
          return this._ended;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Span2.prototype, "droppedAttributesCount", {
        get: function() {
          return this._droppedAttributesCount;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Span2.prototype, "droppedEventsCount", {
        get: function() {
          return this._droppedEventsCount;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Span2.prototype, "droppedLinksCount", {
        get: function() {
          return this._droppedLinksCount;
        },
        enumerable: false,
        configurable: true
      });
      Span2.prototype._isSpanEnded = function() {
        if (this._ended) {
          diag.warn("Can not execute the operation on ended Span {traceId: " + this._spanContext.traceId + ", spanId: " + this._spanContext.spanId + "}");
        }
        return this._ended;
      };
      Span2.prototype._truncateToLimitUtil = function(value, limit) {
        if (value.length <= limit) {
          return value;
        }
        return value.substring(0, limit);
      };
      Span2.prototype._truncateToSize = function(value) {
        var _this = this;
        var limit = this._attributeValueLengthLimit;
        if (limit <= 0) {
          diag.warn("Attribute value limit must be positive, got " + limit);
          return value;
        }
        if (typeof value === "string") {
          return this._truncateToLimitUtil(value, limit);
        }
        if (Array.isArray(value)) {
          return value.map(function(val) {
            return typeof val === "string" ? _this._truncateToLimitUtil(val, limit) : val;
          });
        }
        return value;
      };
      return Span2;
    }()
  );
  var SamplingDecision;
  (function(SamplingDecision2) {
    SamplingDecision2[SamplingDecision2["NOT_RECORD"] = 0] = "NOT_RECORD";
    SamplingDecision2[SamplingDecision2["RECORD"] = 1] = "RECORD";
    SamplingDecision2[SamplingDecision2["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
  })(SamplingDecision || (SamplingDecision = {}));
  var AlwaysOffSampler = (
    /** @class */
    function() {
      function AlwaysOffSampler2() {
      }
      AlwaysOffSampler2.prototype.shouldSample = function() {
        return {
          decision: SamplingDecision.NOT_RECORD
        };
      };
      AlwaysOffSampler2.prototype.toString = function() {
        return "AlwaysOffSampler";
      };
      return AlwaysOffSampler2;
    }()
  );
  var AlwaysOnSampler = (
    /** @class */
    function() {
      function AlwaysOnSampler2() {
      }
      AlwaysOnSampler2.prototype.shouldSample = function() {
        return {
          decision: SamplingDecision.RECORD_AND_SAMPLED
        };
      };
      AlwaysOnSampler2.prototype.toString = function() {
        return "AlwaysOnSampler";
      };
      return AlwaysOnSampler2;
    }()
  );
  var ParentBasedSampler = (
    /** @class */
    function() {
      function ParentBasedSampler2(config) {
        var _a2, _b, _c, _d;
        this._root = config.root;
        if (!this._root) {
          globalErrorHandler(new Error("ParentBasedSampler must have a root sampler configured"));
          this._root = new AlwaysOnSampler();
        }
        this._remoteParentSampled = (_a2 = config.remoteParentSampled) !== null && _a2 !== void 0 ? _a2 : new AlwaysOnSampler();
        this._remoteParentNotSampled = (_b = config.remoteParentNotSampled) !== null && _b !== void 0 ? _b : new AlwaysOffSampler();
        this._localParentSampled = (_c = config.localParentSampled) !== null && _c !== void 0 ? _c : new AlwaysOnSampler();
        this._localParentNotSampled = (_d = config.localParentNotSampled) !== null && _d !== void 0 ? _d : new AlwaysOffSampler();
      }
      ParentBasedSampler2.prototype.shouldSample = function(context2, traceId, spanName, spanKind, attributes, links) {
        var parentContext = trace.getSpanContext(context2);
        if (!parentContext || !isSpanContextValid(parentContext)) {
          return this._root.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
        }
        if (parentContext.isRemote) {
          if (parentContext.traceFlags & TraceFlags.SAMPLED) {
            return this._remoteParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
          }
          return this._remoteParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
        }
        if (parentContext.traceFlags & TraceFlags.SAMPLED) {
          return this._localParentSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
        }
        return this._localParentNotSampled.shouldSample(context2, traceId, spanName, spanKind, attributes, links);
      };
      ParentBasedSampler2.prototype.toString = function() {
        return "ParentBased{root=" + this._root.toString() + ", remoteParentSampled=" + this._remoteParentSampled.toString() + ", remoteParentNotSampled=" + this._remoteParentNotSampled.toString() + ", localParentSampled=" + this._localParentSampled.toString() + ", localParentNotSampled=" + this._localParentNotSampled.toString() + "}";
      };
      return ParentBasedSampler2;
    }()
  );
  var TraceIdRatioBasedSampler = (
    /** @class */
    function() {
      function TraceIdRatioBasedSampler2(_ratio) {
        if (_ratio === void 0) {
          _ratio = 0;
        }
        this._ratio = _ratio;
        this._ratio = this._normalize(_ratio);
        this._upperBound = Math.floor(this._ratio * 4294967295);
      }
      TraceIdRatioBasedSampler2.prototype.shouldSample = function(context2, traceId) {
        return {
          decision: isValidTraceId(traceId) && this._accumulate(traceId) < this._upperBound ? SamplingDecision.RECORD_AND_SAMPLED : SamplingDecision.NOT_RECORD
        };
      };
      TraceIdRatioBasedSampler2.prototype.toString = function() {
        return "TraceIdRatioBased{" + this._ratio + "}";
      };
      TraceIdRatioBasedSampler2.prototype._normalize = function(ratio) {
        if (typeof ratio !== "number" || isNaN(ratio))
          return 0;
        return ratio >= 1 ? 1 : ratio <= 0 ? 0 : ratio;
      };
      TraceIdRatioBasedSampler2.prototype._accumulate = function(traceId) {
        var accumulation = 0;
        for (var i = 0; i < traceId.length / 8; i++) {
          var pos = i * 8;
          var part = parseInt(traceId.slice(pos, pos + 8), 16);
          accumulation = (accumulation ^ part) >>> 0;
        }
        return accumulation;
      };
      return TraceIdRatioBasedSampler2;
    }()
  );
  var FALLBACK_OTEL_TRACES_SAMPLER = TracesSamplerValues$1.AlwaysOn;
  var DEFAULT_RATIO = 1;
  function loadDefaultConfig() {
    var env = getEnv$1();
    return {
      sampler: buildSamplerFromEnv(env),
      forceFlushTimeoutMillis: 3e4,
      generalLimits: {
        attributeValueLengthLimit: env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT,
        attributeCountLimit: env.OTEL_ATTRIBUTE_COUNT_LIMIT
      },
      spanLimits: {
        attributeValueLengthLimit: env.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT,
        attributeCountLimit: env.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT,
        linkCountLimit: env.OTEL_SPAN_LINK_COUNT_LIMIT,
        eventCountLimit: env.OTEL_SPAN_EVENT_COUNT_LIMIT,
        attributePerEventCountLimit: env.OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
        attributePerLinkCountLimit: env.OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT
      },
      mergeResourceWithDefaults: true
    };
  }
  function buildSamplerFromEnv(environment) {
    if (environment === void 0) {
      environment = getEnv$1();
    }
    switch (environment.OTEL_TRACES_SAMPLER) {
      case TracesSamplerValues$1.AlwaysOn:
        return new AlwaysOnSampler();
      case TracesSamplerValues$1.AlwaysOff:
        return new AlwaysOffSampler();
      case TracesSamplerValues$1.ParentBasedAlwaysOn:
        return new ParentBasedSampler({
          root: new AlwaysOnSampler()
        });
      case TracesSamplerValues$1.ParentBasedAlwaysOff:
        return new ParentBasedSampler({
          root: new AlwaysOffSampler()
        });
      case TracesSamplerValues$1.TraceIdRatio:
        return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(environment));
      case TracesSamplerValues$1.ParentBasedTraceIdRatio:
        return new ParentBasedSampler({
          root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv(environment))
        });
      default:
        diag.error('OTEL_TRACES_SAMPLER value "' + environment.OTEL_TRACES_SAMPLER + " invalid, defaulting to " + FALLBACK_OTEL_TRACES_SAMPLER + '".');
        return new AlwaysOnSampler();
    }
  }
  function getSamplerProbabilityFromEnv(environment) {
    if (environment.OTEL_TRACES_SAMPLER_ARG === void 0 || environment.OTEL_TRACES_SAMPLER_ARG === "") {
      diag.error("OTEL_TRACES_SAMPLER_ARG is blank, defaulting to " + DEFAULT_RATIO + ".");
      return DEFAULT_RATIO;
    }
    var probability = Number(environment.OTEL_TRACES_SAMPLER_ARG);
    if (isNaN(probability)) {
      diag.error("OTEL_TRACES_SAMPLER_ARG=" + environment.OTEL_TRACES_SAMPLER_ARG + " was given, but it is invalid, defaulting to " + DEFAULT_RATIO + ".");
      return DEFAULT_RATIO;
    }
    if (probability < 0 || probability > 1) {
      diag.error("OTEL_TRACES_SAMPLER_ARG=" + environment.OTEL_TRACES_SAMPLER_ARG + " was given, but it is out of range ([0..1]), defaulting to " + DEFAULT_RATIO + ".");
      return DEFAULT_RATIO;
    }
    return probability;
  }
  function mergeConfig(userConfig) {
    var perInstanceDefaults = {
      sampler: buildSamplerFromEnv()
    };
    var DEFAULT_CONFIG = loadDefaultConfig();
    var target = Object.assign({}, DEFAULT_CONFIG, perInstanceDefaults, userConfig);
    target.generalLimits = Object.assign({}, DEFAULT_CONFIG.generalLimits, userConfig.generalLimits || {});
    target.spanLimits = Object.assign({}, DEFAULT_CONFIG.spanLimits, userConfig.spanLimits || {});
    return target;
  }
  function reconfigureLimits(userConfig) {
    var _a2, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var spanLimits = Object.assign({}, userConfig.spanLimits);
    var parsedEnvConfig = getEnvWithoutDefaults();
    spanLimits.attributeCountLimit = (_f = (_e = (_d = (_b = (_a2 = userConfig.spanLimits) === null || _a2 === void 0 ? void 0 : _a2.attributeCountLimit) !== null && _b !== void 0 ? _b : (_c = userConfig.generalLimits) === null || _c === void 0 ? void 0 : _c.attributeCountLimit) !== null && _d !== void 0 ? _d : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null && _e !== void 0 ? _e : parsedEnvConfig.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && _f !== void 0 ? _f : DEFAULT_ATTRIBUTE_COUNT_LIMIT$1;
    spanLimits.attributeValueLengthLimit = (_m = (_l = (_k = (_h = (_g = userConfig.spanLimits) === null || _g === void 0 ? void 0 : _g.attributeValueLengthLimit) !== null && _h !== void 0 ? _h : (_j = userConfig.generalLimits) === null || _j === void 0 ? void 0 : _j.attributeValueLengthLimit) !== null && _k !== void 0 ? _k : parsedEnvConfig.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _l !== void 0 ? _l : parsedEnvConfig.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && _m !== void 0 ? _m : DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT$1;
    return Object.assign({}, userConfig, { spanLimits });
  }
  var BatchSpanProcessorBase = (
    /** @class */
    function() {
      function BatchSpanProcessorBase2(_exporter, config) {
        this._exporter = _exporter;
        this._isExporting = false;
        this._finishedSpans = [];
        this._droppedSpansCount = 0;
        var env = getEnv$1();
        this._maxExportBatchSize = typeof (config === null || config === void 0 ? void 0 : config.maxExportBatchSize) === "number" ? config.maxExportBatchSize : env.OTEL_BSP_MAX_EXPORT_BATCH_SIZE;
        this._maxQueueSize = typeof (config === null || config === void 0 ? void 0 : config.maxQueueSize) === "number" ? config.maxQueueSize : env.OTEL_BSP_MAX_QUEUE_SIZE;
        this._scheduledDelayMillis = typeof (config === null || config === void 0 ? void 0 : config.scheduledDelayMillis) === "number" ? config.scheduledDelayMillis : env.OTEL_BSP_SCHEDULE_DELAY;
        this._exportTimeoutMillis = typeof (config === null || config === void 0 ? void 0 : config.exportTimeoutMillis) === "number" ? config.exportTimeoutMillis : env.OTEL_BSP_EXPORT_TIMEOUT;
        this._shutdownOnce = new BindOnceFuture$1(this._shutdown, this);
        if (this._maxExportBatchSize > this._maxQueueSize) {
          diag.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize");
          this._maxExportBatchSize = this._maxQueueSize;
        }
      }
      BatchSpanProcessorBase2.prototype.forceFlush = function() {
        if (this._shutdownOnce.isCalled) {
          return this._shutdownOnce.promise;
        }
        return this._flushAll();
      };
      BatchSpanProcessorBase2.prototype.onStart = function(_span, _parentContext) {
      };
      BatchSpanProcessorBase2.prototype.onEnd = function(span) {
        if (this._shutdownOnce.isCalled) {
          return;
        }
        if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
          return;
        }
        this._addToBuffer(span);
      };
      BatchSpanProcessorBase2.prototype.shutdown = function() {
        return this._shutdownOnce.call();
      };
      BatchSpanProcessorBase2.prototype._shutdown = function() {
        var _this = this;
        return Promise.resolve().then(function() {
          return _this.onShutdown();
        }).then(function() {
          return _this._flushAll();
        }).then(function() {
          return _this._exporter.shutdown();
        });
      };
      BatchSpanProcessorBase2.prototype._addToBuffer = function(span) {
        if (this._finishedSpans.length >= this._maxQueueSize) {
          if (this._droppedSpansCount === 0) {
            diag.debug("maxQueueSize reached, dropping spans");
          }
          this._droppedSpansCount++;
          return;
        }
        if (this._droppedSpansCount > 0) {
          diag.warn("Dropped " + this._droppedSpansCount + " spans because maxQueueSize reached");
          this._droppedSpansCount = 0;
        }
        this._finishedSpans.push(span);
        this._maybeStartTimer();
      };
      BatchSpanProcessorBase2.prototype._flushAll = function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
          var promises = [];
          var count = Math.ceil(_this._finishedSpans.length / _this._maxExportBatchSize);
          for (var i = 0, j = count; i < j; i++) {
            promises.push(_this._flushOneBatch());
          }
          Promise.all(promises).then(function() {
            resolve();
          }).catch(reject);
        });
      };
      BatchSpanProcessorBase2.prototype._flushOneBatch = function() {
        var _this = this;
        this._clearTimer();
        if (this._finishedSpans.length === 0) {
          return Promise.resolve();
        }
        return new Promise(function(resolve, reject) {
          var timer = setTimeout(function() {
            reject(new Error("Timeout"));
          }, _this._exportTimeoutMillis);
          context.with(suppressTracing(context.active()), function() {
            var spans;
            if (_this._finishedSpans.length <= _this._maxExportBatchSize) {
              spans = _this._finishedSpans;
              _this._finishedSpans = [];
            } else {
              spans = _this._finishedSpans.splice(0, _this._maxExportBatchSize);
            }
            var doExport = function() {
              return _this._exporter.export(spans, function(result) {
                var _a2;
                clearTimeout(timer);
                if (result.code === ExportResultCode$1.SUCCESS) {
                  resolve();
                } else {
                  reject((_a2 = result.error) !== null && _a2 !== void 0 ? _a2 : new Error("BatchSpanProcessor: span export failed"));
                }
              });
            };
            var pendingResources = null;
            for (var i = 0, len = spans.length; i < len; i++) {
              var span = spans[i];
              if (span.resource.asyncAttributesPending && span.resource.waitForAsyncAttributes) {
                pendingResources !== null && pendingResources !== void 0 ? pendingResources : pendingResources = [];
                pendingResources.push(span.resource.waitForAsyncAttributes());
              }
            }
            if (pendingResources === null) {
              doExport();
            } else {
              Promise.all(pendingResources).then(doExport, function(err) {
                globalErrorHandler(err);
                reject(err);
              });
            }
          });
        });
      };
      BatchSpanProcessorBase2.prototype._maybeStartTimer = function() {
        var _this = this;
        if (this._isExporting)
          return;
        var flush = function() {
          _this._isExporting = true;
          _this._flushOneBatch().finally(function() {
            _this._isExporting = false;
            if (_this._finishedSpans.length > 0) {
              _this._clearTimer();
              _this._maybeStartTimer();
            }
          }).catch(function(e) {
            _this._isExporting = false;
            globalErrorHandler(e);
          });
        };
        if (this._finishedSpans.length >= this._maxExportBatchSize) {
          return flush();
        }
        if (this._timer !== void 0)
          return;
        this._timer = setTimeout(function() {
          return flush();
        }, this._scheduledDelayMillis);
        unrefTimer(this._timer);
      };
      BatchSpanProcessorBase2.prototype._clearTimer = function() {
        if (this._timer !== void 0) {
          clearTimeout(this._timer);
          this._timer = void 0;
        }
      };
      return BatchSpanProcessorBase2;
    }()
  );
  var __extends$8 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var BatchSpanProcessor = (
    /** @class */
    function(_super) {
      __extends$8(BatchSpanProcessor2, _super);
      function BatchSpanProcessor2(_exporter, config) {
        var _this = _super.call(this, _exporter, config) || this;
        _this.onInit(config);
        return _this;
      }
      BatchSpanProcessor2.prototype.onInit = function(config) {
        var _this = this;
        if ((config === null || config === void 0 ? void 0 : config.disableAutoFlushOnDocumentHide) !== true && typeof document !== "undefined") {
          this._visibilityChangeListener = function() {
            if (document.visibilityState === "hidden") {
              _this.forceFlush().catch(function(error) {
                globalErrorHandler(error);
              });
            }
          };
          this._pageHideListener = function() {
            _this.forceFlush().catch(function(error) {
              globalErrorHandler(error);
            });
          };
          document.addEventListener("visibilitychange", this._visibilityChangeListener);
          document.addEventListener("pagehide", this._pageHideListener);
        }
      };
      BatchSpanProcessor2.prototype.onShutdown = function() {
        if (typeof document !== "undefined") {
          if (this._visibilityChangeListener) {
            document.removeEventListener("visibilitychange", this._visibilityChangeListener);
          }
          if (this._pageHideListener) {
            document.removeEventListener("pagehide", this._pageHideListener);
          }
        }
      };
      return BatchSpanProcessor2;
    }(BatchSpanProcessorBase)
  );
  var SPAN_ID_BYTES = 8;
  var TRACE_ID_BYTES = 16;
  var RandomIdGenerator = (
    /** @class */
    /* @__PURE__ */ function() {
      function RandomIdGenerator2() {
        this.generateTraceId = getIdGenerator(TRACE_ID_BYTES);
        this.generateSpanId = getIdGenerator(SPAN_ID_BYTES);
      }
      return RandomIdGenerator2;
    }()
  );
  var SHARED_CHAR_CODES_ARRAY = Array(32);
  function getIdGenerator(bytes) {
    return function generateId2() {
      for (var i = 0; i < bytes * 2; i++) {
        SHARED_CHAR_CODES_ARRAY[i] = Math.floor(Math.random() * 16) + 48;
        if (SHARED_CHAR_CODES_ARRAY[i] >= 58) {
          SHARED_CHAR_CODES_ARRAY[i] += 39;
        }
      }
      return String.fromCharCode.apply(null, SHARED_CHAR_CODES_ARRAY.slice(0, bytes * 2));
    };
  }
  var Tracer = (
    /** @class */
    function() {
      function Tracer2(instrumentationLibrary, config, _tracerProvider) {
        this._tracerProvider = _tracerProvider;
        var localConfig = mergeConfig(config);
        this._sampler = localConfig.sampler;
        this._generalLimits = localConfig.generalLimits;
        this._spanLimits = localConfig.spanLimits;
        this._idGenerator = config.idGenerator || new RandomIdGenerator();
        this.resource = _tracerProvider.resource;
        this.instrumentationLibrary = instrumentationLibrary;
      }
      Tracer2.prototype.startSpan = function(name, options, context$1) {
        var _a2, _b, _c;
        if (options === void 0) {
          options = {};
        }
        if (context$1 === void 0) {
          context$1 = context.active();
        }
        if (options.root) {
          context$1 = trace.deleteSpan(context$1);
        }
        var parentSpan = trace.getSpan(context$1);
        if (isTracingSuppressed(context$1)) {
          diag.debug("Instrumentation suppressed, returning Noop Span");
          var nonRecordingSpan = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
          return nonRecordingSpan;
        }
        var parentSpanContext = parentSpan === null || parentSpan === void 0 ? void 0 : parentSpan.spanContext();
        var spanId = this._idGenerator.generateSpanId();
        var traceId;
        var traceState;
        var parentSpanId;
        if (!parentSpanContext || !trace.isSpanContextValid(parentSpanContext)) {
          traceId = this._idGenerator.generateTraceId();
        } else {
          traceId = parentSpanContext.traceId;
          traceState = parentSpanContext.traceState;
          parentSpanId = parentSpanContext.spanId;
        }
        var spanKind = (_a2 = options.kind) !== null && _a2 !== void 0 ? _a2 : SpanKind.INTERNAL;
        var links = ((_b = options.links) !== null && _b !== void 0 ? _b : []).map(function(link) {
          return {
            context: link.context,
            attributes: sanitizeAttributes(link.attributes)
          };
        });
        var attributes = sanitizeAttributes(options.attributes);
        var samplingResult = this._sampler.shouldSample(context$1, traceId, name, spanKind, attributes, links);
        traceState = (_c = samplingResult.traceState) !== null && _c !== void 0 ? _c : traceState;
        var traceFlags = samplingResult.decision === SamplingDecision$1.RECORD_AND_SAMPLED ? TraceFlags.SAMPLED : TraceFlags.NONE;
        var spanContext = { traceId, spanId, traceFlags, traceState };
        if (samplingResult.decision === SamplingDecision$1.NOT_RECORD) {
          diag.debug("Recording is off, propagating context in a non-recording span");
          var nonRecordingSpan = trace.wrapSpanContext(spanContext);
          return nonRecordingSpan;
        }
        var initAttributes = sanitizeAttributes(Object.assign(attributes, samplingResult.attributes));
        var span = new Span(this, context$1, name, spanContext, spanKind, parentSpanId, links, options.startTime, void 0, initAttributes);
        return span;
      };
      Tracer2.prototype.startActiveSpan = function(name, arg2, arg3, arg4) {
        var opts;
        var ctx;
        var fn;
        if (arguments.length < 2) {
          return;
        } else if (arguments.length === 2) {
          fn = arg2;
        } else if (arguments.length === 3) {
          opts = arg2;
          fn = arg3;
        } else {
          opts = arg2;
          ctx = arg3;
          fn = arg4;
        }
        var parentContext = ctx !== null && ctx !== void 0 ? ctx : context.active();
        var span = this.startSpan(name, opts, parentContext);
        var contextWithSpanSet = trace.setSpan(parentContext, span);
        return context.with(contextWithSpanSet, fn, void 0, span);
      };
      Tracer2.prototype.getGeneralLimits = function() {
        return this._generalLimits;
      };
      Tracer2.prototype.getSpanLimits = function() {
        return this._spanLimits;
      };
      Tracer2.prototype.getActiveSpanProcessor = function() {
        return this._tracerProvider.getActiveSpanProcessor();
      };
      return Tracer2;
    }()
  );
  var __values$2 = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var MultiSpanProcessor = (
    /** @class */
    function() {
      function MultiSpanProcessor2(_spanProcessors) {
        this._spanProcessors = _spanProcessors;
      }
      MultiSpanProcessor2.prototype.forceFlush = function() {
        var e_1, _a2;
        var promises = [];
        try {
          for (var _b = __values$2(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
            var spanProcessor = _c.value;
            promises.push(spanProcessor.forceFlush());
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
        return new Promise(function(resolve) {
          Promise.all(promises).then(function() {
            resolve();
          }).catch(function(error) {
            globalErrorHandler(error || new Error("MultiSpanProcessor: forceFlush failed"));
            resolve();
          });
        });
      };
      MultiSpanProcessor2.prototype.onStart = function(span, context2) {
        var e_2, _a2;
        try {
          for (var _b = __values$2(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
            var spanProcessor = _c.value;
            spanProcessor.onStart(span, context2);
          }
        } catch (e_2_1) {
          e_2 = { error: e_2_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b.return)) _a2.call(_b);
          } finally {
            if (e_2) throw e_2.error;
          }
        }
      };
      MultiSpanProcessor2.prototype.onEnd = function(span) {
        var e_3, _a2;
        try {
          for (var _b = __values$2(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
            var spanProcessor = _c.value;
            spanProcessor.onEnd(span);
          }
        } catch (e_3_1) {
          e_3 = { error: e_3_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b.return)) _a2.call(_b);
          } finally {
            if (e_3) throw e_3.error;
          }
        }
      };
      MultiSpanProcessor2.prototype.shutdown = function() {
        var e_4, _a2;
        var promises = [];
        try {
          for (var _b = __values$2(this._spanProcessors), _c = _b.next(); !_c.done; _c = _b.next()) {
            var spanProcessor = _c.value;
            promises.push(spanProcessor.shutdown());
          }
        } catch (e_4_1) {
          e_4 = { error: e_4_1 };
        } finally {
          try {
            if (_c && !_c.done && (_a2 = _b.return)) _a2.call(_b);
          } finally {
            if (e_4) throw e_4.error;
          }
        }
        return new Promise(function(resolve, reject) {
          Promise.all(promises).then(function() {
            resolve();
          }, reject);
        });
      };
      return MultiSpanProcessor2;
    }()
  );
  var NoopSpanProcessor = (
    /** @class */
    function() {
      function NoopSpanProcessor2() {
      }
      NoopSpanProcessor2.prototype.onStart = function(_span, _context) {
      };
      NoopSpanProcessor2.prototype.onEnd = function(_span) {
      };
      NoopSpanProcessor2.prototype.shutdown = function() {
        return Promise.resolve();
      };
      NoopSpanProcessor2.prototype.forceFlush = function() {
        return Promise.resolve();
      };
      return NoopSpanProcessor2;
    }()
  );
  var __read$7 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray$2 = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var ForceFlushState;
  (function(ForceFlushState2) {
    ForceFlushState2[ForceFlushState2["resolved"] = 0] = "resolved";
    ForceFlushState2[ForceFlushState2["timeout"] = 1] = "timeout";
    ForceFlushState2[ForceFlushState2["error"] = 2] = "error";
    ForceFlushState2[ForceFlushState2["unresolved"] = 3] = "unresolved";
  })(ForceFlushState || (ForceFlushState = {}));
  var BasicTracerProvider = (
    /** @class */
    function() {
      function BasicTracerProvider2(config) {
        if (config === void 0) {
          config = {};
        }
        var _a2, _b;
        this._registeredSpanProcessors = [];
        this._tracers = /* @__PURE__ */ new Map();
        var mergedConfig = merge({}, loadDefaultConfig(), reconfigureLimits(config));
        this.resource = (_a2 = mergedConfig.resource) !== null && _a2 !== void 0 ? _a2 : Resource.empty();
        if (mergedConfig.mergeResourceWithDefaults) {
          this.resource = Resource.default().merge(this.resource);
        }
        this._config = Object.assign({}, mergedConfig, {
          resource: this.resource
        });
        if ((_b = config.spanProcessors) === null || _b === void 0 ? void 0 : _b.length) {
          this._registeredSpanProcessors = __spreadArray$2([], __read$7(config.spanProcessors), false);
          this.activeSpanProcessor = new MultiSpanProcessor(this._registeredSpanProcessors);
        } else {
          var defaultExporter = this._buildExporterFromEnv();
          if (defaultExporter !== void 0) {
            var batchProcessor = new BatchSpanProcessor(defaultExporter);
            this.activeSpanProcessor = batchProcessor;
          } else {
            this.activeSpanProcessor = new NoopSpanProcessor();
          }
        }
      }
      BasicTracerProvider2.prototype.getTracer = function(name, version, options) {
        var key = name + "@" + (version || "") + ":" + ((options === null || options === void 0 ? void 0 : options.schemaUrl) || "");
        if (!this._tracers.has(key)) {
          this._tracers.set(key, new Tracer({ name, version, schemaUrl: options === null || options === void 0 ? void 0 : options.schemaUrl }, this._config, this));
        }
        return this._tracers.get(key);
      };
      BasicTracerProvider2.prototype.addSpanProcessor = function(spanProcessor) {
        if (this._registeredSpanProcessors.length === 0) {
          this.activeSpanProcessor.shutdown().catch(function(err) {
            return diag.error("Error while trying to shutdown current span processor", err);
          });
        }
        this._registeredSpanProcessors.push(spanProcessor);
        this.activeSpanProcessor = new MultiSpanProcessor(this._registeredSpanProcessors);
      };
      BasicTracerProvider2.prototype.getActiveSpanProcessor = function() {
        return this.activeSpanProcessor;
      };
      BasicTracerProvider2.prototype.register = function(config) {
        if (config === void 0) {
          config = {};
        }
        trace.setGlobalTracerProvider(this);
        if (config.propagator === void 0) {
          config.propagator = this._buildPropagatorFromEnv();
        }
        if (config.contextManager) {
          context.setGlobalContextManager(config.contextManager);
        }
        if (config.propagator) {
          propagation.setGlobalPropagator(config.propagator);
        }
      };
      BasicTracerProvider2.prototype.forceFlush = function() {
        var timeout = this._config.forceFlushTimeoutMillis;
        var promises = this._registeredSpanProcessors.map(function(spanProcessor) {
          return new Promise(function(resolve) {
            var state;
            var timeoutInterval = setTimeout(function() {
              resolve(new Error("Span processor did not completed within timeout period of " + timeout + " ms"));
              state = ForceFlushState.timeout;
            }, timeout);
            spanProcessor.forceFlush().then(function() {
              clearTimeout(timeoutInterval);
              if (state !== ForceFlushState.timeout) {
                state = ForceFlushState.resolved;
                resolve(state);
              }
            }).catch(function(error) {
              clearTimeout(timeoutInterval);
              state = ForceFlushState.error;
              resolve(error);
            });
          });
        });
        return new Promise(function(resolve, reject) {
          Promise.all(promises).then(function(results) {
            var errors = results.filter(function(result) {
              return result !== ForceFlushState.resolved;
            });
            if (errors.length > 0) {
              reject(errors);
            } else {
              resolve();
            }
          }).catch(function(error) {
            return reject([error]);
          });
        });
      };
      BasicTracerProvider2.prototype.shutdown = function() {
        return this.activeSpanProcessor.shutdown();
      };
      BasicTracerProvider2.prototype._getPropagator = function(name) {
        var _a2;
        return (_a2 = this.constructor._registeredPropagators.get(name)) === null || _a2 === void 0 ? void 0 : _a2();
      };
      BasicTracerProvider2.prototype._getSpanExporter = function(name) {
        var _a2;
        return (_a2 = this.constructor._registeredExporters.get(name)) === null || _a2 === void 0 ? void 0 : _a2();
      };
      BasicTracerProvider2.prototype._buildPropagatorFromEnv = function() {
        var _this = this;
        var uniquePropagatorNames = Array.from(new Set(getEnv$1().OTEL_PROPAGATORS));
        var propagators = uniquePropagatorNames.map(function(name) {
          var propagator = _this._getPropagator(name);
          if (!propagator) {
            diag.warn('Propagator "' + name + '" requested through environment variable is unavailable.');
          }
          return propagator;
        });
        var validPropagators = propagators.reduce(function(list, item) {
          if (item) {
            list.push(item);
          }
          return list;
        }, []);
        if (validPropagators.length === 0) {
          return;
        } else if (uniquePropagatorNames.length === 1) {
          return validPropagators[0];
        } else {
          return new CompositePropagator({
            propagators: validPropagators
          });
        }
      };
      BasicTracerProvider2.prototype._buildExporterFromEnv = function() {
        var exporterName = getEnv$1().OTEL_TRACES_EXPORTER;
        if (exporterName === "none" || exporterName === "")
          return;
        var exporter = this._getSpanExporter(exporterName);
        if (!exporter) {
          diag.error('Exporter "' + exporterName + '" requested through environment variable is unavailable.');
        }
        return exporter;
      };
      BasicTracerProvider2._registeredPropagators = /* @__PURE__ */ new Map([
        ["tracecontext", function() {
          return new W3CTraceContextPropagator();
        }],
        ["baggage", function() {
          return new W3CBaggagePropagator();
        }]
      ]);
      BasicTracerProvider2._registeredExporters = /* @__PURE__ */ new Map();
      return BasicTracerProvider2;
    }()
  );
  var __awaiter$1 = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator$1 = function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
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
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
  var SimpleSpanProcessor = (
    /** @class */
    function() {
      function SimpleSpanProcessor2(_exporter) {
        this._exporter = _exporter;
        this._shutdownOnce = new BindOnceFuture$1(this._shutdown, this);
        this._unresolvedExports = /* @__PURE__ */ new Set();
      }
      SimpleSpanProcessor2.prototype.forceFlush = function() {
        return __awaiter$1(this, void 0, void 0, function() {
          return __generator$1(this, function(_a2) {
            switch (_a2.label) {
              case 0:
                return [4, Promise.all(Array.from(this._unresolvedExports))];
              case 1:
                _a2.sent();
                if (!this._exporter.forceFlush) return [3, 3];
                return [4, this._exporter.forceFlush()];
              case 2:
                _a2.sent();
                _a2.label = 3;
              case 3:
                return [
                  2
                  /*return*/
                ];
            }
          });
        });
      };
      SimpleSpanProcessor2.prototype.onStart = function(_span, _parentContext) {
      };
      SimpleSpanProcessor2.prototype.onEnd = function(span) {
        var _this = this;
        var _a2, _b;
        if (this._shutdownOnce.isCalled) {
          return;
        }
        if ((span.spanContext().traceFlags & TraceFlags.SAMPLED) === 0) {
          return;
        }
        var doExport = function() {
          return internal._export(_this._exporter, [span]).then(function(result) {
            var _a3;
            if (result.code !== ExportResultCode$1.SUCCESS) {
              globalErrorHandler((_a3 = result.error) !== null && _a3 !== void 0 ? _a3 : new Error("SimpleSpanProcessor: span export failed (status " + result + ")"));
            }
          }).catch(function(error) {
            globalErrorHandler(error);
          });
        };
        if (span.resource.asyncAttributesPending) {
          var exportPromise_1 = (_b = (_a2 = span.resource).waitForAsyncAttributes) === null || _b === void 0 ? void 0 : _b.call(_a2).then(function() {
            if (exportPromise_1 != null) {
              _this._unresolvedExports.delete(exportPromise_1);
            }
            return doExport();
          }, function(err) {
            return globalErrorHandler(err);
          });
          if (exportPromise_1 != null) {
            this._unresolvedExports.add(exportPromise_1);
          }
        } else {
          void doExport();
        }
      };
      SimpleSpanProcessor2.prototype.shutdown = function() {
        return this._shutdownOnce.call();
      };
      SimpleSpanProcessor2.prototype._shutdown = function() {
        return this._exporter.shutdown();
      };
      return SimpleSpanProcessor2;
    }()
  );
  var __read$6 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray$1 = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var StackContextManager = (
    /** @class */
    function() {
      function StackContextManager2() {
        this._enabled = false;
        this._currentContext = ROOT_CONTEXT;
      }
      StackContextManager2.prototype._bindFunction = function(context2, target) {
        if (context2 === void 0) {
          context2 = ROOT_CONTEXT;
        }
        var manager = this;
        var contextWrapper = function() {
          var _this = this;
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return manager.with(context2, function() {
            return target.apply(_this, args);
          });
        };
        Object.defineProperty(contextWrapper, "length", {
          enumerable: false,
          configurable: true,
          writable: false,
          value: target.length
        });
        return contextWrapper;
      };
      StackContextManager2.prototype.active = function() {
        return this._currentContext;
      };
      StackContextManager2.prototype.bind = function(context2, target) {
        if (context2 === void 0) {
          context2 = this.active();
        }
        if (typeof target === "function") {
          return this._bindFunction(context2, target);
        }
        return target;
      };
      StackContextManager2.prototype.disable = function() {
        this._currentContext = ROOT_CONTEXT;
        this._enabled = false;
        return this;
      };
      StackContextManager2.prototype.enable = function() {
        if (this._enabled) {
          return this;
        }
        this._enabled = true;
        this._currentContext = ROOT_CONTEXT;
        return this;
      };
      StackContextManager2.prototype.with = function(context2, fn, thisArg) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
          args[_i - 3] = arguments[_i];
        }
        var previousContext = this._currentContext;
        this._currentContext = context2 || ROOT_CONTEXT;
        try {
          return fn.call.apply(fn, __spreadArray$1([thisArg], __read$6(args), false));
        } finally {
          this._currentContext = previousContext;
        }
      };
      return StackContextManager2;
    }()
  );
  var __extends$7 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var WebTracerProvider = (
    /** @class */
    function(_super) {
      __extends$7(WebTracerProvider2, _super);
      function WebTracerProvider2(config) {
        if (config === void 0) {
          config = {};
        }
        var _this = _super.call(this, config) || this;
        if (config.contextManager) {
          throw "contextManager should be defined in register method not in constructor";
        }
        if (config.propagator) {
          throw "propagator should be defined in register method not in constructor";
        }
        return _this;
      }
      WebTracerProvider2.prototype.register = function(config) {
        if (config === void 0) {
          config = {};
        }
        if (config.contextManager === void 0) {
          config.contextManager = new StackContextManager();
        }
        if (config.contextManager) {
          config.contextManager.enable();
        }
        _super.prototype.register.call(this, config);
      };
      return WebTracerProvider2;
    }(BasicTracerProvider)
  );
  var PerformanceTimingNames$2;
  (function(PerformanceTimingNames2) {
    PerformanceTimingNames2["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames2["CONNECT_START"] = "connectStart";
    PerformanceTimingNames2["DECODED_BODY_SIZE"] = "decodedBodySize";
    PerformanceTimingNames2["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames2["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames2["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames2["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames2["ENCODED_BODY_SIZE"] = "encodedBodySize";
    PerformanceTimingNames2["FETCH_START"] = "fetchStart";
    PerformanceTimingNames2["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames2["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames2["NAVIGATION_START"] = "navigationStart";
    PerformanceTimingNames2["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames2["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames2["REQUEST_START"] = "requestStart";
    PerformanceTimingNames2["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames2["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames2["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames2["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames2["UNLOAD_EVENT_START"] = "unloadEventStart";
  })(PerformanceTimingNames$2 || (PerformanceTimingNames$2 = {}));
  function hasKey$2(obj, key) {
    return key in obj;
  }
  function addSpanNetworkEvent$2(span, performanceName, entries, refPerfName) {
    var perfTime = void 0;
    var refTime = void 0;
    if (hasKey$2(entries, performanceName) && typeof entries[performanceName] === "number") {
      perfTime = entries[performanceName];
    }
    var refName = PerformanceTimingNames$2.FETCH_START;
    if (hasKey$2(entries, refName) && typeof entries[refName] === "number") {
      refTime = entries[refName];
    }
    if (perfTime !== void 0 && refTime !== void 0 && perfTime >= refTime) {
      span.addEvent(performanceName, perfTime);
      return span;
    }
    return void 0;
  }
  function addSpanNetworkEvents$2(span, resource, ignoreNetworkEvents) {
    if (ignoreNetworkEvents === void 0) {
      ignoreNetworkEvents = false;
    }
    if (!ignoreNetworkEvents) {
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.FETCH_START, resource);
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.DOMAIN_LOOKUP_START, resource);
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.DOMAIN_LOOKUP_END, resource);
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.CONNECT_START, resource);
      if (hasKey$2(resource, "name") && resource["name"].startsWith("https:")) {
        addSpanNetworkEvent$2(span, PerformanceTimingNames$2.SECURE_CONNECTION_START, resource);
      }
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.CONNECT_END, resource);
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.REQUEST_START, resource);
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.RESPONSE_START, resource);
      addSpanNetworkEvent$2(span, PerformanceTimingNames$2.RESPONSE_END, resource);
    }
    var encodedLength = resource[PerformanceTimingNames$2.ENCODED_BODY_SIZE];
    if (encodedLength !== void 0) {
      span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH$2, encodedLength);
    }
    var decodedLength = resource[PerformanceTimingNames$2.DECODED_BODY_SIZE];
    if (decodedLength !== void 0 && encodedLength !== decodedLength) {
      span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$2, decodedLength);
    }
  }
  var BAGGAGE_KEY_PAIR_SEPARATOR = "=";
  var BAGGAGE_PROPERTIES_SEPARATOR = ";";
  var BAGGAGE_ITEMS_SEPARATOR = ",";
  var BAGGAGE_MAX_TOTAL_LENGTH = 8192;
  var __read$5 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  function serializeKeyPairs(keyPairs) {
    return keyPairs.reduce(function(hValue, current) {
      var value = "" + hValue + (hValue !== "" ? BAGGAGE_ITEMS_SEPARATOR : "") + current;
      return value.length > BAGGAGE_MAX_TOTAL_LENGTH ? hValue : value;
    }, "");
  }
  function getKeyPairs(baggage) {
    return baggage.getAllEntries().map(function(_a2) {
      var _b = __read$5(_a2, 2), key = _b[0], value = _b[1];
      var entry = encodeURIComponent(key) + "=" + encodeURIComponent(value.value);
      if (value.metadata !== void 0) {
        entry += BAGGAGE_PROPERTIES_SEPARATOR + value.metadata.toString();
      }
      return entry;
    });
  }
  function parsePairKeyValue(entry) {
    var valueProps = entry.split(BAGGAGE_PROPERTIES_SEPARATOR);
    if (valueProps.length <= 0)
      return;
    var keyPairPart = valueProps.shift();
    if (!keyPairPart)
      return;
    var separatorIndex = keyPairPart.indexOf(BAGGAGE_KEY_PAIR_SEPARATOR);
    if (separatorIndex <= 0)
      return;
    var key = decodeURIComponent(keyPairPart.substring(0, separatorIndex).trim());
    var value = decodeURIComponent(keyPairPart.substring(separatorIndex + 1).trim());
    var metadata;
    if (valueProps.length > 0) {
      metadata = baggageEntryMetadataFromString(valueProps.join(BAGGAGE_PROPERTIES_SEPARATOR));
    }
    return { key, value, metadata };
  }
  function parseKeyPairsIntoRecord(value) {
    if (typeof value !== "string" || value.length === 0)
      return {};
    return value.split(BAGGAGE_ITEMS_SEPARATOR).map(function(entry) {
      return parsePairKeyValue(entry);
    }).filter(function(keyPair) {
      return keyPair !== void 0 && keyPair.value.length > 0;
    }).reduce(function(headers, keyPair) {
      headers[keyPair.key] = keyPair.value;
      return headers;
    }, {});
  }
  var TracesSamplerValues;
  (function(TracesSamplerValues2) {
    TracesSamplerValues2["AlwaysOff"] = "always_off";
    TracesSamplerValues2["AlwaysOn"] = "always_on";
    TracesSamplerValues2["ParentBasedAlwaysOff"] = "parentbased_always_off";
    TracesSamplerValues2["ParentBasedAlwaysOn"] = "parentbased_always_on";
    TracesSamplerValues2["ParentBasedTraceIdRatio"] = "parentbased_traceidratio";
    TracesSamplerValues2["TraceIdRatio"] = "traceidratio";
  })(TracesSamplerValues || (TracesSamplerValues = {}));
  var DEFAULT_LIST_SEPARATOR = ",";
  var ENVIRONMENT_BOOLEAN_KEYS = ["OTEL_SDK_DISABLED"];
  function isEnvVarABoolean(key) {
    return ENVIRONMENT_BOOLEAN_KEYS.indexOf(key) > -1;
  }
  var ENVIRONMENT_NUMBERS_KEYS = [
    "OTEL_BSP_EXPORT_TIMEOUT",
    "OTEL_BSP_MAX_EXPORT_BATCH_SIZE",
    "OTEL_BSP_MAX_QUEUE_SIZE",
    "OTEL_BSP_SCHEDULE_DELAY",
    "OTEL_BLRP_EXPORT_TIMEOUT",
    "OTEL_BLRP_MAX_EXPORT_BATCH_SIZE",
    "OTEL_BLRP_MAX_QUEUE_SIZE",
    "OTEL_BLRP_SCHEDULE_DELAY",
    "OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT",
    "OTEL_ATTRIBUTE_COUNT_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT",
    "OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT",
    "OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT",
    "OTEL_SPAN_EVENT_COUNT_LIMIT",
    "OTEL_SPAN_LINK_COUNT_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT",
    "OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT",
    "OTEL_EXPORTER_OTLP_TIMEOUT",
    "OTEL_EXPORTER_OTLP_TRACES_TIMEOUT",
    "OTEL_EXPORTER_OTLP_METRICS_TIMEOUT",
    "OTEL_EXPORTER_OTLP_LOGS_TIMEOUT",
    "OTEL_EXPORTER_JAEGER_AGENT_PORT"
  ];
  function isEnvVarANumber(key) {
    return ENVIRONMENT_NUMBERS_KEYS.indexOf(key) > -1;
  }
  var ENVIRONMENT_LISTS_KEYS = [
    "OTEL_NO_PATCH_MODULES",
    "OTEL_PROPAGATORS"
  ];
  function isEnvVarAList(key) {
    return ENVIRONMENT_LISTS_KEYS.indexOf(key) > -1;
  }
  var DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = Infinity;
  var DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
  var DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = 128;
  var DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = 128;
  var DEFAULT_ENVIRONMENT = {
    OTEL_SDK_DISABLED: false,
    CONTAINER_NAME: "",
    ECS_CONTAINER_METADATA_URI_V4: "",
    ECS_CONTAINER_METADATA_URI: "",
    HOSTNAME: "",
    KUBERNETES_SERVICE_HOST: "",
    NAMESPACE: "",
    OTEL_BSP_EXPORT_TIMEOUT: 3e4,
    OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512,
    OTEL_BSP_MAX_QUEUE_SIZE: 2048,
    OTEL_BSP_SCHEDULE_DELAY: 5e3,
    OTEL_BLRP_EXPORT_TIMEOUT: 3e4,
    OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512,
    OTEL_BLRP_MAX_QUEUE_SIZE: 2048,
    OTEL_BLRP_SCHEDULE_DELAY: 5e3,
    OTEL_EXPORTER_JAEGER_AGENT_HOST: "",
    OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832,
    OTEL_EXPORTER_JAEGER_ENDPOINT: "",
    OTEL_EXPORTER_JAEGER_PASSWORD: "",
    OTEL_EXPORTER_JAEGER_USER: "",
    OTEL_EXPORTER_OTLP_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "",
    OTEL_EXPORTER_OTLP_HEADERS: "",
    OTEL_EXPORTER_OTLP_TRACES_HEADERS: "",
    OTEL_EXPORTER_OTLP_METRICS_HEADERS: "",
    OTEL_EXPORTER_OTLP_LOGS_HEADERS: "",
    OTEL_EXPORTER_OTLP_TIMEOUT: 1e4,
    OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4,
    OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4,
    OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4,
    OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans",
    OTEL_LOG_LEVEL: DiagLogLevel.INFO,
    OTEL_NO_PATCH_MODULES: [],
    OTEL_PROPAGATORS: ["tracecontext", "baggage"],
    OTEL_RESOURCE_ATTRIBUTES: "",
    OTEL_SERVICE_NAME: "",
    OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    OTEL_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT,
    OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: DEFAULT_ATTRIBUTE_COUNT_LIMIT,
    OTEL_SPAN_EVENT_COUNT_LIMIT: 128,
    OTEL_SPAN_LINK_COUNT_LIMIT: 128,
    OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT,
    OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT,
    OTEL_TRACES_EXPORTER: "",
    OTEL_TRACES_SAMPLER: TracesSamplerValues.ParentBasedAlwaysOn,
    OTEL_TRACES_SAMPLER_ARG: "",
    OTEL_LOGS_EXPORTER: "",
    OTEL_EXPORTER_OTLP_INSECURE: "",
    OTEL_EXPORTER_OTLP_TRACES_INSECURE: "",
    OTEL_EXPORTER_OTLP_METRICS_INSECURE: "",
    OTEL_EXPORTER_OTLP_LOGS_INSECURE: "",
    OTEL_EXPORTER_OTLP_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "",
    OTEL_EXPORTER_OTLP_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "",
    OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "",
    OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf",
    OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative"
  };
  function parseBoolean(key, environment, values) {
    if (typeof values[key] === "undefined") {
      return;
    }
    var value = String(values[key]);
    environment[key] = value.toLowerCase() === "true";
  }
  function parseNumber(name, environment, values, min, max) {
    if (min === void 0) {
      min = -Infinity;
    }
    if (max === void 0) {
      max = Infinity;
    }
    if (typeof values[name] !== "undefined") {
      var value = Number(values[name]);
      if (!isNaN(value)) {
        if (value < min) {
          environment[name] = min;
        } else if (value > max) {
          environment[name] = max;
        } else {
          environment[name] = value;
        }
      }
    }
  }
  function parseStringList(name, output, input, separator) {
    if (separator === void 0) {
      separator = DEFAULT_LIST_SEPARATOR;
    }
    var givenValue = input[name];
    if (typeof givenValue === "string") {
      output[name] = givenValue.split(separator).map(function(v) {
        return v.trim();
      });
    }
  }
  var logLevelMap = {
    ALL: DiagLogLevel.ALL,
    VERBOSE: DiagLogLevel.VERBOSE,
    DEBUG: DiagLogLevel.DEBUG,
    INFO: DiagLogLevel.INFO,
    WARN: DiagLogLevel.WARN,
    ERROR: DiagLogLevel.ERROR,
    NONE: DiagLogLevel.NONE
  };
  function setLogLevelFromEnv(key, environment, values) {
    var value = values[key];
    if (typeof value === "string") {
      var theLevel = logLevelMap[value.toUpperCase()];
      if (theLevel != null) {
        environment[key] = theLevel;
      }
    }
  }
  function parseEnvironment(values) {
    var environment = {};
    for (var env in DEFAULT_ENVIRONMENT) {
      var key = env;
      switch (key) {
        case "OTEL_LOG_LEVEL":
          setLogLevelFromEnv(key, environment, values);
          break;
        default:
          if (isEnvVarABoolean(key)) {
            parseBoolean(key, environment, values);
          } else if (isEnvVarANumber(key)) {
            parseNumber(key, environment, values);
          } else if (isEnvVarAList(key)) {
            parseStringList(key, environment, values);
          } else {
            var value = values[key];
            if (typeof value !== "undefined" && value !== null) {
              environment[key] = String(value);
            }
          }
      }
    }
    return environment;
  }
  var _globalThis$1 = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  function getEnv() {
    var globalEnv = parseEnvironment(_globalThis$1);
    return Object.assign({}, DEFAULT_ENVIRONMENT, globalEnv);
  }
  function intValue(charCode) {
    if (charCode >= 48 && charCode <= 57) {
      return charCode - 48;
    }
    if (charCode >= 97 && charCode <= 102) {
      return charCode - 87;
    }
    return charCode - 55;
  }
  function hexToBinary(hexStr) {
    var buf = new Uint8Array(hexStr.length / 2);
    var offset = 0;
    for (var i = 0; i < hexStr.length; i += 2) {
      var hi = intValue(hexStr.charCodeAt(i));
      var lo = intValue(hexStr.charCodeAt(i + 1));
      buf[offset++] = hi << 4 | lo;
    }
    return buf;
  }
  var otperformance = performance;
  var NANOSECOND_DIGITS = 9;
  var NANOSECOND_DIGITS_IN_MILLIS = 6;
  var MILLISECONDS_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS_IN_MILLIS);
  var SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS);
  function millisToHrTime(epochMillis) {
    var epochSeconds = epochMillis / 1e3;
    var seconds = Math.trunc(epochSeconds);
    var nanos = Math.round(epochMillis % 1e3 * MILLISECONDS_TO_NANOSECONDS);
    return [seconds, nanos];
  }
  function getTimeOrigin() {
    var timeOrigin = otperformance.timeOrigin;
    if (typeof timeOrigin !== "number") {
      var perf = otperformance;
      timeOrigin = perf.timing && perf.timing.fetchStart;
    }
    return timeOrigin;
  }
  function hrTime(performanceNow) {
    var timeOrigin = millisToHrTime(getTimeOrigin());
    var now = millisToHrTime(typeof performanceNow === "number" ? performanceNow : otperformance.now());
    return addHrTimes(timeOrigin, now);
  }
  function timeInputToHrTime(time) {
    if (isTimeInputHrTime(time)) {
      return time;
    } else if (typeof time === "number") {
      if (time < getTimeOrigin()) {
        return hrTime(time);
      } else {
        return millisToHrTime(time);
      }
    } else if (time instanceof Date) {
      return millisToHrTime(time.getTime());
    } else {
      throw TypeError("Invalid input type");
    }
  }
  function hrTimeToNanoseconds(time) {
    return time[0] * SECOND_TO_NANOSECONDS + time[1];
  }
  function isTimeInputHrTime(value) {
    return Array.isArray(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number";
  }
  function addHrTimes(time1, time2) {
    var out = [time1[0] + time2[0], time1[1] + time2[1]];
    if (out[1] >= SECOND_TO_NANOSECONDS) {
      out[1] -= SECOND_TO_NANOSECONDS;
      out[0] += 1;
    }
    return out;
  }
  var ExportResultCode;
  (function(ExportResultCode2) {
    ExportResultCode2[ExportResultCode2["SUCCESS"] = 0] = "SUCCESS";
    ExportResultCode2[ExportResultCode2["FAILED"] = 1] = "FAILED";
  })(ExportResultCode || (ExportResultCode = {}));
  var TRACE_PARENT_HEADER = "traceparent";
  var __values$1 = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  function urlMatches(url, urlToMatch) {
    if (typeof urlToMatch === "string") {
      return url === urlToMatch;
    } else {
      return !!url.match(urlToMatch);
    }
  }
  function isUrlIgnored(url, ignoredUrls) {
    var e_1, _a2;
    if (!ignoredUrls) {
      return false;
    }
    try {
      for (var ignoredUrls_1 = __values$1(ignoredUrls), ignoredUrls_1_1 = ignoredUrls_1.next(); !ignoredUrls_1_1.done; ignoredUrls_1_1 = ignoredUrls_1.next()) {
        var ignoreUrl = ignoredUrls_1_1.value;
        if (urlMatches(url, ignoreUrl)) {
          return true;
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (ignoredUrls_1_1 && !ignoredUrls_1_1.done && (_a2 = ignoredUrls_1.return)) _a2.call(ignoredUrls_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return false;
  }
  var Deferred = (
    /** @class */
    function() {
      function Deferred2() {
        var _this = this;
        this._promise = new Promise(function(resolve, reject) {
          _this._resolve = resolve;
          _this._reject = reject;
        });
      }
      Object.defineProperty(Deferred2.prototype, "promise", {
        get: function() {
          return this._promise;
        },
        enumerable: false,
        configurable: true
      });
      Deferred2.prototype.resolve = function(val) {
        this._resolve(val);
      };
      Deferred2.prototype.reject = function(err) {
        this._reject(err);
      };
      return Deferred2;
    }()
  );
  var __read$4 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var __spreadArray = function(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
  var BindOnceFuture = (
    /** @class */
    function() {
      function BindOnceFuture2(_callback, _that) {
        this._callback = _callback;
        this._that = _that;
        this._isCalled = false;
        this._deferred = new Deferred();
      }
      Object.defineProperty(BindOnceFuture2.prototype, "isCalled", {
        get: function() {
          return this._isCalled;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(BindOnceFuture2.prototype, "promise", {
        get: function() {
          return this._deferred.promise;
        },
        enumerable: false,
        configurable: true
      });
      BindOnceFuture2.prototype.call = function() {
        var _a2;
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }
        if (!this._isCalled) {
          this._isCalled = true;
          try {
            Promise.resolve((_a2 = this._callback).call.apply(_a2, __spreadArray([this._that], __read$4(args), false))).then(function(val) {
              return _this._deferred.resolve(val);
            }, function(err) {
              return _this._deferred.reject(err);
            });
          } catch (err) {
            this._deferred.reject(err);
          }
        }
        return this._deferred.promise;
      };
      return BindOnceFuture2;
    }()
  );
  var baggageUtils = {
    getKeyPairs,
    serializeKeyPairs,
    parseKeyPairsIntoRecord,
    parsePairKeyValue
  };
  var __read$3 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var DEFAULT_TRACE_TIMEOUT = 1e4;
  function parseHeaders(partialHeaders) {
    if (partialHeaders === void 0) {
      partialHeaders = {};
    }
    var headers = {};
    Object.entries(partialHeaders).forEach(function(_a2) {
      var _b = __read$3(_a2, 2), key = _b[0], value = _b[1];
      if (typeof value !== "undefined") {
        headers[key] = String(value);
      } else {
        diag.warn('Header "' + key + '" has invalid value (' + value + ") and will be ignored");
      }
    });
    return headers;
  }
  function configureExporterTimeout(timeoutMillis) {
    if (typeof timeoutMillis === "number") {
      if (timeoutMillis <= 0) {
        return invalidTimeout(timeoutMillis, DEFAULT_TRACE_TIMEOUT);
      }
      return timeoutMillis;
    } else {
      return getExporterTimeoutFromEnv();
    }
  }
  function getExporterTimeoutFromEnv() {
    var _a2;
    var definedTimeout = Number((_a2 = getEnv().OTEL_EXPORTER_OTLP_TRACES_TIMEOUT) !== null && _a2 !== void 0 ? _a2 : getEnv().OTEL_EXPORTER_OTLP_TIMEOUT);
    if (definedTimeout <= 0) {
      return invalidTimeout(definedTimeout, DEFAULT_TRACE_TIMEOUT);
    } else {
      return definedTimeout;
    }
  }
  function invalidTimeout(timeout, defaultTimeout) {
    diag.warn("Timeout must be greater than 0", timeout);
    return defaultTimeout;
  }
  function isExportRetryable(statusCode) {
    var retryCodes = [429, 502, 503, 504];
    return retryCodes.includes(statusCode);
  }
  function parseRetryAfterToMills(retryAfter) {
    if (retryAfter == null) {
      return -1;
    }
    var seconds = Number.parseInt(retryAfter, 10);
    if (Number.isInteger(seconds)) {
      return seconds > 0 ? seconds * 1e3 : -1;
    }
    var delay = new Date(retryAfter).getTime() - Date.now();
    if (delay >= 0) {
      return delay;
    }
    return 0;
  }
  var OTLPExporterBase = (
    /** @class */
    function() {
      function OTLPExporterBase2(config) {
        if (config === void 0) {
          config = {};
        }
        this._sendingPromises = [];
        this.url = this.getDefaultUrl(config);
        if (typeof config.hostname === "string") {
          this.hostname = config.hostname;
        }
        this.shutdown = this.shutdown.bind(this);
        this._shutdownOnce = new BindOnceFuture(this._shutdown, this);
        this._concurrencyLimit = typeof config.concurrencyLimit === "number" ? config.concurrencyLimit : 30;
        this.timeoutMillis = configureExporterTimeout(config.timeoutMillis);
        this.onInit(config);
      }
      OTLPExporterBase2.prototype.export = function(items, resultCallback) {
        if (this._shutdownOnce.isCalled) {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: new Error("Exporter has been shutdown")
          });
          return;
        }
        if (this._sendingPromises.length >= this._concurrencyLimit) {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: new Error("Concurrent export limit reached")
          });
          return;
        }
        this._export(items).then(function() {
          resultCallback({ code: ExportResultCode.SUCCESS });
        }).catch(function(error) {
          resultCallback({ code: ExportResultCode.FAILED, error });
        });
      };
      OTLPExporterBase2.prototype._export = function(items) {
        var _this = this;
        return new Promise(function(resolve, reject) {
          try {
            diag.debug("items to be sent", items);
            _this.send(items, resolve, reject);
          } catch (e) {
            reject(e);
          }
        });
      };
      OTLPExporterBase2.prototype.shutdown = function() {
        return this._shutdownOnce.call();
      };
      OTLPExporterBase2.prototype.forceFlush = function() {
        return Promise.all(this._sendingPromises).then(function() {
        });
      };
      OTLPExporterBase2.prototype._shutdown = function() {
        diag.debug("shutdown started");
        this.onShutdown();
        return this.forceFlush();
      };
      return OTLPExporterBase2;
    }()
  );
  var __extends$6 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var OTLPExporterError = (
    /** @class */
    function(_super) {
      __extends$6(OTLPExporterError2, _super);
      function OTLPExporterError2(message, code, data) {
        var _this = _super.call(this, message) || this;
        _this.name = "OTLPExporterError";
        _this.data = data;
        _this.code = code;
        return _this;
      }
      return OTLPExporterError2;
    }(Error)
  );
  var __read$2 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  var XhrTransport = (
    /** @class */
    function() {
      function XhrTransport2(_parameters) {
        this._parameters = _parameters;
      }
      XhrTransport2.prototype.send = function(data, timeoutMillis) {
        var _this = this;
        return new Promise(function(resolve) {
          var xhr = new XMLHttpRequest();
          xhr.timeout = timeoutMillis;
          xhr.open("POST", _this._parameters.url);
          Object.entries(_this._parameters.headers).forEach(function(_a2) {
            var _b = __read$2(_a2, 2), k = _b[0], v = _b[1];
            xhr.setRequestHeader(k, v);
          });
          xhr.ontimeout = function(_) {
            resolve({
              status: "failure",
              error: new Error("XHR request timed out")
            });
          };
          xhr.onreadystatechange = function() {
            if (xhr.status >= 200 && xhr.status <= 299) {
              diag.debug("XHR success");
              resolve({
                status: "success"
              });
            } else if (xhr.status && isExportRetryable(xhr.status)) {
              resolve({
                status: "retryable",
                retryInMillis: parseRetryAfterToMills(xhr.getResponseHeader("Retry-After"))
              });
            } else if (xhr.status !== 0) {
              resolve({
                status: "failure",
                error: new Error("XHR request failed with non-retryable status")
              });
            }
          };
          xhr.onabort = function() {
            resolve({
              status: "failure",
              error: new Error("XHR request aborted")
            });
          };
          xhr.onerror = function() {
            resolve({
              status: "failure",
              error: new Error("XHR request errored")
            });
          };
          xhr.send(new Blob([data], { type: _this._parameters.headers["Content-Type"] }));
        });
      };
      XhrTransport2.prototype.shutdown = function() {
      };
      return XhrTransport2;
    }()
  );
  function createXhrTransport(parameters) {
    return new XhrTransport(parameters);
  }
  var SendBeaconTransport = (
    /** @class */
    function() {
      function SendBeaconTransport2(_params) {
        this._params = _params;
      }
      SendBeaconTransport2.prototype.send = function(data) {
        var _this = this;
        return new Promise(function(resolve) {
          if (navigator.sendBeacon(_this._params.url, new Blob([data], { type: _this._params.blobType }))) {
            diag.debug("SendBeacon success");
            resolve({
              status: "success"
            });
          } else {
            resolve({
              status: "failure",
              error: new Error("SendBeacon failed")
            });
          }
        });
      };
      SendBeaconTransport2.prototype.shutdown = function() {
      };
      return SendBeaconTransport2;
    }()
  );
  function createSendBeaconTransport(parameters) {
    return new SendBeaconTransport(parameters);
  }
  var __awaiter = function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
  var __generator = function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
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
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
  var MAX_ATTEMPTS = 5;
  var INITIAL_BACKOFF = 1e3;
  var MAX_BACKOFF = 5e3;
  var BACKOFF_MULTIPLIER = 1.5;
  var JITTER = 0.2;
  function getJitter() {
    return Math.random() * (2 * JITTER) - JITTER;
  }
  var RetryingTransport = (
    /** @class */
    function() {
      function RetryingTransport2(_transport) {
        this._transport = _transport;
      }
      RetryingTransport2.prototype.retry = function(data, timeoutMillis, inMillis) {
        var _this = this;
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            _this._transport.send(data, timeoutMillis).then(resolve, reject);
          }, inMillis);
        });
      };
      RetryingTransport2.prototype.send = function(data, timeoutMillis) {
        var _a2;
        return __awaiter(this, void 0, void 0, function() {
          var deadline, result, attempts, nextBackoff, backoff, retryInMillis, remainingTimeoutMillis;
          return __generator(this, function(_b) {
            switch (_b.label) {
              case 0:
                deadline = Date.now() + timeoutMillis;
                return [4, this._transport.send(data, timeoutMillis)];
              case 1:
                result = _b.sent();
                attempts = MAX_ATTEMPTS;
                nextBackoff = INITIAL_BACKOFF;
                _b.label = 2;
              case 2:
                if (!(result.status === "retryable" && attempts > 0)) return [3, 4];
                attempts--;
                backoff = Math.max(Math.min(nextBackoff, MAX_BACKOFF) + getJitter(), 0);
                nextBackoff = nextBackoff * BACKOFF_MULTIPLIER;
                retryInMillis = (_a2 = result.retryInMillis) !== null && _a2 !== void 0 ? _a2 : backoff;
                remainingTimeoutMillis = deadline - Date.now();
                if (retryInMillis > remainingTimeoutMillis) {
                  return [2, result];
                }
                return [4, this.retry(data, remainingTimeoutMillis, retryInMillis)];
              case 3:
                result = _b.sent();
                return [3, 2];
              case 4:
                return [2, result];
            }
          });
        });
      };
      RetryingTransport2.prototype.shutdown = function() {
        return this._transport.shutdown();
      };
      return RetryingTransport2;
    }()
  );
  function createRetryingTransport(options) {
    return new RetryingTransport(options.transport);
  }
  var __extends$5 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var OTLPExporterBrowserBase = (
    /** @class */
    function(_super) {
      __extends$5(OTLPExporterBrowserBase2, _super);
      function OTLPExporterBrowserBase2(config, serializer, contentType) {
        if (config === void 0) {
          config = {};
        }
        var _this = _super.call(this, config) || this;
        _this._serializer = serializer;
        var useXhr = !!config.headers || typeof navigator.sendBeacon !== "function";
        if (useXhr) {
          _this._transport = createRetryingTransport({
            transport: createXhrTransport({
              headers: Object.assign({}, parseHeaders(config.headers), baggageUtils.parseKeyPairsIntoRecord(getEnv().OTEL_EXPORTER_OTLP_HEADERS), { "Content-Type": contentType }),
              url: _this.url
            })
          });
        } else {
          _this._transport = createSendBeaconTransport({
            url: _this.url,
            blobType: contentType
          });
        }
        return _this;
      }
      OTLPExporterBrowserBase2.prototype.onInit = function() {
      };
      OTLPExporterBrowserBase2.prototype.onShutdown = function() {
      };
      OTLPExporterBrowserBase2.prototype.send = function(objects, onSuccess, onError) {
        var _this = this;
        if (this._shutdownOnce.isCalled) {
          diag.debug("Shutdown already started. Cannot send objects");
          return;
        }
        var data = this._serializer.serializeRequest(objects);
        if (data == null) {
          onError(new Error("Could not serialize message"));
          return;
        }
        var promise = this._transport.send(data, this.timeoutMillis).then(function(response) {
          if (response.status === "success") {
            onSuccess();
          } else if (response.status === "failure" && response.error) {
            onError(response.error);
          } else if (response.status === "retryable") {
            onError(new OTLPExporterError("Export failed with retryable status"));
          } else {
            onError(new OTLPExporterError("Export failed with unknown error"));
          }
        }, onError);
        this._sendingPromises.push(promise);
        var popPromise = function() {
          var index = _this._sendingPromises.indexOf(promise);
          _this._sendingPromises.splice(index, 1);
        };
        promise.then(popPromise, popPromise);
      };
      return OTLPExporterBrowserBase2;
    }(OTLPExporterBase)
  );
  function hrTimeToNanos(hrTime2) {
    var NANOSECONDS = BigInt(1e9);
    return BigInt(hrTime2[0]) * NANOSECONDS + BigInt(hrTime2[1]);
  }
  function toLongBits(value) {
    var low = Number(BigInt.asUintN(32, value));
    var high = Number(BigInt.asUintN(32, value >> BigInt(32)));
    return { low, high };
  }
  function encodeAsLongBits(hrTime2) {
    var nanos = hrTimeToNanos(hrTime2);
    return toLongBits(nanos);
  }
  function encodeAsString(hrTime2) {
    var nanos = hrTimeToNanos(hrTime2);
    return nanos.toString();
  }
  var encodeTimestamp = typeof BigInt !== "undefined" ? encodeAsString : hrTimeToNanoseconds;
  function identity(value) {
    return value;
  }
  function optionalHexToBinary(str) {
    if (str === void 0)
      return void 0;
    return hexToBinary(str);
  }
  var DEFAULT_ENCODER = {
    encodeHrTime: encodeAsLongBits,
    encodeSpanContext: hexToBinary,
    encodeOptionalSpanContext: optionalHexToBinary
  };
  function getOtlpEncoder(options) {
    var _a2, _b;
    if (options === void 0) {
      return DEFAULT_ENCODER;
    }
    var useLongBits = (_a2 = options.useLongBits) !== null && _a2 !== void 0 ? _a2 : true;
    var useHex = (_b = options.useHex) !== null && _b !== void 0 ? _b : false;
    return {
      encodeHrTime: useLongBits ? encodeAsLongBits : encodeTimestamp,
      encodeSpanContext: useHex ? identity : hexToBinary,
      encodeOptionalSpanContext: useHex ? identity : optionalHexToBinary
    };
  }
  var __read$1 = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  function createInstrumentationScope(scope) {
    return {
      name: scope.name,
      version: scope.version
    };
  }
  function toAttributes(attributes) {
    return Object.keys(attributes).map(function(key) {
      return toKeyValue(key, attributes[key]);
    });
  }
  function toKeyValue(key, value) {
    return {
      key,
      value: toAnyValue(value)
    };
  }
  function toAnyValue(value) {
    var t = typeof value;
    if (t === "string")
      return { stringValue: value };
    if (t === "number") {
      if (!Number.isInteger(value))
        return { doubleValue: value };
      return { intValue: value };
    }
    if (t === "boolean")
      return { boolValue: value };
    if (value instanceof Uint8Array)
      return { bytesValue: value };
    if (Array.isArray(value))
      return { arrayValue: { values: value.map(toAnyValue) } };
    if (t === "object" && value != null)
      return {
        kvlistValue: {
          values: Object.entries(value).map(function(_a2) {
            var _b = __read$1(_a2, 2), k = _b[0], v = _b[1];
            return toKeyValue(k, v);
          })
        }
      };
    return {};
  }
  function sdkSpanToOtlpSpan(span, encoder) {
    var _a2;
    var ctx = span.spanContext();
    var status = span.status;
    return {
      traceId: encoder.encodeSpanContext(ctx.traceId),
      spanId: encoder.encodeSpanContext(ctx.spanId),
      parentSpanId: encoder.encodeOptionalSpanContext(span.parentSpanId),
      traceState: (_a2 = ctx.traceState) === null || _a2 === void 0 ? void 0 : _a2.serialize(),
      name: span.name,
      // Span kind is offset by 1 because the API does not define a value for unset
      kind: span.kind == null ? 0 : span.kind + 1,
      startTimeUnixNano: encoder.encodeHrTime(span.startTime),
      endTimeUnixNano: encoder.encodeHrTime(span.endTime),
      attributes: toAttributes(span.attributes),
      droppedAttributesCount: span.droppedAttributesCount,
      events: span.events.map(function(event) {
        return toOtlpSpanEvent(event, encoder);
      }),
      droppedEventsCount: span.droppedEventsCount,
      status: {
        // API and proto enums share the same values
        code: status.code,
        message: status.message
      },
      links: span.links.map(function(link) {
        return toOtlpLink(link, encoder);
      }),
      droppedLinksCount: span.droppedLinksCount
    };
  }
  function toOtlpLink(link, encoder) {
    var _a2;
    return {
      attributes: link.attributes ? toAttributes(link.attributes) : [],
      spanId: encoder.encodeSpanContext(link.context.spanId),
      traceId: encoder.encodeSpanContext(link.context.traceId),
      traceState: (_a2 = link.context.traceState) === null || _a2 === void 0 ? void 0 : _a2.serialize(),
      droppedAttributesCount: link.droppedAttributesCount || 0
    };
  }
  function toOtlpSpanEvent(timedEvent, encoder) {
    return {
      attributes: timedEvent.attributes ? toAttributes(timedEvent.attributes) : [],
      name: timedEvent.name,
      timeUnixNano: encoder.encodeHrTime(timedEvent.time),
      droppedAttributesCount: timedEvent.droppedAttributesCount || 0
    };
  }
  function createResource(resource) {
    return {
      attributes: toAttributes(resource.attributes),
      droppedAttributesCount: 0
    };
  }
  var __values = function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  };
  var __read = function(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
  function createExportTraceServiceRequest(spans, options) {
    var encoder = getOtlpEncoder(options);
    return {
      resourceSpans: spanRecordsToResourceSpans(spans, encoder)
    };
  }
  function createResourceMap(readableSpans) {
    var e_1, _a2;
    var resourceMap = /* @__PURE__ */ new Map();
    try {
      for (var readableSpans_1 = __values(readableSpans), readableSpans_1_1 = readableSpans_1.next(); !readableSpans_1_1.done; readableSpans_1_1 = readableSpans_1.next()) {
        var record = readableSpans_1_1.value;
        var ilmMap = resourceMap.get(record.resource);
        if (!ilmMap) {
          ilmMap = /* @__PURE__ */ new Map();
          resourceMap.set(record.resource, ilmMap);
        }
        var instrumentationLibraryKey = record.instrumentationLibrary.name + "@" + (record.instrumentationLibrary.version || "") + ":" + (record.instrumentationLibrary.schemaUrl || "");
        var records = ilmMap.get(instrumentationLibraryKey);
        if (!records) {
          records = [];
          ilmMap.set(instrumentationLibraryKey, records);
        }
        records.push(record);
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (readableSpans_1_1 && !readableSpans_1_1.done && (_a2 = readableSpans_1.return)) _a2.call(readableSpans_1);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
    return resourceMap;
  }
  function spanRecordsToResourceSpans(readableSpans, encoder) {
    var resourceMap = createResourceMap(readableSpans);
    var out = [];
    var entryIterator = resourceMap.entries();
    var entry = entryIterator.next();
    while (!entry.done) {
      var _a2 = __read(entry.value, 2), resource = _a2[0], ilmMap = _a2[1];
      var scopeResourceSpans = [];
      var ilmIterator = ilmMap.values();
      var ilmEntry = ilmIterator.next();
      while (!ilmEntry.done) {
        var scopeSpans = ilmEntry.value;
        if (scopeSpans.length > 0) {
          var spans = scopeSpans.map(function(readableSpan) {
            return sdkSpanToOtlpSpan(readableSpan, encoder);
          });
          scopeResourceSpans.push({
            scope: createInstrumentationScope(scopeSpans[0].instrumentationLibrary),
            spans,
            schemaUrl: scopeSpans[0].instrumentationLibrary.schemaUrl
          });
        }
        ilmEntry = ilmIterator.next();
      }
      var transformedSpans = {
        resource: createResource(resource),
        scopeSpans: scopeResourceSpans,
        schemaUrl: void 0
      };
      out.push(transformedSpans);
      entry = entryIterator.next();
    }
    return out;
  }
  var JsonTraceSerializer = {
    serializeRequest: function(arg) {
      var request = createExportTraceServiceRequest(arg, {
        useHex: true,
        useLongBits: false
      });
      var encoder = new TextEncoder();
      return encoder.encode(JSON.stringify(request));
    },
    deserializeResponse: function(arg) {
      var decoder = new TextDecoder();
      return JSON.parse(decoder.decode(arg));
    }
  };
  var __extends$4 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var DEFAULT_COLLECTOR_RESOURCE_PATH = "v1/traces";
  var DEFAULT_COLLECTOR_URL = "http://localhost:4318/" + DEFAULT_COLLECTOR_RESOURCE_PATH;
  var OTLPTraceExporter = (
    /** @class */
    function(_super) {
      __extends$4(OTLPTraceExporter2, _super);
      function OTLPTraceExporter2(config) {
        if (config === void 0) {
          config = {};
        }
        return _super.call(this, config, JsonTraceSerializer, "application/json") || this;
      }
      OTLPTraceExporter2.prototype.getDefaultUrl = function(config) {
        if (typeof config.url === "string") {
          return config.url;
        }
        return DEFAULT_COLLECTOR_URL;
      };
      return OTLPTraceExporter2;
    }(OTLPExporterBrowserBase)
  );
  function createTraceProvider(config, resource) {
    const exporter = new OTLPTraceExporter({
      url: `${config.endpoint}/v1/traces`,
      headers: {
        // Cabecera custom para identificar el SDK en el collector
        "X-AtlasCore-SDK": "@atlascore/web-sdk"
      }
    });
    const provider = new WebTracerProvider({
      resource,
      spanProcessors: [
        // BatchSpanProcessor: agrupa spans y los envía en lotes
        new BatchSpanProcessor(exporter, {
          scheduledDelayMillis: config.exportIntervalMs,
          maxExportBatchSize: 512,
          maxQueueSize: 2048
        }),
        // SimpleSpanProcessor con otro exporter para el flush en unload
        // Esto garantiza que los spans pendientes se envíen antes de cerrar la página
        new SimpleSpanProcessor(
          new OTLPTraceExporter({
            url: `${config.endpoint}/v1/traces`
          })
        )
      ]
    });
    logger$1.debug("TraceProvider inicializado →", config.endpoint);
    return provider;
  }
  var NoopLogger = (
    /** @class */
    function() {
      function NoopLogger2() {
      }
      NoopLogger2.prototype.emit = function(_logRecord) {
      };
      return NoopLogger2;
    }()
  );
  var NoopLoggerProvider = (
    /** @class */
    function() {
      function NoopLoggerProvider2() {
      }
      NoopLoggerProvider2.prototype.getLogger = function(_name, _version, _options) {
        return new NoopLogger();
      };
      return NoopLoggerProvider2;
    }()
  );
  var NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
  var _globalThis = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
  var GLOBAL_LOGS_API_KEY = Symbol.for("io.opentelemetry.js.api.logs");
  var _global = _globalThis;
  function makeGetter(requiredVersion, instance, fallback) {
    return function(version) {
      return version === requiredVersion ? instance : fallback;
    };
  }
  var API_BACKWARDS_COMPATIBILITY_VERSION = 1;
  var LogsAPI = (
    /** @class */
    function() {
      function LogsAPI2() {
      }
      LogsAPI2.getInstance = function() {
        if (!this._instance) {
          this._instance = new LogsAPI2();
        }
        return this._instance;
      };
      LogsAPI2.prototype.setGlobalLoggerProvider = function(provider) {
        if (_global[GLOBAL_LOGS_API_KEY]) {
          return this.getLoggerProvider();
        }
        _global[GLOBAL_LOGS_API_KEY] = makeGetter(API_BACKWARDS_COMPATIBILITY_VERSION, provider, NOOP_LOGGER_PROVIDER);
        return provider;
      };
      LogsAPI2.prototype.getLoggerProvider = function() {
        var _a2, _b;
        return (_b = (_a2 = _global[GLOBAL_LOGS_API_KEY]) === null || _a2 === void 0 ? void 0 : _a2.call(_global, API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : NOOP_LOGGER_PROVIDER;
      };
      LogsAPI2.prototype.getLogger = function(name, version, options) {
        return this.getLoggerProvider().getLogger(name, version, options);
      };
      LogsAPI2.prototype.disable = function() {
        delete _global[GLOBAL_LOGS_API_KEY];
      };
      return LogsAPI2;
    }()
  );
  var logs = LogsAPI.getInstance();
  function enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider) {
    for (var i = 0, j = instrumentations.length; i < j; i++) {
      var instrumentation = instrumentations[i];
      if (tracerProvider) {
        instrumentation.setTracerProvider(tracerProvider);
      }
      if (meterProvider) {
        instrumentation.setMeterProvider(meterProvider);
      }
      if (loggerProvider && instrumentation.setLoggerProvider) {
        instrumentation.setLoggerProvider(loggerProvider);
      }
      if (!instrumentation.getConfig().enabled) {
        instrumentation.enable();
      }
    }
  }
  function disableInstrumentations(instrumentations) {
    instrumentations.forEach(function(instrumentation) {
      return instrumentation.disable();
    });
  }
  function registerInstrumentations(options) {
    var _a2, _b;
    var tracerProvider = options.tracerProvider || trace.getTracerProvider();
    var meterProvider = options.meterProvider || metrics.getMeterProvider();
    var loggerProvider = options.loggerProvider || logs.getLoggerProvider();
    var instrumentations = (_b = (_a2 = options.instrumentations) === null || _a2 === void 0 ? void 0 : _a2.flat()) !== null && _b !== void 0 ? _b : [];
    enableInstrumentations(instrumentations, tracerProvider, meterProvider, loggerProvider);
    return function() {
      disableInstrumentations(instrumentations);
    };
  }
  function isFunction(funktion) {
    return typeof funktion === "function";
  }
  var logger = console.error.bind(console);
  function defineProperty(obj, name, value) {
    var enumerable = !!obj[name] && obj.propertyIsEnumerable(name);
    Object.defineProperty(obj, name, {
      configurable: true,
      enumerable,
      writable: true,
      value
    });
  }
  function shimmer(options) {
    if (options && options.logger) {
      if (!isFunction(options.logger)) logger("new logger isn't a function, not replacing");
      else logger = options.logger;
    }
  }
  function wrap(nodule, name, wrapper) {
    if (!nodule || !nodule[name]) {
      logger("no original function " + name + " to wrap");
      return;
    }
    if (!wrapper) {
      logger("no wrapper function");
      logger(new Error().stack);
      return;
    }
    if (!isFunction(nodule[name]) || !isFunction(wrapper)) {
      logger("original object and wrapper must be functions");
      return;
    }
    var original = nodule[name];
    var wrapped = wrapper(original, name);
    defineProperty(wrapped, "__original", original);
    defineProperty(wrapped, "__unwrap", function() {
      if (nodule[name] === wrapped) defineProperty(nodule, name, original);
    });
    defineProperty(wrapped, "__wrapped", true);
    defineProperty(nodule, name, wrapped);
    return wrapped;
  }
  function massWrap(nodules, names, wrapper) {
    if (!nodules) {
      logger("must provide one or more modules to patch");
      logger(new Error().stack);
      return;
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }
    if (!(names && Array.isArray(names))) {
      logger("must provide one or more functions to wrap on modules");
      return;
    }
    nodules.forEach(function(nodule) {
      names.forEach(function(name) {
        wrap(nodule, name, wrapper);
      });
    });
  }
  function unwrap(nodule, name) {
    if (!nodule || !nodule[name]) {
      logger("no function to unwrap.");
      logger(new Error().stack);
      return;
    }
    if (!nodule[name].__unwrap) {
      logger("no original to unwrap to -- has " + name + " already been unwrapped?");
    } else {
      return nodule[name].__unwrap();
    }
  }
  function massUnwrap(nodules, names) {
    if (!nodules) {
      logger("must provide one or more modules to patch");
      logger(new Error().stack);
      return;
    } else if (!Array.isArray(nodules)) {
      nodules = [nodules];
    }
    if (!(names && Array.isArray(names))) {
      logger("must provide one or more functions to unwrap on modules");
      return;
    }
    nodules.forEach(function(nodule) {
      names.forEach(function(name) {
        unwrap(nodule, name);
      });
    });
  }
  shimmer.wrap = wrap;
  shimmer.massWrap = massWrap;
  shimmer.unwrap = unwrap;
  shimmer.massUnwrap = massUnwrap;
  var shimmer_1 = shimmer;
  var __assign = function() {
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
          t[p] = s[p];
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  var InstrumentationAbstract = (
    /** @class */
    function() {
      function InstrumentationAbstract2(instrumentationName, instrumentationVersion, config) {
        this.instrumentationName = instrumentationName;
        this.instrumentationVersion = instrumentationVersion;
        this._config = {};
        this._wrap = shimmer_1.wrap;
        this._unwrap = shimmer_1.unwrap;
        this._massWrap = shimmer_1.massWrap;
        this._massUnwrap = shimmer_1.massUnwrap;
        this.setConfig(config);
        this._diag = diag.createComponentLogger({
          namespace: instrumentationName
        });
        this._tracer = trace.getTracer(instrumentationName, instrumentationVersion);
        this._meter = metrics.getMeter(instrumentationName, instrumentationVersion);
        this._logger = logs.getLogger(instrumentationName, instrumentationVersion);
        this._updateMetricInstruments();
      }
      Object.defineProperty(InstrumentationAbstract2.prototype, "meter", {
        /* Returns meter */
        get: function() {
          return this._meter;
        },
        enumerable: false,
        configurable: true
      });
      InstrumentationAbstract2.prototype.setMeterProvider = function(meterProvider) {
        this._meter = meterProvider.getMeter(this.instrumentationName, this.instrumentationVersion);
        this._updateMetricInstruments();
      };
      Object.defineProperty(InstrumentationAbstract2.prototype, "logger", {
        /* Returns logger */
        get: function() {
          return this._logger;
        },
        enumerable: false,
        configurable: true
      });
      InstrumentationAbstract2.prototype.setLoggerProvider = function(loggerProvider) {
        this._logger = loggerProvider.getLogger(this.instrumentationName, this.instrumentationVersion);
      };
      InstrumentationAbstract2.prototype.getModuleDefinitions = function() {
        var _a2;
        var initResult = (_a2 = this.init()) !== null && _a2 !== void 0 ? _a2 : [];
        if (!Array.isArray(initResult)) {
          return [initResult];
        }
        return initResult;
      };
      InstrumentationAbstract2.prototype._updateMetricInstruments = function() {
        return;
      };
      InstrumentationAbstract2.prototype.getConfig = function() {
        return this._config;
      };
      InstrumentationAbstract2.prototype.setConfig = function(config) {
        this._config = __assign({ enabled: true }, config);
      };
      InstrumentationAbstract2.prototype.setTracerProvider = function(tracerProvider) {
        this._tracer = tracerProvider.getTracer(this.instrumentationName, this.instrumentationVersion);
      };
      Object.defineProperty(InstrumentationAbstract2.prototype, "tracer", {
        /* Returns tracer */
        get: function() {
          return this._tracer;
        },
        enumerable: false,
        configurable: true
      });
      InstrumentationAbstract2.prototype._runSpanCustomizationHook = function(hookHandler, triggerName, span, info) {
        if (!hookHandler) {
          return;
        }
        try {
          hookHandler(span, info);
        } catch (e) {
          this._diag.error("Error running span customization hook due to exception in handler", { triggerName }, e);
        }
      };
      return InstrumentationAbstract2;
    }()
  );
  var __extends$3 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var InstrumentationBase = (
    /** @class */
    function(_super) {
      __extends$3(InstrumentationBase2, _super);
      function InstrumentationBase2(instrumentationName, instrumentationVersion, config) {
        var _this = _super.call(this, instrumentationName, instrumentationVersion, config) || this;
        if (_this._config.enabled) {
          _this.enable();
        }
        return _this;
      }
      return InstrumentationBase2;
    }(InstrumentationAbstract)
  );
  (function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
  (function(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
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
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
  function safeExecuteInTheMiddle(execute, onFinish, preventThrowingError) {
    var error;
    var result;
    try {
      result = execute();
    } catch (e) {
      error = e;
    } finally {
      onFinish(error, result);
      return result;
    }
  }
  function isWrapped(func) {
    return typeof func === "function" && typeof func.__original === "function" && typeof func.__unwrap === "function" && func.__wrapped === true;
  }
  var AttributeNames$2;
  (function(AttributeNames2) {
    AttributeNames2["DOCUMENT_LOAD"] = "documentLoad";
    AttributeNames2["DOCUMENT_FETCH"] = "documentFetch";
    AttributeNames2["RESOURCE_FETCH"] = "resourceFetch";
  })(AttributeNames$2 || (AttributeNames$2 = {}));
  var PACKAGE_VERSION = "0.40.0";
  var PACKAGE_NAME = "@opentelemetry/instrumentation-document-load";
  var EventNames$1;
  (function(EventNames2) {
    EventNames2["FIRST_PAINT"] = "firstPaint";
    EventNames2["FIRST_CONTENTFUL_PAINT"] = "firstContentfulPaint";
  })(EventNames$1 || (EventNames$1 = {}));
  var getPerformanceNavigationEntries = function() {
    var _a2, _b;
    var entries = {};
    var performanceNavigationTiming = (_b = (_a2 = otperformance).getEntriesByType) === null || _b === void 0 ? void 0 : _b.call(_a2, "navigation")[0];
    if (performanceNavigationTiming) {
      var keys = Object.values(PerformanceTimingNames$2);
      keys.forEach(function(key) {
        if (hasKey$2(performanceNavigationTiming, key)) {
          var value = performanceNavigationTiming[key];
          if (typeof value === "number") {
            entries[key] = value;
          }
        }
      });
    } else {
      var perf = otperformance;
      var performanceTiming_1 = perf.timing;
      if (performanceTiming_1) {
        var keys = Object.values(PerformanceTimingNames$2);
        keys.forEach(function(key) {
          if (hasKey$2(performanceTiming_1, key)) {
            var value = performanceTiming_1[key];
            if (typeof value === "number") {
              entries[key] = value;
            }
          }
        });
      }
    }
    return entries;
  };
  var performancePaintNames = {
    "first-paint": EventNames$1.FIRST_PAINT,
    "first-contentful-paint": EventNames$1.FIRST_CONTENTFUL_PAINT
  };
  var addSpanPerformancePaintEvents = function(span) {
    var _a2, _b;
    var performancePaintTiming = (_b = (_a2 = otperformance).getEntriesByType) === null || _b === void 0 ? void 0 : _b.call(_a2, "paint");
    if (performancePaintTiming) {
      performancePaintTiming.forEach(function(_a3) {
        var name = _a3.name, startTime = _a3.startTime;
        if (hasKey$2(performancePaintNames, name)) {
          span.addEvent(performancePaintNames[name], startTime);
        }
      });
    }
  };
  var __extends$2 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var DocumentLoadInstrumentation = (
    /** @class */
    function(_super) {
      __extends$2(DocumentLoadInstrumentation2, _super);
      function DocumentLoadInstrumentation2(config) {
        if (config === void 0) {
          config = {};
        }
        var _this = _super.call(this, PACKAGE_NAME, PACKAGE_VERSION, config) || this;
        _this.component = "document-load";
        _this.version = "1";
        _this.moduleName = _this.component;
        return _this;
      }
      DocumentLoadInstrumentation2.prototype.init = function() {
      };
      DocumentLoadInstrumentation2.prototype._onDocumentLoaded = function() {
        var _this = this;
        window.setTimeout(function() {
          _this._collectPerformance();
        });
      };
      DocumentLoadInstrumentation2.prototype._addResourcesSpans = function(rootSpan) {
        var _this = this;
        var _a2, _b;
        var resources = (_b = (_a2 = otperformance).getEntriesByType) === null || _b === void 0 ? void 0 : _b.call(_a2, "resource");
        if (resources) {
          resources.forEach(function(resource) {
            _this._initResourceSpan(resource, rootSpan);
          });
        }
      };
      DocumentLoadInstrumentation2.prototype._collectPerformance = function() {
        var _this = this;
        var metaElement = Array.from(document.getElementsByTagName("meta")).find(function(e) {
          return e.getAttribute("name") === TRACE_PARENT_HEADER;
        });
        var entries = getPerformanceNavigationEntries();
        var traceparent = metaElement && metaElement.content || "";
        context.with(propagation.extract(ROOT_CONTEXT, { traceparent }), function() {
          var _a2;
          var rootSpan = _this._startSpan(AttributeNames$2.DOCUMENT_LOAD, PerformanceTimingNames$2.FETCH_START, entries);
          if (!rootSpan) {
            return;
          }
          context.with(trace.setSpan(context.active(), rootSpan), function() {
            var fetchSpan = _this._startSpan(AttributeNames$2.DOCUMENT_FETCH, PerformanceTimingNames$2.FETCH_START, entries);
            if (fetchSpan) {
              fetchSpan.setAttribute(SEMATTRS_HTTP_URL$2, location.href);
              context.with(trace.setSpan(context.active(), fetchSpan), function() {
                var _a3;
                if (!_this.getConfig().ignoreNetworkEvents) {
                  addSpanNetworkEvents$2(fetchSpan, entries);
                }
                _this._addCustomAttributesOnSpan(fetchSpan, (_a3 = _this.getConfig().applyCustomAttributesOnSpan) === null || _a3 === void 0 ? void 0 : _a3.documentFetch);
                _this._endSpan(fetchSpan, PerformanceTimingNames$2.RESPONSE_END, entries);
              });
            }
          });
          rootSpan.setAttribute(SEMATTRS_HTTP_URL$2, location.href);
          rootSpan.setAttribute(SEMATTRS_HTTP_USER_AGENT$2, navigator.userAgent);
          _this._addResourcesSpans(rootSpan);
          if (!_this.getConfig().ignoreNetworkEvents) {
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.FETCH_START, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.UNLOAD_EVENT_START, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.UNLOAD_EVENT_END, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.DOM_INTERACTIVE, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.DOM_CONTENT_LOADED_EVENT_START, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.DOM_CONTENT_LOADED_EVENT_END, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.DOM_COMPLETE, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.LOAD_EVENT_START, entries);
            addSpanNetworkEvent$2(rootSpan, PerformanceTimingNames$2.LOAD_EVENT_END, entries);
          }
          if (!_this.getConfig().ignorePerformancePaintEvents) {
            addSpanPerformancePaintEvents(rootSpan);
          }
          _this._addCustomAttributesOnSpan(rootSpan, (_a2 = _this.getConfig().applyCustomAttributesOnSpan) === null || _a2 === void 0 ? void 0 : _a2.documentLoad);
          _this._endSpan(rootSpan, PerformanceTimingNames$2.LOAD_EVENT_END, entries);
        });
      };
      DocumentLoadInstrumentation2.prototype._endSpan = function(span, performanceName, entries) {
        if (span) {
          if (hasKey$2(entries, performanceName)) {
            span.end(entries[performanceName]);
          } else {
            span.end();
          }
        }
      };
      DocumentLoadInstrumentation2.prototype._initResourceSpan = function(resource, parentSpan) {
        var _a2;
        var span = this._startSpan(AttributeNames$2.RESOURCE_FETCH, PerformanceTimingNames$2.FETCH_START, resource, parentSpan);
        if (span) {
          span.setAttribute(SEMATTRS_HTTP_URL$2, resource.name);
          if (!this.getConfig().ignoreNetworkEvents) {
            addSpanNetworkEvents$2(span, resource);
          }
          this._addCustomAttributesOnResourceSpan(span, resource, (_a2 = this.getConfig().applyCustomAttributesOnSpan) === null || _a2 === void 0 ? void 0 : _a2.resourceFetch);
          this._endSpan(span, PerformanceTimingNames$2.RESPONSE_END, resource);
        }
      };
      DocumentLoadInstrumentation2.prototype._startSpan = function(spanName, performanceName, entries, parentSpan) {
        if (hasKey$2(entries, performanceName) && typeof entries[performanceName] === "number") {
          var span = this.tracer.startSpan(spanName, {
            startTime: entries[performanceName]
          }, parentSpan ? trace.setSpan(context.active(), parentSpan) : void 0);
          return span;
        }
        return void 0;
      };
      DocumentLoadInstrumentation2.prototype._waitForPageLoad = function() {
        if (window.document.readyState === "complete") {
          this._onDocumentLoaded();
        } else {
          this._onDocumentLoaded = this._onDocumentLoaded.bind(this);
          window.addEventListener("load", this._onDocumentLoaded);
        }
      };
      DocumentLoadInstrumentation2.prototype._addCustomAttributesOnSpan = function(span, applyCustomAttributesOnSpan) {
        var _this = this;
        if (applyCustomAttributesOnSpan) {
          safeExecuteInTheMiddle(function() {
            return applyCustomAttributesOnSpan(span);
          }, function(error) {
            if (!error) {
              return;
            }
            _this._diag.error("addCustomAttributesOnSpan", error);
          });
        }
      };
      DocumentLoadInstrumentation2.prototype._addCustomAttributesOnResourceSpan = function(span, resource, applyCustomAttributesOnSpan) {
        var _this = this;
        if (applyCustomAttributesOnSpan) {
          safeExecuteInTheMiddle(function() {
            return applyCustomAttributesOnSpan(span, resource);
          }, function(error) {
            if (!error) {
              return;
            }
            _this._diag.error("addCustomAttributesOnResourceSpan", error);
          });
        }
      };
      DocumentLoadInstrumentation2.prototype.enable = function() {
        window.removeEventListener("load", this._onDocumentLoaded);
        this._waitForPageLoad();
      };
      DocumentLoadInstrumentation2.prototype.disable = function() {
        window.removeEventListener("load", this._onDocumentLoaded);
      };
      return DocumentLoadInstrumentation2;
    }(InstrumentationBase)
  );
  var PerformanceTimingNames$1;
  (function(PerformanceTimingNames2) {
    PerformanceTimingNames2["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames2["CONNECT_START"] = "connectStart";
    PerformanceTimingNames2["DECODED_BODY_SIZE"] = "decodedBodySize";
    PerformanceTimingNames2["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames2["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames2["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames2["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames2["ENCODED_BODY_SIZE"] = "encodedBodySize";
    PerformanceTimingNames2["FETCH_START"] = "fetchStart";
    PerformanceTimingNames2["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames2["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames2["NAVIGATION_START"] = "navigationStart";
    PerformanceTimingNames2["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames2["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames2["REQUEST_START"] = "requestStart";
    PerformanceTimingNames2["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames2["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames2["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames2["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames2["UNLOAD_EVENT_START"] = "unloadEventStart";
  })(PerformanceTimingNames$1 || (PerformanceTimingNames$1 = {}));
  var TMP_HTTP_METHOD$1 = "http.method";
  var TMP_HTTP_URL$1 = "http.url";
  var TMP_HTTP_HOST$1 = "http.host";
  var TMP_HTTP_SCHEME$1 = "http.scheme";
  var TMP_HTTP_STATUS_CODE$1 = "http.status_code";
  var TMP_HTTP_USER_AGENT$1 = "http.user_agent";
  var TMP_HTTP_RESPONSE_CONTENT_LENGTH$1 = "http.response_content_length";
  var TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$1 = "http.response_content_length_uncompressed";
  var SEMATTRS_HTTP_METHOD$1 = TMP_HTTP_METHOD$1;
  var SEMATTRS_HTTP_URL$1 = TMP_HTTP_URL$1;
  var SEMATTRS_HTTP_HOST$1 = TMP_HTTP_HOST$1;
  var SEMATTRS_HTTP_SCHEME$1 = TMP_HTTP_SCHEME$1;
  var SEMATTRS_HTTP_STATUS_CODE$1 = TMP_HTTP_STATUS_CODE$1;
  var SEMATTRS_HTTP_USER_AGENT$1 = TMP_HTTP_USER_AGENT$1;
  var SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH$1 = TMP_HTTP_RESPONSE_CONTENT_LENGTH$1;
  var SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$1 = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$1;
  var urlNormalizingAnchor$1;
  function getUrlNormalizingAnchor$1() {
    if (!urlNormalizingAnchor$1) {
      urlNormalizingAnchor$1 = document.createElement("a");
    }
    return urlNormalizingAnchor$1;
  }
  function hasKey$1(obj, key) {
    return key in obj;
  }
  function addSpanNetworkEvent$1(span, performanceName, entries, refPerfName) {
    var perfTime = void 0;
    var refTime = void 0;
    if (hasKey$1(entries, performanceName) && typeof entries[performanceName] === "number") {
      perfTime = entries[performanceName];
    }
    var refName = PerformanceTimingNames$1.FETCH_START;
    if (hasKey$1(entries, refName) && typeof entries[refName] === "number") {
      refTime = entries[refName];
    }
    if (perfTime !== void 0 && refTime !== void 0 && perfTime >= refTime) {
      span.addEvent(performanceName, perfTime);
      return span;
    }
    return void 0;
  }
  function addSpanNetworkEvents$1(span, resource) {
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.FETCH_START, resource);
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.DOMAIN_LOOKUP_START, resource);
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.DOMAIN_LOOKUP_END, resource);
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.CONNECT_START, resource);
    if (hasKey$1(resource, "name") && resource["name"].startsWith("https:")) {
      addSpanNetworkEvent$1(span, PerformanceTimingNames$1.SECURE_CONNECTION_START, resource);
    }
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.CONNECT_END, resource);
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.REQUEST_START, resource);
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.RESPONSE_START, resource);
    addSpanNetworkEvent$1(span, PerformanceTimingNames$1.RESPONSE_END, resource);
    var encodedLength = resource[PerformanceTimingNames$1.ENCODED_BODY_SIZE];
    if (encodedLength !== void 0) {
      span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH$1, encodedLength);
    }
    var decodedLength = resource[PerformanceTimingNames$1.DECODED_BODY_SIZE];
    if (decodedLength !== void 0 && encodedLength !== decodedLength) {
      span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED$1, decodedLength);
    }
  }
  function sortResources$1(filteredResources) {
    return filteredResources.slice().sort(function(a, b) {
      var valueA = a[PerformanceTimingNames$1.FETCH_START];
      var valueB = b[PerformanceTimingNames$1.FETCH_START];
      if (valueA > valueB) {
        return 1;
      } else if (valueA < valueB) {
        return -1;
      }
      return 0;
    });
  }
  function getOrigin$1() {
    return typeof location !== "undefined" ? location.origin : void 0;
  }
  function getResource$1(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
    if (ignoredResources === void 0) {
      ignoredResources = /* @__PURE__ */ new WeakSet();
    }
    var parsedSpanUrl = parseUrl$1(spanUrl);
    spanUrl = parsedSpanUrl.toString();
    var filteredResources = filterResourcesForSpan$1(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType);
    if (filteredResources.length === 0) {
      return {
        mainRequest: void 0
      };
    }
    if (filteredResources.length === 1) {
      return {
        mainRequest: filteredResources[0]
      };
    }
    var sorted = sortResources$1(filteredResources);
    if (parsedSpanUrl.origin !== getOrigin$1() && sorted.length > 1) {
      var corsPreFlightRequest = sorted[0];
      var mainRequest = findMainRequest$1(sorted, corsPreFlightRequest[PerformanceTimingNames$1.RESPONSE_END], endTimeHR);
      var responseEnd = corsPreFlightRequest[PerformanceTimingNames$1.RESPONSE_END];
      var fetchStart = mainRequest[PerformanceTimingNames$1.FETCH_START];
      if (fetchStart < responseEnd) {
        mainRequest = corsPreFlightRequest;
        corsPreFlightRequest = void 0;
      }
      return {
        corsPreFlightRequest,
        mainRequest
      };
    } else {
      return {
        mainRequest: filteredResources[0]
      };
    }
  }
  function findMainRequest$1(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
    var spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
    var minTime = hrTimeToNanoseconds(timeInputToHrTime(corsPreFlightRequestEndTime));
    var mainRequest = resources[1];
    var bestGap;
    var length = resources.length;
    for (var i = 1; i < length; i++) {
      var resource = resources[i];
      var resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames$1.FETCH_START]));
      var resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames$1.RESPONSE_END]));
      var currentGap = spanEndTime - resourceEndTime;
      if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
        bestGap = currentGap;
        mainRequest = resource;
      }
    }
    return mainRequest;
  }
  function filterResourcesForSpan$1(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
    var startTime = hrTimeToNanoseconds(startTimeHR);
    var endTime = hrTimeToNanoseconds(endTimeHR);
    var filteredResources = resources.filter(function(resource) {
      var resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames$1.FETCH_START]));
      var resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames$1.RESPONSE_END]));
      return resource.initiatorType.toLowerCase() === initiatorType && resource.name === spanUrl && resourceStartTime >= startTime && resourceEndTime <= endTime;
    });
    if (filteredResources.length > 0) {
      filteredResources = filteredResources.filter(function(resource) {
        return !ignoredResources.has(resource);
      });
    }
    return filteredResources;
  }
  function parseUrl$1(url) {
    if (typeof URL === "function") {
      return new URL(url, typeof document !== "undefined" ? document.baseURI : typeof location !== "undefined" ? location.href : void 0);
    }
    var element = getUrlNormalizingAnchor$1();
    element.href = url;
    return element;
  }
  function shouldPropagateTraceHeaders$1(spanUrl, propagateTraceHeaderCorsUrls) {
    var propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
    if (typeof propagateTraceHeaderUrls === "string" || propagateTraceHeaderUrls instanceof RegExp) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }
    var parsedSpanUrl = parseUrl$1(spanUrl);
    if (parsedSpanUrl.origin === getOrigin$1()) {
      return true;
    } else {
      return propagateTraceHeaderUrls.some(function(propagateTraceHeaderUrl) {
        return urlMatches(spanUrl, propagateTraceHeaderUrl);
      });
    }
  }
  var AttributeNames$1;
  (function(AttributeNames2) {
    AttributeNames2["COMPONENT"] = "component";
    AttributeNames2["HTTP_ERROR_NAME"] = "http.error_name";
    AttributeNames2["HTTP_STATUS_TEXT"] = "http.status_text";
  })(AttributeNames$1 || (AttributeNames$1 = {}));
  var VERSION$1 = "0.53.0";
  var __extends$1 = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var _a;
  var OBSERVER_WAIT_TIME_MS$1 = 300;
  var isNode = typeof process === "object" && ((_a = process.release) === null || _a === void 0 ? void 0 : _a.name) === "node";
  var FetchInstrumentation = (
    /** @class */
    function(_super) {
      __extends$1(FetchInstrumentation2, _super);
      function FetchInstrumentation2(config) {
        if (config === void 0) {
          config = {};
        }
        var _this = _super.call(this, "@opentelemetry/instrumentation-fetch", VERSION$1, config) || this;
        _this.component = "fetch";
        _this.version = VERSION$1;
        _this.moduleName = _this.component;
        _this._usedResources = /* @__PURE__ */ new WeakSet();
        _this._tasksCount = 0;
        return _this;
      }
      FetchInstrumentation2.prototype.init = function() {
      };
      FetchInstrumentation2.prototype._addChildSpan = function(span, corsPreFlightRequest) {
        var childSpan = this.tracer.startSpan("CORS Preflight", {
          startTime: corsPreFlightRequest[PerformanceTimingNames$1.FETCH_START]
        }, trace.setSpan(context.active(), span));
        if (!this.getConfig().ignoreNetworkEvents) {
          addSpanNetworkEvents$1(childSpan, corsPreFlightRequest);
        }
        childSpan.end(corsPreFlightRequest[PerformanceTimingNames$1.RESPONSE_END]);
      };
      FetchInstrumentation2.prototype._addFinalSpanAttributes = function(span, response) {
        var parsedUrl = parseUrl$1(response.url);
        span.setAttribute(SEMATTRS_HTTP_STATUS_CODE$1, response.status);
        if (response.statusText != null) {
          span.setAttribute(AttributeNames$1.HTTP_STATUS_TEXT, response.statusText);
        }
        span.setAttribute(SEMATTRS_HTTP_HOST$1, parsedUrl.host);
        span.setAttribute(SEMATTRS_HTTP_SCHEME$1, parsedUrl.protocol.replace(":", ""));
        if (typeof navigator !== "undefined") {
          span.setAttribute(SEMATTRS_HTTP_USER_AGENT$1, navigator.userAgent);
        }
      };
      FetchInstrumentation2.prototype._addHeaders = function(options, spanUrl) {
        if (!shouldPropagateTraceHeaders$1(spanUrl, this.getConfig().propagateTraceHeaderCorsUrls)) {
          var headers = {};
          propagation.inject(context.active(), headers);
          if (Object.keys(headers).length > 0) {
            this._diag.debug("headers inject skipped due to CORS policy");
          }
          return;
        }
        if (options instanceof Request) {
          propagation.inject(context.active(), options.headers, {
            set: function(h, k, v) {
              return h.set(k, typeof v === "string" ? v : String(v));
            }
          });
        } else if (options.headers instanceof Headers) {
          propagation.inject(context.active(), options.headers, {
            set: function(h, k, v) {
              return h.set(k, typeof v === "string" ? v : String(v));
            }
          });
        } else if (options.headers instanceof Map) {
          propagation.inject(context.active(), options.headers, {
            set: function(h, k, v) {
              return h.set(k, typeof v === "string" ? v : String(v));
            }
          });
        } else {
          var headers = {};
          propagation.inject(context.active(), headers);
          options.headers = Object.assign({}, headers, options.headers || {});
        }
      };
      FetchInstrumentation2.prototype._clearResources = function() {
        if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
          performance.clearResourceTimings();
          this._usedResources = /* @__PURE__ */ new WeakSet();
        }
      };
      FetchInstrumentation2.prototype._createSpan = function(url, options) {
        var _a2;
        if (options === void 0) {
          options = {};
        }
        if (isUrlIgnored(url, this.getConfig().ignoreUrls)) {
          this._diag.debug("ignoring span as url matches ignored url");
          return;
        }
        var method = (options.method || "GET").toUpperCase();
        var spanName = "HTTP " + method;
        return this.tracer.startSpan(spanName, {
          kind: SpanKind.CLIENT,
          attributes: (_a2 = {}, _a2[AttributeNames$1.COMPONENT] = this.moduleName, _a2[SEMATTRS_HTTP_METHOD$1] = method, _a2[SEMATTRS_HTTP_URL$1] = url, _a2)
        });
      };
      FetchInstrumentation2.prototype._findResourceAndAddNetworkEvents = function(span, resourcesObserver, endTime) {
        var resources = resourcesObserver.entries;
        if (!resources.length) {
          if (!performance.getEntriesByType) {
            return;
          }
          resources = performance.getEntriesByType("resource");
        }
        var resource = getResource$1(resourcesObserver.spanUrl, resourcesObserver.startTime, endTime, resources, this._usedResources, "fetch");
        if (resource.mainRequest) {
          var mainRequest = resource.mainRequest;
          this._markResourceAsUsed(mainRequest);
          var corsPreFlightRequest = resource.corsPreFlightRequest;
          if (corsPreFlightRequest) {
            this._addChildSpan(span, corsPreFlightRequest);
            this._markResourceAsUsed(corsPreFlightRequest);
          }
          if (!this.getConfig().ignoreNetworkEvents) {
            addSpanNetworkEvents$1(span, mainRequest);
          }
        }
      };
      FetchInstrumentation2.prototype._markResourceAsUsed = function(resource) {
        this._usedResources.add(resource);
      };
      FetchInstrumentation2.prototype._endSpan = function(span, spanData, response) {
        var _this = this;
        var endTime = millisToHrTime(Date.now());
        var performanceEndTime = hrTime();
        this._addFinalSpanAttributes(span, response);
        setTimeout(function() {
          var _a2;
          (_a2 = spanData.observer) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
          _this._findResourceAndAddNetworkEvents(span, spanData, performanceEndTime);
          _this._tasksCount--;
          _this._clearResources();
          span.end(endTime);
        }, OBSERVER_WAIT_TIME_MS$1);
      };
      FetchInstrumentation2.prototype._patchConstructor = function() {
        var _this = this;
        return function(original) {
          var plugin = _this;
          return function patchConstructor() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            var self2 = this;
            var url = parseUrl$1(args[0] instanceof Request ? args[0].url : String(args[0])).href;
            var options = args[0] instanceof Request ? args[0] : args[1] || {};
            var createdSpan = plugin._createSpan(url, options);
            if (!createdSpan) {
              return original.apply(this, args);
            }
            var spanData = plugin._prepareSpanData(url);
            function endSpanOnError(span, error) {
              plugin._applyAttributesAfterFetch(span, options, error);
              plugin._endSpan(span, spanData, {
                status: error.status || 0,
                statusText: error.message,
                url
              });
            }
            function endSpanOnSuccess(span, response) {
              plugin._applyAttributesAfterFetch(span, options, response);
              if (response.status >= 200 && response.status < 400) {
                plugin._endSpan(span, spanData, response);
              } else {
                plugin._endSpan(span, spanData, {
                  status: response.status,
                  statusText: response.statusText,
                  url
                });
              }
            }
            function onSuccess(span, resolve, response) {
              try {
                var resClone = response.clone();
                var resClone4Hook_1 = response.clone();
                var body = resClone.body;
                if (body) {
                  var reader_1 = body.getReader();
                  var read_1 = function() {
                    reader_1.read().then(function(_a2) {
                      var done = _a2.done;
                      if (done) {
                        endSpanOnSuccess(span, resClone4Hook_1);
                      } else {
                        read_1();
                      }
                    }, function(error) {
                      endSpanOnError(span, error);
                    });
                  };
                  read_1();
                } else {
                  endSpanOnSuccess(span, response);
                }
              } finally {
                resolve(response);
              }
            }
            function onError(span, reject, error) {
              try {
                endSpanOnError(span, error);
              } finally {
                reject(error);
              }
            }
            return new Promise(function(resolve, reject) {
              return context.with(trace.setSpan(context.active(), createdSpan), function() {
                plugin._addHeaders(options, url);
                plugin._tasksCount++;
                return original.apply(self2, options instanceof Request ? [options] : [url, options]).then(onSuccess.bind(self2, createdSpan, resolve), onError.bind(self2, createdSpan, reject));
              });
            });
          };
        };
      };
      FetchInstrumentation2.prototype._applyAttributesAfterFetch = function(span, request, result) {
        var _this = this;
        var applyCustomAttributesOnSpan = this.getConfig().applyCustomAttributesOnSpan;
        if (applyCustomAttributesOnSpan) {
          safeExecuteInTheMiddle(function() {
            return applyCustomAttributesOnSpan(span, request, result);
          }, function(error) {
            if (!error) {
              return;
            }
            _this._diag.error("applyCustomAttributesOnSpan", error);
          });
        }
      };
      FetchInstrumentation2.prototype._prepareSpanData = function(spanUrl) {
        var startTime = hrTime();
        var entries = [];
        if (typeof PerformanceObserver !== "function") {
          return { entries, startTime, spanUrl };
        }
        var observer = new PerformanceObserver(function(list) {
          var perfObsEntries = list.getEntries();
          perfObsEntries.forEach(function(entry) {
            if (entry.initiatorType === "fetch" && entry.name === spanUrl) {
              entries.push(entry);
            }
          });
        });
        observer.observe({
          entryTypes: ["resource"]
        });
        return { entries, observer, startTime, spanUrl };
      };
      FetchInstrumentation2.prototype.enable = function() {
        if (isNode) {
          this._diag.warn("this instrumentation is intended for web usage only, it does not instrument Node.js's fetch()");
          return;
        }
        if (isWrapped(fetch)) {
          this._unwrap(_globalThis$1, "fetch");
          this._diag.debug("removing previous patch for constructor");
        }
        this._wrap(_globalThis$1, "fetch", this._patchConstructor());
      };
      FetchInstrumentation2.prototype.disable = function() {
        if (isNode) {
          return;
        }
        this._unwrap(_globalThis$1, "fetch");
        this._usedResources = /* @__PURE__ */ new WeakSet();
      };
      return FetchInstrumentation2;
    }(InstrumentationBase)
  );
  var TMP_HTTP_METHOD = "http.method";
  var TMP_HTTP_URL = "http.url";
  var TMP_HTTP_HOST = "http.host";
  var TMP_HTTP_SCHEME = "http.scheme";
  var TMP_HTTP_STATUS_CODE = "http.status_code";
  var TMP_HTTP_USER_AGENT = "http.user_agent";
  var TMP_HTTP_RESPONSE_CONTENT_LENGTH = "http.response_content_length";
  var TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = "http.response_content_length_uncompressed";
  var SEMATTRS_HTTP_METHOD = TMP_HTTP_METHOD;
  var SEMATTRS_HTTP_URL = TMP_HTTP_URL;
  var SEMATTRS_HTTP_HOST = TMP_HTTP_HOST;
  var SEMATTRS_HTTP_SCHEME = TMP_HTTP_SCHEME;
  var SEMATTRS_HTTP_STATUS_CODE = TMP_HTTP_STATUS_CODE;
  var SEMATTRS_HTTP_USER_AGENT = TMP_HTTP_USER_AGENT;
  var SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH = TMP_HTTP_RESPONSE_CONTENT_LENGTH;
  var SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED = TMP_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED;
  var PerformanceTimingNames;
  (function(PerformanceTimingNames2) {
    PerformanceTimingNames2["CONNECT_END"] = "connectEnd";
    PerformanceTimingNames2["CONNECT_START"] = "connectStart";
    PerformanceTimingNames2["DECODED_BODY_SIZE"] = "decodedBodySize";
    PerformanceTimingNames2["DOM_COMPLETE"] = "domComplete";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_END"] = "domContentLoadedEventEnd";
    PerformanceTimingNames2["DOM_CONTENT_LOADED_EVENT_START"] = "domContentLoadedEventStart";
    PerformanceTimingNames2["DOM_INTERACTIVE"] = "domInteractive";
    PerformanceTimingNames2["DOMAIN_LOOKUP_END"] = "domainLookupEnd";
    PerformanceTimingNames2["DOMAIN_LOOKUP_START"] = "domainLookupStart";
    PerformanceTimingNames2["ENCODED_BODY_SIZE"] = "encodedBodySize";
    PerformanceTimingNames2["FETCH_START"] = "fetchStart";
    PerformanceTimingNames2["LOAD_EVENT_END"] = "loadEventEnd";
    PerformanceTimingNames2["LOAD_EVENT_START"] = "loadEventStart";
    PerformanceTimingNames2["NAVIGATION_START"] = "navigationStart";
    PerformanceTimingNames2["REDIRECT_END"] = "redirectEnd";
    PerformanceTimingNames2["REDIRECT_START"] = "redirectStart";
    PerformanceTimingNames2["REQUEST_START"] = "requestStart";
    PerformanceTimingNames2["RESPONSE_END"] = "responseEnd";
    PerformanceTimingNames2["RESPONSE_START"] = "responseStart";
    PerformanceTimingNames2["SECURE_CONNECTION_START"] = "secureConnectionStart";
    PerformanceTimingNames2["UNLOAD_EVENT_END"] = "unloadEventEnd";
    PerformanceTimingNames2["UNLOAD_EVENT_START"] = "unloadEventStart";
  })(PerformanceTimingNames || (PerformanceTimingNames = {}));
  var urlNormalizingAnchor;
  function getUrlNormalizingAnchor() {
    if (!urlNormalizingAnchor) {
      urlNormalizingAnchor = document.createElement("a");
    }
    return urlNormalizingAnchor;
  }
  function hasKey(obj, key) {
    return key in obj;
  }
  function addSpanNetworkEvent(span, performanceName, entries, refPerfName) {
    var perfTime = void 0;
    var refTime = void 0;
    if (hasKey(entries, performanceName) && typeof entries[performanceName] === "number") {
      perfTime = entries[performanceName];
    }
    var refName = PerformanceTimingNames.FETCH_START;
    if (hasKey(entries, refName) && typeof entries[refName] === "number") {
      refTime = entries[refName];
    }
    if (perfTime !== void 0 && refTime !== void 0 && perfTime >= refTime) {
      span.addEvent(performanceName, perfTime);
      return span;
    }
    return void 0;
  }
  function addSpanNetworkEvents(span, resource) {
    addSpanNetworkEvent(span, PerformanceTimingNames.FETCH_START, resource);
    addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_START, resource);
    addSpanNetworkEvent(span, PerformanceTimingNames.DOMAIN_LOOKUP_END, resource);
    addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_START, resource);
    if (hasKey(resource, "name") && resource["name"].startsWith("https:")) {
      addSpanNetworkEvent(span, PerformanceTimingNames.SECURE_CONNECTION_START, resource);
    }
    addSpanNetworkEvent(span, PerformanceTimingNames.CONNECT_END, resource);
    addSpanNetworkEvent(span, PerformanceTimingNames.REQUEST_START, resource);
    addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_START, resource);
    addSpanNetworkEvent(span, PerformanceTimingNames.RESPONSE_END, resource);
    var encodedLength = resource[PerformanceTimingNames.ENCODED_BODY_SIZE];
    if (encodedLength !== void 0) {
      span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH, encodedLength);
    }
    var decodedLength = resource[PerformanceTimingNames.DECODED_BODY_SIZE];
    if (decodedLength !== void 0 && encodedLength !== decodedLength) {
      span.setAttribute(SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED, decodedLength);
    }
  }
  function sortResources(filteredResources) {
    return filteredResources.slice().sort(function(a, b) {
      var valueA = a[PerformanceTimingNames.FETCH_START];
      var valueB = b[PerformanceTimingNames.FETCH_START];
      if (valueA > valueB) {
        return 1;
      } else if (valueA < valueB) {
        return -1;
      }
      return 0;
    });
  }
  function getOrigin() {
    return typeof location !== "undefined" ? location.origin : void 0;
  }
  function getResource(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
    if (ignoredResources === void 0) {
      ignoredResources = /* @__PURE__ */ new WeakSet();
    }
    var parsedSpanUrl = parseUrl(spanUrl);
    spanUrl = parsedSpanUrl.toString();
    var filteredResources = filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources);
    if (filteredResources.length === 0) {
      return {
        mainRequest: void 0
      };
    }
    if (filteredResources.length === 1) {
      return {
        mainRequest: filteredResources[0]
      };
    }
    var sorted = sortResources(filteredResources);
    if (parsedSpanUrl.origin !== getOrigin() && sorted.length > 1) {
      var corsPreFlightRequest = sorted[0];
      var mainRequest = findMainRequest(sorted, corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END], endTimeHR);
      var responseEnd = corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END];
      var fetchStart = mainRequest[PerformanceTimingNames.FETCH_START];
      if (fetchStart < responseEnd) {
        mainRequest = corsPreFlightRequest;
        corsPreFlightRequest = void 0;
      }
      return {
        corsPreFlightRequest,
        mainRequest
      };
    } else {
      return {
        mainRequest: filteredResources[0]
      };
    }
  }
  function findMainRequest(resources, corsPreFlightRequestEndTime, spanEndTimeHR) {
    var spanEndTime = hrTimeToNanoseconds(spanEndTimeHR);
    var minTime = hrTimeToNanoseconds(timeInputToHrTime(corsPreFlightRequestEndTime));
    var mainRequest = resources[1];
    var bestGap;
    var length = resources.length;
    for (var i = 1; i < length; i++) {
      var resource = resources[i];
      var resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START]));
      var resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END]));
      var currentGap = spanEndTime - resourceEndTime;
      if (resourceStartTime >= minTime && (!bestGap || currentGap < bestGap)) {
        bestGap = currentGap;
        mainRequest = resource;
      }
    }
    return mainRequest;
  }
  function filterResourcesForSpan(spanUrl, startTimeHR, endTimeHR, resources, ignoredResources, initiatorType) {
    var startTime = hrTimeToNanoseconds(startTimeHR);
    var endTime = hrTimeToNanoseconds(endTimeHR);
    var filteredResources = resources.filter(function(resource) {
      var resourceStartTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.FETCH_START]));
      var resourceEndTime = hrTimeToNanoseconds(timeInputToHrTime(resource[PerformanceTimingNames.RESPONSE_END]));
      return resource.initiatorType.toLowerCase() === "xmlhttprequest" && resource.name === spanUrl && resourceStartTime >= startTime && resourceEndTime <= endTime;
    });
    if (filteredResources.length > 0) {
      filteredResources = filteredResources.filter(function(resource) {
        return !ignoredResources.has(resource);
      });
    }
    return filteredResources;
  }
  function parseUrl(url) {
    if (typeof URL === "function") {
      return new URL(url, typeof document !== "undefined" ? document.baseURI : typeof location !== "undefined" ? location.href : void 0);
    }
    var element = getUrlNormalizingAnchor();
    element.href = url;
    return element;
  }
  function shouldPropagateTraceHeaders(spanUrl, propagateTraceHeaderCorsUrls) {
    var propagateTraceHeaderUrls = propagateTraceHeaderCorsUrls || [];
    if (typeof propagateTraceHeaderUrls === "string" || propagateTraceHeaderUrls instanceof RegExp) {
      propagateTraceHeaderUrls = [propagateTraceHeaderUrls];
    }
    var parsedSpanUrl = parseUrl(spanUrl);
    if (parsedSpanUrl.origin === getOrigin()) {
      return true;
    } else {
      return propagateTraceHeaderUrls.some(function(propagateTraceHeaderUrl) {
        return urlMatches(spanUrl, propagateTraceHeaderUrl);
      });
    }
  }
  var EventNames;
  (function(EventNames2) {
    EventNames2["METHOD_OPEN"] = "open";
    EventNames2["METHOD_SEND"] = "send";
    EventNames2["EVENT_ABORT"] = "abort";
    EventNames2["EVENT_ERROR"] = "error";
    EventNames2["EVENT_LOAD"] = "loaded";
    EventNames2["EVENT_TIMEOUT"] = "timeout";
  })(EventNames || (EventNames = {}));
  var VERSION = "0.53.0";
  var AttributeNames;
  (function(AttributeNames2) {
    AttributeNames2["HTTP_STATUS_TEXT"] = "http.status_text";
  })(AttributeNames || (AttributeNames = {}));
  var __extends = /* @__PURE__ */ function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  }();
  var OBSERVER_WAIT_TIME_MS = 300;
  var XMLHttpRequestInstrumentation = (
    /** @class */
    function(_super) {
      __extends(XMLHttpRequestInstrumentation2, _super);
      function XMLHttpRequestInstrumentation2(config) {
        if (config === void 0) {
          config = {};
        }
        var _this = _super.call(this, "@opentelemetry/instrumentation-xml-http-request", VERSION, config) || this;
        _this.component = "xml-http-request";
        _this.version = VERSION;
        _this.moduleName = _this.component;
        _this._tasksCount = 0;
        _this._xhrMem = /* @__PURE__ */ new WeakMap();
        _this._usedResources = /* @__PURE__ */ new WeakSet();
        return _this;
      }
      XMLHttpRequestInstrumentation2.prototype.init = function() {
      };
      XMLHttpRequestInstrumentation2.prototype._addHeaders = function(xhr, spanUrl) {
        var url = parseUrl(spanUrl).href;
        if (!shouldPropagateTraceHeaders(url, this.getConfig().propagateTraceHeaderCorsUrls)) {
          var headers_1 = {};
          propagation.inject(context.active(), headers_1);
          if (Object.keys(headers_1).length > 0) {
            this._diag.debug("headers inject skipped due to CORS policy");
          }
          return;
        }
        var headers = {};
        propagation.inject(context.active(), headers);
        Object.keys(headers).forEach(function(key) {
          xhr.setRequestHeader(key, String(headers[key]));
        });
      };
      XMLHttpRequestInstrumentation2.prototype._addChildSpan = function(span, corsPreFlightRequest) {
        var _this = this;
        context.with(trace.setSpan(context.active(), span), function() {
          var childSpan = _this.tracer.startSpan("CORS Preflight", {
            startTime: corsPreFlightRequest[PerformanceTimingNames.FETCH_START]
          });
          if (!_this.getConfig().ignoreNetworkEvents) {
            addSpanNetworkEvents(childSpan, corsPreFlightRequest);
          }
          childSpan.end(corsPreFlightRequest[PerformanceTimingNames.RESPONSE_END]);
        });
      };
      XMLHttpRequestInstrumentation2.prototype._addFinalSpanAttributes = function(span, xhrMem, spanUrl) {
        if (typeof spanUrl === "string") {
          var parsedUrl = parseUrl(spanUrl);
          if (xhrMem.status !== void 0) {
            span.setAttribute(SEMATTRS_HTTP_STATUS_CODE, xhrMem.status);
          }
          if (xhrMem.statusText !== void 0) {
            span.setAttribute(AttributeNames.HTTP_STATUS_TEXT, xhrMem.statusText);
          }
          span.setAttribute(SEMATTRS_HTTP_HOST, parsedUrl.host);
          span.setAttribute(SEMATTRS_HTTP_SCHEME, parsedUrl.protocol.replace(":", ""));
          span.setAttribute(SEMATTRS_HTTP_USER_AGENT, navigator.userAgent);
        }
      };
      XMLHttpRequestInstrumentation2.prototype._applyAttributesAfterXHR = function(span, xhr) {
        var _this = this;
        var applyCustomAttributesOnSpan = this.getConfig().applyCustomAttributesOnSpan;
        if (typeof applyCustomAttributesOnSpan === "function") {
          safeExecuteInTheMiddle(function() {
            return applyCustomAttributesOnSpan(span, xhr);
          }, function(error) {
            if (!error) {
              return;
            }
            _this._diag.error("applyCustomAttributesOnSpan", error);
          });
        }
      };
      XMLHttpRequestInstrumentation2.prototype._addResourceObserver = function(xhr, spanUrl) {
        var xhrMem = this._xhrMem.get(xhr);
        if (!xhrMem || typeof PerformanceObserver !== "function" || typeof PerformanceResourceTiming !== "function") {
          return;
        }
        xhrMem.createdResources = {
          observer: new PerformanceObserver(function(list) {
            var entries = list.getEntries();
            var parsedUrl = parseUrl(spanUrl);
            entries.forEach(function(entry) {
              if (entry.initiatorType === "xmlhttprequest" && entry.name === parsedUrl.href) {
                if (xhrMem.createdResources) {
                  xhrMem.createdResources.entries.push(entry);
                }
              }
            });
          }),
          entries: []
        };
        xhrMem.createdResources.observer.observe({
          entryTypes: ["resource"]
        });
      };
      XMLHttpRequestInstrumentation2.prototype._clearResources = function() {
        if (this._tasksCount === 0 && this.getConfig().clearTimingResources) {
          otperformance.clearResourceTimings();
          this._xhrMem = /* @__PURE__ */ new WeakMap();
          this._usedResources = /* @__PURE__ */ new WeakSet();
        }
      };
      XMLHttpRequestInstrumentation2.prototype._findResourceAndAddNetworkEvents = function(xhrMem, span, spanUrl, startTime, endTime) {
        if (!spanUrl || !startTime || !endTime || !xhrMem.createdResources) {
          return;
        }
        var resources = xhrMem.createdResources.entries;
        if (!resources || !resources.length) {
          resources = otperformance.getEntriesByType("resource");
        }
        var resource = getResource(parseUrl(spanUrl).href, startTime, endTime, resources, this._usedResources);
        if (resource.mainRequest) {
          var mainRequest = resource.mainRequest;
          this._markResourceAsUsed(mainRequest);
          var corsPreFlightRequest = resource.corsPreFlightRequest;
          if (corsPreFlightRequest) {
            this._addChildSpan(span, corsPreFlightRequest);
            this._markResourceAsUsed(corsPreFlightRequest);
          }
          if (!this.getConfig().ignoreNetworkEvents) {
            addSpanNetworkEvents(span, mainRequest);
          }
        }
      };
      XMLHttpRequestInstrumentation2.prototype._cleanPreviousSpanInformation = function(xhr) {
        var xhrMem = this._xhrMem.get(xhr);
        if (xhrMem) {
          var callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
          if (callbackToRemoveEvents) {
            callbackToRemoveEvents();
          }
          this._xhrMem.delete(xhr);
        }
      };
      XMLHttpRequestInstrumentation2.prototype._createSpan = function(xhr, url, method) {
        var _a2;
        if (isUrlIgnored(url, this.getConfig().ignoreUrls)) {
          this._diag.debug("ignoring span as url matches ignored url");
          return;
        }
        var spanName = method.toUpperCase();
        var currentSpan = this.tracer.startSpan(spanName, {
          kind: SpanKind.CLIENT,
          attributes: (_a2 = {}, _a2[SEMATTRS_HTTP_METHOD] = method, _a2[SEMATTRS_HTTP_URL] = parseUrl(url).toString(), _a2)
        });
        currentSpan.addEvent(EventNames.METHOD_OPEN);
        this._cleanPreviousSpanInformation(xhr);
        this._xhrMem.set(xhr, {
          span: currentSpan,
          spanUrl: url
        });
        return currentSpan;
      };
      XMLHttpRequestInstrumentation2.prototype._markResourceAsUsed = function(resource) {
        this._usedResources.add(resource);
      };
      XMLHttpRequestInstrumentation2.prototype._patchOpen = function() {
        var _this = this;
        return function(original) {
          var plugin = _this;
          return function patchOpen() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            var method = args[0];
            var url = args[1];
            plugin._createSpan(this, url, method);
            return original.apply(this, args);
          };
        };
      };
      XMLHttpRequestInstrumentation2.prototype._patchSend = function() {
        var plugin = this;
        function endSpanTimeout(eventName, xhrMem, performanceEndTime, endTime) {
          var callbackToRemoveEvents = xhrMem.callbackToRemoveEvents;
          if (typeof callbackToRemoveEvents === "function") {
            callbackToRemoveEvents();
          }
          var span = xhrMem.span, spanUrl = xhrMem.spanUrl, sendStartTime = xhrMem.sendStartTime;
          if (span) {
            plugin._findResourceAndAddNetworkEvents(xhrMem, span, spanUrl, sendStartTime, performanceEndTime);
            span.addEvent(eventName, endTime);
            plugin._addFinalSpanAttributes(span, xhrMem, spanUrl);
            span.end(endTime);
            plugin._tasksCount--;
          }
          plugin._clearResources();
        }
        function endSpan(eventName, xhr) {
          var xhrMem = plugin._xhrMem.get(xhr);
          if (!xhrMem) {
            return;
          }
          xhrMem.status = xhr.status;
          xhrMem.statusText = xhr.statusText;
          plugin._xhrMem.delete(xhr);
          if (xhrMem.span) {
            plugin._applyAttributesAfterXHR(xhrMem.span, xhr);
          }
          var performanceEndTime = hrTime();
          var endTime = Date.now();
          setTimeout(function() {
            endSpanTimeout(eventName, xhrMem, performanceEndTime, endTime);
          }, OBSERVER_WAIT_TIME_MS);
        }
        function onError() {
          endSpan(EventNames.EVENT_ERROR, this);
        }
        function onAbort() {
          endSpan(EventNames.EVENT_ABORT, this);
        }
        function onTimeout() {
          endSpan(EventNames.EVENT_TIMEOUT, this);
        }
        function onLoad() {
          if (this.status < 299) {
            endSpan(EventNames.EVENT_LOAD, this);
          } else {
            endSpan(EventNames.EVENT_ERROR, this);
          }
        }
        function unregister(xhr) {
          xhr.removeEventListener("abort", onAbort);
          xhr.removeEventListener("error", onError);
          xhr.removeEventListener("load", onLoad);
          xhr.removeEventListener("timeout", onTimeout);
          var xhrMem = plugin._xhrMem.get(xhr);
          if (xhrMem) {
            xhrMem.callbackToRemoveEvents = void 0;
          }
        }
        return function(original) {
          return function patchSend() {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments[_i];
            }
            var xhrMem = plugin._xhrMem.get(this);
            if (!xhrMem) {
              return original.apply(this, args);
            }
            var currentSpan = xhrMem.span;
            var spanUrl = xhrMem.spanUrl;
            if (currentSpan && spanUrl) {
              context.with(trace.setSpan(context.active(), currentSpan), function() {
                plugin._tasksCount++;
                xhrMem.sendStartTime = hrTime();
                currentSpan.addEvent(EventNames.METHOD_SEND);
                _this.addEventListener("abort", onAbort);
                _this.addEventListener("error", onError);
                _this.addEventListener("load", onLoad);
                _this.addEventListener("timeout", onTimeout);
                xhrMem.callbackToRemoveEvents = function() {
                  unregister(_this);
                  if (xhrMem.createdResources) {
                    xhrMem.createdResources.observer.disconnect();
                  }
                };
                plugin._addHeaders(_this, spanUrl);
                plugin._addResourceObserver(_this, spanUrl);
              });
            }
            return original.apply(this, args);
          };
        };
      };
      XMLHttpRequestInstrumentation2.prototype.enable = function() {
        this._diag.debug("applying patch to", this.moduleName, this.version);
        if (isWrapped(XMLHttpRequest.prototype.open)) {
          this._unwrap(XMLHttpRequest.prototype, "open");
          this._diag.debug("removing previous patch from method open");
        }
        if (isWrapped(XMLHttpRequest.prototype.send)) {
          this._unwrap(XMLHttpRequest.prototype, "send");
          this._diag.debug("removing previous patch from method send");
        }
        this._wrap(XMLHttpRequest.prototype, "open", this._patchOpen());
        this._wrap(XMLHttpRequest.prototype, "send", this._patchSend());
      };
      XMLHttpRequestInstrumentation2.prototype.disable = function() {
        this._diag.debug("removing patch from", this.moduleName, this.version);
        this._unwrap(XMLHttpRequest.prototype, "open");
        this._unwrap(XMLHttpRequest.prototype, "send");
        this._tasksCount = 0;
        this._xhrMem = /* @__PURE__ */ new WeakMap();
        this._usedResources = /* @__PURE__ */ new WeakSet();
      };
      return XMLHttpRequestInstrumentation2;
    }(InstrumentationBase)
  );
  function getIgnoredUrls(endpoint) {
    return [endpoint, `${endpoint}/v1/traces`, `${endpoint}/v1/metrics`];
  }
  function registerAutoInstrumentations(provider, config) {
    const instrumentations = [];
    if (config.trackPageViews) {
      instrumentations.push(
        new DocumentLoadInstrumentation({
          applyCustomAttributesOnSpan: {
            documentLoad: (span) => {
              span.setAttribute("page.url", window.location.href);
              span.setAttribute("page.path", window.location.pathname);
              span.setAttribute("page.title", document.title);
            },
            documentFetch: () => {
            },
            resourceFetch: () => {
            }
          }
        })
      );
      logger$1.debug("Instrumentación DocumentLoad registrada");
    }
    if (config.trackFetch) {
      instrumentations.push(
        new FetchInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/],
          clearTimingResources: true,
          ignoreUrls: getIgnoredUrls(config.endpoint),
          applyCustomAttributesOnSpan: (span, request, result) => {
            if (result instanceof Response) {
              span.setAttribute(
                "http.response_content_length",
                parseInt(result.headers.get("content-length") ?? "0") || 0
              );
            }
            span.setAttribute("atlascore.instrumentation", "fetch");
          }
        })
      );
      logger$1.debug("Instrumentación Fetch registrada");
    }
    if (config.trackXHR) {
      instrumentations.push(
        new XMLHttpRequestInstrumentation({
          propagateTraceHeaderCorsUrls: [/.*/],
          ignoreUrls: getIgnoredUrls(config.endpoint)
        })
      );
      logger$1.debug("Instrumentación XMLHttpRequest registrada");
    }
    registerInstrumentations({
      instrumentations,
      tracerProvider: provider
    });
    logger$1.info(
      `${instrumentations.length} instrumentaciones automáticas activas`
    );
  }
  const TRACER_NAME = "@atlascore/web-sdk";
  function setupErrorTracking(config) {
    if (!config.trackErrors) {
      return () => {
      };
    }
    const tracer = trace.getTracer(TRACER_NAME);
    const sessionAttrs = getSessionAttributes();
    const errorHandler = (event) => {
      const span = tracer.startSpan("browser.error");
      span.setAttributes({
        ...sessionAttrs,
        "error.type": "javascript_error",
        "error.message": event.message,
        "error.filename": event.filename,
        "error.lineno": event.lineno,
        "error.colno": event.colno,
        "page.url": window.location.href,
        "page.path": window.location.pathname
      });
      if (event.error instanceof Error) {
        span.setAttributes({
          "error.stack": event.error.stack ?? "",
          "error.name": event.error.name
        });
      }
      span.setStatus({ code: SpanStatusCode.ERROR, message: event.message });
      span.end();
      logger$1.debug("Error capturado:", event.message);
    };
    const rejectionHandler = (event) => {
      const span = tracer.startSpan("browser.unhandled_rejection");
      const reason = event.reason;
      const message = reason instanceof Error ? reason.message : String(reason);
      span.setAttributes({
        ...sessionAttrs,
        "error.type": "unhandled_rejection",
        "error.message": message,
        "page.url": window.location.href,
        "page.path": window.location.pathname
      });
      if (reason instanceof Error) {
        span.setAttributes({
          "error.stack": reason.stack ?? "",
          "error.name": reason.name
        });
      }
      span.setStatus({ code: SpanStatusCode.ERROR, message });
      span.end();
      logger$1.debug("Promise rejection capturada:", message);
    };
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    logger$1.info("Error tracking activo");
    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }
  let _initialized = false;
  let _provider = null;
  let _cleanupErrors = null;
  const AtlasCore = {
    /**
     * Inicializa el SDK con la configuración del usuario.
     * Debe llamarse una sola vez, lo antes posible (idealmente en el <head>).
     *
     * @param config - Configuración del SDK
     */
    init(config) {
      if (_initialized) {
        logger$1.warn(
          "AtlasCore.init() fue llamado más de una vez. Ignorando llamada duplicada."
        );
        return;
      }
      const resolved = resolveConfig(config);
      logger$1.init(resolved.debug);
      logger$1.info("Inicializando AtlasCore Web SDK...", {
        application: resolved.application,
        environment: resolved.environment,
        endpoint: resolved.endpoint
      });
      const resource = buildResource(resolved);
      _provider = createTraceProvider(resolved, resource);
      _provider.register();
      registerAutoInstrumentations(_provider, resolved);
      _cleanupErrors = setupErrorTracking(resolved);
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          void _provider?.forceFlush?.();
          logger$1.debug("Flush enviado (visibilitychange)");
        }
      });
      _initialized = true;
      logger$1.info("✓ AtlasCore Web SDK listo");
    },
    /**
     * Retorna el tracer de OTel para uso manual (spans custom).
     * Solo disponible después de init().
     *
     * @param name - Nombre del tracer (ej: "mi-componente")
     */
    getTracer(name = "@atlascore/web-sdk") {
      if (!_initialized) {
        logger$1.warn("AtlasCore.getTracer() llamado antes de init()");
      }
      return trace.getTracer(name);
    },
    /**
     * Indica si el SDK fue inicializado.
     */
    get isInitialized() {
      return _initialized;
    },
    /**
     * Fuerza el envío de todos los spans pendientes.
     * Útil antes de navegar fuera de la SPA o hacer logout.
     */
    async flush() {
      if (_provider) {
        await _provider.forceFlush?.();
        logger$1.debug("Flush manual completado");
      }
    },
    /**
     * Detiene el SDK y libera recursos.
     * Normalmente no hace falta llamarlo; es útil para tests.
     */
    async shutdown() {
      if (_cleanupErrors) {
        _cleanupErrors();
        _cleanupErrors = null;
      }
      if (_provider) {
        await _provider.shutdown();
        _provider = null;
      }
      _initialized = false;
      logger$1.info("AtlasCore Web SDK detenido");
    }
  };
  exports2.AtlasCore = AtlasCore;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
});
//# sourceMappingURL=atlascore-web-sdk.umd.js.map

/**
* @vue/shared v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/
// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}

const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$1 = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$1.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject(val) || isFunction(val)) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
const toNumber = (val) => {
  const n = isString(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};

function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /"(?:[^"\\]|\\[^])*"|'(?:[^'\\]|\\[^])*'|\\[^]|\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, (match) => match.startsWith("/*") ? "" : match).split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}

const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,playsinline,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}

function looseCompareArrays(a, b, seen) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i], seen);
  }
  return equal;
}
function looseCompareCollections(a, b, seen) {
  if (a.size !== b.size) return false;
  const candidates = Array.from(b);
  const matched = new Uint8Array(candidates.length);
  for (const item of a) {
    let index = -1;
    for (let i = 0; i < candidates.length; i++) {
      if (!matched[i] && looseEqual(item, candidates[i], seen)) {
        index = i;
        break;
      }
    }
    if (index < 0) return false;
    matched[index] = 1;
  }
  return true;
}
function looseCompareObjects(a, b, seen) {
  let aValidType = isMap(a);
  let bValidType = isMap(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
  }
  aValidType = isSet(a);
  bValidType = isSet(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareCollections(a, b, seen) : false;
  }
  const aKeysCount = Object.keys(a).length;
  const bKeysCount = Object.keys(b).length;
  if (aKeysCount !== bKeysCount) {
    return false;
  }
  for (const key in a) {
    const aHasKey = a.hasOwnProperty(key);
    const bHasKey = b.hasOwnProperty(key);
    if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key], seen)) {
      return false;
    }
  }
  return String(a) === String(b);
}
function looseCompareNested(a, b, seen, compare) {
  if (!seen) {
    seen = [/* @__PURE__ */ new Map(), /* @__PURE__ */ new Map()];
  }
  const [seenA, seenB] = seen;
  if (seenA.has(a) || seenB.has(b)) {
    return seenA.get(a) === b && seenB.get(b) === a;
  }
  seenA.set(a, b);
  seenB.set(b, a);
  const equal = compare(a, b, seen);
  seenA.delete(a);
  seenB.delete(b);
  return equal;
}
function looseEqual(a, b, seen) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareNested(a, b, seen, looseCompareArrays) : false;
  }
  aValidType = isObject(a);
  bValidType = isObject(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    return looseCompareNested(a, b, seen, looseCompareObjects);
  }
  return String(a) === String(b);
}

const isRef$1 = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject(val) && (val.toString === objectToString || !isFunction(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (isRef$1(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol(val)) {
    return stringifySymbol(val);
  } else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
};

/**
* @vue/reactivity v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    /**
     * @internal
     */
    this._active = true;
    /**
     * @internal track `on` calls, allow `on` call multiple times
     */
    this._on = 0;
    /**
     * @internal
     */
    this.effects = [];
    /**
     * @internal
     */
    this.cleanups = [];
    this._isPaused = false;
    this._warnOnRun = true;
    this.__v_skip = true;
    if (!detached && activeEffectScope) {
      if (activeEffectScope.active) {
        this.parent = activeEffectScope;
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      } else {
        this._active = false;
        this._warnOnRun = false;
      }
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          const scopes = this.scopes.slice();
          for (i = 0, l = scopes.length; i < l; i++) {
            scopes[i].resume();
          }
        }
        const effects = this.effects.slice();
        for (i = 0, l = effects.length; i < l; i++) {
          effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (activeEffectScope === this) {
        activeEffectScope = this.prevScope;
      } else {
        let current = activeEffectScope;
        while (current) {
          if (current.prevScope === this) {
            current.prevScope = this.prevScope;
            break;
          }
          current = current.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        const scopes = this.scopes.slice();
        for (i = 0, l = scopes.length; i < l; i++) {
          scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function getCurrentScope() {
  return activeEffectScope;
}

let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    /**
     * @internal
     */
    this.deps = void 0;
    /**
     * @internal
     */
    this.depsTail = void 0;
    /**
     * @internal
     */
    this.flags = 1 | 4;
    /**
     * @internal
     */
    this.next = void 0;
    /**
     * @internal
     */
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed) {
  if (computed.flags & 4 && !(computed.flags & 16)) {
    return;
  }
  computed.flags &= -17;
  if (computed.globalVersion === globalVersion) {
    return;
  }
  computed.globalVersion = globalVersion;
  if (!computed.isSSR && computed.flags & 128 && (!computed.deps && !computed._dirty || !isDirty(computed))) {
    return;
  }
  computed.flags |= 2;
  const dep = computed.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed;
  shouldTrack = true;
  try {
    prepareDeps(computed);
    const value = computed.fn(computed._value);
    if (dep.version === 0 || hasChanged(value, computed._value)) {
      computed.flags |= 128;
      computed._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed);
    computed.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}

let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed) {
    this.computed = computed;
    this.version = 0;
    /**
     * Link between this dep and the current active effect
     */
    this.activeLink = void 0;
    /**
     * Doubly linked list representing the subscribing effects (tail)
     */
    this.subs = void 0;
    /**
     * For object property deps cleanup
     */
    this.map = void 0;
    this.key = void 0;
    /**
     * Subscriber counter
     */
    this.sc = 0;
    /**
     * @internal
     */
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (!!("production" !== "production")) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed = link.dep.computed;
    if (computed && !link.dep.subs) {
      computed.flags |= 4 | 16;
      for (let l = computed.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}

function reactiveReadArray(array) {
  const raw = toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  if (isShallow(array)) return raw;
  if (!isReadonly(array)) return raw.map(toReactive);
  return isReactive(array) ? raw.map((item) => toReadonly(toReactive(item))) : raw.map(toReadonly);
}
function shallowReadArray(arr) {
  track(arr = toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (isReadonly(target)) {
    return isReactive(target) ? toReadonly(toReactive(item)) : toReadonly(item);
  }
  return toReactive(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self, method, wrapValue) {
  const arr = shallowReadArray(self);
  const methodFn = arr[method];
  const iter = methodFn.call(arr);
  if (arr !== self && !isShallow(self)) {
    if (iter[Symbol.toStringTag] === "Array Iterator") {
      const wrapped = Object.create(Object.getPrototypeOf(iter));
      wrapped.next = () => wrapResult(iter.next(), wrapValue);
      if (methodFn !== arrayProto[method]) {
        Object.defineProperties(wrapped, {
          return: {
            get() {
              const fn = iter.return;
              return typeof fn === "function" ? fn.bind(iter) : fn;
            }
          },
          throw: {
            get() {
              const fn = iter.throw;
              return typeof fn === "function" ? fn.bind(iter) : fn;
            }
          }
        });
      }
      return wrapped;
    }
    iter._next = iter.next;
    iter.next = () => wrapResult(iter._next(), wrapValue);
  }
  return iter;
}
function wrapResult(result, wrapValue) {
  if (!result.done) {
    result.value = wrapValue(result.value);
  }
  return result;
}
const arrayProto = Array.prototype;
function apply(self, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self);
  const needsWrap = arr !== self && !isShallow(self);
  const methodFn = arr[method];
  if (methodFn !== arrayProto[method]) {
    const result2 = methodFn.apply(self, args);
    return needsWrap ? toReactive(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self, item), index, self);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self, method, fn, args) {
  const arr = shallowReadArray(self);
  const needsWrap = arr !== self && !isShallow(self);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self, acc);
        }
        return fn.call(this, acc, toWrapped(self, item), index, self);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self, result) : result;
}
function searchProxy(self, method, args) {
  const arr = toRaw(self);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && isProxy(args[0])) {
    args[0] = toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self, method, args = []) {
  pauseTracking();
  startBatch();
  const res = toRaw(self)[method].apply(self, args);
  endBatch();
  resetTracking();
  return res;
}

const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol)
);
function hasOwnProperty(key) {
  if (!isSymbol(key)) key = String(key);
  const obj = toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      isRef(target) ? target : receiver
    );
    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject(value) ? readonly(value) : value;
    }
    if (isObject(res)) {
      return isReadonly2 ? readonly(res) : reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = isReadonly(oldValue);
      if (!isShallow(value) && !isReadonly(value)) {
        oldValue = toRaw(oldValue);
        value = toRaw(value);
      }
      if (!isArrayWithIntegerKey && isRef(oldValue) && !isRef(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      isRef(target) ? target : receiver
    );
    if (target === toRaw(receiver) && result) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly && track(toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = toRaw(target);
      const rawKey = toRaw(key);
      if (!readonly) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = toRaw(target);
      const wrap = shallow ? toShallow : readonly ? toReadonly : toReactive;
      !readonly && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = toRaw(this);
        const proto = getProto(target);
        const rawValue = toRaw(value);
        const valueToAdd = !shallow && !isShallow(value) && !isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !isShallow(value) && !isReadonly(value)) {
          value = toRaw(value);
        }
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = toRaw(this);
        const { has, get } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = toRaw(key);
          hadKey = has.call(target, key);
        }
        get ? get.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0);
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return shallow;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};

const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1 /* COMMON */;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2 /* COLLECTION */;
    default:
      return 0 /* INVALID */;
  }
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  if (target["__v_skip"] || !Object.isExtensible(target)) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const targetType = targetTypeMap(toRawType(target));
  if (targetType === 0 /* INVALID */) {
    return target;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive = (value) => isObject(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject(value) ? /* @__PURE__ */ readonly(value) : value;

// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
  return createRef(value, false);
}
function createRef(rawValue, shallow) {
  if (/* @__PURE__ */ isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : toRaw(value);
    this._value = isShallow2 ? value : toReactive(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || isShallow(newValue) || isReadonly(newValue);
    newValue = useDirectValue ? newValue : toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive(newValue);
      {
        this.dep.trigger();
      }
    }
  }
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}

class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    /**
     * @internal
     */
    this._value = void 0;
    /**
     * @internal
     */
    this.dep = new Dep(this);
    /**
     * @internal
     */
    this.__v_isRef = true;
    // TODO isolatedDeclarations "__v_isReadonly"
    // A computed is also a subscriber that tracks other deps
    /**
     * @internal
     */
    this.deps = void 0;
    /**
     * @internal
     */
    this.depsTail = void 0;
    /**
     * @internal
     */
    this.flags = 16;
    /**
     * @internal
     */
    this.globalVersion = globalVersion - 1;
    /**
     * @internal
     */
    this.next = void 0;
    // for backwards compat
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (isRef(source)) {
    getter = () => source.value;
    forceTrigger = isShallow(source);
  } else if (isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => isReactive(s) || isShallow(s));
    getter = () => source.map((s) => {
      if (isRef(s)) {
        return s.value;
      } else if (isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction(s)) {
        return call ? call(s, 2) : s();
      } else ;
    });
  } else if (isFunction(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      try {
        return _cb(...args);
      } finally {
        watchHandle();
      }
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect.flags & 1) || !effect.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect.run();
      if (immediateFirstRun || deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        const currentWatcher = activeWatcher;
        pauseTracking();
        try {
          if (cleanup) {
            cleanup();
          }
          activeWatcher = effect;
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
          resetTracking();
        }
      }
    } else {
      effect.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect = new ReactiveEffect(getter);
  effect.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect);
  cleanup = effect.onStop = () => {
    const cleanups = cleanupMap.get(effect);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect.run();
  }
  watchHandle.pause = effect.pause.bind(effect);
  watchHandle.resume = effect.resume.bind(effect);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}

/**
* @vue/runtime-core v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys = Object.keys(props);
  keys.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (isRef(value)) {
    value = formatProp(key, toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}

const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p = currentFlushPromise || resolvedPromise;
  return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    for (let i = 0; i < cb.length; i++) {
      pendingPostFlushCbs.push(cb[i]);
    }
  }
  queueFlush();
}
function flushPreFlushCbs(instance, minUid, seen, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid || minUid !== void 0 && !(cb.id >= minUid)) {
        continue;
      }
      queue.splice(i, 1);
      i = instance ? i - 1 : flushIndex;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen, skip, minUid = 0) {
  if (pendingPostFlushCbs.length) {
    let cbs = pendingPostFlushCbs;
    let kept = 0;
    if (skip) {
      cbs = [];
      for (let i = 0; i < pendingPostFlushCbs.length; i++) {
        const cb = pendingPostFlushCbs[i];
        if (cb.i !== void 0 ? !cb.i || cb.i.uid < minUid : skip.has(cb)) {
          pendingPostFlushCbs[kept++] = cb;
        } else {
          cbs.push(cb);
        }
      }
    }
    const deduped = [...new Set(cbs)].sort((a, b) => getId(a) - getId(b));
    pendingPostFlushCbs.length = kept;
    if (activePostFlushCbs) {
      for (let i = 0; i < deduped.length; i++) {
        activePostFlushCbs.push(deduped[i]);
      }
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
let isFlushing = false;
function flushOnAppMount(fn, minUid) {
  if (isFlushing) {
    fn();
    return;
  }
  const queued = minUid === void 0 ? void 0 : new Set(pendingPostFlushCbs);
  fn();
  isFlushing = true;
  try {
    flushPreFlushCbs(void 0, minUid);
    flushPostFlushCbs(void 0, queued, minUid);
  } finally {
    isFlushing = false;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  const check = NOOP;
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (!!("production" !== "production") && check(job)) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}

let devtools$1;
let buffer = [];
let devtoolsNotInstalled = false;
function emit$1(event, ...args) {
  if (devtools$1) {
    devtools$1.emit(event, ...args);
  } else if (!devtoolsNotInstalled) {
    buffer.push({ event, args });
  }
}
function setDevtoolsHook$1(hook, target) {
  var _a, _b;
  devtools$1 = hook;
  if (devtools$1) {
    devtools$1.enabled = true;
    buffer.forEach(({ event, args }) => devtools$1.emit(event, ...args));
    buffer = [];
  } else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== "undefined" && // some envs mock window but not fully
    window.HTMLElement && // also exclude jsdom
    // eslint-disable-next-line no-restricted-syntax
    !((_b = (_a = window.navigator) == null ? void 0 : _a.userAgent) == null ? void 0 : _b.includes("jsdom"))
  ) {
    const replay = target.__VUE_DEVTOOLS_HOOK_REPLAY__ = target.__VUE_DEVTOOLS_HOOK_REPLAY__ || [];
    replay.push((newHook) => {
      setDevtoolsHook$1(newHook, target);
    });
    setTimeout(() => {
      if (!devtools$1) {
        target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
        devtoolsNotInstalled = true;
        buffer = [];
      }
    }, 3e3);
  } else {
    devtoolsNotInstalled = true;
    buffer = [];
  }
}
function devtoolsInitApp(app, version) {
  emit$1("app:init" /* APP_INIT */, app, version, {
    Fragment,
    Text,
    Comment,
    Static
  });
}
function devtoolsUnmountApp(app) {
  emit$1("app:unmount" /* APP_UNMOUNT */, app);
}
const devtoolsComponentAdded = /* @__PURE__ */ createDevtoolsComponentHook("component:added" /* COMPONENT_ADDED */);
const devtoolsComponentUpdated = /* @__PURE__ */ createDevtoolsComponentHook("component:updated" /* COMPONENT_UPDATED */);
const _devtoolsComponentRemoved = /* @__PURE__ */ createDevtoolsComponentHook(
  "component:removed" /* COMPONENT_REMOVED */
);
const devtoolsComponentRemoved = (component) => {
  if (devtools$1 && typeof devtools$1.cleanupBuffer === "function" && // remove the component if it wasn't buffered
  !devtools$1.cleanupBuffer(component)) {
    _devtoolsComponentRemoved(component);
  }
};
// @__NO_SIDE_EFFECTS__
function createDevtoolsComponentHook(hook) {
  return (component) => {
    emit$1(
      hook,
      component.appContext.app,
      component.uid,
      component.parent ? component.parent.uid : void 0,
      component
    );
  };
}
function devtoolsComponentEmit(component, event, params) {
  emit$1(
    "component:emit" /* COMPONENT_EMIT */,
    component.appContext.app,
    component,
    event,
    params
  );
}

let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    const prevStackSize = blockStack.length;
    let res;
    try {
      res = fn(...args);
    } finally {
      for (let i = blockStack.length; i > prevStackSize; i--) closeBlock();
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    if (__VUE_PROD_DEVTOOLS__) {
      devtoolsComponentUpdated(ctx);
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}

function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}

const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      job.i = instance;
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;

const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
const enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  // leave
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  // appear
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      const child = children && children.length ? findNonCommentChild(children) : (
        // Keep explicit default-slot conditionals on the same transition path
        // as regular v-if branches, which render a comment placeholder.
        instance.subTree ? createCommentVNode() : void 0
      );
      if (!child) {
        return;
      }
      const rawProps = toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getInnerChild$1(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      let enterHooks = resolveTransitionHooks(
        innerChild,
        rawProps,
        state,
        instance,
        // #11061, ensure enterHooks is fresh after clone
        (hooks) => enterHooks = hooks
      );
      if (innerChild.type !== Comment) {
        setTransitionHooks(innerChild, enterHooks);
      }
      let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
      if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && getTransitionRoot(instance.subTree)) {
        let leavingHooks = resolveTransitionHooks(
          oldInnerChild,
          rawProps,
          state,
          instance
        );
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (!(instance.job.flags & 8)) {
              instance.update();
            }
            delete leavingHooks.afterLeave;
            oldInnerChild = void 0;
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(
              state,
              oldInnerChild
            );
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el[leaveCbKey] = () => {
              earlyRemove();
              el[leaveCbKey] = void 0;
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
            enterHooks.delayedLeave = () => {
              delayedLeave();
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
          };
        } else {
          oldInnerChild = void 0;
        }
      } else if (oldInnerChild) {
        oldInnerChild = void 0;
      }
      return child;
    };
  }
};
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    for (const c of children) {
      if (c.type !== Comment) {
        child = c;
        break;
      }
    }
  }
  return child;
}
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook = (hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook(hook, args);
    if (isArray(hook)) {
      if (hook.every((hook2) => hook2.length <= 1)) done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode)) {
        let leavingCb = leavingVNode.el[leaveCbKey];
        if (!leavingCb) {
          const leavingRoot = getTransitionRoot(leavingVNode);
          leavingCb = leavingRoot && leavingRoot.el[leaveCbKey];
        }
        if (leavingCb) {
          leavingCb();
        }
      }
      callHook(hook, [el]);
    },
    enter(el) {
      if (leavingVNodesCache[key] === vnode) return;
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      el[enterCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        if (cancelled) {
          callHook(cancelHook, [el]);
        } else {
          callHook(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey] = void 0;
      };
      const done = el[enterCbKey].bind(null, false);
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove) {
      const key2 = String(vnode.key);
      if (el[enterCbKey]) {
        el[enterCbKey](
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove();
      }
      callHook(onBeforeLeave, [el]);
      let called = false;
      el[leaveCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        remove();
        if (cancelled) {
          callHook(onLeaveCancelled, [el]);
        } else {
          callHook(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      const done = el[leaveCbKey].bind(null, false);
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      const hooks2 = resolveTransitionHooks(
        vnode2,
        props,
        state,
        instance,
        postClone
      );
      if (postClone) postClone(hooks2);
      return hooks2;
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    const subTree = vnode.component.subTree;
    setTransitionHooks(
      isTeleport(subTree.type) ? getInnerChild$1(subTree) || subTree : subTree,
      hooks
    );
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
    if (vnode.type === Fragment && isArray(vnode.children)) {
      const child = filterSingleRoot(vnode.children, false);
      if (child) {
        setTransitionHooks(child, hooks);
      }
    }
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128) keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
function getTransitionRoot(vnode) {
  if (vnode.component) {
    return getTransitionRoot(vnode.component.subTree);
  }
  if (vnode.type === Fragment) {
    const child = isArray(vnode.children) && filterSingleRoot(vnode.children, false);
    return child ? getTransitionRoot(child) : void 0;
  }
  if (vnode.type !== Comment) {
    return vnode;
  }
}

function useId() {
  const i = getCurrentInstance();
  if (i) {
    return (i.appContext.config.idPrefix || "v") + "-" + i.ids[0] + i.ids[1]++;
  }
  return "";
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}

const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref2, key) => {
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction(ref)) {
    callWithErrorHandling(ref, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref);
    const _isRef = isRef(ref);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref) ? setupState[ref] : refs[ref] : canSetRef() || !rawRef.k ? ref.value : refs[rawRef.k];
          if (isUnmount) {
            isArray(existing) && remove(existing, refValue);
          } else {
            if (!isArray(existing)) {
              if (_isString) {
                refs[ref] = [refValue];
                if (canSetSetupRef(ref)) {
                  setupState[ref] = refs[ref];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref, rawRef.k)) {
                  ref.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref] = value;
          if (canSetSetupRef(ref)) {
            setupState[ref] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref, rawRef.k)) {
            ref.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}

getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));

const isAsyncWrapper = (i) => !!i.type.__asyncLoader;

const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}

function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");

function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache;
  const sourceIsArray = isArray(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !isShallow(source);
      isReadonlySource = isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(
        needsWrap ? isReadonlySource ? toReadonly(toReactive(source[i])) : toReactive(source[i]) : source[i],
        i,
        void 0,
        cached
      );
    }
  } else if (typeof source === "number") {
    if (!Number.isInteger(source) || source < 0) {
      ret = [];
    } else {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    }
  } else if (isObject(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached)
      );
    } else {
      const keys = Object.keys(source);
      ret = new Array(keys.length);
      for (let i = 0, l = keys.length; i < l; i++) {
        const key = keys[i];
        ret[i] = renderItem(source[key], key, i, cached);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}

const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => __VUE_OPTIONS_API__ ? resolveMergedOptions(i) : i.type,
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => __VUE_OPTIONS_API__ ? instanceWatch.bind(i) : NOOP
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1 /* SETUP */:
            return setupState[key];
          case 2 /* DATA */:
            return data[key];
          case 4 /* CONTEXT */:
            return ctx[key];
          case 3 /* PROPS */:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1 /* SETUP */;
        return setupState[key];
      } else if (__VUE_OPTIONS_API__ && data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2 /* DATA */;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3 /* PROPS */;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4 /* CONTEXT */;
        return ctx[key];
      } else if (!__VUE_OPTIONS_API__ || shouldCacheAccess) {
        accessCache[key] = 0 /* OTHER */;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4 /* CONTEXT */;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (__VUE_OPTIONS_API__ && data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || __VUE_OPTIONS_API__ && data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function normalizePropsOrEmits(props) {
  return isArray(props) ? props.reduce(
    (normalized, p) => (normalized[p] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject(data)) ; else {
      instance.data = reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get = isFunction(opt) ? opt.bind(publicThis, publicThis) : isFunction(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set = !isFunction(opt) && isFunction(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get,
        set
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render && instance.render === NOOP) {
    instance.render = render;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h) => h.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ; else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return (extend)(
      isFunction(to) ? to.call(this, this) : to,
      isFunction(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray(to) && isArray(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}

function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render, hydrate) {
  return function createApp(rootComponent, rootProps = null) {
    if (!isFunction(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ; else if (plugin && isFunction(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        if (__VUE_OPTIONS_API__) {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            render(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          if (__VUE_PROD_DEVTOOLS__) {
            app._instance = vnode.component;
            devtoolsInitApp(app, version);
          }
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render(null, app._container);
          if (__VUE_PROD_DEVTOOLS__) {
            app._instance = null;
            devtoolsUnmountApp(app);
          }
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};

function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener = event.startsWith("update:");
  const modifiers = isModelListener && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = args.map(looseToNumber);
    }
  }
  if (__VUE_PROD_DEVTOOLS__) {
    devtoolsComponentEmit(instance, event, args);
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = __VUE_OPTIONS_API__ && asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2);
  key = key === "Once" ? key : key.replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit,
    render,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = !!("production" !== "production") && setupState.__isScriptSetup ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render.call(
          thisProxy,
          proxyToUse,
          renderCache,
          !!("production" !== "production") ? shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render2 = Component;
      if (!!("production" !== "production") && attrs === props) ;
      result = normalizeVNode(
        render2.length > 1 ? render2(
          !!("production" !== "production") ? shallowReadonly(props) : props,
          !!("production" !== "production") ? {
            get attrs() {
              markAttrsAccessed();
              return shallowReadonly(attrs);
            },
            slots,
            emit
          } : { attrs, slots, emit }
        ) : render2(
          !!("production" !== "production") ? shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root;
    if (keys.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root = cloneVNode(root, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root = cloneVNode(root, null, false, true);
    root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    const child = isTeleport(root.type) ? getInnerChild$1(root) || root : root;
    setTransitionHooks(child, vnode.transition);
  }
  {
    result = root;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
function filterSingleRoot(children, recurse = true) {
  let singleRoot;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isVNode(child)) {
      if (child.type !== Comment || child.children === "v-if") {
        if (singleRoot) {
          return;
        } else {
          singleRoot = child;
        }
      }
    } else {
      return;
    }
  }
  return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (!hasOwn(prevProps, key) || hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject(nextProp) && isObject(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root = parent.subTree;
    if (root.suspense && root.suspense.activeBranch === vnode) {
      root.suspense.vnode.el = root.el = el;
      vnode = root;
    }
    if (root === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}

const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;

function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[0 /* shouldCast */]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[1 /* shouldCastTrue */] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = __VUE_OPTIONS_API__ && asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (__VUE_OPTIONS_API__ && !isFunction(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys) needCastKeys.push(...keys);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray(opt) || isFunction(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction(propType) && propType.name === "Boolean";
        }
        prop[0 /* shouldCast */] = shouldCast;
        prop[1 /* shouldCastTrue */] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}

const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (!!("production" !== "production") && currentInstance && !(ctx === null && currentRenderingInstance) && !(ctx && ctx.root !== currentInstance.root)) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};

function initFeatureFlags() {
  if (typeof __VUE_OPTIONS_API__ !== "boolean") {
    getGlobalThis().__VUE_OPTIONS_API__ = true;
  }
  if (typeof __VUE_PROD_DEVTOOLS__ !== "boolean") {
    getGlobalThis().__VUE_PROD_DEVTOOLS__ = false;
  }
  if (typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__ !== "boolean") {
    getGlobalThis().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = false;
  }
}

const queuePostRenderEffect = queueEffectWithSuspense ;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  {
    initFeatureFlags();
  }
  const target = getGlobalThis();
  target.__VUE__ = true;
  if (__VUE_PROD_DEVTOOLS__) {
    setDevtoolsHook$1(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
  }
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    if (n2.dynamicChildren && n1 && n1.dynamicChildren && n1.dynamicChildren.hasOnce) {
      if (n2.dynamicChildren === EMPTY_ARR) {
        n2.dynamicChildren = [];
      }
      n2.dynamicChildren.hasOnce = true;
    }
    const { type, ref, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref != null && parentComponent) {
      setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (__VUE_PROD_DEVTOOLS__) {
      def(el, "__vnode", vnode, true);
      def(el, "__vueParentComponent", parentComponent, true);
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    if (__VUE_PROD_DEVTOOLS__) {
      el.__vnode = n2;
    }
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (
      // HMR updated, force full diff
      // #6385 the old vnode may be a user-wrapped non-isomorphic block
      // Force full diff when block metadata is unstable.
      dynamicChildren && (!n1.dynamicChildren || n1.dynamicChildren.length !== dynamicChildren.length)
    ) {
      patchFlag = 0;
      optimized = false;
      dynamicChildren = null;
    }
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const oldEl = oldVNode.el || resolveAsyncComponentPlaceholder(oldVNode);
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldEl && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldEl) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    ));
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(
        instance,
        setupRenderEffect,
        optimized,
        namespace
      );
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        n2.el = n1.el;
        n2.placeholder = n1.placeholder;
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      n2.placeholder = n1.placeholder;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root.ce && root.ce._hasShadowRoot()) {
            root.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        if (__VUE_PROD_DEVTOOLS__) {
          devtoolsComponentAdded(instance);
        }
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
        if (__VUE_PROD_DEVTOOLS__) {
          devtoolsComponentUpdated(instance);
        }
      }
    };
    instance.scope.on();
    const effect = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect.run.bind(effect);
    const job = instance.job = effect.runIfDirty.bind(effect);
    job.i = instance;
    job.id = instance.uid;
    effect.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        if (transition.persisted && !el[leaveCbKey]) {
          hostInsert(el, container, anchor);
        } else {
          transition.beforeEnter(el);
          hostInsert(el, container, anchor);
          queuePostRenderEffect(() => transition.enter(el), parentSuspense);
        }
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove2 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          const wasLeaving = el._isLeaving || !!el[leaveCbKey];
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          if (transition.persisted && !wasLeaving) {
            remove2();
          } else {
            leave(el, () => {
              remove2();
              afterLeave && afterLeave();
            });
          }
        };
        if (delayLeave) {
          delayLeave(el, remove2, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2 || dynamicChildren && dynamicChildren.hasOnce) {
      optimized = false;
    }
    if (ref != null) {
      pauseTracking();
      setRef(ref, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null && (!vnode.ctx || vnode.ctx === parentComponent)) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    const isFragment = type === Fragment;
    if (isFragment && !transition) {
      removeFragment(el, anchor);
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
      return;
    }
    const leavingNode = isFragment ? getTransitionRoot(vnode) : vnode;
    const performRemove = () => {
      if (isFragment) {
        if (hostParentNode(el)) {
          removeFragment(el, anchor);
        }
      } else {
        hostRemove(el);
      }
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (leavingNode && leavingNode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const leavingEl = leavingNode.el;
      const performLeave = () => leave(leavingEl, performRemove);
      if (delayLeave) {
        delayLeave(leavingEl, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    } else if (instance.vnode.el && subTree) {
      subTree.transition = instance.vnode.transition;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
    if (__VUE_PROD_DEVTOOLS__) {
      devtoolsComponentRemoved(instance);
    }
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  const render = (vnode, container, namespace) => {
    const minUid = vnode && container._vnode ? void 0 : vnode && vnode.component ? vnode.component.uid : getNextUid();
    flushOnAppMount(() => {
      if (vnode == null) {
        if (container._vnode) {
          unmount(container._vnode, null, null, true);
        }
      } else {
        patch(
          container._vnode || null,
          vnode,
          container,
          null,
          null,
          null,
          namespace
        );
      }
      container._vnode = vnode;
    }, minUid);
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render,
    hydrate,
    createApp: createAppAPI(render)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect, job }, allowed) {
  if (allowed) {
    effect.flags |= 32;
    job.flags |= 4;
  } else {
    effect.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray(ch1) && isArray(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}

const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}

const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref,
  ref_key,
  ref_for
}) => {
  if (typeof ref === "number") {
    ref = "" + ref;
  }
  return ref != null ? isString(ref) || isRef(ref) || isFunction(ref) ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for } : ref : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject(style)) {
      if (isProxy(style) && !isArray(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject(type) ? 4 : isFunction(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref ? isArray(ref) ? ref.concat(normalizeRef(extraProps)) : [ref, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children: children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce,
    cacheIndex: vnode.cacheIndex
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction(children)) {
    if (shapeFlag & (1 | 64)) {
      normalizeChildren(vnode, { default: children });
      return;
    }
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}

const emptyAppContext = createAppContext();
let uid = 0;
function getNextUid() {
  return uid;
}
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set) => set(v));
      else setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          setInSSRSetupState(true);
          try {
            handleSetupResult(instance, resolvedResult, isSSR);
          } finally {
            setInSSRSetupState(false);
          }
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject(setupResult)) {
    if (__VUE_PROD_DEVTOOLS__) {
      instance.devtoolsRawSetupState = setupResult;
    }
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  if (__VUE_OPTIONS_API__ && true) {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction(value) && "__vccOpts" in value;
}

const computed = (getterOrOptions, debugOptions) => {
  const c = computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};

function h(type, propsOrChildren, children) {
  try {
    setBlockTracking(-1);
    const l = arguments.length;
    if (l === 2) {
      if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  } finally {
    setBlockTracking(1);
  }
}

const version = "3.5.44";

/**
* @vue/runtime-dom v3.5.44
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/

let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};

const TRANSITION = "transition";
const ANIMATION = "animation";
const vtcKey = /* @__PURE__ */ Symbol("_vtc");
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
const decorate$1 = (t) => {
  t.displayName = "Transition";
  t.props = TransitionPropsValidators;
  return t;
};
const Transition = /* @__PURE__ */ decorate$1(
  (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots)
);
const callHook = (hook, args = []) => {
  if (isArray(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const {
    name = "v",
    type,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps;
  const finishEnter = (el, isAppear, done, isCancelled) => {
    el._enterCancelled = isCancelled;
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve);
        }
      });
    };
  };
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      if (!el._enterCancelled) {
        forceReflow(el);
        addTransitionClass(el, leaveActiveClass);
      } else {
        addTransitionClass(el, leaveActiveClass);
        forceReflow(el);
      }
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve);
        }
      });
      callHook(onLeave, [el, resolve]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false, void 0, true);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true, void 0, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve();
    }
  };
  if (explicitTimeout != null) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  if (s === "auto") return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
  const targetDocument = el ? el.ownerDocument : document;
  return targetDocument.body.offsetHeight;
}

function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}

const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");

const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");

const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      const value = next[key];
      if (value != null) {
        if (!shouldPreserveTextareaResizeStyle(
          el,
          key,
          !isString(prev) && prev ? prev[key] : void 0,
          value
        )) {
          setStyle(style, key, value);
        }
      } else {
        setStyle(style, key, "");
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    if (!isCssString || prev !== next) {
      el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    }
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
  if (isArray(val)) {
    val.forEach((v) => setStyle(style, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      if (importantRE.test(val)) {
        style.setProperty(name, val.replace(importantRE, ""), "important");
      } else {
        style.setProperty(name, val);
      }
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
  return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}

const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean ? "" : isSymbol(value) ? String(value) : value
      );
    }
  }
}

function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}

function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(Once|Passive|Capture)$/;
const optionsModifierEventRE = /^on:?(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  let m;
  while ((m = name.match(optionsModifierRE)) && !optionsModifierEventRE.test(name)) {
    if (!options) options = {};
    name = name.slice(0, name.length - m[1].length);
    options[m[1].toLowerCase()] = true;
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    const value = invoker.value;
    if (isArray(value)) {
      const originalStop = e.stopImmediatePropagation;
      e.stopImmediatePropagation = () => {
        originalStop.call(e);
        e._stopped = true;
      };
      const handlers = value.slice();
      const args = [e];
      for (let i = 0; i < handlers.length; i++) {
        if (e._stopped) {
          break;
        }
        const handler = handlers[i];
        if (handler) {
          callWithAsyncErrorHandling(
            handler,
            instance,
            5,
            args
          );
        }
      }
    } else {
      callWithAsyncErrorHandling(
        value,
        instance,
        5,
        [e]
      );
    }
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}

const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}

const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = /* @__PURE__ */ Symbol("_assign");
const initialValueKey = /* @__PURE__ */ Symbol("_initialValue");
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    if (el.parentNode) {
      if (el.type === "text") {
        el[initialValueKey] = el.defaultValue.replace(/[\r\n]/g, "");
      } else if (el.type === "textarea") {
        el[initialValueKey] = el.defaultValue.replace(/\r\n?/g, "\n");
      }
    }
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      el[assignKey](castValue(el.value, trim, castToNumber));
    });
    if (trim || castToNumber) {
      addEventListener(el, "change", () => {
        el.value = castValue(el.value, trim, castToNumber);
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value, modifiers: { trim, number } }) {
    const newValue = value == null ? "" : value;
    const initialValue = el[initialValueKey];
    delete el[initialValueKey];
    if (initialValue !== void 0 && (el.type === "text" || el.type === "textarea") && el.value !== initialValue) {
      el[assignKey](castValue(el.value, trim, number));
    } else {
      el.value = newValue;
    }
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing) return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    const rootNode = el.getRootNode();
    if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
      if (lazy && value === oldValue) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};

const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  if (!fn) return fn;
  const cache = fn._withMods || (fn._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers)) return;
    }
    return fn(event, ...args);
  }));
};

const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}

const __sfc__$n = {
  __name: 'Icon',
  props: {
  name: { type: String, required: true },
  size: { type: [Number, String], default: 22 },
  strokeWidth: { type: [Number, String], default: 1.8 },
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

const paths = {
  home: ["M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z", "M9 21v-6h6v6"],
  market: ["M4 19V9", "M10 19V5", "M16 19v-7", "M22 19V3", "M2 19h21"],
  portfolio: ["M4 7.5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h12", "M16 12h4v4h-4a2 2 0 1 1 0-4Z"],
  insights: ["M4 18V9", "M10 18V5", "M16 18v-4", "M22 18V7", "M2 21h21"],
  user: ["M20 21a8 8 0 0 0-16 0", "M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.35-4.35"],
  bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9", "M10 21h4"],
  refresh: ["M20 6v5h-5", "M4 18v-5h5", "M6.1 9a7 7 0 0 1 11.8-2.4L20 11", "M4 13l2.1 4.4A7 7 0 0 0 17.9 15"],
  calendar: ["M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z", "M8 2v4", "M16 2v4", "M3 9h18"],
  sparkles: ["m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4Z", "m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8Z", "m5 14 .6 1.4L7 16l-1.4.6L5 18l-.6-1.4L3 16l1.4-.6Z"],
  arrowLeft: ["M19 12H5", "m11 18-6-6 6-6"],
  arrowRight: ["M5 12h14", "m13 6 6 6-6 6"],
  chevronRight: ["m9 18 6-6-6-6"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  star: ["m12 3 2.75 5.57 6.15.9-4.45 4.33 1.05 6.12L12 17l-5.5 2.9 1.05-6.12L3.1 9.47l6.15-.9Z"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  send: ["m22 2-7 20-4-9-9-4Z", "M22 2 11 13"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  eye: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
  check: ["m5 12 4 4L19 6"],
  filter: ["M4 6h16", "M7 12h10", "M10 18h4"],
  wallet: ["M4 6h15a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13", "M16 12h5v4h-5a2 2 0 0 1 0-4Z"],
  shield: ["M12 3 4.5 6v5c0 5 3.1 8.4 7.5 10 4.4-1.6 7.5-5 7.5-10V6Z", "m9 12 2 2 4-5"],
  settings: ["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.84 2.84-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21H10v-.08A1.7 1.7 0 0 0 8.98 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.84-2.84.06-.06A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3.08 14H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.84-2.84.06.06A1.7 1.7 0 0 0 8.98 4.6 1.7 1.7 0 0 0 10 3.08V3h4v.08a1.7 1.7 0 0 0 1.02 1.52 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.84 2.84-.06.06A1.7 1.7 0 0 0 19.4 9 1.7 1.7 0 0 0 20.92 10H21v4h-.08A1.7 1.7 0 0 0 19.4 15Z"],
  logout: ["M10 17l5-5-5-5", "M15 12H3", "M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"],
  message: ["M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"],
  edit: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"],
  info: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 16v-4", "M12 8h.01"],
  flame: ["M12 22c4.4 0 7-2.9 7-7 0-3.5-2-6.2-4.5-9.5C13 3.5 12 2 12 2S9 7 6 12c-1.3 2.2-1 3.9 0 5 1.3 1.5 3 1 4-.2.7-.8 1-2.1.5-3.2 2 1.7 3.2 3.6 3.2 5.2 0 1.4-.6 2.2-1.7 3.2Z"],
  trend: ["M3 17 9 11l4 4 8-9", "M15 6h6v6"],
  clock: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 6v6l4 2"],
  chart: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
  chevronDown: ["m6 9 6 6 6-6"],
  sun: ["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z", "M12 1v2", "M12 21v2", "M4.22 4.22l1.42 1.42", "M18.36 18.36l1.42 1.42", "M1 12h2", "M21 12h2", "M4.22 19.78l1.42-1.42", "M18.36 5.64l1.42-1.42"],
  moon: ["M21 12.8A8.5 8.5 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"],
  target: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z", "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"],
  sliders: ["M4 21v-7", "M4 10V3", "M12 21v-9", "M12 8V3", "M20 21v-5", "M20 12V3", "M1 14h6", "M9 8h6", "M17 16h6"],
  share: ["M8.6 13.5 15.4 17", "M15.4 7 8.6 10.5", "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"],
};

const iconPaths = computed(() => paths[props.name] || paths.info);

const __returned__ = { props, paths, iconPaths, computed };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$n = ["width", "height", "stroke-width"];
const _hoisted_2$n = ["d"];

function render$n(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("svg", {
    width: $props.size,
    height: $props.size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": $props.strokeWidth,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true"
  }, [
    (openBlock(true), createElementBlock(Fragment, null, renderList($setup.iconPaths, (path, index) => {
      return (openBlock(), createElementBlock("path", {
        key: index,
        d: path
      }, null, 8 /* PROPS */, _hoisted_2$n))
    }), 128 /* KEYED_FRAGMENT */))
  ], 8 /* PROPS */, _hoisted_1$n))
}
__sfc__$n.render = render$n;
__sfc__$n.__file = "src/components/Icon.vue";

const marketIndices = [
  {
    code: "000001",
    secid: "1.000001",
    name: "上证指数",
    shortName: "上证",
    price: 3735.37,
    prevClose: 3730.92,
    change: 4.45,
    changePercent: 0.12,
    points: [3708, 3712, 3706, 3719, 3725, 3721, 3729, 3732, 3736, 3735],
  },
  {
    code: "399001",
    secid: "0.399001",
    name: "深证成指",
    shortName: "深证",
    price: 11801.29,
    prevClose: 11817.42,
    change: -16.13,
    changePercent: -0.14,
    points: [11804, 11822, 11815, 11788, 11774, 11793, 11781, 11808, 11797, 11801],
  },
  {
    code: "399006",
    secid: "0.399006",
    name: "创业板指",
    shortName: "创业板",
    price: 2739.2,
    prevClose: 2746.29,
    change: -7.09,
    changePercent: -0.26,
    points: [2744, 2752, 2745, 2728, 2714, 2723, 2719, 2734, 2742, 2739],
  },
];

const seedStocks = [
  {
    code: "600519",
    secid: "1.600519",
    name: "贵州茅台",
    sector: "白酒",
    market: "SH",
    price: 1331.88,
    prevClose: 1324.97,
    open: 1321.01,
    high: 1335,
    low: 1316.14,
    volume: 34136,
    amount: 4525398959,
    turnover: 0.27,
    pe: 18.7,
    pb: 6.63,
    marketCap: 1664958682740,
    volumeRatio: 0.92,
    mainNet: "—",
    dividend: "—",
    description: "上海证券交易所主板上市公司，主营茅台酒及系列酒的生产与销售。页面行情来自公开实时行情接口。",
    tags: ["沪市主板", "消费", "高市值"],
  },
  {
    code: "300750",
    secid: "0.300750",
    name: "宁德时代",
    sector: "新能源",
    market: "SZ",
    price: 259.08,
    prevClose: 267.02,
    open: 268.35,
    high: 268.99,
    low: 254.55,
    volume: 588559,
    amount: 15252457669.6,
    turnover: 1.38,
    pe: 13.93,
    pb: 3.1,
    marketCap: 1198827848649,
    volumeRatio: 1.66,
    mainNet: "—",
    dividend: "—",
    description: "深圳证券交易所创业板上市公司，业务覆盖动力电池与储能系统。页面行情来自公开实时行情接口。",
    tags: ["创业板", "新能源", "动力电池"],
  },
  {
    code: "002594",
    secid: "0.002594",
    name: "比亚迪",
    sector: "汽车",
    market: "SZ",
    price: 82.6,
    prevClose: 83.5,
    open: 83.39,
    high: 83.59,
    low: 81.93,
    volume: 183436,
    amount: 1514574761.58,
    turnover: 0.53,
    pe: 30.55,
    pb: 3.14,
    marketCap: 753080518869,
    volumeRatio: 0.75,
    mainNet: "—",
    dividend: "—",
    description: "深圳证券交易所上市公司，业务覆盖新能源汽车、动力电池与电子零部件。页面行情来自公开实时行情接口。",
    tags: ["深市主板", "新能源汽车", "产业链"],
  },
  {
    code: "600036",
    secid: "1.600036",
    name: "招商银行",
    sector: "银行",
    market: "SH",
    price: 42.52,
    prevClose: 43.05,
    open: 42.95,
    high: 43.13,
    low: 42.18,
    volume: 760948,
    amount: 3235055173,
    turnover: 0.37,
    pe: 7.01,
    pb: 0.94,
    marketCap: 1072347834955,
    volumeRatio: 0.97,
    mainNet: "—",
    dividend: "—",
    description: "上海证券交易所上市公司，提供公司及零售银行、财富管理等金融服务。页面行情来自公开实时行情接口。",
    tags: ["沪市主板", "银行", "低估值"],
  },
  {
    code: "601318",
    secid: "1.601318",
    name: "中国平安",
    sector: "保险",
    market: "SH",
    price: 51.2,
    prevClose: 51.67,
    open: 51.66,
    high: 51.8,
    low: 50.53,
    volume: 855155,
    amount: 4358756733,
    turnover: 0.8,
    pe: 5.01,
    pb: 0.92,
    marketCap: 927111270144,
    volumeRatio: 1.06,
    mainNet: "—",
    dividend: "—",
    description: "上海证券交易所上市公司，业务覆盖保险、银行与资产管理。页面行情来自公开实时行情接口。",
    tags: ["沪市主板", "保险", "综合金融"],
  },
  {
    code: "300059",
    secid: "0.300059",
    name: "东方财富",
    sector: "证券",
    market: "SZ",
    price: 17.96,
    prevClose: 18.08,
    open: 18.05,
    high: 18.1,
    low: 17.76,
    volume: 1534778,
    amount: 2746786581.02,
    turnover: 1.15,
    pe: 17.62,
    pb: 2.89,
    marketCap: 284166709755,
    volumeRatio: 0.83,
    mainNet: "—",
    dividend: "—",
    description: "深圳证券交易所创业板上市公司，提供互联网金融服务与金融数据服务。页面行情来自公开实时行情接口。",
    tags: ["创业板", "证券", "互联网金融"],
  },
  {
    code: "000001",
    secid: "0.000001",
    name: "平安银行",
    sector: "银行",
    market: "SZ",
    price: 11.44,
    prevClose: 11.65,
    open: 11.62,
    high: 11.68,
    low: 11.38,
    volume: 1245097,
    amount: 1429559866.96,
    turnover: 0.64,
    pe: 4.32,
    pb: 0.48,
    marketCap: 222003704185,
    volumeRatio: 1.06,
    mainNet: "—",
    dividend: "—",
    description: "深圳证券交易所上市公司，提供零售、公司及金融市场银行服务。页面行情来自公开实时行情接口。",
    tags: ["深市主板", "银行", "低估值"],
  },
  {
    code: "688981",
    secid: "1.688981",
    name: "中芯国际",
    sector: "半导体",
    market: "SH",
    price: 101.98,
    prevClose: 99.7,
    open: 98.99,
    high: 101.98,
    low: 98.51,
    volume: 299365,
    amount: 3005544991,
    turnover: 1.5,
    pe: 97.73,
    pb: 5.09,
    marketCap: 873191707080,
    volumeRatio: 0.87,
    mainNet: "—",
    dividend: "—",
    description: "上海证券交易所科创板上市公司，提供集成电路晶圆代工与配套服务。页面行情来自公开实时行情接口。",
    tags: ["科创板", "半导体", "晶圆制造"],
  },
  {
    code: "601899",
    secid: "1.601899",
    name: "紫金矿业",
    sector: "有色金属",
    market: "SH",
    price: 29.06,
    prevClose: 29.79,
    open: 29.3,
    high: 29.39,
    low: 28.55,
    volume: 2093035,
    amount: 6049733737,
    turnover: 1.02,
    pe: 9.86,
    pb: 4,
    marketCap: 772728596883,
    volumeRatio: 1.43,
    mainNet: "—",
    dividend: "—",
    description: "上海证券交易所上市公司，主营金、铜等矿产资源的勘探、开发与冶炼。页面行情来自公开实时行情接口。",
    tags: ["沪市主板", "有色金属", "资源"],
  },
  {
    code: "600900",
    secid: "1.600900",
    name: "长江电力",
    sector: "电力",
    market: "SH",
    price: 29.69,
    prevClose: 29.54,
    open: 29.54,
    high: 29.69,
    low: 29.27,
    volume: 945156,
    amount: 2788716964,
    turnover: 0.39,
    pe: 24.62,
    pb: 3.36,
    marketCap: 726461383988,
    volumeRatio: 0.84,
    mainNet: "—",
    dividend: "—",
    description: "上海证券交易所上市公司，主营大型水电站运营与电力生产。页面行情来自公开实时行情接口。",
    tags: ["沪市主板", "电力", "稳定现金流"],
  },
  {
    code: "002415",
    secid: "0.002415",
    name: "海康威视",
    sector: "计算机设备",
    market: "SZ",
    price: 32.82,
    prevClose: 33.19,
    open: 33.14,
    high: 33.39,
    low: 32.43,
    volume: 614746,
    amount: 2011342735.56,
    turnover: 0.68,
    pe: 17.47,
    pb: 3.57,
    marketCap: 300791084271,
    volumeRatio: 0.99,
    mainNet: "—",
    dividend: "—",
    description: "深圳证券交易所上市公司，提供智能物联、视频产品与行业数字化解决方案。页面行情来自公开实时行情接口。",
    tags: ["深市主板", "智能物联", "计算机设备"],
  },
  {
    code: "000858",
    secid: "0.000858",
    name: "五粮液",
    sector: "白酒",
    market: "SZ",
    price: 72.85,
    prevClose: 72.82,
    open: 72.65,
    high: 73.11,
    low: 72.08,
    volume: 227265,
    amount: 1650400742.42,
    turnover: 0.59,
    pe: 16.15,
    pb: 2.39,
    marketCap: 282775143164,
    volumeRatio: 0.88,
    mainNet: "—",
    dividend: "—",
    description: "深圳证券交易所上市公司，主营白酒产品的生产与销售。页面行情来自公开实时行情接口。",
    tags: ["深市主板", "白酒", "消费"],
  },
];

const fallbackSectors = [
  { name: "数字媒体", code: "BK1295", change: 13.62, mainNet: 382571104 },
  { name: "诊断服务", code: "BK1602", change: 9.53, mainNet: 318379456 },
  { name: "燃料电池", code: "BK1305", change: 6.08, mainNet: 1696433 },
  { name: "医美耗材", code: "BK1500", change: 5.87, mainNet: 115990657 },
  { name: "汽车综合服务", code: "BK1524", change: 4.68, mainNet: 60719949 },
  { name: "数字芯片设计", code: "BK1331", change: 4.43, mainNet: 146213888 },
];

const STORAGE_KEY = "tide-real-market-v2";

const defaultPortfolio = {
  cash: 125000,
  positions: [
    { code: "600519", shares: 100, availableShares: 100, pendingShares: 0, avgCost: 1280 },
    { code: "300750", shares: 300, availableShares: 300, pendingShares: 0, avgCost: 300 },
    { code: "600036", shares: 2000, availableShares: 2000, pendingShares: 0, avgCost: 40 },
  ],
  watchlist: ["600519", "300750", "002594", "600036"],
  ledger: [
    {
      id: "seed-1",
      type: "buy",
      code: "600519",
      name: "贵州茅台",
      shares: 100,
      price: 1280,
      amount: 128000,
      time: "10月16日 10:24",
      note: "模拟组合的核心仓位，记录成本与持有理由。",
    },
    {
      id: "seed-2",
      type: "buy",
      code: "300750",
      name: "宁德时代",
      shares: 300,
      price: 300,
      amount: 90000,
      time: "10月17日 14:06",
      note: "观察新能源方向的波动承受能力。",
    },
    {
      id: "seed-3",
      type: "buy",
      code: "600036",
      name: "招商银行",
      shares: 2000,
      price: 40,
      amount: 80000,
      time: "10月18日 09:48",
      note: "用于比较低估值金融与成长方向的仓位表现。",
    },
  ],
  alerts: [
    {
      id: "alert-seed-1",
      code: "300750",
      name: "宁德时代",
      direction: "below",
      target: 220,
      createdAt: Date.now(),
      triggered: false,
      triggeredAt: null,
    },
  ],
  notifications: [],
  history: [],
  customStocks: [],
  recentViews: [],
  settings: {
    autoRefresh: true,
    refreshSeconds: 15,
  },
};

function cloneDefaultPortfolio() {
  return JSON.parse(JSON.stringify(defaultPortfolio));
}

function loadPortfolio() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved || !Array.isArray(saved.positions) || !Array.isArray(saved.watchlist)) {
      return cloneDefaultPortfolio();
    }
    const defaults = cloneDefaultPortfolio();
    const positions = saved.positions.map((position) => ({
      ...position,
      availableShares: Number.isFinite(position.availableShares) ? position.availableShares : position.shares,
      pendingShares: Number(position.pendingShares) || 0,
      pendingDate: position.pendingDate || null,
    }));
    return {
      ...defaults,
      ...saved,
      positions,
      settings: { ...defaults.settings, ...(saved.settings || {}) },
      alerts: Array.isArray(saved.alerts) ? saved.alerts : defaults.alerts,
      notifications: Array.isArray(saved.notifications) ? saved.notifications : [],
      recentViews: Array.isArray(saved.recentViews) ? saved.recentViews : [],
    };
  } catch {
    return cloneDefaultPortfolio();
  }
}

function createPriceHistory(stock) {
  const start = Number(stock.prevClose || stock.price || 1);
  const end = Number(stock.price || start);
  return Array.from({ length: 24 }, (_, index) => {
    const progress = index / 23;
    const wave = Math.sin(index * 1.6 + Number(stock.code.slice(-2))) * start * 0.002;
    return Number((start + (end - start) * progress + wave).toFixed(3));
  });
}

const stocks = reactive(
  seedStocks.map((stock) => ({
    ...stock,
    change: Number((stock.price - stock.prevClose).toFixed(2)),
    changePercent: Number((((stock.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)),
    history: createPriceHistory(stock),
    live: false,
    quoteTimestamp: null,
  })),
);

const indices = reactive(
  marketIndices.map((index) => ({
    ...index,
    history: [...index.points],
    live: false,
    quoteTimestamp: null,
  })),
);

const sectorStats = reactive([...fallbackSectors]);
const portfolio = reactive(loadPortfolio());
const lastUpdated = reactive({
  value: null,
  live: false,
  source: "等待连接",
  tradeTimestamp: null,
});
const marketMeta = reactive({
  connection: "connecting",
  error: "",
  lastAttempt: null,
  sectorUpdatedAt: null,
  provider: "",
});
const marketClock = ref(Date.now());

if (typeof window !== "undefined") {
  window.setInterval(() => {
    marketClock.value = Date.now();
  }, 30000);
}

portfolio.customStocks.forEach((item) => {
  if (!stocks.some((stock) => stock.secid === item.secid || stock.code === item.code)) {
    stocks.push(
      reactive({
        ...item,
        history: item.price ? [Number(item.prevClose) || Number(item.price), Number(item.price)] : [0, 0],
        live: Boolean(item.price),
      }),
    );
  }
});

let refreshPromise = null;

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  } catch {
    // The app remains usable if browser storage is disabled.
  }
}

function hydratePortfolioState(state) {
  const defaults = cloneDefaultPortfolio();
  const incoming = state && typeof state === "object" ? state : {};
  const next = {
    ...defaults,
    ...incoming,
    positions: Array.isArray(incoming.positions)
      ? incoming.positions.map((position) => ({
          ...position,
          availableShares: Number.isFinite(position.availableShares) ? position.availableShares : position.shares,
          pendingShares: Number(position.pendingShares) || 0,
          pendingDate: position.pendingDate || null,
        }))
      : defaults.positions,
    watchlist: Array.isArray(incoming.watchlist) ? incoming.watchlist : defaults.watchlist,
    ledger: Array.isArray(incoming.ledger) ? incoming.ledger : defaults.ledger,
    alerts: Array.isArray(incoming.alerts) ? incoming.alerts : defaults.alerts,
    notifications: Array.isArray(incoming.notifications) ? incoming.notifications : [],
    history: Array.isArray(incoming.history) ? incoming.history : [],
    recentViews: Array.isArray(incoming.recentViews) ? incoming.recentViews : [],
    customStocks: Array.isArray(incoming.customStocks) ? incoming.customStocks : [],
    settings: { ...defaults.settings, ...(incoming.settings || {}) },
  };
  Object.keys(portfolio).forEach((key) => delete portfolio[key]);
  Object.assign(portfolio, next);
  resetMarketPrices();
  persist();
}

function getStock(code) {
  return stocks.find((stock) => stock.code === code);
}

function getPosition(code) {
  return portfolio.positions.find((position) => position.code === code);
}

function shanghaiParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

function shanghaiDateKey(date = new Date()) {
  const parts = shanghaiParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function nextWeekdayLabel(weekday) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].includes(weekday)
    ? "下一交易日 09:30"
    : "下一交易日 09:30";
}

function getTradingStatus(now = new Date()) {
  const parts = shanghaiParts(now);
  const minutes = Number(parts.hour) * 60 + Number(parts.minute);
  const isWeekend = parts.weekday === "Sat" || parts.weekday === "Sun";
  const todayKey = `${parts.year}-${parts.month}-${parts.day}`;
  const quoteKey =
    lastUpdated.live && lastUpdated.tradeTimestamp
      ? shanghaiDateKey(lastUpdated.tradeTimestamp)
      : todayKey;
  const insideSessionWindow = (minutes >= 570 && minutes <= 690) || (minutes >= 780 && minutes <= 900);
  const likelyHoliday = !isWeekend && insideSessionWindow && quoteKey !== todayKey;

  if (isWeekend) {
    return {
      phase: "weekend",
      label: "周末休市",
      detail: "A 股周末不交易，下一交易日 09:30 开盘",
      canTrade: false,
      isTradingDay: false,
      tradeDate: todayKey,
      nextOpen: nextWeekdayLabel(parts.weekday),
      quoteDate: quoteKey,
    };
  }
  if (likelyHoliday) {
    return {
      phase: "holiday",
      label: "今日休市",
      detail: "行情日期与今日不一致，当前可能为法定休市日",
      canTrade: false,
      isTradingDay: false,
      tradeDate: todayKey,
      nextOpen: "下一交易日 09:30",
      quoteDate: quoteKey,
    };
  }
  if (minutes < 570) {
    return {
      phase: "preopen",
      label: "开盘前",
      detail: "集合竞价前，暂不接受模拟成交",
      canTrade: false,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "今日 09:30",
      quoteDate: quoteKey,
    };
  }
  if (minutes <= 690) {
    const quoteReady = lastUpdated.live;
    return {
      phase: "trading",
      label: "交易中",
      detail: quoteReady ? "上午交易时段 09:30-11:30" : "行情尚未完成同步，暂不执行模拟成交",
      canTrade: quoteReady,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "今日 13:00",
      quoteDate: quoteKey,
    };
  }
  if (minutes < 780) {
    return {
      phase: "midday",
      label: "午间休市",
      detail: "下午交易时段 13:00 开始",
      canTrade: false,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "今日 13:00",
      quoteDate: quoteKey,
    };
  }
  if (minutes <= 900) {
    const quoteReady = lastUpdated.live;
    return {
      phase: "trading",
      label: "交易中",
      detail: quoteReady ? "下午交易时段 13:00-15:00" : "行情尚未完成同步，暂不执行模拟成交",
      canTrade: quoteReady,
      isTradingDay: true,
      tradeDate: todayKey,
      nextOpen: "已进入尾盘",
      quoteDate: quoteKey,
    };
  }
  return {
    phase: "closed",
    label: "已收盘",
    detail: "今日交易已结束，下一交易日 09:30 开盘",
    canTrade: false,
    isTradingDay: true,
    tradeDate: todayKey,
    nextOpen: "下一交易日 09:30",
    quoteDate: quoteKey,
  };
}

const tradingStatus = computed(() => {
  marketClock.value;
  return getTradingStatus();
});

function settleT1() {
  const status = tradingStatus.value;
  if (!status.isTradingDay || !status.tradeDate) return false;
  let changed = false;
  portfolio.positions.forEach((position) => {
    const pending = Number(position.pendingShares) || 0;
    if (pending > 0 && position.pendingDate && status.tradeDate > position.pendingDate) {
      position.availableShares = Number(position.availableShares || 0) + pending;
      position.pendingShares = 0;
      position.pendingDate = null;
      changed = true;
    }
  });
  if (changed) persist();
  return changed;
}

function registerStock(item) {
  const existing = stocks.find((stock) => stock.secid === item.secid || stock.code === item.code);
  if (existing) {
    if (item.price) Object.assign(existing, item, { live: true });
    return existing;
  }
  const storedItem = {
    code: item.code,
    secid: item.secid,
    name: item.name,
    sector: item.sector || item.type || "A 股",
    market: item.market || "A股",
    price: Number(item.price) || 0,
    prevClose: Number(item.prevClose) || 0,
    open: Number(item.open) || 0,
    high: Number(item.high) || 0,
    low: Number(item.low) || 0,
    volume: Number(item.volume) || 0,
    amount: Number(item.amount) || 0,
    turnover: Number(item.turnover) || 0,
    pe: Number(item.pe) || 0,
    pb: Number(item.pb) || 0,
    marketCap: Number(item.marketCap) || 0,
    volumeRatio: Number(item.volumeRatio) || 0,
    change: Number(item.change) || 0,
    changePercent: Number(item.changePercent) || 0,
    quoteTimestamp: Number(item.timestamp) || null,
  };
  const stock = reactive({
    ...storedItem,
    mainNet: "—",
    dividend: "—",
    description: `${item.name}为实时查询的 A 股标的。行情由本地服务同步公开接口数据。`,
    tags: [item.market === "SH" ? "沪市" : "深市", "实时查询"],
    history: item.price ? [Number(item.prevClose) || Number(item.price), Number(item.price)] : [0, 0],
    live: Boolean(item.price),
    quoteTimestamp: Number(item.timestamp) || null,
  });
  stocks.push(stock);
  portfolio.customStocks.unshift(storedItem);
  portfolio.customStocks = portfolio.customStocks.slice(0, 50);
  persist();
  return stock;
}

async function searchStocks(query) {
  const keyword = String(query || "").trim();
  if (!keyword) return [];
  const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("股票搜索服务暂时不可用");
  const payload = await response.json();
  return payload.results || [];
}

function formatMoney(value, digits = 2) {
  return Number(value || 0).toLocaleString("zh-CN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function formatSigned(value, digits = 2) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${number.toFixed(digits)}`;
}

function formatCompactMoney(value) {
  const amount = Number(value || 0);
  if (Math.abs(amount) >= 100000000) return `${(amount / 100000000).toFixed(2)}亿`;
  if (Math.abs(amount) >= 10000) return `${(amount / 10000).toFixed(2)}万`;
  return amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

function formatVolume(lots) {
  const shares = Number(lots || 0) * 100;
  if (shares >= 100000000) return `${(shares / 100000000).toFixed(2)}亿`;
  if (shares >= 10000) return `${(shares / 10000).toFixed(2)}万`;
  return shares.toLocaleString("zh-CN");
}

function toggleWatch(code) {
  const index = portfolio.watchlist.indexOf(code);
  if (index >= 0) {
    portfolio.watchlist.splice(index, 1);
  } else {
    portfolio.watchlist.push(code);
  }
  persist();
  return portfolio.watchlist.includes(code);
}

function recordRecentView(code) {
  const stock = getStock(code);
  if (!stock) return;
  portfolio.recentViews = [
    { code, viewedAt: Date.now() },
    ...portfolio.recentViews.filter((item) => item.code !== code),
  ].slice(0, 8);
  persist();
}

function clearRecentViews() {
  portfolio.recentViews = [];
  persist();
}

function executeTrade({ code, type, shares, price, note = "" }) {
  const session = getTradingStatus();
  if (!session.canTrade) {
    return {
      ok: false,
      message: `${session.label}：${session.detail}，当前不会产生模拟成交`,
    };
  }
  const quantity = Math.floor(Number(shares) / 100) * 100;
  if (!quantity || quantity <= 0) {
    return { ok: false, message: "请输入 100 股的整数倍" };
  }

  const stock = getStock(code);
  if (!stock || !Number(stock.price)) return { ok: false, message: "实时价格尚未加载，请稍后重试" };

  const tradePrice = Number(price || stock.price);
  const gross = tradePrice * quantity;
  const fee = Math.max(5, gross * 0.00025);
  const stampDuty = type === "sell" ? gross * 0.0005 : 0;
  const total = gross + fee + stampDuty;
  const existing = getPosition(code);
  const now = new Date();
  const realizedProfit =
    type === "sell" && existing
      ? (tradePrice - existing.avgCost) * quantity - fee - stampDuty
      : 0;

  if (type === "buy" && total > portfolio.cash) {
    return { ok: false, message: "可用资金不足，可减少数量后重试" };
  }
  if (
    type === "sell" &&
    (!existing || Math.min(existing.availableShares ?? existing.shares, existing.shares) < quantity)
  ) {
    return { ok: false, message: "可卖数量不足；当日买入的股票需下一交易日才能卖出" };
  }

  if (type === "buy") {
    portfolio.cash -= total;
    if (existing) {
      const oldValue = existing.avgCost * existing.shares;
      existing.shares += quantity;
      existing.pendingShares = Number(existing.pendingShares || 0) + quantity;
      existing.pendingDate = session.tradeDate;
      existing.availableShares = Number(existing.availableShares ?? existing.shares - quantity);
      existing.avgCost = Number(((oldValue + total) / existing.shares).toFixed(3));
    } else {
      portfolio.positions.push({
        code,
        shares: quantity,
        availableShares: 0,
        pendingShares: quantity,
        pendingDate: session.tradeDate,
        avgCost: Number((total / quantity).toFixed(3)),
      });
    }
  } else {
    portfolio.cash += gross - fee - stampDuty;
    existing.shares -= quantity;
    existing.availableShares = Math.max(0, Number(existing.availableShares || 0) - quantity);
    portfolio.positions = portfolio.positions.filter((position) => position.shares > 0);
  }

  portfolio.ledger.unshift({
    id: `trade-${Date.now()}`,
    type,
    code,
    name: stock.name,
    shares: quantity,
    price: tradePrice,
    amount: Number(gross.toFixed(2)),
    fee: Number((fee + stampDuty).toFixed(2)),
    note: String(note || "").trim(),
    avgCostAtSale: type === "sell" && existing ? Number(existing.avgCost.toFixed(3)) : undefined,
    time: now.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    timestamp: now.getTime(),
    realizedProfit: Number(realizedProfit.toFixed(2)),
    tradeDate: session.tradeDate,
    session: session.phase,
  });
  persist();
  return { ok: true, message: `${type === "buy" ? "买入" : "卖出"} ${quantity} 股成功` };
}

function addPriceAlert({ code, direction, target }) {
  const stock = getStock(code);
  const threshold = Number(target);
  if (!stock || !Number.isFinite(threshold) || threshold <= 0) {
    return { ok: false, message: "请输入有效的提醒价格" };
  }
  const duplicate = portfolio.alerts.find(
    (alert) => alert.code === code && alert.direction === direction && !alert.triggered,
  );
  if (duplicate) {
    duplicate.target = threshold;
  } else {
    portfolio.alerts.unshift({
      id: `alert-${Date.now()}`,
      code,
      name: stock.name,
      direction,
      target: threshold,
      createdAt: Date.now(),
      triggered: false,
      triggeredAt: null,
    });
  }
  persist();
  return { ok: true, message: "价格提醒已设置" };
}

function removePriceAlert(id) {
  const index = portfolio.alerts.findIndex((alert) => alert.id === id);
  if (index >= 0) portfolio.alerts.splice(index, 1);
  persist();
}

function markNotificationsRead() {
  portfolio.notifications.forEach((notification) => {
    notification.read = true;
  });
  persist();
}

function updateMarketSettings(patch) {
  Object.assign(portfolio.settings, patch);
  persist();
}

function recordAccountSnapshot() {
  const marketValue = portfolio.positions.reduce((sum, position) => {
    const stock = getStock(position.code);
    return sum + (stock?.price || 0) * position.shares;
  }, 0);
  const value = portfolio.cash + marketValue;
  const last = portfolio.history.at(-1);
  if (last && Date.now() - last.time < 10000) return;
  portfolio.history.push({ time: Date.now(), value });
  portfolio.history = portfolio.history.slice(-30);
  persist();
}

function evaluateAlerts() {
  if (!tradingStatus.value.canTrade) return [];
  const triggered = [];
  portfolio.alerts.forEach((alert) => {
    if (alert.triggered) return;
    const stock = getStock(alert.code);
    if (!stock?.price) return;
    const matched =
      (alert.direction === "above" && stock.price >= alert.target) ||
      (alert.direction === "below" && stock.price <= alert.target);
    if (!matched) return;
    alert.triggered = true;
    alert.triggeredAt = Date.now();
    const notification = {
      id: `notice-${Date.now()}-${alert.code}`,
      code: alert.code,
      name: alert.name,
      type: "price-alert",
      message: `${alert.name} 已${alert.direction === "above" ? "涨至" : "跌至"} ¥${stock.price.toFixed(2)}，触发提醒价 ¥${alert.target.toFixed(2)}`,
      time: new Date().toISOString(),
      read: false,
    };
    portfolio.notifications.unshift(notification);
    triggered.push(notification);
  });
  if (triggered.length) persist();
  return triggered;
}

function applyQuote(target, quote) {
  if (!quote || !Number.isFinite(quote.price)) return;
  const wasLive = target.live;
  target.price = quote.price;
  target.prevClose = quote.prevClose;
  target.change = quote.change;
  target.changePercent = quote.changePercent;
  target.open = quote.open;
  target.high = quote.high;
  target.low = quote.low;
  target.volume = quote.volume;
  target.amount = quote.amount;
  target.turnover = quote.turnover;
  target.pe = quote.pe;
  target.pb = quote.pb;
  target.marketCap = quote.marketCap;
  target.volumeRatio = quote.volumeRatio;
  target.quoteTimestamp = quote.timestamp;
  target.live = true;
  if (target.history) {
    if (!wasLive) {
      target.history = target.prevClose ? [target.prevClose, quote.price] : [quote.price];
    } else {
      target.history.push(quote.price);
      target.history = target.history.slice(-24);
    }
  }
}

function applyQuoteResult(list, quotes) {
  const quoteMap = new Map(quotes.map((quote) => [quote.code, quote]));
  list.forEach((item) => {
    const quote = quoteMap.get(item.code);
    if (quote) applyQuote(item, quote);
  });
}

async function requestQuotes(items) {
  if (!items.length) return { quotes: [], stale: false };
  let lastError;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(`/api/quotes?secids=${encodeURIComponent(items.map((item) => item.secid).join(","))}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) throw new Error("实时行情接口请求失败");
      const payload = await response.json();
      if (!payload.ok) throw new Error(payload.error || "实时行情接口返回异常");
      return {
        quotes: payload.quotes || [],
        stale: Boolean(payload.stale),
        source: payload.source || "公开行情接口",
        fallback: Boolean(payload.fallback),
      };
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }
  throw lastError;
}

async function requestSectors() {
  const response = await fetch("/api/sectors", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("板块行情请求失败");
  const payload = await response.json();
  if (!payload.ok) throw new Error(payload.error || "板块行情返回异常");
  return { sectors: payload.sectors || [], stale: Boolean(payload.stale) };
}

function refreshMarket({ includeSectors = false } = {}) {
  if (refreshPromise) return refreshPromise;
  marketMeta.lastAttempt = new Date();
  refreshPromise = (async () => {
    try {
      const activeStocks = stocks.slice(0, 30);
      const quoteResults = await Promise.allSettled([requestQuotes(indices), requestQuotes(activeStocks)]);
      const fulfilledQuotes = quoteResults.filter((result) => result.status === "fulfilled").map((result) => result.value);
      if (!fulfilledQuotes.length) {
        throw quoteResults[0]?.reason || quoteResults[1]?.reason || new Error("实时行情接口请求失败");
      }
      const [indexResult, stockResult] = quoteResults.map((result) =>
        result.status === "fulfilled" ? result.value : null,
      );
      if (indexResult) applyQuoteResult(indices, indexResult.quotes);
      if (stockResult) applyQuoteResult(activeStocks, stockResult.quotes);
      const partiallyUnavailable = quoteResults.some((result) => result.status === "rejected");
      const stale = partiallyUnavailable || fulfilledQuotes.some((result) => result.stale);
      if (includeSectors) {
        try {
          const sectorResult = await requestSectors();
          if (sectorResult.sectors.length) {
            sectorStats.splice(0, sectorStats.length, ...sectorResult.sectors);
            marketMeta.sectorUpdatedAt = new Date();
          }
        } catch {
          // Core quotes remain live even when the sector ranking endpoint is temporarily unavailable.
        }
      }
      const timestamps = fulfilledQuotes
        .flatMap((result) => result.quotes)
        .map((quote) => quote.timestamp)
        .filter(Boolean);
      lastUpdated.value = new Date();
      lastUpdated.live = !stale;
      lastUpdated.source = stale ? "最近缓存行情" : fulfilledQuotes[0]?.source || "公开行情接口";
      marketMeta.provider = fulfilledQuotes[0]?.fallback ? "备用行情源" : "主行情源";
      if (timestamps.length) lastUpdated.tradeTimestamp = new Date(Math.max(...timestamps));
      marketMeta.connection = stale ? "stale" : "live";
      marketMeta.error = stale ? "实时接口短时波动，已使用最近缓存行情" : "";
      settleT1();
      recordAccountSnapshot();
      const triggered = evaluateAlerts();
      return { ok: true, stale, triggered };
    } catch (error) {
      lastUpdated.live = false;
      marketMeta.connection = "error";
      marketMeta.error = error instanceof Error ? error.message : "行情连接失败";
      return { ok: false, message: marketMeta.error };
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function resetPortfolio() {
  Object.assign(portfolio, cloneDefaultPortfolio());
  persist();
}

function resetMarketPrices() {
  stocks.splice(
    0,
    stocks.length,
    ...seedStocks.map((stock) => ({
      ...stock,
      change: Number((stock.price - stock.prevClose).toFixed(2)),
      changePercent: Number((((stock.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)),
      history: createPriceHistory(stock),
      live: false,
      quoteTimestamp: null,
    })),
  );
  indices.splice(
    0,
    indices.length,
    ...marketIndices.map((index) => ({
      ...index,
      history: [...index.points],
      live: false,
      quoteTimestamp: null,
    })),
  );
  sectorStats.splice(0, sectorStats.length, ...fallbackSectors);
  lastUpdated.value = null;
  lastUpdated.live = false;
  lastUpdated.source = "等待连接";
  marketMeta.connection = "connecting";
  stocks.push(
    ...portfolio.customStocks
      .filter((item) => !seedStocks.some((stock) => stock.code === item.code))
      .map((item) =>
        reactive({
          ...item,
          mainNet: "—",
          dividend: "—",
          description: `${item.name}为实时查询的 A 股标的。行情由本地服务同步公开接口数据。`,
          tags: [item.market === "SH" ? "沪市" : "深市", "实时查询"],
          history: [item.prevClose || item.price || 0, item.price || 0],
          live: Boolean(item.price),
        }),
      ),
  );
}

const holdings = computed(() =>
  portfolio.positions
    .map((position) => {
      const stock = getStock(position.code);
      if (!stock) return null;
      const marketValue = stock.price * position.shares;
      const profit = (stock.price - position.avgCost) * position.shares;
      return {
        ...position,
        stock,
        marketValue,
        profit,
        profitPercent: position.avgCost ? (profit / (position.avgCost * position.shares)) * 100 : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.marketValue - a.marketValue),
);

const account = computed(() => {
  const marketValue = holdings.value.reduce((sum, item) => sum + item.marketValue, 0);
  const totalAssets = portfolio.cash + marketValue;
  const yesterdayValue =
    portfolio.cash +
    holdings.value.reduce((sum, item) => sum + item.stock.prevClose * item.shares, 0);
  const dailyProfit = totalAssets - yesterdayValue;
  const totalProfit = holdings.value.reduce((sum, item) => sum + item.profit, 0);
  const invested = holdings.value.reduce((sum, item) => sum + item.avgCost * item.shares, 0);

  return {
    marketValue,
    totalAssets,
    dailyProfit,
    dailyPercent: yesterdayValue ? (dailyProfit / yesterdayValue) * 100 : 0,
    totalProfit,
    totalProfitPercent: invested ? (totalProfit / invested) * 100 : 0,
    positionPercent: totalAssets ? (marketValue / totalAssets) * 100 : 0,
  };
});

function buildPortfolioSummary() {
  return {
    totalAssets: Number(account.value.totalAssets.toFixed(2)),
    marketValue: Number(account.value.marketValue.toFixed(2)),
    cash: Number(portfolio.cash.toFixed(2)),
    dailyProfit: Number(account.value.dailyProfit.toFixed(2)),
    dailyPercent: Number(account.value.dailyPercent.toFixed(3)),
    totalProfit: Number(account.value.totalProfit.toFixed(2)),
    totalProfitPercent: Number(account.value.totalProfitPercent.toFixed(3)),
    positionPercent: Number(account.value.positionPercent.toFixed(2)),
    holdingCount: holdings.value.length,
    positions: holdings.value.map((item) => ({
      code: item.code,
      name: item.stock.name,
      shares: item.shares,
      availableShares: item.availableShares ?? item.shares,
      avgCost: Number(item.avgCost.toFixed(3)),
      price: Number(item.stock.price.toFixed(2)),
      marketValue: Number(item.marketValue.toFixed(2)),
      profit: Number(item.profit.toFixed(2)),
      profitPercent: Number(item.profitPercent.toFixed(3)),
      changePercent: Number(item.stock.changePercent || 0),
    })),
  };
}

const watchStocks = computed(() =>
  portfolio.watchlist.map((code) => getStock(code)).filter(Boolean),
);

const recentStocks = computed(() =>
  portfolio.recentViews
    .map((item) => ({ ...item, stock: getStock(item.code) }))
    .filter((item) => item.stock),
);

const suggestedStocks = computed(() =>
  stocks
    .filter((stock) => !portfolio.watchlist.includes(stock.code))
    .slice(0, 3),
);

const unreadNotificationCount = computed(
  () => portfolio.notifications.filter((notification) => !notification.read).length,
);

const activeAlertCount = computed(
  () => portfolio.alerts.filter((alert) => !alert.triggered).length,
);

const __sfc__$m = {
  __name: 'AiSheet',
  props: {
  open: { type: Boolean, default: false },
},
  emits: ["close", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;
const emit = __emit;

const input = ref("");
const loading = ref(false);
const messageList = ref(null);
const messages = ref([
  {
    id: 1,
    role: "assistant",
    text: "你好，我是观潮研究助手。我会用可解释的本地规则，结合实时行情与你的模拟账户做持仓复盘、风险梳理和条件情景分析，不会连接券商或执行真实交易。",
  },
]);

const suggestions = ["复盘我的持仓", "宁德时代的波动怎么看", "检查仓位集中度", "生成一份持仓笔记"];

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick();
      scrollBottom();
    }
  },
);

function scrollBottom() {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight;
  }
}

function buildReply(question) {
  const text = question.toLowerCase();
  const topHolding = holdings.value[0];
  const stockMessage = holdings.value
    .slice(0, 3)
    .map((item) => `${item.stock.name} ${item.profitPercent >= 0 ? "浮盈" : "浮亏"} ${Math.abs(item.profitPercent).toFixed(1)}%`)
    .join("，");

  if (text.includes("持仓") || text.includes("复盘")) {
    return `你的模拟账户当前总资产为 ¥${formatMoney(account.value.totalAssets)}，今日收益 ${account.value.dailyProfit >= 0 ? "+" : ""}¥${formatMoney(account.value.dailyProfit)}。\n\n主要持仓表现：${stockMessage || "暂无持仓"}。\n\n复盘建议：先检查单只股票是否超过总资产的 20%，再区分浮盈来自价格变化还是频繁交易。若某个方向持仓集中度过高，可以在模拟盘中练习分批调整。`;
  }
  if (text.includes("风险") || holdings.value.some((item) => text.includes(item.stock.name.toLowerCase()))) {
    const matchedHolding = holdings.value.find((item) => text.includes(item.stock.name.toLowerCase()));
    const stock = matchedHolding?.stock || holdings.value[0]?.stock;
    if (stock) {
      return `${stock.name} 当前价格为 ¥${stock.price.toFixed(2)}，今日涨跌 ${(((stock.price - stock.prevClose) / stock.prevClose) * 100).toFixed(2)}%，换手率 ${stock.turnover || "—"}%。\n\n可以从三个角度观察：\n1. 波动：今天日内振幅约 ${(((stock.high - stock.low) / stock.prevClose) * 100).toFixed(2)}%。\n2. 估值：当前动态市盈率 ${stock.pe || "—"}、市净率 ${stock.pb || "—"}。\n3. 仓位：如果它在账户中的占比过高，股价波动会被放大。\n\n以上是基于行情字段的观察，不构成买卖判断。`;
    }
      return "标的名称需要与当前行情对应。你可以输入具体股票名称，例如“宁德时代的波动怎么看”，我会结合实时行情字段和持仓进行分析。";
  }
  if (text.includes("稳健") || text.includes("策略")) {
    return `可以先建立三层模拟框架：\n1. 核心仓：选择波动和现金流更稳定的标的。\n2. 成长仓：控制在 1 至 2 个相关行业，避免重复押注。\n3. 现金仓：保留调整和纠错空间。\n\n当前账户仓位约 ${account.value.positionPercent.toFixed(1)}%，可用资金 ¥${formatMoney(portfolio.cash)}。这些只是情景框架，不是收益承诺。`;
  }
  if (text.includes("分化") || text.includes("市场") || text.includes("为什么")) {
      return "市场分化可以从三层观察：指数方向、行业相对强弱、个股量价关系。指数上涨并不代表所有持仓同时上涨，如果账户集中在一两个行业，组合体验可能与指数差异很大。可以进入行情页查看实时板块变化。";
  }
  if (text.includes("仓位") || text.includes("估值")) {
    return `账户当前仓位约 ${account.value.positionPercent.toFixed(1)}%，持仓市值 ¥${formatMoney(account.value.marketValue)}，可用资金 ¥${formatMoney(portfolio.cash)}。\n\n${account.value.positionPercent > 65 ? "仓位偏高，若市场快速回撤，账户波动会更明显。可在模拟盘中练习降低单一行业暴露。" : "仓位处于中等区间，仍有调整空间。"} 建议用模拟盘验证自己的阈值，而不是把固定比例当成标准答案。`;
  }
  if (topHolding) {
    return `当前最大持仓是 ${topHolding.stock.name}，实时价格 ¥${topHolding.stock.price.toFixed(2)}，模拟收益 ${topHolding.profitPercent >= 0 ? "+" : ""}${topHolding.profitPercent.toFixed(2)}%。\n\n可以继续观察成交量、今日价格区间和单一持仓占比。想深入分析时，可以直接问“${topHolding.stock.name}的波动怎么看”。`;
  }
  return "当前回答由本地规则生成。你可以让我解释账户收益、结合行情检查某个持仓，或生成一份模拟盘复盘。";
}

async function send(text = input.value) {
  const question = String(text || "").trim();
  if (!question || loading.value) return;
  messages.value.push({ id: Date.now(), role: "user", text: question });
  input.value = "";
  loading.value = true;
  await nextTick();
  scrollBottom();

  window.setTimeout(async () => {
    messages.value.push({
      id: Date.now() + 1,
      role: "assistant",
      text: buildReply(question),
    });
    loading.value = false;
    await nextTick();
    scrollBottom();
  }, 650);
}

const __returned__ = { props, emit, input, loading, messageList, messages, suggestions, scrollBottom, buildReply, send, nextTick, ref, watch, Icon: __sfc__$n, get account() { return account }, get formatMoney() { return formatMoney }, get holdings() { return holdings }, get portfolio() { return portfolio } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$m = {
  key: 0,
  class: "ai-overlay"
};
const _hoisted_2$m = {
  class: "ai-screen",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "观潮研究助手"
};
const _hoisted_3$m = { class: "ai-header" };
const _hoisted_4$l = { class: "ai-identity" };
const _hoisted_5$j = { class: "ai-avatar" };
const _hoisted_6$j = {
  ref: "messageList",
  class: "ai-messages"
};
const _hoisted_7$j = {
  key: 0,
  class: "ai-avatar mini"
};
const _hoisted_8$i = { class: "bubble" };
const _hoisted_9$h = {
  key: 0,
  class: "ai-message assistant"
};
const _hoisted_10$g = { class: "ai-avatar mini" };
const _hoisted_11$e = { class: "ai-composer" };
const _hoisted_12$d = {
  key: 0,
  class: "ai-suggestions"
};
const _hoisted_13$d = ["onClick"];
const _hoisted_14$d = ["disabled"];

function render$m(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open)
        ? (openBlock(), createElementBlock("div", _hoisted_1$m, [
            createBaseVNode("section", _hoisted_2$m, [
              createBaseVNode("header", _hoisted_3$m, [
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭研究助手",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 21
                  })
                ]),
                createBaseVNode("div", _hoisted_4$l, [
                  createBaseVNode("span", _hoisted_5$j, [
                    createVNode($setup["Icon"], {
                      name: "sparkles",
                      size: 18
                    })
                  ]),
                  _cache[4] || (_cache[4] = createBaseVNode("div", null, [
                    createBaseVNode("strong", null, "观潮助手"),
                    createBaseVNode("small", null, "本地研究工具 · 非投资顾问")
                  ], -1 /* CACHED */))
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "更多信息",
                  onClick: _cache[1] || (_cache[1] = $event => (_ctx.$emit('notify', '研究内容由本地规则生成，不连接外部 AI 服务')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "info",
                    size: 19
                  })
                ])
              ]),
              createBaseVNode("div", _hoisted_6$j, [
                _cache[6] || (_cache[6] = createBaseVNode("div", { class: "ai-day" }, "今天", -1 /* CACHED */)),
                (openBlock(true), createElementBlock(Fragment, null, renderList($setup.messages, (message) => {
                  return (openBlock(), createElementBlock("article", {
                    key: message.id,
                    class: normalizeClass(["ai-message", message.role])
                  }, [
                    (message.role === 'assistant')
                      ? (openBlock(), createElementBlock("span", _hoisted_7$j, [
                          createVNode($setup["Icon"], {
                            name: "sparkles",
                            size: 15
                          })
                        ]))
                      : createCommentVNode("v-if", true),
                    createBaseVNode("div", _hoisted_8$i, toDisplayString(message.text), 1 /* TEXT */)
                  ], 2 /* CLASS */))
                }), 128 /* KEYED_FRAGMENT */)),
                ($setup.loading)
                  ? (openBlock(), createElementBlock("article", _hoisted_9$h, [
                      createBaseVNode("span", _hoisted_10$g, [
                        createVNode($setup["Icon"], {
                          name: "sparkles",
                          size: 15
                        })
                      ]),
                      _cache[5] || (_cache[5] = createBaseVNode("div", { class: "bubble typing" }, [
                        createBaseVNode("i"),
                        createBaseVNode("i"),
                        createBaseVNode("i")
                      ], -1 /* CACHED */))
                    ]))
                  : createCommentVNode("v-if", true)
              ], 512 /* NEED_PATCH */),
              createBaseVNode("div", _hoisted_11$e, [
                ($setup.messages.length < 3)
                  ? (openBlock(), createElementBlock("div", _hoisted_12$d, [
                      (openBlock(), createElementBlock(Fragment, null, renderList($setup.suggestions, (item) => {
                        return createBaseVNode("button", {
                          key: item,
                          type: "button",
                          onClick: $event => ($setup.send(item))
                        }, toDisplayString(item), 9 /* TEXT, PROPS */, _hoisted_13$d)
                      }), 64 /* STABLE_FRAGMENT */))
                    ]))
                  : createCommentVNode("v-if", true),
                createBaseVNode("form", {
                  class: "ai-input",
                  onSubmit: _cache[3] || (_cache[3] = withModifiers($event => ($setup.send()), ["prevent"]))
                }, [
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => (($setup.input) = $event)),
                    type: "text",
                    placeholder: "问问持仓、风险或市场…",
                    enterkeyhint: "send"
                  }, null, 512 /* NEED_PATCH */), [
                    [vModelText, $setup.input]
                  ]),
                  createBaseVNode("button", {
                    type: "submit",
                    disabled: !$setup.input.trim() || $setup.loading,
                    "aria-label": "发送"
                  }, [
                    createVNode($setup["Icon"], {
                      name: "send",
                      size: 19
                    })
                  ], 8 /* PROPS */, _hoisted_14$d)
                ], 32 /* NEED_HYDRATION */),
                _cache[7] || (_cache[7] = createBaseVNode("p", null, "研究内容不构成投资建议 · 行情来自公开接口并可能延迟", -1 /* CACHED */))
              ])
            ])
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$m.render = render$m;
__sfc__$m.__file = "src/components/AiSheet.vue";

const TOKEN_KEY = "tide-auth-token-v1";

const authState = reactive({
  ready: false,
  loading: false,
  user: null,
  error: "",
  online: false,
});

function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function applyAuth(payload) {
  setToken(payload.token);
  authState.user = payload.user;
  authState.online = true;
  authState.error = "";
  return payload.user;
}

async function request(path, options = {}, requireAuth = false) {
  const token = getAuthToken();
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(requireAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "账户服务暂时不可用");
  return payload;
}

async function restoreSession() {
  authState.loading = true;
  try {
    if (!getAuthToken()) {
      authState.user = null;
      authState.online = false;
      return null;
    }
    const payload = await request("/api/auth/me", {}, true);
    authState.user = payload.user;
    authState.online = true;
    return payload.user;
  } catch {
    setToken("");
    authState.user = null;
    authState.online = false;
    return null;
  } finally {
    authState.loading = false;
    authState.ready = true;
  }
}

async function registerAccount({ username, password, displayName, portfolio, summary }) {
  authState.loading = true;
  authState.error = "";
  try {
    const payload = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, displayName, portfolio, summary }),
    });
    return applyAuth(payload);
  } catch (error) {
    authState.error = error instanceof Error ? error.message : "注册失败";
    throw error;
  } finally {
    authState.loading = false;
  }
}

async function loginAccount({ username, password }) {
  authState.loading = true;
  authState.error = "";
  try {
    const payload = await request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    return applyAuth(payload);
  } catch (error) {
    authState.error = error instanceof Error ? error.message : "登录失败";
    throw error;
  } finally {
    authState.loading = false;
  }
}

async function logoutAccount() {
  try {
    await request("/api/auth/logout", { method: "POST" }, true);
  } catch {
    // Local logout still proceeds if the server is temporarily unavailable.
  }
  setToken("");
  authState.user = null;
  authState.online = false;
}

async function saveUserState(portfolio, summary) {
  if (!getAuthToken() || !authState.user) return null;
  return request(
    "/api/user/state",
    {
      method: "POST",
      body: JSON.stringify({ portfolio, summary }),
      keepalive: true,
    },
    true,
  );
}

const __sfc__$l = {
  __name: 'AuthSheet',
  props: {
  open: { type: Boolean, default: false },
},
  emits: ["close", "authenticated", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;
const mode = ref("login");
const username = ref("");
const password = ref("");
const displayName = ref("");
const confirmPassword = ref("");
const error = ref("");
const submitting = ref(false);

const canSubmit = computed(
  () =>
    username.value.trim().length >= 3 &&
    password.value.length >= 6 &&
    (mode.value === "login" || password.value === confirmPassword.value),
);

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    error.value = "";
    password.value = "";
    confirmPassword.value = "";
  },
);

async function submit() {
  if (!canSubmit.value || submitting.value) return;
  error.value = "";
  submitting.value = true;
  try {
    let user;
    if (mode.value === "login") {
      user = await loginAccount({ username: username.value.trim(), password: password.value });
    } else {
      user = await registerAccount({
        username: username.value.trim(),
        password: password.value,
        displayName: displayName.value.trim() || username.value.trim(),
        portfolio: JSON.parse(JSON.stringify(portfolio)),
        summary: buildPortfolioSummary(),
      });
    }
    emit("authenticated", user);
    emit("notify", mode.value === "login" ? "账号登录成功，模拟数据已同步" : "账号创建成功，模拟数据已保存到云端");
    emit("close");
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : authState.error || "账户操作失败";
  } finally {
    submitting.value = false;
  }
}

const __returned__ = { props, emit, mode, username, password, displayName, confirmPassword, error, submitting, canSubmit, submit, computed, ref, watch, Icon: __sfc__$n, get buildPortfolioSummary() { return buildPortfolioSummary }, get portfolio() { return portfolio }, get authState() { return authState }, get loginAccount() { return loginAccount }, get registerAccount() { return registerAccount } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$l = {
  class: "bottom-sheet auth-sheet",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "账号登录"
};
const _hoisted_2$l = { class: "sheet-header" };
const _hoisted_3$l = { class: "auth-intro" };
const _hoisted_4$k = { class: "segmented auth-tabs" };
const _hoisted_5$i = { key: 0 };
const _hoisted_6$i = ["autocomplete"];
const _hoisted_7$i = { key: 1 };
const _hoisted_8$h = {
  key: 2,
  class: "auth-error"
};
const _hoisted_9$g = {
  key: 3,
  class: "auth-error"
};
const _hoisted_10$f = ["disabled"];

function render$l(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "sheet-backdrop auth-backdrop",
            onClick: _cache[7] || (_cache[7] = withModifiers($event => (_ctx.$emit('close')), ["self"]))
          }, [
            createBaseVNode("section", _hoisted_1$l, [
              _cache[14] || (_cache[14] = createBaseVNode("div", { class: "sheet-handle" }, null, -1 /* CACHED */)),
              createBaseVNode("header", _hoisted_2$l, [
                createBaseVNode("div", null, [
                  _cache[8] || (_cache[8] = createBaseVNode("p", null, "ACCOUNT SYNC", -1 /* CACHED */)),
                  createBaseVNode("h2", null, toDisplayString($setup.mode === "login" ? "登录观潮账号" : "创建观潮账号"), 1 /* TEXT */)
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 20
                  })
                ])
              ]),
              createBaseVNode("div", _hoisted_3$l, [
                createBaseVNode("span", null, [
                  createVNode($setup["Icon"], {
                    name: "user",
                    size: 20
                  })
                ]),
                _cache[9] || (_cache[9] = createBaseVNode("p", null, "登录后，模拟持仓、自选、提醒、财报和竞技身份会同步到你访问该服务的不同设备。", -1 /* CACHED */))
              ]),
              createBaseVNode("div", _hoisted_4$k, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: $setup.mode === 'login' }),
                  onClick: _cache[1] || (_cache[1] = $event => ($setup.mode = 'login'))
                }, "登录", 2 /* CLASS */),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: $setup.mode === 'register' }),
                  onClick: _cache[2] || (_cache[2] = $event => ($setup.mode = 'register'))
                }, "注册", 2 /* CLASS */)
              ]),
              createBaseVNode("form", {
                class: "auth-form",
                onSubmit: withModifiers($setup.submit, ["prevent"])
              }, [
                createBaseVNode("label", null, [
                  _cache[10] || (_cache[10] = createBaseVNode("span", null, "用户名", -1 /* CACHED */)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => (($setup.username) = $event)),
                    autocomplete: "username",
                    maxlength: "24",
                    placeholder: "3-24 位字母、数字或中文"
                  }, null, 512 /* NEED_PATCH */), [
                    [vModelText, $setup.username]
                  ])
                ]),
                ($setup.mode === 'register')
                  ? (openBlock(), createElementBlock("label", _hoisted_5$i, [
                      _cache[11] || (_cache[11] = createBaseVNode("span", null, "显示名称", -1 /* CACHED */)),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => (($setup.displayName) = $event)),
                        maxlength: "20",
                        placeholder: "好友竞技中显示的名字"
                      }, null, 512 /* NEED_PATCH */), [
                        [vModelText, $setup.displayName]
                      ])
                    ]))
                  : createCommentVNode("v-if", true),
                createBaseVNode("label", null, [
                  _cache[12] || (_cache[12] = createBaseVNode("span", null, "密码", -1 /* CACHED */)),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => (($setup.password) = $event)),
                    type: "password",
                    autocomplete: $setup.mode === 'login' ? 'current-password' : 'new-password',
                    maxlength: "64",
                    placeholder: "至少 6 位"
                  }, null, 8 /* PROPS */, _hoisted_6$i), [
                    [vModelText, $setup.password]
                  ])
                ]),
                ($setup.mode === 'register')
                  ? (openBlock(), createElementBlock("label", _hoisted_7$i, [
                      _cache[13] || (_cache[13] = createBaseVNode("span", null, "确认密码", -1 /* CACHED */)),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => (($setup.confirmPassword) = $event)),
                        type: "password",
                        autocomplete: "new-password",
                        maxlength: "64",
                        placeholder: "再次输入密码"
                      }, null, 512 /* NEED_PATCH */), [
                        [vModelText, $setup.confirmPassword]
                      ])
                    ]))
                  : createCommentVNode("v-if", true),
                ($setup.mode === 'register' && $setup.confirmPassword && $setup.password !== $setup.confirmPassword)
                  ? (openBlock(), createElementBlock("p", _hoisted_8$h, "两次输入的密码不一致"))
                  : createCommentVNode("v-if", true),
                ($setup.error)
                  ? (openBlock(), createElementBlock("p", _hoisted_9$g, toDisplayString($setup.error), 1 /* TEXT */))
                  : createCommentVNode("v-if", true),
                createBaseVNode("button", {
                  type: "submit",
                  class: "primary-button auth-submit",
                  disabled: !$setup.canSubmit || $setup.submitting
                }, toDisplayString($setup.submitting ? "正在连接…" : $setup.mode === "login" ? "登录并同步数据" : "创建账号并保存当前数据"), 9 /* TEXT, PROPS */, _hoisted_10$f)
              ], 32 /* NEED_HYDRATION */),
              _cache[15] || (_cache[15] = createBaseVNode("p", { class: "auth-note" }, "账号与模拟数据仅保存在运行当前应用的电脑服务中，属于课程演示级本地账户系统。", -1 /* CACHED */))
            ])
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$l.render = render$l;
__sfc__$l.__file = "src/components/AuthSheet.vue";

const __sfc__$k = {
  __name: 'BottomNav',
  props: {
  active: { type: String, default: "home" },
},
  emits: ["navigate"],
  setup(__props, { expose: __expose }) {
  __expose();





const items = [
  { id: "home", label: "首页", icon: "home" },
  { id: "market", label: "行情", icon: "market" },
  { id: "portfolio", label: "模拟盘", icon: "portfolio" },
  { id: "insights", label: "分析", icon: "insights" },
  { id: "profile", label: "我的", icon: "user" },
];

const __returned__ = { items, Icon: __sfc__$n };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$k = {
  class: "bottom-nav",
  "aria-label": "主导航"
};
const _hoisted_2$k = ["onClick"];
const _hoisted_3$k = { class: "nav-icon" };
const _hoisted_4$j = { key: 0 };

function render$k(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("nav", _hoisted_1$k, [
    (openBlock(), createElementBlock(Fragment, null, renderList($setup.items, (item) => {
      return createBaseVNode("button", {
        key: item.id,
        type: "button",
        class: normalizeClass(["nav-item", { active: $props.active === item.id }]),
        onClick: $event => (_ctx.$emit('navigate', item.id))
      }, [
        createBaseVNode("span", _hoisted_3$k, [
          createVNode($setup["Icon"], {
            name: item.icon,
            size: 21
          }, null, 8 /* PROPS */, ["name"]),
          ($props.active === item.id)
            ? (openBlock(), createElementBlock("i", _hoisted_4$j))
            : createCommentVNode("v-if", true)
        ]),
        createBaseVNode("span", null, toDisplayString(item.label), 1 /* TEXT */)
      ], 10 /* CLASS, PROPS */, _hoisted_2$k)
    }), 64 /* STABLE_FRAGMENT */))
  ]))
}
__sfc__$k.render = render$k;
__sfc__$k.__file = "src/components/BottomNav.vue";

function formatPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "—";
  return amount.toFixed(2);
}

function formatPct(value) {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount > 0 ? "+" : ""}${amount.toFixed(2)}%`;
}

function trendClass(value) {
  if (Number(value) > 0) return "rise";
  if (Number(value) < 0) return "fall";
  return "flat";
}

const __sfc__$j = {
  __name: 'StockPickerSheet',
  props: {
  open: { type: Boolean, default: false },
  mode: { type: String, default: "trade" },
},
  emits: ["close", "select", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;
const query = ref("");
const inputRef = ref(null);
const remoteResults = ref([]);
const loading = ref(false);
const error = ref("");
let debounceTimer;
let requestId = 0;

const quickItems = computed(() => {
  if (props.mode === "watch") {
    return [
      ...watchStocks.value,
      ...stocks.filter((stock) => !portfolio.watchlist.includes(stock.code)),
    ].slice(0, 10);
  }
  const heldCodes = new Set(holdings.value.map((item) => item.code));
  return [
    ...holdings.value.map((item) => item.stock),
    ...watchStocks.value.filter((stock) => !heldCodes.has(stock.code)),
    ...stocks,
  ]
    .filter((stock, index, list) => list.findIndex((item) => item.code === stock.code) === index)
    .slice(0, 10);
});

const localSearchResults = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return [];
  return stocks.filter((stock) =>
    `${stock.name} ${stock.code} ${stock.sector} ${stock.market}`.toLowerCase().includes(keyword),
  );
});

const visibleItems = computed(() => {
  if (!query.value.trim()) return quickItems.value;
  const localCodes = new Set(localSearchResults.value.map((stock) => stock.code));
  return [
    ...localSearchResults.value,
    ...remoteResults.value.filter((stock) => !localCodes.has(stock.code)),
  ];
});

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    query.value = "";
    remoteResults.value = [];
    error.value = "";
    await nextTick();
    inputRef.value?.focus();
  },
);

watch(query, (value) => {
  window.clearTimeout(debounceTimer);
  error.value = "";
  if (!value.trim()) {
    remoteResults.value = [];
    loading.value = false;
    return;
  }
  debounceTimer = window.setTimeout(async () => {
    const currentRequest = ++requestId;
    loading.value = true;
    try {
      const result = await searchStocks(value);
      if (currentRequest === requestId) remoteResults.value = result;
    } catch (requestError) {
      if (currentRequest === requestId) {
        remoteResults.value = [];
        error.value = requestError instanceof Error ? requestError.message : "搜索失败";
      }
    } finally {
      if (currentRequest === requestId) loading.value = false;
    }
  }, 260);
});

onBeforeUnmount(() => window.clearTimeout(debounceTimer));

function choose(item) {
  const stock = registerStock(item);
  if (props.mode === "trade") {
    emit("select", stock);
    return;
  }
  const added = toggleWatch(stock.code);
  emit("notify", added ? `${stock.name} 已加入自选` : `${stock.name} 已移出自选`);
  if (query.value && added) query.value = "";
}

function isWatched(item) {
  return portfolio.watchlist.includes(item.code);
}

const __returned__ = { props, emit, query, inputRef, remoteResults, loading, error, get debounceTimer() { return debounceTimer }, set debounceTimer(v) { debounceTimer = v; }, get requestId() { return requestId }, set requestId(v) { requestId = v; }, quickItems, localSearchResults, visibleItems, choose, isWatched, computed, nextTick, onBeforeUnmount, ref, watch, Icon: __sfc__$n, get holdings() { return holdings }, get portfolio() { return portfolio }, get registerStock() { return registerStock }, get searchStocks() { return searchStocks }, get stocks() { return stocks }, get toggleWatch() { return toggleWatch }, get watchStocks() { return watchStocks }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$j = ["aria-label"];
const _hoisted_2$j = { class: "sheet-header picker-header" };
const _hoisted_3$j = { class: "picker-search" };
const _hoisted_4$i = { class: "picker-meta" };
const _hoisted_5$h = { key: 0 };
const _hoisted_6$h = { key: 1 };
const _hoisted_7$h = { class: "picker-list" };
const _hoisted_8$g = ["onClick"];
const _hoisted_9$f = { class: "stock-monogram" };
const _hoisted_10$e = { class: "pick-copy" };
const _hoisted_11$d = ["onClick"];
const _hoisted_12$c = ["onClick"];
const _hoisted_13$c = {
  key: 0,
  class: "picker-empty"
};
const _hoisted_14$c = {
  key: 1,
  class: "picker-empty"
};
const _hoisted_15$b = { class: "picker-note" };

function render$j(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "sheet-backdrop picker-backdrop",
            onClick: _cache[3] || (_cache[3] = withModifiers($event => (_ctx.$emit('close')), ["self"]))
          }, [
            createBaseVNode("section", {
              class: "bottom-sheet stock-picker-sheet",
              role: "dialog",
              "aria-modal": "true",
              "aria-label": $props.mode === 'trade' ? '选择交易股票' : '添加自选股票'
            }, [
              _cache[7] || (_cache[7] = createBaseVNode("div", { class: "sheet-handle" }, null, -1 /* CACHED */)),
              createBaseVNode("header", _hoisted_2$j, [
                createBaseVNode("div", null, [
                  createBaseVNode("p", null, toDisplayString($props.mode === "trade" ? "SIMULATED ORDER" : "WATCHLIST"), 1 /* TEXT */),
                  createBaseVNode("h2", null, toDisplayString($props.mode === "trade" ? "选择交易股票" : "管理自选股票"), 1 /* TEXT */)
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 20
                  })
                ])
              ]),
              createBaseVNode("label", _hoisted_3$j, [
                createVNode($setup["Icon"], {
                  name: "search",
                  size: 17
                }),
                withDirectives(createBaseVNode("input", {
                  ref: "inputRef",
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($setup.query) = $event)),
                  type: "search",
                  placeholder: "搜索任意 A 股名称或代码"
                }, null, 512 /* NEED_PATCH */), [
                  [vModelText, $setup.query]
                ]),
                ($setup.query)
                  ? (openBlock(), createElementBlock("button", {
                      key: 0,
                      type: "button",
                      "aria-label": "清空",
                      onClick: _cache[2] || (_cache[2] = $event => ($setup.query = ''))
                    }, [
                      createVNode($setup["Icon"], {
                        name: "close",
                        size: 15
                      })
                    ]))
                  : createCommentVNode("v-if", true)
              ]),
              createBaseVNode("div", _hoisted_4$i, [
                createBaseVNode("span", null, toDisplayString($setup.query ? `搜索结果 ${$setup.visibleItems.length} 个` : $props.mode === "trade" ? "持仓与自选优先" : "常用 A 股"), 1 /* TEXT */),
                ($setup.loading)
                  ? (openBlock(), createElementBlock("span", _hoisted_5$h, [...(_cache[4] || (_cache[4] = [
                      createBaseVNode("i", { class: "loading-dot" }, null, -1 /* CACHED */),
                      createTextVNode(" 搜索中", -1 /* CACHED */)
                    ]))]))
                  : (openBlock(), createElementBlock("span", _hoisted_6$h, "数据来自公开行情接口"))
              ]),
              createBaseVNode("div", _hoisted_7$h, [
                (openBlock(true), createElementBlock(Fragment, null, renderList($setup.visibleItems, (item) => {
                  return (openBlock(), createElementBlock("article", {
                    key: item.secid || item.code,
                    class: "picker-row"
                  }, [
                    createBaseVNode("button", {
                      type: "button",
                      class: "picker-stock-button",
                      onClick: $event => ($setup.choose(item))
                    }, [
                      createBaseVNode("span", _hoisted_9$f, toDisplayString(item.name.slice(0, 1)), 1 /* TEXT */),
                      createBaseVNode("span", _hoisted_10$e, [
                        createBaseVNode("strong", null, toDisplayString(item.name), 1 /* TEXT */),
                        createBaseVNode("small", null, toDisplayString(item.code) + " · " + toDisplayString(item.sector || item.type || item.market), 1 /* TEXT */)
                      ])
                    ], 8 /* PROPS */, _hoisted_8$g),
                    (item.price)
                      ? (openBlock(), createElementBlock("span", {
                          key: 0,
                          class: normalizeClass(["pick-quote", $setup.trendClass(item.changePercent)])
                        }, [
                          createBaseVNode("strong", null, toDisplayString($setup.formatPrice(item.price)), 1 /* TEXT */),
                          createBaseVNode("small", null, toDisplayString($setup.formatPct(item.changePercent)), 1 /* TEXT */)
                        ], 2 /* CLASS */))
                      : createCommentVNode("v-if", true),
                    ($props.mode === 'trade')
                      ? (openBlock(), createElementBlock("button", {
                          key: 1,
                          type: "button",
                          class: "pick-action",
                          onClick: $event => ($setup.choose(item))
                        }, " 选择 ", 8 /* PROPS */, _hoisted_11$d))
                      : (openBlock(), createElementBlock("button", {
                          key: 2,
                          type: "button",
                          class: normalizeClass(["pick-action", { active: $setup.isWatched(item) }]),
                          onClick: $event => ($setup.choose(item))
                        }, toDisplayString($setup.isWatched(item) ? "移出" : "添加"), 11 /* TEXT, CLASS, PROPS */, _hoisted_12$c))
                  ]))
                }), 128 /* KEYED_FRAGMENT */)),
                ($setup.error)
                  ? (openBlock(), createElementBlock("div", _hoisted_13$c, [
                      _cache[5] || (_cache[5] = createBaseVNode("strong", null, "搜索服务暂时不可用", -1 /* CACHED */)),
                      createBaseVNode("span", null, toDisplayString($setup.error), 1 /* TEXT */)
                    ]))
                  : ($setup.query && !$setup.loading && !$setup.visibleItems.length)
                    ? (openBlock(), createElementBlock("div", _hoisted_14$c, [...(_cache[6] || (_cache[6] = [
                        createBaseVNode("strong", null, "没有找到相关 A 股", -1 /* CACHED */),
                        createBaseVNode("span", null, "请尝试完整名称、代码或拼音缩写。", -1 /* CACHED */)
                      ]))]))
                    : createCommentVNode("v-if", true)
              ]),
              createBaseVNode("p", _hoisted_15$b, toDisplayString($props.mode === "trade" ? "选择后将进入买入面板，仍可使用卖出切换方向。" : "自选列表会与首页、行情页和股票详情页同步。"), 1 /* TEXT */)
            ], 8 /* PROPS */, _hoisted_1$j)
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$j.render = render$j;
__sfc__$j.__file = "src/components/StockPickerSheet.vue";

const __sfc__$i = {
  __name: 'TradeSheet',
  props: {
  open: { type: Boolean, default: false },
  stock: { type: Object, default: null },
  initialType: { type: String, default: "buy" },
  cash: { type: Number, default: 0 },
},
  emits: ["close", "complete"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;
const type = ref("buy");
const shares = ref(100);
const note = ref("");

watch(
  () => [props.open, props.initialType],
  ([open, nextType]) => {
    if (open) {
      type.value = nextType || "buy";
      shares.value = 100;
      note.value = "";
    }
  },
  { immediate: true },
);

const position = computed(() => (props.stock ? getPosition(props.stock.code) : null));
const gross = computed(() => (props.stock?.price || 0) * shares.value);
const fee = computed(() => Math.max(5, gross.value * 0.00025) + (type.value === "sell" ? gross.value * 0.0005 : 0));
const total = computed(() => gross.value + fee.value);
const availableShares = computed(() =>
  Math.min(position.value?.availableShares ?? position.value?.shares ?? 0, position.value?.shares ?? 0),
);

function changeShares(amount) {
  shares.value = Math.max(100, shares.value + amount);
}

function submit() {
  const result = executeTrade({
    code: props.stock.code,
    type: type.value,
    shares: shares.value,
    price: props.stock.price,
    note: note.value,
  });
  emit("complete", result);
  if (result.ok) emit("close");
}

const __returned__ = { props, emit, type, shares, note, position, gross, fee, total, availableShares, changeShares, submit, computed, ref, watch, Icon: __sfc__$n, get executeTrade() { return executeTrade }, get formatMoney() { return formatMoney }, get getPosition() { return getPosition }, get tradingStatus() { return tradingStatus }, get formatPrice() { return formatPrice } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$i = {
  class: "bottom-sheet trade-sheet",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "模拟交易"
};
const _hoisted_2$i = { class: "sheet-header" };
const _hoisted_3$i = { class: "trade-toggle" };
const _hoisted_4$h = { class: "trade-price-row" };
const _hoisted_5$g = { class: "trade-field" };
const _hoisted_6$g = { class: "stepper" };
const _hoisted_7$g = { class: "quantity-chips" };
const _hoisted_8$f = ["onClick"];
const _hoisted_9$e = { class: "trade-note-field" };
const _hoisted_10$d = { class: "trade-available" };
const _hoisted_11$c = { key: 0 };
const _hoisted_12$b = { key: 1 };
const _hoisted_13$b = {
  key: 0,
  class: "t1-note"
};
const _hoisted_14$b = { class: "trade-total" };
const _hoisted_15$a = ["disabled"];

function render$i(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open && $props.stock)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "sheet-backdrop",
            onClick: _cache[7] || (_cache[7] = withModifiers($event => (_ctx.$emit('close')), ["self"]))
          }, [
            createBaseVNode("section", _hoisted_1$i, [
              _cache[16] || (_cache[16] = createBaseVNode("div", { class: "sheet-handle" }, null, -1 /* CACHED */)),
              createBaseVNode("header", _hoisted_2$i, [
                createBaseVNode("div", null, [
                  _cache[8] || (_cache[8] = createBaseVNode("p", null, "虚拟资金交易", -1 /* CACHED */)),
                  createBaseVNode("h2", null, [
                    createTextVNode(toDisplayString($props.stock.name) + " ", 1 /* TEXT */),
                    createBaseVNode("small", null, toDisplayString($props.stock.code), 1 /* TEXT */)
                  ])
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 20
                  })
                ])
              ]),
              createBaseVNode("div", _hoisted_3$i, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: $setup.type === 'buy', buy: $setup.type === 'buy' }),
                  onClick: _cache[1] || (_cache[1] = $event => ($setup.type = 'buy'))
                }, "买入", 2 /* CLASS */),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: $setup.type === 'sell', sell: $setup.type === 'sell' }),
                  onClick: _cache[2] || (_cache[2] = $event => ($setup.type = 'sell'))
                }, "卖出", 2 /* CLASS */)
              ]),
              createBaseVNode("div", {
                class: normalizeClass(["session-trade-banner", { open: $setup.tradingStatus.canTrade }])
              }, [
                createVNode($setup["Icon"], {
                  name: $setup.tradingStatus.canTrade ? 'check' : 'clock',
                  size: 16
                }, null, 8 /* PROPS */, ["name"]),
                createBaseVNode("div", null, [
                  createBaseVNode("strong", null, toDisplayString($setup.tradingStatus.label), 1 /* TEXT */),
                  createBaseVNode("span", null, toDisplayString($setup.tradingStatus.detail), 1 /* TEXT */)
                ])
              ], 2 /* CLASS */),
              createBaseVNode("div", _hoisted_4$h, [
                _cache[9] || (_cache[9] = createBaseVNode("span", null, "委托价", -1 /* CACHED */)),
                createBaseVNode("strong", null, "¥ " + toDisplayString($setup.formatPrice($props.stock.price)), 1 /* TEXT */),
                _cache[10] || (_cache[10] = createBaseVNode("small", null, "模拟现价", -1 /* CACHED */))
              ]),
              createBaseVNode("label", _hoisted_5$g, [
                _cache[12] || (_cache[12] = createBaseVNode("span", null, "数量", -1 /* CACHED */)),
                createBaseVNode("div", _hoisted_6$g, [
                  createBaseVNode("button", {
                    type: "button",
                    "aria-label": "减少数量",
                    onClick: _cache[3] || (_cache[3] = $event => ($setup.changeShares(-100)))
                  }, [
                    createVNode($setup["Icon"], {
                      name: "minus",
                      size: 17
                    })
                  ]),
                  withDirectives(createBaseVNode("input", {
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => (($setup.shares) = $event)),
                    type: "number",
                    min: "100",
                    step: "100",
                    inputmode: "numeric"
                  }, null, 512 /* NEED_PATCH */), [
                    [
                      vModelText,
                      $setup.shares,
                      void 0,
                      { number: true }
                    ]
                  ]),
                  _cache[11] || (_cache[11] = createBaseVNode("span", null, "股", -1 /* CACHED */)),
                  createBaseVNode("button", {
                    type: "button",
                    "aria-label": "增加数量",
                    onClick: _cache[5] || (_cache[5] = $event => ($setup.changeShares(100)))
                  }, [
                    createVNode($setup["Icon"], {
                      name: "plus",
                      size: 17
                    })
                  ])
                ])
              ]),
              createBaseVNode("div", _hoisted_7$g, [
                (openBlock(), createElementBlock(Fragment, null, renderList([100, 300, 500, 1000], (amount) => {
                  return createBaseVNode("button", {
                    key: amount,
                    type: "button",
                    class: normalizeClass({ active: $setup.shares === amount }),
                    onClick: $event => ($setup.shares = amount)
                  }, toDisplayString(amount), 11 /* TEXT, CLASS, PROPS */, _hoisted_8$f)
                }), 64 /* STABLE_FRAGMENT */))
              ]),
              createBaseVNode("label", _hoisted_9$e, [
                _cache[13] || (_cache[13] = createBaseVNode("span", null, "交易理由（可选）", -1 /* CACHED */)),
                withDirectives(createBaseVNode("textarea", {
                  "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => (($setup.note) = $event)),
                  maxlength: "100",
                  rows: "2",
                  placeholder: "例如：按计划分批建仓，记录本次判断…"
                }, null, 512 /* NEED_PATCH */), [
                  [vModelText, $setup.note]
                ])
              ]),
              createBaseVNode("div", _hoisted_10$d, [
                ($setup.type === 'buy')
                  ? (openBlock(), createElementBlock("span", _hoisted_11$c, [
                      _cache[14] || (_cache[14] = createTextVNode("可用资金 ", -1 /* CACHED */)),
                      createBaseVNode("strong", null, "¥ " + toDisplayString($setup.formatMoney($props.cash)), 1 /* TEXT */)
                    ]))
                  : (openBlock(), createElementBlock("span", _hoisted_12$b, [
                      _cache[15] || (_cache[15] = createTextVNode("可卖数量 ", -1 /* CACHED */)),
                      createBaseVNode("strong", null, toDisplayString($setup.availableShares) + " 股", 1 /* TEXT */)
                    ])),
                createBaseVNode("span", null, "预计费用 ¥" + toDisplayString($setup.fee.toFixed(2)), 1 /* TEXT */)
              ]),
              ($setup.position?.pendingShares)
                ? (openBlock(), createElementBlock("p", _hoisted_13$b, toDisplayString($setup.position.pendingShares) + " 股为当日买入，按 T+1 规则下一交易日可卖 ", 1 /* TEXT */))
                : createCommentVNode("v-if", true),
              createBaseVNode("div", _hoisted_14$b, [
                createBaseVNode("span", null, toDisplayString($setup.type === "buy" ? "预计支出" : "预计到账"), 1 /* TEXT */),
                createBaseVNode("strong", null, "¥ " + toDisplayString($setup.formatMoney($setup.type === "buy" ? $setup.total : $setup.gross - $setup.fee)), 1 /* TEXT */)
              ]),
              createBaseVNode("button", {
                type: "button",
                class: normalizeClass(["primary-button trade-submit", { sell: $setup.type === 'sell' }]),
                disabled: !$setup.tradingStatus.canTrade,
                onClick: $setup.submit
              }, toDisplayString($setup.tradingStatus.canTrade ? ($setup.type === "buy" ? "确认买入" : "确认卖出") : `${$setup.tradingStatus.label}，暂停成交`), 11 /* TEXT, CLASS, PROPS */, _hoisted_15$a),
              _cache[17] || (_cache[17] = createBaseVNode("p", { class: "legal-note" }, "按 A 股交易时段模拟成交，执行 T+1 可卖规则；不构成投资建议。", -1 /* CACHED */))
            ])
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$i.render = render$i;
__sfc__$i.__file = "src/components/TradeSheet.vue";

const THEME_KEY = "tide-appearance-v1";

function loadThemeMode() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return ["auto", "day", "night"].includes(saved) ? saved : "auto";
  } catch {
    return "auto";
  }
}

const themeMode = ref(loadThemeMode());
const clockTick = ref(Date.now());

const resolvedTheme = computed(() => {
  if (themeMode.value === "day") return "light";
  if (themeMode.value === "night") return "dark";
  const hour = new Date(clockTick.value).getHours();
  return hour >= 7 && hour < 19 ? "light" : "dark";
});

function setThemeMode(mode) {
  if (!["auto", "day", "night"].includes(mode)) return;
  themeMode.value = mode;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // Theme still changes for the current session when storage is unavailable.
  }
}

function toggleTheme() {
  setThemeMode(resolvedTheme.value === "light" ? "night" : "day");
}

watch(
  resolvedTheme,
  (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  },
  { immediate: true },
);

if (typeof window !== "undefined") {
  window.setInterval(() => {
    clockTick.value = Date.now();
  }, 60000);
}

const CODE_KEY = "tide-competition-code";

function getSavedCompetitionCode() {
  return localStorage.getItem(CODE_KEY) || "";
}

function setSavedCompetitionCode(code) {
  if (code) localStorage.setItem(CODE_KEY, code);
  else localStorage.removeItem(CODE_KEY);
}

async function competitionRequest(path, options = {}) {
  const token = getAuthToken();
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: "no-store",
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.ok) throw new Error(payload.error || "竞技服务暂时不可用");
  return payload;
}

async function createCompetition(roomName) {
  await saveUserState(portfolio, buildPortfolioSummary());
  const payload = await competitionRequest("/api/competition/create", {
    method: "POST",
    body: JSON.stringify({
      name: roomName,
    }),
  });
  setSavedCompetitionCode(payload.code);
  return payload;
}

async function joinCompetition(code) {
  await saveUserState(portfolio, buildPortfolioSummary());
  const payload = await competitionRequest("/api/competition/join", {
    method: "POST",
    body: JSON.stringify({
      code: String(code || "").trim(),
    }),
  });
  setSavedCompetitionCode(payload.code);
  return payload;
}

async function fetchCompetition(code) {
  return competitionRequest(`/api/competition?code=${encodeURIComponent(code)}`);
}

async function syncCompetitionSnapshot() {
  const code = getSavedCompetitionCode();
  if (!code) return null;
  await saveUserState(portfolio, buildPortfolioSummary());
  return competitionRequest("/api/competition/update", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

const __sfc__$h = {
  __name: 'AlertsView',
  emits: ["back", "select-stock", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const tab = ref("active");

const visibleAlerts = computed(() =>
  portfolio.alerts.filter((alert) => (tab.value === "active" ? !alert.triggered : alert.triggered)),
);

function stockOf(alert) {
  return getStock(alert.code);
}

function remove(alert) {
  removePriceAlert(alert.id);
  emit("notify", "价格提醒已删除");
}

function openStock(alert) {
  const stock = stockOf(alert);
  if (stock) emit("select-stock", stock);
}

onMounted(markNotificationsRead);

const __returned__ = { emit, tab, visibleAlerts, stockOf, remove, openStock, computed, onMounted, ref, Icon: __sfc__$n, get activeAlertCount() { return activeAlertCount }, get getStock() { return getStock }, get markNotificationsRead() { return markNotificationsRead }, get portfolio() { return portfolio }, get removePriceAlert() { return removePriceAlert }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$h = { class: "page alerts-view" };
const _hoisted_2$h = { class: "detail-header alerts-header" };
const _hoisted_3$h = { class: "alert-count-badge" };
const _hoisted_4$g = { class: "alerts-summary" };
const _hoisted_5$f = { class: "alerts-summary-icon" };
const _hoisted_6$f = { class: "segmented alert-tabs" };
const _hoisted_7$f = {
  key: 0,
  class: "alert-list"
};
const _hoisted_8$e = ["onClick"];
const _hoisted_9$d = { class: "alert-progress" };
const _hoisted_10$c = ["onClick"];
const _hoisted_11$b = {
  key: 1,
  class: "empty-state alerts-empty"
};

function render$h(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$h, [
    createBaseVNode("header", _hoisted_2$h, [
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "返回",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('back')))
      }, [
        createVNode($setup["Icon"], {
          name: "arrowLeft",
          size: 21
        })
      ]),
      _cache[3] || (_cache[3] = createBaseVNode("div", { class: "detail-title" }, [
        createBaseVNode("strong", null, "价格提醒"),
        createBaseVNode("span", null, "真实行情触发 · 本地通知")
      ], -1 /* CACHED */)),
      createBaseVNode("span", _hoisted_3$h, toDisplayString($setup.activeAlertCount), 1 /* TEXT */)
    ]),
    createBaseVNode("main", null, [
      createBaseVNode("section", _hoisted_4$g, [
        createBaseVNode("span", _hoisted_5$f, [
          createVNode($setup["Icon"], {
            name: "bell",
            size: 21
          })
        ]),
        createBaseVNode("div", null, [
          _cache[4] || (_cache[4] = createBaseVNode("span", null, "正在监控", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($setup.activeAlertCount) + " 条价格提醒", 1 /* TEXT */)
        ]),
        _cache[5] || (_cache[5] = createBaseVNode("small", null, "页面打开时自动刷新", -1 /* CACHED */))
      ]),
      createBaseVNode("div", _hoisted_6$f, [
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.tab === 'active' }),
          onClick: _cache[1] || (_cache[1] = $event => ($setup.tab = 'active'))
        }, "监控中", 2 /* CLASS */),
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.tab === 'triggered' }),
          onClick: _cache[2] || (_cache[2] = $event => ($setup.tab = 'triggered'))
        }, "已触发", 2 /* CLASS */)
      ]),
      ($setup.visibleAlerts.length)
        ? (openBlock(), createElementBlock("section", _hoisted_7$f, [
            (openBlock(true), createElementBlock(Fragment, null, renderList($setup.visibleAlerts, (alert) => {
              return (openBlock(), createElementBlock("article", {
                key: alert.id,
                class: "alert-card"
              }, [
                createBaseVNode("button", {
                  type: "button",
                  class: "alert-stock",
                  onClick: $event => ($setup.openStock(alert))
                }, [
                  createBaseVNode("span", null, toDisplayString(alert.name.slice(0, 1)), 1 /* TEXT */),
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(alert.name), 1 /* TEXT */),
                    createBaseVNode("small", null, toDisplayString(alert.code) + " · " + toDisplayString(alert.direction === "above" ? "价格高于" : "价格低于") + " ¥" + toDisplayString($setup.formatPrice(alert.target)), 1 /* TEXT */)
                  ]),
                  createVNode($setup["Icon"], {
                    name: "chevronRight",
                    size: 16
                  })
                ], 8 /* PROPS */, _hoisted_8$e),
                createBaseVNode("div", _hoisted_9$d, [
                  createBaseVNode("div", null, [
                    _cache[6] || (_cache[6] = createBaseVNode("span", null, "最新价", -1 /* CACHED */)),
                    createBaseVNode("strong", {
                      class: normalizeClass($setup.trendClass($setup.stockOf(alert)?.changePercent))
                    }, " ¥" + toDisplayString($setup.formatPrice($setup.stockOf(alert)?.price)), 3 /* TEXT, CLASS */)
                  ]),
                  createBaseVNode("div", null, [
                    _cache[7] || (_cache[7] = createBaseVNode("span", null, "目标价", -1 /* CACHED */)),
                    createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatPrice(alert.target)), 1 /* TEXT */)
                  ]),
                  createBaseVNode("button", {
                    type: "button",
                    onClick: $event => ($setup.remove(alert))
                  }, "删除", 8 /* PROPS */, _hoisted_10$c)
                ])
              ]))
            }), 128 /* KEYED_FRAGMENT */))
          ]))
        : (openBlock(), createElementBlock("div", _hoisted_11$b, [
            createBaseVNode("span", null, [
              createVNode($setup["Icon"], {
                name: $setup.tab === 'active' ? 'bell' : 'check',
                size: 28
              }, null, 8 /* PROPS */, ["name"])
            ]),
            createBaseVNode("strong", null, toDisplayString($setup.tab === "active" ? "暂无监控中的提醒" : "还没有触发记录"), 1 /* TEXT */),
            _cache[8] || (_cache[8] = createBaseVNode("p", null, "在任意股票详情页点击“价格提醒”，设置你的目标价格。", -1 /* CACHED */))
          ])),
      _cache[9] || (_cache[9] = createBaseVNode("section", { class: "alert-help" }, [
        createBaseVNode("div", { class: "section-heading compact" }, [
          createBaseVNode("div", null, [
            createBaseVNode("span", null, "HOW IT WORKS"),
            createBaseVNode("h2", null, "提醒如何工作")
          ])
        ]),
        createBaseVNode("p", null, "开启自动刷新后，应用会按设定间隔读取实时行情并检查目标价。提醒保存在当前浏览器，关闭页面后不会在后台运行。"),
        createBaseVNode("p", null, "由于公开行情存在短时延迟，提醒触发价格仅用于学习与观察，不用于真实交易执行。")
      ], -1 /* CACHED */))
    ])
  ]))
}
__sfc__$h.render = render$h;
__sfc__$h.__file = "src/views/AlertsView.vue";

const POSTER_COLORS = {
  background: "#071520",
  backgroundEnd: "#0a1b27",
  panel: "rgba(18, 45, 60, 0.78)",
  panelLight: "rgba(28, 62, 78, 0.58)",
  line: "rgba(150, 207, 214, 0.16)",
  text: "#f2f7f9",
  muted: "#7d97a6",
  faint: "#5d7888",
  cyan: "#8ee5e4",
  rise: "#f1736b",
  fall: "#2bc89b",
  gold: "#e7c373",
};

function roundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawPosterBackground(context, width, height, accent = "#71d4d5") {
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#06121d");
  background.addColorStop(0.52, "#0b2432");
  background.addColorStop(1, "#07141f");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(width * 0.82, 40, 20, width * 0.82, 40, width * 0.55);
  glow.addColorStop(0, hexToRgba(accent, 0.23));
  glow.addColorStop(1, hexToRgba(accent, 0));
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height * 0.58);

  context.strokeStyle = hexToRgba(accent, 0.08);
  context.lineWidth = 1.5;
  for (let radius = 180; radius < 620; radius += 78) {
    context.beginPath();
    context.arc(width - 60, 30, radius, Math.PI * 0.25, Math.PI * 1.65);
    context.stroke();
  }

  const vignette = context.createLinearGradient(0, height * 0.7, 0, height);
  vignette.addColorStop(0, "rgba(4, 12, 19, 0)");
  vignette.addColorStop(1, "rgba(3, 10, 16, 0.46)");
  context.fillStyle = vignette;
  context.fillRect(0, height * 0.7, width, height * 0.3);
}

function drawBrand(context, x = 72, y = 60) {
  context.fillStyle = "#9fe9e9";
  roundRect(context, x, y, 56, 56, 16);
  context.fill();
  context.fillStyle = "#0a2630";
  [18, 30, 42].forEach((barHeight, index) => {
    context.fillRect(x + 10 + index * 11, y + 45 - barHeight, 7, barHeight);
  });
  context.fillStyle = POSTER_COLORS.text;
  context.font = '600 36px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮", x + 74, y + 40);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '600 15px "Avenir Next", sans-serif';
  context.fillText("TIDE MARKET LAB · 模拟投资记录", x + 75, y + 66);
}

function drawPill(context, text, x, y, color = POSTER_COLORS.cyan) {
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  const width = context.measureText(text).width + 28;
  roundRect(context, x, y, width, 34, 17);
  context.fillStyle = hexToRgba(color, 0.12);
  context.fill();
  context.strokeStyle = hexToRgba(color, 0.24);
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = color;
  context.fillText(text, x + 14, y + 23);
  return width;
}

function drawMetricCard(context, { x, y, width, height, label, value, note, tone = POSTER_COLORS.text }) {
  roundRect(context, x, y, width, height, 18);
  context.fillStyle = POSTER_COLORS.panelLight;
  context.fill();
  context.strokeStyle = POSTER_COLORS.line;
  context.stroke();
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(label, x + 20, y + 30);
  context.fillStyle = tone;
  context.font = '700 29px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(value, x + 20, y + 67);
  if (note) {
    context.fillStyle = POSTER_COLORS.faint;
    context.font = '500 14px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText(note, x + 20, y + 90);
  }
}

function drawLineChart(context, values, box, color) {
  const { x, y, width, height } = box;
  if (!values?.length) return;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => ({
    x: x + (index / Math.max(1, values.length - 1)) * width,
    y: y + height - ((value - min) / range) * (height - 18),
  }));

  context.strokeStyle = "rgba(164, 205, 214, 0.09)";
  context.lineWidth = 1;
  context.setLineDash([6, 8]);
  for (let index = 0; index < 4; index += 1) {
    const gridY = y + (index * height) / 3;
    context.beginPath();
    context.moveTo(x, gridY);
    context.lineTo(x + width, gridY);
    context.stroke();
  }
  context.setLineDash([]);

  const fill = context.createLinearGradient(0, y, 0, y + height);
  fill.addColorStop(0, hexToRgba(color, 0.3));
  fill.addColorStop(1, hexToRgba(color, 0));
  context.beginPath();
  context.moveTo(points[0].x, y + height);
  points.forEach((point) => context.lineTo(point.x, point.y));
  context.lineTo(points.at(-1).x, y + height);
  context.closePath();
  context.fillStyle = fill;
  context.fill();

  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else {
      const previous = points[index - 1];
      const controlX = (previous.x + point.x) / 2;
      context.bezierCurveTo(controlX, previous.y, controlX, point.y, point.x, point.y);
    }
  });
  context.strokeStyle = color;
  context.lineWidth = 4.2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();

  const last = points.at(-1);
  context.beginPath();
  context.arc(last.x, last.y, 6, 0, Math.PI * 2);
  context.fillStyle = "#ffffff";
  context.fill();
  context.beginPath();
  context.arc(last.x, last.y, 3, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const normalized = value.length === 3 ? value.split("").map((char) => char + char).join("") : value;
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const __sfc__$g = {
  __name: 'CompetitionShareCard',
  props: {
  open: { type: Boolean, default: false },
  participant: { type: Object, default: null },
  roomCode: { type: String, default: "" },
},
  emits: ["close", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;
const emit = __emit;
const canvasRef = ref(null);
const previewUrl = ref("");
let blob = null;

function formatSignedMoney(value) {
  const number = Number(value) || 0;
  return `${number > 0 ? "+" : ""}¥${formatMoney(number, 0)}`;
}

async function drawCard() {
  if (!props.participant || !canvasRef.value) return;
  await document.fonts?.ready;
  const participant = props.participant;
  const positions = participant.positions || [];
  const canvas = canvasRef.value;
  const rowHeight = 88;
  const height = Math.max(1080, 746 + positions.length * rowHeight + 90);
  canvas.width = 1080;
  canvas.height = height;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  drawPosterBackground(context, width, height, "#e4bd6a");
  drawBrand(context);
  drawPill(context, `竞技排行 #${participant.rank || "—"}`, 790, 68, POSTER_COLORS.gold);

  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`观潮好友竞技 · 口令 ${props.roomCode}`, 72, 190);
  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 60px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(participant.name, 72, 267);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("模拟组合战绩卡", 74, 302);

  const totalReturn = Number(participant.returnPercent) || 0;
  context.fillStyle = totalReturn >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
  context.font = '700 72px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(formatPct(totalReturn), 72, 402);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 19px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("加入以来总收益率", 74, 435);

  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 47px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`¥${formatMoney(participant.totalAssets, 0)}`, 638, 397);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 18px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("当前模拟总资产", 640, 427);

  const metrics = [
    ["今日收益", formatPct(participant.dailyPercent || 0), "最近交易日"],
    ["持仓盈亏", formatSignedMoney(participant.totalProfit), "模拟持仓"],
    ["当前仓位", formatPct(participant.positionPercent || 0), `${participant.holdingCount || positions.length} 个持仓`],
    ["最大单仓", formatPct(participant.maxHoldingPercent || 0), "集中度"],
  ];
  metrics.forEach(([label, value, note], index) => {
    drawMetricCard(context, {
      x: 72 + index * 236,
      y: 474,
      width: 216,
      height: 96,
      label,
      value,
      note,
      tone:
        value.startsWith("-")
          ? POSTER_COLORS.fall
          : value.startsWith("+")
            ? POSTER_COLORS.rise
            : POSTER_COLORS.text,
    });
  });

  roundRect(context, 72, 601, 936, 54, 14);
  context.fillStyle = "rgba(23, 53, 66, .9)";
  context.fill();
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '600 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("持仓股票", 98, 635);
  context.fillText("平均成本", 492, 635);
  context.fillText("现价", 658, 635);
  context.fillText("持仓盈亏", 825, 635);

  positions.forEach((position, index) => {
    const y = 669 + index * rowHeight;
    context.fillStyle = index % 2 ? "rgba(16, 41, 54, .58)" : "rgba(22, 52, 66, .72)";
    roundRect(context, 72, y, 936, 77, 14);
    context.fill();
    context.fillStyle = POSTER_COLORS.text;
    context.font = '600 21px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText((position.name || "").slice(0, 8), 98, y + 32);
    context.fillStyle = POSTER_COLORS.faint;
    context.font = '500 14px "Avenir Next", sans-serif';
    context.fillText(`${position.code || ""} · ${position.shares || 0} 股`, 98, y + 57);
    context.fillStyle = "#dce7ed";
    context.font = '600 20px "Avenir Next", sans-serif';
    context.fillText(`¥${formatPrice(position.avgCost)}`, 492, y + 45);
    context.fillText(`¥${formatPrice(position.price)}`, 658, y + 45);
    context.fillStyle = Number(position.profit) >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
    context.font = '700 21px "Avenir Next", "Microsoft YaHei", sans-serif';
    context.fillText(formatSignedMoney(position.profit), 825, y + 35);
    context.font = '600 14px "Avenir Next", sans-serif';
    context.fillText(formatPct(position.profitPercent), 825, y + 58);
  });

  const footerY = 746 + positions.length * rowHeight;
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("比赛按加入时模拟资产为基准计算收益率；持仓数据由参赛账号同步。", 72, footerY);
  context.fillStyle = POSTER_COLORS.cyan;
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮 · 好友模拟投资竞技", 72, footerY + 35);

  previewUrl.value = canvas.toDataURL("image/png");
  canvas.toBlob((result) => {
    blob = result;
  }, "image/png");
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    await drawCard();
  },
);

function save() {
  if (!previewUrl.value || !props.participant) return;
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = `观潮-竞技-${props.participant.name}.png`;
  link.click();
}

async function share() {
  if (!blob || !props.participant) return;
  const file = new File([blob], `观潮-竞技-${props.participant.name}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: `${props.participant.name} 竞技战绩`, text: "观潮好友竞技战绩卡" });
      return;
    } catch {
      // Fall back to downloading the generated image.
    }
  }
  save();
  emit("notify", "已生成竞技战绩图并开始下载");
}

const __returned__ = { props, emit, canvasRef, previewUrl, get blob() { return blob }, set blob(v) { blob = v; }, formatSignedMoney, drawCard, save, share, nextTick, ref, watch, Icon: __sfc__$n, get formatMoney() { return formatMoney }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get POSTER_COLORS() { return POSTER_COLORS }, get drawBrand() { return drawBrand }, get drawMetricCard() { return drawMetricCard }, get drawPill() { return drawPill }, get drawPosterBackground() { return drawPosterBackground }, get roundRect() { return roundRect } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$g = {
  class: "share-sheet competitor-share-sheet",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_2$g = { class: "share-sheet-header" };
const _hoisted_3$g = { class: "share-preview" };
const _hoisted_4$f = ["src"];
const _hoisted_5$e = { class: "share-actions" };
const _hoisted_6$e = ["disabled"];
const _hoisted_7$e = ["disabled"];
const _hoisted_8$d = {
  ref: "canvasRef",
  class: "share-canvas"
};

function render$g(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open && $props.participant)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "share-backdrop",
            onClick: _cache[1] || (_cache[1] = withModifiers($event => (_ctx.$emit('close')), ["self"]))
          }, [
            createBaseVNode("section", _hoisted_1$g, [
              createBaseVNode("header", _hoisted_2$g, [
                _cache[2] || (_cache[2] = createBaseVNode("div", null, [
                  createBaseVNode("span", null, "COMPETITION CARD"),
                  createBaseVNode("h2", null, "好友竞技战绩图")
                ], -1 /* CACHED */)),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 20
                  })
                ])
              ]),
              createBaseVNode("div", _hoisted_3$g, [
                ($setup.previewUrl)
                  ? (openBlock(), createElementBlock("img", {
                      key: 0,
                      src: $setup.previewUrl,
                      alt: "好友竞技战绩图片"
                    }, null, 8 /* PROPS */, _hoisted_4$f))
                  : createCommentVNode("v-if", true)
              ]),
              createBaseVNode("div", _hoisted_5$e, [
                createBaseVNode("button", {
                  type: "button",
                  class: "secondary-button",
                  onClick: $setup.save,
                  disabled: !$setup.previewUrl
                }, "保存图片", 8 /* PROPS */, _hoisted_6$e),
                createBaseVNode("button", {
                  type: "button",
                  class: "primary-button",
                  onClick: $setup.share,
                  disabled: !$setup.previewUrl
                }, "分享战绩", 8 /* PROPS */, _hoisted_7$e)
              ]),
              createBaseVNode("canvas", _hoisted_8$d, null, 512 /* NEED_PATCH */)
            ])
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$g.render = render$g;
__sfc__$g.__file = "src/components/CompetitionShareCard.vue";

const __sfc__$f = {
  __name: 'CompetitorDetailSheet',
  props: {
  open: { type: Boolean, default: false },
  participant: { type: Object, default: null },
  roomCode: { type: String, default: "" },
  isMe: { type: Boolean, default: false },
},
  emits: ["close", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;
const emit = __emit;
const shareOpen = ref(false);

const positions = computed(() =>
  (props.participant?.positions || []).map((position) => ({
    ...position,
    weight: props.participant?.totalAssets
      ? (Number(position.marketValue) / Number(props.participant.totalAssets)) * 100
      : 0,
  })),
);

const __returned__ = { props, emit, shareOpen, positions, computed, ref, CompetitionShareCard: __sfc__$g, Icon: __sfc__$n, get formatMoney() { return formatMoney }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$f = {
  class: "bottom-sheet competitor-sheet",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "参赛者持仓详情"
};
const _hoisted_2$f = { class: "competitor-head" };
const _hoisted_3$f = { class: "competitor-avatar" };
const _hoisted_4$e = { class: "competitor-hero" };
const _hoisted_5$d = { class: "competitor-metrics" };
const _hoisted_6$d = { class: "competitor-list-head" };
const _hoisted_7$d = { class: "competitor-positions" };
const _hoisted_8$c = { class: "competitor-position-name" };
const _hoisted_9$c = {
  key: 0,
  class: "competitor-empty"
};
const _hoisted_10$b = { class: "competitor-actions" };

function render$f(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open && $props.participant)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "sheet-backdrop competitor-backdrop",
            onClick: _cache[5] || (_cache[5] = withModifiers($event => (_ctx.$emit('close')), ["self"]))
          }, [
            createBaseVNode("section", _hoisted_1$f, [
              _cache[21] || (_cache[21] = createBaseVNode("div", { class: "sheet-handle" }, null, -1 /* CACHED */)),
              createBaseVNode("header", _hoisted_2$f, [
                createBaseVNode("div", _hoisted_3$f, toDisplayString($props.participant.name.slice(0, 1)), 1 /* TEXT */),
                createBaseVNode("div", null, [
                  createBaseVNode("span", null, toDisplayString($props.isMe ? "我的竞技组合" : "参赛者公开组合"), 1 /* TEXT */),
                  createBaseVNode("h2", null, toDisplayString($props.participant.name), 1 /* TEXT */),
                  createBaseVNode("small", null, "排名 #" + toDisplayString($props.participant.rank) + " · 口令 " + toDisplayString($props.roomCode), 1 /* TEXT */)
                ]),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 20
                  })
                ])
              ]),
              createBaseVNode("section", _hoisted_4$e, [
                createBaseVNode("div", null, [
                  _cache[6] || (_cache[6] = createBaseVNode("span", null, "模拟总资产", -1 /* CACHED */)),
                  createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($props.participant.totalAssets, 2)), 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[7] || (_cache[7] = createBaseVNode("span", null, "总收益率", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass($props.participant.returnPercent))
                  }, toDisplayString($setup.formatPct($props.participant.returnPercent)), 3 /* TEXT, CLASS */)
                ])
              ]),
              createBaseVNode("div", _hoisted_5$d, [
                createBaseVNode("div", null, [
                  _cache[8] || (_cache[8] = createBaseVNode("span", null, "今日收益", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass($props.participant.dailyPercent))
                  }, toDisplayString($setup.formatPct($props.participant.dailyPercent || 0)), 3 /* TEXT, CLASS */)
                ]),
                createBaseVNode("div", null, [
                  _cache[9] || (_cache[9] = createBaseVNode("span", null, "持仓盈亏", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass($props.participant.totalProfit))
                  }, toDisplayString(Number($props.participant.totalProfit || 0) >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($props.participant.totalProfit || 0, 0)), 3 /* TEXT, CLASS */)
                ]),
                createBaseVNode("div", null, [
                  _cache[10] || (_cache[10] = createBaseVNode("span", null, "当前仓位", -1 /* CACHED */)),
                  createBaseVNode("strong", null, toDisplayString(Number($props.participant.positionPercent || 0).toFixed(1)) + "%", 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[11] || (_cache[11] = createBaseVNode("span", null, "最大单仓", -1 /* CACHED */)),
                  createBaseVNode("strong", null, toDisplayString(Number($props.participant.maxHoldingPercent || 0).toFixed(1)) + "%", 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[12] || (_cache[12] = createBaseVNode("span", null, "可用资金", -1 /* CACHED */)),
                  createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($props.participant.cash || 0, 0)), 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[13] || (_cache[13] = createBaseVNode("span", null, "持仓数量", -1 /* CACHED */)),
                  createBaseVNode("strong", null, toDisplayString($props.participant.holdingCount || $setup.positions.length) + " 只", 1 /* TEXT */)
                ])
              ]),
              createBaseVNode("div", _hoisted_6$d, [
                _cache[14] || (_cache[14] = createBaseVNode("div", null, [
                  createBaseVNode("span", null, "POSITIONS"),
                  createBaseVNode("h3", null, "详细持仓")
                ], -1 /* CACHED */)),
                createBaseVNode("em", null, toDisplayString($setup.positions.length) + " 个标的", 1 /* TEXT */)
              ]),
              createBaseVNode("div", _hoisted_7$d, [
                (openBlock(true), createElementBlock(Fragment, null, renderList($setup.positions, (position) => {
                  return (openBlock(), createElementBlock("article", {
                    key: position.code
                  }, [
                    createBaseVNode("div", _hoisted_8$c, [
                      createBaseVNode("span", null, toDisplayString((position.name || "?").slice(0, 1)), 1 /* TEXT */),
                      createBaseVNode("div", null, [
                        createBaseVNode("strong", null, toDisplayString(position.name), 1 /* TEXT */),
                        createBaseVNode("small", null, toDisplayString(position.code) + " · " + toDisplayString(position.shares) + " 股", 1 /* TEXT */)
                      ])
                    ]),
                    createBaseVNode("div", null, [
                      _cache[15] || (_cache[15] = createBaseVNode("span", null, "平均成本", -1 /* CACHED */)),
                      createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatPrice(position.avgCost)), 1 /* TEXT */)
                    ]),
                    createBaseVNode("div", null, [
                      _cache[16] || (_cache[16] = createBaseVNode("span", null, "现价", -1 /* CACHED */)),
                      createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatPrice(position.price)), 1 /* TEXT */)
                    ]),
                    createBaseVNode("div", null, [
                      _cache[17] || (_cache[17] = createBaseVNode("span", null, "持仓盈亏", -1 /* CACHED */)),
                      createBaseVNode("strong", {
                        class: normalizeClass($setup.trendClass(position.profit))
                      }, toDisplayString(Number(position.profit) >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney(position.profit, 0)), 3 /* TEXT, CLASS */)
                    ]),
                    createBaseVNode("div", null, [
                      _cache[18] || (_cache[18] = createBaseVNode("span", null, "仓位占比", -1 /* CACHED */)),
                      createBaseVNode("strong", null, toDisplayString(position.weight.toFixed(1)) + "%", 1 /* TEXT */)
                    ]),
                    createBaseVNode("i", null, [
                      createBaseVNode("b", {
                        style: normalizeStyle({ width: `${Math.min(100, position.weight)}%` })
                      }, null, 4 /* STYLE */)
                    ])
                  ]))
                }), 128 /* KEYED_FRAGMENT */)),
                (!$setup.positions.length)
                  ? (openBlock(), createElementBlock("div", _hoisted_9$c, [
                      createVNode($setup["Icon"], {
                        name: "portfolio",
                        size: 25
                      }),
                      _cache[19] || (_cache[19] = createBaseVNode("span", null, "参赛者暂未同步持仓", -1 /* CACHED */))
                    ]))
                  : createCommentVNode("v-if", true)
              ]),
              createBaseVNode("div", _hoisted_10$b, [
                createBaseVNode("button", {
                  type: "button",
                  class: "secondary-button",
                  onClick: _cache[1] || (_cache[1] = $event => (_ctx.$emit('close')))
                }, "关闭"),
                createBaseVNode("button", {
                  type: "button",
                  class: "primary-button",
                  onClick: _cache[2] || (_cache[2] = $event => ($setup.shareOpen = true))
                }, [
                  createVNode($setup["Icon"], {
                    name: "share",
                    size: 17
                  }),
                  _cache[20] || (_cache[20] = createTextVNode(" 分享战绩 ", -1 /* CACHED */))
                ])
              ]),
              _cache[22] || (_cache[22] = createBaseVNode("p", { class: "legal-note" }, "持仓由参赛账号主动同步，仅用于课程演示；竞技收益不等于真实投资收益。", -1 /* CACHED */))
            ]),
            createVNode($setup["CompetitionShareCard"], {
              open: $setup.shareOpen,
              participant: $props.participant,
              "room-code": $props.roomCode,
              onClose: _cache[3] || (_cache[3] = $event => ($setup.shareOpen = false)),
              onNotify: _cache[4] || (_cache[4] = $event => ($setup.emit('notify', $event)))
            }, null, 8 /* PROPS */, ["open", "participant", "room-code"])
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$f.render = render$f;
__sfc__$f.__file = "src/components/CompetitorDetailSheet.vue";

const __sfc__$e = {
  __name: 'CompetitionView',
  emits: ["back", "notify", "open-auth"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const mode = ref("create");
const roomName = ref("观潮好友竞技场");
const joinCode = ref("");
const room = ref(null);
const selectedParticipantId = ref("");
const selectedMetric = ref("returnPercent");
const loading = ref(false);
const error = ref("");
const lastSync = ref(null);
let pollTimer;

const myId = computed(() => authState.user?.id || "");
const metrics = [
  { id: "returnPercent", label: "总收益" },
  { id: "dailyPercent", label: "今日" },
  { id: "totalAssets", label: "总资产" },
  { id: "defense", label: "低集中度" },
];
const rankedParticipants = computed(() => {
  const participants = [...(room.value?.participants || [])];
  if (selectedMetric.value === "defense") {
    return participants.sort((a, b) => (a.maxHoldingPercent || 0) - (b.maxHoldingPercent || 0));
  }
  return participants.sort(
    (a, b) => Number(b[selectedMetric.value] || 0) - Number(a[selectedMetric.value] || 0),
  );
});
const myRank = computed(
  () => rankedParticipants.value.findIndex((item) => item.id === myId.value) + 1 || 0,
);
const selectedParticipant = computed(() =>
  room.value?.participants?.find((participant) => participant.id === selectedParticipantId.value),
);
const roomStats = computed(() => {
  const participants = room.value?.participants || [];
  const leader = [...participants].sort((a, b) => b.returnPercent - a.returnPercent)[0];
  const average = participants.length
    ? participants.reduce((sum, participant) => sum + participant.returnPercent, 0) / participants.length
    : 0;
  const me = participants.find((participant) => participant.id === myId.value);
  return {
    leader,
    average,
    gap: me && leader ? me.returnPercent - leader.returnPercent : 0,
  };
});

async function syncRoom() {
  if (!room.value?.code) return;
  try {
    await syncCompetitionSnapshot();
    room.value = await fetchCompetition(room.value.code);
    lastSync.value = new Date();
    error.value = "";
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : "竞技数据同步失败";
  }
}

async function createRoom() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";
  try {
    room.value = await createCompetition(roomName.value);
    lastSync.value = new Date();
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : "创建竞技失败";
  } finally {
    loading.value = false;
  }
}

async function joinRoom() {
  if (loading.value) return;
  if (!/^\d{6}$/.test(joinCode.value.trim())) {
    error.value = "请输入 6 位数字竞技口令";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    room.value = await joinCompetition(joinCode.value);
    lastSync.value = new Date();
  } catch (requestError) {
    error.value = requestError instanceof Error ? requestError.message : "加入竞技失败";
  } finally {
    loading.value = false;
  }
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
}

async function shareCode() {
  if (!room.value) return;
  const text = `观潮好友竞技口令：${room.value.code}\n打开观潮 App，进入“我的 → 好友竞技”，输入口令即可同步参赛。参赛后按模拟资产收益率实时排名。`;
  if (navigator.share) {
    try {
      await navigator.share({ title: "观潮好友竞技", text });
      return;
    } catch {
      // Falling back to clipboard also handles a dismissed share sheet.
    }
  }
  await copyText(text);
  emit("notify", "竞技口令已复制");
}

function leaveRoom() {
  setSavedCompetitionCode("");
  room.value = null;
  joinCode.value = "";
  emit("notify", "已退出当前竞技展示");
}

function openParticipant(participant) {
  selectedParticipantId.value = participant.id;
}

async function restoreRoom() {
  if (!authState.user) return;
  const savedCode = getSavedCompetitionCode();
  if (savedCode) {
    loading.value = true;
    try {
      room.value = await fetchCompetition(savedCode);
    } catch {
      setSavedCompetitionCode("");
    } finally {
      loading.value = false;
    }
  }
}

watch(() => authState.user, restoreRoom);

onMounted(async () => {
  await restoreRoom();
  pollTimer = window.setInterval(() => {
    if (room.value && document.visibilityState === "visible") syncRoom();
  }, 8000);
});

onBeforeUnmount(() => window.clearInterval(pollTimer));

const __returned__ = { emit, mode, roomName, joinCode, room, selectedParticipantId, selectedMetric, loading, error, lastSync, get pollTimer() { return pollTimer }, set pollTimer(v) { pollTimer = v; }, myId, metrics, rankedParticipants, myRank, selectedParticipant, roomStats, syncRoom, createRoom, joinRoom, copyText, shareCode, leaveRoom, openParticipant, restoreRoom, computed, onBeforeUnmount, onMounted, ref, watch, CompetitorDetailSheet: __sfc__$f, Icon: __sfc__$n, get account() { return account }, get formatMoney() { return formatMoney }, get authState() { return authState }, get createCompetition() { return createCompetition }, get fetchCompetition() { return fetchCompetition }, get getSavedCompetitionCode() { return getSavedCompetitionCode }, get joinCompetition() { return joinCompetition }, get setSavedCompetitionCode() { return setSavedCompetitionCode }, get syncCompetitionSnapshot() { return syncCompetitionSnapshot }, get formatPct() { return formatPct }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$e = { class: "page competition-view" };
const _hoisted_2$e = { class: "detail-header competition-header" };
const _hoisted_3$e = {
  key: 0,
  class: "contest-intro"
};
const _hoisted_4$d = { class: "contest-trophy" };
const _hoisted_5$c = {
  key: 1,
  class: "contest-login-gate"
};
const _hoisted_6$c = { class: "contest-account-chip" };
const _hoisted_7$c = { class: "segmented contest-mode" };
const _hoisted_8$b = {
  key: 0,
  class: "contest-form-card"
};
const _hoisted_9$b = { class: "contest-field" };
const _hoisted_10$a = { class: "contest-base" };
const _hoisted_11$a = ["disabled"];
const _hoisted_12$a = {
  key: 1,
  class: "contest-form-card"
};
const _hoisted_13$a = { class: "contest-field" };
const _hoisted_14$a = { class: "contest-base" };
const _hoisted_15$9 = ["disabled"];
const _hoisted_16$9 = {
  key: 2,
  class: "competition-error"
};
const _hoisted_17$9 = { class: "contest-room-head" };
const _hoisted_18$9 = { class: "contest-live-row" };
const _hoisted_19$9 = { class: "contest-summary-grid" };
const _hoisted_20$7 = { class: "contest-metric-tabs" };
const _hoisted_21$7 = ["onClick"];
const _hoisted_22$6 = { class: "contest-leaderboard" };
const _hoisted_23$5 = ["onClick"];
const _hoisted_24$5 = { class: "contest-person" };
const _hoisted_25$5 = { key: 0 };
const _hoisted_26$5 = { class: "contest-assets" };
const _hoisted_27$5 = { class: "contest-submetrics" };
const _hoisted_28$4 = {
  key: 0,
  class: "competition-error"
};
const _hoisted_29$4 = {
  key: 1,
  class: "contest-note"
};

function render$e(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$e, [
    createBaseVNode("header", _hoisted_2$e, [
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "返回",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('back')))
      }, [
        createVNode($setup["Icon"], {
          name: "arrowLeft",
          size: 21
        })
      ]),
      _cache[8] || (_cache[8] = createBaseVNode("div", { class: "detail-title" }, [
        createBaseVNode("strong", null, "好友竞技"),
        createBaseVNode("span", null, "同一时间段 · 收益率排名")
      ], -1 /* CACHED */)),
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "刷新",
        onClick: $setup.syncRoom
      }, [
        createVNode($setup["Icon"], {
          name: "refresh",
          size: 19
        })
      ])
    ]),
    createBaseVNode("main", null, [
      (!$setup.room)
        ? (openBlock(), createElementBlock("section", _hoisted_3$e, [
            createBaseVNode("span", _hoisted_4$d, [
              createVNode($setup["Icon"], {
                name: "trend",
                size: 28
              })
            ]),
            _cache[9] || (_cache[9] = createBaseVNode("h1", null, [
              createTextVNode("和好友来一场"),
              createBaseVNode("br"),
              createTextVNode("零风险的 A 股模拟赛")
            ], -1 /* CACHED */)),
            _cache[10] || (_cache[10] = createBaseVNode("p", null, "每位参赛者以加入时的模拟总资产为基准，按后续收益率同步排名。创建口令后发给好友，在同一局域网服务下即可参赛。", -1 /* CACHED */))
          ]))
        : createCommentVNode("v-if", true),
      (!$setup.authState.user)
        ? (openBlock(), createElementBlock("section", _hoisted_5$c, [
            createBaseVNode("span", null, [
              createVNode($setup["Icon"], {
                name: "user",
                size: 23
              })
            ]),
            _cache[11] || (_cache[11] = createBaseVNode("strong", null, "登录后才能参加好友竞技", -1 /* CACHED */)),
            _cache[12] || (_cache[12] = createBaseVNode("p", null, "账号会把同一用户的模拟资产同步到不同手机，并用于生成唯一参赛身份，避免不同设备的数据混在一起。", -1 /* CACHED */)),
            createBaseVNode("button", {
              type: "button",
              class: "primary-button",
              onClick: _cache[1] || (_cache[1] = $event => ($setup.emit('open-auth')))
            }, "登录或创建账号")
          ]))
        : (!$setup.room)
          ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
              createBaseVNode("div", _hoisted_6$c, [
                createVNode($setup["Icon"], {
                  name: "user",
                  size: 16
                }),
                _cache[13] || (_cache[13] = createBaseVNode("span", null, "当前账号", -1 /* CACHED */)),
                createBaseVNode("strong", null, toDisplayString($setup.authState.user.displayName || $setup.authState.user.username), 1 /* TEXT */)
              ]),
              createBaseVNode("div", _hoisted_7$c, [
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: $setup.mode === 'create' }),
                  onClick: _cache[2] || (_cache[2] = $event => ($setup.mode = 'create'))
                }, "创建竞技", 2 /* CLASS */),
                createBaseVNode("button", {
                  type: "button",
                  class: normalizeClass({ active: $setup.mode === 'join' }),
                  onClick: _cache[3] || (_cache[3] = $event => ($setup.mode = 'join'))
                }, "输入口令", 2 /* CLASS */)
              ]),
              ($setup.mode === 'create')
                ? (openBlock(), createElementBlock("section", _hoisted_8$b, [
                    createBaseVNode("label", _hoisted_9$b, [
                      _cache[14] || (_cache[14] = createBaseVNode("span", null, "竞技名称", -1 /* CACHED */)),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => (($setup.roomName) = $event)),
                        maxlength: "24"
                      }, null, 512 /* NEED_PATCH */), [
                        [vModelText, $setup.roomName]
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_10$a, [
                      _cache[15] || (_cache[15] = createBaseVNode("span", null, "起始模拟资产", -1 /* CACHED */)),
                      createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.account.totalAssets)), 1 /* TEXT */)
                    ]),
                    createBaseVNode("button", {
                      type: "button",
                      class: "primary-button contest-submit",
                      disabled: $setup.loading,
                      onClick: $setup.createRoom
                    }, toDisplayString($setup.loading ? "正在创建…" : "生成竞技口令"), 9 /* TEXT, PROPS */, _hoisted_11$a)
                  ]))
                : (openBlock(), createElementBlock("section", _hoisted_12$a, [
                    createBaseVNode("label", _hoisted_13$a, [
                      _cache[16] || (_cache[16] = createBaseVNode("span", null, "6 位竞技口令", -1 /* CACHED */)),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => (($setup.joinCode) = $event)),
                        class: "contest-code-input",
                        maxlength: "6",
                        inputmode: "numeric",
                        placeholder: "000000"
                      }, null, 512 /* NEED_PATCH */), [
                        [vModelText, $setup.joinCode]
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_14$a, [
                      _cache[17] || (_cache[17] = createBaseVNode("span", null, "加入后以当前模拟资产开始计算收益", -1 /* CACHED */)),
                      createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.account.totalAssets)), 1 /* TEXT */)
                    ]),
                    createBaseVNode("button", {
                      type: "button",
                      class: "primary-button contest-submit",
                      disabled: $setup.loading,
                      onClick: $setup.joinRoom
                    }, toDisplayString($setup.loading ? "正在加入…" : "加入好友竞技"), 9 /* TEXT, PROPS */, _hoisted_15$9)
                  ])),
              ($setup.error)
                ? (openBlock(), createElementBlock("p", _hoisted_16$9, toDisplayString($setup.error), 1 /* TEXT */))
                : createCommentVNode("v-if", true),
              _cache[18] || (_cache[18] = createBaseVNode("p", { class: "contest-note" }, "竞技数据保存在运行本应用的电脑服务中，服务重启后仍会保留；关闭服务后其他设备将无法加入。", -1 /* CACHED */))
            ], 64 /* STABLE_FRAGMENT */))
          : (openBlock(), createElementBlock(Fragment, { key: 3 }, [
              createBaseVNode("section", _hoisted_17$9, [
                createBaseVNode("div", null, [
                  createBaseVNode("span", null, toDisplayString($setup.room.name), 1 /* TEXT */),
                  createBaseVNode("h1", null, toDisplayString($setup.room.code), 1 /* TEXT */),
                  _cache[19] || (_cache[19] = createBaseVNode("p", null, "把你的模拟资产收益率与好友同步比较", -1 /* CACHED */))
                ]),
                createBaseVNode("button", {
                  type: "button",
                  onClick: $setup.shareCode
                }, [
                  createVNode($setup["Icon"], {
                    name: "share",
                    size: 18
                  }),
                  _cache[20] || (_cache[20] = createTextVNode(" 分享口令", -1 /* CACHED */))
                ])
              ]),
              createBaseVNode("div", _hoisted_18$9, [
                createBaseVNode("span", null, [
                  _cache[21] || (_cache[21] = createBaseVNode("i", null, null, -1 /* CACHED */)),
                  createTextVNode(" 同步竞技中 · " + toDisplayString($setup.room.participants.length) + " 人", 1 /* TEXT */)
                ]),
                createBaseVNode("em", null, "你当前第 " + toDisplayString($setup.myRank) + " 名", 1 /* TEXT */)
              ]),
              createBaseVNode("div", _hoisted_19$9, [
                createBaseVNode("div", null, [
                  _cache[22] || (_cache[22] = createBaseVNode("span", null, "领先收益", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass($setup.roomStats.leader?.returnPercent))
                  }, toDisplayString($setup.formatPct($setup.roomStats.leader?.returnPercent)), 3 /* TEXT, CLASS */),
                  createBaseVNode("small", null, toDisplayString($setup.roomStats.leader?.name || "等待数据"), 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[23] || (_cache[23] = createBaseVNode("span", null, "平均收益", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass($setup.roomStats.average))
                  }, toDisplayString($setup.formatPct($setup.roomStats.average)), 3 /* TEXT, CLASS */),
                  createBaseVNode("small", null, toDisplayString($setup.room.participants.length) + " 位参赛者", 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[24] || (_cache[24] = createBaseVNode("span", null, "距第一名", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass($setup.roomStats.gap))
                  }, toDisplayString($setup.formatPct($setup.roomStats.gap)), 3 /* TEXT, CLASS */),
                  _cache[25] || (_cache[25] = createBaseVNode("small", null, "按总收益率", -1 /* CACHED */))
                ])
              ]),
              createBaseVNode("div", _hoisted_20$7, [
                (openBlock(), createElementBlock(Fragment, null, renderList($setup.metrics, (item) => {
                  return createBaseVNode("button", {
                    key: item.id,
                    type: "button",
                    class: normalizeClass({ active: $setup.selectedMetric === item.id }),
                    onClick: $event => ($setup.selectedMetric = item.id)
                  }, toDisplayString(item.label), 11 /* TEXT, CLASS, PROPS */, _hoisted_21$7)
                }), 64 /* STABLE_FRAGMENT */))
              ]),
              createBaseVNode("section", _hoisted_22$6, [
                (openBlock(true), createElementBlock(Fragment, null, renderList($setup.rankedParticipants, (participant, index) => {
                  return (openBlock(), createElementBlock("button", {
                    key: participant.id,
                    type: "button",
                    class: normalizeClass(["contest-entry", { me: participant.id === $setup.myId }]),
                    onClick: $event => ($setup.openParticipant(participant))
                  }, [
                    createBaseVNode("span", {
                      class: normalizeClass(["contest-rank", { top: index < 3 }])
                    }, toDisplayString(index + 1), 3 /* TEXT, CLASS */),
                    createBaseVNode("div", _hoisted_24$5, [
                      createBaseVNode("strong", null, [
                        createTextVNode(toDisplayString(participant.name), 1 /* TEXT */),
                        (participant.id === $setup.myId)
                          ? (openBlock(), createElementBlock("em", _hoisted_25$5, "我"))
                          : createCommentVNode("v-if", true)
                      ]),
                      createBaseVNode("small", null, toDisplayString(participant.holdingCount || participant.positions?.length || 0) + " 个持仓 · " + toDisplayString(participant.positions?.[0]?.name || "等待同步"), 1 /* TEXT */)
                    ]),
                    createBaseVNode("div", _hoisted_26$5, [
                      createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney(participant.totalAssets, 0)), 1 /* TEXT */),
                      createBaseVNode("small", {
                        class: normalizeClass($setup.trendClass(participant.returnPercent))
                      }, toDisplayString($setup.formatPct(participant.returnPercent)), 3 /* TEXT, CLASS */)
                    ]),
                    createBaseVNode("div", _hoisted_27$5, [
                      createBaseVNode("span", null, [
                        _cache[26] || (_cache[26] = createTextVNode("今日 ", -1 /* CACHED */)),
                        createBaseVNode("b", {
                          class: normalizeClass($setup.trendClass(participant.dailyPercent))
                        }, toDisplayString($setup.formatPct(participant.dailyPercent || 0)), 3 /* TEXT, CLASS */)
                      ]),
                      createBaseVNode("span", null, [
                        _cache[27] || (_cache[27] = createTextVNode("仓位 ", -1 /* CACHED */)),
                        createBaseVNode("b", null, toDisplayString($setup.formatPct(participant.positionPercent || 0)), 1 /* TEXT */)
                      ]),
                      createBaseVNode("span", null, [
                        _cache[28] || (_cache[28] = createTextVNode("最大单仓 ", -1 /* CACHED */)),
                        createBaseVNode("b", null, toDisplayString($setup.formatPct(participant.maxHoldingPercent || 0)), 1 /* TEXT */)
                      ]),
                      createBaseVNode("span", null, [
                        _cache[29] || (_cache[29] = createTextVNode("持仓盈亏 ", -1 /* CACHED */)),
                        createBaseVNode("b", {
                          class: normalizeClass($setup.trendClass(participant.totalProfit))
                        }, toDisplayString(Number(participant.totalProfit || 0) >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney(participant.totalProfit || 0, 0)), 3 /* TEXT, CLASS */)
                      ])
                    ]),
                    createVNode($setup["Icon"], {
                      name: "chevronRight",
                      size: 15,
                      class: "contest-entry-arrow"
                    })
                  ], 10 /* CLASS, PROPS */, _hoisted_23$5))
                }), 128 /* KEYED_FRAGMENT */))
              ]),
              _cache[30] || (_cache[30] = createBaseVNode("section", { class: "contest-rules" }, [
                createBaseVNode("strong", null, "竞技规则"),
                createBaseVNode("p", null, "收益率 =（当前模拟总资产 - 加入时模拟总资产）÷ 加入时模拟总资产。页面打开期间约每 8 秒同步一次，资产基准不会因后续加入而重置。")
              ], -1 /* CACHED */)),
              createBaseVNode("div", { class: "contest-room-actions" }, [
                createBaseVNode("button", {
                  type: "button",
                  class: "secondary-button",
                  onClick: $setup.syncRoom
                }, "立即同步"),
                createBaseVNode("button", {
                  type: "button",
                  class: "secondary-button",
                  onClick: $setup.leaveRoom
                }, "退出展示")
              ]),
              ($setup.error)
                ? (openBlock(), createElementBlock("p", _hoisted_28$4, toDisplayString($setup.error), 1 /* TEXT */))
                : createCommentVNode("v-if", true),
              ($setup.lastSync)
                ? (openBlock(), createElementBlock("p", _hoisted_29$4, "最近同步：" + toDisplayString($setup.lastSync.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1 /* TEXT */))
                : createCommentVNode("v-if", true)
            ], 64 /* STABLE_FRAGMENT */))
    ]),
    createVNode($setup["CompetitorDetailSheet"], {
      open: Boolean($setup.selectedParticipant),
      participant: $setup.selectedParticipant,
      "room-code": $setup.room?.code || '',
      "is-me": $setup.selectedParticipant?.id === $setup.myId,
      onClose: _cache[6] || (_cache[6] = $event => ($setup.selectedParticipantId = '')),
      onNotify: _cache[7] || (_cache[7] = $event => ($setup.emit('notify', $event)))
    }, null, 8 /* PROPS */, ["open", "participant", "room-code", "is-me"])
  ]))
}
__sfc__$e.render = render$e;
__sfc__$e.__file = "src/views/CompetitionView.vue";

const __sfc__$d = {
  __name: 'Sparkline',
  props: {
  values: { type: Array, default: () => [] },
  positive: { type: Boolean, default: true },
  width: { type: Number, default: 84 },
  height: { type: Number, default: 32 },
  fill: { type: Boolean, default: true },
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

const gradientId = `spark-${useId().replaceAll(":", "")}`;

const geometry = computed(() => {
  const values = props.values.length ? props.values.map(Number) : [0, 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values.map((value, index) => {
    const x = 2 + (index / (values.length - 1)) * (props.width - 4);
    const y = 3 + ((max - value) / range) * (props.height - 6);
    return [x, y];
  });
  const line = points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M${points[0][0]},${props.height} L${line.replaceAll(" ", " L")} L${points.at(-1)[0]},${props.height} Z`;
  return { line, area };
});

const __returned__ = { props, gradientId, geometry, computed, useId };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$d = ["viewBox", "width", "height"];
const _hoisted_2$d = ["d", "fill"];
const _hoisted_3$d = ["points"];

function render$d(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("svg", {
    viewBox: `0 0 ${$props.width} ${$props.height}`,
    width: $props.width,
    height: $props.height,
    class: normalizeClass(["sparkline", $props.positive ? 'spark-rise' : 'spark-fall']),
    preserveAspectRatio: "none",
    "aria-hidden": "true"
  }, [
    createBaseVNode("defs", null, [
      createBaseVNode("linearGradient", {
        id: $setup.gradientId,
        x1: "0",
        y1: "0",
        x2: "0",
        y2: "1"
      }, [...(_cache[0] || (_cache[0] = [
        createBaseVNode("stop", {
          offset: "0%",
          "stop-color": "currentColor",
          "stop-opacity": ".3"
        }, null, -1 /* CACHED */),
        createBaseVNode("stop", {
          offset: "100%",
          "stop-color": "currentColor",
          "stop-opacity": "0"
        }, null, -1 /* CACHED */)
      ]))])
    ]),
    ($props.fill)
      ? (openBlock(), createElementBlock("path", {
          key: 0,
          d: $setup.geometry.area,
          fill: `url(#${$setup.gradientId})`,
          stroke: "none"
        }, null, 8 /* PROPS */, _hoisted_2$d))
      : createCommentVNode("v-if", true),
    createBaseVNode("polyline", {
      points: $setup.geometry.line,
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.8"
    }, null, 8 /* PROPS */, _hoisted_3$d)
  ], 10 /* CLASS, PROPS */, _hoisted_1$d))
}
__sfc__$d.render = render$d;
__sfc__$d.__file = "src/components/Sparkline.vue";

const __sfc__$c = {
  __name: 'StockRow',
  props: {
  stock: { type: Object, required: true },
  compact: { type: Boolean, default: false },
},
  emits: ["select"],
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;



const percent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});

const __returned__ = { props, percent, computed, Sparkline: __sfc__$d, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$c = { class: "stock-identity" };
const _hoisted_2$c = { class: "stock-monogram" };
const _hoisted_3$c = { class: "stock-copy" };
const _hoisted_4$c = { class: "stock-spark" };

function render$c(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("button", {
    class: normalizeClass(["stock-row", { compact: $props.compact }]),
    type: "button",
    onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('select', $props.stock)))
  }, [
    createBaseVNode("span", _hoisted_1$c, [
      createBaseVNode("span", _hoisted_2$c, toDisplayString($props.stock.name.slice(0, 1)), 1 /* TEXT */),
      createBaseVNode("span", _hoisted_3$c, [
        createBaseVNode("strong", null, toDisplayString($props.stock.name), 1 /* TEXT */),
        createBaseVNode("small", null, toDisplayString($props.stock.code) + " · " + toDisplayString($props.stock.sector), 1 /* TEXT */)
      ])
    ]),
    createBaseVNode("span", _hoisted_4$c, [
      createVNode($setup["Sparkline"], {
        values: $props.stock.history,
        positive: $setup.percent >= 0,
        width: 58,
        height: 25
      }, null, 8 /* PROPS */, ["values", "positive"])
    ]),
    createBaseVNode("span", {
      class: normalizeClass(["stock-price", $setup.trendClass($setup.percent)])
    }, [
      createBaseVNode("strong", null, toDisplayString($setup.formatPrice($props.stock.price)), 1 /* TEXT */),
      createBaseVNode("small", null, toDisplayString($setup.formatPct($setup.percent)), 1 /* TEXT */)
    ], 2 /* CLASS */)
  ], 2 /* CLASS */))
}
__sfc__$c.render = render$c;
__sfc__$c.__file = "src/components/StockRow.vue";

const __sfc__$b = {
  __name: 'HomeView',
  emits: ["navigate", "select-stock", "open-ai", "open-alerts", "open-watch-picker", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;

const today = new Intl.DateTimeFormat("zh-CN", {
  month: "long",
  day: "numeric",
  weekday: "short",
}).format(new Date());

const risingIndexCount = computed(() => indices.filter((index) => index.changePercent > 0).length);
const averageIndexChange = computed(
  () => indices.reduce((sum, index) => sum + index.changePercent, 0) / indices.length,
);
const totalCashTurnover = computed(() => (indices[0]?.amount || 0) + (indices[1]?.amount || 0));

const portfolioSeries = computed(() => {
  return portfolio.history.map((item) => item.value);
});

async function reload() {
  const result = await refreshMarket({ includeSectors: true });
  emit("notify", result.ok ? (result.stale ? "接口波动，已使用最近缓存行情" : "真实 A 股行情已刷新") : result.message);
}

const __returned__ = { emit, today, risingIndexCount, averageIndexChange, totalCashTurnover, portfolioSeries, reload, computed, Icon: __sfc__$n, Sparkline: __sfc__$d, StockRow: __sfc__$c, get account() { return account }, get formatCompactMoney() { return formatCompactMoney }, get formatMoney() { return formatMoney }, get formatSigned() { return formatSigned }, get indices() { return indices }, get lastUpdated() { return lastUpdated }, get marketMeta() { return marketMeta }, get portfolio() { return portfolio }, get recentStocks() { return recentStocks }, get refreshMarket() { return refreshMarket }, get clearRecentViews() { return clearRecentViews }, get tradingStatus() { return tradingStatus }, get unreadNotificationCount() { return unreadNotificationCount }, get watchStocks() { return watchStocks }, get formatPct() { return formatPct }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$b = { class: "page home-view" };
const _hoisted_2$b = { class: "home-header" };
const _hoisted_3$b = { class: "header-actions" };
const _hoisted_4$b = { key: 0 };
const _hoisted_5$b = { class: "welcome-block" };
const _hoisted_6$b = {
  class: "index-scroller",
  "aria-label": "大盘指数"
};
const _hoisted_7$b = { class: "index-title" };
const _hoisted_8$a = { class: "portfolio-hero" };
const _hoisted_9$a = {
  key: 0,
  class: "hero-chart"
};
const _hoisted_10$9 = {
  key: 1,
  class: "hero-account-mix"
};
const _hoisted_11$9 = { class: "hero-stats" };
const _hoisted_12$9 = { class: "quick-actions" };
const _hoisted_13$9 = { class: "quick-icon coral" };
const _hoisted_14$9 = { class: "quick-icon blue" };
const _hoisted_15$8 = { class: "quick-icon gold" };
const _hoisted_16$8 = { class: "quick-icon green" };
const _hoisted_17$8 = { class: "section-block watch-section" };
const _hoisted_18$8 = { class: "section-heading" };
const _hoisted_19$8 = { class: "watch-heading-actions" };
const _hoisted_20$6 = { class: "stock-list" };
const _hoisted_21$6 = { class: "section-block recent-section" };
const _hoisted_22$5 = { class: "section-heading" };
const _hoisted_23$4 = {
  key: 0,
  class: "recent-stock-scroller"
};
const _hoisted_24$4 = ["onClick"];
const _hoisted_25$4 = { class: "stock-monogram" };
const _hoisted_26$4 = {
  key: 1,
  class: "recent-empty"
};
const _hoisted_27$4 = { class: "pulse-card" };
const _hoisted_28$3 = { class: "section-heading compact" };
const _hoisted_29$3 = { class: "temperature" };
const _hoisted_30$3 = { class: "breadth-numbers" };
const _hoisted_31$3 = { class: "breadth-bar" };
const _hoisted_32$2 = { class: "pulse-meta" };
const _hoisted_33$1 = { class: "ai-orb" };

function render$b(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$b, [
    createBaseVNode("header", _hoisted_2$b, [
      _cache[12] || (_cache[12] = createBaseVNode("div", { class: "brand-lockup" }, [
        createBaseVNode("span", { class: "brand-mark" }, [
          createBaseVNode("i"),
          createBaseVNode("i"),
          createBaseVNode("i")
        ]),
        createBaseVNode("div", null, [
          createBaseVNode("strong", null, "观潮"),
          createBaseVNode("small", null, "TIDE MARKET LAB")
        ])
      ], -1 /* CACHED */)),
      createBaseVNode("div", _hoisted_3$b, [
        createBaseVNode("span", {
          class: normalizeClass(["demo-chip", { offline: !$setup.lastUpdated.live }])
        }, toDisplayString($setup.lastUpdated.live ? "LIVE" : $setup.marketMeta.connection === "stale" ? "CACHE" : "等待连接"), 3 /* TEXT, CLASS */),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button",
          "aria-label": "刷新行情",
          onClick: $setup.reload
        }, [
          createVNode($setup["Icon"], {
            name: "refresh",
            size: 19
          })
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button notification",
          "aria-label": "价格提醒与通知",
          onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('open-alerts')))
        }, [
          createVNode($setup["Icon"], {
            name: "bell",
            size: 20
          }),
          ($setup.unreadNotificationCount || $setup.portfolio.alerts.some((alert) => !alert.triggered))
            ? (openBlock(), createElementBlock("i", _hoisted_4$b))
            : createCommentVNode("v-if", true)
        ])
      ])
    ]),
    createBaseVNode("main", null, [
      createBaseVNode("section", _hoisted_5$b, [
        createBaseVNode("p", null, toDisplayString($setup.today) + " · " + toDisplayString($setup.tradingStatus.label), 1 /* TEXT */),
        _cache[13] || (_cache[13] = createBaseVNode("h1", null, [
          createTextVNode("先看懂潮向，"),
          createBaseVNode("br"),
          createBaseVNode("span", null, "再做出选择。")
        ], -1 /* CACHED */))
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "search-entry",
        onClick: _cache[1] || (_cache[1] = $event => ($setup.emit('navigate', 'search')))
      }, [
        createVNode($setup["Icon"], {
          name: "search",
          size: 19
        }),
        _cache[14] || (_cache[14] = createBaseVNode("span", null, "搜索 A 股代码、名称拼音或公司", -1 /* CACHED */)),
        _cache[15] || (_cache[15] = createBaseVNode("kbd", null, "搜索", -1 /* CACHED */))
      ]),
      createBaseVNode("div", {
        class: normalizeClass(["market-session-strip", [$setup.tradingStatus.phase, { stale: $setup.marketMeta.connection === 'stale' }]])
      }, [
        _cache[16] || (_cache[16] = createBaseVNode("span", { class: "session-dot" }, null, -1 /* CACHED */)),
        createBaseVNode("div", null, [
          createBaseVNode("strong", null, toDisplayString($setup.tradingStatus.label), 1 /* TEXT */),
          createBaseVNode("small", null, toDisplayString($setup.marketMeta.connection === "stale" ? "实时接口波动，当前显示最近缓存行情" : $setup.tradingStatus.detail), 1 /* TEXT */)
        ]),
        createBaseVNode("em", null, toDisplayString($setup.tradingStatus.canTrade ? "可模拟成交" : "暂停成交"), 1 /* TEXT */)
      ], 2 /* CLASS */),
      createBaseVNode("section", _hoisted_6$b, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.indices, (index, indexNumber) => {
          return (openBlock(), createElementBlock("article", {
            key: index.code,
            class: normalizeClass(["index-card", { featured: indexNumber === 0 }])
          }, [
            createBaseVNode("div", _hoisted_7$b, [
              createBaseVNode("span", null, toDisplayString(index.shortName), 1 /* TEXT */),
              createBaseVNode("small", null, toDisplayString(index.code), 1 /* TEXT */)
            ]),
            createBaseVNode("strong", {
              class: normalizeClass($setup.trendClass(index.changePercent))
            }, toDisplayString(index.price.toFixed(2)), 3 /* TEXT, CLASS */),
            createBaseVNode("div", {
              class: normalizeClass(["index-meta", $setup.trendClass(index.changePercent)])
            }, [
              createBaseVNode("span", null, toDisplayString($setup.formatSigned(index.change)), 1 /* TEXT */),
              createBaseVNode("span", null, toDisplayString($setup.formatPct(index.changePercent)), 1 /* TEXT */)
            ], 2 /* CLASS */),
            createVNode($setup["Sparkline"], {
              values: index.history,
              positive: index.changePercent >= 0,
              width: 124,
              height: 38
            }, null, 8 /* PROPS */, ["values", "positive"])
          ], 2 /* CLASS */))
        }), 128 /* KEYED_FRAGMENT */))
      ]),
      createBaseVNode("section", _hoisted_8$a, [
        _cache[25] || (_cache[25] = createBaseVNode("div", { class: "hero-glow" }, null, -1 /* CACHED */)),
        createBaseVNode("header", null, [
          createBaseVNode("div", null, [
            createBaseVNode("span", null, [
              _cache[17] || (_cache[17] = createTextVNode("模拟总资产 ", -1 /* CACHED */)),
              createVNode($setup["Icon"], {
                name: "eye",
                size: 15
              })
            ]),
            createBaseVNode("strong", null, "¥ " + toDisplayString($setup.formatMoney($setup.account.totalAssets)), 1 /* TEXT */)
          ]),
          createBaseVNode("button", {
            type: "button",
            "aria-label": "进入模拟盘",
            onClick: _cache[2] || (_cache[2] = $event => ($setup.emit('navigate', 'portfolio')))
          }, [
            createVNode($setup["Icon"], {
              name: "arrowRight",
              size: 19
            })
          ])
        ]),
        createBaseVNode("div", {
          class: normalizeClass(["hero-pnl", $setup.trendClass($setup.account.dailyProfit)])
        }, [
          _cache[18] || (_cache[18] = createBaseVNode("span", null, "今日收益", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($setup.account.dailyProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.account.dailyProfit)), 1 /* TEXT */),
          createBaseVNode("em", null, toDisplayString($setup.formatPct($setup.account.dailyPercent)), 1 /* TEXT */)
        ], 2 /* CLASS */),
        ($setup.portfolioSeries.length > 1)
          ? (openBlock(), createElementBlock("div", _hoisted_9$a, [
              createVNode($setup["Sparkline"], {
                values: $setup.portfolioSeries,
                positive: $setup.account.dailyProfit >= 0,
                width: 310,
                height: 58
              }, null, 8 /* PROPS */, ["values", "positive"]),
              createBaseVNode("span", null, "本次会话 " + toDisplayString($setup.portfolioSeries.length) + " 次采样", 1 /* TEXT */)
            ]))
          : (openBlock(), createElementBlock("div", _hoisted_10$9, [
              createBaseVNode("div", null, [
                _cache[19] || (_cache[19] = createBaseVNode("span", null, "持仓", -1 /* CACHED */)),
                createBaseVNode("i", null, [
                  createBaseVNode("b", {
                    style: normalizeStyle({ width: `${$setup.account.positionPercent}%` })
                  }, null, 4 /* STYLE */)
                ]),
                _cache[20] || (_cache[20] = createBaseVNode("span", null, "现金", -1 /* CACHED */))
              ]),
              _cache[21] || (_cache[21] = createBaseVNode("small", null, "打开页面后开始记录实时资产变化", -1 /* CACHED */))
            ])),
        createBaseVNode("div", _hoisted_11$9, [
          createBaseVNode("div", null, [
            _cache[22] || (_cache[22] = createBaseVNode("span", null, "持仓市值", -1 /* CACHED */)),
            createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.account.marketValue, 0)), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[23] || (_cache[23] = createBaseVNode("span", null, "可用资金", -1 /* CACHED */)),
            createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.portfolio.cash, 0)), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[24] || (_cache[24] = createBaseVNode("span", null, "仓位", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($setup.account.positionPercent.toFixed(1)) + "%", 1 /* TEXT */)
          ])
        ])
      ]),
      createBaseVNode("section", _hoisted_12$9, [
        createBaseVNode("button", {
          type: "button",
          class: "quick-action",
          onClick: _cache[3] || (_cache[3] = $event => ($setup.emit('navigate', 'market')))
        }, [
          createBaseVNode("span", _hoisted_13$9, [
            createVNode($setup["Icon"], {
              name: "market",
              size: 22
            })
          ]),
          _cache[26] || (_cache[26] = createBaseVNode("span", null, "A 股行情", -1 /* CACHED */)),
          _cache[27] || (_cache[27] = createBaseVNode("small", null, "指数与个股", -1 /* CACHED */))
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "quick-action",
          onClick: _cache[4] || (_cache[4] = $event => ($setup.emit('navigate', 'search')))
        }, [
          createBaseVNode("span", _hoisted_14$9, [
            createVNode($setup["Icon"], {
              name: "search",
              size: 22
            })
          ]),
          _cache[28] || (_cache[28] = createBaseVNode("span", null, "快速查股", -1 /* CACHED */)),
          _cache[29] || (_cache[29] = createBaseVNode("small", null, "代码 / 名称", -1 /* CACHED */))
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "quick-action",
          onClick: _cache[5] || (_cache[5] = $event => ($setup.emit('open-ai')))
        }, [
          createBaseVNode("span", _hoisted_15$8, [
            createVNode($setup["Icon"], {
              name: "sparkles",
              size: 22
            })
          ]),
          _cache[30] || (_cache[30] = createBaseVNode("span", null, "持仓研究", -1 /* CACHED */)),
          _cache[31] || (_cache[31] = createBaseVNode("small", null, "关联分析", -1 /* CACHED */))
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "quick-action",
          onClick: _cache[6] || (_cache[6] = $event => ($setup.emit('navigate', 'insights')))
        }, [
          createBaseVNode("span", _hoisted_16$8, [
            createVNode($setup["Icon"], {
              name: "chart",
              size: 22
            })
          ]),
          _cache[32] || (_cache[32] = createBaseVNode("span", null, "资产分析", -1 /* CACHED */)),
          _cache[33] || (_cache[33] = createBaseVNode("small", null, "诊断与归因", -1 /* CACHED */))
        ])
      ]),
      createBaseVNode("section", _hoisted_17$8, [
        createBaseVNode("div", _hoisted_18$8, [
          _cache[36] || (_cache[36] = createBaseVNode("div", null, [
            createBaseVNode("span", null, "WATCHLIST"),
            createBaseVNode("h2", null, "我的自选")
          ], -1 /* CACHED */)),
          createBaseVNode("div", _hoisted_19$8, [
            createBaseVNode("button", {
              type: "button",
              onClick: _cache[7] || (_cache[7] = $event => ($setup.emit('open-watch-picker')))
            }, [
              createVNode($setup["Icon"], {
                name: "plus",
                size: 14
              }),
              _cache[34] || (_cache[34] = createTextVNode(" 添加", -1 /* CACHED */))
            ]),
            createBaseVNode("button", {
              type: "button",
              onClick: _cache[8] || (_cache[8] = $event => ($setup.emit('navigate', 'market')))
            }, [
              _cache[35] || (_cache[35] = createTextVNode("全部 ", -1 /* CACHED */)),
              createVNode($setup["Icon"], {
                name: "chevronRight",
                size: 15
              })
            ])
          ])
        ]),
        createBaseVNode("div", _hoisted_20$6, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($setup.watchStocks.slice(0, 4), (stock) => {
            return (openBlock(), createBlock($setup["StockRow"], {
              key: stock.code,
              stock: stock,
              onSelect: _cache[9] || (_cache[9] = $event => ($setup.emit('select-stock', $event)))
            }, null, 8 /* PROPS */, ["stock"]))
          }), 128 /* KEYED_FRAGMENT */))
        ])
      ]),
      createBaseVNode("section", _hoisted_21$6, [
        createBaseVNode("div", _hoisted_22$5, [
          _cache[37] || (_cache[37] = createBaseVNode("div", null, [
            createBaseVNode("span", null, "RECENTLY VIEWED"),
            createBaseVNode("h2", null, "最近浏览")
          ], -1 /* CACHED */)),
          ($setup.recentStocks.length)
            ? (openBlock(), createElementBlock("button", {
                key: 0,
                type: "button",
                onClick: _cache[10] || (_cache[10] = $event => {$setup.clearRecentViews(); $setup.emit('notify', '最近浏览已清空');})
              }, "清空"))
            : createCommentVNode("v-if", true)
        ]),
        ($setup.recentStocks.length)
          ? (openBlock(), createElementBlock("div", _hoisted_23$4, [
              (openBlock(true), createElementBlock(Fragment, null, renderList($setup.recentStocks, (item) => {
                return (openBlock(), createElementBlock("button", {
                  key: item.code + item.viewedAt,
                  type: "button",
                  class: "recent-stock-card",
                  onClick: $event => ($setup.emit('select-stock', item.stock))
                }, [
                  createBaseVNode("span", _hoisted_25$4, toDisplayString(item.stock.name.slice(0, 1)), 1 /* TEXT */),
                  createBaseVNode("span", null, [
                    createBaseVNode("strong", null, toDisplayString(item.stock.name), 1 /* TEXT */),
                    createBaseVNode("small", null, toDisplayString(item.stock.code), 1 /* TEXT */)
                  ]),
                  createBaseVNode("em", {
                    class: normalizeClass($setup.trendClass(item.stock.changePercent))
                  }, toDisplayString($setup.formatPct(item.stock.changePercent)), 3 /* TEXT, CLASS */)
                ], 8 /* PROPS */, _hoisted_24$4))
              }), 128 /* KEYED_FRAGMENT */))
            ]))
          : (openBlock(), createElementBlock("div", _hoisted_26$4, [
              createVNode($setup["Icon"], {
                name: "clock",
                size: 18
              }),
              _cache[38] || (_cache[38] = createBaseVNode("span", null, "浏览过的股票会保存在这里，方便快速返回。", -1 /* CACHED */))
            ]))
      ]),
      createBaseVNode("section", _hoisted_27$4, [
        createBaseVNode("div", _hoisted_28$3, [
          _cache[39] || (_cache[39] = createBaseVNode("div", null, [
            createBaseVNode("span", null, "MARKET PULSE"),
            createBaseVNode("h2", null, "市场温度")
          ], -1 /* CACHED */)),
          createBaseVNode("em", _hoisted_29$3, toDisplayString($setup.risingIndexCount >= 2 ? "指数偏暖" : "指数偏弱") + " " + toDisplayString($setup.risingIndexCount) + "/3", 1 /* TEXT */)
        ]),
        createBaseVNode("div", _hoisted_30$3, [
          createBaseVNode("span", {
            class: normalizeClass($setup.trendClass($setup.indices[0]?.changePercent))
          }, [
            createBaseVNode("strong", null, toDisplayString($setup.formatPct($setup.indices[0]?.changePercent)), 1 /* TEXT */),
            _cache[40] || (_cache[40] = createTextVNode("上证", -1 /* CACHED */))
          ], 2 /* CLASS */),
          createBaseVNode("span", {
            class: normalizeClass($setup.trendClass($setup.indices[1]?.changePercent))
          }, [
            createBaseVNode("strong", null, toDisplayString($setup.formatPct($setup.indices[1]?.changePercent)), 1 /* TEXT */),
            _cache[41] || (_cache[41] = createTextVNode("深证", -1 /* CACHED */))
          ], 2 /* CLASS */),
          createBaseVNode("span", {
            class: normalizeClass($setup.trendClass($setup.indices[2]?.changePercent))
          }, [
            createBaseVNode("strong", null, toDisplayString($setup.formatPct($setup.indices[2]?.changePercent)), 1 /* TEXT */),
            _cache[42] || (_cache[42] = createTextVNode("创业板", -1 /* CACHED */))
          ], 2 /* CLASS */)
        ]),
        createBaseVNode("div", _hoisted_31$3, [
          createBaseVNode("i", {
            class: normalizeClass($setup.trendClass($setup.averageIndexChange)),
            style: normalizeStyle({ width: `${Math.min(100, 25 + Math.abs($setup.averageIndexChange) * 20)}%` })
          }, null, 6 /* CLASS, STYLE */),
          _cache[43] || (_cache[43] = createBaseVNode("i", {
            class: "flat",
            style: { width: '24%' }
          }, null, -1 /* CACHED */))
        ]),
        createBaseVNode("div", _hoisted_32$2, [
          createBaseVNode("span", null, [
            _cache[44] || (_cache[44] = createBaseVNode("small", null, "沪深成交额", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($setup.totalCashTurnover ? $setup.formatCompactMoney($setup.totalCashTurnover) : "—"), 1 /* TEXT */)
          ]),
          createBaseVNode("span", null, [
            _cache[45] || (_cache[45] = createBaseVNode("small", null, "指数平均涨跌", -1 /* CACHED */)),
            createBaseVNode("strong", {
              class: normalizeClass($setup.trendClass($setup.averageIndexChange))
            }, toDisplayString($setup.formatPct($setup.averageIndexChange)), 3 /* TEXT, CLASS */)
          ]),
          createBaseVNode("span", null, [
            _cache[46] || (_cache[46] = createBaseVNode("small", null, "行情状态", -1 /* CACHED */)),
            createBaseVNode("strong", {
              class: normalizeClass({ rise: $setup.lastUpdated.live })
            }, toDisplayString($setup.lastUpdated.live ? "已同步" : $setup.marketMeta.connection === "stale" ? "缓存行情" : $setup.marketMeta.connection === "error" ? "连接失败" : "连接中"), 3 /* TEXT, CLASS */)
          ])
        ])
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "ai-brief",
        onClick: _cache[11] || (_cache[11] = $event => ($setup.emit('open-ai')))
      }, [
        createBaseVNode("span", _hoisted_33$1, [
          createVNode($setup["Icon"], {
            name: "sparkles",
            size: 22
          })
        ]),
        _cache[47] || (_cache[47] = createBaseVNode("span", { class: "ai-brief-copy" }, [
          createBaseVNode("small", null, "观潮研究 · 持仓简报"),
          createBaseVNode("strong", null, "从真实行情看你的模拟组合"),
          createBaseVNode("span", null, "结合持仓、当日涨跌和仓位给出解读")
        ], -1 /* CACHED */)),
        createVNode($setup["Icon"], {
          name: "arrowRight",
          size: 19
        })
      ])
    ])
  ]))
}
__sfc__$b.render = render$b;
__sfc__$b.__file = "src/views/HomeView.vue";

const __sfc__$a = {
  __name: 'InsightsView',
  emits: ["open-ai", "navigate"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const stressPercent = ref(-10);

const concentration = computed(() => {
  if (!holdings.value.length) return 0;
  return (holdings.value[0].marketValue / account.value.totalAssets) * 100;
});

const riskScore = computed(() => {
  const concentrationPenalty = Math.max(0, concentration.value - 20) * 1.8;
  const positionPenalty = Math.max(0, account.value.positionPercent - 55) * 0.35;
  return Math.round(Math.max(28, Math.min(88, 84 - concentrationPenalty - positionPenalty)));
});

const radarPoints = computed(() => {
  const values = [
    88 - concentration.value * 0.6,
    account.positionPercent > 65 ? 48 : 76,
    account.totalProfit >= 0 ? 82 : 58,
    Math.max(35, 88 - portfolio.ledger.length * 2),
    holdings.value.length >= 3 ? 80 : 52,
  ];
  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / values.length;
      const radius = (value / 100) * 48;
      return `${(60 + Math.cos(angle) * radius).toFixed(1)},${(60 + Math.sin(angle) * radius).toFixed(1)}`;
    })
    .join(" ");
});

const radarLabels = ["分散度", "仓位", "盈利力", "交易纪律", "行业覆盖"];

const sectorRows = computed(() => {
  const groups = {};
  holdings.value.forEach((holding) => {
    groups[holding.stock.sector] = (groups[holding.stock.sector] || 0) + holding.marketValue;
  });
  if (portfolio.cash) groups["现金"] = portfolio.cash;
  const colors = ["#ff736a", "#6d8dff", "#33d1a4", "#f1c269"];
  return Object.entries(groups)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => ({
      name,
      value,
      percent: (value / account.value.totalAssets) * 100,
      color: colors[index % colors.length],
    }));
});

const contributions = computed(() => {
  const items = holdings.value.map((holding) => ({
    ...holding,
    dailyContribution: (holding.stock.price - holding.stock.prevClose) * holding.shares,
  }));
  const max = Math.max(1, ...items.map((item) => Math.abs(item.dailyContribution)));
  return items
    .sort((a, b) => b.dailyContribution - a.dailyContribution)
    .map((item) => ({ ...item, width: (Math.abs(item.dailyContribution) / max) * 100 }));
});

const stressLoss = computed(() => account.value.marketValue * (stressPercent.value / 100));
const stressedAssets = computed(() => account.value.totalAssets + stressLoss.value);

function setStress(value) {
  stressPercent.value = value;
}

const __returned__ = { emit, stressPercent, concentration, riskScore, radarPoints, radarLabels, sectorRows, contributions, stressLoss, stressedAssets, setStress, computed, ref, Icon: __sfc__$n, get account() { return account }, get formatMoney() { return formatMoney }, get holdings() { return holdings }, get portfolio() { return portfolio }, get formatPct() { return formatPct }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$a = { class: "page insights-view" };
const _hoisted_2$a = { class: "health-card" };
const _hoisted_3$a = { class: "health-copy" };
const _hoisted_4$a = { class: "health-score" };
const _hoisted_5$a = { viewBox: "0 0 120 120" };
const _hoisted_6$a = { class: "analysis-grid" };
const _hoisted_7$a = { class: "metric-card" };
const _hoisted_8$9 = { class: "metric-card" };
const _hoisted_9$9 = { class: "contribution-card" };
const _hoisted_10$8 = { class: "section-heading compact" };
const _hoisted_11$8 = { class: "contribution-list" };
const _hoisted_12$8 = { class: "contribution-bar" };
const _hoisted_13$8 = { class: "stress-card" };
const _hoisted_14$8 = { class: "stress-result" };
const _hoisted_15$7 = { class: "stress-actions" };
const _hoisted_16$7 = ["onClick"];
const _hoisted_17$7 = { class: "radar-card" };
const _hoisted_18$7 = { class: "radar-layout" };
const _hoisted_19$7 = { class: "radar-chart" };
const _hoisted_20$5 = { viewBox: "0 0 120 120" };
const _hoisted_21$5 = ["points"];
const _hoisted_22$4 = ["points"];
const _hoisted_23$3 = ["x2", "y2"];
const _hoisted_24$3 = { class: "radar-legend" };
const _hoisted_25$3 = { class: "allocation-analysis" };
const _hoisted_26$3 = { class: "section-heading compact" };
const _hoisted_27$3 = { class: "exposure-label" };
const _hoisted_28$2 = { class: "exposure-track" };
const _hoisted_29$2 = { class: "behavior-card" };
const _hoisted_30$2 = { class: "behavior-grid" };
const _hoisted_31$2 = { class: "behavior-icon" };
const _hoisted_32$1 = { class: "behavior-icon blue" };
const _hoisted_33 = { class: "behavior-icon green" };

function render$a(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$a, [
    _cache[23] || (_cache[23] = createBaseVNode("header", { class: "view-header" }, [
      createBaseVNode("div", null, [
        createBaseVNode("span", { class: "eyebrow" }, "PORTFOLIO INSIGHTS"),
        createBaseVNode("h1", null, "资产分析")
      ]),
      createBaseVNode("span", { class: "update-badge" }, [
        createBaseVNode("i"),
        createTextVNode(" 已同步模拟账户")
      ])
    ], -1 /* CACHED */)),
    createBaseVNode("section", _hoisted_2$a, [
      createBaseVNode("div", _hoisted_3$a, [
        _cache[4] || (_cache[4] = createBaseVNode("span", null, "组合健康度", -1 /* CACHED */)),
        createBaseVNode("h2", null, toDisplayString($setup.riskScore >= 75 ? "结构健康" : "仍有优化空间"), 1 /* TEXT */),
        createBaseVNode("p", null, toDisplayString($setup.riskScore >= 75 ? "仓位与分散度处于合理区间，继续关注高波动持仓。" : "单一持仓与高波动标的占比较高，建议增加模拟现金缓冲。"), 1 /* TEXT */),
        createBaseVNode("button", {
          type: "button",
          onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('open-ai')))
        }, [
          _cache[3] || (_cache[3] = createTextVNode("查看组合观察 ", -1 /* CACHED */)),
          createVNode($setup["Icon"], {
            name: "arrowRight",
            size: 14
          })
        ])
      ]),
      createBaseVNode("div", _hoisted_4$a, [
        (openBlock(), createElementBlock("svg", _hoisted_5$a, [
          _cache[5] || (_cache[5] = createBaseVNode("circle", {
            cx: "60",
            cy: "60",
            r: "47"
          }, null, -1 /* CACHED */)),
          createBaseVNode("circle", {
            cx: "60",
            cy: "60",
            r: "47",
            class: "progress",
            style: normalizeStyle({ strokeDasharray: `${$setup.riskScore * 2.95} 999` })
          }, null, 4 /* STYLE */)
        ])),
        createBaseVNode("span", null, [
          createBaseVNode("strong", null, toDisplayString($setup.riskScore), 1 /* TEXT */),
          _cache[6] || (_cache[6] = createBaseVNode("small", null, "健康分", -1 /* CACHED */))
        ])
      ])
    ]),
    createBaseVNode("section", _hoisted_6$a, [
      createBaseVNode("article", _hoisted_7$a, [
        _cache[7] || (_cache[7] = createBaseVNode("span", null, "累计收益", -1 /* CACHED */)),
        createBaseVNode("strong", {
          class: normalizeClass($setup.trendClass($setup.account.totalProfit))
        }, toDisplayString($setup.account.totalProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.account.totalProfit, 0)), 3 /* TEXT, CLASS */),
        createBaseVNode("small", {
          class: normalizeClass($setup.trendClass($setup.account.totalProfit))
        }, toDisplayString($setup.formatPct($setup.account.totalProfitPercent)) + " 收益率", 3 /* TEXT, CLASS */)
      ]),
      createBaseVNode("article", _hoisted_8$9, [
        _cache[8] || (_cache[8] = createBaseVNode("span", null, "组合当日表现", -1 /* CACHED */)),
        createBaseVNode("strong", {
          class: normalizeClass($setup.trendClass($setup.account.dailyPercent))
        }, toDisplayString($setup.formatPct($setup.account.dailyPercent)), 3 /* TEXT, CLASS */),
        _cache[9] || (_cache[9] = createBaseVNode("small", { class: "muted" }, "按实时价格与昨收计算", -1 /* CACHED */))
      ])
    ]),
    createBaseVNode("section", _hoisted_9$9, [
      createBaseVNode("div", _hoisted_10$8, [
        _cache[10] || (_cache[10] = createBaseVNode("div", null, [
          createBaseVNode("span", null, "TODAY'S CONTRIBUTION"),
          createBaseVNode("h2", null, "今日收益贡献")
        ], -1 /* CACHED */)),
        createBaseVNode("em", {
          class: normalizeClass($setup.trendClass($setup.account.dailyProfit))
        }, toDisplayString($setup.account.dailyProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.account.dailyProfit, 0)), 3 /* TEXT, CLASS */)
      ]),
      createBaseVNode("div", _hoisted_11$8, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.contributions, (item) => {
          return (openBlock(), createElementBlock("article", {
            key: item.code
          }, [
            createBaseVNode("div", null, [
              createBaseVNode("strong", null, toDisplayString(item.stock.name), 1 /* TEXT */),
              createBaseVNode("small", null, toDisplayString(item.shares) + " 股 · " + toDisplayString($setup.formatPct(item.stock.changePercent)), 1 /* TEXT */)
            ]),
            createBaseVNode("div", _hoisted_12$8, [
              createBaseVNode("i", {
                class: normalizeClass($setup.trendClass(item.dailyContribution)),
                style: normalizeStyle({ width: `${item.width}%` })
              }, null, 6 /* CLASS, STYLE */)
            ]),
            createBaseVNode("strong", {
              class: normalizeClass($setup.trendClass(item.dailyContribution))
            }, toDisplayString(item.dailyContribution >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney(item.dailyContribution, 0)), 3 /* TEXT, CLASS */)
          ]))
        }), 128 /* KEYED_FRAGMENT */))
      ])
    ]),
    createBaseVNode("section", _hoisted_13$8, [
      _cache[14] || (_cache[14] = createBaseVNode("div", { class: "section-heading compact" }, [
        createBaseVNode("div", null, [
          createBaseVNode("span", null, "SCENARIO TEST"),
          createBaseVNode("h2", null, "持仓压力测试")
        ]),
        createBaseVNode("em", null, "不含未来预测")
      ], -1 /* CACHED */)),
      createBaseVNode("div", _hoisted_14$8, [
        createBaseVNode("div", null, [
          _cache[11] || (_cache[11] = createBaseVNode("span", null, "假设持仓整体变动", -1 /* CACHED */)),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass($setup.stressPercent))
          }, toDisplayString($setup.formatPct($setup.stressPercent)), 3 /* TEXT, CLASS */)
        ]),
        createBaseVNode("div", null, [
          _cache[12] || (_cache[12] = createBaseVNode("span", null, "估算总资产", -1 /* CACHED */)),
          createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.stressedAssets, 0)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[13] || (_cache[13] = createBaseVNode("span", null, "估算浮动", -1 /* CACHED */)),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass($setup.stressLoss))
          }, toDisplayString($setup.stressLoss >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.stressLoss, 0)), 3 /* TEXT, CLASS */)
        ])
      ]),
      withDirectives(createBaseVNode("input", {
        "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($setup.stressPercent) = $event)),
        class: "stress-slider",
        type: "range",
        min: "-30",
        max: "30",
        step: "1",
        "aria-label": "持仓整体变动幅度"
      }, null, 512 /* NEED_PATCH */), [
        [
          vModelText,
          $setup.stressPercent,
          void 0,
          { number: true }
        ]
      ]),
      createBaseVNode("div", _hoisted_15$7, [
        (openBlock(), createElementBlock(Fragment, null, renderList([-5, -10, -20, -30], (value) => {
          return createBaseVNode("button", {
            key: value,
            type: "button",
            class: normalizeClass({ active: $setup.stressPercent === value }),
            onClick: $event => ($setup.setStress(value))
          }, toDisplayString(value) + "% ", 11 /* TEXT, CLASS, PROPS */, _hoisted_16$7)
        }), 64 /* STABLE_FRAGMENT */))
      ]),
      _cache[15] || (_cache[15] = createBaseVNode("p", null, "仅按当前持仓市值做线性估算，未考虑个股涨跌差异、流动性和手续费。", -1 /* CACHED */))
    ]),
    createBaseVNode("section", _hoisted_17$7, [
      _cache[16] || (_cache[16] = createBaseVNode("div", { class: "section-heading compact" }, [
        createBaseVNode("div", null, [
          createBaseVNode("span", null, "RISK PROFILE"),
          createBaseVNode("h2", null, "五维画像")
        ]),
        createBaseVNode("em", null, "随账户变化")
      ], -1 /* CACHED */)),
      createBaseVNode("div", _hoisted_18$7, [
        createBaseVNode("div", _hoisted_19$7, [
          (openBlock(), createElementBlock("svg", _hoisted_20$5, [
            (openBlock(), createElementBlock(Fragment, null, renderList([0.33, 0.66, 1], (scale) => {
              return createBaseVNode("polygon", {
                key: scale,
                points: `60,${60 - 48 * scale} ${60 + 45.6 * scale},${60 - 14.8 * scale} ${60 + 28.2 * scale},${60 + 38.8 * scale} ${60 - 28.2 * scale},${60 + 38.8 * scale} ${60 - 45.6 * scale},${60 - 14.8 * scale}`
              }, null, 8 /* PROPS */, _hoisted_21$5)
            }), 64 /* STABLE_FRAGMENT */)),
            createBaseVNode("polygon", {
              points: $setup.radarPoints,
              class: "radar-shape"
            }, null, 8 /* PROPS */, _hoisted_22$4),
            (openBlock(), createElementBlock(Fragment, null, renderList(5, (index) => {
              return createBaseVNode("line", {
                key: index,
                x1: "60",
                y1: "60",
                x2: 60 + Math.cos(-Math.PI / 2 + ((index - 1) * Math.PI * 2) / 5) * 48,
                y2: 60 + Math.sin(-Math.PI / 2 + ((index - 1) * Math.PI * 2) / 5) * 48
              }, null, 8 /* PROPS */, _hoisted_23$3)
            }), 64 /* STABLE_FRAGMENT */))
          ]))
        ]),
        createBaseVNode("div", _hoisted_24$3, [
          (openBlock(), createElementBlock(Fragment, null, renderList($setup.radarLabels, (label) => {
            return createBaseVNode("span", { key: label }, toDisplayString(label), 1 /* TEXT */)
          }), 64 /* STABLE_FRAGMENT */))
        ])
      ])
    ]),
    createBaseVNode("section", _hoisted_25$3, [
      createBaseVNode("div", _hoisted_26$3, [
        _cache[17] || (_cache[17] = createBaseVNode("div", null, [
          createBaseVNode("span", null, "EXPOSURE"),
          createBaseVNode("h2", null, "行业暴露")
        ], -1 /* CACHED */)),
        createBaseVNode("em", null, toDisplayString($setup.holdings.length) + " 个持仓", 1 /* TEXT */)
      ]),
      (openBlock(true), createElementBlock(Fragment, null, renderList($setup.sectorRows, (sector) => {
        return (openBlock(), createElementBlock("div", {
          key: sector.name,
          class: "exposure-row"
        }, [
          createBaseVNode("div", _hoisted_27$3, [
            createBaseVNode("span", null, [
              createBaseVNode("i", {
                style: normalizeStyle({ background: sector.color })
              }, null, 4 /* STYLE */),
              createTextVNode(toDisplayString(sector.name), 1 /* TEXT */)
            ]),
            createBaseVNode("strong", null, toDisplayString(sector.percent.toFixed(1)) + "%", 1 /* TEXT */)
          ]),
          createBaseVNode("div", _hoisted_28$2, [
            createBaseVNode("i", {
              style: normalizeStyle({ width: `${sector.percent}%`, background: sector.color })
            }, null, 4 /* STYLE */)
          ])
        ]))
      }), 128 /* KEYED_FRAGMENT */))
    ]),
    createBaseVNode("section", _hoisted_29$2, [
      _cache[21] || (_cache[21] = createBaseVNode("div", { class: "section-heading compact" }, [
        createBaseVNode("div", null, [
          createBaseVNode("span", null, "BEHAVIOR"),
          createBaseVNode("h2", null, "投资行为")
        ]),
        createBaseVNode("em", null, "本地记录")
      ], -1 /* CACHED */)),
      createBaseVNode("div", _hoisted_30$2, [
        createBaseVNode("div", null, [
          createBaseVNode("span", _hoisted_31$2, [
            createVNode($setup["Icon"], {
              name: "clock",
              size: 18
            })
          ]),
          createBaseVNode("strong", null, toDisplayString($setup.portfolio.ledger.length) + " 笔", 1 /* TEXT */),
          _cache[18] || (_cache[18] = createBaseVNode("small", null, "累计交易", -1 /* CACHED */))
        ]),
        createBaseVNode("div", null, [
          createBaseVNode("span", _hoisted_32$1, [
            createVNode($setup["Icon"], {
              name: "chart",
              size: 18
            })
          ]),
          createBaseVNode("strong", null, toDisplayString($setup.concentration.toFixed(0)) + "%", 1 /* TEXT */),
          _cache[19] || (_cache[19] = createBaseVNode("small", null, "最大单仓", -1 /* CACHED */))
        ]),
        createBaseVNode("div", null, [
          createBaseVNode("span", _hoisted_33, [
            createVNode($setup["Icon"], {
              name: "shield",
              size: 18
            })
          ]),
          createBaseVNode("strong", null, toDisplayString($setup.account.positionPercent.toFixed(0)) + "%", 1 /* TEXT */),
          _cache[20] || (_cache[20] = createBaseVNode("small", null, "当前仓位", -1 /* CACHED */))
        ])
      ]),
      createBaseVNode("p", null, [
        createVNode($setup["Icon"], {
          name: "sliders",
          size: 15
        }),
        createTextVNode(" 当前最大单仓占总资产 " + toDisplayString($setup.concentration.toFixed(1)) + "%，现金占比 " + toDisplayString((100 - $setup.account.positionPercent).toFixed(1)) + "%。可在压力测试中观察不同跌幅下的资产变化。", 1 /* TEXT */)
      ])
    ]),
    createBaseVNode("button", {
      type: "button",
      class: "analysis-cta",
      onClick: _cache[2] || (_cache[2] = $event => ($setup.emit('open-ai')))
    }, [
      createBaseVNode("span", null, [
        createVNode($setup["Icon"], {
          name: "message",
          size: 20
        })
      ]),
      _cache[22] || (_cache[22] = createBaseVNode("div", null, [
        createBaseVNode("strong", null, "和观潮助手复盘当前组合"),
        createBaseVNode("small", null, "结合实时行情与本地交易记录")
      ], -1 /* CACHED */)),
      createVNode($setup["Icon"], {
        name: "arrowRight",
        size: 18
      })
    ])
  ]))
}
__sfc__$a.render = render$a;
__sfc__$a.__file = "src/views/InsightsView.vue";

const __sfc__$9 = {
  __name: 'MarketView',
  emits: ["navigate", "select-stock", "open-ai", "open-alerts", "open-watch-picker", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const tab = ref("watch");
const sort = ref("default");
const refreshing = ref(false);

const tabs = [
  { id: "watch", label: "自选" },
  { id: "all", label: "全部" },
  { id: "rise", label: "涨幅" },
  { id: "fall", label: "跌幅" },
];

const visibleStocks = computed(() => {
  let result = tab.value === "watch" ? [...watchStocks.value] : [...stocks];
  if (tab.value === "rise") result.sort((a, b) => b.price / b.prevClose - a.price / a.prevClose);
  if (tab.value === "fall") result.sort((a, b) => a.price / a.prevClose - b.price / b.prevClose);
  if (sort.value === "change") result.sort((a, b) => b.price / b.prevClose - a.price / a.prevClose);
  if (sort.value === "price") result.sort((a, b) => b.price - a.price);
  return result;
});

const updatedLabel = computed(() => {
  const value = lastUpdated.tradeTimestamp || lastUpdated.value;
  if (!value) return "等待同步";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
});

async function reload() {
  if (refreshing.value) return;
  refreshing.value = true;
  const result = await refreshMarket({ includeSectors: true });
  refreshing.value = false;
  emit("notify", result.ok ? (result.stale ? "接口波动，已使用最近缓存行情" : "真实 A 股行情已刷新") : result.message);
}

function cycleSort() {
  sort.value = sort.value === "default" ? "change" : sort.value === "change" ? "price" : "default";
}

const __returned__ = { emit, tab, sort, refreshing, tabs, visibleStocks, updatedLabel, reload, cycleSort, computed, ref, Icon: __sfc__$n, Sparkline: __sfc__$d, StockRow: __sfc__$c, get formatCompactMoney() { return formatCompactMoney }, get activeAlertCount() { return activeAlertCount }, get indices() { return indices }, get lastUpdated() { return lastUpdated }, get marketMeta() { return marketMeta }, get refreshMarket() { return refreshMarket }, get sectorStats() { return sectorStats }, get stocks() { return stocks }, get tradingStatus() { return tradingStatus }, get watchStocks() { return watchStocks }, get formatPct() { return formatPct }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$9 = { class: "page market-view" };
const _hoisted_2$9 = { class: "view-header" };
const _hoisted_3$9 = { class: "header-actions" };
const _hoisted_4$9 = { key: 0 };
const _hoisted_5$9 = { class: "market-overview" };
const _hoisted_6$9 = { class: "market-map" };
const _hoisted_7$9 = { class: "sector-grid" };
const _hoisted_8$8 = ["onClick"];
const _hoisted_9$8 = { class: "market-list-section" };
const _hoisted_10$7 = { class: "market-list-head" };
const _hoisted_11$7 = { class: "segmented small" };
const _hoisted_12$7 = ["onClick"];
const _hoisted_13$7 = { class: "list-meta" };
const _hoisted_14$7 = { class: "stock-list full" };

function render$9(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$9, [
    createBaseVNode("header", _hoisted_2$9, [
      _cache[6] || (_cache[6] = createBaseVNode("div", null, [
        createBaseVNode("span", { class: "eyebrow" }, "MARKET"),
        createBaseVNode("h1", null, "行情")
      ], -1 /* CACHED */)),
      createBaseVNode("div", _hoisted_3$9, [
        createBaseVNode("button", {
          type: "button",
          class: "icon-button",
          "aria-label": "刷新",
          onClick: $setup.reload
        }, [
          createVNode($setup["Icon"], {
            name: "refresh",
            size: 19,
            class: normalizeClass({ spin: $setup.refreshing })
          }, null, 8 /* PROPS */, ["class"])
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button notification",
          "aria-label": "价格提醒",
          onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('open-alerts')))
        }, [
          createVNode($setup["Icon"], {
            name: "bell",
            size: 19
          }),
          ($setup.activeAlertCount)
            ? (openBlock(), createElementBlock("i", _hoisted_4$9))
            : createCommentVNode("v-if", true)
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button",
          "aria-label": "添加或管理自选",
          onClick: _cache[1] || (_cache[1] = $event => ($setup.emit('open-watch-picker')))
        }, [
          createVNode($setup["Icon"], {
            name: "star",
            size: 19
          })
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button",
          "aria-label": "搜索",
          onClick: _cache[2] || (_cache[2] = $event => ($setup.emit('navigate', 'search')))
        }, [
          createVNode($setup["Icon"], {
            name: "search",
            size: 20
          })
        ])
      ])
    ]),
    createBaseVNode("button", {
      type: "button",
      class: "search-entry market-search",
      onClick: _cache[3] || (_cache[3] = $event => ($setup.emit('navigate', 'search')))
    }, [
      createVNode($setup["Icon"], {
        name: "search",
        size: 19
      }),
      _cache[7] || (_cache[7] = createBaseVNode("span", null, "搜索全部 A 股", -1 /* CACHED */)),
      _cache[8] || (_cache[8] = createBaseVNode("span", { class: "search-shortcut" }, "名称 / 代码 / 拼音", -1 /* CACHED */))
    ]),
    createBaseVNode("div", {
      class: normalizeClass(["market-session-strip compact", $setup.tradingStatus.phase])
    }, [
      _cache[9] || (_cache[9] = createBaseVNode("span", { class: "session-dot" }, null, -1 /* CACHED */)),
      createBaseVNode("div", null, [
        createBaseVNode("strong", null, toDisplayString($setup.tradingStatus.label), 1 /* TEXT */),
        createBaseVNode("small", null, toDisplayString($setup.tradingStatus.detail), 1 /* TEXT */)
      ]),
      createBaseVNode("em", null, toDisplayString($setup.lastUpdated.live ? "实时行情" : "缓存行情"), 1 /* TEXT */)
    ], 2 /* CLASS */),
    createBaseVNode("section", _hoisted_5$9, [
      (openBlock(true), createElementBlock(Fragment, null, renderList($setup.indices, (index, i) => {
        return (openBlock(), createElementBlock("article", {
          key: index.code,
          class: "mini-index"
        }, [
          createBaseVNode("span", null, toDisplayString(index.shortName), 1 /* TEXT */),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass(index.changePercent))
          }, toDisplayString(index.price.toFixed(2)), 3 /* TEXT, CLASS */),
          createBaseVNode("small", {
            class: normalizeClass($setup.trendClass(index.changePercent))
          }, toDisplayString($setup.formatPct(index.changePercent)), 3 /* TEXT, CLASS */),
          createVNode($setup["Sparkline"], {
            values: index.history,
            positive: index.changePercent >= 0,
            width: 86,
            height: 28
          }, null, 8 /* PROPS */, ["values", "positive"])
        ]))
      }), 128 /* KEYED_FRAGMENT */))
    ]),
    createBaseVNode("section", _hoisted_6$9, [
      _cache[10] || (_cache[10] = createBaseVNode("div", { class: "section-heading compact" }, [
        createBaseVNode("div", null, [
          createBaseVNode("span", null, "SECTOR MAP"),
          createBaseVNode("h2", null, "行业热度")
        ]),
        createBaseVNode("em", null, "公开资金流向")
      ], -1 /* CACHED */)),
      createBaseVNode("div", _hoisted_7$9, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.sectorStats, (sector) => {
          return (openBlock(), createElementBlock("button", {
            key: sector.name,
            type: "button",
            class: normalizeClass(["sector-tile", [$setup.trendClass(sector.change), sector.change > 3 ? 'hot' : sector.change < 0 ? 'cool' : 'warm']]),
            onClick: $event => ($setup.emit('notify', `${sector.name}板块净流入 ${$setup.formatCompactMoney(sector.mainNet)}`))
          }, [
            createBaseVNode("span", null, toDisplayString(sector.name), 1 /* TEXT */),
            createBaseVNode("strong", null, toDisplayString($setup.formatPct(sector.change)), 1 /* TEXT */)
          ], 10 /* CLASS, PROPS */, _hoisted_8$8))
        }), 128 /* KEYED_FRAGMENT */))
      ])
    ]),
    createBaseVNode("section", _hoisted_9$8, [
      createBaseVNode("div", _hoisted_10$7, [
        createBaseVNode("div", _hoisted_11$7, [
          (openBlock(), createElementBlock(Fragment, null, renderList($setup.tabs, (item) => {
            return createBaseVNode("button", {
              key: item.id,
              type: "button",
              class: normalizeClass({ active: $setup.tab === item.id }),
              onClick: $event => ($setup.tab = item.id)
            }, toDisplayString(item.label), 11 /* TEXT, CLASS, PROPS */, _hoisted_12$7)
          }), 64 /* STABLE_FRAGMENT */))
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "sort-button",
          onClick: $setup.cycleSort
        }, [
          createVNode($setup["Icon"], {
            name: "filter",
            size: 15
          }),
          createTextVNode(" " + toDisplayString($setup.sort === "default" ? "默认" : $setup.sort === "change" ? "涨跌" : "价格"), 1 /* TEXT */)
        ])
      ]),
      createBaseVNode("div", _hoisted_13$7, [
        createBaseVNode("span", null, toDisplayString($setup.visibleStocks.length) + " 个自选 / 常用标的", 1 /* TEXT */),
        createBaseVNode("span", null, [
          createBaseVNode("i", {
            class: normalizeClass(["live-dot", { stale: $setup.marketMeta.connection === 'stale' }])
          }, null, 2 /* CLASS */),
          createTextVNode(" " + toDisplayString($setup.lastUpdated.live ? "实时" : $setup.marketMeta.connection === "stale" ? "缓存" : "等待连接") + " · " + toDisplayString($setup.updatedLabel), 1 /* TEXT */)
        ])
      ]),
      createBaseVNode("div", _hoisted_14$7, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.visibleStocks, (stock) => {
          return (openBlock(), createBlock($setup["StockRow"], {
            key: stock.code,
            stock: stock,
            onSelect: _cache[4] || (_cache[4] = $event => ($setup.emit('select-stock', $event)))
          }, null, 8 /* PROPS */, ["stock"]))
        }), 128 /* KEYED_FRAGMENT */))
      ])
    ]),
    createBaseVNode("button", {
      type: "button",
      class: "ai-inline-card",
      onClick: _cache[5] || (_cache[5] = $event => ($setup.emit('open-ai')))
    }, [
      createBaseVNode("span", null, [
        createVNode($setup["Icon"], {
          name: "sparkles",
          size: 19
        })
      ]),
      _cache[11] || (_cache[11] = createBaseVNode("div", null, [
        createBaseVNode("strong", null, "把自选股和实际持仓放在一起看"),
        createBaseVNode("small", null, "打开研究助手，梳理板块暴露与仓位风险")
      ], -1 /* CACHED */)),
      createVNode($setup["Icon"], {
        name: "arrowRight",
        size: 18
      })
    ])
  ]))
}
__sfc__$9.render = render$9;
__sfc__$9.__file = "src/views/MarketView.vue";

const __sfc__$8 = {
  __name: 'PortfolioView',
  emits: ["navigate", "select-stock", "open-ai", "open-trade-picker", "open-report", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const ledgerOpen = ref(true);

const chartValues = computed(() => {
  return portfolio.history.map((item) => item.value);
});

const composition = computed(() => {
  const colors = ["#ff736a", "#6d8dff", "#33d1a4", "#f1c269"];
  const result = holdings.value.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
  }));
  if (portfolio.cash > 0) {
    result.push({
      code: "cash",
      stock: { name: "现金" },
      marketValue: portfolio.cash,
      color: "#23364c",
    });
  }
  return result;
});

const donutStyle = computed(() => {
  let position = 0;
  const segments = composition.value.map((item) => {
    const start = position;
    position += (item.marketValue / account.value.totalAssets) * 100;
    return `${item.color} ${start.toFixed(1)}% ${position.toFixed(1)}%`;
  });
  return { background: `conic-gradient(${segments.join(", ")})` };
});

const strongestHolding = computed(() =>
  [...holdings.value].sort((a, b) => b.profitPercent - a.profitPercent)[0],
);
const concentration = computed(() => {
  if (!holdings.value.length) return 0;
  return (holdings.value[0].marketValue / account.value.totalAssets) * 100;
});

function tradeNew() {
  emit("open-trade-picker");
}

const __returned__ = { emit, ledgerOpen, chartValues, composition, donutStyle, strongestHolding, concentration, tradeNew, computed, ref, Icon: __sfc__$n, Sparkline: __sfc__$d, get account() { return account }, get formatMoney() { return formatMoney }, get holdings() { return holdings }, get portfolio() { return portfolio }, get tradingStatus() { return tradingStatus }, get formatPct() { return formatPct }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$8 = { class: "page portfolio-view" };
const _hoisted_2$8 = { class: "view-header" };
const _hoisted_3$8 = { class: "asset-hero" };
const _hoisted_4$8 = { class: "asset-topline" };
const _hoisted_5$8 = {
  key: 0,
  class: "asset-chart"
};
const _hoisted_6$8 = { class: "chart-periods" };
const _hoisted_7$8 = {
  key: 1,
  class: "asset-composition-strip"
};
const _hoisted_8$7 = { class: "account-metrics" };
const _hoisted_9$7 = { class: "portfolio-actions" };
const _hoisted_10$6 = ["disabled"];
const _hoisted_11$6 = { class: "section-block holdings-section" };
const _hoisted_12$6 = { class: "section-heading" };
const _hoisted_13$6 = { class: "holding-list" };
const _hoisted_14$6 = ["onClick"];
const _hoisted_15$6 = { class: "holding-logo" };
const _hoisted_16$6 = { class: "holding-info" };
const _hoisted_17$6 = { class: "holding-value" };
const _hoisted_18$6 = { class: "allocation-card" };
const _hoisted_19$6 = { class: "allocation-copy" };
const _hoisted_20$4 = { class: "allocation-legend" };
const _hoisted_21$4 = { class: "smart-check" };
const _hoisted_22$3 = { class: "smart-check-head" };
const _hoisted_23$2 = { class: "smart-icon" };
const _hoisted_24$2 = {
  key: 0,
  class: "ledger-section"
};
const _hoisted_25$2 = { class: "ledger-list" };
const _hoisted_26$2 = {
  key: 0,
  class: "ledger-note"
};
const _hoisted_27$2 = {
  key: 1,
  class: "account-insight"
};

function render$8(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$8, [
    createBaseVNode("header", _hoisted_2$8, [
      _cache[4] || (_cache[4] = createBaseVNode("div", null, [
        createBaseVNode("span", { class: "eyebrow" }, "SIMULATED ACCOUNT"),
        createBaseVNode("h1", null, "模拟盘")
      ], -1 /* CACHED */)),
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "组合分析",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('open-ai')))
      }, [
        createVNode($setup["Icon"], {
          name: "chart",
          size: 20
        })
      ])
    ]),
    createBaseVNode("section", _hoisted_3$8, [
      createBaseVNode("div", _hoisted_4$8, [
        createBaseVNode("span", null, [
          _cache[5] || (_cache[5] = createTextVNode("总资产（CNY） ", -1 /* CACHED */)),
          createVNode($setup["Icon"], {
            name: "eye",
            size: 14
          })
        ]),
        _cache[6] || (_cache[6] = createBaseVNode("span", { class: "simulated-tag" }, "虚拟资金", -1 /* CACHED */))
      ]),
      createBaseVNode("strong", null, "¥ " + toDisplayString($setup.formatMoney($setup.account.totalAssets)), 1 /* TEXT */),
      createBaseVNode("div", {
        class: normalizeClass(["asset-delta", $setup.trendClass($setup.account.dailyProfit)])
      }, [
        createBaseVNode("span", null, "今日 " + toDisplayString($setup.account.dailyProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.account.dailyProfit)), 1 /* TEXT */),
        createBaseVNode("em", null, toDisplayString($setup.formatPct($setup.account.dailyPercent)), 1 /* TEXT */)
      ], 2 /* CLASS */),
      ($setup.chartValues.length > 1)
        ? (openBlock(), createElementBlock("div", _hoisted_5$8, [
            createVNode($setup["Sparkline"], {
              values: $setup.chartValues,
              positive: $setup.account.totalProfit >= 0,
              width: 330,
              height: 80
            }, null, 8 /* PROPS */, ["values", "positive"]),
            createBaseVNode("div", _hoisted_6$8, [
              createBaseVNode("span", null, "本次会话 " + toDisplayString($setup.chartValues.length) + " 次采样", 1 /* TEXT */)
            ])
          ]))
        : (openBlock(), createElementBlock("div", _hoisted_7$8, [
            createBaseVNode("div", null, [
              _cache[7] || (_cache[7] = createBaseVNode("span", null, "持仓", -1 /* CACHED */)),
              createBaseVNode("strong", null, toDisplayString($setup.account.positionPercent.toFixed(1)) + "%", 1 /* TEXT */)
            ]),
            createBaseVNode("i", null, [
              createBaseVNode("b", {
                style: normalizeStyle({ width: `${$setup.account.positionPercent}%` })
              }, null, 4 /* STYLE */)
            ]),
            createBaseVNode("div", null, [
              _cache[8] || (_cache[8] = createBaseVNode("span", null, "现金", -1 /* CACHED */)),
              createBaseVNode("strong", null, toDisplayString((100 - $setup.account.positionPercent).toFixed(1)) + "%", 1 /* TEXT */)
            ])
          ]))
    ]),
    createBaseVNode("section", _hoisted_8$7, [
      createBaseVNode("div", null, [
        _cache[9] || (_cache[9] = createBaseVNode("span", null, "持仓市值", -1 /* CACHED */)),
        createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.account.marketValue, 0)), 1 /* TEXT */)
      ]),
      createBaseVNode("div", null, [
        _cache[10] || (_cache[10] = createBaseVNode("span", null, "可用资金", -1 /* CACHED */)),
        createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.portfolio.cash, 0)), 1 /* TEXT */)
      ]),
      createBaseVNode("div", null, [
        _cache[11] || (_cache[11] = createBaseVNode("span", null, "累计收益", -1 /* CACHED */)),
        createBaseVNode("strong", {
          class: normalizeClass($setup.trendClass($setup.account.totalProfit))
        }, toDisplayString($setup.account.totalProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.account.totalProfit, 0)), 3 /* TEXT, CLASS */)
      ])
    ]),
    createBaseVNode("div", {
      class: normalizeClass(["portfolio-session-note", $setup.tradingStatus.phase])
    }, [
      createVNode($setup["Icon"], {
        name: $setup.tradingStatus.canTrade ? 'check' : 'clock',
        size: 16
      }, null, 8 /* PROPS */, ["name"]),
      createBaseVNode("span", null, [
        createBaseVNode("strong", null, toDisplayString($setup.tradingStatus.label), 1 /* TEXT */),
        createTextVNode(" " + toDisplayString($setup.tradingStatus.detail), 1 /* TEXT */)
      ])
    ], 2 /* CLASS */),
    createBaseVNode("section", _hoisted_9$7, [
      createBaseVNode("button", {
        type: "button",
        class: "primary-button",
        disabled: !$setup.tradingStatus.canTrade,
        onClick: $setup.tradeNew
      }, [
        createVNode($setup["Icon"], {
          name: "plus",
          size: 18
        }),
        createTextVNode(" " + toDisplayString($setup.tradingStatus.canTrade ? "模拟交易" : `${$setup.tradingStatus.label}，暂停成交`), 1 /* TEXT */)
      ], 8 /* PROPS */, _hoisted_10$6),
      createBaseVNode("button", {
        type: "button",
        class: "secondary-button",
        onClick: _cache[1] || (_cache[1] = $event => ($setup.ledgerOpen = !$setup.ledgerOpen))
      }, [
        createVNode($setup["Icon"], {
          name: "edit",
          size: 18
        }),
        _cache[12] || (_cache[12] = createTextVNode(" 资金记账 ", -1 /* CACHED */))
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "secondary-button",
        onClick: _cache[2] || (_cache[2] = $event => ($setup.emit('open-report')))
      }, [
        createVNode($setup["Icon"], {
          name: "share",
          size: 18
        }),
        _cache[13] || (_cache[13] = createTextVNode(" 个人财报 ", -1 /* CACHED */))
      ])
    ]),
    createBaseVNode("section", _hoisted_11$6, [
      createBaseVNode("div", _hoisted_12$6, [
        _cache[14] || (_cache[14] = createBaseVNode("div", null, [
          createBaseVNode("span", null, "POSITIONS"),
          createBaseVNode("h2", null, "我的持仓")
        ], -1 /* CACHED */)),
        createBaseVNode("em", null, toDisplayString($setup.holdings.length) + " 个标的", 1 /* TEXT */)
      ]),
      createBaseVNode("div", _hoisted_13$6, [
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.holdings, (holding) => {
          return (openBlock(), createElementBlock("button", {
            key: holding.code,
            type: "button",
            class: "holding-row",
            onClick: $event => ($setup.emit('select-stock', holding.stock))
          }, [
            createBaseVNode("span", _hoisted_15$6, toDisplayString(holding.stock.name.slice(0, 1)), 1 /* TEXT */),
            createBaseVNode("span", _hoisted_16$6, [
              createBaseVNode("strong", null, toDisplayString(holding.stock.name), 1 /* TEXT */),
              createBaseVNode("small", null, toDisplayString(holding.shares) + " 股 · 可卖 " + toDisplayString(holding.availableShares ?? holding.shares) + " · 成本 " + toDisplayString(holding.avgCost.toFixed(2)), 1 /* TEXT */)
            ]),
            createBaseVNode("span", _hoisted_17$6, [
              createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney(holding.marketValue, 0)), 1 /* TEXT */),
              createBaseVNode("small", {
                class: normalizeClass($setup.trendClass(holding.profit))
              }, toDisplayString($setup.formatPct(holding.profitPercent)), 3 /* TEXT, CLASS */)
            ])
          ], 8 /* PROPS */, _hoisted_14$6))
        }), 128 /* KEYED_FRAGMENT */))
      ])
    ]),
    createBaseVNode("section", _hoisted_18$6, [
      createBaseVNode("div", {
        class: "allocation-donut",
        style: normalizeStyle($setup.donutStyle)
      }, [
        createBaseVNode("span", null, [
          createBaseVNode("strong", null, toDisplayString($setup.account.positionPercent.toFixed(0)) + "%", 1 /* TEXT */),
          _cache[15] || (_cache[15] = createBaseVNode("small", null, "仓位", -1 /* CACHED */))
        ])
      ], 4 /* STYLE */),
      createBaseVNode("div", _hoisted_19$6, [
        _cache[16] || (_cache[16] = createBaseVNode("span", null, "ASSET ALLOCATION", -1 /* CACHED */)),
        _cache[17] || (_cache[17] = createBaseVNode("h3", null, "资产分布", -1 /* CACHED */)),
        createBaseVNode("div", _hoisted_20$4, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($setup.composition, (item) => {
            return (openBlock(), createElementBlock("span", {
              key: item.code
            }, [
              createBaseVNode("i", {
                style: normalizeStyle({ background: item.color })
              }, null, 4 /* STYLE */),
              createTextVNode(" " + toDisplayString(item.stock.name) + " ", 1 /* TEXT */),
              createBaseVNode("em", null, toDisplayString(((item.marketValue / $setup.account.totalAssets) * 100).toFixed(0)) + "%", 1 /* TEXT */)
            ]))
          }), 128 /* KEYED_FRAGMENT */))
        ])
      ])
    ]),
    createBaseVNode("section", _hoisted_21$4, [
      createBaseVNode("div", _hoisted_22$3, [
        createBaseVNode("span", _hoisted_23$2, [
          createVNode($setup["Icon"], {
            name: "shield",
            size: 19
          })
        ]),
        _cache[18] || (_cache[18] = createBaseVNode("div", null, [
          createBaseVNode("strong", null, "模拟仓体检"),
          createBaseVNode("small", null, "基于当前账户数据")
        ], -1 /* CACHED */)),
        createBaseVNode("em", null, toDisplayString($setup.concentration < 25 ? "较稳健" : "需关注"), 1 /* TEXT */)
      ]),
      createBaseVNode("p", null, [
        createTextVNode(" 最大单仓占比 " + toDisplayString($setup.concentration.toFixed(1)) + "%， ", 1 /* TEXT */),
        ($setup.concentration > 25)
          ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
              createTextVNode("账户对单一标的较为依赖，可在模拟盘中练习分批调整。")
            ], 64 /* STABLE_FRAGMENT */))
          : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createTextVNode("持仓集中度处于合理区间，仍建议保留一定现金。")
            ], 64 /* STABLE_FRAGMENT */))
      ]),
      createBaseVNode("button", {
        type: "button",
        onClick: _cache[3] || (_cache[3] = $event => ($setup.emit('navigate', 'insights')))
      }, [
        _cache[19] || (_cache[19] = createTextVNode("查看压力测试 ", -1 /* CACHED */)),
        createVNode($setup["Icon"], {
          name: "arrowRight",
          size: 14
        })
      ])
    ]),
    ($setup.ledgerOpen)
      ? (openBlock(), createElementBlock("section", _hoisted_24$2, [
          _cache[20] || (_cache[20] = createBaseVNode("div", { class: "section-heading compact" }, [
            createBaseVNode("div", null, [
              createBaseVNode("span", null, "LEDGER"),
              createBaseVNode("h2", null, "资金流水")
            ]),
            createBaseVNode("em", null, "自动记账")
          ], -1 /* CACHED */)),
          createBaseVNode("div", _hoisted_25$2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList($setup.portfolio.ledger.slice(0, 5), (entry) => {
              return (openBlock(), createElementBlock("article", {
                key: entry.id
              }, [
                createBaseVNode("span", {
                  class: normalizeClass(["ledger-icon", entry.type])
                }, [
                  createVNode($setup["Icon"], {
                    name: entry.type === 'buy' ? 'plus' : 'minus',
                    size: 16
                  }, null, 8 /* PROPS */, ["name"])
                ], 2 /* CLASS */),
                createBaseVNode("div", null, [
                  createBaseVNode("strong", null, toDisplayString(entry.type === "buy" ? "买入" : "卖出") + " " + toDisplayString(entry.name), 1 /* TEXT */),
                  createBaseVNode("small", null, toDisplayString(entry.time) + " · " + toDisplayString(entry.shares) + " 股", 1 /* TEXT */),
                  (entry.note)
                    ? (openBlock(), createElementBlock("p", _hoisted_26$2, toDisplayString(entry.note), 1 /* TEXT */))
                    : createCommentVNode("v-if", true)
                ]),
                createBaseVNode("span", {
                  class: normalizeClass(["ledger-amount", entry.type])
                }, toDisplayString(entry.type === "buy" ? "-" : "+") + "¥" + toDisplayString($setup.formatMoney(entry.amount)), 3 /* TEXT, CLASS */)
              ]))
            }), 128 /* KEYED_FRAGMENT */))
          ])
        ]))
      : createCommentVNode("v-if", true),
    ($setup.strongestHolding)
      ? (openBlock(), createElementBlock("p", _hoisted_27$2, [
          createVNode($setup["Icon"], {
            name: "trend",
            size: 15
          }),
          createTextVNode(" 当前贡献最高的是 " + toDisplayString($setup.strongestHolding.stock.name) + "，模拟收益 " + toDisplayString($setup.formatPct($setup.strongestHolding.profitPercent)) + "。 ", 1 /* TEXT */)
        ]))
      : createCommentVNode("v-if", true)
  ]))
}
__sfc__$8.render = render$8;
__sfc__$8.__file = "src/views/PortfolioView.vue";

const __sfc__$7 = {
  __name: 'PortfolioReportView',
  emits: ["back", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const periods = [
  { id: "day", label: "天", days: 1 },
  { id: "week", label: "周", days: 5 },
  { id: "month", label: "月", days: 22 },
  { id: "year", label: "年", days: 250 },
  { id: "history", label: "历史汇总", days: null },
];
const selected = ref("day");
const loading = ref(false);
const error = ref("");
const chartCache = reactive({});
const shareOpen = ref(false);
const previewUrl = ref("");
const canvasRef = ref(null);
let reportBlob = null;

const currentPeriod = computed(() => periods.find((item) => item.id === selected.value));

function closeForPeriod(code, item) {
  const points = chartCache[code];
  if (!points?.length) {
    return selected.value === "day" ? item.stock.prevClose : item.avgCost;
  }
  const offset = Math.min(currentPeriod.value.days + 1, points.length);
  return points[points.length - offset]?.close || points[0].close;
}

const rows = computed(() =>
  holdings.value.map((item) => {
    const startPrice =
      selected.value === "history" ? item.avgCost : closeForPeriod(item.code, item);
    const profit = (item.stock.price - startPrice) * item.shares;
    const profitPercent = startPrice ? (profit / (startPrice * item.shares)) * 100 : 0;
    return {
      ...item,
      startPrice,
      profit,
      profitPercent,
      estimated: selected.value !== "day" && selected.value !== "history" && !chartCache[item.code]?.length,
    };
  }),
);

const periodMilliseconds = computed(() => {
  if (selected.value === "day") return 86400000;
  if (selected.value === "week") return 7 * 86400000;
  if (selected.value === "month") return 31 * 86400000;
  if (selected.value === "year") return 366 * 86400000;
  return Number.POSITIVE_INFINITY;
});

const realizedTrades = computed(() =>
  portfolio.ledger.filter(
    (entry) =>
      entry.type === "sell" &&
      Number(entry.timestamp) &&
      Date.now() - Number(entry.timestamp) <= periodMilliseconds.value,
  ),
);

const realizedRows = computed(() => {
  const groups = {};
  realizedTrades.value.forEach((entry) => {
    const group = groups[entry.code] || {
      code: entry.code,
      name: entry.name,
      shares: 0,
      avgCost: 0,
      profit: 0,
      kind: "sold",
    };
    const shares = Number(entry.shares || 0);
    const priorValue = group.avgCost * group.shares;
    group.avgCost = (priorValue + Number(entry.avgCostAtSale || 0) * shares) / (group.shares + shares);
    group.shares += shares;
    group.profit += Number(entry.realizedProfit || 0);
    groups[entry.code] = group;
  });
  return Object.values(groups).map((item) => ({
    ...item,
    profitPercent: item.avgCost && item.shares ? (item.profit / (item.avgCost * item.shares)) * 100 : 0,
  }));
});

const realizedProfit = computed(() => realizedRows.value.reduce((sum, row) => sum + row.profit, 0));
const allReportRows = computed(() => [...rows.value.map((row) => ({ ...row, kind: "holding" })), ...realizedRows.value]);
const totalProfit = computed(() => rows.value.reduce((sum, row) => sum + row.profit, 0) + realizedProfit.value);
const periodLabel = computed(
  () =>
    ({
      day: "今日",
      week: "近 7 日",
      month: "近 30 日",
      year: "近 1 年",
      history: "历史累计",
    })[selected.value],
);

async function loadHistory() {
  if (selected.value === "day" || selected.value === "history") return;
  const missing = holdings.value.map((item) => item.stock).filter((stock) => !chartCache[stock.code]);
  if (!missing.length) return;
  loading.value = true;
  error.value = "";
  const results = await Promise.allSettled(
    missing.map(async (stock) => {
      const response = await fetch(`/api/chart?secid=${stock.secid}&mode=kline&limit=251`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.error || "历史行情不可用");
      return [stock.code, payload.points || []];
    }),
  );
  results.forEach((result) => {
    if (result.status === "fulfilled") chartCache[result.value[0]] = result.value[1];
  });
  if (results.every((result) => result.status === "rejected")) {
    error.value = "历史行情暂时不可用，已使用平均成本估算";
  }
  loading.value = false;
}

watch(selected, loadHistory);
onMounted(loadHistory);

async function createReportImage() {
  if (!canvasRef.value) return;
  await document.fonts?.ready;
  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");
  const rowHeight = 95;
  const height = Math.max(1080, 565 + allReportRows.value.length * rowHeight + 150);
  canvas.width = 1080;
  canvas.height = height;
  const width = canvas.width;
  drawPosterBackground(context, width, height, "#77d6ce");
  drawBrand(context);
  drawPill(context, `${periodLabel.value}财报`, 812, 68, POSTER_COLORS.gold);

  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 20px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`模拟投资总结 · ${new Date().toLocaleDateString("zh-CN")}`, 72, 190);
  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 58px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`¥${formatMoney(account.value.totalAssets)}`, 72, 266);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 19px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("模拟总资产", 74, 298);

  context.fillStyle = totalProfit.value >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
  context.font = '700 42px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`${totalProfit.value >= 0 ? "+" : ""}¥${formatMoney(totalProfit.value)}`, 716, 260);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 18px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`${periodLabel.value}盈亏`, 718, 291);

  const summaryCards = [
    ["持仓市值", `¥${formatMoney(account.value.marketValue, 0)}`, "按实时行情计算"],
    ["可用资金", `¥${formatMoney(portfolio.cash, 0)}`, "可用于模拟交易"],
    ["已实现盈亏", `${realizedProfit.value >= 0 ? "+" : ""}¥${formatMoney(realizedProfit.value, 0)}`, "来自已卖出持仓"],
  ];
  summaryCards.forEach(([label, value, note], index) => {
    drawMetricCard(context, {
      x: 72 + index * 321,
      y: 335,
      width: 294,
      height: 94,
      label,
      value,
      note,
      tone: index === 2 ? (realizedProfit.value >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall) : POSTER_COLORS.text,
    });
  });

  roundRect(context, 72, 458, 936, 58, 16);
  context.fillStyle = "rgba(23, 54, 68, .88)";
  context.fill();
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("股票 / 持仓", 98, 493);
  context.fillText("平均买入价", 508, 493);
  context.fillText("期初参考", 704, 493);
  context.fillText("盈亏金额", 846, 493);

  allReportRows.value.forEach((row, index) => {
    const y = 527 + index * rowHeight;
    context.fillStyle = index % 2 === 0 ? "rgba(20, 49, 63, .72)" : "rgba(16, 41, 55, .56)";
    roundRect(context, 72, y, 936, 84, 14);
    context.fill();
    context.fillStyle = POSTER_COLORS.text;
    context.font = '600 23px "Microsoft YaHei", "PingFang SC", sans-serif';
    context.fillText((row.name || row.stock?.name || "").slice(0, 8), 98, y + 36);
    context.fillStyle = POSTER_COLORS.faint;
    context.font = '500 15px "Avenir Next", sans-serif';
    context.fillText(`${row.code} · ${row.shares} 股${row.kind === "sold" ? " · 已卖出" : ""}`, 98, y + 62);
    context.fillStyle = "#dbe7ec";
    context.font = '600 21px "Avenir Next", sans-serif';
    context.fillText(`¥${formatPrice(row.avgCost)}`, 508, y + 50);
    context.fillText(`¥${formatPrice(row.startPrice || row.avgCost)}`, 704, y + 50);
    context.fillStyle = row.profit >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;
    context.font = '700 22px "Avenir Next", "Microsoft YaHei", sans-serif';
    context.fillText(`${row.profit >= 0 ? "+" : ""}¥${formatMoney(row.profit, 0)}`, 846, y + 36);
    context.font = '600 15px "Avenir Next", sans-serif';
    context.fillText(formatPct(row.profitPercent), 846, y + 61);
  });

  const footerY = 560 + allReportRows.value.length * rowHeight;
  drawPill(context, "模拟财报 · 非投资建议", 72, footerY, POSTER_COLORS.gold);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 16px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("天/周/月/年按对应期初收盘价估算，历史汇总按平均买入成本计算；不含真实资金。", 72, footerY + 68);
  context.fillStyle = POSTER_COLORS.cyan;
  context.font = '600 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮 · A股行情与模拟交易", 72, footerY + 102);

  previewUrl.value = canvas.toDataURL("image/png");
  canvas.toBlob((value) => {
    reportBlob = value;
  }, "image/png");
}

async function openShare() {
  shareOpen.value = true;
  await nextTick();
  await createReportImage();
}

function saveReport() {
  if (!previewUrl.value) return;
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = `观潮-个人财报-${selected.value}.png`;
  link.click();
}

async function shareReport() {
  if (!reportBlob) return;
  const file = new File([reportBlob], `观潮-个人财报-${selected.value}.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "观潮个人模拟财报", text: "我的 A 股模拟投资财报" });
      return;
    } catch {
      // Fall back to downloading when the system share sheet is unavailable.
    }
  }
  saveReport();
  emit("notify", "已生成财报图片并开始下载");
}

const __returned__ = { emit, periods, selected, loading, error, chartCache, shareOpen, previewUrl, canvasRef, get reportBlob() { return reportBlob }, set reportBlob(v) { reportBlob = v; }, currentPeriod, closeForPeriod, rows, periodMilliseconds, realizedTrades, realizedRows, realizedProfit, allReportRows, totalProfit, periodLabel, loadHistory, createReportImage, openShare, saveReport, shareReport, computed, nextTick, onMounted, reactive, ref, watch, Icon: __sfc__$n, get account() { return account }, get formatMoney() { return formatMoney }, get holdings() { return holdings }, get portfolio() { return portfolio }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass }, get POSTER_COLORS() { return POSTER_COLORS }, get drawBrand() { return drawBrand }, get drawMetricCard() { return drawMetricCard }, get drawPill() { return drawPill }, get drawPosterBackground() { return drawPosterBackground }, get roundRect() { return roundRect } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$7 = { class: "page report-view" };
const _hoisted_2$7 = { class: "detail-header report-header" };
const _hoisted_3$7 = { class: "report-hero" };
const _hoisted_4$7 = { class: "segmented report-periods" };
const _hoisted_5$7 = ["onClick"];
const _hoisted_6$7 = {
  key: 0,
  class: "report-loading"
};
const _hoisted_7$7 = {
  key: 1,
  class: "report-warning"
};
const _hoisted_8$6 = { class: "report-summary" };
const _hoisted_9$6 = { class: "report-holdings" };
const _hoisted_10$5 = { class: "section-heading compact" };
const _hoisted_11$5 = { class: "report-stock-name" };
const _hoisted_12$5 = { class: "stock-monogram" };
const _hoisted_13$5 = { key: 0 };
const _hoisted_14$5 = {
  key: 2,
  class: "report-holdings"
};
const _hoisted_15$5 = { class: "section-heading compact" };
const _hoisted_16$5 = { class: "report-stock-name" };
const _hoisted_17$5 = { class: "stock-monogram" };
const _hoisted_18$5 = {
  class: "share-sheet report-share-sheet",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_19$5 = { class: "share-sheet-header" };
const _hoisted_20$3 = { class: "share-preview" };
const _hoisted_21$3 = ["src"];
const _hoisted_22$2 = {
  ref: "canvasRef",
  class: "share-canvas"
};

function render$7(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$7, [
    createBaseVNode("header", _hoisted_2$7, [
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "返回",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('back')))
      }, [
        createVNode($setup["Icon"], {
          name: "arrowLeft",
          size: 21
        })
      ]),
      _cache[3] || (_cache[3] = createBaseVNode("div", { class: "detail-title" }, [
        createBaseVNode("strong", null, "个人财报"),
        createBaseVNode("span", null, "收益汇总与持仓明细")
      ], -1 /* CACHED */)),
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "分享财报",
        onClick: $setup.openShare
      }, [
        createVNode($setup["Icon"], {
          name: "share",
          size: 19
        })
      ])
    ]),
    createBaseVNode("main", null, [
      createBaseVNode("section", _hoisted_3$7, [
        _cache[4] || (_cache[4] = createBaseVNode("span", null, "模拟账户总资产", -1 /* CACHED */)),
        createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.account.totalAssets)), 1 /* TEXT */),
        createBaseVNode("div", null, [
          createBaseVNode("span", null, toDisplayString($setup.selected === "history" ? "累计盈亏" : "本期盈亏"), 1 /* TEXT */),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass($setup.totalProfit))
          }, toDisplayString($setup.totalProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.totalProfit)), 3 /* TEXT, CLASS */)
        ]),
        createBaseVNode("em", null, toDisplayString($setup.periodLabel), 1 /* TEXT */)
      ]),
      createBaseVNode("div", _hoisted_4$7, [
        (openBlock(), createElementBlock(Fragment, null, renderList($setup.periods, (item) => {
          return createBaseVNode("button", {
            key: item.id,
            type: "button",
            class: normalizeClass({ active: $setup.selected === item.id }),
            onClick: $event => ($setup.selected = item.id)
          }, toDisplayString(item.label), 11 /* TEXT, CLASS, PROPS */, _hoisted_5$7)
        }), 64 /* STABLE_FRAGMENT */))
      ]),
      ($setup.loading)
        ? (openBlock(), createElementBlock("div", _hoisted_6$7, [...(_cache[5] || (_cache[5] = [
            createBaseVNode("i", { class: "loading-ring" }, null, -1 /* CACHED */),
            createTextVNode("正在读取历史收盘价", -1 /* CACHED */)
          ]))]))
        : ($setup.error)
          ? (openBlock(), createElementBlock("p", _hoisted_7$7, [
              createVNode($setup["Icon"], {
                name: "info",
                size: 14
              }),
              createTextVNode(toDisplayString($setup.error), 1 /* TEXT */)
            ]))
          : createCommentVNode("v-if", true),
      createBaseVNode("section", _hoisted_8$6, [
        createBaseVNode("div", null, [
          _cache[6] || (_cache[6] = createBaseVNode("span", null, "持仓市值", -1 /* CACHED */)),
          createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.account.marketValue, 0)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[7] || (_cache[7] = createBaseVNode("span", null, "可用资金", -1 /* CACHED */)),
          createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatMoney($setup.portfolio.cash, 0)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[8] || (_cache[8] = createBaseVNode("span", null, "已实现盈亏", -1 /* CACHED */)),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass($setup.realizedProfit))
          }, toDisplayString($setup.realizedProfit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney($setup.realizedProfit, 0)), 3 /* TEXT, CLASS */)
        ])
      ]),
      createBaseVNode("section", _hoisted_9$6, [
        createBaseVNode("div", _hoisted_10$5, [
          _cache[9] || (_cache[9] = createBaseVNode("div", null, [
            createBaseVNode("span", null, "POSITION DETAIL"),
            createBaseVNode("h2", null, "每只股票盈亏")
          ], -1 /* CACHED */)),
          createBaseVNode("em", null, toDisplayString($setup.rows.length) + " 个持仓", 1 /* TEXT */)
        ]),
        (openBlock(true), createElementBlock(Fragment, null, renderList($setup.rows, (row) => {
          return (openBlock(), createElementBlock("article", {
            key: row.code
          }, [
            createBaseVNode("div", _hoisted_11$5, [
              createBaseVNode("span", _hoisted_12$5, toDisplayString(row.stock.name.slice(0, 1)), 1 /* TEXT */),
              createBaseVNode("div", null, [
                createBaseVNode("strong", null, toDisplayString(row.stock.name), 1 /* TEXT */),
                createBaseVNode("small", null, toDisplayString(row.code) + " · " + toDisplayString(row.shares) + " 股", 1 /* TEXT */)
              ])
            ]),
            createBaseVNode("div", null, [
              _cache[10] || (_cache[10] = createBaseVNode("span", null, "平均买入价", -1 /* CACHED */)),
              createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatPrice(row.avgCost)), 1 /* TEXT */)
            ]),
            createBaseVNode("div", null, [
              _cache[11] || (_cache[11] = createBaseVNode("span", null, "期初参考", -1 /* CACHED */)),
              createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatPrice(row.startPrice)), 1 /* TEXT */)
            ]),
            createBaseVNode("div", null, [
              _cache[12] || (_cache[12] = createBaseVNode("span", null, "盈亏金额", -1 /* CACHED */)),
              createBaseVNode("strong", {
                class: normalizeClass($setup.trendClass(row.profit))
              }, toDisplayString(row.profit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney(row.profit, 0)), 3 /* TEXT, CLASS */)
            ]),
            createBaseVNode("div", null, [
              _cache[13] || (_cache[13] = createBaseVNode("span", null, "收益率", -1 /* CACHED */)),
              createBaseVNode("strong", {
                class: normalizeClass($setup.trendClass(row.profitPercent))
              }, toDisplayString($setup.formatPct(row.profitPercent)), 3 /* TEXT, CLASS */)
            ]),
            (row.estimated)
              ? (openBlock(), createElementBlock("em", _hoisted_13$5, "成本估算"))
              : createCommentVNode("v-if", true)
          ]))
        }), 128 /* KEYED_FRAGMENT */))
      ]),
      ($setup.realizedRows.length)
        ? (openBlock(), createElementBlock("section", _hoisted_14$5, [
            createBaseVNode("div", _hoisted_15$5, [
              _cache[14] || (_cache[14] = createBaseVNode("div", null, [
                createBaseVNode("span", null, "REALIZED DETAIL"),
                createBaseVNode("h2", null, "已卖出股票")
              ], -1 /* CACHED */)),
              createBaseVNode("em", null, toDisplayString($setup.realizedRows.length) + " 个标的", 1 /* TEXT */)
            ]),
            (openBlock(true), createElementBlock(Fragment, null, renderList($setup.realizedRows, (row) => {
              return (openBlock(), createElementBlock("article", {
                key: row.code
              }, [
                createBaseVNode("div", _hoisted_16$5, [
                  createBaseVNode("span", _hoisted_17$5, toDisplayString(row.name.slice(0, 1)), 1 /* TEXT */),
                  createBaseVNode("div", null, [
                    createBaseVNode("strong", null, toDisplayString(row.name), 1 /* TEXT */),
                    createBaseVNode("small", null, toDisplayString(row.code) + " · " + toDisplayString(row.shares) + " 股 · 已卖出", 1 /* TEXT */)
                  ])
                ]),
                createBaseVNode("div", null, [
                  _cache[15] || (_cache[15] = createBaseVNode("span", null, "平均买入价", -1 /* CACHED */)),
                  createBaseVNode("strong", null, "¥" + toDisplayString($setup.formatPrice(row.avgCost)), 1 /* TEXT */)
                ]),
                createBaseVNode("div", null, [
                  _cache[16] || (_cache[16] = createBaseVNode("span", null, "实现盈亏", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass(row.profit))
                  }, toDisplayString(row.profit >= 0 ? "+" : "") + "¥" + toDisplayString($setup.formatMoney(row.profit, 0)), 3 /* TEXT, CLASS */)
                ]),
                createBaseVNode("div", null, [
                  _cache[17] || (_cache[17] = createBaseVNode("span", null, "已实现收益率", -1 /* CACHED */)),
                  createBaseVNode("strong", {
                    class: normalizeClass($setup.trendClass(row.profitPercent))
                  }, toDisplayString($setup.formatPct(row.profitPercent)), 3 /* TEXT, CLASS */)
                ])
              ]))
            }), 128 /* KEYED_FRAGMENT */))
          ]))
        : createCommentVNode("v-if", true),
      createBaseVNode("button", {
        type: "button",
        class: "report-share-button",
        onClick: $setup.openShare
      }, [
        createVNode($setup["Icon"], {
          name: "share",
          size: 18
        }),
        _cache[18] || (_cache[18] = createTextVNode(" 生成并分享个人财报 ", -1 /* CACHED */))
      ]),
      _cache[19] || (_cache[19] = createBaseVNode("p", { class: "research-disclaimer" }, "日、周、月、年盈亏按对应期初收盘价至当前价估算；历史汇总按模拟持仓的平均买入成本计算。统计不含真实证券资金。", -1 /* CACHED */))
    ]),
    createVNode(Transition, { name: "sheet" }, {
      default: withCtx(() => [
        ($setup.shareOpen)
          ? (openBlock(), createElementBlock("div", {
              key: 0,
              class: "share-backdrop",
              onClick: _cache[2] || (_cache[2] = withModifiers($event => ($setup.shareOpen = false), ["self"]))
            }, [
              createBaseVNode("section", _hoisted_18$5, [
                createBaseVNode("header", _hoisted_19$5, [
                  createBaseVNode("div", null, [
                    _cache[20] || (_cache[20] = createBaseVNode("span", null, "REPORT CARD", -1 /* CACHED */)),
                    createBaseVNode("h2", null, toDisplayString($setup.periodLabel) + "财报图片", 1 /* TEXT */)
                  ]),
                  createBaseVNode("button", {
                    type: "button",
                    class: "icon-button",
                    "aria-label": "关闭",
                    onClick: _cache[1] || (_cache[1] = $event => ($setup.shareOpen = false))
                  }, [
                    createVNode($setup["Icon"], {
                      name: "close",
                      size: 20
                    })
                  ])
                ]),
                createBaseVNode("div", _hoisted_20$3, [
                  ($setup.previewUrl)
                    ? (openBlock(), createElementBlock("img", {
                        key: 0,
                        src: $setup.previewUrl,
                        alt: "个人模拟财报图片"
                      }, null, 8 /* PROPS */, _hoisted_21$3))
                    : createCommentVNode("v-if", true)
                ]),
                createBaseVNode("div", { class: "share-actions" }, [
                  createBaseVNode("button", {
                    type: "button",
                    class: "secondary-button",
                    onClick: $setup.saveReport
                  }, "保存图片"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "primary-button",
                    onClick: $setup.shareReport
                  }, "分享财报")
                ]),
                createBaseVNode("canvas", _hoisted_22$2, null, 512 /* NEED_PATCH */)
              ])
            ]))
          : createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    })
  ]))
}
__sfc__$7.render = render$7;
__sfc__$7.__file = "src/views/PortfolioReportView.vue";

const __sfc__$6 = {
  __name: 'ProfileView',
  props: {
  themeMode: { type: String, default: "auto" },
  resolvedTheme: { type: String, default: "dark" },
  authUser: { type: Object, default: null },
  authOnline: { type: Boolean, default: false },
},
  emits: ["notify", "reset", "navigate", "set-theme", "toggle-theme", "open-auth", "logout"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;

const menuGroups = computed(() => [
  {
    title: "我的工具",
    items: [
      { icon: "portfolio", label: "模拟账户", detail: "资金与持仓", action: "portfolio" },
      { icon: "edit", label: "资金记账", detail: `${portfolio.ledger.length} 笔记录`, action: "portfolio" },
      { icon: "bell", label: "价格提醒", detail: `${activeAlertCount.value} 条正在监控`, action: "alerts" },
      { icon: "sliders", label: "持仓压力测试", detail: "在分析页调整假设跌幅", action: "insights" },
      { icon: "trend", label: "好友竞技", detail: "分享口令并同步收益率排名", action: "competition" },
    ],
  },
  {
    title: "设置与说明",
    items: [
      {
        icon: "shield",
        label: "数据与隐私",
        detail: props.authUser ? "账号数据保存在本地服务" : "游客数据只保存在当前浏览器",
        action: props.authUser
          ? `账号 ${props.authUser.username} 的模拟数据保存在运行服务的电脑中`
          : "游客账户、持仓、交易笔记与价格提醒均保存在当前浏览器",
      },
      { icon: "info", label: "行情说明", detail: "公开接口与延迟", action: "行情来自公开市场接口，短时延迟可能影响价格提醒" },
    ],
  },
]);

function handleItem(item) {
  if (["portfolio", "alerts", "insights", "competition"].includes(item.action)) emit("navigate", item.action);
  else emit("notify", item.action);
}

function toggleAutoRefresh() {
  updateMarketSettings({ autoRefresh: !portfolio.settings.autoRefresh });
  emit("notify", portfolio.settings.autoRefresh ? "自动刷新已开启" : "已切换为手动刷新");
}

function setRefreshSeconds(seconds) {
  updateMarketSettings({ refreshSeconds: seconds });
}

const __returned__ = { props, emit, menuGroups, handleItem, toggleAutoRefresh, setRefreshSeconds, computed, Icon: __sfc__$n, get account() { return account }, get activeAlertCount() { return activeAlertCount }, get formatMoney() { return formatMoney }, get holdings() { return holdings }, get portfolio() { return portfolio }, get updateMarketSettings() { return updateMarketSettings } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$6 = { class: "page profile-view" };
const _hoisted_2$6 = { class: "profile-hero" };
const _hoisted_3$6 = { class: "profile-top" };
const _hoisted_4$6 = { class: "profile-user" };
const _hoisted_5$6 = { class: "profile-stats" };
const _hoisted_6$6 = { class: "appearance-card" };
const _hoisted_7$6 = { class: "appearance-head" };
const _hoisted_8$5 = { class: "appearance-icon" };
const _hoisted_9$5 = { class: "appearance-options" };
const _hoisted_10$4 = { class: "refresh-settings-card" };
const _hoisted_11$4 = { class: "refresh-settings-copy" };
const _hoisted_12$4 = ["aria-checked"];
const _hoisted_13$4 = {
  key: 0,
  class: "refresh-interval"
};
const _hoisted_14$4 = ["onClick"];
const _hoisted_15$4 = { class: "learning-card" };
const _hoisted_16$4 = { class: "profile-menu" };
const _hoisted_17$4 = ["onClick"];
const _hoisted_18$4 = { class: "menu-icon" };
const _hoisted_19$4 = { class: "menu-copy" };

function render$6(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$6, [
    createBaseVNode("header", _hoisted_2$6, [
      createBaseVNode("div", _hoisted_3$6, [
        _cache[9] || (_cache[9] = createBaseVNode("div", { class: "brand-lockup small" }, [
          createBaseVNode("span", { class: "brand-mark" }, [
            createBaseVNode("i"),
            createBaseVNode("i"),
            createBaseVNode("i")
          ]),
          createBaseVNode("strong", null, "观潮")
        ], -1 /* CACHED */)),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button",
          "aria-label": "切换昼夜模式",
          onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('toggle-theme')))
        }, [
          createVNode($setup["Icon"], {
            name: $props.resolvedTheme === 'light' ? 'moon' : 'sun',
            size: 20
          }, null, 8 /* PROPS */, ["name"])
        ])
      ]),
      createBaseVNode("div", _hoisted_4$6, [
        _cache[10] || (_cache[10] = createBaseVNode("span", { class: "avatar" }, [
          createTextVNode("澜"),
          createBaseVNode("small", null, "Lv.3")
        ], -1 /* CACHED */)),
        createBaseVNode("div", null, [
          createBaseVNode("h1", null, toDisplayString($props.authUser?.displayName || "访客体验官"), 1 /* TEXT */),
          createBaseVNode("p", null, toDisplayString($props.authUser ? `@${$props.authUser.username} · 数据已绑定账号` : "本地访客 · 登录后可跨设备同步"), 1 /* TEXT */)
        ])
      ]),
      createBaseVNode("div", _hoisted_5$6, [
        createBaseVNode("div", null, [
          createBaseVNode("strong", null, toDisplayString($setup.portfolio.ledger.length), 1 /* TEXT */),
          _cache[11] || (_cache[11] = createBaseVNode("span", null, "累计交易", -1 /* CACHED */))
        ]),
        createBaseVNode("div", null, [
          createBaseVNode("strong", null, toDisplayString($setup.holdings.length), 1 /* TEXT */),
          _cache[12] || (_cache[12] = createBaseVNode("span", null, "当前持仓", -1 /* CACHED */))
        ]),
        createBaseVNode("div", null, [
          createBaseVNode("strong", null, toDisplayString($setup.portfolio.watchlist.length), 1 /* TEXT */),
          _cache[13] || (_cache[13] = createBaseVNode("span", null, "自选标的", -1 /* CACHED */))
        ])
      ])
    ]),
    createBaseVNode("main", null, [
      createBaseVNode("button", {
        type: "button",
        class: "profile-asset-link",
        onClick: _cache[1] || (_cache[1] = $event => ($setup.emit('navigate', 'portfolio')))
      }, [
        createBaseVNode("div", null, [
          _cache[14] || (_cache[14] = createBaseVNode("span", null, "模拟账户总资产", -1 /* CACHED */)),
          createBaseVNode("strong", null, "¥ " + toDisplayString($setup.formatMoney($setup.account.totalAssets)), 1 /* TEXT */)
        ]),
        createBaseVNode("span", null, [
          _cache[15] || (_cache[15] = createTextVNode("查看详情 ", -1 /* CACHED */)),
          createVNode($setup["Icon"], {
            name: "chevronRight",
            size: 15
          })
        ])
      ]),
      createBaseVNode("section", {
        class: normalizeClass(["account-status-card", { online: $props.authUser }])
      }, [
        createBaseVNode("span", null, [
          createVNode($setup["Icon"], {
            name: $props.authUser ? 'shield' : 'user',
            size: 19
          }, null, 8 /* PROPS */, ["name"])
        ]),
        createBaseVNode("div", null, [
          createBaseVNode("strong", null, toDisplayString($props.authUser ? "观潮账号已登录" : "登录或创建账号"), 1 /* TEXT */),
          createBaseVNode("small", null, toDisplayString($props.authUser ? `${$props.authUser.displayName || $props.authUser.username} · 模拟持仓跨设备同步` : "让不同手机看到同一套模拟资产与竞技身份"), 1 /* TEXT */)
        ]),
        ($props.authUser)
          ? (openBlock(), createElementBlock("button", {
              key: 0,
              type: "button",
              onClick: _cache[2] || (_cache[2] = $event => ($setup.emit('logout')))
            }, "退出"))
          : (openBlock(), createElementBlock("button", {
              key: 1,
              type: "button",
              onClick: _cache[3] || (_cache[3] = $event => ($setup.emit('open-auth')))
            }, "登录"))
      ], 2 /* CLASS */),
      createBaseVNode("section", _hoisted_6$6, [
        createBaseVNode("div", _hoisted_7$6, [
          createBaseVNode("span", _hoisted_8$5, [
            createVNode($setup["Icon"], {
              name: $props.resolvedTheme === 'light' ? 'sun' : 'moon',
              size: 18
            }, null, 8 /* PROPS */, ["name"])
          ]),
          _cache[16] || (_cache[16] = createBaseVNode("div", null, [
            createBaseVNode("strong", null, "外观模式"),
            createBaseVNode("small", null, "自动模式在每天 07:00 至 19:00 使用日间主题")
          ], -1 /* CACHED */)),
          createBaseVNode("em", null, toDisplayString($props.resolvedTheme === "light" ? "日间" : "夜间"), 1 /* TEXT */)
        ]),
        createBaseVNode("div", _hoisted_9$5, [
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass({ active: $props.themeMode === 'auto' }),
            onClick: _cache[4] || (_cache[4] = $event => ($setup.emit('set-theme', 'auto')))
          }, [
            createVNode($setup["Icon"], {
              name: "clock",
              size: 15
            }),
            _cache[17] || (_cache[17] = createTextVNode(" 自动 ", -1 /* CACHED */))
          ], 2 /* CLASS */),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass({ active: $props.themeMode === 'day' }),
            onClick: _cache[5] || (_cache[5] = $event => ($setup.emit('set-theme', 'day')))
          }, [
            createVNode($setup["Icon"], {
              name: "sun",
              size: 15
            }),
            _cache[18] || (_cache[18] = createTextVNode(" 日间 ", -1 /* CACHED */))
          ], 2 /* CLASS */),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass({ active: $props.themeMode === 'night' }),
            onClick: _cache[6] || (_cache[6] = $event => ($setup.emit('set-theme', 'night')))
          }, [
            createVNode($setup["Icon"], {
              name: "moon",
              size: 15
            }),
            _cache[19] || (_cache[19] = createTextVNode(" 夜间 ", -1 /* CACHED */))
          ], 2 /* CLASS */)
        ])
      ]),
      createBaseVNode("section", _hoisted_10$4, [
        createBaseVNode("div", _hoisted_11$4, [
          createBaseVNode("span", null, [
            createVNode($setup["Icon"], {
              name: "refresh",
              size: 18
            })
          ]),
          _cache[21] || (_cache[21] = createBaseVNode("div", null, [
            createBaseVNode("strong", null, "真实行情自动刷新"),
            createBaseVNode("small", null, "页面保持打开时读取公开行情")
          ], -1 /* CACHED */)),
          createBaseVNode("button", {
            type: "button",
            class: normalizeClass(["switch-button", { active: $setup.portfolio.settings.autoRefresh }]),
            role: "switch",
            "aria-checked": $setup.portfolio.settings.autoRefresh,
            onClick: $setup.toggleAutoRefresh
          }, [...(_cache[20] || (_cache[20] = [
            createBaseVNode("i", null, null, -1 /* CACHED */)
          ]))], 10 /* CLASS, PROPS */, _hoisted_12$4)
        ]),
        ($setup.portfolio.settings.autoRefresh)
          ? (openBlock(), createElementBlock("div", _hoisted_13$4, [
              _cache[22] || (_cache[22] = createBaseVNode("span", null, "刷新间隔", -1 /* CACHED */)),
              (openBlock(), createElementBlock(Fragment, null, renderList([10, 15, 30], (seconds) => {
                return createBaseVNode("button", {
                  key: seconds,
                  type: "button",
                  class: normalizeClass({ active: $setup.portfolio.settings.refreshSeconds === seconds }),
                  onClick: $event => ($setup.setRefreshSeconds(seconds))
                }, toDisplayString(seconds) + " 秒 ", 11 /* TEXT, CLASS, PROPS */, _hoisted_14$4)
              }), 64 /* STABLE_FRAGMENT */))
            ]))
          : createCommentVNode("v-if", true)
      ]),
      createBaseVNode("section", _hoisted_15$4, [
        _cache[27] || (_cache[27] = createBaseVNode("div", { class: "learning-visual" }, [
          createBaseVNode("span", null, "05"),
          createBaseVNode("i")
        ], -1 /* CACHED */)),
        createBaseVNode("div", null, [
          _cache[24] || (_cache[24] = createBaseVNode("span", null, "今日投资小课", -1 /* CACHED */)),
          _cache[25] || (_cache[25] = createBaseVNode("h2", null, [
            createTextVNode("K 线不是预言，"),
            createBaseVNode("br"),
            createTextVNode("而是共识的脚印。")
          ], -1 /* CACHED */)),
          _cache[26] || (_cache[26] = createBaseVNode("p", null, "用 3 分钟认识影线、实体与成交量。", -1 /* CACHED */)),
          createBaseVNode("button", {
            type: "button",
            onClick: _cache[7] || (_cache[7] = $event => ($setup.emit('notify', '课程内容为演示占位')))
          }, [
            _cache[23] || (_cache[23] = createTextVNode("开始学习 ", -1 /* CACHED */)),
            createVNode($setup["Icon"], {
              name: "arrowRight",
              size: 14
            })
          ])
        ])
      ]),
      (openBlock(true), createElementBlock(Fragment, null, renderList($setup.menuGroups, (group) => {
        return (openBlock(), createElementBlock("section", {
          key: group.title,
          class: "profile-menu-group"
        }, [
          createBaseVNode("h2", null, toDisplayString(group.title), 1 /* TEXT */),
          createBaseVNode("div", _hoisted_16$4, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (item) => {
              return (openBlock(), createElementBlock("button", {
                key: item.label,
                type: "button",
                onClick: $event => ($setup.handleItem(item))
              }, [
                createBaseVNode("span", _hoisted_18$4, [
                  createVNode($setup["Icon"], {
                    name: item.icon,
                    size: 18
                  }, null, 8 /* PROPS */, ["name"])
                ]),
                createBaseVNode("span", _hoisted_19$4, [
                  createBaseVNode("strong", null, toDisplayString(item.label), 1 /* TEXT */),
                  createBaseVNode("small", null, toDisplayString(item.detail), 1 /* TEXT */)
                ]),
                createVNode($setup["Icon"], {
                  name: "chevronRight",
                  size: 17
                })
              ], 8 /* PROPS */, _hoisted_17$4))
            }), 128 /* KEYED_FRAGMENT */))
          ])
        ]))
      }), 128 /* KEYED_FRAGMENT */)),
      createBaseVNode("button", {
        type: "button",
        class: "reset-demo",
        onClick: _cache[8] || (_cache[8] = $event => ($setup.emit('reset')))
      }, [
        createVNode($setup["Icon"], {
          name: "refresh",
          size: 17
        }),
        _cache[28] || (_cache[28] = createTextVNode(" 重置模拟账户与行情缓存 ", -1 /* CACHED */))
      ]),
      _cache[29] || (_cache[29] = createBaseVNode("footer", { class: "profile-footer" }, [
        createBaseVNode("span", { class: "brand-mark small" }, [
          createBaseVNode("i"),
          createBaseVNode("i"),
          createBaseVNode("i")
        ]),
        createBaseVNode("strong", null, "观潮 · A 股行情与模拟交易"),
        createBaseVNode("p", null, "课程设计 · Version 4.1.0"),
        createBaseVNode("small", null, "行情来自公开市场接口，可能存在延时。模拟账户、交易笔记与价格提醒仅保存在本机，不构成投资建议。")
      ], -1 /* CACHED */))
    ])
  ]))
}
__sfc__$6.render = render$6;
__sfc__$6.__file = "src/views/ProfileView.vue";

const __sfc__$5 = {
  __name: 'SearchView',
  emits: ["back", "select-stock"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const emit = __emit;
const query = ref("");
const inputRef = ref(null);
const remoteResults = ref([]);
const loading = ref(false);
const error = ref("");
let debounceTimer;
let requestId = 0;

const localResults = computed(() => {
  const keyword = query.value.trim().toLowerCase();
  if (!keyword) return [];
  return stocks.filter((stock) =>
    `${stock.name} ${stock.code} ${stock.sector} ${stock.tags.join(" ")}`.toLowerCase().includes(keyword),
  );
});

const results = computed(() => {
  const localCodes = new Set(localResults.value.map((stock) => stock.code));
  return [
    ...localResults.value,
    ...remoteResults.value.filter((stock) => !localCodes.has(stock.code)),
  ];
});

const hotSearches = ["贵州茅台", "宁德时代", "600519", "中芯国际", "招商银行", "GZMT"];

watch(query, (value) => {
  window.clearTimeout(debounceTimer);
  error.value = "";
  if (!value.trim()) {
    remoteResults.value = [];
    loading.value = false;
    return;
  }
  debounceTimer = window.setTimeout(async () => {
    const currentRequest = ++requestId;
    loading.value = true;
    try {
      const items = await searchStocks(value);
      if (currentRequest === requestId) remoteResults.value = items;
    } catch (requestError) {
      if (currentRequest === requestId) {
        remoteResults.value = [];
        error.value = requestError instanceof Error ? requestError.message : "搜索服务暂时不可用";
      }
    } finally {
      if (currentRequest === requestId) loading.value = false;
    }
  }, 280);
});

onMounted(async () => {
  await nextTick();
  inputRef.value?.focus();
});
onBeforeUnmount(() => window.clearTimeout(debounceTimer));

function useKeyword(keyword) {
  query.value = keyword;
}

function select(stock) {
  emit("select-stock", stock);
}

const __returned__ = { emit, query, inputRef, remoteResults, loading, error, get debounceTimer() { return debounceTimer }, set debounceTimer(v) { debounceTimer = v; }, get requestId() { return requestId }, set requestId(v) { requestId = v; }, localResults, results, hotSearches, useKeyword, select, computed, nextTick, onBeforeUnmount, onMounted, ref, watch, Icon: __sfc__$n, StockRow: __sfc__$c, get searchStocks() { return searchStocks }, get stocks() { return stocks }, get suggestedStocks() { return suggestedStocks } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$5 = { class: "page search-view" };
const _hoisted_2$5 = { class: "search-header" };
const _hoisted_3$5 = { class: "search-field" };
const _hoisted_4$5 = {
  key: 0,
  class: "search-discovery"
};
const _hoisted_5$5 = { class: "keyword-cloud" };
const _hoisted_6$5 = ["onClick"];
const _hoisted_7$5 = { key: 0 };
const _hoisted_8$4 = { class: "stock-list" };
const _hoisted_9$4 = {
  key: 1,
  class: "search-results"
};
const _hoisted_10$3 = { class: "result-summary" };
const _hoisted_11$3 = { key: 0 };
const _hoisted_12$3 = { key: 1 };
const _hoisted_13$3 = { key: 2 };
const _hoisted_14$3 = {
  key: 0,
  class: "stock-list remote-results"
};
const _hoisted_15$3 = ["onClick"];
const _hoisted_16$3 = { class: "stock-monogram" };
const _hoisted_17$3 = { class: "stock-copy" };
const _hoisted_18$3 = { class: "result-market" };
const _hoisted_19$3 = {
  key: 1,
  class: "empty-state"
};

function render$5(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$5, [
    createBaseVNode("header", _hoisted_2$5, [
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "返回",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('back')))
      }, [
        createVNode($setup["Icon"], {
          name: "arrowLeft",
          size: 21
        })
      ]),
      createBaseVNode("label", _hoisted_3$5, [
        createVNode($setup["Icon"], {
          name: "search",
          size: 18
        }),
        withDirectives(createBaseVNode("input", {
          ref: "inputRef",
          "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => (($setup.query) = $event)),
          type: "search",
          placeholder: "A 股名称、代码或拼音",
          enterkeyhint: "search"
        }, null, 512 /* NEED_PATCH */), [
          [vModelText, $setup.query]
        ]),
        ($setup.query)
          ? (openBlock(), createElementBlock("button", {
              key: 0,
              type: "button",
              "aria-label": "清空",
              onClick: _cache[2] || (_cache[2] = $event => ($setup.query = ''))
            }, [
              createVNode($setup["Icon"], {
                name: "close",
                size: 16
              })
            ]))
          : createCommentVNode("v-if", true)
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "text-button",
        onClick: _cache[3] || (_cache[3] = $event => ($setup.emit('back')))
      }, "取消")
    ]),
    createBaseVNode("main", null, [
      (!$setup.query)
        ? (openBlock(), createElementBlock("section", _hoisted_4$5, [
            _cache[4] || (_cache[4] = createBaseVNode("div", { class: "section-heading compact" }, [
              createBaseVNode("div", null, [
                createBaseVNode("span", null, "TRENDING"),
                createBaseVNode("h2", null, "热门 A 股")
              ])
            ], -1 /* CACHED */)),
            createBaseVNode("div", _hoisted_5$5, [
              (openBlock(), createElementBlock(Fragment, null, renderList($setup.hotSearches, (keyword, index) => {
                return createBaseVNode("button", {
                  key: keyword,
                  type: "button",
                  onClick: $event => ($setup.useKeyword(keyword))
                }, [
                  (index < 3)
                    ? (openBlock(), createElementBlock("i", _hoisted_7$5, toDisplayString(index + 1), 1 /* TEXT */))
                    : createCommentVNode("v-if", true),
                  createTextVNode(" " + toDisplayString(keyword), 1 /* TEXT */)
                ], 8 /* PROPS */, _hoisted_6$5)
              }), 64 /* STABLE_FRAGMENT */))
            ]),
            _cache[5] || (_cache[5] = createBaseVNode("div", { class: "section-heading compact discover-heading" }, [
              createBaseVNode("div", null, [
                createBaseVNode("span", null, "FOR YOU"),
                createBaseVNode("h2", null, "为你发现")
              ]),
              createBaseVNode("em", null, "真实行情")
            ], -1 /* CACHED */)),
            createBaseVNode("div", _hoisted_8$4, [
              (openBlock(true), createElementBlock(Fragment, null, renderList($setup.suggestedStocks, (stock) => {
                return (openBlock(), createBlock($setup["StockRow"], {
                  key: stock.secid,
                  stock: stock,
                  onSelect: $setup.select
                }, null, 8 /* PROPS */, ["stock"]))
              }), 128 /* KEYED_FRAGMENT */))
            ])
          ]))
        : (openBlock(), createElementBlock("section", _hoisted_9$4, [
            createBaseVNode("div", _hoisted_10$3, [
              ($setup.loading)
                ? (openBlock(), createElementBlock("span", _hoisted_11$3, "正在搜索全部 A 股…"))
                : ($setup.error)
                  ? (openBlock(), createElementBlock("span", _hoisted_12$3, toDisplayString($setup.error), 1 /* TEXT */))
                  : (openBlock(), createElementBlock("span", _hoisted_13$3, [
                      _cache[6] || (_cache[6] = createTextVNode("找到 ", -1 /* CACHED */)),
                      createBaseVNode("strong", null, toDisplayString($setup.results.length), 1 /* TEXT */),
                      _cache[7] || (_cache[7] = createTextVNode(" 个结果", -1 /* CACHED */))
                    ]))
            ]),
            ($setup.results.length)
              ? (openBlock(), createElementBlock("div", _hoisted_14$3, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList($setup.results, (stock) => {
                    return (openBlock(), createElementBlock(Fragment, {
                      key: stock.secid || stock.code
                    }, [
                      (stock.price)
                        ? (openBlock(), createBlock($setup["StockRow"], {
                            key: 0,
                            stock: stock,
                            onSelect: $setup.select
                          }, null, 8 /* PROPS */, ["stock"]))
                        : (openBlock(), createElementBlock("button", {
                            key: 1,
                            type: "button",
                            class: "remote-stock-row",
                            onClick: $event => ($setup.select(stock))
                          }, [
                            createBaseVNode("span", _hoisted_16$3, toDisplayString(stock.name?.slice(0, 1)), 1 /* TEXT */),
                            createBaseVNode("span", _hoisted_17$3, [
                              createBaseVNode("strong", null, toDisplayString(stock.name), 1 /* TEXT */),
                              createBaseVNode("small", null, toDisplayString(stock.code) + " · " + toDisplayString(stock.type || stock.sector), 1 /* TEXT */)
                            ]),
                            createBaseVNode("span", _hoisted_18$3, toDisplayString(stock.market), 1 /* TEXT */),
                            createVNode($setup["Icon"], {
                              name: "chevronRight",
                              size: 16
                            })
                          ], 8 /* PROPS */, _hoisted_15$3))
                    ], 64 /* STABLE_FRAGMENT */))
                  }), 128 /* KEYED_FRAGMENT */))
                ]))
              : (!$setup.loading && !$setup.error)
                ? (openBlock(), createElementBlock("div", _hoisted_19$3, [
                    createBaseVNode("span", null, [
                      createVNode($setup["Icon"], {
                        name: "search",
                        size: 29
                      })
                    ]),
                    _cache[8] || (_cache[8] = createBaseVNode("strong", null, "没有找到相关 A 股", -1 /* CACHED */)),
                    _cache[9] || (_cache[9] = createBaseVNode("p", null, "试试完整股票名称、6 位代码或名称拼音。", -1 /* CACHED */))
                  ]))
                : createCommentVNode("v-if", true)
          ]))
    ])
  ]))
}
__sfc__$5.render = render$5;
__sfc__$5.__file = "src/views/SearchView.vue";

const __sfc__$4 = {
  __name: 'SharePoster',
  props: {
  open: { type: Boolean, default: false },
  stock: { type: Object, default: null },
},
  emits: ["close", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;
const canvasRef = ref(null);
const previewUrl = ref("");
const generating = ref(false);
let blob = null;

function stockPercent() {
  if (!props.stock?.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
}

function drawPoster() {
  if (!props.stock || !canvasRef.value) return;
  generating.value = true;
  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const stock = props.stock;
  const change = stockPercent();
  const accent = change >= 0 ? POSTER_COLORS.rise : POSTER_COLORS.fall;

  drawPosterBackground(context, width, height, "#6ed8d6");
  drawBrand(context);
  drawPill(context, stock.live ? "公开实时行情" : "最近行情", 836, 68, accent);

  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 21px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(`${stock.market || "A股"} · ${stock.sector || "上市公司"} · ${new Date().toLocaleDateString("zh-CN")}`, 72, 196);

  context.fillStyle = POSTER_COLORS.text;
  context.font = '700 67px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText(stock.name, 72, 279);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 24px "Avenir Next", sans-serif';
  context.fillText(`${stock.code} · 模拟行情分享`, 74, 318);

  context.fillStyle = accent;
  context.font = '700 88px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`¥${formatPrice(stock.price)}`, 72, 430);
  context.font = '600 27px "Avenir Next", "Microsoft YaHei", sans-serif';
  context.fillText(`${change >= 0 ? "+" : ""}${formatPrice(stock.price - stock.prevClose)}   ${formatPct(change)}`, 75, 473);

  roundRect(context, 72, 525, 936, 328, 30);
  context.fillStyle = POSTER_COLORS.panel;
  context.fill();
  context.strokeStyle = POSTER_COLORS.line;
  context.lineWidth = 1.5;
  context.stroke();

  context.fillStyle = POSTER_COLORS.text;
  context.font = '600 21px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("行情轨迹", 103, 568);
  context.fillStyle = POSTER_COLORS.faint;
  context.font = '500 15px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("盘中/最近价格变化", 103, 593);
  const values =
    stock.history?.length > 2
      ? stock.history.slice(-24)
      : [stock.prevClose || stock.price, (stock.prevClose + stock.price) / 2, stock.price];
  drawLineChart(context, values, { x: 104, y: 607, width: 862, height: 210 }, accent);

  const metricWidth = 294;
  const metrics = [
    { label: "今开", value: formatPrice(stock.open), note: "当日开盘" },
    { label: "最高", value: formatPrice(stock.high), note: "日内高点", tone: POSTER_COLORS.rise },
    { label: "最低", value: formatPrice(stock.low), note: "日内低点", tone: POSTER_COLORS.fall },
    { label: "成交量", value: formatVolume(stock.volume), note: "公开行情" },
    { label: "成交额", value: formatCompactMoney(stock.amount), note: "公开行情" },
    {
      label: "换手率",
      value: stock.turnover ? `${Number(stock.turnover).toFixed(2)}%` : "—",
      note: "流通活跃度",
    },
  ];
  metrics.forEach((metric, index) => {
    drawMetricCard(context, {
      x: 72 + (index % 3) * 321,
      y: 890 + Math.floor(index / 3) * 118,
      width: metricWidth,
      height: 102,
      ...metric,
    });
  });

  context.strokeStyle = "rgba(147, 194, 204, 0.13)";
  context.beginPath();
  context.moveTo(72, 1181);
  context.lineTo(1008, 1181);
  context.stroke();

  drawPill(context, "模拟分析参考", 72, 1203, POSTER_COLORS.gold);
  context.fillStyle = POSTER_COLORS.muted;
  context.font = '500 17px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("数据来自公开市场接口，可能存在延迟；不构成投资建议。", 72, 1282);
  context.fillStyle = POSTER_COLORS.cyan;
  context.font = '600 18px "Microsoft YaHei", "PingFang SC", sans-serif';
  context.fillText("观潮 · A股行情与模拟交易", 72, 1318);

  previewUrl.value = canvas.toDataURL("image/png");
  canvas.toBlob((result) => {
    blob = result;
    generating.value = false;
  }, "image/png");
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return;
    await nextTick();
    await document.fonts?.ready;
    drawPoster();
  },
);

onBeforeUnmount(() => {
  blob = null;
});

async function shareImage() {
  if (!blob || !props.stock) return;
  const file = new File([blob], `观潮-${props.stock.code}-行情分享.png`, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `${props.stock.name} 行情`,
        text: `${props.stock.name} ${formatPrice(props.stock.price)} ${formatPct(stockPercent())}｜观潮`,
      });
      return;
    } catch {
      // The download fallback also handles a dismissed system share sheet.
    }
  }
  saveImage();
  emit("notify", "当前浏览器不支持系统分享，已改为下载图片");
}

function saveImage() {
  if (!previewUrl.value || !props.stock) return;
  const link = document.createElement("a");
  link.href = previewUrl.value;
  link.download = `观潮-${props.stock.code}-行情分享.png`;
  link.click();
}

const __returned__ = { props, emit, canvasRef, previewUrl, generating, get blob() { return blob }, set blob(v) { blob = v; }, stockPercent, drawPoster, shareImage, saveImage, nextTick, onBeforeUnmount, ref, watch, Icon: __sfc__$n, get formatCompactMoney() { return formatCompactMoney }, get formatVolume() { return formatVolume }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get POSTER_COLORS() { return POSTER_COLORS }, get drawBrand() { return drawBrand }, get drawLineChart() { return drawLineChart }, get drawMetricCard() { return drawMetricCard }, get drawPill() { return drawPill }, get drawPosterBackground() { return drawPosterBackground }, get roundRect() { return roundRect } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$4 = {
  class: "share-sheet",
  role: "dialog",
  "aria-modal": "true",
  "aria-label": "生成分享图片"
};
const _hoisted_2$4 = { class: "share-sheet-header" };
const _hoisted_3$4 = { class: "share-preview" };
const _hoisted_4$4 = ["src"];
const _hoisted_5$4 = {
  key: 1,
  class: "share-loading"
};
const _hoisted_6$4 = { class: "share-actions" };
const _hoisted_7$4 = ["disabled"];
const _hoisted_8$3 = ["disabled"];
const _hoisted_9$3 = {
  ref: "canvasRef",
  width: "1080",
  height: "1350",
  class: "share-canvas"
};

function render$4(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createBlock(Transition, { name: "sheet" }, {
    default: withCtx(() => [
      ($props.open && $props.stock)
        ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: "share-backdrop",
            onClick: _cache[1] || (_cache[1] = withModifiers($event => (_ctx.$emit('close')), ["self"]))
          }, [
            createBaseVNode("section", _hoisted_1$4, [
              createBaseVNode("header", _hoisted_2$4, [
                _cache[2] || (_cache[2] = createBaseVNode("div", null, [
                  createBaseVNode("span", null, "SHARE CARD"),
                  createBaseVNode("h2", null, "行情分享图")
                ], -1 /* CACHED */)),
                createBaseVNode("button", {
                  type: "button",
                  class: "icon-button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
                }, [
                  createVNode($setup["Icon"], {
                    name: "close",
                    size: 20
                  })
                ])
              ]),
              createBaseVNode("div", _hoisted_3$4, [
                ($setup.previewUrl)
                  ? (openBlock(), createElementBlock("img", {
                      key: 0,
                      src: $setup.previewUrl,
                      alt: "股票行情分享图片"
                    }, null, 8 /* PROPS */, _hoisted_4$4))
                  : (openBlock(), createElementBlock("div", _hoisted_5$4, [...(_cache[3] || (_cache[3] = [
                      createBaseVNode("i", { class: "loading-ring" }, null, -1 /* CACHED */),
                      createTextVNode(" 正在生成图片", -1 /* CACHED */)
                    ]))]))
              ]),
              createBaseVNode("div", _hoisted_6$4, [
                createBaseVNode("button", {
                  type: "button",
                  class: "secondary-button",
                  onClick: $setup.saveImage,
                  disabled: !$setup.previewUrl
                }, "保存图片", 8 /* PROPS */, _hoisted_7$4),
                createBaseVNode("button", {
                  type: "button",
                  class: "primary-button",
                  onClick: $setup.shareImage,
                  disabled: !$setup.previewUrl || $setup.generating
                }, "分享行情图", 8 /* PROPS */, _hoisted_8$3)
              ]),
              createBaseVNode("canvas", _hoisted_9$3, null, 512 /* NEED_PATCH */)
            ])
          ]))
        : createCommentVNode("v-if", true)
    ]),
    _: 1 /* STABLE */
  }))
}
__sfc__$4.render = render$4;
__sfc__$4.__file = "src/components/SharePoster.vue";

const width = 360;
const height = 218;

const __sfc__$3 = {
  __name: 'StockChart',
  props: {
  stock: { type: Object, required: true },
},
  setup(__props, { expose: __expose }) {
  __expose();

const props = __props;

const mode = ref("intraday");
const period = ref("3M");
const activeIndex = ref(-1);
const loading = ref(false);
const error = ref("");
const trendPoints = ref([]);
const candlePoints = ref([]);
const preClose = ref(0);
const gradientId = `chart-${useId().replaceAll(":", "")}`;
const chartCache = new Map();

const plot = { left: 8, right: 352, top: 18, bottom: 178 };
const periods = [
  { id: "1M", label: "1月", limit: 24 },
  { id: "3M", label: "3月", limit: 66 },
  { id: "6M", label: "6月", limit: 132 },
  { id: "1Y", label: "1年", limit: 250 },
];

const percent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});

const intradayGeometry = computed(() => {
  if (!trendPoints.value.length) return { points: [], line: "", area: "", previousY: 0 };
  const values = [...trendPoints.value.map((item) => item.price), preClose.value || props.stock.prevClose];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = trendPoints.value.map((item, index) => {
    const x = plot.left + (index / Math.max(1, trendPoints.value.length - 1)) * (plot.right - plot.left);
    const y = plot.top + ((max - item.price) / range) * (plot.bottom - plot.top);
    return { x, y, value: item.price, time: item.time, average: item.average, index };
  });
  const line = points.map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `M${points[0].x},${plot.bottom} L${line.replaceAll(" ", " L")} L${points.at(-1).x},${plot.bottom} Z`;
  const previousY = plot.top + ((max - (preClose.value || props.stock.prevClose)) / range) * (plot.bottom - plot.top);
  return { points, line, area, min, max, previousY };
});

const candleGeometry = computed(() => {
  if (!candlePoints.value.length) return [];
  const allValues = candlePoints.value.flatMap((item) => [item.high, item.low]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const available = plot.right - plot.left;
  const step = available / candlePoints.value.length;
  const candleWidth = Math.max(0.85, step * 0.55);
  return candlePoints.value.map((item, index) => {
    const center = plot.left + step * index + step / 2;
    const y = (value) => plot.top + ((max - value) / range) * (plot.bottom - plot.top);
    return {
      ...item,
      index,
      center,
      candleWidth,
      wickTop: y(item.high),
      wickBottom: y(item.low),
      bodyTop: y(Math.max(item.open, item.close)),
      bodyHeight: Math.max(1.1, Math.abs(y(item.open) - y(item.close))),
      rising: item.close >= item.open,
    };
  });
});

const activeIntraday = computed(() => {
  if (mode.value !== "intraday" || !intradayGeometry.value.points.length) return null;
  const index = activeIndex.value >= 0 ? activeIndex.value : intradayGeometry.value.points.length - 1;
  return intradayGeometry.value.points[index];
});

const activeCandle = computed(() => {
  if (mode.value !== "candle" || !candleGeometry.value.length) return null;
  const index = activeIndex.value >= 0 ? activeIndex.value : candleGeometry.value.length - 1;
  return candleGeometry.value[index];
});

const intradayTooltipLeft = computed(() =>
  activeIntraday.value ? Math.min(86, Math.max(14, (activeIntraday.value.x / width) * 100)) : 50,
);
const candleTooltipLeft = computed(() =>
  activeCandle.value ? Math.min(83, Math.max(17, (activeCandle.value.center / width) * 100)) : 50,
);

const times = computed(() => {
  if (mode.value === "candle") {
    const data = candlePoints.value;
    if (!data.length) return [];
    const indexes = [0, Math.floor((data.length - 1) / 3), Math.floor(((data.length - 1) * 2) / 3), data.length - 1];
    return indexes.map((index) => data[index].date.slice(5));
  }
  const data = trendPoints.value;
  if (!data.length) return [];
  const indexes = [0, Math.floor((data.length - 1) / 4), Math.floor((data.length - 1) / 2), Math.floor(((data.length - 1) * 3) / 4), data.length - 1];
  return indexes.map((index) => data[index].time);
});

async function loadChart() {
  const key = `${props.stock.secid}:${mode.value}:${mode.value === "candle" ? period.value : "1D"}`;
  if (chartCache.has(key)) {
    const cached = chartCache.get(key);
    trendPoints.value = cached.trendPoints || [];
    candlePoints.value = cached.candlePoints || [];
    preClose.value = cached.preClose || props.stock.prevClose;
    error.value = "";
    return;
  }

  loading.value = true;
  error.value = "";
  activeIndex.value = -1;
  try {
    const limit = mode.value === "candle" ? periods.find((item) => item.id === period.value)?.limit || 66 : 1;
    const query = new URLSearchParams({
      secid: props.stock.secid,
      mode: mode.value === "candle" ? "kline" : "trend",
      limit: String(limit),
    });
    const response = await fetch(`/api/chart?${query}`, { headers: { Accept: "application/json" } });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "图表数据加载失败");
    const cacheValue = {
      trendPoints: mode.value === "intraday" ? payload.points : [],
      candlePoints: mode.value === "candle" ? payload.points : [],
      preClose: payload.preClose || props.stock.prevClose,
    };
    chartCache.set(key, cacheValue);
    trendPoints.value = cacheValue.trendPoints;
    candlePoints.value = cacheValue.candlePoints;
    preClose.value = cacheValue.preClose;
  } catch (requestError) {
    trendPoints.value = [];
    candlePoints.value = [];
    error.value = requestError instanceof Error ? requestError.message : "图表数据加载失败";
  } finally {
    loading.value = false;
  }
}

function setMode(nextMode) {
  mode.value = nextMode;
  loadChart();
}

function setPeriod(nextPeriod) {
  period.value = nextPeriod;
  if (mode.value === "candle") loadChart();
}

function setActive(event) {
  const count = mode.value === "intraday" ? trendPoints.value.length : candlePoints.value.length;
  if (!count) return;
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  activeIndex.value = Math.round(ratio * (count - 1));
}

watch(
  () => props.stock.secid,
  () => {
    chartCache.clear();
    mode.value = "intraday";
    loadChart();
  },
);

onMounted(loadChart);

const __returned__ = { props, mode, period, activeIndex, loading, error, trendPoints, candlePoints, preClose, gradientId, chartCache, width, height, plot, periods, percent, intradayGeometry, candleGeometry, activeIntraday, activeCandle, intradayTooltipLeft, candleTooltipLeft, times, loadChart, setMode, setPeriod, setActive, computed, onMounted, ref, useId, watch, Icon: __sfc__$n, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$3 = { class: "chart-card" };
const _hoisted_2$3 = { class: "chart-summary" };
const _hoisted_3$3 = { class: "chart-toolbar" };
const _hoisted_4$3 = {
  class: "chart-tabs",
  role: "tablist"
};
const _hoisted_5$3 = {
  key: 0,
  class: "chart-periods compact"
};
const _hoisted_6$3 = ["onClick"];
const _hoisted_7$3 = {
  key: 0,
  class: "chart-state"
};
const _hoisted_8$2 = {
  key: 1,
  class: "chart-state error"
};
const _hoisted_9$2 = ["viewBox"];
const _hoisted_10$2 = ["stop-color"];
const _hoisted_11$2 = ["stop-color"];
const _hoisted_12$2 = ["y1", "y2"];
const _hoisted_13$2 = ["y1", "y2"];
const _hoisted_14$2 = ["d", "fill"];
const _hoisted_15$2 = ["points", "stroke"];
const _hoisted_16$2 = ["x1", "x2"];
const _hoisted_17$2 = ["cx", "cy", "stroke"];
const _hoisted_18$2 = ["x1", "x2", "y1", "y2", "stroke"];
const _hoisted_19$2 = ["x", "y", "width", "height", "fill"];
const _hoisted_20$2 = ["x1", "x2"];
const _hoisted_21$2 = {
  key: 0,
  class: "chart-labels"
};

function render$3(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("section", _hoisted_1$3, [
    createBaseVNode("div", _hoisted_2$3, [
      createBaseVNode("div", null, [
        _cache[2] || (_cache[2] = createBaseVNode("span", { class: "muted" }, "当前价格 · 实时", -1 /* CACHED */)),
        createBaseVNode("strong", {
          class: normalizeClass($setup.trendClass($setup.percent))
        }, toDisplayString($setup.formatPrice($props.stock.price)), 3 /* TEXT, CLASS */)
      ]),
      createBaseVNode("div", {
        class: normalizeClass(["chart-change", $setup.trendClass($setup.percent)])
      }, [
        createBaseVNode("span", null, toDisplayString($setup.formatPct($setup.percent)), 1 /* TEXT */),
        createBaseVNode("small", null, "较昨收 " + toDisplayString($props.stock.price - $props.stock.prevClose >= 0 ? "+" : "") + toDisplayString($setup.formatPrice($props.stock.price - $props.stock.prevClose)), 1 /* TEXT */)
      ], 2 /* CLASS */)
    ]),
    createBaseVNode("div", _hoisted_3$3, [
      createBaseVNode("div", _hoisted_4$3, [
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.mode === 'intraday' }),
          onClick: _cache[0] || (_cache[0] = $event => ($setup.setMode('intraday')))
        }, " 分时 ", 2 /* CLASS */),
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.mode === 'candle' }),
          onClick: _cache[1] || (_cache[1] = $event => ($setup.setMode('candle')))
        }, " 日 K ", 2 /* CLASS */)
      ]),
      ($setup.mode === 'candle')
        ? (openBlock(), createElementBlock("div", _hoisted_5$3, [
            (openBlock(), createElementBlock(Fragment, null, renderList($setup.periods, (item) => {
              return createBaseVNode("button", {
                key: item.id,
                type: "button",
                class: normalizeClass({ active: $setup.period === item.id }),
                onClick: $event => ($setup.setPeriod(item.id))
              }, toDisplayString(item.label), 11 /* TEXT, CLASS, PROPS */, _hoisted_6$3)
            }), 64 /* STABLE_FRAGMENT */))
          ]))
        : createCommentVNode("v-if", true)
    ]),
    createBaseVNode("div", {
      class: "chart-stage",
      onPointerdown: $setup.setActive,
      onPointermove: $setup.setActive
    }, [
      ($setup.loading)
        ? (openBlock(), createElementBlock("div", _hoisted_7$3, [...(_cache[3] || (_cache[3] = [
            createBaseVNode("i", { class: "loading-ring" }, null, -1 /* CACHED */),
            createBaseVNode("span", null, "正在读取公开行情图表", -1 /* CACHED */)
          ]))]))
        : ($setup.error)
          ? (openBlock(), createElementBlock("div", _hoisted_8$2, [
              createVNode($setup["Icon"], {
                name: "info",
                size: 22
              }),
              _cache[4] || (_cache[4] = createBaseVNode("strong", null, "图表暂不可用", -1 /* CACHED */)),
              createBaseVNode("span", null, toDisplayString($setup.error), 1 /* TEXT */),
              createBaseVNode("button", {
                type: "button",
                onClick: $setup.loadChart
              }, "重新加载")
            ]))
          : (openBlock(), createElementBlock("svg", {
              key: 2,
              viewBox: `0 0 ${$setup.width} ${$setup.height}`,
              class: "stock-chart",
              preserveAspectRatio: "none"
            }, [
              createBaseVNode("defs", null, [
                createBaseVNode("linearGradient", {
                  id: $setup.gradientId,
                  x1: "0",
                  y1: "0",
                  x2: "0",
                  y2: "1"
                }, [
                  createBaseVNode("stop", {
                    offset: "0%",
                    "stop-color": $setup.percent >= 0 ? '#ff6b6b' : '#31d2a4',
                    "stop-opacity": ".22"
                  }, null, 8 /* PROPS */, _hoisted_10$2),
                  createBaseVNode("stop", {
                    offset: "100%",
                    "stop-color": $setup.percent >= 0 ? '#ff6b6b' : '#31d2a4',
                    "stop-opacity": "0"
                  }, null, 8 /* PROPS */, _hoisted_11$2)
                ])
              ]),
              (openBlock(), createElementBlock(Fragment, null, renderList(4, (index) => {
                return createBaseVNode("line", {
                  key: index,
                  x1: "8",
                  x2: "352",
                  y1: 18 + index * 32,
                  y2: 18 + index * 32,
                  class: "chart-grid"
                }, null, 8 /* PROPS */, _hoisted_12$2)
              }), 64 /* STABLE_FRAGMENT */)),
              _cache[5] || (_cache[5] = createBaseVNode("line", {
                x1: "8",
                x2: "352",
                y1: "178",
                y2: "178",
                class: "chart-axis"
              }, null, -1 /* CACHED */)),
              ($setup.mode === 'intraday')
                ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                    createBaseVNode("line", {
                      x1: "8",
                      x2: "352",
                      y1: $setup.intradayGeometry.previousY,
                      y2: $setup.intradayGeometry.previousY,
                      class: "previous-line"
                    }, null, 8 /* PROPS */, _hoisted_13$2),
                    createBaseVNode("path", {
                      d: $setup.intradayGeometry.area,
                      fill: `url(#${$setup.gradientId})`
                    }, null, 8 /* PROPS */, _hoisted_14$2),
                    createBaseVNode("polyline", {
                      points: $setup.intradayGeometry.line,
                      fill: "none",
                      stroke: $setup.percent >= 0 ? '#ff6b6b' : '#31d2a4',
                      "stroke-width": "2.1",
                      "stroke-linecap": "round"
                    }, null, 8 /* PROPS */, _hoisted_15$2),
                    ($setup.activeIntraday)
                      ? (openBlock(), createElementBlock("line", {
                          key: 0,
                          x1: $setup.activeIntraday.x,
                          x2: $setup.activeIntraday.x,
                          y1: "18",
                          y2: "178",
                          class: "crosshair"
                        }, null, 8 /* PROPS */, _hoisted_16$2))
                      : createCommentVNode("v-if", true),
                    ($setup.activeIntraday)
                      ? (openBlock(), createElementBlock("circle", {
                          key: 1,
                          cx: $setup.activeIntraday.x,
                          cy: $setup.activeIntraday.y,
                          r: "4",
                          fill: "#fff",
                          stroke: $setup.percent >= 0 ? '#ff6b6b' : '#31d2a4',
                          "stroke-width": "2"
                        }, null, 8 /* PROPS */, _hoisted_17$2))
                      : createCommentVNode("v-if", true)
                  ], 64 /* STABLE_FRAGMENT */))
                : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList($setup.candleGeometry, (candle) => {
                      return (openBlock(), createElementBlock("g", {
                        key: candle.index
                      }, [
                        createBaseVNode("line", {
                          x1: candle.center,
                          x2: candle.center,
                          y1: candle.wickTop,
                          y2: candle.wickBottom,
                          stroke: candle.rising ? '#ff6b6b' : '#31d2a4',
                          "stroke-width": "1.1"
                        }, null, 8 /* PROPS */, _hoisted_18$2),
                        createBaseVNode("rect", {
                          x: candle.center - candle.candleWidth / 2,
                          y: candle.bodyTop,
                          width: candle.candleWidth,
                          height: candle.bodyHeight,
                          fill: candle.rising ? '#ff6b6b' : '#31d2a4',
                          rx: ".6"
                        }, null, 8 /* PROPS */, _hoisted_19$2)
                      ]))
                    }), 128 /* KEYED_FRAGMENT */)),
                    ($setup.activeCandle)
                      ? (openBlock(), createElementBlock("line", {
                          key: 0,
                          x1: $setup.activeCandle.center,
                          x2: $setup.activeCandle.center,
                          y1: "18",
                          y2: "178",
                          class: "crosshair"
                        }, null, 8 /* PROPS */, _hoisted_20$2))
                      : createCommentVNode("v-if", true)
                  ], 64 /* STABLE_FRAGMENT */))
            ], 8 /* PROPS */, _hoisted_9$2)),
      ($setup.activeIntraday && !$setup.loading && !$setup.error)
        ? (openBlock(), createElementBlock("div", {
            key: 3,
            class: "chart-tooltip",
            style: normalizeStyle({ left: `${$setup.intradayTooltipLeft}%` })
          }, [
            createBaseVNode("span", null, toDisplayString($setup.activeIntraday.time || "最新"), 1 /* TEXT */),
            createBaseVNode("strong", null, toDisplayString($setup.formatPrice($setup.activeIntraday.value)), 1 /* TEXT */)
          ], 4 /* STYLE */))
        : createCommentVNode("v-if", true),
      ($setup.activeCandle && !$setup.loading && !$setup.error)
        ? (openBlock(), createElementBlock("div", {
            key: 4,
            class: "chart-tooltip candle-tip",
            style: normalizeStyle({ left: `${$setup.candleTooltipLeft}%` })
          }, [
            createBaseVNode("span", null, toDisplayString($setup.activeCandle.date), 1 /* TEXT */),
            createBaseVNode("strong", null, "收 " + toDisplayString($setup.formatPrice($setup.activeCandle.close)), 1 /* TEXT */)
          ], 4 /* STYLE */))
        : createCommentVNode("v-if", true)
    ], 32 /* NEED_HYDRATION */),
    ($setup.times.length && !$setup.loading && !$setup.error)
      ? (openBlock(), createElementBlock("div", _hoisted_21$2, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($setup.times, (time) => {
            return (openBlock(), createElementBlock("span", { key: time }, toDisplayString(time), 1 /* TEXT */))
          }), 128 /* KEYED_FRAGMENT */))
        ]))
      : createCommentVNode("v-if", true),
    _cache[6] || (_cache[6] = createBaseVNode("p", { class: "chart-note" }, "数据源：公开行情接口 · 点击或滑动图表可查看数据点", -1 /* CACHED */))
  ]))
}
__sfc__$3.render = render$3;
__sfc__$3.__file = "src/components/StockChart.vue";

const __sfc__$2 = {
  __name: 'StockDetailView',
  props: {
  stock: { type: Object, required: true },
},
  emits: ["back", "open-trade", "open-ai", "open-alerts", "open-research", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;

const alertDirection = ref("above");
const alertTarget = ref("");
const shareOpen = ref(false);
const percent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});
const isWatched = computed(() => portfolio.watchlist.includes(props.stock.code));
const position = computed(() => getPosition(props.stock.code));
const stockAlerts = computed(() =>
  portfolio.alerts.filter((alert) => alert.code === props.stock.code && !alert.triggered),
);
const amplitude = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.high - props.stock.low) / props.stock.prevClose) * 100;
});
const dayRange = computed(() => {
  const low = props.stock.low || 0;
  const high = props.stock.high || 0;
  return high > low ? Math.min(100, Math.max(0, ((props.stock.price - low) / (high - low)) * 100)) : 50;
});

watch(
  () => props.stock.code,
  () => {
    alertTarget.value = props.stock.price ? (props.stock.price * 1.02).toFixed(2) : "";
  },
  { immediate: true },
);

watch(
  () => props.stock.price,
  (price) => {
    if (price && !alertTarget.value) alertTarget.value = (price * 1.02).toFixed(2);
  },
);

function watchStock() {
  const added = toggleWatch(props.stock.code);
  emit("notify", added ? "已加入自选" : "已移出自选");
}

function createAlert() {
  const result = addPriceAlert({
    code: props.stock.code,
    direction: alertDirection.value,
    target: alertTarget.value,
  });
  emit("notify", result.message);
}

const __returned__ = { props, emit, alertDirection, alertTarget, shareOpen, percent, isWatched, position, stockAlerts, amplitude, dayRange, watchStock, createAlert, computed, ref, watch, Icon: __sfc__$n, SharePoster: __sfc__$4, StockChart: __sfc__$3, get addPriceAlert() { return addPriceAlert }, get formatCompactMoney() { return formatCompactMoney }, get formatMoney() { return formatMoney }, get formatVolume() { return formatVolume }, get getPosition() { return getPosition }, get portfolio() { return portfolio }, get tradingStatus() { return tradingStatus }, get toggleWatch() { return toggleWatch }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$2 = { class: "page detail-view" };
const _hoisted_2$2 = { class: "detail-header" };
const _hoisted_3$2 = { class: "detail-title" };
const _hoisted_4$2 = { class: "detail-actions" };
const _hoisted_5$2 = { key: 0 };
const _hoisted_6$2 = { class: "quote-hero" };
const _hoisted_7$2 = { class: "quote-main" };
const _hoisted_8$1 = { class: "quote-seal" };
const _hoisted_9$1 = { class: "tag-list" };
const _hoisted_10$1 = { class: "quote-facts" };
const _hoisted_11$1 = { class: "rise" };
const _hoisted_12$1 = { class: "fall" };
const _hoisted_13$1 = { class: "insight-card" };
const _hoisted_14$1 = { class: "insight-head" };
const _hoisted_15$1 = { class: "day-range-card" };
const _hoisted_16$1 = { class: "day-range-values" };
const _hoisted_17$1 = { class: "fall" };
const _hoisted_18$1 = { class: "rise" };
const _hoisted_19$1 = { class: "day-range-track" };
const _hoisted_20$1 = { class: "research-entry-icon" };
const _hoisted_21$1 = { class: "alert-setup-card" };
const _hoisted_22$1 = { class: "alert-setup-head" };
const _hoisted_23$1 = { class: "alert-form" };
const _hoisted_24$1 = { class: "alert-direction" };
const _hoisted_25$1 = ["placeholder"];
const _hoisted_26$1 = { class: "fundamentals-card" };
const _hoisted_27$1 = { class: "fundamentals-grid" };
const _hoisted_28$1 = { class: "company-card" };
const _hoisted_29$1 = {
  key: 0,
  class: "position-card"
};
const _hoisted_30$1 = { class: "trade-dock" };
const _hoisted_31$1 = ["disabled"];
const _hoisted_32 = ["disabled"];

function render$2(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$2, [
    createBaseVNode("header", _hoisted_2$2, [
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "返回",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('back')))
      }, [
        createVNode($setup["Icon"], {
          name: "arrowLeft",
          size: 21
        })
      ]),
      createBaseVNode("div", _hoisted_3$2, [
        createBaseVNode("strong", null, toDisplayString($props.stock.name), 1 /* TEXT */),
        createBaseVNode("span", null, toDisplayString($props.stock.code) + " · " + toDisplayString($props.stock.market) + " A股", 1 /* TEXT */)
      ]),
      createBaseVNode("div", _hoisted_4$2, [
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass(["icon-button", { starred: $setup.isWatched }]),
          "aria-label": "收藏",
          onClick: $setup.watchStock
        }, [
          createVNode($setup["Icon"], {
            name: "star",
            size: 20
          })
        ], 2 /* CLASS */),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button alert-header-button",
          "aria-label": "价格提醒",
          onClick: _cache[1] || (_cache[1] = $event => ($setup.emit('open-alerts')))
        }, [
          createVNode($setup["Icon"], {
            name: "bell",
            size: 19
          }),
          ($setup.stockAlerts.length)
            ? (openBlock(), createElementBlock("i", _hoisted_5$2))
            : createCommentVNode("v-if", true)
        ]),
        createBaseVNode("button", {
          type: "button",
          class: "icon-button",
          "aria-label": "生成分享图片",
          onClick: _cache[2] || (_cache[2] = $event => ($setup.shareOpen = true))
        }, [
          createVNode($setup["Icon"], {
            name: "share",
            size: 19
          })
        ])
      ])
    ]),
    createBaseVNode("main", null, [
      createBaseVNode("section", _hoisted_6$2, [
        createBaseVNode("div", _hoisted_7$2, [
          createBaseVNode("div", null, [
            createBaseVNode("span", {
              class: normalizeClass(["market-tag", { offline: !$props.stock.live }])
            }, [
              _cache[13] || (_cache[13] = createBaseVNode("i", null, null, -1 /* CACHED */)),
              createTextVNode(" " + toDisplayString($props.stock.live ? "实时行情" : "行情缓存"), 1 /* TEXT */)
            ], 2 /* CLASS */),
            createBaseVNode("strong", {
              class: normalizeClass($setup.trendClass($setup.percent))
            }, "¥ " + toDisplayString($setup.formatPrice($props.stock.price)), 3 /* TEXT, CLASS */),
            createBaseVNode("div", {
              class: normalizeClass(["quote-change", $setup.trendClass($setup.percent)])
            }, [
              createBaseVNode("span", null, toDisplayString($props.stock.price - $props.stock.prevClose >= 0 ? "+" : "") + toDisplayString($setup.formatPrice($props.stock.price - $props.stock.prevClose)), 1 /* TEXT */),
              createBaseVNode("span", null, toDisplayString($setup.formatPct($setup.percent)), 1 /* TEXT */)
            ], 2 /* CLASS */)
          ]),
          createBaseVNode("div", _hoisted_8$1, [
            createBaseVNode("span", null, toDisplayString($props.stock.name.slice(0, 1)), 1 /* TEXT */),
            createBaseVNode("small", null, toDisplayString($props.stock.sector), 1 /* TEXT */)
          ])
        ]),
        createBaseVNode("div", _hoisted_9$1, [
          (openBlock(true), createElementBlock(Fragment, null, renderList($props.stock.tags, (tag) => {
            return (openBlock(), createElementBlock("span", { key: tag }, toDisplayString(tag), 1 /* TEXT */))
          }), 128 /* KEYED_FRAGMENT */)),
          createBaseVNode("span", {
            class: normalizeClass(["session-inline-badge", { open: $setup.tradingStatus.canTrade }])
          }, toDisplayString($setup.tradingStatus.label), 3 /* TEXT, CLASS */)
        ])
      ]),
      createVNode($setup["StockChart"], { stock: $props.stock }, null, 8 /* PROPS */, ["stock"]),
      createBaseVNode("section", _hoisted_10$1, [
        createBaseVNode("div", null, [
          _cache[14] || (_cache[14] = createBaseVNode("span", null, "今开", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($setup.formatPrice($props.stock.open)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[15] || (_cache[15] = createBaseVNode("span", null, "最高", -1 /* CACHED */)),
          createBaseVNode("strong", _hoisted_11$1, toDisplayString($setup.formatPrice($props.stock.high)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[16] || (_cache[16] = createBaseVNode("span", null, "最低", -1 /* CACHED */)),
          createBaseVNode("strong", _hoisted_12$1, toDisplayString($setup.formatPrice($props.stock.low)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[17] || (_cache[17] = createBaseVNode("span", null, "昨收", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($setup.formatPrice($props.stock.prevClose)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[18] || (_cache[18] = createBaseVNode("span", null, "成交量", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($setup.formatVolume($props.stock.volume)), 1 /* TEXT */)
        ]),
        createBaseVNode("div", null, [
          _cache[19] || (_cache[19] = createBaseVNode("span", null, "成交额", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($setup.formatCompactMoney($props.stock.amount)), 1 /* TEXT */)
        ])
      ]),
      createBaseVNode("section", _hoisted_13$1, [
        createBaseVNode("div", _hoisted_14$1, [
          createBaseVNode("span", null, [
            createVNode($setup["Icon"], {
              name: "chart",
              size: 19
            })
          ]),
          _cache[20] || (_cache[20] = createBaseVNode("div", null, [
            createBaseVNode("strong", null, "盘面速读"),
            createBaseVNode("small", null, "根据当前行情字段生成")
          ], -1 /* CACHED */)),
          _cache[21] || (_cache[21] = createBaseVNode("em", null, "非投资建议", -1 /* CACHED */))
        ]),
        createBaseVNode("p", null, toDisplayString($props.stock.name) + " 当前" + toDisplayString($setup.percent >= 0 ? "上涨" : "下跌") + " " + toDisplayString(Math.abs($setup.percent).toFixed(2)) + "%， 日内振幅 " + toDisplayString($setup.amplitude.toFixed(2)) + "%，量比 " + toDisplayString($props.stock.volumeRatio ? Number($props.stock.volumeRatio).toFixed(2) : "—") + "。 现价位于今日 " + toDisplayString($setup.dayRange.toFixed(0)) + "% 的价格区间位置。 ", 1 /* TEXT */),
        createBaseVNode("button", {
          type: "button",
          onClick: _cache[3] || (_cache[3] = $event => ($setup.emit('open-ai')))
        }, [
          _cache[22] || (_cache[22] = createTextVNode("查看持仓关联分析 ", -1 /* CACHED */)),
          createVNode($setup["Icon"], {
            name: "arrowRight",
            size: 14
          })
        ])
      ]),
      createBaseVNode("section", _hoisted_15$1, [
        _cache[26] || (_cache[26] = createBaseVNode("div", { class: "section-heading compact" }, [
          createBaseVNode("div", null, [
            createBaseVNode("span", null, "DAY RANGE"),
            createBaseVNode("h2", null, "今日价格区间")
          ]),
          createBaseVNode("em", null, "实时字段")
        ], -1 /* CACHED */)),
        createBaseVNode("div", _hoisted_16$1, [
          createBaseVNode("span", null, [
            _cache[23] || (_cache[23] = createBaseVNode("small", null, "最低", -1 /* CACHED */)),
            createBaseVNode("strong", _hoisted_17$1, toDisplayString($setup.formatPrice($props.stock.low)), 1 /* TEXT */)
          ]),
          createBaseVNode("span", null, [
            _cache[24] || (_cache[24] = createBaseVNode("small", null, "现价", -1 /* CACHED */)),
            createBaseVNode("strong", {
              class: normalizeClass($setup.trendClass($setup.percent))
            }, toDisplayString($setup.formatPrice($props.stock.price)), 3 /* TEXT, CLASS */)
          ]),
          createBaseVNode("span", null, [
            _cache[25] || (_cache[25] = createBaseVNode("small", null, "最高", -1 /* CACHED */)),
            createBaseVNode("strong", _hoisted_18$1, toDisplayString($setup.formatPrice($props.stock.high)), 1 /* TEXT */)
          ])
        ]),
        createBaseVNode("div", _hoisted_19$1, [
          createBaseVNode("i", {
            style: normalizeStyle({ left: `${$setup.dayRange}%` })
          }, null, 4 /* STYLE */)
        ])
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "research-entry-card",
        onClick: _cache[4] || (_cache[4] = $event => ($setup.emit('open-research')))
      }, [
        createBaseVNode("span", _hoisted_20$1, [
          createVNode($setup["Icon"], {
            name: "shield",
            size: 22
          })
        ]),
        _cache[27] || (_cache[27] = createBaseVNode("span", null, [
          createBaseVNode("small", null, "DEEP RESEARCH"),
          createBaseVNode("strong", null, "风险 · 趋势预测 · 财务诊股"),
          createBaseVNode("em", null, "异动、主力资金、板块、换手率与五类财务指标")
        ], -1 /* CACHED */)),
        createVNode($setup["Icon"], {
          name: "arrowRight",
          size: 18
        })
      ]),
      createBaseVNode("section", _hoisted_21$1, [
        createBaseVNode("div", _hoisted_22$1, [
          createBaseVNode("span", null, [
            createVNode($setup["Icon"], {
              name: "bell",
              size: 18
            })
          ]),
          _cache[28] || (_cache[28] = createBaseVNode("div", null, [
            createBaseVNode("strong", null, "价格提醒"),
            createBaseVNode("small", null, "到达目标价时在页面内通知")
          ], -1 /* CACHED */)),
          createBaseVNode("button", {
            type: "button",
            onClick: _cache[5] || (_cache[5] = $event => ($setup.emit('open-alerts')))
          }, "管理 " + toDisplayString($setup.stockAlerts.length ? `(${$setup.stockAlerts.length})` : ""), 1 /* TEXT */)
        ]),
        createBaseVNode("div", _hoisted_23$1, [
          createBaseVNode("div", _hoisted_24$1, [
            createBaseVNode("button", {
              type: "button",
              class: normalizeClass({ active: $setup.alertDirection === 'above' }),
              onClick: _cache[6] || (_cache[6] = $event => ($setup.alertDirection = 'above'))
            }, "高于", 2 /* CLASS */),
            createBaseVNode("button", {
              type: "button",
              class: normalizeClass({ active: $setup.alertDirection === 'below' }),
              onClick: _cache[7] || (_cache[7] = $event => ($setup.alertDirection = 'below'))
            }, "低于", 2 /* CLASS */)
          ]),
          createBaseVNode("label", null, [
            _cache[29] || (_cache[29] = createBaseVNode("span", null, "¥", -1 /* CACHED */)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[8] || (_cache[8] = $event => (($setup.alertTarget) = $event)),
              type: "number",
              inputmode: "decimal",
              step: "0.01",
              placeholder: $setup.formatPrice($props.stock.price)
            }, null, 8 /* PROPS */, _hoisted_25$1), [
              [vModelText, $setup.alertTarget]
            ])
          ]),
          createBaseVNode("button", {
            type: "button",
            class: "alert-add-button",
            onClick: $setup.createAlert
          }, "设置提醒")
        ])
      ]),
      createBaseVNode("section", _hoisted_26$1, [
        _cache[36] || (_cache[36] = createBaseVNode("div", { class: "section-heading compact" }, [
          createBaseVNode("div", null, [
            createBaseVNode("span", null, "QUOTE DATA"),
            createBaseVNode("h2", null, "行情数据")
          ]),
          createBaseVNode("em", null, "公开接口")
        ], -1 /* CACHED */)),
        createBaseVNode("div", _hoisted_27$1, [
          createBaseVNode("div", null, [
            _cache[30] || (_cache[30] = createBaseVNode("span", null, "总市值", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($setup.formatCompactMoney($props.stock.marketCap)), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[31] || (_cache[31] = createBaseVNode("span", null, "市盈率", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($props.stock.pe || "—"), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[32] || (_cache[32] = createBaseVNode("span", null, "市净率", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($props.stock.pb || "—"), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[33] || (_cache[33] = createBaseVNode("span", null, "换手率", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($props.stock.turnover ? `${$props.stock.turnover}%` : "—"), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[34] || (_cache[34] = createBaseVNode("span", null, "量比", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($props.stock.volumeRatio || "—"), 1 /* TEXT */)
          ]),
          createBaseVNode("div", null, [
            _cache[35] || (_cache[35] = createBaseVNode("span", null, "所属行业", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($props.stock.sector), 1 /* TEXT */)
          ])
        ])
      ]),
      createBaseVNode("section", _hoisted_28$1, [
        _cache[37] || (_cache[37] = createBaseVNode("div", { class: "section-heading compact" }, [
          createBaseVNode("div", null, [
            createBaseVNode("span", null, "COMPANY"),
            createBaseVNode("h2", null, "上市公司")
          ])
        ], -1 /* CACHED */)),
        createBaseVNode("p", null, toDisplayString($props.stock.description), 1 /* TEXT */)
      ]),
      _cache[39] || (_cache[39] = createStaticVNode("<section class=\"detail-news\"><div class=\"section-heading compact\"><div><span>DATA NOTE</span><h2>行情说明</h2></div></div><article><span>来源</span><div><strong>公开行情接口</strong><p>页面通过本地服务转发公开市场数据。公开接口可能短暂延迟，请以证券交易所最终数据为准。</p></div></article><article><span>交易</span><div><strong>模拟盘</strong><p>所有买卖仅使用虚拟资金并记录在本机，不会向券商发送委托。</p></div></article></section>", 1)),
      ($setup.position)
        ? (openBlock(), createElementBlock("section", _hoisted_29$1, [
            _cache[38] || (_cache[38] = createBaseVNode("span", null, "当前模拟持仓", -1 /* CACHED */)),
            createBaseVNode("strong", null, toDisplayString($setup.position.shares) + " 股", 1 /* TEXT */),
            createBaseVNode("small", null, "成本 " + toDisplayString($setup.position.avgCost.toFixed(2)) + " · 市值 ¥" + toDisplayString($setup.formatMoney($setup.position.shares * $props.stock.price)), 1 /* TEXT */)
          ]))
        : createCommentVNode("v-if", true)
    ]),
    createBaseVNode("div", _hoisted_30$1, [
      createBaseVNode("button", {
        type: "button",
        class: "secondary-button watch-button",
        onClick: $setup.watchStock
      }, [
        createVNode($setup["Icon"], {
          name: "star",
          size: 18,
          class: normalizeClass({ filled: $setup.isWatched })
        }, null, 8 /* PROPS */, ["class"]),
        createTextVNode(" " + toDisplayString($setup.isWatched ? "已自选" : "加自选"), 1 /* TEXT */)
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "sell-button",
        disabled: !$setup.tradingStatus.canTrade,
        onClick: _cache[9] || (_cache[9] = $event => ($setup.emit('open-trade', { stock: $props.stock, type: 'sell' })))
      }, toDisplayString($setup.tradingStatus.canTrade ? "模拟卖出" : "休市"), 9 /* TEXT, PROPS */, _hoisted_31$1),
      createBaseVNode("button", {
        type: "button",
        class: "buy-button",
        disabled: !$setup.tradingStatus.canTrade,
        onClick: _cache[10] || (_cache[10] = $event => ($setup.emit('open-trade', { stock: $props.stock, type: 'buy' })))
      }, toDisplayString($setup.tradingStatus.canTrade ? "模拟买入" : "休市"), 9 /* TEXT, PROPS */, _hoisted_32)
    ]),
    createVNode($setup["SharePoster"], {
      open: $setup.shareOpen,
      stock: $props.stock,
      onClose: _cache[11] || (_cache[11] = $event => ($setup.shareOpen = false)),
      onNotify: _cache[12] || (_cache[12] = $event => ($setup.emit('notify', $event)))
    }, null, 8 /* PROPS */, ["open", "stock"])
  ]))
}
__sfc__$2.render = render$2;
__sfc__$2.__file = "src/views/StockDetailView.vue";

const __sfc__$1 = {
  __name: 'StockResearchView',
  props: {
  stock: { type: Object, required: true },
},
  emits: ["back", "notify"],
  setup(__props, { expose: __expose, emit: __emit }) {
  __expose();

const props = __props;

const emit = __emit;
const tab = ref("risk");
const loading = ref(true);
const error = ref("");
const data = ref(null);
let requestId = 0;

const quotePercent = computed(() => {
  if (!props.stock.prevClose) return 0;
  return ((props.stock.price - props.stock.prevClose) / props.stock.prevClose) * 100;
});

const riskTone = computed(() => {
  if (!data.value?.risk) return "neutral";
  return data.value.risk.score >= 68 ? "danger" : data.value.risk.score >= 45 ? "watch" : "safe";
});

const scoreStyle = computed(() => ({
  "--score": `${(data.value?.risk?.score || 0) * 2.95}deg`,
}));

const forecastBars = computed(() => {
  const scenarios = data.value?.forecast?.scenarios;
  if (!scenarios) return [];
  return [
    { key: "bullish", label: "偏强情景", value: scenarios.bullish, tone: "rise" },
    { key: "neutral", label: "震荡情景", value: scenarios.neutral, tone: "neutral" },
    { key: "bearish", label: "回落情景", value: scenarios.bearish, tone: "fall" },
  ];
});

async function loadAnalysis() {
  const currentRequest = ++requestId;
  loading.value = true;
  error.value = "";
  try {
    const query = new URLSearchParams({
      secid: props.stock.secid,
      name: props.stock.name,
      industry: props.stock.sector || "",
      turnover: String(props.stock.turnover || 0),
    });
    const response = await fetch(`/api/stock-analysis?${query}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json();
    if (!response.ok || !payload.ok) throw new Error(payload.error || "深度分析暂时不可用");
    if (currentRequest === requestId) data.value = payload;
  } catch (requestError) {
    if (currentRequest === requestId) {
      error.value = requestError instanceof Error ? requestError.message : "深度分析暂时不可用";
    }
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

function flowLabel(value) {
  const number = Number(value || 0);
  return `${number > 0 ? "+" : ""}${formatCompactMoney(number)}`;
}

watch(() => props.stock.secid, loadAnalysis);
onMounted(loadAnalysis);

const __returned__ = { props, emit, tab, loading, error, data, get requestId() { return requestId }, set requestId(v) { requestId = v; }, quotePercent, riskTone, scoreStyle, forecastBars, loadAnalysis, flowLabel, computed, onMounted, ref, watch, Icon: __sfc__$n, get formatCompactMoney() { return formatCompactMoney }, get formatMoney() { return formatMoney }, get formatSigned() { return formatSigned }, get formatPct() { return formatPct }, get formatPrice() { return formatPrice }, get trendClass() { return trendClass } };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1$1 = { class: "page research-view" };
const _hoisted_2$1 = { class: "detail-header research-header" };
const _hoisted_3$1 = { class: "detail-title" };
const _hoisted_4$1 = { class: "research-quote-line" };
const _hoisted_5$1 = { key: 0 };
const _hoisted_6$1 = { class: "segmented research-tabs" };
const _hoisted_7$1 = {
  key: 0,
  class: "research-loading"
};
const _hoisted_8 = {
  key: 1,
  class: "research-error"
};
const _hoisted_9 = {
  key: 0,
  class: "research-panel"
};
const _hoisted_10 = { class: "risk-metric-grid" };
const _hoisted_11 = { class: "risk-metric-icon" };
const _hoisted_12 = { class: "risk-metric-icon flow" };
const _hoisted_13 = { class: "risk-metric-icon sector" };
const _hoisted_14 = { class: "risk-metric-icon turnover" };
const _hoisted_15 = { class: "flow-panel" };
const _hoisted_16 = { class: "flow-chart" };
const _hoisted_17 = { class: "sector-verdict" };
const _hoisted_18 = {
  key: 1,
  class: "research-panel"
};
const _hoisted_19 = { class: "forecast-hero" };
const _hoisted_20 = { class: "forecast-score" };
const _hoisted_21 = { class: "scenario-card" };
const _hoisted_22 = { class: "forecast-levels" };
const _hoisted_23 = { class: "fall" };
const _hoisted_24 = { class: "rise" };
const _hoisted_25 = { class: "indicator-card" };
const _hoisted_26 = { class: "indicator-grid" };
const _hoisted_27 = {
  key: 2,
  class: "research-panel financial-panel"
};
const _hoisted_28 = {
  key: 0,
  class: "research-error small"
};
const _hoisted_29 = { class: "diagnosis-head" };
const _hoisted_30 = { class: "diagnosis-score-bar" };
const _hoisted_31 = { class: "diagnosis-metrics" };

function render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1$1, [
    createBaseVNode("header", _hoisted_2$1, [
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "返回",
        onClick: _cache[0] || (_cache[0] = $event => ($setup.emit('back')))
      }, [
        createVNode($setup["Icon"], {
          name: "arrowLeft",
          size: 21
        })
      ]),
      createBaseVNode("div", _hoisted_3$1, [
        createBaseVNode("strong", null, toDisplayString($props.stock.name) + " · 深度分析", 1 /* TEXT */),
        createBaseVNode("span", null, toDisplayString($props.stock.code) + " · 风险、预测与财务诊断", 1 /* TEXT */)
      ]),
      createBaseVNode("button", {
        type: "button",
        class: "icon-button",
        "aria-label": "刷新分析",
        onClick: $setup.loadAnalysis
      }, [
        createVNode($setup["Icon"], {
          name: "refresh",
          size: 19,
          class: normalizeClass({ spin: $setup.loading })
        }, null, 8 /* PROPS */, ["class"])
      ])
    ]),
    createBaseVNode("main", null, [
      createBaseVNode("section", _hoisted_4$1, [
        createBaseVNode("div", null, [
          _cache[4] || (_cache[4] = createBaseVNode("span", null, "现价", -1 /* CACHED */)),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass($setup.quotePercent))
          }, "¥" + toDisplayString($setup.formatPrice($props.stock.price)), 3 /* TEXT, CLASS */)
        ]),
        createBaseVNode("div", null, [
          _cache[5] || (_cache[5] = createBaseVNode("span", null, "今日涨跌", -1 /* CACHED */)),
          createBaseVNode("strong", {
            class: normalizeClass($setup.trendClass($setup.quotePercent))
          }, toDisplayString($setup.formatPct($setup.quotePercent)), 3 /* TEXT, CLASS */)
        ]),
        createBaseVNode("div", null, [
          _cache[6] || (_cache[6] = createBaseVNode("span", null, "换手率", -1 /* CACHED */)),
          createBaseVNode("strong", null, toDisplayString($props.stock.turnover ? `${Number($props.stock.turnover).toFixed(2)}%` : "—"), 1 /* TEXT */)
        ]),
        ($setup.data?.stale)
          ? (openBlock(), createElementBlock("em", _hoisted_5$1, "缓存数据"))
          : createCommentVNode("v-if", true)
      ]),
      createBaseVNode("div", _hoisted_6$1, [
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.tab === 'risk' }),
          onClick: _cache[1] || (_cache[1] = $event => ($setup.tab = 'risk'))
        }, "风险分析", 2 /* CLASS */),
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.tab === 'forecast' }),
          onClick: _cache[2] || (_cache[2] = $event => ($setup.tab = 'forecast'))
        }, "趋势预测", 2 /* CLASS */),
        createBaseVNode("button", {
          type: "button",
          class: normalizeClass({ active: $setup.tab === 'financial' }),
          onClick: _cache[3] || (_cache[3] = $event => ($setup.tab = 'financial'))
        }, "财务诊股", 2 /* CLASS */)
      ]),
      ($setup.loading)
        ? (openBlock(), createElementBlock("div", _hoisted_7$1, [
            _cache[7] || (_cache[7] = createBaseVNode("i", { class: "loading-ring" }, null, -1 /* CACHED */)),
            createBaseVNode("strong", null, "正在计算 " + toDisplayString($setup.tab === "financial" ? "财务指标" : $setup.tab === "forecast" ? "趋势模型" : "风险指标"), 1 /* TEXT */),
            _cache[8] || (_cache[8] = createBaseVNode("span", null, "正在组合实时行情、历史K线与公开财务数据", -1 /* CACHED */))
          ]))
        : ($setup.error)
          ? (openBlock(), createElementBlock("div", _hoisted_8, [
              createBaseVNode("span", null, [
                createVNode($setup["Icon"], {
                  name: "info",
                  size: 26
                })
              ]),
              _cache[9] || (_cache[9] = createBaseVNode("strong", null, "分析数据暂时不可用", -1 /* CACHED */)),
              createBaseVNode("p", null, toDisplayString($setup.error), 1 /* TEXT */),
              createBaseVNode("button", {
                type: "button",
                class: "primary-button",
                onClick: $setup.loadAnalysis
              }, "重新加载")
            ]))
          : ($setup.data)
            ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
                ($setup.tab === 'risk')
                  ? (openBlock(), createElementBlock("section", _hoisted_9, [
                      createBaseVNode("div", {
                        class: normalizeClass(["risk-overview", $setup.riskTone])
                      }, [
                        createBaseVNode("div", null, [
                          _cache[10] || (_cache[10] = createBaseVNode("span", null, "综合风险", -1 /* CACHED */)),
                          createBaseVNode("h2", null, toDisplayString($setup.data.risk.level) + "风险", 1 /* TEXT */),
                          createBaseVNode("p", null, toDisplayString($setup.data.risk.abnormal.label) + "，" + toDisplayString($setup.data.risk.turnover.label) + "换手，近5日主力" + toDisplayString($setup.data.risk.mainFlow.sum5 >= 0 ? "净流入" : "净流出") + " " + toDisplayString($setup.flowLabel(Math.abs($setup.data.risk.mainFlow.sum5))) + "。", 1 /* TEXT */)
                        ]),
                        createBaseVNode("div", {
                          class: "risk-gauge",
                          style: normalizeStyle($setup.scoreStyle)
                        }, [
                          createBaseVNode("span", null, [
                            createBaseVNode("strong", null, toDisplayString($setup.data.risk.score), 1 /* TEXT */),
                            _cache[11] || (_cache[11] = createBaseVNode("small", null, "/100", -1 /* CACHED */))
                          ])
                        ], 4 /* STYLE */)
                      ], 2 /* CLASS */),
                      createBaseVNode("div", _hoisted_10, [
                        createBaseVNode("article", null, [
                          createBaseVNode("span", _hoisted_11, [
                            createVNode($setup["Icon"], {
                              name: "trend",
                              size: 18
                            })
                          ]),
                          _cache[12] || (_cache[12] = createBaseVNode("small", null, "价格异动", -1 /* CACHED */)),
                          createBaseVNode("strong", null, toDisplayString($setup.data.risk.abnormal.label), 1 /* TEXT */),
                          createBaseVNode("em", null, "涨跌 " + toDisplayString($setup.formatPct($setup.data.risk.abnormal.changePercent)) + " · 振幅 " + toDisplayString($setup.data.risk.abnormal.amplitude) + "%", 1 /* TEXT */)
                        ]),
                        createBaseVNode("article", null, [
                          createBaseVNode("span", _hoisted_12, [
                            createVNode($setup["Icon"], {
                              name: "wallet",
                              size: 18
                            })
                          ]),
                          _cache[13] || (_cache[13] = createBaseVNode("small", null, "今日主力资金", -1 /* CACHED */)),
                          createBaseVNode("strong", {
                            class: normalizeClass($setup.trendClass($setup.data.risk.mainFlow.latest))
                          }, toDisplayString($setup.flowLabel($setup.data.risk.mainFlow.latest)), 3 /* TEXT, CLASS */),
                          createBaseVNode("em", null, "净占比 " + toDisplayString($setup.formatPct($setup.data.risk.mainFlow.latestPercent)), 1 /* TEXT */)
                        ]),
                        createBaseVNode("article", null, [
                          createBaseVNode("span", _hoisted_13, [
                            createVNode($setup["Icon"], {
                              name: "market",
                              size: 18
                            })
                          ]),
                          _cache[14] || (_cache[14] = createBaseVNode("small", null, "所属板块", -1 /* CACHED */)),
                          createBaseVNode("strong", null, toDisplayString($setup.data.risk.sector.name), 1 /* TEXT */),
                          createBaseVNode("em", {
                            class: normalizeClass($setup.trendClass($setup.data.risk.sector.changePercent))
                          }, "板块 " + toDisplayString($setup.formatPct($setup.data.risk.sector.changePercent)), 3 /* TEXT, CLASS */)
                        ]),
                        createBaseVNode("article", null, [
                          createBaseVNode("span", _hoisted_14, [
                            createVNode($setup["Icon"], {
                              name: "refresh",
                              size: 18
                            })
                          ]),
                          _cache[15] || (_cache[15] = createBaseVNode("small", null, "换手率", -1 /* CACHED */)),
                          createBaseVNode("strong", null, toDisplayString(Number($setup.data.risk.turnover.value).toFixed(2)) + "%", 1 /* TEXT */),
                          createBaseVNode("em", null, toDisplayString($setup.data.risk.turnover.label), 1 /* TEXT */)
                        ])
                      ]),
                      createBaseVNode("section", _hoisted_15, [
                        _cache[16] || (_cache[16] = createBaseVNode("div", { class: "section-heading compact" }, [
                          createBaseVNode("div", null, [
                            createBaseVNode("span", null, "MAIN FLOW"),
                            createBaseVNode("h2", null, "近 5 日主力资金")
                          ]),
                          createBaseVNode("em", null, "公开资金流数据")
                        ], -1 /* CACHED */)),
                        createBaseVNode("div", _hoisted_16, [
                          (openBlock(true), createElementBlock(Fragment, null, renderList($setup.data.risk.mainFlow.trend, (item) => {
                            return (openBlock(), createElementBlock("div", {
                              key: item.date,
                              class: "flow-column"
                            }, [
                              createBaseVNode("span", null, toDisplayString($setup.flowLabel(item.mainNet)), 1 /* TEXT */),
                              createBaseVNode("i", {
                                class: normalizeClass($setup.trendClass(item.mainNet)),
                                style: normalizeStyle({ height: `${Math.max(8, Math.min(100, Math.abs(item.mainNet) / 400000000 * 100))}%` })
                              }, null, 6 /* CLASS, STYLE */),
                              createBaseVNode("small", null, toDisplayString(item.date.slice(5)), 1 /* TEXT */)
                            ]))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]),
                        _cache[17] || (_cache[17] = createBaseVNode("p", { class: "research-disclaimer" }, "主力资金按公开接口的资金流字段展示，不等同于机构真实持仓变化，也不代表未来走势。", -1 /* CACHED */))
                      ]),
                      createBaseVNode("section", _hoisted_17, [
                        createBaseVNode("span", null, [
                          createVNode($setup["Icon"], {
                            name: "market",
                            size: 19
                          })
                        ]),
                        createBaseVNode("div", null, [
                          _cache[18] || (_cache[18] = createBaseVNode("strong", null, "板块解析", -1 /* CACHED */)),
                          createBaseVNode("p", null, toDisplayString($setup.data.risk.sector.name) + " 板块当日 " + toDisplayString($setup.formatPct($setup.data.risk.sector.changePercent)) + "， 个股相对板块 " + toDisplayString($setup.data.risk.sector.relative === null ? "暂无法比较" : `${$setup.formatSigned($setup.data.risk.sector.relative)}%`) + "。 " + toDisplayString($setup.data.risk.sector.relative > 0 ? "个股表现强于板块。" : $setup.data.risk.sector.relative < 0 ? "个股弱于板块，注意板块联动压力。" : "个股与板块表现接近。"), 1 /* TEXT */)
                        ])
                      ])
                    ]))
                  : ($setup.tab === 'forecast')
                    ? (openBlock(), createElementBlock("section", _hoisted_18, [
                        createBaseVNode("div", _hoisted_19, [
                          createBaseVNode("div", null, [
                            _cache[19] || (_cache[19] = createBaseVNode("span", null, "规则模型 · 未来 5 日情景", -1 /* CACHED */)),
                            createBaseVNode("h2", null, toDisplayString($setup.data.forecast.score >= 62 ? "趋势偏强" : $setup.data.forecast.score <= 38 ? "趋势偏弱" : "震荡等待方向"), 1 /* TEXT */),
                            createBaseVNode("p", null, toDisplayString($setup.data.forecast.paragraph), 1 /* TEXT */)
                          ]),
                          createBaseVNode("div", _hoisted_20, [
                            createBaseVNode("strong", null, toDisplayString($setup.data.forecast.score), 1 /* TEXT */),
                            _cache[20] || (_cache[20] = createBaseVNode("small", null, "趋势分", -1 /* CACHED */))
                          ])
                        ]),
                        createBaseVNode("section", _hoisted_21, [
                          _cache[21] || (_cache[21] = createBaseVNode("div", { class: "section-heading compact" }, [
                            createBaseVNode("div", null, [
                              createBaseVNode("span", null, "SCENARIO WEIGHTS"),
                              createBaseVNode("h2", null, "情景权重")
                            ]),
                            createBaseVNode("em", null, "非概率承诺")
                          ], -1 /* CACHED */)),
                          (openBlock(true), createElementBlock(Fragment, null, renderList($setup.forecastBars, (item) => {
                            return (openBlock(), createElementBlock("div", {
                              key: item.key,
                              class: "scenario-row"
                            }, [
                              createBaseVNode("span", null, toDisplayString(item.label), 1 /* TEXT */),
                              createBaseVNode("div", null, [
                                createBaseVNode("i", {
                                  class: normalizeClass(item.tone),
                                  style: normalizeStyle({ width: `${item.value}%` })
                                }, null, 6 /* CLASS, STYLE */)
                              ]),
                              createBaseVNode("strong", {
                                class: normalizeClass(item.tone)
                              }, toDisplayString(item.value) + "%", 3 /* TEXT, CLASS */)
                            ]))
                          }), 128 /* KEYED_FRAGMENT */))
                        ]),
                        createBaseVNode("div", _hoisted_22, [
                          createBaseVNode("article", null, [
                            _cache[22] || (_cache[22] = createBaseVNode("span", null, "支撑参考", -1 /* CACHED */)),
                            createBaseVNode("strong", _hoisted_23, "¥" + toDisplayString($setup.formatPrice($setup.data.forecast.support)), 1 /* TEXT */)
                          ]),
                          createBaseVNode("article", null, [
                            _cache[23] || (_cache[23] = createBaseVNode("span", null, "阻力参考", -1 /* CACHED */)),
                            createBaseVNode("strong", _hoisted_24, "¥" + toDisplayString($setup.formatPrice($setup.data.forecast.resistance)), 1 /* TEXT */)
                          ])
                        ]),
                        createBaseVNode("section", _hoisted_25, [
                          _cache[30] || (_cache[30] = createBaseVNode("div", { class: "section-heading compact" }, [
                            createBaseVNode("div", null, [
                              createBaseVNode("span", null, "TECHNICAL SIGNALS"),
                              createBaseVNode("h2", null, "模型指标")
                            ])
                          ], -1 /* CACHED */)),
                          createBaseVNode("div", _hoisted_26, [
                            createBaseVNode("div", null, [
                              _cache[24] || (_cache[24] = createBaseVNode("span", null, "MA5", -1 /* CACHED */)),
                              createBaseVNode("strong", null, toDisplayString($setup.formatPrice($setup.data.forecast.ma5)), 1 /* TEXT */)
                            ]),
                            createBaseVNode("div", null, [
                              _cache[25] || (_cache[25] = createBaseVNode("span", null, "MA10", -1 /* CACHED */)),
                              createBaseVNode("strong", null, toDisplayString($setup.formatPrice($setup.data.forecast.ma10)), 1 /* TEXT */)
                            ]),
                            createBaseVNode("div", null, [
                              _cache[26] || (_cache[26] = createBaseVNode("span", null, "MA20", -1 /* CACHED */)),
                              createBaseVNode("strong", null, toDisplayString($setup.formatPrice($setup.data.forecast.ma20)), 1 /* TEXT */)
                            ]),
                            createBaseVNode("div", null, [
                              _cache[27] || (_cache[27] = createBaseVNode("span", null, "RSI(14)", -1 /* CACHED */)),
                              createBaseVNode("strong", null, toDisplayString(Number($setup.data.forecast.rsi || 0).toFixed(1)), 1 /* TEXT */)
                            ]),
                            createBaseVNode("div", null, [
                              _cache[28] || (_cache[28] = createBaseVNode("span", null, "MACD", -1 /* CACHED */)),
                              createBaseVNode("strong", null, toDisplayString(Number($setup.data.forecast.macd || 0).toFixed(2)), 1 /* TEXT */)
                            ]),
                            createBaseVNode("div", null, [
                              _cache[29] || (_cache[29] = createBaseVNode("span", null, "年化波动", -1 /* CACHED */)),
                              createBaseVNode("strong", null, toDisplayString(Number($setup.data.forecast.annualizedVolatility || 0).toFixed(1)) + "%", 1 /* TEXT */)
                            ])
                          ])
                        ]),
                        _cache[31] || (_cache[31] = createBaseVNode("p", { class: "research-disclaimer" }, "趋势预测由均线、RSI、MACD、动量与波动率按固定规则计算，仅用于课程演示和风险认知，不构成收益预测或投资建议。", -1 /* CACHED */))
                      ]))
                    : (openBlock(), createElementBlock("section", _hoisted_27, [
                        (!$setup.data.financial?.available)
                          ? (openBlock(), createElementBlock("div", _hoisted_28, [
                              createBaseVNode("span", null, [
                                createVNode($setup["Icon"], {
                                  name: "info",
                                  size: 24
                                })
                              ]),
                              _cache[32] || (_cache[32] = createBaseVNode("strong", null, "财务数据暂不可用", -1 /* CACHED */)),
                              _cache[33] || (_cache[33] = createBaseVNode("p", null, "这家公司可能尚未披露可用财务报告，或上游财务接口暂时波动。", -1 /* CACHED */))
                            ]))
                          : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                              createBaseVNode("div", _hoisted_29, [
                                createBaseVNode("div", null, [
                                  createBaseVNode("span", null, toDisplayString($setup.data.financial.report) + " · 截至 " + toDisplayString($setup.data.financial.noticeDate), 1 /* TEXT */),
                                  createBaseVNode("h2", null, "财务健康度 " + toDisplayString($setup.data.financial.overallScore), 1 /* TEXT */),
                                  _cache[34] || (_cache[34] = createBaseVNode("p", null, "按成长、盈利、运营、收益质量与财务风险五组公开指标综合计算。", -1 /* CACHED */))
                                ]),
                                createBaseVNode("strong", null, toDisplayString($setup.data.financial.overallScore), 1 /* TEXT */)
                              ]),
                              (openBlock(true), createElementBlock(Fragment, null, renderList($setup.data.financial.groups, (group) => {
                                return (openBlock(), createElementBlock("article", {
                                  key: group.id,
                                  class: "diagnosis-card"
                                }, [
                                  createBaseVNode("header", null, [
                                    createBaseVNode("span", null, [
                                      createVNode($setup["Icon"], {
                                        name: group.icon,
                                        size: 18
                                      }, null, 8 /* PROPS */, ["name"])
                                    ]),
                                    createBaseVNode("div", null, [
                                      createBaseVNode("strong", null, toDisplayString(group.title), 1 /* TEXT */),
                                      _cache[35] || (_cache[35] = createBaseVNode("small", null, "指标得分", -1 /* CACHED */))
                                    ]),
                                    createBaseVNode("em", null, toDisplayString(group.score ?? "—"), 1 /* TEXT */)
                                  ]),
                                  createBaseVNode("div", _hoisted_30, [
                                    createBaseVNode("i", {
                                      style: normalizeStyle({ width: `${group.score || 0}%` })
                                    }, null, 4 /* STYLE */)
                                  ]),
                                  createBaseVNode("div", _hoisted_31, [
                                    (openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (item) => {
                                      return (openBlock(), createElementBlock("div", {
                                        key: item.label
                                      }, [
                                        createBaseVNode("span", null, toDisplayString(item.label), 1 /* TEXT */),
                                        createBaseVNode("strong", null, toDisplayString(item.display), 1 /* TEXT */)
                                      ]))
                                    }), 128 /* KEYED_FRAGMENT */))
                                  ])
                                ]))
                              }), 128 /* KEYED_FRAGMENT */)),
                              _cache[36] || (_cache[36] = createBaseVNode("p", { class: "research-disclaimer" }, "财务诊断依据公司最近一期公开报告计算。不同行业财务结构差异较大，单项指标不应脱离行业背景解读。", -1 /* CACHED */))
                            ], 64 /* STABLE_FRAGMENT */))
                      ]))
              ], 64 /* STABLE_FRAGMENT */))
            : createCommentVNode("v-if", true)
    ])
  ]))
}
__sfc__$1.render = render$1;
__sfc__$1.__file = "src/views/StockResearchView.vue";

const __sfc__ = {
  __name: 'App',
  setup(__props, { expose: __expose }) {
  __expose();

const mainViews = ["home", "market", "portfolio", "insights", "profile"];
const route = reactive({ view: "home", code: null });
const history = [];
const aiOpen = ref(false);
const authOpen = ref(false);
const tradeOpen = ref(false);
const tradeStock = ref(null);
const tradeType = ref("buy");
const pickerOpen = ref(false);
const pickerMode = ref("trade");
const resetOpen = ref(false);
const toast = reactive({ visible: false, message: "" });
let toastTimer;
let autoRefreshTimer;
let competitionTimer;
let accountSaveTimer;

const showBottomNav = computed(() => mainViews.includes(route.view));
const currentStock = computed(() => getStock(route.code) || null);

function scrollAppTop() {
  document.querySelector(".app-scroll")?.scrollTo({ top: 0, behavior: "auto" });
}

function navigate(view, payload = {}) {
  history.push({ ...route });
  route.view = view;
  route.code = payload.code || (view === "detail" ? route.code : null);
  scrollAppTop();
}

function goBack() {
  const previous = history.pop() || { view: "home", code: null };
  Object.assign(route, previous);
  scrollAppTop();
}

function selectStock(stock) {
  if (!stock) return;
  const registered = registerStock(stock);
  recordRecentView(registered.code);
  navigate("detail", { code: registered.code });
  if (!registered.live) {
    refreshMarket().then((result) => {
      if (!result.ok) notify(result.message);
    });
  }
}

function openTrade(payload) {
  tradeStock.value = payload.stock;
  tradeType.value = payload.type || "buy";
  tradeOpen.value = true;
}

function openTradePicker() {
  pickerMode.value = "trade";
  pickerOpen.value = true;
}

function openWatchPicker() {
  pickerMode.value = "watch";
  pickerOpen.value = true;
}

function selectFromPicker(stock) {
  if (pickerMode.value === "trade") {
    pickerOpen.value = false;
    openTrade({ stock, type: "buy" });
  }
}

function notify(message) {
  window.clearTimeout(toastTimer);
  toast.message = message;
  toast.visible = true;
  toastTimer = window.setTimeout(() => {
    toast.visible = false;
  }, 2400);
}

function completeTrade(result) {
  notify(result.message);
  if (result.ok) syncCompetitionSnapshot().catch(() => {});
}

async function handleAuthenticated(user) {
  if (user?.portfolio) hydratePortfolioState(user.portfolio);
  authState.user = user;
  authState.online = true;
  accountSaveTimer && window.clearTimeout(accountSaveTimer);
  await refreshMarket({ includeSectors: true });
  syncCompetitionSnapshot().catch(() => {});
}

async function handleLogout() {
  await logoutAccount();
  setSavedCompetitionCode("");
  resetPortfolio();
  resetMarketPrices();
  notify("已退出账号，已切回默认本地模拟账户");
}

function resetDemo() {
  resetPortfolio();
  resetMarketPrices();
  resetOpen.value = false;
  navigate("home");
  notify("模拟账户与行情已重置");
}

function handleEscape(event) {
  if (event.key !== "Escape") return;
  if (tradeOpen.value) tradeOpen.value = false;
  else if (aiOpen.value) aiOpen.value = false;
  else if (authOpen.value) authOpen.value = false;
  else if (resetOpen.value) resetOpen.value = false;
}

function applyAutoRefresh() {
  window.clearInterval(autoRefreshTimer);
  if (!portfolio.settings.autoRefresh) return;
  const interval = Math.max(8, Number(portfolio.settings.refreshSeconds) || 15) * 1000;
  autoRefreshTimer = window.setInterval(() => {
    if (document.visibilityState === "visible" && tradingStatus.value.phase === "trading") {
      refreshMarket();
    }
  }, interval);
}

function refreshOnVisible() {
  if (document.visibilityState === "visible" && tradingStatus.value.phase === "trading") refreshMarket();
}

function persistAccountState() {
  if (!authState.user) return;
  saveUserState(JSON.parse(JSON.stringify(portfolio)), {
    ...buildPortfolioSummary(),
  }).catch(() => {});
}

function flushAccountState() {
  window.clearTimeout(accountSaveTimer);
  persistAccountState();
}

watch(
  () => [portfolio.settings.autoRefresh, portfolio.settings.refreshSeconds],
  applyAutoRefresh,
);

watch(unreadNotificationCount, (count, previous) => {
  if (count > previous) notify("有一条价格提醒已触发");
});

watch(
  portfolio,
  () => {
    if (!authState.user) return;
    window.clearTimeout(accountSaveTimer);
    accountSaveTimer = window.setTimeout(persistAccountState, 900);
  },
  { deep: true },
);

onMounted(async () => {
  window.addEventListener("keydown", handleEscape);
  document.addEventListener("visibilitychange", refreshOnVisible);
  window.addEventListener("pagehide", flushAccountState);
  const restoredUser = await restoreSession();
  if (restoredUser?.portfolio) hydratePortfolioState(restoredUser.portfolio);
  else setSavedCompetitionCode("");
  await refreshMarket({ includeSectors: true });
  applyAutoRefresh();
  competitionTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") syncCompetitionSnapshot().catch(() => {});
  }, 12000);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleEscape);
  document.removeEventListener("visibilitychange", refreshOnVisible);
  window.removeEventListener("pagehide", flushAccountState);
  window.clearTimeout(toastTimer);
  window.clearInterval(autoRefreshTimer);
  window.clearInterval(competitionTimer);
  window.clearTimeout(accountSaveTimer);
});

const __returned__ = { mainViews, route, history, aiOpen, authOpen, tradeOpen, tradeStock, tradeType, pickerOpen, pickerMode, resetOpen, toast, get toastTimer() { return toastTimer }, set toastTimer(v) { toastTimer = v; }, get autoRefreshTimer() { return autoRefreshTimer }, set autoRefreshTimer(v) { autoRefreshTimer = v; }, get competitionTimer() { return competitionTimer }, set competitionTimer(v) { competitionTimer = v; }, get accountSaveTimer() { return accountSaveTimer }, set accountSaveTimer(v) { accountSaveTimer = v; }, showBottomNav, currentStock, scrollAppTop, navigate, goBack, selectStock, openTrade, openTradePicker, openWatchPicker, selectFromPicker, notify, completeTrade, handleAuthenticated, handleLogout, resetDemo, handleEscape, applyAutoRefresh, refreshOnVisible, persistAccountState, flushAccountState, computed, onBeforeUnmount, onMounted, reactive, ref, watch, AiSheet: __sfc__$m, AuthSheet: __sfc__$l, BottomNav: __sfc__$k, Icon: __sfc__$n, StockPickerSheet: __sfc__$j, TradeSheet: __sfc__$i, get buildPortfolioSummary() { return buildPortfolioSummary }, get getStock() { return getStock }, get hydratePortfolioState() { return hydratePortfolioState }, get portfolio() { return portfolio }, get recordRecentView() { return recordRecentView }, get refreshMarket() { return refreshMarket }, get registerStock() { return registerStock }, get resetMarketPrices() { return resetMarketPrices }, get resetPortfolio() { return resetPortfolio }, get tradingStatus() { return tradingStatus }, get unreadNotificationCount() { return unreadNotificationCount }, get authState() { return authState }, get logoutAccount() { return logoutAccount }, get restoreSession() { return restoreSession }, get saveUserState() { return saveUserState }, get resolvedTheme() { return resolvedTheme }, get setThemeMode() { return setThemeMode }, get themeMode() { return themeMode }, get toggleTheme() { return toggleTheme }, get setSavedCompetitionCode() { return setSavedCompetitionCode }, get syncCompetitionSnapshot() { return syncCompetitionSnapshot }, AlertsView: __sfc__$h, CompetitionView: __sfc__$e, HomeView: __sfc__$b, InsightsView: __sfc__$a, MarketView: __sfc__$9, PortfolioView: __sfc__$8, PortfolioReportView: __sfc__$7, ProfileView: __sfc__$6, SearchView: __sfc__$5, StockDetailView: __sfc__$2, StockResearchView: __sfc__$1 };
Object.defineProperty(__returned__, '__isScriptSetup', { enumerable: false, value: true });
return __returned__
}

};

const _hoisted_1 = { class: "app-stage" };
const _hoisted_2 = { class: "phone-shell" };
const _hoisted_3 = { class: "app-scroll" };
const _hoisted_4 = {
  key: 11,
  class: "page fallback-page"
};
const _hoisted_5 = {
  key: 0,
  class: "toast-message",
  role: "status"
};
const _hoisted_6 = {
  class: "confirm-modal",
  role: "alertdialog",
  "aria-modal": "true"
};
const _hoisted_7 = { class: "confirm-icon" };

function render(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("div", _hoisted_1, [
    _cache[23] || (_cache[23] = createBaseVNode("div", { class: "ambient ambient-one" }, null, -1 /* CACHED */)),
    _cache[24] || (_cache[24] = createBaseVNode("div", { class: "ambient ambient-two" }, null, -1 /* CACHED */)),
    createBaseVNode("div", _hoisted_2, [
      createBaseVNode("div", _hoisted_3, [
        ($setup.route.view === 'home')
          ? (openBlock(), createBlock($setup["HomeView"], {
              key: 0,
              onNavigate: $setup.navigate,
              onSelectStock: $setup.selectStock,
              onOpenAi: _cache[0] || (_cache[0] = $event => ($setup.aiOpen = true)),
              onOpenAlerts: _cache[1] || (_cache[1] = $event => ($setup.navigate('alerts'))),
              onOpenWatchPicker: $setup.openWatchPicker,
              onNotify: $setup.notify
            }))
          : ($setup.route.view === 'market')
            ? (openBlock(), createBlock($setup["MarketView"], {
                key: 1,
                onNavigate: $setup.navigate,
                onSelectStock: $setup.selectStock,
                onOpenAi: _cache[2] || (_cache[2] = $event => ($setup.aiOpen = true)),
                onOpenAlerts: _cache[3] || (_cache[3] = $event => ($setup.navigate('alerts'))),
                onOpenWatchPicker: $setup.openWatchPicker,
                onNotify: $setup.notify
              }))
            : ($setup.route.view === 'portfolio')
              ? (openBlock(), createBlock($setup["PortfolioView"], {
                  key: 2,
                  onNavigate: $setup.navigate,
                  onSelectStock: $setup.selectStock,
                  onOpenAi: _cache[4] || (_cache[4] = $event => ($setup.aiOpen = true)),
                  onOpenTrade: $setup.openTrade,
                  onOpenTradePicker: $setup.openTradePicker,
                  onOpenReport: _cache[5] || (_cache[5] = $event => ($setup.navigate('report'))),
                  onNotify: $setup.notify
                }))
              : ($setup.route.view === 'report')
                ? (openBlock(), createBlock($setup["PortfolioReportView"], {
                    key: 3,
                    onBack: $setup.goBack,
                    onNotify: $setup.notify
                  }))
                : ($setup.route.view === 'insights')
                  ? (openBlock(), createBlock($setup["InsightsView"], {
                      key: 4,
                      onNavigate: $setup.navigate,
                      onOpenAi: _cache[6] || (_cache[6] = $event => ($setup.aiOpen = true))
                    }))
                  : ($setup.route.view === 'profile')
                    ? (openBlock(), createBlock($setup["ProfileView"], {
                        key: 5,
                        onNotify: $setup.notify,
                        onNavigate: $setup.navigate,
                        onReset: _cache[7] || (_cache[7] = $event => ($setup.resetOpen = true)),
                        "theme-mode": $setup.themeMode,
                        "resolved-theme": $setup.resolvedTheme,
                        "auth-user": $setup.authState.user,
                        "auth-online": $setup.authState.online,
                        onSetTheme: $setup.setThemeMode,
                        onToggleTheme: $setup.toggleTheme,
                        onOpenAuth: _cache[8] || (_cache[8] = $event => ($setup.authOpen = true)),
                        onLogout: $setup.handleLogout
                      }, null, 8 /* PROPS */, ["theme-mode", "resolved-theme", "auth-user", "auth-online", "onSetTheme", "onToggleTheme"]))
                    : ($setup.route.view === 'search')
                      ? (openBlock(), createBlock($setup["SearchView"], {
                          key: 6,
                          onBack: $setup.goBack,
                          onSelectStock: $setup.selectStock
                        }))
                      : ($setup.route.view === 'detail' && $setup.currentStock)
                        ? (openBlock(), createBlock($setup["StockDetailView"], {
                            key: 7,
                            stock: $setup.currentStock,
                            onBack: $setup.goBack,
                            onOpenTrade: $setup.openTrade,
                            onOpenAi: _cache[9] || (_cache[9] = $event => ($setup.aiOpen = true)),
                            onOpenAlerts: _cache[10] || (_cache[10] = $event => ($setup.navigate('alerts'))),
                            onOpenResearch: _cache[11] || (_cache[11] = $event => ($setup.navigate('research', { code: $setup.currentStock.code }))),
                            onNotify: $setup.notify
                          }, null, 8 /* PROPS */, ["stock"]))
                        : ($setup.route.view === 'research' && $setup.currentStock)
                          ? (openBlock(), createBlock($setup["StockResearchView"], {
                              key: 8,
                              stock: $setup.currentStock,
                              onBack: $setup.goBack,
                              onNotify: $setup.notify
                            }, null, 8 /* PROPS */, ["stock"]))
                          : ($setup.route.view === 'competition')
                            ? (openBlock(), createBlock($setup["CompetitionView"], {
                                key: 9,
                                onBack: $setup.goBack,
                                onOpenAuth: _cache[12] || (_cache[12] = $event => ($setup.authOpen = true)),
                                onNotify: $setup.notify
                              }))
                            : ($setup.route.view === 'alerts')
                              ? (openBlock(), createBlock($setup["AlertsView"], {
                                  key: 10,
                                  onBack: $setup.goBack,
                                  onSelectStock: $setup.selectStock,
                                  onNotify: $setup.notify
                                }))
                              : (openBlock(), createElementBlock("div", _hoisted_4, [
                                  createBaseVNode("span", null, [
                                    createVNode($setup["Icon"], {
                                      name: "search",
                                      size: 26
                                    })
                                  ]),
                                  _cache[20] || (_cache[20] = createBaseVNode("h1", null, "没有找到该标的", -1 /* CACHED */)),
                                  createBaseVNode("button", {
                                    type: "button",
                                    class: "primary-button",
                                    onClick: _cache[13] || (_cache[13] = $event => ($setup.navigate('home')))
                                  }, "返回首页")
                                ]))
      ]),
      ($setup.showBottomNav)
        ? (openBlock(), createBlock($setup["BottomNav"], {
            key: 0,
            active: $setup.route.view,
            onNavigate: $setup.navigate
          }, null, 8 /* PROPS */, ["active"]))
        : createCommentVNode("v-if", true)
    ]),
    createVNode(Transition, { name: "toast" }, {
      default: withCtx(() => [
        ($setup.toast.visible)
          ? (openBlock(), createElementBlock("div", _hoisted_5, [
              createVNode($setup["Icon"], {
                name: "check",
                size: 16
              }),
              createTextVNode(" " + toDisplayString($setup.toast.message), 1 /* TEXT */)
            ]))
          : createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    }),
    createVNode($setup["TradeSheet"], {
      open: $setup.tradeOpen,
      stock: $setup.tradeStock,
      "initial-type": $setup.tradeType,
      cash: $setup.portfolio.cash,
      onClose: _cache[14] || (_cache[14] = $event => ($setup.tradeOpen = false)),
      onComplete: $setup.completeTrade
    }, null, 8 /* PROPS */, ["open", "stock", "initial-type", "cash"]),
    createVNode($setup["StockPickerSheet"], {
      open: $setup.pickerOpen,
      mode: $setup.pickerMode,
      onClose: _cache[15] || (_cache[15] = $event => ($setup.pickerOpen = false)),
      onSelect: $setup.selectFromPicker,
      onNotify: $setup.notify
    }, null, 8 /* PROPS */, ["open", "mode"]),
    createVNode($setup["AiSheet"], {
      open: $setup.aiOpen,
      onClose: _cache[16] || (_cache[16] = $event => ($setup.aiOpen = false)),
      onNotify: $setup.notify
    }, null, 8 /* PROPS */, ["open"]),
    createVNode($setup["AuthSheet"], {
      open: $setup.authOpen,
      onClose: _cache[17] || (_cache[17] = $event => ($setup.authOpen = false)),
      onAuthenticated: $setup.handleAuthenticated,
      onNotify: $setup.notify
    }, null, 8 /* PROPS */, ["open"]),
    createVNode(Transition, { name: "fade" }, {
      default: withCtx(() => [
        ($setup.resetOpen)
          ? (openBlock(), createElementBlock("div", {
              key: 0,
              class: "confirm-backdrop",
              onClick: _cache[19] || (_cache[19] = withModifiers($event => ($setup.resetOpen = false), ["self"]))
            }, [
              createBaseVNode("section", _hoisted_6, [
                createBaseVNode("span", _hoisted_7, [
                  createVNode($setup["Icon"], {
                    name: "refresh",
                    size: 21
                  })
                ]),
                _cache[21] || (_cache[21] = createBaseVNode("h2", null, "重置演示账户？", -1 /* CACHED */)),
                _cache[22] || (_cache[22] = createBaseVNode("p", null, "交易记录、自选列表和模拟资金将恢复初始状态。此操作不会删除浏览器之外的数据。", -1 /* CACHED */)),
                createBaseVNode("div", null, [
                  createBaseVNode("button", {
                    type: "button",
                    class: "secondary-button",
                    onClick: _cache[18] || (_cache[18] = $event => ($setup.resetOpen = false))
                  }, "取消"),
                  createBaseVNode("button", {
                    type: "button",
                    class: "primary-button",
                    onClick: $setup.resetDemo
                  }, "确认重置")
                ])
              ])
            ]))
          : createCommentVNode("v-if", true)
      ]),
      _: 1 /* STABLE */
    })
  ]))
}
__sfc__.render = render;
__sfc__.__file = "src/App.vue";

createApp(__sfc__).mount("#app");

var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
class ActorPTR2e extends Actor {
  static {
    __name(this, "ActorPTR2e");
  }
  get traits() {
    return this.system.traits;
  }
  get attributes() {
    return this.system.attributes;
  }
  /** 
   * Step 1 - Copies data from source object to instance attributes
   * */
  _initialize() {
    return super._initialize();
  }
  /** 
   * Step 2 - Prepare data for use by the instance. This method is called automatically by DataModel#_initialize workflow
   * The work done by this method should be idempotent. There are situations in which prepareData may be called more than once.
   * */
  prepareData() {
    this.health = {
      percent: Math.floor(Math.random() * 100)
    };
    return super.prepareData();
  }
  /**
   * Step 3 - Prepare data related to this Document itself, before any embedded Documents or derived data is computed.
   * */
  prepareBaseData() {
    return super.prepareBaseData();
  }
  /** 
   * Step 4 - Prepare all embedded Document instances which exist within this primary Document.
   * */
  prepareEmbeddedDocuments() {
    return super.prepareEmbeddedDocuments();
  }
  /** 
   * Step 5 - Apply transformations or derivations to the values of the source data object.
   * Compute data fields whose values are not stored to the database.
   * */
  prepareDerivedData() {
    return super.prepareDerivedData();
  }
  /**
   * Toggle the perk tree for this actor
   * @param {boolean} active 
   */
  async togglePerkTree(active) {
    if (game.ptr.tree.actor === this && active !== true)
      return game.ptr.tree.close();
    else if (active !== false)
      return game.ptr.tree.open(this);
  }
}
/*!
 * @kurkle/color v0.3.2
 * https://github.com/kurkle/color#readme
 * (c) 2023 Jukka Kurkela
 * Released under the MIT License
 */
function round(v) {
  return v + 0.5 | 0;
}
__name(round, "round");
const lim = /* @__PURE__ */ __name((v, l, h) => Math.max(Math.min(v, h), l), "lim");
function p2b(v) {
  return lim(round(v * 2.55), 0, 255);
}
__name(p2b, "p2b");
function n2b(v) {
  return lim(round(v * 255), 0, 255);
}
__name(n2b, "n2b");
function b2n(v) {
  return lim(round(v / 2.55) / 100, 0, 1);
}
__name(b2n, "b2n");
function n2p(v) {
  return lim(round(v * 100), 0, 100);
}
__name(n2p, "n2p");
const map$1 = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, A: 10, B: 11, C: 12, D: 13, E: 14, F: 15, a: 10, b: 11, c: 12, d: 13, e: 14, f: 15 };
const hex = [..."0123456789ABCDEF"];
const h1 = /* @__PURE__ */ __name((b) => hex[b & 15], "h1");
const h2 = /* @__PURE__ */ __name((b) => hex[(b & 240) >> 4] + hex[b & 15], "h2");
const eq = /* @__PURE__ */ __name((b) => (b & 240) >> 4 === (b & 15), "eq");
const isShort = /* @__PURE__ */ __name((v) => eq(v.r) && eq(v.g) && eq(v.b) && eq(v.a), "isShort");
function hexParse(str) {
  var len = str.length;
  var ret;
  if (str[0] === "#") {
    if (len === 4 || len === 5) {
      ret = {
        r: 255 & map$1[str[1]] * 17,
        g: 255 & map$1[str[2]] * 17,
        b: 255 & map$1[str[3]] * 17,
        a: len === 5 ? map$1[str[4]] * 17 : 255
      };
    } else if (len === 7 || len === 9) {
      ret = {
        r: map$1[str[1]] << 4 | map$1[str[2]],
        g: map$1[str[3]] << 4 | map$1[str[4]],
        b: map$1[str[5]] << 4 | map$1[str[6]],
        a: len === 9 ? map$1[str[7]] << 4 | map$1[str[8]] : 255
      };
    }
  }
  return ret;
}
__name(hexParse, "hexParse");
const alpha = /* @__PURE__ */ __name((a, f) => a < 255 ? f(a) : "", "alpha");
function hexString(v) {
  var f = isShort(v) ? h1 : h2;
  return v ? "#" + f(v.r) + f(v.g) + f(v.b) + alpha(v.a, f) : void 0;
}
__name(hexString, "hexString");
const HUE_RE = /^(hsla?|hwb|hsv)\(\s*([-+.e\d]+)(?:deg)?[\s,]+([-+.e\d]+)%[\s,]+([-+.e\d]+)%(?:[\s,]+([-+.e\d]+)(%)?)?\s*\)$/;
function hsl2rgbn(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = /* @__PURE__ */ __name((n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1), "f");
  return [f(0), f(8), f(4)];
}
__name(hsl2rgbn, "hsl2rgbn");
function hsv2rgbn(h, s, v) {
  const f = /* @__PURE__ */ __name((n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0), "f");
  return [f(5), f(3), f(1)];
}
__name(hsv2rgbn, "hsv2rgbn");
function hwb2rgbn(h, w, b) {
  const rgb = hsl2rgbn(h, 1, 0.5);
  let i;
  if (w + b > 1) {
    i = 1 / (w + b);
    w *= i;
    b *= i;
  }
  for (i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}
__name(hwb2rgbn, "hwb2rgbn");
function hueValue(r, g, b, d, max) {
  if (r === max) {
    return (g - b) / d + (g < b ? 6 : 0);
  }
  if (g === max) {
    return (b - r) / d + 2;
  }
  return (r - g) / d + 4;
}
__name(hueValue, "hueValue");
function rgb2hsl(v) {
  const range = 255;
  const r = v.r / range;
  const g = v.g / range;
  const b = v.b / range;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h, s, d;
  if (max !== min) {
    d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = hueValue(r, g, b, d, max);
    h = h * 60 + 0.5;
  }
  return [h | 0, s || 0, l];
}
__name(rgb2hsl, "rgb2hsl");
function calln(f, a, b, c) {
  return (Array.isArray(a) ? f(a[0], a[1], a[2]) : f(a, b, c)).map(n2b);
}
__name(calln, "calln");
function hsl2rgb(h, s, l) {
  return calln(hsl2rgbn, h, s, l);
}
__name(hsl2rgb, "hsl2rgb");
function hwb2rgb(h, w, b) {
  return calln(hwb2rgbn, h, w, b);
}
__name(hwb2rgb, "hwb2rgb");
function hsv2rgb(h, s, v) {
  return calln(hsv2rgbn, h, s, v);
}
__name(hsv2rgb, "hsv2rgb");
function hue(h) {
  return (h % 360 + 360) % 360;
}
__name(hue, "hue");
function hueParse(str) {
  const m = HUE_RE.exec(str);
  let a = 255;
  let v;
  if (!m) {
    return;
  }
  if (m[5] !== v) {
    a = m[6] ? p2b(+m[5]) : n2b(+m[5]);
  }
  const h = hue(+m[2]);
  const p1 = +m[3] / 100;
  const p2 = +m[4] / 100;
  if (m[1] === "hwb") {
    v = hwb2rgb(h, p1, p2);
  } else if (m[1] === "hsv") {
    v = hsv2rgb(h, p1, p2);
  } else {
    v = hsl2rgb(h, p1, p2);
  }
  return {
    r: v[0],
    g: v[1],
    b: v[2],
    a
  };
}
__name(hueParse, "hueParse");
function rotate(v, deg) {
  var h = rgb2hsl(v);
  h[0] = hue(h[0] + deg);
  h = hsl2rgb(h);
  v.r = h[0];
  v.g = h[1];
  v.b = h[2];
}
__name(rotate, "rotate");
function hslString(v) {
  if (!v) {
    return;
  }
  const a = rgb2hsl(v);
  const h = a[0];
  const s = n2p(a[1]);
  const l = n2p(a[2]);
  return v.a < 255 ? `hsla(${h}, ${s}%, ${l}%, ${b2n(v.a)})` : `hsl(${h}, ${s}%, ${l}%)`;
}
__name(hslString, "hslString");
const map$2 = {
  x: "dark",
  Z: "light",
  Y: "re",
  X: "blu",
  W: "gr",
  V: "medium",
  U: "slate",
  A: "ee",
  T: "ol",
  S: "or",
  B: "ra",
  C: "lateg",
  D: "ights",
  R: "in",
  Q: "turquois",
  E: "hi",
  P: "ro",
  O: "al",
  N: "le",
  M: "de",
  L: "yello",
  F: "en",
  K: "ch",
  G: "arks",
  H: "ea",
  I: "ightg",
  J: "wh"
};
const names$1 = {
  OiceXe: "f0f8ff",
  antiquewEte: "faebd7",
  aqua: "ffff",
  aquamarRe: "7fffd4",
  azuY: "f0ffff",
  beige: "f5f5dc",
  bisque: "ffe4c4",
  black: "0",
  blanKedOmond: "ffebcd",
  Xe: "ff",
  XeviTet: "8a2be2",
  bPwn: "a52a2a",
  burlywood: "deb887",
  caMtXe: "5f9ea0",
  KartYuse: "7fff00",
  KocTate: "d2691e",
  cSO: "ff7f50",
  cSnflowerXe: "6495ed",
  cSnsilk: "fff8dc",
  crimson: "dc143c",
  cyan: "ffff",
  xXe: "8b",
  xcyan: "8b8b",
  xgTMnPd: "b8860b",
  xWay: "a9a9a9",
  xgYF: "6400",
  xgYy: "a9a9a9",
  xkhaki: "bdb76b",
  xmagFta: "8b008b",
  xTivegYF: "556b2f",
  xSange: "ff8c00",
  xScEd: "9932cc",
  xYd: "8b0000",
  xsOmon: "e9967a",
  xsHgYF: "8fbc8f",
  xUXe: "483d8b",
  xUWay: "2f4f4f",
  xUgYy: "2f4f4f",
  xQe: "ced1",
  xviTet: "9400d3",
  dAppRk: "ff1493",
  dApskyXe: "bfff",
  dimWay: "696969",
  dimgYy: "696969",
  dodgerXe: "1e90ff",
  fiYbrick: "b22222",
  flSOwEte: "fffaf0",
  foYstWAn: "228b22",
  fuKsia: "ff00ff",
  gaRsbSo: "dcdcdc",
  ghostwEte: "f8f8ff",
  gTd: "ffd700",
  gTMnPd: "daa520",
  Way: "808080",
  gYF: "8000",
  gYFLw: "adff2f",
  gYy: "808080",
  honeyMw: "f0fff0",
  hotpRk: "ff69b4",
  RdianYd: "cd5c5c",
  Rdigo: "4b0082",
  ivSy: "fffff0",
  khaki: "f0e68c",
  lavFMr: "e6e6fa",
  lavFMrXsh: "fff0f5",
  lawngYF: "7cfc00",
  NmoncEffon: "fffacd",
  ZXe: "add8e6",
  ZcSO: "f08080",
  Zcyan: "e0ffff",
  ZgTMnPdLw: "fafad2",
  ZWay: "d3d3d3",
  ZgYF: "90ee90",
  ZgYy: "d3d3d3",
  ZpRk: "ffb6c1",
  ZsOmon: "ffa07a",
  ZsHgYF: "20b2aa",
  ZskyXe: "87cefa",
  ZUWay: "778899",
  ZUgYy: "778899",
  ZstAlXe: "b0c4de",
  ZLw: "ffffe0",
  lime: "ff00",
  limegYF: "32cd32",
  lRF: "faf0e6",
  magFta: "ff00ff",
  maPon: "800000",
  VaquamarRe: "66cdaa",
  VXe: "cd",
  VScEd: "ba55d3",
  VpurpN: "9370db",
  VsHgYF: "3cb371",
  VUXe: "7b68ee",
  VsprRggYF: "fa9a",
  VQe: "48d1cc",
  VviTetYd: "c71585",
  midnightXe: "191970",
  mRtcYam: "f5fffa",
  mistyPse: "ffe4e1",
  moccasR: "ffe4b5",
  navajowEte: "ffdead",
  navy: "80",
  Tdlace: "fdf5e6",
  Tive: "808000",
  TivedBb: "6b8e23",
  Sange: "ffa500",
  SangeYd: "ff4500",
  ScEd: "da70d6",
  pOegTMnPd: "eee8aa",
  pOegYF: "98fb98",
  pOeQe: "afeeee",
  pOeviTetYd: "db7093",
  papayawEp: "ffefd5",
  pHKpuff: "ffdab9",
  peru: "cd853f",
  pRk: "ffc0cb",
  plum: "dda0dd",
  powMrXe: "b0e0e6",
  purpN: "800080",
  YbeccapurpN: "663399",
  Yd: "ff0000",
  Psybrown: "bc8f8f",
  PyOXe: "4169e1",
  saddNbPwn: "8b4513",
  sOmon: "fa8072",
  sandybPwn: "f4a460",
  sHgYF: "2e8b57",
  sHshell: "fff5ee",
  siFna: "a0522d",
  silver: "c0c0c0",
  skyXe: "87ceeb",
  UXe: "6a5acd",
  UWay: "708090",
  UgYy: "708090",
  snow: "fffafa",
  sprRggYF: "ff7f",
  stAlXe: "4682b4",
  tan: "d2b48c",
  teO: "8080",
  tEstN: "d8bfd8",
  tomato: "ff6347",
  Qe: "40e0d0",
  viTet: "ee82ee",
  JHt: "f5deb3",
  wEte: "ffffff",
  wEtesmoke: "f5f5f5",
  Lw: "ffff00",
  LwgYF: "9acd32"
};
function unpack() {
  const unpacked = {};
  const keys = Object.keys(names$1);
  const tkeys = Object.keys(map$2);
  let i, j, k, ok, nk;
  for (i = 0; i < keys.length; i++) {
    ok = nk = keys[i];
    for (j = 0; j < tkeys.length; j++) {
      k = tkeys[j];
      nk = nk.replace(k, map$2[k]);
    }
    k = parseInt(names$1[ok], 16);
    unpacked[nk] = [k >> 16 & 255, k >> 8 & 255, k & 255];
  }
  return unpacked;
}
__name(unpack, "unpack");
let names;
function nameParse(str) {
  if (!names) {
    names = unpack();
    names.transparent = [0, 0, 0, 0];
  }
  const a = names[str.toLowerCase()];
  return a && {
    r: a[0],
    g: a[1],
    b: a[2],
    a: a.length === 4 ? a[3] : 255
  };
}
__name(nameParse, "nameParse");
const RGB_RE = /^rgba?\(\s*([-+.\d]+)(%)?[\s,]+([-+.e\d]+)(%)?[\s,]+([-+.e\d]+)(%)?(?:[\s,/]+([-+.e\d]+)(%)?)?\s*\)$/;
function rgbParse(str) {
  const m = RGB_RE.exec(str);
  let a = 255;
  let r, g, b;
  if (!m) {
    return;
  }
  if (m[7] !== r) {
    const v = +m[7];
    a = m[8] ? p2b(v) : lim(v * 255, 0, 255);
  }
  r = +m[1];
  g = +m[3];
  b = +m[5];
  r = 255 & (m[2] ? p2b(r) : lim(r, 0, 255));
  g = 255 & (m[4] ? p2b(g) : lim(g, 0, 255));
  b = 255 & (m[6] ? p2b(b) : lim(b, 0, 255));
  return {
    r,
    g,
    b,
    a
  };
}
__name(rgbParse, "rgbParse");
function rgbString(v) {
  return v && (v.a < 255 ? `rgba(${v.r}, ${v.g}, ${v.b}, ${b2n(v.a)})` : `rgb(${v.r}, ${v.g}, ${v.b})`);
}
__name(rgbString, "rgbString");
const to = /* @__PURE__ */ __name((v) => v <= 31308e-7 ? v * 12.92 : Math.pow(v, 1 / 2.4) * 1.055 - 0.055, "to");
const from = /* @__PURE__ */ __name((v) => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4), "from");
function interpolate$1(rgb1, rgb2, t) {
  const r = from(b2n(rgb1.r));
  const g = from(b2n(rgb1.g));
  const b = from(b2n(rgb1.b));
  return {
    r: n2b(to(r + t * (from(b2n(rgb2.r)) - r))),
    g: n2b(to(g + t * (from(b2n(rgb2.g)) - g))),
    b: n2b(to(b + t * (from(b2n(rgb2.b)) - b))),
    a: rgb1.a + t * (rgb2.a - rgb1.a)
  };
}
__name(interpolate$1, "interpolate$1");
function modHSL(v, i, ratio) {
  if (v) {
    let tmp = rgb2hsl(v);
    tmp[i] = Math.max(0, Math.min(tmp[i] + tmp[i] * ratio, i === 0 ? 360 : 1));
    tmp = hsl2rgb(tmp);
    v.r = tmp[0];
    v.g = tmp[1];
    v.b = tmp[2];
  }
}
__name(modHSL, "modHSL");
function clone$1(v, proto) {
  return v ? Object.assign(proto || {}, v) : v;
}
__name(clone$1, "clone$1");
function fromObject(input) {
  var v = { r: 0, g: 0, b: 0, a: 255 };
  if (Array.isArray(input)) {
    if (input.length >= 3) {
      v = { r: input[0], g: input[1], b: input[2], a: 255 };
      if (input.length > 3) {
        v.a = n2b(input[3]);
      }
    }
  } else {
    v = clone$1(input, { r: 0, g: 0, b: 0, a: 1 });
    v.a = n2b(v.a);
  }
  return v;
}
__name(fromObject, "fromObject");
function functionParse(str) {
  if (str.charAt(0) === "r") {
    return rgbParse(str);
  }
  return hueParse(str);
}
__name(functionParse, "functionParse");
class Color {
  static {
    __name(this, "Color");
  }
  constructor(input) {
    if (input instanceof Color) {
      return input;
    }
    const type = typeof input;
    let v;
    if (type === "object") {
      v = fromObject(input);
    } else if (type === "string") {
      v = hexParse(input) || nameParse(input) || functionParse(input);
    }
    this._rgb = v;
    this._valid = !!v;
  }
  get valid() {
    return this._valid;
  }
  get rgb() {
    var v = clone$1(this._rgb);
    if (v) {
      v.a = b2n(v.a);
    }
    return v;
  }
  set rgb(obj) {
    this._rgb = fromObject(obj);
  }
  rgbString() {
    return this._valid ? rgbString(this._rgb) : void 0;
  }
  hexString() {
    return this._valid ? hexString(this._rgb) : void 0;
  }
  hslString() {
    return this._valid ? hslString(this._rgb) : void 0;
  }
  mix(color2, weight) {
    if (color2) {
      const c1 = this.rgb;
      const c2 = color2.rgb;
      let w2;
      const p = weight === w2 ? 0.5 : weight;
      const w = 2 * p - 1;
      const a = c1.a - c2.a;
      const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
      w2 = 1 - w1;
      c1.r = 255 & w1 * c1.r + w2 * c2.r + 0.5;
      c1.g = 255 & w1 * c1.g + w2 * c2.g + 0.5;
      c1.b = 255 & w1 * c1.b + w2 * c2.b + 0.5;
      c1.a = p * c1.a + (1 - p) * c2.a;
      this.rgb = c1;
    }
    return this;
  }
  interpolate(color2, t) {
    if (color2) {
      this._rgb = interpolate$1(this._rgb, color2._rgb, t);
    }
    return this;
  }
  clone() {
    return new Color(this.rgb);
  }
  alpha(a) {
    this._rgb.a = n2b(a);
    return this;
  }
  clearer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 - ratio;
    return this;
  }
  greyscale() {
    const rgb = this._rgb;
    const val = round(rgb.r * 0.3 + rgb.g * 0.59 + rgb.b * 0.11);
    rgb.r = rgb.g = rgb.b = val;
    return this;
  }
  opaquer(ratio) {
    const rgb = this._rgb;
    rgb.a *= 1 + ratio;
    return this;
  }
  negate() {
    const v = this._rgb;
    v.r = 255 - v.r;
    v.g = 255 - v.g;
    v.b = 255 - v.b;
    return this;
  }
  lighten(ratio) {
    modHSL(this._rgb, 2, ratio);
    return this;
  }
  darken(ratio) {
    modHSL(this._rgb, 2, -ratio);
    return this;
  }
  saturate(ratio) {
    modHSL(this._rgb, 1, ratio);
    return this;
  }
  desaturate(ratio) {
    modHSL(this._rgb, 1, -ratio);
    return this;
  }
  rotate(deg) {
    rotate(this._rgb, deg);
    return this;
  }
}
/*!
 * Chart.js v4.4.1
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */
function noop() {
}
__name(noop, "noop");
const uid = /* @__PURE__ */ (() => {
  let id = 0;
  return () => id++;
})();
function isNullOrUndef(value) {
  return value === null || typeof value === "undefined";
}
__name(isNullOrUndef, "isNullOrUndef");
function isArray(value) {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === "[object" && type.slice(-6) === "Array]") {
    return true;
  }
  return false;
}
__name(isArray, "isArray");
function isObject(value) {
  return value !== null && Object.prototype.toString.call(value) === "[object Object]";
}
__name(isObject, "isObject");
function isNumberFinite(value) {
  return (typeof value === "number" || value instanceof Number) && isFinite(+value);
}
__name(isNumberFinite, "isNumberFinite");
function finiteOrDefault(value, defaultValue) {
  return isNumberFinite(value) ? value : defaultValue;
}
__name(finiteOrDefault, "finiteOrDefault");
function valueOrDefault(value, defaultValue) {
  return typeof value === "undefined" ? defaultValue : value;
}
__name(valueOrDefault, "valueOrDefault");
const toPercentage = /* @__PURE__ */ __name((value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 : +value / dimension, "toPercentage");
const toDimension = /* @__PURE__ */ __name((value, dimension) => typeof value === "string" && value.endsWith("%") ? parseFloat(value) / 100 * dimension : +value, "toDimension");
function callback(fn, args, thisArg) {
  if (fn && typeof fn.call === "function") {
    return fn.apply(thisArg, args);
  }
}
__name(callback, "callback");
function each(loopable, fn, thisArg, reverse) {
  let i, len, keys;
  if (isArray(loopable)) {
    len = loopable.length;
    if (reverse) {
      for (i = len - 1; i >= 0; i--) {
        fn.call(thisArg, loopable[i], i);
      }
    } else {
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[i], i);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, loopable[keys[i]], keys[i]);
    }
  }
}
__name(each, "each");
function _elementsEqual(a0, a1) {
  let i, ilen, v0, v1;
  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }
  for (i = 0, ilen = a0.length; i < ilen; ++i) {
    v0 = a0[i];
    v1 = a1[i];
    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }
  return true;
}
__name(_elementsEqual, "_elementsEqual");
function clone(source) {
  if (isArray(source)) {
    return source.map(clone);
  }
  if (isObject(source)) {
    const target = /* @__PURE__ */ Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k = 0;
    for (; k < klen; ++k) {
      target[keys[k]] = clone(source[keys[k]]);
    }
    return target;
  }
  return source;
}
__name(clone, "clone");
function isValidKey(key) {
  return [
    "__proto__",
    "prototype",
    "constructor"
  ].indexOf(key) === -1;
}
__name(isValidKey, "isValidKey");
function _merger(key, target, source, options) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    merge(tval, sval, options);
  } else {
    target[key] = clone(sval);
  }
}
__name(_merger, "_merger");
function merge(target, source, options) {
  const sources = isArray(source) ? source : [
    source
  ];
  const ilen = sources.length;
  if (!isObject(target)) {
    return target;
  }
  options = options || {};
  const merger = options.merger || _merger;
  let current;
  for (let i = 0; i < ilen; ++i) {
    current = sources[i];
    if (!isObject(current)) {
      continue;
    }
    const keys = Object.keys(current);
    for (let k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, current, options);
    }
  }
  return target;
}
__name(merge, "merge");
function mergeIf(target, source) {
  return merge(target, source, {
    merger: _mergerIf
  });
}
__name(mergeIf, "mergeIf");
function _mergerIf(key, target, source) {
  if (!isValidKey(key)) {
    return;
  }
  const tval = target[key];
  const sval = source[key];
  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone(sval);
  }
}
__name(_mergerIf, "_mergerIf");
const keyResolvers = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  "": (v) => v,
  // default resolvers
  x: (o) => o.x,
  y: (o) => o.y
};
function _splitKey(key) {
  const parts = key.split(".");
  const keys = [];
  let tmp = "";
  for (const part of parts) {
    tmp += part;
    if (tmp.endsWith("\\")) {
      tmp = tmp.slice(0, -1) + ".";
    } else {
      keys.push(tmp);
      tmp = "";
    }
  }
  return keys;
}
__name(_splitKey, "_splitKey");
function _getKeyResolver(key) {
  const keys = _splitKey(key);
  return (obj) => {
    for (const k of keys) {
      if (k === "") {
        break;
      }
      obj = obj && obj[k];
    }
    return obj;
  };
}
__name(_getKeyResolver, "_getKeyResolver");
function resolveObjectKey(obj, key) {
  const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
  return resolver(obj);
}
__name(resolveObjectKey, "resolveObjectKey");
function _capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
__name(_capitalize, "_capitalize");
const defined = /* @__PURE__ */ __name((value) => typeof value !== "undefined", "defined");
const isFunction = /* @__PURE__ */ __name((value) => typeof value === "function", "isFunction");
const setsEqual = /* @__PURE__ */ __name((a, b) => {
  if (a.size !== b.size) {
    return false;
  }
  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }
  return true;
}, "setsEqual");
function _isClickEvent(e) {
  return e.type === "mouseup" || e.type === "click" || e.type === "contextmenu";
}
__name(_isClickEvent, "_isClickEvent");
const PI = Math.PI;
const TAU = 2 * PI;
const PITAU = TAU + PI;
const INFINITY = Number.POSITIVE_INFINITY;
const RAD_PER_DEG = PI / 180;
const HALF_PI = PI / 2;
const QUARTER_PI = PI / 4;
const TWO_THIRDS_PI = PI * 2 / 3;
const log10 = Math.log10;
const sign = Math.sign;
function almostEquals(x, y, epsilon) {
  return Math.abs(x - y) < epsilon;
}
__name(almostEquals, "almostEquals");
function niceNum(range) {
  const roundedRange = Math.round(range);
  range = almostEquals(range, roundedRange, range / 1e3) ? roundedRange : range;
  const niceRange = Math.pow(10, Math.floor(log10(range)));
  const fraction = range / niceRange;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return niceFraction * niceRange;
}
__name(niceNum, "niceNum");
function _factorize(value) {
  const result = [];
  const sqrt = Math.sqrt(value);
  let i;
  for (i = 1; i < sqrt; i++) {
    if (value % i === 0) {
      result.push(i);
      result.push(value / i);
    }
  }
  if (sqrt === (sqrt | 0)) {
    result.push(sqrt);
  }
  result.sort((a, b) => a - b).pop();
  return result;
}
__name(_factorize, "_factorize");
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
__name(isNumber, "isNumber");
function almostWhole(x, epsilon) {
  const rounded = Math.round(x);
  return rounded - epsilon <= x && rounded + epsilon >= x;
}
__name(almostWhole, "almostWhole");
function _setMinAndMaxByKey(array, target, property) {
  let i, ilen, value;
  for (i = 0, ilen = array.length; i < ilen; i++) {
    value = array[i][property];
    if (!isNaN(value)) {
      target.min = Math.min(target.min, value);
      target.max = Math.max(target.max, value);
    }
  }
}
__name(_setMinAndMaxByKey, "_setMinAndMaxByKey");
function toRadians(degrees) {
  return degrees * (PI / 180);
}
__name(toRadians, "toRadians");
function toDegrees(radians) {
  return radians * (180 / PI);
}
__name(toDegrees, "toDegrees");
function _decimalPlaces(x) {
  if (!isNumberFinite(x)) {
    return;
  }
  let e = 1;
  let p = 0;
  while (Math.round(x * e) / e !== x) {
    e *= 10;
    p++;
  }
  return p;
}
__name(_decimalPlaces, "_decimalPlaces");
function getAngleFromPoint(centrePoint, anglePoint) {
  const distanceFromXCenter = anglePoint.x - centrePoint.x;
  const distanceFromYCenter = anglePoint.y - centrePoint.y;
  const radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter);
  let angle = Math.atan2(distanceFromYCenter, distanceFromXCenter);
  if (angle < -0.5 * PI) {
    angle += TAU;
  }
  return {
    angle,
    distance: radialDistanceFromCenter
  };
}
__name(getAngleFromPoint, "getAngleFromPoint");
function distanceBetweenPoints(pt1, pt2) {
  return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2));
}
__name(distanceBetweenPoints, "distanceBetweenPoints");
function _angleDiff(a, b) {
  return (a - b + PITAU) % TAU - PI;
}
__name(_angleDiff, "_angleDiff");
function _normalizeAngle(a) {
  return (a % TAU + TAU) % TAU;
}
__name(_normalizeAngle, "_normalizeAngle");
function _angleBetween(angle, start, end, sameAngleIsFullCircle) {
  const a = _normalizeAngle(angle);
  const s = _normalizeAngle(start);
  const e = _normalizeAngle(end);
  const angleToStart = _normalizeAngle(s - a);
  const angleToEnd = _normalizeAngle(e - a);
  const startToAngle = _normalizeAngle(a - s);
  const endToAngle = _normalizeAngle(a - e);
  return a === s || a === e || sameAngleIsFullCircle && s === e || angleToStart > angleToEnd && startToAngle < endToAngle;
}
__name(_angleBetween, "_angleBetween");
function _limitValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
__name(_limitValue, "_limitValue");
function _int16Range(value) {
  return _limitValue(value, -32768, 32767);
}
__name(_int16Range, "_int16Range");
function _isBetween(value, start, end, epsilon = 1e-6) {
  return value >= Math.min(start, end) - epsilon && value <= Math.max(start, end) + epsilon;
}
__name(_isBetween, "_isBetween");
function _lookup(table, value, cmp) {
  cmp = cmp || ((index2) => table[index2] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid;
  while (hi - lo > 1) {
    mid = lo + hi >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  return {
    lo,
    hi
  };
}
__name(_lookup, "_lookup");
const _lookupByKey = /* @__PURE__ */ __name((table, key, value, last) => _lookup(table, value, last ? (index2) => {
  const ti = table[index2][key];
  return ti < value || ti === value && table[index2 + 1][key] === value;
} : (index2) => table[index2][key] < value), "_lookupByKey");
const _rlookupByKey = /* @__PURE__ */ __name((table, key, value) => _lookup(table, value, (index2) => table[index2][key] >= value), "_rlookupByKey");
function _filterBetween(values, min, max) {
  let start = 0;
  let end = values.length;
  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }
  return start > 0 || end < values.length ? values.slice(start, end) : values;
}
__name(_filterBetween, "_filterBetween");
const arrayEvents = [
  "push",
  "pop",
  "shift",
  "splice",
  "unshift"
];
function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }
  Object.defineProperty(array, "_chartjs", {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [
        listener
      ]
    }
  });
  arrayEvents.forEach((key) => {
    const method = "_onData" + _capitalize(key);
    const base = array[key];
    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value(...args) {
        const res = base.apply(this, args);
        array._chartjs.listeners.forEach((object) => {
          if (typeof object[method] === "function") {
            object[method](...args);
          }
        });
        return res;
      }
    });
  });
}
__name(listenArrayEvents, "listenArrayEvents");
function unlistenArrayEvents(array, listener) {
  const stub = array._chartjs;
  if (!stub) {
    return;
  }
  const listeners = stub.listeners;
  const index2 = listeners.indexOf(listener);
  if (index2 !== -1) {
    listeners.splice(index2, 1);
  }
  if (listeners.length > 0) {
    return;
  }
  arrayEvents.forEach((key) => {
    delete array[key];
  });
  delete array._chartjs;
}
__name(unlistenArrayEvents, "unlistenArrayEvents");
function _arrayUnique(items) {
  const set2 = new Set(items);
  if (set2.size === items.length) {
    return items;
  }
  return Array.from(set2);
}
__name(_arrayUnique, "_arrayUnique");
const requestAnimFrame = function() {
  if (typeof window === "undefined") {
    return function(callback2) {
      return callback2();
    };
  }
  return window.requestAnimationFrame;
}();
function throttled(fn, thisArg) {
  let argsToUse = [];
  let ticking = false;
  return function(...args) {
    argsToUse = args;
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, () => {
        ticking = false;
        fn.apply(thisArg, argsToUse);
      });
    }
  };
}
__name(throttled, "throttled");
function debounce(fn, delay) {
  let timeout;
  return function(...args) {
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}
__name(debounce, "debounce");
const _toLeftRightCenter = /* @__PURE__ */ __name((align) => align === "start" ? "left" : align === "end" ? "right" : "center", "_toLeftRightCenter");
const _alignStartEnd = /* @__PURE__ */ __name((align, start, end) => align === "start" ? start : align === "end" ? end : (start + end) / 2, "_alignStartEnd");
const _textX = /* @__PURE__ */ __name((align, left, right, rtl) => {
  const check = rtl ? "left" : "right";
  return align === check ? right : align === "center" ? (left + right) / 2 : left;
}, "_textX");
function _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled) {
  const pointCount = points.length;
  let start = 0;
  let count = pointCount;
  if (meta._sorted) {
    const { iScale, _parsed } = meta;
    const axis = iScale.axis;
    const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
    if (minDefined) {
      start = _limitValue(Math.min(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, axis, min).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo
      ), 0, pointCount - 1);
    }
    if (maxDefined) {
      count = _limitValue(Math.max(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1
      ), start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }
  return {
    start,
    count
  };
}
__name(_getStartAndCountOfVisiblePoints, "_getStartAndCountOfVisiblePoints");
function _scaleRangesChanged(meta) {
  const { xScale, yScale, _scaleRanges } = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min || _scaleRanges.xmax !== xScale.max || _scaleRanges.ymin !== yScale.min || _scaleRanges.ymax !== yScale.max;
  Object.assign(_scaleRanges, newRanges);
  return changed;
}
__name(_scaleRangesChanged, "_scaleRangesChanged");
const atEdge = /* @__PURE__ */ __name((t) => t === 0 || t === 1, "atEdge");
const elasticIn = /* @__PURE__ */ __name((t, s, p) => -(Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * TAU / p)), "elasticIn");
const elasticOut = /* @__PURE__ */ __name((t, s, p) => Math.pow(2, -10 * t) * Math.sin((t - s) * TAU / p) + 1, "elasticOut");
const effects = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => -t * (t - 2),
  easeInOutQuad: (t) => (t /= 0.5) < 1 ? 0.5 * t * t : -0.5 * (--t * (t - 2) - 1),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => (t -= 1) * t * t + 1,
  easeInOutCubic: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t : 0.5 * ((t -= 2) * t * t + 2),
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => -((t -= 1) * t * t * t - 1),
  easeInOutQuart: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t : -0.5 * ((t -= 2) * t * t * t - 2),
  easeInQuint: (t) => t * t * t * t * t,
  easeOutQuint: (t) => (t -= 1) * t * t * t * t + 1,
  easeInOutQuint: (t) => (t /= 0.5) < 1 ? 0.5 * t * t * t * t * t : 0.5 * ((t -= 2) * t * t * t * t + 2),
  easeInSine: (t) => -Math.cos(t * HALF_PI) + 1,
  easeOutSine: (t) => Math.sin(t * HALF_PI),
  easeInOutSine: (t) => -0.5 * (Math.cos(PI * t) - 1),
  easeInExpo: (t) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
  easeInOutExpo: (t) => atEdge(t) ? t : t < 0.5 ? 0.5 * Math.pow(2, 10 * (t * 2 - 1)) : 0.5 * (-Math.pow(2, -10 * (t * 2 - 1)) + 2),
  easeInCirc: (t) => t >= 1 ? t : -(Math.sqrt(1 - t * t) - 1),
  easeOutCirc: (t) => Math.sqrt(1 - (t -= 1) * t),
  easeInOutCirc: (t) => (t /= 0.5) < 1 ? -0.5 * (Math.sqrt(1 - t * t) - 1) : 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1),
  easeInElastic: (t) => atEdge(t) ? t : elasticIn(t, 0.075, 0.3),
  easeOutElastic: (t) => atEdge(t) ? t : elasticOut(t, 0.075, 0.3),
  easeInOutElastic(t) {
    const s = 0.1125;
    const p = 0.45;
    return atEdge(t) ? t : t < 0.5 ? 0.5 * elasticIn(t * 2, s, p) : 0.5 + 0.5 * elasticOut(t * 2 - 1, s, p);
  },
  easeInBack(t) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
  },
  easeOutBack(t) {
    const s = 1.70158;
    return (t -= 1) * t * ((s + 1) * t + s) + 1;
  },
  easeInOutBack(t) {
    let s = 1.70158;
    if ((t /= 0.5) < 1) {
      return 0.5 * (t * t * (((s *= 1.525) + 1) * t - s));
    }
    return 0.5 * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
  },
  easeInBounce: (t) => 1 - effects.easeOutBounce(1 - t),
  easeOutBounce(t) {
    const m = 7.5625;
    const d = 2.75;
    if (t < 1 / d) {
      return m * t * t;
    }
    if (t < 2 / d) {
      return m * (t -= 1.5 / d) * t + 0.75;
    }
    if (t < 2.5 / d) {
      return m * (t -= 2.25 / d) * t + 0.9375;
    }
    return m * (t -= 2.625 / d) * t + 0.984375;
  },
  easeInOutBounce: (t) => t < 0.5 ? effects.easeInBounce(t * 2) * 0.5 : effects.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
};
function isPatternOrGradient(value) {
  if (value && typeof value === "object") {
    const type = value.toString();
    return type === "[object CanvasPattern]" || type === "[object CanvasGradient]";
  }
  return false;
}
__name(isPatternOrGradient, "isPatternOrGradient");
function color(value) {
  return isPatternOrGradient(value) ? value : new Color(value);
}
__name(color, "color");
function getHoverColor(value) {
  return isPatternOrGradient(value) ? value : new Color(value).saturate(0.5).darken(0.1).hexString();
}
__name(getHoverColor, "getHoverColor");
const numbers = [
  "x",
  "y",
  "borderWidth",
  "radius",
  "tension"
];
const colors = [
  "color",
  "borderColor",
  "backgroundColor"
];
function applyAnimationsDefaults(defaults2) {
  defaults2.set("animation", {
    delay: void 0,
    duration: 1e3,
    easing: "easeOutQuart",
    fn: void 0,
    from: void 0,
    loop: void 0,
    to: void 0,
    type: void 0
  });
  defaults2.describe("animation", {
    _fallback: false,
    _indexable: false,
    _scriptable: (name) => name !== "onProgress" && name !== "onComplete" && name !== "fn"
  });
  defaults2.set("animations", {
    colors: {
      type: "color",
      properties: colors
    },
    numbers: {
      type: "number",
      properties: numbers
    }
  });
  defaults2.describe("animations", {
    _fallback: "animation"
  });
  defaults2.set("transitions", {
    active: {
      animation: {
        duration: 400
      }
    },
    resize: {
      animation: {
        duration: 0
      }
    },
    show: {
      animations: {
        colors: {
          from: "transparent"
        },
        visible: {
          type: "boolean",
          duration: 0
        }
      }
    },
    hide: {
      animations: {
        colors: {
          to: "transparent"
        },
        visible: {
          type: "boolean",
          easing: "linear",
          fn: (v) => v | 0
        }
      }
    }
  });
}
__name(applyAnimationsDefaults, "applyAnimationsDefaults");
function applyLayoutsDefaults(defaults2) {
  defaults2.set("layout", {
    autoPadding: true,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  });
}
__name(applyLayoutsDefaults, "applyLayoutsDefaults");
const intlCache = /* @__PURE__ */ new Map();
function getNumberFormat(locale, options) {
  options = options || {};
  const cacheKey = locale + JSON.stringify(options);
  let formatter2 = intlCache.get(cacheKey);
  if (!formatter2) {
    formatter2 = new Intl.NumberFormat(locale, options);
    intlCache.set(cacheKey, formatter2);
  }
  return formatter2;
}
__name(getNumberFormat, "getNumberFormat");
function formatNumber(num, locale, options) {
  return getNumberFormat(locale, options).format(num);
}
__name(formatNumber, "formatNumber");
const formatters = {
  values(value) {
    return isArray(value) ? value : "" + value;
  },
  numeric(tickValue, index2, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const locale = this.chart.options.locale;
    let notation;
    let delta = tickValue;
    if (ticks.length > 1) {
      const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
      if (maxTick < 1e-4 || maxTick > 1e15) {
        notation = "scientific";
      }
      delta = calculateDelta(tickValue, ticks);
    }
    const logDelta = log10(Math.abs(delta));
    const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);
    const options = {
      notation,
      minimumFractionDigits: numDecimal,
      maximumFractionDigits: numDecimal
    };
    Object.assign(options, this.options.ticks.format);
    return formatNumber(tickValue, locale, options);
  },
  logarithmic(tickValue, index2, ticks) {
    if (tickValue === 0) {
      return "0";
    }
    const remain = ticks[index2].significand || tickValue / Math.pow(10, Math.floor(log10(tickValue)));
    if ([
      1,
      2,
      3,
      5,
      10,
      15
    ].includes(remain) || index2 > 0.8 * ticks.length) {
      return formatters.numeric.call(this, tickValue, index2, ticks);
    }
    return "";
  }
};
function calculateDelta(tickValue, ticks) {
  let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}
__name(calculateDelta, "calculateDelta");
var Ticks = {
  formatters
};
function applyScaleDefaults(defaults2) {
  defaults2.set("scale", {
    display: true,
    offset: false,
    reverse: false,
    beginAtZero: false,
    bounds: "ticks",
    clip: true,
    grace: 0,
    grid: {
      display: true,
      lineWidth: 1,
      drawOnChartArea: true,
      drawTicks: true,
      tickLength: 8,
      tickWidth: (_ctx, options) => options.lineWidth,
      tickColor: (_ctx, options) => options.color,
      offset: false
    },
    border: {
      display: true,
      dash: [],
      dashOffset: 0,
      width: 1
    },
    title: {
      display: false,
      text: "",
      padding: {
        top: 4,
        bottom: 4
      }
    },
    ticks: {
      minRotation: 0,
      maxRotation: 50,
      mirror: false,
      textStrokeWidth: 0,
      textStrokeColor: "",
      padding: 3,
      display: true,
      autoSkip: true,
      autoSkipPadding: 3,
      labelOffset: 0,
      callback: Ticks.formatters.values,
      minor: {},
      major: {},
      align: "center",
      crossAlign: "near",
      showLabelBackdrop: false,
      backdropColor: "rgba(255, 255, 255, 0.75)",
      backdropPadding: 2
    }
  });
  defaults2.route("scale.ticks", "color", "", "color");
  defaults2.route("scale.grid", "color", "", "borderColor");
  defaults2.route("scale.border", "color", "", "borderColor");
  defaults2.route("scale.title", "color", "", "color");
  defaults2.describe("scale", {
    _fallback: false,
    _scriptable: (name) => !name.startsWith("before") && !name.startsWith("after") && name !== "callback" && name !== "parser",
    _indexable: (name) => name !== "borderDash" && name !== "tickBorderDash" && name !== "dash"
  });
  defaults2.describe("scales", {
    _fallback: "scale"
  });
  defaults2.describe("scale.ticks", {
    _scriptable: (name) => name !== "backdropPadding" && name !== "callback",
    _indexable: (name) => name !== "backdropPadding"
  });
}
__name(applyScaleDefaults, "applyScaleDefaults");
const overrides = /* @__PURE__ */ Object.create(null);
const descriptors = /* @__PURE__ */ Object.create(null);
function getScope$1(node, key) {
  if (!key) {
    return node;
  }
  const keys = key.split(".");
  for (let i = 0, n = keys.length; i < n; ++i) {
    const k = keys[i];
    node = node[k] || (node[k] = /* @__PURE__ */ Object.create(null));
  }
  return node;
}
__name(getScope$1, "getScope$1");
function set(root, scope, values) {
  if (typeof scope === "string") {
    return merge(getScope$1(root, scope), values);
  }
  return merge(getScope$1(root, ""), scope);
}
__name(set, "set");
class Defaults {
  static {
    __name(this, "Defaults");
  }
  constructor(_descriptors2, _appliers) {
    this.animation = void 0;
    this.backgroundColor = "rgba(0,0,0,0.1)";
    this.borderColor = "rgba(0,0,0,0.1)";
    this.color = "#666";
    this.datasets = {};
    this.devicePixelRatio = (context) => context.chart.platform.getDevicePixelRatio();
    this.elements = {};
    this.events = [
      "mousemove",
      "mouseout",
      "click",
      "touchstart",
      "touchmove"
    ];
    this.font = {
      family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
      size: 12,
      style: "normal",
      lineHeight: 1.2,
      weight: null
    };
    this.hover = {};
    this.hoverBackgroundColor = (ctx, options) => getHoverColor(options.backgroundColor);
    this.hoverBorderColor = (ctx, options) => getHoverColor(options.borderColor);
    this.hoverColor = (ctx, options) => getHoverColor(options.color);
    this.indexAxis = "x";
    this.interaction = {
      mode: "nearest",
      intersect: true,
      includeInvisible: false
    };
    this.maintainAspectRatio = true;
    this.onHover = null;
    this.onClick = null;
    this.parsing = true;
    this.plugins = {};
    this.responsive = true;
    this.scale = void 0;
    this.scales = {};
    this.showLine = true;
    this.drawActiveElementsOnTop = true;
    this.describe(_descriptors2);
    this.apply(_appliers);
  }
  set(scope, values) {
    return set(this, scope, values);
  }
  get(scope) {
    return getScope$1(this, scope);
  }
  describe(scope, values) {
    return set(descriptors, scope, values);
  }
  override(scope, values) {
    return set(overrides, scope, values);
  }
  route(scope, name, targetScope, targetName) {
    const scopeObject = getScope$1(this, scope);
    const targetScopeObject = getScope$1(this, targetScope);
    const privateName = "_" + name;
    Object.defineProperties(scopeObject, {
      [privateName]: {
        value: scopeObject[name],
        writable: true
      },
      [name]: {
        enumerable: true,
        get() {
          const local = this[privateName];
          const target = targetScopeObject[targetName];
          if (isObject(local)) {
            return Object.assign({}, target, local);
          }
          return valueOrDefault(local, target);
        },
        set(value) {
          this[privateName] = value;
        }
      }
    });
  }
  apply(appliers) {
    appliers.forEach((apply) => apply(this));
  }
}
var defaults$1 = /* @__PURE__ */ new Defaults({
  _scriptable: (name) => !name.startsWith("on"),
  _indexable: (name) => name !== "events",
  hover: {
    _fallback: "interaction"
  },
  interaction: {
    _scriptable: false,
    _indexable: false
  }
}, [
  applyAnimationsDefaults,
  applyLayoutsDefaults,
  applyScaleDefaults
]);
function toFontString(font) {
  if (!font || isNullOrUndef(font.size) || isNullOrUndef(font.family)) {
    return null;
  }
  return (font.style ? font.style + " " : "") + (font.weight ? font.weight + " " : "") + font.size + "px " + font.family;
}
__name(toFontString, "toFontString");
function _measureText(ctx, data, gc, longest, string) {
  let textWidth = data[string];
  if (!textWidth) {
    textWidth = data[string] = ctx.measureText(string).width;
    gc.push(string);
  }
  if (textWidth > longest) {
    longest = textWidth;
  }
  return longest;
}
__name(_measureText, "_measureText");
function _longestText(ctx, font, arrayOfThings, cache) {
  cache = cache || {};
  let data = cache.data = cache.data || {};
  let gc = cache.garbageCollect = cache.garbageCollect || [];
  if (cache.font !== font) {
    data = cache.data = {};
    gc = cache.garbageCollect = [];
    cache.font = font;
  }
  ctx.save();
  ctx.font = font;
  let longest = 0;
  const ilen = arrayOfThings.length;
  let i, j, jlen, thing, nestedThing;
  for (i = 0; i < ilen; i++) {
    thing = arrayOfThings[i];
    if (thing !== void 0 && thing !== null && !isArray(thing)) {
      longest = _measureText(ctx, data, gc, longest, thing);
    } else if (isArray(thing)) {
      for (j = 0, jlen = thing.length; j < jlen; j++) {
        nestedThing = thing[j];
        if (nestedThing !== void 0 && nestedThing !== null && !isArray(nestedThing)) {
          longest = _measureText(ctx, data, gc, longest, nestedThing);
        }
      }
    }
  }
  ctx.restore();
  const gcLen = gc.length / 2;
  if (gcLen > arrayOfThings.length) {
    for (i = 0; i < gcLen; i++) {
      delete data[gc[i]];
    }
    gc.splice(0, gcLen);
  }
  return longest;
}
__name(_longestText, "_longestText");
function _alignPixel(chart, pixel, width) {
  const devicePixelRatio2 = chart.currentDevicePixelRatio;
  const halfWidth = width !== 0 ? Math.max(width / 2, 0.5) : 0;
  return Math.round((pixel - halfWidth) * devicePixelRatio2) / devicePixelRatio2 + halfWidth;
}
__name(_alignPixel, "_alignPixel");
function clearCanvas(canvas2, ctx) {
  ctx = ctx || canvas2.getContext("2d");
  ctx.save();
  ctx.resetTransform();
  ctx.clearRect(0, 0, canvas2.width, canvas2.height);
  ctx.restore();
}
__name(clearCanvas, "clearCanvas");
function drawPoint(ctx, options, x, y) {
  drawPointLegend(ctx, options, x, y, null);
}
__name(drawPoint, "drawPoint");
function drawPointLegend(ctx, options, x, y, w) {
  let type, xOffset, yOffset, size, cornerRadius, width, xOffsetW, yOffsetW;
  const style = options.pointStyle;
  const rotation = options.rotation;
  const radius = options.radius;
  let rad = (rotation || 0) * RAD_PER_DEG;
  if (style && typeof style === "object") {
    type = style.toString();
    if (type === "[object HTMLImageElement]" || type === "[object HTMLCanvasElement]") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rad);
      ctx.drawImage(style, -style.width / 2, -style.height / 2, style.width, style.height);
      ctx.restore();
      return;
    }
  }
  if (isNaN(radius) || radius <= 0) {
    return;
  }
  ctx.beginPath();
  switch (style) {
    default:
      if (w) {
        ctx.ellipse(x, y, w / 2, radius, 0, 0, TAU);
      } else {
        ctx.arc(x, y, radius, 0, TAU);
      }
      ctx.closePath();
      break;
    case "triangle":
      width = w ? w / 2 : radius;
      ctx.moveTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      rad += TWO_THIRDS_PI;
      ctx.lineTo(x + Math.sin(rad) * width, y - Math.cos(rad) * radius);
      ctx.closePath();
      break;
    case "rectRounded":
      cornerRadius = radius * 0.516;
      size = radius - cornerRadius;
      xOffset = Math.cos(rad + QUARTER_PI) * size;
      xOffsetW = Math.cos(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
      yOffset = Math.sin(rad + QUARTER_PI) * size;
      yOffsetW = Math.sin(rad + QUARTER_PI) * (w ? w / 2 - cornerRadius : size);
      ctx.arc(x - xOffsetW, y - yOffset, cornerRadius, rad - PI, rad - HALF_PI);
      ctx.arc(x + yOffsetW, y - xOffset, cornerRadius, rad - HALF_PI, rad);
      ctx.arc(x + xOffsetW, y + yOffset, cornerRadius, rad, rad + HALF_PI);
      ctx.arc(x - yOffsetW, y + xOffset, cornerRadius, rad + HALF_PI, rad + PI);
      ctx.closePath();
      break;
    case "rect":
      if (!rotation) {
        size = Math.SQRT1_2 * radius;
        width = w ? w / 2 : size;
        ctx.rect(x - width, y - size, 2 * width, 2 * size);
        break;
      }
      rad += QUARTER_PI;
    case "rectRot":
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      ctx.closePath();
      break;
    case "crossRot":
      rad += QUARTER_PI;
    case "cross":
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      break;
    case "star":
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      rad += QUARTER_PI;
      xOffsetW = Math.cos(rad) * (w ? w / 2 : radius);
      xOffset = Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      yOffsetW = Math.sin(rad) * (w ? w / 2 : radius);
      ctx.moveTo(x - xOffsetW, y - yOffset);
      ctx.lineTo(x + xOffsetW, y + yOffset);
      ctx.moveTo(x + yOffsetW, y - xOffset);
      ctx.lineTo(x - yOffsetW, y + xOffset);
      break;
    case "line":
      xOffset = w ? w / 2 : Math.cos(rad) * radius;
      yOffset = Math.sin(rad) * radius;
      ctx.moveTo(x - xOffset, y - yOffset);
      ctx.lineTo(x + xOffset, y + yOffset);
      break;
    case "dash":
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(rad) * (w ? w / 2 : radius), y + Math.sin(rad) * radius);
      break;
    case false:
      ctx.closePath();
      break;
  }
  ctx.fill();
  if (options.borderWidth > 0) {
    ctx.stroke();
  }
}
__name(drawPointLegend, "drawPointLegend");
function _isPointInArea(point, area, margin) {
  margin = margin || 0.5;
  return !area || point && point.x > area.left - margin && point.x < area.right + margin && point.y > area.top - margin && point.y < area.bottom + margin;
}
__name(_isPointInArea, "_isPointInArea");
function clipArea(ctx, area) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(area.left, area.top, area.right - area.left, area.bottom - area.top);
  ctx.clip();
}
__name(clipArea, "clipArea");
function unclipArea(ctx) {
  ctx.restore();
}
__name(unclipArea, "unclipArea");
function _steppedLineTo(ctx, previous, target, flip, mode) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  if (mode === "middle") {
    const midpoint = (previous.x + target.x) / 2;
    ctx.lineTo(midpoint, previous.y);
    ctx.lineTo(midpoint, target.y);
  } else if (mode === "after" !== !!flip) {
    ctx.lineTo(previous.x, target.y);
  } else {
    ctx.lineTo(target.x, previous.y);
  }
  ctx.lineTo(target.x, target.y);
}
__name(_steppedLineTo, "_steppedLineTo");
function _bezierCurveTo(ctx, previous, target, flip) {
  if (!previous) {
    return ctx.lineTo(target.x, target.y);
  }
  ctx.bezierCurveTo(flip ? previous.cp1x : previous.cp2x, flip ? previous.cp1y : previous.cp2y, flip ? target.cp2x : target.cp1x, flip ? target.cp2y : target.cp1y, target.x, target.y);
}
__name(_bezierCurveTo, "_bezierCurveTo");
function setRenderOpts(ctx, opts) {
  if (opts.translation) {
    ctx.translate(opts.translation[0], opts.translation[1]);
  }
  if (!isNullOrUndef(opts.rotation)) {
    ctx.rotate(opts.rotation);
  }
  if (opts.color) {
    ctx.fillStyle = opts.color;
  }
  if (opts.textAlign) {
    ctx.textAlign = opts.textAlign;
  }
  if (opts.textBaseline) {
    ctx.textBaseline = opts.textBaseline;
  }
}
__name(setRenderOpts, "setRenderOpts");
function decorateText(ctx, x, y, line, opts) {
  if (opts.strikethrough || opts.underline) {
    const metrics = ctx.measureText(line);
    const left = x - metrics.actualBoundingBoxLeft;
    const right = x + metrics.actualBoundingBoxRight;
    const top = y - metrics.actualBoundingBoxAscent;
    const bottom = y + metrics.actualBoundingBoxDescent;
    const yDecoration = opts.strikethrough ? (top + bottom) / 2 : bottom;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.beginPath();
    ctx.lineWidth = opts.decorationWidth || 2;
    ctx.moveTo(left, yDecoration);
    ctx.lineTo(right, yDecoration);
    ctx.stroke();
  }
}
__name(decorateText, "decorateText");
function drawBackdrop(ctx, opts) {
  const oldColor = ctx.fillStyle;
  ctx.fillStyle = opts.color;
  ctx.fillRect(opts.left, opts.top, opts.width, opts.height);
  ctx.fillStyle = oldColor;
}
__name(drawBackdrop, "drawBackdrop");
function renderText(ctx, text, x, y, font, opts = {}) {
  const lines = isArray(text) ? text : [
    text
  ];
  const stroke = opts.strokeWidth > 0 && opts.strokeColor !== "";
  let i, line;
  ctx.save();
  ctx.font = font.string;
  setRenderOpts(ctx, opts);
  for (i = 0; i < lines.length; ++i) {
    line = lines[i];
    if (opts.backdrop) {
      drawBackdrop(ctx, opts.backdrop);
    }
    if (stroke) {
      if (opts.strokeColor) {
        ctx.strokeStyle = opts.strokeColor;
      }
      if (!isNullOrUndef(opts.strokeWidth)) {
        ctx.lineWidth = opts.strokeWidth;
      }
      ctx.strokeText(line, x, y, opts.maxWidth);
    }
    ctx.fillText(line, x, y, opts.maxWidth);
    decorateText(ctx, x, y, line, opts);
    y += Number(font.lineHeight);
  }
  ctx.restore();
}
__name(renderText, "renderText");
function addRoundedRectPath(ctx, rect) {
  const { x, y, w, h, radius } = rect;
  ctx.arc(x + radius.topLeft, y + radius.topLeft, radius.topLeft, 1.5 * PI, PI, true);
  ctx.lineTo(x, y + h - radius.bottomLeft);
  ctx.arc(x + radius.bottomLeft, y + h - radius.bottomLeft, radius.bottomLeft, PI, HALF_PI, true);
  ctx.lineTo(x + w - radius.bottomRight, y + h);
  ctx.arc(x + w - radius.bottomRight, y + h - radius.bottomRight, radius.bottomRight, HALF_PI, 0, true);
  ctx.lineTo(x + w, y + radius.topRight);
  ctx.arc(x + w - radius.topRight, y + radius.topRight, radius.topRight, 0, -HALF_PI, true);
  ctx.lineTo(x + radius.topLeft, y);
}
__name(addRoundedRectPath, "addRoundedRectPath");
const LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
const FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;
function toLineHeight(value, size) {
  const matches = ("" + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === "normal") {
    return size * 1.2;
  }
  value = +matches[2];
  switch (matches[3]) {
    case "px":
      return value;
    case "%":
      value /= 100;
      break;
  }
  return size * value;
}
__name(toLineHeight, "toLineHeight");
const numberOrZero = /* @__PURE__ */ __name((v) => +v || 0, "numberOrZero");
function _readValueToProps(value, props) {
  const ret = {};
  const objProps = isObject(props);
  const keys = objProps ? Object.keys(props) : props;
  const read = isObject(value) ? objProps ? (prop) => valueOrDefault(value[prop], value[props[prop]]) : (prop) => value[prop] : () => value;
  for (const prop of keys) {
    ret[prop] = numberOrZero(read(prop));
  }
  return ret;
}
__name(_readValueToProps, "_readValueToProps");
function toTRBL(value) {
  return _readValueToProps(value, {
    top: "y",
    right: "x",
    bottom: "y",
    left: "x"
  });
}
__name(toTRBL, "toTRBL");
function toTRBLCorners(value) {
  return _readValueToProps(value, [
    "topLeft",
    "topRight",
    "bottomLeft",
    "bottomRight"
  ]);
}
__name(toTRBLCorners, "toTRBLCorners");
function toPadding(value) {
  const obj = toTRBL(value);
  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;
  return obj;
}
__name(toPadding, "toPadding");
function toFont(options, fallback) {
  options = options || {};
  fallback = fallback || defaults$1.font;
  let size = valueOrDefault(options.size, fallback.size);
  if (typeof size === "string") {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options.style, fallback.style);
  if (style && !("" + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = void 0;
  }
  const font = {
    family: valueOrDefault(options.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
    size,
    style,
    weight: valueOrDefault(options.weight, fallback.weight),
    string: ""
  };
  font.string = toFontString(font);
  return font;
}
__name(toFont, "toFont");
function resolve(inputs, context, index2, info) {
  let cacheable = true;
  let i, ilen, value;
  for (i = 0, ilen = inputs.length; i < ilen; ++i) {
    value = inputs[i];
    if (value === void 0) {
      continue;
    }
    if (context !== void 0 && typeof value === "function") {
      value = value(context);
      cacheable = false;
    }
    if (index2 !== void 0 && isArray(value)) {
      value = value[index2 % value.length];
      cacheable = false;
    }
    if (value !== void 0) {
      if (info && !cacheable) {
        info.cacheable = false;
      }
      return value;
    }
  }
}
__name(resolve, "resolve");
function _addGrace(minmax, grace, beginAtZero) {
  const { min, max } = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = /* @__PURE__ */ __name((value, add) => beginAtZero && value === 0 ? 0 : value + add, "keepZero");
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}
__name(_addGrace, "_addGrace");
function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}
__name(createContext, "createContext");
function _createResolver(scopes, prefixes = [
  ""
], rootScopes, fallback, getTarget = () => scopes[0]) {
  const finalRootScopes = rootScopes || scopes;
  if (typeof fallback === "undefined") {
    fallback = _resolve("_fallback", scopes);
  }
  const cache = {
    [Symbol.toStringTag]: "Object",
    _cacheable: true,
    _scopes: scopes,
    _rootScopes: finalRootScopes,
    _fallback: fallback,
    _getTarget: getTarget,
    override: (scope) => _createResolver([
      scope,
      ...scopes
    ], prefixes, finalRootScopes, fallback)
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(target, prop) {
      delete target[prop];
      delete target._keys;
      delete scopes[0][prop];
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get(target, prop) {
      return _cached(target, prop, () => _resolveWithPrefixes(prop, prefixes, scopes, target));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(target, prop) {
      return Reflect.getOwnPropertyDescriptor(target._scopes[0], prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(scopes[0]);
    },
    /**
    * A trap for the in operator.
    */
    has(target, prop) {
      return getKeysFromAllScopes(target).includes(prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys(target) {
      return getKeysFromAllScopes(target);
    },
    /**
    * A trap for setting property values.
    */
    set(target, prop, value) {
      const storage = target._storage || (target._storage = getTarget());
      target[prop] = storage[prop] = value;
      delete target._keys;
      return true;
    }
  });
}
__name(_createResolver, "_createResolver");
function _attachContext(proxy, context, subProxy, descriptorDefaults) {
  const cache = {
    _cacheable: false,
    _proxy: proxy,
    _context: context,
    _subProxy: subProxy,
    _stack: /* @__PURE__ */ new Set(),
    _descriptors: _descriptors(proxy, descriptorDefaults),
    setContext: (ctx) => _attachContext(proxy, ctx, subProxy, descriptorDefaults),
    override: (scope) => _attachContext(proxy.override(scope), context, subProxy, descriptorDefaults)
  };
  return new Proxy(cache, {
    /**
    * A trap for the delete operator.
    */
    deleteProperty(target, prop) {
      delete target[prop];
      delete proxy[prop];
      return true;
    },
    /**
    * A trap for getting property values.
    */
    get(target, prop, receiver) {
      return _cached(target, prop, () => _resolveWithContext(target, prop, receiver));
    },
    /**
    * A trap for Object.getOwnPropertyDescriptor.
    * Also used by Object.hasOwnProperty.
    */
    getOwnPropertyDescriptor(target, prop) {
      return target._descriptors.allKeys ? Reflect.has(proxy, prop) ? {
        enumerable: true,
        configurable: true
      } : void 0 : Reflect.getOwnPropertyDescriptor(proxy, prop);
    },
    /**
    * A trap for Object.getPrototypeOf.
    */
    getPrototypeOf() {
      return Reflect.getPrototypeOf(proxy);
    },
    /**
    * A trap for the in operator.
    */
    has(target, prop) {
      return Reflect.has(proxy, prop);
    },
    /**
    * A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
    */
    ownKeys() {
      return Reflect.ownKeys(proxy);
    },
    /**
    * A trap for setting property values.
    */
    set(target, prop, value) {
      proxy[prop] = value;
      delete target[prop];
      return true;
    }
  });
}
__name(_attachContext, "_attachContext");
function _descriptors(proxy, defaults2 = {
  scriptable: true,
  indexable: true
}) {
  const { _scriptable = defaults2.scriptable, _indexable = defaults2.indexable, _allKeys = defaults2.allKeys } = proxy;
  return {
    allKeys: _allKeys,
    scriptable: _scriptable,
    indexable: _indexable,
    isScriptable: isFunction(_scriptable) ? _scriptable : () => _scriptable,
    isIndexable: isFunction(_indexable) ? _indexable : () => _indexable
  };
}
__name(_descriptors, "_descriptors");
const readKey = /* @__PURE__ */ __name((prefix, name) => prefix ? prefix + _capitalize(name) : name, "readKey");
const needsSubResolver = /* @__PURE__ */ __name((prop, value) => isObject(value) && prop !== "adapters" && (Object.getPrototypeOf(value) === null || value.constructor === Object), "needsSubResolver");
function _cached(target, prop, resolve2) {
  if (Object.prototype.hasOwnProperty.call(target, prop)) {
    return target[prop];
  }
  const value = resolve2();
  target[prop] = value;
  return value;
}
__name(_cached, "_cached");
function _resolveWithContext(target, prop, receiver) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  let value = _proxy[prop];
  if (isFunction(value) && descriptors2.isScriptable(prop)) {
    value = _resolveScriptable(prop, value, target, receiver);
  }
  if (isArray(value) && value.length) {
    value = _resolveArray(prop, value, target, descriptors2.isIndexable);
  }
  if (needsSubResolver(prop, value)) {
    value = _attachContext(value, _context, _subProxy && _subProxy[prop], descriptors2);
  }
  return value;
}
__name(_resolveWithContext, "_resolveWithContext");
function _resolveScriptable(prop, getValue, target, receiver) {
  const { _proxy, _context, _subProxy, _stack } = target;
  if (_stack.has(prop)) {
    throw new Error("Recursion detected: " + Array.from(_stack).join("->") + "->" + prop);
  }
  _stack.add(prop);
  let value = getValue(_context, _subProxy || receiver);
  _stack.delete(prop);
  if (needsSubResolver(prop, value)) {
    value = createSubResolver(_proxy._scopes, _proxy, prop, value);
  }
  return value;
}
__name(_resolveScriptable, "_resolveScriptable");
function _resolveArray(prop, value, target, isIndexable) {
  const { _proxy, _context, _subProxy, _descriptors: descriptors2 } = target;
  if (typeof _context.index !== "undefined" && isIndexable(prop)) {
    return value[_context.index % value.length];
  } else if (isObject(value[0])) {
    const arr = value;
    const scopes = _proxy._scopes.filter((s) => s !== arr);
    value = [];
    for (const item of arr) {
      const resolver = createSubResolver(scopes, _proxy, prop, item);
      value.push(_attachContext(resolver, _context, _subProxy && _subProxy[prop], descriptors2));
    }
  }
  return value;
}
__name(_resolveArray, "_resolveArray");
function resolveFallback(fallback, prop, value) {
  return isFunction(fallback) ? fallback(prop, value) : fallback;
}
__name(resolveFallback, "resolveFallback");
const getScope = /* @__PURE__ */ __name((key, parent) => key === true ? parent : typeof key === "string" ? resolveObjectKey(parent, key) : void 0, "getScope");
function addScopes(set2, parentScopes, key, parentFallback, value) {
  for (const parent of parentScopes) {
    const scope = getScope(key, parent);
    if (scope) {
      set2.add(scope);
      const fallback = resolveFallback(scope._fallback, key, value);
      if (typeof fallback !== "undefined" && fallback !== key && fallback !== parentFallback) {
        return fallback;
      }
    } else if (scope === false && typeof parentFallback !== "undefined" && key !== parentFallback) {
      return null;
    }
  }
  return false;
}
__name(addScopes, "addScopes");
function createSubResolver(parentScopes, resolver, prop, value) {
  const rootScopes = resolver._rootScopes;
  const fallback = resolveFallback(resolver._fallback, prop, value);
  const allScopes = [
    ...parentScopes,
    ...rootScopes
  ];
  const set2 = /* @__PURE__ */ new Set();
  set2.add(value);
  let key = addScopesFromKey(set2, allScopes, prop, fallback || prop, value);
  if (key === null) {
    return false;
  }
  if (typeof fallback !== "undefined" && fallback !== prop) {
    key = addScopesFromKey(set2, allScopes, fallback, key, value);
    if (key === null) {
      return false;
    }
  }
  return _createResolver(Array.from(set2), [
    ""
  ], rootScopes, fallback, () => subGetTarget(resolver, prop, value));
}
__name(createSubResolver, "createSubResolver");
function addScopesFromKey(set2, allScopes, key, fallback, item) {
  while (key) {
    key = addScopes(set2, allScopes, key, fallback, item);
  }
  return key;
}
__name(addScopesFromKey, "addScopesFromKey");
function subGetTarget(resolver, prop, value) {
  const parent = resolver._getTarget();
  if (!(prop in parent)) {
    parent[prop] = {};
  }
  const target = parent[prop];
  if (isArray(target) && isObject(value)) {
    return value;
  }
  return target || {};
}
__name(subGetTarget, "subGetTarget");
function _resolveWithPrefixes(prop, prefixes, scopes, proxy) {
  let value;
  for (const prefix of prefixes) {
    value = _resolve(readKey(prefix, prop), scopes);
    if (typeof value !== "undefined") {
      return needsSubResolver(prop, value) ? createSubResolver(scopes, proxy, prop, value) : value;
    }
  }
}
__name(_resolveWithPrefixes, "_resolveWithPrefixes");
function _resolve(key, scopes) {
  for (const scope of scopes) {
    if (!scope) {
      continue;
    }
    const value = scope[key];
    if (typeof value !== "undefined") {
      return value;
    }
  }
}
__name(_resolve, "_resolve");
function getKeysFromAllScopes(target) {
  let keys = target._keys;
  if (!keys) {
    keys = target._keys = resolveKeysFromAllScopes(target._scopes);
  }
  return keys;
}
__name(getKeysFromAllScopes, "getKeysFromAllScopes");
function resolveKeysFromAllScopes(scopes) {
  const set2 = /* @__PURE__ */ new Set();
  for (const scope of scopes) {
    for (const key of Object.keys(scope).filter((k) => !k.startsWith("_"))) {
      set2.add(key);
    }
  }
  return Array.from(set2);
}
__name(resolveKeysFromAllScopes, "resolveKeysFromAllScopes");
function _parseObjectDataRadialScale(meta, data, start, count) {
  const { iScale } = meta;
  const { key = "r" } = this._parsing;
  const parsed = new Array(count);
  let i, ilen, index2, item;
  for (i = 0, ilen = count; i < ilen; ++i) {
    index2 = i + start;
    item = data[index2];
    parsed[i] = {
      r: iScale.parse(resolveObjectKey(item, key), index2)
    };
  }
  return parsed;
}
__name(_parseObjectDataRadialScale, "_parseObjectDataRadialScale");
const EPSILON = Number.EPSILON || 1e-14;
const getPoint = /* @__PURE__ */ __name((points, i) => i < points.length && !points[i].skip && points[i], "getPoint");
const getValueAxis = /* @__PURE__ */ __name((indexAxis) => indexAxis === "x" ? "y" : "x", "getValueAxis");
function splineCurve(firstPoint, middlePoint, afterPoint, t) {
  const previous = firstPoint.skip ? middlePoint : firstPoint;
  const current = middlePoint;
  const next = afterPoint.skip ? middlePoint : afterPoint;
  const d01 = distanceBetweenPoints(current, previous);
  const d12 = distanceBetweenPoints(next, current);
  let s01 = d01 / (d01 + d12);
  let s12 = d12 / (d01 + d12);
  s01 = isNaN(s01) ? 0 : s01;
  s12 = isNaN(s12) ? 0 : s12;
  const fa = t * s01;
  const fb = t * s12;
  return {
    previous: {
      x: current.x - fa * (next.x - previous.x),
      y: current.y - fa * (next.y - previous.y)
    },
    next: {
      x: current.x + fb * (next.x - previous.x),
      y: current.y + fb * (next.y - previous.y)
    }
  };
}
__name(splineCurve, "splineCurve");
function monotoneAdjust(points, deltaK, mK) {
  const pointsLen = points.length;
  let alphaK, betaK, tauK, squaredMagnitude, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen - 1; ++i) {
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent || !pointAfter) {
      continue;
    }
    if (almostEquals(deltaK[i], 0, EPSILON)) {
      mK[i] = mK[i + 1] = 0;
      continue;
    }
    alphaK = mK[i] / deltaK[i];
    betaK = mK[i + 1] / deltaK[i];
    squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2);
    if (squaredMagnitude <= 9) {
      continue;
    }
    tauK = 3 / Math.sqrt(squaredMagnitude);
    mK[i] = alphaK * tauK * deltaK[i];
    mK[i + 1] = betaK * tauK * deltaK[i];
  }
}
__name(monotoneAdjust, "monotoneAdjust");
function monotoneCompute(points, mK, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  let delta, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (let i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    const iPixel = pointCurrent[indexAxis];
    const vPixel = pointCurrent[valueAxis];
    if (pointBefore) {
      delta = (iPixel - pointBefore[indexAxis]) / 3;
      pointCurrent[`cp1${indexAxis}`] = iPixel - delta;
      pointCurrent[`cp1${valueAxis}`] = vPixel - delta * mK[i];
    }
    if (pointAfter) {
      delta = (pointAfter[indexAxis] - iPixel) / 3;
      pointCurrent[`cp2${indexAxis}`] = iPixel + delta;
      pointCurrent[`cp2${valueAxis}`] = vPixel + delta * mK[i];
    }
  }
}
__name(monotoneCompute, "monotoneCompute");
function splineCurveMonotone(points, indexAxis = "x") {
  const valueAxis = getValueAxis(indexAxis);
  const pointsLen = points.length;
  const deltaK = Array(pointsLen).fill(0);
  const mK = Array(pointsLen);
  let i, pointBefore, pointCurrent;
  let pointAfter = getPoint(points, 0);
  for (i = 0; i < pointsLen; ++i) {
    pointBefore = pointCurrent;
    pointCurrent = pointAfter;
    pointAfter = getPoint(points, i + 1);
    if (!pointCurrent) {
      continue;
    }
    if (pointAfter) {
      const slopeDelta = pointAfter[indexAxis] - pointCurrent[indexAxis];
      deltaK[i] = slopeDelta !== 0 ? (pointAfter[valueAxis] - pointCurrent[valueAxis]) / slopeDelta : 0;
    }
    mK[i] = !pointBefore ? deltaK[i] : !pointAfter ? deltaK[i - 1] : sign(deltaK[i - 1]) !== sign(deltaK[i]) ? 0 : (deltaK[i - 1] + deltaK[i]) / 2;
  }
  monotoneAdjust(points, deltaK, mK);
  monotoneCompute(points, mK, indexAxis);
}
__name(splineCurveMonotone, "splineCurveMonotone");
function capControlPoint(pt, min, max) {
  return Math.max(Math.min(pt, max), min);
}
__name(capControlPoint, "capControlPoint");
function capBezierPoints(points, area) {
  let i, ilen, point, inArea, inAreaPrev;
  let inAreaNext = _isPointInArea(points[0], area);
  for (i = 0, ilen = points.length; i < ilen; ++i) {
    inAreaPrev = inArea;
    inArea = inAreaNext;
    inAreaNext = i < ilen - 1 && _isPointInArea(points[i + 1], area);
    if (!inArea) {
      continue;
    }
    point = points[i];
    if (inAreaPrev) {
      point.cp1x = capControlPoint(point.cp1x, area.left, area.right);
      point.cp1y = capControlPoint(point.cp1y, area.top, area.bottom);
    }
    if (inAreaNext) {
      point.cp2x = capControlPoint(point.cp2x, area.left, area.right);
      point.cp2y = capControlPoint(point.cp2y, area.top, area.bottom);
    }
  }
}
__name(capBezierPoints, "capBezierPoints");
function _updateBezierControlPoints(points, options, area, loop, indexAxis) {
  let i, ilen, point, controlPoints;
  if (options.spanGaps) {
    points = points.filter((pt) => !pt.skip);
  }
  if (options.cubicInterpolationMode === "monotone") {
    splineCurveMonotone(points, indexAxis);
  } else {
    let prev = loop ? points[points.length - 1] : points[0];
    for (i = 0, ilen = points.length; i < ilen; ++i) {
      point = points[i];
      controlPoints = splineCurve(prev, point, points[Math.min(i + 1, ilen - (loop ? 0 : 1)) % ilen], options.tension);
      point.cp1x = controlPoints.previous.x;
      point.cp1y = controlPoints.previous.y;
      point.cp2x = controlPoints.next.x;
      point.cp2y = controlPoints.next.y;
      prev = point;
    }
  }
  if (options.capBezierPoints) {
    capBezierPoints(points, area);
  }
}
__name(_updateBezierControlPoints, "_updateBezierControlPoints");
function _isDomSupported() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}
__name(_isDomSupported, "_isDomSupported");
function _getParentNode(domNode) {
  let parent = domNode.parentNode;
  if (parent && parent.toString() === "[object ShadowRoot]") {
    parent = parent.host;
  }
  return parent;
}
__name(_getParentNode, "_getParentNode");
function parseMaxStyle(styleValue, node, parentProperty) {
  let valueInPixels;
  if (typeof styleValue === "string") {
    valueInPixels = parseInt(styleValue, 10);
    if (styleValue.indexOf("%") !== -1) {
      valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
    }
  } else {
    valueInPixels = styleValue;
  }
  return valueInPixels;
}
__name(parseMaxStyle, "parseMaxStyle");
const getComputedStyle$1 = /* @__PURE__ */ __name((element) => element.ownerDocument.defaultView.getComputedStyle(element, null), "getComputedStyle$1");
function getStyle(el, property) {
  return getComputedStyle$1(el).getPropertyValue(property);
}
__name(getStyle, "getStyle");
const positions = [
  "top",
  "right",
  "bottom",
  "left"
];
function getPositionedStyle(styles, style, suffix) {
  const result = {};
  suffix = suffix ? "-" + suffix : "";
  for (let i = 0; i < 4; i++) {
    const pos = positions[i];
    result[pos] = parseFloat(styles[style + "-" + pos + suffix]) || 0;
  }
  result.width = result.left + result.right;
  result.height = result.top + result.bottom;
  return result;
}
__name(getPositionedStyle, "getPositionedStyle");
const useOffsetPos = /* @__PURE__ */ __name((x, y, target) => (x > 0 || y > 0) && (!target || !target.shadowRoot), "useOffsetPos");
function getCanvasPosition(e, canvas2) {
  const touches = e.touches;
  const source = touches && touches.length ? touches[0] : e;
  const { offsetX, offsetY } = source;
  let box = false;
  let x, y;
  if (useOffsetPos(offsetX, offsetY, e.target)) {
    x = offsetX;
    y = offsetY;
  } else {
    const rect = canvas2.getBoundingClientRect();
    x = source.clientX - rect.left;
    y = source.clientY - rect.top;
    box = true;
  }
  return {
    x,
    y,
    box
  };
}
__name(getCanvasPosition, "getCanvasPosition");
function getRelativePosition(event, chart) {
  if ("native" in event) {
    return event;
  }
  const { canvas: canvas2, currentDevicePixelRatio } = chart;
  const style = getComputedStyle$1(canvas2);
  const borderBox = style.boxSizing === "border-box";
  const paddings = getPositionedStyle(style, "padding");
  const borders = getPositionedStyle(style, "border", "width");
  const { x, y, box } = getCanvasPosition(event, canvas2);
  const xOffset = paddings.left + (box && borders.left);
  const yOffset = paddings.top + (box && borders.top);
  let { width, height } = chart;
  if (borderBox) {
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  return {
    x: Math.round((x - xOffset) / width * canvas2.width / currentDevicePixelRatio),
    y: Math.round((y - yOffset) / height * canvas2.height / currentDevicePixelRatio)
  };
}
__name(getRelativePosition, "getRelativePosition");
function getContainerSize(canvas2, width, height) {
  let maxWidth, maxHeight;
  if (width === void 0 || height === void 0) {
    const container = _getParentNode(canvas2);
    if (!container) {
      width = canvas2.clientWidth;
      height = canvas2.clientHeight;
    } else {
      const rect = container.getBoundingClientRect();
      const containerStyle = getComputedStyle$1(container);
      const containerBorder = getPositionedStyle(containerStyle, "border", "width");
      const containerPadding = getPositionedStyle(containerStyle, "padding");
      width = rect.width - containerPadding.width - containerBorder.width;
      height = rect.height - containerPadding.height - containerBorder.height;
      maxWidth = parseMaxStyle(containerStyle.maxWidth, container, "clientWidth");
      maxHeight = parseMaxStyle(containerStyle.maxHeight, container, "clientHeight");
    }
  }
  return {
    width,
    height,
    maxWidth: maxWidth || INFINITY,
    maxHeight: maxHeight || INFINITY
  };
}
__name(getContainerSize, "getContainerSize");
const round1 = /* @__PURE__ */ __name((v) => Math.round(v * 10) / 10, "round1");
function getMaximumSize(canvas2, bbWidth, bbHeight, aspectRatio) {
  const style = getComputedStyle$1(canvas2);
  const margins = getPositionedStyle(style, "margin");
  const maxWidth = parseMaxStyle(style.maxWidth, canvas2, "clientWidth") || INFINITY;
  const maxHeight = parseMaxStyle(style.maxHeight, canvas2, "clientHeight") || INFINITY;
  const containerSize = getContainerSize(canvas2, bbWidth, bbHeight);
  let { width, height } = containerSize;
  if (style.boxSizing === "content-box") {
    const borders = getPositionedStyle(style, "border", "width");
    const paddings = getPositionedStyle(style, "padding");
    width -= paddings.width + borders.width;
    height -= paddings.height + borders.height;
  }
  width = Math.max(0, width - margins.width);
  height = Math.max(0, aspectRatio ? width / aspectRatio : height - margins.height);
  width = round1(Math.min(width, maxWidth, containerSize.maxWidth));
  height = round1(Math.min(height, maxHeight, containerSize.maxHeight));
  if (width && !height) {
    height = round1(width / 2);
  }
  const maintainHeight = bbWidth !== void 0 || bbHeight !== void 0;
  if (maintainHeight && aspectRatio && containerSize.height && height > containerSize.height) {
    height = containerSize.height;
    width = round1(Math.floor(height * aspectRatio));
  }
  return {
    width,
    height
  };
}
__name(getMaximumSize, "getMaximumSize");
function retinaScale(chart, forceRatio, forceStyle) {
  const pixelRatio = forceRatio || 1;
  const deviceHeight = Math.floor(chart.height * pixelRatio);
  const deviceWidth = Math.floor(chart.width * pixelRatio);
  chart.height = Math.floor(chart.height);
  chart.width = Math.floor(chart.width);
  const canvas2 = chart.canvas;
  if (canvas2.style && (forceStyle || !canvas2.style.height && !canvas2.style.width)) {
    canvas2.style.height = `${chart.height}px`;
    canvas2.style.width = `${chart.width}px`;
  }
  if (chart.currentDevicePixelRatio !== pixelRatio || canvas2.height !== deviceHeight || canvas2.width !== deviceWidth) {
    chart.currentDevicePixelRatio = pixelRatio;
    canvas2.height = deviceHeight;
    canvas2.width = deviceWidth;
    chart.ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    return true;
  }
  return false;
}
__name(retinaScale, "retinaScale");
const supportsEventListenerOptions = function() {
  let passiveSupported = false;
  try {
    const options = {
      get passive() {
        passiveSupported = true;
        return false;
      }
    };
    if (_isDomSupported()) {
      window.addEventListener("test", null, options);
      window.removeEventListener("test", null, options);
    }
  } catch (e) {
  }
  return passiveSupported;
}();
function readUsedSize(element, property) {
  const value = getStyle(element, property);
  const matches = value && value.match(/^(\d+)(\.\d+)?px$/);
  return matches ? +matches[1] : void 0;
}
__name(readUsedSize, "readUsedSize");
function _pointInLine(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y)
  };
}
__name(_pointInLine, "_pointInLine");
function _steppedInterpolation(p1, p2, t, mode) {
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: mode === "middle" ? t < 0.5 ? p1.y : p2.y : mode === "after" ? t < 1 ? p1.y : p2.y : t > 0 ? p2.y : p1.y
  };
}
__name(_steppedInterpolation, "_steppedInterpolation");
function _bezierInterpolation(p1, p2, t, mode) {
  const cp1 = {
    x: p1.cp2x,
    y: p1.cp2y
  };
  const cp2 = {
    x: p2.cp1x,
    y: p2.cp1y
  };
  const a = _pointInLine(p1, cp1, t);
  const b = _pointInLine(cp1, cp2, t);
  const c = _pointInLine(cp2, p2, t);
  const d = _pointInLine(a, b, t);
  const e = _pointInLine(b, c, t);
  return _pointInLine(d, e, t);
}
__name(_bezierInterpolation, "_bezierInterpolation");
const getRightToLeftAdapter = /* @__PURE__ */ __name(function(rectX, width) {
  return {
    x(x) {
      return rectX + rectX + width - x;
    },
    setWidth(w) {
      width = w;
    },
    textAlign(align) {
      if (align === "center") {
        return align;
      }
      return align === "right" ? "left" : "right";
    },
    xPlus(x, value) {
      return x - value;
    },
    leftForLtr(x, itemWidth) {
      return x - itemWidth;
    }
  };
}, "getRightToLeftAdapter");
const getLeftToRightAdapter = /* @__PURE__ */ __name(function() {
  return {
    x(x) {
      return x;
    },
    setWidth(w) {
    },
    textAlign(align) {
      return align;
    },
    xPlus(x, value) {
      return x + value;
    },
    leftForLtr(x, _itemWidth) {
      return x;
    }
  };
}, "getLeftToRightAdapter");
function getRtlAdapter(rtl, rectX, width) {
  return rtl ? getRightToLeftAdapter(rectX, width) : getLeftToRightAdapter();
}
__name(getRtlAdapter, "getRtlAdapter");
function overrideTextDirection(ctx, direction) {
  let style, original;
  if (direction === "ltr" || direction === "rtl") {
    style = ctx.canvas.style;
    original = [
      style.getPropertyValue("direction"),
      style.getPropertyPriority("direction")
    ];
    style.setProperty("direction", direction, "important");
    ctx.prevTextDirection = original;
  }
}
__name(overrideTextDirection, "overrideTextDirection");
function restoreTextDirection(ctx, original) {
  if (original !== void 0) {
    delete ctx.prevTextDirection;
    ctx.canvas.style.setProperty("direction", original[0], original[1]);
  }
}
__name(restoreTextDirection, "restoreTextDirection");
function propertyFn(property) {
  if (property === "angle") {
    return {
      between: _angleBetween,
      compare: _angleDiff,
      normalize: _normalizeAngle
    };
  }
  return {
    between: _isBetween,
    compare: (a, b) => a - b,
    normalize: (x) => x
  };
}
__name(propertyFn, "propertyFn");
function normalizeSegment({ start, end, count, loop, style }) {
  return {
    start: start % count,
    end: end % count,
    loop: loop && (end - start + 1) % count === 0,
    style
  };
}
__name(normalizeSegment, "normalizeSegment");
function getSegment(segment, points, bounds) {
  const { property, start: startBound, end: endBound } = bounds;
  const { between, normalize } = propertyFn(property);
  const count = points.length;
  let { start, end, loop } = segment;
  let i, ilen;
  if (loop) {
    start += count;
    end += count;
    for (i = 0, ilen = count; i < ilen; ++i) {
      if (!between(normalize(points[start % count][property]), startBound, endBound)) {
        break;
      }
      start--;
      end--;
    }
    start %= count;
    end %= count;
  }
  if (end < start) {
    end += count;
  }
  return {
    start,
    end,
    loop,
    style: segment.style
  };
}
__name(getSegment, "getSegment");
function _boundSegment(segment, points, bounds) {
  if (!bounds) {
    return [
      segment
    ];
  }
  const { property, start: startBound, end: endBound } = bounds;
  const count = points.length;
  const { compare, between, normalize } = propertyFn(property);
  const { start, end, loop, style } = getSegment(segment, points, bounds);
  const result = [];
  let inside = false;
  let subStart = null;
  let value, point, prevValue;
  const startIsBefore = /* @__PURE__ */ __name(() => between(startBound, prevValue, value) && compare(startBound, prevValue) !== 0, "startIsBefore");
  const endIsBefore = /* @__PURE__ */ __name(() => compare(endBound, value) === 0 || between(endBound, prevValue, value), "endIsBefore");
  const shouldStart = /* @__PURE__ */ __name(() => inside || startIsBefore(), "shouldStart");
  const shouldStop = /* @__PURE__ */ __name(() => !inside || endIsBefore(), "shouldStop");
  for (let i = start, prev = start; i <= end; ++i) {
    point = points[i % count];
    if (point.skip) {
      continue;
    }
    value = normalize(point[property]);
    if (value === prevValue) {
      continue;
    }
    inside = between(value, startBound, endBound);
    if (subStart === null && shouldStart()) {
      subStart = compare(value, startBound) === 0 ? i : prev;
    }
    if (subStart !== null && shouldStop()) {
      result.push(normalizeSegment({
        start: subStart,
        end: i,
        loop,
        count,
        style
      }));
      subStart = null;
    }
    prev = i;
    prevValue = value;
  }
  if (subStart !== null) {
    result.push(normalizeSegment({
      start: subStart,
      end,
      loop,
      count,
      style
    }));
  }
  return result;
}
__name(_boundSegment, "_boundSegment");
function _boundSegments(line, bounds) {
  const result = [];
  const segments = line.segments;
  for (let i = 0; i < segments.length; i++) {
    const sub = _boundSegment(segments[i], line.points, bounds);
    if (sub.length) {
      result.push(...sub);
    }
  }
  return result;
}
__name(_boundSegments, "_boundSegments");
function findStartAndEnd(points, count, loop, spanGaps) {
  let start = 0;
  let end = count - 1;
  if (loop && !spanGaps) {
    while (start < count && !points[start].skip) {
      start++;
    }
  }
  while (start < count && points[start].skip) {
    start++;
  }
  start %= count;
  if (loop) {
    end += start;
  }
  while (end > start && points[end % count].skip) {
    end--;
  }
  end %= count;
  return {
    start,
    end
  };
}
__name(findStartAndEnd, "findStartAndEnd");
function solidSegments(points, start, max, loop) {
  const count = points.length;
  const result = [];
  let last = start;
  let prev = points[start];
  let end;
  for (end = start + 1; end <= max; ++end) {
    const cur = points[end % count];
    if (cur.skip || cur.stop) {
      if (!prev.skip) {
        loop = false;
        result.push({
          start: start % count,
          end: (end - 1) % count,
          loop
        });
        start = last = cur.stop ? end : null;
      }
    } else {
      last = end;
      if (prev.skip) {
        start = end;
      }
    }
    prev = cur;
  }
  if (last !== null) {
    result.push({
      start: start % count,
      end: last % count,
      loop
    });
  }
  return result;
}
__name(solidSegments, "solidSegments");
function _computeSegments(line, segmentOptions) {
  const points = line.points;
  const spanGaps = line.options.spanGaps;
  const count = points.length;
  if (!count) {
    return [];
  }
  const loop = !!line._loop;
  const { start, end } = findStartAndEnd(points, count, loop, spanGaps);
  if (spanGaps === true) {
    return splitByStyles(line, [
      {
        start,
        end,
        loop
      }
    ], points, segmentOptions);
  }
  const max = end < start ? end + count : end;
  const completeLoop = !!line._fullLoop && start === 0 && end === count - 1;
  return splitByStyles(line, solidSegments(points, start, max, completeLoop), points, segmentOptions);
}
__name(_computeSegments, "_computeSegments");
function splitByStyles(line, segments, points, segmentOptions) {
  if (!segmentOptions || !segmentOptions.setContext || !points) {
    return segments;
  }
  return doSplitByStyles(line, segments, points, segmentOptions);
}
__name(splitByStyles, "splitByStyles");
function doSplitByStyles(line, segments, points, segmentOptions) {
  const chartContext = line._chart.getContext();
  const baseStyle = readStyle(line.options);
  const { _datasetIndex: datasetIndex, options: { spanGaps } } = line;
  const count = points.length;
  const result = [];
  let prevStyle = baseStyle;
  let start = segments[0].start;
  let i = start;
  function addStyle(s, e, l, st) {
    const dir = spanGaps ? -1 : 1;
    if (s === e) {
      return;
    }
    s += count;
    while (points[s % count].skip) {
      s -= dir;
    }
    while (points[e % count].skip) {
      e += dir;
    }
    if (s % count !== e % count) {
      result.push({
        start: s % count,
        end: e % count,
        loop: l,
        style: st
      });
      prevStyle = st;
      start = e % count;
    }
  }
  __name(addStyle, "addStyle");
  for (const segment of segments) {
    start = spanGaps ? start : segment.start;
    let prev = points[start % count];
    let style;
    for (i = start + 1; i <= segment.end; i++) {
      const pt = points[i % count];
      style = readStyle(segmentOptions.setContext(createContext(chartContext, {
        type: "segment",
        p0: prev,
        p1: pt,
        p0DataIndex: (i - 1) % count,
        p1DataIndex: i % count,
        datasetIndex
      })));
      if (styleChanged(style, prevStyle)) {
        addStyle(start, i - 1, segment.loop, prevStyle);
      }
      prev = pt;
      prevStyle = style;
    }
    if (start < i - 1) {
      addStyle(start, i - 1, segment.loop, prevStyle);
    }
  }
  return result;
}
__name(doSplitByStyles, "doSplitByStyles");
function readStyle(options) {
  return {
    backgroundColor: options.backgroundColor,
    borderCapStyle: options.borderCapStyle,
    borderDash: options.borderDash,
    borderDashOffset: options.borderDashOffset,
    borderJoinStyle: options.borderJoinStyle,
    borderWidth: options.borderWidth,
    borderColor: options.borderColor
  };
}
__name(readStyle, "readStyle");
function styleChanged(style, prevStyle) {
  if (!prevStyle) {
    return false;
  }
  const cache = [];
  const replacer = /* @__PURE__ */ __name(function(key, value) {
    if (!isPatternOrGradient(value)) {
      return value;
    }
    if (!cache.includes(value)) {
      cache.push(value);
    }
    return cache.indexOf(value);
  }, "replacer");
  return JSON.stringify(style, replacer) !== JSON.stringify(prevStyle, replacer);
}
__name(styleChanged, "styleChanged");
/*!
 * Chart.js v4.4.1
 * https://www.chartjs.org
 * (c) 2023 Chart.js Contributors
 * Released under the MIT License
 */
class Animator {
  static {
    __name(this, "Animator");
  }
  constructor() {
    this._request = null;
    this._charts = /* @__PURE__ */ new Map();
    this._running = false;
    this._lastDate = void 0;
  }
  _notify(chart, anims, date, type) {
    const callbacks = anims.listeners[type];
    const numSteps = anims.duration;
    callbacks.forEach((fn) => fn({
      chart,
      initial: anims.initial,
      numSteps,
      currentStep: Math.min(date - anims.start, numSteps)
    }));
  }
  _refresh() {
    if (this._request) {
      return;
    }
    this._running = true;
    this._request = requestAnimFrame.call(window, () => {
      this._update();
      this._request = null;
      if (this._running) {
        this._refresh();
      }
    });
  }
  _update(date = Date.now()) {
    let remaining = 0;
    this._charts.forEach((anims, chart) => {
      if (!anims.running || !anims.items.length) {
        return;
      }
      const items = anims.items;
      let i = items.length - 1;
      let draw2 = false;
      let item;
      for (; i >= 0; --i) {
        item = items[i];
        if (item._active) {
          if (item._total > anims.duration) {
            anims.duration = item._total;
          }
          item.tick(date);
          draw2 = true;
        } else {
          items[i] = items[items.length - 1];
          items.pop();
        }
      }
      if (draw2) {
        chart.draw();
        this._notify(chart, anims, date, "progress");
      }
      if (!items.length) {
        anims.running = false;
        this._notify(chart, anims, date, "complete");
        anims.initial = false;
      }
      remaining += items.length;
    });
    this._lastDate = date;
    if (remaining === 0) {
      this._running = false;
    }
  }
  _getAnims(chart) {
    const charts = this._charts;
    let anims = charts.get(chart);
    if (!anims) {
      anims = {
        running: false,
        initial: true,
        items: [],
        listeners: {
          complete: [],
          progress: []
        }
      };
      charts.set(chart, anims);
    }
    return anims;
  }
  listen(chart, event, cb) {
    this._getAnims(chart).listeners[event].push(cb);
  }
  add(chart, items) {
    if (!items || !items.length) {
      return;
    }
    this._getAnims(chart).items.push(...items);
  }
  has(chart) {
    return this._getAnims(chart).items.length > 0;
  }
  start(chart) {
    const anims = this._charts.get(chart);
    if (!anims) {
      return;
    }
    anims.running = true;
    anims.start = Date.now();
    anims.duration = anims.items.reduce((acc, cur) => Math.max(acc, cur._duration), 0);
    this._refresh();
  }
  running(chart) {
    if (!this._running) {
      return false;
    }
    const anims = this._charts.get(chart);
    if (!anims || !anims.running || !anims.items.length) {
      return false;
    }
    return true;
  }
  stop(chart) {
    const anims = this._charts.get(chart);
    if (!anims || !anims.items.length) {
      return;
    }
    const items = anims.items;
    let i = items.length - 1;
    for (; i >= 0; --i) {
      items[i].cancel();
    }
    anims.items = [];
    this._notify(chart, anims, Date.now(), "complete");
  }
  remove(chart) {
    return this._charts.delete(chart);
  }
}
var animator = /* @__PURE__ */ new Animator();
const transparent = "transparent";
const interpolators = {
  boolean(from2, to2, factor) {
    return factor > 0.5 ? to2 : from2;
  },
  color(from2, to2, factor) {
    const c0 = color(from2 || transparent);
    const c1 = c0.valid && color(to2 || transparent);
    return c1 && c1.valid ? c1.mix(c0, factor).hexString() : to2;
  },
  number(from2, to2, factor) {
    return from2 + (to2 - from2) * factor;
  }
};
class Animation {
  static {
    __name(this, "Animation");
  }
  constructor(cfg, target, prop, to2) {
    const currentValue = target[prop];
    to2 = resolve([
      cfg.to,
      to2,
      currentValue,
      cfg.from
    ]);
    const from2 = resolve([
      cfg.from,
      currentValue,
      to2
    ]);
    this._active = true;
    this._fn = cfg.fn || interpolators[cfg.type || typeof from2];
    this._easing = effects[cfg.easing] || effects.linear;
    this._start = Math.floor(Date.now() + (cfg.delay || 0));
    this._duration = this._total = Math.floor(cfg.duration);
    this._loop = !!cfg.loop;
    this._target = target;
    this._prop = prop;
    this._from = from2;
    this._to = to2;
    this._promises = void 0;
  }
  active() {
    return this._active;
  }
  update(cfg, to2, date) {
    if (this._active) {
      this._notify(false);
      const currentValue = this._target[this._prop];
      const elapsed = date - this._start;
      const remain = this._duration - elapsed;
      this._start = date;
      this._duration = Math.floor(Math.max(remain, cfg.duration));
      this._total += elapsed;
      this._loop = !!cfg.loop;
      this._to = resolve([
        cfg.to,
        to2,
        currentValue,
        cfg.from
      ]);
      this._from = resolve([
        cfg.from,
        currentValue,
        to2
      ]);
    }
  }
  cancel() {
    if (this._active) {
      this.tick(Date.now());
      this._active = false;
      this._notify(false);
    }
  }
  tick(date) {
    const elapsed = date - this._start;
    const duration = this._duration;
    const prop = this._prop;
    const from2 = this._from;
    const loop = this._loop;
    const to2 = this._to;
    let factor;
    this._active = from2 !== to2 && (loop || elapsed < duration);
    if (!this._active) {
      this._target[prop] = to2;
      this._notify(true);
      return;
    }
    if (elapsed < 0) {
      this._target[prop] = from2;
      return;
    }
    factor = elapsed / duration % 2;
    factor = loop && factor > 1 ? 2 - factor : factor;
    factor = this._easing(Math.min(1, Math.max(0, factor)));
    this._target[prop] = this._fn(from2, to2, factor);
  }
  wait() {
    const promises = this._promises || (this._promises = []);
    return new Promise((res, rej) => {
      promises.push({
        res,
        rej
      });
    });
  }
  _notify(resolved) {
    const method = resolved ? "res" : "rej";
    const promises = this._promises || [];
    for (let i = 0; i < promises.length; i++) {
      promises[i][method]();
    }
  }
}
class Animations {
  static {
    __name(this, "Animations");
  }
  constructor(chart, config) {
    this._chart = chart;
    this._properties = /* @__PURE__ */ new Map();
    this.configure(config);
  }
  configure(config) {
    if (!isObject(config)) {
      return;
    }
    const animationOptions = Object.keys(defaults$1.animation);
    const animatedProps = this._properties;
    Object.getOwnPropertyNames(config).forEach((key) => {
      const cfg = config[key];
      if (!isObject(cfg)) {
        return;
      }
      const resolved = {};
      for (const option of animationOptions) {
        resolved[option] = cfg[option];
      }
      (isArray(cfg.properties) && cfg.properties || [
        key
      ]).forEach((prop) => {
        if (prop === key || !animatedProps.has(prop)) {
          animatedProps.set(prop, resolved);
        }
      });
    });
  }
  _animateOptions(target, values) {
    const newOptions = values.options;
    const options = resolveTargetOptions(target, newOptions);
    if (!options) {
      return [];
    }
    const animations = this._createAnimations(options, newOptions);
    if (newOptions.$shared) {
      awaitAll(target.options.$animations, newOptions).then(() => {
        target.options = newOptions;
      }, () => {
      });
    }
    return animations;
  }
  _createAnimations(target, values) {
    const animatedProps = this._properties;
    const animations = [];
    const running = target.$animations || (target.$animations = {});
    const props = Object.keys(values);
    const date = Date.now();
    let i;
    for (i = props.length - 1; i >= 0; --i) {
      const prop = props[i];
      if (prop.charAt(0) === "$") {
        continue;
      }
      if (prop === "options") {
        animations.push(...this._animateOptions(target, values));
        continue;
      }
      const value = values[prop];
      let animation = running[prop];
      const cfg = animatedProps.get(prop);
      if (animation) {
        if (cfg && animation.active()) {
          animation.update(cfg, value, date);
          continue;
        } else {
          animation.cancel();
        }
      }
      if (!cfg || !cfg.duration) {
        target[prop] = value;
        continue;
      }
      running[prop] = animation = new Animation(cfg, target, prop, value);
      animations.push(animation);
    }
    return animations;
  }
  update(target, values) {
    if (this._properties.size === 0) {
      Object.assign(target, values);
      return;
    }
    const animations = this._createAnimations(target, values);
    if (animations.length) {
      animator.add(this._chart, animations);
      return true;
    }
  }
}
function awaitAll(animations, properties) {
  const running = [];
  const keys = Object.keys(properties);
  for (let i = 0; i < keys.length; i++) {
    const anim = animations[keys[i]];
    if (anim && anim.active()) {
      running.push(anim.wait());
    }
  }
  return Promise.all(running);
}
__name(awaitAll, "awaitAll");
function resolveTargetOptions(target, newOptions) {
  if (!newOptions) {
    return;
  }
  let options = target.options;
  if (!options) {
    target.options = newOptions;
    return;
  }
  if (options.$shared) {
    target.options = options = Object.assign({}, options, {
      $shared: false,
      $animations: {}
    });
  }
  return options;
}
__name(resolveTargetOptions, "resolveTargetOptions");
function scaleClip(scale, allowedOverflow) {
  const opts = scale && scale.options || {};
  const reverse = opts.reverse;
  const min = opts.min === void 0 ? allowedOverflow : 0;
  const max = opts.max === void 0 ? allowedOverflow : 0;
  return {
    start: reverse ? max : min,
    end: reverse ? min : max
  };
}
__name(scaleClip, "scaleClip");
function defaultClip(xScale, yScale, allowedOverflow) {
  if (allowedOverflow === false) {
    return false;
  }
  const x = scaleClip(xScale, allowedOverflow);
  const y = scaleClip(yScale, allowedOverflow);
  return {
    top: y.end,
    right: x.end,
    bottom: y.start,
    left: x.start
  };
}
__name(defaultClip, "defaultClip");
function toClip(value) {
  let t, r, b, l;
  if (isObject(value)) {
    t = value.top;
    r = value.right;
    b = value.bottom;
    l = value.left;
  } else {
    t = r = b = l = value;
  }
  return {
    top: t,
    right: r,
    bottom: b,
    left: l,
    disabled: value === false
  };
}
__name(toClip, "toClip");
function getSortedDatasetIndices(chart, filterVisible) {
  const keys = [];
  const metasets = chart._getSortedDatasetMetas(filterVisible);
  let i, ilen;
  for (i = 0, ilen = metasets.length; i < ilen; ++i) {
    keys.push(metasets[i].index);
  }
  return keys;
}
__name(getSortedDatasetIndices, "getSortedDatasetIndices");
function applyStack(stack, value, dsIndex, options = {}) {
  const keys = stack.keys;
  const singleMode = options.mode === "single";
  let i, ilen, datasetIndex, otherValue;
  if (value === null) {
    return;
  }
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    datasetIndex = +keys[i];
    if (datasetIndex === dsIndex) {
      if (options.all) {
        continue;
      }
      break;
    }
    otherValue = stack.values[datasetIndex];
    if (isNumberFinite(otherValue) && (singleMode || value === 0 || sign(value) === sign(otherValue))) {
      value += otherValue;
    }
  }
  return value;
}
__name(applyStack, "applyStack");
function convertObjectDataToArray(data) {
  const keys = Object.keys(data);
  const adata = new Array(keys.length);
  let i, ilen, key;
  for (i = 0, ilen = keys.length; i < ilen; ++i) {
    key = keys[i];
    adata[i] = {
      x: key,
      y: data[key]
    };
  }
  return adata;
}
__name(convertObjectDataToArray, "convertObjectDataToArray");
function isStacked(scale, meta) {
  const stacked = scale && scale.options.stacked;
  return stacked || stacked === void 0 && meta.stack !== void 0;
}
__name(isStacked, "isStacked");
function getStackKey(indexScale, valueScale, meta) {
  return `${indexScale.id}.${valueScale.id}.${meta.stack || meta.type}`;
}
__name(getStackKey, "getStackKey");
function getUserBounds(scale) {
  const { min, max, minDefined, maxDefined } = scale.getUserBounds();
  return {
    min: minDefined ? min : Number.NEGATIVE_INFINITY,
    max: maxDefined ? max : Number.POSITIVE_INFINITY
  };
}
__name(getUserBounds, "getUserBounds");
function getOrCreateStack(stacks, stackKey, indexValue) {
  const subStack = stacks[stackKey] || (stacks[stackKey] = {});
  return subStack[indexValue] || (subStack[indexValue] = {});
}
__name(getOrCreateStack, "getOrCreateStack");
function getLastIndexInStack(stack, vScale, positive, type) {
  for (const meta of vScale.getMatchingVisibleMetas(type).reverse()) {
    const value = stack[meta.index];
    if (positive && value > 0 || !positive && value < 0) {
      return meta.index;
    }
  }
  return null;
}
__name(getLastIndexInStack, "getLastIndexInStack");
function updateStacks(controller, parsed) {
  const { chart, _cachedMeta: meta } = controller;
  const stacks = chart._stacks || (chart._stacks = {});
  const { iScale, vScale, index: datasetIndex } = meta;
  const iAxis = iScale.axis;
  const vAxis = vScale.axis;
  const key = getStackKey(iScale, vScale, meta);
  const ilen = parsed.length;
  let stack;
  for (let i = 0; i < ilen; ++i) {
    const item = parsed[i];
    const { [iAxis]: index2, [vAxis]: value } = item;
    const itemStacks = item._stacks || (item._stacks = {});
    stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index2);
    stack[datasetIndex] = value;
    stack._top = getLastIndexInStack(stack, vScale, true, meta.type);
    stack._bottom = getLastIndexInStack(stack, vScale, false, meta.type);
    const visualValues = stack._visualValues || (stack._visualValues = {});
    visualValues[datasetIndex] = value;
  }
}
__name(updateStacks, "updateStacks");
function getFirstScaleId(chart, axis) {
  const scales2 = chart.scales;
  return Object.keys(scales2).filter((key) => scales2[key].axis === axis).shift();
}
__name(getFirstScaleId, "getFirstScaleId");
function createDatasetContext(parent, index2) {
  return createContext(parent, {
    active: false,
    dataset: void 0,
    datasetIndex: index2,
    index: index2,
    mode: "default",
    type: "dataset"
  });
}
__name(createDatasetContext, "createDatasetContext");
function createDataContext(parent, index2, element) {
  return createContext(parent, {
    active: false,
    dataIndex: index2,
    parsed: void 0,
    raw: void 0,
    element,
    index: index2,
    mode: "default",
    type: "data"
  });
}
__name(createDataContext, "createDataContext");
function clearStacks(meta, items) {
  const datasetIndex = meta.controller.index;
  const axis = meta.vScale && meta.vScale.axis;
  if (!axis) {
    return;
  }
  items = items || meta._parsed;
  for (const parsed of items) {
    const stacks = parsed._stacks;
    if (!stacks || stacks[axis] === void 0 || stacks[axis][datasetIndex] === void 0) {
      return;
    }
    delete stacks[axis][datasetIndex];
    if (stacks[axis]._visualValues !== void 0 && stacks[axis]._visualValues[datasetIndex] !== void 0) {
      delete stacks[axis]._visualValues[datasetIndex];
    }
  }
}
__name(clearStacks, "clearStacks");
const isDirectUpdateMode = /* @__PURE__ */ __name((mode) => mode === "reset" || mode === "none", "isDirectUpdateMode");
const cloneIfNotShared = /* @__PURE__ */ __name((cached, shared) => shared ? cached : Object.assign({}, cached), "cloneIfNotShared");
const createStack = /* @__PURE__ */ __name((canStack, meta, chart) => canStack && !meta.hidden && meta._stacked && {
  keys: getSortedDatasetIndices(chart, true),
  values: null
}, "createStack");
class DatasetController {
  static {
    __name(this, "DatasetController");
  }
  static defaults = {};
  static datasetElementType = null;
  static dataElementType = null;
  constructor(chart, datasetIndex) {
    this.chart = chart;
    this._ctx = chart.ctx;
    this.index = datasetIndex;
    this._cachedDataOpts = {};
    this._cachedMeta = this.getMeta();
    this._type = this._cachedMeta.type;
    this.options = void 0;
    this._parsing = false;
    this._data = void 0;
    this._objectData = void 0;
    this._sharedOptions = void 0;
    this._drawStart = void 0;
    this._drawCount = void 0;
    this.enableOptionSharing = false;
    this.supportsDecimation = false;
    this.$context = void 0;
    this._syncList = [];
    this.datasetElementType = new.target.datasetElementType;
    this.dataElementType = new.target.dataElementType;
    this.initialize();
  }
  initialize() {
    const meta = this._cachedMeta;
    this.configure();
    this.linkScales();
    meta._stacked = isStacked(meta.vScale, meta);
    this.addElements();
    if (this.options.fill && !this.chart.isPluginEnabled("filler")) {
      console.warn("Tried to use the 'fill' option without the 'Filler' plugin enabled. Please import and register the 'Filler' plugin and make sure it is not disabled in the options");
    }
  }
  updateIndex(datasetIndex) {
    if (this.index !== datasetIndex) {
      clearStacks(this._cachedMeta);
    }
    this.index = datasetIndex;
  }
  linkScales() {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    const chooseId = /* @__PURE__ */ __name((axis, x, y, r) => axis === "x" ? x : axis === "r" ? r : y, "chooseId");
    const xid = meta.xAxisID = valueOrDefault(dataset.xAxisID, getFirstScaleId(chart, "x"));
    const yid = meta.yAxisID = valueOrDefault(dataset.yAxisID, getFirstScaleId(chart, "y"));
    const rid = meta.rAxisID = valueOrDefault(dataset.rAxisID, getFirstScaleId(chart, "r"));
    const indexAxis = meta.indexAxis;
    const iid = meta.iAxisID = chooseId(indexAxis, xid, yid, rid);
    const vid = meta.vAxisID = chooseId(indexAxis, yid, xid, rid);
    meta.xScale = this.getScaleForId(xid);
    meta.yScale = this.getScaleForId(yid);
    meta.rScale = this.getScaleForId(rid);
    meta.iScale = this.getScaleForId(iid);
    meta.vScale = this.getScaleForId(vid);
  }
  getDataset() {
    return this.chart.data.datasets[this.index];
  }
  getMeta() {
    return this.chart.getDatasetMeta(this.index);
  }
  getScaleForId(scaleID) {
    return this.chart.scales[scaleID];
  }
  _getOtherScale(scale) {
    const meta = this._cachedMeta;
    return scale === meta.iScale ? meta.vScale : meta.iScale;
  }
  reset() {
    this._update("reset");
  }
  _destroy() {
    const meta = this._cachedMeta;
    if (this._data) {
      unlistenArrayEvents(this._data, this);
    }
    if (meta._stacked) {
      clearStacks(meta);
    }
  }
  _dataCheck() {
    const dataset = this.getDataset();
    const data = dataset.data || (dataset.data = []);
    const _data = this._data;
    if (isObject(data)) {
      this._data = convertObjectDataToArray(data);
    } else if (_data !== data) {
      if (_data) {
        unlistenArrayEvents(_data, this);
        const meta = this._cachedMeta;
        clearStacks(meta);
        meta._parsed = [];
      }
      if (data && Object.isExtensible(data)) {
        listenArrayEvents(data, this);
      }
      this._syncList = [];
      this._data = data;
    }
  }
  addElements() {
    const meta = this._cachedMeta;
    this._dataCheck();
    if (this.datasetElementType) {
      meta.dataset = new this.datasetElementType();
    }
  }
  buildOrUpdateElements(resetNewElements) {
    const meta = this._cachedMeta;
    const dataset = this.getDataset();
    let stackChanged = false;
    this._dataCheck();
    const oldStacked = meta._stacked;
    meta._stacked = isStacked(meta.vScale, meta);
    if (meta.stack !== dataset.stack) {
      stackChanged = true;
      clearStacks(meta);
      meta.stack = dataset.stack;
    }
    this._resyncElements(resetNewElements);
    if (stackChanged || oldStacked !== meta._stacked) {
      updateStacks(this, meta._parsed);
    }
  }
  configure() {
    const config = this.chart.config;
    const scopeKeys = config.datasetScopeKeys(this._type);
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys, true);
    this.options = config.createResolver(scopes, this.getContext());
    this._parsing = this.options.parsing;
    this._cachedDataOpts = {};
  }
  parse(start, count) {
    const { _cachedMeta: meta, _data: data } = this;
    const { iScale, _stacked } = meta;
    const iAxis = iScale.axis;
    let sorted = start === 0 && count === data.length ? true : meta._sorted;
    let prev = start > 0 && meta._parsed[start - 1];
    let i, cur, parsed;
    if (this._parsing === false) {
      meta._parsed = data;
      meta._sorted = true;
      parsed = data;
    } else {
      if (isArray(data[start])) {
        parsed = this.parseArrayData(meta, data, start, count);
      } else if (isObject(data[start])) {
        parsed = this.parseObjectData(meta, data, start, count);
      } else {
        parsed = this.parsePrimitiveData(meta, data, start, count);
      }
      const isNotInOrderComparedToPrev = /* @__PURE__ */ __name(() => cur[iAxis] === null || prev && cur[iAxis] < prev[iAxis], "isNotInOrderComparedToPrev");
      for (i = 0; i < count; ++i) {
        meta._parsed[i + start] = cur = parsed[i];
        if (sorted) {
          if (isNotInOrderComparedToPrev()) {
            sorted = false;
          }
          prev = cur;
        }
      }
      meta._sorted = sorted;
    }
    if (_stacked) {
      updateStacks(this, parsed);
    }
  }
  parsePrimitiveData(meta, data, start, count) {
    const { iScale, vScale } = meta;
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const labels = iScale.getLabels();
    const singleScale = iScale === vScale;
    const parsed = new Array(count);
    let i, ilen, index2;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index2 = i + start;
      parsed[i] = {
        [iAxis]: singleScale || iScale.parse(labels[index2], index2),
        [vAxis]: vScale.parse(data[index2], index2)
      };
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const { xScale, yScale } = meta;
    const parsed = new Array(count);
    let i, ilen, index2, item;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index2 = i + start;
      item = data[index2];
      parsed[i] = {
        x: xScale.parse(item[0], index2),
        y: yScale.parse(item[1], index2)
      };
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const { xScale, yScale } = meta;
    const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
    const parsed = new Array(count);
    let i, ilen, index2, item;
    for (i = 0, ilen = count; i < ilen; ++i) {
      index2 = i + start;
      item = data[index2];
      parsed[i] = {
        x: xScale.parse(resolveObjectKey(item, xAxisKey), index2),
        y: yScale.parse(resolveObjectKey(item, yAxisKey), index2)
      };
    }
    return parsed;
  }
  getParsed(index2) {
    return this._cachedMeta._parsed[index2];
  }
  getDataElement(index2) {
    return this._cachedMeta.data[index2];
  }
  applyStack(scale, parsed, mode) {
    const chart = this.chart;
    const meta = this._cachedMeta;
    const value = parsed[scale.axis];
    const stack = {
      keys: getSortedDatasetIndices(chart, true),
      values: parsed._stacks[scale.axis]._visualValues
    };
    return applyStack(stack, value, meta.index, {
      mode
    });
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    const parsedValue = parsed[scale.axis];
    let value = parsedValue === null ? NaN : parsedValue;
    const values = stack && parsed._stacks[scale.axis];
    if (stack && values) {
      stack.values = values;
      value = applyStack(stack, parsedValue, this._cachedMeta.index);
    }
    range.min = Math.min(range.min, value);
    range.max = Math.max(range.max, value);
  }
  getMinMax(scale, canStack) {
    const meta = this._cachedMeta;
    const _parsed = meta._parsed;
    const sorted = meta._sorted && scale === meta.iScale;
    const ilen = _parsed.length;
    const otherScale = this._getOtherScale(scale);
    const stack = createStack(canStack, meta, this.chart);
    const range = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    const { min: otherMin, max: otherMax } = getUserBounds(otherScale);
    let i, parsed;
    function _skip() {
      parsed = _parsed[i];
      const otherValue = parsed[otherScale.axis];
      return !isNumberFinite(parsed[scale.axis]) || otherMin > otherValue || otherMax < otherValue;
    }
    __name(_skip, "_skip");
    for (i = 0; i < ilen; ++i) {
      if (_skip()) {
        continue;
      }
      this.updateRangeFromParsed(range, scale, parsed, stack);
      if (sorted) {
        break;
      }
    }
    if (sorted) {
      for (i = ilen - 1; i >= 0; --i) {
        if (_skip()) {
          continue;
        }
        this.updateRangeFromParsed(range, scale, parsed, stack);
        break;
      }
    }
    return range;
  }
  getAllParsedValues(scale) {
    const parsed = this._cachedMeta._parsed;
    const values = [];
    let i, ilen, value;
    for (i = 0, ilen = parsed.length; i < ilen; ++i) {
      value = parsed[i][scale.axis];
      if (isNumberFinite(value)) {
        values.push(value);
      }
    }
    return values;
  }
  getMaxOverflow() {
    return false;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const vScale = meta.vScale;
    const parsed = this.getParsed(index2);
    return {
      label: iScale ? "" + iScale.getLabelForValue(parsed[iScale.axis]) : "",
      value: vScale ? "" + vScale.getLabelForValue(parsed[vScale.axis]) : ""
    };
  }
  _update(mode) {
    const meta = this._cachedMeta;
    this.update(mode || "default");
    meta._clip = toClip(valueOrDefault(this.options.clip, defaultClip(meta.xScale, meta.yScale, this.getMaxOverflow())));
  }
  update(mode) {
  }
  draw() {
    const ctx = this._ctx;
    const chart = this.chart;
    const meta = this._cachedMeta;
    const elements2 = meta.data || [];
    const area = chart.chartArea;
    const active = [];
    const start = this._drawStart || 0;
    const count = this._drawCount || elements2.length - start;
    const drawActiveElementsOnTop = this.options.drawActiveElementsOnTop;
    let i;
    if (meta.dataset) {
      meta.dataset.draw(ctx, area, start, count);
    }
    for (i = start; i < start + count; ++i) {
      const element = elements2[i];
      if (element.hidden) {
        continue;
      }
      if (element.active && drawActiveElementsOnTop) {
        active.push(element);
      } else {
        element.draw(ctx, area);
      }
    }
    for (i = 0; i < active.length; ++i) {
      active[i].draw(ctx, area);
    }
  }
  getStyle(index2, active) {
    const mode = active ? "active" : "default";
    return index2 === void 0 && this._cachedMeta.dataset ? this.resolveDatasetElementOptions(mode) : this.resolveDataElementOptions(index2 || 0, mode);
  }
  getContext(index2, active, mode) {
    const dataset = this.getDataset();
    let context;
    if (index2 >= 0 && index2 < this._cachedMeta.data.length) {
      const element = this._cachedMeta.data[index2];
      context = element.$context || (element.$context = createDataContext(this.getContext(), index2, element));
      context.parsed = this.getParsed(index2);
      context.raw = dataset.data[index2];
      context.index = context.dataIndex = index2;
    } else {
      context = this.$context || (this.$context = createDatasetContext(this.chart.getContext(), this.index));
      context.dataset = dataset;
      context.index = context.datasetIndex = this.index;
    }
    context.active = !!active;
    context.mode = mode;
    return context;
  }
  resolveDatasetElementOptions(mode) {
    return this._resolveElementOptions(this.datasetElementType.id, mode);
  }
  resolveDataElementOptions(index2, mode) {
    return this._resolveElementOptions(this.dataElementType.id, mode, index2);
  }
  _resolveElementOptions(elementType, mode = "default", index2) {
    const active = mode === "active";
    const cache = this._cachedDataOpts;
    const cacheKey = elementType + "-" + mode;
    const cached = cache[cacheKey];
    const sharing = this.enableOptionSharing && defined(index2);
    if (cached) {
      return cloneIfNotShared(cached, sharing);
    }
    const config = this.chart.config;
    const scopeKeys = config.datasetElementScopeKeys(this._type, elementType);
    const prefixes = active ? [
      `${elementType}Hover`,
      "hover",
      elementType,
      ""
    ] : [
      elementType,
      ""
    ];
    const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
    const names2 = Object.keys(defaults$1.elements[elementType]);
    const context = /* @__PURE__ */ __name(() => this.getContext(index2, active, mode), "context");
    const values = config.resolveNamedOptions(scopes, names2, context, prefixes);
    if (values.$shared) {
      values.$shared = sharing;
      cache[cacheKey] = Object.freeze(cloneIfNotShared(values, sharing));
    }
    return values;
  }
  _resolveAnimations(index2, transition, active) {
    const chart = this.chart;
    const cache = this._cachedDataOpts;
    const cacheKey = `animation-${transition}`;
    const cached = cache[cacheKey];
    if (cached) {
      return cached;
    }
    let options;
    if (chart.options.animation !== false) {
      const config = this.chart.config;
      const scopeKeys = config.datasetAnimationScopeKeys(this._type, transition);
      const scopes = config.getOptionScopes(this.getDataset(), scopeKeys);
      options = config.createResolver(scopes, this.getContext(index2, active, transition));
    }
    const animations = new Animations(chart, options && options.animations);
    if (options && options._cacheable) {
      cache[cacheKey] = Object.freeze(animations);
    }
    return animations;
  }
  getSharedOptions(options) {
    if (!options.$shared) {
      return;
    }
    return this._sharedOptions || (this._sharedOptions = Object.assign({}, options));
  }
  includeOptions(mode, sharedOptions) {
    return !sharedOptions || isDirectUpdateMode(mode) || this.chart._animationsDisabled;
  }
  _getSharedOptions(start, mode) {
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const previouslySharedOptions = this._sharedOptions;
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions) || sharedOptions !== previouslySharedOptions;
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
    return {
      sharedOptions,
      includeOptions
    };
  }
  updateElement(element, index2, properties, mode) {
    if (isDirectUpdateMode(mode)) {
      Object.assign(element, properties);
    } else {
      this._resolveAnimations(index2, mode).update(element, properties);
    }
  }
  updateSharedOptions(sharedOptions, mode, newOptions) {
    if (sharedOptions && !isDirectUpdateMode(mode)) {
      this._resolveAnimations(void 0, mode).update(sharedOptions, newOptions);
    }
  }
  _setStyle(element, index2, mode, active) {
    element.active = active;
    const options = this.getStyle(index2, active);
    this._resolveAnimations(index2, mode, active).update(element, {
      options: !active && this.getSharedOptions(options) || options
    });
  }
  removeHoverStyle(element, datasetIndex, index2) {
    this._setStyle(element, index2, "active", false);
  }
  setHoverStyle(element, datasetIndex, index2) {
    this._setStyle(element, index2, "active", true);
  }
  _removeDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;
    if (element) {
      this._setStyle(element, void 0, "active", false);
    }
  }
  _setDatasetHoverStyle() {
    const element = this._cachedMeta.dataset;
    if (element) {
      this._setStyle(element, void 0, "active", true);
    }
  }
  _resyncElements(resetNewElements) {
    const data = this._data;
    const elements2 = this._cachedMeta.data;
    for (const [method, arg1, arg2] of this._syncList) {
      this[method](arg1, arg2);
    }
    this._syncList = [];
    const numMeta = elements2.length;
    const numData = data.length;
    const count = Math.min(numData, numMeta);
    if (count) {
      this.parse(0, count);
    }
    if (numData > numMeta) {
      this._insertElements(numMeta, numData - numMeta, resetNewElements);
    } else if (numData < numMeta) {
      this._removeElements(numData, numMeta - numData);
    }
  }
  _insertElements(start, count, resetNewElements = true) {
    const meta = this._cachedMeta;
    const data = meta.data;
    const end = start + count;
    let i;
    const move = /* @__PURE__ */ __name((arr) => {
      arr.length += count;
      for (i = arr.length - 1; i >= end; i--) {
        arr[i] = arr[i - count];
      }
    }, "move");
    move(data);
    for (i = start; i < end; ++i) {
      data[i] = new this.dataElementType();
    }
    if (this._parsing) {
      move(meta._parsed);
    }
    this.parse(start, count);
    if (resetNewElements) {
      this.updateElements(data, start, count, "reset");
    }
  }
  updateElements(element, start, count, mode) {
  }
  _removeElements(start, count) {
    const meta = this._cachedMeta;
    if (this._parsing) {
      const removed = meta._parsed.splice(start, count);
      if (meta._stacked) {
        clearStacks(meta, removed);
      }
    }
    meta.data.splice(start, count);
  }
  _sync(args) {
    if (this._parsing) {
      this._syncList.push(args);
    } else {
      const [method, arg1, arg2] = args;
      this[method](arg1, arg2);
    }
    this.chart._dataChanges.push([
      this.index,
      ...args
    ]);
  }
  _onDataPush() {
    const count = arguments.length;
    this._sync([
      "_insertElements",
      this.getDataset().data.length - count,
      count
    ]);
  }
  _onDataPop() {
    this._sync([
      "_removeElements",
      this._cachedMeta.data.length - 1,
      1
    ]);
  }
  _onDataShift() {
    this._sync([
      "_removeElements",
      0,
      1
    ]);
  }
  _onDataSplice(start, count) {
    if (count) {
      this._sync([
        "_removeElements",
        start,
        count
      ]);
    }
    const newCount = arguments.length - 2;
    if (newCount) {
      this._sync([
        "_insertElements",
        start,
        newCount
      ]);
    }
  }
  _onDataUnshift() {
    this._sync([
      "_insertElements",
      0,
      arguments.length
    ]);
  }
}
function getAllScaleValues(scale, type) {
  if (!scale._cache.$bar) {
    const visibleMetas = scale.getMatchingVisibleMetas(type);
    let values = [];
    for (let i = 0, ilen = visibleMetas.length; i < ilen; i++) {
      values = values.concat(visibleMetas[i].controller.getAllParsedValues(scale));
    }
    scale._cache.$bar = _arrayUnique(values.sort((a, b) => a - b));
  }
  return scale._cache.$bar;
}
__name(getAllScaleValues, "getAllScaleValues");
function computeMinSampleSize(meta) {
  const scale = meta.iScale;
  const values = getAllScaleValues(scale, meta.type);
  let min = scale._length;
  let i, ilen, curr, prev;
  const updateMinAndPrev = /* @__PURE__ */ __name(() => {
    if (curr === 32767 || curr === -32768) {
      return;
    }
    if (defined(prev)) {
      min = Math.min(min, Math.abs(curr - prev) || min);
    }
    prev = curr;
  }, "updateMinAndPrev");
  for (i = 0, ilen = values.length; i < ilen; ++i) {
    curr = scale.getPixelForValue(values[i]);
    updateMinAndPrev();
  }
  prev = void 0;
  for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
    curr = scale.getPixelForTick(i);
    updateMinAndPrev();
  }
  return min;
}
__name(computeMinSampleSize, "computeMinSampleSize");
function computeFitCategoryTraits(index2, ruler, options, stackCount) {
  const thickness = options.barThickness;
  let size, ratio;
  if (isNullOrUndef(thickness)) {
    size = ruler.min * options.categoryPercentage;
    ratio = options.barPercentage;
  } else {
    size = thickness * stackCount;
    ratio = 1;
  }
  return {
    chunk: size / stackCount,
    ratio,
    start: ruler.pixels[index2] - size / 2
  };
}
__name(computeFitCategoryTraits, "computeFitCategoryTraits");
function computeFlexCategoryTraits(index2, ruler, options, stackCount) {
  const pixels = ruler.pixels;
  const curr = pixels[index2];
  let prev = index2 > 0 ? pixels[index2 - 1] : null;
  let next = index2 < pixels.length - 1 ? pixels[index2 + 1] : null;
  const percent = options.categoryPercentage;
  if (prev === null) {
    prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
  }
  if (next === null) {
    next = curr + curr - prev;
  }
  const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
  const size = Math.abs(next - prev) / 2 * percent;
  return {
    chunk: size / stackCount,
    ratio: options.barPercentage,
    start
  };
}
__name(computeFlexCategoryTraits, "computeFlexCategoryTraits");
function parseFloatBar(entry, item, vScale, i) {
  const startValue = vScale.parse(entry[0], i);
  const endValue = vScale.parse(entry[1], i);
  const min = Math.min(startValue, endValue);
  const max = Math.max(startValue, endValue);
  let barStart = min;
  let barEnd = max;
  if (Math.abs(min) > Math.abs(max)) {
    barStart = max;
    barEnd = min;
  }
  item[vScale.axis] = barEnd;
  item._custom = {
    barStart,
    barEnd,
    start: startValue,
    end: endValue,
    min,
    max
  };
}
__name(parseFloatBar, "parseFloatBar");
function parseValue(entry, item, vScale, i) {
  if (isArray(entry)) {
    parseFloatBar(entry, item, vScale, i);
  } else {
    item[vScale.axis] = vScale.parse(entry, i);
  }
  return item;
}
__name(parseValue, "parseValue");
function parseArrayOrPrimitive(meta, data, start, count) {
  const iScale = meta.iScale;
  const vScale = meta.vScale;
  const labels = iScale.getLabels();
  const singleScale = iScale === vScale;
  const parsed = [];
  let i, ilen, item, entry;
  for (i = start, ilen = start + count; i < ilen; ++i) {
    entry = data[i];
    item = {};
    item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
    parsed.push(parseValue(entry, item, vScale, i));
  }
  return parsed;
}
__name(parseArrayOrPrimitive, "parseArrayOrPrimitive");
function isFloatBar(custom) {
  return custom && custom.barStart !== void 0 && custom.barEnd !== void 0;
}
__name(isFloatBar, "isFloatBar");
function barSign(size, vScale, actualBase) {
  if (size !== 0) {
    return sign(size);
  }
  return (vScale.isHorizontal() ? 1 : -1) * (vScale.min >= actualBase ? 1 : -1);
}
__name(barSign, "barSign");
function borderProps(properties) {
  let reverse, start, end, top, bottom;
  if (properties.horizontal) {
    reverse = properties.base > properties.x;
    start = "left";
    end = "right";
  } else {
    reverse = properties.base < properties.y;
    start = "bottom";
    end = "top";
  }
  if (reverse) {
    top = "end";
    bottom = "start";
  } else {
    top = "start";
    bottom = "end";
  }
  return {
    start,
    end,
    reverse,
    top,
    bottom
  };
}
__name(borderProps, "borderProps");
function setBorderSkipped(properties, options, stack, index2) {
  let edge = options.borderSkipped;
  const res = {};
  if (!edge) {
    properties.borderSkipped = res;
    return;
  }
  if (edge === true) {
    properties.borderSkipped = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
    return;
  }
  const { start, end, reverse, top, bottom } = borderProps(properties);
  if (edge === "middle" && stack) {
    properties.enableBorderRadius = true;
    if ((stack._top || 0) === index2) {
      edge = top;
    } else if ((stack._bottom || 0) === index2) {
      edge = bottom;
    } else {
      res[parseEdge(bottom, start, end, reverse)] = true;
      edge = top;
    }
  }
  res[parseEdge(edge, start, end, reverse)] = true;
  properties.borderSkipped = res;
}
__name(setBorderSkipped, "setBorderSkipped");
function parseEdge(edge, a, b, reverse) {
  if (reverse) {
    edge = swap(edge, a, b);
    edge = startEnd(edge, b, a);
  } else {
    edge = startEnd(edge, a, b);
  }
  return edge;
}
__name(parseEdge, "parseEdge");
function swap(orig, v1, v2) {
  return orig === v1 ? v2 : orig === v2 ? v1 : orig;
}
__name(swap, "swap");
function startEnd(v, start, end) {
  return v === "start" ? start : v === "end" ? end : v;
}
__name(startEnd, "startEnd");
function setInflateAmount(properties, { inflateAmount }, ratio) {
  properties.inflateAmount = inflateAmount === "auto" ? ratio === 1 ? 0.33 : 0 : inflateAmount;
}
__name(setInflateAmount, "setInflateAmount");
class BarController extends DatasetController {
  static {
    __name(this, "BarController");
  }
  static id = "bar";
  static defaults = {
    datasetElementType: false,
    dataElementType: "bar",
    categoryPercentage: 0.8,
    barPercentage: 0.9,
    grouped: true,
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "base",
          "width",
          "height"
        ]
      }
    }
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category",
        offset: true,
        grid: {
          offset: true
        }
      },
      _value_: {
        type: "linear",
        beginAtZero: true
      }
    }
  };
  parsePrimitiveData(meta, data, start, count) {
    return parseArrayOrPrimitive(meta, data, start, count);
  }
  parseArrayData(meta, data, start, count) {
    return parseArrayOrPrimitive(meta, data, start, count);
  }
  parseObjectData(meta, data, start, count) {
    const { iScale, vScale } = meta;
    const { xAxisKey = "x", yAxisKey = "y" } = this._parsing;
    const iAxisKey = iScale.axis === "x" ? xAxisKey : yAxisKey;
    const vAxisKey = vScale.axis === "x" ? xAxisKey : yAxisKey;
    const parsed = [];
    let i, ilen, item, obj;
    for (i = start, ilen = start + count; i < ilen; ++i) {
      obj = data[i];
      item = {};
      item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i);
      parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i));
    }
    return parsed;
  }
  updateRangeFromParsed(range, scale, parsed, stack) {
    super.updateRangeFromParsed(range, scale, parsed, stack);
    const custom = parsed._custom;
    if (custom && scale === this._cachedMeta.vScale) {
      range.min = Math.min(range.min, custom.min);
      range.max = Math.max(range.max, custom.max);
    }
  }
  getMaxOverflow() {
    return 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const { iScale, vScale } = meta;
    const parsed = this.getParsed(index2);
    const custom = parsed._custom;
    const value = isFloatBar(custom) ? "[" + custom.start + ", " + custom.end + "]" : "" + vScale.getLabelForValue(parsed[vScale.axis]);
    return {
      label: "" + iScale.getLabelForValue(parsed[iScale.axis]),
      value
    };
  }
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
    const meta = this._cachedMeta;
    meta.stack = this.getDataset().stack;
  }
  update(mode) {
    const meta = this._cachedMeta;
    this.updateElements(meta.data, 0, meta.data.length, mode);
  }
  updateElements(bars, start, count, mode) {
    const reset = mode === "reset";
    const { index: index2, _cachedMeta: { vScale } } = this;
    const base = vScale.getBasePixel();
    const horizontal = vScale.isHorizontal();
    const ruler = this._getRuler();
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    for (let i = start; i < start + count; i++) {
      const parsed = this.getParsed(i);
      const vpixels = reset || isNullOrUndef(parsed[vScale.axis]) ? {
        base,
        head: base
      } : this._calculateBarValuePixels(i);
      const ipixels = this._calculateBarIndexPixels(i, ruler);
      const stack = (parsed._stacks || {})[vScale.axis];
      const properties = {
        horizontal,
        base: vpixels.base,
        enableBorderRadius: !stack || isFloatBar(parsed._custom) || index2 === stack._top || index2 === stack._bottom,
        x: horizontal ? vpixels.head : ipixels.center,
        y: horizontal ? ipixels.center : vpixels.head,
        height: horizontal ? ipixels.size : Math.abs(vpixels.size),
        width: horizontal ? Math.abs(vpixels.size) : ipixels.size
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, bars[i].active ? "active" : mode);
      }
      const options = properties.options || bars[i].options;
      setBorderSkipped(properties, options, stack, index2);
      setInflateAmount(properties, options, ruler.ratio);
      this.updateElement(bars[i], i, properties, mode);
    }
  }
  _getStacks(last, dataIndex) {
    const { iScale } = this._cachedMeta;
    const metasets = iScale.getMatchingVisibleMetas(this._type).filter((meta) => meta.controller.options.grouped);
    const stacked = iScale.options.stacked;
    const stacks = [];
    const skipNull = /* @__PURE__ */ __name((meta) => {
      const parsed = meta.controller.getParsed(dataIndex);
      const val = parsed && parsed[meta.vScale.axis];
      if (isNullOrUndef(val) || isNaN(val)) {
        return true;
      }
    }, "skipNull");
    for (const meta of metasets) {
      if (dataIndex !== void 0 && skipNull(meta)) {
        continue;
      }
      if (stacked === false || stacks.indexOf(meta.stack) === -1 || stacked === void 0 && meta.stack === void 0) {
        stacks.push(meta.stack);
      }
      if (meta.index === last) {
        break;
      }
    }
    if (!stacks.length) {
      stacks.push(void 0);
    }
    return stacks;
  }
  _getStackCount(index2) {
    return this._getStacks(void 0, index2).length;
  }
  _getStackIndex(datasetIndex, name, dataIndex) {
    const stacks = this._getStacks(datasetIndex, dataIndex);
    const index2 = name !== void 0 ? stacks.indexOf(name) : -1;
    return index2 === -1 ? stacks.length - 1 : index2;
  }
  _getRuler() {
    const opts = this.options;
    const meta = this._cachedMeta;
    const iScale = meta.iScale;
    const pixels = [];
    let i, ilen;
    for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
      pixels.push(iScale.getPixelForValue(this.getParsed(i)[iScale.axis], i));
    }
    const barThickness = opts.barThickness;
    const min = barThickness || computeMinSampleSize(meta);
    return {
      min,
      pixels,
      start: iScale._startPixel,
      end: iScale._endPixel,
      stackCount: this._getStackCount(),
      scale: iScale,
      grouped: opts.grouped,
      ratio: barThickness ? 1 : opts.categoryPercentage * opts.barPercentage
    };
  }
  _calculateBarValuePixels(index2) {
    const { _cachedMeta: { vScale, _stacked, index: datasetIndex }, options: { base: baseValue, minBarLength } } = this;
    const actualBase = baseValue || 0;
    const parsed = this.getParsed(index2);
    const custom = parsed._custom;
    const floating = isFloatBar(custom);
    let value = parsed[vScale.axis];
    let start = 0;
    let length = _stacked ? this.applyStack(vScale, parsed, _stacked) : value;
    let head, size;
    if (length !== value) {
      start = length - value;
      length = value;
    }
    if (floating) {
      value = custom.barStart;
      length = custom.barEnd - custom.barStart;
      if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
        start = 0;
      }
      start += value;
    }
    const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
    let base = vScale.getPixelForValue(startValue);
    if (this.chart.getDataVisibility(index2)) {
      head = vScale.getPixelForValue(start + length);
    } else {
      head = base;
    }
    size = head - base;
    if (Math.abs(size) < minBarLength) {
      size = barSign(size, vScale, actualBase) * minBarLength;
      if (value === actualBase) {
        base -= size / 2;
      }
      const startPixel = vScale.getPixelForDecimal(0);
      const endPixel = vScale.getPixelForDecimal(1);
      const min = Math.min(startPixel, endPixel);
      const max = Math.max(startPixel, endPixel);
      base = Math.max(Math.min(base, max), min);
      head = base + size;
      if (_stacked && !floating) {
        parsed._stacks[vScale.axis]._visualValues[datasetIndex] = vScale.getValueForPixel(head) - vScale.getValueForPixel(base);
      }
    }
    if (base === vScale.getPixelForValue(actualBase)) {
      const halfGrid = sign(size) * vScale.getLineWidthForValue(actualBase) / 2;
      base += halfGrid;
      size -= halfGrid;
    }
    return {
      size,
      base,
      head,
      center: head + size / 2
    };
  }
  _calculateBarIndexPixels(index2, ruler) {
    const scale = ruler.scale;
    const options = this.options;
    const skipNull = options.skipNull;
    const maxBarThickness = valueOrDefault(options.maxBarThickness, Infinity);
    let center, size;
    if (ruler.grouped) {
      const stackCount = skipNull ? this._getStackCount(index2) : ruler.stackCount;
      const range = options.barThickness === "flex" ? computeFlexCategoryTraits(index2, ruler, options, stackCount) : computeFitCategoryTraits(index2, ruler, options, stackCount);
      const stackIndex = this._getStackIndex(this.index, this._cachedMeta.stack, skipNull ? index2 : void 0);
      center = range.start + range.chunk * stackIndex + range.chunk / 2;
      size = Math.min(maxBarThickness, range.chunk * range.ratio);
    } else {
      center = scale.getPixelForValue(this.getParsed(index2)[scale.axis], index2);
      size = Math.min(maxBarThickness, ruler.min * ruler.ratio);
    }
    return {
      base: center - size / 2,
      head: center + size / 2,
      center,
      size
    };
  }
  draw() {
    const meta = this._cachedMeta;
    const vScale = meta.vScale;
    const rects = meta.data;
    const ilen = rects.length;
    let i = 0;
    for (; i < ilen; ++i) {
      if (this.getParsed(i)[vScale.axis] !== null) {
        rects[i].draw(this._ctx);
      }
    }
  }
}
class BubbleController extends DatasetController {
  static {
    __name(this, "BubbleController");
  }
  static id = "bubble";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "borderWidth",
          "radius"
        ]
      }
    }
  };
  static overrides = {
    scales: {
      x: {
        type: "linear"
      },
      y: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = true;
    super.initialize();
  }
  parsePrimitiveData(meta, data, start, count) {
    const parsed = super.parsePrimitiveData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      parsed[i]._custom = this.resolveDataElementOptions(i + start).radius;
    }
    return parsed;
  }
  parseArrayData(meta, data, start, count) {
    const parsed = super.parseArrayData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      const item = data[start + i];
      parsed[i]._custom = valueOrDefault(item[2], this.resolveDataElementOptions(i + start).radius);
    }
    return parsed;
  }
  parseObjectData(meta, data, start, count) {
    const parsed = super.parseObjectData(meta, data, start, count);
    for (let i = 0; i < parsed.length; i++) {
      const item = data[start + i];
      parsed[i]._custom = valueOrDefault(item && item.r && +item.r, this.resolveDataElementOptions(i + start).radius);
    }
    return parsed;
  }
  getMaxOverflow() {
    const data = this._cachedMeta.data;
    let max = 0;
    for (let i = data.length - 1; i >= 0; --i) {
      max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
    }
    return max > 0 && max;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const labels = this.chart.data.labels || [];
    const { xScale, yScale } = meta;
    const parsed = this.getParsed(index2);
    const x = xScale.getLabelForValue(parsed.x);
    const y = yScale.getLabelForValue(parsed.y);
    const r = parsed._custom;
    return {
      label: labels[index2] || "",
      value: "(" + x + ", " + y + (r ? ", " + r : "") + ")"
    };
  }
  update(mode) {
    const points = this._cachedMeta.data;
    this.updateElements(points, 0, points.length, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale } = this._cachedMeta;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const parsed = !reset && this.getParsed(i);
      const properties = {};
      const iPixel = properties[iAxis] = reset ? iScale.getPixelForDecimal(0.5) : iScale.getPixelForValue(parsed[iAxis]);
      const vPixel = properties[vAxis] = reset ? vScale.getBasePixel() : vScale.getPixelForValue(parsed[vAxis]);
      properties.skip = isNaN(iPixel) || isNaN(vPixel);
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
        if (reset) {
          properties.options.radius = 0;
        }
      }
      this.updateElement(point, i, properties, mode);
    }
  }
  resolveDataElementOptions(index2, mode) {
    const parsed = this.getParsed(index2);
    let values = super.resolveDataElementOptions(index2, mode);
    if (values.$shared) {
      values = Object.assign({}, values, {
        $shared: false
      });
    }
    const radius = values.radius;
    if (mode !== "active") {
      values.radius = 0;
    }
    values.radius += valueOrDefault(parsed && parsed._custom, radius);
    return values;
  }
}
function getRatioAndOffset(rotation, circumference, cutout) {
  let ratioX = 1;
  let ratioY = 1;
  let offsetX = 0;
  let offsetY = 0;
  if (circumference < TAU) {
    const startAngle = rotation;
    const endAngle = startAngle + circumference;
    const startX = Math.cos(startAngle);
    const startY = Math.sin(startAngle);
    const endX = Math.cos(endAngle);
    const endY = Math.sin(endAngle);
    const calcMax = /* @__PURE__ */ __name((angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? 1 : Math.max(a, a * cutout, b, b * cutout), "calcMax");
    const calcMin = /* @__PURE__ */ __name((angle, a, b) => _angleBetween(angle, startAngle, endAngle, true) ? -1 : Math.min(a, a * cutout, b, b * cutout), "calcMin");
    const maxX = calcMax(0, startX, endX);
    const maxY = calcMax(HALF_PI, startY, endY);
    const minX = calcMin(PI, startX, endX);
    const minY = calcMin(PI + HALF_PI, startY, endY);
    ratioX = (maxX - minX) / 2;
    ratioY = (maxY - minY) / 2;
    offsetX = -(maxX + minX) / 2;
    offsetY = -(maxY + minY) / 2;
  }
  return {
    ratioX,
    ratioY,
    offsetX,
    offsetY
  };
}
__name(getRatioAndOffset, "getRatioAndOffset");
class DoughnutController extends DatasetController {
  static {
    __name(this, "DoughnutController");
  }
  static id = "doughnut";
  static defaults = {
    datasetElementType: false,
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: false
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "circumference",
          "endAngle",
          "innerRadius",
          "outerRadius",
          "startAngle",
          "x",
          "y",
          "offset",
          "borderWidth",
          "spacing"
        ]
      }
    },
    cutout: "50%",
    rotation: 0,
    circumference: 360,
    radius: "100%",
    spacing: 0,
    indexAxis: "r"
  };
  static descriptors = {
    _scriptable: (name) => name !== "spacing",
    _indexable: (name) => name !== "spacing" && !name.startsWith("borderDash") && !name.startsWith("hoverBorderDash")
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const { labels: { pointStyle, color: color2 } } = chart.legend.options;
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                return {
                  text: label,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  fontColor: color2,
                  lineWidth: style.borderWidth,
                  pointStyle,
                  hidden: !chart.getDataVisibility(i),
                  index: i
                };
              });
            }
            return [];
          }
        },
        onClick(e, legendItem, legend) {
          legend.chart.toggleDataVisibility(legendItem.index);
          legend.chart.update();
        }
      }
    }
  };
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this.enableOptionSharing = true;
    this.innerRadius = void 0;
    this.outerRadius = void 0;
    this.offsetX = void 0;
    this.offsetY = void 0;
  }
  linkScales() {
  }
  parse(start, count) {
    const data = this.getDataset().data;
    const meta = this._cachedMeta;
    if (this._parsing === false) {
      meta._parsed = data;
    } else {
      let getter = /* @__PURE__ */ __name((i2) => +data[i2], "getter");
      if (isObject(data[start])) {
        const { key = "value" } = this._parsing;
        getter = /* @__PURE__ */ __name((i2) => +resolveObjectKey(data[i2], key), "getter");
      }
      let i, ilen;
      for (i = start, ilen = start + count; i < ilen; ++i) {
        meta._parsed[i] = getter(i);
      }
    }
  }
  _getRotation() {
    return toRadians(this.options.rotation - 90);
  }
  _getCircumference() {
    return toRadians(this.options.circumference);
  }
  _getRotationExtents() {
    let min = TAU;
    let max = -TAU;
    for (let i = 0; i < this.chart.data.datasets.length; ++i) {
      if (this.chart.isDatasetVisible(i) && this.chart.getDatasetMeta(i).type === this._type) {
        const controller = this.chart.getDatasetMeta(i).controller;
        const rotation = controller._getRotation();
        const circumference = controller._getCircumference();
        min = Math.min(min, rotation);
        max = Math.max(max, rotation + circumference);
      }
    }
    return {
      rotation: min,
      circumference: max - min
    };
  }
  update(mode) {
    const chart = this.chart;
    const { chartArea } = chart;
    const meta = this._cachedMeta;
    const arcs = meta.data;
    const spacing = this.getMaxBorderWidth() + this.getMaxOffset(arcs) + this.options.spacing;
    const maxSize = Math.max((Math.min(chartArea.width, chartArea.height) - spacing) / 2, 0);
    const cutout = Math.min(toPercentage(this.options.cutout, maxSize), 1);
    const chartWeight = this._getRingWeight(this.index);
    const { circumference, rotation } = this._getRotationExtents();
    const { ratioX, ratioY, offsetX, offsetY } = getRatioAndOffset(rotation, circumference, cutout);
    const maxWidth = (chartArea.width - spacing) / ratioX;
    const maxHeight = (chartArea.height - spacing) / ratioY;
    const maxRadius = Math.max(Math.min(maxWidth, maxHeight) / 2, 0);
    const outerRadius = toDimension(this.options.radius, maxRadius);
    const innerRadius = Math.max(outerRadius * cutout, 0);
    const radiusLength = (outerRadius - innerRadius) / this._getVisibleDatasetWeightTotal();
    this.offsetX = offsetX * outerRadius;
    this.offsetY = offsetY * outerRadius;
    meta.total = this.calculateTotal();
    this.outerRadius = outerRadius - radiusLength * this._getRingWeightOffset(this.index);
    this.innerRadius = Math.max(this.outerRadius - radiusLength * chartWeight, 0);
    this.updateElements(arcs, 0, arcs.length, mode);
  }
  _circumference(i, reset) {
    const opts = this.options;
    const meta = this._cachedMeta;
    const circumference = this._getCircumference();
    if (reset && opts.animation.animateRotate || !this.chart.getDataVisibility(i) || meta._parsed[i] === null || meta.data[i].hidden) {
      return 0;
    }
    return this.calculateCircumference(meta._parsed[i] * circumference / TAU);
  }
  updateElements(arcs, start, count, mode) {
    const reset = mode === "reset";
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const animateScale = reset && animationOpts.animateScale;
    const innerRadius = animateScale ? 0 : this.innerRadius;
    const outerRadius = animateScale ? 0 : this.outerRadius;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    let startAngle = this._getRotation();
    let i;
    for (i = 0; i < start; ++i) {
      startAngle += this._circumference(i, reset);
    }
    for (i = start; i < start + count; ++i) {
      const circumference = this._circumference(i, reset);
      const arc = arcs[i];
      const properties = {
        x: centerX + this.offsetX,
        y: centerY + this.offsetY,
        startAngle,
        endAngle: startAngle + circumference,
        circumference,
        outerRadius,
        innerRadius
      };
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, arc.active ? "active" : mode);
      }
      startAngle += circumference;
      this.updateElement(arc, i, properties, mode);
    }
  }
  calculateTotal() {
    const meta = this._cachedMeta;
    const metaData = meta.data;
    let total = 0;
    let i;
    for (i = 0; i < metaData.length; i++) {
      const value = meta._parsed[i];
      if (value !== null && !isNaN(value) && this.chart.getDataVisibility(i) && !metaData[i].hidden) {
        total += Math.abs(value);
      }
    }
    return total;
  }
  calculateCircumference(value) {
    const total = this._cachedMeta.total;
    if (total > 0 && !isNaN(value)) {
      return TAU * (Math.abs(value) / total);
    }
    return 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index2], chart.options.locale);
    return {
      label: labels[index2] || "",
      value
    };
  }
  getMaxBorderWidth(arcs) {
    let max = 0;
    const chart = this.chart;
    let i, ilen, meta, controller, options;
    if (!arcs) {
      for (i = 0, ilen = chart.data.datasets.length; i < ilen; ++i) {
        if (chart.isDatasetVisible(i)) {
          meta = chart.getDatasetMeta(i);
          arcs = meta.data;
          controller = meta.controller;
          break;
        }
      }
    }
    if (!arcs) {
      return 0;
    }
    for (i = 0, ilen = arcs.length; i < ilen; ++i) {
      options = controller.resolveDataElementOptions(i);
      if (options.borderAlign !== "inner") {
        max = Math.max(max, options.borderWidth || 0, options.hoverBorderWidth || 0);
      }
    }
    return max;
  }
  getMaxOffset(arcs) {
    let max = 0;
    for (let i = 0, ilen = arcs.length; i < ilen; ++i) {
      const options = this.resolveDataElementOptions(i);
      max = Math.max(max, options.offset || 0, options.hoverOffset || 0);
    }
    return max;
  }
  _getRingWeightOffset(datasetIndex) {
    let ringWeightOffset = 0;
    for (let i = 0; i < datasetIndex; ++i) {
      if (this.chart.isDatasetVisible(i)) {
        ringWeightOffset += this._getRingWeight(i);
      }
    }
    return ringWeightOffset;
  }
  _getRingWeight(datasetIndex) {
    return Math.max(valueOrDefault(this.chart.data.datasets[datasetIndex].weight, 1), 0);
  }
  _getVisibleDatasetWeightTotal() {
    return this._getRingWeightOffset(this.chart.data.datasets.length) || 1;
  }
}
class LineController extends DatasetController {
  static {
    __name(this, "LineController");
  }
  static id = "line";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    showLine: true,
    spanGaps: false
  };
  static overrides = {
    scales: {
      _index_: {
        type: "category"
      },
      _value_: {
        type: "linear"
      }
    }
  };
  initialize() {
    this.enableOptionSharing = true;
    this.supportsDecimation = true;
    super.initialize();
  }
  update(mode) {
    const meta = this._cachedMeta;
    const { dataset: line, data: points = [], _dataset } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    line._chart = this.chart;
    line._datasetIndex = this.index;
    line._decimated = !!_dataset._decimated;
    line.points = points;
    const options = this.resolveDatasetElementOptions(mode);
    if (!this.options.showLine) {
      options.borderWidth = 0;
    }
    options.segment = this.options.segment;
    this.updateElement(line, void 0, {
      animated: !animationsDisabled,
      options
    }, mode);
    this.updateElements(points, start, count, mode);
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
    const { sharedOptions, includeOptions } = this._getSharedOptions(start, mode);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const { spanGaps, segment } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    const end = start + count;
    const pointsCount = points.length;
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i = 0; i < pointsCount; ++i) {
      const point = points[i];
      const properties = directUpdate ? point : {};
      if (i < start || i >= end) {
        properties.skip = true;
        continue;
      }
      const parsed = this.getParsed(i);
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i, properties, mode);
      }
      prevParsed = parsed;
    }
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    const data = meta.data || [];
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
  draw() {
    const meta = this._cachedMeta;
    meta.dataset.updateControlPoints(this.chart.chartArea, meta.iScale.axis);
    super.draw();
  }
}
class PolarAreaController extends DatasetController {
  static {
    __name(this, "PolarAreaController");
  }
  static id = "polarArea";
  static defaults = {
    dataElementType: "arc",
    animation: {
      animateRotate: true,
      animateScale: true
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "startAngle",
          "endAngle",
          "innerRadius",
          "outerRadius"
        ]
      }
    },
    indexAxis: "r",
    startAngle: 0
  };
  static overrides = {
    aspectRatio: 1,
    plugins: {
      legend: {
        labels: {
          generateLabels(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const { labels: { pointStyle, color: color2 } } = chart.legend.options;
              return data.labels.map((label, i) => {
                const meta = chart.getDatasetMeta(0);
                const style = meta.controller.getStyle(i);
                return {
                  text: label,
                  fillStyle: style.backgroundColor,
                  strokeStyle: style.borderColor,
                  fontColor: color2,
                  lineWidth: style.borderWidth,
                  pointStyle,
                  hidden: !chart.getDataVisibility(i),
                  index: i
                };
              });
            }
            return [];
          }
        },
        onClick(e, legendItem, legend) {
          legend.chart.toggleDataVisibility(legendItem.index);
          legend.chart.update();
        }
      }
    },
    scales: {
      r: {
        type: "radialLinear",
        angleLines: {
          display: false
        },
        beginAtZero: true,
        grid: {
          circular: true
        },
        pointLabels: {
          display: false
        },
        startAngle: 0
      }
    }
  };
  constructor(chart, datasetIndex) {
    super(chart, datasetIndex);
    this.innerRadius = void 0;
    this.outerRadius = void 0;
  }
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const chart = this.chart;
    const labels = chart.data.labels || [];
    const value = formatNumber(meta._parsed[index2].r, chart.options.locale);
    return {
      label: labels[index2] || "",
      value
    };
  }
  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }
  update(mode) {
    const arcs = this._cachedMeta.data;
    this._updateRadius();
    this.updateElements(arcs, 0, arcs.length, mode);
  }
  getMinMax() {
    const meta = this._cachedMeta;
    const range = {
      min: Number.POSITIVE_INFINITY,
      max: Number.NEGATIVE_INFINITY
    };
    meta.data.forEach((element, index2) => {
      const parsed = this.getParsed(index2).r;
      if (!isNaN(parsed) && this.chart.getDataVisibility(index2)) {
        if (parsed < range.min) {
          range.min = parsed;
        }
        if (parsed > range.max) {
          range.max = parsed;
        }
      }
    });
    return range;
  }
  _updateRadius() {
    const chart = this.chart;
    const chartArea = chart.chartArea;
    const opts = chart.options;
    const minSize = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
    const outerRadius = Math.max(minSize / 2, 0);
    const innerRadius = Math.max(opts.cutoutPercentage ? outerRadius / 100 * opts.cutoutPercentage : 1, 0);
    const radiusLength = (outerRadius - innerRadius) / chart.getVisibleDatasetCount();
    this.outerRadius = outerRadius - radiusLength * this.index;
    this.innerRadius = this.outerRadius - radiusLength;
  }
  updateElements(arcs, start, count, mode) {
    const reset = mode === "reset";
    const chart = this.chart;
    const opts = chart.options;
    const animationOpts = opts.animation;
    const scale = this._cachedMeta.rScale;
    const centerX = scale.xCenter;
    const centerY = scale.yCenter;
    const datasetStartAngle = scale.getIndexAngle(0) - 0.5 * PI;
    let angle = datasetStartAngle;
    let i;
    const defaultAngle = 360 / this.countVisibleElements();
    for (i = 0; i < start; ++i) {
      angle += this._computeAngle(i, mode, defaultAngle);
    }
    for (i = start; i < start + count; i++) {
      const arc = arcs[i];
      let startAngle = angle;
      let endAngle = angle + this._computeAngle(i, mode, defaultAngle);
      let outerRadius = chart.getDataVisibility(i) ? scale.getDistanceFromCenterForValue(this.getParsed(i).r) : 0;
      angle = endAngle;
      if (reset) {
        if (animationOpts.animateScale) {
          outerRadius = 0;
        }
        if (animationOpts.animateRotate) {
          startAngle = endAngle = datasetStartAngle;
        }
      }
      const properties = {
        x: centerX,
        y: centerY,
        innerRadius: 0,
        outerRadius,
        startAngle,
        endAngle,
        options: this.resolveDataElementOptions(i, arc.active ? "active" : mode)
      };
      this.updateElement(arc, i, properties, mode);
    }
  }
  countVisibleElements() {
    const meta = this._cachedMeta;
    let count = 0;
    meta.data.forEach((element, index2) => {
      if (!isNaN(this.getParsed(index2).r) && this.chart.getDataVisibility(index2)) {
        count++;
      }
    });
    return count;
  }
  _computeAngle(index2, mode, defaultAngle) {
    return this.chart.getDataVisibility(index2) ? toRadians(this.resolveDataElementOptions(index2, mode).angle || defaultAngle) : 0;
  }
}
class PieController extends DoughnutController {
  static {
    __name(this, "PieController");
  }
  static id = "pie";
  static defaults = {
    cutout: 0,
    rotation: 0,
    circumference: 360,
    radius: "100%"
  };
}
class RadarController extends DatasetController {
  static {
    __name(this, "RadarController");
  }
  static id = "radar";
  static defaults = {
    datasetElementType: "line",
    dataElementType: "point",
    indexAxis: "r",
    showLine: true,
    elements: {
      line: {
        fill: "start"
      }
    }
  };
  static overrides = {
    aspectRatio: 1,
    scales: {
      r: {
        type: "radialLinear"
      }
    }
  };
  getLabelAndValue(index2) {
    const vScale = this._cachedMeta.vScale;
    const parsed = this.getParsed(index2);
    return {
      label: vScale.getLabels()[index2],
      value: "" + vScale.getLabelForValue(parsed[vScale.axis])
    };
  }
  parseObjectData(meta, data, start, count) {
    return _parseObjectDataRadialScale.bind(this)(meta, data, start, count);
  }
  update(mode) {
    const meta = this._cachedMeta;
    const line = meta.dataset;
    const points = meta.data || [];
    const labels = meta.iScale.getLabels();
    line.points = points;
    if (mode !== "resize") {
      const options = this.resolveDatasetElementOptions(mode);
      if (!this.options.showLine) {
        options.borderWidth = 0;
      }
      const properties = {
        _loop: true,
        _fullLoop: labels.length === points.length,
        options
      };
      this.updateElement(line, void 0, properties, mode);
    }
    this.updateElements(points, 0, points.length, mode);
  }
  updateElements(points, start, count, mode) {
    const scale = this._cachedMeta.rScale;
    const reset = mode === "reset";
    for (let i = start; i < start + count; i++) {
      const point = points[i];
      const options = this.resolveDataElementOptions(i, point.active ? "active" : mode);
      const pointPosition = scale.getPointPositionForValue(i, this.getParsed(i).r);
      const x = reset ? scale.xCenter : pointPosition.x;
      const y = reset ? scale.yCenter : pointPosition.y;
      const properties = {
        x,
        y,
        angle: pointPosition.angle,
        skip: isNaN(x) || isNaN(y),
        options
      };
      this.updateElement(point, i, properties, mode);
    }
  }
}
class ScatterController extends DatasetController {
  static {
    __name(this, "ScatterController");
  }
  static id = "scatter";
  static defaults = {
    datasetElementType: false,
    dataElementType: "point",
    showLine: false,
    fill: false
  };
  static overrides = {
    interaction: {
      mode: "point"
    },
    scales: {
      x: {
        type: "linear"
      },
      y: {
        type: "linear"
      }
    }
  };
  getLabelAndValue(index2) {
    const meta = this._cachedMeta;
    const labels = this.chart.data.labels || [];
    const { xScale, yScale } = meta;
    const parsed = this.getParsed(index2);
    const x = xScale.getLabelForValue(parsed.x);
    const y = yScale.getLabelForValue(parsed.y);
    return {
      label: labels[index2] || "",
      value: "(" + x + ", " + y + ")"
    };
  }
  update(mode) {
    const meta = this._cachedMeta;
    const { data: points = [] } = meta;
    const animationsDisabled = this.chart._animationsDisabled;
    let { start, count } = _getStartAndCountOfVisiblePoints(meta, points, animationsDisabled);
    this._drawStart = start;
    this._drawCount = count;
    if (_scaleRangesChanged(meta)) {
      start = 0;
      count = points.length;
    }
    if (this.options.showLine) {
      if (!this.datasetElementType) {
        this.addElements();
      }
      const { dataset: line, _dataset } = meta;
      line._chart = this.chart;
      line._datasetIndex = this.index;
      line._decimated = !!_dataset._decimated;
      line.points = points;
      const options = this.resolveDatasetElementOptions(mode);
      options.segment = this.options.segment;
      this.updateElement(line, void 0, {
        animated: !animationsDisabled,
        options
      }, mode);
    } else if (this.datasetElementType) {
      delete meta.dataset;
      this.datasetElementType = false;
    }
    this.updateElements(points, start, count, mode);
  }
  addElements() {
    const { showLine } = this.options;
    if (!this.datasetElementType && showLine) {
      this.datasetElementType = this.chart.registry.getElement("line");
    }
    super.addElements();
  }
  updateElements(points, start, count, mode) {
    const reset = mode === "reset";
    const { iScale, vScale, _stacked, _dataset } = this._cachedMeta;
    const firstOpts = this.resolveDataElementOptions(start, mode);
    const sharedOptions = this.getSharedOptions(firstOpts);
    const includeOptions = this.includeOptions(mode, sharedOptions);
    const iAxis = iScale.axis;
    const vAxis = vScale.axis;
    const { spanGaps, segment } = this.options;
    const maxGapLength = isNumber(spanGaps) ? spanGaps : Number.POSITIVE_INFINITY;
    const directUpdate = this.chart._animationsDisabled || reset || mode === "none";
    let prevParsed = start > 0 && this.getParsed(start - 1);
    for (let i = start; i < start + count; ++i) {
      const point = points[i];
      const parsed = this.getParsed(i);
      const properties = directUpdate ? point : {};
      const nullData = isNullOrUndef(parsed[vAxis]);
      const iPixel = properties[iAxis] = iScale.getPixelForValue(parsed[iAxis], i);
      const vPixel = properties[vAxis] = reset || nullData ? vScale.getBasePixel() : vScale.getPixelForValue(_stacked ? this.applyStack(vScale, parsed, _stacked) : parsed[vAxis], i);
      properties.skip = isNaN(iPixel) || isNaN(vPixel) || nullData;
      properties.stop = i > 0 && Math.abs(parsed[iAxis] - prevParsed[iAxis]) > maxGapLength;
      if (segment) {
        properties.parsed = parsed;
        properties.raw = _dataset.data[i];
      }
      if (includeOptions) {
        properties.options = sharedOptions || this.resolveDataElementOptions(i, point.active ? "active" : mode);
      }
      if (!directUpdate) {
        this.updateElement(point, i, properties, mode);
      }
      prevParsed = parsed;
    }
    this.updateSharedOptions(sharedOptions, mode, firstOpts);
  }
  getMaxOverflow() {
    const meta = this._cachedMeta;
    const data = meta.data || [];
    if (!this.options.showLine) {
      let max = 0;
      for (let i = data.length - 1; i >= 0; --i) {
        max = Math.max(max, data[i].size(this.resolveDataElementOptions(i)) / 2);
      }
      return max > 0 && max;
    }
    const dataset = meta.dataset;
    const border = dataset.options && dataset.options.borderWidth || 0;
    if (!data.length) {
      return border;
    }
    const firstPoint = data[0].size(this.resolveDataElementOptions(0));
    const lastPoint = data[data.length - 1].size(this.resolveDataElementOptions(data.length - 1));
    return Math.max(border, firstPoint, lastPoint) / 2;
  }
}
var controllers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController
});
function abstract() {
  throw new Error("This method is not implemented: Check that a complete date adapter is provided.");
}
__name(abstract, "abstract");
class DateAdapterBase {
  static {
    __name(this, "DateAdapterBase");
  }
  /**
  * Override default date adapter methods.
  * Accepts type parameter to define options type.
  * @example
  * Chart._adapters._date.override<{myAdapterOption: string}>({
  *   init() {
  *     console.log(this.options.myAdapterOption);
  *   }
  * })
  */
  static override(members) {
    Object.assign(DateAdapterBase.prototype, members);
  }
  options;
  constructor(options) {
    this.options = options || {};
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init() {
  }
  formats() {
    return abstract();
  }
  parse() {
    return abstract();
  }
  format() {
    return abstract();
  }
  add() {
    return abstract();
  }
  diff() {
    return abstract();
  }
  startOf() {
    return abstract();
  }
  endOf() {
    return abstract();
  }
}
var adapters = {
  _date: DateAdapterBase
};
function binarySearch(metaset, axis, value, intersect) {
  const { controller, data, _sorted } = metaset;
  const iScale = controller._cachedMeta.iScale;
  if (iScale && axis === iScale.axis && axis !== "r" && _sorted && data.length) {
    const lookupMethod = iScale._reversePixels ? _rlookupByKey : _lookupByKey;
    if (!intersect) {
      return lookupMethod(data, axis, value);
    } else if (controller._sharedOptions) {
      const el = data[0];
      const range = typeof el.getRange === "function" && el.getRange(axis);
      if (range) {
        const start = lookupMethod(data, axis, value - range);
        const end = lookupMethod(data, axis, value + range);
        return {
          lo: start.lo,
          hi: end.hi
        };
      }
    }
  }
  return {
    lo: 0,
    hi: data.length - 1
  };
}
__name(binarySearch, "binarySearch");
function evaluateInteractionItems(chart, axis, position, handler, intersect) {
  const metasets = chart.getSortedVisibleDatasetMetas();
  const value = position[axis];
  for (let i = 0, ilen = metasets.length; i < ilen; ++i) {
    const { index: index2, data } = metasets[i];
    const { lo, hi } = binarySearch(metasets[i], axis, value, intersect);
    for (let j = lo; j <= hi; ++j) {
      const element = data[j];
      if (!element.skip) {
        handler(element, index2, j);
      }
    }
  }
}
__name(evaluateInteractionItems, "evaluateInteractionItems");
function getDistanceMetricForAxis(axis) {
  const useX = axis.indexOf("x") !== -1;
  const useY = axis.indexOf("y") !== -1;
  return function(pt1, pt2) {
    const deltaX = useX ? Math.abs(pt1.x - pt2.x) : 0;
    const deltaY = useY ? Math.abs(pt1.y - pt2.y) : 0;
    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  };
}
__name(getDistanceMetricForAxis, "getDistanceMetricForAxis");
function getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) {
  const items = [];
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return items;
  }
  const evaluationFunc = /* @__PURE__ */ __name(function(element, datasetIndex, index2) {
    if (!includeInvisible && !_isPointInArea(element, chart.chartArea, 0)) {
      return;
    }
    if (element.inRange(position.x, position.y, useFinalPosition)) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
    }
  }, "evaluationFunc");
  evaluateInteractionItems(chart, axis, position, evaluationFunc, true);
  return items;
}
__name(getIntersectItems, "getIntersectItems");
function getNearestRadialItems(chart, position, axis, useFinalPosition) {
  let items = [];
  function evaluationFunc(element, datasetIndex, index2) {
    const { startAngle, endAngle } = element.getProps([
      "startAngle",
      "endAngle"
    ], useFinalPosition);
    const { angle } = getAngleFromPoint(element, {
      x: position.x,
      y: position.y
    });
    if (_angleBetween(angle, startAngle, endAngle)) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
    }
  }
  __name(evaluationFunc, "evaluationFunc");
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
__name(getNearestRadialItems, "getNearestRadialItems");
function getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  let items = [];
  const distanceMetric = getDistanceMetricForAxis(axis);
  let minDistance = Number.POSITIVE_INFINITY;
  function evaluationFunc(element, datasetIndex, index2) {
    const inRange2 = element.inRange(position.x, position.y, useFinalPosition);
    if (intersect && !inRange2) {
      return;
    }
    const center = element.getCenterPoint(useFinalPosition);
    const pointInArea = !!includeInvisible || chart.isPointInArea(center);
    if (!pointInArea && !inRange2) {
      return;
    }
    const distance = distanceMetric(position, center);
    if (distance < minDistance) {
      items = [
        {
          element,
          datasetIndex,
          index: index2
        }
      ];
      minDistance = distance;
    } else if (distance === minDistance) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
    }
  }
  __name(evaluationFunc, "evaluationFunc");
  evaluateInteractionItems(chart, axis, position, evaluationFunc);
  return items;
}
__name(getNearestCartesianItems, "getNearestCartesianItems");
function getNearestItems(chart, position, axis, intersect, useFinalPosition, includeInvisible) {
  if (!includeInvisible && !chart.isPointInArea(position)) {
    return [];
  }
  return axis === "r" && !intersect ? getNearestRadialItems(chart, position, axis, useFinalPosition) : getNearestCartesianItems(chart, position, axis, intersect, useFinalPosition, includeInvisible);
}
__name(getNearestItems, "getNearestItems");
function getAxisItems(chart, position, axis, intersect, useFinalPosition) {
  const items = [];
  const rangeMethod = axis === "x" ? "inXRange" : "inYRange";
  let intersectsItem = false;
  evaluateInteractionItems(chart, axis, position, (element, datasetIndex, index2) => {
    if (element[rangeMethod](position[axis], useFinalPosition)) {
      items.push({
        element,
        datasetIndex,
        index: index2
      });
      intersectsItem = intersectsItem || element.inRange(position.x, position.y, useFinalPosition);
    }
  });
  if (intersect && !intersectsItem) {
    return [];
  }
  return items;
}
__name(getAxisItems, "getAxisItems");
var Interaction = {
  evaluateInteractionItems,
  modes: {
    index(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "x";
      const includeInvisible = options.includeInvisible || false;
      const items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      const elements2 = [];
      if (!items.length) {
        return [];
      }
      chart.getSortedVisibleDatasetMetas().forEach((meta) => {
        const index2 = items[0].index;
        const element = meta.data[index2];
        if (element && !element.skip) {
          elements2.push({
            element,
            datasetIndex: meta.index,
            index: index2
          });
        }
      });
      return elements2;
    },
    dataset(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      let items = options.intersect ? getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible) : getNearestItems(chart, position, axis, false, useFinalPosition, includeInvisible);
      if (items.length > 0) {
        const datasetIndex = items[0].datasetIndex;
        const data = chart.getDatasetMeta(datasetIndex).data;
        items = [];
        for (let i = 0; i < data.length; ++i) {
          items.push({
            element: data[i],
            datasetIndex,
            index: i
          });
        }
      }
      return items;
    },
    point(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      return getIntersectItems(chart, position, axis, useFinalPosition, includeInvisible);
    },
    nearest(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      const axis = options.axis || "xy";
      const includeInvisible = options.includeInvisible || false;
      return getNearestItems(chart, position, axis, options.intersect, useFinalPosition, includeInvisible);
    },
    x(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, "x", options.intersect, useFinalPosition);
    },
    y(chart, e, options, useFinalPosition) {
      const position = getRelativePosition(e, chart);
      return getAxisItems(chart, position, "y", options.intersect, useFinalPosition);
    }
  }
};
const STATIC_POSITIONS = [
  "left",
  "top",
  "right",
  "bottom"
];
function filterByPosition(array, position) {
  return array.filter((v) => v.pos === position);
}
__name(filterByPosition, "filterByPosition");
function filterDynamicPositionByAxis(array, axis) {
  return array.filter((v) => STATIC_POSITIONS.indexOf(v.pos) === -1 && v.box.axis === axis);
}
__name(filterDynamicPositionByAxis, "filterDynamicPositionByAxis");
function sortByWeight(array, reverse) {
  return array.sort((a, b) => {
    const v0 = reverse ? b : a;
    const v1 = reverse ? a : b;
    return v0.weight === v1.weight ? v0.index - v1.index : v0.weight - v1.weight;
  });
}
__name(sortByWeight, "sortByWeight");
function wrapBoxes(boxes) {
  const layoutBoxes = [];
  let i, ilen, box, pos, stack, stackWeight;
  for (i = 0, ilen = (boxes || []).length; i < ilen; ++i) {
    box = boxes[i];
    ({ position: pos, options: { stack, stackWeight = 1 } } = box);
    layoutBoxes.push({
      index: i,
      box,
      pos,
      horizontal: box.isHorizontal(),
      weight: box.weight,
      stack: stack && pos + stack,
      stackWeight
    });
  }
  return layoutBoxes;
}
__name(wrapBoxes, "wrapBoxes");
function buildStacks(layouts2) {
  const stacks = {};
  for (const wrap of layouts2) {
    const { stack, pos, stackWeight } = wrap;
    if (!stack || !STATIC_POSITIONS.includes(pos)) {
      continue;
    }
    const _stack = stacks[stack] || (stacks[stack] = {
      count: 0,
      placed: 0,
      weight: 0,
      size: 0
    });
    _stack.count++;
    _stack.weight += stackWeight;
  }
  return stacks;
}
__name(buildStacks, "buildStacks");
function setLayoutDims(layouts2, params) {
  const stacks = buildStacks(layouts2);
  const { vBoxMaxWidth, hBoxMaxHeight } = params;
  let i, ilen, layout2;
  for (i = 0, ilen = layouts2.length; i < ilen; ++i) {
    layout2 = layouts2[i];
    const { fullSize } = layout2.box;
    const stack = stacks[layout2.stack];
    const factor = stack && layout2.stackWeight / stack.weight;
    if (layout2.horizontal) {
      layout2.width = factor ? factor * vBoxMaxWidth : fullSize && params.availableWidth;
      layout2.height = hBoxMaxHeight;
    } else {
      layout2.width = vBoxMaxWidth;
      layout2.height = factor ? factor * hBoxMaxHeight : fullSize && params.availableHeight;
    }
  }
  return stacks;
}
__name(setLayoutDims, "setLayoutDims");
function buildLayoutBoxes(boxes) {
  const layoutBoxes = wrapBoxes(boxes);
  const fullSize = sortByWeight(layoutBoxes.filter((wrap) => wrap.box.fullSize), true);
  const left = sortByWeight(filterByPosition(layoutBoxes, "left"), true);
  const right = sortByWeight(filterByPosition(layoutBoxes, "right"));
  const top = sortByWeight(filterByPosition(layoutBoxes, "top"), true);
  const bottom = sortByWeight(filterByPosition(layoutBoxes, "bottom"));
  const centerHorizontal = filterDynamicPositionByAxis(layoutBoxes, "x");
  const centerVertical = filterDynamicPositionByAxis(layoutBoxes, "y");
  return {
    fullSize,
    leftAndTop: left.concat(top),
    rightAndBottom: right.concat(centerVertical).concat(bottom).concat(centerHorizontal),
    chartArea: filterByPosition(layoutBoxes, "chartArea"),
    vertical: left.concat(right).concat(centerVertical),
    horizontal: top.concat(bottom).concat(centerHorizontal)
  };
}
__name(buildLayoutBoxes, "buildLayoutBoxes");
function getCombinedMax(maxPadding, chartArea, a, b) {
  return Math.max(maxPadding[a], chartArea[a]) + Math.max(maxPadding[b], chartArea[b]);
}
__name(getCombinedMax, "getCombinedMax");
function updateMaxPadding(maxPadding, boxPadding) {
  maxPadding.top = Math.max(maxPadding.top, boxPadding.top);
  maxPadding.left = Math.max(maxPadding.left, boxPadding.left);
  maxPadding.bottom = Math.max(maxPadding.bottom, boxPadding.bottom);
  maxPadding.right = Math.max(maxPadding.right, boxPadding.right);
}
__name(updateMaxPadding, "updateMaxPadding");
function updateDims(chartArea, params, layout2, stacks) {
  const { pos, box } = layout2;
  const maxPadding = chartArea.maxPadding;
  if (!isObject(pos)) {
    if (layout2.size) {
      chartArea[pos] -= layout2.size;
    }
    const stack = stacks[layout2.stack] || {
      size: 0,
      count: 1
    };
    stack.size = Math.max(stack.size, layout2.horizontal ? box.height : box.width);
    layout2.size = stack.size / stack.count;
    chartArea[pos] += layout2.size;
  }
  if (box.getPadding) {
    updateMaxPadding(maxPadding, box.getPadding());
  }
  const newWidth = Math.max(0, params.outerWidth - getCombinedMax(maxPadding, chartArea, "left", "right"));
  const newHeight = Math.max(0, params.outerHeight - getCombinedMax(maxPadding, chartArea, "top", "bottom"));
  const widthChanged = newWidth !== chartArea.w;
  const heightChanged = newHeight !== chartArea.h;
  chartArea.w = newWidth;
  chartArea.h = newHeight;
  return layout2.horizontal ? {
    same: widthChanged,
    other: heightChanged
  } : {
    same: heightChanged,
    other: widthChanged
  };
}
__name(updateDims, "updateDims");
function handleMaxPadding(chartArea) {
  const maxPadding = chartArea.maxPadding;
  function updatePos(pos) {
    const change = Math.max(maxPadding[pos] - chartArea[pos], 0);
    chartArea[pos] += change;
    return change;
  }
  __name(updatePos, "updatePos");
  chartArea.y += updatePos("top");
  chartArea.x += updatePos("left");
  updatePos("right");
  updatePos("bottom");
}
__name(handleMaxPadding, "handleMaxPadding");
function getMargins(horizontal, chartArea) {
  const maxPadding = chartArea.maxPadding;
  function marginForPositions(positions2) {
    const margin = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0
    };
    positions2.forEach((pos) => {
      margin[pos] = Math.max(chartArea[pos], maxPadding[pos]);
    });
    return margin;
  }
  __name(marginForPositions, "marginForPositions");
  return horizontal ? marginForPositions([
    "left",
    "right"
  ]) : marginForPositions([
    "top",
    "bottom"
  ]);
}
__name(getMargins, "getMargins");
function fitBoxes(boxes, chartArea, params, stacks) {
  const refitBoxes = [];
  let i, ilen, layout2, box, refit, changed;
  for (i = 0, ilen = boxes.length, refit = 0; i < ilen; ++i) {
    layout2 = boxes[i];
    box = layout2.box;
    box.update(layout2.width || chartArea.w, layout2.height || chartArea.h, getMargins(layout2.horizontal, chartArea));
    const { same, other } = updateDims(chartArea, params, layout2, stacks);
    refit |= same && refitBoxes.length;
    changed = changed || other;
    if (!box.fullSize) {
      refitBoxes.push(layout2);
    }
  }
  return refit && fitBoxes(refitBoxes, chartArea, params, stacks) || changed;
}
__name(fitBoxes, "fitBoxes");
function setBoxDims(box, left, top, width, height) {
  box.top = top;
  box.left = left;
  box.right = left + width;
  box.bottom = top + height;
  box.width = width;
  box.height = height;
}
__name(setBoxDims, "setBoxDims");
function placeBoxes(boxes, chartArea, params, stacks) {
  const userPadding = params.padding;
  let { x, y } = chartArea;
  for (const layout2 of boxes) {
    const box = layout2.box;
    const stack = stacks[layout2.stack] || {
      count: 1,
      placed: 0,
      weight: 1
    };
    const weight = layout2.stackWeight / stack.weight || 1;
    if (layout2.horizontal) {
      const width = chartArea.w * weight;
      const height = stack.size || box.height;
      if (defined(stack.start)) {
        y = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, userPadding.left, y, params.outerWidth - userPadding.right - userPadding.left, height);
      } else {
        setBoxDims(box, chartArea.left + stack.placed, y, width, height);
      }
      stack.start = y;
      stack.placed += width;
      y = box.bottom;
    } else {
      const height = chartArea.h * weight;
      const width = stack.size || box.width;
      if (defined(stack.start)) {
        x = stack.start;
      }
      if (box.fullSize) {
        setBoxDims(box, x, userPadding.top, width, params.outerHeight - userPadding.bottom - userPadding.top);
      } else {
        setBoxDims(box, x, chartArea.top + stack.placed, width, height);
      }
      stack.start = x;
      stack.placed += height;
      x = box.right;
    }
  }
  chartArea.x = x;
  chartArea.y = y;
}
__name(placeBoxes, "placeBoxes");
var layouts = {
  addBox(chart, item) {
    if (!chart.boxes) {
      chart.boxes = [];
    }
    item.fullSize = item.fullSize || false;
    item.position = item.position || "top";
    item.weight = item.weight || 0;
    item._layers = item._layers || function() {
      return [
        {
          z: 0,
          draw(chartArea) {
            item.draw(chartArea);
          }
        }
      ];
    };
    chart.boxes.push(item);
  },
  removeBox(chart, layoutItem) {
    const index2 = chart.boxes ? chart.boxes.indexOf(layoutItem) : -1;
    if (index2 !== -1) {
      chart.boxes.splice(index2, 1);
    }
  },
  configure(chart, item, options) {
    item.fullSize = options.fullSize;
    item.position = options.position;
    item.weight = options.weight;
  },
  update(chart, width, height, minPadding) {
    if (!chart) {
      return;
    }
    const padding = toPadding(chart.options.layout.padding);
    const availableWidth = Math.max(width - padding.width, 0);
    const availableHeight = Math.max(height - padding.height, 0);
    const boxes = buildLayoutBoxes(chart.boxes);
    const verticalBoxes = boxes.vertical;
    const horizontalBoxes = boxes.horizontal;
    each(chart.boxes, (box) => {
      if (typeof box.beforeLayout === "function") {
        box.beforeLayout();
      }
    });
    const visibleVerticalBoxCount = verticalBoxes.reduce((total, wrap) => wrap.box.options && wrap.box.options.display === false ? total : total + 1, 0) || 1;
    const params = Object.freeze({
      outerWidth: width,
      outerHeight: height,
      padding,
      availableWidth,
      availableHeight,
      vBoxMaxWidth: availableWidth / 2 / visibleVerticalBoxCount,
      hBoxMaxHeight: availableHeight / 2
    });
    const maxPadding = Object.assign({}, padding);
    updateMaxPadding(maxPadding, toPadding(minPadding));
    const chartArea = Object.assign({
      maxPadding,
      w: availableWidth,
      h: availableHeight,
      x: padding.left,
      y: padding.top
    }, padding);
    const stacks = setLayoutDims(verticalBoxes.concat(horizontalBoxes), params);
    fitBoxes(boxes.fullSize, chartArea, params, stacks);
    fitBoxes(verticalBoxes, chartArea, params, stacks);
    if (fitBoxes(horizontalBoxes, chartArea, params, stacks)) {
      fitBoxes(verticalBoxes, chartArea, params, stacks);
    }
    handleMaxPadding(chartArea);
    placeBoxes(boxes.leftAndTop, chartArea, params, stacks);
    chartArea.x += chartArea.w;
    chartArea.y += chartArea.h;
    placeBoxes(boxes.rightAndBottom, chartArea, params, stacks);
    chart.chartArea = {
      left: chartArea.left,
      top: chartArea.top,
      right: chartArea.left + chartArea.w,
      bottom: chartArea.top + chartArea.h,
      height: chartArea.h,
      width: chartArea.w
    };
    each(boxes.chartArea, (layout2) => {
      const box = layout2.box;
      Object.assign(box, chart.chartArea);
      box.update(chartArea.w, chartArea.h, {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      });
    });
  }
};
class BasePlatform {
  static {
    __name(this, "BasePlatform");
  }
  acquireContext(canvas2, aspectRatio) {
  }
  releaseContext(context) {
    return false;
  }
  addEventListener(chart, type, listener) {
  }
  removeEventListener(chart, type, listener) {
  }
  getDevicePixelRatio() {
    return 1;
  }
  getMaximumSize(element, width, height, aspectRatio) {
    width = Math.max(0, width || element.width);
    height = height || element.height;
    return {
      width,
      height: Math.max(0, aspectRatio ? Math.floor(width / aspectRatio) : height)
    };
  }
  isAttached(canvas2) {
    return true;
  }
  updateConfig(config) {
  }
}
class BasicPlatform extends BasePlatform {
  static {
    __name(this, "BasicPlatform");
  }
  acquireContext(item) {
    return item && item.getContext && item.getContext("2d") || null;
  }
  updateConfig(config) {
    config.options.animation = false;
  }
}
const EXPANDO_KEY$1 = "$chartjs";
const EVENT_TYPES = {
  touchstart: "mousedown",
  touchmove: "mousemove",
  touchend: "mouseup",
  pointerenter: "mouseenter",
  pointerdown: "mousedown",
  pointermove: "mousemove",
  pointerup: "mouseup",
  pointerleave: "mouseout",
  pointerout: "mouseout"
};
const isNullOrEmpty = /* @__PURE__ */ __name((value) => value === null || value === "", "isNullOrEmpty");
function initCanvas(canvas2, aspectRatio) {
  const style = canvas2.style;
  const renderHeight = canvas2.getAttribute("height");
  const renderWidth = canvas2.getAttribute("width");
  canvas2[EXPANDO_KEY$1] = {
    initial: {
      height: renderHeight,
      width: renderWidth,
      style: {
        display: style.display,
        height: style.height,
        width: style.width
      }
    }
  };
  style.display = style.display || "block";
  style.boxSizing = style.boxSizing || "border-box";
  if (isNullOrEmpty(renderWidth)) {
    const displayWidth = readUsedSize(canvas2, "width");
    if (displayWidth !== void 0) {
      canvas2.width = displayWidth;
    }
  }
  if (isNullOrEmpty(renderHeight)) {
    if (canvas2.style.height === "") {
      canvas2.height = canvas2.width / (aspectRatio || 2);
    } else {
      const displayHeight = readUsedSize(canvas2, "height");
      if (displayHeight !== void 0) {
        canvas2.height = displayHeight;
      }
    }
  }
  return canvas2;
}
__name(initCanvas, "initCanvas");
const eventListenerOptions = supportsEventListenerOptions ? {
  passive: true
} : false;
function addListener(node, type, listener) {
  node.addEventListener(type, listener, eventListenerOptions);
}
__name(addListener, "addListener");
function removeListener(chart, type, listener) {
  chart.canvas.removeEventListener(type, listener, eventListenerOptions);
}
__name(removeListener, "removeListener");
function fromNativeEvent(event, chart) {
  const type = EVENT_TYPES[event.type] || event.type;
  const { x, y } = getRelativePosition(event, chart);
  return {
    type,
    chart,
    native: event,
    x: x !== void 0 ? x : null,
    y: y !== void 0 ? y : null
  };
}
__name(fromNativeEvent, "fromNativeEvent");
function nodeListContains(nodeList, canvas2) {
  for (const node of nodeList) {
    if (node === canvas2 || node.contains(canvas2)) {
      return true;
    }
  }
}
__name(nodeListContains, "nodeListContains");
function createAttachObserver(chart, type, listener) {
  const canvas2 = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.addedNodes, canvas2);
      trigger = trigger && !nodeListContains(entry.removedNodes, canvas2);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
__name(createAttachObserver, "createAttachObserver");
function createDetachObserver(chart, type, listener) {
  const canvas2 = chart.canvas;
  const observer = new MutationObserver((entries) => {
    let trigger = false;
    for (const entry of entries) {
      trigger = trigger || nodeListContains(entry.removedNodes, canvas2);
      trigger = trigger && !nodeListContains(entry.addedNodes, canvas2);
    }
    if (trigger) {
      listener();
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  return observer;
}
__name(createDetachObserver, "createDetachObserver");
const drpListeningCharts = /* @__PURE__ */ new Map();
let oldDevicePixelRatio = 0;
function onWindowResize() {
  const dpr = window.devicePixelRatio;
  if (dpr === oldDevicePixelRatio) {
    return;
  }
  oldDevicePixelRatio = dpr;
  drpListeningCharts.forEach((resize, chart) => {
    if (chart.currentDevicePixelRatio !== dpr) {
      resize();
    }
  });
}
__name(onWindowResize, "onWindowResize");
function listenDevicePixelRatioChanges(chart, resize) {
  if (!drpListeningCharts.size) {
    window.addEventListener("resize", onWindowResize);
  }
  drpListeningCharts.set(chart, resize);
}
__name(listenDevicePixelRatioChanges, "listenDevicePixelRatioChanges");
function unlistenDevicePixelRatioChanges(chart) {
  drpListeningCharts.delete(chart);
  if (!drpListeningCharts.size) {
    window.removeEventListener("resize", onWindowResize);
  }
}
__name(unlistenDevicePixelRatioChanges, "unlistenDevicePixelRatioChanges");
function createResizeObserver(chart, type, listener) {
  const canvas2 = chart.canvas;
  const container = canvas2 && _getParentNode(canvas2);
  if (!container) {
    return;
  }
  const resize = throttled((width, height) => {
    const w = container.clientWidth;
    listener(width, height);
    if (w < container.clientWidth) {
      listener();
    }
  }, window);
  const observer = new ResizeObserver((entries) => {
    const entry = entries[0];
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    if (width === 0 && height === 0) {
      return;
    }
    resize(width, height);
  });
  observer.observe(container);
  listenDevicePixelRatioChanges(chart, resize);
  return observer;
}
__name(createResizeObserver, "createResizeObserver");
function releaseObserver(chart, type, observer) {
  if (observer) {
    observer.disconnect();
  }
  if (type === "resize") {
    unlistenDevicePixelRatioChanges(chart);
  }
}
__name(releaseObserver, "releaseObserver");
function createProxyAndListen(chart, type, listener) {
  const canvas2 = chart.canvas;
  const proxy = throttled((event) => {
    if (chart.ctx !== null) {
      listener(fromNativeEvent(event, chart));
    }
  }, chart);
  addListener(canvas2, type, proxy);
  return proxy;
}
__name(createProxyAndListen, "createProxyAndListen");
class DomPlatform extends BasePlatform {
  static {
    __name(this, "DomPlatform");
  }
  acquireContext(canvas2, aspectRatio) {
    const context = canvas2 && canvas2.getContext && canvas2.getContext("2d");
    if (context && context.canvas === canvas2) {
      initCanvas(canvas2, aspectRatio);
      return context;
    }
    return null;
  }
  releaseContext(context) {
    const canvas2 = context.canvas;
    if (!canvas2[EXPANDO_KEY$1]) {
      return false;
    }
    const initial = canvas2[EXPANDO_KEY$1].initial;
    [
      "height",
      "width"
    ].forEach((prop) => {
      const value = initial[prop];
      if (isNullOrUndef(value)) {
        canvas2.removeAttribute(prop);
      } else {
        canvas2.setAttribute(prop, value);
      }
    });
    const style = initial.style || {};
    Object.keys(style).forEach((key) => {
      canvas2.style[key] = style[key];
    });
    canvas2.width = canvas2.width;
    delete canvas2[EXPANDO_KEY$1];
    return true;
  }
  addEventListener(chart, type, listener) {
    this.removeEventListener(chart, type);
    const proxies = chart.$proxies || (chart.$proxies = {});
    const handlers = {
      attach: createAttachObserver,
      detach: createDetachObserver,
      resize: createResizeObserver
    };
    const handler = handlers[type] || createProxyAndListen;
    proxies[type] = handler(chart, type, listener);
  }
  removeEventListener(chart, type) {
    const proxies = chart.$proxies || (chart.$proxies = {});
    const proxy = proxies[type];
    if (!proxy) {
      return;
    }
    const handlers = {
      attach: releaseObserver,
      detach: releaseObserver,
      resize: releaseObserver
    };
    const handler = handlers[type] || removeListener;
    handler(chart, type, proxy);
    proxies[type] = void 0;
  }
  getDevicePixelRatio() {
    return window.devicePixelRatio;
  }
  getMaximumSize(canvas2, width, height, aspectRatio) {
    return getMaximumSize(canvas2, width, height, aspectRatio);
  }
  isAttached(canvas2) {
    const container = _getParentNode(canvas2);
    return !!(container && container.isConnected);
  }
}
function _detectPlatform(canvas2) {
  if (!_isDomSupported() || typeof OffscreenCanvas !== "undefined" && canvas2 instanceof OffscreenCanvas) {
    return BasicPlatform;
  }
  return DomPlatform;
}
__name(_detectPlatform, "_detectPlatform");
class Element {
  static {
    __name(this, "Element");
  }
  static defaults = {};
  static defaultRoutes = void 0;
  x;
  y;
  active = false;
  options;
  $animations;
  tooltipPosition(useFinalPosition) {
    const { x, y } = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    return {
      x,
      y
    };
  }
  hasValue() {
    return isNumber(this.x) && isNumber(this.y);
  }
  getProps(props, final) {
    const anims = this.$animations;
    if (!final || !anims) {
      return this;
    }
    const ret = {};
    props.forEach((prop) => {
      ret[prop] = anims[prop] && anims[prop].active() ? anims[prop]._to : this[prop];
    });
    return ret;
  }
}
function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const determinedMaxTicks = determineMaxTicks(scale);
  const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
  const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const newTicks = [];
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }
  const spacing = calculateSpacing(majorIndices, ticks, ticksLimit);
  if (numMajorIndices > 0) {
    let i, ilen;
    const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
    skip(ticks, newTicks, spacing, isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
    for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
      skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
    }
    skip(ticks, newTicks, spacing, last, isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
    return newTicks;
  }
  skip(ticks, newTicks, spacing);
  return newTicks;
}
__name(autoSkip, "autoSkip");
function determineMaxTicks(scale) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
}
__name(determineMaxTicks, "determineMaxTicks");
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  const evenMajorSpacing = getEvenSpacing(majorIndices);
  const spacing = ticks.length / ticksLimit;
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }
  const factors = _factorize(evenMajorSpacing);
  for (let i = 0, ilen = factors.length - 1; i < ilen; i++) {
    const factor = factors[i];
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}
__name(calculateSpacing, "calculateSpacing");
function getMajorIndices(ticks) {
  const result = [];
  let i, ilen;
  for (i = 0, ilen = ticks.length; i < ilen; i++) {
    if (ticks[i].major) {
      result.push(i);
    }
  }
  return result;
}
__name(getMajorIndices, "getMajorIndices");
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  let count = 0;
  let next = majorIndices[0];
  let i;
  spacing = Math.ceil(spacing);
  for (i = 0; i < ticks.length; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}
__name(skipMajors, "skipMajors");
function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
  const start = valueOrDefault(majorStart, 0);
  const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
  let count = 0;
  let length, i, next;
  spacing = Math.ceil(spacing);
  if (majorEnd) {
    length = majorEnd - majorStart;
    spacing = length / Math.floor(length / spacing);
  }
  next = start;
  while (next < 0) {
    count++;
    next = Math.round(start + count * spacing);
  }
  for (i = Math.max(start, 0); i < end; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = Math.round(start + count * spacing);
    }
  }
}
__name(skip, "skip");
function getEvenSpacing(arr) {
  const len = arr.length;
  let i, diff;
  if (len < 2) {
    return false;
  }
  for (diff = arr[0], i = 1; i < len; ++i) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
__name(getEvenSpacing, "getEvenSpacing");
const reverseAlign = /* @__PURE__ */ __name((align) => align === "left" ? "right" : align === "right" ? "left" : align, "reverseAlign");
const offsetFromEdge = /* @__PURE__ */ __name((scale, edge, offset) => edge === "top" || edge === "left" ? scale[edge] + offset : scale[edge] - offset, "offsetFromEdge");
const getTicksLimit = /* @__PURE__ */ __name((ticksLength, maxTicksLimit) => Math.min(maxTicksLimit || ticksLength, ticksLength), "getTicksLimit");
function sample(arr, numItems) {
  const result = [];
  const increment = arr.length / numItems;
  const len = arr.length;
  let i = 0;
  for (; i < len; i += increment) {
    result.push(arr[Math.floor(i)]);
  }
  return result;
}
__name(sample, "sample");
function getPixelForGridLine(scale, index2, offsetGridLines) {
  const length = scale.ticks.length;
  const validIndex2 = Math.min(index2, length - 1);
  const start = scale._startPixel;
  const end = scale._endPixel;
  const epsilon = 1e-6;
  let lineValue = scale.getPixelForTick(validIndex2);
  let offset;
  if (offsetGridLines) {
    if (length === 1) {
      offset = Math.max(lineValue - start, end - lineValue);
    } else if (index2 === 0) {
      offset = (scale.getPixelForTick(1) - lineValue) / 2;
    } else {
      offset = (lineValue - scale.getPixelForTick(validIndex2 - 1)) / 2;
    }
    lineValue += validIndex2 < index2 ? offset : -offset;
    if (lineValue < start - epsilon || lineValue > end + epsilon) {
      return;
    }
  }
  return lineValue;
}
__name(getPixelForGridLine, "getPixelForGridLine");
function garbageCollect(caches, length) {
  each(caches, (cache) => {
    const gc = cache.gc;
    const gcLen = gc.length / 2;
    let i;
    if (gcLen > length) {
      for (i = 0; i < gcLen; ++i) {
        delete cache.data[gc[i]];
      }
      gc.splice(0, gcLen);
    }
  });
}
__name(garbageCollect, "garbageCollect");
function getTickMarkLength(options) {
  return options.drawTicks ? options.tickLength : 0;
}
__name(getTickMarkLength, "getTickMarkLength");
function getTitleHeight(options, fallback) {
  if (!options.display) {
    return 0;
  }
  const font = toFont(options.font, fallback);
  const padding = toPadding(options.padding);
  const lines = isArray(options.text) ? options.text.length : 1;
  return lines * font.lineHeight + padding.height;
}
__name(getTitleHeight, "getTitleHeight");
function createScaleContext(parent, scale) {
  return createContext(parent, {
    scale,
    type: "scale"
  });
}
__name(createScaleContext, "createScaleContext");
function createTickContext(parent, index2, tick) {
  return createContext(parent, {
    tick,
    index: index2,
    type: "tick"
  });
}
__name(createTickContext, "createTickContext");
function titleAlign(align, position, reverse) {
  let ret = _toLeftRightCenter(align);
  if (reverse && position !== "right" || !reverse && position === "right") {
    ret = reverseAlign(ret);
  }
  return ret;
}
__name(titleAlign, "titleAlign");
function titleArgs(scale, offset, position, align) {
  const { top, left, bottom, right, chart } = scale;
  const { chartArea, scales: scales2 } = chart;
  let rotation = 0;
  let maxWidth, titleX, titleY;
  const height = bottom - top;
  const width = right - left;
  if (scale.isHorizontal()) {
    titleX = _alignStartEnd(align, left, right);
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleY = scales2[positionAxisID].getPixelForValue(value) + height - offset;
    } else if (position === "center") {
      titleY = (chartArea.bottom + chartArea.top) / 2 + height - offset;
    } else {
      titleY = offsetFromEdge(scale, position, offset);
    }
    maxWidth = right - left;
  } else {
    if (isObject(position)) {
      const positionAxisID = Object.keys(position)[0];
      const value = position[positionAxisID];
      titleX = scales2[positionAxisID].getPixelForValue(value) - width + offset;
    } else if (position === "center") {
      titleX = (chartArea.left + chartArea.right) / 2 - width + offset;
    } else {
      titleX = offsetFromEdge(scale, position, offset);
    }
    titleY = _alignStartEnd(align, bottom, top);
    rotation = position === "left" ? -HALF_PI : HALF_PI;
  }
  return {
    titleX,
    titleY,
    maxWidth,
    rotation
  };
}
__name(titleArgs, "titleArgs");
class Scale extends Element {
  static {
    __name(this, "Scale");
  }
  constructor(cfg) {
    super();
    this.id = cfg.id;
    this.type = cfg.type;
    this.options = void 0;
    this.ctx = cfg.ctx;
    this.chart = cfg.chart;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this._margins = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };
    this.maxWidth = void 0;
    this.maxHeight = void 0;
    this.paddingTop = void 0;
    this.paddingBottom = void 0;
    this.paddingLeft = void 0;
    this.paddingRight = void 0;
    this.axis = void 0;
    this.labelRotation = void 0;
    this.min = void 0;
    this.max = void 0;
    this._range = void 0;
    this.ticks = [];
    this._gridLineItems = null;
    this._labelItems = null;
    this._labelSizes = null;
    this._length = 0;
    this._maxLength = 0;
    this._longestTextCache = {};
    this._startPixel = void 0;
    this._endPixel = void 0;
    this._reversePixels = false;
    this._userMax = void 0;
    this._userMin = void 0;
    this._suggestedMax = void 0;
    this._suggestedMin = void 0;
    this._ticksLength = 0;
    this._borderValue = 0;
    this._cache = {};
    this._dataLimitsCached = false;
    this.$context = void 0;
  }
  init(options) {
    this.options = options.setContext(this.getContext());
    this.axis = options.axis;
    this._userMin = this.parse(options.min);
    this._userMax = this.parse(options.max);
    this._suggestedMin = this.parse(options.suggestedMin);
    this._suggestedMax = this.parse(options.suggestedMax);
  }
  parse(raw, index2) {
    return raw;
  }
  getUserBounds() {
    let { _userMin, _userMax, _suggestedMin, _suggestedMax } = this;
    _userMin = finiteOrDefault(_userMin, Number.POSITIVE_INFINITY);
    _userMax = finiteOrDefault(_userMax, Number.NEGATIVE_INFINITY);
    _suggestedMin = finiteOrDefault(_suggestedMin, Number.POSITIVE_INFINITY);
    _suggestedMax = finiteOrDefault(_suggestedMax, Number.NEGATIVE_INFINITY);
    return {
      min: finiteOrDefault(_userMin, _suggestedMin),
      max: finiteOrDefault(_userMax, _suggestedMax),
      minDefined: isNumberFinite(_userMin),
      maxDefined: isNumberFinite(_userMax)
    };
  }
  getMinMax(canStack) {
    let { min, max, minDefined, maxDefined } = this.getUserBounds();
    let range;
    if (minDefined && maxDefined) {
      return {
        min,
        max
      };
    }
    const metas = this.getMatchingVisibleMetas();
    for (let i = 0, ilen = metas.length; i < ilen; ++i) {
      range = metas[i].controller.getMinMax(this, canStack);
      if (!minDefined) {
        min = Math.min(min, range.min);
      }
      if (!maxDefined) {
        max = Math.max(max, range.max);
      }
    }
    min = maxDefined && min > max ? max : min;
    max = minDefined && min > max ? min : max;
    return {
      min: finiteOrDefault(min, finiteOrDefault(max, min)),
      max: finiteOrDefault(max, finiteOrDefault(min, max))
    };
  }
  getPadding() {
    return {
      left: this.paddingLeft || 0,
      top: this.paddingTop || 0,
      right: this.paddingRight || 0,
      bottom: this.paddingBottom || 0
    };
  }
  getTicks() {
    return this.ticks;
  }
  getLabels() {
    const data = this.chart.data;
    return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
  }
  getLabelItems(chartArea = this.chart.chartArea) {
    const items = this._labelItems || (this._labelItems = this._computeLabelItems(chartArea));
    return items;
  }
  beforeLayout() {
    this._cache = {};
    this._dataLimitsCached = false;
  }
  beforeUpdate() {
    callback(this.options.beforeUpdate, [
      this
    ]);
  }
  update(maxWidth, maxHeight, margins) {
    const { beginAtZero, grace, ticks: tickOpts } = this.options;
    const sampleSize = tickOpts.sampleSize;
    this.beforeUpdate();
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins = Object.assign({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }, margins);
    this.ticks = null;
    this._labelSizes = null;
    this._gridLineItems = null;
    this._labelItems = null;
    this.beforeSetDimensions();
    this.setDimensions();
    this.afterSetDimensions();
    this._maxLength = this.isHorizontal() ? this.width + margins.left + margins.right : this.height + margins.top + margins.bottom;
    if (!this._dataLimitsCached) {
      this.beforeDataLimits();
      this.determineDataLimits();
      this.afterDataLimits();
      this._range = _addGrace(this, grace, beginAtZero);
      this._dataLimitsCached = true;
    }
    this.beforeBuildTicks();
    this.ticks = this.buildTicks() || [];
    this.afterBuildTicks();
    const samplingEnabled = sampleSize < this.ticks.length;
    this._convertTicksToLabels(samplingEnabled ? sample(this.ticks, sampleSize) : this.ticks);
    this.configure();
    this.beforeCalculateLabelRotation();
    this.calculateLabelRotation();
    this.afterCalculateLabelRotation();
    if (tickOpts.display && (tickOpts.autoSkip || tickOpts.source === "auto")) {
      this.ticks = autoSkip(this, this.ticks);
      this._labelSizes = null;
      this.afterAutoSkip();
    }
    if (samplingEnabled) {
      this._convertTicksToLabels(this.ticks);
    }
    this.beforeFit();
    this.fit();
    this.afterFit();
    this.afterUpdate();
  }
  configure() {
    let reversePixels = this.options.reverse;
    let startPixel, endPixel;
    if (this.isHorizontal()) {
      startPixel = this.left;
      endPixel = this.right;
    } else {
      startPixel = this.top;
      endPixel = this.bottom;
      reversePixels = !reversePixels;
    }
    this._startPixel = startPixel;
    this._endPixel = endPixel;
    this._reversePixels = reversePixels;
    this._length = endPixel - startPixel;
    this._alignToPixels = this.options.alignToPixels;
  }
  afterUpdate() {
    callback(this.options.afterUpdate, [
      this
    ]);
  }
  beforeSetDimensions() {
    callback(this.options.beforeSetDimensions, [
      this
    ]);
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = 0;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = 0;
      this.bottom = this.height;
    }
    this.paddingLeft = 0;
    this.paddingTop = 0;
    this.paddingRight = 0;
    this.paddingBottom = 0;
  }
  afterSetDimensions() {
    callback(this.options.afterSetDimensions, [
      this
    ]);
  }
  _callHooks(name) {
    this.chart.notifyPlugins(name, this.getContext());
    callback(this.options[name], [
      this
    ]);
  }
  beforeDataLimits() {
    this._callHooks("beforeDataLimits");
  }
  determineDataLimits() {
  }
  afterDataLimits() {
    this._callHooks("afterDataLimits");
  }
  beforeBuildTicks() {
    this._callHooks("beforeBuildTicks");
  }
  buildTicks() {
    return [];
  }
  afterBuildTicks() {
    this._callHooks("afterBuildTicks");
  }
  beforeTickToLabelConversion() {
    callback(this.options.beforeTickToLabelConversion, [
      this
    ]);
  }
  generateTickLabels(ticks) {
    const tickOpts = this.options.ticks;
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      tick = ticks[i];
      tick.label = callback(tickOpts.callback, [
        tick.value,
        i,
        ticks
      ], this);
    }
  }
  afterTickToLabelConversion() {
    callback(this.options.afterTickToLabelConversion, [
      this
    ]);
  }
  beforeCalculateLabelRotation() {
    callback(this.options.beforeCalculateLabelRotation, [
      this
    ]);
  }
  calculateLabelRotation() {
    const options = this.options;
    const tickOpts = options.ticks;
    const numTicks = getTicksLimit(this.ticks.length, options.ticks.maxTicksLimit);
    const minRotation = tickOpts.minRotation || 0;
    const maxRotation = tickOpts.maxRotation;
    let labelRotation = minRotation;
    let tickWidth, maxHeight, maxLabelDiagonal;
    if (!this._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !this.isHorizontal()) {
      this.labelRotation = minRotation;
      return;
    }
    const labelSizes = this._getLabelSizes();
    const maxLabelWidth = labelSizes.widest.width;
    const maxLabelHeight = labelSizes.highest.height;
    const maxWidth = _limitValue(this.chart.width - maxLabelWidth, 0, this.maxWidth);
    tickWidth = options.offset ? this.maxWidth / numTicks : maxWidth / (numTicks - 1);
    if (maxLabelWidth + 6 > tickWidth) {
      tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
      maxHeight = this.maxHeight - getTickMarkLength(options.grid) - tickOpts.padding - getTitleHeight(options.title, this.chart.options.font);
      maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
      labelRotation = toDegrees(Math.min(Math.asin(_limitValue((labelSizes.highest.height + 6) / tickWidth, -1, 1)), Math.asin(_limitValue(maxHeight / maxLabelDiagonal, -1, 1)) - Math.asin(_limitValue(maxLabelHeight / maxLabelDiagonal, -1, 1))));
      labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
    }
    this.labelRotation = labelRotation;
  }
  afterCalculateLabelRotation() {
    callback(this.options.afterCalculateLabelRotation, [
      this
    ]);
  }
  afterAutoSkip() {
  }
  beforeFit() {
    callback(this.options.beforeFit, [
      this
    ]);
  }
  fit() {
    const minSize = {
      width: 0,
      height: 0
    };
    const { chart, options: { ticks: tickOpts, title: titleOpts, grid: gridOpts } } = this;
    const display = this._isVisible();
    const isHorizontal = this.isHorizontal();
    if (display) {
      const titleHeight = getTitleHeight(titleOpts, chart.options.font);
      if (isHorizontal) {
        minSize.width = this.maxWidth;
        minSize.height = getTickMarkLength(gridOpts) + titleHeight;
      } else {
        minSize.height = this.maxHeight;
        minSize.width = getTickMarkLength(gridOpts) + titleHeight;
      }
      if (tickOpts.display && this.ticks.length) {
        const { first, last, widest, highest } = this._getLabelSizes();
        const tickPadding = tickOpts.padding * 2;
        const angleRadians = toRadians(this.labelRotation);
        const cos = Math.cos(angleRadians);
        const sin = Math.sin(angleRadians);
        if (isHorizontal) {
          const labelHeight = tickOpts.mirror ? 0 : sin * widest.width + cos * highest.height;
          minSize.height = Math.min(this.maxHeight, minSize.height + labelHeight + tickPadding);
        } else {
          const labelWidth = tickOpts.mirror ? 0 : cos * widest.width + sin * highest.height;
          minSize.width = Math.min(this.maxWidth, minSize.width + labelWidth + tickPadding);
        }
        this._calculatePadding(first, last, sin, cos);
      }
    }
    this._handleMargins();
    if (isHorizontal) {
      this.width = this._length = chart.width - this._margins.left - this._margins.right;
      this.height = minSize.height;
    } else {
      this.width = minSize.width;
      this.height = this._length = chart.height - this._margins.top - this._margins.bottom;
    }
  }
  _calculatePadding(first, last, sin, cos) {
    const { ticks: { align, padding }, position } = this.options;
    const isRotated = this.labelRotation !== 0;
    const labelsBelowTicks = position !== "top" && this.axis === "x";
    if (this.isHorizontal()) {
      const offsetLeft = this.getPixelForTick(0) - this.left;
      const offsetRight = this.right - this.getPixelForTick(this.ticks.length - 1);
      let paddingLeft = 0;
      let paddingRight = 0;
      if (isRotated) {
        if (labelsBelowTicks) {
          paddingLeft = cos * first.width;
          paddingRight = sin * last.height;
        } else {
          paddingLeft = sin * first.height;
          paddingRight = cos * last.width;
        }
      } else if (align === "start") {
        paddingRight = last.width;
      } else if (align === "end") {
        paddingLeft = first.width;
      } else if (align !== "inner") {
        paddingLeft = first.width / 2;
        paddingRight = last.width / 2;
      }
      this.paddingLeft = Math.max((paddingLeft - offsetLeft + padding) * this.width / (this.width - offsetLeft), 0);
      this.paddingRight = Math.max((paddingRight - offsetRight + padding) * this.width / (this.width - offsetRight), 0);
    } else {
      let paddingTop = last.height / 2;
      let paddingBottom = first.height / 2;
      if (align === "start") {
        paddingTop = 0;
        paddingBottom = first.height;
      } else if (align === "end") {
        paddingTop = last.height;
        paddingBottom = 0;
      }
      this.paddingTop = paddingTop + padding;
      this.paddingBottom = paddingBottom + padding;
    }
  }
  _handleMargins() {
    if (this._margins) {
      this._margins.left = Math.max(this.paddingLeft, this._margins.left);
      this._margins.top = Math.max(this.paddingTop, this._margins.top);
      this._margins.right = Math.max(this.paddingRight, this._margins.right);
      this._margins.bottom = Math.max(this.paddingBottom, this._margins.bottom);
    }
  }
  afterFit() {
    callback(this.options.afterFit, [
      this
    ]);
  }
  isHorizontal() {
    const { axis, position } = this.options;
    return position === "top" || position === "bottom" || axis === "x";
  }
  isFullSize() {
    return this.options.fullSize;
  }
  _convertTicksToLabels(ticks) {
    this.beforeTickToLabelConversion();
    this.generateTickLabels(ticks);
    let i, ilen;
    for (i = 0, ilen = ticks.length; i < ilen; i++) {
      if (isNullOrUndef(ticks[i].label)) {
        ticks.splice(i, 1);
        ilen--;
        i--;
      }
    }
    this.afterTickToLabelConversion();
  }
  _getLabelSizes() {
    let labelSizes = this._labelSizes;
    if (!labelSizes) {
      const sampleSize = this.options.ticks.sampleSize;
      let ticks = this.ticks;
      if (sampleSize < ticks.length) {
        ticks = sample(ticks, sampleSize);
      }
      this._labelSizes = labelSizes = this._computeLabelSizes(ticks, ticks.length, this.options.ticks.maxTicksLimit);
    }
    return labelSizes;
  }
  _computeLabelSizes(ticks, length, maxTicksLimit) {
    const { ctx, _longestTextCache: caches } = this;
    const widths = [];
    const heights = [];
    const increment = Math.floor(length / getTicksLimit(length, maxTicksLimit));
    let widestLabelSize = 0;
    let highestLabelSize = 0;
    let i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel;
    for (i = 0; i < length; i += increment) {
      label = ticks[i].label;
      tickFont = this._resolveTickFontOptions(i);
      ctx.font = fontString = tickFont.string;
      cache = caches[fontString] = caches[fontString] || {
        data: {},
        gc: []
      };
      lineHeight = tickFont.lineHeight;
      width = height = 0;
      if (!isNullOrUndef(label) && !isArray(label)) {
        width = _measureText(ctx, cache.data, cache.gc, width, label);
        height = lineHeight;
      } else if (isArray(label)) {
        for (j = 0, jlen = label.length; j < jlen; ++j) {
          nestedLabel = label[j];
          if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
            width = _measureText(ctx, cache.data, cache.gc, width, nestedLabel);
            height += lineHeight;
          }
        }
      }
      widths.push(width);
      heights.push(height);
      widestLabelSize = Math.max(width, widestLabelSize);
      highestLabelSize = Math.max(height, highestLabelSize);
    }
    garbageCollect(caches, length);
    const widest = widths.indexOf(widestLabelSize);
    const highest = heights.indexOf(highestLabelSize);
    const valueAt = /* @__PURE__ */ __name((idx) => ({
      width: widths[idx] || 0,
      height: heights[idx] || 0
    }), "valueAt");
    return {
      first: valueAt(0),
      last: valueAt(length - 1),
      widest: valueAt(widest),
      highest: valueAt(highest),
      widths,
      heights
    };
  }
  getLabelForValue(value) {
    return value;
  }
  getPixelForValue(value, index2) {
    return NaN;
  }
  getValueForPixel(pixel) {
  }
  getPixelForTick(index2) {
    const ticks = this.ticks;
    if (index2 < 0 || index2 > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index2].value);
  }
  getPixelForDecimal(decimal) {
    if (this._reversePixels) {
      decimal = 1 - decimal;
    }
    const pixel = this._startPixel + decimal * this._length;
    return _int16Range(this._alignToPixels ? _alignPixel(this.chart, pixel, 0) : pixel);
  }
  getDecimalForPixel(pixel) {
    const decimal = (pixel - this._startPixel) / this._length;
    return this._reversePixels ? 1 - decimal : decimal;
  }
  getBasePixel() {
    return this.getPixelForValue(this.getBaseValue());
  }
  getBaseValue() {
    const { min, max } = this;
    return min < 0 && max < 0 ? max : min > 0 && max > 0 ? min : 0;
  }
  getContext(index2) {
    const ticks = this.ticks || [];
    if (index2 >= 0 && index2 < ticks.length) {
      const tick = ticks[index2];
      return tick.$context || (tick.$context = createTickContext(this.getContext(), index2, tick));
    }
    return this.$context || (this.$context = createScaleContext(this.chart.getContext(), this));
  }
  _tickSize() {
    const optionTicks = this.options.ticks;
    const rot = toRadians(this.labelRotation);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));
    const labelSizes = this._getLabelSizes();
    const padding = optionTicks.autoSkipPadding || 0;
    const w = labelSizes ? labelSizes.widest.width + padding : 0;
    const h = labelSizes ? labelSizes.highest.height + padding : 0;
    return this.isHorizontal() ? h * cos > w * sin ? w / cos : h / sin : h * sin < w * cos ? h / cos : w / sin;
  }
  _isVisible() {
    const display = this.options.display;
    if (display !== "auto") {
      return !!display;
    }
    return this.getMatchingVisibleMetas().length > 0;
  }
  _computeGridLineItems(chartArea) {
    const axis = this.axis;
    const chart = this.chart;
    const options = this.options;
    const { grid, position, border } = options;
    const offset = grid.offset;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const ticksLength = ticks.length + (offset ? 1 : 0);
    const tl = getTickMarkLength(grid);
    const items = [];
    const borderOpts = border.setContext(this.getContext());
    const axisWidth = borderOpts.display ? borderOpts.width : 0;
    const axisHalfWidth = axisWidth / 2;
    const alignBorderValue = /* @__PURE__ */ __name(function(pixel) {
      return _alignPixel(chart, pixel, axisWidth);
    }, "alignBorderValue");
    let borderValue, i, lineValue, alignedLineValue;
    let tx1, ty1, tx2, ty2, x1, y1, x2, y2;
    if (position === "top") {
      borderValue = alignBorderValue(this.bottom);
      ty1 = this.bottom - tl;
      ty2 = borderValue - axisHalfWidth;
      y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
      y2 = chartArea.bottom;
    } else if (position === "bottom") {
      borderValue = alignBorderValue(this.top);
      y1 = chartArea.top;
      y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
      ty1 = borderValue + axisHalfWidth;
      ty2 = this.top + tl;
    } else if (position === "left") {
      borderValue = alignBorderValue(this.right);
      tx1 = this.right - tl;
      tx2 = borderValue - axisHalfWidth;
      x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
      x2 = chartArea.right;
    } else if (position === "right") {
      borderValue = alignBorderValue(this.left);
      x1 = chartArea.left;
      x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
      tx1 = borderValue + axisHalfWidth;
      tx2 = this.left + tl;
    } else if (axis === "x") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.top + chartArea.bottom) / 2 + 0.5);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      y1 = chartArea.top;
      y2 = chartArea.bottom;
      ty1 = borderValue + axisHalfWidth;
      ty2 = ty1 + tl;
    } else if (axis === "y") {
      if (position === "center") {
        borderValue = alignBorderValue((chartArea.left + chartArea.right) / 2);
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        borderValue = alignBorderValue(this.chart.scales[positionAxisID].getPixelForValue(value));
      }
      tx1 = borderValue - axisHalfWidth;
      tx2 = tx1 - tl;
      x1 = chartArea.left;
      x2 = chartArea.right;
    }
    const limit = valueOrDefault(options.ticks.maxTicksLimit, ticksLength);
    const step = Math.max(1, Math.ceil(ticksLength / limit));
    for (i = 0; i < ticksLength; i += step) {
      const context = this.getContext(i);
      const optsAtIndex = grid.setContext(context);
      const optsAtIndexBorder = border.setContext(context);
      const lineWidth = optsAtIndex.lineWidth;
      const lineColor = optsAtIndex.color;
      const borderDash = optsAtIndexBorder.dash || [];
      const borderDashOffset = optsAtIndexBorder.dashOffset;
      const tickWidth = optsAtIndex.tickWidth;
      const tickColor = optsAtIndex.tickColor;
      const tickBorderDash = optsAtIndex.tickBorderDash || [];
      const tickBorderDashOffset = optsAtIndex.tickBorderDashOffset;
      lineValue = getPixelForGridLine(this, i, offset);
      if (lineValue === void 0) {
        continue;
      }
      alignedLineValue = _alignPixel(chart, lineValue, lineWidth);
      if (isHorizontal) {
        tx1 = tx2 = x1 = x2 = alignedLineValue;
      } else {
        ty1 = ty2 = y1 = y2 = alignedLineValue;
      }
      items.push({
        tx1,
        ty1,
        tx2,
        ty2,
        x1,
        y1,
        x2,
        y2,
        width: lineWidth,
        color: lineColor,
        borderDash,
        borderDashOffset,
        tickWidth,
        tickColor,
        tickBorderDash,
        tickBorderDashOffset
      });
    }
    this._ticksLength = ticksLength;
    this._borderValue = borderValue;
    return items;
  }
  _computeLabelItems(chartArea) {
    const axis = this.axis;
    const options = this.options;
    const { position, ticks: optionTicks } = options;
    const isHorizontal = this.isHorizontal();
    const ticks = this.ticks;
    const { align, crossAlign, padding, mirror } = optionTicks;
    const tl = getTickMarkLength(options.grid);
    const tickAndPadding = tl + padding;
    const hTickAndPadding = mirror ? -padding : tickAndPadding;
    const rotation = -toRadians(this.labelRotation);
    const items = [];
    let i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;
    let textBaseline = "middle";
    if (position === "top") {
      y = this.bottom - hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "bottom") {
      y = this.top + hTickAndPadding;
      textAlign = this._getXAxisLabelAlignment();
    } else if (position === "left") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (position === "right") {
      const ret = this._getYAxisLabelAlignment(tl);
      textAlign = ret.textAlign;
      x = ret.x;
    } else if (axis === "x") {
      if (position === "center") {
        y = (chartArea.top + chartArea.bottom) / 2 + tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        y = this.chart.scales[positionAxisID].getPixelForValue(value) + tickAndPadding;
      }
      textAlign = this._getXAxisLabelAlignment();
    } else if (axis === "y") {
      if (position === "center") {
        x = (chartArea.left + chartArea.right) / 2 - tickAndPadding;
      } else if (isObject(position)) {
        const positionAxisID = Object.keys(position)[0];
        const value = position[positionAxisID];
        x = this.chart.scales[positionAxisID].getPixelForValue(value);
      }
      textAlign = this._getYAxisLabelAlignment(tl).textAlign;
    }
    if (axis === "y") {
      if (align === "start") {
        textBaseline = "top";
      } else if (align === "end") {
        textBaseline = "bottom";
      }
    }
    const labelSizes = this._getLabelSizes();
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      label = tick.label;
      const optsAtIndex = optionTicks.setContext(this.getContext(i));
      pixel = this.getPixelForTick(i) + optionTicks.labelOffset;
      font = this._resolveTickFontOptions(i);
      lineHeight = font.lineHeight;
      lineCount = isArray(label) ? label.length : 1;
      const halfCount = lineCount / 2;
      const color2 = optsAtIndex.color;
      const strokeColor = optsAtIndex.textStrokeColor;
      const strokeWidth = optsAtIndex.textStrokeWidth;
      let tickTextAlign = textAlign;
      if (isHorizontal) {
        x = pixel;
        if (textAlign === "inner") {
          if (i === ilen - 1) {
            tickTextAlign = !this.options.reverse ? "right" : "left";
          } else if (i === 0) {
            tickTextAlign = !this.options.reverse ? "left" : "right";
          } else {
            tickTextAlign = "center";
          }
        }
        if (position === "top") {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = -lineCount * lineHeight + lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = -labelSizes.highest.height / 2 - halfCount * lineHeight + lineHeight;
          } else {
            textOffset = -labelSizes.highest.height + lineHeight / 2;
          }
        } else {
          if (crossAlign === "near" || rotation !== 0) {
            textOffset = lineHeight / 2;
          } else if (crossAlign === "center") {
            textOffset = labelSizes.highest.height / 2 - halfCount * lineHeight;
          } else {
            textOffset = labelSizes.highest.height - lineCount * lineHeight;
          }
        }
        if (mirror) {
          textOffset *= -1;
        }
        if (rotation !== 0 && !optsAtIndex.showLabelBackdrop) {
          x += lineHeight / 2 * Math.sin(rotation);
        }
      } else {
        y = pixel;
        textOffset = (1 - lineCount) * lineHeight / 2;
      }
      let backdrop;
      if (optsAtIndex.showLabelBackdrop) {
        const labelPadding = toPadding(optsAtIndex.backdropPadding);
        const height = labelSizes.heights[i];
        const width = labelSizes.widths[i];
        let top = textOffset - labelPadding.top;
        let left = 0 - labelPadding.left;
        switch (textBaseline) {
          case "middle":
            top -= height / 2;
            break;
          case "bottom":
            top -= height;
            break;
        }
        switch (textAlign) {
          case "center":
            left -= width / 2;
            break;
          case "right":
            left -= width;
            break;
          case "inner":
            if (i === ilen - 1) {
              left -= width;
            } else if (i > 0) {
              left -= width / 2;
            }
            break;
        }
        backdrop = {
          left,
          top,
          width: width + labelPadding.width,
          height: height + labelPadding.height,
          color: optsAtIndex.backdropColor
        };
      }
      items.push({
        label,
        font,
        textOffset,
        options: {
          rotation,
          color: color2,
          strokeColor,
          strokeWidth,
          textAlign: tickTextAlign,
          textBaseline,
          translation: [
            x,
            y
          ],
          backdrop
        }
      });
    }
    return items;
  }
  _getXAxisLabelAlignment() {
    const { position, ticks } = this.options;
    const rotation = -toRadians(this.labelRotation);
    if (rotation) {
      return position === "top" ? "left" : "right";
    }
    let align = "center";
    if (ticks.align === "start") {
      align = "left";
    } else if (ticks.align === "end") {
      align = "right";
    } else if (ticks.align === "inner") {
      align = "inner";
    }
    return align;
  }
  _getYAxisLabelAlignment(tl) {
    const { position, ticks: { crossAlign, mirror, padding } } = this.options;
    const labelSizes = this._getLabelSizes();
    const tickAndPadding = tl + padding;
    const widest = labelSizes.widest.width;
    let textAlign;
    let x;
    if (position === "left") {
      if (mirror) {
        x = this.right + padding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x += widest / 2;
        } else {
          textAlign = "right";
          x += widest;
        }
      } else {
        x = this.right - tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x -= widest / 2;
        } else {
          textAlign = "left";
          x = this.left;
        }
      }
    } else if (position === "right") {
      if (mirror) {
        x = this.left + padding;
        if (crossAlign === "near") {
          textAlign = "right";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x -= widest / 2;
        } else {
          textAlign = "left";
          x -= widest;
        }
      } else {
        x = this.left + tickAndPadding;
        if (crossAlign === "near") {
          textAlign = "left";
        } else if (crossAlign === "center") {
          textAlign = "center";
          x += widest / 2;
        } else {
          textAlign = "right";
          x = this.right;
        }
      }
    } else {
      textAlign = "right";
    }
    return {
      textAlign,
      x
    };
  }
  _computeLabelArea() {
    if (this.options.ticks.mirror) {
      return;
    }
    const chart = this.chart;
    const position = this.options.position;
    if (position === "left" || position === "right") {
      return {
        top: 0,
        left: this.left,
        bottom: chart.height,
        right: this.right
      };
    }
    if (position === "top" || position === "bottom") {
      return {
        top: this.top,
        left: 0,
        bottom: this.bottom,
        right: chart.width
      };
    }
  }
  drawBackground() {
    const { ctx, options: { backgroundColor }, left, top, width, height } = this;
    if (backgroundColor) {
      ctx.save();
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(left, top, width, height);
      ctx.restore();
    }
  }
  getLineWidthForValue(value) {
    const grid = this.options.grid;
    if (!this._isVisible() || !grid.display) {
      return 0;
    }
    const ticks = this.ticks;
    const index2 = ticks.findIndex((t) => t.value === value);
    if (index2 >= 0) {
      const opts = grid.setContext(this.getContext(index2));
      return opts.lineWidth;
    }
    return 0;
  }
  drawGrid(chartArea) {
    const grid = this.options.grid;
    const ctx = this.ctx;
    const items = this._gridLineItems || (this._gridLineItems = this._computeGridLineItems(chartArea));
    let i, ilen;
    const drawLine = /* @__PURE__ */ __name((p1, p2, style) => {
      if (!style.width || !style.color) {
        return;
      }
      ctx.save();
      ctx.lineWidth = style.width;
      ctx.strokeStyle = style.color;
      ctx.setLineDash(style.borderDash || []);
      ctx.lineDashOffset = style.borderDashOffset;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    }, "drawLine");
    if (grid.display) {
      for (i = 0, ilen = items.length; i < ilen; ++i) {
        const item = items[i];
        if (grid.drawOnChartArea) {
          drawLine({
            x: item.x1,
            y: item.y1
          }, {
            x: item.x2,
            y: item.y2
          }, item);
        }
        if (grid.drawTicks) {
          drawLine({
            x: item.tx1,
            y: item.ty1
          }, {
            x: item.tx2,
            y: item.ty2
          }, {
            color: item.tickColor,
            width: item.tickWidth,
            borderDash: item.tickBorderDash,
            borderDashOffset: item.tickBorderDashOffset
          });
        }
      }
    }
  }
  drawBorder() {
    const { chart, ctx, options: { border, grid } } = this;
    const borderOpts = border.setContext(this.getContext());
    const axisWidth = border.display ? borderOpts.width : 0;
    if (!axisWidth) {
      return;
    }
    const lastLineWidth = grid.setContext(this.getContext(0)).lineWidth;
    const borderValue = this._borderValue;
    let x1, x2, y1, y2;
    if (this.isHorizontal()) {
      x1 = _alignPixel(chart, this.left, axisWidth) - axisWidth / 2;
      x2 = _alignPixel(chart, this.right, lastLineWidth) + lastLineWidth / 2;
      y1 = y2 = borderValue;
    } else {
      y1 = _alignPixel(chart, this.top, axisWidth) - axisWidth / 2;
      y2 = _alignPixel(chart, this.bottom, lastLineWidth) + lastLineWidth / 2;
      x1 = x2 = borderValue;
    }
    ctx.save();
    ctx.lineWidth = borderOpts.width;
    ctx.strokeStyle = borderOpts.color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  }
  drawLabels(chartArea) {
    const optionTicks = this.options.ticks;
    if (!optionTicks.display) {
      return;
    }
    const ctx = this.ctx;
    const area = this._computeLabelArea();
    if (area) {
      clipArea(ctx, area);
    }
    const items = this.getLabelItems(chartArea);
    for (const item of items) {
      const renderTextOptions = item.options;
      const tickFont = item.font;
      const label = item.label;
      const y = item.textOffset;
      renderText(ctx, label, 0, y, tickFont, renderTextOptions);
    }
    if (area) {
      unclipArea(ctx);
    }
  }
  drawTitle() {
    const { ctx, options: { position, title, reverse } } = this;
    if (!title.display) {
      return;
    }
    const font = toFont(title.font);
    const padding = toPadding(title.padding);
    const align = title.align;
    let offset = font.lineHeight / 2;
    if (position === "bottom" || position === "center" || isObject(position)) {
      offset += padding.bottom;
      if (isArray(title.text)) {
        offset += font.lineHeight * (title.text.length - 1);
      }
    } else {
      offset += padding.top;
    }
    const { titleX, titleY, maxWidth, rotation } = titleArgs(this, offset, position, align);
    renderText(ctx, title.text, 0, 0, font, {
      color: title.color,
      maxWidth,
      rotation,
      textAlign: titleAlign(align, position, reverse),
      textBaseline: "middle",
      translation: [
        titleX,
        titleY
      ]
    });
  }
  draw(chartArea) {
    if (!this._isVisible()) {
      return;
    }
    this.drawBackground();
    this.drawGrid(chartArea);
    this.drawBorder();
    this.drawTitle();
    this.drawLabels(chartArea);
  }
  _layers() {
    const opts = this.options;
    const tz = opts.ticks && opts.ticks.z || 0;
    const gz = valueOrDefault(opts.grid && opts.grid.z, -1);
    const bz = valueOrDefault(opts.border && opts.border.z, 0);
    if (!this._isVisible() || this.draw !== Scale.prototype.draw) {
      return [
        {
          z: tz,
          draw: (chartArea) => {
            this.draw(chartArea);
          }
        }
      ];
    }
    return [
      {
        z: gz,
        draw: (chartArea) => {
          this.drawBackground();
          this.drawGrid(chartArea);
          this.drawTitle();
        }
      },
      {
        z: bz,
        draw: () => {
          this.drawBorder();
        }
      },
      {
        z: tz,
        draw: (chartArea) => {
          this.drawLabels(chartArea);
        }
      }
    ];
  }
  getMatchingVisibleMetas(type) {
    const metas = this.chart.getSortedVisibleDatasetMetas();
    const axisID = this.axis + "AxisID";
    const result = [];
    let i, ilen;
    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      const meta = metas[i];
      if (meta[axisID] === this.id && (!type || meta.type === type)) {
        result.push(meta);
      }
    }
    return result;
  }
  _resolveTickFontOptions(index2) {
    const opts = this.options.ticks.setContext(this.getContext(index2));
    return toFont(opts.font);
  }
  _maxDigits() {
    const fontSize = this._resolveTickFontOptions(0).lineHeight;
    return (this.isHorizontal() ? this.width : this.height) / fontSize;
  }
}
class TypedRegistry {
  static {
    __name(this, "TypedRegistry");
  }
  constructor(type, scope, override) {
    this.type = type;
    this.scope = scope;
    this.override = override;
    this.items = /* @__PURE__ */ Object.create(null);
  }
  isForType(type) {
    return Object.prototype.isPrototypeOf.call(this.type.prototype, type.prototype);
  }
  register(item) {
    const proto = Object.getPrototypeOf(item);
    let parentScope;
    if (isIChartComponent(proto)) {
      parentScope = this.register(proto);
    }
    const items = this.items;
    const id = item.id;
    const scope = this.scope + "." + id;
    if (!id) {
      throw new Error("class does not have id: " + item);
    }
    if (id in items) {
      return scope;
    }
    items[id] = item;
    registerDefaults(item, scope, parentScope);
    if (this.override) {
      defaults$1.override(item.id, item.overrides);
    }
    return scope;
  }
  get(id) {
    return this.items[id];
  }
  unregister(item) {
    const items = this.items;
    const id = item.id;
    const scope = this.scope;
    if (id in items) {
      delete items[id];
    }
    if (scope && id in defaults$1[scope]) {
      delete defaults$1[scope][id];
      if (this.override) {
        delete overrides[id];
      }
    }
  }
}
function registerDefaults(item, scope, parentScope) {
  const itemDefaults = merge(/* @__PURE__ */ Object.create(null), [
    parentScope ? defaults$1.get(parentScope) : {},
    defaults$1.get(scope),
    item.defaults
  ]);
  defaults$1.set(scope, itemDefaults);
  if (item.defaultRoutes) {
    routeDefaults(scope, item.defaultRoutes);
  }
  if (item.descriptors) {
    defaults$1.describe(scope, item.descriptors);
  }
}
__name(registerDefaults, "registerDefaults");
function routeDefaults(scope, routes) {
  Object.keys(routes).forEach((property) => {
    const propertyParts = property.split(".");
    const sourceName = propertyParts.pop();
    const sourceScope = [
      scope
    ].concat(propertyParts).join(".");
    const parts = routes[property].split(".");
    const targetName = parts.pop();
    const targetScope = parts.join(".");
    defaults$1.route(sourceScope, sourceName, targetScope, targetName);
  });
}
__name(routeDefaults, "routeDefaults");
function isIChartComponent(proto) {
  return "id" in proto && "defaults" in proto;
}
__name(isIChartComponent, "isIChartComponent");
class Registry {
  static {
    __name(this, "Registry");
  }
  constructor() {
    this.controllers = new TypedRegistry(DatasetController, "datasets", true);
    this.elements = new TypedRegistry(Element, "elements");
    this.plugins = new TypedRegistry(Object, "plugins");
    this.scales = new TypedRegistry(Scale, "scales");
    this._typedRegistries = [
      this.controllers,
      this.scales,
      this.elements
    ];
  }
  add(...args) {
    this._each("register", args);
  }
  remove(...args) {
    this._each("unregister", args);
  }
  addControllers(...args) {
    this._each("register", args, this.controllers);
  }
  addElements(...args) {
    this._each("register", args, this.elements);
  }
  addPlugins(...args) {
    this._each("register", args, this.plugins);
  }
  addScales(...args) {
    this._each("register", args, this.scales);
  }
  getController(id) {
    return this._get(id, this.controllers, "controller");
  }
  getElement(id) {
    return this._get(id, this.elements, "element");
  }
  getPlugin(id) {
    return this._get(id, this.plugins, "plugin");
  }
  getScale(id) {
    return this._get(id, this.scales, "scale");
  }
  removeControllers(...args) {
    this._each("unregister", args, this.controllers);
  }
  removeElements(...args) {
    this._each("unregister", args, this.elements);
  }
  removePlugins(...args) {
    this._each("unregister", args, this.plugins);
  }
  removeScales(...args) {
    this._each("unregister", args, this.scales);
  }
  _each(method, args, typedRegistry) {
    [
      ...args
    ].forEach((arg) => {
      const reg = typedRegistry || this._getRegistryForType(arg);
      if (typedRegistry || reg.isForType(arg) || reg === this.plugins && arg.id) {
        this._exec(method, reg, arg);
      } else {
        each(arg, (item) => {
          const itemReg = typedRegistry || this._getRegistryForType(item);
          this._exec(method, itemReg, item);
        });
      }
    });
  }
  _exec(method, registry2, component) {
    const camelMethod = _capitalize(method);
    callback(component["before" + camelMethod], [], component);
    registry2[method](component);
    callback(component["after" + camelMethod], [], component);
  }
  _getRegistryForType(type) {
    for (let i = 0; i < this._typedRegistries.length; i++) {
      const reg = this._typedRegistries[i];
      if (reg.isForType(type)) {
        return reg;
      }
    }
    return this.plugins;
  }
  _get(id, typedRegistry, type) {
    const item = typedRegistry.get(id);
    if (item === void 0) {
      throw new Error('"' + id + '" is not a registered ' + type + ".");
    }
    return item;
  }
}
var registry = /* @__PURE__ */ new Registry();
class PluginService {
  static {
    __name(this, "PluginService");
  }
  constructor() {
    this._init = [];
  }
  notify(chart, hook, args, filter) {
    if (hook === "beforeInit") {
      this._init = this._createDescriptors(chart, true);
      this._notify(this._init, chart, "install");
    }
    const descriptors2 = filter ? this._descriptors(chart).filter(filter) : this._descriptors(chart);
    const result = this._notify(descriptors2, chart, hook, args);
    if (hook === "afterDestroy") {
      this._notify(descriptors2, chart, "stop");
      this._notify(this._init, chart, "uninstall");
    }
    return result;
  }
  _notify(descriptors2, chart, hook, args) {
    args = args || {};
    for (const descriptor of descriptors2) {
      const plugin2 = descriptor.plugin;
      const method = plugin2[hook];
      const params = [
        chart,
        args,
        descriptor.options
      ];
      if (callback(method, params, plugin2) === false && args.cancelable) {
        return false;
      }
    }
    return true;
  }
  invalidate() {
    if (!isNullOrUndef(this._cache)) {
      this._oldCache = this._cache;
      this._cache = void 0;
    }
  }
  _descriptors(chart) {
    if (this._cache) {
      return this._cache;
    }
    const descriptors2 = this._cache = this._createDescriptors(chart);
    this._notifyStateChanges(chart);
    return descriptors2;
  }
  _createDescriptors(chart, all) {
    const config = chart && chart.config;
    const options = valueOrDefault(config.options && config.options.plugins, {});
    const plugins2 = allPlugins(config);
    return options === false && !all ? [] : createDescriptors(chart, plugins2, options, all);
  }
  _notifyStateChanges(chart) {
    const previousDescriptors = this._oldCache || [];
    const descriptors2 = this._cache;
    const diff = /* @__PURE__ */ __name((a, b) => a.filter((x) => !b.some((y) => x.plugin.id === y.plugin.id)), "diff");
    this._notify(diff(previousDescriptors, descriptors2), chart, "stop");
    this._notify(diff(descriptors2, previousDescriptors), chart, "start");
  }
}
function allPlugins(config) {
  const localIds = {};
  const plugins2 = [];
  const keys = Object.keys(registry.plugins.items);
  for (let i = 0; i < keys.length; i++) {
    plugins2.push(registry.getPlugin(keys[i]));
  }
  const local = config.plugins || [];
  for (let i = 0; i < local.length; i++) {
    const plugin2 = local[i];
    if (plugins2.indexOf(plugin2) === -1) {
      plugins2.push(plugin2);
      localIds[plugin2.id] = true;
    }
  }
  return {
    plugins: plugins2,
    localIds
  };
}
__name(allPlugins, "allPlugins");
function getOpts(options, all) {
  if (!all && options === false) {
    return null;
  }
  if (options === true) {
    return {};
  }
  return options;
}
__name(getOpts, "getOpts");
function createDescriptors(chart, { plugins: plugins2, localIds }, options, all) {
  const result = [];
  const context = chart.getContext();
  for (const plugin2 of plugins2) {
    const id = plugin2.id;
    const opts = getOpts(options[id], all);
    if (opts === null) {
      continue;
    }
    result.push({
      plugin: plugin2,
      options: pluginOpts(chart.config, {
        plugin: plugin2,
        local: localIds[id]
      }, opts, context)
    });
  }
  return result;
}
__name(createDescriptors, "createDescriptors");
function pluginOpts(config, { plugin: plugin2, local }, opts, context) {
  const keys = config.pluginScopeKeys(plugin2);
  const scopes = config.getOptionScopes(opts, keys);
  if (local && plugin2.defaults) {
    scopes.push(plugin2.defaults);
  }
  return config.createResolver(scopes, context, [
    ""
  ], {
    scriptable: false,
    indexable: false,
    allKeys: true
  });
}
__name(pluginOpts, "pluginOpts");
function getIndexAxis(type, options) {
  const datasetDefaults = defaults$1.datasets[type] || {};
  const datasetOptions = (options.datasets || {})[type] || {};
  return datasetOptions.indexAxis || options.indexAxis || datasetDefaults.indexAxis || "x";
}
__name(getIndexAxis, "getIndexAxis");
function getAxisFromDefaultScaleID(id, indexAxis) {
  let axis = id;
  if (id === "_index_") {
    axis = indexAxis;
  } else if (id === "_value_") {
    axis = indexAxis === "x" ? "y" : "x";
  }
  return axis;
}
__name(getAxisFromDefaultScaleID, "getAxisFromDefaultScaleID");
function getDefaultScaleIDFromAxis(axis, indexAxis) {
  return axis === indexAxis ? "_index_" : "_value_";
}
__name(getDefaultScaleIDFromAxis, "getDefaultScaleIDFromAxis");
function idMatchesAxis(id) {
  if (id === "x" || id === "y" || id === "r") {
    return id;
  }
}
__name(idMatchesAxis, "idMatchesAxis");
function axisFromPosition(position) {
  if (position === "top" || position === "bottom") {
    return "x";
  }
  if (position === "left" || position === "right") {
    return "y";
  }
}
__name(axisFromPosition, "axisFromPosition");
function determineAxis(id, ...scaleOptions) {
  if (idMatchesAxis(id)) {
    return id;
  }
  for (const opts of scaleOptions) {
    const axis = opts.axis || axisFromPosition(opts.position) || id.length > 1 && idMatchesAxis(id[0].toLowerCase());
    if (axis) {
      return axis;
    }
  }
  throw new Error(`Cannot determine type of '${id}' axis. Please provide 'axis' or 'position' option.`);
}
__name(determineAxis, "determineAxis");
function getAxisFromDataset(id, axis, dataset) {
  if (dataset[axis + "AxisID"] === id) {
    return {
      axis
    };
  }
}
__name(getAxisFromDataset, "getAxisFromDataset");
function retrieveAxisFromDatasets(id, config) {
  if (config.data && config.data.datasets) {
    const boundDs = config.data.datasets.filter((d) => d.xAxisID === id || d.yAxisID === id);
    if (boundDs.length) {
      return getAxisFromDataset(id, "x", boundDs[0]) || getAxisFromDataset(id, "y", boundDs[0]);
    }
  }
  return {};
}
__name(retrieveAxisFromDatasets, "retrieveAxisFromDatasets");
function mergeScaleConfig(config, options) {
  const chartDefaults = overrides[config.type] || {
    scales: {}
  };
  const configScales = options.scales || {};
  const chartIndexAxis = getIndexAxis(config.type, options);
  const scales2 = /* @__PURE__ */ Object.create(null);
  Object.keys(configScales).forEach((id) => {
    const scaleConf = configScales[id];
    if (!isObject(scaleConf)) {
      return console.error(`Invalid scale configuration for scale: ${id}`);
    }
    if (scaleConf._proxy) {
      return console.warn(`Ignoring resolver passed as options for scale: ${id}`);
    }
    const axis = determineAxis(id, scaleConf, retrieveAxisFromDatasets(id, config), defaults$1.scales[scaleConf.type]);
    const defaultId = getDefaultScaleIDFromAxis(axis, chartIndexAxis);
    const defaultScaleOptions = chartDefaults.scales || {};
    scales2[id] = mergeIf(/* @__PURE__ */ Object.create(null), [
      {
        axis
      },
      scaleConf,
      defaultScaleOptions[axis],
      defaultScaleOptions[defaultId]
    ]);
  });
  config.data.datasets.forEach((dataset) => {
    const type = dataset.type || config.type;
    const indexAxis = dataset.indexAxis || getIndexAxis(type, options);
    const datasetDefaults = overrides[type] || {};
    const defaultScaleOptions = datasetDefaults.scales || {};
    Object.keys(defaultScaleOptions).forEach((defaultID) => {
      const axis = getAxisFromDefaultScaleID(defaultID, indexAxis);
      const id = dataset[axis + "AxisID"] || axis;
      scales2[id] = scales2[id] || /* @__PURE__ */ Object.create(null);
      mergeIf(scales2[id], [
        {
          axis
        },
        configScales[id],
        defaultScaleOptions[defaultID]
      ]);
    });
  });
  Object.keys(scales2).forEach((key) => {
    const scale = scales2[key];
    mergeIf(scale, [
      defaults$1.scales[scale.type],
      defaults$1.scale
    ]);
  });
  return scales2;
}
__name(mergeScaleConfig, "mergeScaleConfig");
function initOptions(config) {
  const options = config.options || (config.options = {});
  options.plugins = valueOrDefault(options.plugins, {});
  options.scales = mergeScaleConfig(config, options);
}
__name(initOptions, "initOptions");
function initData(data) {
  data = data || {};
  data.datasets = data.datasets || [];
  data.labels = data.labels || [];
  return data;
}
__name(initData, "initData");
function initConfig(config) {
  config = config || {};
  config.data = initData(config.data);
  initOptions(config);
  return config;
}
__name(initConfig, "initConfig");
const keyCache = /* @__PURE__ */ new Map();
const keysCached = /* @__PURE__ */ new Set();
function cachedKeys(cacheKey, generate) {
  let keys = keyCache.get(cacheKey);
  if (!keys) {
    keys = generate();
    keyCache.set(cacheKey, keys);
    keysCached.add(keys);
  }
  return keys;
}
__name(cachedKeys, "cachedKeys");
const addIfFound = /* @__PURE__ */ __name((set2, obj, key) => {
  const opts = resolveObjectKey(obj, key);
  if (opts !== void 0) {
    set2.add(opts);
  }
}, "addIfFound");
class Config {
  static {
    __name(this, "Config");
  }
  constructor(config) {
    this._config = initConfig(config);
    this._scopeCache = /* @__PURE__ */ new Map();
    this._resolverCache = /* @__PURE__ */ new Map();
  }
  get platform() {
    return this._config.platform;
  }
  get type() {
    return this._config.type;
  }
  set type(type) {
    this._config.type = type;
  }
  get data() {
    return this._config.data;
  }
  set data(data) {
    this._config.data = initData(data);
  }
  get options() {
    return this._config.options;
  }
  set options(options) {
    this._config.options = options;
  }
  get plugins() {
    return this._config.plugins;
  }
  update() {
    const config = this._config;
    this.clearCache();
    initOptions(config);
  }
  clearCache() {
    this._scopeCache.clear();
    this._resolverCache.clear();
  }
  datasetScopeKeys(datasetType) {
    return cachedKeys(datasetType, () => [
      [
        `datasets.${datasetType}`,
        ""
      ]
    ]);
  }
  datasetAnimationScopeKeys(datasetType, transition) {
    return cachedKeys(`${datasetType}.transition.${transition}`, () => [
      [
        `datasets.${datasetType}.transitions.${transition}`,
        `transitions.${transition}`
      ],
      [
        `datasets.${datasetType}`,
        ""
      ]
    ]);
  }
  datasetElementScopeKeys(datasetType, elementType) {
    return cachedKeys(`${datasetType}-${elementType}`, () => [
      [
        `datasets.${datasetType}.elements.${elementType}`,
        `datasets.${datasetType}`,
        `elements.${elementType}`,
        ""
      ]
    ]);
  }
  pluginScopeKeys(plugin2) {
    const id = plugin2.id;
    const type = this.type;
    return cachedKeys(`${type}-plugin-${id}`, () => [
      [
        `plugins.${id}`,
        ...plugin2.additionalOptionScopes || []
      ]
    ]);
  }
  _cachedScopes(mainScope, resetCache) {
    const _scopeCache = this._scopeCache;
    let cache = _scopeCache.get(mainScope);
    if (!cache || resetCache) {
      cache = /* @__PURE__ */ new Map();
      _scopeCache.set(mainScope, cache);
    }
    return cache;
  }
  getOptionScopes(mainScope, keyLists, resetCache) {
    const { options, type } = this;
    const cache = this._cachedScopes(mainScope, resetCache);
    const cached = cache.get(keyLists);
    if (cached) {
      return cached;
    }
    const scopes = /* @__PURE__ */ new Set();
    keyLists.forEach((keys) => {
      if (mainScope) {
        scopes.add(mainScope);
        keys.forEach((key) => addIfFound(scopes, mainScope, key));
      }
      keys.forEach((key) => addIfFound(scopes, options, key));
      keys.forEach((key) => addIfFound(scopes, overrides[type] || {}, key));
      keys.forEach((key) => addIfFound(scopes, defaults$1, key));
      keys.forEach((key) => addIfFound(scopes, descriptors, key));
    });
    const array = Array.from(scopes);
    if (array.length === 0) {
      array.push(/* @__PURE__ */ Object.create(null));
    }
    if (keysCached.has(keyLists)) {
      cache.set(keyLists, array);
    }
    return array;
  }
  chartOptionScopes() {
    const { options, type } = this;
    return [
      options,
      overrides[type] || {},
      defaults$1.datasets[type] || {},
      {
        type
      },
      defaults$1,
      descriptors
    ];
  }
  resolveNamedOptions(scopes, names2, context, prefixes = [
    ""
  ]) {
    const result = {
      $shared: true
    };
    const { resolver, subPrefixes } = getResolver(this._resolverCache, scopes, prefixes);
    let options = resolver;
    if (needContext(resolver, names2)) {
      result.$shared = false;
      context = isFunction(context) ? context() : context;
      const subResolver = this.createResolver(scopes, context, subPrefixes);
      options = _attachContext(resolver, context, subResolver);
    }
    for (const prop of names2) {
      result[prop] = options[prop];
    }
    return result;
  }
  createResolver(scopes, context, prefixes = [
    ""
  ], descriptorDefaults) {
    const { resolver } = getResolver(this._resolverCache, scopes, prefixes);
    return isObject(context) ? _attachContext(resolver, context, void 0, descriptorDefaults) : resolver;
  }
}
function getResolver(resolverCache, scopes, prefixes) {
  let cache = resolverCache.get(scopes);
  if (!cache) {
    cache = /* @__PURE__ */ new Map();
    resolverCache.set(scopes, cache);
  }
  const cacheKey = prefixes.join();
  let cached = cache.get(cacheKey);
  if (!cached) {
    const resolver = _createResolver(scopes, prefixes);
    cached = {
      resolver,
      subPrefixes: prefixes.filter((p) => !p.toLowerCase().includes("hover"))
    };
    cache.set(cacheKey, cached);
  }
  return cached;
}
__name(getResolver, "getResolver");
const hasFunction = /* @__PURE__ */ __name((value) => isObject(value) && Object.getOwnPropertyNames(value).some((key) => isFunction(value[key])), "hasFunction");
function needContext(proxy, names2) {
  const { isScriptable, isIndexable } = _descriptors(proxy);
  for (const prop of names2) {
    const scriptable = isScriptable(prop);
    const indexable = isIndexable(prop);
    const value = (indexable || scriptable) && proxy[prop];
    if (scriptable && (isFunction(value) || hasFunction(value)) || indexable && isArray(value)) {
      return true;
    }
  }
  return false;
}
__name(needContext, "needContext");
var version = "4.4.1";
const KNOWN_POSITIONS = [
  "top",
  "bottom",
  "left",
  "right",
  "chartArea"
];
function positionIsHorizontal(position, axis) {
  return position === "top" || position === "bottom" || KNOWN_POSITIONS.indexOf(position) === -1 && axis === "x";
}
__name(positionIsHorizontal, "positionIsHorizontal");
function compare2Level(l1, l2) {
  return function(a, b) {
    return a[l1] === b[l1] ? a[l2] - b[l2] : a[l1] - b[l1];
  };
}
__name(compare2Level, "compare2Level");
function onAnimationsComplete(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  chart.notifyPlugins("afterRender");
  callback(animationOptions && animationOptions.onComplete, [
    context
  ], chart);
}
__name(onAnimationsComplete, "onAnimationsComplete");
function onAnimationProgress(context) {
  const chart = context.chart;
  const animationOptions = chart.options.animation;
  callback(animationOptions && animationOptions.onProgress, [
    context
  ], chart);
}
__name(onAnimationProgress, "onAnimationProgress");
function getCanvas(item) {
  if (_isDomSupported() && typeof item === "string") {
    item = document.getElementById(item);
  } else if (item && item.length) {
    item = item[0];
  }
  if (item && item.canvas) {
    item = item.canvas;
  }
  return item;
}
__name(getCanvas, "getCanvas");
const instances = {};
const getChart = /* @__PURE__ */ __name((key) => {
  const canvas2 = getCanvas(key);
  return Object.values(instances).filter((c) => c.canvas === canvas2).pop();
}, "getChart");
function moveNumericKeys(obj, start, move) {
  const keys = Object.keys(obj);
  for (const key of keys) {
    const intKey = +key;
    if (intKey >= start) {
      const value = obj[key];
      delete obj[key];
      if (move > 0 || intKey > start) {
        obj[intKey + move] = value;
      }
    }
  }
}
__name(moveNumericKeys, "moveNumericKeys");
function determineLastEvent(e, lastEvent, inChartArea, isClick) {
  if (!inChartArea || e.type === "mouseout") {
    return null;
  }
  if (isClick) {
    return lastEvent;
  }
  return e;
}
__name(determineLastEvent, "determineLastEvent");
function getSizeForArea(scale, chartArea, field) {
  return scale.options.clip ? scale[field] : chartArea[field];
}
__name(getSizeForArea, "getSizeForArea");
function getDatasetArea(meta, chartArea) {
  const { xScale, yScale } = meta;
  if (xScale && yScale) {
    return {
      left: getSizeForArea(xScale, chartArea, "left"),
      right: getSizeForArea(xScale, chartArea, "right"),
      top: getSizeForArea(yScale, chartArea, "top"),
      bottom: getSizeForArea(yScale, chartArea, "bottom")
    };
  }
  return chartArea;
}
__name(getDatasetArea, "getDatasetArea");
class Chart {
  static {
    __name(this, "Chart");
  }
  static defaults = defaults$1;
  static instances = instances;
  static overrides = overrides;
  static registry = registry;
  static version = version;
  static getChart = getChart;
  static register(...items) {
    registry.add(...items);
    invalidatePlugins();
  }
  static unregister(...items) {
    registry.remove(...items);
    invalidatePlugins();
  }
  constructor(item, userConfig) {
    const config = this.config = new Config(userConfig);
    const initialCanvas = getCanvas(item);
    const existingChart = getChart(initialCanvas);
    if (existingChart) {
      throw new Error("Canvas is already in use. Chart with ID '" + existingChart.id + "' must be destroyed before the canvas with ID '" + existingChart.canvas.id + "' can be reused.");
    }
    const options = config.createResolver(config.chartOptionScopes(), this.getContext());
    this.platform = new (config.platform || _detectPlatform(initialCanvas))();
    this.platform.updateConfig(config);
    const context = this.platform.acquireContext(initialCanvas, options.aspectRatio);
    const canvas2 = context && context.canvas;
    const height = canvas2 && canvas2.height;
    const width = canvas2 && canvas2.width;
    this.id = uid();
    this.ctx = context;
    this.canvas = canvas2;
    this.width = width;
    this.height = height;
    this._options = options;
    this._aspectRatio = this.aspectRatio;
    this._layers = [];
    this._metasets = [];
    this._stacks = void 0;
    this.boxes = [];
    this.currentDevicePixelRatio = void 0;
    this.chartArea = void 0;
    this._active = [];
    this._lastEvent = void 0;
    this._listeners = {};
    this._responsiveListeners = void 0;
    this._sortedMetasets = [];
    this.scales = {};
    this._plugins = new PluginService();
    this.$proxies = {};
    this._hiddenIndices = {};
    this.attached = false;
    this._animationsDisabled = void 0;
    this.$context = void 0;
    this._doResize = debounce((mode) => this.update(mode), options.resizeDelay || 0);
    this._dataChanges = [];
    instances[this.id] = this;
    if (!context || !canvas2) {
      console.error("Failed to create chart: can't acquire context from the given item");
      return;
    }
    animator.listen(this, "complete", onAnimationsComplete);
    animator.listen(this, "progress", onAnimationProgress);
    this._initialize();
    if (this.attached) {
      this.update();
    }
  }
  get aspectRatio() {
    const { options: { aspectRatio, maintainAspectRatio }, width, height, _aspectRatio } = this;
    if (!isNullOrUndef(aspectRatio)) {
      return aspectRatio;
    }
    if (maintainAspectRatio && _aspectRatio) {
      return _aspectRatio;
    }
    return height ? width / height : null;
  }
  get data() {
    return this.config.data;
  }
  set data(data) {
    this.config.data = data;
  }
  get options() {
    return this._options;
  }
  set options(options) {
    this.config.options = options;
  }
  get registry() {
    return registry;
  }
  _initialize() {
    this.notifyPlugins("beforeInit");
    if (this.options.responsive) {
      this.resize();
    } else {
      retinaScale(this, this.options.devicePixelRatio);
    }
    this.bindEvents();
    this.notifyPlugins("afterInit");
    return this;
  }
  clear() {
    clearCanvas(this.canvas, this.ctx);
    return this;
  }
  stop() {
    animator.stop(this);
    return this;
  }
  resize(width, height) {
    if (!animator.running(this)) {
      this._resize(width, height);
    } else {
      this._resizeBeforeDraw = {
        width,
        height
      };
    }
  }
  _resize(width, height) {
    const options = this.options;
    const canvas2 = this.canvas;
    const aspectRatio = options.maintainAspectRatio && this.aspectRatio;
    const newSize = this.platform.getMaximumSize(canvas2, width, height, aspectRatio);
    const newRatio = options.devicePixelRatio || this.platform.getDevicePixelRatio();
    const mode = this.width ? "resize" : "attach";
    this.width = newSize.width;
    this.height = newSize.height;
    this._aspectRatio = this.aspectRatio;
    if (!retinaScale(this, newRatio, true)) {
      return;
    }
    this.notifyPlugins("resize", {
      size: newSize
    });
    callback(options.onResize, [
      this,
      newSize
    ], this);
    if (this.attached) {
      if (this._doResize(mode)) {
        this.render();
      }
    }
  }
  ensureScalesHaveIDs() {
    const options = this.options;
    const scalesOptions = options.scales || {};
    each(scalesOptions, (axisOptions, axisID) => {
      axisOptions.id = axisID;
    });
  }
  buildOrUpdateScales() {
    const options = this.options;
    const scaleOpts = options.scales;
    const scales2 = this.scales;
    const updated = Object.keys(scales2).reduce((obj, id) => {
      obj[id] = false;
      return obj;
    }, {});
    let items = [];
    if (scaleOpts) {
      items = items.concat(Object.keys(scaleOpts).map((id) => {
        const scaleOptions = scaleOpts[id];
        const axis = determineAxis(id, scaleOptions);
        const isRadial = axis === "r";
        const isHorizontal = axis === "x";
        return {
          options: scaleOptions,
          dposition: isRadial ? "chartArea" : isHorizontal ? "bottom" : "left",
          dtype: isRadial ? "radialLinear" : isHorizontal ? "category" : "linear"
        };
      }));
    }
    each(items, (item) => {
      const scaleOptions = item.options;
      const id = scaleOptions.id;
      const axis = determineAxis(id, scaleOptions);
      const scaleType = valueOrDefault(scaleOptions.type, item.dtype);
      if (scaleOptions.position === void 0 || positionIsHorizontal(scaleOptions.position, axis) !== positionIsHorizontal(item.dposition)) {
        scaleOptions.position = item.dposition;
      }
      updated[id] = true;
      let scale = null;
      if (id in scales2 && scales2[id].type === scaleType) {
        scale = scales2[id];
      } else {
        const scaleClass = registry.getScale(scaleType);
        scale = new scaleClass({
          id,
          type: scaleType,
          ctx: this.ctx,
          chart: this
        });
        scales2[scale.id] = scale;
      }
      scale.init(scaleOptions, options);
    });
    each(updated, (hasUpdated, id) => {
      if (!hasUpdated) {
        delete scales2[id];
      }
    });
    each(scales2, (scale) => {
      layouts.configure(this, scale, scale.options);
      layouts.addBox(this, scale);
    });
  }
  _updateMetasets() {
    const metasets = this._metasets;
    const numData = this.data.datasets.length;
    const numMeta = metasets.length;
    metasets.sort((a, b) => a.index - b.index);
    if (numMeta > numData) {
      for (let i = numData; i < numMeta; ++i) {
        this._destroyDatasetMeta(i);
      }
      metasets.splice(numData, numMeta - numData);
    }
    this._sortedMetasets = metasets.slice(0).sort(compare2Level("order", "index"));
  }
  _removeUnreferencedMetasets() {
    const { _metasets: metasets, data: { datasets } } = this;
    if (metasets.length > datasets.length) {
      delete this._stacks;
    }
    metasets.forEach((meta, index2) => {
      if (datasets.filter((x) => x === meta._dataset).length === 0) {
        this._destroyDatasetMeta(index2);
      }
    });
  }
  buildOrUpdateControllers() {
    const newControllers = [];
    const datasets = this.data.datasets;
    let i, ilen;
    this._removeUnreferencedMetasets();
    for (i = 0, ilen = datasets.length; i < ilen; i++) {
      const dataset = datasets[i];
      let meta = this.getDatasetMeta(i);
      const type = dataset.type || this.config.type;
      if (meta.type && meta.type !== type) {
        this._destroyDatasetMeta(i);
        meta = this.getDatasetMeta(i);
      }
      meta.type = type;
      meta.indexAxis = dataset.indexAxis || getIndexAxis(type, this.options);
      meta.order = dataset.order || 0;
      meta.index = i;
      meta.label = "" + dataset.label;
      meta.visible = this.isDatasetVisible(i);
      if (meta.controller) {
        meta.controller.updateIndex(i);
        meta.controller.linkScales();
      } else {
        const ControllerClass = registry.getController(type);
        const { datasetElementType, dataElementType } = defaults$1.datasets[type];
        Object.assign(ControllerClass, {
          dataElementType: registry.getElement(dataElementType),
          datasetElementType: datasetElementType && registry.getElement(datasetElementType)
        });
        meta.controller = new ControllerClass(this, i);
        newControllers.push(meta.controller);
      }
    }
    this._updateMetasets();
    return newControllers;
  }
  _resetElements() {
    each(this.data.datasets, (dataset, datasetIndex) => {
      this.getDatasetMeta(datasetIndex).controller.reset();
    }, this);
  }
  reset() {
    this._resetElements();
    this.notifyPlugins("reset");
  }
  update(mode) {
    const config = this.config;
    config.update();
    const options = this._options = config.createResolver(config.chartOptionScopes(), this.getContext());
    const animsDisabled = this._animationsDisabled = !options.animation;
    this._updateScales();
    this._checkEventBindings();
    this._updateHiddenIndices();
    this._plugins.invalidate();
    if (this.notifyPlugins("beforeUpdate", {
      mode,
      cancelable: true
    }) === false) {
      return;
    }
    const newControllers = this.buildOrUpdateControllers();
    this.notifyPlugins("beforeElementsUpdate");
    let minPadding = 0;
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; i++) {
      const { controller } = this.getDatasetMeta(i);
      const reset = !animsDisabled && newControllers.indexOf(controller) === -1;
      controller.buildOrUpdateElements(reset);
      minPadding = Math.max(+controller.getMaxOverflow(), minPadding);
    }
    minPadding = this._minPadding = options.layout.autoPadding ? minPadding : 0;
    this._updateLayout(minPadding);
    if (!animsDisabled) {
      each(newControllers, (controller) => {
        controller.reset();
      });
    }
    this._updateDatasets(mode);
    this.notifyPlugins("afterUpdate", {
      mode
    });
    this._layers.sort(compare2Level("z", "_idx"));
    const { _active, _lastEvent } = this;
    if (_lastEvent) {
      this._eventHandler(_lastEvent, true);
    } else if (_active.length) {
      this._updateHoverStyles(_active, _active, true);
    }
    this.render();
  }
  _updateScales() {
    each(this.scales, (scale) => {
      layouts.removeBox(this, scale);
    });
    this.ensureScalesHaveIDs();
    this.buildOrUpdateScales();
  }
  _checkEventBindings() {
    const options = this.options;
    const existingEvents = new Set(Object.keys(this._listeners));
    const newEvents = new Set(options.events);
    if (!setsEqual(existingEvents, newEvents) || !!this._responsiveListeners !== options.responsive) {
      this.unbindEvents();
      this.bindEvents();
    }
  }
  _updateHiddenIndices() {
    const { _hiddenIndices } = this;
    const changes = this._getUniformDataChanges() || [];
    for (const { method, start, count } of changes) {
      const move = method === "_removeElements" ? -count : count;
      moveNumericKeys(_hiddenIndices, start, move);
    }
  }
  _getUniformDataChanges() {
    const _dataChanges = this._dataChanges;
    if (!_dataChanges || !_dataChanges.length) {
      return;
    }
    this._dataChanges = [];
    const datasetCount = this.data.datasets.length;
    const makeSet = /* @__PURE__ */ __name((idx) => new Set(_dataChanges.filter((c) => c[0] === idx).map((c, i) => i + "," + c.splice(1).join(","))), "makeSet");
    const changeSet = makeSet(0);
    for (let i = 1; i < datasetCount; i++) {
      if (!setsEqual(changeSet, makeSet(i))) {
        return;
      }
    }
    return Array.from(changeSet).map((c) => c.split(",")).map((a) => ({
      method: a[1],
      start: +a[2],
      count: +a[3]
    }));
  }
  _updateLayout(minPadding) {
    if (this.notifyPlugins("beforeLayout", {
      cancelable: true
    }) === false) {
      return;
    }
    layouts.update(this, this.width, this.height, minPadding);
    const area = this.chartArea;
    const noArea = area.width <= 0 || area.height <= 0;
    this._layers = [];
    each(this.boxes, (box) => {
      if (noArea && box.position === "chartArea") {
        return;
      }
      if (box.configure) {
        box.configure();
      }
      this._layers.push(...box._layers());
    }, this);
    this._layers.forEach((item, index2) => {
      item._idx = index2;
    });
    this.notifyPlugins("afterLayout");
  }
  _updateDatasets(mode) {
    if (this.notifyPlugins("beforeDatasetsUpdate", {
      mode,
      cancelable: true
    }) === false) {
      return;
    }
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this.getDatasetMeta(i).controller.configure();
    }
    for (let i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._updateDataset(i, isFunction(mode) ? mode({
        datasetIndex: i
      }) : mode);
    }
    this.notifyPlugins("afterDatasetsUpdate", {
      mode
    });
  }
  _updateDataset(index2, mode) {
    const meta = this.getDatasetMeta(index2);
    const args = {
      meta,
      index: index2,
      mode,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetUpdate", args) === false) {
      return;
    }
    meta.controller._update(mode);
    args.cancelable = false;
    this.notifyPlugins("afterDatasetUpdate", args);
  }
  render() {
    if (this.notifyPlugins("beforeRender", {
      cancelable: true
    }) === false) {
      return;
    }
    if (animator.has(this)) {
      if (this.attached && !animator.running(this)) {
        animator.start(this);
      }
    } else {
      this.draw();
      onAnimationsComplete({
        chart: this
      });
    }
  }
  draw() {
    let i;
    if (this._resizeBeforeDraw) {
      const { width, height } = this._resizeBeforeDraw;
      this._resize(width, height);
      this._resizeBeforeDraw = null;
    }
    this.clear();
    if (this.width <= 0 || this.height <= 0) {
      return;
    }
    if (this.notifyPlugins("beforeDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const layers = this._layers;
    for (i = 0; i < layers.length && layers[i].z <= 0; ++i) {
      layers[i].draw(this.chartArea);
    }
    this._drawDatasets();
    for (; i < layers.length; ++i) {
      layers[i].draw(this.chartArea);
    }
    this.notifyPlugins("afterDraw");
  }
  _getSortedDatasetMetas(filterVisible) {
    const metasets = this._sortedMetasets;
    const result = [];
    let i, ilen;
    for (i = 0, ilen = metasets.length; i < ilen; ++i) {
      const meta = metasets[i];
      if (!filterVisible || meta.visible) {
        result.push(meta);
      }
    }
    return result;
  }
  getSortedVisibleDatasetMetas() {
    return this._getSortedDatasetMetas(true);
  }
  _drawDatasets() {
    if (this.notifyPlugins("beforeDatasetsDraw", {
      cancelable: true
    }) === false) {
      return;
    }
    const metasets = this.getSortedVisibleDatasetMetas();
    for (let i = metasets.length - 1; i >= 0; --i) {
      this._drawDataset(metasets[i]);
    }
    this.notifyPlugins("afterDatasetsDraw");
  }
  _drawDataset(meta) {
    const ctx = this.ctx;
    const clip = meta._clip;
    const useClip = !clip.disabled;
    const area = getDatasetArea(meta, this.chartArea);
    const args = {
      meta,
      index: meta.index,
      cancelable: true
    };
    if (this.notifyPlugins("beforeDatasetDraw", args) === false) {
      return;
    }
    if (useClip) {
      clipArea(ctx, {
        left: clip.left === false ? 0 : area.left - clip.left,
        right: clip.right === false ? this.width : area.right + clip.right,
        top: clip.top === false ? 0 : area.top - clip.top,
        bottom: clip.bottom === false ? this.height : area.bottom + clip.bottom
      });
    }
    meta.controller.draw();
    if (useClip) {
      unclipArea(ctx);
    }
    args.cancelable = false;
    this.notifyPlugins("afterDatasetDraw", args);
  }
  isPointInArea(point) {
    return _isPointInArea(point, this.chartArea, this._minPadding);
  }
  getElementsAtEventForMode(e, mode, options, useFinalPosition) {
    const method = Interaction.modes[mode];
    if (typeof method === "function") {
      return method(this, e, options, useFinalPosition);
    }
    return [];
  }
  getDatasetMeta(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    const metasets = this._metasets;
    let meta = metasets.filter((x) => x && x._dataset === dataset).pop();
    if (!meta) {
      meta = {
        type: null,
        data: [],
        dataset: null,
        controller: null,
        hidden: null,
        xAxisID: null,
        yAxisID: null,
        order: dataset && dataset.order || 0,
        index: datasetIndex,
        _dataset: dataset,
        _parsed: [],
        _sorted: false
      };
      metasets.push(meta);
    }
    return meta;
  }
  getContext() {
    return this.$context || (this.$context = createContext(null, {
      chart: this,
      type: "chart"
    }));
  }
  getVisibleDatasetCount() {
    return this.getSortedVisibleDatasetMetas().length;
  }
  isDatasetVisible(datasetIndex) {
    const dataset = this.data.datasets[datasetIndex];
    if (!dataset) {
      return false;
    }
    const meta = this.getDatasetMeta(datasetIndex);
    return typeof meta.hidden === "boolean" ? !meta.hidden : !dataset.hidden;
  }
  setDatasetVisibility(datasetIndex, visible) {
    const meta = this.getDatasetMeta(datasetIndex);
    meta.hidden = !visible;
  }
  toggleDataVisibility(index2) {
    this._hiddenIndices[index2] = !this._hiddenIndices[index2];
  }
  getDataVisibility(index2) {
    return !this._hiddenIndices[index2];
  }
  _updateVisibility(datasetIndex, dataIndex, visible) {
    const mode = visible ? "show" : "hide";
    const meta = this.getDatasetMeta(datasetIndex);
    const anims = meta.controller._resolveAnimations(void 0, mode);
    if (defined(dataIndex)) {
      meta.data[dataIndex].hidden = !visible;
      this.update();
    } else {
      this.setDatasetVisibility(datasetIndex, visible);
      anims.update(meta, {
        visible
      });
      this.update((ctx) => ctx.datasetIndex === datasetIndex ? mode : void 0);
    }
  }
  hide(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, false);
  }
  show(datasetIndex, dataIndex) {
    this._updateVisibility(datasetIndex, dataIndex, true);
  }
  _destroyDatasetMeta(datasetIndex) {
    const meta = this._metasets[datasetIndex];
    if (meta && meta.controller) {
      meta.controller._destroy();
    }
    delete this._metasets[datasetIndex];
  }
  _stop() {
    let i, ilen;
    this.stop();
    animator.remove(this);
    for (i = 0, ilen = this.data.datasets.length; i < ilen; ++i) {
      this._destroyDatasetMeta(i);
    }
  }
  destroy() {
    this.notifyPlugins("beforeDestroy");
    const { canvas: canvas2, ctx } = this;
    this._stop();
    this.config.clearCache();
    if (canvas2) {
      this.unbindEvents();
      clearCanvas(canvas2, ctx);
      this.platform.releaseContext(ctx);
      this.canvas = null;
      this.ctx = null;
    }
    delete instances[this.id];
    this.notifyPlugins("afterDestroy");
  }
  toBase64Image(...args) {
    return this.canvas.toDataURL(...args);
  }
  bindEvents() {
    this.bindUserEvents();
    if (this.options.responsive) {
      this.bindResponsiveEvents();
    } else {
      this.attached = true;
    }
  }
  bindUserEvents() {
    const listeners = this._listeners;
    const platform = this.platform;
    const _add = /* @__PURE__ */ __name((type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    }, "_add");
    const listener = /* @__PURE__ */ __name((e, x, y) => {
      e.offsetX = x;
      e.offsetY = y;
      this._eventHandler(e);
    }, "listener");
    each(this.options.events, (type) => _add(type, listener));
  }
  bindResponsiveEvents() {
    if (!this._responsiveListeners) {
      this._responsiveListeners = {};
    }
    const listeners = this._responsiveListeners;
    const platform = this.platform;
    const _add = /* @__PURE__ */ __name((type, listener2) => {
      platform.addEventListener(this, type, listener2);
      listeners[type] = listener2;
    }, "_add");
    const _remove = /* @__PURE__ */ __name((type, listener2) => {
      if (listeners[type]) {
        platform.removeEventListener(this, type, listener2);
        delete listeners[type];
      }
    }, "_remove");
    const listener = /* @__PURE__ */ __name((width, height) => {
      if (this.canvas) {
        this.resize(width, height);
      }
    }, "listener");
    let detached;
    const attached = /* @__PURE__ */ __name(() => {
      _remove("attach", attached);
      this.attached = true;
      this.resize();
      _add("resize", listener);
      _add("detach", detached);
    }, "attached");
    detached = /* @__PURE__ */ __name(() => {
      this.attached = false;
      _remove("resize", listener);
      this._stop();
      this._resize(0, 0);
      _add("attach", attached);
    }, "detached");
    if (platform.isAttached(this.canvas)) {
      attached();
    } else {
      detached();
    }
  }
  unbindEvents() {
    each(this._listeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._listeners = {};
    each(this._responsiveListeners, (listener, type) => {
      this.platform.removeEventListener(this, type, listener);
    });
    this._responsiveListeners = void 0;
  }
  updateHoverStyle(items, mode, enabled) {
    const prefix = enabled ? "set" : "remove";
    let meta, item, i, ilen;
    if (mode === "dataset") {
      meta = this.getDatasetMeta(items[0].datasetIndex);
      meta.controller["_" + prefix + "DatasetHoverStyle"]();
    }
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      item = items[i];
      const controller = item && this.getDatasetMeta(item.datasetIndex).controller;
      if (controller) {
        controller[prefix + "HoverStyle"](item.element, item.datasetIndex, item.index);
      }
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements) {
    const lastActive = this._active || [];
    const active = activeElements.map(({ datasetIndex, index: index2 }) => {
      const meta = this.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("No dataset found at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index2],
        index: index2
      };
    });
    const changed = !_elementsEqual(active, lastActive);
    if (changed) {
      this._active = active;
      this._lastEvent = null;
      this._updateHoverStyles(active, lastActive);
    }
  }
  notifyPlugins(hook, args, filter) {
    return this._plugins.notify(this, hook, args, filter);
  }
  isPluginEnabled(pluginId) {
    return this._plugins._cache.filter((p) => p.plugin.id === pluginId).length === 1;
  }
  _updateHoverStyles(active, lastActive, replay) {
    const hoverOptions = this.options.hover;
    const diff = /* @__PURE__ */ __name((a, b) => a.filter((x) => !b.some((y) => x.datasetIndex === y.datasetIndex && x.index === y.index)), "diff");
    const deactivated = diff(lastActive, active);
    const activated = replay ? active : diff(active, lastActive);
    if (deactivated.length) {
      this.updateHoverStyle(deactivated, hoverOptions.mode, false);
    }
    if (activated.length && hoverOptions.mode) {
      this.updateHoverStyle(activated, hoverOptions.mode, true);
    }
  }
  _eventHandler(e, replay) {
    const args = {
      event: e,
      replay,
      cancelable: true,
      inChartArea: this.isPointInArea(e)
    };
    const eventFilter = /* @__PURE__ */ __name((plugin2) => (plugin2.options.events || this.options.events).includes(e.native.type), "eventFilter");
    if (this.notifyPlugins("beforeEvent", args, eventFilter) === false) {
      return;
    }
    const changed = this._handleEvent(e, replay, args.inChartArea);
    args.cancelable = false;
    this.notifyPlugins("afterEvent", args, eventFilter);
    if (changed || args.changed) {
      this.render();
    }
    return this;
  }
  _handleEvent(e, replay, inChartArea) {
    const { _active: lastActive = [], options } = this;
    const useFinalPosition = replay;
    const active = this._getActiveElements(e, lastActive, inChartArea, useFinalPosition);
    const isClick = _isClickEvent(e);
    const lastEvent = determineLastEvent(e, this._lastEvent, inChartArea, isClick);
    if (inChartArea) {
      this._lastEvent = null;
      callback(options.onHover, [
        e,
        active,
        this
      ], this);
      if (isClick) {
        callback(options.onClick, [
          e,
          active,
          this
        ], this);
      }
    }
    const changed = !_elementsEqual(active, lastActive);
    if (changed || replay) {
      this._active = active;
      this._updateHoverStyles(active, lastActive, replay);
    }
    this._lastEvent = lastEvent;
    return changed;
  }
  _getActiveElements(e, lastActive, inChartArea, useFinalPosition) {
    if (e.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive;
    }
    const hoverOptions = this.options.hover;
    return this.getElementsAtEventForMode(e, hoverOptions.mode, hoverOptions, useFinalPosition);
  }
}
function invalidatePlugins() {
  return each(Chart.instances, (chart) => chart._plugins.invalidate());
}
__name(invalidatePlugins, "invalidatePlugins");
function clipArc(ctx, element, endAngle) {
  const { startAngle, pixelMargin, x, y, outerRadius, innerRadius } = element;
  let angleMargin = pixelMargin / outerRadius;
  ctx.beginPath();
  ctx.arc(x, y, outerRadius, startAngle - angleMargin, endAngle + angleMargin);
  if (innerRadius > pixelMargin) {
    angleMargin = pixelMargin / innerRadius;
    ctx.arc(x, y, innerRadius, endAngle + angleMargin, startAngle - angleMargin, true);
  } else {
    ctx.arc(x, y, pixelMargin, endAngle + HALF_PI, startAngle - HALF_PI);
  }
  ctx.closePath();
  ctx.clip();
}
__name(clipArc, "clipArc");
function toRadiusCorners(value) {
  return _readValueToProps(value, [
    "outerStart",
    "outerEnd",
    "innerStart",
    "innerEnd"
  ]);
}
__name(toRadiusCorners, "toRadiusCorners");
function parseBorderRadius$1(arc, innerRadius, outerRadius, angleDelta) {
  const o = toRadiusCorners(arc.options.borderRadius);
  const halfThickness = (outerRadius - innerRadius) / 2;
  const innerLimit = Math.min(halfThickness, angleDelta * innerRadius / 2);
  const computeOuterLimit = /* @__PURE__ */ __name((val) => {
    const outerArcLimit = (outerRadius - Math.min(halfThickness, val)) * angleDelta / 2;
    return _limitValue(val, 0, Math.min(halfThickness, outerArcLimit));
  }, "computeOuterLimit");
  return {
    outerStart: computeOuterLimit(o.outerStart),
    outerEnd: computeOuterLimit(o.outerEnd),
    innerStart: _limitValue(o.innerStart, 0, innerLimit),
    innerEnd: _limitValue(o.innerEnd, 0, innerLimit)
  };
}
__name(parseBorderRadius$1, "parseBorderRadius$1");
function rThetaToXY(r, theta, x, y) {
  return {
    x: x + r * Math.cos(theta),
    y: y + r * Math.sin(theta)
  };
}
__name(rThetaToXY, "rThetaToXY");
function pathArc(ctx, element, offset, spacing, end, circular) {
  const { x, y, startAngle: start, pixelMargin, innerRadius: innerR } = element;
  const outerRadius = Math.max(element.outerRadius + spacing + offset - pixelMargin, 0);
  const innerRadius = innerR > 0 ? innerR + spacing + offset + pixelMargin : 0;
  let spacingOffset = 0;
  const alpha2 = end - start;
  if (spacing) {
    const noSpacingInnerRadius = innerR > 0 ? innerR - spacing : 0;
    const noSpacingOuterRadius = outerRadius > 0 ? outerRadius - spacing : 0;
    const avNogSpacingRadius = (noSpacingInnerRadius + noSpacingOuterRadius) / 2;
    const adjustedAngle = avNogSpacingRadius !== 0 ? alpha2 * avNogSpacingRadius / (avNogSpacingRadius + spacing) : alpha2;
    spacingOffset = (alpha2 - adjustedAngle) / 2;
  }
  const beta = Math.max(1e-3, alpha2 * outerRadius - offset / PI) / outerRadius;
  const angleOffset = (alpha2 - beta) / 2;
  const startAngle = start + angleOffset + spacingOffset;
  const endAngle = end - angleOffset - spacingOffset;
  const { outerStart, outerEnd, innerStart, innerEnd } = parseBorderRadius$1(element, innerRadius, outerRadius, endAngle - startAngle);
  const outerStartAdjustedRadius = outerRadius - outerStart;
  const outerEndAdjustedRadius = outerRadius - outerEnd;
  const outerStartAdjustedAngle = startAngle + outerStart / outerStartAdjustedRadius;
  const outerEndAdjustedAngle = endAngle - outerEnd / outerEndAdjustedRadius;
  const innerStartAdjustedRadius = innerRadius + innerStart;
  const innerEndAdjustedRadius = innerRadius + innerEnd;
  const innerStartAdjustedAngle = startAngle + innerStart / innerStartAdjustedRadius;
  const innerEndAdjustedAngle = endAngle - innerEnd / innerEndAdjustedRadius;
  ctx.beginPath();
  if (circular) {
    const outerMidAdjustedAngle = (outerStartAdjustedAngle + outerEndAdjustedAngle) / 2;
    ctx.arc(x, y, outerRadius, outerStartAdjustedAngle, outerMidAdjustedAngle);
    ctx.arc(x, y, outerRadius, outerMidAdjustedAngle, outerEndAdjustedAngle);
    if (outerEnd > 0) {
      const pCenter = rThetaToXY(outerEndAdjustedRadius, outerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerEnd, outerEndAdjustedAngle, endAngle + HALF_PI);
    }
    const p4 = rThetaToXY(innerEndAdjustedRadius, endAngle, x, y);
    ctx.lineTo(p4.x, p4.y);
    if (innerEnd > 0) {
      const pCenter = rThetaToXY(innerEndAdjustedRadius, innerEndAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, innerEnd, endAngle + HALF_PI, innerEndAdjustedAngle + Math.PI);
    }
    const innerMidAdjustedAngle = (endAngle - innerEnd / innerRadius + (startAngle + innerStart / innerRadius)) / 2;
    ctx.arc(x, y, innerRadius, endAngle - innerEnd / innerRadius, innerMidAdjustedAngle, true);
    ctx.arc(x, y, innerRadius, innerMidAdjustedAngle, startAngle + innerStart / innerRadius, true);
    if (innerStart > 0) {
      const pCenter = rThetaToXY(innerStartAdjustedRadius, innerStartAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, innerStart, innerStartAdjustedAngle + Math.PI, startAngle - HALF_PI);
    }
    const p8 = rThetaToXY(outerStartAdjustedRadius, startAngle, x, y);
    ctx.lineTo(p8.x, p8.y);
    if (outerStart > 0) {
      const pCenter = rThetaToXY(outerStartAdjustedRadius, outerStartAdjustedAngle, x, y);
      ctx.arc(pCenter.x, pCenter.y, outerStart, startAngle - HALF_PI, outerStartAdjustedAngle);
    }
  } else {
    ctx.moveTo(x, y);
    const outerStartX = Math.cos(outerStartAdjustedAngle) * outerRadius + x;
    const outerStartY = Math.sin(outerStartAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerStartX, outerStartY);
    const outerEndX = Math.cos(outerEndAdjustedAngle) * outerRadius + x;
    const outerEndY = Math.sin(outerEndAdjustedAngle) * outerRadius + y;
    ctx.lineTo(outerEndX, outerEndY);
  }
  ctx.closePath();
}
__name(pathArc, "pathArc");
function drawArc(ctx, element, offset, spacing, circular) {
  const { fullCircles, startAngle, circumference } = element;
  let endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (let i = 0; i < fullCircles; ++i) {
      ctx.fill();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % TAU || TAU);
    }
  }
  pathArc(ctx, element, offset, spacing, endAngle, circular);
  ctx.fill();
  return endAngle;
}
__name(drawArc, "drawArc");
function drawBorder(ctx, element, offset, spacing, circular) {
  const { fullCircles, startAngle, circumference, options } = element;
  const { borderWidth, borderJoinStyle, borderDash, borderDashOffset } = options;
  const inner = options.borderAlign === "inner";
  if (!borderWidth) {
    return;
  }
  ctx.setLineDash(borderDash || []);
  ctx.lineDashOffset = borderDashOffset;
  if (inner) {
    ctx.lineWidth = borderWidth * 2;
    ctx.lineJoin = borderJoinStyle || "round";
  } else {
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = borderJoinStyle || "bevel";
  }
  let endAngle = element.endAngle;
  if (fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    for (let i = 0; i < fullCircles; ++i) {
      ctx.stroke();
    }
    if (!isNaN(circumference)) {
      endAngle = startAngle + (circumference % TAU || TAU);
    }
  }
  if (inner) {
    clipArc(ctx, element, endAngle);
  }
  if (!fullCircles) {
    pathArc(ctx, element, offset, spacing, endAngle, circular);
    ctx.stroke();
  }
}
__name(drawBorder, "drawBorder");
class ArcElement extends Element {
  static {
    __name(this, "ArcElement");
  }
  static id = "arc";
  static defaults = {
    borderAlign: "center",
    borderColor: "#fff",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: void 0,
    borderRadius: 0,
    borderWidth: 2,
    offset: 0,
    spacing: 0,
    angle: void 0,
    circular: true
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== "borderDash"
  };
  circumference;
  endAngle;
  fullCircles;
  innerRadius;
  outerRadius;
  pixelMargin;
  startAngle;
  constructor(cfg) {
    super();
    this.options = void 0;
    this.circumference = void 0;
    this.startAngle = void 0;
    this.endAngle = void 0;
    this.innerRadius = void 0;
    this.outerRadius = void 0;
    this.pixelMargin = 0;
    this.fullCircles = 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(chartX, chartY, useFinalPosition) {
    const point = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    const { angle, distance } = getAngleFromPoint(point, {
      x: chartX,
      y: chartY
    });
    const { startAngle, endAngle, innerRadius, outerRadius, circumference } = this.getProps([
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius",
      "circumference"
    ], useFinalPosition);
    const rAdjust = (this.options.spacing + this.options.borderWidth) / 2;
    const _circumference = valueOrDefault(circumference, endAngle - startAngle);
    const betweenAngles = _circumference >= TAU || _angleBetween(angle, startAngle, endAngle);
    const withinRadius = _isBetween(distance, innerRadius + rAdjust, outerRadius + rAdjust);
    return betweenAngles && withinRadius;
  }
  getCenterPoint(useFinalPosition) {
    const { x, y, startAngle, endAngle, innerRadius, outerRadius } = this.getProps([
      "x",
      "y",
      "startAngle",
      "endAngle",
      "innerRadius",
      "outerRadius"
    ], useFinalPosition);
    const { offset, spacing } = this.options;
    const halfAngle = (startAngle + endAngle) / 2;
    const halfRadius = (innerRadius + outerRadius + spacing + offset) / 2;
    return {
      x: x + Math.cos(halfAngle) * halfRadius,
      y: y + Math.sin(halfAngle) * halfRadius
    };
  }
  tooltipPosition(useFinalPosition) {
    return this.getCenterPoint(useFinalPosition);
  }
  draw(ctx) {
    const { options, circumference } = this;
    const offset = (options.offset || 0) / 4;
    const spacing = (options.spacing || 0) / 2;
    const circular = options.circular;
    this.pixelMargin = options.borderAlign === "inner" ? 0.33 : 0;
    this.fullCircles = circumference > TAU ? Math.floor(circumference / TAU) : 0;
    if (circumference === 0 || this.innerRadius < 0 || this.outerRadius < 0) {
      return;
    }
    ctx.save();
    const halfAngle = (this.startAngle + this.endAngle) / 2;
    ctx.translate(Math.cos(halfAngle) * offset, Math.sin(halfAngle) * offset);
    const fix = 1 - Math.sin(Math.min(PI, circumference || 0));
    const radiusOffset = offset * fix;
    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;
    drawArc(ctx, this, radiusOffset, spacing, circular);
    drawBorder(ctx, this, radiusOffset, spacing, circular);
    ctx.restore();
  }
}
function setStyle(ctx, options, style = options) {
  ctx.lineCap = valueOrDefault(style.borderCapStyle, options.borderCapStyle);
  ctx.setLineDash(valueOrDefault(style.borderDash, options.borderDash));
  ctx.lineDashOffset = valueOrDefault(style.borderDashOffset, options.borderDashOffset);
  ctx.lineJoin = valueOrDefault(style.borderJoinStyle, options.borderJoinStyle);
  ctx.lineWidth = valueOrDefault(style.borderWidth, options.borderWidth);
  ctx.strokeStyle = valueOrDefault(style.borderColor, options.borderColor);
}
__name(setStyle, "setStyle");
function lineTo(ctx, previous, target) {
  ctx.lineTo(target.x, target.y);
}
__name(lineTo, "lineTo");
function getLineMethod(options) {
  if (options.stepped) {
    return _steppedLineTo;
  }
  if (options.tension || options.cubicInterpolationMode === "monotone") {
    return _bezierCurveTo;
  }
  return lineTo;
}
__name(getLineMethod, "getLineMethod");
function pathVars(points, segment, params = {}) {
  const count = points.length;
  const { start: paramsStart = 0, end: paramsEnd = count - 1 } = params;
  const { start: segmentStart, end: segmentEnd } = segment;
  const start = Math.max(paramsStart, segmentStart);
  const end = Math.min(paramsEnd, segmentEnd);
  const outside = paramsStart < segmentStart && paramsEnd < segmentStart || paramsStart > segmentEnd && paramsEnd > segmentEnd;
  return {
    count,
    start,
    loop: segment.loop,
    ilen: end < start && !outside ? count + end - start : end - start
  };
}
__name(pathVars, "pathVars");
function pathSegment(ctx, line, segment, params) {
  const { points, options } = line;
  const { count, start, loop, ilen } = pathVars(points, segment, params);
  const lineMethod = getLineMethod(options);
  let { move = true, reverse } = params || {};
  let i, point, prev;
  for (i = 0; i <= ilen; ++i) {
    point = points[(start + (reverse ? ilen - i : i)) % count];
    if (point.skip) {
      continue;
    } else if (move) {
      ctx.moveTo(point.x, point.y);
      move = false;
    } else {
      lineMethod(ctx, prev, point, reverse, options.stepped);
    }
    prev = point;
  }
  if (loop) {
    point = points[(start + (reverse ? ilen : 0)) % count];
    lineMethod(ctx, prev, point, reverse, options.stepped);
  }
  return !!loop;
}
__name(pathSegment, "pathSegment");
function fastPathSegment(ctx, line, segment, params) {
  const points = line.points;
  const { count, start, ilen } = pathVars(points, segment, params);
  const { move = true, reverse } = params || {};
  let avgX = 0;
  let countX = 0;
  let i, point, prevX, minY, maxY, lastY;
  const pointIndex = /* @__PURE__ */ __name((index2) => (start + (reverse ? ilen - index2 : index2)) % count, "pointIndex");
  const drawX = /* @__PURE__ */ __name(() => {
    if (minY !== maxY) {
      ctx.lineTo(avgX, maxY);
      ctx.lineTo(avgX, minY);
      ctx.lineTo(avgX, lastY);
    }
  }, "drawX");
  if (move) {
    point = points[pointIndex(0)];
    ctx.moveTo(point.x, point.y);
  }
  for (i = 0; i <= ilen; ++i) {
    point = points[pointIndex(i)];
    if (point.skip) {
      continue;
    }
    const x = point.x;
    const y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
      avgX = (countX * avgX + x) / ++countX;
    } else {
      drawX();
      ctx.lineTo(x, y);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
    }
    lastY = y;
  }
  drawX();
}
__name(fastPathSegment, "fastPathSegment");
function _getSegmentMethod(line) {
  const opts = line.options;
  const borderDash = opts.borderDash && opts.borderDash.length;
  const useFastPath = !line._decimated && !line._loop && !opts.tension && opts.cubicInterpolationMode !== "monotone" && !opts.stepped && !borderDash;
  return useFastPath ? fastPathSegment : pathSegment;
}
__name(_getSegmentMethod, "_getSegmentMethod");
function _getInterpolationMethod(options) {
  if (options.stepped) {
    return _steppedInterpolation;
  }
  if (options.tension || options.cubicInterpolationMode === "monotone") {
    return _bezierInterpolation;
  }
  return _pointInLine;
}
__name(_getInterpolationMethod, "_getInterpolationMethod");
function strokePathWithCache(ctx, line, start, count) {
  let path = line._path;
  if (!path) {
    path = line._path = new Path2D();
    if (line.path(path, start, count)) {
      path.closePath();
    }
  }
  setStyle(ctx, line.options);
  ctx.stroke(path);
}
__name(strokePathWithCache, "strokePathWithCache");
function strokePathDirect(ctx, line, start, count) {
  const { segments, options } = line;
  const segmentMethod = _getSegmentMethod(line);
  for (const segment of segments) {
    setStyle(ctx, options, segment.style);
    ctx.beginPath();
    if (segmentMethod(ctx, line, segment, {
      start,
      end: start + count - 1
    })) {
      ctx.closePath();
    }
    ctx.stroke();
  }
}
__name(strokePathDirect, "strokePathDirect");
const usePath2D = typeof Path2D === "function";
function draw(ctx, line, start, count) {
  if (usePath2D && !line.options.segment) {
    strokePathWithCache(ctx, line, start, count);
  } else {
    strokePathDirect(ctx, line, start, count);
  }
}
__name(draw, "draw");
class LineElement extends Element {
  static {
    __name(this, "LineElement");
  }
  static id = "line";
  static defaults = {
    borderCapStyle: "butt",
    borderDash: [],
    borderDashOffset: 0,
    borderJoinStyle: "miter",
    borderWidth: 3,
    capBezierPoints: true,
    cubicInterpolationMode: "default",
    fill: false,
    spanGaps: false,
    stepped: false,
    tension: 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  static descriptors = {
    _scriptable: true,
    _indexable: (name) => name !== "borderDash" && name !== "fill"
  };
  constructor(cfg) {
    super();
    this.animated = true;
    this.options = void 0;
    this._chart = void 0;
    this._loop = void 0;
    this._fullLoop = void 0;
    this._path = void 0;
    this._points = void 0;
    this._segments = void 0;
    this._decimated = false;
    this._pointsUpdated = false;
    this._datasetIndex = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  updateControlPoints(chartArea, indexAxis) {
    const options = this.options;
    if ((options.tension || options.cubicInterpolationMode === "monotone") && !options.stepped && !this._pointsUpdated) {
      const loop = options.spanGaps ? this._loop : this._fullLoop;
      _updateBezierControlPoints(this._points, options, chartArea, loop, indexAxis);
      this._pointsUpdated = true;
    }
  }
  set points(points) {
    this._points = points;
    delete this._segments;
    delete this._path;
    this._pointsUpdated = false;
  }
  get points() {
    return this._points;
  }
  get segments() {
    return this._segments || (this._segments = _computeSegments(this, this.options.segment));
  }
  first() {
    const segments = this.segments;
    const points = this.points;
    return segments.length && points[segments[0].start];
  }
  last() {
    const segments = this.segments;
    const points = this.points;
    const count = segments.length;
    return count && points[segments[count - 1].end];
  }
  interpolate(point, property) {
    const options = this.options;
    const value = point[property];
    const points = this.points;
    const segments = _boundSegments(this, {
      property,
      start: value,
      end: value
    });
    if (!segments.length) {
      return;
    }
    const result = [];
    const _interpolate = _getInterpolationMethod(options);
    let i, ilen;
    for (i = 0, ilen = segments.length; i < ilen; ++i) {
      const { start, end } = segments[i];
      const p1 = points[start];
      const p2 = points[end];
      if (p1 === p2) {
        result.push(p1);
        continue;
      }
      const t = Math.abs((value - p1[property]) / (p2[property] - p1[property]));
      const interpolated = _interpolate(p1, p2, t, options.stepped);
      interpolated[property] = point[property];
      result.push(interpolated);
    }
    return result.length === 1 ? result[0] : result;
  }
  pathSegment(ctx, segment, params) {
    const segmentMethod = _getSegmentMethod(this);
    return segmentMethod(ctx, this, segment, params);
  }
  path(ctx, start, count) {
    const segments = this.segments;
    const segmentMethod = _getSegmentMethod(this);
    let loop = this._loop;
    start = start || 0;
    count = count || this.points.length - start;
    for (const segment of segments) {
      loop &= segmentMethod(ctx, this, segment, {
        start,
        end: start + count - 1
      });
    }
    return !!loop;
  }
  draw(ctx, chartArea, start, count) {
    const options = this.options || {};
    const points = this.points || [];
    if (points.length && options.borderWidth) {
      ctx.save();
      draw(ctx, this, start, count);
      ctx.restore();
    }
    if (this.animated) {
      this._pointsUpdated = false;
      this._path = void 0;
    }
  }
}
function inRange$1(el, pos, axis, useFinalPosition) {
  const options = el.options;
  const { [axis]: value } = el.getProps([
    axis
  ], useFinalPosition);
  return Math.abs(pos - value) < options.radius + options.hitRadius;
}
__name(inRange$1, "inRange$1");
class PointElement extends Element {
  static {
    __name(this, "PointElement");
  }
  static id = "point";
  parsed;
  skip;
  stop;
  /**
  * @type {any}
  */
  static defaults = {
    borderWidth: 1,
    hitRadius: 1,
    hoverBorderWidth: 1,
    hoverRadius: 4,
    pointStyle: "circle",
    radius: 3,
    rotation: 0
  };
  /**
  * @type {any}
  */
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(cfg) {
    super();
    this.options = void 0;
    this.parsed = void 0;
    this.skip = void 0;
    this.stop = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    const options = this.options;
    const { x, y } = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    return Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2) < Math.pow(options.hitRadius + options.radius, 2);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange$1(this, mouseX, "x", useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange$1(this, mouseY, "y", useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const { x, y } = this.getProps([
      "x",
      "y"
    ], useFinalPosition);
    return {
      x,
      y
    };
  }
  size(options) {
    options = options || this.options || {};
    let radius = options.radius || 0;
    radius = Math.max(radius, radius && options.hoverRadius || 0);
    const borderWidth = radius && options.borderWidth || 0;
    return (radius + borderWidth) * 2;
  }
  draw(ctx, area) {
    const options = this.options;
    if (this.skip || options.radius < 0.1 || !_isPointInArea(this, area, this.size(options) / 2)) {
      return;
    }
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.fillStyle = options.backgroundColor;
    drawPoint(ctx, options, this.x, this.y);
  }
  getRange() {
    const options = this.options || {};
    return options.radius + options.hitRadius;
  }
}
function getBarBounds(bar, useFinalPosition) {
  const { x, y, base, width, height } = bar.getProps([
    "x",
    "y",
    "base",
    "width",
    "height"
  ], useFinalPosition);
  let left, right, top, bottom, half;
  if (bar.horizontal) {
    half = height / 2;
    left = Math.min(x, base);
    right = Math.max(x, base);
    top = y - half;
    bottom = y + half;
  } else {
    half = width / 2;
    left = x - half;
    right = x + half;
    top = Math.min(y, base);
    bottom = Math.max(y, base);
  }
  return {
    left,
    top,
    right,
    bottom
  };
}
__name(getBarBounds, "getBarBounds");
function skipOrLimit(skip2, value, min, max) {
  return skip2 ? 0 : _limitValue(value, min, max);
}
__name(skipOrLimit, "skipOrLimit");
function parseBorderWidth(bar, maxW, maxH) {
  const value = bar.options.borderWidth;
  const skip2 = bar.borderSkipped;
  const o = toTRBL(value);
  return {
    t: skipOrLimit(skip2.top, o.top, 0, maxH),
    r: skipOrLimit(skip2.right, o.right, 0, maxW),
    b: skipOrLimit(skip2.bottom, o.bottom, 0, maxH),
    l: skipOrLimit(skip2.left, o.left, 0, maxW)
  };
}
__name(parseBorderWidth, "parseBorderWidth");
function parseBorderRadius(bar, maxW, maxH) {
  const { enableBorderRadius } = bar.getProps([
    "enableBorderRadius"
  ]);
  const value = bar.options.borderRadius;
  const o = toTRBLCorners(value);
  const maxR = Math.min(maxW, maxH);
  const skip2 = bar.borderSkipped;
  const enableBorder = enableBorderRadius || isObject(value);
  return {
    topLeft: skipOrLimit(!enableBorder || skip2.top || skip2.left, o.topLeft, 0, maxR),
    topRight: skipOrLimit(!enableBorder || skip2.top || skip2.right, o.topRight, 0, maxR),
    bottomLeft: skipOrLimit(!enableBorder || skip2.bottom || skip2.left, o.bottomLeft, 0, maxR),
    bottomRight: skipOrLimit(!enableBorder || skip2.bottom || skip2.right, o.bottomRight, 0, maxR)
  };
}
__name(parseBorderRadius, "parseBorderRadius");
function boundingRects$1(bar) {
  const bounds = getBarBounds(bar);
  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const border = parseBorderWidth(bar, width / 2, height / 2);
  const radius = parseBorderRadius(bar, width / 2, height / 2);
  return {
    outer: {
      x: bounds.left,
      y: bounds.top,
      w: width,
      h: height,
      radius
    },
    inner: {
      x: bounds.left + border.l,
      y: bounds.top + border.t,
      w: width - border.l - border.r,
      h: height - border.t - border.b,
      radius: {
        topLeft: Math.max(0, radius.topLeft - Math.max(border.t, border.l)),
        topRight: Math.max(0, radius.topRight - Math.max(border.t, border.r)),
        bottomLeft: Math.max(0, radius.bottomLeft - Math.max(border.b, border.l)),
        bottomRight: Math.max(0, radius.bottomRight - Math.max(border.b, border.r))
      }
    }
  };
}
__name(boundingRects$1, "boundingRects$1");
function inRange(bar, x, y, useFinalPosition) {
  const skipX = x === null;
  const skipY = y === null;
  const skipBoth = skipX && skipY;
  const bounds = bar && !skipBoth && getBarBounds(bar, useFinalPosition);
  return bounds && (skipX || _isBetween(x, bounds.left, bounds.right)) && (skipY || _isBetween(y, bounds.top, bounds.bottom));
}
__name(inRange, "inRange");
function hasRadius(radius) {
  return radius.topLeft || radius.topRight || radius.bottomLeft || radius.bottomRight;
}
__name(hasRadius, "hasRadius");
function addNormalRectPath(ctx, rect) {
  ctx.rect(rect.x, rect.y, rect.w, rect.h);
}
__name(addNormalRectPath, "addNormalRectPath");
function inflateRect(rect, amount, refRect = {}) {
  const x = rect.x !== refRect.x ? -amount : 0;
  const y = rect.y !== refRect.y ? -amount : 0;
  const w = (rect.x + rect.w !== refRect.x + refRect.w ? amount : 0) - x;
  const h = (rect.y + rect.h !== refRect.y + refRect.h ? amount : 0) - y;
  return {
    x: rect.x + x,
    y: rect.y + y,
    w: rect.w + w,
    h: rect.h + h,
    radius: rect.radius
  };
}
__name(inflateRect, "inflateRect");
class BarElement extends Element {
  static {
    __name(this, "BarElement");
  }
  static id = "bar";
  static defaults = {
    borderSkipped: "start",
    borderWidth: 0,
    borderRadius: 0,
    inflateAmount: "auto",
    pointStyle: void 0
  };
  static defaultRoutes = {
    backgroundColor: "backgroundColor",
    borderColor: "borderColor"
  };
  constructor(cfg) {
    super();
    this.options = void 0;
    this.horizontal = void 0;
    this.base = void 0;
    this.width = void 0;
    this.height = void 0;
    this.inflateAmount = void 0;
    if (cfg) {
      Object.assign(this, cfg);
    }
  }
  draw(ctx) {
    const { inflateAmount, options: { borderColor, backgroundColor } } = this;
    const { inner, outer } = boundingRects$1(this);
    const addRectPath = hasRadius(outer.radius) ? addRoundedRectPath : addNormalRectPath;
    ctx.save();
    if (outer.w !== inner.w || outer.h !== inner.h) {
      ctx.beginPath();
      addRectPath(ctx, inflateRect(outer, inflateAmount, inner));
      ctx.clip();
      addRectPath(ctx, inflateRect(inner, -inflateAmount, outer));
      ctx.fillStyle = borderColor;
      ctx.fill("evenodd");
    }
    ctx.beginPath();
    addRectPath(ctx, inflateRect(inner, inflateAmount));
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.restore();
  }
  inRange(mouseX, mouseY, useFinalPosition) {
    return inRange(this, mouseX, mouseY, useFinalPosition);
  }
  inXRange(mouseX, useFinalPosition) {
    return inRange(this, mouseX, null, useFinalPosition);
  }
  inYRange(mouseY, useFinalPosition) {
    return inRange(this, null, mouseY, useFinalPosition);
  }
  getCenterPoint(useFinalPosition) {
    const { x, y, base, horizontal } = this.getProps([
      "x",
      "y",
      "base",
      "horizontal"
    ], useFinalPosition);
    return {
      x: horizontal ? (x + base) / 2 : x,
      y: horizontal ? y : (y + base) / 2
    };
  }
  getRange(axis) {
    return axis === "x" ? this.width / 2 : this.height / 2;
  }
}
var elements = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ArcElement,
  BarElement,
  LineElement,
  PointElement
});
const BORDER_COLORS = [
  "rgb(54, 162, 235)",
  "rgb(255, 99, 132)",
  "rgb(255, 159, 64)",
  "rgb(255, 205, 86)",
  "rgb(75, 192, 192)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)"
  // grey
];
const BACKGROUND_COLORS = /* @__PURE__ */ BORDER_COLORS.map((color2) => color2.replace("rgb(", "rgba(").replace(")", ", 0.5)"));
function getBorderColor(i) {
  return BORDER_COLORS[i % BORDER_COLORS.length];
}
__name(getBorderColor, "getBorderColor");
function getBackgroundColor(i) {
  return BACKGROUND_COLORS[i % BACKGROUND_COLORS.length];
}
__name(getBackgroundColor, "getBackgroundColor");
function colorizeDefaultDataset(dataset, i) {
  dataset.borderColor = getBorderColor(i);
  dataset.backgroundColor = getBackgroundColor(i);
  return ++i;
}
__name(colorizeDefaultDataset, "colorizeDefaultDataset");
function colorizeDoughnutDataset(dataset, i) {
  dataset.backgroundColor = dataset.data.map(() => getBorderColor(i++));
  return i;
}
__name(colorizeDoughnutDataset, "colorizeDoughnutDataset");
function colorizePolarAreaDataset(dataset, i) {
  dataset.backgroundColor = dataset.data.map(() => getBackgroundColor(i++));
  return i;
}
__name(colorizePolarAreaDataset, "colorizePolarAreaDataset");
function getColorizer(chart) {
  let i = 0;
  return (dataset, datasetIndex) => {
    const controller = chart.getDatasetMeta(datasetIndex).controller;
    if (controller instanceof DoughnutController) {
      i = colorizeDoughnutDataset(dataset, i);
    } else if (controller instanceof PolarAreaController) {
      i = colorizePolarAreaDataset(dataset, i);
    } else if (controller) {
      i = colorizeDefaultDataset(dataset, i);
    }
  };
}
__name(getColorizer, "getColorizer");
function containsColorsDefinitions(descriptors2) {
  let k;
  for (k in descriptors2) {
    if (descriptors2[k].borderColor || descriptors2[k].backgroundColor) {
      return true;
    }
  }
  return false;
}
__name(containsColorsDefinitions, "containsColorsDefinitions");
function containsColorsDefinition(descriptor) {
  return descriptor && (descriptor.borderColor || descriptor.backgroundColor);
}
__name(containsColorsDefinition, "containsColorsDefinition");
var plugin_colors = {
  id: "colors",
  defaults: {
    enabled: true,
    forceOverride: false
  },
  beforeLayout(chart, _args, options) {
    if (!options.enabled) {
      return;
    }
    const { data: { datasets }, options: chartOptions } = chart.config;
    const { elements: elements2 } = chartOptions;
    if (!options.forceOverride && (containsColorsDefinitions(datasets) || containsColorsDefinition(chartOptions) || elements2 && containsColorsDefinitions(elements2))) {
      return;
    }
    const colorizer = getColorizer(chart);
    datasets.forEach(colorizer);
  }
};
function lttbDecimation(data, start, count, availableWidth, options) {
  const samples = options.samples || availableWidth;
  if (samples >= count) {
    return data.slice(start, start + count);
  }
  const decimated = [];
  const bucketWidth = (count - 2) / (samples - 2);
  let sampledIndex = 0;
  const endIndex = start + count - 1;
  let a = start;
  let i, maxAreaPoint, maxArea, area, nextA;
  decimated[sampledIndex++] = data[a];
  for (i = 0; i < samples - 2; i++) {
    let avgX = 0;
    let avgY = 0;
    let j;
    const avgRangeStart = Math.floor((i + 1) * bucketWidth) + 1 + start;
    const avgRangeEnd = Math.min(Math.floor((i + 2) * bucketWidth) + 1, count) + start;
    const avgRangeLength = avgRangeEnd - avgRangeStart;
    for (j = avgRangeStart; j < avgRangeEnd; j++) {
      avgX += data[j].x;
      avgY += data[j].y;
    }
    avgX /= avgRangeLength;
    avgY /= avgRangeLength;
    const rangeOffs = Math.floor(i * bucketWidth) + 1 + start;
    const rangeTo = Math.min(Math.floor((i + 1) * bucketWidth) + 1, count) + start;
    const { x: pointAx, y: pointAy } = data[a];
    maxArea = area = -1;
    for (j = rangeOffs; j < rangeTo; j++) {
      area = 0.5 * Math.abs((pointAx - avgX) * (data[j].y - pointAy) - (pointAx - data[j].x) * (avgY - pointAy));
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[j];
        nextA = j;
      }
    }
    decimated[sampledIndex++] = maxAreaPoint;
    a = nextA;
  }
  decimated[sampledIndex++] = data[endIndex];
  return decimated;
}
__name(lttbDecimation, "lttbDecimation");
function minMaxDecimation(data, start, count, availableWidth) {
  let avgX = 0;
  let countX = 0;
  let i, point, x, y, prevX, minIndex, maxIndex, startIndex, minY, maxY;
  const decimated = [];
  const endIndex = start + count - 1;
  const xMin = data[start].x;
  const xMax = data[endIndex].x;
  const dx = xMax - xMin;
  for (i = start; i < start + count; ++i) {
    point = data[i];
    x = (point.x - xMin) / dx * availableWidth;
    y = point.y;
    const truncX = x | 0;
    if (truncX === prevX) {
      if (y < minY) {
        minY = y;
        minIndex = i;
      } else if (y > maxY) {
        maxY = y;
        maxIndex = i;
      }
      avgX = (countX * avgX + point.x) / ++countX;
    } else {
      const lastIndex = i - 1;
      if (!isNullOrUndef(minIndex) && !isNullOrUndef(maxIndex)) {
        const intermediateIndex1 = Math.min(minIndex, maxIndex);
        const intermediateIndex2 = Math.max(minIndex, maxIndex);
        if (intermediateIndex1 !== startIndex && intermediateIndex1 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex1],
            x: avgX
          });
        }
        if (intermediateIndex2 !== startIndex && intermediateIndex2 !== lastIndex) {
          decimated.push({
            ...data[intermediateIndex2],
            x: avgX
          });
        }
      }
      if (i > 0 && lastIndex !== startIndex) {
        decimated.push(data[lastIndex]);
      }
      decimated.push(point);
      prevX = truncX;
      countX = 0;
      minY = maxY = y;
      minIndex = maxIndex = startIndex = i;
    }
  }
  return decimated;
}
__name(minMaxDecimation, "minMaxDecimation");
function cleanDecimatedDataset(dataset) {
  if (dataset._decimated) {
    const data = dataset._data;
    delete dataset._decimated;
    delete dataset._data;
    Object.defineProperty(dataset, "data", {
      configurable: true,
      enumerable: true,
      writable: true,
      value: data
    });
  }
}
__name(cleanDecimatedDataset, "cleanDecimatedDataset");
function cleanDecimatedData(chart) {
  chart.data.datasets.forEach((dataset) => {
    cleanDecimatedDataset(dataset);
  });
}
__name(cleanDecimatedData, "cleanDecimatedData");
function getStartAndCountOfVisiblePointsSimplified(meta, points) {
  const pointCount = points.length;
  let start = 0;
  let count;
  const { iScale } = meta;
  const { min, max, minDefined, maxDefined } = iScale.getUserBounds();
  if (minDefined) {
    start = _limitValue(_lookupByKey(points, iScale.axis, min).lo, 0, pointCount - 1);
  }
  if (maxDefined) {
    count = _limitValue(_lookupByKey(points, iScale.axis, max).hi + 1, start, pointCount) - start;
  } else {
    count = pointCount - start;
  }
  return {
    start,
    count
  };
}
__name(getStartAndCountOfVisiblePointsSimplified, "getStartAndCountOfVisiblePointsSimplified");
var plugin_decimation = {
  id: "decimation",
  defaults: {
    algorithm: "min-max",
    enabled: false
  },
  beforeElementsUpdate: (chart, args, options) => {
    if (!options.enabled) {
      cleanDecimatedData(chart);
      return;
    }
    const availableWidth = chart.width;
    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const { _data, indexAxis } = dataset;
      const meta = chart.getDatasetMeta(datasetIndex);
      const data = _data || dataset.data;
      if (resolve([
        indexAxis,
        chart.options.indexAxis
      ]) === "y") {
        return;
      }
      if (!meta.controller.supportsDecimation) {
        return;
      }
      const xAxis = chart.scales[meta.xAxisID];
      if (xAxis.type !== "linear" && xAxis.type !== "time") {
        return;
      }
      if (chart.options.parsing) {
        return;
      }
      let { start, count } = getStartAndCountOfVisiblePointsSimplified(meta, data);
      const threshold = options.threshold || 4 * availableWidth;
      if (count <= threshold) {
        cleanDecimatedDataset(dataset);
        return;
      }
      if (isNullOrUndef(_data)) {
        dataset._data = data;
        delete dataset.data;
        Object.defineProperty(dataset, "data", {
          configurable: true,
          enumerable: true,
          get: function() {
            return this._decimated;
          },
          set: function(d) {
            this._data = d;
          }
        });
      }
      let decimated;
      switch (options.algorithm) {
        case "lttb":
          decimated = lttbDecimation(data, start, count, availableWidth, options);
          break;
        case "min-max":
          decimated = minMaxDecimation(data, start, count, availableWidth);
          break;
        default:
          throw new Error(`Unsupported decimation algorithm '${options.algorithm}'`);
      }
      dataset._decimated = decimated;
    });
  },
  destroy(chart) {
    cleanDecimatedData(chart);
  }
};
function _segments(line, target, property) {
  const segments = line.segments;
  const points = line.points;
  const tpoints = target.points;
  const parts = [];
  for (const segment of segments) {
    let { start, end } = segment;
    end = _findSegmentEnd(start, end, points);
    const bounds = _getBounds(property, points[start], points[end], segment.loop);
    if (!target.segments) {
      parts.push({
        source: segment,
        target: bounds,
        start: points[start],
        end: points[end]
      });
      continue;
    }
    const targetSegments = _boundSegments(target, bounds);
    for (const tgt of targetSegments) {
      const subBounds = _getBounds(property, tpoints[tgt.start], tpoints[tgt.end], tgt.loop);
      const fillSources = _boundSegment(segment, points, subBounds);
      for (const fillSource of fillSources) {
        parts.push({
          source: fillSource,
          target: tgt,
          start: {
            [property]: _getEdge(bounds, subBounds, "start", Math.max)
          },
          end: {
            [property]: _getEdge(bounds, subBounds, "end", Math.min)
          }
        });
      }
    }
  }
  return parts;
}
__name(_segments, "_segments");
function _getBounds(property, first, last, loop) {
  if (loop) {
    return;
  }
  let start = first[property];
  let end = last[property];
  if (property === "angle") {
    start = _normalizeAngle(start);
    end = _normalizeAngle(end);
  }
  return {
    property,
    start,
    end
  };
}
__name(_getBounds, "_getBounds");
function _pointsFromSegments(boundary, line) {
  const { x = null, y = null } = boundary || {};
  const linePoints = line.points;
  const points = [];
  line.segments.forEach(({ start, end }) => {
    end = _findSegmentEnd(start, end, linePoints);
    const first = linePoints[start];
    const last = linePoints[end];
    if (y !== null) {
      points.push({
        x: first.x,
        y
      });
      points.push({
        x: last.x,
        y
      });
    } else if (x !== null) {
      points.push({
        x,
        y: first.y
      });
      points.push({
        x,
        y: last.y
      });
    }
  });
  return points;
}
__name(_pointsFromSegments, "_pointsFromSegments");
function _findSegmentEnd(start, end, points) {
  for (; end > start; end--) {
    const point = points[end];
    if (!isNaN(point.x) && !isNaN(point.y)) {
      break;
    }
  }
  return end;
}
__name(_findSegmentEnd, "_findSegmentEnd");
function _getEdge(a, b, prop, fn) {
  if (a && b) {
    return fn(a[prop], b[prop]);
  }
  return a ? a[prop] : b ? b[prop] : 0;
}
__name(_getEdge, "_getEdge");
function _createBoundaryLine(boundary, line) {
  let points = [];
  let _loop = false;
  if (isArray(boundary)) {
    _loop = true;
    points = boundary;
  } else {
    points = _pointsFromSegments(boundary, line);
  }
  return points.length ? new LineElement({
    points,
    options: {
      tension: 0
    },
    _loop,
    _fullLoop: _loop
  }) : null;
}
__name(_createBoundaryLine, "_createBoundaryLine");
function _shouldApplyFill(source) {
  return source && source.fill !== false;
}
__name(_shouldApplyFill, "_shouldApplyFill");
function _resolveTarget(sources, index2, propagate) {
  const source = sources[index2];
  let fill2 = source.fill;
  const visited = [
    index2
  ];
  let target;
  if (!propagate) {
    return fill2;
  }
  while (fill2 !== false && visited.indexOf(fill2) === -1) {
    if (!isNumberFinite(fill2)) {
      return fill2;
    }
    target = sources[fill2];
    if (!target) {
      return false;
    }
    if (target.visible) {
      return fill2;
    }
    visited.push(fill2);
    fill2 = target.fill;
  }
  return false;
}
__name(_resolveTarget, "_resolveTarget");
function _decodeFill(line, index2, count) {
  const fill2 = parseFillOption(line);
  if (isObject(fill2)) {
    return isNaN(fill2.value) ? false : fill2;
  }
  let target = parseFloat(fill2);
  if (isNumberFinite(target) && Math.floor(target) === target) {
    return decodeTargetIndex(fill2[0], index2, target, count);
  }
  return [
    "origin",
    "start",
    "end",
    "stack",
    "shape"
  ].indexOf(fill2) >= 0 && fill2;
}
__name(_decodeFill, "_decodeFill");
function decodeTargetIndex(firstCh, index2, target, count) {
  if (firstCh === "-" || firstCh === "+") {
    target = index2 + target;
  }
  if (target === index2 || target < 0 || target >= count) {
    return false;
  }
  return target;
}
__name(decodeTargetIndex, "decodeTargetIndex");
function _getTargetPixel(fill2, scale) {
  let pixel = null;
  if (fill2 === "start") {
    pixel = scale.bottom;
  } else if (fill2 === "end") {
    pixel = scale.top;
  } else if (isObject(fill2)) {
    pixel = scale.getPixelForValue(fill2.value);
  } else if (scale.getBasePixel) {
    pixel = scale.getBasePixel();
  }
  return pixel;
}
__name(_getTargetPixel, "_getTargetPixel");
function _getTargetValue(fill2, scale, startValue) {
  let value;
  if (fill2 === "start") {
    value = startValue;
  } else if (fill2 === "end") {
    value = scale.options.reverse ? scale.min : scale.max;
  } else if (isObject(fill2)) {
    value = fill2.value;
  } else {
    value = scale.getBaseValue();
  }
  return value;
}
__name(_getTargetValue, "_getTargetValue");
function parseFillOption(line) {
  const options = line.options;
  const fillOption = options.fill;
  let fill2 = valueOrDefault(fillOption && fillOption.target, fillOption);
  if (fill2 === void 0) {
    fill2 = !!options.backgroundColor;
  }
  if (fill2 === false || fill2 === null) {
    return false;
  }
  if (fill2 === true) {
    return "origin";
  }
  return fill2;
}
__name(parseFillOption, "parseFillOption");
function _buildStackLine(source) {
  const { scale, index: index2, line } = source;
  const points = [];
  const segments = line.segments;
  const sourcePoints = line.points;
  const linesBelow = getLinesBelow(scale, index2);
  linesBelow.push(_createBoundaryLine({
    x: null,
    y: scale.bottom
  }, line));
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    for (let j = segment.start; j <= segment.end; j++) {
      addPointsBelow(points, sourcePoints[j], linesBelow);
    }
  }
  return new LineElement({
    points,
    options: {}
  });
}
__name(_buildStackLine, "_buildStackLine");
function getLinesBelow(scale, index2) {
  const below = [];
  const metas = scale.getMatchingVisibleMetas("line");
  for (let i = 0; i < metas.length; i++) {
    const meta = metas[i];
    if (meta.index === index2) {
      break;
    }
    if (!meta.hidden) {
      below.unshift(meta.dataset);
    }
  }
  return below;
}
__name(getLinesBelow, "getLinesBelow");
function addPointsBelow(points, sourcePoint, linesBelow) {
  const postponed = [];
  for (let j = 0; j < linesBelow.length; j++) {
    const line = linesBelow[j];
    const { first, last, point } = findPoint(line, sourcePoint, "x");
    if (!point || first && last) {
      continue;
    }
    if (first) {
      postponed.unshift(point);
    } else {
      points.push(point);
      if (!last) {
        break;
      }
    }
  }
  points.push(...postponed);
}
__name(addPointsBelow, "addPointsBelow");
function findPoint(line, sourcePoint, property) {
  const point = line.interpolate(sourcePoint, property);
  if (!point) {
    return {};
  }
  const pointValue = point[property];
  const segments = line.segments;
  const linePoints = line.points;
  let first = false;
  let last = false;
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const firstValue = linePoints[segment.start][property];
    const lastValue = linePoints[segment.end][property];
    if (_isBetween(pointValue, firstValue, lastValue)) {
      first = pointValue === firstValue;
      last = pointValue === lastValue;
      break;
    }
  }
  return {
    first,
    last,
    point
  };
}
__name(findPoint, "findPoint");
class simpleArc {
  static {
    __name(this, "simpleArc");
  }
  constructor(opts) {
    this.x = opts.x;
    this.y = opts.y;
    this.radius = opts.radius;
  }
  pathSegment(ctx, bounds, opts) {
    const { x, y, radius } = this;
    bounds = bounds || {
      start: 0,
      end: TAU
    };
    ctx.arc(x, y, radius, bounds.end, bounds.start, true);
    return !opts.bounds;
  }
  interpolate(point) {
    const { x, y, radius } = this;
    const angle = point.angle;
    return {
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      angle
    };
  }
}
function _getTarget(source) {
  const { chart, fill: fill2, line } = source;
  if (isNumberFinite(fill2)) {
    return getLineByIndex(chart, fill2);
  }
  if (fill2 === "stack") {
    return _buildStackLine(source);
  }
  if (fill2 === "shape") {
    return true;
  }
  const boundary = computeBoundary(source);
  if (boundary instanceof simpleArc) {
    return boundary;
  }
  return _createBoundaryLine(boundary, line);
}
__name(_getTarget, "_getTarget");
function getLineByIndex(chart, index2) {
  const meta = chart.getDatasetMeta(index2);
  const visible = meta && chart.isDatasetVisible(index2);
  return visible ? meta.dataset : null;
}
__name(getLineByIndex, "getLineByIndex");
function computeBoundary(source) {
  const scale = source.scale || {};
  if (scale.getPointPositionForValue) {
    return computeCircularBoundary(source);
  }
  return computeLinearBoundary(source);
}
__name(computeBoundary, "computeBoundary");
function computeLinearBoundary(source) {
  const { scale = {}, fill: fill2 } = source;
  const pixel = _getTargetPixel(fill2, scale);
  if (isNumberFinite(pixel)) {
    const horizontal = scale.isHorizontal();
    return {
      x: horizontal ? pixel : null,
      y: horizontal ? null : pixel
    };
  }
  return null;
}
__name(computeLinearBoundary, "computeLinearBoundary");
function computeCircularBoundary(source) {
  const { scale, fill: fill2 } = source;
  const options = scale.options;
  const length = scale.getLabels().length;
  const start = options.reverse ? scale.max : scale.min;
  const value = _getTargetValue(fill2, scale, start);
  const target = [];
  if (options.grid.circular) {
    const center = scale.getPointPositionForValue(0, start);
    return new simpleArc({
      x: center.x,
      y: center.y,
      radius: scale.getDistanceFromCenterForValue(value)
    });
  }
  for (let i = 0; i < length; ++i) {
    target.push(scale.getPointPositionForValue(i, value));
  }
  return target;
}
__name(computeCircularBoundary, "computeCircularBoundary");
function _drawfill(ctx, source, area) {
  const target = _getTarget(source);
  const { line, scale, axis } = source;
  const lineOpts = line.options;
  const fillOption = lineOpts.fill;
  const color2 = lineOpts.backgroundColor;
  const { above = color2, below = color2 } = fillOption || {};
  if (target && line.points.length) {
    clipArea(ctx, area);
    doFill(ctx, {
      line,
      target,
      above,
      below,
      area,
      scale,
      axis
    });
    unclipArea(ctx);
  }
}
__name(_drawfill, "_drawfill");
function doFill(ctx, cfg) {
  const { line, target, above, below, area, scale } = cfg;
  const property = line._loop ? "angle" : cfg.axis;
  ctx.save();
  if (property === "x" && below !== above) {
    clipVertical(ctx, target, area.top);
    fill(ctx, {
      line,
      target,
      color: above,
      scale,
      property
    });
    ctx.restore();
    ctx.save();
    clipVertical(ctx, target, area.bottom);
  }
  fill(ctx, {
    line,
    target,
    color: below,
    scale,
    property
  });
  ctx.restore();
}
__name(doFill, "doFill");
function clipVertical(ctx, target, clipY) {
  const { segments, points } = target;
  let first = true;
  let lineLoop = false;
  ctx.beginPath();
  for (const segment of segments) {
    const { start, end } = segment;
    const firstPoint = points[start];
    const lastPoint = points[_findSegmentEnd(start, end, points)];
    if (first) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      first = false;
    } else {
      ctx.lineTo(firstPoint.x, clipY);
      ctx.lineTo(firstPoint.x, firstPoint.y);
    }
    lineLoop = !!target.pathSegment(ctx, segment, {
      move: lineLoop
    });
    if (lineLoop) {
      ctx.closePath();
    } else {
      ctx.lineTo(lastPoint.x, clipY);
    }
  }
  ctx.lineTo(target.first().x, clipY);
  ctx.closePath();
  ctx.clip();
}
__name(clipVertical, "clipVertical");
function fill(ctx, cfg) {
  const { line, target, property, color: color2, scale } = cfg;
  const segments = _segments(line, target, property);
  for (const { source: src, target: tgt, start, end } of segments) {
    const { style: { backgroundColor = color2 } = {} } = src;
    const notShape = target !== true;
    ctx.save();
    ctx.fillStyle = backgroundColor;
    clipBounds(ctx, scale, notShape && _getBounds(property, start, end));
    ctx.beginPath();
    const lineLoop = !!line.pathSegment(ctx, src);
    let loop;
    if (notShape) {
      if (lineLoop) {
        ctx.closePath();
      } else {
        interpolatedLineTo(ctx, target, end, property);
      }
      const targetLoop = !!target.pathSegment(ctx, tgt, {
        move: lineLoop,
        reverse: true
      });
      loop = lineLoop && targetLoop;
      if (!loop) {
        interpolatedLineTo(ctx, target, start, property);
      }
    }
    ctx.closePath();
    ctx.fill(loop ? "evenodd" : "nonzero");
    ctx.restore();
  }
}
__name(fill, "fill");
function clipBounds(ctx, scale, bounds) {
  const { top, bottom } = scale.chart.chartArea;
  const { property, start, end } = bounds || {};
  if (property === "x") {
    ctx.beginPath();
    ctx.rect(start, top, end - start, bottom - top);
    ctx.clip();
  }
}
__name(clipBounds, "clipBounds");
function interpolatedLineTo(ctx, target, point, property) {
  const interpolatedPoint = target.interpolate(point, property);
  if (interpolatedPoint) {
    ctx.lineTo(interpolatedPoint.x, interpolatedPoint.y);
  }
}
__name(interpolatedLineTo, "interpolatedLineTo");
var index = {
  id: "filler",
  afterDatasetsUpdate(chart, _args, options) {
    const count = (chart.data.datasets || []).length;
    const sources = [];
    let meta, i, line, source;
    for (i = 0; i < count; ++i) {
      meta = chart.getDatasetMeta(i);
      line = meta.dataset;
      source = null;
      if (line && line.options && line instanceof LineElement) {
        source = {
          visible: chart.isDatasetVisible(i),
          index: i,
          fill: _decodeFill(line, i, count),
          chart,
          axis: meta.controller.options.indexAxis,
          scale: meta.vScale,
          line
        };
      }
      meta.$filler = source;
      sources.push(source);
    }
    for (i = 0; i < count; ++i) {
      source = sources[i];
      if (!source || source.fill === false) {
        continue;
      }
      source.fill = _resolveTarget(sources, i, options.propagate);
    }
  },
  beforeDraw(chart, _args, options) {
    const draw2 = options.drawTime === "beforeDraw";
    const metasets = chart.getSortedVisibleDatasetMetas();
    const area = chart.chartArea;
    for (let i = metasets.length - 1; i >= 0; --i) {
      const source = metasets[i].$filler;
      if (!source) {
        continue;
      }
      source.line.updateControlPoints(area, source.axis);
      if (draw2 && source.fill) {
        _drawfill(chart.ctx, source, area);
      }
    }
  },
  beforeDatasetsDraw(chart, _args, options) {
    if (options.drawTime !== "beforeDatasetsDraw") {
      return;
    }
    const metasets = chart.getSortedVisibleDatasetMetas();
    for (let i = metasets.length - 1; i >= 0; --i) {
      const source = metasets[i].$filler;
      if (_shouldApplyFill(source)) {
        _drawfill(chart.ctx, source, chart.chartArea);
      }
    }
  },
  beforeDatasetDraw(chart, args, options) {
    const source = args.meta.$filler;
    if (!_shouldApplyFill(source) || options.drawTime !== "beforeDatasetDraw") {
      return;
    }
    _drawfill(chart.ctx, source, chart.chartArea);
  },
  defaults: {
    propagate: true,
    drawTime: "beforeDatasetDraw"
  }
};
const getBoxSize = /* @__PURE__ */ __name((labelOpts, fontSize) => {
  let { boxHeight = fontSize, boxWidth = fontSize } = labelOpts;
  if (labelOpts.usePointStyle) {
    boxHeight = Math.min(boxHeight, fontSize);
    boxWidth = labelOpts.pointStyleWidth || Math.min(boxWidth, fontSize);
  }
  return {
    boxWidth,
    boxHeight,
    itemHeight: Math.max(fontSize, boxHeight)
  };
}, "getBoxSize");
const itemsEqual = /* @__PURE__ */ __name((a, b) => a !== null && b !== null && a.datasetIndex === b.datasetIndex && a.index === b.index, "itemsEqual");
class Legend extends Element {
  static {
    __name(this, "Legend");
  }
  constructor(config) {
    super();
    this._added = false;
    this.legendHitBoxes = [];
    this._hoveredItem = null;
    this.doughnutMode = false;
    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this.legendItems = void 0;
    this.columnSizes = void 0;
    this.lineWidths = void 0;
    this.maxHeight = void 0;
    this.maxWidth = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.height = void 0;
    this.width = void 0;
    this._margins = void 0;
    this.position = void 0;
    this.weight = void 0;
    this.fullSize = void 0;
  }
  update(maxWidth, maxHeight, margins) {
    this.maxWidth = maxWidth;
    this.maxHeight = maxHeight;
    this._margins = margins;
    this.setDimensions();
    this.buildLabels();
    this.fit();
  }
  setDimensions() {
    if (this.isHorizontal()) {
      this.width = this.maxWidth;
      this.left = this._margins.left;
      this.right = this.width;
    } else {
      this.height = this.maxHeight;
      this.top = this._margins.top;
      this.bottom = this.height;
    }
  }
  buildLabels() {
    const labelOpts = this.options.labels || {};
    let legendItems = callback(labelOpts.generateLabels, [
      this.chart
    ], this) || [];
    if (labelOpts.filter) {
      legendItems = legendItems.filter((item) => labelOpts.filter(item, this.chart.data));
    }
    if (labelOpts.sort) {
      legendItems = legendItems.sort((a, b) => labelOpts.sort(a, b, this.chart.data));
    }
    if (this.options.reverse) {
      legendItems.reverse();
    }
    this.legendItems = legendItems;
  }
  fit() {
    const { options, ctx } = this;
    if (!options.display) {
      this.width = this.height = 0;
      return;
    }
    const labelOpts = options.labels;
    const labelFont = toFont(labelOpts.font);
    const fontSize = labelFont.size;
    const titleHeight = this._computeTitleHeight();
    const { boxWidth, itemHeight } = getBoxSize(labelOpts, fontSize);
    let width, height;
    ctx.font = labelFont.string;
    if (this.isHorizontal()) {
      width = this.maxWidth;
      height = this._fitRows(titleHeight, fontSize, boxWidth, itemHeight) + 10;
    } else {
      height = this.maxHeight;
      width = this._fitCols(titleHeight, labelFont, boxWidth, itemHeight) + 10;
    }
    this.width = Math.min(width, options.maxWidth || this.maxWidth);
    this.height = Math.min(height, options.maxHeight || this.maxHeight);
  }
  _fitRows(titleHeight, fontSize, boxWidth, itemHeight) {
    const { ctx, maxWidth, options: { labels: { padding } } } = this;
    const hitboxes = this.legendHitBoxes = [];
    const lineWidths = this.lineWidths = [
      0
    ];
    const lineHeight = itemHeight + padding;
    let totalHeight = titleHeight;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let row = -1;
    let top = -lineHeight;
    this.legendItems.forEach((legendItem, i) => {
      const itemWidth = boxWidth + fontSize / 2 + ctx.measureText(legendItem.text).width;
      if (i === 0 || lineWidths[lineWidths.length - 1] + itemWidth + 2 * padding > maxWidth) {
        totalHeight += lineHeight;
        lineWidths[lineWidths.length - (i > 0 ? 0 : 1)] = 0;
        top += lineHeight;
        row++;
      }
      hitboxes[i] = {
        left: 0,
        top,
        row,
        width: itemWidth,
        height: itemHeight
      };
      lineWidths[lineWidths.length - 1] += itemWidth + padding;
    });
    return totalHeight;
  }
  _fitCols(titleHeight, labelFont, boxWidth, _itemHeight) {
    const { ctx, maxHeight, options: { labels: { padding } } } = this;
    const hitboxes = this.legendHitBoxes = [];
    const columnSizes = this.columnSizes = [];
    const heightLimit = maxHeight - titleHeight;
    let totalWidth = padding;
    let currentColWidth = 0;
    let currentColHeight = 0;
    let left = 0;
    let col = 0;
    this.legendItems.forEach((legendItem, i) => {
      const { itemWidth, itemHeight } = calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight);
      if (i > 0 && currentColHeight + itemHeight + 2 * padding > heightLimit) {
        totalWidth += currentColWidth + padding;
        columnSizes.push({
          width: currentColWidth,
          height: currentColHeight
        });
        left += currentColWidth + padding;
        col++;
        currentColWidth = currentColHeight = 0;
      }
      hitboxes[i] = {
        left,
        top: currentColHeight,
        col,
        width: itemWidth,
        height: itemHeight
      };
      currentColWidth = Math.max(currentColWidth, itemWidth);
      currentColHeight += itemHeight + padding;
    });
    totalWidth += currentColWidth;
    columnSizes.push({
      width: currentColWidth,
      height: currentColHeight
    });
    return totalWidth;
  }
  adjustHitBoxes() {
    if (!this.options.display) {
      return;
    }
    const titleHeight = this._computeTitleHeight();
    const { legendHitBoxes: hitboxes, options: { align, labels: { padding }, rtl } } = this;
    const rtlHelper = getRtlAdapter(rtl, this.left, this.width);
    if (this.isHorizontal()) {
      let row = 0;
      let left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
      for (const hitbox of hitboxes) {
        if (row !== hitbox.row) {
          row = hitbox.row;
          left = _alignStartEnd(align, this.left + padding, this.right - this.lineWidths[row]);
        }
        hitbox.top += this.top + titleHeight + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(left), hitbox.width);
        left += hitbox.width + padding;
      }
    } else {
      let col = 0;
      let top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
      for (const hitbox of hitboxes) {
        if (hitbox.col !== col) {
          col = hitbox.col;
          top = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - this.columnSizes[col].height);
        }
        hitbox.top = top;
        hitbox.left += this.left + padding;
        hitbox.left = rtlHelper.leftForLtr(rtlHelper.x(hitbox.left), hitbox.width);
        top += hitbox.height + padding;
      }
    }
  }
  isHorizontal() {
    return this.options.position === "top" || this.options.position === "bottom";
  }
  draw() {
    if (this.options.display) {
      const ctx = this.ctx;
      clipArea(ctx, this);
      this._draw();
      unclipArea(ctx);
    }
  }
  _draw() {
    const { options: opts, columnSizes, lineWidths, ctx } = this;
    const { align, labels: labelOpts } = opts;
    const defaultColor = defaults$1.color;
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const labelFont = toFont(labelOpts.font);
    const { padding } = labelOpts;
    const fontSize = labelFont.size;
    const halfFontSize = fontSize / 2;
    let cursor;
    this.drawTitle();
    ctx.textAlign = rtlHelper.textAlign("left");
    ctx.textBaseline = "middle";
    ctx.lineWidth = 0.5;
    ctx.font = labelFont.string;
    const { boxWidth, boxHeight, itemHeight } = getBoxSize(labelOpts, fontSize);
    const drawLegendBox = /* @__PURE__ */ __name(function(x, y, legendItem) {
      if (isNaN(boxWidth) || boxWidth <= 0 || isNaN(boxHeight) || boxHeight < 0) {
        return;
      }
      ctx.save();
      const lineWidth = valueOrDefault(legendItem.lineWidth, 1);
      ctx.fillStyle = valueOrDefault(legendItem.fillStyle, defaultColor);
      ctx.lineCap = valueOrDefault(legendItem.lineCap, "butt");
      ctx.lineDashOffset = valueOrDefault(legendItem.lineDashOffset, 0);
      ctx.lineJoin = valueOrDefault(legendItem.lineJoin, "miter");
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = valueOrDefault(legendItem.strokeStyle, defaultColor);
      ctx.setLineDash(valueOrDefault(legendItem.lineDash, []));
      if (labelOpts.usePointStyle) {
        const drawOptions = {
          radius: boxHeight * Math.SQRT2 / 2,
          pointStyle: legendItem.pointStyle,
          rotation: legendItem.rotation,
          borderWidth: lineWidth
        };
        const centerX = rtlHelper.xPlus(x, boxWidth / 2);
        const centerY = y + halfFontSize;
        drawPointLegend(ctx, drawOptions, centerX, centerY, labelOpts.pointStyleWidth && boxWidth);
      } else {
        const yBoxTop = y + Math.max((fontSize - boxHeight) / 2, 0);
        const xBoxLeft = rtlHelper.leftForLtr(x, boxWidth);
        const borderRadius = toTRBLCorners(legendItem.borderRadius);
        ctx.beginPath();
        if (Object.values(borderRadius).some((v) => v !== 0)) {
          addRoundedRectPath(ctx, {
            x: xBoxLeft,
            y: yBoxTop,
            w: boxWidth,
            h: boxHeight,
            radius: borderRadius
          });
        } else {
          ctx.rect(xBoxLeft, yBoxTop, boxWidth, boxHeight);
        }
        ctx.fill();
        if (lineWidth !== 0) {
          ctx.stroke();
        }
      }
      ctx.restore();
    }, "drawLegendBox");
    const fillText = /* @__PURE__ */ __name(function(x, y, legendItem) {
      renderText(ctx, legendItem.text, x, y + itemHeight / 2, labelFont, {
        strikethrough: legendItem.hidden,
        textAlign: rtlHelper.textAlign(legendItem.textAlign)
      });
    }, "fillText");
    const isHorizontal = this.isHorizontal();
    const titleHeight = this._computeTitleHeight();
    if (isHorizontal) {
      cursor = {
        x: _alignStartEnd(align, this.left + padding, this.right - lineWidths[0]),
        y: this.top + padding + titleHeight,
        line: 0
      };
    } else {
      cursor = {
        x: this.left + padding,
        y: _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[0].height),
        line: 0
      };
    }
    overrideTextDirection(this.ctx, opts.textDirection);
    const lineHeight = itemHeight + padding;
    this.legendItems.forEach((legendItem, i) => {
      ctx.strokeStyle = legendItem.fontColor;
      ctx.fillStyle = legendItem.fontColor;
      const textWidth = ctx.measureText(legendItem.text).width;
      const textAlign = rtlHelper.textAlign(legendItem.textAlign || (legendItem.textAlign = labelOpts.textAlign));
      const width = boxWidth + halfFontSize + textWidth;
      let x = cursor.x;
      let y = cursor.y;
      rtlHelper.setWidth(this.width);
      if (isHorizontal) {
        if (i > 0 && x + width + padding > this.right) {
          y = cursor.y += lineHeight;
          cursor.line++;
          x = cursor.x = _alignStartEnd(align, this.left + padding, this.right - lineWidths[cursor.line]);
        }
      } else if (i > 0 && y + lineHeight > this.bottom) {
        x = cursor.x = x + columnSizes[cursor.line].width + padding;
        cursor.line++;
        y = cursor.y = _alignStartEnd(align, this.top + titleHeight + padding, this.bottom - columnSizes[cursor.line].height);
      }
      const realX = rtlHelper.x(x);
      drawLegendBox(realX, y, legendItem);
      x = _textX(textAlign, x + boxWidth + halfFontSize, isHorizontal ? x + width : this.right, opts.rtl);
      fillText(rtlHelper.x(x), y, legendItem);
      if (isHorizontal) {
        cursor.x += width + padding;
      } else if (typeof legendItem.text !== "string") {
        const fontLineHeight = labelFont.lineHeight;
        cursor.y += calculateLegendItemHeight(legendItem, fontLineHeight) + padding;
      } else {
        cursor.y += lineHeight;
      }
    });
    restoreTextDirection(this.ctx, opts.textDirection);
  }
  drawTitle() {
    const opts = this.options;
    const titleOpts = opts.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    if (!titleOpts.display) {
      return;
    }
    const rtlHelper = getRtlAdapter(opts.rtl, this.left, this.width);
    const ctx = this.ctx;
    const position = titleOpts.position;
    const halfFontSize = titleFont.size / 2;
    const topPaddingPlusHalfFontSize = titlePadding.top + halfFontSize;
    let y;
    let left = this.left;
    let maxWidth = this.width;
    if (this.isHorizontal()) {
      maxWidth = Math.max(...this.lineWidths);
      y = this.top + topPaddingPlusHalfFontSize;
      left = _alignStartEnd(opts.align, left, this.right - maxWidth);
    } else {
      const maxHeight = this.columnSizes.reduce((acc, size) => Math.max(acc, size.height), 0);
      y = topPaddingPlusHalfFontSize + _alignStartEnd(opts.align, this.top, this.bottom - maxHeight - opts.labels.padding - this._computeTitleHeight());
    }
    const x = _alignStartEnd(position, left, left + maxWidth);
    ctx.textAlign = rtlHelper.textAlign(_toLeftRightCenter(position));
    ctx.textBaseline = "middle";
    ctx.strokeStyle = titleOpts.color;
    ctx.fillStyle = titleOpts.color;
    ctx.font = titleFont.string;
    renderText(ctx, titleOpts.text, x, y, titleFont);
  }
  _computeTitleHeight() {
    const titleOpts = this.options.title;
    const titleFont = toFont(titleOpts.font);
    const titlePadding = toPadding(titleOpts.padding);
    return titleOpts.display ? titleFont.lineHeight + titlePadding.height : 0;
  }
  _getLegendItemAt(x, y) {
    let i, hitBox, lh;
    if (_isBetween(x, this.left, this.right) && _isBetween(y, this.top, this.bottom)) {
      lh = this.legendHitBoxes;
      for (i = 0; i < lh.length; ++i) {
        hitBox = lh[i];
        if (_isBetween(x, hitBox.left, hitBox.left + hitBox.width) && _isBetween(y, hitBox.top, hitBox.top + hitBox.height)) {
          return this.legendItems[i];
        }
      }
    }
    return null;
  }
  handleEvent(e) {
    const opts = this.options;
    if (!isListened(e.type, opts)) {
      return;
    }
    const hoveredItem = this._getLegendItemAt(e.x, e.y);
    if (e.type === "mousemove" || e.type === "mouseout") {
      const previous = this._hoveredItem;
      const sameItem = itemsEqual(previous, hoveredItem);
      if (previous && !sameItem) {
        callback(opts.onLeave, [
          e,
          previous,
          this
        ], this);
      }
      this._hoveredItem = hoveredItem;
      if (hoveredItem && !sameItem) {
        callback(opts.onHover, [
          e,
          hoveredItem,
          this
        ], this);
      }
    } else if (hoveredItem) {
      callback(opts.onClick, [
        e,
        hoveredItem,
        this
      ], this);
    }
  }
}
function calculateItemSize(boxWidth, labelFont, ctx, legendItem, _itemHeight) {
  const itemWidth = calculateItemWidth(legendItem, boxWidth, labelFont, ctx);
  const itemHeight = calculateItemHeight(_itemHeight, legendItem, labelFont.lineHeight);
  return {
    itemWidth,
    itemHeight
  };
}
__name(calculateItemSize, "calculateItemSize");
function calculateItemWidth(legendItem, boxWidth, labelFont, ctx) {
  let legendItemText = legendItem.text;
  if (legendItemText && typeof legendItemText !== "string") {
    legendItemText = legendItemText.reduce((a, b) => a.length > b.length ? a : b);
  }
  return boxWidth + labelFont.size / 2 + ctx.measureText(legendItemText).width;
}
__name(calculateItemWidth, "calculateItemWidth");
function calculateItemHeight(_itemHeight, legendItem, fontLineHeight) {
  let itemHeight = _itemHeight;
  if (typeof legendItem.text !== "string") {
    itemHeight = calculateLegendItemHeight(legendItem, fontLineHeight);
  }
  return itemHeight;
}
__name(calculateItemHeight, "calculateItemHeight");
function calculateLegendItemHeight(legendItem, fontLineHeight) {
  const labelHeight = legendItem.text ? legendItem.text.length : 0;
  return fontLineHeight * labelHeight;
}
__name(calculateLegendItemHeight, "calculateLegendItemHeight");
function isListened(type, opts) {
  if ((type === "mousemove" || type === "mouseout") && (opts.onHover || opts.onLeave)) {
    return true;
  }
  if (opts.onClick && (type === "click" || type === "mouseup")) {
    return true;
  }
  return false;
}
__name(isListened, "isListened");
var plugin_legend = {
  id: "legend",
  _element: Legend,
  start(chart, _args, options) {
    const legend = chart.legend = new Legend({
      ctx: chart.ctx,
      options,
      chart
    });
    layouts.configure(chart, legend, options);
    layouts.addBox(chart, legend);
  },
  stop(chart) {
    layouts.removeBox(chart, chart.legend);
    delete chart.legend;
  },
  beforeUpdate(chart, _args, options) {
    const legend = chart.legend;
    layouts.configure(chart, legend, options);
    legend.options = options;
  },
  afterUpdate(chart) {
    const legend = chart.legend;
    legend.buildLabels();
    legend.adjustHitBoxes();
  },
  afterEvent(chart, args) {
    if (!args.replay) {
      chart.legend.handleEvent(args.event);
    }
  },
  defaults: {
    display: true,
    position: "top",
    align: "center",
    fullSize: true,
    reverse: false,
    weight: 1e3,
    onClick(e, legendItem, legend) {
      const index2 = legendItem.datasetIndex;
      const ci = legend.chart;
      if (ci.isDatasetVisible(index2)) {
        ci.hide(index2);
        legendItem.hidden = true;
      } else {
        ci.show(index2);
        legendItem.hidden = false;
      }
    },
    onHover: null,
    onLeave: null,
    labels: {
      color: (ctx) => ctx.chart.options.color,
      boxWidth: 40,
      padding: 10,
      generateLabels(chart) {
        const datasets = chart.data.datasets;
        const { labels: { usePointStyle, pointStyle, textAlign, color: color2, useBorderRadius, borderRadius } } = chart.legend.options;
        return chart._getSortedDatasetMetas().map((meta) => {
          const style = meta.controller.getStyle(usePointStyle ? 0 : void 0);
          const borderWidth = toPadding(style.borderWidth);
          return {
            text: datasets[meta.index].label,
            fillStyle: style.backgroundColor,
            fontColor: color2,
            hidden: !meta.visible,
            lineCap: style.borderCapStyle,
            lineDash: style.borderDash,
            lineDashOffset: style.borderDashOffset,
            lineJoin: style.borderJoinStyle,
            lineWidth: (borderWidth.width + borderWidth.height) / 4,
            strokeStyle: style.borderColor,
            pointStyle: pointStyle || style.pointStyle,
            rotation: style.rotation,
            textAlign: textAlign || style.textAlign,
            borderRadius: useBorderRadius && (borderRadius || style.borderRadius),
            datasetIndex: meta.index
          };
        }, this);
      }
    },
    title: {
      color: (ctx) => ctx.chart.options.color,
      display: false,
      position: "center",
      text: ""
    }
  },
  descriptors: {
    _scriptable: (name) => !name.startsWith("on"),
    labels: {
      _scriptable: (name) => ![
        "generateLabels",
        "filter",
        "sort"
      ].includes(name)
    }
  }
};
class Title extends Element {
  static {
    __name(this, "Title");
  }
  constructor(config) {
    super();
    this.chart = config.chart;
    this.options = config.options;
    this.ctx = config.ctx;
    this._padding = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.left = void 0;
    this.right = void 0;
    this.width = void 0;
    this.height = void 0;
    this.position = void 0;
    this.weight = void 0;
    this.fullSize = void 0;
  }
  update(maxWidth, maxHeight) {
    const opts = this.options;
    this.left = 0;
    this.top = 0;
    if (!opts.display) {
      this.width = this.height = this.right = this.bottom = 0;
      return;
    }
    this.width = this.right = maxWidth;
    this.height = this.bottom = maxHeight;
    const lineCount = isArray(opts.text) ? opts.text.length : 1;
    this._padding = toPadding(opts.padding);
    const textSize = lineCount * toFont(opts.font).lineHeight + this._padding.height;
    if (this.isHorizontal()) {
      this.height = textSize;
    } else {
      this.width = textSize;
    }
  }
  isHorizontal() {
    const pos = this.options.position;
    return pos === "top" || pos === "bottom";
  }
  _drawArgs(offset) {
    const { top, left, bottom, right, options } = this;
    const align = options.align;
    let rotation = 0;
    let maxWidth, titleX, titleY;
    if (this.isHorizontal()) {
      titleX = _alignStartEnd(align, left, right);
      titleY = top + offset;
      maxWidth = right - left;
    } else {
      if (options.position === "left") {
        titleX = left + offset;
        titleY = _alignStartEnd(align, bottom, top);
        rotation = PI * -0.5;
      } else {
        titleX = right - offset;
        titleY = _alignStartEnd(align, top, bottom);
        rotation = PI * 0.5;
      }
      maxWidth = bottom - top;
    }
    return {
      titleX,
      titleY,
      maxWidth,
      rotation
    };
  }
  draw() {
    const ctx = this.ctx;
    const opts = this.options;
    if (!opts.display) {
      return;
    }
    const fontOpts = toFont(opts.font);
    const lineHeight = fontOpts.lineHeight;
    const offset = lineHeight / 2 + this._padding.top;
    const { titleX, titleY, maxWidth, rotation } = this._drawArgs(offset);
    renderText(ctx, opts.text, 0, 0, fontOpts, {
      color: opts.color,
      maxWidth,
      rotation,
      textAlign: _toLeftRightCenter(opts.align),
      textBaseline: "middle",
      translation: [
        titleX,
        titleY
      ]
    });
  }
}
function createTitle(chart, titleOpts) {
  const title = new Title({
    ctx: chart.ctx,
    options: titleOpts,
    chart
  });
  layouts.configure(chart, title, titleOpts);
  layouts.addBox(chart, title);
  chart.titleBlock = title;
}
__name(createTitle, "createTitle");
var plugin_title = {
  id: "title",
  _element: Title,
  start(chart, _args, options) {
    createTitle(chart, options);
  },
  stop(chart) {
    const titleBlock = chart.titleBlock;
    layouts.removeBox(chart, titleBlock);
    delete chart.titleBlock;
  },
  beforeUpdate(chart, _args, options) {
    const title = chart.titleBlock;
    layouts.configure(chart, title, options);
    title.options = options;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "bold"
    },
    fullSize: true,
    padding: 10,
    position: "top",
    text: "",
    weight: 2e3
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const map = /* @__PURE__ */ new WeakMap();
var plugin_subtitle = {
  id: "subtitle",
  start(chart, _args, options) {
    const title = new Title({
      ctx: chart.ctx,
      options,
      chart
    });
    layouts.configure(chart, title, options);
    layouts.addBox(chart, title);
    map.set(chart, title);
  },
  stop(chart) {
    layouts.removeBox(chart, map.get(chart));
    map.delete(chart);
  },
  beforeUpdate(chart, _args, options) {
    const title = map.get(chart);
    layouts.configure(chart, title, options);
    title.options = options;
  },
  defaults: {
    align: "center",
    display: false,
    font: {
      weight: "normal"
    },
    fullSize: true,
    padding: 0,
    position: "top",
    text: "",
    weight: 1500
  },
  defaultRoutes: {
    color: "color"
  },
  descriptors: {
    _scriptable: true,
    _indexable: false
  }
};
const positioners$1 = {
  average(items) {
    if (!items.length) {
      return false;
    }
    let i, len;
    let x = 0;
    let y = 0;
    let count = 0;
    for (i = 0, len = items.length; i < len; ++i) {
      const el = items[i].element;
      if (el && el.hasValue()) {
        const pos = el.tooltipPosition();
        x += pos.x;
        y += pos.y;
        ++count;
      }
    }
    return {
      x: x / count,
      y: y / count
    };
  },
  nearest(items, eventPosition) {
    if (!items.length) {
      return false;
    }
    let x = eventPosition.x;
    let y = eventPosition.y;
    let minDistance = Number.POSITIVE_INFINITY;
    let i, len, nearestElement;
    for (i = 0, len = items.length; i < len; ++i) {
      const el = items[i].element;
      if (el && el.hasValue()) {
        const center = el.getCenterPoint();
        const d = distanceBetweenPoints(eventPosition, center);
        if (d < minDistance) {
          minDistance = d;
          nearestElement = el;
        }
      }
    }
    if (nearestElement) {
      const tp = nearestElement.tooltipPosition();
      x = tp.x;
      y = tp.y;
    }
    return {
      x,
      y
    };
  }
};
function pushOrConcat(base, toPush) {
  if (toPush) {
    if (isArray(toPush)) {
      Array.prototype.push.apply(base, toPush);
    } else {
      base.push(toPush);
    }
  }
  return base;
}
__name(pushOrConcat, "pushOrConcat");
function splitNewlines(str) {
  if ((typeof str === "string" || str instanceof String) && str.indexOf("\n") > -1) {
    return str.split("\n");
  }
  return str;
}
__name(splitNewlines, "splitNewlines");
function createTooltipItem(chart, item) {
  const { element, datasetIndex, index: index2 } = item;
  const controller = chart.getDatasetMeta(datasetIndex).controller;
  const { label, value } = controller.getLabelAndValue(index2);
  return {
    chart,
    label,
    parsed: controller.getParsed(index2),
    raw: chart.data.datasets[datasetIndex].data[index2],
    formattedValue: value,
    dataset: controller.getDataset(),
    dataIndex: index2,
    datasetIndex,
    element
  };
}
__name(createTooltipItem, "createTooltipItem");
function getTooltipSize(tooltip, options) {
  const ctx = tooltip.chart.ctx;
  const { body, footer, title } = tooltip;
  const { boxWidth, boxHeight } = options;
  const bodyFont = toFont(options.bodyFont);
  const titleFont = toFont(options.titleFont);
  const footerFont = toFont(options.footerFont);
  const titleLineCount = title.length;
  const footerLineCount = footer.length;
  const bodyLineItemCount = body.length;
  const padding = toPadding(options.padding);
  let height = padding.height;
  let width = 0;
  let combinedBodyLength = body.reduce((count, bodyItem) => count + bodyItem.before.length + bodyItem.lines.length + bodyItem.after.length, 0);
  combinedBodyLength += tooltip.beforeBody.length + tooltip.afterBody.length;
  if (titleLineCount) {
    height += titleLineCount * titleFont.lineHeight + (titleLineCount - 1) * options.titleSpacing + options.titleMarginBottom;
  }
  if (combinedBodyLength) {
    const bodyLineHeight = options.displayColors ? Math.max(boxHeight, bodyFont.lineHeight) : bodyFont.lineHeight;
    height += bodyLineItemCount * bodyLineHeight + (combinedBodyLength - bodyLineItemCount) * bodyFont.lineHeight + (combinedBodyLength - 1) * options.bodySpacing;
  }
  if (footerLineCount) {
    height += options.footerMarginTop + footerLineCount * footerFont.lineHeight + (footerLineCount - 1) * options.footerSpacing;
  }
  let widthPadding = 0;
  const maxLineWidth = /* @__PURE__ */ __name(function(line) {
    width = Math.max(width, ctx.measureText(line).width + widthPadding);
  }, "maxLineWidth");
  ctx.save();
  ctx.font = titleFont.string;
  each(tooltip.title, maxLineWidth);
  ctx.font = bodyFont.string;
  each(tooltip.beforeBody.concat(tooltip.afterBody), maxLineWidth);
  widthPadding = options.displayColors ? boxWidth + 2 + options.boxPadding : 0;
  each(body, (bodyItem) => {
    each(bodyItem.before, maxLineWidth);
    each(bodyItem.lines, maxLineWidth);
    each(bodyItem.after, maxLineWidth);
  });
  widthPadding = 0;
  ctx.font = footerFont.string;
  each(tooltip.footer, maxLineWidth);
  ctx.restore();
  width += padding.width;
  return {
    width,
    height
  };
}
__name(getTooltipSize, "getTooltipSize");
function determineYAlign(chart, size) {
  const { y, height } = size;
  if (y < height / 2) {
    return "top";
  } else if (y > chart.height - height / 2) {
    return "bottom";
  }
  return "center";
}
__name(determineYAlign, "determineYAlign");
function doesNotFitWithAlign(xAlign, chart, options, size) {
  const { x, width } = size;
  const caret = options.caretSize + options.caretPadding;
  if (xAlign === "left" && x + width + caret > chart.width) {
    return true;
  }
  if (xAlign === "right" && x - width - caret < 0) {
    return true;
  }
}
__name(doesNotFitWithAlign, "doesNotFitWithAlign");
function determineXAlign(chart, options, size, yAlign) {
  const { x, width } = size;
  const { width: chartWidth, chartArea: { left, right } } = chart;
  let xAlign = "center";
  if (yAlign === "center") {
    xAlign = x <= (left + right) / 2 ? "left" : "right";
  } else if (x <= width / 2) {
    xAlign = "left";
  } else if (x >= chartWidth - width / 2) {
    xAlign = "right";
  }
  if (doesNotFitWithAlign(xAlign, chart, options, size)) {
    xAlign = "center";
  }
  return xAlign;
}
__name(determineXAlign, "determineXAlign");
function determineAlignment(chart, options, size) {
  const yAlign = size.yAlign || options.yAlign || determineYAlign(chart, size);
  return {
    xAlign: size.xAlign || options.xAlign || determineXAlign(chart, options, size, yAlign),
    yAlign
  };
}
__name(determineAlignment, "determineAlignment");
function alignX(size, xAlign) {
  let { x, width } = size;
  if (xAlign === "right") {
    x -= width;
  } else if (xAlign === "center") {
    x -= width / 2;
  }
  return x;
}
__name(alignX, "alignX");
function alignY(size, yAlign, paddingAndSize) {
  let { y, height } = size;
  if (yAlign === "top") {
    y += paddingAndSize;
  } else if (yAlign === "bottom") {
    y -= height + paddingAndSize;
  } else {
    y -= height / 2;
  }
  return y;
}
__name(alignY, "alignY");
function getBackgroundPoint(options, size, alignment, chart) {
  const { caretSize, caretPadding, cornerRadius } = options;
  const { xAlign, yAlign } = alignment;
  const paddingAndSize = caretSize + caretPadding;
  const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
  let x = alignX(size, xAlign);
  const y = alignY(size, yAlign, paddingAndSize);
  if (yAlign === "center") {
    if (xAlign === "left") {
      x += paddingAndSize;
    } else if (xAlign === "right") {
      x -= paddingAndSize;
    }
  } else if (xAlign === "left") {
    x -= Math.max(topLeft, bottomLeft) + caretSize;
  } else if (xAlign === "right") {
    x += Math.max(topRight, bottomRight) + caretSize;
  }
  return {
    x: _limitValue(x, 0, chart.width - size.width),
    y: _limitValue(y, 0, chart.height - size.height)
  };
}
__name(getBackgroundPoint, "getBackgroundPoint");
function getAlignedX(tooltip, align, options) {
  const padding = toPadding(options.padding);
  return align === "center" ? tooltip.x + tooltip.width / 2 : align === "right" ? tooltip.x + tooltip.width - padding.right : tooltip.x + padding.left;
}
__name(getAlignedX, "getAlignedX");
function getBeforeAfterBodyLines(callback2) {
  return pushOrConcat([], splitNewlines(callback2));
}
__name(getBeforeAfterBodyLines, "getBeforeAfterBodyLines");
function createTooltipContext(parent, tooltip, tooltipItems) {
  return createContext(parent, {
    tooltip,
    tooltipItems,
    type: "tooltip"
  });
}
__name(createTooltipContext, "createTooltipContext");
function overrideCallbacks(callbacks, context) {
  const override = context && context.dataset && context.dataset.tooltip && context.dataset.tooltip.callbacks;
  return override ? callbacks.override(override) : callbacks;
}
__name(overrideCallbacks, "overrideCallbacks");
const defaultCallbacks = {
  beforeTitle: noop,
  title(tooltipItems) {
    if (tooltipItems.length > 0) {
      const item = tooltipItems[0];
      const labels = item.chart.data.labels;
      const labelCount = labels ? labels.length : 0;
      if (this && this.options && this.options.mode === "dataset") {
        return item.dataset.label || "";
      } else if (item.label) {
        return item.label;
      } else if (labelCount > 0 && item.dataIndex < labelCount) {
        return labels[item.dataIndex];
      }
    }
    return "";
  },
  afterTitle: noop,
  beforeBody: noop,
  beforeLabel: noop,
  label(tooltipItem) {
    if (this && this.options && this.options.mode === "dataset") {
      return tooltipItem.label + ": " + tooltipItem.formattedValue || tooltipItem.formattedValue;
    }
    let label = tooltipItem.dataset.label || "";
    if (label) {
      label += ": ";
    }
    const value = tooltipItem.formattedValue;
    if (!isNullOrUndef(value)) {
      label += value;
    }
    return label;
  },
  labelColor(tooltipItem) {
    const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    const options = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      borderColor: options.borderColor,
      backgroundColor: options.backgroundColor,
      borderWidth: options.borderWidth,
      borderDash: options.borderDash,
      borderDashOffset: options.borderDashOffset,
      borderRadius: 0
    };
  },
  labelTextColor() {
    return this.options.bodyColor;
  },
  labelPointStyle(tooltipItem) {
    const meta = tooltipItem.chart.getDatasetMeta(tooltipItem.datasetIndex);
    const options = meta.controller.getStyle(tooltipItem.dataIndex);
    return {
      pointStyle: options.pointStyle,
      rotation: options.rotation
    };
  },
  afterLabel: noop,
  afterBody: noop,
  beforeFooter: noop,
  footer: noop,
  afterFooter: noop
};
function invokeCallbackWithFallback(callbacks, name, ctx, arg) {
  const result = callbacks[name].call(ctx, arg);
  if (typeof result === "undefined") {
    return defaultCallbacks[name].call(ctx, arg);
  }
  return result;
}
__name(invokeCallbackWithFallback, "invokeCallbackWithFallback");
class Tooltip extends Element {
  static {
    __name(this, "Tooltip");
  }
  static positioners = positioners$1;
  constructor(config) {
    super();
    this.opacity = 0;
    this._active = [];
    this._eventPosition = void 0;
    this._size = void 0;
    this._cachedAnimations = void 0;
    this._tooltipItems = [];
    this.$animations = void 0;
    this.$context = void 0;
    this.chart = config.chart;
    this.options = config.options;
    this.dataPoints = void 0;
    this.title = void 0;
    this.beforeBody = void 0;
    this.body = void 0;
    this.afterBody = void 0;
    this.footer = void 0;
    this.xAlign = void 0;
    this.yAlign = void 0;
    this.x = void 0;
    this.y = void 0;
    this.height = void 0;
    this.width = void 0;
    this.caretX = void 0;
    this.caretY = void 0;
    this.labelColors = void 0;
    this.labelPointStyles = void 0;
    this.labelTextColors = void 0;
  }
  initialize(options) {
    this.options = options;
    this._cachedAnimations = void 0;
    this.$context = void 0;
  }
  _resolveAnimations() {
    const cached = this._cachedAnimations;
    if (cached) {
      return cached;
    }
    const chart = this.chart;
    const options = this.options.setContext(this.getContext());
    const opts = options.enabled && chart.options.animation && options.animations;
    const animations = new Animations(this.chart, opts);
    if (opts._cacheable) {
      this._cachedAnimations = Object.freeze(animations);
    }
    return animations;
  }
  getContext() {
    return this.$context || (this.$context = createTooltipContext(this.chart.getContext(), this, this._tooltipItems));
  }
  getTitle(context, options) {
    const { callbacks } = options;
    const beforeTitle = invokeCallbackWithFallback(callbacks, "beforeTitle", this, context);
    const title = invokeCallbackWithFallback(callbacks, "title", this, context);
    const afterTitle = invokeCallbackWithFallback(callbacks, "afterTitle", this, context);
    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeTitle));
    lines = pushOrConcat(lines, splitNewlines(title));
    lines = pushOrConcat(lines, splitNewlines(afterTitle));
    return lines;
  }
  getBeforeBody(tooltipItems, options) {
    return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, "beforeBody", this, tooltipItems));
  }
  getBody(tooltipItems, options) {
    const { callbacks } = options;
    const bodyItems = [];
    each(tooltipItems, (context) => {
      const bodyItem = {
        before: [],
        lines: [],
        after: []
      };
      const scoped = overrideCallbacks(callbacks, context);
      pushOrConcat(bodyItem.before, splitNewlines(invokeCallbackWithFallback(scoped, "beforeLabel", this, context)));
      pushOrConcat(bodyItem.lines, invokeCallbackWithFallback(scoped, "label", this, context));
      pushOrConcat(bodyItem.after, splitNewlines(invokeCallbackWithFallback(scoped, "afterLabel", this, context)));
      bodyItems.push(bodyItem);
    });
    return bodyItems;
  }
  getAfterBody(tooltipItems, options) {
    return getBeforeAfterBodyLines(invokeCallbackWithFallback(options.callbacks, "afterBody", this, tooltipItems));
  }
  getFooter(tooltipItems, options) {
    const { callbacks } = options;
    const beforeFooter = invokeCallbackWithFallback(callbacks, "beforeFooter", this, tooltipItems);
    const footer = invokeCallbackWithFallback(callbacks, "footer", this, tooltipItems);
    const afterFooter = invokeCallbackWithFallback(callbacks, "afterFooter", this, tooltipItems);
    let lines = [];
    lines = pushOrConcat(lines, splitNewlines(beforeFooter));
    lines = pushOrConcat(lines, splitNewlines(footer));
    lines = pushOrConcat(lines, splitNewlines(afterFooter));
    return lines;
  }
  _createItems(options) {
    const active = this._active;
    const data = this.chart.data;
    const labelColors = [];
    const labelPointStyles = [];
    const labelTextColors = [];
    let tooltipItems = [];
    let i, len;
    for (i = 0, len = active.length; i < len; ++i) {
      tooltipItems.push(createTooltipItem(this.chart, active[i]));
    }
    if (options.filter) {
      tooltipItems = tooltipItems.filter((element, index2, array) => options.filter(element, index2, array, data));
    }
    if (options.itemSort) {
      tooltipItems = tooltipItems.sort((a, b) => options.itemSort(a, b, data));
    }
    each(tooltipItems, (context) => {
      const scoped = overrideCallbacks(options.callbacks, context);
      labelColors.push(invokeCallbackWithFallback(scoped, "labelColor", this, context));
      labelPointStyles.push(invokeCallbackWithFallback(scoped, "labelPointStyle", this, context));
      labelTextColors.push(invokeCallbackWithFallback(scoped, "labelTextColor", this, context));
    });
    this.labelColors = labelColors;
    this.labelPointStyles = labelPointStyles;
    this.labelTextColors = labelTextColors;
    this.dataPoints = tooltipItems;
    return tooltipItems;
  }
  update(changed, replay) {
    const options = this.options.setContext(this.getContext());
    const active = this._active;
    let properties;
    let tooltipItems = [];
    if (!active.length) {
      if (this.opacity !== 0) {
        properties = {
          opacity: 0
        };
      }
    } else {
      const position = positioners$1[options.position].call(this, active, this._eventPosition);
      tooltipItems = this._createItems(options);
      this.title = this.getTitle(tooltipItems, options);
      this.beforeBody = this.getBeforeBody(tooltipItems, options);
      this.body = this.getBody(tooltipItems, options);
      this.afterBody = this.getAfterBody(tooltipItems, options);
      this.footer = this.getFooter(tooltipItems, options);
      const size = this._size = getTooltipSize(this, options);
      const positionAndSize = Object.assign({}, position, size);
      const alignment = determineAlignment(this.chart, options, positionAndSize);
      const backgroundPoint = getBackgroundPoint(options, positionAndSize, alignment, this.chart);
      this.xAlign = alignment.xAlign;
      this.yAlign = alignment.yAlign;
      properties = {
        opacity: 1,
        x: backgroundPoint.x,
        y: backgroundPoint.y,
        width: size.width,
        height: size.height,
        caretX: position.x,
        caretY: position.y
      };
    }
    this._tooltipItems = tooltipItems;
    this.$context = void 0;
    if (properties) {
      this._resolveAnimations().update(this, properties);
    }
    if (changed && options.external) {
      options.external.call(this, {
        chart: this.chart,
        tooltip: this,
        replay
      });
    }
  }
  drawCaret(tooltipPoint, ctx, size, options) {
    const caretPosition = this.getCaretPosition(tooltipPoint, size, options);
    ctx.lineTo(caretPosition.x1, caretPosition.y1);
    ctx.lineTo(caretPosition.x2, caretPosition.y2);
    ctx.lineTo(caretPosition.x3, caretPosition.y3);
  }
  getCaretPosition(tooltipPoint, size, options) {
    const { xAlign, yAlign } = this;
    const { caretSize, cornerRadius } = options;
    const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(cornerRadius);
    const { x: ptX, y: ptY } = tooltipPoint;
    const { width, height } = size;
    let x1, x2, x3, y1, y2, y3;
    if (yAlign === "center") {
      y2 = ptY + height / 2;
      if (xAlign === "left") {
        x1 = ptX;
        x2 = x1 - caretSize;
        y1 = y2 + caretSize;
        y3 = y2 - caretSize;
      } else {
        x1 = ptX + width;
        x2 = x1 + caretSize;
        y1 = y2 - caretSize;
        y3 = y2 + caretSize;
      }
      x3 = x1;
    } else {
      if (xAlign === "left") {
        x2 = ptX + Math.max(topLeft, bottomLeft) + caretSize;
      } else if (xAlign === "right") {
        x2 = ptX + width - Math.max(topRight, bottomRight) - caretSize;
      } else {
        x2 = this.caretX;
      }
      if (yAlign === "top") {
        y1 = ptY;
        y2 = y1 - caretSize;
        x1 = x2 - caretSize;
        x3 = x2 + caretSize;
      } else {
        y1 = ptY + height;
        y2 = y1 + caretSize;
        x1 = x2 + caretSize;
        x3 = x2 - caretSize;
      }
      y3 = y1;
    }
    return {
      x1,
      x2,
      x3,
      y1,
      y2,
      y3
    };
  }
  drawTitle(pt, ctx, options) {
    const title = this.title;
    const length = title.length;
    let titleFont, titleSpacing, i;
    if (length) {
      const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
      pt.x = getAlignedX(this, options.titleAlign, options);
      ctx.textAlign = rtlHelper.textAlign(options.titleAlign);
      ctx.textBaseline = "middle";
      titleFont = toFont(options.titleFont);
      titleSpacing = options.titleSpacing;
      ctx.fillStyle = options.titleColor;
      ctx.font = titleFont.string;
      for (i = 0; i < length; ++i) {
        ctx.fillText(title[i], rtlHelper.x(pt.x), pt.y + titleFont.lineHeight / 2);
        pt.y += titleFont.lineHeight + titleSpacing;
        if (i + 1 === length) {
          pt.y += options.titleMarginBottom - titleSpacing;
        }
      }
    }
  }
  _drawColorBox(ctx, pt, i, rtlHelper, options) {
    const labelColor = this.labelColors[i];
    const labelPointStyle = this.labelPointStyles[i];
    const { boxHeight, boxWidth } = options;
    const bodyFont = toFont(options.bodyFont);
    const colorX = getAlignedX(this, "left", options);
    const rtlColorX = rtlHelper.x(colorX);
    const yOffSet = boxHeight < bodyFont.lineHeight ? (bodyFont.lineHeight - boxHeight) / 2 : 0;
    const colorY = pt.y + yOffSet;
    if (options.usePointStyle) {
      const drawOptions = {
        radius: Math.min(boxWidth, boxHeight) / 2,
        pointStyle: labelPointStyle.pointStyle,
        rotation: labelPointStyle.rotation,
        borderWidth: 1
      };
      const centerX = rtlHelper.leftForLtr(rtlColorX, boxWidth) + boxWidth / 2;
      const centerY = colorY + boxHeight / 2;
      ctx.strokeStyle = options.multiKeyBackground;
      ctx.fillStyle = options.multiKeyBackground;
      drawPoint(ctx, drawOptions, centerX, centerY);
      ctx.strokeStyle = labelColor.borderColor;
      ctx.fillStyle = labelColor.backgroundColor;
      drawPoint(ctx, drawOptions, centerX, centerY);
    } else {
      ctx.lineWidth = isObject(labelColor.borderWidth) ? Math.max(...Object.values(labelColor.borderWidth)) : labelColor.borderWidth || 1;
      ctx.strokeStyle = labelColor.borderColor;
      ctx.setLineDash(labelColor.borderDash || []);
      ctx.lineDashOffset = labelColor.borderDashOffset || 0;
      const outerX = rtlHelper.leftForLtr(rtlColorX, boxWidth);
      const innerX = rtlHelper.leftForLtr(rtlHelper.xPlus(rtlColorX, 1), boxWidth - 2);
      const borderRadius = toTRBLCorners(labelColor.borderRadius);
      if (Object.values(borderRadius).some((v) => v !== 0)) {
        ctx.beginPath();
        ctx.fillStyle = options.multiKeyBackground;
        addRoundedRectPath(ctx, {
          x: outerX,
          y: colorY,
          w: boxWidth,
          h: boxHeight,
          radius: borderRadius
        });
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = labelColor.backgroundColor;
        ctx.beginPath();
        addRoundedRectPath(ctx, {
          x: innerX,
          y: colorY + 1,
          w: boxWidth - 2,
          h: boxHeight - 2,
          radius: borderRadius
        });
        ctx.fill();
      } else {
        ctx.fillStyle = options.multiKeyBackground;
        ctx.fillRect(outerX, colorY, boxWidth, boxHeight);
        ctx.strokeRect(outerX, colorY, boxWidth, boxHeight);
        ctx.fillStyle = labelColor.backgroundColor;
        ctx.fillRect(innerX, colorY + 1, boxWidth - 2, boxHeight - 2);
      }
    }
    ctx.fillStyle = this.labelTextColors[i];
  }
  drawBody(pt, ctx, options) {
    const { body } = this;
    const { bodySpacing, bodyAlign, displayColors, boxHeight, boxWidth, boxPadding } = options;
    const bodyFont = toFont(options.bodyFont);
    let bodyLineHeight = bodyFont.lineHeight;
    let xLinePadding = 0;
    const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
    const fillLineOfText = /* @__PURE__ */ __name(function(line) {
      ctx.fillText(line, rtlHelper.x(pt.x + xLinePadding), pt.y + bodyLineHeight / 2);
      pt.y += bodyLineHeight + bodySpacing;
    }, "fillLineOfText");
    const bodyAlignForCalculation = rtlHelper.textAlign(bodyAlign);
    let bodyItem, textColor, lines, i, j, ilen, jlen;
    ctx.textAlign = bodyAlign;
    ctx.textBaseline = "middle";
    ctx.font = bodyFont.string;
    pt.x = getAlignedX(this, bodyAlignForCalculation, options);
    ctx.fillStyle = options.bodyColor;
    each(this.beforeBody, fillLineOfText);
    xLinePadding = displayColors && bodyAlignForCalculation !== "right" ? bodyAlign === "center" ? boxWidth / 2 + boxPadding : boxWidth + 2 + boxPadding : 0;
    for (i = 0, ilen = body.length; i < ilen; ++i) {
      bodyItem = body[i];
      textColor = this.labelTextColors[i];
      ctx.fillStyle = textColor;
      each(bodyItem.before, fillLineOfText);
      lines = bodyItem.lines;
      if (displayColors && lines.length) {
        this._drawColorBox(ctx, pt, i, rtlHelper, options);
        bodyLineHeight = Math.max(bodyFont.lineHeight, boxHeight);
      }
      for (j = 0, jlen = lines.length; j < jlen; ++j) {
        fillLineOfText(lines[j]);
        bodyLineHeight = bodyFont.lineHeight;
      }
      each(bodyItem.after, fillLineOfText);
    }
    xLinePadding = 0;
    bodyLineHeight = bodyFont.lineHeight;
    each(this.afterBody, fillLineOfText);
    pt.y -= bodySpacing;
  }
  drawFooter(pt, ctx, options) {
    const footer = this.footer;
    const length = footer.length;
    let footerFont, i;
    if (length) {
      const rtlHelper = getRtlAdapter(options.rtl, this.x, this.width);
      pt.x = getAlignedX(this, options.footerAlign, options);
      pt.y += options.footerMarginTop;
      ctx.textAlign = rtlHelper.textAlign(options.footerAlign);
      ctx.textBaseline = "middle";
      footerFont = toFont(options.footerFont);
      ctx.fillStyle = options.footerColor;
      ctx.font = footerFont.string;
      for (i = 0; i < length; ++i) {
        ctx.fillText(footer[i], rtlHelper.x(pt.x), pt.y + footerFont.lineHeight / 2);
        pt.y += footerFont.lineHeight + options.footerSpacing;
      }
    }
  }
  drawBackground(pt, ctx, tooltipSize, options) {
    const { xAlign, yAlign } = this;
    const { x, y } = pt;
    const { width, height } = tooltipSize;
    const { topLeft, topRight, bottomLeft, bottomRight } = toTRBLCorners(options.cornerRadius);
    ctx.fillStyle = options.backgroundColor;
    ctx.strokeStyle = options.borderColor;
    ctx.lineWidth = options.borderWidth;
    ctx.beginPath();
    ctx.moveTo(x + topLeft, y);
    if (yAlign === "top") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + width - topRight, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + topRight);
    if (yAlign === "center" && xAlign === "right") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + width, y + height - bottomRight);
    ctx.quadraticCurveTo(x + width, y + height, x + width - bottomRight, y + height);
    if (yAlign === "bottom") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x + bottomLeft, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - bottomLeft);
    if (yAlign === "center" && xAlign === "left") {
      this.drawCaret(pt, ctx, tooltipSize, options);
    }
    ctx.lineTo(x, y + topLeft);
    ctx.quadraticCurveTo(x, y, x + topLeft, y);
    ctx.closePath();
    ctx.fill();
    if (options.borderWidth > 0) {
      ctx.stroke();
    }
  }
  _updateAnimationTarget(options) {
    const chart = this.chart;
    const anims = this.$animations;
    const animX = anims && anims.x;
    const animY = anims && anims.y;
    if (animX || animY) {
      const position = positioners$1[options.position].call(this, this._active, this._eventPosition);
      if (!position) {
        return;
      }
      const size = this._size = getTooltipSize(this, options);
      const positionAndSize = Object.assign({}, position, this._size);
      const alignment = determineAlignment(chart, options, positionAndSize);
      const point = getBackgroundPoint(options, positionAndSize, alignment, chart);
      if (animX._to !== point.x || animY._to !== point.y) {
        this.xAlign = alignment.xAlign;
        this.yAlign = alignment.yAlign;
        this.width = size.width;
        this.height = size.height;
        this.caretX = position.x;
        this.caretY = position.y;
        this._resolveAnimations().update(this, point);
      }
    }
  }
  _willRender() {
    return !!this.opacity;
  }
  draw(ctx) {
    const options = this.options.setContext(this.getContext());
    let opacity = this.opacity;
    if (!opacity) {
      return;
    }
    this._updateAnimationTarget(options);
    const tooltipSize = {
      width: this.width,
      height: this.height
    };
    const pt = {
      x: this.x,
      y: this.y
    };
    opacity = Math.abs(opacity) < 1e-3 ? 0 : opacity;
    const padding = toPadding(options.padding);
    const hasTooltipContent = this.title.length || this.beforeBody.length || this.body.length || this.afterBody.length || this.footer.length;
    if (options.enabled && hasTooltipContent) {
      ctx.save();
      ctx.globalAlpha = opacity;
      this.drawBackground(pt, ctx, tooltipSize, options);
      overrideTextDirection(ctx, options.textDirection);
      pt.y += padding.top;
      this.drawTitle(pt, ctx, options);
      this.drawBody(pt, ctx, options);
      this.drawFooter(pt, ctx, options);
      restoreTextDirection(ctx, options.textDirection);
      ctx.restore();
    }
  }
  getActiveElements() {
    return this._active || [];
  }
  setActiveElements(activeElements, eventPosition) {
    const lastActive = this._active;
    const active = activeElements.map(({ datasetIndex, index: index2 }) => {
      const meta = this.chart.getDatasetMeta(datasetIndex);
      if (!meta) {
        throw new Error("Cannot find a dataset at index " + datasetIndex);
      }
      return {
        datasetIndex,
        element: meta.data[index2],
        index: index2
      };
    });
    const changed = !_elementsEqual(lastActive, active);
    const positionChanged = this._positionChanged(active, eventPosition);
    if (changed || positionChanged) {
      this._active = active;
      this._eventPosition = eventPosition;
      this._ignoreReplayEvents = true;
      this.update(true);
    }
  }
  handleEvent(e, replay, inChartArea = true) {
    if (replay && this._ignoreReplayEvents) {
      return false;
    }
    this._ignoreReplayEvents = false;
    const options = this.options;
    const lastActive = this._active || [];
    const active = this._getActiveElements(e, lastActive, replay, inChartArea);
    const positionChanged = this._positionChanged(active, e);
    const changed = replay || !_elementsEqual(active, lastActive) || positionChanged;
    if (changed) {
      this._active = active;
      if (options.enabled || options.external) {
        this._eventPosition = {
          x: e.x,
          y: e.y
        };
        this.update(true, replay);
      }
    }
    return changed;
  }
  _getActiveElements(e, lastActive, replay, inChartArea) {
    const options = this.options;
    if (e.type === "mouseout") {
      return [];
    }
    if (!inChartArea) {
      return lastActive.filter((i) => this.chart.data.datasets[i.datasetIndex] && this.chart.getDatasetMeta(i.datasetIndex).controller.getParsed(i.index) !== void 0);
    }
    const active = this.chart.getElementsAtEventForMode(e, options.mode, options, replay);
    if (options.reverse) {
      active.reverse();
    }
    return active;
  }
  _positionChanged(active, e) {
    const { caretX, caretY, options } = this;
    const position = positioners$1[options.position].call(this, active, e);
    return position !== false && (caretX !== position.x || caretY !== position.y);
  }
}
var plugin_tooltip = {
  id: "tooltip",
  _element: Tooltip,
  positioners: positioners$1,
  afterInit(chart, _args, options) {
    if (options) {
      chart.tooltip = new Tooltip({
        chart,
        options
      });
    }
  },
  beforeUpdate(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },
  reset(chart, _args, options) {
    if (chart.tooltip) {
      chart.tooltip.initialize(options);
    }
  },
  afterDraw(chart) {
    const tooltip = chart.tooltip;
    if (tooltip && tooltip._willRender()) {
      const args = {
        tooltip
      };
      if (chart.notifyPlugins("beforeTooltipDraw", {
        ...args,
        cancelable: true
      }) === false) {
        return;
      }
      tooltip.draw(chart.ctx);
      chart.notifyPlugins("afterTooltipDraw", args);
    }
  },
  afterEvent(chart, args) {
    if (chart.tooltip) {
      const useFinalPosition = args.replay;
      if (chart.tooltip.handleEvent(args.event, useFinalPosition, args.inChartArea)) {
        args.changed = true;
      }
    }
  },
  defaults: {
    enabled: true,
    external: null,
    position: "average",
    backgroundColor: "rgba(0,0,0,0.8)",
    titleColor: "#fff",
    titleFont: {
      weight: "bold"
    },
    titleSpacing: 2,
    titleMarginBottom: 6,
    titleAlign: "left",
    bodyColor: "#fff",
    bodySpacing: 2,
    bodyFont: {},
    bodyAlign: "left",
    footerColor: "#fff",
    footerSpacing: 2,
    footerMarginTop: 6,
    footerFont: {
      weight: "bold"
    },
    footerAlign: "left",
    padding: 6,
    caretPadding: 2,
    caretSize: 5,
    cornerRadius: 6,
    boxHeight: (ctx, opts) => opts.bodyFont.size,
    boxWidth: (ctx, opts) => opts.bodyFont.size,
    multiKeyBackground: "#fff",
    displayColors: true,
    boxPadding: 0,
    borderColor: "rgba(0,0,0,0)",
    borderWidth: 0,
    animation: {
      duration: 400,
      easing: "easeOutQuart"
    },
    animations: {
      numbers: {
        type: "number",
        properties: [
          "x",
          "y",
          "width",
          "height",
          "caretX",
          "caretY"
        ]
      },
      opacity: {
        easing: "linear",
        duration: 200
      }
    },
    callbacks: defaultCallbacks
  },
  defaultRoutes: {
    bodyFont: "font",
    footerFont: "font",
    titleFont: "font"
  },
  descriptors: {
    _scriptable: (name) => name !== "filter" && name !== "itemSort" && name !== "external",
    _indexable: false,
    callbacks: {
      _scriptable: false,
      _indexable: false
    },
    animation: {
      _fallback: false
    },
    animations: {
      _fallback: "animation"
    }
  },
  additionalOptionScopes: [
    "interaction"
  ]
};
var plugins = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Colors: plugin_colors,
  Decimation: plugin_decimation,
  Filler: index,
  Legend: plugin_legend,
  SubTitle: plugin_subtitle,
  Title: plugin_title,
  Tooltip: plugin_tooltip
});
const addIfString = /* @__PURE__ */ __name((labels, raw, index2, addedLabels) => {
  if (typeof raw === "string") {
    index2 = labels.push(raw) - 1;
    addedLabels.unshift({
      index: index2,
      label: raw
    });
  } else if (isNaN(raw)) {
    index2 = null;
  }
  return index2;
}, "addIfString");
function findOrAddLabel(labels, raw, index2, addedLabels) {
  const first = labels.indexOf(raw);
  if (first === -1) {
    return addIfString(labels, raw, index2, addedLabels);
  }
  const last = labels.lastIndexOf(raw);
  return first !== last ? index2 : first;
}
__name(findOrAddLabel, "findOrAddLabel");
const validIndex = /* @__PURE__ */ __name((index2, max) => index2 === null ? null : _limitValue(Math.round(index2), 0, max), "validIndex");
function _getLabelForValue(value) {
  const labels = this.getLabels();
  if (value >= 0 && value < labels.length) {
    return labels[value];
  }
  return value;
}
__name(_getLabelForValue, "_getLabelForValue");
class CategoryScale extends Scale {
  static {
    __name(this, "CategoryScale");
  }
  static id = "category";
  static defaults = {
    ticks: {
      callback: _getLabelForValue
    }
  };
  constructor(cfg) {
    super(cfg);
    this._startValue = void 0;
    this._valueRange = 0;
    this._addedLabels = [];
  }
  init(scaleOptions) {
    const added = this._addedLabels;
    if (added.length) {
      const labels = this.getLabels();
      for (const { index: index2, label } of added) {
        if (labels[index2] === label) {
          labels.splice(index2, 1);
        }
      }
      this._addedLabels = [];
    }
    super.init(scaleOptions);
  }
  parse(raw, index2) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    const labels = this.getLabels();
    index2 = isFinite(index2) && labels[index2] === raw ? index2 : findOrAddLabel(labels, raw, valueOrDefault(index2, raw), this._addedLabels);
    return validIndex(index2, labels.length - 1);
  }
  determineDataLimits() {
    const { minDefined, maxDefined } = this.getUserBounds();
    let { min, max } = this.getMinMax(true);
    if (this.options.bounds === "ticks") {
      if (!minDefined) {
        min = 0;
      }
      if (!maxDefined) {
        max = this.getLabels().length - 1;
      }
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const min = this.min;
    const max = this.max;
    const offset = this.options.offset;
    const ticks = [];
    let labels = this.getLabels();
    labels = min === 0 && max === labels.length - 1 ? labels : labels.slice(min, max + 1);
    this._valueRange = Math.max(labels.length - (offset ? 0 : 1), 1);
    this._startValue = this.min - (offset ? 0.5 : 0);
    for (let value = min; value <= max; value++) {
      ticks.push({
        value
      });
    }
    return ticks;
  }
  getLabelForValue(value) {
    return _getLabelForValue.call(this, value);
  }
  configure() {
    super.configure();
    if (!this.isHorizontal()) {
      this._reversePixels = !this._reversePixels;
    }
  }
  getPixelForValue(value) {
    if (typeof value !== "number") {
      value = this.parse(value);
    }
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getPixelForTick(index2) {
    const ticks = this.ticks;
    if (index2 < 0 || index2 > ticks.length - 1) {
      return null;
    }
    return this.getPixelForValue(ticks[index2].value);
  }
  getValueForPixel(pixel) {
    return Math.round(this._startValue + this.getDecimalForPixel(pixel) * this._valueRange);
  }
  getBasePixel() {
    return this.bottom;
  }
}
function generateTicks$1(generationOptions, dataRange) {
  const ticks = [];
  const MIN_SPACING = 1e-14;
  const { bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds } = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const { min: rmin, max: rmax } = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [
      {
        value: rmin
      },
      {
        value: rmax
      }
    ];
  }
  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
  }
  if (!isNullOrUndef(precision)) {
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }
  if (bounds === "ticks") {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }
  if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1e3)) {
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    numSpaces = (niceMax - niceMin) / spacing;
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1e3)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }
  const decimalPlaces = Math.max(_decimalPlaces(spacing), _decimalPlaces(niceMin));
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({
        value: min
      });
      if (niceMin < min) {
        j++;
      }
      if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }
  for (; j < numSpaces; ++j) {
    const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
    if (maxDefined && tickValue > max) {
      break;
    }
    ticks.push({
      value: tickValue
    });
  }
  if (maxDefined && includeBounds && niceMax !== max) {
    if (ticks.length && almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({
        value: max
      });
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({
      value: niceMax
    });
  }
  return ticks;
}
__name(generateTicks$1, "generateTicks$1");
function relativeLabelSize(value, minSpacing, { horizontal, minRotation }) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 1e-3;
  const length = 0.75 * minSpacing * ("" + value).length;
  return Math.min(minSpacing / ratio, length);
}
__name(relativeLabelSize, "relativeLabelSize");
class LinearScaleBase extends Scale {
  static {
    __name(this, "LinearScaleBase");
  }
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._endValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index2) {
    if (isNullOrUndef(raw)) {
      return null;
    }
    if ((typeof raw === "number" || raw instanceof Number) && !isFinite(+raw)) {
      return null;
    }
    return +raw;
  }
  handleTickRangeOptions() {
    const { beginAtZero } = this.options;
    const { minDefined, maxDefined } = this.getUserBounds();
    let { min, max } = this;
    const setMin = /* @__PURE__ */ __name((v) => min = minDefined ? min : v, "setMin");
    const setMax = /* @__PURE__ */ __name((v) => max = maxDefined ? max : v, "setMax");
    if (beginAtZero) {
      const minSign = sign(min);
      const maxSign = sign(max);
      if (minSign < 0 && maxSign < 0) {
        setMax(0);
      } else if (minSign > 0 && maxSign > 0) {
        setMin(0);
      }
    }
    if (min === max) {
      let offset = max === 0 ? 1 : Math.abs(max * 0.05);
      setMax(max + offset);
      if (!beginAtZero) {
        setMin(min - offset);
      }
    }
    this.min = min;
    this.max = max;
  }
  getTickLimit() {
    const tickOpts = this.options.ticks;
    let { maxTicksLimit, stepSize } = tickOpts;
    let maxTicks;
    if (stepSize) {
      maxTicks = Math.ceil(this.max / stepSize) - Math.floor(this.min / stepSize) + 1;
      if (maxTicks > 1e3) {
        console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
        maxTicks = 1e3;
      }
    } else {
      maxTicks = this.computeTickLimit();
      maxTicksLimit = maxTicksLimit || 11;
    }
    if (maxTicksLimit) {
      maxTicks = Math.min(maxTicksLimit, maxTicks);
    }
    return maxTicks;
  }
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }
  buildTicks() {
    const opts = this.options;
    const tickOpts = opts.ticks;
    let maxTicks = this.getTickLimit();
    maxTicks = Math.max(2, maxTicks);
    const numericGeneratorOptions = {
      maxTicks,
      bounds: opts.bounds,
      min: opts.min,
      max: opts.max,
      precision: tickOpts.precision,
      step: tickOpts.stepSize,
      count: tickOpts.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: tickOpts.minRotation || 0,
      includeBounds: tickOpts.includeBounds !== false
    };
    const dataRange = this._range || this;
    const ticks = generateTicks$1(numericGeneratorOptions, dataRange);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  configure() {
    const ticks = this.ticks;
    let start = this.min;
    let end = this.max;
    super.configure();
    if (this.options.offset && ticks.length) {
      const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
      start -= offset;
      end += offset;
    }
    this._startValue = start;
    this._endValue = end;
    this._valueRange = end - start;
  }
  getLabelForValue(value) {
    return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
}
class LinearScale extends LinearScaleBase {
  static {
    __name(this, "LinearScale");
  }
  static id = "linear";
  static defaults = {
    ticks: {
      callback: Ticks.formatters.numeric
    }
  };
  determineDataLimits() {
    const { min, max } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? min : 0;
    this.max = isNumberFinite(max) ? max : 1;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    const horizontal = this.isHorizontal();
    const length = horizontal ? this.width : this.height;
    const minRotation = toRadians(this.options.ticks.minRotation);
    const ratio = (horizontal ? Math.sin(minRotation) : Math.cos(minRotation)) || 1e-3;
    const tickFont = this._resolveTickFontOptions(0);
    return Math.ceil(length / Math.min(40, tickFont.lineHeight / ratio));
  }
  getPixelForValue(value) {
    return value === null ? NaN : this.getPixelForDecimal((value - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
  }
}
const log10Floor = /* @__PURE__ */ __name((v) => Math.floor(log10(v)), "log10Floor");
const changeExponent = /* @__PURE__ */ __name((v, m) => Math.pow(10, log10Floor(v) + m), "changeExponent");
function isMajor(tickVal) {
  const remain = tickVal / Math.pow(10, log10Floor(tickVal));
  return remain === 1;
}
__name(isMajor, "isMajor");
function steps(min, max, rangeExp) {
  const rangeStep = Math.pow(10, rangeExp);
  const start = Math.floor(min / rangeStep);
  const end = Math.ceil(max / rangeStep);
  return end - start;
}
__name(steps, "steps");
function startExp(min, max) {
  const range = max - min;
  let rangeExp = log10Floor(range);
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++;
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--;
  }
  return Math.min(rangeExp, log10Floor(min));
}
__name(startExp, "startExp");
function generateTicks(generationOptions, { min, max }) {
  min = finiteOrDefault(generationOptions.min, min);
  const ticks = [];
  const minExp = log10Floor(min);
  let exp = startExp(min, max);
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  const stepSize = Math.pow(10, exp);
  const base = minExp > exp ? Math.pow(10, minExp) : 0;
  const start = Math.round((min - base) * precision) / precision;
  const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
  let significand = Math.floor((start - offset) / Math.pow(10, exp));
  let value = finiteOrDefault(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
  while (value < max) {
    ticks.push({
      value,
      major: isMajor(value),
      significand
    });
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20;
    } else {
      significand++;
    }
    if (significand >= 20) {
      exp++;
      significand = 2;
      precision = exp >= 0 ? 1 : precision;
    }
    value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
  }
  const lastTick = finiteOrDefault(generationOptions.max, value);
  ticks.push({
    value: lastTick,
    major: isMajor(lastTick),
    significand
  });
  return ticks;
}
__name(generateTicks, "generateTicks");
class LogarithmicScale extends Scale {
  static {
    __name(this, "LogarithmicScale");
  }
  static id = "logarithmic";
  static defaults = {
    ticks: {
      callback: Ticks.formatters.logarithmic,
      major: {
        enabled: true
      }
    }
  };
  constructor(cfg) {
    super(cfg);
    this.start = void 0;
    this.end = void 0;
    this._startValue = void 0;
    this._valueRange = 0;
  }
  parse(raw, index2) {
    const value = LinearScaleBase.prototype.parse.apply(this, [
      raw,
      index2
    ]);
    if (value === 0) {
      this._zero = true;
      return void 0;
    }
    return isNumberFinite(value) && value > 0 ? value : null;
  }
  determineDataLimits() {
    const { min, max } = this.getMinMax(true);
    this.min = isNumberFinite(min) ? Math.max(0, min) : null;
    this.max = isNumberFinite(max) ? Math.max(0, max) : null;
    if (this.options.beginAtZero) {
      this._zero = true;
    }
    if (this._zero && this.min !== this._suggestedMin && !isNumberFinite(this._userMin)) {
      this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
    }
    this.handleTickRangeOptions();
  }
  handleTickRangeOptions() {
    const { minDefined, maxDefined } = this.getUserBounds();
    let min = this.min;
    let max = this.max;
    const setMin = /* @__PURE__ */ __name((v) => min = minDefined ? min : v, "setMin");
    const setMax = /* @__PURE__ */ __name((v) => max = maxDefined ? max : v, "setMax");
    if (min === max) {
      if (min <= 0) {
        setMin(1);
        setMax(10);
      } else {
        setMin(changeExponent(min, -1));
        setMax(changeExponent(max, 1));
      }
    }
    if (min <= 0) {
      setMin(changeExponent(max, -1));
    }
    if (max <= 0) {
      setMax(changeExponent(min, 1));
    }
    this.min = min;
    this.max = max;
  }
  buildTicks() {
    const opts = this.options;
    const generationOptions = {
      min: this._userMin,
      max: this._userMax
    };
    const ticks = generateTicks(generationOptions, this);
    if (opts.bounds === "ticks") {
      _setMinAndMaxByKey(ticks, this, "value");
    }
    if (opts.reverse) {
      ticks.reverse();
      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }
    return ticks;
  }
  getLabelForValue(value) {
    return value === void 0 ? "0" : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
  configure() {
    const start = this.min;
    super.configure();
    this._startValue = log10(start);
    this._valueRange = log10(this.max) - log10(start);
  }
  getPixelForValue(value) {
    if (value === void 0 || value === 0) {
      value = this.min;
    }
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal(value === this.min ? 0 : (log10(value) - this._startValue) / this._valueRange);
  }
  getValueForPixel(pixel) {
    const decimal = this.getDecimalForPixel(pixel);
    return Math.pow(10, this._startValue + decimal * this._valueRange);
  }
}
function getTickBackdropHeight(opts) {
  const tickOpts = opts.ticks;
  if (tickOpts.display && opts.display) {
    const padding = toPadding(tickOpts.backdropPadding);
    return valueOrDefault(tickOpts.font && tickOpts.font.size, defaults$1.font.size) + padding.height;
  }
  return 0;
}
__name(getTickBackdropHeight, "getTickBackdropHeight");
function measureLabelSize(ctx, font, label) {
  label = isArray(label) ? label : [
    label
  ];
  return {
    w: _longestText(ctx, font.string, label),
    h: label.length * font.lineHeight
  };
}
__name(measureLabelSize, "measureLabelSize");
function determineLimits(angle, pos, size, min, max) {
  if (angle === min || angle === max) {
    return {
      start: pos - size / 2,
      end: pos + size / 2
    };
  } else if (angle < min || angle > max) {
    return {
      start: pos - size,
      end: pos
    };
  }
  return {
    start: pos,
    end: pos + size
  };
}
__name(determineLimits, "determineLimits");
function fitWithPointLabels(scale) {
  const orig = {
    l: scale.left + scale._padding.left,
    r: scale.right - scale._padding.right,
    t: scale.top + scale._padding.top,
    b: scale.bottom - scale._padding.bottom
  };
  const limits = Object.assign({}, orig);
  const labelSizes = [];
  const padding = [];
  const valueCount = scale._pointLabels.length;
  const pointLabelOpts = scale.options.pointLabels;
  const additionalAngle = pointLabelOpts.centerPointLabels ? PI / valueCount : 0;
  for (let i = 0; i < valueCount; i++) {
    const opts = pointLabelOpts.setContext(scale.getPointLabelContext(i));
    padding[i] = opts.padding;
    const pointPosition = scale.getPointPosition(i, scale.drawingArea + padding[i], additionalAngle);
    const plFont = toFont(opts.font);
    const textSize = measureLabelSize(scale.ctx, plFont, scale._pointLabels[i]);
    labelSizes[i] = textSize;
    const angleRadians = _normalizeAngle(scale.getIndexAngle(i) + additionalAngle);
    const angle = Math.round(toDegrees(angleRadians));
    const hLimits = determineLimits(angle, pointPosition.x, textSize.w, 0, 180);
    const vLimits = determineLimits(angle, pointPosition.y, textSize.h, 90, 270);
    updateLimits(limits, orig, angleRadians, hLimits, vLimits);
  }
  scale.setCenterPoint(orig.l - limits.l, limits.r - orig.r, orig.t - limits.t, limits.b - orig.b);
  scale._pointLabelItems = buildPointLabelItems(scale, labelSizes, padding);
}
__name(fitWithPointLabels, "fitWithPointLabels");
function updateLimits(limits, orig, angle, hLimits, vLimits) {
  const sin = Math.abs(Math.sin(angle));
  const cos = Math.abs(Math.cos(angle));
  let x = 0;
  let y = 0;
  if (hLimits.start < orig.l) {
    x = (orig.l - hLimits.start) / sin;
    limits.l = Math.min(limits.l, orig.l - x);
  } else if (hLimits.end > orig.r) {
    x = (hLimits.end - orig.r) / sin;
    limits.r = Math.max(limits.r, orig.r + x);
  }
  if (vLimits.start < orig.t) {
    y = (orig.t - vLimits.start) / cos;
    limits.t = Math.min(limits.t, orig.t - y);
  } else if (vLimits.end > orig.b) {
    y = (vLimits.end - orig.b) / cos;
    limits.b = Math.max(limits.b, orig.b + y);
  }
}
__name(updateLimits, "updateLimits");
function createPointLabelItem(scale, index2, itemOpts) {
  const outerDistance = scale.drawingArea;
  const { extra, additionalAngle, padding, size } = itemOpts;
  const pointLabelPosition = scale.getPointPosition(index2, outerDistance + extra + padding, additionalAngle);
  const angle = Math.round(toDegrees(_normalizeAngle(pointLabelPosition.angle + HALF_PI)));
  const y = yForAngle(pointLabelPosition.y, size.h, angle);
  const textAlign = getTextAlignForAngle(angle);
  const left = leftForTextAlign(pointLabelPosition.x, size.w, textAlign);
  return {
    visible: true,
    x: pointLabelPosition.x,
    y,
    textAlign,
    left,
    top: y,
    right: left + size.w,
    bottom: y + size.h
  };
}
__name(createPointLabelItem, "createPointLabelItem");
function isNotOverlapped(item, area) {
  if (!area) {
    return true;
  }
  const { left, top, right, bottom } = item;
  const apexesInArea = _isPointInArea({
    x: left,
    y: top
  }, area) || _isPointInArea({
    x: left,
    y: bottom
  }, area) || _isPointInArea({
    x: right,
    y: top
  }, area) || _isPointInArea({
    x: right,
    y: bottom
  }, area);
  return !apexesInArea;
}
__name(isNotOverlapped, "isNotOverlapped");
function buildPointLabelItems(scale, labelSizes, padding) {
  const items = [];
  const valueCount = scale._pointLabels.length;
  const opts = scale.options;
  const { centerPointLabels, display } = opts.pointLabels;
  const itemOpts = {
    extra: getTickBackdropHeight(opts) / 2,
    additionalAngle: centerPointLabels ? PI / valueCount : 0
  };
  let area;
  for (let i = 0; i < valueCount; i++) {
    itemOpts.padding = padding[i];
    itemOpts.size = labelSizes[i];
    const item = createPointLabelItem(scale, i, itemOpts);
    items.push(item);
    if (display === "auto") {
      item.visible = isNotOverlapped(item, area);
      if (item.visible) {
        area = item;
      }
    }
  }
  return items;
}
__name(buildPointLabelItems, "buildPointLabelItems");
function getTextAlignForAngle(angle) {
  if (angle === 0 || angle === 180) {
    return "center";
  } else if (angle < 180) {
    return "left";
  }
  return "right";
}
__name(getTextAlignForAngle, "getTextAlignForAngle");
function leftForTextAlign(x, w, align) {
  if (align === "right") {
    x -= w;
  } else if (align === "center") {
    x -= w / 2;
  }
  return x;
}
__name(leftForTextAlign, "leftForTextAlign");
function yForAngle(y, h, angle) {
  if (angle === 90 || angle === 270) {
    y -= h / 2;
  } else if (angle > 270 || angle < 90) {
    y -= h;
  }
  return y;
}
__name(yForAngle, "yForAngle");
function drawPointLabelBox(ctx, opts, item) {
  const { left, top, right, bottom } = item;
  const { backdropColor } = opts;
  if (!isNullOrUndef(backdropColor)) {
    const borderRadius = toTRBLCorners(opts.borderRadius);
    const padding = toPadding(opts.backdropPadding);
    ctx.fillStyle = backdropColor;
    const backdropLeft = left - padding.left;
    const backdropTop = top - padding.top;
    const backdropWidth = right - left + padding.width;
    const backdropHeight = bottom - top + padding.height;
    if (Object.values(borderRadius).some((v) => v !== 0)) {
      ctx.beginPath();
      addRoundedRectPath(ctx, {
        x: backdropLeft,
        y: backdropTop,
        w: backdropWidth,
        h: backdropHeight,
        radius: borderRadius
      });
      ctx.fill();
    } else {
      ctx.fillRect(backdropLeft, backdropTop, backdropWidth, backdropHeight);
    }
  }
}
__name(drawPointLabelBox, "drawPointLabelBox");
function drawPointLabels(scale, labelCount) {
  const { ctx, options: { pointLabels } } = scale;
  for (let i = labelCount - 1; i >= 0; i--) {
    const item = scale._pointLabelItems[i];
    if (!item.visible) {
      continue;
    }
    const optsAtIndex = pointLabels.setContext(scale.getPointLabelContext(i));
    drawPointLabelBox(ctx, optsAtIndex, item);
    const plFont = toFont(optsAtIndex.font);
    const { x, y, textAlign } = item;
    renderText(ctx, scale._pointLabels[i], x, y + plFont.lineHeight / 2, plFont, {
      color: optsAtIndex.color,
      textAlign,
      textBaseline: "middle"
    });
  }
}
__name(drawPointLabels, "drawPointLabels");
function pathRadiusLine(scale, radius, circular, labelCount) {
  const { ctx } = scale;
  if (circular) {
    ctx.arc(scale.xCenter, scale.yCenter, radius, 0, TAU);
  } else {
    let pointPosition = scale.getPointPosition(0, radius);
    ctx.moveTo(pointPosition.x, pointPosition.y);
    for (let i = 1; i < labelCount; i++) {
      pointPosition = scale.getPointPosition(i, radius);
      ctx.lineTo(pointPosition.x, pointPosition.y);
    }
  }
}
__name(pathRadiusLine, "pathRadiusLine");
function drawRadiusLine(scale, gridLineOpts, radius, labelCount, borderOpts) {
  const ctx = scale.ctx;
  const circular = gridLineOpts.circular;
  const { color: color2, lineWidth } = gridLineOpts;
  if (!circular && !labelCount || !color2 || !lineWidth || radius < 0) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = color2;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(borderOpts.dash);
  ctx.lineDashOffset = borderOpts.dashOffset;
  ctx.beginPath();
  pathRadiusLine(scale, radius, circular, labelCount);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}
__name(drawRadiusLine, "drawRadiusLine");
function createPointLabelContext(parent, index2, label) {
  return createContext(parent, {
    label,
    index: index2,
    type: "pointLabel"
  });
}
__name(createPointLabelContext, "createPointLabelContext");
class RadialLinearScale extends LinearScaleBase {
  static {
    __name(this, "RadialLinearScale");
  }
  static id = "radialLinear";
  static defaults = {
    display: true,
    animate: true,
    position: "chartArea",
    angleLines: {
      display: true,
      lineWidth: 1,
      borderDash: [],
      borderDashOffset: 0
    },
    grid: {
      circular: false
    },
    startAngle: 0,
    ticks: {
      showLabelBackdrop: true,
      callback: Ticks.formatters.numeric
    },
    pointLabels: {
      backdropColor: void 0,
      backdropPadding: 2,
      display: true,
      font: {
        size: 10
      },
      callback(label) {
        return label;
      },
      padding: 5,
      centerPointLabels: false
    }
  };
  static defaultRoutes = {
    "angleLines.color": "borderColor",
    "pointLabels.color": "color",
    "ticks.color": "color"
  };
  static descriptors = {
    angleLines: {
      _fallback: "grid"
    }
  };
  constructor(cfg) {
    super(cfg);
    this.xCenter = void 0;
    this.yCenter = void 0;
    this.drawingArea = void 0;
    this._pointLabels = [];
    this._pointLabelItems = [];
  }
  setDimensions() {
    const padding = this._padding = toPadding(getTickBackdropHeight(this.options) / 2);
    const w = this.width = this.maxWidth - padding.width;
    const h = this.height = this.maxHeight - padding.height;
    this.xCenter = Math.floor(this.left + w / 2 + padding.left);
    this.yCenter = Math.floor(this.top + h / 2 + padding.top);
    this.drawingArea = Math.floor(Math.min(w, h) / 2);
  }
  determineDataLimits() {
    const { min, max } = this.getMinMax(false);
    this.min = isNumberFinite(min) && !isNaN(min) ? min : 0;
    this.max = isNumberFinite(max) && !isNaN(max) ? max : 0;
    this.handleTickRangeOptions();
  }
  computeTickLimit() {
    return Math.ceil(this.drawingArea / getTickBackdropHeight(this.options));
  }
  generateTickLabels(ticks) {
    LinearScaleBase.prototype.generateTickLabels.call(this, ticks);
    this._pointLabels = this.getLabels().map((value, index2) => {
      const label = callback(this.options.pointLabels.callback, [
        value,
        index2
      ], this);
      return label || label === 0 ? label : "";
    }).filter((v, i) => this.chart.getDataVisibility(i));
  }
  fit() {
    const opts = this.options;
    if (opts.display && opts.pointLabels.display) {
      fitWithPointLabels(this);
    } else {
      this.setCenterPoint(0, 0, 0, 0);
    }
  }
  setCenterPoint(leftMovement, rightMovement, topMovement, bottomMovement) {
    this.xCenter += Math.floor((leftMovement - rightMovement) / 2);
    this.yCenter += Math.floor((topMovement - bottomMovement) / 2);
    this.drawingArea -= Math.min(this.drawingArea / 2, Math.max(leftMovement, rightMovement, topMovement, bottomMovement));
  }
  getIndexAngle(index2) {
    const angleMultiplier = TAU / (this._pointLabels.length || 1);
    const startAngle = this.options.startAngle || 0;
    return _normalizeAngle(index2 * angleMultiplier + toRadians(startAngle));
  }
  getDistanceFromCenterForValue(value) {
    if (isNullOrUndef(value)) {
      return NaN;
    }
    const scalingFactor = this.drawingArea / (this.max - this.min);
    if (this.options.reverse) {
      return (this.max - value) * scalingFactor;
    }
    return (value - this.min) * scalingFactor;
  }
  getValueForDistanceFromCenter(distance) {
    if (isNullOrUndef(distance)) {
      return NaN;
    }
    const scaledDistance = distance / (this.drawingArea / (this.max - this.min));
    return this.options.reverse ? this.max - scaledDistance : this.min + scaledDistance;
  }
  getPointLabelContext(index2) {
    const pointLabels = this._pointLabels || [];
    if (index2 >= 0 && index2 < pointLabels.length) {
      const pointLabel = pointLabels[index2];
      return createPointLabelContext(this.getContext(), index2, pointLabel);
    }
  }
  getPointPosition(index2, distanceFromCenter, additionalAngle = 0) {
    const angle = this.getIndexAngle(index2) - HALF_PI + additionalAngle;
    return {
      x: Math.cos(angle) * distanceFromCenter + this.xCenter,
      y: Math.sin(angle) * distanceFromCenter + this.yCenter,
      angle
    };
  }
  getPointPositionForValue(index2, value) {
    return this.getPointPosition(index2, this.getDistanceFromCenterForValue(value));
  }
  getBasePosition(index2) {
    return this.getPointPositionForValue(index2 || 0, this.getBaseValue());
  }
  getPointLabelPosition(index2) {
    const { left, top, right, bottom } = this._pointLabelItems[index2];
    return {
      left,
      top,
      right,
      bottom
    };
  }
  drawBackground() {
    const { backgroundColor, grid: { circular } } = this.options;
    if (backgroundColor) {
      const ctx = this.ctx;
      ctx.save();
      ctx.beginPath();
      pathRadiusLine(this, this.getDistanceFromCenterForValue(this._endValue), circular, this._pointLabels.length);
      ctx.closePath();
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.restore();
    }
  }
  drawGrid() {
    const ctx = this.ctx;
    const opts = this.options;
    const { angleLines, grid, border } = opts;
    const labelCount = this._pointLabels.length;
    let i, offset, position;
    if (opts.pointLabels.display) {
      drawPointLabels(this, labelCount);
    }
    if (grid.display) {
      this.ticks.forEach((tick, index2) => {
        if (index2 !== 0) {
          offset = this.getDistanceFromCenterForValue(tick.value);
          const context = this.getContext(index2);
          const optsAtIndex = grid.setContext(context);
          const optsAtIndexBorder = border.setContext(context);
          drawRadiusLine(this, optsAtIndex, offset, labelCount, optsAtIndexBorder);
        }
      });
    }
    if (angleLines.display) {
      ctx.save();
      for (i = labelCount - 1; i >= 0; i--) {
        const optsAtIndex = angleLines.setContext(this.getPointLabelContext(i));
        const { color: color2, lineWidth } = optsAtIndex;
        if (!lineWidth || !color2) {
          continue;
        }
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color2;
        ctx.setLineDash(optsAtIndex.borderDash);
        ctx.lineDashOffset = optsAtIndex.borderDashOffset;
        offset = this.getDistanceFromCenterForValue(opts.ticks.reverse ? this.min : this.max);
        position = this.getPointPosition(i, offset);
        ctx.beginPath();
        ctx.moveTo(this.xCenter, this.yCenter);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  drawBorder() {
  }
  drawLabels() {
    const ctx = this.ctx;
    const opts = this.options;
    const tickOpts = opts.ticks;
    if (!tickOpts.display) {
      return;
    }
    const startAngle = this.getIndexAngle(0);
    let offset, width;
    ctx.save();
    ctx.translate(this.xCenter, this.yCenter);
    ctx.rotate(startAngle);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    this.ticks.forEach((tick, index2) => {
      if (index2 === 0 && !opts.reverse) {
        return;
      }
      const optsAtIndex = tickOpts.setContext(this.getContext(index2));
      const tickFont = toFont(optsAtIndex.font);
      offset = this.getDistanceFromCenterForValue(this.ticks[index2].value);
      if (optsAtIndex.showLabelBackdrop) {
        ctx.font = tickFont.string;
        width = ctx.measureText(tick.label).width;
        ctx.fillStyle = optsAtIndex.backdropColor;
        const padding = toPadding(optsAtIndex.backdropPadding);
        ctx.fillRect(-width / 2 - padding.left, -offset - tickFont.size / 2 - padding.top, width + padding.width, tickFont.size + padding.height);
      }
      renderText(ctx, tick.label, 0, -offset, tickFont, {
        color: optsAtIndex.color,
        strokeColor: optsAtIndex.textStrokeColor,
        strokeWidth: optsAtIndex.textStrokeWidth
      });
    });
    ctx.restore();
  }
  drawTitle() {
  }
}
const INTERVALS = {
  millisecond: {
    common: true,
    size: 1,
    steps: 1e3
  },
  second: {
    common: true,
    size: 1e3,
    steps: 60
  },
  minute: {
    common: true,
    size: 6e4,
    steps: 60
  },
  hour: {
    common: true,
    size: 36e5,
    steps: 24
  },
  day: {
    common: true,
    size: 864e5,
    steps: 30
  },
  week: {
    common: false,
    size: 6048e5,
    steps: 4
  },
  month: {
    common: true,
    size: 2628e6,
    steps: 12
  },
  quarter: {
    common: false,
    size: 7884e6,
    steps: 4
  },
  year: {
    common: true,
    size: 3154e7
  }
};
const UNITS = /* @__PURE__ */ Object.keys(INTERVALS);
function sorter(a, b) {
  return a - b;
}
__name(sorter, "sorter");
function parse(scale, input) {
  if (isNullOrUndef(input)) {
    return null;
  }
  const adapter = scale._adapter;
  const { parser, round: round2, isoWeekday } = scale._parseOpts;
  let value = input;
  if (typeof parser === "function") {
    value = parser(value);
  }
  if (!isNumberFinite(value)) {
    value = typeof parser === "string" ? adapter.parse(value, parser) : adapter.parse(value);
  }
  if (value === null) {
    return null;
  }
  if (round2) {
    value = round2 === "week" && (isNumber(isoWeekday) || isoWeekday === true) ? adapter.startOf(value, "isoWeek", isoWeekday) : adapter.startOf(value, round2);
  }
  return +value;
}
__name(parse, "parse");
function determineUnitForAutoTicks(minUnit, min, max, capacity) {
  const ilen = UNITS.length;
  for (let i = UNITS.indexOf(minUnit); i < ilen - 1; ++i) {
    const interval = INTERVALS[UNITS[i]];
    const factor = interval.steps ? interval.steps : Number.MAX_SAFE_INTEGER;
    if (interval.common && Math.ceil((max - min) / (factor * interval.size)) <= capacity) {
      return UNITS[i];
    }
  }
  return UNITS[ilen - 1];
}
__name(determineUnitForAutoTicks, "determineUnitForAutoTicks");
function determineUnitForFormatting(scale, numTicks, minUnit, min, max) {
  for (let i = UNITS.length - 1; i >= UNITS.indexOf(minUnit); i--) {
    const unit = UNITS[i];
    if (INTERVALS[unit].common && scale._adapter.diff(max, min, unit) >= numTicks - 1) {
      return unit;
    }
  }
  return UNITS[minUnit ? UNITS.indexOf(minUnit) : 0];
}
__name(determineUnitForFormatting, "determineUnitForFormatting");
function determineMajorUnit(unit) {
  for (let i = UNITS.indexOf(unit) + 1, ilen = UNITS.length; i < ilen; ++i) {
    if (INTERVALS[UNITS[i]].common) {
      return UNITS[i];
    }
  }
}
__name(determineMajorUnit, "determineMajorUnit");
function addTick(ticks, time, timestamps) {
  if (!timestamps) {
    ticks[time] = true;
  } else if (timestamps.length) {
    const { lo, hi } = _lookup(timestamps, time);
    const timestamp = timestamps[lo] >= time ? timestamps[lo] : timestamps[hi];
    ticks[timestamp] = true;
  }
}
__name(addTick, "addTick");
function setMajorTicks(scale, ticks, map2, majorUnit) {
  const adapter = scale._adapter;
  const first = +adapter.startOf(ticks[0].value, majorUnit);
  const last = ticks[ticks.length - 1].value;
  let major, index2;
  for (major = first; major <= last; major = +adapter.add(major, 1, majorUnit)) {
    index2 = map2[major];
    if (index2 >= 0) {
      ticks[index2].major = true;
    }
  }
  return ticks;
}
__name(setMajorTicks, "setMajorTicks");
function ticksFromTimestamps(scale, values, majorUnit) {
  const ticks = [];
  const map2 = {};
  const ilen = values.length;
  let i, value;
  for (i = 0; i < ilen; ++i) {
    value = values[i];
    map2[value] = i;
    ticks.push({
      value,
      major: false
    });
  }
  return ilen === 0 || !majorUnit ? ticks : setMajorTicks(scale, ticks, map2, majorUnit);
}
__name(ticksFromTimestamps, "ticksFromTimestamps");
class TimeScale extends Scale {
  static {
    __name(this, "TimeScale");
  }
  static id = "time";
  static defaults = {
    bounds: "data",
    adapters: {},
    time: {
      parser: false,
      unit: false,
      round: false,
      isoWeekday: false,
      minUnit: "millisecond",
      displayFormats: {}
    },
    ticks: {
      source: "auto",
      callback: false,
      major: {
        enabled: false
      }
    }
  };
  constructor(props) {
    super(props);
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
    this._unit = "day";
    this._majorUnit = void 0;
    this._offsets = {};
    this._normalized = false;
    this._parseOpts = void 0;
  }
  init(scaleOpts, opts = {}) {
    const time = scaleOpts.time || (scaleOpts.time = {});
    const adapter = this._adapter = new adapters._date(scaleOpts.adapters.date);
    adapter.init(opts);
    mergeIf(time.displayFormats, adapter.formats());
    this._parseOpts = {
      parser: time.parser,
      round: time.round,
      isoWeekday: time.isoWeekday
    };
    super.init(scaleOpts);
    this._normalized = opts.normalized;
  }
  parse(raw, index2) {
    if (raw === void 0) {
      return null;
    }
    return parse(this, raw);
  }
  beforeLayout() {
    super.beforeLayout();
    this._cache = {
      data: [],
      labels: [],
      all: []
    };
  }
  determineDataLimits() {
    const options = this.options;
    const adapter = this._adapter;
    const unit = options.time.unit || "day";
    let { min, max, minDefined, maxDefined } = this.getUserBounds();
    function _applyBounds(bounds) {
      if (!minDefined && !isNaN(bounds.min)) {
        min = Math.min(min, bounds.min);
      }
      if (!maxDefined && !isNaN(bounds.max)) {
        max = Math.max(max, bounds.max);
      }
    }
    __name(_applyBounds, "_applyBounds");
    if (!minDefined || !maxDefined) {
      _applyBounds(this._getLabelBounds());
      if (options.bounds !== "ticks" || options.ticks.source !== "labels") {
        _applyBounds(this.getMinMax(false));
      }
    }
    min = isNumberFinite(min) && !isNaN(min) ? min : +adapter.startOf(Date.now(), unit);
    max = isNumberFinite(max) && !isNaN(max) ? max : +adapter.endOf(Date.now(), unit) + 1;
    this.min = Math.min(min, max - 1);
    this.max = Math.max(min + 1, max);
  }
  _getLabelBounds() {
    const arr = this.getLabelTimestamps();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    if (arr.length) {
      min = arr[0];
      max = arr[arr.length - 1];
    }
    return {
      min,
      max
    };
  }
  buildTicks() {
    const options = this.options;
    const timeOpts = options.time;
    const tickOpts = options.ticks;
    const timestamps = tickOpts.source === "labels" ? this.getLabelTimestamps() : this._generate();
    if (options.bounds === "ticks" && timestamps.length) {
      this.min = this._userMin || timestamps[0];
      this.max = this._userMax || timestamps[timestamps.length - 1];
    }
    const min = this.min;
    const max = this.max;
    const ticks = _filterBetween(timestamps, min, max);
    this._unit = timeOpts.unit || (tickOpts.autoSkip ? determineUnitForAutoTicks(timeOpts.minUnit, this.min, this.max, this._getLabelCapacity(min)) : determineUnitForFormatting(this, ticks.length, timeOpts.minUnit, this.min, this.max));
    this._majorUnit = !tickOpts.major.enabled || this._unit === "year" ? void 0 : determineMajorUnit(this._unit);
    this.initOffsets(timestamps);
    if (options.reverse) {
      ticks.reverse();
    }
    return ticksFromTimestamps(this, ticks, this._majorUnit);
  }
  afterAutoSkip() {
    if (this.options.offsetAfterAutoskip) {
      this.initOffsets(this.ticks.map((tick) => +tick.value));
    }
  }
  initOffsets(timestamps = []) {
    let start = 0;
    let end = 0;
    let first, last;
    if (this.options.offset && timestamps.length) {
      first = this.getDecimalForValue(timestamps[0]);
      if (timestamps.length === 1) {
        start = 1 - first;
      } else {
        start = (this.getDecimalForValue(timestamps[1]) - first) / 2;
      }
      last = this.getDecimalForValue(timestamps[timestamps.length - 1]);
      if (timestamps.length === 1) {
        end = last;
      } else {
        end = (last - this.getDecimalForValue(timestamps[timestamps.length - 2])) / 2;
      }
    }
    const limit = timestamps.length < 3 ? 0.5 : 0.25;
    start = _limitValue(start, 0, limit);
    end = _limitValue(end, 0, limit);
    this._offsets = {
      start,
      end,
      factor: 1 / (start + 1 + end)
    };
  }
  _generate() {
    const adapter = this._adapter;
    const min = this.min;
    const max = this.max;
    const options = this.options;
    const timeOpts = options.time;
    const minor = timeOpts.unit || determineUnitForAutoTicks(timeOpts.minUnit, min, max, this._getLabelCapacity(min));
    const stepSize = valueOrDefault(options.ticks.stepSize, 1);
    const weekday = minor === "week" ? timeOpts.isoWeekday : false;
    const hasWeekday = isNumber(weekday) || weekday === true;
    const ticks = {};
    let first = min;
    let time, count;
    if (hasWeekday) {
      first = +adapter.startOf(first, "isoWeek", weekday);
    }
    first = +adapter.startOf(first, hasWeekday ? "day" : minor);
    if (adapter.diff(max, min, minor) > 1e5 * stepSize) {
      throw new Error(min + " and " + max + " are too far apart with stepSize of " + stepSize + " " + minor);
    }
    const timestamps = options.ticks.source === "data" && this.getDataTimestamps();
    for (time = first, count = 0; time < max; time = +adapter.add(time, stepSize, minor), count++) {
      addTick(ticks, time, timestamps);
    }
    if (time === max || options.bounds === "ticks" || count === 1) {
      addTick(ticks, time, timestamps);
    }
    return Object.keys(ticks).sort(sorter).map((x) => +x);
  }
  getLabelForValue(value) {
    const adapter = this._adapter;
    const timeOpts = this.options.time;
    if (timeOpts.tooltipFormat) {
      return adapter.format(value, timeOpts.tooltipFormat);
    }
    return adapter.format(value, timeOpts.displayFormats.datetime);
  }
  format(value, format) {
    const options = this.options;
    const formats = options.time.displayFormats;
    const unit = this._unit;
    const fmt = format || formats[unit];
    return this._adapter.format(value, fmt);
  }
  _tickFormatFunction(time, index2, ticks, format) {
    const options = this.options;
    const formatter2 = options.ticks.callback;
    if (formatter2) {
      return callback(formatter2, [
        time,
        index2,
        ticks
      ], this);
    }
    const formats = options.time.displayFormats;
    const unit = this._unit;
    const majorUnit = this._majorUnit;
    const minorFormat = unit && formats[unit];
    const majorFormat = majorUnit && formats[majorUnit];
    const tick = ticks[index2];
    const major = majorUnit && majorFormat && tick && tick.major;
    return this._adapter.format(time, format || (major ? majorFormat : minorFormat));
  }
  generateTickLabels(ticks) {
    let i, ilen, tick;
    for (i = 0, ilen = ticks.length; i < ilen; ++i) {
      tick = ticks[i];
      tick.label = this._tickFormatFunction(tick.value, i, ticks);
    }
  }
  getDecimalForValue(value) {
    return value === null ? NaN : (value - this.min) / (this.max - this.min);
  }
  getPixelForValue(value) {
    const offsets = this._offsets;
    const pos = this.getDecimalForValue(value);
    return this.getPixelForDecimal((offsets.start + pos) * offsets.factor);
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const pos = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return this.min + pos * (this.max - this.min);
  }
  _getLabelSize(label) {
    const ticksOpts = this.options.ticks;
    const tickLabelWidth = this.ctx.measureText(label).width;
    const angle = toRadians(this.isHorizontal() ? ticksOpts.maxRotation : ticksOpts.minRotation);
    const cosRotation = Math.cos(angle);
    const sinRotation = Math.sin(angle);
    const tickFontSize = this._resolveTickFontOptions(0).size;
    return {
      w: tickLabelWidth * cosRotation + tickFontSize * sinRotation,
      h: tickLabelWidth * sinRotation + tickFontSize * cosRotation
    };
  }
  _getLabelCapacity(exampleTime) {
    const timeOpts = this.options.time;
    const displayFormats = timeOpts.displayFormats;
    const format = displayFormats[timeOpts.unit] || displayFormats.millisecond;
    const exampleLabel = this._tickFormatFunction(exampleTime, 0, ticksFromTimestamps(this, [
      exampleTime
    ], this._majorUnit), format);
    const size = this._getLabelSize(exampleLabel);
    const capacity = Math.floor(this.isHorizontal() ? this.width / size.w : this.height / size.h) - 1;
    return capacity > 0 ? capacity : 1;
  }
  getDataTimestamps() {
    let timestamps = this._cache.data || [];
    let i, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const metas = this.getMatchingVisibleMetas();
    if (this._normalized && metas.length) {
      return this._cache.data = metas[0].controller.getAllParsedValues(this);
    }
    for (i = 0, ilen = metas.length; i < ilen; ++i) {
      timestamps = timestamps.concat(metas[i].controller.getAllParsedValues(this));
    }
    return this._cache.data = this.normalize(timestamps);
  }
  getLabelTimestamps() {
    const timestamps = this._cache.labels || [];
    let i, ilen;
    if (timestamps.length) {
      return timestamps;
    }
    const labels = this.getLabels();
    for (i = 0, ilen = labels.length; i < ilen; ++i) {
      timestamps.push(parse(this, labels[i]));
    }
    return this._cache.labels = this._normalized ? timestamps : this.normalize(timestamps);
  }
  normalize(values) {
    return _arrayUnique(values.sort(sorter));
  }
}
function interpolate(table, val, reverse) {
  let lo = 0;
  let hi = table.length - 1;
  let prevSource, nextSource, prevTarget, nextTarget;
  if (reverse) {
    if (val >= table[lo].pos && val <= table[hi].pos) {
      ({ lo, hi } = _lookupByKey(table, "pos", val));
    }
    ({ pos: prevSource, time: prevTarget } = table[lo]);
    ({ pos: nextSource, time: nextTarget } = table[hi]);
  } else {
    if (val >= table[lo].time && val <= table[hi].time) {
      ({ lo, hi } = _lookupByKey(table, "time", val));
    }
    ({ time: prevSource, pos: prevTarget } = table[lo]);
    ({ time: nextSource, pos: nextTarget } = table[hi]);
  }
  const span = nextSource - prevSource;
  return span ? prevTarget + (nextTarget - prevTarget) * (val - prevSource) / span : prevTarget;
}
__name(interpolate, "interpolate");
class TimeSeriesScale extends TimeScale {
  static {
    __name(this, "TimeSeriesScale");
  }
  static id = "timeseries";
  static defaults = TimeScale.defaults;
  constructor(props) {
    super(props);
    this._table = [];
    this._minPos = void 0;
    this._tableRange = void 0;
  }
  initOffsets() {
    const timestamps = this._getTimestampsForTable();
    const table = this._table = this.buildLookupTable(timestamps);
    this._minPos = interpolate(table, this.min);
    this._tableRange = interpolate(table, this.max) - this._minPos;
    super.initOffsets(timestamps);
  }
  buildLookupTable(timestamps) {
    const { min, max } = this;
    const items = [];
    const table = [];
    let i, ilen, prev, curr, next;
    for (i = 0, ilen = timestamps.length; i < ilen; ++i) {
      curr = timestamps[i];
      if (curr >= min && curr <= max) {
        items.push(curr);
      }
    }
    if (items.length < 2) {
      return [
        {
          time: min,
          pos: 0
        },
        {
          time: max,
          pos: 1
        }
      ];
    }
    for (i = 0, ilen = items.length; i < ilen; ++i) {
      next = items[i + 1];
      prev = items[i - 1];
      curr = items[i];
      if (Math.round((next + prev) / 2) !== curr) {
        table.push({
          time: curr,
          pos: i / (ilen - 1)
        });
      }
    }
    return table;
  }
  _generate() {
    const min = this.min;
    const max = this.max;
    let timestamps = super.getDataTimestamps();
    if (!timestamps.includes(min) || !timestamps.length) {
      timestamps.splice(0, 0, min);
    }
    if (!timestamps.includes(max) || timestamps.length === 1) {
      timestamps.push(max);
    }
    return timestamps.sort((a, b) => a - b);
  }
  _getTimestampsForTable() {
    let timestamps = this._cache.all || [];
    if (timestamps.length) {
      return timestamps;
    }
    const data = this.getDataTimestamps();
    const label = this.getLabelTimestamps();
    if (data.length && label.length) {
      timestamps = this.normalize(data.concat(label));
    } else {
      timestamps = data.length ? data : label;
    }
    timestamps = this._cache.all = timestamps;
    return timestamps;
  }
  getDecimalForValue(value) {
    return (interpolate(this._table, value) - this._minPos) / this._tableRange;
  }
  getValueForPixel(pixel) {
    const offsets = this._offsets;
    const decimal = this.getDecimalForPixel(pixel) / offsets.factor - offsets.end;
    return interpolate(this._table, decimal * this._tableRange + this._minPos, true);
  }
}
var scales = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale
});
const registerables = [
  controllers,
  elements,
  plugins,
  scales
];
Chart.register(...registerables);
/*!
 * chartjs-plugin-datalabels v2.2.0
 * https://chartjs-plugin-datalabels.netlify.app
 * (c) 2017-2022 chartjs-plugin-datalabels contributors
 * Released under the MIT license
 */
var devicePixelRatio = function() {
  if (typeof window !== "undefined") {
    if (window.devicePixelRatio) {
      return window.devicePixelRatio;
    }
    var screen = window.screen;
    if (screen) {
      return (screen.deviceXDPI || 1) / (screen.logicalXDPI || 1);
    }
  }
  return 1;
}();
var utils = {
  // @todo move this in Chart.helpers.toTextLines
  toTextLines: function(inputs) {
    var lines = [];
    var input;
    inputs = [].concat(inputs);
    while (inputs.length) {
      input = inputs.pop();
      if (typeof input === "string") {
        lines.unshift.apply(lines, input.split("\n"));
      } else if (Array.isArray(input)) {
        inputs.push.apply(inputs, input);
      } else if (!isNullOrUndef(inputs)) {
        lines.unshift("" + input);
      }
    }
    return lines;
  },
  // @todo move this in Chart.helpers.canvas.textSize
  // @todo cache calls of measureText if font doesn't change?!
  textSize: function(ctx, lines, font) {
    var items = [].concat(lines);
    var ilen = items.length;
    var prev = ctx.font;
    var width = 0;
    var i;
    ctx.font = font.string;
    for (i = 0; i < ilen; ++i) {
      width = Math.max(ctx.measureText(items[i]).width, width);
    }
    ctx.font = prev;
    return {
      height: ilen * font.lineHeight,
      width
    };
  },
  /**
   * Returns value bounded by min and max. This is equivalent to max(min, min(value, max)).
   * @todo move this method in Chart.helpers.bound
   * https://doc.qt.io/qt-5/qtglobal.html#qBound
   */
  bound: function(min, value, max) {
    return Math.max(min, Math.min(value, max));
  },
  /**
   * Returns an array of pair [value, state] where state is:
   * * -1: value is only in a0 (removed)
   * *  1: value is only in a1 (added)
   */
  arrayDiff: function(a0, a1) {
    var prev = a0.slice();
    var updates = [];
    var i, j, ilen, v;
    for (i = 0, ilen = a1.length; i < ilen; ++i) {
      v = a1[i];
      j = prev.indexOf(v);
      if (j === -1) {
        updates.push([v, 1]);
      } else {
        prev.splice(j, 1);
      }
    }
    for (i = 0, ilen = prev.length; i < ilen; ++i) {
      updates.push([prev[i], -1]);
    }
    return updates;
  },
  /**
   * https://github.com/chartjs/chartjs-plugin-datalabels/issues/70
   */
  rasterize: function(v) {
    return Math.round(v * devicePixelRatio) / devicePixelRatio;
  }
};
function orient(point, origin) {
  var x0 = origin.x;
  var y0 = origin.y;
  if (x0 === null) {
    return { x: 0, y: -1 };
  }
  if (y0 === null) {
    return { x: 1, y: 0 };
  }
  var dx = point.x - x0;
  var dy = point.y - y0;
  var ln = Math.sqrt(dx * dx + dy * dy);
  return {
    x: ln ? dx / ln : 0,
    y: ln ? dy / ln : -1
  };
}
__name(orient, "orient");
function aligned(x, y, vx, vy, align) {
  switch (align) {
    case "center":
      vx = vy = 0;
      break;
    case "bottom":
      vx = 0;
      vy = 1;
      break;
    case "right":
      vx = 1;
      vy = 0;
      break;
    case "left":
      vx = -1;
      vy = 0;
      break;
    case "top":
      vx = 0;
      vy = -1;
      break;
    case "start":
      vx = -vx;
      vy = -vy;
      break;
    case "end":
      break;
    default:
      align *= Math.PI / 180;
      vx = Math.cos(align);
      vy = Math.sin(align);
      break;
  }
  return {
    x,
    y,
    vx,
    vy
  };
}
__name(aligned, "aligned");
var R_INSIDE = 0;
var R_LEFT = 1;
var R_RIGHT = 2;
var R_BOTTOM = 4;
var R_TOP = 8;
function region(x, y, rect) {
  var res = R_INSIDE;
  if (x < rect.left) {
    res |= R_LEFT;
  } else if (x > rect.right) {
    res |= R_RIGHT;
  }
  if (y < rect.top) {
    res |= R_TOP;
  } else if (y > rect.bottom) {
    res |= R_BOTTOM;
  }
  return res;
}
__name(region, "region");
function clipped(segment, area) {
  var x0 = segment.x0;
  var y0 = segment.y0;
  var x1 = segment.x1;
  var y1 = segment.y1;
  var r0 = region(x0, y0, area);
  var r1 = region(x1, y1, area);
  var r, x, y;
  while (true) {
    if (!(r0 | r1) || r0 & r1) {
      break;
    }
    r = r0 || r1;
    if (r & R_TOP) {
      x = x0 + (x1 - x0) * (area.top - y0) / (y1 - y0);
      y = area.top;
    } else if (r & R_BOTTOM) {
      x = x0 + (x1 - x0) * (area.bottom - y0) / (y1 - y0);
      y = area.bottom;
    } else if (r & R_RIGHT) {
      y = y0 + (y1 - y0) * (area.right - x0) / (x1 - x0);
      x = area.right;
    } else if (r & R_LEFT) {
      y = y0 + (y1 - y0) * (area.left - x0) / (x1 - x0);
      x = area.left;
    }
    if (r === r0) {
      x0 = x;
      y0 = y;
      r0 = region(x0, y0, area);
    } else {
      x1 = x;
      y1 = y;
      r1 = region(x1, y1, area);
    }
  }
  return {
    x0,
    x1,
    y0,
    y1
  };
}
__name(clipped, "clipped");
function compute$1(range, config) {
  var anchor = config.anchor;
  var segment = range;
  var x, y;
  if (config.clamp) {
    segment = clipped(segment, config.area);
  }
  if (anchor === "start") {
    x = segment.x0;
    y = segment.y0;
  } else if (anchor === "end") {
    x = segment.x1;
    y = segment.y1;
  } else {
    x = (segment.x0 + segment.x1) / 2;
    y = (segment.y0 + segment.y1) / 2;
  }
  return aligned(x, y, range.vx, range.vy, config.align);
}
__name(compute$1, "compute$1");
var positioners = {
  arc: function(el, config) {
    var angle = (el.startAngle + el.endAngle) / 2;
    var vx = Math.cos(angle);
    var vy = Math.sin(angle);
    var r0 = el.innerRadius;
    var r1 = el.outerRadius;
    return compute$1({
      x0: el.x + vx * r0,
      y0: el.y + vy * r0,
      x1: el.x + vx * r1,
      y1: el.y + vy * r1,
      vx,
      vy
    }, config);
  },
  point: function(el, config) {
    var v = orient(el, config.origin);
    var rx = v.x * el.options.radius;
    var ry = v.y * el.options.radius;
    return compute$1({
      x0: el.x - rx,
      y0: el.y - ry,
      x1: el.x + rx,
      y1: el.y + ry,
      vx: v.x,
      vy: v.y
    }, config);
  },
  bar: function(el, config) {
    var v = orient(el, config.origin);
    var x = el.x;
    var y = el.y;
    var sx = 0;
    var sy = 0;
    if (el.horizontal) {
      x = Math.min(el.x, el.base);
      sx = Math.abs(el.base - el.x);
    } else {
      y = Math.min(el.y, el.base);
      sy = Math.abs(el.base - el.y);
    }
    return compute$1({
      x0: x,
      y0: y + sy,
      x1: x + sx,
      y1: y,
      vx: v.x,
      vy: v.y
    }, config);
  },
  fallback: function(el, config) {
    var v = orient(el, config.origin);
    return compute$1({
      x0: el.x,
      y0: el.y,
      x1: el.x + (el.width || 0),
      y1: el.y + (el.height || 0),
      vx: v.x,
      vy: v.y
    }, config);
  }
};
var rasterize = utils.rasterize;
function boundingRects(model) {
  var borderWidth = model.borderWidth || 0;
  var padding = model.padding;
  var th = model.size.height;
  var tw = model.size.width;
  var tx = -tw / 2;
  var ty = -th / 2;
  return {
    frame: {
      x: tx - padding.left - borderWidth,
      y: ty - padding.top - borderWidth,
      w: tw + padding.width + borderWidth * 2,
      h: th + padding.height + borderWidth * 2
    },
    text: {
      x: tx,
      y: ty,
      w: tw,
      h: th
    }
  };
}
__name(boundingRects, "boundingRects");
function getScaleOrigin(el, context) {
  var scale = context.chart.getDatasetMeta(context.datasetIndex).vScale;
  if (!scale) {
    return null;
  }
  if (scale.xCenter !== void 0 && scale.yCenter !== void 0) {
    return { x: scale.xCenter, y: scale.yCenter };
  }
  var pixel = scale.getBasePixel();
  return el.horizontal ? { x: pixel, y: null } : { x: null, y: pixel };
}
__name(getScaleOrigin, "getScaleOrigin");
function getPositioner(el) {
  if (el instanceof ArcElement) {
    return positioners.arc;
  }
  if (el instanceof PointElement) {
    return positioners.point;
  }
  if (el instanceof BarElement) {
    return positioners.bar;
  }
  return positioners.fallback;
}
__name(getPositioner, "getPositioner");
function drawRoundedRect(ctx, x, y, w, h, radius) {
  var HALF_PI2 = Math.PI / 2;
  if (radius) {
    var r = Math.min(radius, h / 2, w / 2);
    var left = x + r;
    var top = y + r;
    var right = x + w - r;
    var bottom = y + h - r;
    ctx.moveTo(x, top);
    if (left < right && top < bottom) {
      ctx.arc(left, top, r, -Math.PI, -HALF_PI2);
      ctx.arc(right, top, r, -HALF_PI2, 0);
      ctx.arc(right, bottom, r, 0, HALF_PI2);
      ctx.arc(left, bottom, r, HALF_PI2, Math.PI);
    } else if (left < right) {
      ctx.moveTo(left, y);
      ctx.arc(right, top, r, -HALF_PI2, HALF_PI2);
      ctx.arc(left, top, r, HALF_PI2, Math.PI + HALF_PI2);
    } else if (top < bottom) {
      ctx.arc(left, top, r, -Math.PI, 0);
      ctx.arc(left, bottom, r, 0, Math.PI);
    } else {
      ctx.arc(left, top, r, -Math.PI, Math.PI);
    }
    ctx.closePath();
    ctx.moveTo(x, y);
  } else {
    ctx.rect(x, y, w, h);
  }
}
__name(drawRoundedRect, "drawRoundedRect");
function drawFrame(ctx, rect, model) {
  var bgColor = model.backgroundColor;
  var borderColor = model.borderColor;
  var borderWidth = model.borderWidth;
  if (!bgColor && (!borderColor || !borderWidth)) {
    return;
  }
  ctx.beginPath();
  drawRoundedRect(
    ctx,
    rasterize(rect.x) + borderWidth / 2,
    rasterize(rect.y) + borderWidth / 2,
    rasterize(rect.w) - borderWidth,
    rasterize(rect.h) - borderWidth,
    model.borderRadius
  );
  ctx.closePath();
  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fill();
  }
  if (borderColor && borderWidth) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.lineJoin = "miter";
    ctx.stroke();
  }
}
__name(drawFrame, "drawFrame");
function textGeometry(rect, align, font) {
  var h = font.lineHeight;
  var w = rect.w;
  var x = rect.x;
  var y = rect.y + h / 2;
  if (align === "center") {
    x += w / 2;
  } else if (align === "end" || align === "right") {
    x += w;
  }
  return {
    h,
    w,
    x,
    y
  };
}
__name(textGeometry, "textGeometry");
function drawTextLine(ctx, text, cfg) {
  var shadow = ctx.shadowBlur;
  var stroked = cfg.stroked;
  var x = rasterize(cfg.x);
  var y = rasterize(cfg.y);
  var w = rasterize(cfg.w);
  if (stroked) {
    ctx.strokeText(text, x, y, w);
  }
  if (cfg.filled) {
    if (shadow && stroked) {
      ctx.shadowBlur = 0;
    }
    ctx.fillText(text, x, y, w);
    if (shadow && stroked) {
      ctx.shadowBlur = shadow;
    }
  }
}
__name(drawTextLine, "drawTextLine");
function drawText(ctx, lines, rect, model) {
  var align = model.textAlign;
  var color2 = model.color;
  var filled = !!color2;
  var font = model.font;
  var ilen = lines.length;
  var strokeColor = model.textStrokeColor;
  var strokeWidth = model.textStrokeWidth;
  var stroked = strokeColor && strokeWidth;
  var i;
  if (!ilen || !filled && !stroked) {
    return;
  }
  rect = textGeometry(rect, align, font);
  ctx.font = font.string;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.shadowBlur = model.textShadowBlur;
  ctx.shadowColor = model.textShadowColor;
  if (filled) {
    ctx.fillStyle = color2;
  }
  if (stroked) {
    ctx.lineJoin = "round";
    ctx.lineWidth = strokeWidth;
    ctx.strokeStyle = strokeColor;
  }
  for (i = 0, ilen = lines.length; i < ilen; ++i) {
    drawTextLine(ctx, lines[i], {
      stroked,
      filled,
      w: rect.w,
      x: rect.x,
      y: rect.y + rect.h * i
    });
  }
}
__name(drawText, "drawText");
var Label = /* @__PURE__ */ __name(function(config, ctx, el, index2) {
  var me = this;
  me._config = config;
  me._index = index2;
  me._model = null;
  me._rects = null;
  me._ctx = ctx;
  me._el = el;
}, "Label");
merge(Label.prototype, {
  /**
   * @private
   */
  _modelize: function(display, lines, config, context) {
    var me = this;
    var index2 = me._index;
    var font = toFont(resolve([config.font, {}], context, index2));
    var color2 = resolve([config.color, defaults$1.color], context, index2);
    return {
      align: resolve([config.align, "center"], context, index2),
      anchor: resolve([config.anchor, "center"], context, index2),
      area: context.chart.chartArea,
      backgroundColor: resolve([config.backgroundColor, null], context, index2),
      borderColor: resolve([config.borderColor, null], context, index2),
      borderRadius: resolve([config.borderRadius, 0], context, index2),
      borderWidth: resolve([config.borderWidth, 0], context, index2),
      clamp: resolve([config.clamp, false], context, index2),
      clip: resolve([config.clip, false], context, index2),
      color: color2,
      display,
      font,
      lines,
      offset: resolve([config.offset, 4], context, index2),
      opacity: resolve([config.opacity, 1], context, index2),
      origin: getScaleOrigin(me._el, context),
      padding: toPadding(resolve([config.padding, 4], context, index2)),
      positioner: getPositioner(me._el),
      rotation: resolve([config.rotation, 0], context, index2) * (Math.PI / 180),
      size: utils.textSize(me._ctx, lines, font),
      textAlign: resolve([config.textAlign, "start"], context, index2),
      textShadowBlur: resolve([config.textShadowBlur, 0], context, index2),
      textShadowColor: resolve([config.textShadowColor, color2], context, index2),
      textStrokeColor: resolve([config.textStrokeColor, color2], context, index2),
      textStrokeWidth: resolve([config.textStrokeWidth, 0], context, index2)
    };
  },
  update: function(context) {
    var me = this;
    var model = null;
    var rects = null;
    var index2 = me._index;
    var config = me._config;
    var value, label, lines;
    var display = resolve([config.display, true], context, index2);
    if (display) {
      value = context.dataset.data[index2];
      label = valueOrDefault(callback(config.formatter, [value, context]), value);
      lines = isNullOrUndef(label) ? [] : utils.toTextLines(label);
      if (lines.length) {
        model = me._modelize(display, lines, config, context);
        rects = boundingRects(model);
      }
    }
    me._model = model;
    me._rects = rects;
  },
  geometry: function() {
    return this._rects ? this._rects.frame : {};
  },
  rotation: function() {
    return this._model ? this._model.rotation : 0;
  },
  visible: function() {
    return this._model && this._model.opacity;
  },
  model: function() {
    return this._model;
  },
  draw: function(chart, center) {
    var me = this;
    var ctx = chart.ctx;
    var model = me._model;
    var rects = me._rects;
    var area;
    if (!this.visible()) {
      return;
    }
    ctx.save();
    if (model.clip) {
      area = model.area;
      ctx.beginPath();
      ctx.rect(
        area.left,
        area.top,
        area.right - area.left,
        area.bottom - area.top
      );
      ctx.clip();
    }
    ctx.globalAlpha = utils.bound(0, model.opacity, 1);
    ctx.translate(rasterize(center.x), rasterize(center.y));
    ctx.rotate(model.rotation);
    drawFrame(ctx, rects.frame, model);
    drawText(ctx, model.lines, rects.text, model);
    ctx.restore();
  }
});
var MIN_INTEGER = Number.MIN_SAFE_INTEGER || -9007199254740991;
var MAX_INTEGER = Number.MAX_SAFE_INTEGER || 9007199254740991;
function rotated(point, center, angle) {
  var cos = Math.cos(angle);
  var sin = Math.sin(angle);
  var cx = center.x;
  var cy = center.y;
  return {
    x: cx + cos * (point.x - cx) - sin * (point.y - cy),
    y: cy + sin * (point.x - cx) + cos * (point.y - cy)
  };
}
__name(rotated, "rotated");
function projected(points, axis) {
  var min = MAX_INTEGER;
  var max = MIN_INTEGER;
  var origin = axis.origin;
  var i, pt, vx, vy, dp;
  for (i = 0; i < points.length; ++i) {
    pt = points[i];
    vx = pt.x - origin.x;
    vy = pt.y - origin.y;
    dp = axis.vx * vx + axis.vy * vy;
    min = Math.min(min, dp);
    max = Math.max(max, dp);
  }
  return {
    min,
    max
  };
}
__name(projected, "projected");
function toAxis(p0, p1) {
  var vx = p1.x - p0.x;
  var vy = p1.y - p0.y;
  var ln = Math.sqrt(vx * vx + vy * vy);
  return {
    vx: (p1.x - p0.x) / ln,
    vy: (p1.y - p0.y) / ln,
    origin: p0,
    ln
  };
}
__name(toAxis, "toAxis");
var HitBox = /* @__PURE__ */ __name(function() {
  this._rotation = 0;
  this._rect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
}, "HitBox");
merge(HitBox.prototype, {
  center: function() {
    var r = this._rect;
    return {
      x: r.x + r.w / 2,
      y: r.y + r.h / 2
    };
  },
  update: function(center, rect, rotation) {
    this._rotation = rotation;
    this._rect = {
      x: rect.x + center.x,
      y: rect.y + center.y,
      w: rect.w,
      h: rect.h
    };
  },
  contains: function(point) {
    var me = this;
    var margin = 1;
    var rect = me._rect;
    point = rotated(point, me.center(), -me._rotation);
    return !(point.x < rect.x - margin || point.y < rect.y - margin || point.x > rect.x + rect.w + margin * 2 || point.y > rect.y + rect.h + margin * 2);
  },
  // Separating Axis Theorem
  // https://gamedevelopment.tutsplus.com/tutorials/collision-detection-using-the-separating-axis-theorem--gamedev-169
  intersects: function(other) {
    var r0 = this._points();
    var r1 = other._points();
    var axes = [
      toAxis(r0[0], r0[1]),
      toAxis(r0[0], r0[3])
    ];
    var i, pr0, pr1;
    if (this._rotation !== other._rotation) {
      axes.push(
        toAxis(r1[0], r1[1]),
        toAxis(r1[0], r1[3])
      );
    }
    for (i = 0; i < axes.length; ++i) {
      pr0 = projected(r0, axes[i]);
      pr1 = projected(r1, axes[i]);
      if (pr0.max < pr1.min || pr1.max < pr0.min) {
        return false;
      }
    }
    return true;
  },
  /**
   * @private
   */
  _points: function() {
    var me = this;
    var rect = me._rect;
    var angle = me._rotation;
    var center = me.center();
    return [
      rotated({ x: rect.x, y: rect.y }, center, angle),
      rotated({ x: rect.x + rect.w, y: rect.y }, center, angle),
      rotated({ x: rect.x + rect.w, y: rect.y + rect.h }, center, angle),
      rotated({ x: rect.x, y: rect.y + rect.h }, center, angle)
    ];
  }
});
function coordinates(el, model, geometry) {
  var point = model.positioner(el, model);
  var vx = point.vx;
  var vy = point.vy;
  if (!vx && !vy) {
    return { x: point.x, y: point.y };
  }
  var w = geometry.w;
  var h = geometry.h;
  var rotation = model.rotation;
  var dx = Math.abs(w / 2 * Math.cos(rotation)) + Math.abs(h / 2 * Math.sin(rotation));
  var dy = Math.abs(w / 2 * Math.sin(rotation)) + Math.abs(h / 2 * Math.cos(rotation));
  var vs = 1 / Math.max(Math.abs(vx), Math.abs(vy));
  dx *= vx * vs;
  dy *= vy * vs;
  dx += model.offset * vx;
  dy += model.offset * vy;
  return {
    x: point.x + dx,
    y: point.y + dy
  };
}
__name(coordinates, "coordinates");
function collide(labels, collider) {
  var i, j, s0, s1;
  for (i = labels.length - 1; i >= 0; --i) {
    s0 = labels[i].$layout;
    for (j = i - 1; j >= 0 && s0._visible; --j) {
      s1 = labels[j].$layout;
      if (s1._visible && s0._box.intersects(s1._box)) {
        collider(s0, s1);
      }
    }
  }
  return labels;
}
__name(collide, "collide");
function compute(labels) {
  var i, ilen, label, state, geometry, center, proxy;
  for (i = 0, ilen = labels.length; i < ilen; ++i) {
    label = labels[i];
    state = label.$layout;
    if (state._visible) {
      proxy = new Proxy(label._el, { get: (el, p) => el.getProps([p], true)[p] });
      geometry = label.geometry();
      center = coordinates(proxy, label.model(), geometry);
      state._box.update(center, geometry, label.rotation());
    }
  }
  return collide(labels, function(s0, s1) {
    var h0 = s0._hidable;
    var h12 = s1._hidable;
    if (h0 && h12 || h12) {
      s1._visible = false;
    } else if (h0) {
      s0._visible = false;
    }
  });
}
__name(compute, "compute");
var layout = {
  prepare: function(datasets) {
    var labels = [];
    var i, j, ilen, jlen, label;
    for (i = 0, ilen = datasets.length; i < ilen; ++i) {
      for (j = 0, jlen = datasets[i].length; j < jlen; ++j) {
        label = datasets[i][j];
        labels.push(label);
        label.$layout = {
          _box: new HitBox(),
          _hidable: false,
          _visible: true,
          _set: i,
          _idx: label._index
        };
      }
    }
    labels.sort(function(a, b) {
      var sa = a.$layout;
      var sb = b.$layout;
      return sa._idx === sb._idx ? sb._set - sa._set : sb._idx - sa._idx;
    });
    this.update(labels);
    return labels;
  },
  update: function(labels) {
    var dirty = false;
    var i, ilen, label, model, state;
    for (i = 0, ilen = labels.length; i < ilen; ++i) {
      label = labels[i];
      model = label.model();
      state = label.$layout;
      state._hidable = model && model.display === "auto";
      state._visible = label.visible();
      dirty |= state._hidable;
    }
    if (dirty) {
      compute(labels);
    }
  },
  lookup: function(labels, point) {
    var i, state;
    for (i = labels.length - 1; i >= 0; --i) {
      state = labels[i].$layout;
      if (state && state._visible && state._box.contains(point)) {
        return labels[i];
      }
    }
    return null;
  },
  draw: function(chart, labels) {
    var i, ilen, label, state, geometry, center;
    for (i = 0, ilen = labels.length; i < ilen; ++i) {
      label = labels[i];
      state = label.$layout;
      if (state._visible) {
        geometry = label.geometry();
        center = coordinates(label._el, label.model(), geometry);
        state._box.update(center, geometry, label.rotation());
        label.draw(chart, center);
      }
    }
  }
};
var formatter = /* @__PURE__ */ __name(function(value) {
  if (isNullOrUndef(value)) {
    return null;
  }
  var label = value;
  var keys, klen, k;
  if (isObject(value)) {
    if (!isNullOrUndef(value.label)) {
      label = value.label;
    } else if (!isNullOrUndef(value.r)) {
      label = value.r;
    } else {
      label = "";
      keys = Object.keys(value);
      for (k = 0, klen = keys.length; k < klen; ++k) {
        label += (k !== 0 ? ", " : "") + keys[k] + ": " + value[keys[k]];
      }
    }
  }
  return "" + label;
}, "formatter");
var defaults = {
  align: "center",
  anchor: "center",
  backgroundColor: null,
  borderColor: null,
  borderRadius: 0,
  borderWidth: 0,
  clamp: false,
  clip: false,
  color: void 0,
  display: true,
  font: {
    family: void 0,
    lineHeight: 1.2,
    size: void 0,
    style: void 0,
    weight: null
  },
  formatter,
  labels: void 0,
  listeners: {},
  offset: 4,
  opacity: 1,
  padding: {
    top: 4,
    right: 4,
    bottom: 4,
    left: 4
  },
  rotation: 0,
  textAlign: "start",
  textStrokeColor: void 0,
  textStrokeWidth: 0,
  textShadowBlur: 0,
  textShadowColor: void 0
};
var EXPANDO_KEY = "$datalabels";
var DEFAULT_KEY = "$default";
function configure(dataset, options) {
  var override = dataset.datalabels;
  var listeners = {};
  var configs = [];
  var labels, keys;
  if (override === false) {
    return null;
  }
  if (override === true) {
    override = {};
  }
  options = merge({}, [options, override]);
  labels = options.labels || {};
  keys = Object.keys(labels);
  delete options.labels;
  if (keys.length) {
    keys.forEach(function(key) {
      if (labels[key]) {
        configs.push(merge({}, [
          options,
          labels[key],
          { _key: key }
        ]));
      }
    });
  } else {
    configs.push(options);
  }
  listeners = configs.reduce(function(target, config) {
    each(config.listeners || {}, function(fn, event) {
      target[event] = target[event] || {};
      target[event][config._key || DEFAULT_KEY] = fn;
    });
    delete config.listeners;
    return target;
  }, {});
  return {
    labels: configs,
    listeners
  };
}
__name(configure, "configure");
function dispatchEvent$1(chart, listeners, label, event) {
  if (!listeners) {
    return;
  }
  var context = label.$context;
  var groups = label.$groups;
  var callback$1;
  if (!listeners[groups._set]) {
    return;
  }
  callback$1 = listeners[groups._set][groups._key];
  if (!callback$1) {
    return;
  }
  if (callback(callback$1, [context, event]) === true) {
    chart[EXPANDO_KEY]._dirty = true;
    label.update(context);
  }
}
__name(dispatchEvent$1, "dispatchEvent$1");
function dispatchMoveEvents(chart, listeners, previous, label, event) {
  var enter, leave;
  if (!previous && !label) {
    return;
  }
  if (!previous) {
    enter = true;
  } else if (!label) {
    leave = true;
  } else if (previous !== label) {
    leave = enter = true;
  }
  if (leave) {
    dispatchEvent$1(chart, listeners.leave, previous, event);
  }
  if (enter) {
    dispatchEvent$1(chart, listeners.enter, label, event);
  }
}
__name(dispatchMoveEvents, "dispatchMoveEvents");
function handleMoveEvents(chart, event) {
  var expando = chart[EXPANDO_KEY];
  var listeners = expando._listeners;
  var previous, label;
  if (!listeners.enter && !listeners.leave) {
    return;
  }
  if (event.type === "mousemove") {
    label = layout.lookup(expando._labels, event);
  } else if (event.type !== "mouseout") {
    return;
  }
  previous = expando._hovered;
  expando._hovered = label;
  dispatchMoveEvents(chart, listeners, previous, label, event);
}
__name(handleMoveEvents, "handleMoveEvents");
function handleClickEvents(chart, event) {
  var expando = chart[EXPANDO_KEY];
  var handlers = expando._listeners.click;
  var label = handlers && layout.lookup(expando._labels, event);
  if (label) {
    dispatchEvent$1(chart, handlers, label, event);
  }
}
__name(handleClickEvents, "handleClickEvents");
var plugin = {
  id: "datalabels",
  defaults,
  beforeInit: function(chart) {
    chart[EXPANDO_KEY] = {
      _actives: []
    };
  },
  beforeUpdate: function(chart) {
    var expando = chart[EXPANDO_KEY];
    expando._listened = false;
    expando._listeners = {};
    expando._datasets = [];
    expando._labels = [];
  },
  afterDatasetUpdate: function(chart, args, options) {
    var datasetIndex = args.index;
    var expando = chart[EXPANDO_KEY];
    var labels = expando._datasets[datasetIndex] = [];
    var visible = chart.isDatasetVisible(datasetIndex);
    var dataset = chart.data.datasets[datasetIndex];
    var config = configure(dataset, options);
    var elements2 = args.meta.data || [];
    var ctx = chart.ctx;
    var i, j, ilen, jlen, cfg, key, el, label;
    ctx.save();
    for (i = 0, ilen = elements2.length; i < ilen; ++i) {
      el = elements2[i];
      el[EXPANDO_KEY] = [];
      if (visible && el && chart.getDataVisibility(i) && !el.skip) {
        for (j = 0, jlen = config.labels.length; j < jlen; ++j) {
          cfg = config.labels[j];
          key = cfg._key;
          label = new Label(cfg, ctx, el, i);
          label.$groups = {
            _set: datasetIndex,
            _key: key || DEFAULT_KEY
          };
          label.$context = {
            active: false,
            chart,
            dataIndex: i,
            dataset,
            datasetIndex
          };
          label.update(label.$context);
          el[EXPANDO_KEY].push(label);
          labels.push(label);
        }
      }
    }
    ctx.restore();
    merge(expando._listeners, config.listeners, {
      merger: function(event, target, source) {
        target[event] = target[event] || {};
        target[event][args.index] = source[event];
        expando._listened = true;
      }
    });
  },
  afterUpdate: function(chart) {
    chart[EXPANDO_KEY]._labels = layout.prepare(chart[EXPANDO_KEY]._datasets);
  },
  // Draw labels on top of all dataset elements
  // https://github.com/chartjs/chartjs-plugin-datalabels/issues/29
  // https://github.com/chartjs/chartjs-plugin-datalabels/issues/32
  afterDatasetsDraw: function(chart) {
    layout.draw(chart, chart[EXPANDO_KEY]._labels);
  },
  beforeEvent: function(chart, args) {
    if (chart[EXPANDO_KEY]._listened) {
      var event = args.event;
      switch (event.type) {
        case "mousemove":
        case "mouseout":
          handleMoveEvents(chart, event);
          break;
        case "click":
          handleClickEvents(chart, event);
          break;
      }
    }
  },
  afterEvent: function(chart) {
    var expando = chart[EXPANDO_KEY];
    var previous = expando._actives;
    var actives = expando._actives = chart.getActiveElements();
    var updates = utils.arrayDiff(previous, actives);
    var i, ilen, j, jlen, update, label, labels;
    for (i = 0, ilen = updates.length; i < ilen; ++i) {
      update = updates[i];
      if (update[1]) {
        labels = update[0].element[EXPANDO_KEY] || [];
        for (j = 0, jlen = labels.length; j < jlen; ++j) {
          label = labels[j];
          label.$context.active = update[1] === 1;
          label.update(label.$context);
        }
      }
    }
    if (expando._dirty || updates.length) {
      layout.update(expando._labels);
      chart.render();
    }
    delete expando._dirty;
  }
};
class StatsChart {
  static {
    __name(this, "StatsChart");
  }
  constructor(sheet, options = {}, { id, cssclass } = { cssclass: "stats-chart" }) {
    this.sheet = sheet;
    this._options = options;
    this.id = id;
    this.cssclass = cssclass;
    this.initialized = false;
  }
  get canvas() {
    return this.sheet.element.find(`canvas.${this.cssclass}${this.id ? `#${this.id}` : ""}`);
  }
  static get defaultOptions() {
    return {
      hover: {
        mode: null
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#fff"
          }
        },
        tooltip: {
          enabled: false
        },
        datalabels: {
          formatter: function(value, context) {
            return context.chart.data.labels[context.value];
          },
          anchor: "end",
          clamp: false,
          align: "end",
          offset: 0,
          color: "white"
        }
      },
      elements: {
        point: {
          hoverRadius: 0,
          hitRadius: 0
        },
        line: {
          borderWidth: 0,
          tension: 0.05
        }
      },
      scales: {
        r: {
          grid: {
            color: "#ffffff70"
          },
          ticks: {
            display: false
          },
          pointLabels: {
            color: "#fff"
          }
        }
      }
    };
  }
  get data() {
    return {
      labels: ["HP", "ATK", "DEF", "SPD", "SP.DEF", "SP.ATK"],
      datasets: [
        {
          label: "EVs",
          data: [20, 60, 25, 60, 15, 55],
          fill: true,
          backgroundColor: "#88c5fe40",
          datalabels: {
            display: false
          },
          pointStyle: false
        },
        {
          label: "Stats",
          data: [12, 30, 22, 30, 6, 25],
          fill: true,
          backgroundColor: "#88c5febc",
          pointStyle: false
        }
      ]
    };
  }
  get options() {
    return foundry.utils.mergeObject(this.constructor.defaultOptions, this._options, { inplace: false });
  }
  render() {
    if (this.initialized)
      return this._rerender();
    if (this.canvas.length === 0)
      return console.error("No canvas found for stats chart");
    this.chart = new Chart(this.canvas, {
      plugins: [plugin],
      type: "radar",
      options: this.options,
      data: this.data
    });
    this.initialized = true;
    return this;
  }
  _rerender(updateOnly = false) {
    if (!this.initialized)
      return this.render();
    if (updateOnly) {
      this.chart.update();
      return this;
    }
    this.chart.destroy();
    this.initialized = false;
    return this.render();
  }
}
function registerHandlebarsHelpers() {
  _registerBasicHelpers();
  _registerPTRHelpers();
}
__name(registerHandlebarsHelpers, "registerHandlebarsHelpers");
function _registerPTRHelpers() {
  Handlebars.registerHelper("keywords", function(keywords) {
    return keywords.map((k) => `<span class="keyword" >&lt;${k}&gt;</span>`).join("");
  });
  Handlebars.registerHelper("calcHeight", function(percent) {
    return Math.round((100 - percent) / 100 * 48);
  });
}
__name(_registerPTRHelpers, "_registerPTRHelpers");
function _registerBasicHelpers() {
  Handlebars.registerHelper("concat", function() {
    var outStr = "";
    for (var arg in arguments) {
      if (typeof arguments[arg] != "object") {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });
  Handlebars.registerHelper("switch", function(value, options) {
    this.switch_value = value;
    return options.fn(this);
  });
  Handlebars.registerHelper("case", function(value, options) {
    if (value == this.switch_value) {
      return options.fn(this);
    }
  });
  Handlebars.registerHelper("toLowerCase", function(str) {
    return str.toLowerCase ? str.toLowerCase() : str;
  });
  Handlebars.registerHelper("capitalizeFirst", (e) => {
    return "string" != typeof e ? e : e.charAt(0).toUpperCase() + e.slice(1);
  });
  const capitalize = /* @__PURE__ */ __name(function(input) {
    var i, j, str, lowers, uppers;
    str = input.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
    lowers = [
      "A",
      "An",
      "The",
      "And",
      "But",
      "Or",
      "For",
      "Nor",
      "As",
      "At",
      "By",
      "For",
      "From",
      "In",
      "Into",
      "Near",
      "Of",
      "On",
      "Onto",
      "To",
      "With"
    ];
    for (i = 0, j = lowers.length; i < j; i++)
      str = str.replace(
        new RegExp("\\s" + lowers[i] + "\\s", "g"),
        function(txt) {
          return txt.toLowerCase();
        }
      );
    uppers = ["Id", "Tv"];
    for (i = 0, j = uppers.length; i < j; i++)
      str = str.replace(
        new RegExp("\\b" + uppers[i] + "\\b", "g"),
        uppers[i].toUpperCase()
      );
    return str;
  }, "capitalize");
  Handlebars.registerHelper("capitalize", capitalize);
  Handlebars.registerHelper("formatLocalize", (key, value) => ({
    "hash": {
      [key]: value
    }
  }));
  Handlebars.registerHelper("formatSlug", (slug) => {
    return capitalize(slug).replaceAll("-", " ");
  });
  Handlebars.registerHelper("isdefined", function(value) {
    return value !== void 0;
  });
  Handlebars.registerHelper("is", function(a, b) {
    return a == b;
  });
  Handlebars.registerHelper("bigger", function(a, b) {
    return a > b;
  });
  Handlebars.registerHelper("biggerOrEqual", function(a, b) {
    return a >= b;
  });
  Handlebars.registerHelper("and", function(a, b) {
    return a && b;
  });
  Handlebars.registerHelper("or", function(a, b) {
    return a || b;
  });
  Handlebars.registerHelper("not", function(a, b = false) {
    return a != b;
  });
  Handlebars.registerHelper("divide", (value1, value2) => Number(value1) / Number(value2));
  Handlebars.registerHelper("multiply", (value1, value2) => Number(value1) * Number(value2));
  Handlebars.registerHelper("floor", (value) => Math.floor(Number(value)));
  Handlebars.registerHelper("minMaxDiceCheck", function(roll, faces) {
    return roll == 1 ? "min" : roll == faces ? "max" : "";
  });
  Handlebars.registerHelper("isGm", function() {
    return game.user.isGM;
  });
  Handlebars.registerHelper("contains", function(needle, haystack) {
    needle = Handlebars.escapeExpression(needle);
    haystack = Handlebars.escapeExpression(haystack);
    return haystack.indexOf(needle) > -1 ? true : false;
  });
  Handlebars.registerHelper("ifContains", function(needle, haystack, options) {
    needle = Handlebars.escapeExpression(needle);
    haystack = Handlebars.escapeExpression(haystack);
    return haystack.indexOf(needle) > -1 ? options.fn(this) : options.inverse(this);
  });
  Handlebars.registerHelper("inc", function(num) {
    return Number(num) + 1;
  });
  Handlebars.registerHelper("newline", function(a) {
    return a.replace("\\n", "\n");
  });
  Handlebars.registerHelper("lpad", function(str, len, char) {
    str = str.toString();
    while (str.length < len)
      str = char + str;
    return str;
  });
  Handlebars.registerHelper("padDecimal", function(value, decimals) {
    const stringValue = String(value);
    const decimalIndex = stringValue.indexOf(".");
    if (decimalIndex === -1) {
      return `${stringValue}.${"0".repeat(decimals)}`;
    } else {
      const numDecimals = stringValue.length - decimalIndex - 1;
      if (numDecimals < decimals) {
        return `${stringValue}${"0".repeat(decimals - numDecimals)}`;
      } else {
        return stringValue;
      }
    }
  });
  Handlebars.registerHelper("diceResult", function(roll, term) {
    const result = roll.terms.find((t) => t.faces == term);
    if (result)
      return result.total ?? result.results[0].result;
  });
  Handlebars.registerHelper("split", function(str, separator) {
    return str.split(separator).map((s) => s.trim());
  });
  Handlebars.registerHelper("isNumber", function(value) {
    return isNaN(Number(value)) == false;
  });
  Handlebars.registerHelper("ld", function(key, value) {
    return { hash: { [key]: value } };
  });
  Handlebars.registerHelper("json", function(context) {
    return JSON.stringify(context);
  });
}
__name(_registerBasicHelpers, "_registerBasicHelpers");
const wordCharacter = String.raw`[\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`;
const nonWordCharacter = String.raw`[^\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]`;
const nonWordCharacterRE = new RegExp(nonWordCharacter, "gu");
const wordBoundary = String.raw`(?:${wordCharacter})(?=${nonWordCharacter})|(?:${nonWordCharacter})(?=${wordCharacter})`;
const nonWordBoundary = String.raw`(?:${wordCharacter})(?=${wordCharacter})`;
const lowerCaseLetter = String.raw`\p{Lowercase_Letter}`;
const upperCaseLetter = String.raw`\p{Uppercase_Letter}`;
const lowerCaseThenUpperCaseRE = new RegExp(`(${lowerCaseLetter})(${upperCaseLetter}${nonWordBoundary})`, "gu");
const nonWordCharacterHyphenOrSpaceRE = /[^-\p{White_Space}\p{Alphabetic}\p{Mark}\p{Decimal_Number}\p{Join_Control}]/gu;
const upperOrWordBoundariedLowerRE = new RegExp(`${upperCaseLetter}|(?:${wordBoundary})${lowerCaseLetter}`, "gu");
function sluggify(text, { camel } = { camel: null }) {
  if (typeof text !== "string") {
    console.warn("Non-string argument passed to `sluggify`");
    return "";
  }
  if (text === "-")
    return text;
  if (camel === null)
    return text.replace(lowerCaseThenUpperCaseRE, "$1-$2").toLowerCase().replace(/['’]/g, "").replace(nonWordCharacterRE, " ").trim().replace(/[-\s]+/g, "-");
  if (camel === "bactrian") {
    const dromedary = sluggify(text, { camel: "dromedary" });
    return dromedary.charAt(0).toUpperCase() + dromedary.slice(1);
  }
  if (camel === "dromedary")
    return text.replace(nonWordCharacterHyphenOrSpaceRE, "").replace(/[-_]+/g, " ").replace(
      upperOrWordBoundariedLowerRE,
      (part, index2) => index2 === 0 ? part.toLowerCase() : part.toUpperCase()
    ).replace(/\s+/g, "");
  throw new Error(`I'm pretty sure that's not a real camel: ${camel}`);
}
__name(sluggify, "sluggify");
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
__name(getDefaultExportFromCjs, "getDefaultExportFromCjs");
var tagify_min = { exports: {} };
(function(module, exports) {
  !function(t, e) {
    module.exports = e();
  }(commonjsGlobal, function() {
    function t(t2, e2) {
      var i2 = Object.keys(t2);
      if (Object.getOwnPropertySymbols) {
        var s2 = Object.getOwnPropertySymbols(t2);
        e2 && (s2 = s2.filter(function(e3) {
          return Object.getOwnPropertyDescriptor(t2, e3).enumerable;
        })), i2.push.apply(i2, s2);
      }
      return i2;
    }
    __name(t, "t");
    function e(e2) {
      for (var s2 = 1; s2 < arguments.length; s2++) {
        var a2 = null != arguments[s2] ? arguments[s2] : {};
        s2 % 2 ? t(Object(a2), true).forEach(function(t2) {
          i(e2, t2, a2[t2]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e2, Object.getOwnPropertyDescriptors(a2)) : t(Object(a2)).forEach(function(t2) {
          Object.defineProperty(e2, t2, Object.getOwnPropertyDescriptor(a2, t2));
        });
      }
      return e2;
    }
    __name(e, "e");
    function i(t2, e2, i2) {
      return e2 in t2 ? Object.defineProperty(t2, e2, { value: i2, enumerable: true, configurable: true, writable: true }) : t2[e2] = i2, t2;
    }
    __name(i, "i");
    const s = /* @__PURE__ */ __name((t2, e2, i2, s2) => (t2 = "" + t2, e2 = "" + e2, s2 && (t2 = t2.trim(), e2 = e2.trim()), i2 ? t2 == e2 : t2.toLowerCase() == e2.toLowerCase()), "s"), a = /* @__PURE__ */ __name((t2, e2) => t2 && Array.isArray(t2) && t2.map((t3) => n(t3, e2)), "a");
    function n(t2, e2) {
      var i2, s2 = {};
      for (i2 in t2)
        e2.indexOf(i2) < 0 && (s2[i2] = t2[i2]);
      return s2;
    }
    __name(n, "n");
    function o(t2) {
      var e2 = document.createElement("div");
      return t2.replace(/\&#?[0-9a-z]+;/gi, function(t3) {
        return e2.innerHTML = t3, e2.innerText;
      });
    }
    __name(o, "o");
    function r(t2) {
      return new DOMParser().parseFromString(t2.trim(), "text/html").body.firstElementChild;
    }
    __name(r, "r");
    function l(t2, e2) {
      for (e2 = e2 || "previous"; t2 = t2[e2 + "Sibling"]; )
        if (3 == t2.nodeType)
          return t2;
    }
    __name(l, "l");
    function d(t2) {
      return "string" == typeof t2 ? t2.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/`|'/g, "&#039;") : t2;
    }
    __name(d, "d");
    function h(t2) {
      var e2 = Object.prototype.toString.call(t2).split(" ")[1].slice(0, -1);
      return t2 === Object(t2) && "Array" != e2 && "Function" != e2 && "RegExp" != e2 && "HTMLUnknownElement" != e2;
    }
    __name(h, "h");
    function g(t2, e2, i2) {
      function s2(t3, e3) {
        for (var i3 in e3)
          if (e3.hasOwnProperty(i3)) {
            if (h(e3[i3])) {
              h(t3[i3]) ? s2(t3[i3], e3[i3]) : t3[i3] = Object.assign({}, e3[i3]);
              continue;
            }
            if (Array.isArray(e3[i3])) {
              t3[i3] = Object.assign([], e3[i3]);
              continue;
            }
            t3[i3] = e3[i3];
          }
      }
      __name(s2, "s2");
      return t2 instanceof Object || (t2 = {}), s2(t2, e2), i2 && s2(t2, i2), t2;
    }
    __name(g, "g");
    function p() {
      const t2 = [], e2 = {};
      for (let i2 of arguments)
        for (let s2 of i2)
          h(s2) ? e2[s2.value] || (t2.push(s2), e2[s2.value] = 1) : t2.includes(s2) || t2.push(s2);
      return t2;
    }
    __name(p, "p");
    function c(t2) {
      return String.prototype.normalize ? "string" == typeof t2 ? t2.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : void 0 : t2;
    }
    __name(c, "c");
    var u = /* @__PURE__ */ __name(() => /(?=.*chrome)(?=.*android)/i.test(navigator.userAgent), "u");
    function m() {
      return ("10000000-1000-4000-8000" + -1e11).replace(/[018]/g, (t2) => (t2 ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> t2 / 4).toString(16));
    }
    __name(m, "m");
    function v(t2) {
      return t2 && t2.classList && t2.classList.contains(this.settings.classNames.tag);
    }
    __name(v, "v");
    var f = { delimiters: ",", pattern: null, tagTextProp: "value", maxTags: 1 / 0, callbacks: {}, addTagOnBlur: true, onChangeAfterBlur: true, duplicates: false, whitelist: [], blacklist: [], enforceWhitelist: false, userInput: true, keepInvalidTags: false, createInvalidTags: true, mixTagsAllowedAfter: /,|\.|\:|\s/, mixTagsInterpolator: ["[[", "]]"], backspace: true, skipInvalid: false, pasteAsTags: true, editTags: { clicks: 2, keepInvalid: true }, transformTag: () => {
    }, trim: true, a11y: { focusableTags: false }, mixMode: { insertAfterTag: " " }, autoComplete: { enabled: true, rightKey: false }, classNames: { namespace: "tagify", mixMode: "tagify--mix", selectMode: "tagify--select", input: "tagify__input", focus: "tagify--focus", tagNoAnimation: "tagify--noAnim", tagInvalid: "tagify--invalid", tagNotAllowed: "tagify--notAllowed", scopeLoading: "tagify--loading", hasMaxTags: "tagify--hasMaxTags", hasNoTags: "tagify--noTags", empty: "tagify--empty", inputInvalid: "tagify__input--invalid", dropdown: "tagify__dropdown", dropdownWrapper: "tagify__dropdown__wrapper", dropdownHeader: "tagify__dropdown__header", dropdownFooter: "tagify__dropdown__footer", dropdownItem: "tagify__dropdown__item", dropdownItemActive: "tagify__dropdown__item--active", dropdownItemHidden: "tagify__dropdown__item--hidden", dropdownInital: "tagify__dropdown--initial", tag: "tagify__tag", tagText: "tagify__tag-text", tagX: "tagify__tag__removeBtn", tagLoading: "tagify__tag--loading", tagEditing: "tagify__tag--editable", tagFlash: "tagify__tag--flash", tagHide: "tagify__tag--hide" }, dropdown: { classname: "", enabled: 2, maxItems: 10, searchKeys: ["value", "searchBy"], fuzzySearch: true, caseSensitive: false, accentedSearch: true, includeSelectedTags: false, highlightFirst: false, closeOnSelect: true, clearOnSelect: true, position: "all", appendTarget: null }, hooks: { beforeRemoveTag: () => Promise.resolve(), beforePaste: () => Promise.resolve(), suggestionClick: () => Promise.resolve() } };
    function T() {
      this.dropdown = {};
      for (let t2 in this._dropdown)
        this.dropdown[t2] = "function" == typeof this._dropdown[t2] ? this._dropdown[t2].bind(this) : this._dropdown[t2];
      this.dropdown.refs();
    }
    __name(T, "T");
    var w = { refs() {
      this.DOM.dropdown = this.parseTemplate("dropdown", [this.settings]), this.DOM.dropdown.content = this.DOM.dropdown.querySelector("[data-selector='tagify-suggestions-wrapper']");
    }, getHeaderRef() {
      return this.DOM.dropdown.querySelector("[data-selector='tagify-suggestions-header']");
    }, getFooterRef() {
      return this.DOM.dropdown.querySelector("[data-selector='tagify-suggestions-footer']");
    }, getAllSuggestionsRefs() {
      return [...this.DOM.dropdown.content.querySelectorAll(this.settings.classNames.dropdownItemSelector)];
    }, show(t2) {
      var e2, i2, a2, n2 = this.settings, o2 = "mix" == n2.mode && !n2.enforceWhitelist, r2 = !n2.whitelist || !n2.whitelist.length, l2 = "manual" == n2.dropdown.position;
      if (t2 = void 0 === t2 ? this.state.inputText : t2, !(r2 && !o2 && !n2.templates.dropdownItemNoMatch || false === n2.dropdown.enable || this.state.isLoading || this.settings.readonly)) {
        if (clearTimeout(this.dropdownHide__bindEventsTimeout), this.suggestedListItems = this.dropdown.filterListItems(t2), t2 && !this.suggestedListItems.length && (this.trigger("dropdown:noMatch", t2), n2.templates.dropdownItemNoMatch && (a2 = n2.templates.dropdownItemNoMatch.call(this, { value: t2 }))), !a2) {
          if (this.suggestedListItems.length)
            t2 && o2 && !this.state.editing.scope && !s(this.suggestedListItems[0].value, t2) && this.suggestedListItems.unshift({ value: t2 });
          else {
            if (!t2 || !o2 || this.state.editing.scope)
              return this.input.autocomplete.suggest.call(this), void this.dropdown.hide();
            this.suggestedListItems = [{ value: t2 }];
          }
          i2 = "" + (h(e2 = this.suggestedListItems[0]) ? e2.value : e2), n2.autoComplete && i2 && 0 == i2.indexOf(t2) && this.input.autocomplete.suggest.call(this, e2);
        }
        this.dropdown.fill(a2), n2.dropdown.highlightFirst && this.dropdown.highlightOption(this.DOM.dropdown.content.querySelector(n2.classNames.dropdownItemSelector)), this.state.dropdown.visible || setTimeout(this.dropdown.events.binding.bind(this)), this.state.dropdown.visible = t2 || true, this.state.dropdown.query = t2, this.setStateSelection(), l2 || setTimeout(() => {
          this.dropdown.position(), this.dropdown.render();
        }), setTimeout(() => {
          this.trigger("dropdown:show", this.DOM.dropdown);
        });
      }
    }, hide(t2) {
      var e2 = this.DOM, i2 = e2.scope, s2 = e2.dropdown, a2 = "manual" == this.settings.dropdown.position && !t2;
      if (s2 && document.body.contains(s2) && !a2)
        return window.removeEventListener("resize", this.dropdown.position), this.dropdown.events.binding.call(this, false), i2.setAttribute("aria-expanded", false), s2.parentNode.removeChild(s2), setTimeout(() => {
          this.state.dropdown.visible = false;
        }, 100), this.state.dropdown.query = this.state.ddItemData = this.state.ddItemElm = this.state.selection = null, this.state.tag && this.state.tag.value.length && (this.state.flaggedTags[this.state.tag.baseOffset] = this.state.tag), this.trigger("dropdown:hide", s2), this;
    }, toggle(t2) {
      this.dropdown[this.state.dropdown.visible && !t2 ? "hide" : "show"]();
    }, render() {
      var t2, e2, i2, s2 = (t2 = this.DOM.dropdown, (i2 = t2.cloneNode(true)).style.cssText = "position:fixed; top:-9999px; opacity:0", document.body.appendChild(i2), e2 = i2.clientHeight, i2.parentNode.removeChild(i2), e2), a2 = this.settings;
      return "number" == typeof a2.dropdown.enabled && a2.dropdown.enabled >= 0 ? (this.DOM.scope.setAttribute("aria-expanded", true), document.body.contains(this.DOM.dropdown) || (this.DOM.dropdown.classList.add(a2.classNames.dropdownInital), this.dropdown.position(s2), a2.dropdown.appendTarget.appendChild(this.DOM.dropdown), setTimeout(() => this.DOM.dropdown.classList.remove(a2.classNames.dropdownInital))), this) : this;
    }, fill(t2) {
      t2 = "string" == typeof t2 ? t2 : this.dropdown.createListHTML(t2 || this.suggestedListItems);
      var e2, i2 = this.settings.templates.dropdownContent.call(this, t2);
      this.DOM.dropdown.content.innerHTML = (e2 = i2) ? e2.replace(/\>[\r\n ]+\</g, "><").replace(/(<.*?>)|\s+/g, (t3, e3) => e3 || " ") : "";
    }, fillHeaderFooter() {
      this.settings.templates;
      var t2 = this.dropdown.filterListItems(this.state.dropdown.query), e2 = this.parseTemplate("dropdownHeader", [t2]), i2 = this.parseTemplate("dropdownFooter", [t2]), s2 = this.dropdown.getHeaderRef(), a2 = this.dropdown.getFooterRef();
      e2 && s2?.parentNode.replaceChild(e2, s2), i2 && a2?.parentNode.replaceChild(i2, a2);
    }, refilter(t2) {
      t2 = t2 || this.state.dropdown.query || "", this.suggestedListItems = this.dropdown.filterListItems(t2), this.dropdown.fill(), this.suggestedListItems.length || this.dropdown.hide(), this.trigger("dropdown:updated", this.DOM.dropdown);
    }, position(t2) {
      var e2 = this.settings.dropdown;
      if ("manual" != e2.position) {
        var i2, s2, a2, n2, o2, r2, l2 = this.DOM.dropdown, d2 = e2.placeAbove, h22 = e2.appendTarget === document.body, g2 = h22 ? window.pageYOffset : e2.appendTarget.scrollTop, p2 = document.fullscreenElement || document.webkitFullscreenElement || document.documentElement, c2 = p2.clientHeight, u2 = Math.max(p2.clientWidth || 0, window.innerWidth || 0) > 480 ? e2.position : "all", m2 = this.DOM["input" == u2 ? "input" : "scope"];
        if (t2 = t2 || l2.clientHeight, this.state.dropdown.visible) {
          if ("text" == u2 ? (a2 = (i2 = this.getCaretGlobalPosition()).bottom, s2 = i2.top, n2 = i2.left, o2 = "auto") : (r2 = function(t3) {
            for (var e3 = 0, i3 = 0; t3 && t3 != p2; )
              e3 += t3.offsetLeft || 0, i3 += t3.offsetTop || 0, t3 = t3.parentNode;
            return { left: e3, top: i3 };
          }(e2.appendTarget), s2 = (i2 = m2.getBoundingClientRect()).top - r2.top, a2 = i2.bottom - 1 - r2.top, n2 = i2.left - r2.left, o2 = i2.width + "px"), !h22) {
            let t3 = function() {
              for (var t4 = 0, i3 = e2.appendTarget.parentNode; i3; )
                t4 += i3.scrollTop || 0, i3 = i3.parentNode;
              return t4;
            }();
            s2 += t3, a2 += t3;
          }
          s2 = Math.floor(s2), a2 = Math.ceil(a2), d2 = void 0 === d2 ? c2 - i2.bottom < t2 : d2, l2.style.cssText = "left:" + (n2 + window.pageXOffset) + "px; width:" + o2 + ";" + (d2 ? "top: " + (s2 + g2) + "px" : "top: " + (a2 + g2) + "px"), l2.setAttribute("placement", d2 ? "top" : "bottom"), l2.setAttribute("position", u2);
        }
      }
    }, events: { binding() {
      let t2 = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
      var e2 = this.dropdown.events.callbacks, i2 = this.listeners.dropdown = this.listeners.dropdown || { position: this.dropdown.position.bind(this, null), onKeyDown: e2.onKeyDown.bind(this), onMouseOver: e2.onMouseOver.bind(this), onMouseLeave: e2.onMouseLeave.bind(this), onClick: e2.onClick.bind(this), onScroll: e2.onScroll.bind(this) }, s2 = t2 ? "addEventListener" : "removeEventListener";
      "manual" != this.settings.dropdown.position && (document[s2]("scroll", i2.position, true), window[s2]("resize", i2.position), window[s2]("keydown", i2.onKeyDown)), this.DOM.dropdown[s2]("mouseover", i2.onMouseOver), this.DOM.dropdown[s2]("mouseleave", i2.onMouseLeave), this.DOM.dropdown[s2]("mousedown", i2.onClick), this.DOM.dropdown.content[s2]("scroll", i2.onScroll);
    }, callbacks: { onKeyDown(t2) {
      if (this.state.hasFocus && !this.state.composing) {
        var e2 = this.DOM.dropdown.querySelector(this.settings.classNames.dropdownItemActiveSelector), i2 = this.dropdown.getSuggestionDataByNode(e2);
        switch (t2.key) {
          case "ArrowDown":
          case "ArrowUp":
          case "Down":
          case "Up":
            t2.preventDefault();
            var s2 = this.dropdown.getAllSuggestionsRefs(), a2 = "ArrowUp" == t2.key || "Up" == t2.key;
            e2 && (e2 = this.dropdown.getNextOrPrevOption(e2, !a2)), e2 && e2.matches(this.settings.classNames.dropdownItemSelector) || (e2 = s2[a2 ? s2.length - 1 : 0]), i2 = this.dropdown.getSuggestionDataByNode(e2), this.dropdown.highlightOption(e2, true);
            break;
          case "Escape":
          case "Esc":
            this.dropdown.hide();
            break;
          case "ArrowRight":
            if (this.state.actions.ArrowLeft)
              return;
          case "Tab":
            if ("mix" != this.settings.mode && e2 && !this.settings.autoComplete.rightKey && !this.state.editing) {
              t2.preventDefault();
              var n2 = this.dropdown.getMappedValue(i2);
              return this.input.autocomplete.set.call(this, n2), false;
            }
            return true;
          case "Enter":
            t2.preventDefault(), this.settings.hooks.suggestionClick(t2, { tagify: this, tagData: i2, suggestionElm: e2 }).then(() => {
              if (e2)
                return this.dropdown.selectOption(e2), e2 = this.dropdown.getNextOrPrevOption(e2, !a2), void this.dropdown.highlightOption(e2);
              this.dropdown.hide(), "mix" != this.settings.mode && this.addTags(this.state.inputText.trim(), true);
            }).catch((t3) => t3);
            break;
          case "Backspace": {
            if ("mix" == this.settings.mode || this.state.editing.scope)
              return;
            const t3 = this.input.raw.call(this);
            "" != t3 && 8203 != t3.charCodeAt(0) || (true === this.settings.backspace ? this.removeTags() : "edit" == this.settings.backspace && setTimeout(this.editTag.bind(this), 0));
          }
        }
      }
    }, onMouseOver(t2) {
      var e2 = t2.target.closest(this.settings.classNames.dropdownItemSelector);
      e2 && this.dropdown.highlightOption(e2);
    }, onMouseLeave(t2) {
      this.dropdown.highlightOption();
    }, onClick(t2) {
      if (0 == t2.button && t2.target != this.DOM.dropdown && t2.target != this.DOM.dropdown.content) {
        var e2 = t2.target.closest(this.settings.classNames.dropdownItemSelector), i2 = this.dropdown.getSuggestionDataByNode(e2);
        this.state.actions.selectOption = true, setTimeout(() => this.state.actions.selectOption = false, 50), this.settings.hooks.suggestionClick(t2, { tagify: this, tagData: i2, suggestionElm: e2 }).then(() => {
          e2 ? this.dropdown.selectOption(e2, t2) : this.dropdown.hide();
        }).catch((t3) => console.warn(t3));
      }
    }, onScroll(t2) {
      var e2 = t2.target, i2 = e2.scrollTop / (e2.scrollHeight - e2.parentNode.clientHeight) * 100;
      this.trigger("dropdown:scroll", { percentage: Math.round(i2) });
    } } }, getSuggestionDataByNode(t2) {
      var e2 = t2 && t2.getAttribute("value");
      return this.suggestedListItems.find((t3) => t3.value == e2) || null;
    }, getNextOrPrevOption(t2) {
      let e2 = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
      var i2 = this.dropdown.getAllSuggestionsRefs(), s2 = i2.findIndex((e3) => e3 === t2);
      return e2 ? i2[s2 + 1] : i2[s2 - 1];
    }, highlightOption(t2, e2) {
      var i2, s2 = this.settings.classNames.dropdownItemActive;
      if (this.state.ddItemElm && (this.state.ddItemElm.classList.remove(s2), this.state.ddItemElm.removeAttribute("aria-selected")), !t2)
        return this.state.ddItemData = null, this.state.ddItemElm = null, void this.input.autocomplete.suggest.call(this);
      i2 = this.dropdown.getSuggestionDataByNode(t2), this.state.ddItemData = i2, this.state.ddItemElm = t2, t2.classList.add(s2), t2.setAttribute("aria-selected", true), e2 && (t2.parentNode.scrollTop = t2.clientHeight + t2.offsetTop - t2.parentNode.clientHeight), this.settings.autoComplete && (this.input.autocomplete.suggest.call(this, i2), this.dropdown.position());
    }, selectOption(t2, e2) {
      var i2 = this.settings.dropdown, s2 = i2.clearOnSelect, a2 = i2.closeOnSelect;
      if (!t2)
        return this.addTags(this.state.inputText, true), void (a2 && this.dropdown.hide());
      e2 = e2 || {};
      var n2 = t2.getAttribute("value"), o2 = "noMatch" == n2, r2 = this.suggestedListItems.find((t3) => (t3.value || t3) == n2);
      this.trigger("dropdown:select", { data: r2, elm: t2, event: e2 }), n2 && (r2 || o2) ? (this.state.editing ? this.onEditTagDone(null, g({ __isValid: true }, this.normalizeTags([r2])[0])) : this["mix" == this.settings.mode ? "addMixTags" : "addTags"]([r2 || this.input.raw.call(this)], s2), this.DOM.input.parentNode && (setTimeout(() => {
        this.DOM.input.focus(), this.toggleFocusClass(true), this.setRangeAtStartEnd(false);
      }), a2 && setTimeout(this.dropdown.hide.bind(this)), t2.addEventListener("transitionend", () => {
        this.dropdown.fillHeaderFooter(), setTimeout(() => t2.remove(), 100);
      }, { once: true }), t2.classList.add(this.settings.classNames.dropdownItemHidden))) : a2 && setTimeout(this.dropdown.hide.bind(this));
    }, selectAll(t2) {
      this.suggestedListItems.length = 0, this.dropdown.hide(), this.dropdown.filterListItems("");
      var e2 = this.dropdown.filterListItems("");
      return t2 || (e2 = this.state.dropdown.suggestions), this.addTags(e2, true), this;
    }, filterListItems(t2, e2) {
      var i2, s2, a2, n2, o2, r2 = this.settings, l2 = r2.dropdown, d2 = (e2 = e2 || {}, []), g2 = [], p2 = r2.whitelist, u2 = l2.maxItems >= 0 ? l2.maxItems : 1 / 0, m2 = l2.searchKeys, v2 = 0;
      if (!(t2 = "select" == r2.mode && this.value.length && this.value[0][r2.tagTextProp] == t2 ? "" : t2) || !m2.length)
        return d2 = l2.includeSelectedTags ? p2 : p2.filter((t3) => !this.isTagDuplicate(h(t3) ? t3.value : t3)), this.state.dropdown.suggestions = d2, d2.slice(0, u2);
      function f2(t3, e3) {
        return e3.toLowerCase().split(" ").every((e4) => t3.includes(e4.toLowerCase()));
      }
      __name(f2, "f2");
      for (o2 = l2.caseSensitive ? "" + t2 : ("" + t2).toLowerCase(); v2 < p2.length; v2++) {
        let t3, r3;
        i2 = p2[v2] instanceof Object ? p2[v2] : { value: p2[v2] };
        let u3 = !Object.keys(i2).some((t4) => m2.includes(t4)) ? ["value"] : m2;
        l2.fuzzySearch && !e2.exact ? (a2 = u3.reduce((t4, e3) => t4 + " " + (i2[e3] || ""), "").toLowerCase().trim(), l2.accentedSearch && (a2 = c(a2), o2 = c(o2)), t3 = 0 == a2.indexOf(o2), r3 = a2 === o2, s2 = f2(a2, o2)) : (t3 = true, s2 = u3.some((t4) => {
          var s3 = "" + (i2[t4] || "");
          return l2.accentedSearch && (s3 = c(s3), o2 = c(o2)), l2.caseSensitive || (s3 = s3.toLowerCase()), r3 = s3 === o2, e2.exact ? s3 === o2 : 0 == s3.indexOf(o2);
        })), n2 = !l2.includeSelectedTags && this.isTagDuplicate(h(i2) ? i2.value : i2), s2 && !n2 && (r3 && t3 ? g2.push(i2) : "startsWith" == l2.sortby && t3 ? d2.unshift(i2) : d2.push(i2));
      }
      return this.state.dropdown.suggestions = g2.concat(d2), "function" == typeof l2.sortby ? l2.sortby(g2.concat(d2), o2) : g2.concat(d2).slice(0, u2);
    }, getMappedValue(t2) {
      var e2 = this.settings.dropdown.mapValueTo;
      return e2 ? "function" == typeof e2 ? e2(t2) : t2[e2] || t2.value : t2.value;
    }, createListHTML(t2) {
      return g([], t2).map((t3, i2) => {
        "string" != typeof t3 && "number" != typeof t3 || (t3 = { value: t3 });
        var s2 = this.dropdown.getMappedValue(t3);
        return s2 = "string" == typeof s2 ? d(s2) : s2, this.settings.templates.dropdownItem.apply(this, [e(e({}, t3), {}, { mappedValue: s2 }), this]);
      }).join("");
    } };
    const b = "@yaireo/tagify/";
    var y, x = { empty: "empty", exceed: "number of tags exceeded", pattern: "pattern mismatch", duplicate: "already exists", notAllowed: "not allowed" }, D = { wrapper: (t2, e2) => `<tags class="${e2.classNames.namespace} ${e2.mode ? `${e2.classNames[e2.mode + "Mode"]}` : ""} ${t2.className}"
                    ${e2.readonly ? "readonly" : ""}
                    ${e2.disabled ? "disabled" : ""}
                    ${e2.required ? "required" : ""}
                    ${"select" === e2.mode ? "spellcheck='false'" : ""}
                    tabIndex="-1">
            <span ${!e2.readonly && e2.userInput ? "contenteditable" : ""} tabIndex="0" data-placeholder="${e2.placeholder || "&#8203;"}" aria-placeholder="${e2.placeholder || ""}"
                class="${e2.classNames.input}"
                role="textbox"
                aria-autocomplete="both"
                aria-multiline="${"mix" == e2.mode}"></span>
                &#8203;
        </tags>`, tag(t2, e2) {
      let i2 = e2.settings;
      return `<tag title="${t2.title || t2.value}"
                    contenteditable='false'
                    spellcheck='false'
                    tabIndex="${i2.a11y.focusableTags ? 0 : -1}"
                    class="${i2.classNames.tag} ${t2.class || ""}"
                    ${this.getAttributes(t2)}>
            <x title='' class="${i2.classNames.tagX}" role='button' aria-label='remove tag'></x>
            <div>
                <span class="${i2.classNames.tagText}">${t2[i2.tagTextProp] || t2.value}</span>
            </div>
        </tag>`;
    }, dropdown(t2) {
      var e2 = t2.dropdown, i2 = "manual" == e2.position, s2 = `${t2.classNames.dropdown}`;
      return `<div class="${i2 ? "" : s2} ${e2.classname}" role="listbox" aria-labelledby="dropdown">
                    <div data-selector='tagify-suggestions-wrapper' class="${t2.classNames.dropdownWrapper}"></div>
                </div>`;
    }, dropdownContent(t2) {
      var e2 = this.settings, i2 = this.state.dropdown.suggestions;
      return `
            ${e2.templates.dropdownHeader.call(this, i2)}
            ${t2}
            ${e2.templates.dropdownFooter.call(this, i2)}
        `;
    }, dropdownItem(t2) {
      return `<div ${this.getAttributes(t2)}
                    class='${this.settings.classNames.dropdownItem} ${t2.class ? t2.class : ""}'
                    tabindex="0"
                    role="option">${t2.mappedValue || t2.value}</div>`;
    }, dropdownHeader(t2) {
      return `<header data-selector='tagify-suggestions-header' class="${this.settings.classNames.dropdownHeader}"></header>`;
    }, dropdownFooter(t2) {
      var e2 = t2.length - this.settings.dropdown.maxItems;
      return e2 > 0 ? `<footer data-selector='tagify-suggestions-footer' class="${this.settings.classNames.dropdownFooter}">
                ${e2} more items. Refine your search.
            </footer>` : "";
    }, dropdownItemNoMatch: null };
    var O = { customBinding() {
      this.customEventsList.forEach((t2) => {
        this.on(t2, this.settings.callbacks[t2]);
      });
    }, binding() {
      let t2 = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
      var e2, i2 = this.events.callbacks, s2 = t2 ? "addEventListener" : "removeEventListener";
      if (!this.state.mainEvents || !t2) {
        for (var a2 in this.state.mainEvents = t2, t2 && !this.listeners.main && (this.events.bindGlobal.call(this), this.settings.isJQueryPlugin && jQuery(this.DOM.originalInput).on("tagify.removeAllTags", this.removeAllTags.bind(this))), e2 = this.listeners.main = this.listeners.main || { focus: ["input", i2.onFocusBlur.bind(this)], keydown: ["input", i2.onKeydown.bind(this)], click: ["scope", i2.onClickScope.bind(this)], dblclick: ["scope", i2.onDoubleClickScope.bind(this)], paste: ["input", i2.onPaste.bind(this)], drop: ["input", i2.onDrop.bind(this)], compositionstart: ["input", i2.onCompositionStart.bind(this)], compositionend: ["input", i2.onCompositionEnd.bind(this)] })
          this.DOM[e2[a2][0]][s2](a2, e2[a2][1]);
        clearInterval(this.listeners.main.originalInputValueObserverInterval), this.listeners.main.originalInputValueObserverInterval = setInterval(i2.observeOriginalInputValue.bind(this), 500);
        var n2 = this.listeners.main.inputMutationObserver || new MutationObserver(i2.onInputDOMChange.bind(this));
        n2 && n2.disconnect(), "mix" == this.settings.mode && n2.observe(this.DOM.input, { childList: true });
      }
    }, bindGlobal(t2) {
      var e2, i2 = this.events.callbacks, s2 = t2 ? "removeEventListener" : "addEventListener";
      if (t2 || !this.listeners.global)
        for (e2 of (this.listeners.global = this.listeners && this.listeners.global || [{ type: this.isIE ? "keydown" : "input", target: this.DOM.input, cb: i2[this.isIE ? "onInputIE" : "onInput"].bind(this) }, { type: "keydown", target: window, cb: i2.onWindowKeyDown.bind(this) }, { type: "blur", target: this.DOM.input, cb: i2.onFocusBlur.bind(this) }], this.listeners.global))
          e2.target[s2](e2.type, e2.cb);
    }, unbindGlobal() {
      this.events.bindGlobal.call(this, true);
    }, callbacks: { onFocusBlur(t2) {
      var e2 = this.settings, i2 = t2.target ? this.trim(t2.target.textContent) : "", s2 = this.value?.[0]?.[e2.tagTextProp], a2 = t2.type, n2 = e2.dropdown.enabled >= 0, o2 = { relatedTarget: t2.relatedTarget }, r2 = this.state.actions.selectOption && (n2 || !e2.dropdown.closeOnSelect), l2 = this.state.actions.addNew && n2, d2 = t2.relatedTarget && v.call(this, t2.relatedTarget) && this.DOM.scope.contains(t2.relatedTarget);
      if ("blur" == a2) {
        if (t2.relatedTarget === this.DOM.scope)
          return this.dropdown.hide(), void this.DOM.input.focus();
        this.postUpdate(), e2.onChangeAfterBlur && this.triggerChangeEvent();
      }
      if (!r2 && !l2)
        if (this.state.hasFocus = "focus" == a2 && +/* @__PURE__ */ new Date(), this.toggleFocusClass(this.state.hasFocus), "mix" != e2.mode) {
          if ("focus" == a2)
            return this.trigger("focus", o2), void (0 !== e2.dropdown.enabled && e2.userInput || this.dropdown.show(this.value.length ? "" : void 0));
          "blur" == a2 && (this.trigger("blur", o2), this.loading(false), "select" == e2.mode && (d2 && (this.removeTags(), i2 = ""), s2 === i2 && (i2 = "")), i2 && !this.state.actions.selectOption && e2.addTagOnBlur && this.addTags(i2, true)), this.DOM.input.removeAttribute("style"), this.dropdown.hide();
        } else
          "focus" == a2 ? this.trigger("focus", o2) : "blur" == t2.type && (this.trigger("blur", o2), this.loading(false), this.dropdown.hide(), this.state.dropdown.visible = void 0, this.setStateSelection());
    }, onCompositionStart(t2) {
      this.state.composing = true;
    }, onCompositionEnd(t2) {
      this.state.composing = false;
    }, onWindowKeyDown(t2) {
      var e2, i2 = document.activeElement;
      if (v.call(this, i2) && this.DOM.scope.contains(document.activeElement))
        switch (e2 = i2.nextElementSibling, t2.key) {
          case "Backspace":
            this.settings.readonly || (this.removeTags(i2), (e2 || this.DOM.input).focus());
            break;
          case "Enter":
            setTimeout(this.editTag.bind(this), 0, i2);
        }
    }, onKeydown(t2) {
      var e2 = this.settings;
      if (!this.state.composing && e2.userInput) {
        "select" == e2.mode && e2.enforceWhitelist && this.value.length && "Tab" != t2.key && t2.preventDefault();
        var i2 = this.trim(t2.target.textContent);
        if (this.trigger("keydown", { event: t2 }), "mix" == e2.mode) {
          switch (t2.key) {
            case "Left":
            case "ArrowLeft":
              this.state.actions.ArrowLeft = true;
              break;
            case "Delete":
            case "Backspace":
              if (this.state.editing)
                return;
              var s2, a2, n2, r2 = document.getSelection(), d2 = "Delete" == t2.key && r2.anchorOffset == (r2.anchorNode.length || 0), h22 = r2.anchorNode.previousSibling, g2 = 1 == r2.anchorNode.nodeType || !r2.anchorOffset && h22 && 1 == h22.nodeType && r2.anchorNode.previousSibling, p2 = o(this.DOM.input.innerHTML), c2 = this.getTagElms();
              if ("edit" == e2.backspace && g2)
                return s2 = 1 == r2.anchorNode.nodeType ? null : r2.anchorNode.previousElementSibling, setTimeout(this.editTag.bind(this), 0, s2), void t2.preventDefault();
              if (u() && g2)
                return n2 = l(g2), g2.hasAttribute("readonly") || g2.remove(), this.DOM.input.focus(), void setTimeout(() => {
                  this.placeCaretAfterNode(n2), this.DOM.input.click();
                });
              if ("BR" == r2.anchorNode.nodeName)
                return;
              if ((d2 || g2) && 1 == r2.anchorNode.nodeType ? a2 = 0 == r2.anchorOffset ? d2 ? c2[0] : null : c2[Math.min(c2.length, r2.anchorOffset) - 1] : d2 ? a2 = r2.anchorNode.nextElementSibling : g2 && (a2 = g2), 3 == r2.anchorNode.nodeType && !r2.anchorNode.nodeValue && r2.anchorNode.previousElementSibling && t2.preventDefault(), (g2 || d2) && !e2.backspace)
                return void t2.preventDefault();
              if ("Range" != r2.type && !r2.anchorOffset && r2.anchorNode == this.DOM.input && "Delete" != t2.key)
                return void t2.preventDefault();
              if ("Range" != r2.type && a2 && a2.hasAttribute("readonly"))
                return void this.placeCaretAfterNode(l(a2));
              clearTimeout(y), y = setTimeout(() => {
                var t3 = document.getSelection(), e3 = o(this.DOM.input.innerHTML), i3 = !d2 && t3.anchorNode.previousSibling;
                if (e3.length >= p2.length && i3)
                  if (v.call(this, i3) && !i3.hasAttribute("readonly")) {
                    if (this.removeTags(i3), this.fixFirefoxLastTagNoCaret(), 2 == this.DOM.input.children.length && "BR" == this.DOM.input.children[1].tagName)
                      return this.DOM.input.innerHTML = "", this.value.length = 0, true;
                  } else
                    i3.remove();
                this.value = [].map.call(c2, (t4, e4) => {
                  var i4 = this.tagData(t4);
                  if (t4.parentNode || i4.readonly)
                    return i4;
                  this.trigger("remove", { tag: t4, index: e4, data: i4 });
                }).filter((t4) => t4);
              }, 20);
          }
          return true;
        }
        switch (t2.key) {
          case "Backspace":
            "select" == e2.mode && e2.enforceWhitelist && this.value.length ? this.removeTags() : this.state.dropdown.visible && "manual" != e2.dropdown.position || "" != t2.target.textContent && 8203 != i2.charCodeAt(0) || (true === e2.backspace ? this.removeTags() : "edit" == e2.backspace && setTimeout(this.editTag.bind(this), 0));
            break;
          case "Esc":
          case "Escape":
            if (this.state.dropdown.visible)
              return;
            t2.target.blur();
            break;
          case "Down":
          case "ArrowDown":
            this.state.dropdown.visible || this.dropdown.show();
            break;
          case "ArrowRight": {
            let t3 = this.state.inputSuggestion || this.state.ddItemData;
            if (t3 && e2.autoComplete.rightKey)
              return void this.addTags([t3], true);
            break;
          }
          case "Tab": {
            let s3 = "select" == e2.mode;
            if (!i2 || s3)
              return true;
            t2.preventDefault();
          }
          case "Enter":
            if (this.state.dropdown.visible && "manual" != e2.dropdown.position)
              return;
            t2.preventDefault(), setTimeout(() => {
              this.state.actions.selectOption || this.addTags(i2, true);
            });
        }
      }
    }, onInput(t2) {
      this.postUpdate();
      var e2 = this.settings;
      if ("mix" == e2.mode)
        return this.events.callbacks.onMixTagsInput.call(this, t2);
      var i2 = this.input.normalize.call(this), s2 = i2.length >= e2.dropdown.enabled, a2 = { value: i2, inputElm: this.DOM.input }, n2 = this.validateTag({ value: i2 });
      "select" == e2.mode && this.toggleScopeValidation(n2), a2.isValid = n2, this.state.inputText != i2 && (this.input.set.call(this, i2, false), -1 != i2.search(e2.delimiters) ? this.addTags(i2) && this.input.set.call(this) : e2.dropdown.enabled >= 0 && this.dropdown[s2 ? "show" : "hide"](i2), this.trigger("input", a2));
    }, onMixTagsInput(t2) {
      var e2, i2, s2, a2, n2, o2, r2, l2, d2 = this.settings, h22 = this.value.length, p2 = this.getTagElms(), c2 = document.createDocumentFragment(), m2 = window.getSelection().getRangeAt(0), v2 = [].map.call(p2, (t3) => this.tagData(t3).value);
      if ("deleteContentBackward" == t2.inputType && u() && this.events.callbacks.onKeydown.call(this, { target: t2.target, key: "Backspace" }), this.value.slice().forEach((t3) => {
        t3.readonly && !v2.includes(t3.value) && c2.appendChild(this.createTagElem(t3));
      }), c2.childNodes.length && (m2.insertNode(c2), this.setRangeAtStartEnd(false, c2.lastChild)), p2.length != h22)
        return this.value = [].map.call(this.getTagElms(), (t3) => this.tagData(t3)), void this.update({ withoutChangeEvent: true });
      if (this.hasMaxTags())
        return true;
      if (window.getSelection && (o2 = window.getSelection()).rangeCount > 0 && 3 == o2.anchorNode.nodeType) {
        if ((m2 = o2.getRangeAt(0).cloneRange()).collapse(true), m2.setStart(o2.focusNode, 0), s2 = (e2 = m2.toString().slice(0, m2.endOffset)).split(d2.pattern).length - 1, (i2 = e2.match(d2.pattern)) && (a2 = e2.slice(e2.lastIndexOf(i2[i2.length - 1]))), a2) {
          if (this.state.actions.ArrowLeft = false, this.state.tag = { prefix: a2.match(d2.pattern)[0], value: a2.replace(d2.pattern, "") }, this.state.tag.baseOffset = o2.baseOffset - this.state.tag.value.length, l2 = this.state.tag.value.match(d2.delimiters))
            return this.state.tag.value = this.state.tag.value.replace(d2.delimiters, ""), this.state.tag.delimiters = l2[0], this.addTags(this.state.tag.value, d2.dropdown.clearOnSelect), void this.dropdown.hide();
          n2 = this.state.tag.value.length >= d2.dropdown.enabled;
          try {
            r2 = (r2 = this.state.flaggedTags[this.state.tag.baseOffset]).prefix == this.state.tag.prefix && r2.value[0] == this.state.tag.value[0], this.state.flaggedTags[this.state.tag.baseOffset] && !this.state.tag.value && delete this.state.flaggedTags[this.state.tag.baseOffset];
          } catch (t3) {
          }
          (r2 || s2 < this.state.mixMode.matchedPatternCount) && (n2 = false);
        } else
          this.state.flaggedTags = {};
        this.state.mixMode.matchedPatternCount = s2;
      }
      setTimeout(() => {
        this.update({ withoutChangeEvent: true }), this.trigger("input", g({}, this.state.tag, { textContent: this.DOM.input.textContent })), this.state.tag && this.dropdown[n2 ? "show" : "hide"](this.state.tag.value);
      }, 10);
    }, onInputIE(t2) {
      var e2 = this;
      setTimeout(function() {
        e2.events.callbacks.onInput.call(e2, t2);
      });
    }, observeOriginalInputValue() {
      this.DOM.originalInput.parentNode || this.destroy(), this.DOM.originalInput.value != this.DOM.originalInput.tagifyValue && this.loadOriginalValues();
    }, onClickScope(t2) {
      var e2 = this.settings, i2 = t2.target.closest("." + e2.classNames.tag), s2 = +/* @__PURE__ */ new Date() - this.state.hasFocus;
      if (t2.target != this.DOM.scope) {
        if (!t2.target.classList.contains(e2.classNames.tagX))
          return i2 ? (this.trigger("click", { tag: i2, index: this.getNodeIndex(i2), data: this.tagData(i2), event: t2 }), void (1 !== e2.editTags && 1 !== e2.editTags.clicks || this.events.callbacks.onDoubleClickScope.call(this, t2))) : void (t2.target == this.DOM.input && ("mix" == e2.mode && this.fixFirefoxLastTagNoCaret(), s2 > 500) ? this.state.dropdown.visible ? this.dropdown.hide() : 0 === e2.dropdown.enabled && "mix" != e2.mode && this.dropdown.show(this.value.length ? "" : void 0) : "select" == e2.mode && !this.state.dropdown.visible && this.dropdown.show());
        this.removeTags(t2.target.parentNode);
      } else
        this.state.hasFocus || this.DOM.input.focus();
    }, onPaste(t2) {
      t2.preventDefault();
      var e2, i2, s2 = this.settings;
      if ("select" == s2.mode && s2.enforceWhitelist || !s2.userInput)
        return false;
      s2.readonly || (e2 = t2.clipboardData || window.clipboardData, i2 = e2.getData("Text"), s2.hooks.beforePaste(t2, { tagify: this, pastedText: i2, clipboardData: e2 }).then((e3) => {
        void 0 === e3 && (e3 = i2), e3 && (this.injectAtCaret(e3, window.getSelection().getRangeAt(0)), "mix" == this.settings.mode ? this.events.callbacks.onMixTagsInput.call(this, t2) : this.settings.pasteAsTags ? this.addTags(this.state.inputText + e3, true) : this.state.inputText = e3);
      }).catch((t3) => t3));
    }, onDrop(t2) {
      t2.preventDefault();
    }, onEditTagInput(t2, e2) {
      var i2 = t2.closest("." + this.settings.classNames.tag), s2 = this.getNodeIndex(i2), a2 = this.tagData(i2), n2 = this.input.normalize.call(this, t2), o2 = { [this.settings.tagTextProp]: n2, __tagId: a2.__tagId }, r2 = this.validateTag(o2);
      this.editTagChangeDetected(g(a2, o2)) || true !== t2.originalIsValid || (r2 = true), i2.classList.toggle(this.settings.classNames.tagInvalid, true !== r2), a2.__isValid = r2, i2.title = true === r2 ? a2.title || a2.value : r2, n2.length >= this.settings.dropdown.enabled && (this.state.editing && (this.state.editing.value = n2), this.dropdown.show(n2)), this.trigger("edit:input", { tag: i2, index: s2, data: g({}, this.value[s2], { newValue: n2 }), event: e2 });
    }, onEditTagFocus(t2) {
      this.state.editing = { scope: t2, input: t2.querySelector("[contenteditable]") };
    }, onEditTagBlur(t2) {
      if (this.state.hasFocus || this.toggleFocusClass(), this.DOM.scope.contains(t2)) {
        var e2, i2, s2 = this.settings, a2 = t2.closest("." + s2.classNames.tag), n2 = this.input.normalize.call(this, t2), o2 = this.tagData(a2), r2 = o2.__originalData, l2 = this.editTagChangeDetected(o2), d2 = this.validateTag({ [s2.tagTextProp]: n2, __tagId: o2.__tagId });
        if (n2)
          if (l2) {
            if (e2 = this.hasMaxTags(), i2 = g({}, r2, { [s2.tagTextProp]: this.trim(n2), __isValid: d2 }), s2.transformTag.call(this, i2, r2), true !== (d2 = (!e2 || true === r2.__isValid) && this.validateTag(i2))) {
              if (this.trigger("invalid", { data: i2, tag: a2, message: d2 }), s2.editTags.keepInvalid)
                return;
              s2.keepInvalidTags ? i2.__isValid = d2 : i2 = r2;
            } else
              s2.keepInvalidTags && (delete i2.title, delete i2["aria-invalid"], delete i2.class);
            this.onEditTagDone(a2, i2);
          } else
            this.onEditTagDone(a2, r2);
        else
          this.onEditTagDone(a2);
      }
    }, onEditTagkeydown(t2, e2) {
      if (!this.state.composing)
        switch (this.trigger("edit:keydown", { event: t2 }), t2.key) {
          case "Esc":
          case "Escape":
            e2.parentNode.replaceChild(e2.__tagifyTagData.__originalHTML, e2), this.state.editing = false;
          case "Enter":
          case "Tab":
            t2.preventDefault(), t2.target.blur();
        }
    }, onDoubleClickScope(t2) {
      var e2, i2, s2 = t2.target.closest("." + this.settings.classNames.tag), a2 = this.tagData(s2), n2 = this.settings;
      s2 && n2.userInput && false !== a2.editable && (e2 = s2.classList.contains(this.settings.classNames.tagEditing), i2 = s2.hasAttribute("readonly"), "select" == n2.mode || n2.readonly || e2 || i2 || !this.settings.editTags || this.editTag(s2), this.toggleFocusClass(true), this.trigger("dblclick", { tag: s2, index: this.getNodeIndex(s2), data: this.tagData(s2) }));
    }, onInputDOMChange(t2) {
      t2.forEach((t3) => {
        t3.addedNodes.forEach((t4) => {
          if ("<div><br></div>" == t4.outerHTML)
            t4.replaceWith(document.createElement("br"));
          else if (1 == t4.nodeType && t4.querySelector(this.settings.classNames.tagSelector)) {
            let e3 = document.createTextNode("");
            3 == t4.childNodes[0].nodeType && "BR" != t4.previousSibling.nodeName && (e3 = document.createTextNode("\n")), t4.replaceWith(e3, ...[...t4.childNodes].slice(0, -1)), this.placeCaretAfterNode(e3);
          } else if (v.call(this, t4) && (3 != t4.previousSibling?.nodeType || t4.previousSibling.textContent || t4.previousSibling.remove(), t4.previousSibling && "BR" == t4.previousSibling.nodeName)) {
            t4.previousSibling.replaceWith("\n​");
            let e3 = t4.nextSibling, i2 = "";
            for (; e3; )
              i2 += e3.textContent, e3 = e3.nextSibling;
            i2.trim() && this.placeCaretAfterNode(t4.previousSibling);
          }
        }), t3.removedNodes.forEach((t4) => {
          t4 && "BR" == t4.nodeName && v.call(this, e2) && (this.removeTags(e2), this.fixFirefoxLastTagNoCaret());
        });
      });
      var e2 = this.DOM.input.lastChild;
      e2 && "" == e2.nodeValue && e2.remove(), e2 && "BR" == e2.nodeName || this.DOM.input.appendChild(document.createElement("br"));
    } } };
    function M(t2, e2) {
      if (!t2) {
        console.warn("Tagify:", "input element not found", t2);
        const e3 = new Proxy(this, { get: () => () => e3 });
        return e3;
      }
      if (t2.__tagify)
        return console.warn("Tagify: ", "input element is already Tagified - Same instance is returned.", t2), t2.__tagify;
      var i2;
      g(this, function(t3) {
        var e3 = document.createTextNode("");
        function i3(t4, i4, s2) {
          s2 && i4.split(/\s+/g).forEach((i5) => e3[t4 + "EventListener"].call(e3, i5, s2));
        }
        __name(i3, "i3");
        return { off(t4, e4) {
          return i3("remove", t4, e4), this;
        }, on(t4, e4) {
          return e4 && "function" == typeof e4 && i3("add", t4, e4), this;
        }, trigger(i4, s2, a2) {
          var n2;
          if (a2 = a2 || { cloneData: true }, i4)
            if (t3.settings.isJQueryPlugin)
              "remove" == i4 && (i4 = "removeTag"), jQuery(t3.DOM.originalInput).triggerHandler(i4, [s2]);
            else {
              try {
                var o2 = "object" == typeof s2 ? s2 : { value: s2 };
                if ((o2 = a2.cloneData ? g({}, o2) : o2).tagify = this, s2.event && (o2.event = this.cloneEvent(s2.event)), s2 instanceof Object)
                  for (var r2 in s2)
                    s2[r2] instanceof HTMLElement && (o2[r2] = s2[r2]);
                n2 = new CustomEvent(i4, { detail: o2 });
              } catch (t4) {
                console.warn(t4);
              }
              e3.dispatchEvent(n2);
            }
        } };
      }(this)), this.isFirefox = "undefined" != typeof InstallTrigger, this.isIE = window.document.documentMode, e2 = e2 || {}, this.getPersistedData = (i2 = e2.id, (t3) => {
        let e3, s2 = "/" + t3;
        if (1 == localStorage.getItem(b + i2 + "/v", 1))
          try {
            e3 = JSON.parse(localStorage[b + i2 + s2]);
          } catch (t4) {
          }
        return e3;
      }), this.setPersistedData = ((t3) => t3 ? (localStorage.setItem(b + t3 + "/v", 1), (e3, i3) => {
        let s2 = "/" + i3, a2 = JSON.stringify(e3);
        e3 && i3 && (localStorage.setItem(b + t3 + s2, a2), dispatchEvent(new Event("storage")));
      }) : () => {
      })(e2.id), this.clearPersistedData = /* @__PURE__ */ ((t3) => (e3) => {
        const i3 = b + "/" + t3 + "/";
        if (e3)
          localStorage.removeItem(i3 + e3);
        else
          for (let t4 in localStorage)
            t4.includes(i3) && localStorage.removeItem(t4);
      })(e2.id), this.applySettings(t2, e2), this.state = { inputText: "", editing: false, composing: false, actions: {}, mixMode: {}, dropdown: {}, flaggedTags: {} }, this.value = [], this.listeners = {}, this.DOM = {}, this.build(t2), T.call(this), this.getCSSVars(), this.loadOriginalValues(), this.events.customBinding.call(this), this.events.binding.call(this), t2.autofocus && this.DOM.input.focus(), t2.__tagify = this;
    }
    __name(M, "M");
    return M.prototype = { _dropdown: w, helpers: { sameStr: s, removeCollectionProp: a, omit: n, isObject: h, parseHTML: r, escapeHTML: d, extend: g, concatWithoutDups: p, getUID: m, isNodeTag: v }, customEventsList: ["change", "add", "remove", "invalid", "input", "click", "keydown", "focus", "blur", "edit:input", "edit:beforeUpdate", "edit:updated", "edit:start", "edit:keydown", "dropdown:show", "dropdown:hide", "dropdown:select", "dropdown:updated", "dropdown:noMatch", "dropdown:scroll"], dataProps: ["__isValid", "__removed", "__originalData", "__originalHTML", "__tagId"], trim(t2) {
      return this.settings.trim && t2 && "string" == typeof t2 ? t2.trim() : t2;
    }, parseHTML: r, templates: D, parseTemplate(t2, e2) {
      return t2 = this.settings.templates[t2] || t2, this.parseHTML(t2.apply(this, e2));
    }, set whitelist(t2) {
      const e2 = t2 && Array.isArray(t2);
      this.settings.whitelist = e2 ? t2 : [], this.setPersistedData(e2 ? t2 : [], "whitelist");
    }, get whitelist() {
      return this.settings.whitelist;
    }, generateClassSelectors(t2) {
      for (let e2 in t2) {
        let i2 = e2;
        Object.defineProperty(t2, i2 + "Selector", { get() {
          return "." + this[i2].split(" ")[0];
        } });
      }
    }, applySettings(t2, i2) {
      f.templates = this.templates;
      var s2 = this.settings = g({}, f, i2);
      if (s2.disabled = t2.hasAttribute("disabled"), s2.readonly = s2.readonly || t2.hasAttribute("readonly"), s2.placeholder = d(t2.getAttribute("placeholder") || s2.placeholder || ""), s2.required = t2.hasAttribute("required"), this.generateClassSelectors(s2.classNames), void 0 === s2.dropdown.includeSelectedTags && (s2.dropdown.includeSelectedTags = s2.duplicates), this.isIE && (s2.autoComplete = false), ["whitelist", "blacklist"].forEach((e2) => {
        var i3 = t2.getAttribute("data-" + e2);
        i3 && (i3 = i3.split(s2.delimiters)) instanceof Array && (s2[e2] = i3);
      }), "autoComplete" in i2 && !h(i2.autoComplete) && (s2.autoComplete = f.autoComplete, s2.autoComplete.enabled = i2.autoComplete), "mix" == s2.mode && (s2.autoComplete.rightKey = true, s2.delimiters = i2.delimiters || null, s2.tagTextProp && !s2.dropdown.searchKeys.includes(s2.tagTextProp) && s2.dropdown.searchKeys.push(s2.tagTextProp)), t2.pattern)
        try {
          s2.pattern = new RegExp(t2.pattern);
        } catch (t3) {
        }
      if (s2.delimiters) {
        s2._delimiters = s2.delimiters;
        try {
          s2.delimiters = new RegExp(this.settings.delimiters, "g");
        } catch (t3) {
        }
      }
      s2.disabled && (s2.userInput = false), this.TEXTS = e(e({}, x), s2.texts || {}), "select" != s2.mode && s2.userInput || (s2.dropdown.enabled = 0), s2.dropdown.appendTarget = i2.dropdown && i2.dropdown.appendTarget ? i2.dropdown.appendTarget : document.body;
      let a2 = this.getPersistedData("whitelist");
      Array.isArray(a2) && (this.whitelist = Array.isArray(s2.whitelist) ? p(s2.whitelist, a2) : a2);
    }, getAttributes(t2) {
      var e2, i2 = this.getCustomAttributes(t2), s2 = "";
      for (e2 in i2)
        s2 += " " + e2 + (void 0 !== t2[e2] ? `="${i2[e2]}"` : "");
      return s2;
    }, getCustomAttributes(t2) {
      if (!h(t2))
        return "";
      var e2, i2 = {};
      for (e2 in t2)
        "__" != e2.slice(0, 2) && "class" != e2 && t2.hasOwnProperty(e2) && void 0 !== t2[e2] && (i2[e2] = d(t2[e2]));
      return i2;
    }, setStateSelection() {
      var t2 = window.getSelection(), e2 = { anchorOffset: t2.anchorOffset, anchorNode: t2.anchorNode, range: t2.getRangeAt && t2.rangeCount && t2.getRangeAt(0) };
      return this.state.selection = e2, e2;
    }, getCaretGlobalPosition() {
      const t2 = document.getSelection();
      if (t2.rangeCount) {
        const e2 = t2.getRangeAt(0), i2 = e2.startContainer, s2 = e2.startOffset;
        let a2, n2;
        if (s2 > 0)
          return n2 = document.createRange(), n2.setStart(i2, s2 - 1), n2.setEnd(i2, s2), a2 = n2.getBoundingClientRect(), { left: a2.right, top: a2.top, bottom: a2.bottom };
        if (i2.getBoundingClientRect)
          return i2.getBoundingClientRect();
      }
      return { left: -9999, top: -9999 };
    }, getCSSVars() {
      var t2 = getComputedStyle(this.DOM.scope, null);
      var e2;
      this.CSSVars = { tagHideTransition: ((t3) => {
        let e3 = t3.value;
        return "s" == t3.unit ? 1e3 * e3 : e3;
      })(function(t3) {
        if (!t3)
          return {};
        var e3 = (t3 = t3.trim().split(" ")[0]).split(/\d+/g).filter((t4) => t4).pop().trim();
        return { value: +t3.split(e3).filter((t4) => t4)[0].trim(), unit: e3 };
      }((e2 = "tag-hide-transition", t2.getPropertyValue("--" + e2)))) };
    }, build(t2) {
      var e2 = this.DOM;
      this.settings.mixMode.integrated ? (e2.originalInput = null, e2.scope = t2, e2.input = t2) : (e2.originalInput = t2, e2.originalInput_tabIndex = t2.tabIndex, e2.scope = this.parseTemplate("wrapper", [t2, this.settings]), e2.input = e2.scope.querySelector(this.settings.classNames.inputSelector), t2.parentNode.insertBefore(e2.scope, t2), t2.tabIndex = -1);
    }, destroy() {
      this.events.unbindGlobal.call(this), this.DOM.scope.parentNode.removeChild(this.DOM.scope), this.DOM.originalInput.tabIndex = this.DOM.originalInput_tabIndex, delete this.DOM.originalInput.__tagify, this.dropdown.hide(true), clearTimeout(this.dropdownHide__bindEventsTimeout), clearInterval(this.listeners.main.originalInputValueObserverInterval);
    }, loadOriginalValues(t2) {
      var e2, i2 = this.settings;
      if (this.state.blockChangeEvent = true, void 0 === t2) {
        const e3 = this.getPersistedData("value");
        t2 = e3 && !this.DOM.originalInput.value ? e3 : i2.mixMode.integrated ? this.DOM.input.textContent : this.DOM.originalInput.value;
      }
      if (this.removeAllTags(), t2)
        if ("mix" == i2.mode)
          this.parseMixTags(this.trim(t2)), (e2 = this.DOM.input.lastChild) && "BR" == e2.tagName || this.DOM.input.insertAdjacentHTML("beforeend", "<br>");
        else {
          try {
            JSON.parse(t2) instanceof Array && (t2 = JSON.parse(t2));
          } catch (t3) {
          }
          this.addTags(t2, true).forEach((t3) => t3 && t3.classList.add(i2.classNames.tagNoAnimation));
        }
      else
        this.postUpdate();
      this.state.lastOriginalValueReported = i2.mixMode.integrated ? "" : this.DOM.originalInput.value, this.state.blockChangeEvent = false;
    }, cloneEvent(t2) {
      var e2 = {};
      for (var i2 in t2)
        "path" != i2 && (e2[i2] = t2[i2]);
      return e2;
    }, loading(t2) {
      return this.state.isLoading = t2, this.DOM.scope.classList[t2 ? "add" : "remove"](this.settings.classNames.scopeLoading), this;
    }, tagLoading(t2, e2) {
      return t2 && t2.classList[e2 ? "add" : "remove"](this.settings.classNames.tagLoading), this;
    }, toggleClass(t2, e2) {
      "string" == typeof t2 && this.DOM.scope.classList.toggle(t2, e2);
    }, toggleScopeValidation(t2) {
      var e2 = true === t2 || void 0 === t2;
      !this.settings.required && t2 && t2 === this.TEXTS.empty && (e2 = true), this.toggleClass(this.settings.classNames.tagInvalid, !e2), this.DOM.scope.title = e2 ? "" : t2;
    }, toggleFocusClass(t2) {
      this.toggleClass(this.settings.classNames.focus, !!t2);
    }, triggerChangeEvent: function() {
      if (!this.settings.mixMode.integrated) {
        var t2 = this.DOM.originalInput, e2 = this.state.lastOriginalValueReported !== t2.value, i2 = new CustomEvent("change", { bubbles: true });
        e2 && (this.state.lastOriginalValueReported = t2.value, i2.simulated = true, t2._valueTracker && t2._valueTracker.setValue(Math.random()), t2.dispatchEvent(i2), this.trigger("change", this.state.lastOriginalValueReported), t2.value = this.state.lastOriginalValueReported);
      }
    }, events: O, fixFirefoxLastTagNoCaret() {
    }, placeCaretAfterNode(t2) {
      if (t2 && t2.parentNode) {
        var e2 = t2, i2 = window.getSelection(), s2 = i2.getRangeAt(0);
        i2.rangeCount && (s2.setStartAfter(e2 || t2), s2.collapse(true), i2.removeAllRanges(), i2.addRange(s2));
      }
    }, insertAfterTag(t2, e2) {
      if (e2 = e2 || this.settings.mixMode.insertAfterTag, t2 && t2.parentNode && e2)
        return e2 = "string" == typeof e2 ? document.createTextNode(e2) : e2, t2.parentNode.insertBefore(e2, t2.nextSibling), e2;
    }, editTagChangeDetected(t2) {
      var e2 = t2.__originalData;
      for (var i2 in e2)
        if (!this.dataProps.includes(i2) && t2[i2] != e2[i2])
          return true;
      return false;
    }, getTagTextNode(t2) {
      return t2.querySelector(this.settings.classNames.tagTextSelector);
    }, setTagTextNode(t2, e2) {
      this.getTagTextNode(t2).innerHTML = d(e2);
    }, editTag(t2, e2) {
      t2 = t2 || this.getLastTag(), e2 = e2 || {}, this.dropdown.hide();
      var i2 = this.settings, s2 = this.getTagTextNode(t2), a2 = this.getNodeIndex(t2), n2 = this.tagData(t2), o2 = this.events.callbacks, r2 = this, l2 = true;
      if (s2) {
        if (!(n2 instanceof Object && "editable" in n2) || n2.editable)
          return n2 = this.tagData(t2, { __originalData: g({}, n2), __originalHTML: t2.cloneNode(true) }), this.tagData(n2.__originalHTML, n2.__originalData), s2.setAttribute("contenteditable", true), t2.classList.add(i2.classNames.tagEditing), s2.addEventListener("focus", o2.onEditTagFocus.bind(this, t2)), s2.addEventListener("blur", function() {
            setTimeout(() => o2.onEditTagBlur.call(r2, r2.getTagTextNode(t2)));
          }), s2.addEventListener("input", o2.onEditTagInput.bind(this, s2)), s2.addEventListener("keydown", (e3) => o2.onEditTagkeydown.call(this, e3, t2)), s2.addEventListener("compositionstart", o2.onCompositionStart.bind(this)), s2.addEventListener("compositionend", o2.onCompositionEnd.bind(this)), e2.skipValidation || (l2 = this.editTagToggleValidity(t2)), s2.originalIsValid = l2, this.trigger("edit:start", { tag: t2, index: a2, data: n2, isValid: l2 }), s2.focus(), this.setRangeAtStartEnd(false, s2), this;
      } else
        console.warn("Cannot find element in Tag template: .", i2.classNames.tagTextSelector);
    }, editTagToggleValidity(t2, e2) {
      var i2;
      if (e2 = e2 || this.tagData(t2))
        return (i2 = !("__isValid" in e2) || true === e2.__isValid) || this.removeTagsFromValue(t2), this.update(), t2.classList.toggle(this.settings.classNames.tagNotAllowed, !i2), e2.__isValid;
      console.warn("tag has no data: ", t2, e2);
    }, onEditTagDone(t2, e2) {
      e2 = e2 || {};
      var i2 = { tag: t2 = t2 || this.state.editing.scope, index: this.getNodeIndex(t2), previousData: this.tagData(t2), data: e2 };
      this.trigger("edit:beforeUpdate", i2, { cloneData: false }), this.state.editing = false, delete e2.__originalData, delete e2.__originalHTML, t2 && e2[this.settings.tagTextProp] ? (t2 = this.replaceTag(t2, e2), this.editTagToggleValidity(t2, e2), this.settings.a11y.focusableTags ? t2.focus() : this.placeCaretAfterNode(t2)) : t2 && this.removeTags(t2), this.trigger("edit:updated", i2), this.dropdown.hide(), this.settings.keepInvalidTags && this.reCheckInvalidTags();
    }, replaceTag(t2, e2) {
      e2 && e2.value || (e2 = t2.__tagifyTagData), e2.__isValid && 1 != e2.__isValid && g(e2, this.getInvalidTagAttrs(e2, e2.__isValid));
      var i2 = this.createTagElem(e2);
      return t2.parentNode.replaceChild(i2, t2), this.updateValueByDOMTags(), i2;
    }, updateValueByDOMTags() {
      this.value.length = 0, [].forEach.call(this.getTagElms(), (t2) => {
        t2.classList.contains(this.settings.classNames.tagNotAllowed.split(" ")[0]) || this.value.push(this.tagData(t2));
      }), this.update();
    }, setRangeAtStartEnd(t2, e2) {
      t2 = "number" == typeof t2 ? t2 : !!t2, e2 = (e2 = e2 || this.DOM.input).lastChild || e2;
      var i2 = document.getSelection();
      try {
        i2.rangeCount >= 1 && ["Start", "End"].forEach((s2) => i2.getRangeAt(0)["set" + s2](e2, t2 || e2.length));
      } catch (t3) {
      }
    }, injectAtCaret(t2, e2) {
      return !(e2 = e2 || this.state.selection?.range) && t2 ? (this.appendMixTags(t2), this) : ("string" == typeof t2 && (t2 = document.createTextNode(t2)), e2.deleteContents(), e2.insertNode(t2), this.setRangeAtStartEnd(false, t2), this.updateValueByDOMTags(), this.update(), this);
    }, input: { set() {
      let t2 = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "", e2 = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
      var i2 = this.settings.dropdown.closeOnSelect;
      this.state.inputText = t2, e2 && (this.DOM.input.innerHTML = d("" + t2)), !t2 && i2 && this.dropdown.hide.bind(this), this.input.autocomplete.suggest.call(this), this.input.validate.call(this);
    }, raw() {
      return this.DOM.input.textContent;
    }, validate() {
      var t2 = !this.state.inputText || true === this.validateTag({ value: this.state.inputText });
      return this.DOM.input.classList.toggle(this.settings.classNames.inputInvalid, !t2), t2;
    }, normalize(t2) {
      var e2 = t2 || this.DOM.input, i2 = [];
      e2.childNodes.forEach((t3) => 3 == t3.nodeType && i2.push(t3.nodeValue)), i2 = i2.join("\n");
      try {
        i2 = i2.replace(/(?:\r\n|\r|\n)/g, this.settings.delimiters.source.charAt(0));
      } catch (t3) {
      }
      return i2 = i2.replace(/\s/g, " "), this.trim(i2);
    }, autocomplete: { suggest(t2) {
      if (this.settings.autoComplete.enabled) {
        "string" == typeof (t2 = t2 || {}) && (t2 = { value: t2 });
        var e2 = t2.value ? "" + t2.value : "", i2 = e2.substr(0, this.state.inputText.length).toLowerCase(), s2 = e2.substring(this.state.inputText.length);
        e2 && this.state.inputText && i2 == this.state.inputText.toLowerCase() ? (this.DOM.input.setAttribute("data-suggest", s2), this.state.inputSuggestion = t2) : (this.DOM.input.removeAttribute("data-suggest"), delete this.state.inputSuggestion);
      }
    }, set(t2) {
      var e2 = this.DOM.input.getAttribute("data-suggest"), i2 = t2 || (e2 ? this.state.inputText + e2 : null);
      return !!i2 && ("mix" == this.settings.mode ? this.replaceTextWithNode(document.createTextNode(this.state.tag.prefix + i2)) : (this.input.set.call(this, i2), this.setRangeAtStartEnd()), this.input.autocomplete.suggest.call(this), this.dropdown.hide(), true);
    } } }, getTagIdx(t2) {
      return this.value.findIndex((e2) => e2.__tagId == (t2 || {}).__tagId);
    }, getNodeIndex(t2) {
      var e2 = 0;
      if (t2)
        for (; t2 = t2.previousElementSibling; )
          e2++;
      return e2;
    }, getTagElms() {
      for (var t2 = arguments.length, e2 = new Array(t2), i2 = 0; i2 < t2; i2++)
        e2[i2] = arguments[i2];
      var s2 = "." + [...this.settings.classNames.tag.split(" "), ...e2].join(".");
      return [].slice.call(this.DOM.scope.querySelectorAll(s2));
    }, getLastTag() {
      var t2 = this.DOM.scope.querySelectorAll(`${this.settings.classNames.tagSelector}:not(.${this.settings.classNames.tagHide}):not([readonly])`);
      return t2[t2.length - 1];
    }, tagData: (t2, e2, i2) => t2 ? (e2 && (t2.__tagifyTagData = i2 ? e2 : g({}, t2.__tagifyTagData || {}, e2)), t2.__tagifyTagData) : (console.warn("tag element doesn't exist", t2, e2), e2), isTagDuplicate(t2, e2, i2) {
      var a2 = 0;
      if ("select" == this.settings.mode)
        return false;
      for (let n2 of this.value) {
        s(this.trim("" + t2), n2.value, e2) && i2 != n2.__tagId && a2++;
      }
      return a2;
    }, getTagIndexByValue(t2) {
      var e2 = [];
      return this.getTagElms().forEach((i2, a2) => {
        s(this.trim(i2.textContent), t2, this.settings.dropdown.caseSensitive) && e2.push(a2);
      }), e2;
    }, getTagElmByValue(t2) {
      var e2 = this.getTagIndexByValue(t2)[0];
      return this.getTagElms()[e2];
    }, flashTag(t2) {
      t2 && (t2.classList.add(this.settings.classNames.tagFlash), setTimeout(() => {
        t2.classList.remove(this.settings.classNames.tagFlash);
      }, 100));
    }, isTagBlacklisted(t2) {
      return t2 = this.trim(t2.toLowerCase()), this.settings.blacklist.filter((e2) => ("" + e2).toLowerCase() == t2).length;
    }, isTagWhitelisted(t2) {
      return !!this.getWhitelistItem(t2);
    }, getWhitelistItem(t2, e2, i2) {
      e2 = e2 || "value";
      var a2, n2 = this.settings;
      return (i2 = i2 || n2.whitelist).some((i3) => {
        var o2 = "string" == typeof i3 ? i3 : i3[e2] || i3.value;
        if (s(o2, t2, n2.dropdown.caseSensitive, n2.trim))
          return a2 = "string" == typeof i3 ? { value: i3 } : i3, true;
      }), a2 || "value" != e2 || "value" == n2.tagTextProp || (a2 = this.getWhitelistItem(t2, n2.tagTextProp, i2)), a2;
    }, validateTag(t2) {
      var e2 = this.settings, i2 = "value" in t2 ? "value" : e2.tagTextProp, s2 = this.trim(t2[i2] + "");
      return (t2[i2] + "").trim() ? e2.pattern && e2.pattern instanceof RegExp && !e2.pattern.test(s2) ? this.TEXTS.pattern : !e2.duplicates && this.isTagDuplicate(s2, e2.dropdown.caseSensitive, t2.__tagId) ? this.TEXTS.duplicate : this.isTagBlacklisted(s2) || e2.enforceWhitelist && !this.isTagWhitelisted(s2) ? this.TEXTS.notAllowed : !e2.validate || e2.validate(t2) : this.TEXTS.empty;
    }, getInvalidTagAttrs(t2, e2) {
      return { "aria-invalid": true, class: `${t2.class || ""} ${this.settings.classNames.tagNotAllowed}`.trim(), title: e2 };
    }, hasMaxTags() {
      return this.value.length >= this.settings.maxTags && this.TEXTS.exceed;
    }, setReadonly(t2, e2) {
      var i2 = this.settings;
      document.activeElement.blur(), i2[e2 || "readonly"] = t2, this.DOM.scope[(t2 ? "set" : "remove") + "Attribute"](e2 || "readonly", true), this.setContentEditable(!t2);
    }, setContentEditable(t2) {
      this.settings.userInput && (this.DOM.input.contentEditable = t2, this.DOM.input.tabIndex = t2 ? 0 : -1);
    }, setDisabled(t2) {
      this.setReadonly(t2, "disabled");
    }, normalizeTags(t2) {
      var e2 = this.settings, i2 = e2.whitelist, s2 = e2.delimiters, a2 = e2.mode, n2 = e2.tagTextProp;
      e2.enforceWhitelist;
      var o2 = [], r2 = !!i2 && i2[0] instanceof Object, l2 = Array.isArray(t2), d2 = l2 && t2[0].value, h22 = /* @__PURE__ */ __name((t3) => (t3 + "").split(s2).filter((t4) => t4).map((t4) => ({ [n2]: this.trim(t4), value: this.trim(t4) })), "h2");
      if ("number" == typeof t2 && (t2 = t2.toString()), "string" == typeof t2) {
        if (!t2.trim())
          return [];
        t2 = h22(t2);
      } else
        l2 && (t2 = [].concat(...t2.map((t3) => t3.value ? t3 : h22(t3))));
      return r2 && !d2 && (t2.forEach((t3) => {
        var e3 = o2.map((t4) => t4.value), i3 = this.dropdown.filterListItems.call(this, t3[n2], { exact: true });
        this.settings.duplicates || (i3 = i3.filter((t4) => !e3.includes(t4.value)));
        var s3 = i3.length > 1 ? this.getWhitelistItem(t3[n2], n2, i3) : i3[0];
        s3 && s3 instanceof Object ? o2.push(s3) : "mix" != a2 && (null == t3.value && (t3.value = t3[n2]), o2.push(t3));
      }), o2.length && (t2 = o2)), t2;
    }, parseMixTags(t2) {
      var e2 = this.settings, i2 = e2.mixTagsInterpolator, s2 = e2.duplicates, a2 = e2.transformTag, n2 = e2.enforceWhitelist, o2 = e2.maxTags, r2 = e2.tagTextProp, l2 = [];
      return t2 = t2.split(i2[0]).map((t3, e3) => {
        var d2, h22, g2, p2 = t3.split(i2[1]), c2 = p2[0], u2 = l2.length == o2;
        try {
          if (c2 == +c2)
            throw Error;
          h22 = JSON.parse(c2);
        } catch (t4) {
          h22 = this.normalizeTags(c2)[0] || { value: c2 };
        }
        if (a2.call(this, h22), u2 || !(p2.length > 1) || n2 && !this.isTagWhitelisted(h22.value) || !s2 && this.isTagDuplicate(h22.value)) {
          if (t3)
            return e3 ? i2[0] + t3 : t3;
        } else
          h22[d2 = h22[r2] ? r2 : "value"] = this.trim(h22[d2]), g2 = this.createTagElem(h22), l2.push(h22), g2.classList.add(this.settings.classNames.tagNoAnimation), p2[0] = g2.outerHTML, this.value.push(h22);
        return p2.join("");
      }).join(""), this.DOM.input.innerHTML = t2, this.DOM.input.appendChild(document.createTextNode("")), this.DOM.input.normalize(), this.getTagElms().forEach((t3, e3) => this.tagData(t3, l2[e3])), this.update({ withoutChangeEvent: true }), t2;
    }, replaceTextWithNode(t2, e2) {
      if (this.state.tag || e2) {
        e2 = e2 || this.state.tag.prefix + this.state.tag.value;
        var i2, s2, a2 = this.state.selection || window.getSelection(), n2 = a2.anchorNode, o2 = this.state.tag.delimiters ? this.state.tag.delimiters.length : 0;
        return n2.splitText(a2.anchorOffset - o2), -1 == (i2 = n2.nodeValue.lastIndexOf(e2)) ? true : (s2 = n2.splitText(i2), t2 && n2.parentNode.replaceChild(t2, s2), true);
      }
    }, selectTag(t2, e2) {
      var i2 = this.settings;
      if (!i2.enforceWhitelist || this.isTagWhitelisted(e2.value)) {
        this.input.set.call(this, e2[i2.tagTextProp] || e2.value, true), this.state.actions.selectOption && setTimeout(this.setRangeAtStartEnd.bind(this));
        var s2 = this.getLastTag();
        return s2 ? this.replaceTag(s2, e2) : this.appendTag(t2), this.value[0] = e2, this.update(), this.trigger("add", { tag: t2, data: e2 }), [t2];
      }
    }, addEmptyTag(t2) {
      var e2 = g({ value: "" }, t2 || {}), i2 = this.createTagElem(e2);
      this.tagData(i2, e2), this.appendTag(i2), this.editTag(i2, { skipValidation: true });
    }, addTags(t2, e2, i2) {
      var s2 = [], a2 = this.settings, n2 = [], o2 = document.createDocumentFragment();
      if (i2 = i2 || a2.skipInvalid, !t2 || 0 == t2.length)
        return s2;
      switch (t2 = this.normalizeTags(t2), a2.mode) {
        case "mix":
          return this.addMixTags(t2);
        case "select":
          e2 = false, this.removeAllTags();
      }
      return this.DOM.input.removeAttribute("style"), t2.forEach((t3) => {
        var e3, r2 = {}, l2 = Object.assign({}, t3, { value: t3.value + "" });
        if (t3 = Object.assign({}, l2), a2.transformTag.call(this, t3), t3.__isValid = this.hasMaxTags() || this.validateTag(t3), true !== t3.__isValid) {
          if (i2)
            return;
          if (g(r2, this.getInvalidTagAttrs(t3, t3.__isValid), { __preInvalidData: l2 }), t3.__isValid == this.TEXTS.duplicate && this.flashTag(this.getTagElmByValue(t3.value)), !a2.createInvalidTags)
            return void n2.push(t3.value);
        }
        if ("readonly" in t3 && (t3.readonly ? r2["aria-readonly"] = true : delete t3.readonly), e3 = this.createTagElem(t3, r2), s2.push(e3), "select" == a2.mode)
          return this.selectTag(e3, t3);
        o2.appendChild(e3), t3.__isValid && true === t3.__isValid ? (this.value.push(t3), this.trigger("add", { tag: e3, index: this.value.length - 1, data: t3 })) : (this.trigger("invalid", { data: t3, index: this.value.length, tag: e3, message: t3.__isValid }), a2.keepInvalidTags || setTimeout(() => this.removeTags(e3, true), 1e3)), this.dropdown.position();
      }), this.appendTag(o2), this.update(), t2.length && e2 && (this.input.set.call(this, a2.createInvalidTags ? "" : n2.join(a2._delimiters)), this.setRangeAtStartEnd()), a2.dropdown.enabled && this.dropdown.refilter(), s2;
    }, addMixTags(t2) {
      if ((t2 = this.normalizeTags(t2))[0].prefix || this.state.tag)
        return this.prefixedTextToTag(t2[0]);
      "string" == typeof t2 && (t2 = [{ value: t2 }]), this.state.selection;
      var e2 = document.createDocumentFragment();
      return t2.forEach((t3) => {
        var i2 = this.createTagElem(t3);
        e2.appendChild(i2), this.insertAfterTag(i2);
      }), this.appendMixTags(e2), e2;
    }, appendMixTags(t2) {
      var e2 = !!this.state.selection;
      e2 ? this.injectAtCaret(t2) : (this.DOM.input.focus(), (e2 = this.setStateSelection()).range.setStart(this.DOM.input, e2.range.endOffset), e2.range.setEnd(this.DOM.input, e2.range.endOffset), this.DOM.input.appendChild(t2), this.updateValueByDOMTags(), this.update());
    }, prefixedTextToTag(t2) {
      var e2, i2 = this.settings, s2 = this.state.tag.delimiters;
      if (i2.transformTag.call(this, t2), t2.prefix = t2.prefix || this.state.tag ? this.state.tag.prefix : (i2.pattern.source || i2.pattern)[0], e2 = this.createTagElem(t2), this.replaceTextWithNode(e2) || this.DOM.input.appendChild(e2), setTimeout(() => e2.classList.add(this.settings.classNames.tagNoAnimation), 300), this.value.push(t2), this.update(), !s2) {
        var a2 = this.insertAfterTag(e2) || e2;
        this.placeCaretAfterNode(a2);
      }
      return this.state.tag = null, this.trigger("add", g({}, { tag: e2 }, { data: t2 })), e2;
    }, appendTag(t2) {
      var e2 = this.DOM, i2 = e2.input;
      i2 === e2.input ? e2.scope.insertBefore(t2, i2) : e2.scope.appendChild(t2);
    }, createTagElem(t2, i2) {
      t2.__tagId = m();
      var s2, a2 = g({}, t2, e({ value: d(t2.value + "") }, i2));
      return function(t3) {
        for (var e2, i3 = document.createNodeIterator(t3, NodeFilter.SHOW_TEXT, null, false); e2 = i3.nextNode(); )
          e2.textContent.trim() || e2.parentNode.removeChild(e2);
      }(s2 = this.parseTemplate("tag", [a2, this])), this.tagData(s2, t2), s2;
    }, reCheckInvalidTags() {
      var t2 = this.settings;
      this.getTagElms(t2.classNames.tagNotAllowed).forEach((e2, i2) => {
        var s2 = this.tagData(e2), a2 = this.hasMaxTags(), n2 = this.validateTag(s2), o2 = true === n2 && !a2;
        if ("select" == t2.mode && this.toggleScopeValidation(n2), o2)
          return s2 = s2.__preInvalidData ? s2.__preInvalidData : { value: s2.value }, this.replaceTag(e2, s2);
        e2.title = a2 || n2;
      });
    }, removeTags(t2, e2, i2) {
      var s2, a2 = this.settings;
      if (t2 = t2 && t2 instanceof HTMLElement ? [t2] : t2 instanceof Array ? t2 : t2 ? [t2] : [this.getLastTag()], s2 = t2.reduce((t3, e3) => {
        e3 && "string" == typeof e3 && (e3 = this.getTagElmByValue(e3));
        var i3 = this.tagData(e3);
        return e3 && i3 && !i3.readonly && t3.push({ node: e3, idx: this.getTagIdx(i3), data: this.tagData(e3, { __removed: true }) }), t3;
      }, []), i2 = "number" == typeof i2 ? i2 : this.CSSVars.tagHideTransition, "select" == a2.mode && (i2 = 0, this.input.set.call(this)), 1 == s2.length && "select" != a2.mode && s2[0].node.classList.contains(a2.classNames.tagNotAllowed) && (e2 = true), s2.length)
        return a2.hooks.beforeRemoveTag(s2, { tagify: this }).then(() => {
          function t3(t4) {
            t4.node.parentNode && (t4.node.parentNode.removeChild(t4.node), e2 ? a2.keepInvalidTags && this.trigger("remove", { tag: t4.node, index: t4.idx }) : (this.trigger("remove", { tag: t4.node, index: t4.idx, data: t4.data }), this.dropdown.refilter(), this.dropdown.position(), this.DOM.input.normalize(), a2.keepInvalidTags && this.reCheckInvalidTags()));
          }
          __name(t3, "t3");
          i2 && i2 > 10 && 1 == s2.length ? function(e3) {
            e3.node.style.width = parseFloat(window.getComputedStyle(e3.node).width) + "px", document.body.clientTop, e3.node.classList.add(a2.classNames.tagHide), setTimeout(t3.bind(this), i2, e3);
          }.call(this, s2[0]) : s2.forEach(t3.bind(this)), e2 || (this.removeTagsFromValue(s2.map((t4) => t4.node)), this.update(), "select" == a2.mode && this.setContentEditable(true));
        }).catch((t3) => {
        });
    }, removeTagsFromDOM() {
      [].slice.call(this.getTagElms()).forEach((t2) => t2.parentNode.removeChild(t2));
    }, removeTagsFromValue(t2) {
      (t2 = Array.isArray(t2) ? t2 : [t2]).forEach((t3) => {
        var e2 = this.tagData(t3), i2 = this.getTagIdx(e2);
        i2 > -1 && this.value.splice(i2, 1);
      });
    }, removeAllTags(t2) {
      t2 = t2 || {}, this.value = [], "mix" == this.settings.mode ? this.DOM.input.innerHTML = "" : this.removeTagsFromDOM(), this.dropdown.refilter(), this.dropdown.position(), this.state.dropdown.visible && setTimeout(() => {
        this.DOM.input.focus();
      }), "select" == this.settings.mode && (this.input.set.call(this), this.setContentEditable(true)), this.update(t2);
    }, postUpdate() {
      var t2 = this.settings, e2 = t2.classNames, i2 = "mix" == t2.mode ? t2.mixMode.integrated ? this.DOM.input.textContent : this.DOM.originalInput.value.trim() : this.value.length + this.input.raw.call(this).length;
      this.toggleClass(e2.hasMaxTags, this.value.length >= t2.maxTags), this.toggleClass(e2.hasNoTags, !this.value.length), this.toggleClass(e2.empty, !i2), "select" == t2.mode && this.toggleScopeValidation(this.value?.[0]?.__isValid);
    }, setOriginalInputValue(t2) {
      var e2 = this.DOM.originalInput;
      this.settings.mixMode.integrated || (e2.value = t2, e2.tagifyValue = e2.value, this.setPersistedData(t2, "value"));
    }, update(t2) {
      var e2 = this.getInputValue();
      this.setOriginalInputValue(e2), this.postUpdate(), this.settings.onChangeAfterBlur && (t2 || {}).withoutChangeEvent || this.state.blockChangeEvent || this.triggerChangeEvent();
    }, getInputValue() {
      var t2 = this.getCleanValue();
      return "mix" == this.settings.mode ? this.getMixedTagsAsString(t2) : t2.length ? this.settings.originalInputValueFormat ? this.settings.originalInputValueFormat(t2) : JSON.stringify(t2) : "";
    }, getCleanValue(t2) {
      return a(t2 || this.value, this.dataProps);
    }, getMixedTagsAsString() {
      var t2 = "", e2 = this, i2 = this.settings, s2 = i2.originalInputValueFormat || JSON.stringify, a2 = i2.mixTagsInterpolator;
      return (/* @__PURE__ */ __name(function i3(o2) {
        o2.childNodes.forEach((o3) => {
          if (1 == o3.nodeType) {
            const r2 = e2.tagData(o3);
            if ("BR" == o3.tagName && (t2 += "\r\n"), r2 && v.call(e2, o3)) {
              if (r2.__removed)
                return;
              t2 += a2[0] + s2(n(r2, e2.dataProps)) + a2[1];
            } else
              o3.getAttribute("style") || ["B", "I", "U"].includes(o3.tagName) ? t2 += o3.textContent : "DIV" != o3.tagName && "P" != o3.tagName || (t2 += "\r\n", i3(o3));
          } else
            t2 += o3.textContent;
        });
      }, "i3"))(this.DOM.input), t2;
    } }, M.prototype.removeTag = M.prototype.removeTags, M;
  });
})(tagify_min);
var tagify_minExports = tagify_min.exports;
const Tagify = /* @__PURE__ */ getDefaultExportFromCjs(tagify_minExports);
function tagify(input, { whitelist, maxTags, enforceWhitelist = true, traits = false } = {}) {
  if (input?.hasAttribute("name") && input.dataset.dtype !== "JSON") {
    throw Error("Usable only on input elements with JSON data-dtype");
  } else if (!input) {
    return null;
  }
  const whitelistTransformed = whitelist;
  const maxItems = whitelist ? Object.keys(whitelistTransformed).length : void 0;
  const tagify2 = new Tagify(input, {
    enforceWhitelist: !!whitelist && enforceWhitelist,
    keepInvalidTags: false,
    skipInvalid: !!whitelist,
    maxTags: maxTags ?? maxItems,
    dropdown: {
      enabled: 0,
      maxItems,
      searchKeys: ["id", "value"]
    },
    whitelist: whitelistTransformed,
    templates: {
      tag(tagData, { settings: _s }) {
        return `<tag title="${tagData.title || tagData.value}"
                            contenteditable='false'
                            spellcheck='false'
                            tabIndex="${_s.a11y.focusableTags ? 0 : -1}"
                            class="${_s.classNames.tag} ${tagData.class || ""}"
                            ${this.getAttributes(tagData)}>
                    <x title='' class="${_s.classNames.tagX}" role='button' aria-label='remove tag'></x>
                    <div>
                        <span class="${_s.classNames.tagText}">${traits ? "[" : ""}${tagData[_s.tagTextProp] || tagData.value}${traits ? "]" : ""}</span>
                    </div>
                </tag>`;
      }
    }
  });
  if (input.name) {
    tagify2.DOM.scope.dataset.name = input.name;
  }
  tagify2.DOM.input.blur();
  return tagify2;
}
__name(tagify, "tagify");
function registerTemplates() {
  const templates = {
    "stats-chart": "systems/ptr2e/templates/partials/actor/stats-chart.hbs",
    "actor-movement": "systems/ptr2e/templates/partials/actor/movement.hbs",
    "actor-gear": "systems/ptr2e/templates/partials/actor/gear.hbs",
    "actor-abilities": "systems/ptr2e/templates/partials/actor/abilities.hbs",
    "actor-skills": "systems/ptr2e/templates/partials/actor/skills.hbs",
    "actor-actions": "systems/ptr2e/templates/partials/actor/actions.hbs"
  };
  return loadTemplates(Object.values(templates)).then(() => {
    for (const [key, value] of Object.entries(templates)) {
      Handlebars.registerPartial(key, `{{> ${value}}}`);
    }
  });
}
__name(registerTemplates, "registerTemplates");
class ActorSheetPTR2e extends ActorSheet {
  static {
    __name(this, "ActorSheetPTR2e");
  }
  constructor(actor, options) {
    super(actor, options);
    this._statsChart = new StatsChart(this);
    this.tab = ActorSheetPTR2e.defaultOptions.tabs[0].initial;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["ptr2e", "sheet", "actor"],
      template: "systems/ptr2e/templates/actor/actor-sheet.hbs",
      width: 900,
      height: 660,
      tabs: [{
        group: "primary",
        navSelector: ".tabs",
        contentSelector: ".sheet-body",
        initial: "summary"
      }],
      submitOnClose: true,
      submitOnChange: true,
      scrollY: [".sheet-body"]
    });
  }
  async close(options = {}) {
    if (game.ptr.tree.actor === this.actor) {
      this.minimize();
      return;
    }
    return super.close(options);
  }
  _onChangeTab(event, tabs, active) {
    this.tab = active;
    return super._onChangeTab(event, tabs, active);
  }
  getData() {
    const data = super.getData();
    data.party = game.actors.filter((a) => a != this.actor);
    data.activeTab = this.tab;
    return data;
  }
  activateListeners($html) {
    super.activateListeners($html);
    this._statsChart.render();
    for (const taggifyElement of $html.find(".ptr-tagify")) {
      tagify(taggifyElement, { traits: $(taggifyElement).hasClass("system-traits") });
    }
    $html.find(".ptr-perk-tree").on("click", () => this.actor.togglePerkTree());
  }
}
class ItemPTR2e extends Item {
  static {
    __name(this, "ItemPTR2e");
  }
  get slug() {
    return this.system.slug || sluggify(this.name);
  }
}
class ItemSystemPTR2e extends foundry.abstract.TypeDataModel {
  static {
    __name(this, "ItemSystemPTR2e");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      slug: new fields.StringField({ required: true }),
      container: new fields.ForeignDocumentField(ItemPTR2e, { required: false, nullable: true }),
      actions: new fields.ArrayField(new fields.EmbeddedDataField(ActionPTR2e)),
      description: new fields.HTMLField({ required: false, nullable: true }),
      traits: new fields.SetField(new fields.StringField())
    };
  }
  prepareBaseData() {
    this.slug ??= sluggify(this.name ?? "");
  }
  get name() {
    return this.parent?.name;
  }
}
class GearSystemPTR2e extends ItemSystemPTR2e {
  static {
    __name(this, "GearSystemPTR2e");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    return Object.assign(super.defineSchema(), {
      cost: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 }),
      crafting: new fields.SchemaField({
        skill: new fields.StringField({ required: true, initial: "accounting" }),
        time: new fields.SchemaField({
          value: new fields.NumberField({ required: true, initial: 1, validate: (d) => d >= 0 }),
          unit: new fields.StringField({ required: true, initial: "hours", choices: ["seconds", "minutes", "hours", "days", "weeks", "months", "years"] })
        })
      }),
      equipped: new fields.EmbeddedDataField(EquipmentData),
      grade: new fields.StringField({
        required: true,
        initial: "E",
        choices: ["E", "E+", "D-", "D", "D+", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S-", "S", "S+"]
      }),
      identification: new fields.SchemaField({
        misidentified: new fields.ForeignDocumentField(ItemPTR2e, { required: false, nullable: true }),
        status: new fields.StringField({ required: true, initial: "identified", choices: ["identified", "unidentified", "misidentified"] }),
        unidentified: new fields.SchemaField({
          name: new fields.StringField({ required: true, initial: "Unidentified Item" }),
          img: new fields.FilePathField({ required: true, categories: ["IMAGE", "MEDIA", "VIDEO"], initial: "systems/ptu/css/images/icons/item_icon.png" }),
          description: new fields.HTMLField({ required: true, initial: "<p>Unidentified Item</p>" })
        })
      }),
      quantity: new fields.NumberField({ required: true, initial: 1, validate: (d) => d >= 0 }),
      rarity: new fields.StringField({
        required: true,
        initial: "common",
        choices: ["common", "uncommon", "rare", "unique"]
      })
    });
  }
}
class EquipmentData extends foundry.abstract.DataModel {
  static {
    __name(this, "EquipmentData");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      carryType: new fields.StringField({ required: true, initial: "stowed", choices: ["stowed", "held", "worn", "dropped"] }),
      handsHeld: new fields.NumberField({ required: false, nullable: true, validate: (d) => d >= 0 })
    };
  }
}
const FLAT_HEX_BORDERS = {
  0.5: [[0, 0.5], [0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1]],
  1: [[0, 0.5], [0.25, 0], [0.75, 0], [1, 0.5], [0.75, 1], [0.25, 1]],
  2: [
    [3 / 7, 0.25],
    [4 / 7, 0],
    [6 / 7, 0],
    [1, 0.25],
    [6 / 7, 0.5],
    [1, 0.75],
    [6 / 7, 1],
    [4 / 7, 1],
    [3 / 7, 0.75],
    [1 / 7, 0.75],
    [0, 0.5],
    [1 / 7, 0.25]
  ],
  3: [
    [0.4, 0],
    [0.6, 0],
    [0.7, 1 / 6],
    [0.9, 1 / 6],
    [1, 1 / 3],
    [0.9, 0.5],
    [1, 2 / 3],
    [0.9, 5 / 6],
    [0.7, 5 / 6],
    [0.6, 1],
    [0.4, 1],
    [0.3, 5 / 6],
    [0.1, 5 / 6],
    [0, 2 / 3],
    [0.1, 0.5],
    [0, 1 / 3],
    [0.1, 1 / 6],
    [0.3, 1 / 6]
  ],
  4: [
    [6 / 13, 0],
    [7 / 13, 1 / 8],
    [9 / 13, 1 / 8],
    [10 / 13, 0.25],
    [12 / 13, 0.25],
    [1, 3 / 8],
    [12 / 13, 0.5],
    [1, 5 / 8],
    [12 / 13, 0.75],
    [10 / 13, 0.75],
    [9 / 13, 7 / 8],
    [7 / 13, 7 / 8],
    [6 / 13, 1],
    [4 / 13, 1],
    [3 / 13, 7 / 8],
    [1 / 13, 7 / 8],
    [0, 0.75],
    [1 / 13, 5 / 8],
    [0, 0.5],
    [1 / 13, 3 / 8],
    [0, 0.25],
    [1 / 13, 1 / 8],
    [3 / 13, 1 / 8],
    [4 / 13, 0]
  ]
};
class PTRPerkTreeIcon extends PIXI.Container {
  static {
    __name(this, "PTRPerkTreeIcon");
  }
  constructor(config) {
    super();
    this.config = Object.assign({
      alpha: 0.8,
      backgroundColour: 0,
      size: 50,
      tint: 16777215
    }, config);
    this.background = this.addChild(new PIXI.Graphics());
    this.icon = this.addChild(new PIXI.Sprite());
    this.icon.anchor.set(0.5, 0.5);
    this.icon.mask = this.addChild(new PIXI.Graphics());
    this.border = this.addChild(new PIXI.Graphics());
    this.number = this.addChild(new PreciseText("", PreciseText.getTextStyle({ fontSize: 26 })));
    this.number.anchor.set(0.5, 0.5);
  }
  async draw(config = {}) {
    const { backgroundColour, alpha: alpha2, size, borderRadius, texture, tint, text } = Object.assign(this.config, config);
    this.shape = this._getShape(size, borderRadius);
    this.background.clear().beginFill(backgroundColour, alpha2).drawShape(this.shape).endFill();
    this.icon.texture = texture;
    this.icon.width = this.icon.height = size;
    this.icon.alpha = alpha2 ?? 1;
    this.icon.tint = tint ?? 0;
    this._drawMask();
    this._drawBorder();
    this.number.text = text ?? "";
    this.number.visible = !!text;
    this.hitArea = new PIXI.Rectangle(size / -2, size / -2, size, size);
  }
  _getShape(size = this.config.size, borderRadius = this.borderRadius.size) {
    return new PIXI.RoundedRectangle(size / -2, size / -2, size, size, borderRadius);
  }
  _drawMask() {
    this.icon.mask.clear().beginFill(16777215).drawShape(this.shape).endFill();
  }
  _drawBorder(borderColor = this.config.borderColor, borderWidth = this.config.borderWidth) {
    this.border.clear().lineStyle({ width: borderWidth, color: borderColor, alignment: 1 }).drawShape(this.shape);
  }
}
class PTRPerkTreeNode extends PTRPerkTreeIcon {
  static {
    __name(this, "PTRPerkTreeNode");
  }
  constructor(node, config) {
    super(config);
    this.node = node;
    this.position.set(node.point.x, node.point.y);
  }
  get active() {
    return game.ptr.tree.active === this;
  }
  get editMode() {
    return game.ptr.tree.editNode === this;
  }
  async draw(config = {}) {
    const textureSrc = config.texture ?? this.node.texture ?? "";
    if (textureSrc) {
      config.texture = getTexture(textureSrc);
      config.texture ??= await loadTexture(textureSrc);
    }
    if (this.node.type === "root") {
      config.size = 80;
      config.borderRadius = 80;
    }
    config.alpha = 1;
    config.borderColor = this.node.color;
    config.borderWidth = 3;
    await super.draw(config);
    this._activateInteraction();
  }
  _getShape() {
    const size = this.config.size;
    const halfSize = size / 2;
    if (this.node.type === "root") {
      const width = size;
      const height = size * Math.sqrt(3) / 2;
      const points = FLAT_HEX_BORDERS[1].reduce((arr, [ox, oy]) => {
        arr.push(ox * width - width / 2);
        arr.push(oy * height - height / 2);
        return arr;
      }, []);
      return new PIXI.Polygon(points);
    }
    return new PIXI.Circle(0, 0, halfSize);
  }
  _activateInteraction() {
    this.removeAllListeners();
    this.on("pointerover", this.#onPointerOver.bind(this));
    this.on("pointerout", this.#onPointerOut.bind(this));
    this.on("pointerdown", this.#onClick.bind(this));
    this.on("pointerup", this.#onClickLeftEnd.bind(this));
    this.on("globalpointermove", this.#onPointerMove.bind(this));
    this.eventMode = "static";
    this.cursor = "pointer";
  }
  async _updatePosition({ x, y, visible } = this.position) {
    if (this.originalPosition?.equals({ x, y }))
      return;
    const angle = Math.toDegrees(Math.atan2(y, x));
    const distance = Math.sqrt(x ** 2 + y ** 2);
    const ray = Ray.fromAngle(0, 0, Math.toRadians(angle), distance);
    this.node.point = ray.B;
    const data = { angle, distance };
    if (visible !== void 0)
      data.visible = visible;
    await this.node.perk.update({ "system.node": data });
    game.ptr.tree.refresh({ nodeRefresh: true });
  }
  #onClick(event) {
    event.stopPropagation();
    if (event.data.button === 2)
      return this.#onClickRight(event);
    if (event.data.button === 0)
      return this.#onClickLeft(event);
  }
  #onClickRight(event) {
    if (!game.ptr.tree.editMode)
      return;
    if (game.ptr.tree.editNode && game.ptr.tree.editNode !== this)
      return this.#handleConnectionEdit(event);
    game.ptr.tree.toggleEditNode(this);
    if (this.editMode) {
      this.scale.set(1.2, 1.2);
      this._drawBorder(65280);
    } else {
      this.scale.set(1, 1);
      this._drawBorder();
    }
  }
  async #handleConnectionEdit(event) {
    const node = game.ptr.tree.editNode;
    if (!node || node === this)
      return;
    switch (event.data.button) {
      case 0: {
        if (this.node.connected.has(node.node))
          return;
        if (this.node.type === "root" && node.node.type === "root")
          return;
        const connectNodes = /* @__PURE__ */ __name((nodeA, nodeB) => {
          const connections = new Set(nodeA.node.perk._source.system.node.connected);
          connections.add(nodeB.node.id);
          return nodeA.node.perk.update({ "system.node.connected": [...connections] });
        }, "connectNodes");
        if (this.node.type === "root")
          await connectNodes(node, this);
        else
          await connectNodes(this, node);
        break;
      }
      case 2: {
        if (!this.node.connected.has(node.node))
          return;
        this.node.connected.delete(node.node);
        node.node.connected.delete(this.node);
        const connections = new Set(this.node.perk._source.system.node.connected);
        if (!connections.has(node.node.id)) {
          const otherConnections = new Set(node.node.perk._source.system.node.connected);
          if (!otherConnections.has(this.node.id))
            return;
          otherConnections.delete(this.node.id);
          await node.node.perk.update({ "system.node.connected": [...otherConnections] });
          break;
        }
        connections.delete(node.node.id);
        await this.node.perk.update({ "system.node.connected": [...connections] });
        break;
      }
    }
    await game.ptr.tree.refresh({ nodeRefresh: true });
  }
  #onClickLeft(event) {
    if (game.ptr.tree.editNode)
      return this.#handleConnectionEdit(event);
    this.originalPosition = this.position.clone();
    if (this.active) {
      game.ptr.tree.deactivateNode();
      this.#onPointerOut(event);
    } else {
      this.#onPointerOver(event);
      game.ptr.tree.activateNode(this);
    }
  }
  #onClickLeftEnd(event) {
    if (game.ptr.tree.editNode)
      return;
    event.stopPropagation();
    this.#onPointerOut(event);
    if (this.active) {
      game.ptr.tree.deactivateNode();
      this.mouseIgnored = true;
      this._updatePosition();
    }
  }
  /* -------------------------------------------- */
  #onPointerOver(event) {
    if (this.editMode)
      return;
    if (!game.ptr.tree.app.renderer.enabled)
      return;
    if (document.elementFromPoint(event.globalX, event.globalY)?.id !== "perk-tree")
      return;
    if (this.mouseIgnored)
      return;
    this.scale.set(1.2, 1.2);
  }
  /* -------------------------------------------- */
  #onPointerOut(event) {
    if (this.editMode)
      return;
    if (!game.ptr.tree.app.renderer.enabled)
      return;
    if (document.elementFromPoint(event.globalX, event.globalY)?.id !== "perk-tree")
      return;
    if (this.active)
      return;
    this.scale.set(1, 1);
    this.mouseIgnored = false;
  }
  #onPointerMove(event) {
    if (!game.ptr.tree.app.renderer.enabled)
      return;
    if (document.elementFromPoint(event.globalX, event.globalY)?.id !== "perk-tree")
      return;
    if (!this.active)
      return;
    const newPosition = event.data.getLocalPosition(this.parent);
    this.position.set(newPosition.x, newPosition.y);
  }
}
class PTRPerkTreeNodeData {
  static {
    __name(this, "PTRPerkTreeNodeData");
  }
  constructor({ id, texture, type = "node", angle = 0, distance = 200, connected = [], visible = true } = {}, perk) {
    if (PTRPerkTreeNodeData.#nodes.has(id))
      return console.warn(`PTRPerkTreeNode: node with id ${id} already exists: ignoring`);
    const ray = Ray.fromAngle(0, 0, Math.toRadians(angle), distance);
    Object.defineProperties(this, {
      id: { value: id, writable: false, enumerable: true },
      point: { value: ray.B, writable: true, enumerable: true },
      texture: { value: texture, writable: true, enumerable: true },
      type: { value: type, writable: false, enumerable: true },
      visible: { value: visible, writable: true, enumerable: true },
      perk: { value: perk, writable: false, enumerable: false }
    });
    for (const node of connected) {
      const connectedNode = PTRPerkTreeNodeData.#nodes.get(node);
      if (!connectedNode) {
        this.retryInfo = { id, type, texture, angle, distance, connected };
        return this.addFailedConnection();
      }
      connectedNode.connect(this);
    }
    PTRPerkTreeNodeData.#nodes.set(id, this);
    const failedNode = PTRPerkTreeNodeData.#failedNodes.get(id);
    if (!failedNode || !failedNode.linked)
      return;
    for (const linked of failedNode.linked) {
      const linkedFailedNode = PTRPerkTreeNodeData.#failedNodes.get(linked);
      if (!linkedFailedNode) {
        console.warn(`PTRPerkTreeNodeData: failed node ${linked} does not exist`);
        continue;
      }
      linkedFailedNode.required.delete(id);
      if (!linkedFailedNode.required.size) {
        new PTRPerkTreeNodeData(linkedFailedNode.retryInfo);
        if (PTRPerkTreeNodeData.#nodes.has(linkedFailedNode.retryInfo.id)) {
          PTRPerkTreeNodeData.#failedNodes.delete(linkedFailedNode.retryInfo.id);
        }
      }
    }
    if (!failedNode.failed)
      PTRPerkTreeNodeData.#failedNodes.delete(id);
  }
  static #nodes = /* @__PURE__ */ new Map();
  static #failedNodes = /* @__PURE__ */ new Map();
  static get nodes() {
    return PTRPerkTreeNodeData.#nodes;
  }
  /**
   * @returns {PTRPerkTreeNode}
   */
  static get origin() {
    return this.#nodes.get("node0") ?? this.origins.at(0);
  }
  static get origins() {
    return [...this.#nodes.values()].filter((node) => node.type == "root");
  }
  connected = /* @__PURE__ */ new Set();
  connect(node) {
    this.connected.add(node);
    node.connected.add(this);
  }
  addFailedConnection() {
    for (const node of this.retryInfo.connected) {
      const connectedNode = PTRPerkTreeNodeData.#nodes.get(node);
      if (connectedNode)
        continue;
      const failedNode = PTRPerkTreeNodeData.#failedNodes.get(node);
      if (!failedNode) {
        PTRPerkTreeNodeData.#failedNodes.set(node, {
          failed: false,
          linked: /* @__PURE__ */ new Set([this.retryInfo.id])
        });
        continue;
      }
      if (!failedNode.linked) {
        for (const linked of failedNode.required) {
          const linkedNote = PTRPerkTreeNodeData.#nodes.get(linked);
          if (!linkedNote)
            continue;
          failedNode.required.delete(linked);
          if (!failedNode.required.size) {
            new PTRPerkTreeNodeData(failedNode.retryInfo);
            if (PTRPerkTreeNodeData.#nodes.has(failedNode.retryInfo.id)) {
              PTRPerkTreeNodeData.#failedNodes.delete(failedNode.retryInfo.id);
            }
          }
        }
        if (PTRPerkTreeNodeData.#failedNodes.has(failedNode.retryInfo.id)) {
          failedNode.linked = /* @__PURE__ */ new Set([this.retryInfo.id]);
          continue;
        }
      }
      failedNode.linked.add(this.retryInfo.id);
    }
    PTRPerkTreeNodeData.#failedNodes.set(this.retryInfo.id, {
      failed: true,
      required: new Set(this.retryInfo.connected),
      retryInfo: this.retryInfo
    });
  }
  /**
   * @param {PTRPerk} perk 
   */
  static fromPerk(perk) {
    const node = perk._source?.node;
    if (!node)
      return node;
    if (PTRPerkTreeNodeData.#nodes.has(node.id)) {
      if (PTRPerkTreeNodeData.#nodes.get(node.id)?.perk?.id === perk.parent.id) {
        const oldConnections = PTRPerkTreeNodeData.#nodes.get(node.id).connected?.map((node2) => node2.id) ?? [];
        for (const connected of oldConnections) {
          const connectedNode = PTRPerkTreeNodeData.#nodes.get(connected);
          if (!connectedNode)
            continue;
          connectedNode.connected.delete(PTRPerkTreeNodeData.#nodes.get(node.id));
        }
        PTRPerkTreeNodeData.#nodes.delete(node.id);
        const updatedNodeData = foundry.utils.duplicate(node);
        updatedNodeData.connected = [.../* @__PURE__ */ new Set([...oldConnections, ...node.connected])];
        return new PTRPerkTreeNodeData(updatedNodeData, perk.parent);
      }
      return PTRPerkTreeNodeData.#nodes.get(node.id);
    }
    return new PTRPerkTreeNodeData(node, perk.parent);
  }
}
globalThis.PTRPerkTreeNodeData = PTRPerkTreeNodeData;
class PerkSystemPTR2e extends ItemSystemPTR2e {
  static {
    __name(this, "PerkSystemPTR2e");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    return Object.assign(super.defineSchema(), {
      node: new fields.SchemaField({
        id: new fields.StringField({ required: true, blank: false, initial: () => foundry.utils.randomID() }),
        angle: new fields.AngleField({ required: true, initial: 0 }),
        distance: new fields.NumberField({ required: true, initial: 100, validate: (d) => d >= 0 }),
        type: new fields.StringField({ choices: ["normal", "root", "ranked"], required: true, initial: "normal" }),
        connected: new fields.ArrayField(new fields.StringField()),
        texture: new fields.FilePathField({ required: true, categories: ["IMAGE", "MEDIA", "VIDEO"], initial: "systems/ptu/css/images/types2/UntypedIC_Icon.png" }),
        visible: new fields.BooleanField({ required: true, initial: true })
      }),
      cost: new fields.NumberField(),
      prerequisites: new fields.ArrayField(new fields.StringField())
    });
  }
  prepareBaseData() {
    super.prepareBaseData();
    this.node = PTRPerkTreeNodeData.fromPerk(this);
  }
  async toEmbed() {
    const container = document.createElement("div");
    container.innerHTML = `<h2>Perk: ${this.name}</h2><p>Effect: ${this.description}</p>`;
    return container;
  }
}
class ActionPTR2e extends foundry.abstract.DataModel {
  static {
    __name(this, "ActionPTR2e");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      slug: new fields.StringField({ required: true }),
      name: new fields.StringField({ required: true, initial: "New Action" }),
      description: new fields.HTMLField({ required: false, nullable: true }),
      traits: new fields.ArrayField(new fields.StringField()),
      type: new fields.StringField({
        required: true,
        choices: () => [
          "attack",
          "camping",
          "downtime",
          "exploration"
        ]
      }),
      range: new fields.EmbeddedDataField(RangePTR2e),
      cost: new fields.SchemaField({
        activation: new fields.StringField({
          required: true,
          choices: () => [
            "simple",
            "complete",
            "free"
          ]
        }),
        powerPoints: new fields.NumberField({ required: true, initial: 0 }),
        trigger: new fields.StringField({ required: false, nullable: true }),
        delay: new fields.NumberField({ required: false, nullable: true }),
        priority: new fields.NumberField({ required: false, nullable: true })
      })
    };
  }
}
class RangePTR2e extends foundry.abstract.DataModel {
  static {
    __name(this, "RangePTR2e");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      target: new fields.StringField({
        required: true,
        choices: [
          "self",
          "ally",
          "enemy",
          "creature",
          "object",
          "blast",
          "cone",
          "line",
          "wide-line",
          "emanation",
          "field"
        ]
      }),
      distance: new fields.NumberField({ required: true, initial: 0 }),
      unit: new fields.StringField({ required: true, choices: ["m", "ft"] })
    };
  }
}
class ActorSystemPTR2e extends foundry.abstract.TypeDataModel {
  static {
    __name(this, "ActorSystemPTR2e");
  }
  static defineSchema() {
    const fields = foundry.data.fields;
    const getAttributeField = /* @__PURE__ */ __name((slug, withStage = true) => {
      return {
        ...getStatField(slug, withStage),
        evs: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 }),
        ivs: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 }),
        base: new fields.NumberField({ required: true, initial: 50, validate: (d) => d >= 1 }),
        value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 })
      };
    }, "getAttributeField");
    const getStatField = /* @__PURE__ */ __name((slug, withStage = true) => {
      const output = {
        slug: new fields.StringField({ required: true, initial: slug })
      };
      if (withStage)
        output.stage = new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= -6 && d <= 6 });
      return output;
    }, "getStatField");
    return {
      attributes: new fields.SchemaField({
        hp: new fields.SchemaField(getAttributeField("hp", false)),
        atk: new fields.SchemaField(getAttributeField("atk")),
        def: new fields.SchemaField(getAttributeField("def")),
        spa: new fields.SchemaField(getAttributeField("spa")),
        spd: new fields.SchemaField(getAttributeField("spd")),
        spe: new fields.SchemaField(getAttributeField("spe"))
      }),
      battleStats: new fields.SchemaField({
        evasion: new fields.SchemaField(getStatField("evasion")),
        accuracy: new fields.SchemaField(getStatField("accuracy")),
        critRate: new fields.SchemaField(getStatField("critRate"))
      }),
      skills: new fields.ObjectField({ validate: (d) => {
        if (typeof d !== "object")
          return false;
        for (const [key, value] of Object.entries(d)) {
          if (typeof key !== "string" || typeof value !== "object")
            return false;
          if (typeof value.slug !== "string" || typeof value.value !== "number" || typeof value.rvs !== "number")
            return false;
        }
        return true;
      } }),
      biology: new fields.ObjectField(),
      capabilities: new fields.ObjectField(),
      traits: new fields.SetField(new fields.StringField()),
      advancementPoints: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 }),
      type: new fields.SchemaField({
        types: new fields.ArrayField(new fields.StringField())
      }),
      species: new fields.ForeignDocumentField(ItemPTR2e, { required: false, nullable: true }),
      powerPoints: new fields.SchemaField({
        value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 })
      }),
      health: new fields.SchemaField({
        value: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 })
      }),
      experience: new fields.NumberField({ required: true, initial: 0, validate: (d) => d >= 0 }),
      money: new fields.NumberField({ required: true, initial: 0 })
    };
  }
}
class CombatPTR2e extends Combat {
  static {
    __name(this, "CombatPTR2e");
  }
  // @ts-ignore
  _sortCombatants(a, b) {
    const resolveTie = /* @__PURE__ */ __name(() => {
      const speedA = a.actor?.system.speed ?? 0;
      const speedB = b.actor?.system.speed ?? 0;
      return speedB - speedA;
    }, "resolveTie");
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
    return typeof a.initiative === "number" && typeof b.initiative === "number" && a.initiative === b.initiative ? resolveTie() : ia - ib || (a.id > b.id ? 1 : -1);
  }
  // @ts-ignore
  async createEmbeddedDocuments(embeddedName = "Combatant", data, context = {}) {
    const createData = data.filter((datum) => {
      const token = canvas.tokens.placeables.find((canvasToken) => canvasToken.id === datum.tokenId);
      if (!token)
        return false;
      const { actor } = token;
      if (!actor) {
        ui.notifications.warn(`${token.name} has no associated actor.`);
        return false;
      }
      return true;
    });
    return super.createEmbeddedDocuments(embeddedName, createData, context);
  }
  async rollInitiative(ids, options = {}) {
    const extraRollOptions = options.extraRollOptions ?? [];
    if (options.secret)
      extraRollOptions.push("secret");
    const combatants = ids.flatMap(
      (id) => this.combatants.get(id) ?? []
    );
    const fightyCombatants = combatants.filter((c) => !!c.actor?.system?.speed);
    const initiatives = await Promise.all(
      fightyCombatants.map(async (combatant) => {
        const data = {
          initiative: Math.round(
            500 * (1 + (10 - 5) * 21 / 95) / combatant.actor.system.speed
          ),
          _id: combatant.id
        };
        await combatant.setFlag("ptr2e", "baseAV", data.initiative);
        return data;
      })
    );
    if (options.temporary)
      return initiatives;
    return this.setMultipleInitiatives(initiatives);
  }
  /**
   * Set the initiative of multiple combatants at once.
   * @param {{initiative: number, _id: string}[]} initiatives 
   */
  async setMultipleInitiatives(initiatives) {
    const update = {
      combatants: initiatives
    };
    if (this.combatant?.id)
      update.turn = 0;
    return this.update(update);
  }
  async nextTurn() {
    const turn = this.turn ?? -1;
    let next = null;
    let nextRound = false;
    for (let [i, t] of this.turns.entries()) {
      if (i <= turn)
        continue;
      if (t.hasActed)
        continue;
      if (this.settings.skipDefeated && t.isDefeated)
        continue;
      next = i;
      if (t.id === "roundsinitiative")
        nextRound = true;
      break;
    }
    let round2 = this.round;
    if (nextRound) {
      await this.nextRound();
      return this;
    }
    const updateData = { round: round2, turn: next };
    const updateOptions = { advanceTime: CONFIG.time.turnTime, direction: 1 };
    Hooks.callAll("combatTurn", this, updateData, updateOptions);
    await this.update(updateData, updateOptions);
    return this;
  }
  async nextRound() {
    if (this.turn === null)
      return super.nextRound();
    const next = this.turns[(this.turn ?? 0) + 1];
    if (next?.id !== "roundsinitiative") {
      await super.nextRound();
      return this;
    }
    const current = this.combatant;
    const nextFightyCombattant = this.turns[(this.turn ?? 0) + 2];
    if (!current || !nextFightyCombattant) {
      await super.nextRound();
      return this;
    }
    const initiative = nextFightyCombattant.initiative;
    const updates = {
      turn: 0,
      round: this.round + 1,
      combatants: this.combatants.contents.flatMap((combatant) => {
        if (combatant.id === "roundsinitiative")
          return [{ _id: combatant.id, initiative: combatant.getFlag("ptr2e", "baseAV") - initiative }];
        if (combatant.id === current.id && combatant.initiative === 0)
          return [{ _id: combatant.id, initiative: combatant.getFlag("ptr2e", "baseAV") - initiative }];
        if (combatant.id === nextFightyCombattant.id)
          return [{ _id: combatant.id, initiative: 0 }];
        if (combatant.initiative === 0)
          return [];
        return [{ _id: combatant.id, initiative: combatant.initiative - initiative }];
      })
    };
    const updateOptions = { direction: 1 };
    Hooks.callAll("combatRound", this, updates, updateOptions);
    await this.update(updates, updateOptions);
    return this;
  }
  async previousTurn() {
    const backup = await this.getFlag("ptr2e", "stateBackup");
    if (backup?.length > 0) {
      const { combatants, round: round2, turn } = backup.pop();
      if (combatants.some((c) => c.initiative === 0)) {
        await this.update({
          combatants,
          round: round2,
          turn,
          flags: {
            ptr2e: {
              stateBackup: backup
            }
          }
        });
        return this;
      }
    }
    if (this.round === 1) {
      await Dialog.confirm({
        title: "Restart Combat",
        content: "Are you sure you want to restart combat?",
        yes: () => {
          return this.update({
            round: 0,
            turn: null,
            combatants: this.combatants.contents.map((c) => ({ _id: c.id, initiative: null }))
          });
        }
      });
      return this;
    }
    ui.notifications.warn("No previous turn to go back to.");
    return this;
  }
  async update(data, options = {}) {
    if (!this.combatants.get("roundsinitiative")) {
      await Combatant.create({
        tokenId: void 0,
        actorId: void 0,
        _id: "roundsinitiative",
        name: "The Round",
        img: "icons/svg/clockwork.svg",
        hidden: false,
        defeated: false,
        initiative: 100,
        flags: {
          ptr2e: {
            baseAV: 100
          }
        }
      }, { parent: this, keepId: true, keepEmbeddedIds: true });
    }
    const noInits = this.combatants.contents.filter((c) => c.initiative === null);
    if (noInits.length > 0) {
      const initiatives = await this.rollInitiative(noInits.map((c) => c.id), { secret: true, temporary: true });
      data.combatants = data.combatants ?? [];
      data.combatants.push(...initiatives);
    }
    if (!data?.flags?.ptr2e?.stateBackup) {
      data.flags = data.flags ?? {};
      data.flags.ptr2e = data.flags.ptr2e ?? {};
      data.flags.ptr2e.stateBackup = this.flags?.ptr2e?.stateBackup ?? [];
      const newBackup = {
        combatants: this.combatants.contents.map((c) => ({ _id: c._id, initiative: c.initiative })),
        round: this.round,
        turn: 0
      };
      if (!objectsEqual(data.flags.ptr2e.stateBackup.at(-1), newBackup))
        data.flags.ptr2e.stateBackup.push(newBackup);
    }
    return super.update(data, options);
  }
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (!this.started)
      return;
    const { combatant, previous } = this;
    const [newRound, newTurn] = [changed.round, changed.turn];
    const isRoundChange = typeof newRound === "number";
    const isTurnChange = typeof newTurn === "number";
    const isNewTurnUnacted = isTurnChange && this.turns[newTurn]?.hasActed === false;
    const isNextRound = isRoundChange && (previous.round === null || newRound > previous.round);
    const isNextTurn = isTurnChange && (previous.turn === null || newTurn > previous.turn || isNewTurnUnacted);
    if (!(isRoundChange || isTurnChange))
      return;
    Promise.resolve().then(async () => {
      if (isNextRound || isNextTurn) {
        const previousCombatant = this.combatants.get(previous.combatantId ?? "");
        if (game.user.isGM && previousCombatant) {
          const alreadyWent = previousCombatant.roundOfLastTurnEnd === previous.round;
          if (typeof previous.round === "number" && !alreadyWent) {
            await previousCombatant.endTurn({ round: previous.round });
          }
        }
        if (game.user.isGM) {
          const alreadyWent = combatant?.roundOfLastTurn === this.round;
          if (combatant && !alreadyWent) {
            if (newRound === 1 || !isNextRound)
              await this.updateInitiatives(previousCombatant, combatant);
            await combatant.startTurn();
          }
        }
      }
    });
  }
  async updateInitiatives(previousCombatant, newCombatant) {
    const combatants = this.combatants;
    const initiative = combatants.get(newCombatant.id)?.initiative;
    return this.setMultipleInitiatives(combatants.contents.flatMap((combatant) => {
      if (combatant.id === previousCombatant?.id)
        return [{ _id: combatant.id, initiative: previousCombatant.getFlag("ptr2e", "baseAV") - initiative }];
      if (combatant.id === newCombatant.id && combatant.initiative !== 0)
        return [{ _id: combatant.id, initiative: 0 }];
      if (combatant.initiative === 0)
        return [];
      return [{ _id: combatant.id, initiative: combatant.initiative - initiative }];
    }));
  }
  async _manageTurnEvents(adjustedTurn) {
    if (this.previous || game.release.build >= 308)
      return super._manageTurnEvents(adjustedTurn);
  }
}
class CombatantPTR2e extends Combatant {
  static {
    __name(this, "CombatantPTR2e");
  }
  get encounter() {
    return this.parent;
  }
  async endTurn() {
    Hooks.callAll("ptr2e.endTurn", this, this.encounter, game.user.id);
  }
  async startTurn() {
  }
}
class CombatTrackerPTR2e extends CombatTracker {
  static {
    __name(this, "CombatTrackerPTR2e");
  }
  get template() {
    return "systems/ptr2e/templates/sidebar/combat-tracker.hbs";
  }
  async getData(options) {
    const data = await super.getData(options);
    return data;
  }
}
class ItemSheetPTR2e extends ItemSheet {
  static {
    __name(this, "ItemSheetPTR2e");
  }
}
class PerkSheetPTR2e extends ItemSheetPTR2e {
  static {
    __name(this, "PerkSheetPTR2e");
  }
}
class PerkDirectory extends ItemDirectory {
  static {
    __name(this, "PerkDirectory");
  }
  get title() {
    return `${game.i18n.localize("DOCUMENT.Perks")} Directory`;
  }
  async _onCreateEntry(event, {} = {}) {
    event.preventDefault();
    event.stopPropagation();
    const button = event.currentTarget;
    const li = button.closest(".directory-item");
    const data = { folder: li?.dataset?.folderId, type: "perk" };
    const options = { width: 320, left: window.innerWidth - 630, top: button.offsetTop };
    return Item.createDialog(data, options);
  }
  /** @inheritdoc */
  _onSearchFilter(_event, _query, rgx, html) {
    //!!query;
    let entryIds = /* @__PURE__ */ new Set();
    const folderIds = /* @__PURE__ */ new Set();
    const autoExpandFolderIds = /* @__PURE__ */ new Set();
    {
      const includeFolder = /* @__PURE__ */ __name((folder, autoExpand = true) => {
        if (!folder)
          return;
        if (typeof folder === "string")
          folder = this.collection.folders.get(folder);
        if (!folder)
          return;
        const folderId = folder._id;
        if (folderIds.has(folderId)) {
          if (autoExpand && !autoExpandFolderIds.has(folderId))
            autoExpandFolderIds.add(folderId);
          return;
        }
        folderIds.add(folderId);
        if (autoExpand)
          autoExpandFolderIds.add(folderId);
        if (folder.folder)
          includeFolder(folder.folder);
      }, "includeFolder");
      this._matchSearchFolders(rgx, includeFolder);
      this._matchSearchEntries(rgx, entryIds, folderIds, includeFolder);
    }
    for (let el of html.querySelectorAll(".directory-item")) {
      if (el.classList.contains("hidden"))
        continue;
      if (el.classList.contains("folder")) {
        let match = folderIds.has(el.dataset.folderId);
        el.style.display = match ? "flex" : "none";
        if (autoExpandFolderIds.has(el.dataset.folderId)) {
          if (match)
            el.classList.remove("collapsed");
        } else
          el.classList.toggle("collapsed", !game.folders._expanded[el.dataset.uuid]);
      } else
        el.style.display = entryIds.has(el.dataset.entryId) ? "flex" : "none";
    }
  }
  _matchSearchEntries(query, entryIds, folderIds, includeFolder) {
    super._matchSearchEntries(query, entryIds, folderIds, includeFolder);
    const entries = this.collection.index ?? this.collection.contents;
    for (const entry of entries) {
      if (entry.type !== "perk")
        entryIds.delete(entry._id);
    }
  }
  async close(options = {}) {
    if (game.ptr.tree.editMode) {
      this.minimize();
      return;
    }
    return super.close(options);
  }
  renderPopout() {
    const pop = this.createPopout();
    pop.render(true, { top: 0, left: window.innerWidth - 310 });
  }
}
const PTRCONFIG = {
  Actor: {
    documentClass: ActorPTR2e,
    dataModels: {
      character: ActorSystemPTR2e
    },
    sheetClasses: {
      character: ActorSheetPTR2e
    }
  },
  Item: {
    documentClass: ItemPTR2e,
    dataModels: {
      perk: PerkSystemPTR2e,
      gear: GearSystemPTR2e
    },
    sheetClasses: {
      perk: PerkSheetPTR2e
    }
  },
  ui: {
    perks: PerkDirectory,
    combat: CombatTrackerPTR2e
  }
};
class PTRPerkTreeHUD extends Application {
  static {
    __name(this, "PTRPerkTreeHUD");
  }
  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "perk-tree-hud",
      template: "systems/ptr2e/templates/perk-tree/hud.hbs",
      popOut: false
    });
  }
  get tree() {
    return game.ptr.tree;
  }
  /** @override */
  getData(options = {}) {
    return {
      actor: this.tree.actor,
      editMode: this.tree.editMode
    };
  }
  /** @override */
  activateListeners(html) {
    html.find("button.close").click(() => this.tree.close());
    html.find("button.refresh").click(() => this.tree.refresh({ nodeRefresh: true }));
    html.find("button.toggleEdit").click(() => this.tree.toggleEditMode());
  }
}
class PTRPerkTree extends PIXI.Container {
  static {
    __name(this, "PTRPerkTree");
  }
  constructor() {
    super();
    this._initialize();
  }
  #drawn = false;
  #dragDrop = null;
  _initialize() {
    Object.defineProperty(this, "canvas", {
      value: document.createElement("canvas"),
      writable: false
    });
    this.canvas.id = "perk-tree";
    this.canvas.hidden = true;
    document.body.appendChild(this.canvas);
    this.#dragDrop = new DragDrop({ callbacks: { drop: this._onDrop.bind(this) } }).bind(this.canvas);
    Object.defineProperty(this, "app", {
      value: new PIXI.Application({
        view: this.canvas,
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true,
        resolution: 1,
        antialias: true,
        background: 13421772,
        backgroundAlpha: 0.35,
        powerPreference: "high-performance"
      }),
      writable: false
    });
    Object.defineProperty(this, "stage", {
      value: this.app.stage,
      writable: false
    });
    Object.defineProperty(this, "controls", { value: new PTRPerkTreeHUD(), writable: false });
    this.stage.addChild(this);
    this.editMode = false;
  }
  /**
   * 
   * @param {ActorPTR2e} actor 
   * @param {object} [options]
   * @param {boolean} [options.resetView] 
   */
  async open(actor, { resetView } = {}) {
    if (!(actor instanceof ActorPTR2e))
      throw new Error("PTRPerkTree.open: actor must be an instance of PTRActor");
    await this.draw();
    this.actor = actor;
    await actor.sheet._render(false, { left: 20, top: 20 });
    actor.sheet.minimize();
    this.pan(resetView ? { x: 0, y: 0, scale: 1 } : {});
    this.refresh();
    this.app.renderer.enabled = true;
    this.canvas.hidden = false;
    if (this.editMode && !!ui.perks._popout)
      ui.perks.renderPopout();
  }
  async close() {
    const actor = this.actor;
    this.actor = null;
    await actor?.sheet.render(false);
    actor.sheet.maximize();
    this.controls.close();
    this.app.renderer.enabled = false;
    this.canvas.hidden = true;
    if (this.editMode)
      ui.perks._popout?.close();
  }
  async draw() {
    if (this.#drawn)
      return;
    this.backgroundLayer = this.addChild(new PIXI.Container());
    this.foregroundLayer = this.addChild(new PIXI.Container());
    this.background = this.backgroundLayer.addChild(await this._drawBackground());
    this.edges = this.backgroundLayer.addChild(new PIXI.Graphics());
    this.edges.lineStyle({ width: 5, color: 16777215, alpha: 0.4 });
    this.connections = this.backgroundLayer.addChild(new PIXI.Graphics());
    this.nodes = this.backgroundLayer.addChild(new PIXI.Container());
    const seen = /* @__PURE__ */ new Set();
    for (const origin of PTRPerkTreeNodeData.origins) {
      if (!seen.has(origin.id)) {
        await this._drawNode(origin);
        seen.add(origin.id);
      }
      await this._drawNodes(origin.connected, seen);
    }
    this.#activateInteractivity();
    canvas.hud.render(true);
    this.refresh();
    this.#drawn = true;
  }
  async _drawBackground() {
    const backgroundSize = 1e4;
    const background = new PIXI.Graphics();
    background.beginFill(0, 0.1).drawRect(-backgroundSize, -backgroundSize, backgroundSize + backgroundSize, backgroundSize + backgroundSize).endFill();
    return background;
  }
  _drawConnections(node, seen) {
    for (const connection of node.connected) {
      if (seen.has(connection.id))
        continue;
      if (!connection.visible)
        continue;
      this.connections.lineStyle({ color: connection.color, width: 5, alpha: 1 }).moveTo(node.point.x, node.point.y).lineTo(connection.point.x, connection.point.y);
    }
  }
  async _drawNodes(nodes, seen = /* @__PURE__ */ new Set()) {
    const next = [];
    for (const node of nodes) {
      if (seen.has(node.id))
        continue;
      if (!node.visible)
        continue;
      await this._drawNode(node);
      seen.add(node.id);
      next.push(...node.connected);
    }
    if (next.length)
      await this._drawNodes(next, seen);
  }
  async _drawNode(node) {
    const icon = node.icon = new PTRPerkTreeNode(node, { borderColor: node.color });
    this.nodes.addChild(icon);
  }
  async refresh({ nodeRefresh = false } = {}) {
    if (!this.actor)
      return;
    if (nodeRefresh) {
      this.editNode = null;
      this.nodes.removeChildren();
      const seen2 = /* @__PURE__ */ new Set();
      for (const origin of PTRPerkTreeNodeData.origins) {
        if (!seen2.has(origin.id)) {
          if (!origin.visible)
            continue;
          await this._drawNode(origin);
          seen2.add(origin.id);
        }
        await this._drawNodes(origin.connected, seen2);
      }
      if (this.editMode) {
        for (const node of PTRPerkTreeNodeData.nodes.values()) {
          if (!node.visible)
            continue;
          if (node.connected.length)
            continue;
          if (node.icon?.visible)
            continue;
          await this._drawNode(node);
        }
      }
      return this.refresh();
    }
    this.connections.clear();
    this.edges.clear();
    const seen = /* @__PURE__ */ new Set();
    for (const node of PTRPerkTreeNodeData.nodes.values()) {
      if (!node.visible)
        continue;
      node.icon?.draw({ text: [...node.id].at(-1) });
      this._drawConnections(node, seen);
      seen.add(node.id);
    }
    this.controls.render(true);
  }
  pan({ x, y, scale } = {}) {
    x ??= this.stage.pivot.x;
    y ??= this.stage.pivot.y;
    scale ??= this.stage.scale.x;
    this.stage.pivot.set(x, y);
    this.stage.scale.set(scale, scale);
  }
  /* -------------------------------------------- */
  /*  Node & State Management                     */
  /* -------------------------------------------- */
  activateNode(node) {
    if (this.active)
      this.deactivateNode();
    this.active = node;
  }
  deactivateNode() {
    if (!this.active)
      return;
    this.active.scale.set(1, 1);
    this.active = null;
  }
  toggleEditNode(node) {
    if (this.editNode === node)
      this.editNode = null;
    else
      this.editNode = node;
  }
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      if (!ui.perks._popout || ui.perks._popout_minimized)
        ui.perks.renderPopout();
      this.app.renderer.backgroundColor = 8722970;
      this.app.renderer.backgroundAlpha = 0.35;
    } else {
      ui.perks._popout?.close();
      this.app.renderer.backgroundColor = 13421772;
      this.app.renderer.backgroundAlpha = 0.35;
    }
    this.refresh();
  }
  /**
   * Event handler for the drop portion of a drag-and-drop event.
   * @param {DragEvent} event  The drag event being dropped onto the canvas
   * @private
   */
  async _onDrop(event) {
    event.preventDefault();
    const data = TextEditor.getDragEventData(event);
    if (!data.type)
      return;
    const [x, y] = [event.clientX, event.clientY];
    const t = this.stage.worldTransform;
    data.x = (x - t.tx) / this.stage.scale.x;
    data.y = (y - t.ty) / this.stage.scale.y;
    const allowed = Hooks.call("dropPerkWebCanvasData", this, data);
    if (allowed === false)
      return;
    switch (data.type) {
      case "Item": {
        const item = await Item.fromDropData(data);
        if (!item || item.type !== "perk")
          return;
        if (item.system.node?.icon?.visible) {
          return await item.system.node.icon._updatePosition({ x: data.x, y: data.y });
        } else if (item.system.node?.icon?.visible === false) {
          return await item.system.node.icon._updatePosition({ x: data.x, y: data.y, visible: true });
        } else {
          if (!data.uuid)
            return console.warn("PTR | No UUID found on dropped item, therefore unable to edit node.");
          const angle = Math.toDegrees(Math.atan2(data.y, data.x));
          const distance = Math.sqrt(data.x ** 2 + data.y ** 2);
          await item.update({ "system.node": { angle, distance, visible: true } });
          this.refresh({ nodeRefresh: true });
        }
      }
    }
  }
  /* -------------------------------------------- */
  /*  Event Listeners and Handlers                */
  /* -------------------------------------------- */
  #activateInteractivity() {
    this.backgroundLayer.eventMode = "passive";
    this.backgroundLayer.children.forEach((c) => c.eventMode = "none");
    this.nodes.eventMode = "passive";
    this.background.eventMode = "static";
    this.interactionManager = new MouseInteractionManager(this, this, {}, {
      clickLeft: this.#onClickLeft,
      dragRightStart: null,
      dragRightMove: this.#onDragRightMove,
      dragRightDrop: null,
      dragRightCancel: null
    }, {
      application: this.app,
      dragResistance: 30
    }).activate();
    window.addEventListener("resize", this.#onResize.bind(this));
    window.addEventListener("wheel", this.#onWheel.bind(this), { passive: false });
    this.#onResize();
  }
  #onClickLeft(event) {
    event.stopPropagation();
    this.deactivateNode();
  }
  /**
   * Handle right-mouse drag events occurring on the Canvas.
   * @param {PIXI.FederatedEvent} event
   */
  #onDragRightMove(event) {
    const DRAG_SPEED_MODIFIER = 0.8;
    const { origin, destination } = event.interactionData;
    const dx = destination.x - origin.x;
    const dy = destination.y - origin.y;
    this.pan({
      x: this.stage.pivot.x - dx * DRAG_SPEED_MODIFIER,
      y: this.stage.pivot.y - dy * DRAG_SPEED_MODIFIER
    });
  }
  /**
   * Handle window resize events.
   */
  #onResize() {
    this.app.renderer.resize(window.innerWidth, window.innerHeight);
    const { width, height } = this.app.renderer.screen;
    this.stage.position.set(width / 2, height / 2);
    this.pan(this.stage.pivot);
  }
  /**
   * Handle mousewheel events on the Talent Tree canvas.
   * @param {WheelEvent} event      The mousewheel event
   */
  #onWheel(event) {
    if (this.canvas.hidden || event.target?.id !== "perk-tree")
      return;
    const deltaZ = event.delta < 0 ? 1.05 : 0.95;
    this.pan({ scale: deltaZ * this.stage.scale.x });
  }
}
const GamePTR = {
  onInit() {
    const initData2 = {
      tree: new PTRPerkTree()
    };
    game.ptr = foundry.utils.mergeObject(game.ptr ?? {}, initData2);
  },
  onSetup() {
  },
  onReady() {
  }
};
const Init = {
  listen() {
    Hooks.once("init", () => {
      console.log("PTR 2e | Initializing");
      window.actor = function() {
        return canvas.tokens.controlled[0]?.actor;
      };
      CONFIG.PTR = PTRCONFIG;
      Object.freeze(CONFIG.PTR);
      CONFIG.Combat.documentClass = CombatPTR2e;
      CONFIG.Combatant.documentClass = CombatantPTR2e;
      CONFIG.ui.combat = PTRCONFIG.ui.combat;
      CONFIG.ui.perks = PTRCONFIG.ui.perks;
      CONFIG.Actor.documentClass = PTRCONFIG.Actor.documentClass;
      CONFIG.Item.documentClass = PTRCONFIG.Item.documentClass;
      CONFIG.Actor.dataModels = PTRCONFIG.Actor.dataModels;
      CONFIG.Item.dataModels = PTRCONFIG.Item.dataModels;
      {
        Actors.unregisterSheet("core", ActorSheet);
        Actors.registerSheet("ptr2e", ActorSheetPTR2e, { makeDefault: true });
      }
      registerHandlebarsHelpers();
      registerTemplates();
      GamePTR.onInit();
    });
    Hooks.once("setup", () => {
    });
  }
};
const PTRHooks = {
  listen() {
    const listeners = [
      // Add listeners here
      Init
    ];
    for (const listener of listeners)
      listener.listen();
  }
};
PTRHooks.listen();
//# sourceMappingURL=ptr2e.mjs.map

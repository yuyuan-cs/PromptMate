import ht from "electron";
import ee from "path";
import tt from "fs";
import Ff from "constants";
import jr from "stream";
import Eo from "util";
import gl from "assert";
import Wn from "child_process";
import yl from "events";
import Hr from "crypto";
import El from "tty";
import Vn from "os";
import ir from "url";
import xf from "string_decoder";
import vl from "zlib";
import Lf from "http";
var Ae = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, A_ = {}, wl = {}, Ft = {}, be = {};
be.fromCallback = function(e) {
  return Object.defineProperty(function(...t) {
    if (typeof t[t.length - 1] == "function") e.apply(this, t);
    else
      return new Promise((r, n) => {
        t.push((i, o) => i != null ? n(i) : r(o)), e.apply(this, t);
      });
  }, "name", { value: e.name });
};
be.fromPromise = function(e) {
  return Object.defineProperty(function(...t) {
    const r = t[t.length - 1];
    if (typeof r != "function") return e.apply(this, t);
    t.pop(), e.apply(this, t).then((n) => r(null, n), r);
  }, "name", { value: e.name });
};
var st = Ff, Uf = process.cwd, bn = null, kf = process.env.GRACEFUL_FS_PLATFORM || process.platform;
process.cwd = function() {
  return bn || (bn = Uf.call(process)), bn;
};
try {
  process.cwd();
} catch {
}
if (typeof process.chdir == "function") {
  var ga = process.chdir;
  process.chdir = function(e) {
    bn = null, ga.call(process, e);
  }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, ga);
}
var Mf = Bf;
function Bf(e) {
  st.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && t(e), e.lutimes || r(e), e.chown = o(e.chown), e.fchown = o(e.fchown), e.lchown = o(e.lchown), e.chmod = n(e.chmod), e.fchmod = n(e.fchmod), e.lchmod = n(e.lchmod), e.chownSync = a(e.chownSync), e.fchownSync = a(e.fchownSync), e.lchownSync = a(e.lchownSync), e.chmodSync = i(e.chmodSync), e.fchmodSync = i(e.fchmodSync), e.lchmodSync = i(e.lchmodSync), e.stat = s(e.stat), e.fstat = s(e.fstat), e.lstat = s(e.lstat), e.statSync = l(e.statSync), e.fstatSync = l(e.fstatSync), e.lstatSync = l(e.lstatSync), e.chmod && !e.lchmod && (e.lchmod = function(f, u, p) {
    p && process.nextTick(p);
  }, e.lchmodSync = function() {
  }), e.chown && !e.lchown && (e.lchown = function(f, u, p, g) {
    g && process.nextTick(g);
  }, e.lchownSync = function() {
  }), kf === "win32" && (e.rename = typeof e.rename != "function" ? e.rename : function(f) {
    function u(p, g, E) {
      var S = Date.now(), _ = 0;
      f(p, g, function T(A) {
        if (A && (A.code === "EACCES" || A.code === "EPERM" || A.code === "EBUSY") && Date.now() - S < 6e4) {
          setTimeout(function() {
            e.stat(g, function(N, L) {
              N && N.code === "ENOENT" ? f(p, g, T) : E(A);
            });
          }, _), _ < 100 && (_ += 10);
          return;
        }
        E && E(A);
      });
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(u, f), u;
  }(e.rename)), e.read = typeof e.read != "function" ? e.read : function(f) {
    function u(p, g, E, S, _, T) {
      var A;
      if (T && typeof T == "function") {
        var N = 0;
        A = function(L, Z, ae) {
          if (L && L.code === "EAGAIN" && N < 10)
            return N++, f.call(e, p, g, E, S, _, A);
          T.apply(this, arguments);
        };
      }
      return f.call(e, p, g, E, S, _, A);
    }
    return Object.setPrototypeOf && Object.setPrototypeOf(u, f), u;
  }(e.read), e.readSync = typeof e.readSync != "function" ? e.readSync : /* @__PURE__ */ function(f) {
    return function(u, p, g, E, S) {
      for (var _ = 0; ; )
        try {
          return f.call(e, u, p, g, E, S);
        } catch (T) {
          if (T.code === "EAGAIN" && _ < 10) {
            _++;
            continue;
          }
          throw T;
        }
    };
  }(e.readSync);
  function t(f) {
    f.lchmod = function(u, p, g) {
      f.open(
        u,
        st.O_WRONLY | st.O_SYMLINK,
        p,
        function(E, S) {
          if (E) {
            g && g(E);
            return;
          }
          f.fchmod(S, p, function(_) {
            f.close(S, function(T) {
              g && g(_ || T);
            });
          });
        }
      );
    }, f.lchmodSync = function(u, p) {
      var g = f.openSync(u, st.O_WRONLY | st.O_SYMLINK, p), E = !0, S;
      try {
        S = f.fchmodSync(g, p), E = !1;
      } finally {
        if (E)
          try {
            f.closeSync(g);
          } catch {
          }
        else
          f.closeSync(g);
      }
      return S;
    };
  }
  function r(f) {
    st.hasOwnProperty("O_SYMLINK") && f.futimes ? (f.lutimes = function(u, p, g, E) {
      f.open(u, st.O_SYMLINK, function(S, _) {
        if (S) {
          E && E(S);
          return;
        }
        f.futimes(_, p, g, function(T) {
          f.close(_, function(A) {
            E && E(T || A);
          });
        });
      });
    }, f.lutimesSync = function(u, p, g) {
      var E = f.openSync(u, st.O_SYMLINK), S, _ = !0;
      try {
        S = f.futimesSync(E, p, g), _ = !1;
      } finally {
        if (_)
          try {
            f.closeSync(E);
          } catch {
          }
        else
          f.closeSync(E);
      }
      return S;
    }) : f.futimes && (f.lutimes = function(u, p, g, E) {
      E && process.nextTick(E);
    }, f.lutimesSync = function() {
    });
  }
  function n(f) {
    return f && function(u, p, g) {
      return f.call(e, u, p, function(E) {
        d(E) && (E = null), g && g.apply(this, arguments);
      });
    };
  }
  function i(f) {
    return f && function(u, p) {
      try {
        return f.call(e, u, p);
      } catch (g) {
        if (!d(g)) throw g;
      }
    };
  }
  function o(f) {
    return f && function(u, p, g, E) {
      return f.call(e, u, p, g, function(S) {
        d(S) && (S = null), E && E.apply(this, arguments);
      });
    };
  }
  function a(f) {
    return f && function(u, p, g) {
      try {
        return f.call(e, u, p, g);
      } catch (E) {
        if (!d(E)) throw E;
      }
    };
  }
  function s(f) {
    return f && function(u, p, g) {
      typeof p == "function" && (g = p, p = null);
      function E(S, _) {
        _ && (_.uid < 0 && (_.uid += 4294967296), _.gid < 0 && (_.gid += 4294967296)), g && g.apply(this, arguments);
      }
      return p ? f.call(e, u, p, E) : f.call(e, u, E);
    };
  }
  function l(f) {
    return f && function(u, p) {
      var g = p ? f.call(e, u, p) : f.call(e, u);
      return g && (g.uid < 0 && (g.uid += 4294967296), g.gid < 0 && (g.gid += 4294967296)), g;
    };
  }
  function d(f) {
    if (!f || f.code === "ENOSYS")
      return !0;
    var u = !process.getuid || process.getuid() !== 0;
    return !!(u && (f.code === "EINVAL" || f.code === "EPERM"));
  }
}
var ya = jr.Stream, jf = Hf;
function Hf(e) {
  return {
    ReadStream: t,
    WriteStream: r
  };
  function t(n, i) {
    if (!(this instanceof t)) return new t(n, i);
    ya.call(this);
    var o = this;
    this.path = n, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", this.mode = 438, this.bufferSize = 64 * 1024, i = i || {};
    for (var a = Object.keys(i), s = 0, l = a.length; s < l; s++) {
      var d = a[s];
      this[d] = i[d];
    }
    if (this.encoding && this.setEncoding(this.encoding), this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.end === void 0)
        this.end = 1 / 0;
      else if (typeof this.end != "number")
        throw TypeError("end must be a Number");
      if (this.start > this.end)
        throw new Error("start must be <= end");
      this.pos = this.start;
    }
    if (this.fd !== null) {
      process.nextTick(function() {
        o._read();
      });
      return;
    }
    e.open(this.path, this.flags, this.mode, function(f, u) {
      if (f) {
        o.emit("error", f), o.readable = !1;
        return;
      }
      o.fd = u, o.emit("open", u), o._read();
    });
  }
  function r(n, i) {
    if (!(this instanceof r)) return new r(n, i);
    ya.call(this), this.path = n, this.fd = null, this.writable = !0, this.flags = "w", this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, i = i || {};
    for (var o = Object.keys(i), a = 0, s = o.length; a < s; a++) {
      var l = o[a];
      this[l] = i[l];
    }
    if (this.start !== void 0) {
      if (typeof this.start != "number")
        throw TypeError("start must be a Number");
      if (this.start < 0)
        throw new Error("start must be >= zero");
      this.pos = this.start;
    }
    this.busy = !1, this._queue = [], this.fd === null && (this._open = e.open, this._queue.push([this._open, this.path, this.flags, this.mode, void 0]), this.flush());
  }
}
var qf = Wf, Gf = Object.getPrototypeOf || function(e) {
  return e.__proto__;
};
function Wf(e) {
  if (e === null || typeof e != "object")
    return e;
  if (e instanceof Object)
    var t = { __proto__: Gf(e) };
  else
    var t = /* @__PURE__ */ Object.create(null);
  return Object.getOwnPropertyNames(e).forEach(function(r) {
    Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(e, r));
  }), t;
}
var ne = tt, Vf = Mf, Yf = jf, zf = qf, fn = Eo, ge, Nn;
typeof Symbol == "function" && typeof Symbol.for == "function" ? (ge = Symbol.for("graceful-fs.queue"), Nn = Symbol.for("graceful-fs.previous")) : (ge = "___graceful-fs.queue", Nn = "___graceful-fs.previous");
function Xf() {
}
function _l(e, t) {
  Object.defineProperty(e, ge, {
    get: function() {
      return t;
    }
  });
}
var Rt = Xf;
fn.debuglog ? Rt = fn.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (Rt = function() {
  var e = fn.format.apply(fn, arguments);
  e = "GFS4: " + e.split(/\n/).join(`
GFS4: `), console.error(e);
});
if (!ne[ge]) {
  var Kf = Ae[ge] || [];
  _l(ne, Kf), ne.close = function(e) {
    function t(r, n) {
      return e.call(ne, r, function(i) {
        i || Ea(), typeof n == "function" && n.apply(this, arguments);
      });
    }
    return Object.defineProperty(t, Nn, {
      value: e
    }), t;
  }(ne.close), ne.closeSync = function(e) {
    function t(r) {
      e.apply(ne, arguments), Ea();
    }
    return Object.defineProperty(t, Nn, {
      value: e
    }), t;
  }(ne.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", function() {
    Rt(ne[ge]), gl.equal(ne[ge].length, 0);
  });
}
Ae[ge] || _l(Ae, ne[ge]);
var $e = vo(zf(ne));
process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !ne.__patched && ($e = vo(ne), ne.__patched = !0);
function vo(e) {
  Vf(e), e.gracefulify = vo, e.createReadStream = Z, e.createWriteStream = ae;
  var t = e.readFile;
  e.readFile = r;
  function r(y, q, B) {
    return typeof q == "function" && (B = q, q = null), M(y, q, B);
    function M(X, I, $, R) {
      return t(X, I, function(b) {
        b && (b.code === "EMFILE" || b.code === "ENFILE") ? kt([M, [X, I, $], b, R || Date.now(), Date.now()]) : typeof $ == "function" && $.apply(this, arguments);
      });
    }
  }
  var n = e.writeFile;
  e.writeFile = i;
  function i(y, q, B, M) {
    return typeof B == "function" && (M = B, B = null), X(y, q, B, M);
    function X(I, $, R, b, D) {
      return n(I, $, R, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? kt([X, [I, $, R, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var o = e.appendFile;
  o && (e.appendFile = a);
  function a(y, q, B, M) {
    return typeof B == "function" && (M = B, B = null), X(y, q, B, M);
    function X(I, $, R, b, D) {
      return o(I, $, R, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? kt([X, [I, $, R, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var s = e.copyFile;
  s && (e.copyFile = l);
  function l(y, q, B, M) {
    return typeof B == "function" && (M = B, B = 0), X(y, q, B, M);
    function X(I, $, R, b, D) {
      return s(I, $, R, function(P) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? kt([X, [I, $, R, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  var d = e.readdir;
  e.readdir = u;
  var f = /^v[0-5]\./;
  function u(y, q, B) {
    typeof q == "function" && (B = q, q = null);
    var M = f.test(process.version) ? function($, R, b, D) {
      return d($, X(
        $,
        R,
        b,
        D
      ));
    } : function($, R, b, D) {
      return d($, R, X(
        $,
        R,
        b,
        D
      ));
    };
    return M(y, q, B);
    function X(I, $, R, b) {
      return function(D, P) {
        D && (D.code === "EMFILE" || D.code === "ENFILE") ? kt([
          M,
          [I, $, R],
          D,
          b || Date.now(),
          Date.now()
        ]) : (P && P.sort && P.sort(), typeof R == "function" && R.call(this, D, P));
      };
    }
  }
  if (process.version.substr(0, 4) === "v0.8") {
    var p = Yf(e);
    T = p.ReadStream, N = p.WriteStream;
  }
  var g = e.ReadStream;
  g && (T.prototype = Object.create(g.prototype), T.prototype.open = A);
  var E = e.WriteStream;
  E && (N.prototype = Object.create(E.prototype), N.prototype.open = L), Object.defineProperty(e, "ReadStream", {
    get: function() {
      return T;
    },
    set: function(y) {
      T = y;
    },
    enumerable: !0,
    configurable: !0
  }), Object.defineProperty(e, "WriteStream", {
    get: function() {
      return N;
    },
    set: function(y) {
      N = y;
    },
    enumerable: !0,
    configurable: !0
  });
  var S = T;
  Object.defineProperty(e, "FileReadStream", {
    get: function() {
      return S;
    },
    set: function(y) {
      S = y;
    },
    enumerable: !0,
    configurable: !0
  });
  var _ = N;
  Object.defineProperty(e, "FileWriteStream", {
    get: function() {
      return _;
    },
    set: function(y) {
      _ = y;
    },
    enumerable: !0,
    configurable: !0
  });
  function T(y, q) {
    return this instanceof T ? (g.apply(this, arguments), this) : T.apply(Object.create(T.prototype), arguments);
  }
  function A() {
    var y = this;
    Ne(y.path, y.flags, y.mode, function(q, B) {
      q ? (y.autoClose && y.destroy(), y.emit("error", q)) : (y.fd = B, y.emit("open", B), y.read());
    });
  }
  function N(y, q) {
    return this instanceof N ? (E.apply(this, arguments), this) : N.apply(Object.create(N.prototype), arguments);
  }
  function L() {
    var y = this;
    Ne(y.path, y.flags, y.mode, function(q, B) {
      q ? (y.destroy(), y.emit("error", q)) : (y.fd = B, y.emit("open", B));
    });
  }
  function Z(y, q) {
    return new e.ReadStream(y, q);
  }
  function ae(y, q) {
    return new e.WriteStream(y, q);
  }
  var V = e.open;
  e.open = Ne;
  function Ne(y, q, B, M) {
    return typeof B == "function" && (M = B, B = null), X(y, q, B, M);
    function X(I, $, R, b, D) {
      return V(I, $, R, function(P, k) {
        P && (P.code === "EMFILE" || P.code === "ENFILE") ? kt([X, [I, $, R, b], P, D || Date.now(), Date.now()]) : typeof b == "function" && b.apply(this, arguments);
      });
    }
  }
  return e;
}
function kt(e) {
  Rt("ENQUEUE", e[0].name, e[1]), ne[ge].push(e), wo();
}
var dn;
function Ea() {
  for (var e = Date.now(), t = 0; t < ne[ge].length; ++t)
    ne[ge][t].length > 2 && (ne[ge][t][3] = e, ne[ge][t][4] = e);
  wo();
}
function wo() {
  if (clearTimeout(dn), dn = void 0, ne[ge].length !== 0) {
    var e = ne[ge].shift(), t = e[0], r = e[1], n = e[2], i = e[3], o = e[4];
    if (i === void 0)
      Rt("RETRY", t.name, r), t.apply(null, r);
    else if (Date.now() - i >= 6e4) {
      Rt("TIMEOUT", t.name, r);
      var a = r.pop();
      typeof a == "function" && a.call(null, n);
    } else {
      var s = Date.now() - o, l = Math.max(o - i, 1), d = Math.min(l * 1.2, 100);
      s >= d ? (Rt("RETRY", t.name, r), t.apply(null, r.concat([i]))) : ne[ge].push(e);
    }
    dn === void 0 && (dn = setTimeout(wo, 0));
  }
}
(function(e) {
  const t = be.fromCallback, r = $e, n = [
    "access",
    "appendFile",
    "chmod",
    "chown",
    "close",
    "copyFile",
    "fchmod",
    "fchown",
    "fdatasync",
    "fstat",
    "fsync",
    "ftruncate",
    "futimes",
    "lchmod",
    "lchown",
    "link",
    "lstat",
    "mkdir",
    "mkdtemp",
    "open",
    "opendir",
    "readdir",
    "readFile",
    "readlink",
    "realpath",
    "rename",
    "rm",
    "rmdir",
    "stat",
    "symlink",
    "truncate",
    "unlink",
    "utimes",
    "writeFile"
  ].filter((i) => typeof r[i] == "function");
  Object.assign(e, r), n.forEach((i) => {
    e[i] = t(r[i]);
  }), e.exists = function(i, o) {
    return typeof o == "function" ? r.exists(i, o) : new Promise((a) => r.exists(i, a));
  }, e.read = function(i, o, a, s, l, d) {
    return typeof d == "function" ? r.read(i, o, a, s, l, d) : new Promise((f, u) => {
      r.read(i, o, a, s, l, (p, g, E) => {
        if (p) return u(p);
        f({ bytesRead: g, buffer: E });
      });
    });
  }, e.write = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.write(i, o, ...a) : new Promise((s, l) => {
      r.write(i, o, ...a, (d, f, u) => {
        if (d) return l(d);
        s({ bytesWritten: f, buffer: u });
      });
    });
  }, typeof r.writev == "function" && (e.writev = function(i, o, ...a) {
    return typeof a[a.length - 1] == "function" ? r.writev(i, o, ...a) : new Promise((s, l) => {
      r.writev(i, o, ...a, (d, f, u) => {
        if (d) return l(d);
        s({ bytesWritten: f, buffers: u });
      });
    });
  }), typeof r.realpath.native == "function" ? e.realpath.native = t(r.realpath.native) : process.emitWarning(
    "fs.realpath.native is not a function. Is fs being monkey-patched?",
    "Warning",
    "fs-extra-WARN0003"
  );
})(Ft);
var _o = {}, Sl = {};
const Jf = ee;
Sl.checkPath = function(t) {
  if (process.platform === "win32" && /[<>:"|?*]/.test(t.replace(Jf.parse(t).root, ""))) {
    const n = new Error(`Path contains invalid characters: ${t}`);
    throw n.code = "EINVAL", n;
  }
};
const Al = Ft, { checkPath: Tl } = Sl, Cl = (e) => {
  const t = { mode: 511 };
  return typeof e == "number" ? e : { ...t, ...e }.mode;
};
_o.makeDir = async (e, t) => (Tl(e), Al.mkdir(e, {
  mode: Cl(t),
  recursive: !0
}));
_o.makeDirSync = (e, t) => (Tl(e), Al.mkdirSync(e, {
  mode: Cl(t),
  recursive: !0
}));
const Qf = be.fromPromise, { makeDir: Zf, makeDirSync: Ai } = _o, Ti = Qf(Zf);
var Xe = {
  mkdirs: Ti,
  mkdirsSync: Ai,
  // alias
  mkdirp: Ti,
  mkdirpSync: Ai,
  ensureDir: Ti,
  ensureDirSync: Ai
};
const ed = be.fromPromise, bl = Ft;
function td(e) {
  return bl.access(e).then(() => !0).catch(() => !1);
}
var xt = {
  pathExists: ed(td),
  pathExistsSync: bl.existsSync
};
const Qt = $e;
function rd(e, t, r, n) {
  Qt.open(e, "r+", (i, o) => {
    if (i) return n(i);
    Qt.futimes(o, t, r, (a) => {
      Qt.close(o, (s) => {
        n && n(a || s);
      });
    });
  });
}
function nd(e, t, r) {
  const n = Qt.openSync(e, "r+");
  return Qt.futimesSync(n, t, r), Qt.closeSync(n);
}
var $l = {
  utimesMillis: rd,
  utimesMillisSync: nd
};
const er = Ft, de = ee, id = Eo;
function od(e, t, r) {
  const n = r.dereference ? (i) => er.stat(i, { bigint: !0 }) : (i) => er.lstat(i, { bigint: !0 });
  return Promise.all([
    n(e),
    n(t).catch((i) => {
      if (i.code === "ENOENT") return null;
      throw i;
    })
  ]).then(([i, o]) => ({ srcStat: i, destStat: o }));
}
function ad(e, t, r) {
  let n;
  const i = r.dereference ? (a) => er.statSync(a, { bigint: !0 }) : (a) => er.lstatSync(a, { bigint: !0 }), o = i(e);
  try {
    n = i(t);
  } catch (a) {
    if (a.code === "ENOENT") return { srcStat: o, destStat: null };
    throw a;
  }
  return { srcStat: o, destStat: n };
}
function sd(e, t, r, n, i) {
  id.callbackify(od)(e, t, n, (o, a) => {
    if (o) return i(o);
    const { srcStat: s, destStat: l } = a;
    if (l) {
      if (qr(s, l)) {
        const d = de.basename(e), f = de.basename(t);
        return r === "move" && d !== f && d.toLowerCase() === f.toLowerCase() ? i(null, { srcStat: s, destStat: l, isChangingCase: !0 }) : i(new Error("Source and destination must not be the same."));
      }
      if (s.isDirectory() && !l.isDirectory())
        return i(new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`));
      if (!s.isDirectory() && l.isDirectory())
        return i(new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`));
    }
    return s.isDirectory() && So(e, t) ? i(new Error(Yn(e, t, r))) : i(null, { srcStat: s, destStat: l });
  });
}
function ld(e, t, r, n) {
  const { srcStat: i, destStat: o } = ad(e, t, n);
  if (o) {
    if (qr(i, o)) {
      const a = de.basename(e), s = de.basename(t);
      if (r === "move" && a !== s && a.toLowerCase() === s.toLowerCase())
        return { srcStat: i, destStat: o, isChangingCase: !0 };
      throw new Error("Source and destination must not be the same.");
    }
    if (i.isDirectory() && !o.isDirectory())
      throw new Error(`Cannot overwrite non-directory '${t}' with directory '${e}'.`);
    if (!i.isDirectory() && o.isDirectory())
      throw new Error(`Cannot overwrite directory '${t}' with non-directory '${e}'.`);
  }
  if (i.isDirectory() && So(e, t))
    throw new Error(Yn(e, t, r));
  return { srcStat: i, destStat: o };
}
function Ol(e, t, r, n, i) {
  const o = de.resolve(de.dirname(e)), a = de.resolve(de.dirname(r));
  if (a === o || a === de.parse(a).root) return i();
  er.stat(a, { bigint: !0 }, (s, l) => s ? s.code === "ENOENT" ? i() : i(s) : qr(t, l) ? i(new Error(Yn(e, r, n))) : Ol(e, t, a, n, i));
}
function Il(e, t, r, n) {
  const i = de.resolve(de.dirname(e)), o = de.resolve(de.dirname(r));
  if (o === i || o === de.parse(o).root) return;
  let a;
  try {
    a = er.statSync(o, { bigint: !0 });
  } catch (s) {
    if (s.code === "ENOENT") return;
    throw s;
  }
  if (qr(t, a))
    throw new Error(Yn(e, r, n));
  return Il(e, t, o, n);
}
function qr(e, t) {
  return t.ino && t.dev && t.ino === e.ino && t.dev === e.dev;
}
function So(e, t) {
  const r = de.resolve(e).split(de.sep).filter((i) => i), n = de.resolve(t).split(de.sep).filter((i) => i);
  return r.reduce((i, o, a) => i && n[a] === o, !0);
}
function Yn(e, t, r) {
  return `Cannot ${r} '${e}' to a subdirectory of itself, '${t}'.`;
}
var or = {
  checkPaths: sd,
  checkPathsSync: ld,
  checkParentPaths: Ol,
  checkParentPathsSync: Il,
  isSrcSubdir: So,
  areIdentical: qr
};
const Pe = $e, Cr = ee, cd = Xe.mkdirs, ud = xt.pathExists, fd = $l.utimesMillis, br = or;
function dd(e, t, r, n) {
  typeof r == "function" && !n ? (n = r, r = {}) : typeof r == "function" && (r = { filter: r }), n = n || function() {
  }, r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0001"
  ), br.checkPaths(e, t, "copy", r, (i, o) => {
    if (i) return n(i);
    const { srcStat: a, destStat: s } = o;
    br.checkParentPaths(e, a, t, "copy", (l) => l ? n(l) : r.filter ? Pl(va, s, e, t, r, n) : va(s, e, t, r, n));
  });
}
function va(e, t, r, n, i) {
  const o = Cr.dirname(r);
  ud(o, (a, s) => {
    if (a) return i(a);
    if (s) return Dn(e, t, r, n, i);
    cd(o, (l) => l ? i(l) : Dn(e, t, r, n, i));
  });
}
function Pl(e, t, r, n, i, o) {
  Promise.resolve(i.filter(r, n)).then((a) => a ? e(t, r, n, i, o) : o(), (a) => o(a));
}
function hd(e, t, r, n, i) {
  return n.filter ? Pl(Dn, e, t, r, n, i) : Dn(e, t, r, n, i);
}
function Dn(e, t, r, n, i) {
  (n.dereference ? Pe.stat : Pe.lstat)(t, (a, s) => a ? i(a) : s.isDirectory() ? wd(s, e, t, r, n, i) : s.isFile() || s.isCharacterDevice() || s.isBlockDevice() ? pd(s, e, t, r, n, i) : s.isSymbolicLink() ? Ad(e, t, r, n, i) : s.isSocket() ? i(new Error(`Cannot copy a socket file: ${t}`)) : s.isFIFO() ? i(new Error(`Cannot copy a FIFO pipe: ${t}`)) : i(new Error(`Unknown file: ${t}`)));
}
function pd(e, t, r, n, i, o) {
  return t ? md(e, r, n, i, o) : Rl(e, r, n, i, o);
}
function md(e, t, r, n, i) {
  if (n.overwrite)
    Pe.unlink(r, (o) => o ? i(o) : Rl(e, t, r, n, i));
  else return n.errorOnExist ? i(new Error(`'${r}' already exists`)) : i();
}
function Rl(e, t, r, n, i) {
  Pe.copyFile(t, r, (o) => o ? i(o) : n.preserveTimestamps ? gd(e.mode, t, r, i) : zn(r, e.mode, i));
}
function gd(e, t, r, n) {
  return yd(e) ? Ed(r, e, (i) => i ? n(i) : wa(e, t, r, n)) : wa(e, t, r, n);
}
function yd(e) {
  return (e & 128) === 0;
}
function Ed(e, t, r) {
  return zn(e, t | 128, r);
}
function wa(e, t, r, n) {
  vd(t, r, (i) => i ? n(i) : zn(r, e, n));
}
function zn(e, t, r) {
  return Pe.chmod(e, t, r);
}
function vd(e, t, r) {
  Pe.stat(e, (n, i) => n ? r(n) : fd(t, i.atime, i.mtime, r));
}
function wd(e, t, r, n, i, o) {
  return t ? Nl(r, n, i, o) : _d(e.mode, r, n, i, o);
}
function _d(e, t, r, n, i) {
  Pe.mkdir(r, (o) => {
    if (o) return i(o);
    Nl(t, r, n, (a) => a ? i(a) : zn(r, e, i));
  });
}
function Nl(e, t, r, n) {
  Pe.readdir(e, (i, o) => i ? n(i) : Dl(o, e, t, r, n));
}
function Dl(e, t, r, n, i) {
  const o = e.pop();
  return o ? Sd(e, o, t, r, n, i) : i();
}
function Sd(e, t, r, n, i, o) {
  const a = Cr.join(r, t), s = Cr.join(n, t);
  br.checkPaths(a, s, "copy", i, (l, d) => {
    if (l) return o(l);
    const { destStat: f } = d;
    hd(f, a, s, i, (u) => u ? o(u) : Dl(e, r, n, i, o));
  });
}
function Ad(e, t, r, n, i) {
  Pe.readlink(t, (o, a) => {
    if (o) return i(o);
    if (n.dereference && (a = Cr.resolve(process.cwd(), a)), e)
      Pe.readlink(r, (s, l) => s ? s.code === "EINVAL" || s.code === "UNKNOWN" ? Pe.symlink(a, r, i) : i(s) : (n.dereference && (l = Cr.resolve(process.cwd(), l)), br.isSrcSubdir(a, l) ? i(new Error(`Cannot copy '${a}' to a subdirectory of itself, '${l}'.`)) : e.isDirectory() && br.isSrcSubdir(l, a) ? i(new Error(`Cannot overwrite '${l}' with '${a}'.`)) : Td(a, r, i)));
    else
      return Pe.symlink(a, r, i);
  });
}
function Td(e, t, r) {
  Pe.unlink(t, (n) => n ? r(n) : Pe.symlink(e, t, r));
}
var Cd = dd;
const we = $e, $r = ee, bd = Xe.mkdirsSync, $d = $l.utimesMillisSync, Or = or;
function Od(e, t, r) {
  typeof r == "function" && (r = { filter: r }), r = r || {}, r.clobber = "clobber" in r ? !!r.clobber : !0, r.overwrite = "overwrite" in r ? !!r.overwrite : r.clobber, r.preserveTimestamps && process.arch === "ia32" && process.emitWarning(
    `Using the preserveTimestamps option in 32-bit node is not recommended;

	see https://github.com/jprichardson/node-fs-extra/issues/269`,
    "Warning",
    "fs-extra-WARN0002"
  );
  const { srcStat: n, destStat: i } = Or.checkPathsSync(e, t, "copy", r);
  return Or.checkParentPathsSync(e, n, t, "copy"), Id(i, e, t, r);
}
function Id(e, t, r, n) {
  if (n.filter && !n.filter(t, r)) return;
  const i = $r.dirname(r);
  return we.existsSync(i) || bd(i), Fl(e, t, r, n);
}
function Pd(e, t, r, n) {
  if (!(n.filter && !n.filter(t, r)))
    return Fl(e, t, r, n);
}
function Fl(e, t, r, n) {
  const o = (n.dereference ? we.statSync : we.lstatSync)(t);
  if (o.isDirectory()) return Ud(o, e, t, r, n);
  if (o.isFile() || o.isCharacterDevice() || o.isBlockDevice()) return Rd(o, e, t, r, n);
  if (o.isSymbolicLink()) return Bd(e, t, r, n);
  throw o.isSocket() ? new Error(`Cannot copy a socket file: ${t}`) : o.isFIFO() ? new Error(`Cannot copy a FIFO pipe: ${t}`) : new Error(`Unknown file: ${t}`);
}
function Rd(e, t, r, n, i) {
  return t ? Nd(e, r, n, i) : xl(e, r, n, i);
}
function Nd(e, t, r, n) {
  if (n.overwrite)
    return we.unlinkSync(r), xl(e, t, r, n);
  if (n.errorOnExist)
    throw new Error(`'${r}' already exists`);
}
function xl(e, t, r, n) {
  return we.copyFileSync(t, r), n.preserveTimestamps && Dd(e.mode, t, r), Ao(r, e.mode);
}
function Dd(e, t, r) {
  return Fd(e) && xd(r, e), Ld(t, r);
}
function Fd(e) {
  return (e & 128) === 0;
}
function xd(e, t) {
  return Ao(e, t | 128);
}
function Ao(e, t) {
  return we.chmodSync(e, t);
}
function Ld(e, t) {
  const r = we.statSync(e);
  return $d(t, r.atime, r.mtime);
}
function Ud(e, t, r, n, i) {
  return t ? Ll(r, n, i) : kd(e.mode, r, n, i);
}
function kd(e, t, r, n) {
  return we.mkdirSync(r), Ll(t, r, n), Ao(r, e);
}
function Ll(e, t, r) {
  we.readdirSync(e).forEach((n) => Md(n, e, t, r));
}
function Md(e, t, r, n) {
  const i = $r.join(t, e), o = $r.join(r, e), { destStat: a } = Or.checkPathsSync(i, o, "copy", n);
  return Pd(a, i, o, n);
}
function Bd(e, t, r, n) {
  let i = we.readlinkSync(t);
  if (n.dereference && (i = $r.resolve(process.cwd(), i)), e) {
    let o;
    try {
      o = we.readlinkSync(r);
    } catch (a) {
      if (a.code === "EINVAL" || a.code === "UNKNOWN") return we.symlinkSync(i, r);
      throw a;
    }
    if (n.dereference && (o = $r.resolve(process.cwd(), o)), Or.isSrcSubdir(i, o))
      throw new Error(`Cannot copy '${i}' to a subdirectory of itself, '${o}'.`);
    if (we.statSync(r).isDirectory() && Or.isSrcSubdir(o, i))
      throw new Error(`Cannot overwrite '${o}' with '${i}'.`);
    return jd(i, r);
  } else
    return we.symlinkSync(i, r);
}
function jd(e, t) {
  return we.unlinkSync(t), we.symlinkSync(e, t);
}
var Hd = Od;
const qd = be.fromCallback;
var To = {
  copy: qd(Cd),
  copySync: Hd
};
const _a = $e, Ul = ee, J = gl, Ir = process.platform === "win32";
function kl(e) {
  [
    "unlink",
    "chmod",
    "stat",
    "lstat",
    "rmdir",
    "readdir"
  ].forEach((r) => {
    e[r] = e[r] || _a[r], r = r + "Sync", e[r] = e[r] || _a[r];
  }), e.maxBusyTries = e.maxBusyTries || 3;
}
function Co(e, t, r) {
  let n = 0;
  typeof t == "function" && (r = t, t = {}), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J.strictEqual(typeof r, "function", "rimraf: callback function required"), J(t, "rimraf: invalid options argument provided"), J.strictEqual(typeof t, "object", "rimraf: options should be object"), kl(t), Sa(e, t, function i(o) {
    if (o) {
      if ((o.code === "EBUSY" || o.code === "ENOTEMPTY" || o.code === "EPERM") && n < t.maxBusyTries) {
        n++;
        const a = n * 100;
        return setTimeout(() => Sa(e, t, i), a);
      }
      o.code === "ENOENT" && (o = null);
    }
    r(o);
  });
}
function Sa(e, t, r) {
  J(e), J(t), J(typeof r == "function"), t.lstat(e, (n, i) => {
    if (n && n.code === "ENOENT")
      return r(null);
    if (n && n.code === "EPERM" && Ir)
      return Aa(e, t, n, r);
    if (i && i.isDirectory())
      return $n(e, t, n, r);
    t.unlink(e, (o) => {
      if (o) {
        if (o.code === "ENOENT")
          return r(null);
        if (o.code === "EPERM")
          return Ir ? Aa(e, t, o, r) : $n(e, t, o, r);
        if (o.code === "EISDIR")
          return $n(e, t, o, r);
      }
      return r(o);
    });
  });
}
function Aa(e, t, r, n) {
  J(e), J(t), J(typeof n == "function"), t.chmod(e, 438, (i) => {
    i ? n(i.code === "ENOENT" ? null : r) : t.stat(e, (o, a) => {
      o ? n(o.code === "ENOENT" ? null : r) : a.isDirectory() ? $n(e, t, r, n) : t.unlink(e, n);
    });
  });
}
function Ta(e, t, r) {
  let n;
  J(e), J(t);
  try {
    t.chmodSync(e, 438);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  try {
    n = t.statSync(e);
  } catch (i) {
    if (i.code === "ENOENT")
      return;
    throw r;
  }
  n.isDirectory() ? On(e, t, r) : t.unlinkSync(e);
}
function $n(e, t, r, n) {
  J(e), J(t), J(typeof n == "function"), t.rmdir(e, (i) => {
    i && (i.code === "ENOTEMPTY" || i.code === "EEXIST" || i.code === "EPERM") ? Gd(e, t, n) : i && i.code === "ENOTDIR" ? n(r) : n(i);
  });
}
function Gd(e, t, r) {
  J(e), J(t), J(typeof r == "function"), t.readdir(e, (n, i) => {
    if (n) return r(n);
    let o = i.length, a;
    if (o === 0) return t.rmdir(e, r);
    i.forEach((s) => {
      Co(Ul.join(e, s), t, (l) => {
        if (!a) {
          if (l) return r(a = l);
          --o === 0 && t.rmdir(e, r);
        }
      });
    });
  });
}
function Ml(e, t) {
  let r;
  t = t || {}, kl(t), J(e, "rimraf: missing path"), J.strictEqual(typeof e, "string", "rimraf: path should be a string"), J(t, "rimraf: missing options"), J.strictEqual(typeof t, "object", "rimraf: options should be object");
  try {
    r = t.lstatSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    n.code === "EPERM" && Ir && Ta(e, t, n);
  }
  try {
    r && r.isDirectory() ? On(e, t, null) : t.unlinkSync(e);
  } catch (n) {
    if (n.code === "ENOENT")
      return;
    if (n.code === "EPERM")
      return Ir ? Ta(e, t, n) : On(e, t, n);
    if (n.code !== "EISDIR")
      throw n;
    On(e, t, n);
  }
}
function On(e, t, r) {
  J(e), J(t);
  try {
    t.rmdirSync(e);
  } catch (n) {
    if (n.code === "ENOTDIR")
      throw r;
    if (n.code === "ENOTEMPTY" || n.code === "EEXIST" || n.code === "EPERM")
      Wd(e, t);
    else if (n.code !== "ENOENT")
      throw n;
  }
}
function Wd(e, t) {
  if (J(e), J(t), t.readdirSync(e).forEach((r) => Ml(Ul.join(e, r), t)), Ir) {
    const r = Date.now();
    do
      try {
        return t.rmdirSync(e, t);
      } catch {
      }
    while (Date.now() - r < 500);
  } else
    return t.rmdirSync(e, t);
}
var Vd = Co;
Co.sync = Ml;
const Fn = $e, Yd = be.fromCallback, Bl = Vd;
function zd(e, t) {
  if (Fn.rm) return Fn.rm(e, { recursive: !0, force: !0 }, t);
  Bl(e, t);
}
function Xd(e) {
  if (Fn.rmSync) return Fn.rmSync(e, { recursive: !0, force: !0 });
  Bl.sync(e);
}
var Xn = {
  remove: Yd(zd),
  removeSync: Xd
};
const Kd = be.fromPromise, jl = Ft, Hl = ee, ql = Xe, Gl = Xn, Ca = Kd(async function(t) {
  let r;
  try {
    r = await jl.readdir(t);
  } catch {
    return ql.mkdirs(t);
  }
  return Promise.all(r.map((n) => Gl.remove(Hl.join(t, n))));
});
function ba(e) {
  let t;
  try {
    t = jl.readdirSync(e);
  } catch {
    return ql.mkdirsSync(e);
  }
  t.forEach((r) => {
    r = Hl.join(e, r), Gl.removeSync(r);
  });
}
var Jd = {
  emptyDirSync: ba,
  emptydirSync: ba,
  emptyDir: Ca,
  emptydir: Ca
};
const Qd = be.fromCallback, Wl = ee, ut = $e, Vl = Xe;
function Zd(e, t) {
  function r() {
    ut.writeFile(e, "", (n) => {
      if (n) return t(n);
      t();
    });
  }
  ut.stat(e, (n, i) => {
    if (!n && i.isFile()) return t();
    const o = Wl.dirname(e);
    ut.stat(o, (a, s) => {
      if (a)
        return a.code === "ENOENT" ? Vl.mkdirs(o, (l) => {
          if (l) return t(l);
          r();
        }) : t(a);
      s.isDirectory() ? r() : ut.readdir(o, (l) => {
        if (l) return t(l);
      });
    });
  });
}
function eh(e) {
  let t;
  try {
    t = ut.statSync(e);
  } catch {
  }
  if (t && t.isFile()) return;
  const r = Wl.dirname(e);
  try {
    ut.statSync(r).isDirectory() || ut.readdirSync(r);
  } catch (n) {
    if (n && n.code === "ENOENT") Vl.mkdirsSync(r);
    else throw n;
  }
  ut.writeFileSync(e, "");
}
var th = {
  createFile: Qd(Zd),
  createFileSync: eh
};
const rh = be.fromCallback, Yl = ee, ct = $e, zl = Xe, nh = xt.pathExists, { areIdentical: Xl } = or;
function ih(e, t, r) {
  function n(i, o) {
    ct.link(i, o, (a) => {
      if (a) return r(a);
      r(null);
    });
  }
  ct.lstat(t, (i, o) => {
    ct.lstat(e, (a, s) => {
      if (a)
        return a.message = a.message.replace("lstat", "ensureLink"), r(a);
      if (o && Xl(s, o)) return r(null);
      const l = Yl.dirname(t);
      nh(l, (d, f) => {
        if (d) return r(d);
        if (f) return n(e, t);
        zl.mkdirs(l, (u) => {
          if (u) return r(u);
          n(e, t);
        });
      });
    });
  });
}
function oh(e, t) {
  let r;
  try {
    r = ct.lstatSync(t);
  } catch {
  }
  try {
    const o = ct.lstatSync(e);
    if (r && Xl(o, r)) return;
  } catch (o) {
    throw o.message = o.message.replace("lstat", "ensureLink"), o;
  }
  const n = Yl.dirname(t);
  return ct.existsSync(n) || zl.mkdirsSync(n), ct.linkSync(e, t);
}
var ah = {
  createLink: rh(ih),
  createLinkSync: oh
};
const ft = ee, _r = $e, sh = xt.pathExists;
function lh(e, t, r) {
  if (ft.isAbsolute(e))
    return _r.lstat(e, (n) => n ? (n.message = n.message.replace("lstat", "ensureSymlink"), r(n)) : r(null, {
      toCwd: e,
      toDst: e
    }));
  {
    const n = ft.dirname(t), i = ft.join(n, e);
    return sh(i, (o, a) => o ? r(o) : a ? r(null, {
      toCwd: i,
      toDst: e
    }) : _r.lstat(e, (s) => s ? (s.message = s.message.replace("lstat", "ensureSymlink"), r(s)) : r(null, {
      toCwd: e,
      toDst: ft.relative(n, e)
    })));
  }
}
function ch(e, t) {
  let r;
  if (ft.isAbsolute(e)) {
    if (r = _r.existsSync(e), !r) throw new Error("absolute srcpath does not exist");
    return {
      toCwd: e,
      toDst: e
    };
  } else {
    const n = ft.dirname(t), i = ft.join(n, e);
    if (r = _r.existsSync(i), r)
      return {
        toCwd: i,
        toDst: e
      };
    if (r = _r.existsSync(e), !r) throw new Error("relative srcpath does not exist");
    return {
      toCwd: e,
      toDst: ft.relative(n, e)
    };
  }
}
var uh = {
  symlinkPaths: lh,
  symlinkPathsSync: ch
};
const Kl = $e;
function fh(e, t, r) {
  if (r = typeof t == "function" ? t : r, t = typeof t == "function" ? !1 : t, t) return r(null, t);
  Kl.lstat(e, (n, i) => {
    if (n) return r(null, "file");
    t = i && i.isDirectory() ? "dir" : "file", r(null, t);
  });
}
function dh(e, t) {
  let r;
  if (t) return t;
  try {
    r = Kl.lstatSync(e);
  } catch {
    return "file";
  }
  return r && r.isDirectory() ? "dir" : "file";
}
var hh = {
  symlinkType: fh,
  symlinkTypeSync: dh
};
const ph = be.fromCallback, Jl = ee, je = Ft, Ql = Xe, mh = Ql.mkdirs, gh = Ql.mkdirsSync, Zl = uh, yh = Zl.symlinkPaths, Eh = Zl.symlinkPathsSync, ec = hh, vh = ec.symlinkType, wh = ec.symlinkTypeSync, _h = xt.pathExists, { areIdentical: tc } = or;
function Sh(e, t, r, n) {
  n = typeof r == "function" ? r : n, r = typeof r == "function" ? !1 : r, je.lstat(t, (i, o) => {
    !i && o.isSymbolicLink() ? Promise.all([
      je.stat(e),
      je.stat(t)
    ]).then(([a, s]) => {
      if (tc(a, s)) return n(null);
      $a(e, t, r, n);
    }) : $a(e, t, r, n);
  });
}
function $a(e, t, r, n) {
  yh(e, t, (i, o) => {
    if (i) return n(i);
    e = o.toDst, vh(o.toCwd, r, (a, s) => {
      if (a) return n(a);
      const l = Jl.dirname(t);
      _h(l, (d, f) => {
        if (d) return n(d);
        if (f) return je.symlink(e, t, s, n);
        mh(l, (u) => {
          if (u) return n(u);
          je.symlink(e, t, s, n);
        });
      });
    });
  });
}
function Ah(e, t, r) {
  let n;
  try {
    n = je.lstatSync(t);
  } catch {
  }
  if (n && n.isSymbolicLink()) {
    const s = je.statSync(e), l = je.statSync(t);
    if (tc(s, l)) return;
  }
  const i = Eh(e, t);
  e = i.toDst, r = wh(i.toCwd, r);
  const o = Jl.dirname(t);
  return je.existsSync(o) || gh(o), je.symlinkSync(e, t, r);
}
var Th = {
  createSymlink: ph(Sh),
  createSymlinkSync: Ah
};
const { createFile: Oa, createFileSync: Ia } = th, { createLink: Pa, createLinkSync: Ra } = ah, { createSymlink: Na, createSymlinkSync: Da } = Th;
var Ch = {
  // file
  createFile: Oa,
  createFileSync: Ia,
  ensureFile: Oa,
  ensureFileSync: Ia,
  // link
  createLink: Pa,
  createLinkSync: Ra,
  ensureLink: Pa,
  ensureLinkSync: Ra,
  // symlink
  createSymlink: Na,
  createSymlinkSync: Da,
  ensureSymlink: Na,
  ensureSymlinkSync: Da
};
function bh(e, { EOL: t = `
`, finalEOL: r = !0, replacer: n = null, spaces: i } = {}) {
  const o = r ? t : "";
  return JSON.stringify(e, n, i).replace(/\n/g, t) + o;
}
function $h(e) {
  return Buffer.isBuffer(e) && (e = e.toString("utf8")), e.replace(/^\uFEFF/, "");
}
var bo = { stringify: bh, stripBom: $h };
let tr;
try {
  tr = $e;
} catch {
  tr = tt;
}
const Kn = be, { stringify: rc, stripBom: nc } = bo;
async function Oh(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || tr, n = "throws" in t ? t.throws : !0;
  let i = await Kn.fromCallback(r.readFile)(e, t);
  i = nc(i);
  let o;
  try {
    o = JSON.parse(i, t ? t.reviver : null);
  } catch (a) {
    if (n)
      throw a.message = `${e}: ${a.message}`, a;
    return null;
  }
  return o;
}
const Ih = Kn.fromPromise(Oh);
function Ph(e, t = {}) {
  typeof t == "string" && (t = { encoding: t });
  const r = t.fs || tr, n = "throws" in t ? t.throws : !0;
  try {
    let i = r.readFileSync(e, t);
    return i = nc(i), JSON.parse(i, t.reviver);
  } catch (i) {
    if (n)
      throw i.message = `${e}: ${i.message}`, i;
    return null;
  }
}
async function Rh(e, t, r = {}) {
  const n = r.fs || tr, i = rc(t, r);
  await Kn.fromCallback(n.writeFile)(e, i, r);
}
const Nh = Kn.fromPromise(Rh);
function Dh(e, t, r = {}) {
  const n = r.fs || tr, i = rc(t, r);
  return n.writeFileSync(e, i, r);
}
const Fh = {
  readFile: Ih,
  readFileSync: Ph,
  writeFile: Nh,
  writeFileSync: Dh
};
var xh = Fh;
const hn = xh;
var Lh = {
  // jsonfile exports
  readJson: hn.readFile,
  readJsonSync: hn.readFileSync,
  writeJson: hn.writeFile,
  writeJsonSync: hn.writeFileSync
};
const Uh = be.fromCallback, Sr = $e, ic = ee, oc = Xe, kh = xt.pathExists;
function Mh(e, t, r, n) {
  typeof r == "function" && (n = r, r = "utf8");
  const i = ic.dirname(e);
  kh(i, (o, a) => {
    if (o) return n(o);
    if (a) return Sr.writeFile(e, t, r, n);
    oc.mkdirs(i, (s) => {
      if (s) return n(s);
      Sr.writeFile(e, t, r, n);
    });
  });
}
function Bh(e, ...t) {
  const r = ic.dirname(e);
  if (Sr.existsSync(r))
    return Sr.writeFileSync(e, ...t);
  oc.mkdirsSync(r), Sr.writeFileSync(e, ...t);
}
var $o = {
  outputFile: Uh(Mh),
  outputFileSync: Bh
};
const { stringify: jh } = bo, { outputFile: Hh } = $o;
async function qh(e, t, r = {}) {
  const n = jh(t, r);
  await Hh(e, n, r);
}
var Gh = qh;
const { stringify: Wh } = bo, { outputFileSync: Vh } = $o;
function Yh(e, t, r) {
  const n = Wh(t, r);
  Vh(e, n, r);
}
var zh = Yh;
const Xh = be.fromPromise, Ce = Lh;
Ce.outputJson = Xh(Gh);
Ce.outputJsonSync = zh;
Ce.outputJSON = Ce.outputJson;
Ce.outputJSONSync = Ce.outputJsonSync;
Ce.writeJSON = Ce.writeJson;
Ce.writeJSONSync = Ce.writeJsonSync;
Ce.readJSON = Ce.readJson;
Ce.readJSONSync = Ce.readJsonSync;
var Kh = Ce;
const Jh = $e, eo = ee, Qh = To.copy, ac = Xn.remove, Zh = Xe.mkdirp, ep = xt.pathExists, Fa = or;
function tp(e, t, r, n) {
  typeof r == "function" && (n = r, r = {}), r = r || {};
  const i = r.overwrite || r.clobber || !1;
  Fa.checkPaths(e, t, "move", r, (o, a) => {
    if (o) return n(o);
    const { srcStat: s, isChangingCase: l = !1 } = a;
    Fa.checkParentPaths(e, s, t, "move", (d) => {
      if (d) return n(d);
      if (rp(t)) return xa(e, t, i, l, n);
      Zh(eo.dirname(t), (f) => f ? n(f) : xa(e, t, i, l, n));
    });
  });
}
function rp(e) {
  const t = eo.dirname(e);
  return eo.parse(t).root === t;
}
function xa(e, t, r, n, i) {
  if (n) return Ci(e, t, r, i);
  if (r)
    return ac(t, (o) => o ? i(o) : Ci(e, t, r, i));
  ep(t, (o, a) => o ? i(o) : a ? i(new Error("dest already exists.")) : Ci(e, t, r, i));
}
function Ci(e, t, r, n) {
  Jh.rename(e, t, (i) => i ? i.code !== "EXDEV" ? n(i) : np(e, t, r, n) : n());
}
function np(e, t, r, n) {
  Qh(e, t, {
    overwrite: r,
    errorOnExist: !0
  }, (o) => o ? n(o) : ac(e, n));
}
var ip = tp;
const sc = $e, to = ee, op = To.copySync, lc = Xn.removeSync, ap = Xe.mkdirpSync, La = or;
function sp(e, t, r) {
  r = r || {};
  const n = r.overwrite || r.clobber || !1, { srcStat: i, isChangingCase: o = !1 } = La.checkPathsSync(e, t, "move", r);
  return La.checkParentPathsSync(e, i, t, "move"), lp(t) || ap(to.dirname(t)), cp(e, t, n, o);
}
function lp(e) {
  const t = to.dirname(e);
  return to.parse(t).root === t;
}
function cp(e, t, r, n) {
  if (n) return bi(e, t, r);
  if (r)
    return lc(t), bi(e, t, r);
  if (sc.existsSync(t)) throw new Error("dest already exists.");
  return bi(e, t, r);
}
function bi(e, t, r) {
  try {
    sc.renameSync(e, t);
  } catch (n) {
    if (n.code !== "EXDEV") throw n;
    return up(e, t, r);
  }
}
function up(e, t, r) {
  return op(e, t, {
    overwrite: r,
    errorOnExist: !0
  }), lc(e);
}
var fp = sp;
const dp = be.fromCallback;
var hp = {
  move: dp(ip),
  moveSync: fp
}, vt = {
  // Export promiseified graceful-fs:
  ...Ft,
  // Export extra methods:
  ...To,
  ...Jd,
  ...Ch,
  ...Kh,
  ...Xe,
  ...hp,
  ...$o,
  ...xt,
  ...Xn
}, rt = {}, pt = {}, he = {}, mt = {};
Object.defineProperty(mt, "__esModule", { value: !0 });
mt.CancellationError = mt.CancellationToken = void 0;
const pp = yl;
class mp extends pp.EventEmitter {
  get cancelled() {
    return this._cancelled || this._parent != null && this._parent.cancelled;
  }
  set parent(t) {
    this.removeParentCancelHandler(), this._parent = t, this.parentCancelHandler = () => this.cancel(), this._parent.onCancel(this.parentCancelHandler);
  }
  // babel cannot compile ... correctly for super calls
  constructor(t) {
    super(), this.parentCancelHandler = null, this._parent = null, this._cancelled = !1, t != null && (this.parent = t);
  }
  cancel() {
    this._cancelled = !0, this.emit("cancel");
  }
  onCancel(t) {
    this.cancelled ? t() : this.once("cancel", t);
  }
  createPromise(t) {
    if (this.cancelled)
      return Promise.reject(new ro());
    const r = () => {
      if (n != null)
        try {
          this.removeListener("cancel", n), n = null;
        } catch {
        }
    };
    let n = null;
    return new Promise((i, o) => {
      let a = null;
      if (n = () => {
        try {
          a != null && (a(), a = null);
        } finally {
          o(new ro());
        }
      }, this.cancelled) {
        n();
        return;
      }
      this.onCancel(n), t(i, o, (s) => {
        a = s;
      });
    }).then((i) => (r(), i)).catch((i) => {
      throw r(), i;
    });
  }
  removeParentCancelHandler() {
    const t = this._parent;
    t != null && this.parentCancelHandler != null && (t.removeListener("cancel", this.parentCancelHandler), this.parentCancelHandler = null);
  }
  dispose() {
    try {
      this.removeParentCancelHandler();
    } finally {
      this.removeAllListeners(), this._parent = null;
    }
  }
}
mt.CancellationToken = mp;
class ro extends Error {
  constructor() {
    super("cancelled");
  }
}
mt.CancellationError = ro;
var ar = {};
Object.defineProperty(ar, "__esModule", { value: !0 });
ar.newError = gp;
function gp(e, t) {
  const r = new Error(e);
  return r.code = t, r;
}
var Te = {}, no = { exports: {} }, pn = { exports: {} }, $i, Ua;
function yp() {
  if (Ua) return $i;
  Ua = 1;
  var e = 1e3, t = e * 60, r = t * 60, n = r * 24, i = n * 7, o = n * 365.25;
  $i = function(f, u) {
    u = u || {};
    var p = typeof f;
    if (p === "string" && f.length > 0)
      return a(f);
    if (p === "number" && isFinite(f))
      return u.long ? l(f) : s(f);
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(f)
    );
  };
  function a(f) {
    if (f = String(f), !(f.length > 100)) {
      var u = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        f
      );
      if (u) {
        var p = parseFloat(u[1]), g = (u[2] || "ms").toLowerCase();
        switch (g) {
          case "years":
          case "year":
          case "yrs":
          case "yr":
          case "y":
            return p * o;
          case "weeks":
          case "week":
          case "w":
            return p * i;
          case "days":
          case "day":
          case "d":
            return p * n;
          case "hours":
          case "hour":
          case "hrs":
          case "hr":
          case "h":
            return p * r;
          case "minutes":
          case "minute":
          case "mins":
          case "min":
          case "m":
            return p * t;
          case "seconds":
          case "second":
          case "secs":
          case "sec":
          case "s":
            return p * e;
          case "milliseconds":
          case "millisecond":
          case "msecs":
          case "msec":
          case "ms":
            return p;
          default:
            return;
        }
      }
    }
  }
  function s(f) {
    var u = Math.abs(f);
    return u >= n ? Math.round(f / n) + "d" : u >= r ? Math.round(f / r) + "h" : u >= t ? Math.round(f / t) + "m" : u >= e ? Math.round(f / e) + "s" : f + "ms";
  }
  function l(f) {
    var u = Math.abs(f);
    return u >= n ? d(f, u, n, "day") : u >= r ? d(f, u, r, "hour") : u >= t ? d(f, u, t, "minute") : u >= e ? d(f, u, e, "second") : f + " ms";
  }
  function d(f, u, p, g) {
    var E = u >= p * 1.5;
    return Math.round(f / p) + " " + g + (E ? "s" : "");
  }
  return $i;
}
var Oi, ka;
function cc() {
  if (ka) return Oi;
  ka = 1;
  function e(t) {
    n.debug = n, n.default = n, n.coerce = d, n.disable = a, n.enable = o, n.enabled = s, n.humanize = yp(), n.destroy = f, Object.keys(t).forEach((u) => {
      n[u] = t[u];
    }), n.names = [], n.skips = [], n.formatters = {};
    function r(u) {
      let p = 0;
      for (let g = 0; g < u.length; g++)
        p = (p << 5) - p + u.charCodeAt(g), p |= 0;
      return n.colors[Math.abs(p) % n.colors.length];
    }
    n.selectColor = r;
    function n(u) {
      let p, g = null, E, S;
      function _(...T) {
        if (!_.enabled)
          return;
        const A = _, N = Number(/* @__PURE__ */ new Date()), L = N - (p || N);
        A.diff = L, A.prev = p, A.curr = N, p = N, T[0] = n.coerce(T[0]), typeof T[0] != "string" && T.unshift("%O");
        let Z = 0;
        T[0] = T[0].replace(/%([a-zA-Z%])/g, (V, Ne) => {
          if (V === "%%")
            return "%";
          Z++;
          const y = n.formatters[Ne];
          if (typeof y == "function") {
            const q = T[Z];
            V = y.call(A, q), T.splice(Z, 1), Z--;
          }
          return V;
        }), n.formatArgs.call(A, T), (A.log || n.log).apply(A, T);
      }
      return _.namespace = u, _.useColors = n.useColors(), _.color = n.selectColor(u), _.extend = i, _.destroy = n.destroy, Object.defineProperty(_, "enabled", {
        enumerable: !0,
        configurable: !1,
        get: () => g !== null ? g : (E !== n.namespaces && (E = n.namespaces, S = n.enabled(u)), S),
        set: (T) => {
          g = T;
        }
      }), typeof n.init == "function" && n.init(_), _;
    }
    function i(u, p) {
      const g = n(this.namespace + (typeof p > "u" ? ":" : p) + u);
      return g.log = this.log, g;
    }
    function o(u) {
      n.save(u), n.namespaces = u, n.names = [], n.skips = [];
      let p;
      const g = (typeof u == "string" ? u : "").split(/[\s,]+/), E = g.length;
      for (p = 0; p < E; p++)
        g[p] && (u = g[p].replace(/\*/g, ".*?"), u[0] === "-" ? n.skips.push(new RegExp("^" + u.slice(1) + "$")) : n.names.push(new RegExp("^" + u + "$")));
    }
    function a() {
      const u = [
        ...n.names.map(l),
        ...n.skips.map(l).map((p) => "-" + p)
      ].join(",");
      return n.enable(""), u;
    }
    function s(u) {
      if (u[u.length - 1] === "*")
        return !0;
      let p, g;
      for (p = 0, g = n.skips.length; p < g; p++)
        if (n.skips[p].test(u))
          return !1;
      for (p = 0, g = n.names.length; p < g; p++)
        if (n.names[p].test(u))
          return !0;
      return !1;
    }
    function l(u) {
      return u.toString().substring(2, u.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function d(u) {
      return u instanceof Error ? u.stack || u.message : u;
    }
    function f() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    return n.enable(n.load()), n;
  }
  return Oi = e, Oi;
}
var Ma;
function Ep() {
  return Ma || (Ma = 1, function(e, t) {
    t.formatArgs = n, t.save = i, t.load = o, t.useColors = r, t.storage = a(), t.destroy = /* @__PURE__ */ (() => {
      let l = !1;
      return () => {
        l || (l = !0, console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."));
      };
    })(), t.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function r() {
      if (typeof window < "u" && window.process && (window.process.type === "renderer" || window.process.__nwjs))
        return !0;
      if (typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/))
        return !1;
      let l;
      return typeof document < "u" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window < "u" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator < "u" && navigator.userAgent && (l = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(l[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator < "u" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function n(l) {
      if (l[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + l[0] + (this.useColors ? "%c " : " ") + "+" + e.exports.humanize(this.diff), !this.useColors)
        return;
      const d = "color: " + this.color;
      l.splice(1, 0, d, "color: inherit");
      let f = 0, u = 0;
      l[0].replace(/%[a-zA-Z%]/g, (p) => {
        p !== "%%" && (f++, p === "%c" && (u = f));
      }), l.splice(u, 0, d);
    }
    t.log = console.debug || console.log || (() => {
    });
    function i(l) {
      try {
        l ? t.storage.setItem("debug", l) : t.storage.removeItem("debug");
      } catch {
      }
    }
    function o() {
      let l;
      try {
        l = t.storage.getItem("debug");
      } catch {
      }
      return !l && typeof process < "u" && "env" in process && (l = process.env.DEBUG), l;
    }
    function a() {
      try {
        return localStorage;
      } catch {
      }
    }
    e.exports = cc()(t);
    const { formatters: s } = e.exports;
    s.j = function(l) {
      try {
        return JSON.stringify(l);
      } catch (d) {
        return "[UnexpectedJSONParseError]: " + d.message;
      }
    };
  }(pn, pn.exports)), pn.exports;
}
var mn = { exports: {} }, Ii, Ba;
function vp() {
  return Ba || (Ba = 1, Ii = (e, t = process.argv) => {
    const r = e.startsWith("-") ? "" : e.length === 1 ? "-" : "--", n = t.indexOf(r + e), i = t.indexOf("--");
    return n !== -1 && (i === -1 || n < i);
  }), Ii;
}
var Pi, ja;
function wp() {
  if (ja) return Pi;
  ja = 1;
  const e = Vn, t = El, r = vp(), { env: n } = process;
  let i;
  r("no-color") || r("no-colors") || r("color=false") || r("color=never") ? i = 0 : (r("color") || r("colors") || r("color=true") || r("color=always")) && (i = 1), "FORCE_COLOR" in n && (n.FORCE_COLOR === "true" ? i = 1 : n.FORCE_COLOR === "false" ? i = 0 : i = n.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(n.FORCE_COLOR, 10), 3));
  function o(l) {
    return l === 0 ? !1 : {
      level: l,
      hasBasic: !0,
      has256: l >= 2,
      has16m: l >= 3
    };
  }
  function a(l, d) {
    if (i === 0)
      return 0;
    if (r("color=16m") || r("color=full") || r("color=truecolor"))
      return 3;
    if (r("color=256"))
      return 2;
    if (l && !d && i === void 0)
      return 0;
    const f = i || 0;
    if (n.TERM === "dumb")
      return f;
    if (process.platform === "win32") {
      const u = e.release().split(".");
      return Number(u[0]) >= 10 && Number(u[2]) >= 10586 ? Number(u[2]) >= 14931 ? 3 : 2 : 1;
    }
    if ("CI" in n)
      return ["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI", "GITHUB_ACTIONS", "BUILDKITE"].some((u) => u in n) || n.CI_NAME === "codeship" ? 1 : f;
    if ("TEAMCITY_VERSION" in n)
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(n.TEAMCITY_VERSION) ? 1 : 0;
    if (n.COLORTERM === "truecolor")
      return 3;
    if ("TERM_PROGRAM" in n) {
      const u = parseInt((n.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (n.TERM_PROGRAM) {
        case "iTerm.app":
          return u >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    return /-256(color)?$/i.test(n.TERM) ? 2 : /^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(n.TERM) || "COLORTERM" in n ? 1 : f;
  }
  function s(l) {
    const d = a(l, l && l.isTTY);
    return o(d);
  }
  return Pi = {
    supportsColor: s,
    stdout: o(a(!0, t.isatty(1))),
    stderr: o(a(!0, t.isatty(2)))
  }, Pi;
}
var Ha;
function _p() {
  return Ha || (Ha = 1, function(e, t) {
    const r = El, n = Eo;
    t.init = f, t.log = s, t.formatArgs = o, t.save = l, t.load = d, t.useColors = i, t.destroy = n.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    ), t.colors = [6, 2, 3, 4, 5, 1];
    try {
      const p = wp();
      p && (p.stderr || p).level >= 2 && (t.colors = [
        20,
        21,
        26,
        27,
        32,
        33,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        56,
        57,
        62,
        63,
        68,
        69,
        74,
        75,
        76,
        77,
        78,
        79,
        80,
        81,
        92,
        93,
        98,
        99,
        112,
        113,
        128,
        129,
        134,
        135,
        148,
        149,
        160,
        161,
        162,
        163,
        164,
        165,
        166,
        167,
        168,
        169,
        170,
        171,
        172,
        173,
        178,
        179,
        184,
        185,
        196,
        197,
        198,
        199,
        200,
        201,
        202,
        203,
        204,
        205,
        206,
        207,
        208,
        209,
        214,
        215,
        220,
        221
      ]);
    } catch {
    }
    t.inspectOpts = Object.keys(process.env).filter((p) => /^debug_/i.test(p)).reduce((p, g) => {
      const E = g.substring(6).toLowerCase().replace(/_([a-z])/g, (_, T) => T.toUpperCase());
      let S = process.env[g];
      return /^(yes|on|true|enabled)$/i.test(S) ? S = !0 : /^(no|off|false|disabled)$/i.test(S) ? S = !1 : S === "null" ? S = null : S = Number(S), p[E] = S, p;
    }, {});
    function i() {
      return "colors" in t.inspectOpts ? !!t.inspectOpts.colors : r.isatty(process.stderr.fd);
    }
    function o(p) {
      const { namespace: g, useColors: E } = this;
      if (E) {
        const S = this.color, _ = "\x1B[3" + (S < 8 ? S : "8;5;" + S), T = `  ${_};1m${g} \x1B[0m`;
        p[0] = T + p[0].split(`
`).join(`
` + T), p.push(_ + "m+" + e.exports.humanize(this.diff) + "\x1B[0m");
      } else
        p[0] = a() + g + " " + p[0];
    }
    function a() {
      return t.inspectOpts.hideDate ? "" : (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function s(...p) {
      return process.stderr.write(n.formatWithOptions(t.inspectOpts, ...p) + `
`);
    }
    function l(p) {
      p ? process.env.DEBUG = p : delete process.env.DEBUG;
    }
    function d() {
      return process.env.DEBUG;
    }
    function f(p) {
      p.inspectOpts = {};
      const g = Object.keys(t.inspectOpts);
      for (let E = 0; E < g.length; E++)
        p.inspectOpts[g[E]] = t.inspectOpts[g[E]];
    }
    e.exports = cc()(t);
    const { formatters: u } = e.exports;
    u.o = function(p) {
      return this.inspectOpts.colors = this.useColors, n.inspect(p, this.inspectOpts).split(`
`).map((g) => g.trim()).join(" ");
    }, u.O = function(p) {
      return this.inspectOpts.colors = this.useColors, n.inspect(p, this.inspectOpts);
    };
  }(mn, mn.exports)), mn.exports;
}
typeof process > "u" || process.type === "renderer" || process.browser === !0 || process.__nwjs ? no.exports = Ep() : no.exports = _p();
var Sp = no.exports, Gr = {};
Object.defineProperty(Gr, "__esModule", { value: !0 });
Gr.ProgressCallbackTransform = void 0;
const Ap = jr;
class Tp extends Ap.Transform {
  constructor(t, r, n) {
    super(), this.total = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.total && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.total * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.total,
      delta: this.delta,
      transferred: this.total,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, t(null);
  }
}
Gr.ProgressCallbackTransform = Tp;
Object.defineProperty(Te, "__esModule", { value: !0 });
Te.DigestTransform = Te.HttpExecutor = Te.HttpError = void 0;
Te.createHttpError = io;
Te.parseJson = Np;
Te.configureRequestOptionsFromUrl = fc;
Te.configureRequestUrl = Io;
Te.safeGetHeader = Zt;
Te.configureRequestOptions = Ln;
Te.safeStringifyJson = Un;
const Cp = Hr, bp = Sp, $p = tt, Op = jr, uc = ir, Ip = mt, qa = ar, Pp = Gr, pr = (0, bp.default)("electron-builder");
function io(e, t = null) {
  return new Oo(e.statusCode || -1, `${e.statusCode} ${e.statusMessage}` + (t == null ? "" : `
` + JSON.stringify(t, null, "  ")) + `
Headers: ` + Un(e.headers), t);
}
const Rp = /* @__PURE__ */ new Map([
  [429, "Too many requests"],
  [400, "Bad request"],
  [403, "Forbidden"],
  [404, "Not found"],
  [405, "Method not allowed"],
  [406, "Not acceptable"],
  [408, "Request timeout"],
  [413, "Request entity too large"],
  [500, "Internal server error"],
  [502, "Bad gateway"],
  [503, "Service unavailable"],
  [504, "Gateway timeout"],
  [505, "HTTP version not supported"]
]);
class Oo extends Error {
  constructor(t, r = `HTTP error: ${Rp.get(t) || t}`, n = null) {
    super(r), this.statusCode = t, this.description = n, this.name = "HttpError", this.code = `HTTP_ERROR_${t}`;
  }
  isServerError() {
    return this.statusCode >= 500 && this.statusCode <= 599;
  }
}
Te.HttpError = Oo;
function Np(e) {
  return e.then((t) => t == null || t.length === 0 ? null : JSON.parse(t));
}
class xn {
  constructor() {
    this.maxRedirects = 10;
  }
  request(t, r = new Ip.CancellationToken(), n) {
    Ln(t);
    const i = n == null ? void 0 : JSON.stringify(n), o = i ? Buffer.from(i) : void 0;
    if (o != null) {
      pr(i);
      const { headers: a, ...s } = t;
      t = {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": o.length,
          ...a
        },
        ...s
      };
    }
    return this.doApiRequest(t, r, (a) => a.end(o));
  }
  doApiRequest(t, r, n, i = 0) {
    return pr.enabled && pr(`Request: ${Un(t)}`), r.createPromise((o, a, s) => {
      const l = this.createRequest(t, (d) => {
        try {
          this.handleResponse(d, t, r, o, a, i, n);
        } catch (f) {
          a(f);
        }
      });
      this.addErrorAndTimeoutHandlers(l, a, t.timeout), this.addRedirectHandlers(l, t, a, i, (d) => {
        this.doApiRequest(d, r, n, i).then(o).catch(a);
      }), n(l, a), s(() => l.abort());
    });
  }
  // noinspection JSUnusedLocalSymbols
  // eslint-disable-next-line
  addRedirectHandlers(t, r, n, i, o) {
  }
  addErrorAndTimeoutHandlers(t, r, n = 60 * 1e3) {
    this.addTimeOutHandler(t, r, n), t.on("error", r), t.on("aborted", () => {
      r(new Error("Request has been aborted by the server"));
    });
  }
  handleResponse(t, r, n, i, o, a, s) {
    var l;
    if (pr.enabled && pr(`Response: ${t.statusCode} ${t.statusMessage}, request options: ${Un(r)}`), t.statusCode === 404) {
      o(io(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

Please double check that your authentication token is correct. Due to security reasons, actual status maybe not reported, but 404.
`));
      return;
    } else if (t.statusCode === 204) {
      i();
      return;
    }
    const d = (l = t.statusCode) !== null && l !== void 0 ? l : 0, f = d >= 300 && d < 400, u = Zt(t, "location");
    if (f && u != null) {
      if (a > this.maxRedirects) {
        o(this.createMaxRedirectError());
        return;
      }
      this.doApiRequest(xn.prepareRedirectUrlOptions(u, r), n, s, a).then(i).catch(o);
      return;
    }
    t.setEncoding("utf8");
    let p = "";
    t.on("error", o), t.on("data", (g) => p += g), t.on("end", () => {
      try {
        if (t.statusCode != null && t.statusCode >= 400) {
          const g = Zt(t, "content-type"), E = g != null && (Array.isArray(g) ? g.find((S) => S.includes("json")) != null : g.includes("json"));
          o(io(t, `method: ${r.method || "GET"} url: ${r.protocol || "https:"}//${r.hostname}${r.port ? `:${r.port}` : ""}${r.path}

          Data:
          ${E ? JSON.stringify(JSON.parse(p)) : p}
          `));
        } else
          i(p.length === 0 ? null : p);
      } catch (g) {
        o(g);
      }
    });
  }
  async downloadToBuffer(t, r) {
    return await r.cancellationToken.createPromise((n, i, o) => {
      const a = [], s = {
        headers: r.headers || void 0,
        // because PrivateGitHubProvider requires HttpExecutor.prepareRedirectUrlOptions logic, so, we need to redirect manually
        redirect: "manual"
      };
      Io(t, s), Ln(s), this.doDownload(s, {
        destination: null,
        options: r,
        onCancel: o,
        callback: (l) => {
          l == null ? n(Buffer.concat(a)) : i(l);
        },
        responseHandler: (l, d) => {
          let f = 0;
          l.on("data", (u) => {
            if (f += u.length, f > 524288e3) {
              d(new Error("Maximum allowed size is 500 MB"));
              return;
            }
            a.push(u);
          }), l.on("end", () => {
            d(null);
          });
        }
      }, 0);
    });
  }
  doDownload(t, r, n) {
    const i = this.createRequest(t, (o) => {
      if (o.statusCode >= 400) {
        r.callback(new Error(`Cannot download "${t.protocol || "https:"}//${t.hostname}${t.path}", status ${o.statusCode}: ${o.statusMessage}`));
        return;
      }
      o.on("error", r.callback);
      const a = Zt(o, "location");
      if (a != null) {
        n < this.maxRedirects ? this.doDownload(xn.prepareRedirectUrlOptions(a, t), r, n++) : r.callback(this.createMaxRedirectError());
        return;
      }
      r.responseHandler == null ? Fp(r, o) : r.responseHandler(o, r.callback);
    });
    this.addErrorAndTimeoutHandlers(i, r.callback, t.timeout), this.addRedirectHandlers(i, t, r.callback, n, (o) => {
      this.doDownload(o, r, n++);
    }), i.end();
  }
  createMaxRedirectError() {
    return new Error(`Too many redirects (> ${this.maxRedirects})`);
  }
  addTimeOutHandler(t, r, n) {
    t.on("socket", (i) => {
      i.setTimeout(n, () => {
        t.abort(), r(new Error("Request timed out"));
      });
    });
  }
  static prepareRedirectUrlOptions(t, r) {
    const n = fc(t, { ...r }), i = n.headers;
    if (i != null && i.authorization) {
      const o = new uc.URL(t);
      (o.hostname.endsWith(".amazonaws.com") || o.searchParams.has("X-Amz-Credential")) && delete i.authorization;
    }
    return n;
  }
  static retryOnServerError(t, r = 3) {
    for (let n = 0; ; n++)
      try {
        return t();
      } catch (i) {
        if (n < r && (i instanceof Oo && i.isServerError() || i.code === "EPIPE"))
          continue;
        throw i;
      }
  }
}
Te.HttpExecutor = xn;
function fc(e, t) {
  const r = Ln(t);
  return Io(new uc.URL(e), r), r;
}
function Io(e, t) {
  t.protocol = e.protocol, t.hostname = e.hostname, e.port ? t.port = e.port : t.port && delete t.port, t.path = e.pathname + e.search;
}
class oo extends Op.Transform {
  // noinspection JSUnusedGlobalSymbols
  get actual() {
    return this._actual;
  }
  constructor(t, r = "sha512", n = "base64") {
    super(), this.expected = t, this.algorithm = r, this.encoding = n, this._actual = null, this.isValidateOnEnd = !0, this.digester = (0, Cp.createHash)(r);
  }
  // noinspection JSUnusedGlobalSymbols
  _transform(t, r, n) {
    this.digester.update(t), n(null, t);
  }
  // noinspection JSUnusedGlobalSymbols
  _flush(t) {
    if (this._actual = this.digester.digest(this.encoding), this.isValidateOnEnd)
      try {
        this.validate();
      } catch (r) {
        t(r);
        return;
      }
    t(null);
  }
  validate() {
    if (this._actual == null)
      throw (0, qa.newError)("Not finished yet", "ERR_STREAM_NOT_FINISHED");
    if (this._actual !== this.expected)
      throw (0, qa.newError)(`${this.algorithm} checksum mismatch, expected ${this.expected}, got ${this._actual}`, "ERR_CHECKSUM_MISMATCH");
    return null;
  }
}
Te.DigestTransform = oo;
function Dp(e, t, r) {
  return e != null && t != null && e !== t ? (r(new Error(`checksum mismatch: expected ${t} but got ${e} (X-Checksum-Sha2 header)`)), !1) : !0;
}
function Zt(e, t) {
  const r = e.headers[t];
  return r == null ? null : Array.isArray(r) ? r.length === 0 ? null : r[r.length - 1] : r;
}
function Fp(e, t) {
  if (!Dp(Zt(t, "X-Checksum-Sha2"), e.options.sha2, e.callback))
    return;
  const r = [];
  if (e.options.onProgress != null) {
    const a = Zt(t, "content-length");
    a != null && r.push(new Pp.ProgressCallbackTransform(parseInt(a, 10), e.options.cancellationToken, e.options.onProgress));
  }
  const n = e.options.sha512;
  n != null ? r.push(new oo(n, "sha512", n.length === 128 && !n.includes("+") && !n.includes("Z") && !n.includes("=") ? "hex" : "base64")) : e.options.sha2 != null && r.push(new oo(e.options.sha2, "sha256", "hex"));
  const i = (0, $p.createWriteStream)(e.destination);
  r.push(i);
  let o = t;
  for (const a of r)
    a.on("error", (s) => {
      i.close(), e.options.cancellationToken.cancelled || e.callback(s);
    }), o = o.pipe(a);
  i.on("finish", () => {
    i.close(e.callback);
  });
}
function Ln(e, t, r) {
  r != null && (e.method = r), e.headers = { ...e.headers };
  const n = e.headers;
  return t != null && (n.authorization = t.startsWith("Basic") || t.startsWith("Bearer") ? t : `token ${t}`), n["User-Agent"] == null && (n["User-Agent"] = "electron-builder"), (r == null || r === "GET" || n["Cache-Control"] == null) && (n["Cache-Control"] = "no-cache"), e.protocol == null && process.versions.electron != null && (e.protocol = "https:"), e;
}
function Un(e, t) {
  return JSON.stringify(e, (r, n) => r.endsWith("Authorization") || r.endsWith("authorization") || r.endsWith("Password") || r.endsWith("PASSWORD") || r.endsWith("Token") || r.includes("password") || r.includes("token") || t != null && t.has(r) ? "<stripped sensitive data>" : n, 2);
}
var Jn = {};
Object.defineProperty(Jn, "__esModule", { value: !0 });
Jn.MemoLazy = void 0;
class xp {
  constructor(t, r) {
    this.selector = t, this.creator = r, this.selected = void 0, this._value = void 0;
  }
  get hasValue() {
    return this._value !== void 0;
  }
  get value() {
    const t = this.selector();
    if (this._value !== void 0 && dc(this.selected, t))
      return this._value;
    this.selected = t;
    const r = this.creator(t);
    return this.value = r, r;
  }
  set value(t) {
    this._value = t;
  }
}
Jn.MemoLazy = xp;
function dc(e, t) {
  if (typeof e == "object" && e !== null && (typeof t == "object" && t !== null)) {
    const i = Object.keys(e), o = Object.keys(t);
    return i.length === o.length && i.every((a) => dc(e[a], t[a]));
  }
  return e === t;
}
var Qn = {};
Object.defineProperty(Qn, "__esModule", { value: !0 });
Qn.githubUrl = Lp;
Qn.getS3LikeProviderBaseUrl = Up;
function Lp(e, t = "github.com") {
  return `${e.protocol || "https"}://${e.host || t}`;
}
function Up(e) {
  const t = e.provider;
  if (t === "s3")
    return kp(e);
  if (t === "spaces")
    return Mp(e);
  throw new Error(`Not supported provider: ${t}`);
}
function kp(e) {
  let t;
  if (e.accelerate == !0)
    t = `https://${e.bucket}.s3-accelerate.amazonaws.com`;
  else if (e.endpoint != null)
    t = `${e.endpoint}/${e.bucket}`;
  else if (e.bucket.includes(".")) {
    if (e.region == null)
      throw new Error(`Bucket name "${e.bucket}" includes a dot, but S3 region is missing`);
    e.region === "us-east-1" ? t = `https://s3.amazonaws.com/${e.bucket}` : t = `https://s3-${e.region}.amazonaws.com/${e.bucket}`;
  } else e.region === "cn-north-1" ? t = `https://${e.bucket}.s3.${e.region}.amazonaws.com.cn` : t = `https://${e.bucket}.s3.amazonaws.com`;
  return hc(t, e.path);
}
function hc(e, t) {
  return t != null && t.length > 0 && (t.startsWith("/") || (e += "/"), e += t), e;
}
function Mp(e) {
  if (e.name == null)
    throw new Error("name is missing");
  if (e.region == null)
    throw new Error("region is missing");
  return hc(`https://${e.name}.${e.region}.digitaloceanspaces.com`, e.path);
}
var Po = {};
Object.defineProperty(Po, "__esModule", { value: !0 });
Po.retry = pc;
const Bp = mt;
async function pc(e, t, r, n = 0, i = 0, o) {
  var a;
  const s = new Bp.CancellationToken();
  try {
    return await e();
  } catch (l) {
    if ((!((a = o == null ? void 0 : o(l)) !== null && a !== void 0) || a) && t > 0 && !s.cancelled)
      return await new Promise((d) => setTimeout(d, r + n * i)), await pc(e, t - 1, r, n, i + 1, o);
    throw l;
  }
}
var Ro = {};
Object.defineProperty(Ro, "__esModule", { value: !0 });
Ro.parseDn = jp;
function jp(e) {
  let t = !1, r = null, n = "", i = 0;
  e = e.trim();
  const o = /* @__PURE__ */ new Map();
  for (let a = 0; a <= e.length; a++) {
    if (a === e.length) {
      r !== null && o.set(r, n);
      break;
    }
    const s = e[a];
    if (t) {
      if (s === '"') {
        t = !1;
        continue;
      }
    } else {
      if (s === '"') {
        t = !0;
        continue;
      }
      if (s === "\\") {
        a++;
        const l = parseInt(e.slice(a, a + 2), 16);
        Number.isNaN(l) ? n += e[a] : (a++, n += String.fromCharCode(l));
        continue;
      }
      if (r === null && s === "=") {
        r = n, n = "";
        continue;
      }
      if (s === "," || s === ";" || s === "+") {
        r !== null && o.set(r, n), r = null, n = "";
        continue;
      }
    }
    if (s === " " && !t) {
      if (n.length === 0)
        continue;
      if (a > i) {
        let l = a;
        for (; e[l] === " "; )
          l++;
        i = l;
      }
      if (i >= e.length || e[i] === "," || e[i] === ";" || r === null && e[i] === "=" || r !== null && e[i] === "+") {
        a = i - 1;
        continue;
      }
    }
    n += s;
  }
  return o;
}
var rr = {};
Object.defineProperty(rr, "__esModule", { value: !0 });
rr.nil = rr.UUID = void 0;
const mc = Hr, gc = ar, Hp = "options.name must be either a string or a Buffer", Ga = (0, mc.randomBytes)(16);
Ga[0] = Ga[0] | 1;
const In = {}, W = [];
for (let e = 0; e < 256; e++) {
  const t = (e + 256).toString(16).substr(1);
  In[t] = e, W[e] = t;
}
class Dt {
  constructor(t) {
    this.ascii = null, this.binary = null;
    const r = Dt.check(t);
    if (!r)
      throw new Error("not a UUID");
    this.version = r.version, r.format === "ascii" ? this.ascii = t : this.binary = t;
  }
  static v5(t, r) {
    return qp(t, "sha1", 80, r);
  }
  toString() {
    return this.ascii == null && (this.ascii = Gp(this.binary)), this.ascii;
  }
  inspect() {
    return `UUID v${this.version} ${this.toString()}`;
  }
  static check(t, r = 0) {
    if (typeof t == "string")
      return t = t.toLowerCase(), /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-([a-f0-9]{12})$/.test(t) ? t === "00000000-0000-0000-0000-000000000000" ? { version: void 0, variant: "nil", format: "ascii" } : {
        version: (In[t[14] + t[15]] & 240) >> 4,
        variant: Wa((In[t[19] + t[20]] & 224) >> 5),
        format: "ascii"
      } : !1;
    if (Buffer.isBuffer(t)) {
      if (t.length < r + 16)
        return !1;
      let n = 0;
      for (; n < 16 && t[r + n] === 0; n++)
        ;
      return n === 16 ? { version: void 0, variant: "nil", format: "binary" } : {
        version: (t[r + 6] & 240) >> 4,
        variant: Wa((t[r + 8] & 224) >> 5),
        format: "binary"
      };
    }
    throw (0, gc.newError)("Unknown type of uuid", "ERR_UNKNOWN_UUID_TYPE");
  }
  // read stringified uuid into a Buffer
  static parse(t) {
    const r = Buffer.allocUnsafe(16);
    let n = 0;
    for (let i = 0; i < 16; i++)
      r[i] = In[t[n++] + t[n++]], (i === 3 || i === 5 || i === 7 || i === 9) && (n += 1);
    return r;
  }
}
rr.UUID = Dt;
Dt.OID = Dt.parse("6ba7b812-9dad-11d1-80b4-00c04fd430c8");
function Wa(e) {
  switch (e) {
    case 0:
    case 1:
    case 3:
      return "ncs";
    case 4:
    case 5:
      return "rfc4122";
    case 6:
      return "microsoft";
    default:
      return "future";
  }
}
var Ar;
(function(e) {
  e[e.ASCII = 0] = "ASCII", e[e.BINARY = 1] = "BINARY", e[e.OBJECT = 2] = "OBJECT";
})(Ar || (Ar = {}));
function qp(e, t, r, n, i = Ar.ASCII) {
  const o = (0, mc.createHash)(t);
  if (typeof e != "string" && !Buffer.isBuffer(e))
    throw (0, gc.newError)(Hp, "ERR_INVALID_UUID_NAME");
  o.update(n), o.update(e);
  const s = o.digest();
  let l;
  switch (i) {
    case Ar.BINARY:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = s;
      break;
    case Ar.OBJECT:
      s[6] = s[6] & 15 | r, s[8] = s[8] & 63 | 128, l = new Dt(s);
      break;
    default:
      l = W[s[0]] + W[s[1]] + W[s[2]] + W[s[3]] + "-" + W[s[4]] + W[s[5]] + "-" + W[s[6] & 15 | r] + W[s[7]] + "-" + W[s[8] & 63 | 128] + W[s[9]] + "-" + W[s[10]] + W[s[11]] + W[s[12]] + W[s[13]] + W[s[14]] + W[s[15]];
      break;
  }
  return l;
}
function Gp(e) {
  return W[e[0]] + W[e[1]] + W[e[2]] + W[e[3]] + "-" + W[e[4]] + W[e[5]] + "-" + W[e[6]] + W[e[7]] + "-" + W[e[8]] + W[e[9]] + "-" + W[e[10]] + W[e[11]] + W[e[12]] + W[e[13]] + W[e[14]] + W[e[15]];
}
rr.nil = new Dt("00000000-0000-0000-0000-000000000000");
var Wr = {}, yc = {};
(function(e) {
  (function(t) {
    t.parser = function(h, c) {
      return new n(h, c);
    }, t.SAXParser = n, t.SAXStream = f, t.createStream = d, t.MAX_BUFFER_LENGTH = 64 * 1024;
    var r = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    t.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function n(h, c) {
      if (!(this instanceof n))
        return new n(h, c);
      var C = this;
      o(C), C.q = C.c = "", C.bufferCheckPosition = t.MAX_BUFFER_LENGTH, C.opt = c || {}, C.opt.lowercase = C.opt.lowercase || C.opt.lowercasetags, C.looseCase = C.opt.lowercase ? "toLowerCase" : "toUpperCase", C.tags = [], C.closed = C.closedRoot = C.sawRoot = !1, C.tag = C.error = null, C.strict = !!h, C.noscript = !!(h || C.opt.noscript), C.state = y.BEGIN, C.strictEntities = C.opt.strictEntities, C.ENTITIES = C.strictEntities ? Object.create(t.XML_ENTITIES) : Object.create(t.ENTITIES), C.attribList = [], C.opt.xmlns && (C.ns = Object.create(S)), C.opt.unquotedAttributeValues === void 0 && (C.opt.unquotedAttributeValues = !h), C.trackPosition = C.opt.position !== !1, C.trackPosition && (C.position = C.line = C.column = 0), B(C, "onready");
    }
    Object.create || (Object.create = function(h) {
      function c() {
      }
      c.prototype = h;
      var C = new c();
      return C;
    }), Object.keys || (Object.keys = function(h) {
      var c = [];
      for (var C in h) h.hasOwnProperty(C) && c.push(C);
      return c;
    });
    function i(h) {
      for (var c = Math.max(t.MAX_BUFFER_LENGTH, 10), C = 0, w = 0, Y = r.length; w < Y; w++) {
        var te = h[r[w]].length;
        if (te > c)
          switch (r[w]) {
            case "textNode":
              X(h);
              break;
            case "cdata":
              M(h, "oncdata", h.cdata), h.cdata = "";
              break;
            case "script":
              M(h, "onscript", h.script), h.script = "";
              break;
            default:
              $(h, "Max buffer length exceeded: " + r[w]);
          }
        C = Math.max(C, te);
      }
      var ie = t.MAX_BUFFER_LENGTH - C;
      h.bufferCheckPosition = ie + h.position;
    }
    function o(h) {
      for (var c = 0, C = r.length; c < C; c++)
        h[r[c]] = "";
    }
    function a(h) {
      X(h), h.cdata !== "" && (M(h, "oncdata", h.cdata), h.cdata = ""), h.script !== "" && (M(h, "onscript", h.script), h.script = "");
    }
    n.prototype = {
      end: function() {
        R(this);
      },
      write: We,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        a(this);
      }
    };
    var s;
    try {
      s = require("stream").Stream;
    } catch {
      s = function() {
      };
    }
    s || (s = function() {
    });
    var l = t.EVENTS.filter(function(h) {
      return h !== "error" && h !== "end";
    });
    function d(h, c) {
      return new f(h, c);
    }
    function f(h, c) {
      if (!(this instanceof f))
        return new f(h, c);
      s.apply(this), this._parser = new n(h, c), this.writable = !0, this.readable = !0;
      var C = this;
      this._parser.onend = function() {
        C.emit("end");
      }, this._parser.onerror = function(w) {
        C.emit("error", w), C._parser.error = null;
      }, this._decoder = null, l.forEach(function(w) {
        Object.defineProperty(C, "on" + w, {
          get: function() {
            return C._parser["on" + w];
          },
          set: function(Y) {
            if (!Y)
              return C.removeAllListeners(w), C._parser["on" + w] = Y, Y;
            C.on(w, Y);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    f.prototype = Object.create(s.prototype, {
      constructor: {
        value: f
      }
    }), f.prototype.write = function(h) {
      if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(h)) {
        if (!this._decoder) {
          var c = xf.StringDecoder;
          this._decoder = new c("utf8");
        }
        h = this._decoder.write(h);
      }
      return this._parser.write(h.toString()), this.emit("data", h), !0;
    }, f.prototype.end = function(h) {
      return h && h.length && this.write(h), this._parser.end(), !0;
    }, f.prototype.on = function(h, c) {
      var C = this;
      return !C._parser["on" + h] && l.indexOf(h) !== -1 && (C._parser["on" + h] = function() {
        var w = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        w.splice(0, 0, h), C.emit.apply(C, w);
      }), s.prototype.on.call(C, h, c);
    };
    var u = "[CDATA[", p = "DOCTYPE", g = "http://www.w3.org/XML/1998/namespace", E = "http://www.w3.org/2000/xmlns/", S = { xml: g, xmlns: E }, _ = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, T = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, A = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function L(h) {
      return h === " " || h === `
` || h === "\r" || h === "	";
    }
    function Z(h) {
      return h === '"' || h === "'";
    }
    function ae(h) {
      return h === ">" || L(h);
    }
    function V(h, c) {
      return h.test(c);
    }
    function Ne(h, c) {
      return !V(h, c);
    }
    var y = 0;
    t.STATE = {
      BEGIN: y++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: y++,
      // leading whitespace
      TEXT: y++,
      // general stuff
      TEXT_ENTITY: y++,
      // &amp and such.
      OPEN_WAKA: y++,
      // <
      SGML_DECL: y++,
      // <!BLARG
      SGML_DECL_QUOTED: y++,
      // <!BLARG foo "bar
      DOCTYPE: y++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: y++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: y++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: y++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: y++,
      // <!-
      COMMENT: y++,
      // <!--
      COMMENT_ENDING: y++,
      // <!-- blah -
      COMMENT_ENDED: y++,
      // <!-- blah --
      CDATA: y++,
      // <![CDATA[ something
      CDATA_ENDING: y++,
      // ]
      CDATA_ENDING_2: y++,
      // ]]
      PROC_INST: y++,
      // <?hi
      PROC_INST_BODY: y++,
      // <?hi there
      PROC_INST_ENDING: y++,
      // <?hi "there" ?
      OPEN_TAG: y++,
      // <strong
      OPEN_TAG_SLASH: y++,
      // <strong /
      ATTRIB: y++,
      // <a
      ATTRIB_NAME: y++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: y++,
      // <a foo _
      ATTRIB_VALUE: y++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: y++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: y++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: y++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: y++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: y++,
      // <foo bar=&quot
      CLOSE_TAG: y++,
      // </a
      CLOSE_TAG_SAW_WHITE: y++,
      // </a   >
      SCRIPT: y++,
      // <script> ...
      SCRIPT_ENDING: y++
      // <script> ... <
    }, t.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    }, t.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    }, Object.keys(t.ENTITIES).forEach(function(h) {
      var c = t.ENTITIES[h], C = typeof c == "number" ? String.fromCharCode(c) : c;
      t.ENTITIES[h] = C;
    });
    for (var q in t.STATE)
      t.STATE[t.STATE[q]] = q;
    y = t.STATE;
    function B(h, c, C) {
      h[c] && h[c](C);
    }
    function M(h, c, C) {
      h.textNode && X(h), B(h, c, C);
    }
    function X(h) {
      h.textNode = I(h.opt, h.textNode), h.textNode && B(h, "ontext", h.textNode), h.textNode = "";
    }
    function I(h, c) {
      return h.trim && (c = c.trim()), h.normalize && (c = c.replace(/\s+/g, " ")), c;
    }
    function $(h, c) {
      return X(h), h.trackPosition && (c += `
Line: ` + h.line + `
Column: ` + h.column + `
Char: ` + h.c), c = new Error(c), h.error = c, B(h, "onerror", c), h;
    }
    function R(h) {
      return h.sawRoot && !h.closedRoot && b(h, "Unclosed root tag"), h.state !== y.BEGIN && h.state !== y.BEGIN_WHITESPACE && h.state !== y.TEXT && $(h, "Unexpected end"), X(h), h.c = "", h.closed = !0, B(h, "onend"), n.call(h, h.strict, h.opt), h;
    }
    function b(h, c) {
      if (typeof h != "object" || !(h instanceof n))
        throw new Error("bad call to strictFail");
      h.strict && $(h, c);
    }
    function D(h) {
      h.strict || (h.tagName = h.tagName[h.looseCase]());
      var c = h.tags[h.tags.length - 1] || h, C = h.tag = { name: h.tagName, attributes: {} };
      h.opt.xmlns && (C.ns = c.ns), h.attribList.length = 0, M(h, "onopentagstart", C);
    }
    function P(h, c) {
      var C = h.indexOf(":"), w = C < 0 ? ["", h] : h.split(":"), Y = w[0], te = w[1];
      return c && h === "xmlns" && (Y = "xmlns", te = ""), { prefix: Y, local: te };
    }
    function k(h) {
      if (h.strict || (h.attribName = h.attribName[h.looseCase]()), h.attribList.indexOf(h.attribName) !== -1 || h.tag.attributes.hasOwnProperty(h.attribName)) {
        h.attribName = h.attribValue = "";
        return;
      }
      if (h.opt.xmlns) {
        var c = P(h.attribName, !0), C = c.prefix, w = c.local;
        if (C === "xmlns")
          if (w === "xml" && h.attribValue !== g)
            b(
              h,
              "xml: prefix must be bound to " + g + `
Actual: ` + h.attribValue
            );
          else if (w === "xmlns" && h.attribValue !== E)
            b(
              h,
              "xmlns: prefix must be bound to " + E + `
Actual: ` + h.attribValue
            );
          else {
            var Y = h.tag, te = h.tags[h.tags.length - 1] || h;
            Y.ns === te.ns && (Y.ns = Object.create(te.ns)), Y.ns[w] = h.attribValue;
          }
        h.attribList.push([h.attribName, h.attribValue]);
      } else
        h.tag.attributes[h.attribName] = h.attribValue, M(h, "onattribute", {
          name: h.attribName,
          value: h.attribValue
        });
      h.attribName = h.attribValue = "";
    }
    function G(h, c) {
      if (h.opt.xmlns) {
        var C = h.tag, w = P(h.tagName);
        C.prefix = w.prefix, C.local = w.local, C.uri = C.ns[w.prefix] || "", C.prefix && !C.uri && (b(h, "Unbound namespace prefix: " + JSON.stringify(h.tagName)), C.uri = w.prefix);
        var Y = h.tags[h.tags.length - 1] || h;
        C.ns && Y.ns !== C.ns && Object.keys(C.ns).forEach(function(tn) {
          M(h, "onopennamespace", {
            prefix: tn,
            uri: C.ns[tn]
          });
        });
        for (var te = 0, ie = h.attribList.length; te < ie; te++) {
          var pe = h.attribList[te], Ee = pe[0], nt = pe[1], le = P(Ee, !0), Me = le.prefix, mi = le.local, en = Me === "" ? "" : C.ns[Me] || "", cr = {
            name: Ee,
            value: nt,
            prefix: Me,
            local: mi,
            uri: en
          };
          Me && Me !== "xmlns" && !en && (b(h, "Unbound namespace prefix: " + JSON.stringify(Me)), cr.uri = Me), h.tag.attributes[Ee] = cr, M(h, "onattribute", cr);
        }
        h.attribList.length = 0;
      }
      h.tag.isSelfClosing = !!c, h.sawRoot = !0, h.tags.push(h.tag), M(h, "onopentag", h.tag), c || (!h.noscript && h.tagName.toLowerCase() === "script" ? h.state = y.SCRIPT : h.state = y.TEXT, h.tag = null, h.tagName = ""), h.attribName = h.attribValue = "", h.attribList.length = 0;
    }
    function j(h) {
      if (!h.tagName) {
        b(h, "Weird empty close tag."), h.textNode += "</>", h.state = y.TEXT;
        return;
      }
      if (h.script) {
        if (h.tagName !== "script") {
          h.script += "</" + h.tagName + ">", h.tagName = "", h.state = y.SCRIPT;
          return;
        }
        M(h, "onscript", h.script), h.script = "";
      }
      var c = h.tags.length, C = h.tagName;
      h.strict || (C = C[h.looseCase]());
      for (var w = C; c--; ) {
        var Y = h.tags[c];
        if (Y.name !== w)
          b(h, "Unexpected close tag");
        else
          break;
      }
      if (c < 0) {
        b(h, "Unmatched closing tag: " + h.tagName), h.textNode += "</" + h.tagName + ">", h.state = y.TEXT;
        return;
      }
      h.tagName = C;
      for (var te = h.tags.length; te-- > c; ) {
        var ie = h.tag = h.tags.pop();
        h.tagName = h.tag.name, M(h, "onclosetag", h.tagName);
        var pe = {};
        for (var Ee in ie.ns)
          pe[Ee] = ie.ns[Ee];
        var nt = h.tags[h.tags.length - 1] || h;
        h.opt.xmlns && ie.ns !== nt.ns && Object.keys(ie.ns).forEach(function(le) {
          var Me = ie.ns[le];
          M(h, "onclosenamespace", { prefix: le, uri: Me });
        });
      }
      c === 0 && (h.closedRoot = !0), h.tagName = h.attribValue = h.attribName = "", h.attribList.length = 0, h.state = y.TEXT;
    }
    function K(h) {
      var c = h.entity, C = c.toLowerCase(), w, Y = "";
      return h.ENTITIES[c] ? h.ENTITIES[c] : h.ENTITIES[C] ? h.ENTITIES[C] : (c = C, c.charAt(0) === "#" && (c.charAt(1) === "x" ? (c = c.slice(2), w = parseInt(c, 16), Y = w.toString(16)) : (c = c.slice(1), w = parseInt(c, 10), Y = w.toString(10))), c = c.replace(/^0+/, ""), isNaN(w) || Y.toLowerCase() !== c ? (b(h, "Invalid character entity"), "&" + h.entity + ";") : String.fromCodePoint(w));
    }
    function ue(h, c) {
      c === "<" ? (h.state = y.OPEN_WAKA, h.startTagPosition = h.position) : L(c) || (b(h, "Non-whitespace before first tag."), h.textNode = c, h.state = y.TEXT);
    }
    function U(h, c) {
      var C = "";
      return c < h.length && (C = h.charAt(c)), C;
    }
    function We(h) {
      var c = this;
      if (this.error)
        throw this.error;
      if (c.closed)
        return $(
          c,
          "Cannot write after close. Assign an onready handler."
        );
      if (h === null)
        return R(c);
      typeof h == "object" && (h = h.toString());
      for (var C = 0, w = ""; w = U(h, C++), c.c = w, !!w; )
        switch (c.trackPosition && (c.position++, w === `
` ? (c.line++, c.column = 0) : c.column++), c.state) {
          case y.BEGIN:
            if (c.state = y.BEGIN_WHITESPACE, w === "\uFEFF")
              continue;
            ue(c, w);
            continue;
          case y.BEGIN_WHITESPACE:
            ue(c, w);
            continue;
          case y.TEXT:
            if (c.sawRoot && !c.closedRoot) {
              for (var Y = C - 1; w && w !== "<" && w !== "&"; )
                w = U(h, C++), w && c.trackPosition && (c.position++, w === `
` ? (c.line++, c.column = 0) : c.column++);
              c.textNode += h.substring(Y, C - 1);
            }
            w === "<" && !(c.sawRoot && c.closedRoot && !c.strict) ? (c.state = y.OPEN_WAKA, c.startTagPosition = c.position) : (!L(w) && (!c.sawRoot || c.closedRoot) && b(c, "Text data outside of root node."), w === "&" ? c.state = y.TEXT_ENTITY : c.textNode += w);
            continue;
          case y.SCRIPT:
            w === "<" ? c.state = y.SCRIPT_ENDING : c.script += w;
            continue;
          case y.SCRIPT_ENDING:
            w === "/" ? c.state = y.CLOSE_TAG : (c.script += "<" + w, c.state = y.SCRIPT);
            continue;
          case y.OPEN_WAKA:
            if (w === "!")
              c.state = y.SGML_DECL, c.sgmlDecl = "";
            else if (!L(w)) if (V(_, w))
              c.state = y.OPEN_TAG, c.tagName = w;
            else if (w === "/")
              c.state = y.CLOSE_TAG, c.tagName = "";
            else if (w === "?")
              c.state = y.PROC_INST, c.procInstName = c.procInstBody = "";
            else {
              if (b(c, "Unencoded <"), c.startTagPosition + 1 < c.position) {
                var te = c.position - c.startTagPosition;
                w = new Array(te).join(" ") + w;
              }
              c.textNode += "<" + w, c.state = y.TEXT;
            }
            continue;
          case y.SGML_DECL:
            if (c.sgmlDecl + w === "--") {
              c.state = y.COMMENT, c.comment = "", c.sgmlDecl = "";
              continue;
            }
            c.doctype && c.doctype !== !0 && c.sgmlDecl ? (c.state = y.DOCTYPE_DTD, c.doctype += "<!" + c.sgmlDecl + w, c.sgmlDecl = "") : (c.sgmlDecl + w).toUpperCase() === u ? (M(c, "onopencdata"), c.state = y.CDATA, c.sgmlDecl = "", c.cdata = "") : (c.sgmlDecl + w).toUpperCase() === p ? (c.state = y.DOCTYPE, (c.doctype || c.sawRoot) && b(
              c,
              "Inappropriately located doctype declaration"
            ), c.doctype = "", c.sgmlDecl = "") : w === ">" ? (M(c, "onsgmldeclaration", c.sgmlDecl), c.sgmlDecl = "", c.state = y.TEXT) : (Z(w) && (c.state = y.SGML_DECL_QUOTED), c.sgmlDecl += w);
            continue;
          case y.SGML_DECL_QUOTED:
            w === c.q && (c.state = y.SGML_DECL, c.q = ""), c.sgmlDecl += w;
            continue;
          case y.DOCTYPE:
            w === ">" ? (c.state = y.TEXT, M(c, "ondoctype", c.doctype), c.doctype = !0) : (c.doctype += w, w === "[" ? c.state = y.DOCTYPE_DTD : Z(w) && (c.state = y.DOCTYPE_QUOTED, c.q = w));
            continue;
          case y.DOCTYPE_QUOTED:
            c.doctype += w, w === c.q && (c.q = "", c.state = y.DOCTYPE);
            continue;
          case y.DOCTYPE_DTD:
            w === "]" ? (c.doctype += w, c.state = y.DOCTYPE) : w === "<" ? (c.state = y.OPEN_WAKA, c.startTagPosition = c.position) : Z(w) ? (c.doctype += w, c.state = y.DOCTYPE_DTD_QUOTED, c.q = w) : c.doctype += w;
            continue;
          case y.DOCTYPE_DTD_QUOTED:
            c.doctype += w, w === c.q && (c.state = y.DOCTYPE_DTD, c.q = "");
            continue;
          case y.COMMENT:
            w === "-" ? c.state = y.COMMENT_ENDING : c.comment += w;
            continue;
          case y.COMMENT_ENDING:
            w === "-" ? (c.state = y.COMMENT_ENDED, c.comment = I(c.opt, c.comment), c.comment && M(c, "oncomment", c.comment), c.comment = "") : (c.comment += "-" + w, c.state = y.COMMENT);
            continue;
          case y.COMMENT_ENDED:
            w !== ">" ? (b(c, "Malformed comment"), c.comment += "--" + w, c.state = y.COMMENT) : c.doctype && c.doctype !== !0 ? c.state = y.DOCTYPE_DTD : c.state = y.TEXT;
            continue;
          case y.CDATA:
            w === "]" ? c.state = y.CDATA_ENDING : c.cdata += w;
            continue;
          case y.CDATA_ENDING:
            w === "]" ? c.state = y.CDATA_ENDING_2 : (c.cdata += "]" + w, c.state = y.CDATA);
            continue;
          case y.CDATA_ENDING_2:
            w === ">" ? (c.cdata && M(c, "oncdata", c.cdata), M(c, "onclosecdata"), c.cdata = "", c.state = y.TEXT) : w === "]" ? c.cdata += "]" : (c.cdata += "]]" + w, c.state = y.CDATA);
            continue;
          case y.PROC_INST:
            w === "?" ? c.state = y.PROC_INST_ENDING : L(w) ? c.state = y.PROC_INST_BODY : c.procInstName += w;
            continue;
          case y.PROC_INST_BODY:
            if (!c.procInstBody && L(w))
              continue;
            w === "?" ? c.state = y.PROC_INST_ENDING : c.procInstBody += w;
            continue;
          case y.PROC_INST_ENDING:
            w === ">" ? (M(c, "onprocessinginstruction", {
              name: c.procInstName,
              body: c.procInstBody
            }), c.procInstName = c.procInstBody = "", c.state = y.TEXT) : (c.procInstBody += "?" + w, c.state = y.PROC_INST_BODY);
            continue;
          case y.OPEN_TAG:
            V(T, w) ? c.tagName += w : (D(c), w === ">" ? G(c) : w === "/" ? c.state = y.OPEN_TAG_SLASH : (L(w) || b(c, "Invalid character in tag name"), c.state = y.ATTRIB));
            continue;
          case y.OPEN_TAG_SLASH:
            w === ">" ? (G(c, !0), j(c)) : (b(c, "Forward-slash in opening tag not followed by >"), c.state = y.ATTRIB);
            continue;
          case y.ATTRIB:
            if (L(w))
              continue;
            w === ">" ? G(c) : w === "/" ? c.state = y.OPEN_TAG_SLASH : V(_, w) ? (c.attribName = w, c.attribValue = "", c.state = y.ATTRIB_NAME) : b(c, "Invalid attribute name");
            continue;
          case y.ATTRIB_NAME:
            w === "=" ? c.state = y.ATTRIB_VALUE : w === ">" ? (b(c, "Attribute without value"), c.attribValue = c.attribName, k(c), G(c)) : L(w) ? c.state = y.ATTRIB_NAME_SAW_WHITE : V(T, w) ? c.attribName += w : b(c, "Invalid attribute name");
            continue;
          case y.ATTRIB_NAME_SAW_WHITE:
            if (w === "=")
              c.state = y.ATTRIB_VALUE;
            else {
              if (L(w))
                continue;
              b(c, "Attribute without value"), c.tag.attributes[c.attribName] = "", c.attribValue = "", M(c, "onattribute", {
                name: c.attribName,
                value: ""
              }), c.attribName = "", w === ">" ? G(c) : V(_, w) ? (c.attribName = w, c.state = y.ATTRIB_NAME) : (b(c, "Invalid attribute name"), c.state = y.ATTRIB);
            }
            continue;
          case y.ATTRIB_VALUE:
            if (L(w))
              continue;
            Z(w) ? (c.q = w, c.state = y.ATTRIB_VALUE_QUOTED) : (c.opt.unquotedAttributeValues || $(c, "Unquoted attribute value"), c.state = y.ATTRIB_VALUE_UNQUOTED, c.attribValue = w);
            continue;
          case y.ATTRIB_VALUE_QUOTED:
            if (w !== c.q) {
              w === "&" ? c.state = y.ATTRIB_VALUE_ENTITY_Q : c.attribValue += w;
              continue;
            }
            k(c), c.q = "", c.state = y.ATTRIB_VALUE_CLOSED;
            continue;
          case y.ATTRIB_VALUE_CLOSED:
            L(w) ? c.state = y.ATTRIB : w === ">" ? G(c) : w === "/" ? c.state = y.OPEN_TAG_SLASH : V(_, w) ? (b(c, "No whitespace between attributes"), c.attribName = w, c.attribValue = "", c.state = y.ATTRIB_NAME) : b(c, "Invalid attribute name");
            continue;
          case y.ATTRIB_VALUE_UNQUOTED:
            if (!ae(w)) {
              w === "&" ? c.state = y.ATTRIB_VALUE_ENTITY_U : c.attribValue += w;
              continue;
            }
            k(c), w === ">" ? G(c) : c.state = y.ATTRIB;
            continue;
          case y.CLOSE_TAG:
            if (c.tagName)
              w === ">" ? j(c) : V(T, w) ? c.tagName += w : c.script ? (c.script += "</" + c.tagName, c.tagName = "", c.state = y.SCRIPT) : (L(w) || b(c, "Invalid tagname in closing tag"), c.state = y.CLOSE_TAG_SAW_WHITE);
            else {
              if (L(w))
                continue;
              Ne(_, w) ? c.script ? (c.script += "</" + w, c.state = y.SCRIPT) : b(c, "Invalid tagname in closing tag.") : c.tagName = w;
            }
            continue;
          case y.CLOSE_TAG_SAW_WHITE:
            if (L(w))
              continue;
            w === ">" ? j(c) : b(c, "Invalid characters in closing tag");
            continue;
          case y.TEXT_ENTITY:
          case y.ATTRIB_VALUE_ENTITY_Q:
          case y.ATTRIB_VALUE_ENTITY_U:
            var ie, pe;
            switch (c.state) {
              case y.TEXT_ENTITY:
                ie = y.TEXT, pe = "textNode";
                break;
              case y.ATTRIB_VALUE_ENTITY_Q:
                ie = y.ATTRIB_VALUE_QUOTED, pe = "attribValue";
                break;
              case y.ATTRIB_VALUE_ENTITY_U:
                ie = y.ATTRIB_VALUE_UNQUOTED, pe = "attribValue";
                break;
            }
            if (w === ";") {
              var Ee = K(c);
              c.opt.unparsedEntities && !Object.values(t.XML_ENTITIES).includes(Ee) ? (c.entity = "", c.state = ie, c.write(Ee)) : (c[pe] += Ee, c.entity = "", c.state = ie);
            } else V(c.entity.length ? N : A, w) ? c.entity += w : (b(c, "Invalid character in entity name"), c[pe] += "&" + c.entity + w, c.entity = "", c.state = ie);
            continue;
          default:
            throw new Error(c, "Unknown state: " + c.state);
        }
      return c.position >= c.bufferCheckPosition && i(c), c;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var h = String.fromCharCode, c = Math.floor, C = function() {
        var w = 16384, Y = [], te, ie, pe = -1, Ee = arguments.length;
        if (!Ee)
          return "";
        for (var nt = ""; ++pe < Ee; ) {
          var le = Number(arguments[pe]);
          if (!isFinite(le) || // `NaN`, `+Infinity`, or `-Infinity`
          le < 0 || // not a valid Unicode code point
          le > 1114111 || // not a valid Unicode code point
          c(le) !== le)
            throw RangeError("Invalid code point: " + le);
          le <= 65535 ? Y.push(le) : (le -= 65536, te = (le >> 10) + 55296, ie = le % 1024 + 56320, Y.push(te, ie)), (pe + 1 === Ee || Y.length > w) && (nt += h.apply(null, Y), Y.length = 0);
        }
        return nt;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: C,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = C;
    }();
  })(e);
})(yc);
Object.defineProperty(Wr, "__esModule", { value: !0 });
Wr.XElement = void 0;
Wr.parseXml = zp;
const Wp = yc, gn = ar;
class Ec {
  constructor(t) {
    if (this.name = t, this.value = "", this.attributes = null, this.isCData = !1, this.elements = null, !t)
      throw (0, gn.newError)("Element name cannot be empty", "ERR_XML_ELEMENT_NAME_EMPTY");
    if (!Yp(t))
      throw (0, gn.newError)(`Invalid element name: ${t}`, "ERR_XML_ELEMENT_INVALID_NAME");
  }
  attribute(t) {
    const r = this.attributes === null ? null : this.attributes[t];
    if (r == null)
      throw (0, gn.newError)(`No attribute "${t}"`, "ERR_XML_MISSED_ATTRIBUTE");
    return r;
  }
  removeAttribute(t) {
    this.attributes !== null && delete this.attributes[t];
  }
  element(t, r = !1, n = null) {
    const i = this.elementOrNull(t, r);
    if (i === null)
      throw (0, gn.newError)(n || `No element "${t}"`, "ERR_XML_MISSED_ELEMENT");
    return i;
  }
  elementOrNull(t, r = !1) {
    if (this.elements === null)
      return null;
    for (const n of this.elements)
      if (Va(n, t, r))
        return n;
    return null;
  }
  getElements(t, r = !1) {
    return this.elements === null ? [] : this.elements.filter((n) => Va(n, t, r));
  }
  elementValueOrEmpty(t, r = !1) {
    const n = this.elementOrNull(t, r);
    return n === null ? "" : n.value;
  }
}
Wr.XElement = Ec;
const Vp = new RegExp(/^[A-Za-z_][:A-Za-z0-9_-]*$/i);
function Yp(e) {
  return Vp.test(e);
}
function Va(e, t, r) {
  const n = e.name;
  return n === t || r === !0 && n.length === t.length && n.toLowerCase() === t.toLowerCase();
}
function zp(e) {
  let t = null;
  const r = Wp.parser(!0, {}), n = [];
  return r.onopentag = (i) => {
    const o = new Ec(i.name);
    if (o.attributes = i.attributes, t === null)
      t = o;
    else {
      const a = n[n.length - 1];
      a.elements == null && (a.elements = []), a.elements.push(o);
    }
    n.push(o);
  }, r.onclosetag = () => {
    n.pop();
  }, r.ontext = (i) => {
    n.length > 0 && (n[n.length - 1].value = i);
  }, r.oncdata = (i) => {
    const o = n[n.length - 1];
    o.value = i, o.isCData = !0;
  }, r.onerror = (i) => {
    throw i;
  }, r.write(e), t;
}
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.CURRENT_APP_PACKAGE_FILE_NAME = e.CURRENT_APP_INSTALLER_FILE_NAME = e.XElement = e.parseXml = e.UUID = e.parseDn = e.retry = e.githubUrl = e.getS3LikeProviderBaseUrl = e.ProgressCallbackTransform = e.MemoLazy = e.safeStringifyJson = e.safeGetHeader = e.parseJson = e.HttpExecutor = e.HttpError = e.DigestTransform = e.createHttpError = e.configureRequestUrl = e.configureRequestOptionsFromUrl = e.configureRequestOptions = e.newError = e.CancellationToken = e.CancellationError = void 0, e.asArray = u;
  var t = mt;
  Object.defineProperty(e, "CancellationError", { enumerable: !0, get: function() {
    return t.CancellationError;
  } }), Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } });
  var r = ar;
  Object.defineProperty(e, "newError", { enumerable: !0, get: function() {
    return r.newError;
  } });
  var n = Te;
  Object.defineProperty(e, "configureRequestOptions", { enumerable: !0, get: function() {
    return n.configureRequestOptions;
  } }), Object.defineProperty(e, "configureRequestOptionsFromUrl", { enumerable: !0, get: function() {
    return n.configureRequestOptionsFromUrl;
  } }), Object.defineProperty(e, "configureRequestUrl", { enumerable: !0, get: function() {
    return n.configureRequestUrl;
  } }), Object.defineProperty(e, "createHttpError", { enumerable: !0, get: function() {
    return n.createHttpError;
  } }), Object.defineProperty(e, "DigestTransform", { enumerable: !0, get: function() {
    return n.DigestTransform;
  } }), Object.defineProperty(e, "HttpError", { enumerable: !0, get: function() {
    return n.HttpError;
  } }), Object.defineProperty(e, "HttpExecutor", { enumerable: !0, get: function() {
    return n.HttpExecutor;
  } }), Object.defineProperty(e, "parseJson", { enumerable: !0, get: function() {
    return n.parseJson;
  } }), Object.defineProperty(e, "safeGetHeader", { enumerable: !0, get: function() {
    return n.safeGetHeader;
  } }), Object.defineProperty(e, "safeStringifyJson", { enumerable: !0, get: function() {
    return n.safeStringifyJson;
  } });
  var i = Jn;
  Object.defineProperty(e, "MemoLazy", { enumerable: !0, get: function() {
    return i.MemoLazy;
  } });
  var o = Gr;
  Object.defineProperty(e, "ProgressCallbackTransform", { enumerable: !0, get: function() {
    return o.ProgressCallbackTransform;
  } });
  var a = Qn;
  Object.defineProperty(e, "getS3LikeProviderBaseUrl", { enumerable: !0, get: function() {
    return a.getS3LikeProviderBaseUrl;
  } }), Object.defineProperty(e, "githubUrl", { enumerable: !0, get: function() {
    return a.githubUrl;
  } });
  var s = Po;
  Object.defineProperty(e, "retry", { enumerable: !0, get: function() {
    return s.retry;
  } });
  var l = Ro;
  Object.defineProperty(e, "parseDn", { enumerable: !0, get: function() {
    return l.parseDn;
  } });
  var d = rr;
  Object.defineProperty(e, "UUID", { enumerable: !0, get: function() {
    return d.UUID;
  } });
  var f = Wr;
  Object.defineProperty(e, "parseXml", { enumerable: !0, get: function() {
    return f.parseXml;
  } }), Object.defineProperty(e, "XElement", { enumerable: !0, get: function() {
    return f.XElement;
  } }), e.CURRENT_APP_INSTALLER_FILE_NAME = "installer.exe", e.CURRENT_APP_PACKAGE_FILE_NAME = "package.7z";
  function u(p) {
    return p == null ? [] : Array.isArray(p) ? p : [p];
  }
})(he);
var ye = {}, No = {}, He = {};
function vc(e) {
  return typeof e > "u" || e === null;
}
function Xp(e) {
  return typeof e == "object" && e !== null;
}
function Kp(e) {
  return Array.isArray(e) ? e : vc(e) ? [] : [e];
}
function Jp(e, t) {
  var r, n, i, o;
  if (t)
    for (o = Object.keys(t), r = 0, n = o.length; r < n; r += 1)
      i = o[r], e[i] = t[i];
  return e;
}
function Qp(e, t) {
  var r = "", n;
  for (n = 0; n < t; n += 1)
    r += e;
  return r;
}
function Zp(e) {
  return e === 0 && Number.NEGATIVE_INFINITY === 1 / e;
}
He.isNothing = vc;
He.isObject = Xp;
He.toArray = Kp;
He.repeat = Qp;
He.isNegativeZero = Zp;
He.extend = Jp;
function wc(e, t) {
  var r = "", n = e.reason || "(unknown reason)";
  return e.mark ? (e.mark.name && (r += 'in "' + e.mark.name + '" '), r += "(" + (e.mark.line + 1) + ":" + (e.mark.column + 1) + ")", !t && e.mark.snippet && (r += `

` + e.mark.snippet), n + " " + r) : n;
}
function Pr(e, t) {
  Error.call(this), this.name = "YAMLException", this.reason = e, this.mark = t, this.message = wc(this, !1), Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : this.stack = new Error().stack || "";
}
Pr.prototype = Object.create(Error.prototype);
Pr.prototype.constructor = Pr;
Pr.prototype.toString = function(t) {
  return this.name + ": " + wc(this, t);
};
var Vr = Pr, vr = He;
function Ri(e, t, r, n, i) {
  var o = "", a = "", s = Math.floor(i / 2) - 1;
  return n - t > s && (o = " ... ", t = n - s + o.length), r - n > s && (a = " ...", r = n + s - a.length), {
    str: o + e.slice(t, r).replace(/\t/g, "→") + a,
    pos: n - t + o.length
    // relative position
  };
}
function Ni(e, t) {
  return vr.repeat(" ", t - e.length) + e;
}
function em(e, t) {
  if (t = Object.create(t || null), !e.buffer) return null;
  t.maxLength || (t.maxLength = 79), typeof t.indent != "number" && (t.indent = 1), typeof t.linesBefore != "number" && (t.linesBefore = 3), typeof t.linesAfter != "number" && (t.linesAfter = 2);
  for (var r = /\r?\n|\r|\0/g, n = [0], i = [], o, a = -1; o = r.exec(e.buffer); )
    i.push(o.index), n.push(o.index + o[0].length), e.position <= o.index && a < 0 && (a = n.length - 2);
  a < 0 && (a = n.length - 1);
  var s = "", l, d, f = Math.min(e.line + t.linesAfter, i.length).toString().length, u = t.maxLength - (t.indent + f + 3);
  for (l = 1; l <= t.linesBefore && !(a - l < 0); l++)
    d = Ri(
      e.buffer,
      n[a - l],
      i[a - l],
      e.position - (n[a] - n[a - l]),
      u
    ), s = vr.repeat(" ", t.indent) + Ni((e.line - l + 1).toString(), f) + " | " + d.str + `
` + s;
  for (d = Ri(e.buffer, n[a], i[a], e.position, u), s += vr.repeat(" ", t.indent) + Ni((e.line + 1).toString(), f) + " | " + d.str + `
`, s += vr.repeat("-", t.indent + f + 3 + d.pos) + `^
`, l = 1; l <= t.linesAfter && !(a + l >= i.length); l++)
    d = Ri(
      e.buffer,
      n[a + l],
      i[a + l],
      e.position - (n[a] - n[a + l]),
      u
    ), s += vr.repeat(" ", t.indent) + Ni((e.line + l + 1).toString(), f) + " | " + d.str + `
`;
  return s.replace(/\n$/, "");
}
var tm = em, Ya = Vr, rm = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
], nm = [
  "scalar",
  "sequence",
  "mapping"
];
function im(e) {
  var t = {};
  return e !== null && Object.keys(e).forEach(function(r) {
    e[r].forEach(function(n) {
      t[String(n)] = r;
    });
  }), t;
}
function om(e, t) {
  if (t = t || {}, Object.keys(t).forEach(function(r) {
    if (rm.indexOf(r) === -1)
      throw new Ya('Unknown option "' + r + '" is met in definition of "' + e + '" YAML type.');
  }), this.options = t, this.tag = e, this.kind = t.kind || null, this.resolve = t.resolve || function() {
    return !0;
  }, this.construct = t.construct || function(r) {
    return r;
  }, this.instanceOf = t.instanceOf || null, this.predicate = t.predicate || null, this.represent = t.represent || null, this.representName = t.representName || null, this.defaultStyle = t.defaultStyle || null, this.multi = t.multi || !1, this.styleAliases = im(t.styleAliases || null), nm.indexOf(this.kind) === -1)
    throw new Ya('Unknown kind "' + this.kind + '" is specified for "' + e + '" YAML type.');
}
var Oe = om, mr = Vr, Di = Oe;
function za(e, t) {
  var r = [];
  return e[t].forEach(function(n) {
    var i = r.length;
    r.forEach(function(o, a) {
      o.tag === n.tag && o.kind === n.kind && o.multi === n.multi && (i = a);
    }), r[i] = n;
  }), r;
}
function am() {
  var e = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, t, r;
  function n(i) {
    i.multi ? (e.multi[i.kind].push(i), e.multi.fallback.push(i)) : e[i.kind][i.tag] = e.fallback[i.tag] = i;
  }
  for (t = 0, r = arguments.length; t < r; t += 1)
    arguments[t].forEach(n);
  return e;
}
function ao(e) {
  return this.extend(e);
}
ao.prototype.extend = function(t) {
  var r = [], n = [];
  if (t instanceof Di)
    n.push(t);
  else if (Array.isArray(t))
    n = n.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    t.implicit && (r = r.concat(t.implicit)), t.explicit && (n = n.concat(t.explicit));
  else
    throw new mr("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  r.forEach(function(o) {
    if (!(o instanceof Di))
      throw new mr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    if (o.loadKind && o.loadKind !== "scalar")
      throw new mr("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    if (o.multi)
      throw new mr("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
  }), n.forEach(function(o) {
    if (!(o instanceof Di))
      throw new mr("Specified list of YAML types (or a single Type object) contains a non-Type object.");
  });
  var i = Object.create(ao.prototype);
  return i.implicit = (this.implicit || []).concat(r), i.explicit = (this.explicit || []).concat(n), i.compiledImplicit = za(i, "implicit"), i.compiledExplicit = za(i, "explicit"), i.compiledTypeMap = am(i.compiledImplicit, i.compiledExplicit), i;
};
var _c = ao, sm = Oe, Sc = new sm("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(e) {
    return e !== null ? e : "";
  }
}), lm = Oe, Ac = new lm("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(e) {
    return e !== null ? e : [];
  }
}), cm = Oe, Tc = new cm("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(e) {
    return e !== null ? e : {};
  }
}), um = _c, Cc = new um({
  explicit: [
    Sc,
    Ac,
    Tc
  ]
}), fm = Oe;
function dm(e) {
  if (e === null) return !0;
  var t = e.length;
  return t === 1 && e === "~" || t === 4 && (e === "null" || e === "Null" || e === "NULL");
}
function hm() {
  return null;
}
function pm(e) {
  return e === null;
}
var bc = new fm("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: dm,
  construct: hm,
  predicate: pm,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
}), mm = Oe;
function gm(e) {
  if (e === null) return !1;
  var t = e.length;
  return t === 4 && (e === "true" || e === "True" || e === "TRUE") || t === 5 && (e === "false" || e === "False" || e === "FALSE");
}
function ym(e) {
  return e === "true" || e === "True" || e === "TRUE";
}
function Em(e) {
  return Object.prototype.toString.call(e) === "[object Boolean]";
}
var $c = new mm("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: gm,
  construct: ym,
  predicate: Em,
  represent: {
    lowercase: function(e) {
      return e ? "true" : "false";
    },
    uppercase: function(e) {
      return e ? "TRUE" : "FALSE";
    },
    camelcase: function(e) {
      return e ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
}), vm = He, wm = Oe;
function _m(e) {
  return 48 <= e && e <= 57 || 65 <= e && e <= 70 || 97 <= e && e <= 102;
}
function Sm(e) {
  return 48 <= e && e <= 55;
}
function Am(e) {
  return 48 <= e && e <= 57;
}
function Tm(e) {
  if (e === null) return !1;
  var t = e.length, r = 0, n = !1, i;
  if (!t) return !1;
  if (i = e[r], (i === "-" || i === "+") && (i = e[++r]), i === "0") {
    if (r + 1 === t) return !0;
    if (i = e[++r], i === "b") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (i !== "0" && i !== "1") return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "x") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!_m(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
    if (i === "o") {
      for (r++; r < t; r++)
        if (i = e[r], i !== "_") {
          if (!Sm(e.charCodeAt(r))) return !1;
          n = !0;
        }
      return n && i !== "_";
    }
  }
  if (i === "_") return !1;
  for (; r < t; r++)
    if (i = e[r], i !== "_") {
      if (!Am(e.charCodeAt(r)))
        return !1;
      n = !0;
    }
  return !(!n || i === "_");
}
function Cm(e) {
  var t = e, r = 1, n;
  if (t.indexOf("_") !== -1 && (t = t.replace(/_/g, "")), n = t[0], (n === "-" || n === "+") && (n === "-" && (r = -1), t = t.slice(1), n = t[0]), t === "0") return 0;
  if (n === "0") {
    if (t[1] === "b") return r * parseInt(t.slice(2), 2);
    if (t[1] === "x") return r * parseInt(t.slice(2), 16);
    if (t[1] === "o") return r * parseInt(t.slice(2), 8);
  }
  return r * parseInt(t, 10);
}
function bm(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && e % 1 === 0 && !vm.isNegativeZero(e);
}
var Oc = new wm("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: Tm,
  construct: Cm,
  predicate: bm,
  represent: {
    binary: function(e) {
      return e >= 0 ? "0b" + e.toString(2) : "-0b" + e.toString(2).slice(1);
    },
    octal: function(e) {
      return e >= 0 ? "0o" + e.toString(8) : "-0o" + e.toString(8).slice(1);
    },
    decimal: function(e) {
      return e.toString(10);
    },
    /* eslint-disable max-len */
    hexadecimal: function(e) {
      return e >= 0 ? "0x" + e.toString(16).toUpperCase() : "-0x" + e.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
}), Ic = He, $m = Oe, Om = new RegExp(
  // 2.5e4, 2.5 and integers
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function Im(e) {
  return !(e === null || !Om.test(e) || // Quick hack to not allow integers end with `_`
  // Probably should update regexp & check speed
  e[e.length - 1] === "_");
}
function Pm(e) {
  var t, r;
  return t = e.replace(/_/g, "").toLowerCase(), r = t[0] === "-" ? -1 : 1, "+-".indexOf(t[0]) >= 0 && (t = t.slice(1)), t === ".inf" ? r === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY : t === ".nan" ? NaN : r * parseFloat(t, 10);
}
var Rm = /^[-+]?[0-9]+e/;
function Nm(e, t) {
  var r;
  if (isNaN(e))
    switch (t) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  else if (Number.POSITIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  else if (Number.NEGATIVE_INFINITY === e)
    switch (t) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  else if (Ic.isNegativeZero(e))
    return "-0.0";
  return r = e.toString(10), Rm.test(r) ? r.replace("e", ".e") : r;
}
function Dm(e) {
  return Object.prototype.toString.call(e) === "[object Number]" && (e % 1 !== 0 || Ic.isNegativeZero(e));
}
var Pc = new $m("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: Im,
  construct: Pm,
  predicate: Dm,
  represent: Nm,
  defaultStyle: "lowercase"
}), Rc = Cc.extend({
  implicit: [
    bc,
    $c,
    Oc,
    Pc
  ]
}), Nc = Rc, Fm = Oe, Dc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
), Fc = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function xm(e) {
  return e === null ? !1 : Dc.exec(e) !== null || Fc.exec(e) !== null;
}
function Lm(e) {
  var t, r, n, i, o, a, s, l = 0, d = null, f, u, p;
  if (t = Dc.exec(e), t === null && (t = Fc.exec(e)), t === null) throw new Error("Date resolve error");
  if (r = +t[1], n = +t[2] - 1, i = +t[3], !t[4])
    return new Date(Date.UTC(r, n, i));
  if (o = +t[4], a = +t[5], s = +t[6], t[7]) {
    for (l = t[7].slice(0, 3); l.length < 3; )
      l += "0";
    l = +l;
  }
  return t[9] && (f = +t[10], u = +(t[11] || 0), d = (f * 60 + u) * 6e4, t[9] === "-" && (d = -d)), p = new Date(Date.UTC(r, n, i, o, a, s, l)), d && p.setTime(p.getTime() - d), p;
}
function Um(e) {
  return e.toISOString();
}
var xc = new Fm("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: xm,
  construct: Lm,
  instanceOf: Date,
  represent: Um
}), km = Oe;
function Mm(e) {
  return e === "<<" || e === null;
}
var Lc = new km("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: Mm
}), Bm = Oe, Do = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function jm(e) {
  if (e === null) return !1;
  var t, r, n = 0, i = e.length, o = Do;
  for (r = 0; r < i; r++)
    if (t = o.indexOf(e.charAt(r)), !(t > 64)) {
      if (t < 0) return !1;
      n += 6;
    }
  return n % 8 === 0;
}
function Hm(e) {
  var t, r, n = e.replace(/[\r\n=]/g, ""), i = n.length, o = Do, a = 0, s = [];
  for (t = 0; t < i; t++)
    t % 4 === 0 && t && (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)), a = a << 6 | o.indexOf(n.charAt(t));
  return r = i % 4 * 6, r === 0 ? (s.push(a >> 16 & 255), s.push(a >> 8 & 255), s.push(a & 255)) : r === 18 ? (s.push(a >> 10 & 255), s.push(a >> 2 & 255)) : r === 12 && s.push(a >> 4 & 255), new Uint8Array(s);
}
function qm(e) {
  var t = "", r = 0, n, i, o = e.length, a = Do;
  for (n = 0; n < o; n++)
    n % 3 === 0 && n && (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]), r = (r << 8) + e[n];
  return i = o % 3, i === 0 ? (t += a[r >> 18 & 63], t += a[r >> 12 & 63], t += a[r >> 6 & 63], t += a[r & 63]) : i === 2 ? (t += a[r >> 10 & 63], t += a[r >> 4 & 63], t += a[r << 2 & 63], t += a[64]) : i === 1 && (t += a[r >> 2 & 63], t += a[r << 4 & 63], t += a[64], t += a[64]), t;
}
function Gm(e) {
  return Object.prototype.toString.call(e) === "[object Uint8Array]";
}
var Uc = new Bm("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: jm,
  construct: Hm,
  predicate: Gm,
  represent: qm
}), Wm = Oe, Vm = Object.prototype.hasOwnProperty, Ym = Object.prototype.toString;
function zm(e) {
  if (e === null) return !0;
  var t = [], r, n, i, o, a, s = e;
  for (r = 0, n = s.length; r < n; r += 1) {
    if (i = s[r], a = !1, Ym.call(i) !== "[object Object]") return !1;
    for (o in i)
      if (Vm.call(i, o))
        if (!a) a = !0;
        else return !1;
    if (!a) return !1;
    if (t.indexOf(o) === -1) t.push(o);
    else return !1;
  }
  return !0;
}
function Xm(e) {
  return e !== null ? e : [];
}
var kc = new Wm("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: zm,
  construct: Xm
}), Km = Oe, Jm = Object.prototype.toString;
function Qm(e) {
  if (e === null) return !0;
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1) {
    if (n = a[t], Jm.call(n) !== "[object Object]" || (i = Object.keys(n), i.length !== 1)) return !1;
    o[t] = [i[0], n[i[0]]];
  }
  return !0;
}
function Zm(e) {
  if (e === null) return [];
  var t, r, n, i, o, a = e;
  for (o = new Array(a.length), t = 0, r = a.length; t < r; t += 1)
    n = a[t], i = Object.keys(n), o[t] = [i[0], n[i[0]]];
  return o;
}
var Mc = new Km("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: Qm,
  construct: Zm
}), eg = Oe, tg = Object.prototype.hasOwnProperty;
function rg(e) {
  if (e === null) return !0;
  var t, r = e;
  for (t in r)
    if (tg.call(r, t) && r[t] !== null)
      return !1;
  return !0;
}
function ng(e) {
  return e !== null ? e : {};
}
var Bc = new eg("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: rg,
  construct: ng
}), Fo = Nc.extend({
  implicit: [
    xc,
    Lc
  ],
  explicit: [
    Uc,
    kc,
    Mc,
    Bc
  ]
}), It = He, jc = Vr, ig = tm, og = Fo, gt = Object.prototype.hasOwnProperty, kn = 1, Hc = 2, qc = 3, Mn = 4, Fi = 1, ag = 2, Xa = 3, sg = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/, lg = /[\x85\u2028\u2029]/, cg = /[,\[\]\{\}]/, Gc = /^(?:!|!!|![a-z\-]+!)$/i, Wc = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function Ka(e) {
  return Object.prototype.toString.call(e);
}
function ze(e) {
  return e === 10 || e === 13;
}
function Nt(e) {
  return e === 9 || e === 32;
}
function Re(e) {
  return e === 9 || e === 32 || e === 10 || e === 13;
}
function Yt(e) {
  return e === 44 || e === 91 || e === 93 || e === 123 || e === 125;
}
function ug(e) {
  var t;
  return 48 <= e && e <= 57 ? e - 48 : (t = e | 32, 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
function fg(e) {
  return e === 120 ? 2 : e === 117 ? 4 : e === 85 ? 8 : 0;
}
function dg(e) {
  return 48 <= e && e <= 57 ? e - 48 : -1;
}
function Ja(e) {
  return e === 48 ? "\0" : e === 97 ? "\x07" : e === 98 ? "\b" : e === 116 || e === 9 ? "	" : e === 110 ? `
` : e === 118 ? "\v" : e === 102 ? "\f" : e === 114 ? "\r" : e === 101 ? "\x1B" : e === 32 ? " " : e === 34 ? '"' : e === 47 ? "/" : e === 92 ? "\\" : e === 78 ? "" : e === 95 ? " " : e === 76 ? "\u2028" : e === 80 ? "\u2029" : "";
}
function hg(e) {
  return e <= 65535 ? String.fromCharCode(e) : String.fromCharCode(
    (e - 65536 >> 10) + 55296,
    (e - 65536 & 1023) + 56320
  );
}
var Vc = new Array(256), Yc = new Array(256);
for (var Mt = 0; Mt < 256; Mt++)
  Vc[Mt] = Ja(Mt) ? 1 : 0, Yc[Mt] = Ja(Mt);
function pg(e, t) {
  this.input = e, this.filename = t.filename || null, this.schema = t.schema || og, this.onWarning = t.onWarning || null, this.legacy = t.legacy || !1, this.json = t.json || !1, this.listener = t.listener || null, this.implicitTypes = this.schema.compiledImplicit, this.typeMap = this.schema.compiledTypeMap, this.length = e.length, this.position = 0, this.line = 0, this.lineStart = 0, this.lineIndent = 0, this.firstTabInLine = -1, this.documents = [];
}
function zc(e, t) {
  var r = {
    name: e.filename,
    buffer: e.input.slice(0, -1),
    // omit trailing \0
    position: e.position,
    line: e.line,
    column: e.position - e.lineStart
  };
  return r.snippet = ig(r), new jc(t, r);
}
function x(e, t) {
  throw zc(e, t);
}
function Bn(e, t) {
  e.onWarning && e.onWarning.call(null, zc(e, t));
}
var Qa = {
  YAML: function(t, r, n) {
    var i, o, a;
    t.version !== null && x(t, "duplication of %YAML directive"), n.length !== 1 && x(t, "YAML directive accepts exactly one argument"), i = /^([0-9]+)\.([0-9]+)$/.exec(n[0]), i === null && x(t, "ill-formed argument of the YAML directive"), o = parseInt(i[1], 10), a = parseInt(i[2], 10), o !== 1 && x(t, "unacceptable YAML version of the document"), t.version = n[0], t.checkLineBreaks = a < 2, a !== 1 && a !== 2 && Bn(t, "unsupported YAML version of the document");
  },
  TAG: function(t, r, n) {
    var i, o;
    n.length !== 2 && x(t, "TAG directive accepts exactly two arguments"), i = n[0], o = n[1], Gc.test(i) || x(t, "ill-formed tag handle (first argument) of the TAG directive"), gt.call(t.tagMap, i) && x(t, 'there is a previously declared suffix for "' + i + '" tag handle'), Wc.test(o) || x(t, "ill-formed tag prefix (second argument) of the TAG directive");
    try {
      o = decodeURIComponent(o);
    } catch {
      x(t, "tag prefix is malformed: " + o);
    }
    t.tagMap[i] = o;
  }
};
function dt(e, t, r, n) {
  var i, o, a, s;
  if (t < r) {
    if (s = e.input.slice(t, r), n)
      for (i = 0, o = s.length; i < o; i += 1)
        a = s.charCodeAt(i), a === 9 || 32 <= a && a <= 1114111 || x(e, "expected valid JSON character");
    else sg.test(s) && x(e, "the stream contains non-printable characters");
    e.result += s;
  }
}
function Za(e, t, r, n) {
  var i, o, a, s;
  for (It.isObject(r) || x(e, "cannot merge mappings; the provided source object is unacceptable"), i = Object.keys(r), a = 0, s = i.length; a < s; a += 1)
    o = i[a], gt.call(t, o) || (t[o] = r[o], n[o] = !0);
}
function zt(e, t, r, n, i, o, a, s, l) {
  var d, f;
  if (Array.isArray(i))
    for (i = Array.prototype.slice.call(i), d = 0, f = i.length; d < f; d += 1)
      Array.isArray(i[d]) && x(e, "nested arrays are not supported inside keys"), typeof i == "object" && Ka(i[d]) === "[object Object]" && (i[d] = "[object Object]");
  if (typeof i == "object" && Ka(i) === "[object Object]" && (i = "[object Object]"), i = String(i), t === null && (t = {}), n === "tag:yaml.org,2002:merge")
    if (Array.isArray(o))
      for (d = 0, f = o.length; d < f; d += 1)
        Za(e, t, o[d], r);
    else
      Za(e, t, o, r);
  else
    !e.json && !gt.call(r, i) && gt.call(t, i) && (e.line = a || e.line, e.lineStart = s || e.lineStart, e.position = l || e.position, x(e, "duplicated mapping key")), i === "__proto__" ? Object.defineProperty(t, i, {
      configurable: !0,
      enumerable: !0,
      writable: !0,
      value: o
    }) : t[i] = o, delete r[i];
  return t;
}
function xo(e) {
  var t;
  t = e.input.charCodeAt(e.position), t === 10 ? e.position++ : t === 13 ? (e.position++, e.input.charCodeAt(e.position) === 10 && e.position++) : x(e, "a line break is expected"), e.line += 1, e.lineStart = e.position, e.firstTabInLine = -1;
}
function se(e, t, r) {
  for (var n = 0, i = e.input.charCodeAt(e.position); i !== 0; ) {
    for (; Nt(i); )
      i === 9 && e.firstTabInLine === -1 && (e.firstTabInLine = e.position), i = e.input.charCodeAt(++e.position);
    if (t && i === 35)
      do
        i = e.input.charCodeAt(++e.position);
      while (i !== 10 && i !== 13 && i !== 0);
    if (ze(i))
      for (xo(e), i = e.input.charCodeAt(e.position), n++, e.lineIndent = 0; i === 32; )
        e.lineIndent++, i = e.input.charCodeAt(++e.position);
    else
      break;
  }
  return r !== -1 && n !== 0 && e.lineIndent < r && Bn(e, "deficient indentation"), n;
}
function Zn(e) {
  var t = e.position, r;
  return r = e.input.charCodeAt(t), !!((r === 45 || r === 46) && r === e.input.charCodeAt(t + 1) && r === e.input.charCodeAt(t + 2) && (t += 3, r = e.input.charCodeAt(t), r === 0 || Re(r)));
}
function Lo(e, t) {
  t === 1 ? e.result += " " : t > 1 && (e.result += It.repeat(`
`, t - 1));
}
function mg(e, t, r) {
  var n, i, o, a, s, l, d, f, u = e.kind, p = e.result, g;
  if (g = e.input.charCodeAt(e.position), Re(g) || Yt(g) || g === 35 || g === 38 || g === 42 || g === 33 || g === 124 || g === 62 || g === 39 || g === 34 || g === 37 || g === 64 || g === 96 || (g === 63 || g === 45) && (i = e.input.charCodeAt(e.position + 1), Re(i) || r && Yt(i)))
    return !1;
  for (e.kind = "scalar", e.result = "", o = a = e.position, s = !1; g !== 0; ) {
    if (g === 58) {
      if (i = e.input.charCodeAt(e.position + 1), Re(i) || r && Yt(i))
        break;
    } else if (g === 35) {
      if (n = e.input.charCodeAt(e.position - 1), Re(n))
        break;
    } else {
      if (e.position === e.lineStart && Zn(e) || r && Yt(g))
        break;
      if (ze(g))
        if (l = e.line, d = e.lineStart, f = e.lineIndent, se(e, !1, -1), e.lineIndent >= t) {
          s = !0, g = e.input.charCodeAt(e.position);
          continue;
        } else {
          e.position = a, e.line = l, e.lineStart = d, e.lineIndent = f;
          break;
        }
    }
    s && (dt(e, o, a, !1), Lo(e, e.line - l), o = a = e.position, s = !1), Nt(g) || (a = e.position + 1), g = e.input.charCodeAt(++e.position);
  }
  return dt(e, o, a, !1), e.result ? !0 : (e.kind = u, e.result = p, !1);
}
function gg(e, t) {
  var r, n, i;
  if (r = e.input.charCodeAt(e.position), r !== 39)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, n = i = e.position; (r = e.input.charCodeAt(e.position)) !== 0; )
    if (r === 39)
      if (dt(e, n, e.position, !0), r = e.input.charCodeAt(++e.position), r === 39)
        n = e.position, e.position++, i = e.position;
      else
        return !0;
    else ze(r) ? (dt(e, n, i, !0), Lo(e, se(e, !1, t)), n = i = e.position) : e.position === e.lineStart && Zn(e) ? x(e, "unexpected end of the document within a single quoted scalar") : (e.position++, i = e.position);
  x(e, "unexpected end of the stream within a single quoted scalar");
}
function yg(e, t) {
  var r, n, i, o, a, s;
  if (s = e.input.charCodeAt(e.position), s !== 34)
    return !1;
  for (e.kind = "scalar", e.result = "", e.position++, r = n = e.position; (s = e.input.charCodeAt(e.position)) !== 0; ) {
    if (s === 34)
      return dt(e, r, e.position, !0), e.position++, !0;
    if (s === 92) {
      if (dt(e, r, e.position, !0), s = e.input.charCodeAt(++e.position), ze(s))
        se(e, !1, t);
      else if (s < 256 && Vc[s])
        e.result += Yc[s], e.position++;
      else if ((a = fg(s)) > 0) {
        for (i = a, o = 0; i > 0; i--)
          s = e.input.charCodeAt(++e.position), (a = ug(s)) >= 0 ? o = (o << 4) + a : x(e, "expected hexadecimal character");
        e.result += hg(o), e.position++;
      } else
        x(e, "unknown escape sequence");
      r = n = e.position;
    } else ze(s) ? (dt(e, r, n, !0), Lo(e, se(e, !1, t)), r = n = e.position) : e.position === e.lineStart && Zn(e) ? x(e, "unexpected end of the document within a double quoted scalar") : (e.position++, n = e.position);
  }
  x(e, "unexpected end of the stream within a double quoted scalar");
}
function Eg(e, t) {
  var r = !0, n, i, o, a = e.tag, s, l = e.anchor, d, f, u, p, g, E = /* @__PURE__ */ Object.create(null), S, _, T, A;
  if (A = e.input.charCodeAt(e.position), A === 91)
    f = 93, g = !1, s = [];
  else if (A === 123)
    f = 125, g = !0, s = {};
  else
    return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = s), A = e.input.charCodeAt(++e.position); A !== 0; ) {
    if (se(e, !0, t), A = e.input.charCodeAt(e.position), A === f)
      return e.position++, e.tag = a, e.anchor = l, e.kind = g ? "mapping" : "sequence", e.result = s, !0;
    r ? A === 44 && x(e, "expected the node content, but found ','") : x(e, "missed comma between flow collection entries"), _ = S = T = null, u = p = !1, A === 63 && (d = e.input.charCodeAt(e.position + 1), Re(d) && (u = p = !0, e.position++, se(e, !0, t))), n = e.line, i = e.lineStart, o = e.position, nr(e, t, kn, !1, !0), _ = e.tag, S = e.result, se(e, !0, t), A = e.input.charCodeAt(e.position), (p || e.line === n) && A === 58 && (u = !0, A = e.input.charCodeAt(++e.position), se(e, !0, t), nr(e, t, kn, !1, !0), T = e.result), g ? zt(e, s, E, _, S, T, n, i, o) : u ? s.push(zt(e, null, E, _, S, T, n, i, o)) : s.push(S), se(e, !0, t), A = e.input.charCodeAt(e.position), A === 44 ? (r = !0, A = e.input.charCodeAt(++e.position)) : r = !1;
  }
  x(e, "unexpected end of the stream within a flow collection");
}
function vg(e, t) {
  var r, n, i = Fi, o = !1, a = !1, s = t, l = 0, d = !1, f, u;
  if (u = e.input.charCodeAt(e.position), u === 124)
    n = !1;
  else if (u === 62)
    n = !0;
  else
    return !1;
  for (e.kind = "scalar", e.result = ""; u !== 0; )
    if (u = e.input.charCodeAt(++e.position), u === 43 || u === 45)
      Fi === i ? i = u === 43 ? Xa : ag : x(e, "repeat of a chomping mode identifier");
    else if ((f = dg(u)) >= 0)
      f === 0 ? x(e, "bad explicit indentation width of a block scalar; it cannot be less than one") : a ? x(e, "repeat of an indentation width identifier") : (s = t + f - 1, a = !0);
    else
      break;
  if (Nt(u)) {
    do
      u = e.input.charCodeAt(++e.position);
    while (Nt(u));
    if (u === 35)
      do
        u = e.input.charCodeAt(++e.position);
      while (!ze(u) && u !== 0);
  }
  for (; u !== 0; ) {
    for (xo(e), e.lineIndent = 0, u = e.input.charCodeAt(e.position); (!a || e.lineIndent < s) && u === 32; )
      e.lineIndent++, u = e.input.charCodeAt(++e.position);
    if (!a && e.lineIndent > s && (s = e.lineIndent), ze(u)) {
      l++;
      continue;
    }
    if (e.lineIndent < s) {
      i === Xa ? e.result += It.repeat(`
`, o ? 1 + l : l) : i === Fi && o && (e.result += `
`);
      break;
    }
    for (n ? Nt(u) ? (d = !0, e.result += It.repeat(`
`, o ? 1 + l : l)) : d ? (d = !1, e.result += It.repeat(`
`, l + 1)) : l === 0 ? o && (e.result += " ") : e.result += It.repeat(`
`, l) : e.result += It.repeat(`
`, o ? 1 + l : l), o = !0, a = !0, l = 0, r = e.position; !ze(u) && u !== 0; )
      u = e.input.charCodeAt(++e.position);
    dt(e, r, e.position, !1);
  }
  return !0;
}
function es(e, t) {
  var r, n = e.tag, i = e.anchor, o = [], a, s = !1, l;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = o), l = e.input.charCodeAt(e.position); l !== 0 && (e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, x(e, "tab characters must not be used in indentation")), !(l !== 45 || (a = e.input.charCodeAt(e.position + 1), !Re(a)))); ) {
    if (s = !0, e.position++, se(e, !0, -1) && e.lineIndent <= t) {
      o.push(null), l = e.input.charCodeAt(e.position);
      continue;
    }
    if (r = e.line, nr(e, t, qc, !1, !0), o.push(e.result), se(e, !0, -1), l = e.input.charCodeAt(e.position), (e.line === r || e.lineIndent > t) && l !== 0)
      x(e, "bad indentation of a sequence entry");
    else if (e.lineIndent < t)
      break;
  }
  return s ? (e.tag = n, e.anchor = i, e.kind = "sequence", e.result = o, !0) : !1;
}
function wg(e, t, r) {
  var n, i, o, a, s, l, d = e.tag, f = e.anchor, u = {}, p = /* @__PURE__ */ Object.create(null), g = null, E = null, S = null, _ = !1, T = !1, A;
  if (e.firstTabInLine !== -1) return !1;
  for (e.anchor !== null && (e.anchorMap[e.anchor] = u), A = e.input.charCodeAt(e.position); A !== 0; ) {
    if (!_ && e.firstTabInLine !== -1 && (e.position = e.firstTabInLine, x(e, "tab characters must not be used in indentation")), n = e.input.charCodeAt(e.position + 1), o = e.line, (A === 63 || A === 58) && Re(n))
      A === 63 ? (_ && (zt(e, u, p, g, E, null, a, s, l), g = E = S = null), T = !0, _ = !0, i = !0) : _ ? (_ = !1, i = !0) : x(e, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"), e.position += 1, A = n;
    else {
      if (a = e.line, s = e.lineStart, l = e.position, !nr(e, r, Hc, !1, !0))
        break;
      if (e.line === o) {
        for (A = e.input.charCodeAt(e.position); Nt(A); )
          A = e.input.charCodeAt(++e.position);
        if (A === 58)
          A = e.input.charCodeAt(++e.position), Re(A) || x(e, "a whitespace character is expected after the key-value separator within a block mapping"), _ && (zt(e, u, p, g, E, null, a, s, l), g = E = S = null), T = !0, _ = !1, i = !1, g = e.tag, E = e.result;
        else if (T)
          x(e, "can not read an implicit mapping pair; a colon is missed");
        else
          return e.tag = d, e.anchor = f, !0;
      } else if (T)
        x(e, "can not read a block mapping entry; a multiline key may not be an implicit key");
      else
        return e.tag = d, e.anchor = f, !0;
    }
    if ((e.line === o || e.lineIndent > t) && (_ && (a = e.line, s = e.lineStart, l = e.position), nr(e, t, Mn, !0, i) && (_ ? E = e.result : S = e.result), _ || (zt(e, u, p, g, E, S, a, s, l), g = E = S = null), se(e, !0, -1), A = e.input.charCodeAt(e.position)), (e.line === o || e.lineIndent > t) && A !== 0)
      x(e, "bad indentation of a mapping entry");
    else if (e.lineIndent < t)
      break;
  }
  return _ && zt(e, u, p, g, E, null, a, s, l), T && (e.tag = d, e.anchor = f, e.kind = "mapping", e.result = u), T;
}
function _g(e) {
  var t, r = !1, n = !1, i, o, a;
  if (a = e.input.charCodeAt(e.position), a !== 33) return !1;
  if (e.tag !== null && x(e, "duplication of a tag property"), a = e.input.charCodeAt(++e.position), a === 60 ? (r = !0, a = e.input.charCodeAt(++e.position)) : a === 33 ? (n = !0, i = "!!", a = e.input.charCodeAt(++e.position)) : i = "!", t = e.position, r) {
    do
      a = e.input.charCodeAt(++e.position);
    while (a !== 0 && a !== 62);
    e.position < e.length ? (o = e.input.slice(t, e.position), a = e.input.charCodeAt(++e.position)) : x(e, "unexpected end of the stream within a verbatim tag");
  } else {
    for (; a !== 0 && !Re(a); )
      a === 33 && (n ? x(e, "tag suffix cannot contain exclamation marks") : (i = e.input.slice(t - 1, e.position + 1), Gc.test(i) || x(e, "named tag handle cannot contain such characters"), n = !0, t = e.position + 1)), a = e.input.charCodeAt(++e.position);
    o = e.input.slice(t, e.position), cg.test(o) && x(e, "tag suffix cannot contain flow indicator characters");
  }
  o && !Wc.test(o) && x(e, "tag name cannot contain such characters: " + o);
  try {
    o = decodeURIComponent(o);
  } catch {
    x(e, "tag name is malformed: " + o);
  }
  return r ? e.tag = o : gt.call(e.tagMap, i) ? e.tag = e.tagMap[i] + o : i === "!" ? e.tag = "!" + o : i === "!!" ? e.tag = "tag:yaml.org,2002:" + o : x(e, 'undeclared tag handle "' + i + '"'), !0;
}
function Sg(e) {
  var t, r;
  if (r = e.input.charCodeAt(e.position), r !== 38) return !1;
  for (e.anchor !== null && x(e, "duplication of an anchor property"), r = e.input.charCodeAt(++e.position), t = e.position; r !== 0 && !Re(r) && !Yt(r); )
    r = e.input.charCodeAt(++e.position);
  return e.position === t && x(e, "name of an anchor node must contain at least one character"), e.anchor = e.input.slice(t, e.position), !0;
}
function Ag(e) {
  var t, r, n;
  if (n = e.input.charCodeAt(e.position), n !== 42) return !1;
  for (n = e.input.charCodeAt(++e.position), t = e.position; n !== 0 && !Re(n) && !Yt(n); )
    n = e.input.charCodeAt(++e.position);
  return e.position === t && x(e, "name of an alias node must contain at least one character"), r = e.input.slice(t, e.position), gt.call(e.anchorMap, r) || x(e, 'unidentified alias "' + r + '"'), e.result = e.anchorMap[r], se(e, !0, -1), !0;
}
function nr(e, t, r, n, i) {
  var o, a, s, l = 1, d = !1, f = !1, u, p, g, E, S, _;
  if (e.listener !== null && e.listener("open", e), e.tag = null, e.anchor = null, e.kind = null, e.result = null, o = a = s = Mn === r || qc === r, n && se(e, !0, -1) && (d = !0, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)), l === 1)
    for (; _g(e) || Sg(e); )
      se(e, !0, -1) ? (d = !0, s = o, e.lineIndent > t ? l = 1 : e.lineIndent === t ? l = 0 : e.lineIndent < t && (l = -1)) : s = !1;
  if (s && (s = d || i), (l === 1 || Mn === r) && (kn === r || Hc === r ? S = t : S = t + 1, _ = e.position - e.lineStart, l === 1 ? s && (es(e, _) || wg(e, _, S)) || Eg(e, S) ? f = !0 : (a && vg(e, S) || gg(e, S) || yg(e, S) ? f = !0 : Ag(e) ? (f = !0, (e.tag !== null || e.anchor !== null) && x(e, "alias node should not have any properties")) : mg(e, S, kn === r) && (f = !0, e.tag === null && (e.tag = "?")), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : l === 0 && (f = s && es(e, _))), e.tag === null)
    e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
  else if (e.tag === "?") {
    for (e.result !== null && e.kind !== "scalar" && x(e, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + e.kind + '"'), u = 0, p = e.implicitTypes.length; u < p; u += 1)
      if (E = e.implicitTypes[u], E.resolve(e.result)) {
        e.result = E.construct(e.result), e.tag = E.tag, e.anchor !== null && (e.anchorMap[e.anchor] = e.result);
        break;
      }
  } else if (e.tag !== "!") {
    if (gt.call(e.typeMap[e.kind || "fallback"], e.tag))
      E = e.typeMap[e.kind || "fallback"][e.tag];
    else
      for (E = null, g = e.typeMap.multi[e.kind || "fallback"], u = 0, p = g.length; u < p; u += 1)
        if (e.tag.slice(0, g[u].tag.length) === g[u].tag) {
          E = g[u];
          break;
        }
    E || x(e, "unknown tag !<" + e.tag + ">"), e.result !== null && E.kind !== e.kind && x(e, "unacceptable node kind for !<" + e.tag + '> tag; it should be "' + E.kind + '", not "' + e.kind + '"'), E.resolve(e.result, e.tag) ? (e.result = E.construct(e.result, e.tag), e.anchor !== null && (e.anchorMap[e.anchor] = e.result)) : x(e, "cannot resolve a node with !<" + e.tag + "> explicit tag");
  }
  return e.listener !== null && e.listener("close", e), e.tag !== null || e.anchor !== null || f;
}
function Tg(e) {
  var t = e.position, r, n, i, o = !1, a;
  for (e.version = null, e.checkLineBreaks = e.legacy, e.tagMap = /* @__PURE__ */ Object.create(null), e.anchorMap = /* @__PURE__ */ Object.create(null); (a = e.input.charCodeAt(e.position)) !== 0 && (se(e, !0, -1), a = e.input.charCodeAt(e.position), !(e.lineIndent > 0 || a !== 37)); ) {
    for (o = !0, a = e.input.charCodeAt(++e.position), r = e.position; a !== 0 && !Re(a); )
      a = e.input.charCodeAt(++e.position);
    for (n = e.input.slice(r, e.position), i = [], n.length < 1 && x(e, "directive name must not be less than one character in length"); a !== 0; ) {
      for (; Nt(a); )
        a = e.input.charCodeAt(++e.position);
      if (a === 35) {
        do
          a = e.input.charCodeAt(++e.position);
        while (a !== 0 && !ze(a));
        break;
      }
      if (ze(a)) break;
      for (r = e.position; a !== 0 && !Re(a); )
        a = e.input.charCodeAt(++e.position);
      i.push(e.input.slice(r, e.position));
    }
    a !== 0 && xo(e), gt.call(Qa, n) ? Qa[n](e, n, i) : Bn(e, 'unknown document directive "' + n + '"');
  }
  if (se(e, !0, -1), e.lineIndent === 0 && e.input.charCodeAt(e.position) === 45 && e.input.charCodeAt(e.position + 1) === 45 && e.input.charCodeAt(e.position + 2) === 45 ? (e.position += 3, se(e, !0, -1)) : o && x(e, "directives end mark is expected"), nr(e, e.lineIndent - 1, Mn, !1, !0), se(e, !0, -1), e.checkLineBreaks && lg.test(e.input.slice(t, e.position)) && Bn(e, "non-ASCII line breaks are interpreted as content"), e.documents.push(e.result), e.position === e.lineStart && Zn(e)) {
    e.input.charCodeAt(e.position) === 46 && (e.position += 3, se(e, !0, -1));
    return;
  }
  if (e.position < e.length - 1)
    x(e, "end of the stream or a document separator is expected");
  else
    return;
}
function Xc(e, t) {
  e = String(e), t = t || {}, e.length !== 0 && (e.charCodeAt(e.length - 1) !== 10 && e.charCodeAt(e.length - 1) !== 13 && (e += `
`), e.charCodeAt(0) === 65279 && (e = e.slice(1)));
  var r = new pg(e, t), n = e.indexOf("\0");
  for (n !== -1 && (r.position = n, x(r, "null byte is not allowed in input")), r.input += "\0"; r.input.charCodeAt(r.position) === 32; )
    r.lineIndent += 1, r.position += 1;
  for (; r.position < r.length - 1; )
    Tg(r);
  return r.documents;
}
function Cg(e, t, r) {
  t !== null && typeof t == "object" && typeof r > "u" && (r = t, t = null);
  var n = Xc(e, r);
  if (typeof t != "function")
    return n;
  for (var i = 0, o = n.length; i < o; i += 1)
    t(n[i]);
}
function bg(e, t) {
  var r = Xc(e, t);
  if (r.length !== 0) {
    if (r.length === 1)
      return r[0];
    throw new jc("expected a single document in the stream, but found more");
  }
}
No.loadAll = Cg;
No.load = bg;
var Kc = {}, ei = He, Yr = Vr, $g = Fo, Jc = Object.prototype.toString, Qc = Object.prototype.hasOwnProperty, Uo = 65279, Og = 9, Rr = 10, Ig = 13, Pg = 32, Rg = 33, Ng = 34, so = 35, Dg = 37, Fg = 38, xg = 39, Lg = 42, Zc = 44, Ug = 45, jn = 58, kg = 61, Mg = 62, Bg = 63, jg = 64, eu = 91, tu = 93, Hg = 96, ru = 123, qg = 124, nu = 125, _e = {};
_e[0] = "\\0";
_e[7] = "\\a";
_e[8] = "\\b";
_e[9] = "\\t";
_e[10] = "\\n";
_e[11] = "\\v";
_e[12] = "\\f";
_e[13] = "\\r";
_e[27] = "\\e";
_e[34] = '\\"';
_e[92] = "\\\\";
_e[133] = "\\N";
_e[160] = "\\_";
_e[8232] = "\\L";
_e[8233] = "\\P";
var Gg = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
], Wg = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function Vg(e, t) {
  var r, n, i, o, a, s, l;
  if (t === null) return {};
  for (r = {}, n = Object.keys(t), i = 0, o = n.length; i < o; i += 1)
    a = n[i], s = String(t[a]), a.slice(0, 2) === "!!" && (a = "tag:yaml.org,2002:" + a.slice(2)), l = e.compiledTypeMap.fallback[a], l && Qc.call(l.styleAliases, s) && (s = l.styleAliases[s]), r[a] = s;
  return r;
}
function Yg(e) {
  var t, r, n;
  if (t = e.toString(16).toUpperCase(), e <= 255)
    r = "x", n = 2;
  else if (e <= 65535)
    r = "u", n = 4;
  else if (e <= 4294967295)
    r = "U", n = 8;
  else
    throw new Yr("code point within a string may not be greater than 0xFFFFFFFF");
  return "\\" + r + ei.repeat("0", n - t.length) + t;
}
var zg = 1, Nr = 2;
function Xg(e) {
  this.schema = e.schema || $g, this.indent = Math.max(1, e.indent || 2), this.noArrayIndent = e.noArrayIndent || !1, this.skipInvalid = e.skipInvalid || !1, this.flowLevel = ei.isNothing(e.flowLevel) ? -1 : e.flowLevel, this.styleMap = Vg(this.schema, e.styles || null), this.sortKeys = e.sortKeys || !1, this.lineWidth = e.lineWidth || 80, this.noRefs = e.noRefs || !1, this.noCompatMode = e.noCompatMode || !1, this.condenseFlow = e.condenseFlow || !1, this.quotingType = e.quotingType === '"' ? Nr : zg, this.forceQuotes = e.forceQuotes || !1, this.replacer = typeof e.replacer == "function" ? e.replacer : null, this.implicitTypes = this.schema.compiledImplicit, this.explicitTypes = this.schema.compiledExplicit, this.tag = null, this.result = "", this.duplicates = [], this.usedDuplicates = null;
}
function ts(e, t) {
  for (var r = ei.repeat(" ", t), n = 0, i = -1, o = "", a, s = e.length; n < s; )
    i = e.indexOf(`
`, n), i === -1 ? (a = e.slice(n), n = s) : (a = e.slice(n, i + 1), n = i + 1), a.length && a !== `
` && (o += r), o += a;
  return o;
}
function lo(e, t) {
  return `
` + ei.repeat(" ", e.indent * t);
}
function Kg(e, t) {
  var r, n, i;
  for (r = 0, n = e.implicitTypes.length; r < n; r += 1)
    if (i = e.implicitTypes[r], i.resolve(t))
      return !0;
  return !1;
}
function Hn(e) {
  return e === Pg || e === Og;
}
function Dr(e) {
  return 32 <= e && e <= 126 || 161 <= e && e <= 55295 && e !== 8232 && e !== 8233 || 57344 <= e && e <= 65533 && e !== Uo || 65536 <= e && e <= 1114111;
}
function rs(e) {
  return Dr(e) && e !== Uo && e !== Ig && e !== Rr;
}
function ns(e, t, r) {
  var n = rs(e), i = n && !Hn(e);
  return (
    // ns-plain-safe
    (r ? (
      // c = flow-in
      n
    ) : n && e !== Zc && e !== eu && e !== tu && e !== ru && e !== nu) && e !== so && !(t === jn && !i) || rs(t) && !Hn(t) && e === so || t === jn && i
  );
}
function Jg(e) {
  return Dr(e) && e !== Uo && !Hn(e) && e !== Ug && e !== Bg && e !== jn && e !== Zc && e !== eu && e !== tu && e !== ru && e !== nu && e !== so && e !== Fg && e !== Lg && e !== Rg && e !== qg && e !== kg && e !== Mg && e !== xg && e !== Ng && e !== Dg && e !== jg && e !== Hg;
}
function Qg(e) {
  return !Hn(e) && e !== jn;
}
function wr(e, t) {
  var r = e.charCodeAt(t), n;
  return r >= 55296 && r <= 56319 && t + 1 < e.length && (n = e.charCodeAt(t + 1), n >= 56320 && n <= 57343) ? (r - 55296) * 1024 + n - 56320 + 65536 : r;
}
function iu(e) {
  var t = /^\n* /;
  return t.test(e);
}
var ou = 1, co = 2, au = 3, su = 4, Wt = 5;
function Zg(e, t, r, n, i, o, a, s) {
  var l, d = 0, f = null, u = !1, p = !1, g = n !== -1, E = -1, S = Jg(wr(e, 0)) && Qg(wr(e, e.length - 1));
  if (t || a)
    for (l = 0; l < e.length; d >= 65536 ? l += 2 : l++) {
      if (d = wr(e, l), !Dr(d))
        return Wt;
      S = S && ns(d, f, s), f = d;
    }
  else {
    for (l = 0; l < e.length; d >= 65536 ? l += 2 : l++) {
      if (d = wr(e, l), d === Rr)
        u = !0, g && (p = p || // Foldable line = too long, and not more-indented.
        l - E - 1 > n && e[E + 1] !== " ", E = l);
      else if (!Dr(d))
        return Wt;
      S = S && ns(d, f, s), f = d;
    }
    p = p || g && l - E - 1 > n && e[E + 1] !== " ";
  }
  return !u && !p ? S && !a && !i(e) ? ou : o === Nr ? Wt : co : r > 9 && iu(e) ? Wt : a ? o === Nr ? Wt : co : p ? su : au;
}
function e0(e, t, r, n, i) {
  e.dump = function() {
    if (t.length === 0)
      return e.quotingType === Nr ? '""' : "''";
    if (!e.noCompatMode && (Gg.indexOf(t) !== -1 || Wg.test(t)))
      return e.quotingType === Nr ? '"' + t + '"' : "'" + t + "'";
    var o = e.indent * Math.max(1, r), a = e.lineWidth === -1 ? -1 : Math.max(Math.min(e.lineWidth, 40), e.lineWidth - o), s = n || e.flowLevel > -1 && r >= e.flowLevel;
    function l(d) {
      return Kg(e, d);
    }
    switch (Zg(
      t,
      s,
      e.indent,
      a,
      l,
      e.quotingType,
      e.forceQuotes && !n,
      i
    )) {
      case ou:
        return t;
      case co:
        return "'" + t.replace(/'/g, "''") + "'";
      case au:
        return "|" + is(t, e.indent) + os(ts(t, o));
      case su:
        return ">" + is(t, e.indent) + os(ts(t0(t, a), o));
      case Wt:
        return '"' + r0(t) + '"';
      default:
        throw new Yr("impossible error: invalid scalar style");
    }
  }();
}
function is(e, t) {
  var r = iu(e) ? String(t) : "", n = e[e.length - 1] === `
`, i = n && (e[e.length - 2] === `
` || e === `
`), o = i ? "+" : n ? "" : "-";
  return r + o + `
`;
}
function os(e) {
  return e[e.length - 1] === `
` ? e.slice(0, -1) : e;
}
function t0(e, t) {
  for (var r = /(\n+)([^\n]*)/g, n = function() {
    var d = e.indexOf(`
`);
    return d = d !== -1 ? d : e.length, r.lastIndex = d, as(e.slice(0, d), t);
  }(), i = e[0] === `
` || e[0] === " ", o, a; a = r.exec(e); ) {
    var s = a[1], l = a[2];
    o = l[0] === " ", n += s + (!i && !o && l !== "" ? `
` : "") + as(l, t), i = o;
  }
  return n;
}
function as(e, t) {
  if (e === "" || e[0] === " ") return e;
  for (var r = / [^ ]/g, n, i = 0, o, a = 0, s = 0, l = ""; n = r.exec(e); )
    s = n.index, s - i > t && (o = a > i ? a : s, l += `
` + e.slice(i, o), i = o + 1), a = s;
  return l += `
`, e.length - i > t && a > i ? l += e.slice(i, a) + `
` + e.slice(a + 1) : l += e.slice(i), l.slice(1);
}
function r0(e) {
  for (var t = "", r = 0, n, i = 0; i < e.length; r >= 65536 ? i += 2 : i++)
    r = wr(e, i), n = _e[r], !n && Dr(r) ? (t += e[i], r >= 65536 && (t += e[i + 1])) : t += n || Yg(r);
  return t;
}
function n0(e, t, r) {
  var n = "", i = e.tag, o, a, s;
  for (o = 0, a = r.length; o < a; o += 1)
    s = r[o], e.replacer && (s = e.replacer.call(r, String(o), s)), (Ze(e, t, s, !1, !1) || typeof s > "u" && Ze(e, t, null, !1, !1)) && (n !== "" && (n += "," + (e.condenseFlow ? "" : " ")), n += e.dump);
  e.tag = i, e.dump = "[" + n + "]";
}
function ss(e, t, r, n) {
  var i = "", o = e.tag, a, s, l;
  for (a = 0, s = r.length; a < s; a += 1)
    l = r[a], e.replacer && (l = e.replacer.call(r, String(a), l)), (Ze(e, t + 1, l, !0, !0, !1, !0) || typeof l > "u" && Ze(e, t + 1, null, !0, !0, !1, !0)) && ((!n || i !== "") && (i += lo(e, t)), e.dump && Rr === e.dump.charCodeAt(0) ? i += "-" : i += "- ", i += e.dump);
  e.tag = o, e.dump = i || "[]";
}
function i0(e, t, r) {
  var n = "", i = e.tag, o = Object.keys(r), a, s, l, d, f;
  for (a = 0, s = o.length; a < s; a += 1)
    f = "", n !== "" && (f += ", "), e.condenseFlow && (f += '"'), l = o[a], d = r[l], e.replacer && (d = e.replacer.call(r, l, d)), Ze(e, t, l, !1, !1) && (e.dump.length > 1024 && (f += "? "), f += e.dump + (e.condenseFlow ? '"' : "") + ":" + (e.condenseFlow ? "" : " "), Ze(e, t, d, !1, !1) && (f += e.dump, n += f));
  e.tag = i, e.dump = "{" + n + "}";
}
function o0(e, t, r, n) {
  var i = "", o = e.tag, a = Object.keys(r), s, l, d, f, u, p;
  if (e.sortKeys === !0)
    a.sort();
  else if (typeof e.sortKeys == "function")
    a.sort(e.sortKeys);
  else if (e.sortKeys)
    throw new Yr("sortKeys must be a boolean or a function");
  for (s = 0, l = a.length; s < l; s += 1)
    p = "", (!n || i !== "") && (p += lo(e, t)), d = a[s], f = r[d], e.replacer && (f = e.replacer.call(r, d, f)), Ze(e, t + 1, d, !0, !0, !0) && (u = e.tag !== null && e.tag !== "?" || e.dump && e.dump.length > 1024, u && (e.dump && Rr === e.dump.charCodeAt(0) ? p += "?" : p += "? "), p += e.dump, u && (p += lo(e, t)), Ze(e, t + 1, f, !0, u) && (e.dump && Rr === e.dump.charCodeAt(0) ? p += ":" : p += ": ", p += e.dump, i += p));
  e.tag = o, e.dump = i || "{}";
}
function ls(e, t, r) {
  var n, i, o, a, s, l;
  for (i = r ? e.explicitTypes : e.implicitTypes, o = 0, a = i.length; o < a; o += 1)
    if (s = i[o], (s.instanceOf || s.predicate) && (!s.instanceOf || typeof t == "object" && t instanceof s.instanceOf) && (!s.predicate || s.predicate(t))) {
      if (r ? s.multi && s.representName ? e.tag = s.representName(t) : e.tag = s.tag : e.tag = "?", s.represent) {
        if (l = e.styleMap[s.tag] || s.defaultStyle, Jc.call(s.represent) === "[object Function]")
          n = s.represent(t, l);
        else if (Qc.call(s.represent, l))
          n = s.represent[l](t, l);
        else
          throw new Yr("!<" + s.tag + '> tag resolver accepts not "' + l + '" style');
        e.dump = n;
      }
      return !0;
    }
  return !1;
}
function Ze(e, t, r, n, i, o, a) {
  e.tag = null, e.dump = r, ls(e, r, !1) || ls(e, r, !0);
  var s = Jc.call(e.dump), l = n, d;
  n && (n = e.flowLevel < 0 || e.flowLevel > t);
  var f = s === "[object Object]" || s === "[object Array]", u, p;
  if (f && (u = e.duplicates.indexOf(r), p = u !== -1), (e.tag !== null && e.tag !== "?" || p || e.indent !== 2 && t > 0) && (i = !1), p && e.usedDuplicates[u])
    e.dump = "*ref_" + u;
  else {
    if (f && p && !e.usedDuplicates[u] && (e.usedDuplicates[u] = !0), s === "[object Object]")
      n && Object.keys(e.dump).length !== 0 ? (o0(e, t, e.dump, i), p && (e.dump = "&ref_" + u + e.dump)) : (i0(e, t, e.dump), p && (e.dump = "&ref_" + u + " " + e.dump));
    else if (s === "[object Array]")
      n && e.dump.length !== 0 ? (e.noArrayIndent && !a && t > 0 ? ss(e, t - 1, e.dump, i) : ss(e, t, e.dump, i), p && (e.dump = "&ref_" + u + e.dump)) : (n0(e, t, e.dump), p && (e.dump = "&ref_" + u + " " + e.dump));
    else if (s === "[object String]")
      e.tag !== "?" && e0(e, e.dump, t, o, l);
    else {
      if (s === "[object Undefined]")
        return !1;
      if (e.skipInvalid) return !1;
      throw new Yr("unacceptable kind of an object to dump " + s);
    }
    e.tag !== null && e.tag !== "?" && (d = encodeURI(
      e.tag[0] === "!" ? e.tag.slice(1) : e.tag
    ).replace(/!/g, "%21"), e.tag[0] === "!" ? d = "!" + d : d.slice(0, 18) === "tag:yaml.org,2002:" ? d = "!!" + d.slice(18) : d = "!<" + d + ">", e.dump = d + " " + e.dump);
  }
  return !0;
}
function a0(e, t) {
  var r = [], n = [], i, o;
  for (uo(e, r, n), i = 0, o = n.length; i < o; i += 1)
    t.duplicates.push(r[n[i]]);
  t.usedDuplicates = new Array(o);
}
function uo(e, t, r) {
  var n, i, o;
  if (e !== null && typeof e == "object")
    if (i = t.indexOf(e), i !== -1)
      r.indexOf(i) === -1 && r.push(i);
    else if (t.push(e), Array.isArray(e))
      for (i = 0, o = e.length; i < o; i += 1)
        uo(e[i], t, r);
    else
      for (n = Object.keys(e), i = 0, o = n.length; i < o; i += 1)
        uo(e[n[i]], t, r);
}
function s0(e, t) {
  t = t || {};
  var r = new Xg(t);
  r.noRefs || a0(e, r);
  var n = e;
  return r.replacer && (n = r.replacer.call({ "": n }, "", n)), Ze(r, 0, n, !0, !0) ? r.dump + `
` : "";
}
Kc.dump = s0;
var lu = No, l0 = Kc;
function ko(e, t) {
  return function() {
    throw new Error("Function yaml." + e + " is removed in js-yaml 4. Use yaml." + t + " instead, which is now safe by default.");
  };
}
ye.Type = Oe;
ye.Schema = _c;
ye.FAILSAFE_SCHEMA = Cc;
ye.JSON_SCHEMA = Rc;
ye.CORE_SCHEMA = Nc;
ye.DEFAULT_SCHEMA = Fo;
ye.load = lu.load;
ye.loadAll = lu.loadAll;
ye.dump = l0.dump;
ye.YAMLException = Vr;
ye.types = {
  binary: Uc,
  float: Pc,
  map: Tc,
  null: bc,
  pairs: Mc,
  set: Bc,
  timestamp: xc,
  bool: $c,
  int: Oc,
  merge: Lc,
  omap: kc,
  seq: Ac,
  str: Sc
};
ye.safeLoad = ko("safeLoad", "load");
ye.safeLoadAll = ko("safeLoadAll", "loadAll");
ye.safeDump = ko("safeDump", "dump");
var ti = {};
Object.defineProperty(ti, "__esModule", { value: !0 });
ti.Lazy = void 0;
class c0 {
  constructor(t) {
    this._value = null, this.creator = t;
  }
  get hasValue() {
    return this.creator == null;
  }
  get value() {
    if (this.creator == null)
      return this._value;
    const t = this.creator();
    return this.value = t, t;
  }
  set value(t) {
    this._value = t, this.creator = null;
  }
}
ti.Lazy = c0;
var fo = { exports: {} };
const u0 = "2.0.0", cu = 256, f0 = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
9007199254740991, d0 = 16, h0 = cu - 6, p0 = [
  "major",
  "premajor",
  "minor",
  "preminor",
  "patch",
  "prepatch",
  "prerelease"
];
var ri = {
  MAX_LENGTH: cu,
  MAX_SAFE_COMPONENT_LENGTH: d0,
  MAX_SAFE_BUILD_LENGTH: h0,
  MAX_SAFE_INTEGER: f0,
  RELEASE_TYPES: p0,
  SEMVER_SPEC_VERSION: u0,
  FLAG_INCLUDE_PRERELEASE: 1,
  FLAG_LOOSE: 2
};
const m0 = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...e) => console.error("SEMVER", ...e) : () => {
};
var ni = m0;
(function(e, t) {
  const {
    MAX_SAFE_COMPONENT_LENGTH: r,
    MAX_SAFE_BUILD_LENGTH: n,
    MAX_LENGTH: i
  } = ri, o = ni;
  t = e.exports = {};
  const a = t.re = [], s = t.safeRe = [], l = t.src = [], d = t.t = {};
  let f = 0;
  const u = "[a-zA-Z0-9-]", p = [
    ["\\s", 1],
    ["\\d", i],
    [u, n]
  ], g = (S) => {
    for (const [_, T] of p)
      S = S.split(`${_}*`).join(`${_}{0,${T}}`).split(`${_}+`).join(`${_}{1,${T}}`);
    return S;
  }, E = (S, _, T) => {
    const A = g(_), N = f++;
    o(S, N, _), d[S] = N, l[N] = _, a[N] = new RegExp(_, T ? "g" : void 0), s[N] = new RegExp(A, T ? "g" : void 0);
  };
  E("NUMERICIDENTIFIER", "0|[1-9]\\d*"), E("NUMERICIDENTIFIERLOOSE", "\\d+"), E("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${u}*`), E("MAINVERSION", `(${l[d.NUMERICIDENTIFIER]})\\.(${l[d.NUMERICIDENTIFIER]})\\.(${l[d.NUMERICIDENTIFIER]})`), E("MAINVERSIONLOOSE", `(${l[d.NUMERICIDENTIFIERLOOSE]})\\.(${l[d.NUMERICIDENTIFIERLOOSE]})\\.(${l[d.NUMERICIDENTIFIERLOOSE]})`), E("PRERELEASEIDENTIFIER", `(?:${l[d.NUMERICIDENTIFIER]}|${l[d.NONNUMERICIDENTIFIER]})`), E("PRERELEASEIDENTIFIERLOOSE", `(?:${l[d.NUMERICIDENTIFIERLOOSE]}|${l[d.NONNUMERICIDENTIFIER]})`), E("PRERELEASE", `(?:-(${l[d.PRERELEASEIDENTIFIER]}(?:\\.${l[d.PRERELEASEIDENTIFIER]})*))`), E("PRERELEASELOOSE", `(?:-?(${l[d.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${l[d.PRERELEASEIDENTIFIERLOOSE]})*))`), E("BUILDIDENTIFIER", `${u}+`), E("BUILD", `(?:\\+(${l[d.BUILDIDENTIFIER]}(?:\\.${l[d.BUILDIDENTIFIER]})*))`), E("FULLPLAIN", `v?${l[d.MAINVERSION]}${l[d.PRERELEASE]}?${l[d.BUILD]}?`), E("FULL", `^${l[d.FULLPLAIN]}$`), E("LOOSEPLAIN", `[v=\\s]*${l[d.MAINVERSIONLOOSE]}${l[d.PRERELEASELOOSE]}?${l[d.BUILD]}?`), E("LOOSE", `^${l[d.LOOSEPLAIN]}$`), E("GTLT", "((?:<|>)?=?)"), E("XRANGEIDENTIFIERLOOSE", `${l[d.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), E("XRANGEIDENTIFIER", `${l[d.NUMERICIDENTIFIER]}|x|X|\\*`), E("XRANGEPLAIN", `[v=\\s]*(${l[d.XRANGEIDENTIFIER]})(?:\\.(${l[d.XRANGEIDENTIFIER]})(?:\\.(${l[d.XRANGEIDENTIFIER]})(?:${l[d.PRERELEASE]})?${l[d.BUILD]}?)?)?`), E("XRANGEPLAINLOOSE", `[v=\\s]*(${l[d.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[d.XRANGEIDENTIFIERLOOSE]})(?:\\.(${l[d.XRANGEIDENTIFIERLOOSE]})(?:${l[d.PRERELEASELOOSE]})?${l[d.BUILD]}?)?)?`), E("XRANGE", `^${l[d.GTLT]}\\s*${l[d.XRANGEPLAIN]}$`), E("XRANGELOOSE", `^${l[d.GTLT]}\\s*${l[d.XRANGEPLAINLOOSE]}$`), E("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), E("COERCE", `${l[d.COERCEPLAIN]}(?:$|[^\\d])`), E("COERCEFULL", l[d.COERCEPLAIN] + `(?:${l[d.PRERELEASE]})?(?:${l[d.BUILD]})?(?:$|[^\\d])`), E("COERCERTL", l[d.COERCE], !0), E("COERCERTLFULL", l[d.COERCEFULL], !0), E("LONETILDE", "(?:~>?)"), E("TILDETRIM", `(\\s*)${l[d.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", E("TILDE", `^${l[d.LONETILDE]}${l[d.XRANGEPLAIN]}$`), E("TILDELOOSE", `^${l[d.LONETILDE]}${l[d.XRANGEPLAINLOOSE]}$`), E("LONECARET", "(?:\\^)"), E("CARETTRIM", `(\\s*)${l[d.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", E("CARET", `^${l[d.LONECARET]}${l[d.XRANGEPLAIN]}$`), E("CARETLOOSE", `^${l[d.LONECARET]}${l[d.XRANGEPLAINLOOSE]}$`), E("COMPARATORLOOSE", `^${l[d.GTLT]}\\s*(${l[d.LOOSEPLAIN]})$|^$`), E("COMPARATOR", `^${l[d.GTLT]}\\s*(${l[d.FULLPLAIN]})$|^$`), E("COMPARATORTRIM", `(\\s*)${l[d.GTLT]}\\s*(${l[d.LOOSEPLAIN]}|${l[d.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", E("HYPHENRANGE", `^\\s*(${l[d.XRANGEPLAIN]})\\s+-\\s+(${l[d.XRANGEPLAIN]})\\s*$`), E("HYPHENRANGELOOSE", `^\\s*(${l[d.XRANGEPLAINLOOSE]})\\s+-\\s+(${l[d.XRANGEPLAINLOOSE]})\\s*$`), E("STAR", "(<|>)?=?\\s*\\*"), E("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), E("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
})(fo, fo.exports);
var zr = fo.exports;
const g0 = Object.freeze({ loose: !0 }), y0 = Object.freeze({}), E0 = (e) => e ? typeof e != "object" ? g0 : e : y0;
var Mo = E0;
const cs = /^[0-9]+$/, uu = (e, t) => {
  const r = cs.test(e), n = cs.test(t);
  return r && n && (e = +e, t = +t), e === t ? 0 : r && !n ? -1 : n && !r ? 1 : e < t ? -1 : 1;
}, v0 = (e, t) => uu(t, e);
var fu = {
  compareIdentifiers: uu,
  rcompareIdentifiers: v0
};
const yn = ni, { MAX_LENGTH: us, MAX_SAFE_INTEGER: En } = ri, { safeRe: fs, t: ds } = zr, w0 = Mo, { compareIdentifiers: Bt } = fu;
let _0 = class Ye {
  constructor(t, r) {
    if (r = w0(r), t instanceof Ye) {
      if (t.loose === !!r.loose && t.includePrerelease === !!r.includePrerelease)
        return t;
      t = t.version;
    } else if (typeof t != "string")
      throw new TypeError(`Invalid version. Must be a string. Got type "${typeof t}".`);
    if (t.length > us)
      throw new TypeError(
        `version is longer than ${us} characters`
      );
    yn("SemVer", t, r), this.options = r, this.loose = !!r.loose, this.includePrerelease = !!r.includePrerelease;
    const n = t.trim().match(r.loose ? fs[ds.LOOSE] : fs[ds.FULL]);
    if (!n)
      throw new TypeError(`Invalid Version: ${t}`);
    if (this.raw = t, this.major = +n[1], this.minor = +n[2], this.patch = +n[3], this.major > En || this.major < 0)
      throw new TypeError("Invalid major version");
    if (this.minor > En || this.minor < 0)
      throw new TypeError("Invalid minor version");
    if (this.patch > En || this.patch < 0)
      throw new TypeError("Invalid patch version");
    n[4] ? this.prerelease = n[4].split(".").map((i) => {
      if (/^[0-9]+$/.test(i)) {
        const o = +i;
        if (o >= 0 && o < En)
          return o;
      }
      return i;
    }) : this.prerelease = [], this.build = n[5] ? n[5].split(".") : [], this.format();
  }
  format() {
    return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
  }
  toString() {
    return this.version;
  }
  compare(t) {
    if (yn("SemVer.compare", this.version, this.options, t), !(t instanceof Ye)) {
      if (typeof t == "string" && t === this.version)
        return 0;
      t = new Ye(t, this.options);
    }
    return t.version === this.version ? 0 : this.compareMain(t) || this.comparePre(t);
  }
  compareMain(t) {
    return t instanceof Ye || (t = new Ye(t, this.options)), Bt(this.major, t.major) || Bt(this.minor, t.minor) || Bt(this.patch, t.patch);
  }
  comparePre(t) {
    if (t instanceof Ye || (t = new Ye(t, this.options)), this.prerelease.length && !t.prerelease.length)
      return -1;
    if (!this.prerelease.length && t.prerelease.length)
      return 1;
    if (!this.prerelease.length && !t.prerelease.length)
      return 0;
    let r = 0;
    do {
      const n = this.prerelease[r], i = t.prerelease[r];
      if (yn("prerelease compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Bt(n, i);
    } while (++r);
  }
  compareBuild(t) {
    t instanceof Ye || (t = new Ye(t, this.options));
    let r = 0;
    do {
      const n = this.build[r], i = t.build[r];
      if (yn("build compare", r, n, i), n === void 0 && i === void 0)
        return 0;
      if (i === void 0)
        return 1;
      if (n === void 0)
        return -1;
      if (n === i)
        continue;
      return Bt(n, i);
    } while (++r);
  }
  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc(t, r, n) {
    switch (t) {
      case "premajor":
        this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", r, n);
        break;
      case "preminor":
        this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", r, n);
        break;
      case "prepatch":
        this.prerelease.length = 0, this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "prerelease":
        this.prerelease.length === 0 && this.inc("patch", r, n), this.inc("pre", r, n);
        break;
      case "major":
        (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
        break;
      case "minor":
        (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
        break;
      case "patch":
        this.prerelease.length === 0 && this.patch++, this.prerelease = [];
        break;
      case "pre": {
        const i = Number(n) ? 1 : 0;
        if (!r && n === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (this.prerelease.length === 0)
          this.prerelease = [i];
        else {
          let o = this.prerelease.length;
          for (; --o >= 0; )
            typeof this.prerelease[o] == "number" && (this.prerelease[o]++, o = -2);
          if (o === -1) {
            if (r === this.prerelease.join(".") && n === !1)
              throw new Error("invalid increment argument: identifier already exists");
            this.prerelease.push(i);
          }
        }
        if (r) {
          let o = [r, i];
          n === !1 && (o = [r]), Bt(this.prerelease[0], r) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = o) : this.prerelease = o;
        }
        break;
      }
      default:
        throw new Error(`invalid increment argument: ${t}`);
    }
    return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
  }
};
var Ie = _0;
const hs = Ie, S0 = (e, t, r = !1) => {
  if (e instanceof hs)
    return e;
  try {
    return new hs(e, t);
  } catch (n) {
    if (!r)
      return null;
    throw n;
  }
};
var sr = S0;
const A0 = sr, T0 = (e, t) => {
  const r = A0(e, t);
  return r ? r.version : null;
};
var C0 = T0;
const b0 = sr, $0 = (e, t) => {
  const r = b0(e.trim().replace(/^[=v]+/, ""), t);
  return r ? r.version : null;
};
var O0 = $0;
const ps = Ie, I0 = (e, t, r, n, i) => {
  typeof r == "string" && (i = n, n = r, r = void 0);
  try {
    return new ps(
      e instanceof ps ? e.version : e,
      r
    ).inc(t, n, i).version;
  } catch {
    return null;
  }
};
var P0 = I0;
const ms = sr, R0 = (e, t) => {
  const r = ms(e, null, !0), n = ms(t, null, !0), i = r.compare(n);
  if (i === 0)
    return null;
  const o = i > 0, a = o ? r : n, s = o ? n : r, l = !!a.prerelease.length;
  if (!!s.prerelease.length && !l)
    return !s.patch && !s.minor ? "major" : a.patch ? "patch" : a.minor ? "minor" : "major";
  const f = l ? "pre" : "";
  return r.major !== n.major ? f + "major" : r.minor !== n.minor ? f + "minor" : r.patch !== n.patch ? f + "patch" : "prerelease";
};
var N0 = R0;
const D0 = Ie, F0 = (e, t) => new D0(e, t).major;
var x0 = F0;
const L0 = Ie, U0 = (e, t) => new L0(e, t).minor;
var k0 = U0;
const M0 = Ie, B0 = (e, t) => new M0(e, t).patch;
var j0 = B0;
const H0 = sr, q0 = (e, t) => {
  const r = H0(e, t);
  return r && r.prerelease.length ? r.prerelease : null;
};
var G0 = q0;
const gs = Ie, W0 = (e, t, r) => new gs(e, r).compare(new gs(t, r));
var qe = W0;
const V0 = qe, Y0 = (e, t, r) => V0(t, e, r);
var z0 = Y0;
const X0 = qe, K0 = (e, t) => X0(e, t, !0);
var J0 = K0;
const ys = Ie, Q0 = (e, t, r) => {
  const n = new ys(e, r), i = new ys(t, r);
  return n.compare(i) || n.compareBuild(i);
};
var Bo = Q0;
const Z0 = Bo, ey = (e, t) => e.sort((r, n) => Z0(r, n, t));
var ty = ey;
const ry = Bo, ny = (e, t) => e.sort((r, n) => ry(n, r, t));
var iy = ny;
const oy = qe, ay = (e, t, r) => oy(e, t, r) > 0;
var ii = ay;
const sy = qe, ly = (e, t, r) => sy(e, t, r) < 0;
var jo = ly;
const cy = qe, uy = (e, t, r) => cy(e, t, r) === 0;
var du = uy;
const fy = qe, dy = (e, t, r) => fy(e, t, r) !== 0;
var hu = dy;
const hy = qe, py = (e, t, r) => hy(e, t, r) >= 0;
var Ho = py;
const my = qe, gy = (e, t, r) => my(e, t, r) <= 0;
var qo = gy;
const yy = du, Ey = hu, vy = ii, wy = Ho, _y = jo, Sy = qo, Ay = (e, t, r, n) => {
  switch (t) {
    case "===":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e === r;
    case "!==":
      return typeof e == "object" && (e = e.version), typeof r == "object" && (r = r.version), e !== r;
    case "":
    case "=":
    case "==":
      return yy(e, r, n);
    case "!=":
      return Ey(e, r, n);
    case ">":
      return vy(e, r, n);
    case ">=":
      return wy(e, r, n);
    case "<":
      return _y(e, r, n);
    case "<=":
      return Sy(e, r, n);
    default:
      throw new TypeError(`Invalid operator: ${t}`);
  }
};
var pu = Ay;
const Ty = Ie, Cy = sr, { safeRe: vn, t: wn } = zr, by = (e, t) => {
  if (e instanceof Ty)
    return e;
  if (typeof e == "number" && (e = String(e)), typeof e != "string")
    return null;
  t = t || {};
  let r = null;
  if (!t.rtl)
    r = e.match(t.includePrerelease ? vn[wn.COERCEFULL] : vn[wn.COERCE]);
  else {
    const l = t.includePrerelease ? vn[wn.COERCERTLFULL] : vn[wn.COERCERTL];
    let d;
    for (; (d = l.exec(e)) && (!r || r.index + r[0].length !== e.length); )
      (!r || d.index + d[0].length !== r.index + r[0].length) && (r = d), l.lastIndex = d.index + d[1].length + d[2].length;
    l.lastIndex = -1;
  }
  if (r === null)
    return null;
  const n = r[2], i = r[3] || "0", o = r[4] || "0", a = t.includePrerelease && r[5] ? `-${r[5]}` : "", s = t.includePrerelease && r[6] ? `+${r[6]}` : "";
  return Cy(`${n}.${i}.${o}${a}${s}`, t);
};
var $y = by;
class Oy {
  constructor() {
    this.max = 1e3, this.map = /* @__PURE__ */ new Map();
  }
  get(t) {
    const r = this.map.get(t);
    if (r !== void 0)
      return this.map.delete(t), this.map.set(t, r), r;
  }
  delete(t) {
    return this.map.delete(t);
  }
  set(t, r) {
    if (!this.delete(t) && r !== void 0) {
      if (this.map.size >= this.max) {
        const i = this.map.keys().next().value;
        this.delete(i);
      }
      this.map.set(t, r);
    }
    return this;
  }
}
var Iy = Oy, xi, Es;
function Ge() {
  if (Es) return xi;
  Es = 1;
  const e = /\s+/g;
  class t {
    constructor($, R) {
      if (R = i(R), $ instanceof t)
        return $.loose === !!R.loose && $.includePrerelease === !!R.includePrerelease ? $ : new t($.raw, R);
      if ($ instanceof o)
        return this.raw = $.value, this.set = [[$]], this.formatted = void 0, this;
      if (this.options = R, this.loose = !!R.loose, this.includePrerelease = !!R.includePrerelease, this.raw = $.trim().replace(e, " "), this.set = this.raw.split("||").map((b) => this.parseRange(b.trim())).filter((b) => b.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const b = this.set[0];
        if (this.set = this.set.filter((D) => !S(D[0])), this.set.length === 0)
          this.set = [b];
        else if (this.set.length > 1) {
          for (const D of this.set)
            if (D.length === 1 && _(D[0])) {
              this.set = [D];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let $ = 0; $ < this.set.length; $++) {
          $ > 0 && (this.formatted += "||");
          const R = this.set[$];
          for (let b = 0; b < R.length; b++)
            b > 0 && (this.formatted += " "), this.formatted += R[b].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange($) {
      const b = ((this.options.includePrerelease && g) | (this.options.loose && E)) + ":" + $, D = n.get(b);
      if (D)
        return D;
      const P = this.options.loose, k = P ? l[d.HYPHENRANGELOOSE] : l[d.HYPHENRANGE];
      $ = $.replace(k, M(this.options.includePrerelease)), a("hyphen replace", $), $ = $.replace(l[d.COMPARATORTRIM], f), a("comparator trim", $), $ = $.replace(l[d.TILDETRIM], u), a("tilde trim", $), $ = $.replace(l[d.CARETTRIM], p), a("caret trim", $);
      let G = $.split(" ").map((U) => A(U, this.options)).join(" ").split(/\s+/).map((U) => B(U, this.options));
      P && (G = G.filter((U) => (a("loose invalid filter", U, this.options), !!U.match(l[d.COMPARATORLOOSE])))), a("range list", G);
      const j = /* @__PURE__ */ new Map(), K = G.map((U) => new o(U, this.options));
      for (const U of K) {
        if (S(U))
          return [U];
        j.set(U.value, U);
      }
      j.size > 1 && j.has("") && j.delete("");
      const ue = [...j.values()];
      return n.set(b, ue), ue;
    }
    intersects($, R) {
      if (!($ instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((b) => T(b, R) && $.set.some((D) => T(D, R) && b.every((P) => D.every((k) => P.intersects(k, R)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test($) {
      if (!$)
        return !1;
      if (typeof $ == "string")
        try {
          $ = new s($, this.options);
        } catch {
          return !1;
        }
      for (let R = 0; R < this.set.length; R++)
        if (X(this.set[R], $, this.options))
          return !0;
      return !1;
    }
  }
  xi = t;
  const r = Iy, n = new r(), i = Mo, o = oi(), a = ni, s = Ie, {
    safeRe: l,
    t: d,
    comparatorTrimReplace: f,
    tildeTrimReplace: u,
    caretTrimReplace: p
  } = zr, { FLAG_INCLUDE_PRERELEASE: g, FLAG_LOOSE: E } = ri, S = (I) => I.value === "<0.0.0-0", _ = (I) => I.value === "", T = (I, $) => {
    let R = !0;
    const b = I.slice();
    let D = b.pop();
    for (; R && b.length; )
      R = b.every((P) => D.intersects(P, $)), D = b.pop();
    return R;
  }, A = (I, $) => (a("comp", I, $), I = ae(I, $), a("caret", I), I = L(I, $), a("tildes", I), I = Ne(I, $), a("xrange", I), I = q(I, $), a("stars", I), I), N = (I) => !I || I.toLowerCase() === "x" || I === "*", L = (I, $) => I.trim().split(/\s+/).map((R) => Z(R, $)).join(" "), Z = (I, $) => {
    const R = $.loose ? l[d.TILDELOOSE] : l[d.TILDE];
    return I.replace(R, (b, D, P, k, G) => {
      a("tilde", I, b, D, P, k, G);
      let j;
      return N(D) ? j = "" : N(P) ? j = `>=${D}.0.0 <${+D + 1}.0.0-0` : N(k) ? j = `>=${D}.${P}.0 <${D}.${+P + 1}.0-0` : G ? (a("replaceTilde pr", G), j = `>=${D}.${P}.${k}-${G} <${D}.${+P + 1}.0-0`) : j = `>=${D}.${P}.${k} <${D}.${+P + 1}.0-0`, a("tilde return", j), j;
    });
  }, ae = (I, $) => I.trim().split(/\s+/).map((R) => V(R, $)).join(" "), V = (I, $) => {
    a("caret", I, $);
    const R = $.loose ? l[d.CARETLOOSE] : l[d.CARET], b = $.includePrerelease ? "-0" : "";
    return I.replace(R, (D, P, k, G, j) => {
      a("caret", I, D, P, k, G, j);
      let K;
      return N(P) ? K = "" : N(k) ? K = `>=${P}.0.0${b} <${+P + 1}.0.0-0` : N(G) ? P === "0" ? K = `>=${P}.${k}.0${b} <${P}.${+k + 1}.0-0` : K = `>=${P}.${k}.0${b} <${+P + 1}.0.0-0` : j ? (a("replaceCaret pr", j), P === "0" ? k === "0" ? K = `>=${P}.${k}.${G}-${j} <${P}.${k}.${+G + 1}-0` : K = `>=${P}.${k}.${G}-${j} <${P}.${+k + 1}.0-0` : K = `>=${P}.${k}.${G}-${j} <${+P + 1}.0.0-0`) : (a("no pr"), P === "0" ? k === "0" ? K = `>=${P}.${k}.${G}${b} <${P}.${k}.${+G + 1}-0` : K = `>=${P}.${k}.${G}${b} <${P}.${+k + 1}.0-0` : K = `>=${P}.${k}.${G} <${+P + 1}.0.0-0`), a("caret return", K), K;
    });
  }, Ne = (I, $) => (a("replaceXRanges", I, $), I.split(/\s+/).map((R) => y(R, $)).join(" ")), y = (I, $) => {
    I = I.trim();
    const R = $.loose ? l[d.XRANGELOOSE] : l[d.XRANGE];
    return I.replace(R, (b, D, P, k, G, j) => {
      a("xRange", I, b, D, P, k, G, j);
      const K = N(P), ue = K || N(k), U = ue || N(G), We = U;
      return D === "=" && We && (D = ""), j = $.includePrerelease ? "-0" : "", K ? D === ">" || D === "<" ? b = "<0.0.0-0" : b = "*" : D && We ? (ue && (k = 0), G = 0, D === ">" ? (D = ">=", ue ? (P = +P + 1, k = 0, G = 0) : (k = +k + 1, G = 0)) : D === "<=" && (D = "<", ue ? P = +P + 1 : k = +k + 1), D === "<" && (j = "-0"), b = `${D + P}.${k}.${G}${j}`) : ue ? b = `>=${P}.0.0${j} <${+P + 1}.0.0-0` : U && (b = `>=${P}.${k}.0${j} <${P}.${+k + 1}.0-0`), a("xRange return", b), b;
    });
  }, q = (I, $) => (a("replaceStars", I, $), I.trim().replace(l[d.STAR], "")), B = (I, $) => (a("replaceGTE0", I, $), I.trim().replace(l[$.includePrerelease ? d.GTE0PRE : d.GTE0], "")), M = (I) => ($, R, b, D, P, k, G, j, K, ue, U, We) => (N(b) ? R = "" : N(D) ? R = `>=${b}.0.0${I ? "-0" : ""}` : N(P) ? R = `>=${b}.${D}.0${I ? "-0" : ""}` : k ? R = `>=${R}` : R = `>=${R}${I ? "-0" : ""}`, N(K) ? j = "" : N(ue) ? j = `<${+K + 1}.0.0-0` : N(U) ? j = `<${K}.${+ue + 1}.0-0` : We ? j = `<=${K}.${ue}.${U}-${We}` : I ? j = `<${K}.${ue}.${+U + 1}-0` : j = `<=${j}`, `${R} ${j}`.trim()), X = (I, $, R) => {
    for (let b = 0; b < I.length; b++)
      if (!I[b].test($))
        return !1;
    if ($.prerelease.length && !R.includePrerelease) {
      for (let b = 0; b < I.length; b++)
        if (a(I[b].semver), I[b].semver !== o.ANY && I[b].semver.prerelease.length > 0) {
          const D = I[b].semver;
          if (D.major === $.major && D.minor === $.minor && D.patch === $.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return xi;
}
var Li, vs;
function oi() {
  if (vs) return Li;
  vs = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(f, u) {
      if (u = r(u), f instanceof t) {
        if (f.loose === !!u.loose)
          return f;
        f = f.value;
      }
      f = f.trim().split(/\s+/).join(" "), a("comparator", f, u), this.options = u, this.loose = !!u.loose, this.parse(f), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, a("comp", this);
    }
    parse(f) {
      const u = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], p = f.match(u);
      if (!p)
        throw new TypeError(`Invalid comparator: ${f}`);
      this.operator = p[1] !== void 0 ? p[1] : "", this.operator === "=" && (this.operator = ""), p[2] ? this.semver = new s(p[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(f) {
      if (a("Comparator.test", f, this.options.loose), this.semver === e || f === e)
        return !0;
      if (typeof f == "string")
        try {
          f = new s(f, this.options);
        } catch {
          return !1;
        }
      return o(f, this.operator, this.semver, this.options);
    }
    intersects(f, u) {
      if (!(f instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new l(f.value, u).test(this.value) : f.operator === "" ? f.value === "" ? !0 : new l(this.value, u).test(f.semver) : (u = r(u), u.includePrerelease && (this.value === "<0.0.0-0" || f.value === "<0.0.0-0") || !u.includePrerelease && (this.value.startsWith("<0.0.0") || f.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && f.operator.startsWith(">") || this.operator.startsWith("<") && f.operator.startsWith("<") || this.semver.version === f.semver.version && this.operator.includes("=") && f.operator.includes("=") || o(this.semver, "<", f.semver, u) && this.operator.startsWith(">") && f.operator.startsWith("<") || o(this.semver, ">", f.semver, u) && this.operator.startsWith("<") && f.operator.startsWith(">")));
    }
  }
  Li = t;
  const r = Mo, { safeRe: n, t: i } = zr, o = pu, a = ni, s = Ie, l = Ge();
  return Li;
}
const Py = Ge(), Ry = (e, t, r) => {
  try {
    t = new Py(t, r);
  } catch {
    return !1;
  }
  return t.test(e);
};
var ai = Ry;
const Ny = Ge(), Dy = (e, t) => new Ny(e, t).set.map((r) => r.map((n) => n.value).join(" ").trim().split(" "));
var Fy = Dy;
const xy = Ie, Ly = Ge(), Uy = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new Ly(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === -1) && (n = a, i = new xy(n, r));
  }), n;
};
var ky = Uy;
const My = Ie, By = Ge(), jy = (e, t, r) => {
  let n = null, i = null, o = null;
  try {
    o = new By(t, r);
  } catch {
    return null;
  }
  return e.forEach((a) => {
    o.test(a) && (!n || i.compare(a) === 1) && (n = a, i = new My(n, r));
  }), n;
};
var Hy = jy;
const Ui = Ie, qy = Ge(), ws = ii, Gy = (e, t) => {
  e = new qy(e, t);
  let r = new Ui("0.0.0");
  if (e.test(r) || (r = new Ui("0.0.0-0"), e.test(r)))
    return r;
  r = null;
  for (let n = 0; n < e.set.length; ++n) {
    const i = e.set[n];
    let o = null;
    i.forEach((a) => {
      const s = new Ui(a.semver.version);
      switch (a.operator) {
        case ">":
          s.prerelease.length === 0 ? s.patch++ : s.prerelease.push(0), s.raw = s.format();
        case "":
        case ">=":
          (!o || ws(s, o)) && (o = s);
          break;
        case "<":
        case "<=":
          break;
        default:
          throw new Error(`Unexpected operation: ${a.operator}`);
      }
    }), o && (!r || ws(r, o)) && (r = o);
  }
  return r && e.test(r) ? r : null;
};
var Wy = Gy;
const Vy = Ge(), Yy = (e, t) => {
  try {
    return new Vy(e, t).range || "*";
  } catch {
    return null;
  }
};
var zy = Yy;
const Xy = Ie, mu = oi(), { ANY: Ky } = mu, Jy = Ge(), Qy = ai, _s = ii, Ss = jo, Zy = qo, eE = Ho, tE = (e, t, r, n) => {
  e = new Xy(e, n), t = new Jy(t, n);
  let i, o, a, s, l;
  switch (r) {
    case ">":
      i = _s, o = Zy, a = Ss, s = ">", l = ">=";
      break;
    case "<":
      i = Ss, o = eE, a = _s, s = "<", l = "<=";
      break;
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"');
  }
  if (Qy(e, t, n))
    return !1;
  for (let d = 0; d < t.set.length; ++d) {
    const f = t.set[d];
    let u = null, p = null;
    if (f.forEach((g) => {
      g.semver === Ky && (g = new mu(">=0.0.0")), u = u || g, p = p || g, i(g.semver, u.semver, n) ? u = g : a(g.semver, p.semver, n) && (p = g);
    }), u.operator === s || u.operator === l || (!p.operator || p.operator === s) && o(e, p.semver))
      return !1;
    if (p.operator === l && a(e, p.semver))
      return !1;
  }
  return !0;
};
var Go = tE;
const rE = Go, nE = (e, t, r) => rE(e, t, ">", r);
var iE = nE;
const oE = Go, aE = (e, t, r) => oE(e, t, "<", r);
var sE = aE;
const As = Ge(), lE = (e, t, r) => (e = new As(e, r), t = new As(t, r), e.intersects(t, r));
var cE = lE;
const uE = ai, fE = qe;
var dE = (e, t, r) => {
  const n = [];
  let i = null, o = null;
  const a = e.sort((f, u) => fE(f, u, r));
  for (const f of a)
    uE(f, t, r) ? (o = f, i || (i = f)) : (o && n.push([i, o]), o = null, i = null);
  i && n.push([i, null]);
  const s = [];
  for (const [f, u] of n)
    f === u ? s.push(f) : !u && f === a[0] ? s.push("*") : u ? f === a[0] ? s.push(`<=${u}`) : s.push(`${f} - ${u}`) : s.push(`>=${f}`);
  const l = s.join(" || "), d = typeof t.raw == "string" ? t.raw : String(t);
  return l.length < d.length ? l : t;
};
const Ts = Ge(), Wo = oi(), { ANY: ki } = Wo, gr = ai, Vo = qe, hE = (e, t, r = {}) => {
  if (e === t)
    return !0;
  e = new Ts(e, r), t = new Ts(t, r);
  let n = !1;
  e: for (const i of e.set) {
    for (const o of t.set) {
      const a = mE(i, o, r);
      if (n = n || a !== null, a)
        continue e;
    }
    if (n)
      return !1;
  }
  return !0;
}, pE = [new Wo(">=0.0.0-0")], Cs = [new Wo(">=0.0.0")], mE = (e, t, r) => {
  if (e === t)
    return !0;
  if (e.length === 1 && e[0].semver === ki) {
    if (t.length === 1 && t[0].semver === ki)
      return !0;
    r.includePrerelease ? e = pE : e = Cs;
  }
  if (t.length === 1 && t[0].semver === ki) {
    if (r.includePrerelease)
      return !0;
    t = Cs;
  }
  const n = /* @__PURE__ */ new Set();
  let i, o;
  for (const g of e)
    g.operator === ">" || g.operator === ">=" ? i = bs(i, g, r) : g.operator === "<" || g.operator === "<=" ? o = $s(o, g, r) : n.add(g.semver);
  if (n.size > 1)
    return null;
  let a;
  if (i && o) {
    if (a = Vo(i.semver, o.semver, r), a > 0)
      return null;
    if (a === 0 && (i.operator !== ">=" || o.operator !== "<="))
      return null;
  }
  for (const g of n) {
    if (i && !gr(g, String(i), r) || o && !gr(g, String(o), r))
      return null;
    for (const E of t)
      if (!gr(g, String(E), r))
        return !1;
    return !0;
  }
  let s, l, d, f, u = o && !r.includePrerelease && o.semver.prerelease.length ? o.semver : !1, p = i && !r.includePrerelease && i.semver.prerelease.length ? i.semver : !1;
  u && u.prerelease.length === 1 && o.operator === "<" && u.prerelease[0] === 0 && (u = !1);
  for (const g of t) {
    if (f = f || g.operator === ">" || g.operator === ">=", d = d || g.operator === "<" || g.operator === "<=", i) {
      if (p && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === p.major && g.semver.minor === p.minor && g.semver.patch === p.patch && (p = !1), g.operator === ">" || g.operator === ">=") {
        if (s = bs(i, g, r), s === g && s !== i)
          return !1;
      } else if (i.operator === ">=" && !gr(i.semver, String(g), r))
        return !1;
    }
    if (o) {
      if (u && g.semver.prerelease && g.semver.prerelease.length && g.semver.major === u.major && g.semver.minor === u.minor && g.semver.patch === u.patch && (u = !1), g.operator === "<" || g.operator === "<=") {
        if (l = $s(o, g, r), l === g && l !== o)
          return !1;
      } else if (o.operator === "<=" && !gr(o.semver, String(g), r))
        return !1;
    }
    if (!g.operator && (o || i) && a !== 0)
      return !1;
  }
  return !(i && d && !o && a !== 0 || o && f && !i && a !== 0 || p || u);
}, bs = (e, t, r) => {
  if (!e)
    return t;
  const n = Vo(e.semver, t.semver, r);
  return n > 0 ? e : n < 0 || t.operator === ">" && e.operator === ">=" ? t : e;
}, $s = (e, t, r) => {
  if (!e)
    return t;
  const n = Vo(e.semver, t.semver, r);
  return n < 0 ? e : n > 0 || t.operator === "<" && e.operator === "<=" ? t : e;
};
var gE = hE;
const Mi = zr, Os = ri, yE = Ie, Is = fu, EE = sr, vE = C0, wE = O0, _E = P0, SE = N0, AE = x0, TE = k0, CE = j0, bE = G0, $E = qe, OE = z0, IE = J0, PE = Bo, RE = ty, NE = iy, DE = ii, FE = jo, xE = du, LE = hu, UE = Ho, kE = qo, ME = pu, BE = $y, jE = oi(), HE = Ge(), qE = ai, GE = Fy, WE = ky, VE = Hy, YE = Wy, zE = zy, XE = Go, KE = iE, JE = sE, QE = cE, ZE = dE, ev = gE;
var gu = {
  parse: EE,
  valid: vE,
  clean: wE,
  inc: _E,
  diff: SE,
  major: AE,
  minor: TE,
  patch: CE,
  prerelease: bE,
  compare: $E,
  rcompare: OE,
  compareLoose: IE,
  compareBuild: PE,
  sort: RE,
  rsort: NE,
  gt: DE,
  lt: FE,
  eq: xE,
  neq: LE,
  gte: UE,
  lte: kE,
  cmp: ME,
  coerce: BE,
  Comparator: jE,
  Range: HE,
  satisfies: qE,
  toComparators: GE,
  maxSatisfying: WE,
  minSatisfying: VE,
  minVersion: YE,
  validRange: zE,
  outside: XE,
  gtr: KE,
  ltr: JE,
  intersects: QE,
  simplifyRange: ZE,
  subset: ev,
  SemVer: yE,
  re: Mi.re,
  src: Mi.src,
  tokens: Mi.t,
  SEMVER_SPEC_VERSION: Os.SEMVER_SPEC_VERSION,
  RELEASE_TYPES: Os.RELEASE_TYPES,
  compareIdentifiers: Is.compareIdentifiers,
  rcompareIdentifiers: Is.rcompareIdentifiers
}, Xr = {}, qn = { exports: {} };
qn.exports;
(function(e, t) {
  var r = 200, n = "__lodash_hash_undefined__", i = 1, o = 2, a = 9007199254740991, s = "[object Arguments]", l = "[object Array]", d = "[object AsyncFunction]", f = "[object Boolean]", u = "[object Date]", p = "[object Error]", g = "[object Function]", E = "[object GeneratorFunction]", S = "[object Map]", _ = "[object Number]", T = "[object Null]", A = "[object Object]", N = "[object Promise]", L = "[object Proxy]", Z = "[object RegExp]", ae = "[object Set]", V = "[object String]", Ne = "[object Symbol]", y = "[object Undefined]", q = "[object WeakMap]", B = "[object ArrayBuffer]", M = "[object DataView]", X = "[object Float32Array]", I = "[object Float64Array]", $ = "[object Int8Array]", R = "[object Int16Array]", b = "[object Int32Array]", D = "[object Uint8Array]", P = "[object Uint8ClampedArray]", k = "[object Uint16Array]", G = "[object Uint32Array]", j = /[\\^$.*+?()[\]{}|]/g, K = /^\[object .+?Constructor\]$/, ue = /^(?:0|[1-9]\d*)$/, U = {};
  U[X] = U[I] = U[$] = U[R] = U[b] = U[D] = U[P] = U[k] = U[G] = !0, U[s] = U[l] = U[B] = U[f] = U[M] = U[u] = U[p] = U[g] = U[S] = U[_] = U[A] = U[Z] = U[ae] = U[V] = U[q] = !1;
  var We = typeof Ae == "object" && Ae && Ae.Object === Object && Ae, h = typeof self == "object" && self && self.Object === Object && self, c = We || h || Function("return this")(), C = t && !t.nodeType && t, w = C && !0 && e && !e.nodeType && e, Y = w && w.exports === C, te = Y && We.process, ie = function() {
    try {
      return te && te.binding && te.binding("util");
    } catch {
    }
  }(), pe = ie && ie.isTypedArray;
  function Ee(m, v) {
    for (var O = -1, F = m == null ? 0 : m.length, Q = 0, H = []; ++O < F; ) {
      var oe = m[O];
      v(oe, O, m) && (H[Q++] = oe);
    }
    return H;
  }
  function nt(m, v) {
    for (var O = -1, F = v.length, Q = m.length; ++O < F; )
      m[Q + O] = v[O];
    return m;
  }
  function le(m, v) {
    for (var O = -1, F = m == null ? 0 : m.length; ++O < F; )
      if (v(m[O], O, m))
        return !0;
    return !1;
  }
  function Me(m, v) {
    for (var O = -1, F = Array(m); ++O < m; )
      F[O] = v(O);
    return F;
  }
  function mi(m) {
    return function(v) {
      return m(v);
    };
  }
  function en(m, v) {
    return m.has(v);
  }
  function cr(m, v) {
    return m == null ? void 0 : m[v];
  }
  function tn(m) {
    var v = -1, O = Array(m.size);
    return m.forEach(function(F, Q) {
      O[++v] = [Q, F];
    }), O;
  }
  function Ru(m, v) {
    return function(O) {
      return m(v(O));
    };
  }
  function Nu(m) {
    var v = -1, O = Array(m.size);
    return m.forEach(function(F) {
      O[++v] = F;
    }), O;
  }
  var Du = Array.prototype, Fu = Function.prototype, rn = Object.prototype, gi = c["__core-js_shared__"], Qo = Fu.toString, Ve = rn.hasOwnProperty, Zo = function() {
    var m = /[^.]+$/.exec(gi && gi.keys && gi.keys.IE_PROTO || "");
    return m ? "Symbol(src)_1." + m : "";
  }(), ea = rn.toString, xu = RegExp(
    "^" + Qo.call(Ve).replace(j, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  ), ta = Y ? c.Buffer : void 0, nn = c.Symbol, ra = c.Uint8Array, na = rn.propertyIsEnumerable, Lu = Du.splice, _t = nn ? nn.toStringTag : void 0, ia = Object.getOwnPropertySymbols, Uu = ta ? ta.isBuffer : void 0, ku = Ru(Object.keys, Object), yi = Ut(c, "DataView"), ur = Ut(c, "Map"), Ei = Ut(c, "Promise"), vi = Ut(c, "Set"), wi = Ut(c, "WeakMap"), fr = Ut(Object, "create"), Mu = Tt(yi), Bu = Tt(ur), ju = Tt(Ei), Hu = Tt(vi), qu = Tt(wi), oa = nn ? nn.prototype : void 0, _i = oa ? oa.valueOf : void 0;
  function St(m) {
    var v = -1, O = m == null ? 0 : m.length;
    for (this.clear(); ++v < O; ) {
      var F = m[v];
      this.set(F[0], F[1]);
    }
  }
  function Gu() {
    this.__data__ = fr ? fr(null) : {}, this.size = 0;
  }
  function Wu(m) {
    var v = this.has(m) && delete this.__data__[m];
    return this.size -= v ? 1 : 0, v;
  }
  function Vu(m) {
    var v = this.__data__;
    if (fr) {
      var O = v[m];
      return O === n ? void 0 : O;
    }
    return Ve.call(v, m) ? v[m] : void 0;
  }
  function Yu(m) {
    var v = this.__data__;
    return fr ? v[m] !== void 0 : Ve.call(v, m);
  }
  function zu(m, v) {
    var O = this.__data__;
    return this.size += this.has(m) ? 0 : 1, O[m] = fr && v === void 0 ? n : v, this;
  }
  St.prototype.clear = Gu, St.prototype.delete = Wu, St.prototype.get = Vu, St.prototype.has = Yu, St.prototype.set = zu;
  function Ke(m) {
    var v = -1, O = m == null ? 0 : m.length;
    for (this.clear(); ++v < O; ) {
      var F = m[v];
      this.set(F[0], F[1]);
    }
  }
  function Xu() {
    this.__data__ = [], this.size = 0;
  }
  function Ku(m) {
    var v = this.__data__, O = an(v, m);
    if (O < 0)
      return !1;
    var F = v.length - 1;
    return O == F ? v.pop() : Lu.call(v, O, 1), --this.size, !0;
  }
  function Ju(m) {
    var v = this.__data__, O = an(v, m);
    return O < 0 ? void 0 : v[O][1];
  }
  function Qu(m) {
    return an(this.__data__, m) > -1;
  }
  function Zu(m, v) {
    var O = this.__data__, F = an(O, m);
    return F < 0 ? (++this.size, O.push([m, v])) : O[F][1] = v, this;
  }
  Ke.prototype.clear = Xu, Ke.prototype.delete = Ku, Ke.prototype.get = Ju, Ke.prototype.has = Qu, Ke.prototype.set = Zu;
  function At(m) {
    var v = -1, O = m == null ? 0 : m.length;
    for (this.clear(); ++v < O; ) {
      var F = m[v];
      this.set(F[0], F[1]);
    }
  }
  function ef() {
    this.size = 0, this.__data__ = {
      hash: new St(),
      map: new (ur || Ke)(),
      string: new St()
    };
  }
  function tf(m) {
    var v = sn(this, m).delete(m);
    return this.size -= v ? 1 : 0, v;
  }
  function rf(m) {
    return sn(this, m).get(m);
  }
  function nf(m) {
    return sn(this, m).has(m);
  }
  function of(m, v) {
    var O = sn(this, m), F = O.size;
    return O.set(m, v), this.size += O.size == F ? 0 : 1, this;
  }
  At.prototype.clear = ef, At.prototype.delete = tf, At.prototype.get = rf, At.prototype.has = nf, At.prototype.set = of;
  function on(m) {
    var v = -1, O = m == null ? 0 : m.length;
    for (this.__data__ = new At(); ++v < O; )
      this.add(m[v]);
  }
  function af(m) {
    return this.__data__.set(m, n), this;
  }
  function sf(m) {
    return this.__data__.has(m);
  }
  on.prototype.add = on.prototype.push = af, on.prototype.has = sf;
  function it(m) {
    var v = this.__data__ = new Ke(m);
    this.size = v.size;
  }
  function lf() {
    this.__data__ = new Ke(), this.size = 0;
  }
  function cf(m) {
    var v = this.__data__, O = v.delete(m);
    return this.size = v.size, O;
  }
  function uf(m) {
    return this.__data__.get(m);
  }
  function ff(m) {
    return this.__data__.has(m);
  }
  function df(m, v) {
    var O = this.__data__;
    if (O instanceof Ke) {
      var F = O.__data__;
      if (!ur || F.length < r - 1)
        return F.push([m, v]), this.size = ++O.size, this;
      O = this.__data__ = new At(F);
    }
    return O.set(m, v), this.size = O.size, this;
  }
  it.prototype.clear = lf, it.prototype.delete = cf, it.prototype.get = uf, it.prototype.has = ff, it.prototype.set = df;
  function hf(m, v) {
    var O = ln(m), F = !O && Of(m), Q = !O && !F && Si(m), H = !O && !F && !Q && pa(m), oe = O || F || Q || H, fe = oe ? Me(m.length, String) : [], me = fe.length;
    for (var re in m)
      Ve.call(m, re) && !(oe && // Safari 9 has enumerable `arguments.length` in strict mode.
      (re == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      Q && (re == "offset" || re == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      H && (re == "buffer" || re == "byteLength" || re == "byteOffset") || // Skip index properties.
      Af(re, me))) && fe.push(re);
    return fe;
  }
  function an(m, v) {
    for (var O = m.length; O--; )
      if (ua(m[O][0], v))
        return O;
    return -1;
  }
  function pf(m, v, O) {
    var F = v(m);
    return ln(m) ? F : nt(F, O(m));
  }
  function dr(m) {
    return m == null ? m === void 0 ? y : T : _t && _t in Object(m) ? _f(m) : $f(m);
  }
  function aa(m) {
    return hr(m) && dr(m) == s;
  }
  function sa(m, v, O, F, Q) {
    return m === v ? !0 : m == null || v == null || !hr(m) && !hr(v) ? m !== m && v !== v : mf(m, v, O, F, sa, Q);
  }
  function mf(m, v, O, F, Q, H) {
    var oe = ln(m), fe = ln(v), me = oe ? l : ot(m), re = fe ? l : ot(v);
    me = me == s ? A : me, re = re == s ? A : re;
    var De = me == A, Be = re == A, ve = me == re;
    if (ve && Si(m)) {
      if (!Si(v))
        return !1;
      oe = !0, De = !1;
    }
    if (ve && !De)
      return H || (H = new it()), oe || pa(m) ? la(m, v, O, F, Q, H) : vf(m, v, me, O, F, Q, H);
    if (!(O & i)) {
      var Fe = De && Ve.call(m, "__wrapped__"), xe = Be && Ve.call(v, "__wrapped__");
      if (Fe || xe) {
        var at = Fe ? m.value() : m, Je = xe ? v.value() : v;
        return H || (H = new it()), Q(at, Je, O, F, H);
      }
    }
    return ve ? (H || (H = new it()), wf(m, v, O, F, Q, H)) : !1;
  }
  function gf(m) {
    if (!ha(m) || Cf(m))
      return !1;
    var v = fa(m) ? xu : K;
    return v.test(Tt(m));
  }
  function yf(m) {
    return hr(m) && da(m.length) && !!U[dr(m)];
  }
  function Ef(m) {
    if (!bf(m))
      return ku(m);
    var v = [];
    for (var O in Object(m))
      Ve.call(m, O) && O != "constructor" && v.push(O);
    return v;
  }
  function la(m, v, O, F, Q, H) {
    var oe = O & i, fe = m.length, me = v.length;
    if (fe != me && !(oe && me > fe))
      return !1;
    var re = H.get(m);
    if (re && H.get(v))
      return re == v;
    var De = -1, Be = !0, ve = O & o ? new on() : void 0;
    for (H.set(m, v), H.set(v, m); ++De < fe; ) {
      var Fe = m[De], xe = v[De];
      if (F)
        var at = oe ? F(xe, Fe, De, v, m, H) : F(Fe, xe, De, m, v, H);
      if (at !== void 0) {
        if (at)
          continue;
        Be = !1;
        break;
      }
      if (ve) {
        if (!le(v, function(Je, Ct) {
          if (!en(ve, Ct) && (Fe === Je || Q(Fe, Je, O, F, H)))
            return ve.push(Ct);
        })) {
          Be = !1;
          break;
        }
      } else if (!(Fe === xe || Q(Fe, xe, O, F, H))) {
        Be = !1;
        break;
      }
    }
    return H.delete(m), H.delete(v), Be;
  }
  function vf(m, v, O, F, Q, H, oe) {
    switch (O) {
      case M:
        if (m.byteLength != v.byteLength || m.byteOffset != v.byteOffset)
          return !1;
        m = m.buffer, v = v.buffer;
      case B:
        return !(m.byteLength != v.byteLength || !H(new ra(m), new ra(v)));
      case f:
      case u:
      case _:
        return ua(+m, +v);
      case p:
        return m.name == v.name && m.message == v.message;
      case Z:
      case V:
        return m == v + "";
      case S:
        var fe = tn;
      case ae:
        var me = F & i;
        if (fe || (fe = Nu), m.size != v.size && !me)
          return !1;
        var re = oe.get(m);
        if (re)
          return re == v;
        F |= o, oe.set(m, v);
        var De = la(fe(m), fe(v), F, Q, H, oe);
        return oe.delete(m), De;
      case Ne:
        if (_i)
          return _i.call(m) == _i.call(v);
    }
    return !1;
  }
  function wf(m, v, O, F, Q, H) {
    var oe = O & i, fe = ca(m), me = fe.length, re = ca(v), De = re.length;
    if (me != De && !oe)
      return !1;
    for (var Be = me; Be--; ) {
      var ve = fe[Be];
      if (!(oe ? ve in v : Ve.call(v, ve)))
        return !1;
    }
    var Fe = H.get(m);
    if (Fe && H.get(v))
      return Fe == v;
    var xe = !0;
    H.set(m, v), H.set(v, m);
    for (var at = oe; ++Be < me; ) {
      ve = fe[Be];
      var Je = m[ve], Ct = v[ve];
      if (F)
        var ma = oe ? F(Ct, Je, ve, v, m, H) : F(Je, Ct, ve, m, v, H);
      if (!(ma === void 0 ? Je === Ct || Q(Je, Ct, O, F, H) : ma)) {
        xe = !1;
        break;
      }
      at || (at = ve == "constructor");
    }
    if (xe && !at) {
      var cn = m.constructor, un = v.constructor;
      cn != un && "constructor" in m && "constructor" in v && !(typeof cn == "function" && cn instanceof cn && typeof un == "function" && un instanceof un) && (xe = !1);
    }
    return H.delete(m), H.delete(v), xe;
  }
  function ca(m) {
    return pf(m, Rf, Sf);
  }
  function sn(m, v) {
    var O = m.__data__;
    return Tf(v) ? O[typeof v == "string" ? "string" : "hash"] : O.map;
  }
  function Ut(m, v) {
    var O = cr(m, v);
    return gf(O) ? O : void 0;
  }
  function _f(m) {
    var v = Ve.call(m, _t), O = m[_t];
    try {
      m[_t] = void 0;
      var F = !0;
    } catch {
    }
    var Q = ea.call(m);
    return F && (v ? m[_t] = O : delete m[_t]), Q;
  }
  var Sf = ia ? function(m) {
    return m == null ? [] : (m = Object(m), Ee(ia(m), function(v) {
      return na.call(m, v);
    }));
  } : Nf, ot = dr;
  (yi && ot(new yi(new ArrayBuffer(1))) != M || ur && ot(new ur()) != S || Ei && ot(Ei.resolve()) != N || vi && ot(new vi()) != ae || wi && ot(new wi()) != q) && (ot = function(m) {
    var v = dr(m), O = v == A ? m.constructor : void 0, F = O ? Tt(O) : "";
    if (F)
      switch (F) {
        case Mu:
          return M;
        case Bu:
          return S;
        case ju:
          return N;
        case Hu:
          return ae;
        case qu:
          return q;
      }
    return v;
  });
  function Af(m, v) {
    return v = v ?? a, !!v && (typeof m == "number" || ue.test(m)) && m > -1 && m % 1 == 0 && m < v;
  }
  function Tf(m) {
    var v = typeof m;
    return v == "string" || v == "number" || v == "symbol" || v == "boolean" ? m !== "__proto__" : m === null;
  }
  function Cf(m) {
    return !!Zo && Zo in m;
  }
  function bf(m) {
    var v = m && m.constructor, O = typeof v == "function" && v.prototype || rn;
    return m === O;
  }
  function $f(m) {
    return ea.call(m);
  }
  function Tt(m) {
    if (m != null) {
      try {
        return Qo.call(m);
      } catch {
      }
      try {
        return m + "";
      } catch {
      }
    }
    return "";
  }
  function ua(m, v) {
    return m === v || m !== m && v !== v;
  }
  var Of = aa(/* @__PURE__ */ function() {
    return arguments;
  }()) ? aa : function(m) {
    return hr(m) && Ve.call(m, "callee") && !na.call(m, "callee");
  }, ln = Array.isArray;
  function If(m) {
    return m != null && da(m.length) && !fa(m);
  }
  var Si = Uu || Df;
  function Pf(m, v) {
    return sa(m, v);
  }
  function fa(m) {
    if (!ha(m))
      return !1;
    var v = dr(m);
    return v == g || v == E || v == d || v == L;
  }
  function da(m) {
    return typeof m == "number" && m > -1 && m % 1 == 0 && m <= a;
  }
  function ha(m) {
    var v = typeof m;
    return m != null && (v == "object" || v == "function");
  }
  function hr(m) {
    return m != null && typeof m == "object";
  }
  var pa = pe ? mi(pe) : yf;
  function Rf(m) {
    return If(m) ? hf(m) : Ef(m);
  }
  function Nf() {
    return [];
  }
  function Df() {
    return !1;
  }
  e.exports = Pf;
})(qn, qn.exports);
var tv = qn.exports;
Object.defineProperty(Xr, "__esModule", { value: !0 });
Xr.DownloadedUpdateHelper = void 0;
Xr.createTempUpdateFile = av;
const rv = Hr, nv = tt, Ps = tv, $t = vt, Tr = ee;
class iv {
  constructor(t) {
    this.cacheDir = t, this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, this._downloadedFileInfo = null;
  }
  get downloadedFileInfo() {
    return this._downloadedFileInfo;
  }
  get file() {
    return this._file;
  }
  get packageFile() {
    return this._packageFile;
  }
  get cacheDirForPendingUpdate() {
    return Tr.join(this.cacheDir, "pending");
  }
  async validateDownloadedPath(t, r, n, i) {
    if (this.versionInfo != null && this.file === t && this.fileInfo != null)
      return Ps(this.versionInfo, r) && Ps(this.fileInfo.info, n.info) && await (0, $t.pathExists)(t) ? t : null;
    const o = await this.getValidCachedUpdateFile(n, i);
    return o === null ? null : (i.info(`Update has already been downloaded to ${t}).`), this._file = o, o);
  }
  async setDownloadedFile(t, r, n, i, o, a) {
    this._file = t, this._packageFile = r, this.versionInfo = n, this.fileInfo = i, this._downloadedFileInfo = {
      fileName: o,
      sha512: i.info.sha512,
      isAdminRightsRequired: i.info.isAdminRightsRequired === !0
    }, a && await (0, $t.outputJson)(this.getUpdateInfoFile(), this._downloadedFileInfo);
  }
  async clear() {
    this._file = null, this._packageFile = null, this.versionInfo = null, this.fileInfo = null, await this.cleanCacheDirForPendingUpdate();
  }
  async cleanCacheDirForPendingUpdate() {
    try {
      await (0, $t.emptyDir)(this.cacheDirForPendingUpdate);
    } catch {
    }
  }
  /**
   * Returns "update-info.json" which is created in the update cache directory's "pending" subfolder after the first update is downloaded.  If the update file does not exist then the cache is cleared and recreated.  If the update file exists then its properties are validated.
   * @param fileInfo
   * @param logger
   */
  async getValidCachedUpdateFile(t, r) {
    const n = this.getUpdateInfoFile();
    if (!await (0, $t.pathExists)(n))
      return null;
    let o;
    try {
      o = await (0, $t.readJson)(n);
    } catch (d) {
      let f = "No cached update info available";
      return d.code !== "ENOENT" && (await this.cleanCacheDirForPendingUpdate(), f += ` (error on read: ${d.message})`), r.info(f), null;
    }
    if (!((o == null ? void 0 : o.fileName) !== null))
      return r.warn("Cached update info is corrupted: no fileName, directory for cached update will be cleaned"), await this.cleanCacheDirForPendingUpdate(), null;
    if (t.info.sha512 !== o.sha512)
      return r.info(`Cached update sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${o.sha512}, expected: ${t.info.sha512}. Directory for cached update will be cleaned`), await this.cleanCacheDirForPendingUpdate(), null;
    const s = Tr.join(this.cacheDirForPendingUpdate, o.fileName);
    if (!await (0, $t.pathExists)(s))
      return r.info("Cached update file doesn't exist"), null;
    const l = await ov(s);
    return t.info.sha512 !== l ? (r.warn(`Sha512 checksum doesn't match the latest available update. New update must be downloaded. Cached: ${l}, expected: ${t.info.sha512}`), await this.cleanCacheDirForPendingUpdate(), null) : (this._downloadedFileInfo = o, s);
  }
  getUpdateInfoFile() {
    return Tr.join(this.cacheDirForPendingUpdate, "update-info.json");
  }
}
Xr.DownloadedUpdateHelper = iv;
function ov(e, t = "sha512", r = "base64", n) {
  return new Promise((i, o) => {
    const a = (0, rv.createHash)(t);
    a.on("error", o).setEncoding(r), (0, nv.createReadStream)(e, {
      ...n,
      highWaterMark: 1024 * 1024
      /* better to use more memory but hash faster */
    }).on("error", o).on("end", () => {
      a.end(), i(a.read());
    }).pipe(a, { end: !1 });
  });
}
async function av(e, t, r) {
  let n = 0, i = Tr.join(t, e);
  for (let o = 0; o < 3; o++)
    try {
      return await (0, $t.unlink)(i), i;
    } catch (a) {
      if (a.code === "ENOENT")
        return i;
      r.warn(`Error on remove temp update file: ${a}`), i = Tr.join(t, `${n++}-${e}`);
    }
  return i;
}
var si = {}, Yo = {};
Object.defineProperty(Yo, "__esModule", { value: !0 });
Yo.getAppCacheDir = lv;
const Bi = ee, sv = Vn;
function lv() {
  const e = (0, sv.homedir)();
  let t;
  return process.platform === "win32" ? t = process.env.LOCALAPPDATA || Bi.join(e, "AppData", "Local") : process.platform === "darwin" ? t = Bi.join(e, "Library", "Caches") : t = process.env.XDG_CACHE_HOME || Bi.join(e, ".cache"), t;
}
Object.defineProperty(si, "__esModule", { value: !0 });
si.ElectronAppAdapter = void 0;
const Rs = ee, cv = Yo;
class uv {
  constructor(t = ht.app) {
    this.app = t;
  }
  whenReady() {
    return this.app.whenReady();
  }
  get version() {
    return this.app.getVersion();
  }
  get name() {
    return this.app.getName();
  }
  get isPackaged() {
    return this.app.isPackaged === !0;
  }
  get appUpdateConfigPath() {
    return this.isPackaged ? Rs.join(process.resourcesPath, "app-update.yml") : Rs.join(this.app.getAppPath(), "dev-app-update.yml");
  }
  get userDataPath() {
    return this.app.getPath("userData");
  }
  get baseCachePath() {
    return (0, cv.getAppCacheDir)();
  }
  quit() {
    this.app.quit();
  }
  relaunch() {
    this.app.relaunch();
  }
  onQuit(t) {
    this.app.once("quit", (r, n) => t(n));
  }
}
si.ElectronAppAdapter = uv;
var yu = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.ElectronHttpExecutor = e.NET_SESSION_NAME = void 0, e.getNetSession = r;
  const t = he;
  e.NET_SESSION_NAME = "electron-updater";
  function r() {
    return ht.session.fromPartition(e.NET_SESSION_NAME, {
      cache: !1
    });
  }
  class n extends t.HttpExecutor {
    constructor(o) {
      super(), this.proxyLoginCallback = o, this.cachedSession = null;
    }
    async download(o, a, s) {
      return await s.cancellationToken.createPromise((l, d, f) => {
        const u = {
          headers: s.headers || void 0,
          redirect: "manual"
        };
        (0, t.configureRequestUrl)(o, u), (0, t.configureRequestOptions)(u), this.doDownload(u, {
          destination: a,
          options: s,
          onCancel: f,
          callback: (p) => {
            p == null ? l(a) : d(p);
          },
          responseHandler: null
        }, 0);
      });
    }
    createRequest(o, a) {
      o.headers && o.headers.Host && (o.host = o.headers.Host, delete o.headers.Host), this.cachedSession == null && (this.cachedSession = r());
      const s = ht.net.request({
        ...o,
        session: this.cachedSession
      });
      return s.on("response", a), this.proxyLoginCallback != null && s.on("login", this.proxyLoginCallback), s;
    }
    addRedirectHandlers(o, a, s, l, d) {
      o.on("redirect", (f, u, p) => {
        o.abort(), l > this.maxRedirects ? s(this.createMaxRedirectError()) : d(t.HttpExecutor.prepareRedirectUrlOptions(p, a));
      });
    }
  }
  e.ElectronHttpExecutor = n;
})(yu);
var Kr = {}, Ue = {}, fv = 1 / 0, dv = "[object Symbol]", Eu = /[\\^$.*+?()[\]{}|]/g, hv = RegExp(Eu.source), pv = typeof Ae == "object" && Ae && Ae.Object === Object && Ae, mv = typeof self == "object" && self && self.Object === Object && self, gv = pv || mv || Function("return this")(), yv = Object.prototype, Ev = yv.toString, Ns = gv.Symbol, Ds = Ns ? Ns.prototype : void 0, Fs = Ds ? Ds.toString : void 0;
function vv(e) {
  if (typeof e == "string")
    return e;
  if (_v(e))
    return Fs ? Fs.call(e) : "";
  var t = e + "";
  return t == "0" && 1 / e == -fv ? "-0" : t;
}
function wv(e) {
  return !!e && typeof e == "object";
}
function _v(e) {
  return typeof e == "symbol" || wv(e) && Ev.call(e) == dv;
}
function Sv(e) {
  return e == null ? "" : vv(e);
}
function Av(e) {
  return e = Sv(e), e && hv.test(e) ? e.replace(Eu, "\\$&") : e;
}
var Tv = Av;
Object.defineProperty(Ue, "__esModule", { value: !0 });
Ue.newBaseUrl = bv;
Ue.newUrlFromBase = ho;
Ue.getChannelFilename = $v;
Ue.blockmapFiles = Ov;
const vu = ir, Cv = Tv;
function bv(e) {
  const t = new vu.URL(e);
  return t.pathname.endsWith("/") || (t.pathname += "/"), t;
}
function ho(e, t, r = !1) {
  const n = new vu.URL(e, t), i = t.search;
  return i != null && i.length !== 0 ? n.search = i : r && (n.search = `noCache=${Date.now().toString(32)}`), n;
}
function $v(e) {
  return `${e}.yml`;
}
function Ov(e, t, r) {
  const n = ho(`${e.pathname}.blockmap`, e);
  return [ho(`${e.pathname.replace(new RegExp(Cv(r), "g"), t)}.blockmap`, e), n];
}
var ce = {};
Object.defineProperty(ce, "__esModule", { value: !0 });
ce.Provider = void 0;
ce.findFile = Rv;
ce.parseUpdateInfo = Nv;
ce.getFileList = wu;
ce.resolveFiles = Dv;
const yt = he, Iv = ye, xs = Ue;
class Pv {
  constructor(t) {
    this.runtimeOptions = t, this.requestHeaders = null, this.executor = t.executor;
  }
  get isUseMultipleRangeRequest() {
    return this.runtimeOptions.isUseMultipleRangeRequest !== !1;
  }
  getChannelFilePrefix() {
    if (this.runtimeOptions.platform === "linux") {
      const t = process.env.TEST_UPDATER_ARCH || process.arch;
      return "-linux" + (t === "x64" ? "" : `-${t}`);
    } else
      return this.runtimeOptions.platform === "darwin" ? "-mac" : "";
  }
  // due to historical reasons for windows we use channel name without platform specifier
  getDefaultChannelName() {
    return this.getCustomChannelName("latest");
  }
  getCustomChannelName(t) {
    return `${t}${this.getChannelFilePrefix()}`;
  }
  get fileExtraDownloadHeaders() {
    return null;
  }
  setRequestHeaders(t) {
    this.requestHeaders = t;
  }
  /**
   * Method to perform API request only to resolve update info, but not to download update.
   */
  httpRequest(t, r, n) {
    return this.executor.request(this.createRequestOptions(t, r), n);
  }
  createRequestOptions(t, r) {
    const n = {};
    return this.requestHeaders == null ? r != null && (n.headers = r) : n.headers = r == null ? this.requestHeaders : { ...this.requestHeaders, ...r }, (0, yt.configureRequestUrl)(t, n), n;
  }
}
ce.Provider = Pv;
function Rv(e, t, r) {
  if (e.length === 0)
    throw (0, yt.newError)("No files provided", "ERR_UPDATER_NO_FILES_PROVIDED");
  const n = e.find((i) => i.url.pathname.toLowerCase().endsWith(`.${t}`));
  return n ?? (r == null ? e[0] : e.find((i) => !r.some((o) => i.url.pathname.toLowerCase().endsWith(`.${o}`))));
}
function Nv(e, t, r) {
  if (e == null)
    throw (0, yt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): rawData: null`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  let n;
  try {
    n = (0, Iv.load)(e);
  } catch (i) {
    throw (0, yt.newError)(`Cannot parse update info from ${t} in the latest release artifacts (${r}): ${i.stack || i.message}, rawData: ${e}`, "ERR_UPDATER_INVALID_UPDATE_INFO");
  }
  return n;
}
function wu(e) {
  const t = e.files;
  if (t != null && t.length > 0)
    return t;
  if (e.path != null)
    return [
      {
        url: e.path,
        sha2: e.sha2,
        sha512: e.sha512
      }
    ];
  throw (0, yt.newError)(`No files provided: ${(0, yt.safeStringifyJson)(e)}`, "ERR_UPDATER_NO_FILES_PROVIDED");
}
function Dv(e, t, r = (n) => n) {
  const i = wu(e).map((s) => {
    if (s.sha2 == null && s.sha512 == null)
      throw (0, yt.newError)(`Update info doesn't contain nor sha256 neither sha512 checksum: ${(0, yt.safeStringifyJson)(s)}`, "ERR_UPDATER_NO_CHECKSUM");
    return {
      url: (0, xs.newUrlFromBase)(r(s.url), t),
      info: s
    };
  }), o = e.packages, a = o == null ? null : o[process.arch] || o.ia32;
  return a != null && (i[0].packageInfo = {
    ...a,
    path: (0, xs.newUrlFromBase)(r(a.path), t).href
  }), i;
}
Object.defineProperty(Kr, "__esModule", { value: !0 });
Kr.GenericProvider = void 0;
const Ls = he, ji = Ue, Hi = ce;
class Fv extends Hi.Provider {
  constructor(t, r, n) {
    super(n), this.configuration = t, this.updater = r, this.baseUrl = (0, ji.newBaseUrl)(this.configuration.url);
  }
  get channel() {
    const t = this.updater.channel || this.configuration.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    const t = (0, ji.getChannelFilename)(this.channel), r = (0, ji.newUrlFromBase)(t, this.baseUrl, this.updater.isAddNoCacheQuery);
    for (let n = 0; ; n++)
      try {
        return (0, Hi.parseUpdateInfo)(await this.httpRequest(r), t, r);
      } catch (i) {
        if (i instanceof Ls.HttpError && i.statusCode === 404)
          throw (0, Ls.newError)(`Cannot find channel "${t}" update info: ${i.stack || i.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
        if (i.code === "ECONNREFUSED" && n < 3) {
          await new Promise((o, a) => {
            try {
              setTimeout(o, 1e3 * n);
            } catch (s) {
              a(s);
            }
          });
          continue;
        }
        throw i;
      }
  }
  resolveFiles(t) {
    return (0, Hi.resolveFiles)(t, this.baseUrl);
  }
}
Kr.GenericProvider = Fv;
var li = {}, ci = {};
Object.defineProperty(ci, "__esModule", { value: !0 });
ci.BitbucketProvider = void 0;
const Us = he, qi = Ue, Gi = ce;
class xv extends Gi.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r;
    const { owner: i, slug: o } = t;
    this.baseUrl = (0, qi.newBaseUrl)(`https://api.bitbucket.org/2.0/repositories/${i}/${o}/downloads`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "latest";
  }
  async getLatestVersion() {
    const t = new Us.CancellationToken(), r = (0, qi.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, qi.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, void 0, t);
      return (0, Gi.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Us.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Gi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { owner: t, slug: r } = this.configuration;
    return `Bitbucket (owner: ${t}, slug: ${r}, channel: ${this.channel})`;
  }
}
ci.BitbucketProvider = xv;
var Et = {};
Object.defineProperty(Et, "__esModule", { value: !0 });
Et.GitHubProvider = Et.BaseGitHubProvider = void 0;
Et.computeReleaseNotes = Su;
const Qe = he, Xt = gu, Lv = ir, Kt = Ue, po = ce, Wi = /\/tag\/([^/]+)$/;
class _u extends po.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      /* because GitHib uses S3 */
      isUseMultipleRangeRequest: !1
    }), this.options = t, this.baseUrl = (0, Kt.newBaseUrl)((0, Qe.githubUrl)(t, r));
    const i = r === "github.com" ? "api.github.com" : r;
    this.baseApiUrl = (0, Kt.newBaseUrl)((0, Qe.githubUrl)(t, i));
  }
  computeGithubBasePath(t) {
    const r = this.options.host;
    return r && !["github.com", "api.github.com"].includes(r) ? `/api/v3${t}` : t;
  }
}
Et.BaseGitHubProvider = _u;
class Uv extends _u {
  constructor(t, r, n) {
    super(t, "github.com", n), this.options = t, this.updater = r;
  }
  get channel() {
    const t = this.updater.channel || this.options.channel;
    return t == null ? this.getDefaultChannelName() : this.getCustomChannelName(t);
  }
  async getLatestVersion() {
    var t, r, n, i, o;
    const a = new Qe.CancellationToken(), s = await this.httpRequest((0, Kt.newUrlFromBase)(`${this.basePath}.atom`, this.baseUrl), {
      accept: "application/xml, application/atom+xml, text/xml, */*"
    }, a), l = (0, Qe.parseXml)(s);
    let d = l.element("entry", !1, "No published versions on GitHub"), f = null;
    try {
      if (this.updater.allowPrerelease) {
        const _ = ((t = this.updater) === null || t === void 0 ? void 0 : t.channel) || ((r = Xt.prerelease(this.updater.currentVersion)) === null || r === void 0 ? void 0 : r[0]) || null;
        if (_ === null)
          f = Wi.exec(d.element("link").attribute("href"))[1];
        else
          for (const T of l.getElements("entry")) {
            const A = Wi.exec(T.element("link").attribute("href"));
            if (A === null)
              continue;
            const N = A[1], L = ((n = Xt.prerelease(N)) === null || n === void 0 ? void 0 : n[0]) || null, Z = !_ || ["alpha", "beta"].includes(_), ae = L !== null && !["alpha", "beta"].includes(String(L));
            if (Z && !ae && !(_ === "beta" && L === "alpha")) {
              f = N;
              break;
            }
            if (L && L === _) {
              f = N;
              break;
            }
          }
      } else {
        f = await this.getLatestTagName(a);
        for (const _ of l.getElements("entry"))
          if (Wi.exec(_.element("link").attribute("href"))[1] === f) {
            d = _;
            break;
          }
      }
    } catch (_) {
      throw (0, Qe.newError)(`Cannot parse releases feed: ${_.stack || _.message},
XML:
${s}`, "ERR_UPDATER_INVALID_RELEASE_FEED");
    }
    if (f == null)
      throw (0, Qe.newError)("No published versions on GitHub", "ERR_UPDATER_NO_PUBLISHED_VERSIONS");
    let u, p = "", g = "";
    const E = async (_) => {
      p = (0, Kt.getChannelFilename)(_), g = (0, Kt.newUrlFromBase)(this.getBaseDownloadPath(String(f), p), this.baseUrl);
      const T = this.createRequestOptions(g);
      try {
        return await this.executor.request(T, a);
      } catch (A) {
        throw A instanceof Qe.HttpError && A.statusCode === 404 ? (0, Qe.newError)(`Cannot find ${p} in the latest release artifacts (${g}): ${A.stack || A.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : A;
      }
    };
    try {
      let _ = this.channel;
      this.updater.allowPrerelease && (!((i = Xt.prerelease(f)) === null || i === void 0) && i[0]) && (_ = this.getCustomChannelName(String((o = Xt.prerelease(f)) === null || o === void 0 ? void 0 : o[0]))), u = await E(_);
    } catch (_) {
      if (this.updater.allowPrerelease)
        u = await E(this.getDefaultChannelName());
      else
        throw _;
    }
    const S = (0, po.parseUpdateInfo)(u, p, g);
    return S.releaseName == null && (S.releaseName = d.elementValueOrEmpty("title")), S.releaseNotes == null && (S.releaseNotes = Su(this.updater.currentVersion, this.updater.fullChangelog, l, d)), {
      tag: f,
      ...S
    };
  }
  async getLatestTagName(t) {
    const r = this.options, n = r.host == null || r.host === "github.com" ? (0, Kt.newUrlFromBase)(`${this.basePath}/latest`, this.baseUrl) : new Lv.URL(`${this.computeGithubBasePath(`/repos/${r.owner}/${r.repo}/releases`)}/latest`, this.baseApiUrl);
    try {
      const i = await this.httpRequest(n, { Accept: "application/json" }, t);
      return i == null ? null : JSON.parse(i).tag_name;
    } catch (i) {
      throw (0, Qe.newError)(`Unable to find latest version on GitHub (${n}), please ensure a production release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return `/${this.options.owner}/${this.options.repo}/releases`;
  }
  resolveFiles(t) {
    return (0, po.resolveFiles)(t, this.baseUrl, (r) => this.getBaseDownloadPath(t.tag, r.replace(/ /g, "-")));
  }
  getBaseDownloadPath(t, r) {
    return `${this.basePath}/download/${t}/${r}`;
  }
}
Et.GitHubProvider = Uv;
function ks(e) {
  const t = e.elementValueOrEmpty("content");
  return t === "No content." ? "" : t;
}
function Su(e, t, r, n) {
  if (!t)
    return ks(n);
  const i = [];
  for (const o of r.getElements("entry")) {
    const a = /\/tag\/v?([^/]+)$/.exec(o.element("link").attribute("href"))[1];
    Xt.lt(e, a) && i.push({
      version: a,
      note: ks(o)
    });
  }
  return i.sort((o, a) => Xt.rcompare(o.version, a.version));
}
var ui = {};
Object.defineProperty(ui, "__esModule", { value: !0 });
ui.KeygenProvider = void 0;
const Ms = he, Vi = Ue, Yi = ce;
class kv extends Yi.Provider {
  constructor(t, r, n) {
    super({
      ...n,
      isUseMultipleRangeRequest: !1
    }), this.configuration = t, this.updater = r, this.defaultHostname = "api.keygen.sh";
    const i = this.configuration.host || this.defaultHostname;
    this.baseUrl = (0, Vi.newBaseUrl)(`https://${i}/v1/accounts/${this.configuration.account}/artifacts?product=${this.configuration.product}`);
  }
  get channel() {
    return this.updater.channel || this.configuration.channel || "stable";
  }
  async getLatestVersion() {
    const t = new Ms.CancellationToken(), r = (0, Vi.getChannelFilename)(this.getCustomChannelName(this.channel)), n = (0, Vi.newUrlFromBase)(r, this.baseUrl, this.updater.isAddNoCacheQuery);
    try {
      const i = await this.httpRequest(n, {
        Accept: "application/vnd.api+json",
        "Keygen-Version": "1.1"
      }, t);
      return (0, Yi.parseUpdateInfo)(i, r, n);
    } catch (i) {
      throw (0, Ms.newError)(`Unable to find latest version on ${this.toString()}, please ensure release exists: ${i.stack || i.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  resolveFiles(t) {
    return (0, Yi.resolveFiles)(t, this.baseUrl);
  }
  toString() {
    const { account: t, product: r, platform: n } = this.configuration;
    return `Keygen (account: ${t}, product: ${r}, platform: ${n}, channel: ${this.channel})`;
  }
}
ui.KeygenProvider = kv;
var fi = {};
Object.defineProperty(fi, "__esModule", { value: !0 });
fi.PrivateGitHubProvider = void 0;
const jt = he, Mv = ye, Bv = ee, Bs = ir, js = Ue, jv = Et, Hv = ce;
class qv extends jv.BaseGitHubProvider {
  constructor(t, r, n, i) {
    super(t, "api.github.com", i), this.updater = r, this.token = n;
  }
  createRequestOptions(t, r) {
    const n = super.createRequestOptions(t, r);
    return n.redirect = "manual", n;
  }
  async getLatestVersion() {
    const t = new jt.CancellationToken(), r = (0, js.getChannelFilename)(this.getDefaultChannelName()), n = await this.getLatestVersionInfo(t), i = n.assets.find((s) => s.name === r);
    if (i == null)
      throw (0, jt.newError)(`Cannot find ${r} in the release ${n.html_url || n.name}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND");
    const o = new Bs.URL(i.url);
    let a;
    try {
      a = (0, Mv.load)(await this.httpRequest(o, this.configureHeaders("application/octet-stream"), t));
    } catch (s) {
      throw s instanceof jt.HttpError && s.statusCode === 404 ? (0, jt.newError)(`Cannot find ${r} in the latest release artifacts (${o}): ${s.stack || s.message}`, "ERR_UPDATER_CHANNEL_FILE_NOT_FOUND") : s;
    }
    return a.assets = n.assets, a;
  }
  get fileExtraDownloadHeaders() {
    return this.configureHeaders("application/octet-stream");
  }
  configureHeaders(t) {
    return {
      accept: t,
      authorization: `token ${this.token}`
    };
  }
  async getLatestVersionInfo(t) {
    const r = this.updater.allowPrerelease;
    let n = this.basePath;
    r || (n = `${n}/latest`);
    const i = (0, js.newUrlFromBase)(n, this.baseUrl);
    try {
      const o = JSON.parse(await this.httpRequest(i, this.configureHeaders("application/vnd.github.v3+json"), t));
      return r ? o.find((a) => a.prerelease) || o[0] : o;
    } catch (o) {
      throw (0, jt.newError)(`Unable to find latest version on GitHub (${i}), please ensure a production release exists: ${o.stack || o.message}`, "ERR_UPDATER_LATEST_VERSION_NOT_FOUND");
    }
  }
  get basePath() {
    return this.computeGithubBasePath(`/repos/${this.options.owner}/${this.options.repo}/releases`);
  }
  resolveFiles(t) {
    return (0, Hv.getFileList)(t).map((r) => {
      const n = Bv.posix.basename(r.url).replace(/ /g, "-"), i = t.assets.find((o) => o != null && o.name === n);
      if (i == null)
        throw (0, jt.newError)(`Cannot find asset "${n}" in: ${JSON.stringify(t.assets, null, 2)}`, "ERR_UPDATER_ASSET_NOT_FOUND");
      return {
        url: new Bs.URL(i.url),
        info: r
      };
    });
  }
}
fi.PrivateGitHubProvider = qv;
Object.defineProperty(li, "__esModule", { value: !0 });
li.isUrlProbablySupportMultiRangeRequests = Au;
li.createClient = zv;
const _n = he, Gv = ci, Hs = Kr, Wv = Et, Vv = ui, Yv = fi;
function Au(e) {
  return !e.includes("s3.amazonaws.com");
}
function zv(e, t, r) {
  if (typeof e == "string")
    throw (0, _n.newError)("Please pass PublishConfiguration object", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
  const n = e.provider;
  switch (n) {
    case "github": {
      const i = e, o = (i.private ? process.env.GH_TOKEN || process.env.GITHUB_TOKEN : null) || i.token;
      return o == null ? new Wv.GitHubProvider(i, t, r) : new Yv.PrivateGitHubProvider(i, t, o, r);
    }
    case "bitbucket":
      return new Gv.BitbucketProvider(e, t, r);
    case "keygen":
      return new Vv.KeygenProvider(e, t, r);
    case "s3":
    case "spaces":
      return new Hs.GenericProvider({
        provider: "generic",
        url: (0, _n.getS3LikeProviderBaseUrl)(e),
        channel: e.channel || null
      }, t, {
        ...r,
        // https://github.com/minio/minio/issues/5285#issuecomment-350428955
        isUseMultipleRangeRequest: !1
      });
    case "generic": {
      const i = e;
      return new Hs.GenericProvider(i, t, {
        ...r,
        isUseMultipleRangeRequest: i.useMultipleRangeRequest !== !1 && Au(i.url)
      });
    }
    case "custom": {
      const i = e, o = i.updateProvider;
      if (!o)
        throw (0, _n.newError)("Custom provider not specified", "ERR_UPDATER_INVALID_PROVIDER_CONFIGURATION");
      return new o(i, t, r);
    }
    default:
      throw (0, _n.newError)(`Unsupported provider: ${n}`, "ERR_UPDATER_UNSUPPORTED_PROVIDER");
  }
}
var di = {}, Jr = {}, lr = {}, Lt = {};
Object.defineProperty(Lt, "__esModule", { value: !0 });
Lt.OperationKind = void 0;
Lt.computeOperations = Xv;
var Pt;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(Pt || (Lt.OperationKind = Pt = {}));
function Xv(e, t, r) {
  const n = Gs(e.files), i = Gs(t.files);
  let o = null;
  const a = t.files[0], s = [], l = a.name, d = n.get(l);
  if (d == null)
    throw new Error(`no file ${l} in old blockmap`);
  const f = i.get(l);
  let u = 0;
  const { checksumToOffset: p, checksumToOldSize: g } = Jv(n.get(l), d.offset, r);
  let E = a.offset;
  for (let S = 0; S < f.checksums.length; E += f.sizes[S], S++) {
    const _ = f.sizes[S], T = f.checksums[S];
    let A = p.get(T);
    A != null && g.get(T) !== _ && (r.warn(`Checksum ("${T}") matches, but size differs (old: ${g.get(T)}, new: ${_})`), A = void 0), A === void 0 ? (u++, o != null && o.kind === Pt.DOWNLOAD && o.end === E ? o.end += _ : (o = {
      kind: Pt.DOWNLOAD,
      start: E,
      end: E + _
      // oldBlocks: null,
    }, qs(o, s, T, S))) : o != null && o.kind === Pt.COPY && o.end === A ? o.end += _ : (o = {
      kind: Pt.COPY,
      start: A,
      end: A + _
      // oldBlocks: [checksum]
    }, qs(o, s, T, S));
  }
  return u > 0 && r.info(`File${a.name === "file" ? "" : " " + a.name} has ${u} changed blocks`), s;
}
const Kv = process.env.DIFFERENTIAL_DOWNLOAD_PLAN_BUILDER_VALIDATE_RANGES === "true";
function qs(e, t, r, n) {
  if (Kv && t.length !== 0) {
    const i = t[t.length - 1];
    if (i.kind === e.kind && e.start < i.end && e.start > i.start) {
      const o = [i.start, i.end, e.start, e.end].reduce((a, s) => a < s ? a : s);
      throw new Error(`operation (block index: ${n}, checksum: ${r}, kind: ${Pt[e.kind]}) overlaps previous operation (checksum: ${r}):
abs: ${i.start} until ${i.end} and ${e.start} until ${e.end}
rel: ${i.start - o} until ${i.end - o} and ${e.start - o} until ${e.end - o}`);
    }
  }
  t.push(e);
}
function Jv(e, t, r) {
  const n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map();
  let o = t;
  for (let a = 0; a < e.checksums.length; a++) {
    const s = e.checksums[a], l = e.sizes[a], d = i.get(s);
    if (d === void 0)
      n.set(s, o), i.set(s, l);
    else if (r.debug != null) {
      const f = d === l ? "(same size)" : `(size: ${d}, this size: ${l})`;
      r.debug(`${s} duplicated in blockmap ${f}, it doesn't lead to broken differential downloader, just corresponding block will be skipped)`);
    }
    o += l;
  }
  return { checksumToOffset: n, checksumToOldSize: i };
}
function Gs(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e)
    t.set(r.name, r);
  return t;
}
Object.defineProperty(lr, "__esModule", { value: !0 });
lr.DataSplitter = void 0;
lr.copyData = Tu;
const Sn = he, Qv = tt, Zv = jr, ew = Lt, Ws = Buffer.from(`\r
\r
`);
var lt;
(function(e) {
  e[e.INIT = 0] = "INIT", e[e.HEADER = 1] = "HEADER", e[e.BODY = 2] = "BODY";
})(lt || (lt = {}));
function Tu(e, t, r, n, i) {
  const o = (0, Qv.createReadStream)("", {
    fd: r,
    autoClose: !1,
    start: e.start,
    // end is inclusive
    end: e.end - 1
  });
  o.on("error", n), o.once("end", i), o.pipe(t, {
    end: !1
  });
}
class tw extends Zv.Writable {
  constructor(t, r, n, i, o, a) {
    super(), this.out = t, this.options = r, this.partIndexToTaskIndex = n, this.partIndexToLength = o, this.finishHandler = a, this.partIndex = -1, this.headerListBuffer = null, this.readState = lt.INIT, this.ignoreByteCount = 0, this.remainingPartDataCount = 0, this.actualPartLength = 0, this.boundaryLength = i.length + 4, this.ignoreByteCount = this.boundaryLength - 2;
  }
  get isFinished() {
    return this.partIndex === this.partIndexToLength.length;
  }
  // noinspection JSUnusedGlobalSymbols
  _write(t, r, n) {
    if (this.isFinished) {
      console.error(`Trailing ignored data: ${t.length} bytes`);
      return;
    }
    this.handleData(t).then(n).catch(n);
  }
  async handleData(t) {
    let r = 0;
    if (this.ignoreByteCount !== 0 && this.remainingPartDataCount !== 0)
      throw (0, Sn.newError)("Internal error", "ERR_DATA_SPLITTER_BYTE_COUNT_MISMATCH");
    if (this.ignoreByteCount > 0) {
      const n = Math.min(this.ignoreByteCount, t.length);
      this.ignoreByteCount -= n, r = n;
    } else if (this.remainingPartDataCount > 0) {
      const n = Math.min(this.remainingPartDataCount, t.length);
      this.remainingPartDataCount -= n, await this.processPartData(t, 0, n), r = n;
    }
    if (r !== t.length) {
      if (this.readState === lt.HEADER) {
        const n = this.searchHeaderListEnd(t, r);
        if (n === -1)
          return;
        r = n, this.readState = lt.BODY, this.headerListBuffer = null;
      }
      for (; ; ) {
        if (this.readState === lt.BODY)
          this.readState = lt.INIT;
        else {
          this.partIndex++;
          let a = this.partIndexToTaskIndex.get(this.partIndex);
          if (a == null)
            if (this.isFinished)
              a = this.options.end;
            else
              throw (0, Sn.newError)("taskIndex is null", "ERR_DATA_SPLITTER_TASK_INDEX_IS_NULL");
          const s = this.partIndex === 0 ? this.options.start : this.partIndexToTaskIndex.get(this.partIndex - 1) + 1;
          if (s < a)
            await this.copyExistingData(s, a);
          else if (s > a)
            throw (0, Sn.newError)("prevTaskIndex must be < taskIndex", "ERR_DATA_SPLITTER_TASK_INDEX_ASSERT_FAILED");
          if (this.isFinished) {
            this.onPartEnd(), this.finishHandler();
            return;
          }
          if (r = this.searchHeaderListEnd(t, r), r === -1) {
            this.readState = lt.HEADER;
            return;
          }
        }
        const n = this.partIndexToLength[this.partIndex], i = r + n, o = Math.min(i, t.length);
        if (await this.processPartStarted(t, r, o), this.remainingPartDataCount = n - (o - r), this.remainingPartDataCount > 0)
          return;
        if (r = i + this.boundaryLength, r >= t.length) {
          this.ignoreByteCount = this.boundaryLength - (t.length - i);
          return;
        }
      }
    }
  }
  copyExistingData(t, r) {
    return new Promise((n, i) => {
      const o = () => {
        if (t === r) {
          n();
          return;
        }
        const a = this.options.tasks[t];
        if (a.kind !== ew.OperationKind.COPY) {
          i(new Error("Task kind must be COPY"));
          return;
        }
        Tu(a, this.out, this.options.oldFileFd, i, () => {
          t++, o();
        });
      };
      o();
    });
  }
  searchHeaderListEnd(t, r) {
    const n = t.indexOf(Ws, r);
    if (n !== -1)
      return n + Ws.length;
    const i = r === 0 ? t : t.slice(r);
    return this.headerListBuffer == null ? this.headerListBuffer = i : this.headerListBuffer = Buffer.concat([this.headerListBuffer, i]), -1;
  }
  onPartEnd() {
    const t = this.partIndexToLength[this.partIndex - 1];
    if (this.actualPartLength !== t)
      throw (0, Sn.newError)(`Expected length: ${t} differs from actual: ${this.actualPartLength}`, "ERR_DATA_SPLITTER_LENGTH_MISMATCH");
    this.actualPartLength = 0;
  }
  processPartStarted(t, r, n) {
    return this.partIndex !== 0 && this.onPartEnd(), this.processPartData(t, r, n);
  }
  processPartData(t, r, n) {
    this.actualPartLength += n - r;
    const i = this.out;
    return i.write(r === 0 && t.length === n ? t : t.slice(r, n)) ? Promise.resolve() : new Promise((o, a) => {
      i.on("error", a), i.once("drain", () => {
        i.removeListener("error", a), o();
      });
    });
  }
}
lr.DataSplitter = tw;
var hi = {};
Object.defineProperty(hi, "__esModule", { value: !0 });
hi.executeTasksUsingMultipleRangeRequests = rw;
hi.checkIsRangesSupported = go;
const mo = he, Vs = lr, Ys = Lt;
function rw(e, t, r, n, i) {
  const o = (a) => {
    if (a >= t.length) {
      e.fileMetadataBuffer != null && r.write(e.fileMetadataBuffer), r.end();
      return;
    }
    const s = a + 1e3;
    nw(e, {
      tasks: t,
      start: a,
      end: Math.min(t.length, s),
      oldFileFd: n
    }, r, () => o(s), i);
  };
  return o;
}
function nw(e, t, r, n, i) {
  let o = "bytes=", a = 0;
  const s = /* @__PURE__ */ new Map(), l = [];
  for (let u = t.start; u < t.end; u++) {
    const p = t.tasks[u];
    p.kind === Ys.OperationKind.DOWNLOAD && (o += `${p.start}-${p.end - 1}, `, s.set(a, u), a++, l.push(p.end - p.start));
  }
  if (a <= 1) {
    const u = (p) => {
      if (p >= t.end) {
        n();
        return;
      }
      const g = t.tasks[p++];
      if (g.kind === Ys.OperationKind.COPY)
        (0, Vs.copyData)(g, r, t.oldFileFd, i, () => u(p));
      else {
        const E = e.createRequestOptions();
        E.headers.Range = `bytes=${g.start}-${g.end - 1}`;
        const S = e.httpExecutor.createRequest(E, (_) => {
          go(_, i) && (_.pipe(r, {
            end: !1
          }), _.once("end", () => u(p)));
        });
        e.httpExecutor.addErrorAndTimeoutHandlers(S, i), S.end();
      }
    };
    u(t.start);
    return;
  }
  const d = e.createRequestOptions();
  d.headers.Range = o.substring(0, o.length - 2);
  const f = e.httpExecutor.createRequest(d, (u) => {
    if (!go(u, i))
      return;
    const p = (0, mo.safeGetHeader)(u, "content-type"), g = /^multipart\/.+?(?:; boundary=(?:(?:"(.+)")|(?:([^\s]+))))$/i.exec(p);
    if (g == null) {
      i(new Error(`Content-Type "multipart/byteranges" is expected, but got "${p}"`));
      return;
    }
    const E = new Vs.DataSplitter(r, t, s, g[1] || g[2], l, n);
    E.on("error", i), u.pipe(E), u.on("end", () => {
      setTimeout(() => {
        f.abort(), i(new Error("Response ends without calling any handlers"));
      }, 1e4);
    });
  });
  e.httpExecutor.addErrorAndTimeoutHandlers(f, i), f.end();
}
function go(e, t) {
  if (e.statusCode >= 400)
    return t((0, mo.createHttpError)(e)), !1;
  if (e.statusCode !== 206) {
    const r = (0, mo.safeGetHeader)(e, "accept-ranges");
    if (r == null || r === "none")
      return t(new Error(`Server doesn't support Accept-Ranges (response code ${e.statusCode})`)), !1;
  }
  return !0;
}
var pi = {};
Object.defineProperty(pi, "__esModule", { value: !0 });
pi.ProgressDifferentialDownloadCallbackTransform = void 0;
const iw = jr;
var Jt;
(function(e) {
  e[e.COPY = 0] = "COPY", e[e.DOWNLOAD = 1] = "DOWNLOAD";
})(Jt || (Jt = {}));
class ow extends iw.Transform {
  constructor(t, r, n) {
    super(), this.progressDifferentialDownloadInfo = t, this.cancellationToken = r, this.onProgress = n, this.start = Date.now(), this.transferred = 0, this.delta = 0, this.expectedBytes = 0, this.index = 0, this.operationType = Jt.COPY, this.nextUpdate = this.start + 1e3;
  }
  _transform(t, r, n) {
    if (this.cancellationToken.cancelled) {
      n(new Error("cancelled"), null);
      return;
    }
    if (this.operationType == Jt.COPY) {
      n(null, t);
      return;
    }
    this.transferred += t.length, this.delta += t.length;
    const i = Date.now();
    i >= this.nextUpdate && this.transferred !== this.expectedBytes && this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && (this.nextUpdate = i + 1e3, this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((i - this.start) / 1e3))
    }), this.delta = 0), n(null, t);
  }
  beginFileCopy() {
    this.operationType = Jt.COPY;
  }
  beginRangeDownload() {
    this.operationType = Jt.DOWNLOAD, this.expectedBytes += this.progressDifferentialDownloadInfo.expectedByteCounts[this.index++];
  }
  endRangeDownload() {
    this.transferred !== this.progressDifferentialDownloadInfo.grandTotal && this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: this.transferred / this.progressDifferentialDownloadInfo.grandTotal * 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    });
  }
  // Called when we are 100% done with the connection/download
  _flush(t) {
    if (this.cancellationToken.cancelled) {
      t(new Error("cancelled"));
      return;
    }
    this.onProgress({
      total: this.progressDifferentialDownloadInfo.grandTotal,
      delta: this.delta,
      transferred: this.transferred,
      percent: 100,
      bytesPerSecond: Math.round(this.transferred / ((Date.now() - this.start) / 1e3))
    }), this.delta = 0, this.transferred = 0, t(null);
  }
}
pi.ProgressDifferentialDownloadCallbackTransform = ow;
Object.defineProperty(Jr, "__esModule", { value: !0 });
Jr.DifferentialDownloader = void 0;
const yr = he, zi = vt, aw = tt, sw = lr, lw = ir, An = Lt, zs = hi, cw = pi;
class uw {
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(t, r, n) {
    this.blockAwareFileInfo = t, this.httpExecutor = r, this.options = n, this.fileMetadataBuffer = null, this.logger = n.logger;
  }
  createRequestOptions() {
    const t = {
      headers: {
        ...this.options.requestHeaders,
        accept: "*/*"
      }
    };
    return (0, yr.configureRequestUrl)(this.options.newUrl, t), (0, yr.configureRequestOptions)(t), t;
  }
  doDownload(t, r) {
    if (t.version !== r.version)
      throw new Error(`version is different (${t.version} - ${r.version}), full download is required`);
    const n = this.logger, i = (0, An.computeOperations)(t, r, n);
    n.debug != null && n.debug(JSON.stringify(i, null, 2));
    let o = 0, a = 0;
    for (const l of i) {
      const d = l.end - l.start;
      l.kind === An.OperationKind.DOWNLOAD ? o += d : a += d;
    }
    const s = this.blockAwareFileInfo.size;
    if (o + a + (this.fileMetadataBuffer == null ? 0 : this.fileMetadataBuffer.length) !== s)
      throw new Error(`Internal error, size mismatch: downloadSize: ${o}, copySize: ${a}, newSize: ${s}`);
    return n.info(`Full: ${Xs(s)}, To download: ${Xs(o)} (${Math.round(o / (s / 100))}%)`), this.downloadFile(i);
  }
  downloadFile(t) {
    const r = [], n = () => Promise.all(r.map((i) => (0, zi.close)(i.descriptor).catch((o) => {
      this.logger.error(`cannot close file "${i.path}": ${o}`);
    })));
    return this.doDownloadFile(t, r).then(n).catch((i) => n().catch((o) => {
      try {
        this.logger.error(`cannot close files: ${o}`);
      } catch (a) {
        try {
          console.error(a);
        } catch {
        }
      }
      throw i;
    }).then(() => {
      throw i;
    }));
  }
  async doDownloadFile(t, r) {
    const n = await (0, zi.open)(this.options.oldFile, "r");
    r.push({ descriptor: n, path: this.options.oldFile });
    const i = await (0, zi.open)(this.options.newFile, "w");
    r.push({ descriptor: i, path: this.options.newFile });
    const o = (0, aw.createWriteStream)(this.options.newFile, { fd: i });
    await new Promise((a, s) => {
      const l = [];
      let d;
      if (!this.options.isUseMultipleRangeRequest && this.options.onProgress) {
        const T = [];
        let A = 0;
        for (const L of t)
          L.kind === An.OperationKind.DOWNLOAD && (T.push(L.end - L.start), A += L.end - L.start);
        const N = {
          expectedByteCounts: T,
          grandTotal: A
        };
        d = new cw.ProgressDifferentialDownloadCallbackTransform(N, this.options.cancellationToken, this.options.onProgress), l.push(d);
      }
      const f = new yr.DigestTransform(this.blockAwareFileInfo.sha512);
      f.isValidateOnEnd = !1, l.push(f), o.on("finish", () => {
        o.close(() => {
          r.splice(1, 1);
          try {
            f.validate();
          } catch (T) {
            s(T);
            return;
          }
          a(void 0);
        });
      }), l.push(o);
      let u = null;
      for (const T of l)
        T.on("error", s), u == null ? u = T : u = u.pipe(T);
      const p = l[0];
      let g;
      if (this.options.isUseMultipleRangeRequest) {
        g = (0, zs.executeTasksUsingMultipleRangeRequests)(this, t, p, n, s), g(0);
        return;
      }
      let E = 0, S = null;
      this.logger.info(`Differential download: ${this.options.newUrl}`);
      const _ = this.createRequestOptions();
      _.redirect = "manual", g = (T) => {
        var A, N;
        if (T >= t.length) {
          this.fileMetadataBuffer != null && p.write(this.fileMetadataBuffer), p.end();
          return;
        }
        const L = t[T++];
        if (L.kind === An.OperationKind.COPY) {
          d && d.beginFileCopy(), (0, sw.copyData)(L, p, n, s, () => g(T));
          return;
        }
        const Z = `bytes=${L.start}-${L.end - 1}`;
        _.headers.range = Z, (N = (A = this.logger) === null || A === void 0 ? void 0 : A.debug) === null || N === void 0 || N.call(A, `download range: ${Z}`), d && d.beginRangeDownload();
        const ae = this.httpExecutor.createRequest(_, (V) => {
          V.on("error", s), V.on("aborted", () => {
            s(new Error("response has been aborted by the server"));
          }), V.statusCode >= 400 && s((0, yr.createHttpError)(V)), V.pipe(p, {
            end: !1
          }), V.once("end", () => {
            d && d.endRangeDownload(), ++E === 100 ? (E = 0, setTimeout(() => g(T), 1e3)) : g(T);
          });
        });
        ae.on("redirect", (V, Ne, y) => {
          this.logger.info(`Redirect to ${fw(y)}`), S = y, (0, yr.configureRequestUrl)(new lw.URL(S), _), ae.followRedirect();
        }), this.httpExecutor.addErrorAndTimeoutHandlers(ae, s), ae.end();
      }, g(0);
    });
  }
  async readRemoteBytes(t, r) {
    const n = Buffer.allocUnsafe(r + 1 - t), i = this.createRequestOptions();
    i.headers.range = `bytes=${t}-${r}`;
    let o = 0;
    if (await this.request(i, (a) => {
      a.copy(n, o), o += a.length;
    }), o !== n.length)
      throw new Error(`Received data length ${o} is not equal to expected ${n.length}`);
    return n;
  }
  request(t, r) {
    return new Promise((n, i) => {
      const o = this.httpExecutor.createRequest(t, (a) => {
        (0, zs.checkIsRangesSupported)(a, i) && (a.on("error", i), a.on("aborted", () => {
          i(new Error("response has been aborted by the server"));
        }), a.on("data", r), a.on("end", () => n()));
      });
      this.httpExecutor.addErrorAndTimeoutHandlers(o, i), o.end();
    });
  }
}
Jr.DifferentialDownloader = uw;
function Xs(e, t = " KB") {
  return new Intl.NumberFormat("en").format((e / 1024).toFixed(2)) + t;
}
function fw(e) {
  const t = e.indexOf("?");
  return t < 0 ? e : e.substring(0, t);
}
Object.defineProperty(di, "__esModule", { value: !0 });
di.GenericDifferentialDownloader = void 0;
const dw = Jr;
class hw extends dw.DifferentialDownloader {
  download(t, r) {
    return this.doDownload(t, r);
  }
}
di.GenericDifferentialDownloader = hw;
var wt = {};
(function(e) {
  Object.defineProperty(e, "__esModule", { value: !0 }), e.UpdaterSignal = e.UPDATE_DOWNLOADED = e.DOWNLOAD_PROGRESS = e.CancellationToken = void 0, e.addHandler = n;
  const t = he;
  Object.defineProperty(e, "CancellationToken", { enumerable: !0, get: function() {
    return t.CancellationToken;
  } }), e.DOWNLOAD_PROGRESS = "download-progress", e.UPDATE_DOWNLOADED = "update-downloaded";
  class r {
    constructor(o) {
      this.emitter = o;
    }
    /**
     * Emitted when an authenticating proxy is [asking for user credentials](https://github.com/electron/electron/blob/master/docs/api/client-request.md#event-login).
     */
    login(o) {
      n(this.emitter, "login", o);
    }
    progress(o) {
      n(this.emitter, e.DOWNLOAD_PROGRESS, o);
    }
    updateDownloaded(o) {
      n(this.emitter, e.UPDATE_DOWNLOADED, o);
    }
    updateCancelled(o) {
      n(this.emitter, "update-cancelled", o);
    }
  }
  e.UpdaterSignal = r;
  function n(i, o, a) {
    i.on(o, a);
  }
})(wt);
Object.defineProperty(pt, "__esModule", { value: !0 });
pt.NoOpLogger = pt.AppUpdater = void 0;
const Se = he, pw = Hr, mw = Vn, gw = yl, Ht = vt, yw = ye, Xi = ti, bt = ee, Ot = gu, Ks = Xr, Ew = si, Js = yu, vw = Kr, Ki = li, ww = vl, _w = Ue, Sw = di, qt = wt;
class zo extends gw.EventEmitter {
  /**
   * Get the update channel. Doesn't return `channel` from the update configuration, only if was previously set.
   */
  get channel() {
    return this._channel;
  }
  /**
   * Set the update channel. Overrides `channel` in the update configuration.
   *
   * `allowDowngrade` will be automatically set to `true`. If this behavior is not suitable for you, simple set `allowDowngrade` explicitly after.
   */
  set channel(t) {
    if (this._channel != null) {
      if (typeof t != "string")
        throw (0, Se.newError)(`Channel must be a string, but got: ${t}`, "ERR_UPDATER_INVALID_CHANNEL");
      if (t.length === 0)
        throw (0, Se.newError)("Channel must be not an empty string", "ERR_UPDATER_INVALID_CHANNEL");
    }
    this._channel = t, this.allowDowngrade = !0;
  }
  /**
   *  Shortcut for explicitly adding auth tokens to request headers
   */
  addAuthHeader(t) {
    this.requestHeaders = Object.assign({}, this.requestHeaders, {
      authorization: t
    });
  }
  // noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  get netSession() {
    return (0, Js.getNetSession)();
  }
  /**
   * The logger. You can pass [electron-log](https://github.com/megahertz/electron-log), [winston](https://github.com/winstonjs/winston) or another logger with the following interface: `{ info(), warn(), error() }`.
   * Set it to `null` if you would like to disable a logging feature.
   */
  get logger() {
    return this._logger;
  }
  set logger(t) {
    this._logger = t ?? new Cu();
  }
  // noinspection JSUnusedGlobalSymbols
  /**
   * test only
   * @private
   */
  set updateConfigPath(t) {
    this.clientPromise = null, this._appUpdateConfigPath = t, this.configOnDisk = new Xi.Lazy(() => this.loadUpdateConfig());
  }
  /**
   * Allows developer to override default logic for determining if an update is supported.
   * The default logic compares the `UpdateInfo` minimum system version against the `os.release()` with `semver` package
   */
  get isUpdateSupported() {
    return this._isUpdateSupported;
  }
  set isUpdateSupported(t) {
    t && (this._isUpdateSupported = t);
  }
  constructor(t, r) {
    super(), this.autoDownload = !0, this.autoInstallOnAppQuit = !0, this.autoRunAppAfterInstall = !0, this.allowPrerelease = !1, this.fullChangelog = !1, this.allowDowngrade = !1, this.disableWebInstaller = !1, this.disableDifferentialDownload = !1, this.forceDevUpdateConfig = !1, this._channel = null, this.downloadedUpdateHelper = null, this.requestHeaders = null, this._logger = console, this.signals = new qt.UpdaterSignal(this), this._appUpdateConfigPath = null, this._isUpdateSupported = (o) => this.checkIfUpdateSupported(o), this.clientPromise = null, this.stagingUserIdPromise = new Xi.Lazy(() => this.getOrCreateStagingUserId()), this.configOnDisk = new Xi.Lazy(() => this.loadUpdateConfig()), this.checkForUpdatesPromise = null, this.downloadPromise = null, this.updateInfoAndProvider = null, this._testOnlyOptions = null, this.on("error", (o) => {
      this._logger.error(`Error: ${o.stack || o.message}`);
    }), r == null ? (this.app = new Ew.ElectronAppAdapter(), this.httpExecutor = new Js.ElectronHttpExecutor((o, a) => this.emit("login", o, a))) : (this.app = r, this.httpExecutor = null);
    const n = this.app.version, i = (0, Ot.parse)(n);
    if (i == null)
      throw (0, Se.newError)(`App version is not a valid semver version: "${n}"`, "ERR_UPDATER_INVALID_VERSION");
    this.currentVersion = i, this.allowPrerelease = Aw(i), t != null && (this.setFeedURL(t), typeof t != "string" && t.requestHeaders && (this.requestHeaders = t.requestHeaders));
  }
  //noinspection JSMethodCanBeStatic,JSUnusedGlobalSymbols
  getFeedURL() {
    return "Deprecated. Do not use it.";
  }
  /**
   * Configure update provider. If value is `string`, [GenericServerOptions](./publish.md#genericserveroptions) will be set with value as `url`.
   * @param options If you want to override configuration in the `app-update.yml`.
   */
  setFeedURL(t) {
    const r = this.createProviderRuntimeOptions();
    let n;
    typeof t == "string" ? n = new vw.GenericProvider({ provider: "generic", url: t }, this, {
      ...r,
      isUseMultipleRangeRequest: (0, Ki.isUrlProbablySupportMultiRangeRequests)(t)
    }) : n = (0, Ki.createClient)(t, this, r), this.clientPromise = Promise.resolve(n);
  }
  /**
   * Asks the server whether there is an update.
   * @returns null if the updater is disabled, otherwise info about the latest version
   */
  checkForUpdates() {
    if (!this.isUpdaterActive())
      return Promise.resolve(null);
    let t = this.checkForUpdatesPromise;
    if (t != null)
      return this._logger.info("Checking for update (already in progress)"), t;
    const r = () => this.checkForUpdatesPromise = null;
    return this._logger.info("Checking for update"), t = this.doCheckForUpdates().then((n) => (r(), n)).catch((n) => {
      throw r(), this.emit("error", n, `Cannot check for updates: ${(n.stack || n).toString()}`), n;
    }), this.checkForUpdatesPromise = t, t;
  }
  isUpdaterActive() {
    return this.app.isPackaged || this.forceDevUpdateConfig ? !0 : (this._logger.info("Skip checkForUpdates because application is not packed and dev update config is not forced"), !1);
  }
  // noinspection JSUnusedGlobalSymbols
  checkForUpdatesAndNotify(t) {
    return this.checkForUpdates().then((r) => r != null && r.downloadPromise ? (r.downloadPromise.then(() => {
      const n = zo.formatDownloadNotification(r.updateInfo.version, this.app.name, t);
      new ht.Notification(n).show();
    }), r) : (this._logger.debug != null && this._logger.debug("checkForUpdatesAndNotify called, downloadPromise is null"), r));
  }
  static formatDownloadNotification(t, r, n) {
    return n == null && (n = {
      title: "A new update is ready to install",
      body: "{appName} version {version} has been downloaded and will be automatically installed on exit"
    }), n = {
      title: n.title.replace("{appName}", r).replace("{version}", t),
      body: n.body.replace("{appName}", r).replace("{version}", t)
    }, n;
  }
  async isStagingMatch(t) {
    const r = t.stagingPercentage;
    let n = r;
    if (n == null)
      return !0;
    if (n = parseInt(n, 10), isNaN(n))
      return this._logger.warn(`Staging percentage is NaN: ${r}`), !0;
    n = n / 100;
    const i = await this.stagingUserIdPromise.value, a = Se.UUID.parse(i).readUInt32BE(12) / 4294967295;
    return this._logger.info(`Staging percentage: ${n}, percentage: ${a}, user id: ${i}`), a < n;
  }
  computeFinalHeaders(t) {
    return this.requestHeaders != null && Object.assign(t, this.requestHeaders), t;
  }
  async isUpdateAvailable(t) {
    const r = (0, Ot.parse)(t.version);
    if (r == null)
      throw (0, Se.newError)(`This file could not be downloaded, or the latest version (from update server) does not have a valid semver version: "${t.version}"`, "ERR_UPDATER_INVALID_VERSION");
    const n = this.currentVersion;
    if ((0, Ot.eq)(r, n) || !await Promise.resolve(this.isUpdateSupported(t)) || !await this.isStagingMatch(t))
      return !1;
    const o = (0, Ot.gt)(r, n), a = (0, Ot.lt)(r, n);
    return o ? !0 : this.allowDowngrade && a;
  }
  checkIfUpdateSupported(t) {
    const r = t == null ? void 0 : t.minimumSystemVersion, n = (0, mw.release)();
    if (r)
      try {
        if ((0, Ot.lt)(n, r))
          return this._logger.info(`Current OS version ${n} is less than the minimum OS version required ${r} for version ${n}`), !1;
      } catch (i) {
        this._logger.warn(`Failed to compare current OS version(${n}) with minimum OS version(${r}): ${(i.message || i).toString()}`);
      }
    return !0;
  }
  async getUpdateInfoAndProvider() {
    await this.app.whenReady(), this.clientPromise == null && (this.clientPromise = this.configOnDisk.value.then((n) => (0, Ki.createClient)(n, this, this.createProviderRuntimeOptions())));
    const t = await this.clientPromise, r = await this.stagingUserIdPromise.value;
    return t.setRequestHeaders(this.computeFinalHeaders({ "x-user-staging-id": r })), {
      info: await t.getLatestVersion(),
      provider: t
    };
  }
  createProviderRuntimeOptions() {
    return {
      isUseMultipleRangeRequest: !0,
      platform: this._testOnlyOptions == null ? process.platform : this._testOnlyOptions.platform,
      executor: this.httpExecutor
    };
  }
  async doCheckForUpdates() {
    this.emit("checking-for-update");
    const t = await this.getUpdateInfoAndProvider(), r = t.info;
    if (!await this.isUpdateAvailable(r))
      return this._logger.info(`Update for version ${this.currentVersion.format()} is not available (latest version: ${r.version}, downgrade is ${this.allowDowngrade ? "allowed" : "disallowed"}).`), this.emit("update-not-available", r), {
        isUpdateAvailable: !1,
        versionInfo: r,
        updateInfo: r
      };
    this.updateInfoAndProvider = t, this.onUpdateAvailable(r);
    const n = new Se.CancellationToken();
    return {
      isUpdateAvailable: !0,
      versionInfo: r,
      updateInfo: r,
      cancellationToken: n,
      downloadPromise: this.autoDownload ? this.downloadUpdate(n) : null
    };
  }
  onUpdateAvailable(t) {
    this._logger.info(`Found version ${t.version} (url: ${(0, Se.asArray)(t.files).map((r) => r.url).join(", ")})`), this.emit("update-available", t);
  }
  /**
   * Start downloading update manually. You can use this method if `autoDownload` option is set to `false`.
   * @returns {Promise<Array<string>>} Paths to downloaded files.
   */
  downloadUpdate(t = new Se.CancellationToken()) {
    const r = this.updateInfoAndProvider;
    if (r == null) {
      const i = new Error("Please check update first");
      return this.dispatchError(i), Promise.reject(i);
    }
    if (this.downloadPromise != null)
      return this._logger.info("Downloading update (already in progress)"), this.downloadPromise;
    this._logger.info(`Downloading update from ${(0, Se.asArray)(r.info.files).map((i) => i.url).join(", ")}`);
    const n = (i) => {
      if (!(i instanceof Se.CancellationError))
        try {
          this.dispatchError(i);
        } catch (o) {
          this._logger.warn(`Cannot dispatch error event: ${o.stack || o}`);
        }
      return i;
    };
    return this.downloadPromise = this.doDownloadUpdate({
      updateInfoAndProvider: r,
      requestHeaders: this.computeRequestHeaders(r.provider),
      cancellationToken: t,
      disableWebInstaller: this.disableWebInstaller,
      disableDifferentialDownload: this.disableDifferentialDownload
    }).catch((i) => {
      throw n(i);
    }).finally(() => {
      this.downloadPromise = null;
    }), this.downloadPromise;
  }
  dispatchError(t) {
    this.emit("error", t, (t.stack || t).toString());
  }
  dispatchUpdateDownloaded(t) {
    this.emit(qt.UPDATE_DOWNLOADED, t);
  }
  async loadUpdateConfig() {
    return this._appUpdateConfigPath == null && (this._appUpdateConfigPath = this.app.appUpdateConfigPath), (0, yw.load)(await (0, Ht.readFile)(this._appUpdateConfigPath, "utf-8"));
  }
  computeRequestHeaders(t) {
    const r = t.fileExtraDownloadHeaders;
    if (r != null) {
      const n = this.requestHeaders;
      return n == null ? r : {
        ...r,
        ...n
      };
    }
    return this.computeFinalHeaders({ accept: "*/*" });
  }
  async getOrCreateStagingUserId() {
    const t = bt.join(this.app.userDataPath, ".updaterId");
    try {
      const n = await (0, Ht.readFile)(t, "utf-8");
      if (Se.UUID.check(n))
        return n;
      this._logger.warn(`Staging user id file exists, but content was invalid: ${n}`);
    } catch (n) {
      n.code !== "ENOENT" && this._logger.warn(`Couldn't read staging user ID, creating a blank one: ${n}`);
    }
    const r = Se.UUID.v5((0, pw.randomBytes)(4096), Se.UUID.OID);
    this._logger.info(`Generated new staging user ID: ${r}`);
    try {
      await (0, Ht.outputFile)(t, r);
    } catch (n) {
      this._logger.warn(`Couldn't write out staging user ID: ${n}`);
    }
    return r;
  }
  /** @internal */
  get isAddNoCacheQuery() {
    const t = this.requestHeaders;
    if (t == null)
      return !0;
    for (const r of Object.keys(t)) {
      const n = r.toLowerCase();
      if (n === "authorization" || n === "private-token")
        return !1;
    }
    return !0;
  }
  async getOrCreateDownloadHelper() {
    let t = this.downloadedUpdateHelper;
    if (t == null) {
      const r = (await this.configOnDisk.value).updaterCacheDirName, n = this._logger;
      r == null && n.error("updaterCacheDirName is not specified in app-update.yml Was app build using at least electron-builder 20.34.0?");
      const i = bt.join(this.app.baseCachePath, r || this.app.name);
      n.debug != null && n.debug(`updater cache dir: ${i}`), t = new Ks.DownloadedUpdateHelper(i), this.downloadedUpdateHelper = t;
    }
    return t;
  }
  async executeDownload(t) {
    const r = t.fileInfo, n = {
      headers: t.downloadUpdateOptions.requestHeaders,
      cancellationToken: t.downloadUpdateOptions.cancellationToken,
      sha2: r.info.sha2,
      sha512: r.info.sha512
    };
    this.listenerCount(qt.DOWNLOAD_PROGRESS) > 0 && (n.onProgress = (A) => this.emit(qt.DOWNLOAD_PROGRESS, A));
    const i = t.downloadUpdateOptions.updateInfoAndProvider.info, o = i.version, a = r.packageInfo;
    function s() {
      const A = decodeURIComponent(t.fileInfo.url.pathname);
      return A.endsWith(`.${t.fileExtension}`) ? bt.basename(A) : t.fileInfo.info.url;
    }
    const l = await this.getOrCreateDownloadHelper(), d = l.cacheDirForPendingUpdate;
    await (0, Ht.mkdir)(d, { recursive: !0 });
    const f = s();
    let u = bt.join(d, f);
    const p = a == null ? null : bt.join(d, `package-${o}${bt.extname(a.path) || ".7z"}`), g = async (A) => (await l.setDownloadedFile(u, p, i, r, f, A), await t.done({
      ...i,
      downloadedFile: u
    }), p == null ? [u] : [u, p]), E = this._logger, S = await l.validateDownloadedPath(u, i, r, E);
    if (S != null)
      return u = S, await g(!1);
    const _ = async () => (await l.clear().catch(() => {
    }), await (0, Ht.unlink)(u).catch(() => {
    })), T = await (0, Ks.createTempUpdateFile)(`temp-${f}`, d, E);
    try {
      await t.task(T, n, p, _), await (0, Se.retry)(() => (0, Ht.rename)(T, u), 60, 500, 0, 0, (A) => A instanceof Error && /^EBUSY:/.test(A.message));
    } catch (A) {
      throw await _(), A instanceof Se.CancellationError && (E.info("cancelled"), this.emit("update-cancelled", i)), A;
    }
    return E.info(`New version ${o} has been downloaded to ${u}`), await g(!0);
  }
  async differentialDownloadInstaller(t, r, n, i, o) {
    try {
      if (this._testOnlyOptions != null && !this._testOnlyOptions.isUseDifferentialDownload)
        return !0;
      const a = (0, _w.blockmapFiles)(t.url, this.app.version, r.updateInfoAndProvider.info.version);
      this._logger.info(`Download block maps (old: "${a[0]}", new: ${a[1]})`);
      const s = async (f) => {
        const u = await this.httpExecutor.downloadToBuffer(f, {
          headers: r.requestHeaders,
          cancellationToken: r.cancellationToken
        });
        if (u == null || u.length === 0)
          throw new Error(`Blockmap "${f.href}" is empty`);
        try {
          return JSON.parse((0, ww.gunzipSync)(u).toString());
        } catch (p) {
          throw new Error(`Cannot parse blockmap "${f.href}", error: ${p}`);
        }
      }, l = {
        newUrl: t.url,
        oldFile: bt.join(this.downloadedUpdateHelper.cacheDir, o),
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: r.requestHeaders,
        cancellationToken: r.cancellationToken
      };
      this.listenerCount(qt.DOWNLOAD_PROGRESS) > 0 && (l.onProgress = (f) => this.emit(qt.DOWNLOAD_PROGRESS, f));
      const d = await Promise.all(a.map((f) => s(f)));
      return await new Sw.GenericDifferentialDownloader(t.info, this.httpExecutor, l).download(d[0], d[1]), !1;
    } catch (a) {
      if (this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), this._testOnlyOptions != null)
        throw a;
      return !0;
    }
  }
}
pt.AppUpdater = zo;
function Aw(e) {
  const t = (0, Ot.prerelease)(e);
  return t != null && t.length > 0;
}
class Cu {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  info(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  warn(t) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  error(t) {
  }
}
pt.NoOpLogger = Cu;
Object.defineProperty(rt, "__esModule", { value: !0 });
rt.BaseUpdater = void 0;
const Qs = Wn, Tw = pt;
class Cw extends Tw.AppUpdater {
  constructor(t, r) {
    super(t, r), this.quitAndInstallCalled = !1, this.quitHandlerAdded = !1;
  }
  quitAndInstall(t = !1, r = !1) {
    this._logger.info("Install on explicit quitAndInstall"), this.install(t, t ? r : this.autoRunAppAfterInstall) ? setImmediate(() => {
      ht.autoUpdater.emit("before-quit-for-update"), this.app.quit();
    }) : this.quitAndInstallCalled = !1;
  }
  executeDownload(t) {
    return super.executeDownload({
      ...t,
      done: (r) => (this.dispatchUpdateDownloaded(r), this.addQuitHandler(), Promise.resolve())
    });
  }
  get installerPath() {
    return this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.file;
  }
  // must be sync (because quit even handler is not async)
  install(t = !1, r = !1) {
    if (this.quitAndInstallCalled)
      return this._logger.warn("install call ignored: quitAndInstallCalled is set to true"), !1;
    const n = this.downloadedUpdateHelper, i = this.installerPath, o = n == null ? null : n.downloadedFileInfo;
    if (i == null || o == null)
      return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
    this.quitAndInstallCalled = !0;
    try {
      return this._logger.info(`Install: isSilent: ${t}, isForceRunAfter: ${r}`), this.doInstall({
        isSilent: t,
        isForceRunAfter: r,
        isAdminRightsRequired: o.isAdminRightsRequired
      });
    } catch (a) {
      return this.dispatchError(a), !1;
    }
  }
  addQuitHandler() {
    this.quitHandlerAdded || !this.autoInstallOnAppQuit || (this.quitHandlerAdded = !0, this.app.onQuit((t) => {
      if (this.quitAndInstallCalled) {
        this._logger.info("Update installer has already been triggered. Quitting application.");
        return;
      }
      if (!this.autoInstallOnAppQuit) {
        this._logger.info("Update will not be installed on quit because autoInstallOnAppQuit is set to false.");
        return;
      }
      if (t !== 0) {
        this._logger.info(`Update will be not installed on quit because application is quitting with exit code ${t}`);
        return;
      }
      this._logger.info("Auto install update on quit"), this.install(!0, !1);
    }));
  }
  wrapSudo() {
    const { name: t } = this.app, r = `"${t} would like to update"`, n = this.spawnSyncLog("which gksudo || which kdesudo || which pkexec || which beesu"), i = [n];
    return /kdesudo/i.test(n) ? (i.push("--comment", r), i.push("-c")) : /gksudo/i.test(n) ? i.push("--message", r) : /pkexec/i.test(n) && i.push("--disable-internal-agent"), i.join(" ");
  }
  spawnSyncLog(t, r = [], n = {}) {
    this._logger.info(`Executing: ${t} with args: ${r}`);
    const i = (0, Qs.spawnSync)(t, r, {
      env: { ...process.env, ...n },
      encoding: "utf-8",
      shell: !0
    }), { error: o, status: a, stdout: s, stderr: l } = i;
    if (o != null)
      throw this._logger.error(l), o;
    if (a != null && a !== 0)
      throw this._logger.error(l), new Error(`Command ${t} exited with code ${a}`);
    return s.trim();
  }
  /**
   * This handles both node 8 and node 10 way of emitting error when spawning a process
   *   - node 8: Throws the error
   *   - node 10: Emit the error(Need to listen with on)
   */
  // https://github.com/electron-userland/electron-builder/issues/1129
  // Node 8 sends errors: https://nodejs.org/dist/latest-v8.x/docs/api/errors.html#errors_common_system_errors
  async spawnLog(t, r = [], n = void 0, i = "ignore") {
    return this._logger.info(`Executing: ${t} with args: ${r}`), new Promise((o, a) => {
      try {
        const s = { stdio: i, env: n, detached: !0 }, l = (0, Qs.spawn)(t, r, s);
        l.on("error", (d) => {
          a(d);
        }), l.unref(), l.pid !== void 0 && o(!0);
      } catch (s) {
        a(s);
      }
    });
  }
}
rt.BaseUpdater = Cw;
var Fr = {}, Qr = {};
Object.defineProperty(Qr, "__esModule", { value: !0 });
Qr.FileWithEmbeddedBlockMapDifferentialDownloader = void 0;
const Gt = vt, bw = Jr, $w = vl;
class Ow extends bw.DifferentialDownloader {
  async download() {
    const t = this.blockAwareFileInfo, r = t.size, n = r - (t.blockMapSize + 4);
    this.fileMetadataBuffer = await this.readRemoteBytes(n, r - 1);
    const i = bu(this.fileMetadataBuffer.slice(0, this.fileMetadataBuffer.length - 4));
    await this.doDownload(await Iw(this.options.oldFile), i);
  }
}
Qr.FileWithEmbeddedBlockMapDifferentialDownloader = Ow;
function bu(e) {
  return JSON.parse((0, $w.inflateRawSync)(e).toString());
}
async function Iw(e) {
  const t = await (0, Gt.open)(e, "r");
  try {
    const r = (await (0, Gt.fstat)(t)).size, n = Buffer.allocUnsafe(4);
    await (0, Gt.read)(t, n, 0, n.length, r - n.length);
    const i = Buffer.allocUnsafe(n.readUInt32BE(0));
    return await (0, Gt.read)(t, i, 0, i.length, r - n.length - i.length), await (0, Gt.close)(t), bu(i);
  } catch (r) {
    throw await (0, Gt.close)(t), r;
  }
}
Object.defineProperty(Fr, "__esModule", { value: !0 });
Fr.AppImageUpdater = void 0;
const Zs = he, el = Wn, Pw = vt, Rw = tt, Er = ee, Nw = rt, Dw = Qr, Fw = ce, tl = wt;
class xw extends Nw.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  isUpdaterActive() {
    return process.env.APPIMAGE == null ? (process.env.SNAP == null ? this._logger.warn("APPIMAGE env is not defined, current application is not an AppImage") : this._logger.info("SNAP env is defined, updater is disabled"), !1) : super.isUpdaterActive();
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, Fw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "AppImage", ["rpm", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "AppImage",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        const a = process.env.APPIMAGE;
        if (a == null)
          throw (0, Zs.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
        (t.disableDifferentialDownload || await this.downloadDifferential(n, a, i, r, t)) && await this.httpExecutor.download(n.url, i, o), await (0, Pw.chmod)(i, 493);
      }
    });
  }
  async downloadDifferential(t, r, n, i, o) {
    try {
      const a = {
        newUrl: t.url,
        oldFile: r,
        logger: this._logger,
        newFile: n,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        requestHeaders: o.requestHeaders,
        cancellationToken: o.cancellationToken
      };
      return this.listenerCount(tl.DOWNLOAD_PROGRESS) > 0 && (a.onProgress = (s) => this.emit(tl.DOWNLOAD_PROGRESS, s)), await new Dw.FileWithEmbeddedBlockMapDifferentialDownloader(t.info, this.httpExecutor, a).download(), !1;
    } catch (a) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${a.stack || a}`), process.platform === "linux";
    }
  }
  doInstall(t) {
    const r = process.env.APPIMAGE;
    if (r == null)
      throw (0, Zs.newError)("APPIMAGE env is not defined", "ERR_UPDATER_OLD_FILE_NOT_FOUND");
    (0, Rw.unlinkSync)(r);
    let n;
    const i = Er.basename(r), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
    Er.basename(o) === i || !/\d+\.\d+\.\d+/.test(i) ? n = r : n = Er.join(Er.dirname(r), Er.basename(o)), (0, el.execFileSync)("mv", ["-f", o, n]), n !== r && this.emit("appimage-filename-updated", n);
    const a = {
      ...process.env,
      APPIMAGE_SILENT_INSTALL: "true"
    };
    return t.isForceRunAfter ? this.spawnLog(n, [], a) : (a.APPIMAGE_EXIT_AFTER_INSTALL = "true", (0, el.execFileSync)(n, [], { env: a })), !0;
  }
}
Fr.AppImageUpdater = xw;
var xr = {};
Object.defineProperty(xr, "__esModule", { value: !0 });
xr.DebUpdater = void 0;
const Lw = rt, Uw = ce, rl = wt;
class kw extends Lw.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, Uw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "deb", ["AppImage", "rpm", "pacman"]);
    return this.executeDownload({
      fileExtension: "deb",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(rl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(rl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  get installerPath() {
    var t, r;
    return (r = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/ /g, "\\ ")) !== null && r !== void 0 ? r : null;
  }
  doInstall(t) {
    const r = this.wrapSudo(), n = /pkexec/i.test(r) ? "" : '"', i = this.installerPath;
    if (i == null)
      return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
    const o = ["dpkg", "-i", i, "||", "apt-get", "install", "-f", "-y"];
    return this.spawnSyncLog(r, [`${n}/bin/bash`, "-c", `'${o.join(" ")}'${n}`]), t.isForceRunAfter && this.app.relaunch(), !0;
  }
}
xr.DebUpdater = kw;
var Lr = {};
Object.defineProperty(Lr, "__esModule", { value: !0 });
Lr.PacmanUpdater = void 0;
const Mw = rt, nl = wt, Bw = ce;
class jw extends Mw.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, Bw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "pacman", ["AppImage", "deb", "rpm"]);
    return this.executeDownload({
      fileExtension: "pacman",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(nl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(nl.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  get installerPath() {
    var t, r;
    return (r = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/ /g, "\\ ")) !== null && r !== void 0 ? r : null;
  }
  doInstall(t) {
    const r = this.wrapSudo(), n = /pkexec/i.test(r) ? "" : '"', i = this.installerPath;
    if (i == null)
      return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
    const o = ["pacman", "-U", "--noconfirm", i];
    return this.spawnSyncLog(r, [`${n}/bin/bash`, "-c", `'${o.join(" ")}'${n}`]), t.isForceRunAfter && this.app.relaunch(), !0;
  }
}
Lr.PacmanUpdater = jw;
var Ur = {};
Object.defineProperty(Ur, "__esModule", { value: !0 });
Ur.RpmUpdater = void 0;
const Hw = rt, il = wt, qw = ce;
class Gw extends Hw.BaseUpdater {
  constructor(t, r) {
    super(t, r);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, qw.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "rpm", ["AppImage", "deb", "pacman"]);
    return this.executeDownload({
      fileExtension: "rpm",
      fileInfo: n,
      downloadUpdateOptions: t,
      task: async (i, o) => {
        this.listenerCount(il.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(il.DOWNLOAD_PROGRESS, a)), await this.httpExecutor.download(n.url, i, o);
      }
    });
  }
  get installerPath() {
    var t, r;
    return (r = (t = super.installerPath) === null || t === void 0 ? void 0 : t.replace(/ /g, "\\ ")) !== null && r !== void 0 ? r : null;
  }
  doInstall(t) {
    const r = this.wrapSudo(), n = /pkexec/i.test(r) ? "" : '"', i = this.spawnSyncLog("which zypper"), o = this.installerPath;
    if (o == null)
      return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
    let a;
    return i ? a = [i, "--no-refresh", "install", "--allow-unsigned-rpm", "-y", "-f", o] : a = [this.spawnSyncLog("which dnf || which yum"), "-y", "install", o], this.spawnSyncLog(r, [`${n}/bin/bash`, "-c", `'${a.join(" ")}'${n}`]), t.isForceRunAfter && this.app.relaunch(), !0;
  }
}
Ur.RpmUpdater = Gw;
var kr = {};
Object.defineProperty(kr, "__esModule", { value: !0 });
kr.MacUpdater = void 0;
const ol = he, Ji = vt, Ww = tt, al = ee, Vw = Lf, Yw = pt, zw = ce, sl = Wn, ll = Hr;
class Xw extends Yw.AppUpdater {
  constructor(t, r) {
    super(t, r), this.nativeUpdater = ht.autoUpdater, this.squirrelDownloadedUpdate = !1, this.nativeUpdater.on("error", (n) => {
      this._logger.warn(n), this.emit("error", n);
    }), this.nativeUpdater.on("update-downloaded", () => {
      this.squirrelDownloadedUpdate = !0, this.debug("nativeUpdater.update-downloaded");
    });
  }
  debug(t) {
    this._logger.debug != null && this._logger.debug(t);
  }
  closeServerIfExists() {
    this.server && (this.debug("Closing proxy server"), this.server.close((t) => {
      t && this.debug("proxy server wasn't already open, probably attempted closing again as a safety check before quit");
    }));
  }
  async doDownloadUpdate(t) {
    let r = t.updateInfoAndProvider.provider.resolveFiles(t.updateInfoAndProvider.info);
    const n = this._logger, i = "sysctl.proc_translated";
    let o = !1;
    try {
      this.debug("Checking for macOS Rosetta environment"), o = (0, sl.execFileSync)("sysctl", [i], { encoding: "utf8" }).includes(`${i}: 1`), n.info(`Checked for macOS Rosetta environment (isRosetta=${o})`);
    } catch (u) {
      n.warn(`sysctl shell command to check for macOS Rosetta environment failed: ${u}`);
    }
    let a = !1;
    try {
      this.debug("Checking for arm64 in uname");
      const p = (0, sl.execFileSync)("uname", ["-a"], { encoding: "utf8" }).includes("ARM");
      n.info(`Checked 'uname -a': arm64=${p}`), a = a || p;
    } catch (u) {
      n.warn(`uname shell command to check for arm64 failed: ${u}`);
    }
    a = a || process.arch === "arm64" || o;
    const s = (u) => {
      var p;
      return u.url.pathname.includes("arm64") || ((p = u.info.url) === null || p === void 0 ? void 0 : p.includes("arm64"));
    };
    a && r.some(s) ? r = r.filter((u) => a === s(u)) : r = r.filter((u) => !s(u));
    const l = (0, zw.findFile)(r, "zip", ["pkg", "dmg"]);
    if (l == null)
      throw (0, ol.newError)(`ZIP file not provided: ${(0, ol.safeStringifyJson)(r)}`, "ERR_UPDATER_ZIP_FILE_NOT_FOUND");
    const d = t.updateInfoAndProvider.provider, f = "update.zip";
    return this.executeDownload({
      fileExtension: "zip",
      fileInfo: l,
      downloadUpdateOptions: t,
      task: async (u, p) => {
        const g = al.join(this.downloadedUpdateHelper.cacheDir, f), E = () => (0, Ji.pathExistsSync)(g) ? !t.disableDifferentialDownload : (n.info("Unable to locate previous update.zip for differential download (is this first install?), falling back to full download"), !1);
        let S = !0;
        E() && (S = await this.differentialDownloadInstaller(l, t, u, d, f)), S && await this.httpExecutor.download(l.url, u, p);
      },
      done: async (u) => {
        if (!t.disableDifferentialDownload)
          try {
            const p = al.join(this.downloadedUpdateHelper.cacheDir, f);
            await (0, Ji.copyFile)(u.downloadedFile, p);
          } catch (p) {
            this._logger.warn(`Unable to copy file for caching for future differential downloads: ${p.message}`);
          }
        return this.updateDownloaded(l, u);
      }
    });
  }
  async updateDownloaded(t, r) {
    var n;
    const i = r.downloadedFile, o = (n = t.info.size) !== null && n !== void 0 ? n : (await (0, Ji.stat)(i)).size, a = this._logger, s = `fileToProxy=${t.url.href}`;
    this.closeServerIfExists(), this.debug(`Creating proxy server for native Squirrel.Mac (${s})`), this.server = (0, Vw.createServer)(), this.debug(`Proxy server for native Squirrel.Mac is created (${s})`), this.server.on("close", () => {
      a.info(`Proxy server for native Squirrel.Mac is closed (${s})`);
    });
    const l = (d) => {
      const f = d.address();
      return typeof f == "string" ? f : `http://127.0.0.1:${f == null ? void 0 : f.port}`;
    };
    return await new Promise((d, f) => {
      const u = (0, ll.randomBytes)(64).toString("base64").replace(/\//g, "_").replace(/\+/g, "-"), p = Buffer.from(`autoupdater:${u}`, "ascii"), g = `/${(0, ll.randomBytes)(64).toString("hex")}.zip`;
      this.server.on("request", (E, S) => {
        const _ = E.url;
        if (a.info(`${_} requested`), _ === "/") {
          if (!E.headers.authorization || E.headers.authorization.indexOf("Basic ") === -1) {
            S.statusCode = 401, S.statusMessage = "Invalid Authentication Credentials", S.end(), a.warn("No authenthication info");
            return;
          }
          const N = E.headers.authorization.split(" ")[1], L = Buffer.from(N, "base64").toString("ascii"), [Z, ae] = L.split(":");
          if (Z !== "autoupdater" || ae !== u) {
            S.statusCode = 401, S.statusMessage = "Invalid Authentication Credentials", S.end(), a.warn("Invalid authenthication credentials");
            return;
          }
          const V = Buffer.from(`{ "url": "${l(this.server)}${g}" }`);
          S.writeHead(200, { "Content-Type": "application/json", "Content-Length": V.length }), S.end(V);
          return;
        }
        if (!_.startsWith(g)) {
          a.warn(`${_} requested, but not supported`), S.writeHead(404), S.end();
          return;
        }
        a.info(`${g} requested by Squirrel.Mac, pipe ${i}`);
        let T = !1;
        S.on("finish", () => {
          T || (this.nativeUpdater.removeListener("error", f), d([]));
        });
        const A = (0, Ww.createReadStream)(i);
        A.on("error", (N) => {
          try {
            S.end();
          } catch (L) {
            a.warn(`cannot end response: ${L}`);
          }
          T = !0, this.nativeUpdater.removeListener("error", f), f(new Error(`Cannot pipe "${i}": ${N}`));
        }), S.writeHead(200, {
          "Content-Type": "application/zip",
          "Content-Length": o
        }), A.pipe(S);
      }), this.debug(`Proxy server for native Squirrel.Mac is starting to listen (${s})`), this.server.listen(0, "127.0.0.1", () => {
        this.debug(`Proxy server for native Squirrel.Mac is listening (address=${l(this.server)}, ${s})`), this.nativeUpdater.setFeedURL({
          url: l(this.server),
          headers: {
            "Cache-Control": "no-cache",
            Authorization: `Basic ${p.toString("base64")}`
          }
        }), this.dispatchUpdateDownloaded(r), this.autoInstallOnAppQuit ? (this.nativeUpdater.once("error", f), this.nativeUpdater.checkForUpdates()) : d([]);
      });
    });
  }
  handleUpdateDownloaded() {
    this.autoRunAppAfterInstall ? this.nativeUpdater.quitAndInstall() : this.app.quit(), this.closeServerIfExists();
  }
  quitAndInstall() {
    this.squirrelDownloadedUpdate ? this.handleUpdateDownloaded() : (this.nativeUpdater.on("update-downloaded", () => this.handleUpdateDownloaded()), this.autoInstallOnAppQuit || this.nativeUpdater.checkForUpdates());
  }
}
kr.MacUpdater = Xw;
var Mr = {}, Xo = {};
Object.defineProperty(Xo, "__esModule", { value: !0 });
Xo.verifySignature = Jw;
const cl = he, $u = Wn, Kw = Vn, ul = ee;
function Jw(e, t, r) {
  return new Promise((n, i) => {
    const o = t.replace(/'/g, "''");
    r.info(`Verifying signature ${o}`), (0, $u.execFile)('set "PSModulePath=" & chcp 65001 >NUL & powershell.exe', ["-NoProfile", "-NonInteractive", "-InputFormat", "None", "-Command", `"Get-AuthenticodeSignature -LiteralPath '${o}' | ConvertTo-Json -Compress"`], {
      shell: !0,
      timeout: 20 * 1e3
    }, (a, s, l) => {
      var d;
      try {
        if (a != null || l) {
          Qi(r, a, l, i), n(null);
          return;
        }
        const f = Qw(s);
        if (f.Status === 0) {
          try {
            const E = ul.normalize(f.Path), S = ul.normalize(t);
            if (r.info(`LiteralPath: ${E}. Update Path: ${S}`), E !== S) {
              Qi(r, new Error(`LiteralPath of ${E} is different than ${S}`), l, i), n(null);
              return;
            }
          } catch (E) {
            r.warn(`Unable to verify LiteralPath of update asset due to missing data.Path. Skipping this step of validation. Message: ${(d = E.message) !== null && d !== void 0 ? d : E.stack}`);
          }
          const p = (0, cl.parseDn)(f.SignerCertificate.Subject);
          let g = !1;
          for (const E of e) {
            const S = (0, cl.parseDn)(E);
            if (S.size ? g = Array.from(S.keys()).every((T) => S.get(T) === p.get(T)) : E === p.get("CN") && (r.warn(`Signature validated using only CN ${E}. Please add your full Distinguished Name (DN) to publisherNames configuration`), g = !0), g) {
              n(null);
              return;
            }
          }
        }
        const u = `publisherNames: ${e.join(" | ")}, raw info: ` + JSON.stringify(f, (p, g) => p === "RawData" ? void 0 : g, 2);
        r.warn(`Sign verification failed, installer signed with incorrect certificate: ${u}`), n(u);
      } catch (f) {
        Qi(r, f, null, i), n(null);
        return;
      }
    });
  });
}
function Qw(e) {
  const t = JSON.parse(e);
  delete t.PrivateKey, delete t.IsOSBinary, delete t.SignatureType;
  const r = t.SignerCertificate;
  return r != null && (delete r.Archived, delete r.Extensions, delete r.Handle, delete r.HasPrivateKey, delete r.SubjectName), t;
}
function Qi(e, t, r, n) {
  if (Zw()) {
    e.warn(`Cannot execute Get-AuthenticodeSignature: ${t || r}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  try {
    (0, $u.execFileSync)("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "ConvertTo-Json test"], { timeout: 10 * 1e3 });
  } catch (i) {
    e.warn(`Cannot execute ConvertTo-Json: ${i.message}. Ignoring signature validation due to unsupported powershell version. Please upgrade to powershell 3 or higher.`);
    return;
  }
  t != null && n(t), r && n(new Error(`Cannot execute Get-AuthenticodeSignature, stderr: ${r}. Failing signature validation due to unknown stderr.`));
}
function Zw() {
  const e = Kw.release();
  return e.startsWith("6.") && !e.startsWith("6.3");
}
Object.defineProperty(Mr, "__esModule", { value: !0 });
Mr.NsisUpdater = void 0;
const Tn = he, fl = ee, e_ = rt, t_ = Qr, dl = wt, r_ = ce, n_ = vt, i_ = Xo, hl = ir;
class o_ extends e_.BaseUpdater {
  constructor(t, r) {
    super(t, r), this._verifyUpdateCodeSignature = (n, i) => (0, i_.verifySignature)(n, i, this._logger);
  }
  /**
   * The verifyUpdateCodeSignature. You can pass [win-verify-signature](https://github.com/beyondkmp/win-verify-trust) or another custom verify function: ` (publisherName: string[], path: string) => Promise<string | null>`.
   * The default verify function uses [windowsExecutableCodeSignatureVerifier](https://github.com/electron-userland/electron-builder/blob/master/packages/electron-updater/src/windowsExecutableCodeSignatureVerifier.ts)
   */
  get verifyUpdateCodeSignature() {
    return this._verifyUpdateCodeSignature;
  }
  set verifyUpdateCodeSignature(t) {
    t && (this._verifyUpdateCodeSignature = t);
  }
  /*** @private */
  doDownloadUpdate(t) {
    const r = t.updateInfoAndProvider.provider, n = (0, r_.findFile)(r.resolveFiles(t.updateInfoAndProvider.info), "exe");
    return this.executeDownload({
      fileExtension: "exe",
      downloadUpdateOptions: t,
      fileInfo: n,
      task: async (i, o, a, s) => {
        const l = n.packageInfo, d = l != null && a != null;
        if (d && t.disableWebInstaller)
          throw (0, Tn.newError)(`Unable to download new version ${t.updateInfoAndProvider.info.version}. Web Installers are disabled`, "ERR_UPDATER_WEB_INSTALLER_DISABLED");
        !d && !t.disableWebInstaller && this._logger.warn("disableWebInstaller is set to false, you should set it to true if you do not plan on using a web installer. This will default to true in a future version."), (d || t.disableDifferentialDownload || await this.differentialDownloadInstaller(n, t, i, r, Tn.CURRENT_APP_INSTALLER_FILE_NAME)) && await this.httpExecutor.download(n.url, i, o);
        const f = await this.verifySignature(i);
        if (f != null)
          throw await s(), (0, Tn.newError)(`New version ${t.updateInfoAndProvider.info.version} is not signed by the application owner: ${f}`, "ERR_UPDATER_INVALID_SIGNATURE");
        if (d && await this.differentialDownloadWebPackage(t, l, a, r))
          try {
            await this.httpExecutor.download(new hl.URL(l.path), a, {
              headers: t.requestHeaders,
              cancellationToken: t.cancellationToken,
              sha512: l.sha512
            });
          } catch (u) {
            try {
              await (0, n_.unlink)(a);
            } catch {
            }
            throw u;
          }
      }
    });
  }
  // $certificateInfo = (Get-AuthenticodeSignature 'xxx\yyy.exe'
  // | where {$_.Status.Equals([System.Management.Automation.SignatureStatus]::Valid) -and $_.SignerCertificate.Subject.Contains("CN=siemens.com")})
  // | Out-String ; if ($certificateInfo) { exit 0 } else { exit 1 }
  async verifySignature(t) {
    let r;
    try {
      if (r = (await this.configOnDisk.value).publisherName, r == null)
        return null;
    } catch (n) {
      if (n.code === "ENOENT")
        return null;
      throw n;
    }
    return await this._verifyUpdateCodeSignature(Array.isArray(r) ? r : [r], t);
  }
  doInstall(t) {
    const r = this.installerPath;
    if (r == null)
      return this.dispatchError(new Error("No valid update available, can't quit and install")), !1;
    const n = ["--updated"];
    t.isSilent && n.push("/S"), t.isForceRunAfter && n.push("--force-run"), this.installDirectory && n.push(`/D=${this.installDirectory}`);
    const i = this.downloadedUpdateHelper == null ? null : this.downloadedUpdateHelper.packageFile;
    i != null && n.push(`--package-file=${i}`);
    const o = () => {
      this.spawnLog(fl.join(process.resourcesPath, "elevate.exe"), [r].concat(n)).catch((a) => this.dispatchError(a));
    };
    return t.isAdminRightsRequired ? (this._logger.info("isAdminRightsRequired is set to true, run installer using elevate.exe"), o(), !0) : (this.spawnLog(r, n).catch((a) => {
      const s = a.code;
      this._logger.info(`Cannot run installer: error code: ${s}, error message: "${a.message}", will be executed again using elevate if EACCES, and will try to use electron.shell.openItem if ENOENT`), s === "UNKNOWN" || s === "EACCES" ? o() : s === "ENOENT" ? ht.shell.openPath(r).catch((l) => this.dispatchError(l)) : this.dispatchError(a);
    }), !0);
  }
  async differentialDownloadWebPackage(t, r, n, i) {
    if (r.blockMapSize == null)
      return !0;
    try {
      const o = {
        newUrl: new hl.URL(r.path),
        oldFile: fl.join(this.downloadedUpdateHelper.cacheDir, Tn.CURRENT_APP_PACKAGE_FILE_NAME),
        logger: this._logger,
        newFile: n,
        requestHeaders: this.requestHeaders,
        isUseMultipleRangeRequest: i.isUseMultipleRangeRequest,
        cancellationToken: t.cancellationToken
      };
      this.listenerCount(dl.DOWNLOAD_PROGRESS) > 0 && (o.onProgress = (a) => this.emit(dl.DOWNLOAD_PROGRESS, a)), await new t_.FileWithEmbeddedBlockMapDifferentialDownloader(r, this.httpExecutor, o).download();
    } catch (o) {
      return this._logger.error(`Cannot download differentially, fallback to full download: ${o.stack || o}`), process.platform === "win32";
    }
    return !1;
  }
}
Mr.NsisUpdater = o_;
(function(e) {
  var t = Ae && Ae.__createBinding || (Object.create ? function(_, T, A, N) {
    N === void 0 && (N = A);
    var L = Object.getOwnPropertyDescriptor(T, A);
    (!L || ("get" in L ? !T.__esModule : L.writable || L.configurable)) && (L = { enumerable: !0, get: function() {
      return T[A];
    } }), Object.defineProperty(_, N, L);
  } : function(_, T, A, N) {
    N === void 0 && (N = A), _[N] = T[A];
  }), r = Ae && Ae.__exportStar || function(_, T) {
    for (var A in _) A !== "default" && !Object.prototype.hasOwnProperty.call(T, A) && t(T, _, A);
  };
  Object.defineProperty(e, "__esModule", { value: !0 }), e.NsisUpdater = e.MacUpdater = e.RpmUpdater = e.PacmanUpdater = e.DebUpdater = e.AppImageUpdater = e.Provider = e.NoOpLogger = e.AppUpdater = e.BaseUpdater = void 0;
  const n = vt, i = ee;
  var o = rt;
  Object.defineProperty(e, "BaseUpdater", { enumerable: !0, get: function() {
    return o.BaseUpdater;
  } });
  var a = pt;
  Object.defineProperty(e, "AppUpdater", { enumerable: !0, get: function() {
    return a.AppUpdater;
  } }), Object.defineProperty(e, "NoOpLogger", { enumerable: !0, get: function() {
    return a.NoOpLogger;
  } });
  var s = ce;
  Object.defineProperty(e, "Provider", { enumerable: !0, get: function() {
    return s.Provider;
  } });
  var l = Fr;
  Object.defineProperty(e, "AppImageUpdater", { enumerable: !0, get: function() {
    return l.AppImageUpdater;
  } });
  var d = xr;
  Object.defineProperty(e, "DebUpdater", { enumerable: !0, get: function() {
    return d.DebUpdater;
  } });
  var f = Lr;
  Object.defineProperty(e, "PacmanUpdater", { enumerable: !0, get: function() {
    return f.PacmanUpdater;
  } });
  var u = Ur;
  Object.defineProperty(e, "RpmUpdater", { enumerable: !0, get: function() {
    return u.RpmUpdater;
  } });
  var p = kr;
  Object.defineProperty(e, "MacUpdater", { enumerable: !0, get: function() {
    return p.MacUpdater;
  } });
  var g = Mr;
  Object.defineProperty(e, "NsisUpdater", { enumerable: !0, get: function() {
    return g.NsisUpdater;
  } }), r(wt, e);
  let E;
  function S() {
    if (process.platform === "win32")
      E = new Mr.NsisUpdater();
    else if (process.platform === "darwin")
      E = new kr.MacUpdater();
    else {
      E = new Fr.AppImageUpdater();
      try {
        const _ = i.join(process.resourcesPath, "package-type");
        if (!(0, n.existsSync)(_))
          return E;
        console.info("Checking for beta autoupdate feature for deb/rpm distributions");
        const T = (0, n.readFileSync)(_).toString().trim();
        switch (console.info("Found package-type:", T), T) {
          case "deb":
            E = new xr.DebUpdater();
            break;
          case "rpm":
            E = new Ur.RpmUpdater();
            break;
          case "pacman":
            E = new Lr.PacmanUpdater();
            break;
          default:
            break;
        }
      } catch (_) {
        console.warn("Unable to detect 'package-type' for autoUpdater (beta rpm/deb support). If you'd like to expand support, please consider contributing to electron-builder", _.message);
      }
    }
    return E;
  }
  Object.defineProperty(e, "autoUpdater", {
    enumerable: !0,
    get: () => E || S()
  });
})(wl);
const { app: et, BrowserWindow: Ou, ipcMain: ke, globalShortcut: yo, Menu: pl } = ht, Br = ee, Le = tt, { autoUpdater: Vt } = wl, a_ = et.getPath("userData"), Gn = Br.join(a_, "config"), Pn = Br.join(Gn, "prompts.json"), Rn = Br.join(Gn, "settings.json");
Le.existsSync(Gn) || Le.mkdirSync(Gn, { recursive: !0 });
let z = null;
const Cn = {
  theme: "system",
  font: "system-ui",
  fontSize: 14,
  alwaysOnTop: !1,
  globalShortcut: "CommandOrControl+Alt+P"
}, Zi = [
  {
    id: "1",
    title: "简单翻译",
    content: `请将以下文本翻译成中文:

`,
    category: "翻译",
    tags: ["简体中文", "基础"]
  },
  {
    id: "2",
    title: "代码解释",
    content: `请解释以下代码的功能和工作原理:

`,
    category: "编程",
    tags: ["代码", "解释"]
  },
  {
    id: "3",
    title: "文章摘要",
    content: `请为以下文章生成一个简洁的摘要，不超过100字:

`,
    category: "写作",
    tags: ["摘要", "总结"]
  }
];
function ml() {
  z = new Ou({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: !1,
    // 隐藏默认窗口边框
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "hidden",
    // 在 macOS 上使用 hiddenInset
    trafficLightPosition: { x: 20, y: 20 },
    // 设置 macOS 窗口控制按钮位置
    webPreferences: {
      nodeIntegration: !1,
      contextIsolation: !0,
      preload: Br.join(__dirname, "preload.cjs")
    }
  }), process.env.NODE_ENV === "development" ? (z.loadURL("http://localhost:5173"), z.webContents.openDevTools()) : z.loadFile(Br.join(__dirname, "../../dist/index.html")), z.on("closed", () => {
    z = null;
  });
  const t = Zr();
  z.setAlwaysOnTop(t.alwaysOnTop), Ko(t.globalShortcut);
}
et.whenReady().then(() => {
  ml(), Vt.autoDownload = !1, Vt.logger = console, Vt.on("update-available", (r) => {
    z && z.webContents.send("update-available", r);
  }), Vt.on("update-not-available", (r) => {
    z && z.webContents.send("update-not-available", r);
  }), Vt.on("error", (r) => {
    z && z.webContents.send("update-error", r);
  }), et.on("activate", () => {
    Ou.getAllWindows().length === 0 && ml();
  });
  const e = [
    {
      label: "PromptMate",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "quit" }
      ]
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" }
      ]
    },
    {
      label: "视图",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { type: "separator" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    }
  ], t = pl.buildFromTemplate(e);
  pl.setApplicationMenu(t);
});
et.on("will-quit", () => {
  yo.unregisterAll();
});
et.on("window-all-closed", () => {
  process.platform !== "darwin" && et.quit();
});
function Ko(e) {
  yo.unregisterAll(), yo.register(e, () => {
    z.isMinimized() && z.restore(), z.focus(), z.isVisible() || z.show();
  });
}
function Zr() {
  try {
    if (Le.existsSync(Rn)) {
      const e = Le.readFileSync(Rn, "utf8");
      return { ...Cn, ...JSON.parse(e) };
    }
    return Le.writeFileSync(Rn, JSON.stringify(Cn, null, 2)), Cn;
  } catch (e) {
    return console.error("读取设置出错:", e), Cn;
  }
}
function Jo(e) {
  try {
    return Le.writeFileSync(Rn, JSON.stringify(e, null, 2)), { success: !0 };
  } catch (t) {
    return console.error("保存设置出错:", t), { success: !1, error: t.message };
  }
}
function Iu() {
  try {
    if (Le.existsSync(Pn)) {
      const e = Le.readFileSync(Pn, "utf8");
      return { prompts: JSON.parse(e) };
    }
    return Le.writeFileSync(Pn, JSON.stringify(Zi, null, 2)), { prompts: Zi };
  } catch (e) {
    return console.error("读取提示词出错:", e), { prompts: Zi };
  }
}
function Pu(e) {
  try {
    return Le.writeFileSync(Pn, JSON.stringify(e.prompts, null, 2)), { success: !0 };
  } catch (t) {
    return console.error("保存提示词出错:", t), { success: !1, error: t.message };
  }
}
ke.handle("get-settings", () => Zr());
ke.handle("save-settings", (e, t) => {
  const r = Jo(t);
  return r.success && t.alwaysOnTop !== void 0 && z && z.setAlwaysOnTop(t.alwaysOnTop), r.success && t.globalShortcut && t.globalShortcut !== Zr().globalShortcut && Ko(t.globalShortcut), r;
});
ke.handle("get-prompts", () => Iu());
ke.handle("save-prompts", (e, t) => Pu(t));
ke.on("toggle-pin-window", (e, t) => {
  if (z) {
    z.setAlwaysOnTop(t);
    const r = Zr();
    r.alwaysOnTop = t, Jo(r);
  }
});
ke.on("minimize-window", () => {
  z && z.minimize();
});
ke.on("maximize-window", () => {
  z && (z.isMaximized() ? z.unmaximize() : z.maximize());
});
ke.on("close-window", () => {
  z && z.close();
});
ke.handle("export-data", async (e, { filePath: t }) => {
  try {
    const r = Zr(), { prompts: n } = Iu(), i = { settings: r, prompts: n };
    return Le.writeFileSync(t, JSON.stringify(i, null, 2)), { success: !0 };
  } catch (r) {
    return console.error("导出数据出错:", r), { success: !1, error: r.message };
  }
});
ke.handle("import-data", async (e, { filePath: t }) => {
  try {
    const r = JSON.parse(Le.readFileSync(t, "utf8"));
    return r.settings && (Jo(r.settings), z && r.settings.alwaysOnTop !== void 0 && z.setAlwaysOnTop(r.settings.alwaysOnTop), r.settings.globalShortcut && Ko(r.settings.globalShortcut)), r.prompts && Pu({ prompts: r.prompts }), { success: !0 };
  } catch (r) {
    return console.error("导入数据出错:", r), { success: !1, error: r.message };
  }
});
ke.handle("get-app-info", () => ({
  version: et.getVersion(),
  name: et.getName(),
  description: "PromptMate是一个帮助你创建和管理提示词的桌面应用"
}));
ke.handle("check-for-updates", async () => {
  try {
    const e = await Vt.checkForUpdates();
    return e && e.updateInfo ? {
      success: !0,
      hasUpdate: e.updateInfo.version !== et.getVersion(),
      version: e.updateInfo.version
    } : {
      success: !0,
      hasUpdate: !1
    };
  } catch (e) {
    return console.error("检查更新出错:", e), {
      success: !1,
      hasUpdate: !1,
      error: e.message
    };
  }
});
export {
  A_ as default
};

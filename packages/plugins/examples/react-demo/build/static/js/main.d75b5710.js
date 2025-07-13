/*! For license information please see main.d75b5710.js.LICENSE.txt */
(() => {
  "use strict";
  var e = {
      43: (e, n, t) => {
        e.exports = t(202);
      },
      153: (e, n, t) => {
        var r = t(43),
          a = Symbol.for("react.element"),
          l = Symbol.for("react.fragment"),
          i = Object.prototype.hasOwnProperty,
          o =
            r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
              .ReactCurrentOwner,
          s = { key: !0, ref: !0, __self: !0, __source: !0 };
        function u(e, n, t) {
          var r,
            l = {},
            u = null,
            c = null;
          for (r in (void 0 !== t && (u = "" + t),
          void 0 !== n.key && (u = "" + n.key),
          void 0 !== n.ref && (c = n.ref),
          n))
            i.call(n, r) && !s.hasOwnProperty(r) && (l[r] = n[r]);
          if (e && e.defaultProps)
            for (r in (n = e.defaultProps)) void 0 === l[r] && (l[r] = n[r]);
          return {
            $$typeof: a,
            type: e,
            key: u,
            ref: c,
            props: l,
            _owner: o.current,
          };
        }
        ((n.jsx = u), (n.jsxs = u));
      },
      202: (e, n) => {
        var t = Symbol.for("react.element"),
          r = Symbol.for("react.portal"),
          a = Symbol.for("react.fragment"),
          l = Symbol.for("react.strict_mode"),
          i = Symbol.for("react.profiler"),
          o = Symbol.for("react.provider"),
          s = Symbol.for("react.context"),
          u = Symbol.for("react.forward_ref"),
          c = Symbol.for("react.suspense"),
          d = Symbol.for("react.memo"),
          f = Symbol.for("react.lazy"),
          p = Symbol.iterator;
        var h = {
            isMounted: function () {
              return !1;
            },
            enqueueForceUpdate: function () {},
            enqueueReplaceState: function () {},
            enqueueSetState: function () {},
          },
          m = Object.assign,
          g = {};
        function v(e, n, t) {
          ((this.props = e),
            (this.context = n),
            (this.refs = g),
            (this.updater = t || h));
        }
        function y() {}
        function x(e, n, t) {
          ((this.props = e),
            (this.context = n),
            (this.refs = g),
            (this.updater = t || h));
        }
        ((v.prototype.isReactComponent = {}),
          (v.prototype.setState = function (e, n) {
            if ("object" !== typeof e && "function" !== typeof e && null != e)
              throw Error(
                "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
              );
            this.updater.enqueueSetState(this, e, n, "setState");
          }),
          (v.prototype.forceUpdate = function (e) {
            this.updater.enqueueForceUpdate(this, e, "forceUpdate");
          }),
          (y.prototype = v.prototype));
        var b = (x.prototype = new y());
        ((b.constructor = x), m(b, v.prototype), (b.isPureReactComponent = !0));
        var w = Array.isArray,
          k = Object.prototype.hasOwnProperty,
          S = { current: null },
          j = { key: !0, ref: !0, __self: !0, __source: !0 };
        function C(e, n, r) {
          var a,
            l = {},
            i = null,
            o = null;
          if (null != n)
            for (a in (void 0 !== n.ref && (o = n.ref),
            void 0 !== n.key && (i = "" + n.key),
            n))
              k.call(n, a) && !j.hasOwnProperty(a) && (l[a] = n[a]);
          var s = arguments.length - 2;
          if (1 === s) l.children = r;
          else if (1 < s) {
            for (var u = Array(s), c = 0; c < s; c++) u[c] = arguments[c + 2];
            l.children = u;
          }
          if (e && e.defaultProps)
            for (a in (s = e.defaultProps)) void 0 === l[a] && (l[a] = s[a]);
          return {
            $$typeof: t,
            type: e,
            key: i,
            ref: o,
            props: l,
            _owner: S.current,
          };
        }
        function P(e) {
          return "object" === typeof e && null !== e && e.$$typeof === t;
        }
        var E = /\/+/g;
        function N(e, n) {
          return "object" === typeof e && null !== e && null != e.key
            ? (function (e) {
                var n = { "=": "=0", ":": "=2" };
                return (
                  "$" +
                  e.replace(/[=:]/g, function (e) {
                    return n[e];
                  })
                );
              })("" + e.key)
            : n.toString(36);
        }
        function _(e, n, a, l, i) {
          var o = typeof e;
          ("undefined" !== o && "boolean" !== o) || (e = null);
          var s = !1;
          if (null === e) s = !0;
          else
            switch (o) {
              case "string":
              case "number":
                s = !0;
                break;
              case "object":
                switch (e.$$typeof) {
                  case t:
                  case r:
                    s = !0;
                }
            }
          if (s)
            return (
              (i = i((s = e))),
              (e = "" === l ? "." + N(s, 0) : l),
              w(i)
                ? ((a = ""),
                  null != e && (a = e.replace(E, "$&/") + "/"),
                  _(i, n, a, "", function (e) {
                    return e;
                  }))
                : null != i &&
                  (P(i) &&
                    (i = (function (e, n) {
                      return {
                        $$typeof: t,
                        type: e.type,
                        key: n,
                        ref: e.ref,
                        props: e.props,
                        _owner: e._owner,
                      };
                    })(
                      i,
                      a +
                        (!i.key || (s && s.key === i.key)
                          ? ""
                          : ("" + i.key).replace(E, "$&/") + "/") +
                        e,
                    )),
                  n.push(i)),
              1
            );
          if (((s = 0), (l = "" === l ? "." : l + ":"), w(e)))
            for (var u = 0; u < e.length; u++) {
              var c = l + N((o = e[u]), u);
              s += _(o, n, a, c, i);
            }
          else if (
            ((c = (function (e) {
              return null === e || "object" !== typeof e
                ? null
                : "function" === typeof (e = (p && e[p]) || e["@@iterator"])
                  ? e
                  : null;
            })(e)),
            "function" === typeof c)
          )
            for (e = c.call(e), u = 0; !(o = e.next()).done; )
              s += _((o = o.value), n, a, (c = l + N(o, u++)), i);
          else if ("object" === o)
            throw (
              (n = String(e)),
              Error(
                "Objects are not valid as a React child (found: " +
                  ("[object Object]" === n
                    ? "object with keys {" + Object.keys(e).join(", ") + "}"
                    : n) +
                  "). If you meant to render a collection of children, use an array instead.",
              )
            );
          return s;
        }
        function z(e, n, t) {
          if (null == e) return e;
          var r = [],
            a = 0;
          return (
            _(e, r, "", "", function (e) {
              return n.call(t, e, a++);
            }),
            r
          );
        }
        function T(e) {
          if (-1 === e._status) {
            var n = e._result;
            ((n = n()).then(
              function (n) {
                (0 !== e._status && -1 !== e._status) ||
                  ((e._status = 1), (e._result = n));
              },
              function (n) {
                (0 !== e._status && -1 !== e._status) ||
                  ((e._status = 2), (e._result = n));
              },
            ),
              -1 === e._status && ((e._status = 0), (e._result = n)));
          }
          if (1 === e._status) return e._result.default;
          throw e._result;
        }
        var L = { current: null },
          M = { transition: null },
          D = {
            ReactCurrentDispatcher: L,
            ReactCurrentBatchConfig: M,
            ReactCurrentOwner: S,
          };
        function R() {
          throw Error(
            "act(...) is not supported in production builds of React.",
          );
        }
        ((n.Children = {
          map: z,
          forEach: function (e, n, t) {
            z(
              e,
              function () {
                n.apply(this, arguments);
              },
              t,
            );
          },
          count: function (e) {
            var n = 0;
            return (
              z(e, function () {
                n++;
              }),
              n
            );
          },
          toArray: function (e) {
            return (
              z(e, function (e) {
                return e;
              }) || []
            );
          },
          only: function (e) {
            if (!P(e))
              throw Error(
                "React.Children.only expected to receive a single React element child.",
              );
            return e;
          },
        }),
          (n.Component = v),
          (n.Fragment = a),
          (n.Profiler = i),
          (n.PureComponent = x),
          (n.StrictMode = l),
          (n.Suspense = c),
          (n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = D),
          (n.act = R),
          (n.cloneElement = function (e, n, r) {
            if (null === e || void 0 === e)
              throw Error(
                "React.cloneElement(...): The argument must be a React element, but you passed " +
                  e +
                  ".",
              );
            var a = m({}, e.props),
              l = e.key,
              i = e.ref,
              o = e._owner;
            if (null != n) {
              if (
                (void 0 !== n.ref && ((i = n.ref), (o = S.current)),
                void 0 !== n.key && (l = "" + n.key),
                e.type && e.type.defaultProps)
              )
                var s = e.type.defaultProps;
              for (u in n)
                k.call(n, u) &&
                  !j.hasOwnProperty(u) &&
                  (a[u] = void 0 === n[u] && void 0 !== s ? s[u] : n[u]);
            }
            var u = arguments.length - 2;
            if (1 === u) a.children = r;
            else if (1 < u) {
              s = Array(u);
              for (var c = 0; c < u; c++) s[c] = arguments[c + 2];
              a.children = s;
            }
            return {
              $$typeof: t,
              type: e.type,
              key: l,
              ref: i,
              props: a,
              _owner: o,
            };
          }),
          (n.createContext = function (e) {
            return (
              ((e = {
                $$typeof: s,
                _currentValue: e,
                _currentValue2: e,
                _threadCount: 0,
                Provider: null,
                Consumer: null,
                _defaultValue: null,
                _globalName: null,
              }).Provider = { $$typeof: o, _context: e }),
              (e.Consumer = e)
            );
          }),
          (n.createElement = C),
          (n.createFactory = function (e) {
            var n = C.bind(null, e);
            return ((n.type = e), n);
          }),
          (n.createRef = function () {
            return { current: null };
          }),
          (n.forwardRef = function (e) {
            return { $$typeof: u, render: e };
          }),
          (n.isValidElement = P),
          (n.lazy = function (e) {
            return {
              $$typeof: f,
              _payload: { _status: -1, _result: e },
              _init: T,
            };
          }),
          (n.memo = function (e, n) {
            return { $$typeof: d, type: e, compare: void 0 === n ? null : n };
          }),
          (n.startTransition = function (e) {
            var n = M.transition;
            M.transition = {};
            try {
              e();
            } finally {
              M.transition = n;
            }
          }),
          (n.unstable_act = R),
          (n.useCallback = function (e, n) {
            return L.current.useCallback(e, n);
          }),
          (n.useContext = function (e) {
            return L.current.useContext(e);
          }),
          (n.useDebugValue = function () {}),
          (n.useDeferredValue = function (e) {
            return L.current.useDeferredValue(e);
          }),
          (n.useEffect = function (e, n) {
            return L.current.useEffect(e, n);
          }),
          (n.useId = function () {
            return L.current.useId();
          }),
          (n.useImperativeHandle = function (e, n, t) {
            return L.current.useImperativeHandle(e, n, t);
          }),
          (n.useInsertionEffect = function (e, n) {
            return L.current.useInsertionEffect(e, n);
          }),
          (n.useLayoutEffect = function (e, n) {
            return L.current.useLayoutEffect(e, n);
          }),
          (n.useMemo = function (e, n) {
            return L.current.useMemo(e, n);
          }),
          (n.useReducer = function (e, n, t) {
            return L.current.useReducer(e, n, t);
          }),
          (n.useRef = function (e) {
            return L.current.useRef(e);
          }),
          (n.useState = function (e) {
            return L.current.useState(e);
          }),
          (n.useSyncExternalStore = function (e, n, t) {
            return L.current.useSyncExternalStore(e, n, t);
          }),
          (n.useTransition = function () {
            return L.current.useTransition();
          }),
          (n.version = "18.3.1"));
      },
      234: (e, n) => {
        function t(e, n) {
          var t = e.length;
          e.push(n);
          e: for (; 0 < t; ) {
            var r = (t - 1) >>> 1,
              a = e[r];
            if (!(0 < l(a, n))) break e;
            ((e[r] = n), (e[t] = a), (t = r));
          }
        }
        function r(e) {
          return 0 === e.length ? null : e[0];
        }
        function a(e) {
          if (0 === e.length) return null;
          var n = e[0],
            t = e.pop();
          if (t !== n) {
            e[0] = t;
            e: for (var r = 0, a = e.length, i = a >>> 1; r < i; ) {
              var o = 2 * (r + 1) - 1,
                s = e[o],
                u = o + 1,
                c = e[u];
              if (0 > l(s, t))
                u < a && 0 > l(c, s)
                  ? ((e[r] = c), (e[u] = t), (r = u))
                  : ((e[r] = s), (e[o] = t), (r = o));
              else {
                if (!(u < a && 0 > l(c, t))) break e;
                ((e[r] = c), (e[u] = t), (r = u));
              }
            }
          }
          return n;
        }
        function l(e, n) {
          var t = e.sortIndex - n.sortIndex;
          return 0 !== t ? t : e.id - n.id;
        }
        if (
          "object" === typeof performance &&
          "function" === typeof performance.now
        ) {
          var i = performance;
          n.unstable_now = function () {
            return i.now();
          };
        } else {
          var o = Date,
            s = o.now();
          n.unstable_now = function () {
            return o.now() - s;
          };
        }
        var u = [],
          c = [],
          d = 1,
          f = null,
          p = 3,
          h = !1,
          m = !1,
          g = !1,
          v = "function" === typeof setTimeout ? setTimeout : null,
          y = "function" === typeof clearTimeout ? clearTimeout : null,
          x = "undefined" !== typeof setImmediate ? setImmediate : null;
        function b(e) {
          for (var n = r(c); null !== n; ) {
            if (null === n.callback) a(c);
            else {
              if (!(n.startTime <= e)) break;
              (a(c), (n.sortIndex = n.expirationTime), t(u, n));
            }
            n = r(c);
          }
        }
        function w(e) {
          if (((g = !1), b(e), !m))
            if (null !== r(u)) ((m = !0), M(k));
            else {
              var n = r(c);
              null !== n && D(w, n.startTime - e);
            }
        }
        function k(e, t) {
          ((m = !1), g && ((g = !1), y(P), (P = -1)), (h = !0));
          var l = p;
          try {
            for (
              b(t), f = r(u);
              null !== f && (!(f.expirationTime > t) || (e && !_()));

            ) {
              var i = f.callback;
              if ("function" === typeof i) {
                ((f.callback = null), (p = f.priorityLevel));
                var o = i(f.expirationTime <= t);
                ((t = n.unstable_now()),
                  "function" === typeof o
                    ? (f.callback = o)
                    : f === r(u) && a(u),
                  b(t));
              } else a(u);
              f = r(u);
            }
            if (null !== f) var s = !0;
            else {
              var d = r(c);
              (null !== d && D(w, d.startTime - t), (s = !1));
            }
            return s;
          } finally {
            ((f = null), (p = l), (h = !1));
          }
        }
        "undefined" !== typeof navigator &&
          void 0 !== navigator.scheduling &&
          void 0 !== navigator.scheduling.isInputPending &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling);
        var S,
          j = !1,
          C = null,
          P = -1,
          E = 5,
          N = -1;
        function _() {
          return !(n.unstable_now() - N < E);
        }
        function z() {
          if (null !== C) {
            var e = n.unstable_now();
            N = e;
            var t = !0;
            try {
              t = C(!0, e);
            } finally {
              t ? S() : ((j = !1), (C = null));
            }
          } else j = !1;
        }
        if ("function" === typeof x)
          S = function () {
            x(z);
          };
        else if ("undefined" !== typeof MessageChannel) {
          var T = new MessageChannel(),
            L = T.port2;
          ((T.port1.onmessage = z),
            (S = function () {
              L.postMessage(null);
            }));
        } else
          S = function () {
            v(z, 0);
          };
        function M(e) {
          ((C = e), j || ((j = !0), S()));
        }
        function D(e, t) {
          P = v(function () {
            e(n.unstable_now());
          }, t);
        }
        ((n.unstable_IdlePriority = 5),
          (n.unstable_ImmediatePriority = 1),
          (n.unstable_LowPriority = 4),
          (n.unstable_NormalPriority = 3),
          (n.unstable_Profiling = null),
          (n.unstable_UserBlockingPriority = 2),
          (n.unstable_cancelCallback = function (e) {
            e.callback = null;
          }),
          (n.unstable_continueExecution = function () {
            m || h || ((m = !0), M(k));
          }),
          (n.unstable_forceFrameRate = function (e) {
            0 > e || 125 < e
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (E = 0 < e ? Math.floor(1e3 / e) : 5);
          }),
          (n.unstable_getCurrentPriorityLevel = function () {
            return p;
          }),
          (n.unstable_getFirstCallbackNode = function () {
            return r(u);
          }),
          (n.unstable_next = function (e) {
            switch (p) {
              case 1:
              case 2:
              case 3:
                var n = 3;
                break;
              default:
                n = p;
            }
            var t = p;
            p = n;
            try {
              return e();
            } finally {
              p = t;
            }
          }),
          (n.unstable_pauseExecution = function () {}),
          (n.unstable_requestPaint = function () {}),
          (n.unstable_runWithPriority = function (e, n) {
            switch (e) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                e = 3;
            }
            var t = p;
            p = e;
            try {
              return n();
            } finally {
              p = t;
            }
          }),
          (n.unstable_scheduleCallback = function (e, a, l) {
            var i = n.unstable_now();
            switch (
              ("object" === typeof l && null !== l
                ? (l = "number" === typeof (l = l.delay) && 0 < l ? i + l : i)
                : (l = i),
              e)
            ) {
              case 1:
                var o = -1;
                break;
              case 2:
                o = 250;
                break;
              case 5:
                o = 1073741823;
                break;
              case 4:
                o = 1e4;
                break;
              default:
                o = 5e3;
            }
            return (
              (e = {
                id: d++,
                callback: a,
                priorityLevel: e,
                startTime: l,
                expirationTime: (o = l + o),
                sortIndex: -1,
              }),
              l > i
                ? ((e.sortIndex = l),
                  t(c, e),
                  null === r(u) &&
                    e === r(c) &&
                    (g ? (y(P), (P = -1)) : (g = !0), D(w, l - i)))
                : ((e.sortIndex = o), t(u, e), m || h || ((m = !0), M(k))),
              e
            );
          }),
          (n.unstable_shouldYield = _),
          (n.unstable_wrapCallback = function (e) {
            var n = p;
            return function () {
              var t = p;
              p = n;
              try {
                return e.apply(this, arguments);
              } finally {
                p = t;
              }
            };
          }));
      },
      391: (e, n, t) => {
        var r = t(950);
        ((n.createRoot = r.createRoot), (n.hydrateRoot = r.hydrateRoot));
      },
      579: (e, n, t) => {
        e.exports = t(153);
      },
      730: (e, n, t) => {
        var r = t(43),
          a = t(853);
        function l(e) {
          for (
            var n =
                "https://reactjs.org/docs/error-decoder.html?invariant=" + e,
              t = 1;
            t < arguments.length;
            t++
          )
            n += "&args[]=" + encodeURIComponent(arguments[t]);
          return (
            "Minified React error #" +
            e +
            "; visit " +
            n +
            " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
          );
        }
        var i = new Set(),
          o = {};
        function s(e, n) {
          (u(e, n), u(e + "Capture", n));
        }
        function u(e, n) {
          for (o[e] = n, e = 0; e < n.length; e++) i.add(n[e]);
        }
        var c = !(
            "undefined" === typeof window ||
            "undefined" === typeof window.document ||
            "undefined" === typeof window.document.createElement
          ),
          d = Object.prototype.hasOwnProperty,
          f =
            /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
          p = {},
          h = {};
        function m(e, n, t, r, a, l, i) {
          ((this.acceptsBooleans = 2 === n || 3 === n || 4 === n),
            (this.attributeName = r),
            (this.attributeNamespace = a),
            (this.mustUseProperty = t),
            (this.propertyName = e),
            (this.type = n),
            (this.sanitizeURL = l),
            (this.removeEmptyString = i));
        }
        var g = {};
        ("children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
          .split(" ")
          .forEach(function (e) {
            g[e] = new m(e, 0, !1, e, null, !1, !1);
          }),
          [
            ["acceptCharset", "accept-charset"],
            ["className", "class"],
            ["htmlFor", "for"],
            ["httpEquiv", "http-equiv"],
          ].forEach(function (e) {
            var n = e[0];
            g[n] = new m(n, 1, !1, e[1], null, !1, !1);
          }),
          ["contentEditable", "draggable", "spellCheck", "value"].forEach(
            function (e) {
              g[e] = new m(e, 2, !1, e.toLowerCase(), null, !1, !1);
            },
          ),
          [
            "autoReverse",
            "externalResourcesRequired",
            "focusable",
            "preserveAlpha",
          ].forEach(function (e) {
            g[e] = new m(e, 2, !1, e, null, !1, !1);
          }),
          "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
            .split(" ")
            .forEach(function (e) {
              g[e] = new m(e, 3, !1, e.toLowerCase(), null, !1, !1);
            }),
          ["checked", "multiple", "muted", "selected"].forEach(function (e) {
            g[e] = new m(e, 3, !0, e, null, !1, !1);
          }),
          ["capture", "download"].forEach(function (e) {
            g[e] = new m(e, 4, !1, e, null, !1, !1);
          }),
          ["cols", "rows", "size", "span"].forEach(function (e) {
            g[e] = new m(e, 6, !1, e, null, !1, !1);
          }),
          ["rowSpan", "start"].forEach(function (e) {
            g[e] = new m(e, 5, !1, e.toLowerCase(), null, !1, !1);
          }));
        var v = /[\-:]([a-z])/g;
        function y(e) {
          return e[1].toUpperCase();
        }
        function x(e, n, t, r) {
          var a = g.hasOwnProperty(n) ? g[n] : null;
          (null !== a
            ? 0 !== a.type
            : r ||
              !(2 < n.length) ||
              ("o" !== n[0] && "O" !== n[0]) ||
              ("n" !== n[1] && "N" !== n[1])) &&
            ((function (e, n, t, r) {
              if (
                null === n ||
                "undefined" === typeof n ||
                (function (e, n, t, r) {
                  if (null !== t && 0 === t.type) return !1;
                  switch (typeof n) {
                    case "function":
                    case "symbol":
                      return !0;
                    case "boolean":
                      return (
                        !r &&
                        (null !== t
                          ? !t.acceptsBooleans
                          : "data-" !== (e = e.toLowerCase().slice(0, 5)) &&
                            "aria-" !== e)
                      );
                    default:
                      return !1;
                  }
                })(e, n, t, r)
              )
                return !0;
              if (r) return !1;
              if (null !== t)
                switch (t.type) {
                  case 3:
                    return !n;
                  case 4:
                    return !1 === n;
                  case 5:
                    return isNaN(n);
                  case 6:
                    return isNaN(n) || 1 > n;
                }
              return !1;
            })(n, t, a, r) && (t = null),
            r || null === a
              ? (function (e) {
                  return (
                    !!d.call(h, e) ||
                    (!d.call(p, e) &&
                      (f.test(e) ? (h[e] = !0) : ((p[e] = !0), !1)))
                  );
                })(n) &&
                (null === t ? e.removeAttribute(n) : e.setAttribute(n, "" + t))
              : a.mustUseProperty
                ? (e[a.propertyName] = null === t ? 3 !== a.type && "" : t)
                : ((n = a.attributeName),
                  (r = a.attributeNamespace),
                  null === t
                    ? e.removeAttribute(n)
                    : ((t =
                        3 === (a = a.type) || (4 === a && !0 === t)
                          ? ""
                          : "" + t),
                      r ? e.setAttributeNS(r, n, t) : e.setAttribute(n, t))));
        }
        ("accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
          .split(" ")
          .forEach(function (e) {
            var n = e.replace(v, y);
            g[n] = new m(n, 1, !1, e, null, !1, !1);
          }),
          "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
            .split(" ")
            .forEach(function (e) {
              var n = e.replace(v, y);
              g[n] = new m(n, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
            }),
          ["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
            var n = e.replace(v, y);
            g[n] = new m(
              n,
              1,
              !1,
              e,
              "http://www.w3.org/XML/1998/namespace",
              !1,
              !1,
            );
          }),
          ["tabIndex", "crossOrigin"].forEach(function (e) {
            g[e] = new m(e, 1, !1, e.toLowerCase(), null, !1, !1);
          }),
          (g.xlinkHref = new m(
            "xlinkHref",
            1,
            !1,
            "xlink:href",
            "http://www.w3.org/1999/xlink",
            !0,
            !1,
          )),
          ["src", "href", "action", "formAction"].forEach(function (e) {
            g[e] = new m(e, 1, !1, e.toLowerCase(), null, !0, !0);
          }));
        var b = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
          w = Symbol.for("react.element"),
          k = Symbol.for("react.portal"),
          S = Symbol.for("react.fragment"),
          j = Symbol.for("react.strict_mode"),
          C = Symbol.for("react.profiler"),
          P = Symbol.for("react.provider"),
          E = Symbol.for("react.context"),
          N = Symbol.for("react.forward_ref"),
          _ = Symbol.for("react.suspense"),
          z = Symbol.for("react.suspense_list"),
          T = Symbol.for("react.memo"),
          L = Symbol.for("react.lazy");
        (Symbol.for("react.scope"), Symbol.for("react.debug_trace_mode"));
        var M = Symbol.for("react.offscreen");
        (Symbol.for("react.legacy_hidden"),
          Symbol.for("react.cache"),
          Symbol.for("react.tracing_marker"));
        var D = Symbol.iterator;
        function R(e) {
          return null === e || "object" !== typeof e
            ? null
            : "function" === typeof (e = (D && e[D]) || e["@@iterator"])
              ? e
              : null;
        }
        var F,
          I = Object.assign;
        function O(e) {
          if (void 0 === F)
            try {
              throw Error();
            } catch (t) {
              var n = t.stack.trim().match(/\n( *(at )?)/);
              F = (n && n[1]) || "";
            }
          return "\n" + F + e;
        }
        var $ = !1;
        function U(e, n) {
          if (!e || $) return "";
          $ = !0;
          var t = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          try {
            if (n)
              if (
                ((n = function () {
                  throw Error();
                }),
                Object.defineProperty(n.prototype, "props", {
                  set: function () {
                    throw Error();
                  },
                }),
                "object" === typeof Reflect && Reflect.construct)
              ) {
                try {
                  Reflect.construct(n, []);
                } catch (u) {
                  var r = u;
                }
                Reflect.construct(e, [], n);
              } else {
                try {
                  n.call();
                } catch (u) {
                  r = u;
                }
                e.call(n.prototype);
              }
            else {
              try {
                throw Error();
              } catch (u) {
                r = u;
              }
              e();
            }
          } catch (u) {
            if (u && r && "string" === typeof u.stack) {
              for (
                var a = u.stack.split("\n"),
                  l = r.stack.split("\n"),
                  i = a.length - 1,
                  o = l.length - 1;
                1 <= i && 0 <= o && a[i] !== l[o];

              )
                o--;
              for (; 1 <= i && 0 <= o; i--, o--)
                if (a[i] !== l[o]) {
                  if (1 !== i || 1 !== o)
                    do {
                      if ((i--, 0 > --o || a[i] !== l[o])) {
                        var s = "\n" + a[i].replace(" at new ", " at ");
                        return (
                          e.displayName &&
                            s.includes("<anonymous>") &&
                            (s = s.replace("<anonymous>", e.displayName)),
                          s
                        );
                      }
                    } while (1 <= i && 0 <= o);
                  break;
                }
            }
          } finally {
            (($ = !1), (Error.prepareStackTrace = t));
          }
          return (e = e ? e.displayName || e.name : "") ? O(e) : "";
        }
        function A(e) {
          switch (e.tag) {
            case 5:
              return O(e.type);
            case 16:
              return O("Lazy");
            case 13:
              return O("Suspense");
            case 19:
              return O("SuspenseList");
            case 0:
            case 2:
            case 15:
              return (e = U(e.type, !1));
            case 11:
              return (e = U(e.type.render, !1));
            case 1:
              return (e = U(e.type, !0));
            default:
              return "";
          }
        }
        function V(e) {
          if (null == e) return null;
          if ("function" === typeof e) return e.displayName || e.name || null;
          if ("string" === typeof e) return e;
          switch (e) {
            case S:
              return "Fragment";
            case k:
              return "Portal";
            case C:
              return "Profiler";
            case j:
              return "StrictMode";
            case _:
              return "Suspense";
            case z:
              return "SuspenseList";
          }
          if ("object" === typeof e)
            switch (e.$$typeof) {
              case E:
                return (e.displayName || "Context") + ".Consumer";
              case P:
                return (e._context.displayName || "Context") + ".Provider";
              case N:
                var n = e.render;
                return (
                  (e = e.displayName) ||
                    (e =
                      "" !== (e = n.displayName || n.name || "")
                        ? "ForwardRef(" + e + ")"
                        : "ForwardRef"),
                  e
                );
              case T:
                return null !== (n = e.displayName || null)
                  ? n
                  : V(e.type) || "Memo";
              case L:
                ((n = e._payload), (e = e._init));
                try {
                  return V(e(n));
                } catch (t) {}
            }
          return null;
        }
        function B(e) {
          var n = e.type;
          switch (e.tag) {
            case 24:
              return "Cache";
            case 9:
              return (n.displayName || "Context") + ".Consumer";
            case 10:
              return (n._context.displayName || "Context") + ".Provider";
            case 18:
              return "DehydratedFragment";
            case 11:
              return (
                (e = (e = n.render).displayName || e.name || ""),
                n.displayName ||
                  ("" !== e ? "ForwardRef(" + e + ")" : "ForwardRef")
              );
            case 7:
              return "Fragment";
            case 5:
              return n;
            case 4:
              return "Portal";
            case 3:
              return "Root";
            case 6:
              return "Text";
            case 16:
              return V(n);
            case 8:
              return n === j ? "StrictMode" : "Mode";
            case 22:
              return "Offscreen";
            case 12:
              return "Profiler";
            case 21:
              return "Scope";
            case 13:
              return "Suspense";
            case 19:
              return "SuspenseList";
            case 25:
              return "TracingMarker";
            case 1:
            case 0:
            case 17:
            case 2:
            case 14:
            case 15:
              if ("function" === typeof n)
                return n.displayName || n.name || null;
              if ("string" === typeof n) return n;
          }
          return null;
        }
        function H(e) {
          switch (typeof e) {
            case "boolean":
            case "number":
            case "string":
            case "undefined":
            case "object":
              return e;
            default:
              return "";
          }
        }
        function W(e) {
          var n = e.type;
          return (
            (e = e.nodeName) &&
            "input" === e.toLowerCase() &&
            ("checkbox" === n || "radio" === n)
          );
        }
        function Q(e) {
          e._valueTracker ||
            (e._valueTracker = (function (e) {
              var n = W(e) ? "checked" : "value",
                t = Object.getOwnPropertyDescriptor(e.constructor.prototype, n),
                r = "" + e[n];
              if (
                !e.hasOwnProperty(n) &&
                "undefined" !== typeof t &&
                "function" === typeof t.get &&
                "function" === typeof t.set
              ) {
                var a = t.get,
                  l = t.set;
                return (
                  Object.defineProperty(e, n, {
                    configurable: !0,
                    get: function () {
                      return a.call(this);
                    },
                    set: function (e) {
                      ((r = "" + e), l.call(this, e));
                    },
                  }),
                  Object.defineProperty(e, n, { enumerable: t.enumerable }),
                  {
                    getValue: function () {
                      return r;
                    },
                    setValue: function (e) {
                      r = "" + e;
                    },
                    stopTracking: function () {
                      ((e._valueTracker = null), delete e[n]);
                    },
                  }
                );
              }
            })(e));
        }
        function q(e) {
          if (!e) return !1;
          var n = e._valueTracker;
          if (!n) return !0;
          var t = n.getValue(),
            r = "";
          return (
            e && (r = W(e) ? (e.checked ? "true" : "false") : e.value),
            (e = r) !== t && (n.setValue(e), !0)
          );
        }
        function K(e) {
          if (
            "undefined" ===
            typeof (e =
              e || ("undefined" !== typeof document ? document : void 0))
          )
            return null;
          try {
            return e.activeElement || e.body;
          } catch (n) {
            return e.body;
          }
        }
        function Y(e, n) {
          var t = n.checked;
          return I({}, n, {
            defaultChecked: void 0,
            defaultValue: void 0,
            value: void 0,
            checked: null != t ? t : e._wrapperState.initialChecked,
          });
        }
        function G(e, n) {
          var t = null == n.defaultValue ? "" : n.defaultValue,
            r = null != n.checked ? n.checked : n.defaultChecked;
          ((t = H(null != n.value ? n.value : t)),
            (e._wrapperState = {
              initialChecked: r,
              initialValue: t,
              controlled:
                "checkbox" === n.type || "radio" === n.type
                  ? null != n.checked
                  : null != n.value,
            }));
        }
        function J(e, n) {
          null != (n = n.checked) && x(e, "checked", n, !1);
        }
        function X(e, n) {
          J(e, n);
          var t = H(n.value),
            r = n.type;
          if (null != t)
            "number" === r
              ? ((0 === t && "" === e.value) || e.value != t) &&
                (e.value = "" + t)
              : e.value !== "" + t && (e.value = "" + t);
          else if ("submit" === r || "reset" === r)
            return void e.removeAttribute("value");
          (n.hasOwnProperty("value")
            ? ee(e, n.type, t)
            : n.hasOwnProperty("defaultValue") &&
              ee(e, n.type, H(n.defaultValue)),
            null == n.checked &&
              null != n.defaultChecked &&
              (e.defaultChecked = !!n.defaultChecked));
        }
        function Z(e, n, t) {
          if (n.hasOwnProperty("value") || n.hasOwnProperty("defaultValue")) {
            var r = n.type;
            if (
              !(
                ("submit" !== r && "reset" !== r) ||
                (void 0 !== n.value && null !== n.value)
              )
            )
              return;
            ((n = "" + e._wrapperState.initialValue),
              t || n === e.value || (e.value = n),
              (e.defaultValue = n));
          }
          ("" !== (t = e.name) && (e.name = ""),
            (e.defaultChecked = !!e._wrapperState.initialChecked),
            "" !== t && (e.name = t));
        }
        function ee(e, n, t) {
          ("number" === n && K(e.ownerDocument) === e) ||
            (null == t
              ? (e.defaultValue = "" + e._wrapperState.initialValue)
              : e.defaultValue !== "" + t && (e.defaultValue = "" + t));
        }
        var ne = Array.isArray;
        function te(e, n, t, r) {
          if (((e = e.options), n)) {
            n = {};
            for (var a = 0; a < t.length; a++) n["$" + t[a]] = !0;
            for (t = 0; t < e.length; t++)
              ((a = n.hasOwnProperty("$" + e[t].value)),
                e[t].selected !== a && (e[t].selected = a),
                a && r && (e[t].defaultSelected = !0));
          } else {
            for (t = "" + H(t), n = null, a = 0; a < e.length; a++) {
              if (e[a].value === t)
                return (
                  (e[a].selected = !0),
                  void (r && (e[a].defaultSelected = !0))
                );
              null !== n || e[a].disabled || (n = e[a]);
            }
            null !== n && (n.selected = !0);
          }
        }
        function re(e, n) {
          if (null != n.dangerouslySetInnerHTML) throw Error(l(91));
          return I({}, n, {
            value: void 0,
            defaultValue: void 0,
            children: "" + e._wrapperState.initialValue,
          });
        }
        function ae(e, n) {
          var t = n.value;
          if (null == t) {
            if (((t = n.children), (n = n.defaultValue), null != t)) {
              if (null != n) throw Error(l(92));
              if (ne(t)) {
                if (1 < t.length) throw Error(l(93));
                t = t[0];
              }
              n = t;
            }
            (null == n && (n = ""), (t = n));
          }
          e._wrapperState = { initialValue: H(t) };
        }
        function le(e, n) {
          var t = H(n.value),
            r = H(n.defaultValue);
          (null != t &&
            ((t = "" + t) !== e.value && (e.value = t),
            null == n.defaultValue &&
              e.defaultValue !== t &&
              (e.defaultValue = t)),
            null != r && (e.defaultValue = "" + r));
        }
        function ie(e) {
          var n = e.textContent;
          n === e._wrapperState.initialValue &&
            "" !== n &&
            null !== n &&
            (e.value = n);
        }
        function oe(e) {
          switch (e) {
            case "svg":
              return "http://www.w3.org/2000/svg";
            case "math":
              return "http://www.w3.org/1998/Math/MathML";
            default:
              return "http://www.w3.org/1999/xhtml";
          }
        }
        function se(e, n) {
          return null == e || "http://www.w3.org/1999/xhtml" === e
            ? oe(n)
            : "http://www.w3.org/2000/svg" === e && "foreignObject" === n
              ? "http://www.w3.org/1999/xhtml"
              : e;
        }
        var ue,
          ce,
          de =
            ((ce = function (e, n) {
              if (
                "http://www.w3.org/2000/svg" !== e.namespaceURI ||
                "innerHTML" in e
              )
                e.innerHTML = n;
              else {
                for (
                  (ue = ue || document.createElement("div")).innerHTML =
                    "<svg>" + n.valueOf().toString() + "</svg>",
                    n = ue.firstChild;
                  e.firstChild;

                )
                  e.removeChild(e.firstChild);
                for (; n.firstChild; ) e.appendChild(n.firstChild);
              }
            }),
            "undefined" !== typeof MSApp && MSApp.execUnsafeLocalFunction
              ? function (e, n, t, r) {
                  MSApp.execUnsafeLocalFunction(function () {
                    return ce(e, n);
                  });
                }
              : ce);
        function fe(e, n) {
          if (n) {
            var t = e.firstChild;
            if (t && t === e.lastChild && 3 === t.nodeType)
              return void (t.nodeValue = n);
          }
          e.textContent = n;
        }
        var pe = {
            animationIterationCount: !0,
            aspectRatio: !0,
            borderImageOutset: !0,
            borderImageSlice: !0,
            borderImageWidth: !0,
            boxFlex: !0,
            boxFlexGroup: !0,
            boxOrdinalGroup: !0,
            columnCount: !0,
            columns: !0,
            flex: !0,
            flexGrow: !0,
            flexPositive: !0,
            flexShrink: !0,
            flexNegative: !0,
            flexOrder: !0,
            gridArea: !0,
            gridRow: !0,
            gridRowEnd: !0,
            gridRowSpan: !0,
            gridRowStart: !0,
            gridColumn: !0,
            gridColumnEnd: !0,
            gridColumnSpan: !0,
            gridColumnStart: !0,
            fontWeight: !0,
            lineClamp: !0,
            lineHeight: !0,
            opacity: !0,
            order: !0,
            orphans: !0,
            tabSize: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0,
            fillOpacity: !0,
            floodOpacity: !0,
            stopOpacity: !0,
            strokeDasharray: !0,
            strokeDashoffset: !0,
            strokeMiterlimit: !0,
            strokeOpacity: !0,
            strokeWidth: !0,
          },
          he = ["Webkit", "ms", "Moz", "O"];
        function me(e, n, t) {
          return null == n || "boolean" === typeof n || "" === n
            ? ""
            : t ||
                "number" !== typeof n ||
                0 === n ||
                (pe.hasOwnProperty(e) && pe[e])
              ? ("" + n).trim()
              : n + "px";
        }
        function ge(e, n) {
          for (var t in ((e = e.style), n))
            if (n.hasOwnProperty(t)) {
              var r = 0 === t.indexOf("--"),
                a = me(t, n[t], r);
              ("float" === t && (t = "cssFloat"),
                r ? e.setProperty(t, a) : (e[t] = a));
            }
        }
        Object.keys(pe).forEach(function (e) {
          he.forEach(function (n) {
            ((n = n + e.charAt(0).toUpperCase() + e.substring(1)),
              (pe[n] = pe[e]));
          });
        });
        var ve = I(
          { menuitem: !0 },
          {
            area: !0,
            base: !0,
            br: !0,
            col: !0,
            embed: !0,
            hr: !0,
            img: !0,
            input: !0,
            keygen: !0,
            link: !0,
            meta: !0,
            param: !0,
            source: !0,
            track: !0,
            wbr: !0,
          },
        );
        function ye(e, n) {
          if (n) {
            if (
              ve[e] &&
              (null != n.children || null != n.dangerouslySetInnerHTML)
            )
              throw Error(l(137, e));
            if (null != n.dangerouslySetInnerHTML) {
              if (null != n.children) throw Error(l(60));
              if (
                "object" !== typeof n.dangerouslySetInnerHTML ||
                !("__html" in n.dangerouslySetInnerHTML)
              )
                throw Error(l(61));
            }
            if (null != n.style && "object" !== typeof n.style)
              throw Error(l(62));
          }
        }
        function xe(e, n) {
          if (-1 === e.indexOf("-")) return "string" === typeof n.is;
          switch (e) {
            case "annotation-xml":
            case "color-profile":
            case "font-face":
            case "font-face-src":
            case "font-face-uri":
            case "font-face-format":
            case "font-face-name":
            case "missing-glyph":
              return !1;
            default:
              return !0;
          }
        }
        var be = null;
        function we(e) {
          return (
            (e = e.target || e.srcElement || window).correspondingUseElement &&
              (e = e.correspondingUseElement),
            3 === e.nodeType ? e.parentNode : e
          );
        }
        var ke = null,
          Se = null,
          je = null;
        function Ce(e) {
          if ((e = xa(e))) {
            if ("function" !== typeof ke) throw Error(l(280));
            var n = e.stateNode;
            n && ((n = wa(n)), ke(e.stateNode, e.type, n));
          }
        }
        function Pe(e) {
          Se ? (je ? je.push(e) : (je = [e])) : (Se = e);
        }
        function Ee() {
          if (Se) {
            var e = Se,
              n = je;
            if (((je = Se = null), Ce(e), n))
              for (e = 0; e < n.length; e++) Ce(n[e]);
          }
        }
        function Ne(e, n) {
          return e(n);
        }
        function _e() {}
        var ze = !1;
        function Te(e, n, t) {
          if (ze) return e(n, t);
          ze = !0;
          try {
            return Ne(e, n, t);
          } finally {
            ((ze = !1), (null !== Se || null !== je) && (_e(), Ee()));
          }
        }
        function Le(e, n) {
          var t = e.stateNode;
          if (null === t) return null;
          var r = wa(t);
          if (null === r) return null;
          t = r[n];
          e: switch (n) {
            case "onClick":
            case "onClickCapture":
            case "onDoubleClick":
            case "onDoubleClickCapture":
            case "onMouseDown":
            case "onMouseDownCapture":
            case "onMouseMove":
            case "onMouseMoveCapture":
            case "onMouseUp":
            case "onMouseUpCapture":
            case "onMouseEnter":
              ((r = !r.disabled) ||
                (r = !(
                  "button" === (e = e.type) ||
                  "input" === e ||
                  "select" === e ||
                  "textarea" === e
                )),
                (e = !r));
              break e;
            default:
              e = !1;
          }
          if (e) return null;
          if (t && "function" !== typeof t) throw Error(l(231, n, typeof t));
          return t;
        }
        var Me = !1;
        if (c)
          try {
            var De = {};
            (Object.defineProperty(De, "passive", {
              get: function () {
                Me = !0;
              },
            }),
              window.addEventListener("test", De, De),
              window.removeEventListener("test", De, De));
          } catch (ce) {
            Me = !1;
          }
        function Re(e, n, t, r, a, l, i, o, s) {
          var u = Array.prototype.slice.call(arguments, 3);
          try {
            n.apply(t, u);
          } catch (c) {
            this.onError(c);
          }
        }
        var Fe = !1,
          Ie = null,
          Oe = !1,
          $e = null,
          Ue = {
            onError: function (e) {
              ((Fe = !0), (Ie = e));
            },
          };
        function Ae(e, n, t, r, a, l, i, o, s) {
          ((Fe = !1), (Ie = null), Re.apply(Ue, arguments));
        }
        function Ve(e) {
          var n = e,
            t = e;
          if (e.alternate) for (; n.return; ) n = n.return;
          else {
            e = n;
            do {
              (0 !== (4098 & (n = e).flags) && (t = n.return), (e = n.return));
            } while (e);
          }
          return 3 === n.tag ? t : null;
        }
        function Be(e) {
          if (13 === e.tag) {
            var n = e.memoizedState;
            if (
              (null === n &&
                null !== (e = e.alternate) &&
                (n = e.memoizedState),
              null !== n)
            )
              return n.dehydrated;
          }
          return null;
        }
        function He(e) {
          if (Ve(e) !== e) throw Error(l(188));
        }
        function We(e) {
          return null !==
            (e = (function (e) {
              var n = e.alternate;
              if (!n) {
                if (null === (n = Ve(e))) throw Error(l(188));
                return n !== e ? null : e;
              }
              for (var t = e, r = n; ; ) {
                var a = t.return;
                if (null === a) break;
                var i = a.alternate;
                if (null === i) {
                  if (null !== (r = a.return)) {
                    t = r;
                    continue;
                  }
                  break;
                }
                if (a.child === i.child) {
                  for (i = a.child; i; ) {
                    if (i === t) return (He(a), e);
                    if (i === r) return (He(a), n);
                    i = i.sibling;
                  }
                  throw Error(l(188));
                }
                if (t.return !== r.return) ((t = a), (r = i));
                else {
                  for (var o = !1, s = a.child; s; ) {
                    if (s === t) {
                      ((o = !0), (t = a), (r = i));
                      break;
                    }
                    if (s === r) {
                      ((o = !0), (r = a), (t = i));
                      break;
                    }
                    s = s.sibling;
                  }
                  if (!o) {
                    for (s = i.child; s; ) {
                      if (s === t) {
                        ((o = !0), (t = i), (r = a));
                        break;
                      }
                      if (s === r) {
                        ((o = !0), (r = i), (t = a));
                        break;
                      }
                      s = s.sibling;
                    }
                    if (!o) throw Error(l(189));
                  }
                }
                if (t.alternate !== r) throw Error(l(190));
              }
              if (3 !== t.tag) throw Error(l(188));
              return t.stateNode.current === t ? e : n;
            })(e))
            ? Qe(e)
            : null;
        }
        function Qe(e) {
          if (5 === e.tag || 6 === e.tag) return e;
          for (e = e.child; null !== e; ) {
            var n = Qe(e);
            if (null !== n) return n;
            e = e.sibling;
          }
          return null;
        }
        var qe = a.unstable_scheduleCallback,
          Ke = a.unstable_cancelCallback,
          Ye = a.unstable_shouldYield,
          Ge = a.unstable_requestPaint,
          Je = a.unstable_now,
          Xe = a.unstable_getCurrentPriorityLevel,
          Ze = a.unstable_ImmediatePriority,
          en = a.unstable_UserBlockingPriority,
          nn = a.unstable_NormalPriority,
          tn = a.unstable_LowPriority,
          rn = a.unstable_IdlePriority,
          an = null,
          ln = null;
        var on = Math.clz32
            ? Math.clz32
            : function (e) {
                return (
                  (e >>>= 0),
                  0 === e ? 32 : (31 - ((sn(e) / un) | 0)) | 0
                );
              },
          sn = Math.log,
          un = Math.LN2;
        var cn = 64,
          dn = 4194304;
        function fn(e) {
          switch (e & -e) {
            case 1:
              return 1;
            case 2:
              return 2;
            case 4:
              return 4;
            case 8:
              return 8;
            case 16:
              return 16;
            case 32:
              return 32;
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
              return 4194240 & e;
            case 4194304:
            case 8388608:
            case 16777216:
            case 33554432:
            case 67108864:
              return 130023424 & e;
            case 134217728:
              return 134217728;
            case 268435456:
              return 268435456;
            case 536870912:
              return 536870912;
            case 1073741824:
              return 1073741824;
            default:
              return e;
          }
        }
        function pn(e, n) {
          var t = e.pendingLanes;
          if (0 === t) return 0;
          var r = 0,
            a = e.suspendedLanes,
            l = e.pingedLanes,
            i = 268435455 & t;
          if (0 !== i) {
            var o = i & ~a;
            0 !== o ? (r = fn(o)) : 0 !== (l &= i) && (r = fn(l));
          } else 0 !== (i = t & ~a) ? (r = fn(i)) : 0 !== l && (r = fn(l));
          if (0 === r) return 0;
          if (
            0 !== n &&
            n !== r &&
            0 === (n & a) &&
            ((a = r & -r) >= (l = n & -n) || (16 === a && 0 !== (4194240 & l)))
          )
            return n;
          if ((0 !== (4 & r) && (r |= 16 & t), 0 !== (n = e.entangledLanes)))
            for (e = e.entanglements, n &= r; 0 < n; )
              ((a = 1 << (t = 31 - on(n))), (r |= e[t]), (n &= ~a));
          return r;
        }
        function hn(e, n) {
          switch (e) {
            case 1:
            case 2:
            case 4:
              return n + 250;
            case 8:
            case 16:
            case 32:
            case 64:
            case 128:
            case 256:
            case 512:
            case 1024:
            case 2048:
            case 4096:
            case 8192:
            case 16384:
            case 32768:
            case 65536:
            case 131072:
            case 262144:
            case 524288:
            case 1048576:
            case 2097152:
              return n + 5e3;
            default:
              return -1;
          }
        }
        function mn(e) {
          return 0 !== (e = -1073741825 & e.pendingLanes)
            ? e
            : 1073741824 & e
              ? 1073741824
              : 0;
        }
        function gn() {
          var e = cn;
          return (0 === (4194240 & (cn <<= 1)) && (cn = 64), e);
        }
        function vn(e) {
          for (var n = [], t = 0; 31 > t; t++) n.push(e);
          return n;
        }
        function yn(e, n, t) {
          ((e.pendingLanes |= n),
            536870912 !== n && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
            ((e = e.eventTimes)[(n = 31 - on(n))] = t));
        }
        function xn(e, n) {
          var t = (e.entangledLanes |= n);
          for (e = e.entanglements; t; ) {
            var r = 31 - on(t),
              a = 1 << r;
            ((a & n) | (e[r] & n) && (e[r] |= n), (t &= ~a));
          }
        }
        var bn = 0;
        function wn(e) {
          return 1 < (e &= -e)
            ? 4 < e
              ? 0 !== (268435455 & e)
                ? 16
                : 536870912
              : 4
            : 1;
        }
        var kn,
          Sn,
          jn,
          Cn,
          Pn,
          En = !1,
          Nn = [],
          _n = null,
          zn = null,
          Tn = null,
          Ln = new Map(),
          Mn = new Map(),
          Dn = [],
          Rn =
            "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
              " ",
            );
        function Fn(e, n) {
          switch (e) {
            case "focusin":
            case "focusout":
              _n = null;
              break;
            case "dragenter":
            case "dragleave":
              zn = null;
              break;
            case "mouseover":
            case "mouseout":
              Tn = null;
              break;
            case "pointerover":
            case "pointerout":
              Ln.delete(n.pointerId);
              break;
            case "gotpointercapture":
            case "lostpointercapture":
              Mn.delete(n.pointerId);
          }
        }
        function In(e, n, t, r, a, l) {
          return null === e || e.nativeEvent !== l
            ? ((e = {
                blockedOn: n,
                domEventName: t,
                eventSystemFlags: r,
                nativeEvent: l,
                targetContainers: [a],
              }),
              null !== n && null !== (n = xa(n)) && Sn(n),
              e)
            : ((e.eventSystemFlags |= r),
              (n = e.targetContainers),
              null !== a && -1 === n.indexOf(a) && n.push(a),
              e);
        }
        function On(e) {
          var n = ya(e.target);
          if (null !== n) {
            var t = Ve(n);
            if (null !== t)
              if (13 === (n = t.tag)) {
                if (null !== (n = Be(t)))
                  return (
                    (e.blockedOn = n),
                    void Pn(e.priority, function () {
                      jn(t);
                    })
                  );
              } else if (
                3 === n &&
                t.stateNode.current.memoizedState.isDehydrated
              )
                return void (e.blockedOn =
                  3 === t.tag ? t.stateNode.containerInfo : null);
          }
          e.blockedOn = null;
        }
        function $n(e) {
          if (null !== e.blockedOn) return !1;
          for (var n = e.targetContainers; 0 < n.length; ) {
            var t = Gn(e.domEventName, e.eventSystemFlags, n[0], e.nativeEvent);
            if (null !== t)
              return (null !== (n = xa(t)) && Sn(n), (e.blockedOn = t), !1);
            var r = new (t = e.nativeEvent).constructor(t.type, t);
            ((be = r), t.target.dispatchEvent(r), (be = null), n.shift());
          }
          return !0;
        }
        function Un(e, n, t) {
          $n(e) && t.delete(n);
        }
        function An() {
          ((En = !1),
            null !== _n && $n(_n) && (_n = null),
            null !== zn && $n(zn) && (zn = null),
            null !== Tn && $n(Tn) && (Tn = null),
            Ln.forEach(Un),
            Mn.forEach(Un));
        }
        function Vn(e, n) {
          e.blockedOn === n &&
            ((e.blockedOn = null),
            En ||
              ((En = !0),
              a.unstable_scheduleCallback(a.unstable_NormalPriority, An)));
        }
        function Bn(e) {
          function n(n) {
            return Vn(n, e);
          }
          if (0 < Nn.length) {
            Vn(Nn[0], e);
            for (var t = 1; t < Nn.length; t++) {
              var r = Nn[t];
              r.blockedOn === e && (r.blockedOn = null);
            }
          }
          for (
            null !== _n && Vn(_n, e),
              null !== zn && Vn(zn, e),
              null !== Tn && Vn(Tn, e),
              Ln.forEach(n),
              Mn.forEach(n),
              t = 0;
            t < Dn.length;
            t++
          )
            (r = Dn[t]).blockedOn === e && (r.blockedOn = null);
          for (; 0 < Dn.length && null === (t = Dn[0]).blockedOn; )
            (On(t), null === t.blockedOn && Dn.shift());
        }
        var Hn = b.ReactCurrentBatchConfig,
          Wn = !0;
        function Qn(e, n, t, r) {
          var a = bn,
            l = Hn.transition;
          Hn.transition = null;
          try {
            ((bn = 1), Kn(e, n, t, r));
          } finally {
            ((bn = a), (Hn.transition = l));
          }
        }
        function qn(e, n, t, r) {
          var a = bn,
            l = Hn.transition;
          Hn.transition = null;
          try {
            ((bn = 4), Kn(e, n, t, r));
          } finally {
            ((bn = a), (Hn.transition = l));
          }
        }
        function Kn(e, n, t, r) {
          if (Wn) {
            var a = Gn(e, n, t, r);
            if (null === a) (Hr(e, n, r, Yn, t), Fn(e, r));
            else if (
              (function (e, n, t, r, a) {
                switch (n) {
                  case "focusin":
                    return ((_n = In(_n, e, n, t, r, a)), !0);
                  case "dragenter":
                    return ((zn = In(zn, e, n, t, r, a)), !0);
                  case "mouseover":
                    return ((Tn = In(Tn, e, n, t, r, a)), !0);
                  case "pointerover":
                    var l = a.pointerId;
                    return (
                      Ln.set(l, In(Ln.get(l) || null, e, n, t, r, a)),
                      !0
                    );
                  case "gotpointercapture":
                    return (
                      (l = a.pointerId),
                      Mn.set(l, In(Mn.get(l) || null, e, n, t, r, a)),
                      !0
                    );
                }
                return !1;
              })(a, e, n, t, r)
            )
              r.stopPropagation();
            else if ((Fn(e, r), 4 & n && -1 < Rn.indexOf(e))) {
              for (; null !== a; ) {
                var l = xa(a);
                if (
                  (null !== l && kn(l),
                  null === (l = Gn(e, n, t, r)) && Hr(e, n, r, Yn, t),
                  l === a)
                )
                  break;
                a = l;
              }
              null !== a && r.stopPropagation();
            } else Hr(e, n, r, null, t);
          }
        }
        var Yn = null;
        function Gn(e, n, t, r) {
          if (((Yn = null), null !== (e = ya((e = we(r))))))
            if (null === (n = Ve(e))) e = null;
            else if (13 === (t = n.tag)) {
              if (null !== (e = Be(n))) return e;
              e = null;
            } else if (3 === t) {
              if (n.stateNode.current.memoizedState.isDehydrated)
                return 3 === n.tag ? n.stateNode.containerInfo : null;
              e = null;
            } else n !== e && (e = null);
          return ((Yn = e), null);
        }
        function Jn(e) {
          switch (e) {
            case "cancel":
            case "click":
            case "close":
            case "contextmenu":
            case "copy":
            case "cut":
            case "auxclick":
            case "dblclick":
            case "dragend":
            case "dragstart":
            case "drop":
            case "focusin":
            case "focusout":
            case "input":
            case "invalid":
            case "keydown":
            case "keypress":
            case "keyup":
            case "mousedown":
            case "mouseup":
            case "paste":
            case "pause":
            case "play":
            case "pointercancel":
            case "pointerdown":
            case "pointerup":
            case "ratechange":
            case "reset":
            case "resize":
            case "seeked":
            case "submit":
            case "touchcancel":
            case "touchend":
            case "touchstart":
            case "volumechange":
            case "change":
            case "selectionchange":
            case "textInput":
            case "compositionstart":
            case "compositionend":
            case "compositionupdate":
            case "beforeblur":
            case "afterblur":
            case "beforeinput":
            case "blur":
            case "fullscreenchange":
            case "focus":
            case "hashchange":
            case "popstate":
            case "select":
            case "selectstart":
              return 1;
            case "drag":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "mousemove":
            case "mouseout":
            case "mouseover":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "scroll":
            case "toggle":
            case "touchmove":
            case "wheel":
            case "mouseenter":
            case "mouseleave":
            case "pointerenter":
            case "pointerleave":
              return 4;
            case "message":
              switch (Xe()) {
                case Ze:
                  return 1;
                case en:
                  return 4;
                case nn:
                case tn:
                  return 16;
                case rn:
                  return 536870912;
                default:
                  return 16;
              }
            default:
              return 16;
          }
        }
        var Xn = null,
          Zn = null,
          et = null;
        function nt() {
          if (et) return et;
          var e,
            n,
            t = Zn,
            r = t.length,
            a = "value" in Xn ? Xn.value : Xn.textContent,
            l = a.length;
          for (e = 0; e < r && t[e] === a[e]; e++);
          var i = r - e;
          for (n = 1; n <= i && t[r - n] === a[l - n]; n++);
          return (et = a.slice(e, 1 < n ? 1 - n : void 0));
        }
        function tt(e) {
          var n = e.keyCode;
          return (
            "charCode" in e
              ? 0 === (e = e.charCode) && 13 === n && (e = 13)
              : (e = n),
            10 === e && (e = 13),
            32 <= e || 13 === e ? e : 0
          );
        }
        function rt() {
          return !0;
        }
        function at() {
          return !1;
        }
        function lt(e) {
          function n(n, t, r, a, l) {
            for (var i in ((this._reactName = n),
            (this._targetInst = r),
            (this.type = t),
            (this.nativeEvent = a),
            (this.target = l),
            (this.currentTarget = null),
            e))
              e.hasOwnProperty(i) && ((n = e[i]), (this[i] = n ? n(a) : a[i]));
            return (
              (this.isDefaultPrevented = (
                null != a.defaultPrevented
                  ? a.defaultPrevented
                  : !1 === a.returnValue
              )
                ? rt
                : at),
              (this.isPropagationStopped = at),
              this
            );
          }
          return (
            I(n.prototype, {
              preventDefault: function () {
                this.defaultPrevented = !0;
                var e = this.nativeEvent;
                e &&
                  (e.preventDefault
                    ? e.preventDefault()
                    : "unknown" !== typeof e.returnValue &&
                      (e.returnValue = !1),
                  (this.isDefaultPrevented = rt));
              },
              stopPropagation: function () {
                var e = this.nativeEvent;
                e &&
                  (e.stopPropagation
                    ? e.stopPropagation()
                    : "unknown" !== typeof e.cancelBubble &&
                      (e.cancelBubble = !0),
                  (this.isPropagationStopped = rt));
              },
              persist: function () {},
              isPersistent: rt,
            }),
            n
          );
        }
        var it,
          ot,
          st,
          ut = {
            eventPhase: 0,
            bubbles: 0,
            cancelable: 0,
            timeStamp: function (e) {
              return e.timeStamp || Date.now();
            },
            defaultPrevented: 0,
            isTrusted: 0,
          },
          ct = lt(ut),
          dt = I({}, ut, { view: 0, detail: 0 }),
          ft = lt(dt),
          pt = I({}, dt, {
            screenX: 0,
            screenY: 0,
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            getModifierState: Ct,
            button: 0,
            buttons: 0,
            relatedTarget: function (e) {
              return void 0 === e.relatedTarget
                ? e.fromElement === e.srcElement
                  ? e.toElement
                  : e.fromElement
                : e.relatedTarget;
            },
            movementX: function (e) {
              return "movementX" in e
                ? e.movementX
                : (e !== st &&
                    (st && "mousemove" === e.type
                      ? ((it = e.screenX - st.screenX),
                        (ot = e.screenY - st.screenY))
                      : (ot = it = 0),
                    (st = e)),
                  it);
            },
            movementY: function (e) {
              return "movementY" in e ? e.movementY : ot;
            },
          }),
          ht = lt(pt),
          mt = lt(I({}, pt, { dataTransfer: 0 })),
          gt = lt(I({}, dt, { relatedTarget: 0 })),
          vt = lt(
            I({}, ut, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
          ),
          yt = I({}, ut, {
            clipboardData: function (e) {
              return "clipboardData" in e
                ? e.clipboardData
                : window.clipboardData;
            },
          }),
          xt = lt(yt),
          bt = lt(I({}, ut, { data: 0 })),
          wt = {
            Esc: "Escape",
            Spacebar: " ",
            Left: "ArrowLeft",
            Up: "ArrowUp",
            Right: "ArrowRight",
            Down: "ArrowDown",
            Del: "Delete",
            Win: "OS",
            Menu: "ContextMenu",
            Apps: "ContextMenu",
            Scroll: "ScrollLock",
            MozPrintableKey: "Unidentified",
          },
          kt = {
            8: "Backspace",
            9: "Tab",
            12: "Clear",
            13: "Enter",
            16: "Shift",
            17: "Control",
            18: "Alt",
            19: "Pause",
            20: "CapsLock",
            27: "Escape",
            32: " ",
            33: "PageUp",
            34: "PageDown",
            35: "End",
            36: "Home",
            37: "ArrowLeft",
            38: "ArrowUp",
            39: "ArrowRight",
            40: "ArrowDown",
            45: "Insert",
            46: "Delete",
            112: "F1",
            113: "F2",
            114: "F3",
            115: "F4",
            116: "F5",
            117: "F6",
            118: "F7",
            119: "F8",
            120: "F9",
            121: "F10",
            122: "F11",
            123: "F12",
            144: "NumLock",
            145: "ScrollLock",
            224: "Meta",
          },
          St = {
            Alt: "altKey",
            Control: "ctrlKey",
            Meta: "metaKey",
            Shift: "shiftKey",
          };
        function jt(e) {
          var n = this.nativeEvent;
          return n.getModifierState
            ? n.getModifierState(e)
            : !!(e = St[e]) && !!n[e];
        }
        function Ct() {
          return jt;
        }
        var Pt = I({}, dt, {
            key: function (e) {
              if (e.key) {
                var n = wt[e.key] || e.key;
                if ("Unidentified" !== n) return n;
              }
              return "keypress" === e.type
                ? 13 === (e = tt(e))
                  ? "Enter"
                  : String.fromCharCode(e)
                : "keydown" === e.type || "keyup" === e.type
                  ? kt[e.keyCode] || "Unidentified"
                  : "";
            },
            code: 0,
            location: 0,
            ctrlKey: 0,
            shiftKey: 0,
            altKey: 0,
            metaKey: 0,
            repeat: 0,
            locale: 0,
            getModifierState: Ct,
            charCode: function (e) {
              return "keypress" === e.type ? tt(e) : 0;
            },
            keyCode: function (e) {
              return "keydown" === e.type || "keyup" === e.type ? e.keyCode : 0;
            },
            which: function (e) {
              return "keypress" === e.type
                ? tt(e)
                : "keydown" === e.type || "keyup" === e.type
                  ? e.keyCode
                  : 0;
            },
          }),
          Et = lt(Pt),
          Nt = lt(
            I({}, pt, {
              pointerId: 0,
              width: 0,
              height: 0,
              pressure: 0,
              tangentialPressure: 0,
              tiltX: 0,
              tiltY: 0,
              twist: 0,
              pointerType: 0,
              isPrimary: 0,
            }),
          ),
          _t = lt(
            I({}, dt, {
              touches: 0,
              targetTouches: 0,
              changedTouches: 0,
              altKey: 0,
              metaKey: 0,
              ctrlKey: 0,
              shiftKey: 0,
              getModifierState: Ct,
            }),
          ),
          zt = lt(
            I({}, ut, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
          ),
          Tt = I({}, pt, {
            deltaX: function (e) {
              return "deltaX" in e
                ? e.deltaX
                : "wheelDeltaX" in e
                  ? -e.wheelDeltaX
                  : 0;
            },
            deltaY: function (e) {
              return "deltaY" in e
                ? e.deltaY
                : "wheelDeltaY" in e
                  ? -e.wheelDeltaY
                  : "wheelDelta" in e
                    ? -e.wheelDelta
                    : 0;
            },
            deltaZ: 0,
            deltaMode: 0,
          }),
          Lt = lt(Tt),
          Mt = [9, 13, 27, 32],
          Dt = c && "CompositionEvent" in window,
          Rt = null;
        c && "documentMode" in document && (Rt = document.documentMode);
        var Ft = c && "TextEvent" in window && !Rt,
          It = c && (!Dt || (Rt && 8 < Rt && 11 >= Rt)),
          Ot = String.fromCharCode(32),
          $t = !1;
        function Ut(e, n) {
          switch (e) {
            case "keyup":
              return -1 !== Mt.indexOf(n.keyCode);
            case "keydown":
              return 229 !== n.keyCode;
            case "keypress":
            case "mousedown":
            case "focusout":
              return !0;
            default:
              return !1;
          }
        }
        function At(e) {
          return "object" === typeof (e = e.detail) && "data" in e
            ? e.data
            : null;
        }
        var Vt = !1;
        var Bt = {
          color: !0,
          date: !0,
          datetime: !0,
          "datetime-local": !0,
          email: !0,
          month: !0,
          number: !0,
          password: !0,
          range: !0,
          search: !0,
          tel: !0,
          text: !0,
          time: !0,
          url: !0,
          week: !0,
        };
        function Ht(e) {
          var n = e && e.nodeName && e.nodeName.toLowerCase();
          return "input" === n ? !!Bt[e.type] : "textarea" === n;
        }
        function Wt(e, n, t, r) {
          (Pe(r),
            0 < (n = Qr(n, "onChange")).length &&
              ((t = new ct("onChange", "change", null, t, r)),
              e.push({ event: t, listeners: n })));
        }
        var Qt = null,
          qt = null;
        function Kt(e) {
          Or(e, 0);
        }
        function Yt(e) {
          if (q(ba(e))) return e;
        }
        function Gt(e, n) {
          if ("change" === e) return n;
        }
        var Jt = !1;
        if (c) {
          var Xt;
          if (c) {
            var Zt = "oninput" in document;
            if (!Zt) {
              var er = document.createElement("div");
              (er.setAttribute("oninput", "return;"),
                (Zt = "function" === typeof er.oninput));
            }
            Xt = Zt;
          } else Xt = !1;
          Jt = Xt && (!document.documentMode || 9 < document.documentMode);
        }
        function nr() {
          Qt && (Qt.detachEvent("onpropertychange", tr), (qt = Qt = null));
        }
        function tr(e) {
          if ("value" === e.propertyName && Yt(qt)) {
            var n = [];
            (Wt(n, qt, e, we(e)), Te(Kt, n));
          }
        }
        function rr(e, n, t) {
          "focusin" === e
            ? (nr(), (qt = t), (Qt = n).attachEvent("onpropertychange", tr))
            : "focusout" === e && nr();
        }
        function ar(e) {
          if ("selectionchange" === e || "keyup" === e || "keydown" === e)
            return Yt(qt);
        }
        function lr(e, n) {
          if ("click" === e) return Yt(n);
        }
        function ir(e, n) {
          if ("input" === e || "change" === e) return Yt(n);
        }
        var or =
          "function" === typeof Object.is
            ? Object.is
            : function (e, n) {
                return (
                  (e === n && (0 !== e || 1 / e === 1 / n)) ||
                  (e !== e && n !== n)
                );
              };
        function sr(e, n) {
          if (or(e, n)) return !0;
          if (
            "object" !== typeof e ||
            null === e ||
            "object" !== typeof n ||
            null === n
          )
            return !1;
          var t = Object.keys(e),
            r = Object.keys(n);
          if (t.length !== r.length) return !1;
          for (r = 0; r < t.length; r++) {
            var a = t[r];
            if (!d.call(n, a) || !or(e[a], n[a])) return !1;
          }
          return !0;
        }
        function ur(e) {
          for (; e && e.firstChild; ) e = e.firstChild;
          return e;
        }
        function cr(e, n) {
          var t,
            r = ur(e);
          for (e = 0; r; ) {
            if (3 === r.nodeType) {
              if (((t = e + r.textContent.length), e <= n && t >= n))
                return { node: r, offset: n - e };
              e = t;
            }
            e: {
              for (; r; ) {
                if (r.nextSibling) {
                  r = r.nextSibling;
                  break e;
                }
                r = r.parentNode;
              }
              r = void 0;
            }
            r = ur(r);
          }
        }
        function dr(e, n) {
          return (
            !(!e || !n) &&
            (e === n ||
              ((!e || 3 !== e.nodeType) &&
                (n && 3 === n.nodeType
                  ? dr(e, n.parentNode)
                  : "contains" in e
                    ? e.contains(n)
                    : !!e.compareDocumentPosition &&
                      !!(16 & e.compareDocumentPosition(n)))))
          );
        }
        function fr() {
          for (var e = window, n = K(); n instanceof e.HTMLIFrameElement; ) {
            try {
              var t = "string" === typeof n.contentWindow.location.href;
            } catch (r) {
              t = !1;
            }
            if (!t) break;
            n = K((e = n.contentWindow).document);
          }
          return n;
        }
        function pr(e) {
          var n = e && e.nodeName && e.nodeName.toLowerCase();
          return (
            n &&
            (("input" === n &&
              ("text" === e.type ||
                "search" === e.type ||
                "tel" === e.type ||
                "url" === e.type ||
                "password" === e.type)) ||
              "textarea" === n ||
              "true" === e.contentEditable)
          );
        }
        function hr(e) {
          var n = fr(),
            t = e.focusedElem,
            r = e.selectionRange;
          if (
            n !== t &&
            t &&
            t.ownerDocument &&
            dr(t.ownerDocument.documentElement, t)
          ) {
            if (null !== r && pr(t))
              if (
                ((n = r.start),
                void 0 === (e = r.end) && (e = n),
                "selectionStart" in t)
              )
                ((t.selectionStart = n),
                  (t.selectionEnd = Math.min(e, t.value.length)));
              else if (
                (e =
                  ((n = t.ownerDocument || document) && n.defaultView) ||
                  window).getSelection
              ) {
                e = e.getSelection();
                var a = t.textContent.length,
                  l = Math.min(r.start, a);
                ((r = void 0 === r.end ? l : Math.min(r.end, a)),
                  !e.extend && l > r && ((a = r), (r = l), (l = a)),
                  (a = cr(t, l)));
                var i = cr(t, r);
                a &&
                  i &&
                  (1 !== e.rangeCount ||
                    e.anchorNode !== a.node ||
                    e.anchorOffset !== a.offset ||
                    e.focusNode !== i.node ||
                    e.focusOffset !== i.offset) &&
                  ((n = n.createRange()).setStart(a.node, a.offset),
                  e.removeAllRanges(),
                  l > r
                    ? (e.addRange(n), e.extend(i.node, i.offset))
                    : (n.setEnd(i.node, i.offset), e.addRange(n)));
              }
            for (n = [], e = t; (e = e.parentNode); )
              1 === e.nodeType &&
                n.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
            for (
              "function" === typeof t.focus && t.focus(), t = 0;
              t < n.length;
              t++
            )
              (((e = n[t]).element.scrollLeft = e.left),
                (e.element.scrollTop = e.top));
          }
        }
        var mr = c && "documentMode" in document && 11 >= document.documentMode,
          gr = null,
          vr = null,
          yr = null,
          xr = !1;
        function br(e, n, t) {
          var r =
            t.window === t
              ? t.document
              : 9 === t.nodeType
                ? t
                : t.ownerDocument;
          xr ||
            null == gr ||
            gr !== K(r) ||
            ("selectionStart" in (r = gr) && pr(r)
              ? (r = { start: r.selectionStart, end: r.selectionEnd })
              : (r = {
                  anchorNode: (r = (
                    (r.ownerDocument && r.ownerDocument.defaultView) ||
                    window
                  ).getSelection()).anchorNode,
                  anchorOffset: r.anchorOffset,
                  focusNode: r.focusNode,
                  focusOffset: r.focusOffset,
                }),
            (yr && sr(yr, r)) ||
              ((yr = r),
              0 < (r = Qr(vr, "onSelect")).length &&
                ((n = new ct("onSelect", "select", null, n, t)),
                e.push({ event: n, listeners: r }),
                (n.target = gr))));
        }
        function wr(e, n) {
          var t = {};
          return (
            (t[e.toLowerCase()] = n.toLowerCase()),
            (t["Webkit" + e] = "webkit" + n),
            (t["Moz" + e] = "moz" + n),
            t
          );
        }
        var kr = {
            animationend: wr("Animation", "AnimationEnd"),
            animationiteration: wr("Animation", "AnimationIteration"),
            animationstart: wr("Animation", "AnimationStart"),
            transitionend: wr("Transition", "TransitionEnd"),
          },
          Sr = {},
          jr = {};
        function Cr(e) {
          if (Sr[e]) return Sr[e];
          if (!kr[e]) return e;
          var n,
            t = kr[e];
          for (n in t)
            if (t.hasOwnProperty(n) && n in jr) return (Sr[e] = t[n]);
          return e;
        }
        c &&
          ((jr = document.createElement("div").style),
          "AnimationEvent" in window ||
            (delete kr.animationend.animation,
            delete kr.animationiteration.animation,
            delete kr.animationstart.animation),
          "TransitionEvent" in window || delete kr.transitionend.transition);
        var Pr = Cr("animationend"),
          Er = Cr("animationiteration"),
          Nr = Cr("animationstart"),
          _r = Cr("transitionend"),
          zr = new Map(),
          Tr =
            "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
              " ",
            );
        function Lr(e, n) {
          (zr.set(e, n), s(n, [e]));
        }
        for (var Mr = 0; Mr < Tr.length; Mr++) {
          var Dr = Tr[Mr];
          Lr(Dr.toLowerCase(), "on" + (Dr[0].toUpperCase() + Dr.slice(1)));
        }
        (Lr(Pr, "onAnimationEnd"),
          Lr(Er, "onAnimationIteration"),
          Lr(Nr, "onAnimationStart"),
          Lr("dblclick", "onDoubleClick"),
          Lr("focusin", "onFocus"),
          Lr("focusout", "onBlur"),
          Lr(_r, "onTransitionEnd"),
          u("onMouseEnter", ["mouseout", "mouseover"]),
          u("onMouseLeave", ["mouseout", "mouseover"]),
          u("onPointerEnter", ["pointerout", "pointerover"]),
          u("onPointerLeave", ["pointerout", "pointerover"]),
          s(
            "onChange",
            "change click focusin focusout input keydown keyup selectionchange".split(
              " ",
            ),
          ),
          s(
            "onSelect",
            "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
              " ",
            ),
          ),
          s("onBeforeInput", [
            "compositionend",
            "keypress",
            "textInput",
            "paste",
          ]),
          s(
            "onCompositionEnd",
            "compositionend focusout keydown keypress keyup mousedown".split(
              " ",
            ),
          ),
          s(
            "onCompositionStart",
            "compositionstart focusout keydown keypress keyup mousedown".split(
              " ",
            ),
          ),
          s(
            "onCompositionUpdate",
            "compositionupdate focusout keydown keypress keyup mousedown".split(
              " ",
            ),
          ));
        var Rr =
            "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
              " ",
            ),
          Fr = new Set(
            "cancel close invalid load scroll toggle".split(" ").concat(Rr),
          );
        function Ir(e, n, t) {
          var r = e.type || "unknown-event";
          ((e.currentTarget = t),
            (function (e, n, t, r, a, i, o, s, u) {
              if ((Ae.apply(this, arguments), Fe)) {
                if (!Fe) throw Error(l(198));
                var c = Ie;
                ((Fe = !1), (Ie = null), Oe || ((Oe = !0), ($e = c)));
              }
            })(r, n, void 0, e),
            (e.currentTarget = null));
        }
        function Or(e, n) {
          n = 0 !== (4 & n);
          for (var t = 0; t < e.length; t++) {
            var r = e[t],
              a = r.event;
            r = r.listeners;
            e: {
              var l = void 0;
              if (n)
                for (var i = r.length - 1; 0 <= i; i--) {
                  var o = r[i],
                    s = o.instance,
                    u = o.currentTarget;
                  if (((o = o.listener), s !== l && a.isPropagationStopped()))
                    break e;
                  (Ir(a, o, u), (l = s));
                }
              else
                for (i = 0; i < r.length; i++) {
                  if (
                    ((s = (o = r[i]).instance),
                    (u = o.currentTarget),
                    (o = o.listener),
                    s !== l && a.isPropagationStopped())
                  )
                    break e;
                  (Ir(a, o, u), (l = s));
                }
            }
          }
          if (Oe) throw ((e = $e), (Oe = !1), ($e = null), e);
        }
        function $r(e, n) {
          var t = n[ma];
          void 0 === t && (t = n[ma] = new Set());
          var r = e + "__bubble";
          t.has(r) || (Br(n, e, 2, !1), t.add(r));
        }
        function Ur(e, n, t) {
          var r = 0;
          (n && (r |= 4), Br(t, e, r, n));
        }
        var Ar = "_reactListening" + Math.random().toString(36).slice(2);
        function Vr(e) {
          if (!e[Ar]) {
            ((e[Ar] = !0),
              i.forEach(function (n) {
                "selectionchange" !== n &&
                  (Fr.has(n) || Ur(n, !1, e), Ur(n, !0, e));
              }));
            var n = 9 === e.nodeType ? e : e.ownerDocument;
            null === n || n[Ar] || ((n[Ar] = !0), Ur("selectionchange", !1, n));
          }
        }
        function Br(e, n, t, r) {
          switch (Jn(n)) {
            case 1:
              var a = Qn;
              break;
            case 4:
              a = qn;
              break;
            default:
              a = Kn;
          }
          ((t = a.bind(null, n, t, e)),
            (a = void 0),
            !Me ||
              ("touchstart" !== n && "touchmove" !== n && "wheel" !== n) ||
              (a = !0),
            r
              ? void 0 !== a
                ? e.addEventListener(n, t, { capture: !0, passive: a })
                : e.addEventListener(n, t, !0)
              : void 0 !== a
                ? e.addEventListener(n, t, { passive: a })
                : e.addEventListener(n, t, !1));
        }
        function Hr(e, n, t, r, a) {
          var l = r;
          if (0 === (1 & n) && 0 === (2 & n) && null !== r)
            e: for (;;) {
              if (null === r) return;
              var i = r.tag;
              if (3 === i || 4 === i) {
                var o = r.stateNode.containerInfo;
                if (o === a || (8 === o.nodeType && o.parentNode === a)) break;
                if (4 === i)
                  for (i = r.return; null !== i; ) {
                    var s = i.tag;
                    if (
                      (3 === s || 4 === s) &&
                      ((s = i.stateNode.containerInfo) === a ||
                        (8 === s.nodeType && s.parentNode === a))
                    )
                      return;
                    i = i.return;
                  }
                for (; null !== o; ) {
                  if (null === (i = ya(o))) return;
                  if (5 === (s = i.tag) || 6 === s) {
                    r = l = i;
                    continue e;
                  }
                  o = o.parentNode;
                }
              }
              r = r.return;
            }
          Te(function () {
            var r = l,
              a = we(t),
              i = [];
            e: {
              var o = zr.get(e);
              if (void 0 !== o) {
                var s = ct,
                  u = e;
                switch (e) {
                  case "keypress":
                    if (0 === tt(t)) break e;
                  case "keydown":
                  case "keyup":
                    s = Et;
                    break;
                  case "focusin":
                    ((u = "focus"), (s = gt));
                    break;
                  case "focusout":
                    ((u = "blur"), (s = gt));
                    break;
                  case "beforeblur":
                  case "afterblur":
                    s = gt;
                    break;
                  case "click":
                    if (2 === t.button) break e;
                  case "auxclick":
                  case "dblclick":
                  case "mousedown":
                  case "mousemove":
                  case "mouseup":
                  case "mouseout":
                  case "mouseover":
                  case "contextmenu":
                    s = ht;
                    break;
                  case "drag":
                  case "dragend":
                  case "dragenter":
                  case "dragexit":
                  case "dragleave":
                  case "dragover":
                  case "dragstart":
                  case "drop":
                    s = mt;
                    break;
                  case "touchcancel":
                  case "touchend":
                  case "touchmove":
                  case "touchstart":
                    s = _t;
                    break;
                  case Pr:
                  case Er:
                  case Nr:
                    s = vt;
                    break;
                  case _r:
                    s = zt;
                    break;
                  case "scroll":
                    s = ft;
                    break;
                  case "wheel":
                    s = Lt;
                    break;
                  case "copy":
                  case "cut":
                  case "paste":
                    s = xt;
                    break;
                  case "gotpointercapture":
                  case "lostpointercapture":
                  case "pointercancel":
                  case "pointerdown":
                  case "pointermove":
                  case "pointerout":
                  case "pointerover":
                  case "pointerup":
                    s = Nt;
                }
                var c = 0 !== (4 & n),
                  d = !c && "scroll" === e,
                  f = c ? (null !== o ? o + "Capture" : null) : o;
                c = [];
                for (var p, h = r; null !== h; ) {
                  var m = (p = h).stateNode;
                  if (
                    (5 === p.tag &&
                      null !== m &&
                      ((p = m),
                      null !== f &&
                        null != (m = Le(h, f)) &&
                        c.push(Wr(h, m, p))),
                    d)
                  )
                    break;
                  h = h.return;
                }
                0 < c.length &&
                  ((o = new s(o, u, null, t, a)),
                  i.push({ event: o, listeners: c }));
              }
            }
            if (0 === (7 & n)) {
              if (
                ((s = "mouseout" === e || "pointerout" === e),
                (!(o = "mouseover" === e || "pointerover" === e) ||
                  t === be ||
                  !(u = t.relatedTarget || t.fromElement) ||
                  (!ya(u) && !u[ha])) &&
                  (s || o) &&
                  ((o =
                    a.window === a
                      ? a
                      : (o = a.ownerDocument)
                        ? o.defaultView || o.parentWindow
                        : window),
                  s
                    ? ((s = r),
                      null !==
                        (u = (u = t.relatedTarget || t.toElement)
                          ? ya(u)
                          : null) &&
                        (u !== (d = Ve(u)) || (5 !== u.tag && 6 !== u.tag)) &&
                        (u = null))
                    : ((s = null), (u = r)),
                  s !== u))
              ) {
                if (
                  ((c = ht),
                  (m = "onMouseLeave"),
                  (f = "onMouseEnter"),
                  (h = "mouse"),
                  ("pointerout" !== e && "pointerover" !== e) ||
                    ((c = Nt),
                    (m = "onPointerLeave"),
                    (f = "onPointerEnter"),
                    (h = "pointer")),
                  (d = null == s ? o : ba(s)),
                  (p = null == u ? o : ba(u)),
                  ((o = new c(m, h + "leave", s, t, a)).target = d),
                  (o.relatedTarget = p),
                  (m = null),
                  ya(a) === r &&
                    (((c = new c(f, h + "enter", u, t, a)).target = p),
                    (c.relatedTarget = d),
                    (m = c)),
                  (d = m),
                  s && u)
                )
                  e: {
                    for (f = u, h = 0, p = c = s; p; p = qr(p)) h++;
                    for (p = 0, m = f; m; m = qr(m)) p++;
                    for (; 0 < h - p; ) ((c = qr(c)), h--);
                    for (; 0 < p - h; ) ((f = qr(f)), p--);
                    for (; h--; ) {
                      if (c === f || (null !== f && c === f.alternate)) break e;
                      ((c = qr(c)), (f = qr(f)));
                    }
                    c = null;
                  }
                else c = null;
                (null !== s && Kr(i, o, s, c, !1),
                  null !== u && null !== d && Kr(i, d, u, c, !0));
              }
              if (
                "select" ===
                  (s =
                    (o = r ? ba(r) : window).nodeName &&
                    o.nodeName.toLowerCase()) ||
                ("input" === s && "file" === o.type)
              )
                var g = Gt;
              else if (Ht(o))
                if (Jt) g = ir;
                else {
                  g = ar;
                  var v = rr;
                }
              else
                (s = o.nodeName) &&
                  "input" === s.toLowerCase() &&
                  ("checkbox" === o.type || "radio" === o.type) &&
                  (g = lr);
              switch (
                (g && (g = g(e, r))
                  ? Wt(i, g, t, a)
                  : (v && v(e, o, r),
                    "focusout" === e &&
                      (v = o._wrapperState) &&
                      v.controlled &&
                      "number" === o.type &&
                      ee(o, "number", o.value)),
                (v = r ? ba(r) : window),
                e)
              ) {
                case "focusin":
                  (Ht(v) || "true" === v.contentEditable) &&
                    ((gr = v), (vr = r), (yr = null));
                  break;
                case "focusout":
                  yr = vr = gr = null;
                  break;
                case "mousedown":
                  xr = !0;
                  break;
                case "contextmenu":
                case "mouseup":
                case "dragend":
                  ((xr = !1), br(i, t, a));
                  break;
                case "selectionchange":
                  if (mr) break;
                case "keydown":
                case "keyup":
                  br(i, t, a);
              }
              var y;
              if (Dt)
                e: {
                  switch (e) {
                    case "compositionstart":
                      var x = "onCompositionStart";
                      break e;
                    case "compositionend":
                      x = "onCompositionEnd";
                      break e;
                    case "compositionupdate":
                      x = "onCompositionUpdate";
                      break e;
                  }
                  x = void 0;
                }
              else
                Vt
                  ? Ut(e, t) && (x = "onCompositionEnd")
                  : "keydown" === e &&
                    229 === t.keyCode &&
                    (x = "onCompositionStart");
              (x &&
                (It &&
                  "ko" !== t.locale &&
                  (Vt || "onCompositionStart" !== x
                    ? "onCompositionEnd" === x && Vt && (y = nt())
                    : ((Zn = "value" in (Xn = a) ? Xn.value : Xn.textContent),
                      (Vt = !0))),
                0 < (v = Qr(r, x)).length &&
                  ((x = new bt(x, e, null, t, a)),
                  i.push({ event: x, listeners: v }),
                  y ? (x.data = y) : null !== (y = At(t)) && (x.data = y))),
                (y = Ft
                  ? (function (e, n) {
                      switch (e) {
                        case "compositionend":
                          return At(n);
                        case "keypress":
                          return 32 !== n.which ? null : (($t = !0), Ot);
                        case "textInput":
                          return (e = n.data) === Ot && $t ? null : e;
                        default:
                          return null;
                      }
                    })(e, t)
                  : (function (e, n) {
                      if (Vt)
                        return "compositionend" === e || (!Dt && Ut(e, n))
                          ? ((e = nt()), (et = Zn = Xn = null), (Vt = !1), e)
                          : null;
                      switch (e) {
                        case "paste":
                        default:
                          return null;
                        case "keypress":
                          if (
                            !(n.ctrlKey || n.altKey || n.metaKey) ||
                            (n.ctrlKey && n.altKey)
                          ) {
                            if (n.char && 1 < n.char.length) return n.char;
                            if (n.which) return String.fromCharCode(n.which);
                          }
                          return null;
                        case "compositionend":
                          return It && "ko" !== n.locale ? null : n.data;
                      }
                    })(e, t)) &&
                  0 < (r = Qr(r, "onBeforeInput")).length &&
                  ((a = new bt("onBeforeInput", "beforeinput", null, t, a)),
                  i.push({ event: a, listeners: r }),
                  (a.data = y)));
            }
            Or(i, n);
          });
        }
        function Wr(e, n, t) {
          return { instance: e, listener: n, currentTarget: t };
        }
        function Qr(e, n) {
          for (var t = n + "Capture", r = []; null !== e; ) {
            var a = e,
              l = a.stateNode;
            (5 === a.tag &&
              null !== l &&
              ((a = l),
              null != (l = Le(e, t)) && r.unshift(Wr(e, l, a)),
              null != (l = Le(e, n)) && r.push(Wr(e, l, a))),
              (e = e.return));
          }
          return r;
        }
        function qr(e) {
          if (null === e) return null;
          do {
            e = e.return;
          } while (e && 5 !== e.tag);
          return e || null;
        }
        function Kr(e, n, t, r, a) {
          for (var l = n._reactName, i = []; null !== t && t !== r; ) {
            var o = t,
              s = o.alternate,
              u = o.stateNode;
            if (null !== s && s === r) break;
            (5 === o.tag &&
              null !== u &&
              ((o = u),
              a
                ? null != (s = Le(t, l)) && i.unshift(Wr(t, s, o))
                : a || (null != (s = Le(t, l)) && i.push(Wr(t, s, o)))),
              (t = t.return));
          }
          0 !== i.length && e.push({ event: n, listeners: i });
        }
        var Yr = /\r\n?/g,
          Gr = /\u0000|\uFFFD/g;
        function Jr(e) {
          return ("string" === typeof e ? e : "" + e)
            .replace(Yr, "\n")
            .replace(Gr, "");
        }
        function Xr(e, n, t) {
          if (((n = Jr(n)), Jr(e) !== n && t)) throw Error(l(425));
        }
        function Zr() {}
        var ea = null,
          na = null;
        function ta(e, n) {
          return (
            "textarea" === e ||
            "noscript" === e ||
            "string" === typeof n.children ||
            "number" === typeof n.children ||
            ("object" === typeof n.dangerouslySetInnerHTML &&
              null !== n.dangerouslySetInnerHTML &&
              null != n.dangerouslySetInnerHTML.__html)
          );
        }
        var ra = "function" === typeof setTimeout ? setTimeout : void 0,
          aa = "function" === typeof clearTimeout ? clearTimeout : void 0,
          la = "function" === typeof Promise ? Promise : void 0,
          ia =
            "function" === typeof queueMicrotask
              ? queueMicrotask
              : "undefined" !== typeof la
                ? function (e) {
                    return la.resolve(null).then(e).catch(oa);
                  }
                : ra;
        function oa(e) {
          setTimeout(function () {
            throw e;
          });
        }
        function sa(e, n) {
          var t = n,
            r = 0;
          do {
            var a = t.nextSibling;
            if ((e.removeChild(t), a && 8 === a.nodeType))
              if ("/$" === (t = a.data)) {
                if (0 === r) return (e.removeChild(a), void Bn(n));
                r--;
              } else ("$" !== t && "$?" !== t && "$!" !== t) || r++;
            t = a;
          } while (t);
          Bn(n);
        }
        function ua(e) {
          for (; null != e; e = e.nextSibling) {
            var n = e.nodeType;
            if (1 === n || 3 === n) break;
            if (8 === n) {
              if ("$" === (n = e.data) || "$!" === n || "$?" === n) break;
              if ("/$" === n) return null;
            }
          }
          return e;
        }
        function ca(e) {
          e = e.previousSibling;
          for (var n = 0; e; ) {
            if (8 === e.nodeType) {
              var t = e.data;
              if ("$" === t || "$!" === t || "$?" === t) {
                if (0 === n) return e;
                n--;
              } else "/$" === t && n++;
            }
            e = e.previousSibling;
          }
          return null;
        }
        var da = Math.random().toString(36).slice(2),
          fa = "__reactFiber$" + da,
          pa = "__reactProps$" + da,
          ha = "__reactContainer$" + da,
          ma = "__reactEvents$" + da,
          ga = "__reactListeners$" + da,
          va = "__reactHandles$" + da;
        function ya(e) {
          var n = e[fa];
          if (n) return n;
          for (var t = e.parentNode; t; ) {
            if ((n = t[ha] || t[fa])) {
              if (
                ((t = n.alternate),
                null !== n.child || (null !== t && null !== t.child))
              )
                for (e = ca(e); null !== e; ) {
                  if ((t = e[fa])) return t;
                  e = ca(e);
                }
              return n;
            }
            t = (e = t).parentNode;
          }
          return null;
        }
        function xa(e) {
          return !(e = e[fa] || e[ha]) ||
            (5 !== e.tag && 6 !== e.tag && 13 !== e.tag && 3 !== e.tag)
            ? null
            : e;
        }
        function ba(e) {
          if (5 === e.tag || 6 === e.tag) return e.stateNode;
          throw Error(l(33));
        }
        function wa(e) {
          return e[pa] || null;
        }
        var ka = [],
          Sa = -1;
        function ja(e) {
          return { current: e };
        }
        function Ca(e) {
          0 > Sa || ((e.current = ka[Sa]), (ka[Sa] = null), Sa--);
        }
        function Pa(e, n) {
          (Sa++, (ka[Sa] = e.current), (e.current = n));
        }
        var Ea = {},
          Na = ja(Ea),
          _a = ja(!1),
          za = Ea;
        function Ta(e, n) {
          var t = e.type.contextTypes;
          if (!t) return Ea;
          var r = e.stateNode;
          if (r && r.__reactInternalMemoizedUnmaskedChildContext === n)
            return r.__reactInternalMemoizedMaskedChildContext;
          var a,
            l = {};
          for (a in t) l[a] = n[a];
          return (
            r &&
              (((e = e.stateNode).__reactInternalMemoizedUnmaskedChildContext =
                n),
              (e.__reactInternalMemoizedMaskedChildContext = l)),
            l
          );
        }
        function La(e) {
          return null !== (e = e.childContextTypes) && void 0 !== e;
        }
        function Ma() {
          (Ca(_a), Ca(Na));
        }
        function Da(e, n, t) {
          if (Na.current !== Ea) throw Error(l(168));
          (Pa(Na, n), Pa(_a, t));
        }
        function Ra(e, n, t) {
          var r = e.stateNode;
          if (
            ((n = n.childContextTypes), "function" !== typeof r.getChildContext)
          )
            return t;
          for (var a in (r = r.getChildContext()))
            if (!(a in n)) throw Error(l(108, B(e) || "Unknown", a));
          return I({}, t, r);
        }
        function Fa(e) {
          return (
            (e =
              ((e = e.stateNode) &&
                e.__reactInternalMemoizedMergedChildContext) ||
              Ea),
            (za = Na.current),
            Pa(Na, e),
            Pa(_a, _a.current),
            !0
          );
        }
        function Ia(e, n, t) {
          var r = e.stateNode;
          if (!r) throw Error(l(169));
          (t
            ? ((e = Ra(e, n, za)),
              (r.__reactInternalMemoizedMergedChildContext = e),
              Ca(_a),
              Ca(Na),
              Pa(Na, e))
            : Ca(_a),
            Pa(_a, t));
        }
        var Oa = null,
          $a = !1,
          Ua = !1;
        function Aa(e) {
          null === Oa ? (Oa = [e]) : Oa.push(e);
        }
        function Va() {
          if (!Ua && null !== Oa) {
            Ua = !0;
            var e = 0,
              n = bn;
            try {
              var t = Oa;
              for (bn = 1; e < t.length; e++) {
                var r = t[e];
                do {
                  r = r(!0);
                } while (null !== r);
              }
              ((Oa = null), ($a = !1));
            } catch (a) {
              throw (null !== Oa && (Oa = Oa.slice(e + 1)), qe(Ze, Va), a);
            } finally {
              ((bn = n), (Ua = !1));
            }
          }
          return null;
        }
        var Ba = [],
          Ha = 0,
          Wa = null,
          Qa = 0,
          qa = [],
          Ka = 0,
          Ya = null,
          Ga = 1,
          Ja = "";
        function Xa(e, n) {
          ((Ba[Ha++] = Qa), (Ba[Ha++] = Wa), (Wa = e), (Qa = n));
        }
        function Za(e, n, t) {
          ((qa[Ka++] = Ga), (qa[Ka++] = Ja), (qa[Ka++] = Ya), (Ya = e));
          var r = Ga;
          e = Ja;
          var a = 32 - on(r) - 1;
          ((r &= ~(1 << a)), (t += 1));
          var l = 32 - on(n) + a;
          if (30 < l) {
            var i = a - (a % 5);
            ((l = (r & ((1 << i) - 1)).toString(32)),
              (r >>= i),
              (a -= i),
              (Ga = (1 << (32 - on(n) + a)) | (t << a) | r),
              (Ja = l + e));
          } else ((Ga = (1 << l) | (t << a) | r), (Ja = e));
        }
        function el(e) {
          null !== e.return && (Xa(e, 1), Za(e, 1, 0));
        }
        function nl(e) {
          for (; e === Wa; )
            ((Wa = Ba[--Ha]),
              (Ba[Ha] = null),
              (Qa = Ba[--Ha]),
              (Ba[Ha] = null));
          for (; e === Ya; )
            ((Ya = qa[--Ka]),
              (qa[Ka] = null),
              (Ja = qa[--Ka]),
              (qa[Ka] = null),
              (Ga = qa[--Ka]),
              (qa[Ka] = null));
        }
        var tl = null,
          rl = null,
          al = !1,
          ll = null;
        function il(e, n) {
          var t = Tu(5, null, null, 0);
          ((t.elementType = "DELETED"),
            (t.stateNode = n),
            (t.return = e),
            null === (n = e.deletions)
              ? ((e.deletions = [t]), (e.flags |= 16))
              : n.push(t));
        }
        function ol(e, n) {
          switch (e.tag) {
            case 5:
              var t = e.type;
              return (
                null !==
                  (n =
                    1 !== n.nodeType ||
                    t.toLowerCase() !== n.nodeName.toLowerCase()
                      ? null
                      : n) &&
                ((e.stateNode = n), (tl = e), (rl = ua(n.firstChild)), !0)
              );
            case 6:
              return (
                null !==
                  (n = "" === e.pendingProps || 3 !== n.nodeType ? null : n) &&
                ((e.stateNode = n), (tl = e), (rl = null), !0)
              );
            case 13:
              return (
                null !== (n = 8 !== n.nodeType ? null : n) &&
                ((t = null !== Ya ? { id: Ga, overflow: Ja } : null),
                (e.memoizedState = {
                  dehydrated: n,
                  treeContext: t,
                  retryLane: 1073741824,
                }),
                ((t = Tu(18, null, null, 0)).stateNode = n),
                (t.return = e),
                (e.child = t),
                (tl = e),
                (rl = null),
                !0)
              );
            default:
              return !1;
          }
        }
        function sl(e) {
          return 0 !== (1 & e.mode) && 0 === (128 & e.flags);
        }
        function ul(e) {
          if (al) {
            var n = rl;
            if (n) {
              var t = n;
              if (!ol(e, n)) {
                if (sl(e)) throw Error(l(418));
                n = ua(t.nextSibling);
                var r = tl;
                n && ol(e, n)
                  ? il(r, t)
                  : ((e.flags = (-4097 & e.flags) | 2), (al = !1), (tl = e));
              }
            } else {
              if (sl(e)) throw Error(l(418));
              ((e.flags = (-4097 & e.flags) | 2), (al = !1), (tl = e));
            }
          }
        }
        function cl(e) {
          for (
            e = e.return;
            null !== e && 5 !== e.tag && 3 !== e.tag && 13 !== e.tag;

          )
            e = e.return;
          tl = e;
        }
        function dl(e) {
          if (e !== tl) return !1;
          if (!al) return (cl(e), (al = !0), !1);
          var n;
          if (
            ((n = 3 !== e.tag) &&
              !(n = 5 !== e.tag) &&
              (n =
                "head" !== (n = e.type) &&
                "body" !== n &&
                !ta(e.type, e.memoizedProps)),
            n && (n = rl))
          ) {
            if (sl(e)) throw (fl(), Error(l(418)));
            for (; n; ) (il(e, n), (n = ua(n.nextSibling)));
          }
          if ((cl(e), 13 === e.tag)) {
            if (!(e = null !== (e = e.memoizedState) ? e.dehydrated : null))
              throw Error(l(317));
            e: {
              for (e = e.nextSibling, n = 0; e; ) {
                if (8 === e.nodeType) {
                  var t = e.data;
                  if ("/$" === t) {
                    if (0 === n) {
                      rl = ua(e.nextSibling);
                      break e;
                    }
                    n--;
                  } else ("$" !== t && "$!" !== t && "$?" !== t) || n++;
                }
                e = e.nextSibling;
              }
              rl = null;
            }
          } else rl = tl ? ua(e.stateNode.nextSibling) : null;
          return !0;
        }
        function fl() {
          for (var e = rl; e; ) e = ua(e.nextSibling);
        }
        function pl() {
          ((rl = tl = null), (al = !1));
        }
        function hl(e) {
          null === ll ? (ll = [e]) : ll.push(e);
        }
        var ml = b.ReactCurrentBatchConfig;
        function gl(e, n, t) {
          if (
            null !== (e = t.ref) &&
            "function" !== typeof e &&
            "object" !== typeof e
          ) {
            if (t._owner) {
              if ((t = t._owner)) {
                if (1 !== t.tag) throw Error(l(309));
                var r = t.stateNode;
              }
              if (!r) throw Error(l(147, e));
              var a = r,
                i = "" + e;
              return null !== n &&
                null !== n.ref &&
                "function" === typeof n.ref &&
                n.ref._stringRef === i
                ? n.ref
                : ((n = function (e) {
                    var n = a.refs;
                    null === e ? delete n[i] : (n[i] = e);
                  }),
                  (n._stringRef = i),
                  n);
            }
            if ("string" !== typeof e) throw Error(l(284));
            if (!t._owner) throw Error(l(290, e));
          }
          return e;
        }
        function vl(e, n) {
          throw (
            (e = Object.prototype.toString.call(n)),
            Error(
              l(
                31,
                "[object Object]" === e
                  ? "object with keys {" + Object.keys(n).join(", ") + "}"
                  : e,
              ),
            )
          );
        }
        function yl(e) {
          return (0, e._init)(e._payload);
        }
        function xl(e) {
          function n(n, t) {
            if (e) {
              var r = n.deletions;
              null === r ? ((n.deletions = [t]), (n.flags |= 16)) : r.push(t);
            }
          }
          function t(t, r) {
            if (!e) return null;
            for (; null !== r; ) (n(t, r), (r = r.sibling));
            return null;
          }
          function r(e, n) {
            for (e = new Map(); null !== n; )
              (null !== n.key ? e.set(n.key, n) : e.set(n.index, n),
                (n = n.sibling));
            return e;
          }
          function a(e, n) {
            return (((e = Mu(e, n)).index = 0), (e.sibling = null), e);
          }
          function i(n, t, r) {
            return (
              (n.index = r),
              e
                ? null !== (r = n.alternate)
                  ? (r = r.index) < t
                    ? ((n.flags |= 2), t)
                    : r
                  : ((n.flags |= 2), t)
                : ((n.flags |= 1048576), t)
            );
          }
          function o(n) {
            return (e && null === n.alternate && (n.flags |= 2), n);
          }
          function s(e, n, t, r) {
            return null === n || 6 !== n.tag
              ? (((n = Iu(t, e.mode, r)).return = e), n)
              : (((n = a(n, t)).return = e), n);
          }
          function u(e, n, t, r) {
            var l = t.type;
            return l === S
              ? d(e, n, t.props.children, r, t.key)
              : null !== n &&
                  (n.elementType === l ||
                    ("object" === typeof l &&
                      null !== l &&
                      l.$$typeof === L &&
                      yl(l) === n.type))
                ? (((r = a(n, t.props)).ref = gl(e, n, t)), (r.return = e), r)
                : (((r = Du(t.type, t.key, t.props, null, e.mode, r)).ref = gl(
                    e,
                    n,
                    t,
                  )),
                  (r.return = e),
                  r);
          }
          function c(e, n, t, r) {
            return null === n ||
              4 !== n.tag ||
              n.stateNode.containerInfo !== t.containerInfo ||
              n.stateNode.implementation !== t.implementation
              ? (((n = Ou(t, e.mode, r)).return = e), n)
              : (((n = a(n, t.children || [])).return = e), n);
          }
          function d(e, n, t, r, l) {
            return null === n || 7 !== n.tag
              ? (((n = Ru(t, e.mode, r, l)).return = e), n)
              : (((n = a(n, t)).return = e), n);
          }
          function f(e, n, t) {
            if (("string" === typeof n && "" !== n) || "number" === typeof n)
              return (((n = Iu("" + n, e.mode, t)).return = e), n);
            if ("object" === typeof n && null !== n) {
              switch (n.$$typeof) {
                case w:
                  return (
                    ((t = Du(n.type, n.key, n.props, null, e.mode, t)).ref = gl(
                      e,
                      null,
                      n,
                    )),
                    (t.return = e),
                    t
                  );
                case k:
                  return (((n = Ou(n, e.mode, t)).return = e), n);
                case L:
                  return f(e, (0, n._init)(n._payload), t);
              }
              if (ne(n) || R(n))
                return (((n = Ru(n, e.mode, t, null)).return = e), n);
              vl(e, n);
            }
            return null;
          }
          function p(e, n, t, r) {
            var a = null !== n ? n.key : null;
            if (("string" === typeof t && "" !== t) || "number" === typeof t)
              return null !== a ? null : s(e, n, "" + t, r);
            if ("object" === typeof t && null !== t) {
              switch (t.$$typeof) {
                case w:
                  return t.key === a ? u(e, n, t, r) : null;
                case k:
                  return t.key === a ? c(e, n, t, r) : null;
                case L:
                  return p(e, n, (a = t._init)(t._payload), r);
              }
              if (ne(t) || R(t)) return null !== a ? null : d(e, n, t, r, null);
              vl(e, t);
            }
            return null;
          }
          function h(e, n, t, r, a) {
            if (("string" === typeof r && "" !== r) || "number" === typeof r)
              return s(n, (e = e.get(t) || null), "" + r, a);
            if ("object" === typeof r && null !== r) {
              switch (r.$$typeof) {
                case w:
                  return u(
                    n,
                    (e = e.get(null === r.key ? t : r.key) || null),
                    r,
                    a,
                  );
                case k:
                  return c(
                    n,
                    (e = e.get(null === r.key ? t : r.key) || null),
                    r,
                    a,
                  );
                case L:
                  return h(e, n, t, (0, r._init)(r._payload), a);
              }
              if (ne(r) || R(r))
                return d(n, (e = e.get(t) || null), r, a, null);
              vl(n, r);
            }
            return null;
          }
          function m(a, l, o, s) {
            for (
              var u = null, c = null, d = l, m = (l = 0), g = null;
              null !== d && m < o.length;
              m++
            ) {
              d.index > m ? ((g = d), (d = null)) : (g = d.sibling);
              var v = p(a, d, o[m], s);
              if (null === v) {
                null === d && (d = g);
                break;
              }
              (e && d && null === v.alternate && n(a, d),
                (l = i(v, l, m)),
                null === c ? (u = v) : (c.sibling = v),
                (c = v),
                (d = g));
            }
            if (m === o.length) return (t(a, d), al && Xa(a, m), u);
            if (null === d) {
              for (; m < o.length; m++)
                null !== (d = f(a, o[m], s)) &&
                  ((l = i(d, l, m)),
                  null === c ? (u = d) : (c.sibling = d),
                  (c = d));
              return (al && Xa(a, m), u);
            }
            for (d = r(a, d); m < o.length; m++)
              null !== (g = h(d, a, m, o[m], s)) &&
                (e &&
                  null !== g.alternate &&
                  d.delete(null === g.key ? m : g.key),
                (l = i(g, l, m)),
                null === c ? (u = g) : (c.sibling = g),
                (c = g));
            return (
              e &&
                d.forEach(function (e) {
                  return n(a, e);
                }),
              al && Xa(a, m),
              u
            );
          }
          function g(a, o, s, u) {
            var c = R(s);
            if ("function" !== typeof c) throw Error(l(150));
            if (null == (s = c.call(s))) throw Error(l(151));
            for (
              var d = (c = null), m = o, g = (o = 0), v = null, y = s.next();
              null !== m && !y.done;
              g++, y = s.next()
            ) {
              m.index > g ? ((v = m), (m = null)) : (v = m.sibling);
              var x = p(a, m, y.value, u);
              if (null === x) {
                null === m && (m = v);
                break;
              }
              (e && m && null === x.alternate && n(a, m),
                (o = i(x, o, g)),
                null === d ? (c = x) : (d.sibling = x),
                (d = x),
                (m = v));
            }
            if (y.done) return (t(a, m), al && Xa(a, g), c);
            if (null === m) {
              for (; !y.done; g++, y = s.next())
                null !== (y = f(a, y.value, u)) &&
                  ((o = i(y, o, g)),
                  null === d ? (c = y) : (d.sibling = y),
                  (d = y));
              return (al && Xa(a, g), c);
            }
            for (m = r(a, m); !y.done; g++, y = s.next())
              null !== (y = h(m, a, g, y.value, u)) &&
                (e &&
                  null !== y.alternate &&
                  m.delete(null === y.key ? g : y.key),
                (o = i(y, o, g)),
                null === d ? (c = y) : (d.sibling = y),
                (d = y));
            return (
              e &&
                m.forEach(function (e) {
                  return n(a, e);
                }),
              al && Xa(a, g),
              c
            );
          }
          return function e(r, l, i, s) {
            if (
              ("object" === typeof i &&
                null !== i &&
                i.type === S &&
                null === i.key &&
                (i = i.props.children),
              "object" === typeof i && null !== i)
            ) {
              switch (i.$$typeof) {
                case w:
                  e: {
                    for (var u = i.key, c = l; null !== c; ) {
                      if (c.key === u) {
                        if ((u = i.type) === S) {
                          if (7 === c.tag) {
                            (t(r, c.sibling),
                              ((l = a(c, i.props.children)).return = r),
                              (r = l));
                            break e;
                          }
                        } else if (
                          c.elementType === u ||
                          ("object" === typeof u &&
                            null !== u &&
                            u.$$typeof === L &&
                            yl(u) === c.type)
                        ) {
                          (t(r, c.sibling),
                            ((l = a(c, i.props)).ref = gl(r, c, i)),
                            (l.return = r),
                            (r = l));
                          break e;
                        }
                        t(r, c);
                        break;
                      }
                      (n(r, c), (c = c.sibling));
                    }
                    i.type === S
                      ? (((l = Ru(i.props.children, r.mode, s, i.key)).return =
                          r),
                        (r = l))
                      : (((s = Du(
                          i.type,
                          i.key,
                          i.props,
                          null,
                          r.mode,
                          s,
                        )).ref = gl(r, l, i)),
                        (s.return = r),
                        (r = s));
                  }
                  return o(r);
                case k:
                  e: {
                    for (c = i.key; null !== l; ) {
                      if (l.key === c) {
                        if (
                          4 === l.tag &&
                          l.stateNode.containerInfo === i.containerInfo &&
                          l.stateNode.implementation === i.implementation
                        ) {
                          (t(r, l.sibling),
                            ((l = a(l, i.children || [])).return = r),
                            (r = l));
                          break e;
                        }
                        t(r, l);
                        break;
                      }
                      (n(r, l), (l = l.sibling));
                    }
                    (((l = Ou(i, r.mode, s)).return = r), (r = l));
                  }
                  return o(r);
                case L:
                  return e(r, l, (c = i._init)(i._payload), s);
              }
              if (ne(i)) return m(r, l, i, s);
              if (R(i)) return g(r, l, i, s);
              vl(r, i);
            }
            return ("string" === typeof i && "" !== i) || "number" === typeof i
              ? ((i = "" + i),
                null !== l && 6 === l.tag
                  ? (t(r, l.sibling), ((l = a(l, i)).return = r), (r = l))
                  : (t(r, l), ((l = Iu(i, r.mode, s)).return = r), (r = l)),
                o(r))
              : t(r, l);
          };
        }
        var bl = xl(!0),
          wl = xl(!1),
          kl = ja(null),
          Sl = null,
          jl = null,
          Cl = null;
        function Pl() {
          Cl = jl = Sl = null;
        }
        function El(e) {
          var n = kl.current;
          (Ca(kl), (e._currentValue = n));
        }
        function Nl(e, n, t) {
          for (; null !== e; ) {
            var r = e.alternate;
            if (
              ((e.childLanes & n) !== n
                ? ((e.childLanes |= n), null !== r && (r.childLanes |= n))
                : null !== r && (r.childLanes & n) !== n && (r.childLanes |= n),
              e === t)
            )
              break;
            e = e.return;
          }
        }
        function _l(e, n) {
          ((Sl = e),
            (Cl = jl = null),
            null !== (e = e.dependencies) &&
              null !== e.firstContext &&
              (0 !== (e.lanes & n) && (xo = !0), (e.firstContext = null)));
        }
        function zl(e) {
          var n = e._currentValue;
          if (Cl !== e)
            if (
              ((e = { context: e, memoizedValue: n, next: null }), null === jl)
            ) {
              if (null === Sl) throw Error(l(308));
              ((jl = e), (Sl.dependencies = { lanes: 0, firstContext: e }));
            } else jl = jl.next = e;
          return n;
        }
        var Tl = null;
        function Ll(e) {
          null === Tl ? (Tl = [e]) : Tl.push(e);
        }
        function Ml(e, n, t, r) {
          var a = n.interleaved;
          return (
            null === a
              ? ((t.next = t), Ll(n))
              : ((t.next = a.next), (a.next = t)),
            (n.interleaved = t),
            Dl(e, r)
          );
        }
        function Dl(e, n) {
          e.lanes |= n;
          var t = e.alternate;
          for (null !== t && (t.lanes |= n), t = e, e = e.return; null !== e; )
            ((e.childLanes |= n),
              null !== (t = e.alternate) && (t.childLanes |= n),
              (t = e),
              (e = e.return));
          return 3 === t.tag ? t.stateNode : null;
        }
        var Rl = !1;
        function Fl(e) {
          e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: { pending: null, interleaved: null, lanes: 0 },
            effects: null,
          };
        }
        function Il(e, n) {
          ((e = e.updateQueue),
            n.updateQueue === e &&
              (n.updateQueue = {
                baseState: e.baseState,
                firstBaseUpdate: e.firstBaseUpdate,
                lastBaseUpdate: e.lastBaseUpdate,
                shared: e.shared,
                effects: e.effects,
              }));
        }
        function Ol(e, n) {
          return {
            eventTime: e,
            lane: n,
            tag: 0,
            payload: null,
            callback: null,
            next: null,
          };
        }
        function $l(e, n, t) {
          var r = e.updateQueue;
          if (null === r) return null;
          if (((r = r.shared), 0 !== (2 & Ns))) {
            var a = r.pending;
            return (
              null === a ? (n.next = n) : ((n.next = a.next), (a.next = n)),
              (r.pending = n),
              Dl(e, t)
            );
          }
          return (
            null === (a = r.interleaved)
              ? ((n.next = n), Ll(r))
              : ((n.next = a.next), (a.next = n)),
            (r.interleaved = n),
            Dl(e, t)
          );
        }
        function Ul(e, n, t) {
          if (
            null !== (n = n.updateQueue) &&
            ((n = n.shared), 0 !== (4194240 & t))
          ) {
            var r = n.lanes;
            ((t |= r &= e.pendingLanes), (n.lanes = t), xn(e, t));
          }
        }
        function Al(e, n) {
          var t = e.updateQueue,
            r = e.alternate;
          if (null !== r && t === (r = r.updateQueue)) {
            var a = null,
              l = null;
            if (null !== (t = t.firstBaseUpdate)) {
              do {
                var i = {
                  eventTime: t.eventTime,
                  lane: t.lane,
                  tag: t.tag,
                  payload: t.payload,
                  callback: t.callback,
                  next: null,
                };
                (null === l ? (a = l = i) : (l = l.next = i), (t = t.next));
              } while (null !== t);
              null === l ? (a = l = n) : (l = l.next = n);
            } else a = l = n;
            return (
              (t = {
                baseState: r.baseState,
                firstBaseUpdate: a,
                lastBaseUpdate: l,
                shared: r.shared,
                effects: r.effects,
              }),
              void (e.updateQueue = t)
            );
          }
          (null === (e = t.lastBaseUpdate)
            ? (t.firstBaseUpdate = n)
            : (e.next = n),
            (t.lastBaseUpdate = n));
        }
        function Vl(e, n, t, r) {
          var a = e.updateQueue;
          Rl = !1;
          var l = a.firstBaseUpdate,
            i = a.lastBaseUpdate,
            o = a.shared.pending;
          if (null !== o) {
            a.shared.pending = null;
            var s = o,
              u = s.next;
            ((s.next = null), null === i ? (l = u) : (i.next = u), (i = s));
            var c = e.alternate;
            null !== c &&
              (o = (c = c.updateQueue).lastBaseUpdate) !== i &&
              (null === o ? (c.firstBaseUpdate = u) : (o.next = u),
              (c.lastBaseUpdate = s));
          }
          if (null !== l) {
            var d = a.baseState;
            for (i = 0, c = u = s = null, o = l; ; ) {
              var f = o.lane,
                p = o.eventTime;
              if ((r & f) === f) {
                null !== c &&
                  (c = c.next =
                    {
                      eventTime: p,
                      lane: 0,
                      tag: o.tag,
                      payload: o.payload,
                      callback: o.callback,
                      next: null,
                    });
                e: {
                  var h = e,
                    m = o;
                  switch (((f = n), (p = t), m.tag)) {
                    case 1:
                      if ("function" === typeof (h = m.payload)) {
                        d = h.call(p, d, f);
                        break e;
                      }
                      d = h;
                      break e;
                    case 3:
                      h.flags = (-65537 & h.flags) | 128;
                    case 0:
                      if (
                        null ===
                          (f =
                            "function" === typeof (h = m.payload)
                              ? h.call(p, d, f)
                              : h) ||
                        void 0 === f
                      )
                        break e;
                      d = I({}, d, f);
                      break e;
                    case 2:
                      Rl = !0;
                  }
                }
                null !== o.callback &&
                  0 !== o.lane &&
                  ((e.flags |= 64),
                  null === (f = a.effects) ? (a.effects = [o]) : f.push(o));
              } else
                ((p = {
                  eventTime: p,
                  lane: f,
                  tag: o.tag,
                  payload: o.payload,
                  callback: o.callback,
                  next: null,
                }),
                  null === c ? ((u = c = p), (s = d)) : (c = c.next = p),
                  (i |= f));
              if (null === (o = o.next)) {
                if (null === (o = a.shared.pending)) break;
                ((o = (f = o).next),
                  (f.next = null),
                  (a.lastBaseUpdate = f),
                  (a.shared.pending = null));
              }
            }
            if (
              (null === c && (s = d),
              (a.baseState = s),
              (a.firstBaseUpdate = u),
              (a.lastBaseUpdate = c),
              null !== (n = a.shared.interleaved))
            ) {
              a = n;
              do {
                ((i |= a.lane), (a = a.next));
              } while (a !== n);
            } else null === l && (a.shared.lanes = 0);
            ((Fs |= i), (e.lanes = i), (e.memoizedState = d));
          }
        }
        function Bl(e, n, t) {
          if (((e = n.effects), (n.effects = null), null !== e))
            for (n = 0; n < e.length; n++) {
              var r = e[n],
                a = r.callback;
              if (null !== a) {
                if (((r.callback = null), (r = t), "function" !== typeof a))
                  throw Error(l(191, a));
                a.call(r);
              }
            }
        }
        var Hl = {},
          Wl = ja(Hl),
          Ql = ja(Hl),
          ql = ja(Hl);
        function Kl(e) {
          if (e === Hl) throw Error(l(174));
          return e;
        }
        function Yl(e, n) {
          switch ((Pa(ql, n), Pa(Ql, e), Pa(Wl, Hl), (e = n.nodeType))) {
            case 9:
            case 11:
              n = (n = n.documentElement) ? n.namespaceURI : se(null, "");
              break;
            default:
              n = se(
                (n = (e = 8 === e ? n.parentNode : n).namespaceURI || null),
                (e = e.tagName),
              );
          }
          (Ca(Wl), Pa(Wl, n));
        }
        function Gl() {
          (Ca(Wl), Ca(Ql), Ca(ql));
        }
        function Jl(e) {
          Kl(ql.current);
          var n = Kl(Wl.current),
            t = se(n, e.type);
          n !== t && (Pa(Ql, e), Pa(Wl, t));
        }
        function Xl(e) {
          Ql.current === e && (Ca(Wl), Ca(Ql));
        }
        var Zl = ja(0);
        function ei(e) {
          for (var n = e; null !== n; ) {
            if (13 === n.tag) {
              var t = n.memoizedState;
              if (
                null !== t &&
                (null === (t = t.dehydrated) ||
                  "$?" === t.data ||
                  "$!" === t.data)
              )
                return n;
            } else if (19 === n.tag && void 0 !== n.memoizedProps.revealOrder) {
              if (0 !== (128 & n.flags)) return n;
            } else if (null !== n.child) {
              ((n.child.return = n), (n = n.child));
              continue;
            }
            if (n === e) break;
            for (; null === n.sibling; ) {
              if (null === n.return || n.return === e) return null;
              n = n.return;
            }
            ((n.sibling.return = n.return), (n = n.sibling));
          }
          return null;
        }
        var ni = [];
        function ti() {
          for (var e = 0; e < ni.length; e++)
            ni[e]._workInProgressVersionPrimary = null;
          ni.length = 0;
        }
        var ri = b.ReactCurrentDispatcher,
          ai = b.ReactCurrentBatchConfig,
          li = 0,
          ii = null,
          oi = null,
          si = null,
          ui = !1,
          ci = !1,
          di = 0,
          fi = 0;
        function pi() {
          throw Error(l(321));
        }
        function hi(e, n) {
          if (null === n) return !1;
          for (var t = 0; t < n.length && t < e.length; t++)
            if (!or(e[t], n[t])) return !1;
          return !0;
        }
        function mi(e, n, t, r, a, i) {
          if (
            ((li = i),
            (ii = n),
            (n.memoizedState = null),
            (n.updateQueue = null),
            (n.lanes = 0),
            (ri.current = null === e || null === e.memoizedState ? Xi : Zi),
            (e = t(r, a)),
            ci)
          ) {
            i = 0;
            do {
              if (((ci = !1), (di = 0), 25 <= i)) throw Error(l(301));
              ((i += 1),
                (si = oi = null),
                (n.updateQueue = null),
                (ri.current = eo),
                (e = t(r, a)));
            } while (ci);
          }
          if (
            ((ri.current = Ji),
            (n = null !== oi && null !== oi.next),
            (li = 0),
            (si = oi = ii = null),
            (ui = !1),
            n)
          )
            throw Error(l(300));
          return e;
        }
        function gi() {
          var e = 0 !== di;
          return ((di = 0), e);
        }
        function vi() {
          var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null,
          };
          return (
            null === si ? (ii.memoizedState = si = e) : (si = si.next = e),
            si
          );
        }
        function yi() {
          if (null === oi) {
            var e = ii.alternate;
            e = null !== e ? e.memoizedState : null;
          } else e = oi.next;
          var n = null === si ? ii.memoizedState : si.next;
          if (null !== n) ((si = n), (oi = e));
          else {
            if (null === e) throw Error(l(310));
            ((e = {
              memoizedState: (oi = e).memoizedState,
              baseState: oi.baseState,
              baseQueue: oi.baseQueue,
              queue: oi.queue,
              next: null,
            }),
              null === si ? (ii.memoizedState = si = e) : (si = si.next = e));
          }
          return si;
        }
        function xi(e, n) {
          return "function" === typeof n ? n(e) : n;
        }
        function bi(e) {
          var n = yi(),
            t = n.queue;
          if (null === t) throw Error(l(311));
          t.lastRenderedReducer = e;
          var r = oi,
            a = r.baseQueue,
            i = t.pending;
          if (null !== i) {
            if (null !== a) {
              var o = a.next;
              ((a.next = i.next), (i.next = o));
            }
            ((r.baseQueue = a = i), (t.pending = null));
          }
          if (null !== a) {
            ((i = a.next), (r = r.baseState));
            var s = (o = null),
              u = null,
              c = i;
            do {
              var d = c.lane;
              if ((li & d) === d)
                (null !== u &&
                  (u = u.next =
                    {
                      lane: 0,
                      action: c.action,
                      hasEagerState: c.hasEagerState,
                      eagerState: c.eagerState,
                      next: null,
                    }),
                  (r = c.hasEagerState ? c.eagerState : e(r, c.action)));
              else {
                var f = {
                  lane: d,
                  action: c.action,
                  hasEagerState: c.hasEagerState,
                  eagerState: c.eagerState,
                  next: null,
                };
                (null === u ? ((s = u = f), (o = r)) : (u = u.next = f),
                  (ii.lanes |= d),
                  (Fs |= d));
              }
              c = c.next;
            } while (null !== c && c !== i);
            (null === u ? (o = r) : (u.next = s),
              or(r, n.memoizedState) || (xo = !0),
              (n.memoizedState = r),
              (n.baseState = o),
              (n.baseQueue = u),
              (t.lastRenderedState = r));
          }
          if (null !== (e = t.interleaved)) {
            a = e;
            do {
              ((i = a.lane), (ii.lanes |= i), (Fs |= i), (a = a.next));
            } while (a !== e);
          } else null === a && (t.lanes = 0);
          return [n.memoizedState, t.dispatch];
        }
        function wi(e) {
          var n = yi(),
            t = n.queue;
          if (null === t) throw Error(l(311));
          t.lastRenderedReducer = e;
          var r = t.dispatch,
            a = t.pending,
            i = n.memoizedState;
          if (null !== a) {
            t.pending = null;
            var o = (a = a.next);
            do {
              ((i = e(i, o.action)), (o = o.next));
            } while (o !== a);
            (or(i, n.memoizedState) || (xo = !0),
              (n.memoizedState = i),
              null === n.baseQueue && (n.baseState = i),
              (t.lastRenderedState = i));
          }
          return [i, r];
        }
        function ki() {}
        function Si(e, n) {
          var t = ii,
            r = yi(),
            a = n(),
            i = !or(r.memoizedState, a);
          if (
            (i && ((r.memoizedState = a), (xo = !0)),
            (r = r.queue),
            Ri(Pi.bind(null, t, r, e), [e]),
            r.getSnapshot !== n ||
              i ||
              (null !== si && 1 & si.memoizedState.tag))
          ) {
            if (
              ((t.flags |= 2048),
              zi(9, Ci.bind(null, t, r, a, n), void 0, null),
              null === _s)
            )
              throw Error(l(349));
            0 !== (30 & li) || ji(t, n, a);
          }
          return a;
        }
        function ji(e, n, t) {
          ((e.flags |= 16384),
            (e = { getSnapshot: n, value: t }),
            null === (n = ii.updateQueue)
              ? ((n = { lastEffect: null, stores: null }),
                (ii.updateQueue = n),
                (n.stores = [e]))
              : null === (t = n.stores)
                ? (n.stores = [e])
                : t.push(e));
        }
        function Ci(e, n, t, r) {
          ((n.value = t), (n.getSnapshot = r), Ei(n) && Ni(e));
        }
        function Pi(e, n, t) {
          return t(function () {
            Ei(n) && Ni(e);
          });
        }
        function Ei(e) {
          var n = e.getSnapshot;
          e = e.value;
          try {
            var t = n();
            return !or(e, t);
          } catch (r) {
            return !0;
          }
        }
        function Ni(e) {
          var n = Dl(e, 1);
          null !== n && tu(n, e, 1, -1);
        }
        function _i(e) {
          var n = vi();
          return (
            "function" === typeof e && (e = e()),
            (n.memoizedState = n.baseState = e),
            (e = {
              pending: null,
              interleaved: null,
              lanes: 0,
              dispatch: null,
              lastRenderedReducer: xi,
              lastRenderedState: e,
            }),
            (n.queue = e),
            (e = e.dispatch = qi.bind(null, ii, e)),
            [n.memoizedState, e]
          );
        }
        function zi(e, n, t, r) {
          return (
            (e = { tag: e, create: n, destroy: t, deps: r, next: null }),
            null === (n = ii.updateQueue)
              ? ((n = { lastEffect: null, stores: null }),
                (ii.updateQueue = n),
                (n.lastEffect = e.next = e))
              : null === (t = n.lastEffect)
                ? (n.lastEffect = e.next = e)
                : ((r = t.next),
                  (t.next = e),
                  (e.next = r),
                  (n.lastEffect = e)),
            e
          );
        }
        function Ti() {
          return yi().memoizedState;
        }
        function Li(e, n, t, r) {
          var a = vi();
          ((ii.flags |= e),
            (a.memoizedState = zi(1 | n, t, void 0, void 0 === r ? null : r)));
        }
        function Mi(e, n, t, r) {
          var a = yi();
          r = void 0 === r ? null : r;
          var l = void 0;
          if (null !== oi) {
            var i = oi.memoizedState;
            if (((l = i.destroy), null !== r && hi(r, i.deps)))
              return void (a.memoizedState = zi(n, t, l, r));
          }
          ((ii.flags |= e), (a.memoizedState = zi(1 | n, t, l, r)));
        }
        function Di(e, n) {
          return Li(8390656, 8, e, n);
        }
        function Ri(e, n) {
          return Mi(2048, 8, e, n);
        }
        function Fi(e, n) {
          return Mi(4, 2, e, n);
        }
        function Ii(e, n) {
          return Mi(4, 4, e, n);
        }
        function Oi(e, n) {
          return "function" === typeof n
            ? ((e = e()),
              n(e),
              function () {
                n(null);
              })
            : null !== n && void 0 !== n
              ? ((e = e()),
                (n.current = e),
                function () {
                  n.current = null;
                })
              : void 0;
        }
        function $i(e, n, t) {
          return (
            (t = null !== t && void 0 !== t ? t.concat([e]) : null),
            Mi(4, 4, Oi.bind(null, n, e), t)
          );
        }
        function Ui() {}
        function Ai(e, n) {
          var t = yi();
          n = void 0 === n ? null : n;
          var r = t.memoizedState;
          return null !== r && null !== n && hi(n, r[1])
            ? r[0]
            : ((t.memoizedState = [e, n]), e);
        }
        function Vi(e, n) {
          var t = yi();
          n = void 0 === n ? null : n;
          var r = t.memoizedState;
          return null !== r && null !== n && hi(n, r[1])
            ? r[0]
            : ((e = e()), (t.memoizedState = [e, n]), e);
        }
        function Bi(e, n, t) {
          return 0 === (21 & li)
            ? (e.baseState && ((e.baseState = !1), (xo = !0)),
              (e.memoizedState = t))
            : (or(t, n) ||
                ((t = gn()), (ii.lanes |= t), (Fs |= t), (e.baseState = !0)),
              n);
        }
        function Hi(e, n) {
          var t = bn;
          ((bn = 0 !== t && 4 > t ? t : 4), e(!0));
          var r = ai.transition;
          ai.transition = {};
          try {
            (e(!1), n());
          } finally {
            ((bn = t), (ai.transition = r));
          }
        }
        function Wi() {
          return yi().memoizedState;
        }
        function Qi(e, n, t) {
          var r = nu(e);
          if (
            ((t = {
              lane: r,
              action: t,
              hasEagerState: !1,
              eagerState: null,
              next: null,
            }),
            Ki(e))
          )
            Yi(n, t);
          else if (null !== (t = Ml(e, n, t, r))) {
            (tu(t, e, r, eu()), Gi(t, n, r));
          }
        }
        function qi(e, n, t) {
          var r = nu(e),
            a = {
              lane: r,
              action: t,
              hasEagerState: !1,
              eagerState: null,
              next: null,
            };
          if (Ki(e)) Yi(n, a);
          else {
            var l = e.alternate;
            if (
              0 === e.lanes &&
              (null === l || 0 === l.lanes) &&
              null !== (l = n.lastRenderedReducer)
            )
              try {
                var i = n.lastRenderedState,
                  o = l(i, t);
                if (((a.hasEagerState = !0), (a.eagerState = o), or(o, i))) {
                  var s = n.interleaved;
                  return (
                    null === s
                      ? ((a.next = a), Ll(n))
                      : ((a.next = s.next), (s.next = a)),
                    void (n.interleaved = a)
                  );
                }
              } catch (u) {}
            null !== (t = Ml(e, n, a, r)) &&
              (tu(t, e, r, (a = eu())), Gi(t, n, r));
          }
        }
        function Ki(e) {
          var n = e.alternate;
          return e === ii || (null !== n && n === ii);
        }
        function Yi(e, n) {
          ci = ui = !0;
          var t = e.pending;
          (null === t ? (n.next = n) : ((n.next = t.next), (t.next = n)),
            (e.pending = n));
        }
        function Gi(e, n, t) {
          if (0 !== (4194240 & t)) {
            var r = n.lanes;
            ((t |= r &= e.pendingLanes), (n.lanes = t), xn(e, t));
          }
        }
        var Ji = {
            readContext: zl,
            useCallback: pi,
            useContext: pi,
            useEffect: pi,
            useImperativeHandle: pi,
            useInsertionEffect: pi,
            useLayoutEffect: pi,
            useMemo: pi,
            useReducer: pi,
            useRef: pi,
            useState: pi,
            useDebugValue: pi,
            useDeferredValue: pi,
            useTransition: pi,
            useMutableSource: pi,
            useSyncExternalStore: pi,
            useId: pi,
            unstable_isNewReconciler: !1,
          },
          Xi = {
            readContext: zl,
            useCallback: function (e, n) {
              return ((vi().memoizedState = [e, void 0 === n ? null : n]), e);
            },
            useContext: zl,
            useEffect: Di,
            useImperativeHandle: function (e, n, t) {
              return (
                (t = null !== t && void 0 !== t ? t.concat([e]) : null),
                Li(4194308, 4, Oi.bind(null, n, e), t)
              );
            },
            useLayoutEffect: function (e, n) {
              return Li(4194308, 4, e, n);
            },
            useInsertionEffect: function (e, n) {
              return Li(4, 2, e, n);
            },
            useMemo: function (e, n) {
              var t = vi();
              return (
                (n = void 0 === n ? null : n),
                (e = e()),
                (t.memoizedState = [e, n]),
                e
              );
            },
            useReducer: function (e, n, t) {
              var r = vi();
              return (
                (n = void 0 !== t ? t(n) : n),
                (r.memoizedState = r.baseState = n),
                (e = {
                  pending: null,
                  interleaved: null,
                  lanes: 0,
                  dispatch: null,
                  lastRenderedReducer: e,
                  lastRenderedState: n,
                }),
                (r.queue = e),
                (e = e.dispatch = Qi.bind(null, ii, e)),
                [r.memoizedState, e]
              );
            },
            useRef: function (e) {
              return ((e = { current: e }), (vi().memoizedState = e));
            },
            useState: _i,
            useDebugValue: Ui,
            useDeferredValue: function (e) {
              return (vi().memoizedState = e);
            },
            useTransition: function () {
              var e = _i(!1),
                n = e[0];
              return (
                (e = Hi.bind(null, e[1])),
                (vi().memoizedState = e),
                [n, e]
              );
            },
            useMutableSource: function () {},
            useSyncExternalStore: function (e, n, t) {
              var r = ii,
                a = vi();
              if (al) {
                if (void 0 === t) throw Error(l(407));
                t = t();
              } else {
                if (((t = n()), null === _s)) throw Error(l(349));
                0 !== (30 & li) || ji(r, n, t);
              }
              a.memoizedState = t;
              var i = { value: t, getSnapshot: n };
              return (
                (a.queue = i),
                Di(Pi.bind(null, r, i, e), [e]),
                (r.flags |= 2048),
                zi(9, Ci.bind(null, r, i, t, n), void 0, null),
                t
              );
            },
            useId: function () {
              var e = vi(),
                n = _s.identifierPrefix;
              if (al) {
                var t = Ja;
                ((n =
                  ":" +
                  n +
                  "R" +
                  (t = (Ga & ~(1 << (32 - on(Ga) - 1))).toString(32) + t)),
                  0 < (t = di++) && (n += "H" + t.toString(32)),
                  (n += ":"));
              } else n = ":" + n + "r" + (t = fi++).toString(32) + ":";
              return (e.memoizedState = n);
            },
            unstable_isNewReconciler: !1,
          },
          Zi = {
            readContext: zl,
            useCallback: Ai,
            useContext: zl,
            useEffect: Ri,
            useImperativeHandle: $i,
            useInsertionEffect: Fi,
            useLayoutEffect: Ii,
            useMemo: Vi,
            useReducer: bi,
            useRef: Ti,
            useState: function () {
              return bi(xi);
            },
            useDebugValue: Ui,
            useDeferredValue: function (e) {
              return Bi(yi(), oi.memoizedState, e);
            },
            useTransition: function () {
              return [bi(xi)[0], yi().memoizedState];
            },
            useMutableSource: ki,
            useSyncExternalStore: Si,
            useId: Wi,
            unstable_isNewReconciler: !1,
          },
          eo = {
            readContext: zl,
            useCallback: Ai,
            useContext: zl,
            useEffect: Ri,
            useImperativeHandle: $i,
            useInsertionEffect: Fi,
            useLayoutEffect: Ii,
            useMemo: Vi,
            useReducer: wi,
            useRef: Ti,
            useState: function () {
              return wi(xi);
            },
            useDebugValue: Ui,
            useDeferredValue: function (e) {
              var n = yi();
              return null === oi
                ? (n.memoizedState = e)
                : Bi(n, oi.memoizedState, e);
            },
            useTransition: function () {
              return [wi(xi)[0], yi().memoizedState];
            },
            useMutableSource: ki,
            useSyncExternalStore: Si,
            useId: Wi,
            unstable_isNewReconciler: !1,
          };
        function no(e, n) {
          if (e && e.defaultProps) {
            for (var t in ((n = I({}, n)), (e = e.defaultProps)))
              void 0 === n[t] && (n[t] = e[t]);
            return n;
          }
          return n;
        }
        function to(e, n, t, r) {
          ((t =
            null === (t = t(r, (n = e.memoizedState))) || void 0 === t
              ? n
              : I({}, n, t)),
            (e.memoizedState = t),
            0 === e.lanes && (e.updateQueue.baseState = t));
        }
        var ro = {
          isMounted: function (e) {
            return !!(e = e._reactInternals) && Ve(e) === e;
          },
          enqueueSetState: function (e, n, t) {
            e = e._reactInternals;
            var r = eu(),
              a = nu(e),
              l = Ol(r, a);
            ((l.payload = n),
              void 0 !== t && null !== t && (l.callback = t),
              null !== (n = $l(e, l, a)) && (tu(n, e, a, r), Ul(n, e, a)));
          },
          enqueueReplaceState: function (e, n, t) {
            e = e._reactInternals;
            var r = eu(),
              a = nu(e),
              l = Ol(r, a);
            ((l.tag = 1),
              (l.payload = n),
              void 0 !== t && null !== t && (l.callback = t),
              null !== (n = $l(e, l, a)) && (tu(n, e, a, r), Ul(n, e, a)));
          },
          enqueueForceUpdate: function (e, n) {
            e = e._reactInternals;
            var t = eu(),
              r = nu(e),
              a = Ol(t, r);
            ((a.tag = 2),
              void 0 !== n && null !== n && (a.callback = n),
              null !== (n = $l(e, a, r)) && (tu(n, e, r, t), Ul(n, e, r)));
          },
        };
        function ao(e, n, t, r, a, l, i) {
          return "function" === typeof (e = e.stateNode).shouldComponentUpdate
            ? e.shouldComponentUpdate(r, l, i)
            : !n.prototype ||
                !n.prototype.isPureReactComponent ||
                !sr(t, r) ||
                !sr(a, l);
        }
        function lo(e, n, t) {
          var r = !1,
            a = Ea,
            l = n.contextType;
          return (
            "object" === typeof l && null !== l
              ? (l = zl(l))
              : ((a = La(n) ? za : Na.current),
                (l = (r = null !== (r = n.contextTypes) && void 0 !== r)
                  ? Ta(e, a)
                  : Ea)),
            (n = new n(t, l)),
            (e.memoizedState =
              null !== n.state && void 0 !== n.state ? n.state : null),
            (n.updater = ro),
            (e.stateNode = n),
            (n._reactInternals = e),
            r &&
              (((e = e.stateNode).__reactInternalMemoizedUnmaskedChildContext =
                a),
              (e.__reactInternalMemoizedMaskedChildContext = l)),
            n
          );
        }
        function io(e, n, t, r) {
          ((e = n.state),
            "function" === typeof n.componentWillReceiveProps &&
              n.componentWillReceiveProps(t, r),
            "function" === typeof n.UNSAFE_componentWillReceiveProps &&
              n.UNSAFE_componentWillReceiveProps(t, r),
            n.state !== e && ro.enqueueReplaceState(n, n.state, null));
        }
        function oo(e, n, t, r) {
          var a = e.stateNode;
          ((a.props = t), (a.state = e.memoizedState), (a.refs = {}), Fl(e));
          var l = n.contextType;
          ("object" === typeof l && null !== l
            ? (a.context = zl(l))
            : ((l = La(n) ? za : Na.current), (a.context = Ta(e, l))),
            (a.state = e.memoizedState),
            "function" === typeof (l = n.getDerivedStateFromProps) &&
              (to(e, n, l, t), (a.state = e.memoizedState)),
            "function" === typeof n.getDerivedStateFromProps ||
              "function" === typeof a.getSnapshotBeforeUpdate ||
              ("function" !== typeof a.UNSAFE_componentWillMount &&
                "function" !== typeof a.componentWillMount) ||
              ((n = a.state),
              "function" === typeof a.componentWillMount &&
                a.componentWillMount(),
              "function" === typeof a.UNSAFE_componentWillMount &&
                a.UNSAFE_componentWillMount(),
              n !== a.state && ro.enqueueReplaceState(a, a.state, null),
              Vl(e, t, a, r),
              (a.state = e.memoizedState)),
            "function" === typeof a.componentDidMount && (e.flags |= 4194308));
        }
        function so(e, n) {
          try {
            var t = "",
              r = n;
            do {
              ((t += A(r)), (r = r.return));
            } while (r);
            var a = t;
          } catch (l) {
            a = "\nError generating stack: " + l.message + "\n" + l.stack;
          }
          return { value: e, source: n, stack: a, digest: null };
        }
        function uo(e, n, t) {
          return {
            value: e,
            source: null,
            stack: null != t ? t : null,
            digest: null != n ? n : null,
          };
        }
        function co(e, n) {
          try {
            console.error(n.value);
          } catch (t) {
            setTimeout(function () {
              throw t;
            });
          }
        }
        var fo = "function" === typeof WeakMap ? WeakMap : Map;
        function po(e, n, t) {
          (((t = Ol(-1, t)).tag = 3), (t.payload = { element: null }));
          var r = n.value;
          return (
            (t.callback = function () {
              (Hs || ((Hs = !0), (Ws = r)), co(0, n));
            }),
            t
          );
        }
        function ho(e, n, t) {
          (t = Ol(-1, t)).tag = 3;
          var r = e.type.getDerivedStateFromError;
          if ("function" === typeof r) {
            var a = n.value;
            ((t.payload = function () {
              return r(a);
            }),
              (t.callback = function () {
                co(0, n);
              }));
          }
          var l = e.stateNode;
          return (
            null !== l &&
              "function" === typeof l.componentDidCatch &&
              (t.callback = function () {
                (co(0, n),
                  "function" !== typeof r &&
                    (null === Qs ? (Qs = new Set([this])) : Qs.add(this)));
                var e = n.stack;
                this.componentDidCatch(n.value, {
                  componentStack: null !== e ? e : "",
                });
              }),
            t
          );
        }
        function mo(e, n, t) {
          var r = e.pingCache;
          if (null === r) {
            r = e.pingCache = new fo();
            var a = new Set();
            r.set(n, a);
          } else void 0 === (a = r.get(n)) && ((a = new Set()), r.set(n, a));
          a.has(t) || (a.add(t), (e = Cu.bind(null, e, n, t)), n.then(e, e));
        }
        function go(e) {
          do {
            var n;
            if (
              ((n = 13 === e.tag) &&
                (n = null === (n = e.memoizedState) || null !== n.dehydrated),
              n)
            )
              return e;
            e = e.return;
          } while (null !== e);
          return null;
        }
        function vo(e, n, t, r, a) {
          return 0 === (1 & e.mode)
            ? (e === n
                ? (e.flags |= 65536)
                : ((e.flags |= 128),
                  (t.flags |= 131072),
                  (t.flags &= -52805),
                  1 === t.tag &&
                    (null === t.alternate
                      ? (t.tag = 17)
                      : (((n = Ol(-1, 1)).tag = 2), $l(t, n, 1))),
                  (t.lanes |= 1)),
              e)
            : ((e.flags |= 65536), (e.lanes = a), e);
        }
        var yo = b.ReactCurrentOwner,
          xo = !1;
        function bo(e, n, t, r) {
          n.child = null === e ? wl(n, null, t, r) : bl(n, e.child, t, r);
        }
        function wo(e, n, t, r, a) {
          t = t.render;
          var l = n.ref;
          return (
            _l(n, a),
            (r = mi(e, n, t, r, l, a)),
            (t = gi()),
            null === e || xo
              ? (al && t && el(n), (n.flags |= 1), bo(e, n, r, a), n.child)
              : ((n.updateQueue = e.updateQueue),
                (n.flags &= -2053),
                (e.lanes &= ~a),
                Ho(e, n, a))
          );
        }
        function ko(e, n, t, r, a) {
          if (null === e) {
            var l = t.type;
            return "function" !== typeof l ||
              Lu(l) ||
              void 0 !== l.defaultProps ||
              null !== t.compare ||
              void 0 !== t.defaultProps
              ? (((e = Du(t.type, null, r, n, n.mode, a)).ref = n.ref),
                (e.return = n),
                (n.child = e))
              : ((n.tag = 15), (n.type = l), So(e, n, l, r, a));
          }
          if (((l = e.child), 0 === (e.lanes & a))) {
            var i = l.memoizedProps;
            if (
              (t = null !== (t = t.compare) ? t : sr)(i, r) &&
              e.ref === n.ref
            )
              return Ho(e, n, a);
          }
          return (
            (n.flags |= 1),
            ((e = Mu(l, r)).ref = n.ref),
            (e.return = n),
            (n.child = e)
          );
        }
        function So(e, n, t, r, a) {
          if (null !== e) {
            var l = e.memoizedProps;
            if (sr(l, r) && e.ref === n.ref) {
              if (((xo = !1), (n.pendingProps = r = l), 0 === (e.lanes & a)))
                return ((n.lanes = e.lanes), Ho(e, n, a));
              0 !== (131072 & e.flags) && (xo = !0);
            }
          }
          return Po(e, n, t, r, a);
        }
        function jo(e, n, t) {
          var r = n.pendingProps,
            a = r.children,
            l = null !== e ? e.memoizedState : null;
          if ("hidden" === r.mode)
            if (0 === (1 & n.mode))
              ((n.memoizedState = {
                baseLanes: 0,
                cachePool: null,
                transitions: null,
              }),
                Pa(Ms, Ls),
                (Ls |= t));
            else {
              if (0 === (1073741824 & t))
                return (
                  (e = null !== l ? l.baseLanes | t : t),
                  (n.lanes = n.childLanes = 1073741824),
                  (n.memoizedState = {
                    baseLanes: e,
                    cachePool: null,
                    transitions: null,
                  }),
                  (n.updateQueue = null),
                  Pa(Ms, Ls),
                  (Ls |= e),
                  null
                );
              ((n.memoizedState = {
                baseLanes: 0,
                cachePool: null,
                transitions: null,
              }),
                (r = null !== l ? l.baseLanes : t),
                Pa(Ms, Ls),
                (Ls |= r));
            }
          else
            (null !== l
              ? ((r = l.baseLanes | t), (n.memoizedState = null))
              : (r = t),
              Pa(Ms, Ls),
              (Ls |= r));
          return (bo(e, n, a, t), n.child);
        }
        function Co(e, n) {
          var t = n.ref;
          ((null === e && null !== t) || (null !== e && e.ref !== t)) &&
            ((n.flags |= 512), (n.flags |= 2097152));
        }
        function Po(e, n, t, r, a) {
          var l = La(t) ? za : Na.current;
          return (
            (l = Ta(n, l)),
            _l(n, a),
            (t = mi(e, n, t, r, l, a)),
            (r = gi()),
            null === e || xo
              ? (al && r && el(n), (n.flags |= 1), bo(e, n, t, a), n.child)
              : ((n.updateQueue = e.updateQueue),
                (n.flags &= -2053),
                (e.lanes &= ~a),
                Ho(e, n, a))
          );
        }
        function Eo(e, n, t, r, a) {
          if (La(t)) {
            var l = !0;
            Fa(n);
          } else l = !1;
          if ((_l(n, a), null === n.stateNode))
            (Bo(e, n), lo(n, t, r), oo(n, t, r, a), (r = !0));
          else if (null === e) {
            var i = n.stateNode,
              o = n.memoizedProps;
            i.props = o;
            var s = i.context,
              u = t.contextType;
            "object" === typeof u && null !== u
              ? (u = zl(u))
              : (u = Ta(n, (u = La(t) ? za : Na.current)));
            var c = t.getDerivedStateFromProps,
              d =
                "function" === typeof c ||
                "function" === typeof i.getSnapshotBeforeUpdate;
            (d ||
              ("function" !== typeof i.UNSAFE_componentWillReceiveProps &&
                "function" !== typeof i.componentWillReceiveProps) ||
              ((o !== r || s !== u) && io(n, i, r, u)),
              (Rl = !1));
            var f = n.memoizedState;
            ((i.state = f),
              Vl(n, r, i, a),
              (s = n.memoizedState),
              o !== r || f !== s || _a.current || Rl
                ? ("function" === typeof c &&
                    (to(n, t, c, r), (s = n.memoizedState)),
                  (o = Rl || ao(n, t, o, r, f, s, u))
                    ? (d ||
                        ("function" !== typeof i.UNSAFE_componentWillMount &&
                          "function" !== typeof i.componentWillMount) ||
                        ("function" === typeof i.componentWillMount &&
                          i.componentWillMount(),
                        "function" === typeof i.UNSAFE_componentWillMount &&
                          i.UNSAFE_componentWillMount()),
                      "function" === typeof i.componentDidMount &&
                        (n.flags |= 4194308))
                    : ("function" === typeof i.componentDidMount &&
                        (n.flags |= 4194308),
                      (n.memoizedProps = r),
                      (n.memoizedState = s)),
                  (i.props = r),
                  (i.state = s),
                  (i.context = u),
                  (r = o))
                : ("function" === typeof i.componentDidMount &&
                    (n.flags |= 4194308),
                  (r = !1)));
          } else {
            ((i = n.stateNode),
              Il(e, n),
              (o = n.memoizedProps),
              (u = n.type === n.elementType ? o : no(n.type, o)),
              (i.props = u),
              (d = n.pendingProps),
              (f = i.context),
              "object" === typeof (s = t.contextType) && null !== s
                ? (s = zl(s))
                : (s = Ta(n, (s = La(t) ? za : Na.current))));
            var p = t.getDerivedStateFromProps;
            ((c =
              "function" === typeof p ||
              "function" === typeof i.getSnapshotBeforeUpdate) ||
              ("function" !== typeof i.UNSAFE_componentWillReceiveProps &&
                "function" !== typeof i.componentWillReceiveProps) ||
              ((o !== d || f !== s) && io(n, i, r, s)),
              (Rl = !1),
              (f = n.memoizedState),
              (i.state = f),
              Vl(n, r, i, a));
            var h = n.memoizedState;
            o !== d || f !== h || _a.current || Rl
              ? ("function" === typeof p &&
                  (to(n, t, p, r), (h = n.memoizedState)),
                (u = Rl || ao(n, t, u, r, f, h, s) || !1)
                  ? (c ||
                      ("function" !== typeof i.UNSAFE_componentWillUpdate &&
                        "function" !== typeof i.componentWillUpdate) ||
                      ("function" === typeof i.componentWillUpdate &&
                        i.componentWillUpdate(r, h, s),
                      "function" === typeof i.UNSAFE_componentWillUpdate &&
                        i.UNSAFE_componentWillUpdate(r, h, s)),
                    "function" === typeof i.componentDidUpdate &&
                      (n.flags |= 4),
                    "function" === typeof i.getSnapshotBeforeUpdate &&
                      (n.flags |= 1024))
                  : ("function" !== typeof i.componentDidUpdate ||
                      (o === e.memoizedProps && f === e.memoizedState) ||
                      (n.flags |= 4),
                    "function" !== typeof i.getSnapshotBeforeUpdate ||
                      (o === e.memoizedProps && f === e.memoizedState) ||
                      (n.flags |= 1024),
                    (n.memoizedProps = r),
                    (n.memoizedState = h)),
                (i.props = r),
                (i.state = h),
                (i.context = s),
                (r = u))
              : ("function" !== typeof i.componentDidUpdate ||
                  (o === e.memoizedProps && f === e.memoizedState) ||
                  (n.flags |= 4),
                "function" !== typeof i.getSnapshotBeforeUpdate ||
                  (o === e.memoizedProps && f === e.memoizedState) ||
                  (n.flags |= 1024),
                (r = !1));
          }
          return No(e, n, t, r, l, a);
        }
        function No(e, n, t, r, a, l) {
          Co(e, n);
          var i = 0 !== (128 & n.flags);
          if (!r && !i) return (a && Ia(n, t, !1), Ho(e, n, l));
          ((r = n.stateNode), (yo.current = n));
          var o =
            i && "function" !== typeof t.getDerivedStateFromError
              ? null
              : r.render();
          return (
            (n.flags |= 1),
            null !== e && i
              ? ((n.child = bl(n, e.child, null, l)),
                (n.child = bl(n, null, o, l)))
              : bo(e, n, o, l),
            (n.memoizedState = r.state),
            a && Ia(n, t, !0),
            n.child
          );
        }
        function _o(e) {
          var n = e.stateNode;
          (n.pendingContext
            ? Da(0, n.pendingContext, n.pendingContext !== n.context)
            : n.context && Da(0, n.context, !1),
            Yl(e, n.containerInfo));
        }
        function zo(e, n, t, r, a) {
          return (pl(), hl(a), (n.flags |= 256), bo(e, n, t, r), n.child);
        }
        var To,
          Lo,
          Mo,
          Do,
          Ro = { dehydrated: null, treeContext: null, retryLane: 0 };
        function Fo(e) {
          return { baseLanes: e, cachePool: null, transitions: null };
        }
        function Io(e, n, t) {
          var r,
            a = n.pendingProps,
            i = Zl.current,
            o = !1,
            s = 0 !== (128 & n.flags);
          if (
            ((r = s) ||
              (r = (null === e || null !== e.memoizedState) && 0 !== (2 & i)),
            r
              ? ((o = !0), (n.flags &= -129))
              : (null !== e && null === e.memoizedState) || (i |= 1),
            Pa(Zl, 1 & i),
            null === e)
          )
            return (
              ul(n),
              null !== (e = n.memoizedState) && null !== (e = e.dehydrated)
                ? (0 === (1 & n.mode)
                    ? (n.lanes = 1)
                    : "$!" === e.data
                      ? (n.lanes = 8)
                      : (n.lanes = 1073741824),
                  null)
                : ((s = a.children),
                  (e = a.fallback),
                  o
                    ? ((a = n.mode),
                      (o = n.child),
                      (s = { mode: "hidden", children: s }),
                      0 === (1 & a) && null !== o
                        ? ((o.childLanes = 0), (o.pendingProps = s))
                        : (o = Fu(s, a, 0, null)),
                      (e = Ru(e, a, t, null)),
                      (o.return = n),
                      (e.return = n),
                      (o.sibling = e),
                      (n.child = o),
                      (n.child.memoizedState = Fo(t)),
                      (n.memoizedState = Ro),
                      e)
                    : Oo(n, s))
            );
          if (null !== (i = e.memoizedState) && null !== (r = i.dehydrated))
            return (function (e, n, t, r, a, i, o) {
              if (t)
                return 256 & n.flags
                  ? ((n.flags &= -257), $o(e, n, o, (r = uo(Error(l(422))))))
                  : null !== n.memoizedState
                    ? ((n.child = e.child), (n.flags |= 128), null)
                    : ((i = r.fallback),
                      (a = n.mode),
                      (r = Fu(
                        { mode: "visible", children: r.children },
                        a,
                        0,
                        null,
                      )),
                      ((i = Ru(i, a, o, null)).flags |= 2),
                      (r.return = n),
                      (i.return = n),
                      (r.sibling = i),
                      (n.child = r),
                      0 !== (1 & n.mode) && bl(n, e.child, null, o),
                      (n.child.memoizedState = Fo(o)),
                      (n.memoizedState = Ro),
                      i);
              if (0 === (1 & n.mode)) return $o(e, n, o, null);
              if ("$!" === a.data) {
                if ((r = a.nextSibling && a.nextSibling.dataset))
                  var s = r.dgst;
                return (
                  (r = s),
                  $o(e, n, o, (r = uo((i = Error(l(419))), r, void 0)))
                );
              }
              if (((s = 0 !== (o & e.childLanes)), xo || s)) {
                if (null !== (r = _s)) {
                  switch (o & -o) {
                    case 4:
                      a = 2;
                      break;
                    case 16:
                      a = 8;
                      break;
                    case 64:
                    case 128:
                    case 256:
                    case 512:
                    case 1024:
                    case 2048:
                    case 4096:
                    case 8192:
                    case 16384:
                    case 32768:
                    case 65536:
                    case 131072:
                    case 262144:
                    case 524288:
                    case 1048576:
                    case 2097152:
                    case 4194304:
                    case 8388608:
                    case 16777216:
                    case 33554432:
                    case 67108864:
                      a = 32;
                      break;
                    case 536870912:
                      a = 268435456;
                      break;
                    default:
                      a = 0;
                  }
                  0 !== (a = 0 !== (a & (r.suspendedLanes | o)) ? 0 : a) &&
                    a !== i.retryLane &&
                    ((i.retryLane = a), Dl(e, a), tu(r, e, a, -1));
                }
                return (mu(), $o(e, n, o, (r = uo(Error(l(421))))));
              }
              return "$?" === a.data
                ? ((n.flags |= 128),
                  (n.child = e.child),
                  (n = Eu.bind(null, e)),
                  (a._reactRetry = n),
                  null)
                : ((e = i.treeContext),
                  (rl = ua(a.nextSibling)),
                  (tl = n),
                  (al = !0),
                  (ll = null),
                  null !== e &&
                    ((qa[Ka++] = Ga),
                    (qa[Ka++] = Ja),
                    (qa[Ka++] = Ya),
                    (Ga = e.id),
                    (Ja = e.overflow),
                    (Ya = n)),
                  (n = Oo(n, r.children)),
                  (n.flags |= 4096),
                  n);
            })(e, n, s, a, r, i, t);
          if (o) {
            ((o = a.fallback), (s = n.mode), (r = (i = e.child).sibling));
            var u = { mode: "hidden", children: a.children };
            return (
              0 === (1 & s) && n.child !== i
                ? (((a = n.child).childLanes = 0),
                  (a.pendingProps = u),
                  (n.deletions = null))
                : ((a = Mu(i, u)).subtreeFlags = 14680064 & i.subtreeFlags),
              null !== r
                ? (o = Mu(r, o))
                : ((o = Ru(o, s, t, null)).flags |= 2),
              (o.return = n),
              (a.return = n),
              (a.sibling = o),
              (n.child = a),
              (a = o),
              (o = n.child),
              (s =
                null === (s = e.child.memoizedState)
                  ? Fo(t)
                  : {
                      baseLanes: s.baseLanes | t,
                      cachePool: null,
                      transitions: s.transitions,
                    }),
              (o.memoizedState = s),
              (o.childLanes = e.childLanes & ~t),
              (n.memoizedState = Ro),
              a
            );
          }
          return (
            (e = (o = e.child).sibling),
            (a = Mu(o, { mode: "visible", children: a.children })),
            0 === (1 & n.mode) && (a.lanes = t),
            (a.return = n),
            (a.sibling = null),
            null !== e &&
              (null === (t = n.deletions)
                ? ((n.deletions = [e]), (n.flags |= 16))
                : t.push(e)),
            (n.child = a),
            (n.memoizedState = null),
            a
          );
        }
        function Oo(e, n) {
          return (
            ((n = Fu(
              { mode: "visible", children: n },
              e.mode,
              0,
              null,
            )).return = e),
            (e.child = n)
          );
        }
        function $o(e, n, t, r) {
          return (
            null !== r && hl(r),
            bl(n, e.child, null, t),
            ((e = Oo(n, n.pendingProps.children)).flags |= 2),
            (n.memoizedState = null),
            e
          );
        }
        function Uo(e, n, t) {
          e.lanes |= n;
          var r = e.alternate;
          (null !== r && (r.lanes |= n), Nl(e.return, n, t));
        }
        function Ao(e, n, t, r, a) {
          var l = e.memoizedState;
          null === l
            ? (e.memoizedState = {
                isBackwards: n,
                rendering: null,
                renderingStartTime: 0,
                last: r,
                tail: t,
                tailMode: a,
              })
            : ((l.isBackwards = n),
              (l.rendering = null),
              (l.renderingStartTime = 0),
              (l.last = r),
              (l.tail = t),
              (l.tailMode = a));
        }
        function Vo(e, n, t) {
          var r = n.pendingProps,
            a = r.revealOrder,
            l = r.tail;
          if ((bo(e, n, r.children, t), 0 !== (2 & (r = Zl.current))))
            ((r = (1 & r) | 2), (n.flags |= 128));
          else {
            if (null !== e && 0 !== (128 & e.flags))
              e: for (e = n.child; null !== e; ) {
                if (13 === e.tag) null !== e.memoizedState && Uo(e, t, n);
                else if (19 === e.tag) Uo(e, t, n);
                else if (null !== e.child) {
                  ((e.child.return = e), (e = e.child));
                  continue;
                }
                if (e === n) break e;
                for (; null === e.sibling; ) {
                  if (null === e.return || e.return === n) break e;
                  e = e.return;
                }
                ((e.sibling.return = e.return), (e = e.sibling));
              }
            r &= 1;
          }
          if ((Pa(Zl, r), 0 === (1 & n.mode))) n.memoizedState = null;
          else
            switch (a) {
              case "forwards":
                for (t = n.child, a = null; null !== t; )
                  (null !== (e = t.alternate) && null === ei(e) && (a = t),
                    (t = t.sibling));
                (null === (t = a)
                  ? ((a = n.child), (n.child = null))
                  : ((a = t.sibling), (t.sibling = null)),
                  Ao(n, !1, a, t, l));
                break;
              case "backwards":
                for (t = null, a = n.child, n.child = null; null !== a; ) {
                  if (null !== (e = a.alternate) && null === ei(e)) {
                    n.child = a;
                    break;
                  }
                  ((e = a.sibling), (a.sibling = t), (t = a), (a = e));
                }
                Ao(n, !0, t, null, l);
                break;
              case "together":
                Ao(n, !1, null, null, void 0);
                break;
              default:
                n.memoizedState = null;
            }
          return n.child;
        }
        function Bo(e, n) {
          0 === (1 & n.mode) &&
            null !== e &&
            ((e.alternate = null), (n.alternate = null), (n.flags |= 2));
        }
        function Ho(e, n, t) {
          if (
            (null !== e && (n.dependencies = e.dependencies),
            (Fs |= n.lanes),
            0 === (t & n.childLanes))
          )
            return null;
          if (null !== e && n.child !== e.child) throw Error(l(153));
          if (null !== n.child) {
            for (
              t = Mu((e = n.child), e.pendingProps), n.child = t, t.return = n;
              null !== e.sibling;

            )
              ((e = e.sibling),
                ((t = t.sibling = Mu(e, e.pendingProps)).return = n));
            t.sibling = null;
          }
          return n.child;
        }
        function Wo(e, n) {
          if (!al)
            switch (e.tailMode) {
              case "hidden":
                n = e.tail;
                for (var t = null; null !== n; )
                  (null !== n.alternate && (t = n), (n = n.sibling));
                null === t ? (e.tail = null) : (t.sibling = null);
                break;
              case "collapsed":
                t = e.tail;
                for (var r = null; null !== t; )
                  (null !== t.alternate && (r = t), (t = t.sibling));
                null === r
                  ? n || null === e.tail
                    ? (e.tail = null)
                    : (e.tail.sibling = null)
                  : (r.sibling = null);
            }
        }
        function Qo(e) {
          var n = null !== e.alternate && e.alternate.child === e.child,
            t = 0,
            r = 0;
          if (n)
            for (var a = e.child; null !== a; )
              ((t |= a.lanes | a.childLanes),
                (r |= 14680064 & a.subtreeFlags),
                (r |= 14680064 & a.flags),
                (a.return = e),
                (a = a.sibling));
          else
            for (a = e.child; null !== a; )
              ((t |= a.lanes | a.childLanes),
                (r |= a.subtreeFlags),
                (r |= a.flags),
                (a.return = e),
                (a = a.sibling));
          return ((e.subtreeFlags |= r), (e.childLanes = t), n);
        }
        function qo(e, n, t) {
          var r = n.pendingProps;
          switch ((nl(n), n.tag)) {
            case 2:
            case 16:
            case 15:
            case 0:
            case 11:
            case 7:
            case 8:
            case 12:
            case 9:
            case 14:
              return (Qo(n), null);
            case 1:
            case 17:
              return (La(n.type) && Ma(), Qo(n), null);
            case 3:
              return (
                (r = n.stateNode),
                Gl(),
                Ca(_a),
                Ca(Na),
                ti(),
                r.pendingContext &&
                  ((r.context = r.pendingContext), (r.pendingContext = null)),
                (null !== e && null !== e.child) ||
                  (dl(n)
                    ? (n.flags |= 4)
                    : null === e ||
                      (e.memoizedState.isDehydrated && 0 === (256 & n.flags)) ||
                      ((n.flags |= 1024),
                      null !== ll && (iu(ll), (ll = null)))),
                Lo(e, n),
                Qo(n),
                null
              );
            case 5:
              Xl(n);
              var a = Kl(ql.current);
              if (((t = n.type), null !== e && null != n.stateNode))
                (Mo(e, n, t, r, a),
                  e.ref !== n.ref && ((n.flags |= 512), (n.flags |= 2097152)));
              else {
                if (!r) {
                  if (null === n.stateNode) throw Error(l(166));
                  return (Qo(n), null);
                }
                if (((e = Kl(Wl.current)), dl(n))) {
                  ((r = n.stateNode), (t = n.type));
                  var i = n.memoizedProps;
                  switch (
                    ((r[fa] = n), (r[pa] = i), (e = 0 !== (1 & n.mode)), t)
                  ) {
                    case "dialog":
                      ($r("cancel", r), $r("close", r));
                      break;
                    case "iframe":
                    case "object":
                    case "embed":
                      $r("load", r);
                      break;
                    case "video":
                    case "audio":
                      for (a = 0; a < Rr.length; a++) $r(Rr[a], r);
                      break;
                    case "source":
                      $r("error", r);
                      break;
                    case "img":
                    case "image":
                    case "link":
                      ($r("error", r), $r("load", r));
                      break;
                    case "details":
                      $r("toggle", r);
                      break;
                    case "input":
                      (G(r, i), $r("invalid", r));
                      break;
                    case "select":
                      ((r._wrapperState = { wasMultiple: !!i.multiple }),
                        $r("invalid", r));
                      break;
                    case "textarea":
                      (ae(r, i), $r("invalid", r));
                  }
                  for (var s in (ye(t, i), (a = null), i))
                    if (i.hasOwnProperty(s)) {
                      var u = i[s];
                      "children" === s
                        ? "string" === typeof u
                          ? r.textContent !== u &&
                            (!0 !== i.suppressHydrationWarning &&
                              Xr(r.textContent, u, e),
                            (a = ["children", u]))
                          : "number" === typeof u &&
                            r.textContent !== "" + u &&
                            (!0 !== i.suppressHydrationWarning &&
                              Xr(r.textContent, u, e),
                            (a = ["children", "" + u]))
                        : o.hasOwnProperty(s) &&
                          null != u &&
                          "onScroll" === s &&
                          $r("scroll", r);
                    }
                  switch (t) {
                    case "input":
                      (Q(r), Z(r, i, !0));
                      break;
                    case "textarea":
                      (Q(r), ie(r));
                      break;
                    case "select":
                    case "option":
                      break;
                    default:
                      "function" === typeof i.onClick && (r.onclick = Zr);
                  }
                  ((r = a), (n.updateQueue = r), null !== r && (n.flags |= 4));
                } else {
                  ((s = 9 === a.nodeType ? a : a.ownerDocument),
                    "http://www.w3.org/1999/xhtml" === e && (e = oe(t)),
                    "http://www.w3.org/1999/xhtml" === e
                      ? "script" === t
                        ? (((e = s.createElement("div")).innerHTML =
                            "<script><\/script>"),
                          (e = e.removeChild(e.firstChild)))
                        : "string" === typeof r.is
                          ? (e = s.createElement(t, { is: r.is }))
                          : ((e = s.createElement(t)),
                            "select" === t &&
                              ((s = e),
                              r.multiple
                                ? (s.multiple = !0)
                                : r.size && (s.size = r.size)))
                      : (e = s.createElementNS(e, t)),
                    (e[fa] = n),
                    (e[pa] = r),
                    To(e, n, !1, !1),
                    (n.stateNode = e));
                  e: {
                    switch (((s = xe(t, r)), t)) {
                      case "dialog":
                        ($r("cancel", e), $r("close", e), (a = r));
                        break;
                      case "iframe":
                      case "object":
                      case "embed":
                        ($r("load", e), (a = r));
                        break;
                      case "video":
                      case "audio":
                        for (a = 0; a < Rr.length; a++) $r(Rr[a], e);
                        a = r;
                        break;
                      case "source":
                        ($r("error", e), (a = r));
                        break;
                      case "img":
                      case "image":
                      case "link":
                        ($r("error", e), $r("load", e), (a = r));
                        break;
                      case "details":
                        ($r("toggle", e), (a = r));
                        break;
                      case "input":
                        (G(e, r), (a = Y(e, r)), $r("invalid", e));
                        break;
                      case "option":
                      default:
                        a = r;
                        break;
                      case "select":
                        ((e._wrapperState = { wasMultiple: !!r.multiple }),
                          (a = I({}, r, { value: void 0 })),
                          $r("invalid", e));
                        break;
                      case "textarea":
                        (ae(e, r), (a = re(e, r)), $r("invalid", e));
                    }
                    for (i in (ye(t, a), (u = a)))
                      if (u.hasOwnProperty(i)) {
                        var c = u[i];
                        "style" === i
                          ? ge(e, c)
                          : "dangerouslySetInnerHTML" === i
                            ? null != (c = c ? c.__html : void 0) && de(e, c)
                            : "children" === i
                              ? "string" === typeof c
                                ? ("textarea" !== t || "" !== c) && fe(e, c)
                                : "number" === typeof c && fe(e, "" + c)
                              : "suppressContentEditableWarning" !== i &&
                                "suppressHydrationWarning" !== i &&
                                "autoFocus" !== i &&
                                (o.hasOwnProperty(i)
                                  ? null != c &&
                                    "onScroll" === i &&
                                    $r("scroll", e)
                                  : null != c && x(e, i, c, s));
                      }
                    switch (t) {
                      case "input":
                        (Q(e), Z(e, r, !1));
                        break;
                      case "textarea":
                        (Q(e), ie(e));
                        break;
                      case "option":
                        null != r.value &&
                          e.setAttribute("value", "" + H(r.value));
                        break;
                      case "select":
                        ((e.multiple = !!r.multiple),
                          null != (i = r.value)
                            ? te(e, !!r.multiple, i, !1)
                            : null != r.defaultValue &&
                              te(e, !!r.multiple, r.defaultValue, !0));
                        break;
                      default:
                        "function" === typeof a.onClick && (e.onclick = Zr);
                    }
                    switch (t) {
                      case "button":
                      case "input":
                      case "select":
                      case "textarea":
                        r = !!r.autoFocus;
                        break e;
                      case "img":
                        r = !0;
                        break e;
                      default:
                        r = !1;
                    }
                  }
                  r && (n.flags |= 4);
                }
                null !== n.ref && ((n.flags |= 512), (n.flags |= 2097152));
              }
              return (Qo(n), null);
            case 6:
              if (e && null != n.stateNode) Do(e, n, e.memoizedProps, r);
              else {
                if ("string" !== typeof r && null === n.stateNode)
                  throw Error(l(166));
                if (((t = Kl(ql.current)), Kl(Wl.current), dl(n))) {
                  if (
                    ((r = n.stateNode),
                    (t = n.memoizedProps),
                    (r[fa] = n),
                    (i = r.nodeValue !== t) && null !== (e = tl))
                  )
                    switch (e.tag) {
                      case 3:
                        Xr(r.nodeValue, t, 0 !== (1 & e.mode));
                        break;
                      case 5:
                        !0 !== e.memoizedProps.suppressHydrationWarning &&
                          Xr(r.nodeValue, t, 0 !== (1 & e.mode));
                    }
                  i && (n.flags |= 4);
                } else
                  (((r = (
                    9 === t.nodeType ? t : t.ownerDocument
                  ).createTextNode(r))[fa] = n),
                    (n.stateNode = r));
              }
              return (Qo(n), null);
            case 13:
              if (
                (Ca(Zl),
                (r = n.memoizedState),
                null === e ||
                  (null !== e.memoizedState &&
                    null !== e.memoizedState.dehydrated))
              ) {
                if (
                  al &&
                  null !== rl &&
                  0 !== (1 & n.mode) &&
                  0 === (128 & n.flags)
                )
                  (fl(), pl(), (n.flags |= 98560), (i = !1));
                else if (((i = dl(n)), null !== r && null !== r.dehydrated)) {
                  if (null === e) {
                    if (!i) throw Error(l(318));
                    if (
                      !(i =
                        null !== (i = n.memoizedState) ? i.dehydrated : null)
                    )
                      throw Error(l(317));
                    i[fa] = n;
                  } else
                    (pl(),
                      0 === (128 & n.flags) && (n.memoizedState = null),
                      (n.flags |= 4));
                  (Qo(n), (i = !1));
                } else (null !== ll && (iu(ll), (ll = null)), (i = !0));
                if (!i) return 65536 & n.flags ? n : null;
              }
              return 0 !== (128 & n.flags)
                ? ((n.lanes = t), n)
                : ((r = null !== r) !==
                    (null !== e && null !== e.memoizedState) &&
                    r &&
                    ((n.child.flags |= 8192),
                    0 !== (1 & n.mode) &&
                      (null === e || 0 !== (1 & Zl.current)
                        ? 0 === Ds && (Ds = 3)
                        : mu())),
                  null !== n.updateQueue && (n.flags |= 4),
                  Qo(n),
                  null);
            case 4:
              return (
                Gl(),
                Lo(e, n),
                null === e && Vr(n.stateNode.containerInfo),
                Qo(n),
                null
              );
            case 10:
              return (El(n.type._context), Qo(n), null);
            case 19:
              if ((Ca(Zl), null === (i = n.memoizedState)))
                return (Qo(n), null);
              if (((r = 0 !== (128 & n.flags)), null === (s = i.rendering)))
                if (r) Wo(i, !1);
                else {
                  if (0 !== Ds || (null !== e && 0 !== (128 & e.flags)))
                    for (e = n.child; null !== e; ) {
                      if (null !== (s = ei(e))) {
                        for (
                          n.flags |= 128,
                            Wo(i, !1),
                            null !== (r = s.updateQueue) &&
                              ((n.updateQueue = r), (n.flags |= 4)),
                            n.subtreeFlags = 0,
                            r = t,
                            t = n.child;
                          null !== t;

                        )
                          ((e = r),
                            ((i = t).flags &= 14680066),
                            null === (s = i.alternate)
                              ? ((i.childLanes = 0),
                                (i.lanes = e),
                                (i.child = null),
                                (i.subtreeFlags = 0),
                                (i.memoizedProps = null),
                                (i.memoizedState = null),
                                (i.updateQueue = null),
                                (i.dependencies = null),
                                (i.stateNode = null))
                              : ((i.childLanes = s.childLanes),
                                (i.lanes = s.lanes),
                                (i.child = s.child),
                                (i.subtreeFlags = 0),
                                (i.deletions = null),
                                (i.memoizedProps = s.memoizedProps),
                                (i.memoizedState = s.memoizedState),
                                (i.updateQueue = s.updateQueue),
                                (i.type = s.type),
                                (e = s.dependencies),
                                (i.dependencies =
                                  null === e
                                    ? null
                                    : {
                                        lanes: e.lanes,
                                        firstContext: e.firstContext,
                                      })),
                            (t = t.sibling));
                        return (Pa(Zl, (1 & Zl.current) | 2), n.child);
                      }
                      e = e.sibling;
                    }
                  null !== i.tail &&
                    Je() > Vs &&
                    ((n.flags |= 128),
                    (r = !0),
                    Wo(i, !1),
                    (n.lanes = 4194304));
                }
              else {
                if (!r)
                  if (null !== (e = ei(s))) {
                    if (
                      ((n.flags |= 128),
                      (r = !0),
                      null !== (t = e.updateQueue) &&
                        ((n.updateQueue = t), (n.flags |= 4)),
                      Wo(i, !0),
                      null === i.tail &&
                        "hidden" === i.tailMode &&
                        !s.alternate &&
                        !al)
                    )
                      return (Qo(n), null);
                  } else
                    2 * Je() - i.renderingStartTime > Vs &&
                      1073741824 !== t &&
                      ((n.flags |= 128),
                      (r = !0),
                      Wo(i, !1),
                      (n.lanes = 4194304));
                i.isBackwards
                  ? ((s.sibling = n.child), (n.child = s))
                  : (null !== (t = i.last) ? (t.sibling = s) : (n.child = s),
                    (i.last = s));
              }
              return null !== i.tail
                ? ((n = i.tail),
                  (i.rendering = n),
                  (i.tail = n.sibling),
                  (i.renderingStartTime = Je()),
                  (n.sibling = null),
                  (t = Zl.current),
                  Pa(Zl, r ? (1 & t) | 2 : 1 & t),
                  n)
                : (Qo(n), null);
            case 22:
            case 23:
              return (
                du(),
                (r = null !== n.memoizedState),
                null !== e &&
                  (null !== e.memoizedState) !== r &&
                  (n.flags |= 8192),
                r && 0 !== (1 & n.mode)
                  ? 0 !== (1073741824 & Ls) &&
                    (Qo(n), 6 & n.subtreeFlags && (n.flags |= 8192))
                  : Qo(n),
                null
              );
            case 24:
            case 25:
              return null;
          }
          throw Error(l(156, n.tag));
        }
        function Ko(e, n) {
          switch ((nl(n), n.tag)) {
            case 1:
              return (
                La(n.type) && Ma(),
                65536 & (e = n.flags)
                  ? ((n.flags = (-65537 & e) | 128), n)
                  : null
              );
            case 3:
              return (
                Gl(),
                Ca(_a),
                Ca(Na),
                ti(),
                0 !== (65536 & (e = n.flags)) && 0 === (128 & e)
                  ? ((n.flags = (-65537 & e) | 128), n)
                  : null
              );
            case 5:
              return (Xl(n), null);
            case 13:
              if (
                (Ca(Zl),
                null !== (e = n.memoizedState) && null !== e.dehydrated)
              ) {
                if (null === n.alternate) throw Error(l(340));
                pl();
              }
              return 65536 & (e = n.flags)
                ? ((n.flags = (-65537 & e) | 128), n)
                : null;
            case 19:
              return (Ca(Zl), null);
            case 4:
              return (Gl(), null);
            case 10:
              return (El(n.type._context), null);
            case 22:
            case 23:
              return (du(), null);
            default:
              return null;
          }
        }
        ((To = function (e, n) {
          for (var t = n.child; null !== t; ) {
            if (5 === t.tag || 6 === t.tag) e.appendChild(t.stateNode);
            else if (4 !== t.tag && null !== t.child) {
              ((t.child.return = t), (t = t.child));
              continue;
            }
            if (t === n) break;
            for (; null === t.sibling; ) {
              if (null === t.return || t.return === n) return;
              t = t.return;
            }
            ((t.sibling.return = t.return), (t = t.sibling));
          }
        }),
          (Lo = function () {}),
          (Mo = function (e, n, t, r) {
            var a = e.memoizedProps;
            if (a !== r) {
              ((e = n.stateNode), Kl(Wl.current));
              var l,
                i = null;
              switch (t) {
                case "input":
                  ((a = Y(e, a)), (r = Y(e, r)), (i = []));
                  break;
                case "select":
                  ((a = I({}, a, { value: void 0 })),
                    (r = I({}, r, { value: void 0 })),
                    (i = []));
                  break;
                case "textarea":
                  ((a = re(e, a)), (r = re(e, r)), (i = []));
                  break;
                default:
                  "function" !== typeof a.onClick &&
                    "function" === typeof r.onClick &&
                    (e.onclick = Zr);
              }
              for (c in (ye(t, r), (t = null), a))
                if (!r.hasOwnProperty(c) && a.hasOwnProperty(c) && null != a[c])
                  if ("style" === c) {
                    var s = a[c];
                    for (l in s)
                      s.hasOwnProperty(l) && (t || (t = {}), (t[l] = ""));
                  } else
                    "dangerouslySetInnerHTML" !== c &&
                      "children" !== c &&
                      "suppressContentEditableWarning" !== c &&
                      "suppressHydrationWarning" !== c &&
                      "autoFocus" !== c &&
                      (o.hasOwnProperty(c)
                        ? i || (i = [])
                        : (i = i || []).push(c, null));
              for (c in r) {
                var u = r[c];
                if (
                  ((s = null != a ? a[c] : void 0),
                  r.hasOwnProperty(c) && u !== s && (null != u || null != s))
                )
                  if ("style" === c)
                    if (s) {
                      for (l in s)
                        !s.hasOwnProperty(l) ||
                          (u && u.hasOwnProperty(l)) ||
                          (t || (t = {}), (t[l] = ""));
                      for (l in u)
                        u.hasOwnProperty(l) &&
                          s[l] !== u[l] &&
                          (t || (t = {}), (t[l] = u[l]));
                    } else (t || (i || (i = []), i.push(c, t)), (t = u));
                  else
                    "dangerouslySetInnerHTML" === c
                      ? ((u = u ? u.__html : void 0),
                        (s = s ? s.__html : void 0),
                        null != u && s !== u && (i = i || []).push(c, u))
                      : "children" === c
                        ? ("string" !== typeof u && "number" !== typeof u) ||
                          (i = i || []).push(c, "" + u)
                        : "suppressContentEditableWarning" !== c &&
                          "suppressHydrationWarning" !== c &&
                          (o.hasOwnProperty(c)
                            ? (null != u && "onScroll" === c && $r("scroll", e),
                              i || s === u || (i = []))
                            : (i = i || []).push(c, u));
              }
              t && (i = i || []).push("style", t);
              var c = i;
              (n.updateQueue = c) && (n.flags |= 4);
            }
          }),
          (Do = function (e, n, t, r) {
            t !== r && (n.flags |= 4);
          }));
        var Yo = !1,
          Go = !1,
          Jo = "function" === typeof WeakSet ? WeakSet : Set,
          Xo = null;
        function Zo(e, n) {
          var t = e.ref;
          if (null !== t)
            if ("function" === typeof t)
              try {
                t(null);
              } catch (r) {
                ju(e, n, r);
              }
            else t.current = null;
        }
        function es(e, n, t) {
          try {
            t();
          } catch (r) {
            ju(e, n, r);
          }
        }
        var ns = !1;
        function ts(e, n, t) {
          var r = n.updateQueue;
          if (null !== (r = null !== r ? r.lastEffect : null)) {
            var a = (r = r.next);
            do {
              if ((a.tag & e) === e) {
                var l = a.destroy;
                ((a.destroy = void 0), void 0 !== l && es(n, t, l));
              }
              a = a.next;
            } while (a !== r);
          }
        }
        function rs(e, n) {
          if (
            null !== (n = null !== (n = n.updateQueue) ? n.lastEffect : null)
          ) {
            var t = (n = n.next);
            do {
              if ((t.tag & e) === e) {
                var r = t.create;
                t.destroy = r();
              }
              t = t.next;
            } while (t !== n);
          }
        }
        function as(e) {
          var n = e.ref;
          if (null !== n) {
            var t = e.stateNode;
            (e.tag, (e = t), "function" === typeof n ? n(e) : (n.current = e));
          }
        }
        function ls(e) {
          var n = e.alternate;
          (null !== n && ((e.alternate = null), ls(n)),
            (e.child = null),
            (e.deletions = null),
            (e.sibling = null),
            5 === e.tag &&
              null !== (n = e.stateNode) &&
              (delete n[fa],
              delete n[pa],
              delete n[ma],
              delete n[ga],
              delete n[va]),
            (e.stateNode = null),
            (e.return = null),
            (e.dependencies = null),
            (e.memoizedProps = null),
            (e.memoizedState = null),
            (e.pendingProps = null),
            (e.stateNode = null),
            (e.updateQueue = null));
        }
        function is(e) {
          return 5 === e.tag || 3 === e.tag || 4 === e.tag;
        }
        function os(e) {
          e: for (;;) {
            for (; null === e.sibling; ) {
              if (null === e.return || is(e.return)) return null;
              e = e.return;
            }
            for (
              e.sibling.return = e.return, e = e.sibling;
              5 !== e.tag && 6 !== e.tag && 18 !== e.tag;

            ) {
              if (2 & e.flags) continue e;
              if (null === e.child || 4 === e.tag) continue e;
              ((e.child.return = e), (e = e.child));
            }
            if (!(2 & e.flags)) return e.stateNode;
          }
        }
        function ss(e, n, t) {
          var r = e.tag;
          if (5 === r || 6 === r)
            ((e = e.stateNode),
              n
                ? 8 === t.nodeType
                  ? t.parentNode.insertBefore(e, n)
                  : t.insertBefore(e, n)
                : (8 === t.nodeType
                    ? (n = t.parentNode).insertBefore(e, t)
                    : (n = t).appendChild(e),
                  (null !== (t = t._reactRootContainer) && void 0 !== t) ||
                    null !== n.onclick ||
                    (n.onclick = Zr)));
          else if (4 !== r && null !== (e = e.child))
            for (ss(e, n, t), e = e.sibling; null !== e; )
              (ss(e, n, t), (e = e.sibling));
        }
        function us(e, n, t) {
          var r = e.tag;
          if (5 === r || 6 === r)
            ((e = e.stateNode), n ? t.insertBefore(e, n) : t.appendChild(e));
          else if (4 !== r && null !== (e = e.child))
            for (us(e, n, t), e = e.sibling; null !== e; )
              (us(e, n, t), (e = e.sibling));
        }
        var cs = null,
          ds = !1;
        function fs(e, n, t) {
          for (t = t.child; null !== t; ) (ps(e, n, t), (t = t.sibling));
        }
        function ps(e, n, t) {
          if (ln && "function" === typeof ln.onCommitFiberUnmount)
            try {
              ln.onCommitFiberUnmount(an, t);
            } catch (o) {}
          switch (t.tag) {
            case 5:
              Go || Zo(t, n);
            case 6:
              var r = cs,
                a = ds;
              ((cs = null),
                fs(e, n, t),
                (ds = a),
                null !== (cs = r) &&
                  (ds
                    ? ((e = cs),
                      (t = t.stateNode),
                      8 === e.nodeType
                        ? e.parentNode.removeChild(t)
                        : e.removeChild(t))
                    : cs.removeChild(t.stateNode)));
              break;
            case 18:
              null !== cs &&
                (ds
                  ? ((e = cs),
                    (t = t.stateNode),
                    8 === e.nodeType
                      ? sa(e.parentNode, t)
                      : 1 === e.nodeType && sa(e, t),
                    Bn(e))
                  : sa(cs, t.stateNode));
              break;
            case 4:
              ((r = cs),
                (a = ds),
                (cs = t.stateNode.containerInfo),
                (ds = !0),
                fs(e, n, t),
                (cs = r),
                (ds = a));
              break;
            case 0:
            case 11:
            case 14:
            case 15:
              if (
                !Go &&
                null !== (r = t.updateQueue) &&
                null !== (r = r.lastEffect)
              ) {
                a = r = r.next;
                do {
                  var l = a,
                    i = l.destroy;
                  ((l = l.tag),
                    void 0 !== i &&
                      (0 !== (2 & l) || 0 !== (4 & l)) &&
                      es(t, n, i),
                    (a = a.next));
                } while (a !== r);
              }
              fs(e, n, t);
              break;
            case 1:
              if (
                !Go &&
                (Zo(t, n),
                "function" === typeof (r = t.stateNode).componentWillUnmount)
              )
                try {
                  ((r.props = t.memoizedProps),
                    (r.state = t.memoizedState),
                    r.componentWillUnmount());
                } catch (o) {
                  ju(t, n, o);
                }
              fs(e, n, t);
              break;
            case 21:
              fs(e, n, t);
              break;
            case 22:
              1 & t.mode
                ? ((Go = (r = Go) || null !== t.memoizedState),
                  fs(e, n, t),
                  (Go = r))
                : fs(e, n, t);
              break;
            default:
              fs(e, n, t);
          }
        }
        function hs(e) {
          var n = e.updateQueue;
          if (null !== n) {
            e.updateQueue = null;
            var t = e.stateNode;
            (null === t && (t = e.stateNode = new Jo()),
              n.forEach(function (n) {
                var r = Nu.bind(null, e, n);
                t.has(n) || (t.add(n), n.then(r, r));
              }));
          }
        }
        function ms(e, n) {
          var t = n.deletions;
          if (null !== t)
            for (var r = 0; r < t.length; r++) {
              var a = t[r];
              try {
                var i = e,
                  o = n,
                  s = o;
                e: for (; null !== s; ) {
                  switch (s.tag) {
                    case 5:
                      ((cs = s.stateNode), (ds = !1));
                      break e;
                    case 3:
                    case 4:
                      ((cs = s.stateNode.containerInfo), (ds = !0));
                      break e;
                  }
                  s = s.return;
                }
                if (null === cs) throw Error(l(160));
                (ps(i, o, a), (cs = null), (ds = !1));
                var u = a.alternate;
                (null !== u && (u.return = null), (a.return = null));
              } catch (c) {
                ju(a, n, c);
              }
            }
          if (12854 & n.subtreeFlags)
            for (n = n.child; null !== n; ) (gs(n, e), (n = n.sibling));
        }
        function gs(e, n) {
          var t = e.alternate,
            r = e.flags;
          switch (e.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
              if ((ms(n, e), vs(e), 4 & r)) {
                try {
                  (ts(3, e, e.return), rs(3, e));
                } catch (g) {
                  ju(e, e.return, g);
                }
                try {
                  ts(5, e, e.return);
                } catch (g) {
                  ju(e, e.return, g);
                }
              }
              break;
            case 1:
              (ms(n, e), vs(e), 512 & r && null !== t && Zo(t, t.return));
              break;
            case 5:
              if (
                (ms(n, e),
                vs(e),
                512 & r && null !== t && Zo(t, t.return),
                32 & e.flags)
              ) {
                var a = e.stateNode;
                try {
                  fe(a, "");
                } catch (g) {
                  ju(e, e.return, g);
                }
              }
              if (4 & r && null != (a = e.stateNode)) {
                var i = e.memoizedProps,
                  o = null !== t ? t.memoizedProps : i,
                  s = e.type,
                  u = e.updateQueue;
                if (((e.updateQueue = null), null !== u))
                  try {
                    ("input" === s &&
                      "radio" === i.type &&
                      null != i.name &&
                      J(a, i),
                      xe(s, o));
                    var c = xe(s, i);
                    for (o = 0; o < u.length; o += 2) {
                      var d = u[o],
                        f = u[o + 1];
                      "style" === d
                        ? ge(a, f)
                        : "dangerouslySetInnerHTML" === d
                          ? de(a, f)
                          : "children" === d
                            ? fe(a, f)
                            : x(a, d, f, c);
                    }
                    switch (s) {
                      case "input":
                        X(a, i);
                        break;
                      case "textarea":
                        le(a, i);
                        break;
                      case "select":
                        var p = a._wrapperState.wasMultiple;
                        a._wrapperState.wasMultiple = !!i.multiple;
                        var h = i.value;
                        null != h
                          ? te(a, !!i.multiple, h, !1)
                          : p !== !!i.multiple &&
                            (null != i.defaultValue
                              ? te(a, !!i.multiple, i.defaultValue, !0)
                              : te(a, !!i.multiple, i.multiple ? [] : "", !1));
                    }
                    a[pa] = i;
                  } catch (g) {
                    ju(e, e.return, g);
                  }
              }
              break;
            case 6:
              if ((ms(n, e), vs(e), 4 & r)) {
                if (null === e.stateNode) throw Error(l(162));
                ((a = e.stateNode), (i = e.memoizedProps));
                try {
                  a.nodeValue = i;
                } catch (g) {
                  ju(e, e.return, g);
                }
              }
              break;
            case 3:
              if (
                (ms(n, e),
                vs(e),
                4 & r && null !== t && t.memoizedState.isDehydrated)
              )
                try {
                  Bn(n.containerInfo);
                } catch (g) {
                  ju(e, e.return, g);
                }
              break;
            case 4:
            default:
              (ms(n, e), vs(e));
              break;
            case 13:
              (ms(n, e),
                vs(e),
                8192 & (a = e.child).flags &&
                  ((i = null !== a.memoizedState),
                  (a.stateNode.isHidden = i),
                  !i ||
                    (null !== a.alternate &&
                      null !== a.alternate.memoizedState) ||
                    (As = Je())),
                4 & r && hs(e));
              break;
            case 22:
              if (
                ((d = null !== t && null !== t.memoizedState),
                1 & e.mode
                  ? ((Go = (c = Go) || d), ms(n, e), (Go = c))
                  : ms(n, e),
                vs(e),
                8192 & r)
              ) {
                if (
                  ((c = null !== e.memoizedState),
                  (e.stateNode.isHidden = c) && !d && 0 !== (1 & e.mode))
                )
                  for (Xo = e, d = e.child; null !== d; ) {
                    for (f = Xo = d; null !== Xo; ) {
                      switch (((h = (p = Xo).child), p.tag)) {
                        case 0:
                        case 11:
                        case 14:
                        case 15:
                          ts(4, p, p.return);
                          break;
                        case 1:
                          Zo(p, p.return);
                          var m = p.stateNode;
                          if ("function" === typeof m.componentWillUnmount) {
                            ((r = p), (t = p.return));
                            try {
                              ((n = r),
                                (m.props = n.memoizedProps),
                                (m.state = n.memoizedState),
                                m.componentWillUnmount());
                            } catch (g) {
                              ju(r, t, g);
                            }
                          }
                          break;
                        case 5:
                          Zo(p, p.return);
                          break;
                        case 22:
                          if (null !== p.memoizedState) {
                            ws(f);
                            continue;
                          }
                      }
                      null !== h ? ((h.return = p), (Xo = h)) : ws(f);
                    }
                    d = d.sibling;
                  }
                e: for (d = null, f = e; ; ) {
                  if (5 === f.tag) {
                    if (null === d) {
                      d = f;
                      try {
                        ((a = f.stateNode),
                          c
                            ? "function" === typeof (i = a.style).setProperty
                              ? i.setProperty("display", "none", "important")
                              : (i.display = "none")
                            : ((s = f.stateNode),
                              (o =
                                void 0 !== (u = f.memoizedProps.style) &&
                                null !== u &&
                                u.hasOwnProperty("display")
                                  ? u.display
                                  : null),
                              (s.style.display = me("display", o))));
                      } catch (g) {
                        ju(e, e.return, g);
                      }
                    }
                  } else if (6 === f.tag) {
                    if (null === d)
                      try {
                        f.stateNode.nodeValue = c ? "" : f.memoizedProps;
                      } catch (g) {
                        ju(e, e.return, g);
                      }
                  } else if (
                    ((22 !== f.tag && 23 !== f.tag) ||
                      null === f.memoizedState ||
                      f === e) &&
                    null !== f.child
                  ) {
                    ((f.child.return = f), (f = f.child));
                    continue;
                  }
                  if (f === e) break e;
                  for (; null === f.sibling; ) {
                    if (null === f.return || f.return === e) break e;
                    (d === f && (d = null), (f = f.return));
                  }
                  (d === f && (d = null),
                    (f.sibling.return = f.return),
                    (f = f.sibling));
                }
              }
              break;
            case 19:
              (ms(n, e), vs(e), 4 & r && hs(e));
            case 21:
          }
        }
        function vs(e) {
          var n = e.flags;
          if (2 & n) {
            try {
              e: {
                for (var t = e.return; null !== t; ) {
                  if (is(t)) {
                    var r = t;
                    break e;
                  }
                  t = t.return;
                }
                throw Error(l(160));
              }
              switch (r.tag) {
                case 5:
                  var a = r.stateNode;
                  (32 & r.flags && (fe(a, ""), (r.flags &= -33)),
                    us(e, os(e), a));
                  break;
                case 3:
                case 4:
                  var i = r.stateNode.containerInfo;
                  ss(e, os(e), i);
                  break;
                default:
                  throw Error(l(161));
              }
            } catch (o) {
              ju(e, e.return, o);
            }
            e.flags &= -3;
          }
          4096 & n && (e.flags &= -4097);
        }
        function ys(e, n, t) {
          ((Xo = e), xs(e, n, t));
        }
        function xs(e, n, t) {
          for (var r = 0 !== (1 & e.mode); null !== Xo; ) {
            var a = Xo,
              l = a.child;
            if (22 === a.tag && r) {
              var i = null !== a.memoizedState || Yo;
              if (!i) {
                var o = a.alternate,
                  s = (null !== o && null !== o.memoizedState) || Go;
                o = Yo;
                var u = Go;
                if (((Yo = i), (Go = s) && !u))
                  for (Xo = a; null !== Xo; )
                    ((s = (i = Xo).child),
                      22 === i.tag && null !== i.memoizedState
                        ? ks(a)
                        : null !== s
                          ? ((s.return = i), (Xo = s))
                          : ks(a));
                for (; null !== l; ) ((Xo = l), xs(l, n, t), (l = l.sibling));
                ((Xo = a), (Yo = o), (Go = u));
              }
              bs(e);
            } else
              0 !== (8772 & a.subtreeFlags) && null !== l
                ? ((l.return = a), (Xo = l))
                : bs(e);
          }
        }
        function bs(e) {
          for (; null !== Xo; ) {
            var n = Xo;
            if (0 !== (8772 & n.flags)) {
              var t = n.alternate;
              try {
                if (0 !== (8772 & n.flags))
                  switch (n.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Go || rs(5, n);
                      break;
                    case 1:
                      var r = n.stateNode;
                      if (4 & n.flags && !Go)
                        if (null === t) r.componentDidMount();
                        else {
                          var a =
                            n.elementType === n.type
                              ? t.memoizedProps
                              : no(n.type, t.memoizedProps);
                          r.componentDidUpdate(
                            a,
                            t.memoizedState,
                            r.__reactInternalSnapshotBeforeUpdate,
                          );
                        }
                      var i = n.updateQueue;
                      null !== i && Bl(n, i, r);
                      break;
                    case 3:
                      var o = n.updateQueue;
                      if (null !== o) {
                        if (((t = null), null !== n.child))
                          switch (n.child.tag) {
                            case 5:
                            case 1:
                              t = n.child.stateNode;
                          }
                        Bl(n, o, t);
                      }
                      break;
                    case 5:
                      var s = n.stateNode;
                      if (null === t && 4 & n.flags) {
                        t = s;
                        var u = n.memoizedProps;
                        switch (n.type) {
                          case "button":
                          case "input":
                          case "select":
                          case "textarea":
                            u.autoFocus && t.focus();
                            break;
                          case "img":
                            u.src && (t.src = u.src);
                        }
                      }
                      break;
                    case 6:
                    case 4:
                    case 12:
                    case 19:
                    case 17:
                    case 21:
                    case 22:
                    case 23:
                    case 25:
                      break;
                    case 13:
                      if (null === n.memoizedState) {
                        var c = n.alternate;
                        if (null !== c) {
                          var d = c.memoizedState;
                          if (null !== d) {
                            var f = d.dehydrated;
                            null !== f && Bn(f);
                          }
                        }
                      }
                      break;
                    default:
                      throw Error(l(163));
                  }
                Go || (512 & n.flags && as(n));
              } catch (p) {
                ju(n, n.return, p);
              }
            }
            if (n === e) {
              Xo = null;
              break;
            }
            if (null !== (t = n.sibling)) {
              ((t.return = n.return), (Xo = t));
              break;
            }
            Xo = n.return;
          }
        }
        function ws(e) {
          for (; null !== Xo; ) {
            var n = Xo;
            if (n === e) {
              Xo = null;
              break;
            }
            var t = n.sibling;
            if (null !== t) {
              ((t.return = n.return), (Xo = t));
              break;
            }
            Xo = n.return;
          }
        }
        function ks(e) {
          for (; null !== Xo; ) {
            var n = Xo;
            try {
              switch (n.tag) {
                case 0:
                case 11:
                case 15:
                  var t = n.return;
                  try {
                    rs(4, n);
                  } catch (s) {
                    ju(n, t, s);
                  }
                  break;
                case 1:
                  var r = n.stateNode;
                  if ("function" === typeof r.componentDidMount) {
                    var a = n.return;
                    try {
                      r.componentDidMount();
                    } catch (s) {
                      ju(n, a, s);
                    }
                  }
                  var l = n.return;
                  try {
                    as(n);
                  } catch (s) {
                    ju(n, l, s);
                  }
                  break;
                case 5:
                  var i = n.return;
                  try {
                    as(n);
                  } catch (s) {
                    ju(n, i, s);
                  }
              }
            } catch (s) {
              ju(n, n.return, s);
            }
            if (n === e) {
              Xo = null;
              break;
            }
            var o = n.sibling;
            if (null !== o) {
              ((o.return = n.return), (Xo = o));
              break;
            }
            Xo = n.return;
          }
        }
        var Ss,
          js = Math.ceil,
          Cs = b.ReactCurrentDispatcher,
          Ps = b.ReactCurrentOwner,
          Es = b.ReactCurrentBatchConfig,
          Ns = 0,
          _s = null,
          zs = null,
          Ts = 0,
          Ls = 0,
          Ms = ja(0),
          Ds = 0,
          Rs = null,
          Fs = 0,
          Is = 0,
          Os = 0,
          $s = null,
          Us = null,
          As = 0,
          Vs = 1 / 0,
          Bs = null,
          Hs = !1,
          Ws = null,
          Qs = null,
          qs = !1,
          Ks = null,
          Ys = 0,
          Gs = 0,
          Js = null,
          Xs = -1,
          Zs = 0;
        function eu() {
          return 0 !== (6 & Ns) ? Je() : -1 !== Xs ? Xs : (Xs = Je());
        }
        function nu(e) {
          return 0 === (1 & e.mode)
            ? 1
            : 0 !== (2 & Ns) && 0 !== Ts
              ? Ts & -Ts
              : null !== ml.transition
                ? (0 === Zs && (Zs = gn()), Zs)
                : 0 !== (e = bn)
                  ? e
                  : (e = void 0 === (e = window.event) ? 16 : Jn(e.type));
        }
        function tu(e, n, t, r) {
          if (50 < Gs) throw ((Gs = 0), (Js = null), Error(l(185)));
          (yn(e, t, r),
            (0 !== (2 & Ns) && e === _s) ||
              (e === _s && (0 === (2 & Ns) && (Is |= t), 4 === Ds && ou(e, Ts)),
              ru(e, r),
              1 === t &&
                0 === Ns &&
                0 === (1 & n.mode) &&
                ((Vs = Je() + 500), $a && Va())));
        }
        function ru(e, n) {
          var t = e.callbackNode;
          !(function (e, n) {
            for (
              var t = e.suspendedLanes,
                r = e.pingedLanes,
                a = e.expirationTimes,
                l = e.pendingLanes;
              0 < l;

            ) {
              var i = 31 - on(l),
                o = 1 << i,
                s = a[i];
              (-1 === s
                ? (0 !== (o & t) && 0 === (o & r)) || (a[i] = hn(o, n))
                : s <= n && (e.expiredLanes |= o),
                (l &= ~o));
            }
          })(e, n);
          var r = pn(e, e === _s ? Ts : 0);
          if (0 === r)
            (null !== t && Ke(t),
              (e.callbackNode = null),
              (e.callbackPriority = 0));
          else if (((n = r & -r), e.callbackPriority !== n)) {
            if ((null != t && Ke(t), 1 === n))
              (0 === e.tag
                ? (function (e) {
                    (($a = !0), Aa(e));
                  })(su.bind(null, e))
                : Aa(su.bind(null, e)),
                ia(function () {
                  0 === (6 & Ns) && Va();
                }),
                (t = null));
            else {
              switch (wn(r)) {
                case 1:
                  t = Ze;
                  break;
                case 4:
                  t = en;
                  break;
                case 16:
                default:
                  t = nn;
                  break;
                case 536870912:
                  t = rn;
              }
              t = _u(t, au.bind(null, e));
            }
            ((e.callbackPriority = n), (e.callbackNode = t));
          }
        }
        function au(e, n) {
          if (((Xs = -1), (Zs = 0), 0 !== (6 & Ns))) throw Error(l(327));
          var t = e.callbackNode;
          if (ku() && e.callbackNode !== t) return null;
          var r = pn(e, e === _s ? Ts : 0);
          if (0 === r) return null;
          if (0 !== (30 & r) || 0 !== (r & e.expiredLanes) || n) n = gu(e, r);
          else {
            n = r;
            var a = Ns;
            Ns |= 2;
            var i = hu();
            for (
              (_s === e && Ts === n) ||
              ((Bs = null), (Vs = Je() + 500), fu(e, n));
              ;

            )
              try {
                yu();
                break;
              } catch (s) {
                pu(e, s);
              }
            (Pl(),
              (Cs.current = i),
              (Ns = a),
              null !== zs ? (n = 0) : ((_s = null), (Ts = 0), (n = Ds)));
          }
          if (0 !== n) {
            if (
              (2 === n && 0 !== (a = mn(e)) && ((r = a), (n = lu(e, a))),
              1 === n)
            )
              throw ((t = Rs), fu(e, 0), ou(e, r), ru(e, Je()), t);
            if (6 === n) ou(e, r);
            else {
              if (
                ((a = e.current.alternate),
                0 === (30 & r) &&
                  !(function (e) {
                    for (var n = e; ; ) {
                      if (16384 & n.flags) {
                        var t = n.updateQueue;
                        if (null !== t && null !== (t = t.stores))
                          for (var r = 0; r < t.length; r++) {
                            var a = t[r],
                              l = a.getSnapshot;
                            a = a.value;
                            try {
                              if (!or(l(), a)) return !1;
                            } catch (o) {
                              return !1;
                            }
                          }
                      }
                      if (((t = n.child), 16384 & n.subtreeFlags && null !== t))
                        ((t.return = n), (n = t));
                      else {
                        if (n === e) break;
                        for (; null === n.sibling; ) {
                          if (null === n.return || n.return === e) return !0;
                          n = n.return;
                        }
                        ((n.sibling.return = n.return), (n = n.sibling));
                      }
                    }
                    return !0;
                  })(a) &&
                  (2 === (n = gu(e, r)) &&
                    0 !== (i = mn(e)) &&
                    ((r = i), (n = lu(e, i))),
                  1 === n))
              )
                throw ((t = Rs), fu(e, 0), ou(e, r), ru(e, Je()), t);
              switch (((e.finishedWork = a), (e.finishedLanes = r), n)) {
                case 0:
                case 1:
                  throw Error(l(345));
                case 2:
                case 5:
                  wu(e, Us, Bs);
                  break;
                case 3:
                  if (
                    (ou(e, r),
                    (130023424 & r) === r && 10 < (n = As + 500 - Je()))
                  ) {
                    if (0 !== pn(e, 0)) break;
                    if (((a = e.suspendedLanes) & r) !== r) {
                      (eu(), (e.pingedLanes |= e.suspendedLanes & a));
                      break;
                    }
                    e.timeoutHandle = ra(wu.bind(null, e, Us, Bs), n);
                    break;
                  }
                  wu(e, Us, Bs);
                  break;
                case 4:
                  if ((ou(e, r), (4194240 & r) === r)) break;
                  for (n = e.eventTimes, a = -1; 0 < r; ) {
                    var o = 31 - on(r);
                    ((i = 1 << o), (o = n[o]) > a && (a = o), (r &= ~i));
                  }
                  if (
                    ((r = a),
                    10 <
                      (r =
                        (120 > (r = Je() - r)
                          ? 120
                          : 480 > r
                            ? 480
                            : 1080 > r
                              ? 1080
                              : 1920 > r
                                ? 1920
                                : 3e3 > r
                                  ? 3e3
                                  : 4320 > r
                                    ? 4320
                                    : 1960 * js(r / 1960)) - r))
                  ) {
                    e.timeoutHandle = ra(wu.bind(null, e, Us, Bs), r);
                    break;
                  }
                  wu(e, Us, Bs);
                  break;
                default:
                  throw Error(l(329));
              }
            }
          }
          return (ru(e, Je()), e.callbackNode === t ? au.bind(null, e) : null);
        }
        function lu(e, n) {
          var t = $s;
          return (
            e.current.memoizedState.isDehydrated && (fu(e, n).flags |= 256),
            2 !== (e = gu(e, n)) && ((n = Us), (Us = t), null !== n && iu(n)),
            e
          );
        }
        function iu(e) {
          null === Us ? (Us = e) : Us.push.apply(Us, e);
        }
        function ou(e, n) {
          for (
            n &= ~Os,
              n &= ~Is,
              e.suspendedLanes |= n,
              e.pingedLanes &= ~n,
              e = e.expirationTimes;
            0 < n;

          ) {
            var t = 31 - on(n),
              r = 1 << t;
            ((e[t] = -1), (n &= ~r));
          }
        }
        function su(e) {
          if (0 !== (6 & Ns)) throw Error(l(327));
          ku();
          var n = pn(e, 0);
          if (0 === (1 & n)) return (ru(e, Je()), null);
          var t = gu(e, n);
          if (0 !== e.tag && 2 === t) {
            var r = mn(e);
            0 !== r && ((n = r), (t = lu(e, r)));
          }
          if (1 === t) throw ((t = Rs), fu(e, 0), ou(e, n), ru(e, Je()), t);
          if (6 === t) throw Error(l(345));
          return (
            (e.finishedWork = e.current.alternate),
            (e.finishedLanes = n),
            wu(e, Us, Bs),
            ru(e, Je()),
            null
          );
        }
        function uu(e, n) {
          var t = Ns;
          Ns |= 1;
          try {
            return e(n);
          } finally {
            0 === (Ns = t) && ((Vs = Je() + 500), $a && Va());
          }
        }
        function cu(e) {
          null !== Ks && 0 === Ks.tag && 0 === (6 & Ns) && ku();
          var n = Ns;
          Ns |= 1;
          var t = Es.transition,
            r = bn;
          try {
            if (((Es.transition = null), (bn = 1), e)) return e();
          } finally {
            ((bn = r), (Es.transition = t), 0 === (6 & (Ns = n)) && Va());
          }
        }
        function du() {
          ((Ls = Ms.current), Ca(Ms));
        }
        function fu(e, n) {
          ((e.finishedWork = null), (e.finishedLanes = 0));
          var t = e.timeoutHandle;
          if ((-1 !== t && ((e.timeoutHandle = -1), aa(t)), null !== zs))
            for (t = zs.return; null !== t; ) {
              var r = t;
              switch ((nl(r), r.tag)) {
                case 1:
                  null !== (r = r.type.childContextTypes) &&
                    void 0 !== r &&
                    Ma();
                  break;
                case 3:
                  (Gl(), Ca(_a), Ca(Na), ti());
                  break;
                case 5:
                  Xl(r);
                  break;
                case 4:
                  Gl();
                  break;
                case 13:
                case 19:
                  Ca(Zl);
                  break;
                case 10:
                  El(r.type._context);
                  break;
                case 22:
                case 23:
                  du();
              }
              t = t.return;
            }
          if (
            ((_s = e),
            (zs = e = Mu(e.current, null)),
            (Ts = Ls = n),
            (Ds = 0),
            (Rs = null),
            (Os = Is = Fs = 0),
            (Us = $s = null),
            null !== Tl)
          ) {
            for (n = 0; n < Tl.length; n++)
              if (null !== (r = (t = Tl[n]).interleaved)) {
                t.interleaved = null;
                var a = r.next,
                  l = t.pending;
                if (null !== l) {
                  var i = l.next;
                  ((l.next = a), (r.next = i));
                }
                t.pending = r;
              }
            Tl = null;
          }
          return e;
        }
        function pu(e, n) {
          for (;;) {
            var t = zs;
            try {
              if ((Pl(), (ri.current = Ji), ui)) {
                for (var r = ii.memoizedState; null !== r; ) {
                  var a = r.queue;
                  (null !== a && (a.pending = null), (r = r.next));
                }
                ui = !1;
              }
              if (
                ((li = 0),
                (si = oi = ii = null),
                (ci = !1),
                (di = 0),
                (Ps.current = null),
                null === t || null === t.return)
              ) {
                ((Ds = 1), (Rs = n), (zs = null));
                break;
              }
              e: {
                var i = e,
                  o = t.return,
                  s = t,
                  u = n;
                if (
                  ((n = Ts),
                  (s.flags |= 32768),
                  null !== u &&
                    "object" === typeof u &&
                    "function" === typeof u.then)
                ) {
                  var c = u,
                    d = s,
                    f = d.tag;
                  if (0 === (1 & d.mode) && (0 === f || 11 === f || 15 === f)) {
                    var p = d.alternate;
                    p
                      ? ((d.updateQueue = p.updateQueue),
                        (d.memoizedState = p.memoizedState),
                        (d.lanes = p.lanes))
                      : ((d.updateQueue = null), (d.memoizedState = null));
                  }
                  var h = go(o);
                  if (null !== h) {
                    ((h.flags &= -257),
                      vo(h, o, s, 0, n),
                      1 & h.mode && mo(i, c, n),
                      (u = c));
                    var m = (n = h).updateQueue;
                    if (null === m) {
                      var g = new Set();
                      (g.add(u), (n.updateQueue = g));
                    } else m.add(u);
                    break e;
                  }
                  if (0 === (1 & n)) {
                    (mo(i, c, n), mu());
                    break e;
                  }
                  u = Error(l(426));
                } else if (al && 1 & s.mode) {
                  var v = go(o);
                  if (null !== v) {
                    (0 === (65536 & v.flags) && (v.flags |= 256),
                      vo(v, o, s, 0, n),
                      hl(so(u, s)));
                    break e;
                  }
                }
                ((i = u = so(u, s)),
                  4 !== Ds && (Ds = 2),
                  null === $s ? ($s = [i]) : $s.push(i),
                  (i = o));
                do {
                  switch (i.tag) {
                    case 3:
                      ((i.flags |= 65536),
                        (n &= -n),
                        (i.lanes |= n),
                        Al(i, po(0, u, n)));
                      break e;
                    case 1:
                      s = u;
                      var y = i.type,
                        x = i.stateNode;
                      if (
                        0 === (128 & i.flags) &&
                        ("function" === typeof y.getDerivedStateFromError ||
                          (null !== x &&
                            "function" === typeof x.componentDidCatch &&
                            (null === Qs || !Qs.has(x))))
                      ) {
                        ((i.flags |= 65536),
                          (n &= -n),
                          (i.lanes |= n),
                          Al(i, ho(i, s, n)));
                        break e;
                      }
                  }
                  i = i.return;
                } while (null !== i);
              }
              bu(t);
            } catch (b) {
              ((n = b), zs === t && null !== t && (zs = t = t.return));
              continue;
            }
            break;
          }
        }
        function hu() {
          var e = Cs.current;
          return ((Cs.current = Ji), null === e ? Ji : e);
        }
        function mu() {
          ((0 !== Ds && 3 !== Ds && 2 !== Ds) || (Ds = 4),
            null === _s ||
              (0 === (268435455 & Fs) && 0 === (268435455 & Is)) ||
              ou(_s, Ts));
        }
        function gu(e, n) {
          var t = Ns;
          Ns |= 2;
          var r = hu();
          for ((_s === e && Ts === n) || ((Bs = null), fu(e, n)); ; )
            try {
              vu();
              break;
            } catch (a) {
              pu(e, a);
            }
          if ((Pl(), (Ns = t), (Cs.current = r), null !== zs))
            throw Error(l(261));
          return ((_s = null), (Ts = 0), Ds);
        }
        function vu() {
          for (; null !== zs; ) xu(zs);
        }
        function yu() {
          for (; null !== zs && !Ye(); ) xu(zs);
        }
        function xu(e) {
          var n = Ss(e.alternate, e, Ls);
          ((e.memoizedProps = e.pendingProps),
            null === n ? bu(e) : (zs = n),
            (Ps.current = null));
        }
        function bu(e) {
          var n = e;
          do {
            var t = n.alternate;
            if (((e = n.return), 0 === (32768 & n.flags))) {
              if (null !== (t = qo(t, n, Ls))) return void (zs = t);
            } else {
              if (null !== (t = Ko(t, n)))
                return ((t.flags &= 32767), void (zs = t));
              if (null === e) return ((Ds = 6), void (zs = null));
              ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
            }
            if (null !== (n = n.sibling)) return void (zs = n);
            zs = n = e;
          } while (null !== n);
          0 === Ds && (Ds = 5);
        }
        function wu(e, n, t) {
          var r = bn,
            a = Es.transition;
          try {
            ((Es.transition = null),
              (bn = 1),
              (function (e, n, t, r) {
                do {
                  ku();
                } while (null !== Ks);
                if (0 !== (6 & Ns)) throw Error(l(327));
                t = e.finishedWork;
                var a = e.finishedLanes;
                if (null === t) return null;
                if (
                  ((e.finishedWork = null),
                  (e.finishedLanes = 0),
                  t === e.current)
                )
                  throw Error(l(177));
                ((e.callbackNode = null), (e.callbackPriority = 0));
                var i = t.lanes | t.childLanes;
                if (
                  ((function (e, n) {
                    var t = e.pendingLanes & ~n;
                    ((e.pendingLanes = n),
                      (e.suspendedLanes = 0),
                      (e.pingedLanes = 0),
                      (e.expiredLanes &= n),
                      (e.mutableReadLanes &= n),
                      (e.entangledLanes &= n),
                      (n = e.entanglements));
                    var r = e.eventTimes;
                    for (e = e.expirationTimes; 0 < t; ) {
                      var a = 31 - on(t),
                        l = 1 << a;
                      ((n[a] = 0), (r[a] = -1), (e[a] = -1), (t &= ~l));
                    }
                  })(e, i),
                  e === _s && ((zs = _s = null), (Ts = 0)),
                  (0 === (2064 & t.subtreeFlags) && 0 === (2064 & t.flags)) ||
                    qs ||
                    ((qs = !0),
                    _u(nn, function () {
                      return (ku(), null);
                    })),
                  (i = 0 !== (15990 & t.flags)),
                  0 !== (15990 & t.subtreeFlags) || i)
                ) {
                  ((i = Es.transition), (Es.transition = null));
                  var o = bn;
                  bn = 1;
                  var s = Ns;
                  ((Ns |= 4),
                    (Ps.current = null),
                    (function (e, n) {
                      if (((ea = Wn), pr((e = fr())))) {
                        if ("selectionStart" in e)
                          var t = {
                            start: e.selectionStart,
                            end: e.selectionEnd,
                          };
                        else
                          e: {
                            var r =
                              (t =
                                ((t = e.ownerDocument) && t.defaultView) ||
                                window).getSelection && t.getSelection();
                            if (r && 0 !== r.rangeCount) {
                              t = r.anchorNode;
                              var a = r.anchorOffset,
                                i = r.focusNode;
                              r = r.focusOffset;
                              try {
                                (t.nodeType, i.nodeType);
                              } catch (w) {
                                t = null;
                                break e;
                              }
                              var o = 0,
                                s = -1,
                                u = -1,
                                c = 0,
                                d = 0,
                                f = e,
                                p = null;
                              n: for (;;) {
                                for (
                                  var h;
                                  f !== t ||
                                    (0 !== a && 3 !== f.nodeType) ||
                                    (s = o + a),
                                    f !== i ||
                                      (0 !== r && 3 !== f.nodeType) ||
                                      (u = o + r),
                                    3 === f.nodeType &&
                                      (o += f.nodeValue.length),
                                    null !== (h = f.firstChild);

                                )
                                  ((p = f), (f = h));
                                for (;;) {
                                  if (f === e) break n;
                                  if (
                                    (p === t && ++c === a && (s = o),
                                    p === i && ++d === r && (u = o),
                                    null !== (h = f.nextSibling))
                                  )
                                    break;
                                  p = (f = p).parentNode;
                                }
                                f = h;
                              }
                              t =
                                -1 === s || -1 === u
                                  ? null
                                  : { start: s, end: u };
                            } else t = null;
                          }
                        t = t || { start: 0, end: 0 };
                      } else t = null;
                      for (
                        na = { focusedElem: e, selectionRange: t },
                          Wn = !1,
                          Xo = n;
                        null !== Xo;

                      )
                        if (
                          ((e = (n = Xo).child),
                          0 !== (1028 & n.subtreeFlags) && null !== e)
                        )
                          ((e.return = n), (Xo = e));
                        else
                          for (; null !== Xo; ) {
                            n = Xo;
                            try {
                              var m = n.alternate;
                              if (0 !== (1024 & n.flags))
                                switch (n.tag) {
                                  case 0:
                                  case 11:
                                  case 15:
                                  case 5:
                                  case 6:
                                  case 4:
                                  case 17:
                                    break;
                                  case 1:
                                    if (null !== m) {
                                      var g = m.memoizedProps,
                                        v = m.memoizedState,
                                        y = n.stateNode,
                                        x = y.getSnapshotBeforeUpdate(
                                          n.elementType === n.type
                                            ? g
                                            : no(n.type, g),
                                          v,
                                        );
                                      y.__reactInternalSnapshotBeforeUpdate = x;
                                    }
                                    break;
                                  case 3:
                                    var b = n.stateNode.containerInfo;
                                    1 === b.nodeType
                                      ? (b.textContent = "")
                                      : 9 === b.nodeType &&
                                        b.documentElement &&
                                        b.removeChild(b.documentElement);
                                    break;
                                  default:
                                    throw Error(l(163));
                                }
                            } catch (w) {
                              ju(n, n.return, w);
                            }
                            if (null !== (e = n.sibling)) {
                              ((e.return = n.return), (Xo = e));
                              break;
                            }
                            Xo = n.return;
                          }
                      ((m = ns), (ns = !1));
                    })(e, t),
                    gs(t, e),
                    hr(na),
                    (Wn = !!ea),
                    (na = ea = null),
                    (e.current = t),
                    ys(t, e, a),
                    Ge(),
                    (Ns = s),
                    (bn = o),
                    (Es.transition = i));
                } else e.current = t;
                if (
                  (qs && ((qs = !1), (Ks = e), (Ys = a)),
                  (i = e.pendingLanes),
                  0 === i && (Qs = null),
                  (function (e) {
                    if (ln && "function" === typeof ln.onCommitFiberRoot)
                      try {
                        ln.onCommitFiberRoot(
                          an,
                          e,
                          void 0,
                          128 === (128 & e.current.flags),
                        );
                      } catch (n) {}
                  })(t.stateNode),
                  ru(e, Je()),
                  null !== n)
                )
                  for (r = e.onRecoverableError, t = 0; t < n.length; t++)
                    ((a = n[t]),
                      r(a.value, {
                        componentStack: a.stack,
                        digest: a.digest,
                      }));
                if (Hs) throw ((Hs = !1), (e = Ws), (Ws = null), e);
                (0 !== (1 & Ys) && 0 !== e.tag && ku(),
                  (i = e.pendingLanes),
                  0 !== (1 & i)
                    ? e === Js
                      ? Gs++
                      : ((Gs = 0), (Js = e))
                    : (Gs = 0),
                  Va());
              })(e, n, t, r));
          } finally {
            ((Es.transition = a), (bn = r));
          }
          return null;
        }
        function ku() {
          if (null !== Ks) {
            var e = wn(Ys),
              n = Es.transition,
              t = bn;
            try {
              if (((Es.transition = null), (bn = 16 > e ? 16 : e), null === Ks))
                var r = !1;
              else {
                if (((e = Ks), (Ks = null), (Ys = 0), 0 !== (6 & Ns)))
                  throw Error(l(331));
                var a = Ns;
                for (Ns |= 4, Xo = e.current; null !== Xo; ) {
                  var i = Xo,
                    o = i.child;
                  if (0 !== (16 & Xo.flags)) {
                    var s = i.deletions;
                    if (null !== s) {
                      for (var u = 0; u < s.length; u++) {
                        var c = s[u];
                        for (Xo = c; null !== Xo; ) {
                          var d = Xo;
                          switch (d.tag) {
                            case 0:
                            case 11:
                            case 15:
                              ts(8, d, i);
                          }
                          var f = d.child;
                          if (null !== f) ((f.return = d), (Xo = f));
                          else
                            for (; null !== Xo; ) {
                              var p = (d = Xo).sibling,
                                h = d.return;
                              if ((ls(d), d === c)) {
                                Xo = null;
                                break;
                              }
                              if (null !== p) {
                                ((p.return = h), (Xo = p));
                                break;
                              }
                              Xo = h;
                            }
                        }
                      }
                      var m = i.alternate;
                      if (null !== m) {
                        var g = m.child;
                        if (null !== g) {
                          m.child = null;
                          do {
                            var v = g.sibling;
                            ((g.sibling = null), (g = v));
                          } while (null !== g);
                        }
                      }
                      Xo = i;
                    }
                  }
                  if (0 !== (2064 & i.subtreeFlags) && null !== o)
                    ((o.return = i), (Xo = o));
                  else
                    e: for (; null !== Xo; ) {
                      if (0 !== (2048 & (i = Xo).flags))
                        switch (i.tag) {
                          case 0:
                          case 11:
                          case 15:
                            ts(9, i, i.return);
                        }
                      var y = i.sibling;
                      if (null !== y) {
                        ((y.return = i.return), (Xo = y));
                        break e;
                      }
                      Xo = i.return;
                    }
                }
                var x = e.current;
                for (Xo = x; null !== Xo; ) {
                  var b = (o = Xo).child;
                  if (0 !== (2064 & o.subtreeFlags) && null !== b)
                    ((b.return = o), (Xo = b));
                  else
                    e: for (o = x; null !== Xo; ) {
                      if (0 !== (2048 & (s = Xo).flags))
                        try {
                          switch (s.tag) {
                            case 0:
                            case 11:
                            case 15:
                              rs(9, s);
                          }
                        } catch (k) {
                          ju(s, s.return, k);
                        }
                      if (s === o) {
                        Xo = null;
                        break e;
                      }
                      var w = s.sibling;
                      if (null !== w) {
                        ((w.return = s.return), (Xo = w));
                        break e;
                      }
                      Xo = s.return;
                    }
                }
                if (
                  ((Ns = a),
                  Va(),
                  ln && "function" === typeof ln.onPostCommitFiberRoot)
                )
                  try {
                    ln.onPostCommitFiberRoot(an, e);
                  } catch (k) {}
                r = !0;
              }
              return r;
            } finally {
              ((bn = t), (Es.transition = n));
            }
          }
          return !1;
        }
        function Su(e, n, t) {
          ((e = $l(e, (n = po(0, (n = so(t, n)), 1)), 1)),
            (n = eu()),
            null !== e && (yn(e, 1, n), ru(e, n)));
        }
        function ju(e, n, t) {
          if (3 === e.tag) Su(e, e, t);
          else
            for (; null !== n; ) {
              if (3 === n.tag) {
                Su(n, e, t);
                break;
              }
              if (1 === n.tag) {
                var r = n.stateNode;
                if (
                  "function" === typeof n.type.getDerivedStateFromError ||
                  ("function" === typeof r.componentDidCatch &&
                    (null === Qs || !Qs.has(r)))
                ) {
                  ((n = $l(n, (e = ho(n, (e = so(t, e)), 1)), 1)),
                    (e = eu()),
                    null !== n && (yn(n, 1, e), ru(n, e)));
                  break;
                }
              }
              n = n.return;
            }
        }
        function Cu(e, n, t) {
          var r = e.pingCache;
          (null !== r && r.delete(n),
            (n = eu()),
            (e.pingedLanes |= e.suspendedLanes & t),
            _s === e &&
              (Ts & t) === t &&
              (4 === Ds ||
              (3 === Ds && (130023424 & Ts) === Ts && 500 > Je() - As)
                ? fu(e, 0)
                : (Os |= t)),
            ru(e, n));
        }
        function Pu(e, n) {
          0 === n &&
            (0 === (1 & e.mode)
              ? (n = 1)
              : ((n = dn), 0 === (130023424 & (dn <<= 1)) && (dn = 4194304)));
          var t = eu();
          null !== (e = Dl(e, n)) && (yn(e, n, t), ru(e, t));
        }
        function Eu(e) {
          var n = e.memoizedState,
            t = 0;
          (null !== n && (t = n.retryLane), Pu(e, t));
        }
        function Nu(e, n) {
          var t = 0;
          switch (e.tag) {
            case 13:
              var r = e.stateNode,
                a = e.memoizedState;
              null !== a && (t = a.retryLane);
              break;
            case 19:
              r = e.stateNode;
              break;
            default:
              throw Error(l(314));
          }
          (null !== r && r.delete(n), Pu(e, t));
        }
        function _u(e, n) {
          return qe(e, n);
        }
        function zu(e, n, t, r) {
          ((this.tag = e),
            (this.key = t),
            (this.sibling =
              this.child =
              this.return =
              this.stateNode =
              this.type =
              this.elementType =
                null),
            (this.index = 0),
            (this.ref = null),
            (this.pendingProps = n),
            (this.dependencies =
              this.memoizedState =
              this.updateQueue =
              this.memoizedProps =
                null),
            (this.mode = r),
            (this.subtreeFlags = this.flags = 0),
            (this.deletions = null),
            (this.childLanes = this.lanes = 0),
            (this.alternate = null));
        }
        function Tu(e, n, t, r) {
          return new zu(e, n, t, r);
        }
        function Lu(e) {
          return !(!(e = e.prototype) || !e.isReactComponent);
        }
        function Mu(e, n) {
          var t = e.alternate;
          return (
            null === t
              ? (((t = Tu(e.tag, n, e.key, e.mode)).elementType =
                  e.elementType),
                (t.type = e.type),
                (t.stateNode = e.stateNode),
                (t.alternate = e),
                (e.alternate = t))
              : ((t.pendingProps = n),
                (t.type = e.type),
                (t.flags = 0),
                (t.subtreeFlags = 0),
                (t.deletions = null)),
            (t.flags = 14680064 & e.flags),
            (t.childLanes = e.childLanes),
            (t.lanes = e.lanes),
            (t.child = e.child),
            (t.memoizedProps = e.memoizedProps),
            (t.memoizedState = e.memoizedState),
            (t.updateQueue = e.updateQueue),
            (n = e.dependencies),
            (t.dependencies =
              null === n
                ? null
                : { lanes: n.lanes, firstContext: n.firstContext }),
            (t.sibling = e.sibling),
            (t.index = e.index),
            (t.ref = e.ref),
            t
          );
        }
        function Du(e, n, t, r, a, i) {
          var o = 2;
          if (((r = e), "function" === typeof e)) Lu(e) && (o = 1);
          else if ("string" === typeof e) o = 5;
          else
            e: switch (e) {
              case S:
                return Ru(t.children, a, i, n);
              case j:
                ((o = 8), (a |= 8));
                break;
              case C:
                return (
                  ((e = Tu(12, t, n, 2 | a)).elementType = C),
                  (e.lanes = i),
                  e
                );
              case _:
                return (
                  ((e = Tu(13, t, n, a)).elementType = _),
                  (e.lanes = i),
                  e
                );
              case z:
                return (
                  ((e = Tu(19, t, n, a)).elementType = z),
                  (e.lanes = i),
                  e
                );
              case M:
                return Fu(t, a, i, n);
              default:
                if ("object" === typeof e && null !== e)
                  switch (e.$$typeof) {
                    case P:
                      o = 10;
                      break e;
                    case E:
                      o = 9;
                      break e;
                    case N:
                      o = 11;
                      break e;
                    case T:
                      o = 14;
                      break e;
                    case L:
                      ((o = 16), (r = null));
                      break e;
                  }
                throw Error(l(130, null == e ? e : typeof e, ""));
            }
          return (
            ((n = Tu(o, t, n, a)).elementType = e),
            (n.type = r),
            (n.lanes = i),
            n
          );
        }
        function Ru(e, n, t, r) {
          return (((e = Tu(7, e, r, n)).lanes = t), e);
        }
        function Fu(e, n, t, r) {
          return (
            ((e = Tu(22, e, r, n)).elementType = M),
            (e.lanes = t),
            (e.stateNode = { isHidden: !1 }),
            e
          );
        }
        function Iu(e, n, t) {
          return (((e = Tu(6, e, null, n)).lanes = t), e);
        }
        function Ou(e, n, t) {
          return (
            ((n = Tu(
              4,
              null !== e.children ? e.children : [],
              e.key,
              n,
            )).lanes = t),
            (n.stateNode = {
              containerInfo: e.containerInfo,
              pendingChildren: null,
              implementation: e.implementation,
            }),
            n
          );
        }
        function $u(e, n, t, r, a) {
          ((this.tag = n),
            (this.containerInfo = e),
            (this.finishedWork =
              this.pingCache =
              this.current =
              this.pendingChildren =
                null),
            (this.timeoutHandle = -1),
            (this.callbackNode = this.pendingContext = this.context = null),
            (this.callbackPriority = 0),
            (this.eventTimes = vn(0)),
            (this.expirationTimes = vn(-1)),
            (this.entangledLanes =
              this.finishedLanes =
              this.mutableReadLanes =
              this.expiredLanes =
              this.pingedLanes =
              this.suspendedLanes =
              this.pendingLanes =
                0),
            (this.entanglements = vn(0)),
            (this.identifierPrefix = r),
            (this.onRecoverableError = a),
            (this.mutableSourceEagerHydrationData = null));
        }
        function Uu(e, n, t, r, a, l, i, o, s) {
          return (
            (e = new $u(e, n, t, o, s)),
            1 === n ? ((n = 1), !0 === l && (n |= 8)) : (n = 0),
            (l = Tu(3, null, null, n)),
            (e.current = l),
            (l.stateNode = e),
            (l.memoizedState = {
              element: r,
              isDehydrated: t,
              cache: null,
              transitions: null,
              pendingSuspenseBoundaries: null,
            }),
            Fl(l),
            e
          );
        }
        function Au(e) {
          if (!e) return Ea;
          e: {
            if (Ve((e = e._reactInternals)) !== e || 1 !== e.tag)
              throw Error(l(170));
            var n = e;
            do {
              switch (n.tag) {
                case 3:
                  n = n.stateNode.context;
                  break e;
                case 1:
                  if (La(n.type)) {
                    n = n.stateNode.__reactInternalMemoizedMergedChildContext;
                    break e;
                  }
              }
              n = n.return;
            } while (null !== n);
            throw Error(l(171));
          }
          if (1 === e.tag) {
            var t = e.type;
            if (La(t)) return Ra(e, t, n);
          }
          return n;
        }
        function Vu(e, n, t, r, a, l, i, o, s) {
          return (
            ((e = Uu(t, r, !0, e, 0, l, 0, o, s)).context = Au(null)),
            (t = e.current),
            ((l = Ol((r = eu()), (a = nu(t)))).callback =
              void 0 !== n && null !== n ? n : null),
            $l(t, l, a),
            (e.current.lanes = a),
            yn(e, a, r),
            ru(e, r),
            e
          );
        }
        function Bu(e, n, t, r) {
          var a = n.current,
            l = eu(),
            i = nu(a);
          return (
            (t = Au(t)),
            null === n.context ? (n.context = t) : (n.pendingContext = t),
            ((n = Ol(l, i)).payload = { element: e }),
            null !== (r = void 0 === r ? null : r) && (n.callback = r),
            null !== (e = $l(a, n, i)) && (tu(e, a, i, l), Ul(e, a, i)),
            i
          );
        }
        function Hu(e) {
          return (e = e.current).child
            ? (e.child.tag, e.child.stateNode)
            : null;
        }
        function Wu(e, n) {
          if (null !== (e = e.memoizedState) && null !== e.dehydrated) {
            var t = e.retryLane;
            e.retryLane = 0 !== t && t < n ? t : n;
          }
        }
        function Qu(e, n) {
          (Wu(e, n), (e = e.alternate) && Wu(e, n));
        }
        Ss = function (e, n, t) {
          if (null !== e)
            if (e.memoizedProps !== n.pendingProps || _a.current) xo = !0;
            else {
              if (0 === (e.lanes & t) && 0 === (128 & n.flags))
                return (
                  (xo = !1),
                  (function (e, n, t) {
                    switch (n.tag) {
                      case 3:
                        (_o(n), pl());
                        break;
                      case 5:
                        Jl(n);
                        break;
                      case 1:
                        La(n.type) && Fa(n);
                        break;
                      case 4:
                        Yl(n, n.stateNode.containerInfo);
                        break;
                      case 10:
                        var r = n.type._context,
                          a = n.memoizedProps.value;
                        (Pa(kl, r._currentValue), (r._currentValue = a));
                        break;
                      case 13:
                        if (null !== (r = n.memoizedState))
                          return null !== r.dehydrated
                            ? (Pa(Zl, 1 & Zl.current), (n.flags |= 128), null)
                            : 0 !== (t & n.child.childLanes)
                              ? Io(e, n, t)
                              : (Pa(Zl, 1 & Zl.current),
                                null !== (e = Ho(e, n, t)) ? e.sibling : null);
                        Pa(Zl, 1 & Zl.current);
                        break;
                      case 19:
                        if (
                          ((r = 0 !== (t & n.childLanes)),
                          0 !== (128 & e.flags))
                        ) {
                          if (r) return Vo(e, n, t);
                          n.flags |= 128;
                        }
                        if (
                          (null !== (a = n.memoizedState) &&
                            ((a.rendering = null),
                            (a.tail = null),
                            (a.lastEffect = null)),
                          Pa(Zl, Zl.current),
                          r)
                        )
                          break;
                        return null;
                      case 22:
                      case 23:
                        return ((n.lanes = 0), jo(e, n, t));
                    }
                    return Ho(e, n, t);
                  })(e, n, t)
                );
              xo = 0 !== (131072 & e.flags);
            }
          else
            ((xo = !1), al && 0 !== (1048576 & n.flags) && Za(n, Qa, n.index));
          switch (((n.lanes = 0), n.tag)) {
            case 2:
              var r = n.type;
              (Bo(e, n), (e = n.pendingProps));
              var a = Ta(n, Na.current);
              (_l(n, t), (a = mi(null, n, r, e, a, t)));
              var i = gi();
              return (
                (n.flags |= 1),
                "object" === typeof a &&
                null !== a &&
                "function" === typeof a.render &&
                void 0 === a.$$typeof
                  ? ((n.tag = 1),
                    (n.memoizedState = null),
                    (n.updateQueue = null),
                    La(r) ? ((i = !0), Fa(n)) : (i = !1),
                    (n.memoizedState =
                      null !== a.state && void 0 !== a.state ? a.state : null),
                    Fl(n),
                    (a.updater = ro),
                    (n.stateNode = a),
                    (a._reactInternals = n),
                    oo(n, r, e, t),
                    (n = No(null, n, r, !0, i, t)))
                  : ((n.tag = 0),
                    al && i && el(n),
                    bo(null, n, a, t),
                    (n = n.child)),
                n
              );
            case 16:
              r = n.elementType;
              e: {
                switch (
                  (Bo(e, n),
                  (e = n.pendingProps),
                  (r = (a = r._init)(r._payload)),
                  (n.type = r),
                  (a = n.tag =
                    (function (e) {
                      if ("function" === typeof e) return Lu(e) ? 1 : 0;
                      if (void 0 !== e && null !== e) {
                        if ((e = e.$$typeof) === N) return 11;
                        if (e === T) return 14;
                      }
                      return 2;
                    })(r)),
                  (e = no(r, e)),
                  a)
                ) {
                  case 0:
                    n = Po(null, n, r, e, t);
                    break e;
                  case 1:
                    n = Eo(null, n, r, e, t);
                    break e;
                  case 11:
                    n = wo(null, n, r, e, t);
                    break e;
                  case 14:
                    n = ko(null, n, r, no(r.type, e), t);
                    break e;
                }
                throw Error(l(306, r, ""));
              }
              return n;
            case 0:
              return (
                (r = n.type),
                (a = n.pendingProps),
                Po(e, n, r, (a = n.elementType === r ? a : no(r, a)), t)
              );
            case 1:
              return (
                (r = n.type),
                (a = n.pendingProps),
                Eo(e, n, r, (a = n.elementType === r ? a : no(r, a)), t)
              );
            case 3:
              e: {
                if ((_o(n), null === e)) throw Error(l(387));
                ((r = n.pendingProps),
                  (a = (i = n.memoizedState).element),
                  Il(e, n),
                  Vl(n, r, null, t));
                var o = n.memoizedState;
                if (((r = o.element), i.isDehydrated)) {
                  if (
                    ((i = {
                      element: r,
                      isDehydrated: !1,
                      cache: o.cache,
                      pendingSuspenseBoundaries: o.pendingSuspenseBoundaries,
                      transitions: o.transitions,
                    }),
                    (n.updateQueue.baseState = i),
                    (n.memoizedState = i),
                    256 & n.flags)
                  ) {
                    n = zo(e, n, r, t, (a = so(Error(l(423)), n)));
                    break e;
                  }
                  if (r !== a) {
                    n = zo(e, n, r, t, (a = so(Error(l(424)), n)));
                    break e;
                  }
                  for (
                    rl = ua(n.stateNode.containerInfo.firstChild),
                      tl = n,
                      al = !0,
                      ll = null,
                      t = wl(n, null, r, t),
                      n.child = t;
                    t;

                  )
                    ((t.flags = (-3 & t.flags) | 4096), (t = t.sibling));
                } else {
                  if ((pl(), r === a)) {
                    n = Ho(e, n, t);
                    break e;
                  }
                  bo(e, n, r, t);
                }
                n = n.child;
              }
              return n;
            case 5:
              return (
                Jl(n),
                null === e && ul(n),
                (r = n.type),
                (a = n.pendingProps),
                (i = null !== e ? e.memoizedProps : null),
                (o = a.children),
                ta(r, a)
                  ? (o = null)
                  : null !== i && ta(r, i) && (n.flags |= 32),
                Co(e, n),
                bo(e, n, o, t),
                n.child
              );
            case 6:
              return (null === e && ul(n), null);
            case 13:
              return Io(e, n, t);
            case 4:
              return (
                Yl(n, n.stateNode.containerInfo),
                (r = n.pendingProps),
                null === e ? (n.child = bl(n, null, r, t)) : bo(e, n, r, t),
                n.child
              );
            case 11:
              return (
                (r = n.type),
                (a = n.pendingProps),
                wo(e, n, r, (a = n.elementType === r ? a : no(r, a)), t)
              );
            case 7:
              return (bo(e, n, n.pendingProps, t), n.child);
            case 8:
            case 12:
              return (bo(e, n, n.pendingProps.children, t), n.child);
            case 10:
              e: {
                if (
                  ((r = n.type._context),
                  (a = n.pendingProps),
                  (i = n.memoizedProps),
                  (o = a.value),
                  Pa(kl, r._currentValue),
                  (r._currentValue = o),
                  null !== i)
                )
                  if (or(i.value, o)) {
                    if (i.children === a.children && !_a.current) {
                      n = Ho(e, n, t);
                      break e;
                    }
                  } else
                    for (
                      null !== (i = n.child) && (i.return = n);
                      null !== i;

                    ) {
                      var s = i.dependencies;
                      if (null !== s) {
                        o = i.child;
                        for (var u = s.firstContext; null !== u; ) {
                          if (u.context === r) {
                            if (1 === i.tag) {
                              (u = Ol(-1, t & -t)).tag = 2;
                              var c = i.updateQueue;
                              if (null !== c) {
                                var d = (c = c.shared).pending;
                                (null === d
                                  ? (u.next = u)
                                  : ((u.next = d.next), (d.next = u)),
                                  (c.pending = u));
                              }
                            }
                            ((i.lanes |= t),
                              null !== (u = i.alternate) && (u.lanes |= t),
                              Nl(i.return, t, n),
                              (s.lanes |= t));
                            break;
                          }
                          u = u.next;
                        }
                      } else if (10 === i.tag)
                        o = i.type === n.type ? null : i.child;
                      else if (18 === i.tag) {
                        if (null === (o = i.return)) throw Error(l(341));
                        ((o.lanes |= t),
                          null !== (s = o.alternate) && (s.lanes |= t),
                          Nl(o, t, n),
                          (o = i.sibling));
                      } else o = i.child;
                      if (null !== o) o.return = i;
                      else
                        for (o = i; null !== o; ) {
                          if (o === n) {
                            o = null;
                            break;
                          }
                          if (null !== (i = o.sibling)) {
                            ((i.return = o.return), (o = i));
                            break;
                          }
                          o = o.return;
                        }
                      i = o;
                    }
                (bo(e, n, a.children, t), (n = n.child));
              }
              return n;
            case 9:
              return (
                (a = n.type),
                (r = n.pendingProps.children),
                _l(n, t),
                (r = r((a = zl(a)))),
                (n.flags |= 1),
                bo(e, n, r, t),
                n.child
              );
            case 14:
              return (
                (a = no((r = n.type), n.pendingProps)),
                ko(e, n, r, (a = no(r.type, a)), t)
              );
            case 15:
              return So(e, n, n.type, n.pendingProps, t);
            case 17:
              return (
                (r = n.type),
                (a = n.pendingProps),
                (a = n.elementType === r ? a : no(r, a)),
                Bo(e, n),
                (n.tag = 1),
                La(r) ? ((e = !0), Fa(n)) : (e = !1),
                _l(n, t),
                lo(n, r, a),
                oo(n, r, a, t),
                No(null, n, r, !0, e, t)
              );
            case 19:
              return Vo(e, n, t);
            case 22:
              return jo(e, n, t);
          }
          throw Error(l(156, n.tag));
        };
        var qu =
          "function" === typeof reportError
            ? reportError
            : function (e) {
                console.error(e);
              };
        function Ku(e) {
          this._internalRoot = e;
        }
        function Yu(e) {
          this._internalRoot = e;
        }
        function Gu(e) {
          return !(
            !e ||
            (1 !== e.nodeType && 9 !== e.nodeType && 11 !== e.nodeType)
          );
        }
        function Ju(e) {
          return !(
            !e ||
            (1 !== e.nodeType &&
              9 !== e.nodeType &&
              11 !== e.nodeType &&
              (8 !== e.nodeType ||
                " react-mount-point-unstable " !== e.nodeValue))
          );
        }
        function Xu() {}
        function Zu(e, n, t, r, a) {
          var l = t._reactRootContainer;
          if (l) {
            var i = l;
            if ("function" === typeof a) {
              var o = a;
              a = function () {
                var e = Hu(i);
                o.call(e);
              };
            }
            Bu(n, i, e, a);
          } else
            i = (function (e, n, t, r, a) {
              if (a) {
                if ("function" === typeof r) {
                  var l = r;
                  r = function () {
                    var e = Hu(i);
                    l.call(e);
                  };
                }
                var i = Vu(n, r, e, 0, null, !1, 0, "", Xu);
                return (
                  (e._reactRootContainer = i),
                  (e[ha] = i.current),
                  Vr(8 === e.nodeType ? e.parentNode : e),
                  cu(),
                  i
                );
              }
              for (; (a = e.lastChild); ) e.removeChild(a);
              if ("function" === typeof r) {
                var o = r;
                r = function () {
                  var e = Hu(s);
                  o.call(e);
                };
              }
              var s = Uu(e, 0, !1, null, 0, !1, 0, "", Xu);
              return (
                (e._reactRootContainer = s),
                (e[ha] = s.current),
                Vr(8 === e.nodeType ? e.parentNode : e),
                cu(function () {
                  Bu(n, s, t, r);
                }),
                s
              );
            })(t, n, e, a, r);
          return Hu(i);
        }
        ((Yu.prototype.render = Ku.prototype.render =
          function (e) {
            var n = this._internalRoot;
            if (null === n) throw Error(l(409));
            Bu(e, n, null, null);
          }),
          (Yu.prototype.unmount = Ku.prototype.unmount =
            function () {
              var e = this._internalRoot;
              if (null !== e) {
                this._internalRoot = null;
                var n = e.containerInfo;
                (cu(function () {
                  Bu(null, e, null, null);
                }),
                  (n[ha] = null));
              }
            }),
          (Yu.prototype.unstable_scheduleHydration = function (e) {
            if (e) {
              var n = Cn();
              e = { blockedOn: null, target: e, priority: n };
              for (
                var t = 0;
                t < Dn.length && 0 !== n && n < Dn[t].priority;
                t++
              );
              (Dn.splice(t, 0, e), 0 === t && On(e));
            }
          }),
          (kn = function (e) {
            switch (e.tag) {
              case 3:
                var n = e.stateNode;
                if (n.current.memoizedState.isDehydrated) {
                  var t = fn(n.pendingLanes);
                  0 !== t &&
                    (xn(n, 1 | t),
                    ru(n, Je()),
                    0 === (6 & Ns) && ((Vs = Je() + 500), Va()));
                }
                break;
              case 13:
                (cu(function () {
                  var n = Dl(e, 1);
                  if (null !== n) {
                    var t = eu();
                    tu(n, e, 1, t);
                  }
                }),
                  Qu(e, 1));
            }
          }),
          (Sn = function (e) {
            if (13 === e.tag) {
              var n = Dl(e, 134217728);
              if (null !== n) tu(n, e, 134217728, eu());
              Qu(e, 134217728);
            }
          }),
          (jn = function (e) {
            if (13 === e.tag) {
              var n = nu(e),
                t = Dl(e, n);
              if (null !== t) tu(t, e, n, eu());
              Qu(e, n);
            }
          }),
          (Cn = function () {
            return bn;
          }),
          (Pn = function (e, n) {
            var t = bn;
            try {
              return ((bn = e), n());
            } finally {
              bn = t;
            }
          }),
          (ke = function (e, n, t) {
            switch (n) {
              case "input":
                if ((X(e, t), (n = t.name), "radio" === t.type && null != n)) {
                  for (t = e; t.parentNode; ) t = t.parentNode;
                  for (
                    t = t.querySelectorAll(
                      "input[name=" +
                        JSON.stringify("" + n) +
                        '][type="radio"]',
                    ),
                      n = 0;
                    n < t.length;
                    n++
                  ) {
                    var r = t[n];
                    if (r !== e && r.form === e.form) {
                      var a = wa(r);
                      if (!a) throw Error(l(90));
                      (q(r), X(r, a));
                    }
                  }
                }
                break;
              case "textarea":
                le(e, t);
                break;
              case "select":
                null != (n = t.value) && te(e, !!t.multiple, n, !1);
            }
          }),
          (Ne = uu),
          (_e = cu));
        var ec = {
            usingClientEntryPoint: !1,
            Events: [xa, ba, wa, Pe, Ee, uu],
          },
          nc = {
            findFiberByHostInstance: ya,
            bundleType: 0,
            version: "18.3.1",
            rendererPackageName: "react-dom",
          },
          tc = {
            bundleType: nc.bundleType,
            version: nc.version,
            rendererPackageName: nc.rendererPackageName,
            rendererConfig: nc.rendererConfig,
            overrideHookState: null,
            overrideHookStateDeletePath: null,
            overrideHookStateRenamePath: null,
            overrideProps: null,
            overridePropsDeletePath: null,
            overridePropsRenamePath: null,
            setErrorHandler: null,
            setSuspenseHandler: null,
            scheduleUpdate: null,
            currentDispatcherRef: b.ReactCurrentDispatcher,
            findHostInstanceByFiber: function (e) {
              return null === (e = We(e)) ? null : e.stateNode;
            },
            findFiberByHostInstance:
              nc.findFiberByHostInstance ||
              function () {
                return null;
              },
            findHostInstancesForRefresh: null,
            scheduleRefresh: null,
            scheduleRoot: null,
            setRefreshHandler: null,
            getCurrentFiber: null,
            reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
          };
        if ("undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) {
          var rc = __REACT_DEVTOOLS_GLOBAL_HOOK__;
          if (!rc.isDisabled && rc.supportsFiber)
            try {
              ((an = rc.inject(tc)), (ln = rc));
            } catch (ce) {}
        }
        ((n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ec),
          (n.createPortal = function (e, n) {
            var t =
              2 < arguments.length && void 0 !== arguments[2]
                ? arguments[2]
                : null;
            if (!Gu(n)) throw Error(l(200));
            return (function (e, n, t) {
              var r =
                3 < arguments.length && void 0 !== arguments[3]
                  ? arguments[3]
                  : null;
              return {
                $$typeof: k,
                key: null == r ? null : "" + r,
                children: e,
                containerInfo: n,
                implementation: t,
              };
            })(e, n, null, t);
          }),
          (n.createRoot = function (e, n) {
            if (!Gu(e)) throw Error(l(299));
            var t = !1,
              r = "",
              a = qu;
            return (
              null !== n &&
                void 0 !== n &&
                (!0 === n.unstable_strictMode && (t = !0),
                void 0 !== n.identifierPrefix && (r = n.identifierPrefix),
                void 0 !== n.onRecoverableError && (a = n.onRecoverableError)),
              (n = Uu(e, 1, !1, null, 0, t, 0, r, a)),
              (e[ha] = n.current),
              Vr(8 === e.nodeType ? e.parentNode : e),
              new Ku(n)
            );
          }),
          (n.findDOMNode = function (e) {
            if (null == e) return null;
            if (1 === e.nodeType) return e;
            var n = e._reactInternals;
            if (void 0 === n) {
              if ("function" === typeof e.render) throw Error(l(188));
              throw ((e = Object.keys(e).join(",")), Error(l(268, e)));
            }
            return (e = null === (e = We(n)) ? null : e.stateNode);
          }),
          (n.flushSync = function (e) {
            return cu(e);
          }),
          (n.hydrate = function (e, n, t) {
            if (!Ju(n)) throw Error(l(200));
            return Zu(null, e, n, !0, t);
          }),
          (n.hydrateRoot = function (e, n, t) {
            if (!Gu(e)) throw Error(l(405));
            var r = (null != t && t.hydratedSources) || null,
              a = !1,
              i = "",
              o = qu;
            if (
              (null !== t &&
                void 0 !== t &&
                (!0 === t.unstable_strictMode && (a = !0),
                void 0 !== t.identifierPrefix && (i = t.identifierPrefix),
                void 0 !== t.onRecoverableError && (o = t.onRecoverableError)),
              (n = Vu(n, null, e, 1, null != t ? t : null, a, 0, i, o)),
              (e[ha] = n.current),
              Vr(e),
              r)
            )
              for (e = 0; e < r.length; e++)
                ((a = (a = (t = r[e])._getVersion)(t._source)),
                  null == n.mutableSourceEagerHydrationData
                    ? (n.mutableSourceEagerHydrationData = [t, a])
                    : n.mutableSourceEagerHydrationData.push(t, a));
            return new Yu(n);
          }),
          (n.render = function (e, n, t) {
            if (!Ju(n)) throw Error(l(200));
            return Zu(null, e, n, !1, t);
          }),
          (n.unmountComponentAtNode = function (e) {
            if (!Ju(e)) throw Error(l(40));
            return (
              !!e._reactRootContainer &&
              (cu(function () {
                Zu(null, null, e, !1, function () {
                  ((e._reactRootContainer = null), (e[ha] = null));
                });
              }),
              !0)
            );
          }),
          (n.unstable_batchedUpdates = uu),
          (n.unstable_renderSubtreeIntoContainer = function (e, n, t, r) {
            if (!Ju(t)) throw Error(l(200));
            if (null == e || void 0 === e._reactInternals) throw Error(l(38));
            return Zu(e, n, t, !1, r);
          }),
          (n.version = "18.3.1-next-f1338f8080-20240426"));
      },
      853: (e, n, t) => {
        e.exports = t(234);
      },
      950: (e, n, t) => {
        (!(function e() {
          if (
            "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ &&
            "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE
          )
            try {
              __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(e);
            } catch (n) {
              console.error(n);
            }
        })(),
          (e.exports = t(730)));
      },
    },
    n = {};
  function t(r) {
    var a = n[r];
    if (void 0 !== a) return a.exports;
    var l = (n[r] = { exports: {} });
    return (e[r](l, l.exports, t), l.exports);
  }
  var r = t(43),
    a = t(391),
    l = t(579);
  const i = (e) => {
      let { pluginSystem: n } = e;
      const [t, a] = (0, r.useState)([]),
        [, i] = (0, r.useState)(null),
        [o, s] = (0, r.useState)(null),
        [u, c] = (0, r.useState)(null),
        d = (0, r.useMemo)(
          () => [
            {
              name: "csv-processor",
              version: "1.0.0",
              description:
                "Advanced CSV data processing with validation and transformations",
              author: "DataPrism Team",
              category: "data-processing",
              status: "active",
              capabilities: [
                "parse",
                "validate",
                "transform",
                "batch",
                "stream",
              ],
              permissions: ["data:read", "data:write"],
              memoryUsage: 15.2,
              lastUsed: new Date(Date.now() - 36e5),
            },
            {
              name: "chart-renderer",
              version: "1.0.0",
              description:
                "Interactive chart rendering with multiple visualization types",
              author: "DataPrism Team",
              category: "visualization",
              status: "active",
              capabilities: ["render", "export", "getTypes", "update"],
              permissions: ["data:read", "dom:write"],
              memoryUsage: 22.8,
              lastUsed: new Date(Date.now() - 18e5),
            },
            {
              name: "llm-integration",
              version: "1.0.0",
              description:
                "LLM integration with multiple providers and intelligent caching",
              author: "DataPrism Team",
              category: "integration",
              status: "active",
              capabilities: ["completion", "analyze", "query", "embedding"],
              permissions: ["network:read", "network:write", "data:read"],
              memoryUsage: 45.1,
              lastUsed: new Date(Date.now() - 9e5),
            },
            {
              name: "performance-monitor",
              version: "1.0.0",
              description:
                "System performance monitoring and security scanning",
              author: "DataPrism Team",
              category: "utility",
              status: "active",
              capabilities: [
                "getStatus",
                "healthCheck",
                "securityScan",
                "optimize",
              ],
              permissions: ["core:read", "data:read", "storage:write"],
              memoryUsage: 8.7,
              lastUsed: new Date(Date.now() - 3e5),
            },
            {
              name: "data-validator",
              version: "0.9.0",
              description: "Advanced data validation and quality assessment",
              author: "Community",
              category: "data-processing",
              status: "inactive",
              capabilities: ["validate", "profile", "clean"],
              permissions: ["data:read"],
              memoryUsage: 0,
              lastUsed: null,
            },
          ],
          [],
        );
      (0, r.useEffect)(() => {
        a(d);
      }, [d]);
      const f = async (e, t) => {
          if (n) {
            c(`${t}-${e}`);
            try {
              const r = n.getPluginManager();
              switch (t) {
                case "activate":
                  await r.activatePlugin(e);
                  break;
                case "deactivate":
                  await r.deactivatePlugin(e);
                  break;
                case "load":
                  await r.loadPlugin(e);
                  break;
                case "unload":
                  await r.unloadPlugin(e);
              }
              a((n) =>
                n.map((n) =>
                  n.name === e
                    ? {
                        ...n,
                        status:
                          "activate" === t || "load" === t
                            ? "active"
                            : "inactive",
                      }
                    : n,
                ),
              );
            } catch (r) {
              (console.error(`${t} failed:`, r),
                alert(`Failed to ${t} plugin: ${e}`));
            } finally {
              c(null);
            }
          }
        },
        p = (e) => {
          const n = t.find((n) => n.name === e);
          (i(e), s(n));
        },
        h = (e) =>
          ({
            "data-processing": "\ud83d\udcca",
            visualization: "\ud83d\udcc8",
            integration: "\ud83d\udd17",
            utility: "\ud83d\udd27",
          })[e] || "\ud83d\udd0c",
        m = (e) => {
          switch (e) {
            case "active":
              return "#28a745";
            case "inactive":
            default:
              return "#6c757d";
            case "error":
              return "#dc3545";
          }
        };
      return (0, l.jsxs)("div", {
        children: [
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h2", { children: "\ud83d\udd0c Plugin Manager" }),
              (0, l.jsx)("p", {
                children:
                  "Manage and monitor DataPrism plugins, their status, and resource usage.",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-3",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Plugin Summary" }),
                      (0, l.jsxs)("div", {
                        style: { fontSize: "0.9rem" },
                        children: [
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "Total Plugins:",
                              }),
                              " ",
                              t.length,
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", { children: "Active:" }),
                              " ",
                              t.filter((e) => "active" === e.status).length,
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", { children: "Inactive:" }),
                              " ",
                              t.filter((e) => "inactive" === e.status).length,
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Resource Usage" }),
                      (0, l.jsxs)("div", {
                        style: { fontSize: "0.9rem" },
                        children: [
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "Total Memory:",
                              }),
                              " ",
                              t
                                .filter((e) => "active" === e.status)
                                .reduce((e, n) => e + n.memoryUsage, 0)
                                .toFixed(1),
                              " MB",
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "Active Processes:",
                              }),
                              " ",
                              t.filter((e) => "active" === e.status).length,
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Categories" }),
                      (0, l.jsx)("div", {
                        style: { fontSize: "0.9rem" },
                        children: [
                          "data-processing",
                          "visualization",
                          "integration",
                          "utility",
                        ].map((e) =>
                          (0, l.jsxs)(
                            "div",
                            {
                              children: [
                                (0, l.jsxs)("strong", {
                                  children: [
                                    h(e),
                                    " ",
                                    e.replace("-", " "),
                                    ":",
                                  ],
                                }),
                                " ",
                                t.filter((n) => n.category === e).length,
                              ],
                            },
                            e,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", { children: "\ud83d\udccb Plugin List" }),
              (0, l.jsx)("div", {
                className: "data-table",
                style: { display: "block", overflowX: "auto" },
                children: (0, l.jsxs)("table", {
                  style: { width: "100%", minWidth: "800px" },
                  children: [
                    (0, l.jsx)("thead", {
                      children: (0, l.jsxs)("tr", {
                        children: [
                          (0, l.jsx)("th", { children: "Plugin" }),
                          (0, l.jsx)("th", { children: "Status" }),
                          (0, l.jsx)("th", { children: "Category" }),
                          (0, l.jsx)("th", { children: "Version" }),
                          (0, l.jsx)("th", { children: "Memory" }),
                          (0, l.jsx)("th", { children: "Last Used" }),
                          (0, l.jsx)("th", { children: "Actions" }),
                        ],
                      }),
                    }),
                    (0, l.jsx)("tbody", {
                      children: t.map((e) =>
                        (0, l.jsxs)(
                          "tr",
                          {
                            children: [
                              (0, l.jsx)("td", {
                                children: (0, l.jsxs)("div", {
                                  children: [
                                    (0, l.jsxs)("div", {
                                      style: {
                                        fontWeight: "bold",
                                        cursor: "pointer",
                                      },
                                      onClick: () => p(e.name),
                                      children: [h(e.category), " ", e.name],
                                    }),
                                    (0, l.jsxs)("div", {
                                      style: {
                                        fontSize: "0.8rem",
                                        color: "#666",
                                      },
                                      children: ["by ", e.author],
                                    }),
                                  ],
                                }),
                              }),
                              (0, l.jsx)("td", {
                                children: (0, l.jsxs)("div", {
                                  style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  },
                                  children: [
                                    (0, l.jsx)("span", {
                                      className: "status-indicator",
                                      style: { backgroundColor: m(e.status) },
                                    }),
                                    (0, l.jsx)("span", {
                                      style: { textTransform: "capitalize" },
                                      children: e.status,
                                    }),
                                  ],
                                }),
                              }),
                              (0, l.jsx)("td", {
                                style: { textTransform: "capitalize" },
                                children: e.category.replace("-", " "),
                              }),
                              (0, l.jsx)("td", { children: e.version }),
                              (0, l.jsx)("td", {
                                children:
                                  "active" === e.status
                                    ? `${e.memoryUsage.toFixed(1)} MB`
                                    : "-",
                              }),
                              (0, l.jsx)("td", {
                                children: e.lastUsed
                                  ? new Date(e.lastUsed).toLocaleString()
                                  : "Never",
                              }),
                              (0, l.jsx)("td", {
                                children: (0, l.jsxs)("div", {
                                  style: { display: "flex", gap: "0.5rem" },
                                  children: [
                                    "active" === e.status
                                      ? (0, l.jsx)("button", {
                                          className: "btn btn-warning",
                                          style: {
                                            fontSize: "0.8rem",
                                            padding: "0.25rem 0.5rem",
                                          },
                                          onClick: () =>
                                            f(e.name, "deactivate"),
                                          disabled:
                                            u === `deactivate-${e.name}`,
                                          children:
                                            u === `deactivate-${e.name}`
                                              ? "\u23f3"
                                              : "\u23f8\ufe0f Deactivate",
                                        })
                                      : (0, l.jsx)("button", {
                                          className: "btn btn-success",
                                          style: {
                                            fontSize: "0.8rem",
                                            padding: "0.25rem 0.5rem",
                                          },
                                          onClick: () => f(e.name, "activate"),
                                          disabled: u === `activate-${e.name}`,
                                          children:
                                            u === `activate-${e.name}`
                                              ? "\u23f3"
                                              : "\u25b6\ufe0f Activate",
                                        }),
                                    (0, l.jsx)("button", {
                                      className: "btn btn-primary",
                                      style: {
                                        fontSize: "0.8rem",
                                        padding: "0.25rem 0.5rem",
                                      },
                                      onClick: () => p(e.name),
                                      children: "\u2139\ufe0f Details",
                                    }),
                                  ],
                                }),
                              }),
                            ],
                          },
                          e.name,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
            ],
          }),
          o &&
            (0, l.jsxs)("div", {
              className: "component-card",
              children: [
                (0, l.jsxs)("h3", {
                  children: ["\ud83d\udd0d Plugin Details: ", o.name],
                }),
                (0, l.jsxs)("div", {
                  className: "grid grid-2",
                  children: [
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsx)("h4", { children: "Basic Information" }),
                        (0, l.jsxs)("div", {
                          style: { fontSize: "0.9rem" },
                          children: [
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", { children: "Name:" }),
                                " ",
                                o.name,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", { children: "Version:" }),
                                " ",
                                o.version,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", { children: "Author:" }),
                                " ",
                                o.author,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", { children: "Category:" }),
                                " ",
                                o.category,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", { children: "Status:" }),
                                (0, l.jsx)("span", {
                                  style: {
                                    color: m(o.status),
                                    marginLeft: "0.5rem",
                                    textTransform: "capitalize",
                                  },
                                  children: o.status,
                                }),
                              ],
                            }),
                          ],
                        }),
                        (0, l.jsx)("h4", {
                          style: { marginTop: "1rem" },
                          children: "Description",
                        }),
                        (0, l.jsx)("p", {
                          style: { fontSize: "0.9rem" },
                          children: o.description,
                        }),
                      ],
                    }),
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsx)("h4", { children: "Resource Usage" }),
                        (0, l.jsxs)("div", {
                          style: { fontSize: "0.9rem" },
                          children: [
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", {
                                  children: "Memory Usage:",
                                }),
                                " ",
                                o.memoryUsage.toFixed(1),
                                " MB",
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", {
                                  children: "Last Used:",
                                }),
                                " ",
                                o.lastUsed
                                  ? new Date(o.lastUsed).toLocaleString()
                                  : "Never",
                              ],
                            }),
                          ],
                        }),
                        (0, l.jsx)("h4", {
                          style: { marginTop: "1rem" },
                          children: "Permissions",
                        }),
                        (0, l.jsx)("ul", {
                          style: {
                            fontSize: "0.9rem",
                            margin: "0.5rem 0",
                            paddingLeft: "1.5rem",
                          },
                          children: o.permissions.map((e) =>
                            (0, l.jsx)("li", { children: e }, e),
                          ),
                        }),
                        (0, l.jsx)("h4", {
                          style: { marginTop: "1rem" },
                          children: "Capabilities",
                        }),
                        (0, l.jsx)("div", {
                          style: {
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          },
                          children: o.capabilities.map((e) =>
                            (0, l.jsx)(
                              "span",
                              {
                                style: {
                                  background: "#e9ecef",
                                  padding: "0.25rem 0.5rem",
                                  borderRadius: "4px",
                                  fontSize: "0.8rem",
                                  fontFamily: "monospace",
                                },
                                children: e,
                              },
                              e,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, l.jsxs)("div", {
                  style: { marginTop: "1rem", display: "flex", gap: "1rem" },
                  children: [
                    "active" === o.status
                      ? (0, l.jsx)("button", {
                          className: "btn btn-warning",
                          onClick: () => f(o.name, "deactivate"),
                          disabled: u === `deactivate-${o.name}`,
                          children:
                            u === `deactivate-${o.name}`
                              ? "\u23f3 Deactivating..."
                              : "\u23f8\ufe0f Deactivate Plugin",
                        })
                      : (0, l.jsx)("button", {
                          className: "btn btn-success",
                          onClick: () => f(o.name, "activate"),
                          disabled: u === `activate-${o.name}`,
                          children:
                            u === `activate-${o.name}`
                              ? "\u23f3 Activating..."
                              : "\u25b6\ufe0f Activate Plugin",
                        }),
                    (0, l.jsx)("button", {
                      className: "btn btn-secondary",
                      onClick: () => s(null),
                      children: "\u2716\ufe0f Close Details",
                    }),
                  ],
                }),
              ],
            }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", {
                children: "\u2139\ufe0f About Plugin Management",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Plugin Lifecycle:" }),
                      (0, l.jsxs)("ol", {
                        style: { fontSize: "0.9rem" },
                        children: [
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", { children: "Register:" }),
                              " Add plugin to the system",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", { children: "Load:" }),
                              " Initialize plugin code",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", { children: "Activate:" }),
                              " Start plugin execution",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", { children: "Deactivate:" }),
                              " Stop plugin execution",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", { children: "Unload:" }),
                              " Remove from memory",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Plugin Categories:" }),
                      (0, l.jsxs)("ul", {
                        style: { fontSize: "0.9rem" },
                        children: [
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "\ud83d\udcca Data Processing:",
                              }),
                              " CSV, JSON, data validation",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "\ud83d\udcc8 Visualization:",
                              }),
                              " Charts, graphs, dashboards",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "\ud83d\udd17 Integration:",
                              }),
                              " APIs, LLMs, external services",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "\ud83d\udd27 Utility:",
                              }),
                              " Monitoring, security, performance",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, l.jsxs)("div", {
                style: {
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "#e7f3ff",
                  borderRadius: "6px",
                },
                children: [
                  (0, l.jsx)("strong", { children: "\ud83d\udca1 Tips:" }),
                  (0, l.jsxs)("ul", {
                    style: { marginTop: "0.5rem", marginBottom: 0 },
                    children: [
                      (0, l.jsx)("li", {
                        children:
                          "Click on plugin names to view detailed information",
                      }),
                      (0, l.jsx)("li", {
                        children:
                          "Monitor memory usage to optimize system performance",
                      }),
                      (0, l.jsx)("li", {
                        children:
                          "Deactivate unused plugins to free up resources",
                      }),
                      (0, l.jsx)("li", {
                        children:
                          "Check the last used timestamp to identify inactive plugins",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    },
    o = (e) => {
      var n, t, a, i, o;
      let { pluginSystem: s } = e;
      const [u, c] = (0, r.useState)(
          "name,age,city,salary\nJohn Doe,30,New York,50000\nJane Smith,25,Los Angeles,60000\nBob Johnson,35,Chicago,55000\nAlice Brown,28,Houston,52000",
        ),
        [d, f] = (0, r.useState)(null),
        [p, h] = (0, r.useState)(null),
        [m, g] = (0, r.useState)(null),
        [v, y] = (0, r.useState)(null),
        x = (e, n) => {
          if (!e || 0 === e.length) return null;
          const t = Object.keys(e[0]);
          return (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", { children: n }),
              (0, l.jsx)("div", {
                style: { overflowX: "auto" },
                children: (0, l.jsxs)("table", {
                  className: "data-table",
                  children: [
                    (0, l.jsx)("thead", {
                      children: (0, l.jsx)("tr", {
                        children: t.map((e) =>
                          (0, l.jsx)("th", { children: e }, e),
                        ),
                      }),
                    }),
                    (0, l.jsx)("tbody", {
                      children: e.map((e, n) =>
                        (0, l.jsx)(
                          "tr",
                          {
                            children: t.map((n) =>
                              (0, l.jsx)("td", { children: String(e[n]) }, n),
                            ),
                          },
                          n,
                        ),
                      ),
                    }),
                  ],
                }),
              }),
            ],
          });
        };
      return (0, l.jsxs)("div", {
        children: [
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h2", { children: "\ud83d\udcca CSV Data Processor" }),
              (0, l.jsx)("p", {
                children:
                  "Process and transform CSV data using the DataPrism CSV Processor Plugin.",
              }),
              (0, l.jsxs)("div", {
                className: "form-group",
                children: [
                  (0, l.jsx)("label", {
                    htmlFor: "csv-input",
                    children: "CSV Data:",
                  }),
                  (0, l.jsx)("textarea", {
                    id: "csv-input",
                    value: u,
                    onChange: (e) => c(e.target.value),
                    placeholder: "Enter CSV data here...",
                    rows: 8,
                  }),
                ],
              }),
              (0, l.jsxs)("div", {
                style: { display: "flex", gap: "1rem", flexWrap: "wrap" },
                children: [
                  (0, l.jsx)("button", {
                    className: "btn btn-primary",
                    onClick: async () => {
                      if (s) {
                        y("parse");
                        try {
                          const e = await s
                            .getPluginManager()
                            .executePlugin("csv-processor", "parse", {
                              data: u,
                              options: { hasHeader: !0, delimiter: "," },
                            });
                          f(e);
                        } catch (e) {
                          (console.error("Parse failed:", e),
                            alert("Failed to parse CSV data"));
                        } finally {
                          y(null);
                        }
                      }
                    },
                    disabled: "parse" === v || !u.trim(),
                    children:
                      "parse" === v
                        ? "\u23f3 Parsing..."
                        : "\ud83d\udd0d Parse CSV",
                  }),
                  (0, l.jsx)("button", {
                    className: "btn btn-secondary",
                    onClick: async () => {
                      if (s && d) {
                        y("validate");
                        try {
                          const e = await s
                            .getPluginManager()
                            .executePlugin("csv-processor", "validate", {
                              dataset: d,
                            });
                          h(e);
                        } catch (e) {
                          (console.error("Validation failed:", e),
                            alert("Failed to validate data"));
                        } finally {
                          y(null);
                        }
                      }
                    },
                    disabled: "validate" === v || !d,
                    children:
                      "validate" === v
                        ? "\u23f3 Validating..."
                        : "\u2705 Validate Data",
                  }),
                  (0, l.jsx)("button", {
                    className: "btn btn-success",
                    onClick: async () => {
                      if (s && d) {
                        y("transform");
                        try {
                          const e = await s
                            .getPluginManager()
                            .executePlugin("csv-processor", "transform", {
                              dataset: d,
                              rules: [
                                {
                                  field: "name",
                                  operation: "uppercase",
                                  parameters: {},
                                },
                                {
                                  field: "salary",
                                  operation: "multiply",
                                  parameters: { factor: 1.1 },
                                },
                              ],
                            });
                          g(e);
                        } catch (e) {
                          (console.error("Transform failed:", e),
                            alert("Failed to transform data"));
                        } finally {
                          y(null);
                        }
                      }
                    },
                    disabled: "transform" === v || !d,
                    children:
                      "transform" === v
                        ? "\u23f3 Transforming..."
                        : "\ud83d\udd04 Transform Data",
                  }),
                ],
              }),
            ],
          }),
          d && x(d.data, `\ud83d\udccb Parsed Data (${d.data.length} rows)`),
          p &&
            (0, l.jsxs)("div", {
              className: "component-card",
              children: [
                (0, l.jsx)("h3", { children: "\u2705 Validation Results" }),
                (0, l.jsxs)("div", {
                  className: "grid grid-2",
                  children: [
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsxs)("p", {
                          children: [
                            (0, l.jsx)("strong", { children: "Status:" }),
                            " ",
                            (0, l.jsx)("span", {
                              className:
                                "status " +
                                (p.isValid ? "healthy" : "critical"),
                              children: p.isValid ? "Valid" : "Invalid",
                            }),
                          ],
                        }),
                        (0, l.jsxs)("p", {
                          children: [
                            (0, l.jsx)("strong", { children: "Total Rows:" }),
                            " ",
                            null === (n = p.statistics) || void 0 === n
                              ? void 0
                              : n.totalRows,
                          ],
                        }),
                        (0, l.jsxs)("p", {
                          children: [
                            (0, l.jsx)("strong", { children: "Valid Rows:" }),
                            " ",
                            null === (t = p.statistics) || void 0 === t
                              ? void 0
                              : t.validRows,
                          ],
                        }),
                        (0, l.jsxs)("p", {
                          children: [
                            (0, l.jsx)("strong", { children: "Error Rows:" }),
                            " ",
                            null === (a = p.statistics) || void 0 === a
                              ? void 0
                              : a.errorRows,
                          ],
                        }),
                      ],
                    }),
                    (0, l.jsxs)("div", {
                      children: [
                        (null === (i = p.warnings) || void 0 === i
                          ? void 0
                          : i.length) > 0 &&
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("p", {
                                children: (0, l.jsx)("strong", {
                                  children: "Warnings:",
                                }),
                              }),
                              (0, l.jsx)("ul", {
                                children: p.warnings.map((e, n) =>
                                  (0, l.jsx)("li", { children: e }, n),
                                ),
                              }),
                            ],
                          }),
                        (null === (o = p.errors) || void 0 === o
                          ? void 0
                          : o.length) > 0 &&
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("p", {
                                children: (0, l.jsx)("strong", {
                                  children: "Errors:",
                                }),
                              }),
                              (0, l.jsx)("ul", {
                                children: p.errors.map((e, n) =>
                                  (0, l.jsx)(
                                    "li",
                                    {
                                      style: { color: "#dc3545" },
                                      children: e,
                                    },
                                    n,
                                  ),
                                ),
                              }),
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          m && x(m.data, "\ud83d\udd04 Transformed Data"),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", {
                children: "\u2139\ufe0f About CSV Processor Plugin",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Features:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 CSV parsing with configurable delimiters",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Data validation and quality checks",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Statistical transformations",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Batch and streaming processing",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Error handling and metrics",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Supported Operations:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "parse" }),
                              " - Parse CSV text into structured data",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "validate" }),
                              " - Validate data quality and integrity",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "transform" }),
                              " - Apply transformation rules",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "batch" }),
                              " - Process multiple datasets",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "stream" }),
                              " - Process data streams",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    },
    s = (e) => {
      let { pluginSystem: n } = e;
      const [t, a] = (0, r.useState)([]),
        [i, o] = (0, r.useState)("bar"),
        [s, u] = (0, r.useState)(null),
        [c, d] = (0, r.useState)(null),
        [f, p] = (0, r.useState)(null),
        [h, m] = (0, r.useState)(0),
        [g, v] = (0, r.useState)(""),
        y = {
          id: "sample_sales",
          name: "Sales Data",
          data: [
            {
              product: "Laptop",
              category: "Electronics",
              sales: 1200,
              month: "Jan",
            },
            {
              product: "Phone",
              category: "Electronics",
              sales: 800,
              month: "Jan",
            },
            {
              product: "Desk",
              category: "Furniture",
              sales: 300,
              month: "Jan",
            },
            {
              product: "Chair",
              category: "Furniture",
              sales: 250,
              month: "Jan",
            },
            {
              product: "Monitor",
              category: "Electronics",
              sales: 600,
              month: "Jan",
            },
          ],
          metadata: { source: "sales_system" },
        };
      (0, r.useEffect)(() => {
        (async () => {
          if (n)
            try {
              const e = await n
                .getPluginManager()
                .executePlugin("chart-renderer", "getTypes");
              a(e);
            } catch (e) {
              console.error("Failed to load chart types:", e);
            }
        })();
      }, [n]);
      const x = async (e) => {
          if (n && s) {
            p("export");
            try {
              const t = await n
                .getPluginManager()
                .executePlugin("chart-renderer", "export", { format: e });
              d(t);
            } catch (t) {
              (console.error("Chart export failed:", t),
                alert("Failed to export chart"));
            } finally {
              p(null);
            }
          }
        },
        b = () => {
          const e = y.data;
          switch (i) {
            case "bar":
            default:
              return w(e);
            case "line":
              return k(e);
            case "pie":
              return S(e);
            case "scatter":
              return j(e);
          }
        },
        w = (e) => {
          const n = Math.max(...e.map((e) => e.sales));
          let t = "",
            r = "",
            a = "";
          return (
            e.forEach((e, l) => {
              const i = (e.sales / n) * 200,
                o = 50 + 80 * l,
                s = 250 - i;
              ((t += `<rect x="${o}" y="${s}" width="60" height="${i}" fill="${`hsl(${200 + 30 * l}, 70%, 50%)`}" rx="4"/>`),
                (r += `<text x="${o + 30}" y="270" text-anchor="middle" font-size="12" fill="#666">${e.product}</text>`),
                (a += `<text x="${o + 30}" y="${s - 5}" text-anchor="middle" font-size="10" fill="#333">${e.sales}</text>`));
            }),
            `\n      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">\n        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales by Product (Bar Chart)</text>\n        ${t}\n        ${r}\n        ${a}\n      </svg>\n    `
          );
        },
        k = (e) => {
          const n = e.map((e, n) => ({
              x: 50 + 80 * n,
              y: 250 - (e.sales / 1200) * 180,
            })),
            t =
              `M ${n[0].x} ${n[0].y} ` +
              n
                .slice(1)
                .map((e) => `L ${e.x} ${e.y}`)
                .join(" ");
          let r = "",
            a = "";
          return (
            n.forEach((n, t) => {
              ((r += `<circle cx="${n.x}" cy="${n.y}" r="4" fill="#667eea"/>`),
                (a += `<text x="${n.x}" y="270" text-anchor="middle" font-size="10" fill="#666">${e[t].product}</text>`));
            }),
            `\n      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">\n        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales Trend (Line Chart)</text>\n        <path d="${t}" stroke="#667eea" stroke-width="3" fill="none"/>\n        ${r}\n        ${a}\n      </svg>\n    `
          );
        },
        S = (e) => {
          const n = e.reduce((e, n) => e + n.sales, 0),
            t = 250,
            r = 150,
            a = 80;
          let l = "",
            i = "",
            o = 0;
          return (
            e.forEach((e, s) => {
              const u = (e.sales / n) * 2 * Math.PI,
                c = o + u,
                d = t + a * Math.cos(o),
                f = r + a * Math.sin(o),
                p = t + a * Math.cos(c),
                h = r + a * Math.sin(c),
                m = `hsl(${60 * s}, 70%, 60%)`,
                g = [
                  "M 250 150",
                  `L ${d} ${f}`,
                  `A 80 80 0 ${u > Math.PI ? 1 : 0} 1 ${p} ${h}`,
                  "Z",
                ].join(" ");
              l += `<path d="${g}" fill="${m}" stroke="white" stroke-width="2"/>`;
              const v = o + u / 2,
                y = t + 100 * Math.cos(v),
                x = r + 100 * Math.sin(v);
              ((i += `<text x="${y}" y="${x}" text-anchor="middle" font-size="10" fill="#333">${e.product}</text>`),
                (o = c));
            }),
            `\n      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">\n        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales Distribution (Pie Chart)</text>\n        ${l}\n        ${i}\n      </svg>\n    `
          );
        },
        j = (e) => {
          let n = "",
            t = "";
          return (
            e.forEach((e, r) => {
              const a = 50 + 400 * Math.random(),
                l = 50 + 200 * Math.random(),
                i = (e.sales / 1200) * 15 + 5;
              ((n += `<circle cx="${a}" cy="${l}" r="${i}" fill="${`hsl(${60 * r}, 70%, 60%)`}" opacity="0.7"/>`),
                (t += `<text x="${a}" y="${l + i + 15}" text-anchor="middle" font-size="10" fill="#333">${e.product}</text>`));
            }),
            `\n      <svg width="100%" height="300" viewBox="0 0 500 300" style="background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px;">\n        <text x="250" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">Sales Scatter Plot</text>\n        ${n}\n        ${t}\n      </svg>\n    `
          );
        };
      return (0, l.jsxs)("div", {
        children: [
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h2", {
                children: "\ud83d\udcc8 Chart Visualization",
              }),
              (0, l.jsx)("p", {
                children:
                  "Create interactive visualizations using the DataPrism Chart Renderer Plugin.",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsxs)("div", {
                        className: "form-group",
                        children: [
                          (0, l.jsx)("label", {
                            htmlFor: "chart-type",
                            children: "Chart Type:",
                          }),
                          (0, l.jsx)("select", {
                            id: "chart-type",
                            value: i,
                            onChange: (e) => o(e.target.value),
                            children: t.map((e) =>
                              (0, l.jsx)(
                                "option",
                                { value: e.name, children: e.description },
                                e.name,
                              ),
                            ),
                          }),
                        ],
                      }),
                      (0, l.jsx)("button", {
                        className: "btn btn-primary",
                        onClick: async () => {
                          if (n) {
                            p("render");
                            try {
                              const e = await n
                                .getPluginManager()
                                .executePlugin("chart-renderer", "render", {
                                  container: null,
                                  data: y,
                                  config: {
                                    chartType: i,
                                    theme: "light",
                                    responsive: !0,
                                    animation: !0,
                                  },
                                });
                              (u(e), m((e) => e + 1));
                              const t = b();
                              v(t);
                            } catch (e) {
                              (console.error("Chart rendering failed:", e),
                                alert("Failed to render chart"));
                            } finally {
                              p(null);
                            }
                          }
                        },
                        disabled: "render" === f,
                        style: { marginBottom: "1rem" },
                        children:
                          "render" === f
                            ? "\u23f3 Rendering..."
                            : "\ud83c\udfa8 Render Chart",
                      }),
                      s &&
                        (0, l.jsxs)("div", {
                          children: [
                            (0, l.jsx)("h4", { children: "Export Options:" }),
                            (0, l.jsxs)("div", {
                              style: {
                                display: "flex",
                                gap: "0.5rem",
                                flexWrap: "wrap",
                              },
                              children: [
                                (0, l.jsx)("button", {
                                  className: "btn btn-secondary",
                                  onClick: () => x("svg"),
                                  disabled: "export" === f,
                                  children: "\ud83d\udcc4 SVG",
                                }),
                                (0, l.jsx)("button", {
                                  className: "btn btn-secondary",
                                  onClick: () => x("png"),
                                  disabled: "export" === f,
                                  children: "\ud83d\uddbc\ufe0f PNG",
                                }),
                                (0, l.jsx)("button", {
                                  className: "btn btn-secondary",
                                  onClick: () => x("pdf"),
                                  disabled: "export" === f,
                                  children: "\ud83d\udccb PDF",
                                }),
                              ],
                            }),
                          ],
                        }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Sample Data:" }),
                      (0, l.jsx)("div", {
                        style: {
                          fontSize: "0.9rem",
                          background: "#f8f9fa",
                          padding: "1rem",
                          borderRadius: "6px",
                        },
                        children: (0, l.jsx)("pre", {
                          children: JSON.stringify(y.data, null, 2),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", { children: "\ud83d\udcca Chart Preview" }),
              (0, l.jsx)(
                "div",
                {
                  className: "chart-container",
                  children: s
                    ? (0, l.jsx)("div", {
                        dangerouslySetInnerHTML: { __html: g },
                      })
                    : (0, l.jsx)("div", {
                        style: { textAlign: "center", color: "#666" },
                        children: (0, l.jsx)("p", {
                          children:
                            '\ud83d\udcc8 Select a chart type and click "Render Chart" to generate visualization',
                        }),
                      }),
                },
                h,
              ),
            ],
          }),
          c &&
            (0, l.jsxs)("div", {
              className: "component-card",
              children: [
                (0, l.jsx)("h3", { children: "\ud83d\udcbe Export Result" }),
                (0, l.jsxs)("div", {
                  className: "result-container",
                  children: [
                    (0, l.jsxs)("p", {
                      children: [
                        (0, l.jsx)("strong", { children: "Format:" }),
                        " ",
                        c.type,
                      ],
                    }),
                    (0, l.jsxs)("p", {
                      children: [
                        (0, l.jsx)("strong", { children: "Size:" }),
                        " ",
                        c.size,
                      ],
                    }),
                    (0, l.jsxs)("p", {
                      children: [
                        (0, l.jsx)("strong", { children: "Generated:" }),
                        " ",
                        new Date().toLocaleString(),
                      ],
                    }),
                    "svg" === c.type &&
                      (0, l.jsxs)("div", {
                        children: [
                          (0, l.jsx)("h4", { children: "SVG Preview:" }),
                          (0, l.jsx)("pre", {
                            style: { maxHeight: "200px", overflow: "auto" },
                            children: c.data,
                          }),
                        ],
                      }),
                  ],
                }),
              ],
            }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", {
                children: "\u2139\ufe0f About Chart Renderer Plugin",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Features:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Multiple chart types (bar, line, pie, scatter)",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Interactive features (tooltips, zoom, pan)",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Export capabilities (SVG, PNG, PDF)",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Responsive design and theming",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Real-time updates",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Supported Operations:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "render" }),
                              " - Render charts in containers",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "getTypes" }),
                              " - Get available chart types",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "export" }),
                              " - Export charts to various formats",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "update" }),
                              " - Update existing charts",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "setConfig" }),
                              " - Configure chart settings",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    },
    u = (e) => {
      let { pluginSystem: n } = e;
      const [t, a] = (0, r.useState)([]),
        [i, o] = (0, r.useState)("openai"),
        [s, u] = (0, r.useState)(
          "Explain the benefits of data visualization in business analytics.",
        ),
        [c, d] = (0, r.useState)(null),
        [f, p] = (0, r.useState)(null),
        [h, m] = (0, r.useState)("What is the average salary by city?"),
        [g, v] = (0, r.useState)(null),
        [y, x] = (0, r.useState)(null),
        b = {
          id: "employee_data",
          name: "Employee Data",
          data: [
            {
              name: "John Doe",
              age: 30,
              city: "New York",
              salary: 55e3,
              department: "Engineering",
            },
            {
              name: "Jane Smith",
              age: 25,
              city: "Los Angeles",
              salary: 66e3,
              department: "Design",
            },
            {
              name: "Bob Johnson",
              age: 35,
              city: "Chicago",
              salary: 60500,
              department: "Engineering",
            },
            {
              name: "Alice Brown",
              age: 28,
              city: "Houston",
              salary: 57200,
              department: "Marketing",
            },
            {
              name: "Charlie Wilson",
              age: 32,
              city: "New York",
              salary: 72e3,
              department: "Engineering",
            },
          ],
          metadata: {
            source: "hr_system",
            createdAt: new Date().toISOString(),
          },
        };
      (0, r.useEffect)(() => {
        (async () => {
          if (n)
            try {
              const e = await n
                .getPluginManager()
                .executePlugin("llm-integration", "providers");
              a(e);
            } catch (e) {
              console.error("Failed to load providers:", e);
            }
        })();
      }, [n]);
      return (0, l.jsxs)("div", {
        children: [
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h2", { children: "\ud83e\udd16 LLM Integration" }),
              (0, l.jsx)("p", {
                children:
                  "Leverage AI language models for data analysis and natural language processing.",
              }),
              (0, l.jsxs)("div", {
                className: "form-group",
                children: [
                  (0, l.jsx)("label", {
                    htmlFor: "provider-select",
                    children: "LLM Provider:",
                  }),
                  (0, l.jsx)("select", {
                    id: "provider-select",
                    value: i,
                    onChange: (e) => o(e.target.value),
                    children: t.map((e) => {
                      var n;
                      return (0, l.jsxs)(
                        "option",
                        {
                          value: e.name,
                          children: [
                            e.name,
                            " (",
                            null === (n = e.models) || void 0 === n
                              ? void 0
                              : n.join(", "),
                            ")",
                          ],
                        },
                        e.name,
                      );
                    }),
                  }),
                ],
              }),
            ],
          }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", { children: "\ud83d\udcac Text Completion" }),
              (0, l.jsxs)("div", {
                className: "form-group",
                children: [
                  (0, l.jsx)("label", {
                    htmlFor: "prompt-input",
                    children: "Prompt:",
                  }),
                  (0, l.jsx)("textarea", {
                    id: "prompt-input",
                    value: s,
                    onChange: (e) => u(e.target.value),
                    placeholder: "Enter your prompt here...",
                    rows: 3,
                  }),
                ],
              }),
              (0, l.jsx)("button", {
                className: "btn btn-primary",
                onClick: async () => {
                  if (n && s.trim()) {
                    x("completion");
                    try {
                      const e = await n
                        .getPluginManager()
                        .executePlugin("llm-integration", "completion", {
                          prompt: s,
                          options: {
                            provider: i,
                            maxTokens: 150,
                            temperature: 0.7,
                          },
                        });
                      d(e);
                    } catch (e) {
                      (console.error("Completion failed:", e),
                        alert("Failed to generate completion"));
                    } finally {
                      x(null);
                    }
                  }
                },
                disabled: "completion" === y || !s.trim(),
                children:
                  "completion" === y
                    ? "\u23f3 Generating..."
                    : "\u2728 Generate Completion",
              }),
              c &&
                (0, l.jsxs)("div", {
                  className: "result-container",
                  children: [
                    (0, l.jsx)("h4", {
                      children: "\ud83d\udcdd Completion Result:",
                    }),
                    (0, l.jsxs)("div", {
                      style: {
                        background: "white",
                        padding: "1rem",
                        borderRadius: "6px",
                        border: "1px solid #e0e0e0",
                      },
                      children: [
                        (0, l.jsx)("p", { children: c.text }),
                        (0, l.jsxs)("div", {
                          style: {
                            fontSize: "0.85rem",
                            color: "#666",
                            marginTop: "1rem",
                          },
                          children: [
                            (0, l.jsx)("strong", { children: "Provider:" }),
                            " ",
                            c.provider,
                            " |",
                            (0, l.jsx)("strong", { children: " Model:" }),
                            " ",
                            c.model,
                            " |",
                            (0, l.jsx)("strong", { children: " Tokens:" }),
                            " ",
                            c.tokens,
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", { children: "\ud83d\udcca Dataset Analysis" }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("p", {
                        children:
                          "Analyze the sample employee dataset using AI to generate insights:",
                      }),
                      (0, l.jsx)("button", {
                        className: "btn btn-success",
                        onClick: async () => {
                          if (n) {
                            x("analysis");
                            try {
                              const e = await n
                                .getPluginManager()
                                .executePlugin("llm-integration", "analyze", {
                                  dataset: b,
                                  options: {
                                    provider: i,
                                    focus:
                                      "salary analysis and employee demographics",
                                  },
                                });
                              p(e);
                            } catch (e) {
                              (console.error("Analysis failed:", e),
                                alert("Failed to analyze dataset"));
                            } finally {
                              x(null);
                            }
                          }
                        },
                        disabled: "analysis" === y,
                        children:
                          "analysis" === y
                            ? "\u23f3 Analyzing..."
                            : "\ud83d\udd0d Analyze Dataset",
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Sample Data Preview:" }),
                      (0, l.jsx)("div", {
                        style: {
                          fontSize: "0.8rem",
                          background: "#f8f9fa",
                          padding: "1rem",
                          borderRadius: "6px",
                          maxHeight: "200px",
                          overflow: "auto",
                        },
                        children: (0, l.jsxs)("pre", {
                          children: [
                            JSON.stringify(b.data.slice(0, 3), null, 2),
                            "...",
                          ],
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              f &&
                (0, l.jsxs)("div", {
                  className: "result-container",
                  children: [
                    (0, l.jsx)("h4", {
                      children: "\ud83c\udfaf Analysis Results:",
                    }),
                    (0, l.jsxs)("div", {
                      className: "grid grid-2",
                      children: [
                        (0, l.jsxs)("div", {
                          children: [
                            (0, l.jsx)("h5", {
                              children: "\ud83d\udca1 Key Insights:",
                            }),
                            (0, l.jsx)("ul", {
                              children: f.insights.map((e, n) =>
                                (0, l.jsx)("li", { children: e }, n),
                              ),
                            }),
                          ],
                        }),
                        (0, l.jsxs)("div", {
                          children: [
                            (0, l.jsx)("h5", {
                              children: "\ud83d\udccb Recommendations:",
                            }),
                            (0, l.jsx)("ul", {
                              children: f.recommendations.map((e, n) =>
                                (0, l.jsx)("li", { children: e }, n),
                              ),
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, l.jsxs)("div", {
                      style: {
                        fontSize: "0.85rem",
                        color: "#666",
                        marginTop: "1rem",
                      },
                      children: [
                        (0, l.jsx)("strong", { children: "Analyzed:" }),
                        " ",
                        new Date(f.metadata.analyzedAt).toLocaleString(),
                        " |",
                        (0, l.jsx)("strong", { children: " Provider:" }),
                        " ",
                        f.metadata.provider,
                      ],
                    }),
                  ],
                }),
            ],
          }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", {
                children: "\ud83d\udcad Natural Language Query",
              }),
              (0, l.jsxs)("div", {
                className: "form-group",
                children: [
                  (0, l.jsx)("label", {
                    htmlFor: "query-input",
                    children: "Natural Language Query:",
                  }),
                  (0, l.jsx)("input", {
                    id: "query-input",
                    type: "text",
                    value: h,
                    onChange: (e) => m(e.target.value),
                    placeholder: "Ask a question about the data...",
                  }),
                ],
              }),
              (0, l.jsx)("button", {
                className: "btn btn-primary",
                onClick: async () => {
                  if (n && h.trim()) {
                    x("query");
                    try {
                      const e = await n
                        .getPluginManager()
                        .executePlugin("llm-integration", "query", {
                          query: h,
                          dataset: b,
                          options: { provider: i },
                        });
                      v(e);
                    } catch (e) {
                      (console.error("Query processing failed:", e),
                        alert("Failed to process query"));
                    } finally {
                      x(null);
                    }
                  }
                },
                disabled: "query" === y || !h.trim(),
                children:
                  "query" === y
                    ? "\u23f3 Processing..."
                    : "\ud83d\udd0d Process Query",
              }),
              (0, l.jsxs)("div", {
                style: { marginTop: "1rem" },
                children: [
                  (0, l.jsx)("h4", {
                    children: "Example queries you can try:",
                  }),
                  (0, l.jsx)("div", {
                    style: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
                    children: [
                      "What is the average salary by department?",
                      "Who are the highest paid employees?",
                      "How many employees work in each city?",
                      "What is the age distribution?",
                    ].map((e) =>
                      (0, l.jsx)(
                        "button",
                        {
                          className: "btn btn-secondary",
                          style: { fontSize: "0.8rem", padding: "0.5rem 1rem" },
                          onClick: () => m(e),
                          children: e,
                        },
                        e,
                      ),
                    ),
                  }),
                ],
              }),
              g &&
                (0, l.jsxs)("div", {
                  className: "result-container",
                  children: [
                    (0, l.jsx)("h4", {
                      children: "\ud83d\udd0d Query Processing Result:",
                    }),
                    (0, l.jsxs)("div", {
                      className: "grid grid-2",
                      children: [
                        (0, l.jsxs)("div", {
                          children: [
                            (0, l.jsx)("h5", {
                              children: "\ud83c\udfaf Interpretation:",
                            }),
                            (0, l.jsx)("p", { children: g.interpretation }),
                            (0, l.jsx)("h5", {
                              children: "\ud83d\udca1 Original Query:",
                            }),
                            (0, l.jsxs)("p", {
                              style: { fontStyle: "italic" },
                              children: ['"', g.originalQuery, '"'],
                            }),
                          ],
                        }),
                        (0, l.jsxs)("div", {
                          children: [
                            (0, l.jsx)("h5", {
                              children: "\ud83d\uddc4\ufe0f Suggested SQL:",
                            }),
                            (0, l.jsx)("div", {
                              style: {
                                background: "white",
                                padding: "1rem",
                                borderRadius: "6px",
                                border: "1px solid #e0e0e0",
                              },
                              children: (0, l.jsx)("code", {
                                children: g.suggestedSQL || "No SQL generated",
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, l.jsxs)("div", {
                      style: {
                        fontSize: "0.85rem",
                        color: "#666",
                        marginTop: "1rem",
                      },
                      children: [
                        (0, l.jsx)("strong", { children: "Processed:" }),
                        " ",
                        new Date(g.metadata.processedAt).toLocaleString(),
                      ],
                    }),
                  ],
                }),
            ],
          }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", {
                children: "\u2139\ufe0f About LLM Integration Plugin",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Features:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsx)("li", {
                            children: "\u2705 Multiple LLM provider support",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Intelligent caching and rate limiting",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Data analysis and insight generation",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Natural language query processing",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Error handling and fallbacks",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Supported Operations:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "completion" }),
                              " - Generate text completions",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "analyze" }),
                              " - Analyze datasets for insights",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "query" }),
                              " - Process natural language queries",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "embedding" }),
                              " - Generate text embeddings",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "providers" }),
                              " - List available providers",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, l.jsxs)("div", {
                style: { marginTop: "1.5rem" },
                children: [
                  (0, l.jsx)("h4", { children: "Available Providers:" }),
                  (0, l.jsx)("div", {
                    className: "grid grid-3",
                    children: t.map((e) => {
                      var n;
                      return (0, l.jsxs)(
                        "div",
                        {
                          style: {
                            padding: "1rem",
                            background: "#f8f9fa",
                            borderRadius: "6px",
                          },
                          children: [
                            (0, l.jsx)("h5", {
                              style: {
                                margin: "0 0 0.5rem 0",
                                textTransform: "capitalize",
                              },
                              children: e.name,
                            }),
                            (0, l.jsxs)("p", {
                              style: { fontSize: "0.8rem", margin: 0 },
                              children: [
                                "Models: ",
                                (null === (n = e.models) || void 0 === n
                                  ? void 0
                                  : n.join(", ")) || "N/A",
                              ],
                            }),
                          ],
                        },
                        e.name,
                      );
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      });
    },
    c = (e) => {
      let { pluginSystem: n } = e;
      const [t, a] = (0, r.useState)(null),
        [i, o] = (0, r.useState)(null),
        [s, u] = (0, r.useState)(null),
        [c, d] = (0, r.useState)(null),
        [f, p] = (0, r.useState)(!1);
      ((0, r.useEffect)(() => {
        n &&
          (async () => {
            if (n) {
              d("status");
              try {
                const e = await n
                  .getPluginManager()
                  .executePlugin("performance-monitor", "getStatus");
                a(e);
              } catch (e) {
                console.error("Failed to get system status:", e);
              } finally {
                d(null);
              }
            }
          })();
      }, [n]),
        (0, r.useEffect)(() => {
          let e;
          return (
            f &&
              n &&
              (e = setInterval(() => {
                (async () => {
                  if (n) {
                    d("status");
                    try {
                      const e = await n
                        .getPluginManager()
                        .executePlugin("performance-monitor", "getStatus");
                      a(e);
                    } catch (e) {
                      console.error("Failed to get system status:", e);
                    } finally {
                      d(null);
                    }
                  }
                })();
              }, 5e3)),
            () => {
              e && clearInterval(e);
            }
          );
        }, [f, n]));
      const h = (e) => {
        switch (null === e || void 0 === e ? void 0 : e.toLowerCase()) {
          case "healthy":
            return "#28a745";
          case "warning":
            return "#ffc107";
          case "critical":
            return "#dc3545";
          default:
            return "#6c757d";
        }
      };
      return (0, l.jsxs)("div", {
        children: [
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h2", { children: "\ud83d\udd27 System Monitor" }),
              (0, l.jsx)("p", {
                children:
                  "Monitor system performance, health, and security using the Performance Monitor Plugin.",
              }),
              (0, l.jsxs)("div", {
                style: {
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "1rem",
                },
                children: [
                  (0, l.jsx)("button", {
                    className: "btn btn-primary",
                    onClick: async () => {
                      if (n) {
                        d("status");
                        try {
                          const e = await n
                            .getPluginManager()
                            .executePlugin("performance-monitor", "getStatus");
                          a(e);
                        } catch (e) {
                          console.error("Failed to get system status:", e);
                        } finally {
                          d(null);
                        }
                      }
                    },
                    disabled: "status" === c,
                    children:
                      "status" === c
                        ? "\u23f3 Checking..."
                        : "\ud83d\udcca Get System Status",
                  }),
                  (0, l.jsx)("button", {
                    className: "btn btn-success",
                    onClick: async () => {
                      if (n) {
                        d("health");
                        try {
                          const e = await n
                            .getPluginManager()
                            .executePlugin(
                              "performance-monitor",
                              "healthCheck",
                            );
                          o(e);
                        } catch (e) {
                          (console.error("Health check failed:", e),
                            alert("Health check failed"));
                        } finally {
                          d(null);
                        }
                      }
                    },
                    disabled: "health" === c,
                    children:
                      "health" === c
                        ? "\u23f3 Checking..."
                        : "\ud83c\udfe5 Run Health Check",
                  }),
                  (0, l.jsx)("button", {
                    className: "btn btn-warning",
                    onClick: async () => {
                      if (n) {
                        d("security");
                        try {
                          const e = await n
                            .getPluginManager()
                            .executePlugin(
                              "performance-monitor",
                              "securityScan",
                              { options: { type: "quick" } },
                            );
                          u(e);
                        } catch (e) {
                          (console.error("Security scan failed:", e),
                            alert("Security scan failed"));
                        } finally {
                          d(null);
                        }
                      }
                    },
                    disabled: "security" === c,
                    children:
                      "security" === c
                        ? "\u23f3 Scanning..."
                        : "\ud83d\udd12 Security Scan",
                  }),
                  (0, l.jsxs)("label", {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    },
                    children: [
                      (0, l.jsx)("input", {
                        type: "checkbox",
                        checked: f,
                        onChange: (e) => p(e.target.checked),
                      }),
                      "Auto Refresh (5s)",
                    ],
                  }),
                ],
              }),
            ],
          }),
          t &&
            (0, l.jsxs)("div", {
              className: "component-card",
              children: [
                (0, l.jsx)("h3", { children: "\ud83d\udcca System Status" }),
                (0, l.jsxs)("div", {
                  className: "grid grid-2",
                  children: [
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsxs)("div", {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "1rem",
                          },
                          children: [
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", {
                                  children: "Overall Status:",
                                }),
                                " ",
                                (0, l.jsx)("span", {
                                  style: {
                                    color: h(t.overall),
                                    fontWeight: "bold",
                                    textTransform: "capitalize",
                                  },
                                  children: t.overall,
                                }),
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", { children: "Uptime:" }),
                                " ",
                                ((m = t.uptime),
                                `${Math.floor(m / 36e5)}h ${Math.floor((m % 36e5) / 6e4)}m`),
                              ],
                            }),
                          ],
                        }),
                        (0, l.jsxs)("div", {
                          children: [
                            (0, l.jsx)("strong", { children: "Last Updated:" }),
                            " ",
                            new Date(t.timestamp).toLocaleString(),
                          ],
                        }),
                      ],
                    }),
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsx)("h4", { children: "Component Details:" }),
                        (0, l.jsx)("div", {
                          style: { fontSize: "0.9rem" },
                          children: Object.entries(t.components).map((e) => {
                            var n;
                            let [t, r] = e;
                            return (0, l.jsx)(
                              "div",
                              {
                                style: { marginBottom: "0.5rem" },
                                children: (0, l.jsxs)("div", {
                                  style: {
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                  },
                                  children: [
                                    (0, l.jsx)("span", {
                                      className: "status-indicator",
                                      style: { backgroundColor: h(r.status) },
                                    }),
                                    (0, l.jsxs)("strong", {
                                      style: { textTransform: "capitalize" },
                                      children: [t, ":"],
                                    }),
                                    (0, l.jsxs)("span", {
                                      children: [
                                        null === (n = r.usage) || void 0 === n
                                          ? void 0
                                          : n.toFixed(1),
                                        "%",
                                      ],
                                    }),
                                    (0, l.jsxs)("span", {
                                      style: {
                                        color: h(r.status),
                                        textTransform: "capitalize",
                                      },
                                      children: ["(", r.status, ")"],
                                    }),
                                  ],
                                }),
                              },
                              t,
                            );
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                (0, l.jsxs)("div", {
                  style: { marginTop: "1.5rem" },
                  children: [
                    (0, l.jsx)("h4", { children: "Performance Metrics:" }),
                    (0, l.jsx)("div", {
                      className: "grid grid-3",
                      children: Object.entries(t.components).map((e) => {
                        let [n, t] = e;
                        return (0, l.jsxs)(
                          "div",
                          {
                            style: {
                              padding: "1rem",
                              background: "#f8f9fa",
                              borderRadius: "6px",
                            },
                            children: [
                              (0, l.jsx)("h5", {
                                style: {
                                  margin: "0 0 0.5rem 0",
                                  textTransform: "capitalize",
                                },
                                children: n,
                              }),
                              (0, l.jsxs)("div", {
                                style: { fontSize: "0.8rem" },
                                children: [
                                  (0, l.jsxs)("div", {
                                    children: [
                                      (0, l.jsx)("strong", {
                                        children: "Status:",
                                      }),
                                      " ",
                                      t.status,
                                    ],
                                  }),
                                  void 0 !== t.usage &&
                                    (0, l.jsxs)("div", {
                                      children: [
                                        (0, l.jsx)("strong", {
                                          children: "Usage:",
                                        }),
                                        " ",
                                        t.usage.toFixed(1),
                                        "%",
                                      ],
                                    }),
                                  t.responseTime &&
                                    (0, l.jsxs)("div", {
                                      children: [
                                        (0, l.jsx)("strong", {
                                          children: "Response Time:",
                                        }),
                                        " ",
                                        t.responseTime.toFixed(0),
                                        "ms",
                                      ],
                                    }),
                                  t.errorRate &&
                                    (0, l.jsxs)("div", {
                                      children: [
                                        (0, l.jsx)("strong", {
                                          children: "Error Rate:",
                                        }),
                                        " ",
                                        t.errorRate.toFixed(2),
                                        "%",
                                      ],
                                    }),
                                ],
                              }),
                            ],
                          },
                          n,
                        );
                      }),
                    }),
                  ],
                }),
              ],
            }),
          i &&
            (0, l.jsxs)("div", {
              className: "component-card",
              children: [
                (0, l.jsx)("h3", {
                  children: "\ud83c\udfe5 Health Check Results",
                }),
                (0, l.jsxs)("div", {
                  className: "grid grid-2",
                  children: [
                    (0, l.jsx)("div", {
                      children: (0, l.jsxs)("div", {
                        style: { marginBottom: "1rem" },
                        children: [
                          (0, l.jsxs)("div", {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                            },
                            children: [
                              (0, l.jsx)("strong", {
                                children: "Overall Health:",
                              }),
                              (0, l.jsx)("span", {
                                style: {
                                  color: h(i.overall),
                                  fontWeight: "bold",
                                  textTransform: "capitalize",
                                },
                                children: i.overall,
                              }),
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", {
                                children: "Health Score:",
                              }),
                              " ",
                              i.score.toFixed(1),
                              "%",
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", { children: "Checked:" }),
                              " ",
                              new Date(i.timestamp).toLocaleString(),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsx)("h4", { children: "Individual Checks:" }),
                        (0, l.jsx)("div", {
                          children: i.checks.map((e, n) =>
                            (0, l.jsxs)(
                              "div",
                              {
                                style: {
                                  marginBottom: "0.5rem",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                },
                                children: [
                                  (0, l.jsx)("span", {
                                    className: "status-indicator",
                                    style: {
                                      backgroundColor:
                                        "passed" === e.status
                                          ? "#28a745"
                                          : "#dc3545",
                                    },
                                  }),
                                  (0, l.jsx)("span", {
                                    style: { textTransform: "capitalize" },
                                    children: e.name.replace("-", " "),
                                  }),
                                  (0, l.jsxs)("span", {
                                    style: {
                                      color:
                                        "passed" === e.status
                                          ? "#28a745"
                                          : "#dc3545",
                                    },
                                    children: ["(", e.status, ")"],
                                  }),
                                ],
                              },
                              n,
                            ),
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
                i.recommendations &&
                  i.recommendations.length > 0 &&
                  (0, l.jsxs)("div", {
                    style: { marginTop: "1rem" },
                    children: [
                      (0, l.jsx)("h4", {
                        children: "\ud83d\udccb Recommendations:",
                      }),
                      (0, l.jsx)("ul", {
                        children: i.recommendations.map((e, n) =>
                          (0, l.jsx)("li", { children: e }, n),
                        ),
                      }),
                    ],
                  }),
              ],
            }),
          s &&
            (0, l.jsxs)("div", {
              className: "component-card",
              children: [
                (0, l.jsx)("h3", {
                  children: "\ud83d\udd12 Security Scan Results",
                }),
                (0, l.jsxs)("div", {
                  className: "grid grid-2",
                  children: [
                    (0, l.jsx)("div", {
                      children: (0, l.jsxs)("div", {
                        style: { marginBottom: "1rem" },
                        children: [
                          (0, l.jsxs)("div", {
                            style: {
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                            },
                            children: [
                              (0, l.jsx)("strong", {
                                children: "Scan Status:",
                              }),
                              (0, l.jsx)("span", {
                                style: {
                                  color: h(s.status),
                                  fontWeight: "bold",
                                  textTransform: "capitalize",
                                },
                                children: s.status,
                              }),
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", { children: "Scan Type:" }),
                              " ",
                              s.type,
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            children: [
                              (0, l.jsx)("strong", { children: "Completed:" }),
                              " ",
                              new Date(s.timestamp).toLocaleString(),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, l.jsxs)("div", {
                      children: [
                        (0, l.jsx)("h4", { children: "Findings Summary:" }),
                        (0, l.jsxs)("div", {
                          style: { fontSize: "0.9rem" },
                          children: [
                            (0, l.jsxs)("div", {
                              children: [
                                (0, l.jsx)("strong", {
                                  children: "Total Findings:",
                                }),
                                " ",
                                s.summary.total,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              style: { color: "#dc3545" },
                              children: [
                                (0, l.jsx)("strong", { children: "Critical:" }),
                                " ",
                                s.summary.critical,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              style: { color: "#fd7e14" },
                              children: [
                                (0, l.jsx)("strong", { children: "High:" }),
                                " ",
                                s.summary.high,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              style: { color: "#ffc107" },
                              children: [
                                (0, l.jsx)("strong", { children: "Medium:" }),
                                " ",
                                s.summary.medium,
                              ],
                            }),
                            (0, l.jsxs)("div", {
                              style: { color: "#28a745" },
                              children: [
                                (0, l.jsx)("strong", { children: "Low:" }),
                                " ",
                                s.summary.low,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                s.findings && s.findings.length > 0
                  ? (0, l.jsxs)("div", {
                      style: { marginTop: "1rem" },
                      children: [
                        (0, l.jsx)("h4", {
                          children: "\ud83d\udd0d Security Findings:",
                        }),
                        (0, l.jsx)("div", {
                          style: { maxHeight: "200px", overflow: "auto" },
                          children: s.findings.map((e, n) =>
                            (0, l.jsxs)(
                              "div",
                              {
                                style: {
                                  padding: "0.5rem",
                                  marginBottom: "0.5rem",
                                  background: "#f8f9fa",
                                  borderRadius: "4px",
                                  borderLeft: `4px solid ${h(e.severity)}`,
                                },
                                children: [
                                  (0, l.jsx)("div", {
                                    style: { fontWeight: "bold" },
                                    children: e.title,
                                  }),
                                  (0, l.jsx)("div", {
                                    style: {
                                      fontSize: "0.9rem",
                                      color: "#666",
                                    },
                                    children: e.description,
                                  }),
                                  (0, l.jsxs)("div", {
                                    style: {
                                      fontSize: "0.8rem",
                                      marginTop: "0.25rem",
                                    },
                                    children: [
                                      (0, l.jsx)("strong", {
                                        children: "Severity:",
                                      }),
                                      " ",
                                      e.severity,
                                      " |",
                                      (0, l.jsx)("strong", {
                                        children: " Component:",
                                      }),
                                      " ",
                                      e.component,
                                    ],
                                  }),
                                ],
                              },
                              n,
                            ),
                          ),
                        }),
                      ],
                    })
                  : (0, l.jsx)("div", {
                      style: {
                        marginTop: "1rem",
                        padding: "1rem",
                        background: "#d4edda",
                        borderRadius: "6px",
                        color: "#155724",
                      },
                      children:
                        "\u2705 No security issues found. Your system appears to be secure.",
                    }),
                s.recommendations &&
                  s.recommendations.length > 0 &&
                  (0, l.jsxs)("div", {
                    style: { marginTop: "1rem" },
                    children: [
                      (0, l.jsx)("h4", {
                        children: "\ud83d\udccb Security Recommendations:",
                      }),
                      (0, l.jsx)("ul", {
                        children: s.recommendations.map((e, n) =>
                          (0, l.jsx)("li", { children: e }, n),
                        ),
                      }),
                    ],
                  }),
              ],
            }),
          (0, l.jsxs)("div", {
            className: "component-card",
            children: [
              (0, l.jsx)("h3", {
                children: "\u2139\ufe0f About Performance Monitor Plugin",
              }),
              (0, l.jsxs)("div", {
                className: "grid grid-2",
                children: [
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Features:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsx)("li", {
                            children: "\u2705 Real-time performance monitoring",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Health checks and diagnostics",
                          }),
                          (0, l.jsx)("li", {
                            children:
                              "\u2705 Security scanning and vulnerability detection",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Intelligent alerting",
                          }),
                          (0, l.jsx)("li", {
                            children: "\u2705 Performance optimization",
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, l.jsxs)("div", {
                    children: [
                      (0, l.jsx)("h4", { children: "Supported Operations:" }),
                      (0, l.jsxs)("ul", {
                        children: [
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "getStatus" }),
                              " - Get current system status",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "healthCheck" }),
                              " - Perform comprehensive health check",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "securityScan" }),
                              " - Run security vulnerability scan",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "getMetrics" }),
                              " - Retrieve performance metrics",
                            ],
                          }),
                          (0, l.jsxs)("li", {
                            children: [
                              (0, l.jsx)("code", { children: "optimize" }),
                              " - Run performance optimizations",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, l.jsxs)("div", {
                style: {
                  marginTop: "1.5rem",
                  padding: "1rem",
                  background: "#e7f3ff",
                  borderRadius: "6px",
                },
                children: [
                  (0, l.jsx)("strong", { children: "\ud83d\udca1 Tip:" }),
                  " Enable auto-refresh to monitor system status in real-time. The plugin automatically tracks memory usage, CPU performance, response times, and security status.",
                ],
              }),
            ],
          }),
        ],
      });
      var m;
    };
  class d {
    constructor() {
      ((this.initialized = !1), (this.plugins = new Set()));
    }
    async initialize() {
      ((this.initialized = !0),
        this.plugins.add("csv-processor"),
        this.plugins.add("chart-renderer"),
        this.plugins.add("llm-integration"),
        this.plugins.add("performance-monitor"));
    }
    isInitialized() {
      return this.initialized;
    }
    getPluginManager() {
      return {
        getActivePlugins: () => Array.from(this.plugins),
        getSystemStatus: async () => ({
          overall: "healthy",
          components: {
            memory: { usage: 45, status: "healthy" },
            cpu: { usage: 23, status: "healthy" },
            plugins: { active: this.plugins.size, status: "healthy" },
          },
          timestamp: new Date(),
        }),
        executePlugin: async (e, n, t) => {
          switch (
            (await new Promise((e) => setTimeout(e, 500 + 1e3 * Math.random())),
            e)
          ) {
            case "csv-processor":
              return this.mockCSVProcessor(n, t);
            case "chart-renderer":
              return this.mockChartRenderer(n, t);
            case "llm-integration":
              return this.mockLLMIntegration(n, t);
            case "performance-monitor":
              return this.mockPerformanceMonitor(n, t);
            default:
              throw new Error(`Unknown plugin: ${e}`);
          }
        },
        registerPlugin: async (e) => {
          console.log("Registering plugin:", e.name);
        },
        loadPlugin: async (e) => {
          console.log("Loading plugin:", e);
        },
        activatePlugin: async (e) => {
          (this.plugins.add(e), console.log("Activated plugin:", e));
        },
        deactivatePlugin: async (e) => {
          (this.plugins.delete(e), console.log("Deactivated plugin:", e));
        },
        getPluginInfo: (e) => ({
          name: e,
          version: "1.0.0",
          status: this.plugins.has(e) ? "active" : "inactive",
          description: `Mock ${e} plugin for demo purposes`,
        }),
      };
    }
    mockCSVProcessor(e, n) {
      var t, r;
      switch (e) {
        case "parse":
          return {
            id: "parsed_data",
            name: "Parsed CSV Data",
            data: [
              { name: "John Doe", age: 30, city: "New York", salary: 55e3 },
              {
                name: "Jane Smith",
                age: 25,
                city: "Los Angeles",
                salary: 66e3,
              },
              { name: "Bob Johnson", age: 35, city: "Chicago", salary: 60500 },
              { name: "Alice Brown", age: 28, city: "Houston", salary: 57200 },
            ],
            metadata: {
              source: "csv",
              rowCount: 4,
              createdAt: new Date().toISOString(),
            },
          };
        case "validate":
          return {
            isValid: !0,
            errors: [],
            warnings: ["Some salary values seem low"],
            statistics: { totalRows: 4, validRows: 4, errorRows: 0 },
          };
        case "transform":
          return {
            id: "transformed_data",
            name: "Transformed Data",
            data:
              (null === n ||
              void 0 === n ||
              null === (t = n.dataset) ||
              void 0 === t ||
              null === (r = t.data) ||
              void 0 === r
                ? void 0
                : r.map((e) => {
                    var n;
                    return {
                      ...e,
                      name:
                        null === (n = e.name) || void 0 === n
                          ? void 0
                          : n.toUpperCase(),
                      salary: Math.round(1.1 * e.salary),
                    };
                  })) || [],
            metadata: { transformedAt: new Date().toISOString() },
          };
        default:
          return { success: !0, operation: e, timestamp: new Date() };
      }
    }
    mockChartRenderer(e, n) {
      var t;
      switch (e) {
        case "render":
          return {
            success: !0,
            chartType:
              (null === n ||
              void 0 === n ||
              null === (t = n.config) ||
              void 0 === t
                ? void 0
                : t.chartType) || "bar",
            rendered: !0,
            timestamp: new Date(),
          };
        case "getTypes":
          return [
            { name: "bar", description: "Bar Chart" },
            { name: "line", description: "Line Chart" },
            { name: "pie", description: "Pie Chart" },
            { name: "scatter", description: "Scatter Plot" },
          ];
        case "export":
          return {
            type: (null === n || void 0 === n ? void 0 : n.format) || "svg",
            data: "<svg>Mock chart SVG data</svg>",
            size: "1024x768",
          };
        default:
          return { success: !0, operation: e, timestamp: new Date() };
      }
    }
    mockLLMIntegration(e, n) {
      var t, r, a;
      switch (e) {
        case "completion":
          return {
            text: `This is a mock LLM completion for the prompt: "${null === n || void 0 === n || null === (t = n.prompt) || void 0 === t ? void 0 : t.substring(0, 50)}...". In a real implementation, this would be generated by an actual language model.`,
            tokens: Math.floor(500 * Math.random()) + 100,
            provider:
              (null === n ||
              void 0 === n ||
              null === (r = n.options) ||
              void 0 === r
                ? void 0
                : r.provider) || "openai",
            model: "gpt-3.5-turbo",
          };
        case "analyze":
          return {
            dataset:
              (null === n ||
              void 0 === n ||
              null === (a = n.dataset) ||
              void 0 === a
                ? void 0
                : a.name) || "Unknown Dataset",
            insights: [
              "The dataset contains employee information with salary data",
              "Average age appears to be around 29.5 years",
              "Salary distribution shows some variation across cities",
              "Data quality appears good with no missing critical fields",
            ],
            recommendations: [
              "Consider normalizing salary data by cost of living",
              "Add more demographic categories for deeper analysis",
              "Implement data validation rules for future entries",
            ],
            metadata: {
              analyzedAt: new Date().toISOString(),
              provider: "openai",
            },
          };
        case "query":
          return {
            originalQuery:
              (null === n || void 0 === n ? void 0 : n.query) || "",
            interpretation:
              "The user is asking about salary statistics in the dataset",
            suggestedSQL:
              "SELECT AVG(salary), MIN(salary), MAX(salary) FROM dataset",
            metadata: { processedAt: new Date().toISOString() },
          };
        case "providers":
          return [
            { name: "openai", models: ["gpt-4", "gpt-3.5-turbo"] },
            { name: "anthropic", models: ["claude-3-opus", "claude-3-sonnet"] },
            { name: "local", models: ["llama2", "mistral"] },
          ];
        default:
          return { success: !0, operation: e, timestamp: new Date() };
      }
    }
    mockPerformanceMonitor(e, n) {
      switch (e) {
        case "getStatus":
          return {
            overall: "healthy",
            components: {
              memory: { usage: 45 + 20 * Math.random(), status: "healthy" },
              cpu: { usage: 20 + 30 * Math.random(), status: "healthy" },
              performance: {
                responseTime: 150 + 100 * Math.random(),
                status: "healthy",
              },
            },
            uptime: Date.now() - (Date.now() % 864e5),
            timestamp: new Date(),
          };
        case "healthCheck":
          return {
            overall: "healthy",
            score: 95,
            checks: [
              { name: "core-services", status: "passed" },
              { name: "data-integrity", status: "passed" },
              { name: "network", status: "passed" },
              { name: "plugins", status: "passed" },
            ],
            timestamp: new Date(),
          };
        case "securityScan":
          return {
            status: "clean",
            findings: [],
            summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
            timestamp: new Date(),
          };
        default:
          return { success: !0, operation: e, timestamp: new Date() };
      }
    }
  }
  const f = () => {
    const [e, n] = (0, r.useState)("overview"),
      {
        pluginSystem: t,
        isInitialized: a,
        activePlugins: f,
        systemStatus: p,
      } = (() => {
        const [e, n] = (0, r.useState)(null),
          [t, a] = (0, r.useState)(!1),
          [l, i] = (0, r.useState)([]),
          [o, s] = (0, r.useState)("initializing");
        return (
          (0, r.useEffect)(() => {
            (async () => {
              try {
                const e = new d();
                (await e.initialize(),
                  n(e),
                  a(!0),
                  i(e.getPluginManager().getActivePlugins()),
                  s("healthy"));
              } catch (e) {
                (console.error("Failed to initialize plugin system:", e),
                  s("error"));
              }
            })();
          }, []),
          (0, r.useEffect)(() => {
            if (e && t) {
              const n = setInterval(async () => {
                try {
                  const n = await e.getPluginManager().getSystemStatus();
                  (s(n.overall), i(e.getPluginManager().getActivePlugins()));
                } catch (n) {
                  console.error("Failed to update system status:", n);
                }
              }, 5e3);
              return () => clearInterval(n);
            }
          }, [e, t]),
          {
            pluginSystem: e,
            isInitialized: t,
            activePlugins: l,
            systemStatus: o,
          }
        );
      })();
    return (0, l.jsxs)("div", {
      className: "app",
      children: [
        (0, l.jsx)("header", {
          className: "app-header",
          children: (0, l.jsxs)("div", {
            className: "header-content",
            children: [
              (0, l.jsx)("h1", {
                children: "\ud83d\udd2e DataPrism Plugin Demo",
              }),
              (0, l.jsx)("p", {
                children:
                  "Interactive demonstration of the DataPrism Plugin System",
              }),
            ],
          }),
        }),
        (0, l.jsx)("nav", {
          className: "app-nav",
          children: (0, l.jsx)("div", {
            className: "nav-tabs",
            children: [
              { id: "overview", label: "Overview", icon: "\ud83c\udfe0" },
              { id: "data", label: "Data Processing", icon: "\ud83d\udcca" },
              { id: "charts", label: "Visualization", icon: "\ud83d\udcc8" },
              { id: "llm", label: "LLM Integration", icon: "\ud83e\udd16" },
              { id: "monitor", label: "System Monitor", icon: "\ud83d\udd27" },
              { id: "plugins", label: "Plugin Manager", icon: "\ud83d\udd0c" },
            ].map((t) =>
              (0, l.jsxs)(
                "button",
                {
                  className: "nav-tab " + (e === t.id ? "active" : ""),
                  onClick: () => n(t.id),
                  children: [
                    (0, l.jsx)("span", {
                      className: "tab-icon",
                      children: t.icon,
                    }),
                    (0, l.jsx)("span", {
                      className: "tab-label",
                      children: t.label,
                    }),
                  ],
                },
                t.id,
              ),
            ),
          }),
        }),
        (0, l.jsx)("main", {
          className: "app-main",
          children: (0, l.jsx)("div", {
            className: "main-content",
            children: (() => {
              if (!a)
                return (0, l.jsxs)("div", {
                  className: "loading-container",
                  children: [
                    (0, l.jsx)("div", { className: "loading-spinner" }),
                    (0, l.jsx)("p", {
                      children: "Initializing DataPrism Plugin System...",
                    }),
                  ],
                });
              switch (e) {
                case "overview":
                  return (0, l.jsxs)("div", {
                    className: "overview-container",
                    children: [
                      (0, l.jsx)("h2", {
                        children: "\ud83d\ude80 DataPrism Plugin System Demo",
                      }),
                      (0, l.jsxs)("div", {
                        className: "overview-grid",
                        children: [
                          (0, l.jsxs)("div", {
                            className: "overview-card",
                            children: [
                              (0, l.jsx)("h3", {
                                children: "\ud83d\udd0c Plugin Status",
                              }),
                              (0, l.jsxs)("p", {
                                children: [
                                  (0, l.jsx)("strong", {
                                    children: "Active Plugins:",
                                  }),
                                  " ",
                                  f.length,
                                ],
                              }),
                              (0, l.jsx)("ul", {
                                children: f.map((e) =>
                                  (0, l.jsx)("li", { children: e }, e),
                                ),
                              }),
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            className: "overview-card",
                            children: [
                              (0, l.jsx)("h3", {
                                children: "\u26a1 System Health",
                              }),
                              (0, l.jsxs)("p", {
                                children: [
                                  (0, l.jsx)("strong", { children: "Status:" }),
                                  " ",
                                  (0, l.jsx)("span", {
                                    className: `status ${p}`,
                                    children: p,
                                  }),
                                ],
                              }),
                              (0, l.jsxs)("p", {
                                children: [
                                  (0, l.jsx)("strong", { children: "Memory:" }),
                                  " ~",
                                  Math.floor(100 * Math.random()),
                                  "MB",
                                ],
                              }),
                              (0, l.jsxs)("p", {
                                children: [
                                  (0, l.jsx)("strong", {
                                    children: "Response Time:",
                                  }),
                                  " ~",
                                  Math.floor(100 * Math.random()),
                                  "ms",
                                ],
                              }),
                            ],
                          }),
                          (0, l.jsxs)("div", {
                            className: "overview-card",
                            children: [
                              (0, l.jsx)("h3", {
                                children: "\ud83d\udccb Available Features",
                              }),
                              (0, l.jsxs)("ul", {
                                children: [
                                  (0, l.jsx)("li", {
                                    children: "\u2705 CSV Data Processing",
                                  }),
                                  (0, l.jsx)("li", {
                                    children: "\u2705 Interactive Charts",
                                  }),
                                  (0, l.jsx)("li", {
                                    children: "\u2705 LLM Analysis",
                                  }),
                                  (0, l.jsx)("li", {
                                    children: "\u2705 Performance Monitoring",
                                  }),
                                  (0, l.jsx)("li", {
                                    children: "\u2705 Plugin Management",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  });
                case "data":
                  return (0, l.jsx)(o, { pluginSystem: t });
                case "charts":
                  return (0, l.jsx)(s, { pluginSystem: t });
                case "llm":
                  return (0, l.jsx)(u, { pluginSystem: t });
                case "monitor":
                  return (0, l.jsx)(c, { pluginSystem: t });
                case "plugins":
                  return (0, l.jsx)(i, { pluginSystem: t });
                default:
                  return (0, l.jsx)("div", { children: "Tab not found" });
              }
            })(),
          }),
        }),
        (0, l.jsx)("footer", {
          className: "app-footer",
          children: (0, l.jsx)("p", {
            children:
              "DataPrism Plugin System \u2022 Built with React & TypeScript",
          }),
        }),
      ],
    });
  };
  a.createRoot(document.getElementById("root")).render(
    (0, l.jsx)(r.StrictMode, { children: (0, l.jsx)(f, {}) }),
  );
})();
//# sourceMappingURL=main.d75b5710.js.map

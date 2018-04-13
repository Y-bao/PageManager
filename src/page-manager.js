import Router from "vue-router";
import Utils from "./utils.js";
import Page from "./page";
import PageAnimation from "./page-animation";

const JumpWay = {
    Refresh: "Refresh",
    Next: "Next",
    Prev: "Prev"
};

class PageManager {
    _init(obj) {
        if (obj) {
            if (obj.title) {
                if (Utils.is(obj.title, String)) {
                    this._title = obj.title;
                }
                delete obj.title;
            }
            if (obj.pageAnimation) {
                if (Utils.is(obj.pageAnimation, Object)) {
                    this._pageAnimation = new PageAnimation(obj.pageAnimation);
                }
                delete obj.pageAnimation;
            }
            if (obj.listenGuide) {
                this._listenGuide = obj.listenGuide;
                delete obj.listenGuide;
            }
            this._addPages(obj.routes);
        }
        return this;
    }

    get title() {
        return this._title;
    }
    get pageAnimation() {
        return this._pageAnimation;
    }

    get pages() {
        return this._pages || {};
    }
    get jumpWay() {
        return this._jumpWay || JumpWay.Refresh;
    }

    set beforeEach(func) {
        this._beforeEach = func;
    }

    _beforeEachProxy(to, from, next) {
        this._token = this._token || 0;
        if (this._listenGuide != false) {
            if (!to.query || !to.query.pageToken) {
                let _to = { ...to };
                _to.query = _to.query || {};
                if (to.query._isReplace) {
                    delete to.query._isReplace;
                    _to.query.pageToken = this._token;
                    _to.replace = true;
                } else {
                    if (this._token == 0) {
                        _to.replace = true;
                    }
                    _to.query.pageToken = ++this._token;
                }
                next(_to);
                return true;
            } else {
                this._jumpWay =
                    this._token > to.query.pageToken
                        ? JumpWay.Prev
                        : this._token == 0 ? JumpWay.Refresh : JumpWay.Next;
                this._token = to.query.pageToken;
            }
        }
        var toTitle;
        var page = this.getPage(to);
        if (page) {
            toTitle = page.title;
        }
        document.title = toTitle || this.title || "";
        if (this._beforeEach) {
            this._beforeEach(to, from, next);
        } else {
            next();
        }
    }

    _addPages(routes) {
        this._pages = this._pages || {};
        // for in,for of 不能用 因为这里只遍历自身可枚举属性
        routes.forEach(route => {
            if (route.name) {
                // 生成页面信息
                var page = new Page(route);
                Object.defineProperty(this._pages, route.name, {
                    get: function() {
                        return page;
                    }
                });
            }
            if (route.children) {
                this._addPages(route.children);
            }
        });
    }

    reCreateReplacePath(_location) {
        if (Utils.is(_location, String)) {
            return { path: _location, query: { _isReplace: true } };
        } else if (!_location.query || !_location.query.pageToken) {
            _location.query = _location.query || {};
            _location.query._isReplace = true;
        }
        return _location;
    }

    setTransitionClass(to, from, routeClass, action) {
        var pageRoute;
        if (this.jumpWay == JumpWay.Prev) {
            pageRoute = from;
        } else if (this.jumpWay == JumpWay.Next) {
            pageRoute = to;
        } else {
            action({});
            return;
        }
        var page = this.getPage(pageRoute, routeClass);
        if (!page) {
            action({});
            return;
        }
        var transitionClass;
        var overrideAnim = page.overrideAnim;
        if (overrideAnim) {
            if (this.jumpWay == JumpWay.Prev) {
                transitionClass = PageAnimation.mergeCloseClass(overrideAnim);
            } else if (this.jumpWay == JumpWay.Next) {
                transitionClass = PageAnimation.mergeOpenClass(overrideAnim);
            }
        } else {
            var pageAnimation = page.pageAnimation;
            if (this.jumpWay == JumpWay.Prev) {
                transitionClass = PageAnimation.mergeCloseClass(
                    this.pageAnimation,
                    pageAnimation
                );
            } else if (this.jumpWay == JumpWay.Next) {
                transitionClass = PageAnimation.mergeOpenClass(
                    this.pageAnimation,
                    pageAnimation
                );
            }
        }
        action(transitionClass || {});
    }

    getPage(pageRoute, routeClass) {
        if (pageRoute) {
            if (routeClass) {
                if (
                    pageRoute.matched &&
                    pageRoute.matched.length >= routeClass
                ) {
                    pageRoute = pageRoute.matched[routeClass - 1];
                } else {
                    return;
                }
            }
            if (this.pages[pageRoute.name]) {
                return this.pages[pageRoute.name];
            }
        }
    }
}

export default class PMRouter extends Router {
    constructor(obj) {
        var pageManager = new PageManager()._init(obj);

        super(obj);

        this._pageManager = pageManager;

        //代理beforeEach
        super.beforeEach(pageManager._beforeEachProxy.bind(pageManager));
    }

    get $pm() {
        return this._pageManager;
    }

    addRoutes(routes) {
        this.$pm._addPages(routes);
        super.addRoutes(routes);
    }

    replace(_location, _onComplete, _onAbort) {
        super.replace(
            this.$pm.reCreateReplacePath(_location),
            _onComplete,
            _onAbort
        );
    }

    beforeEach(func) {
        this.$pm.beforeEach = func;
    }

    static install(Vue, options) {
        Router.install(Vue, options);
        Vue.mixin({
            beforeCreate: function beforeCreate() {
                var _t;
                if ((_t = this.$options) && (_t = _t.router)) {
                    window._pageManager = _t.$pm;
                }
            }
        });
        Object.defineProperty(window, "$pm", {
            get: function get() {
                return this._pageManager;
            }
        });
        Object.defineProperty(Vue.prototype, "$pm", {
            get: function get() {
                if (this.$router) {
                    return this.$router.$pm;
                }
            }
        });
    }
}

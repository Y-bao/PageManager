import Utils from "./utils.js";
import PageAnimation from "./page-animation";

export default class Page {
    constructor(obj) {
        this._meta = {};
        if (obj) {
            if (obj.path && Utils.is(obj.path, String)) {
                this._path = obj.path;
            }
            if (obj.redirect && Utils.is(obj.redirect, String)) {
                this._redirect = obj.redirect;
            }
            if (obj.name && Utils.is(obj.name, String)) {
                this._name = obj.name;
            }
            if (obj.component) {
                this._component = obj.component;
            }
            if (obj.meta && Utils.is(obj.meta, Object)) {
                this._meta = obj.meta;
            }
            if (obj.title && Utils.is(obj.title, String)) {
                this._title = obj.title;
            }
            if (obj.modelName && Utils.is(obj.modelName, String)) {
                this._modelName = obj.modelName;
            }
            if (obj.pageAnimation && Utils.is(obj.pageAnimation, Object)) {
                this._pageAnimation = new PageAnimation(obj.pageAnimation);
            }
            if (obj.children && Utils.is(obj.children, Array)) {
                this._children = obj.children;
            }
        }
    }
    get path() {
        return this._path;
    }
    get redirect() {
        return this._redirect;
    }
    get name() {
        return this._name;
    }
    get component() {
        return this._component;
    }
    get meta() {
        return this._meta;
    }
    get children() {
        return this._children;
    }
    get title() {
        return this._title;
    }
    get modelName() {
        return this._modelName;
    }
    get pageAnimation() {
        return this._pageAnimation;
    }

    get overrideAnim() {
        var overrideAnim = this._overrideAnim;
        if (this._overrideAnim) {
            delete this._overrideAnim;
        }
        return overrideAnim;
    }

    overridePageAnimation(obj) {
        this._overrideAnim = new PageAnimation(obj);
    }
}

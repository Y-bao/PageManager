import Utils from "./utils.js";
function initAnimClass(ap) {
    var animClass = new AnimClass();
    if (ap) {
        if (Utils.is(ap, String)) {
            animClass._m = Utils.atb(ap);
            animClass._to = Utils.atb(ap, "-to");
            animClass._active = Utils.atb(ap, "-active");
        } else if (Utils.is(ap, Object)) {
            if (ap.name) {
                animClass._m = Utils.atb(ap.name);
                animClass._to = Utils.atb(ap.name, "-to");
                animClass._active = Utils.atb(ap.name, "-active");
            }
            if (ap.m) {
                animClass._m = (animClass._m || "") + " " + ap.m;
            }
            if (ap.to) {
                animClass._to = (animClass._to || "") + " " + ap.to;
            }
            if (ap.active) {
                animClass._active = (animClass._active || "") + " " + ap.active;
            }
        }
    }
    return animClass;
}

class AnimClass {
    get m() {
        return this._m;
    }
    get to() {
        return this._to;
    }
    get active() {
        return this._active;
    }
}
class TransitionClass {
    constructor(enter, leave) {
        if (enter) {
            this._enter = enter.m;
            this._enterTo = enter.to;
            this._enterActive = enter.active;
        }
        if (leave) {
            this._leave = leave.m;
            this._leaveTo = leave.to;
            this._leaveActive = leave.active;
        }
    }
    get enter() {
        return this._enter;
    }
    get enterTo() {
        return this._enterTo;
    }
    get enterActive() {
        return this._enterActive;
    }
    get leave() {
        return this._leave;
    }
    get leaveTo() {
        return this._leaveTo;
    }
    get leaveActive() {
        return this._leaveActive;
    }
}

export default class PageAnimation {
    constructor(obj) {
        this._openEnter = initAnimClass(obj.openEnter);
        this._openLeave = initAnimClass(obj.openLeave);
        this._closeEnter = initAnimClass(obj.closeEnter);
        this._closeLeave = initAnimClass(obj.closeLeave);
    }
    get openEnter() {
        return this._openEnter;
    }
    get openLeave() {
        return this._openLeave;
    }
    get closeEnter() {
        return this._closeEnter;
    }
    get closeLeave() {
        return this._closeLeave;
    }
    static mergeOpenClass(p1, p2) {
        if (p1 && p2) {
            return new TransitionClass(
                Object.assign(new AnimClass(), p1.openEnter, p2.openEnter),
                Object.assign(new AnimClass(), p1.openLeave, p2.openLeave)
            );
        } else if (p1) {
            return new TransitionClass(p1.openEnter, p1.openLeave);
        } else if (p2) {
            return new TransitionClass(p2.openEnter, p2.openLeave);
        }
    }
    static mergeCloseClass(p1, p2) {
        if (p1 && p2) {
            return new TransitionClass(
                Object.assign(new AnimClass(), p1.closeEnter, p2.closeEnter),
                Object.assign(new AnimClass(), p1.closeLeave, p2.closeLeave)
            );
        } else if (p1) {
            return new TransitionClass(p1.closeEnter, p1.closeLeave);
        } else if (p2) {
            return new TransitionClass(p2.closeEnter, p2.closeLeave);
        }
    }
}

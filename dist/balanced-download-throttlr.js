export class BalancedDownloadThrottlr {
    constructor() {
        this.pendingUpdates = new Map();
        this.throttleTimers = new Map();
        this.PROGRESS_UPDATE_DELAY = 150;
        this.LOG_UPDATE_DELAY = 500;
    }
    static get self() {
        if (!BalancedDownloadThrottlr.instance)
            BalancedDownloadThrottlr.instance = new BalancedDownloadThrottlr();
        return BalancedDownloadThrottlr.instance;
    }
    configure(options) {
        if (options.progressDelay !== undefined) {
            this.PROGRESS_UPDATE_DELAY = Math.max(50, options.progressDelay);
        }
        if (options.logDelay !== undefined) {
            this.LOG_UPDATE_DELAY = Math.max(100, options.logDelay);
        }
    }
    throttleUpdate(id, update, callback) {
        if (this.isCriticalUpdate(update)) {
            this.forceUpdate(id, update, callback);
            return;
        }
        this.pendingUpdates.set(id, update);
        const existingTimer = this.throttleTimers.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }
        const delay = this.isLogOnlyUpdate(update)
            ? this.LOG_UPDATE_DELAY
            : this.PROGRESS_UPDATE_DELAY;
        const timer = setTimeout(() => {
            const latestUpdate = this.pendingUpdates.get(id);
            if (latestUpdate) {
                callback(latestUpdate);
                this.pendingUpdates.delete(id);
                this.throttleTimers.delete(id);
            }
        }, delay);
        this.throttleTimers.set(id, timer);
    }
    isCriticalUpdate(update) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return (update.type === "controller" ||
            ((_b = (_a = update.data) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.status) === "finished" ||
            ((_d = (_c = update.data) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.status) === "failed" ||
            ((_f = (_e = update.data) === null || _e === void 0 ? void 0 : _e.value) === null || _f === void 0 ? void 0 : _f.status) === "cancelled" ||
            ((_h = (_g = update.data) === null || _g === void 0 ? void 0 : _g.value) === null || _h === void 0 ? void 0 : _h.status) === "error");
    }
    isLogOnlyUpdate(update) {
        var _a, _b;
        return ((_a = update.data) === null || _a === void 0 ? void 0 : _a.log) && !((_b = update.data) === null || _b === void 0 ? void 0 : _b.value);
    }
    forceUpdate(id, update, callback) {
        const existingTimer = this.throttleTimers.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
            this.throttleTimers.delete(id);
        }
        this.pendingUpdates.delete(id);
        callback(update);
    }
    cleanup(id) {
        const timer = this.throttleTimers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.throttleTimers.delete(id);
        }
        this.pendingUpdates.delete(id);
    }
    cleanupAll() {
        this.throttleTimers.forEach((timer) => clearTimeout(timer));
        this.throttleTimers.clear();
        this.pendingUpdates.clear();
    }
}

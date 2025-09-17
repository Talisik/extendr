// Balanced throttling utility - optimized for both performance and UX
export class BalancedDownloadThrottlr {
    private static instance: BalancedDownloadThrottlr;
    private pendingUpdates = new Map<string, any>();
    private throttleTimers = new Map<string, NodeJS.Timeout>();

    // Balanced intervals - responsive but not overwhelming
    // Can be adjusted based on system performance needs
    private PROGRESS_UPDATE_DELAY = 150; // 150ms = ~7 FPS (smooth but efficient)
    private LOG_UPDATE_DELAY = 500; // 500ms for logs (less critical)

    static get self(): BalancedDownloadThrottlr {
        if (!BalancedDownloadThrottlr.instance)
            BalancedDownloadThrottlr.instance = new BalancedDownloadThrottlr();

        return BalancedDownloadThrottlr.instance;
    }

    // Allow runtime adjustment of throttling based on performance needs
    configure(options: { progressDelay?: number; logDelay?: number }) {
        if (options.progressDelay !== undefined) {
            this.PROGRESS_UPDATE_DELAY = Math.max(50, options.progressDelay); // Min 50ms
        }
        if (options.logDelay !== undefined) {
            this.LOG_UPDATE_DELAY = Math.max(100, options.logDelay); // Min 100ms
        }
    }

    throttleUpdate(id: string, update: any, callback: (update: any) => void) {
        // Critical updates go through immediately
        if (this.isCriticalUpdate(update)) {
            this.forceUpdate(id, update, callback);
            return;
        }

        // Store the latest update
        this.pendingUpdates.set(id, update);

        // Clear existing timer
        const existingTimer = this.throttleTimers.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        // Set appropriate delay based on update type
        const delay = this.isLogOnlyUpdate(update)
            ? this.LOG_UPDATE_DELAY
            : this.PROGRESS_UPDATE_DELAY;

        // Schedule update
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

    private isCriticalUpdate(update: any): boolean {
        return (
            update.type === "controller" ||
            update.data?.value?.status === "finished" ||
            update.data?.value?.status === "failed" ||
            update.data?.value?.status === "cancelled" ||
            update.data?.value?.status === "error"
        );
    }

    private isLogOnlyUpdate(update: any): boolean {
        // True if it's only a log update without progress data
        return update.data?.log && !update.data?.value;
    }

    forceUpdate(id: string, update: any, callback: (update: any) => void) {
        // Clear any pending update
        const existingTimer = this.throttleTimers.get(id);
        if (existingTimer) {
            clearTimeout(existingTimer);
            this.throttleTimers.delete(id);
        }

        this.pendingUpdates.delete(id);
        callback(update);
    }

    cleanup(id: string) {
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

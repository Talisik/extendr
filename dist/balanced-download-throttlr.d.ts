export declare class BalancedDownloadThrottlr {
    private static instance;
    private pendingUpdates;
    private throttleTimers;
    private PROGRESS_UPDATE_DELAY;
    private LOG_UPDATE_DELAY;
    static get self(): BalancedDownloadThrottlr;
    configure(options: {
        progressDelay?: number;
        logDelay?: number;
    }): void;
    throttleUpdate(id: string, update: any, callback: (update: any) => void): void;
    private isCriticalUpdate;
    private isLogOnlyUpdate;
    forceUpdate(id: string, update: any, callback: (update: any) => void): void;
    cleanup(id: string): void;
    cleanupAll(): void;
}

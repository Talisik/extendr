export type LoadOrdrItemType = {
    installed: boolean;
};

export type LoadOrdrWritableItemType = LoadOrdrItemType & {
    name: string;
};

export type ExtensionType = {
    name?: string;
    path: string;
    main?: Function;
    packageJson?: any;
    valid: boolean;
    reason?: string;
};

export type ListenrCallbackType = (args: any[], returnValue: any) => any;

export type ListenrType = {
    priority: number;
    once: boolean;
    callback: ListenrCallbackType;
};

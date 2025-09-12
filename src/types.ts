export type LoadOrderItemType = {
    installed: boolean;
};

export type LoadOrderWritableItemType = LoadOrderItemType & {
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

export type ListenerCallbackType = (args: any[], returnValue: any) => any;

export type ListenerType = {
    priority: number;
    once: boolean;
    callback: ListenerCallbackType;
};

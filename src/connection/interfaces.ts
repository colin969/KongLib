import { GameStatMsg } from "types";

export enum Opcode {
    HELLO = "hello", // Health check?
    STATS_SUBMIT = "stat.submit", // Stats submit (array of stats)
    ITEM_INSTANCES = "mtx.item_instances", // Get MTX items owned by user
}

export type EventType<T extends string, U extends { [key in T]: any }> = {
    [key in keyof U]: U[key];
}

export type KongEventsIncoming = EventType<Opcode, {
    [Opcode.HELLO]: {},
    [Opcode.ITEM_INSTANCES]: {
        username?: string,
        callback?: (args: {
            success: boolean,
            data: ItemInstance[],
        }) => any,
    },
    [Opcode.STATS_SUBMIT]: {
        stats: GameStatMsg[]
    }
}>;

export type KongEventsReturn = EventType<Opcode, {
    [Opcode.HELLO]: {},
    [Opcode.ITEM_INSTANCES]: {
        success: boolean,
        data: ItemInstance[],
        username: string,
    },
    [Opcode.STATS_SUBMIT]: null,
}>;

export type ItemInstance = {
    id: number; // ID of instance
    identifier: string; // ID of item
    data: string; // Metadata
    remaining_uses: number;
}

export type ParsedMessageIncoming = {
    opcode: Opcode;
    params: KongEventsIncoming[Opcode];
}

export type ParsedMessageReturn = {
    opcode: Opcode;
    params: KongEventsReturn[Opcode];
}

export type ParsedMessageIncomingListener = (message: ParsedMessageIncoming) => void;
export type ParsedMessageReturnListener = (message: ParsedMessageReturn) => void;

export interface IConnectionClient {
    isSupported(): boolean;
    connected(): boolean;
    isClient(): boolean;
    supportsObjects(): boolean;
    logPrefix(): string;
    addMessageListener(callback: ParsedMessageIncomingListener): void;
    addReturnMessageListener(callback: ParsedMessageReturnListener): void;
    listen(): Promise<void>;
  
    connect(): Promise<void>;
    retryConnection(): void;

    sendMessage(opcode: string, parameters: any, onError?: () => void): void;

    on(event: 'bad_opcode', listener: (opcode: string) => void): void;
}
import { ApiEventManager } from "events";
import { LOGGER } from "log";
import { IConnectionClient, KongEventsIncoming, Opcode, ParsedMessageIncoming, ParsedMessageIncomingListener, ParsedMessageReturn, ParsedMessageReturnListener } from "./interfaces";

export class LocalConnectionClient extends ApiEventManager implements IConnectionClient {
    /**
     * Runs as a local server, mocking some network functions
     * Calls registered listeners when it would respond like a server would
     */
    incomingListeners: ParsedMessageIncomingListener[] = [];
    returnListeners: ParsedMessageReturnListener[] = [];

    isSupported(): boolean {
        return true;
    }
    connected(): boolean {
        return true;
    }
    isClient(): boolean {
        return true;
    }
    supportsObjects(): boolean {
        return true;
    }
    logPrefix(): string {
        return "Local Conn";
    }
    addMessageListener(callback: ParsedMessageIncomingListener): void {
        this.incomingListeners.push(callback);
    }
    addReturnMessageListener(callback: ParsedMessageReturnListener): void {
        this.returnListeners.push(callback);
    }
    listen(): Promise<void> {
        return; // Local connection
    }
    connect(): Promise<void> {
        return; // Local connection
    }
    retryConnection(): void {
        return; // Local connection
    }
    sendMessage(opcode: string, parameters: string, onError?: () => void): void {
        // We're acting as a server ourselves, so we handle the message here
        LOGGER.debug(`[${opcode}] - ${parameters}`);
        const parsedMessage: ParsedMessageIncoming = {
            opcode: toOpcode(opcode),
            params: JSON.parse(parameters),
        } // Unsafe casting, but easier

        // Worlds longest switch
        switch (parsedMessage.opcode) {
            case Opcode.HELLO: {
                const response: ParsedMessageReturn = {
                    opcode: Opcode.HELLO,
                    params: {}
                };
                tryFlashEmit(response);
                break;
            }
            case Opcode.ITEM_INSTANCES: {
                const response: ParsedMessageReturn = {
                    opcode: Opcode.ITEM_INSTANCES,
                    params: {
                        success: true,
                        data: [],
                        username: 'guest'
                    }
                }
                tryFlashEmit(response);
                break;
            }
            case Opcode.STATS_SUBMIT: {
                const params = parsedMessage.params as KongEventsIncoming[Opcode.STATS_SUBMIT];
                kongregate.stats.setStats(params.stats);
                break;
            }
            default: {
                LOGGER.debug('Unknown event');
                console.debug(parsedMessage);
                this.emit('bad_opcode', opcode);
            }
        }
    }
}

function toOpcode(value: string): Opcode | undefined {
    if (value in Opcode) {
        return Opcode[value as keyof typeof Opcode];
    }
    // Optional: handle values directly (not keys)
    for (const key of Object.keys(Opcode)) {
        if (Opcode[key as keyof typeof Opcode] === value) {
            return Opcode[key as keyof typeof Opcode];
        }
    }
    return undefined;
}

function tryFlashEmit(data: any) {
    try {
        if (kongregateAPI.swfElemId) {
            const elem = document.getElementById(kongregateAPI.swfElemId);
            if (elem) {
                (elem as any).handleMessageConnectionEvent(JSON.stringify(data));
                console.debug('Replied to Flash API');
            }
        }
    } catch {
        console.error("Failed to call flash object with message");
    }
}
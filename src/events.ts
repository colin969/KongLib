type ApiEventListener = {
    (data: any): void;
}

export class ApiEventManager {
    private listeners: { [key: string]: ApiEventListener[] } = {};

    on(event: string, listener: (data: any) => void): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    off(event: string, listenerToRemove: (data: any) => void): void {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(listener => listener !== listenerToRemove);
    }

    emit(event: string, data: any): void {
        const eventListeners = this.listeners[event];
        if (eventListeners && eventListeners.length) {
            eventListeners.forEach(listener => listener(data));
        }
    }
}
import { LocalConnectionClient } from "connection/Local";
import { IConnectionClient } from "connection/interfaces";
import { IKongLib, KongLib } from "kong";
import { LOGGER } from "log";
import { ApiEventManager } from "events";

interface IKongApi {
    // Required functions called by games
    loadAPI: (callback?: () => void) => void;
    getAPI: () => IKongLib;
    swfElemId?: string;

    setSwfElemId: (elemId: string) => void;
    
    connection?: IConnectionClient;

    getGameIdInfo(): Promise<GameIdInfo[]>;

    on(event: 'connected', listener: () => void): void;
}

type GameIdInfo = {
    name: string;
    game_id: number;
    game_path: string;
    as3: boolean;
}

class KongApi extends ApiEventManager implements IKongApi {
    private kong: IKongLib;
    swfElemId = "";
    connection?: IConnectionClient;
    game_id_info: GameIdInfo[] = [];
    
    constructor() {
        super();
        // Create the real object
        this.kong = new KongLib();
        this.connection = new LocalConnectionClient();
        globalThis.kongregate = this.kong;
    }

    loadAPI(callback?: () => void) {
        LOGGER.debug('loadApi');
        if (callback) {
            callback(); // Everything is done during the constructor anyway
        }
        this.emit('connected', undefined);
    };

    getAPI() {
        return this.kong;
    };

    setSwfElemId(elemId: string){
        // Save the elem ID, so we can send messages back to the flash object later
        LOGGER.debug('SWF Elem set to ' + elemId);
        this.swfElemId = elemId;
        this.emit('connected', undefined);
    }

    async getGameIdInfo(url?: URL) {
        if (this.game_id_info.length !== 0) {
            return this.game_id_info;
        }

        if (url === undefined) {
            url = new URL("./game_info.json", window.location.href)
        }
        const res = await fetch(url);
        this.game_id_info = await res.json();
        return this.game_id_info;
    }
}

declare global {
    var kongregate: IKongLib;
    var kongregateAPI: IKongApi;
    var flashApiSendMessage: (opcode: string, parameters: string) => void;
    var flashApiBootstrap: (elemId: string, apiUrl: string) => string;
}

// Create the global var
globalThis.kongregateAPI = new KongApi();
globalThis.flashApiSendMessage = (opcode: string, parameters: string) => {
    // Function to support the modified Flash API
    setTimeout(() => { // Non blocking
        kongregateAPI.connection.sendMessage(opcode, decodeURIComponent(parameters));
    })

};
globalThis.flashApiBootstrap = (elemId: string, apiUrl: string) => {
    // Api url ignored since we are preloading it
    setTimeout(() => {
        kongregateAPI.setSwfElemId(elemId);

        // Return the connection object name to the Flash API   
        const elem: any = document.getElementById(elemId);
        try {
            elem.setConnectionObject("kongregateAPI.connection");
            kongregateAPI.connection
        } catch {
            console.error("Failed to call setConnectionObject on Flash object");
        }
    })

    return 'pending';
};
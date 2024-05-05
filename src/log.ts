export const LOGGER = {
    log: (data: any) => {
        console.log(`[KongLib] - ${data}`);
    },
    warn: (data: any) => {
        console.warn(`[KongLib] - ${data}`);
    },
    error: (data: any) => {
        console.error(`[KongLib] - ${data}`);
    },
    debug: (data: any) => {
        console.debug(`[KongLib] - ${data}`);
    },
    trace: (data: any) => {
        console.trace(`[KongLib] - ${data}`);
    }
}
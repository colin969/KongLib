export interface IServicesModule {
    isKongregate: () => boolean;
}

export class ServicesModule implements IServicesModule {
    isKongregate() {
        return true;
    }
}
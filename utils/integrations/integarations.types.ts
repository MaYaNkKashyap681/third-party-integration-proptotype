export interface IService {
    name: string;
    connect(): String;
    disconnect(): Promise<void>;
    ensureValidToken(): Promise<Boolean>;
    executeAction(action: string, payload: any): Promise<any>;
}
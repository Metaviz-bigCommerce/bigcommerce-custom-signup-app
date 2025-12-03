import { SessionProps } from './auth';
 
export interface StoreData {
    accessToken?: string;
    scope?: string;
    storeHash: string;
}
 
export interface UserData {
    email: string;
    username?: string;
    stores?: string[];
}
 
export interface Db {
    setUser(session: SessionProps, storeHash: string): Promise<null | undefined>;
    setStore(session: SessionProps): Promise<null | undefined>;
    getStoreToken(storeHash: string): Promise<any>;
    deleteStore(session: SessionProps): Promise<[string, string] | null | undefined>;
    deleteUser(userId: string, storeHash: string): Promise<null | undefined>;
    setStoreScriptUuid(storeHash: string, uuid: string): Promise<void>;
    getStoreForm(storeHash: string): Promise<any>;
    setStoreForm(storeHash: string, form: any): Promise<void>;
    setStoreFormActive(storeHash: string, active: boolean): Promise<void>;
    getStoreSettings(storeHash: string): Promise<{ signupForm?: any; signupFormActive?: boolean; signupScriptUuid?: string } | null>;
    getPublicStoreId(storeHash: string): Promise<string>;
    resolveStoreHashByPublicId(publicId: string): Promise<string | null>;
    createSignupRequest(storeHash: string, payload: Record<string, any>): Promise<{ id: string }>;
    listSignupRequests(storeHash: string, options?: { pageSize?: number; cursor?: string; status?: 'pending' | 'approved' | 'rejected' }): Promise<{ items: any[]; nextCursor: string | null }>;
    updateSignupRequestStatus(storeHash: string, id: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ ok: boolean }>;
}
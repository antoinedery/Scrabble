// Disable de lint autorisé par chargés
// CODE DE NIKOLAY //
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type CallbackSignature = (...params: any) => {};

export class SocketMock {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event)!.push(callback);
    }
    
    emit(event: string, ...params: unknown[]): void {
        /* istanbul ignore if - Approuvé par le chargé*/
        if (!this.callbacks.has(event)) {
            return;
        }
        for (const callback of this.callbacks.get(event)!) {
            callback(...params);
        }
    }
}

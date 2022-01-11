// CODE DE NIKOLAY - Disable de lint autorisé par chargés//
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/ban-types
export type CallbackSignature = (...params: any) => {};

export class SocketMock {
    private callbacks = new Map<string, CallbackSignature[]>();

    on(event: string, callback: CallbackSignature): void {
        /* istanbul ignore else */
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event)!.push(callback);
    }

    emit(event: string, params: any): void {
        if (!this.callbacks.has(event)) {
            return;
        }
        for (const callback of this.callbacks.get(event)!) {
            callback(params);
        }
    }
}

export default class CancelMan {
    private readonly k;
    constructor(k?: string);
    private static map;
    get signal(): AbortSignal;
    cancel(): void;
    static cancel(k?: string): void;
}

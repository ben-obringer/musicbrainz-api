export declare class RateLimiter {
    private maxCalls;
    static sleep(ms: number): Promise<void>;
    queue: number[];
    private readonly period;
    constructor(maxCalls: number, period: number);
    limit(): Promise<void>;
}

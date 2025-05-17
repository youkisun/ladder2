export class GameTimeManager {
    private static instance: GameTimeManager;
    private serverTime: number = 0; // UTC time (in milliseconds)
    //private lastUpdateTime: number = 0; // Last update time of the client (in milliseconds)
    
    private startPerf: number = 0;

    private isUseServerTime: boolean = true;

    // Singleton accessor
    public static getInstance(): GameTimeManager {
        if (!GameTimeManager.instance) {
            GameTimeManager.instance = new GameTimeManager();
        }
        return GameTimeManager.instance;
    }

    // Set UTC time from the server
    public setServerTime(utcTime: number): void {        

        if(utcTime == -1)
            return;

        if (utcTime === 0) {
            utcTime = Date.now();
        }
        this.serverTime = utcTime;
        //this.nowDate = new Date(utcTime);
        //this.lastUpdateTime = Date.now();
        this.startPerf = performance.now();
    }

    // Get the current UTC time
    public getCurrentTime(): number {
        if (this.serverTime === 0 || !this.isUseServerTime) {
            //Logger.warn("Server time has not been set.");
            return Date.now();
        }

        // Calculate elapsed time
        const elapsedTime = performance.now() - this.startPerf;
        return this.serverTime + elapsedTime;
    }

    public getNowDate(): Date {
        return new Date(this.getCurrentTime());
    }

    // Get UTC time as a string
    public getCurrentTimeString(): string {
        const currentTime = new Date(this.getCurrentTime());
        return currentTime.toISOString();
    }
}



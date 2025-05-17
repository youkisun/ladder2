import { _decorator, Component, director } from 'cc';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

let wakeLock: WakeLockSentinel | null = null;

@ccclass('WakeLockManager')
export class WakeLockManager extends Component {

    protected onLoad(): void {
        if (!director.isPersistRootNode(this.node)) {
            director.addPersistRootNode(this.node);
        }
    }

    // Activate Wake Lock
    private async requestWakeLock(): Promise<void> {
        try {
            if ('wakeLock' in navigator) {
                wakeLock = await navigator.wakeLock.request('screen');
                Logger.log('Wake Lock is active');

                // Detect Wake Lock state changes
                wakeLock.addEventListener('release', () => {
                    Logger.log('Wake Lock was released');
                });
            } else {
                Logger.warn('Wake Lock API is not supported in this browser.');
            }
        } catch (err: any) {
            Logger.error(`Wake Lock request failed: ${err.name}, ${err.message}`);
        }
    }

    // Release Wake Lock
    private releaseWakeLock(): void {
        if (wakeLock !== null) {
            wakeLock.release();
            wakeLock = null;
            Logger.log('Wake Lock has been released');
        }
    }

    // Request Wake Lock when the component is enabled
    onEnable(): void {
        this.requestWakeLock();

        // Manage Wake Lock when the page visibility state changes
        document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Release Wake Lock when the component is disabled
    onDisable(): void {
        this.releaseWakeLock();
        document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // Page visibility change handler
    private handleVisibilityChange(): void {
        if (document.visibilityState === 'visible') {
            this.requestWakeLock();
        } else {
            this.releaseWakeLock();
        }
    }
}

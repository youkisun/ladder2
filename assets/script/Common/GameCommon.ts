import { _decorator, Component, Node } from 'cc';
import { GameUIManager, UIType } from '../Main/GameUIManager';
import { UIPopup } from '../UI/UIPopup';
const { ccclass, property } = _decorator;


export class GameCommon {

    private static _elapsedTime: number = Number.MAX_VALUE;
    private static _server_t_stamp: number = 0;

    public static showPopup(descLabel: string, titleLabel: string, isActiveCloseBtn: boolean, isActiveConfirmBtn: boolean = false) {
        const node = GameUIManager.getDefaultInstance().load(UIType.POPUP);
        if (node) {
            const uiPopup = node.getComponent(UIPopup);
            uiPopup.set(descLabel, titleLabel, isActiveCloseBtn, isActiveConfirmBtn);
        }
    }

    public static getTonCoinEffectCount(tonAmount: number): number {
        const minEffect = 3;
        const maxEffect = 20;
        const scalingFactor = 0.3; // 증가 속도를 조절하는 계수
    
        // Use a logarithmic function to gradually increase the effect count as tonAmount grows
        const effectCount = minEffect + (maxEffect - minEffect) * (1 - Math.exp(-scalingFactor * tonAmount));
    
        return Math.floor(effectCount);
    }

    public static calServerTimeStamp(elapsedTime:number, send_t_stamp:number, recv_t_stamp:number): number
    {
        if(this._server_t_stamp != 0 && elapsedTime >= this._elapsedTime)
        {
            return -1;
        }

        // Server delay time (time calculated on the server)
        let serverCalcTime = send_t_stamp - recv_t_stamp;
        // Time to receive the packet from the server
        let packetRecvTime = (elapsedTime - serverCalcTime) / 2;
        
        let lateTime = serverCalcTime + packetRecvTime;
        
        this._elapsedTime = elapsedTime;
        this._server_t_stamp = Math.max(0, recv_t_stamp + lateTime);
        //console.log(`[TEST] lateTime : ${lateTime}, server_t_stamp : ${server_t_stamp}`);
        return this._server_t_stamp;
    }
}


export class Logger {
    static log(...args: any[]) {        
        console.log("[LOG]", ...args);
    }

    static warn(...args: any[]) {
        console.warn("[WARN]", ...args);
    }

    static error(...args: any[]) {
        console.error("[ERROR]", ...args);
    }
}


import { EDITOR } from "cc/env";
import { UIHud } from "../UI/UIHud";
import { log, sys } from "cc";
import { Logger } from "../Common/GameCommon";
import { GameMainContext } from "../Main/GameMainContext";
import { GameSystemFile } from "../Utils/GameSystemFile";

declare global {
    interface Window {
        g_ac: string;
    }
}

export class GamePostRequest {
    private webURL: string;

    public Init() {
        this.webURL = GameSystemFile.getWebUrl();
    }

    public async sendInGamePostRequest(url: string, data: any, callback: (response: any, elapsedTimeStamp: number) => void) {

        if (GameMainContext.getDefault().isGameStop)
            return;

        url = this.webURL + url;
        const startTime = Date.now();

        // Add `ts` to `data`.
        const requestData = {
            ...data,
            ac: window.g_ac,
            ts: Date.now(),
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorMsg = `POST request error: HTTP error! Status: ${response.status}`;
            Logger.error(errorMsg);
            if (UIHud.getDefaultInstance() != null)
                UIHud.getDefaultInstance().setErrorMessageLabel(errorMsg);
            return; // Early return to stop execution
        }

        const jsonData = await response.json();
        log("POST request success:", jsonData);
        if (UIHud.getDefaultInstance() != null)
            UIHud.getDefaultInstance().setErrorMessageLabel(JSON.stringify(jsonData));

        if (!GameMainContext.getDefault().isInGameMode) {
            //console.error(`return sendInGamePostRequest`);
            return;
        }

        callback(jsonData, Date.now() - startTime);
    }

    public async sendLobbyPostRequest(url: string, data: any, callback: (response: any, elapsedTimeStamp: number) => void) {

        url = this.webURL + url;
        const startTime = Date.now();

        // Add `ts` to `data`.
        const requestData = {
            ...data,
            ac: window.g_ac,
            ts: Date.now(),
        };

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        if (!response.ok) {
            const errorMsg = `POST request error: HTTP error! Status: ${response.status}`;
            Logger.error(errorMsg);
            return; // Early return to stop execution
        }

        const jsonData = await response.json();
        log("POST request success:", jsonData);
        callback(jsonData, Date.now() - startTime);
    }




}
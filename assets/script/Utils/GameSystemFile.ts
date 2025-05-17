import { _decorator, Component, Node, sys } from 'cc';
import { Logger } from '../Common/GameCommon';
import { EDITOR } from 'cc/env';
const { ccclass, property } = _decorator;

declare const g_sys_urls: {
    webUrl: string;
    linkToShare: string;
    linkTelegram: string;
    linkX: string;
};

@ccclass('GameSystemFile')
export class GameSystemFile {
    private static DEFAULT_URL: string = "https://asdfasdf7777777.fun";
    private static JSON_FILE_PATH: string = "system.json";

    private static forceEditor: boolean = false;

    public static getWebUrl(): string {
        if (EDITOR || this.forceEditor) {            
            return this.DEFAULT_URL;
        }
        
        return g_sys_urls.webUrl;
    }

    /**
     * Extracts the `linkToShare` property from the JSON file.
     * @returns The `linkToShare` string or null if not found.
     */
    public static getLinkToShare(): string | null {

        if (EDITOR || this.forceEditor) {            
            return "https://t.me/username_TEST_PDRBBot/join";
        }
        
        return g_sys_urls.linkToShare;
    }

    /**
 * Extracts the `linkTelegram` property from the JSON file.
 * @returns The `linkTelegram` string or a default value if not found.
 */
    public static getLinkTelegram(): string {

        if (EDITOR || this.forceEditor) {            
            return "https://t.me/test2344134";
        }

        return g_sys_urls.linkTelegram;
    }

    /**
     * Extracts the `linkX` property from the JSON file.
     * @returns The `linkX` string or a default value if not found.
     */
    public static getLinkX(): string {
        if (EDITOR || this.forceEditor) {            
            return "https://x.com/test123434";
        }

        return g_sys_urls.linkX;
    }

    /**
     * Extracts the `version` property from the JSON file.
     * @returns The `version` string or a default value if not found.
     */
    public static getVersion(): string {
        return "1.0.0"; // Default version
    }
}



import { _decorator, Component, director, Node } from 'cc';
import { GameMain } from './GameMain';
import { GameMainContext } from './GameMainContext';
import { GameNetwork } from '../Network/GameNetwork';
const { ccclass, property } = _decorator;

@ccclass('GameLoadingInGame')
export class GameLoadingScene extends Component {
    private static _initReqSent: boolean = false;

    @property({ type: Node })
    private rootNode: Node;

    @property({ type: String })
    private targetSceneName: string = '';

    @property
    private waitTime: number = 1;

    protected onLoad(): void {
        if (this.rootNode != null)
            this.rootNode.active = false;

        if (!(GameLoadingScene as any)._initReqSent) {
            GameNetwork.getDefaultInstance().SendInitReq(true);
            (GameLoadingScene as any)._initReqSent = true;
        }
    }

    start() {
        GameMainContext.getDefault().clear();
        // Wait for 2 seconds before starting the loading process
        this.scheduleOnce(() => {
            director.preloadScene(this.targetSceneName, (completedCount, totalCount) => {
                // Loading progress can be calculated
                // const progress = completedCount / totalCount;
                // this.progressBar.progress = progress;
            }, () => {
                director.loadScene(this.targetSceneName);
            });
        }, this.waitTime);
    }

    protected onEnable(): void {
        if (this.rootNode != null)
            this.rootNode.active = true;
    }
}

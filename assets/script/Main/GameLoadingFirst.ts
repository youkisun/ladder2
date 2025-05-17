import { _decorator, Component, director, Node, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameLoadingFirst')
export class GameLoadingFirst extends Component {
    start() {
        view.setDesignResolutionSize(1080, 1920, view.getResolutionPolicy());
        director.preloadScene("loadingStart", (completedCount, totalCount) => {
                        
                    }, () => {
                        director.loadScene("loadingStart");
                    });
    }

}



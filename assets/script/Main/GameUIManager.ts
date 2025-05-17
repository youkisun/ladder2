import { _decorator, Component, instantiate, Node, Prefab, resources } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

export enum UIType {
    ROULETTE = "Roulette",
    HISTORY = "History",
    MY_INFORMATION = "MyInform",
    ENTER_TEXT_PANEL = "EnterTextPanel",
    TOP_MSG_ALARAM = "TopMsgAlaram",
    ATTENDANCE_BONUS = "AttendanceBonus",
    POPUP = "Popup",
}

@ccclass('GameUIManager')
export class GameUIManager extends DefaultComponent<GameUIManager> {

    @property(Node)
    private parentNode: Node;

    @property([Node])
    private parentsNodes: Node[] = [];

    // 프리팹 경로 매핑
    // private prefabIndex: { [key in UIType]: number } = {
    //     [UIType.ROULETTE]: "UI/prefabs/UIBonusRoulette",
    //     [UIType.HISTORY]: "UI/prefabs/UIHistory",
    //     [UIType.MY_INFORMATION]: "UI/prefabs/UIMyInformation",
    //     [UIType.ENTER_TEXT_PANEL]: "UI/prefabs/UIEnterTextPanel",
    //     [UIType.TOP_MSG_ALARAM]: "UI/prefabs/UITopMsgAlaram",
    // };

    private prefabIndex: { [key in UIType]: number } = {
        [UIType.ROULETTE]: 0,
        [UIType.HISTORY]: 1,
        [UIType.MY_INFORMATION]: 2,
        [UIType.ENTER_TEXT_PANEL]: 3,
        [UIType.TOP_MSG_ALARAM]: 4,
        [UIType.ATTENDANCE_BONUS]: 5,
        [UIType.POPUP]: 6,
    };

    @property([Prefab])
    private prefabNodes: Prefab[] = [];

    private loadedResources: Map<UIType, Node> = new Map();

    start() {
        
    }

    update(deltaTime: number) {
        
    }

    public load(type: UIType): Node | null {
        console.log(`[LOAD] Load Start - type:${type}`);

        if (this.loadedResources.has(type)) {
            console.log(`[LOAD] Load Start - 2`);
            let resourceNode = this.loadedResources.get(type);
            resourceNode.active = true;
            return resourceNode || null;
        }

        const prefab = this.prefabNodes[this.prefabIndex[type]];//this.loadPrefab(path);
        if (!prefab) {
            return null;
            console.log(`[LOAD] Load Start - 3`);
        }

        const node = instantiate(prefab);

        if (type == UIType.ROULETTE) {
            node.parent = this.parentsNodes[0];
        }
        else if (type == UIType.HISTORY) {
            node.parent = this.parentsNodes[1];
        }
        else if (type == UIType.MY_INFORMATION) {
            node.parent = this.parentsNodes[1];
        }
        else if (type == UIType.ENTER_TEXT_PANEL) {
            node.parent = this.parentsNodes[1];
        }
        else if (type == UIType.TOP_MSG_ALARAM) {
            node.parent = this.parentsNodes[1];
        }
        else if (type == UIType.ATTENDANCE_BONUS) {
            node.parent = this.parentsNodes[0];
        }
        else if (type == UIType.POPUP) {
            node.parent = this.parentsNodes[1];
        }


//        node.parent = this.parentNode;

        this.loadedResources.set(type, node);
        console.log(`[LOAD] Load Start - 4`);
        return node;
    }

    public isShow(type: UIType): boolean | null {
        if (this.loadedResources.has(type)) {
            let resourceNode = this.loadedResources.get(type);
            if(resourceNode == null)
                return false;
            return resourceNode.active;
        } else {
            //Logger.warn(`${type} is not loaded.`);
            return false;
        }
    }

    public get(type: UIType): Node | null {
        if (this.loadedResources.has(type)) {
            return this.loadedResources.get(type) || null;
        } else {
            //Logger.warn(`${type} is not loaded.`);
            return null;
        }
    }

    public hide(type: UIType): void {
        const node = this.loadedResources.get(type);
        if (node) {
            console.log(`[LOAD] Hide - type:${type}`);
            node.active = false;
            //this.loadedResources.delete(type);
        }
    }

    public hideAll(): void {
        this.loadedResources.forEach((node, type) => {
            if (node && node.isValid) {
                console.log(`[LOAD] HideAll - type:${type}`);
                node.active = false;
            }
        });
        //this.loadedResources.clear();
    }

}

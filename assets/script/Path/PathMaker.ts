import { _decorator, Node, Sprite, Vec3 } from "cc";
import { DefaultComponent } from "../Utils/GameUtils";
import { UIPath } from "../UI/UIPath";
import { Logger } from "../Common/GameCommon";
const { ccclass, property } = _decorator;

@ccclass("PathMaker")
export class PathMaker extends DefaultComponent<PathMaker> {

    protected onLoad() {
        super.onLoad();
        const uiPath = UIPath.getDefaultInstance();

        this.pathPoint = [
            new PathPoint(PathMaker.POINT_TYPE_START, [uiPath.startPointNodes[0], uiPath.startPointNodes[1]]),
            new PathPoint(PathMaker.POINT_TYPE_MOVE, [uiPath.middle0PointNodes[0], uiPath.middle0PointNodes[1]]),
            new PathPoint(PathMaker.POINT_TYPE_MOVE, [uiPath.middle1PointNodes[0], uiPath.middle1PointNodes[1]]),
            new PathPoint(PathMaker.POINT_TYPE_MOVE, [uiPath.middle2PointNodes[0], uiPath.middle2PointNodes[1]]),
            new PathPoint(PathMaker.POINT_TYPE_FINISH, [uiPath.endPointNodes[0], uiPath.endPointNodes[1]]),
        ];

        
        Logger.log(`[STATE] PathMaker.Init`);

        this.isPrepare = true;
    }

    public static POINT_TYPE_START = 0;
    public static POINT_TYPE_MOVE = 1;
    public static POINT_TYPE_FINISH = 2;

    private readonly PATH_POINT_COUNT = 5;
    private pathPoint: PathPoint[];
    private isPrepare: boolean = false;

    public setHidePath()
    {
        this.setPath(0, false);
        this.setPath(1, false);
        this.setPath(2, false);
    }

    public setPath(index:number, pathOn: boolean) {
        this.pathPoint[index+1].isActive = pathOn;

        UIPath.getDefaultInstance().setHorizontalLoad(index, pathOn);
    }

    public tryGetStartPosition(): { success: boolean; leftStartPos: Vec3; rightStartPos: Vec3 } {
        const leftStartPos = this.pathPoint[0].positionNodes[0].getWorldPosition();
        const rightStartPos = this.pathPoint[0].positionNodes[1].getWorldPosition();
        return { success: true, leftStartPos, rightStartPos };
    }

    public tryGetPath(posType: number): { success: boolean; positions: Vec3[] } {
        const positions: Vec3[] = [];
        let direction = posType;

        for (let i = 1; i < 4; i++) {
            const pathPoint = this.pathPoint[i];
            if (pathPoint.isActive) {
                positions.push(pathPoint.positionNodes[direction].getWorldPosition());
                direction = (direction + 1) % 2;
                positions.push(pathPoint.positionNodes[direction].getWorldPosition());
            }
        }

        positions.push(this.pathPoint[4].positionNodes[direction].getWorldPosition());        
        return { success: true, positions };
    }
}

class PathPoint {
    public pointType: number;
    public isActive: boolean;
    public positionNodes: Node[];

    constructor(pointType: number, positions: Node[]) {
        this.pointType = pointType;
        this.positionNodes = positions;
        this.isActive = true;
    }
}


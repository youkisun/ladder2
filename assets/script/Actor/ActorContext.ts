import { ActorType } from "./Actor";

export class ActorContext {
    positionType: number;
    private _actorType: ActorType;
    actorTypeInt: number;

    constructor() {
        this.actorTypeInt = 0;
    }

    get actorType(): ActorType {
        return this._actorType;
    }

    set actorType(value: ActorType) {
        this._actorType = value;
        this.actorTypeInt = value as number;
    }
}
import { _decorator, Component, tween, Vec3 } from 'cc';
const { ccclass } = _decorator;

export class GameUtil {
    /**
     * Generates a unique GUID string.
     * @returns GUID string
     */
    public static getGuidHashString(): string {
        return `${this.generateGuid()}-${this.generateGuid()}-${this.generateGuid()}-${this.generateGuid()}`;
    }

    /**
     * Returns 0 or 1 to determine even or odd.
     * @returns 0 or 1
     */
    public static getEvenOrOdd(): number {
        return Math.floor(Math.random() * 2);
    }

    /**
     * Method used internally to generate GUID parts.
     * @returns GUID part string
     */
    private static generateGuid(): string {
        return Math.random().toString(16).substring(2, 10);
    }

    public static getToggleActor(value: number): number {
        return value === 1 ? 2 : 1;
    }

    public static toTwoDecimal(value: number): number {
        let getValue = Math.round(value * 100) / 100; // Round to the second decimal place
        return parseFloat(getValue.toFixed(1)); // Keep up to the first decimal place
    }
}

export class Default<T> {
    private static _defaultMap: Map<string, any> = new Map();

    /**
     * Retrieves the default instance. Creates one if it does not exist.
     */
    public static getDefault<T>(this: new () => T): T {
        const className = this.name;

        if (!Default._defaultMap.has(className)) {
            Default._defaultMap.set(className, new this());
        }

        return Default._defaultMap.get(className);
    }

    /**
     * Releases the default instance.
     */
    public static releaseDefault<T>(this: new () => T): void {
        const className = this.name;

        if (Default._defaultMap.has(className)) {
            Default._defaultMap.delete(className);
        }
    }

    constructor() {
        const className = (this.constructor as typeof Default<T>).name;

        if (Default._defaultMap.has(className)) {
            throw new Error(
                `Default: Cannot create more than one instance of ${className}`
            );
        }
    }
}

@ccclass('DefaultComponent')
export abstract class DefaultComponent<T extends DefaultComponent<T>> extends Component {
    // Map to store the default instance for each derived class
    private static _instances: Map<any, DefaultComponent<any>> = new Map();

    /**
     * Retrieves the default instance of the class.
     * Creates a new one if it does not exist.
     */
    public static getDefaultInstance<T extends DefaultComponent<T>>(this: new (...args: any[]) => T): T | null {
        const classType = this as unknown as typeof DefaultComponent;

        if (!classType._instances.has(this)) {
            return null;
        }

        return classType._instances.get(this) as T;
    }

    /**
     * Initializes the default instance for the derived class.
     * Throws an error if an instance already exists.
     */
    protected static initializeDefaultInstance<T extends DefaultComponent<T>>(this: new (...args: any[]) => T, instance: T): void {
        const classType = this as unknown as typeof DefaultComponent;

        if (classType._instances.has(this)) {
            throw new Error(
                `DefaultComponent: Cannot create more than one instance of ${this.name}`
            );
        }

        classType._instances.set(this, instance);
    }

    protected onLoad() {
        const classType = this.constructor as typeof DefaultComponent;
        if (!classType._instances.has(this.constructor)) {
            classType._instances.set(this.constructor, this);
        } else {
            throw new Error(
                `DefaultComponent: Cannot create more than one instance of ${this.constructor.name}`
            );
        }
    }

    onDestroy() {
        const classType = this.constructor as typeof DefaultComponent;
        if (classType._instances.get(this.constructor) === this) {
            classType._instances.delete(this.constructor);
        }
    }
}

type Action = () => void;
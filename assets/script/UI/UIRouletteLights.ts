import { _decorator, Color, Component, Node, Sprite, Tween } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
const { ccclass, property } = _decorator;

@ccclass('UIRouletteLights')
export class UIRouletteLights extends DefaultComponent<UIRouletteLights> {
    @property([Node])
    lightNodes: Node[] = [];

    private isBlinkSequentially = false;
    private isBlinkAlternately = false;
    private activeTween: Tween<any>[] = []; // Manage active Tweens

    start() {
        // Set all lights to hidden state initially
        this.lightNodes.forEach(node => {
            let sprite = node.getComponent(Sprite);
            if (sprite) sprite.color = new Color(255, 255, 255, 0);
        });

        this.blinkAlternately();
    }

    public stopAllEffects() {
        this.isBlinkSequentially = false;
        this.isBlinkAlternately = false;
        
        // Stop all active Tweens
        this.activeTween.forEach(tween => tween.stop());
        this.activeTween = [];

        this.lightNodes.forEach(node => {
            let sprite = node.getComponent(Sprite);
            if (sprite) sprite.color = new Color(255, 255, 255, 0);
        });
    }

    public blinkSequentially(index: number = 0) {
        if(this.isBlinkAlternately)
            this.stopAllEffects();
        this.isBlinkSequentially = true;

        if (this.lightNodes.length === 0) return;

        let node = this.lightNodes[index];
        if (!node) return;

        let sprite = node.getComponent(Sprite);
        if (!sprite) return;

        let tween = new Tween(sprite)
            .to(0.1, { color: new Color(255, 255, 255, 255) }) // Brighten
            .call(() => {
                let nextIndex = (index + 1) % this.lightNodes.length;
                if (this.isBlinkSequentially) {
                    this.blinkSequentially(nextIndex);
                }
            })
            .delay(1) // Maintain for 1 second
            .to(0.5, { color: new Color(255, 255, 255, 0) }) // Fade out
            .start();

        this.activeTween.push(tween);
    }

    public blinkAlternately(isEven: boolean = true) {
        if(this.isBlinkSequentially)
            this.stopAllEffects();
        this.isBlinkAlternately = true;

        if (this.lightNodes == null || this.lightNodes.length === 0) return;

        let nodesToBlink = this.lightNodes.filter((_, index) => (index % 2 === 0) === isEven);
        
        nodesToBlink.forEach(node => {
            let sprite = node.getComponent(Sprite);
            if (sprite) {
                let tween = new Tween(sprite)
                    .to(0.1, { color: new Color(255, 255, 255, 255) }) // Brighten
                    .delay(0.5) // Maintain for 0.5 seconds
                    .to(0.5, { color: new Color(255, 255, 255, 0) }) // Fade out
                    .start();

                this.activeTween.push(tween);
            }
        });

        // Blink alternately on the opposite side after 0.6 seconds
        setTimeout(() => {
            if (this.isBlinkAlternately) {
                this.blinkAlternately(!isEven);
            }
        }, 600);
    }
}

import { _decorator, AudioClip, AudioSource, Component, director, Node, tween, Tween } from 'cc';
import { DefaultComponent } from '../Utils/GameUtils';
import { Logger } from '../Common/GameCommon';
const { ccclass, property } = _decorator;

@ccclass('GameAudioManger')
export class GameAudioManger extends DefaultComponent<GameAudioManger> {
    @property([AudioClip])
    private bgmClips: AudioClip[] = [];

    @property(AudioClip)
    private buttonClickSfx: AudioClip = null;
    @property(AudioClip)
    private startSfx: AudioClip = null;
    @property(AudioClip)
    private resultSfx: AudioClip = null;

    @property(AudioClip)
    private alertSfx: AudioClip = null;

    @property(AudioClip)
    private roulletPlaySfx: AudioClip = null;

    @property(AudioClip)
    private walkSfx: AudioClip = null;

    @property(AudioClip)
    private winSfx: AudioClip = null;

    @property(AudioClip)
    private loseSfx: AudioClip = null;

    private bgmAudioSources: AudioSource[] = [];
    private sfxAudioSources: AudioSource[] = []; 
    private prevBgmIndex: number = -1;
    private currentBgmIndex: number = -1;
    private fadeDuration: number = 2.0; 
    private bgmFadeTweens: Tween<AudioSource>[] = [];


    private isMute: boolean = false;

    protected onLoad(): void {
        super.onLoad();

        for (let i = 0; i < 2; i++) {
            const audioSource = this.node.addComponent(AudioSource);
            audioSource.loop = true;
            audioSource.volume = 0;
            audioSource.playOnAwake = false;
            this.bgmAudioSources.push(audioSource);
        }

        for (let i = 0; i < 5; i++) {
            const audioSource = this.node.addComponent(AudioSource);
            audioSource.loop = false;
            audioSource.playOnAwake = false;
            this.sfxAudioSources.push(audioSource);
        }

        if (!director.isPersistRootNode(this.node)) {
            director.addPersistRootNode(this.node);
        }
    }

    start() {

    }

    public playBGM(index: number = 0, startTime: number = 0) {

        if (this.bgmClips.length === 0) return;

        index = Math.max(0, Math.min(this.bgmClips.length - 1, index));

        if (this.currentBgmIndex === index) {
            const currentSource = this.bgmAudioSources[index];
            currentSource.currentTime = startTime;
            return;
        }

        this.prevBgmIndex = this.currentBgmIndex;
        this.currentBgmIndex = index;

        if (this.prevBgmIndex !== -1) {
            const oldSource = this.bgmAudioSources[this.prevBgmIndex];
            this.fadeOutBGM(oldSource);
        }

        const newSource = this.bgmAudioSources[index];
        newSource.clip = this.bgmClips[index];
        newSource.volume = 0;
        newSource.currentTime = startTime; 
        newSource.play();

        this.fadeInBGM(newSource);
    }

    public stopAll() {
        this.stopFadeTweens();

        this.bgmAudioSources.forEach(audio => {
            audio.stop();
            audio.volume = 0;
        });

        this.prevBgmIndex = -1;
        this.currentBgmIndex = -1;

        this.stopSound();
    }


    private stopFadeTweens() {
        this.bgmFadeTweens.forEach(t => t.stop());
        this.bgmFadeTweens.length = 0;
    }

    private fadeOutBGM(audio: AudioSource) {

        if (this.isMute) {
            audio.stop();
            return;
        }

        const t = tween(audio)
            .to(this.fadeDuration, { volume: 0 }, { easing: 'linear' })
            .call(() => audio.stop())
            .start();

        this.bgmFadeTweens.push(t);
    }


    private fadeInBGM(audio: AudioSource) {

        if (this.isMute) return;

        const t = tween(audio)
            .to(this.fadeDuration, { volume: 1 }, { easing: 'linear' })
            .start();

        this.bgmFadeTweens.push(t);
    }




    public playSound(type: 'button' | 'start' | 'result' | 'alert' | 'roulletPlay' | 'walk' | 'win' | `lose`, loop: boolean = false): AudioSource {
        let clip: AudioClip = this.getSfxClip(type);
        if (!clip) {
            Logger.warn(`Sound type "${type}" is not assigned.`);
            return null;
        }

        if (this.isMute)
            return null;

        let audioSource = this.sfxAudioSources.find(source => !source.playing);

        if (!audioSource) {
            audioSource = this.node.addComponent(AudioSource);
            this.sfxAudioSources.push(audioSource);
        }

        audioSource.clip = clip;
        audioSource.loop = loop;
        audioSource.play();

        return audioSource; 
    }

    public stopSound(type?: 'button' | 'start' | 'result' | 'alert' | 'roulletPlay' | 'walk' | 'win' | 'lose', fadeOutDuration: number = 0) {
        if (type) {
            const clip = this.getSfxClip(type);
            this.sfxAudioSources.forEach(audioSource => {
                if (audioSource.clip === clip) {
                    if (fadeOutDuration > 0) {
                        this.fadeOutSound(audioSource, fadeOutDuration);
                    } else {
                        audioSource.stop();
                    }
                }
            });
        } else {
            this.sfxAudioSources.forEach(audioSource => {
                if (fadeOutDuration > 0) {
                    this.fadeOutSound(audioSource, fadeOutDuration);
                } else {
                    audioSource.stop();
                }
            });
        }
    }

    private fadeOutSound(audio: AudioSource, duration: number) {
        if (this.isMute) {
            audio.stop(); 
            return;
        }
        tween(audio).to(duration, { volume: 0 }, { easing: 'linear' })
            .call(() => audio.stop())
            .start();
    }

    private getSfxClip(type: 'button' | 'start' | 'result' | 'alert' | 'roulletPlay' | 'walk' | 'win' | `lose`): AudioClip {
        switch (type) {
            case 'button': return this.buttonClickSfx;
            case 'start': return this.startSfx;
            case 'result': return this.resultSfx;
            case 'alert': return this.alertSfx;
            case 'roulletPlay': return this.roulletPlaySfx;
            case 'walk': return this.walkSfx;
            case 'win': return this.winSfx;
            case 'lose': return this.loseSfx;
            default: return null;
        }
    }

    public setVolume(volume: number) {
        this.bgmAudioSources.forEach(audio => {
            audio.volume = Math.max(0, Math.min(1, volume));
        });
    }

    public setSfxVolume(volume: number) {
        this.sfxAudioSources.forEach(audio => {
            audio.volume = Math.max(0, Math.min(1, volume));
        });
    }

    public setMute(value: boolean) {

        console.log("[TEST] setMute");
        this.isMute = value;
        this.setVolume(value ? 0 : 1);
        this.setSfxVolume(value ? 0 : 1);
    }

    onDestroy() {
        this.stopAll();
        this.stopSound(undefined);
    }

}

import seedrandom from 'seedrandom';

export class GameRandom {
    private rng: () => number;

    constructor(seed?: string) {
        if (seed) {
            this.rng = seedrandom(seed); // String-based seed
        } else {
            this.rng = seedrandom(); // Random seed
        }
    }

    // Generate the next random number
    private next(): number {
        return this.rng();
    }

    // Generate a random integer within the range [min, untilMax]
    public nextInRange(min: number, untilMax: number): number {
        untilMax += 1;
        return Math.floor(min + this.next() * (untilMax - min));
    }
}
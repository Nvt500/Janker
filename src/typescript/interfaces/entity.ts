abstract class Entity
{
    constructor(
        protected _centerX: number,
        protected _centerY: number,
    ) {}

    get centerX(): number { return this._centerX; }
    get centerY(): number { return this._centerY; }
}
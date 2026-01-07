abstract class Circle extends Entity
{
    constructor(
        centerX: number,
        centerY: number,
        protected _radius: number) 
    {
        super(centerX, centerY);
    }

    get radius(): number { return this._radius; }
}
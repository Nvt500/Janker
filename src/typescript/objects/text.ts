class GameText implements Drawable
{
    constructor(private _text: string, private x: number, private y: number) {}

    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "black";
        ctx.fillText(this._text, this.x, this.y);
    }

    set text(t: string)
    {
        this._text = t;
    }
}
class DrawingContext2D
{
    public xOffset: number = 0;
    public yOffset: number = 0;
    private font = "Arial";

    constructor(private ctx: CanvasRenderingContext2D, private _fillStyle: string) 
    {
        ctx.font = "20px " + this.font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    set fillStyle(style: string)
    {
        this._fillStyle = style;
        this.ctx.fillStyle = this._fillStyle;
    }
    
    set fontSize(size: number)
    {
        this.ctx.font = size + "px " + this.font;
    }

    set textAlign(style: CanvasTextAlign)
    {
        this.ctx.textAlign = style;
    }

    set textFont(font: string)
    {
        this.font = font;
    }

    public fillRect(x: number, y: number, width: number, height: number): void
    {
        this.ctx.fillRect(x + this.xOffset, y + this.yOffset, width, height);
    }

    public fillCircle(x: number, y: number, radius: number): void
    {
        this.ctx.beginPath();
        this.ctx.arc(x + this.xOffset, y + this.yOffset, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    public fillText(text: string, x: number, y: number, fontSize?: number): void
    {
        if (fontSize !== undefined)
            this.ctx.font = fontSize + "px " + this.font;
        this.ctx.fillText(text, x + this.xOffset, y + this.yOffset);
    }

    public clearRect(x: number, y: number, width: number, height: number)
    {
        this.ctx.clearRect(x, y, width, height);
    }
}
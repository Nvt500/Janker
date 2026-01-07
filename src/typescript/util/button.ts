class Button extends Rect
{
    private static buttons = [];
    public static canvasOffset = { x: 0, y: 0 };

    public static clickEvent(event: MouseEvent): void
    {
        for (const button of Button.buttons)
        {
            if (!button.isActive)
                continue;
            if (
                event.pageX - Button.canvasOffset.x < button.x + button.width &&
                event.pageX - Button.canvasOffset.x > button.x &&
                event.pageY - Button.canvasOffset.y < button.y + button.height &&
                event.pageY - Button.canvasOffset.y > button.y
            )
            {
                if (button.clickFunc !== undefined)
                    button.clickFunc({ x: event.pageX - Button.canvasOffset.x, y: event.pageY - Button.canvasOffset.y });
            }
            else if (button.clickOffFunc !== undefined)
                button.clickOffFunc({ x: event.pageX - Button.canvasOffset.x, y: event.pageY - Button.canvasOffset.y });
        }
    }

    private onClickFunc: (pos: Vector) => void = undefined;
    private onClickOffFunc: (pos: Vector) => void = undefined;
    private active: boolean = false;

    get clickFunc(): (pos: Vector) => void
    {
        return this.onClickFunc;
    }

    get clickOffFunc(): (pos: Vector) => void
    {
        return this.onClickOffFunc;
    }
    
    get isActive(): boolean
    {
        return this.active;
    }

    constructor(
        protected text: string, 
        x: number,
        y: number,
        width: number,
        height: number) 
    {
        super(x, y, width, height);
        Button.buttons.push(this);
    }

    public setText(t: string): void
    {
        this.text = t;
    }

    public getText(): string
    {
        return this.text;
    }

    public changeDimensions(x: number, y: number, width: number, height: number): void
    {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public activate(): void
    {
        this.active = true;
    }

    public deactivate(): void
    {
        this.active = false;
    }

    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = "black";
        ctx.fillText(this.text, this.x + this.width/2, this.y + this.height/2);
    }

    public onClickHook(func: (pos: Vector) => void): void
    {
        this.onClickFunc = func;
    }

    public onClickOffHook(func: (pos: Vector) => void): void
    {
        this.onClickOffFunc = func;
    }
}
window.addEventListener("mouseup", Button.clickEvent);
class Exit extends CollidableRect implements Drawable
{
    constructor(
        x: number, 
        y: number, 
        width: number, 
        height: number,
        private connectedInstance: Instance,
        private transportX: number,
        private transportY: number,
        ) 
    {
        super(x, y, width, height);
    }

    get instance(): Instance
    {
        return this.connectedInstance;
    }

    get newX(): number { return this.transportX; }
    get newY(): number { return this.transportY; }

    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
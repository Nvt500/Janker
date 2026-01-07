class Terrain extends CollidableRect implements Drawable
{
    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "green";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
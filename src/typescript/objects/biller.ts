// Ball + Killer = Biller
class Biller extends CollidableRect implements Drawable
{
    public draw(ctx: DrawingContext2D): void
    {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}
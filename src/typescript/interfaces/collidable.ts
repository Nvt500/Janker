interface Collidable
{
    collidesWith(other: Collidable): boolean;
}

abstract class CollidableRect extends Rect implements Collidable
{
    public collidesWith(other: Collidable): boolean
    {
        if (other instanceof CollidableRect)
        {
            return CollisionHelper.rectCollidesWithRect(this, other);
        }
        else if (other instanceof CollidableCircle)
        {
            return CollisionHelper.rectCollidesWithCircle(this, other);
        }
        else
        {
            throw Error(`Other (${other}) cannot be collided with.`);
        }
    }
}

abstract class CollidableCircle extends Circle implements Collidable
{
    public collidesWith(other: Collidable): boolean
    {
        if (other instanceof CollidableCircle)
        {
            return CollisionHelper.circleCollidesWithCircle(this, other);
        }
        else if (other instanceof CollidableRect)
        {
            return CollisionHelper.rectCollidesWithCircle(other, this);
        }
        else
        {
            throw Error(`Other (${other}) cannot be collided with.`);
        }
    }
}

class CollisionHelper
{
    public static rectCollidesWithRect(rect1: CollidableRect, rect2: CollidableRect): boolean
    {
        return rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y;
    }

    // Yeah, I don't think this works btw...
    public static rectCollidesWithCircle(rect: CollidableRect, circle: CollidableCircle): boolean
    {
        let testX: number = circle.centerX;
        let testY: number = circle.centerY;
        if (circle.centerX < rect.x) 
            testX = rect.x;
        else if (circle.centerX > rect.x + rect.width) 
            testX = rect.x + rect.width;
        if (circle.centerY < rect.y) 
            testY = rect.y;
        else if (circle.centerY > rect.y + rect.height) 
            testX = rect.y + rect.height;
        return Math.sqrt(
            (circle.centerX - testX) ** 2 +
            (circle.centerY - testY) ** 2) <= circle.radius;
    }

    public static circleCollidesWithCircle(circle1: CollidableCircle, circle2: CollidableCircle): boolean
    {
        return Math.sqrt(
            (circle1.centerX - circle2.centerX) ** 2 + 
            (circle1.centerY - circle2.centerY) ** 2) < 
            circle1.radius + circle2.radius;
    }
}
const VERSION = "0.1.0"; // TODO ALWAYS CHANGE THIS

enum GameState
{
    TITLE,
    LEVEL_SELECT,
    LEVEL,
    LEVEL_EDITOR,
}

let DELTA_TIME = 1; // Erm, next patch... probably

function main(): void
{
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    Button.canvasOffset.x = canvas.offsetLeft;
    Button.canvasOffset.y = canvas.offsetTop;
    if (canvas === null)
    {
        alert("Canvas with id 'canvas'does not exist.");
        return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null)
    {
       alert("2d context cannot be gotten.");
       return;
    }
    
    let gameState = GameState.TITLE;
    const titleScreen = new TitleScreen(ctx);
    titleScreen.activate();
    titleScreen.draw();
    const levelSelectScreen = new LevelSelectScreen(ctx);
    const levelEditorScreen = new LevelEditorScreen(ctx);
    let level: Level | string;
    let player: Player;
    function render()
    {
        switch (gameState)
        {
            case GameState.TITLE:
                if (titleScreen.getGameState() == GameState.LEVEL_SELECT)
                {
                    gameState = GameState.LEVEL_SELECT;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    titleScreen.deactivate();
                    levelSelectScreen.activate();
                    levelSelectScreen.reset();
                    levelSelectScreen.draw();
                }
                else if (titleScreen.getGameState() == GameState.LEVEL_EDITOR)
                {
                    gameState = GameState.LEVEL_EDITOR;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    titleScreen.deactivate();
                    levelEditorScreen.activate();
                    levelEditorScreen.reset();
                    levelEditorScreen.draw();
                }
                break;
            case GameState.LEVEL_SELECT:
                if (levelSelectScreen.getGameState() == GameState.LEVEL && levelSelectScreen.getSelectedLevelIndex() !== null)
                {
                    gameState = GameState.LEVEL;
                    level = Level.fromLevelString(
                        LEVELS[levelSelectScreen.getSelectedLevelIndex()],
                        0, 0,
                        canvas.width, canvas.height,
                        new DrawingContext2D(ctx, "black")
                    );
                    if (typeof level == "string")
                    {
                        console.log(level);
                        return;
                    }
                    player = level.player;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    levelSelectScreen.deactivate();
                }
                else if (levelSelectScreen.getGameState() == GameState.TITLE)
                {
                    gameState = GameState.TITLE;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    levelSelectScreen.deactivate();
                    titleScreen.activate();
                    titleScreen.reset();
                    titleScreen.draw();
                }
                break;
            case GameState.LEVEL:
                let direction = { x: 0, y: 0 };
                Keyboard.match_keys_down((key: string) => {
                    switch (key.toLowerCase())
                    {
                        case "d":
                        case "arrowright":
                            direction.x += 1;
                            break;
                        case "a":
                        case "arrowleft":
                            direction.x += -1;
                            break;
                        case "w":
                        case "arrowup":
                            direction.y += 1;
                            break;
                        case " ":
                            player.jumpPressed();
                            break;
                        case "s":
                        case "arrowdown":
                            direction.y += -1;
                            break;
                        case "shift":
                            player.shoot();
                            break;
                        default:
                            break;
                    }
                });
                Keyboard.match_keys_up((key: string) => {
                    switch(key.toLowerCase())
                    {
                        case "m":
                            level.playerInExit(true);
                            break;
                        case "r":
                            player.tp(level.startX, level.startY);
                            break;
                        case " ":
                            player.jumpReleased();
                            break;
                        default:
                            break;
                    }
                });

                if (player.act(direction, level.currentInstance.collidables))
                {
                    player.tp(level.startX, level.startY);
                }
                if (level.playerInExit())
                {
                    gameState = GameState.LEVEL_SELECT
                    level = undefined;
                    player = undefined;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    levelSelectScreen.activate();
                    levelSelectScreen.reset();
                    levelSelectScreen.draw();
                }
                else
                    level.draw();
                break;
            case GameState.LEVEL_EDITOR:
                if (levelEditorScreen.getGameState() == GameState.TITLE)
                {
                    gameState = GameState.TITLE;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    levelEditorScreen.deactivate();
                    titleScreen.activate();
                    titleScreen.reset();
                    titleScreen.draw();
                    break;
                }

                if (levelEditorScreen.player !== undefined)
                {
                let direction2 = { x: 0, y: 0 };
                Keyboard.match_keys_down((key: string) => {
                    switch (key.toLowerCase())
                    {
                        case "d":
                        case "arrowright":
                            direction2.x += 1;
                            break;
                        case "a":
                        case "arrowleft":
                            direction2.x += -1;
                            break;
                        case "w":
                        case "arrowup":
                            direction2.y += 1;
                            break;
                        case " ":
                            levelEditorScreen.player.jumpPressed();
                            break;
                        case "s":
                        case "arrowdown":
                            direction2.y += -1;
                            break;
                        case "shift":
                            levelEditorScreen.player.shoot();
                            break;
                        default:
                            break;
                    }
                });
                Keyboard.match_keys_up((key: string) => {
                    switch(key.toLowerCase())
                    {
                        case "m":
                            levelEditorScreen.level.playerInExit(true);
                            break;
                        case "r":
                            levelEditorScreen.player.tp(levelEditorScreen.level.startX, levelEditorScreen.level.startY);
                            break;
                        case " ":
                            levelEditorScreen.player.jumpReleased();
                            break;
                        default:
                            break;
                    }
                });

                if (levelEditorScreen.player.act(direction2, levelEditorScreen.level.currentInstance.collidables) || levelEditorScreen.level.playerInExit())
                {
                    levelEditorScreen.player.tp(levelEditorScreen.level.startX, levelEditorScreen.level.startY);
                }
                }
                levelEditorScreen.draw();
                break;
        }
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}
main();
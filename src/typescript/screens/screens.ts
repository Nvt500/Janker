class TitleScreen
{
    private readonly context: DrawingContext2D;
    private readonly width: number;
    private readonly height: number;
    private gameState: GameState = GameState.TITLE;
    private playButton: Button;
    private editorButton: Button;

    constructor(ctx: CanvasRenderingContext2D)
    {
        this.context = new DrawingContext2D(ctx, "black");
        this.context.fontSize = 40;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.playButton = new Button("Play", this.width / 2 - 75, this.height / 2 - 50, 150, 100);
        this.playButton.onClickHook(() => {
            this.gameState = GameState.LEVEL_SELECT;
        });
        this.editorButton = new Button("Level Editor", this.width / 2 - 125, this.height / 2 + 75, 250, 100);
        this.editorButton.onClickHook(() => {
            this.gameState = GameState.LEVEL_EDITOR;
        });
    }

    public getGameState(): GameState
    {
        return this.gameState;
    }

    public draw(): void
    {
        this.context.fillStyle = "black";
        this.context.fillText("Janker", this.width / 2, this.height / 2 - 100);
        this.playButton.draw(this.context);
        this.editorButton.draw(this.context);
        this.context.fillText(`v${VERSION}`, this.width - 100, this.height - 50);
    }

    public activate(): void
    {
        this.playButton.activate();
        this.editorButton.activate();
    }

    public deactivate(): void
    {
        this.playButton.deactivate();
        this.editorButton.activate();
    }

    public reset(): void
    {
        this.gameState = GameState.TITLE;
        this.context.fontSize = 40;
    }
}

class LevelSelectScreen
{
    private readonly context: DrawingContext2D;
    private readonly width: number;
    private readonly height: number;
    private gameState: GameState = GameState.LEVEL_SELECT;
    private levelButtons: Button[] = [];
    private selectedLevel: number | null = null;
    private backButton: Button;

    constructor(ctx: CanvasRenderingContext2D)
    {
        this.context = new DrawingContext2D(ctx, "black");
        this.context.fontSize = 40;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        
        const cols = 5;
        const rows = Math.ceil(LEVELS.length / cols);
        const width = (this.width - 50*(cols+1)) / cols;
        const height = (this.height - 50*(rows+1)) / rows;
        for (let i = 0; i < LEVELS.length; i++)
        {
            this.levelButtons.push(new Button(
                "Level " + (i+1),
                (i%cols+1) * 50 + i%cols * width,
                (Math.floor(i/cols)+1) * 50 + Math.floor(i/cols) * height,
                width,
                height
            ));
            this.levelButtons[i].onClickHook(() => {
                this.selectedLevel = i;
                this.gameState = GameState.LEVEL;
            });
        }
        this.backButton = new Button("<-", 0, 0, 50, 50);
        this.backButton.onClickHook(() => {
            this.gameState = GameState.TITLE;
        });
    }

    public getGameState(): GameState
    {
        return this.gameState;
    }

    public getSelectedLevelIndex(): number | null
    {
        return this.selectedLevel;
    }

    public draw(): void
    {
        for (const button of this.levelButtons)
            button.draw(this.context);
        this.backButton.draw(this.context);
    }

    public activate(): void
    {
        for (const button of this.levelButtons)
            button.activate();
        this.backButton.activate();
    }

    public deactivate(): void
    {
        for (const button of this.levelButtons)
            button.deactivate();
        this.backButton.deactivate();
    }

    public reset(): void
    {
        this.gameState = GameState.LEVEL_SELECT;
        this.selectedLevel = null;
        this.context.fontSize = 40;
    }
}

const INFO = `Level Editor Documentation

There are two parts to a level: the layout and the attributes.
They are seperated by a line.
You can have multiple levels connected via exits (E).

%
LEVEL PART 1 LAYOUT

LEVEL PART 1 ATTRIBUTES


LEVEL PART 2 LAYOUT

LEVEL PART 2 ATTRIBUTES
%

Characters that will not be taken as empty space:
T: Terrain, no attributes
L: Lava, no attributes
B: Ball Killer Terrain, no attributes
P: Player, width & height
E: Exit, width & height & index of next level part (first part is 0)
S: Text, text & x offest & y offset

Example:
TTTTTTTTTTTTTT
T000000000000T
T000000000000T
TE00000000000T
T0TT0TT00TT0TT
T000000000000T
T000000000S0TT
T00S00T00T0T
T00S0TTS0TLT
TP00TTT00T
TTTTTTTTTT

S("Watch out for lava", 50, 0)
S("Welcome to Janker", 0, 50)
S("WASD to move and space to jump", 0, 50)
S("R to restart the level", 100, 50)
P(30, 50)
E(100, 200, 1)
`;
const INFO_LINES = INFO.split("\n");

class LevelEditorScreen
{
    private readonly context: DrawingContext2D;
    private readonly width: number;
    private readonly height: number;
    private gameState: GameState = GameState.LEVEL_EDITOR;
    private textbox: TextBox;
    private copyButton: Button;
    private pasteButton: Button;
    private deleteButton: Button;
    private currentLevel: Level = undefined;
    private updateButton: Button;
    private errorText: string = "";
    private infoButton: Button;
    private showInfo: boolean = false;
    private gameOverlayButton: Button;
    private gameActive: boolean = false;
    private hideButton: Button;
    private backButton: Button;

    constructor(ctx: CanvasRenderingContext2D)
    {
        this.context = new DrawingContext2D(ctx, "black");
        this.context.fontSize = 40;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.textbox = new TextBox(50, 50, this.width/2-50, this.height-100);
        this.copyButton = new Button("Copy", this.textbox.width / 2 - 100, 0, 100, 50);
        this.copyButton.onClickHook(() => {
            navigator.clipboard.writeText(this.textbox.getText()).then();
        });
        this.pasteButton = new Button("Paste", this.textbox.width / 2, 0, 100, 50);
        this.pasteButton.onClickHook(() => {
            navigator.clipboard.readText().then(text => {
                this.textbox.setText(text);
            });
        });
        this.deleteButton = new Button("Delete", this.textbox.width / 2 + 100, 0, 100, 50);
        this.deleteButton.onClickHook(() => {
            this.textbox.setText("");
        });
        this.updateButton = new Button("Update", 
            this.textbox.width / 2 - 100, 
            this.textbox.y + this.textbox.height,
            150, 50);
        this.updateButton.onClickHook(() => {
            const l = Level.fromLevelString(
                    this.textbox.getText(), 
                    this.width / 2 + 50, 0, this.width / 2 - 50, this.height,
                    new DrawingContext2D(ctx, "black")
                );
            if (typeof l == "string")
            {
                this.errorText = l;
                this.currentLevel = undefined;
            }
            else
            {
                this.errorText = "";
                this.currentLevel = l;
            }
            this.showInfo = false;
            this.infoButton.setText("Info");
        });
        this.infoButton = new Button("Info",
            this.textbox.width / 2 + 50,
            this.textbox.y + this.textbox.height,
            150, 50);
        this.infoButton.onClickHook(() => {
            if (this.showInfo)
            {
                this.showInfo = false;
                this.infoButton.setText("Info");
            }
            else
            {
                this.showInfo = true;
                this.infoButton.setText("Close");
            }
        });
        this.gameOverlayButton = new Button("", this.width / 2 + 50, 0, this.width / 2, this.height);
        this.gameOverlayButton.onClickHook(() => {
            this.gameActive = true;
        });
        this.gameOverlayButton.onClickOffHook(() => {
            this.gameActive = false;
        });
        this.hideButton = new Button("<", 0, this.height / 2 - 25, 50, 50);
        this.hideButton.onClickHook(() => {
            if (this.hideButton.getText() == "<")
            {
                this.hideButton.setText(">");
                this.showInfo = false;
                this.infoButton.setText("Info");
                
                const l = this.currentLevel = Level.fromLevelString(
                    this.textbox.getText(), 
                    50, 0, this.width - 50, this.height,
                    new DrawingContext2D(ctx, "black")
                );
                if (typeof l == "string")
                {
                    this.errorText = l;
                    this.currentLevel = undefined;
                }
                else
                {
                    this.errorText = "";
                    this.currentLevel = l;
                }
                this.gameOverlayButton.changeDimensions(50, 0, this.width - 50, this.height);
            }
            else
            {
                this.hideButton.setText("<");
                
                const l = Level.fromLevelString(
                    this.textbox.getText(), 
                    this.width / 2 + 50, 0, this.width / 2 - 50, this.height,
                    new DrawingContext2D(ctx, "black")
                );
                if (typeof l == "string")
                {
                    this.errorText = l;
                    this.currentLevel = undefined;
                }
                else
                {
                    this.errorText = "";
                    this.currentLevel = l;
                }
                this.gameOverlayButton.changeDimensions(this.width / 2 + 50, 0, this.width / 2, this.height);
            }
        });
        this.backButton = new Button("<-", 0, 0, 50, 50);
        this.backButton.onClickHook(() => {
            this.gameState = GameState.TITLE;
        });
    }

    public getGameState(): GameState
    {
        return this.gameState;
    }

    public draw(): void
    {
        this.context.clearRect(0, 0, this.width, this.height);
        
        if (this.hideButton.getText() == "<")
        {
        if (!this.showInfo)
        {
            if (this.currentLevel !== undefined)
            {
                this.context.fontSize = 20;
                this.currentLevel.draw();
                this.context.fontSize = 40;
                this.context.clearRect(0, 0, this.width / 2 + 50, this.height);
            }
            else
                this.context.fillText(this.errorText, this.width * 3 / 4, this.height / 2);
        }
        else
        {
            this.context.fontSize = 16;
            this.context.textAlign = "start";
            for (let i = 0; i < INFO_LINES.length; i++)
            {
                this.context.fillText(INFO_LINES[i], 150 + this.textbox.width, 50 + i*15);
            }
            this.context.fontSize = 40;
            this.context.textAlign = "center";
        }
        
        this.textbox.draw(this.context);
        this.copyButton.draw(this.context);
        this.pasteButton.draw(this.context);
        this.deleteButton.draw(this.context);
        this.updateButton.draw(this.context);
        this.infoButton.draw(this.context);
        }
        else
        {
            if (this.currentLevel !== undefined)
            {
                this.context.fontSize = 20;
                this.currentLevel.draw();
                this.context.fontSize = 40;
                this.context.clearRect(0, 0, 50, this.height);
            }
            else
                this.context.fillText(this.errorText, this.width / 2, this.height / 2);
        }
        this.hideButton.draw(this.context);
        this.backButton.draw(this.context);
    }

    public activate(): void
    {
        this.textbox.activate();
        this.copyButton.activate();
        this.pasteButton.activate();
        this.deleteButton.activate();
        this.updateButton.activate();
        this.infoButton.activate();
        this.gameOverlayButton.activate();
        this.hideButton.activate();
        this.backButton.activate();
    }

    public deactivate(): void
    {
        this.textbox.deactivate();
        this.copyButton.deactivate();
        this.pasteButton.deactivate();
        this.deleteButton.deactivate();
        this.updateButton.deactivate();
        this.infoButton.deactivate();
        this.gameOverlayButton.deactivate();
        this.hideButton.deactivate();
        this.backButton.deactivate();
    }

    public reset(): void
    {
        this.gameState = GameState.LEVEL_EDITOR;
        this.context.fontSize = 40;
        this.currentLevel = undefined;
        this.errorText = "";
        this.infoButton.setText("Info");
        this.showInfo = false;
        this.gameActive = false;
        this.hideButton.setText("<");
    }

    get player(): Player | undefined
    {
        return this.currentLevel !== undefined && this.gameActive ? this.currentLevel.player : undefined;
    }

    get level(): Level
    {
        return this.currentLevel;
    }
}
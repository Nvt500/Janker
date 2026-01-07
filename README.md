
# Janker

Janker is a 2D platformer written in TypeScript using the canvas tag. The idea is a 
game where most bugs become features.

It currently has 10 levels and a level editor to create your own.

Press the `Copy JS` button to copy all the code as JavaScript as one thing or press
the `Hide` button to hide the buttons.

# Level Editor

Levels are written with text. The first part is the layout which is a 100 by 100 grid
made with different characters. Characters not explicit defined are empty space.

Characters defined:
- T: Terrain, no attributes
- L: Lava, no attributes
- B: Ball Killer Terrain, no attributes
- P: Player, (width, height)
- E: Exit, (width, height, index of next level part (first part is 0))
- S: Text, (text, x offest, y offset)

The second part are attributes. Characters like P for player require their attributes
to be defined with this notation: `Character(...atributes, ) or P(30, 50)`.

The sections are operated by a line. You can also use exits to connect levels into one large level.
These "level parts" are separated by two lines. Simply create a level with an exit E and
in its attributes have the index point to the next level part. You do not need to define
the player attributes for each level part after the first one but P is still needed for
the start location. The first level part has index 0.

For example:

```text
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


LLLLLLLLLLLLLLLL
L00000000000000L
L00000000000000L
L00000000000000LLLLLLLL
L00000000000T000000000L
L00000000000T000000000L
L000000000T0TLLT000000L
L00TT00TTTTTTTTTTTTT00L
L00000000000T000000000L
LT0000000000T000000000L
LTT000000000T000000000L
L000TT0000P0T00E000T00L
LLLLLLLTTTT0T00BTTLLLLL
0000000000B0T00B
0000000000B0000B
0000000000B0000B
0000000000B0000B
0000000000B0000B
0000000000BLLLLB

E(100, 100, 2)
```

When in the level editor click the `Info` button to view this guide:

```text
Level Editor Documentation

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
```

# Acknowledgements

Thank you to Jerzy Głowacki for developing [TypeScript Compile](https://github.com/niutech/typescript-compile)
in order to compile TypeScript to JavaScript at runtime in an HTML file. I have edited the 
code with the assistance of AI to work for a newer version of TypeScript (v5.9.3).
No code other `typescript.compile.dev.js` has used AI.
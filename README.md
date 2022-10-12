# choice4genesis

This is a ChoiceScript clone that generates Sega Genesis ROMs. If can be used for visual novels or simple multimedia presentations.

It takes a bunch of scripts and images and, from that, it generates SGDK-compatible `.c` and `.res` files. Those are then compiled into a Sega Genesis compatible ROM, which can be run on an emulator or even on real hardware.

The syntax of the scripts is somewhat based on ChoiceScript, but it is not exactly the same.

*Please note that this is an early work and progress, and it is not as stable or user-friendly as it is planned to become.*

## Indentation

Just like ChoiceScript, choice4genesis uses indentation to identify nested commands:

```shell
* choice
	# Say yes
		You said yes!
	# Say no
		You said no!
```

You can use any amount  spaces or tabs to indent the code, but not both at the same time; the indentation character must be consistent.

## Structure of the commands

Each command can take three basic types of parameters:
* Positional parameters: are obligatory, and must be always inform right at the start of the command:
	```shell
	* music "Actraiser - Fillmore.vgm"
	```
    In the example above, the `music` command has one positional parameter: the file name.
* Named parameters: are optional, and if informed, must be placed after the positional parameters; the positional parameters themselves can have one or more positional parameters:
	```shell
	* image "Smiley.png", at(30, 3)
	```
	In the example above, the `image` command has one positional parameter, the file name, and one named parameter, called `at`, which, in turn, has two positional parameters, `x` and `y`.
* Flags: are optional, and, if informed, must be placed after the positional parameters:
	```shell
	* clear background, foreground
	```
	In the example above, the `clear` command comes with two flags: `background` and `foreground`.
	
## Expressions

Many commands accept expressions as parameters; the expressions can contain the following operators:
* Comparison:
	* Equality: `variable = 33`;
	* Non equal to: `variable != 12`;
	* Greater than: `variable > 37`;
	* Less than: `variable < 98`;
	* Greater or equal to: `variable >= 56`;
	* Greater or lesser than: `variable <= 78`.
* Arithmetic:
	* Addition: `variable + 48`;
	* Subtraction: `variable - 13`;
	* Multiplication: `variable * 89`;
	* Division: `variable / 75`;
	* Negation: `-variable`.
* Logic:
	* And: `(variable > 32) and (variable < 64)`;
	* Or: `(variable < 15) or (variable > 32)`;
	* Not: `!(variable > 31)`.
* Constants:
	* Numeric: `123`, `456`;
	* Logical: `true`, `false`;
	* String: `"This is a string."`.

## Commands implemented so far

### `font`
Loads a `.png` file containing the 8x8 font. Note that the image must be paletized, with 16 colors. Future versions of this tool will probably convert the image *automagically*. Fonts will use palette #0.
#### Positional parameters:
* `fileName`: a string pointing to the `.png` file to use.
#### Example:
```shell
* font "damieng.com - Hourglass font.png"
```
Loads a image file named `"damieng.com - Hourglass font.png"` as a font.

### `background`
Loads a `.png` file as a background image. Note that the image must be paletized, with 16 colors. Future versions of this tool will probably convert the image *automagically*. Backgrounds will use palette #1.
#### Positional parameters:
* `fileName`: a string pointing to the `.png` file to use.
#### Example:
```shell
* background "Blue Hedgehog.png"
```
Displays a image file named `"Blue Hedgehog.png"` into the background.

### `choice`
Presents a menu to the user, allowing to choose between multiple options.

#### Example:
```shell
* choice
	# Play a music
		* music "Example.vgm"
	# Play a sound effect
		* sound "Example.vgm"
```
This displays a menu with two options "Play a music" and "Play a sound effect"; if the first one is selected, a music starts playing; if the second one is selected, a sound effect is played.

### `music`
Starts playing a `.vgm`/`.xgm` music in the background.

#### Positional parameters:
* `fileName`: a string pointing to the `.vgm` or `.xgm` file to use.

#### Example:
```shell
* music "Actraiser - Fillmore.vgm"
```
Starts playing a music file named `"Actraiser - Fillmore.vgm"`.

### `sound`
Plays a digitized sound.

#### Positional parameters:
* `fileName`: a string pointing to the `.wav` file to use.

#### Example:
```shell
* sound "ready.wav"
```
Starts playing a sound file named `"ready.wav"`.

### `stop`
Stops the music and/or sound.

#### Flags:
* `music`: tells it that it should stop the current music;
* `sound`: tells it that it should stop the current sound effect.

#### Examples:
```shell
* stop music
```
Stops current music.
```shell
* stop sound
```
Stops current sound.
```shell
* stop music, sound
```
Stops both current music and current sound.
```shell
* stop
```
Also stops both current music and current sound.


### `image`
Allows drawing a small image in `.png` format somewhere in the background. Note that the image must be paletized, with 16 colors. Future versions of this tool will probably convert the image *automagically*. This command uses palette #2.

#### Positional parameters:
* `fileName`: a string pointing to the `.png` file to use.
#### Named parameters:
* `at(x, y)` if informed, will place the image at map position `x, y` on the target layer.
#### Flags:
* `foreground`: tells that the image should be drawn on the foreground layer;
* `background`: tells that the image should be drawn on the background layer.

#### Examples:
```shell
* image "Example.png", at(1, 2)
```
Draws the image "Example.png" at position `1, 2` of the background layer.
```shell
* image "Example.png", at(1, 2), foreground
```
Draws the image "Example.png" at position `1, 2` of the foreground layer.
```shell
* image "Example.png"
```
Draws the image "Example.png" background layer, at the same position used by the previous `image` command.



### `wait`
Waits for a few seconds.

#### Positional parameters:
* `duration`: tells how many seconds the command should wait.

#### Example:
```shell
* wait 3
```
Waits for 3 seconds.

### `create`
Creates a global variable.

#### Positional parameters:
* `variable`: the name of the variable to create;
* `initialValue`: the initial value of the variable; the type of this value also determines the type of the variable.

#### Examples:
```shell
* create someVar, 12
```
Creates an integer variable named `someVar`, whose initial value is `12`.
```shell
* create anotherOne, true
```
Creates a logical variable named `anotherOne`, whose initial value is `true`.

### `temp`
Creates a local variable. `temp` variables are only visible inside the scene file that created them.

#### Positional parameters:
* `variable`: the name of the variable to create;
* `initialValue`: the initial value of the variable; the type of this value also determines the type of the variable.

#### Examples:
```shell
* temp someVar, 12
```
Creates an integer variable named `someVar`, whose initial value is `12`.
```shell
* temp anotherOne, true
```
Creates a logical variable named `anotherOne`, whose initial value is `true`.

### `set`
Changes the current value of an existing variable.

#### Positional parameters:
* `variable`: name of the variable to update;
* `newValue`: expression defining the new value of the variable.

#### Examples:
```shell
* set someThing, 2
```
Updates the value of the `someThing` variable to be `2`.
```shell
* set anotherThing, anotherVar * 3
```
Updates the value of the `anotherThing` variable to be the value of the variable `anotherVar` multiplied by `3`.
```shell
* set counter, counter + 2
```
Adds `2` to the value of the `counter` variable.

### `if`/`elseif`/`else`

Allows a certain block of code to only be executed on a given condition.

#### Positional parameters for the `if` and `elseif` commands:
* `condition`: a logical expression that will be used to determine if the corresponding block will be entered or not.

#### Example:
```shell
* if myVar = 2
	It is two.
* elseif myVar = 3
	It is three.
* else
	It is some other number.
```
If the variable `myVar` equals `2`, it will say `It is two.` or else, if `myVar` equals `3`, instead, it will say `It is three.`; otherwise, it will say `It is some other number.`.

### `while`
Keeps looping a block of code while a given condition is met.

#### Positional parameters:
* `condition`: a logical expression that will be used to determine if the corresponding block will be entered or not.

#### Example:
```shell
* temp counter, 3
* while counter > 0
	Value is ${counter}
	* set counter, counter - 1
```
This will say `Value is 3`, then `Value is 2`, then `Value is 1`.

### `goto_scene`
Jumps to a different scene. The scene files are located on the script directory, and have the `.choice` extension.

#### Positional parameters:
* `target`: the name of the scene to jump to.

#### Example
```shell
* goto_scene test
```
Jumps to the scene contained in the archive `test.choice`.

### `window`
Allows to configure the region of the screen that will be used for the text popups and menus.

### `cursor`
Allows to configure the blinking text cursor.

### `flush`
Immediately shows the contents of the current text buffer on the text window; if passed the flag `nowait`, does not wait for a button press.

### `clear`
Allows to clear regions of the screen.

### `title`

Sets the title of the story. Used to populate the ROM headers.

### `author`

Sets the author of the story. Used to populate the ROM headers.







## Planned commands

The tool accepts those commands, but, at the moment, they don't do anything.

### `label`
Will allow to mark a place where the `goto` command can jump to.

### `goto`
Will jump to a given label from anywhere on the same scene.

### `scene_list`
Will configure the default sequence in which the scenes will be played.

### `finish`
Will jump to the next scene in the game.

### `video`
Will play a full screen video.
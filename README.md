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

## Commands implemented so far

### `font`
Loads a `.png` file containing the 8x8 font. Note that the image must be paletized, with 16 colors. Future versions of this tool will probably convert the image *automagically*.

### `background`
Loads a `.png` file as a background image. Note that the image must be paletized, with 16 colors. Future versions of this tool will probably convert the image *automagically*.

### `choice`
Presents a menu to the user, allowing to choose between multiple options.

### `music`
Starts playing a `.vgm`/`.xgm` music in the background.

### `sound`
Plays a digitized sound.

### `stop`

Stops the music and/or sound.

### `image`
Allows drawing a small image in `.png` format somewhere in the background. Note that the image must be paletized, with 16 colors. Future versions of this tool will probably convert the image *automagically*.

### `wait`
Waits for a few seconds.

### `create`

Creates a global variable.

### `temp`

Creates a local variable. `temp` variables are only visible inside the scene file that created them.

### `set`

Changes the current value of an existing variable.

### `if`/`elseif`/`else`

Allows a certain block of code to only be executed on a given condition.

### `while`

Keeps looping a block of code while a given condicion is met.

### `goto_scene`
Jumps to a different scene. The scene files are located on the script directory, and have the `.choice` extension.

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
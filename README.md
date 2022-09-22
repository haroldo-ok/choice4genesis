# choice4genesis

This is a ChoiceScript clone that generates Sega Genesis ROMs. If can be used for visual novels or simple multimedia presentations.

It takes a bunch of scripts and images and, from that, it generates SGDK-compatible `.c` and `.res` files. Those are then compiled into a Sega Genesis compatible ROM, which can be run on an emulator or even on real hardware.

The syntax of the scripts is somewhat based on ChoiceScript, but it is not exactly the same.

*Please note that this is an early work and progress, and it is not as stable or user-friendly as it is planned to become.*



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



## Planned commands

The tool accepts those commands, but, at the moment, they don't do anything.

### `label`
Will allow to mark a place where the `goto` command can jump to.

### `goto`
Will jump to a given label from anywhere on the same scene.

### `goto_scene`
Will jump to a different scene.

### `scene_list`
Will configure the default sequence in which the scenes will be played.

### `finish`
Will jump to the next scene in the game.

### `window`
Will allow to configure the region of the screen that will be used for the text popups and menus.

### `clear`
Will allow to clear regions of the screen.

### `video`
Will play a full screen video.
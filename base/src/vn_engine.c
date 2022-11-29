#include "genesis.h"
#include "string.h"
#include "vn_engine.h"

#define TEXT_BUFFER_LEN (8192)
#define CHOICE_MAX (8)

#define PCM_CHANNEL (64)

#define BACKGROUND_PAL PAL0
#define TEXT_PAL PAL1
#define IMAGE_PAL PAL2

char textBuffer[TEXT_BUFFER_LEN];

struct {
	u16 x, y, w, h;
	Sprite *cursor;
} window;

struct {
	u16 x, y;
	u16 tileNumber;
} imageInfo;

struct {
	bool up;
	bool down;
	bool next;
} input;

struct {
	int width, height;
	char** lines;
} msgLines;

struct {
	u16 baseTileNumber;
	Image *image;
} backgroundInfo;

char *bufferWrappedTextLine(char *s, int x, int y, int w) {
	char *o, ch;
	int tx = x;
	
	char *startOfLine, *endOfLine;
	int currW, bestW;
	
	startOfLine = s;
	
	currW = 0;
	bestW = 0;

	// Skips initial spaces for current line
	for (o = startOfLine; *o == ' '; o++) {
		msgLines.lines[y][tx] = ' ';
		tx++;
		currW++;
		bestW = currW;
	}
	startOfLine = o;
	
	if (!*o || currW >= w) {
		msgLines.lines[y][tx] = 0;
		return 0;
	}

	// Scans words that fit the maximum width
	endOfLine = startOfLine;
	for (o = startOfLine; *o && *o != '\n' && currW <= w; o++) {
		ch = *o;
		if (ch == ' ') {
			currW++;
			if (currW <= w) {
				endOfLine = o;
				bestW = currW;
			}
		} else {
			currW++;
		}
	}
	
	// Corner cases: last word in string, and exceedingly long words
	if (currW <= w || !bestW) {
		endOfLine = o;
		bestW = currW;		
	}

	// Renders the line of text
	for (o = startOfLine; o <= endOfLine; o++) {
		ch = *o;
		if (ch && ch != '\n') {
			msgLines.lines[y][tx] = ch;
			tx++;
		}
	}
	
	// Skips spaces at end of line.
	while (*endOfLine == ' ') {
		endOfLine++;
	}

	// Skips one line break, if necessary.
	if (*endOfLine == '\n') {
		endOfLine++;
	}

	msgLines.lines[y][tx] = 0;
	return *endOfLine ? endOfLine : 0;
}

char *bufferWrappedText(char *s, int x, int y, int w, int h) {
	char *o = s;
	int ty = y;
	int maxY = y + h;
	
	while (o && *o && ty < maxY) {
		o = bufferWrappedTextLine(o, x, ty, w);
		ty++;
	}
	
	return o;
}

void bufferResize(int width, int height) {
	unsigned char i;
	
	// Skip if the width/height haven't changed
	if (msgLines.width == width && msgLines.height == height) return;
	
	// Deallocate existing buffers
	if (msgLines.lines) {
		for (i = 0; i != msgLines.height; i++) {
			free(msgLines.lines[i]);
		}
		free(msgLines.lines);
		msgLines.lines = 0;
	}

	// Reallocate according to the new size
	
	msgLines.width = width;
	msgLines.height = height;
	msgLines.lines = malloc(msgLines.height * sizeof(char *));
	
	for (i = 0; i != msgLines.height; i++) {
		msgLines.lines[i] = malloc(msgLines.width + 1);
		msgLines.lines[i][0] = 0;
	}	
}

void bufferClear() {
	unsigned char i;
	
	for (i = 0; i != msgLines.height; i++) {
		msgLines.lines[i][0] = 0;
	}
}

void VN_joyHandler(u16 joy, u16 changed, u16 state) {
	if (joy != JOY_1) return;
	
	input.up = !!(state & BUTTON_UP);
	input.down = !!(state & BUTTON_DOWN);
	input.next = !!(state & (BUTTON_A | BUTTON_B | BUTTON_C));
}

void VN_doVBlank() {
	SPR_update();
	SYS_doVBlankProcess();
}

void VN_waitJoyRelease() {
	do {
		VN_doVBlank();
	} while(input.up || input.down || input.next);
}

void VN_waitPressNext() {
	do {
		VN_doVBlank();
	} while(!input.next);
	VN_waitJoyRelease();
}

void VN_init() {
	JOY_init();
	JOY_setEventHandler(&VN_joyHandler);
	
	memset(textBuffer, 0, TEXT_BUFFER_LEN);

	msgLines.width = 0;
	msgLines.height = 0;
	msgLines.lines = 0;
	
	VN_windowDefault();
	window.cursor = NULL;

	SPR_init(0, 0, 0);

	backgroundInfo.image = NULL;
	backgroundInfo.baseTileNumber = 256;

	imageInfo.x = 0;
	imageInfo.y = 0;
	imageInfo.tileNumber = backgroundInfo.baseTileNumber;	
	
	XGM_setLoopNumber(-1);
	XGM_setForceDelayDMA(TRUE);

	VDP_setTextPalette(TEXT_PAL);
	VDP_drawText("choice4genesis v0.11.2", 17, 27);
}


void VN_showImage(const Image *image, VDPPlane plane, u16 palNum, u16 x, u16 y) {
	VDP_loadTileSet(image->tileset, imageInfo.tileNumber, DMA);
    TileMap *tmap = unpackTileMap(image->tilemap, NULL);
	VDP_setTileMapEx(plane, tmap, TILE_ATTR_FULL(palNum, FALSE, FALSE, FALSE, imageInfo.tileNumber), 
		x, y,  0, 0, tmap->w, tmap->h, CPU);
	VDP_setPalette(palNum, (u16*)image->palette->data);
	imageInfo.tileNumber += image->tileset->numTile;
	free(tmap);
}

void VN_background(const Image *image) {
	imageInfo.tileNumber = backgroundInfo.baseTileNumber;
	backgroundInfo.image = image;
	VN_showImage(image, BG_B, BACKGROUND_PAL, 0, 0);
}

void VN_image(const Image *image, const u8 flags) {
	if (flags & LAYER_FOREGROUND) VN_showImage(image, BG_A, IMAGE_PAL, imageInfo.x, imageInfo.y);
	if (flags & LAYER_BACKGROUND) VN_showImage(image, BG_B, IMAGE_PAL, imageInfo.x, imageInfo.y);
}

void VN_imageAt(u16 x, u16 y) {
	imageInfo.x = x;
	imageInfo.y = y;
}

void VN_font(const Image *image) {
	VDP_loadFont(image->tileset, DMA);
	VDP_setPalette(TEXT_PAL, (u16*)image->palette->data);
}


void VN_music(const u8 *music, const u32 length, const u8 driverFlags) {
	if (driverFlags == SOUND_ADPCM) {
		SND_startPlay_2ADPCM(music, length, SOUND_PCM_CH1, TRUE);
	} else {
		XGM_startPlay(music);
	}
}

void VN_sound(const u8 *sound, const u32 length) {
	XGM_stopPlayPCM (SOUND_PCM_CH2);
	XGM_setPCM(PCM_CHANNEL, sound, length);
	XGM_startPlayPCM(PCM_CHANNEL, 1, SOUND_PCM_CH2);
}

void VN_stop(const u8 flags) {
	if (!flags || (flags & STOP_MUSIC)) XGM_stopPlay();
	if (!flags || (flags & STOP_SOUND)) XGM_stopPlayPCM (SOUND_PCM_CH2);
}


void VN_clearWindow() {
	VDP_clearTextAreaEx(BG_A, TILE_ATTR_FULL(TEXT_PAL, FALSE, FALSE, FALSE, 0x05A0), window.x, window.y, window.w, window.h, DMA);
}

void VN_textStart() {
	if (textBuffer[0]) strcat(textBuffer, "\n");
}

void VN_textString(char *text) {
	strcat(textBuffer, text);
}

void VN_textInt(int number) {
	char number_buffer[12];
	sprintf(number_buffer, "%d", number);
	VN_textString(number_buffer);
}

void VN_text(char *text) {
	VN_textStart();
	VN_textString(text);
}

void VN_flushText() {
	VN_flush(0);
}

void VN_blinkNextCursor() {
	if (window.cursor) {
		SPR_setPosition (window.cursor, (window.x + window.w - 1) * 8, (window.y + window.h - 1) * 8);
		SPR_setVisibility(window.cursor, VISIBLE);			
	}
	VN_waitPressNext();
	if (window.cursor) SPR_setVisibility(window.cursor, HIDDEN);
}

void VN_flush(const u8 flags) {
	if (!textBuffer[0]) return;
	
	bufferResize(window.w, window.h);
	
	bool shouldWait = !(flags & FLUSH_NOWAIT);
	
	for (char *textToDisplay = textBuffer; textToDisplay;) {
		if (shouldWait) VN_waitJoyRelease();
		
		// Word wrapping
		
		bufferClear();
		textToDisplay = bufferWrappedText(textToDisplay, 0, 0, msgLines.width, msgLines.height);
		
		// Draw the text on screen
		
		VN_clearWindow();
		
		u16 y = window.y;
		for (int i = 0; i != msgLines.height; i++) {
			VDP_drawText(msgLines.lines[i], window.x, y);
			y++;
		}
		
		// Wait button press
		if (shouldWait) VN_blinkNextCursor();
	}

	strclr(textBuffer);
}

void VN_clear(const u8 flags) {
	if (flags & LAYER_FOREGROUND) {
		VDP_clearPlane(BG_A, TRUE);
		imageInfo.tileNumber = backgroundInfo.baseTileNumber + 
			(backgroundInfo.image ? backgroundInfo.image->tileset->numTile : 0);
	}
	if (flags & LAYER_BACKGROUND) {
		VDP_clearPlane(BG_B, TRUE);
		imageInfo.tileNumber = backgroundInfo.baseTileNumber;
		backgroundInfo.image = NULL;
	}
	if (flags & LAYER_WINDOW) VN_clearWindow();
}

void VN_wait(u16 duration) {
	VN_flushText();
	for (u16 remainining = duration; remainining; remainining--) {
		for (u16 i = 60; i; i--) VN_doVBlank();		
	}
}

void VN_option(u8 number, char *text) {
	VN_text(text);
	
	char *d = textBuffer + strlen(textBuffer);
	
	*d = 1;
	d++;
	*d = number;
	d++;
	*d = 0;
}

u8 VN_choice() {
	if (!textBuffer[0]) return 0;
	
	VN_clearWindow();

	u8 choiceCount = 0;
	u16 cursorPositons[CHOICE_MAX];
	u8 choiceValues[CHOICE_MAX];
	
	char lineBuffer[41];
	char *o = textBuffer;
	u16 y = window.y;
	
	while (*o) {
		char *d = lineBuffer;
		for (;*o && *o != '\n' && *o != 1; o++, d++) *d = *o;
		*d = 0;
		
		if (*o == 1) {
			o++;			
			cursorPositons[choiceCount] = y;
			choiceValues[choiceCount] = *o;
			choiceCount++;
			o++;
		}
		
		if (*o) o++;				
		
		VDP_drawText(lineBuffer, window.x + 1, y);
		y++;
	}
	strclr(textBuffer);
	
	VN_waitJoyRelease();
	
	u8 choiceNumber = 0;
	VDP_drawText(">", window.x, cursorPositons[0]);
	while (!input.next) {
		VN_doVBlank();
		if (input.up || input.down) {
			VDP_drawText(" ", window.x, cursorPositons[choiceNumber]);

			// Previous choice?
			if (input.up) {
				if (choiceNumber) {
					choiceNumber--;
				} else {
					choiceNumber = choiceCount - 1;
				}
			}
			
			// Next choice?
			if (input.down) {
				choiceNumber++;
				if (choiceNumber >= choiceCount) choiceNumber = 0;
			}

			VDP_drawText(">", window.x, cursorPositons[choiceNumber]);			
			VN_waitJoyRelease();
		}
	}
	
	VN_waitJoyRelease();
	
	return choiceValues[choiceNumber];
}

void VN_windowDefault() {
	window.x = 1;
	window.y = 20;
	window.w = 38;
	window.h = 6;
}

void VN_windowFrom(u16 x, u16 y) {
	window.x = x;
	window.y = y;
}

void VN_windowTo(u16 x, u16 y) {
	VN_windowSize(x - window.x + 1, y - window.y + 1);
}

void VN_windowSize(u16 w, u16 h) {
	window.w = w;
	window.h = h;
}

void VN_cursor(const SpriteDefinition *sprite) {
	if (window.cursor) {
		SPR_releaseSprite(window.cursor);
		window.cursor = NULL;
	}
	
	if (!sprite) return;
	
	window.cursor = SPR_addSprite(sprite, 0, 0, TILE_ATTR(TEXT_PAL, 1, FALSE, FALSE));
	SPR_setVisibility(window.cursor, HIDDEN);
	VDP_setPalette(TEXT_PAL, (u16*) sprite->palette->data);
}
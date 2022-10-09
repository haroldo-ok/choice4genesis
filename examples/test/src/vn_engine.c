#include "genesis.h"
#include "string.h"
#include "vn_engine.h"

#define TEXT_BUFFER_LEN (8192)
#define CHOICE_MAX (8)

#define PCM_CHANNEL (64)

char textBuffer[TEXT_BUFFER_LEN];

struct {
	u16 x, y, w, h;
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

void VN_joyHandler(u16 joy, u16 changed, u16 state) {
	if (joy != JOY_1) return;
	
	input.up = !!(state & BUTTON_UP);
	input.down = !!(state & BUTTON_DOWN);
	input.next = !!(state & (BUTTON_A | BUTTON_B | BUTTON_C));
}

void VN_waitJoyRelease() {
	do {
		SYS_doVBlankProcess();
	} while(input.up || input.down || input.next);
}

void VN_waitPressNext() {
	do {
		SYS_doVBlankProcess();
	} while(!input.next);
	VN_waitJoyRelease();
}

void VN_init() {
	JOY_init();
	JOY_setEventHandler(&VN_joyHandler);
	
	memset(textBuffer, 0, TEXT_BUFFER_LEN);

	VN_windowDefault();

	imageInfo.x = 0;
	imageInfo.y = 0;
	imageInfo.tileNumber = 256;
	
	XGM_setLoopNumber(-1);
	XGM_setForceDelayDMA(TRUE);

	VDP_drawText("choice4genesis v0.7.0", 18, 27);
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
	imageInfo.tileNumber = 256;
	VN_showImage(image, BG_B, PAL1, 0, 0);
}

void VN_image(const Image *image, const u8 flags) {
	if (flags & CLEAR_FOREGROUND) VN_showImage(image, BG_A, PAL2, imageInfo.x, imageInfo.y);
	if (flags & CLEAR_BACKGROUND) VN_showImage(image, BG_B, PAL2, imageInfo.x, imageInfo.y);
}

void VN_imageAt(u16 x, u16 y) {
	imageInfo.x = x;
	imageInfo.y = y;
}

void VN_font(const Image *image) {
	VDP_loadFont(image->tileset, DMA);
	VDP_setPalette(PAL0, (u16*)image->palette->data);
}


void VN_music(const u8 *music) {
	XGM_startPlay(music);
}

void VN_sound(const u8 *sound, const u16 length) {
	XGM_stopPlayPCM (SOUND_PCM_CH2);
	XGM_setPCM(PCM_CHANNEL, sound, length);
	XGM_startPlayPCM(PCM_CHANNEL, 1, SOUND_PCM_CH2);
}

void VN_stop(const u8 flags) {
	if (!flags || (flags & STOP_MUSIC)) XGM_stopPlay();
	if (!flags || (flags & STOP_SOUND)) XGM_stopPlayPCM (SOUND_PCM_CH2);
}


void VN_clearWindow() {
	VDP_clearTextAreaEx(BG_A, TILE_ATTR_FULL(PAL0, FALSE, FALSE, FALSE, 0x05A0), window.x, window.y, window.w, window.h, DMA);
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

void VN_flush(const u8 flags) {
	if (!textBuffer[0]) return;
	
	bool shouldWait = !(flags & FLUSH_NOWAIT);
	
	if (shouldWait) VN_waitJoyRelease();

	VN_clearWindow();
	
	char lineBuffer[41];
	char *o = textBuffer;
	u16 y = window.y;
	
	while (*o) {
		char *d = lineBuffer;
		for (;*o && *o != '\n'; o++, d++) *d = *o;
		*d = 0;
		if (*o) o++;
		
		VDP_drawText(lineBuffer, window.x, y);
		y++;
	}
	strclr(textBuffer);
	
	if (shouldWait) VN_waitPressNext();
}

void VN_clear(const u8 flags) {
	if (flags & CLEAR_FOREGROUND) VDP_clearPlane(BG_A, TRUE);
	if (flags & CLEAR_BACKGROUND) VDP_clearPlane(BG_B, TRUE);
	if (flags & CLEAR_WINDOW) VN_clearWindow();
}

void VN_wait(u16 duration) {
	VN_flushText();
	for (u16 remainining = duration; remainining; remainining--) {
		for (u16 i = 60; i; i--) SYS_doVBlankProcess();		
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
		SYS_doVBlankProcess();
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

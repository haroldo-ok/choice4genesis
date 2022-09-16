#include "genesis.h"
#include "string.h"
#include "vn_engine.h"

#define TEXT_BUFFER_LEN (8192)

char textBuffer[TEXT_BUFFER_LEN];

struct {
	u16 x, y, w, h;
} window;

struct {
	u16 x, y;
	u16 tileNumber;
} imageInfo;

void VN_init() {
	VDP_setTextPlane(BG_B);
	
	memset(textBuffer, 0, TEXT_BUFFER_LEN);
	
	window.x = 1;
	window.y = 20;
	window.w = 38;
	window.h = 4;

	imageInfo.x = 0;
	imageInfo.y = 0;
	imageInfo.tileNumber = 256;
	
	XGM_setLoopNumber(-1);
	XGM_setForceDelayDMA(TRUE);
}


void VN_showImage(const Image *image, u16 palNum, u16 x, u16 y) {
	VDP_loadTileSet(image->tileset, imageInfo.tileNumber, DMA);
    TileMap *tmap = unpackTileMap(image->tilemap, NULL);
	VDP_setTileMapEx(BG_A, tmap, TILE_ATTR_FULL(palNum, FALSE, FALSE, FALSE, imageInfo.tileNumber), 
		x, y,  0, 0, tmap->w, tmap->h, CPU);
	VDP_setPalette(palNum, (u16*)image->palette->data);
	imageInfo.tileNumber += image->tileset->numTile;
	free(tmap);
}

void VN_background(const Image *image) {
	imageInfo.tileNumber = 256;
	VN_showImage(image, PAL1, 0, 0);
}

void VN_image(const Image *image) {
	VN_showImage(image, PAL2, imageInfo.x, imageInfo.y);
}

void VN_imageAt(u16 x, u16 y) {
	imageInfo.x = x;
	imageInfo.y = y;
}


void VN_music(const u8 *music) {
	XGM_startPlay(music);
}


void VN_text(char *text) {
	if (textBuffer[0]) strcat(textBuffer, "\n");
	strcat(textBuffer, text);
}

void VN_flushText() {
	if (!textBuffer[0]) return;
	
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
}

void VN_wait(u16 duration) {
}
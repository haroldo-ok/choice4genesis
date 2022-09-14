#include "genesis.h"
#include "string.h"
#include "vn_engine.h"

#define TEXT_BUFFER_LEN (8192)

char textBuffer[TEXT_BUFFER_LEN];

struct {
	u16 x, y, w, h;
} window;

void VN_init() {
	VDP_setTextPlane(BG_B);
	
	memset(textBuffer, 0, TEXT_BUFFER_LEN);
	
	window.x = 1;
	window.y = 20;
	window.w = 38;
	window.h = 4;
}

void VN_background(const Image *image) {
	VDP_loadTileSet(image->tileset, 256, DMA);
    TileMap *tmap = unpackTileMap(image->tilemap, NULL);
	VDP_setTileMapEx(BG_A, tmap, TILE_ATTR_FULL(PAL1, FALSE, FALSE, FALSE, 256), 0, 0,  0, 0, 40, 28, CPU);
	VDP_setPaletteColors(16, (u16*)image->palette->data, 32);
	free(tmap);
}

void VN_text(char *text) {
	if (textBuffer[0]) strcat(textBuffer, "\n");
	strcat(textBuffer, text);
}

void VN_flushText() {
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
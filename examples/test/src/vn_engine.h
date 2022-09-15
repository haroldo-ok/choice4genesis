#ifndef _VN_ENGINE_H
#define _VN_ENGINE_H

#include "genesis.h"
#include "gfx.h"

extern void VN_init();

extern void VN_background(const Image *image);
extern void VN_image(const Image *image);

extern void VN_text(char *text);
extern void VN_flushText();

typedef void * (*scriptFunction)();

#endif /* _VN_ENGINE_H */

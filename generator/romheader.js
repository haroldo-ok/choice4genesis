'use strict';

const pjson = require('./../package.json');

const formatHeader = (s, size) => s.padEnd(size, ' ').substring(0, size);

const generateRomHeader = context => {

return `
#include "genesis.h"

__attribute__((externally_visible))
const ROMHeader rom_header = {
#if (ENABLE_BANK_SWITCH != 0)
    "SEGA SSF        ",
#elif (ENABLE_MEGAWIFI != 0)
    "SEGA MEGAWIFI   ",
#else
    "SEGA MEGA DRIVE ",
#endif
    "(C)SGDK 2021    ",
    "SAMPLE PROGRAM                                  ",
    "SAMPLE PROGRAM                                  ",
    "GM 00000000-00",
    0x000,
    "JD              ",
    0x00000000,
#if (ENABLE_BANK_SWITCH != 0)
    0x003FFFFF,
#else
    0x000FFFFF,
#endif
    0xE0FF0000,
    0xE0FFFFFF,
    "RA",
    0xF820,
    0x00200000,
    0x0020FFFF,
    "            ",
    "${formatHeader('Made with ' + pjson.name + ' ' + pjson.version, 40)}",
    "JUE             "
};

`;
	
};

module.exports = { generateRomHeader };
#include "genesis.h"
#include "vn_engine.h"

extern void *VS_startup();

int main(bool hardReset)
{
	scriptFunction nextScript = VS_startup;

    while(TRUE)
    {
		nextScript = nextScript();
        SYS_doVBlankProcess();
    }

    return 0;
}

'use strict';

import React, { useEffect, useState } from 'react';
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";

export function prepareSyntax() {
	const monaco = useMonaco();
	useEffect(() => {
		if (!monaco) return;		
		console.log("here is the monaco instance:", monaco);
		
		monaco.languages.register({ id: 'choicescript' });
		monaco.languages.setMonarchTokensProvider('choicescript', {
			tokenizer: {
				root: [
					[/^[ \t]*\*[ \t]*\w+/, 'keyword'],
					[/^[ \t]*\#/, 'keyword'],
					[/"((\\"|[^"])+)"/, 'string'],
					[/[\(\),]/, 'delimiter'],
					[/\d+/, 'number']
				]
			}
		});
	}, [monaco]);
}
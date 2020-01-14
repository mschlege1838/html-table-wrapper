
@echo off
setlocal

set out_dir=out

@echo on
rd /s /q %out_dir%
jsdoc SimpleEventDispatcher.js SimpleDataTable.js ContextControl.js
echo off

endlocal
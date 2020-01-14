
@echo off
setlocal

set out_dir=out

@echo on
rd /s /q %out_dir%
jsdoc -p -d %out_dir% SimpleEventDispatcher.js SimpleDataTable.js ContextControl.js IEGeneralCompatibility.js IE9Compatibility.js IE8Compatibility.js XMLBuilder.js SimpleDataTableListener.js SimpleDataTableControl.js
echo off

endlocal
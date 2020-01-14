
@echo off
setlocal

set out_dir=jsdoc\out
set conf_file=jsdoc\jsdoc-conf.json

@echo on
rd /s /q %out_dir%
jsdoc -p -d %out_dir% -c %conf_file% ContextControl.js IE8Compatibility.js IE9Compatibility.js IEGeneralCompatibility.js SimpleDataTable.js SimpleDataTableControl.js SimpleDataTableListener.js SimpleDataTableUtils.js SimpleEventDispatcher.js SimpleFilterDescriptor.js SimpleSortDescriptor.js XMLBuilder.js virtual-interfaces.js
echo off

endlocal
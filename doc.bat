
@echo off
setlocal

set out_dir=jsdoc\out
set conf_file=jsdoc\jsdoc-conf.json

if "%1"=="doc" (
	call :jsdoc
) else if "%1"=="open" (
	call :open
) else (
	echo No/unrecognized action; defaulting to ^"doc^".
	call :jsdoc
)

endlocal

goto :eof

:jsdoc
@echo on
if exist "%out_dir%" rd /s /q %out_dir%
call jsdoc -p -d %out_dir% -c %conf_file% -r src
@echo off
goto :eof


:open
@echo on
%out_dir%\index.html
@echo off
goto :eof


del exif.zip

xcopy "../Chrome" Output /E /F /Y

rem For /r Output\ %%i in (*.js) do (
rem jsmin < %%i > out.tmp
rem copy out.tmp %%i
rem Del /q out.tmp) 




7z.exe a -tzip exif.zip .\Output\*

del "Output\*" /Q /F /s
rmdir Output /Q /S
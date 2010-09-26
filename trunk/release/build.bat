
del exif.zip

xcopy "../Chrome" Output /E /F /Y

For /r Output\ %%i in (*.js) do (
jsmin < %%i > out.tmp
copy out.tmp %%i
Del /q out.tmp) 




7z.exe a -tzip exif.zip .\Output\*

del "Output\*" /Q /F /s
rmdir Output /Q /S

del exif.zip

xcopy "../Chrome" "./Output/" /E /F /Y
del .\Output\*.js
xcopy "..\Chrome\jquery*.js" ".\Output\" /E /F /Y

java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --externs=externs\jquery.js --externs=externs\chrome.js  --js=..\Chrome\attributes.js --js=..\Chrome\binaryajax.js --js=..\Chrome\exif.js --js=..\Chrome\geo.js --js=..\Chrome\ui.js --js_output_file=.\Output\exif.pack.js
java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --externs=externs\jquery.js --externs=externs\chrome.js  --js=..\Chrome\exif_inject.js --js_output_file=.\Output\exif_inject.js



7z.exe a -tzip exif.zip .\Output\*

rem del .\Output\*" /Q /F /s
rem rmdir Output /Q /S

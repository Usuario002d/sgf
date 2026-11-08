@echo off
"%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin\docker.exe" exec -it sgf-mysql mysql -usgf -psgf sgf %*

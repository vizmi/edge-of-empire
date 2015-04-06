@start "server" /D %~dp0 /MIN node index.js
@start "build" /D %~dp0 /MIN cmd /c jsx src\ static\build\ --watch

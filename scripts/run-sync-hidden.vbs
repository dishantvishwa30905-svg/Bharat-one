Set WshShell = CreateObject("WScript.Shell")
ScriptDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
ProjectDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(ScriptDir)
WshShell.CurrentDirectory = ProjectDir
WshShell.Run "node """ & ScriptDir & "\auto-sync.js""", 0, False

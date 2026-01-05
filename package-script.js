const fs = require("fs");
const { execSync } = require("child_process");

console.log("Starting package process...");

let hasError = false;

// Step 1: Build the project
console.log("\n1. Building project...");
execSync("npm run build", { stdio: "inherit" });

// Step 2: Clean and copy media and notifier-executables to out/windows
console.log("\n2. Copying resources to output directory...");
fs.rmSync("out/windows/media", { recursive: true, force: true });
fs.rmSync("out/windows/notifier-executables", { recursive: true, force: true });
fs.cpSync("media", "out/windows/media", { recursive: true });
fs.cpSync("notifier-executables", "out/windows/notifier-executables", {
    recursive: true,
});

// Step 3: Package with pkg
console.log("\n3. Packaging with pkg...");
console.log(
    '   NOTE: Expect warnings like "Warning Cannot include file %1 into executable". These can be ignored.'
);
execSync(
    "pkg dist/index.js -t node18-win-x64 -o out/windows/node-app-boilerplate.exe",
    { stdio: "inherit" }
);

// Step 4: Update icon with resedit
console.log("\n4. Updating executable icon...");
execSync(
    "npx resedit --in out/windows/node-app-boilerplate.exe --out out/windows/node-app-boilerplate.exe --delete-allicon --icon media/icon.ico --overwrite --verbose",
    { stdio: "inherit" }
);

// Step 5: Generate NSIS script
console.log("\n5. Generating NSIS installer script...");
const nsisScript = `!addplugindir "nsis-plugins"
!define APPNAME "Node App Boilerplate"
!define APPDIR "NodeAppBoilerplate"
!define EXENAME "node-app-boilerplate.exe"
!define APPID "com.joshsilveous.nodeappboilerplate"

OutFile "out\\windows\\NodeAppBoilerplateInstaller.exe"
InstallDir "$PROGRAMFILES64\\NodeAppBoilerplate"
RequestExecutionLevel admin

Page directory
Page instfiles

Section "Install"
  SetRegView 64
  SetShellVarContext all

  ; Check if app is already running and kill it
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq \${EXENAME}" | find /I "\${EXENAME}"'
  Pop $0
  Pop $1

  StrCmp $1 "" appNotRunning

  nsExec::Exec 'taskkill /IM "\${EXENAME}" /T /F'
  Sleep 1500

  appNotRunning:

  SetOutPath "$INSTDIR"
  File "out\\windows\\\${EXENAME}"

  SetOutPath "$INSTDIR\\notifier-executables"
  File /r "out\\windows\\notifier-executables\\*"

  SetOutPath "$INSTDIR\\media"
  File /r "out\\windows\\media\\*"

  ; Create uninstaller
  WriteUninstaller "$INSTDIR\\Uninstall.exe"

  ; Add to Programs and Features
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "DisplayName" "\${APPNAME}"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "UninstallString" "$\\"$INSTDIR\\Uninstall.exe$\\""
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "QuietUninstallString" "$\\"$INSTDIR\\Uninstall.exe$\\" /S"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "Publisher" "Joshua Silveous"
  WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "NoModify" 1
  WriteRegDWORD HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}" "NoRepair" 1

  CreateDirectory "$SMPROGRAMS\\\${APPNAME}"

  CreateShortcut "$SMPROGRAMS\\\${APPNAME}\\\${APPNAME}.lnk" "$INSTDIR\\\${EXENAME}"

  ApplicationID::Set "$SMPROGRAMS\\\${APPNAME}\\\${APPNAME}.lnk" "\${APPID}" 
  Pop $0


  ; Auto-start on login
  CreateShortcut "$SMSTARTUP\\\${APPNAME}.lnk" "$INSTDIR\\\${EXENAME}"
SectionEnd

Section "Uninstall"
  SetRegView 64
  SetShellVarContext all

  ; Check if app is running
  nsExec::ExecToStack 'tasklist /FI "IMAGENAME eq \${EXENAME}" | find /I "\${EXENAME}"'
  Pop $0
  Pop $1

  StrCmp $1 "" appNotRunning

  MessageBox MB_ICONEXCLAMATION|MB_YESNO \\
    "\${APPNAME} is currently running.$\\n$\\nClose it now to continue uninstall?" \\
    IDYES killApp IDNO abortUninstall

  killApp:
    nsExec::Exec 'taskkill /IM "\${EXENAME}" /T /F'
    Sleep 1500
    Goto appNotRunning

  abortUninstall:
    Abort

  appNotRunning:

  ; Remove AppUserModelID artifacts
  ApplicationID::UninstallJumpLists "\${APPID}"
  ApplicationID::UninstallPinnedItem "\${APPID}"

  ; Remove files
  Delete "$INSTDIR\\\${EXENAME}"
  Delete "$INSTDIR\\Uninstall.exe"
  RMDir /r "$INSTDIR\\notifier-executables"
  RMDir /r "$INSTDIR\\media"
  RMDir "$INSTDIR"

  ; Remove shortcuts
  Delete "$SMPROGRAMS\\\${APPNAME}\\\${APPNAME}.lnk"
  RMDir "$SMPROGRAMS\\\${APPNAME}"
  Delete "$SMSTARTUP\\\${APPNAME}.lnk"

  ; Remove Programs and Features entry
  DeleteRegKey HKLM "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${APPDIR}"
SectionEnd
`;

const nsisScriptPath = "create-installer.nsi";
fs.writeFileSync(nsisScriptPath, nsisScript, "utf8");
console.log("   Created create-installer.nsi in project root");

// Step 6: Compile NSIS installer
console.log("\n6. Compiling NSIS installer...");
try {
    execSync(`makensis ${nsisScriptPath}`, { stdio: "inherit" });
    console.log("\n✓ Installer created successfully!");
} catch (error) {
    console.error(
        "\n✗ Failed to compile installer. Make sure NSIS is installed and makensis is available to your PATH."
    );
    console.error("   Download from: https://nsis.sourceforge.io/Download");
    hasError = true;
}

// Step 7: Cleanup
console.log("\n7. Cleaning up temporary files...");
try {
    // Remove the NSIS script
    if (fs.existsSync(nsisScriptPath)) {
        fs.unlinkSync(nsisScriptPath);
        console.log("   Removed create-installer.nsi");
    }

    // Remove temporary build artifacts from out/windows
    if (fs.existsSync("out/windows/media")) {
        fs.rmSync("out/windows/media", { recursive: true, force: true });
        console.log("   Removed out/windows/media");
    }

    if (fs.existsSync("out/windows/notifier-executables")) {
        fs.rmSync("out/windows/notifier-executables", {
            recursive: true,
            force: true,
        });
        console.log("   Removed out/windows/notifier-executables");
    }

    if (fs.existsSync("out/windows/node-app-boilerplate.exe")) {
        fs.unlinkSync("out/windows/node-app-boilerplate.exe");
        console.log("   Removed out/windows/node-app-boilerplate.exe");
    }

    console.log("   Cleanup complete!");
} catch (error) {
    console.error("\n✗ Error during cleanup:", error.message);
    hasError = true;
}

// Final status message
if (hasError) {
    console.log(
        "\n✗ Packaging completed with errors. Please review the output above."
    );
    process.exit(1);
} else {
    console.log("\n✓ Packaging completed successfully!");
    console.log(
        "   Installer location: out/windows/NodeAppBoilerplateInstaller.exe"
    );
}

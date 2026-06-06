import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const repoRoot = path.resolve(import.meta.dirname, "..", "..");

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function copyScriptFixture(workDir) {
  const scriptsDir = path.join(workDir, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.copyFileSync(
    path.join(repoRoot, "scripts", "update-all-version.sh"),
    path.join(scriptsDir, "update-all-version.sh"),
  );
  fs.copyFileSync(
    path.join(repoRoot, "scripts", "ios_pods.json"),
    path.join(scriptsDir, "ios_pods.json"),
  );
}

function createVersionedFixture(workDir) {
  const packageFiles = [
    "package.json",
    "packages/sparkling-debug-tool/package.json",
    "packages/sparkling-sdk/package.json",
    "packages/sparkling-method/package.json",
    "packages/sparkling-types/package.json",
    "packages/methods/sparkling-navigation/package.json",
    "packages/methods/sparkling-media/package.json",
    "packages/methods/sparkling-storage/package.json",
    "template/sparkling-app-template/package.json",
  ];

  for (const file of packageFiles) {
    writeFile(path.join(workDir, file), '{"version": "1.0.0"}\n');
  }

  const podspecs = [
    ["packages/sparkling-sdk/ios/SparklingMacro/SparklingMacro.podspec", "SparklingMacro"],
    ["packages/sparkling-method/ios/SparklingMethod.podspec", "SparklingMethod"],
    ["packages/sparkling-debug-tool/ios/Sparkling-DebugTool.podspec", "Sparkling-DebugTool"],
    ["packages/sparkling-sdk/ios/Sparkling/Sparkling.podspec", "Sparkling"],
    ["packages/methods/sparkling-navigation/ios/Sparkling-Router.podspec", "Sparkling-Router"],
    ["packages/methods/sparkling-media/ios/Sparkling-Media.podspec", "Sparkling-Media"],
    ["packages/methods/sparkling-storage/ios/Sparkling-Storage.podspec", "Sparkling-Storage"],
  ];
  for (const [file, name] of podspecs) {
    writeFile(path.join(workDir, file), `Pod::Spec.new do |s|\n  s.name = "${name}"\n  s.version = "1.0.0"\nend\n`);
  }

  writeFile(
    path.join(workDir, "template/sparkling-app-template/android/app/build.gradle.kts"),
    [
      'implementation("com.tiktok.sparkling:sparkling:1.0.0")',
      'implementation("com.tiktok.sparkling:sparkling-method:1.0.0")',
      'debugImplementation("com.tiktok.sparkling:sparkling-debug-tool:1.0.0")',
      '',
    ].join("\n"),
  );
  writeFile(
    path.join(workDir, "template/sparkling-app-template/ios/Podfile"),
    [
      "pod 'Sparkling', '1.0.0'",
      "pod 'SparklingMacro', '1.0.0'",
      "pod 'SparklingMethod', '1.0.0'",
      "pod 'Sparkling-DebugTool', '1.0.0'",
      "pod 'Sparkling-Router', '1.0.0'",
    ].join("\n"),
  );

  for (const file of [
    "packages/sparkling-debug-tool/android/build.gradle.kts",
    "packages/methods/sparkling-navigation/android/build.gradle.kts",
    "packages/methods/sparkling-media/android/build.gradle.kts",
    "packages/methods/sparkling-storage/android/build.gradle.kts",
  ]) {
    writeFile(
      path.join(workDir, file),
      [
        'val sparklingVersion =',
        '    (findProperty("SPARKLING_ANDROID_SDK_VERSION") as? String)',
        "        ?: System.getenv(\"SPARKLING_ANDROID_SDK_VERSION\")",
        '        ?: "1.0.0"',
        "",
      ].join("\n"),
    );
  }
}

test("update-all-version aligns Android SDK fallback versions", () => {
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "sparkling-version-test-"));
  try {
    copyScriptFixture(workDir);
    createVersionedFixture(workDir);

    execFileSync("bash", ["scripts/update-all-version.sh", "9.9.9-rc.1"], {
      cwd: workDir,
      stdio: "pipe",
    });

    for (const file of [
      "packages/sparkling-debug-tool/android/build.gradle.kts",
      "packages/methods/sparkling-navigation/android/build.gradle.kts",
      "packages/methods/sparkling-media/android/build.gradle.kts",
      "packages/methods/sparkling-storage/android/build.gradle.kts",
    ]) {
      const content = fs.readFileSync(path.join(workDir, file), "utf8");
      assert.match(content, /\?: "9\.9\.9-rc\.1"/, `${file} should use the release SDK fallback`);
      assert.doesNotMatch(content, /\?: "1\.0\.0"/, `${file} should not keep the old SDK fallback`);
    }

    const templateAndroid = fs.readFileSync(
      path.join(workDir, "template/sparkling-app-template/android/app/build.gradle.kts"),
      "utf8",
    );
    assert.match(
      templateAndroid,
      /com\.tiktok\.sparkling:sparkling-debug-tool:9\.9\.9-rc\.1/,
      "template Android debug-tool Maven dependency should be version aligned",
    );
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
});

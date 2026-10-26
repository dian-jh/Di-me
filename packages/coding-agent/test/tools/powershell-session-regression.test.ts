import assert from "node:assert/strict";
import test from "node:test";
import { ShellSession, powershellSessionShell } from "@di/coding-agent";

test("PowerShell preserves Unicode output when the initial console encoding is ASCII", { skip: process.platform !== "win32", timeout: 15000 }, async () => {
  const session = new ShellSession(process.cwd(), {
    ...powershellSessionShell,
    // Use a pipe-driven host loop so the test controls the initial encoding
    // without the interactive host resetting it between prompts.
    prefixArgs: ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command",
      "[Console]::OutputEncoding = [Text.Encoding]::ASCII; while ($null -ne ($line = [Console]::ReadLine())) { Invoke-Expression $line | Out-Default }"],
  });
  try {
    for (const text of ["你好世界", "再次输出 café 😀"]) {
      const result = await session.execute(`Write-Output '${text}'`, 3000);
      assert.equal(result.error, null, result.toObservation());
      assert.equal(result.exitCode, 0, result.toObservation());
      assert.ok(result.output.includes(text), result.toObservation());
    }
  } finally {
    session.dispose();
  }
});

test("PowerShell completes the date command from the stalled session", { skip: process.platform !== "win32", timeout: 12000 }, async () => {
  const session = new ShellSession(process.cwd(), powershellSessionShell);
  try {
    const command = String.raw`$today = Get-Date; \"今天: $($today.ToString('yyyy-MM-dd')) 星期$('日一二三四五六'[[int]$today.DayOfWeek])\"; $ny = Get-Date '2026-01-01'; \"2026-01-01: 星期$('日一二三四五六'[[int]$ny.DayOfWeek])\"`;
    const result = await session.execute(command, 1000);
    assert.equal(result.error, null, result.toObservation());
    assert.notEqual(result.exitCode, 0, "the logged backslash-escaped quotes are invalid PowerShell syntax");
  } finally {
    session.dispose();
  }
});

test("PowerShell reports malformed quoting promptly and accepts the next command", { skip: process.platform !== "win32", timeout: 15000 }, async () => {
  const session = new ShellSession(process.cwd(), powershellSessionShell);
  try {
    const result = await session.execute('Write-Output \\"unterminated', 1000);
    assert.equal(result.error, null, "syntax errors must not wait for the timeout");
    assert.notEqual(result.exitCode, 0, result.toObservation());
    const next = await session.execute("Write-Output recovered", 1000);
    assert.equal(next.error, null, next.toObservation());
    assert.equal(next.exitCode, 0, "a prior syntax error must not poison the next command");
    assert.ok(next.output.includes("recovered"), next.toObservation());
  } finally {
    session.dispose();
  }
});

test("session timeout also bounds a blocked stdin write", { timeout: 12000 }, async () => {
  const session = new ShellSession(process.cwd(), {
    file: process.execPath,
    prefixArgs: ["-e", `process.stdin.once('data', chunk => {
      const ready = chunk.toString().match(/echo (DI_\\w+ready)/)[1];
      process.stdin.pause();
      process.stdout.write(ready + '\\n');
      setInterval(() => {}, 1000);
    });`],
    sessionKind: "sh",
  });
  try {
    const result = await session.execute("x".repeat(4 * 1024 * 1024), 100);
    assert.match(result.error ?? "", /超过/);
  } finally {
    session.dispose();
  }
});

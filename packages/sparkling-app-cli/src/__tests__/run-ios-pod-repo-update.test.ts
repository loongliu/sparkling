// Copyright (c) 2026 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
// @ts-nocheck
/// <reference types="jest" />
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runIos } from '../commands/run-ios';
import { loadAppConfig } from '../config';
import { runCommand } from '../utils/exec';

const mockExecSync = jest.fn();

jest.mock('node:child_process', () => {
  const actual = jest.requireActual('node:child_process');
  return {
    ...actual,
    execSync: (...args: unknown[]) => mockExecSync(...args),
  };
});

jest.mock('../commands/autolink', () => ({
  autolink: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../commands/build', () => ({
  buildProject: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../config', () => {
  const actual = jest.requireActual('../config');
  return {
    ...actual,
    loadAppConfig: jest.fn(),
  };
});

jest.mock('../utils/dev-server', () => ({
  ensureDevServerRunning: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../utils/exec', () => ({
  runCommand: jest.fn().mockResolvedValue(undefined),
}));

function createIosProject(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spk-run-ios-'));
  fs.mkdirSync(path.join(dir, 'ios', 'SparklingGo.xcworkspace'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'Gemfile'), 'source "https://rubygems.org"\ngem "cocoapods", "1.16.2"\n');
  fs.writeFileSync(path.join(dir, 'ios', 'Podfile'), 'source "https://cdn.cocoapods.org/"\n');
  return dir;
}

describe('runIos pod install options', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (loadAppConfig as jest.Mock).mockResolvedValue({
      config: { lynxConfig: {} },
    });
    mockExecSync.mockImplementation((command: string) => {
      if (String(command).includes('simctl list devices')) {
        return JSON.stringify({
          devices: {
            'com.apple.CoreSimulator.SimRuntime.iOS-26-0': [
              {
                name: 'iPhone 17 Pro',
                udid: 'SIM-UDID',
                runtime: 'com.apple.CoreSimulator.SimRuntime.iOS-26-0',
                state: 'Booted',
                isAvailable: true,
              },
            ],
          },
        });
      }
      if (String(command).includes('gem list bundler')) {
        return 'bundler (2.3.27, default: 2.3.26)';
      }
      return '';
    });
  });

  it('passes --repo-update to pod install when requested', async () => {
    const dir = createIosProject();

    await runIos({ cwd: dir, skipCopy: false, podRepoUpdate: true });

    expect(runCommand).toHaveBeenCalledWith(
      'bundle',
      ['exec', 'pod', 'install', '--repo-update'],
      expect.objectContaining({
        cwd: path.join(dir, 'ios'),
        env: { BUNDLE_GEMFILE: path.join(dir, 'Gemfile') },
      }),
    );
  });

  it('keeps the default pod install fast path unchanged', async () => {
    const dir = createIosProject();

    await runIos({ cwd: dir, skipCopy: false });

    expect(runCommand).toHaveBeenCalledWith(
      'bundle',
      ['exec', 'pod', 'install'],
      expect.objectContaining({
        cwd: path.join(dir, 'ios'),
        env: { BUNDLE_GEMFILE: path.join(dir, 'Gemfile') },
      }),
    );
  });
});

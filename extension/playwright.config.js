import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e',timeout:60000,workers:1,fullyParallel:false,
  expect:{timeout:10000,toHaveScreenshot:{maxDiffPixelRatio:0.005}},
  reporter:[['list'],['html',{open:'never'}]],
  outputDir:'test-results',
  webServer:{command:'node scripts/verify-assets.mjs && node scripts/build.mjs && node tests/fixtures/server.js',url:'http://127.0.0.1:8765',reuseExistingServer:false,timeout:10000},
});

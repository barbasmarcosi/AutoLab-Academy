import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/e2e',testMatch:'**/*.spec.js',timeout:45_000,
 expect:{timeout:10_000},fullyParallel:false,retries:process.env.CI?1:0,
 reporter:process.env.CI?[['list'],['html',{open:'never'}]]:'list',
 use:{baseURL:'http://127.0.0.1:4173/AutoLab-Academy/',headless:true,
  screenshot:'only-on-failure',trace:'retain-on-failure'},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'webkit',use:{...devices['Desktop Safari']}},
  {name:'webkit-mobile',use:{...devices['iPhone 13'],browserName:'webkit'}}
 ],
 webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1 --directory site',
  url:'http://127.0.0.1:4173/AutoLab-Academy/',
  reuseExistingServer:!process.env.CI,timeout:30_000}
});

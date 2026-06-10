const browser = process.env['KARMA_BROWSER'] || 'FirefoxHeadless';
const seleniumHost = process.env['SELENIUM_HOST'] || 'localhost';
const seleniumPort = process.env['SELENIUM_PORT'] || '4444';
const karmaHostname = process.env['KARMA_HOSTNAME'] || 'localhost';

const plugins = [
  require('karma-jasmine'),
  require('karma-jasmine-html-reporter'),
  require('karma-coverage'),
  require('karma-spec-reporter'),
];

const customLaunchers = {};

if (browser === 'SeleniumFirefox') {
  plugins.push(require('karma-webdriver-launcher'));
  customLaunchers.SeleniumFirefox = {
    base: 'WebDriver',
    config: {
      hostname: seleniumHost,
      port: Number(seleniumPort),
      path: '/wd/hub',
    },
    browserName: 'firefox',
    'wd-no-defaults': true,
    forceW3C: true,
  };
} else {
  plugins.push(require('karma-firefox-launcher'));
}

module.exports = function (config) {
  config.set({
    frameworks: ['jasmine'],
    plugins,
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/frontend'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['spec'],
    browsers: [browser],
    customLaunchers,
    hostname: karmaHostname,
    singleRun: true,
    restartOnFileChange: true,
  });
};

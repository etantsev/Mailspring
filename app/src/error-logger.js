var ErrorLogger;

// A globally available ErrorLogger that logs errors locally and enhances error
// functionality. Nothing is sent to remote reporting services.
//
// This runs in both the backend browser process and each and every
// renderer process.
//
// This is available as `global.errorLogger` in the backend browser
// process.
//
// It is available at `AppEnv.errorLogger` in each renderer process.
// You should almost always use `AppEnv.reportError` in the renderer
// processes instead of manually accessing the `errorLogger`
module.exports = ErrorLogger = (function () {
  function ErrorLogger(args) {
    this.reportError = this.reportError.bind(this);
    this.inSpecMode = args.inSpecMode;
    this.inDevMode = args.inDevMode;
    this.resourcePath = args.resourcePath;

    this._extendErrorObject();

    this._extendNativeConsole();
  }

  /////////////////////////////////////////////////////////////////////
  /////////////////////////// PUBLIC METHODS //////////////////////////
  /////////////////////////////////////////////////////////////////////

  ErrorLogger.prototype.reportError = function (error, extra = {}) {
    // console.error can itself throw (eg. EPIPE writing to a closed
    // stdout/stderr pipe on Linux). Since reportError is called from our
    // top-level uncaughtException handler, an uncaught throw here would
    // re-enter that same handler and loop forever. Never let this fail.
    try {
      console.error(error, extra);
    } catch (loggingError) {
      // ignore
    }
  };

  /////////////////////////////////////////////////////////////////////
  ////////////////////////// PRIVATE METHODS //////////////////////////
  /////////////////////////////////////////////////////////////////////

  ErrorLogger.prototype._extendNativeConsole = function (args) {
    console.debug = this._consoleDebug.bind(this);
  };

  // globally define Error.toJSON. This allows us to pass errors via IPC
  // and through the Action Bridge. Note:they are not re-inflated into
  // Error objects automatically.
  ErrorLogger.prototype._extendErrorObject = function (args) {
    Object.defineProperty(Error.prototype, 'toJSON', {
      value: function () {
        var alt = {};

        Object.getOwnPropertyNames(this).forEach(function (key) {
          alt[key] = this[key];
        }, this);

        return alt;
      },
      configurable: true,
    });
  };

  // Create a new console.debug option, which takes `true` (print)
  // or `false`, don't print in console as the first parameter.
  // This makes it easy for developers to turn on and off
  // "verbose console" mode.
  ErrorLogger.prototype._consoleDebug = function () {
    var args = [];
    var showIt = arguments[0];
    for (var ii = 1; ii < arguments.length; ii++) {
      args.push(arguments[ii]);
    }
    if (this.inDevMode === true && showIt === true) {
      console.log.apply(console, args);
    }
  };

  return ErrorLogger;
})();

// Waypoint: Browser Edition v0.2.3
// Written by Luke Morton, MIT licensed.
// https://github.com/DrPheltRight/waypoint
!function (definition) {
  if (typeof define === 'function' && define.amd) {
    define(definition);
  } else {
    this.waypoint = definition();
  }
}(function () {
  function require(path) {
    return require[path];
  }

  require['./route'] = new function () {
  var exports = this;
  (function() {
  var Route;

  Route = (function() {
    var paramifyString, regifyString;

    function Route(method, uri, callback) {
      if (callback == null) {
        callback = uri;
        uri = method;
        method = 'GET';
      }
      if (!(uri instanceof RegExp)) this.regex = regifyString(uri, {});
      this.method = method.toUpperCase();
      if (callback != null) this.callback = callback;
    }

    paramifyString = function(str, params, mod) {
      var param, _i, _len;
      mod = str;
      for (_i = 0, _len = params.length; _i < _len; _i++) {
        param = params[_i];
        if (params.hasOwnProperty(param)) {
          mod = params[param](str);
          if (mod !== str) break;
        }
      }
      if (mod === str) {
        return '([a-zA-Z0-9-]+)';
      } else {
        return mod;
      }
    };

    regifyString = function(str, params) {
      var capture, captures, _i, _len;
      if (str.indexOf('*' !== -1)) {
        str = str.replace(/\*/g, '([_\.\(\)!\\ %@&a-zA-Z0-9-]+)');
      }
      captures = str.match(/:([^\/]+)/ig);
      if (captures) {
        for (_i = 0, _len = captures.length; _i < _len; _i++) {
          capture = captures[_i];
          str = str.replace(capture, paramifyString(capture, params));
        }
      }
      return new RegExp("^" + str + "$");
    };

    Route.prototype.match = function(method, uri) {
      var matches;
      if (uri == null) {
        uri = method;
        method = null;
      }
      if ((method != null) && this.method !== method.toUpperCase()) return false;
      matches = this.regex.exec(uri);
      if (matches && (matches.length != null)) return matches.slice(1);
      return false;
    };

    return Route;

  })();

  exports.Route = Route;

}).call(this);

};
require['./router'] = new function () {
  var exports = this;
  (function() {
  var Route, Router;

  Route = require('./route').Route;

  if (!Array.isArray) {
    Array.isArray = function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  Router = (function() {
    var extractUriAndMethod;

    function Router(config) {
      var key, _i, _len, _ref;
      if (config) {
        _ref = ['routes', 'baseUri', 'notFound'];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          if (config[key] != null) this[key] = config[key];
        }
        if (config.routeMap != null) this.routeMap(config.routeMap);
      }
    }

    Router.prototype.baseUri = '';

    Router.prototype.routes = [];

    Router.prototype.notFound = (function() {});

    Router.prototype.route = function(method, uri, callback) {
      var route;
      if (method instanceof Route) {
        route = method;
      } else {
        route = new Route(method, uri, callback);
      }
      return this.routes.push(route);
    };

    Router.prototype.get = function(uri, callback) {
      return this.route('GET', uri, callback);
    };

    Router.prototype.post = function(uri, callback) {
      return this.route('POST', uri, callback);
    };

    extractUriAndMethod = function(uri) {
      var matches, method, _ref;
      matches = uri.match(/^(GET|POST) (.+)/);
      if (matches && (matches.length != null)) {
        _ref = matches.slice(1, 3).reverse(), uri = _ref[0], method = _ref[1];
        method || (method = 'GET');
        return [uri, method];
      } else {
        return [uri || '', 'GET'];
      }
    };

    Router.prototype.routeMap = function(map, baseUri) {
      var callback, method, uri, _ref, _results;
      if (baseUri == null) baseUri = this.baseUri;
      _results = [];
      for (uri in map) {
        callback = map[uri];
        _ref = extractUriAndMethod(uri), uri = _ref[0], method = _ref[1];
        uri = baseUri + uri;
        if (typeof callback === 'function' || Array.isArray(callback)) {
          _results.push(this.route(method, uri, callback));
        } else if (typeof callback === 'object') {
          _results.push(this.routeMap(callback, uri));
        } else {
          throw 'Map must be string array or object';
        }
      }
      return _results;
    };

    Router.prototype.dispatch = function(method, uri) {
      var c, callbacks, matches, route, _i, _j, _len, _len2, _ref;
      _ref = this.routes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        route = _ref[_i];
        matches = route.match(method, uri);
        if (!matches) continue;
        if (Array.isArray(route.callback)) {
          callbacks = route.callback;
        } else {
          callbacks = [route.callback];
        }
        for (_j = 0, _len2 = callbacks.length; _j < _len2; _j++) {
          c = callbacks[_j];
          c.apply(route, matches);
        }
        return true;
      }
      this.notFound();
      return false;
    };

    return Router;

  })();

  exports.Router = Router;

}).call(this);

};


  return {
    'Route' : require('./route').Route,
    'Router' : require('./router').Router,
  };
});
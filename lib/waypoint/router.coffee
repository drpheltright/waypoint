Route = require('./route').Route

unless Array.isArray
  Array.isArray = (obj) ->
    Object.prototype.toString.call(obj) is '[object Array]'

class Router
  constructor: (config) ->
    @routes(config.routes) if config and config.routes?

  _routes: []

  routes: (routes) ->
    @_routes = routes if routes?
    @_routes

  route: (route) ->
    unless route instanceof Route
      route = new Route(route)
    @_routes.push route
  
  routeMap: (map, rootUri = '') ->
    for uri, callback of map
      [uri, method] = parseMethodUri(uri)
      uri = rootUri+uri

      if typeof callback is 'function' or Array.isArray(callback)
        @route
          uri: uri
          method: method
          callback: callback
      else if typeof callback is 'object'
        @routeMap(callback, uri)
      else
        throw 'Map must be string array or object'

  dispatch: (request) ->
    if typeof request == 'string'
      request =
        uri: request
        method: 'get'
      
    for route in @routes()
      matches = route.match(request)
      unless matches
        continue

      if Array.isArray(route.callback)
        callbacks = route.callback
      else
        callbacks = [route.callback]

      for c in callbacks
        c.apply(route, matches)

      return true
    false

parseMethodUri = (uri) ->
  matches = uri.match(/^(GET|POST) (.+)/)
  method = matches[1] if matches and matches[1]
  uri = matches[2] if matches and matches[2]
  [uri, method]

exports.Router = Router
var waypoint = require('../lib/waypoint');
var Router = waypoint.Router;
var Route = waypoint.Route;

var router = new Router({
	'routes' : [
		new Route('/home/:a', function (a) {
			console.log('root', a);
		})
	],
});

router.dispatch('/home/bob');
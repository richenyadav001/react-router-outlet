"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_router_dom_1 = require("react-router-dom");
var RouterUtility = /** @class */ (function () {
    function RouterUtility() {
        this.stopListening = {};
        this.currentPath = '';
        this.rootRoute = [];
        this.childRoute = [];
        this.currentRoutes = [];
        this.listeningPaths = [];
        this.rootLoaded = false;
        // Default config object
        // @TODO Ex HashRouter or BrowserRouter, hasType
        this.config = {
            ejectHistory: true,
            enableTracing: false,
            useHash: true
        };
    }
    RouterUtility.prototype.startListeningHistory = function () {
        var _this = this;
        this.stopListening = this.historyLocation.listen(function (location, action) {
            var params = {
                action: action,
                pathname: location.pathname
            };
            _this.triggerCustomEvent(params);
        });
    };
    RouterUtility.prototype.stopListeningHistory = function () {
        this.stopListening();
    };
    RouterUtility.prototype.push = function (path) {
        this.historyLocation.push(path);
    };
    RouterUtility.prototype.replace = function (path) {
        this.historyLocation.replace(path);
    };
    RouterUtility.prototype.goBack = function () {
        this.historyLocation.goBack();
    };
    RouterUtility.prototype.goForward = function () {
        this.historyLocation.goForward();
    };
    /**
     * forRoot
     */
    RouterUtility.prototype.forRoot = function (routes, config) {
        Object.assign(this.config, config);
        this.currentRoutes = routes;
        this.currentPath = '';
        this.setRootRoute(this.currentRoutes);
        // Only for HashRouter
        // hashType
        // "slash" - Creates hashes like #/ and #/sunshine/lollipops
        // "noslash" - Creates hashes like # and #sunshine/lollipops
        // "hashbang" - Creates “ajax crawlable” (deprecated by Google) hashes like #!/ and #!/sunshine/lollipops
    };
    /**
     * forChild
     */
    RouterUtility.prototype.forChild = function (routes) {
        this.currentRoutes = routes;
        var temp = this.resolveRoutes(this.currentRoutes, this.getPathArray());
        this.childRoute = this.cleanRoute(temp);
    };
    /**
     * getRouterOutlet
     * @param data : component props
     */
    RouterUtility.prototype.getRouterOutlet = function (data) {
        var _this = this;
        var element;
        if (this.rootLoaded) {
            element = this.childRoute.map(function (item, id) { return (<react_router_dom_1.Route key={id} path={_this.setListeningPath(item.path)} render={function (props) { return _this.loadComponent(props, item, data); }}/>); });
        }
        else {
            this.rootLoaded = true;
            element = <react_router_dom_1.HashRouter hashType='slash' getUserConfirmation={this.getConfirmation}>
				{this.rootRoute.map(function (item, id) { return (<react_router_dom_1.Route key={id} path={item.path} render={function (props) { return _this.loadComponent(props, item, data); }}/>); })}
			</react_router_dom_1.HashRouter>;
        }
        return element;
    };
    RouterUtility.prototype.resolveRoutes = function (routes, cPath) {
        for (var i = 0; i < routes.length; i++) {
            var pObj = routes[i];
            if (cPath[cPath.length - 1] === pObj.path) {
                if (pObj.hasOwnProperty('children')) {
                    return this.resolveRoutes(pObj.children, cPath);
                }
                else {
                    return routes;
                }
            }
            else {
                return routes;
            }
        }
    };
    /**
     * getPathArray
     */
    RouterUtility.prototype.getPathArray = function () {
        var cPath = this.getCurrentPath().split('/');
        cPath.shift();
        // console.log(cPath)
        return cPath;
    };
    /**
     * setRootRoute
     */
    RouterUtility.prototype.setRootRoute = function (route) {
        var _this = this;
        this.rootRoute = route.map(function (data) {
            data.path = _this.addSlashToPath(data.path);
            return data;
        });
        // console.log('Root Route', this.rootRoute);
    };
    RouterUtility.prototype.cleanRoute = function (filteredRoute) {
        var tArray = [];
        for (var i = 0; i < filteredRoute.length; i++) {
            var newData = Object.assign({}, filteredRoute[i]);
            if (newData.hasOwnProperty('children')) {
                delete newData.children;
            }
            newData.path = this.getCurrentPath() + this.addSlashToPath(newData.path);
            tArray.push(newData);
        }
        return tArray;
    };
    RouterUtility.prototype.getCurrentPath = function () {
        return this.currentPath;
    };
    /*
    * addSlashToPath
    * Prepend '/' to paths
    */
    RouterUtility.prototype.addSlashToPath = function (path) {
        if (path.indexOf('/') !== -1) {
            // Clean any previous slash
            path = path.replace(/\//g, '');
        }
        return '/' + path;
    };
    /*
    * setCurrentPath
    * This method push new loaded path to route tree
    */
    RouterUtility.prototype.setCurrentPath = function (rPath) {
        this.currentPath = rPath;
        // console.log('Loaded Path', this.getCurrentPath());
    };
    /*
    * getConfirmation
    * @TODO Not working have to find out why?
    */
    RouterUtility.prototype.getConfirmation = function (message, callback) {
        var allowTransition = window.confirm(message);
        callback(allowTransition);
    };
    /*
    * setListeningPath
    * This method sets path for listening upcomming paths
    */
    RouterUtility.prototype.setListeningPath = function (path) {
        // console.log('Listening paths', path);
        this.listeningPaths.push(path);
        return path;
    };
    RouterUtility.prototype.loadComponent = function (props, item, params) {
        this.setCurrentPath(props.match.path);
        if (Object.keys(this.historyLocation).length === 0) {
            if (this.config.ejectHistory) {
                // Ejecting history object
                this.setHistoryLocation(props.history);
            }
            if (this.config.enableTracing) {
                // Listening to history events
                this.startListeningHistory();
            }
        }
        // HistoryLocation.triggerCustomEvent(props.history);
        return <item.component data={params}/>;
    };
    /*
    * setHistoryLocation
    * History Event and actions
    */
    RouterUtility.prototype.setHistoryLocation = function (loc) {
        this.historyLocation = loc;
    };
    /*
    * triggerCustomEvent
    * History Event and actions
    */
    RouterUtility.prototype.triggerCustomEvent = function (params) {
        this.historyEvents = new CustomEvent('historyaction', { detail: params });
        window.dispatchEvent(this.historyEvents);
    };
    return RouterUtility;
}());
exports.RouterUtility = RouterUtility;

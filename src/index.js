import React from 'react';
import { HashRouter as Router, Route } from "react-router-dom";
//import { Redirect, Switch  } from "react-router-dom";
//import { HistoryLocation } from './historyLocation';

class RouterUtility {
  constructor() {
    this.historyEvents = {};
    this.historyLocation = {};
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
      useHash: true,
      ejectHistory: true,
      enableTracing: false
    }
  }

  forRoot(routes, config) {
    console.log('Called forRoot');
    Object.assign(this.config, config);
    this.currentRoutes = routes;
    this.currentPath = '';
    this.setRootRoute(this.currentRoutes);
    // Only for HashRouter
    // hashType
    // "slash" - Creates hashes like #/ and #/sunshine/lollipops
    // "noslash" - Creates hashes like # and #sunshine/lollipops
    // "hashbang" - Creates “ajax crawlable” (deprecated by Google) hashes like #!/ and #!/sunshine/lollipops
  }

  forChild(routes) {
    console.log('Called forChild', routes);
    this.currentRoutes = routes;
    console.time('resolveRoutes');
    let temp = this.resolveRoutes(this.currentRoutes, this.getPathArray());
    console.timeEnd('resolveRoutes');

    console.time('cleanRoute');
    this.childRoute = this.cleanRoute(temp);
    console.timeEnd('cleanRoute');
  }

  getRouterOutlet(data) {
    console.log('Called getRouterOutlet');
    console.log('RootRoute', this.rootRoute);
    console.log('ChildRoute', this.childRoute);
    console.log('CurrentRoutes', this.currentRoutes);
    let element;
    if (this.rootLoaded) {
      element = this.childRoute.map((item, id) => (
        <Route key={id} path={this.setListeningPath(item.path)} render={(props) => this.loadComponent(props, item, data)} />
      ));
    } else {
      this.rootLoaded = true;
      element = <Router hashType='slash' getUserConfirmation={this.getConfirmation}>
        {
          this.rootRoute.map((item, id) => (
            <Route key={id} path={item.path} render={(props) => this.loadComponent(props, item, data)} />
          ))
        }
      </Router>;
    }
    return element;
  }

  resolveRoutes(routes, cPath) {
    for (let i = 0; i < routes.length; i++) {
      let pObj = routes[i];
      if (cPath[cPath.length - 1] === pObj.path) {
        if (pObj.hasOwnProperty('children')) {
          return this.resolveRoutes(pObj.children, cPath);
        } else {
          return routes;
        }
      } else {
        return routes;
      }
    }
  }

  cleanRoute(filteredRoute) {
    // return filteredRoute.map((data)=>{
    // 	let newData = Object.assign({}, data);
    // 	if(newData.hasOwnProperty('children')) {
    // 		delete newData.children;
    // 	}
    // 	newData.path = this.getCurrentPath() + this.addSlashToPath(newData.path)
    // 	return newData;
    // })
    let tArray = [];
    for (var i = 0; i < filteredRoute.length; i++) {
      let newData = Object.assign({}, filteredRoute[i]);
      if (newData.hasOwnProperty('children')) {
        delete newData.children;
      }
      newData.path = this.getCurrentPath() + this.addSlashToPath(newData.path);
      tArray.push(newData);
    }
    return tArray;
  }

  /* @TODO Not working have to find out why? */
  getConfirmation(message, callback) {
    const allowTransition = window.confirm(message);
    callback(allowTransition);
  }

  /* This method push new loaded path to route tree */
  setCurrentPath(rPath) {
    this.currentPath = rPath;
    console.log('Loaded Path', this.getCurrentPath());
  }

  getCurrentPath() {
    return this.currentPath;
  }

  getPathArray() {
    let cPath = this.getCurrentPath().split('/');
    cPath.shift();
    console.log(cPath)
    return cPath;
  }

  /*This method sets path for listening upcomming paths*/
  setListeningPath(path) {
    console.log('Listening paths', path);
    this.listeningPaths.push(path);
    return path;
  }

  setRootRoute(route) {
    this.rootRoute = route.map((data) => {
      data.path = this.addSlashToPath(data.path);
      return data;
    });
    console.log('Root Route', this.rootRoute);
  }

  /* Prepend '/' to paths */
  addSlashToPath(path) {
    if (path.indexOf('/') !== -1) {
      // Clean any previous slash
      path = path.replace(/\//g, '');
    }
    return '/' + path;
  }

  loadComponent(props, item, params) {
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
    //HistoryLocation.triggerCustomEvent(props.history);
    return <item.component data={params} />;
  }

  /* History Event and actions */
  setHistoryLocation(loc) {
    this.historyLocation = loc;
  }

  startListeningHistory() {
    this.stopListening = this.historyLocation.listen((location, action) => {
      let params = {
        action: action,
        pathname: location.pathname
      }
      this.triggerCustomEvent(params);
    });
  }

  stopListeningHistory() {
    this.stopListening();
  }

  push(path) {
    //debugger;
    //this.setCurrentPath('/learner');
    //this.forChild(this.currentRoutes);
    this.historyLocation.push(path);
  }

  replace(path) {
    this.historyLocation.replace(path);
  }

  goBack() {
    this.historyLocation.goBack();
  }

  goForward() {
    this.historyLocation.goForward();
  }

  triggerCustomEvent(params) {
    console.log("Event payload ----------->", params);
    this.historyEvents = new CustomEvent('historyaction', { detail: params });
    window.dispatchEvent(this.historyEvents);
  }
}

const RU = new RouterUtility();

export { RU }
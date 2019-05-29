import * as React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

interface ILocation {
  pathname: string;
}

// interface ICallback {
// 	(arg1: ILocation, arg2: string) => any;
// }

interface IComObject {
  path: string;
  component: React.ElementType;
}

interface IConfig {
  ejectHistory: boolean;
  enableTracing: boolean;
  useHash: boolean;
}

interface IHistoryLocation {
  listen(arg: any): any;
  push(arg: string): any;
  replace(arg: string): any;
  goBack(): any;
  goForward(): any;
}

class RouterUtility {
  private historyEvents: CustomEvent;
  private historyLocation: IHistoryLocation;
  private stopListening: any = {};

  private currentPath: string = '';
  private rootRoute: Array<object> = [];
  private childRoute: Array<object> = [];
  private currentRoutes: Array<object> = [];
  private listeningPaths: Array<string> = [];
  private rootLoaded: boolean = false;
  // Default config object
  // @TODO Ex HashRouter or BrowserRouter, hasType
  private config: IConfig = {
    ejectHistory: true,
    enableTracing: false,
    useHash: true,
  };

  public startListeningHistory() {
    this.stopListening = this.historyLocation.listen((location: ILocation, action: string) => {
      const params = {
        action: action,
        pathname: location.pathname,
      };
      this.triggerCustomEvent(params);
    });
  }

  public stopListeningHistory() {
    this.stopListening();
  }

  public push(path: string) {
    this.historyLocation.push(path);
  }

  public replace(path: string) {
    this.historyLocation.replace(path);
  }

  public goBack() {
    this.historyLocation.goBack();
  }

  public goForward() {
    this.historyLocation.goForward();
  }

  /**
   * forRoot
   */
  public forRoot(routes: any, config: object) {
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

  /**
   * forChild
   */
  public forChild(routes: any) {
    this.currentRoutes = routes;
    const temp: any = this.resolveRoutes(this.currentRoutes, this.getPathArray());
    this.childRoute = this.cleanRoute(temp);
  }

  /**
   * getRouterOutlet
   * @param data : component props
   */
  public getRouterOutlet(data: any) {
    let element;
    if (this.rootLoaded) {
      element = this.childRoute.map((item: any, id: number) => (
        <Route
          key={id}
          path={this.setListeningPath(item.path)}
          render={(props: any) => this.loadComponent(props, item, data)}
        />
      ));
    } else {
      this.rootLoaded = true;
      element = (
        <Router hashType="slash" getUserConfirmation={this.getConfirmation}>
          {this.rootRoute.map((item: any, id: number) => (
            <Route key={id} path={item.path} render={(props: any) => this.loadComponent(props, item, data)} />
          ))}
        </Router>
      );
    }
    return element;
  }

  private resolveRoutes(routes: Array<any>, cPath: Array<any>): Array<any> | undefined {
    for (let i = 0; i < routes.length; i++) {
      const pObj = routes[i];
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

  /**
   * getPathArray
   */
  private getPathArray() {
    const cPath = this.getCurrentPath().split('/');
    cPath.shift();
    // console.log(cPath)
    return cPath;
  }

  /**
   * setRootRoute
   */
  private setRootRoute(route: Array<any>) {
    this.rootRoute = route.map(data => {
      data.path = this.addSlashToPath(data.path);
      return data;
    });
    // console.log('Root Route', this.rootRoute);
  }

  private cleanRoute(filteredRoute: Array<any>) {
    const tArray = [];
    for (var i = 0; i < filteredRoute.length; i++) {
      const newData = Object.assign({}, filteredRoute[i]);
      if (newData.hasOwnProperty('children')) {
        delete newData.children;
      }
      newData.path = this.getCurrentPath() + this.addSlashToPath(newData.path);
      tArray.push(newData);
    }
    return tArray;
  }

  private getCurrentPath() {
    return this.currentPath;
  }

  /*
   * addSlashToPath
   * Prepend '/' to paths
   */
  private addSlashToPath(path: string) {
    if (path.indexOf('/') !== -1) {
      // Clean any previous slash
      path = path.replace(/\//g, '');
    }
    return '/' + path;
  }

  /*
   * setCurrentPath
   * This method push new loaded path to route tree
   */
  private setCurrentPath(rPath: string) {
    this.currentPath = rPath;
    // console.log('Loaded Path', this.getCurrentPath());
  }

  /*
   * getConfirmation
   * @TODO Not working have to find out why?
   */
  private getConfirmation(message: string, callback: any) {
    const allowTransition = window.confirm(message);
    callback(allowTransition);
  }

  /*
   * setListeningPath
   * This method sets path for listening upcomming paths
   */
  private setListeningPath(path: string): string {
    // console.log('Listening paths', path);
    this.listeningPaths.push(path);
    return path;
  }

  private loadComponent(props: any, item: IComObject, params: any) {
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
    return <item.component data={params} />;
  }

  /*
   * setHistoryLocation
   * History Event and actions
   */
  private setHistoryLocation(loc: IHistoryLocation) {
    this.historyLocation = loc;
  }

  /*
   * triggerCustomEvent
   * History Event and actions
   */
  private triggerCustomEvent(params: any) {
    this.historyEvents = new CustomEvent('historyaction', { detail: params });
    window.dispatchEvent(this.historyEvents);
  }
}

export { RouterUtility };

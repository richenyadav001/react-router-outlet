/// <reference types="react" />
declare class RouterUtility {
    private historyEvents;
    private historyLocation;
    private stopListening;
    private currentPath;
    private rootRoute;
    private childRoute;
    private currentRoutes;
    private listeningPaths;
    private rootLoaded;
    private config;
    startListeningHistory(): void;
    stopListeningHistory(): void;
    push(path: string): void;
    replace(path: string): void;
    goBack(): void;
    goForward(): void;
    /**
     * forRoot
     */
    forRoot(routes: any, config: object): void;
    /**
     * forChild
     */
    forChild(routes: any): void;
    /**
     * getRouterOutlet
     * @param data : component props
     */
    getRouterOutlet(data: any): JSX.Element | JSX.Element[];
    private resolveRoutes;
    /**
     * getPathArray
     */
    private getPathArray;
    /**
     * setRootRoute
     */
    private setRootRoute;
    private cleanRoute;
    private getCurrentPath;
    private addSlashToPath;
    private setCurrentPath;
    private getConfirmation;
    private setListeningPath;
    private loadComponent;
    private setHistoryLocation;
    private triggerCustomEvent;
}
export { RouterUtility };

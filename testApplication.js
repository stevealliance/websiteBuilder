// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module websiteBuilder */
'use strict'
/* !
    region header
    [Project page](http://torben.website/websiteBuilder)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by torben sickert stand under a creative commons
    naming 3.0 unported license.
    see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import GenericModule, {InitialDataService} from 'angular-generic'
import {Component, enableProdMode, NgModule, VERSION} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'
import {Router, RouterModule} from '@angular/router'
import Editable from './angular'
// endregion
@Component({
    selector: 'a',
    template: `
        <h2>A</h2>
        <b></b>
    `
})
class A {}
@Component({
    selector: 'b',
    template: `
        <h2>B</h2>
        <div>
            <span simpleInitializedEditable="greeting">
                Hello angular version
            </span>
            <div style="width: 100px; height: 100px" simpleEditable="greeting2">
                Hello angular version
            </div>
            ${VERSION.full}
        </div>
    `
})
class B {}
@Component({
    selector: 'application',
    template: `
        <router-outlet></router-outlet>
    `
})
class Application {}
export default ():void => {
    @NgModule({
        bootstrap: [Application],
        declarations: [
            Application,
            A,
            B,
            Editable
        ],
        imports: [
            BrowserModule,
            GenericModule,
            RouterModule.forRoot(
                [
                    {
                        children: [
                            {
                                component: B,
                                path: 'B'
                            },
                            {
                                component: A,
                                path: 'A'
                            }
                        ],
                        component: Application,
                        path: 'A'
                    },
                    {
                        path: '**',
                        redirectTo: '/A/A'
                    }
                ]
            )
        ]
    })
    class ApplicationModule {
        constructor(initialData:InitialDataService, router:Router):void {
            router.navigate([initialData.path])
        }
    }
    platformBrowserDynamic().bootstrapModule(ApplicationModule)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

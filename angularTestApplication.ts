// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module websiteBuilder */
// TODO 'use strict'
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
import {Component, enableProdMode, NgModule, VERSION} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
@Component({
    selector: 'a',
    template: `
        <b></b>
    `
})
export class A {}
@Component({
    selector: 'b',
    template: `
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
export class B {}
@Component({
    selector: 'angular-application',
    template: `
        <router-outlet></router-outlet>
    `
})
export class Application {}
@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot(
            [
                {
                    children: [
                        {
                            component: A,
                            path: 'B'
                        }
                    ],
                    component: Application,
                    path: 'A'
                },
                {
                    path: '**',
                    redirectTo: 'A/B'
                }
            ]
        )
    ],
    declarations: [
        Application,
        A,
        B,
        Editable
    ],
    bootstrap: [Application]
})
export class ApplicationModule {}
// endregion
const main:Function = ():void => platformBrowserDynamic().bootstrapModule(
    ApplicationModule)
websiteBuilder ? websiteBuilder.registerOnChange((
    parameterHasChanged:boolean
) => parameterHasChanged ? main() : null) : main()
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

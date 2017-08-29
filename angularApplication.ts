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
import {
    Component, Directive, ElementRef, enableProdMode, Injector, Input,
    NgModule, Optional, Renderer2, VERSION, ViewContainerRef
} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'
import {ActivatedRoute, RouterModule, UrlSegment} from '@angular/router'
class InitialDataService {}
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
const attributeNames:Array<string> = [
    'editable', 'initializedEditable',
    'simpleEditable', 'simpleInitializedEditable',
    'advancedEditable', 'advancedInitializedEditable'
]
let selector:string = ''
for (const name:string of attributeNames)
    selector += `,[${name}]`
@Directive({
    inputs: attributeNames,
    selector: selector.substring(1)
})
class Editable {
    activatedRoute:?ActivatedRoute
    contextPath:string = ''
    elementReference:ElementRef
    initialData:?InitialDataService
    injector:Injector
    renderer:Renderer2
    scope:Object = {}
    constructor(
        @Optional() activatedRoute:ActivatedRoute, elementReference:ElementRef,
        @Optional() initialData:InitialDataService, injector:Injector,
        renderer:Renderer2
    ) {
        this.activatedRoute = activatedRoute
        this.elementReference = elementReference
        this.initialData = initialData
        this.injector = injector
        this.renderer = renderer
    }
    determinePath():void {
        let view:Object = this.injector.view
        let component:string = view.component
        this.contextPath += component.constructor.name
        while (true) {
            view = view.parent
            const index:number = view.nodes.filter(
                (node:Object) => node.instance
            ).map((node:Object) => node.instance).indexOf(component)
            if (
                'parent' in view && view.parent && 'component' in view.parent
            ) {
                component = view.component
                this.contextPath =
                    `${component.constructor.name}/${index}-` +
                    this.contextPath
            } else
                break
        }
        if (this.activatedRoute) {
            const paths:Array<string> =
                this.activatedRoute.snapshot.pathFromRoot.map(
                    (routeSnapshot:Object):Array<string> => routeSnapshot.url.map((
                        urlSegment:UrlSegment
                    ):string => urlSegment.path).join('/')
                ).filter((url:string):boolean => Boolean(url))
            if (paths.length)
                this.contextPath = `${paths.join('/')}:${this.contextPath}`
        }
    }
    ngOnInit():void {
        this.determinePath()
        if (websiteBuilder)
            this.scope = websiteBuilder.scope
        else if (this.initialData && this.initialData.scope)
            this.scope = this.initialData.scope
        else if (scope)
            this.scope = scope
        for (const name:string of attributeNames)
            if (
                this.hasOwnProperty(name) &&
                typeof this[name] === 'string' &&
                this[name]
            ) {
                this.contextPath += `:${this[name]}`
                if (!name.toLowerCase().includes('initialized'))
                    this.renderer.setProperty(
                        this.elementReference.nativeElement, 'innerHTML', '')
                if (websiteBuilder) {
                    if (websiteBuilder.currentMode === 'preview') {
                        websiteBuilder.renderDomNode(
                            this.contextPath,
                            this.elementReference.nativeElement)
                        break
                    }
                    const tuple:Array<Object> = [
                        this.elementReference.nativeElement]
                    // TODO use tinymce
                    this.renderer.setAttribute(
                        this.elementReference.nativeElement,
                        'contenteditable', '')
                    websiteBuilder.registerInPlaceEditor(
                        this.contextPath, tuple)
                    websiteBuilder.updateModel(
                        this.contextPath, this.elementReference.nativeElement,
                        true)
                    // TODO
                    this.renderer.listen(
                        this.elementReference.nativeElement, 'input', (
                            event:Object
                        ):void => websiteBuilder.updateModel(
                            this.contextPath, this.elementReference.nativeElement))
                } else if (this[name] in this.scope)
                    this.renderer(
                        this.elementReference.nativeElement, 'innerHTML',
                        this.scope[this[name]])
                break
            }
    }
}

// region test
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

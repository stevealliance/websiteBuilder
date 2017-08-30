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
import {
    determineDeclarations, determineExports, determineProviders,
    InitialDataService, TINY_MCE_DEFAULT_OPTIONS
} from 'angular-generic'
import {globalContext} from 'clientnode'
import {
    Directive, ElementRef, Injector, Input, Optional, Renderer2
} from '@angular/core'
import {ActivatedRoute, UrlSegment} from '@angular/router'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import {TinyMceComponent, TinyMceModule} from 'angular-tinymce'
// endregion
// region directives
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
export class Editable {
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
        renderer:Renderer2, tinyMCEComponent:TinyMceComponent
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
        if ('websiteBuilder' in globalContext)
            this.scope = globalContext.websiteBuilder.scope
        else if (this.initialData && this.initialData.scope)
            this.scope = this.initialData.scope
        else if ('scope' in globalContext)
            this.scope = globalContext.scope
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
                if ('websiteBuilder' in globalContext) {
                    if (
                        globalContext.websiteBuilder.currentMode === 'preview'
                    ) {
                        globalContext.websiteBuilder.renderDomNode(
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
                    globalContext.websiteBuilder.registerInPlaceEditor(
                        this.contextPath, tuple)
                    globalContext.websiteBuilder.updateModel(
                        this.contextPath, this.elementReference.nativeElement,
                        true)
                    // TODO
                    this.renderer.listen(
                        this.elementReference.nativeElement, 'input', (
                            event:Object
                        ):void => globalContext.websiteBuilder.updateModel(
                            this.contextPath,
                            this.elementReference.nativeElement))
                } else if (this[name] in this.scope)
                    this.renderer(
                        this.elementReference.nativeElement, 'innerHTML',
                        this.scope[this[name]])
                break
            }
    }
}
// endregion
// region module
// IgnoreTypeCheck
@NgModule({
    declarations: determineDeclarations(module),
    exports: determineExports(module),
    imports: [TinyMceModule.forRoot(TINY_MCE_DEFAULT_OPTIONS)],
    providers: determineProviders(module)
})
/**
 * Represents the importable angular module.
 */
export default class Module {}
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

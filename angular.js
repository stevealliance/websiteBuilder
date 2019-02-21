// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module websiteBuilder */
'use strict'
/* !
    region header
    [Project page](https://torben.website/websiteBuilder)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by torben sickert stand under a creative commons
    naming 3.0 unported license.
    see https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {
    determineDeclarations,
    determineExports,
    determineProviders,
    InitialDataService,
    TINY_MCE_DEFAULT_OPTIONS
} from 'angular-generic/service'
import {globalContext} from 'clientnode'
import {
    Directive,
    ElementRef,
    Injector,
    Input,
    NgModule,
    Optional,
    Renderer2
} from '@angular/core'
import {ActivatedRoute, UrlSegment} from '@angular/router'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
// endregion
// region components
const attributeNames:Array<string> = [
    'rawEditable', 'rawInitializedEditable',
    'simpleEditable', 'simpleInitializedEditable',
    'editable', 'initializedEditable',
    'advancedEditable', 'advancedInitializedEditable'
]
let selector:string = ''
for (const name:string of attributeNames)
    selector += `,[${name}]`
@Directive({
    inputs: attributeNames,
    selector: selector.substring(1),
})
export class EditableDirective {
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
        if ('websiteBuilder' in globalContext)
            this.scope = globalContext.websiteBuilder.scope
        else if (this.initialData && this.initialData.scope)
            this.scope = this.initialData.scope
        else if ('scope' in globalContext)
            this.scope = globalContext.scope
    }
    ngAfterViewInit():void {
        for (const name:string of attributeNames)
            if (
                this.hasOwnProperty(name) &&
                typeof this[name] === 'string' &&
                this[name]
            ) {
                this.contextPath += `:${this[name]}`
                if (
                    'websiteBuilder' in globalContext &&
                    globalContext.websiteBuilder.currentMode !== 'preview'
                )
                    // NOTE: This will break in none browser environments.
                    globalContext.websiteBuilder.initializeInPlaceEditor(
                        name, this.contextPath,
                        this.elementReference.nativeElement)
                else {
                    let content:string = ''
                    if (this.contextPath in this.scope)
                        content = this.scope[this.contextPath]
                    else if (
                        name.toLowerCase().includes('initialized') &&
                        this.elementReference.nativeElement &&
                        'innerHTML' in this.elementReference.nativeElement
                    )
                        // NOTE: This could break in none browser environments.
                        content = this.elementReference.nativeElement.innerHTML
                            .trim()
                    if (content) {
                        const validNames:Array<string> = Object.keys(
                            this.scope
                        ).filter((name:string):boolean => {
                            try {
                                new Function(`var ${name}`)()
                            } catch (error) {
                                return false
                            }
                            return true
                        })
                        // IgnoreTypeCheck
                        content = new Function(
                            'scope', ...validNames, `return \`${content}\``
                        )(this.scope, ...validNames.map((name:string):any =>
                            this.scope[name]))
                    } else
                        content = ''
                    this.renderer.setProperty(
                        this.elementReference.nativeElement, 'innerHTML',
                        content)
                }
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
    providers: determineProviders(module)
})
/**
 * Represents the importable angular module.
 */
export class Module {}
export default Module
// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

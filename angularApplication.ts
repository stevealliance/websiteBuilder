import {
    Component, Directive, ElementRef, enableProdMode, Injector, Input,
    NgModule, Optional, Renderer2, VERSION, ViewContainerRef
} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'
import {ActivatedRoute, RouterModule} from '@angular/router'

const camelCaseToDelimited:Function (string:string):string =>
    string.replace(/([^-])([A-Z][a-z]+)/g, '$1-$2').replace(
        /([a-z0-9])([A-Z])/g, '$1-$2'
    ).toLowerCase()
const attributeNames:Array<string> = [
    'editable', 'initializedEditable',
    'simpleEditable', 'simpleInitializedEditable',
    'advancedEditable', 'advancedInitializedEditable'
]
const selector:string = ''
for (const type:string of attributeNames)
    selector += `,[${camelCaseToDelimited(type)}]`
@Directive({
    inputs: attributeNames,
    selector: selector.substring(1)
})
class Editable {
    activatedRoute:ActivatedRoute
    elementReference:ElementRef
    injector:Injector
    renderer:Renderer2
    path:string = ''
    constructor(
        @Optional() activatedRoute:ActivatedRoute, elementReference:ElementRef,
        injector:Injector, renderer:Renderer2
    ) {
        this.activatedRoute = activatedRoute
        this.elementReference = elementReference
        this.injector = injector
        this.renderer = renderer
    }
    determinePath():void {
        let view:Object = this.injector.view
        let component:string = view.component
        this.path += component.constructor.name
        while (true) {
            view = view.parent
            const index:number = view.nodes.filter(
                (node) => node.instance
            ).map((node) => node.instance).indexOf(component)
            if ('parent' in view && view.parent && 'component' in view.parent) {
                component = view.component
                this.path = `${component.constructor.name}/${index}-${this.path}`
            } else
                break
        }
        if (this.activatedRoute) {
            const paths:Array<string> =
                this.activatedRoute.snapshot.pathFromRoot.map(
                    (routeSnapshot) => routeSnapshot.url.map((urlSegment) =>
                        urlSegment.path
                    ).join('/')).filter((url) => url)
            if (paths.length)
                this.path = `${paths.join('/')}:${this.path}`
        }
    }
    ngOnInit():void {
        this.determinePath()
        for (const name:string of attributeNames)
            if (
                this.hasOwnProperty(name) &&
                typeof this[name] === 'string' &&
                this[name]
            ) {
                this.path += `:${this[name]}`
                if (websiteBuilder) {
                    if (!name.toLowerCase().includes('initialized'))
                        this.elementReference.nativeElement.innerHTML = ''
                    if (websiteBuilder.currentMode === 'preview') {
                        websiteBuilder.renderDomNode(
                            this.path, this.elementReference.nativeElement)
                        break
                    }
                    this.renderer.setAttribute(
                        this.elementReference.nativeElement,
                        'contenteditable', '')
                    websiteBuilder.registerInPlaceEditor(
                        this.path, [this.elementReference.nativeElement])
                    websiteBuilder.updateModel(
                        this.path, this.elementReference.nativeElement, true)
                    this.renderer.listen(
                        this.elementReference.nativeElement, 'input', (
                            event:Object
                        ):void => websiteBuilder.updateModel(
                            this.path, this.elementReference.nativeElement)
                } else
                    this.renderer.removeAttribute(
                        this.elementReference.nativeElement,
                        camelCaseToDelimited(name))
                break
            }
    }
}


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
            <span simple-initialized-editable="greeting">
                Hello angular version
            </span>
            <div style="width: 100px; height: 100px" simple-editable="greeting2">
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
enableProdMode()


const main:Function = ():void => platformBrowserDynamic().bootstrapModule(
    ApplicationModule)
websiteBuilder ? websiteBuilder.registerOnChange((parameter) => parameter ? main() : null) : main()

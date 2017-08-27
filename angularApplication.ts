import {
    Component, Directive, ElementRef, enableProdMode, Input, NgModule,
    Renderer2, VERSION
} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic'

const selector:string = ''
for (const type:string of ['', 'simple-', 'advanced-'])
    for (const defaultType:string of ['', 'initialized-'])
        selector += `,[${type}${defaultType}editable]`
@Directive({selector: selector.substring(1)})
class BindSimple {
    @Input('editable') editable:string
    @Input('initialized-editable') initializedEditable:string
    @Input('simple-editable') simpleEditable:string
    @Input('simple-initialized-editable') simpleInitializedEditable:string
    @Input('advanced-editable') advancedEditable:string
    @Input('advanced-initialized-editable') advancedInitializedEditable:string
    constructor(elementReference:ElementRef, renderer:Renderer2) {
        this._elementReference = elementReference
        this._renderer = renderer
    }
    ngOnInit():void {
        for (const name:string of [
            'editable', 'initializedEditable',
            'simpleEditable', 'simpleInitializedEditable',
            'advancedEditable', 'advancedInitializedEditable'
        ])
            if (
                this.hasOwnProperty(name) &&
                typeof this[name] === 'string' &&
                this[name]
            ) {
                if (websiteBuilder) {
                    this._renderer.setAttribute(
                        this._elementReference.nativeElement, 'contenteditable', ''
                    )
                    this._renderer.listen(
                        this._elementReference.nativeElement, 'input', (
                            event:Object
                        ):void => websiteBuilder.updateModel(name, {getContent: () => {}}))
                } else
                    this._renderer.removeAttribute(
                        this._elementReference.nativeElement, name.replace(
                            /([A-Z])/g, (match):string => `-${match.toLowerCase()}`))
                break
            }
    }
}
@Component({
    selector: 'angular-application',
    template: `
        <h2>
            <span simple-initialized-editable="greeting">
                Hello angular version
            </span>
            ${VERSION.full}
        </h2>
    `
})
export class Application {}
@NgModule({
    imports: [BrowserModule],
    declarations: [Application, BindSimple],
    bootstrap: [Application]
})
export class ApplicationModule {}
enableProdMode()
const main:Function = ():void => platformBrowserDynamic().bootstrapModule(
    ApplicationModule)
websiteBuilder ? websiteBuilder.registerOnChange(main) : main()

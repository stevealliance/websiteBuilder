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

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// TODO Button to restore template default values.
// region imports
import {$ as binding} from 'clientnode'
import type {DomNode, PlainObject} from 'clientnode'
import ejs from 'ejs'
import JSONEditor from 'exports?JSONEditor!json-editor'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import tinymce from 'tinymce'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/help'
import 'tinymce/plugins/hr'
import 'tinymce/plugins/image'
import 'tinymce/plugins/imagetools'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/media'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/noneditable'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/paste'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/print'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/spellchecker'
import 'tinymce/plugins/table'
import 'tinymce/plugins/textcolor'
import 'tinymce/plugins/toc'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/wordcount'
import 'tinymce/themes/modern/theme'
require.context(
    'file?name=editorAssets.compiled/[path][name].[ext]&' +
        'context=node_modules/tinymce!tinymce/skins',
    true,
    /.*/)
import './index.css'
// endregion
export const $:any = binding
// region plugins/classes
/**
 * @property static:attributeNames - Attribute names to take into account.
 * @property static:escapedMarkupSymbolMapping - Symbol sequence mapping to
 * convert escaped markup.
 * @property static:schema - Schema to specify scope.
 * @property static:scope -  Initial scope values.
 *
 * @property currentMode - Current editing mode.
 * @property domNodes - Reference to all needed control dom nodes.
 * @property domNode - Determined entry dom node.
 * @property inPlaceEditorInstances - Mapping from scope name to its mapped
 * list of dom nodes and in place editor instances.
 * @property jsonEditor - JSON editor instance.
 * @property onChangeListener - A list of callbacks to call on parameter
 * changes.
 * @property template - Determined template to render parameter into.
 */
export default class WebsiteBuilder extends $.Tools.class {
    // region properties
    static attributeNames:Array<string> = [
        'rawEditable', 'rawInitializedEditable',
        'simpleEditable', 'simpleInitializedEditable',
        'editable', 'initializedEditable',
        'advancedEditable', 'advancedInitializedEditable'
    ]
    static escapedMarkupSymbolMapping:{[key:string]:string} = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': `'`
    }
    static schema:?PlainObject
    static scope:?PlainObject

    currentMode:string = 'hybrid'
    domNodes:{[key:string]:DomNode} = {}
    domNode:DomNode
    inPlaceEditorInstances:{[key:string]:Array<Array<Object>>}
    initialized:boolean = false
    initialScope:PlainObject = {}
    scope:PlainObject = {}
    jsonEditor:JSONEditor
    onChangeListener:Array<Function> = []
    template:string = ''
    scope:PlainObject = {}
    // endregion
    // region static methods
    /**
     * Converts given escaped markup string into its plain representation.
     * @param text - Input to convert.
     * @returns Converted input.
     */
    static unescapeHTML(text:string):string {
        return text.replace(new RegExp(Object.keys(
            WebsiteBuilder.escapedMarkupSymbolMapping
        ).join('|'), 'g'), (symbols:string):string =>
            WebsiteBuilder.escapedMarkupSymbolMapping[symbols])
    }
    // endregion
    // region public methods
    /**
     * @param options - Options for customizing editing behavior.
     * @returns A promise which resolves with current instance when
     * bootstrapped.
     */
    initialize(options:Object = {}):Promise<WebsiteBuilder> {
        this._options = {
            className: {
                selectedEditorIndicator: 'selected',
                synchronizedEditorTemplateValue: 'synchronized'
            },
            defaultParameterScope: {},
            entryPointAttributeName: 'root',
            inPlaceEditor: {
                default: {
                    /* eslint-disable camelcase */
                    allow_conditional_comments: false,
                    allow_script_urls: false,
                    cache_suffix: `?version=${UTC_BUILD_TIMESTAMP}`,
                    convert_fonts_to_spans: true,
                    document_base_url: '/',
                    element_format: 'xhtml',
                    entity_encoding: 'raw',
                    fix_list_elements: true,
                    forced_root_block: null,
                    hidden_input: false,
                    inline: true,
                    invalid_elements: 'em',
                    invalid_styles: 'color font-size line-height',
                    keep_styles: false,
                    menubar: false,
                    /* eslint-disable max-len */
                    plugins: 'fullscreen link code hr nonbreaking searchreplace visualblocks',
                    /* eslint-enable max-len */
                    relative_urls: false,
                    remove_script_host: false,
                    remove_trailing_brs: true,
                    schema: 'html5',
                    skin_url: 'editorAssets.compiled/skins/lightgray',
                    /* eslint-disable max-len */
                    toolbar1: 'cut copy paste | undo redo removeformat | styleselect formatselect fontselect fontsizeselect | searchreplace visualblocks fullscreen code',
                    toolbar2: 'alignleft aligncenter alignright alignjustify outdent indent | link hr nonbreaking bullist numlist bold italic underline strikethrough',
                    /* eslint-enable max-len */
                    trim: true
                    /* eslint-enable camelcase */
                },
                raw: {
                    /* eslint-disable max-len */
                    toolbar1: 'cut copy paste | undo redo removeformat | code | fullscreen',
                    /* eslint-enable max-len */
                    toolbar2: false
                },
                simple: {
                    /* eslint-disable max-len */
                    toolbar1: 'cut copy paste | undo redo removeformat | bold italic underline strikethrough subscript superscript | fullscreen',
                    toolbar2: false
                    /* eslint-enable max-len */
                },
                normal: {
                    /* eslint-disable max-len */
                    toolbar1: 'cut copy paste | undo redo removeformat | styleselect formatselect | searchreplace visualblocks fullscreen code'
                    /* eslint-enable max-len */
                },
                advanced: {}
            },
            jsonEditor: {
                /* eslint-disable camelcase */
                disable_array_delete_all_rows: true,
                disable_array_delete_last_row: true,
                disable_collapse: true,
                disable_edit_json: true,
                disable_properties: true,
                format: 'grid'
                /* eslint-enable camelcase */
            },
            neededDomNodeSpecifications: {
                buttons: [
                    {
                        action: (state:string):void => {
                            this.domNodes.jsonEditor.style.display =
                                state === 'active' ? 'block' : 'none'
                        },
                        label: {
                            active: 'Hide options',
                            inactive: 'Show options'
                        },
                        name: 'options',
                        states: ['inactive', 'active']
                    },
                    {
                        action: this.updateMode.bind(this),
                        label: {
                            hybrid: 'Show preview',
                            preview: 'Mark editables',
                            helper: 'Unmark editables'
                        },
                        name: 'preview',
                        states: ['hybrid', 'preview', 'helper']
                    },
                    {
                        action: (state:string):void => {
                            console.log('TODO synchronize all')
                        },
                        label: {
                            dirty: 'Synchronize all',
                            synchronized: ''
                        },
                        name: 'synchronizeAll',
                        states: ['synchronized', 'dirty']
                    },
                    {
                        action: (state:string):void => {
                            console.log('TODO synchronize current')
                        },
                        label: {
                            dirty: 'Synchronize',
                            synchronized: ''
                        },
                        name: 'synchronizeSelected',
                        states: ['synchronized', 'dirty']
                    },
                    {
                        action: (state:string):void => {
                            console.log('TODO clear all')
                        },
                        label: {
                            cleared: '',
                            filled: 'clear'
                        },
                        name: 'clear',
                        states: ['filled', 'cleared']
                    },
                    {
                        action: (state:string):void => {
                            console.log('TODO reset all')
                        },
                        label: {
                            changed: 'reset',
                            unchanged: ''
                        },
                        name: 'reset',
                        states: ['unchanged', 'change']
                    },
                    {
                        action: (state:string):void => {
                            for (
                                const buttonDomNode:DomNode of
                                this.domNodes.toolbar.querySelectorAll(
                                    'button')
                            )
                                if (
                                    buttonDomNode !==
                                    this.domNodes.toggleToolbar
                                )
                                    buttonDomNode.style.display =
                                        state === 'show' ? 'none' : 'initial'
                        },
                        label: {
                            hide: 'Show toolbar',
                            show: 'Hide toolbar'
                        },
                        name: 'toggleToolbar',
                        states: ['hide', 'show']
                    }
                ],
                divs: [
                    {
                        name: 'jsonEditor',
                        style: {
                            backgroundColor: 'white',
                            display: 'none',
                            position: 'absolute',
                            letf: 0,
                            top: 0,
                            width: '100%',
                            zIndex: 9 ** 9
                        }
                    },
                    {
                        name: 'toolbar',
                        style: {
                            backgroundColor: 'white',
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            zIndex: 9 ** 9 + 1
                        }
                    }
                ]
            },
            retrieveContent: {},
            schema: null,
            schemaName: 'schema',
            scope: null,
            scopeName: 'scope',
            waitForDocumentReady: true,
        }
        super.initialize(options)
        if (!this._options.schema)
            this._options.schema = this.constructor.schema
        if (!this._options.schema)
            this._options.schema = $.global[this._options.schemaName] || {}
        if (!this._options.scope)
            this._options.scope = this.constructor.scope
        if (!this._options.scope)
            this._options.scope = $.global[this._options.scopeName] || {}
        this.scope = this._options.scope
        return new Promise((resolve:Function):void => {
            if (this._options.waitForDocumentReady)
                $.global.document.addEventListener(
                    'DOMContentLoaded', ():void => resolve(this.bootstrap()))
            else
                resolve(this.bootstrap())
        })
    }
    /**
     * Initializes website editor.
     * @returns This instance.
     */
    bootstrap():WebsiteBuilder {
        // region determine root element
        this.domNode = $.global.document.querySelector(
            `[${this._options.entryPointAttributeName}]`)
        if (!this.domNode) {
            this.domNode = $.global.document.createElement('div')
            this.domNode.setAttribute(
                this._options.entryPointAttributeName, '')
            this.domNode.innerHTML = $.global.document.body.innerHTML
            $.global.document.body.innerHTML = ''
            $.global.document.body.appendChild(this.domNode)
        }
        this.template = this.domNode.innerHTML
        // endregion
        // region create toolbar
        for (
            const div:PlainObject of
            this._options.neededDomNodeSpecifications.divs
        ) {
            const domNode:DomNode = $.global.document.createElement('div')
            for (const key:string in div.style)
                if (div.style.hasOwnProperty(key))
                    domNode.style[key] = div.style[key]
            this.domNodes[div.name] = domNode
            $.global.document.body.appendChild(domNode)
        }
        for (
            const button:PlainObject of
            this._options.neededDomNodeSpecifications.buttons
        ) {
            button.state = button.states[0]
            const domNode:DomNode = $.global.document.createElement('button')
            domNode.addEventListener('click', ():void => {
                button.state = button.states[
                    (button.states.indexOf(button.state) + 1) %
                    button.states.length
                ]
                domNode.textContent = button.label[button.state]
                button.action(button.state)
            })
            domNode.textContent = button.label[button.state]
            this.domNodes[button.name] = domNode
            this.domNodes.toolbar.appendChild(domNode)
        }
        // endregion
        // region initialize editor instances
        this.jsonEditor = new JSONEditor(
            this.domNodes.jsonEditor, this.constructor.extendObject(
                this._options.jsonEditor, {schema: this._options.schema}))
        this.jsonEditor.setValue(this.scope.parameter)
        this.jsonEditor.on('change', ():void => {
            this.initialized = true
            const errors = this.jsonEditor.validate()
            if (errors.length)
                $.global.alert(errors[0])
            else {
                this.constructor.extendObject(
                    true, this.scope.parameter,
                    this.jsonEditor.getValue())
                // Initializes in place editors.
                this.updateMode()
            }
        })
        // endregion
        return this
    }
    /**
     * Binds given scope name and dom node to an in place editor instance on
     * click.
     * @param attributeName - Attribute name indicating editability.
     * @param name - Scope name to bind to.
     * @param domNode - Dom node to bind to.
     * @returns Nothing.
     */
    initializeDomNode(
        attributeName:string, name:string, domNode:DomNode
    ):void {
        if (this.currentMode === 'preview')
            this.renderDomNode(
                attributeName.toLowerCase().includes('initialized'), name,
                domNode)
        else
            this.initializeInPlaceEditor(attributeName, name, domNode)
    }
    /**
     * Initializes all in place editors.
     * @returns Nothing.
     */
    initializeDomNodes():void {
        this.inPlaceEditorInstances = {}
        for (const attributeName:string of WebsiteBuilder.attributeNames)
            for (const domNode:DomNode of this.domNode.querySelectorAll(
                `[${attributeName}]`
            )) {
                const name:string = domNode.getAttribute(attributeName)
                if (!name)
                    continue
                this.initializeDomNode(attributeName, name, domNode)
            }
    }
    /**
     * Binds given scope name and dom node to an in place editor instance on
     * click.
     * @param attributeName - Attribute name to determine editor type.
     * considered or attribute name to determine here.
     * @param name - Scope name to bind to.
     * @param domNode - Dom node to bind to.
     * @returns Nothing.
     */
    initializeInPlaceEditor(
        attributeName:boolean, name:string, domNode:DomNode
    ):void {
        const tuple:Array<Object> = [domNode]
        this.registerInPlaceEditor(name, tuple)
        if (!attributeName.toLowerCase().includes('initialized'))
            domNode.innerHTML = ''
        let type:string = 'normal'
        if (attributeName.toLowerCase().includes('advanced'))
            type = 'advanced'
        else if (attributeName.toLowerCase().includes('simple'))
            type = 'simple'
        else if (attributeName.toLowerCase().includes('raw'))
            type = 'raw'
        domNode.addEventListener('click', ():void =>
            tinymce.init(this.constructor.extendObject(
                true, {}, this._options.inPlaceEditor.default,
                this._options.inPlaceEditor[type], {
                    setup: (instance:Object):void => {
                        tuple.push(instance)
                        instance.on('init', ():void => {
                            instance.focus()
                            this._inPlaceEditorBackgroundColorFix()
                        })
                        instance.on('focus', ():void => {
                            const className:string = this._options.className
                                .selectedEditorIndicator
                            const lastSelectedDomNode:DomNode =
                                this.domNode.querySelector(`.${className}`)
                            if (lastSelectedDomNode)
                                lastSelectedDomNode.classList.remove(className)
                            domNode.classList.add(className)
                        })
                        instance.on('blur', domNode.blur.bind(domNode))
                        // Update model on changes
                        instance.on('ExecCommand', ():void => this.updateModel(
                            name, instance))
                        for (const eventName:string of [
                            'change', 'ObjectResized'
                        ])
                            instance.on(eventName, ():void => {
                                instance.save()
                                this.updateModel(name, instance)
                            })
                    },
                    target: domNode
                })))
        this.updateModel(name, domNode, true)
    }
    /**
     * Provides current data via post message to parent context.
     * @param parameterHasChanged - Indicates whether in place content has been
     * updated or template parameter.
     * @returns Nothing.
     */
    populateData(parameterHasChanged:boolean = true):void {
        for (const callback:Function of this.onChangeListener)
            callback(
                parameterHasChanged, this.currentMode, this.options,
                this.domNode)
        console.log('TODO Send data: ', this.scope)
    }
    /**
     * Registers given in place editor to synchronize scope values with.
     * @param name - Scope name given editor is bound to.
     * @param tuple - Of dom node and in-place editor instance.
     * @returns Nothing.
     */
    registerInPlaceEditor(name, tuple:Array<Object>):void {
        if (this.inPlaceEditorInstances.hasOwnProperty(name))
            this.inPlaceEditorInstances[name].push(tuple)
        else
            this.inPlaceEditorInstances[name] = [tuple]
    }
    /**
     * Registers a callback to be triggered after a parameter change has been
     * performed.
     * @param callback - Function to trigger in change.
     * @returns An unregister function.
     */
    registerOnChange(callback:Function):void {
        this.onChangeListener.push(callback)
        if (this.initialized)
            callback(true, this.currentMode, this.options, this.domNode)
        return ():void => {
            const index:number = this.onChangeListener.indexOf(callback)
            if (index !== -1)
                this.onChangeListener.splice(index, 1)
        }
    }
    /**
     * Renders given content again current scope.
     * @param content - String to render.
     * @returns Rendered string.
     */
    render(content:string):string {
        if (content) {
            const validNames:Array<string> = Object.keys(this.scope).filter((
                name:string
            ):boolean => {
                try {
                    new Function(`var ${name}`)()
                } catch (error) {
                    return false
                }
                return true
            })
            // IgnoreTypeCheck
            return new Function(
                'scope', ...validNames, `return \`${content}\``
            )(this.scope, ...validNames.map((name:string):any =>
                this.scope[name]))
        }
        return ''
    }
    /**
     * Renders current scope value for given name into given dom node.
     * @param useContent - Indicates whether current content should be loaded.
     * @param name - Scope name to retrieve value from.
     * @param domNode - Node to render.
     * @returns Nothing.
     */
    renderDomNode(useContent:boolean, name:string, domNode:DomNode):void {
        let content = ''
        if (this.scope.hasOwnProperty(name))
            content = this.scope[name]
        else if (useContent)
            content = domNode.innerHTML.trim()
        domNode.innerHTML = this.render(content)
    }
    /**
     * Renders currently defined template parameter into the entry dom node.
     * @returns Nothing.
     */
    renderParameter():void {
        return this.domNode.innerHTML = ejs.render(
            WebsiteBuilder.unescapeHTML(this.template),
            this.constructor.extendObject(
                true, {Tools: this.constructor},
                this._options.defaultParameterScope, this.scope.parameter)
        ).trim()
    }
    /**
     * Transforms content before exporting from an in place editor.
     * @param content - String to transform.
     * @returns Transformed given content.
     */
    transformContent(content:string):string {
        return content.trim()
    }
    /**
     * Updates current editor mode into given one or currently set.
     * @param mode - New mode to switch to.
     * @returns Nothing.
     */
    updateMode(mode:?string):void {
        if (mode)
            this.currentMode = mode
        for (const name:string of ['preview', 'hybrid', 'helper'])
            this.domNode.classList.remove(name)
        this.domNode.classList.add(this.currentMode)
        this.renderParameter()
        this.initializeDomNodes()
        this.populateData()
    }
    /**
     * Synchronizes in place editor content with each other.
     * @param name - Scope bounded name to synchronize from given editor
     * instance.
     * @param givenInstance - In pace editor instance to use as data source.
     * @param initialize - Indicated whether its the first update for given
     * instance.
     * @returns Nothing.
     */
    updateModel(
        name:string, givenInstance:Object, initialize:boolean = false
    ):void {
        let content = this.transformContent(
            'getContent' in givenInstance ?
            givenInstance.getContent() :
            givenInstance.innerHTML)
        if (initialize) {
            this.initialScope[name] = content
            if (name in this.scope)
                content = this.scope[name]
        }
        let inSyncWithTemplate:boolean = false
        if (this.constructor.isEquivalentDOM(
            this.initialScope[name], content
        )) {
            if (name in this.scope)
                delete this.scope[name]
            inSyncWithTemplate = true
        } else
            this.scope[name] = content
        for (
            const instance:Array<Object> of this.inPlaceEditorInstances[name]
        ) {
            /*
                NOTE: An instance tuple consists of a dom node and optionally
                a running editor instance as second array value. So update
                editor instance or dom node directly as fallback.
            */
            if (instance.length === 2) {
                if (
                    instance[1].getDoc() &&
                    instance[1].getContent() !== content
                )
                    instance[1].setContent(content)
            } else if (instance[0].innerHTML !== content)
                instance[0].innerHTML = content
            instance[0].setAttribute('title', name)
            if (inSyncWithTemplate && instance.includes(givenInstance))
                instance[0].classList.add(
                    this._options.className.synchronizedEditorTemplateValue)
            else
                instance[0].classList.remove(
                    this._options.className.synchronizedEditorTemplateValue)
        }
        this.populateData(false)
    }
    // endregion
    // region protected methods
    /**
     * Tinymce uses color of target node for inline editing. For font color
     * this doesn't make any sense if corresponding background color will be
     * omitted and text color is the sames as background color so resetting it
     * here to the same color as the first found button.
     * @returns Nothing.
     */
    _inPlaceEditorBackgroundColorFix():void {
        for (const name:string of ['click', 'mouseover'])
            $.global.document.body.addEventListener(name, (
                event:Object
            ):void => {
                if (event.target && (
                    event.target.classList.contains('mce-tinymce-inline') ||
                    event.target.classList.contains('mce-container')
                )) {
                    const inlineEditorDomNode:?DomNode =
                        this.domNode.querySelector('.mce-tinymce-inline')
                    const buttonDomNodes:Array<DomNode> =
                        inlineEditorDomNode ?
                            inlineEditorDomNode.querySelectorAll('button') :
                            []
                    const editorDomNode:?DomNode = this.domNode.querySelector(
                        '.mce-container')
                    const inlineButtonDomNodes:Array<DomNode> =
                        editorDomNode ?
                            editorDomNode.querySelectorAll(
                                'span[style]:not([contenteditable])') :
                            []
                    if (buttonDomNodes.length && inlineButtonDomNodes.length)
                        for (const domNode:DomNode of inlineButtonDomNodes)
                            domNode.style.color = buttonDomNodes[0].style.color
                }
            })
    }
    // endregion
}
// endregion
$.WebsiteBuilder = (...parameter:Array<any>):Promise<DomNode> =>
    $.Tools().controller(WebsiteBuilder, parameter)
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

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
import 'tinymce/themes/modern/theme'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/link'
import 'tinymce/plugins/image'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/print'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/media'
import 'tinymce/plugins/table'
import 'tinymce/plugins/contextmenu'
import 'tinymce/plugins/paste'
require.context(
  'file?name=editorAssets.compiled/[path][name].[ext]&context=node_modules/tinymce!tinymce/skins',
  true,
  /.*/
)

import './index.css'
// endregion
export const $:any = binding
// region plugins/classes
/**
 * @property static:escapedMarkupSymbolMapping - Symbol sequence mapping to
 * convert escaped markup.
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
    static escapedMarkupSymbolMapping:{[key:string]:string} = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': `'`
    }
    static attributeNames:Array<string> = [
        'editable', 'initializedEditable',
        'simpleEditable', 'simpleInitializedEditable',
        'advancedEditable', 'advancedInitializedEditable'
    ]

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
            entryPointAttributeName: 'root',
            inPlaceEditor: {
                inline: true,
                menubar: false,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table contextmenu paste code'
                ],
                skin_url: 'editorAssets.compiled/skins/lightgray',
                toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image'
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
            selectedEditorIndicatorClassName: 'selected',
            waitForDocumentReady: true,
        }
        super.initialize(options)
        if (!this._options.schema)
            this._options.schema = $.global[this._options.schemaName] || {}
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
     * Initializes all in place editors.
     * @returns Nothing.
     */
    initializeInPlaceEditor():void {
        this.inPlaceEditorInstances = {}
        for (const attributeName:string of WebsiteBuilder.attributeNames)
            for (const domNode:DomNode of this.domNode.querySelectorAll(
                `[${attributeName}]`
            )) {
                const name:string = domNode.getAttribute(attributeName)
                if (!name)
                    continue
                const tuple:Array<Object> = [domNode]
                this.registerInPlaceEditor(name, tuple)
                if (defaultType === '')
                    domNode.innerHTML = ''
                domNode.addEventListener('click', ():void =>
                    tinymce.init(this.constructor.extendObject(
                        {}, this._options.inPlaceEditor, {
                            setup: (instance:Object):void => {
                                tuple.push(instance)
                                instance.on('init', ():void => {
                                    instance.focus()
                                    this._inPlaceEditorBackgroundColorFix()
                                })
                                instance.on('focus', ():void => {
                                    const className:string = this._options
                                        .selectedEditorIndicatorClassName
                                    const lastSelectedDomNode:DomNode =
                                        this.domNode.querySelector(
                                            `.${className}`)
                                    if (lastSelectedDomNode)
                                        lastSelectedDomNode.classList.remove(
                                            className)
                                    domNode.classList.add(className)
                                })
                                instance.on('blur', domNode.blur.bind(domNode))
                                // Update model on changes
                                instance.on('ExecCommand', ():void =>
                                    this.updateModel(name, instance))
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
    }
    /**
     * Provides current data via post message to parent context.
     * @param parameter - Indicates whether in place content has been updated
     * or template parameter.
     * @returns Nothing.
     */
    populateData(parameter:boolean = true):void {
        for (const callback:Function of this.onChangeListener)
            callback(parameter, this.options, this.currentMode, this.domNode)
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
            callback(true, this.options, this.currentMode, this.domNode)
        return ():void => {
            const index:number = this.onChangeListener.indexOf(callback)
            if (index !== -1)
                this.onChangeListener.splice(index, 1)
        }
    }
    /**
     * Renders current scope values into the entry dom nodes content.
     * @returns Nothing.
     */
    render():void {
        for (const attributeName:string of WebsiteBuilder.attributeNames)
            for (const domNode:DomNode of this.domNode.querySelectorAll(
                `[${attributeName}]`
            )) {
                const name:string = domNode.getAttribute(attributeName)
                if (!name)
                    continue
                if (defaultType === '')
                    domNode.innerHTML = ''
                this.renderDomNode(name, domNode)
            }
    }
    /**
     * Renders current scope value for given name into given dom node.
     * @param name - Scope name to retrieve value from.
     * @param domNode - Node to render.
     * @returns Nothing.
     */
    renderDomNode(name:string, domNode:DomNode):void {
        const content:string =
            this.scope.hasOwnProperty(name) ? this.scope[name] :
            domNode.innerHTML
        // IgnoreTypeCheck
        domNode.innerHTML =
            content ? new Function(
                ...Object.keys(this.scope), `return \`${content}\``
            )(...Object.values(this.scope)) :
            ''
    }
    /**
     * Renders currently defined template parameter into the entry dom node.
     * @returns Nothing.
     */
    renderParameter():void {
        return this.domNode.innerHTML = ejs.render(
            WebsiteBuilder.unescapeHTML(this.template),
            this.scope.parameter)
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
        if (this.currentMode === 'preview')
            this.render()
        else
            this.initializeInPlaceEditor()
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
        if (this.initialScope[name] === content) {
            if (name in this.scope)
                delete this.scope[name]
        } else
            this.scope[name] = content
        for (const instance:Array<Object> of this.inPlaceEditorInstances[name])
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
$.WebsiteBuilder = function(...parameter:Array<any>):Promise<DomNode> {
    return $.Tools().controller(WebsiteBuilder, parameter)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

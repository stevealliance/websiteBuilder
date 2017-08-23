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
import JSONEditor from 'jsoneditor'
// NOTE: Only needed for debugging this file.
try {
    module.require('source-map-support/register')
} catch (error) {}
import tinymce from 'tinymce'
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
    static _name:string = 'WebsiteBuilder'

    currentMode:string = 'hybrid'
    domNodes:{[key:string]:DomNode}
    domNode:DomNode
    inPlaceEditorInstances:{[key:string]:Array<Array<Object>>}
    jsonEditor:JSONEditor
    template:string = ''
    // endregion
    // region public methods
    /**
     * @param options - Options for customizing editing behavior.
     * @returns Determined entry dom node.
     */
    initialize(options:Object = {}):DomNode {
        this._options = {
            inPlaceEditor: {
                inline: true,
                menubar: false,
                plugins: [
                    'advlist autolink lists link image charmap print preview anchor',
                    'searchreplace visualblocks code fullscreen',
                    'insertdatetime media table contextmenu paste code'
                ],
                toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image'
            },
            jsonEditor: {
                disable_array_delete_all_rows: true,
                disable_array_delete_last_row: true,
                disable_collapse: true,
                disable_edit_json: true,
                disable_properties: true,
                format: 'grid'
            },
            neededDomNodeSpecifications: {
                buttons: [
                    {
                        action: (state) => {
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
            schema: $.global.schema || {},
            scope: $.global.scope || {},
            selectedEditorIndicatorClassName: 'selected'
        }
        super.initialize(options)
        this.extendObject(
            true, JSONEditor.defaults.options, this._options.jsonEditor)
        $.global.document.addEventListener('DOMContentLoaded', ():void => {
            this.domNode = $.global.document.querySelector('[root]')
            if (!this.domNode) {
                this.domNode = $.global.document.createElement('div')
                this.domNode.innerHTML = $.global.document.body.innerHTML
                $.global.document.body.innerHTML = ''
                $.global.document.body.appendChild(this.domNode)
            }
            this.template = this.domNode.innerHTML
            this.updateMode()
            for (
                const div:PlainObject of
                this._options.neededDomNodeSpecification.divs
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
                this._options.neededDomNodeSpecification.buttons
            ) {
                button.state = button.states[0]
                const domNode:DomNode = $.global.document.createElement(
                    'button')
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
            this.jsonEditor = new JSONEditor(
                this.domNodes.jsonEditor, {schema: this._options.schema})
            this.jsonEditor.setValue(this._options.scope.parameter)
            this.jsonEditor.on('change', () => {
                const errors = this.jsonEditor.validate()
                if (errors.length)
                    $.global.alert(errors[0])
                else {
                    this.extendObject(
                        true, this._options.scope.parameter,
                        this.jsonEditor.getValue())
                    // TODO send data to parent context via post message.
                    this.updateMode()
                }
            })
        })
        return this.domNode
    }
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
    /**
     * Transforms content before exporting from an in place editor.
     * @param content - String to transform.
     * @returns Transformed given content.
     */
    transformContent(content:string):string {
        return content
    }
    /**
     * Synchronizes in place editor content with each other.
     * @param name - Scope bounded name to synchronize from given editor
     * instance.
     * @param givenInstance - In pace editor instance to use as data source.
     * @returns Nothing.
     */
    updateModel(name:string, givenInstance:Object):void {
        const content:string = this.transformContent(
            givenInstance.getContent(this._options.retrieveContent))
        this._options.scope[name] = content
        for (const instance:Array<Object> of this.inPlaceEditorInstances[name])
            /*
                NOTE: An instance tuple consists of a dom node and optionally
                a running editor instance as second array value. So update
                editor instance or dom node directly as fallback.
            */
            if (instance.length === 2) {
                if (instance[1] !== givenInstance && instance[1].getDoc())
                    instance[1].setContent(content)
            } else
                instance[0].innerHTML = content
    }
    /**
     * Renders currently defined template parameter into the entry dom node.
     * @returns Nothing.
     */
    renderParameter():void {
        return this.domNode.innerHTML = ejs.render(
            WebsiteBuilder.unescapeHTML(this.template),
            this._options.scope.parameter)
    }
    /**
     * Renders current scope values into the entry dom nodes content.
     * @returns Nothing.
     */
    render():void {
        for (const type:string of ['', '-simple', '-advanced'])
            for (const defaultType:string of ['', '-content']) {
                const attributeName:string = `bind${type}${defaultType}`
                for (
                    const domNode:DomNode of
                    this.domNode.querySelectorAll(`[${attributeName}]`)
                ) {
                    const name:string = domNode.getAttribute(attributeName)
                    if (!name)
                        continue
                    domNode.innerHTML = this._options.scope.hasOwnProperty(
                        name
                    ) ? new Function(
                        // IgnoreTypeCheck
                        ...Object.keys(this._options.scope),
                        `return \`${this._options.scope[name]}\``
                    )(...Object.values(this._options.scope)) : ''
                }
            }
    }
    /**
     * Initializes all in place editors.
     * @returns Nothing.
     */
    initializeInPlaceEditor():void {
        this.inPlaceEditorInstances = {}
        for (const type:string of ['', '-simple', '-advanced'])
            for (const defaultType:string of ['', '-content']) {
                const attributeName:string = `bind${type}${defaultType}`
                for (
                    const domNode:DomNode of
                    this.domNode.querySelectorAll(`[${attributeName}]`)
                ) {
                    const name:string = domNode.getAttribute(attributeName)
                    if (!name)
                        continue
                    const tuple:Array<Object> = [domNode]
                    if (this.inPlaceEditorInstances.hasOwnProperty(name))
                        this.inPlaceEditorInstances[name].push(tuple)
                    else
                        this.inPlaceEditorInstances[name] = [tuple]
                    if (this._options.scope.hasOwnProperty(name))
                        domNode.innerHTML = this._options.scope[name]
                    else if (defaultType === '')
                        domNode.innerHTML = ''
                    else
                        this._options.scope[name] = this.transformContent(domNode.innerHTML)
                    domNode.addEventListener('click', ():void =>
                        tinymce.init(this.extendObject(
                            {}, this._options.inPlaceEditor, {
                                setup: (instance:Object):void => {
                                    tuple.push(instance)
                                    instance.on('init', ():void => {
                                        instance.focus()
                                        /*
                                            NOTE: Tinymce uses color of target
                                            node for inline editing. For font
                                            color this doesn't make any sense
                                            if corresponding background color
                                            will be omitted and text color is
                                            the sames as background color so
                                            resetting it here to the same color
                                            as the first found button.
                                        */
                                        /* TODO
                                        $.global.document.body.on(
                                            'click mouseover'
                                            '.mce-tinymce-inline, .mce-container', ->
                                                buttons = $window.angular.element(
                                                    '.mce-tinymce-inline'
                                                ).find 'button'
                                                inlineButtons = $window.angular.element(
                                                    '.mce-container'
                                                ).find 'span[style]:not([contenteditable])'
                                                if buttons.length and inlineButtons.length
                                                    $window.angular.element('.mce-container').find(
                                                        'span[style]:not([contenteditable])'
                                                    ).css 'color', buttons.css 'color'
                                        )
                                        */
                                    })
                                    instance.on('focus', ():void => {
                                        const lastSelectedDomNode:DomNode =
                                            this.domNode.querySelector(
                                                `.${this._options.selectedEditorIndicatorClassName}`)
                                        if (lastSelectedDomNode)
                                            lastSelectedDomNode.classList
                                                .remove(this._options.selectedEditorIndicatorClassName)
                                        domNode.classList.add(this._options.selectedEditorIndicatorClassName)
                                    })
                                    instance.on('blur', domNode.blur.bind(
                                        domNode))
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
                }
            }
    }
    /**
     * Updates current editor mode into given one or currently set.
     * @param mode - New mode to switch to-
     * @returns Nothing.
     */
    updateMode(mode:?string):void {
        if (mode)
            this.currentMode = mode
        this.renderParameter()
        if (this.currentMode === 'preview')
            this.render()
        else
            this.initializeInPlaceEditor()
    }
    // endregion
}
// endregion
$.fn.WebsiteBuilder = function(...parameter:Array<any>):any {
    return $.Tools().controller(WebsiteBuilder, parameter, this)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

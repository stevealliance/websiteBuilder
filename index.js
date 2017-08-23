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
 * TODO
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
    entryDomNode:DomNode
    inPlaceEditorInstances:{[key:string]:Array<Object>}
    jsonEditor:JSONEditor
    scope:PlainObject
    template:string = ''
    // endregion
    // region public methods
    /**
     * TODO
     */
    initialize(options:Object = {}):DomNode {
        this._options = {
            content: {},
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
            }
        }
        super.initialize(options)
        this.extendObject(
            true, JSONEditor.defaults.options, this._options.jsonEditor)
        $.global.document.addEventListener('DOMContentLoaded', ():void => {
            this.entryDomNode = $.global.document.querySelector('[root]')
            if (!this.entryDomNode) {
                this.entryDomNode = $.global.document.createElement('div')
                this.entryDomNode.innerHTML = $.global.document.body.innerHTML
                $.global.document.body.innerHTML = ''
                $.global.document.body.appendChild(this.entryDomNode)
            }
            this.template = this.entryDomNode.innerHTML
            this.updateMode()
            for (const div:PlainObject of [
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
            ]) {
                const domNode:DomNode = $.global.document.createElement('div')
                for (const key:string in div.style)
                    if (div.style.hasOwnProperty(key))
                        domNode.style[key] = div.style[key]
                this.domNodes[div.name] = domNode
                $.global.document.body.appendChild(domNode)
            }
            for (const button:PlainObject of [
                {
                    action: (state) => {
                        domNodes.jsonEditor.style.display =
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
                    action: updateMode,
                    label: {
                        hybrid: 'Show preview',
                        preview: 'Mark editables',
                        helper: 'Unmark editables'
                    },
                    name: 'preview',
                    states: ['hybrid', 'preview', 'helper']
                }
            ]) {
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
                this.domNodes.jsonEditor, {schema})
            this.jsonEditor.setValue(scope.parameter)
            this.jsonEditor.on('change', () => {
                const errors = this.jsonEditor.validate()
                if (errors.length)
                    $.global.alert(errors[0])
                else {
                    this.extendObject(
                        true, scope.parameter, this.jsonEditor.getValue())
                    // TODO send data to parent context via post message.
                    this.updateMode()
                }
            })
        })
        return this.entryDomNode
    }
    /**
     * TODO
     */
    static unescapeHTML(text:string):string {
        return text.replace(new RegExp(Object.keys(
            WebsiteBuilder.escapedMarkupSymbolMapping
        ).join('|'), 'g'), (symbols:string):string => mapping[symbols])
    }
    /**
     * TODO
     */
    transformContent(content:string):string {
        return content
    }
    /**
     * TODO
     */
    updateModel(name:string, givenInstance:Object):void {
        const content:string = this.transformContent(
            givenInstance.getContent(this._options.content))
        this.scope[name] = content
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
     * TODO
     */
    renderParameter():void {
        return this.entryDomNode.innerHTML = ejs.render(
            WebsiteBuilder.unescapeHTML(this.template), this.scope.parameter)
    }
    /**
     * TODO
     */
    render():void {
        for (const type:string of ['', '-simple', '-advanced'])
            for (const defaultType:string of ['', '-content']) {
                const attributeName:string = `bind${type}${defaultType}`
                for (
                    const domNode:DomNode of
                    $.global.document.querySelectorAll(`[${attributeName}]`)
                ) {
                    const name:string = domNode.getAttribute(attributeName)
                    if (!name)
                        continue
                    domNode.innerHTML = scope.hasOwnProperty(
                        name
                    ) ? new Function(
                        ...Object.keys(scope), `return \`${scope[name]}\``
                    )(...Object.values(scope)) : ''
                }
            }
    }
    /**
     * TODO
     */
    initializeInPlaceEditor():void {
        this.inPlaceEditorInstances = {}
        for (const type:string of ['', '-simple', '-advanced'])
            for (const defaultType:string of ['', '-content']) {
                const attributeName:string = `bind${type}${defaultType}`
                for (
                    const domNode:DomNode of
                    $.global.document.querySelectorAll(`[${attributeName}]`)
                ) {
                    const name:string = domNode.getAttribute(attributeName)
                    if (!name)
                        continue
                    const tuple:Array<Object> = [domNode]
                    if (this.inPlaceEditorInstances.hasOwnProperty(name))
                        this.inPlaceEditorInstances[name].push(tuple)
                    else
                        this.inPlaceEditorInstances[name] = [tuple]
                    if (scope.hasOwnProperty(name))
                        domNode.innerHTML = scope[name]
                    else if (defaultType === '')
                        domNode.innerHTML = ''
                    else
                        scope[name] = this.transformContent(domNode.innerHTML)
                    domNode.addEventListener('click', ():void =>
                        tinymce.init(this.extendObject(
                            {}, editorOptions, {
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
                                            $.global.document.querySelector(
                                                '.editor-selected')
                                        if (lastSelectedDomNode)
                                            lastSelectedDomNode.classList
                                                .remove('editor-selected')
                                        domNode.classList.add('editor-selected')
                                    })
                                    // Update model on button click
                                    instance.on('ExecCommand', ():void =>
                                        this.updateModel(name, instance))
                                    // Update model on change
                                    instance.on('change', ():void => {
                                        instance.save()
                                        this.updateModel(name, instance)
                                    })
                                    instance.on('blur', domNode.blur.bind(
                                        domNode))
                                    // Update model when an object has been resized (table, image)
                                    instance.on('ObjectResized', ():void => {
                                        instance.save()
                                        this.updateModel(name, instance)
                                    })
                                },
                                target: domNode
                            })))
                }
            }
    }
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
    return $.Tools().controller(Incrementer, parameter, this)
}
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion

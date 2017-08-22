<script src="node_modules/json-editor/dist/jsoneditor.min.js"></script>
<script src="https://npmcdn.com/ejs/ejs.min.js"></script>
<script src="https://cloud.tinymce.com/stable/tinymce.min.js"></script>
<script src="http://torben.website/clientNode/data/distributionBundle/index.compiled.js"></script>
// region options
clientnode.default.extendObject(JSONEditor.defaults.options, {
disable_array_delete_all_rows: true,
disable_array_delete_last_row: true,
disable_collapse: true,
disable_edit_json: true,
disable_properties: true,
format: 'grid'
})
const contentOptions = {}
const editorOptions = {
inline: true,
menubar: false,
plugins: [
    'advlist autolink lists link image charmap print preview anchor',
    'searchreplace visualblocks code fullscreen',
    'insertdatetime media table contextmenu paste code'
],
toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image'
}
// endregion
// region properties
const domNodes = {}
let entryDomNode = null
let instances = {}
const mapping = {
'&amp;': '&',
'&lt;': '<',
'&gt;': '>',
'&quot;': '"',
'&#039;': `'`
}
let currentMode = 'hybrid'
let template = ''
// endregion
// region functions
const unescapeHTML = (text) => text.replace(new RegExp(Object.keys(
mapping
).join('|'), 'g'), (symbols) => mapping[symbols])
const transformContent = (content) => content
const updateModel = (name, givenInstance) => {
const content = transformContent(givenInstance.getContent(contentOptions))
scope[name] = content
for (const instance of instances[name])
    /*
        NOTE: An instance tuple consists of a dom node and optionally
        a running editor instance. So update which is currently available.
    */
    if (instance.length === 2) {
        if (instance[1] !== givenInstance && instance[1].getDoc())
            instance[1].setContent(content)
    } else
        instance[0].innerHTML = content
}
const renderParameter = () => {
entryDomNode.innerHTML = ejs.render(
    unescapeHTML(template), scope.parameter)
}
const render = () => {
for (const type of ['', '-simple', '-advanced'])
    for (const defaultType of ['', '-content']) {
        const attributeName = `bind${type}${defaultType}`
        for (const domNode of document.querySelectorAll(
            `[${attributeName}]`
        )) {
            const name = domNode.getAttribute(attributeName)
            if (!name)
                continue
            domNode.innerHTML = scope.hasOwnProperty(
                name
            ) ? new Function(
                ...Object.keys(scope),
                `return \`${scope[name]}\``
            )(...Object.values(scope)) : ''
        }
    }
}
const initializeInPlaceEditor = () => {
instances = {}
for (const type of ['', '-simple', '-advanced'])
    for (const defaultType of ['', '-content']) {
        const attributeName = `bind${type}${defaultType}`
        for (const domNode of document.querySelectorAll(
            `[${attributeName}]`
        )) {
            const name = domNode.getAttribute(attributeName)
            if (!name)
                continue
            const tuple = [domNode]
            if (instances.hasOwnProperty(name))
                instances[name].push(tuple)
            else
                instances[name] = [tuple]
            if (scope.hasOwnProperty(name))
                domNode.innerHTML = scope[name]
            else if (defaultType === '')
                domNode.innerHTML = ''
            else
                scope[name] = transformContent(domNode.innerHTML)
            domNode.addEventListener('click', () =>
                tinymce.init(clientnode.default.extendObject(
                    {}, editorOptions, {
                        setup: (instance) => {
                            tuple.push(instance)
                            instance.on('init', () => {
                                instance.focus()
                                /*
                                    NOTE: Tinymce uses color of target node for inline
                                    editing. For font color this doesn't make any sense
                                    if corresponding background color will be omitted and text
                                    color is the sames as background color so resetting it
                                    here to the same color as the first found button.
                                */
                                /* TODO
                                $window.angular.element('body').on(
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
                            instance.on('focus', () => {
                                const lastSelectedDomNode = document.querySelector('.editor-selected')
                                if (lastSelectedDomNode)
                                    lastSelectedDomNode.classList.remove('editor-selected')
                                domNode.classList.add('editor-selected')
                            })
                            // Update model on button click
                            instance.on('ExecCommand', () => {
                                updateModel(name, instance)
                            })
                            // Update model on change
                            instance.on('change', () => {
                                instance.save()
                                updateModel(name, instance)
                            })
                            instance.on('blur', () => {
                                domNode.blur()
                            })
                            // Update model when an object has been resized (table, image)
                            instance.on('ObjectResized', () => {
                                instance.save()
                                updateModel(name, instance)
                            })
                        },
                        target: domNode
                    })))
        }
    }
}
const updateMode = (mode) => {
if (mode)
    currentMode = mode
renderParameter()
currentMode === 'preview' ? render() : initializeInPlaceEditor()
}
// endregion
document.addEventListener('DOMContentLoaded', () => {
entryDomNode = document.querySelector('[root]')
if (!entryDomNode) {
    entryDomNode = document.createElement('div')
    entryDomNode.innerHTML = document.body.innerHTML
    document.body.innerHTML = ''
    document.body.appendChild(entryDomNode)
}
template = entryDomNode.innerHTML
updateMode()
for (const div of [
    {
        name: 'editor',
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
    const domNode = document.createElement('div')
    for (const key in div.style)
        if (div.style.hasOwnProperty(key))
            domNode.style[key] = div.style[key]
    domNodes[div.name] = domNode
    document.body.appendChild(domNode)
}
for (const button of [
    {
        action: (state) => {
            domNodes.editor.style.display =
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
    const domNode = document.createElement('button')
    domNode.addEventListener('click', () => {
        button.state = button.states[
            (button.states.indexOf(button.state) + 1) %
            button.states.length
        ]
        domNode.textContent = button.label[button.state]
        button.action(button.state)
    })
    domNode.textContent = button.label[button.state]
    domNodes[button.name] = domNode
    domNodes.toolbar.appendChild(domNode)
}
const editor = new JSONEditor(domNodes.editor, {schema})
editor.setValue(scope.parameter)
editor.on('change', () => {
    const errors = editor.validate()
    if (errors.length)
        alert(errors[0])
    else {
        clientnode.default.extendObject(true, scope.parameter, editor.getValue())
        // TODO send data to parent context via post message.
        updateMode()
    }
})
})

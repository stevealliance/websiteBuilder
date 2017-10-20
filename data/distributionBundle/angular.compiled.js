'use strict';
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("clientnode"), require("angular-generic"), require("@angular/core"), require("@angular/router"));
	else if(typeof define === 'function' && define.amd)
		define("angular", ["clientnode", "angular-generic", "@angular/core", "@angular/router"], factory);
	else if(typeof exports === 'object')
		exports["angular"] = factory(require("clientnode"), require("angular-generic"), require("@angular/core"), require("@angular/router"));
	else
		root["angular"] = factory(root["clientnode"], root["angular-generic"], root["@angular/core"], root["@angular/router"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_60__, __WEBPACK_EXTERNAL_MODULE_61__, __WEBPACK_EXTERNAL_MODULE_62__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 58);
/******/ })
/************************************************************************/
/******/ ({

/***/ 2:
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),

/***/ 3:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),

/***/ 58:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(59);


/***/ }),

/***/ 59:
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(module) {// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module websiteBuilder *//* !
    region header
    [Project page](http://torben.website/websiteBuilder)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by torben sickert stand under a creative commons
    naming 3.0 unported license.
    see http://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/// region imports
Object.defineProperty(exports,'__esModule',{value:true});exports.default=exports.EditableDirective=undefined;var _createClass=function(){function defineProperties(target,props){for(var i=0;i<props.length;i++){var descriptor=props[i];descriptor.enumerable=descriptor.enumerable||false;descriptor.configurable=true;if('value'in descriptor)descriptor.writable=true;Object.defineProperty(target,descriptor.key,descriptor)}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor}}();var _dec,_class,_dec2,_class3;var _angularGeneric=__webpack_require__(60);var _clientnode=__webpack_require__(3);var _core=__webpack_require__(61);var _router=__webpack_require__(62);function _toConsumableArray(arr){if(Array.isArray(arr)){for(var i=0,arr2=Array(arr.length);i<arr.length;i++){arr2[i]=arr[i]}return arr2}else{return Array.from(arr)}}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function')}}// NOTE: Only needed for debugging this file.
try{module.require('source-map-support/register')}catch(error){}// endregion
// region components
var attributeNames=['rawEditable','rawInitializedEditable','simpleEditable','simpleInitializedEditable','editable','initializedEditable','advancedEditable','advancedInitializedEditable'];var selector='';var _iteratorNormalCompletion=true;var _didIteratorError=false;var _iteratorError=undefined;try{for(var _iterator=attributeNames[Symbol.iterator](),_step;!(_iteratorNormalCompletion=(_step=_iterator.next()).done);_iteratorNormalCompletion=true){var name=_step.value;selector+=',['+name+']'}}catch(err){_didIteratorError=true;_iteratorError=err}finally{try{if(!_iteratorNormalCompletion&&_iterator.return){_iterator.return()}}finally{if(_didIteratorError){throw _iteratorError}}}var EditableDirective=exports.EditableDirective=(_dec=(0,_core.Directive)({inputs:attributeNames,selector:selector.substring(1)}),_dec(_class=function(){function EditableDirective(activatedRoute,elementReference,initialData,injector,renderer){_classCallCheck(this,EditableDirective);this.activatedRoute=this.activatedRoute;this.contextPath='';this.elementReference=this.elementReference;this.initialData=this.initialData;this.injector=this.injector;this.renderer=this.renderer;this.scope={};this.activatedRoute=activatedRoute;this.elementReference=elementReference;this.initialData=initialData;this.injector=injector;this.renderer=renderer}_createClass(EditableDirective,[{key:'determinePath',value:function determinePath(){var view=this.injector.view;var component=view.component;this.contextPath+=component.constructor.name;while(true){view=view.parent;var index=view.nodes.filter(function(node){return node.instance}).map(function(node){return node.instance}).indexOf(component);if('parent'in view&&view.parent&&'component'in view.parent){component=view.component;this.contextPath=component.constructor.name+'/'+index+'-'+this.contextPath}else break}if(this.activatedRoute){var paths=this.activatedRoute.snapshot.pathFromRoot.map(function(routeSnapshot){return routeSnapshot.url.map(function(urlSegment){return urlSegment.path}).join('/')}).filter(function(url){return Boolean(url)});if(paths.length)this.contextPath=paths.join('/')+':'+this.contextPath}}},{key:'ngOnInit',value:function ngOnInit(){this.determinePath();if('websiteBuilder'in _clientnode.globalContext)this.scope=_clientnode.globalContext.websiteBuilder.scope;else if(this.initialData&&this.initialData.scope)this.scope=this.initialData.scope;else if('scope'in _clientnode.globalContext)this.scope=_clientnode.globalContext.scope}},{key:'ngAfterViewInit',value:function ngAfterViewInit(){var _this=this;var _iteratorNormalCompletion2=true;var _didIteratorError2=false;var _iteratorError2=undefined;try{for(var _iterator2=attributeNames[Symbol.iterator](),_step2;!(_iteratorNormalCompletion2=(_step2=_iterator2.next()).done);_iteratorNormalCompletion2=true){var _name=_step2.value;if(this.hasOwnProperty(_name)&&typeof this[_name]==='string'&&this[_name]){this.contextPath+=':'+this[_name];if('websiteBuilder'in _clientnode.globalContext&&_clientnode.globalContext.websiteBuilder.currentMode!=='preview')// NOTE: This will break in none browser environments.
_clientnode.globalContext.websiteBuilder.initializeInPlaceEditor(_name,this.contextPath,this.elementReference.nativeElement);else{var content='';if(this.contextPath in this.scope)content=this.scope[this.contextPath];else if(_name.toLowerCase().includes('initialized')&&this.elementReference.nativeElement&&'innerHTML'in this.elementReference.nativeElement)// NOTE: This could break in none browser environments.
content=this.elementReference.nativeElement.innerHTML.trim();if(content){var validNames=Object.keys(this.scope).filter(function(name){try{new Function('var '+name)()}catch(error){return false}return true});// IgnoreTypeCheck
content=new(Function.prototype.bind.apply(Function,[null].concat(['scope'],_toConsumableArray(validNames),['return `'+content+'`'])))().apply(undefined,[this.scope].concat(_toConsumableArray(validNames.map(function(name){return _this.scope[name]}))))}else content='';this.renderer.setProperty(this.elementReference.nativeElement,'innerHTML',content)}break}}}catch(err){_didIteratorError2=true;_iteratorError2=err}finally{try{if(!_iteratorNormalCompletion2&&_iterator2.return){_iterator2.return()}}finally{if(_didIteratorError2){throw _iteratorError2}}}}}]);return EditableDirective}())||_class);// endregion
// region module
// IgnoreTypeCheck
(0,_core.Optional)()(EditableDirective,null,0);(0,_core.Optional)()(EditableDirective,null,2);Reflect.defineMetadata('design:paramtypes',[_router.ActivatedRoute,_core.ElementRef,_angularGeneric.InitialDataService,_core.Injector,_core.Renderer2],EditableDirective);/**
 * Represents the importable angular module.
 */var Module=(_dec2=(0,_core.NgModule)({declarations:(0,_angularGeneric.determineDeclarations)(module),exports:(0,_angularGeneric.determineExports)(module),providers:(0,_angularGeneric.determineProviders)(module)}),_dec2(_class3=function Module(){_classCallCheck(this,Module)})||_class3);// endregion
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
exports.default=Module;
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)(module)))

/***/ }),

/***/ 60:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_60__;

/***/ }),

/***/ 61:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_61__;

/***/ }),

/***/ 62:
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_62__;

/***/ })

/******/ });
});
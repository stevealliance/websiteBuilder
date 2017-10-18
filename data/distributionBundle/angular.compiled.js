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
exports.__esModule=true;exports.default=exports.EditableDirective=undefined;var _dec,_class,_dec2,_class3;var _angularGeneric=__webpack_require__(60);var _clientnode=__webpack_require__(3);var _core=__webpack_require__(61);var _router=__webpack_require__(62);// NOTE: Only needed for debugging this file.
try{module.require('source-map-support/register')}catch(error){}// endregion
// region components
const attributeNames=['rawEditable','rawInitializedEditable','simpleEditable','simpleInitializedEditable','editable','initializedEditable','advancedEditable','advancedInitializedEditable'];let selector='';for(const name of attributeNames)selector+=`,[${name}]`;let EditableDirective=exports.EditableDirective=(_dec=(0,_core.Directive)({inputs:attributeNames,selector:selector.substring(1)}),_dec(_class=class EditableDirective{constructor(activatedRoute,elementReference,initialData,injector,renderer){this.activatedRoute=this.activatedRoute;this.contextPath='';this.elementReference=this.elementReference;this.initialData=this.initialData;this.injector=this.injector;this.renderer=this.renderer;this.scope={};this.activatedRoute=activatedRoute;this.elementReference=elementReference;this.initialData=initialData;this.injector=injector;this.renderer=renderer}determinePath(){let view=this.injector.view;let component=view.component;this.contextPath+=component.constructor.name;while(true){view=view.parent;const index=view.nodes.filter(function(node){return node.instance}).map(function(node){return node.instance}).indexOf(component);if('parent'in view&&view.parent&&'component'in view.parent){component=view.component;this.contextPath=`${component.constructor.name}/${index}-`+this.contextPath}else break}if(this.activatedRoute){const paths=this.activatedRoute.snapshot.pathFromRoot.map(function(routeSnapshot){return routeSnapshot.url.map(function(urlSegment){return urlSegment.path}).join('/')}).filter(function(url){return Boolean(url)});if(paths.length)this.contextPath=`${paths.join('/')}:${this.contextPath}`}}ngOnInit(){this.determinePath();if('websiteBuilder'in _clientnode.globalContext)this.scope=_clientnode.globalContext.websiteBuilder.scope;else if(this.initialData&&this.initialData.scope)this.scope=this.initialData.scope;else if('scope'in _clientnode.globalContext)this.scope=_clientnode.globalContext.scope}ngAfterViewInit(){var _this=this;for(const name of attributeNames)if(this.hasOwnProperty(name)&&typeof this[name]==='string'&&this[name]){this.contextPath+=`:${this[name]}`;if('websiteBuilder'in _clientnode.globalContext&&_clientnode.globalContext.websiteBuilder.currentMode!=='preview')// NOTE: This will break in none browser environments.
_clientnode.globalContext.websiteBuilder.initializeInPlaceEditor(name,this.contextPath,this.elementReference.nativeElement);else{let content='';if(this.contextPath in this.scope)content=this.scope[this.contextPath];else if(name.toLowerCase().includes('initialized')&&this.elementReference.nativeElement&&'innerHTML'in this.elementReference.nativeElement)// NOTE: This could break in none browser environments.
content=this.elementReference.nativeElement.innerHTML.trim();if(content){const validNames=Object.keys(this.scope).filter(function(name){try{new Function(`var ${name}`)()}catch(error){return false}return true});// IgnoreTypeCheck
content=new Function('scope',...validNames,`return \`${content}\``)(this.scope,...validNames.map(function(name){return _this.scope[name]}))}else content='';this.renderer.setProperty(this.elementReference.nativeElement,'innerHTML',content)}break}}})||_class);// endregion
// region module
// IgnoreTypeCheck
(0,_core.Optional)()(EditableDirective,null,0);(0,_core.Optional)()(EditableDirective,null,2);Reflect.defineMetadata('design:paramtypes',[_router.ActivatedRoute,_core.ElementRef,_angularGeneric.InitialDataService,_core.Injector,_core.Renderer2],EditableDirective);/**
 * Represents the importable angular module.
 */let Module=(_dec2=(0,_core.NgModule)({declarations:(0,_angularGeneric.determineDeclarations)(module),exports:(0,_angularGeneric.determineExports)(module),providers:(0,_angularGeneric.determineProviders)(module)}),_dec2(_class3=class Module{})||_class3);// endregion
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
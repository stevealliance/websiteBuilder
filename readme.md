<!-- !/usr/bin/env markdown
-*- coding: utf-8 -*-
region header
Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

License
-------

This library written by Torben Sickert stand under a creative commons naming
3.0 unported license. See https://creativecommons.org/licenses/by/3.0/deed.de
endregion -->

Project status
--------------

[![npm version](https://badge.fury.io/js/website-builder.svg)](https://www.npmjs.com/package/website-builder)
[![downloads](https://img.shields.io/npm/dy/website-builder.svg)](https://www.npmjs.com/package/website-builder)
[![build status](https://travis-ci.org/thaibault/websiteBuilder.svg?branch=master)](https://travis-ci.org/thaibault/websiteBuilder)
[![code coverage](https://coveralls.io/repos/github/thaibault/websiteBuilder/badge.svg)](https://coveralls.io/github/thaibault/websiteBuilder)
[![dependencies](https://img.shields.io/david/thaibault/website-builder.svg)](https://david-dm.org/thaibault/website-builder)
[![development dependencies](https://img.shields.io/david/dev/thaibault/website-builder.svg)](https://david-dm.org/thaibault/website-builder=dev)
[![peer dependencies](https://img.shields.io/david/peer/thaibault/website-builder.svg)](https://david-dm.org/thaibault/website-builder?type=peer)
[![documentation website](https://img.shields.io/website-up-down-green-red/https/torben.website/websiteBuilder.svg?label=documentation-website)](https://torben.website/websiteBuilder)

<!--|deDE:Einsatzmöglichkeiten-->
Use cases
---------

Use cases:

1. Open single page and edit directly by providing data (parameter) and in place text content!
2. Open a prerendered frontend template in backend to see preview with live in place and parameter editing
3. Open a complete rendered template with current application state in frontend.

Steps to prepare:

1. weboptimizer gives 1 and 2 or 3 and 4 (with or without static parameter) compile step file results. We get two files: templateFunction and (maybe prerendered) template
2. on applicationState changes it renders templateFunction(applicationState) to plain html for static frontend
3. on backend live editing the backend shows the template in iframe and renders current state instantly

<!--|deDE:Inhalt-->
Content
-------

<!--Place for automatic generated table of contents.-->
[TOC]

<!--|deDE:Installation-->
Installation
------------

TODO

<!-- region modline
vim: set tabstop=4 shiftwidth=4 expandtab:
vim: foldmethod=marker foldmarker=region,endregion:
endregion -->

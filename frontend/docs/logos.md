---
sidebar_position: 2
---

# Logos

## SimpleIcons

We support a wide range of logos via [SimpleIcons](https://simpleicons.org/). All simple-icons are referenced using icon slugs. e.g:

![](https://img.shields.io/npm/v/npm.svg?logo=nodedotjs) - https://img.shields.io/npm/v/npm.svg?logo=nodedotjs

You can click the icon title on <a href="https://simpleicons.org/" rel="noopener noreferrer" target="_blank">simple-icons</a> to copy the slug or they can be found in the <a href="https://github.com/simple-icons/simple-icons/blob/master/slugs.md">slugs.md file</a> in the simple-icons repository. NB - the Simple Icons site and slugs.md page may at times contain new icons that haven't yet been pulled into Shields.io yet. More information on how and when we incorporate icon updates can be found [here](https://github.com/badges/shields/discussions/5369).

## Shields logos

We also maintain a small number of custom logos for a handful of services: https://github.com/badges/shields/tree/master/logo They can also be referenced by name and take preference to SimpleIcons e.g:

![](https://img.shields.io/npm/v/npm.svg?logo=npm) - https://img.shields.io/npm/v/npm.svg?logo=npm

## Custom Logos

Any custom logo can be passed in a URL parameter by base64 encoding it. e.g:

![](https://img.shields.io/badge/play-station-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+) - https://img.shields.io/badge/play-station-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+

## logoColor parameter

The `logoColor` param can be used to set the color of the logo. Hex, rgb, rgba, hsl, hsla and css named colors can all be used. For SimpleIcons named logos (which are monochrome), the color will be applied to the SimpleIcons logo.

- ![](https://img.shields.io/badge/logo-javascript-blue?logo=javascript) - https://img.shields.io/badge/logo-javascript-blue?logo=javascript
- ![](https://img.shields.io/badge/logo-javascript-blue?logo=javascript&logoColor=f5f5f5) - https://img.shields.io/badge/logo-javascript-blue?logo=javascript&logoColor=f5f5f5

In the case where Shields hosts a custom multi-colored logo, if the `logoColor` param is passed, the corresponding SimpleIcons logo will be substituted and colored.

- ![](https://img.shields.io/badge/logo-gitlab-blue?logo=gitlab) - https://img.shields.io/badge/logo-gitlab-blue?logo=gitlab
- ![](https://img.shields.io/badge/logo-gitlab-blue?logo=gitlab&logoColor=white) - https://img.shields.io/badge/logo-gitlab-blue?logo=gitlab&logoColor=white

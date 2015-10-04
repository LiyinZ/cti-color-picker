## How to Use

`bower install cti-color-picker --save`

Include `ctiColorPicker` in your angular dependency array, as demonstrated in
[demo/app.js](demo/app.js).

Use `cti-color-picker` as an attribute directive, like `<div cti-color-picker></div>`

**API**

API is exposed via the `cti-color-picker` attribute, as demonstrated in the demo
files: `cti-color-picker="main.colorData"`, where color data is an object with
color picker coordinates and rgba value, coming from `cti-color-picker`
directive's parent.

2 way data-binding meaning it updates color data from `cti-color-picker` directive's parent automatically, where you can capture and store the updated value.

If no pre-defined color data provided, color picker will pick a random color each time it reloads.

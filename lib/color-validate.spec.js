'use strict';

const { expect } = require('chai');
const validColor = require('./color-validate.js');

describe('Color validater', function () {
  it('should check if given valid hex colors', function () {
    const colorsTrue = [
        '#4c1',
        '#4C1',
        '#abc123',
        '#ABC123',
      ];
    const colorsFalse = [
        '#123red', // contains letter above F
        '#red', // contains letter above F
        '123456', // contains no # symbol
        '123', // contains no # symbol
      ];
    colorsTrue.forEach((color) => {
      expect(validColor(color)).to.be.true;
    });
    colorsFalse.forEach((color) => {
      expect(validColor(color)).to.be.false;
    });
  });

  it('should check if given valid rgb colors', function () {
    const colorsTrue = [
        'rgb(0,109,255)',
        'rgb(255, 0, 128)',
        'rgb(128,255,0)',
        'rgb(0,10, 100)',
        'rgb(255, 255,255)',
        'rgb(0,0,0)',
      ];
    const colorsFalse = [
        'rgb(256,128,255)', // r > 255
        'rgb(0 ,128,255)', // space before ','
        'rgb(0,0,280)', // g > 255
        'rgb(05,0,255)', // r starts with 0
      ];
    colorsTrue.forEach((color) => {
      expect(validColor(color)).to.be.true;
    });
    colorsFalse.forEach((color) => {
      expect(validColor(color)).to.be.false;
    });
  });

  it('should check if given valid rgba colors', function () {
    const colorsTrue = [
        'rgba(0,128,255,0)',
        'rgba(255, 0, 128, 0.5)',
        'rgba(128,255,0,0.89)',
        'rgba(0,10, 100,0.2)',
        'rgba(255, 255,255,1)',
        'rgba(0,0,0,0)',
      ];
    const colorsFalse = [
        'rgba(0,0,255)', // no alpha
        'rgba(256,128,255,1)', // r > 255
        'rgba(0 ,128,255,0)', // space before ','
        'rgba(0,0,255,1.5)', // no decimal for 1
        'rgba(05,0,255,1)', // r starts with 0
      ];
    colorsTrue.forEach((color) => {
      expect(validColor(color)).to.be.true;
    });
    colorsFalse.forEach((color) => {
      expect(validColor(color)).to.be.false;
    });
  });

  it('should check if given valid hsl colors', function () {
    const colorsTrue = [
        'hsl(0,0%,50%)',
        'hsl(25,20%,0%)',
        'hsl(100, 56%, 10%)',
        'hsl(250, 89%,90%)',
        'hsl(360,100%,100%)',
      ];
    const colorsFalse = [
        'hsl(050,50%,50%)', // h starts with 0
        'hsl(361,50%,50%)', // h > 360
        'hsl(250,150%,50%)', // s > 100%
        'hsl(0,50%,101%)', // l > 100%
      ];
    colorsTrue.forEach((color) => {
      expect(validColor(color)).to.be.true;
    });
    colorsFalse.forEach((color) => {
      expect(validColor(color)).to.be.false;
    });
  });

  it('should check if given valid hsla colors', function () {
    const colorsTrue = [
        'hsla(0,0%,50%,0)',
        'hsla(25,20%,0%,0.1)',
        'hsla(100, 56%, 10%,0.5)',
        'hsla(250, 89%,90%,0.89)',
        'hsla(360,100%,100%,1)',
      ];
    const colorsFalse = [
        'hsla(050,50%,50%,0)', // h starts with 0
        'hsla(361,50%,50%,0.5)', // h > 360
        'hsla(250,150%,50%,1)', // s > 100%
        'hsla(0,50%,101%,0.7)', // l > 100%
        'hsla(0 ,50%,101%,0.7)', // space before ','
        'hsla(0,50%,101%)', // no alpha
        'hsla(0,50%,101%,1.5)', // alpha no decimal for 1
      ];
    colorsTrue.forEach((color) => {
      expect(validColor(color)).to.be.true;
    });
    colorsFalse.forEach((color) => {
      expect(validColor(color)).to.be.false;
    });
  });

  it('should check if given valid css named colors', function () {
    const colorsTrue = [
        'red',
        'blue',
        'papayawhip',
        'lightgoldenrodyellow',
        'cornflowerblue',
        'salmon',
      ];
    const colorsFalse = [
        'notacolor',
        'bluish',
        'almostred',
        'brightmaroon',
        'cactus',
      ];
    colorsTrue.forEach((color) => {
      expect(validColor(color)).to.be.true;
    });
    colorsFalse.forEach((color) => {
      expect(validColor(color)).to.be.false;
    });
  });
});

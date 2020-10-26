/**
 * Written by Tan Han Wei.
 * October 2020
 * Custom UI is coded for more flexibility.
 * KNOWN ISSUE: .diffuse is deprecated and getDiffuse should be used instead,
 * but I have no idea how to set texture using getDiffuse.
 */
const Scene = require('Scene');
const Materials = require('Materials');
const Textures = require('Textures');
const NativeUI = require('NativeUI');
const TouchGestures = require('TouchGestures');
const Patch = require('Patches');
const Time = require('Time');
import { modes } from "./modes";
import { changeModeTo, Diagnostics, mode } from "./movement";

const sceneRoot = Scene.root;

var matReset;
var matFree;
var matWalk;
var matPlay;
var matDress;

var ResetSelected;
var ResetUnselected;

var FreeSelected;
var FreeUnselected;

var WalkSelected;
var WalkUnselected;

var PlaySelected;
var PlayUnselected;

var CostumeSelected;
var CostumeUnselected;

Promise.all([

    Materials.findFirst('matReset'),
    Materials.findFirst('matFree'),
    Materials.findFirst('matWalk'),
    Materials.findFirst('matPlay'),
    Materials.findFirst('matDress'),
    
    Textures.findFirst('Reset-selected'),
    Textures.findFirst('Reset-unselected'),

    Textures.findFirst('Free-selected'),
    Textures.findFirst('Free-unselected'),

    Textures.findFirst('walk-selected'),
    Textures.findFirst('walk-unselected'),

    Textures.findFirst('Play-selected'),
    Textures.findFirst('Play-unselected'),

    Textures.findFirst('close'),
    Textures.findFirst('close'),

])
.then(function(objects) {
     matReset = objects[0];
     matFree = objects[1];
     matWalk = objects[2];
     matPlay = objects[3];
     matDress = objects[4];

     ResetSelected = objects[5];
     ResetUnselected = objects[6];

     FreeSelected = objects[7];
     FreeUnselected = objects[8];

     WalkSelected = objects[9];
     WalkUnselected = objects[10];

     PlaySelected = objects[11];
     PlayUnselected = objects[12];

     CostumeSelected = objects[13];
     CostumeUnselected = objects[14];

    matReset.diffuse = ResetUnselected;
    matReset.alphaCutoff = 0.1;
    matFree.diffuse = FreeUnselected;
    matFree.alphaCutoff = 0.1;
    matWalk.diffuse = WalkUnselected;
    matWalk.alphaCutoff = 0.1;
    matPlay.diffuse = PlayUnselected;
    matPlay.alphaCutoff = 0.1;
    matDress.diffuse = CostumeUnselected;
    matDress.alphaCutoff = 0.1;

    

});

var pulsed;

Patch.outputs.getPulse('resetMode')
.then(event => {
    pulsed = event.subscribe(function () {
        changeModeTo(modes.RESET);
        resetAllSelection();
        matReset.diffuse = ResetSelected;
    });
    
})

Patch.outputs.getPulse('freeMode')
.then(event => {
    pulsed = event.subscribe(function () {
        changeModeTo(modes.FREE);
        resetAllSelection();
        matFree.diffuse = FreeSelected;

    });
    
})

Patch.outputs.getPulse('walkMode')
.then(event => {
    pulsed = event.subscribe(function () {
        changeModeTo(modes.CATCHUP);
        resetAllSelection();
        matWalk.diffuse = WalkSelected;
    });
    
})

Patch.outputs.getPulse('playMode')
.then(event => {
    pulsed = event.subscribe(function () {
        changeModeTo(modes.PLAY);
        resetAllSelection();
        matPlay.diffuse = PlaySelected;
    });
    
})

Patch.outputs.getPulse('closePlayMode')
.then(event => {
    pulsed = event.subscribe(function () {
        changeModeTo(modes.FREE);
        resetAllSelection();
        matFree.diffuse = FreeSelected;
    });
    
})

Patch.outputs.getPulse('setPlane')
.then(event => {
    pulsed = event.subscribe(function () {
        changeModeTo(modes.FREE);
        resetAllSelection();
        matFree.diffuse = FreeSelected;
        
    });
    
})

Promise.all([
    sceneRoot.findFirst('planeTracker0'),
    sceneRoot.findFirst('PLACER')
])
.then(function(objects) {

    Diagnostics.log('multitouch');

    const planeTracker = objects[0];
    const placer = objects[1];

    
    TouchGestures.onPan().subscribe(function(gesture) {
        if (mode != modes.ATTENTIONTOPLAY && mode != modes.PLAY && mode != modes.THROW) {
            planeTracker.trackPoint(gesture.location, gesture.state);
        }
        
    });
    

    const placerTransform = placer.transform;

    TouchGestures.onPinch().subscribeWithSnapshot( {
        'lastScaleX' : placerTransform.scaleX,
        'lastScaleY' : placerTransform.scaleY,
        'lastScaleZ' : placerTransform.scaleZ 
    }, function (gesture, snapshot) {
        placerTransform.scaleX = gesture.scale.mul(snapshot.lastScaleX);
        placerTransform.scaleY = gesture.scale.mul(snapshot.lastScaleY);
        placerTransform.scaleZ = gesture.scale.mul(snapshot.lastScaleZ);
    });
    

});

function resetAllSelection(){
    Diagnostics.log('Reset mat');
    matReset.diffuse = ResetUnselected;
    matFree.diffuse = FreeUnselected;
    matWalk.diffuse = WalkUnselected;
    matPlay.diffuse = PlayUnselected;
    matDress.diffuse = CostumeUnselected;
}

TouchGestures.onTap().subscribe(() => {
    Diagnostics.log('Current Mode is: ' + mode);
    if (mode == modes.ATTENTIONTOPLAY) {
        changeModeTo(modes.THROW);//
    }
    

});
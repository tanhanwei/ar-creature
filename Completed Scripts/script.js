/**
 * Written by Tan Han Wei.
 * October 2020
 * This script does the trick of making a local line-of-sight (LOS)that is parented to planed tracker (World AR)
 * to have the ACTUAL line-of-sight of the Camera.
 * The LOS is made up of 3 points (triangle).
 * This script is also used to 'force' the CREATURE to 'lookat' the device
 * but it is only limited to -90 to 90 degree of Y axis device rotation
 */

const Scene = require('Scene');
const Patch = require('Patches');
const Random = require('Random');
const Reactive = require('Reactive');
const TouchGestures = require('TouchGestures');

export const Diagnostics = require('Diagnostics');
export var randomXZ;
export var LOS;
export var CREATURETransform;
export var LOSCtrl;
export var rotToLookAtDevice;
export var frisbeeNearTargetTransform;
export var frisbeeFarTargetTransform;

const {
    generateNextAction,
    changeModeTo,
  } = require("./movement.js");

import { modes } from "./modes";
import { generateActionAndMoveAnimation } from "./animation.js";

export var lineOfSight;

const sceneRoot = Scene.root;

Promise.all([
    //child of planeTracker0
    //v1Local, v2Local, and v3Local are duplicates of the LOS vertices
    sceneRoot.findFirst('v0Local'),
    sceneRoot.findFirst('v1Local'),
    sceneRoot.findFirst('v2Local'),
    sceneRoot.findFirst('v3Local'),

    //child of Camera
    //v1,v2, and v3 are original vertices that defines the camera's line of sight (LOS)
    sceneRoot.findFirst('v1'),
    sceneRoot.findFirst('v2'),
    sceneRoot.findFirst('v3'),
    sceneRoot.findFirst('focalWorld'),

    //others
    sceneRoot.findFirst('pointer'),
    sceneRoot.findFirst('focalLocal'),

    //3D Meshes
    sceneRoot.findFirst('CREATURE'),
    sceneRoot.findFirst('GlobalLOS'),

    //for CREATURE to look at the device
    sceneRoot.findFirst('lookAtDevice'),
    sceneRoot.findFirst('frisbeeTargetNear'),
    sceneRoot.findFirst('frisbeeTargetFar'),
    sceneRoot.findFirst('localFrisbeeNearTarget'),
    sceneRoot.findFirst('localFrisbeeFarTarget'),

])
.then(function(objects) {
    var v0Local = objects[0];
    var v1Local = objects[1];
    var v2Local = objects[2];
    var v3Local = objects[3];

    const v1 = objects[4].worldTransform;
    const v2 = objects[5].worldTransform;
    const v3 = objects[6].worldTransform;
    const focalWorld = objects[7];
    const pointer = objects[8];
    const focalLocal = objects[9];

    const CREATURE = objects[10];

    LOSCtrl = objects[11];

    rotToLookAtDevice = objects[12].transform.rotationY;

    const frisbeeTargetNear = objects[13];
    const frisbeeTargetFar = objects[14];

    const localFrisbeeNearTarget = objects[15];
    const localFrisbeeFarTarget = objects[16];
    
    //Get local transforms
    var v0LocalWorldTransform = v0Local.worldTransform;
    var v1LocalWorldTransform = v1Local.worldTransform;
    var v2LocalWorldTransform = v2Local.worldTransform;
    var v3LocalWorldTransform = v3Local.worldTransform;
    
    localFrisbeeNearTarget.worldTransform.position = frisbeeTargetNear.worldTransform.position;
    localFrisbeeNearTarget.transform.y = 0;
    localFrisbeeFarTarget.worldTransform.position = frisbeeTargetFar.worldTransform.position;
    localFrisbeeFarTarget.transform.y = 0;

    frisbeeNearTargetTransform = localFrisbeeNearTarget.transform;
    frisbeeFarTargetTransform = localFrisbeeFarTarget.transform;

    //set duplicate's world transform to be the same as the original's
    v0LocalWorldTransform.position = focalWorld.worldTransform.position;
    v1LocalWorldTransform.position = v1.position;
    v1Local.transform.y = 0; //so that LOS appears on the floor
    v2LocalWorldTransform.position = v2.position;
    v2Local.transform.y = 0; //so that LOS appears on the floor
    v3LocalWorldTransform.position = v3.position;
    v3Local.transform.y = 0; //so that LOS appears on the floor

    //set CREATURE's transform to be exported
    CREATURETransform = CREATURE.transform;

    var focalLocalWorldTransform = focalLocal.worldTransform;
    focalLocalWorldTransform.position = focalWorld.worldTransform.position;

    LOS = {v1: v1Local.transform, v2: v2Local.transform, v3: v3Local.transform};

    const pt = CREATURE.worldTransform;

    lineOfSight = PointInTriangle(pt, v1, v2, v3);

    Patch.inputs.setBoolean('lineOfSight', lineOfSight);

    Patch.inputs.setString('nulllLocalX', pt.x.toString());
    Patch.inputs.setString('nullLocalY', pt.z.toString());
    Patch.inputs.setString('nullLocalZ', v2.x.toString());

    Patch.inputs.setString('nullWorldX', v2.z.toString());
    Patch.inputs.setString('nullWorldY', v3.x.toString());
    Patch.inputs.setString('nullWorldZ', v3.z.toString());


/*
    //generate random pt within LOS
    //MUST add "Screen Tap" patch in Patch Editor
    TouchGestures.onTap().subscribe(() => {

        let LOSMidPt = centroid(v1Local.transform, v2Local.transform, v3Local.transform);
        setAttention(60);
        changeModeTo(modes.CATCHUP);

    });
*/

    const lookAtAngle = pointer.transform.lookAt(focalLocal.transform.position).rotationY.mul(57.2958);

    pointer.transform.position = CREATURE.transform.position;

    Patch.inputs.setScalar('focalWorldX', focalWorld.worldTransform.position.z);
    Patch.inputs.setScalar('pointerWorldX', pointer.worldTransform.position.z);
    Patch.inputs.setScalar('lookAtAngle', lookAtAngle);

    generateNextAction();

});

function sign (p1, p2, p3) {
    //
    return Reactive.mul(p1.x.sub(p3.x), p2.z.sub(p3.z)).sub(Reactive.mul(p2.x.sub(p3.x), p1.z.sub(p3.z)));
    //return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
}

//Barycentric coordinate system
function PointInTriangle (pt, v1, v2, v3)
{

    const d1 = sign(pt, v1, v2);
    const d2 = sign(pt, v2, v3);
    const d3 = sign(pt, v3, v1);

    Diagnostics.watch('d1', d1);
    Diagnostics.watch('d2', d2);
    Diagnostics.watch('d3', d3);

    const has_neg = d1.lt(0).or(d2.lt(0)).or(d3.lt(0));
    const has_pos = d1.gt(0).or(d2.gt(0)).or(d3.gt(0));

    //has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    //has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    return Reactive.not(has_neg.and(has_pos));

    //return !(has_neg && has_pos);
}

function centroid(v1, v2, v3) {
    var x1 = v1.x.pinLastValue();
    var x2 = v2.x.pinLastValue();
    var x3 = v3.x.pinLastValue();

    var z1 = v1.z.pinLastValue();
    var z2 = v2.z.pinLastValue();
    var z3 = v3.z.pinLastValue();

    let midPoint = {
        x: (x1 + x2 + x3)/3,
        z: (z1 + z2 + z3)/3
    };

    //Diagnostics.log('Centroid: x = ' + midPoint.x + ', z = ' + midPoint.z);

    return midPoint;
}

export function LOSMidPoint() {
    return centroid(LOS.v1, LOS.v2, LOS.v3);
}

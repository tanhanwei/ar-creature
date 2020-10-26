/**
 * Written by Tan Han Wei.
 * October 2020
*/
const Scene = require('Scene');
const Animation = require('Animation');
const Random = require('Random');
const Patches = require('Patches');
const Reactive = require('Reactive');
import {LOS, CREATURETransform, rotToLookAtDevice, frisbeeFarTargetTransform, frisbeeNearTargetTransform} from "./script.js";
import { getMoveAction, generateThisStaticAction } from "./actions";
import { generateNextAction } from "./movement";
import { Actions } from "./actionLUT.js";

var playing = false;
var userFrisbee;
var CREATUREFrisbee;
var imaginaryFrisbee;

const sceneRoot = Scene.root;

Promise.all([

    sceneRoot.findFirst('userFrisbee'),
    sceneRoot.findFirst('CREATUREFrisbee'),
    sceneRoot.findFirst('imaginaryFrisbee'),

])
.then(function(objects) {
    userFrisbee = objects[0];
    CREATUREFrisbee = objects[1];
    imaginaryFrisbee = objects[2];

    userFrisbee.worldTransform.position = imaginaryFrisbee.worldTransform.position;
});
// Use export keyword to make a symbol available in scripting debug console
export const Diagnostics = require('Diagnostics');

//===================================================================
// initialise time driver parameters
var moveDriverParam = {
    durationMilliseconds: 0,
    loopCount: 1,
    mirror: false
};
var RotDriverParam = {
    durationMilliseconds: 0,
    loopCount: 1,
    mirror: false
}
var animateDriver = Animation.timeDriver(moveDriverParam);
var animateRotDriver = Animation.timeDriver(RotDriverParam);

var actionCounter = 0;
//=================================================================

export function generateNILAnimation() {
    animateDriver.stop();
    animateRotDriver.stop();

    let origin = {
        x : 0,
        z : 0
    };

    var lastRotation = 0;

    Diagnostics.log('last rotation: ' + lastRotation);

    let target = origin;

    let duration = 1000;

    moveDriverParam = {
        durationMilliseconds: duration,
        loopCount: 1,
        mirror: false
    };

    RotDriverParam = {
        durationMilliseconds: 100,
        loopCount: 1,
        mirror: false
    }

    animateCREATURE(origin, target, lastRotation, lastRotation);    
}

export function generateStaticExcitedAnimationFor(selectedAction){
    animateDriver.stop();
    animateRotDriver.stop();

    let origin = {
        x : CREATURETransform.x.pinLastValue(),
        z : CREATURETransform.z.pinLastValue()
    };

    var lastRotation = CREATURETransform.rotationY.pinLastValue();
    var lookAtDevice = rotToLookAtDevice.pinLastValue();
    lastRotation = lastRotation * 180 / Math.PI; //convert to degree
    lookAtDevice = lookAtDevice * 180 / Math.PI;

    Diagnostics.log('ORIGINALLY Rotationing excitedly from: ' + lastRotation + ' to ' + lookAtDevice);
        //offset roration value to be between -180 and 180 deg
        if(lastRotation > 180) {
            lastRotation = lastRotation - 360;
        } else if (lastRotation < -180) {
            lastRotation = 360 - lastRotation;
        }
    
        //force rotation to take the shortest 'route'
        if (lookAtDevice - lastRotation >= 180) {
            lookAtDevice = lookAtDevice - 360;
        } else if (lookAtDevice - lastRotation <= -180) {
            lookAtDevice = 360 + lookAtDevice;
        }

    Diagnostics.log('Rotationing excitedly from: ' + lastRotation + ' to ' + lookAtDevice);

    let target = origin;

    let duration = selectedAction.duration;
    let rotDuration = 300;

    if (Math.abs(lastRotation) + Math.abs(lookAtDevice) == 360 ) {
        rotDuration = 1;
    }

    moveDriverParam = {
        durationMilliseconds: duration,
        loopCount: 1,
        mirror: false
    };

    RotDriverParam = {
        durationMilliseconds: rotDuration,
        loopCount: 1,
        mirror: false
    }

    animateCREATURE(origin, target, lastRotation, lookAtDevice);
}

export function generateStaticAnimationFor(selectedAction){
    animateDriver.stop();
    animateRotDriver.stop();

    let origin = {
        x : CREATURETransform.x.pinLastValue(),
        z : CREATURETransform.z.pinLastValue()
    };

    var lastRotation = CREATURETransform.rotationY.pinLastValue();
    lastRotation = lastRotation * 180 / Math.PI; //convert to degree

    Diagnostics.log('last rotation: ' + lastRotation);

    let target = origin;

    let duration = selectedAction.duration;

    //reduce idle duration for quicker next response
    //if (selectedAction == Actions.STAND.IDLE) {
    //    duration = 500;
    //}

    moveDriverParam = {
        durationMilliseconds: duration,
        loopCount: 1,
        mirror: false
    };

    RotDriverParam = {
        durationMilliseconds: 100,
        loopCount: 1,
        mirror: false
    }

    animateCREATURE(origin, target, lastRotation, lastRotation);
}

//Generate a target, select suitable action based on distance and generate moving animation
export function generateActionAndMoveAnimation(targetType, userTarget){
    animateDriver.stop();
    animateRotDriver.stop();

    //Diagnostics.log('Animation Running: ' + animateDriver.isRunning.pinLastValue());
    var target;

    if (targetType == 'random' && userTarget == undefined) {
        target = randomTarget();
    } else {
        //generate a target that is NOT random
        target = userTarget;
        //Diagnostics.log('LOS midPoint: x = ' + target.x + ', y = ' + target.z);
    }
    
    let origin = {
        x : CREATURETransform.x.pinLastValue(),
        z : CREATURETransform.z.pinLastValue()
    };

    let targetRotationY = angleBetween(origin, target);
    let originRotationY = CREATURETransform.rotationY.pinLastValue();
    originRotationY = originRotationY * 180 / Math.PI; //convert to degree

    //offset roration value to be between -180 and 180 deg
    if(originRotationY > 180) {
        originRotationY = originRotationY - 360;
    } else if (originRotationY < -180) {
        originRotationY = 360 - originRotationY;
    }

    //force rotation to take the shortest 'route'
    if (targetRotationY - originRotationY >= 180) {
        targetRotationY = targetRotationY - 360;
    } else if (targetRotationY - originRotationY <= -180) {
        targetRotationY = 360 + targetRotationY;
    }
    
    Diagnostics.log('Moving from (' + origin.x + ', ' + origin.z + ') to (' + target.x + ', ' + target.z + ')');
    
    let distance = distanceBetween(origin, target);
    Diagnostics.log('Distance: ' + distance);

    let moveAction = getMoveAction(distance);
    let duration = distance / moveAction.speed * 1000;

    if (moveAction == Actions.STAND.IDLE) {
        duration = 1;
    }

    Diagnostics.log('Animation duration: ' + duration);

    Diagnostics.log('Move Action: ' + moveAction.name);
    
    moveDriverParam = {
        durationMilliseconds: duration,
        loopCount: 1,
        mirror: false
    };

    RotDriverParam = {
        durationMilliseconds: 1000,
        loopCount: 1,
        mirror: false
    }

    animateCREATURE(origin, target, originRotationY, targetRotationY);

    return moveAction;
    
}

//Generate a moving animation based on specified action and target
export function generateMoveAnimationFor(selectedAction, userTarget){
    Diagnostics.log('Generating specified animation: ' + selectedAction.name);
    animateDriver.stop();
    animateRotDriver.stop();

        //generate a target that is NOT random
       var target = userTarget;
        //Diagnostics.log('LOS midPoint: x = ' + target.x + ', y = ' + target.z);
    
    
    let origin = {
        x : CREATURETransform.x.pinLastValue(),
        z : CREATURETransform.z.pinLastValue()
    };

    let targetRotationY = angleBetween(origin, target);
    let originRotationY = CREATURETransform.rotationY.pinLastValue();
    originRotationY = originRotationY * 180 / Math.PI; //convert to degree

    //offset roration value to be between -180 and 180 deg
    if(originRotationY > 180) {
        originRotationY = originRotationY - 360;
    } else if (originRotationY < -180) {
        originRotationY = 360 - originRotationY;
    }

    //force rotation to take the shortest 'route'
    if (targetRotationY - originRotationY >= 180) {
        targetRotationY = targetRotationY - 360;
    } else if (targetRotationY - originRotationY <= -180) {
        targetRotationY = 360 + targetRotationY;
    }
    
    Diagnostics.log('Moving from (' + origin.x + ', ' + origin.z + ') to (' + target.x + ', ' + target.z + ')');
    
    let distance = distanceBetween(origin, target);
    Diagnostics.log('GMAF Distance: ' + distance);

    let moveAction = selectedAction;
    //Diagnostics.log('GMAF move action: ' + moveAction.name);
    let duration = distance / moveAction.speed * 1000;
    Diagnostics.log('GMAF duration: ' + duration);
    if (duration < 1 || duration == Infinity) {
        duration = 1;
        //Diagnostics.log('Motion TOO small. GOing idle.');
        //generateStaticAnimationFor(Actions.STAND.IDLE);
    } //else {
        
        Diagnostics.log('Animation duration: ' + duration);

        Diagnostics.log('Move Action: ' + moveAction.name);
        
        moveDriverParam = {
            durationMilliseconds: duration,
            loopCount: 1,
            mirror: false
        };

        RotDriverParam = {
            durationMilliseconds: 300,
            loopCount: 1,
            mirror: false
        }
        Diagnostics.log('Going to animate now');
        animateCREATURE(origin, target, originRotationY, targetRotationY);
    
   // }

    
}


export function generateChaseFrisbeeAnimation(){
    animateDriver.stop();
    animateRotDriver.stop();

    //Diagnostics.log('Animation Running: ' + animateDriver.isRunning.pinLastValue());
    let target = frisbeeTarget();

    let origin = {
        x : CREATURETransform.x.pinLastValue(),
        z : CREATURETransform.z.pinLastValue()
    };

    let targetRotationY = angleBetween(origin, target);
    let originRotationY = CREATURETransform.rotationY.pinLastValue();
    originRotationY = originRotationY * 180 / Math.PI; //convert to degree

    //offset roration value to be between -180 and 180 deg
    if(originRotationY > 180) {
        originRotationY = originRotationY - 360;
    } else if (originRotationY < -180) {
        originRotationY = 360 - originRotationY;
    }

    //force rotation to take the shortest 'route'
    if (targetRotationY - originRotationY >= 180) {
        targetRotationY = targetRotationY - 360;
    } else if (targetRotationY - originRotationY <= -180) {
        targetRotationY = 360 + targetRotationY;
    }
    
    Diagnostics.log('Chasing from (' + origin.x + ', ' + origin.z + ') to (' + target.x + ', ' + target.z + ')');
    
    let distance = distanceBetween(origin, target);
    Diagnostics.log('Distance: ' + distance);

    let moveAction = getMoveAction(distance);
    let duration = distance / moveAction.speed * 1000;

    generateThrowFrisbeeAnimation(target, duration);
    
    moveDriverParam = {
        durationMilliseconds: duration,
        loopCount: 1,
        mirror: false
    };

    RotDriverParam = {
        durationMilliseconds: 1000,
        loopCount: 1,
        mirror: false
    }

    animateCREATURE(origin, target, originRotationY, targetRotationY);

    return moveAction;
    
}

//Used separate driver to create frisbee animation
export function generateThrowFrisbeeAnimation(target, duration){

    let origin = {
        x : userFrisbee.transform.x.pinLastValue(),
        y :userFrisbee.transform.y.pinLastValue(),
        z : userFrisbee.transform.z.pinLastValue()
    };

    Diagnostics.log('THROWING from (' + origin.x + ', ' + origin.z + ') to (' + target.x + ', ' + target.z + ')');
    
    let distance = distanceBetween(origin, target);
    Diagnostics.log('Distance: ' + distance);


    Diagnostics.log('THROW duration: ' + duration);

    
    let frisbeeXZDriverParam = {
        durationMilliseconds: duration,
        loopCount: 1,
        mirror: false
    };

    let frisbeeYDriverParam = {
        durationMilliseconds: duration / 2,
        loopCount: 2,
        mirror: true
    };
    //TODO: convert target's local transform to camera's local transform

    //TODO: animateFrisbee
    let frisbeeXZDriver = Animation.timeDriver(frisbeeXZDriverParam);
    let frisbeeYDriver = Animation.timeDriver(frisbeeYDriverParam);
    
    frisbeeXZDriver.reset();
    frisbeeYDriver.reset();
  
    const frisbeeYSampler = Animation.samplers.easeOutCubic(0, origin.y + 1);
    const frisbeeAnimationY = Animation.animate(frisbeeYDriver,frisbeeYSampler);

    const frisbeeXSampler = Animation.samplers.linear(origin.x, target.x);
    const frisbeeAnimationX = Animation.animate(frisbeeXZDriver,frisbeeXSampler);

    const frisbeeZSampler = Animation.samplers.linear(origin.z, target.z);
    const frisbeeAnimationZ = Animation.animate(frisbeeXZDriver,frisbeeZSampler);

    userFrisbee.transform.x = frisbeeAnimationX;
    userFrisbee.transform.z = frisbeeAnimationZ;
    userFrisbee.transform.y = frisbeeAnimationY;

    frisbeeXZDriver.start();
    frisbeeYDriver.start();

    frisbeeXZDriver.onCompleted().subscribe((event) => {
        userFrisbee.hidden = true;
        CREATUREFrisbee.hidden = false;
    });

}

export function dropFrisbee(){
    userFrisbee.worldTransform.position = imaginaryFrisbee.worldTransform.position;
    userFrisbee.hidden = false;
    CREATUREFrisbee.hidden = true;
}

var Px = 0;
var Pz = 0;

function randomTarget() { //within 3 points
    //do something
    //Value Version (Note: pinLastValue doesn't work with worldTransform, this one uses Local transform)
    const v1 = LOS.v1;
    const v2 = LOS.v2;
    const v3 = LOS.v3;

    const r1 = Random.random();
    const r2 = Random.random();

    const Ax = v1.x.pinLastValue();
    const Bx = v2.x.pinLastValue();
    const Cx = v3.x.pinLastValue();

    const Az = v1.z.pinLastValue();
    const Bz = v2.z.pinLastValue();
    const Cz = v3.z.pinLastValue();

     Px = (1 - Math.sqrt(r1)) * Ax + (Math.sqrt(r1) * (1 - r2)) * Bx + (Math.sqrt(r1) * r2) * Cx;
     Pz = (1 - Math.sqrt(r1)) * Az + (Math.sqrt(r1) * (1 - r2)) * Bz + (Math.sqrt(r1) * r2) * Cz;

    //for debugging
    Patches.inputs.setScalar('randomX', Px);
    Patches.inputs.setScalar('randomZ', Pz);

    var newTarget = {x: Px, z: Pz};
    return newTarget;
}

function pickRandomPointBetween(pt1, pt2) {
    if (pt1 == pt2) {
        return pt1;
    }
    //let delta = pt1 - pt2;
    let u = Math.random();
    return (1 - u) * pt1 + u * pt2;
}

function frisbeeTarget(){
    let target = {
        x: pickRandomPointBetween(frisbeeFarTargetTransform.x.pinLastValue(), frisbeeNearTargetTransform.x.pinLastValue()),
        z: pickRandomPointBetween(frisbeeFarTargetTransform.z.pinLastValue(), frisbeeNearTargetTransform.z.pinLastValue())
    };
    return target;
}

function angleBetween(p1, p2) {
    return Math.atan2(p2.x - p1.x, p2.z - p1.z)* 180 / Math.PI; //in degree
}

function distanceBetween(p1,p2) {
    var a = p1.x - p2.x;
    var b = p1.z - p2.z;

    return Math.sqrt( a*a + b*b );
}

function animateCREATURE(origin, target, originRotationY, targetRotationY) {
    animateDriver = Animation.timeDriver(moveDriverParam);
    animateRotDriver = Animation.timeDriver(RotDriverParam);

    const animateXSampler = Animation.samplers.linear(origin.x, target.x);
    const placerAnimationX = Animation.animate(animateDriver,animateXSampler);

    const animateZSampler = Animation.samplers.linear(origin.z, target.z);
    const placerAnimationZ = Animation.animate(animateDriver,animateZSampler);

    let originRotationYRad = originRotationY * (Math.PI/180);
    let targetRotationYRad = targetRotationY * (Math.PI/180);

    const animateRotSampler = Animation.samplers.easeInOutQuad(originRotationYRad, targetRotationYRad);
    const placerRotAnimation = Animation.animate(animateRotDriver,animateRotSampler);

    CREATURETransform.x = placerAnimationX;
    CREATURETransform.z = placerAnimationZ;
    CREATURETransform.rotationY = placerRotAnimation;

    animateDriver.start();
    animateRotDriver.start();

    animateDriver.onCompleted().subscribe((event) => {
        Patches.inputs.setPulse('reset',Reactive.once());
        actionCounter++;
        Diagnostics.log(actionCounter + ' Animation Completed');
        generateNextAction();
        return;
    });

}
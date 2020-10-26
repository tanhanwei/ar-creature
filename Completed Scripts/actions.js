/**
 * Written by Tan Han Wei.
 * October 2020
 * This is the definition of the creature's BEHAVIOUR.
 * It generates the next action based on current action type and name.
 * The next action is selected with a non-uniform random generator.
 * For stationary actions, once it has been generated, functions from animation.js
 * will be called to generate non-moving animation.
 * For moving actions, it can only be generated once the distance to the target has been determined
 */

const Scene = require('Scene');
import { Actions } from "./actionLUT";
import { generateActionAndMoveAnimation, generateStaticAnimationFor, generateMoveAnimationFor, generateNILAnimation, generateStaticExcitedAnimationFor, generateChaseFrisbeeAnimation } from "./animation.js";
import { LOSCtrl } from "./script";

export const Diagnostics = require('Diagnostics');

const lieAnimatino = true;
const moveAnimation = true;
const sitAnimation = true;
const standAnimation = true;

//Behaviours
/*
-------------------------------EDIT THESE FUNCTIONS-------------------------------
*/
export function moveOrStandNext(){
    var moveOrStand = weightedRand({
        move: 0.3,
        stand: 0.7 //the creature is more likely to stand than moving around
    });

    var decision = moveOrStand();

    return decision;
}

export function randomLie(currentAction){
    var nextActionName;
    var nextAction;

    switch (currentAction.name) {
        case 'lieIdle':
            nextActionName = weightedRand({
                lieIdle: 0.2,
                lieLookAround: 0.5,
                lieSleep: 0,
                lieSleepToLie: 0,
                lieToSleep: 0.1,
                lieToStand: 0.2
            });
            break;
        case 'lieLookAround':
            nextActionName = weightedRand({
                lieIdle: 0.5,
                lieLookAround: 0.2,
                lieSleep: 0,
                lieSleepToLie: 0,
                lieToSleep: 0.1,
                lieToStand: 0.2
            });
            break;
        case 'lieSleep':
            nextActionName = weightedRand({
                lieIdle: 0,
                lieLookAround: 0,
                lieSleep: 0.8, //most likely will continue to sleep
                lieSleepToLie: 0.2, //slight chance of waking up
                lieToSleep: 0,
                lieToStand: 0
            });
            break;
        case 'lieSleepToLie':
            nextActionName = weightedRand({
                lieIdle: 0.2,
                lieLookAround: 0.5, //most likely to wake up and look around
                lieSleep: 0,
                lieSleepToLie: 0,
                lieToSleep: 0.3, //somewhat might sleep back
                lieToStand: 0
            });
            break;
        case 'lieToSleep':
            nextActionName = weightedRand({
                lieIdle: 0,
                lieLookAround: 0,
                lieSleep: 1, //next action MUST be sleep
                lieSleepToLie: 0,
                lieToSleep: 0,
                lieToStand: 0
            });
            break;
        case 'lieToStand':
            Diagnostics.log('Error, use randomStand instead');
            break;
        default:
            Diagnostics.log('Transition to Lie');
            nextActionName = weightedRand({
                lieIdle: 0.2,
                lieLookAround: 0.5,
                lieSleep: 0,
                lieSleepToLie: 0,
                lieToSleep: 0.2, //possible to sleep right away
                lieToStand: 0.1 //very unlikely to stand again
            });
    }
    
    nextAction = getNextLieAction(nextActionName());
    generateStaticAnimationFor(nextAction);
    return nextAction;
}

export function randomSit(currentAction){
    var nextActionName;
    var nextAction;

    /*
    nextActionName = weightedRand({
        sitBored: 0,
        sitButtScratch: 0,
        sitIdle: 0,
        sitScratch: 0,
        sitToLie: 0,
        sitToStand: 0
    });
    */

    switch (currentAction.name) {
        case 'sitBored':
            nextActionName = weightedRand({
                sitBored: 0.29,
                sitButtScratch: 0.01,
                sitIdle: 0,
                sitScratch: 0.2,
                sitToLie: 0.1,
                sitToStand: 0.4
            });
            break;
        case 'sitButtScratch': //NOTE: SPECIAL CASE!! Need to generate new target!
            nextActionName = weightedRand({
                sitBored: 0.4,
                sitButtScratch: 0,
                sitIdle: 0,
                sitScratch: 0.1, //less likely to scratch elsewhere?
                sitToLie: 0.1,
                sitToStand: 0.4
            });
            break;
        case 'sitIdle':
            nextActionName = weightedRand({
                sitBored: 0.49, //most likely to get bored when idling
                sitButtScratch: 0.01,
                sitIdle: 0,
                sitScratch: 0.2,
                sitToLie: 0.1,
                sitToStand: 0.2
            });
            break;
        case 'sitScratch':
            nextActionName = weightedRand({
                sitBored: 0.69, //it's a bored scratch
                sitButtScratch: 0.01,
                sitIdle: 0,
                sitScratch: 0.1,
                sitToLie: 0.1,
                sitToStand: 0.1
            });
            break;
        case 'sitToLie':
            Diagnostics.log('Error, use randomLie instead');
            break;
        case 'sitToStand':
            Diagnostics.log('Error, use randomStand instead');
            break;
        default:
            Diagnostics.log('Transition to sit');
            nextActionName = weightedRand({
                sitBored: 0.69, //it's a bored scratch
                sitButtScratch: 0.01,
                sitIdle: 0, //most likely to be idle for a while
                sitScratch: 0.1,
                sitToLie: 0.1,
                sitToStand: 0.1 //unlikely to stand again
            });
    }
    
    nextAction = getNextSitAction(nextActionName());
    generateStaticAnimationFor(nextAction);
    return nextAction;

}

export function randomStand(currentAction){
    var nextActionName;
    var nextAction;

    if(currentAction.type == 'move'){
        nextActionName = weightedRand({
            standBark: 0.1,
            standBarkExcited: 0,
            standBarkHappy: 0,
            standDie: 0,
            standDig: 0,
            standEat: 0,
            standIdle: 0.24,
            standLookLeft: 0.1,
            standLookRight: 0.1,
            standPee: 0.01,
            standPoop: 0.01,
            standSniff: 0,
            standSniffToDig: 0,
            standSniffToStand: 0,
            standToSit: 0.1,
            standToSniff: 0.34 //most likely to stop moving and sniff
        });

    } else {
        switch(currentAction.name) {
            case 'standBark':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.24,
                    standLookLeft: 0.1,
                    standLookRight: 0.2,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
                break;
            case 'standBarkExcited':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.34,
                    standLookLeft: 0.1,
                    standLookRight: 0.1,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
                break;
            case 'standBarkHappy':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.34,
                    standLookLeft: 0.1,
                    standLookRight: 0.1,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
                break;
            case 'standDie':
                
                break;
            case 'standDig':
                nextActionName = weightedRand({
                    standBark: 0,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0.3,
                    standEat: 0,
                    standIdle: 0.2,
                    standLookLeft: 0,
                    standLookRight: 0,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 0.5,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0,
                    standToSniff: 0
                });
                break; 
            case 'standEat':
                nextActionName = weightedRand({
                    standBark: 0,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.5,
                    standLookLeft: 0,
                    standLookRight: 0,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0.2,
                    standToSit: 0.1,
                    standToSniff: 0.2
                });
                break;
            case 'standIdle':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.24,
                    standLookLeft: 0.1,
                    standLookRight: 0.1,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.34
                });
                break;
            case 'standLookLeft':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.34,
                    standLookLeft: 0.05,
                    standLookRight: 0.15,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
                break;
            case 'standLookRight':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.34,
                    standLookLeft: 0.15,
                    standLookRight: 0.05,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
                break;
            case 'standPee':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.3,
                    standLookLeft: 0.1,
                    standLookRight: 0.2,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.2
                });
                break;
            case 'standPoop':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.3,
                    standLookLeft: 0.1,
                    standLookRight: 0.2,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.2
                });
                break; 
            case 'standSniff':
                nextActionName = weightedRand({
                    standBark: 0,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0,
                    standLookLeft: 0,
                    standLookRight: 0,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 0.5,
                    standSniffToDig: 0.3,
                    standSniffToStand: 0.2,
                    standToSit: 0,
                    standToSniff: 0
                });
                break;
            case 'standSniffToDig':
                nextActionName = weightedRand({
                    standBark: 0,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 1, //must be digging next
                    standEat: 0,
                    standIdle: 0,
                    standLookLeft: 0,
                    standLookRight: 0,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0,
                    standToSniff: 0
                });
                break;
            case 'standSniffToStand':
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.24,
                    standLookLeft: 0.1,
                    standLookRight: 0.2,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
                break;
            case 'standToSit':
                Diagnostics.log('Error, use randomSit instead');
                break; 
            case 'standToSniff':
                nextActionName = weightedRand({
                    standBark: 0,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0,
                    standLookLeft: 0,
                    standLookRight: 0,
                    standPee: 0,
                    standPoop: 0,
                    standSniff: 1, //must  be sniffing, at least once
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0,
                    standToSniff: 0
                });
                break; 
            default:
                nextActionName = weightedRand({
                    standBark: 0.1,
                    standBarkExcited: 0,
                    standBarkHappy: 0,
                    standDie: 0,
                    standDig: 0,
                    standEat: 0,
                    standIdle: 0.24,
                    standLookLeft: 0.1,
                    standLookRight: 0.2,
                    standPee: 0.01,
                    standPoop: 0.01,
                    standSniff: 0,
                    standSniffToDig: 0,
                    standSniffToStand: 0,
                    standToSit: 0.1,
                    standToSniff: 0.24
                });
        }

    }

    nextAction = getNextStandAction(nextActionName());
    generateStaticAnimationFor(nextAction);
    return nextAction;


}

function getNextLieAction(actionName){
    switch(actionName) {
        case 'lieIdle':
            return Actions.LIE.IDLE;
            break;
        case 'lieLookAround':
            return Actions.LIE.LOOKAROUND;
            break;
        case 'lieSleep':
            return Actions.LIE.SLEEP;
            break;
        case 'lieSleepToLie':
            return Actions.LIE.SLEEPTOLIE;
            break;
        case 'lieToSleep':
            return Actions.LIE.TOSLEEP;
            break; 
        case 'lieToStand':
            return Actions.LIE.TOSTAND;
            break; 
        default:
    }
}

function getNextSitAction(actionName){
    switch(actionName) {
        case 'sitBored':
            return Actions.SIT.BORED;
            break;
        case 'sitButtScratch':
            return Actions.SIT.BUTTSCRATCH;
            break;
        case 'sitIdle':
            return Actions.SIT.IDLE;
            break;
        case 'sitScratch':
            return Actions.SIT.SCRATCH;
            break;
        case 'sitToLie':
            return Actions.SIT.TOLIE;
            break; 
        case 'sitToStand':
            return Actions.SIT.TOSTAND;
            break; 
        default:
    }
}

function getNextStandAction(actionName){
    switch(actionName) {
        case 'standBark':
            return Actions.STAND.BARK;
            break;
        case 'standBarkExcited':
            return Actions.STAND.BARKEXCITED;
            break;
        case 'standBarkHappy':
            return Actions.STAND.BARKHAPPY;
            break;
        case 'standDie':
            return Actions.STAND.DIE;
            break;
        case 'standDig':
            return Actions.STAND.DIG;
            break; 
        case 'standEat':
            return Actions.STAND.EAT;
            break;
        case 'standIdle':
            return Actions.STAND.IDLE;
            break;
        case 'standLookLeft':
            return Actions.STAND.LOOKLEFT;
            break;
        case 'standLookRight':
            return Actions.STAND.LOOKRIGHT;
            break;
        case 'standPee':
            return Actions.STAND.PEE;
            break;
        case 'standPoop':
            return Actions.STAND.POOP;
            break; 
        case 'standSniff':
            return Actions.STAND.SNIFF;
            break;
        case 'standSniffToDig':
            return Actions.STAND.SNIFFTODIG;
            break;
        case 'standSniffToStand':
            return Actions.STAND.SNIFFTOSTAND;
            break;
        case 'standToSit':
            return Actions.STAND.TOSIT;
            break; 
        case 'standToSniff':
            return Actions.STAND.TOSNIFF;
            break; 
        default:
    }
}

export function generateStaticPlayAnimation(){
    var nextExcitedAction;

    let nextExcitedActionName = weightedRand({
        standIdle: 0, //default
        standBark: 0.3, //excitedAnimation1
        standBarkExcited: 0.5, //excitedAnimation2
        standBarkHappy: 0.2 //excitedAnimation3
    });

    nextExcitedAction = getNextStandAction(nextExcitedActionName());
    generateStaticExcitedAnimationFor(nextExcitedAction); //same as generateStaticAnimationFor() but WITH an orientation that is facing the device

    return nextExcitedAction;
}

/*
-------------------------------END OF EDITING-------------------------------
*/






function weightedRand(spec) {
    var i, j, table=[];
    for (i in spec) {
      // The constant 10 below should be computed based on the
      // weights in the spec for a correct and optimal table size.
      // E.g. the spec {0:0.999, 1:0.001} will break this impl.
      for (j=0; j<spec[i]*10; j++) {
        table.push(i);
      }
    }
    return function() {
      return table[Math.floor(Math.random() * table.length)];
    }
}

export function generateMoveAction(targetType, target) {
    if (target) {
    }
    let newAction = generateActionAndMoveAnimation(targetType, target);
   
    return newAction;
}

export function getMoveAction(distance){
    if (distance < 0.001) {
        return Actions.STAND.IDLE;
    } else if (distance > 0.001 && distance <= 1) {
        return Actions.MOVE.WALK;
    } else if (distance > 1 && distance <= 2) {
        return Actions.MOVE.WALKFAST;
    } else if (distance > 2 && distance <= 3) {
        return Actions.MOVE.RUN;
    } else if (distance > 3) {
        return Actions.MOVE.LEAP;
    } 
}

export function generateThisStaticAction(nextAction) {
    generateStaticAnimationFor(nextAction);
    return nextAction;
}

export function generateThisMoveAction(nextAction, target){
    generateMoveAnimationFor(nextAction, target);
    return nextAction;
}

export function generateNIL(){
    generateNILAnimation();
}



export function chaseFrisbee(){
    let nextAction = generateChaseFrisbeeAnimation();
    return nextAction;
}
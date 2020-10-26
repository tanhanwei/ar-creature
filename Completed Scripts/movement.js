/**
 * Written by Tan Han Wei.
 * October 2020
 * This script controls the flow of actions and movements based on 'mode'
 */

const Scene = require('Scene');
const Patches = require('Patches');
const Reactive = require('Reactive');
const Animation = require('Animation');
const TouchGestures = require('TouchGestures');
const Random = require('Random');

export const Diagnostics = require('Diagnostics');


import { randomLie, randomSit, randomStand, moveOrStandNext, generateMoveAction, generateThisStaticAction, generateThisMoveAction, generateNIL, generateStaticPlayAnimation, chaseFrisbee } from "./actions.js";
import { Actions } from "./actionLUT.js";
import { modes } from "./modes";
import { LOSMidPoint, LOSCtrl, CREATURETransform } from "./script.js";
import { dropFrisbee } from "./animation.js";


var attention = 0;

const sceneRoot = Scene.root;

const animations = {
    POSITION: 'position',
    ROTATION: 'rotation'
}

//initialise actions
export var mode = modes.RESET;
var actionNo = 0;
var currentAction = Actions.STAND.IDLE;
var nextAction = Actions.STAND.IDLE;
var target;
var origin;
var distance;

export function changeModeTo(nextMode){

    mode = nextMode;
    Diagnostics.log('mode changed to: ' + mode);
}

export function generateNextAction() {

    let decision = moveOrStandNext();
    switch(mode) {
        case modes.FREE:
            normalLOS();
            LOSCtrl.transform.scaleX = 1;
            if (currentAction.transition == 'none') {
                //If the currentActino is not a transition,
                //then generate next randomActions based on 'type'
                //Diagnostics.log('No transition, current action type is: ' + currentAction.type);
                switch(currentAction.type) {
                    case 'lie':
                        nextAction = randomLie(currentAction);
                        break;
                    case 'move':
                        if(decision == 'stand') {
                            nextAction = randomStand(currentAction);
                        } else {
                            nextAction = generateMoveAction('random');
                        }
                        break;
                    case 'sit':
                        nextAction = randomSit(currentAction);
                        break;
                    case 'stand':                   
                        if(decision == 'stand') {
                            nextAction = randomStand(currentAction);
                        } else {
                            nextAction = generateMoveAction('random');
                        }
                        
                        break;
                    default:
                }
                
            } else {
                transitionHandler();
            }
                    
            break;
        case modes.CATCHUP:
            mode = modes.ATTENTION; 
            target = LOSMidPoint();
            Patches.inputs.setScalar('targetX', target.x);
            Patches.inputs.setScalar('targetZ', target.z);
            nextAction = generateThisMoveAction(Actions.MOVE.RUN, target);
            break;
        case modes.ATTENTION:

            target = LOSMidPoint();
            origin = {
                x : CREATURETransform.x.pinLastValue(),
                z : CREATURETransform.z.pinLastValue()
            };
            distance = distanceBetween(origin, target);
            if (distance > 0.1 && distance <= 1.5) {
                mode = modes.CATCHUP;
                nextAction = generateThisMoveAction(Actions.MOVE.RUN, target);
            } else if (distance > 1.5) {
                mode = modes.CATCHUP;
                nextAction = generateThisMoveAction(Actions.MOVE.LEAP, target);
            } else {
                Diagnostics.log('STAY');
                nextAction = generateThisStaticAction(Actions.STAND.IDLE);
                nextAction = Actions.STAND.IDLE;
                
            } 
                break;
        case modes.PLAY:
            mode = modes.ATTENTIONTOPLAY; 
            target = LOSMidPoint();
            Patches.inputs.setScalar('targetX', target.x);
            Patches.inputs.setScalar('targetZ', target.z);
            nextAction = generateThisMoveAction(Actions.MOVE.RUN, target);
            break;
        case modes.ATTENTIONTOPLAY:
            dropFrisbee();
            target = LOSMidPoint();
            origin = {
                x : CREATURETransform.x.pinLastValue(),
                z : CREATURETransform.z.pinLastValue()
            };

            distance = distanceBetween(origin, target);

            if (distance > 0.3 && distance <= 1.5) {
                mode = modes.PLAY;
                nextAction = generateThisMoveAction(Actions.MOVE.RUN, target);
            } else if (distance > 1.5) {
                mode = modes.PLAY;
                nextAction = generateThisMoveAction(Actions.MOVE.LEAP, target);
            } else {
                Diagnostics.log('STAY');
                nextAction = generateStaticPlayAnimation();
            } 
                    break;
        case modes.THROW:
            nextAction = chaseFrisbee();
            Diagnostics.log('Action to chase frisbee: ' + nextAction.name);
            mode = modes.ATTENTIONTOPLAY;
            break;
        case modes.RESET:
            nextAction = Actions.MOVE.NIL;
            generateNIL();
            break;
        case modes.TEST:
            // For direct testing only
            nextAction = generateMoveAction('random');
            break;
        default:
            Diagnostics.log('Error, no mode found');
      }

      currentAction = nextAction;

      Patches.inputs.setScalar('actionNo', nextAction.actionNo);
      Patches.inputs.setScalar('typeNo', nextAction.typeNo);
      
}
function narrowLOS(){
    LOSCtrl.transform.scaleX = 0.5; //NOTE change by scale will MESS UP the system!
    LOSCtrl.transform.scaleZ = 0.5;
    LOSCtrl.transform.z = -0.5;
}

function normalLOS(){
    LOSCtrl.transform.scaleX = 1;
    LOSCtrl.transform.scaleZ = 1;
    LOSCtrl.transform.z = 0;
}

function attentionLost(){
    if (attention < 1) {
        return true;
    } else {
        return false;
    }
}

function transitionHandler() {
    switch(currentAction.transition) {
        //If the currentActino is a transition,
        //then generate next randomActions based on 'transition'
        case 'toLie':
            nextAction = randomLie(currentAction);
            break;
        case 'toSit':
            nextAction = randomSit(currentAction);
            break;
        case 'toStand':
            nextAction = randomStand(currentAction);
            break;
        default:
          // code block
      }
}

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

  //var rand012 = weightedRand({0:0.8, 1:0.1, 2:0.1});
  //rand012(); // random in distribution...


function distanceBetween(p1,p2) {
    var a = p1.x - p2.x;
    var b = p1.z - p2.z;

    return Math.sqrt( a*a + b*b );
}

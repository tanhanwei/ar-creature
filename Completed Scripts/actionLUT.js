/**
 * Written by Tan Han Wei.
 * October 2020
 * These actions correspond to all Animation Playback Controllers.
 * Used in movement.js to generate next actions.
 * Used in animation.js to get the correct MOVE action based on moving distance.
 * actionNo and typeNo are used as input for 'Action Selector' Patch in the Patch Editor.
*/

export const Actions = {
    LIE: {
        IDLE: {name: 'lieIdle', type: 'lie', duration: 1625, speed: 0, loop: true, transition: 'none', typeNo: 0, actionNo: 0},
        LOOKAROUND: {name: 'lieLookAround', type: 'lie', duration: 6625, speed: 0, loop: false, transition: 'none', typeNo: 0, actionNo: 1},
        SLEEP: {name: 'lieSleep', type: 'lie', duration: 2917, speed: 0, loop: false, transition: 'none', typeNo: 0, actionNo: 2},
        SLEEPTOLIE: {name: 'lieSleepToLie', type: 'lie', duration: 583, speed: 0, loop: false, transition: 'none', typeNo: 0, actionNo: 3},
        TOSLEEP: {name: 'lieToSleep', type: 'lie', duration: 583, speed: 0, loop: false, transition: 'none', typeNo: 0, actionNo: 4},
        TOSTAND: {name: 'lieToStand', type: 'lie', duration: 1333, speed: 0, loop: false, transition: 'toStand', typeNo: 0, actionNo: 5}
    },
    MOVE: {
        JUMP: {name: 'moveJump', type: 'move', duration: 1625, speed: 1.75, loop: true, transition: 'none', typeNo: 1, actionNo: 0},
        LEAP: {name: 'moveLeap', type: 'move', duration: 625, speed: 1.75, loop: true, transition: 'none', typeNo: 1, actionNo: 1},
        RUN: {name: 'moveRun', type: 'move', duration: 542, speed: 1.25, loop: true, transition: 'none', typeNo: 1, actionNo: 2}, //Optional but Highly recommended
        WALK: {name: 'moveWalk', type: 'move', duration: 833, speed: 0.25, loop: true, transition: 'none', typeNo: 1, actionNo: 3}, //MUST HAVE AT LEAST 1 Walking animation
        WALKFAST: {name: 'moveWalkFast', type: 'move', duration: 625, speed: 1, loop: true, transition: 'none', typeNo: 1, actionNo: 4},
        WALKSNIFF: {name: 'moveWalkSniff', type: 'move', duration: 792, speed: 0.25, loop: true, transition: 'none', typeNo: 1, actionNo: 5},
        NIL: {name: 'moveNil', type: 'move', duration: 42, speed: 0, loop: true, transition: 'none', typeNo: 1, actionNo: 6}, //MUST HAVE
    },
    SIT: {
        BORED: {name: 'sitBored', type: 'sit', duration: 4708, speed: 0, loop: false, transition: 'none', typeNo: 2, actionNo: 0},
        BUTTSCRATCH: {name: 'sitButtScratch', type: 'sit', duration: 2875, speed: 0, loop: true, transition: 'none', typeNo: 2, actionNo: 1},
        IDLE: {name: 'sitIdle', type: 'sit', duration: 833, speed: 0, loop: true, transition: 'none', typeNo: 2, actionNo: 2},
        SCRATCH: {name: 'sitScratch', type: 'sit', duration: 2792, speed: 0, loop: false, transition: 'none', typeNo: 2, actionNo: 3},
        TOLIE: {name: 'sitToLie', type: 'sit', duration: 333, speed: 0, loop: false, transition: 'toLie', typeNo: 2, actionNo: 4},
        TOSTAND: {name: 'sitToStand', type: 'sit', duration: 1000, speed: 0, loop: false, transition: 'toStand', typeNo: 2, actionNo: 5},
    },
    STAND: {
        BARK: {name: 'standBark', type: 'stand', duration: 1333, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 0},
        BARKEXCITED: {name: 'standBarkExcited', type: 'stand', duration: 2375, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 1},
        BARKHAPPY: {name: 'standBarkHappy', type: 'stand', duration: 1417, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 2},
        DIE: {name: 'standDie', type: 'stand', duration: 1333, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 3},
        DIG: {name: 'standDig', type: 'stand', duration: 292, speed: 0, loop: true, transition: 'none', typeNo: 3, actionNo: 4},
        EAT: {name: 'standEat', type: 'stand', duration: 17542, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 5},
        IDLE: {name: 'standIdle', type: 'stand', duration: 637, speed: 0, loop: true, transition: 'none', typeNo: 3, actionNo: 6}, //MUST HAVE
        LOOKLEFT: {name: 'standLookLeft', type: 'stand', duration: 1667, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 7},
        LOOKRIGHT: {name: 'standLookRight', type: 'stand', duration: 1750, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 8},
        PEE: {name: 'standPee', type: 'stand', duration: 5167, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 9},
        POOP: {name: 'standPoop', type: 'stand', duration: 5000, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 10},
        SNIFF: {name: 'standSniff', type: 'stand', duration: 2458, speed: 0, loop: true, transition: 'none', typeNo: 3, actionNo: 11},
        SNIFFTODIG: {name: 'standSniffToDig', type: 'stand', duration: 2167, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 12},
        SNIFFTOSTAND: {name: 'standSniffToStand', type: 'stand', duration: 583, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 13},
        TOSIT: {name: 'standToSit', type: 'stand', duration: 1000, speed: 0, loop: false, transition: 'toSit', typeNo: 3, actionNo: 14},
        TOSNIFF: {name: 'standToSniff', type: 'stand', duration: 583, speed: 0, loop: false, transition: 'none', typeNo: 3, actionNo: 15},
     },
 };
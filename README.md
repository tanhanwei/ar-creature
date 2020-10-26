
# Bring a 3D Creature to Life in Spark AR
In this tutorial, you will learn how to bring 3D creatures to life in Spark AR by creating behaviours that are influenced by Weighted Random Distribution. You will NOT be building everything from scratch because this tutorial focuses only on the creation of creature behaviours.

This is an advanced tutorial and you are expected to know how to use Spark AR's basic functions such as importing 3D models, creating Animation Target, creating Animation Playback Controller and basic JavasScript programming skill.

## Getting Started
To follow along, download the unfinished project file [here](https://drive.google.com/file/d/1rPp5pclvqC2YkuwXhItCjZYkASS3jq6j/view?usp=sharing). Open the file and a new project will be created automatically.

In this unfinished project,  I have configured everything that you need to get started, including the Scripts and Patches that controls the User Interface, Plane Tracker, Animations, Line-Of-Sight, etc.

## Accessing the 3D model
The unfinished project was configured to handle any 3D models that have various baked animations. For convenience, I have also imported a Corgi 3D model (created by [nitacawo](https://sketchfab.com/nitacawo)) which has many animations baked in.

You may use any other 3D models as long as they meet the following requirements:
1. Low poly
2. Has Idle, Walk, and Run Animations baked in.
3. Compatible file formats

However, I highly recommend that you follow along using the Corgi 3D model first because this is a good example where you'll learn how to deal with transitions between dynamic and static postures.

## Understanding the project components
Before we begin, I'd like to briefly explain what has been built into the unfinished project file.

### Scene
The **Scene Panel** has been configured for you to use the Plane Tracker and components for the Line-Of-Sight (LOS) system that I've developed, where the program can tell whether the creature is in the camera's view or out of the camera's view.
### Assets
Similarly, I've imported assets for you to get started quickly. Except for 'Corgi' and 'sunglasses', all asset files are essential for the effect to work. In other words, you can replace the 'Corgi' and 'sunglasses' 3D models with any other 3D models of your choice.

### Patch Editor
I have also simplified the **Patch Editor** so that you can easily configure the baked animations to work with its 3D model. The 'AR Creature' Patch is a Grouped Patch that controls the selection of the baked animations.

As you can see, the AR Creature Patch is capable of handling animations with 4 different types of postures: lie, move, sit, stand. This is the reason why I highly recommend that you use the Corgi model instead of your own model because you will be confused if your 3D model only has 2 or fewer types of postures.

### Scripts
This is the backbone of the project. I've created 7 scripts with the following purposes:
#### script.js
Well, this was the first script that was created to load all the Modules that I need. Plus, I've also implemented the LOS system in this script by utilizing the conversion between local and world transforms.
#### actionLUT.js
Basically, this is a Look-Up-Table (LUT) for all the baked animations. I used the word 'action'  instead of 'animation' to avoid confusion with another script that generates animation in Spark AR. This action LUT is a table that contains essential properties of each baked animations such as duration, type, type number and action number.

This is the first script that you will be configuring.

#### actions.js
This will be the main script that you will be working on to bring the creature to life. I called it 'action' because this script selects the action from the actionLUT based on the behaviour that has been configured in this script.

#### modes.js
This configures the different modes of the creature with the following properties:

 - **Free Mode**. The creature can move freely and behaves with non-uniform random actions and motions.
 - **Catch-up Mode**. In this mode, the creature will always move into the Line of Sight (LOS) after the end of current action and motion.
 - **Attention Mode**. When this mode is triggered, the creature will always be within the LOS.
 - **Play Mode**. The creature will walk into LOS and shows excitement (baked animation). In this mode, the user can use a frisbee to play with the creature. Why frisbee? That's because I created the effect to play with the Corgi in AR. 
 - **Attention-to-Play Mode**. Similar to the Attention Mode, the creature responds based on LOS before the frisbee is thrown. The frisbee can be triggered to be thrown in this mode. If the creature's previous mode is the Throw Mode, it will 'drop' and return the frisbee to the user.
 - **Throw Mode**. The frisbee will be thrown in this mode and the creature will start chasing and catch the frisbee.
 - **Reset Mode**. In this mode the user can reset the plane tracker and reposition the creature.
 - **Test Mode**. For testing and debugging purposes only.

In summary, different modes were created so that the user can interact with the AR creature in different modes.
#### movement.js
This script decides how the next actions are being selected based on current mode.
#### userInterface.js
You will find all UI configurations in this script. In short, with these configurations, the user will only see 4 modes:

 - Reset Mode. In this mode the user can reset and Plane Tracker and reposition the creature.
 - Free-and-easy Mode. The creature moves freely.
 - Follow Mode. The creature will follow the user by trying to stay within the camera's LOS.
 - Play Mode. The user can throw a frisbee in any direction and the creature will pick it up and return to the user.

These 'modes' are different from the ones in modes.js because the ones in mode.js are for programming purposes only.
## Adding the creature into the scene
Now that you have understood roughly how the unfinished project was prepared, let's begin by adding the creature's 3D model into the scene.

To do so, drag and drop it into a **Null Object** with the name "DROP_CREATURE-HERE". Make sure that the creature is the child of the ""DROP_CREATURE-HERE" Null Object.

Next, rename the creature that you've added as 'CREATURE'. If you're using the Corgi mode, that means you have to change its name from "Corgi-export-03-actionsRenamed-addedJump" to "CREATURE" (Case sensitive).

## Configuring the creature's mesh
Resize the creature by change the mesh's **scale** property. Please take note that you shouldn't be changing its scale anywhere else such as its parents' scale.

For the Corgi, change its mesh **scale** to 0.25 for all axes. If the Corgi's texture is missing, you can load its texture named 'Corgi' manually. 

## Adding the Frisbee
Next, drag and drop the 'Frisbee' from the **Asset Panel** into the **Scene Panel** at the path:

```...DROP_CREATURE-HERE/CREATURE/Bip003/skeleton/Bip002 Pelvis/Bip002 Spine/Bip002 Spine1/Bip002 Spine2/Bip002 Neck/Bip002 Head/Bone005/```

Then, rename '**Frisbee**' to '**CREATUREFrisbee**'.

Your **Scene Panel** should look like this:

![enter image description here](https://i.ibb.co/LR4WWk4/001-Frisbee.png)

Position the Frisbee so that it appears in between the mouth of the creature. You may use the following Transformation:

![enter image description here](https://i.ibb.co/ScfHJcH/002-Frisbee-transform.png)

Then, hide the Frisbee by unchecking the **Visible** property so that it only appears when the creature caught the Frisbee.

## Creating Animation Playback Controllers
Since the baked animations can only be played using the **Animation Playback Controller**, you need to create an **Animation Playback Controller** for all animations:
1. Click 'Add Asset".
2. Select 'Animation Playback Controller'.
3. Rename it to match the name of the animation.
4. Select its corresponding animation by clicking the dropdown of **Animation Clip**:


	![enter image description here](https://i.ibb.co/qkqZbGK/003-select-animation-clip.gif)
5. Repeat step 1 to 5 for all animations.
6. If you're using the Corgi model, you should have all these **Animation Playback Controllers**:

![enter image description here](https://i.ibb.co/pz3hs6w/004-Animation-playback-controllers.gif)

## Setting up the Patch Editor
In the Patch Editor, all you have to do is drag and drop each **Animation Playback Controller** from the **Asset Panel** into the orange box.

Since there are 4 types of postures, you need to connect each playback controllers to the **Option Picker** based on its posture type.

Next, select 'CREATURE' from the **Scene Panel* and add its **Animation** property into the **Patch Editor** by clicking the tiny right arrow. Once added, connect the output of the last **Option Picker** into the input of the CREATURE Animation Patch.

Your Patch Editor should look like this:

![enter image description here](https://i.ibb.co/ZgRXkF5/005-Patch-Editor.png)

## Creating the Action Look-Up-Table (LUT)
I have created the LUT with the following structure:
```js
	POSTURE_NAME: {
		ACTION_NAME: {name, type, duration, speed, loop, transition, typeNo, actionNo},
	}
```
Basically, the Action LUT contains the details of the animation:

 - **POSTURE_NAME**: I have divided into 4 types of postures: LIE, MOVE, SIT and STAND.
 - **ACTION_NAME**: The specific action name that corresponds to the name of the **Animation Playback Controller**.
 - **name**: Name in String
 - **type**: Posture type in String
 - duration: The duration of the **Animation Clip** in millisecond, which can be obtained by clicking the **Animation Playback Controller** and it will appear near its **Property Panel**.
 - **speed**: If the animation involves moving from one place to another, the speed of the movement needs to be calculated (more on this later).
 - **loop**: A boolean data that specifies whether the animation is loopable.
 - **transition**: A String data that speficies whether the animation is for the transition from one posture to another posture.
 - **typeNo**: Corresponding posture as integer numbers in the 'Type' **Option Picker** in the **Patch Editor**. For example, for LIE, its typeNo is 0; for MOVE, its typeNo is 1 and so on.
 - actionNo: Corresponds to the option numbers of the **Animation Playback Controllers** that are connected to the **Option Pickers** in the **Patch Editor**.

When you open actionLUT.js, you will find only 3 actions included. This is because these 4 are the minimum requirements for the script to work.

In other words, if you are using your own 3D model, you must make sure that your 3D model has the following animations:

 - NIL. Static neutral pose.
 - STAND.IDLE. The default stand idling animation.
 - MOVE.WALK. The default walk cycle animation.

Optionally, I also highly recommend that you include a 'MOVE.RUN' animation so that the creature can move faster when needed.

If your 3D model does not have a custom running animation, you can duplicate its walking **Animation Playback Controller** and change its speed to 200%. Then, reduce its duration in the actionLUT by 50%.

## Determining the speed of moving actions
The purpose of the calculation is to prevent the creature from 'sliding' if the wrong speed is used. To calculate the speed of each moving actions:
1. Download and open this [project file](https://drive.google.com/file/d/12GVpE3VbCzW7JHLWWj5iJs6r74NiYoPd/view?usp=sharing).
2. Import the same creature's 3D model (You can also use pre-imported the Corgi 3D model)
3. Drag and drop the creature's 3D model to be the child of planeTracker0.
4. Change its scale to be the same as your previous project (0.25 for the Corgi).
5. Create an **Animation Playback Controller** and load one of the moving animations.
6. Add the **Animation Playback Controller** into the **Patch Editor**.
7. Add the 3D creature's **Animation** and **Position** properties into the **Patch Editor**.
8. Connect the output of the **Animation Playback Controller** Patch into the input of the **Animation** Patch.
9. Connect the output of **Transition** patch to the input of the **3D position** Patch.
10. Change view to **Orthographic Projection** and click again to view from **Right** side.
11. Tweak the **duration** property of the **Loop Animation** Patch until the creature stops sliding with its moving animation.
12. The **SPEED** of this moving action equals to distance / duration. Since I have set the distance to be 2 units, the speed of this moving action will be 2 divided by the duration taken (sec) to complete the animation loop.

If you are using the Corgi 3D model, your **Patch Editor** will look like this:

![enter image description here](https://i.ibb.co/1fMhFy1/006-speed-patch-editor.png)

To illustrate the process of determining the speed, you will see the following if the speed is

**Too fast**

![enter image description here](https://i.ibb.co/gv4Q2Fz/tooFast.gif)

**Too slow**

![enter image description here](https://i.ibb.co/BqN3PJ0/tooSlow.gif)

**Just nice**

![enter image description here](https://i.ibb.co/zhy4BrL/justNice.gif)

If the speed is correct, the creature will appear walking on the surface without sliding. Repeat the steps above To find the speed for each moving actions.

## Finalizing the Action LUT
If you are using the Corgi 3D model, your actionLUT should look like this:
```js
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
```
## Configuring the behaviours
Alright, this is the most tedious part of the entire project, but I think it's also the most fun part because you'll get to define the behaviour of the creature by using **Weighted Random Distribution.**

### Understanding weighted random distribution
Basically, the selection of the next action is *random*. For example, let's say that the creature's current action is STAND.IDLE, and it has only 3 choices for its next action: 

 - STAND.IDLE,
 - MOVE.WALK or 
 - LIE.IDLE.

If we use a standard [Random Number Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random) to generate 0, 1 or 2 to represent STAND.IDLE, MOVE.WALK and LIE.IDLE respectively, then all 3 options will share the same probability of 0.33. This is because the Math.random() function uses ***uniform*** distribution based on the specified range of numbers.

While it's straightforward to implement random behaviours by using a Random Number Generator with uniform distribution, we know that creatures behaviour aren't that random after all because of their characters. For example, if the creature is a very active dog, then it is more likely to use MOVE.WALK as its next action as compared to the less active actions such as STAND.IDLE and LIE.IDLE.

This is where we can **Weighted Random Distribution** to *define each action's probability*, where some actions has higher chances to be the next action. For example, if the creature is an active dog with the current action of STAND.IDLE, then it's next action is more likely to be defined withe the following probability:

 - STAND.IDLE: 0.3
 - MOVE.WALK: 0.7
 - LIE.IDLE: 0.2

While the numbers may seem arbitrary, they are actually defined based on the dog's active character and behaviour. For instance, since the dog is already standing and idling, it is way more likely to walk than to remain stand idling and to lie down. Furthermore, as an active dog, it is still more likely to remain stand idling than to lie down. That's why LIE.IDLE has the lowest probability among the 3 actions.

### Implementing Weighted Random Distribution for static postures
To implement Weighted Random Distribution, I used the JavaScript function developed by the user [maerics](https://stackoverflow.com/users/244128/maerics) from Stackoverflow [here](https://stackoverflow.com/questions/8435183/generate-a-weighted-random-number/8435577).

Next you need to configure the following functions in **actions.js** to define the creature's static posture behaviour:

```js
	moveOrStandNext();
	randomLie();
	randomSit();
	randomStand();
```
Basically, you need to:
1. Configure each static actions' as a switch statement, one by one.
2. Indicate all possible nextActionName within the **weightedRand()** function.
3. Set the probability values for all possible nextActionName. Note that the sum of all probability values must be 1.

Since the Corgi is a rather complex example and you may find it to troublesome to configure each actions manually, I have pre-configured its behaviour in all 4 functions in **action.js**. All you have to do is to tweak its nextActionName's probability. You can even leave it as it is as I have configured them based on a typical dog's behaviour.

#### Additional steps if you are using your own 3D model
If you are not using the Corgi 3D model, you can proceed to define the 4 functions by using the **weightedRand()** function. If your 3D model doesn't have some of the posture types, you can leave the functions blank. Note that you MUST define **randomStand()** and **moveOrStandNext()** functions.

Once you have configured the behaviour, you need to define the following get functions:
```js
	getNextLieAction();
	getNextSitAction();
	getNextStandAction();
```
These get functions will retrieve the Actions based on the nextAction String selected by the **weightedRand()** function.

In addition, you also need to configure the **generateStaticPlayAnimation()** function. This is because we also have a PLAY mode, where the creature will wait for you to throw the frisbee.

As a reference, the following is the configuration for the Corgi:
```js
export  function  generateStaticPlayAnimation(){
	var  nextExcitedAction;
	let  nextExcitedActionName = weightedRand({
	standIdle:  0, //default
	standBark:  0.3, //excitedAnimation1
	standBarkExcited:  0.5, //excitedAnimation2
	standBarkHappy:  0.2  //excitedAnimation3
	});
	nextExcitedAction = getNextStandAction(nextExcitedActionName());
	generateStaticExcitedAnimationFor(nextExcitedAction); //same as generateStaticAnimationFor() but WITH an orientation that is facing the device
	return  nextExcitedAction;
}
```

If your creature doesn't have any 'excited' animation, you can use any STAND action as the 'waiting' action for the user to throw the frisbee. STAND.IDLE will work too (although you wouldn't sense any excitement from the creature to play with you):

```js
export  function  generateStaticPlayAnimation(){
	var  nextExcitedAction;
	let  nextExcitedActionName = weightedRand({
	standIdle:  1, //default
	});
	nextExcitedAction = getNextStandAction(nextExcitedActionName());
	generateStaticExcitedAnimationFor(nextExcitedAction); //same as generateStaticAnimationFor() but WITH an orientation that is facing the device
	return  nextExcitedAction;
}
```
### Configuring behaviour for dynamic postures
You might have noticed that in the previous section, we didn't configure any **MOVE** actions. This is because **MOVE** action is only influced by the **moveOrStandNext()** function. However, we still need to configure what type of **MOVE** action depending on the distance that the creature has to travel. In other words, if the creature needs to move over a long distance, a fast moving action such as **MOVE.RUN** will be loaded instead of **MOVE.WALK**. The following is the pre-configured function for **getMoveAction()** for the Corgi 3D model:

```js
export  function  getMoveAction(distance){
	if (distance < 0.001) {
	return  Actions.STAND.IDLE;
	} else  if (distance > 0.001 && distance <= 1) {
	return  Actions.MOVE.WALK;
	} else  if (distance > 1 && distance <= 2) {
	return  Actions.MOVE.WALKFAST;
	} else  if (distance > 2 && distance <= 3) {
	return  Actions.MOVE.RUN;
	} else  if (distance > 3) {
	return  Actions.MOVE.LEAP;
	}
}
```
As mentioned earlier, if you're using your 3D model and the model doesn't have any baked animation for different running speed, you can duplicate its walking **Animation Playback Controller** and change its speed to 200%. Then, reduce its duration in the actionLUT by 50%.

## Debugging
If you've encountered a problem when following this tutorial, you can download the finished project [here](https://drive.google.com/file/d/1g25pBdq8Rjvv8_eHQ62ra-KzykIuTJyT/view?usp=sharing) as a reference.

## Testing the AR Creature effect
With the UI being configured, you can launch the effect by clicking **play** in Spark AR Studio or test it in your own mobile device.

## Going Beyond
If you are interested in modifying this project, please feel free to do so. You may find the following logic flowchart useful as you modify the project scripts:

![enter image description here](https://res.cloudinary.com/devpost/image/fetch/s--_R4OAyIw--/c_limit,f_auto,fl_lossy,q_auto:eco,w_900/https://iili.io/22upSt.jpg)
Thank you for reading this tutorial and I hope that you enjoyed bring 3D creatures to life in Spark AR as much as I do!

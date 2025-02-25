
+++
title = 'Adding Mouse control functionality to the Bad USB on the Flipper Zero'
author = "Ryan Peel"
date = '2012-02-19'
draft = false
description = "I often found myself automating various functionality and wanting to be able to trigger a mouse click. This project added basic mouse functionality to the BadUSB App on the Flipper Zero"
tags = [
    "Flipper Zero", 
    "C/C++", 
    "BadUSB"
]
categories = [
    "Mini Projects",
]
series = ["Flipper Zero"]
aliases = ["flipper-zero-badmouse"]
toc = true
+++


# Flipper Zero BadUSB Mouse Implementation 
#BadMouse  #Projects


# BadUSB: Mouse Control

I often found myself automating various functionality and wanting to be able to trigger a mouse click. This project added basic mouse functionality to the BadUSB App on the Flipper Zero. Additionally this makes mouse movement more accessible for research on how this type of movement can be used in a security sensitive environment.

The contents of this post are, for the most part,  simply the contents of the [Pull Request](https://github.com/flipperdevices/flipperzero-firmware/pull/4004])
## What's new

Several new mouse commands:
- LEFTCLICK
- RIGHTCLICK
- MOUSEMOVE
- MOUSESCROLL

The Documentation was also updated to reflect the changes

Additionally I implemented functionality for the Middle click (often the mouse wheel button) but in my testing it seemed to only work intermittently. 

## Verification 

I found the easiest way to visualize the mouse movements was to use minecraft as that will show the movements very easily. My script here includes the MIDDLECLICK function, but as you see that does not work yet. If I get some more time int he future I'll look into why that does not work as expected and create an PR for that.

<details>
<summary>Demo Script</summary>

``` 
REM Testing Mouse Functions

DEFAULT_DELAY 1000

STRING t
STRING LEFTCLICK
ENTER
DELAY 1500
LEFTCLICK

STRING t
STRING RIGHTCLICK
ENTER
DELAY 1500
RIGHTCLICK

STRING t
STRING MIDDLECLICK - has been mapped to select slot 5 on the game hot bar
ENTER
DELAY 1500
MIDDLECLICK

STRING t
STRING MOUSESCROLL
ENTER
MOUSESCROLL 1
REPEAT 4
MOUSESCROLL -1
REPEAT 4

STRING t
STRING MOUSE_SCROLL
ENTER
MOUSE_SCROLL 2
MOUSE_SCROLL -2

STRING t
STRING MOUSEMOVE
ENTER 
MOUSEMOVE 50 0
REPEAT 8
MOUSEMOVE 0 50
REPEAT 8
MOUSEMOVE -50 -50
REPEAT 8

STRING t
STRING MOUSE_MOVE
ENTER 
MOUSE_MOVE 50 0
REPEAT 8
MOUSE_MOVE 0 50
REPEAT 8
MOUSE_MOVE -50 -50
REPEAT 8


STRING t
STRING HOLD LEFT_CLICK
ENTER
HOLD LEFT_CLICK
DELAY 5000
RELEASE LEFT_CLICK

MOUSEMOVE 500 -100

STRING t
STRING REPEAT
ENTER
STRING 2
RIGHT_CLICK
REPEAT 3

STRING t
STRING TESTING DONE
ENTER
```
</details>

A Short video of running this script:

[https://youtu.be/hi02vP7v6do](https://youtu.be/hi02vP7v6do)

---
# Follow up on the changes requested

After the initial review i agreed that my code needed some changes, to be honest. I don't really know what i was thinking when i wrote that code for the hold functionality. I was pretty bad.


The hold and release functions have both been reworked to remove the bug preventing keyboard hold functionality. They should both be much more readable now also. I tried to keep it clear when working on Keyboard vs mouse keys.  

[Updated Demo Video](https://youtu.be/dAm6TCgmsD8) 

In the video we do not see the scroll down register since the web page does not have space to scroll. you can also see that the middle click is working though it seems like it works best when the middle click is held for a short time.. 

<details>
  <summary>Demo Script Used</summary>
  ```
  ID 1234:abcd Generic:USB Keyboard
  REM Declare ourselves as a generic usb keyboard
  REM You can override this to use something else
  REM Check the `lsusb` command to know your own devices IDs
  
  DEFAULT_DELAY 200
  DEFAULT_STRING_DELAY 100
  
  STRING qwertyuiop
  STRING asdfghjkl
  STRING zxcvbnm
  STRING 1234567890
  
  DELAY 1000
  
  REM Test all mouse functions
  LEFTCLICK
  RIGHTCLICK
  MIDDLECLICK
  
  DELAY 1000
  
  MOUSEMOVE -10 0
  REPEAT 20
  MOUSEMOVE 0 10
  REPEAT 20
  MOUSEMOVE 10 0
  REPEAT 20
  MOUSEMOVE 0 -10
  REPEAT 20
  
  DELAY 1000
  
  MOUSESCROLL -50
  MOUSESCROLL 50
  
  DELAY 1000
  
  REM Verify Mouse hold working
  HOLD LEFTCLICK
  DELAY 2000
  RELEASE LEFTCLICK
  
  DELAY 1000
  
  REM Verify KB hold working
  HOLD M
  DELAY 2000
  RELEASE M
  
  ENTER

</details>

[Testing Website](https://shawon9324.github.io/apps/keytester/)
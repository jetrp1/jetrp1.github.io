+++
title = 'OverTheWire - Bandit'
author = "Ryan Peel"
date = '2024-01-13'
draft = false
description = "A few months back I completed the Bandit CTF box from over the wire. I thought I would post my notes here."
categories = [
    "Capture the Flag",
]
tags = [
    "CTF", 
    "Linux",
]
aliases = ["Bandit-CTF",]
toc = false
+++

## Some Notes

A few months back I completed the Bandit CTF box from over the wire. I thought I would post my notes here. Of course please do not use this information to cheat, but please use my experiences to learn.

Another note: I have removed all the passwords and ssh keys.  

My scores can be found at: [https://www.wechall.net/profile/jetrp1](https://www.wechall.net/profile/jetrp1)

## Bandit

```
Level 1 - overview and basic rules . . . 
- Password: <REDACTED>

Level 2 - reading a tricky file name
- use the full filepath and not just the file name
- Password: <REDACTED>

Level 3 - Spaces in this file name
- put the file name in quotes 
- Password: <REDACTED>

Level 4 - Hidden File
- Password: <REDACTED>

Level 5 - only human readbale file
- run file on each file in the dir to find the right file
- Password: <REDACTED>

Level 6 
- Password: <REDACTED>
- Command to find file: "find . -perm 640 -size 1033c -exec file '{}' \;"

Level 7 
- Password: <REDACTED>
- uid of bandit7:11007
- gid of bandit6:11006
- used command: find . -uid 11007 -gid 11006 -size 33c

Level 8
- Password: <REDACTED>
- grep for keyword millionth

Level 9
- Password: <REDACTED>
- command used: sort data.txt | uniq -u

Level 10
- Password: <REDACTED>
- ran strings | grep '==='

Level 11
- Password: <REDACTED>
- ran base64 -d data.txt

Level 12
- Password: <REDACTED> 
- ROT13 Cipher
- ran cat data.txt | tr 'A-Za-z' 'N-ZA-Mn-za-m'

Level 13
- Password: <REDACTED>
- there are 9 layers of compression/obfuscation used here
- using the file command helped a lot to identify what types of compression were being used
- final command used: 'cat data.txt | xxd -r | gunzip -c | bunzip2 -c | gunzip -c | tar -xO | tar -xO | bunzip2 -c | tar -xO | gunzip -c'

Level 14 
- Password: <REDACTED>
- Private SSH Key:
-----BEGIN RSA PRIVATE KEY-----
<REDACTED>
-----END RSA PRIVATE KEY-----

Level 15
- Password: <REDACTED>
- Ran: cat /etc/bandit_pass/bandit14 | nc localhost 30000

Level 16
- Password: <REDACTED>
- Ran: openssl s_client -connect localhost:30001
- Pasted password from level 15 

Level 17
- Password: <REDACTED> 
- Port Scan: nmap localhost -p31000-32000
- finding ports that do not require SSL
  for i in {31046,31518,31691,31790,31960} ; do echo <REDACTED - Previous Password> | nc localhost $i ; done ;

  ports 31046, 31691, 31960 all returned the password
  
  for the SSL checks i ran: 'for i in {31046,31518,31691,31790,31960} ; do echo Port $i ;  echo <REDACTED - Previous password> | openssl s_client -connect localhost:$i ; echo '' ; done ;'

  ports 31518 and 31790 use SSL
  tried connecting to each machine, the machine on port 31790 responds with an incorrect password message
  since the prior password starts with a k the system interprets this as a command. adding the -quiet flag solved this issue.
  Getting the correct key returned a RSA private key:

-----BEGIN RSA PRIVATE KEY-----
<REDACTED>
-----END RSA PRIVATE KEY-----

Level 18
- Password: <REDACTED> 
- diff on both password files

Level 19
- Password: <REDACTED>
- piped 'cat readme' into the ssh command

Level 20 
- Password: <REDACTED>
- ran: ./bandit20-do cat /etc/bandit_pass/bandit20

Level 21
- Password: <REDACTED>
- split the screen using tmux
- listener: echo <REDACTED - previous password> | nc -l 5000
- ran: ./suconnect 5000
- Password was printed on listening side

Level 22
- Password: <REDACTED>
- pulled script from logs and read script

Level 23
- Password: <REDACTED>
- retrieved from script

Level 24
- Password: <REDACTED>
- created a script to cat the password into a different file
- watch out or permissions issues

Level 25
- Password: <REDACTED>
- python script to print all the lines to a text file then send that via nc to the server

Level 26:
- Password: <REDACTED>
- Non standard shell: /usr/bin/showtext
- provided ssh key: 
-----BEGIN RSA PRIVATE KEY-----
<REDACTED>
-----END RSA PRIVATE KEY-----

- This "shell" is a bash script which uses the more command. 
- v open ths file in vim
- :e "somefilehere" open another file in vim - used this to get the password
- from vim again: :shell will retunr us to the shell, but we need to change the default shell first
- :set shell=/bin/bash should do the trick

Level 27
- Password: <REDACTED>
- used the badit27-do script in the badit26 home dir

Level 28
- Password: <REDACTED>
- cloned the report appending :2220 to the ssh hostname to adjust the port number

Level 29
- Password: <REDACTED>
- Colned the repo, rolled the repo back to prior commit with the password visible

Level 30
- Password: <REDACTED>

Level 31
- Password: <REDACTED>
- password found in a git tag called secret

Level 32
- Password: <REDACTED>
- Followed instructions in git repo

Level 33
- Password: <REDACTED>
- $0 returns the command that started the current program, if we pass $0 as the input then we get the name of the current program as the input, being the shell

Level 34
- Does not exist yet

Level 34
```
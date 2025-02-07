+++
title = 'Setting up a new VPS'
author = "Ryan Peel"
date = '2025-01-28'
draft = false
description = "My home internet has no easy way for a public connection. I am behind a double NAT and I am not authorized to make changes to the second router's connection. There are many solutions to this problem, all with their pros and cons. I chose to use a VPS running reverse proxy software."
tags = [
    "Docker", 
    "VPS", 
    "CyberSecurity"
]
categories = [
    "Software",
    "Homelab",
]
series = ["Homelab"]
aliases = ["Setting up docker"]
toc = true
+++


**A note to consider:** This VPS and my environment is always changing. This is a very basic overview of the initial setup the the node and some of the few security considerations that were considered / implemented.

# Setting up a new VPS   
   
My home internet has no easy way for a public connection. I am behind a double NAT and I am not authorized to make changes to the second router's connection. There are many solutions to this problem, all with their pros and cons. I chose to use a VPS running reverse proxy software. So this post is to document the setup and configuration of that system and what security mitigation I implement.   
   
## The VPS Specs   
Choosing the right VPS host is quite important as well as the specs of that specific VPS. I only have a few requirements:   
  1. Needs to be relatively local to me. (same US state or close by)   
  2. Minimum 1 tb monthly bandwidth   
  3. Low Cost   
  4. fairly high availability 99.9% SLA or better   
i did a lot of searching to find what best fits my needs when i came across Oracles cloud always free tier services. i understand that this does not meet my SLA requirement, but it meets all of my other requirements and I get a significant performance improvement being able to spin up a 4 core 24gb ram arm instance. This will let me do a lot more then what i have originally intended, so i will give this system a try.   
   
## Requirements   
So lets talk about requirements, what does this system need to run? I have several services i want to run on here, all of these can be run in docker containers. I'll use portainer to manage this as it is a tool i am already familiar with. Additionally I will have a VPN tunnel back to my homelab for any services that need home access.     
Additionally I want to be able to easily monitor this system for several things. So ill need a dashboard and monitoring tools. Something like grafana or checkmk could work well for this, but setting that up is  outside the scope of this psot. I'll make another post on that once I have that setup   
   
## Security Considerations   
This system will need to have a bit more protections than any of my other machines. Specific requirements I want to implement are listed below.   
- All admin panels should only be accessible from the lab network or tailscale   
- All inbound traffic should go through the reverse proxy hosted on the VPS (except in very specific cases)   
- All traffic to my lab needs to travel through the VPN tunnel.   
- since this machine will be on my personal tailnet it should only be able to make connections to the single designated host on the lab network. (I'll use tailscale ACLs for this).   
   
   
Some other tools I want to use include:    
- tripwire (file integrity)   
- snort (IDS/IPS)   
   
Setup for these will be included in another post.   
   
   
## Installation   
   
**Updates**   
After starting the VPS i have found it to be good practice to make sure the system is updated   
```
sudo apt update
sudo apt upgrade
sudo reboot

```
   
**Installing favorite tools/aliases**   
These are just some personal preferences and things I like to use. You can modify and change things to your taste.   
```
sudo apt install tmux vim

echo "alias ls='ls -lth --group-directories-first --color=auto'" >> ~/.bash_aliases
echo "alias lsa='ls -Alrh --group-directories-first --color=auto'" >> ~/.bash_aliases

```
A logout and login or reboot may be required based on what you setup here.   
   
**Installing Tailscale**   
Tailscale will be configured as an exit node and we will allow ssh access through tailscale as well. Additionally some configuration needs to be enabled for this to work properly.   
```
# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

# IP forwarding - networkd-dispatcher config
printf '#!/bin/sh\n\nethtool -K %s rx-udp-gro-forwarding on rx-gro-list off \n' "$(ip -o route get 8.8.8.8 | cut -f 5 -d " ")" | sudo tee /etc/networkd-dispatcher/routable.d/50-tailscale
sudo chmod 755 /etc/networkd-dispatcher/routable.d/50-tailscale

# Configure tailscale
sudo taiscale up --advertise-exit-node --ssh
```
   
## Installing Docker   
for the docker install simply follow the recommended steps on docker's documentation website.   
```
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Install Docker
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-pluginsudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify with the Hello World image
sudo docker run hello-world

```
   
## Adding this machine to my portainer cluster   
This was probably the easier part of this whole operation. i went into the portainer dashboard on my existing install, went to the environments page and hit add environment. then i selected the docker standalone options and then opted to use a portainer agent running on the VPS. I ran the docker run script provided and provided the name and connection info and that was all it took!   
## Security Modifications   
Firewall rules in the VPS subnet prevent anything but ports 80 and 443 from accessing the VPS. All SSH is done though the tailscale connection. see  [https://tailscale.com/kb/1193/tailscale-ssh](https://tailscale.com/kb/1193/tailscale-ssh)  for more info.    
   
All HTTP traffic going in or out of the nodes travel through Nginx Proxy Manager which is a container i spun up on the VPS. I only proxy when I want visible so that takes care of preventing admin interfaces being accessible.   
   
The home network is not publicly accessible since it is behind a double NAT and the firewall is set to block all incoming connections. The VPS can reach the other portainer host through tailscale using the below ACLs. By these same ACLs the VPS cannot reach any other machines in the lab.   
   
   
**tailscale ACLs:**   
Here are the tailscale ACLs i am using to make sure that this machine can only connect to machines it needs access to. Please note that this is not the entire ACL document.   
```
		{
			// Allow Workstations to access all machines
			"action": "accept",
			"src": ["tags:personal-workstations"],
			"dst": ["*:*"]
		},
		{
			// Allow portainer hosts to communicate between each other and the storage systems
			"action": "accept",
			"src":  ["tags:portainer-hosts"],
			"dst":  ["tags:portainer-hosts:*", "tags:storage-hosts:*"],
		}


```
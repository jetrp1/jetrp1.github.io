+++
title = 'Replacing the Dell H730 with a Dell H330 in my Lab Server (Dell R730xd)'
author = "Ryan Peel"
date = '2024-12-15'
draft = false
description = "Flashing a Dell Perc H330 Mini Mono to HBA330 firmware"
tags = [
    "Updating Firmware", 
    "Dell H330", 
    "ZFS"
]
categories = [
    "Hardware",
]
series = ["Hardware Upgrades"]
aliases = ["replacing-h730"]
toc = true
+++

#### A correction to the previous version

When I wrote this post I was under the understanding that the Dell H730 would not support ZFS, even in its RAID mode. Some commenters in a recent reddit [post](https://www.reddit.com/r/homelab/comments/1ixpfed/flashing_h330_over_to_hba330_link/) have shared that this is not the case. while I have not tested this yet myself it seems that i was wrong. The Flashing process is the same though and i can verify that that does work since i have ben using that card since i flashed it back in December.

*This edit was made on Feb 25 2025*

### Why
My primary lab server is a Dell R730xd, it came with a Perc H730 raid card which works quite well as a hardware raid card. The Dell 730 is a great raid card, it has features such as a battery backed cache, write-back caching, and supports a great selection of raid levels, what it does not do is give me direct access to the drives. I want to use ZFS on my system and this presents a problem. I recently purchased a Dell H330 Mini Mono off eBay to replace my H730 raid card. While this card has fewer features it can be flashed with IT mode firmware which will give direct access to the drives, perfect for my ZFS needs. Here are the steps I took to install the card and get it flashed with the HBA330 firmware: 

### The Plan
1. Backup all the VMs currently on the server
2. Verify that the new H330 is working by installing and checking in iDrax
3. Flash the H330 to HBA330
4. Test the new firmware using another Ubuntu live boot
	Primary test is if i can read SMART data, something I cannot do with the H730
5. Install Proxmox
6. Restore VMs from backup

### Backing up the VMs
This process was straightforward but required some improvisation. My server has two RAID arrays managed by the H730, so I couldn’t use any of the existing storage for backups. Without a network storage solution available, I added a standalone drive.
I used an old NVMe drive in a USB 3.0 enclosure. After connecting it to the USB 3.0 ports on the back of the server, I initialized the drive in Proxmox and created a directory storage. Then, I ran full backup jobs for each VM onto the drive and also copied any ISO images uploaded to the server. Once backups were complete, I shut down the Proxmox host to proceed with the upgrade.

### Verify the new H330
After rearranging my setup to access the server, I ensured the relocated router maintained connectivity and connected a VGA monitor. Then, I powered down the system and installed the H330. The steps were as follows:
1. Remove the CPU airflow cover.
2. Remove the PCIe riser.
3. Unscrew and remove the H730 RAID card.
4. Install the H330 in reverse order.
This video shows how to install the drive if you need more specific direction.
Once installed, I booted into the Dell Lifecycle Controller, where the H330 was successfully recognized. To test functionality, I created a basic RAID setup and booted the system into an Ubuntu live session using a USB drive. The drives were visible in Ubuntu, confirming the H330 was operational.

### Flash the HBA330 firmware
Finding instructions for flashing this card proved to be harder than anticipated. I found quite a few pages and forum posts where folks stated that flashing to IT mode was possible but all of them linked to a Serve The Home [forum post](https://forums.servethehome.com/index.php?threads/flash-crossflash-dell-h330-raid-card-to-hba330-12gbps-hba-it-firmware.25498/) by Sleyk that was no longer posted on the website. Luckily the site was archived by the Wayback machine and can be found [here](https://web.archive.org/web/20191125221656/https://forums.servethehome.com/index.php?threads/flash-crossflash-dell-h330-raid-card-to-hba330-12gbps-hba-it-firmware.25498/). Sleyk talks about a Zip folder and a write up, the write up is still available at his google drive [link](https://drive.google.com/file/d/165GJchhTt_mZI0ewLP1p34CrvesmMZHL/view), but the zip folder is not. After doing a bit of searching I finally found a copy of the zip folder, to make it more accessible I have re-uploaded it [here](https://drive.google.com/file/d/112F2tjWA2YSZP4qCjhfjRafJsYU4A7Wz/view?usp=sharing). 

Before anyone attempts this process I highly recommend that you read the entire write-up, there are several steps where if you do not understand what is happening and what the next steps are you might make a mistake. I am not responsible for any damages or losses you may incur if this process fails. After I read the entire document and had gotten the necessary tools ready I followed the "compact steps II" that start on page 16 of the write-up. Since I did not follow Sleyk's steps exactly I have included the steps I took and a bit of commentary to help with some anxiety one might experience. 

The Steps I took
1. Creating the FREEDOS usb drive, Rufus makes this really easy. I use Ubuntu as my primary OS and I don't have any machines that run windows. its easy to create a bootable drive in Linux, but expanding that drive to fill the entire usb I had was proving to be a challenge. So to make life easier I used a family Member's windows machine.
After this I used windows disk manager to assign a drive letter to the usb so that I could copy my files over. When copying the files, I replaced the firmware and rom files that are used in step 11 with the files for the Mini Mono card.

2. I have already installed my H330 card into my machine, if you have not, please do that now. 
3. Now we need to grab the card info, the most important part is to grab the SAS address. I grabbed this when I was in the Dell Lifecycle Controller earlier. But just to be on the safe side i dumped the card info now as well. 

```
megacli -adpallinfo -a0 > h330info.txt
```

4. Flash the H330 card with the SMC3108.rom. Don't worry, this ROM is universal for these devices since the SMC3108 is used on all of these cards, this was a point of anxiety for me.
```
megacli -adpfwflash -f smc3108.rom -noverchk -a0
```
5. reboot. for some reason the reboot command did not reboot my machine, hitting CTRL+ALT+Delete did the trick for me.
6. Be Patient! I recommend starting a timer for this. I found that for me it took around 3 1/2 minutes since the Dell lifecycle controller had some steps it took along with the the H330 enumerating. It was hard to tell when exactly the H330 started its process so as the write-up says, be Patient.
7. Now we need to write all Zeros to the flash, this helps to make sure that there is not extra data that will create issues when we write the firmware later. 
```
megarec3 -writesbr 0 sbrempty.bin
```
8. Now we clean the flash again
```
megarec3 -cleanflash 0
```
9. Reboot again. I used CTRL+ALT+DEL again.
10. & 11. I combined these two and used the one liner command from step 11 in the write-up making sure i was using the firmware and bios files for the Mini Mono version of the card. 
```
sas3flsh -list
sas3flsh-o -f hba330.fw -b mptx64.rom
```
12. Now to program the sas address:
```
sas3flsh -o -sasadd <your-sas-address-here>
```
13. To verify that the process was successful from FREEDOS we run:
```
sas3flsh -listall
```

### Final Steps
Finally I slot in the GPU (why is it such a tight fit?? this was the hardest part of this whole process) and boot into the proxmox installer. I'm not going to to explain all the steps for installing proxmox as its rather straight forward and there are already many guides out there. 
Once back in proxmox I connected my USB drive, in the proxmox gui I created a new directory storage. Then from the shell I mounted the drive and set the mount point for that storage.

```
mount /dev/sdo1 /mnt/backupSSD
pvesm set <storage-id> —ismountpoint /mnt/backupSSD
```
From here I was able to restore the backups I previously made using the GUI.

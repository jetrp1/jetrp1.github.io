function typingAnimation(messageContent, el, printingDelay, deletingDelay, printedDelay, deletedDelay) {
    let currMsg = 0;
    let i = 0;
    let isDeleting = false;

    function typeAndErase() {
        if (!isDeleting && i < messageContent[currMsg].length) {    // Print String
            el.innerHTML = el.innerHTML + messageContent[currMsg].charAt(i);
            i++;
            setTimeout(typeAndErase, printingDelay);
        } else if (!isDeleting && i === messageContent[currMsg].length) {          // Completed Printing
            isDeleting = true;
            setTimeout(typeAndErase, printedDelay); 
        } else if (isDeleting && i > 0) {                           // Delete String
            el.innerHTML = messageContent[currMsg].substring(0, i - 1);
            i--;
            setTimeout(typeAndErase, deletingDelay);
        } else {                                                    // Swap to Next Message
            isDeleting = false;
            currMsg = (currMsg + 1) % messageContent.length;
            setTimeout(typeAndErase, deletedDelay);
        }
    }
    typeAndErase();
}

let messages = [
    'Software Engineer.',
    'Security Engineer.',
    'System Admin.',
    'Tech Enthusiast.',

];
const elm = document.getElementById("subHead");
typingAnimation(messages, elm, 110, 75, 5000, 500);
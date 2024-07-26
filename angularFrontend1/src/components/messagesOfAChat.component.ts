import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'MessagesOfAChat',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/MessagesOfAChat.component.html',
    styleUrl: '../styles.css'
})
export class MessagesOfAChat {
    
    messages: Array<Array<Object>> = [
        ["rishavry", "Hey man, how's it going?", new Date(2024, 4, 15, 10, 30, 0)],
        ["rishavry2", "Good man, what about you", new Date(2024, 4, 15, 10, 30, 30)],
        ["rishavry2", "Really dude? Start it and then have me double text?", new Date(2024, 4, 15, 11, 50, 0)],
        ["rishavry", "Well I was actually hoping you'd triple text but it turns out you have more self-respect than that lol", new Date(2024, 4, 15, 11, 51, 0)],
    ];
    replies: Array<number> = [
        -1,
        2,
        -1,
        -1,
    ];
    reactions: Array<Array<string>> = [
        ["❤️"],
        [],
        [],
        ["😭", "🖕"]
    ];
    reactionUsernames: Array<Array<string>> = [
        ["rishavry2"],
        [],
        [],
        ["rishavry", "rishavry2"]
    ];
    @Input() authenticatedUsername!: string;
    @Input() messageRecipientInfo!: Array<string>;
    messageToSend: string = "";
    @ViewChild('scrollMe') private myScrollContainer!: ElementRef;
    hoveredIndex: number | null = null;
    textareaPlaceholder:string = "Message..."
    messageIndexToReplyTo:number = -1;
    currentlyShownReactionPanel:number = -1;
    currentlyShownOptionsPanel:number = -1;
    @Output() notifyParentToShowMessageReactions: EventEmitter<Array<Array<string>>> = new EventEmitter();

    showMessageReactionsPopup(index: number) {
        this.notifyParentToShowMessageReactions.emit([this.reactions[index], this.reactionUsernames[index]]);
    }
    
    displayIconsOfTextarea() {
        return this.messageToSend.length == 0 ?
        {
            'display': 'inline-block'
        } :
        {
            'display': 'none'
        };
    }

    displaySendMessageText() {
        return this.messageToSend.length > 0 ?
        {
            'display': 'inline-block'
        } :
        {
            'display': 'none'
        };
    }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['messageRecipientInfo']) {
            this.scrollToBottom();
            this.messageIndexToReplyTo = -1;
            this.textareaPlaceholder = "Message...";
        }
    }

    scrollToBottom(): void {
    try {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) {
        console.error(err);
    }
    }

    sendMessage() {
        this.messages.push([this.authenticatedUsername, this.messageToSend, new Date()]);
        this.replies.push(this.messageIndexToReplyTo);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
        this.messageToSend = "";
        this.messageIndexToReplyTo = -1;
        this.textareaPlaceholder = "Message..."
    }

    sendHeart() {
        this.messages.push([this.authenticatedUsername, "❤️", new Date()]);
        this.replies.push(this.messageIndexToReplyTo);
        this.reactions.push([]);
        this.reactionUsernames.push([]);
    }

    onMouseEnter(index: number): void {
        this.hoveredIndex = index;
    }
    
    onMouseLeave(): void {
        this.hoveredIndex = null;
    }

    formatDate(date: any) {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear().toString().slice(-2);

        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;


        const formattedDate = `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;

        return formattedDate;
    }


    isMoreThan60MinutesLater(currentDate: any, previousDate: any): boolean {
        const diffInMilliseconds = currentDate.getTime() - previousDate.getTime();
        const diffInMinutes = diffInMilliseconds / (1000 * 60);
        return diffInMinutes > 60;
    }

    replyToMessage(index: number) {
        if(this.messageIndexToReplyTo==index) {
            this.messageIndexToReplyTo = -1;
            this.textareaPlaceholder = "Message...";
            return;
        }
        this.textareaPlaceholder = "Replying to " + this.messages[index][0] + ": " + this.messages[index][1]
        this.messageIndexToReplyTo = index;
    }

    onDoubleClickingMessage(index: number) {
        this.addReaction(index, "❤️");
    }

    addReaction(index: number, reaction: string) {
        this.reactions[index].push(reaction);
        this.reactionUsernames[index].push(this.authenticatedUsername);
    }

    showReactionPanel(index: number) {
        if(this.currentlyShownReactionPanel==index) {
            this.currentlyShownReactionPanel = -1;
            return;
        }
        this.currentlyShownReactionPanel = index;
        this.currentlyShownOptionsPanel = -1;
    }

    showOptionsPanel(index: number) {
        if(this.currentlyShownOptionsPanel==index) {
            this.currentlyShownOptionsPanel = -1;
            return;
        }
        this.currentlyShownOptionsPanel = index;
        this.currentlyShownReactionPanel = -1;
    }

    copyToClipboard(textToCopy: any) {
        navigator.clipboard.writeText(textToCopy).then(() => {
        this.currentlyShownOptionsPanel = -1;
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }

    deleteMessage(index: number) {
        this.messages.splice(index, 1);
        this.replies.splice(index, 1);
        this.reactions.splice(index, 1);
        this.reactionUsernames.splice(index, 1);
        this.currentlyShownOptionsPanel = -1;
    }
}
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'ConvoDetailsPanel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/convoDetailsPanel.component.html',
    styleUrl: '../styles.css'
})
export class ConvoDetailsPanel {

    @Input() messageRecipientInfo!: string[];
    messagesAreMuted: boolean = false;
    @Output() notifyParentToShowDeleteChatPopup: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowBlockUserPopup: EventEmitter<any> = new EventEmitter();
    @Output() toggleMutedMessageIconInConvo:  EventEmitter<any> = new EventEmitter();
    @Input() convoIsRequested!:boolean;

    toggleMessagesAreMuted() {
        if(this.messagesAreMuted) {
            this.messagesAreMuted = false;
            this.toggleMutedMessageIconInConvo.emit("toggle muted message icon in convo");
        }
        else {
            this.messagesAreMuted = true;
            this.toggleMutedMessageIconInConvo.emit("toggle muted message icon in convo");
        }
    }

    showDeleteChatPopup() {
        this.notifyParentToShowDeleteChatPopup.emit("show delete-chat popup");
    }

    showBlockUserPopup() {
        this.notifyParentToShowBlockUserPopup.emit("show block-user popup");
    }



    getHeightOfMembersListDiv() {
        return !this.convoIsRequested ?
        {
            'height': '60%'
        } :
        {
            'height': '69%'
        };
    }


}
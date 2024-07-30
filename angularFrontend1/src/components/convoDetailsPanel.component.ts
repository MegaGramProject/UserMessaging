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
    @Output() toggleMutedMessageIconInGroupConvo:  EventEmitter<any> = new EventEmitter();
    @Input() convoIsRequested!:boolean;
    @Input() groupMessageRecipientsInfo:string[][]=[];
    @Output() notifyParentToShowLeaveChatPopup: EventEmitter<any> = new EventEmitter();

    toggleMessagesAreMuted() {
        if(this.messagesAreMuted) {
            this.messagesAreMuted = false;
            if(this.messageRecipientInfo.length>0) {
                this.toggleMutedMessageIconInConvo.emit("toggle muted message icon in convo");
            }
            else {
                this.toggleMutedMessageIconInGroupConvo.emit("toggle muted message icon in group-convo");
            }
        }
        else {
            this.messagesAreMuted = true;
            if(this.messageRecipientInfo.length>0) {
                this.toggleMutedMessageIconInConvo.emit("toggle muted message icon in convo");
            }
            else {
                this.toggleMutedMessageIconInGroupConvo.emit("toggle muted message icon in group-convo");
            }
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

    showLeaveGroupPopup() {
        this.notifyParentToShowLeaveChatPopup.emit("show leave-chat popup");
    }


}
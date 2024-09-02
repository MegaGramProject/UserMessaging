import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';

@Component({
    selector: 'ConvoDetailsPanel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/convoDetailsPanel.component.html',
    styleUrl: '../styles.css'
})
export class ConvoDetailsPanel {

    @Input() messageRecipientInfo: string[] = [];
    @Input() messagesAreMuted!: boolean;
    @Output() notifyParentToShowDeleteChatPopup: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowBlockUserPopup: EventEmitter<any> = new EventEmitter();
    @Output() toggleMutedMessageIconInConvo:  EventEmitter<any> = new EventEmitter();
    @Input() convoIsRequested!:boolean;
    @Input() groupMessageRecipientsInfo:string[][]=[];
    @Output() notifyParentToShowLeaveGroupPopup: EventEmitter<any> = new EventEmitter();
    @Input() authenticatedUsername!:string;
    @Input() messages!:Array<Array<Object>>;
    @Output() notifyParentToShowUserSettingsPopup: EventEmitter<string[]> = new EventEmitter();
    @Output() notifyParentToShowAddMemberPopup: EventEmitter<string> = new EventEmitter();
    @Input() blockedUsernames!:string[];
    @Input() promotedUsernames!:string[];
    @Output() notifyParentToShowPromoteUserPopup: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToDemoteUser: EventEmitter<any> = new EventEmitter();
    @Input() isRequestedConvosSectionDisplayed!: boolean;
    @Input() selectedConvoInitator!: string[];
    convoMemberProfileIcons: { [username: string]: string } = {};
    @Input() membersOfSelectedConvo!: string[][];
    @Input() isRequestedOfSelectedConvo!:any[];
    convoMemberActivityStatuses: { [username: string]: string } = {};
    @Input() socket!:WebSocket;


    toggleMessagesAreMuted() {
        if(this.messagesAreMuted) {
            this.messagesAreMuted = false;
            this.toggleMutedMessageIconInConvo.emit("toggle muted message icon");
        }
        else {
            this.messagesAreMuted = true;
            this.toggleMutedMessageIconInConvo.emit("toggle muted message icon");
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['messageRecipientInfo'] && changes['messageRecipientInfo'].currentValue.length>0) {
            this.convoMemberProfileIcons = {};
            this.getProfilePhotoOfUser(this.messageRecipientInfo[0]);
            this.getActivityStatusOfUser(this.messageRecipientInfo[0]);
        }
        else if (changes['groupMessageRecipientsInfo'] && changes['groupMessageRecipientsInfo'].currentValue.length>0) {
            this.convoMemberProfileIcons = {};
            for(let member of this.groupMessageRecipientsInfo) {
                this.getProfilePhotoOfUser(member[0]);
                this.getActivityStatusOfUser(member[0]);
            }
        }
    }

    async getProfilePhotoOfUser(username: string) {
        try {
            const response = await fetch('http://localhost:8003/getProfilePhoto/'+username);
            if(!response.ok) {
                this.convoMemberProfileIcons[username] = "profileIcon.png";
                return;
            }
            const buffer = await response.arrayBuffer();
            const base64Flag = 'data:image/jpeg;base64,';
            const imageStr = this.arrayBufferToBase64(buffer);
            this.convoMemberProfileIcons[username] = base64Flag + imageStr;
        }
        catch {
            this.convoMemberProfileIcons[username] = "profileIcon.png";
        }
    }

    async getActivityStatusOfUser(username: String) {
        this.convoMemberActivityStatuses[<string>username] = Math.random() < 0.5 ? "active" : "idle";
    }

    arrayBufferToBase64(buffer: ArrayBuffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
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
        this.notifyParentToShowLeaveGroupPopup.emit("show leave-chat popup");
    }

    showUserSettingsPopup(groupMessageMember: string[]){
        if(this.doesUserHaveConvoPerks(this.authenticatedUsername)) {
            this.notifyParentToShowUserSettingsPopup.emit(groupMessageMember);
        }
        else {
            window.location.href = "https://instagram.com/"+groupMessageMember[0];
        }
    }

    
    doesUserHaveConvoPerks(username: string) {
        if(this.isRequestedConvosSectionDisplayed) {
            return false;
        }
        return this.selectedConvoInitator[0]===username || this.promotedUsernames.includes(username);
    }


    showAddMembersPopup() {
        this.notifyParentToShowAddMemberPopup.emit("show add members popup");
    }

    takeUserToThisUsersPage(username: string) {
        window.location.href = "https://instagram.com/"+username;
    }

    showPromoteUserPopup() {
        this.notifyParentToShowPromoteUserPopup.emit("show promote-user popup");
    }

    demoteUser()  {
        this.notifyParentToDemoteUser.emit("demote this user");
    }

    isUserRequested(username: string) {
        for(let i=0; i<this.membersOfSelectedConvo.length; i++) {
            if (this.membersOfSelectedConvo[i][0]===username) {
                if(this.isRequestedOfSelectedConvo[i]==0) {
                    return false;
                }
                return true;
            }
        }
        return;
    }

}
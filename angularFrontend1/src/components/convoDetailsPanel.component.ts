import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'ConvoDetailsPanel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/convoDetailsPanel.component.html',
    styleUrl: '../styles.css'
})
export class ConvoDetailsPanel {

    @Input() messageRecipientInfo: string[] = [];
    messagesAreMuted: boolean = false;
    @Output() notifyParentToShowDeleteChatPopup: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowBlockUserPopup: EventEmitter<any> = new EventEmitter();
    @Output() toggleMutedMessageIconInConvo:  EventEmitter<any> = new EventEmitter();
    @Output() toggleMutedMessageIconInGroupConvo:  EventEmitter<any> = new EventEmitter();
    @Input() convoIsRequested!:boolean;
    @Input() groupMessageRecipientsInfo:string[][]=[];
    @Output() notifyParentToShowLeaveGroupPopup: EventEmitter<any> = new EventEmitter();
    @Input() authenticatedUsername!:string;
    @Input() messages!:Array<Array<Object>>;
    @Output() notifyParentToShowUserSettingsPopup: EventEmitter<string[]> = new EventEmitter();
    @Output() notifyParentToShowAddMemberPopup: EventEmitter<string> = new EventEmitter();
    @Input() blockedUsernames:string[] = [];
    @Input() promotedUsernames!:string[];
    @Output() notifyParentToShowPromoteUserPopup: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToDemoteUser: EventEmitter<any> = new EventEmitter();
    @Input() isRequestedConvosSectionDisplayed!: boolean;

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
        this.notifyParentToShowLeaveGroupPopup.emit("show leave-chat popup");
    }

    showUserSettingsPopup(groupMessageMember: string[]){
        if(this.doesUserHaveConvoPerks()) {
            this.notifyParentToShowUserSettingsPopup.emit(groupMessageMember);
        }
        else {
            window.location.href = "https://instagram.com/"+groupMessageMember[0];
        }
    }

    doesUserHaveConvoPerks() {
        if(this.isRequestedConvosSectionDisplayed) {
            return false;
        }
        return (this.groupMessageRecipientsInfo.length>0 && this.groupMessageRecipientsInfo[0][0]==this.authenticatedUsername) || (this.promotedUsernames.includes(this.authenticatedUsername))
        || (this.doesUserHaveConvoPerksInNonGroup());
    }

    doesUserHaveConvoPerksInNonGroup() {
        if(this.groupMessageRecipientsInfo.length==0) {
            for(let message of this.messages) {
                if(message[0]===this.authenticatedUsername) {
                    return true;
                }
                else if(message[0]===this.messageRecipientInfo[0]) {
                    return false;
                }
            }
        }
        return false;
    }


    showAddMembersPopup() {
        this.notifyParentToShowAddMemberPopup.emit("show add members popup");
    }

    thisUserIsPromoted(username: string) {
        return (this.groupMessageRecipientsInfo.length>0 && this.groupMessageRecipientsInfo[0][0]===username) || (this.promotedUsernames.includes(username)) ||
        (this.groupMessageRecipientsInfo.length==0 && !this.doesUserHaveConvoPerksInNonGroup());
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

}
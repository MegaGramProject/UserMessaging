import { Component, Input, Output, EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteSectionNote } from './noteSectionNote.component';



@Component({
    selector: 'UserSettingsPopup',
    standalone: true,
    imports: [CommonModule, NoteSectionNote],
    templateUrl: '../templates/userSettingsPopup.component.html',
    styleUrl: '../styles.css'
})
export class UserSettingsPopup {
    @Input() messageMember!:string[];
    @Output() notifyParentToClosePopup: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToBlockUser: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToRemoveUserFromConvo: EventEmitter<string> = new EventEmitter();
    displayPromotionInfoText:boolean = false;
    @Output() notifyParentToPromoteUser: EventEmitter<string> = new EventEmitter();
    @Input() blockedUsernames:string[] = [];
    @Output() notifyParentToUnblockUser: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToDemoteUser: EventEmitter<string> = new EventEmitter();
    @Input() promotedUsernames:string[] = [];
    @Input() groupMessageRecipientsInfo:any[][]=[];

    isThisUserAlreadyPromoted() {
        return (this.groupMessageRecipientsInfo.length > 0 && this.groupMessageRecipientsInfo[0][0]===this.messageMember[0]) ||
        (this.promotedUsernames.includes(this.messageMember[0]));
    }

    closePopup() {
        this.notifyParentToClosePopup.emit("close this popup");
    }

    blockUser() {
        this.notifyParentToBlockUser.emit("block this user");
    }

    unblockUser() {
        this.notifyParentToUnblockUser.emit("unblock this user");
    }

    promoteUser() {
        this.notifyParentToPromoteUser.emit("promote this user");
    }

    demoteUser() {
        this.notifyParentToDemoteUser.emit("demote this user");
    }

    removeFromConvo() {
        this.notifyParentToRemoveUserFromConvo.emit("remove this user from the convo");
    }

    showPromotionInfoText() {
        this.displayPromotionInfoText = true;
    }

    hidePromotionInfoText() {
        this.displayPromotionInfoText = false;
    }

}
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'Convo',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/convo.component.html',
    styleUrl: '../styles.css'
})
export class Convo {
    @Input() lastMessageId!: any;
    @Input() username!: any;
    @Input() fullName!: any;
    @Input() hasUnreadMessage!: any;
    @Input() isMuted!:any;
    @Output() notifyParentToShowMessagesOfThisConvo: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentOfSelectedConvo: EventEmitter<number> = new EventEmitter();
    @Input() convoIndex!:number;
    @Input() isSelected!: boolean;
    @Input() membersOfGroupChatBesidesInitator: any = [];
    @Output() notifyParentToShowMessagesOfThisGroupConvo: EventEmitter<any[][]> = new EventEmitter();
    @Input() convoTitle:any = "";
    @Input() convoId:any = "";
    profilePhotoString:string = "profileIcon.png";

    ngOnInit() {
        this.getProfilePhoto();
    }

    async getProfilePhoto() {
        const response = await fetch('http://localhost:8003/getProfilePhoto/'+this.username);
        if(!response.ok) {
            return;
        }
        const buffer = await response.arrayBuffer();
        const base64Flag = 'data:image/jpeg;base64,';
        const imageStr = this.arrayBufferToBase64(buffer);
        this.profilePhotoString = base64Flag + imageStr;
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


    selectConvo() {
        this.hasUnreadMessage = false;
        this.showMessagesOfThisConvo();
        this.notifyParentOfSelectedConvo.emit(this.convoIndex);
    }

    getBackgroundColorBasedOnSelection() {
        return this.isSelected ? {
            'background-color': '#e8e8e8'
        } :
        {
            'background-color': 'white'
        }
    }
    
    showMessagesOfThisConvo() {
        if(this.membersOfGroupChatBesidesInitator.length==0) {
            this.notifyParentToShowMessagesOfThisConvo.emit([this.username, this.fullName]);
        }
        else {
            let groupChatMemberData = [[this.username, this.fullName]];
            for(let member of this.membersOfGroupChatBesidesInitator) {
                groupChatMemberData.push(member)
            }
            this.notifyParentToShowMessagesOfThisGroupConvo.emit(groupChatMemberData);
        }
    }

    getFullNamesOfAllConvoMembers() {
        let fullNames = this.fullName;
        if(this.membersOfGroupChatBesidesInitator.length==1) {
            return fullNames + " & " + this.membersOfGroupChatBesidesInitator[0][1];
        }
        for(let i=0; i<this.membersOfGroupChatBesidesInitator.length-1; i++) {
            fullNames += ", " + this.membersOfGroupChatBesidesInitator[i][1];
        }
        if(this.membersOfGroupChatBesidesInitator.length>0) {
            fullNames += ", & " +  this.membersOfGroupChatBesidesInitator[this.membersOfGroupChatBesidesInitator.length-1][1];
        }
        return fullNames;
    }


}
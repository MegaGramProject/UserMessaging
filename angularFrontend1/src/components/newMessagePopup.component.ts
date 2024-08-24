import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'NewMessagePopup',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/newMessagePopup.component.html',
    styleUrl: '../styles.css'
})
export class NewMessagePopup {
    textareaInput!:string;
    usersSelected:string[][] = [];
    usersToChooseFrom:string[][] = [];
    filteredUserResults:string[][] = [];
    @Output() notifyParentToExitNewMessagePopup: EventEmitter<any> = new EventEmitter();
    checkboxStates: { [key: string]: boolean } = {};
    @Output() notifyParentToStartMessagingSelectedUsers: EventEmitter<string[][]> = new EventEmitter();
    @Input() isForwarding!:boolean;
    @Input() messageToForward!:string;
    @Input() convoMemberOfForwardedMessage!:string[][];
    @Input() convoMembersOfForwardedMessage!:string[][];
    @Output() notifyParentToForwardMessageToSelectedUsers: EventEmitter<any[]> = new EventEmitter();
    @Output() notifyParentToForwardFileToSelectedUsers: EventEmitter<any[]> = new EventEmitter();
    @Input() fileToForward!:any[];
    @Input() isAddingNewMembers!:boolean;
    @Output() notifyParentToAddNewMemberToConvo: EventEmitter<any[]> = new EventEmitter();
    @Input() blockedUsernames!:string[];
    userProfileIcons: { [username: string]: string } = {};

    async ngOnInit() {
        const response = await fetch('http://localhost:8001/getUsernamesAndFullNamesOfAll');
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        const listOfUsers = await response.json();

        this.usersToChooseFrom = (<string[][]>listOfUsers).filter(x=> !this.blockedUsernames.includes(x[0]));
        for(let user of this.usersToChooseFrom) {
            this.checkboxStates[user[0]] = false;
            this.getProfilePhotoOfUser(user[0]);
        }
    }

    getChatButtonStyle() {
        return this.usersSelected.length == 0 ?
        {
            'opacity': 0.3,
            'pointer-events': 'none'
        }
        :
        {
            'opacity': 1,
            'pointer-events': 'auto',
            'cursor': 'pointer'
        };
    }

    closePopup() {
        this.notifyParentToExitNewMessagePopup.emit("exit this popup");
    }

    showResultsForSearch() {
        if(this.textareaInput==="") {
            this.filteredUserResults = [];
        }
        else {
            this.filteredUserResults = this.usersToChooseFrom.filter(x=>x[0].toLowerCase().startsWith(this.textareaInput.toLowerCase())
            || x[1].toLowerCase().startsWith(this.textareaInput.toLowerCase()));
        }
    }

    selectUsername(event: Event, user: string[]) {
        event.preventDefault();
        if(this.usersSelected.includes(user)) {
            this.checkboxStates[user[0]] = false;
            this.usersSelected.splice(this.usersSelected.indexOf(user), 1);
        }
        else {
            this.checkboxStates[user[0]] = true;
            this.usersSelected.push(user);
        }
    }

    chatButtonOnClick() {
        if(!this.isForwarding && !this.isAddingNewMembers) {
            this.notifyParentToStartMessagingSelectedUsers.emit(this.usersSelected);
        }
        else if(this.isForwarding) {
            if(this.fileToForward.length==0) {
                if(this.convoMemberOfForwardedMessage[0].length!==0) {
                    this.notifyParentToForwardMessageToSelectedUsers.emit([this.messageToForward, this.usersSelected,
                    this.convoMemberOfForwardedMessage]);
                }
                else {
                    this.notifyParentToForwardMessageToSelectedUsers.emit([this.messageToForward, this.usersSelected,
                    this.convoMembersOfForwardedMessage]);
                }
            }
            else {
                //make consistent with above logic
                this.notifyParentToForwardFileToSelectedUsers.emit([this.fileToForward, this.usersSelected,
                this.convoMemberOfForwardedMessage.length>0 ? this.convoMemberOfForwardedMessage : this.convoMembersOfForwardedMessage]);
            }
        
        }
        else {
            this.notifyParentToAddNewMemberToConvo.emit(this.usersSelected);
        }
    }

    async getProfilePhotoOfUser(username: string) {
        try {
            const response = await fetch('http://localhost:8003/getProfilePhoto/'+username);
            if(!response.ok) {
                this.userProfileIcons[username] = "profileIcon.png";
                return;
            }
            const buffer = await response.arrayBuffer();
            const base64Flag = 'data:image/jpeg;base64,';
            const imageStr = this.arrayBufferToBase64(buffer);
            this.userProfileIcons[username] = base64Flag + imageStr;
        }
        catch {
            this.userProfileIcons[username] = "profileIcon.png";
        }
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
}
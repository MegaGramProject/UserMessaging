import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
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
    usersToChooseFrom:string[][] = [["rishavry", "Rishav Ray"], ["rishavry2", "Rishav Ray2"], ["rishavry3", "Rishav Ray3"],
    ["rishavry4", "Rishav Ray4"], ["rishavry5", "Rishav Ray5"], ["rishavry6", "Rishav Ray6"], ["rishavry7", "Rishav Ray7"]];
    filteredUserResults:string[][] = [];
    @Output() notifyParentToExitNewMessagePopup: EventEmitter<any> = new EventEmitter();
    checkboxStates: { [key: string]: boolean } = {"rishavry":false, "rishavry2":false, "rishavry3":false, "rishavry4":false, "rishavry5":false, "rishavry6":false, "rishavry7":false};
    @Output() notifyParentToStartMessagingSelectedUsers: EventEmitter<string[][]> = new EventEmitter();
    @Input() isForwarding!:boolean;
    @Input() messageToForward!:string;
    @Input() convoMembersOfForwardedMessage!:string[][];
    @Output() notifyParentToForwardMessageToSelectedUsers: EventEmitter<any[]> = new EventEmitter();
    @Output() notifyParentToForwardFileToSelectedUsers: EventEmitter<any[]> = new EventEmitter();
    @Input() fileToForward!:any[];

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
        if(!this.isForwarding) {
            this.notifyParentToStartMessagingSelectedUsers.emit(this.usersSelected);
        }
        else {
            if(this.fileToForward.length==0) {
                this.notifyParentToForwardMessageToSelectedUsers.emit([this.messageToForward, this.usersSelected, this.convoMembersOfForwardedMessage]);
            }
            else {
                this.notifyParentToForwardFileToSelectedUsers.emit([this.fileToForward, this.usersSelected, this.convoMembersOfForwardedMessage]);
            }
        
        }
    }
}
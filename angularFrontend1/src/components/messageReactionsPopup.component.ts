import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'MessageReactionsPopup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/messageReactionsPopup.component.html',
    styleUrl: '../styles.css'
})
export class MessageReactionsPopup {
    @Input() messageReactionsInfo!:string[][];
    @Input() authenticatedUsername!:string;
    @Output() notifyParentToExitMessageReactionsPopup: EventEmitter<any> = new EventEmitter();
    @Input() blockedUsernames!:string[];

    closePopup() {
        this.notifyParentToExitMessageReactionsPopup.emit("exit popup");
    }

    removeReaction(index: number) {
        if(this.messageReactionsInfo[1][index]===this.authenticatedUsername) {
            this.messageReactionsInfo[0].splice(index, 1);
            this.messageReactionsInfo[1].splice(index, 1);
        }
    }

    
}
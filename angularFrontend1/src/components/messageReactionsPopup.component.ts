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
    @Input() convoId!:string;

    closePopup() {
        this.notifyParentToExitMessageReactionsPopup.emit("exit popup");
    }

    async removeReaction(index: number) {
        if(this.messageReactionsInfo[1][index]===this.authenticatedUsername) {
            const response = await fetch('http://localhost:8013/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `
                    mutation {
                        removeMessageReaction(
                            reactionToRemove: {
                                messageId: "${this.messageReactionsInfo[2]}"
                                username: "${this.authenticatedUsername}",
                                reaction: "${this.messageReactionsInfo[0][index]}",
                            }
                        )
                    }
                `
                })
            });
            if(!response.ok) {
                throw new Error('Network response not ok');
            }
            this.messageReactionsInfo[0].splice(index, 1);
            this.messageReactionsInfo[1].splice(index, 1);
        }
    }

    
}
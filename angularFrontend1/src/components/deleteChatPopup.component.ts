import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'DeleteChatPopup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/deleteChatPopup.component.html',
    styleUrl: '../styles.css'
})
export class DeleteChatPopup {
    @Input() messageRecipientInfo!: string[];
    @Output() notifyParentToCancelDeleteChat: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToDeleteChat: EventEmitter<any> = new EventEmitter();

    cancelDeleteChat() {
        this.notifyParentToCancelDeleteChat.emit("cancel delete chat");
    }

    deleteChat() {
        this.notifyParentToDeleteChat.emit("delete chat");
    }

}
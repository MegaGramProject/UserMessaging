import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'DeleteMessagePopup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/deleteMessagePopup.component.html',
    styleUrl: '../styles.css'
})
export class DeleteMessagePopup {
    @Output() notifyParentToCancelDeleteMessage: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToDeleteMessage: EventEmitter<any> = new EventEmitter();

    cancelDeleteMessage() {
        this.notifyParentToCancelDeleteMessage.emit("cancel delete message");
    }

    deleteMessage() {
        this.notifyParentToDeleteMessage.emit("delete message");
    }

}
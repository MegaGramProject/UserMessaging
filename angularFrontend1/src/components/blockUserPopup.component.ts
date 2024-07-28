import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'BlockUserPopup',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/blockUserPopup.component.html',
    styleUrl: '../styles.css'
})
export class BlockUserPopup {
    @Input() messageRecipientInfo!: string[];
    @Output() notifyParentToCancelBlock: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToBlockUser: EventEmitter<any> = new EventEmitter();

    cancelBlock() {
        this.notifyParentToCancelBlock.emit("cancel block");
    }

    blockUser() {
        this.notifyParentToBlockUser.emit("block user");
    }

}
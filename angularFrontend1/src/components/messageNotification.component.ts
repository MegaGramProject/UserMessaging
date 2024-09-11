import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';


@Component({
    selector: 'MessageNotification',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/messageNotification.component.html',
    styleUrl: '../styles.css'
})
export class MessageNotification {
    @Input() messageSender!:string;
    @Input() message!:string;
    @Input() convoId!: string;
    profilePhotoString:string = "profileIcon.png";
    @Output() notifyParentToGoToConvo: EventEmitter<string> = new EventEmitter();
    @Output() notifyParentToCloseMessageNotification: EventEmitter<string> = new EventEmitter();

    ngOnChanges(changes: SimpleChanges) {
        if(changes['messageSender']) {
            this.getProfilePhoto();
        }
    }
    
    async getProfilePhoto() {
        const response = await fetch('http://localhost:8003/getProfilePhoto/'+this.messageSender);
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

    tellParentToGoToConvo() {
        this.notifyParentToGoToConvo.emit(this.convoId);
    }

    closeMessageNotification(event: Event) {
        this.notifyParentToCloseMessageNotification.emit("close this component");
        event.stopPropagation();
    }

}
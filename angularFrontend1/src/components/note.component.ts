import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'Note',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/Note.component.html',
    styleUrl: '../styles.css'
})

export class Note {
    @Input() isOwnAccount: boolean = true;
    @Input() noteText: string = "Note...";
    @Input() username: string = "rishavry";
    @Input() fullName: string = "Rishav Ray";
    @Output() notifyParentToCreateNewNote: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNoteSection: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToSendNoteReply: EventEmitter<string[]> = new EventEmitter();
    isHoveringOnNoteProfileIcon:boolean = false;
    displayCreateNoteReply:boolean = false;
    noteReplyText:string = "";
    profilePhotoString:string = "profileIcon.png";

    showCreateNewNote() {
        this.notifyParentToCreateNewNote.emit('Show createNewNote');
    }

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

    showNoteSection() {
        if(!this.displayCreateNoteReply) {
            this.notifyParentToShowNoteSection.emit(this.username);
        }
        else {
            this.displayCreateNoteReply = false;
        }
    }

    onNoteProfileIconMouseEnter() {
        this.isHoveringOnNoteProfileIcon = true;
    }

    onNoteProfileIconMouseLeave() {
        this.isHoveringOnNoteProfileIcon = false;
    }

    showSeeNotesText() {
        return this.isHoveringOnNoteProfileIcon ?
        {
            'display': 'inline-block'
        } :
        {
            'display': 'none'
        }
    }

    toggleCreateNoteReply() {
        this.displayCreateNoteReply = !this.displayCreateNoteReply;
    }

    showSendNoteReplyText() {
        return this.noteReplyText.length > 0  ? {
            display: 'inline-block'
        } :
        {
            display: 'none'
        };
    }

    sendNoteReply() {
        this.notifyParentToSendNoteReply.emit([this.noteReplyText, this.noteText, this.username, this.fullName]);
        this.noteReplyText = "";
        this.displayCreateNoteReply = false;
    }

    
}
import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from './note.component';
import { Message } from './convo.component';


@Component({
    selector: 'NotesAndConvosSection',
    standalone: true,
    imports: [CommonModule, Note, Message],
    templateUrl: '../templates/notesAndConvosSection.component.html',
    styleUrl: '../styles.css'
})
export class NotesAndConvosSection {
    @Output() notifyParentToCreateNewNote: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNoteSection: EventEmitter<any> = new EventEmitter();

    takeUserToLogin() {
        window.location.href = "http://localhost:8000/login";
    }

    showCreateNewNote() {
        this.notifyParentToCreateNewNote.emit('Show createNewNote');
    }

    handleShowNoteSectionNotfication(username: string) {
        this.notifyParentToShowNoteSection.emit(username);
    }
}
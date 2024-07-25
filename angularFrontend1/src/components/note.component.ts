import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
    selector: 'Note',
    standalone: true,
    imports: [CommonModule],
    templateUrl: '../templates/Note.component.html',
    styleUrl: '../styles.css'
})

export class Note {
    @Input() isOwnAccount: boolean = true;
    @Input() noteText: string = "Note...";
    @Input() username: string = "rishavry";
    @Input() fullName: string = "R R";
    @Output() notifyParentToCreateNewNote: EventEmitter<any> = new EventEmitter();
    @Output() notifyParentToShowNoteSection: EventEmitter<any> = new EventEmitter();
    isHoveringOnNoteProfileIcon:boolean = false;

    showCreateNewNote() {
        this.notifyParentToCreateNewNote.emit('Show createNewNote');
    }

    showNoteSection() {
        this.notifyParentToShowNoteSection.emit(this.username);
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
}
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteSectionNote } from './noteSectionNote.component';



@Component({
    selector: 'NoteSection',
    standalone: true,
    imports: [CommonModule, NoteSectionNote],
    templateUrl: '../templates/noteSection.component.html',
    styleUrl: '../styles.css'
})
export class NoteSection {
    @Input() username: string = "rishavry";
    @Input() isOwnAccount: boolean = true;
    @Output() notifyParentToExitNoteSection: EventEmitter<any> = new EventEmitter();

    exitNoteSection() {
        this.notifyParentToExitNoteSection.emit("exit this section");
    }
}
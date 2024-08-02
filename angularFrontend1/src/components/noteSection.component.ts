import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteSectionNote } from './noteSectionNote.component';
import { Note } from '../note.model';



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
    @Output() emitDataToParent: EventEmitter<Note[]> = new EventEmitter();

    listOfNotes1: Note[] = [
        { text: "This is the first note", createdAt: new Date(2024, 4, 15, 10, 30, 0) },
        { text: "This is the second note", createdAt: new Date(2024, 4, 15, 10, 50, 0) },
        { text: "This is the third note", createdAt: new Date(2024, 4, 17, 6, 30, 0) }
    ];

    listOfNotes2: Note[] = [
        { text: "This is the first note in the second section", createdAt: new Date(2024, 4, 15, 10, 30, 0) },
        { text: "Old note #2", createdAt: new Date(2024, 4, 10, 6, 14, 0) }
    ];

    exitNoteSection() {
        this.notifyParentToExitNoteSection.emit("exit this section");
    }

    ngOnInit() {
        this.emitDataToParent.emit(this.listOfNotes1);
    }
}
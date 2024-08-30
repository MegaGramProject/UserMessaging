import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note } from '../note.model';



@Component({
    selector: 'CreateNewNote',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/createNewNote.component.html',
    styleUrl: '../styles.css'
})

export class CreateNewNote {
    @Output() notifyParentOfExit: EventEmitter<any> = new EventEmitter();
    showWhoCanSeeNote: boolean = false;
    isChecked1: boolean = true;
    isChecked2: boolean = false;
    newNoteText: string = "";
    @Input() listOfNotes1ForUser!:Note[];
    @Input() authenticatedUsername!:string;


    exitCreateNewNote() {
        this.notifyParentOfExit.emit('Exit createNewNote');
    }


    async onShareClick() {
        const response = await fetch('http://localhost:8015/addUserNote', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                poster: this.authenticatedUsername,
                noteText: this.newNoteText,
                noteCreatedAt: new Date()
            })
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        this.listOfNotes1ForUser.push({text: this.newNoteText, createdAt: new Date(), editedAt: null, noteId: ""});
        this.newNoteText = "";
    }

    getCharacterCountDisplay() {
        if(this.newNoteText.length>=275) {
            return {
                'display': 'inline-block'
            };
        }
        return {
            'display': 'none'
        };
    }
    
    getShareTextStyle() {
        return {
            'opacity': this.newNoteText.length>0 ? 1 : 0.35,
            'cursor': this.newNoteText.length>0 ? 'pointer' : 'auto'
        };
    }

    toggleWhoCanSeeNote() {
        this.showWhoCanSeeNote = !this.showWhoCanSeeNote;
    }

    onCheck1InputChange(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const isChecked = inputElement.checked;
        if(!isChecked) {
            this.isChecked1 = true;
        }
        else {
            this.isChecked2 = false;
        }
        this.toggleWhoCanSeeNote();
    }
    onCheck2InputChange(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        const isChecked = inputElement.checked;
        if(!isChecked) {
            this.isChecked2 = true;
        }
        else {
            this.isChecked1 = false;
        }
        this.toggleWhoCanSeeNote();
    }
}
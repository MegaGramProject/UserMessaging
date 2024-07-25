import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';



@Component({
    selector: 'NoteSectionNote',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/noteSectionNote.component.html',
    styleUrl: '../styles.css'
})
export class NoteSectionNote {
    @Input() noteText: string = "This is the first note. It is quite impressive, aint it? Quite long one too. skdmaskjdmsaas das das askdmaskd as d sad sad asd asd asd as das daskdmkasmdkasmdkasd as dsakdmaskdmkas  askdmkasmdkasmdkasmdk  asdas";
    @Input() noteCreatedAt: Date = new Date();
    @Input() noteIsOwn: boolean = false;
    inEditMode:boolean = false;
    isDeleted: boolean = false;
    showDeleteConfirmationQuestion: boolean = false;

    formatDate(date: Date): string {
        const timeString = date.toLocaleString('en-US',  { hour: 'numeric', minute: 'numeric', hour12: true }).replace(' ', '').toUpperCase();
        
        const monthNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];
        
        const day = date.getDate();
        const monthIndex = date.getMonth();
        const year = date.getFullYear();
        
        const dateString = `${monthNames[monthIndex]} ${day}, ${year}`;
        
        return `${timeString} · ${dateString}`;
    }

    toggleEditMode() {
        if(!this.inEditMode) {
            this.inEditMode = true;
        }
        else {
            this.inEditMode = false;
        }
    }

    deleteNote() {
        this.isDeleted = true;
    }

    askToConfirmDelete() {
        this.showDeleteConfirmationQuestion = true;
    }

    cancelDelete() {
        this.showDeleteConfirmationQuestion = false;
    }

    showDeleteConfirmationQ() {
        return this.showDeleteConfirmationQuestion ?
        {
            'display': 'inline-block'
        } :
        {
            'display': 'none'
        };
    }



    
}
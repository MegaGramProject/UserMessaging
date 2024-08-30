import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Note } from '../note.model';



@Component({
    selector: 'NoteSectionNote',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/noteSectionNote.component.html',
    styleUrl: '../styles.css'
})
export class NoteSectionNote {
    @Input() noteText!: string;
    @Input() noteCreatedAt!: Date;
    @Input() noteIsOwn!: boolean;
    @Input() noteEditedAt!: any;
    @Input() index!: number;
    @Input() listOfNotes1ForUser!: Note[];
    @Input() listOfNotes2ForUser!: Note[];
    @Input() isListOfNotes1!: boolean;
    @Input() noteId!:string;
    inEditMode:boolean = false;
    isDeleted: boolean = false;
    showDeleteConfirmationQuestion: boolean = false;
    noteTextBeforeEditing = this.noteText;
    @Output() notifyParentToReplyToNote: EventEmitter<string[]> = new EventEmitter();

    formatDate(date: Date) {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
    
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30); // Approximation
        const years = Math.floor(days / 365); // Approximation
    
        if (seconds < 60) {
            if(seconds==0) {
                return '1s ago'
            }
            return `${seconds} s ago`;
        } else if (minutes < 60) {
            return `${minutes} m ago`;
        } else if (hours < 24) {
            return `${hours} h ago`;
        } else if (days < 7) {
            return `${days} d ago`;
        } else if (weeks < 4) {
            return `${weeks} w ago`;
        } else if (months < 12) {
            return `${months} mo ago`;
        } else {
            return `${years} y ago`;
        }
    }

    async toggleEditMode() {
        if(!this.inEditMode) {
            this.noteTextBeforeEditing = this.noteText;
            this.inEditMode = true;
        }
        else {
            this.inEditMode = false;
            if(this.noteTextBeforeEditing === this.noteText) {
                return;
            }
            const response = await fetch('http://localhost:8015/editUserNote/'+this.noteId, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    noteText: this.noteText,
                    noteEditedAt: new Date()
                })
            });
            if(!response.ok) {
                throw new Error('Network response not ok');
            }
            if(this.isListOfNotes1) {
                this.listOfNotes1ForUser[this.index]['text'] = this.noteText;
                this.listOfNotes1ForUser[this.index]['editedAt'] = new Date();
            }
            else {
                this.listOfNotes2ForUser[this.index]['text'] = this.noteText;
                this.listOfNotes2ForUser[this.index]['editedAt'] = new Date();
            }
            this.inEditMode = false;
        }
    }

    async deleteNote() {
        const response = await fetch('http://localhost:8015/deleteUserNote/'+this.noteId, {
            method: 'DELETE'
        });
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        if(this.isListOfNotes1) {
            this.listOfNotes1ForUser.splice(this.index, 1);
        }
        else {
            this.listOfNotes2ForUser.splice(this.index, 1);
        }
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

    notifyParentToReplyToThisNote() {
        this.notifyParentToReplyToNote.emit([this.noteId, this.noteText]);
    }



    
}
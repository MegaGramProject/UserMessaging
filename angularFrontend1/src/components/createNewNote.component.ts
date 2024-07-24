import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'CreateNewNote',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: '../templates/CreateNewNote.component.html',
    styleUrl: '../styles.css'
})

export class CreateNewNote {
    @Output() notifyParentOfExit: EventEmitter<any> = new EventEmitter();
    newThoughtIsLongEnough: boolean = false;
    showWhoCanSeeNote: boolean = false;
    isChecked1: boolean = true;
    isChecked2: boolean = false;


    exitCreateNewNote() {
        this.notifyParentOfExit.emit('Exit createNewNote');
    }

    onShareAThoughtInputChange(event: Event) {
        const input = event.target as HTMLTextAreaElement;
        this.newThoughtIsLongEnough = input.value.length > 0;
    }
    
    getShareTextStyle() {
        return {
            'opacity': this.newThoughtIsLongEnough ? 1 : 0.35
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
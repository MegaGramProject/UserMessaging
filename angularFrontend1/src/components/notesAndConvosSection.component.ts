import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Note } from './note.component';
import { Message } from './message.component';


@Component({
    selector: 'NotesAndConvosSection',
    standalone: true,
    imports: [CommonModule, Note, Message],
    templateUrl: '../templates/notesAndConvosSection.component.html',
    styleUrl: '../styles.css'
})
export class NotesAndConvosSection {
    takeUserToLogin() {
        window.location.href = "http://localhost:8000/login";
    }
}
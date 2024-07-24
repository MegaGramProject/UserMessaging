import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';


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
}
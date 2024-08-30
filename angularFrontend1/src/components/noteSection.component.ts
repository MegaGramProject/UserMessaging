import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Note } from '../note.model';
import { NoteSectionNote } from './noteSectionNote.component';
import { FormsModule } from '@angular/forms';



@Component({
    selector: 'NoteSection',
    standalone: true,
    imports: [CommonModule, NoteSectionNote, FormsModule],
    templateUrl: '../templates/noteSection.component.html',
    styleUrl: '../styles.css'
})
export class NoteSection {
    @Input() username!: string;
    @Input() fullName!: string;
    @Input() isOwnAccount: boolean = true;
    @Output() notifyParentToExitNoteSection: EventEmitter<any> = new EventEmitter();
    @Output() emitDataToParent: EventEmitter<Note[]> = new EventEmitter();
    @Input() authenticatedUsername!: string;
    noteReplyText: string= "";
    noteTextToReplyTo:any = null;
    noteReplyTextareaPlaceholderText: string = "";
    idOfNoteBeingRepliedTo:string = '';
    @Output() notifyParentToSendNoteReply: EventEmitter<string[]> = new EventEmitter();

    listOfNotes1: Note[] = [];

    listOfNotes2: Note[] = [];

    //for authenticated user
    listOfNotes1ForUser: Note[] = [];

    //for authenticated user
    listOfNotes2ForUser: Note[] = [];

    exitNoteSection() {
        this.notifyParentToExitNoteSection.emit("exit this section");
    }

    async ngOnChanges(changes: SimpleChanges) {
        if(changes['isOwnAccount']) {
            if(this.isOwnAccount) {
                this.listOfNotes1 = this.listOfNotes1ForUser;
                this.listOfNotes2 = this.listOfNotes2ForUser;
            }
            else {
                this.noteReplyTextareaPlaceholderText = "Reply to one of " + this.username + "'s notes...";
                this.idOfNoteBeingRepliedTo = '';
                const response = await fetch('http://localhost:8015/getUnexpiredNotesOfUser/'+this.username);
                if(!response.ok) {
                    throw new Error('Network response not ok');
                }
                const fetchedUnexpiredNotesOfUser = await response.json();
                this.listOfNotes1 = [];
                this.listOfNotes2 = [];
                for(let fetchedNote of fetchedUnexpiredNotesOfUser) {
                    this.listOfNotes1.push({
                        text: fetchedNote['noteText'],
                        createdAt:  new Date(fetchedNote['noteCreatedAt']),
                        editedAt: fetchedNote['noteEditedAt']==null ? null : new Date(fetchedNote['noteEditedAt']),
                        noteId: fetchedNote['id']
                    });
                }
            }
        }
        else if(changes['username']) {
            this.noteReplyTextareaPlaceholderText = "Reply to one of " + this.username + "'s notes...";
            this.idOfNoteBeingRepliedTo = '';
            const response = await fetch('http://localhost:8015/getUnexpiredNotesOfUser/'+this.username);
                if(!response.ok) {
                    throw new Error('Network response not ok');
                }
                const fetchedUnexpiredNotesOfUser = await response.json();
                this.listOfNotes1 = [];
                this.listOfNotes2 = [];
                for(let fetchedNote of fetchedUnexpiredNotesOfUser) {
                    this.listOfNotes1.push({
                        text: fetchedNote['noteText'],
                        createdAt:  new Date(fetchedNote['noteCreatedAt']),
                        editedAt: fetchedNote['noteEditedAt']==null ? null : new Date(fetchedNote['noteEditedAt']),
                        noteId: fetchedNote['id']
                    });
                }
        }

        if(changes['listOfNotes1ForUser'] && this.isOwnAccount) {
            this.listOfNotes1 = this.listOfNotes1ForUser;
        }

        if(changes['listOfNotes2ForUser'] && this.isOwnAccount) {
            this.listOfNotes2 = this.listOfNotes2ForUser;
        }
    }

    isFetchedNoteExpired(fetchedNote: any) {
        const now = new Date();
        const fetchedNoteDate = new Date(fetchedNote['noteCreatedAt']);

        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return (fetchedNoteDate < twentyFourHoursAgo);
    }

    async ngOnInit() {
        const response = await fetch('http://localhost:8015/getAllNotesOfUser/'+this.authenticatedUsername);
        if(!response.ok) {
            throw new Error('Network response not ok');
        }
        const fetchedNotesOfAuthUser = await response.json();
        for(let fetchedNote of fetchedNotesOfAuthUser) {
            if(!this.isFetchedNoteExpired(fetchedNote)) {
                this.listOfNotes1ForUser.push({
                    text: fetchedNote['noteText'],
                    createdAt:  new Date(fetchedNote['noteCreatedAt']),
                    editedAt: fetchedNote['noteEditedAt']==null ? null : new Date(fetchedNote['noteEditedAt']),
                    noteId: fetchedNote['id']
                });
            }
            else {
                this.listOfNotes2ForUser.push({
                    text: fetchedNote['noteText'],
                    createdAt:  new Date(fetchedNote['noteCreatedAt']),
                    editedAt: fetchedNote['noteEditedAt']==null ? null : new Date(fetchedNote['noteEditedAt']),
                    noteId: fetchedNote['id']
                });
            }
        }
        this.emitDataToParent.emit(this.listOfNotes1ForUser);
    }

    replyToNote(noteReplyInfo: string[]) {
        this.noteReplyText = "";
        if(noteReplyInfo[0]===this.idOfNoteBeingRepliedTo) {
            this.noteTextToReplyTo = null;
            this.noteReplyTextareaPlaceholderText = "Reply to one of " + this.username + "'s notes...";
            this.idOfNoteBeingRepliedTo = '';
        }
        else {
            this.noteTextToReplyTo = noteReplyInfo[1];
            this.noteReplyTextareaPlaceholderText = "Reply to " + this.username + ": " + this.noteTextToReplyTo;
            this.idOfNoteBeingRepliedTo = noteReplyInfo[0];
        }
    }

    async sendNoteReply() {
        this.notifyParentToSendNoteReply.emit([this.noteReplyText, this.noteTextToReplyTo, this.username, this.fullName]);
        this.noteTextToReplyTo = null;
        this.noteReplyText = "";
        this.noteReplyTextareaPlaceholderText = "Reply to one of " + this.username + "'s notes...";
        this.idOfNoteBeingRepliedTo = '';
    }
}
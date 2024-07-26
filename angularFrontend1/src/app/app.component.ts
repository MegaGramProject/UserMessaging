import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateNewNote } from '../components/createNewNote.component';
import { LeftSidebarComponent } from '../components/leftSidebar.component';
import { MessagesOfAChat } from '../components/messagesOfAChat.component';
import { NotesAndConvosSection } from '../components/notesAndConvosSection.component';
import { NoteSection } from '../components/noteSection.component';
import { MessageReactionsPopup } from '../components/messageReactionsPopup.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, CommonModule, NotesAndConvosSection,
  MessagesOfAChat, CreateNewNote, NoteSection, MessageReactionsPopup],
  templateUrl: './app.component.html',
  styleUrl: '../styles.css'
})
export class AppComponent {
  showMessagesOfAChat:boolean = true;
  showCreateNewNote:boolean = false;
  showNoteSection:boolean = false;
  noteSectionUsername:string = "";
  noteSectionIsOwnAccount:boolean = false;
  authenticatedUsername:string = "rishavry";
  messageRecipientInfo:Array<string> = ["rishavry2", "Rishav Ray2"];
  showMessageReactionsPopup:boolean = false;
  messageReactionsInfo:string[][] = [];


  enterCreateNewNote() {
    this.showCreateNewNote = true;
    this.showMessagesOfAChat = false;
    this.showNoteSection = false;
  }

  exitOutOfCreateNewNote() {
    this.showCreateNewNote = false;
    this.showMessagesOfAChat = true;
    this.showNoteSection = false;
  }

  handleExitCreateNewNoteNotification(){
      this.exitOutOfCreateNewNote();
  }

  handleShowCreateNewNoteNotification() {
    this.enterCreateNewNote();
  }

  handleShowNoteSectionNotification(username: string) {
    this.noteSectionUsername = username;
    this.noteSectionIsOwnAccount = username===this.authenticatedUsername;
    this.enterNoteSection();
  }

  enterNoteSection() {
    this.showNoteSection = true;
    this.showCreateNewNote = false;
    this.showMessagesOfAChat = false;
  }

  exitNoteSection() {
    this.showMessagesOfAChat = true;
    this.showNoteSection = false;
  }

  showMessagesOfConvo(messageRecipientInfo: Array<string>) {
      this.messageRecipientInfo = messageRecipientInfo;
      this.showMessagesOfAChat = true;
  }

  showMessageReactions(messageReactionsInfo: Array<Array<string>>) {
    this.showMessageReactionsPopup = true;
    this.messageReactionsInfo = messageReactionsInfo;
  }

  closeMessageReactionsPopup() {
    this.showMessageReactionsPopup = false;
    this.messageReactionsInfo = [];
  }

  
}

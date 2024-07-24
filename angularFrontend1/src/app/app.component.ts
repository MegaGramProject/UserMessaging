import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateNewNote } from '../components/createNewNote.component';
import { LeftSidebarComponent } from '../components/leftSidebar.component';
import { MessagesOfAChat } from '../components/messagesOfAChat.component';
import { NotesAndConvosSection } from '../components/notesAndConvosSection.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, CommonModule, NotesAndConvosSection,
  MessagesOfAChat, CreateNewNote],
  templateUrl: './app.component.html',
  styleUrl: '../styles.css'
})
export class AppComponent {
  title:string = 'Angular app';
  showMessagesOfAChat:boolean = true;
  showCreateNewNote:boolean = false;

  enterCreateNewNote() {
    this.showCreateNewNote = true;
    this.showMessagesOfAChat = false;
  }

  exitOutOfCreateNewNote() {
    this.showCreateNewNote = false;
    this.showMessagesOfAChat = true;
  }

  handleExitCreateNewNoteNotification(){
      this.exitOutOfCreateNewNote();
  }

  handleShowCreateNewNoteNotification() {
    this.enterCreateNewNote();
  }

  
}

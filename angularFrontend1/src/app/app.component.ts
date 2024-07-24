import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LeftSidebarComponent } from '../components/leftSidebar.component';
import { NotesAndConvosSection } from '../components/notesAndConvosSection.component';
import { MessagesOfAChat } from '../components/messagesOfAChat.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LeftSidebarComponent, CommonModule, NotesAndConvosSection,
  MessagesOfAChat],
  templateUrl: './app.component.html',
  styleUrl: '../styles.css'
})
export class AppComponent {
  title:string = 'Angular app';
}

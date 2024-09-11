import { Component } from '@angular/core';

@Component({
    selector: 'LeftSidebarPopup',
    standalone: true,
    templateUrl: '../templates/leftSidebarPopup.component.html',
    styleUrl: '../styles.css'
})
export class LeftSidebarPopupComponent {

    takeUserToLogin() {
        window.location.href = "http://localhost:8000/login";
    }

    async logoutUser() {
        const response = await fetch('http://localhost:8003/cookies/removeTokens', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'username': "rishavry"}),
            credentials: 'include'
        });
        if(!response.ok) {
            throw new Error('Network response was not ok');
        }
        const responseData = await response.text();
        if(responseData === "Successfully logged out") {
            window.location.href = 'http://localhost:8000/login';
        }
        else {
            console.log(responseData);
        }

    }

}
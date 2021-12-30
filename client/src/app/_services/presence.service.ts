import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
//import { ToastrService } from 'ngx-toastr';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection: HubConnection;
  private onlineUsersSource = new BehaviorSubject<string[]>([]);
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(public toastr: HotToastService, private router: Router) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + "presence", {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build()

    this.hubConnection
      .start()
      .catch(error => console.log(error));

    this.hubConnection.on("UserIsOnline", username => {
      console.log(username + " UserIsOnline");
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames, username]);
      })
    });

    this.hubConnection.on("UserIsOffline", username => {
      console.log(username + " UserIsOffline");
      this.onlineUsers$.pipe(take(1)).subscribe(usernames => {
        this.onlineUsersSource.next([...usernames.filter(x => x !== username)]);
      })
    });

    this.hubConnection.on("GetOnlineUsers", (usernames: string[]) => {
      this.onlineUsersSource.next([...usernames]);
      console.log("GetOnlineUsers");
    });

    this.hubConnection.on("NewMessageReceived", ({ username, knownAs }) => {
      console.log("NewMessageReceived");
      this.toastr.info(knownAs + ' has sent you a new message!', { autoClose: false })
        .afterClosed
        .pipe(take(1)).subscribe(() => {
          this.router.navigateByUrl('/members/' + username + '?tab=3');
        })

    });
  }

  stopHubConnection() {
    this.hubConnection.stop().catch(error => console.log(error));
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as englishStrings } from 'ngx-timeago/language-strings/hr';
import { NgForm } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm: NgForm;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Input() messages: Message[];
  @Input() username: string;
  messageContent: string;
  disableScrollDown = false;


  constructor(public messageService: MessageService, intl: TimeagoIntl) {
    intl.strings = englishStrings;
    intl.changes.next();
  }

  ngOnInit(): void {

  }

  sendMessage() {
    this.messageService.sendMessage(this.username, this.messageContent).then(() => {
      //this.messages.push(message);
      this.messageForm.reset();
    })
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private onScroll() {
    let element = this.myScrollContainer.nativeElement;
    let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight;
    if (this.disableScrollDown && atBottom) {
      this.disableScrollDown = false
    } else {
      this.disableScrollDown = true
    }
  }

  private scrollToBottom(): void {
    if (this.disableScrollDown) {
      return
    }
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }



}

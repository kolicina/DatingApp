import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from 'src/app/_models/member';
import { NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { NgxGalleryImage } from '@kolkov/ngx-gallery';
import { NgxGalleryAnimation } from '@kolkov/ngx-gallery';
import { TimeagoIntl } from 'ngx-timeago';
import { strings as englishStrings } from 'ngx-timeago/language-strings/hr';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';
import { MembersService } from 'src/app/_services/members.service';
//import { ToastrService } from 'ngx-toastr';
import { HotToastService } from '@ngneat/hot-toast';
import { PresenceService } from 'src/app/_services/presence.service';
import { AccountService } from 'src/app/_services/account.service';
import { User } from 'src/app/_models/user';
import { take } from 'rxjs/operators';
import { BusyService } from 'src/app/_services/busy.service';

@Component({
  selector: 'app-member-detail',
  templateUrl: './member-detail.component.html',
  styleUrls: ['./member-detail.component.css']
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', { static: true }) memberTabs: TabsetComponent;
  member: Member;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  activeTab: TabDirective;
  messages: Message[] = [];
  user: User;

  constructor(private route: ActivatedRoute, private memberService: MembersService,
    public messageService: MessageService,
    public presenceService: PresenceService,
    private accountService: AccountService,
    private toastr: HotToastService,
    private router: Router,
    private busyService: BusyService,
    intl: TimeagoIntl) {
    intl.strings = englishStrings;
    intl.changes.next();
    this.accountService.currentUser$.pipe(take(1)).subscribe(user => {
      this.user = user;
    });
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }


  ngOnInit(): void {
    this.route.data.subscribe(data => {
      this.member = data.member;
    });

    this.route.queryParams.subscribe(params => {
      this.busyService.busy();
      params.tab ? this.selectTab(params.tab) : this.selectTab(0);
    });

    this.galleryOptions = [
      {
        width: '400px',
        height: '500px',
        imagePercent: 100,
        thumbnailsColumns: 4,
        imageAnimation: NgxGalleryAnimation.Slide,
        preview: false
      }
    ];
    this.galleryImages = this.getImages();

  }

  // loadMember() {
  //   this.memberService.getMember(this.route.snapshot.paramMap.get('username'))
  //     .subscribe(member => {
  //       this.member = member;

  //     });
  // }
  getImages(): NgxGalleryImage[] {
    const imageUrls = [];
    for (const photo of this.member.photos) {
      imageUrls.push({
        small: photo?.url,
        medium: photo?.url,
        big: photo?.url
      })
    }
    return imageUrls;
  }

  selectTab(tabId: number) {
    this.memberTabs.tabs[tabId].active = true;
    this.busyService.idle();
  }

  ontabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages') {
      //this.loadMessages();
      this.messageService.createHubConnection(this.user, this.member.username);
      this.busyService.busy();
      setTimeout(() => this.selectTab(3), 200);

    }
    else {
      this.messageService.stopHubConnection();
    }
  }

  loadMessages() {
    this.messageService.getMessageThread(this.member.username).subscribe(resp => {
      this.messages = resp;
    })
  }

  addLike(member: Member) {
    this.memberService.addLike(member.username).subscribe(() => {
      this.toastr.success('You have liked ' + member.knownAs);
    })
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }
}

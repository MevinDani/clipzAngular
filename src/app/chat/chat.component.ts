import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { PostService } from '../post/post.service';
import { FormBuilder, Validators } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { NavigationEnd, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/internal/Subject';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('commentContainer', { static: false }) commentContainer: ElementRef | undefined;

  locUserId: any
  locUsername: any
  freinds: any = []
  freindsId: any = []
  freindProfPic: any = {}
  freindProfPicId: any = {}
  selectedUserDetails: any = {}
  conversationId: any
  chatUserId: any
  socket!: Socket;
  conversations: any = []
  isLoading!: boolean;
  chatUsersDetails: any = {}
  chatImgContView = true;

  selectedUser: any
  selectChatUserReloodToggle = false

  constructor(private ds: DataService, private ps: PostService, private fb: FormBuilder, private router: Router) { }
  ngOnDestroy(): void {
    this.selectedUser = null;
    // console.log(this.selectedUser);
    this.ps.setSelectedUser('')
  }

  ngOnInit(): void {
    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')
    this.chatImgContView = true
    // console.log(this.chatImgContView);


    this.ds.getUser(this.locUserId).subscribe((result: any) => {
      // console.log(result);
      this.locUsername = result.username

      this.freindProfPicId[this.locUserId] = result.profilePic

      const followers: [] = result.followersName
      const followings: [] = result.followingsName

      const followersId: [] = result.followers
      const followingsId: [] = result.followings
      // console.log(followersId, followingsId);
      this.freindsId = followersId.filter(element => followingsId.includes(element))
      this.freinds = followers.filter(element => followings.includes(element))
      // console.log(this.freinds, this.freindsId);

      this.freindsId.map((i: any) => {
        this.ds.getUser(i).subscribe((result: any) => {
          this.freindProfPicId[i] = result.profilePic
          // console.log(this.freindProfPicId);
        })
      })
      this.freinds.map((i: any) => {
        this.ds.getProfPic(i).subscribe((result: any) => {
          this.freindProfPic[i] = result
          // console.log(this.freindProfPic);
        })
      })
    })

    this.ps.getConversations(this.locUserId).subscribe((result: any) => {
      // console.log(result, "getconv");
    })


    // socket io
    this.socket = io('ws://localhost:8900');
    this.socket.on('getMessage', (data: any) => {
      // console.log(data);
      const newConv = {
        sender: data.senderId,
        message: data.message,
        _id: data.msgId,
        timestamp: data.timestamp
      }
      this.conversations.push(newConv)
      setTimeout(() => {
        this.scrollToBottom();
      });
    })
    this.socket.on('deletedMessage', (data: any) => {
      // console.log(this.conversations);
      // console.log(data);
      const msgId = data.messageId
      this.conversations = this.conversations.filter((i: any) => i._id !== msgId)
    })

    // Handle incoming messages
    this.socket.on('welcome', (data: any) => {
      // console.log('Received message:', data);
    });

    // adduserid
    this.socket.emit('addUser', this.locUserId)
    this.socket.on('getUsers', users => {
      // console.log(users, 'usersockid');
    })

    this.ps.getSelectedUser().subscribe(user => {
      if (user) {
        // console.log(user);
        this.selectedUser = user;
        // console.log(this.selectedUser, 's');
        this.selectChatUser(user)
      }

      // Handle the selected user in the chat component
    });

    // this.ps.getSelectedUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
    //   if (user) {
    //     console.log(user);
    //     this.selectedUser = user;
    //     this.selectChatUser(user);
    //   }
    //   // Handle the selected user in the chat component
    // });

  }

  private scrollToBottom() {
    if (this.commentContainer) {
      const containerElement = this.commentContainer.nativeElement;
      containerElement.scrollTop = containerElement.scrollHeight;
    }
  }

  selectChatUser(name: any) {
    this.chatImgContView = false
    // console.log(this.chatImgContView);

    this.chatUsersDetails[this.locUserId] = this.locUsername
    this.isLoading = true
    this.selectedUserDetails['name'] = name;
    // console.log(this.selectedUserDetails);

    // console.log(name);
    this.ds.getProfile(name).subscribe((result: any) => {
      this.chatUserId = result.other._id
      this.ps.setConversationId(this.locUserId, this.chatUserId).subscribe((result: any) => {
        // console.log(result);
        this.conversationId = result._id
        // console.log(this.conversationId, 'set or get');
        this.ps.getMessages(this.conversationId).subscribe((result: any) => {
          // console.log(result);
          this.conversations = result
          // console.log(this.conversations);
          this.conversations.map((i: any) => {
            this.ds.getUser(i.sender).subscribe((result: any) => {
              this.chatUsersDetails[result._id] = result.username
              // console.log(this.chatUsersDetails);
            })
          })
          setTimeout(() => {
            this.scrollToBottom();
          });
        })
      })
    })

    // this.ps.setConversationId(this.locUserId,)
    this.ps.getConversations(this.locUserId).subscribe((result: any) => {
      // console.log(result);
    })

    this.isLoading = false
  }

  messageForm = this.fb.group({
    message: ['', [Validators.required, Validators.minLength(1), Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
  })

  messageSubmit() {
    if (this.messageForm.valid) {

      const msgPath = this.messageForm.value

      this.ps.sendMessage(this.conversationId, this.locUserId, this.chatUserId, msgPath.message)
        .subscribe((result: any) => {
          // socket send
          this.socket.emit('sendMessage', {
            senderId: this.locUserId,
            receiverId: this.chatUserId,
            message: msgPath.message,
            msgId: result._id,
            timestamp: new Date(),
          })
          const newConv = {
            _id: result._id,
            sender: this.locUserId,
            message: msgPath.message,
            timestamp: new Date(),
          }
          this.conversations.push(newConv)

          setTimeout(() => {
            this.scrollToBottom();
          });
        })

      this.messageForm.reset()
    }

  }

  deleteConv(messageId: any, senderId: any) {
    // console.log(this.conversations);

    this.ps.deleteMessage(messageId, senderId)
    // console.log(this.chatUserId, messageId, senderId);

    this.conversations = this.conversations.filter((i: any) => i._id !== messageId)
    // console.log('socket dels');

    // socket msg delete
    this.socket.emit('deleteMessage', {
      messageId,
      senderId,
      receiverId: this.chatUserId
    })
  }

  getTimeElapsed(createdAt: string): string {
    const commentDate = new Date(createdAt);
    const now = new Date();
    const diff = Math.floor((now.getTime() - commentDate.getTime()) / 1000);  // Calculate the time difference in seconds

    if (diff < 60) {
      return `${diff} seconds ago`;
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} minutes ago`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} hours ago`;
    } else {
      const days = Math.floor(diff / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  }

}

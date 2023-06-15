import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { PostService } from '../post/post.service';
import { FormBuilder, Validators } from '@angular/forms';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('commentContainer', { static: false }) commentContainer: ElementRef | undefined;

  locUserId: any
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

  constructor(private ds: DataService, private ps: PostService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.locUserId = JSON.parse(localStorage.getItem('uid') || '')

    this.ds.getUser(this.locUserId).subscribe((result: any) => {
      // console.log(result);

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
        message: data.message
      }
      this.conversations.push(newConv)
      setTimeout(() => {
        this.scrollToBottom();
      });
    })
    this.socket.on('deletedMessage', (data: any) => {
      const msgId = data.messageId
      this.conversations = this.conversations.filter((i: any) => i._id !== msgId)
    })

    // Connect to the server
    // this.socket.on('connect', () => {
    //   console.log('Connected to the server');
    // });

    // Handle incoming messages
    this.socket.on('welcome', (data: any) => {
      // console.log('Received message:', data);
    });

    // adduserid
    this.socket.emit('addUser', this.locUserId)
    this.socket.on('getUsers', users => {
      // console.log(users, 'usersockid');
    })

  }

  private scrollToBottom() {
    if (this.commentContainer) {
      const containerElement = this.commentContainer.nativeElement;
      containerElement.scrollTop = containerElement.scrollHeight;
    }
  }

  selectChatUser(name: any) {
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
    message: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
  })

  messageSubmit() {
    if (this.messageForm.valid) {

      const msgPath = this.messageForm.value
      // console.log(this.messageForm.value);
      // console.log(this.locUserId, this.chatUserId);

      // socket send
      this.socket.emit('sendMessage', {
        senderId: this.locUserId,
        receiverId: this.chatUserId,
        message: msgPath.message
      })

      this.ps.sendMessage(this.conversationId, this.locUserId, this.chatUserId, msgPath.message)
        .subscribe((result: any) => {
          console.log(result);
          const newConv = {
            _id: result._id,
            sender: this.locUserId,
            message: msgPath.message
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
    this.ps.deleteMessage(messageId, senderId)
    // console.log(this.chatUserId, messageId, senderId);

    this.conversations = this.conversations.filter((i: any) => i._id !== messageId)
    // socket msg delete
    this.socket.emit('deleteMessage', {
      messageId,
      senderId,
      receiverId: this.chatUserId
    })
  }


}

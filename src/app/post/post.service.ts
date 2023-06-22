import { Injectable, OnInit } from "@angular/core";
import { Post } from "./post.model";
import { BehaviorSubject, Observable, Subject, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


// global header for overload
const options = {
    headers: new HttpHeaders()
}

@Injectable({ providedIn: 'root' })
export class PostService implements OnInit {
    private profPicSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

    setToken(profPic: string | null): void {
        this.profPicSubject.next(profPic);
    }

    getToken(): Observable<string | null> {
        return this.profPicSubject.asObservable();
    }

    private headerNameSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    setHName(profPic: string | null): void {
        this.headerNameSubject.next(profPic);
    }

    getHName(): Observable<string | null> {
        return this.headerNameSubject.asObservable();
    }

    private posts: Post[] = []
    private postUpdated = new Subject<Post[]>()
    logUserId: any
    backUrl = 'https://piczback.onrender.com/api'


    constructor(private http: HttpClient, private router: Router, private toastr: ToastrService) { }

    ngOnInit(): void {
        this.logUserId = JSON.parse(localStorage.getItem("uid") || "")
    }

    // token header
    tokenHead() {
        // fk header creation
        const headers = new HttpHeaders()
        const token = JSON.parse(localStorage.getItem("token") || "")
        if (token) {
            options.headers = headers.append('access_token', token)
        } else {
            alert('Unauthenticated User')
        }
        return options
    }

    getUserId() {
        return localStorage.getItem('uid')
    }

    getPosts() {
        this.http.get<{ message: string, posts: any }>(this.backUrl + '/posts')
            .pipe(map((postData) => {
                // console.log(postData, 'backurl');
                return postData.posts.map((post: any) => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath,
                        creator: post.creator,
                        name: post.name,
                        likes: post.likes,
                        lastUpdated: post.lastUpdated
                    }
                })
            }))
            .subscribe((transformedPosts) => {
                this.posts = transformedPosts
                this.postUpdated.next([...this.posts])
            })
    }

    getUpdatedPostListener() {
        return this.postUpdated.asObservable()
    }

    getPostEdit(id: string) {
        return this.http.get<{
            [x: string]: any; imagePath: any; _id: string, title: string, content: string, creator: string
        }>(this.backUrl + '/posts/' + id)
    }

    addPost(title: any, content: any, image: any) {
        // const post: Post = {id:null,title:title,content:content}
        const postData = new FormData()
        postData.append('title', title)
        postData.append('content', content)
        postData.append('image', image, title)
        this.http.post<{ message: string, post: Post }>(this.backUrl + '/posts', postData, this.tokenHead())
            .subscribe((responseData) => {
                // console.log(responseData);
                const post: Post = {
                    id: responseData.post.id,
                    title: responseData.post.title,
                    content: responseData.post.content,
                    imagePath: responseData.post.imagePath,
                    creator: responseData.post.creator,
                    name: responseData.post.name,
                    likes: undefined,
                    lastUpdated: undefined
                }
                // console.log(post);
                this.posts.push(post)
                // console.log(this.posts);
                this.postUpdated.next([...this.posts])
                this.toastr.success('Post added successfully!')
                this.router.navigateByUrl('')
            })
    }

    updatePost(id: any, title: any, content: any, image: any) {
        let postData: any
        if (typeof image === 'object') {
            postData = new FormData()
            postData.append('id', id)
            postData.append('title', title)
            postData.append('content', content)
            postData.append('image', image, title)
            // console.log(postData);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image
            }
        }
        this.http.put(this.backUrl + '/posts/' + id, postData, this.tokenHead())
            .subscribe(response => {
                // console.log(response);

                this.toastr.success('Post updated Successfully!')
                this.router.navigateByUrl('')
            })
    }

    editProfile(id: any, username: any, about: any, image: any) {
        let postData: any
        if (typeof image == 'object') {
            postData = new FormData()
            postData.append('id', id)
            postData.append('username', username)
            postData.append('about', about)
            postData.append('image', image)
            // console.log(postData);
        } else {
            postData = {
                id: id,
                username: username,
                about: about,
                image: image
            }
            // console.log(postData);
        }
        this.http.put(this.backUrl + '/users/profile/edit/', postData)
            .subscribe((result: any) => {
                // console.log(result);
                if (result.message == 'Profile Edited Successfully') {
                    this.toastr.success('Profile Edited Successfully!')
                    this.setToken(result.data.profilePic)
                    this.setHName(result.data.username)
                    this.router.navigateByUrl('/profile/user/' + id + '/' + username)
                } else {
                    this.toastr.error(result.message)
                }
            })
    }



    deletePost(postId: string) {
        this.http.delete(this.backUrl + '/posts/' + postId, this.tokenHead())
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id !== postId)
                this.posts = updatedPosts
                this.postUpdated.next([...this.posts])
                this.toastr.warning('Post deleted successfully!')
            })
    }

    apifollowUser(id: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        this.http.put(this.backUrl + '/users/follow/' + id, body).subscribe((result: any) => {
            if (result.message == 'User has been followed') {
                this.toastr.success('User has been followed')
            } else {
                this.toastr.error(result.message)
            }
        })
    }

    apiunfollowUser(id: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        this.http.put(this.backUrl + '/users/unfollow/' + id, body).subscribe((result: any) => {
            if (result.message == 'User has been unfollowed') {
                this.toastr.warning('Unfollowed the User')
            } else {
                this.toastr.error(result.message)
                // console.log(result);

            }
        })
    }

    getFollowersList(id: any) {
        return this.http.get(this.backUrl + '/users/followersList/' + id)
    }

    likePost(postId: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        return this.http.put(this.backUrl + '/posts/post/like/' + postId, body).subscribe((result: any) => {
            // console.log(result);
        })
    }

    dislikePost(postId: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        return this.http.put(this.backUrl + '/posts/post/dislike/' + postId, body).subscribe((result: any) => {
            // console.log(result);
        })
    }

    getLikedPosts(id: any) {
        return this.http.get(this.backUrl + '/posts/likedPosts/' + id)
    }

    getFollowingsPost(id: any) {
        return this.http.get(this.backUrl + '/posts/followersPost/' + id)
    }

    addComment(id: any, content: any, userId: any, name: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            content,
            userId,
            name
        }

        return this.http.post(this.backUrl + '/posts/' + id + '/comments', body)
    }

    getComments(id: any) {
        return this.http.get(this.backUrl + '/posts/' + id + '/comments')
    }

    getLatestComments(id: any) {
        return this.http.get(this.backUrl + '/posts/' + id + '/comments/latest')
    }

    commentDelete(postId: any, cmntId: any) {
        this.http.delete(this.backUrl + '/posts/' + postId + '/comments/' + cmntId)
            .subscribe((result: any) => {
                if (result.message == 'Comment deleted successfully.') {
                    this.toastr.warning('Comment deleted successfully.')
                } else {
                    this.toastr.error(result.message)
                    // console.log(result);
                }
            })
    }

    getConversations(userId: any) {
        return this.http.get(this.backUrl + '/conversations/' + userId)
    }

    getMessages(conversationId: any) {
        return this.http.get(this.backUrl + '/messages/' + conversationId)
    }

    setConversationId(senderId: any, receiverId: any) {
        const body = {
            senderId, receiverId
        }
        return this.http.post(this.backUrl + '/conversations/', body)
    }

    sendMessage(conversationId: any, sender: any, receiver: any, message: any) {
        const body = {
            conversationId,
            sender,
            receiver,
            message
        }
        return this.http.post(this.backUrl + '/messages/', body)
    }

    deleteMessage(messageId: any, senderId: any) {
        return this.http.delete(this.backUrl + '/messages/' + messageId + '/' + senderId)
            .subscribe((result: any) => {
                if (result.message == 'Message deleted successfully') {
                    this.toastr.warning('Message deleted successfully')
                } else {
                    this.toastr.error(result.message)
                    // console.log(result);
                }
            })
    }

    getFreindsPost(id: any) {
        return this.http.get(this.backUrl + '/posts/freindspost/' + id)
    }

    getPostsId(id: any) {
        return this.http.get(this.backUrl + '/posts/profile/' + id)
    }


    // chat live user select
    private selectedUserSubject = new BehaviorSubject<string>('');

    // setSelectedUser(user: string): void {
    //     this.selectedUserSubject.next(user);
    // }

    setSelectedUser(user: string): void {
        if (user) {
            this.selectedUserSubject.next(user);
        } else {
            this.selectedUserSubject.next('');
        }
    }

    getSelectedUser(): Observable<string> {
        return this.selectedUserSubject.asObservable();
    }

}
import { Injectable, OnInit } from "@angular/core";
import { Post } from "./post.model";
import { Subject, map } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';


// global header for overload
const options = {
    headers: new HttpHeaders()
}

@Injectable({ providedIn: 'root' })
export class PostService implements OnInit {
    private posts: Post[] = []
    private postUpdated = new Subject<Post[]>()
    logUserId: any

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
        this.http.get<{ message: string, posts: any }>('http://localhost:2000/api/posts')
            .pipe(map((postData) => {
                return postData.posts.map((post: any) => {
                    return {
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath,
                        creator: post.creator,
                        name: post.name,
                        likes: post.likes
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
        }>('http://localhost:2000/api/posts/' + id)
    }

    addPost(title: any, content: any, image: any) {
        // const post: Post = {id:null,title:title,content:content}
        const postData = new FormData()
        postData.append('title', title)
        postData.append('content', content)
        postData.append('image', image, title)
        this.http.post<{ message: string, post: Post }>('http://localhost:2000/api/posts', postData, this.tokenHead())
            .subscribe((responseData) => {
                // console.log(responseData);
                const post: Post = {
                    id: responseData.post.id,
                    title: responseData.post.title,
                    content: responseData.post.content,
                    imagePath: responseData.post.imagePath,
                    creator: responseData.post.creator,
                    name: responseData.post.name,
                    likes: undefined
                }
                // console.log(post);           
                this.posts.push(post)
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
            console.log(postData);
        } else {
            postData = {
                id: id,
                title: title,
                content: content,
                imagePath: image
            }
        }
        this.http.put('http://localhost:2000/api/posts/' + id, postData, this.tokenHead())
            .subscribe(response => {
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
            console.log(postData);
        } else {
            postData = {
                id: id,
                username: username,
                about: about,
                image: image
            }
            // console.log(postData);
        }
        this.http.put('http://localhost:2000/api/users/profile/edit/', postData)
            .subscribe((result: any) => {
                // console.log(result);
                if (result.message == 'Profile Edited Successfully') {
                    this.toastr.success('Profile Edited Successfully!')
                    this.router.navigateByUrl('/profile/user/' + id + '/' + username)
                } else {
                    this.toastr.error(result.message)
                }
            })
    }



    deletePost(postId: string) {
        this.http.delete('http://localhost:2000/api/posts/' + postId, this.tokenHead())
            .subscribe(() => {
                const updatedPosts = this.posts.filter(post => post.id !== postId)
                this.posts = updatedPosts
                this.postUpdated.next([...this.posts])
                this.toastr.info('Post deleted successfully!')
            })
    }

    apifollowUser(id: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        this.http.put('http://localhost:2000/api/users/follow/' + id, body).subscribe((result: any) => {
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
        this.http.put('http://localhost:2000/api/users/unfollow/' + id, body).subscribe((result: any) => {
            if (result.message == 'User has been unfollowed') {
                this.toastr.warning('Unfollowed the User')
            } else {
                this.toastr.error(result.message)
                console.log(result);

            }
        })
    }

    getFollowersList(id: any) {
        return this.http.get('http://localhost:2000/api/users/followersList/' + id)
    }

    likePost(postId: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        return this.http.put('http://localhost:2000/api/posts/post/like/' + postId, body).subscribe((result: any) => {
            // console.log(result);
        })
    }

    dislikePost(postId: any) {
        const logUserId = JSON.parse(localStorage.getItem("uid") || "")
        const body = {
            id: logUserId
        }
        return this.http.put('http://localhost:2000/api/posts/post/dislike/' + postId, body).subscribe((result: any) => {
            // console.log(result);
        })
    }

    getLikedPosts(id: any) {
        return this.http.get('http://localhost:2000/api/posts/likedPosts/' + id)
    }

}
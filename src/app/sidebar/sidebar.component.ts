import { Component, DoCheck, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileComponent } from '../profile/profile.component';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, DoCheck, OnDestroy {

  locUserId: any
  locUname: any

  followers: any = []
  followings: any = []

  userId: any
  userName: any

  sideFollowers: any = []
  sideFollowings: any = []

  sideFollowSub!: Subscription
  sideFollowingSub!: Subscription

  routeId: any
  routeName: any

  freindsId: any = []
  freindsName: any = []
  freindsDetails: any = []
  freindsPics: any = {}
  followerPics: any = {}
  followingsPics: any = {}

  followersName: any = []
  followingsName: any = []

  // @Input() followNum:any
  // @Input() unfollowNum:any
  @Input() statChng: any

  followStatus!: boolean;
  subscription: Subscription;

  constructor(private ds: DataService, private route: ActivatedRoute, private router: Router, private parentComponent: ProfileComponent) {
    this.subscription = this.parentComponent.followStatusChange.subscribe((status: boolean) => {
      this.followStatus = status;
      // console.log('Follow Status Changed:', this.followStatus);
      // Perform any other actions or logic based on the follow status
    });
  }

  ngDoCheck(): void {
    // console.log(this.followStatus);

    if ((this.followStatus == true) && (!this.followers.includes(this.locUname))) {
      this.followers.push(this.locUname)
      // console.log(this.followers,"inloop if");
      // this.followNum = ''
      // console.log(this.statChng,"followempty");

    }
    if ((this.followStatus == false) && (this.followers.includes(this.locUname))) {
      this.followers = this.followers.filter((fid: any) => fid !== this.locUname)
      // console.log(this.followers);
      // console.log(this.followers,"inloop else");
      // this.unfollowNum = ''
      // console.log(!this.statChng,"unflempty");

    }
  }


  ngOnInit(): void {

    // this.route.params.subscribe((params:any) => {
    //   this.userName = params['name']

    // })

    this.userId = this.route.snapshot.params['id']
    // this.userName = this.route.snapshot.params['name']

    if (localStorage.getItem('uid')) {
      this.locUserId = JSON.parse(localStorage.getItem('uid') || '')
    }

    // get logUserName
    this.ds.getUser(this.locUserId).subscribe((result: any) => {
      // console.log(result);
      this.locUname = result.username
      const followersId: [] = result.followers
      const followingsId: [] = result.followings
      this.followersName = result.followersName
      this.followingsName = result.followingsName
      this.freindsId = followersId.filter(element => followingsId.includes(element))
      this.freindsName = this.followersName.filter((element: any) => this.followingsName.includes(element))
      // console.log(this.freindsName);
      this.freindsId.map((i: any) => {
        this.ds.getUser(i).subscribe((result: any) => {
          // console.log(result);
          this.freindsPics[result.username] = result.profilePic
          // console.log(this.freindsDetails);
          // console.log(this.freindsPics);
        })
      })
      // this.freindsName.map((i: any) => {
      //   this.ds.getProfPic(i).subscribe((result: any) => {
      //     this.freindProfPic[i] = result
      //     console.log(this.freindProfPic);
      //   })
      // })
    })

    this.ds.getUser(this.userId).subscribe((result: any) => {
      // console.log(result);
      this.followers = result.followersName
      this.followings = result.followingsName

      this.followers.map((i: any) => {
        this.ds.getProfPic(i).subscribe((result: any) => {
          this.followerPics[i] = result
        })
      })

      this.followings.map((i: any) => {
        this.ds.getProfPic(i).subscribe((result: any) => {
          this.followingsPics[i] = result
        })
      })
      // console.log(this.followers,"ngonit");
    })

    // observables for getting followers/ings
    this.ds.getSideFs(this.userId)
    this.sideFollowSub = this.ds.getUpdatedSideFollowArrListener()
      .subscribe((result: any) => {
        // console.log(result,"followers");
      })
    this.sideFollowingSub = this.ds.getUpdatedSideFollowinArrListener()
      .subscribe((result: any) => {
        // console.log(result,"followings");
      })
  }

  userProf(name: any) {
    // console.log(name);
    this.ds.getProfile(name).subscribe((result: any) => {
      // console.log(result);
      this.routeId = result.other._id
      this.routeName = result.other.username
      //  console.log(this.routeId);
      //  console.log(this.routeName);

      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigateByUrl('/profile/user/' + this.routeId + '/' + this.routeName);
      });
    })
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

}

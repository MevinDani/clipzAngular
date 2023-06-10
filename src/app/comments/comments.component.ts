import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent {
  constructor(private fb: FormBuilder) { }

  commentForm = this.fb.group({
    comment: ['', [Validators.required, Validators.minLength(4), Validators.pattern(/^[\w\s!@#$%^&*()\-+=\[\]{}|\\:;"'<>,.?/]*$/)]],
  })

  commFormSubmit() {
    if (this.commentForm.invalid) {
      console.log('form invalid');
      return
    }
    const commPath = this.commentForm.value
    console.log(commPath);
  }
}

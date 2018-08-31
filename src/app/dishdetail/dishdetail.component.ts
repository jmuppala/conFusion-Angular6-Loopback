import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { visibility, flyInOut, expand } from '../animations/app.animation';
import { LoopBackConfig } from '../shared/sdk';
import { API_VERSION } from '../shared/baseUrl';
import { Dishes } from '../shared/sdk/models';
import { DishesApi } from '../shared/sdk/services';
import { Comments } from '../shared/sdk/models';
import { CommentsApi } from '../shared/sdk/services';
import { Favorite } from '../shared/sdk/models';
import { FavoriteApi } from '../shared/sdk/services';
import { Customer } from '../shared/sdk/models';
import { CustomerApi } from '../shared/sdk/services';

import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ]
})
export class DishdetailComponent implements OnInit {

  @ViewChild('cform') commentFormDirective;
  dish: Dishes;
  comment: Comments;
  errMess: string;
  visibility = 'shown';
  favorite = false;

  formErrors = {
    'comment': ''
  };

  validationMessages = {
    'comment': {
      'required':      'Comment is required.'
    }
  };

  commentForm: FormGroup;

  constructor(private dishservice: DishesApi,
    private favoriteService: FavoriteApi,
    private commentService: CommentsApi,
    private authService: CustomerApi,
    @Inject('baseURL') private baseURL,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
      LoopBackConfig.setBaseURL(baseURL);
      LoopBackConfig.setApiVersion(API_VERSION);
    }

  ngOnInit() {
    this.createForm();

    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishservice.findById(params['id']); }))
    .subscribe(dish => {
      this.dish = dish;
      this.dishservice.getComments(this.dish.id, {'include': ['customer']})
      .subscribe((comments: Comments[]) =>  { this.dish.comments = comments; });
      this.visibility = 'shown';
      if (this.authService.getCachedCurrent()) {
        this.authService.getFavorites(this.authService.getCachedCurrent().id, {'where': {'dishesId': this.dish.id}})
        .subscribe(res => { (res.length === 0) ? this.favorite = false : this.favorite = true; });
      }
   },
    errmess => this.errMess = <any>errmess);
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      rating: 5,
      comment: ['', Validators.required]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    if (this.authService.getCachedCurrent()) {
      this.commentService.create({
        rating: this.comment.rating,
        comment: this.comment.comment,
        dishesId: this.dish.id,
        customerId: this.authService.getCachedCurrent().id
      })
      .subscribe(res => { console.log(res);
        this.dishservice.getComments(this.dish.id, {'include': ['customer']})
        .subscribe((comments: Comments[]) =>  { this.dish.comments = comments; });
      });
    }
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      rating: 5,
      comment: ''
    });
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  addToFavorites() {
    if (!this.favorite) {
      if (!this.favorite && this.authService.getCachedCurrent()) {
        this.favoriteService.create({customerId: this.authService.getCachedCurrent().id, dishesId: this.dish.id })
        .subscribe(favorites => { console.log(favorites); this.favorite = true; });
      }
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-inhouse-tracker-topscore',
  templateUrl: './inhouse-tracker-topscore.component.html',
  styleUrls: ['./inhouse-tracker-topscore.component.scss'],
})
export class InhouseTrackerTopscoreComponent {

  @Input() match!: any;

  constructor() {
  }

}

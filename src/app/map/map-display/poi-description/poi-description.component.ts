import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-poi-description',
  templateUrl: './poi-description.component.html',
  styleUrls: ['./poi-description.component.scss'],
})
export class PoiDescriptionComponent implements OnInit {

  @Input() pointDetail: any = null
  @Input() step: any = null
  @Output() navigate = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { }

  ngOnChanges() {
    console.log(this.pointDetail)

  }

  onNavigate() {
    this.navigate.emit()
  }
}

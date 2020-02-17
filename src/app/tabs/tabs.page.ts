import { Component } from '@angular/core';
import { PathService } from '../shared/services/path.service';
import { PreferitiService } from '../shared/services/preferiti.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(
    public router: Router,
    public preferitiService: PreferitiService) { }
  goToPreferiti() {
    this.preferitiService.setPeriti(null)
    this.router.navigate(["/tabs/path"]);
  }
}
